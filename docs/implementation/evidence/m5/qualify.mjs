// Owner-authorized M5 candidate inspection, isolated from app/storage/publication.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync,spawnSync} from 'node:child_process';
const root=process.cwd(),out=process.argv[2];if(!out||fs.existsSync(out))throw Error('NEW_RUN_REQUIRED');fs.mkdirSync(out,{recursive:true});
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const binding=p=>({path:path.relative(root,p),rawSha256:hash(fs.readFileSync(p)),bytes:fs.statSync(p).size});
const ledger=[];
function run(name,cmd,args,cwd,env={},expected=0){const startedAt=new Date().toISOString();const result=spawnSync(cmd,args,{cwd,env:{...process.env,...env,UV_NO_PROGRESS:'1',PYTHONDONTWRITEBYTECODE:'1'},encoding:'utf8',maxBuffer:32*1024*1024,timeout:240000});const log=path.join(out,name+'.txt');fs.writeFileSync(log,(result.stdout??'')+(result.stderr??''));ledger.push({name,command:[cmd,...args],cwd,environment:{...env,UV_NO_PROGRESS:'1',PYTHONDONTWRITEBYTECODE:'1'},startedAt,finishedAt:new Date().toISOString(),exit:result.status,signal:result.signal,expectedExit:expected,log:binding(log)});fs.writeFileSync(path.join(out,'commands.json'),JSON.stringify(ledger,null,2)+'\n');console.log(name+' exit '+result.status);if(result.status!==expected)throw Error('COMMAND_EXIT '+name);return result.stdout;}
const tracked=execFileSync('git',['ls-files','-z'],{encoding:'utf8'}).split('\0').filter(Boolean);
const additions=['digital-twin/cad/twin_cad/vendor/__init__.py','digital-twin/cad/twin_cad/vendor/pi5_candidate.py','digital-twin/cad/tests/test_m5_vendor.py',...fs.readdirSync('digital-twin/validation/expected/m5').map(f=>'digital-twin/validation/expected/m5/'+f)];
const sources=[...tracked.filter(p=>!p.startsWith('picarx-companion/public/content/')&&!p.startsWith('docs/implementation/evidence/')&&!p.includes('/private/')&&!p.includes('/source-vault/')&&!p.startsWith('docs/digital-twin/HISTORICAL/')&&!/\.sqlite/.test(p)),...additions];
// Restore only the gate-bound historical evidence needed for read-only --check.
for(const report of ['digital-twin/validation/m2/adopted-g-data.json','docs/implementation/M2_G_GRAPH_REPORT.json'])for(const b of JSON.parse(fs.readFileSync(report)).bindings)sources.push(b.path);
const selected=[...new Set(sources)].sort(),captured=new Map(selected.map(p=>[p,fs.readFileSync(path.join(root,p))]));
fs.writeFileSync(path.join(out,'mirror-inputs.json'),JSON.stringify(selected.map(p=>({path:p,rawSha256:hash(captured.get(p)),bytes:captured.get(p).length})),null,2)+'\n');
const members=JSON.parse(fs.readFileSync('docs/implementation/evidence/m5/pi5-zip-members.json'));
const step=members.find(m=>m.member.endsWith('.step')),license=members.find(m=>m.member==='LICENSE.txt');
for(const m of members)if(binding(path.join(root,m.path)).rawSha256!==m.rawSha256)throw Error('VAULT_DRIFT');
const mirrors=[];
for(const label of ['a','b']){
 const mirror=fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(),'picar-m5-clean-'+label+'-')));mirrors.push(mirror);
 for(const p of selected){const dest=path.join(mirror,p);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,captured.get(p));}
 const candidateDir=path.join(mirror,'candidate');fs.mkdirSync(candidateDir);fs.copyFileSync(path.join(root,step.path),path.join(candidateDir,'pi5.step'));fs.copyFileSync(path.join(root,license.path),path.join(candidateDir,'LICENSE.txt'));
 const cwd=path.join(mirror,'digital-twin'),env={UV_PROJECT_ENVIRONMENT:path.join(mirror,'environment'),UV_CACHE_DIR:path.join(mirror,'uv-cache')},python=path.join(mirror,'environment/bin/python'),uv='/opt/homebrew/bin/uv';
 run(label+'-frozen-install',uv,['sync','--frozen','--group','m4','--python','3.12.14','--no-install-package','twin-cad'],cwd,env);
 run(label+'-wheel-build',uv,['build','--wheel','--no-build-isolation','--python',python,'cad','--out-dir',path.join(mirror,'wheel')],cwd,env);
 const wheel=path.join(mirror,'wheel',fs.readdirSync(path.join(mirror,'wheel')).find(f=>f.endsWith('.whl')));
 fs.writeFileSync(path.join(out,label+'-wheel.json'),JSON.stringify({file:path.basename(wheel),rawSha256:hash(fs.readFileSync(wheel)),bytes:fs.statSync(wheel).size},null,2)+'\n');
 run(label+'-wheel-install',uv,['pip','install','--python',python,'--no-deps',wheel],cwd,env);
 run(label+'-environment',python,['-m','twin_cad','environment'],cwd,env);
 run(label+'-candidate-inspection',python,['-m','twin_cad.vendor.pi5_candidate','--step',path.join(candidateDir,'pi5.step'),'--license',path.join(candidateDir,'LICENSE.txt'),'--output',path.join(mirror,'pi5-inspection.json')],cwd,env,2);
 fs.copyFileSync(path.join(mirror,'pi5-inspection.json'),path.join(out,label+'-pi5-inspection.json'));
 run(label+'-identity-guard-tests',python,['-m','pytest','cad/tests/test_m5_vendor.py','-q','--junitxml='+path.join(mirror,'m5-tests.xml')],cwd,{...env,PICAR_M5_CANDIDATE_STEP:path.join(candidateDir,'pi5.step')});
 fs.copyFileSync(path.join(mirror,'m5-tests.xml'),path.join(out,label+'-tests.xml'));
 // Shared read-only Node dependencies; no JS package/lock mutation.
 fs.symlinkSync(path.join(root,'digital-twin/node_modules'),path.join(cwd,'node_modules'),'dir');
 fs.writeFileSync(path.join(mirror,'.git'),'gitdir: '+path.join(root,'.git')+'\n');
 run(label+'-read-only-graph-contracts',process.execPath,['--test','--test-reporter=tap','digital-twin/validation/m2/tests/contracts.test.mjs'],mirror);
 const pattern='unknown numeric with payload|owned rivet pin double-counted|probable generic HAT|official reference approximation|source limitations silently discarded|open conflict treated|resolved conflict loses|integrated cable misclassified|integrated cable endpoint|integrated lead has owner';
 run(label+'-source-firewall-tests',process.execPath,['--test','--test-reporter=tap','--test-name-pattern='+pattern,'digital-twin/validation/tests/semantic.test.mjs'],mirror);
 run(label+'-candidate-evidence-tests',process.execPath,['--test','--test-reporter=tap','digital-twin/validation/expected/m5/component-evidence.test.mjs'],mirror);
 for(const f of ['pyproject.toml','uv.lock'])fs.copyFileSync(path.join(cwd,'validation/m4/prior-m1',f),path.join(cwd,f));
 run(label+'-historical-upstream-check',process.execPath,['digital-twin/tools/compiler/upstream.mjs','--check'],mirror);
 run(label+'-historical-graph-check',process.execPath,['digital-twin/tools/compiler/gate.mjs','--check'],mirror);
}
const a=fs.readFileSync(path.join(out,'a-pi5-inspection.json')),b=fs.readFileSync(path.join(out,'b-pi5-inspection.json'));if(!a.equals(b))throw Error('CANDIDATE_DIAGNOSTIC_DRIFT');
for(const p of selected)if(!captured.get(p).equals(fs.readFileSync(path.join(root,p))))throw Error('SOURCE_CHANGED_DURING_RUN '+p);
const wheels=['a','b'].map(label=>JSON.parse(fs.readFileSync(path.join(out,label+'-wheel.json'))));if(wheels[0].rawSha256!==wheels[1].rawSha256||wheels[0].bytes!==wheels[1].bytes)throw Error('WHEEL_REBUILD_DRIFT');
fs.writeFileSync(path.join(out,'reproducibility.json'),JSON.stringify({status:'PASS',scope:'Repeated candidate inspection only; G-COMPONENT remains BLOCKED',mirrors,independentPythonEnvironmentsAndCaches:true,inspectionBytesEqual:true,inspectionBindings:['a','b'].map(label=>binding(path.join(root,out,label+'-pi5-inspection.json'))),noProductionGeometry:true,noVendorBytesStaged:true},null,2)+'\n');
