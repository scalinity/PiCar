import * as fs from 'node:fs';
import { join, dirname } from 'node:path';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
const shaGitBlob=(bytes:Buffer)=>createHash('sha1').update(Buffer.from('blob '+bytes.length+'\0')).update(bytes).digest('hex');
import Ajv2020 from 'ajv/dist/2020.js';
import { inventory, readJson, sha, type Entry } from './publication';
export const upstreamPin='ce2ef77d7f96ac6325c1c8c3fe584b9caab418e4';
export const sharedPin='0c11f833f862661779180ea7da2a25fd515c40d8';
export const v40='z0104v40-a0001013-picar-x.pdf';
const git=(root:string,args:string[])=>execFileSync('git',['-C',root,...args],{encoding:'utf8'}).trim();
interface DocumentationLock { status:string; repositoryHead:string; upstreamCommit:string; sharedCommit:string; sharedGitlink:string; pdfSha256:string; pdfByteLength:number; panels:{printedStep:number;mappings:{normalizedRect:number[];pdfPage:number;variants:string[]}[]}[] }
export function validateLock(app:string) {
  const lock=readJson(join(app,'tools/content-pipeline/documentation-source-lock.json'));
  const schema=readJson(join(app,'../docs/digital-twin/MACHINE_READABLE_SCHEMAS/documentation-source-lock.schema.json'));
  const validate=new Ajv2020({strict:false}).compile<DocumentationLock>(schema);
  if(!validate(lock)||lock.status!=='VERIFIED')throw Error('SOURCE_LOCK_BLOCKED_OR_INVALID');
  if(lock.upstreamCommit!==upstreamPin||lock.sharedCommit!==sharedPin||lock.sharedGitlink!==sharedPin)throw Error('SOURCE_PIN');
  if(lock.panels.length!==29||lock.panels.map((p:any)=>p.printedStep).sort((a:number,b:number)=>a-b).join(',')!==Array.from({length:29},(_,i)=>i+1).join(','))throw Error('PANEL_SET');
  for(const p of lock.panels){for(const m of p.mappings){const[l,t,r,b]=m.normalizedRect;if(!(l<r&&t<b)||m.pdfPage>2)throw Error('PANEL_RECT_OR_PAGE');}
    if(p.printedStep<=4 && new Set(p.mappings.flatMap((m:any)=>m.variants)).size!==3)throw Error('BRANCH_COVERAGE');}
  return lock;
}
export function inputManifest(app:string):Entry[] {
  const repo=join(app,'..'),up=join(repo,'sunfounder-docs'),shared=join(up,'docs/source/_shared');
  if(git(up,['rev-parse','HEAD'])!==upstreamPin||git(shared,['rev-parse','HEAD'])!==sharedPin||!git(up,['ls-tree','HEAD','docs/source/_shared']).includes(sharedPin))throw Error('UPSTREAM_REVISION');
  for(const root of [up,shared]){if(git(root,['diff','HEAD','--name-only']))throw Error('DIRTY_UPSTREAM');}
  const entries:Entry[]=[];
  for(const [prefix,root,scope]of [['sunfounder-docs',up,'docs/source'],['sunfounder-docs/docs/source/_shared',shared,'']]) {
    const objects=git(root,['ls-tree','-r','-z','HEAD',...(scope?[scope]:[])]).split('\0').filter(Boolean);
    for(const object of objects){const[meta,p]=object.split('\t');const[mode,type,blob]=meta.split(' ');if(type!=='blob')continue;if(mode==='120000')throw Error('SOURCE_SYMLINK');const bytes=fs.readFileSync(join(root,p));const actualBlob=shaGitBlob(bytes);if(actualBlob!==blob)throw Error('DIRTY_CONSUMED_SOURCE: '+p);entries.push({path:prefix+'/'+p,sha256:sha(bytes),bytes:bytes.length});}
  }
  for(const [prefix,dir]of [['picarx-companion/custom-docs',join(app,'custom-docs')],['picarx-companion/tools/content-pipeline',join(app,'tools/content-pipeline')]])for(const e of inventory(dir))if(e.path!=='documentation-input-manifest.json')entries.push({...e,path:prefix+'/'+e.path});
  const pdf=join(up,'pdfs',v40);if(!fs.existsSync(pdf))throw Error('MISSING_V40');
  entries.push({path:'sunfounder-docs/pdfs/'+v40,sha256:sha(fs.readFileSync(pdf)),bytes:fs.statSync(pdf).size});
  return entries.sort((a,b)=>a.path.localeCompare(b.path,'en'));
}
export function verifySource(app:string) {
  const lock=validateLock(app),pdf=join(app,'../sunfounder-docs/pdfs',v40);
  if(!fs.existsSync(pdf))throw Error('MISSING_V40');
  if(sha(fs.readFileSync(pdf))!==lock.pdfSha256||fs.statSync(pdf).size!==lock.pdfByteLength)throw Error('PDF_HASH');
  const expected=readJson(join(app,'tools/content-pipeline/documentation-input-manifest.json'));
  const actual=inputManifest(app);
  if(JSON.stringify(expected)!==JSON.stringify(actual))throw Error('INPUT_TAMPER');return actual;
}
export function captureInputs(app:string,dest:string) {
  const entries=verifySource(app);
  for(const e of entries){const bytes=fs.readFileSync(join(app,'..',e.path));if(sha(bytes)!==e.sha256)throw Error('SOURCE_CHANGED');const p=join(dest,e.path);fs.mkdirSync(dirname(p),{recursive:true});fs.writeFileSync(p,bytes);}
  verifySource(app);return entries;
}
