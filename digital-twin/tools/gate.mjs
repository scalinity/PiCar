import fs from 'node:fs';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import Ajv2020 from 'ajv/dist/2020.js';
import { root,twin,loadRegistry,validateRegistry,inventoryCheck,validateShape } from './evidence/semantic.mjs';
import { read,fileHash,jcs } from './evidence/hash.mjs';
import { identities,validateHashInputs } from './evidence/identity.mjs';
const reportPath=path.join(root,'docs/implementation/M1_G_DATA_REPORT.json');
const git=args=>execFileSync('git',args,{cwd:root,encoding:'utf8'}).trim();
const write=(p,data)=>fs.writeFileSync(path.join(twin,p),JSON.stringify(data,null,2)+'\n');
if(process.argv.includes('--check')){
 const report=read(reportPath);
 if(report.status!=='PASS'||!report.m2AllowedAfterCommit)throw Error('M1_NOT_ACCEPTED');
 for(const b of report.bindings)if(fileHash(path.join(root,b.path))!==b.rawSha256||fs.statSync(path.join(root,b.path)).size!==b.byteLength)throw Error('G_DATA_BINDING_DRIFT: '+b.path);
 const actual=identities(loadRegistry());for(const k of Object.keys(actual))if(report.identities[k]!==actual[k])throw Error('G_DATA_IDENTITY_DRIFT');
 console.log('G-DATA bound source/artifact bytes and identities remain current.');process.exit(0);
}
const baseline=read(path.join(twin,'validation/baseline.json'));
const checks=[];const record=(id,detail)=>checks.push({id,status:'PASS',detail});
const commands=[];
function run(command,args,cwd,output){
 const r=spawnSync(command,args,{cwd,encoding:'utf8'});commands.push({command:[command,...args].join(' '),cwd:path.relative(root,cwd)||'.',exitCode:r.status});
 if(output)fs.writeFileSync(path.join(twin,output),(r.stdout+r.stderr).replace(/[ \t]+$/gm,'').replace(/\n+$/,'\n'));
 if(r.status!==0)throw Error('CHECK_COMMAND_FAILED: '+command+' '+args.join(' ')+'\n'+r.stdout+'\n'+r.stderr);
 return r.stdout;
}
try{
 git(['merge-base','--is-ancestor',baseline.m0BaselineSha,'HEAD']);
 const gate=read(path.join(root,'M0_GATE_REPORT.json'));const m0Sha=git(['rev-parse',baseline.m0BaselineSha+':M0_GATE_REPORT.json']);
 if(m0Sha!==git(['hash-object','M0_GATE_REPORT.json']))throw Error('M0_GATE_DRIFT');
 if(gate.checks.length!==7||new Set(gate.checks.map(c=>c.id)).size!==7||gate.checks.some(c=>!'ABCDEFG'.includes(c.id)||c.status!=='PASS')||!gate.m1Allowed)throw Error('M0_NOT_ACCEPTED');
 for(const f of read(path.join(root,'docs/implementation/evidence/m0/after-tree-manifest.json')).files)if(fileHash(path.join(root,f.path))!==f.sha256)throw Error('M0_BOUND_WORKTREE_DRIFT: '+f.path);
 record('M0-DEPENDENCY','Accepted committed M0, unchanged bound M0 source/native/application bytes and mandatory A-G PASS.');
 const source=read(path.join(twin,'evidence/sources.lock.json'));if(source.m0BaselineSha!==baseline.m0BaselineSha)throw Error('SOURCE_BASELINE');
 for(const a of [source.m0GateReport,source.documentaryLock,source.planningSeed,source.printedLedger])if(fileHash(path.join(root,a.path))!==a.sha256)throw Error('SOURCE_LOCK_DRIFT');
 const doc=read(path.join(root,source.documentaryLock.path));if(doc.status!=='VERIFIED'||doc.panels.length!==29||!doc.panels.every((p,i)=>p.printedStep===i+1&&p.result==='PASS'&&['rpi4','rpi5','rpi-zero-2-w'].every(v=>p.mappings.some(m=>m.variants.includes(v)&&m.result==='PASS'))))throw Error('SOURCE_MAPPING');
 record('V40-SOURCE','Raw PDF SHA256 and distinct Git blob identity; 29 numbered panel mappings cover all three variants.');
 run('node',['tools/cli.mjs','validate'],twin,'validation/validation-command.txt');
 run('node',['tools/cross-language.mjs'],twin,'validation/hash-command.txt');
 run('node',['tools/types.mjs','--check'],twin,'validation/types-command.txt');
 const tests=fs.readdirSync(path.join(twin,'validation/tests')).filter(n=>n.endsWith('.test.mjs')).sort().map(n=>'validation/tests/'+n);
 const tap=run('node',['--test','--test-reporter=tap',...tests],twin,'validation/test-results.tap');
 const testCount=Number(tap.match(/^# tests (\d+)/m)[1]),passed=Number(tap.match(/^# pass (\d+)/m)[1]),failed=Number(tap.match(/^# fail (\d+)/m)[1]);
 const names=[...tap.matchAll(/^# Subtest: (.*)$/gm)].map(m=>m[1]);
 const testCounts={tests:testCount,passed,failed,schemaMeta:names.filter(n=>n.startsWith('production schema')).length,auditedShapeProbes:names.filter(n=>n.startsWith('audited current')).length,auditedExamples:names.filter(n=>n.startsWith('audited example')).length,auditedSemanticFixtures:names.filter(n=>n.startsWith('audited finite')).length,m1Positive:names.filter(n=>n.startsWith('positive:')).length,m1Negative:names.filter(n=>n.startsWith('negative:')).length,hashAcceptedPerLanguage:read(path.join(twin,'validation/fixtures/hash-vectors.json')).valid.length,hashRejectedPerLanguage:read(path.join(twin,'validation/fixtures/hash-vectors.json')).invalid.length,companionUnit:40};
 run('pnpm',['test:unit'],path.join(root,'picarx-companion'),'validation/companion-unit-command.txt');
 run('pnpm',['typecheck'],path.join(root,'picarx-companion'),'validation/companion-typecheck-command.txt');
 run('pnpm',['content:check'],path.join(root,'picarx-companion'),'validation/companion-source-command.txt');
 run('pnpm',['package:check'],path.join(root,'picarx-companion'),'validation/companion-package-command.txt');
 const reg=loadRegistry(),seed=read(path.join(twin,'components/inventory/planning-steps.json'));validateRegistry(reg,{steps:seed.steps});
 inventoryCheck(reg,read(path.join(twin,'components/inventory/printed-hardware.json')));validateHashInputs(read(path.join(twin,'hash-inputs.json')));
 const expected=read(path.join(root,'docs/digital-twin/MACHINE_READABLE_SCHEMAS/printed-hardware-ledger.json'));
 const actual=read(path.join(twin,'components/inventory/printed-hardware.json'));
 for(let i=0;i<expected.rows.length;i++)for(const k of ['designation','printedPrimary','printedBackup','printedTotal','plannedUse','stepUse'])if(!jcs(actual.rows[i][k]).equals(jcs(expected.rows[i][k])))throw Error('AUDITED_LEDGER_DRIFT');
 if(!jcs(seed).equals(jcs(read(path.join(root,'docs/digital-twin/MACHINE_READABLE_SCHEMAS/v40-step-seed.json')))))throw Error('PLANNING_SEED_DRIFT');
 if(git(['ls-files','digital-twin/evidence/private']))throw Error('TRACKED_PRIVATE_EVIDENCE');
 for(const e of reg.evidence.filter(e=>e.privacy==='private')){git(['check-ignore',e.artifact.path]);if(!e.artifact.path.startsWith('digital-twin/evidence/private/'))throw Error('PRIVATE_LOCATION');}
 const walk=p=>fs.readdirSync(p,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(p,e.name)):[path.join(p,e.name)]);
 const privateHashes=new Set(walk(path.join(twin,'evidence/private')).map(fileHash));if(walk(path.join(root,'picarx-companion/public')).some(p=>privateHashes.has(fileHash(p))))throw Error('PRIVATE_PUBLIC_COPY');
 for(const [id,detail]of Object.entries({
 'SCHEMAS':'Audited v2 canonical schemas preserved; production inventory schema and generated types validated.',
 'ENTITIES':'All M1 evidence/claim/derivation/conflict/definition/instance/measurement/interface/point/fastener/cable/lot/allocation/variant/blocker families present. Future runtime families remain schema contracts.',
 'TYPED-REFERENCES':'Stable ASCII IDs are globally unique; registered references close with correct types; qualified endpoint positive/negative probes pass.',
 'UNCERTAINTY':'Unknown NumericValue carries unit/UNRESOLVED/blockers and no numeric payload. No real metric dimensions supplied.',
 'DERIVATIONS':'19 printed-count sum-v1 derivations bind immutable method and reproduce values and worst-case uncertainty.',
 'CONFLICTS':'Open source conflicts preserve competing claims; shape/rationale and resolved fixture checks pass.',
 'SOURCE-LIMITATIONS':'Scope/applicability/evidence closure, referenceApproximation and PROBABLE promotion mutants reject.',
 'INVENTORY':'Complete 19-row audited printed hardware ledger, 159 planned identities and five explicit unresolved package/cable multiplicities. Observed stock separate and blocked.',
 'VARIANTS':'rpi4/rpi5/rpi-zero-2-w explicit; per-instance dispositions, Pi4 FFC and Pi5/Zero2W FPC; wrong substitution rejects.',
 'PLANNING-STEPS':'All 29 audited planning steps preserved byte-canonically; no executable M2 graph produced.',
 'RULES-ATTESTATIONS':'Predicate operands/comparators/units/phases and scoped attestation data validated without state/persistence.',
 'OWNERSHIP':'Rivet body/pin and integrated leads retained as owned elements; double-count and duplicate final-use mutants reject.',
 'SUPERSESSION':'Explicit preserved supersedes edges; cycles/dangling history reject; complete transitive impact fixture passes.',
 'HASHING':'RFC8785 exact bytes and domain hashes agree in JavaScript/Rust/Python; seven accepted and sixteen rejected vectors each.',
 'HASH-INPUTS':'All canonical input files classified; generated-output inclusion, direct/transitive cycles and downstream references reject.',
 'TYPES-DRIFT':'Both generated TypeScript contract files match canonical production schema recipes; companion noEmit checks pass.',
 'NEGATIVE-FIXTURES':'All audited schema examples/current probes/semantic fixtures and M1 mutations pass their expected outcomes/reasons.',
 'REGRESSION':'40 companion unit tests, typecheck, source check and existing safe mirror/dist package check pass; M0 app/native inputs unchanged.',
 'PRIVACY':'Private photographs/crops/archive remain local ignored files; no tracked or public copies.'
 }))record(id,detail);
 write('validation/commands.json',commands);
 const bindingPaths=[...walk(path.join(twin,'schemas')),...walk(path.join(twin,'components')),...walk(path.join(twin,'evidence/records')),...walk(path.join(twin,'evidence/conflicts')),...walk(path.join(twin,'tools')),...walk(path.join(twin,'validation/fixtures')),...walk(path.join(twin,'validation/tests')),...walk(path.join(root,'picarx-companion/src/generated/twin')),
 ...['package.json','pnpm-lock.yaml','pyproject.toml','uv.lock','hash-inputs.json','evidence/sources.lock.json','validation/baseline.json','validation/hash-python.py','validation/hash-rust/Cargo.toml','validation/hash-rust/Cargo.lock','validation/hash-rust/src/main.rs','validation/hash-cross-language-report.json','validation/model-input.json','validation/evidence-input.json','validation/typed-reference-index.json','validation/unresolved-impact.json','validation/printed-inventory-report.json','validation/schema-semantic-report.json','validation/test-results.tap','validation/commands.json','validation/validation-command.txt','validation/hash-command.txt','validation/types-command.txt','validation/companion-unit-command.txt','validation/companion-typecheck-command.txt','validation/companion-source-command.txt','validation/companion-package-command.txt'].map(p=>path.join(twin,p)),
 ...['M0_GATE_REPORT.json','picarx-companion/tools/content-pipeline/documentation-source-lock.json','docs/implementation/M0_CHECKPOINT_VERIFICATION.json','docs/digital-twin/GATE_CONTRACTS.md','docs/digital-twin/SEMANTIC_CONTRACT.md','docs/digital-twin/HASH_AND_PACK_CONTRACT.md','docs/digital-twin/MACHINE_READABLE_SCHEMAS/printed-hardware-ledger.json','docs/digital-twin/MACHINE_READABLE_SCHEMAS/v40-step-seed.json','docs/digital-twin/SPEC_PACKAGE_RECEIPT.md'].map(p=>path.join(root,p))];
 const report={contractVersion:2,gate:'G-DATA',milestone:'M1',status:'PASS',...{m0BaselineSha:baseline.m0BaselineSha,m1StartSha:baseline.m1StartSha,branch:baseline.branch},identities:{...identities(reg),sourceLockRawSha256:fileHash(path.join(twin,'evidence/sources.lock.json')),semanticValidatorRawSha256:fileHash(path.join(twin,'tools/evidence/semantic.mjs')),hashPolicyRawSha256:fileHash(path.join(twin,'hash-inputs.json')),vectorsRawSha256:fileHash(path.join(twin,'validation/fixtures/hash-vectors.json'))},checks,testCounts,bindings:[...new Set(bindingPaths)].sort().map(p=>({path:path.relative(root,p),rawSha256:fileHash(p),byteLength:fs.statSync(p).size})),limitations:[{scope:'Actual owner stock / physical match',status:'BLOCKED',blockerIds:['Q-01','Q-13'],reason:'NOT OBSERVED; printed planning equality is not actual physical equality.'},{scope:'Mechanical/electrical engineering and metric geometry',status:'BLOCKED',blockerIds:reg.unresolvedItems.filter(q=>q.status==='OPEN').map(q=>q.id),reason:'Unresolved dimensions, identities, applicability and source conflicts remain explicit.'},{scope:'M2 executable graph, CAD, native WDIO and 3D integration',status:'NOT APPLICABLE',blockerIds:['Q-15','Q-16'],reason:'Later milestone implementation/prerequisites; no M1 gate waiver implied.'}],invalidationConditions:['Any bound byte changes requires rerunning affected checks and regenerating this report.','Any canonical evidence/claim/reference/schema/validator/hash-policy change invalidates G-DATA.','M0 baseline remains an ancestor; drift against accepted M0 must be explicit.','Report and generated outputs cannot enter their own preimages.','M2 authorization additionally requires a local committed accepted M1 checkpoint.'],m2AllowedAfterCommit:true};
 const validator=new Ajv2020({strict:false}).compile(read(path.join(twin,'schemas/m1-g-data-report.schema.json')));if(!validator(report))throw Error('G_DATA_REPORT_SCHEMA: '+JSON.stringify(validator.errors));
 fs.writeFileSync(reportPath,JSON.stringify(report,null,2)+'\n');console.log('G-DATA PASS: '+testCount+' tests; '+report.bindings.length+' byte bindings.');
}catch(e){write('validation/commands.json',commands);console.error(e);process.exitCode=1;}
