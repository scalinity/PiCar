"""Robot HAT V4 display geometry, built from hat-detail-display-review-02.json (every value there names its basis).

Frame: the adopted instructional HAT's. x along the 85 mm edge, y along the 56 mm edge with the GPIO header at high y,
z up from the PCB underside; the top face is z = 1.6. Profiles are drawn explicitly (no edge-selector fillets or
chamfers), so the exported bytes are identical on every rebuild.

The Studio draws one mesh per solid. Features that share a finish are therefore joined into one solid through an inner
layer of the board: each joined finish owns a thin plate inside the FR4 core and a via under every feature. These hidden
joins lie wholly inside the board volume, pass through the core and through one another there, and keep 2.1 mm clear
of every bore; every visible surface is exact and no visible part enters another. A joined finish that does not come
out as exactly one solid is an error.
"""
import math
from pathlib import Path

import cadquery as cq

TOP = 1.6
MASK = 0.04
BORE_KEEPOUT = 2.1  # radius around each bore that holds only the core and the masks
# Inner plates (z0, z1) inside the FR4 core (z 0.04 to 1.56); top-side vias run from z1 up, underside vias from z0 down.
BANDS = {'silk-bottom': (0.10, 0.15), 'tin-bottom': (0.22, 0.27), 'gold': (0.36, 0.41), 'red': (0.50, 0.55),
         'yellow': (0.62, 0.67), 'white': (0.74, 0.79), 'tan': (0.86, 0.91), 'black': (0.98, 1.03),
         'tin-top': (1.12, 1.17), 'silk-top': (1.30, 1.35)}
JOINED = {  # finish -> (record name, material id, plates)
    'silk': ('Silkscreen and part markings', 'silkscreen-black', ('silk-bottom', 'silk-top')),
    'tin': ('Solder joints, pads, SMD terminals and leads', 'solder-tin', ('tin-bottom', 'tin-top')),
    'gold': ('Header pins (individual, gold finish)', 'contact-gold', ('gold',)),
    'red': ('5V header housings', 'header-red', ('red',)),
    'yellow': ('Signal header housings', 'header-yellow', ('yellow',)),
    'white': ('White connector housings, switch bases and LED bodies', 'connector-white', ('white',)),
    'tan': ('Ceramic capacitor bodies', 'mlcc-tan', ('tan',)),
    'black': ('IC packages, resistor bodies and black housings', 'header-black', ('black',)),
}
CAP = 0.729  # DejaVu Sans cap height per unit font size


def font(weight):
    import matplotlib
    return str(Path(matplotlib.get_data_path()) / 'fonts' / 'ttf' / ('DejaVuSans-Bold.ttf' if weight == 'bold' else 'DejaVuSans.ttf'))


# ---------------------------------------------------------------- primitives
def box(x0, x1, y0, y1, z0, z1):
    return cq.Workplane('XY').box(x1 - x0, y1 - y0, z1 - z0, centered=False).translate((x0, y0, z0)).val()


def cbox(cx, cy, w, d, z0, z1):
    return box(cx - w / 2, cx + w / 2, cy - d / 2, cy + d / 2, z0, z1)


def closed_wire(z, steps, to3d=None):
    """A closed outline at height z from steps ('L', end) or ('A', mid, end); the first step starts at the last end.
    Arcs are made first and every line runs between their computed end points, so each shared vertex has one coordinate.
    (A Workplane chain or slot2D joins a drawn line end and a computed arc end that can differ in the last digit, and
    which one the wire keeps is not the same on every run: the export must be byte-stable.) `to3d` maps a 2D point
    into another plane."""
    V = (lambda p: cq.Vector(p[0], p[1], z)) if to3d is None else (lambda p: cq.Vector(*to3d(p)))
    n = len(steps)
    if any(steps[i][0] == 'A' and steps[i - 1][0] == 'A' for i in range(n)):
        raise ValueError('CLOSED_WIRE_ADJACENT_ARCS')  # two computed ends could still disagree; keep a line between arcs
    ends = [s[-1] for s in steps]
    arcs = {i: cq.Edge.makeThreePointArc(V(ends[i - 1]), V(s[1]), V(s[2])) for i, s in enumerate(steps) if s[0] == 'A'}
    edges = []
    for i, s in enumerate(steps):
        if s[0] == 'A':
            edges.append(arcs[i])
            continue
        prev, nxt = (i - 1) % n, (i + 1) % n
        a = arcs[prev].endPoint() if prev in arcs else V(ends[prev])
        b = arcs[nxt].startPoint() if nxt in arcs else V(ends[i])
        edges.append(cq.Edge.makeLine(a, b))
    return cq.Wire.assembleEdges(edges)


def prism(wire, z0, z1, holes=(), direction=None):
    return cq.Solid.extrudeLinear(cq.Face.makeFromWires(wire, list(holes)), direction or cq.Vector(0, 0, z1 - z0))


def rrect_wire(cx, cy, w, d, r, z=0.0):
    if r > min(w, d) / 2 - 0.05:
        raise ValueError(f'ROUNDED_RECT_SLIVER r={r} for {w} x {d}: draw a stadium instead')  # a sliver edge makes Booleans unstable
    x0, x1, y0, y1 = cx - w / 2, cx + w / 2, cy - d / 2, cy + d / 2
    k = r * (1 - math.cos(math.pi / 4))
    return closed_wire(z, [('L', (x1 - r, y0)), ('A', (x1 - k, y0 + k), (x1, y0 + r)), ('L', (x1, y1 - r)), ('A', (x1 - k, y1 - k), (x1 - r, y1)),
                           ('L', (x0 + r, y1)), ('A', (x0 + k, y1 - k), (x0, y1 - r)), ('L', (x0, y0 + r)), ('A', (x0 + k, y0 + k), (x0 + r, y0))])


def rrect(cx, cy, w, d, r, z0, z1):
    return prism(rrect_wire(cx, cy, w, d, r, z0), z0, z1)


def stadium_wire(cx, cy, length, width, z, angle=0, to3d=None):
    """Straight sides joined by semicircular ends, length along `angle` (0 or 90 degrees)."""
    r, h = width / 2, length / 2 - width / 2
    pts = lambda u, v: (cx + u, cy + v) if angle == 0 else (cx - v, cy + u)
    return closed_wire(z, [('L', pts(h, -r)), ('A', pts(h + r, 0), pts(h, r)), ('L', pts(-h, r)), ('A', pts(-h - r, 0), pts(-h, -r))], to3d)


def stadium(cx, cy, length, width, z0, z1, angle=0):
    return prism(stadium_wire(cx, cy, length, width, z0, angle), z0, z1)


