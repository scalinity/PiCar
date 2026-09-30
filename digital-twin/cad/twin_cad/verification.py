"""Independent analytic witnesses. Never calls the generator or solver residual."""
from collections import Counter
from fractions import Fraction as F
from pathlib import Path
import math

import cadquery as cq
import numpy as np
from OCP.BRepCheck import BRepCheck_Analyzer

from .contracts import (ANGLE_BUDGET_RAD, POSITION_BUDGET_MM, SURFACE_BUDGET_MM,
                        Blocked, Invalid, digest, input_digest, load)


def require(condition, reason):
    if not condition:
        raise Invalid(reason)


def matrix(p):
    """Independent XYZW expansion, no scipy Rotation or exporter conversion."""
    t, q = p["translationMm"], p["quaternionXYZW"]
    require(len(t) == 3 and len(q) == 4 and all(math.isfinite(v) for v in t+q), "POSE_NUMBERS")
    require(abs(sum(v*v for v in q)-1) < 1e-9, "POSE_QUATERNION")
    x, y, z, w = q
    m = np.array([[1-2*(y*y+z*z), 2*(x*y-z*w), 2*(x*z+y*w), t[0]],
                  [2*(x*y+z*w), 1-2*(x*x+z*z), 2*(y*z-x*w), t[1]],
                  [2*(x*z-y*w), 2*(y*z+x*w), 1-2*(x*x+y*y), t[2]],
                  [0, 0, 0, 1]], dtype=np.float64)
    require(abs(np.linalg.det(m[:3, :3])-1) < 1e-9, "HANDEDNESS")
    return m


def constraint_witness(assembly, solution):
    require(solution["id"] == assembly["id"], "SOLUTION_ID")
    rows = solution["poses"]
    require(len(rows) == len(assembly["instanceIds"]) and {r["instanceId"] for r in rows} == set(assembly["instanceIds"]), "SWAPPED_INSTANCE")
    p = {r["instanceId"]: matrix(r["cad"]) for r in rows}
    require(np.max(np.abs(p[assembly["anchor"]]-matrix(assembly["anchorPose"]))) < 1e-9, "ANCHOR")
    # Directed full frames, plus sampled roll for revolute, imply a unique
    # relation per edge. Connected propagation proves global uniqueness for
    # these fixture types, independently of local numerical solver success.
    unique = {assembly["anchor"]: matrix(assembly["anchorPose"])}
    remaining = list(assembly["constraints"])
    while remaining:
        progress = False
        for c in remaining[:]:
            a, b = c["a"], c["b"]
            if a not in unique and b not in unique:
                continue
            reference = np.eye(4)
            if c["kind"] == "revolute":
                angle = c["referenceRad"]
                reference[:2, :2] = [[math.cos(angle), -math.sin(angle)], [math.sin(angle), math.cos(angle)]]
            relation = matrix(c["frameA"]) @ reference @ np.linalg.inv(matrix(c["frameB"]))
            if a in unique:
                expected = unique[a] @ relation
                if b in unique:
                    require(np.max(np.abs(unique[b]-expected)) < 1e-8, "INDEPENDENT_LOOP_CLOSURE")
                else:
                    unique[b] = expected
            else:
                unique[a] = unique[b] @ np.linalg.inv(relation)
            remaining.remove(c)
            progress = True
        require(progress, "DISCONNECTED_UNDERCONSTRAINT")
    require(set(unique) == set(p), "DISCONNECTED_UNDERCONSTRAINT")
    require(all(np.max(np.abs(unique[i]-p[i])) < 1e-8 for i in p), "NONUNIQUE_OR_WRONG_REFERENCE_SOLUTION")
    errors = []
    for c in assembly["constraints"]:
        a, b = p[c["a"]] @ matrix(c["frameA"]), p[c["b"]] @ matrix(c["frameB"])
        translation = float(np.linalg.norm(a[:3, 3]-b[:3, 3]))
        if c["kind"] == "fixed":
            # atan2 of cross and dot avoids acos cancellation near zero.
            angles = [math.atan2(np.linalg.norm(np.cross(a[:3, k], b[:3, k])),
                                 np.dot(a[:3, k], b[:3, k])) for k in range(3)]
            angle = max(angles)
        else:
            angle = math.atan2(np.linalg.norm(np.cross(a[:3, 2], b[:3, 2])), np.dot(a[:3, 2], b[:3, 2]))
            reference = math.atan2(np.dot(a[:3, 1], b[:3, 0]), np.dot(a[:3, 0], b[:3, 0]))
            require(abs(reference-c["referenceRad"]) < ANGLE_BUDGET_RAD, "REVOLUTE_REFERENCE")
        require(translation <= POSITION_BUDGET_MM, "SHIFTED_PIVOT_RESIDUAL")
        require(angle <= ANGLE_BUDGET_RAD, "WRONG_AXIS_OR_ROLL")
        errors.append({"constraintId": c["id"], "positionMm": translation, "angleRad": angle})
    # Independent differential kinematics of point and direction equations.
    moving = sorted(set(p)-{assembly["anchor"]})
    def physical_residual(poses):
        out = []
        for c in assembly["constraints"]:
            a, b = poses[c["a"]] @ matrix(c["frameA"]), poses[c["b"]] @ matrix(c["frameB"])
            out.extend(a[:3, 3]-b[:3, 3])
            axes = range(3) if c["kind"] == "fixed" else [2]
            for k in axes:
                out.extend(a[:3, k]-b[:3, k])
        return np.array(out)
    columns = []
    for ident in moving:
        for k in range(6):
            plus, minus = {i: v.copy() for i, v in p.items()}, {i: v.copy() for i, v in p.items()}
            if k < 3:
                plus[ident][k, 3] += 1e-6
                minus[ident][k, 3] -= 1e-6
            else:
                axis = np.eye(3)[k-3]
                x, y, z = axis
                skew = np.array([[0, -z, y], [z, 0, -x], [-y, x, 0]])
                plus[ident][:3, :3] = (np.eye(3)+1e-6*skew) @ p[ident][:3, :3]
                minus[ident][:3, :3] = (np.eye(3)-1e-6*skew) @ p[ident][:3, :3]
            columns.append((physical_residual(plus)-physical_residual(minus))/2e-6)
    rank = int(np.linalg.matrix_rank(np.column_stack(columns), tol=1e-6))
    dof = 6*len(moving)-rank
    require(dof == assembly["expectedDOF"] == solution["expectedDOF"], "INDEPENDENT_DOF")
    for row in rows:
        cad = p[row["instanceId"]]
        runtime = row["runtime"]
        require(set(runtime) == {"translationM", "quaternionXYZW", "unit", "basis"} and runtime["unit"] == "m" and runtime["basis"] == "RH-YUP-ZFORWARD", "RUNTIME_CONTRACT")
        actual = matrix({"translationMm": runtime["translationM"], "quaternionXYZW": runtime["quaternionXYZW"]})
        # Basis mapping explicitly expanded independently of exporter R.
        permutation = [1, 2, 0]
        expected_rotation = cad[:3, :3][np.ix_(permutation, permutation)]
        expected_translation = cad[permutation, 3]/1000
        require(np.max(np.abs(actual[:3, :3]-expected_rotation)) < 1e-9 and
                np.linalg.norm(actual[:3, 3]-expected_translation) < 1e-9, "UNITS_OR_DOUBLE_CONVERSION")
    return {"status": "PASS", "independentDOF": dof, "independentRank": rank, "residuals": errors,
            "uniqueness": "Connected directed frame relations at declared revolute reference; all closing edges independently agree"}


