import fs from 'node:fs';
import {test,expect} from '@playwright/test';
test('real browser IndexedDB executes common native/browser fault contract',async({page,browserName,browser})=>{
 test.setTimeout(600000);await page.goto('/#/reference');
 const results=await page.evaluate(async()=>{
  const {runAdapterContract}=await import(String('/tests/session/adapter-contract.ts')) as typeof import('../session/adapter-contract');
  const {openBrowserRepository}=await import(String('/src/platform/browser/indexed-db.ts')) as typeof import('../../src/platform/browser/indexed-db');
  const {acceptedContext,contexts}=await import(String('/src/features/assembly-session/accepted.ts')) as typeof import('../../src/features/assembly-session/accepted');
  for(const variant of ['rpi4','rpi5','rpi-zero-2-w'])await acceptedContext(variant);
  const {browserControls}=await import(String('/tests/session/browser-controls.ts')) as typeof import('../session/browser-controls');const control=browserControls();try{return await runAdapterContract(control);}finally{control.cleanup();}
 });
 for(const[name,status]of Object.entries(results))expect(status,name).toBe('PASS');
 fs.writeFileSync((process.env.PICAR_BROWSER_EVIDENCE_DIR??'../docs/implementation/evidence/m3')+'/browser-parity-'+browserName+'.json',JSON.stringify({adapter:'IndexedDB',browserName,version:browser.version(),results},null,2)+'\n');
 await test.info().attach('adapter-contract',{body:JSON.stringify({adapter:'IndexedDB',browserName,version:browser.version(),results},null,2),contentType:'application/json'});
});
