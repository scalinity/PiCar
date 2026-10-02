"""Uniform instructional step closures composed from step placement records.

Presentation only: no engineering datum, fit, sweep or runtime admission. The independent
re-measurement lives in closure_verify.py, which never imports this module.
"""
import argparse
import math
import itertools
from pathlib import Path
import cadquery as cq
import numpy as np
import rfc8785
from ...contracts import load, Invalid
from .verify import require, digest, rigid, placed, purchased_artifact

PRESENTATION = 'digital-twin/assemblies/v40/presentation/instructional'
MODULE = 'digital-twin/cad/twin_cad/assemblies/instructional/closure.py'
ORACLE = 'digital-twin/cad/twin_cad/assemblies/instructional/closure_verify.py'
M6_PLATES = 'docs/implementation/evidence/m6/amendment-shapes-04/candidate-artifacts/'
M5_ARTIFACTS = 'digital-twin/validation/expected/m5/instructional-artifacts/'
THREADED = {'screw', 'standoff', 'nut'}
FASTENER = {'screw', 'rivet'}
BORELESS = {'motor', 'battery'}  # proxy bodies authored without mounting bores
BUDGET_MM3 = {'PROXY_OVERLAP_OMITTED_DETAIL': 22., 'UNRESOLVED_CLEARANCE': 8.}
GAP_CATEGORY = 'APPROXIMATE_HEIGHT_GAP'
GAP_BUDGET_MM = 1.0
TOUCH_MM = 1e-6
INTERFERENCE_MM = 2.0
CLAIMS = {'staticPlacement': 'INSTRUCTIONAL_PASS', 'installationSweep': 'NOT_CLAIMED', 'collisionFreeInstallPath': 'NOT_CLAIMED',
          'physicalFit': 'NOT_CLAIMED', 'threadEngagement': 'NOT_CLAIMED', 'fullSteeringTravel': 'NOT_CLAIMED'}
MOTION = {'mode': 'STATIC_FINAL_WITH_NONPHYSICAL_STAGED_APPROACH', 'stagedApproach': 'PRESENTATION_ONLY',
          'installationSweep': 'NOT_CLAIMED', 'collisionFreeInstallPath': 'NOT_CLAIMED'}
CLOSURE_LIMITATIONS = [
    'Instructional presentation placement only; no engineering datum, measurement, interface or runtime admission',
    'Staged approach is a nonphysical exploded presentation; no installation sweep or collision-free path is claimed',
    'Scoped overlaps are omitted thread/bore proxy detail or approximate-hole clearance, not physical fit or engagement']


def shape_path(definition_id, dirs):
    """Resolve the exact adopted artifact for a definition; revised boards come only from their scoped adoption."""
    if '-PLATE-' in definition_id:
        return purchased_artifact(dirs['root'], definition_id)
    if definition_id == 'PX-V40-DEF-PI5':
        return dirs['artifacts'] / 'PX-V40-DEF-PI5-INSTRUCTIONAL-02.brep'
    if definition_id == 'PX-V40-DEF-ZERO2W':
        return dirs['boards'] / 'PX-V40-DEF-ZERO2W-INSTRUCTIONAL-02.brep'
    return purchased_artifact(dirs['root'], definition_id)


def install_order(graph, step, fresh):
    introduced = set(step['introducedInstanceIds'])
    order = []
    for op in graph['operations']:
        if op['id'] not in step['operationIds']:
            continue
        ids = [a['instanceId'] for a in op.get('parentAssignments', [])]
        if op['kind'] == 'installFastener':
            ids.append(op['payload']['fastenerInstanceId'])
        order.extend(i for i in ids if i in fresh and i not in order)
    return order


def stacks_through(graph, number):
    """Ordered contact stacks of every mechanical connection activated by printed step <= number."""
    ops = {o for s in graph['steps'][:number] for o in s['operationIds']}
    return [c for c in graph['mechanicalConnections'] if c['activationOperationId'] in ops]


