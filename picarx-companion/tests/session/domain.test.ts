import { expect, it } from 'vitest';
import fs from 'node:fs';
import { newSession, prepareCommand, replay, condition, completed, eventFor } from '../../src/features/assembly-session/commands';
import type { Context } from '../../src/features/assembly-session/commands';
import type { Aggregate, Command, Stored } from '../../src/platform/repository';
import type { AssemblySession } from '../../src/generated/twin/contracts';
import { captureLegacy } from '../../src/features/assembly-session/legacy';
import { hash } from '../../src/features/assembly-session/hash';
const read = (p: string) => JSON.parse(fs.readFileSync('../digital-twin/validation/m2/'+p,'utf8'));
const ledger = fs.readFileSync('../docs/digital-twin/V40_ASSEMBLY_LEDGER.md','utf8');
export function context(variant = 'rpi4'): Context {
 const graph = read(variant+'/compiled-graph.json'), registry = read('runtime-registry.json');
 const procedureText = Object.fromEntries(ledger.split(/(?=^## \d\d\.)/m).slice(1).map(t => [t.match(/PX-V40-STEP-\d\d/)![0],t]));
 return {graph,registry,procedureText,evidenceHash:'e00e7825f413a37edeb3c9ac47611fbf790480d6efb71337b5cd219bfd082d5c'};
}
function committed(c: Command): Aggregate { return {id:c.aggregateId,revision:c.expectedRevision+1,graphHash:c.graphHash,modelHash:c.modelHash,snapshot:c.proposal,snapshotHash:c.nextHash}; }
for (const variant of ['rpi4','rpi5','rpi-zero-2-w']) it(variant+' all29 confirmations, replay, undo and empty variant fork', () => {
 const ctx = context(variant), events: Stored['events'] = []; let aggregate: Aggregate | null = null; let n = 0;
 const commit = (action: Command['payload']) => { const c = prepareCommand(aggregate,action,`TEST-COMMAND-${++n}`,ctx); aggregate = committed(c); events.push(eventFor(c)); return c; };
 commit({kind:'create',session:newSession('TEST-SESSION',ctx),forkOf:null});
 for (const step of ctx.graph.steps) {
  for (const op of ctx.graph.operations.filter(o=>step.operationIds.includes(o.id)&&['acknowledgeProcedure','confirmZeroing'].includes(o.kind))) commit({kind:'condition',record:condition(aggregate!.snapshot as AssemblySession,ctx,op.id,`TEST-CONDITION-${++n}`,'2026-09-29T12:00:00Z')});
  commit({kind:'complete',stepId:step.id,statement:'I checked the printed physical task.',checkedRuleIds:step.verificationRuleIds,createdAt:'2026-09-29T12:00:00Z'});
 }
 const s = aggregate!.snapshot as AssemblySession; expect(completed(s)).toHaveLength(29); expect(s.zeroingAttestations.every(r=>r.consumedByCommandRef.state==='known')).toBe(true);
 expect(replay({aggregate:aggregate!,events},ctx)).toEqual(s);
 commit({kind:'invalidate',stepId:ctx.graph.steps[17].id,servoInstanceId:null,reason:'undo',createdAt:'2026-09-29T12:00:00Z'});
 expect(completed(aggregate!.snapshot as AssemblySession)).toHaveLength(17); expect((aggregate!.snapshot as AssemblySession).servoEpochs.every(e=>e.epoch===1)).toBe(true);
 const fork = newSession('TEST-FORK',context(variant==='rpi4'?'rpi5':'rpi4')); expect(completed(fork)).toEqual([]); expect(fork.zeroingAttestations).toEqual([]);
 const stored = {aggregate:aggregate!,events}; expect(()=>replay({...stored,events:events.slice(1)},ctx)).toThrow('EVENT_SEQUENCE');
 expect(()=>replay({...stored,aggregate:{...aggregate!,snapshotHash:'0'.repeat(64)}},ctx)).toThrow('CORRUPT_SNAPSHOT');
});
it('legacy backup retains exact malformed and valid raw without detailed confirmations',()=>{
 const raw=fs.readFileSync('tests/baseline/legacy.json','utf8'), captured=captureLegacy(raw,'http://localhost:1420');
 expect(captured.record.raw).toBe(raw); expect(captured.setup?.legacyAssemblyReportedDone).toBe(true); expect(captured.setup?.checks).toEqual({'power.safe':true,'servo.ready':false});
 expect(captureLegacy('{bad','origin').record.raw).toBe('{bad'); expect(captureLegacy('{bad','origin').record.status).toBe('quarantined');
 expect(captureLegacy('{"checks":{"x":"true"}}','origin').setup).toBe(null);
 expect(captureLegacy('{"pdfLastPage":0}','origin').setup).toBe(null);
 expect(hash('test',{a:1,b:2})).toBe(hash('test',{b:2,a:1}));
});
