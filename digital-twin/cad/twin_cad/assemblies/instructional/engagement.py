"""S02 upper-support candidates and additive HAT feature representation.

Only authored presentation solids; no vendor shape, engineering interface or fit.
"""
import argparse
import copy
from pathlib import Path
import cadquery as cq
import rfc8785
from ...contracts import load
from .generate import binding, PRESENTATION


HAT = 'PX-V40-DEF-ROBOT-HAT-INSTRUCTIONAL-02.brep'
MODULE = 'digital-twin/cad/twin_cad/assemblies/instructional/engagement.py'
ORACLE = 'digital-twin/cad/twin_cad/assemblies/instructional/engagement_verify.py'


def upper_supports(root, solutions, artifacts, boards, variant):
    prior = load(boards / (variant + '-S02-board.json'))
    review_path = PRESENTATION + '/step02-upper-support-review-03.json'
    review = load(root / review_path)
    branch = review['variants'][variant]
    graph_path = f'digital-twin/validation/m2/{variant}/compiled-graph.json'
    graph = load(root / graph_path)
    ids = {i['id']: i['definitionId'] for i in graph['instances']}
    definitions = {d['definitionId']: d for d in load(root / 'digital-twin/validation/expected/m5/instructional-parameters.json')['definitions']}
    poses = {p['instanceId']: p for p in prior['after']}
    board = prior['boardPose']
    board_shape = cq.Shape.importBrep(str(artifacts / 'PX-V40-DEF-PI5-INSTRUCTIONAL-02.brep')) if variant == 'rpi5' else cq.Shape.importBrep(str(boards / 'PX-V40-DEF-ZERO2W-INSTRUCTIONAL-02.brep'))
    # Board local z=0 is preserved; actual PCB top is the thin board solid.
    pcb = min(board_shape.Solids(), key=lambda s: abs(s.BoundingBox().zlen - 1.6))
    top = board['translationMm'][2] + pcb.BoundingBox().zmax
    recipes = []
    for stack in branch['upperStacks']:
        ident = stack['upperInstanceId']
        lower = poses[stack['lowerInstanceId']]
        parameters = {p['name']: p['value'] for p in definitions[ids[ident]]['instructionalApproximations']}
        z = top if variant == 'rpi5' else top + parameters['length']
        pose = {'instanceId': ident, 'translationMm': [*lower['translationMm'][:2], z],
                'rotation': branch['upperRotation'], 'featureRef': 'actualStandoff.bodyBearingToPCBTop', 'role': 'upperStandoff'}
        poses[ident] = pose
        staged = copy.deepcopy(pose)
        staged['translationMm'][2] += review['approachOffsetMm']
        recipes.append({'instanceId': ident, 'operationId': stack['operationId'], 'connectionId': stack['connectionId'],
                        'orderedContactStack': stack['orderedContactStack'],
                        'anchor': {'instanceId': stack['lowerInstanceId'], 'localFeature': 'actualStandoff.upperBearing'},
                        'contactFeature': {'instanceId': board['instanceId'], 'localFeature': 'actualPCB.top'},
                        'approachAxis': [0, 0, -1], 'stagedStart': staged,
                        'installationSweep': 'BLOCKED', 'physicalEngagement': 'BLOCKED', 'stagingOnly': True})
    inputs = [binding(root, review_path), binding(root, graph_path), binding(root, MODULE), binding(root, ORACLE),
              binding(root, 'digital-twin/validation/expected/m5/instructional-parameters.json'),
              binding(solutions, variant + '-S01.json'), binding(boards, variant + '-S02-board.json')]
    for definition in sorted({ids[s['upperInstanceId']] for s in branch['upperStacks']}):
        inputs.extend(binding(root, 'digital-twin/validation/expected/m5/' + folder + '/' + definition + suffix)
                      for folder, suffix in [('instructional-receipts', '.json'), ('instructional-artifacts', '.brep')])
    return {'id': f'PX-M7-INSTRUCTIONAL-{variant}-S02-UPPERS-03', 'revision': 3, 'variantId': variant,
            'stepId': 'PX-V40-STEP-02', 'printedNumber': 2, 'track': 'instructional-only',
            'graphHash': graph['graphHash'], 'modelHash': graph['modelHash'],
            'operationIds': graph['steps'][1]['operationIds'], 'inputBindings': inputs,
            'before': prior['before'], 'after': sorted(poses.values(), key=lambda p: p['instanceId']),
            'recipes': recipes, 'scale': [1, 1, 1], 'remainingDOF': [],
            'sourceLimitations': review['sourceLimitations'], 'approximationFlags': ['replaceablePose', 'omittedThreads', 'schematicPlateHoleMatching'],
            'engineeringAdmission': False, 'runtimeAdmission': False, 'completeAssemblyOutput': False,
            'claims': {'upperBearingPlacement': 'CANDIDATE', 'installationSweep': 'BLOCKED', 'physicalFit': 'BLOCKED', 'physicalEngagement': 'BLOCKED'},
            'accessoryStatus': prior['accessoryStatus'], 'headerStatus': prior['headerStatus'],
            'engineeringBlockerIds': graph['steps'][1]['blockerIds']}


