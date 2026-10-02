"""Independent S07 battery re-measurement; never imports the S07 generator."""
import argparse
from pathlib import Path
import cadquery as cq
import numpy as np
import rfc8785
from ...contracts import load
from .verify import require, digest, rigid, placed, plate_a_artifact, purchased_artifact
from .frames import planar_faces

PRESENTATION = 'digital-twin/assemblies/v40/presentation/instructional'
FIELDS = {'id', 'revision', 'track', 'variantId', 'stepId', 'printedNumber', 'graphHash', 'modelHash', 'placements', 'recipes', 'endpointFrames', 'limitations',
          'claims', 'engineeringBlockerIds', 'inputBindings', 'engineeringAdmission', 'runtimeAdmission'}
RECIPE_FIELDS = {'instanceId', 'anchor', 'approachAxis', 'approachDistanceMm', 'stagedStart', 'segments', 'stagingOnly', 'installationSweep', 'reversal'}
CLAIMS = {'staticPlacement': 'INSTRUCTIONAL_PASS', 'installationSweep': 'NOT_CLAIMED', 'physicalFit': 'NOT_CLAIMED'}
M5_ARTIFACTS = 'digital-twin/validation/expected/m5/instructional-artifacts/'
PLATE_ID, BATTERY_ID = 'PX-V40-INS-PLATE-A-001', 'PX-V40-INS-BATTERY-001'
LINEAR_MM = 1e-6