def surface_area(shape):
    b = shape.BoundingBox()
    return 2 * (b.xlen * b.ylen + b.xlen * b.zlen + b.ylen * b.zlen)


def inset_overlap(box_shape, other, depth):
    """Volume of the other solid inside a box-shaped proxy shrunk by depth on every side (0 means interference <= depth)."""
    b = box_shape.BoundingBox()
    require(abs(float(box_shape.Volume()) - b.xlen * b.ylen * b.zlen) < 1e-6, 'BOX_PROXY_REQUIRED_FOR_INSET')
    inset = cq.Solid.makeBox(b.xlen - 2 * depth, b.ylen - 2 * depth, b.zlen - 2 * depth, cq.Vector(b.xmin + depth, b.ymin + depth, b.zmin + depth))
    return float(inset.intersect(other).Volume())


def relations(graph, number):
    """Pairs that may legitimately overlap: members of one ordered fastener stack, or the two ends of a stackless mate."""
    related = {}
    for c in stacks_through(graph, number):
        members = sorted({s['instanceId'] for s in c['orderedContactStack']})
        for a, b in itertools.combinations(members, 2):
            related[(a, b)] = (c['id'], 'stack')
        ends = sorted({e['instanceId'] for e in c['endpoints']})
        if not members and len(ends) == 2:
            related[tuple(ends)] = (c['id'], 'mate')
    return related


def insertion_volume(path):
    """Volume of the solid at the far end of a plug's long axis; the most a socket-cavity overlap can be."""
    solid = max(cq.Shape.importBrep(str(path)).Solids(), key=lambda s: s.BoundingBox().xmax)
    return float(solid.Volume())


def measure(shapes, graph, number, kinds, plugs, shanks):
    """Whole-context overlap classification; anything outside a declared relation is a forbidden penetration."""
    related = relations(graph, number)
    policy, forbidden = [], []
    for a, b in itertools.combinations(sorted(shapes), 2):
        sa, sb = shapes[a], shapes[b]
        ba, bb = sa.BoundingBox(), sb.BoundingBox()
        if (ba.xmax < bb.xmin or bb.xmax < ba.xmin or ba.ymax < bb.ymin or bb.ymax < ba.ymin or ba.zmax < bb.zmin or bb.zmax < ba.zmin):
            continue
        volume = float(sa.intersect(sb).Volume())
        if volume <= 1e-7:
            continue
        if (a, b) not in related:
            forbidden.append({'instances': [a, b], 'volumeMm3': volume})
            continue
        connection, source = related[(a, b)]
        penetration = 0.0
        if source == 'mate':
            plug = next((p for p in (a, b) if kinds[p] == 'connector'), None)
            if {kinds[a], kinds[b]} == {'battery', 'plate'}:
                # Traced plate geometry versus the authored battery envelope: interference is allowed only if it is at most
                # INTERFERENCE_MM deep, proved by the envelope shrunk by that depth clearing the plate completely.
                battery = a if kinds[a] == 'battery' else b
                plate = b if battery == a else a
                if inset_overlap(shapes[battery], shapes[plate], INTERFERENCE_MM) > 1e-7:
                    forbidden.append({'instances': [a, b], 'volumeMm3': volume, 'reason': 'INTERFERENCE_DEEPER_THAN_BOUND'})
                    continue
                category, budget, basis = 'APPROXIMATE_TRACE_INTERFERENCE', INTERFERENCE_MM * surface_area(shapes[battery]), 'declared two-endpoint connection ' + connection
                penetration = INTERFERENCE_MM
            elif plug is None or {kinds[a], kinds[b]} != {'connector', 'board'}:
                forbidden.append({'instances': [a, b], 'volumeMm3': volume, 'reason': 'MATE_NOT_PLUG_AND_BOARD'})
                continue
            else:
                category, budget, basis = 'PROXY_OVERLAP_OMITTED_SOCKET_CAVITY', plugs[plug], 'declared two-endpoint connection ' + connection
        else:
            fastener = next((p for p in (a, b) if kinds[p] in FASTENER), None)
            other = b if fastener == a else a
            if kinds[a] in THREADED and kinds[b] in THREADED:
                category = 'PROXY_OVERLAP_OMITTED_DETAIL'
                budget = BUDGET_MM3[category]
            elif fastener is not None and kinds[other] in BORELESS:
                # A shank through a proxy body that carries no mounting bore: bounded by the shank's own volume.
                category, budget = 'PROXY_OVERLAP_OMITTED_BORE', shanks[fastener]
            else:
                category = 'UNRESOLVED_CLEARANCE'
                budget = BUDGET_MM3[category]
            basis = 'shared ordered contact stack ' + connection
        if volume > budget * (1 + 1e-9) + 1e-9:
            forbidden.append({'instances': [a, b], 'volumeMm3': volume, 'reason': 'OVER_SCOPED_BUDGET'})
            continue
        policy.append({'instances': [a, b], 'category': category, 'maximumOverlapMm3': budget, 'maximumGapMm': 0.0, 'maximumPenetrationMm': penetration, 'basis': basis})
    if forbidden:
        raise Invalid('FORBIDDEN_PRESENTATION_PENETRATION ' + str(forbidden))
    # Adjacent members of one ordered stack must touch; a small stock-height gap is declared, never hidden.
    seen = set()
    for c in stacks_through(graph, number):
        names = [s['instanceId'] for s in c['orderedContactStack']]
        for a, b in zip(names, names[1:]):
            pair = tuple(sorted((a, b)))
            if a == b or pair in seen:
                continue
            seen.add(pair)
            gap = float(shapes[a].distance(shapes[b]))
            if gap > TOUCH_MM:
                if gap > GAP_BUDGET_MM:
                    raise Invalid(f'STACK_MEMBERS_NOT_IN_CONTACT {c["id"]} {a} {b} gap={gap}')
                policy.append({'instances': list(pair), 'category': GAP_CATEGORY, 'maximumOverlapMm3': 0.0, 'maximumGapMm': GAP_BUDGET_MM, 'maximumPenetrationMm': 0.0,
                               'basis': 'shared ordered contact stack ' + c['id']})
    return policy


