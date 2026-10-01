"""Actual provisional shape mutants; no production/session/hardware access."""
import copy
import json
import os
from pathlib import Path

import cadquery as cq
import numpy as np
import pytest

from twin_cad.components.plates.instructional.calibration import homography, project, undistort
from twin_cad.components.plates.instructional.generate import make_candidate
from twin_cad.components.plates.instructional.oracle import inspect, contains

SOURCE=json.loads(Path(os.environ['PICAR_M6_PARAMETERS']).read_text())
ARTIFACTS=Path(os.environ['PICAR_M6_ARTIFACTS'])
DEFINITIONS=SOURCE['definitions']


def altered(tmp_path, definition, shape):
    shape.exportBrep(str(tmp_path/(definition['definitionId']+'.brep')))
    return inspect(definition,tmp_path)


@pytest.mark.parametrize('definition',DEFINITIONS,ids=lambda d:d['plate'])
def test_actual_candidate(definition):
    result=inspect(definition,ARTIFACTS)
    assert result['status']=='PASS' and result['solidCount']==1
    assert not result['engineeringAdmission'] and not result['instructionalAdmission']


@pytest.mark.parametrize('definition',DEFINITIONS,ids=lambda d:d['plate'])
def test_capped_hole_rejected(tmp_path,definition):
    actual=cq.Shape.importBrep(str(ARTIFACTS/(definition['definitionId']+'.brep')))
    hole=definition['holes'][0];x,y=hole['centerMm']
    plug=cq.Workplane('XY').center(x,y).circle(hole['diameterMm']/2+.1).extrude(2).val()
    with pytest.raises(ValueError,match='MISSING_HOLE|CAPPED_THROUGH_HOLE|UNEXPECTED_OPENING'):
        altered(tmp_path,definition,actual.fuse(plug).clean())


@pytest.mark.parametrize('definition',DEFINITIONS,ids=lambda d:d['plate'])
def test_missing_hole_rejected(tmp_path,definition):
    changed=copy.deepcopy(definition);changed['holes']=changed['holes'][1:]
    with pytest.raises(ValueError,match='MISSING_HOLE'):
        altered(tmp_path,definition,make_candidate(changed))


@pytest.mark.parametrize('definition',DEFINITIONS,ids=lambda d:d['plate'])
def test_unit_mutant_rejected(tmp_path,definition):
    shape=cq.Shape.importBrep(str(ARTIFACTS/(definition['definitionId']+'.brep')))
    with pytest.raises(ValueError,match='STOCK_PLANES_OR_UNITS'):
        altered(tmp_path,definition,shape.scale(1000))


@pytest.mark.parametrize('definition',DEFINITIONS,ids=lambda d:d['plate'])
def test_shell_rejected(tmp_path,definition):
    shape=cq.Shape.importBrep(str(ARTIFACTS/(definition['definitionId']+'.brep')))
    with pytest.raises(ValueError,match='INVALID_BREP_SOLID'):
        altered(tmp_path,definition,shape.Shells()[0])


def test_missing_slot_rejected(tmp_path):
    definition=DEFINITIONS[0];changed=copy.deepcopy(definition);changed['profile']['slots']=changed['profile']['slots'][1:]
    with pytest.raises(ValueError,match='MISSING_THROUGH_SLOT'):
        altered(tmp_path,definition,make_candidate(changed))


def test_missing_cutout_rejected(tmp_path):
    definition=DEFINITIONS[0];changed=copy.deepcopy(definition);changed['profile']['cutouts']=changed['profile']['cutouts'][1:]
    with pytest.raises(ValueError,match='MISSING_THROUGH_CUTOUT'):
        altered(tmp_path,definition,make_candidate(changed))


def test_missing_notch_rejected(tmp_path):
    definition=next(d for d in DEFINITIONS if d['plate']=='H');profile=definition['profile']
    x0,x1,y0,y1=[profile[n] for n in ('xMin','xMax','yMin','yMax')]
    changed=copy.deepcopy(definition)
    # Replace open-notch profile with an unnotched sampled rectangle, retaining holes.
    changed['profile']={'kind':'sampled-outline','verticesMm':[(x0,y0),(x1,y0),(x1,y1),(x0,y1)],'slots':[],'cutouts':[]}
    with pytest.raises(ValueError,match='MISSING_OPEN_NOTCH'):
        altered(tmp_path,definition,make_candidate(changed))


def test_stock_promotion_rejected():
    changed=copy.deepcopy(DEFINITIONS[0]);changed['thickness']['confidence']='VERIFIED'
    with pytest.raises(ValueError,match='THICKNESS_PROMOTION'):make_candidate(changed)


def test_engineering_datum_rejected():
    changed=copy.deepcopy(DEFINITIONS[0]);changed['presentationOrigin']['engineeringDatum']=True
    with pytest.raises(ValueError,match='ENGINEERING_DATUM'):make_candidate(changed)


def test_projective_correction_of_withheld_point():
    # The target is independently known; an affine/raw-pixel approximation cannot pass.
    truth=np.array([[1.2,.15,20],[.08,.9,10],[.002,.003,1]],dtype=float)
    source=np.array([[0,0],[100,0],[100,60],[0,60]],dtype=float)
    destination=project(source,truth)
    solved=homography(source,destination)
    assert np.allclose(project([[31,19]],solved),project([[31,19]],truth),atol=1e-10)
    assert not np.allclose(project([[31,19]],solved),[[31,19]])


def test_degenerate_calibration_rejected():
    with pytest.raises(np.linalg.LinAlgError):homography([[0,0]]*4,[[0,0],[1,0],[1,1],[0,1]])


def test_lens_correction_moves_off_center_points():
    corrected=undistort([[0,0],[500,500]],.1,[1000,1000])
    assert np.allclose(corrected[1],[500,500])
    assert not np.allclose(corrected[0],[0,0])
