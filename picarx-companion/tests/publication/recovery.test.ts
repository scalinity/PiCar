import { afterEach, expect, it } from 'vitest';
import * as fs from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { acquire, denied, inventory, managed, preservePrivate, protectedHash, publish, recover, safeMirror, sha, treeHash } from '../../tools/content-pipeline/publication';
const fixtures:string[]=[];
function write(p:string,value:string){fs.mkdirSync(join(p,'..'),{recursive:true});fs.writeFileSync(p,value);}
function fixture(){const app=fs.mkdtempSync(join(tmpdir(),'picar-m0-TEST-'));fixtures.push(app);const stage=join(app,'staging');
 for(const p of managed){const file=p.endsWith('.json')?'':'/TEST-file';write(join(app,p)+file,'old '+p);write(join(stage,p)+file,'new '+p);}
 write(join(app,'public/content/nested/llm_openai_copy.png'),'TEST-SYNTHETIC-SECRET');
 write(join(app,'public/twin/TEST-SENTINEL'),'TEST-TWIN');write(join(app,'custom-docs/TEST-SENTINEL'),'TEST-CUSTOM');
 preservePrivate(app,join(stage,'public/content'));fs.rmSync(join(stage,'.content-publication/safe-public'),{recursive:true});safeMirror(app,join(stage,'public/content'),join(stage,'.content-publication/safe-public'));
 return{app,stage,protected:protectedHash(app),old:managed.map(p=>treeHash(join(app,p))),next:managed.map(p=>treeHash(join(stage,p)))};
}
afterEach(()=>{for(const p of fixtures.splice(0))fs.rmSync(p,{recursive:true,force:true});});
const points=['journal',...managed.flatMap((_,i)=>['displaced:'+i,'replaced:'+i]),'verified','marker','complete'];
for(const point of points)it('fresh-process recovery at '+point,()=>{
 const f=fixture(),child=spawnSync('node',['--import','tsx','tests/publication/child.ts',f.app,f.stage,point,'publish'],{encoding:'utf8'});expect(child.status,child.stderr).toBe(77);
 const recovered=spawnSync('node',['--import','tsx','tests/publication/child.ts',f.app,f.stage,'','recover'],{encoding:'utf8'});expect(recovered.status,recovered.stderr).toBe(0);
 expect(managed.map(p=>treeHash(join(f.app,p)))).toEqual(['marker','complete'].includes(point)?f.next:f.old);expect(protectedHash(f.app)).toBe(f.protected);
});
it('interrupted recovery restarts to exactly the old generation',()=>{
 const f=fixture();spawnSync('node',['--import','tsx','tests/publication/child.ts',f.app,f.stage,'replaced:3','publish']);
 expect(spawnSync('node',['--import','tsx','tests/publication/child.ts',f.app,f.stage,'recovery:2','recover']).status).toBe(77);
 const r=spawnSync('node',['--import','tsx','tests/publication/child.ts',f.app,f.stage,'','recover'],{encoding:'utf8'});expect(r.status,r.stderr).toBe(0);expect(managed.map(p=>treeHash(join(f.app,p)))).toEqual(f.old);
});
it('missing rollback data fails without mutating the interrupted tree',()=>{
 const f=fixture();spawnSync('node',['--import','tsx','tests/publication/child.ts',f.app,f.stage,'replaced:3','publish']);
 const j=JSON.parse(fs.readFileSync(join(f.app,'.content-publication/journal.json'),'utf8'));fs.rmSync(join(f.app,'.content-publication/generations',j.id,'old/0'),{recursive:true});
 const before=managed.map(p=>treeHash(join(f.app,p)));const r=spawnSync('node',['--import','tsx','tests/publication/child.ts',f.app,f.stage,'','recover'],{encoding:'utf8'});expect(r.status).not.toBe(0);expect(r.stderr).toContain('MISSING_OR_CORRUPT_ROLLBACK');expect(managed.map(p=>treeHash(join(f.app,p)))).toEqual(before);
});
it('concurrent writers and live readers prevent mutation',()=>{
 const f=fixture();const reader=acquire(f.app,'reader');expect(()=>acquire(f.app,'writer')).toThrow('BUSY');reader();const writer=acquire(f.app,'writer');
 const child=spawnSync('node',['--import','tsx','tests/publication/child.ts',f.app,f.stage,'','publish'],{encoding:'utf8'});expect(child.status).not.toBe(0);expect(child.stderr).toContain('BUSY');expect(()=>acquire(f.app,'reader')).toThrow('BUSY');writer();
 expect(managed.map(p=>treeHash(join(f.app,p)))).toEqual(f.old);
});
it('a source changing during staging fails before a publication journal/live mutation',()=>{
 const f=fixture();const release=acquire(f.app,'writer');let count=0;try{expect(()=>publish(f.app,f.stage,()=>{if(++count===2)throw Error('SOURCE_CHANGED');})).toThrow('SOURCE_CHANGED');expect(managed.map(p=>treeHash(join(f.app,p)))).toEqual(f.old);expect(fs.existsSync(join(f.app,'.content-publication/journal.json'))).toBe(false);}finally{release();}
});
it('denied paths at every depth never enter safe mirrors; originals survive',()=>{
 const f=fixture();for(const name of ['llm_qwen_api_key.png','imager_custom_connect_token.png','imager_custom_authkey.png','imager_custom_wifi.png','paste_api_key_enter_open_claw.png','rpi_connect1.mp4','llm_test_copy_other.png','private/TEST-owner.jpeg'])write(join(f.app,'public/content/untracked/nested',name),'TEST-SYNTHETIC-SECRET');
 const mirror=join(f.app,'TEST-mirror');safeMirror(f.app,join(f.app,'public/content'),mirror);expect(inventory(mirror).some(e=>denied(e.path))).toBe(false);
 for(const e of inventory(mirror))expect(fs.readFileSync(join(mirror,e.path),'utf8')).not.toContain('TEST-SYNTHETIC-SECRET');expect(fs.readFileSync(join(f.app,'public/content/nested/llm_openai_copy.png'),'utf8')).toBe('TEST-SYNTHETIC-SECRET');
});
it('symlinks are rejected instead of escaping approved roots',()=>{const f=fixture();fs.symlinkSync('/etc',join(f.app,'public/content/TEST-link'));expect(()=>safeMirror(f.app,join(f.app,'public/content'),join(f.app,'TEST-mirror'))).toThrow('SYMLINK');});
