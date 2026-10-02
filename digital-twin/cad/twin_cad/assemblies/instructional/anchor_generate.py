"""Revision03: installed PlateA anchor from source, original solids unchanged."""
import argparse
import hashlib
from pathlib import Path
import rfc8785
from ...contracts import load, Invalid

PRESENTATION = 'digital-twin/assemblies/v40/presentation/instructional'
IDENTITY = [[1., 0., 0.], [0., 1., 0.], [0., 0., 1.]]


def binding(root, path):
    data = (root / path).read_bytes()
    return {'path': path, 'rawSha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data)}


def generate(root, variant):
    scope = load(root / PRESENTATION / 'product-scope.json')
    if variant not in scope['activeProductVariants']:
        raise Invalid('PRESERVED_NON_TARGET_OR_UNSUPPORTED_VARIANT')
    source = load(root / PRESENTATION / 'step01-source-review-03.json')
    graph_path = f'digital-twin/validation/m2/{variant}/compiled-graph.json'
    graph = load(root / graph_path)
    step = graph['steps'][0]
    m5_path = 'digital-twin/validation/expected/m5/instructional-parameters.json'
    plate_path = 'digital-twin/validation/expected/plates/instructional/all-parameters.json'
    m5 = load(root / m5_path)
    plate = next(d for d in load(root / plate_path)['definitions'] if d['plate'] == 'A')
    definitions = {d['definitionId']: d for d in m5['definitions']}
    instances = {i['id']: i for i in graph['instances']}
    poses = [{'instanceId': 'PX-V40-INS-PLATE-A-001', 'translationMm': source['plateAAnchor']['translationMm'],
              'rotation': source['plateAAnchor']['rotation'], 'featureRef': 'plateA.replaceableAnchor', 'role': 'workpiece'}]
    recipes = []
    # Each allocation is a physical item, independent of multiple semantic connections.
    for allocation in source['variantAllocations'][variant]:
        feature = next(f for f in source['positions'] if f['name'] == allocation['position'])
        x, y, _ = feature['centerMm']
        for kind, key, height in [('standoff', 'standoffInstanceId', plate['thickness']['valueMm']),
                                  ('screw', 'screwInstanceId', 0.)]:
            ident = allocation[key]
            definition = definitions[instances[ident]['definitionId']]
            if definition['recipe'] != kind:
                raise Invalid('ALLOCATION_DEFINITION_ROLE')
            pose = {'instanceId': ident, 'translationMm': [x, y, height], 'rotation': IDENTITY,
                    'featureRef': feature['plateFeature'], 'role': kind}
            poses.append(pose)
            offset = source['approachOffsetMm'][kind]
            recipes.append({'instanceId': ident, 'anchor': {'instanceId': 'PX-V40-INS-PLATE-A-001',
                            'localFeature': feature['plateFeature']}, 'axis': feature['axis'],
                            'stagedStart': {**pose, 'translationMm': [x, y, height + offset]},
                            'finalPoseRef': ident, 'segments': ['align axis and roll', 'seat on named face'],
                            'approachOffsetMm': offset, 'stagingOnly': True,
                            'installationSweep': {'status': 'BLOCKED', 'reason': 'No independently bounded path proof'},
                            'reversal': 'Digital staging reversal only; no physical undo claim'})
    poses.sort(key=lambda p: p['instanceId'])
    required = sorted(step['introducedInstanceIds'])
    if sorted(p['instanceId'] for p in poses) != required:
        raise Invalid('MISSING_OR_DUPLICATE_PHYSICAL_INSTANCE')
    definition_ids = sorted({instances[i]['definitionId'] for i in required})
    inputs = [binding(root, graph_path), binding(root, m5_path), binding(root, plate_path),
              binding(root, PRESENTATION + '/step01-source-review-03.json'),
              binding(root, PRESENTATION + '/product-scope.json'),
              binding(root, PRESENTATION + '/gate-policy.json'), binding(root, 'digital-twin/toolchain.lock.json'),
              binding(root, 'digital-twin/cad/twin_cad/assemblies/instructional/anchor_generate.py'),
              binding(root, 'digital-twin/cad/twin_cad/assemblies/instructional/anchor_verify.py')]
    for d in definition_ids:
        path = ('digital-twin/validation/expected/plates/instructional/receipts/' if d.endswith('PLATE-A')
                else 'digital-twin/validation/expected/m5/instructional-receipts/') + d + '.json'
        receipt = load(root / path)
        if receipt['instructionalStatus'] != 'INSTRUCTIONAL_ADMITTED':
            raise Invalid('UPSTREAM_INSTRUCTIONAL_NOT_ADMITTED')
        inputs.append(binding(root, path))
        shape_path = (receipt['proofs']['brep']['path'] if d.endswith('PLATE-A')
                      else next(p for p in receipt['artifactPaths'] if p.endswith('.brep')))
        inputs.append(binding(root, shape_path))
    return {'id': f'PX-M7-INSTRUCTIONAL-{variant}-S01-03', 'revision': 3, 'track': 'instructional-only',
            'variantId': variant, 'stepId': step['id'], 'printedNumber': 1,
            'basis': 'RH-XFORWARD-YLEFT-ZUP', 'unit': 'mm', 'numericType': 'float64',
            'engineeringAdmission': False, 'runtimeAdmission': False,
            'graphHash': graph['graphHash'], 'modelHash': graph['modelHash'], 'inputBindings': inputs,
            'anchor': source['plateAAnchor'], 'operationIds': step['operationIds'],
            'connectionIds': [c['id'] for c in graph['mechanicalConnections']
                              if c['activationOperationId'] in step['operationIds']],
            'before': [{'instanceId': i, 'location': 'available', 'pose': None,
                        'reason': 'Unstaged stock has no installed or implicit identity transform'} for i in required],
            'after': poses, 'recipes': recipes,
            'remainingDOF': [], 'instructionalPurpose': 'Static S01 support relationship and exploded staging',
            'approximationFlags': ['nonEngineering', 'replaceableAnchor', 'sourceLimitedFeatures', 'omittedThreads'],
            'sourceLimitations': source['uncertainty']['sourceLimitations'],
            'engineeringBlockerIds': step['blockerIds'],
            'claims': {'staticPlacement': 'CANDIDATE_REQUIRES_INDEPENDENT_VERIFICATION',
                       'installationSweep': 'BLOCKED', 'physicalFit': 'BLOCKED', 'fullSteeringTravel': 'NOT_APPLICABLE'},
            'contactPolicy': [{'instances': sorted([a['screwInstanceId'], a['standoffInstanceId']]),
                               'kind': 'explicit instructional shaft overlap for omitted standoff bore',
                               'maximumOverlapMm3': 20., 'physicalEngagement': 'UNRESOLVED'}
                              for a in source['variantAllocations'][variant]]}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--root', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    args.output.mkdir(parents=True, exist_ok=True)
    scope = load(args.root / PRESENTATION / 'product-scope.json')
    for variant in scope['activeProductVariants']:
        (args.output / (variant + '-S01.json')).write_bytes(rfc8785.dumps(generate(args.root, variant)) + b'\n')


if __name__ == '__main__':
    main()
