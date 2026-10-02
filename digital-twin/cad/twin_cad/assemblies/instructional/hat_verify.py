"""Independent S04 HAT mount re-measurement; never imports the HAT generator."""
import argparse
from pathlib import Path
import cadquery as cq
import numpy as np
import rfc8785
from OCP.BRepCheck import BRepCheck_Analyzer
from ...contracts import load
from .verify import require, digest, rigid, placed, shape_features, purchased_artifact

PRESENTATION = 'digital-twin/assemblies/v40/presentation/instructional'
FIELDS = {'id', 'revision', 'track', 'variantId', 'stepId', 'printedNumber', 'graphHash', 'modelHash', 'placements', 'stacks', 'hatHeight', 'gapBudgetMm',
          'recipes', 'scale', 'limitations', 'claims', 'engineeringBlockerIds', 'inputBindings', 'engineeringAdmission', 'runtimeAdmission'}
RECIPE_FIELDS = {'instanceId', 'anchor', 'approachAxis', 'approachDistanceMm', 'stagedStart', 'segments', 'stagingOnly', 'installationSweep', 'reversal'}
CLAIMS = {'staticPlacement': 'INSTRUCTIONAL_PASS', 'installationSweep': 'NOT_CLAIMED', 'physicalFit': 'NOT_CLAIMED'}
HAT_FILE = 'PX-V40-DEF-ROBOT-HAT-INSTRUCTIONAL-02.brep'
M5_ARTIFACTS = 'digital-twin/validation/expected/m5/instructional-artifacts/'
BOARD_FILES = {'PX-V40-DEF-PI5': 'PX-V40-DEF-PI5-INSTRUCTIONAL-02.brep', 'PX-V40-DEF-ZERO2W': 'PX-V40-DEF-ZERO2W-INSTRUCTIONAL-02.brep'}
BOARD_WIDTH_MM = {'PX-V40-DEF-PI5': 56.0, 'PX-V40-DEF-ZERO2W': 30.0}
SCREW_ROTATION = np.diag([1., -1., -1.])
LINEAR_MM = 1e-6
GAP_BUDGET_MM = 1.0


def bounds(solid):
    b = solid.BoundingBox()
    return np.array([b.xmin, b.ymin, b.zmin, b.xmax, b.ymax, b.zmax])


