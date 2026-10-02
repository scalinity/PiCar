"""S05 drive motors on the Plate A rear flanges with their screw, washer and nut stacks.

Presentation only: no fit, thread engagement, retention or sweep is claimed. Independent re-measurement
lives in step05_verify.py, which never imports this module.
"""
import argparse
from pathlib import Path
import cadquery as cq
import numpy as np
import rfc8785
from ...contracts import load
from .verify import require, digest, rigid, placed, plate_a_artifact, purchased_artifact
from .frames import CLAIMS, cylinder_faces, frame_from_axis, planar_faces, pose_of, staged

PRESENTATION = 'digital-twin/assemblies/v40/presentation/instructional'
MODULE = 'digital-twin/cad/twin_cad/assemblies/instructional/step05.py'
ORACLE = 'digital-twin/cad/twin_cad/assemblies/instructional/step05_verify.py'
M5_ARTIFACTS = 'digital-twin/validation/expected/m5/instructional-artifacts/'
PLATE_ID = 'PX-V40-INS-PLATE-A-001'
CAN_REARWARD = np.diag([-1., 1., -1.])  # motor local +x (can) -> installed -X; local +y stays +Y; proper (180 deg about Y)
SHAFT_HOLE_RADIUS, SCREW_HOLE_RADIUS = 6.0, 1.5


def shape_of(root, definition):
    return cq.Shape.importBrep(str(purchased_artifact(root, definition)))


def flange_geometry(plate_world):
    """Installed-frame flange planes and hole axes for the two large rear flanges, keyed by robot side."""
    large = [f for f in planar_faces(plate_world, 1300) if abs(abs(f['normal'][1]) - 1) < 1e-6 and f['bounds'][3] - f['bounds'][0] > 60]
    cylinders = [c for c in cylinder_faces(plate_world) if abs(abs(c['axis'][1]) - 1) < 1e-6]
    result = {}
    for side, sign in (('left', 1), ('right', -1)):
        ys = sorted({round(float(f['bounds'][1]), 6) for f in large if sign * f['bounds'][1] > 0}, key=abs)
        require(len(ys) == 2, 'TWO_FLANGE_FACES_PER_SIDE')
        inner, outer = ys
        inside = [c for c in cylinders if min(inner, outer) - 1e-6 <= c['bounds'][1] and c['bounds'][4] <= max(inner, outer) + 1e-6]
        shaft = [c for c in inside if abs(c['radius'] - SHAFT_HOLE_RADIUS) < 1e-6]
        screws = sorted((c for c in inside if abs(c['radius'] - SCREW_HOLE_RADIUS) < 1e-6), key=lambda c: -c['origin'][2])
        require(len(shaft) == 1 and len(screws) == 2, 'FLANGE_HOLES')
        result[side] = {'innerY': inner, 'outerY': outer, 'shaft': (float(shaft[0]['origin'][0]), float(shaft[0]['origin'][2])),
                        'screws': [(float(c['origin'][0]), float(c['origin'][2])) for c in screws]}
    return result


