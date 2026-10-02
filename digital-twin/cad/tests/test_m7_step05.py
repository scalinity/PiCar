"""S05 drive motors: authored from the V40 review and the placed Plate A, re-measured from the placed solids."""
import copy
import os
from pathlib import Path
import numpy as np
import pytest
from twin_cad.contracts import load, Invalid
from twin_cad.assemblies.instructional import step05, step05_verify


ROOT = Path(os.environ['PICAR_M7_ROOT'])
WORK = Path(os.environ['PICAR_M7_REMEDIATION']).parent
VARIANTS = ['rpi5', 'rpi-zero-2-w']
LEFT, RIGHT = 'PX-V40-INS-MOTOR-LEFT-001', 'PX-V40-INS-MOTOR-RIGHT-001'


def previous(variant):
    return load(WORK / 'chain/closures' / f'{variant}-S04-closure.json')


@pytest.fixture(scope='module')
def records():
    return {v: step05.build(ROOT, v, previous(v)) for v in VARIANTS}


def verify(record):
    return step05_verify.verify(ROOT, record, previous(record['variantId']))


def test_independent_oracle_is_installed_and_does_not_import_generator():
    assert 'site-packages' in str(Path(step05_verify.__file__).resolve())
    assert 'site-packages' in str(Path(step05.__file__).resolve())
    text = Path(step05_verify.__file__).read_text()
    assert 'from .step05 import' not in text and 'import step05\n' not in text


def test_pi4_and_unknown_variants_are_refused():
    for variant in ['rpi4', 'pico']:
        with pytest.raises(Invalid):
            step05.build(ROOT, variant, previous('rpi5'))


@pytest.mark.parametrize('variant', VARIANTS)
def test_motors_sit_inside_the_rear_flanges_with_shafts_out_and_cans_rearward(records, variant):
    result = verify(records[variant])
    assert result['status'] == 'PASS' and result['physicalFit'] == 'NOT_CLAIMED' and result['engineeringAdmission'] is False
    poses = {p['instanceId']: p for p in records[variant]['placements']}
    # Hand derivation: shaft hole at X=41,Z=-12 with shaft at local (10, 9.5); inner flange faces Y=+36.5 (left) and Y=-36 (right).
    assert poses[LEFT]['translationMm'] == [51.0, 16.5, -2.5] and poses[RIGHT]['translationMm'] == [51.0, -36.0, -2.5]
    assert poses[LEFT]['rotation'] == poses[RIGHT]['rotation'] == [[-1, 0, 0], [0, 1, 0], [0, 0, -1]]
    assert all(m['shaftAxisResidualMm'] < 1e-6 and m['flushResidualMm'] < 1e-6 for m in result['motors'])


@pytest.mark.parametrize('variant', VARIANTS)
def test_each_stack_is_a_closed_25_point_2_mm_pile_with_the_screw_tip_inside_the_nut(records, variant):
    result = verify(records[variant])
    assert len(result['stacks']) == 4
    for s in result['stacks']:
        assert abs(s['stackLengthMm'] - 25.2) < 1e-6 and abs(s['screwTipInNutMm'] - 2.2) < 1e-6
    poses = {p['instanceId']: p for p in records[variant]['placements']}
    assert poses['PX-V40-INS-M3X25-SCREW-001']['translationMm'] == [20.0, 38.5, -4.0]
    assert poses['PX-V40-INS-M3X25-SCREW-002']['translationMm'] == [20.0, 38.5, -21.0]
    assert poses['PX-V40-INS-M3X25-SCREW-003']['translationMm'] == [20.0, -38.0, -4.0]
    assert poses['PX-V40-INS-M3X25-SCREW-004']['translationMm'] == [20.0, -38.0, -21.0]


def mutate(record, mutation):
    r = copy.deepcopy(record)
    poses = {p['instanceId']: p for p in r['placements']}
    left, screw1, screw3 = poses[LEFT], poses['PX-V40-INS-M3X25-SCREW-001'], poses['PX-V40-INS-M3X25-SCREW-003']
    washer1, nut1 = poses['PX-V40-INS-SPRING-WASHER-001'], poses['PX-V40-INS-M3-NUT-001']
    if mutation == 'can-forward':
        # Coherent: shaft stays on its hole and flush, only the can swings to the front (identity rotation, shaft root re-seated).
        left['rotation'] = [[1, 0, 0], [0, 1, 0], [0, 0, 1]]
        left['translationMm'] = [31.0, 16.5, -21.5]
    elif mutation == 'shaft-inward': left['rotation'] = [[-1, 0, 0], [0, -1, 0], [0, 0, 1]]
    elif mutation == 'reflection': left['rotation'] = [[-1, 0, 0], [0, 1, 0], [0, 0, 1]]
    elif mutation == 'shaft-off-hole': left['translationMm'][2] += 1.0
    elif mutation == 'not-flush': left['translationMm'][1] -= 0.5
    elif mutation == 'sides-swapped': r['sides'][LEFT], r['sides'][RIGHT] = 'right', 'left'
    elif mutation == 'screw-in-other-flange': screw1['translationMm'], screw3['translationMm'] = screw3['translationMm'], screw1['translationMm']
    elif mutation == 'screw-head-inside': screw1['translationMm'][1] -= 2.0
    elif mutation == 'washer-moved': washer1['translationMm'][1] += 0.5
    elif mutation == 'nut-moved': nut1['translationMm'][1] -= 0.5
    elif mutation == 'nut-missing': r['placements'].remove(nut1)
    elif mutation == 'engineering-promotion': r['engineeringAdmission'] = True
    elif mutation == 'limitation-removed': r['limitations'].pop()
    elif mutation == 'binding-drift': r['inputBindings'][0]['rawSha256'] = '0' * 64
    elif mutation == 'sweep-claim': r['claims']['installationSweep'] = 'PASS'
    elif mutation == 'staged-wrong-distance': r['recipes'][0]['approachDistanceMm'] += 5
    return r


REASON = {'can-forward': 'MOTOR_CAN_DIRECTION', 'shaft-inward': 'SHAFT_NOT_OUTWARD|MOTOR_NOT_FLUSH|SHAFT_NOT_COAXIAL', 'reflection': 'PROPER_ROTATION',
          'shaft-off-hole': 'SHAFT_NOT_COAXIAL_WITH_FLANGE_HOLE', 'not-flush': 'MOTOR_NOT_FLUSH_WITH_FLANGE', 'sides-swapped': 'MOTOR_SIDE',
          'screw-in-other-flange': 'SCREW_HEAD_NOT_ON_OUTER_FACE', 'screw-head-inside': 'SCREW_HEAD_NOT_ON_OUTER_FACE', 'washer-moved': 'STACK_ORDER_OR_CONTACT',
          'nut-moved': 'STACK_ORDER_OR_CONTACT', 'nut-missing': 'EXACT_SEMANTIC_OWNERSHIP', 'engineering-promotion': 'ENGINEERING_FIREWALL',
          'limitation-removed': 'LIMITATION_REMOVAL', 'binding-drift': 'INPUT_BYTES_CHANGED', 'sweep-claim': 'UNTESTED_CLAIM', 'staged-wrong-distance': 'STAGED_START'}


@pytest.mark.parametrize('mutation', sorted(REASON))
@pytest.mark.parametrize('variant', VARIANTS)
def test_corrupted_motor_step_is_rejected(records, variant, mutation):
    with pytest.raises(Invalid, match=REASON[mutation]):
        verify(mutate(records[variant], mutation))
