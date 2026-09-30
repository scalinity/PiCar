import {openBrowserRepository} from '../../src/platform/browser/indexed-db';
import {contexts} from '../../src/features/assembly-session/accepted';
import type {Repository} from '../../src/platform/repository';
import type {Controls} from './adapter-contract';
export function browserControls():Controls&{cleanup:()=>void}{
 const names=new Map<Repository,string>(),all:string[]=[];let restore=()=>{};
 const open=async(name:string)=>{const r=await openBrowserRepository(name,contexts);names.set(r,name);return r;};
 return {
  fresh:async()=>{const name='TEST-M3-'+crypto.randomUUID();all.push(name);return open(name);},
  restart:async r=>{const name=names.get(r)!;r.close();return open(name);},
  async fault(r,fault){restore();if(fault==='rollback'||fault==='quota'){const add=IDBObjectStore.prototype.add;IDBObjectStore.prototype.add=function(...args){if(this.name==='events')throw new DOMException('TEST_'+fault,fault==='quota'?'QuotaExceededError':'AbortError');return add.apply(this,args);};restore=()=>{IDBObjectStore.prototype.add=add;restore=()=>{};};return;}if(fault==='clear')return;
   const name=names.get(r)!;if(fault==='newer')r.close();await new Promise<void>((resolve,reject)=>{const q=indexedDB.open(name,fault==='newer'?2:undefined);q.onerror=()=>reject(q.error);q.onsuccess=()=>{const db=q.result;if(fault==='newer'){db.close();resolve();return;}const t=db.transaction(['events','snapshots'],'readwrite');if(fault==='missingEvent')t.objectStore('events').clear();else if(fault==='snapshot')t.objectStore('snapshots').put({id:'PX-SETUP',revision:1,snapshot:{}});t.oncomplete=()=>{db.close();resolve();};t.onabort=()=>reject(t.error);};});
  },
  cleanup(){restore();for(const r of names.keys())r.close();for(const name of all)indexedDB.deleteDatabase(name);}
 };
}
