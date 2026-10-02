"""Plate A deck: measure holes, arms and outline in the calibrated top-down master photograph.

Run in the frozen M4 environment, source mode:
  PYTHONPATH=digital-twin/cad <env>/bin/python -m twin_cad.fidelity.plate_a --root <repo> --output <review.json>
The photograph stays in the ignored private folder; the output holds derived numbers and residuals only.
"""
import argparse
import json
from pathlib import Path

import numpy as np

from .photo import CardPlane, Similarity, measure_hole, measure_slot, strongest_edges, fit_line, fit_circle

PHOTO = 'docs/PiCar Plate Pictures/PiCar-X-Z0104V40-Plate-Photo-Evidence/Plate-A/plate-A_01_top-down-master.jpeg'
PARAMETERS = 'digital-twin/validation/expected/plates/instructional/all-parameters.json'
CARD_ROI, PENNY_ROI = [260, 700, 760, 1040], [905, 740, 1045, 875]
# Reviewer seeds (full-resolution pixels): pan hole, arm-end hole at image top, arm-end hole at image bottom.
SEEDS = {'pan': [1142, 451], 'armTop': [985, 237], 'armBottom': [959, 665]}


def deck(root):
    plate = next(d for d in json.loads((root / PARAMETERS).read_text())['definitions'] if d['definitionId'] == 'PX-V40-DEF-PLATE-A')
    return next(f for f in plate['profile']['faces'] if f['name'] == 'deck')


def align(plane, holes, mirror):
    by_id = {h['id']: h for h in holes}
    seed_mm = plane.to_mm(np.array([SEEDS['pan'], SEEDS['armTop'], SEEDS['armBottom']], dtype=np.float64))
    top, bottom = ('deck.hole.9', 'deck.hole.8') if mirror else ('deck.hole.8', 'deck.hole.9')
    model = [by_id['deck.hole.13']['centerMm'], by_id[top]['centerMm'], by_id[bottom]['centerMm']]
    sim = Similarity.fit(model, seed_mm, mirror)
    measured = {}
    for _ in range(3):
        measured = {}
        for h in holes:
            if h['diameterMm'] < 2.5:
                continue
            c, r, rms, n = measure_hole(plane, sim.forward([h['centerMm']])[0], h['diameterMm'] / 2)
            if rms < 0.25 and abs(2 * r / h['diameterMm'] - 1) < 0.35 and n > 40:
                measured[h['id']] = {'centreCardMm': c, 'diameterMm': 2 * r, 'edgeRmsMm': rms, 'edgePoints': n}
        ids = sorted(measured)
        sim = Similarity.fit([by_id[i]['centerMm'] for i in ids], [measured[i]['centreCardMm'] for i in ids], mirror)
    residual = {i: float(np.linalg.norm(sim.forward([by_id[i]['centerMm']])[0] - m['centreCardMm'])) for i, m in measured.items()}
    return sim, measured, residual


def outline_edges(plane, sim, outline, first, last, spacing=0.4, reach=3.0):
    """Photo edge points (model frame) found along the outward normals of M6 outline segments first..last."""
    pts = np.asarray(outline, dtype=np.float64)
    area = 0.5 * np.sum(pts[:, 0] * np.roll(pts[:, 1], -1) - np.roll(pts[:, 0], -1) * pts[:, 1])
    found = []
    for i in range(first, last):
        a, b = pts[i], pts[(i + 1) % len(pts)]
        d = b - a
        length = np.linalg.norm(d)
        if length < 1e-6:
            continue
        d /= length
        outward = np.array([d[1], -d[0]]) if area > 0 else np.array([-d[1], d[0]])
        for s in np.arange(spacing / 2, length, spacing):
            p = a + d * s
            start, end = sim.forward([p - outward * reach, p + outward * reach])
            direction = (end - start) / np.linalg.norm(end - start)
            (hit, strength), = strongest_edges(plane, [start], [direction], np.linalg.norm(end - start), polarity=-1)
            found.append((sim.inverse([hit])[0], strength))
    strengths = np.array([f[1] for f in found])
    keep = strengths > 0.35 * np.median(strengths)
    return np.array([f[0] for f, k in zip(found, keep) if k])


