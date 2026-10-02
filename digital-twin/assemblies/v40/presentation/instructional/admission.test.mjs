import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {coverage, evaluate, presentation, ROW_CHECKS} from './gate.mjs';

const sha = b => crypto.createHash('sha256').update(b).digest('hex');
const read = p => JSON.parse(fs.readFileSync(p));
const scope = read(path.join(presentation, 'product-scope.json'));
const NON_TARGET = [{variantId: 'rpi4', status: 'PRESERVED_NON_TARGET', historicalGraphHash: 'ce9dd71eb9728f1538e2fb311f99450cdafc0df96c91033cf0333e6bec51eac7', newOutputsRequired: false}];
const CLAIMS = {staticPlacement: 'INSTRUCTIONAL_PASS', installationSweep: 'NOT_CLAIMED', collisionFreeInstallPath: 'NOT_CLAIMED', physicalFit: 'NOT_CLAIMED', threadEngagement: 'NOT_CLAIMED', fullSteeringTravel: 'NOT_CLAIMED'};

// Fixtures stand in for the independent Python verifier's output; they test only the gate's binding logic.
function fixture(keys) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'm7-admission-'));
  const base = coverage().rows;
  const results = [], admissions = {};
  fs.mkdirSync(path.join(tmp, 'closures'));
  for (const key of keys) {
    const [variantId, number] = key.split('/');
    const row = base.find(r => r.variantId === variantId && r.printedNumber === Number(number));
    const closure = {id: `PX-M7-CLOSURE-${variantId}-S${String(number).padStart(2, '0')}-01`, variantId, printedNumber: Number(number), graphHash: row.graphHash,
      beforeStateHash: row.beforeStateHash, afterStateHash: row.afterStateHash, claims: CLAIMS, engineeringAdmission: false, runtimeAdmission: false};
    const canonical = Buffer.from(JSON.stringify(closure));
    const closurePath = `closures/${variantId}-S${number}.json`;
    fs.writeFileSync(path.join(tmp, closurePath), Buffer.concat([canonical, Buffer.from('\n')]));
    results.push({status: 'PASS', instructionalStatus: 'INSTRUCTIONAL_ADMITTED', variantId, printedNumber: Number(number), closureId: closure.id,
      closureRfc8785Sha256: sha(canonical), checks: ROW_CHECKS, forbiddenPenetrations: [], physicalFit: 'NOT_CLAIMED', installationSweep: 'NOT_CLAIMED',
      engineeringAdmission: false, runtimeAdmission: false});
    admissions[key] = {closurePath};
  }
  const proofBytes = Buffer.from(JSON.stringify({status: 'PASS', results, engineeringAdmission: false}) + '\n');
  fs.writeFileSync(path.join(tmp, 'closure-observations.json'), proofBytes);
  for (const key of keys) {
    const bytes = fs.readFileSync(path.join(tmp, admissions[key].closurePath));
    admissions[key] = {proof: {path: 'closure-observations.json', rawSha256: sha(proofBytes), bytes: proofBytes.length},
      closure: {path: admissions[key].closurePath, rawSha256: sha(bytes), bytes: bytes.length}};
  }
  return {tmp, admissions, proofSha: sha(proofBytes)};
}

const reportOf = (admissions, extra = {}) => ({productScope: scope, rows: coverage(admissions).rows, preservedNonTarget: NON_TARGET, engineeringAdmission: false, runtimeAdmission: false, ...extra});
const qualification = proofSha => ({runs: [{label: 'qualification-a-15', status: 'PASS', commands: 21, closureProofRawSha256: proofSha}, {label: 'qualification-b-15', status: 'PASS', commands: 21, closureProofRawSha256: proofSha}],
  rawOutputsMatch: true, preservation: {status: 'PASS'}});

test('a row verified by a bound independent proof is admitted and the rest stay blocked', () => {
  const f = fixture(['rpi5/1']);
  const report = reportOf(f.admissions);
  const row = report.rows.find(r => r.variantId === 'rpi5' && r.printedNumber === 1);
  assert.equal(row.instructionalStatus, 'INSTRUCTIONAL_ADMITTED');
  assert.equal(row.engineeringStatus, 'BLOCKED');
  assert.equal(row.completeAssemblyOutput, true);
  assert.equal(report.rows.filter(r => r.instructionalStatus === 'INSTRUCTIONAL_ADMITTED').length, 1);
  assert.equal(evaluate(report, {root: f.tmp}), 'BLOCKED');
});

