"""Uniform instructional step closures: composed by closure.py, re-measured by closure_verify.py."""
import copy
import math
import os
from pathlib import Path
import pytest
from twin_cad.contracts import load, Invalid
from twin_cad.assemblies.instructional import closure, closure_verify


ROOT = Path(os.environ['PICAR_M7_ROOT'])
ARTIFACTS = Path(os.environ['PICAR_M7_REMEDIATION'])
WORK = ARTIFACTS.parent
SOURCE_ROOT = Path(os.environ.get('PICAR_M7_SOURCE_ROOT', ROOT))
UP = dict(solutions=WORK / 'anchor/solutions', boards=WORK / 'anchor/boards', engagement=WORK / 'engagement', artifacts=ARTIFACTS, usb=WORK / 'usb', camera=WORK / 'camera', steps=WORK / 'chain/steps')
CLOSED = [('rpi5', n) for n in range(1, 9)] + [('rpi-zero-2-w', n) for n in range(1, 9)]


def build(variant, number, previous=None):
    return closure.build(ROOT, variant, number, previous=previous, **UP)


def check(record, previous=None):
    return closure_verify.verify(ROOT, record, previous=previous, source_root=SOURCE_ROOT, **UP)


@pytest.fixture(scope='module')
def built():
    out = {}
    for variant, number in CLOSED:
        previous = out.get((variant, number - 1))
        out[(variant, number)] = build(variant, number, previous)
    return out


def test_independent_oracle_is_installed_and_does_not_import_generator():
    assert 'site-packages' in str(Path(closure_verify.__file__).resolve())
    assert 'site-packages' in str(Path(closure.__file__).resolve())
    text = Path(closure_verify.__file__).read_text()
    assert 'from .closure import' not in text and 'import closure\n' not in text


@pytest.mark.parametrize('variant,number', CLOSED)
def test_closure_passes_independent_verification(built, variant, number):
    record = built[(variant, number)]
    previous = built.get((variant, number - 1))
    result = check(record, previous)
    # Admission follows the closure's own honest status: only COMPLETE closures are admitted; BLOCKED ones still verify their placements.
    if record['status'] == 'COMPLETE':
        assert result['status'] == 'PASS' and result['instructionalStatus'] == 'INSTRUCTIONAL_ADMITTED' and record['blockers'] == []
    else:
        assert result['status'] == 'BLOCKED' and result['instructionalStatus'] == 'BLOCKED' and record['blockers']
    assert result['engineeringAdmission'] is False and result['runtimeAdmission'] is False
    assert not result['forbiddenPenetrations']
    assert result['checks'] == closure_verify.REQUIRED_CHECKS
    assert record['motion']['installationSweep'] == 'NOT_CLAIMED' and record['claims']['physicalFit'] == 'NOT_CLAIMED'


@pytest.mark.parametrize('variant', ['rpi5', 'rpi-zero-2-w'])
def test_s01_allocation_pairs_screws_with_the_standoffs_the_accepted_graph_names(variant):
    # Regression: the Zero2W review once paired screw-003/004 with the opposite M25X30 standoff;
    # identical parts hid it from a review-only oracle, the accepted ordered stacks do not.
    review = load(ROOT / 'digital-twin/assemblies/v40/presentation/instructional/step01-source-review-03.json')
    graph = load(ROOT / f'digital-twin/validation/m2/{variant}/compiled-graph.json')
    stacks = [{s['instanceId'] for s in c['orderedContactStack']} for c in graph['mechanicalConnections']]
    for allocation in review['variantAllocations'][variant]:
        assert any({allocation['screwInstanceId'], allocation['standoffInstanceId']} <= stack for stack in stacks), allocation


def test_rpi5_s02_is_refused_when_the_microphone_frame_is_absent():
    s1 = build('rpi5', 1)
    without_usb = {**UP, 'usb': None}
    with pytest.raises(Invalid, match='UNPLACED_INSTALLED_SOLID.*USB-MICROPHONE'):
        closure.build(ROOT, 'rpi5', 2, previous=s1, **without_usb)
    empty = {**UP, 'usb': WORK / 'no-such-usb-dir'}
    with pytest.raises(Invalid, match='UNPLACED_INSTALLED_SOLID.*USB-MICROPHONE'):
        closure.build(ROOT, 'rpi5', 2, previous=s1, **empty)


