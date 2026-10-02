"""Reproducible reference-scaled silhouette measurements of private hardware photographs; instructional-grade, not metrology.

Scale comes from a photographed reference found by colour: either a payment card (ISO/IEC 7810 ID-1, 85.60 x 53.98 mm) or a US one-cent coin
(nominal 19.05 mm). The reference and the measured part are assumed near coplanar, so every value carries a relative-uncertainty floor that
is raised by the reference's own measured distortion. Output holds only derived numbers; no pixels are written.
"""
import argparse
import json
from pathlib import Path
import numpy as np
from PIL import Image
from scipy import ndimage

PENNY_MM = 19.05
CARD_MM = (85.60, 53.98)
UNCERTAINTY_FLOOR = 0.03  # coplanarity, lens and edge definition are not jointly bounded


def hsv_of(rgb):
    return np.asarray(Image.fromarray(rgb).convert('HSV'), dtype=np.float64)


def components(mask, minimum):
    labels, number = ndimage.label(mask)
    counts = np.bincount(labels.ravel()); counts[0] = 0
    return [labels == i for i in np.argsort(counts)[::-1][:number] if counts[i] >= minimum]


def principal(points):
    center = points.mean(axis=0)
    _, _, vh = np.linalg.svd(points - center, full_matrices=False)
    return center, vh


def extents(mask):
    yy, xx = np.nonzero(mask)
    pts = np.c_[xx, yy].astype(np.float64)
    c, vh = principal(pts)
    return c, vh, [float(np.ptp((pts - c) @ vh[i])) for i in (0, 1)]


def shape_of(mask):
    """Axis ratio and fill ratio against the bounding ellipse; a coin is near 1 and near 1."""
    _, _, e = extents(mask)
    return min(e) / max(e), mask.sum() / (np.pi / 4 * max(e) ** 2)


def penny_scale(rgb):
    hsv = hsv_of(rgb)
    # Measured on the supplied photos: the coin is at hue 12-16 and the wood at 26-33 (PIL HSV, 0-255).
    mask = ndimage.binary_opening((hsv[..., 0] < 20) & (hsv[..., 1] > 20) & (hsv[..., 1] < 130) & (hsv[..., 2] > 60), iterations=2)
    mask = ndimage.binary_fill_holes(ndimage.binary_closing(mask, iterations=15))
    found = components(mask, 5000)
    coins = [m for m in found if shape_of(m)[0] > 0.85 and 0.6 < shape_of(m)[1] < 1.1]
    if not coins:
        raise ValueError('NO_PENNY candidates=' + str([(int(m.sum()), [round(float(v), 2) for v in shape_of(m)]) for m in found[:6]]))
    _, _, e = extents(coins[0])
    return float(np.sqrt(4 * coins[0].sum() / np.pi) / PENNY_MM), abs(1 - e[1] / e[0])


def blue_mask(rgb):
    r, g, b = (rgb[..., i].astype(np.int32) for i in range(3))
    return ndimage.binary_opening((b > r + 25) & (b > g + 8), iterations=2)


def card_scale(rgb):
    card = components(blue_mask(rgb), 20000)[0]
    _, _, e = extents(ndimage.binary_fill_holes(card))
    long_side, short_side = max(e), min(e)
    scales = [long_side / CARD_MM[0], short_side / CARD_MM[1]]
    if abs(long_side / short_side - CARD_MM[0] / CARD_MM[1]) > 0.06 * CARD_MM[0] / CARD_MM[1]:
        raise ValueError(f'CARD_NOT_RECOGNISED aspect={long_side / short_side:.3f}')
    return float(np.mean(scales)), abs(scales[0] - scales[1]) / np.mean(scales), card


def target_mask(rgb, target, card=None, vmin=150):
    hsv = hsv_of(rgb)
    if target == 'white':
        return (hsv[..., 1] < 55) & (hsv[..., 2] > vmin)
    if target == 'blue':
        mask = blue_mask(rgb)
        return mask & ~ndimage.binary_dilation(card, iterations=2) if card is not None else mask
    if target == 'yellow':
        return (hsv[..., 0] > 28) & (hsv[..., 0] < 55) & (hsv[..., 1] > 110) & (hsv[..., 2] > 150)
    raise ValueError('UNKNOWN_TARGET')


