"""Reproducible, explicitly limited card-plane calibration, not metrology."""
import argparse
import json
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage, optimize

from .image_analysis import manifest


def undistort(points, coefficient, size):
    points = np.asarray(points, dtype=np.float64)
    center = np.array(size, dtype=np.float64) / 2
    q = (points - center) / max(size)
    return center + (points-center)/(1+coefficient*(q*q).sum(axis=1)[:, None])


def line(points):
    center = points.mean(axis=0)
    _, _, vh = np.linalg.svd(points-center, full_matrices=False)
    normal = vh[-1]
    return np.r_[normal, -normal @ center]


def homography(source, destination):
    matrix, values = [], []
    for (x, y), (u, v) in zip(source, destination, strict=True):
        matrix.extend([[x, y, 1, 0, 0, 0, -u*x, -u*y],
                       [0, 0, 0, x, y, 1, -v*x, -v*y]])
        values.extend([u, v])
    answer = np.linalg.solve(matrix, values)
    return np.r_[answer, 1].reshape(3, 3)


def project(points, transform):
    points = np.asarray(points, dtype=np.float64)
    q = np.c_[points, np.ones(len(points))] @ transform.T
    if np.any(np.abs(q[:, 2]) < 1e-10):
        raise ValueError('PROJECTIVE_SINGULARITY')
    return q[:, :2]/q[:, 2, None]


def edges(image, roi):
    x0, y0, x1, y1 = roi
    rgb = np.asarray(image, dtype=np.float64)[y0:y1, x0:x1]
    mask = (rgb[:, :, 2] > rgb[:, :, 0]+20) & (rgb[:, :, 2] > rgb[:, :, 1]+5)
    labels, number = ndimage.label(mask)
    if not number:
        raise ValueError('NO_CARD_BOUNDARY')
    counts = np.bincount(labels.ravel()); counts[0] = 0
    mask = ndimage.binary_fill_holes(labels == counts.argmax())
    yy, xx = np.nonzero(mask)
    left, right, top, bottom = xx.min(), xx.max(), yy.min(), yy.max()
    horizontal = range(int(left+.15*(right-left)), int(left+.85*(right-left)), 4)
    vertical = range(int(top+.15*(bottom-top)), int(top+.85*(bottom-top)), 4)
    groups = [[], [], [], []]
    for x in horizontal:
        y = np.flatnonzero(mask[:, x])
        if len(y):
            groups[0].append([x+x0, y.min()+y0]); groups[2].append([x+x0, y.max()+y0])
    for y in vertical:
        x = np.flatnonzero(mask[y])
        if len(x):
            groups[1].append([x.max()+x0, y+y0]); groups[3].append([x.min()+x0, y+y0])
    return [np.asarray(g, dtype=np.float64) for g in groups]


