// Local macOS recovery on one filesystem: fsync data/directories before ordered
// F_FULLFSYNC journal/commit barriers. Hardware must honor the OS flush contract.
import * as fs from 'node:fs';
import { join, dirname, relative, resolve } from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import { execFileSync } from 'node:child_process';

export const sha = (bytes: string | Buffer) => createHash('sha256').update(bytes).digest('hex');
export const readJson = (p: string) => JSON.parse(fs.readFileSync(p, 'utf8'));
export const exists = fs.existsSync;
const denyRegistry=JSON.parse(fs.readFileSync(new URL('./denied-media.json',import.meta.url),'utf8')) as {filenames:string[];patterns:string[];directories:string[]};
export const denied = (p: string): boolean => p.split('/').some(n=>denyRegistry.directories.includes(n))
  || denyRegistry.filenames.includes(p.split('/').at(-1)!)
  || denyRegistry.patterns.some(pattern=>new RegExp('^'+pattern.split('*').map(s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('.*')+'$','i').test(p.split('/').at(-1)!));
export const managed = ['src/content/pages', 'src/content/nav.json', 'src/content/search-index.json', 'src/content/videos.json', 'src/content/wizard.json', 'public/content', '.content-publication/safe-public'];
export interface Entry { path: string; sha256: string; bytes: number }
export function inventory(root: string): Entry[] {
  if (!exists(root)) return [];
  const out: Entry[] = [];
  function visit(p: string) {
    const st = fs.lstatSync(p);
    if (st.isSymbolicLink()) throw Error('SYMLINK: '+p);
    if (st.isDirectory()) for (const n of fs.readdirSync(p).sort()) visit(join(p, n));
    else if (st.isFile()) out.push({ path: relative(root, p) || '.', sha256: sha(fs.readFileSync(p)), bytes: st.size });
    else throw Error('NON_REGULAR: '+p);
  }
  visit(root); return out;
}
export const treeHash = (p: string) => sha(JSON.stringify(inventory(p)));
function syncDir(p: string) { const fd=fs.openSync(p,'r'); try {fs.fsyncSync(fd);} finally {fs.closeSync(fd);} }
function fullSync(p:string) {
  // Darwin fcntl.h defines F_FULLFSYNC=51. fsync alone does not flush drive caches.
  if(process.platform!=='darwin')throw Error('DURABILITY_PLATFORM_BLOCKED');
  execFileSync('/usr/bin/perl',['-e','open my $fd, "+<", $ARGV[0] or die "open: $!"; defined(fcntl($fd,51,0)) or die "F_FULLFSYNC: $!";',p],{stdio:'pipe'});
}
export function durableJson(p: string, value: unknown) {
  fs.mkdirSync(dirname(p), { recursive: true });
  const temp=p+'.'+randomUUID()+'.tmp'; const fd=fs.openSync(temp,'wx',0o600);
  try {fs.writeFileSync(fd,JSON.stringify(value,null,2)+'\n');fs.fsyncSync(fd);}finally{fs.closeSync(fd);}
  fs.renameSync(temp,p);syncDir(dirname(p));fullSync(p);
}
function copy(src: string, dest: string) {
  inventory(src); fs.mkdirSync(dirname(dest),{recursive:true}); fs.cpSync(src,dest,{recursive:true,errorOnExist:true,force:false});
}
function syncTree(p:string){const st=fs.lstatSync(p);if(st.isDirectory()){for(const n of fs.readdirSync(p))syncTree(join(p,n));syncDir(p);}else{const fd=fs.openSync(p,'r');try{fs.fsyncSync(fd);}finally{fs.closeSync(fd);}}}
function remove(p: string) {fs.rmSync(p,{recursive:true,force:true});}
export function protectedHash(app: string) {
  const privateEntries=inventory(join(app,'public/content')).filter(x=>denied(x.path));
  return sha(JSON.stringify({privateEntries,twin:inventory(join(app,'public/twin')),custom:inventory(join(app,'custom-docs'))}));
}
export function safeMirror(app: string, generated: string, dest: string) {
  fs.mkdirSync(dest,{recursive:true});
  for (const e of inventory(generated)) if (!denied(e.path)) {
    const target=join(dest,'content',e.path);fs.mkdirSync(dirname(target),{recursive:true});fs.copyFileSync(join(generated,e.path),target);
  }
  // Explicit static ownership; no arbitrary recursive public copy or twin admission.
  for (const n of ['tauri.svg','vite.svg']) if(exists(join(app,'public',n))) {assertInside(app,join(app,'public',n));inventory(join(app,'public',n));fs.copyFileSync(join(app,'public',n),join(dest,n));}
  if(inventory(dest).some(e=>denied(e.path)))throw Error('DENIED_MEDIA');
}
function state(app: string) { return join(app,'.content-publication'); }
interface Lease { pid: number; token: string; kind: 'reader'|'writer' }
export function acquire(app: string, kind: Lease['kind']): ()=>void {
  const base=state(app),guard=join(base,'lease-guard');assertInside(app,join(base,'readers'));fs.mkdirSync(join(base,'readers'),{recursive:true});
  try {fs.mkdirSync(guard);}catch{throw Error('BUSY: lease guard; deliberate recovery required if stale');}
  const token=randomUUID(),p=kind==='writer'?join(base,'writer.json'):join(base,'readers',token+'.json');
  try {
    if(exists(join(base,'writer.json')) || (kind==='writer'&&fs.readdirSync(join(base,'readers')).length))throw Error('BUSY: active or unresolved lease');
    if(kind==='reader'&&exists(join(base,'journal.json')))throw Error('RECOVERY_REQUIRED');
    durableJson(p,{pid:process.pid,token,kind});
  }finally{fs.rmdirSync(guard);}
  return ()=>{if(exists(p)&&readJson(p).token===token){fs.unlinkSync(p);syncDir(dirname(p));}};
}
export function staleLeaseReport(app: string, clear = false) {
  const base=state(app);assertInside(app,join(base,'readers'));if(!exists(join(base,'readers')))return [];
  if(exists(join(base,'lease-guard')))throw Error('UNKNOWN_OWNER: lease guard retained; inspect manually');
  const guard=join(base,'lease-guard');if(clear)fs.mkdirSync(guard);
  try {
  const paths=[join(base,'writer.json'),...fs.readdirSync(join(base,'readers')).map(n=>join(base,'readers',n))].filter(exists);
  const rows=paths.map(p=>{const lease=readJson(p) as Lease;let dead=false;try{process.kill(lease.pid,0);}catch(e){if((e as NodeJS.ErrnoException).code==='ESRCH')dead=true;else throw Error('UNKNOWN_OWNER');}return{path:relative(base,p),dead};});
  if(clear){if(rows.some(r=>!r.dead))throw Error('BUSY: live/PID-reused owner');for(const p of paths)fs.unlinkSync(p);syncDir(base);}
  return rows;
  } finally {if(clear)fs.rmdirSync(guard);}
}
function requireWriter(app:string){const p=join(state(app),'writer.json');if(!exists(p)||readJson(p).pid!==process.pid)throw Error('WRITER_LEASE_REQUIRED');}
interface Journal { bindings: {path:string;sha256:string}[]; id: string; roots: {path:string;oldExists:boolean;oldHash:string;newHash:string}[]; protectedHash: string }
function verifyRoots(app: string,j: Journal,newGeneration: boolean) {
  for(const r of j.roots)if(treeHash(join(app,r.path))!==(newGeneration?r.newHash:r.oldHash))throw Error('GENERATION_HASH: '+r.path);
  if(protectedHash(app)!==j.protectedHash)throw Error('PROTECTED_HASH');
}
export function recover(app: string, fault: (point:string)=>void = ()=>{}) {
  requireWriter(app);
  const base=state(app),jp=join(base,'journal.json');if(!exists(jp))return;
  const j=readJson(jp) as Journal;
  // Never let a journal select arbitrary filesystem destinations.
  if(!/^[a-f0-9-]{36}$/.test(j.id)||JSON.stringify(j.roots.map(r=>r.path))!==JSON.stringify(managed))throw Error('INVALID_JOURNAL');
  const gen=join(base,'generations',j.id);assertInside(app,gen);for(const r of j.roots)assertInside(app,join(app,r.path));const committed=exists(join(base,'committed.json'))&&readJson(join(base,'committed.json')).id===j.id;
  if(committed){verifyRoots(app,j,true);}else{
    // Validate every backup before changing any root; retain all evidence on failure.
    for(const [i,r]of j.roots.entries())if(r.oldExists&&(!exists(join(gen,'old',String(i)))||treeHash(join(gen,'old',String(i)))!==r.oldHash))throw Error('MISSING_OR_CORRUPT_ROLLBACK: '+r.path);
    for(const [i,r]of j.roots.entries()){
      const live=join(app,r.path),temp=join(gen,'restore',String(i));remove(temp);
      if(r.oldExists){copy(join(gen,'old',String(i)),temp);syncTree(temp);syncDir(dirname(temp));}
      remove(live);if(r.oldExists){fs.mkdirSync(dirname(live),{recursive:true});fs.renameSync(temp,live);syncDir(dirname(temp));}syncDir(dirname(live));
      fault('recovery:'+i);
    }
    verifyRoots(app,j,false);
  }
  fullSync(jp);fs.unlinkSync(jp);syncDir(base);durableJson(join(base,'recovery-completed.json'),{id:j.id});fault('recovered');
}
export function publish(app: string, staged: string, verifyInputs: ()=>void, fault: (point:string)=>void = ()=>{}) {
  requireWriter(app);
  const base=state(app);assertInside(app,staged);for(const p of managed)assertInside(app,join(app,p));if(exists(join(base,'journal.json')))throw Error('RECOVERY_REQUIRED');
  verifyInputs();const id=randomUUID(),gen=join(base,'generations',id),roots=[];
  for(const [i,p]of managed.entries()){
    const live=join(app,p),next=join(staged,p);if(!exists(next))throw Error('MISSING_STAGED_ROOT: '+p);
    if(exists(live))copy(live,join(gen,'old',String(i)));copy(next,join(gen,'new',String(i)));
    roots.push({path:p,oldExists:exists(live),oldHash:treeHash(live),newHash:treeHash(next)});
  }
  const bindings=['package.json','vite.config.ts','src-tauri/tauri.conf.json','src-tauri/capabilities/default.json',...inventory(join(app,'tools/content-pipeline')).map(e=>'tools/content-pipeline/'+e.path)].filter(p=>exists(join(app,p))).map(path=>({path,sha256:sha(fs.readFileSync(join(app,path)))}));
  const j:Journal={id,roots,protectedHash:protectedHash(app),bindings};
  syncTree(gen);syncDir(dirname(gen));syncDir(base);syncDir(app);
  // Retain excluded originals at their exact local output paths.
  for(const e of inventory(join(app,'public/content')).filter(x=>denied(x.path)))if(!exists(join(staged,'public/content',e.path))||sha(fs.readFileSync(join(staged,'public/content',e.path)))!==e.sha256)throw Error('PRIVATE_PRESERVATION');
  verifyInputs();durableJson(join(base,'journal.json'),j);fault('journal');
  for(const [i,r]of roots.entries()){
    const live=join(app,r.path),temp=join(gen,'install',String(i));copy(join(gen,'new',String(i)),temp);syncTree(temp);syncDir(dirname(temp));syncDir(gen);
    if(exists(live))fs.renameSync(live,join(gen,'displaced-'+i));syncDir(dirname(live));syncDir(gen);fault('displaced:'+i);
    fs.mkdirSync(dirname(live),{recursive:true});fs.renameSync(temp,live);syncDir(dirname(temp));syncDir(dirname(live));fault('replaced:'+i);
  }
  verifyRoots(app,j,true);verifyInputs();fault('verified');
  durableJson(join(base,'committed.json'),j);fault('marker');
  fs.unlinkSync(join(base,'journal.json'));syncDir(base);fullSync(join(base,'committed.json'));fault('complete');
  // Generations deliberately retained until an explicit, reviewed cleanup.
}
export function verifyGeneration(app: string) {
  const p=join(state(app),'committed.json');if(!exists(p))throw Error('NO_COMMITTED_GENERATION');
  if(exists(join(state(app),'journal.json')))throw Error('RECOVERY_REQUIRED');
  const j=readJson(p) as Journal;verifyRoots(app,j,true);
  for(const b of j.bindings){assertInside(app,join(app,b.path));if(sha(fs.readFileSync(join(app,b.path)))!==b.sha256)throw Error('GENERATION_BINDING: '+b.path);}
  if(inventory(join(state(app),'safe-public')).some(e=>denied(e.path)))throw Error('DENIED_MEDIA');
}
export function preservePrivate(app: string, dest: string) {
  for(const e of inventory(join(app,'public/content')).filter(e=>denied(e.path))){const p=join(dest,e.path);fs.mkdirSync(dirname(p),{recursive:true});fs.copyFileSync(join(app,'public/content',e.path),p);}
}
export function assertInside(root: string,p: string) {if(resolve(p)!==resolve(root)&&!resolve(p).startsWith(resolve(root)+'/'))throw Error('PATH_ESCAPE');let dir=resolve(p);while(dir!==resolve(root)){if(exists(dir)&&fs.lstatSync(dir).isSymbolicLink())throw Error('SYMLINK: '+dir);dir=dirname(dir);}}
