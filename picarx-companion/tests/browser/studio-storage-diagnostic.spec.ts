import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
test('diagnose disposable private storage capabilities',async({page,playwright,browserName})=>{
 async function check(p: typeof page){await p.goto('/#/reference');return p.evaluate(async()=>{const results:Record<string,unknown>={secure:isSecureContext,getDirectory:typeof navigator.storage.getDirectory,locks:typeof navigator.locks};try{const dir=await navigator.storage.getDirectory();results.directory='PASS';const file=await dir.getFileHandle('diagnostic',{create:true});results.file='PASS';const writer=await file.createWritable();results.writer='PASS';await writer.write(new Uint8Array([1,2,3]));await writer.close();results.write='PASS';await dir.removeEntry('diagnostic');}catch(e){results.error=String(e);}return results;});}
 console.log(browserName,'ephemeral',await check(page));const folder=fs.mkdtempSync(path.join(os.tmpdir(),'picar-studio-browser-'));const c=await playwright[browserName].launchPersistentContext(folder,{headless:true});try{const result=await check(await c.newPage());console.log(browserName,'persistent',result);expect(result.write).toBe('PASS');}finally{await c.close();fs.rmSync(folder,{recursive:true,force:true});}
});