def verify(root, record, previous, context=None):
    require(set(record) == FIELDS, 'CLOSED_STEP07_RECORD')
    require(record['engineeringAdmission'] is False and record['runtimeAdmission'] is False, 'ENGINEERING_FIREWALL')
    require(record['claims'] == CLAIMS and all(r['stagingOnly'] is True and r['installationSweep'] == 'NOT_CLAIMED' for r in record['recipes']), 'UNTESTED_CLAIM')
    scope = load(root / PRESENTATION / 'product-scope.json')
    variant = record['variantId']
    require(variant in scope['activeProductVariants'], 'PRESERVED_NON_TARGET_OR_UNSUPPORTED_VARIANT')
    require(record['id'] == f'PX-M7-S07-BATTERY-{variant}-04' and record['revision'] == 4 and record['track'] == 'instructional-only', 'STEP07_IDENTITY')
    review = load(root / (PRESENTATION + '/step07-review-04.json'))
    require(record['limitations'] == review['limitations'], 'LIMITATION_REMOVAL')
    for binding in record['inputBindings']:
        require(binding == digest(root, binding['path']), 'INPUT_BYTES_CHANGED')
    graph = load(root / f'digital-twin/validation/m2/{variant}/compiled-graph.json')
    step = graph['steps'][6]
    require(record['graphHash'] == graph['graphHash'] and record['modelHash'] == graph['modelHash'] and record['stepId'] == step['id'], 'GRAPH_MODEL_BINDING')
    require([p['instanceId'] for p in record['placements']] == [BATTERY_ID] and record['endpointFrames'] == [], 'EXACT_SEMANTIC_OWNERSHIP')
    definition_of = {i['id']: i['definitionId'] for i in graph['instances']}
    poses = {p['instanceId']: p for p in previous['placements']}
    r, t = rigid(record['placements'][0])
    require(np.max(np.abs(r - np.eye(3))) < 1e-12, 'BATTERY_LONG_AXIS_ALONG_THE_CAR')
    plate = placed(cq.Shape.importBrep(str(root / plate_a_artifact(root))), *rigid(poses[PLATE_ID]))
    faces = planar_faces(plate, 1.0)
    # Deck underside: the largest face looking straight down; flange tabs: the two inward faces of the slotted flanges.
    underside = max((f for f in faces if f['normal'][2] < -.999999 and abs(f['bounds'][2] - f['bounds'][5]) < 1e-9), key=lambda f: f['area'])
    tabs = [f for f in faces if abs(abs(f['normal'][1]) - 1) < 1e-6 and 82 < f['bounds'][0] < 84 and 121 < f['bounds'][3] < 123 and f['bounds'][5] - f['bounds'][2] > 15]
    left = next(f for f in tabs if f['normal'][1] < 0 and f['bounds'][1] > 0)
    right = next(f for f in tabs if f['normal'][1] > 0 and f['bounds'][4] < 0)
    battery_local = cq.Shape.importBrep(str(purchased_artifact(root, definition_of[BATTERY_ID]))).BoundingBox()
    box = np.array([t[0], t[1], t[2], t[0] + battery_local.xlen, t[1] + battery_local.ylen, t[2] + battery_local.zlen])
    require(abs(box[5] - underside['bounds'][2]) < LINEAR_MM, 'BATTERY_TOP_NOT_ON_DECK_UNDERSIDE')
    require(abs((box[1] + box[4]) / 2 - (left['bounds'][1] + right['bounds'][1]) / 2) < LINEAR_MM, 'BATTERY_NOT_CENTRED_BETWEEN_FLANGES')
    motor_front = max(placed(cq.Shape.importBrep(str(purchased_artifact(root, definition_of[i]))), *rigid(p)).BoundingBox().xmax
                      for i, p in poses.items() if 'MOTOR' in i and i.endswith('-001'))
    require(abs(box[0] - motor_front) < LINEAR_MM, 'BATTERY_NOT_AT_NEAREST_CLEAR_POSITION')
    # The tape patch lies between the rear deck cutout and the front oval slot, taken from the traced Plate A parameters.
    parameters = load(root / 'digital-twin/validation/expected/plates/instructional/all-parameters.json')
    deck = next(f for d in parameters['definitions'] if d['plate'] == 'A' for f in d['profile']['faces'] if f['name'] == 'deck')
    rear = max(v[0] for c in deck['cutouts'] if c['name'] == 'rear.deck.rectangle' for v in c['verticesMm'])
    slot = next(s for s in deck['slots'] if s['name'] == 'deck.slot.9')
    require(box[0] >= rear and box[3] <= slot['endCentersMm'][0][0] - slot['widthMm'] / 2 + LINEAR_MM, 'BATTERY_OUTSIDE_THE_TAPE_PATCH')
    recipe = record['recipes'][0]
    require(len(record['recipes']) == 1 and set(recipe) == RECIPE_FIELDS and recipe['instanceId'] == BATTERY_ID, 'RECIPE_OWNERSHIP')
    axis = np.array(recipe['approachAxis'], dtype=np.float64)
    sr, st = rigid(recipe['stagedStart'])
    require(np.max(np.abs(axis - np.array(review['approach']['axis']))) < 1e-12 and recipe['approachDistanceMm'] == review['approach']['distanceMm']
            and np.max(np.abs(sr - r)) < 1e-10 and np.max(np.abs(st - (t - axis * recipe['approachDistanceMm']))) < 1e-9, 'STAGED_START')
    return {'status': 'PASS', 'variantId': variant, 'batteryBoundsMm': [float(v) for v in box], 'flangeGapMm': float(left['bounds'][1] - right['bounds'][1]),
            'batteryWidthMm': float(battery_local.ylen), 'physicalFit': 'NOT_CLAIMED', 'installationSweep': 'NOT_CLAIMED', 'engineeringAdmission': False, 'runtimeAdmission': False}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    for name in ['root', 'closures', 'step', 'output']:
        parser.add_argument('--' + name, required=True, type=Path)
    args = parser.parse_args()
    results = [verify(args.root, load(args.step / f'{v}-S07-record.json'), load(args.closures / f'{v}-S06-closure.json')) for v in ['rpi5', 'rpi-zero-2-w']]
    args.output.write_bytes(rfc8785.dumps({'status': 'PASS', 'scope': 'S07 battery placement only', 'results': results, 'engineeringAdmission': False}) + b'\n')


if __name__ == '__main__':
    main()
