"""S04 Robot HAT mount: HAT and its four screws placed from the already placed supports.

Presentation only: no fit, thread engagement or sweep is claimed, and the HAT socket depth is never a seating
height. Independent re-measurement lives in hat_verify.py.
"""
import argparse
from pathlib import Path
import cadquery as cq
import numpy as np
import rfc8785
from ...contracts import load
from .verify import require, digest, rigid, placed, shape_features, purchased_artifact

PRESENTATION = 'digital-twin/assemblies/v40/presentation/instructional'
MODULE = 'digital-twin/cad/twin_cad/assemblies/instructional/hat.py'
ORACLE = 'digital-twin/cad/twin_cad/assemblies/instructional/hat_verify.py'
HAT_FILE = 'PX-V40-DEF-ROBOT-HAT-INSTRUCTIONAL-02.brep'
M5_ARTIFACTS = 'digital-twin/validation/expected/m5/instructional-artifacts/'
SCREW_ROTATION = np.diag([1., -1., -1.])
CLAIMS = {'staticPlacement': 'INSTRUCTIONAL_PASS', 'installationSweep': 'NOT_CLAIMED', 'physicalFit': 'NOT_CLAIMED'}
TOUCH_MM = 1e-6


def clean(values):
    return [float(v) + 0.0 for v in values]


def pose_of(ident, rotation, translation, feature, role):
    return {'instanceId': ident, 'translationMm': clean(translation), 'rotation': [clean(r) for r in rotation], 'featureRef': feature, 'role': role}


def staged(pose, axis, distance, anchor, segments):
    t = np.array(pose['translationMm']) - np.array(axis, dtype=np.float64) * distance
    return {'instanceId': pose['instanceId'], 'anchor': anchor, 'approachAxis': clean(axis), 'approachDistanceMm': float(distance),
            'stagedStart': {**pose, 'translationMm': clean(t)}, 'segments': segments, 'stagingOnly': True,
            'installationSweep': 'NOT_CLAIMED', 'reversal': 'Digital staging reversal only; no physical undo claim'}


