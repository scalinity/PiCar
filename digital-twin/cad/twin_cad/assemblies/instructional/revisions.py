"""Additive instructional revisions of purchased parts, built from tracked DERIVED parameters (hardware-revisions-04.json).

The M5 artifacts stay as accepted. A revised artifact lives beside them under the same definition id in the M7 revision directory;
nothing here claims engineering authority, a spline standard or a fit.
"""
import argparse
import hashlib
from pathlib import Path
import cadquery as cq
import rfc8785
from ...contracts import Invalid, load
from ...components.plates.instructional.generate import make_candidate
from ...fidelity.hardware import hex_standoff, pan_screw

PRESENTATION = 'digital-twin/assemblies/v40/presentation/instructional'
REVISIONS = 'digital-twin/validation/expected/m7/instructional-revisions/'
PARAMETERS = PRESENTATION + '/hardware-revisions-04.json'
M5_ARTIFACTS = 'digital-twin/validation/expected/m5/instructional-artifacts/'


def box(l, w, h, x=0., y=0., z=0.):
    return cq.Solid.makeBox(l, w, h, cq.Vector(x, y, z))


def cylinder(radius, length, x=0., y=0., z=0.):
    return cq.Solid.makeCylinder(radius, length, cq.Vector(x, y, z), cq.Vector(0, 0, 1))


def fuse(parts):
    result = parts[0]
    for part in parts[1:]:
        result = result.fuse(part)
    return result.clean()


def ultrasonic(p):
    length, width, t = p['boardLengthMm'], p['boardWidthMm'], p['boardThicknessMm']
    board = box(length, width, t)
    for x in (p['cornerHoleInsetMm'], length - p['cornerHoleInsetMm']):
        for y in (p['cornerHoleInsetMm'], width - p['cornerHoleInsetMm']):
            board = board.cut(cylinder(p['cornerHoleRadiusMm'], t + 2, x, y, -1))
    can_y = width / 2 - p['canOffsetTowardCrystalMm']
    parts = [board]
    for x in (length / 2 - p['canSpacingMm'] / 2, length / 2 + p['canSpacingMm'] / 2):
        can = cylinder(p['canRadiusMm'], p['canHeightMm'], x, can_y, t)
        parts.append(can.cut(cylinder(p['canRecessRadiusMm'], p['canRecessDepthMm'] + 1, x, can_y, t + p['canHeightMm'] - p['canRecessDepthMm'])))
    parts.append(box(p['crystalLengthMm'], p['crystalWidthMm'], p['crystalHeightMm'], length / 2 - p['crystalLengthMm'] / 2, 0, t))
    # Rear connector housing on the opposite long edge, seated on the board and projecting past its edge.
    parts.append(box(p['connectorWidthMm'], p['connectorOutsideEdgeMm'] + p['connectorOnBoardMm'], p['connectorRearHeightMm'],
                     length / 2 - p['connectorWidthMm'] / 2, width - p['connectorOnBoardMm'], -p['connectorRearHeightMm']))
    return fuse(parts)


def arm(hub_width, tip_width, x0, x1):
    """A tapered arm plate outline from x0 to x1 with a round tip, as a closed polygon plus tip disc."""
    sign = 1 if x1 > x0 else -1
    start = x0
    tip = x1 - sign * tip_width / 2
    outline = [(start, -hub_width / 2), (tip, -tip_width / 2), (tip, tip_width / 2), (start, hub_width / 2)]
    return outline, (tip, tip_width / 2)


