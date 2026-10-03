"""Studio fidelity revisions: reproducible bytes, unmoved datums, symmetric arc-true outlines, registered display detail.

Source mode: PYTHONPATH=digital-twin/cad <frozen-env>/bin/python -m pytest digital-twin/cad/tests/test_studio_fidelity.py
"""
import hashlib
import json
import math
import re
from pathlib import Path

import cadquery as cq
import numpy as np
import pytest

from twin_cad.assemblies.instructional import revisions
from twin_cad.assemblies.instructional.verify import plate_a_artifact, purchased_artifact, shape_features
from twin_cad.components.plates.instructional.generate import make_candidate
from twin_cad.fidelity import hat, pi5

ROOT = Path(__file__).resolve().parents[3]
STORE = ROOT / 'digital-twin/validation/expected/m7/instructional-revisions'
M6_PLATE_A_SHA = 'dfd87e50cc1ac5c87358a7c2495be00860c36e30d9534e54da2508804ca14137'
REVIEW = json.loads((ROOT / 'digital-twin/validation/expected/m7/fidelity/plate-a-outline-01.review.json').read_text())
DISPLAY = json.loads((ROOT / 'digital-twin/validation/expected/m7/fidelity/display/PX-V40-DEF-PI5.display.json').read_text())
HAT_DISPLAY = json.loads((ROOT / 'digital-twin/validation/expected/m7/fidelity/display/PX-V40-DEF-ROBOT-HAT.display.json').read_text())


def brep_bytes(shape, tmp_path, name):
    path = tmp_path / name
    shape.exportBrep(str(path))
    return path.read_bytes()


def test_hat_display_outline_is_reproducible_and_keeps_the_adopted_features(tmp_path):
    chain = ROOT / 'digital-twin/generated/studio/chain' / HAT_DISPLAY['overlaps']['chain']
    parts = hat.build(ROOT, chain)
    shape = pi5.compound(parts)
    data = brep_bytes(shape, tmp_path, 'hat.brep')
    assert data == brep_bytes(pi5.compound(hat.build(ROOT, chain)), tmp_path, 'hat-repeat.brep')
    assert hashlib.sha256(data).hexdigest() == HAT_DISPLAY['artifactSha256']
    pcb = parts[0][2]
    assert (pcb.BoundingBox().xlen, pcb.BoundingBox().ylen, pcb.BoundingBox().zlen) == pytest.approx((85, 56, 1.6))
    old = cq.Shape.importBrep(str(chain / hat.ADOPTED)).Solids()
    assert pi5.hole_centres(pcb, 1.4) == pi5.hole_centres(old[0], 1.4)
    assert len(pi5.hole_centres(pcb, 1.4)) == 4
    assert pcb.Volume() - old[0].Volume() == pytest.approx((20 * 56 - (4 - math.pi) * 3 ** 2) * 1.6)
    assert len([f for f in shape_features(pcb) if abs(f['radius'] - 3) < 1e-6]) == 4
    assert len(old) == len(parts) == len(HAT_DISPLAY['solids'])
    for before, (_, _, after) in zip(old[1:], parts[1:]):
        assert before.Volume() == pytest.approx(after.Volume(), abs=1e-9)
        assert before.cut(after).Volume() < 1e-9


def test_hat_display_retains_original_checked_bytes_and_source_bound_overlap_checks():
    assert pi5.sha256_file(ROOT / hat.INSTRUCTIONAL) == 'bbdbbeb758d724c52450902c427c872b6eb78eff59a89b698d76a54d86d8461a'
    assert HAT_DISPLAY['relation']['instructionalArtifact']['sha256'] == pi5.sha256_file(ROOT / hat.INSTRUCTIONAL)
    for binding in HAT_DISPLAY['sourceBindings']:
        assert pi5.sha256_file(ROOT / binding['path']) == binding['sha256']
    checked = {(c['variantId'], c['step']) for c in HAT_DISPLAY['overlaps']['closures']}
    assert checked == {(v, n) for v in ('rpi5', 'rpi-zero-2-w') for n in range(4, 9)}
    assert HAT_DISPLAY['track'] == 'presentation-only'


