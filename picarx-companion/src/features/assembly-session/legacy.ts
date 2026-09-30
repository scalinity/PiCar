import type { ImportRecord, Setup } from '../../platform/repository';
import { emptySetup } from './commands';
import { bytes, parse, rawHash } from './hash';
import { LIMIT } from '../../platform/repository';
const stages = new Set(['parts', 'os', 'power', 'connect', 'software', 'servo-zero', 'assembly', 'calibrate']);
export function validateSetup(s: Setup): void {
 if (!s || typeof s !== 'object' || Object.keys(s).sort().join(',') !== 'checks,lastRoute,legacyAssemblyReportedDone,pdfLastPage,steps' || !s.steps || !s.checks || Array.isArray(s.steps) || Array.isArray(s.checks) || Object.entries(s.steps).some(([k,v]) => !stages.has(k) || v !== 'done') || Object.entries(s.checks).some(([k,v]) => k.length > 256 || typeof v !== 'boolean') || typeof s.lastRoute !== 'string' || s.lastRoute.length > 4096 || (s.lastRoute!==''&&(!s.lastRoute.startsWith('#/')||!['','wizard','reference','videos','assembly'].includes(s.lastRoute.slice(2).split('/')[0].split('?')[0]))) || !Number.isSafeInteger(s.pdfLastPage) || s.pdfLastPage < 1 || s.pdfLastPage > 100000 || typeof s.legacyAssemblyReportedDone !== 'boolean') throw Error('INVALID_SETUP');
}
export function captureLegacy(raw: string, sourceOrigin: string, sourceKey = 'picarx.v1'): { record: ImportRecord; setup: Setup | null } {
 const rawDigest = rawHash(raw), record: ImportRecord = { id: rawHash(`${sourceOrigin}\n${sourceKey}\n${rawDigest}\n1`), sourceOrigin, sourceKey, raw, rawHash: rawDigest, migrationVersion: 1, status: 'adopted', reason: '' };
 // Keep the exact raw input even when the bounded interpretation is rejected.
 try {
  if (bytes(raw).length > LIMIT) throw Error('LEGACY_OVERSIZED');
  const v = parse(raw) as Record<string, unknown>; if (!v || Array.isArray(v) || typeof v !== 'object' || Object.keys(v).some(k=>!['steps','checks','lastRoute','pdfLastPage'].includes(k))) throw Error('LEGACY_TYPE');
  const setup = { ...emptySetup(), ...Object.fromEntries(['steps','checks','lastRoute','pdfLastPage'].filter(k => k in v).map(k => [k, v[k]])) } as Setup;
  setup.legacyAssemblyReportedDone = setup.steps?.assembly === 'done'; validateSetup(setup);if(bytes(JSON.stringify(record)).length+bytes(JSON.stringify(setup)).length*2>LIMIT-65536)throw Error('LEGACY_OVERSIZED'); return { record, setup };
 } catch (e) { record.status = 'quarantined'; record.reason = e instanceof Error ? e.message : 'LEGACY_INVALID'; return { record, setup: null }; }
}