def cyl(cx, cy, r, z0, z1):
    return cq.Workplane('XY').workplane(offset=z0).center(cx, cy).circle(r).extrude(z1 - z0).val()


def ring(cx, cy, r0, r1, z0, z1):
    return cq.Workplane('XY').workplane(offset=z0).center(cx, cy).circle(r1).circle(r0).extrude(z1 - z0).val()


def band(outer, inner, t):
    """A thin mark drawn as one face (outer wire, optional inner wires) extruded t up. Silkscreen strokes are built this
    way rather than cut from a larger copy of themselves: a Boolean on a thin frame does not put its vertices on the same
    last digit on every run, and the export must be byte-stable."""
    return cq.Solid.extrudeLinear(cq.Face.makeFromWires(outer, inner), cq.Vector(0, 0, t))


def arc_band(cx, cy, r0, r1, a0, a1, z):
    """Annular sector from angle a0 to a1 (radians, counter-clockwise), drawn directly."""
    am = (a0 + a1) / 2
    p = lambda r, a: (cx + r * math.cos(a), cy + r * math.sin(a))
    return closed_wire(z, [('L', p(r1, a0)), ('A', p(r1, am), p(r1, a1)), ('L', p(r0, a1)), ('A', p(r0, am), p(r0, a0))])


def polygon_wire(points, z):
    return cq.Workplane('XY').workplane(offset=z).polyline(points).close().wires().val()


def turned(shape, cx, cy, deg):
    return shape if deg % 360 == 0 else shape.rotate(cq.Vector(cx, cy, 0), cq.Vector(cx, cy, 1), deg)


def chamfered_prism(cx, cy, size, z0, z1, c):
    """Square pin with chamfered ends: the intersection of two extruded side profiles."""
    a = size / 2
    p = [(-a, z0 + c), (-a + c, z0), (a - c, z0), (a, z0 + c), (a, z1 - c), (a - c, z1), (-a + c, z1), (-a, z1 - c)]
    return (cq.Workplane('XZ').polyline(p).close().extrude(a, both=True)
            .intersect(cq.Workplane('YZ').polyline(p).close().extrude(a, both=True)).translate((cx, cy, 0)).val())


def dome(cx, cy, r, h, base, down):
    """Solder fillet: a true cone from radius r at z = base narrowing to 0.45 r, h below (down) or above."""
    return cq.Solid.makeCone(r, 0.45 * r, h, cq.Vector(cx, cy, base), cq.Vector(0, 0, -1 if down else 1))


def gullwing(length, width, h1, t=0.15):
    """Lead leaving a package side along +x at x = 0, shoulder at h1 above the board, foot on the board."""
    a, b = length * 0.28, length * 0.56
    p = [(0, h1), (a, h1), (b, 0), (length, 0), (length, t), (b + t * 0.6, t), (a + t * 0.6, h1 + t), (0, h1 + t)]
    return cq.Workplane('XZ').polyline(p).close().extrude(width / 2, both=True).translate((0, 0, TOP)).val()


def tube(points, r):
    """A wire strand through the points: straight round segments fused end to end (true cylinders mesh about twenty
    times lighter than a swept spline, and the bend between segments is kept under 18 degrees)."""
    pts = [cq.Vector(*p) for p in points]
    segs = [cq.Solid.makeCylinder(r, (b - a).Length, a, (b - a).normalized()) for a, b in zip(pts, pts[1:])]
    return segs[0].fuse(*segs[1:]).Solids()[0] if len(segs) > 1 else segs[0]


def helix_strand(p0, p1, phase, twist_r, strand_r, pitch, per_turn=6):
    """One strand of a twisted pair from p0 to p1: a polyline helix of per_turn straight segments per twist."""
    a, b = cq.Vector(*p0), cq.Vector(*p1)
    axis = (b - a).normalized()
    side = axis.cross(cq.Vector(0, 0, 1)).normalized()
    up = side.cross(axis)
    n = max(per_turn, int(round((b - a).Length / pitch * per_turn)))
    pts = []
    for k in range(n + 1):
        t = k / n
        th = math.radians(phase) + 2 * math.pi * k / per_turn
        p = a + (b - a) * t + side * (twist_r * math.cos(th)) + up * (twist_r * math.sin(th))
        pts.append((p.x, p.y, p.z))
    return tube(pts, strand_r)


def spline_strand(points, r, samples=28):
    path = cq.Workplane('XY').spline([cq.Vector(*p) for p in points], includeCurrent=False).val()
    return tube([path.positionAt(k / samples).toTuple() for k in range(samples + 1)], r)


# ---------------------------------------------------------------- board outline
def outline(p, inset=0.0):
    """PCB outline wire: left corners concentric with the left bores, right corners r 3, cable slot, speaker notch."""
    L, W = p['lengthMm'], p['widthMm']
    rl, rr = p['leftCornerRadiusMm'], p['rightCornerRadiusMm']
    s, n = p['cableSlot'], p['speakerNotch']
    def arc(cx, cy, r, a0, a1):
        am = (a0 + a1) / 2
        return ('A', (cx + r * math.cos(am), cy + r * math.sin(am)), (cx + r * math.cos(a1), cy + r * math.sin(a1)))
    pi, sr, fo, fi = math.pi, s['cornerRadius'], n['outerFillet'], n['innerFillet']
    wire = closed_wire(0.0, [
        ('L', (s['x0'], 0)), ('L', (s['x0'], s['depth'] - sr)), arc(s['x0'] + sr, s['depth'] - sr, sr, pi, pi / 2),
        ('L', (s['x1'] - sr, s['depth'])), arc(s['x1'] - sr, s['depth'] - sr, sr, pi / 2, 0), ('L', (s['x1'], 0)),
        ('L', (L - rr, 0)), arc(L - rr, rr, rr, -pi / 2, 0), ('L', (L, W - rr)), arc(L - rr, W - rr, rr, 0, pi / 2),
        ('L', (n['x1'] + fo, W)), arc(n['x1'] + fo, W - fo, fo, pi / 2, pi), ('L', (n['x1'], n['floorY'] + fi)),
        arc(n['x1'] - fi, n['floorY'] + fi, fi, 0, -pi / 2), ('L', (n['floorX0'], n['floorY'])), ('L', (n['chamferX0'], W)),
        ('L', (rl, W)), arc(rl, W - rl, rl, pi / 2, pi), ('L', (0, rl)), arc(rl, rl, rl, pi, 3 * pi / 2)])
    return wire.offset2D(-inset)[0] if inset else wire


def slab(p, z0, z1, inset=0.0):
    return cq.Solid.extrudeLinear(cq.Face.makeFromWires(outline(p, inset)), cq.Vector(0, 0, z1 - z0)).translate((0, 0, z0))


