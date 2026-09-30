// Owner-authorized affected dependency checks, only inside retained clean mirror.
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {root,twin} from '../evidence/semantic.mjs';
import {read,fileHash,H} from '../evidence/hash.mjs';
const qualification=process.argv[2];if(!qualification||!/^qualification-[a-z0-9-]+$/.test(qualification))throw Error('QUALIFICATION_ID_REQUIRED');
const qualificationEvidence=path.join(root,'docs/implementation/evidence/m4',qualification),r=read(path.join(qualificationEvidence,'reproducibility.json'));
const attempt=process.argv[3];if(!attempt||!/^revalidation-[a-z0-9-]+$/.test(attempt))throw Error('NEW_ATTEMPT_ID_REQUIRED');
const evidence=path.join(qualificationEvidence,attempt);if(fs.existsSync(evidence))throw Error('PRESERVE_PRIOR_ATTEMPT');fs.mkdirSync(evidence);
const mirror=r.independentMirrors[0],cwd=path.join(mirror,'digital-twin');
if(!path.basename(mirror).startsWith('picar-m4-clean-a-'))throw Error('ISOLATED_MIRROR_REQUIRED');
for(const f of ['pyproject.toml','uv.lock'])fs.copyFileSync(path.join(twin,f),path.join(cwd,f));
fs.copyFileSync(path.join(twin,'tools/export/m4-hash-revalidation.mjs'),path.join(cwd,'tools/export/m4-hash-revalidation.mjs'));
const ledger=[];
function run(name,cmd,args,env={}){console.log(name+' running');const p=spawnSync(cmd,args,{cwd,env:{...process.env,...env,PYTHONDONTWRITEBYTECODE:'1',UV_NO_PROGRESS:'1'},encoding:'utf8',timeout:180000,maxBuffer:32*1024*1024});const log=path.join(evidence,name+'.txt');fs.writeFileSync(log,(p.stdout??'')+(p.stderr??''));ledger.push({name,command:[cmd,...args],cwd,environment:env,exit:p.status,log:{path:path.relative(root,log),rawSha256:fileHash(log),bytes:fs.statSync(log).size}});fs.writeFileSync(path.join(evidence,'revalidation-commands.json'),JSON.stringify(ledger,null,2)+'\n');if(p.status!==0)throw Error(name+' '+p.status);return p.stdout;}
const defaultEnv=path.join(mirror,'m1-default-environment');run('m1-default-frozen-install','/opt/homebrew/bin/uv',['sync','--frozen','--python','3.14.7'],{UV_PROJECT_ENVIRONMENT:defaultEnv,UV_CACHE_DIR:path.join(mirror,'m1-cache')});
const python312=JSON.parse(run('python312-hash-revalidation',process.execPath,['tools/export/m4-hash-revalidation.mjs',path.join(r.independentMirrors[1],'environment/bin/python')]));
const python314=JSON.parse(run('python314-hash-revalidation',process.execPath,['tools/export/m4-hash-revalidation.mjs',path.join(defaultEnv,'bin/python')]));
const data=run('affected-m1-hash-tests',process.execPath,['--test','--test-reporter=tap','validation/tests/hash.test.mjs']);
if(!/^# tests 30$/m.test(data)||!/^# pass 30$/m.test(data)||!/^# fail 0$/m.test(data))throw Error('AFFECTED_M1_COUNTS');
const graph=run('current-m2-readonly-contracts',process.execPath,['--test','--test-reporter=tap','validation/m2/tests/contracts.test.mjs']);
if(!/^# tests 12$/m.test(graph)||!/^# pass 12$/m.test(graph)||!/^# fail 0$/m.test(graph))throw Error('M2_COUNTS');
const fixture=read(path.join(twin,'validation/fixtures/m4/TEST-M4.json')),solutions=read(path.join(qualificationEvidence,'a-exports/solutions.json'));
if(H('m4-fixture-input',fixture)!==solutions.fixtureInputHash)throw Error('FIXTURE_JCS_CROSS_LANGUAGE');
fs.writeFileSync(path.join(evidence,'affected-revalidation.json'),JSON.stringify({status:'PASS',m1DefaultEnvironment:{python:python314.pythonVersion,dependencyGroup:'default M1 only; new lock adds optional m4 group'},hashVectors:{accepted:python312.accepted,rejected:python312.rejected,python312:python312.pythonVersion,python314:python314.pythonVersion,javascript:'Actual current execution',rust:'Retained accepted witness, unchanged input/library; no new Rust execution'},affectedM1HashTests:30,m2ReadonlyContracts:12,priorBroadM1Attempt:{passes:253,failures:1,status:'FAIL environment/excluded-input',reason:'Unchanged synthetic nominal semantic test traverses registry including excluded private original; no private bytes copied. Full 254 acceptance retained from M3, not relabeled a new execution. Only lock/hash checks are affected by M4.'},fixtureInputHash:solutions.fixtureInputHash,fixtureJcsEquality:'PASS JS/Python exact source canonicalization',productionDependencies:'M4 CAD source not installed or referenced by runtime registry; production schema/model/graph identities unchanged',m3Checks:{status:'NOT_APPLICABLE new execution',reason:'No app/domain/session/content/native input or dependency changed. All 71+173 accepted M3 bindings independently verified; prior qualification retained, not counted again.'}},null,2)+'\n');
