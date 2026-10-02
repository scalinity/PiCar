"""S04 Robot HAT mount: authored from the V40 review and the placed supports, re-measured from the adopted artifacts."""
import copy
import os
from pathlib import Path
import numpy as np
import pytest
from twin_cad.contracts import load, Invalid
from twin_cad.assemblies.instructional import hat, hat_verify


ROOT = Path(os.environ['PICAR_M7_ROOT'])
ARTIFACTS = Path(os.environ['PICAR_M7_REMEDIATION'])
WORK = ARTIFACTS.parent
ENGAGEMENT = WORK / 'engagement'
BOARDS = WORK / 'anchor/boards'
VARIANTS = ['rpi5', 'rpi-zero-2-w']
SCREWS = [f'PX-V40-INS-M25X6-SCREW-00{n}' for n in (5, 6, 7, 8)]
HAT = 'PX-V40-INS-ROBOT-HAT-001'


def previous(variant):
    return load(WORK / 'chain/closures' / f'{variant}-S03-closure.json')


@pytest.fixture(scope='module')
def records():
    return {v: hat.build(ROOT, v, previous(v), engagement=ENGAGEMENT) for v in VARIANTS}


def verify(record, variant=None):
    return hat_verify.verify(ROOT, record, previous(record['variantId']), engagement=ENGAGEMENT, artifacts=ARTIFACTS, boards=BOARDS)


def test_independent_oracle_is_installed_and_does_not_import_generator():
    assert 'site-packages' in str(Path(hat_verify.__file__).resolve())
    assert 'site-packages' in str(Path(hat.__file__).resolve())
    text = Path(hat_verify.__file__).read_text()
    assert 'from .hat import' not in text and 'import hat\n' not in text


def test_pi4_and_unknown_variants_are_refused():
    for variant in ['rpi4', 'pico']:
        with pytest.raises(Invalid):
            hat.build(ROOT, variant, previous('rpi5'), engagement=ENGAGEMENT)


def test_pi5_hat_rests_on_four_equal_supports_with_no_gap(records):
    result = verify(records['rpi5'])
    assert result['status'] == 'PASS' and result['engineeringAdmission'] is False and result['physicalFit'] == 'NOT_CLAIMED'
    assert abs(result['hatBottomMm'] - 39.6) < 1e-6 and result['gaps'] == []
    pose = next(p for p in records['rpi5']['placements'] if p['instanceId'] == HAT)
    board = next(p for p in previous('rpi5')['placements'] if p['instanceId'] == 'PX-V40-INS-PI5-001')
    assert pose['rotation'] == board['rotation'] == [[-1, 0, 0], [0, -1, 0], [0, 0, 1]]
    assert max(result['boreToSupportAxisMm']) < 1.0


def test_zero_hat_rests_on_the_highest_support_and_declares_the_height_gap_over_the_tall_posts(records):
    result = verify(records['rpi-zero-2-w'])
    assert abs(result['hatBottomMm'] - 32.6) < 1e-6
    assert sorted(g['standoffInstanceId'] for g in result['gaps']) == ['PX-V40-INS-M25X30-STANDOFF-001', 'PX-V40-INS-M25X30-STANDOFF-002']
    assert all(abs(g['gapMm'] - 0.6) < 1e-6 for g in result['gaps'])
    pose = next(p for p in records['rpi-zero-2-w']['placements'] if p['instanceId'] == HAT)
    assert pose['rotation'] == [[1, 0, 0], [0, 1, 0], [0, 0, 1]]


@pytest.mark.parametrize('variant', VARIANTS)
def test_socket_lies_over_the_board_header_and_touches_it_at_the_interface_plane(records, variant):
    result = verify(records[variant])
    assert abs(result['socketHeaderGapMm']) < 1e-6 and result['socketHeaderOverlapAreaMm2'] > 10


