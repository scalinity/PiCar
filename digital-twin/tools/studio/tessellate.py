"""Scoped Studio tessellation of the exact instructional artifacts an M7 chain run placed.

Presentation only. Each definition is resolved through the chain's own `closure.shape_path`, so the
Studio meshes come from the same bytes the closure verifier measured. Output stays in the CAD
part-local frame (RH, +X forward, +Y left, +Z up, millimetres); the single runtime basis conversion
happens later in studio.mjs. Faces are triangulated separately, so edges between CAD faces stay sharp
and curved faces carry their surface normals.

The index binds itself to the chain run it tessellated: the run's label, its verification result, its Studio chain
record and the revision registry that selected the artifacts, which must not have changed since the run. Every
definition carries the SHA-256 of its artifact and of its own mesh bytes, so studio.mjs can prove each mesh belongs
to the artifact the verifier measured.

Run with the frozen M4 environment in source mode:
  PYTHONPATH=digital-twin/cad <env>/bin/python digital-twin/tools/studio/tessellate.py \
      --root <repo> --chain <chain-run-dir> --definitions <defs.json> --output <dir>
"""
import argparse
import hashlib
import json
from pathlib import Path

import cadquery as cq
import numpy as np
from OCP.BRep import BRep_Tool
from OCP.BRepCheck import BRepCheck_Analyzer
from OCP.BRepLib import BRepLib_ToolTriangulatedShape
from OCP.BRepMesh import BRepMesh_IncrementalMesh
from OCP.TopAbs import TopAbs_REVERSED
from OCP.TopLoc import TopLoc_Location

from twin_cad.assemblies.instructional.closure import shape_path
from twin_cad.assemblies.instructional.verify import REVISION_RECORDS, shape_features

LINEAR_DEFLECTION_MM = 0.02
ANGULAR_DEFLECTION_RAD = 0.15


def face_mesh(face):
    loc = TopLoc_Location()
    tri = BRep_Tool.Triangulation_s(face.wrapped, loc)
    if tri is None:
        raise ValueError('UNMESHED_FACE')
    BRepLib_ToolTriangulatedShape.ComputeNormals_s(face.wrapped, tri)
    trsf = loc.Transformation()
    reversed_face = face.wrapped.Orientation() == TopAbs_REVERSED
    positions, normals = [], []
    for i in range(1, tri.NbNodes() + 1):
        p = tri.Node(i).Transformed(trsf)
        n = tri.Normal(i).Transformed(trsf)
        positions.append((p.X(), p.Y(), p.Z()))
        sign = -1.0 if reversed_face else 1.0
        normals.append((sign * n.X(), sign * n.Y(), sign * n.Z()))
    triangles = []
    for i in range(1, tri.NbTriangles() + 1):
        a, b, c = tri.Triangle(i).Get()
        triangles.append((a - 1, c - 1, b - 1) if reversed_face else (a - 1, b - 1, c - 1))
    return np.array(positions, dtype=np.float64), np.array(normals, dtype=np.float64), np.array(triangles, dtype=np.uint32)


def tessellate(path):
    shape = cq.Shape.importBrep(str(path))
    if not BRepCheck_Analyzer(shape.wrapped).IsValid():
        raise ValueError('INVALID_ARTIFACT ' + str(path))
    BRepMesh_IncrementalMesh(shape.wrapped, LINEAR_DEFLECTION_MM, False, ANGULAR_DEFLECTION_RAD, True)
    solids = []
    for index, solid in enumerate(shape.Solids()):
        parts = [face_mesh(face) for face in solid.Faces()]
        offset, pos, nrm, idx = 0, [], [], []
        for p, n, t in parts:
            pos.append(p)
            nrm.append(n)
            idx.append(t + offset)
            offset += len(p)
        solids.append({'index': index, 'volumeMm3': solid.Volume(), 'positions': np.concatenate(pos),
                       'normals': np.concatenate(nrm), 'indices': np.concatenate(idx)})
    features = [{'radiusMm': float(f['radius']), 'originMm': [float(v) for v in f['origin']], 'axis': [float(v) for v in f['axis']]}
                for f in shape_features(shape)]
    return solids, features


def mesh_entry(path, put):
    data = path.read_bytes()
    solids, features = tessellate(path)
    records = [{'index': s['index'], 'volumeMm3': s['volumeMm3'], 'vertexCount': int(len(s['positions'])),
                'triangleCount': int(len(s['indices'])), 'positions': put(s['positions'], '<f8'),
                'normals': put(s['normals'], '<f8'), 'indices': put(s['indices'], '<u4')} for s in solids]
    allpos = np.concatenate([s['positions'] for s in solids])
    return data, records, features, {'min': allpos.min(axis=0).tolist(), 'max': allpos.max(axis=0).tolist()}


