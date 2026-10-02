"""S06 hook-and-loop preparation and S07 battery mount: authored records re-measured by independent modules."""
import copy
import os
from pathlib import Path
import pytest
from twin_cad.contracts import load, Invalid
from twin_cad.assemblies.instructional import step06, step06_verify, step07, step07_verify


ROOT = Path(os.environ['PICAR_M7_ROOT'])
WORK = Path(os.environ['PICAR_M7_REMEDIATION']).parent
VARIANTS = ['rpi5', 'rpi-zero-2-w']
BATTERY = 'PX-V40-INS-BATTERY-001'


def closure(variant, number):
    return load(WORK / 'chain/closures' / f'{variant}-S{number:02d}-closure.json')


@pytest.fixture(scope='module')
def s06():
    return {v: step06.build(ROOT, v, closure(v, 5)) for v in VARIANTS}


@pytest.fixture(scope='module')
def s07():
    return {v: step07.build(ROOT, v, closure(v, 6)) for v in VARIANTS}


def test_independent_oracles_are_installed_and_do_not_import_their_generators():
    for module, generator, name in [(step06_verify, step06, 'step06'), (step07_verify, step07, 'step07')]:
        assert 'site-packages' in str(Path(module.__file__).resolve()) and 'site-packages' in str(Path(generator.__file__).resolve())
        text = Path(module.__file__).read_text()
        assert f'from .{name} import' not in text and f'import {name}\n' not in text


def test_pi4_and_unknown_variants_are_refused():
    for variant in ['rpi4', 'pico']:
        with pytest.raises(Invalid):
            step06.build(ROOT, variant, closure('rpi5', 5))
        with pytest.raises(Invalid):
            step07.build(ROOT, variant, closure('rpi5', 6))


@pytest.mark.parametrize('variant', VARIANTS)
def test_s06_installs_no_solid_and_records_the_two_zero_solid_tape_applications(s06, variant):
    result = step06_verify.verify(ROOT, s06[variant], closure(variant, 5))
    assert result['status'] == 'PASS' and result['batteryLocation'] == 'tray' and result['consumables'] == 2
    assert s06[variant]['placements'] == [] and s06[variant]['recipes'] == []
    assert [c['pieceInstanceId'] for c in s06[variant]['consumables']] == ['PX-V40-INS-HOOK-002', 'PX-V40-INS-LOOP-002']


def mutate06(record, mutation):
    r = copy.deepcopy(record)
    if mutation == 'battery-given-a-pose':
        r['placements'].append({'instanceId': BATTERY, 'translationMm': [0., 0., 0.], 'rotation': [[1, 0, 0], [0, 1, 0], [0, 0, 1]], 'featureRef': 'x', 'role': 'battery'})
    elif mutation == 'battery-claimed-installed': r['batteryLocation'] = 'assembly'
    elif mutation == 'tape-target-swapped': r['consumables'][0]['endpoints'].reverse()
    elif mutation == 'tape-dropped': r['consumables'].pop()
    elif mutation == 'recipe-invented': r['recipes'].append({'instanceId': BATTERY})
    elif mutation == 'engineering-promotion': r['engineeringAdmission'] = True
    elif mutation == 'limitation-removed': r['limitations'].pop()
    elif mutation == 'binding-drift': r['inputBindings'][0]['rawSha256'] = '0' * 64
    return r


REASON06 = {'battery-given-a-pose': 'NO_SOLID_IS_INSTALLED', 'battery-claimed-installed': 'BATTERY_STAYS_OFF_THE_CHASSIS', 'tape-target-swapped': 'EXACT_SEMANTIC_OWNERSHIP',
            'tape-dropped': 'EXACT_SEMANTIC_OWNERSHIP', 'recipe-invented': 'NO_SOLID_IS_INSTALLED', 'engineering-promotion': 'ENGINEERING_FIREWALL',
            'limitation-removed': 'LIMITATION_REMOVAL', 'binding-drift': 'INPUT_BYTES_CHANGED'}


