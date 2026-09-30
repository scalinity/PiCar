import * as fs from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn, spawnSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { acquire, denied, inventory, managed, publish, readJson, recover, safeMirror, staleLeaseReport, verifyGeneration, sha, treeHash, assertInside } from './publication';
import { validateLock, verifySource } from './source';
const app=join(dirname(fileURLToPath(import.meta.url)),'../..'),mode=process.argv[2];
function adoptBaseline() {
    const lock=validateLock(app),baseline=readJson(join(app,'tools/content-pipeline/documentation-generation-baseline.json'));
    if(sha(fs.readFileSync(join(app,'public/content/pdf/picar-x-assembly.pdf')))!==lock.pdfSha256)throw Error('BASELINE_PDF_HASH');
    for(const p of managed.slice(0,5))if(treeHash(join(app,p))!==baseline.roots[p])throw Error('BASELINE_GENERATED_HASH: '+p);
    const stage=join(app,'.content-publication/staging',randomUUID());
    for(const p of managed.slice(0,-1)){const dest=join(stage,p);fs.mkdirSync(dirname(dest),{recursive:true});fs.cpSync(join(app,p),dest,{recursive:true});}
    for(const p of managed.slice(0,5))if(treeHash(join(stage,p))!==baseline.roots[p])throw Error('BASELINE_CHANGED_DURING_STAGING');
    const cleared=join(stage,'cleared-content');fs.mkdirSync(cleared,{recursive:true});
    for(const e of baseline.publicFiles){const source=join(app,'public/content',e.path);assertInside(join(app,'public/content'),source);const bytes=fs.readFileSync(source);if(denied(e.path)||sha(bytes)!==e.sha256)throw Error('BASELINE_PUBLIC_HASH');const dest=join(cleared,e.path);fs.mkdirSync(dirname(dest),{recursive:true});fs.writeFileSync(dest,bytes);}
    safeMirror(app,cleared,join(stage,'.content-publication/safe-public'));
    publish(app,stage,()=>{});console.log('Pinned generated baseline adopted; excluded originals retained; upstream checkout not required');
}
function packageCheck() {
  verifyGeneration(app);
  const dist=join(app,'dist'),mirror=join(app,'.content-publication/safe-public');
  if(inventory(dist).some(e=>denied(e.path)))throw Error('DENIED_DIST');
  for(const e of inventory(mirror))if(!fs.existsSync(join(dist,e.path))||sha(fs.readFileSync(join(dist,e.path)))!==e.sha256)throw Error('DIST_STATIC_HASH: '+e.path);
  const allowed=new Set(inventory(mirror).map(e=>e.path));
  for(const e of inventory(dist))if(!allowed.has(e.path)&&e.path!=='index.html'&&!/^assets\/[\w.-]+$/.test(e.path))throw Error('UNOWNED_DIST: '+e.path);
  console.log('Safe mirror/dist exclusions and static bytes verified');
}
if(mode==='recover') {
  console.log(JSON.stringify(staleLeaseReport(app,false)));
  if(!process.argv.includes('--apply'))console.log('Dry run only. --apply verifies dead owners, clears stale leases, and recovers all roots.');
  else {staleLeaseReport(app,true);const release=acquire(app,'writer');try{recover(app);}finally{release();}}
} else if(mode==='check') {console.log(JSON.stringify({status:'PASS',inputs:verifySource(app).length}));}
else if(mode==='baseline') {
  const release=acquire(app,'writer');try{
    recover(app);
    if(fs.existsSync(join(app,'.content-publication/committed.json')))throw Error('BASELINE_ALREADY_ADOPTED');
    adoptBaseline();
  }finally{release();}
} else if(mode==='package-check') {const release=acquire(app,'reader');try{packageCheck();}finally{release();}}
else if(['dev','build','preview'].includes(mode)) {
  const recoveryLease=acquire(app,'writer');try{recover(app);if(!fs.existsSync(join(app,'.content-publication/committed.json')))adoptBaseline();}finally{recoveryLease();}
  const release=acquire(app,'reader');process.on('exit',release);
  try{verifyGeneration(app);}catch(error){release();throw error;}
  const env={...process.env,PICAR_PUBLICATION_READER:String(process.pid)};
  if(mode==='build'){
    for(const args of [['exec','tsc'],['exec','vite','build']]){const r=spawnSync('pnpm',args,{cwd:app,stdio:'inherit',env});if(r.status!==0){release();process.exit(r.status??1);}}
    packageCheck();release();
  }else{
    const child=spawn(process.execPath,[join(app,'node_modules/vite/bin/vite.js'),...(mode==='preview'?['preview']:[]),'--host','localhost'],{cwd:app,stdio:'inherit',env});
    for(const signal of ['SIGINT','SIGTERM'] as const)process.on(signal,()=>child.kill(signal));
    child.on('exit',code=>{release();process.exit(code??1);});
  }
} else throw Error('Expected dev/build/preview/check/baseline/recover/package-check');
