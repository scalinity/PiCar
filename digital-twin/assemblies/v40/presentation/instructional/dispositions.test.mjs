import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {replay, DISPOSITION_FILE} from './dispositions.mjs';
import {root, presentation} from './gate.mjs';

const expectedPrefixes = v => JSON.parse(fs.readFileSync(path.join(root, 'digital-twin/validation/m2', v, 'expected-prefixes.json'))).prefixes;

test('replay covers exactly the two active variants with 29 steps each', () => {
  const r = replay();
  assert.deepEqual(Object.keys(r.variants), ['rpi5', 'rpi-zero-2-w']);
  for (const v of Object.keys(r.variants)) assert.deepEqual(r.variants[v].steps.map(s => s.printedNumber), Array.from({length: 29}, (_, i) => i + 1));
});

test('step boundary state hashes equal the accepted M2 expected prefixes', () => {
  const r = replay();
  for (const [v, rec] of Object.entries(r.variants)) {
    const prefixes = expectedPrefixes(v);
    let count = 0;
    for (const s of rec.steps) {
      assert.equal(s.beforeStateHash, prefixes[count].stateHash);
      count += s.operationIds.length;
      assert.equal(s.afterStateHash, prefixes[count].stateHash);
    }
  }
});

test('S01 installs exactly its nine introduced instances and nothing else', () => {
  const r = replay();
  for (const rec of Object.values(r.variants)) {
    const s1 = rec.steps[0];
    const installed = s1.dispositions.filter(d => d.location === 'assembly').map(d => d.instanceId).sort();
    assert.deepEqual(installed, [...s1.introducedInstanceIds].sort());
  }
});

test('committed disposition file equals a fresh replay', () => {
  const committed = fs.readFileSync(path.join(presentation, DISPOSITION_FILE));
  assert.equal(committed.toString(), JSON.stringify(replay(), null, 1) + '\n');
});

test('inactive Pi4 is never replayed', () => {
  assert.equal(JSON.stringify(replay()).includes('"rpi4"'), false);
});
