"""S08 pan horn: authored from the V40 review and the placed Plate A, re-measured from the placed solids."""
import copy
import os
from pathlib import Path
import pytest
from twin_cad.contracts import load, Invalid
from twin_cad.assemblies.instructional import step08, step08_verify


ROOT = Path(os.environ['PICAR_M7_ROOT'])
WORK = Path(os.environ['PICAR_M7_REMEDIATION']).parent
VARIANTS = ['rpi5', 'rpi-zero-2-w']
HORN = 'PX-V40-INS-HORN-PAN-001'
SCREWS = [f'PX-V40-INS-M15X3-SCREW-00{n}' for n in (1, 2, 3, 4)]


def previous(variant):
    return load(WORK / 'chain/closures' / f'{variant}-S07-closure.json')


@pytest.fixture(scope='module')
def records():
    return {v: step08.build(ROOT, v, previous(v)) for v in VARIANTS}


def verify(record):
    return step08_verify.verify(ROOT, record, previous(record['variantId']))


def test_independent_oracle_is_installed_and_does_not_import_generator():
    assert 'site-packages' in str(Path(step08_verify.__file__).resolve()) and 'site-packages' in str(Path(step08.__file__).resolve())
    text = Path(step08_verify.__file__).read_text()
    assert 'from .step08 import' not in text and 'import step08\n' not in text


def test_pi4_and_unknown_variants_are_refused():
    for variant in ['rpi4', 'pico']:
        with pytest.raises(Invalid):
            step08.build(ROOT, variant, previous('rpi5'))


@pytest.mark.parametrize('variant', VARIANTS)
def test_horn_hangs_under_the_deck_on_the_pan_hole_and_four_screws_enter_from_above(records, variant):
    result = verify(records[variant])
    assert result['status'] == 'PASS' and result['physicalFit'] == 'NOT_CLAIMED' and result['hubAxisResidualMm'] < 1e-6
    poses = {p['instanceId']: p for p in records[variant]['placements']}
    # Hand derivation: pan hole at plate-local (167.311, -0.387) -> installed y +0.387; the revised horn has its hub at the local origin, arm along Y; plate top (2.2 mm thick) on Z=0.
    assert poses[HORN]['rotation'] == [[0, -1, 0], [1, 0, 0], [0, 0, 1]]
    assert abs(poses[HORN]['translationMm'][0] - 167.31141199226306) < 1e-9 and abs(poses[HORN]['translationMm'][1] - 0.3868471953578337) < 1e-9
    assert poses[HORN]['translationMm'][2] == pytest.approx(-2.2)
    assert [s['tipDepthIntoHornMm'] for s in result['screws']] == pytest.approx([1.0] * 4)
    assert all(poses[s]['translationMm'][2] == 2.0 and poses[s]['rotation'] == [[1, 0, 0], [0, -1, 0], [0, 0, -1]] for s in SCREWS)
    ys = [poses[s]['translationMm'][1] for s in SCREWS]
    assert ys == sorted(ys, reverse=True) and ys[0] > 0 > ys[-1]


def mutate(record, mutation):
    r = copy.deepcopy(record)
    poses = {p['instanceId']: p for p in r['placements']}
    horn, screw = poses[HORN], poses[SCREWS[0]]
    if mutation == 'horn-off-hole': horn['translationMm'][0] += 1.0
    elif mutation == 'horn-above-deck': horn['translationMm'][2] += 2.0
    elif mutation == 'horn-sunk-into-deck': horn['translationMm'][2] += 1.0
    elif mutation == 'horn-turned-fore-aft':
        # Coherent: the hub stays exactly on its hole, only the arm swings from across the car to fore-aft.
        hx, hy = horn['translationMm'][0], horn['translationMm'][1]
        horn['rotation'], horn['translationMm'] = [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [hx, hy, horn['translationMm'][2]]
    elif mutation == 'horn-hub-down': horn['rotation'] = [[0, 1, 0], [1, 0, 0], [0, 0, -1]]  # proper, hub on its hole, flipped over
    elif mutation == 'reflection': horn['rotation'] = [[0, -1, 0], [1, 0, 0], [0, 0, -1]]
    elif mutation == 'screw-off-hole': screw['translationMm'][1] += 0.5
    elif mutation == 'screw-upside-down': screw['rotation'] = [[1, 0, 0], [0, 1, 0], [0, 0, 1]]
    elif mutation == 'screw-floating': screw['translationMm'][2] += 1.0
    elif mutation == 'screw-missing': r['placements'].remove(screw)
    elif mutation == 'engineering-promotion': r['engineeringAdmission'] = True
    elif mutation == 'limitation-removed': r['limitations'].pop()
    elif mutation == 'binding-drift': r['inputBindings'][0]['rawSha256'] = '0' * 64
    elif mutation == 'sweep-claim': r['claims']['installationSweep'] = 'PASS'
    elif mutation == 'staged-wrong-distance': r['recipes'][0]['approachDistanceMm'] += 5
    return r


REASON = {'horn-off-hole': 'HUB_NOT_COAXIAL_WITH_PAN_HOLE', 'horn-above-deck': 'HORN_NOT_ON_DECK_UNDERSIDE', 'horn-sunk-into-deck': 'HORN_NOT_ON_DECK_UNDERSIDE',
          'horn-turned-fore-aft': 'HORN_ARM_ACROSS_THE_CAR_HUB_UP', 'horn-hub-down': 'HORN_NOT_ON_DECK_UNDERSIDE|HORN_ARM_ACROSS_THE_CAR_HUB_UP',
          'reflection': 'PROPER_ROTATION', 'screw-off-hole': 'SCREW_NOT_COAXIAL_WITH_DECK_HOLE', 'screw-upside-down': 'SCREW_HEAD_NOT_ON_DECK_TOP|SCREW_TIP_NOT_IN_HORN',
          'screw-floating': 'SCREW_HEAD_NOT_ON_DECK_TOP', 'screw-missing': 'EXACT_SEMANTIC_OWNERSHIP', 'engineering-promotion': 'ENGINEERING_FIREWALL',
          'limitation-removed': 'LIMITATION_REMOVAL', 'binding-drift': 'INPUT_BYTES_CHANGED', 'sweep-claim': 'UNTESTED_CLAIM', 'staged-wrong-distance': 'STAGED_START'}


@pytest.mark.parametrize('mutation', sorted(REASON))
@pytest.mark.parametrize('variant', VARIANTS)
def test_corrupted_horn_step_is_rejected(records, variant, mutation):
    with pytest.raises(Invalid, match=REASON[mutation]):
        verify(mutate(records[variant], mutation))
