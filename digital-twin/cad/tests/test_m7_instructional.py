"""Adversarial S01 observations and actual S02 direction conflict; no future poses claimed."""
import copy
import os
from pathlib import Path
import numpy as np
import pytest
from twin_cad.contracts import load, Invalid
from twin_cad.assemblies.instructional import generate as generator
from twin_cad.assemblies.instructional.verify import verify, rigid, board_direction_probe

ROOT=Path(os.environ['PICAR_M7_ROOT'])
SOLUTIONS=Path(os.environ['PICAR_M7_SOLUTIONS'])


@pytest.fixture(params=['rpi5','rpi-zero-2-w'])
def solution(request):
    return load(SOLUTIONS/(request.param+'-S01.json'))


def test_static_actual_solids_and_contacts(solution):
    result=verify(ROOT,solution)
    assert result['solidInstanceCount']==9
    assert result['pairChecks']==36
    assert len(result['allowedContacts'])==4
    assert result['forbiddenPenetrations']==[]
    assert all(r['translationMm']==0 and r['axisRad']==0 and r['rollRad']==0 for r in result['residuals'])
    assert result['physicalClearance']['status']=='BLOCKED'
    assert result['installationSweep']['status']=='BLOCKED'


def test_branch_geometry_and_instance_types():
    pi=load(SOLUTIONS/'rpi5-S01.json')
    zero=load(SOLUTIONS/'rpi-zero-2-w-S01.json')
    assert sum('M25X18PLUS6-STANDOFF' in p['instanceId'] for p in pi['after'])==4
    assert sum('M25X30-STANDOFF' in p['instanceId'] for p in zero['after'])==2
    assert sum('M25X11-STANDOFF' in p['instanceId'] for p in zero['after'])==2
    assert all(p['translationMm'][1]<0 and p['translationMm'][2]==2 for p in zero['after'] if 'M25X30' in p['instanceId'])
    assert all(p['translationMm'][1]>0 for p in zero['after'] if 'M25X11' in p['instanceId'])


def test_authored_module_is_installed_wheel():
    assert 'site-packages' in str(Path(generator.__file__).resolve())


@pytest.mark.parametrize('variant',['rpi4','pico','raspberry-pi'])
def test_non_target_and_generic_rejected(variant):
    with pytest.raises(Invalid,match='PRESERVED_NON_TARGET_OR_UNSUPPORTED'):
        generator.generate(ROOT,variant)


@pytest.mark.parametrize('matrix',[
    [[-1,0,0],[0,1,0],[0,0,1]],
    [[2,0,0],[0,1,0],[0,0,1]],
    [[1,.1,0],[0,1,0],[0,0,1]],
    [[float('nan'),0,0],[0,1,0],[0,0,1]],
])
def test_rotation_reflection_scale_shear_nonfinite(matrix):
    pose={'instanceId':'test','translationMm':[0,0,0],'rotation':matrix,'featureRef':'test','role':'test'}
    with pytest.raises(Invalid):
        rigid(pose)


@pytest.mark.parametrize('name',['missing','duplicate','shift','wrong-axis','wrong-polarity','wrong-roll','scale-field','drift-dof','swap-feature','before-fallback','approach','sweep','engineering','runtime','contact-exemption','connections','operations','limit-removal','drop-binding'])
def test_mutations(solution,name):
    s=copy.deepcopy(solution)
    p=next(p for p in s['after'] if p['role']=='standoff')
    if name=='missing':s['after'].remove(p)
    elif name=='duplicate':s['after'].append(p)
    elif name=='shift':p['translationMm'][0]+=1
    elif name=='wrong-axis':p['rotation']=[[1,0,0],[0,0,-1],[0,1,0]]
    elif name=='wrong-polarity':p['rotation']=[[1,0,0],[0,-1,0],[0,0,-1]]
    elif name=='wrong-roll':p['rotation']=[[0,-1,0],[1,0,0],[0,0,1]]
    elif name=='scale-field':p['scale']=[1,1,1]
    elif name=='drift-dof':s['remainingDOF']=['translationX']
    elif name=='swap-feature':p['featureRef']='deck.hole.7'
    elif name=='before-fallback':s['before'][0]['pose']={'translationMm':[0,0,0]}
    elif name=='approach':s['recipes'][0]['stagedStart']['translationMm'][1]+=1
    elif name=='sweep':s['claims']['installationSweep']='PASS'
    elif name=='engineering':s['engineeringAdmission']=True
    elif name=='runtime':s['runtimeAdmission']=True
    elif name=='contact-exemption':s['contactPolicy']=[]
    elif name=='connections':s['connectionIds'].pop()
    elif name=='operations':s['operationIds'].reverse()
    elif name=='limit-removal':s['sourceLimitations']=[]
    elif name=='drop-binding':s['inputBindings'].pop()
    with pytest.raises(Invalid):verify(ROOT,s)


def test_retained_incorrect_source_review_opposite_chirality():
    result=board_direction_probe(ROOT)
    assert result['status']=='BLOCKED'
    assert result['determinant']==-1
    assert result['properRigidSolutionExists'] is False
    local=np.eye(3)
    desired=np.array(list(result['requiredInstalledDirections'].values())).T
    assert np.linalg.det(desired@local.T)==-1
    rotate_z=np.diag([-1,-1,1])
    assert np.linalg.det(rotate_z)==1
    assert np.array_equal(rotate_z@local[:,0],desired[:,0])
    assert not np.array_equal(rotate_z@local[:,1],desired[:,1])
