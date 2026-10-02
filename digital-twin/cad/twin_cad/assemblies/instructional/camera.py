"""S03 camera connector endpoint frames for the retained FPC ribbon, derived from the reviewed observations.

Presentation only: the ribbon is a zero-solid schematic, so only its connected end frame exists. No fit,
route, pin map or camera identity is claimed. Independent re-measurement lives in camera_verify.py.
"""
import argparse
from pathlib import Path
import numpy as np
import rfc8785
from ...contracts import load, Invalid
from .verify import require, digest, rigid

PRESENTATION = 'digital-twin/assemblies/v40/presentation/instructional'
MODULE = 'digital-twin/cad/twin_cad/assemblies/instructional/camera.py'
ORACLE = 'digital-twin/cad/twin_cad/assemblies/instructional/camera_verify.py'
PARAMETERS = 'digital-twin/validation/expected/m5/instructional-parameters.json'
CLAIMS = {'staticPlacement': 'INSTRUCTIONAL_PASS', 'installationSweep': 'NOT_CLAIMED', 'physicalFit': 'NOT_CLAIMED'}
BOARD_DEFINITION = {'rpi5': 'PX-V40-DEF-PI5', 'rpi-zero-2-w': 'PX-V40-DEF-ZERO2W'}


def clean(values):
    return [float(v) + 0.0 for v in values]


def build(root, variant, boards):
    scope = load(root / PRESENTATION / 'product-scope.json')
    require(variant in scope['activeProductVariants'], 'PRESERVED_NON_TARGET_OR_UNSUPPORTED_VARIANT')
    review_path = PRESENTATION + '/step03-camera-review-04.json'
    review = load(root / review_path)
    entry = review['variants'][variant]
    graph_path = f'digital-twin/validation/m2/{variant}/compiled-graph.json'
    graph = load(root / graph_path)
    connection = next(c for c in graph['cableConnections'] if c['id'] == entry['connectionId'])
    require(connection['cableInstanceId'] == review['cableInstanceId'] and connection['endpointLabel'] == review['endpointLabel']
            and connection['targetInstanceId'] == entry['targetInstanceId'], 'EXACT_SEMANTIC_OWNERSHIP')
    parameters = {d['definitionId']: {p['name']: p['value'] for p in d['instructionalApproximations']} for d in load(root / PARAMETERS)['definitions']}
    pcb_top = float(parameters[BOARD_DEFINITION[variant]]['thickness'])
    board_path = variant + '-S02-board.json'
    pose = load(boards / board_path)['boardPose']
    r, t = rigid(pose)
    frame = entry['frameBoardLocal']
    insertion = np.array(frame['insertionAxis'], dtype=np.float64)
    contact = np.array(frame['contactNormal'], dtype=np.float64)
    if variant == 'rpi5':
        origin = np.array([frame['slotPlaneXMm'], frame['contactRowCenterYMm'], pcb_top + frame['seatAboveBoardTopMm']])
    else:
        origin = np.array([frame['mouthXMm'] - frame['seatedDepthMm'], frame['centerYMm'], pcb_top + frame['slotCenterAboveBoardTopMm']])
    width = np.cross(insertion, contact)
    local = {'originMm': clean(origin), 'insertionAxis': clean(insertion), 'contactNormal': clean(contact), 'widthAxis': clean(width)}
    installed = {'originMm': clean(r @ origin + t), 'insertionAxis': clean(r @ insertion), 'contactNormal': clean(r @ contact), 'widthAxis': clean(r @ width)}
    distance = float(entry['approach']['distanceMm'])
    staged = np.array(installed['originMm']) - np.array(installed['insertionAxis']) * distance
    inputs = [digest(root, review_path), digest(root, graph_path), digest(root, MODULE), digest(root, ORACLE), digest(root, PARAMETERS),
              digest(boards, board_path)]
    return {'id': f'PX-M7-S03-CAMERA-{variant}-04', 'revision': 4, 'track': 'instructional-only', 'variantId': variant,
            'stepId': 'PX-V40-STEP-03', 'printedNumber': 3, 'cableInstanceId': review['cableInstanceId'], 'endpointLabel': review['endpointLabel'],
            'connectionId': entry['connectionId'], 'targetInstanceId': entry['targetInstanceId'], 'connectionPointId': entry['connectionPointId'],
            'graphHash': graph['graphHash'], 'modelHash': graph['modelHash'],
            'endpointFrame': {'boardLocal': local, 'installed': installed},
            'approach': {'distanceMm': distance, 'stagedOriginMm': clean(staged), 'stagingOnly': True},
            'selection': entry['selection'], 'limitations': review['limitations'], 'claims': dict(CLAIMS),
            'engineeringBlockerIds': review['engineeringBlockerIds'], 'inputBindings': inputs,
            'engineeringAdmission': False, 'runtimeAdmission': False}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    for name in ['root', 'boards', 'output']:
        parser.add_argument('--' + name, required=True, type=Path)
    args = parser.parse_args()
    args.output.mkdir(parents=True, exist_ok=False)
    scope = load(args.root / PRESENTATION / 'product-scope.json')
    for variant in scope['activeProductVariants']:
        (args.output / f'{variant}-S03-camera.json').write_bytes(rfc8785.dumps(build(args.root, variant, args.boards)) + b'\n')


if __name__ == '__main__':
    main()
