import { it, expect } from 'vitest';
import fs from 'node:fs';
import { prepareCommand, newSession, compareRevision, condition, applyEvent, eventFor, replay } from '../../src/features/assembly-session/commands';
import type { Context } from '../../src/features/assembly-session/commands';
import { canonical, hash, parse } from '../../src/features/assembly-session/hash';
import { captureLegacy } from '../../src/features/assembly-session/legacy';
const graph=JSON.parse(fs.readFileSync('../digital-twin/validation/m2/rpi4/compiled-graph.json','utf8'));
const registry=JSON.parse(fs.readFileSync('../digital-twin/validation/m2/runtime-registry.json','utf8'));
const text=fs.readFileSync('../docs/digital-twin/V40_ASSEMBLY_LEDGER.md','utf8');
const ctx:Context={graph,registry,evidenceHash:'e00e7825f413a37edeb3c9ac47611fbf790480d6efb71337b5cd219bfd082d5c',procedureText:Object.fromEntries(text.split(/(?=^## \d\d\.)/m).slice(1).map(t=>[t.match(/PX-V40-STEP-\d\d/)![0],t]))};
const s=newSession('TEST-SESSION',ctx);
it('rejects completion out of physical order and missing checks',()=>{
 const created=applyEvent(null,{kind:'create',session:s,forkOf:null},'TEST-CREATE',1,ctx);
 expect(()=>applyEvent(created,{kind:'complete',stepId:graph.steps[1].id,statement:'Checked',checkedRuleIds:[],createdAt:'2026-09-29T12:00:00Z'},'TEST-COMPLETE',2,ctx)).toThrow('PHYSICAL_PREREQUISITE');
 const step=graph.steps[0];expect(()=>applyEvent(created,{kind:'complete',stepId:step.id,statement:'',checkedRuleIds:step.verificationRuleIds,createdAt:'2026-09-29T12:00:00Z'},'TEST-COMPLETE',2,ctx)).toThrow('CONFIRMATION_STATEMENT');
});
it('rejects stale revision, tampered create and event snapshots',()=>{
 const c=prepareCommand(null,{kind:'create',session:s,forkOf:null},'TEST-CREATE',ctx);
 const aggregate={id:c.aggregateId,revision:1,graphHash:c.graphHash,modelHash:c.modelHash,snapshot:c.proposal,snapshotHash:c.nextHash};
 expect(()=>compareRevision(c,aggregate)).toThrow('CONFLICT');
 const forged=structuredClone(s);forged.revision=7;expect(()=>prepareCommand(null,{kind:'create',session:forged,forkOf:null},'TEST-FORGED',ctx)).toThrow('CREATE_NOT_EMPTY');
 expect(replay({aggregate,events:[eventFor(c)]},ctx)).toEqual(c.proposal);
 expect(()=>replay({aggregate,events:[eventFor(c),eventFor(c)]},ctx)).toThrow();
});
it('procedure/servo bindings reject epoch, variant, rule and procedure revisions',()=>{
 const op=graph.operations.find((o:any)=>o.kind==='confirmZeroing');
 const r=condition(s,ctx,op.id,'TEST-ZERO','2026-09-29T12:00:00Z');
 for(const patch of [{servoEpoch:1},{variantId:'rpi5'},{conditionRuleId:'TEST-UNKNOWN'},{procedureRevisionHash:'0'.repeat(64)},{movementSinceZeroingDenied:false}])expect(()=>applyEvent(s,{kind:'condition',record:{...r,...patch} as typeof r},'TEST-CONDITION',1,ctx)).toThrow();
});
it('rejects strict JSON mutants and retains original legacy raw',()=>{
 for(const raw of ['{"a":1,"a":2}','{"a":-0}','{"a":1e999}','{"revision":9007199254740992}','{"a":"\\ud800"}'])expect(()=>parse(raw)).toThrow();
 expect(hash('test',{a:1,b:2})).toBe(hash('test',{b:2,a:1}));
 const capture=captureLegacy('{"steps":{"assembly":true}}','origin');expect(capture.setup).toBeNull();expect(capture.record.raw).toBe('{"steps":{"assembly":true}}');
 expect(()=>canonical({x:undefined})).toThrow('NON_JSON');
});
