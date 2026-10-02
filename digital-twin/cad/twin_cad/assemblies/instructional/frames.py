"""Pure frame and BRep-face helpers shared by authored step generators and their independent verifiers.

Nothing here decides where a part goes: it only builds rotations, stages approaches and reads cylinders
and planes out of an already placed shape.
"""
import numpy as np
from OCP.BRepAdaptor import BRepAdaptor_Surface
from OCP.GeomAbs import GeomAbs_Cylinder

CLAIMS = {'staticPlacement': 'INSTRUCTIONAL_PASS', 'installationSweep': 'NOT_CLAIMED', 'physicalFit': 'NOT_CLAIMED'}
REASON_UNDO = 'Digital staging reversal only; no physical undo claim'


def clean(values):
    return [float(v) + 0.0 for v in values]


def unit(vector):
    v = np.array(vector, dtype=np.float64)
    return v / np.linalg.norm(v)


def frame_from_axis(z_axis, x_hint):
    """Proper rotation whose local +Z is z_axis and whose local +X is x_hint made orthogonal to it."""
    z = unit(z_axis)
    x = np.array(x_hint, dtype=np.float64)
    x = unit(x - (x @ z) * z)
    return np.column_stack([x, np.cross(z, x), z])


def pose_of(identifier, rotation, translation, feature, role):
    return {'instanceId': identifier, 'translationMm': clean(translation), 'rotation': [clean(row) for row in np.array(rotation)],
            'featureRef': feature, 'role': role}


def staged(pose, axis, distance, anchor, segments):
    """Final pose pulled back along its travel axis; presentation staging only, no sweep is claimed."""
    start = np.array(pose['translationMm']) - unit(axis) * distance
    return {'instanceId': pose['instanceId'], 'anchor': anchor, 'approachAxis': clean(unit(axis)), 'approachDistanceMm': float(distance),
            'stagedStart': {**pose, 'translationMm': clean(start)}, 'segments': segments, 'stagingOnly': True,
            'installationSweep': 'NOT_CLAIMED', 'reversal': REASON_UNDO}


def cylinder_faces(shape):
    """Cylindrical faces of a (placed) shape: radius, axis point and direction, and the face's own bounding box."""
    rows = []
    for face in shape.Faces():
        adapter = BRepAdaptor_Surface(face.wrapped, True)
        if adapter.GetType() == GeomAbs_Cylinder:
            cylinder = adapter.Cylinder()
            b = face.BoundingBox()
            rows.append({'radius': float(cylinder.Radius()), 'origin': np.array(cylinder.Location().Coord()),
                         'axis': np.array(cylinder.Axis().Direction().Coord()), 'bounds': np.array([b.xmin, b.ymin, b.zmin, b.xmax, b.ymax, b.zmax])})
    return rows


def planar_faces(shape, minimum_area=1.0):
    """Planar faces: outward normal, area and bounding box."""
    rows = []
    for face in shape.Faces():
        if face.geomType() == 'PLANE' and face.Area() >= minimum_area:
            b = face.BoundingBox()
            rows.append({'normal': np.array(face.normalAt().toTuple()), 'area': float(face.Area()),
                         'bounds': np.array([b.xmin, b.ymin, b.zmin, b.xmax, b.ymax, b.zmax])})
    return rows


def line_distance(point_a, axis_a, point_b, axis_b):
    """Distance between two parallel axes; infinity if they are not parallel."""
    a, b = unit(axis_a), unit(axis_b)
    if np.linalg.norm(np.cross(a, b)) > 1e-6:
        return float('inf')
    delta = np.array(point_b, dtype=np.float64) - np.array(point_a, dtype=np.float64)
    return float(np.linalg.norm(delta - (delta @ a) * a))
