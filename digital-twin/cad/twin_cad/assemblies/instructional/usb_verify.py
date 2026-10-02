"""Independent Pi5 microphone plug re-measurement; never imports the frame generator."""
import argparse
from pathlib import Path
import cadquery as cq
import numpy as np
import rfc8785
from OCP.BRepCheck import BRepCheck_Analyzer
from ...contracts import load
from .verify import require, digest, rigid, placed

PRESENTATION = 'digital-twin/assemblies/v40/presentation/instructional'
FIELDS = {'id', 'revision', 'track', 'variantId', 'stepId', 'printedNumber', 'instanceId', 'boardInstanceId', 'connectionId', 'graphHash',
          'modelHash', 'pose', 'scale', 'selection', 'recipe', 'limitations', 'engineeringBlockerIds', 'inputBindings', 'physicalFit',
          'engineeringAdmission', 'runtimeAdmission'}
RECIPE_FIELDS = {'instanceId', 'anchor', 'approachAxis', 'approachDistanceMm', 'stagedStart', 'segments', 'stagingOnly', 'installationSweep', 'reversal'}
SELECTION_FIELDS = ['choiceKind', 'usbBlock', 'opening', 'openingCenterFractionOfBlockHeight', 'basis', 'q10']
MIC = 'digital-twin/validation/expected/m5/instructional-artifacts/PX-V40-DEF-USB-MICROPHONE.brep'
BOARD = 'PX-V40-DEF-PI5-INSTRUCTIONAL-02.brep'
LINEAR_MM = 1e-6
ANGULAR = 1e-9


def bounds(solid):
    b = solid.BoundingBox()
    return np.array([b.xmin, b.ymin, b.zmin, b.xmax, b.ymax, b.zmax])