def test_generator_still_reproduces_the_accepted_m6_plate_a(tmp_path):
    params = json.loads((ROOT / 'digital-twin/validation/expected/plates/instructional/all-parameters.json').read_text())
    m6 = next(d for d in params['definitions'] if d['definitionId'] == 'PX-V40-DEF-PLATE-A')
    assert hashlib.sha256(brep_bytes(make_candidate(m6), tmp_path, 'm6.brep')).hexdigest() == M6_PLATE_A_SHA


@pytest.mark.parametrize('definition_id', [s['definitionId'] for s in revisions.specs(ROOT)])
def test_every_revision_rebuilds_to_its_recorded_bytes(tmp_path, definition_id):
    record = next(r for r in json.loads((STORE / 'revision-artifacts.json').read_text())['records'] if r['definitionId'] == definition_id)
    first = brep_bytes(revisions.build(ROOT, definition_id), tmp_path, 'a.brep')
    second = brep_bytes(revisions.build(ROOT, definition_id), tmp_path, 'b.brep')
    assert first == second, 'revision export must be byte-stable across rebuilds'
    assert hashlib.sha256(first).hexdigest() == record['newArtifactSha256'] == hashlib.sha256((STORE / record['newArtifact']).read_bytes()).hexdigest()


def test_the_chain_resolves_plate_a_to_the_fidelity_revision():
    assert plate_a_artifact(ROOT) == 'digital-twin/validation/expected/m7/instructional-revisions/PX-V40-DEF-PLATE-A.brep'


HOLES = json.loads((ROOT / 'digital-twin/validation/expected/m7/fidelity/plate-a-holes-03.review.json').read_text())
PAN_SCREW_RADIUS = 0.7
pan_screw_hole = lambda f: abs(f['radius'] - PAN_SCREW_RADIUS) < 1e-6 and f['origin'][0] > 150


def test_plate_a_revision_keeps_every_hole_slot_and_cutout_except_the_corrected_pan_screw_rows():
    old = cq.Shape.importBrep(str(ROOT / 'docs/implementation/evidence/m6/amendment-shapes-04/candidate-artifacts/PX-V40-DEF-PLATE-A.brep'))
    new = cq.Shape.importBrep(str(purchased_artifact(ROOT, 'PX-V40-DEF-PLATE-A')))
    arc_radii = [a['radiusMm'] for a in REVIEW['revision']['design']['arcs']]
    key = lambda f: (round(f['radius'], 4), *np.round(f['origin'][:2], 4))
    old_features = sorted(key(f) for f in shape_features(old) if f['radius'] < 5 and not pan_screw_hole(f))
    new_features = sorted(key(f) for f in shape_features(new) if f['radius'] < 5 and not pan_screw_hole(f) and not any(abs(f['radius'] - r) < 1e-6 for r in arc_radii))
    assert old_features == new_features
    # The corrected rows are exactly the measured design (review plate-a-holes-03).
    design = sorted(map(tuple, np.round(HOLES['design']['holesModelMm']['plusY'] + HOLES['design']['holesModelMm']['minusY'], 6)))
    built = sorted(tuple(np.round(f['origin'][:2], 6)) for f in shape_features(new) if pan_screw_hole(f))
    assert np.allclose(built, design, atol=1e-6)


