"""Independent S05 motor re-measurement; never imports the S05 generator."""
import argparse
from pathlib import Path
import cadquery as cq
import numpy as np
import rfc8785
from ...contracts import load
from .verify import require, digest, rigid, placed, plate_a_artifact, purchased_artifact
from .frames import cylinder_faces, line_distance, planar_faces, unit

PRESENTATION = 'digital-twin/assemblies/v40/presentation/instructional'
FIELDS = {'id', 'revision', 'track', 'variantId', 'stepId', 'printedNumber', 'graphHash', 'modelHash', 'placements', 'stacks', 'sides', 'recipes', 'scale',
          'limitations', 'claims', 'engineeringBlockerIds', 'inputBindings', 'engineeringAdmission', 'runtimeAdmission'}
RECIPE_FIELDS = {'instanceId', 'anchor', 'approachAxis', 'approachDistanceMm', 'stagedStart', 'segments', 'stagingOnly', 'installationSweep', 'reversal'}
CLAIMS = {'staticPlacement': 'INSTRUCTIONAL_PASS', 'installationSweep': 'NOT_CLAIMED', 'physicalFit': 'NOT_CLAIMED'}
M5_ARTIFACTS = 'digital-twin/validation/expected/m5/instructional-artifacts/'
PLATE_ID = 'PX-V40-INS-PLATE-A-001'
LINEAR_MM = 1e-6
SIDE_SIGN = {'left': 1.0, 'right': -1.0}


def bbox(shape):
    b = shape.BoundingBox()
    return np.array([b.xmin, b.ymin, b.zmin, b.xmax, b.ymax, b.zmax])


def load_shape(root, definition):
    return cq.Shape.importBrep(str(purchased_artifact(root, definition)))


