// Owner-authorized M3 adoption. Every live output is installed by the existing publication coordinator.
import fs from 'node:fs';
import {join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync,spawnSync} from 'node:child_process';
import {randomUUID} from 'node:crypto';
import {acquire,inventory,managed,publish,readJson,recover,sha,treeHash,verifyGeneration} from '../content-pipeline/publication';
import {inputManifest,validateLock,verifySource} from '../content-pipeline/source';
const app=join(dirname(fileURLToPath(import.meta.url)),'../..'),repo=join(app,'..');
const archive=join(repo,'..','PiCar-M3-recovery-'+randomUUID());fs.mkdirSync(archive);
const manifest='tools/content-pipeline/documentation-input-manifest.json',baseline='tools/content-pipeline/documentation-generation-baseline.json';
const oldManifest=fs.readFileSync(join(app,manifest)),oldBaseline=fs.readFileSync(join(app,baseline)),oldGeneration=fs.readFileSync(join(app,'.content-publication/committed.json'));
const privateBefore=inventory(join(repo,'digital-twin/evidence/private'));
const receipt:any={authorization:'Owner continuation 2026-09-30, M3 publication authorization 1',oldManifest:{sha256:sha(oldManifest),bytes:oldManifest.length},oldBaseline:{sha256:sha(oldBaseline),bytes:oldBaseline.length},oldGeneration:{sha256:sha(oldGeneration),bytes:oldGeneration.length},priorRecoveryArchive:archive,phases:[]};
let release=acquire(app,'writer');
try {
 recover(app);validateLock(app);
 const previous=JSON.parse(oldManifest.toString()),actual=inputManifest(app);
 const deltas=actual.filter(e=>JSON.stringify(e)!==JSON.stringify(previous.find((x:any)=>x.path===e.path)));
 if(actual.length!==previous.length||deltas.length!==1||deltas[0].path!=='picarx-companion/tools/content-pipeline/overlay.ts')throw Error('UNEXPECTED_SOURCE_INPUT_DELTA');
 const accepted=execFileSync('git',['show','HEAD:picarx-companion/tools/content-pipeline/overlay.ts'],{cwd:repo,encoding:'utf8'});
 if(fs.readFileSync(join(app,'tools/content-pipeline/overlay.ts'),'utf8')!==accepted.replace("    id: 'assembly',","    id: 'assembly',\n    assemblyLauncher: true,"))throw Error('OVERLAY_DELTA_NOT_EXACT');
 for(const p of [...managed,manifest,baseline,'.content-publication/committed.json']){fs.mkdirSync(dirname(join(archive,p)),{recursive:true});fs.cpSync(join(app,p),join(archive,p),{recursive:true});}
 const gen=readJson(join(app,'.content-publication/committed.json')).id;fs.cpSync(join(app,'.content-publication/generations',gen),join(archive,'prior-generation'),{recursive:true});
 receipt.priorRoots=managed.map(path=>({path,hash:treeHash(join(app,path))}));receipt.sourceDelta=deltas;receipt.lock=validateLock(app);
 fs.writeFileSync(join(app,manifest),JSON.stringify(actual,null,2)+'\n');verifySource(app);receipt.phases.push('Explicit overlay input adoption');
}finally{release();}
const generated=spawnSync('pnpm',['content:build'],{cwd:app,encoding:'utf8',maxBuffer:8*1024*1024});fs.writeFileSync(join(repo,'docs/implementation/evidence/m3/content-generation.txt'),generated.stdout+'\n'+generated.stderr);receipt.generatorExit=generated.status;
release=acquire(app,'writer');
try {
 recover(app);if(generated.status!==0)throw Error('GENERATION_FAILED');verifyGeneration(app);verifySource(app);
 const old=JSON.parse(oldBaseline.toString());const fresh={...old,roots:Object.fromEntries(managed.slice(0,5).map(p=>[p,treeHash(join(app,p))]))};
 // This fresh-checkout receipt is derived exclusively from verified generated roots; cleared static ownership is unchanged.
 for(const e of old.publicFiles)if(sha(fs.readFileSync(join(app,'public/content',e.path)))!==e.sha256)throw Error('PUBLIC_BYTE_DRIFT');
 fs.writeFileSync(join(app,baseline),JSON.stringify(fresh,null,2)+'\n');fs.writeFileSync(join(app,manifest),JSON.stringify(inputManifest(app),null,2)+'\n');verifySource(app);
 const stage=join(app,'.content-publication/staging',randomUUID());for(const p of managed){fs.mkdirSync(dirname(join(stage,p)),{recursive:true});fs.cpSync(join(app,p),join(stage,p),{recursive:true});}
 publish(app,stage,()=>verifySource(app));verifyGeneration(app);
 if(JSON.stringify(privateBefore)!==JSON.stringify(inventory(join(repo,'digital-twin/evidence/private'))))throw Error('PRIVATE_BYTE_DRIFT');
 receipt.newManifest={sha256:sha(fs.readFileSync(join(app,manifest))),bytes:fs.statSync(join(app,manifest)).size};receipt.newBaseline={sha256:sha(fs.readFileSync(join(app,baseline))),bytes:fs.statSync(join(app,baseline)).size};receipt.newGeneration=readJson(join(app,'.content-publication/committed.json'));receipt.privateOriginals={count:privateBefore.length,unchanged:true};receipt.phases.push('Writer-leased content:build','Verified generated fresh-checkout receipt','Writer-leased receipt binding publication');receipt.status='PASS';
}catch(e){receipt.status='FAIL';receipt.error=String(e);recover(app);for(const p of [...managed,manifest,baseline,'.content-publication/committed.json']){fs.rmSync(join(app,p),{recursive:true,force:true});fs.mkdirSync(dirname(join(app,p)),{recursive:true});fs.cpSync(join(archive,p),join(app,p),{recursive:true});}for(const r of receipt.priorRoots)if(treeHash(join(app,r.path))!==r.hash)throw Error('RECOVERY_VERIFICATION_FAILED');receipt.previousGenerationRecovered=true;throw e;
}finally{release();fs.writeFileSync(join(repo,'docs/implementation/evidence/m3/content-adoption.json'),JSON.stringify(receipt,null,2)+'\n');}
console.log('M3 content adoption PASS; prior generation retained outside publication roots');