def arm(points, sign, end_hole):
    """Fit one arm (sign +1: model +y, -1: model -y) as two side lines, a round end and two root fillets."""
    y = points[:, 1] * sign
    side = points[(y > 25) & (y < end_hole[1] * sign - 2)]
    axis_x = np.median(side[:, 0])
    rear, front = side[side[:, 0] < axis_x], side[side[:, 0] >= axis_x]
    rear_line, front_line = fit_line(rear), fit_line(front)
    end = points[y > end_hole[1] * sign + 1.5]
    end_centre, end_radius, end_rms, _ = fit_circle(end)
    return {'rearEdgeX': float(rear_line[0][0]), 'frontEdgeX': float(front_line[0][0]),
            'rearEdgeRmsMm': rear_line[2], 'frontEdgeRmsMm': front_line[2],
            'rearEdgeAngleDeg': float(np.degrees(np.arctan2(rear_line[1][0], rear_line[1][1]))),
            'widthMm': float(front_line[0][0] - rear_line[0][0]), 'axisX': float((front_line[0][0] + rear_line[0][0]) / 2),
            'endCentreMm': end_centre.tolist(), 'endRadiusMm': end_radius, 'endRmsMm': end_rms, 'endPoints': int(len(end))}


PAIRS = [('deck.hole.8', 'deck.hole.9'), ('deck.hole.11', 'deck.hole.12'), ('deck.hole.2', 'deck.hole.5'), ('deck.hole.3', 'deck.hole.4')]


def mirror_axis(in_model):
    """The line (y = c + tan(a) x in the M6 frame) about which the measured hole pairs are mirror images."""
    def reflect(p, c, a):
        o, d = np.array([0.0, c]), np.array([np.cos(a), np.sin(a)])
        foot = o + ((p - o) @ d) * d
        return 2 * foot - p
    def cost(v):
        c, a = v
        s = sum(np.sum((reflect(in_model[i], c, a) - in_model[j]) ** 2) for i, j in PAIRS if i in in_model and j in in_model)
        return s + np.sum((reflect(in_model['deck.hole.13'], c, a) - in_model['deck.hole.13']) ** 2)
    from scipy import optimize
    c, a = optimize.minimize(cost, [0.0, 0.0], method='Nelder-Mead', options={'xatol': 1e-9, 'fatol': 1e-12}).x
    residuals = {f'{i}/{j}': float(np.linalg.norm(reflect(in_model[i], c, a) - in_model[j])) for i, j in PAIRS if i in in_model and j in in_model}
    return float(c), float(a), residuals


def to_axis_frame(p, c, a):
    """M6 frame -> frame whose x-axis is the plate's mirror axis (origin where the axis crosses x = 0)."""
    q = np.asarray(p, dtype=np.float64) - np.array([0.0, c])
    r = np.array([[np.cos(a), np.sin(a)], [-np.sin(a), np.cos(a)]])
    return q @ r.T


def from_axis_frame(p, c, a):
    r = np.array([[np.cos(a), -np.sin(a)], [np.sin(a), np.cos(a)]])
    return np.asarray(p, dtype=np.float64) @ r.T + np.array([0.0, c])


