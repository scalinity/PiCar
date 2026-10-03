// Included only by the dedicated test configuration; official WDIO script API drives it.
import '@wdio/tauri-plugin';
import {invoke} from '@tauri-apps/api/core';
import {acceptedContext,contexts} from '../../src/features/assembly-session/accepted';
import {nativeRepository} from '../../src/platform/tauri/repository';
import {runAdapterContract} from '../session/adapter-contract';
import {browserControls} from '../session/browser-controls';
import {canonical} from '../../src/features/assembly-session/hash';
import fixtures from './fixtures.json';
async function ready(){for(const v of ['rpi4','rpi5','rpi-zero-2-w'])await acceptedContext(v);}
const api={
 async studio(action:string){
  const store=await import('../../src/features/assembly-session/store');
  if(action==='backup')return store.exportData();
  if(action==='restart'){await invoke('m3_test_fault',{fault:'restart'});return true;}
  const pack=await (await import('../../src/features/assembly-3d/assets/pack')).loadPack();
  if(action==='photo'){
   const data=Uint8Array.from(atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aJU0AAAAASUVORK5CYII='),c=>c.charCodeAt(0));
   await (await import('../../src/features/assembly-3d/build-along')).attachStudioPhoto(pack,'rpi5',1,new File([data],'synthetic.png',{type:'image/png'}));return true;
  }
  if(action==='photoCheck'){
   const b=await store.exportData();const s=b.aggregates.find(a=>a.aggregate.id==='PX-STUDIO-RPI5')!;
   const record=s.events.flatMap(e=>e.action.kind==='observation'?[e.action.record]:[])[0];
   const bytes=await (await import('../../src/platform/evidence')).readPhoto(record);
   const zip=(await import('../../src/features/assembly-session/evidence-zip')).evidenceZip([{record,bytes}]);return {record,bytes:Array.from(bytes),zip:Array.from(zip)};
  }
  throw Error('STUDIO_TEST_ACTION');
 },
 async isolation(){return {legacy:localStorage.getItem('picarx.v1'),imports:(await invoke<unknown[]>('list_progress_imports')).length};},
 fresh:()=>invoke('m3_test_fresh'),
 async run(){await ready();return runAdapterContract({fresh:async()=>{await invoke('m3_test_fresh');return nativeRepository(contexts);},restart:async()=>{await invoke('m3_test_fault',{fault:'restart'});return nativeRepository(contexts);},fault:async(_r,fault)=>{await invoke('m3_test_fault',{fault});}});},
 async transfer(){await ready();const control=browserControls();try{
  const browser=await control.fresh();await browser.restore(fixtures.sessionBackup as unknown as import('../../src/platform/repository').Backup);const fromBrowser=await browser.backup();await invoke('m3_test_fresh');const native=nativeRepository(contexts);await native.restore(fromBrowser);const fromNative=await native.backup();if(canonical(fromNative)!==canonical(fromBrowser))throw Error('TRANSFER_MISMATCH');
  const returned=await control.fresh();await returned.restore(fromNative);if(canonical(await returned.backup())!==canonical(fromNative))throw Error('RETURN_TRANSFER_MISMATCH');
  // A normal startup aggregate exists: recovery must use a separate destination.
  await nativeRepository(contexts,true).restore(fromBrowser);if(canonical(await native.backup())!==canonical(fromBrowser))throw Error('RECOVERY_MISMATCH');
  const actualBrowser=await runAdapterContract(control);return {browserToDesktop:'PASS',desktopToBrowser:'PASS',separateNativeRecovery:'PASS',actualWebviewIndexedDB:actualBrowser};
 }finally{control.cleanup();}}
};
declare global {interface Window {__picarM3Test:typeof api;}}
window.__picarM3Test=api;
