"""S08 pan horn under the front deck with its four M1.5x3 screws.

Presentation only: no fit, thread engagement, pan zero or sweep is claimed. Independent re-measurement lives in
step08_verify.py, which never imports this module.
"""
import argparse
from pathlib import Path
import cadquery as cq
import numpy as np
import rfc8785
from ...contracts import load
from .verify import require, digest, rigid, placed, purchased_artifact, plate_a_artifact, REVISION_RECORDS
from .frames import CLAIMS, cylinder_faces, planar_faces, pose_of, staged

PRESENTATION = 'digital-twin/assemblies/v40/presentation/instructional'
MODULE = 'digital-twin/cad/twin_cad/assemblies/instructional/step08.py'
ORACLE = 'digital-twin/cad/twin_cad/assemblies/instructional/step08_verify.py'
M5_ARTIFACTS = 'digital-twin/validation/expected/m5/instructional-artifacts/'
PLATE_ID, HORN_ID = 'PX-V40-INS-PLATE-A-001', 'PX-V40-INS-HORN-PAN-001'
HORN_ROTATION = np.array([[0., -1., 0.], [1., 0., 0.], [0., 0., 1.]])  # horn local +x (arm) -> installed +Y, hub up
SCREW_ROTATION = np.diag([1., -1., -1.])  # head up, shank down
HUB_RADIUS, SMALL_RADIUS = 4.0, 0.7


def deck_features(plate_world):
    cylinders = [c for c in cylinder_faces(plate_world) if abs(abs(c['axis'][2]) - 1) < 1e-6 and c['origin'][0] > 150]
    hub = [c for c in cylinders if abs(c['radius'] - HUB_RADIUS) < 1e-6]
    small = [c for c in cylinders if abs(c['radius'] - SMALL_RADIUS) < 1e-6]
    require(len(hub) == 1 and len(small) == 8, 'FRONT_DECK_HOLES')  # two rows of four beside the hub (Plate A holes correction 03)
    faces = planar_faces(plate_world, 1000)
    top = max((f for f in faces if f['normal'][2] > .999999 and abs(f['bounds'][2] - f['bounds'][5]) < 1e-9 and f['bounds'][2] > 1), key=lambda f: f['area'])
    underside = max((f for f in faces if f['normal'][2] < -.999999 and abs(f['bounds'][2] - f['bounds'][5]) < 1e-9 and abs(f['bounds'][2]) < 1e-6), key=lambda f: f['area'])
    return hub[0], small, float(top['bounds'][2]), float(underside['bounds'][2])


def screw_holes(small):
    """First and last hole of each row on either side of the hub, ordered by descending installed Y."""
    chosen = []
    for side in (1, -1):
        row = sorted((c for c in small if side * c['origin'][1] > 0), key=lambda c: abs(c['origin'][1]))
        chosen += [row[0], row[-1]]
    return sorted(chosen, key=lambda c: -c['origin'][1])


def build(root, variant, previous):
    scope = load(root / PRESENTATION / 'product-scope.json')
    require(variant in scope['activeProductVariants'], 'PRESERVED_NON_TARGET_OR_UNSUPPORTED_VARIANT')
    require(previous['variantId'] == variant and previous['printedNumber'] == 7, 'PREVIOUS_IS_S07_OF_SAME_VARIANT')
    review_path = PRESENTATION + '/step08-review-05.json'
    review = load(root / review_path)
    graph_path = f'digital-twin/validation/m2/{variant}/compiled-graph.json'
    graph = load(root / graph_path)
    step = graph['steps'][7]
    definition_of = {i['id']: i['definitionId'] for i in graph['instances']}
    screws = sorted(c['orderedContactStack'][0]['instanceId'] for c in graph['mechanicalConnections']
                    if c['activationOperationId'] in step['operationIds'] and len(c['orderedContactStack']) == 3)
    require(len(screws) == 4, 'FOUR_HORN_SCREWS')
    poses = {p['instanceId']: p for p in previous['placements']}
    plate = placed(cq.Shape.importBrep(str(root / plate_a_artifact(root))), *rigid(poses[PLATE_ID]))
    hub_hole, small, deck_top, deck_underside = deck_features(plate)
    horn_shape = cq.Shape.importBrep(str(purchased_artifact(root, definition_of[HORN_ID])))
    hub = max(cylinder_faces(horn_shape), key=lambda c: c['radius'])  # the hub is the widest cylinder of a horn
    plate_top = min(f['bounds'][2] for f in planar_faces(horn_shape, 8) if f['normal'][2] > .999999)  # lowest upward face: the plate top, below the hub top
    offset = HORN_ROTATION @ np.array([hub['origin'][0], hub['origin'][1], 0.])
    translation = np.array([hub_hole['origin'][0] - offset[0], hub_hole['origin'][1] - offset[1], deck_underside - plate_top])
    horn = pose_of(HORN_ID, HORN_ROTATION, translation, 'actualDeck.panHubHole', 'panHorn')
    placements = [horn]
    recipes = [staged(horn, review['approach']['hornAxis'], review['approach']['hornDistanceMm'], {'instanceId': PLATE_ID, 'localFeature': 'actualDeck.panHubHole'},
                      ['rise from below the deck', 'seat the horn top on the deck underside with the hub in the hole'])]
    for ident, hole in zip(screws, screw_holes(small)):
        pose = pose_of(ident, SCREW_ROTATION, [hole['origin'][0], hole['origin'][1], deck_top], 'actualDeck.smallHole.top', 'screw')
        placements.append(pose)
        recipes.append(staged(pose, review['approach']['screwAxis'], review['approach']['screwDistanceMm'], {'instanceId': PLATE_ID, 'localFeature': 'actualDeck.smallHole'},
                              ['align axis with the deck hole', 'seat head on the deck top']))
    inputs = [digest(root, review_path), digest(root, graph_path), digest(root, MODULE), digest(root, ORACLE), digest(root, plate_a_artifact(root)), digest(root, REVISION_RECORDS)]
    return {'id': f'PX-M7-S08-PAN-HORN-{variant}-04', 'revision': 4, 'track': 'instructional-only', 'variantId': variant, 'stepId': step['id'], 'printedNumber': 8,
            'graphHash': graph['graphHash'], 'modelHash': graph['modelHash'], 'placements': placements, 'recipes': recipes, 'endpointFrames': [],
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
        (args.output / f'{variant}-S08-record.json').write_bytes(rfc8785.dumps(build(args.root, variant, load(args.closures / f'{variant}-S07-closure.json'))) + b'\n')


if __name__ == '__main__':
    main()