def area(poly):
    return abs(sum(poly[i][0]*poly[(i+1) % len(poly)][1]-poly[(i+1) % len(poly)][0]*poly[i][1] for i in range(len(poly))))/2 if len(poly) >= 3 else F(0)


def cross(a, b, c):
    return (b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0])


def clip(poly, boundary):
    """Exact rational convex polygon intersection; used for overlap/hole coverage."""
    for i, a in enumerate(boundary):
        b = boundary[(i+1) % len(boundary)]
        result = []
        for j, p in enumerate(poly):
            q = poly[(j+1) % len(poly)]
            dp, dq = cross(a, b, p), cross(a, b, q)
            if dp >= 0:
                result.append(p)
            if (dp < 0 <= dq) or (dq < 0 <= dp):
                fraction = dp/(dp-dq)
                result.append((p[0]+fraction*(q[0]-p[0]), p[1]+fraction*(q[1]-p[1])))
        poly = result
        if not poly:
            break
    return poly


def rectangle(x0, y0, x1, y1):
    return [(F(x0), F(y0)), (F(x1), F(y0)), (F(x1), F(y1)), (F(x0), F(y1))]


def planar_mesh_witness(d, packet):
    """Complete bidirectional bound for this planar rectilinear TEST profile only.

    Project to authored grid within measured vertex error. Prove containment,
    no positive-area overlaps, exact area coverage and directed closed topology
    with rational arithmetic. The barycentric map bounds BOTH surface directions
    by max vertex projection error. Hole/cavity walls are mandatory face domains.
    """
    l, w, h = d["length"], d["width"], d["height"]
    x, y, a, b = d["holeX"], d["holeY"], d["holeLength"], d["holeWidth"]
    levels = [[0, x, x+a, l], [0, y, y+b, w], [0, h]]
    points, error = [], 0.
    for v in packet["positionsFloat64"]:
        require(len(v) == 3 and all(math.isfinite(n) for n in v), "MESH_NUMBERS")
        snapped = [min(levels[k], key=lambda n: abs(n-v[k])) for k in range(3)]
        error = max(error, math.dist(v, snapped))
        if math.dist(v, snapped) > 1e-8:
            raise Invalid("SURFACE_GRID_DEVIATION")
        points.append(tuple(F(n) for n in snapped))
    # axis, plane, outward normal sign, trimmed rectangle, protected void.
    domains = [(2, 0, -1, rectangle(0, 0, l, w), rectangle(x, y, x+a, y+b)),
               (2, h, 1, rectangle(0, 0, l, w), rectangle(x, y, x+a, y+b)),
               (0, 0, -1, rectangle(0, 0, w, h), None), (0, l, 1, rectangle(0, 0, w, h), None),
               (1, 0, -1, rectangle(0, 0, l, h), None), (1, w, 1, rectangle(0, 0, l, h), None),
               (0, x, 1, rectangle(y, 0, y+b, h), None), (0, x+a, -1, rectangle(y, 0, y+b, h), None),
               (1, y, 1, rectangle(x, 0, x+a, h), None), (1, y+b, -1, rectangle(x, 0, x+a, h), None)]
    groups = [[] for _ in domains]
    edges = Counter()
    for tri in packet["triangles"]:
        require(len(tri) == 3 and all(type(i) is int and 0 <= i < len(points) for i in tri) and len(set(tri)) == 3, "MESH_INDICES")
        v = [points[i] for i in tri]
        matching = [n for n, (axis, value, _, _, _) in enumerate(domains) if all(p[axis] == F(value) for p in v)]
        require(len(matching) == 1, "SURFACE_DOMAIN_OR_DEGENERATE")
        n = matching[0]
        axis, _, sign, outer, hole = domains[n]
        others = [k for k in range(3) if k != axis]
        poly = [tuple(p[k] for k in others) for p in v]
        orientation = cross(*poly)
        require(orientation != 0 and ((1 if orientation > 0 else -1)*(-1 if axis == 1 else 1)) == sign, "WINDING_OR_WRONG_HANDED")
        if orientation < 0:
            poly.reverse()
        require(area(clip(poly, outer)) == area(poly), "OUTSIDE_ANALYTIC_FACE")
        require(hole is None or area(clip(poly, hole)) == 0, "CAPPED_OR_MISSING_HOLE")
        groups[n].append(poly)
        for k in range(3):
            edges[(v[k], v[(k+1) % 3])] += 1
    require(all(count == 1 and edges[(q, p)] == 1 for (p, q), count in edges.items()), "OPEN_OR_DUPLICATE_TOPOLOGY")
    face_coverage = []
    for n, polys in enumerate(groups):
        _, _, _, outer, hole = domains[n]
        expected = area(outer)-(area(hole) if hole else 0)
        for i, poly in enumerate(polys):
            require(all(area(clip(poly, other)) == 0 for other in polys[:i]), "OVERLAPPING_TRIANGLES")
        require(sum(area(p) for p in polys) == expected, "MISSING_SURFACE_OR_HOLE_WALL")
        face_coverage.append({"domain": n, "triangles": len(polys), "exactAreaMm2": float(expected)})
    require(error <= SURFACE_BUDGET_MM, "SURFACE_BUDGET")
    return {"status": "PASS", "method": "TEST-planar-rational-coverage-v1", "cadToMeshUpperMm": error,
            "meshToCadUpperMm": error, "protectedSurfaceUpperMm": error, "surfaceBudgetMm": SURFACE_BUDGET_MM,
            "contextBudgetMm": 0.10, "coverage": face_coverage,
            "proof": "Exact rational projected domains, disjoint interiors, complete trimmed area, closed oriented edges; barycentric displacement <= maximum projection error in both directions",
            "unsupportedProfiles": "BLOCKED; no curved surface or motion-sweep claim"}


