import {test,expect} from '@playwright/test';
test('a genuinely blocked IndexedDB upgrade aborts without resetting committed data',async({page})=>{
 await page.goto('/#/reference');const result=await page.evaluate(async()=>{
  const {openBrowserRepository}=await import(String('/src/platform/browser/indexed-db.ts')) as typeof import('../../src/platform/browser/indexed-db');
  const name='TEST-BLOCKED-'+crypto.randomUUID();const open=indexedDB.open.bind(indexedDB);
  const held=await new Promise<IDBDatabase>((resolve,reject)=>{const q=open(name,1);q.onupgradeneeded=()=>q.result.createObjectStore('sentinel');q.onsuccess=()=>resolve(q.result);q.onerror=()=>reject(q.error);});
  held.onversionchange=()=>{};await new Promise<void>(resolve=>{const t=held.transaction('sentinel','readwrite');t.objectStore('sentinel').put('retained','raw');t.oncomplete=()=>resolve();});
  let intercepted=false;indexedDB.open=function(n,version){if(n===name&&!intercepted){intercepted=true;return open(n,2);}return version===undefined?open(n):open(n,version);};
  let blocked=false;try{await openBrowserRepository(name);}catch(e){blocked=String(e).includes('INDEXEDDB_UPGRADE_BLOCKED');}finally{indexedDB.open=open;held.close();}
  const reopened=await new Promise<IDBDatabase>((resolve,reject)=>{const q=open(name);q.onsuccess=()=>resolve(q.result);q.onerror=()=>reject(q.error);});const version=reopened.version;const raw=await new Promise(resolve=>{const q=reopened.transaction('sentinel').objectStore('sentinel').get('raw');q.onsuccess=()=>resolve(q.result);});reopened.close();indexedDB.deleteDatabase(name);return {blocked,version,raw};
 });expect(result).toEqual({blocked:true,version:1,raw:'retained'});
});
test('explicit recovery import preserves a nonempty startup store and resumes separately',async({page})=>{
 await page.goto('/#/assembly');await expect(page.getByText('Local progress ready',{exact:true})).toBeVisible();
 const result=await page.evaluate(async()=>{
  const {updateSetup,importData,exportData,getStore}=await import(String('/src/features/assembly-session/store.ts')) as typeof import('../../src/features/assembly-session/store');
  const {openBrowserRepository}=await import(String('/src/platform/browser/indexed-db.ts')) as typeof import('../../src/platform/browser/indexed-db');
  const {contexts}=await import(String('/src/features/assembly-session/accepted.ts')) as typeof import('../../src/features/assembly-session/accepted');
  const {default:f}=await import(String('/tests/native/fixtures.json')) as {default:typeof import('../native/fixtures.json')};
  const {canonical}=await import(String('/src/features/assembly-session/hash.ts')) as typeof import('../../src/features/assembly-session/hash');
  await updateSetup(s=>({...s,pdfLastPage:1,steps:{parts:'done'}}));const original=await exportData();
  await importData(canonical(f.setupBackup as unknown as import('../../src/platform/repository').Backup));const first=localStorage.getItem('picarx.sessions.recovery');const recovered=await exportData();
  await importData(canonical(recovered));const second=localStorage.getItem('picarx.sessions.recovery');
  const retained=await openBrowserRepository('picarx.sessions',contexts);const unchanged=canonical(await retained.backup())===canonical(original);retained.close();
  return {unchanged,separate:first!==second,pdf:getStore().setup.pdfLastPage};
 });expect(result).toEqual({unchanged:true,separate:true,pdf:2});await page.reload();await expect(page.getByText('Local progress ready',{exact:true})).toBeVisible();expect(await page.evaluate(async()=>{const {getStore}=await import(String('/src/features/assembly-session/store.ts')) as typeof import('../../src/features/assembly-session/store');return getStore().setup.pdfLastPage;})).toBe(2);
});