def pose_of(entry):
    return {k: entry[k] for k in ['instanceId', 'translationMm', 'rotation', 'featureRef', 'role']}


def staged_recipe(pose, axis, distance, anchor, segments):
    r, t = rigid(pose)
    staged = {**pose_of(pose), 'translationMm': [float(v) for v in (t - np.array(axis, dtype=np.float64) * distance)]}
    return {'instanceId': pose['instanceId'], 'anchor': anchor, 'approachAxis': [float(v) for v in axis],
            'approachDistanceMm': float(distance), 'stagedStart': staged, 'segments': segments, 'stagingOnly': True,
            'installationSweep': 'NOT_CLAIMED', 'reversal': 'Digital staging reversal only; no physical undo claim'}


def from_s01(dirs, variant):
    solution = load(dirs['solutions'] / (variant + '-S01.json'))
    poses = {p['instanceId']: p for p in solution['after']}
    recipes = {}
    for old in solution['recipes']:
        final = poses[old['instanceId']]
        delta = np.array(old['stagedStart']['translationMm']) - np.array(final['translationMm'])
        distance = float(np.linalg.norm(delta))
        recipes[old['instanceId']] = staged_recipe(final, -delta / distance, distance, old['anchor'], old['segments'])
    return {'poses': poses, 'recipes': recipes, 'record': solution, 'limitations': solution['sourceLimitations'],
            'flags': solution['approximationFlags'], 'anchors': ['PX-V40-INS-PLATE-A-001'],
            'inputs': [(dirs['solutions'], variant + '-S01.json')]}