# ---------------------------------------------------------------- the board builder
class Board:
    def __init__(self, review):
        self.r = review
        self.feat = {g: [] for g in JOINED}
        self.vias = []        # (finish, plate band, x0, x1, y0, y1, z0, z1)
        self.loose = []       # (name, material, solid) drawn as their own solids
        self.flush = {'top': [], 'bottom': []}  # ink set into the mask, so bearing hardware meets the board face

    # -- registration helpers
    def via(self, finish, cx, cy, half, side='top', z_end=None, z_start=None):
        band = JOINED[finish][2][-1 if side == 'top' else 0]
        z0, z1 = BANDS[band]
        if side == 'top':
            lo, hi = z1, (TOP if z_end is None else z_end)
        else:
            lo, hi = (0.0 if z_start is None else z_start), z0
        self.vias.append((finish, band, cx - half, cx + half, cy - half, cy + half, lo, hi))

    def add(self, finish, solid, via_at=None, half=0.08, side='top', z_end=None, z_start=None):
        self.feat[finish].append(solid)
        if via_at is not None:
            self.via(finish, via_at[0], via_at[1], half, side, z_end, z_start)

    # -- glyphs
    def text(self, s, cap, x, y, rot, side='top', weight='bold', halign='center', valign='center', z=None, via_end=None, fit=None):
        """Raised glyphs. `fit` = [x0, x1, y0, y1], the lettering's box as photographed: the board's typeface is narrower
        and taller than DejaVu, so a fitted label is scaled in x and y to that box."""
        size = cap / CAP
        a = math.radians(rot)
        xd = (math.cos(a), math.sin(a), 0)
        if side == 'top':
            plane = cq.Plane(origin=(x, y, TOP if z is None else z), xDir=xd, normal=(0, 0, 1))
        else:
            plane = cq.Plane(origin=(x, y, 0), xDir=xd, normal=(0, 0, -1))
        res = cq.Workplane(plane).text(s, size, self.r['silkscreen']['thicknessMm'], combine=False, halign=halign, valign=valign, fontPath=font(weight))
        pieces = [sol for v in res.vals() for sol in v.Solids()]
        if fit:
            bb = cq.Compound.makeCompound(pieces).BoundingBox()
            sx, sy = (fit[1] - fit[0]) / bb.xlen, (fit[3] - fit[2]) / bb.ylen
            m = cq.Matrix([[sx, 0, 0, fit[0] - bb.xmin * sx], [0, sy, 0, fit[2] - bb.ymin * sy], [0, 0, 1, 0]])
            pieces = [p.transformGeometry(m) for p in pieces]
        for piece in pieces:
            self.glyph(piece, side, via_end)

    def glyph(self, piece, side, via_end=None):
        """Join one glyph piece (or a line) to the silkscreen finish through a small via at an interior point: a point
        just inside the outer boundary, beside the midpoint of one of its edges."""
        bb = piece.BoundingBox()
        zc = (bb.zmin + bb.zmax) / 2
        half = 0.02
        face = max((f for f in piece.Faces() if abs(abs(f.normalAt().z) - 1) < 1e-6), key=lambda f: f.Area())
        L, W = self.r['pcb']['lengthMm'], self.r['pcb']['widthMm']
        found = []
        for edge in face.outerWire().Edges():
            p, t = edge.positionAt(0.5), edge.tangentAt(0.5)
            n = cq.Vector(-t.y, t.x, 0)
            for s in (1, -1):
                q = p + n * (s * 0.042)
                if all(piece.isInside(cq.Vector(q.x + dx, q.y + dy, zc), 1e-7) for dx in (-half, half) for dy in (-half, half)):
                    found.append((round(q.x, 4), round(q.y, 4)))
        if not found:
            raise ValueError(f'GLYPH_WITHOUT_INTERIOR {bb.xmin:.2f},{bb.ymin:.2f}')
        best = max(found, key=lambda q: (min(q[0], L - q[0], q[1], W - q[1]), -q[0], -q[1]))  # deepest inside the board
        if side == 'top':
            self.add('silk', piece, best, half, 'top', z_end=bb.zmin if via_end is None else via_end)
        else:
            self.add('silk', piece, best, half, 'bottom', z_start=bb.zmax)

    def line_rect(self, cx, cy, w, d, stroke, side='top', r=None):
        """Silkscreen frame drawn as a closed stroke: a pill (true stadium, semicircular ends) when r is None, otherwise a
        rectangle with corner radius r. A stadium is never approximated by a rounded rectangle: that leaves a sliver edge
        between its end arcs, and Booleans on a sliver do not resolve the same way on every run."""
        t = self.r['silkscreen']['thicknessMm']
        z0 = TOP if side == 'top' else -t
        if r is None:
            along = 0 if w >= d else 90
            length, width = max(w, d), min(w, d)
            outer = stadium_wire(cx, cy, length + stroke, width + stroke, z0, along)
            inner = stadium_wire(cx, cy, length - stroke, width - stroke, z0, along)
        else:
            outer = rrect_wire(cx, cy, w + stroke, d + stroke, r + stroke / 2, z0)
            inner = rrect_wire(cx, cy, w - stroke, d - stroke, max(r - stroke / 2, 0.02), z0)
        self.glyph(band(outer, [inner], t), side)

    # ---------------------------------------------------------------- final assembly
    def plates(self):
        """One plate per band: the board outline inset 0.45 mm, clear of every bore."""
        p, holes = self.r['pcb'], self.r['mountingHoles']
        out = {}
        for bands in (j[2] for j in JOINED.values()):
            for band in bands:
                z0, z1 = BANDS[band]
                out[band] = slab(p, z0, z1, inset=0.45).cut(*[cyl(x, y, BORE_KEEPOUT, z0 - 0.01, z1 + 0.01) for x, y in holes['centres']])
        return out

    def posts(self):
        """Tie the top and underside plates of a two-sided finish together under the speaker, where no via runs."""
        for k, (finish, (_, _, bands)) in enumerate(JOINED.items()):
            if len(bands) == 2:
                x, y = 70.0 + 2.0 * k, 25.0
                self.vias.append((finish, 'post', x - 0.15, x + 0.15, y - 0.15, y + 0.15, BANDS[bands[0]][0], BANDS[bands[1]][1]))

    def assemble(self):
        p, holes = self.r['pcb'], self.r['mountingHoles']
        self.posts()
        plates = self.plates()
        via_solid = {i: box(x0, x1, y0, y1, lo, hi) for i, (_, _, x0, x1, y0, y1, lo, hi) in enumerate(self.vias)}
        for f, _, x0, x1, y0, y1, _, _ in self.vias:
            if any(math.hypot(max(x0 - x, 0, x - x1), max(y0 - y, 0, y - y1)) < BORE_KEEPOUT for x, y in holes['centres']):
                raise ValueError(f'HIDDEN_JOIN_NEAR_BORE {f} {x0:.2f},{y0:.2f}')
        bores = [cyl(x, y, holes['radiusMm'], -0.01, TOP + 0.01) for x, y in holes['centres']]
        core = slab(p, MASK, TOP - MASK).cut(*bores)
        top = slab(p, TOP - MASK, TOP).cut(*bores, *self.flush['top'])
        bottom = slab(p, 0, MASK).cut(*bores, *self.flush['bottom'])
        parts = [('PCB core (FR4)', 'fr4-edge', core), ('Top solder mask', 'pcb-white', top), ('Underside solder mask', 'pcb-white', bottom)]
        for finish, (name, material, bands) in JOINED.items():
            members = [plates[b] for b in bands] + [via_solid[i] for i, v in enumerate(self.vias) if v[0] == finish] + self.feat[finish]
            joined = members[0].fuse(*members[1:])
            solids = joined.Solids()
            if len(solids) != 1:
                raise ValueError(f'JOINED_FINISH_SPLIT {finish}: {len(solids)} solids')
            parts.append((name, material, solids[0]))
        return parts + self.loose