@pytest.mark.parametrize('variant', VARIANTS)
def test_each_screw_is_flipped_head_up_coaxial_with_its_named_standoff(records, variant):
    poses = {p['instanceId']: p for p in records[variant]['placements']}
    for s in SCREWS:
        assert poses[s]['rotation'] == [[1, 0, 0], [0, -1, 0], [0, 0, -1]]
    stacks = {s['fastenerInstanceId']: s['standoffInstanceId'] for s in records[variant]['stacks']}
    expected = ({SCREWS[0]: 'PX-V40-INS-M25X30-STANDOFF-001', SCREWS[1]: 'PX-V40-INS-M25X30-STANDOFF-002',
                 SCREWS[2]: 'PX-V40-INS-M25X18PLUS6-STANDOFF-001', SCREWS[3]: 'PX-V40-INS-M25X18PLUS6-STANDOFF-002'} if variant == 'rpi-zero-2-w'
                else {s: f'PX-V40-INS-M25X18-STANDOFF-00{i + 1}' for i, s in enumerate(SCREWS)})
    assert stacks == expected


def mutate(record, mutation):
    r = copy.deepcopy(record)
    pose = next(p for p in r['placements'] if p['instanceId'] == HAT)
    screw = next(p for p in r['placements'] if p['instanceId'] == SCREWS[0])
    other = next(p for p in r['placements'] if p['instanceId'] == SCREWS[1])
    if mutation == 'hat-rotated-180': pose['rotation'] = (np.diag([-1., -1., 1.]) @ np.array(pose['rotation'])).tolist()
    elif mutation == 'hat-mirrored': pose['rotation'] = [[1, 0, 0], [0, 1, 0], [0, 0, -1]]
    elif mutation == 'hat-shifted': pose['translationMm'][0] += 2.0
    elif mutation == 'hat-too-low': pose['translationMm'][2] -= 1.0
    elif mutation == 'hat-too-high': pose['translationMm'][2] += 1.0
    elif mutation == 'screws-swapped': screw['translationMm'], other['translationMm'] = other['translationMm'], screw['translationMm']
    elif mutation == 'screw-upside-down': screw['rotation'] = [[1, 0, 0], [0, 1, 0], [0, 0, 1]]
    elif mutation == 'screw-floating': screw['translationMm'][2] += 1.0
    elif mutation == 'screw-missing': r['placements'].remove(screw)
    elif mutation == 'engineering-promotion': r['engineeringAdmission'] = True
    elif mutation == 'limitation-removed': r['limitations'].pop()
    elif mutation == 'binding-drift': r['inputBindings'][0]['rawSha256'] = '0' * 64
    elif mutation == 'sweep-claim': r['claims']['installationSweep'] = 'PASS'
    elif mutation == 'gap-undeclared': r['hatHeight']['gaps'] = []
    elif mutation == 'gap-inflated': r['gapBudgetMm'] = 5.0
    return r


REASON = {'hat-rotated-180': 'HAT_ORIENTATION', 'hat-mirrored': 'PROPER_ROTATION', 'hat-shifted': 'HAT_POSITION_NOT_FIT', 'hat-too-low': 'HAT_HEIGHT',
          'hat-too-high': 'HAT_HEIGHT', 'screws-swapped': 'SCREW_NOT_COAXIAL_WITH_STANDOFF', 'screw-upside-down': 'SCREW_POLARITY',
          'screw-floating': 'SCREW_NOT_SEATED_ON_HAT', 'screw-missing': 'EXACT_SEMANTIC_OWNERSHIP', 'engineering-promotion': 'ENGINEERING_FIREWALL',
          'limitation-removed': 'LIMITATION_REMOVAL', 'binding-drift': 'INPUT_BYTES_CHANGED', 'sweep-claim': 'UNTESTED_CLAIM',
          'gap-undeclared': 'HAT_GAP_MISMATCH', 'gap-inflated': 'HAT_GAP_BUDGET'}


@pytest.mark.parametrize('mutation', sorted(REASON))
@pytest.mark.parametrize('variant', VARIANTS)
def test_corrupted_mount_is_rejected(records, variant, mutation):
    if mutation == 'gap-undeclared' and variant == 'rpi5':
        pytest.skip('the Pi5 supports are equal; there is no gap to declare')
    with pytest.raises(Invalid, match=REASON[mutation]):
        verify(mutate(records[variant], mutation))
