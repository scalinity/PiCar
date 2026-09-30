"""CadQuery planar synthetic solids and explicit local-mm mesh packets."""
from pathlib import Path

import cadquery as cq
import numpy as np

from .contracts import Invalid, digest, write


def make_solid(definition):
    d = definition["parameters"]
    # Origin: authored intersection of x=0,y=0,z=0 datum planes, never recentered.
    outer = cq.Solid.makeBox(d["length"], d["width"], d["height"])
    hole = cq.Solid.makeBox(d["holeLength"], d["holeWidth"], d["height"]+2,
                            cq.Vector(d["holeX"], d["holeY"], -1))
    solid = outer.cut(hole)
    if not solid.isValid() or len(solid.Solids()) != 1 or solid.Volume() <= 0:
        raise Invalid("INVALID_SOLID")
    return solid


def export_definition(definition, directory):
    ident = definition["id"]
    out = Path(directory)
    solid = make_solid(definition)
    solid.exportBrep(str(out / (ident + ".brep")))
    cq.exporters.export(solid, str(out / (ident + ".step")))
    vertices, indices = solid.tessellate(0.005, 0.05)
    coords = [list(v.toTuple()) for v in vertices]
    # Preserve triangle winding and coordinates; normalize only index ordering.
    unique = sorted(set(tuple(v) for v in coords))
    lookup = {v: i for i, v in enumerate(unique)}
    triangles = []
    for face in indices:
        tri = [lookup[tuple(coords[i])] for i in face]
        k = tri.index(min(tri))
        triangles.append(tri[k:] + tri[:k])
    packet = {"scope": "TEST-ONLY", "definitionId": ident, "unit": "mm", "basis": "RH-XFORWARD-YLEFT-ZUP",
              "datum": "synthetic.x0-y0-z0", "coordinateConversionCount": 0,
              "positionsFloat64": unique, "triangles": sorted(triangles),
              "tessellation": {"linearMm": 0.005, "angularRad": 0.05}}
    write(out / (ident + ".mesh.json"), packet)
    # Export real BRep witnesses rather than names copied from parameters.
    faces = []
    for face in solid.Faces():
        if face.geomType() != "PLANE":
            raise Invalid("UNSUPPORTED_SYNTHETIC_FACE")
        faces.append({"normal": list(face.normalAt().toTuple()), "centerMm": list(face.Center().toTuple()),
                      "areaMm2": face.Area(), "wireCount": len(face.Wires())})
    faces.sort(key=lambda f: (f["normal"], f["centerMm"]))
    points = np.array([v.Center().toTuple() for v in solid.Vertices()])
    d = definition["parameters"]
    features = {"definitionId": ident, "scope": "TEST-ONLY", "sourceUncertainty": "NOT_A_MANUFACTURING_MEASUREMENT",
                "datum": {"name": "synthetic.x0-y0-z0", "translationMm": [0, 0, 0], "quaternionXYZW": [0, 0, 0, 1]},
                "hole.axis": {"originMm": [d["holeX"]+d["holeLength"]/2, d["holeY"]+d["holeWidth"]/2, 0],
                              "direction": [0, 0, 1], "rollDirection": [1, 0, 0]},
                "volumeMm3": solid.Volume(), "boundsMm": [*points.min(axis=0).tolist(), *points.max(axis=0).tolist()],
                "planarFaces": faces}
    write(out / (ident + ".features.json"), features)
    return {"definitionId": ident, "interfaceFingerprint": digest(features), "meshPacketFingerprint": digest(packet)}
