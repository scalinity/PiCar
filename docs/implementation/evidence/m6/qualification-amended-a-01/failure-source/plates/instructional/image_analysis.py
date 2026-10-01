"""Private-source inspection and projective calibration for instructional plates.

Original image bytes are only read. Derived raster products must stay inside the
repository's ignored private evidence root. No engineering measurement is emitted.
"""
import argparse
import csv
import hashlib
from pathlib import Path

from PIL import Image, ImageDraw, ImageOps


def manifest(package):
    with (package / 'PHOTO_MANIFEST.csv').open(newline='') as stream:
        rows = list(csv.DictReader(stream))
    expected = {'A': 13, 'B': 7, 'C': 14, 'D': 6, 'E': 8, 'F': 6,
                'G': 3, 'H': 3, 'E-F': 2}
    counts = {}
    for row in rows:
        counts[row['plate']] = counts.get(row['plate'], 0) + 1
        raw = (package / row['relative_path']).read_bytes()
        if hashlib.sha256(raw).hexdigest() != row['sha256']:
            raise ValueError('SOURCE_HASH_DRIFT')
    if counts != expected or len({r['sha256'] for r in rows}) != 62:
        raise ValueError('SOURCE_COUNTS_OR_DUPLICATES')
    return rows


def contacts(package, output):
    rows = manifest(package)
    output.mkdir(parents=True, exist_ok=True)
    for folder in dict.fromkeys(r['folder'] for r in rows):
        members = [r for r in rows if r['folder'] == folder]
        sheet = Image.new('RGB', (1200, ((len(members)+2)//3)*350), 'white')
        draw = ImageDraw.Draw(sheet)
        for index, row in enumerate(members):
            with Image.open(package / row['relative_path']) as original:
                thumb = ImageOps.exif_transpose(original).convert('RGB')
                thumb.thumbnail((390, 290))
            x, y = (index % 3)*400, (index//3)*350
            sheet.paste(thumb, (x, y))
            draw.text((x+4, y+293), row['new_filename'][:58], fill='black')
            draw.text((x+4, y+311), row['view'], fill='black')
            draw.text((x+4, y+329), 'card: '+row['card_visibility'], fill='black')
        sheet.save(output / (folder+'.png'))
    return len(rows)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--package', type=Path, required=True)
    parser.add_argument('--private-output', type=Path, required=True)
    args = parser.parse_args()
    repository = args.package.resolve().parents[2]
    private = repository / 'digital-twin/evidence/private/m6'
    if not args.private_output.resolve().is_relative_to(private.resolve()):
        raise ValueError('PRIVATE_OUTPUT_REQUIRED')
    print('Verified and inspected '+str(contacts(args.package, args.private_output))+' manifest images')


if __name__ == '__main__':
    main()
