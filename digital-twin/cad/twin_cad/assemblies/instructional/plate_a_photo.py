"""Reproducible Plate A feature measurement on private owner photographs for S09; instructional-grade, not metrology.

Each feature is located from a seed in a tracked trace specification: a circle by radial edge scans and a robust least-squares fit, a straight
edge by scans along its normal and a total-least-squares line. An edge is the strongest smoothed grey-level gradient inside the stated search
band, so a seed bounds where to look but does not set the answer. Lengths are converted with an in-plane reference named in the specification,
and the payment-card scale is reported beside it as a cross-check only. Output holds only derived numbers; no pixels are written.
"""
import argparse
import json
from pathlib import Path
import numpy as np
from PIL import Image
from scipy import ndimage
import rfc8785
from .hardware_photo import card_scale


def grey(path, sigma):
    return ndimage.gaussian_filter(np.asarray(Image.open(path).convert('L'), dtype=np.float64), sigma)


def edge(g, origin, direction, lo, hi, polarity, step=0.25):
    """Strongest gradient along origin + t*direction for t in [lo, hi]; polarity 'rising'/'falling' restricts the sign, 'any' takes either."""
    d = np.asarray(direction, float) / np.linalg.norm(direction)
    t = np.arange(lo, hi + step / 2, step)
    pts = np.asarray(origin, float)[:, None] + d[:, None] * t
    grad = np.gradient(ndimage.map_coordinates(g, [pts[1], pts[0]], order=1), step)
    score = {'rising': grad, 'falling': -grad, 'any': np.abs(grad)}[polarity]
    i = int(np.argmax(score))
    offset = 0.0
    if 0 < i < len(t) - 1:
        a, b, c = score[i - 1], score[i], score[i + 1]
        if a - 2 * b + c:
            offset = 0.5 * (a - c) / (a - 2 * b + c)
    return np.asarray(origin, float) + d * (t[i] + offset * step), float(score[i])


def kasa(pts):
    A = np.c_[pts, np.ones(len(pts))]
    a, b, c = np.linalg.lstsq(A, -(pts ** 2).sum(axis=1), rcond=None)[0]
    centre = np.array([-a / 2, -b / 2])
    return centre, float(np.sqrt(centre @ centre - c))


def circle(g, f):
    lo, hi = f['radiusBandPx']
    seed = np.asarray(f['seedPx'], float)
    pts = np.array([edge(g, seed, (np.cos(a), np.sin(a)), lo, hi, f.get('polarity', 'any'))[0]
                    for a in np.linspace(0, 2 * np.pi, f.get('scans', 120), endpoint=False)])
    keep = np.ones(len(pts), bool)
    for _ in range(4):
        centre, r = kasa(pts[keep])
        res = np.hypot(*(pts - centre).T) - r
        mad = 1.4826 * np.median(np.abs(res[keep] - np.median(res[keep])))
        keep = np.abs(res) <= max(3 * mad, 0.75)
    centre, r = kasa(pts[keep])
    res = np.hypot(*(pts[keep] - centre).T) - r
    # Axis-aligned ellipse on the kept points, centred on the circle: how much the image squeezes one axis against the other.
    q = pts[keep] - centre
    A, C, D, E = np.linalg.lstsq(np.c_[q[:, 0] ** 2, q[:, 1] ** 2, q[:, 0], q[:, 1]], np.ones(len(q)), rcond=None)[0]
    F = 1 + D ** 2 / (4 * A) + E ** 2 / (4 * C)
    return {'kind': 'circle', 'centrePx': centre.tolist(), 'radiusPx': r, 'rmsPx': float(np.sqrt((res ** 2).mean())), 'used': int(keep.sum()),
            'scans': len(pts), 'semiAxesPx': [float(np.sqrt(F / A)), float(np.sqrt(F / C))]}


def line(g, f):
    a, b = (np.asarray(p, float) for p in (f['fromPx'], f['toPx']))
    along = (b - a) / np.linalg.norm(b - a)
    normal = np.array([-along[1], along[0]])
    lo, hi = f['bandPx']
    pts = np.array([edge(g, a + (b - a) * s, normal, lo, hi, f.get('polarity', 'any'))[0] for s in np.linspace(0, 1, f.get('stations', 40))])
    keep = np.ones(len(pts), bool)
    for _ in range(4):
        c = pts[keep].mean(axis=0)
        direction = np.linalg.svd(pts[keep] - c)[2][0]
        n = np.array([-direction[1], direction[0]])
        res = (pts - c) @ n
        mad = 1.4826 * np.median(np.abs(res[keep] - np.median(res[keep])))
        keep = np.abs(res) <= max(3 * mad, 0.75)
    c = pts[keep].mean(axis=0)
    direction = np.linalg.svd(pts[keep] - c)[2][0]
    res = (pts[keep] - c) @ np.array([-direction[1], direction[0]])
    return {'kind': 'line', 'pointPx': c.tolist(), 'directionPx': direction.tolist(), 'rmsPx': float(np.sqrt((res ** 2).mean())), 'used': int(keep.sum()),
            'stations': len(pts)}