@pytest.mark.parametrize('variant,connection', [('rpi5', 'PX-V40-CONN-03-PI5-RIBBON-PI'), ('rpi-zero-2-w', 'PX-V40-CONN-03-ZERO2W-RIBBON-PI')])
def test_s03_places_no_new_solid_and_frames_exactly_the_connection_it_activates(built, variant, connection):
    s2, s3 = built[(variant, 2)], built[(variant, 3)]
    assert s3['placements'] == s2['placements'] and s3['recipes'] == [] and s3['contactPolicy'] == s2['contactPolicy']
    assert [f['connectionId'] for f in s3['endpointFrames']] == [connection] and s3['carriedUnframedConnectionIds'] == []
    assert s2['endpointFrames'] == [] and s2['carriedUnframedConnectionIds'] == []
    frame = s3['endpointFrames'][0]
    assert frame['cableInstanceId'] == 'PX-V40-INS-RIBBON-FPC-001' and frame['approach']['stagingOnly'] is True
    assert s3['introducedInstanceIds'] == ['PX-V40-INS-RIBBON-FPC-001']


@pytest.mark.parametrize('variant,solids,gaps', [('rpi5', 20, 0), ('rpi-zero-2-w', 17, 2)])
def test_s04_adds_the_hat_and_four_screws_keeps_the_ribbon_frame_and_declares_only_real_gaps(built, variant, solids, gaps):
    s3, s4 = built[(variant, 3)], built[(variant, 4)]
    new = [p['instanceId'] for p in s4['placements'] if p not in s3['placements']]
    assert len(s4['placements']) == solids and sorted(new) == sorted(['PX-V40-INS-ROBOT-HAT-001'] + [f'PX-V40-INS-M25X6-SCREW-00{n}' for n in (5, 6, 7, 8)])
    assert s4['endpointFrames'] == s3['endpointFrames'] and s4['carriedUnframedConnectionIds'] == []
    assert [r['instanceId'] for r in s4['recipes']][0] == 'PX-V40-INS-ROBOT-HAT-001' and len(s4['recipes']) == 5
    declared = [e for e in s4['contactPolicy'] if e['category'] == 'APPROXIMATE_HEIGHT_GAP']
    assert len(declared) == gaps and all(e['maximumOverlapMm3'] == 0 and e['maximumGapMm'] == 1.0 for e in declared)


@pytest.mark.parametrize('variant,solids', [('rpi5', 34), ('rpi-zero-2-w', 31)])
def test_s05_adds_two_motors_and_four_stacks_and_scopes_the_boreless_motor_overlaps_to_the_shank_volume(built, variant, solids):
    s4, s5 = built[(variant, 4)], built[(variant, 5)]
    new = {p['instanceId'] for p in s5['placements']} - {p['instanceId'] for p in s4['placements']}
    assert len(s5['placements']) == solids and len(new) == 14
    entries = [e for e in s5['contactPolicy'] if e['category'] == 'PROXY_OVERLAP_OMITTED_BORE']
    assert len(entries) == 4 and all(abs(e['maximumOverlapMm3'] - math.pi * 1.5 ** 2 * 25) < 1e-9 for e in entries)
    assert all(any('MOTOR' in i for i in e['instances']) and any('M3X25-SCREW' in i for i in e['instances']) for e in entries)
    assert s5['endpointFrames'] == s4['endpointFrames'] and s5['carriedUnframedConnectionIds'] == []


