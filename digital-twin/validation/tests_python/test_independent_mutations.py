"""Mutate actual synthetic exported bytes, never owner evidence or sessions."""
from pathlib import Path
import shutil

import pytest

from twin_cad.__main__ import build
from twin_cad.contracts import Invalid, load, write
from twin_cad.verification import verify

TWIN = Path(__file__).resolve().parents[2]


@pytest.fixture
def exported(tmp_path):
    source = load(TWIN / "validation/fixtures/m4/TEST-M4.json")
    build(source, tmp_path)
    assert verify(source, tmp_path)["status"] == "PASS"
    return source, tmp_path


@pytest.mark.parametrize("mutation,reason", [
    ("wrong-handed", "SURFACE_GRID_DEVIATION"),
    ("shifted-pivot", "SHIFTED_PIVOT"),
    ("missing-hole", "CAPPED_OR_MISSING_HOLE"),
    ("wrong-axis", "WRONG_AXIS_POLARITY_OR_ROLL"),
    ("swapped-instance", "SWAPPED_INSTANCE_DEFINITION"),
    ("1000x", "SURFACE_GRID_DEVIATION"),
    ("hole-wall-removed", "OPEN_OR_DUPLICATE_TOPOLOGY"),
    ("overlap", "OPEN_OR_DUPLICATE_TOPOLOGY"),
    ("reversed-winding", "WINDING_OR_WRONG_HANDED"),
    ("double-conversion", "UNITS_OR_DOUBLE_CONVERSION"),
    ("stale-fingerprint", "FEATURE_TABLE_NOT_BREP"),
])
def test_independent_export_mutations_reject(exported, mutation, reason):
    source, out = exported
    mesh_path, feature_path, solution_path = (out / name for name in ["TEST-DEF-A.mesh.json", "TEST-DEF-A.features.json", "solutions.json"])
    mesh, feature, solution = load(mesh_path), load(feature_path), load(solution_path)
    if mutation == "wrong-handed":
        for p in mesh["positionsFloat64"]:
            p[1] = 18-p[1]
    elif mutation == "shifted-pivot":
        feature["datum"]["translationMm"][0] = 1
    elif mutation == "missing-hole":
        # Same vertices, but a top-plane triangle caps the protected through-hole.
        points = mesh["positionsFloat64"]
        ids = [points.index(p) for p in [[5, 4, 3], [9, 4, 3], [9, 10, 3]]]
        mesh["triangles"].append(ids)
    elif mutation == "wrong-axis":
        feature["hole.axis"]["direction"] = [0, 0, -1]
    elif mutation == "swapped-instance":
        solution["instanceDefinitions"][0]["definitionId"] = "TEST-DEF-B"
    elif mutation == "1000x":
        mesh["positionsFloat64"] = [[1000*n for n in p] for p in mesh["positionsFloat64"]]
    elif mutation == "hole-wall-removed":
        points = mesh["positionsFloat64"]
        mesh["triangles"] = [t for t in mesh["triangles"] if not all(points[i][0] == 5 for i in t)]
    elif mutation == "overlap":
        mesh["triangles"].append(mesh["triangles"][0])
    elif mutation == "reversed-winding":
        mesh["triangles"][0].reverse()
    elif mutation == "double-conversion":
        solution["solutions"][0]["poses"][1]["runtime"]["translationM"] = [n/1000 for n in solution["solutions"][0]["poses"][1]["runtime"]["translationM"]]
    elif mutation == "stale-fingerprint":
        feature["planarFaces"][0]["areaMm2"] += 1
    write(mesh_path, mesh)
    write(feature_path, feature)
    write(solution_path, solution)
    with pytest.raises(Invalid, match=reason):
        verify(source, out)


def test_actual_brep_missing_hole_not_metadata(exported):
    import cadquery as cq
    source, out = exported
    cq.Solid.makeBox(24, 18, 3).exportBrep(str(out / "TEST-DEF-A.brep"))
    with pytest.raises(Invalid, match="MISSING_HOLE_VOLUME"):
        verify(source, out)


def test_actual_brep_swapped_definition(exported):
    source, out = exported
    shutil.copyfile(out / "TEST-DEF-B.brep", out / "TEST-DEF-A.brep")
    with pytest.raises(Invalid, match="MISSING_HOLE_VOLUME"):
        verify(source, out)
