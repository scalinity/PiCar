"""Independent S08 pan horn re-measurement; never imports the S08 generator."""
import argparse
from pathlib import Path
import cadquery as cq
import numpy as np
import rfc8785
from ...contracts import load
from .verify import require, digest, rigid, placed, purchased_artifact, plate_a_artifact
from .frames import cylinder_faces, line_distance, planar_faces

PRESENTATION = 'digital-twin/assemblies/v40/presentation/instructional'
FIELDS = {'id', 'revision', 'track', 'variantId', 'stepId', 'printedNumber', 'graphHash', 'modelHash', 'placements', 'recipes', 'endpointFrames', 'limitations',
          'claims', 'engineeringBlockerIds', 'inputBindings', 'engineeringAdmission', 'runtimeAdmission'}
RECIPE_FIELDS = {'instanceId', 'anchor', 'approachAxis', 'approachDistanceMm', 'stagedStart', 'segments', 'stagingOnly', 'installationSweep', 'reversal'}
CLAIMS = {'staticPlacement': 'INSTRUCTIONAL_PASS', 'installationSweep': 'NOT_CLAIMED', 'physicalFit': 'NOT_CLAIMED'}
M5_ARTIFACTS = 'digital-twin/validation/expected/m5/instructional-artifacts/'
PLATE_ID, HORN_ID = 'PX-V40-INS-PLATE-A-001', 'PX-V40-INS-HORN-PAN-001'
LINEAR_MM = 1e-6