def fit_design(plane, sim, outline, c, a, holes_axis):
    """Free-edge design primitives, fitted to photo edges pooled across the mirror axis (half-plate, y >= 0)."""
    segments = [(1, 2), (4, 13), (17, 28), (28, 29)]
    pts = np.concatenate([outline_edges(plane, sim, outline, f, l, reach=4.5) for f, l in segments])
    s = to_axis_frame(pts, c, a)
    side = np.sign(s[:, 1])
    q = np.c_[s[:, 0], np.abs(s[:, 1])]
    end = (np.abs(holes_axis['deck.hole.8']) + np.abs(holes_axis['deck.hole.9'])) / 2  # mirrored-mean end hole
    def select(xmin, xmax, ymin, ymax):
        return (q[:, 0] > xmin) & (q[:, 0] < xmax) & (q[:, 1] > ymin) & (q[:, 1] < ymax)
    regions = {
        'waist': select(68, 80, 22, 36), 'armRear': select(end[0] - 12, end[0] - 2, 26, end[1] - 2.5),
        'armFront': select(end[0] + 2, end[0] + 12, 26, end[1] - 2.5), 'armEnd': select(-1e9, 1e9, end[1] + 1.5, 1e9),
        'rootRear': select(119, end[0] - 4, 18.0, 25.5), 'rootFront': select(end[0] + 2, 145, 18.0, 24.5)}
    out = {'endHoleAxisMm': end.tolist(), 'edgePoints': int(len(q))}
    for name, mask in regions.items():
        if name in ('waist', 'armRear', 'armFront'):
            centre, direction, rms, n = fit_line(q[mask])
            per_side = {}
            for sgn, label in ((1, 'plusY'), (-1, 'minusY')):
                sub = q[mask & (side == sgn)]
                if len(sub) > 8:
                    cc, dd, rr, _ = fit_line(sub)
                    normal = np.array([direction[1], -direction[0]])
                    per_side[label] = {'offsetMm': float((cc - centre) @ normal), 'rmsMm': rr, 'points': int(len(sub))}
            out[name] = {'pointMm': centre.tolist(), 'direction': (direction * np.sign(direction[1] or 1)).tolist(), 'rmsMm': rms, 'points': n, 'sides': per_side}
        else:
            centre, radius, rms, n = fit_circle(q[mask])
            out[name] = {'centreMm': centre.tolist(), 'radiusMm': radius, 'rmsMm': rms, 'points': n,
                         'sides': {lab: dict(zip(('centreMm', 'radiusMm', 'rmsMm'), (lambda r: (r[0].tolist(), r[1], r[2]))(fit_circle(q[mask & (side == sg)]))))
                                   for sg, lab in ((1, 'plusY'), (-1, 'minusY')) if (mask & (side == sg)).sum() > 8}}
    return out


def _rot(v, a):
    return np.array([v[0] * np.cos(a) - v[1] * np.sin(a), v[0] * np.sin(a) + v[1] * np.cos(a)])


def _intersect(l1, l2):
    (p1, d1), (p2, d2) = l1, l2
    m = np.array([d1, -d2]).T
    t = np.linalg.solve(m, p2 - p1)
    return p1 + d1 * t[0]


def _fillet(l1, l2, r):
    """Arc tangent to l1 then l2 (travel order). Left turns are convex corners of a CCW outline."""
    (p1, d1), (p2, d2) = l1, l2
    turn = np.sign(d1[0] * d2[1] - d1[1] * d2[0])
    side = 1.0 if turn > 0 else -1.0  # centre lies to the left of travel for a left turn, right for a right turn
    n1, n2 = side * np.array([-d1[1], d1[0]]), side * np.array([-d2[1], d2[0]])
    centre = _intersect((p1 + n1 * r, d1), (p2 + n2 * r, d2))
    t1 = p1 + d1 * ((centre - p1) @ d1)
    t2 = p2 + d2 * ((centre - p2) @ d2)
    bisector = (t1 + t2) / 2 - centre
    through = centre + bisector / np.linalg.norm(bisector) * r
    return t1, through, t2, centre


FLANGE_FACES_MM = {'leftLarge': 38.0, 'rightLarge': -38.5, 'leftSlotted': 19.0, 'rightSlotted': -20.0}  # M6 flange outer faces
KEPT_FRONT = [[172.73, -19.92], [173.69, -17.99], [173.69, 16.83], [171.57, 19.15]]  # M6 front section, unchanged