@pytest.mark.parametrize('variant,connection', [('rpi5', 'PX-V40-CONN-03-PI5-RIBBON-PI'), ('rpi-zero-2-w', 'PX-V40-CONN-03-ZERO2W-RIBBON-PI')])
def test_a_step_with_an_unframed_cable_end_is_honestly_blocked_yet_carries_its_verified_placements(built, variant, connection):
    s2 = built[(variant, 2)]
    without_camera = {**UP, 'camera': None}
    blocked = closure.build(ROOT, variant, 3, previous=s2, **without_camera)
    assert blocked['status'] == 'BLOCKED' and blocked['blockers'] == [{'id': 'UNFRAMED_TOUCHED_CABLE_END', 'connectionIds': [connection]}]
    assert blocked['placements'] == s2['placements'] and blocked['endpointFrames'] == [] and blocked['carriedUnframedConnectionIds'] == [connection]
    result = closure_verify.verify(ROOT, blocked, previous=s2, source_root=SOURCE_ROOT, **without_camera)
    assert result['status'] == 'BLOCKED' and result['instructionalStatus'] == 'BLOCKED' and result['blockers'] == blocked['blockers']
    forged = copy.deepcopy(blocked)
    forged['status'], forged['blockers'] = 'COMPLETE', []
    with pytest.raises(Invalid, match='COMPLETE_CLAIM_WITH_UNFRAMED_CABLE_END'):
        closure_verify.verify(ROOT, forged, previous=s2, source_root=SOURCE_ROOT, **without_camera)
    hidden = copy.deepcopy(blocked)
    hidden['blockers'] = []
    with pytest.raises(Invalid, match='BLOCKERS_NOT_RE_DERIVED'):
        closure_verify.verify(ROOT, hidden, previous=s2, source_root=SOURCE_ROOT, **without_camera)


@pytest.mark.parametrize('variant', ['rpi5', 'rpi-zero-2-w'])
def test_s06_adds_no_pose_lists_the_applied_zero_solid_tape_and_stays_complete(built, variant):
    s5, s6 = built[(variant, 5)], built[(variant, 6)]
    assert s6['placements'] == s5['placements'] and s6['recipes'] == [] and s6['status'] == 'COMPLETE'
    assert {'PX-V40-INS-HOOK-002', 'PX-V40-INS-LOOP-002'} <= set(s6['zeroSolidInstanceIds']) and 'PX-V40-INS-BATTERY-001' not in {p['instanceId'] for p in s6['placements']}


@pytest.mark.parametrize('variant,connection', [('rpi5', 'PX-V40-CONN-07-COMMON-BATTERY'), ('rpi-zero-2-w', 'PX-V40-CONN-07-COMMON-BATTERY')])
def test_s07_places_the_battery_declares_the_bounded_flange_interference_and_stays_blocked_on_its_lead(built, variant, connection):
    s6, s7 = built[(variant, 6)], built[(variant, 7)]
    new = [p['instanceId'] for p in s7['placements'] if p not in s6['placements']]
    assert new == ['PX-V40-INS-BATTERY-001']
    assert s7['status'] == 'BLOCKED' and s7['blockers'] == [{'id': 'UNFRAMED_TOUCHED_CABLE_END', 'connectionIds': [connection]}]
    entries = [e for e in s7['contactPolicy'] if e['category'] == 'APPROXIMATE_TRACE_INTERFERENCE']
    assert len(entries) == 1 and entries[0]['maximumPenetrationMm'] == 2.0 and set(entries[0]['instances']) == {'PX-V40-INS-BATTERY-001', 'PX-V40-INS-PLATE-A-001'}
    assert abs(entries[0]['maximumOverlapMm3'] - 2.0 * 2 * (70 * 38 + 70 * 20 + 38 * 20)) < 1e-6
    assert connection in s7['carriedUnframedConnectionIds'] and s7['endpointFrames'] == s6['endpointFrames']


def test_the_two_variants_keep_their_own_connector_frames(built):
    a, b = built[('rpi5', 3)]['endpointFrames'][0], built[('rpi-zero-2-w', 3)]['endpointFrames'][0]
    assert a['frame']['boardLocal']['insertionAxis'] == [0, 0, -1] and b['frame']['boardLocal']['insertionAxis'] == [-1, 0, 0]


