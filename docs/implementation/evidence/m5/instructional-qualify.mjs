// Two independent owner-authorized OS-temp installations of the authored wheel.
// No private photos, owner databases, live app state, or canonical artifact writers.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {validateParameters,base} from '../../../../digital-twin/tools/evidence/m5-instructional.mjs';
const root=process.cwd(),out=process.argv[2];if(!out||fs.existsSync(out))throw Error('NEW_RUN_REQUIRED');
validateParameters(JSON.parse(fs.readFileSync(path.join(base,'instructional-parameters.json'))));
fs.mkdirSync(out,{recursive:true});
const hash=b=>crypto.createHash('sha256').update(b).digest('hex'),ledger=[];
const binding=p=>({path:path.relative(root,p),rawSha256:hash(fs.readFileSync(p)),bytes:fs.statSync(p).size});
function run(name,cmd,args,cwd,env={},expected=0){const startedAt=new Date().toISOString();const result=spawnSync(cmd,args,{cwd,env:{...process.env,...env,UV_NO_PROGRESS:'1',PYTHONDONTWRITEBYTECODE:'1'},encoding:'utf8',maxBuffer:32*1024*1024,timeout:300000});const log=path.join(out,name+'.txt');fs.writeFileSync(log,(result.stdout??'')+(result.stderr??''));ledger.push({name,command:[cmd,...args],cwd,environment:{...env,UV_NO_PROGRESS:'1',PYTHONDONTWRITEBYTECODE:'1'},startedAt,finishedAt:new Date().toISOString(),exit:result.status,signal:result.signal,expectedExit:expected,log:binding(log)});fs.writeFileSync(path.join(out,'commands.json'),JSON.stringify(ledger,null,2)+'\n');console.log(name+' exit '+result.status);if(result.status!==expected)throw Error('COMMAND_EXIT '+name);return result.stdout;}
function files(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(path.join(dir,e.name)):[path.join(dir,e.name)]);}
const prior=JSON.parse(fs.readFileSync('docs/implementation/evidence/m5/qualification-02/mirror-inputs.json'));
for(const b of prior){const a=binding(path.join(root,b.path));if(a.rawSha256!==b.rawSha256||a.bytes!==b.bytes)throw Error('HISTORICAL_M5_INPUT_DRIFT '+b.path);}
const additions=[...files('digital-twin/cad/twin_cad/components'), 'digital-twin/cad/tests/test_m5_instructional.py',...['m5-instructional.mjs','m5-instructional-receipts.mjs'].map(f=>'digital-twin/tools/evidence/'+f),...['instructional-parameters.json','instructional-parameters.schema.json','instructional-policy.json','instructional.test.mjs'].map(f=>'digital-twin/validation/expected/m5/'+f),'docs/digital-twin/INSTRUCTIONAL_GEOMETRY_POLICY.md','docs/implementation/M5_OWNER_POLICY_AMENDMENT.md'];
const selected=[...new Set([...prior.map(b=>b.path),...additions])].sort();
if(selected.some(p=>p.includes('/private/')||p.includes('/source-vault/')||p.startsWith('docs/PiCar Plate Pictures/')||/\.sqlite/.test(p)))throw Error('PRIVATE_MIRROR_INPUT');
const captured=new Map(selected.map(p=>[p,fs.readFileSync(path.join(root,p))]));
fs.writeFileSync(path.join(out,'mirror-inputs.json'),JSON.stringify(selected.map(p=>({path:p,rawSha256:hash(captured.get(p)),bytes:captured.get(p).length})),null,2)+'\n');
const members=JSON.parse(fs.readFileSync('docs/implementation/evidence/m5/pi5-zip-members.json')),step=members.find(m=>m.member.endsWith('.step')),license=members.find(m=>m.member==='LICENSE.txt');
for(const m of members)if(binding(path.join(root,m.path)).rawSha256!==m.rawSha256)throw Error('VAULT_DRIFT');
const mirrors=[],outputs=[];
for(const label of ['a','b']){
 const mirror=fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(),'picar-m5-instructional-'+label+'-')));mirrors.push(mirror);
 for(const p of selected){const dest=path.join(mirror,p);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,captured.get(p));}
 const candidate=path.join(mirror,'candidate');fs.mkdirSync(candidate);fs.copyFileSync(path.join(root,step.path),path.join(candidate,'pi5.step'));fs.copyFileSync(path.join(root,license.path),path.join(candidate,'LICENSE.txt'));
 const cwd=path.join(mirror,'digital-twin'),env={UV_PROJECT_ENVIRONMENT:path.join(mirror,'environment'),UV_CACHE_DIR:path.join(mirror,'uv-cache')},python=path.join(mirror,'environment/bin/python'),uv='/opt/homebrew/bin/uv';
 run(label+'-frozen-install',uv,['sync','--frozen','--group','m4','--python','3.12.14','--no-install-package','twin-cad'],cwd,env);
 run(label+'-wheel-build',uv,['build','--wheel','--no-build-isolation','--python',python,'cad','--out-dir',path.join(mirror,'wheel')],cwd,env);
 const wheel=path.join(mirror,'wheel',fs.readdirSync(path.join(mirror,'wheel')).find(f=>f.endsWith('.whl')));
 fs.writeFileSync(path.join(out,label+'-wheel.json'),JSON.stringify({file:path.basename(wheel),rawSha256:hash(fs.readFileSync(wheel)),bytes:fs.statSync(wheel).size},null,2)+'\n');
 run(label+'-wheel-install',uv,['pip','install','--python',python,'--no-deps',wheel],cwd,env);
 run(label+'-environment',python,['-m','twin_cad','environment'],cwd,env);
 const params=path.join(cwd,'validation/expected/m5/instructional-parameters.json'),artifacts=path.join(cwd,'validation/expected/m5/instructional-artifacts'),shapes=path.join(mirror,'instructional-shapes.json');
 run(label+'-generate',python,['-m','twin_cad.components.instructional.generate','--parameters',params,'--output',artifacts],cwd,env);
 run(label+'-independent-shapes',python,['-m','twin_cad.components.instructional.oracle','--parameters',params,'--artifacts',artifacts,'--output',shapes],cwd,env);
 fs.copyFileSync(shapes,path.join(out,label+'-instructional-shapes.json'));
 run(label+'-cad-tests',python,['-m','pytest','cad/tests','-q','--junitxml='+path.join(mirror,'cad-tests.xml')],cwd,{...env,PICAR_M5_CANDIDATE_STEP:path.join(candidate,'pi5.step'),PICAR_M5_INSTRUCTIONAL_PARAMETERS:params,PICAR_M5_INSTRUCTIONAL_ARTIFACTS:artifacts});
 fs.copyFileSync(path.join(mirror,'cad-tests.xml'),path.join(out,label+'-cad-tests.xml'));
 fs.symlinkSync(path.join(root,'digital-twin/node_modules'),path.join(cwd,'node_modules'),'dir');fs.writeFileSync(path.join(mirror,'.git'),'gitdir: '+path.join(root,'.git')+'\n');
 run(label+'-receipt-build',process.execPath,['digital-twin/tools/evidence/m5-instructional-receipts.mjs',shapes],mirror,{PICAR_M5_MIRROR:'1'});
 run(label+'-instructional-tests',process.execPath,['--test','--test-reporter=tap','digital-twin/validation/expected/m5/instructional.test.mjs'],mirror);
 run(label+'-read-only-graph-contracts',process.execPath,['--test','--test-reporter=tap','digital-twin/validation/m2/tests/contracts.test.mjs'],mirror);
 const pattern='unknown numeric with payload|owned rivet pin double-counted|probable generic HAT|official reference approximation|source limitations silently discarded|open conflict treated|resolved conflict loses|integrated cable misclassified|integrated cable endpoint|integrated lead has owner';
 run(label+'-source-firewall-tests',process.execPath,['--test','--test-reporter=tap','--test-name-pattern='+pattern,'digital-twin/validation/tests/semantic.test.mjs'],mirror);
 run(label+'-candidate-evidence-tests',process.execPath,['--test','--test-reporter=tap','digital-twin/validation/expected/m5/component-evidence.test.mjs'],mirror);
 const generated=[...files(artifacts),...files(path.join(cwd,'validation/expected/m5/instructional-receipts'))].sort().map(p=>({path:path.relative(mirror,p),rawSha256:hash(fs.readFileSync(p)),bytes:fs.statSync(p).size}));outputs.push(generated);
 for(const f of ['pyproject.toml','uv.lock'])fs.copyFileSync(path.join(cwd,'validation/m4/prior-m1',f),path.join(cwd,f));
 run(label+'-historical-upstream-check',process.execPath,['digital-twin/tools/compiler/upstream.mjs','--check'],mirror);
 run(label+'-historical-graph-check',process.execPath,['digital-twin/tools/compiler/gate.mjs','--check'],mirror);
}
for(const p of selected)if(!captured.get(p).equals(fs.readFileSync(path.join(root,p))))throw Error('SOURCE_CHANGED_DURING_RUN '+p);
if(JSON.stringify(outputs[0])!==JSON.stringify(outputs[1]))throw Error('GENERATED_BYTES_DRIFT');
const wheels=['a','b'].map(label=>JSON.parse(fs.readFileSync(path.join(out,label+'-wheel.json'))));
if(wheels[0].rawSha256!==wheels[1].rawSha256||wheels[0].bytes!==wheels[1].bytes)throw Error('WHEEL_REBUILD_DRIFT');
if(!fs.readFileSync(path.join(out,'a-instructional-shapes.json')).equals(fs.readFileSync(path.join(out,'b-instructional-shapes.json'))))throw Error('INDEPENDENT_SHAPE_REPORT_DRIFT');
fs.writeFileSync(path.join(out,'reproducibility.json'),JSON.stringify({status:'PASS',scope:'Authored instructional purchased proxies only; no strict engineering admission',mirrors,independentPythonEnvironmentsAndCaches:true,wheelsEqual:true,allGeneratedBytesEqual:true,outputs:outputs[0],engineeringAdmission:false,noPrivatePhotoCopies:true,noVendorBytesStaged:true},null,2)+'\n');
console.log('Reproducibility PASS; generated outputs retained in both mirrors for explicit adoption.');