def design_outline(review):
    """Deck outline in the M6 frame as a closed CCW loop of lines joined by sharp corners or tangent arcs.

    Arms: side lines tangent to the end circle (centre: the mirrored-mean end hole, radius: measured), at the
    measured taper, mirrored about the measured plate axis; root fillets at the measured radii. Bend edges lie
    on the M6 flange outer faces; the front section keeps its M6 vertices exactly (intersections of its lines).
    """
    c, a = review['mirrorAxis']['yInterceptMm'], np.radians(review['mirrorAxis']['angleDeg'])
    d = review['design']
    end = np.array(d['endHoleAxisMm'])
    r_end = float(np.mean([s['radiusMm'] for s in d['armEnd']['sides'].values()]))
    r_front = float(np.mean([s['radiusMm'] for s in d['rootFront']['sides'].values()]))
    r_rear = float(np.mean([s['radiusMm'] for s in d['rootRear']['sides'].values()]))
    unit = lambda v: np.asarray(v, dtype=np.float64) / np.linalg.norm(v)
    dr, df, dw = unit(d['armRear']['direction']), unit(d['armFront']['direction']), unit(d['waist']['direction'])
    axis_lines = {  # +y half, axis frame; directions point outward (+y) for the arm sides, toward the rear for the waist
        'armRear': (end - np.array([dr[1], -dr[0]]) * r_end, dr),
        'armFront': (end + np.array([df[1], -df[0]]) * r_end, df),
        'waist': (np.array(d['waist']['pointMm']), dw)}

    def free(name, mirror, reverse):
        p, v = axis_lines[name]
        if mirror:
            p, v = np.array([p[0], -p[1]]), np.array([v[0], -v[1]])
        return (from_axis_frame([p], c, a)[0], _rot(-v if reverse else v, a))

    def through(p, q):
        p, q = np.asarray(p, dtype=np.float64), np.asarray(q, dtype=np.float64)
        return (p, (q - p) / np.linalg.norm(q - p))

    flat = lambda y, sign: (np.array([0.0, y]), np.array([sign, 0.0]))
    f = FLANGE_FACES_MM
    loop = [  # (line, corner with the next line): None = sharp, number = tangent arc radius
        (flat(f['rightLarge'], 1), None),
        (free('waist', True, True), None),
        (flat(f['rightSlotted'], 1), r_rear),
        (free('armRear', True, False), r_end),
        (free('armFront', True, True), r_front),
        (flat(KEPT_FRONT[0][1], 1), None),
        (through(KEPT_FRONT[0], KEPT_FRONT[1]), None),
        (through(KEPT_FRONT[1], KEPT_FRONT[2]), None),
        (through(KEPT_FRONT[2], KEPT_FRONT[3]), None),
        (flat(KEPT_FRONT[3][1], -1), r_front),
        (free('armFront', False, False), r_end),
        (free('armRear', False, True), r_rear),
        (flat(f['leftSlotted'], -1), None),
        (free('waist', False, False), None),
        (flat(f['leftLarge'], -1), None),
        ((np.array([0.0, 0.0]), np.array([0.0, -1.0])), None),
    ]
    corners, arcs = [], []
    for i, (line, corner) in enumerate(loop):
        nxt = loop[(i + 1) % len(loop)][0]
        if corner is None:
            corners.append(('point', _intersect(line, nxt)))
        elif corner == r_end:
            # Round arm end: the known end circle (it may wrap more than half a turn, so no chord-based fillet).
            mirrored = line[0][1] < c  # the -y arm lies below the axis
            centre = from_axis_frame([end * np.array([1, -1 if mirrored else 1])], c, a)[0]
            t1 = line[0] + line[1] * ((centre - line[0]) @ line[1])
            t2 = nxt[0] + nxt[1] * ((centre - nxt[0]) @ nxt[1])
            outward = line[1] - nxt[1]
            mid = centre + outward / np.linalg.norm(outward) * r_end
            corners.append(('arc', t1, mid, t2))
            arcs.append({'centreMm': centre.tolist(), 'radiusMm': r_end, 'tangencyErrorMm': [float(abs(np.linalg.norm(t1 - centre) - r_end)), float(abs(np.linalg.norm(t2 - centre) - r_end))]})
        else:
            t1, mid, t2, centre = _fillet(line, nxt, corner)
            corners.append(('arc', t1, mid, t2))
            arcs.append({'centreMm': centre.tolist(), 'radiusMm': corner})
    start = corners[-1][1] if corners[-1][0] == 'point' else corners[-1][3]
    segments = []
    for item in corners:
        segments.append({'kind': 'line', 'toMm': item[1].tolist()})
        if item[0] == 'arc':
            segments.append({'kind': 'arc', 'throughMm': item[2].tolist(), 'toMm': item[3].tolist()})
    return {'startMm': start.tolist(), 'segments': segments}, {'endRadiusMm': r_end, 'rootFrontRadiusMm': r_front, 'rootRearRadiusMm': r_rear, 'arcs': arcs}


