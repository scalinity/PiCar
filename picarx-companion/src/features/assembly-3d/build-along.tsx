// The sole Studio persistence adapter. Renderer, motion, selection, camera and inspection never call it.
import { useCallback, useState, useSyncExternalStore } from 'react';
import type { AssemblySession } from '../../generated/twin/contracts';
import { M3_ENABLED } from '../../lib/m3-enabled';
import { studioHref, type StudioVariant } from '../../lib/router';
import { acceptedContext, contexts } from '../assembly-session/accepted';
import { completed, condition, active } from '../assembly-session/commands';
import { createSession, initializePersistence, sessionHistory, loadSession, sessionAction, sessionActionBound, newId, getStore, useCompanion, retrySave } from '../assembly-session/store';
import { evidenceKey, observationRevision, photoType, poseHash, validateObservation, type StudioObservation } from '../assembly-session/observation';
import { evidenceZip } from '../assembly-session/evidence-zip';
import { copyPhoto, readPhoto, saveEvidenceZip } from '../../platform/evidence';
import type { LoadedPack } from './assets/pack';
export const boardSessionId = (v: StudioVariant): string => v === 'rpi5' ? 'PX-STUDIO-RPI5' : 'PX-STUDIO-ZERO2W';
export const studioBoardHref = (v:StudioVariant,step:number):string => studioHref(v,step);
type BoardState = { ready: boolean; session: AssemblySession | null; observations: StudioObservation[]; error: string; busy: boolean };
const empty = (): BoardState => ({ready:false,session:null,observations:[],error:'',busy:false});
const boards: Record<StudioVariant,BoardState> = {rpi5:empty(),'rpi-zero-2-w':empty()};
const listeners = new Set<()=>void>();
const publish = (v: StudioVariant, patch: Partial<BoardState>): void => {boards[v]={...boards[v],...patch};listeners.forEach(f=>f());};
const opening = new Map<StudioVariant,Promise<void>>();
export async function openBuildBoard(v: StudioVariant): Promise<void> {
 if(!M3_ENABLED)return;
 const pending=opening.get(v);if(pending)return pending;
 const promise=(async()=>{try{
  await initializePersistence();if(!getStore().storageReady)throw Error(getStore().error||'STORAGE_UNAVAILABLE');
  const stored=await sessionHistory(boardSessionId(v));
  const session=stored?.aggregate.snapshot as AssemblySession|null;
  if(session && session.variantId!==v)throw Error('STUDIO_SESSION_VARIANT');
  const observations=stored?.events.flatMap(e=>e.action.kind==='observation'?[e.action.record]:[])??[];
  publish(v,{ready:true,session,observations});
 }catch(e){publish(v,{ready:true,error:String(e)});}finally{opening.delete(v);}})();
 opening.set(v,promise);return promise;
}
export function useBuildBoard(v: StudioVariant): BoardState {
 const subscribe=useCallback((cb:()=>void)=>{listeners.add(cb);void openBuildBoard(v);return()=>{listeners.delete(cb);};},[v]);
 return useSyncExternalStore(subscribe,()=>boards[v]);
}
let writes: Promise<unknown> = Promise.resolve();
function write(v:StudioVariant,action:()=>Promise<unknown>):Promise<void>{
 const result=writes.then(async()=>{await opening.get(v);publish(v,{busy:true,error:''});try{await action();await openBuildBoard(v);}catch(e){if(String(e).includes('CONFLICT'))await openBuildBoard(v);publish(v,{error:e instanceof Error?e.message:String(e)});throw e;}finally{publish(v,{busy:false});}});
 writes=result.catch(()=>{});return result;
}
async function target(v:StudioVariant){
 await loadSession(boardSessionId(v));
 const s=getStore().selected?.snapshot as AssemblySession|undefined;
 if(!s||s.id!==boardSessionId(v)||s.variantId!==v)throw Error('UNKNOWN_BOARD_SESSION');
 return {session:s,ctx:await acceptedContext(v)};
}
export function bookmarkStudioStep(v:StudioVariant,n:number):void {
 if(n<1||n>9||!boards[v].session)return;
 void write(v,async()=>{const {session,ctx}=await target(v);const stepId=ctx.graph.steps[n-1].id;if(session.reviewStepId!==stepId)await sessionAction({kind:'bookmark',stepId},ctx);}).catch(()=>{});
}
export async function attachStudioPhoto(pack:LoadedPack,v:StudioVariant,n:number,file:File):Promise<void>{
 if(n<1||n>9)throw Error('PHOTO_STEP_REQUIRED');
 await write(v,async()=>{
  if(getStore().retryAvailable||getStore().pending)throw Error('RETRY_PENDING');
  const stored=await sessionHistory(boardSessionId(v));
  if(!stored)throw Error('UNKNOWN_BOARD_SESSION');
  const aggregate=structuredClone(stored.aggregate),session=aggregate.snapshot as AssemblySession;
  const ctx=await acceptedContext(v),step=structuredClone(pack.manifest.variants[v].steps[n-1]);
  if(session.id!==boardSessionId(v)||session.variantId!==v||aggregate.graphHash!==ctx.graph.graphHash)throw Error('STUDIO_SESSION_VARIANT');
  const id=newId('OBSERVATION');
  if(file.size>20*1024*1024)throw Error('PHOTO_SIZE');
  const contextInstances=[...new Set([...Object.keys(step.placements),...step.stepParts.map(p=>p.instanceId)])].sort();
  const record:StudioObservation={contract:'picar-studio-observation/1',id,sessionId:session.id,variantId:v,stepId:step.stepId,createdAt:new Date().toISOString(),file:{sha256:'0'.repeat(64),byteLength:file.size,mediaType:'image/png',storageKey:evidenceKey(session.id,id)},packId:pack.manifest.packId,contextInstances,
   geometry:contextInstances.flatMap(instanceId=>{const entry=pack.manifest.instances[instanceId],d=entry?pack.manifest.definitions[entry.definitionId]:null;return d?[{instanceId,definitionId:entry.definitionId,instructionalSha256:d.artifact.sha256,displayedSha256:d.display?.artifact.sha256??null}]:[];}),
   poseSha256:poseHash(step.placements),sourceSha256:step.source.sha256!,closureSha256:step.source.closureRfc8785Sha256??null};
  validateObservation(record,ctx);
  const bytes=new Uint8Array(await file.arrayBuffer());photoType(bytes);
  record.file=await copyPhoto(session.id,id,bytes);
  // Copy failures cannot create a record. After a persistence error retain the uniquely named copy: the acknowledgment
  // may have been lost. Retry uses M3's identical command ID, and this file is a recoverable orphan if no event committed.
  try{await sessionActionBound(aggregate,{kind:'observation',record},ctx);}
  catch(e){throw Error(`${e instanceof Error?e.message:String(e)}. The private photo copy is retained. Retry the pending save, or review changed progress before attaching again.`);}
 });
}
export function BuildAlong({pack,variant,step}:{pack:LoadedPack;variant:StudioVariant;step:number}){
 const board=useBuildBoard(variant),storage=useCompanion();
 const [statement,setStatement]=useState(''),[checked,setChecked]=useState<string[]>([]),[undoAccepted,setUndoAccepted]=useState(false),[selected,setSelected]=useState<string[]>([]),[exportStatus,setExportStatus]=useState('');
 const disabled=board.busy||storage.pending||storage.retryAvailable;
 const run=(action:()=>Promise<unknown>)=>{void write(variant,action).catch(()=>{});};
 if(!M3_ENABLED)return <section className="studio-build"><p>Build-along requires the accepted M3 persistence configuration.</p></section>;
 if(!board.ready)return <section className="studio-build" role="status">Opening saved build progress…</section>;
 const session=board.session;
 if(!session)return <section className="studio-build" aria-label="Build along"><h3>Your real car</h3><p>Start a private build session for this board.</p><button className="studio-link-button" disabled={!storage.storageReady||disabled} onClick={()=>run(()=>createSession(variant,null,boardSessionId(variant)))}>Start build session</button>{board.error&&<p role="alert">{board.error}</p>}{storage.retryAvailable&&<button disabled={storage.pending||board.busy} onClick={()=>run(()=>retrySave())}>Retry pending save</button>}</section>;
 const entry=step>0?pack.manifest.variants[variant].steps[step-1]:null;
 const done=completed(session),photos=entry?board.observations.filter(r=>r.stepId===entry.stepId):board.observations;
 const savedNumber=Number(session.reviewStepId.slice(-2));
 const availableSavedNumber=Math.min(savedNumber,9),savedAvailable=savedNumber>=1&&savedNumber<=29;
 return <section className="studio-build" aria-label="Build along" data-session={session.id} data-revision={session.revision}>
  <h3>Your real car</h3><p>{done.length}/29 physically completed by owner · {photos.length} photos</p>
  {step===0&&savedAvailable&&<a href={studioHref(variant,availableSavedNumber)}>Return to {savedNumber>9?'last available':'saved'} Step {availableSavedNumber}</a>}
  {entry&&<>
   <p role="status">{done.includes(entry.stepId)?'Physically completed by owner':'Not recorded as physically completed'}</p>
   <p className="studio-source-line">Your record does not clear M7, CAD or this step’s digital review.</p>
   {!done.includes(entry.stepId)&&<>
    {step>1&&!pack.manifest.variants[variant].steps.slice(0,step-1).every(s=>done.includes(s.stepId))&&<p>Record earlier physical steps before completing this one.</p>}
    {entry.stepId&&((awaitlessContext(session.graphHash)?.graph.steps[step-1].verificationRuleIds)??[]).map(id=><label className="studio-build-check" key={id}><input type="checkbox" checked={checked.includes(id)} disabled={disabled} onChange={e=>setChecked(old=>e.target.checked?[...old,id]:old.filter(i=>i!==id))}/>I checked the printed power-off requirement on my real car.</label>)}
    <label className="studio-build-check">My physical completion statement<textarea value={statement} disabled={disabled} onChange={e=>setStatement(e.target.value)}/></label>
    <button className="studio-link-button" disabled={disabled||!statement.trim()||!pack.manifest.variants[variant].steps.slice(0,step-1).every(s=>done.includes(s.stepId))||!(awaitlessContext(session.graphHash)?.graph.steps[step-1].verificationRuleIds??[]).every(id=>checked.includes(id))} onClick={()=>run(async()=>{
     const {ctx}=await target(variant),source=ctx.graph.steps[step-1];
     for(const op of ctx.graph.operations.filter(o=>source.operationIds.includes(o.id)&&['acknowledgeProcedure','confirmZeroing'].includes(o.kind))) {
      const current=getStore().selected!.snapshot as AssemblySession;
      if(![...current.procedureAcknowledgments,...current.zeroingAttestations].some(r=>r.operationId===op.id&&active(r)))await sessionAction({kind:'condition',record:condition(current,ctx,op.id,newId('CONDITION'),new Date().toISOString())},ctx);
     }
     await sessionAction({kind:'complete',stepId:source.id,statement,checkedRuleIds:source.verificationRuleIds,createdAt:new Date().toISOString()},ctx);
     setStatement('');setChecked([]);
    })}>Mark physically done</button>
   </>}
   {done.includes(entry.stepId)&&<><label className="studio-build-check"><input type="checkbox" checked={undoAccepted} disabled={disabled} onChange={e=>setUndoAccepted(e.target.checked)}/>Reopen this step and undo downstream physical confirmations.</label><button className="studio-link-button" disabled={disabled||!undoAccepted} onClick={()=>run(async()=>{const {ctx}=await target(variant);await sessionAction({kind:'invalidate',stepId:entry.stepId,servoInstanceId:null,reason:'undo',createdAt:new Date().toISOString()},ctx);setUndoAccepted(false);})}>Undo / reopen physical step</button></>}
   <label className="studio-build-check">Add private photo<input type="file" accept="image/png,image/jpeg,image/webp" disabled={disabled} onChange={e=>{const f=e.target.files?.[0];e.target.value='';if(f)void attachStudioPhoto(pack,variant,step,f).catch(()=>{});}}/></label>
  </>}
  {photos.length>0&&<details><summary>Private photo evidence · {photos.length}</summary>{photos.map(r=><label className="studio-build-check" key={r.id}><input type="checkbox" checked={selected.includes(r.id)} disabled={disabled} onChange={e=>setSelected(old=>e.target.checked?[...old,r.id]:old.filter(id=>id!==r.id))}/>{r.stepId.slice(-2)} · {r.createdAt} · {observationRevision(r,pack.manifest.packId)}<code title={r.file.sha256}>{r.file.sha256.slice(0,12)}</code></label>)}<p>This ZIP contains the selected private photos and their revision metadata.</p><button className="studio-link-button" disabled={disabled||!photos.some(r=>selected.includes(r.id))} onClick={()=>run(async()=>{const chosen=photos.filter(r=>selected.includes(r.id));const records=await Promise.all(chosen.map(async record=>({record,bytes:await readPhoto(record)})));const saved=await saveEvidenceZip(evidenceZip(records));setExportStatus(saved==='saved'?'Evidence export saved':saved==='download'?'ZIP download requested; choose its destination with your browser’s Save As/download controls.':'Export cancelled');})}>Export selected private evidence ZIP</button><p role="status">{exportStatus}</p></details>}
  {disabled&&<p role="status">Saving / waiting for committed acknowledgment…</p>}
  {board.error&&<p role="alert">{board.error}</p>}
  {storage.retryAvailable&&<button className="studio-link-button" disabled={storage.pending||board.busy} onClick={()=>run(()=>retrySave())}>Retry pending save</button>}
 </section>;
}
const awaitlessContext=(hash:string)=>contexts.get(hash);