# ---------------------------------------------------------------- parts
def through_pin(b, x, y, z_top, finish):
    """A straight pin through the board with its underside solder fillet; a gold pin's fillet joins the tin finish."""
    P = b.r['pins']
    pin = chamfered_prism(x, y, P['size'], P['tailZ'], z_top, P['tipChamfer'])
    b.add(finish, pin)
    fillet = dome(x, y, P['jointRadius'], P['jointHeight'], 0.0, down=True)
    if finish == 'tin':
        b.add('tin', fillet)
    else:
        b.add('tin', fillet.cut(box(x - P['size'] / 2, x + P['size'] / 2, y - P['size'] / 2, y + P['size'] / 2, -2, 0.01)),
              (x + 0.62, y), 0.08, 'bottom')
    return pin


def strip(b, finish, cx, cy, length, along, pins):
    """Header housing: 2.54 wide, notched between positions, chamfered top edges, exact holes for its pins."""
    P, S = b.r['pins'], b.r['servo']
    h, w, nd, c = P['plasticHeight'], 2.54, S['notchDepth'], 0.2
    n = round(length / 2.54)
    a, half = -length / 2, w / 2
    cuts = [a + 2.54 * k for k in range(1, n)]
    pts = [(a, -half)]
    for u in cuts:  # V-notches between positions on both long faces
        pts += [(u - 0.2, -half), (u, -half + nd), (u + 0.2, -half)]
    pts += [(-a, -half), (-a, half)]
    for u in reversed(cuts):
        pts += [(u + 0.2, half), (u, half - nd), (u - 0.2, half)]
    pts += [(a, half)]
    body = cq.Workplane('XY').workplane(offset=TOP).polyline(pts).close().extrude(h)
    prof = [(-half, TOP), (half, TOP), (half, TOP + h - c), (half - c, TOP + h), (-half + c, TOP + h), (-half, TOP + h - c)]
    body = body.intersect(cq.Workplane('YZ').polyline(prof).close().extrude(-a + 0.01, both=True)).val()
    body = body.translate((cx, cy, 0)) if along == 'x' else body.rotate((0, 0, 0), (0, 0, 1), 90).translate((cx, cy, 0))
    for x, y in pins:
        body = body.cut(box(x - P['size'] / 2, x + P['size'] / 2, y - P['size'] / 2, y + P['size'] / 2, TOP - 0.01, TOP + h + 0.01))
    gap = 2.54 - length / 2  # on the centreline between the first two positions
    b.add(finish, body, (cx + (gap if along == 'x' else 0), cy + (gap if along == 'y' else 0)), 0.1)


def headers(b):
    P, S, H = b.r['pins'], b.r['servo'], b.r['headers']
    top = TOP + P['plasticHeight'] + P['aboveMm']
    colours = {'yellow': 'yellow', 'red': 'red', 'black': 'black'}
    for bank in S['banks']:
        xs = S['columnsX'][bank['side']]
        ys = [S['y0'] + 2.54 * j for j in bank['rows']]
        for x, colour in zip(xs, S['columnColours']):
            pins = [(x, y) for y in ys]
            for px, py in pins:
                through_pin(b, px, py, top, 'gold')
            strip(b, colours[colour], x, (ys[0] + ys[-1]) / 2, 2.54 * len(ys), 'y', pins)
    for key in ('spi', 'i2c', 'uart'):
        h = H[key]
        n = len(h['labels'])
        pins = [(h['x0'] + 2.54 * k, h['y']) for k in range(n)]
        for px, py in pins:
            through_pin(b, px, py, top, 'gold')
        strip(b, 'black', h['x0'] + 2.54 * (n - 1) / 2, h['y'], 2.54 * n, 'x', pins)


def gpio(b):
    G = b.r['gpio']
    for i in range(G['count']):
        for y in G['rows']:
            x = G['x0'] + G['pitch'] * i
            b.add('tin', dome(x, y, G['jointRadius'], G['jointHeight'], TOP, down=False), (x, y), 0.1)
    s = G['socket']
    body = box(s['x0'], s['x1'], s['y0'], s['y1'], -s['depth'], 0)
    entries = [cbox(G['x0'] + G['pitch'] * i, y, s['entry'], s['entry'], -s['depth'] - 0.01, -s['depth'] + s['entryDepth'])
               for i in range(G['count']) for y in G['rows']]
    b.loose.append(('GPIO socket, 2 x 20 female (underside)', 'header-black', body.cut(*entries)))


def xh_vertical(b, unit, M):
    cy = sum(unit['pinsY']) / 2
    cx, w, d, h = unit['cx'], M['width'], M['depth'], M['height']
    body = cbox(cx, cy, d, w, TOP, TOP + h)
    body = body.cut(cbox(cx, cy, d - 2 * M['wall'], w - 2 * M['wall'], TOP + M['floor'], TOP + h + 0.01))
    for dy in (-1.25, 1.25):  # the two keying slots in the wall facing the board centre
        body = body.cut(cbox(cx - d / 2 + M['wall'] / 2, cy + dy, M['wall'] + 0.02, 0.8, TOP + h - 2.6, TOP + h + 0.01))
    ramp = cbox(cx + d / 2 + 0.25, cy, 0.5, 2.6, TOP + h - 2.2, TOP + h - 0.6)  # locking ramp on the outer wall
    for y in unit['pinsY']:
        body = body.cut(cbox(unit['pinX'], y, b.r['pins']['size'], b.r['pins']['size'], TOP - 0.01, TOP + M['floor'] + 0.01))
        through_pin(b, unit['pinX'], y, M['pinTop'], 'tin')
    b.add('white', body, (cx - 1.6, cy), 0.12)
    b.add('white', ramp)