def sha256_file(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def chain_binding(root, chain):
    """The chain run this tessellation belongs to; refuses a run without a Studio record or a moved registry."""
    record_path = chain / 'studio-chain.json'
    if not record_path.is_file():
        raise ValueError('CHAIN_WITHOUT_STUDIO_RECORD ' + str(chain))
    record = json.loads(record_path.read_text())
    registry = sha256_file(root / REVISION_RECORDS)
    if registry != record['revisionRegistry']['sha256']:
        raise ValueError('REVISION_REGISTRY_CHANGED_SINCE_CHAIN')
    return {'label': chain.name, 'closureObservationsSha256': sha256_file(chain / 'closure-observations.json'),
            'studioChainSha256': sha256_file(record_path), 'revisionRegistrySha256': registry}


def mesh_sha256(blob, records):
    """SHA-256 over one shape's mesh bytes: every solid's positions, normals and indices, in order."""
    h = hashlib.sha256()
    for s in records:
        for r in (s['positions'], s['normals'], s['indices']):
            h.update(blob[r['byteOffset']:r['byteOffset'] + r['byteLength']])
    return h.hexdigest()


def run(root, chain, definitions, output, display=None):
    binding = chain_binding(root, chain)
    output.mkdir(parents=True, exist_ok=False)
    dirs = {'root': root, 'artifacts': chain / 'remediation', 'boards': chain / 'anchor' / 'boards'}
    blob = bytearray()
    entries = []

    def put(array, dtype):
        nonlocal blob
        data = np.ascontiguousarray(array, dtype=dtype).tobytes()
        start = len(blob)
        blob += data
        return {'byteOffset': start, 'byteLength': len(data)}

    for definition_id in definitions:
        path = Path(shape_path(definition_id, dirs))
        data, records, features, bounds = mesh_entry(path, put)
        if path.resolve().is_relative_to(chain.resolve()):
            source = 'chain:' + path.resolve().relative_to(chain.resolve()).as_posix()
        else:
            source = path.resolve().relative_to(root.resolve()).as_posix()
        entry = {'definitionId': definition_id, 'artifactPath': source, 'artifactSha256': hashlib.sha256(data).hexdigest(),
                 'artifactBytes': len(data), 'boundsMm': bounds, 'solids': records, 'meshSha256': mesh_sha256(blob, records),
                 'cylinderFeatures': features}
        if display and definition_id in display:
            # A registered display-detail model: shown in the Studio, while assembly checks keep the artifact above.
            dpath = root / display[definition_id]
            ddata, drecords, _, dbounds = mesh_entry(dpath, put)
            entry['display'] = {'artifactPath': display[definition_id], 'artifactSha256': hashlib.sha256(ddata).hexdigest(),
                                'artifactBytes': len(ddata), 'boundsMm': dbounds, 'solids': drecords, 'meshSha256': mesh_sha256(blob, drecords)}
        entries.append(entry)
    (output / 'meshes.bin').write_bytes(bytes(blob))
    index = {'contract': 'picar-studio-tessellation/2', 'track': 'presentation-only', 'frame': 'CAD part-local, RH-XFORWARD-YLEFT-ZUP',
             'unit': 'mm', 'componentType': {'positions': 'float64', 'normals': 'float64', 'indices': 'uint32'},
             'linearDeflectionMm': LINEAR_DEFLECTION_MM, 'angularDeflectionRad': ANGULAR_DEFLECTION_RAD,
             'chain': binding, 'binSha256': hashlib.sha256(bytes(blob)).hexdigest(), 'definitions': entries}
    (output / 'meshes.json').write_text(json.dumps(index, indent=1, sort_keys=True) + '\n')
    return index


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    for name in ['root', 'chain', 'definitions', 'output']:
        parser.add_argument('--' + name, required=True, type=Path)
    parser.add_argument('--display', type=Path, help='JSON map of definition id to a registered display-detail BRep (repo-relative)')
    args = parser.parse_args()
    definitions = json.loads(args.definitions.read_text())
    display = json.loads(args.display.read_text()) if args.display else None
    index = run(args.root, args.chain, definitions, args.output, display)
    print(json.dumps({'definitions': len(index['definitions']), 'binSha256': index['binSha256']}))


if __name__ == '__main__':
    main()
