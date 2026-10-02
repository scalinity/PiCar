"""Independent S02 stack and HAT BRep checks; does not import their generator."""
import argparse
import itertools
from pathlib import Path
import cadquery as cq
import numpy as np
import rfc8785
from OCP.BRepCheck import BRepCheck_Analyzer
from ...contracts import load
from .verify import require, digest, rigid, placed, shape_features, plate_a_artifact, purchased_artifact
from .anchor_verify import verify
from .correspondence import bounds, actual_features
from .anchor_correspondence import verify_board


PRESENTATION = 'digital-twin/assemblies/v40/presentation/instructional'
HAT = 'PX-V40-DEF-ROBOT-HAT-INSTRUCTIONAL-02.brep'
FIELDS = {'id', 'revision', 'variantId', 'stepId', 'printedNumber', 'track', 'graphHash', 'modelHash', 'operationIds',
          'inputBindings', 'before', 'after', 'recipes', 'scale', 'remainingDOF', 'sourceLimitations', 'approximationFlags',
          'engineeringAdmission', 'runtimeAdmission', 'completeAssemblyOutput', 'claims', 'accessoryStatus', 'headerStatus', 'engineeringBlockerIds'}


def supports(root, solutions, artifacts, boards, record):
    require(set(record) == FIELDS, 'CLOSED_UPPER_SUPPORT_RECORD')
    variant = record['variantId']
    require(variant in ['rpi5', 'rpi-zero-2-w'], 'EXACT_ACTIVE_VARIANT')
    require(record['printedNumber'] == 2 and record['stepId'] == 'PX-V40-STEP-02' and record['revision'] == 3, 'EXACT_S02_REVISION')
    prior = load(boards / (variant + '-S02-board.json'))
    board_observation = verify_board(root, solutions, artifacts, prior)
    s01 = load(solutions / (variant + '-S01.json'))
    verify(root, s01)
    graph_path = f'digital-twin/validation/m2/{variant}/compiled-graph.json'
    graph = load(root / graph_path)
    step = graph['steps'][1]
    require(record['graphHash'] == graph['graphHash'] and record['modelHash'] == graph['modelHash'] and record['operationIds'] == step['operationIds'], 'EXACT_SEMANTICS')
    require(record['track'] == 'instructional-only' and record['engineeringAdmission'] is False and record['runtimeAdmission'] is False and record['completeAssemblyOutput'] is False, 'NO_UNCHECKED_ADMISSION')
    require(record['claims'] == {'upperBearingPlacement': 'CANDIDATE', 'installationSweep': 'BLOCKED', 'physicalFit': 'BLOCKED', 'physicalEngagement': 'BLOCKED'}, 'UNTESTED_CLAIM_PROMOTION')
    require(record['scale'] == [1, 1, 1] and record['remainingDOF'] == [], 'NO_SCALE_OR_UNDECLARED_DOF')
    require(record['engineeringBlockerIds'] == step['blockerIds'] and record['accessoryStatus'] == prior['accessoryStatus'] and record['headerStatus'] == prior['headerStatus'], 'BLOCKERS_ACCESSORY_HEADER_PRESERVED')
    review_path = PRESENTATION + '/step02-upper-support-review-03.json'
    review = load(root / review_path)
    require(record['id'] == f'PX-M7-INSTRUCTIONAL-{variant}-S02-UPPERS-03', 'UPPER_IDENTITY')
    require(record['approximationFlags'] == ['replaceablePose', 'omittedThreads', 'schematicPlateHoleMatching'], 'APPROXIMATION_FLAGS_PRESERVED')
    require(record['sourceLimitations'] == review['sourceLimitations'], 'LIMITS_PRESERVED')
    require(record['before'] == s01['after'], 'PRIOR_STATE_PRESERVED')
    expected_ids = sorted([p['instanceId'] for p in s01['after']] + step['introducedInstanceIds'])
    require(sorted(p['instanceId'] for p in record['after']) == expected_ids, 'EXACT_OWNERSHIP_NO_MISSING_DUPLICATE')
    poses = {p['instanceId']: p for p in record['after']}
    for p in s01['after'] + [prior['boardPose']]:
        require(poses[p['instanceId']] == p, 'NO_CONTEXT_DRIFT')
    ids = {i['id']: i['definitionId'] for i in graph['instances']}
    fasteners = [o for o in graph['operations'] if o['id'] in step['operationIds'] and o['kind'] == 'installFastener']
    wanted = {graph_path, review_path, 'digital-twin/cad/twin_cad/assemblies/instructional/engagement.py',
              'digital-twin/cad/twin_cad/assemblies/instructional/engagement_verify.py',
              'digital-twin/validation/expected/m5/instructional-parameters.json'}
    for d in {ids[o['payload']['fastenerInstanceId']] for o in fasteners}:
        wanted.update('digital-twin/validation/expected/m5/' + folder + '/' + d + suffix
                      for folder, suffix in [('instructional-receipts', '.json'), ('instructional-artifacts', '.brep')])
    wanted.update([variant + '-S01.json', variant + '-S02-board.json'])
    require({b['path'] for b in record['inputBindings']} == wanted and len(record['inputBindings']) == len(wanted), 'COMPLETE_INPUT_BINDINGS')
    for b in record['inputBindings']:
        source = solutions if b['path'].endswith('-S01.json') else boards if b['path'].endswith('-S02-board.json') else root
        require(b == digest(source, b['path']), 'INPUT_DRIFT')
    board = prior['boardPose']
    br, bt = rigid(board)
    board_file = artifacts / 'PX-V40-DEF-PI5-INSTRUCTIONAL-02.brep' if variant == 'rpi5' else boards / 'PX-V40-DEF-ZERO2W-INSTRUCTIONAL-02.brep'
    bshape = cq.Shape.importBrep(str(board_file))
    features = actual_features(bshape, variant)
    top = bt[2] + features['pcb'].BoundingBox().zmax
    world = {}
    for p in s01['after']:
        d = ids[p['instanceId']]
        file = purchased_artifact(root, d)
        r, t = rigid(p)
        world[p['instanceId']] = placed(cq.Shape.importBrep(str(file)), r, t)
    world[board['instanceId']] = placed(bshape, br, bt)
    require(len(record['recipes']) == len(fasteners), 'ALL_UPPER_RECIPES')
    residuals, thread_pairs, board_pairs = [], set(), set()
    for op in fasteners:
        stack = op['payload']['orderedContactStack']
        upper, target_board, lower = [s['instanceId'] for s in stack]
        require(target_board == board['instanceId'], 'CORRECT_BOARD_IN_ORDERED_STACK')
        conn = next(c for c in graph['mechanicalConnections'] if c['id'] == op['payload']['connectionId'])
        require(conn['orderedContactStack'] == stack and conn['jointType'] == 'fixed' and conn['remainingDOF'] == [], 'PROTECTED_CONNECTION_AND_DOF')
        pose = poses[upper]
        r, t = rigid(pose)
        shape = cq.Shape.importBrep(str(root / ('digital-twin/validation/expected/m5/instructional-artifacts/' + ids[upper] + '.brep')))
        require(BRepCheck_Analyzer(shape.wrapped).IsValid() and len(shape.Solids()) == 1 and shape.Volume() > 0, 'ACTUAL_UPPER_SOLID')
        cylinders = shape_features(shape)
        body = next(c for c in cylinders if abs(c['radius'] - 2.5) < 1e-6)
        require(np.linalg.norm(body['origin'][:2]) < 1e-6, 'ACTUAL_BODY_AXIS')
        extension = [c for c in cylinders if abs(c['radius'] - 1.25) < 1e-6]
        # S02 blue source visibly has the male end below the body; green has a
        # female upper body. Extract actual stem and body endpoints independently.
        expected_r = np.eye(3) if variant == 'rpi5' else np.diag([1, -1, -1])
        require(np.max(abs(r - expected_r)) < 1e-10, 'SOURCE_POLARITY_AND_PRESENTATION_ROLL')
        if variant == 'rpi-zero-2-w':
            require(len(extension) == 1 and abs(shape.BoundingBox().zmax - 24) < 1e-6, 'ACTUAL_PLUS6_EXTENSION_PRESENT')
            bearing_local = np.array([0., 0., 18.])
            require(float((r @ np.array([0., 0., 1.]))[2]) == -1, 'MALE_END_DOWN')
        else:
            require(not extension and abs(shape.BoundingBox().zmax - 18) < 1e-6, 'ACTUAL_FEMALE_UPPER_BODY')
            bearing_local = np.zeros(3)
        _, lower_t = rigid(poses[lower])
        expected_contact = np.array([lower_t[0], lower_t[1], top])
        actual_contact = r @ bearing_local + t
        residual = float(np.linalg.norm(actual_contact - expected_contact))
        require(residual <= .001 and pose['featureRef'] == 'actualStandoff.bodyBearingToPCBTop' and pose['role'] == 'upperStandoff', 'ACTUAL_BEARING_RESIDUAL')
        recipe = next((p for p in record['recipes'] if p['instanceId'] == upper), None)
        require(recipe is not None and set(recipe) == {'instanceId', 'operationId', 'connectionId', 'orderedContactStack', 'anchor', 'contactFeature', 'approachAxis', 'stagedStart', 'installationSweep', 'physicalEngagement', 'stagingOnly'}, 'CLOSED_RECIPE')
        require(recipe['operationId'] == op['id'] and recipe['connectionId'] == conn['id'] and recipe['orderedContactStack'] == stack, 'RECIPE_EXACT_SEMANTIC_OWNERSHIP')
        require(recipe['anchor'] == {'instanceId': lower, 'localFeature': 'actualStandoff.upperBearing'} and recipe['contactFeature'] == {'instanceId': board['instanceId'], 'localFeature': 'actualPCB.top'}, 'FEATURE_RELATIVE_ANCHORS')
        sr, st = rigid(recipe['stagedStart'])
        require(recipe['approachAxis'] == [0, 0, -1] and recipe['stagingOnly'] is True and recipe['installationSweep'] == 'BLOCKED' and recipe['physicalEngagement'] == 'BLOCKED', 'UNTESTED_RECIPE_CLAIM')
        require(np.max(abs(sr - r)) < 1e-10 and np.max(abs(st - t - [0, 0, 30])) < 1e-10, 'STAGING_DRIFT')
        world[upper] = placed(shape, r, t)
        thread_pairs.add(tuple(sorted([upper, lower])))
        board_pairs.add(tuple(sorted([upper if variant == 'rpi-zero-2-w' else lower, board['instanceId']])))
        residuals.append({'instanceId': upper, 'orderedContactStack': stack, 'bearingResidualMm': residual,
                          'maleEndWorldDirection': [0, 0, -1] if extension else None, 'remainingDOF': [],
                          'physicalEngagement': 'BLOCKED', 'presentationAxisGauge': 'deterministic; cylindrical roll not measured'})
    unresolved_ids = []
    for p in record['after']:
        if p['instanceId'] not in world:
            require(p == next(q for q in prior['after'] if q['instanceId'] == p['instanceId']) and p['pose'] is None and p['status'] == 'BLOCKED', 'EXPLICIT_UNRESOLVED_NO_FALLBACK')
            unresolved_ids.append(p['instanceId'])
    require(unresolved_ids == (['PX-V40-INS-USB-MICROPHONE-001'] if variant == 'rpi5' else []), 'NO_HIDDEN_NEW_INSTANCE')
    screw_pairs = {tuple(sorted(c['instances'])) for c in s01['contactPolicy']}
    allowed, unresolved, forbidden = [], [], []
    for left, right in itertools.combinations(sorted(world), 2):
        vol = float(world[left].intersect(world[right]).Volume())
        if vol <= 1e-7:
            continue
        pair = (left, right)
        if pair in screw_pairs or pair in thread_pairs:
            require(vol <= (20 if pair in screw_pairs else 22), 'THREAD_PROXY_OVERLAP_EXCEEDED')
            allowed.append({'instances': list(pair), 'volumeMm3': vol, 'kind': 'explicit omitted-bore smooth-thread proxy overlap', 'physicalEngagement': 'UNRESOLVED'})
        elif pair in board_pairs:
            # Keep the actual overlap caused by approximate traced plate centers;
            # this is not an allowed fit or a global collision exception.
            require(vol <= 8, 'APPROXIMATE_BORE_OVERLAP_EXCEEDED ' + str({'instances': list(pair), 'volumeMm3': vol,
                    'boardParts': [{'localBoundsMm': bounds(s), 'overlapMm3': float(placed(s, br, bt).intersect(world[left if right == board['instanceId'] else right]).Volume())}
                                   for s in bshape.Solids()]}))
            unresolved.append({'instances': list(pair), 'volumeMm3': vol, 'status': 'UNRESOLVED_CLEARANCE',
                               'reason': 'Reference bore vs approximate Plate A center discrepancy retained raw; physical clearance not established'})
        else:
            forbidden.append({'instances': list(pair), 'volumeMm3': vol})
    require(not forbidden, 'UNDECLARED_PROXY_PENETRATION ' + str(forbidden))
    return {'variantId': variant, 'status': 'PASS_UPPER_BEARING_OBSERVATION_ONLY', 'upperSupportCount': len(residuals),
            'residuals': residuals, 'solidInstanceCount': len(world), 'pairChecks': len(world)*(len(world)-1)//2,
            'allowedProxyContacts': allowed, 'unresolvedClearances': unresolved, 'forbiddenPenetrations': forbidden,
            'unresolvedInstances': unresolved_ids, 'boardMountResiduals': board_observation['mountResiduals'],
            'physicalFit': 'BLOCKED', 'installationSweep': 'BLOCKED', 'completeStep': False,
            'instructionalStatus': 'BLOCKED', 'engineeringAdmission': False}