def test_microphone_overlap_is_a_scoped_socket_cavity_proxy_bounded_by_the_plug_volume(built):
    record = built[('rpi5', 2)]
    entries = [e for e in record['contactPolicy'] if e['category'] == 'PROXY_OVERLAP_OMITTED_SOCKET_CAVITY']
    assert len(entries) == 1 and set(entries[0]['instances']) == {'PX-V40-INS-USB-MICROPHONE-001', 'PX-V40-INS-PI5-001'}
    assert abs(entries[0]['maximumOverlapMm3'] - 504.0) < 1e-6
    assert entries[0]['basis'] == 'declared two-endpoint connection PX-V40-CONN-02-PI5-MICROPHONE'
    assert any(r['instanceId'] == 'PX-V40-INS-USB-MICROPHONE-001' for r in record['recipes'])
    assert [r['instanceId'] for r in record['recipes']][:2] == ['PX-V40-INS-PI5-001', 'PX-V40-INS-USB-MICROPHONE-001']


def test_pi4_and_unknown_variants_are_refused():
    for variant in ['rpi4', 'pico']:
        with pytest.raises(Invalid):
            build(variant, 1)


def mutate(record, mutation):
    r = copy.deepcopy(record)
    pose = next(p for p in r['placements'] if 'SCREW' in p['instanceId'] or 'STANDOFF' in p['instanceId'])
    if mutation == 'reflection': pose['rotation'] = [[1, 0, 0], [0, 1, 0], [0, 0, -1]]
    elif mutation == 'shear': pose['rotation'][0][1] += 0.01
    elif mutation == 'negative-scale': r['scale'] = [1, 1, -1]
    elif mutation == 'drift': pose['translationMm'][0] += 0.5
    elif mutation == 'identity-fallback':
        pose['rotation'] = [[1, 0, 0], [0, 1, 0], [0, 0, 1]]
        pose['translationMm'] = [0., 0., 0.]
    elif mutation == 'missing': r['placements'].remove(pose)
    elif mutation == 'duplicate': r['placements'].append(copy.deepcopy(pose))
    elif mutation == 'invented': r['placements'].append({**copy.deepcopy(pose), 'instanceId': 'PX-V40-INS-WRENCH-001'})
    elif mutation == 'swapped':
        other = next(p for p in r['placements'] if p is not pose and p['instanceId'].split('-STANDOFF')[0] != pose['instanceId'] and p['role'] == pose['role'])
        pose['translationMm'], other['translationMm'] = other['translationMm'], pose['translationMm']
    elif mutation == 'sweep-claim': r['motion']['installationSweep'] = 'PASS'
    elif mutation == 'fit-claim': r['claims']['physicalFit'] = 'PASS'
    elif mutation == 'engineering-promotion': r['engineeringAdmission'] = True
    elif mutation == 'runtime-promotion': r['runtimeAdmission'] = True
    elif mutation == 'graph-hash': r['graphHash'] = '0' * 64
    elif mutation == 'state-hash': r['afterStateHash'] = '0' * 64
    elif mutation == 'limitation-removed': r['sourceLimitations'].pop()
    elif mutation == 'global-exemption': r['contactPolicy'].append({'instances': ['*', '*'], 'category': 'PROXY_OVERLAP_OMITTED_DETAIL', 'maximumOverlapMm3': 1e9, 'maximumGapMm': 0.0, 'maximumPenetrationMm': 0.0, 'basis': 'all'})
    elif mutation == 'budget-inflated': r['contactPolicy'][0]['maximumOverlapMm3'] = 1e9
    elif mutation == 'policy-dropped': r['contactPolicy'].clear()
    elif mutation == 'staged-equals-final':
        recipe = r['recipes'][0]
        recipe['stagedStart'] = copy.deepcopy(next(p for p in r['placements'] if p['instanceId'] == recipe['instanceId']))
    elif mutation == 'dof-promoted': r['dof']['remainingDOF'] = ['rotateZ']
    elif mutation == 'carried-frame-dropped': r['endpointFrames'] = []
    elif mutation == 'carried-frame-demoted':
        r['carriedUnframedConnectionIds'] = sorted(set(r['carriedUnframedConnectionIds']) | {r['endpointFrames'][0]['connectionId']})
        r['endpointFrames'] = []
    elif mutation == 'zero-solid-hidden': r['zeroSolidInstanceIds'] = []
    elif mutation == 'carried-frame-drift': r['endpointFrames'][0]['frame']['installed']['originMm'][0] += 0.5
    elif mutation == 'gap-entry-inflated': next(e for e in r['contactPolicy'] if e['category'] == 'APPROXIMATE_HEIGHT_GAP')['maximumGapMm'] = 5.0
    elif mutation == 'gap-entry-dropped': r['contactPolicy'] = [e for e in r['contactPolicy'] if e['category'] != 'APPROXIMATE_HEIGHT_GAP']
    elif mutation == 'bore-budget-inflated': next(e for e in r['contactPolicy'] if e['category'] == 'PROXY_OVERLAP_OMITTED_BORE')['maximumOverlapMm3'] *= 4
    elif mutation == 'bore-category-forged':
        e = next(e for e in r['contactPolicy'] if e['category'] == 'UNRESOLVED_CLEARANCE'); e['category'] = 'PROXY_OVERLAP_OMITTED_BORE'; e['maximumOverlapMm3'] = 1e9
    elif mutation == 'frame-dropped': r['endpointFrames'] = []
    elif mutation == 'frame-moved': r['endpointFrames'][0]['frame']['installed']['originMm'][2] += 0.5
    elif mutation == 'phantom-frame':
        phantom = copy.deepcopy(r['endpointFrames'][0])
        phantom['connectionId'] = 'PX-V40-CONN-07-COMMON-BATTERY'
        r['endpointFrames'].append(phantom)
    elif mutation == 'unframed-touched':
        r['carriedUnframedConnectionIds'] = [r['endpointFrames'][0]['connectionId']]
        r['endpointFrames'] = []
    elif mutation == 'mic-pose-moved': next(p for p in r['placements'] if 'MICROPHONE' in p['instanceId'])['translationMm'][0] += 0.5
    elif mutation == 'socket-budget-inflated':
        next(e for e in r['contactPolicy'] if e['category'] == 'PROXY_OVERLAP_OMITTED_SOCKET_CAVITY')['maximumOverlapMm3'] *= 10
    return r


