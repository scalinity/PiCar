"""Independent S09 ultrasonic/Plate H/rivet re-measurement; never imports the S09 generator."""
import argparse
from pathlib import Path
import cadquery as cq
import numpy as np
import rfc8785
from ...contracts import load
from .verify import require, digest, rigid, placed, purchased_artifact
from .frames import cylinder_faces, line_distance, planar_faces

PRESENTATION = 'digital-twin/assemblies/v40/presentation/instructional'
FIELDS = {'id', 'revision', 'track', 'variantId', 'stepId', 'printedNumber', 'graphHash', 'modelHash', 'placements', 'recipes', 'endpointFrames', 'limitations',
          'claims', 'engineeringBlockerIds', 'inputBindings', 'engineeringAdmission', 'runtimeAdmission'}
RECIPE_FIELDS = {'instanceId', 'anchor', 'approachAxis', 'approachDistanceMm', 'stagedStart', 'segments', 'stagingOnly', 'installationSweep', 'reversal'}
CLAIMS = {'staticPlacement': 'INSTRUCTIONAL_PASS', 'installationSweep': 'NOT_CLAIMED', 'physicalFit': 'NOT_CLAIMED'}
M6_PLATES = 'docs/implementation/evidence/m6/amendment-shapes-04/candidate-artifacts/'
M5_ARTIFACTS = 'digital-twin/validation/expected/m5/instructional-artifacts/'
PLATE_ID, PLATE_H_ID, MODULE_ID = 'PX-V40-INS-PLATE-A-001', 'PX-V40-INS-PLATE-H-001', 'PX-V40-INS-ULTRASONIC-001'
LINEAR_MM = 1e-6


