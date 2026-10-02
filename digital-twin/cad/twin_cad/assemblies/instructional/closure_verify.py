"""Independent re-measurement of instructional step closures; never imports the closure generator."""
import argparse
import math
import re
import hashlib
import itertools
from pathlib import Path
import cadquery as cq
import numpy as np
import rfc8785
from OCP.BRepCheck import BRepCheck_Analyzer
from ...contracts import load, Invalid
from .verify import require, digest, rigid, placed, purchased_artifact
from . import anchor_verify, camera_verify, engagement_verify, hat_verify, step05_verify, step06_verify, step07_verify, step08_verify, step09_verify, usb_verify

PRESENTATION = 'digital-twin/assemblies/v40/presentation/instructional'
REQUIRED_CHECKS = ['upstreamReceiptClosure', 'exactSemanticOwnership', 'independentSourceDirection', 'properRigidTransforms',
                   'independentFeatureResiduals', 'intendedDOF', 'contactClassification', 'explicitMotionCapability']
FIELDS = {'id', 'revision', 'track', 'variantId', 'stepId', 'printedNumber', 'basis', 'unit', 'numericType', 'graphHash', 'modelHash',
          'beforeStateHash', 'afterStateHash', 'operationIds', 'connectionIds', 'introducedInstanceIds', 'before', 'scale', 'placements',
          'anchors', 'recipes', 'contactPolicy', 'dof', 'motion', 'claims', 'sourceLimitations', 'approximationFlags', 'inputBindings',
          'engineeringBlockerIds', 'engineeringAdmission', 'runtimeAdmission', 'endpointFrames', 'carriedUnframedConnectionIds', 'status', 'blockers', 'zeroSolidInstanceIds'}
RECIPE_FIELDS = {'instanceId', 'anchor', 'approachAxis', 'approachDistanceMm', 'stagedStart', 'segments', 'stagingOnly', 'installationSweep', 'reversal'}
POLICY_FIELDS = {'instances', 'category', 'maximumOverlapMm3', 'maximumGapMm', 'maximumPenetrationMm', 'basis'}
INTERFERENCE_MM = 2.0
GAP_CATEGORY = 'APPROXIMATE_HEIGHT_GAP'
GAP_BUDGET_MM = 1.0
FRAME_ENTRY_FIELDS = {'connectionId', 'cableInstanceId', 'endpointLabel', 'targetInstanceId', 'connectionPointId', 'frame', 'approach', 'selection'}
BUDGET = {'PROXY_OVERLAP_OMITTED_DETAIL': 22., 'UNRESOLVED_CLEARANCE': 8.}
CATEGORIES = set(BUDGET) | {'PROXY_OVERLAP_OMITTED_SOCKET_CAVITY', 'APPROXIMATE_HEIGHT_GAP', 'PROXY_OVERLAP_OMITTED_BORE', 'APPROXIMATE_TRACE_INTERFERENCE'}
THREADED = {'screw', 'standoff', 'nut'}
FASTENER = {'screw', 'rivet'}
BORELESS = {'motor', 'battery'}  # proxy bodies authored without mounting bores
CLAIMS = {'staticPlacement': 'INSTRUCTIONAL_PASS', 'installationSweep': 'NOT_CLAIMED', 'collisionFreeInstallPath': 'NOT_CLAIMED',
          'physicalFit': 'NOT_CLAIMED', 'threadEngagement': 'NOT_CLAIMED', 'fullSteeringTravel': 'NOT_CLAIMED'}
MOTION = {'mode': 'STATIC_FINAL_WITH_NONPHYSICAL_STAGED_APPROACH', 'stagedApproach': 'PRESENTATION_ONLY',
          'installationSweep': 'NOT_CLAIMED', 'collisionFreeInstallPath': 'NOT_CLAIMED'}
LIMITATIONS = [
    'Instructional presentation placement only; no engineering datum, measurement, interface or runtime admission',
    'Staged approach is a nonphysical exploded presentation; no installation sweep or collision-free path is claimed',
    'Scoped overlaps are omitted thread/bore proxy detail or approximate-hole clearance, not physical fit or engagement']
