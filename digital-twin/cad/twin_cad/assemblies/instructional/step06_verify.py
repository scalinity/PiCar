"""Independent S06 re-measurement; never imports the S06 generator."""
import argparse
from pathlib import Path
import rfc8785
from ...contracts import load
from .verify import require, digest

PRESENTATION = 'digital-twin/assemblies/v40/presentation/instructional'
FIELDS = {'id', 'revision', 'track', 'variantId', 'stepId', 'printedNumber', 'graphHash', 'modelHash', 'placements', 'recipes', 'consumables', 'batteryLocation',
          'limitations', 'claims', 'engineeringBlockerIds', 'inputBindings', 'engineeringAdmission', 'runtimeAdmission'}
CLAIMS = {'staticPlacement': 'INSTRUCTIONAL_PASS', 'installationSweep': 'NOT_CLAIMED', 'physicalFit': 'NOT_CLAIMED'}
BATTERY = 'PX-V40-INS-BATTERY-001'


def verify(root, record, previous, context=None):
    require(set(record) == FIELDS, 'CLOSED_STEP06_RECORD')
    require(record['engineeringAdmission'] is False and record['runtimeAdmission'] is False and record['claims'] == CLAIMS, 'ENGINEERING_FIREWALL')
    scope = load(root / PRESENTATION / 'product-scope.json')
    variant = record['variantId']
    require(variant in scope['activeProductVariants'], 'PRESERVED_NON_TARGET_OR_UNSUPPORTED_VARIANT')
    require(record['id'] == f'PX-M7-S06-CONSUMABLES-{variant}-04' and record['revision'] == 4 and record['track'] == 'instructional-only', 'STEP06_IDENTITY')
    review = load(root / (PRESENTATION + '/step06-review-04.json'))
    require(record['limitations'] == review['limitations'], 'LIMITATION_REMOVAL')
    for binding in record['inputBindings']:
        require(binding == digest(root, binding['path']), 'INPUT_BYTES_CHANGED')
    graph = load(root / f'digital-twin/validation/m2/{variant}/compiled-graph.json')
    step = graph['steps'][5]
    require(record['graphHash'] == graph['graphHash'] and record['modelHash'] == graph['modelHash'] and record['stepId'] == step['id'], 'GRAPH_MODEL_BINDING')
    # No solid is installed by this step: no pose may appear, and nothing may be staged.
    require(record['placements'] == [] and record['recipes'] == [], 'NO_SOLID_IS_INSTALLED')
    connections = {c['id']: c for c in graph['mechanicalConnections']}
    kinds = {d['definitionId']: d['recipe'] for d in load(root / 'digital-twin/validation/expected/m5/instructional-parameters.json')['definitions']}
    definition_of = {i['id']: i['definitionId'] for i in graph['instances']}
    expected = []
    for op in graph['operations']:
        if op['id'] in step['operationIds'] and op['kind'] == 'applyConsumable':
            c = connections[op['payload']['connectionId']]
            expected.append({'operationId': op['id'], 'pieceInstanceId': op['payload']['pieceInstanceId'], 'connectionId': c['id'], 'endpoints': [e['instanceId'] for e in c['endpoints']]})
    require(record['consumables'] == expected and len(expected) == 2, 'EXACT_SEMANTIC_OWNERSHIP')
    require(all(kinds[definition_of[c['pieceInstanceId']]] == 'abstract' for c in expected), 'TAPE_MUST_BE_ZERO_SOLID')
    row = load(root / PRESENTATION / 'step-dispositions.json')['variants'][variant]['steps'][5]
    location = next(d['location'] for d in row['dispositions'] if d['instanceId'] == BATTERY)
    require(record['batteryLocation'] == location == 'tray' and BATTERY in step['introducedInstanceIds'], 'BATTERY_STAYS_OFF_THE_CHASSIS')
    require(all(p['instanceId'] != BATTERY for p in previous['placements']), 'BATTERY_HAS_NO_IMPLICIT_TRANSFORM')
    return {'status': 'PASS', 'variantId': variant, 'consumables': len(expected), 'batteryLocation': location, 'physicalFit': 'NOT_CLAIMED',
            'installationSweep': 'NOT_CLAIMED', 'engineeringAdmission': False, 'runtimeAdmission': False}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    for name in ['root', 'closures', 'step', 'output']:
        parser.add_argument('--' + name, required=True, type=Path)
    args = parser.parse_args()
    results = [verify(args.root, load(args.step / f'{v}-S06-record.json'), load(args.closures / f'{v}-S05-closure.json')) for v in ['rpi5', 'rpi-zero-2-w']]
    args.output.write_bytes(rfc8785.dumps({'status': 'PASS', 'scope': 'S06 consumables only', 'results': results, 'engineeringAdmission': False}) + b'\n')


if __name__ == '__main__':
    main()