def connectors(b):
    C = b.r['connectors']
    for unit in C['motor']['units']:
        xh_vertical(b, unit, C['motor'])
    # battery: JST XH 3-pin side entry, mouth facing the left edge, pins bending down behind the housing
    J = C['battery']
    cy = sum(J['pinsY']) / 2
    body = box(J['x0'], J['x1'], cy - J['width'] / 2, cy + J['width'] / 2, TOP, TOP + J['height'])
    cav = J['cavity']
    body = body.cut(box(J['x0'] - 0.01, J['x0'] + cav['depth'], cy - cav['width'] / 2, cy + cav['width'] / 2, cav['z0'], cav['z1']))
    for x0, x1, y0, y1 in J['latchWindows']:
        body = body.cut(box(x0, x1, y0, y1, cav['z1'] - 0.01, TOP + J['height'] + 0.01))
    s = b.r['pins']['size'] / 2
    for y in J['pinsY']:
        run = box(J['x0'] + 0.5, J['legX'] + s, y - s, y + s, J['pinZ'] - s, J['pinZ'] + s)
        body = body.cut(run)
        b.add('tin', run)
        through_pin(b, J['legX'], y, J['pinZ'] + s, 'tin')
    b.add('white', body, (J['x0'] + 3.0, cy), 0.12)
    # I2C: JST SH 4-pin side entry at the left edge
    I = C['i2c']
    sh = box(I['x0'], I['x1'], I['y0'], I['y1'], TOP, TOP + I['height'])
    cv = I['cavity']
    sh = sh.cut(box(I['x0'] - 0.01, I['x0'] + cv['depth'], cv['y0'], cv['y1'], cv['z0'], cv['z1']))
    for y in I['pinsY']:
        contact = box(I['x0'] + 0.4, I['x1'] + 0.3, y - 0.15, y + 0.15, 3.0, 3.15)
        sh = sh.cut(contact)
        lead = contact.fuse(box(I['x1'] + 0.15, I['x1'] + 0.45, y - 0.15, y + 0.15, TOP, 3.0),
                            box(I['x1'] + 0.15, I['x1'] + 0.9, y - 0.15, y + 0.15, TOP, TOP + 0.15))
        b.add('tin', lead, (I['x1'] + 0.7, y), 0.07)
    for y0, y1 in ((I['y0'] - 0.4, I['y0']), (I['y1'], I['y1'] + 0.4)):
        b.add('tin', box(I['x0'] + 0.8, I['x0'] + 3.2, y0, y1, TOP, TOP + 0.8), ((I['x0'] + 2.0), (y0 + y1) / 2), 0.1)
    b.loose.append(('I2C connector, JST SH 4-pin', 'connector-cream', sh))
    # speaker connector J20: cream receptacle with the white two-wire plug
    S = C['speaker']
    x0, x1, y0, y1, h = S['receptacle']
    b.loose.append(('Speaker connector J20', 'connector-cream', box(x0, x1, y0, y1, TOP, TOP + h)))
    for tx0, tx1 in ((x0 - 0.4, x0), (x1, x1 + 0.4)):
        b.add('tin', box(tx0, tx1, y0 + 0.4, y0 + 2.4, TOP, TOP + 0.6), ((tx0 + tx1) / 2, y0 + 1.4), 0.08)
    for wx, _ in S['wireExits']:
        b.add('tin', box(wx - 0.15, wx + 0.15, y0 - 0.5, y0, TOP, TOP + 0.2), (wx, y0 - 0.25), 0.07)
    px0, px1, py0, py1, ph = S['plug']
    plug = box(px0, px1, py0, py1, TOP, TOP + ph)
    for wx, _ in S['wireExits']:  # the wire entries on the plug's outer face
        plug = plug.cut(cq.Workplane('XZ', origin=(0, py1 + 0.01, 0)).center(wx, TOP + 1.3).circle(0.45).extrude(1.0).val())
    b.add('white', plug, ((px0 + px1) / 2, py0 + 1.0), 0.12)
    usbc(b, C['usbc'])
    slide_switch(b, C['switch'])
    buttons(b, C['buttons'])
    for y, label in zip(C['swdPads']['ys'], C['swdPads']['labels']):
        x = C['swdPads']['x']
        b.add('tin', cyl(x, y, C['swdPads']['radius'], -0.03, 0), (x, y), 0.1, 'bottom', z_start=0.0)
        b.text(label, 0.6, x - 1.0, y, 0, side='bottom', weight='bold', halign='right')


def usbc(b, U):
    cx, y0, y1, w, h = U['cx'], U['y0'], U['y1'], U['width'], U['height']
    zc = TOP + h / 2
    # stadium cross-sections drawn in the XZ plane (x across the port, z up) and extruded along y
    shell = prism(stadium_wire(cx, zc, w, h, 0, to3d=lambda p: (p[0], y1, p[1])), 0, 0, direction=cq.Vector(0, -(y1 - y0), 0))
    mouth = prism(stadium_wire(cx, zc, w - 0.6, h - 0.6, 0, to3d=lambda p: (p[0], y0 - 0.01, p[1])), 0, 0, direction=cq.Vector(0, 4.0, 0))
    shell = shell.cut(mouth)
    tongue = box(cx - 3.3, cx + 3.3, y0 + 0.9, y0 + 4.6, zc - 0.35, zc + 0.35)
    shell = shell.cut(tongue)
    tabs = [box(x - 0.3, x + 0.3, y - 0.5, y + 0.5, -0.8, TOP + 0.6) for x in U['tabsX'] for y in U['tabsY']]
    shell = shell.fuse(*tabs)
    for x in U['tabsX']:
        for y in U['tabsY']:
            blob = rrect(x, y, 1.3, 1.8, 0.5, -0.45, 0).cut(box(x - 0.3, x + 0.3, y - 0.5, y + 0.5, -1, 0.01))
            b.add('tin', blob, (x + (0.45 if x > cx else -0.45), y), 0.06, 'bottom')
    n0 = len(b.vias)
    b.add('black', tongue, (cx, y0 + 4.3), 0.12, z_end=zc - 0.35)
    shell = shell.cut(*[box(v[2], v[3], v[4], v[5], v[6], v[7]) for v in b.vias[n0:]])
    for k in range(U['tails']):
        x = cx - 2.75 + 0.5 * k
        b.add('tin', box(x - 0.125, x + 0.125, y1, y1 + 0.7, TOP, TOP + 0.15), (x, y1 + 0.4), 0.06)
    b.loose.append(('USB-C charging receptacle', 'shell-dark', shell))


