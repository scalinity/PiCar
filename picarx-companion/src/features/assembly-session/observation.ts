// Owner-selected evidence is a historical statement of context, never image recognition or engineering acceptance.
import { rawHash, canonical } from './hash';
import type { Context } from './commands';
import { bytesToHex } from '@noble/hashes/utils';
import { sha256 } from '@noble/hashes/sha256';
export type StudioObservation = {
 contract: 'picar-studio-observation/1'; id: string; sessionId: string; variantId: 'rpi5' | 'rpi-zero-2-w'; stepId: string; createdAt: string;
 file: { sha256: string; byteLength: number; mediaType: 'image/png' | 'image/jpeg' | 'image/webp'; storageKey: string };
 packId: string; contextInstances: string[];
 geometry: { instanceId: string; definitionId: string; instructionalSha256: string; displayedSha256: string | null }[];
 poseSha256: string; sourceSha256: string; closureSha256: string | null;
};
const id = (s: unknown): s is string => typeof s === 'string' && /^(PX|TEST)-[A-Z0-9-]+$/.test(s) && s.length <= 256;
const sha = (s: unknown): s is string => typeof s === 'string' && /^[0-9a-f]{64}$/.test(s);
const closed = (v: unknown, keys: string[]): boolean => !!v && typeof v === 'object' && !Array.isArray(v) && Object.keys(v).sort().join(',') === keys.sort().join(',');
export function evidenceKey(sessionId: string, observationId: string): string {
 if (!id(sessionId) || !id(observationId)) throw Error('INVALID_EVIDENCE_ID');
 return `evidence/${sessionId}/${observationId}`;
}
export function validateObservation(r: StudioObservation, ctx?: Context): void {
 if (!closed(r, ['contract','id','sessionId','variantId','stepId','createdAt','file','packId','contextInstances','geometry','poseSha256','sourceSha256','closureSha256'])
  || r.contract !== 'picar-studio-observation/1' || !id(r.id) || !id(r.sessionId) || !['rpi5','rpi-zero-2-w'].includes(r.variantId)
  || !/^PX-V40-STEP-0[1-9]$/.test(r.stepId) || typeof r.createdAt !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/.test(r.createdAt) || !Number.isFinite(Date.parse(r.createdAt)) || new Date(r.createdAt).toISOString().slice(0,19)!==r.createdAt.slice(0,19)
  || !closed(r.file, ['sha256','byteLength','mediaType','storageKey']) || !sha(r.file.sha256) || !Number.isSafeInteger(r.file.byteLength)
  || r.file.byteLength < 1 || r.file.byteLength > 20 * 1024 * 1024 || !['image/png','image/jpeg','image/webp'].includes(r.file.mediaType)
  || r.file.storageKey !== evidenceKey(r.sessionId,r.id) || ![r.packId,r.poseSha256,r.sourceSha256].every(sha) || r.closureSha256 !== null && !sha(r.closureSha256)
  || !Array.isArray(r.contextInstances) || !r.contextInstances.length || r.contextInstances.length>156 || new Set(r.contextInstances).size !== r.contextInstances.length || !r.contextInstances.every(id)
  || !Array.isArray(r.geometry) || r.geometry.length>156 || new Set(r.geometry.map(g => g.instanceId)).size !== r.geometry.length
  || !r.geometry.every(g => closed(g,['instanceId','definitionId','instructionalSha256','displayedSha256']) && r.contextInstances.includes(g.instanceId) && id(g.definitionId) && sha(g.instructionalSha256) && (g.displayedSha256 === null || sha(g.displayedSha256)))) throw Error('INVALID_OBSERVATION');
 if (ctx && (r.variantId !== ctx.graph.variantId || !ctx.graph.steps.some(s => s.id === r.stepId)
  || r.contextInstances.some(id => !ctx.graph.instances.some(i => i.id === id && i.variantIds.includes(r.variantId)))
  || r.geometry.some(g => !ctx.graph.instances.some(i => i.id === g.instanceId && i.definitionId === g.definitionId)))) throw Error('OBSERVATION_BINDING');
}
export function photoType(bytes: Uint8Array): StudioObservation['file']['mediaType'] {
 if (bytes.length < 1 || bytes.length > 20 * 1024 * 1024) throw Error('PHOTO_SIZE');
 if (bytes.length >= 8 && [137,80,78,71,13,10,26,10].every((b,i) => bytes[i] === b)) return 'image/png';
 if (bytes.length >= 3 && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) return 'image/jpeg';
 if (bytes.length >= 12 && new TextDecoder().decode(bytes.subarray(0,4)) === 'RIFF' && new TextDecoder().decode(bytes.subarray(8,12)) === 'WEBP') return 'image/webp';
 throw Error('PHOTO_TYPE: choose a PNG, JPEG or WebP image');
}
export function verifyPhoto(r: StudioObservation, bytes: Uint8Array): void {
 if (bytes.length !== r.file.byteLength || bytesToHex(sha256(bytes)) !== r.file.sha256 || photoType(bytes) !== r.file.mediaType) throw Error('EVIDENCE_CORRUPT');
}
export const observationRevision = (r: StudioObservation, packId: string): string => r.packId === packId ? 'Current digital revision' : 'Taken against an earlier digital revision';
export const poseHash = (placements: unknown): string => rawHash(canonical(placements));
