"""M7 S09 targeted Plate A evidence: hash-only receipt, reproducible front-wall measurement, and the decision it supports."""
import json
import os
import shutil
from pathlib import Path
import numpy as np
import pytest
import rfc8785
from twin_cad.contracts import load, Invalid
from twin_cad.assemblies.instructional import hardware_receipt, plate_a_photo, revisions

ROOT = Path(os.environ['PICAR_M7_ROOT'])
PRESENTATION = ROOT / 'digital-twin/assemblies/v40/presentation/instructional'
PACKAGE = ROOT / 'docs/PiCar Plate Pictures/PiCar-X-Z0104V40-M7-S09-Plate-A-Targeted-Evidence'
PIXEL_KEYS = {'pixels', 'bytes', 'data', 'base64', 'thumbnail', 'image'}
private = pytest.mark.skipif(not PACKAGE.is_dir(), reason='the private photograph package is absent on this machine')


@pytest.fixture(scope='module')
def receipt():
    return load(PRESENTATION / 'plate-a-s09-evidence-receipt-05.json')


@pytest.fixture(scope='module')
def measured():
    return load(PRESENTATION / 'plate-a-s09-measurements-05.json')


@pytest.fixture(scope='module')
def review():
    return load(PRESENTATION / 'step09-plate-a-review-05.json')


def walls(measured):
    return [r['derived'] for r in measured['results'] if r['role'] == 'front-wall-square-on']


def m6_plate_a():
    return next(d for d in load(ROOT / 'digital-twin/validation/expected/plates/instructional/all-parameters.json')['definitions'] if d['definitionId'] == 'PX-V40-DEF-PLATE-A')


def stored_plate_a():
    return next((d['parameters']['definition'] for d in revisions.specs(ROOT) if d['definitionId'] == 'PX-V40-DEF-PLATE-A'), m6_plate_a())


def beyond_deck_outline(definition):
    """Everything except what Studio fidelity revisions redraw: the deck outline (outline revision 01) and the deck's
    pan-hub screw holes, the 1.4 mm rows beside the hub (holes correction 03). Every wall and feature S09 judged remains."""
    def keep(f):
        out = {k: v for k, v in f.items() if f['name'] != 'deck' or k not in ('outlineMm', 'outlineSegmentsMm')}
        if f['name'] == 'deck':
            out['holes'] = [h for h in f['holes'] if not (h['diameterMm'] < 2 and h['centerMm'][0] > 150)]
        return out
    faces = [keep(f) for f in definition['profile']['faces']]
    return {**definition, 'profile': {**definition['profile'], 'faces': faces}}


def test_receipt_is_complete_and_holds_no_pixels(receipt):
    assert receipt['package']['imageCount'] == 12 and receipt['package']['folderCounts'] == {'Plate-A-S09': 12}
    assert len({i['sha256'] for i in receipt['images']}) == 12 and all(len(i['sha256']) == 64 for i in receipt['images'])
    assert receipt['privacy'] == 'PRIVATE_OWNER_EVIDENCE' and receipt['engineeringAdmission'] is False and receipt['runtimeAdmission'] is False
    assert all(not (PIXEL_KEYS & set(i)) for i in receipt['images'])
    assert receipt['ownerStatements'][0]['status'] == 'OWNER_CONFIRMED_ASSEMBLY_CONTEXT'


@private
def test_receipt_matches_the_private_package_byte_for_byte(receipt):
    assert hardware_receipt.build_plate_a_s09(PACKAGE) == receipt


@private
def test_receipt_refuses_a_tampered_or_padded_package(tmp_path):
    copy = tmp_path / PACKAGE.name
    shutil.copytree(PACKAGE, copy)
    victim = next(copy.glob('Plate-A-S09/*.jpeg'))
    victim.write_bytes(victim.read_bytes() + b'\x00')
    with pytest.raises(Invalid, match='IMAGE_HASH_OR_SIZE'):
        hardware_receipt.build_plate_a_s09(copy)
    shutil.copytree(PACKAGE, tmp_path / 'padded')
    (tmp_path / 'padded/Plate-A-S09/extra.jpeg').write_bytes(b'x')
    with pytest.raises(Invalid, match='MANIFEST_MEMBERSHIP'):
        hardware_receipt.build_plate_a_s09(tmp_path / 'padded')


