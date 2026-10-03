"""Owner-requested display-only Robot HAT outline; checked artifacts and poses are untouched.

The locked S04 source review already identifies the truncated 65 x 56 proxy versus a roughly 85 x 56 board.
Extend only the PCB at the Pi's overhanging end; keep the adopted bores, socket and schematic top components.
No copied drawing pixels, measured dimensions, corrected component layout or engineering admission.
"""
import argparse
import json
import math
from pathlib import Path
import cadquery as cq
from . import pi5

ID = 'PX-V40-DEF-ROBOT-HAT'
INSTANCE = 'PX-V40-INS-ROBOT-HAT-001'
REVIEW = 'digital-twin/assemblies/v40/presentation/instructional/hat-outline-display-review-01.json'
INSTRUCTIONAL = 'digital-twin/validation/expected/m5/instructional-artifacts/PX-V40-DEF-ROBOT-HAT.brep'
ADOPTED = 'engagement/PX-V40-DEF-ROBOT-HAT-INSTRUCTIONAL-02.brep'


def build(root, chain):
    review = json.loads((root / REVIEW).read_text())
    parts = cq.Shape.importBrep(str(chain / ADOPTED)).Solids()
    index = next(i for i, s in enumerate(parts) if abs(s.BoundingBox().zlen - 1.6) < 1e-6 and s.BoundingBox().xlen > 64)
    pcb = parts[index]
    b = pcb.BoundingBox()
    if max(abs(a - e) for a, e in zip((b.xmin, b.ymin, b.zmin, b.xmax, b.ymax, b.zmax), (0, 0, 0, 65, 56, 1.6))) > 1e-6:
        raise ValueError('HAT_OUTLINE_PREDECESSOR_CHANGED')
    p = review['parameters']
    l, w, r = p['lengthMm'], p['widthMm'], p['cornerRadiusMm']
    k = r * (1 - math.cos(math.pi / 4))
    outline = (cq.Workplane('XY').moveTo(r, 0).lineTo(l - r, 0).threePointArc((l - k, k), (l, r))
               .lineTo(l, w - r).threePointArc((l - k, w - k), (l - r, w))
               .lineTo(r, w).threePointArc((k, w - k), (0, w - r))
               .lineTo(0, r).threePointArc((k, k), (r, 0)).close().extrude(p['thicknessMm']))
    for x, y in pi5.hole_centres(pcb, 1.4):
        outline = outline.cut(cq.Workplane('XY').center(x, y).circle(1.4).extrude(p['thicknessMm']))
    parts[index] = outline.val()
    names = [('PCB outline (approximate)', 'pcb-blue') if i == index else
             ('Schematic speaker', 'speaker-dark') if i == 1 else
             ('Underside socket (schematic)', 'header-black') if i == len(parts) - 1 else
             (f'Schematic connector {i - 1}', 'connector-cream') for i in range(len(parts))]
    return [(n, m, s) for (n, m), s in zip(names, parts)]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    for name in ('root', 'chain', 'output'):
        parser.add_argument('--' + name, type=Path, required=True)
    args = parser.parse_args()
    parts = build(args.root, args.chain)
    shape = pi5.compound(parts)
    if not shape.isValid():
        raise ValueError('INVALID_HAT_DISPLAY')
    args.output.mkdir(parents=True, exist_ok=True)
    artifact = args.output / f'{ID}.display.brep'
    shape.exportBrep(str(artifact))
    digest = pi5.sha256_file(artifact)
    review = json.loads((args.root / REVIEW).read_text())
    predecessor = args.chain / ADOPTED
    holes = pi5.hole_centres(parts[0][2], 1.4)
    old = cq.Shape.importBrep(str(predecessor)).Solids()
    relation = {'instructionalArtifact': {'definitionId': ID, 'path': INSTRUCTIONAL, 'sha256': pi5.sha256_file(args.root / INSTRUCTIONAL)},
                'pcbBoxMm': [0, 0, 0, 85, 56, 1.6],
                'mountingHoles': {'display': holes, 'instructional': [], 'maxCentreDeviationMm': None,
                                  'adoptedReference': pi5.hole_centres(old[0], 1.4), 'method': 'Preserve adopted HAT bores; original checked M5 proxy has no bores'},
                'adoptedPredecessor': {'path': 'chain:' + ADOPTED, 'sha256': pi5.sha256_file(predecessor)}}
    adopted_path = (args.chain.resolve().relative_to(args.root.resolve()) / ADOPTED).as_posix()
    bindings = [{'path': p, 'sha256': pi5.sha256_file(args.root / p)} for p in
                (REVIEW, review['sourceReview'], 'digital-twin/cad/twin_cad/fidelity/hat.py', 'digital-twin/cad/twin_cad/fidelity/pi5.py', adopted_path)]
    record = {'schema': pi5.SCHEMA, 'definitionId': ID, 'kind': 'display-detail', 'track': 'presentation-only',
              'source': 'Locked V40 S04 source-supported approximate PCB outline; 85 x 56 mm visual envelope, not measured stock. Top features remain schematic.',
              'assemblyEnvelope': 'Original M5/M7 instructional artifacts and all poses unchanged; assembly checks do not use this display outline',
              'artifact': artifact.name, 'artifactSha256': digest, 'sourceBindings': bindings,
              'solids': [{'index': i, 'name': n, 'materialId': m} for i, (n, m, _) in enumerate(parts)],
              'relation': relation, 'limitations': review['limitations'],
              'overlaps': {'chain': args.chain.name, 'method': 'Boolean common of displayed HAT with other instructional artifacts in exact closure states; detailed-display pairs are not measured',
                           'displayArtifactSha256': digest, 'instructionalArtifactSha256': relation['instructionalArtifact']['sha256'],
                           **pi5.overlaps(args.root, args.chain, shape, INSTANCE)}}
    (args.output / f'{ID}.display.json').write_text(json.dumps(record, indent=1) + '\n')
    print(json.dumps({'solids': len(parts), 'artifactSha256': digest, 'pcbBoxMm': relation['pcbBoxMm'],
                      'mountingBores': len(holes), 'unchangedTopComponents': len(parts) - 2, 'checkedClosures': len(record['overlaps']['closures'])}))


if __name__ == '__main__':
    main()