def slide_switch(b, S):
    shell = box(S['x0'], S['x1'], S['y0'], S['y1'], TOP, TOP + S['height'])
    sx0, sx1, sy0, sy1, above = S['slider']
    top = TOP + S['height']
    shell = shell.cut(box((sx0 + sx1) / 2 - 0.9, (sx0 + sx1) / 2 + 0.9, S['y0'] + 2.2, S['y1'] - 2.2, top - 0.6, top + 0.01))
    legs = [box(x - 0.25, x + 0.25, y - 0.4, y + 0.4, -S['legBelow'], TOP + 0.3) for x in S['legsX'] for y in S['legsY']]
    shell = shell.fuse(*legs)
    for x in S['legsX']:
        for y in S['legsY']:
            fillet = dome(x, y, 0.75, 0.45, 0.0, down=True).cut(box(x - 0.25, x + 0.25, y - 0.4, y + 0.4, -3, 0.01))
            b.add('tin', fillet, (x + 0.48, y), 0.06, 'bottom')
    slider = box(sx0, sx1, sy0, sy1, top - 0.6, top + above)
    n0 = len(b.vias)
    b.add('black', slider, ((sx0 + sx1) / 2, (sy0 + sy1) / 2), 0.12, z_end=top - 0.6)
    shell = shell.cut(*[box(v[2], v[3], v[4], v[5], v[6], v[7]) for v in b.vias[n0:]])
    b.loose.append(('Power switch (slide, ON shown)', 'port-nickel', shell))


def buttons(b, B):
    bw, bd, bh = B['base']
    aw, ad, ah = B['actuator']
    for k, u in enumerate(B['units']):
        cx, cy = u['cx'], u['cy']
        b.add('white', rrect(cx, cy, bw, bd, 0.3, TOP, TOP + bh), (cx, cy), 0.12)
        for sx in (-1, 1):
            for sy in (-1, 1):
                x = cx + sx * (bw / 2 + 0.15)
                b.add('tin', box(x - 0.15, x + 0.15, cy + sy * 1.05 - 0.3, cy + sy * 1.05 + 0.3, TOP, TOP + 0.25), (x, cy + sy * 1.05), 0.06)
        b.loose.append((f'{u["name"]} button actuator', 'tact-tan', stadium(cx, cy, aw, ad, TOP + bh, TOP + bh + ah)))


# ---------------------------------------------------------------- packages
def leads(b, cx, cy, side_len, count, pitch, width, length, h1, sides, body_half):
    """Gull-wing leads on the named sides ('+x', '-x', '+y', '-y') of a package centred at (cx, cy)."""
    base = gullwing(length, width, h1)
    for s in sides:
        deg = {'+x': 0, '+y': 90, '-x': 180, '-y': 270}[s]
        for k in range(count):
            off = (k - (count - 1) / 2) * pitch
            lead = base.translate((body_half[0 if s in '+x-x' else 1], off, 0)).rotate((0, 0, 0), (0, 0, 1), deg).translate((cx, cy, 0))
            fx = body_half[0 if s in '+x-x' else 1] + length * 0.8
            vx, vy = {'+x': (fx, off), '-x': (-fx, -off), '+y': (-off, fx), '-y': (off, -fx)}[s]
            b.add('tin', lead, (cx + vx, cy + vy), min(0.08, width / 2 - 0.03))


def package(b, cx, cy, wx, wy, h, name, dot=None):
    body = box(cx - wx / 2, cx + wx / 2, cy - wy / 2, cy + wy / 2, TOP, TOP + h)
    if dot:
        body = body.cut(cyl(cx + dot[0], cy + dot[1], 0.3, TOP + h - 0.05, TOP + h + 0.01))
    b.add('black', body, (cx, cy), 0.15)


def ics(b):
    for u in b.r['ics']['units']:
        cx, cy, pk = u['cx'], u['cy'], u['package']
        axis = u.get('axis', 'y')
        if pk == 'LQFP48':
            package(b, cx, cy, 7.0, 7.0, 1.4, u['ref'], (2.7, 2.7))
            leads(b, cx, cy, 7.0, 12, 0.5, 0.22, 1.0, 0.55, ('+x', '-x', '+y', '-y'), (3.5, 3.5))
        elif pk in ('SOP8', 'SOP14', 'SOP16'):
            n = int(pk[3:]) // 2
            length = {4: 4.9, 7: 8.65, 8: 9.9}[n]
            wx, wy = (3.9, length) if axis == 'y' else (length, 3.9)
            package(b, cx, cy, wx, wy, 1.5, u['ref'], (-wx / 2 + 0.7, wy / 2 - 0.7) if axis == 'y' else (-wx / 2 + 0.7, -wy / 2 + 0.7))
            leads(b, cx, cy, length, n, 1.27, 0.42, 1.05, 0.6, ('+x', '-x') if axis == 'y' else ('+y', '-y'), (1.95, 1.95))
        elif pk == 'SOT23-6':
            package(b, cx, cy, 1.6, 2.9, 1.1, u['ref'])
            leads(b, cx, cy, 2.9, 3, 0.95, 0.4, 0.6, 0.45, ('+x', '-x'), (0.8, 0.8))
        elif pk == 'SOT23':
            package(b, cx, cy, 2.9, 1.3, 1.0, u['ref'])
            base = gullwing(0.55, 0.4, 0.4)
            for dx, s in ((-0.95, '+y'), (0.95, '+y'), (0.0, '-y')):
                deg = 90 if s == '+y' else 270
                lead = base.translate((0.65, 0, 0)).rotate((0, 0, 0), (0, 0, 1), deg).translate((cx + dx, cy, 0))
                b.add('tin', lead, (cx + dx, cy + (1.09 if s == '+y' else -1.09)), 0.08)
        elif pk == 'TSSOP8':
            package(b, cx, cy, 4.4, 3.0, 1.0, u['ref'])
            leads(b, cx, cy, 3.0, 4, 0.65, 0.3, 1.0, 0.45, ('+x', '-x'), (2.2, 2.2))
        elif pk == 'QFN24':
            package(b, cx, cy, 4.0, 4.0, 0.8, u['ref'], (1.5, 1.5))
            for s in ('+x', '-x', '+y', '-y'):
                for k in range(6):
                    off = (k - 2.5) * 0.5
                    pad = box(2.0, 2.15, off - 0.125, off + 0.125, TOP, TOP + 0.2)
                    deg = {'+x': 0, '+y': 90, '-x': 180, '-y': 270}[s]
                    pad = pad.rotate((0, 0, 0), (0, 0, 1), deg).translate((cx, cy, 0))
                    v = {'+x': (2.075, off), '-x': (-2.075, -off), '+y': (-off, 2.075), '-y': (off, -2.075)}[s]
                    b.add('tin', pad, (cx + v[0], cy + v[1]), 0.05)
        elif pk == 'SOT223':
            package(b, cx, cy, 6.5, 3.5, 1.7, u['ref'])
            tab = gullwing(1.8, 3.0, 0.7, 0.25).rotate((0, 0, 0), (0, 0, 1), 90).translate((cx, cy + 1.75, 0))
            b.add('tin', tab, (cx, cy + 1.75 + 1.45), 0.2)
            for dx in (-2.3, 0.0, 2.3):
                lead = gullwing(1.6, 0.7, 0.7, 0.25).rotate((0, 0, 0), (0, 0, 1), 270).translate((cx + dx, cy - 1.75, 0))
                b.add('tin', lead, (cx + dx, cy - 1.75 - 1.3), 0.12)
        elif pk == 'SMA':
            package(b, cx, cy, 4.3, 2.6, 2.2, u['ref'])
            for s in (-1, 1):
                x = cx + s * 2.15
                lead = box(min(x, x + s * 0.3), max(x, x + s * 0.3), cy - 0.7, cy + 0.7, TOP, TOP + 0.9).fuse(
                    box(min(x, x + s * 0.75), max(x, x + s * 0.75), cy - 0.7, cy + 0.7, TOP, TOP + 0.15))
                b.add('tin', lead, (x + s * 0.5, cy), 0.12)
        elif pk == 'crystal3225':
            b.loose.append(('Crystal Y1, 8 MHz', 'port-nickel', rrect(cx, cy, 3.2, 2.5, 0.25, TOP, TOP + 0.8)))
            for sx in (-1, 1):
                for sy in (-1, 1):
                    x, y = cx + sx * 1.75, cy + sy * 0.65
                    b.add('tin', box(x - 0.15, x + 0.15, y - 0.4, y + 0.4, TOP, TOP + 0.15), (x, y), 0.06)
        else:
            raise ValueError('UNKNOWN_PACKAGE ' + pk)


