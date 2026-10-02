"""Independent camera connector frame re-measurement; never imports the frame generator."""
import argparse
import functools
from pathlib import Path
import cadquery as cq
import numpy as np
import rfc8785
from ...contracts import load, Invalid
from .verify import require, digest, rigid, placed

PRESENTATION = 'digital-twin/assemblies/v40/presentation/instructional'
PARAMETERS = 'digital-twin/validation/expected/m5/instructional-parameters.json'
FIELDS = {'id', 'revision', 'track', 'variantId', 'stepId', 'printedNumber', 'cableInstanceId', 'endpointLabel', 'connectionId', 'targetInstanceId',
          'connectionPointId', 'graphHash', 'modelHash', 'endpointFrame', 'approach', 'selection', 'limitations', 'claims', 'engineeringBlockerIds',
          'inputBindings', 'engineeringAdmission', 'runtimeAdmission'}
FRAME_FIELDS = {'originMm', 'insertionAxis', 'contactNormal', 'widthAxis'}
CLAIMS = {'staticPlacement': 'INSTRUCTIONAL_PASS', 'installationSweep': 'NOT_CLAIMED', 'physicalFit': 'NOT_CLAIMED'}
ADOPTED_BOARD = {'rpi5': 'PX-V40-DEF-PI5-INSTRUCTIONAL-02.brep', 'rpi-zero-2-w': 'PX-V40-DEF-ZERO2W-INSTRUCTIONAL-02.brep'}
POSITION_MM = 0.02
EXACT = 1e-6


def bounds(solid):
    b = solid.BoundingBox()
    return np.array([b.xmin, b.ymin, b.zmin, b.xmax, b.ymax, b.zmax])


@functools.lru_cache(maxsize=2)
def measure_pi5_step(path):
    """Selects the connector from actual extents and probes material on the slot interface; stores derived numbers only."""
    solids = cq.importers.importStep(path).val().Solids()
    boxes = [bounds(s) for s in solids]
    pcb = [i for i, b in enumerate(boxes) if np.max(np.abs(b - [0, 0, .03, 85, 56, 1.306])) < 1e-5]
    require(len(pcb) == 1, 'ONE_PCB')
    housings = sorted((i for i, b in enumerate(boxes) if abs(b[4] - b[1] - 16.0) < .05 and 3.7 < b[5] - b[2] < 4.0 and 2.2 < b[3] - b[0] < 2.4 and abs(b[1] - .5) < .05),
                      key=lambda i: boxes[i][0])
    require(len(housings) == 2, 'TWO_CONNECTOR_HOUSINGS')
    house = housings[0]
    hb = boxes[house]
    flaps = [i for i, b in enumerate(boxes) if abs(b[4] - b[1] - 16.7) < .05 and 2.9 < b[3] - b[0] < 3.1 and b[0] < hb[3] and b[3] > hb[0] and abs(b[5] - hb[5]) < .01]
    require(len(flaps) == 1, 'ONE_FLAP')
    flap = flaps[0]
    leaves = [i for i, b in enumerate(boxes) if solids[i].Volume() < 1 and b[1] > hb[1] and b[4] < hb[4] and b[0] > hb[0] - 1 and b[3] < hb[3] + 1 and b[2] > 1.9 and b[4] - b[1] < .3]
    require(len(leaves) == 22, f'TWENTY_TWO_CONTACT_LEAVES {len(leaves)}')
    centers = sorted(float((boxes[i][1] + boxes[i][4]) / 2) for i in leaves)
    require(all(abs(b - a - .5) < .02 for a, b in zip(centers, centers[1:])), 'LEAF_PITCH_HALF_MM')
    row_center = (centers[0] + centers[-1]) / 2
    require(abs(row_center - (hb[1] + hb[4]) / 2) < .02, 'CONTACT_ROW_CENTERED_ON_HOUSING')
    mid = min(leaves, key=lambda i: abs((boxes[i][1] + boxes[i][4]) / 2 - row_center))
    lb = boxes[mid]
    y_probe, z_probe = float((lb[1] + lb[4]) / 2), float((lb[2] + lb[5]) / 2)

    def inside(index, x):
        return bool(solids[index].isInside(cq.Vector(x, y_probe, z_probe), 1e-7))
    xs = np.arange(hb[0] - 1.0, hb[3] + 1.0, .01)
    arm = [float(x) for x in xs if inside(flap, x)]
    require(len(arm) > 10, 'FLAP_ARM_AT_CONTACT_HEIGHT')
    arm_lo, arm_hi = min(arm), max(arm)
    left_leaf, right_leaf = inside(mid, arm_lo - .05), inside(mid, arm_hi + .05)
    require(left_leaf != right_leaf, 'AMBIGUOUS_CONTACT_SIDE')
    # The leaf foot is the end that joins a tail solder solid; the cable travels from the tip toward the foot.
    tails_below = [i for i, b in enumerate(boxes) if i != mid and abs(b[1] - lb[1]) < 1e-3 and abs(b[4] - lb[4]) < 1e-3 and abs(b[5] - lb[2]) < 1e-3]
    tails_above = [i for i, b in enumerate(boxes) if i != mid and abs(b[1] - lb[1]) < 1e-3 and abs(b[4] - lb[4]) < 1e-3 and abs(b[2] - lb[5]) < 1e-3]
    require(bool(tails_below) != bool(tails_above), 'LEAF_FOOT_END')
    return {'leafCount': len(leaves), 'contactRowCenterYMm': row_center, 'slotPlaneXMm': arm_lo if left_leaf else arm_hi,
            'contactSide': '-X' if left_leaf else '+X', 'flapSide': '+X' if left_leaf else '-X',
            'insertionAxis': [0.0, 0.0, -1.0] if tails_below else [0.0, 0.0, 1.0], 'leafFootZMm': float(lb[2] if tails_below else lb[5]),
            'pcbTopNativeZMm': float(boxes[pcb[0]][5]), 'housingTopNativeZMm': float(hb[5])}


