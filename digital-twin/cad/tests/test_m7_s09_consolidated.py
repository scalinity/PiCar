"""M7 S09 consolidated evidence: hash-only receipt, the physical-fit measurement, and the reproducible diagnostic behind the S09 decision."""
import copy
import hashlib
import json
import os
import shutil
from pathlib import Path
import numpy as np
import pytest
import rfc8785
from twin_cad.contracts import load, Invalid
from twin_cad.assemblies.instructional import hardware_receipt, plate_a_photo, revisions
from twin_cad.assemblies.instructional.verify import REVISION_RECORDS
from twin_cad.components.plates.instructional.generate import make_candidate

ROOT = Path(os.environ['PICAR_M7_ROOT'])
PRESENTATION = ROOT / 'digital-twin/assemblies/v40/presentation/instructional'
PACKAGE = ROOT / 'docs/PiCar Plate Pictures/PiCar-X-Z0104V40-M7-S09-Consolidated-Evidence'
PIXEL_KEYS = {'pixels', 'bytes', 'data', 'base64', 'thumbnail', 'image'}
private = pytest.mark.skipif(not PACKAGE.is_dir(), reason='the private photograph package is absent on this machine')


@pytest.fixture(scope='module')
def receipt():
    return load(PRESENTATION / 's09-consolidated-evidence-receipt-06.json')


@pytest.fixture(scope='module')
def review():
    return load(PRESENTATION / 'step09-consolidated-review-06.json')


@pytest.fixture(scope='module')
def fit():
    return load(PRESENTATION / 's09-fit-measurements-06.json')['results'][0]


def prior():
    return {r['id']: {i['sha256'] for i in r['images']} for r in (load(PRESENTATION / n) for n in ('hardware-evidence-receipt-04.json', 'plate-a-s09-evidence-receipt-05.json'))}


def sha_of(shape, tmp_path, name):
    path = tmp_path / name
    shape.exportBrep(str(path))
    return hashlib.sha256(path.read_bytes()).hexdigest()


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


def test_receipt_is_complete_cross_referenced_and_holds_no_pixels(receipt):
    assert receipt['package']['imageCount'] == 32 and len({i['sha256'] for i in receipt['images']}) == 32
    assert receipt['package']['folderCounts'] == {'Plate-A-S09': 12, 'Ultrasonic-Module': 14, 'Plate-A-Ultrasonic-Physical-Fit': 5, 'Assembled-Reference': 1}
    assert all(not (PIXEL_KEYS & set(i)) for i in receipt['images'])
    also = [i['alsoInReceipts'] for i in receipt['images']]
    assert also.count(['PX-M7-PLATE-A-S09-EVIDENCE-RECEIPT-05']) == 12 and also.count(['PX-M7-HARDWARE-EVIDENCE-RECEIPT-04']) == 12 and also.count([]) == 8
    reference = [i for i in receipt['images'] if i['path'].startswith('Assembled-Reference/')]
    assert len(reference) == 1 and reference[0]['documentaryReference'] and not reference[0]['physicalEvidence']
    assert receipt['privacy'] == 'PRIVATE_OWNER_EVIDENCE' and receipt['engineeringAdmission'] is False


@private
def test_receipt_matches_the_private_package_byte_for_byte(receipt):
    assert hardware_receipt.build_consolidated_s09(PACKAGE, prior()) == receipt


@private
def test_receipt_refuses_a_tampered_package(tmp_path):
    copy_ = tmp_path / PACKAGE.name
    shutil.copytree(PACKAGE, copy_)
    victim = next(copy_.glob('Plate-A-Ultrasonic-Physical-Fit/*.jpeg'))
    victim.write_bytes(victim.read_bytes() + b'\x00')
    with pytest.raises(Invalid, match='IMAGE_HASH_OR_SIZE'):
        hardware_receipt.build_consolidated_s09(copy_, prior())


@private
def test_fit_measurement_regenerates_byte_for_byte():
    trace = json.loads((PRESENTATION / 's09-fit-trace-06.json').read_text())
    regenerated = rfc8785.dumps(plate_a_photo.measure(trace, PACKAGE / 'Plate-A-Ultrasonic-Physical-Fit')) + b'\n'
    assert regenerated == (PRESENTATION / 's09-fit-measurements-06.json').read_bytes()


def test_review_names_only_receipted_images_with_their_hashes(review, receipt):
    by_name = {Path(i['path']).name: i['sha256'] for i in receipt['images']}
    for image in review['physicalFit']['images']:
        assert by_name[image['file']] == image['sha256']