def run(root):
    plane = CardPlane(root / PHOTO, CARD_ROI, PENNY_ROI)
    holes = [{'id': h['name'], 'centerMm': h['centerMm'], 'diameterMm': h['diameterMm']} for h in deck(root)['holes']]
    fits = {m: align(plane, holes, m) for m in (True, False)}
    mirror = min(fits, key=lambda m: np.median(list(fits[m][2].values())) if fits[m][2] else 1e9)
    sim, measured, residual = fits[mirror]
    # Holes as measured, expressed in the M6 model frame through the fitted similarity.
    in_model = {i: sim.inverse([m['centreCardMm']])[0] for i, m in measured.items()}
    pairs = [('deck.hole.8', 'deck.hole.9'), ('deck.hole.11', 'deck.hole.12'), ('deck.hole.1', 'deck.hole.6'),
             ('deck.hole.2', 'deck.hole.5'), ('deck.hole.3', 'deck.hole.4'), ('deck.hole.7', 'deck.hole.10')]
    symmetric = [{'pair': list(p), 'measuredMm': [in_model[p[0]].tolist(), in_model[p[1]].tolist()],
                  'midY': float((in_model[p[0]][1] + in_model[p[1]][1]) / 2), 'xDifference': float(in_model[p[0]][0] - in_model[p[1]][0])}
                 for p in pairs if p[0] in in_model and p[1] in in_model]
    outline = deck(root)['outlineMm']
    axis_c, axis_a, axis_residuals = mirror_axis(in_model)
    holes_axis = {i: to_axis_frame(p, axis_c, axis_a) for i, p in in_model.items()}
    design = fit_design(plane, sim, outline, axis_c, axis_a, holes_axis)
    slots = {}
    for slot in deck(root)['slots']:
        a, b = sim.forward(slot['endCentersMm'])
        m = measure_slot(plane, a, b, slot['widthMm'] * sim.s)
        ends_model = sim.inverse(np.array(m['endCentres']))
        slots[slot['name']] = {'m6EndsMm': slot['endCentersMm'], 'm6WidthMm': slot['widthMm'], 'photoEndsMm': ends_model.tolist(),
                               'photoEndsAxisMm': to_axis_frame(ends_model, axis_c, axis_a).tolist(), 'photoWidthMm': m['width'] / sim.s,
                               'sideRmsMm': m['sideRms'] / sim.s}
    design['slots'] = slots
    arms = {}
    for name, sign, (first, last), hole in (('minusY', -1, (4, 13), 'deck.hole.8'), ('plusY', 1, (17, 28), 'deck.hole.9')):
        edges = outline_edges(plane, sim, outline, first, last)
        arms[name] = {**arm(edges, sign, in_model[hole]), 'endHoleMm': in_model[hole].tolist(), 'edgeSamples': int(len(edges))}
    return {
        'mirrorAxis': {'yInterceptMm': axis_c, 'angleDeg': float(np.degrees(axis_a)), 'pairResidualsMm': axis_residuals,
                       'note': 'Line in the M6 Plate A frame about which the measured hole pairs are mirror images'},
        'design': design,
        'arms': arms,
        'photo': PHOTO.split('/')[-1], 'calibration': {k: plane.calibration[k] for k in ('withheldStraightEdgeRmsPx', 'pennyMaxDeviationMm')},
        'alignment': {'mirror': mirror, 'scale': sim.s, 'rotationDeg': float(np.degrees(sim.theta)), 'holesUsed': len(measured),
                      'medianResidualMm': float(np.median(list(residual.values()))), 'maxResidualMm': float(max(residual.values()))},
        'holes': {i: {'m6Mm': next(h['centerMm'] for h in holes if h['id'] == i), 'photoInModelMm': in_model[i].tolist(),
                      'deltaMm': float(np.linalg.norm(in_model[i] - next(h['centerMm'] for h in holes if h['id'] == i))),
                      'diameterMm': m['diameterMm'], 'edgeRmsMm': m['edgeRmsMm']} for i, m in sorted(measured.items())},
        'pairs': symmetric,
    }, plane, sim