MUTATIONS = ['reflection', 'shear', 'negative-scale', 'drift', 'identity-fallback', 'missing', 'duplicate', 'invented', 'swapped',
             'sweep-claim', 'fit-claim', 'engineering-promotion', 'runtime-promotion', 'graph-hash', 'state-hash',
             'limitation-removed', 'global-exemption', 'budget-inflated', 'policy-dropped', 'staged-equals-final', 'dof-promoted',
             'mic-pose-moved', 'socket-budget-inflated', 'frame-dropped', 'frame-moved', 'phantom-frame', 'unframed-touched',
             'carried-frame-dropped', 'carried-frame-demoted', 'carried-frame-drift', 'gap-entry-inflated', 'gap-entry-dropped', 'bore-budget-inflated', 'bore-category-forged', 'zero-solid-hidden']


POSE_REJECTION = 'PLACEMENT_DIFFERS_FROM_INDEPENDENTLY_VERIFIED_POSE|CONTEXT_DRIFT'
# Each corruption must be stopped by the check responsible for it, not by an incidental earlier failure.
REASON = {'reflection': 'PROPER_ROTATION', 'shear': 'PROPER_ROTATION', 'negative-scale': 'BASIS_UNIT_SCALE',
          'drift': POSE_REJECTION, 'identity-fallback': POSE_REJECTION, 'swapped': POSE_REJECTION,
          'missing': 'MISSING_OR_INVENTED_INSTANCE', 'invented': 'MISSING_OR_INVENTED_INSTANCE', 'duplicate': 'DUPLICATE_PHYSICAL_INSTANCE',
          'sweep-claim': 'UNTESTED_CLAIM_OR_MOTION_PROMOTION', 'fit-claim': 'UNTESTED_CLAIM_OR_MOTION_PROMOTION',
          'engineering-promotion': 'ENGINEERING_FIREWALL', 'runtime-promotion': 'ENGINEERING_FIREWALL',
          'graph-hash': 'GRAPH_MODEL_BINDING', 'state-hash': 'ACCEPTED_STATE_HASH_BINDING', 'limitation-removed': 'LIMITATION_REMOVAL',
          'global-exemption': 'GLOBAL_OR_UNSCOPED_CONTACT_EXEMPTION', 'budget-inflated': 'INFLATED_OR_UNJUSTIFIED_BUDGET',
          'policy-dropped': 'FORBIDDEN_PRESENTATION_PENETRATION', 'staged-equals-final': 'STAGED_START_NOT_FINAL_MINUS_APPROACH',
          'dof-promoted': 'UNDECLARED_DOF_OR_DRIFT', 'mic-pose-moved': POSE_REJECTION, 'socket-budget-inflated': 'INFLATED_OR_UNJUSTIFIED_BUDGET',
          'frame-dropped': 'COMPLETE_CLAIM_WITH_UNFRAMED_CABLE_END', 'frame-moved': 'ENDPOINT_FRAME_DIFFERS_FROM_INDEPENDENTLY_VERIFIED', 'phantom-frame': 'FRAME_FOR_INACTIVE_OR_UNKNOWN_CONNECTION',
          'unframed-touched': 'COMPLETE_CLAIM_WITH_UNFRAMED_CABLE_END', 'carried-frame-dropped': 'UNFRAMED_CONNECTION_LIST', 'carried-frame-demoted': 'ENDPOINT_FRAME_DRIFT',
          'carried-frame-drift': 'ENDPOINT_FRAME_DRIFT', 'gap-entry-inflated': 'INFLATED_OR_UNJUSTIFIED_BUDGET', 'gap-entry-dropped': 'STACK_MEMBERS_NOT_IN_CONTACT', 'bore-budget-inflated': 'INFLATED_OR_UNJUSTIFIED_BUDGET', 'bore-category-forged': 'MISCLASSIFIED_CONTACT', 'zero-solid-hidden': 'ZERO_SOLID_ACCOUNTING'}