def inductors(b):
    for u in b.r['inductors']['units']:
        cx, cy, s, h = u['cx'], u['cy'], u['size'], u['height']
        body = rrect(cx, cy, s, s, u['radius'], TOP, TOP + h)
        for sx in (-1, 1):
            x = cx + sx * (s / 2 + 0.2)
            b.add('tin', box(x - 0.2, x + 0.2, cy - s * 0.3, cy + s * 0.3, TOP, TOP + 0.3), (x, cy), 0.1)
        n0 = len(b.vias)
        b.text(u['marking'], u['capHeight'], cx, cy, u['rot'], z=TOP + h, via_end=TOP + h)
        body = body.cut(*[box(v[2], v[3], v[4], v[5], v[6], v[7]) for v in b.vias[n0:]])
        b.loose.append((f'Inductor {u["ref"]} ({u["marking"]})', 'ferrite-grey', body))


def passives(b):
    P = b.r['passives']
    for kind, size, x, y, rot in P['units']:
        L, W, Hr, t = P['sizes'][size]
        h = Hr if kind == 'R' else P['capHeights'][size]
        if rot % 180:
            L, W = W, L
        horizontal = rot % 180 == 0
        if horizontal:
            body = box(x - L / 2 + t, x + L / 2 - t, y - W / 2, y + W / 2, TOP, TOP + h)
            ends = [(box(x - L / 2, x - L / 2 + t, y - W / 2, y + W / 2, TOP, TOP + h), (x - L / 2 + t / 2, y)),
                    (box(x + L / 2 - t, x + L / 2, y - W / 2, y + W / 2, TOP, TOP + h), (x + L / 2 - t / 2, y))]
        else:
            body = box(x - L / 2, x + L / 2, y - W / 2 + t, y + W / 2 - t, TOP, TOP + h)
            ends = [(box(x - L / 2, x + L / 2, y - W / 2, y - W / 2 + t, TOP, TOP + h), (x, y - W / 2 + t / 2)),
                    (box(x - L / 2, x + L / 2, y + W / 2 - t, y + W / 2, TOP, TOP + h), (x, y + W / 2 - t / 2))]
        b.add('black' if kind == 'R' else 'tan', body, (x, y), 0.1)
        for end, at in ends:
            b.add('tin', end, at, min(0.08, t / 2 - 0.04))


def leds(b):
    L = b.r['leds']
    w, d, h = L['size']
    for u in L['units']:
        x, y = u['cx'], u['cy']
        horiz = u['rot'] % 180 == 0
        bw, bd = (w - 0.8, d) if horiz else (d, w - 0.8)
        b.add('white', cbox(x, y, bw, bd, TOP, TOP + h), (x, y), 0.12)
        for s in (-1, 1):
            ex, ey = (x + s * (w / 2 - 0.2), y) if horiz else (x, y + s * (w / 2 - 0.2))
            ew, ed = (0.4, d) if horiz else (d, 0.4)
            b.add('tin', cbox(ex, ey, ew, ed, TOP, TOP + h * 0.5), (ex, ey), 0.08)


def speaker(b):
    S = b.r['speakerBody']
    cx, cy, w, l, r, h = S['cx'], S['cy'], S['width'], S['length'], S['radius'], S['height']
    top = TOP + h
    body = rrect(cx, cy, w, l, r, TOP, top)
    i1, i2 = S['rimInset'], S['feltInset']
    body = body.cut(rrect(cx, cy, w - 2 * i1, l - 2 * i1, r - i1, top - S['rimDrop'], top + 0.01))
    floor = top - S['rimDrop'] - S['feltDrop']
    body = body.cut(rrect(cx, cy, w - 2 * i2, l - 2 * i2, r - i2 + 0.6, floor, top + 0.01))
    b.loose.append(('Speaker body', 'speaker-dark', body))
    b.loose.append(('Speaker diaphragm (felt)', 'speaker-felt', rrect(cx, cy, w - 2 * i2, l - 2 * i2, r - i2 + 0.6, floor, floor + S['feltThickness'])))


