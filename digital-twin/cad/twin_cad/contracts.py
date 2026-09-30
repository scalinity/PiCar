"""M4 fixture-only contracts and strict source parsing (not task orchestration)."""
import hashlib
import json
import math
from pathlib import Path

import numpy as np
import rfc8785
from scipy.spatial.transform import Rotation

R = np.array([[0., 1., 0.], [0., 0., 1.], [1., 0., 0.]])
POSITION_BUDGET_MM = 0.01
ANGLE_BUDGET_RAD = 0.0001
SURFACE_BUDGET_MM = 0.02
CONTEXT_BUDGET_MM = 0.10


class Invalid(ValueError):
    pass


class Blocked(ValueError):
    pass


def load(path):
    def pairs(items):
        result = {}
        for key, value in items:
            if key in result:
                raise Invalid("DUPLICATE_KEY")
            result[key] = value
        return result

    def number(text):
        value = float(text) if any(c in text for c in ".eE") else int(text)
        if not math.isfinite(value) or (value == 0 and text.startswith("-")):
            raise Invalid("NONFINITE_OR_NEGATIVE_ZERO")
        return value

    result = json.loads(Path(path).read_text(), object_pairs_hook=pairs,
                        parse_int=number, parse_float=number,
                        parse_constant=lambda _: (_ for _ in ()).throw(Invalid("NONFINITE")))
    # JCS also rejects non-interoperable numbers and lone surrogates.
    rfc8785.dumps(result)
    return result


def normalize(value):
    """Only computed output is rounded; authored inputs are never silently rounded."""
    if isinstance(value, dict):
        return {k: normalize(v) for k, v in value.items()}
    if isinstance(value, (list, tuple, np.ndarray)):
        return [normalize(v) for v in value]
    if isinstance(value, (float, np.floating)):
        if not math.isfinite(value):
            raise Invalid("NONFINITE_OUTPUT")
        v = round(float(value), 10)
        return 0 if v == 0 else v
    if isinstance(value, np.integer):
        return int(value)
    return value


def write(path, value):
    Path(path).write_bytes(rfc8785.dumps(normalize(value)) + b"\n")


def digest(value, kind="m4-fixture-witness"):
    return hashlib.sha256(("picar-v2:"+kind+"\n").encode()+rfc8785.dumps(normalize(value))).hexdigest()


def input_digest(value):
    return hashlib.sha256(b"picar-v2:m4-fixture-input\n"+rfc8785.dumps(value)).hexdigest()


def frame(value):
    if value.get("state") == "unresolved":
        raise Blocked("UNRESOLVED_FRAME")
    if set(value) != {"translationMm", "quaternionXYZW"}:
        raise Invalid("FRAME_FIELDS")
    t, q = np.asarray(value["translationMm"], dtype=np.float64), np.asarray(value["quaternionXYZW"], dtype=np.float64)
    if t.shape != (3,) or q.shape != (4,) or not np.isfinite(t).all() or not np.isfinite(q).all():
        raise Invalid("FRAME_NUMBERS")
    if abs(np.linalg.norm(q) - 1) > 1e-12:
        raise Invalid("QUATERNION_NOT_NORMALIZED")
    result = np.eye(4)
    result[:3, :3] = Rotation.from_quat(q).as_matrix()
    result[:3, 3] = t
    return result


def pose(matrix):
    q = Rotation.from_matrix(matrix[:3, :3]).as_quat()
    if q[3] < 0:
        q = -q
    return {"translationMm": matrix[:3, 3].tolist(), "quaternionXYZW": q.tolist()}


