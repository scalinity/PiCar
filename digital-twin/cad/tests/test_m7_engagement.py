"""Independent upper-bearing and actual HAT feature adversarial qualification."""
import copy
import os
from pathlib import Path
import cadquery as cq
import pytest
from twin_cad.contracts import load, Invalid
from twin_cad.assemblies.instructional import engagement, engagement_verify


ROOT = Path(os.environ['PICAR_M7_ROOT'])
SOLUTIONS = Path(os.environ['PICAR_M7_REMEDIATION']).parent / 'anchor/solutions'
BOARDS = Path(os.environ['PICAR_M7_REMEDIATION']).parent / 'anchor/boards'
ARTIFACTS = Path(os.environ['PICAR_M7_REMEDIATION'])
NEW = ARTIFACTS.parent / 'engagement'


@pytest.fixture(params=['rpi5', 'rpi-zero-2-w'])
def record(request):
    return load(NEW / (request.param + '-S02-uppers.json'))


def test_installed_independent_oracle():
    assert 'site-packages' in str(Path(engagement_verify.__file__).resolve())
    assert 'site-packages' in str(Path(engagement.__file__).resolve())
    assert 'from .engagement import' not in Path(engagement_verify.__file__).read_text()


def test_actual_stacks_and_whole_part_polarity(record):
    result = engagement_verify.supports(ROOT, SOLUTIONS, ARTIFACTS, BOARDS, record)
    assert result['upperSupportCount'] == (4 if record['variantId'] == 'rpi5' else 2)
    assert all(r['bearingResidualMm'] < 1e-10 for r in result['residuals'])
    assert result['pairChecks'] == (91 if record['variantId'] == 'rpi5' else 66)
    assert result['unresolvedInstances'] == (['PX-V40-INS-USB-MICROPHONE-001'] if record['variantId'] == 'rpi5' else [])
    assert not result['forbiddenPenetrations']
    assert result['unresolvedClearances']
    assert result['physicalFit'] == result['installationSweep'] == 'BLOCKED'
    assert result['completeStep'] is False


@pytest.mark.parametrize('mutation', ['reflection', 'shear', 'polarity', 'roll', 'translation', 'height', 'duplicate', 'missing', 'context-drift', 'operation', 'stack-order', 'anchor', 'approach', 'staged-drift', 'dof', 'scale', 'engineering', 'runtime', 'complete', 'fit', 'sweep', 'engagement', 'input', 'blockers', 'header', 'accessory', 'unknown-field'])
def test_corrupted_stack_fails(record, mutation):
    r = copy.deepcopy(record)
    p = next(p for p in r['after'] if p.get('role') == 'upperStandoff')
    recipe = next(p for p in r['recipes'] if p['instanceId'] == p['stagedStart']['instanceId'])
    if mutation == 'reflection': p['rotation'] = [[-1, 0, 0], [0, 1, 0], [0, 0, 1]]
    elif mutation == 'shear': p['rotation'][0][1] = .1
    elif mutation == 'polarity': p['rotation'] = [[1, 0, 0], [0, -1, 0], [0, 0, -1]] if record['variantId'] == 'rpi5' else [[1, 0, 0], [0, 1, 0], [0, 0, 1]]
    elif mutation == 'roll': p['rotation'] = [[-1, 0, 0], [0, -1, 0], [0, 0, 1]]
    elif mutation == 'translation': p['translationMm'][0] += .1
    elif mutation == 'height': p['translationMm'][2] += .1
    elif mutation == 'duplicate': r['after'].append(copy.deepcopy(p))
    elif mutation == 'missing': r['after'].remove(p)
    elif mutation == 'context-drift': r['before'][0]['translationMm'][0] += 1
    elif mutation == 'operation': r['operationIds'].reverse()
    elif mutation == 'stack-order': recipe['orderedContactStack'].reverse()
    elif mutation == 'anchor': recipe['anchor']['instanceId'] = 'PX-V40-INS-PLATE-A-001'
    elif mutation == 'approach': recipe['approachAxis'] = [0, 0, 1]
    elif mutation == 'staged-drift': recipe['stagedStart']['translationMm'][2] += 1
    elif mutation == 'dof': r['remainingDOF'] = ['rotationZ']
    elif mutation == 'scale': r['scale'] = [-1, 1, 1]
    elif mutation == 'engineering': r['engineeringAdmission'] = True
    elif mutation == 'runtime': r['runtimeAdmission'] = True
    elif mutation == 'complete': r['completeAssemblyOutput'] = True
    elif mutation in ['fit', 'sweep', 'engagement']: r['claims'][{'fit': 'physicalFit', 'sweep': 'installationSweep', 'engagement': 'physicalEngagement'}[mutation]] = 'PASS'
    elif mutation == 'input': r['inputBindings'].pop()
    elif mutation == 'blockers': r['engineeringBlockerIds'] = []
    elif mutation == 'header': r['headerStatus'] = 'verified header'
    elif mutation == 'accessory': r['accessoryStatus'] = 'installed generic adapter'
    elif mutation == 'unknown-field': r['engineeringMeasurements'] = []
    # Corrupt the pose coherently in both the final and staged records. The
    # independent actual bearing/source check must detect it, not duplicate data.
    if mutation in ['reflection', 'shear', 'polarity', 'roll', 'translation', 'height']:
        for item in r['recipes']:
            if item['instanceId'] == p['instanceId']:
                item['stagedStart'] = copy.deepcopy(p)
                item['stagedStart']['translationMm'][2] += 30
    with pytest.raises(Invalid):
        engagement_verify.supports(ROOT, SOLUTIONS, ARTIFACTS, BOARDS, r)


def test_actual_hat_bores_open_socket_and_access_boundary():
    r = engagement_verify.hat(ROOT, NEW)
    assert r['actualBoreCount'] == 4 and r['unchangedTopSolids'] == 10
    assert r['socketUnderside'] and r['socketOpenMouth']
    assert r['solidCount'] == 12 and r['stockItemIncrement'] == 0
    assert not r['mountingAccessObstructions'] and r['mountingAccess'] == 'UNRESOLVED'
    assert r['installedMating'] == r['physicalFit'] == 'BLOCKED'


@pytest.mark.parametrize('mutation', ['old-unpierced-shape', 'filled-mouth', 'flipped-socket'])
def test_actual_hat_geometry_mutants_fail(tmp_path, mutation):
    import rfc8785
    from twin_cad.assemblies.instructional.verify import digest
    r = load(NEW / 'hat-feature-candidate.json')
    original = cq.Shape.importBrep(str(NEW / engagement_verify.HAT))
    if mutation == 'old-unpierced-shape':
        shape = cq.Shape.importBrep(str(ROOT / r['oldArtifact']['path']))
    else:
        solids = original.Solids()
        i = next(i for i, s in enumerate(solids) if s.BoundingBox().zmin < -1)
        if mutation == 'filled-mouth': solids[i] = cq.Solid.makeBox(51, 5, 10, cq.Vector(6.8, 47.6, -10))
        else: solids[i] = solids[i].rotate((0, 0, 0), (1, 0, 0), 180)
        shape = cq.Compound.makeCompound(solids)
    shape.exportBrep(str(tmp_path / engagement_verify.HAT))
    # Bind the altered bytes, so rejection relies on shape features.
    r['artifact'] = digest(tmp_path, engagement_verify.HAT)
    (tmp_path / 'hat-feature-candidate.json').write_bytes(rfc8785.dumps(r) + b'\n')
    with pytest.raises(Invalid):
        engagement_verify.hat(ROOT, tmp_path)
