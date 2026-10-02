"""S07 battery mount: the battery lies under the deck against the underside, between the slotted flanges.

Presentation only. The battery lead's HAT-end connector frame is not established here, so this step's connect
operation stays BLOCKED in its closure; the placement itself is carried forward. Independent re-measurement lives
in step07_verify.py, which never imports this module.
"""
import argparse
from pathlib import Path
import cadquery as cq
import numpy as np
import rfc8785
from ...contracts import load
from .verify import require, digest, rigid, placed, plate_a_artifact, purchased_artifact
from .frames import CLAIMS, planar_faces, pose_of, staged

PRESENTATION = 'digital-twin/assemblies/v40/presentation/instructional'
MODULE = 'digital-twin/cad/twin_cad/assemblies/instructional/step07.py'
ORACLE = 'digital-twin/cad/twin_cad/assemblies/instructional/step07_verify.py'
M5_ARTIFACTS = 'digital-twin/validation/expected/m5/instructional-artifacts/'
PLATE_ID, BATTERY_ID = 'PX-V40-INS-PLATE-A-001', 'PX-V40-INS-BATTERY-001'


def build(root, variant, previous):
    scope = load(root / PRESENTATION / 'product-scope.json')
    require(variant in scope['activeProductVariants'], 'PRESERVED_NON_TARGET_OR_UNSUPPORTED_VARIANT')
    require(previous['variantId'] == variant and previous['printedNumber'] == 6, 'PREVIOUS_IS_S06_OF_SAME_VARIANT')
    review_path = PRESENTATION + '/step07-review-04.json'
    review = load(root / review_path)
    graph_path = f'digital-twin/validation/m2/{variant}/compiled-graph.json'
    graph = load(root / graph_path)
    step = graph['steps'][6]
    definition_of = {i['id']: i['definitionId'] for i in graph['instances']}
    poses = {p['instanceId']: p for p in previous['placements']}
    r_plate, t_plate = rigid(poses[PLATE_ID])
    plate = placed(cq.Shape.importBrep(str(root / plate_a_artifact(root))), r_plate, t_plate)
    faces = planar_faces(plate, 1.0)
    underside = max((f for f in faces if f['normal'][2] < -.999999 and abs(f['bounds'][2] - f['bounds'][5]) < 1e-9), key=lambda f: f['area'])
    inner_left = next(f for f in faces if f['normal'][1] < -.999999 and f['bounds'][1] > 0 and 82 < f['bounds'][0] < 84 and 121 < f['bounds'][3] < 123 and f['bounds'][5] - f['bounds'][2] > 15)
    inner_right = next(f for f in faces if f['normal'][1] > .999999 and f['bounds'][4] < 0 and 82 < f['bounds'][0] < 84 and 121 < f['bounds'][3] < 123 and f['bounds'][5] - f['bounds'][2] > 15)
    motor_front = 0.0
    for ident, pose in poses.items():
        if 'MOTOR' in ident:
            r, t = rigid(pose)
            body = max(placed(cq.Shape.importBrep(str(purchased_artifact(root, definition_of[ident]))), r, t).Solids(), key=lambda s: s.Volume())
            motor_front = max(motor_front, body.BoundingBox().xmax)
    battery = cq.Shape.importBrep(str(purchased_artifact(root, definition_of[BATTERY_ID]))).BoundingBox()
    y_center = (float(inner_left['bounds'][1]) + float(inner_right['bounds'][1])) / 2
    top = float(underside['bounds'][2])
    translation = np.array([motor_front, y_center - battery.ylen / 2, top - battery.zlen])
    pose = pose_of(BATTERY_ID, np.eye(3), translation, 'actualDeck.undersidePlane', 'battery')
    recipe = staged(pose, review['approach']['axis'], review['approach']['distanceMm'], {'instanceId': PLATE_ID, 'localFeature': 'actualDeck.undersidePlane'},
                    ['rise from below the chassis', 'press the top face to the deck underside'])
    inputs = [digest(root, review_path), digest(root, graph_path), digest(root, MODULE), digest(root, ORACLE), digest(root, plate_a_artifact(root))]
    return {'id': f'PX-M7-S07-BATTERY-{variant}-04', 'revision': 4, 'track': 'instructional-only', 'variantId': variant, 'stepId': step['id'], 'printedNumber': 7,
            'graphHash': graph['graphHash'], 'modelHash': graph['modelHash'], 'placements': [pose], 'recipes': [recipe], 'endpointFrames': [],
            'limitations': review['limitations'], 'claims': dict(CLAIMS), 'engineeringBlockerIds': step['blockerIds'], 'inputBindings': inputs,
            'engineeringAdmission': False, 'runtimeAdmission': False}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    for name in ['root', 'closures', 'output']:
        parser.add_argument('--' + name, required=True, type=Path)
    args = parser.parse_args()
    args.output.mkdir(parents=True, exist_ok=False)
    scope = load(args.root / PRESENTATION / 'product-scope.json')
    for variant in scope['activeProductVariants']:
        (args.output / f'{variant}-S07-record.json').write_bytes(rfc8785.dumps(build(args.root, variant, load(args.closures / f'{variant}-S06-closure.json'))) + b'\n')


if __name__ == '__main__':
    main()