def describe(blob, scale, stations=20):
    filled = ndimage.binary_fill_holes(blob)
    c, vh, e = extents(filled)
    yy, xx = np.nonzero(filled)
    pts = np.c_[xx, yy].astype(np.float64)
    along, across = (pts - c) @ vh[0], (pts - c) @ vh[1]
    labels, n = ndimage.label(filled & ~blob)
    holes = []
    for i in range(1, n + 1):
        h = labels == i
        if h.sum() < 12:
            continue
        hy, hx = np.nonzero(h)
        rel = np.array([hx.mean(), hy.mean()]) - c
        holes.append({'diameterMm': float(2 * np.sqrt(h.sum() / np.pi) / scale), 'alongMm': float(rel @ vh[0] / scale), 'acrossMm': float(rel @ vh[1] / scale)})
    edges = np.linspace(along.min(), along.max(), stations + 1)
    profile = []
    for lo, hi in zip(edges[:-1], edges[1:]):
        band = across[(along >= lo) & (along <= hi)]
        profile.append([float((lo + hi) / 2 / scale), float(band.min() / scale), float(band.max() / scale)] if len(band) else None)
    return {'centrePx': c.tolist(), 'lengthMm': float(np.ptp(along) / scale), 'widthMm': float(np.ptp(across) / scale),
            'alongRangeMm': [float(along.min() / scale), float(along.max() / scale)], 'acrossRangeMm': [float(across.min() / scale), float(across.max() / scale)],
            'profileAlongMinMaxAcrossMm': profile, 'areaMm2': float(filled.sum() / scale ** 2),
            'axisDeg': float(np.degrees(np.arctan2(vh[0][1], vh[0][0]))), 'holes': sorted(holes, key=lambda h: h['alongMm'])}


def measure(path, reference='penny', target='white', minimum=2000, vmin=150, stations=20):
    rgb = np.asarray(Image.open(path).convert('RGB'))
    card = None
    if reference == 'none':
        scale, distortion = 1.0, 0.0  # ratios only; lengths are then in pixels
    elif reference == 'penny':
        scale, distortion = penny_scale(rgb)
    else:
        scale, distortion, card = card_scale(rgb)
    mask = ndimage.binary_opening(target_mask(rgb, target, card, vmin), iterations=2)
    return {'file': Path(path).name, 'imagePx': [rgb.shape[1], rgb.shape[0]], 'reference': reference, 'pxPerMm': scale, 'referenceDistortion': distortion,
            'relativeUncertainty': max(UNCERTAINTY_FLOOR, distortion), 'parts': [describe(b, scale, stations) for b in components(mask, minimum)]}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('image', type=Path)
    parser.add_argument('--reference', choices=['penny', 'card', 'none'], default='penny')
    parser.add_argument('--target', choices=['white', 'blue', 'yellow'], default='white')
    parser.add_argument('--minimum', type=int, default=2000)
    parser.add_argument('--stations', type=int, default=20, help='silhouette profile samples along the principal axis')
    parser.add_argument('--vmin', type=int, default=150, help='brightness floor (0-255) of the white target mask')
    parser.add_argument('--probe', type=int, nargs=2, metavar=('X', 'Y'), help='print mean HSV (0-255) around a pixel instead of measuring')
    args = parser.parse_args()
    if args.probe:
        x, y = args.probe
        hsv = hsv_of(np.asarray(Image.open(args.image).convert('RGB')))[y - 4:y + 5, x - 4:x + 5]
        print(json.dumps({'hsv': hsv.reshape(-1, 3).mean(axis=0).round(1).tolist()}))
        return
    print(json.dumps(measure(args.image, args.reference, args.target, args.minimum, args.vmin, args.stations), indent=1))


if __name__ == '__main__':
    main()