def speaker_leads(b):
    W = b.r['leads']
    sr, tr, pitch = W['strandRadius'], W['twistRadius'], W['twistPitch']
    zb = -(tr + sr + 0.03)
    for k, run in enumerate(W['underside']):
        p0, p1 = (*run['from'], zb), (*run['to'], zb)
        for phase, mat in ((0, 'wire-red'), (180, 'wire-black')):
            b.loose.append((f'Speaker lead, underside run {k + 1} ({mat[5:]})', mat, helix_strand(p0, p1, phase, tr, sr, pitch)))
    zt = TOP + tr + sr + 0.06
    t = W['topRun']
    for phase, mat in ((0, 'wire-red'), (180, 'wire-black')):
        b.loose.append((f'Speaker lead at the cable slot ({mat[5:]})', mat, helix_strand((*t['from'], zt), (*t['to'], zt), phase, tr, sr, pitch)))
    pts = W['plugToSpeaker']
    for off, mat in ((-0.42, 'wire-black'), (0.42, 'wire-red')):
        b.loose.append((f'Speaker lead, plug to speaker ({mat[5:]})', mat, spline_strand([(x + off, y, z) for x, y, z in pts], sr)))


def silkscreen(b):
    S = b.r['silkscreen']
    st = S['strokeMm']
    t = S['thicknessMm']
    for s, x, y, cap, rot, *fit in S['top']:
        b.text(s, cap, x, y, rot, fit=fit[0] if fit else None)
    for cx, cy, w, d in S['boxes']:
        b.line_rect(cx, cy, w, d, st)
    H = b.r['mountingHoles']
    r0, r1 = H['silkRingRadiusMm'] - H['silkRingWidthMm'] / 2, H['silkRingRadiusMm'] + H['silkRingWidthMm'] / 2
    for x, y in H['centres']:
        # The bore rings are set flush into the mask: screw heads and standoff tops bear on the board here, and must meet
        # the board's face as they do on the instructional HAT, not raised ink.
        for side, z0 in (('top', TOP - t), ('bottom', 0.0)):
            ink = ring(x, y, r0, r1, z0, z0 + t)
            b.flush[side].append(ink)
            b.glyph(ink, side)
    # header pin labels
    hd = b.r['headers']
    for key, yl in (('spi', 49.47), ('uart', 49.44), ('i2c', 42.45)):
        for k, label in enumerate(hd[key]['labels']):
            b.text(label, 0.5, hd[key]['x0'] + 2.54 * k, yl, -90)
    # servo channel cells, numbers and column labels
    sv, cc = b.r['servo'], S['channelCells']
    numbers = {'PWM 0-3': 0, 'PWM 4-7': 4, 'PWM 8-11': 8, 'ADC': 0, 'DIGITAL': 0}
    for bank in sv['banks']:
        ys = [sv['y0'] + 2.54 * j for j in bank['rows']]
        x = cc['x'] if bank['side'] == 'right' else cc['leftX']
        if bank['side'] == 'right':
            b.line_rect(x, (ys[0] + ys[-1]) / 2, cc['width'], 2.54 * len(ys), st, r=0.25)
            for yy in ys[:-1]:
                b.glyph(box(x - cc['width'] / 2, x + cc['width'] / 2, yy + 1.27 - st / 2, yy + 1.27 + st / 2, TOP, TOP + t), 'top')
        for k, yy in enumerate(ys):
            b.text(str(numbers[bank['name']] + k), cc['capHeight'], x, yy, cc['rot'])
    for row in S['signalLabelRows']:
        for side in ('left', 'right'):
            if side == 'left' and row != S['signalLabelRows'][0]:
                continue
            for x, label in zip(sv['columnsX'][side], sv['columnSignals']):
                b.text(label, 0.5, x, row, -90)
    for hx, hy in S['hatches']:
        hw = cc['width']
        b.line_rect(hx, hy, hw, 2.0, st, r=0.0)
        x0, x1, y0, y1 = hx - hw / 2 + st / 2, hx + hw / 2 - st / 2, hy - 1.0 + st / 2, hy + 1.0 - st / 2
        for k in range(-2, 3):
            # a 45 degree hatch line through (hx + 0.55 k, hy), clipped to the frame's inside and drawn as a strip
            px, py, ux, uy = hx + 0.55 * k, hy, math.sqrt(0.5), -math.sqrt(0.5)
            lo = max((x0 - px) / ux, (y1 - py) / uy)
            hi = min((x1 - px) / ux, (y0 - py) / uy)
            if hi - lo < 0.3:
                continue
            a, c = (px + ux * lo, py + uy * lo), (px + ux * hi, py + uy * hi)
            n = (-uy * st / 2, ux * st / 2)
            b.glyph(band(polygon_wire([(a[0] + n[0], a[1] + n[1]), (c[0] + n[0], c[1] + n[1]), (c[0] - n[0], c[1] - n[1]), (a[0] - n[0], a[1] - n[1])], TOP), [], t), 'top')
    # underside branding, read from below
    for s, x, y, cap, weight, *fit in S['bottom']:
        b.text(s, cap, x, y, 0, side='bottom', weight=weight, halign='left', valign='bottom', fit=fit[0] if fit else None)
    L = S['logos']
    fx, fy, fc = L['fcc']
    b.text('F', fc, fx, fy, 0, side='bottom', weight='bold', halign='left', valign='bottom')
    ccx, ccy = fx + 2.75, fy - fc / 2
    for rr in (1.6, 0.95):
        gap = math.asin(0.55 / rr)  # the C's opening faces +x, as photographed
        b.glyph(band(arc_band(ccx, ccy, rr - 0.38, rr, gap, 2 * math.pi - gap, -t), [], t), 'bottom')
    ex, ey, ec = L['ce']
    b.text('CE', ec, ex, ey, 0, side='bottom', weight='regular', halign='left', valign='bottom')
    rx, ry, rs = L['rcm']
    outer = polygon_wire([(rx - rs / 2, ry + 1.65), (rx + rs / 2, ry + 1.65), (rx, ry - 1.75)], -t)
    inner = polygon_wire([(rx - rs / 2 + 0.62, ry + 1.35), (rx + rs / 2 - 0.62, ry + 1.35), (rx, ry - 1.13)], -t)
    b.glyph(band(outer, [inner], t), 'bottom')
    b.glyph(band(arc_band(rx, ry + 0.25, 0.55, 0.85, math.pi, 2 * math.pi, -t), [], t), 'bottom')


def build(review):
    """Ordered (name, materialId, solid) parts; the order is stable so the export is deterministic."""
    b = Board(review)
    silkscreen(b)
    gpio(b)
    headers(b)
    connectors(b)
    ics(b)
    inductors(b)
    passives(b)
    leds(b)
    speaker(b)
    speaker_leads(b)
    return b.assemble()