def horn(p, double):
    t, rise = p['plateThicknessMm'], p['hubRiseMm']
    sides = [(0., p['halfLengthMm'] if double else p['tipDistanceMm'])]
    if double:
        sides.append((0., -p['halfLengthMm']))
    parts = [cylinder(p['hubRadiusMm'], t + rise)]
    holes = []
    for x0, x1 in sides:
        outline, (tip_x, tip_r) = arm(p['armWidthAtHubMm'], p['armWidthAtTipMm'], x0, x1)
        solid = cq.Workplane('XY').polyline(outline).close().extrude(t).val()
        parts += [solid, cylinder(tip_r, t, tip_x, 0)]
        sign = 1 if x1 > 0 else -1
        holes += [sign * (p['firstHoleMm'] + p['holePitchMm'] * i) for i in range(int(p['holesPerSide']))]
    result = fuse(parts).cut(cylinder(p['boreRadiusMm'], t + rise + 2, 0, 0, -1))
    for x in holes:
        result = result.cut(cylinder(p['holeRadiusMm'], t + 2, x, 0, -1))
    return result


def plate_h(p):
    """The M6 plate with its outer edges moved to the photographed height; holes, notch width and notch floor are the M6 values."""
    t = p['thicknessMm']
    x0, x1 = p['centreXMm'] - p['halfHeightMm'], p['centreXMm'] + p['halfHeightMm']
    y0, y1 = p['yMinMm'], p['yMaxMm']
    plate = cq.Workplane('XY').center((x0 + x1) / 2, (y0 + y1) / 2).rect(x1 - x0, y1 - y0).extrude(t).edges('|Z').fillet(p['cornerRadiusMm']).val()
    plate = plate.cut(box(p['notchFloorXMm'] - x0 + 1, p['notchYMaxMm'] - p['notchYMinMm'], t + 2, x0 - 1, p['notchYMinMm'], -1))
    for x, y, r in p['endHoles'] + p['innerHoles']:
        plate = plate.cut(cylinder(r, t + 2, x, y, -1))
    return plate


BUILDERS = {'ultrasonic': ultrasonic, 'horn-double': lambda p: horn(p, True), 'horn-single': lambda p: horn(p, False), 'plate-h-outline': plate_h,
            'm6-plate': lambda p: make_candidate(p['definition']), 'hex-standoff': hex_standoff, 'pan-screw': pan_screw}


def specs(root):
    batches = sorted(p.relative_to(root).as_posix() for p in (Path(root) / PRESENTATION).glob('fidelity-revisions-*.json'))
    return [d for name in (PARAMETERS, *batches) for d in load(Path(root) / name)['definitions']]


def build(root, definition_id):
    spec = next((d for d in specs(root) if d['definitionId'] == definition_id), None)
    if spec is None:
        raise Invalid('NO_REVISION_FOR_DEFINITION ' + definition_id)
    shape = BUILDERS[spec['kind']](spec['parameters'])
    if not shape.isValid() or shape.Volume() <= 0:
        raise Invalid('REVISED_SHAPE_INVALID ' + definition_id)
    return shape


def revised_path(root, definition_id):
    path = Path(root) / (REVISIONS + definition_id + '.brep')
    return path if path.is_file() else None


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', required=True, type=Path)
    parser.add_argument('--output', required=True, type=Path)
    args = parser.parse_args()
    args.output.mkdir(parents=True, exist_ok=False)
    records = []
    for spec in specs(args.root):
        shape = build(args.root, spec['definitionId'])
        path = args.output / (spec['definitionId'] + '.brep')
        shape.exportBrep(str(path))
        old = args.root / spec['supersedes']
        box_ = shape.BoundingBox()
        records.append({'definitionId': spec['definitionId'], 'newArtifact': path.name, 'newArtifactSha256': hashlib.sha256(path.read_bytes()).hexdigest(),
                        'supersedesPath': spec['supersedes'], 'supersededArtifactSha256': hashlib.sha256(old.read_bytes()).hexdigest(),
                        'volumeMm3': shape.Volume(), 'boundsMm': [box_.xmin, box_.ymin, box_.zmin, box_.xmax, box_.ymax, box_.zmax]})
    (args.output / 'revision-artifacts.json').write_bytes(rfc8785.dumps({'id': 'PX-M7-HARDWARE-REVISION-ARTIFACTS-04', 'records': records}) + b'\n')


if __name__ == '__main__':
    main()