def column_ok(frame):
    return set(frame) == FRAME_FIELDS and all(len(frame[k]) == 3 for k in FRAME_FIELDS)


def verify(root, record, boards, artifacts, source_root):
    require(set(record) == FIELDS, 'CLOSED_CAMERA_RECORD')
    require(record['engineeringAdmission'] is False and record['runtimeAdmission'] is False, 'ENGINEERING_FIREWALL')
    require(record['claims'] == CLAIMS and record['approach']['stagingOnly'] is True, 'UNTESTED_CLAIM')
    scope = load(root / PRESENTATION / 'product-scope.json')
    variant = record['variantId']
    require(variant in scope['activeProductVariants'], 'PRESERVED_NON_TARGET_OR_UNSUPPORTED_VARIANT')
    require(record['id'] == f'PX-M7-S03-CAMERA-{variant}-04' and record['revision'] == 4 and record['track'] == 'instructional-only', 'CAMERA_IDENTITY')
    review = load(root / (PRESENTATION + '/step03-camera-review-04.json'))
    entry = review['variants'][variant]
    graph = load(root / f'digital-twin/validation/m2/{variant}/compiled-graph.json')
    connection = next(c for c in graph['cableConnections'] if c['id'] == record['connectionId'])
    require(record['graphHash'] == graph['graphHash'] and record['modelHash'] == graph['modelHash'] and record['stepId'] == graph['steps'][2]['id'], 'GRAPH_MODEL_BINDING')
    require(record['cableInstanceId'] == connection['cableInstanceId'] == review['cableInstanceId'] and record['endpointLabel'] == connection['endpointLabel'] == review['endpointLabel']
            and record['targetInstanceId'] == connection['targetInstanceId'] == entry['targetInstanceId'] and record['connectionPointId'] == connection['connectionPointId']
            and record['connectionId'] == entry['connectionId'] and connection['activationOperationId'] in graph['steps'][2]['operationIds'], 'EXACT_SEMANTIC_OWNERSHIP')
    require(record['limitations'] == review['limitations'] and all(text in record['limitations'] for text in review['limitations']), 'LIMITATION_REMOVAL')
    require(record['selection'] == entry['selection'], 'SELECTION_NOT_FROM_REVIEW')
    for binding in record['inputBindings']:
        require(binding == digest(boards if binding['path'].endswith('-S02-board.json') else root, binding['path']), 'INPUT_BYTES_CHANGED')
    frame = record['endpointFrame']
    require(set(frame) == {'boardLocal', 'installed'} and column_ok(frame['boardLocal']) and column_ok(frame['installed']), 'CLOSED_FRAME')
    # Guidance sources are read in place from the ignored vault; their bytes must match the reviewed bindings.
    def source_file(binding):
        try:
            found = digest(source_root, binding['path'])
        except FileNotFoundError:
            raise Invalid('SOURCE_REQUIRED ' + binding['path'])
        require(found['rawSha256'] == binding['rawSha256'] and found['bytes'] == binding['bytes'], 'SOURCE_BYTES_CHANGED')
        return source_root / binding['path']
    source_file(review['officialText'])
    # Board pose and proxy extents come from their own sources, never from this record.
    board_pose = load(boards / (variant + '-S02-board.json'))['boardPose']
    r_board, t_board = rigid(board_pose)
    adopted = next(a for a in load(root / (PRESENTATION + '/adopted-artifacts.json'))['artifacts'] if a['artifactName'] == ADOPTED_BOARD[variant])
    board_folder = artifacts if variant == 'rpi5' else boards
    require(digest(board_folder, adopted['artifactName']) == {'path': adopted['artifactName'], 'rawSha256': adopted['rawSha256'], 'bytes': adopted['bytes']}, 'ADOPTED_ARTIFACT_BYTES')
    board = cq.Shape.importBrep(str(board_folder / adopted['artifactName']))
    pcb = min(board.Solids(), key=lambda s: abs(bounds(s)[5] - bounds(s)[2] - 1.6) + (0 if bounds(s)[3] - bounds(s)[0] > 60 else 100))
    pb = bounds(pcb)
    local = {k: np.array(v, dtype=np.float64) for k, v in frame['boardLocal'].items()}
    installed = {k: np.array(v, dtype=np.float64) for k, v in frame['installed'].items()}
    axes = np.column_stack([local['insertionAxis'], local['contactNormal'], local['widthAxis']])
    handedness = float(np.linalg.det(axes))
    require(np.max(np.abs(axes.T @ axes - np.eye(3))) < 1e-9 and abs(handedness - 1) < 1e-9, 'FRAME_NOT_RIGHT_HANDED')
    orthonormal = float(np.max(np.abs(axes.T @ axes - np.eye(3))))
    expected_installed = {'originMm': r_board @ local['originMm'] + t_board, 'insertionAxis': r_board @ local['insertionAxis'],
                          'contactNormal': r_board @ local['contactNormal'], 'widthAxis': r_board @ local['widthAxis']}
    for key, value in expected_installed.items():
        require(np.max(np.abs(installed[key] - value)) < 1e-9, 'INSTALLED_FRAME_NOT_BOARD_POSE_OF_LOCAL ' + key)
    top = float(pb[5])
    if variant == 'rpi5':
        step_file = source_file(entry['stepSource'])
        measured = measure_pi5_step(str(step_file))
        seat_z = top + (measured['leafFootZMm'] - measured['pcbTopNativeZMm'])
        expected_origin = np.array([measured['slotPlaneXMm'], measured['contactRowCenterYMm'], seat_z])
        residual = float(np.linalg.norm(local['originMm'] - expected_origin))
        require(np.max(np.abs(local['originMm'][:2] - expected_origin[:2])) < POSITION_MM and abs(local['originMm'][2] - seat_z) < POSITION_MM, f'FRAME_NOT_AT_MEASURED_CONNECTOR {residual}')
        require(np.max(np.abs(local['insertionAxis'] - measured['insertionAxis'])) < EXACT, 'INSERTION_AXIS')
        contact = np.array([-1., 0., 0.] if measured['contactSide'] == '-X' else [1., 0., 0.])
        require(np.max(np.abs(local['contactNormal'] - contact)) < EXACT, 'CONTACT_SIDE')
        source = {k: measured[k] for k in ['leafCount', 'contactRowCenterYMm', 'slotPlaneXMm', 'contactSide', 'flapSide', 'leafFootZMm']}
        origin_residual = residual
    else:
        source_file(entry['drawingSource'])
        m = entry['measuredNative']
        # The footprint must sit flush on the short edge of the adopted proxy and be centred across it.
        require(abs(m['flushWithShortEdgeXMm'] - pb[3]) < EXACT and abs(m['centerYMm'] - (pb[1] + pb[4]) / 2) < EXACT, 'CONNECTOR_NOT_ON_PROXY_SHORT_EDGE')
        fx0, fy0, fx1, fy1 = m['footprintBoundsMm']
        require(abs(fx1 - pb[3]) < EXACT and abs((fy0 + fy1) / 2 - m['centerYMm']) < .05 and abs((fy1 - fy0) - m['widthMm']) < .05 and fx0 < fx1 - 3, 'FOOTPRINT_NOT_ON_SHORT_EDGE')
        require(0 < entry['frameBoardLocal']['seatedDepthMm'] < fx1 - fx0, 'SEATED_DEPTH_WITHIN_FOOTPRINT')
        expected_origin = np.array([pb[3] - entry['frameBoardLocal']['seatedDepthMm'], m['centerYMm'], top + entry['frameBoardLocal']['slotCenterAboveBoardTopMm']])
        residual = float(np.linalg.norm(local['originMm'] - expected_origin))
        require(residual < POSITION_MM, f'FRAME_NOT_AT_MEASURED_CONNECTOR {residual}')
        # Horizontal insertion from the short edge into the board; metallic contacts down, away from the slider and flap.
        require(np.max(np.abs(local['insertionAxis'] - [-1., 0., 0.])) < EXACT, 'INSERTION_AXIS')
        require(np.max(np.abs(local['contactNormal'] - [0., 0., -1.])) < EXACT, 'CONTACT_SIDE')
        source = {'footprintBoundsMm': m['footprintBoundsMm'], 'centerYMm': m['centerYMm'], 'widthMm': m['widthMm']}
        origin_residual = residual
    staged = np.array(record['approach']['stagedOriginMm'], dtype=np.float64)
    expected_staged = installed['originMm'] - installed['insertionAxis'] * record['approach']['distanceMm']
    require(record['approach']['distanceMm'] == entry['approach']['distanceMm'] and np.max(np.abs(staged - expected_staged)) < 1e-9, 'STAGED_ORIGIN')
    board_world = placed(board, r_board, t_board)
    clear = not any(s.isInside(cq.Vector(*[float(v) for v in staged]), 1e-7) for s in board_world.Solids())
    require(clear, 'STAGED_ORIGIN_INSIDE_BOARD')
    return {'status': 'PASS', 'variantId': variant, 'source': source, 'residualMm': origin_residual, 'handedness': int(round(handedness)),
            'orthonormalResidual': orthonormal, 'stagedOriginClearOfSolids': bool(clear), 'physicalFit': 'NOT_CLAIMED',
            'installationSweep': 'NOT_CLAIMED', 'engineeringAdmission': False, 'runtimeAdmission': False}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--measure-step', type=Path, help='print the derived Pi5 connector measurements and stop')
    known, _ = parser.parse_known_args()
    if known.measure_step:
        print(rfc8785.dumps(measure_pi5_step(str(known.measure_step))).decode())
        return
    for name in ['root', 'camera', 'boards', 'artifacts', 'source-root', 'output']:
        parser.add_argument('--' + name, required=True, type=Path)
    args = parser.parse_args()
    results = [verify(args.root, load(args.camera / f'{v}-S03-camera.json'), args.boards, args.artifacts, args.source_root)
               for v in ['rpi5', 'rpi-zero-2-w']]
    args.output.write_bytes(rfc8785.dumps({'status': 'PASS', 'scope': 'S03 camera connector endpoint frames only', 'results': results, 'engineeringAdmission': False}) + b'\n')


if __name__ == '__main__':
    main()
