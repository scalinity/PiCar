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
OLD = 'digital-twin/validation/expected/m5/instructional-artifacts/PX-V40-DEF-PI5.brep'


def revised_pi5(root, output):
    old = cq.Shape.importBrep(str(root / OLD))
    solids = old.Solids()
    if len(solids) != 8:
        raise Invalid('EXPECTED_HISTORICAL_PI5_TOPOLOGY')
    parts = []
    changed = []
    for index, solid in enumerate(solids):
        b = solid.BoundingBox()
        # Actual larger, lower-height bank block denotes Ethernet in M5 recipe.
        if abs(b.xmin - 68) < 1e-6 and abs(b.ymin - 39.2) < 1e-6 and abs(b.zmax - 15.1) < 1e-6:
            solid = solid.translate((0, -36.4, 0))
            changed.append({'oldSolidOrdinal': index, 'role': 'Ethernet schematic', 'translationMm': [0, -36.4, 0]})
        elif abs(b.xmin - 68) < 1e-6 and abs(b.ymin - 2.8) < 1e-6 and abs(b.zmax - 16.6) < 1e-6:
            solid = solid.translate((0, 36.4, 0))
            changed.append({'oldSolidOrdinal': index, 'role': 'outer USB pair schematic', 'translationMm': [0, 36.4, 0]})
        parts.append(solid)
    if len(changed) != 2:
        raise Invalid('EXACT_TWO_BANK_MEMBERS_ONLY')
    shape = cq.Compound.makeCompound(parts)
    shape.exportBrep(str(output / ARTIFACT))
    receipt = {
        'id': 'PX-M5-INSTRUCTIONAL-PI5-REVISION-02', 'instructionalArtifactRevision': 2,
        'definitionId': 'PX-V40-DEF-PI5', 'definitionRevision': 1, 'variantId': 'rpi5',
        'track': 'instructional-only', 'instructionalStatus': 'CANDIDATE_REQUIRES_INDEPENDENT_ADOPTION',
        'engineeringStatus': 'BLOCKED', 'engineeringAdmission': False, 'runtimeAdmission': False,
        'reason': 'Correct schematic Pi5 Ethernet/USB ordering from official component-side drawing and STEP. V40 reflection was a separate M7 source-side interpretation error.',
        'oldArtifact': binding(root, OLD),
        'oldReceipt': binding(root, 'digital-twin/validation/expected/m5/instructional-receipts/PX-V40-DEF-PI5.json'),
        'artifactRelativePath': ARTIFACT, 'newArtifact': binding(output, ARTIFACT),
        'changedBankMembers': changed, 'unchanged': ['PCB', 'all four mounting bores', 'GPIO marker', 'other schematic connectors', 'PartDefinition identity'],
        'inputBindings': [binding(root, PRESENTATION + '/pi5-board-direction-review-02.json'),
                          binding(root, 'digital-twin/cad/twin_cad/assemblies/instructional/remediate.py')],
        'scale': [1, 1, 1], 'rightHandedPartLocalFrame': True,
        'blockerIds': load(root / 'digital-twin/validation/expected/m5/instructional-receipts/PX-V40-DEF-PI5.json')['blockerIds'],
        'sourceLimitations': load(root / 'digital-twin/validation/expected/m5/instructional-receipts/PX-V40-DEF-PI5.json')['sourceLimitations'],
        'mustNotDrive': load(root / 'digital-twin/validation/expected/m5/instructional-receipts/PX-V40-DEF-PI5.json')['mustNotDrive'],
        'revisionLimits': 'Same coarse envelopes, not measured socket cavities or latch/contact faces; no physical USB engagement or camera insertion proof.'}
    (output / 'pi5-revision-candidate.json').write_bytes(rfc8785.dumps(receipt) + b'\n')


def board_candidate(root, solutions, output, variant):
    review_path = PRESENTATION + '/step02-source-review-02.json'
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
    return {'id': f'PX-M7-INSTRUCTIONAL-{variant}-S02-BOARD-02', 'revision': 2,
            'track': 'instructional-only', 'variantId': variant, 'stepId': step['id'], 'printedNumber': 2,
            'graphHash': graph['graphHash'], 'modelHash': graph['modelHash'], 'operationIds': step['operationIds'],
            'connectionIds': [c['id'] for c in graph['mechanicalConnections'] if c['activationOperationId'] in step['operationIds']],
            'before': s01['after'], 'after': after, 'boardPose': pose, 'scale': [1, 1, 1],
            'inputBindings': [binding(root, review_path), binding(root, graph_path),
                              binding(solutions, variant + '-S01.json'),
                              binding(root, 'digital-twin/cad/twin_cad/assemblies/instructional/remediate.py'),
                              binding(root, 'digital-twin/cad/twin_cad/assemblies/instructional/correspondence.py')],
            'artifactBinding': binding(output, ARTIFACT) if variant == 'rpi5' else binding(root, 'digital-twin/validation/expected/m5/instructional-artifacts/PX-V40-DEF-ZERO2W.brep'),
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
    args = parser.parse_args()
    args.output.mkdir(parents=True, exist_ok=False)
    revised_pi5(args.root, args.output)
    for variant in ['rpi5', 'rpi-zero-2-w']:
        (args.output / (variant + '-S02-board.json')).write_bytes(rfc8785.dumps(board_candidate(args.root, args.solutions, args.output, variant)) + b'\n')


if __name__ == '__main__':
    main()
