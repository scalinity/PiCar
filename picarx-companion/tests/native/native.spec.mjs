import assert from 'node:assert/strict';
import fs from 'node:fs';
before(async()=>{const state=await browser.execute(()=>({url:location.href,title:document.title,tauri:typeof window.__TAURI__,helper:typeof window.__picarM3Test,h1:document.querySelector('h1')?.textContent}));fs.writeFileSync('../docs/implementation/evidence/m3/native-window-'+(process.env.PICAR_M3_NATIVE_OFFLINE==='1'?'offline':'dev')+'.json',JSON.stringify(state,null,2)+'\n');});
it('native IPC and actual SQLite execute the shared adapter contract',async()=>{
 await browser.waitUntil(async()=>await browser.tauri.execute(()=>typeof window.wdioTauri==='object'),{timeout:30000});
 const isolation=await browser.tauri.execute(()=>window.__picarM3Test.isolation());assert.deepEqual(isolation,{legacy:null,imports:0});
 const result=await browser.tauri.execute(()=>window.__picarM3Test.run());
 assert(Object.values(result).every(v=>v==='PASS'));fs.writeFileSync('../docs/implementation/evidence/m3/native-parity.json',JSON.stringify({adapter:'native SQLite IPC',results:result},null,2)+'\n');
});
it('reference-first native window navigates, previews and resumes without confirmation',async()=>{
 await browser.tauri.execute(()=>window.__picarM3Test.fresh());
 const base=(await browser.getUrl()).split('#')[0];await browser.url(base+'#/assembly');await browser.refresh();
 await $('button=Start new session').waitForClickable({timeout:30000});await $('button=Start new session').click();
 await browser.waitUntil(async()=>/step\/1$/.test(await browser.getUrl()),{timeout:30000});const original=await browser.getUrl();
 await browser.url(original.replace(/step\/1$/,'step/29'));await $('main h1').waitForDisplayed({timeout:30000});assert((await $('main h1').getText()).startsWith('29.'));
 await $('button=Preview after').click();assert((await $('main').getText()).includes('0/29 self-confirmed'));await browser.refresh();await $('main h1').waitForDisplayed({timeout:30000});assert((await $('main').getText()).includes('0/29 self-confirmed'));
});

it('actual browser and desktop exports transfer through separate recovery destinations',async()=>{const result=await browser.tauri.execute(()=>window.__picarM3Test.transfer());assert.equal(result.browserToDesktop,'PASS');assert.equal(result.desktopToBrowser,'PASS');assert.equal(result.separateNativeRecovery,'PASS');assert(Object.values(result.actualWebviewIndexedDB).every(v=>v==='PASS'));fs.writeFileSync('../docs/implementation/evidence/m3/native-browser-transfer.json',JSON.stringify(result,null,2)+'\n');});

if(process.env.PICAR_M3_NATIVE_OFFLINE==='1')it('embedded reference/PDF journey works without a development server or remote media',async()=>{assert(!String(await browser.getUrl()).startsWith('http://localhost:1420'));await $('summary*=Z0104V40 booklet').click();await browser.waitUntil(async()=>/of 2/.test(await $('.pdf-pageinfo').getText()),{timeout:30000});const resources=await browser.tauri.execute(()=>performance.getEntriesByType('resource').map(r=>r.name));assert(!resources.some(r=>r.startsWith('http://localhost:1420')||r.startsWith('https://')));fs.writeFileSync('../docs/implementation/evidence/m3/native-offline.json',JSON.stringify({url:await browser.getUrl(),sourcePdf:'PASS',remoteResources:0,geometryRequired:false},null,2)+'\n');});