@pytest.mark.parametrize('mutation', sorted(REASON06))
@pytest.mark.parametrize('variant', VARIANTS)
def test_corrupted_s06_is_rejected(s06, variant, mutation):
    with pytest.raises(Invalid, match=REASON06[mutation]):
        step06_verify.verify(ROOT, mutate06(s06[variant], mutation), closure(variant, 5))


@pytest.mark.parametrize('variant', VARIANTS)
def test_s07_battery_rests_on_the_deck_underside_between_the_flange_tabs_against_the_gearboxes(s07, variant):
    result = step07_verify.verify(ROOT, s07[variant], closure(variant, 6))
    assert result['status'] == 'PASS' and result['physicalFit'] == 'NOT_CLAIMED'
    pose = s07[variant]['placements'][0]
    # Hand derivation: motor gearbox front faces at X=51, tab inner faces at Y=18 and -17 (centre 0.5), deck underside Z=0.
    assert pose['translationMm'] == [51.0, -18.5, -20.0] and pose['rotation'] == [[1, 0, 0], [0, 1, 0], [0, 0, 1]]
    assert result['batteryBoundsMm'] == [51.0, -18.5, -20.0, 121.0, 19.5, 0.0]
    # The honest tension, stated plainly: 38 mm of battery between a traced 35 mm gap.
    assert abs(result['flangeGapMm'] - 35.0) < 1e-9 and result['batteryWidthMm'] == 38.0
    assert s07[variant]['endpointFrames'] == []


def mutate07(record, mutation):
    r = copy.deepcopy(record)
    pose = r['placements'][0]
    if mutation == 'rotated-quarter-turn': pose['rotation'] = [[0, -1, 0], [1, 0, 0], [0, 0, 1]]
    elif mutation == 'sunk-into-deck': pose['translationMm'][2] += 1.0
    elif mutation == 'hanging-below-deck': pose['translationMm'][2] -= 1.0
    elif mutation == 'off-centre': pose['translationMm'][1] += 1.0
    elif mutation == 'pushed-forward': pose['translationMm'][0] += 1.0
    elif mutation == 'frame-invented': r['endpointFrames'].append({'connectionId': 'PX-V40-CONN-07-COMMON-BATTERY'})
    elif mutation == 'second-solid': r['placements'].append({**pose, 'instanceId': 'PX-V40-INS-WRENCH-001'})
    elif mutation == 'engineering-promotion': r['engineeringAdmission'] = True
    elif mutation == 'limitation-removed': r['limitations'].pop()
    elif mutation == 'sweep-claim': r['claims']['installationSweep'] = 'PASS'
    elif mutation == 'staged-wrong-distance': r['recipes'][0]['approachDistanceMm'] += 5
    return r


REASON07 = {'rotated-quarter-turn': 'BATTERY_LONG_AXIS_ALONG_THE_CAR', 'sunk-into-deck': 'BATTERY_TOP_NOT_ON_DECK_UNDERSIDE', 'hanging-below-deck': 'BATTERY_TOP_NOT_ON_DECK_UNDERSIDE',
            'off-centre': 'BATTERY_NOT_CENTRED_BETWEEN_FLANGES', 'pushed-forward': 'BATTERY_NOT_AT_NEAREST_CLEAR_POSITION', 'frame-invented': 'EXACT_SEMANTIC_OWNERSHIP',
            'second-solid': 'EXACT_SEMANTIC_OWNERSHIP', 'engineering-promotion': 'ENGINEERING_FIREWALL', 'limitation-removed': 'LIMITATION_REMOVAL',
            'sweep-claim': 'UNTESTED_CLAIM', 'staged-wrong-distance': 'STAGED_START'}


@pytest.mark.parametrize('mutation', sorted(REASON07))
@pytest.mark.parametrize('variant', VARIANTS)
def test_corrupted_s07_is_rejected(s07, variant, mutation):
    with pytest.raises(Invalid, match=REASON07[mutation]):
        step07_verify.verify(ROOT, mutate07(s07[variant], mutation), closure(variant, 6))
