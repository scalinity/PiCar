import { expect, it } from 'vitest';
import * as fs from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { inventory, denied, readJson, sha } from '../../tools/content-pipeline/publication';
it('a fresh source-free checkout builds through the safe mirror and excludes synthetic secrets from dist',()=>{
 if(process.env.PICAR_ALLOW_PACKAGE_BUILD!=='1')throw Error('PACKAGE_BUILD_REQUIRES_SEPARATE_OWNER_AUTHORIZATION');
 const root=fs.mkdtempSync(join(tmpdir(),'picar-m0-TEST-package-')),app=join(root,'picarx-companion');fs.mkdirSync(app);
 try{
  for(const p of ['src','tools','custom-docs','index.html','package.json','pnpm-lock.yaml','tsconfig.json','tsconfig.node.json','vite.config.ts'])fs.cpSync(join(process.cwd(),p),join(app,p),{recursive:true});
  for(const p of ['tauri.conf.json','capabilities/default.json']){fs.mkdirSync(join(app,'src-tauri',p,'..'),{recursive:true});fs.copyFileSync(join(process.cwd(),'src-tauri',p),join(app,'src-tauri',p));}
  fs.mkdirSync(join(root,'docs/digital-twin/MACHINE_READABLE_SCHEMAS'),{recursive:true});fs.copyFileSync(join(process.cwd(),'../docs/digital-twin/MACHINE_READABLE_SCHEMAS/documentation-source-lock.schema.json'),join(root,'docs/digital-twin/MACHINE_READABLE_SCHEMAS/documentation-source-lock.schema.json'));
  // M3 adds cleared, accepted canonical references; source-free means no upstream docs checkout.
  for(const rel of ['digital-twin/schemas/digital-twin.schema.json','digital-twin/schemas/m2-search-index.schema.json','digital-twin/validation/m2/runtime-registry.json','docs/digital-twin/V40_ASSEMBLY_LEDGER.md',...['rpi4','rpi5','rpi-zero-2-w'].flatMap(v=>[`digital-twin/validation/m2/${v}/compiled-graph.json`,`digital-twin/validation/m2/${v}/search-index.json`])]){fs.mkdirSync(join(root,rel,'..'),{recursive:true});fs.copyFileSync(join(process.cwd(),'..',rel),join(root,rel));}
  const baseline=readJson('tools/content-pipeline/documentation-generation-baseline.json');
  for(const e of baseline.publicFiles){const dest=join(app,'public/content',e.path);fs.mkdirSync(join(dest,'..'),{recursive:true});fs.copyFileSync(join(process.cwd(),'public/content',e.path),dest);}
  for(const p of ['tauri.svg','vite.svg'])fs.copyFileSync(join(process.cwd(),'public',p),join(app,'public',p));
  const marker='TEST-SYNTHETIC-NOT-A-REAL-SECRET';const deniedPaths=['nested/llm_openai_copy.png','nested/imager_custom_wifi.png','private/spec-audit-v2/originals/TEST-photo.jpeg'];
  for(const p of deniedPaths){fs.mkdirSync(join(app,'public/content',p,'..'),{recursive:true});fs.writeFileSync(join(app,'public/content',p),marker);}
  fs.writeFileSync(join(app,'public/TEST-unowned.txt'),marker);
  // Dependencies are execution tools, not publication input/output roots.
  fs.symlinkSync(join(process.cwd(),'node_modules'),join(app,'node_modules'));
  const build=spawnSync('pnpm',['build'],{cwd:app,env:{...process.env,VITE_M3_ENABLED:'0',VITE_M3_NATIVE_TEST:'0'},encoding:'utf8',timeout:30000,maxBuffer:4*1024*1024});
  expect(build.status,build.stdout+'\n'+build.stderr).toBe(0);
  expect(fs.existsSync(join(root,'sunfounder-docs'))).toBe(false);
  for(const e of inventory(join(app,'dist'))){expect(denied(e.path)).toBe(false);expect(fs.readFileSync(join(app,'dist',e.path)).includes(Buffer.from(marker))).toBe(false);}
  for(const e of inventory(join(app,'dist')))for(const marker of ['__picarM3Test','plugin:wdio','m3_test_fault'])expect(fs.readFileSync(join(app,'dist',e.path)).includes(Buffer.from(marker))).toBe(false);
  for(const p of deniedPaths)expect(fs.readFileSync(join(app,'public/content',p),'utf8')).toBe(marker);
  expect(fs.existsSync(join(app,'dist/TEST-unowned.txt'))).toBe(false);
 }finally{fs.rmSync(root,{recursive:true,force:true});}
},30000);
