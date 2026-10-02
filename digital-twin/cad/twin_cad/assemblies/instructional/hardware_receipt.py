"""Hash-only receipts for the private M7 owner photograph packages; no image bytes or pixels are copied or recorded."""
import argparse
import csv
import hashlib
import json
from pathlib import Path
import rfc8785
from ...contracts import Invalid

README, MANIFEST = 'README.md', 'PHOTO_MANIFEST.csv'
FOLDER_COUNTS = {'Ultrasonic-Module': 12, 'Servo-SF006C': 10, 'Servo-Horns': 12, 'Drive-Motor': 8, 'Manual-Reference': 1}
FIELDS = ['new_filename', 'original_filename', 'component', 'subtype', 'folder', 'view', 'face_or_orientation', 'scale_reference_card', 'scale_reference_penny',
          'physical_evidence', 'documentary_reference', 'sha256', 'byte_size', 'pixel_width', 'pixel_height', 'notes']
PLATE_A_S09_COUNTS = {'Plate-A-S09': 12}
PLATE_A_S09_FIELDS = ['new_filename', 'original_filename', 'component', 'evidence_scope', 'folder', 'view', 'face_or_orientation', 'scale_reference_card',
                      'scale_reference_penny', 'scale_reference_quarter', 'physical_evidence', 'owner_confirmed_ultrasonic_openings', 'sha256', 'byte_size',
                      'pixel_width', 'pixel_height', 'notes']
CONSOLIDATED_S09_COUNTS = {'Plate-A-S09': 12, 'Ultrasonic-Module': 14, 'Plate-A-Ultrasonic-Physical-Fit': 5, 'Assembled-Reference': 1}
CONSOLIDATED_S09_FIELDS = ['new_filename', 'original_filename', 'component', 'subtype', 'folder', 'view', 'orientation', 'scale_reference_card',
                           'scale_reference_penny', 'scale_reference_quarter', 'physical_evidence', 'documentary_reference', 'owner_confirmed_context', 'sha256',
                           'byte_size', 'pixel_width', 'pixel_height', 'notes']
HANDLING = ('Hashes, filenames, classifications and derived dimensions only. Photographs, crops, overlays and masks stay in ignored private locations and are '
            'never staged, published or copied into application assets.')


def sha256(path):
    h = hashlib.sha256()
    with open(path, 'rb') as f:
        for chunk in iter(lambda: f.read(1 << 20), b''):
            h.update(chunk)
    return h.hexdigest()


