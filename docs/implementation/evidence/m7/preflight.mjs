import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {identities} from '../../../../digital-twin/tools/evidence/identity.mjs';
import {loadRegistry} from '../../../../digital-twin/tools/evidence/semantic.mjs';
import {H} from '../../../../digital-twin/tools/evidence/hash.mjs';
import {authoringInputs,hash as graphHash} from '../../../../digital-twin/tools/compiler/inputs.mjs';
import {compileGraph} from '../../../../picarx-companion/src/domain/assembly/compiler.ts';
import {validateShape} from '../../../../digital-twin/tools/evidence/semantic.mjs';
import {validateReceipt as m5,validateParameters} from '../../../../digital-twin/tools/evidence/m5-instructional.mjs';
import {evaluate as m6} from '../../../../digital-twin/tools/evidence/m6-plates.mjs';
const hash=b=>crypto.createHash('sha256').update(b).digest('hex'),read=p=>JSON.parse(fs.readFileSync(p)),git=(...a)=>execFileSync('git',a,{encoding:'utf8',maxBuffer:64*1024*1024}).trim();
const out='docs/implementation/evidence/m7/preflight.json';assert(!fs.existsSync(out),'PRESERVE_PREFLIGHT');
const start='d8b95f2b7fbe8cc67c7b38e8272b662c6ac804ca';assert.equal(git('rev-parse','HEAD'),start);assert.equal(git('diff','--name-only'),'');assert.equal(git('diff','--cached','--name-only'),'');git('diff','--check');
const accepted=['2a934710501d71aecbd8da827925c92e49378661','22c85058f9420aaaaf376c5e312915f5b7b5288d','8d8d30d0c7b077504916a26d80c211e2fc52c4e2','baddbfe6953237d436cbedb963c6ea88d2960f05','4655e60ccb170cd7cadd5545f1aa4303e74145b7','75b3b7286761c41200940657c18eb4371025587d','40289533c1aac160de88261e5a2712fdf9aac34e'];for(const s of accepted)execFileSync('git',['merge-base','--is-ancestor',s,start]);
assert.equal(git('rev-parse',accepted[6]+'^{tree}'),'7e64b1ef867e0bbcd9efce813bb240dd07f0edd6');assert.equal(git('show','-s','--format=%s',accepted[6]),'M6: reconstruct instructional Z0104V40 structural plates');
const descendants=git('rev-list','--reverse',accepted[6]+'..HEAD').split('\n');assert.deepEqual(descendants,[start]);
const expectedIds={schemaHash:'046808956ce49b8cbe8f1e0e2a8c4f63b250a67f2011e969990fb9a0ef6826e1',evidenceHash:'e00e7825f413a37edeb3c9ac47611fbf790480d6efb71337b5cd219bfd082d5c',modelHash:'01c29e99b8d6fa04689e4316628296bf3a3da422184e3563bf99f5bdce543bd2'};assert.deepEqual(identities(loadRegistry()),expectedIds);
const graphs={rpi4:'ce9dd71eb9728f1538e2fb311f99450cdafc0df96c91033cf0333e6bec51eac7',rpi5:'97de264d98dcd9d525b26cac7f211279f446a59352bc822a1d3a68ca267d2665','rpi-zero-2-w':'65d5c89cf2dc2cec53424ac1e689772aee0c788086b6f01eea7efb3576c213c2'};
for(const [v,h] of Object.entries(graphs)){const g=compileGraph(authoringInputs(),v,graphHash,validateShape).graph;assert.equal(g.graphHash,h);assert.deepEqual(g,read('digital-twin/validation/m2/'+v+'/compiled-graph.json'));}
assert.equal(H('toolchain',read('digital-twin/toolchain.lock.json')),'be4c1f8158fe16865c7f68c821ae3d87e846c7855cac058bee4902996c806add');
const bindings=new Map();function bound(b){let bytes=fs.readFileSync(b.path);assert.equal(hash(bytes),b.rawSha256??b.sha256,b.path);assert.equal(bytes.length,b.bytes??b.byteLength,b.path);bindings.set(b.path,{path:b.path,rawSha256:hash(bytes),bytes:bytes.length});}
for(const p of ['docs/implementation/M4_GATE_REPORT.json','docs/implementation/M5_INSTRUCTIONAL_GATE_REPORT.json']){const r=read(p);for(const b of [...(r.sourceBindings??[]),...(r.evidenceBindings??[]),...(r.inputBindings??[])])bound(b);}
const receipt=read('docs/implementation/M6_INSTRUCTIONAL_ACCEPTANCE_RECEIPT.json');for(const b of [...receipt.receiptBindings,...receipt.qualifiedBindings,receipt.currentDocumentationReport])bound(b);
const parameters=read('digital-twin/validation/expected/m5/instructional-parameters.json');validateParameters(parameters);const receipts=fs.readdirSync('digital-twin/validation/expected/m5/instructional-receipts').map(n=>read('digital-twin/validation/expected/m5/instructional-receipts/'+n));assert.equal(receipts.length,50);for(const r of receipts){assert.equal(r.instructionalStatus,'INSTRUCTIONAL_ADMITTED');m5(r,parameters,r.validationResults.independentShape);}
assert.equal(m6(receipt.receiptBindings.map(b=>read(b.path))),'PASS');
const diagnostics=read('docs/implementation/evidence/m5/preservation-final.json').diagnostics;assert.equal(diagnostics.length,12);for(const b of diagnostics){bound(b);assert.equal(git('ls-files','--',b.path),'');}
const privateIntegrity=read('docs/implementation/evidence/m6/plate-package-integrity.json');for(const k of ['archive','manifest','readme']){bound(privateIntegrity[k]);assert.equal(git('ls-files','--',privateIntegrity[k].path),'');execFileSync('git',['check-ignore',privateIntegrity[k].path]);}
for(const b of read('docs/implementation/evidence/m6/preservation-final.json').privateOriginals??[])bound(b);
bound({path:'picarx-companion/public/content/pdf/picar-x-assembly.pdf',rawSha256:'2f4ea3ae3729bfb6bc92f8fdba30f31937f9df2c3a80e5774ef03fb076f386ce',bytes:11048665});
const allTracked=git('ls-files').split('\n').map(p=>{const b=fs.readFileSync(p);return{path:p,rawSha256:hash(b),bytes:b.length};});
const authorities='MILESTONES MILESTONE_REVIEW ARCHITECTURE GEOMETRY_AND_EVIDENCE_SPEC GATE_CONTRACTS DIGITAL_TWIN_DATA_MODEL HASH_AND_PACK_CONTRACT SEMANTIC_CONTRACT SEMANTIC_LOCATION_REVISION VERIFICATION_AND_TEST_PLAN REPOSITORY_CHANGE_MAP OPEN_QUESTIONS_AND_BLOCKERS SOURCE_PUBLICATION_CONTRACT INSTRUCTIONAL_GEOMETRY_POLICY'.split(' ').map(n=>'docs/digital-twin/'+n+'.md');for(const p of authorities)assert(fs.readFileSync(p,'utf8').length);
const result={status:'PASS',startSHA:start,startTree:git('rev-parse','HEAD^{tree}'),branch:git('branch','--show-current'),accepted:accepted.map((sha,i)=>({milestone:'M'+i,sha,tree:git('rev-parse',sha+'^{tree}')})),descendants:[{sha:start,classification:'M6 acceptance documentation only; implementationReport PASS augmented with acceptanceCommit and M7 authorized; receipt, HANDOFF_M7 and documentation writer/kickoff added',changedFiles:git('diff','--name-only',accepted[6],start).split('\n')}],canonicalIdentities:expectedIds,historicalGraphs:graphs,toolchainHash:H('toolchain',read('digital-twin/toolchain.lock.json')),m5ReceiptsValidated:50,m6ReceiptsValidated:8,authorities,diagnostics,retainedBindings:[...bindings.values()],baselineTrackedFiles:allTracked,worktrees:git('worktree','list'),gitStatus:git('status','--short'),privateSourceHashesOnly:true};fs.writeFileSync(out,JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({status:result.status,bindings:bindings.size,trackedFiles:allTracked.length,diagnostics:diagnostics.length,graphs:'3 independently recompiled, unchanged',m5:50,m6:8}));
