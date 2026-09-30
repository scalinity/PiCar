// Bounded, source-free fixture only. It never builds or writes the live public/dist roots.
import fs from 'node:fs';
import {join,dirname} from 'node:path';
import {tmpdir} from 'node:os';
import {spawnSync} from 'node:child_process';
import {inventory,denied,readJson,sha} from '../content-pipeline/publication';
if(process.env.PICAR_ALLOW_PACKAGE_BUILD!=='1')throw Error('ISOLATED_PACKAGE_AUTHORIZATION_REQUIRED');
const source=process.cwd(),root=fs.mkdtempSync(join(fs.realpathSync(tmpdir()),'picar-m3-native-package-')),app=join(root,'picarx-companion');fs.mkdirSync(app);
for(const p of ['src','tools','custom-docs','index.html','package.json','pnpm-lock.yaml','tsconfig.json','tsconfig.node.json','vite.config.ts'])fs.cpSync(join(source,p),join(app,p),{recursive:true});
for(const p of ['tauri.conf.json','capabilities/default.json']){fs.mkdirSync(dirname(join(app,'src-tauri',p)),{recursive:true});fs.copyFileSync(join(source,'src-tauri',p),join(app,'src-tauri',p));}
const references=['docs/digital-twin/MACHINE_READABLE_SCHEMAS/documentation-source-lock.schema.json','digital-twin/schemas/digital-twin.schema.json','digital-twin/schemas/m2-search-index.schema.json','digital-twin/validation/m2/runtime-registry.json','docs/digital-twin/V40_ASSEMBLY_LEDGER.md',...['rpi4','rpi5','rpi-zero-2-w'].flatMap(v=>[`digital-twin/validation/m2/${v}/compiled-graph.json`,`digital-twin/validation/m2/${v}/search-index.json`])];
for(const p of references){fs.mkdirSync(dirname(join(root,p)),{recursive:true});fs.copyFileSync(join(source,'..',p),join(root,p));}
for(const p of ['tests/native/bootstrap.ts','tests/native/fixtures.json','tests/session/adapter-contract.ts','tests/session/browser-controls.ts']){fs.mkdirSync(dirname(join(app,p)),{recursive:true});fs.copyFileSync(join(source,p),join(app,p));}
const baseline=readJson(join(source,'tools/content-pipeline/documentation-generation-baseline.json'));
for(const e of baseline.publicFiles){const target=join(app,'public/content',e.path);fs.mkdirSync(dirname(target),{recursive:true});fs.copyFileSync(join(source,'public/content',e.path),target);}
for(const p of ['tauri.svg','vite.svg'])fs.copyFileSync(join(source,'public',p),join(app,'public',p));
fs.symlinkSync(join(source,'node_modules'),join(app,'node_modules'));
const result=spawnSync('pnpm',['build'],{cwd:app,env:{...process.env,VITE_M3_ENABLED:'1',VITE_M3_NATIVE_TEST:'1'},encoding:'utf8',timeout:120000,maxBuffer:4*1024*1024});
process.stdout.write(result.stdout??'');process.stderr.write(result.stderr??'');if(result.status!==0)throw Error('ISOLATED_NATIVE_PACKAGE_BUILD_FAILED:'+result.status);
const files=inventory(join(app,'dist'));for(const e of files)if(denied(e.path))throw Error('DENIED_OUTPUT');
if(fs.existsSync(join(root,'digital-twin/evidence'))||fs.existsSync(join(root,'sunfounder-docs')))throw Error('PRIVATE_SOURCE_REACHABLE');
const receipt={purpose:'test-only source-free native offline fixture',root,app,dist:join(app,'dist'),references:references.map(path=>({path,rawSha256:sha(fs.readFileSync(join(root,path)))})),files};
fs.writeFileSync(join(source,'../docs/implementation/evidence/m3/native-package.json'),JSON.stringify(receipt,null,2)+'\n');
console.log('Isolated test-only package:',receipt.dist);
