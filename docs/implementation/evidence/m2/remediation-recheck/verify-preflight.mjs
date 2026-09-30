// Read-only upstream verification; writes only this attempt's diagnostic receipt.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { identities } from '../../../../../digital-twin/tools/evidence/identity.mjs';
import { loadRegistry } from '../../../../../digital-twin/tools/evidence/semantic.mjs';
import { fileHash, read } from '../../../../../digital-twin/tools/evidence/hash.mjs';

const root = fileURLToPath(new URL('../../../../../', import.meta.url));
const output = fileURLToPath(new URL('./', import.meta.url));
const git = args => execFileSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 30e6 }).trim();
const at = p => path.join(root, p);
const checkedAtUtc = new Date().toISOString();
const entryStatus = git(['status','--short']);
const accepted = '22c85058f9420aaaaf376c5e312915f5b7b5288d';
const start = 'fd8e954eaf731af95cf117b8ea4227fab88a12c7';
const m0 = '2a934710501d71aecbd8da827925c92e49378661';
assert.equal(git(['rev-parse', 'HEAD']), start);
assert.equal(git(['branch', '--show-current']), 'codex/m2-semantic-graph');
assert.equal(git(['show', '-s', '--format=%s', accepted]), 'M1: establish canonical digital twin data contracts');
git(['merge-base', '--is-ancestor', m0, accepted]);
git(['merge-base', '--is-ancestor', accepted, 'HEAD']);
assert.deepEqual(git(['diff', '--name-only', accepted, start]).split('\n').sort(), ['docs/implementation/HANDOFF_M2.md', 'docs/implementation/M1_REPORT.md']);
assert.equal(git(['diff', '--name-only']), '');
assert.equal(git(['diff', '--cached', '--name-only']), '');
const reportPath = 'docs/implementation/M1_G_DATA_REPORT.json';
assert.equal(fileHash(at(reportPath)), 'ddbdad1c00372e670b674bbc6d6bf2170b6f2b0d08a034b715e522029b644f0f');
const assignment = fs.readFileSync(at('docs/implementation/HANDOFF_M2_REMEDIATION.md'),'utf8');
const exactPaths = {
 sourceLockRawSha256:'digital-twin/evidence/sources.lock.json', semanticValidatorRawSha256:'digital-twin/tools/evidence/semantic.mjs', hashPolicyRawSha256:'digital-twin/hash-inputs.json', vectorsRawSha256:'digital-twin/validation/fixtures/hash-vectors.json',
 'model-input raw SHA-256':'digital-twin/validation/model-input.json', 'evidence-input raw SHA-256':'digital-twin/validation/evidence-input.json', 'M0 documentary lock raw SHA-256':'picarx-companion/tools/content-pipeline/documentation-source-lock.json', 'V40 PDF raw SHA-256':'picarx-companion/public/content/pdf/picar-x-assembly.pdf', 'Planning seed raw SHA-256':'docs/digital-twin/MACHINE_READABLE_SCHEMAS/v40-step-seed.json', 'Printed ledger raw SHA-256':'docs/digital-twin/MACHINE_READABLE_SCHEMAS/printed-hardware-ledger.json'
};
for(const [label,p] of Object.entries(exactPaths)) {
 const expected = assignment.split('\n').find(line=>line.startsWith(label+' = '))?.match(/[a-f0-9]{64}/)?.[0];
 assert.ok(expected,label); assert.equal(fileHash(at(p)),expected,p);
 assert.ok(fs.readFileSync(at(p)).equals(execFileSync('git',['show',accepted+':'+p],{cwd:root,maxBuffer:30e6})),p);
}
const report = read(at(reportPath));
for(const k of ['schemaHash','evidenceHash','modelHash']) assert.equal(report.identities[k],assignment.split('\n').find(line=>line.startsWith(k+' = ')).match(/[a-f0-9]{64}/)[0]);
assert.equal(report.status, 'PASS');
assert.equal(report.m2AllowedAfterCommit, true);
assert.equal(report.bindings.length, 124);
for (const binding of report.bindings) {
  assert.equal(fileHash(at(binding.path)), binding.rawSha256, binding.path);
  assert.equal(fs.statSync(at(binding.path)).size, binding.byteLength, binding.path);
  assert.ok(fs.readFileSync(at(binding.path)).equals(execFileSync('git', ['show', accepted + ':' + binding.path], { cwd: root, maxBuffer: 30e6 })), binding.path);
}
const registry = loadRegistry();
const actual = identities(registry);
for (const [key, value] of Object.entries(actual)) assert.equal(value, report.identities[key]);
const m0Report = read(at('M0_GATE_REPORT.json'));
assert.deepEqual(m0Report.checks.map(c => c.id).sort(), ['A','B','C','D','E','F','G']);
assert.ok(m0Report.checks.every(c => c.status === 'PASS'));
assert.equal(m0Report.m1Allowed, true);
const manifest = read(at('docs/implementation/evidence/m0/after-tree-manifest.json'));
for (const f of manifest.files) {
  assert.equal(fileHash(at(f.path)), f.sha256, f.path);
  assert.equal(fs.statSync(at(f.path)).size, f.bytes, f.path);
}
const allocation = read(at('docs/implementation/evidence/m0/spec-allocation.json'));
for (const f of allocation.files) {
  assert.equal(fileHash(at(f.destination)), f.sha256, f.destination);
  assert.equal(fs.statSync(at(f.destination)).size, f.bytes, f.destination);
}
assert.equal(fileHash(at(allocation.originalZip.destination)), allocation.originalZip.sha256);
assert.equal(fs.statSync(at(allocation.originalZip.destination)).size, allocation.originalZip.bytes);
const source = read(at('digital-twin/evidence/sources.lock.json'));
for (const f of [source.m0GateReport, source.documentaryLock, source.planningSeed, source.printedLedger]) {
  assert.equal(fileHash(at(f.path)), f.sha256, f.path);
  assert.equal(fs.statSync(at(f.path)).size, f.byteLength, f.path);
}
const lock = read(at(source.documentaryLock.path));
assert.equal(lock.status, 'VERIFIED');
assert.equal(lock.panels.length, 29);
const variants = ['rpi4', 'rpi5', 'rpi-zero-2-w'];
assert.ok(lock.panels.every((p,i) => p.printedStep === i+1 && p.result === 'PASS' && variants.every(v => p.mappings.some(m => m.variants.includes(v) && m.result === 'PASS'))));
assert.equal(fileHash(at('picarx-companion/public/content/pdf/picar-x-assembly.pdf')), source.pdfRawSha256);
assert.equal(git(['hash-object', 'picarx-companion/public/content/pdf/picar-x-assembly.pdf']), source.pdfGitBlobSha1);
const walk = p => fs.readdirSync(p, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(p,e.name)) : [path.join(p,e.name)]);
const privateFiles = walk(at('digital-twin/evidence/private'));
const ignoreRules = privateFiles.map(p => git(['check-ignore','-v',path.relative(root,p)]));
for (const e of registry.evidence.filter(e => e.privacy === 'private')) assert.equal(fileHash(at(e.artifact.path)), e.artifact.sha256);
assert.equal(git(['ls-files','digital-twin/evidence/private']), '');
const privateHashes = new Set(privateFiles.map(fileHash));
assert.ok(walk(at('picarx-companion/public')).every(p => !privateHashes.has(fileHash(p))));
const witness = registry.definitions.find(d=>d.id==='PX-V40-DEF-WHEEL-REAR');
assert.equal(witness.componentClass,'wheel');
assert.ok(!registry.fastenerDefinitions.some(d=>d.partDefinitionId===witness.id));
for(const id of ['PX-V40-INS-WHEEL-REAR-001','PX-V40-INS-WHEEL-REAR-002']) assert.equal(registry.instances.find(i=>i.id===id).definitionId,witness.id);
const receipt = {
  status: 'PASS', m0BaselineSha: m0, m1AcceptedSha: accepted, m2StartSha: start,
  branch: git(['branch','--show-current']), checkedAtUtc, entryTrackedAndUntrackedStatus: entryStatus, verifierOrigin: 'Inspected prior diagnostic verifier; new invocation and receipt, original diagnostics preserved.',
  descendantClassification: 'One documentation-only receipt: HANDOFF_M2.md added; M1_REPORT.md acceptance receipt appended.',
  reportRawSha256: fileHash(at(reportPath)), identities: actual,
  m0MandatoryGates: m0Report.checks.map(c => ({ id:c.id, status:c.status })), m1Allowed: true,
  acceptedBindings: { files: report.bindings.length, byteLengthMismatches: 0, rawHashMismatches: 0, acceptedCommitByteMismatches: 0 },
  m0Manifest: { files: manifest.files.length, mismatches: 0 },
  specificationAllocation: { files: allocation.files.length, privateBinaryFiles: allocation.files.filter(f=>f.private).length, mismatches: 0, originalArchiveVerified: true },
  documentarySource: { panels: 29, variants, pdfRawSha256: source.pdfRawSha256, pdfGitBlobSha1: source.pdfGitBlobSha1, sourceLockRawSha256: fileHash(at('digital-twin/evidence/sources.lock.json')) },
  privacy: { localFiles: privateFiles.length, ignoredFiles: ignoreRules.length, trackedFiles: 0, stagedFiles: 0, publicCopies: 0, ignoreRules },
  sourceBindings: [reportPath,'M0_GATE_REPORT.json','docs/implementation/M0_CHECKPOINT_VERIFICATION.json','docs/digital-twin/SEMANTIC_CONTRACT.md','docs/digital-twin/V40_ASSEMBLY_LEDGER.md','docs/digital-twin/GATE_CONTRACTS.md','digital-twin/schemas/digital-twin.schema.json','digital-twin/components/definitions/parts.json','digital-twin/components/definitions/fasteners.json','digital-twin/components/instances/planned-stock.json'].map(p => ({path:p,rawSha256:fileHash(at(p)),byteLength:fs.statSync(at(p)).size})),
  scope: 'Upstream M0/M1 verification only; no compiled M2 graph or M2 replay/inverse acceptance.'
};
fs.writeFileSync(path.join(output,'preflight.json'), JSON.stringify(receipt,null,2)+'\n');
console.log('M0/M1 preflight PASS: 124 accepted bindings, ' + manifest.files.length + ' M0 files, ' + allocation.files.length + ' allocation files, 29 source panels; no private publication.');