def verify(root, record, previous, context=None):
    require(set(record) == FIELDS, 'CLOSED_STEP05_RECORD')
    require(record['engineeringAdmission'] is False and record['runtimeAdmission'] is False, 'ENGINEERING_FIREWALL')
    require(record['claims'] == CLAIMS and all(r['stagingOnly'] is True and r['installationSweep'] == 'NOT_CLAIMED' for r in record['recipes']), 'UNTESTED_CLAIM')
    scope = load(root / PRESENTATION / 'product-scope.json')
    variant = record['variantId']
    require(variant in scope['activeProductVariants'], 'PRESERVED_NON_TARGET_OR_UNSUPPORTED_VARIANT')
    require(record['id'] == f'PX-M7-S05-MOTORS-{variant}-04' and record['revision'] == 4 and record['scale'] == [1, 1, 1] and record['track'] == 'instructional-only', 'STEP05_IDENTITY')
    review = load(root / (PRESENTATION + '/step05-review-04.json'))
    require(record['limitations'] == review['limitations'] and all(t in record['limitations'] for t in review['limitations']), 'LIMITATION_REMOVAL')
    for binding in record['inputBindings']:
        require(binding == digest(root, binding['path']), 'INPUT_BYTES_CHANGED')
    graph = load(root / f'digital-twin/validation/m2/{variant}/compiled-graph.json')
    step = graph['steps'][4]
    require(record['graphHash'] == graph['graphHash'] and record['modelHash'] == graph['modelHash'] and record['stepId'] == step['id'], 'GRAPH_MODEL_BINDING')
    definition_of = {i['id']: i['definitionId'] for i in graph['instances']}
    keys = ['fastenerInstanceId', 'plateInstanceId', 'motorInstanceId', 'washerInstanceId', 'nutInstanceId']
    expected = [dict(zip(['connectionId'] + keys, [c['id']] + [m['instanceId'] for m in c['orderedContactStack']]))
                for c in graph['mechanicalConnections'] if c['activationOperationId'] in step['operationIds'] and len(c['orderedContactStack']) == 5
                and c['fastenerInstanceIds'] == [c['orderedContactStack'][0]['instanceId']]]
    ids = sorted(p['instanceId'] for p in record['placements'])
    owned = sorted({s[k] for s in expected for k in keys if k != 'plateInstanceId'})
    require(record['stacks'] == expected and ids == owned and len(set(ids)) == len(ids), 'EXACT_SEMANTIC_OWNERSHIP')
    require(record['sides'] == {m: ('left' if 'MOTOR-LEFT' in m else 'right') for m in {s['motorInstanceId'] for s in expected}}, 'MOTOR_SIDE')
    poses = {p['instanceId']: p for p in record['placements']}
    transforms = {i: rigid(p) for i, p in poses.items()}
    context_poses = {p['instanceId']: p for p in previous['placements']}
    r_plate, t_plate = rigid(context_poses[PLATE_ID])
    plate = placed(load_shape(root, definition_of[PLATE_ID]), r_plate, t_plate)
    # Flange planes and holes are re-read from the placed Plate A, not from this record.
    faces = [f for f in planar_faces(plate, 1300) if abs(abs(f['normal'][1]) - 1) < 1e-6 and f['bounds'][3] - f['bounds'][0] > 60]
    cylinders = [c for c in cylinder_faces(plate) if abs(abs(c['axis'][1]) - 1) < 1e-6]
    flange = {}
    for side, sign in SIDE_SIGN.items():
        ys = sorted({round(float(f['bounds'][1]), 6) for f in faces if sign * f['bounds'][1] > 0}, key=abs)
        require(len(ys) == 2, 'TWO_FLANGE_FACES_PER_SIDE')
        lo, hi = min(ys), max(ys)
        holes = [c for c in cylinders if lo - 1e-6 <= c['bounds'][1] and c['bounds'][4] <= hi + 1e-6]
        flange[side] = {'inner': ys[0], 'outer': ys[1], 'shaft': next(c for c in holes if abs(c['radius'] - 6) < 1e-6),
                        'screws': sorted((c for c in holes if abs(c['radius'] - 1.5) < 1e-6), key=lambda c: -c['origin'][2])}
        require(len(flange[side]['screws']) == 2, 'FLANGE_SCREW_HOLES')
    observed = {'motors': [], 'stacks': []}
    body_of = {}
    for motor, side in record['sides'].items():
        f, sign = flange[side], SIDE_SIGN[side]
        r, t = transforms[motor]
        shape = placed(load_shape(root, definition_of[motor]), r, t)
        solids = shape.Solids()
        body = max(solids, key=lambda s: s.Volume())
        shaft_solid = next(s for s in solids if any(abs(c['radius'] - 2.4) < 1e-6 for c in cylinder_faces(s)))
        can = next(s for s in solids if any(abs(c['radius'] - 9) < 1e-6 for c in cylinder_faces(s)))
        bb, sb, cb = bbox(body), bbox(shaft_solid), bbox(can)
        require(sign * (bb[1] + bb[4]) / 2 > 0, 'MOTOR_SIDE')
        shaft_cylinder = next(c for c in cylinder_faces(shaft_solid) if abs(c['radius'] - 2.4) < 1e-6)
        distance = line_distance(shaft_cylinder['origin'], shaft_cylinder['axis'], f['shaft']['origin'], f['shaft']['axis'])
        require(distance < LINEAR_MM, f'SHAFT_NOT_COAXIAL_WITH_FLANGE_HOLE {distance}')
        require(sign * ((sb[1] + sb[4]) / 2 - (bb[1] + bb[4]) / 2) > 0, 'SHAFT_NOT_OUTWARD')
        face = bb[4] if sign > 0 else bb[1]
        require(abs(face - f['inner']) < LINEAR_MM, 'MOTOR_NOT_FLUSH_WITH_FLANGE')
        require((cb[0] + cb[3]) / 2 < (bb[0] + bb[3]) / 2, 'MOTOR_CAN_DIRECTION')
        body_of[motor] = bb
        observed['motors'].append({'instanceId': motor, 'side': side, 'shaftAxisResidualMm': distance, 'flushResidualMm': abs(face - f['inner'])})
    for stack in expected:
        motor = stack['motorInstanceId']
        side = record['sides'][motor]
        f, sign = flange[side], SIDE_SIGN[side]
        same = sorted(s['fastenerInstanceId'] for s in expected if s['motorInstanceId'] == motor)
        hole = f['screws'][same.index(stack['fastenerInstanceId'])]
        direction = np.array([0., -sign, 0.])
        parts = {}
        for key in ('fastenerInstanceId', 'washerInstanceId', 'nutInstanceId'):
            r, t = transforms[stack[key]]
            parts[key] = placed(load_shape(root, definition_of[stack[key]]), r, t)
        # Every member's own cylinder must be coaxial with the flange's small hole.
        for key, radius in (('fastenerInstanceId', 1.5), ('washerInstanceId', 1.55), ('nutInstanceId', 1.5)):
            cylinder = next(c for c in cylinder_faces(parts[key]) if abs(c['radius'] - radius) < 1e-6)
            gap = line_distance(cylinder['origin'], cylinder['axis'], hole['origin'], hole['axis'])
            require(gap < LINEAR_MM, f'SCREW_NOT_COAXIAL_WITH_HOLE {key} {gap}')
        # Intervals along the screw direction measured from the outer flange face.
        outer = float(np.array([0., f['outer'], 0.]) @ direction)

        def interval(b):
            corners = [np.array([x, y, z]) @ direction for x in (b[0], b[3]) for y in (b[1], b[4]) for z in (b[2], b[5])]
            return float(min(corners)) - outer, float(max(corners)) - outer
        head = next(c for c in cylinder_faces(parts['fastenerInstanceId']) if abs(c['radius'] - 2.775) < 1e-3)
        h_lo, h_hi = interval(head['bounds'])
        require(abs(h_hi) < LINEAR_MM and h_lo < -1, 'SCREW_HEAD_NOT_ON_OUTER_FACE')
        p_lo, p_hi = (float(np.array([0., f['outer'], 0.]) @ direction) - outer, float(np.array([0., f['inner'], 0.]) @ direction) - outer)
        m_lo, m_hi = interval(body_of[motor])
        w_lo, w_hi = interval(bbox(parts['washerInstanceId']))
        n_lo, n_hi = interval(bbox(parts['nutInstanceId']))
        chain = [(h_hi, p_lo), (p_hi, m_lo), (m_hi, w_lo), (w_hi, n_lo)]
        require(all(abs(a - b) < LINEAR_MM for a, b in chain) and p_hi > p_lo and m_hi > m_lo and w_hi > w_lo and n_hi > n_lo, 'STACK_ORDER_OR_CONTACT')
        tip = interval(bbox(parts['fastenerInstanceId']))[1]
        require(n_lo < tip <= n_hi + LINEAR_MM, 'SCREW_TIP_NOT_IN_NUT')
        observed['stacks'].append({'connectionId': stack['connectionId'], 'screwTipInNutMm': tip - n_lo, 'stackLengthMm': n_hi})
    # Staged approaches: motors from the chassis centre, screws from outside, washers and nuts from the centre side.
    by_instance = {r['instanceId']: r for r in record['recipes']}
    require(set(by_instance) == set(poses) and len(by_instance) == len(record['recipes']), 'RECIPE_OWNERSHIP')
    approach = review['approach']
    for ident, recipe in by_instance.items():
        require(set(recipe) == RECIPE_FIELDS, 'RECIPE_FIELDS')
        stack = next((s for s in expected if ident in (s['fastenerInstanceId'], s['washerInstanceId'], s['nutInstanceId'])), None)
        if stack is None:
            side = record['sides'][ident]
            axis, distance = unit([0., SIDE_SIGN[side], 1.]), approach['motorDistanceMm']
        else:
            side = record['sides'][stack['motorInstanceId']]
            d = np.array([0., -SIDE_SIGN[side], 0.])
            axis, distance = (d, approach['screwDistanceMm']) if ident == stack['fastenerInstanceId'] else (-d, approach['washerNutDistanceMm'])
        sr, st = rigid(recipe['stagedStart'])
        r, t = transforms[ident]
        require(np.max(np.abs(np.array(recipe['approachAxis']) - axis)) < 1e-9 and recipe['approachDistanceMm'] == distance and np.max(np.abs(sr - r)) < 1e-10
                and np.max(np.abs(st - (t - axis * distance))) < 1e-9 and recipe['stagedStart']['instanceId'] == ident, 'STAGED_START')
    return {'status': 'PASS', 'variantId': variant, 'motors': observed['motors'], 'stacks': observed['stacks'], 'physicalFit': 'NOT_CLAIMED',
            'installationSweep': 'NOT_CLAIMED', 'engineeringAdmission': False, 'runtimeAdmission': False}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    for name in ['root', 'closures', 'step', 'output']:
        parser.add_argument('--' + name, required=True, type=Path)
    args = parser.parse_args()
    results = [verify(args.root, load(args.step / f'{v}-S05-record.json'), load(args.closures / f'{v}-S04-closure.json')) for v in ['rpi5', 'rpi-zero-2-w']]
    args.output.write_bytes(rfc8785.dumps({'status': 'PASS', 'scope': 'S05 drive motors only', 'results': results, 'engineeringAdmission': False}) + b'\n')


if __name__ == '__main__':
    main()
