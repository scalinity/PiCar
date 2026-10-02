"""Read-only diagnostic: where each pair of placed instructional solids intersects (bounds and volume). Not a gate."""
import argparse
import itertools
import json
from pathlib import Path
import cadquery as cq
from ...contracts import load
from .verify import rigid, placed, purchased_artifact

M6_PLATES = 'docs/implementation/evidence/m6/amendment-shapes-04/candidate-artifacts/'
M5_ARTIFACTS = 'digital-twin/validation/expected/m5/instructional-artifacts/'


def shapes_of(root, variant, placements, artifacts=None):
    graph = load(root / f'digital-twin/validation/m2/{variant}/compiled-graph.json')
    definition_of = {i['id']: i['definitionId'] for i in graph['instances']}
    out = {}
    for p in placements:
        d = definition_of[p['instanceId']]
        path = purchased_artifact(root, d)
        if not path.exists():
            continue
        out[p['instanceId']] = placed(cq.Shape.importBrep(str(path)), *rigid(p))
    return out


def probe(shapes, only):
    rows = []
    for a, b in itertools.combinations(sorted(shapes), 2):
        if only and not (a in only or b in only):
            continue
        common = shapes[a].intersect(shapes[b])
        v = float(common.Volume())
        if v > 1e-7:
            box = common.BoundingBox()
            rows.append({'instances': [a, b], 'volumeMm3': round(v, 3), 'min': [round(box.xmin, 3), round(box.ymin, 3), round(box.zmin, 3)],
                         'max': [round(box.xmax, 3), round(box.ymax, 3), round(box.zmax, 3)]})
    return rows


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', required=True, type=Path)
    parser.add_argument('--variant', required=True)
    parser.add_argument('--closure', required=True, type=Path, help='closure whose placements are the context')
    parser.add_argument('--record', type=Path, default=None, help='step record whose placements are added')
    parser.add_argument('--only', nargs='*', default=[])
    args = parser.parse_args()
    placements = load(args.closure)['placements']
    if args.record:
        placements = placements + load(args.record)['placements']
    print(json.dumps(probe(shapes_of(args.root, args.variant, placements), set(args.only)), indent=1))


if __name__ == '__main__':
    main()