def verify(root, record, previous, context=None):
    require(set(record) == FIELDS, 'CLOSED_STEP09_RECORD')
    require(record['engineeringAdmission'] is False and record['runtimeAdmission'] is False, 'ENGINEERING_FIREWALL')
    require(record['claims'] == CLAIMS and all(r['stagingOnly'] is True and r['installationSweep'] == 'NOT_CLAIMED' for r in record['recipes']), 'UNTESTED_CLAIM')
    scope = load(root / PRESENTATION / 'product-scope.json')
    variant = record['variantId']
    require(variant in scope['activeProductVariants'], 'PRESERVED_NON_TARGET_OR_UNSUPPORTED_VARIANT')
    require(record['id'] == f'PX-M7-S09-ULTRASONIC-{variant}-04' and record['revision'] == 4 and record['track'] == 'instructional-only', 'STEP09_IDENTITY')
    review = load(root / (PRESENTATION + '/step09-review-04.json'))
    require(record['limitations'] == review['limitations'], 'LIMITATION_REMOVAL')
    for binding in record['inputBindings']:
        require(binding == digest(root, binding['path']), 'INPUT_BYTES_CHANGED')
    graph = load(root / f'digital-twin/validation/m2/{variant}/compiled-graph.json')
    step = graph['steps'][8]
    require(record['graphHash'] == graph['graphHash'] and record['modelHash'] == graph['modelHash'] and record['stepId'] == step['id'], 'GRAPH_MODEL_BINDING')
    definition_of = {i['id']: i['definitionId'] for i in graph['instances']}
    rivets = sorted(c['orderedContactStack'][0]['instanceId'] for c in graph['mechanicalConnections']
                    if c['activationOperationId'] in step['operationIds'] and len(c['orderedContactStack']) == 4)
    ids = sorted(p['instanceId'] for p in record['placements'])
    require(ids == sorted([MODULE_ID, PLATE_H_ID] + rivets) and len(set(ids)) == len(ids) and len(rivets) == 2 and record['endpointFrames'] == [], 'EXACT_SEMANTIC_OWNERSHIP')
    poses = {p['instanceId']: p for p in record['placements']}
    transforms = {i: rigid(p) for i, p in poses.items()}
    context_poses = {p['instanceId']: p for p in previous['placements']}
    shape = lambda ident, t: placed(cq.Shape.importBrep(str(purchased_artifact(root, definition_of[ident]))), *t)
    wall = shape(PLATE_ID, rigid(context_poses[PLATE_ID]))
    wall_faces = sorted({round(float(f['bounds'][0]), 6) for f in planar_faces(wall, 500)
                         if abs(abs(f['normal'][0]) - 1) < 1e-6 and f['bounds'][0] > 170 and f['bounds'][3] < 175 and f['bounds'][4] - f['bounds'][1] > 50})
    require(len(wall_faces) == 2, 'TWO_FRONT_WALL_FACES')
    inner_x, outer_x = wall_faces
    holes = [c for c in cylinder_faces(wall) if abs(abs(c['axis'][0]) - 1) < 1e-6 and c['origin'][0] > 150]
    openings = [c for c in holes if abs(c['radius'] - 9.5) < 1e-6]
    ends = sorted((c for c in holes if abs(c['radius'] - 1.5) < 1e-6 and abs(c['origin'][1]) > 20), key=lambda c: -c['origin'][1])
    z_open = float(np.mean([c['origin'][2] for c in openings]))
    # Module: board face on the wall inner face, cans forward through the openings, centred across the car, connector edge down.
    module = shape(MODULE_ID, transforms[MODULE_ID])
    cans = [c for c in cylinder_faces(module) if abs(abs(c['axis'][0]) - 1) < 1e-6 and c['radius'] > 8]
    require(len(cans) == 2, 'CANS_ALONG_THE_WALL_NORMAL')
    centres = sorted(c['origin'][1] for c in cans)
    require(abs(centres[0] + centres[1]) < LINEAR_MM and all(abs(c['origin'][2] - z_open) < LINEAR_MM for c in cans), 'MODULE_NOT_CENTRED_ON_THE_OPENINGS')
    slack = [max(o['radius'] - c['radius'] - float(np.hypot(c['origin'][1] - o['origin'][1], c['origin'][2] - o['origin'][2])) for o in openings) for c in cans]
    require(min(slack) >= -1e-6, 'CAN_NOT_INSIDE_THE_WALL_OPENING')
    flat = lambda f: abs(f['bounds'][0] - f['bounds'][3]) < 1e-9
    board_front = min(float(f['bounds'][0]) for f in planar_faces(module, 100) if f['normal'][0] > .999999 and flat(f))
    board_rear = max(float(f['bounds'][0]) for f in planar_faces(module, 100) if f['normal'][0] < -.999999 and flat(f))
    require(abs(board_front - inner_x) < LINEAR_MM, 'MODULE_NOT_AGAINST_THE_WALL_INNER_FACE')
    require(module.BoundingBox().xmax > outer_x, 'CANS_NOT_THROUGH_THE_OPENINGS')
    # Plate H: front face on the module back, long axis across the car, end holes at the wall small holes.
    plate_h = shape(PLATE_H_ID, transforms[PLATE_H_ID])
    hb = plate_h.BoundingBox()
    mb = module.BoundingBox()
    require(abs(hb.xmax - board_rear) < LINEAR_MM, 'PLATE_H_NOT_ON_THE_MODULE_BACK')
    require(mb.zmin < hb.zmin, 'CONNECTOR_EDGE_NOT_DOWN')
    require(hb.ylen > 2 * hb.xlen and abs((hb.zmin + hb.zmax) / 2 - z_open) < 0.5, 'PLATE_H_NOT_ACROSS_THE_CAR_AT_OPENING_HEIGHT')
    h_holes = [c for c in cylinder_faces(plate_h) if abs(abs(c['axis'][0]) - 1) < 1e-6 and 1.4 < c['radius'] < 2.0 and abs(c['origin'][1]) > 20]
    require(len(h_holes) == 2, 'PLATE_H_END_HOLES')
    observed = []
    for rivet, hole in zip(rivets, ends):
        r_shape = shape(rivet, transforms[rivet])
        stem = next(c for c in cylinder_faces(r_shape) if abs(c['radius'] - 1.5) < 1e-6)
        gap = line_distance(stem['origin'], stem['axis'], hole['origin'], hole['axis'])
        require(gap < LINEAR_MM, f'RIVET_NOT_COAXIAL_WITH_WALL_HOLE {gap}')
        head = next(c for c in cylinder_faces(r_shape) if abs(c['radius'] - 2.5) < 1e-6)
        require(abs(head['bounds'][0] - outer_x) < LINEAR_MM, 'RIVET_HEAD_NOT_ON_WALL_OUTER_FACE')
        body = max(r_shape.Solids(), key=lambda s: s.Volume()).BoundingBox()
        require(body.xmin < hb.xmax - 1e-9 and body.xmin >= hb.xmin - 1.0, 'RIVET_TIP_NOT_THROUGH_PLATE_H')
        nearest = min(line_distance(stem['origin'], stem['axis'], h['origin'], h['axis']) for h in h_holes)
        require(nearest < 0.5, f'RIVET_FAR_FROM_PLATE_H_HOLE {nearest}')
        observed.append({'instanceId': rivet, 'wallHoleResidualMm': gap, 'plateHHoleOffsetMm': nearest})
    by_instance = {r_['instanceId']: r_ for r_ in record['recipes']}
    require(set(by_instance) == set(poses) and len(by_instance) == len(record['recipes']), 'RECIPE_OWNERSHIP')
    approach = review['approach']
    for ident, recipe in by_instance.items():
        require(set(recipe) == RECIPE_FIELDS, 'RECIPE_FIELDS')
        key = 'module' if ident == MODULE_ID else 'plateH' if ident == PLATE_H_ID else 'rivet'
        axis, dist = np.array(approach[key + 'Axis'], dtype=np.float64), approach[key + 'DistanceMm']
        sr, st = rigid(recipe['stagedStart'])
        r_, t_ = transforms[ident]
        require(np.max(np.abs(np.array(recipe['approachAxis']) - axis)) < 1e-9 and recipe['approachDistanceMm'] == dist and np.max(np.abs(sr - r_)) < 1e-10
                and np.max(np.abs(st - (t_ - axis * dist))) < 1e-9 and recipe['stagedStart']['instanceId'] == ident, 'STAGED_START')
    return {'status': 'PASS', 'variantId': variant, 'rivets': observed, 'canClearanceInOpeningMm': float(min(slack)), 'physicalFit': 'NOT_CLAIMED',
            'installationSweep': 'NOT_CLAIMED', 'engineeringAdmission': False, 'runtimeAdmission': False}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    for name in ['root', 'closures', 'step', 'output']:
        parser.add_argument('--' + name, required=True, type=Path)
    args = parser.parse_args()
    results = [verify(args.root, load(args.step / f'{v}-S09-record.json'), load(args.closures / f'{v}-S08-closure.json')) for v in ['rpi5', 'rpi-zero-2-w']]
    args.output.write_bytes(rfc8785.dumps({'status': 'PASS', 'scope': 'S09 ultrasonic mount only', 'results': results, 'engineeringAdmission': False}) + b'\n')


if __name__ == '__main__':
    main()
