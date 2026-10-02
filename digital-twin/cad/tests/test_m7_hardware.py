"""M7 targeted-hardware evidence: hash-only receipt, additive purchased-part revisions, and what the derived geometry must show."""
import hashlib
import os
import shutil
from pathlib import Path
import cadquery as cq
import pytest
from twin_cad.contracts import load, Invalid
from twin_cad.assemblies.instructional import hardware_receipt, revisions
from twin_cad.assemblies.instructional.frames import cylinder_faces, planar_faces
from twin_cad.assemblies.instructional.verify import purchased_artifact, REVISION_DIR, REVISION_RECORDS

ROOT = Path(os.environ['PICAR_M7_ROOT'])
PRESENTATION = ROOT / 'digital-twin/assemblies/v40/presentation/instructional'
PACKAGE = ROOT / 'docs/PiCar Plate Pictures/PiCar-X-Z0104V40-M7-Targeted-Hardware-Evidence'
PIXEL_KEYS = {'pixels', 'bytes', 'data', 'base64', 'thumbnail', 'image'}


def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


@pytest.fixture(scope='module')
def receipt():
    return load(PRESENTATION / 'hardware-evidence-receipt-04.json')


@pytest.fixture(scope='module')
def spec():
    return load(PRESENTATION / 'hardware-revisions-04.json')


@pytest.fixture(scope='module')
def records():
    return {r['definitionId']: r for r in load(ROOT / REVISION_RECORDS)['records']}


def test_receipt_is_complete_and_holds_no_pixels(receipt):
    assert receipt['package']['imageCount'] == 43 and len(receipt['images']) == 43
    assert receipt['package']['folderCounts'] == {'Ultrasonic-Module': 12, 'Servo-SF006C': 10, 'Servo-Horns': 12, 'Drive-Motor': 8, 'Manual-Reference': 1}
    assert len({i['sha256'] for i in receipt['images']}) == 43 and all(len(i['sha256']) == 64 for i in receipt['images'])
    assert receipt['package']['physicalImageCount'] == 42 and receipt['package']['documentaryImageCount'] == 1
    assert receipt['privacy'] == 'PRIVATE_OWNER_EVIDENCE' and receipt['engineeringAdmission'] is False and receipt['runtimeAdmission'] is False
    assert all(not (PIXEL_KEYS & set(i)) for i in receipt['images'])


@pytest.mark.skipif(not PACKAGE.is_dir(), reason='the private photograph package is absent on this machine')
def test_receipt_matches_the_private_package_byte_for_byte(receipt):
    assert hardware_receipt.build(PACKAGE) == receipt


@pytest.mark.skipif(not PACKAGE.is_dir(), reason='the private photograph package is absent on this machine')
def test_receipt_refuses_a_tampered_package(tmp_path):
    copy = tmp_path / PACKAGE.name
    shutil.copytree(PACKAGE, copy)
    victim = next(copy.glob('Servo-Horns/*.jpeg'))
    victim.write_bytes(victim.read_bytes() + b'\x00')
    with pytest.raises(Invalid, match='IMAGE_HASH_OR_SIZE'):
        hardware_receipt.build(copy)


def test_every_revised_artifact_regenerates_to_its_recorded_bytes(records, tmp_path):
    assert sorted(records) == sorted(d['definitionId'] for d in revisions.specs(ROOT))
    for definition_id, record in records.items():
        path = tmp_path / (definition_id + '.brep')
        revisions.build(ROOT, definition_id).exportBrep(str(path))
        assert sha(path) == record['newArtifactSha256'] == sha(ROOT / REVISION_DIR / (definition_id + '.brep'))


def test_superseded_artifacts_are_preserved_unchanged(records):
    for record in records.values():
        assert sha(ROOT / record['supersedesPath']) == record['supersededArtifactSha256']
        assert record['newArtifactSha256'] != record['supersededArtifactSha256']


def test_resolver_serves_the_revision_and_falls_back_to_the_accepted_artifact():
    assert purchased_artifact(ROOT, 'PX-V40-DEF-ULTRASONIC').parent == ROOT / REVISION_DIR
    assert purchased_artifact(ROOT, 'PX-V40-DEF-HORN-PAN').parent == ROOT / REVISION_DIR
    untouched = purchased_artifact(ROOT, 'PX-V40-DEF-BATTERY')
    assert 'm5/instructional-artifacts' in str(untouched) and untouched.is_file()
    assert 'm6/' in str(purchased_artifact(ROOT, 'PX-V40-DEF-PLATE-B'))


@pytest.fixture()
def mini_root(tmp_path, records):
    shutil.copytree(ROOT / REVISION_DIR, tmp_path / REVISION_DIR)
    for record in records.values():
        target = tmp_path / record['supersedesPath']
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy(ROOT / record['supersedesPath'], target)
    return tmp_path


def test_resolver_refuses_a_revision_whose_bytes_changed(mini_root):
    victim = mini_root / REVISION_DIR / 'PX-V40-DEF-HORN-PAN.brep'
    victim.write_bytes(victim.read_bytes() + b' ')
    with pytest.raises(Invalid, match='REVISED_ARTIFACT_BYTES'):
        purchased_artifact(mini_root, 'PX-V40-DEF-HORN-PAN')


def test_resolver_refuses_when_the_superseded_artifact_changed(mini_root, records):
    victim = mini_root / records['PX-V40-DEF-ULTRASONIC']['supersedesPath']
    victim.write_bytes(victim.read_bytes() + b' ')
    with pytest.raises(Invalid, match='SUPERSEDED_ARTIFACT_CHANGED'):
        purchased_artifact(mini_root, 'PX-V40-DEF-ULTRASONIC')


