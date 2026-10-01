// Read-only upstream verification. Writes only a new named M5 receipt.
import fs from 'node:fs';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {verifyAdoption} from '../../../../digital-twin/tools/export/m4-adoption.mjs';
const git=(...args)=>execFileSync('git',args,{maxBuffer:32*1024*1024});
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const read=p=>JSON.parse(fs.readFileSync(p));
const check=(b,p=b.path)=>{const bytes=fs.readFileSync(p);if(hash(bytes)!==(b.rawSha256??b.sha256)||bytes.length!==(b.byteLength??b.bytes))throw Error('RAW_BINDING '+p);};
const commits={m0:'2a934710501d71aecbd8da827925c92e49378661',m1:'22c85058f9420aaaaf376c5e312915f5b7b5288d',m2:'8d8d30d0c7b077504916a26d80c211e2fc52c4e2',m3:'baddbfe6953237d436cbedb963c6ea88d2960f05',m4:'4655e60ccb170cd7cadd5545f1aa4303e74145b7'};
const receipt={status:'PASS',head:git('rev-parse','HEAD').toString().trim(),branch:git('branch','--show-current').toString().trim(),statusBefore:git('status','--short','--untracked-files=all').toString(),staged:git('diff','--cached','--name-only').toString(),diffStat:git('diff','--stat').toString(),diffCheck:git('diff','--check').toString(),cachedCheck:git('diff','--cached','--check').toString(),identity:{author:git('var','GIT_AUTHOR_IDENT').toString().trim(),committer:git('var','GIT_COMMITTER_IDENT').toString().trim()},commits:[],checked:[],retainedObjects:[]};
for(const [milestone,sha] of Object.entries(commits)){git('merge-base','--is-ancestor',sha,'HEAD');receipt.commits.push({milestone,sha,tree:git('show','-s','--format=%T',sha).toString().trim(),subject:git('show','-s','--format=%s',sha).toString().trim()});}
for(const [milestone,tree,subject] of [['m3','85d298b7ae906ad3bed5a7752a126279861c9e35','M3: add durable assembly sessions and reference-first integration'],['m4','e5d0f404bf195c2570e7a6f009ec989e7aac56dc','M4: qualify reproducible synthetic mechanical toolchain']]){const c=receipt.commits.find(c=>c.milestone===milestone);if(c.tree!==tree||c.subject!==subject)throw Error('ACCEPTANCE_IDENTITY');}
receipt.descendants=git('log','--format=%H %T %s',commits.m4+'..HEAD').toString();
receipt.descendantPaths=git('diff','--name-status',commits.m4,'HEAD').toString();
if(receipt.descendantPaths!=='A\tdocs/implementation/HANDOFF_M5.md\nA\tdocs/implementation/M4_ACCEPTANCE_RECEIPT.json\n')throw Error('UNCLASSIFIED_DESCENDANT');
receipt.descendantClassification='Two documentation-only files; M4 implementation checkpoint unchanged';
receipt.adoption=verifyAdoption();
for(const [p,sha] of [['docs/implementation/M1_G_DATA_REPORT.json',commits.m1],['digital-twin/validation/m2/adopted-g-data.json',commits.m2],['docs/implementation/M2_G_GRAPH_REPORT.json',commits.m2],['docs/implementation/M3_GATE_REPORT.json',commits.m3],['docs/implementation/M4_GATE_REPORT.json',commits.m4]]){
 const j=read(p),bindings=j.bindings??[...j.sourceBindings,...j.evidenceBindings];
 for(const b of bindings){const original=git('show',sha+':'+b.path);if(hash(original)!==b.rawSha256||original.length!==(b.byteLength??b.bytes))throw Error('GIT_BINDING '+b.path);receipt.retainedObjects.push({checkpoint:sha,path:b.path,gitBlob:git('rev-parse',sha+':'+b.path).toString().trim(),rawSha256:b.rawSha256,bytes:original.length});}
 receipt.checked.push({path:p,rawSha256:hash(fs.readFileSync(p)),bytes:fs.statSync(p).size,retainedBindings:bindings.length});
}
const m4=read('docs/implementation/M4_ACCEPTANCE_RECEIPT.json');check(m4.acceptedGate);
for(const b of [...read('docs/implementation/M4_GATE_REPORT.json').sourceBindings,...read('docs/implementation/M4_GATE_REPORT.json').evidenceBindings])check(b);
const diagnostics=read('docs/implementation/evidence/m2/remediation-recheck/diagnostic-preservation.json');
receipt.diagnostics=diagnostics.originals.filter(b=>!diagnostics.archives.some(a=>a.path===b.path));
for(const b of receipt.diagnostics){check(b);if(git('ls-files','--',b.path).length)throw Error('DIAGNOSTIC_TRACKED');}
for(const b of diagnostics.archives)check(b,b.preservedAt);
const original=read('docs/implementation/evidence/m0/after-tree-manifest.json');
for(const b of original.files){const bytes=git('show',commits.m0+':'+b.path);if(hash(bytes)!==b.sha256||bytes.length!==b.bytes)throw Error('M0_OBJECT '+b.path);}
const allocation=read('docs/implementation/evidence/m0/spec-allocation.json');for(const b of allocation.files)check(b,b.destination);check(allocation.originalZip,allocation.originalZip.destination);
receipt.preservation={m0OriginalObjects:original.files.length,specAllocations:allocation.files.length,privateOriginalsAndArchive:allocation.files.filter(b=>b.private).length+1,untrackedDiagnostics:receipt.diagnostics.length,archivedReports:diagnostics.archives.length,ownerData:'No owner sessions, databases, keys or recovery generation inspected or modified'};
if(git('ls-files','digital-twin/evidence/private').length)throw Error('PRIVATE_TRACKED');
const inputPaths=[...new Set([...git('ls-files','docs/digital-twin','docs/implementation/M0_REPORT.md','docs/implementation/M0_CHECKPOINT_VERIFICATION.json','docs/implementation/M1_REPORT.md','docs/implementation/M2_REPORT.md','docs/implementation/M3_REPORT.md','docs/implementation/M3_ACCEPTANCE_RECEIPT.json','docs/implementation/M4_REPORT.md','docs/implementation/M4_ACCEPTANCE_RECEIPT.json','docs/implementation/M4_EXECUTION_PLAN.md','docs/implementation/HANDOFF_M5.md','digital-twin/toolchain.lock.json').toString().trim().split('\n'),...receipt.checked.map(b=>b.path)])];
receipt.consumedInputs=inputPaths.map(p=>({path:p,rawSha256:hash(fs.readFileSync(p)),bytes:fs.statSync(p).size,gitBlob:git('rev-parse','HEAD:'+p).toString().trim()}));
const output=process.argv[2];if(!output||fs.existsSync(output))throw Error('NEW_OUTPUT_REQUIRED');fs.writeFileSync(output,JSON.stringify(receipt,null,2)+'\n');
console.log(JSON.stringify({status:receipt.status,checked:receipt.checked,preservation:receipt.preservation,productionIdentities:receipt.adoption.activeIdentities}));
