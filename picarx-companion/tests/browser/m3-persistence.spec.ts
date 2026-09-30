import { test, expect } from '@playwright/test';
test.beforeEach(async({page})=>{await page.route('**/*',r=>new URL(r.request().url()).hostname==='localhost'?r.continue():r.abort());});
test('real IndexedDB fault matrix with isolated databases',async({page})=>{
 await page.goto('/#/reference');
 const outcomes=await page.evaluate(async()=>{
  const {openBrowserRepository}=await import(/* @vite-ignore */ String('/src/platform/browser/indexed-db.ts')) as typeof import('../../src/platform/browser/indexed-db');
  const {prepareCommand,emptySetup}=await import(/* @vite-ignore */ String('/src/features/assembly-session/commands.ts')) as typeof import('../../src/features/assembly-session/commands');
  const {hash}=await import(/* @vite-ignore */ String('/src/features/assembly-session/hash.ts')) as typeof import('../../src/features/assembly-session/hash');
  const {captureLegacy}=await import(/* @vite-ignore */ String('/src/features/assembly-session/legacy.ts')) as typeof import('../../src/features/assembly-session/legacy');
  const results:Record<string,boolean>={};let n=0;
  const name='test-m3-'+crypto.randomUUID();const repo=await openBrowserRepository(name);
  const create=prepareCommand(null,{kind:'setup',setup:emptySetup()},`TEST-COMMAND-${++n}`);
  const ack=await repo.commit(create);const retry=await repo.commit(create);results.lostAck=JSON.stringify(ack)===JSON.stringify(retry);
  const changed=prepareCommand(null,{kind:'setup',setup:{...emptySetup(),pdfLastPage:2}},create.commandId);
  try{await repo.commit(changed);}catch(e){results.idReuse=String(e).includes('COMMAND_ID_REUSE');}
  const old=(await repo.load('PX-SETUP'))!.aggregate;
  const c1=prepareCommand(old,{kind:'setup',setup:{...emptySetup(),pdfLastPage:2}},`TEST-COMMAND-${++n}`);
  const c2=prepareCommand(old,{kind:'setup',setup:{...emptySetup(),pdfLastPage:3}},`TEST-COMMAND-${++n}`);
  const concurrent=await Promise.allSettled([repo.commit(c1),repo.commit(c2)]);results.concurrent=concurrent.filter(r=>r.status==='fulfilled').length===1&&concurrent.some(r=>r.status==='rejected'&&String(r.reason).includes('CONFLICT'));
  const before=(await repo.load('PX-SETUP'))!.aggregate;const add=IDBObjectStore.prototype.add;
  IDBObjectStore.prototype.add=function(...args){if(this.name==='events')throw new DOMException('synthetic quota fault','QuotaExceededError');return add.apply(this,args);};
  try{await repo.commit(prepareCommand(before,{kind:'setup',setup:{...emptySetup(),pdfLastPage:4}},`TEST-COMMAND-${++n}`));}catch(e){results.quota=String(e).includes('quota');}finally{IDBObjectStore.prototype.add=add;}
  results.quotaAtomic=JSON.stringify((await repo.load('PX-SETUP'))!.aggregate)===JSON.stringify(before);
  const backup=await repo.backup();const restore=await openBrowserRepository(name+'-recovery');await restore.restore(backup);results.restore=JSON.stringify((await restore.load('PX-SETUP'))!.aggregate)===JSON.stringify(before);
  const illegal={...backup,path:'../digital-twin/assemblies/v40'};const {checksum:_,...body}=illegal;illegal.checksum=hash('backup',body);
  try{await restore.restore(illegal);}catch(e){results.canonicalPath=String(e).includes('INVALID_SCHEMA')||String(e).includes('INVALID_IMPORT')||String(e).includes('RECOVERY_DESTINATION_NOT_EMPTY');}
  const broken=structuredClone(backup);broken.aggregates[0].events.shift();const {checksum:__,...bbody}=broken;broken.checksum=hash('backup',bbody);
  const corrupt=await openBrowserRepository(name+'-corrupt');try{await corrupt.restore(broken);}catch(e){results.missingEvent=String(e).includes('EVENT_SEQUENCE');}
  const raw='{"steps":{"assembly":"done"},"checks":{"power.safe":true},"pdfLastPage":2}';const captured=captureLegacy(raw,'test-origin');
  const legacy=await openBrowserRepository(name+'-legacy');const migration=prepareCommand(null,{kind:'legacy',...captured,choice:'initial'},'TEST-MIGRATION');
  await legacy.commit(migration);await legacy.commit(migration);const imported=await legacy.imports();results.migrationOnce=imported.length===1&&imported[0].raw===raw;results.zeroLegacyConfirmations=!('confirmationRecords' in (await legacy.load('PX-SETUP'))!.aggregate.snapshot);
  const malformed=captureLegacy('{bad','test-other');const quarantine=await openBrowserRepository(name+'-quarantine');await quarantine.commit(prepareCommand(null,{kind:'legacy',...malformed,choice:'initial'},'TEST-MALFORMED'));results.malformed=(await quarantine.imports())[0].raw==='{bad';
  for(const r of [repo,restore,corrupt,legacy,quarantine])r.close();for(const suffix of ['', '-recovery','-corrupt','-legacy','-quarantine'])indexedDB.deleteDatabase(name+suffix);
  return results;
 });
 for(const [name,passed]of Object.entries(outcomes))expect(passed,name).toBe(true);
});
test('reference-only journey creates empty session and URL review never confirms',async({page})=>{
 await page.goto('/#/assembly');await page.getByRole('button',{name:'Start new session',exact:true}).click();
 await expect(page).toHaveURL(/#\/assembly\/PX-SESSION-[A-Z0-9-]+\/step\/1$/);
 await expect(page.getByText('0/29 self-confirmed',{exact:false}).first()).toBeVisible();
 const url=page.url();const session=url.match(/PX-SESSION-[A-Z0-9-]+/)![0];
 for(const number of [1,10,17,18,19,22,29]){await page.goto(`/#/assembly/${session}/step/${number}`);await expect(page.locator('main h1')).toContainText(`${number}.`);await expect(page.getByText('0/29 self-confirmed',{exact:false}).first()).toBeVisible();}
 await page.getByRole('button',{name:'Preview after',exact:true}).click();await expect(page.getByRole('status').filter({hasText:'After instruction projection'})).toBeVisible();
 await page.getByRole('link',{name:'Reference',exact:true}).last().click();await page.getByRole('link',{name:'Return to assembly bookmark',exact:true}).click();await expect(page).toHaveURL(/step\/29$/);
 await page.reload();await expect(page.getByText('0/29 self-confirmed',{exact:false}).first()).toBeVisible();
});
