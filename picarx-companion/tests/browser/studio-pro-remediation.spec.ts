import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {test,expect,type Page} from '@playwright/test';
const synthetic=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aJU0AAAAASUVORK5CYII=','base64');
const out=process.env.PICAR_BROWSER_EVIDENCE_DIR??'../docs/implementation/evidence/studio-3-pro-remediation';
const build=(p:Page)=>p.locator('.studio-build');
const ledger=(p:Page)=>p.evaluate(async()=>{const s=await import(String('/src/features/assembly-session/store.ts'));return s.exportData();});
async function open(p:Page,n=1){await p.goto(`/#/studio/rpi5/${n}?diagnostics`);await expect(build(p)).not.toContainText('Opening saved');await expect(p.locator('.studio')).toHaveAttribute('data-step',String(n));}
// Hold/wrap real adapters. Production copying, hashes, reads, commands and durable commits remain active.
for(const mode of ['baseline','success','failure','lost-ack','conflict'] as const)test(`bound photo intent during real copy: ${mode}`,async({page:original,playwright,browserName})=>{
 test.setTimeout(90000);
 const folder=browserName==='webkit'?fs.mkdtempSync(path.join(os.tmpdir(),'picar-studio-pro-browser-')):null;
 const context=folder?await playwright.webkit.launchPersistentContext(folder,{headless:true,baseURL:'http://localhost:1420'}):null;
 const page=context?await context.newPage():original;
 try{
 await page.route('**/*',r=>new URL(r.request().url()).hostname==='localhost'?r.continue():r.abort());
 await page.addInitScript(()=>{const w=window as any;w.__copyCount=0;w.__commands=[];w.__copyGate=new Promise(resolve=>w.__releaseCopy=resolve);});
 await page.route('**/src/platform/evidence.ts*',async route=>{const response=await route.fetch(),body=await response.text();const changed=body.replace(/(export async function copyPhoto[^\{]*\{)/,'$1 globalThis.__copyCount++; globalThis.__copyEntered=true; await globalThis.__copyGate;');expect(changed).not.toBe(body);await route.fulfill({response,body:changed});});
 await page.route('**/src/platform/browser/indexed-db.ts*',async route=>{const response=await route.fetch(),body=await response.text();const changed=body.replace('return repository;',`const original=repository.commit.bind(repository);repository.commit=async c=>{if(c.payload.kind!=="observation")return original(c);globalThis.__commands.push(JSON.parse(JSON.stringify(c)));if(${JSON.stringify(mode)}==="failure"&&globalThis.__commands.length===1)throw Error("TEST_REPOSITORY_FAILURE");const ack=await original(c);if(${JSON.stringify(mode)}==="lost-ack"&&globalThis.__commands.length===1)throw Error("TEST_LOST_ACK");return ack;};return repository;`);expect(changed).not.toBe(body);await route.fulfill({response,body:changed});});
 if(mode==='baseline')await page.route('**/src/features/assembly-3d/build-along.tsx*',async route=>{const response=await route.fetch(),body=await response.text();const changed=body.replace(/sessionActionBound\(aggregate,\s*/,'sessionAction(');expect(changed).not.toBe(body);await route.fulfill({response,body:changed});});
 await open(page);await build(page).getByRole('button',{name:'Start build session'}).click();await expect(build(page)).toHaveAttribute('data-session','PX-STUDIO-RPI5');
 await page.evaluate(async()=>{const s=await import(String('/src/features/assembly-session/store.ts'));await s.createSession('rpi5',null,'TEST-ASSEMBLY-B');await s.loadSession('PX-STUDIO-RPI5');});
 const initialCopies=await page.evaluate(async()=>{try{const root=await navigator.storage.getDirectory(),dir=await(await root.getDirectoryHandle('evidence')).getDirectoryHandle('PX-STUDIO-RPI5');let n=0;for await(const _ of (dir as any).values())n++;return n;}catch{return 0;}});
 const a=(await ledger(page)).aggregates.find((s:any)=>s.aggregate.id==='PX-STUDIO-RPI5').aggregate;
 await build(page).locator('input[type=file]').setInputFiles({name:'synthetic.png',mimeType:'image/png',buffer:synthetic});await expect.poll(()=>page.evaluate(()=>(window as any).__copyEntered)).toBe(true);
 await page.evaluate(async()=>{const s=await import(String('/src/features/assembly-session/store.ts'));await s.loadSession('TEST-ASSEMBLY-B');});
 if(mode==='conflict')await page.evaluate(async()=>{const s=await import(String('/src/features/assembly-session/store.ts'));const {acceptedContext,contexts}=await import(String('/src/features/assembly-session/accepted.ts'));const {prepareCommand}=await import(String('/src/features/assembly-session/commands.ts'));const {openBrowserRepository}=await import(String('/src/platform/browser/indexed-db.ts'));const ctx=await acceptedContext('rpi5'),old=await s.sessionHistory('PX-STUDIO-RPI5'),repo=await openBrowserRepository('picarx.sessions',contexts);await repo.commit(prepareCommand(old.aggregate,{kind:'bookmark',stepId:'PX-V40-STEP-03'},'TEST-CONCURRENT-A',ctx));repo.close();});
 await page.evaluate(()=>(window as any).__releaseCopy());
 if(mode==='baseline'){await expect(build(page).getByRole('alert')).toContainText('OBSERVATION_BINDING');expect((await ledger(page)).aggregates.flatMap((s:any)=>s.events.filter((e:any)=>e.action.kind==='observation'))).toHaveLength(0);expect(await page.evaluate(()=>(window as any).__copyCount)).toBe(1);expect(await page.evaluate(async()=>{const s=await import(String('/src/features/assembly-session/store.ts'));return s.getStore().retryAvailable;})).toBe(false);fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,`old-photo-reproduction-${browserName}.json`),JSON.stringify({baseline:'e15ea228f5c5a77440a6cffb67f3ceae08df1ae9',method:'Restore the prior global-selection submission at the real adapter boundary; all other production adapters stay real',failure:'OBSERVATION_BINDING',copies:1,observations:0,retryAvailable:false,result:'DEFECT REPRODUCED'},null,2)+'\n');return;}
 if(mode==='failure'||mode==='lost-ack'||mode==='conflict'){
  await expect(build(page).getByRole('alert')).toContainText(mode==='conflict'?'CONFLICT':mode==='failure'?'TEST_REPOSITORY_FAILURE':'TEST_LOST_ACK');
  await page.goto('/#/reference');await page.goto('/#/studio/rpi5/1?diagnostics');await expect(build(page).getByRole('alert')).toContainText('private photo copy is retained');
  if(mode!=='conflict')await build(page).getByRole('button',{name:'Retry pending save'}).click();
  else await expect(build(page).getByRole('button',{name:'Retry pending save'})).toHaveCount(0);
 }
 if(mode!=='conflict'){await expect(build(page)).toContainText('1 photos');await expect(build(page).getByRole('alert')).toHaveCount(0);}
 const final=await ledger(page),records=final.aggregates.find((s:any)=>s.aggregate.id===a.id).events.filter((e:any)=>e.action.kind==='observation').map((e:any)=>e.action.record);
 expect(final.aggregates.find((s:any)=>s.aggregate.id==='TEST-ASSEMBLY-B').events.filter((e:any)=>e.action.kind==='observation')).toHaveLength(0);
 const proof=await page.evaluate(async()=>{const s=await import(String('/src/features/assembly-session/store.ts'));const {readPhoto}=await import(String('/src/platform/evidence.ts'));const w=window as any,bytes=await readPhoto(w.__commands[0].payload.record);const root=await navigator.storage.getDirectory(),dir=await(await root.getDirectoryHandle('evidence')).getDirectoryHandle('PX-STUDIO-RPI5');let copies=0;for await(const _ of (dir as any).values())copies++;return {selected:s.getStore().selected?.id,retry:s.getStore().retryAvailable,copyCalls:w.__copyCount,copies,commands:w.__commands,bytes:Array.from(bytes as Uint8Array)};});
 expect(proof.selected).toBe('TEST-ASSEMBLY-B');expect(proof.copyCalls).toBe(1);expect(proof.copies-initialCopies).toBe(1);expect(Buffer.from(proof.bytes)).toEqual(synthetic);expect(proof.retry).toBe(false);expect(proof.commands[0].aggregateId).toBe(a.id);expect(proof.commands[0].expectedRevision).toBe(a.revision);expect(records).toHaveLength(mode==='conflict'?0:1);
 const record=proof.commands[0].payload.record;expect(record).toMatchObject({sessionId:a.id,variantId:'rpi5',stepId:'PX-V40-STEP-01'});expect(record.packId).toMatch(/^[a-f0-9]{64}$/);expect(record.geometry.length).toBeGreaterThan(0);
 if(mode==='failure'||mode==='lost-ack')expect(proof.commands[1]).toEqual(proof.commands[0]);
 fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,`photo-binding-${mode}-${browserName}.json`),JSON.stringify({mode,browserName,realAdapters:true,syntheticOnly:true,selected:proof.selected,copyCalls:proof.copyCalls,newCopies:proof.copies-initialCopies,priorCopies:initialCopies,observationCountA:records.length,observationCountB:0,exactRetry:proof.commands.length===2?JSON.stringify(proof.commands[0])===JSON.stringify(proof.commands[1]):null,boundRecord:record,result:'PASS'},null,2)+'\n');
 }finally{await context?.close();if(folder)fs.rmSync(folder,{recursive:true,force:true});}
});
for(const n of [4,10,29])test(`Parts return preserves saved S${n}`,async({page})=>{
 await open(page);await build(page).getByRole('button',{name:'Start build session'}).click();await expect(build(page)).toHaveAttribute('data-session','PX-STUDIO-RPI5');
 await page.evaluate(async n=>{const s=await import(String('/src/features/assembly-session/store.ts'));const {acceptedContext}=await import(String('/src/features/assembly-session/accepted.ts'));await s.sessionAction({kind:'bookmark',stepId:`PX-V40-STEP-${String(n).padStart(2,'0')}`},await acceptedContext('rpi5'));},n);
 await open(page,0);const before=await ledger(page);await build(page).getByRole('link',{name:`Return to ${n>9?'last available':'saved'} Step ${Math.min(n,9)}`}).click();await expect(page.locator('.studio')).toHaveAttribute('data-step',String(Math.min(n,9)));expect(await ledger(page)).toEqual(before);
 await page.locator('.studio-rail a').filter({hasText:/^2$/}).click();await expect.poll(async()=>{const b=await ledger(page);return b.aggregates[0].aggregate.snapshot.reviewStepId;}).toBe('PX-V40-STEP-02');
});
test('consumable roles and neutral cable-wrap explanation preserve 156 slots and hardware ordinals',async({page})=>{
 await open(page,0);const inspector=page.getByRole('region',{name:'Selected part'});
 for(const [suffix,role] of [['HOOK-001','source lot identity, length unknown'],['HOOK-002','preallocated S06 cut piece; amount unknown'],['LOOP-001','source lot identity, length unknown'],['LOOP-002','preallocated S06 cut piece; amount unknown'],['CABLE-WRAP-001','source lot identity, length unknown']]){
  await page.evaluate(async id=>{const {select}=await import(String('/src/features/assembly-3d/state/studio-store.ts'));select(`PX-V40-INS-${id}`);},suffix);await expect(inspector).toContainText(role);await expect(inspector).not.toContainText('identical pieces');await expect(inspector).not.toContainText('cut from tape stock');
 }
 await page.evaluate(async()=>{const {select}=await import(String('/src/features/assembly-3d/state/studio-store.ts'));select('PX-V40-INS-M25X6-SCREW-001');});await expect(inspector).toContainText('1 of 10 identical pieces');
 expect(await page.evaluate(()=>(window as any).__studio.roots())).toHaveLength(156);expect((await ledger(page)).aggregates).toHaveLength(0);
});