def measure_image(path, spec):
    g = grey(path, spec.get('sigmaPx', 1.5))
    found = {f['name']: (circle if f['kind'] == 'circle' else line)(g, f) for f in spec['features']}
    try:
        scale, distortion, _ = card_scale(np.asarray(Image.open(path).convert('RGB')))
        card = {'pxPerMm': scale, 'distortion': distortion, 'use': 'cross-check only; the card is not in the measured plane'}
    except (ValueError, IndexError) as error:
        card = {'pxPerMm': None, 'note': str(error)}
    return found, card


def up_distance(feature, origin, up, across):
    """Signed distance along `up` from the hole line; a line is evaluated where it crosses the up axis through its own centroid's across position."""
    if feature['kind'] == 'circle':
        return float((np.asarray(feature['centrePx']) - origin) @ up)
    p, d = np.asarray(feature['pointPx']), np.asarray(feature['directionPx'])
    s = (p - origin) @ across
    foot = origin + across * s
    # Solve p + d*k on the up axis through foot.
    k = ((foot - p) @ across) / (d @ across)
    return float((p + d * k - origin) @ up)


def wall_frame(found, reference_mm):
    left, right = (np.asarray(found[n]['centrePx']) for n in ('endHoleLeft', 'endHoleRight'))
    across = (right - left) / np.linalg.norm(right - left)
    up = np.array([across[1], -across[0]])  # image y grows downward; up points toward smaller y
    origin = (left + right) / 2
    return origin, across, up, float(np.linalg.norm(right - left) / reference_mm)


def derive_wall(found, reference_mm, aspect_correction):
    """Front-wall quantities in mm from the end-hole line; distances along the wall height are divided by the vertical squeeze of the openings."""
    origin, across, up, px_per_mm = wall_frame(found, reference_mm)
    v = lambda name: up_distance(found[name], origin, up, across) / px_per_mm / aspect_correction
    h = lambda name: float((np.asarray(found[name]['centrePx']) - origin) @ across / px_per_mm)
    out = {'pxPerMm': px_per_mm, 'aspectCorrection': aspect_correction}
    for name in found:
        if name.startswith('endHole'):
            continue
        out[name] = {'upMm': v(name)}
        if found[name]['kind'] == 'circle':
            out[name].update({'acrossMm': h(name), 'diameterAcrossMm': 2 * found[name]['semiAxesPx'][0] / px_per_mm,
                              'diameterUpMm': 2 * found[name]['semiAxesPx'][1] / px_per_mm / aspect_correction})
    for side in ('Left', 'Right'):
        if 'wallEdge' + side in found:
            p = np.asarray(found['wallEdge' + side]['pointPx'])
            out['wallEdge' + side]['acrossMm'] = float((p - origin) @ across / px_per_mm)
    for name in ('endHoleLeft', 'endHoleRight'):
        out[name + 'DiameterMm'] = 2 * found[name]['radiusPx'] / px_per_mm
    return out


def line_distance(feature, point):
    p, d = np.asarray(feature['pointPx']), np.asarray(feature['directionPx'])
    return float(abs((np.asarray(point) - p) @ np.array([-d[1], d[0]])))


def derive_deck(found, tongue_width_mm):
    """Pan-hole centre to the deck front edge, scaled by the traced tongue width measured in the same plane.

    The deck is not coplanar with the card in a top-down view of the chassis resting on its walls, so this is a consistency check of the
    traced deck, not an independent length."""
    hub = np.asarray(found['panHole']['centrePx'])
    px_per_mm = line_distance(found['tongueEdgeA'], found['tongueEdgeB']['pointPx']) / tongue_width_mm
    return {'pxPerMm': px_per_mm, 'hubToDeckFrontEdgeMm': line_distance(found['deckFrontEdge'], hub) / px_per_mm,
            'hubToBendOuterEdgeMm': line_distance(found['bendOuterEdge'], hub) / px_per_mm, 'panHoleDiameterMm': 2 * found['panHole']['radiusPx'] / px_per_mm}


def measure(trace, images):
    results = []
    for spec in trace['images']:
        found, card = measure_image(images / spec['file'], spec)
        entry = {'file': spec['file'], 'role': spec['role'], 'features': found, 'card': card}
        if spec['role'] == 'front-wall-square-on':
            openings = [found[n]['semiAxesPx'] for n in ('openingLeft', 'openingRight') if n in found]
            aspect = float(np.mean([b / a for a, b in openings])) if openings else 1.0
            entry['derived'] = derive_wall(found, trace['reference']['valueMm'], aspect)
        elif spec['role'] == 'deck-top-down-consistency':
            entry['derived'] = derive_deck(found, spec['tongueWidthMm'])
        results.append(entry)
    return {'id': trace['id'], 'reference': trace['reference'], 'results': results}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--trace', required=True, type=Path, help='tracked trace specification (seeds, bands, reference)')
    parser.add_argument('--images', required=True, type=Path, help='private image folder named in the trace')
    parser.add_argument('--output', required=True, type=Path)
    args = parser.parse_args()
    args.output.write_bytes(rfc8785.dumps(measure(json.loads(args.trace.read_text()), args.images)) + b'\n')


if __name__ == '__main__':
    main()