def build(root, variant, previous, engagement):
    scope = load(root / PRESENTATION / 'product-scope.json')
    require(variant in scope['activeProductVariants'], 'PRESERVED_NON_TARGET_OR_UNSUPPORTED_VARIANT')
    require(previous['variantId'] == variant and previous['printedNumber'] == 3, 'PREVIOUS_IS_S03_OF_SAME_VARIANT')
    review_path = PRESENTATION + '/step04-hat-review-04.json'
    review = load(root / review_path)
    graph_path = f'digital-twin/validation/m2/{variant}/compiled-graph.json'
    graph = load(root / graph_path)
    step = graph['steps'][3]
    definition_of = {i['id']: i['definitionId'] for i in graph['instances']}
    hat_id = review['hatInstanceId']
    connections = [c for c in graph['mechanicalConnections'] if c['activationOperationId'] in step['operationIds']]
    stacks = [{'connectionId': c['id'], 'fastenerInstanceId': c['orderedContactStack'][0]['instanceId'], 'hatInstanceId': c['orderedContactStack'][1]['instanceId'],
               'standoffInstanceId': c['orderedContactStack'][2]['instanceId']} for c in connections if len(c['orderedContactStack']) == 3]
    require(len(stacks) == 4 and all(s['hatInstanceId'] == hat_id for s in stacks), 'FOUR_HAT_SCREW_STACKS')
    mate = next(c for c in connections if not c['orderedContactStack'])
    board_id = next(e['instanceId'] for e in mate['endpoints'] if e['instanceId'] != hat_id)
    poses = {p['instanceId']: p for p in previous['placements']}
    r_board, _ = rigid(poses[board_id])
    hat_shape = cq.Shape.importBrep(str(engagement / HAT_FILE))
    pcb = min(hat_shape.Solids(), key=lambda s: abs(s.BoundingBox().zlen - 1.6) + (0 if s.BoundingBox().xlen > 60 else 100))
    thickness = pcb.BoundingBox().zmax
    holes = sorted((float(c['origin'][0]), float(c['origin'][1])) for c in shape_features(pcb) if abs(c['axis'][2]) > .999999 and abs(c['radius'] - 1.4) < 1e-6)
    require(len(holes) == 4, 'FOUR_HAT_BORES')
    axes, tops = {}, {}
    for s in stacks:
        standoff = s['standoffInstanceId']
        r, t = rigid(poses[standoff])
        shape = placed(cq.Shape.importBrep(str(purchased_artifact(root, definition_of[standoff]))), r, t)
        body = max(shape_features(shape), key=lambda c: c['radius'])
        axes[standoff] = np.array([body['origin'][0], body['origin'][1]])
        tops[standoff] = float(shape.BoundingBox().zmax)
    # Orientation follows the board; planar position is the least-squares fit of the four bores to the four support axes.
    rotated = [r_board[:2, :2] @ np.array(h) for h in holes]
    guess = np.mean(list(axes.values()), axis=0) - np.mean(rotated, axis=0)
    support_ids = list(axes)
    assignment = {}
    for h, point in zip(holes, rotated):
        nearest = min(support_ids, key=lambda sid: np.linalg.norm(axes[sid] - (point + guess)))
        assignment[nearest] = h
    require(sorted(assignment) == sorted(support_ids), 'BORE_TO_SUPPORT_BIJECTION')
    shift = np.mean([axes[sid] - r_board[:2, :2] @ np.array(assignment[sid]) for sid in support_ids], axis=0)
    hat_z = max(tops.values())
    hat_pose = pose_of(hat_id, r_board, [shift[0], shift[1], hat_z], 'actualHAT.mountBoresOnSupportTops', 'robotHat')
    placements = [hat_pose]
    recipes = [staged(hat_pose, [0, 0, -1], review['approach']['distanceMm'], {'instanceId': board_id, 'localFeature': 'actualStandoff.topBearing'},
                      ['align mount pattern and socket over the header', 'seat on the support tops'])]
    for s in sorted(stacks, key=lambda x: x['fastenerInstanceId']):
        axis = axes[s['standoffInstanceId']]
        pose = pose_of(s['fastenerInstanceId'], SCREW_ROTATION, [axis[0], axis[1], hat_z + thickness], 'actualHAT.mountBore.top', 'screw')
        placements.append(pose)
        recipes.append(staged(pose, [0, 0, -1], review['approach']['distanceMm'], {'instanceId': hat_id, 'localFeature': 'actualHAT.mountBore.top'},
                              ['align axis with the standoff', 'seat head on the HAT top']))
    placed_hat = placed(hat_shape, r_board, np.array([shift[0], shift[1], hat_z]))
    gaps = []
    for s in stacks:
        standoff = s['standoffInstanceId']
        r, t = rigid(poses[standoff])
        shape = placed(cq.Shape.importBrep(str(purchased_artifact(root, definition_of[standoff]))), r, t)
        gap = float(placed_hat.distance(shape))
        if gap > TOUCH_MM:
            gaps.append({'standoffInstanceId': standoff, 'gapMm': gap})
    inputs = [digest(root, review_path), digest(root, graph_path), digest(root, MODULE), digest(root, ORACLE), digest(root, PRESENTATION + '/adopted-artifacts.json'),
              digest(engagement, HAT_FILE)]
    return {'id': f'PX-M7-S04-HAT-{variant}-04', 'revision': 4, 'track': 'instructional-only', 'variantId': variant, 'stepId': step['id'], 'printedNumber': 4,
            'graphHash': graph['graphHash'], 'modelHash': graph['modelHash'], 'placements': placements, 'stacks': stacks,
            'hatHeight': {'supportTopsMm': {k: tops[k] for k in sorted(tops)}, 'hatBottomMm': hat_z, 'gaps': sorted(gaps, key=lambda g: g['standoffInstanceId'])},
            'gapBudgetMm': review['gapBudgetMm'], 'recipes': recipes, 'scale': [1, 1, 1], 'limitations': review['limitations'], 'claims': dict(CLAIMS),
            'engineeringBlockerIds': step['blockerIds'], 'inputBindings': inputs, 'engineeringAdmission': False, 'runtimeAdmission': False}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    for name in ['root', 'closures', 'engagement', 'output']:
        parser.add_argument('--' + name, required=True, type=Path)
    args = parser.parse_args()
    args.output.mkdir(parents=True, exist_ok=False)
    scope = load(args.root / PRESENTATION / 'product-scope.json')
    for variant in scope['activeProductVariants']:
        record = build(args.root, variant, load(args.closures / f'{variant}-S03-closure.json'), args.engagement)
        (args.output / f'{variant}-S04-record.json').write_bytes(rfc8785.dumps(record) + b'\n')


if __name__ == '__main__':
    main()