def verify(root, record, boards, artifacts):
    require(set(record) == FIELDS, 'CLOSED_USB_RECORD')
    require(record['engineeringAdmission'] is False and record['runtimeAdmission'] is False and record['physicalFit'] == 'NOT_CLAIMED', 'ENGINEERING_FIREWALL')
    require(record['variantId'] == 'rpi5' and record['id'] == 'PX-M7-S02-USB-MICROPHONE-rpi5-04' and record['revision'] == 4 and record['track'] == 'instructional-only', 'USB_IDENTITY')
    require(record['scale'] == [1, 1, 1], 'BASIS_UNIT_SCALE')
    review = load(root / (PRESENTATION + '/step02-usb-review-04.json'))
    require(record['selection'] is not None and {k: record['selection'].get(k) for k in SELECTION_FIELDS} == {k: review['selection'][k] for k in SELECTION_FIELDS}, 'SELECTION_NOT_FROM_REVIEW')
    require(all(text in record['limitations'] for text in review['limitations']) and record['limitations'] == review['limitations'], 'LIMITATION_REMOVAL')
    require(record['instanceId'] == review['instanceId'] and record['boardInstanceId'] == review['boardInstanceId'] and record['connectionId'] == review['connectionId'], 'EXACT_SEMANTIC_OWNERSHIP')
    graph = load(root / 'digital-twin/validation/m2/rpi5/compiled-graph.json')
    require(record['graphHash'] == graph['graphHash'] and record['modelHash'] == graph['modelHash'] and record['stepId'] == graph['steps'][1]['id'], 'GRAPH_MODEL_BINDING')
    connection = next(c for c in graph['mechanicalConnections'] if c['id'] == record['connectionId'])
    require([e['instanceId'] for e in connection['endpoints']] == [record['instanceId'], record['boardInstanceId']] and connection['jointType'] == 'fixed'
            and connection['remainingDOF'] == [] and connection['orderedContactStack'] == [], 'PROTECTED_CONNECTION_SEMANTICS')
    for binding in record['inputBindings']:
        base = boards if binding['path'].endswith('-S02-board.json') else artifacts if binding['path'] == BOARD else root
        require(binding == digest(base, binding['path']), 'INPUT_BYTES_CHANGED')
    recipe = record['recipe']
    require(set(recipe) == RECIPE_FIELDS and recipe['stagingOnly'] is True and recipe['installationSweep'] == 'NOT_CLAIMED', 'UNTESTED_CLAIM')
    # The adopted board bytes and the board pose are read from their own sources, never from this record.
    adopted = next(a for a in load(root / (PRESENTATION + '/adopted-artifacts.json'))['artifacts'] if a['definitionId'] == 'PX-V40-DEF-PI5')
    require(digest(artifacts, BOARD) == {'path': BOARD, 'rawSha256': adopted['rawSha256'], 'bytes': adopted['bytes']}, 'ADOPTED_ARTIFACT_BYTES')
    board_pose = load(boards / 'rpi5-S02-board.json')['boardPose']
    r_board, t_board = rigid(board_pose)
    board = cq.Shape.importBrep(str(artifacts / BOARD))
    mic = cq.Shape.importBrep(str(root / MIC))
    require(BRepCheck_Analyzer(board.wrapped).IsValid() and BRepCheck_Analyzer(mic.wrapped).IsValid(), 'VALID_ACTUAL_SOLIDS')
    r, t = rigid(record['pose'])
    # Independent block selection from actual extents: rear-facing stacks that are 15 mm tall.
    stacks = [s for s in board.Solids() if abs(bounds(s)[3] - 85) < LINEAR_MM and abs(bounds(s)[5] - bounds(s)[2] - 15) < LINEAR_MM]
    require(len(stacks) == 2, 'TWO_REAR_USB_STACKS')
    block = max(stacks, key=lambda s: bounds(s)[1])
    b = bounds(block)
    require(record['selection']['blockBoardLocalBoundsMm'] == [round(float(v), 6) for v in b], 'SELECTION_BOUNDS_MISMATCH')
    opening = r_board @ np.array([85., (b[1] + b[4]) / 2, b[2] + review['selection']['openingCenterFractionOfBlockHeight'] * (b[5] - b[2])]) + t_board
    outward = r_board @ np.array([1., 0., 0.])
    up = r_board @ np.array([0., 0., 1.])
    # Plug and body from actual extents along the mic's own long axis.
    solids = sorted(mic.Solids(), key=lambda s: bounds(s)[3])
    require(len(solids) == 2, 'MIC_BODY_AND_PLUG')
    body, plug = solids
    pb, bb = bounds(plug), bounds(body)
    tip = r @ np.array([pb[3], (pb[1] + pb[4]) / 2, (pb[2] + pb[5]) / 2]) + t
    body_face = r @ np.array([bb[3], (bb[1] + bb[4]) / 2, (bb[2] + bb[5]) / 2]) + t
    direction = r @ np.array([1., 0., 0.])
    require(np.max(np.abs(direction + outward)) < ANGULAR, 'PLUG_NOT_POINTING_INTO_PORT')
    require(np.max(np.abs(r @ np.array([0., 0., 1.]) - up)) < ANGULAR and abs(float((r @ np.array([0., 1., 0.])) @ up)) < ANGULAR, 'PLUG_ROLL')
    plug_center = r @ np.array([(pb[0] + pb[3]) / 2, (pb[1] + pb[4]) / 2, (pb[2] + pb[5]) / 2]) + t
    offset = plug_center - opening
    residual = float(np.linalg.norm(offset - (offset @ direction) * direction))
    require(residual <= LINEAR_MM, f'OPENING_CENTER_RESIDUAL {residual}')
    depth = float((tip - opening) @ direction)
    gap = float((body_face - opening) @ direction)
    require(abs(depth - (pb[3] - pb[0])) <= LINEAR_MM and abs(gap) <= LINEAR_MM, f'PLUG_NOT_SEATED_FLUSH depth={depth} gap={gap}')
    placed_mic = placed(mic, r, t)
    placed_board = placed(board, r_board, t_board)
    placed_block = placed(block, r_board, t_board)
    placed_plug = placed(plug, r, t)
    placed_body = placed(body, r, t)
    plug_overlap = float(placed_plug.intersect(placed_block).Volume())
    body_overlap = float(placed_body.intersect(placed_board).Volume())
    require(abs(plug_overlap - float(plug.Volume())) <= 1e-6 * float(plug.Volume()) and body_overlap <= 1e-7, 'PLUG_NOT_FULLY_WITHIN_BLOCK_OR_BODY_PENETRATES')
    require(float(placed_mic.distance(placed_board)) <= LINEAR_MM, 'BODY_NOT_TOUCHING_MOUTH')
    clean = lambda values: [float(v) + 0.0 for v in values]
    return {'status': 'PASS', 'instanceId': record['instanceId'], 'insertionAxisWorld': clean(direction), 'plugDepthMm': depth, 'bodyMouthGapMm': gap,
            'openingCenterResidualMm': residual, 'plugBlockOverlapMm3': plug_overlap, 'bodyBoardOverlapMm3': body_overlap,
            'selectedBlockBoardLocalBoundsMm': [round(float(v), 6) for v in b], 'q10': record['selection']['q10'],
            'choiceKind': record['selection']['choiceKind'], 'physicalFit': 'NOT_CLAIMED', 'installationSweep': 'NOT_CLAIMED',
            'engineeringAdmission': False, 'runtimeAdmission': False}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    for name in ['root', 'usb', 'boards', 'artifacts', 'output']:
        parser.add_argument('--' + name, required=True, type=Path)
    args = parser.parse_args()
    result = verify(args.root, load(args.usb / 'rpi5-S02-usb-microphone.json'), args.boards, args.artifacts)
    args.output.write_bytes(rfc8785.dumps({'status': 'PASS', 'scope': 'Pi5 S02 microphone plug frame only', 'result': result, 'engineeringAdmission': False}) + b'\n')


if __name__ == '__main__':
    main()
