// Read-only verification of accepted checkpoints plus exactly two M4 lock deltas.
// Accepted M1/M2/M3 receipts are never rewritten or treated as current lock coverage.
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {root,twin,loadRegistry} from '../evidence/semantic.mjs';
import {fileHash,read,H} from '../evidence/hash.mjs';
import {identities} from '../evidence/identity.mjs';

export function verifyAdoption(expectedDeltas){
 const oldPaths=['digital-twin/pyproject.toml','digital-twin/uv.lock'];
 const accepted={m1:'22c85058f9420aaaaf376c5e312915f5b7b5288d',m2:'8d8d30d0c7b077504916a26d80c211e2fc52c4e2',m3:'baddbfe6953237d436cbedb963c6ea88d2960f05'};
 const deltas=oldPaths.map(p=>{const old=execFileSync('git',['show',accepted.m1+':'+p],{cwd:root});const retained=path.join(twin,'validation/m4/prior-m1',path.basename(p));if(!old.equals(fs.readFileSync(retained)))throw Error('M1_LOCK_NOT_PRESERVED');return {path:p,oldRawSha256:fileHash(retained),oldBytes:old.length,newRawSha256:fileHash(path.join(root,p)),newBytes:fs.statSync(path.join(root,p)).size,preservedAt:path.relative(root,retained),classification:'M4 optional Python dependency group/local cad package; rfc8785==0.1.4 and M1 virtual package unchanged'};});
 if(expectedDeltas&&H('m4-lock-adoption',deltas)!==H('m4-lock-adoption',expectedDeltas))throw Error('M4_ADOPTION_DRIFT');
 const reports=['docs/implementation/M1_G_DATA_REPORT.json','digital-twin/validation/m2/adopted-g-data.json','docs/implementation/M2_G_GRAPH_REPORT.json','docs/implementation/M3_GATE_REPORT.json'];let unchanged=0;
 for(const p of reports){const report=read(path.join(root,p));for(const b of report.bindings??[...report.sourceBindings,...report.evidenceBindings]){
  const current=fileHash(path.join(root,b.path));const size=fs.statSync(path.join(root,b.path)).size;
  if(current===b.rawSha256&&size===(b.byteLength??b.bytes)){unchanged++;continue;}
  if(oldPaths.includes(b.path)){const d=deltas.find(d=>d.path===b.path);if(d.oldRawSha256!==b.rawSha256||d.oldBytes!==(b.byteLength??b.bytes))throw Error('UNAPPROVED_ORIGINAL_LOCK');continue;}
  // Original M1 has exactly the seven already accepted M2 prospective deltas.
  const approved=p===reports[0]?read(path.join(twin,'validation/m2/adopted-g-data.json')).deltas.find(d=>d.path===b.path):null;
  if(!approved||approved.baselineRawSha256!==b.rawSha256||approved.adoptedRawSha256!==current||approved.adoptedByteLength!==size)throw Error('UPSTREAM_DRIFT '+b.path);
 }}
 const active=identities(loadRegistry()),prior=read(path.join(twin,'validation/m2/adopted-g-data.json')).adoptedIdentities;
 if(H('identities',active)!==H('identities',prior))throw Error('PRODUCTION_IDENTITIES_CHANGED');
 if(execFileSync('git',['ls-files','digital-twin/evidence/private'],{cwd:root,encoding:'utf8'}).trim())throw Error('PRIVATE_TRACKED');
 return {status:'PASS',scope:'M4 lock adoption; all production semantics and M3 source/evidence remain accepted',accepted,activeIdentities:active,deltas,unchangedBindings:unchanged,oldDirectChecks:'Expected lock drift in M1/M2 old --check. Verify their original locks in isolated mirrors and this current adoption separately; old receipts remain immutable.'};
}
if(process.argv[1]?.endsWith('m4-adoption.mjs'))console.log(JSON.stringify(verifyAdoption(),null,2));
