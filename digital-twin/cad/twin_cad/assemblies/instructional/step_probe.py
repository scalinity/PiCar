"""Read-only probe of the acquired Pi5 reference STEP: prints derived numbers only, never vendor geometry."""
import argparse
import json
from pathlib import Path
import cadquery as cq


def probe(step_path, region):
    shape = cq.importers.importStep(str(step_path)).val()
    x0, y0, z0, x1, y1, z1 = region
    rows = []
    for index, solid in enumerate(shape.Solids()):
        b = solid.BoundingBox()
        if b.xmin >= x0 and b.xmax <= x1 and b.ymin >= y0 and b.ymax <= y1 and b.zmin >= z0 and b.zmax <= z1:
            rows.append({'index': index, 'boundsMm': [round(v, 4) for v in (b.xmin, b.ymin, b.zmin, b.xmax, b.ymax, b.zmax)],
                         'volumeMm3': round(float(solid.Volume()), 4), 'faces': len(solid.Faces())})
    return {'solidCount': len(shape.Solids()), 'inRegion': rows}


def section(step_path, indices, plane, at, window, pitch):
    """ASCII occupancy of chosen solids on an axis plane; one letter per solid index in the order given."""
    solids = cq.importers.importStep(str(step_path)).val().Solids()
    chosen = [solids[i] for i in indices]
    a0, a1, b0, b1 = window
    lines = []
    b = b1
    while b >= b0:
        row, a = '', a0
        while a <= a1:
            point = {'XZ': cq.Vector(a, at, b), 'YZ': cq.Vector(at, a, b), 'XY': cq.Vector(a, b, at)}[plane]
            hit = [chr(65 + k) for k, s in enumerate(chosen) if s.isInside(point, 1e-7)]
            row += hit[0] if hit else '.'
            a += pitch
        lines.append(f'{b:7.3f} {row}')
        b -= pitch
    return lines


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--step', required=True, type=Path)
    parser.add_argument('--region', type=json.loads, help='[xmin,ymin,zmin,xmax,ymax,zmax] mm in native STEP coordinates')
    parser.add_argument('--section', type=json.loads, help='{"indices":[..],"plane":"XZ","at":8.5,"window":[a0,a1,b0,b1],"pitch":0.05}')
    args = parser.parse_args()
    if args.section:
        print('\n'.join(section(args.step, args.section['indices'], args.section['plane'], args.section['at'], args.section['window'], args.section['pitch'])))
    else:
        print(json.dumps(probe(args.step, args.region)))


if __name__ == '__main__':
    main()
