"""Independent actual-geometry checks and adversarial partial-board records."""
import copy
import os
from pathlib import Path
import pytest
from twin_cad.contracts import load, Invalid
from twin_cad.assemblies.instructional import correspondence, remediate

ROOT = Path(os.environ['PICAR_M7_ROOT'])
SOLUTIONS = Path(os.environ['PICAR_M7_SOLUTIONS'])
ARTIFACTS = Path(os.environ['PICAR_M7_REMEDIATION'])


@pytest.fixture(params=['rpi5', 'rpi-zero-2-w'])
def board(request):
    return load(ARTIFACTS / (request.param + '-S02-board.json'))


def test_installed_independent_module():
    assert 'site-packages' in str(Path(correspondence.__file__).resolve())
    assert 'site-packages' in str(Path(remediate.__file__).resolve())
    assert 'from .remediate' not in Path(correspondence.__file__).read_text()


def test_actual_revised_pi5_and_preserved_topology():
    r = correspondence.verify_revision(ROOT, ARTIFACTS)
    assert r['status'] == 'PASS'
    assert r['solidCount'] == 8
    assert len(r['unchangedSolidBoundsMm']) == 5
    assert len(r['mountingCentersMm']) == 4
    assert r['oldArtifact']['rawSha256'] != r['newArtifact']['rawSha256']
    assert r['strictGComponent'] == 'BLOCKED'


def test_new_primary_step_observations():
    report = load(ARTIFACTS.parent / 'correspondence.json')
    assert report['rootCause'] == 'C. V40_SOURCE_INTERPRETATION_ERROR'
    assert report['chiralityBlocker'] == 'RESOLVED'
    primary = report['primarySTEP']
    assert primary['actualImportedSolidCount'] == primary['validPositiveVolumeSolidCount'] == 2689
    assert primary['signedDirections'] == {'bank': [1, 0, 0], 'gpio': [0, 1, 0], 'components': [0, 0, 1]}
    assert primary['sourcePixelsOrVendorCADCopied'] is False


def test_actual_proper_board_and_source_pairings(board):
    r = correspondence.verify_board(ROOT, SOLUTIONS, ARTIFACTS, board)
    assert r['determinant'] == 1
    assert r['scale'] == [1, 1, 1]
    assert r['componentNormalWorld'] == [0, 0, 1]
    assert r['headerIndependentlyMoved'] is False
    assert r['actualHoleCount'] == 4
    assert r['supportCount'] == (4 if board['variantId'] == 'rpi5' else 2)
    assert max(p['radialResidualMm'] for p in r['mountResiduals']) < 1.5
    assert r['completeStep'] is False


@pytest.mark.parametrize('mutation', ['reflection', 'shear', 'negative-scale', 'upside-down', 'wrong-roll', 'translation', 'height', 'instance', 'missing', 'duplicate', 's01-drift', 'drop-input', 'forged-artifact', 'operations', 'connections', 'dof', 'engineering', 'runtime', 'complete', 'physical', 'sweep', 'recipe', 'accessory', 'header', 'blockers', 'measurement'])
def test_mutated_board_records_fail(board, mutation):
    s = copy.deepcopy(board)
    p = s['boardPose']
    if mutation == 'reflection': p['rotation'] = [[-1, 0, 0], [0, 1, 0], [0, 0, 1]]
    elif mutation == 'shear': p['rotation'][0][1] = .1
    elif mutation == 'negative-scale': s['scale'] = [-1, 1, 1]
    elif mutation == 'upside-down': p['rotation'] = [[1, 0, 0], [0, -1, 0], [0, 0, -1]]
    elif mutation == 'wrong-roll': p['rotation'] = [[0, -1, 0], [1, 0, 0], [0, 0, 1]]
    elif mutation == 'translation': p['translationMm'][0] += 1
    elif mutation == 'height': p['translationMm'][2] += 1
    elif mutation == 'instance': p['instanceId'] = 'PX-V40-INS-PI4-001'
    elif mutation == 'missing': s['after'].pop()
    elif mutation == 'duplicate': s['after'].append(copy.deepcopy(p))
    elif mutation == 's01-drift': s['before'][0]['translationMm'][0] += 1
    elif mutation == 'drop-input': s['inputBindings'].pop()
    elif mutation == 'forged-artifact': s['artifactBinding']['rawSha256'] = '0'*64
    elif mutation == 'operations': s['operationIds'].reverse()
    elif mutation == 'connections': s['connectionIds'].pop()
    elif mutation == 'dof': s['remainingDOF'] = ['rotationZ']
    elif mutation == 'engineering': s['engineeringAdmission'] = True
    elif mutation == 'runtime': s['runtimeAdmission'] = True
    elif mutation == 'complete': s['completeAssemblyOutput'] = True
    elif mutation == 'physical': s['claims']['physicalFit'] = 'PASS'
    elif mutation == 'sweep': s['claims']['installationSweep'] = 'PASS'
    elif mutation == 'recipe': s['recipe']['approachAxis'] = [1, 0, 0]
    elif mutation == 'accessory': s['accessoryStatus'] = 'installed via invented adapter'
    elif mutation == 'header': s['headerStatus'] = 'verified owner header'
    elif mutation == 'blockers': s['engineeringBlockerIds'] = []
    elif mutation == 'measurement': s['engineeringMeasurements'] = []
    # Keep duplicated board-pose references coherent so altered transforms reach
    # the independent source/determinant/residual checks, not only record equality.
    if mutation in ['reflection', 'shear', 'upside-down', 'wrong-roll', 'translation', 'height']:
        for item in s['after']:
            if item['instanceId'] == p['instanceId']:
                item.update(copy.deepcopy(p))
    with pytest.raises(Invalid):
        correspondence.verify_board(ROOT, SOLUTIONS, ARTIFACTS, s)


def test_actual_hat_and_camera_boundary():
    r = correspondence.downstream_boundary(ROOT)
    assert r['status'] == 'BLOCKED'
    assert r['blockers'][1]['actualPCBCylindricalHoleCount'] == 0
    assert len(r['blockers'][0]['pi5SchematicBlockBoundsMm']) == 2