M6_PLATES = 'docs/implementation/evidence/m6/amendment-shapes-04/candidate-artifacts/'
TOUCH_MM = 1e-6
OVERLAP_MM3 = 1e-7


def surface_area(shape):
    b = shape.BoundingBox()
    return 2 * (b.xlen * b.ylen + b.xlen * b.zlen + b.ylen * b.zlen)


def inset_overlap(box_shape, other, depth):
    """Volume of the other solid inside a box proxy shrunk by depth on every side; zero proves interference of at most depth."""
    b = box_shape.BoundingBox()
    require(abs(float(box_shape.Volume()) - b.xlen * b.ylen * b.zlen) < 1e-6, 'BOX_PROXY_REQUIRED_FOR_INSET')
    inset = cq.Solid.makeBox(b.xlen - 2 * depth, b.ylen - 2 * depth, b.zlen - 2 * depth, cq.Vector(b.xmin + depth, b.ymin + depth, b.zmin + depth))
    return float(inset.intersect(other).Volume())


def boxes_apart(a, b):
    p, q = a.BoundingBox(), b.BoundingBox()
    return p.xmax < q.xmin or q.xmax < p.xmin or p.ymax < q.ymin or q.ymax < p.ymin or p.zmax < q.zmin or q.zmax < p.zmin


def artifact_path(definition_id, root, artifacts, boards, engagement):
    if '-PLATE-' in definition_id:
        return purchased_artifact(root, definition_id)
    adopted = {a['definitionId']: a for a in load(root / PRESENTATION / 'adopted-artifacts.json')['artifacts']}
    if definition_id in adopted:
        folder = {'PX-V40-DEF-PI5': artifacts, 'PX-V40-DEF-ZERO2W': boards, 'PX-V40-DEF-ROBOT-HAT': engagement}[definition_id]
        path = folder / adopted[definition_id]['artifactName']
        require(digest(folder, adopted[definition_id]['artifactName']) == {'path': adopted[definition_id]['artifactName'],
                'rawSha256': adopted[definition_id]['rawSha256'], 'bytes': adopted[definition_id]['bytes']}, 'ADOPTED_ARTIFACT_BYTES')
        return path
    return purchased_artifact(root, definition_id)


def accepted_boundaries(root, variant, graph, number):
    prefixes = load(root / f'digital-twin/validation/m2/{variant}/expected-prefixes.json')['prefixes']
    before = sum(len(s['operationIds']) for s in graph['steps'][:number - 1])
    after = before + len(graph['steps'][number - 1]['operationIds'])
    return prefixes[before]['stateHash'], prefixes[after]['stateHash']


def moved_in_order(graph, step, fresh):
    introduced = set(step['introducedInstanceIds'])
    order = []
    for op in graph['operations']:
        if op['id'] in step['operationIds']:
            names = [a['instanceId'] for a in op.get('parentAssignments', [])]
            if op['kind'] == 'installFastener':
                names.append(op['payload']['fastenerInstanceId'])
            order.extend(n for n in names if n in fresh and n not in order)
    return order


