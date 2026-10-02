"""S09 ultrasonic module, Plate H and rivets: record-level checks against the supplied-hardware revisions, plus the open closure blocker."""
import copy
import os
import re
from pathlib import Path
import pytest
from twin_cad.contracts import load, Invalid
from twin_cad.assemblies.instructional import step09, step09_verify


ROOT = Path(os.environ['PICAR_M7_ROOT'])
WORK = Path(os.environ['PICAR_M7_REMEDIATION']).parent
VARIANTS = ['rpi5', 'rpi-zero-2-w']
MODULE, PLATE_H = 'PX-V40-INS-ULTRASONIC-001', 'PX-V40-INS-PLATE-H-001'
RIVETS = ['PX-V40-INS-R3080-RIVET-001', 'PX-V40-INS-R3080-RIVET-002']


def previous(variant):
    return load(WORK / 'chain/closures' / f'{variant}-S08-closure.json')


@pytest.fixture(scope='module')
def records():
    return {v: step09.build(ROOT, v, previous(v)) for v in VARIANTS}


def verify(record):
    return step09_verify.verify(ROOT, record, previous(record['variantId']))


def test_independent_oracle_is_installed_and_does_not_import_generator():
    assert 'site-packages' in str(Path(step09_verify.__file__).resolve()) and 'site-packages' in str(Path(step09.__file__).resolve())
    text = Path(step09_verify.__file__).read_text()
    assert 'from .step09 import' not in text and 'import step09\n' not in text


def test_pi4_and_unknown_variants_are_refused():
    for variant in ['rpi4', 'pico']:
        with pytest.raises(Invalid):
            step09.build(ROOT, variant, previous('rpi5'))


@pytest.mark.parametrize('variant', VARIANTS)
def test_module_cans_sit_in_the_openings_connector_down_and_plate_h_on_the_rivet_holes(records, variant):
    result = verify(records[variant])
    assert result['status'] == 'PASS' and result['physicalFit'] == 'NOT_CLAIMED' and result['installationSweep'] == 'NOT_CLAIMED'
    # Opening radius 9.5, can radius 8.3, can centres 28.4 apart against openings 30 apart: slack 9.5 - 8.3 - 0.8.
    assert result['canClearanceInOpeningMm'] == pytest.approx(0.4, abs=1e-6)
    assert [r['wallHoleResidualMm'] for r in result['rivets']] == pytest.approx([0.0, 0.0], abs=1e-6)
    assert all(0.15 < r['plateHHoleOffsetMm'] < 0.3 for r in result['rivets'])
    poses = {p['instanceId']: p for p in records[variant]['placements']}
    # Hand derivation: board front face on the wall inner face x=172 (board 1.6 mm) -> x 170.4; can mid-line at local x 23.1 -> y; can axes local y 8.65 above
    # the opening line z=-10 -> z=-1.35 for the crystal edge; connector edge down means local y -> -Z.
    assert poses[MODULE]['rotation'] == [[0, 0, 1], [-1, 0, 0], [0, -1, 0]]
    assert poses[MODULE]['translationMm'] == pytest.approx([170.4, 23.1, -1.35], abs=1e-6)
    assert poses[PLATE_H]['rotation'] == [[0, 0, 1], [0, -1, 0], [1, 0, 0]]
    assert poses[PLATE_H]['translationMm'] == pytest.approx([168.4, 0.0, -10.0], abs=1e-6)


