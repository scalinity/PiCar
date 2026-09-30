// Explicit owner-authorized M4 execution, with isolated disposable TEST-only inputs.
// Does not invoke the app, native build, public publisher, robot, or owner storage.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync,spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {verifyAdoption} from './m4-adoption.mjs';
import {H,fileHash,read,jcs} from '../evidence/hash.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..'),twin=path.join(root,'digital-twin');
const evidence=path.join(root,'docs/implementation/evidence/m4');
const runId=process.argv[2];
if(!runId||!/^qualification-[a-z0-9-]+$/.test(runId))throw Error('EXPLICIT_NEW_RUN_ID_REQUIRED');
const out=path.join(evidence,runId);if(fs.existsSync(out))throw Error('PRESERVE_PRIOR_RUN');fs.mkdirSync(out,{recursive:true});
const ledger=[];const save=(p,v)=>fs.writeFileSync(p,JSON.stringify(v,null,2)+'\n');
const binding=p=>({path:path.relative(root,p),rawSha256:fileHash(p),bytes:fs.statSync(p).size});
function run(name,cmd,args,cwd,env={},expect=0){
 console.log(name+' running');const result=spawnSync(cmd,args,{cwd,env:{...process.env,...env,UV_NO_PROGRESS:'1',PYTHONDONTWRITEBYTECODE:'1'},encoding:'utf8',maxBuffer:32*1024*1024,timeout:180000});
 const log=path.join(out,name+'.txt');fs.writeFileSync(log,(result.stdout??'')+(result.stderr??''));
 ledger.push({name,command:[cmd,...args],cwd,environment:{...env,UV_NO_PROGRESS:'1',PYTHONDONTWRITEBYTECODE:'1'},exit:result.status,expectedExit:expect,signal:result.signal,log:binding(log)});save(path.join(out,'commands.json'),ledger);
 if(result.status!==expect)throw Error(name+': expected '+expect+', actual '+result.status+'; see '+log);
 return result.stdout;
}
const adoption=verifyAdoption();save(path.join(out,'lock-adoption.json'),adoption);
const tracked=execFileSync('git',['ls-files','-z'],{cwd:root,encoding:'utf8'}).split('\0').filter(Boolean).filter(p=>!p.startsWith('picarx-companion/public/content/'));
const walk=p=>fs.readdirSync(p,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(p,e.name)):[path.join(p,e.name)]);
const m4=['cad','validation/fixtures/m4','validation/tests_python','validation/m4/prior-m1','tools/export'].flatMap(p=>walk(path.join(twin,p))).filter(p=>!p.includes('/__pycache__/')&&!p.includes('/.pytest_cache/')&&!p.includes('/.venv/')).map(p=>path.relative(root,p));
const sourcePaths=[...new Set([...tracked,...m4,'digital-twin/toolchain.lock.json','digital-twin/pyproject.toml','digital-twin/uv.lock'])].filter(p=>!p.includes('/evidence/private/')&&!p.includes('/source-vault/')&&!/\.sqlite3/.test(p)&&!p.startsWith('docs/implementation/evidence/m4/'));
save(path.join(out,'mirror-inputs.json'),sourcePaths.map(p=>binding(path.join(root,p))));
const roots=[];
const uv='/opt/homebrew/bin/uv',args=['run','--frozen','--no-sync','--group','m4','--python','3.12.14'];
for(const label of ['a','b']){
 const mirror=fs.mkdtempSync(path.join(os.tmpdir(),'picar-m4-clean-'+label+'-'));roots.push(mirror);
 for(const p of sourcePaths){const destination=path.join(mirror,p);fs.mkdirSync(path.dirname(destination),{recursive:true});fs.copyFileSync(path.join(root,p),destination);}
 const cwd=path.join(mirror,'digital-twin'),env={UV_PROJECT_ENVIRONMENT:path.join(mirror,'environment'),UV_CACHE_DIR:path.join(mirror,'uv-cache')};
 run(label+'-frozen-install',uv,['sync','--frozen','--group','m4','--python','3.12.14','--no-install-package','twin-cad'],cwd,env);
 run(label+'-wheel-build',uv,['build','--wheel','--no-build-isolation','--python',path.join(mirror,'environment/bin/python'),'cad','--out-dir',path.join(mirror,'wheel')],cwd,env);
 const wheel=path.join(mirror,'wheel',fs.readdirSync(path.join(mirror,'wheel')).find(p=>p.endsWith('.whl')));
 run(label+'-wheel-install',uv,['pip','install','--python',path.join(mirror,'environment/bin/python'),'--no-deps',wheel],cwd,env);
 save(path.join(out,label+'-wheel.json'),{file:path.basename(wheel),rawSha256:fileHash(wheel),bytes:fs.statSync(wheel).size});
 const environment=JSON.parse(run(label+'-environment',uv,[...args,'python','-m','twin_cad','environment'],cwd,env));save(path.join(out,label+'-environment.json'),environment);
 const exportDir=path.join(mirror,'exports');
 run(label+'-fixture-build',uv,[...args,'python','-m','twin_cad','build','--fixture','validation/fixtures/m4/TEST-M4.json','--output',exportDir],cwd,env);
 run(label+'-independent-verify',uv,[...args,'python','-m','twin_cad','verify','--fixture','validation/fixtures/m4/TEST-M4.json','--output',exportDir],cwd,env);
 run(label+'-pytest',uv,[...args,'pytest','cad/tests','validation/tests_python','-q','--junitxml='+path.join(mirror,'tests.xml')],cwd,env);
 fs.copyFileSync(path.join(mirror,'tests.xml'),path.join(out,label+'-tests.xml'));
 fs.cpSync(exportDir,path.join(out,label+'-exports'),{recursive:true});
}
const files=fs.readdirSync(path.join(out,'a-exports')).sort();const comparison=files.map(file=>{const a=path.join(out,'a-exports',file),b=path.join(out,'b-exports',file);const rawEqual=fileHash(a)===fileHash(b);if(file.endsWith('.json')&&!rawEqual)throw Error('NORMALIZED_REBUILD_DRIFT '+file);return {file,a:binding(a),b:binding(b),rawEqual,semanticEquivalent:file.endsWith('.json')?rawEqual:'Independent analytic witness PASS; compare raw engineering serializer separately'};});
save(path.join(out,'reproducibility.json'),{status:'PASS',independentMirrors:roots,independentDependencyCacheAndEnvironments:true,comparison,normalization:'JCS float64 computed output rounded to 1e-10; ordering by stable IDs/index coordinates. STEP/BRep raw identities separate from analytic surface equivalence.',sourceInputHash:H('m4-mirror-inputs',sourcePaths.map(p=>binding(path.join(root,p))))});
// Historical direct checks: restore old locks ONLY in disposable clean mirror.
// The current new locks have already been built and tested above.
const historical=path.join(roots[0],'digital-twin');for(const f of ['pyproject.toml','uv.lock'])fs.copyFileSync(path.join(twin,'validation/m4/prior-m1',f),path.join(historical,f));
// Node dependencies are unchanged accepted locks; only Python environments are
// independent here. A read-only shared Node install is sufficient for old checks.
fs.symlinkSync(path.join(twin,'node_modules'),path.join(historical,'node_modules'),'dir');
// Read-only Git identity/ancestry checks use the actual repository object store;
// all file reads still occur inside this mirror with original lock bytes.
fs.writeFileSync(path.join(roots[0],'.git'),'gitdir: '+path.join(root,'.git')+'\n');
run('historical-upstream-check',process.execPath,['digital-twin/tools/compiler/upstream.mjs','--check'],roots[0]);
run('historical-graph-check',process.execPath,['digital-twin/tools/compiler/gate.mjs','--check'],roots[0]);
console.log('M4 two clean qualifications PASS; current lock adoption verified separately; retained '+out);
