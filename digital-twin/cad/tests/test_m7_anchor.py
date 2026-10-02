"""Installed source anchor and its part-local aliases; old observations retained."""
import copy
import os
from pathlib import Path
import pytest
from twin_cad.contracts import load, Invalid
from twin_cad.assemblies.instructional import anchor_verify, anchor_correspondence


ROOT = Path(os.environ['PICAR_M7_ROOT'])
ARTIFACTS = Path(os.environ['PICAR_M7_REMEDIATION'])
SOLUTIONS = ARTIFACTS.parent / 'anchor/solutions'
BOARDS = ARTIFACTS.parent / 'anchor/boards'


@pytest.fixture(params=['rpi5', 'rpi-zero-2-w'])
def solution(request):
    return load(SOLUTIONS / (request.param + '-S01.json'))


def test_installed_source_oracle():
    assert 'site-packages' in str(Path(anchor_verify.__file__).resolve())
    assert 'anchor_generate' not in Path(anchor_verify.__file__).read_text().split('def verify')[0]


def test_flange_down_and_independent_actual_holes(solution):
    r = anchor_verify.verify(ROOT, solution)
    assert r['pairChecks'] == 36 and not r['forbiddenPenetrations']
    plate = next(p for p in solution['after'] if p['role'] == 'workpiece')
    assert plate['rotation'] == [[1, 0, 0], [0, -1, 0], [0, 0, -1]]
    assert plate['translationMm'] == [0, 0, 2]
    if solution['variantId'] == 'rpi-zero-2-w':
        for p in solution['after']:
            if 'M25X11-STANDOFF' in p['instanceId']: assert p['translationMm'][1] > 0
            if 'M25X30-STANDOFF' in p['instanceId']: assert p['translationMm'][1] < 0


@pytest.mark.parametrize('mutation', ['old-identity', 'reflection', 'height', 'alias-side', 'missing', 'duplicate', 'support-polarity', 'all-coherent-shift'])
def test_anchor_or_feature_corruption_rejected(solution, mutation):
    r = copy.deepcopy(solution)
    plate = next(p for p in r['after'] if p['role'] == 'workpiece')
    if mutation == 'old-identity': plate['rotation'] = [[1, 0, 0], [0, 1, 0], [0, 0, 1]]
    elif mutation == 'reflection': plate['rotation'] = [[1, 0, 0], [0, 1, 0], [0, 0, -1]]
    elif mutation == 'height': plate['translationMm'][2] += 1
    elif mutation == 'alias-side':
        p = next(p for p in r['after'] if p['role'] == 'standoff')
        p['translationMm'][1] *= -1
    elif mutation == 'missing': r['after'].pop()
    elif mutation == 'duplicate': r['after'].append(copy.deepcopy(plate))
    elif mutation == 'support-polarity': next(p for p in r['after'] if p['role'] == 'standoff')['rotation'] = [[1, 0, 0], [0, -1, 0], [0, 0, -1]]
    elif mutation == 'all-coherent-shift':
        for p in r['after']: p['translationMm'][0] += 1
        for p in r['recipes']: p['stagedStart']['translationMm'][0] += 1
    with pytest.raises(Invalid): anchor_verify.verify(ROOT, r)


def test_separate_corrected_board_candidates(solution):
    r = anchor_correspondence.verify_board(ROOT, SOLUTIONS, ARTIFACTS, load(BOARDS / (solution['variantId'] + '-S02-board.json')))
    assert r['determinant'] == 1 and not r['completeStep']
    assert max(p['radialResidualMm'] for p in r['mountResiduals']) < 1.5


def test_scoped_zero_header_actual_revision():
    r=anchor_correspondence.verify_zero(ROOT,BOARDS)
    assert r['validPositiveSolids']==6 and r['unchangedSolids']==5 and r['Q14']=='UNRESOLVED'


@pytest.mark.parametrize('mutation',['old-header','moved-pcb','reflected-board'])
def test_actual_zero_geometry_corruption(tmp_path,mutation):
    import cadquery as cq
    import rfc8785
    from twin_cad.assemblies.instructional.verify import digest
    record=load(BOARDS/'zero-header-candidate.json')
    original=cq.Shape.importBrep(str(BOARDS/anchor_correspondence.ZERO))
    if mutation=='old-header': shape=cq.Shape.importBrep(str(ROOT/record['oldArtifact']['path']))
    elif mutation=='reflected-board': shape=original.mirror('YZ')
    else:
        solids=original.Solids()
        i=next(i for i,s in enumerate(solids) if abs(s.BoundingBox().zlen-1.6)<1e-6)
        solids[i]=solids[i].translate((0.1,0,0))
        shape=cq.Compound.makeCompound(solids)
    shape.exportBrep(str(tmp_path/anchor_correspondence.ZERO))
    record['artifact']=digest(tmp_path,anchor_correspondence.ZERO)
    (tmp_path/'zero-header-candidate.json').write_bytes(rfc8785.dumps(record)+b'\n')
    with pytest.raises(Invalid): anchor_correspondence.verify_zero(ROOT,tmp_path)
