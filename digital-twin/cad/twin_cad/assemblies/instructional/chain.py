"""Runs the authored generator chain in step order: each step record, then its uniform closure.

Generation only. Every record and closure is re-measured afterwards by independent verifier modules that
never import the generators; a step whose inputs are missing or refused stops its variant's chain with a
blocked note and no later step is produced from it.
"""
import argparse
from pathlib import Path
import rfc8785
from ...contracts import load, Invalid
from . import closure, hat, step05, step06, step07, step08, step09

PRESENTATION = 'digital-twin/assemblies/v40/presentation/instructional'


def record_builders(root, engagement):
    return {4: lambda variant, previous: hat.build(root, variant, previous, engagement),
            5: lambda variant, previous: step05.build(root, variant, previous),
            6: lambda variant, previous: step06.build(root, variant, previous),
            7: lambda variant, previous: step07.build(root, variant, previous),
            8: lambda variant, previous: step08.build(root, variant, previous),
            9: lambda variant, previous: step09.build(root, variant, previous)}


def write(path, value):
    path.write_bytes(rfc8785.dumps(value) + b'\n')


def run(root, solutions, boards, engagement, artifacts, usb, camera, output):
    output.mkdir(parents=True, exist_ok=False)
    steps, closures = output / 'steps', output / 'closures'
    steps.mkdir()
    closures.mkdir()
    builders = record_builders(root, engagement)
    scope = load(root / PRESENTATION / 'product-scope.json')
    produced = {}
    for variant in scope['activeProductVariants']:
        previous = None
        for number in sorted(closure.ADAPTERS):
            if number in builders:
                try:
                    write(steps / f'{variant}-S{number:02d}-record.json', builders[number](variant, previous))
                except Invalid as error:
                    write(closures / f'{variant}-S{number:02d}-blocked.json', {'variantId': variant, 'printedNumber': number, 'status': 'BLOCKED', 'stage': 'record', 'reason': str(error)})
                    break
            try:
                previous = closure.build(root, variant, number, solutions, boards, engagement, artifacts, previous, usb, camera, steps)
            except Invalid as error:
                write(closures / f'{variant}-S{number:02d}-blocked.json', {'variantId': variant, 'printedNumber': number, 'status': 'BLOCKED', 'stage': 'closure', 'reason': str(error)})
                break
            write(closures / f'{variant}-S{number:02d}-closure.json', previous)
            produced.setdefault(variant, []).append(number)
    return produced


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    for name in ['root', 'solutions', 'boards', 'engagement', 'artifacts', 'usb', 'camera', 'output']:
        parser.add_argument('--' + name, required=True, type=Path)
    args = parser.parse_args()
    produced = run(args.root, args.solutions, args.boards, args.engagement, args.artifacts, args.usb, args.camera, args.output)
    print(rfc8785.dumps({'produced': produced}).decode())


if __name__ == '__main__':
    main()