def calibrate(image, view, reference):
    size = view['annotationSize']
    groups = edges(image, view['cardRoi'])
    training = [g[::2] for g in groups]
    withheld = [g[1::2] for g in groups]

    def residual(k, samples):
        all_residuals = []
        for g in samples:
            u = undistort(g, float(k), size)
            all_residuals.extend(np.c_[u, np.ones(len(u))] @ line(u))
        return np.array(all_residuals)

    fit = optimize.minimize_scalar(lambda k: np.mean(residual(k, training)**2),
                                  bounds=(-.5, .5), method='bounded',
                                  options={'xatol': 1e-12})
    coefficient = float(fit.x)
    fitted_lines = [line(undistort(g, coefficient, size)) for g in training]
    corners = []
    for first, second in [(3, 0), (0, 1), (1, 2), (2, 3)]:
        cross = np.cross(fitted_lines[first], fitted_lines[second])
        corners.append(cross[:2]/cross[2])
    transform = homography(corners, [[0, 0], [reference['widthMm'], 0],
                                    [reference['widthMm'], reference['heightMm']],
                                    [0, reference['heightMm']]])
    distances = np.concatenate([np.c_[undistort(g, coefficient, size), np.ones(len(g))] @ l
                                for g, l in zip(withheld, fitted_lines, strict=True)])
    rms = float(np.sqrt(np.mean(distances**2)))
    # A one-pixel profile band is only an image-model sensitivity interval.
    grid = np.linspace(-.5, .5, 1001)
    accepted = [k for k in grid if np.sqrt(np.mean(residual(k, training)**2)) <= rms+1]
    interval = [float(min(accepted)), float(max(accepted))]
    bounds = view['pennyBounds']; x0, y0, x1, y1 = bounds
    # Segment the actual copper disk within the reviewer-selected bounding ROI.
    roi = np.asarray(image, dtype=np.float64)[y0:y1, x0:x1]
    copper = (roi[:, :, 0] > roi[:, :, 2]*1.20) & (roi[:, :, 0] > roi[:, :, 1]*1.04)
    labels, number = ndimage.label(copper)
    if not number: raise ValueError('NO_PENNY_BOUNDARY')
    counts = np.bincount(labels.ravel()); counts[0] = 0
    disk = ndimage.binary_fill_holes(ndimage.binary_closing(labels == counts.argmax(), iterations=2))
    cy, cx = np.nonzero(disk)
    x0, x1 = x0+cx.min(), x0+cx.max()
    y0, y1 = y0+cy.min(), y0+cy.max()
    coin = np.array([[(x0+x1)/2, y0], [x1, (y0+y1)/2],
                     [(x0+x1)/2, y1], [x0, (y0+y1)/2]])
    metric = project(undistort(coin, coefficient, size), transform)
    diameters = [float(np.linalg.norm(metric[0]-metric[2])), float(np.linalg.norm(metric[1]-metric[3]))]
    delta = float(max(abs(d-reference['pennyDiameterMm']) for d in diameters))
    coin_bounds = [int(x0),int(y0),int(x1),int(y1)]
    features = {}
    for name in ['holes', 'outline', 'outlineBounds', 'notch', 'square', 'lowerCutout', 'slots']:
        if name not in view:
            continue
        if name == 'holes':
            features[name] = []
            for x, y, r in view[name]:
                p = project(undistort([[x, y], [x-r, y], [x+r, y], [x, y-r], [x, y+r]], coefficient, size), transform)
                features[name].append({'centerMm': p[0].tolist(), 'diameterMm': float((np.linalg.norm(p[1]-p[2])+np.linalg.norm(p[3]-p[4]))/2)})
        elif name == 'outlineBounds':
            x0, y0, x1, y1 = view[name]
            features[name] = project(undistort([[x0,y0],[x1,y0],[x1,y1],[x0,y1]],coefficient,size),transform).tolist()
        elif name == 'slots':
            features[name] = []
            for a, b, width in view[name]:
                p = project(undistort([a,b,[a[0],a[1]-width/2],[a[0],a[1]+width/2]],coefficient,size),transform)
                features[name].append({'endCentersMm':p[:2].tolist(),'widthMm':float(np.linalg.norm(p[2]-p[3]))})
        else:
            features[name] = project(undistort(view[name], coefficient, size), transform).tolist()
    return {'plate': view['plate'], 'index': view['index'], 'usage': view['usage'],
            'lens': {'method':'center-fixed division-model plumb-line fit', 'coefficient':coefficient,
                     'imageCenter':(np.array(size)/2).tolist(),'normalizerPx':max(size),
                     'onePixelSensitivityInterval':interval,'independentIntrinsicCalibration':False},
            'perspective':{'method':'four fitted card tangent-line intersections to compatible ID-1 rectangle',
                           'homographyUndistortedAnnotationPxToCardMm':transform.tolist(),
                           'correctedCardCornersPx':np.asarray(corners).tolist()},
            'withheldStraightEdgeRmsPx':rms, 'withheldStraightEdgeMaxPx':float(np.max(np.abs(distances))),
            'pennyDetectedBoundsPx':coin_bounds, 'pennyWithheldDiametersMm':diameters, 'pennyMaxDeviationMm':delta,
            'cardEdgeSamples':sum(len(g) for g in groups),
            'calibrationStatus':'REVIEW_REQUIRED',
            'engineeringStatus':'UNRESOLVED',
            'uncertainty':{'state':'unresolved','reason':'Edge-fit sensitivity is quantified; lens/card warpage, reference/plate plane offsets and feature-pick bounds need joint closure before admission'},
            'metricCandidateFeatures':features}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--package', type=Path, required=True)
    parser.add_argument('--parameters', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    parser.add_argument('--private-output', type=Path, required=True)
    args = parser.parse_args()
    private = args.package.resolve().parents[2]/'digital-twin/evidence/private/m6'
    if not args.private_output.resolve().is_relative_to(private.resolve()):
        raise ValueError('PRIVATE_OUTPUT_REQUIRED')
    rows = manifest(args.package)
    inputs = json.loads(args.parameters.read_text())
    args.private_output.mkdir(parents=True, exist_ok=True)
    results = []
    for view in inputs['views']:
        row = next(r for r in rows if r['plate']==view['plate'] and r['new_filename'].startswith(f"plate-{view['plate']}_{view['index']:02d}_"))
        with Image.open(args.package/row['relative_path']) as source:
            original_size = source.size
            image = source.convert('RGB').resize(tuple(view['annotationSize']))
        result = calibrate(image, view, inputs['reference'])
        result.update({'sourceImage':row['relative_path'], 'sourceRawSha256':row['sha256'],
                       'sourceSize':list(original_size), 'annotationSize':view['annotationSize'],
                       'rawToAnnotationScale':[view['annotationSize'][i]/original_size[i] for i in range(2)],
                       'reference':inputs['reference'],'limitations':inputs['limitations']})
        draw = ImageDraw.Draw(image)
        draw.rectangle(result['pennyDetectedBoundsPx'],outline='lime',width=3)
        for i, (x,y,r) in enumerate(view['holes']):
            draw.ellipse((x-r,y-r,x+r,y+r),outline='red',width=2)
            draw.text((x+5,y+5),str(i),fill='red')
        if 'outline' in view: draw.line(view['outline']+[view['outline'][0]],fill='red',width=2)
        for name in ['notch','square','lowerCutout']:
            if name in view: draw.line(view[name]+[view[name][0]],fill='red',width=2)
        image.save(args.private_output/f"{view['plate']}-{view['index']}-annotation.png")
        results.append(result)
    args.output.write_text(json.dumps({'track':'instructional-only','status':'REVIEW_REQUIRED','views':results},indent=2,allow_nan=False)+'\n')
    print(json.dumps([{'plate':r['plate'],'view':r['index'],'lens':r['lens']['coefficient'],
                       'edgeRmsPx':r['withheldStraightEdgeRmsPx'],'coinMm':r['pennyWithheldDiametersMm'],
                       'sensitivity':r['lens']['onePixelSensitivityInterval']} for r in results],indent=2))


if __name__ == '__main__':
    main()
