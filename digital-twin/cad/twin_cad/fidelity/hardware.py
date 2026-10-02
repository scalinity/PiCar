"""Studio fidelity revisions of small hardware: hex nylon standoffs and pan-head cross-recess screws.

Part-local frames and every closure-relevant dimension follow the accepted M5 proxies exactly (standoff body on
z 0..length with any stud above it; screw shank on z 0..length with the head below z 0), so M7 poses stay valid.
Threads are not modelled; bores use the thread's nominal diameter. Presentation values, never engineering ones.
"""
import math

import cadquery as cq


def hex_standoff(p):
    """Hexagonal standoff, across-flats `acrossFlatsMm`, female bore(s), optional male stud on top."""
    af, length, c = p['acrossFlatsMm'], p['lengthMm'], p.get('chamferMm', 0.3)
    corner = af / 2 / math.cos(math.pi / 6)
    prism = cq.Workplane('XY').polygon(6, 2 * corner).extrude(length)
    # Corner chamfers the way nuts are modelled: intersect with a revolved, chamfered cylinder. Unlike an edge
    # selector this does not depend on OCC hash order, so the exported bytes are identical on every rebuild.
    rim = (cq.Workplane('XZ').polyline([(0, 0), (corner - c, 0), (corner, c), (corner, length - c), (corner - c, length), (0, length)])
           .close().revolve(360, (0, 0, 0), (0, 1, 0)))
    body = prism.intersect(rim)
    bore = p['boreDiameterMm'] / 2
    if p.get('studLengthMm'):
        body = body.cut(cq.Workplane('XY').circle(bore).extrude(p['boreDepthMm']))
        stud = (cq.Workplane('XY').workplane(offset=length).circle(p['studDiameterMm'] / 2).extrude(p['studLengthMm'])
                .faces('>Z').edges().chamfer(0.25))
        body = body.union(stud)
    else:
        body = body.cut(cq.Workplane('XY').circle(bore).extrude(length))  # threaded through
    return body.val()


def pan_screw(p):
    """Pan head (domed top, rounded rim) with a cross recess; shank along +Z from the bearing face at z = 0."""
    d, length, hd, hh = p['diameterMm'], p['lengthMm'], p['headDiameterMm'], p['headHeightMm']
    shank = cq.Workplane('XY').circle(d / 2).extrude(length).faces('>Z').edges().chamfer(min(0.25, d * 0.12))
    head = cq.Workplane('XY').workplane(offset=-hh).circle(hd / 2).extrude(hh)
    # Rim radius capped so the cylindrical head band stays over 1 mm on M3 heads (the S05 verifier finds heads by it).
    head = head.faces('<Z').edges().fillet(min(0.5, hh * 0.4))
    slot = p['recessWidthMm']
    for angle in (0, 90):
        cutter = (cq.Workplane('XY').workplane(offset=-hh - 0.01).rect(p['recessLengthMm'], slot).extrude(p['recessDepthMm'])
                  .rotate((0, 0, 0), (0, 0, 1), angle))
        head = head.cut(cutter)
    return head.union(shank).val()
