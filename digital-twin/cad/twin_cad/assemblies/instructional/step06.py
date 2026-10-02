"""S06 hook-and-loop preparation: the battery enters the tray and two zero-solid tape consumables are applied.

No solid is installed, so the record carries no pose; it states the zero-solid applications and that the battery has no
implicit transform. Independent re-measurement lives in step06_verify.py, which never imports this module.
"""
import argparse
from pathlib import Path
import rfc8785
from ...contracts import load
from .verify import require, digest
from .frames import CLAIMS

PRESENTATION = 'digital-twin/assemblies/v40/presentation/instructional'
MODULE = 'digital-twin/cad/twin_cad/assemblies/instructional/step06.py'
ORACLE = 'digital-twin/cad/twin_cad/assemblies/instructional/step06_verify.py'
BATTERY = 'PX-V40-INS-BATTERY-001'


def applications(graph, step):
    connections = {c['id']: c for c in graph['mechanicalConnections']}
    rows = []
    for op in graph['operations']:
        if op['id'] in step['operationIds'] and op['kind'] == 'applyConsumable':
            c = connections[op['payload']['connectionId']]
            rows.append({'operationId': op['id'], 'pieceInstanceId': op['payload']['pieceInstanceId'], 'connectionId': c['id'],
                         'endpoints': [e['instanceId'] for e in c['endpoints']]})
    return rows


def build(root, variant, previous):
    scope = load(root / PRESENTATION / 'product-scope.json')
    require(variant in scope['activeProductVariants'], 'PRESERVED_NON_TARGET_OR_UNSUPPORTED_VARIANT')
    require(previous['variantId'] == variant and previous['printedNumber'] == 5, 'PREVIOUS_IS_S05_OF_SAME_VARIANT')
    review_path = PRESENTATION + '/step06-review-04.json'
    review = load(root / review_path)
    graph_path = f'digital-twin/validation/m2/{variant}/compiled-graph.json'
    graph = load(root / graph_path)
    step = graph['steps'][5]
    disposition = load(root / PRESENTATION / 'step-dispositions.json')['variants'][variant]['steps'][5]
    battery = next(d for d in disposition['dispositions'] if d['instanceId'] == BATTERY)
    inputs = [digest(root, review_path), digest(root, graph_path), digest(root, PRESENTATION + '/step-dispositions.json'), digest(root, MODULE), digest(root, ORACLE)]
    return {'id': f'PX-M7-S06-CONSUMABLES-{variant}-04', 'revision': 4, 'track': 'instructional-only', 'variantId': variant, 'stepId': step['id'], 'printedNumber': 6,
            'graphHash': graph['graphHash'], 'modelHash': graph['modelHash'], 'placements': [], 'recipes': [], 'consumables': applications(graph, step),
            'batteryLocation': battery['location'], 'limitations': review['limitations'], 'claims': dict(CLAIMS),
            'engineeringBlockerIds': step['blockerIds'], 'inputBindings': inputs, 'engineeringAdmission': False, 'runtimeAdmission': False}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    for name in ['root', 'closures', 'output']:
        parser.add_argument('--' + name, required=True, type=Path)
    args = parser.parse_args()
    args.output.mkdir(parents=True, exist_ok=False)
    scope = load(args.root / PRESENTATION / 'product-scope.json')
    for variant in scope['activeProductVariants']:
        (args.output / f'{variant}-S06-record.json').write_bytes(rfc8785.dumps(build(args.root, variant, load(args.closures / f'{variant}-S05-closure.json'))) + b'\n')


if __name__ == '__main__':
    main()