def test_plate_a_pan_screw_holes_are_two_mirror_rows_of_four_at_a_uniform_pitch():
    """The trace had four holes on one side of the pan hub and three on the other; the photograph shows four and four."""
    new = cq.Shape.importBrep(str(purchased_artifact(ROOT, 'PX-V40-DEF-PLATE-A')))
    c, angle = HOLES['design']['axis']['yInterceptMm'], np.radians(HOLES['design']['axis']['angleDeg'])
    assert (c, HOLES['design']['axis']['angleDeg']) == (REVIEW['mirrorAxis']['yInterceptMm'], REVIEW['mirrorAxis']['angleDeg'])  # one axis for outline and holes
    rot = np.array([[np.cos(angle), np.sin(angle)], [-np.sin(angle), np.cos(angle)]])
    holes = np.array([rot @ (np.array(f['origin'][:2]) - [0, c]) for f in shape_features(new) if pan_screw_hole(f)])
    plus, minus = holes[holes[:, 1] > 0], holes[holes[:, 1] < 0]
    assert len(plus) == len(minus) == 4
    mirror = max(np.min(np.linalg.norm(minus - p * [1, -1], axis=1)) for p in plus)
    assert mirror < 0.05, f'row mirror deviation {mirror} mm'
    pitches = np.diff(np.sort(plus[:, 1]))
    assert np.ptp(pitches) < 1e-6 and abs(pitches.mean() - HOLES['design']['pitchMm']) < 1e-6
    # Measured evidence the design answers to: four holes each side, a uniform pitch within 0.05 mm.
    assert HOLES['checks']['smallHoles']['perSide'] == {'plusY': 4, 'minusY': 4}
    assert max(abs(r) for r in HOLES['design']['uniformPitchResidualMm']) < 0.05


def test_plate_a_arms_are_mirror_images_with_true_round_ends():
    checks = REVIEW['revision']['checks']
    assert checks['outlineSegments']['arcs'] >= 6
    assert checks['freeEdgeMirrorDeviationMm']['mean'] < 0.1
    assert checks['photoEdgeDistanceMm']['revision']['mean'] < checks['photoEdgeDistanceMm']['m6Trace']['mean'] / 2
    ends = [a for a in REVIEW['revision']['design']['arcs'] if 'tangencyErrorMm' in a]
    assert len(ends) == 2 and max(max(a['tangencyErrorMm']) for a in ends) < 1e-9
    # The two end circles mirror each other about the measured plate axis.
    c, angle = REVIEW['mirrorAxis']['yInterceptMm'], np.radians(REVIEW['mirrorAxis']['angleDeg'])
    rot = np.array([[np.cos(angle), np.sin(angle)], [-np.sin(angle), np.cos(angle)]])
    a, b = [rot @ (np.array(e['centreMm']) - [0, c]) for e in ends]
    assert np.allclose(a, b * [1, -1], atol=1e-9) and ends[0]['radiusMm'] == ends[1]['radiusMm']


def test_no_m7_module_reads_a_part_by_hard_coded_path():
    sources = (ROOT / 'digital-twin/cad/twin_cad/assemblies/instructional').glob('*.py')
    offenders = [p.name for p in sources if re.search(r"M5_ARTIFACTS \+ definition|root / PLATE_A\b|candidate-artifacts/PX-V40-DEF-PLATE-A.brep'\)?$", p.read_text(), re.M)
                 and p.name not in ('verify.py',)]
    assert offenders == []


def test_pi5_display_detail_is_registered_deterministic_and_checked(tmp_path):
    shape = pi5.compound(pi5.build())
    data = brep_bytes(shape, tmp_path, 'pi5.brep')
    assert data == brep_bytes(pi5.compound(pi5.build()), tmp_path, 'pi5b.brep')
    assert hashlib.sha256(data).hexdigest() == DISPLAY['artifactSha256']
    assert len(DISPLAY['solids']) == len(shape.Solids())
    holes = sorted((round(f['origin'][0], 6), round(f['origin'][1], 6)) for f in shape_features(pi5.build()[0][2]) if abs(f['radius'] - 1.35) < 1e-6)
    assert holes == sorted(pi5.HOLES)
    offsets = [np.hypot(*p['centreOffsetXYMm']) for p in DISPLAY['vendorCrossCheck']['parts']
               if p.get('footprintIoU') and not re.search('tongue|pins|contacts|HDMI', p['part'])]
    assert len(offsets) >= 20 and max(offsets) < 0.3
    assert any(o['instanceId'] == 'PX-V40-INS-USB-MICROPHONE-001' for o in DISPLAY['overlaps']['positive']), 'the known microphone finding stays recorded'