M6_PLATE_A = 'docs/implementation/evidence/m6/amendment-shapes-04/candidate-artifacts/PX-V40-DEF-PLATE-A.brep'
REVISION_ID = 'PX-STUDIO-FIDELITY-PLATE-A-OUTLINE-01'


def densify(start, segments, step=0.05):
    """Polyline through a line/arc outline (arcs sampled on their true circle)."""
    pts, cur = [np.asarray(start, dtype=np.float64)], np.asarray(start, dtype=np.float64)
    for s in segments:
        to = np.asarray(s['toMm'], dtype=np.float64)
        if s['kind'] == 'line':
            n = max(2, int(np.linalg.norm(to - cur) / step))
            pts.extend(cur + (to - cur) * t for t in np.linspace(0, 1, n)[1:])
        else:
            mid = np.asarray(s['throughMm'], dtype=np.float64)
            a, b = cur, to
            d = 2 * (a[0] * (mid[1] - b[1]) + mid[0] * (b[1] - a[1]) + b[0] * (a[1] - mid[1]))
            ux = ((a @ a) * (mid[1] - b[1]) + (mid @ mid) * (b[1] - a[1]) + (b @ b) * (a[1] - mid[1])) / d
            uy = ((a @ a) * (b[0] - mid[0]) + (mid @ mid) * (a[0] - b[0]) + (b @ b) * (mid[0] - a[0])) / d
            centre = np.array([ux, uy]); r = np.linalg.norm(a - centre)
            ang = lambda p: np.arctan2(p[1] - centre[1], p[0] - centre[0])
            t0, tm, t1 = ang(a), ang(mid), ang(b)
            ccw = (np.cross(mid - a, b - mid) > 0)
            if ccw and t1 < t0: t1 += 2 * np.pi
            if not ccw and t1 > t0: t1 -= 2 * np.pi
            n = max(4, int(abs(t1 - t0) * r / step))
            pts.extend(centre + r * np.array([np.cos(t), np.sin(t)]) for t in np.linspace(t0, t1, n)[1:])
        cur = to
    return np.array(pts)


def distance_to(polyline, points):
    a, b = polyline[:-1], polyline[1:]
    ab = b - a
    out = []
    for p in points:
        t = np.clip(np.einsum('ij,ij->i', p - a, ab) / np.maximum(np.einsum('ij,ij->i', ab, ab), 1e-12), 0, 1)
        out.append(np.min(np.linalg.norm(a + ab * t[:, None] - p, axis=1)))
    return np.array(out)


