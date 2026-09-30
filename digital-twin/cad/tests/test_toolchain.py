"""Actual install/solid/constraint tests on authored TEST-only fixtures."""
from copy import deepcopy
import json
from pathlib import Path
import subprocess
import sys

import numpy as np
import pytest

from twin_cad.__main__ import build
from twin_cad.contracts import Blocked, Invalid, check_source, load, frame, runtime_pose
from twin_cad.solver import solve
from twin_cad.verification import constraint_witness, verify

TWIN = Path(__file__).resolve().parents[2]
SOURCE = TWIN / "validation/fixtures/m4/TEST-M4.json"


@pytest.fixture
def source():
    return load(SOURCE)


@pytest.mark.parametrize("index", [0, 1, 2])
def test_physical_dof_and_independent_residuals(source, index):
    a = source["assemblies"][index]
    result = solve(a)
    witness = constraint_witness(a, result)
    assert witness["status"] == "PASS"
    assert witness["independentDOF"] == a["expectedDOF"]
    assert max(e["positionMm"] for e in witness["residuals"]) < 1e-8
    assert max(e["angleRad"] for e in witness["residuals"]) < 1e-8


@pytest.mark.parametrize("index", [0, 1, 2])
@pytest.mark.parametrize("seed", [1, 19, 74])
def test_reordered_constraints_and_perturbed_starts(source, index, seed):
    a = source["assemblies"][index]
    original = solve(a)
    a["instanceIds"].reverse()
    a["constraints"].reverse()
    perturbed = solve(a, seed)
    constraint_witness(a, perturbed)
    for p, q in zip(original["poses"], perturbed["poses"]):
        assert p["instanceId"] == q["instanceId"]
        assert np.max(np.abs(np.array(p["cad"]["translationMm"])-np.array(q["cad"]["translationMm"]))) < 1e-8
        assert np.max(np.abs(np.array(p["cad"]["quaternionXYZW"])-np.array(q["cad"]["quaternionXYZW"]))) < 1e-8


def test_inconsistent_closed_loop_rejects(source):
    a = source["assemblies"][2]
    a["constraints"][2]["frameB"]["translationMm"][0] += 1
    with pytest.raises(Invalid, match="INCONSISTENT_OR_OVERCONSTRAINED"):
        solve(a)


def test_underconstraint_rejects_expected_fixed(source):
    a = source["assemblies"][0]
    a["constraints"][0].update(kind="revolute", referenceRad=0)
    with pytest.raises(Invalid, match="UNINTENDED_DOF"):
        solve(a)


def test_extra_contradictory_constraint_rejects(source):
    a = source["assemblies"][0]
    extra = deepcopy(a["constraints"][0])
    extra["id"] = "TEST-CONTRADICTION"
    extra["frameA"]["translationMm"][2] += 2
    a["constraints"].append(extra)
    with pytest.raises(Invalid, match="INCONSISTENT_OR_OVERCONSTRAINED"):
        solve(a)


def test_independent_oracle_rejects_mirrored_axis_solution(source):
    a = source["assemblies"][1]
    result = solve(a)
    result["poses"][1]["cad"]["quaternionXYZW"] = [1, 0, 0, 0]
    with pytest.raises(Invalid):
        constraint_witness(a, result)


@pytest.mark.parametrize("change", ["unknown", "zero", "nan", "production", "units", "duplicate", "quaternion"])
def test_source_firewalls(source, change):
    if change == "unknown":
        source["definitions"][0]["parameters"]["length"] = {"state": "unresolved", "unit": "mm", "confidence": "UNRESOLVED", "blockerIds": ["TEST-MISSING"]}
        with pytest.raises(Blocked):
            check_source(source)
        return
    if change == "zero":
        source["definitions"][0]["parameters"]["height"] = 0
    elif change == "nan":
        source["definitions"][0]["parameters"]["height"] = float("nan")
    elif change == "production":
        source["definitions"][0]["id"] = "PX-V40-DEF-PLATE-A"
    elif change == "units":
        source["unit"] = "m"
    elif change == "duplicate":
        source["instances"].append(source["instances"][0])
    elif change == "quaternion":
        source["assemblies"][0]["constraints"][0]["frameA"]["quaternionXYZW"] = [0, 0, 0, 2]
    with pytest.raises(Invalid):
        check_source(source)


def test_solids_features_complete_surface_and_export(source, tmp_path):
    build(source, tmp_path)
    result = verify(source, tmp_path)
    assert len(result["shapes"]) == 3
    assert len(result["constraints"]) == 3
    for shape in result["shapes"]:
        proof = shape["sourceToMesh"]
        assert len(proof["coverage"]) == 10
        assert all(c["triangles"] > 0 for c in proof["coverage"])
        assert proof["cadToMeshUpperMm"] <= 0.02
        assert proof["meshToCadUpperMm"] <= 0.02


@pytest.mark.parametrize("verb,extra,expected", [("build", [], 2), ("verify", [], 2), ("lint", [], 2),
                                               ("lint", ["--allow-unresolved"], 0), ("build", ["--allow-unresolved"], 2)])
def test_production_cli_blocks_without_solids(tmp_path, verb, extra, expected):
    output = tmp_path / "production"
    p = subprocess.run([sys.executable, "-m", "twin_cad", verb, "--variant", "rpi4", "--output", str(output), *extra], capture_output=True, text=True)
    assert p.returncode == expected
    report = json.loads(p.stdout)
    assert report["status"] == "BLOCKED" and report["generatedSolids"] == 0
    assert not report["instructionalReleaseAllowed"]
    assert report["blockerIds"] and report["productionDatum"]["state"] == "unresolved"
    assert not output.exists()


@pytest.mark.parametrize("raw", ['{"a":1,"a":2}', '{"a":-0}', '{"a":-0.0}', '{"a":NaN}', '{"a":"\\ud800"}'])
def test_strict_json_rejects(raw, tmp_path):
    p = tmp_path / "TEST-input.json"
    p.write_text(raw)
    with pytest.raises((ValueError, UnicodeError)):
        load(p)


def test_cli_exit_one_and_three(tmp_path):
    fixture = tmp_path / "TEST-bad.json"
    fixture.write_text('{"scope":"bad"}')
    bad = subprocess.run([sys.executable, "-m", "twin_cad", "build", "--fixture", str(fixture), "--output", str(tmp_path / "out")], capture_output=True, text=True)
    assert bad.returncode == 1 and json.loads(bad.stdout)["status"] == "FAIL"
    missing = subprocess.run([sys.executable, "-m", "twin_cad", "build", "--fixture", str(tmp_path / "missing")], capture_output=True, text=True)
    assert missing.returncode == 3 and json.loads(missing.stdout)["status"] == "TOOL_FAILURE"


@pytest.mark.parametrize("axis", [0, 1, 2])
def test_asymmetric_100mm_basis_markers(axis):
    m = np.eye(4)
    m[axis, 3] = 100
    result = runtime_pose(m)
    expected = [0, 0, 0]
    expected[[2, 0, 1][axis]] = 0.1
    assert result["translationM"] == expected
    assert result["quaternionXYZW"] == [0, 0, 0, 1]


@pytest.mark.parametrize("kind", ["reflection", "shear", "scale"])
def test_nonrigid_runtime_conversion_rejects(kind):
    m = np.eye(4)
    if kind == "reflection":
        m[0, 0] = -1
    elif kind == "shear":
        m[0, 1] = 0.2
    else:
        m[:3, :3] *= 1000
    with pytest.raises(Invalid, match="REFLECTION_SCALE_OR_SHEAR"):
        runtime_pose(m)