def shape_witness(definition, directory):
    """Reads actual BRep and mesh, checks against authored analytic dimensions."""
    ident, d = definition["id"], definition["parameters"]
    out = Path(directory)
    solid = cq.Shape.importBrep(str(out / (ident+".brep")))
    require(BRepCheck_Analyzer(solid.wrapped).IsValid() and len(solid.Solids()) == 1, "SOLID_VALIDITY")
    l, w, h, x, y, a, b = (d[k] for k in ("length", "width", "height", "holeX", "holeY", "holeLength", "holeWidth"))
    expected_volume = (l*w-a*b)*h
    require(abs(solid.Volume()-expected_volume) < 1e-8, "MISSING_HOLE_VOLUME")
    vertices = sorted({tuple(round(v, 9) for v in p.Center().toTuple()) for p in solid.Vertices()})
    expected_vertices = sorted({(u, v, z) for z in (0, h) for u, v in [(0, 0), (l, 0), (l, w), (0, w), (x, y), (x+a, y), (x+a, y+b), (x, y+b)]})
    require(vertices == expected_vertices, "ASYMMETRIC_FEATURE_OR_SHIFTED_DATUM")
    faces = solid.Faces()
    if any(f.geomType() != "PLANE" for f in faces):
        raise Blocked("UNBOUNDED_NONPLANAR_SURFACE_PROOF")
    require(len(faces) == 10, "ANALYTIC_SURFACES")
    top = [f for f in faces if all(abs(v.Center().z-h) < 1e-9 for v in f.Vertices())]
    require(len(top) == 1 and len(top[0].Wires()) == 2, "PROTECTED_THROUGH_HOLE")
    # Check actual face normal signs, full trimmed coverage and interior hole walls.
    verts, tris = solid.tessellate(0.005, 0.05)
    brep_proof = planar_mesh_witness(d, {"positionsFloat64": [v.toTuple() for v in verts], "triangles": [list(t) for t in tris]})
    packet = load(out/(ident+".mesh.json"))
    require(packet["definitionId"] == ident and packet["scope"] == "TEST-ONLY", "PACKET_OWNER")
    require(packet["unit"] == "mm" and packet["basis"] == "RH-XFORWARD-YLEFT-ZUP" and packet["coordinateConversionCount"] == 0 and packet["datum"] == "synthetic.x0-y0-z0", "PACKET_UNITS_OR_DATUM")
    proof = planar_mesh_witness(d, packet)
    features = load(out/(ident+".features.json"))
    require(features["definitionId"] == ident and features["scope"] == "TEST-ONLY", "FEATURE_OWNER")
    require(features["datum"] == {"name": "synthetic.x0-y0-z0", "translationMm": [0, 0, 0], "quaternionXYZW": [0, 0, 0, 1]}, "SHIFTED_PIVOT")
    expected_axis = {"originMm": [x+a/2, y+b/2, 0], "direction": [0, 0, 1], "rollDirection": [1, 0, 0]}
    require(features["hole.axis"] == expected_axis, "WRONG_AXIS_POLARITY_OR_ROLL")
    require(abs(features["volumeMm3"]-solid.Volume()) < 1e-8 and features["boundsMm"] == [0, 0, 0, l, w, h], "FEATURE_GEOMETRY")
    actual_faces = [{"normal": list(f.normalAt().toTuple()), "centerMm": list(f.Center().toTuple()), "areaMm2": f.Area(), "wireCount": len(f.Wires())} for f in faces]
    actual_faces.sort(key=lambda f: (f["normal"], f["centerMm"]))
    # Exported feature table bound to independently read BRep, plus source checks above.
    require(digest(features["planarFaces"]) == digest(actual_faces), "FEATURE_TABLE_NOT_BREP")
    return {"definitionId": ident, "status": "PASS", "actualVertexFingerprint": digest(vertices),
            "actualVolumeMm3": solid.Volume(), "sourceToBrep": brep_proof, "sourceToMesh": proof,
            "independentInterfaceFingerprint": digest({"vertices": vertices, "axis": expected_axis, "volume": solid.Volume()})}


def verify(source, directory):
    out = Path(directory)
    solutions = load(out / "solutions.json")
    require(solutions["scope"] == "TEST-ONLY" and solutions["fixtureInputHash"] == input_digest(source), "SOLUTION_SOURCE_BINDING")
    require(solutions["instanceDefinitions"] == sorted(source["instances"], key=lambda i: i["id"]), "SWAPPED_INSTANCE_DEFINITION")
    require(len(solutions["solutions"]) == len(source["assemblies"]), "SOLUTION_COUNT")
    by_id = {s["id"]: s for s in solutions["solutions"]}
    require(len(by_id) == len(solutions["solutions"]), "DUPLICATE_SOLUTION")
    return {"gate": "G-TOOLCHAIN", "scope": "TEST-ONLY", "status": "PASS", "fixtureInputHash": input_digest(source),
            "shapes": [shape_witness(d, out) for d in sorted(source["definitions"], key=lambda d: d["id"])],
            "constraints": [{"assemblyId": a["id"], **constraint_witness(a, by_id[a["id"]])} for a in sorted(source["assemblies"], key=lambda a: a["id"])],
            "productionAdmission": "BLOCKED; synthetic witnesses grant no kit, physical-fit, torque or hidden-engagement capability"}