def verify(root, record, previous, context=None):
    require(set(record) == FIELDS, 'CLOSED_STEP08_RECORD')
    require(record['engineeringAdmission'] is False and record['runtimeAdmission'] is False, 'ENGINEERING_FIREWALL')
    require(record['claims'] == CLAIMS and all(r['stagingOnly'] is True and r['installationSweep'] == 'NOT_CLAIMED' for r in record['recipes']), 'UNTESTED_CLAIM')
    scope = load(root / PRESENTATION / 'product-scope.json')
    variant = record['variantId']
    require(variant in scope['activeProductVariants'], 'PRESERVED_NON_TARGET_OR_UNSUPPORTED_VARIANT')
    require(record['id'] == f'PX-M7-S08-PAN-HORN-{variant}-04' and record['revision'] == 4 and record['track'] == 'instructional-only', 'STEP08_IDENTITY')
    review = load(root / (PRESENTATION + '/step08-review-05.json'))
    require(record['limitations'] == review['limitations'], 'LIMITATION_REMOVAL')
    for binding in record['inputBindings']:
        require(binding == digest(root, binding['path']), 'INPUT_BYTES_CHANGED')
    graph = load(root / f'digital-twin/validation/m2/{variant}/compiled-graph.json')
    step = graph['steps'][7]
    require(record['graphHash'] == graph['graphHash'] and record['modelHash'] == graph['modelHash'] and record['stepId'] == step['id'], 'GRAPH_MODEL_BINDING')
    definition_of = {i['id']: i['definitionId'] for i in graph['instances']}
    screws = sorted(c['orderedContactStack'][0]['instanceId'] for c in graph['mechanicalConnections']
                    if c['activationOperationId'] in step['operationIds'] and len(c['orderedContactStack']) == 3)
    ids = sorted(p['instanceId'] for p in record['placements'])
    require(ids == sorted([HORN_ID] + screws) and len(set(ids)) == len(ids) and len(screws) == 4 and record['endpointFrames'] == [], 'EXACT_SEMANTIC_OWNERSHIP')
    poses = {p['instanceId']: p for p in record['placements']}
    transforms = {i: rigid(p) for i, p in poses.items()}
    context_poses = {p['instanceId']: p for p in previous['placements']}
    plate = placed(cq.Shape.importBrep(str(root / plate_a_artifact(root))), *rigid(context_poses[PLATE_ID]))
    cylinders = [c for c in cylinder_faces(plate) if abs(abs(c['axis'][2]) - 1) < 1e-6 and c['origin'][0] > 150]
    hub_hole = next(c for c in cylinders if abs(c['radius'] - 4) < 1e-6)
    small = [c for c in cylinders if abs(c['radius'] - 0.7) < 1e-6]
    faces = planar_faces(plate, 1000)
    flat = lambda f: abs(f['bounds'][2] - f['bounds'][5]) < 1e-9
    deck_top = float(max((f for f in faces if f['normal'][2] > .999999 and flat(f) and f['bounds'][2] > 1), key=lambda f: f['area'])['bounds'][2])
    underside = float(max((f for f in faces if f['normal'][2] < -.999999 and flat(f) and abs(f['bounds'][2]) < 1e-6), key=lambda f: f['area'])['bounds'][2])
    # Horn: hub coaxial with the pan hole, top face on the deck underside, arm across the car, hub rising into the hole.
    r, t = transforms[HORN_ID]
    horn = placed(cq.Shape.importBrep(str(purchased_artifact(root, definition_of[HORN_ID]))), r, t)
    hub = max(cylinder_faces(horn), key=lambda c: c['radius'])  # the hub is the widest cylinder of a horn
    distance = line_distance(hub['origin'], hub['axis'], hub_hole['origin'], hub_hole['axis'])
    require(distance < LINEAR_MM, f'HUB_NOT_COAXIAL_WITH_PAN_HOLE {distance}')
    top = min(f['bounds'][2] for f in planar_faces(horn, 8) if f['normal'][2] > .999999 and abs(f['bounds'][2] - f['bounds'][5]) < 1e-9)
    require(abs(top - underside) < LINEAR_MM, 'HORN_NOT_ON_DECK_UNDERSIDE')
    bb = horn.BoundingBox()
    require(bb.ylen > 3 * bb.xlen and abs((bb.ymin + bb.ymax) / 2 - hub['origin'][1]) < 1e-6 and bb.zmax > underside + 0.5, 'HORN_ARM_ACROSS_THE_CAR_HUB_UP')
    bottom = bb.zmin
    # Screws: expected holes re-derived (first and last of each row beside the hub, descending installed Y).
    chosen = []
    for side in (1, -1):
        row = sorted((c for c in small if side * c['origin'][1] > 0), key=lambda c: abs(c['origin'][1]))
        chosen += [row[0], row[-1]]
    chosen.sort(key=lambda c: -c['origin'][1])
    observed = []
    for ident, hole in zip(screws, chosen):
        sr, st = transforms[ident]
        screw = placed(cq.Shape.importBrep(str(purchased_artifact(root, definition_of[ident]))), sr, st)
        faces_c = cylinder_faces(screw)
        shank = min(faces_c, key=lambda c: c['radius'])
        head = max(faces_c, key=lambda c: c['radius'])
        gap = line_distance(shank['origin'], shank['axis'], hole['origin'], hole['axis'])
        require(gap < LINEAR_MM, f'SCREW_NOT_COAXIAL_WITH_DECK_HOLE {gap}')
        sb = screw.BoundingBox()
        require(abs(head['bounds'][2] - deck_top) < LINEAR_MM and sb.zmax > deck_top, 'SCREW_HEAD_NOT_ON_DECK_TOP')
        require(bottom < sb.zmin < underside, 'SCREW_TIP_NOT_IN_HORN')
        observed.append({'instanceId': ident, 'holeResidualMm': gap, 'tipDepthIntoHornMm': float(underside - sb.zmin)})
    by_instance = {r_['instanceId']: r_ for r_ in record['recipes']}
    require(set(by_instance) == set(poses) and len(by_instance) == len(record['recipes']), 'RECIPE_OWNERSHIP')
    for ident, recipe in by_instance.items():
        require(set(recipe) == RECIPE_FIELDS, 'RECIPE_FIELDS')
        axis, dist = (np.array(review['approach']['hornAxis'], dtype=np.float64), review['approach']['hornDistanceMm']) if ident == HORN_ID else (
            np.array(review['approach']['screwAxis'], dtype=np.float64), review['approach']['screwDistanceMm'])
        sr, st = rigid(recipe['stagedStart'])
        r_, t_ = transforms[ident]
        require(np.max(np.abs(np.array(recipe['approachAxis']) - axis)) < 1e-9 and recipe['approachDistanceMm'] == dist and np.max(np.abs(sr - r_)) < 1e-10
                and np.max(np.abs(st - (t_ - axis * dist))) < 1e-9 and recipe['stagedStart']['instanceId'] == ident, 'STAGED_START')
    return {'status': 'PASS', 'variantId': variant, 'hubAxisResidualMm': distance, 'screws': observed, 'physicalFit': 'NOT_CLAIMED',
            'installationSweep': 'NOT_CLAIMED', 'engineeringAdmission': False, 'runtimeAdmission': False}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    for name in ['root', 'closures', 'step', 'output']:
        parser.add_argument('--' + name, required=True, type=Path)
    args = parser.parse_args()
    results = [verify(args.root, load(args.step / f'{v}-S08-record.json'), load(args.closures / f'{v}-S07-closure.json')) for v in ['rpi5', 'rpi-zero-2-w']]
    args.output.write_bytes(rfc8785.dumps({'status': 'PASS', 'scope': 'S08 pan horn only', 'results': results, 'engineeringAdmission': False}) + b'\n')


if __name__ == '__main__':
    main()