def test_pi5_display_checks_name_the_exact_inputs_they_measured():
    """The record binds every check to the display artifact, the instructional artifact, every other placed part and
    each closure by its canonical hash, so the Studio can refuse it for any state it did not measure."""
    rel, o = DISPLAY['relation'], DISPLAY['overlaps']
    hex64 = re.compile('[0-9a-f]{64}')
    assert DISPLAY['schema'] == pi5.SCHEMA
    assert rel['instructionalArtifact']['path'] == 'chain:' + pi5.INSTRUCTIONAL and hex64.fullmatch(rel['instructionalArtifact']['sha256'])
    assert o['displayArtifactSha256'] == DISPLAY['artifactSha256'] and o['instructionalArtifactSha256'] == rel['instructionalArtifact']['sha256']
    holes = rel['mountingHoles']
    assert len(holes['display']) == len(holes['instructional']) == 4 and holes['maxCentreDeviationMm'] < 0.01, 'measured on both shapes, not authored'
    checked = {(c['variantId'], c['step']): c['closureRfc8785Sha256'] for c in o['closures']}
    assert sorted(checked) == [('rpi5', n) for n in range(2, 9)] and all(hex64.fullmatch(h) for h in checked.values())
    assert all(checked.get((p['variantId'], p['step'])) == p['closureRfc8785Sha256'] for p in o['positive'])
    assert o['partArtifacts'] and all(hex64.fullmatch(h) for h in o['partArtifacts'].values())
    microphone = [p['volumeMm3'] for p in o['positive'] if p['instanceId'] == 'PX-V40-INS-USB-MICROPHONE-001']
    assert microphone and 440 < max(microphone) < 460, 'the known 449 mm3 microphone overlap is still measured, not moved away'


def test_hole_review_uses_outline_01_even_while_store_selects_holes_03(tmp_path):
    from twin_cad.fidelity import plate_a
    selected = json.loads((STORE / 'revision-artifacts.json').read_text())['records']
    assert next(r for r in selected if r['definitionId'] == 'PX-V40-DEF-PLATE-A')['newArtifactSha256'] == HOLES['artifacts']['new']['sha256']
    predecessor = plate_a.outline_predecessor(ROOT)
    assert hashlib.sha256(brep_bytes(predecessor, tmp_path, 'outline.brep')).hexdigest() == HOLES['artifacts']['old']['sha256']
    _, shape, checks = plate_a.build_hole_revision(ROOT, HOLES['design'])
    assert {k: v for k, v in checks.items() if k != 'volumeMm3'} == {k: v for k, v in HOLES['checks'].items() if k != 'volumeMm3'}
    assert checks['volumeMm3'] == pytest.approx(HOLES['checks']['volumeMm3'], abs=1e-9)
    assert checks['smallHoles']['traced'] == 7 and checks['smallHoles']['revision'] == 8
    assert checks['volumeMm3']['outlineRevision'] == pytest.approx(29573.40543225287)
    assert hashlib.sha256(brep_bytes(shape, tmp_path, 'holes.brep')).hexdigest() == HOLES['artifacts']['new']['sha256']


def test_outline_predecessor_hash_mismatch_is_fatal(monkeypatch):
    from twin_cad.fidelity import plate_a
    monkeypatch.setattr(plate_a, 'OUTLINE_ARTIFACT_SHA256', '0' * 64)
    with pytest.raises(ValueError, match='OUTLINE_PREDECESSOR_SHA'):
        plate_a.build_hole_revision(ROOT, HOLES['design'])