def verified_rows(package, fields, folder_counts):
    """Manifest rows whose files exist exactly as listed, with matching SHA-256 and byte size, and nothing else on disk."""
    if not (package / README).is_file() or not (package / MANIFEST).is_file():
        raise Invalid('PACKAGE_DOCUMENTS_MISSING')
    with open(package / MANIFEST, newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        if reader.fieldnames != fields:
            raise Invalid('MANIFEST_COLUMNS')
        rows = list(reader)
    on_disk = sorted(p.relative_to(package).as_posix() for p in package.rglob('*') if p.is_file() and p.name not in (README, MANIFEST))
    listed = sorted(f"{r['folder']}/{r['new_filename']}" for r in rows)
    if on_disk != listed or len(set(listed)) != len(listed):
        raise Invalid('MANIFEST_MEMBERSHIP')
    counts = {}
    for r in rows:
        path = package / r['folder'] / r['new_filename']
        if sha256(path) != r['sha256'] or path.stat().st_size != int(r['byte_size']):
            raise Invalid('IMAGE_HASH_OR_SIZE ' + r['new_filename'])
        counts[r['folder']] = counts.get(r['folder'], 0) + 1
    if counts != folder_counts or len({r['sha256'] for r in rows}) != len(rows):
        raise Invalid('PACKAGE_COMPOSITION')
    return rows


def package_identity(package, images, counts):
    return {'directoryName': package.name, 'readmeSha256': sha256(package / README), 'manifestSha256': sha256(package / MANIFEST), 'imageCount': len(images),
            'folderCounts': counts}


def build(package):
    package = Path(package)
    rows = verified_rows(package, FIELDS, FOLDER_COUNTS)
    images = [{'path': f"{r['folder']}/{r['new_filename']}", 'originalFilename': r['original_filename'], 'sha256': r['sha256'], 'byteSize': int(r['byte_size']),
               'pixelSize': [int(r['pixel_width']), int(r['pixel_height'])], 'component': r['component'], 'subtype': r['subtype'], 'view': r['view'],
               'face': r['face_or_orientation'], 'cardVisible': r['scale_reference_card'] == 'yes', 'pennyVisible': r['scale_reference_penny'] == 'yes',
               'physicalEvidence': r['physical_evidence'] == 'yes', 'documentaryReference': r['documentary_reference'] == 'yes'} for r in rows]
    identity = package_identity(package, images, FOLDER_COUNTS)
    identity.update({'physicalImageCount': sum(i['physicalEvidence'] for i in images), 'documentaryImageCount': sum(i['documentaryReference'] for i in images)})
    return {'id': 'PX-M7-HARDWARE-EVIDENCE-RECEIPT-04', 'revision': 4, 'track': 'instructional-only', 'privacy': 'PRIVATE_OWNER_EVIDENCE',
            'package': identity, 'images': sorted(images, key=lambda i: i['path']), 'handling': HANDLING, 'engineeringAdmission': False, 'runtimeAdmission': False}


def build_plate_a_s09(package):
    package = Path(package)
    rows = verified_rows(package, PLATE_A_S09_FIELDS, PLATE_A_S09_COUNTS)
    images = [{'path': f"{r['folder']}/{r['new_filename']}", 'originalFilename': r['original_filename'], 'sha256': r['sha256'], 'byteSize': int(r['byte_size']),
               'pixelSize': [int(r['pixel_width']), int(r['pixel_height'])], 'component': r['component'], 'evidenceScope': r['evidence_scope'], 'view': r['view'],
               'face': r['face_or_orientation'], 'cardVisible': r['scale_reference_card'] == 'yes', 'pennyVisible': r['scale_reference_penny'] == 'yes',
               'quarterVisible': r['scale_reference_quarter'] == 'yes', 'physicalEvidence': r['physical_evidence'] == 'yes',
               'showsOwnerConfirmedUltrasonicOpenings': r['owner_confirmed_ultrasonic_openings'] == 'yes'} for r in rows]
    return {'id': 'PX-M7-PLATE-A-S09-EVIDENCE-RECEIPT-05', 'revision': 5, 'track': 'instructional-only', 'privacy': 'PRIVATE_OWNER_EVIDENCE',
            'package': package_identity(package, images, PLATE_A_S09_COUNTS), 'images': sorted(images, key=lambda i: i['path']),
            'ownerStatements': [{'statement': "The two large circular openings in Plate A's front upright wall are where the ultrasonic module's two transducer cans fit.",
                                 'status': 'OWNER_CONFIRMED_ASSEMBLY_CONTEXT', 'note': 'An assembly relationship, not a dimensional measurement.'}],
            'handling': HANDLING, 'engineeringAdmission': False, 'runtimeAdmission': False}


def build_consolidated_s09(package, prior):
    """`prior` maps an earlier receipt id to its image hashes; each image records which earlier receipts already hold its exact bytes."""
    package = Path(package)
    rows = verified_rows(package, CONSOLIDATED_S09_FIELDS, CONSOLIDATED_S09_COUNTS)
    images = [{'path': f"{r['folder']}/{r['new_filename']}", 'originalFilename': r['original_filename'], 'sha256': r['sha256'], 'byteSize': int(r['byte_size']),
               'pixelSize': [int(r['pixel_width']), int(r['pixel_height'])], 'component': r['component'], 'subtype': r['subtype'], 'view': r['view'],
               'face': r['orientation'], 'cardVisible': r['scale_reference_card'] == 'yes', 'pennyVisible': r['scale_reference_penny'] == 'yes',
               'quarterVisible': r['scale_reference_quarter'] == 'yes', 'physicalEvidence': r['physical_evidence'] == 'yes',
               'documentaryReference': r['documentary_reference'] == 'yes', 'ownerConfirmedContext': r['owner_confirmed_context'] == 'yes',
               'alsoInReceipts': sorted(i for i, hashes in prior.items() if r['sha256'] in hashes)} for r in rows]
    identity = package_identity(package, images, CONSOLIDATED_S09_COUNTS)
    identity.update({'physicalImageCount': sum(i['physicalEvidence'] for i in images), 'documentaryImageCount': sum(i['documentaryReference'] for i in images)})
    return {'id': 'PX-M7-S09-CONSOLIDATED-EVIDENCE-RECEIPT-06', 'revision': 6, 'track': 'instructional-only', 'privacy': 'PRIVATE_OWNER_EVIDENCE',
            'package': identity, 'images': sorted(images, key=lambda i: i['path']), 'priorReceipts': sorted(prior),
            'ownerStatements': [{'statement': "The two large circular openings in Plate A's front upright wall are where the ultrasonic module's two transducer cans fit.",
                                 'status': 'OWNER_CONFIRMED_ASSEMBLY_CONTEXT', 'note': 'An assembly relationship, not a dimensional measurement.'},
                                {'statement': 'The five physical-fit photographs show the supplied module against the supplied Plate A with both cans in both openings at once.',
                                 'status': 'OWNER_OBSERVED_PHYSICAL_MATING', 'note': 'Direct mating evidence for relative geometry; no metrology or tolerance is implied.'}],
            'documentaryOnly': ['Assembled-Reference'], 'handling': HANDLING, 'engineeringAdmission': False, 'runtimeAdmission': False}


PROFILES = {'targeted-hardware': build, 'plate-a-s09': build_plate_a_s09}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--package', required=True, type=Path)
    parser.add_argument('--output', required=True, type=Path)
    parser.add_argument('--profile', choices=sorted(PROFILES) + ['consolidated-s09'], default='targeted-hardware')
    parser.add_argument('--prior', type=Path, nargs='*', default=[], help='earlier hash-only receipts to cross-reference (consolidated-s09 only)')
    args = parser.parse_args()
    if args.profile == 'consolidated-s09':
        prior = {}
        for path in args.prior:
            receipt = json.loads(path.read_text())
            prior[receipt['id']] = {i['sha256'] for i in receipt['images']}
        result = build_consolidated_s09(args.package, prior)
    else:
        result = PROFILES[args.profile](args.package)
    args.output.write_bytes(rfc8785.dumps(result) + b'\n')


if __name__ == '__main__':
    main()
