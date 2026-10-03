"""Robot HAT V4 display-detail model: the owner's board, reconstructed from the owner's photographs and scans.

Geometry is built by hat_board.py from hat-detail-display-review-02.json, which states every dimension's basis
(datum, scan, photo, standard or approximate). Registered in the adopted instructional HAT frame: the four bores and
the board plane are the adopted ones, so every pose, recipe and closure is untouched. Display only: assembly checks keep
the M5/M7 instructional artifact; `relation` and `overlaps` record how the two agree (schema picar-studio-display-check/1).

  PYTHONPATH=digital-twin/cad <py> -m twin_cad.fidelity.hat --root <repo> --chain <chain-run> --output <dir>
"""
import argparse
import hashlib
import json
import math
from pathlib import Path

import cadquery as cq

from . import hat_board, pi5

ID = 'PX-V40-DEF-ROBOT-HAT'
INSTANCE = 'PX-V40-INS-ROBOT-HAT-001'
REVIEW = 'digital-twin/assemblies/v40/presentation/instructional/hat-detail-display-review-02.json'
INSTRUCTIONAL = 'digital-twin/validation/expected/m5/instructional-artifacts/PX-V40-DEF-ROBOT-HAT.brep'
ADOPTED = 'engagement/PX-V40-DEF-ROBOT-HAT-INSTRUCTIONAL-02.brep'


def adopted_bores(chain):
    """The adopted instructional HAT's four bores, measured on its PCB solid; refuses a changed predecessor."""
    parts = cq.Shape.importBrep(str(chain / ADOPTED)).Solids()
    pcb = next(s for s in parts if abs(s.BoundingBox().zlen - 1.6) < 1e-6 and s.BoundingBox().xlen > 64)
    b = pcb.BoundingBox()
    if max(abs(a - e) for a, e in zip((b.xmin, b.ymin, b.zmin, b.xmax, b.ymax, b.zmax), (0, 0, 0, 65, 56, 1.6))) > 1e-6:
        raise ValueError('HAT_PREDECESSOR_CHANGED')
    return pi5.hole_centres(pcb, 1.4)


def overlaps(root, chain, parts, instance_id=INSTANCE):
    """pi5.overlaps for a many-solid display model: each display solid is placed in every closure that places the HAT and
    intersected with every other placed part whose box it meets. The hidden joins pass through one another only inside
    the board volume and away from the bores, so a part reaching that region would be counted once per solid it meets;
    each positive row names those solids."""
    import rfc8785
    from twin_cad.assemblies.instructional.closure import shape_path
    from twin_cad.assemblies.instructional.verify import placed, rigid
    dirs = {'root': root, 'artifacts': chain / 'remediation', 'boards': chain / 'anchor' / 'boards'}
    cache, part_hashes, closures, rows = {}, {}, [], []
    def hit(a, b):
        return not (a.xmin > b.xmax or a.xmax < b.xmin or a.ymin > b.ymax or a.ymax < b.ymin or a.zmin > b.zmax or a.zmax < b.zmin)
    for closure in sorted((chain / 'chain' / 'closures').glob('*-closure.json')):
        record = json.loads(closure.read_text())
        poses = {p['instanceId']: p for p in record['placements']}
        if instance_id not in poses:
            continue
        graph = json.loads((root / f'digital-twin/validation/m2/{record["variantId"]}/compiled-graph.json').read_text())
        definition_of = {i['id']: i['definitionId'] for i in graph['instances']}
        identity = {'variantId': record['variantId'], 'step': record['printedNumber'], 'closureRfc8785Sha256': hashlib.sha256(rfc8785.dumps(record)).hexdigest()}
        closures.append(identity)
        mine = [(name, placed(s, *rigid(poses[instance_id]))) for name, _, s in parts]
        boxes = [(name, s, s.BoundingBox()) for name, s in mine]
        envelope = cq.Compound.makeCompound([s for _, s in mine]).BoundingBox()
        for iid, pose in sorted(poses.items()):
            if iid == instance_id:
                continue
            d = definition_of[iid]
            if d not in cache:
                path = shape_path(d, dirs)
                cache[d], part_hashes[d] = cq.Shape.importBrep(str(path)), pi5.sha256_file(path)
            other = placed(cache[d], *rigid(pose))
            ob = other.BoundingBox()
            if not hit(envelope, ob):
                continue
            met = [(name, s.intersect(other).Volume()) for name, s, bb in boxes if hit(bb, ob)]
            met = [(n, v) for n, v in met if v > 1e-6]
            volume = sum(v for _, v in met)
            if volume > 1e-3:
                rows.append({**identity, 'instanceId': iid, 'volumeMm3': round(volume, 4), 'displaySolids': [n for n, _ in met]})
    return {'partArtifacts': dict(sorted(part_hashes.items())), 'closures': closures, 'positive': rows}