def from_s02(dirs, variant, previous):
    uppers = load(dirs['engagement'] / (variant + '-S02-uppers.json'))
    board = load(dirs['boards'] / (variant + '-S02-board.json'))
    poses = {}
    for p in uppers['after']:
        if p.get('pose', 'present') is None or 'rotation' not in p:
            continue
        poses[p['instanceId']] = pose_of(p)
    recipes = {r['instanceId']: staged_recipe(poses[r['instanceId']], [0, 0, -1], 30., r['anchor'],
                                              ['align axis and roll', 'seat on named face']) for r in uppers['recipes']}
    supports = sorted({r['anchor']['instanceId'] for r in uppers['recipes']})
    board_id = board['boardPose']['instanceId']
    recipes[board_id] = staged_recipe(poses[board_id], [0, 0, -1], 30., {'instanceId': supports[0], 'localFeature': 'actualStandoff.upperBearing'},
                                      ['align mount pattern', 'seat on named face'])
    limitations, inputs = list(uppers['sourceLimitations']), [(dirs['engagement'], variant + '-S02-uppers.json'), (dirs['boards'], variant + '-S02-board.json')]
    usb_file = dirs['usb'] / (variant + '-S02-usb-microphone.json') if dirs['usb'] is not None and variant == 'rpi5' else None
    if usb_file is not None and usb_file.exists():
        mic = load(usb_file)
        poses[mic['instanceId']] = mic['pose']
        recipes[mic['instanceId']] = mic['recipe']
        limitations += mic['limitations']
        inputs.append((dirs['usb'], usb_file.name))
    return {'poses': poses, 'recipes': recipes, 'record': uppers, 'limitations': limitations,
            'flags': uppers['approximationFlags'], 'anchors': [], 'inputs': inputs}


def active_cables(graph, number):
    """Cable connections connected after printed step <= number: activated and not yet deactivated by a known operation."""
    done = {o for s in graph['steps'][:number] for o in s['operationIds']}
    active = []
    for c in graph['cableConnections']:
        ref = c['deactivationOperationRef']
        if c['activationOperationId'] in done and not (ref.get('state') == 'known' and ref['ref'] in done):
            active.append(c['id'])
    return sorted(active)


def touched_cables(graph, number):
    ops = set(graph['steps'][number - 1]['operationIds'])
    return {c['id'] for c in graph['cableConnections'] if c['activationOperationId'] in ops
            or (c['deactivationOperationRef'].get('state') == 'known' and c['deactivationOperationRef']['ref'] in ops)}


def from_s03(dirs, variant, previous):
    """No new solid: the retained ribbon is a zero-solid schematic whose connected end gets a connector frame."""
    poses = {p['instanceId']: p for p in previous['placements']}
    file = dirs['camera'] / (variant + '-S03-camera.json') if dirs['camera'] is not None else None
    if file is None or not file.exists():
        return {'poses': poses, 'recipes': {}, 'record': None, 'limitations': [], 'flags': previous['approximationFlags'], 'anchors': [], 'inputs': [], 'frames': []}
    record = load(file)
    frame = {'connectionId': record['connectionId'], 'cableInstanceId': record['cableInstanceId'], 'endpointLabel': record['endpointLabel'],
             'targetInstanceId': record['targetInstanceId'], 'connectionPointId': record['connectionPointId'], 'frame': record['endpointFrame'],
             'approach': record['approach'], 'selection': record['selection']}
    return {'poses': poses, 'recipes': {}, 'record': record, 'limitations': record['limitations'], 'flags': previous['approximationFlags'],
            'anchors': [], 'inputs': [(dirs['camera'], file.name)], 'frames': [frame]}


def from_record(number):
    """Uniform adapter for every step after S03: its own record (placements, recipes, optional endpoint frames) over the previous context."""
    def adapter(dirs, variant, previous):
        poses = {p['instanceId']: p for p in previous['placements']}
        file = dirs['steps'] / f'{variant}-S{number:02d}-record.json' if dirs['steps'] is not None else None
        if file is None or not file.exists():
            return {'poses': poses, 'recipes': {}, 'record': None, 'limitations': [], 'flags': previous['approximationFlags'], 'anchors': [], 'inputs': [], 'frames': []}
        record = load(file)
        poses.update({p['instanceId']: pose_of(p) for p in record['placements']})
        return {'poses': poses, 'recipes': {r['instanceId']: r for r in record['recipes']}, 'record': record, 'limitations': record['limitations'],
                'flags': previous['approximationFlags'], 'anchors': [], 'inputs': [(dirs['steps'], file.name)], 'frames': record.get('endpointFrames', [])}
    return adapter