@private
def test_measurements_regenerate_byte_for_byte_from_the_trace():
    trace = json.loads((PRESENTATION / 'plate-a-s09-trace-05.json').read_text())
    regenerated = rfc8785.dumps(plate_a_photo.measure(trace, PACKAGE / 'Plate-A-S09')) + b'\n'
    assert regenerated == (PRESENTATION / 'plate-a-s09-measurements-05.json').read_bytes()


def test_measurements_hold_no_pixels_and_name_only_receipted_images(measured, receipt):
    names = {Path(i['path']).name for i in receipt['images']}
    assert {r['file'] for r in measured['results']} <= names
    text = json.dumps(measured)
    assert not any(f'"{k}"' in text for k in PIXEL_KEYS)


def test_reference_is_the_plate_h_end_hole_spacing():
    plate_h = next(d for d in load(PRESENTATION / 'hardware-revisions-04.json')['definitions'] if d['definitionId'] == 'PX-V40-DEF-PLATE-H')
    (x0, y0, _), (x1, y1, _) = plate_h['parameters']['endHoles']
    trace = load(PRESENTATION / 'plate-a-s09-trace-05.json')
    assert trace['reference']['valueMm'] == pytest.approx(np.hypot(x1 - x0, y1 - y0), abs=1e-5)


def test_three_square_on_photographs_agree(measured):
    w = walls(measured)
    assert len(w) == 3
    for name, spread in [('freeEdge', 0.4), ('upperSlotTop', 0.6), ('lowerSlotTop', 0.2)]:
        values = [d[name]['upMm'] for d in w]
        assert max(values) - min(values) < spread, name
    spacing = [d['openingRight']['acrossMm'] - d['openingLeft']['acrossMm'] for d in w]
    assert max(spacing) - min(spacing) < 0.2
    # Photo 01's card is near the wall plane and gives the in-plane reference scale to within 0.1 percent.
    p01 = next(r for r in measured['results'] if r['file'].startswith('plate-A-s09_01'))
    assert p01['card']['pxPerMm'] == pytest.approx(p01['derived']['pxPerMm'], rel=1e-3)


def test_decision_follows_the_measurement_and_leaves_plate_a_unrevised(measured, review):
    outer = -np.mean([d['tongueBottom']['upMm'] for d in walls(measured) if 'tongueBottom' in d])
    decision = review['decision']
    assert outer == pytest.approx(12.76, abs=0.05)
    lo, hi = decision['rangeMm']
    # Any sheet thickness between 1.5 and 2.0 mm with the stated measurement uncertainty stays inside the recorded range.
    assert lo <= outer - 2.0 - 0.35 + 1e-9 and outer - 1.5 + 0.35 <= hi + 1e-9
    assert hi < decision['decisionBoundaryMm'] and decision['classification'] == 'B_OLD_TRACE_SUPPORTED'
    assert review['plateARevision'] is None and review['s09Status'] == 'BLOCKED'
    # S09 revised nothing. A stored Plate A revision may only redraw the deck outline (the Studio fidelity revision),
    # so every wall and feature this measurement judged stays the M6 trace.
    assert beyond_deck_outline(stored_plate_a()) == beyond_deck_outline(m6_plate_a())
    assert review['engineeringStatus'] == 'BLOCKED' and review['engineeringAdmission'] is False


def test_opening_spacing_contradicts_the_module_can_spacing_and_is_recorded(measured, review):
    w = walls(measured)
    spacing = np.mean([d['openingRight']['acrossMm'] - d['openingLeft']['acrossMm'] for d in w])
    diameter = np.mean([d[n]['diameterAcrossMm'] for d in w for n in ('openingLeft', 'openingRight')])
    module = next(d for d in load(PRESENTATION / 'hardware-revisions-04.json')['definitions'] if d['definitionId'] == 'PX-V40-DEF-ULTRASONIC')['parameters']
    off_centre, slack = abs(module['canSpacingMm'] - spacing) / 2, (diameter - 2 * module['canRadiusMm']) / 2
    assert off_centre > 1.0 and slack < 0.5 and off_centre > slack
    assert any('NEW CONTRADICTION' in i['estimate'] for i in review['consequencesForS09']['items'])