def test_every_mutation_has_a_specific_expected_rejection():
    assert sorted(REASON) == sorted(MUTATIONS)


@pytest.mark.parametrize('mutation', MUTATIONS)
@pytest.mark.parametrize('variant,number', CLOSED)
def test_corrupted_closure_is_rejected(built, variant, number, mutation):
    record = built[(variant, number)]
    if mutation in ('budget-inflated', 'policy-dropped') and not record['contactPolicy']:
        pytest.skip('no scoped overlap in this closure')
    if mutation == 'staged-equals-final' and not record['recipes']:
        pytest.skip('this closure moves no solid')
    if mutation in ('mic-pose-moved', 'socket-budget-inflated') and not (variant == 'rpi5' and number >= 2):
        pytest.skip('only Pi5 closures from S02 on carry the microphone')
    if mutation in ('frame-dropped', 'frame-moved', 'phantom-frame', 'unframed-touched') and number != 3:
        pytest.skip('only the S03 closure touches a cable connection')
    if mutation in ('carried-frame-dropped', 'carried-frame-demoted', 'carried-frame-drift') and number < 4:
        pytest.skip('a carried cable frame exists only after S03')
    if mutation in ('gap-entry-inflated', 'gap-entry-dropped') and not (variant == 'rpi-zero-2-w' and number >= 4):
        pytest.skip('only Zero2W closures from S04 on declare height gaps')
    if mutation == 'zero-solid-hidden' and number < 3:
        pytest.skip('no zero-solid instance is installed before the ribbon in S03')
    if mutation == 'bore-budget-inflated' and number < 5:
        pytest.skip('boreless-body overlaps begin at S05')
    if mutation == 'bore-category-forged' and number < 2:
        pytest.skip('no clearance entry before S02')
    previous = built.get((variant, number - 1))
    with pytest.raises(Invalid, match=REASON[mutation]):
        check(mutate(record, mutation), previous)