ADAPTERS = {1: lambda d, v, p: from_s01(d, v), 2: from_s02, 3: from_s03, 4: from_record(4), 5: from_record(5), 6: from_record(6), 7: from_record(7), 8: from_record(8), 9: from_record(9)}


def build(root, variant, number, solutions, boards, engagement, artifacts, previous=None, usb=None, camera=None, steps=None):
    scope = load(root / PRESENTATION / 'product-scope.json')
    require(variant in scope['activeProductVariants'], 'PRESERVED_NON_TARGET_OR_UNSUPPORTED_VARIANT')
    require(number in ADAPTERS, 'STEP_NOT_IMPLEMENTED')
    require(number == 1 or previous is not None, 'PREVIOUS_CLOSURE_REQUIRED')
    dirs = {'root': root, 'solutions': solutions, 'boards': boards, 'engagement': engagement, 'artifacts': artifacts, 'usb': usb, 'camera': camera, 'steps': steps}
    graph_path = f'digital-twin/validation/m2/{variant}/compiled-graph.json'
    graph = load(root / graph_path)
    step = graph['steps'][number - 1]
    disposition = load(root / PRESENTATION / 'step-dispositions.json')['variants'][variant]['steps'][number - 1]
    parameters = load(root / 'digital-twin/validation/expected/m5/instructional-parameters.json')
    kind_of_definition = {d['definitionId']: d['recipe'] for d in parameters['definitions']}
    kind_of_definition.update({'PX-V40-DEF-PLATE-A': 'plate'})
    definition_of = {i['id']: i['definitionId'] for i in graph['instances']}
    adapted = ADAPTERS[number](dirs, variant, previous)
    installed = sorted(d['instanceId'] for d in disposition['dispositions'] if d['location'] == 'assembly')
    solid = [i for i in installed if kind_of_definition.get(definition_of[i], 'plate') not in ('schematic', 'abstract')]
    missing = [i for i in solid if i not in adapted['poses']]
    if missing:
        raise Invalid('UNPLACED_INSTALLED_SOLID ' + ', '.join(missing))
    extra = sorted(set(adapted['poses']) - set(solid))
    require(not extra, 'INVENTED_PLACEMENT ' + ', '.join(extra))
    placed_before = {p['instanceId'] for p in previous['placements']} if previous else set()
    order = install_order(graph, step, {i for i in solid if i not in placed_before})
    recipes = [adapted['recipes'][i] for i in order if i not in adapted['anchors']]
    require(sorted(r['instanceId'] for r in recipes) == sorted(adapted['recipes']), 'RECIPE_OWNERSHIP')
    shapes = {}
    for i in solid:
        r, t = rigid(adapted['poses'][i])
        shapes[i] = placed(cq.Shape.importBrep(str(shape_path(definition_of[i], dirs))), r, t)
    kinds = {i: kind_of_definition.get(definition_of[i], 'plate') for i in solid}
    plugs = {i: insertion_volume(shape_path(definition_of[i], dirs)) for i in solid if kinds[i] == 'connector'}
    values = {d['definitionId']: {a['name']: a['value'] for a in d['instructionalApproximations']} for d in parameters['definitions']}
    shanks = {i: math.pi * (values[definition_of[i]]['diameter'] / 2) ** 2 * values[definition_of[i]]['length' if kinds[i] == 'screw' else 'stemLength']
              for i in solid if kinds[i] in FASTENER}
    policy = measure(shapes, graph, number, kinds, plugs, shanks)
    connections = stacks_through(graph, number)
    # Cable ends: a frame must exist for every connection this step touches; earlier unresolved ends are carried openly.
    frames = {f['connectionId']: f for f in (previous['endpointFrames'] if previous else [])}
    frames.update({f['connectionId']: f for f in adapted.get('frames', [])})
    active = set(active_cables(graph, number))
    frames = {k: v for k, v in frames.items() if k in active}
    unframed = sorted(active - set(frames))
    blocked = sorted(touched_cables(graph, number) & set(unframed))
    # A step whose own cable ends are unframed is BLOCKED but still carries its verified placements forward.
    blockers = [{'id': 'UNFRAMED_TOUCHED_CABLE_END', 'connectionIds': blocked}] if blocked else []
    inputs = [digest(root, graph_path), digest(root, PRESENTATION + '/step-dispositions.json'), digest(root, MODULE), digest(root, ORACLE),
              digest(root, 'digital-twin/validation/expected/m5/instructional-parameters.json')]
    inputs += [digest(base, name) for base, name in adapted['inputs']]
    return {'id': f'PX-M7-CLOSURE-{variant}-S{number:02d}-01', 'revision': 1, 'track': 'instructional-only', 'variantId': variant,
            'stepId': step['id'], 'printedNumber': number, 'basis': 'RH-XFORWARD-YLEFT-ZUP', 'unit': 'mm', 'numericType': 'float64',
            'graphHash': graph['graphHash'], 'modelHash': graph['modelHash'],
            'beforeStateHash': disposition['beforeStateHash'], 'afterStateHash': disposition['afterStateHash'],
            'operationIds': step['operationIds'], 'connectionIds': [c['id'] for c in connections if c['activationOperationId'] in step['operationIds']],
            'introducedInstanceIds': step['introducedInstanceIds'],
            'before': [{'instanceId': i, 'location': 'available', 'pose': None,
                        'reason': 'Unstaged stock has no installed or implicit identity transform'} for i in sorted(step['introducedInstanceIds'])],
            'scale': [1, 1, 1], 'placements': [pose_of(adapted['poses'][i]) for i in solid],
            'anchors': adapted['anchors'], 'recipes': recipes, 'contactPolicy': policy,
            'endpointFrames': [frames[k] for k in sorted(frames)], 'carriedUnframedConnectionIds': unframed,
            'status': 'BLOCKED' if blockers else 'COMPLETE', 'blockers': blockers,
            'zeroSolidInstanceIds': [i for i in installed if i not in solid],
            'dof': {'remainingDOF': [], 'semantics': 'Intended connection semantics for a rigid presentation frame; not a mechanism solve'},
            'motion': dict(MOTION), 'claims': dict(CLAIMS),
            'sourceLimitations': list(dict.fromkeys((previous['sourceLimitations'] if previous else []) + adapted['limitations'] + CLOSURE_LIMITATIONS)),
            'approximationFlags': adapted['flags'], 'inputBindings': inputs, 'engineeringBlockerIds': step['blockerIds'],
            'engineeringAdmission': False, 'runtimeAdmission': False}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    for name in ['root', 'solutions', 'boards', 'engagement', 'artifacts', 'output']:
        parser.add_argument('--' + name, required=True, type=Path)
    parser.add_argument('--usb', type=Path, default=None)
    parser.add_argument('--camera', type=Path, default=None)
    parser.add_argument('--steps', type=Path, default=None)
    args = parser.parse_args()
    args.output.mkdir(parents=True, exist_ok=False)
    scope = load(args.root / PRESENTATION / 'product-scope.json')
    for variant in scope['activeProductVariants']:
        previous = None
        for number in sorted(ADAPTERS):
            try:
                record = build(args.root, variant, number, args.solutions, args.boards, args.engagement, args.artifacts, previous, args.usb, args.camera, args.steps)
            except Invalid as error:
                (args.output / f'{variant}-S{number:02d}-blocked.json').write_bytes(rfc8785.dumps({'variantId': variant, 'printedNumber': number, 'status': 'BLOCKED', 'reason': str(error)}) + b'\n')
                break
            (args.output / f'{variant}-S{number:02d}-closure.json').write_bytes(rfc8785.dumps(record) + b'\n')
            previous = record


if __name__ == '__main__':
    main()
