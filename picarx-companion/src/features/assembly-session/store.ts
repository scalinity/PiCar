import { useSyncExternalStore } from 'react';
import { isTauri } from '@tauri-apps/api/core';
import type { Repository, Aggregate, Command, Setup, Action, Backup } from '../../platform/repository';
import type { AssemblySession } from '../../generated/twin/contracts';
import type { Context } from './commands';
import { emptySetup, prepareCommand, newSession, completed } from './commands';
import { captureLegacy, validateSetup } from './legacy';
import { acceptedContext, contexts } from './accepted';
import { canonical, parse } from './hash';
export type StoreState = { initialized: boolean; storageReady:boolean; setup: Setup; sessions: Aggregate[]; selected: Aggregate | null; pending: boolean; retryAvailable:boolean; error: string; recovery: string; legacyRaw: string | null };
let state: StoreState = {initialized:false,storageReady:false,setup:emptySetup(),sessions:[],selected:null,pending:false,retryAvailable:false,error:'',recovery:'',legacyRaw:null};
let repository: Repository | null = null, setupAggregate: Aggregate | null = null, initialization: Promise<void> | undefined;
const subs=new Set<()=>void>();
const publish = (patch: Partial<StoreState>): void => { state={...state,...patch};subs.forEach(f=>f()); };
export const getStore = (): StoreState => state;
export const useCompanion = (): StoreState => useSyncExternalStore(cb=>(subs.add(cb),()=>subs.delete(cb)),getStore);
export const newId = (kind: string): string => `PX-${kind}-${crypto.randomUUID().toUpperCase()}`;
let retryCommand: Command | null = null;
async function commit(c: Command): Promise<void> {
 if(!repository)throw Error('STORAGE_UNAVAILABLE');
 if(state.pending)throw Error('SAVE_PENDING');
 retryCommand=c;publish({pending:true,retryAvailable:true,error:''});
 try {
  const acknowledgment=await repository.commit(c);
  if(acknowledgment.aggregateId!==c.aggregateId || (c.payload.kind!=='legacy'&&(acknowledgment.commandId!==c.commandId || acknowledgment.snapshotHash!==c.nextHash || acknowledgment.acknowledgedRevision!==c.expectedRevision+1)))throw Error('INVALID_ACKNOWLEDGMENT');
  const stored=await repository.load(c.aggregateId);if(!stored)throw Error('COMMITTED_LOAD_MISSING');
  if(c.aggregateId==='PX-SETUP'){setupAggregate=stored.aggregate;publish({setup:stored.aggregate.snapshot as Setup});}
  else { const sessions=await repository.list();publish({sessions:sessions.filter(s=>s.graphHash!==null),selected:stored.aggregate}); }
  retryCommand=null;publish({retryAvailable:false});
 } catch(e) {const message=e instanceof Error?e.message:String(e);if(message.includes('CONFLICT')){
  retryCommand=null;publish({retryAvailable:false});
  try{const current=await repository.load(c.aggregateId);if(current){if(c.aggregateId==='PX-SETUP'){setupAggregate=current.aggregate;publish({setup:current.aggregate.snapshot as Setup});}else publish({selected:current.aggregate,sessions:(await repository.list()).filter(s=>s.graphHash!==null)});}if(c.payload.kind==='reconcile'){const source=await repository.load(c.payload.sessionId);if(source)publish({selected:source.aggregate});}publish({error:'CONFLICT: current saved progress was reloaded. Review it and submit a new action.'});}
  catch(reload){publish({storageReady:false,error:'CONFLICT: authoritative progress could not be validated: '+String(reload),recovery:'Read-only recovery. Export retained data before further work.'});}
 }else publish({error:message});throw e; }

 finally {publish({pending:false});}
}
export async function retrySave(): Promise<void> { if(retryCommand) await commit(retryCommand); }
export async function initializePersistence(): Promise<void> {
 if(initialization)return initialization;
 initialization=(async()=>{
  try {
   // Listing durable sessions validates their complete history, so pin the admitted contexts first.
   await Promise.all(['rpi4','rpi5','rpi-zero-2-w'].map(acceptedContext));
   repository=isTauri()?(await import('../../platform/tauri/repository')).nativeRepository(contexts):await (await import('../../platform/browser/indexed-db')).openBrowserRepository(localStorage.getItem('picarx.sessions.recovery')??'picarx.sessions',contexts);
   const old=await repository.load('PX-SETUP');setupAggregate=old?.aggregate??null;
   if(old)publish({setup:old.aggregate.snapshot as Setup});
   const raw=localStorage.getItem('picarx.v1');publish({legacyRaw:raw});
   if(raw!==null){
    const captured=captureLegacy(raw,location.origin);const imports=await repository.imports();
    const previous=imports.filter(r=>r.sourceOrigin===captured.record.sourceOrigin&&r.sourceKey===captured.record.sourceKey);
    if(previous.length && !previous.some(r=>r.rawHash===captured.record.rawHash)) publish({recovery:'LEGACY_DIVERGENCE: the preserved old key changed. Keep the new state or import it into a separate recovery aggregate.'});
    else if(!previous.length && !setupAggregate) {
     if(captured.record.status==='quarantined')publish({recovery:`Legacy recovery: ${captured.record.reason}. The original key is retained for export.`});
     if(captured.record.reason==='LEGACY_OVERSIZED')await repository.quarantine(captured.record);else await commit(prepareCommand(null,{kind:'legacy',...captured,choice:'initial'},newId('MIGRATION')));
    }
   }
   publish({initialized:true,storageReady:true,sessions:(await repository.list()).filter(s=>s.graphHash!==null)});
  }catch(e){publish({initialized:true,storageReady:false,error:e instanceof Error?e.message:String(e),recovery:'Storage could not initialize. Reference pages remain available; original progress can be exported.'});}
 })();return initialization;
}
export async function resolveLegacy(choice:'keepNew'|'recovery'):Promise<void>{
 if(state.legacyRaw===null)throw Error('LEGACY_MISSING');const captured=captureLegacy(state.legacyRaw,location.origin);captured.record.status=choice==='keepNew'?'divergent':'recovery';
 if(choice==='recovery'&&!captured.setup)throw Error('LEGACY_INVALID');
 await commit(prepareCommand(choice==='keepNew'?setupAggregate:null,{kind:'legacy',...captured,choice},newId('MIGRATION')));publish({recovery:''});
}
export async function updateSetup(change:(old:Setup)=>Setup):Promise<void>{
 if(!state.storageReady||!repository)throw Error('STORAGE_UNAVAILABLE');
 if(retryCommand)throw Error('RETRY_PENDING');const setup=change(state.setup);validateSetup(setup);
 await commit(prepareCommand(setupAggregate,{kind:'setup',setup},newId('SETUP')));
}
export async function createSession(variant:string,forkOf:string|null=null):Promise<AssemblySession>{
 if(!state.storageReady)throw Error('READ_ONLY_RECOVERY');const ctx=await acceptedContext(variant);const session=newSession(newId('SESSION'),ctx);
 if(forkOf && !state.sessions.some(s=>s.id===forkOf))throw Error('UNKNOWN_FORK_SOURCE');
 await commit(prepareCommand(null,{kind:'create',session,forkOf},newId('CREATE'),ctx));return state.selected!.snapshot as AssemblySession;
}
let loadingId='',loading:Promise<void>|null=null;
export function loadSession(id:string):Promise<void>{
 if(state.selected?.id===id)return Promise.resolve();if(loadingId===id&&loading)return loading;
 loadingId=id;publish({selected:null,error:''});
 loading=(async()=>{try{
  await initializePersistence();if(!repository||!state.storageReady)throw Error(state.error||'STORAGE_UNAVAILABLE');
  const row=state.sessions.find(s=>s.id===id);if(!row || !('variantId' in row.snapshot))throw Error('UNKNOWN_SESSION');
  await acceptedContext(row.snapshot.variantId);const stored=await repository!.load(id);if(loadingId===id)publish({selected:stored?.aggregate??null});
 }catch(e){if(loadingId===id)publish({error:e instanceof Error?e.message:String(e)});}})();return loading;
}
export async function sessionAction(action:Action,ctx:Context):Promise<void>{
 if(!state.selected || state.selected.graphHash!==ctx.graph.graphHash)throw Error('UNKNOWN_SESSION');
 if(retryCommand)throw Error('RETRY_PENDING');await commit(prepareCommand(state.selected,action,newId('COMMAND'),ctx));
}
export async function reconcileAssembly():Promise<void>{
 if(!state.selected || completed(state.selected.snapshot as AssemblySession).length!==29)throw Error('ALL_CONFIRMATIONS_REQUIRED');
 await commit(prepareCommand(setupAggregate,{kind:'reconcile',sessionId:state.selected.id,sessionRevision:state.selected.revision,graphHash:state.selected.graphHash!},newId('RECONCILE')));
}
export async function exportData():Promise<Backup>{if(!repository)throw Error('STORAGE_UNAVAILABLE');return repository.backup();}
export async function importData(raw:string):Promise<void>{
 if(state.pending||retryCommand)throw Error('RETRY_PENDING');
 const b=parse(raw) as Backup;
 // Adapter validates a closed data-only envelope and restores into an empty recovery destination.
 for(const stored of b.aggregates??[])if(stored.aggregate?.graphHash && 'variantId' in stored.aggregate.snapshot)await acceptedContext(stored.aggregate.snapshot.variantId);
 if(isTauri())await (await import('../../platform/tauri/repository')).nativeRepository(contexts,true).restore(b);else{const name='picarx.sessions.recovery-'+crypto.randomUUID();const recovered=await (await import('../../platform/browser/indexed-db')).openBrowserRepository(name,contexts);try{await recovered.restore(b);localStorage.setItem('picarx.sessions.recovery',name);repository!.close();repository=recovered;}catch(e){recovered.close();throw e;}}setupAggregate=(await repository!.load('PX-SETUP'))?.aggregate??null;publish({setup:setupAggregate?.snapshot as Setup??emptySetup(),selected:null,storageReady:true,sessions:(await repository!.list()).filter(s=>s.graphHash!==null)});
}
export function download(name:string,raw:string):void{const url=URL.createObjectURL(new Blob([raw],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=name;a.click();URL.revokeObjectURL(url);}
export function exportOriginal():void{if(state.legacyRaw!==null)download('picarx-original-progress.json',state.legacyRaw);}
export function saveError(e:unknown):void{publish({error:e instanceof Error?e.message:String(e)});}
export const serializeExport=(b:Backup):string=>canonical(b);
