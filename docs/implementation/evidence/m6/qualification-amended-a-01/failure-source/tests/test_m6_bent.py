"""Actual bent feature/plane/mirror mutants; engineering admission remains forbidden."""
import copy
import json
import os
from pathlib import Path

import cadquery as cq
import pytest

from twin_cad.components.plates.instructional.bent_oracle import inspect_bent,mirror_check,declared_faces,world
from twin_cad.components.plates.instructional.generate import make_candidate

ALL=json.loads(Path(os.environ['PICAR_M6_PARAMETERS']).read_text())['definitions']
BENT=[d for d in ALL if 'bent-faces' in d['profile']['kind']]
ARTIFACTS=Path(os.environ['PICAR_M6_ARTIFACTS'])


def save(tmp,definition,shape):
    shape.exportBrep(str(tmp/(definition['definitionId']+'.brep')))
    return inspect_bent(definition,tmp)


@pytest.mark.parametrize('definition',BENT,ids=lambda d:d['plate'])
def test_actual_bent(definition):
    r=inspect_bent(definition,ARTIFACTS)
    assert r['solidCount']==1 and r['volumeMm3']>0 and not r['engineeringAdmission']


@pytest.mark.parametrize('definition',BENT,ids=lambda d:d['plate'])
def test_bent_missing_hole(tmp_path,definition):
    mutant=copy.deepcopy(definition);faces=mutant['profile'].get('faces',mutant['profile'].get('sourceFaces'))
    f=next(f for f in faces if f['holes']);f['holes'].pop(0)
    with pytest.raises(ValueError,match='MISSING_BENT_HOLE'):save(tmp_path,definition,make_candidate(mutant))


@pytest.mark.parametrize('definition',BENT,ids=lambda d:d['plate'])
def test_bent_missing_face(tmp_path,definition):
    mutant=copy.deepcopy(definition);faces=mutant['profile'].get('faces',mutant['profile'].get('sourceFaces'));faces.pop()
    with pytest.raises(ValueError,match='BENT_BOUNDS|MISSING_BENT_HOLE|MISSING_BENT_SLOT'):save(tmp_path,definition,make_candidate(mutant))


@pytest.mark.parametrize('definition',BENT,ids=lambda d:d['plate'])
def test_bent_unit_mutant(tmp_path,definition):
    actual=cq.Shape.importBrep(str(ARTIFACTS/(definition['definitionId']+'.brep')))
    with pytest.raises(ValueError,match='BENT_BOUNDS_OR_UNITS'):save(tmp_path,definition,actual.scale(1000))


@pytest.mark.parametrize('definition',BENT,ids=lambda d:d['plate'])
def test_bent_shell_mutant(tmp_path,definition):
    actual=cq.Shape.importBrep(str(ARTIFACTS/(definition['definitionId']+'.brep')))
    with pytest.raises(ValueError,match='INVALID_BREP_SOLID'):save(tmp_path,definition,actual.Shells()[0])


def test_real_cad_mirror():
    if len(BENT)==5:assert mirror_check(ARTIFACTS)['status']=='PASS'


def test_unmirrored_f_rejected(tmp_path):
    if len(BENT)!=5:return
    e=cq.Shape.importBrep(str(ARTIFACTS/'PX-V40-DEF-PLATE-E.brep'))
    e.exportBrep(str(tmp_path/'PX-V40-DEF-PLATE-E.brep'));e.exportBrep(str(tmp_path/'PX-V40-DEF-PLATE-F.brep'))
    with pytest.raises(ValueError,match='MIRROR_SHAPE_MISMATCH'):mirror_check(tmp_path)


def test_extra_bent_hole_rejected(tmp_path):
    definition=next(d for d in BENT if d['plate']=='B')
    mutant=copy.deepcopy(definition)
    mutant['profile']['faces'][0]['holes'].append({'name':'invented','centerMm':[0,5],'diameterMm':2})
    with pytest.raises(ValueError,match='UNDECLARED_BENT_OPENING'):save(tmp_path,definition,make_candidate(mutant))


def test_c_diagonal_slot_displacement_rejected(tmp_path):
    definition=next(d for d in BENT if d['plate']=='C')
    mutant=copy.deepcopy(definition)
    face=next(f for f in mutant['profile']['faces'] if f['name']=='slotted-wall')
    face['slots'][0]['endCentersMm']=[[8,30],[34,30]]
    with pytest.raises(ValueError,match='MISSING_BENT_SLOT'):save(tmp_path,definition,make_candidate(mutant))
