"""Pi5 S02 microphone plug frame, derived from the adopted board geometry and the V40 review.

Presentation only: the USB opening is a flagged choice among equivalent openings (Q-10) and no
fit, retention, electrical or allocation claim follows. Independent re-measurement lives in usb_verify.py.
"""
import argparse
from pathlib import Path
import cadquery as cq
import numpy as np
import rfc8785
from ...contracts import load, Invalid
from .verify import require, digest

PRESENTATION = 'digital-twin/assemblies/v40/presentation/instructional'
MODULE = 'digital-twin/cad/twin_cad/assemblies/instructional/usb.py'
ORACLE = 'digital-twin/cad/twin_cad/assemblies/instructional/usb_verify.py'
MIC = 'digital-twin/validation/expected/m5/instructional-artifacts/PX-V40-DEF-USB-MICROPHONE.brep'
BOARD = 'PX-V40-DEF-PI5-INSTRUCTIONAL-02.brep'
REAR_X_MM = 85.0
USB_STACK_HEIGHT_MM = 15.0
TOL = 1e-6


def local_bounds(solid):
    b = solid.BoundingBox()
    return [b.xmin, b.ymin, b.zmin, b.xmax, b.ymax, b.zmax]


def selected_block(board_shape, review):
    """Rear-facing USB stacks by extent; the rule picks the one with the larger board-local Y."""
    stacks = [s for s in board_shape.Solids() if abs(local_bounds(s)[3] - REAR_X_MM) < TOL
              and abs(local_bounds(s)[5] - local_bounds(s)[2] - USB_STACK_HEIGHT_MM) < TOL]
    require(len(stacks) == 2, 'TWO_REAR_USB_STACKS')
    require(review['selection']['usbBlock'] == 'gpioSideUsbStack', 'UNSUPPORTED_BLOCK_RULE')
    return max((local_bounds(s) for s in stacks), key=lambda b: b[1])


def build(root, variant, boards, artifacts):
    require(variant == 'rpi5', 'MICROPHONE_FRAME_IS_PI5_ONLY')
    review_path = PRESENTATION + '/step02-usb-review-04.json'
    review = load(root / review_path)
    graph_path = f'digital-twin/validation/m2/{variant}/compiled-graph.json'
    graph = load(root / graph_path)
    board_record = load(boards / (variant + '-S02-board.json'))
    board_pose = board_record['boardPose']
    r_board = np.array(board_pose['rotation'], dtype=np.float64)
    t_board = np.array(board_pose['translationMm'], dtype=np.float64)
    block = selected_block(cq.Shape.importBrep(str(artifacts / BOARD)), review)
    fraction = review['selection']['openingCenterFractionOfBlockHeight']
    opening_local = np.array([REAR_X_MM, (block[1] + block[4]) / 2, block[2] + fraction * (block[5] - block[2])])
    center = r_board @ opening_local + t_board
    outward = r_board @ np.array([1., 0., 0.])
    up = r_board @ np.array([0., 0., 1.])
    insertion = -outward
    rotation = np.column_stack([insertion, np.cross(up, insertion), up])
    mic = cq.Shape.importBrep(str(root / MIC))
    plug = max(mic.Solids(), key=lambda s: local_bounds(s)[3])
    p = local_bounds(plug)
    plug_length = p[3] - p[0]
    tip_local = np.array([p[3], (p[1] + p[4]) / 2, (p[2] + p[5]) / 2])
    translation = center + insertion * plug_length - rotation @ tip_local
    clean = lambda values: [float(v) + 0.0 for v in values]
    pose = {'instanceId': review['instanceId'], 'translationMm': clean(translation), 'rotation': [clean(row) for row in rotation],
            'featureRef': 'actualUSBOpening.upper.mouthCenter', 'role': 'microphone'}
    distance = float(review['approach']['distanceMm'])
    axis = np.array(review['approach']['axis'], dtype=np.float64)
    require(np.allclose(axis, insertion, atol=1e-12), 'APPROACH_AXIS_IS_INSERTION_AXIS')
    staged = {**pose, 'translationMm': clean(translation - axis * distance)}
    recipe = {'instanceId': review['instanceId'], 'anchor': {'instanceId': review['boardInstanceId'], 'localFeature': pose['featureRef']},
              'approachAxis': clean(axis), 'approachDistanceMm': distance, 'stagedStart': staged,
              'segments': ['align plug axis and roll with the opening', 'seat body flush with the mouth plane'],
              'stagingOnly': True, 'installationSweep': 'NOT_CLAIMED', 'reversal': 'Digital staging reversal only; no physical undo claim'}
    selection = {k: review['selection'][k] for k in ['choiceKind', 'usbBlock', 'opening', 'openingCenterFractionOfBlockHeight', 'basis', 'q10']}
    selection['blockBoardLocalBoundsMm'] = [round(v, 6) for v in block]
    inputs = [digest(root, review_path), digest(root, graph_path), digest(root, MODULE), digest(root, ORACLE), digest(root, MIC),
              digest(root, PRESENTATION + '/adopted-artifacts.json'), digest(boards, variant + '-S02-board.json'), digest(artifacts, BOARD)]
    return {'id': 'PX-M7-S02-USB-MICROPHONE-rpi5-04', 'revision': 4, 'track': 'instructional-only', 'variantId': variant,
            'stepId': 'PX-V40-STEP-02', 'printedNumber': 2, 'instanceId': review['instanceId'], 'boardInstanceId': review['boardInstanceId'],
            'connectionId': review['connectionId'], 'graphHash': graph['graphHash'], 'modelHash': graph['modelHash'],
            'pose': pose, 'scale': [1, 1, 1], 'selection': selection, 'recipe': recipe, 'limitations': review['limitations'],
            'engineeringBlockerIds': review['engineeringBlockerIds'], 'inputBindings': inputs, 'physicalFit': 'NOT_CLAIMED',
            'engineeringAdmission': False, 'runtimeAdmission': False}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    for name in ['root', 'boards', 'artifacts', 'output']:
        parser.add_argument('--' + name, required=True, type=Path)
    args = parser.parse_args()
    args.output.mkdir(parents=True, exist_ok=False)
    (args.output / 'rpi5-S02-usb-microphone.json').write_bytes(rfc8785.dumps(build(args.root, 'rpi5', args.boards, args.artifacts)) + b'\n')


if __name__ == '__main__':
    main()
