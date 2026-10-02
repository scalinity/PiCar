"""Calibrated measurement in a top-down photograph: card-plane mapping, edge search and circle/line fits.

Builds on the M6 card calibration (lens plumb-line fit plus card-corner homography). Measurements are
DERIVED presentation values with their residuals, never manufacturer dimensions. No pixels leave this module;
callers record numbers only.
"""
import numpy as np
from PIL import Image
from scipy import ndimage

from twin_cad.components.plates.instructional.calibration import calibrate, project, undistort

ID1_CARD = {'widthMm': 85.6, 'heightMm': 53.98, 'pennyDiameterMm': 19.05}


class CardPlane:
    """Maps undistorted image pixels to millimetres in the card plane and back."""

    def __init__(self, path, card_roi, penny_roi):
        with Image.open(path) as source:
            self.rgb = np.asarray(source.convert('RGB'), dtype=np.float64)
        self.size = [self.rgb.shape[1], self.rgb.shape[0]]
        view = {'annotationSize': self.size, 'cardRoi': card_roi, 'pennyBounds': penny_roi, 'plate': '-', 'index': 0, 'usage': 'fidelity'}
        self.calibration = calibrate(Image.fromarray(self.rgb.astype(np.uint8)), view, ID1_CARD)
        self.k = self.calibration['lens']['coefficient']
        self.h = np.array(self.calibration['perspective']['homographyUndistortedAnnotationPxToCardMm'])
        self.h_inv = np.linalg.inv(self.h)
        self.gray = ndimage.gaussian_filter(self.rgb.mean(axis=2), 1.0)

    def to_mm(self, px):
        return project(undistort(px, self.k, self.size), self.h)

    def to_px(self, mm):
        target = project(mm, self.h_inv)  # undistorted pixels
        centre = np.array(self.size, dtype=np.float64) / 2
        p = target.copy()
        for _ in range(20):  # invert the division model by fixed-point iteration
            q = (p - centre) / max(self.size)
            p = centre + (target - centre) * (1 + self.k * (q * q).sum(axis=1)[:, None])
        return p

    def sample(self, mm):
        px = self.to_px(np.asarray(mm, dtype=np.float64).reshape(-1, 2))
        return ndimage.map_coordinates(self.gray, [px[:, 1], px[:, 0]], order=1, mode='nearest')


def strongest_edges(plane, starts, directions, length, step=0.02, polarity=1):
    """Along each ray, the position of the steepest brightness change of the given sign (+1: dark to bright)."""
    t = np.arange(0, length, step)
    hits = []
    for s, d in zip(starts, directions):
        pts = s[None, :] + t[:, None] * d[None, :]
        profile = ndimage.gaussian_filter1d(plane.sample(pts), 3)
        grad = np.gradient(profile) * polarity
        i = int(np.argmax(grad))
        hits.append((pts[i], float(grad[i])))
    return hits


def fit_circle(points, reject=2.5, rounds=4):
    p = np.asarray(points, dtype=np.float64)
    keep = np.ones(len(p), dtype=bool)
    for _ in range(rounds):
        a = np.c_[2 * p[keep], np.ones(keep.sum())]
        b = (p[keep] ** 2).sum(axis=1)
        cx, cy, c = np.linalg.lstsq(a, b, rcond=None)[0]
        r = np.sqrt(c + cx * cx + cy * cy)
        res = np.hypot(p[:, 0] - cx, p[:, 1] - cy) - r
        sigma = max(np.std(res[keep]), 1e-6)
        keep = np.abs(res) < reject * sigma
    return np.array([cx, cy]), float(r), float(np.sqrt(np.mean(res[keep] ** 2))), int(keep.sum())


