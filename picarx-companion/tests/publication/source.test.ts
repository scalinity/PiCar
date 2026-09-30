import { beforeAll, afterAll, afterEach, expect, it } from 'vitest';
import * as fs from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { captureInputs, inputManifest, verifySource, v40 } from '../../tools/content-pipeline/source';
let root:string,app:string;const restored:{p:string;bytes:Buffer}[]=[];
function change(p:string,bytes:Buffer|string|null){restored.push({p,bytes:fs.readFileSync(p)});if(bytes===null)fs.unlinkSync(p);else fs.writeFileSync(p,bytes);}
beforeAll(()=>{
 root=fs.mkdtempSync(join(tmpdir(),'picar-m0-TEST-source-'));app=join(root,'picarx-companion');fs.mkdirSync(app,{recursive:true});
 const real=join(process.cwd(),'..');
 execFileSync('git',['clone','--quiet','--shared',join(real,'sunfounder-docs'),join(root,'sunfounder-docs')]);
 execFileSync('git',['clone','--quiet','--shared',join(real,'sunfounder-docs/docs/source/_shared'),join(root,'sunfounder-docs/docs/source/_shared')]);
 for(const p of ['tools/content-pipeline','custom-docs'])fs.cpSync(join(process.cwd(),p),join(app,p),{recursive:true});
 fs.cpSync(join(real,'docs/digital-twin/MACHINE_READABLE_SCHEMAS'),join(root,'docs/digital-twin/MACHINE_READABLE_SCHEMAS'),{recursive:true});
 fs.mkdirSync(join(root,'sunfounder-docs/pdfs'));fs.copyFileSync(join(real,'sunfounder-docs/pdfs',v40),join(root,'sunfounder-docs/pdfs',v40));
 fs.writeFileSync(join(app,'tools/content-pipeline/documentation-input-manifest.json'),JSON.stringify(inputManifest(app),null,2)+'\n');
},30000);
afterEach(()=>{for(const e of restored.splice(0).reverse())fs.writeFileSync(e.p,e.bytes);});
afterAll(()=>fs.rmSync(root,{recursive:true,force:true}));
it('accepts exact V40 and clean pinned upstream/shared bytes',()=>expect(verifySource(app).length).toBeGreaterThan(600));
it('missing V40 fails even when only V33 exists',()=>{const pdf=join(root,'sunfounder-docs/pdfs',v40);fs.copyFileSync(pdf,join(root,'sunfounder-docs/pdfs/z0104v33-a0001013-picar-x.pdf'));change(pdf,null);expect(()=>verifySource(app)).toThrow('MISSING_V40');});
it('wrong bytes under the V40 name fail',()=>{change(join(root,'sunfounder-docs/pdfs',v40),'TEST-WRONG-PDF');expect(()=>verifySource(app)).toThrow('PDF_HASH');});
it('dirty consumed source fails despite the correct HEAD',()=>{const p=join(root,'sunfounder-docs/docs/source/index.rst');change(p,fs.readFileSync(p,'utf8')+'\nTEST-DIRTY');expect(()=>verifySource(app)).toThrow('DIRTY_UPSTREAM');});
it('wrong shared revision fails',()=>{const p=join(app,'tools/content-pipeline/documentation-source-lock.json');const lock=JSON.parse(fs.readFileSync(p,'utf8'));lock.sharedCommit='0'.repeat(40);change(p,JSON.stringify(lock));expect(()=>verifySource(app)).toThrow('SOURCE_PIN');});
for(const name of ['sunfounder-docs','sunfounder-docs/docs/source/_shared'])it('wrong actual checkout revision fails: '+name,()=>{
 // Local source clones are shallow. Point only the disposable clone's HEAD at
 // its existing tree object: a mismatched revision, without creating commits.
 const checkout=join(root,name),headPath=join(checkout,'.git/HEAD'),head=fs.readFileSync(headPath);
 const wrong=execFileSync('git',['-C',checkout,'rev-parse','HEAD^{tree}'],{encoding:'utf8'}).trim();
 try{fs.writeFileSync(headPath,wrong+'\n');expect(()=>verifySource(app)).toThrow('UPSTREAM_REVISION');}
 finally{fs.writeFileSync(headPath,head);}
});
it('incomplete panel/branch lock cannot authorize generation',()=>{const p=join(app,'tools/content-pipeline/documentation-source-lock.json');const lock=JSON.parse(fs.readFileSync(p,'utf8'));lock.panels[2].mappings=lock.panels[2].mappings.filter((m:any)=>!m.variants.includes('rpi-zero-2-w'));change(p,JSON.stringify(lock));expect(()=>verifySource(app)).toThrow('BRANCH_COVERAGE');});
it('source mutation after captured-byte staging is detected before publication',()=>{captureInputs(app,join(root,'TEST-snapshot'));const p=join(root,'sunfounder-docs/docs/source/index.rst');change(p,fs.readFileSync(p,'utf8')+'\nTEST-STAGING-CHANGE');expect(()=>verifySource(app)).toThrow('DIRTY_UPSTREAM');});
it('changed overlay/custom source fails the input lock',()=>{const p=join(app,'custom-docs/hermes.rst');change(p,fs.readFileSync(p,'utf8')+'\nTEST-ALTERED');expect(()=>verifySource(app)).toThrow('INPUT_TAMPER');});