def verify(root, closure, solutions, boards, engagement, artifacts, previous=None, usb=None, camera=None, source_root=None, steps=None):
    require(set(closure) == FIELDS, 'CLOSED_CLOSURE_RECORD')
    scope = load(root / PRESENTATION / 'product-scope.json')
    variant, number = closure['variantId'], closure['printedNumber']
    require(variant in scope['activeProductVariants'], 'PRESERVED_NON_TARGET_OR_UNSUPPORTED_VARIANT')
    require(closure['id'] == f'PX-M7-CLOSURE-{variant}-S{number:02d}-01' and closure['revision'] == 1 and closure['track'] == 'instructional-only', 'CLOSURE_IDENTITY')
    require(closure['engineeringAdmission'] is False and closure['runtimeAdmission'] is False, 'ENGINEERING_FIREWALL')
    require(closure['basis'] == 'RH-XFORWARD-YLEFT-ZUP' and closure['unit'] == 'mm' and closure['numericType'] == 'float64' and closure['scale'] == [1, 1, 1], 'BASIS_UNIT_SCALE')
    require(closure['claims'] == CLAIMS and closure['motion'] == MOTION, 'UNTESTED_CLAIM_OR_MOTION_PROMOTION')
    # exactSemanticOwnership: accepted M2 graph, reducer replay and prefix hashes.
    graph = load(root / f'digital-twin/validation/m2/{variant}/compiled-graph.json')
    step = graph['steps'][number - 1]
    require(closure['stepId'] == step['id'] and closure['graphHash'] == graph['graphHash'] and closure['modelHash'] == graph['modelHash'], 'GRAPH_MODEL_BINDING')
    require(closure['operationIds'] == step['operationIds'] and closure['introducedInstanceIds'] == step['introducedInstanceIds'], 'OPERATION_OR_INTRODUCTION_OWNERSHIP')
    dispositions = load(root / PRESENTATION / 'step-dispositions.json')['variants'][variant]
    require(dispositions['graphHash'] == graph['graphHash'], 'DISPOSITION_GRAPH_BINDING')
    row = dispositions['steps'][number - 1]
    before_hash, after_hash = accepted_boundaries(root, variant, graph, number)
    require(row['beforeStateHash'] == closure['beforeStateHash'] == before_hash and row['afterStateHash'] == closure['afterStateHash'] == after_hash, 'ACCEPTED_STATE_HASH_BINDING')
    definitions = load(root / 'digital-twin/validation/expected/m5/instructional-parameters.json')['definitions']
    parameters = {d['definitionId']: d['recipe'] for d in definitions}
    values = {d['definitionId']: {a['name']: a['value'] for a in d['instructionalApproximations']} for d in definitions}
    definition_of = {i['id']: i['definitionId'] for i in graph['instances']}
    kinds = {i: parameters.get(definition_of[i], 'plate') for i in definition_of}
    installed = sorted(d['instanceId'] for d in row['dispositions'] if d['location'] == 'assembly')
    solid = [i for i in installed if kinds[i] not in ('schematic', 'abstract')]
    require(closure['zeroSolidInstanceIds'] == [i for i in installed if i not in solid], 'ZERO_SOLID_ACCOUNTING')
    placed_ids = [p['instanceId'] for p in closure['placements']]
    require(len(placed_ids) == len(set(placed_ids)), 'DUPLICATE_PHYSICAL_INSTANCE')
    require(sorted(placed_ids) == solid, 'MISSING_OR_INVENTED_INSTANCE')
    require(closure['before'] == [{'instanceId': i, 'location': 'available', 'pose': None, 'reason': 'Unstaged stock has no installed or implicit identity transform'}
                                  for i in sorted(step['introducedInstanceIds'])], 'BEFORE_STATE_OR_IDENTITY_FALLBACK')
    # properRigidTransforms (finite float64, proper, orthonormal; scale fixed above).
    poses = {p['instanceId']: p for p in closure['placements']}
    transforms = {i: rigid(p) for i, p in poses.items()}
    if previous is not None:
        for p in previous['placements']:
            require(poses.get(p['instanceId']) == p, 'CONTEXT_DRIFT')
    # Independent source direction and feature residuals come from the step's own oracle on its upstream record.
    oracle = step_oracle(root, variant, number, solutions, boards, engagement, artifacts, usb, camera, source_root, previous, steps)
    for ident, pose in oracle['poses'].items():
        require(poses.get(ident) == pose, 'PLACEMENT_DIFFERS_FROM_INDEPENDENTLY_VERIFIED_POSE')
    require(set(poses) == oracle['covers'], 'UNVERIFIED_PLACEMENT')
    # Actual solids.
    shapes = {}
    for ident in solid:
        shape = cq.Shape.importBrep(str(artifact_path(definition_of[ident], root, artifacts, boards, engagement)))
        require(BRepCheck_Analyzer(shape.wrapped).IsValid() and shape.Volume() > 0, 'VALID_ACTUAL_SOLID')
        r, t = transforms[ident]
        shapes[ident] = placed(shape, r, t)
    # contactClassification: re-measured, scoped to graph stacks, no global exemption.
    ops = {o for s in graph['steps'][:number] for o in s['operationIds']}
    connections = [c for c in graph['mechanicalConnections'] if c['activationOperationId'] in ops]
    related = {}
    for c in connections:
        members = sorted({s['instanceId'] for s in c['orderedContactStack']})
        for a, b in itertools.combinations(members, 2):
            related[(a, b)] = (c['id'], 'stack')
        ends = sorted({e['instanceId'] for e in c['endpoints']})
        if not members and len(ends) == 2:
            related[tuple(ends)] = (c['id'], 'mate')

    def expected_policy(pair, source, connection):
        a, b = pair
        if source == 'stack':
            basis = 'shared ordered contact stack ' + connection
            fastener = next((p for p in (a, b) if kinds[p] in FASTENER), None)
            other = b if fastener == a else a
            if kinds[a] in THREADED and kinds[b] in THREADED:
                return 'PROXY_OVERLAP_OMITTED_DETAIL', BUDGET['PROXY_OVERLAP_OMITTED_DETAIL'], basis, 0.0
            if fastener is not None and kinds[other] in BORELESS:
                v = values[definition_of[fastener]]
                return 'PROXY_OVERLAP_OMITTED_BORE', math.pi * (v['diameter'] / 2) ** 2 * v['length' if kinds[fastener] == 'screw' else 'stemLength'], basis, 0.0
            return 'UNRESOLVED_CLEARANCE', BUDGET['UNRESOLVED_CLEARANCE'], basis, 0.0
        if {kinds[a], kinds[b]} == {'battery', 'plate'}:
            battery = a if kinds[a] == 'battery' else b
            return 'APPROXIMATE_TRACE_INTERFERENCE', INTERFERENCE_MM * surface_area(shapes[battery]), 'declared two-endpoint connection ' + connection, INTERFERENCE_MM
        require({kinds[a], kinds[b]} == {'connector', 'board'}, 'MATE_NOT_PLUG_AND_BOARD')
        plug = a if kinds[a] == 'connector' else b
        far_end = max(cq.Shape.importBrep(str(artifact_path(definition_of[plug], root, artifacts, boards, engagement))).Solids(), key=lambda s: s.BoundingBox().xmax)
        return 'PROXY_OVERLAP_OMITTED_SOCKET_CAVITY', float(far_end.Volume()), 'declared two-endpoint connection ' + connection, 0.0
    measured, forbidden, pair_checks = {}, [], 0
    for a, b in itertools.combinations(sorted(shapes), 2):
        pair_checks += 1
        if boxes_apart(shapes[a], shapes[b]):
            continue
        volume = float(shapes[a].intersect(shapes[b]).Volume())
        if volume > OVERLAP_MM3:
            measured[(a, b)] = volume
    allowed, unresolved = [], []
    declared, declared_gaps = {}, {}
    for entry in closure['contactPolicy']:
        require(set(entry) == POLICY_FIELDS and entry['category'] in CATEGORIES and len(entry['instances']) == 2, 'CLOSED_CONTACT_POLICY')
        pair = tuple(entry['instances'])
        require(pair in related and pair not in declared and pair not in declared_gaps, 'GLOBAL_OR_UNSCOPED_CONTACT_EXEMPTION')
        if entry['category'] == GAP_CATEGORY:
            # A declared stock-height gap: scoped to two members of one ordered stack, bounded, and carrying no overlap allowance.
            require(related[pair][1] == 'stack' and entry['maximumOverlapMm3'] == 0 and entry['maximumGapMm'] == GAP_BUDGET_MM and entry['maximumPenetrationMm'] == 0
                    and entry['basis'] == 'shared ordered contact stack ' + related[pair][0], 'INFLATED_OR_UNJUSTIFIED_BUDGET')
            declared_gaps[pair] = entry
            continue
        category, budget, basis, penetration = expected_policy(pair, related[pair][1], related[pair][0])
        require(entry['category'] == category, 'MISCLASSIFIED_CONTACT')
        require(abs(entry['maximumOverlapMm3'] - budget) <= 1e-9 and entry['basis'] == basis and entry['maximumGapMm'] == 0
                and entry['maximumPenetrationMm'] == penetration, 'INFLATED_OR_UNJUSTIFIED_BUDGET')
        declared[pair] = entry
    for pair, volume in measured.items():
        entry = declared.get(pair)
        if entry is None or volume > entry['maximumOverlapMm3'] * (1 + 1e-9) + 1e-9:
            forbidden.append({'instances': list(pair), 'volumeMm3': volume})
            continue
        if entry['category'] == 'APPROXIMATE_TRACE_INTERFERENCE':
            # The proxy box shrunk by the declared depth must clear the other solid entirely.
            battery = pair[0] if kinds[pair[0]] == 'battery' else pair[1]
            other = pair[1] if battery == pair[0] else pair[0]
            if inset_overlap(shapes[battery], shapes[other], entry['maximumPenetrationMm']) > OVERLAP_MM3:
                forbidden.append({'instances': list(pair), 'volumeMm3': volume, 'reason': 'INTERFERENCE_DEEPER_THAN_BOUND'})
                continue
        (allowed if entry['category'] != 'UNRESOLVED_CLEARANCE' else unresolved).append({'instances': list(pair), 'volumeMm3': volume, 'category': entry['category']})
    require(not forbidden, 'FORBIDDEN_PRESENTATION_PENETRATION ' + str(forbidden))
    require(set(declared) == set(measured), 'POLICY_ENTRY_WITHOUT_MEASURED_OVERLAP')
    # Intended contact: every adjacent pair of every activated ordered stack touches or overlaps.
    stack_contacts, measured_gaps = [], set()
    for c in connections:
        names = [s['instanceId'] for s in c['orderedContactStack']]
        ends = sorted({e['instanceId'] for e in c['endpoints']})
        if not names and len(ends) == 2:
            names = ends
        for a, b in zip(names, names[1:]):
            if a == b:
                continue
            if a not in shapes or b not in shapes:
                continue  # a zero-solid abstraction or a part still in the tray has no solid to touch
            gap = float(shapes[a].distance(shapes[b]))
            if gap > TOUCH_MM:
                entry = declared_gaps.get(tuple(sorted((a, b))))
                require(entry is not None and gap <= entry['maximumGapMm'] * (1 + 1e-9) + 1e-9, f'STACK_MEMBERS_NOT_IN_CONTACT {c["id"]} {a} {b} gap={gap}')
                measured_gaps.add(tuple(sorted((a, b))))
            stack_contacts.append({'connectionId': c['id'], 'instances': [a, b], 'gapMm': gap})
    require(set(declared_gaps) == measured_gaps, 'POLICY_ENTRY_WITHOUT_MEASURED_GAP')
    # intendedDOF.
    expected_dof = sorted({d for c in connections for d in c['remainingDOF']})
    require(closure['dof']['remainingDOF'] == expected_dof and all(c['jointType'] == 'fixed' for c in connections) == (expected_dof == []), 'UNDECLARED_DOF_OR_DRIFT')
    # explicitMotionCapability: staged approach per moved instance, clear of earlier context, no claim.
    placed_before = {p['instanceId'] for p in previous['placements']} if previous is not None else set()
    fresh = {i for i in solid if i not in placed_before}
    order = [i for i in moved_in_order(graph, step, fresh) if i not in closure['anchors']]
    require([r['instanceId'] for r in closure['recipes']] == order, 'RECIPE_OWNERSHIP_OR_ORDER')
    context = [i for i in solid if i not in fresh or i in closure['anchors']]
    staged_clearance = []
    for recipe in closure['recipes']:
        require(set(recipe) == RECIPE_FIELDS and recipe['stagingOnly'] is True and recipe['installationSweep'] == 'NOT_CLAIMED', 'RECIPE_CLAIM_OR_FIELDS')
        ident = recipe['instanceId']
        axis = np.array(recipe['approachAxis'], dtype=np.float64)
        require(abs(np.linalg.norm(axis) - 1) < 1e-12 and recipe['approachDistanceMm'] >= 1, 'APPROACH_AXIS_OR_DISTANCE')
        sr, st = rigid(recipe['stagedStart'])
        r, t = transforms[ident]
        require(np.max(np.abs(sr - r)) < 1e-10 and np.max(np.abs(st - (t - axis * recipe['approachDistanceMm']))) < 1e-9, 'STAGED_START_NOT_FINAL_MINUS_APPROACH')
        require(recipe['stagedStart']['instanceId'] == ident and recipe['anchor']['instanceId'] in solid, 'RECIPE_ANCHOR')
        staged_shape = placed(cq.Shape.importBrep(str(artifact_path(definition_of[ident], root, artifacts, boards, engagement))), sr, st)
        for other in context:
            if boxes_apart(staged_shape, shapes[other]):
                continue
            volume = float(staged_shape.intersect(shapes[other]).Volume())
            require(volume <= OVERLAP_MM3, f'STAGED_START_OVERLAPS_CONTEXT {ident} {other} {volume}')
        staged_clearance.append({'instanceId': ident, 'contextSolids': len(context), 'stagedOverlapMm3': 0.})
        context.append(ident)
    # Cable ends: the active set is re-derived from the accepted graph; every connection this step touches needs a verified frame.
    done = {o for s in graph['steps'][:number] for o in s['operationIds']}
    this_step = set(step['operationIds'])
    cables = {c['id']: c for c in graph['cableConnections']}

    def deactivated(c, ops):
        return c['deactivationOperationRef'].get('state') == 'known' and c['deactivationOperationRef']['ref'] in ops
    active = sorted(i for i, c in cables.items() if c['activationOperationId'] in done and not deactivated(c, done))
    touched = {i for i, c in cables.items() if c['activationOperationId'] in this_step or deactivated(c, this_step)}
    framed = {}
    for entry in closure['endpointFrames']:
        require(set(entry) == FRAME_ENTRY_FIELDS, 'CLOSED_ENDPOINT_FRAME')
        require(entry['connectionId'] in active and entry['connectionId'] not in framed, 'FRAME_FOR_INACTIVE_OR_UNKNOWN_CONNECTION')
        c = cables[entry['connectionId']]
        require(entry['cableInstanceId'] == c['cableInstanceId'] and entry['endpointLabel'] == c['endpointLabel'] and entry['targetInstanceId'] == c['targetInstanceId']
                and entry['connectionPointId'] == c['connectionPointId'], 'EXACT_SEMANTIC_OWNERSHIP')
        framed[entry['connectionId']] = entry
    unframed = [i for i in active if i not in framed]
    open_ends = sorted(set(unframed) & touched)
    expected_blockers = [{'id': 'UNFRAMED_TOUCHED_CABLE_END', 'connectionIds': open_ends}] if open_ends else []
    require(closure['status'] == ('BLOCKED' if expected_blockers else 'COMPLETE'), 'COMPLETE_CLAIM_WITH_UNFRAMED_CABLE_END ' + ', '.join(open_ends))
    require(closure['blockers'] == expected_blockers, 'BLOCKERS_NOT_RE_DERIVED')
    require(closure['carriedUnframedConnectionIds'] == unframed and [e['connectionId'] for e in closure['endpointFrames']] == sorted(framed), 'UNFRAMED_CONNECTION_LIST')
    carried = {e['connectionId']: e for e in (previous['endpointFrames'] if previous is not None else [])}
    for connection_id, entry in carried.items():
        if connection_id in active:
            require(framed.get(connection_id) == entry, 'ENDPOINT_FRAME_DRIFT')
    for connection_id, entry in framed.items():
        if connection_id in carried:
            continue
        require(connection_id in touched, 'UNVERIFIED_ENDPOINT_FRAME')
        require(oracle['frames'].get(connection_id) == entry, 'ENDPOINT_FRAME_DIFFERS_FROM_INDEPENDENTLY_VERIFIED')
        point = cq.Vector(*[float(v) for v in entry['approach']['stagedOriginMm']])
        require(not any(s.isInside(point, 1e-7) for shape in shapes.values() for s in shape.Solids()), 'STAGED_ORIGIN_INSIDE_SOLID')
    # Limitations and bindings.
    inherited = previous['sourceLimitations'] if previous is not None else []
    require(number == 1 or previous is not None, 'PREVIOUS_CLOSURE_REQUIRED')
    for text in LIMITATIONS + oracle['limitations'] + inherited:
        require(text in closure['sourceLimitations'], 'LIMITATION_REMOVAL')
    for binding in closure['inputBindings']:
        folder = {'-S01.json': solutions, '-S02-board.json': boards, '-S02-uppers.json': engagement, '-S02-usb-microphone.json': usb, '-S03-camera.json': camera}
        base = steps if re.search(r'-S\d\d-record\.json$', binding['path']) else next((v for k, v in folder.items() if binding['path'].endswith(k)), root)
        require(binding == digest(base, binding['path']), 'INPUT_BYTES_CHANGED')
    complete = closure['status'] == 'COMPLETE'
    return {'status': 'PASS' if complete else 'BLOCKED', 'instructionalStatus': 'INSTRUCTIONAL_ADMITTED' if complete else 'BLOCKED', 'blockers': closure['blockers'],
            'variantId': variant, 'printedNumber': number,
            'closureId': closure['id'], 'closureRfc8785Sha256': hashlib.sha256(rfc8785.dumps(closure)).hexdigest(),
            'checks': REQUIRED_CHECKS, 'solidInstanceCount': len(shapes), 'pairChecks': pair_checks, 'allowedOverlaps': allowed,
            'unresolvedClearances': unresolved, 'forbiddenPenetrations': [], 'stackContacts': stack_contacts,
            'stagedClearance': staged_clearance, 'stepOracle': oracle['summary'], 'remainingDOF': closure['dof']['remainingDOF'],
            'endpointFrameConnectionIds': sorted(framed), 'carriedUnframedConnectionIds': unframed,
            'physicalFit': 'NOT_CLAIMED', 'installationSweep': 'NOT_CLAIMED', 'engineeringAdmission': False, 'runtimeAdmission': False}


