"""S09 ultrasonic module clamped between the front wall and Plate H by two R3080 rivets.

Presentation only: no fit, rivet grip, retention or sweep is claimed. Independent re-measurement lives in
step09_verify.py, which never imports this module.
"""
import argparse
from pathlib import Path
import cadquery as cq
import numpy as np
import rfc8785
from ...contracts import load
from .verify import require, digest, rigid, placed, purchased_artifact, REVISION_RECORDS
from .frames import CLAIMS, cylinder_faces, frame_from_axis, planar_faces, pose_of, staged

PRESENTATION = 'digital-twin/assemblies/v40/presentation/instructional'
MODULE = 'digital-twin/cad/twin_cad/assemblies/instructional/step09.py'
ORACLE = 'digital-twin/cad/twin_cad/assemblies/instructional/step09_verify.py'
M6_PLATES = 'docs/implementation/evidence/m6/amendment-shapes-04/candidate-artifacts/'
M5_ARTIFACTS = 'digital-twin/validation/expected/m5/instructional-artifacts/'
PLATE_ID, PLATE_H_ID, MODULE_ID = 'PX-V40-INS-PLATE-A-001', 'PX-V40-INS-PLATE-H-001', 'PX-V40-INS-ULTRASONIC-001'
# Revised module: local z (cans) -> +X, local y (crystal edge at 0, connector edge at width) -> -Z so the connector hangs down through the Plate H notch, local x -> -Y.
# Plate H: local x -> +Z, y -> -Y, z (thickness) -> +X. Both proper.
MODULE_ROTATION = np.array([[0., 0., 1.], [-1., 0., 0.], [0., -1., 0.]])
PLATE_H_ROTATION = np.array([[0., 0., 1.], [0., -1., 0.], [1., 0., 0.]])
OPENING_RADIUS, SMALL_RADIUS = 9.5, 1.5


def wall_features(plate_world):
    """Front wall inner and outer planes (installed X), its two large opening axes and two small end-hole axes."""
    cylinders = [c for c in cylinder_faces(plate_world) if abs(abs(c['axis'][0]) - 1) < 1e-6 and c['origin'][0] > 150]
    openings = [c for c in cylinders if abs(c['radius'] - OPENING_RADIUS) < 1e-6]
    small = [c for c in cylinders if abs(c['radius'] - SMALL_RADIUS) < 1e-6 and abs(c['origin'][1]) > 20]
    require(len(openings) == 2 and len(small) == 2, 'FRONT_WALL_HOLES')
    faces = [f for f in planar_faces(plate_world, 500) if abs(abs(f['normal'][0]) - 1) < 1e-6 and f['bounds'][0] > 170 and f['bounds'][3] < 175 and f['bounds'][4] - f['bounds'][1] > 50]
    xs = sorted({round(float(f['bounds'][0]), 6) for f in faces})
    require(len(xs) == 2, 'TWO_FRONT_WALL_FACES')
    return xs[0], xs[1], openings, sorted(small, key=lambda c: -c['origin'][1])


def build(root, variant, previous):
    scope = load(root / PRESENTATION / 'product-scope.json')
    require(variant in scope['activeProductVariants'], 'PRESERVED_NON_TARGET_OR_UNSUPPORTED_VARIANT')
    require(previous['variantId'] == variant and previous['printedNumber'] == 8, 'PREVIOUS_IS_S08_OF_SAME_VARIANT')
    review_path = PRESENTATION + '/step09-review-04.json'
    review = load(root / review_path)
    graph_path = f'digital-twin/validation/m2/{variant}/compiled-graph.json'
    graph = load(root / graph_path)
    step = graph['steps'][8]
    definition_of = {i['id']: i['definitionId'] for i in graph['instances']}
    rivets = sorted(c['orderedContactStack'][0]['instanceId'] for c in graph['mechanicalConnections']
                    if c['activationOperationId'] in step['operationIds'] and len(c['orderedContactStack']) == 4)
    require(len(rivets) == 2, 'TWO_RIVETS')
    poses = {p['instanceId']: p for p in previous['placements']}
    plate = placed(cq.Shape.importBrep(str(purchased_artifact(root, definition_of[PLATE_ID]))), *rigid(poses[PLATE_ID]))
    inner_x, outer_x, openings, small = wall_features(plate)
    z_open = float(np.mean([c['origin'][2] for c in openings]))
    module_local = cq.Shape.importBrep(str(purchased_artifact(root, definition_of[MODULE_ID])))
    pcb_top = min(f['bounds'][2] for f in planar_faces(module_local, 100) if f['normal'][2] > .999999)  # the board's front (can side) face
    cans = [c for c in cylinder_faces(module_local) if abs(abs(c['axis'][2]) - 1) < 1e-6 and c['radius'] > 8]
    require(len(cans) == 2, 'TWO_TRANSDUCER_CANS')
    # World y = -x + ty and z = -y + tz: the can pair is centred across the car and its axes sit on the opening height.
    can_x, can_y = [c['origin'][0] for c in cans], float(np.mean([c['origin'][1] for c in cans]))
    module_t = np.array([inner_x - pcb_top, float(np.mean(can_x)), z_open + can_y])
    module_pose = pose_of(MODULE_ID, MODULE_ROTATION, module_t, 'actualFrontWall.innerFace.openings', 'ultrasonic')
    h = cq.Shape.importBrep(str(purchased_artifact(root, definition_of[PLATE_H_ID]))).BoundingBox()
    plate_h_t = np.array([module_t[0] - h.zlen, 0.0, z_open])  # the plate front face rests on the board rear face (module local z=0)
    plate_h_pose = pose_of(PLATE_H_ID, PLATE_H_ROTATION, plate_h_t, 'actualFrontWall.endHoles.behindModule', 'plateH')
    placements = [module_pose, plate_h_pose]
    approach = review['approach']
    recipes = [staged(module_pose, approach['moduleAxis'], approach['moduleDistanceMm'], {'instanceId': PLATE_ID, 'localFeature': 'actualFrontWall.openings'},
                      ['bring from behind the wall', 'push the transducers forward through the openings']),
               staged(plate_h_pose, approach['plateHAxis'], approach['plateHDistanceMm'], {'instanceId': MODULE_ID, 'localFeature': 'backFace'},
                      ['bring from behind', 'seat the plate front face on the module back'])]
    for ident, hole in zip(rivets, small):
        pose = pose_of(ident, frame_from_axis([-1., 0., 0.], [0., 1., 0.]), [outer_x, hole['origin'][1], hole['origin'][2]], 'actualFrontWall.smallHole.outerFace', 'rivet')
        placements.append(pose)
        recipes.append(staged(pose, approach['rivetAxis'], approach['rivetDistanceMm'], {'instanceId': PLATE_ID, 'localFeature': 'actualFrontWall.smallHole'},
                              ['align axis with the wall hole', 'seat the head on the wall outer face']))
    inputs = [digest(root, review_path), digest(root, graph_path), digest(root, MODULE), digest(root, ORACLE), digest(root, REVISION_RECORDS)]
    return {'id': f'PX-M7-S09-ULTRASONIC-{variant}-04', 'revision': 4, 'track': 'instructional-only', 'variantId': variant, 'stepId': step['id'], 'printedNumber': 9,
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
        (args.output / f'{variant}-S09-record.json').write_bytes(rfc8785.dumps(build(args.root, variant, load(args.closures / f'{variant}-S08-closure.json'))) + b'\n')


if __name__ == '__main__':
    main()