def verify(root, record, previous, engagement, artifacts, boards):
    require(set(record) == FIELDS, 'CLOSED_HAT_RECORD')
    require(record['engineeringAdmission'] is False and record['runtimeAdmission'] is False, 'ENGINEERING_FIREWALL')
    require(record['claims'] == CLAIMS and all(r['stagingOnly'] is True and r['installationSweep'] == 'NOT_CLAIMED' for r in record['recipes']), 'UNTESTED_CLAIM')
    scope = load(root / PRESENTATION / 'product-scope.json')
    variant = record['variantId']
    require(variant in scope['activeProductVariants'], 'PRESERVED_NON_TARGET_OR_UNSUPPORTED_VARIANT')
    require(record['id'] == f'PX-M7-S04-HAT-{variant}-04' and record['revision'] == 4 and record['scale'] == [1, 1, 1] and record['track'] == 'instructional-only', 'HAT_IDENTITY')
    review = load(root / (PRESENTATION + '/step04-hat-review-04.json'))
    require(record['limitations'] == review['limitations'] and all(t in record['limitations'] for t in review['limitations']), 'LIMITATION_REMOVAL')
    require(record['gapBudgetMm'] == GAP_BUDGET_MM == review['gapBudgetMm'], 'HAT_GAP_BUDGET')
    for binding in record['inputBindings']:
        require(binding == digest(engagement if binding['path'] == HAT_FILE else root, binding['path']), 'INPUT_BYTES_CHANGED')
    graph = load(root / f'digital-twin/validation/m2/{variant}/compiled-graph.json')
    step = graph['steps'][3]
    require(record['graphHash'] == graph['graphHash'] and record['modelHash'] == graph['modelHash'] and record['stepId'] == step['id'], 'GRAPH_MODEL_BINDING')
    definition_of = {i['id']: i['definitionId'] for i in graph['instances']}
    hat_id = review['hatInstanceId']
    connections = [c for c in graph['mechanicalConnections'] if c['activationOperationId'] in step['operationIds']]
    expected_stacks = [{'connectionId': c['id'], 'fastenerInstanceId': c['orderedContactStack'][0]['instanceId'], 'hatInstanceId': c['orderedContactStack'][1]['instanceId'],
                        'standoffInstanceId': c['orderedContactStack'][2]['instanceId']} for c in connections if len(c['orderedContactStack']) == 3]
    placed_ids = sorted(p['instanceId'] for p in record['placements'])
    require(record['stacks'] == expected_stacks and placed_ids == sorted([hat_id] + [s['fastenerInstanceId'] for s in expected_stacks])
            and len(set(placed_ids)) == len(placed_ids), 'EXACT_SEMANTIC_OWNERSHIP')
    mate = next(c for c in connections if not c['orderedContactStack'])
    board_id = next(e['instanceId'] for e in mate['endpoints'] if e['instanceId'] != hat_id)
    poses = {p['instanceId']: p for p in previous['placements']}
    mine = {p['instanceId']: p for p in record['placements']}
    transforms = {i: rigid(p) for i, p in mine.items()}
    r_board, t_board = rigid(poses[board_id])
    # Adopted artifacts, hash-checked against the adoption table.
    adopted = {a['artifactName']: a for a in load(root / (PRESENTATION + '/adopted-artifacts.json'))['artifacts']}
    entry = adopted[HAT_FILE]
    require(digest(engagement, HAT_FILE) == {'path': HAT_FILE, 'rawSha256': entry['rawSha256'], 'bytes': entry['bytes']}, 'ADOPTED_ARTIFACT_BYTES')
    hat_shape = cq.Shape.importBrep(str(engagement / HAT_FILE))
    require(BRepCheck_Analyzer(hat_shape.wrapped).IsValid(), 'VALID_ACTUAL_SOLID')
    pcb = min(hat_shape.Solids(), key=lambda s: abs(bounds(s)[5] - bounds(s)[2] - 1.6) + (0 if bounds(s)[3] - bounds(s)[0] > 60 else 100))
    thickness = float(bounds(pcb)[5])
    holes = sorted((float(c['origin'][0]), float(c['origin'][1])) for c in shape_features(pcb) if abs(c['axis'][2]) > .999999 and abs(c['radius'] - 1.4) < 1e-6)
    require(len(holes) == 4, 'FOUR_HAT_BORES')
    # Supports re-measured from the actual placed standoff solids.
    axes, tops, shapes = {}, {}, {}
    for s in expected_stacks:
        sid = s['standoffInstanceId']
        r, t = rigid(poses[sid])
        shapes[sid] = placed(cq.Shape.importBrep(str(purchased_artifact(root, definition_of[sid]))), r, t)
        body = max(shape_features(shapes[sid]), key=lambda c: c['radius'])
        axes[sid] = np.array([body['origin'][0], body['origin'][1]])
        tops[sid] = float(bounds(shapes[sid])[5])
    r_hat, t_hat = transforms[hat_id]
    require(np.max(np.abs(r_hat - r_board)) < 1e-9, 'HAT_ORIENTATION')
    rotated = {h: r_hat[:2, :2] @ np.array(h) for h in holes}
    guess = np.mean(list(axes.values()), axis=0) - np.mean(list(rotated.values()), axis=0)
    chosen = {}
    for h, point in rotated.items():
        chosen[min(axes, key=lambda sid: np.linalg.norm(axes[sid] - (point + guess)))] = h
    require(sorted(chosen) == sorted(axes), 'BORE_TO_SUPPORT_BIJECTION')
    fit = np.mean([axes[sid] - rotated[chosen[sid]] for sid in axes], axis=0)
    require(np.max(np.abs(t_hat[:2] - fit)) < LINEAR_MM, 'HAT_POSITION_NOT_FIT')
    require(abs(t_hat[2] - max(tops.values())) < LINEAR_MM and abs(record['hatHeight']['hatBottomMm'] - t_hat[2]) < LINEAR_MM
            and {k: v for k, v in record['hatHeight']['supportTopsMm'].items()} == {k: tops[k] for k in sorted(tops)}, 'HAT_HEIGHT')
    placed_hat = placed(hat_shape, r_hat, t_hat)
    # Gaps over the supports that sit lower than the HAT bottom must be declared and stay within the budget.
    gaps = []
    for sid, shape in shapes.items():
        gap = float(placed_hat.distance(shape))
        if gap > LINEAR_MM:
            gaps.append({'standoffInstanceId': sid, 'gapMm': gap})
    gaps.sort(key=lambda g: g['standoffInstanceId'])
    declared = record['hatHeight']['gaps']
    require(len(declared) == len(gaps) and all(a['standoffInstanceId'] == b['standoffInstanceId'] and abs(a['gapMm'] - b['gapMm']) < LINEAR_MM for a, b in zip(declared, gaps)), 'HAT_GAP_MISMATCH')
    require(all(g['gapMm'] <= GAP_BUDGET_MM for g in gaps), 'HAT_GAP_BUDGET')
    # Screws: coaxial with their named standoff, head up, seated on the HAT top.
    residuals = []
    for s in expected_stacks:
        r, t = transforms[s['fastenerInstanceId']]
        axis = axes[s['standoffInstanceId']]
        require(np.max(np.abs(r - SCREW_ROTATION)) < 1e-9, 'SCREW_POLARITY')
        require(np.max(np.abs(t[:2] - axis)) < LINEAR_MM, 'SCREW_NOT_COAXIAL_WITH_STANDOFF')
        require(abs(t[2] - (t_hat[2] + thickness)) < LINEAR_MM, 'SCREW_NOT_SEATED_ON_HAT')
        hole = min((np.linalg.norm(r_hat[:2, :2] @ np.array(h) + t_hat[:2] - axis) for h in holes))
        residuals.append(float(hole))
    # The underside socket must lie over the board header and touch it at the interface plane.
    board_definition = definition_of[board_id]
    board_name = BOARD_FILES[board_definition]
    board_folder = artifacts if board_definition == 'PX-V40-DEF-PI5' else boards
    board_entry = adopted[board_name]
    require(digest(board_folder, board_name) == {'path': board_name, 'rawSha256': board_entry['rawSha256'], 'bytes': board_entry['bytes']}, 'ADOPTED_ARTIFACT_BYTES')
    board_raw = cq.Shape.importBrep(str(board_folder / board_name))
    board_shape = placed(board_raw, r_board, t_board)
    sockets = [s for s in hat_shape.Solids() if bounds(s)[2] < -1]
    require(len(sockets) == 1, 'ONE_SOCKET')
    socket = placed(sockets[0], r_hat, t_hat)
    headers = [placed(s, r_board, t_board) for s in board_raw.Solids()
               if bounds(s)[4] > BOARD_WIDTH_MM[board_definition] * .8 and bounds(s)[2] > 1 and bounds(s)[3] - bounds(s)[0] > 40]
    require(len(headers) == 1, 'ONE_BOARD_HEADER')
    sb, hb = bounds(socket), bounds(headers[0])
    overlap = max(0.0, min(sb[3], hb[3]) - max(sb[0], hb[0])) * max(0.0, min(sb[4], hb[4]) - max(sb[1], hb[1]))
    socket_gap = float(socket.distance(headers[0]))
    require(overlap > 0 and socket_gap <= LINEAR_MM, f'SOCKET_NOT_OVER_HEADER overlap={overlap} gap={socket_gap}')
    require(float(placed_hat.intersect(board_shape).Volume()) <= 1e-7, 'HAT_PENETRATES_BOARD')
    for recipe in record['recipes']:
        require(set(recipe) == RECIPE_FIELDS, 'RECIPE_FIELDS')
        pose = mine[recipe['instanceId']]
        axis = np.array(recipe['approachAxis'], dtype=np.float64)
        sr, st = rigid(recipe['stagedStart'])
        r, t = transforms[recipe['instanceId']]
        require(abs(np.linalg.norm(axis) - 1) < 1e-12 and recipe['approachDistanceMm'] >= 1 and np.max(np.abs(sr - r)) < 1e-10
                and np.max(np.abs(st - (t - axis * recipe['approachDistanceMm']))) < 1e-9 and recipe['stagedStart']['instanceId'] == pose['instanceId'], 'STAGED_START')
    require([r['instanceId'] for r in record['recipes']] == [hat_id] + sorted(s['fastenerInstanceId'] for s in expected_stacks), 'RECIPE_OWNERSHIP_OR_ORDER')
    return {'status': 'PASS', 'variantId': variant, 'hatBottomMm': float(t_hat[2]), 'gaps': gaps, 'boreToSupportAxisMm': residuals,
            'socketHeaderGapMm': socket_gap, 'socketHeaderOverlapAreaMm2': float(overlap), 'physicalFit': 'NOT_CLAIMED', 'installationSweep': 'NOT_CLAIMED',
            'engineeringAdmission': False, 'runtimeAdmission': False}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    for name in ['root', 'closures', 'hat', 'engagement', 'artifacts', 'boards', 'output']:
        parser.add_argument('--' + name, required=True, type=Path)
    args = parser.parse_args()
    results = [verify(args.root, load(args.hat / f'{v}-S04-record.json'), load(args.closures / f'{v}-S03-closure.json'), args.engagement, args.artifacts, args.boards) for v in ['rpi5', 'rpi-zero-2-w']]
    args.output.write_bytes(rfc8785.dumps({'status': 'PASS', 'scope': 'S04 HAT mount only', 'results': results, 'engineeringAdmission': False}) + b'\n')


if __name__ == '__main__':
    main()