def test_crystal_sits_inside_the_slot_and_the_review_quotes_the_measurement(fit, review):
    d = fit['derived']
    slot = (d['slotNearCanEdge']['upMm'], d['slotDeckSideEdge']['upMm'])
    crystal = (d['crystalNearCanEdge']['upMm'], d['crystalDeckSideEdge']['upMm'])
    assert slot[0] > crystal[0] > crystal[1] > slot[1]
    quoted = review['physicalFit']['fitMeasurementsMm']
    assert quoted['crystal']['nearCanEdge'] == pytest.approx(crystal[0], abs=0.01) and quoted['crystal']['deckSideEdge'] == pytest.approx(crystal[1], abs=0.01)
    assert quoted['deckSideSlot']['nearCanEdge'] == pytest.approx(slot[0], abs=0.01) and quoted['deckSideSlot']['deckSideEdge'] == pytest.approx(slot[1], abs=0.01)
    # Same slot measured independently in the bare-wall photographs of Continuation 07.
    walls = [r['derived'] for r in load(PRESENTATION / 'plate-a-s09-measurements-05.json')['results'] if r['role'] == 'front-wall-square-on']
    bare = np.mean([w['lowerSlotTop']['upMm'] - w['lowerSlotBottom']['upMm'] for w in walls if 'lowerSlotBottom' in w])
    assert abs((slot[0] - slot[1]) - bare) < 0.2


def test_can_spacing_follows_the_observed_fit_not_the_standalone_estimate(review):
    walls = [r['derived'] for r in load(PRESENTATION / 'plate-a-s09-measurements-05.json')['results'] if r['role'] == 'front-wall-square-on']
    openings = np.mean([w['openingRight']['acrossMm'] - w['openingLeft']['acrossMm'] for w in walls])
    change = next(c for c in review['ultrasonicReconciliation']['preparedRevision']['changes'] if c['parameter'] == 'canSpacingMm')
    assert change['new'] == pytest.approx(openings, abs=0.05) and change['old'] == 28.4
    assert review['ultrasonicReconciliation']['preparedRevision']['adopted'] is False


def diagnostic_plate_a(hole_v, shift):
    params = load(ROOT / 'digital-twin/validation/expected/plates/instructional/all-parameters.json')
    plate = copy.deepcopy(next(d for d in params['definitions'] if d['definitionId'] == 'PX-V40-DEF-PLATE-A'))
    face = next(f for f in plate['profile']['faces'] if f['name'] == 'front.dual-opening')
    face['originMm'][0] += shift
    face['outlineMm'] = [[-29.1, 0], [29.1, 0], [29.1, 24], [-29.1, 24]]
    face['holes'] = [{'centerMm': [-12.925, hole_v], 'diameterMm': 17.0, 'name': 'front.dual-opening.hole.1'},
                     {'centerMm': [12.925, hole_v], 'diameterMm': 17.0, 'name': 'front.dual-opening.hole.2'},
                     {'centerMm': [-27, hole_v], 'diameterMm': 3, 'name': 'front.dual-opening.hole.3'},
                     {'centerMm': [27, hole_v], 'diameterMm': 3, 'name': 'front.dual-opening.hole.4'}]
    face['slots'] = [face['slots'][0], {'endCentersMm': [[-3.055, hole_v - 7.115], [3.055, hole_v - 7.115]], 'widthMm': 5.39, 'name': 'front.dual-opening.slot.2'}]
    return make_candidate(plate)


def test_diagnostic_artifacts_rebuild_to_the_recorded_hashes(review, tmp_path):
    cases = {c['name']: c for c in review['diagnostic']['cases']}
    for name in ('D1', 'D2', 'D3'):
        c = cases[name]
        assert sha_of(diagnostic_plate_a(c['holeLineV'], c['wallShift']), tmp_path, name + '.brep') == c['plateASha256'], name
    spec = next(d for d in load(PRESENTATION / 'hardware-revisions-04.json')['definitions'] if d['definitionId'] == 'PX-V40-DEF-ULTRASONIC')
    params = dict(spec['parameters'], canSpacingMm=25.85)
    assert sha_of(revisions.ultrasonic(params), tmp_path, 'us.brep') == review['ultrasonicReconciliation']['preparedRevision']['diagnosticArtifactSha256']


def test_nothing_was_adopted_and_s09_stays_blocked(review):
    # No contradicted wall feature was adopted: a stored Plate A revision may only redraw the deck outline.
    assert beyond_deck_outline(stored_plate_a()) == beyond_deck_outline(m6_plate_a())
    us = next(r for r in load(ROOT / REVISION_RECORDS)['records'] if r['definitionId'] == 'PX-V40-DEF-ULTRASONIC')
    assert us['newArtifactSha256'] == '85b56dab1fbf2ad9b1729b6d910813f53783bcf1f26a4365bcdd71bb72b7656f'
    assert review['plateAStatus']['adopted'] is False and review['s09Status'] == 'BLOCKED' and review['engineeringStatus'] == 'BLOCKED'
    d3 = next(c for c in review['diagnostic']['cases'] if c['name'] == 'D3')['volumesMm3']
    assert d3['plateAPlateH'] == 0 and d3['hornModule'] == 0 and d3['hornPlateH'] > 0