def mutate(record, mutation):
    r = copy.deepcopy(record)
    poses = {p['instanceId']: p for p in r['placements']}
    module, plate, rivet = poses[MODULE], poses[PLATE_H], poses[RIVETS[0]]
    if mutation == 'module-off-centre': module['translationMm'][1] += 1.0
    elif mutation == 'module-too-high': module['translationMm'][2] += 2.0
    elif mutation == 'module-off-wall': module['translationMm'][0] -= 1.0
    elif mutation == 'module-connector-up':
        # Coherent: proper rotation, cans back on the opening axes, only the connector edge swings from down to up.
        module['rotation'], module['translationMm'] = [[0, 0, 1], [1, 0, 0], [0, 1, 0]], [170.4, -23.1, -10.0 - 8.65]
    elif mutation == 'module-reflection': module['rotation'] = [[0, 0, 1], [-1, 0, 0], [0, 1, 0]]
    elif mutation == 'plate-h-off-module-back': plate['translationMm'][0] -= 1.0
    elif mutation == 'plate-h-too-low': plate['translationMm'][2] -= 3.0
    elif mutation == 'rivet-off-hole': rivet['translationMm'][1] += 0.5
    elif mutation == 'rivet-head-off-wall': rivet['translationMm'][0] += 1.0
    elif mutation == 'rivet-missing': r['placements'].remove(rivet)
    elif mutation == 'engineering-promotion': r['engineeringAdmission'] = True
    elif mutation == 'limitation-removed': r['limitations'].pop()
    elif mutation == 'binding-drift': r['inputBindings'][0]['rawSha256'] = '0' * 64
    elif mutation == 'revision-binding-drift': r['inputBindings'][-1]['rawSha256'] = '0' * 64
    elif mutation == 'sweep-claim': r['claims']['installationSweep'] = 'PASS'
    elif mutation == 'staged-wrong-distance': r['recipes'][0]['approachDistanceMm'] += 5
    return r


REASON = {'module-off-centre': 'MODULE_NOT_CENTRED_ON_THE_OPENINGS', 'module-too-high': 'MODULE_NOT_CENTRED_ON_THE_OPENINGS',
          'module-off-wall': 'MODULE_NOT_AGAINST_THE_WALL_INNER_FACE', 'module-connector-up': 'CONNECTOR_EDGE_NOT_DOWN',
          'module-reflection': 'PROPER_ROTATION', 'plate-h-off-module-back': 'PLATE_H_NOT_ON_THE_MODULE_BACK',
          'plate-h-too-low': 'PLATE_H_NOT_ACROSS_THE_CAR_AT_OPENING_HEIGHT', 'rivet-off-hole': 'RIVET_NOT_COAXIAL_WITH_WALL_HOLE',
          'rivet-head-off-wall': 'RIVET_HEAD_NOT_ON_WALL_OUTER_FACE', 'rivet-missing': 'EXACT_SEMANTIC_OWNERSHIP', 'engineering-promotion': 'ENGINEERING_FIREWALL',
          'limitation-removed': 'LIMITATION_REMOVAL', 'binding-drift': 'INPUT_BYTES_CHANGED', 'revision-binding-drift': 'INPUT_BYTES_CHANGED',
          'sweep-claim': 'UNTESTED_CLAIM', 'staged-wrong-distance': 'STAGED_START'}


@pytest.mark.parametrize('mutation', sorted(REASON))
@pytest.mark.parametrize('variant', VARIANTS)
def test_corrupted_ultrasonic_step_is_rejected(records, variant, mutation):
    with pytest.raises(Invalid, match=REASON[mutation]):
        verify(mutate(records[variant], mutation))


# Known blocker. The independent closure verifier measures these overlaps and refuses the S09 closure; this test records the refusal and the measured bands
# so that a geometry correction is noticed here and the bands are updated deliberately instead of the gate being relaxed.
BANDS = {('PX-V40-INS-HORN-PAN-001', 'PX-V40-INS-PLATE-H-001'): (90, 112), ('PX-V40-INS-PLATE-A-001', 'PX-V40-INS-PLATE-H-001'): (10, 16),
         ('PX-V40-INS-PLATE-A-001', 'PX-V40-INS-ULTRASONIC-001'): (44, 58), ('PX-V40-INS-HORN-PAN-001', 'PX-V40-INS-ULTRASONIC-001'): (1, 3)}


@pytest.mark.parametrize('variant', VARIANTS)
def test_s09_closure_stays_refused_while_the_measured_overlaps_remain(variant):
    blocked = load(WORK / 'chain/closures' / f'{variant}-S09-blocked.json')
    assert blocked['status'] == 'BLOCKED' and blocked['stage'] == 'closure' and blocked['reason'].startswith('FORBIDDEN_PRESENTATION_PENETRATION')
    found = {(m[0], m[1]): float(m[2]) for m in re.findall(r"'instances': \['([^']+)', '([^']+)'\], 'volumeMm3': ([0-9.]+)", blocked['reason'])}
    assert set(found) == set(BANDS)
    for pair, (low, high) in BANDS.items():
        assert low <= found[pair] <= high, (pair, found[pair])