def step_oracle(root, variant, number, solutions, boards, engagement, artifacts, usb=None, camera=None, source_root=None, previous=None, steps=None):
    if number == 1:
        record = load(solutions / (variant + '-S01.json'))
        summary = anchor_verify.verify(root, record)
        return {'poses': {p['instanceId']: p for p in record['after']}, 'covers': {p['instanceId'] for p in record['after']},
                'limitations': record['sourceLimitations'], 'summary': {'oracle': 'anchor_verify', 'pairChecks': summary['pairChecks'], 'residuals': len(summary['residuals'])}}
    if number == 2:
        record = load(engagement / (variant + '-S02-uppers.json'))
        summary = engagement_verify.supports(root, solutions, artifacts, boards, record)
        placed_after = {p['instanceId']: p for p in record['after'] if 'rotation' in p}
        limitations, parts = list(record['sourceLimitations']), {'oracle': 'engagement_verify.supports', 'pairChecks': summary['pairChecks'], 'residuals': len(summary['residuals'])}
        if variant == 'rpi5' and usb is not None and (usb / 'rpi5-S02-usb-microphone.json').exists():
            mic = load(usb / 'rpi5-S02-usb-microphone.json')
            observed = usb_verify.verify(root, mic, boards, artifacts)
            placed_after[mic['instanceId']] = mic['pose']
            limitations += mic['limitations']
            parts['microphone'] = {'oracle': 'usb_verify', 'plugDepthMm': observed['plugDepthMm'], 'openingCenterResidualMm': observed['openingCenterResidualMm']}
        return {'poses': placed_after, 'covers': set(placed_after), 'limitations': limitations, 'summary': parts}
    if number == 3:
        require(previous is not None, 'PREVIOUS_CLOSURE_REQUIRED')
        poses = {p['instanceId']: p for p in previous['placements']}
        frames = {}
        file = camera / (variant + '-S03-camera.json') if camera is not None else None
        if file is not None and file.exists():
            require(source_root is not None, 'SOURCE_REQUIRED')
            record = load(file)
            observed = camera_verify.verify(root, record, boards, artifacts, source_root)
            frames[record['connectionId']] = {'connectionId': record['connectionId'], 'cableInstanceId': record['cableInstanceId'], 'endpointLabel': record['endpointLabel'],
                                              'targetInstanceId': record['targetInstanceId'], 'connectionPointId': record['connectionPointId'],
                                              'frame': record['endpointFrame'], 'approach': record['approach'], 'selection': record['selection']}
            return {'poses': poses, 'covers': set(poses), 'limitations': record['limitations'], 'frames': frames,
                    'summary': {'oracle': 'camera_verify', 'residualMm': observed['residualMm'], 'source': observed['source']}}
        return {'poses': poses, 'covers': set(poses), 'limitations': [], 'frames': frames, 'summary': {'oracle': 'camera_verify', 'status': 'NO_CAMERA_RECORD'}}
    if number in RECORD_VERIFIERS:
        require(previous is not None, 'PREVIOUS_CLOSURE_REQUIRED')
        poses = {p['instanceId']: p for p in previous['placements']}
        file = steps / f'{variant}-S{number:02d}-record.json' if steps is not None else None
        if file is not None and file.exists():
            record = load(file)
            context = {'engagement': engagement, 'artifacts': artifacts, 'boards': boards, 'source_root': source_root}
            observed = RECORD_VERIFIERS[number](root, record, previous, context)
            poses.update({p['instanceId']: p for p in record['placements']})
            frames = {f['connectionId']: f for f in record.get('endpointFrames', [])}
            return {'poses': poses, 'covers': set(poses), 'limitations': record['limitations'], 'frames': frames, 'summary': {'oracle': f'step{number:02d}', **observed}}
        return {'poses': poses, 'covers': set(poses), 'limitations': [], 'frames': {}, 'summary': {'oracle': f'step{number:02d}', 'status': 'NO_STEP_RECORD'}}
    raise Invalid('STEP_ORACLE_NOT_IMPLEMENTED')


