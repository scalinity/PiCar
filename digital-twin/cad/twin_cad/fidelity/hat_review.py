"""Review meshes and statistics for the Robot HAT display model.

Tessellates the registered display BRep with the Studio's tolerances (tools/studio/tessellate.py: 0.02 mm linear,
0.15 rad angular), writes one OBJ per solid plus scene.json (solid name, material, file) for the Blender review render,
and prints the statistics the display review records: solids, vertices, triangles, materials and file sizes.

  PYTHONPATH=digital-twin/cad <py> -m twin_cad.fidelity.hat_review --root "$PWD" --output <scratch dir>
"""
import argparse
import json
from pathlib import Path

import cadquery as cq
from OCP.BRep import BRep_Tool
from OCP.BRepMesh import BRepMesh_IncrementalMesh
from OCP.TopAbs import TopAbs_REVERSED
from OCP.TopLoc import TopLoc_Location

DISPLAY = 'digital-twin/validation/expected/m7/fidelity/display'
ID = 'PX-V40-DEF-ROBOT-HAT'
LINEAR, ANGULAR = 0.02, 0.15


def mesh(solid):
    verts, tris = [], []
    for face in solid.Faces():
        loc = TopLoc_Location()
        tri = BRep_Tool.Triangulation_s(face.wrapped, loc)
        trsf = loc.Transformation()
        rev = face.wrapped.Orientation() == TopAbs_REVERSED
        base = len(verts)
        for i in range(1, tri.NbNodes() + 1):
            p = tri.Node(i).Transformed(trsf)
            verts.append((p.X(), p.Y(), p.Z()))
        for i in range(1, tri.NbTriangles() + 1):
            a, b, c = tri.Triangle(i).Get()
            tris.append((base + a - 1, base + c - 1, base + b - 1) if rev else (base + a - 1, base + b - 1, base + c - 1))
    return verts, tris


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    record = json.loads((args.root / DISPLAY / f'{ID}.display.json').read_text())
    brep = args.root / DISPLAY / record['artifact']
    shape = cq.Shape.importBrep(str(brep))
    BRepMesh_IncrementalMesh(shape.wrapped, LINEAR, False, ANGULAR, True)
    args.output.mkdir(parents=True, exist_ok=True)
    scene, total_v, total_t = [], 0, 0
    for i, (solid, row) in enumerate(zip(shape.Solids(), record['solids'])):
        verts, tris = mesh(solid)
        name = f'solid-{i:02d}.obj'
        with open(args.output / name, 'w') as f:
            f.write(''.join(f'v {x:.5f} {y:.5f} {z:.5f}\n' for x, y, z in verts))
            f.write(''.join(f'f {a + 1} {b + 1} {c + 1}\n' for a, b, c in tris))
        scene.append({'file': name, 'name': row['name'], 'materialId': row['materialId'], 'vertices': len(verts), 'triangles': len(tris)})
        total_v, total_t = total_v + len(verts), total_t + len(tris)
    (args.output / 'scene.json').write_text(json.dumps(scene, indent=1))
    stats = {'solids': len(scene), 'vertices': total_v, 'triangles': total_t, 'materials': sorted({s['materialId'] for s in scene}),
             'brepBytes': brep.stat().st_size, 'heaviest': sorted(scene, key=lambda s: -s['triangles'])[:5]}
    print(json.dumps(stats, indent=1))


if __name__ == '__main__':
    main()