def build(root, chain):
    review = json.loads((root / REVIEW).read_text())
    bores = adopted_bores(chain)
    if sorted(map(tuple, review['mountingHoles']['centres'])) != sorted(bores):
        raise ValueError(f'HAT_BORES_DIFFER review={review["mountingHoles"]["centres"]} adopted={bores}')
    return review, hat_board.build(review)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    for name in ('root', 'chain', 'output'):
        parser.add_argument('--' + name, type=Path, required=True)
    args = parser.parse_args()
    review, parts = build(args.root, args.chain)
    shape = pi5.compound(parts)
    if not shape.isValid() or len(shape.Solids()) != len(parts):
        raise ValueError('INVALID_HAT_DISPLAY')
    args.output.mkdir(parents=True, exist_ok=True)
    artifact = args.output / f'{ID}.display.brep'
    shape.exportBrep(str(artifact))
    digest = pi5.sha256_file(artifact)
    predecessor = args.chain / ADOPTED
    board = cq.Compound.makeCompound([s for _, _, s in parts[:3]]).BoundingBox()
    holes = pi5.hole_centres(parts[0][2], review['mountingHoles']['radiusMm'])
    adopted = pi5.hole_centres(cq.Shape.importBrep(str(predecessor)).Solids()[0], 1.4)
    deviation = max(min(math.dist(h, a) for a in adopted) for h in holes)
    gpio = review['gpio']
    pads = [(gpio['x0'] + gpio['pitch'] * i, y) for i in range(gpio['count']) for y in gpio['rows']]
    relation = {'instructionalArtifact': {'definitionId': ID, 'path': INSTRUCTIONAL, 'sha256': pi5.sha256_file(args.root / INSTRUCTIONAL)},
                'pcbBoxMm': [round(v, 3) for v in (board.xmin, board.ymin, board.zmin, board.xmax, board.ymax, board.zmax)],
                'mountingHoles': {'display': holes, 'instructional': [], 'adoptedReference': adopted, 'maxCentreDeviationMm': round(deviation, 6),
                                  'method': 'vertical cylinder features measured on the display PCB core and on the adopted HAT; the original checked M5 proxy has no bores'},
                'gpio': {'padCentreMm': [round(sum(p[0] for p in pads) / len(pads), 4), round(sum(p[1] for p in pads) / len(pads), 4)],
                         'socketBoxMm': [gpio['socket'][k] for k in ('x0', 'y0')] + [-gpio['socket']['depth']] + [gpio['socket'][k] for k in ('x1', 'y1')] + [0],
                         'note': 'display pads and socket follow the photographs; the instructional schematic socket is unchanged'},
                'adoptedPredecessor': {'path': 'chain:' + ADOPTED, 'sha256': pi5.sha256_file(predecessor)}}
    adopted_path = (args.chain.resolve().relative_to(args.root.resolve()) / ADOPTED).as_posix()
    bindings = [{'path': p, 'sha256': pi5.sha256_file(args.root / p)} for p in
                (REVIEW, review['sourceReview'], 'digital-twin/cad/twin_cad/fidelity/hat.py', 'digital-twin/cad/twin_cad/fidelity/hat_board.py',
                 'digital-twin/cad/twin_cad/fidelity/pi5.py', adopted_path)]
    fonts = {w: hashlib.sha256(Path(hat_board.font(w)).read_bytes()).hexdigest() for w in ('bold', 'regular')}
    record = {'schema': pi5.SCHEMA, 'definitionId': ID, 'kind': 'display-detail', 'track': 'presentation-only',
              'source': "Robot HAT V4 reconstructed from the owner's 609 photographs and two Object Capture scans, registered on the adopted bores; "
                        'every dimension labelled datum, scan, photo, standard or approximate in the display review. Not measured stock.',
              'assemblyEnvelope': 'Original M5/M7 instructional artifacts and all poses unchanged; assembly checks do not use this display model',
              'artifact': artifact.name, 'artifactSha256': digest, 'sourceBindings': bindings,
              'fonts': {'source': 'matplotlib DejaVu Sans in the frozen M4 environment', 'sha256': fonts},
              'solids': [{'index': i, 'name': n, 'materialId': m} for i, (n, m, _) in enumerate(parts)],
              'relation': relation, 'limitations': review['limitations'],
              'overlaps': {'chain': args.chain.name, 'method': 'Boolean common of each displayed HAT solid with other instructional artifacts in exact closure states, summed per part; detailed-display pairs are not measured',
                           'displayArtifactSha256': digest, 'instructionalArtifactSha256': relation['instructionalArtifact']['sha256'],
                           **overlaps(args.root, args.chain, parts)}}
    (args.output / f'{ID}.display.json').write_text(json.dumps(record, indent=1) + '\n')
    print(json.dumps({'solids': len(parts), 'artifactSha256': digest, 'pcbBoxMm': relation['pcbBoxMm'], 'mountingBores': len(holes),
                      'boreDeviationMm': relation['mountingHoles']['maxCentreDeviationMm'], 'checkedClosures': len(record['overlaps']['closures']),
                      'positiveOverlaps': len(record['overlaps']['positive'])}))


if __name__ == '__main__':
    main()