def hat(root, engagement):
    review_path = PRESENTATION + '/hat-feature-review-03.json'
    review = load(root / review_path)
    record = load(engagement / 'hat-feature-candidate.json')
    require(set(record) == {'id', 'definitionId', 'definitionRevision', 'instructionalArtifactRevision', 'track', 'status', 'scope', 'oldArtifact', 'artifact', 'oldReceipt', 'inputBindings', 'sourceLimitations', 'blockerIds', 'mustNotDrive', 'engineeringStatus', 'engineeringAdmission', 'runtimeAdmission', 'unknownActualHATRevision', 'installedMating', 'physicalFit', 'inventoryItemIncrement'}, 'CLOSED_HAT_CANDIDATE')
    require(record['definitionId'] == 'PX-V40-DEF-ROBOT-HAT' and record['definitionRevision'] == 1 and record['instructionalArtifactRevision'] == 2 and record['inventoryItemIncrement'] == 0, 'HAT_IDENTITY_STOCK')
    require(record['status'] == 'CANDIDATE_REQUIRES_INDEPENDENT_ADOPTION' and record['track'] == 'instructional-only' and record['scope'] == review['adoptionScope'], 'HAT_SCOPE_NO_SELF_ADMISSION')
    require(record['engineeringStatus'] == 'BLOCKED' and record['engineeringAdmission'] is False and record['runtimeAdmission'] is False and record['unknownActualHATRevision'] is True and record['physicalFit'] == record['installedMating'] == 'BLOCKED', 'HAT_FIREWALL')
    old_path = 'digital-twin/validation/expected/m5/instructional-artifacts/PX-V40-DEF-ROBOT-HAT.brep'
    old_receipt_path = 'digital-twin/validation/expected/m5/instructional-receipts/PX-V40-DEF-ROBOT-HAT.json'
    require(record['oldArtifact'] == digest(root, old_path) and record['oldReceipt'] == digest(root, old_receipt_path) and record['artifact'] == digest(engagement, HAT), 'HAT_ARTIFACT_BINDINGS')
    expected = {review_path, 'digital-twin/cad/twin_cad/assemblies/instructional/engagement.py', 'digital-twin/cad/twin_cad/assemblies/instructional/engagement_verify.py'}
    require({b['path'] for b in record['inputBindings']} == expected and len(record['inputBindings']) == 3, 'HAT_EXACT_INPUTS')
    for b in record['inputBindings']:
        require(b == digest(root, b['path']), 'HAT_INPUT_DRIFT')
    original_receipt = load(root / old_receipt_path)
    for field in ['blockerIds', 'mustNotDrive']:
        require(record[field] == original_receipt[field], 'HAT_UPSTREAM_LIMITS')
    require(record['sourceLimitations'] == original_receipt['sourceLimitations'] + review['sourceLimitations'], 'HAT_SOURCE_LIMITS')
    old = cq.Shape.importBrep(str(root / old_path))
    shape = cq.Shape.importBrep(str(engagement / HAT))
    require(len(old.Solids()) == 11 and len(shape.Solids()) == 12 and BRepCheck_Analyzer(shape.wrapped).IsValid() and all(s.Volume() > 0 for s in shape.Solids()), 'HAT_VALID_12_OWNED_SOLIDS')
    old_pcb = next(s for s in old.Solids() if np.max(abs(np.array(bounds(s)) - [0, 0, 0, 65, 56, 1.6])) < 1e-6)
    pcb = next(s for s in shape.Solids() if np.max(abs(np.array(bounds(s)) - [0, 0, 0, 65, 56, 1.6])) < 1e-6)
    require(len(shape_features(old_pcb)) == 0, 'HISTORICAL_HAT_HAS_NO_BORES')
    actual_holes = sorted((round(c['origin'][0], 8), round(c['origin'][1], 8)) for c in shape_features(pcb)
                          if abs(c['axis'][2]) > .999999 and abs(c['radius'] - 1.4) < 1e-6)
    require(actual_holes == [(3.5, 3.5), (3.5, 52.5), (61.5, 3.5), (61.5, 52.5)], 'FOUR_ACTUAL_SOURCE_SUPPORTED_BORES')
    require(abs(old_pcb.Volume() - pcb.Volume() - 4*np.pi*1.4**2*1.6) < 1e-7, 'EXACT_PCB_ONLY_BORE_CUTS')
    top_solids = [s for s in old.Solids() if s is not old_pcb and s.BoundingBox().zmin > 1]
    require(len(top_solids) == 10, 'TEN_ORIGINAL_TOP_COMPONENTS')
    for s in top_solids:
        matching = [n for n in shape.Solids() if np.max(abs(np.array(bounds(n)) - bounds(s))) < 1e-6]
        require(len(matching) == 1 and matching[0].cut(s).Volume() + s.cut(matching[0]).Volume() < 1e-7, 'HAT_TOP_SOLIDS_UNCHANGED')
    sockets = [s for s in shape.Solids() if s.BoundingBox().zmin < -1]
    require(len(sockets) == 1 and np.max(abs(np.array(bounds(sockets[0])) - [6.8, 47.6, -10, 57.8, 52.6, 0])) < 1e-6, 'ACTUAL_SOCKET_UNDERSIDE_POLARITY')
    socket = sockets[0]
    # Test free space in the open mouth and material in its roof/walls.
    for p in [(20, 50, -5), (40, 50, -9)]:
        require(not socket.isInside(cq.Vector(*p), 1e-7), 'OPEN_SOCKET_MOUTH')
    for p in [(20, 50, -1), (7.3, 50, -5)]:
        require(socket.isInside(cq.Vector(*p), 1e-7), 'SOCKET_ROOF_AND_WALL')
    obstruction = []
    for x, y in actual_holes:
        access = cq.Solid.makeCylinder(1.4, 10, cq.Vector(x, y, 1.6))
        volume = sum(access.intersect(s).Volume() for s in top_solids)
        if volume > 1e-7:
            obstruction.append({'boreCenterMm': [x, y], 'topMarkerOverlapMm3': float(volume), 'status': 'BLOCKED_SCREW_ACCESS'})
    return {'status': 'PASS_FEATURE_REPRESENTATION_ONLY', 'definitionId': 'PX-V40-DEF-ROBOT-HAT', 'actualBoreCount': 4,
            'actualBoreCentersMm': actual_holes, 'unchangedTopSolids': 10, 'solidCount': 12, 'socketUnderside': True,
            'socketOpenMouth': True, 'stockItemIncrement': 0, 'originalReceiptUnchanged': True,
            'socketDepthPurpose': 'Schematic only; excluded from installation contact/height solve',
            'mountingAccessObstructions': obstruction, 'mountingAccess': 'BLOCKED' if obstruction else 'UNRESOLVED',
            'installedMating': 'BLOCKED', 'physicalFit': 'BLOCKED', 'engineeringAdmission': False}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    for name in ['root', 'solutions', 'artifacts', 'boards', 'engagement', 'output']:
        parser.add_argument('--' + name, required=True, type=Path)
    args = parser.parse_args()
    result = {'status': 'PASS_SCOPED_OBSERVATIONS', 'upperSupportObservations': [supports(args.root, args.solutions, args.artifacts, args.boards,
              load(args.engagement / (v + '-S02-uppers.json'))) for v in ['rpi5', 'rpi-zero-2-w']],
              'hatFeatureObservation': hat(args.root, args.engagement), 'fullM7Gate': 'BLOCKED', 'requiredActiveCoverage': 58,
              'engineeringGate': 'BLOCKED', 'runtimeAdmission': False}
    args.output.write_bytes(rfc8785.dumps(result) + b'\n')


if __name__ == '__main__':
    main()
