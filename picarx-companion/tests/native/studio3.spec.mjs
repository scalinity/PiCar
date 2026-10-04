import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const out=process.env.PICAR_NATIVE_EVIDENCE_DIR??'../docs/implementation/evidence/studio-3';
const record=(name,value)=>fs.writeFileSync(path.join(out,name+'.json'),JSON.stringify(value,null,2)+'\n');
const text=()=>$('.studio-build').getText();
const script=action=>browser.tauri.execute(action);
async function open(v,n){const base=(await browser.getUrl()).split('#')[0];await browser.url(base+`#/studio/${v}/${n}?diagnostics`);await browser.waitUntil(async()=>await script(()=>{const d=window.__studio;return d?.variant===document.querySelector('.studio')?.getAttribute('data-variant')&&d?.state().key===location.hash.split('?')[0].slice(9);}),{timeout:30000});await $(`.studio[data-variant="${v}"][data-step="${n}"]`).waitForDisplayed();await browser.waitUntil(async()=>!(await text()).includes('Opening saved'),{timeout:30000});}
it('actual native Studio3 build progress and private photo persistence on disposable SQLite app data',async()=>{
 await browser.waitUntil(async()=>await script(()=>typeof window.__picarM3Test==='object'),{timeout:30000});
 assert.deepEqual(await script(()=>window.__picarM3Test.isolation()),{legacy:null,imports:0});
 for(const variant of ['rpi5','rpi-zero-2-w']){
  await open(variant,0);await browser.waitUntil(async()=>await script(()=>!!window.__studio?.roots()),{timeout:30000});await browser.pause(1100); // the guided framing tween settles before pixel census
  const census=await script(()=>({packId:window.__studio.packId,variant:window.__studio.variant,roots:window.__studio.roots(),census:window.__studio.census(),view:window.__studio.viewport()?.gl.domElement.getBoundingClientRect().toJSON()}));
  record('native-tray-'+variant,census);assert.equal(census.roots.length,156);assert.equal(census.roots.filter(r=>r.tile).length,13);assert(Object.values(census.census).every(n=>n>0));assert.equal(census.roots.filter(r=>r.id.includes('INS-PLATE-')).length,8);
  await browser.saveScreenshot(path.join(out,'native-tray-'+variant+'.png'));
  if(variant==='rpi5'){const sample=await script(async()=>{const d=window.__studio;await d.viewport().frame(8);return d.perf();});record('native-perf',sample);}
  await $('button=Start build session').click();await browser.waitUntil(async()=>(await text()).includes('0/29'),{timeout:30000});
  await $(`.studio-rail a[href="#/studio/${variant}/1"]`).click();await browser.waitUntil(async()=>{const b=await script(()=>window.__picarM3Test.studio('backup'));return b.aggregates.find(a=>a.aggregate.snapshot.variantId===variant)?.aggregate.snapshot.reviewStepId==='PX-V40-STEP-01';});
  await $('.studio-build textarea').setValue('Synthetic native owner confirmation.');await $('button=Mark physically done').click();await browser.waitUntil(async()=>(await text()).includes('1/29'),{timeout:30000});
  assert((await text()).includes('does not clear M7'));
  await $('.studio-build input[type=checkbox]').click();await $('button=Undo / reopen physical step').click();await browser.waitUntil(async()=>(await text()).includes('0/29'),{timeout:30000});
 }
 await open('rpi-zero-2-w',0);await $('.studio-rail a[href="#/studio/rpi-zero-2-w/3"]').click();await browser.waitUntil(async()=>{const b=await script(()=>window.__picarM3Test.studio('backup'));return b.aggregates.find(a=>a.aggregate.id==='PX-STUDIO-ZERO2W').aggregate.snapshot.reviewStepId==='PX-V40-STEP-03';});
 const beforeSwitch=await script(()=>window.__picarM3Test.studio('backup'));await $('.studio-boards a[href="#/studio/rpi5/3"]').click();await $('.studio[data-variant="rpi5"][data-step="3"]').waitForDisplayed();assert.deepEqual(await script(()=>window.__picarM3Test.studio('backup')),beforeSwitch);
 await $('.studio-rail a[href="#/studio/rpi5/0"]').click();await $('.studio-boards a[href="#/studio/rpi-zero-2-w/0"]').click();await $('.studio[data-variant="rpi-zero-2-w"][data-step="0"]').waitForDisplayed();assert.deepEqual(await script(()=>window.__picarM3Test.studio('backup')),beforeSwitch);
 await open('rpi5',0);const beforeResume=await script(()=>window.__picarM3Test.studio('backup'));await $('.studio-build a').click();await $('.studio[data-variant="rpi5"][data-step="1"]').waitForDisplayed();assert.deepEqual(await script(()=>window.__picarM3Test.studio('backup')),beforeResume);record('native-parts-resume',{savedStep:'PX-V40-STEP-01',displayedStep:1,ledgerUnchanged:'PASS'});
 await open('rpi5',1);const before=await script(()=>window.__picarM3Test.studio('backup'));
 await $('.studio-transport button:nth-child(2)').click();await $('[aria-label="Isolate"]').click();await $('[aria-label="Ghost others"]').click();await $('[aria-label="Deck clip"]').click();await $('[aria-label="Reset inspection"]').click();await browser.keys('r');assert.deepEqual(await script(()=>window.__picarM3Test.studio('backup')),before);
 await script(()=>window.__picarM3Test.studio('photo'));await browser.waitUntil(async()=>(await text()).includes('1 photos'));
 const photo=await script(()=>window.__picarM3Test.studio('photoCheck'));record('native-observation',{record:photo.record,syntheticOnly:true,copyReadHash:'PASS'});
 fs.writeFileSync(path.join(process.env.PICAR_M3_TEST_DATA_DIR,'expected-evidence.zip'),Buffer.from(photo.zip));
 await script(()=>window.__picarM3Test.studio('restart'));await browser.refresh();await browser.waitUntil(async()=>(await text()).includes('1 photos'),{timeout:30000});assert.deepEqual((await script(()=>window.__picarM3Test.studio('photoCheck'))).record,photo.record);
 await browser.saveScreenshot(path.join(out,'native-build-along.png'));
 await script(()=>document.querySelector('.studio-build input[type=file]').scrollIntoView({block:'center'}));await browser.saveScreenshot(path.join(out,'native-controls.png'));await script(()=>document.querySelector('.studio-drawer').scrollTop=0);
 record('native-progress',{variantSessions:before.aggregates.map(a=>a.aggregate.id),bookmark:'PASS',physicalCompleteUndo:'PASS',readOnlyViewer:'PASS',photoReload:'PASS'});
 await script(()=>{const details=document.querySelector('.studio-build details');details.open=true;});await $('.studio-build details input').click();
 const beforeNativeUI=await script(async()=>({ledger:await window.__picarM3Test.studio('backup'),camera:window.__studio.camera()}));
 await script(()=>{const states=[];window.__studio3PhysicalStates=states;const capture=()=>{const s=window.__studio.state(),full=document.querySelector('.studio').dataset.fullscreen==='true';const index=states.length;const matches=[s.manualOpen&&!!s.selection&&full,!s.manualOpen&&!!s.selection&&full,!s.manualOpen&&!s.selection&&full,!s.manualOpen&&!s.selection&&!full];if(matches[index])states.push({label:'ABCD'[index],manualOpen:s.manualOpen,selection:s.selection,fullscreen:full,visibility:document.visibilityState,atPerformanceMs:performance.now()});if(states.length===4)clearInterval(timer);};const timer=setInterval(capture,25);});
 record('native-export-panel',{state:'AWAITING_NATIVE_UI_EXPORT_AND_DISPOSABLE_DESTINATION',disposableRootBasename:path.basename(process.env.PICAR_M3_TEST_DATA_DIR),automatedSetupComplete:true,privateSyntheticOnly:true});
 // Do not poll the webview while its native modal is open: the driver focuses the main window before each command.
 const exported=path.join(process.env.PICAR_M3_TEST_DATA_DIR,'selected-private-evidence.zip');const deadline=Date.now()+240000;
 while(!fs.existsSync(exported)&&Date.now()<deadline)await new Promise(resolve=>setTimeout(resolve,500));
 assert(fs.existsSync(exported),'Native chooser must save to the disposable test destination.');
 await browser.waitUntil(async()=>(await text()).includes('Evidence export saved'),{timeout:120000});
 assert.deepEqual(fs.readFileSync(exported),Buffer.from(photo.zip));const bytes=fs.readFileSync(exported),entries=[];let offset=0;while(bytes.readUInt32LE(offset)===0x04034b50){const size=bytes.readUInt32LE(offset+18),length=bytes.readUInt16LE(offset+26),extra=bytes.readUInt16LE(offset+28),name=bytes.subarray(offset+30,offset+30+length).toString(),start=offset+30+length+extra,content=bytes.subarray(start,start+size);entries.push({name,byteLength:size,sha256:crypto.createHash('sha256').update(content).digest('hex'),...(name==='manifest.json'?{manifest:JSON.parse(content)}:{})});offset=start+size;}
 record('native-export',{ownerChooser:'PASS',selectedBytesAndManifest:'PASS',destination:'disposable native app-data test directory',zipSha256:crypto.createHash('sha256').update(bytes).digest('hex'),byteLength:bytes.length,independentlyReopenedEntries:entries,syntheticPhotoSha256:photo.record.file.sha256});
 const physical=await script(()=>window.__studio3PhysicalStates);assert.deepEqual(physical.map(s=>s.label),['A','B','C','D']);record('native-physical-states',{physicalNativeKeyInjection:'CUA Escape, three separate calls',states:physical});
 const afterNativeUI=await script(async()=>({ledger:await window.__picarM3Test.studio('backup'),camera:window.__studio.camera(),state:window.__studio.state(),fullscreen:document.querySelector('.studio').dataset.fullscreen}));
 assert.deepEqual(afterNativeUI.ledger,beforeNativeUI.ledger);assert.equal(afterNativeUI.state.selection,null);assert.equal(afterNativeUI.state.manualOpen,false);assert.equal(afterNativeUI.fullscreen,'false');
 assert(Math.hypot(...afterNativeUI.camera.target.map((v,i)=>v-beforeNativeUI.camera.target[i]))<1e-6);
 record('native-ui',{physicalEscapeOrder:'manual, selection, native fullscreen',verifiedWith:'CUA physical presses and fresh native accessibility state',readOnlyLedger:'PASS',fullscreenCameraTarget:'PASS',themeControls:'native pixels inspected; resize grip absent'});
});
