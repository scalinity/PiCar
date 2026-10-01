"""Actual proxy byte/feature checks in isolated mirrors; no owner sessions."""
import copy
import json
import os
from pathlib import Path

import cadquery as cq
import pytest
from twin_cad.components.instructional.oracle import inspect
from twin_cad.components.instructional.generate import make_proxy
from twin_cad.contracts import Invalid

SOURCE = json.loads(Path(os.environ["PICAR_M5_INSTRUCTIONAL_PARAMETERS"]).read_text())
ARTIFACTS = Path(os.environ["PICAR_M5_INSTRUCTIONAL_ARTIFACTS"])


@pytest.mark.parametrize("definition", SOURCE["definitions"], ids=lambda d: d["definitionId"])
def test_actual_instructional_shape(definition):
    result = inspect(definition, ARTIFACTS)
    assert result["status"] == "PASS" and result["engineeringAdmission"] is False


def definition(suffix):
    return next(d for d in SOURCE["definitions"] if d["definitionId"] == "PX-V40-DEF-"+suffix)


def mutated_shape(tmp_path, d, shape):
    shape.exportBrep(str(tmp_path / (d["definitionId"]+".brep")))
    return inspect(d, tmp_path)


def test_wrong_units_rejected(tmp_path):
    d = definition("CAMERA")
    actual = cq.Shape.importBrep(str(ARTIFACTS / (d["definitionId"]+".brep")))
    with pytest.raises(Invalid, match="BOUNDS_OR_UNITS"):
        mutated_shape(tmp_path, d, actual.scale(1000))


def test_front_rear_shape_substitution_rejected(tmp_path):
    d = definition("WHEEL-FRONT")
    actual = cq.Shape.importBrep(str(ARTIFACTS / (definition("WHEEL-REAR")["definitionId"]+".brep")))
    with pytest.raises(Invalid, match="SPOKE_WINDOWS|CYLINDRICAL"):
        mutated_shape(tmp_path, d, actual)


def test_motor_handedness_shape_substitution_rejected(tmp_path):
    d = definition("MOTOR-LEFT")
    actual = cq.Shape.importBrep(str(ARTIFACTS / (definition("MOTOR-RIGHT")["definitionId"]+".brep")))
    with pytest.raises(Invalid, match="BOUNDS_OR_UNITS"):
        mutated_shape(tmp_path, d, actual)


def test_actual_camera_holes_required_even_with_same_bounds(tmp_path):
    d = definition("CAMERA")
    shape = cq.Solid.makeBox(25, 23, 1).fuse(cq.Solid.makeCylinder(4, 8, cq.Vector(12.5, 11.5, 1)))
    with pytest.raises(Invalid, match="ACTUAL_HOLE"):
        mutated_shape(tmp_path, d, shape)


def test_extra_owned_rivet_pin_rejected(tmp_path):
    d = next(d for d in SOURCE["definitions"] if d["recipe"] == "rivet")
    actual = cq.Shape.importBrep(str(ARTIFACTS / (d["definitionId"]+".brep")))
    shape = cq.Compound.makeCompound([*actual.Solids(), cq.Solid.makeCylinder(.7, 4, cq.Vector(20, 0, 0))])
    with pytest.raises(Invalid, match="SOLID_COUNT"):
        mutated_shape(tmp_path, d, shape)


def test_schematic_cannot_invent_solid(tmp_path):
    d = next(d for d in SOURCE["definitions"] if d["recipe"] == "schematic")
    with pytest.raises(Invalid, match="UNEXPECTED_SOLID"):
        mutated_shape(tmp_path, d, cq.Solid.makeBox(1, 1, 1))


def test_generator_requires_presentation_classification():
    d = copy.deepcopy(definition("CAMERA"))
    d["instructionalApproximations"][0]["nonEngineering"] = False
    with pytest.raises(Invalid, match="PRESENTATION_FLAG_REQUIRED"):
        make_proxy(d)
