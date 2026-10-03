// Private evidence bytes use native app data or the browser's origin-private file system. No repository path input.
import { isTauri, invoke } from '@tauri-apps/api/core';
import { evidenceKey, photoType, verifyPhoto, type StudioObservation } from '../features/assembly-session/observation';
import { bytesToHex } from '@noble/hashes/utils';
import { sha256 } from '@noble/hashes/sha256';
export const photoHash = (b: Uint8Array): string => bytesToHex(sha256(b));
async function directory(sessionId: string): Promise<FileSystemDirectoryHandle> {
 evidenceKey(sessionId,'PX-CHECK');
 let root:FileSystemDirectoryHandle;
 try{root=await navigator.storage.getDirectory();}catch(e){throw Error(`Private photo storage is unavailable in this browser context. Use a regular browser window or native Studio. ${String(e)}`);}
 const evidence = await root.getDirectoryHandle('evidence',{create:true});
 return evidence.getDirectoryHandle(sessionId,{create:true});
}
export async function copyPhoto(sessionId: string, observationId: string, bytes: Uint8Array): Promise<StudioObservation['file']> {
 const storageKey = evidenceKey(sessionId,observationId), mediaType = photoType(bytes);
 if (isTauri()) return invoke('studio_copy_photo',{sessionId,observationId,bytes:Array.from(bytes)});
 return navigator.locks.request(`picar:${storageKey}`, async () => {
  const dir = await directory(sessionId);
  try { await dir.getFileHandle(observationId); throw Error('EVIDENCE_EXISTS'); } catch(e) { if (!(e instanceof DOMException && e.name === 'NotFoundError')) throw e; }
  const handle = await dir.getFileHandle(observationId,{create:true});
  try {
   const writer = await handle.createWritable();
   try { await writer.write(bytes as Uint8Array<ArrayBuffer>); await writer.close(); } catch(e) { await writer.abort().catch(()=>{}); throw e; }
   const copied = new Uint8Array(await (await handle.getFile()).arrayBuffer());
   if (copied.length !== bytes.length || photoHash(copied) !== photoHash(bytes)) throw Error('EVIDENCE_COPY_HASH');
   return {storageKey,sha256:photoHash(copied),byteLength:copied.length,mediaType};
  } catch(e) { await dir.removeEntry(observationId).catch(()=>{}); throw e; }
 });
}
export async function readPhoto(record: StudioObservation): Promise<Uint8Array> {
 const bytes = isTauri() ? new Uint8Array(await invoke<number[]>('studio_read_photo',{sessionId:record.sessionId,observationId:record.id}))
  : new Uint8Array(await (await (await (await directory(record.sessionId)).getFileHandle(record.id)).getFile()).arrayBuffer());
 verifyPhoto(record,bytes); return bytes;
}
export async function saveEvidenceZip(bytes: Uint8Array): Promise<'saved'|'download'|'cancelled'> {
 if (isTauri()) return await invoke<boolean>('studio_export_evidence',{bytes:Array.from(bytes)})?'saved':'cancelled';
 const picker=(window as unknown as {showSaveFilePicker?:(options:unknown)=>Promise<FileSystemFileHandle>}).showSaveFilePicker;
 if(picker){
  try{const handle=await picker.call(window,{suggestedName:'PiCar-private-evidence.zip',types:[{description:'Private evidence ZIP',accept:{'application/zip':['.zip']}}]});
   const writer=await handle.createWritable();try{await writer.write(bytes as Uint8Array<ArrayBuffer>);await writer.close();}catch(e){await writer.abort().catch(()=>{});throw e;}return 'saved';
  }catch(e){if(e instanceof DOMException&&e.name==='AbortError')return 'cancelled';throw e;}
 }
 // WebKit exposes downloads rather than a filesystem destination picker. Its Save As/download UI owns the destination.
 const url=URL.createObjectURL(new Blob([bytes as Uint8Array<ArrayBuffer>],{type:'application/zip'}));
 const a=document.createElement('a');a.href=url;a.download='PiCar-private-evidence.zip';a.click();
 setTimeout(()=>URL.revokeObjectURL(url),30000);return 'download';
}