def _hat(root, record, previous, context):
    observed = hat_verify.verify(root, record, previous, context['engagement'], context['artifacts'], context['boards'])
    return {'hatBottomMm': observed['hatBottomMm'], 'gaps': observed['gaps'], 'socketHeaderGapMm': observed['socketHeaderGapMm']}


def _step05(root, record, previous, context):
    observed = step05_verify.verify(root, record, previous, context)
    return {'motors': observed['motors'], 'stacks': observed['stacks']}


# Every step after S03 is verified by its own independent module through one uniform record convention.
RECORD_VERIFIERS = {4: _hat, 5: _step05, 6: lambda root, record, previous, context: step06_verify.verify(root, record, previous, context),
                    7: lambda root, record, previous, context: step07_verify.verify(root, record, previous, context),
                    8: lambda root, record, previous, context: step08_verify.verify(root, record, previous, context),
                    9: lambda root, record, previous, context: step09_verify.verify(root, record, previous, context)}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    for name in ['root', 'closures', 'solutions', 'boards', 'engagement', 'artifacts', 'output']:
        parser.add_argument('--' + name, required=True, type=Path)
    for name in ['usb', 'camera', 'steps', 'source-root']:
        parser.add_argument('--' + name, type=Path, default=None)
    args = parser.parse_args()
    results, previous = [], {}
    for path in sorted(args.closures.glob('*-closure.json')):
        record = load(path)
        key = (record['variantId'], record['printedNumber'])
        results.append(verify(args.root, record, args.solutions, args.boards, args.engagement, args.artifacts, previous.get((key[0], key[1] - 1)),
                              args.usb, args.camera, args.source_root, args.steps))
        previous[key] = record
    args.output.write_bytes(rfc8785.dumps({'status': 'PASS', 'scope': 'Independently re-measured instructional step closures', 'results': results,
                                           'blocked': sorted(p.name for p in args.closures.glob('*-blocked.json')), 'engineeringAdmission': False}) + b'\n')


if __name__ == '__main__':
    main()