def build(root, variant, previous):
    scope = load(root / PRESENTATION / 'product-scope.json')
    require(variant in scope['activeProductVariants'], 'PRESERVED_NON_TARGET_OR_UNSUPPORTED_VARIANT')
    require(previous['variantId'] == variant and previous['printedNumber'] == 4, 'PREVIOUS_IS_S04_OF_SAME_VARIANT')
    review_path = PRESENTATION + '/step05-review-04.json'
    review = load(root / review_path)
    graph_path = f'digital-twin/validation/m2/{variant}/compiled-graph.json'
    graph = load(root / graph_path)
    step = graph['steps'][4]
    definition_of = {i['id']: i['definitionId'] for i in graph['instances']}
    stacks = [{'connectionId': c['id'], 'fastenerInstanceId': c['orderedContactStack'][0]['instanceId'], 'plateInstanceId': c['orderedContactStack'][1]['instanceId'],
               'motorInstanceId': c['orderedContactStack'][2]['instanceId'], 'washerInstanceId': c['orderedContactStack'][3]['instanceId'],
               'nutInstanceId': c['orderedContactStack'][4]['instanceId']}
              for c in graph['mechanicalConnections'] if c['activationOperationId'] in step['operationIds'] and len(c['orderedContactStack']) == 5
              and c['fastenerInstanceIds'] == [c['orderedContactStack'][0]['instanceId']]]
    require(len(stacks) == 4 and all(s['plateInstanceId'] == PLATE_ID for s in stacks), 'FOUR_MOTOR_STACKS')
    poses = {p['instanceId']: p for p in previous['placements']}
    r_plate, t_plate = rigid(poses[PLATE_ID])
    plate_world = placed(shape_of(root, definition_of[PLATE_ID]), r_plate, t_plate)
    flanges = flange_geometry(plate_world)
    placements, recipes = [], []
    side_of, motor_thickness_of = {}, {}
    for motor in sorted({s['motorInstanceId'] for s in stacks}):
        side = 'left' if 'MOTOR-LEFT' in motor else 'right'
        side_of[motor] = side
        flange = flanges[side]
        shape = shape_of(root, definition_of[motor])
        solids = shape.Solids()
        body = max(solids, key=lambda s: s.Volume()).BoundingBox()
        shaft = next(c for c in cylinder_faces(shape) if abs(c['radius'] - 2.4) < 1e-6)
        # Shaft root plane: the gearbox face the shaft leaves (max y when the shaft points +y, min y when -y).
        root_y = body.ymax if shaft['axis'][1] > 0 else body.ymin
        t = np.array([flange['shaft'][0] + shaft['origin'][0], flange['innerY'] - root_y, flange['shaft'][1] + shaft['origin'][2]])
        outward = np.array([0., 1.0 if side == 'left' else -1.0, 0.])
        require(np.linalg.norm(CAN_REARWARD @ shaft['axis'] - outward) < 1e-9, 'SHAFT_OUTWARD')
        pose = pose_of(motor, CAN_REARWARD, t, 'actualFlange.largeHole.shaftAxis', 'motor')
        placements.append(pose)
        recipes.append(staged(pose, outward + np.array([0., 0., 1.]), review['approach']['motorDistanceMm'], {'instanceId': PLATE_ID, 'localFeature': 'actualFlange.largeHole'},
                              ['align shaft with the flange hole', 'seat the gearbox face on the flange']))
        motor_thickness_of[motor] = float(body.ylen)
    for stack in sorted(stacks, key=lambda s: s['fastenerInstanceId']):
        side, motor_thickness = side_of[stack['motorInstanceId']], motor_thickness_of[stack['motorInstanceId']]
        flange = flanges[side]
        same = sorted(s['fastenerInstanceId'] for s in stacks if s['motorInstanceId'] == stack['motorInstanceId'])
        hole = flange['screws'][same.index(stack['fastenerInstanceId'])]
        direction = np.array([0., -1.0 if side == 'left' else 1.0, 0.])
        rotation = frame_from_axis(direction, [1., 0., 0.])
        origin = np.array([hole[0], flange['outerY'], hole[1]])
        thickness = {k: float(shape_of(root, definition_of[stack[k]]).BoundingBox().zlen) for k in ('washerInstanceId', 'nutInstanceId')}
        plate = abs(flange['outerY'] - flange['innerY'])
        along = {'fastenerInstanceId': 0.0, 'washerInstanceId': plate + motor_thickness, 'nutInstanceId': plate + motor_thickness + thickness['washerInstanceId']}
        for key, s in along.items():
            pose = pose_of(stack[key], rotation, origin + direction * s, 'actualFlange.smallHole.axis', 'screw' if key == 'fastenerInstanceId' else 'washer' if key.startswith('washer') else 'nut')
            placements.append(pose)
            if key == 'fastenerInstanceId':
                recipes.append(staged(pose, direction, review['approach']['screwDistanceMm'], {'instanceId': PLATE_ID, 'localFeature': 'actualFlange.smallHole'},
                                      ['align axis with the flange hole', 'seat head on the outer flange face']))
            else:
                recipes.append(staged(pose, -direction, review['approach']['washerNutDistanceMm'], {'instanceId': stack['motorInstanceId'], 'localFeature': 'gearboxFace.chassisSide'},
                                      ['bring from the chassis-centre side', 'seat on the previous stack member']))
    inputs = [digest(root, review_path), digest(root, graph_path), digest(root, MODULE), digest(root, ORACLE), digest(root, PRESENTATION + '/adopted-artifacts.json')]
    return {'id': f'PX-M7-S05-MOTORS-{variant}-04', 'revision': 4, 'track': 'instructional-only', 'variantId': variant, 'stepId': step['id'], 'printedNumber': 5,
            'graphHash': graph['graphHash'], 'modelHash': graph['modelHash'], 'placements': placements, 'stacks': stacks,
            'sides': dict(side_of), 'recipes': recipes, 'scale': [1, 1, 1], 'limitations': review['limitations'], 'claims': dict(CLAIMS),
            'engineeringBlockerIds': step['blockerIds'], 'inputBindings': inputs, 'engineeringAdmission': False, 'runtimeAdmission': False}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    for name in ['root', 'closures', 'output']:
        parser.add_argument('--' + name, required=True, type=Path)
    args = parser.parse_args()
    args.output.mkdir(parents=True, exist_ok=False)
    scope = load(args.root / PRESENTATION / 'product-scope.json')
    for variant in scope['activeProductVariants']:
        (args.output / f'{variant}-S05-record.json').write_bytes(rfc8785.dumps(build(args.root, variant, load(args.closures / f'{variant}-S04-closure.json'))) + b'\n')


if __name__ == '__main__':
    main()