def fit_line(points, reject=2.5, rounds=4):
    p = np.asarray(points, dtype=np.float64)
    keep = np.ones(len(p), dtype=bool)
    for _ in range(rounds):
        c = p[keep].mean(axis=0)
        _, _, vh = np.linalg.svd(p[keep] - c)
        d, n = vh[0], vh[1]
        res = (p - c) @ n
        sigma = max(np.std(res[keep]), 1e-6)
        keep = np.abs(res) < reject * sigma
    return c, d, float(np.sqrt(np.mean(res[keep] ** 2))), int(keep.sum())


def measure_hole(plane, centre_mm, radius_mm, rays=90):
    """Hole edge = steepest bright-plate to dark-through-hole transition, searched outward from inside."""
    angles = np.linspace(0, 2 * np.pi, rays, endpoint=False)
    dirs = np.c_[np.cos(angles), np.sin(angles)]
    starts = np.asarray(centre_mm)[None, :] + dirs * radius_mm * 0.35
    hits = strongest_edges(plane, starts, dirs, radius_mm * 1.2, polarity=1)
    return fit_circle([h[0] for h in hits])


def measure_slot(plane, a_mm, b_mm, width_mm, stations=11):
    """Capsule slot: side edges from cross scans (dark slot to bright plate), ends from axial scans."""
    a, b = np.asarray(a_mm, dtype=np.float64), np.asarray(b_mm, dtype=np.float64)
    axis = (b - a) / np.linalg.norm(b - a)
    normal = np.array([-axis[1], axis[0]])
    left, right = [], []
    for s in np.linspace(0.15, 0.85, stations):
        p = a + (b - a) * s
        (hl, _), = strongest_edges(plane, [p], [normal], width_mm * 1.6, polarity=1)
        (hr, _), = strongest_edges(plane, [p], [-normal], width_mm * 1.6, polarity=1)
        left.append(hl); right.append(hr)
    cl, dl, rl, _ = fit_line(left)
    cr, dr, rr, _ = fit_line(right)
    centre_line = (cl + cr) / 2
    width = float(abs((cl - cr) @ normal))
    mid = (a + b) / 2
    (ea, _), = strongest_edges(plane, [mid], [-axis], np.linalg.norm(b - a) / 2 + width_mm * 1.5, polarity=1)
    (eb, _), = strongest_edges(plane, [mid], [axis], np.linalg.norm(b - a) / 2 + width_mm * 1.5, polarity=1)
    # End-cap centres sit half a width inside the axial extremes, projected onto the fitted centre line.
    ea_c = ea + axis * width / 2; eb_c = eb - axis * width / 2
    proj = lambda q: centre_line + ((q - centre_line) @ axis) * axis
    return {'endCentres': [proj(ea_c), proj(eb_c)], 'width': width, 'sideRms': max(rl, rr)}


class Similarity:
    """p_photo = s * R * M * p_model + t, with M an optional mirror of model y (photo y runs down)."""

    def __init__(self, s, theta, t, mirror):
        self.s, self.theta, self.t, self.mirror = s, theta, np.asarray(t), mirror

    @property
    def matrix(self):
        c, s = np.cos(self.theta), np.sin(self.theta)
        return self.s * np.array([[c, -s], [s, c]]) @ np.diag([1, -1 if self.mirror else 1])

    def forward(self, p):
        return np.asarray(p) @ self.matrix.T + self.t

    def inverse(self, q):
        return (np.asarray(q) - self.t) @ np.linalg.inv(self.matrix).T

    @staticmethod
    def fit(model, photo, mirror):
        m = np.asarray(model, dtype=np.float64) * np.array([1, -1 if mirror else 1])
        q = np.asarray(photo, dtype=np.float64)
        mc, qc = m.mean(axis=0), q.mean(axis=0)
        a, b = m - mc, q - qc
        u, sv, vt = np.linalg.svd(b.T @ a)
        sign = np.sign(np.linalg.det(u @ vt))
        r = u @ np.diag([1, sign]) @ vt
        s = (sv[0] + sign * sv[1]) / (a ** 2).sum()
        theta = np.arctan2(r[1, 0], r[0, 0])
        t = qc - s * (r @ mc)
        return Similarity(float(s), float(theta), t, mirror)
