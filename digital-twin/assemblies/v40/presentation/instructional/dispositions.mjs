// Per-step instance dispositions from the accepted M2 reducer; additive M7 record, no canonical mutation.
// The Python closure oracle consumes this file instead of the generator's own flags.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {applyOperation} from '../../../../../picarx-companion/src/domain/assembly/reducer.ts';
import {hash as semanticHash} from '../../../../tools/compiler/hash.mjs';
import {root, presentation, validateScope} from './gate.mjs';

export const DISPOSITION_FILE = 'step-dispositions.json';
const read = p => JSON.parse(fs.readFileSync(p));

export function replay() {
  const scope = validateScope(read(path.join(presentation, 'product-scope.json')));
  const registry = read(path.join(root, 'digital-twin/validation/m2/runtime-registry.json'));
  const variants = {};
  for (const variant of scope.activeProductVariants) {
    const graph = read(path.join(root, 'digital-twin/validation/m2', variant, 'compiled-graph.json'));
    const expected = read(path.join(root, 'digital-twin/validation/m2', variant, 'expected-prefixes.json')).prefixes;
    const inputs = {graph, registry};
    let state = structuredClone(graph.initialState), count = 0;
    assert.equal(state.stateHash, expected[0].stateHash, 'ACCEPTED_INITIAL_STATE_DRIFT');
    const steps = [];
    for (const step of graph.steps) {
      const beforeStateHash = state.stateHash;
      for (const id of step.operationIds) {
        state = applyOperation(state, graph.operations.find(o => o.id === id), inputs, semanticHash).state;
        count++;
        assert.equal(state.stateHash, expected[count].stateHash, 'ACCEPTED_PREFIX_DRIFT');
      }
      steps.push({
        stepId: step.id, printedNumber: step.printedNumber, beforeStateHash, afterStateHash: state.stateHash,
        operationIds: step.operationIds, introducedInstanceIds: step.introducedInstanceIds, usedInstanceIds: step.usedInstanceIds,
        // Absent instance = location 'available'; only stateful instances are listed.
        dispositions: state.instances.filter(i => i.location !== 'available').map(i => ({instanceId: i.instanceId, location: i.location, parentAssemblyId: i.parentAssemblyId}))
      });
    }
    variants[variant] = {graphHash: graph.graphHash, modelHash: graph.modelHash, steps};
  }
  return {id: 'PX-M7-STEP-DISPOSITIONS-01', track: 'instructional-only', source: 'accepted M2 reducer replay, verified against expected-prefixes stateHash at every operation', variants};
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const out = path.join(presentation, DISPOSITION_FILE);
  fs.writeFileSync(out, JSON.stringify(replay(), null, 1) + '\n');
  console.log('wrote ' + path.relative(root, out));
}
