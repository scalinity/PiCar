"""Read-only inspection of an authored BRep: per-solid bounds, volume and cylinder features, optionally under a pose."""
import argparse
import json
from pathlib import Path
import cadquery as cq
import numpy as np
from .verify import placed, shape_features


def solids(shape, rotation=None, translation=None):
    if rotation is not None:
        shape = placed(shape, np.array(rotation, dtype=np.float64), np.array(translation, dtype=np.float64))
    rows = []
    for i, s in enumerate(shape.Solids()):
        b = s.BoundingBox()
        rows.append({'index': i, 'boundsMm': [round(v, 6) for v in (b.xmin, b.ymin, b.zmin, b.xmax, b.ymax, b.zmax)],
                     'volumeMm3': round(float(s.Volume()), 6),
                     'cylinders': [{'radius': round(c['radius'], 6), 'origin': [round(float(v), 6) for v in c['origin']],
                                    'axis': [round(float(v), 6) for v in c['axis']]} for c in shape_features(s)]})
    return rows


def planar_faces(shape, rotation=None, translation=None, minimum_area=1.0):
    """Planar faces with their outward normal, center and extent; larger faces first."""
    if rotation is not None:
        shape = placed(shape, np.array(rotation, dtype=np.float64), np.array(translation, dtype=np.float64))
    rows = []
    for face in shape.Faces():
        if face.geomType() != 'PLANE' or face.Area() < minimum_area:
            continue
        b = face.BoundingBox()
        rows.append({'normal': [round(float(v), 6) + 0.0 for v in face.normalAt().toTuple()], 'centerMm': [round(float(v), 4) for v in face.Center().toTuple()],
                     'areaMm2': round(float(face.Area()), 3), 'boundsMm': [round(v, 4) for v in (b.xmin, b.ymin, b.zmin, b.xmax, b.ymax, b.zmax)]})
    return sorted(rows, key=lambda r: -r['areaMm2'])


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--brep', required=True, type=Path)
    parser.add_argument('--rotation', type=json.loads, default=None, help='3x3 rotation as JSON')
    parser.add_argument('--translation', type=json.loads, default=None, help='translation mm as JSON')
    parser.add_argument('--no-cylinders', action='store_true')
    parser.add_argument('--planar-faces', action='store_true', help='list planar faces instead of solids')
    args = parser.parse_args()
    if args.planar_faces:
        print(json.dumps(planar_faces(cq.Shape.importBrep(str(args.brep)), args.rotation, args.translation)))
        return
    rows = solids(cq.Shape.importBrep(str(args.brep)), args.rotation, args.translation)
    if args.no_cylinders:
        for r in rows:
            r.pop('cylinders')
    print(json.dumps(rows))


if __name__ == '__main__':
    main()