const CORRUPTIONS = {
  'proof bytes changed': f => fs.appendFileSync(path.join(f.tmp, 'closure-observations.json'), ' '),
  'closure bytes changed': f => fs.appendFileSync(path.join(f.tmp, 'closures/rpi5-S1.json'), ' '),
  // The closure is edited and its file binding recomputed, so only the proof's canonical closure hash can notice.
  'closure rebound but proof stale': f => {
    const file = path.join(f.tmp, 'closures/rpi5-S1.json');
    const edited = read(file);
    edited.placements = [{instanceId: 'PX-V40-INS-WRENCH-001'}];
    const bytes = Buffer.from(JSON.stringify(edited) + '\n');
    fs.writeFileSync(file, bytes);
    f.admissions['rpi5/1'].closure = {path: 'closures/rpi5-S1.json', rawSha256: sha(bytes), bytes: bytes.length};
  },
  'proof FAIL': f => { const p = read(path.join(f.tmp, 'closure-observations.json')); p.results[0].status = 'FAIL'; rewrite(f, p); },
  'checks shortened': f => { const p = read(path.join(f.tmp, 'closure-observations.json')); p.results[0].checks = ROW_CHECKS.slice(1); rewrite(f, p); },
  'penetration present': f => { const p = read(path.join(f.tmp, 'closure-observations.json')); p.results[0].forbiddenPenetrations = [{}]; rewrite(f, p); },
  'sweep claimed': f => { const p = read(path.join(f.tmp, 'closure-observations.json')); p.results[0].installationSweep = 'PASS'; rewrite(f, p); },
  'fit claimed': f => { const p = read(path.join(f.tmp, 'closure-observations.json')); p.results[0].physicalFit = 'PASS'; rewrite(f, p); },
  'proof engineering promotion': f => { const p = read(path.join(f.tmp, 'closure-observations.json')); p.results[0].engineeringAdmission = true; rewrite(f, p); },
  'wrong row proof': f => { const p = read(path.join(f.tmp, 'closure-observations.json')); p.results[0].printedNumber = 2; rewrite(f, p); }
};

function rewrite(f, proof) {
  const bytes = Buffer.from(JSON.stringify(proof) + '\n');
  fs.writeFileSync(path.join(f.tmp, 'closure-observations.json'), bytes);
  f.admissions['rpi5/1'].proof = {path: 'closure-observations.json', rawSha256: sha(bytes), bytes: bytes.length};
}

for (const [name, corrupt] of Object.entries(CORRUPTIONS)) {
  test('admission rejected: ' + name, () => {
    const f = fixture(['rpi5/1']);
    corrupt(f);
    assert.throws(() => evaluate(reportOf(f.admissions), {root: f.tmp}));
  });
}

test('a closure whose state hash disagrees with the accepted replay is rejected', () => {
  const f = fixture(['rpi5/1']);
  const report = reportOf(f.admissions);
  report.rows.find(r => r.printedNumber === 1 && r.variantId === 'rpi5').afterStateHash = '0'.repeat(64);
  assert.throws(() => evaluate(report, {root: f.tmp}), /ACCEPTED_REPLAY_BINDING|CLOSURE_STATE_BINDING/);
});

test('string, empty and missing proof references are refused', () => {
  const f = fixture(['rpi5/1']);
  for (const bad of ['forged', {}, {path: 'x'}, null]) {
    const report = reportOf(f.admissions);
    const row = report.rows.find(r => r.printedNumber === 1 && r.variantId === 'rpi5');
    row.independentProofRef = bad;
    assert.throws(() => evaluate(report, {root: f.tmp}), /MISSING_INDEPENDENT_PROOF|PROOF_BINDING/);
  }
});

test('an admitted row cannot keep a blocker or claim engineering admission', () => {
  const f = fixture(['rpi5/1']);
  const report = reportOf(f.admissions);
  const row = report.rows.find(r => r.printedNumber === 1 && r.variantId === 'rpi5');
  row.engineeringStatus = 'PASS';
  assert.throws(() => evaluate(report, {root: f.tmp}));
});

const ALL = scope.activeProductVariants.flatMap(v => Array.from({length: 29}, (_, i) => `${v}/${i + 1}`));

test('58 admitted rows still need two matching clean qualifications and preservation', () => {
  const f = fixture(ALL);
  assert.throws(() => evaluate(reportOf(f.admissions), {root: f.tmp}), /QUALIFICATION/);
  assert.equal(evaluate(reportOf(f.admissions, {qualification: qualification(f.proofSha)}), {root: f.tmp}), 'PASS');
  for (const [name, edit] of [['one run', q => q.runs.pop()], ['same label twice', q => { q.runs[1].label = q.runs[0].label; }],
    ['failed run', q => { q.runs[1].status = 'FAIL'; }], ['raw outputs differ', q => { q.rawOutputsMatch = false; }],
    ['other proof', q => { q.runs[0].closureProofRawSha256 = '0'.repeat(64); }], ['preservation not PASS', q => { q.preservation.status = 'BLOCKED'; }],
    ['different command counts', q => { q.runs[0].commands = 20; }]]) {
    const q = qualification(f.proofSha);
    edit(q);
    assert.throws(() => evaluate(reportOf(f.admissions, {qualification: q}), {root: f.tmp}), /QUALIFICATION/, name);
  }
});

test('57 admitted rows cannot pass even with perfect qualification', () => {
  const f = fixture(ALL.slice(1));
  assert.equal(evaluate(reportOf(f.admissions, {qualification: qualification(f.proofSha)}), {root: f.tmp}), 'BLOCKED');
});