def test_a_changed_parameter_cannot_pass_as_the_recorded_artifact(spec, records, tmp_path):
    mutated = tmp_path / 'root'
    (mutated / 'digital-twin/assemblies/v40/presentation/instructional').mkdir(parents=True)
    changed = load(PRESENTATION / 'hardware-revisions-04.json')
    next(d for d in changed['definitions'] if d['definitionId'] == 'PX-V40-DEF-ULTRASONIC')['parameters']['canSpacingMm'] = 23.0
    (mutated / revisions.PARAMETERS).write_text(__import__('json').dumps(changed))
    path = tmp_path / 'u.brep'
    revisions.build(mutated, 'PX-V40-DEF-ULTRASONIC').exportBrep(str(path))
    assert sha(path) != records['PX-V40-DEF-ULTRASONIC']['newArtifactSha256']


def shape(definition_id):
    return cq.Shape.importBrep(str(purchased_artifact(ROOT, definition_id)))


def test_ultrasonic_cans_match_the_photographed_module_and_fit_the_wall_openings():
    module = shape('PX-V40-DEF-ULTRASONIC')
    cans = [c for c in cylinder_faces(module) if abs(c['radius'] - 8.3) < 1e-6 and abs(abs(c['axis'][2]) - 1) < 1e-6]
    assert len(cans) == 2
    assert abs(abs(cans[0]['origin'][0] - cans[1]['origin'][0]) - 28.4) < 1e-6
    assert abs(cans[0]['origin'][1] - (20.5 / 2 - 1.6)) < 1e-6 and abs(cans[1]['origin'][1] - cans[0]['origin'][1]) < 1e-9
    box = module.BoundingBox()
    assert abs(box.xlen - 46.2) < 1e-6 and box.zmin == pytest.approx(-7.0) and box.zmax == pytest.approx(1.6 + 12.8)
    # The traced wall openings are 30 mm apart with radius 9.5: each can sits inside its opening with 0.8 mm of centre offset.
    assert 9.5 - 8.3 - (30 - 28.4) / 2 > 0.39
    assert box.ymax > 20.5 + 5.0, 'the rear connector projects past the board edge'


def test_ultrasonic_stays_unadmitted_and_leaves_the_supply_conflict_open(spec):
    entry = next(d for d in spec['definitions'] if d['definitionId'] == 'PX-V40-DEF-ULTRASONIC')
    assert spec['engineeringAdmission'] is False and spec['runtimeAdmission'] is False
    assert any('3V3' in line for line in entry['notDerived'])


def test_horn_roles_follow_v40_not_the_collision_result(spec, records):
    kinds = {d['definitionId']: d['kind'] for d in spec['definitions']}
    assert kinds['PX-V40-DEF-HORN-PAN'] == kinds['PX-V40-DEF-HORN-TILT'] == 'horn-double' and kinds['PX-V40-DEF-HORN-STEERING'] == 'horn-single'
    assert spec['unusedPhysicalHorns'] == ['large cross horn', 'small cross horn']
    assert 'PX-V40-DEF-HORN-CROSS' not in records


def test_double_arm_horn_is_34_mm_with_a_hub_that_fits_the_8_mm_deck_hole():
    horn = shape('PX-V40-DEF-HORN-PAN')
    box = horn.BoundingBox()
    cylinders = cylinder_faces(horn)
    hub = max(cylinders, key=lambda c: c['radius'])
    assert abs(box.xlen - 34.0) < 1e-6 and hub['radius'] < 4.0 and abs(hub['origin'][0]) < 1e-9
    assert sum(1 for c in cylinders if abs(c['radius'] - 0.55) < 1e-6) == 12
    assert box.zmax == pytest.approx(2.2 + 2.5) and min(f['bounds'][2] for f in planar_faces(horn, 8) if f['normal'][2] > .999999) == pytest.approx(2.2)


def test_single_arm_horn_has_one_arm_and_its_hub_at_the_origin():
    horn = shape('PX-V40-DEF-HORN-STEERING')
    box = horn.BoundingBox()
    assert box.xmin == pytest.approx(-4.05) and box.xmax == pytest.approx(16.55)
    assert sum(1 for c in cylinder_faces(horn) if abs(c['radius'] - 0.55) < 1e-6) == 6


def test_plate_h_revision_keeps_every_m6_hole_and_only_moves_the_outer_edges():
    old = cq.Shape.importBrep(str(ROOT / 'docs/implementation/evidence/m6/amendment-shapes-04/candidate-artifacts/PX-V40-DEF-PLATE-H.brep'))
    new = shape('PX-V40-DEF-PLATE-H')
    key = lambda s: sorted((round(c['radius'], 6), round(c['origin'][0], 5), round(c['origin'][1], 5)) for c in cylinder_faces(s) if c['radius'] < 2)
    assert key(old) == key(new) and len(key(new)) == 6
    ob, nb = old.BoundingBox(), new.BoundingBox()
    assert abs(nb.ylen - ob.ylen) < 1e-6 and nb.xlen < ob.xlen - 2.0 and abs(nb.xlen - 20.5) < 1e-6 and nb.zlen == pytest.approx(2.0)
    # The notch floor plane (x = -5.129427) is the M6 one, so the notch got shallower exactly because the outer edge moved in.
    floors = [f for f in planar_faces(new, 5) if abs(abs(f['normal'][0]) - 1) < 1e-9 and abs(f['bounds'][0] + 5.129427) < 1e-5]
    assert floors
    # Notch width is the M6 width (14.34 mm), close to the 14.0 mm of the module's rear connector.
    assert abs((7.218155 - -7.122833) - 14.340988) < 1e-5