def hat_candidate(root, output):
    review_path = PRESENTATION + '/hat-feature-review-03.json'
    review = load(root / review_path)
    original_path = 'digital-twin/validation/expected/m5/instructional-artifacts/PX-V40-DEF-ROBOT-HAT.brep'
    original = cq.Shape.importBrep(str(root / original_path))
    solids = original.Solids()
    params = review['parameters']
    pcb_index = next(i for i, s in enumerate(solids) if abs(s.BoundingBox().zlen - 1.6) < 1e-6 and s.BoundingBox().xlen > 64)
    pcb = solids[pcb_index]
    for x, y in params['mountCentersMm']:
        pcb = pcb.cut(cq.Solid.makeCylinder(params['holeRadiusMm'], 4, cq.Vector(x, y, -1)))
    solids[pcb_index] = pcb
    def box(bounds):
        x, y, z, a, b, c = bounds
        return cq.Solid.makeBox(a-x, b-y, c-z, cq.Vector(x, y, z))
    socket = box(params['socketBoundsMm']).cut(box(params['socketMouthBoundsMm']))
    shape = cq.Compound.makeCompound([*solids, socket])
    shape.exportBrep(str(output / HAT))
    old_receipt = load(root / 'digital-twin/validation/expected/m5/instructional-receipts/PX-V40-DEF-ROBOT-HAT.json')
    receipt = {'id': 'PX-M7-HAT-FEATURE-CANDIDATE-03', 'definitionId': review['definitionId'],
               'definitionRevision': 1, 'instructionalArtifactRevision': 2, 'track': 'instructional-only',
               'status': 'CANDIDATE_REQUIRES_INDEPENDENT_ADOPTION', 'scope': review['adoptionScope'],
               'oldArtifact': binding(root, original_path), 'artifact': binding(output, HAT),
               'oldReceipt': binding(root, 'digital-twin/validation/expected/m5/instructional-receipts/PX-V40-DEF-ROBOT-HAT.json'),
               'inputBindings': [binding(root, review_path), binding(root, MODULE), binding(root, ORACLE)],
               'sourceLimitations': [*old_receipt['sourceLimitations'], *review['sourceLimitations']],
               'blockerIds': old_receipt['blockerIds'], 'mustNotDrive': old_receipt['mustNotDrive'],
               'engineeringStatus': 'BLOCKED', 'engineeringAdmission': False, 'runtimeAdmission': False,
               'unknownActualHATRevision': True, 'installedMating': 'BLOCKED', 'physicalFit': 'BLOCKED', 'inventoryItemIncrement': 0}
    (output / 'hat-feature-candidate.json').write_bytes(rfc8785.dumps(receipt) + b'\n')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    for name in ['root', 'solutions', 'artifacts', 'boards', 'output']:
        parser.add_argument('--' + name, required=True, type=Path)
    args = parser.parse_args()
    args.output.mkdir(parents=True, exist_ok=False)
    hat_candidate(args.root, args.output)
    for variant in ['rpi5', 'rpi-zero-2-w']:
        record = upper_supports(args.root, args.solutions, args.artifacts, args.boards, variant)
        (args.output / (variant + '-S02-uppers.json')).write_bytes(rfc8785.dumps(record) + b'\n')


if __name__ == '__main__':
    main()
