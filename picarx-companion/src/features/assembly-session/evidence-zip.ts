// ZIP store method, fixed DOS epoch, UTF-8 safe generated entry names; selected observations only.
import { canonical } from './hash';
import { verifyPhoto, validateObservation, type StudioObservation } from './observation';
const crc32 = (bytes: Uint8Array): number => {
 let crc = 0xffffffff;for (const b of bytes) {crc ^= b;for(let i=0;i<8;i++)crc=(crc>>>1)^(crc&1 ? 0xedb88320 : 0);}
 return (crc^0xffffffff)>>>0;
};
export function evidenceZip(records: { record: StudioObservation; bytes: Uint8Array }[]): Uint8Array {
 if (!records.length || new Set(records.map(r=>r.record.id)).size !== records.length) throw Error('EXPORT_SELECTION');
 const selected=[...records].sort((a,b)=>a.record.id.localeCompare(b.record.id));
 const entries=selected.map(({record,bytes})=>{validateObservation(record);verifyPhoto(record,bytes);return {name:`photos/${record.id}.${({'image/png':'png','image/jpeg':'jpg','image/webp':'webp'} as const)[record.file.mediaType]}`,bytes};});
 entries.push({name:'manifest.json',bytes:new TextEncoder().encode(canonical({contract:'picar-studio-evidence-export/1',privateEvidence:true,observations:selected.map(r=>r.record)}))});
 if(entries.length>65535 || entries.reduce((n,e)=>n+e.bytes.length+e.name.length*2+76,22)>100*1024*1024)throw Error('EXPORT_SIZE');
 const parts:Uint8Array[]=[], central:Uint8Array[]=[];let offset=0;
 for(const e of entries){
  const name=new TextEncoder().encode(e.name),crc=crc32(e.bytes),head=new Uint8Array(30+name.length),v=new DataView(head.buffer);
  v.setUint32(0,0x04034b50,true);v.setUint16(4,20,true);v.setUint16(6,0x800,true);v.setUint16(12,33,true);
  v.setUint32(14,crc,true);v.setUint32(18,e.bytes.length,true);v.setUint32(22,e.bytes.length,true);v.setUint16(26,name.length,true);head.set(name,30);
  parts.push(head,e.bytes);
  const c=new Uint8Array(46+name.length),d=new DataView(c.buffer);d.setUint32(0,0x02014b50,true);d.setUint16(4,20,true);d.setUint16(6,20,true);d.setUint16(8,0x800,true);d.setUint16(14,33,true);
  d.setUint32(16,crc,true);d.setUint32(20,e.bytes.length,true);d.setUint32(24,e.bytes.length,true);d.setUint16(28,name.length,true);d.setUint32(42,offset,true);c.set(name,46);central.push(c);offset+=head.length+e.bytes.length;
 }
 const size=central.reduce((n,c)=>n+c.length,0),end=new Uint8Array(22),v=new DataView(end.buffer);v.setUint32(0,0x06054b50,true);v.setUint16(8,entries.length,true);v.setUint16(10,entries.length,true);v.setUint32(12,size,true);v.setUint32(16,offset,true);
 const out=new Uint8Array(offset+size+22);let p=0;for(const b of [...parts,...central,end]){out.set(b,p);p+=b.length;}return out;
}
