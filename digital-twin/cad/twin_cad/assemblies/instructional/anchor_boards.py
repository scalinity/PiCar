"""Additive Pi5 port-order revision and partial S02 board candidates only.

No vendor topology is copied; accepted authored PCB/header/holes are preserved.
"""
import argparse
from pathlib import Path
import cadquery as cq
import numpy as np
import rfc8785
from ...contracts import load, Invalid
from .generate import PRESENTATION, binding


ARTIFACT = 'PX-V40-DEF-PI5-INSTRUCTIONAL-02.brep'
ZERO = 'PX-V40-DEF-ZERO2W-INSTRUCTIONAL-02.brep'


def zero_candidate(root, output):
    review_path = PRESENTATION + '/zero-header-review-03.json'
    review = load(root / review_path)
    old_path = 'digital-twin/validation/expected/m5/instructional-artifacts/PX-V40-DEF-ZERO2W.brep'
    shape = cq.Shape.importBrep(str(root / old_path))
    solids = shape.Solids()
    index = next(i for i,s in enumerate(solids) if abs(s.BoundingBox().xlen-39) < 1e-6 and abs(s.BoundingBox().zlen-8) < 1e-6)
    x,y,z,a,b,c = review['headerBoundsMm']
    solids[index] = cq.Solid.makeBox(a-x,b-y,c-z,cq.Vector(x,y,z))
    cq.Compound.makeCompound(solids).exportBrep(str(output / ZERO))
    old = load(root / 'digital-twin/validation/expected/m5/instructional-receipts/PX-V40-DEF-ZERO2W.json')
    record = {'id':'PX-M7-ZERO2W-HEADER-CANDIDATE-03','track':'instructional-only','definitionId':review['definitionId'],
              'definitionRevision':1,'instructionalArtifactRevision':2,'status':'CANDIDATE_REQUIRES_INDEPENDENT_ADOPTION',
              'oldArtifact':binding(root,old_path),'artifact':binding(output,ZERO),
              'oldReceipt':binding(root,'digital-twin/validation/expected/m5/instructional-receipts/PX-V40-DEF-ZERO2W.json'),
              'inputBindings':[binding(root,review_path),binding(root,'digital-twin/cad/twin_cad/assemblies/instructional/anchor_boards.py'),binding(root,'digital-twin/cad/twin_cad/assemblies/instructional/anchor_correspondence.py')],
              'scope':review['scope'],'sourceLimitations':[*old['sourceLimitations'],*review['sourceLimitations']],
              'blockerIds':old['blockerIds'],'mustNotDrive':old['mustNotDrive'],
              'engineeringAdmission':False,'runtimeAdmission':False,'physicalFit':'BLOCKED','headerReadiness':'Q-14_UNRESOLVED','inventoryItemIncrement':0}
    (output/'zero-header-candidate.json').write_bytes(rfc8785.dumps(record)+b'\n')



def board_candidate(root, solutions, artifacts, variant):
    review_path = PRESENTATION + '/step02-source-review-03.json'
    review = load(root / review_path)
    branch = review['variants'][variant]
    s01 = load(solutions / (variant + '-S01.json'))
    supports = {p['instanceId']: p for p in s01['after']}
    rotation = np.array(branch['rotation'], dtype=np.float64)
    targets = [np.array(supports[p['supportId']]['translationMm'][:2]) for p in branch['supportPairings']]
    locals_ = [rotation[:2, :2] @ np.array(p['localHole']) for p in branch['supportPairings']]
    xy = np.mean([target - local for target, local in zip(targets, locals_)], axis=0)
    graph_path = f'digital-twin/validation/m2/{variant}/compiled-graph.json'
    graph = load(root / graph_path)
    step = graph['steps'][1]
    pose = {'instanceId': branch['instanceId'], 'translationMm': [*xy.tolist(), branch['pcbBottomHeightMm']],
            'rotation': branch['rotation'], 'featureRef': 'actualPCB.mountingBores', 'role': 'board'}
    after = [*s01['after'], pose]
    # Unknown components remain explicit; no implicit identity pose or omission.
    after.extend({'instanceId': i, 'pose': None, 'status': 'BLOCKED',
                  'reason': 'Upper-support/USB engagement is pending independent contact and source-frame closure'}
                 for i in step['introducedInstanceIds'] if i != branch['instanceId'])
    return {'id': f'PX-M7-INSTRUCTIONAL-{variant}-S02-BOARD-03', 'revision': 3,
            'track': 'instructional-only', 'variantId': variant, 'stepId': step['id'], 'printedNumber': 2,
            'graphHash': graph['graphHash'], 'modelHash': graph['modelHash'], 'operationIds': step['operationIds'],
            'connectionIds': [c['id'] for c in graph['mechanicalConnections'] if c['activationOperationId'] in step['operationIds']],
            'before': s01['after'], 'after': after, 'boardPose': pose, 'scale': [1, 1, 1],
            'inputBindings': [binding(root, review_path), binding(root, graph_path),
                              binding(solutions, variant + '-S01.json'),
                              binding(root, 'digital-twin/cad/twin_cad/assemblies/instructional/anchor_boards.py'),
                              binding(root, 'digital-twin/cad/twin_cad/assemblies/instructional/anchor_correspondence.py')],
            'artifactBinding': binding(artifacts, ARTIFACT) if variant == 'rpi5' else binding(artifacts.parent / 'anchor/boards', ZERO),
            'remainingDOF': [], 'completeAssemblyOutput': False, 'engineeringAdmission': False, 'runtimeAdmission': False,
            'approximationFlags': ['replaceablePose', 'sourceLimitedPlateHoles', 'schematicBoardEnvelopes'],
            'recipe': {'instanceId': branch['instanceId'], 'anchorInstances': [p['supportId'] for p in branch['supportPairings']],
                       'localFeature': 'actualPCB.mountingBores', 'approachAxis': [0, 0, -1],
                       'stagingOffsetMm': [0, 0, 30], 'stagingOnly': True, 'installationSweep': 'BLOCKED'},
            'claims': {'boardDirection': 'CANDIDATE', 'mountCenterMatching': 'CANDIDATE', 'fullStep': 'BLOCKED',
                       'physicalFit': 'BLOCKED', 'installationSweep': 'BLOCKED'},
            'accessoryStatus': branch['microphone'], 'headerStatus': branch.get('headerReadiness', 'Owner configuration unresolved Q-10'),
            'engineeringBlockerIds': step['blockerIds']}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', required=True, type=Path)
    parser.add_argument('--solutions', required=True, type=Path)
    parser.add_argument('--output', required=True, type=Path)
    parser.add_argument('--artifacts', required=True, type=Path)
    args = parser.parse_args()
    args.output.mkdir(parents=True, exist_ok=False)
    zero_candidate(args.root, args.output)
    for variant in ['rpi5', 'rpi-zero-2-w']:
        (args.output / (variant + '-S02-board.json')).write_bytes(rfc8785.dumps(board_candidate(args.root, args.solutions, args.artifacts, variant)) + b'\n')


if __name__ == '__main__':
    main()