def build_revision(root, review, plane, sim):
    import copy
    import cadquery as cq
    from twin_cad.components.plates.instructional.generate import make_candidate
    from twin_cad.assemblies.instructional.verify import shape_features
    params = json.loads((root / PARAMETERS).read_text())
    m6 = next(d for d in params['definitions'] if d['definitionId'] == 'PX-V40-DEF-PLATE-A')
    revised = copy.deepcopy(m6)
    outline, info = design_outline(review)
    face = next(f for f in revised['profile']['faces'] if f['name'] == 'deck')
    m6_outline = face.pop('outlineMm')
    face['outlineSegmentsMm'] = outline
    shape = make_candidate(revised)
    old = cq.Shape.importBrep(str(root / M6_PLATE_A))
    # Features: every cylindrical hole/slot end of the accepted artifact is still present, unmoved.
    key = lambda f: (round(f['radius'], 4), *np.round(f['origin'][:2], 4))
    feats_old = sorted(key(f) for f in shape_features(old) if f['radius'] < 5)
    feats_new = sorted(key(f) for f in shape_features(shape) if f['radius'] < 5 and not any(abs(f['radius'] - a['radiusMm']) < 1e-6 for a in info['arcs']))
    missing = [f for f in feats_old if f not in feats_new]
    # Mirror check of the free edges (arms and waist) about the measured axis.
    c, a = review['mirrorAxis']['yInterceptMm'], np.radians(review['mirrorAxis']['angleDeg'])
    poly = densify(outline['startMm'], outline['segments'])
    free = poly[(poly[:, 0] > 66) & (poly[:, 0] < 146)]
    axis_pts = to_axis_frame(free, c, a)
    mirrored = from_axis_frame(axis_pts * np.array([1, -1]), c, a)
    arm_mask = np.abs(axis_pts[:, 1]) > 21.5  # above the bend-line edges, which follow the flanges
    mirror_dev = distance_to(poly, mirrored[arm_mask])
    # Photo agreement: photo edge points against the M6 trace and against the revision.
    edges = np.concatenate([outline_edges(plane, sim, m6_outline, f, l, reach=4.5) for f, l in [(1, 2), (4, 13), (17, 28), (28, 29)]])
    old_poly = np.vstack([m6_outline, m6_outline[:1]])
    d_old, d_new = distance_to(old_poly, edges), distance_to(poly, edges)
    checks = {
        'validSingleSolid': bool(shape.isValid() and len(shape.Solids()) == 1 and shape.Volume() > 0),
        'volumeMm3': {'m6': old.Volume(), 'revision': shape.Volume()},
        'featuresUnmoved': {'cylindricalFeaturesInM6': len(feats_old), 'missingOrMoved': missing},
        'freeEdgeMirrorDeviationMm': {'max': float(mirror_dev.max()), 'mean': float(mirror_dev.mean()), 'samples': int(len(mirror_dev))},
        'photoEdgeDistanceMm': {'edgePoints': int(len(edges)), 'm6Trace': {'mean': float(d_old.mean()), 'p95': float(np.percentile(d_old, 95)), 'max': float(d_old.max())},
                                'revision': {'mean': float(d_new.mean()), 'p95': float(np.percentile(d_new, 95)), 'max': float(d_new.max())}},
        'outlineSegments': {'lines': sum(s['kind'] == 'line' for s in outline['segments']), 'arcs': sum(s['kind'] == 'arc' for s in outline['segments'])},
    }
    return revised, shape, info, checks


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True, help='review JSON (derived numbers only)')
    parser.add_argument('--revision', type=Path, help='write the revision parameters file here')
    args = parser.parse_args()
    review, plane, sim = run(args.root)
    if args.revision:
        revised, shape, info, checks = build_revision(args.root, review, plane, sim)
        review['revision'] = {'id': REVISION_ID, 'design': info, 'checks': checks}
        photo_sha = __import__('hashlib').sha256((args.root / PHOTO).read_bytes()).hexdigest()
        args.revision.write_text(json.dumps({
            'id': 'PX-STUDIO-FIDELITY-REVISIONS-01', 'track': 'instructional-only', 'engineeringAdmission': False, 'runtimeAdmission': False,
            'label': 'Studio fidelity revision: Plate A outline rebuilt from the calibrated owner photograph as mirror-symmetric lines and true arcs; holes, slots, flanges and walls unchanged, non-engineering',
            'purpose': 'Studio fidelity: Plate A deck outline rebuilt from the calibrated owner photograph as mirror-symmetric lines and true arcs. Every hole, slot, cutout, flange and wall is unchanged.',
            'evidence': {'photo': PHOTO.split('/')[-1], 'photoSha256': photo_sha, 'review': 'digital-twin/validation/expected/m7/fidelity/plate-a-outline-01.review.json'},
            'definitions': [{'definitionId': 'PX-V40-DEF-PLATE-A', 'kind': 'm6-plate', 'revisionId': REVISION_ID, 'supersedes': M6_PLATE_A,
                             'parameters': {'definition': revised}}]}, indent=1) + '\n')
    args.output.write_text(json.dumps(review, indent=1) + '\n')
    print(json.dumps(review['alignment']))
    if args.revision:
        print(json.dumps(review['revision']['checks']))


if __name__ == '__main__':
    main()