def runtime_pose(matrix):
    if matrix.shape != (4, 4) or not np.isfinite(matrix).all() or not np.allclose(matrix[3], [0, 0, 0, 1], atol=1e-12, rtol=0):
        raise Invalid("RIGID_POSE_REQUIRED")
    q = matrix[:3, :3]
    if abs(np.linalg.det(q)-1) > 1e-12 or not np.allclose(q.T @ q, np.eye(3), atol=1e-12, rtol=0):
        raise Invalid("REFLECTION_SCALE_OR_SHEAR")
    out = np.eye(4)
    out[:3, :3] = R @ matrix[:3, :3] @ R.T
    out[:3, 3] = 0.001 * R @ matrix[:3, 3]
    p = pose(out)
    return {"translationM": p["translationMm"], "quaternionXYZW": p["quaternionXYZW"],
            "unit": "m", "basis": "RH-YUP-ZFORWARD"}


def check_source(source):
    if source.get("scope") != "TEST-ONLY" or source.get("unit") != "mm" or source.get("basis") != "RH-XFORWARD-YLEFT-ZUP":
        raise Invalid("FIXTURE_SCOPE_UNITS_BASIS")
    for collection in ("definitions", "instances", "assemblies"):
        items = source[collection]
        if not items or len({v["id"] for v in items}) != len(items):
            raise Invalid("EMPTY_OR_DUPLICATE_IDS")
        if any(not v["id"].startswith("TEST-") for v in items):
            raise Invalid("PRODUCTION_ID_IN_FIXTURE")
    for definition in source["definitions"]:
        if definition["dimensionScope"] != "SYNTHETIC_AUTHORED_NOT_MEASURED":
            raise Invalid("SYNTHETIC_SCOPE")
        dims = definition["parameters"]
        if set(dims) != {"length", "width", "height", "holeX", "holeY", "holeLength", "holeWidth"}:
            raise Invalid("PARAMETER_FIELDS")
        for value in dims.values():
            if isinstance(value, dict):
                if value.get("state") == "unresolved" and "value" not in value:
                    raise Blocked("UNRESOLVED_NUMERIC_INPUT")
                raise Invalid("NUMERIC_UNION")
            if isinstance(value, bool) or not isinstance(value, (float, int)) or not math.isfinite(value):
                raise Invalid("NUMERIC_INPUT")
        l, w, h, x, y, a, b = (dims[k] for k in ("length", "width", "height", "holeX", "holeY", "holeLength", "holeWidth"))
        if not (l > 0 and w > 0 and h > 0 and a > 0 and b > 0 and 0 < x < x+a < l and 0 < y < y+b < w):
            raise Invalid("INVALID_DIMENSIONS")
    definition_ids = {d["id"] for d in source["definitions"]}
    instance_ids = {i["id"] for i in source["instances"]}
    for instance in source["instances"]:
        if instance["definitionId"] not in definition_ids:
            raise Invalid("UNKNOWN_DEFINITION")
    for assembly in source["assemblies"]:
        frame(assembly["anchorPose"])
        if type(assembly["expectedDOF"]) is not int or assembly["expectedDOF"] < 0:
            raise Invalid("EXPECTED_DOF")
        if not assembly["constraints"] or len({c["id"] for c in assembly["constraints"]}) != len(assembly["constraints"]):
            raise Invalid("EMPTY_OR_DUPLICATE_CONSTRAINT")
        if not set(assembly["instanceIds"]) <= instance_ids or assembly["anchor"] not in assembly["instanceIds"]:
            raise Invalid("INSTANCE_CLOSURE")
        for c in assembly["constraints"]:
            if c["kind"] not in ("fixed", "revolute") or c["a"] not in assembly["instanceIds"] or c["b"] not in assembly["instanceIds"] or c["a"] == c["b"]:
                raise Invalid("CONSTRAINT_CLOSURE")
            frame(c["frameA"])
            frame(c["frameB"])
            if c["kind"] == "revolute" and (not isinstance(c.get("referenceRad"), (float, int)) or not math.isfinite(c["referenceRad"]) or not -math.pi < c["referenceRad"] < math.pi):
                raise Invalid("REVOLUTE_REFERENCE_RANGE")
