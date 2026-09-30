import type { Action, Backup, Command, ImportRecord, Stored } from './repository';
import type { Context } from '../features/assembly-session/commands';
import { replay, validateCommand } from '../features/assembly-session/commands';
import { canonical, hash, rawHash, bytes } from '../features/assembly-session/hash';
import { validateSetup,captureLegacy } from '../features/assembly-session/legacy';
import { LIMIT, DATABASE_VERSION } from './repository';
export function exact(v:unknown,fields:string[]):void {
 if(!v || typeof v!=='object' || Array.isArray(v) || Object.keys(v).sort().join(',')!==fields.sort().join(','))throw Error('INVALID_SCHEMA');
}
export function validateImportRecord(r:ImportRecord):void {
 exact(r,['id','sourceOrigin','sourceKey','raw','rawHash','migrationVersion','status','reason']);
 if(typeof r.raw!=='string'||typeof r.sourceOrigin!=='string'||r.sourceOrigin.length>4096||r.sourceKey!=='picarx.v1'||r.migrationVersion!==1||!['adopted','quarantined','divergent','recovery'].includes(r.status)||typeof r.reason!=='string'||r.reason.length>4096||rawHash(r.raw)!==r.rawHash||r.id!==rawHash(`${r.sourceOrigin}\n${r.sourceKey}\n${r.rawHash}\n1`))throw Error('LEGACY_HASH');
}
export function validateAction(a:Action):void {
 const fields={create:['session','forkOf'],condition:['record'],complete:['stepId','statement','checkedRuleIds','createdAt'],invalidate:['stepId','servoInstanceId','reason','createdAt'],bookmark:['stepId'],reconcile:['sessionId','sessionRevision','graphHash'],setup:['setup'],legacy:['record','setup','choice']} as const;
 if(!a || !(a.kind in fields))throw Error('EVENT_AUTHORIZATION');
 exact(a,['kind',...fields[a.kind]]);
 if(a.kind==='reconcile'&&(!/^(PX|TEST)-[A-Z0-9-]+$/.test(a.sessionId)||!Number.isSafeInteger(a.sessionRevision)||a.sessionRevision<1||!/^[0-9a-f]{64}$/.test(a.graphHash)))throw Error('INVALID_RECONCILIATION');
 if(a.kind==='setup')validateSetup(a.setup);
 if(a.kind==='legacy'){validateImportRecord(a.record);const captured=captureLegacy(a.record.raw,a.record.sourceOrigin,a.record.sourceKey);if(canonical(captured.setup)!==canonical(a.setup))throw Error('LEGACY_SETUP_MISMATCH');if(a.setup!==null)validateSetup(a.setup);if(!['initial','keepNew','recovery'].includes(a.choice))throw Error('MIGRATION_CHOICE');}
 if(a.kind==='invalidate'&&!['undo','movement','replacement','reindex','disassembly','dependency','procedure'].includes(a.reason))throw Error('INVALIDATION');
 if(a.kind==='create'&&a.forkOf!==null&&!/^(PX|TEST)-[A-Z0-9-]+$/.test(a.forkOf))throw Error('UNKNOWN_FORK_SOURCE');
}
export function validateStored(s:Stored,ctx?:Context):void {
 exact(s,['aggregate','events']);exact(s.aggregate,['id','revision','graphHash','modelHash','snapshot','snapshotHash']);
 if(!/^(PX|TEST)-[A-Z0-9-]+$/.test(s.aggregate.id)||!Number.isSafeInteger(s.aggregate.revision)||s.aggregate.revision<1||!Array.isArray(s.events)||s.aggregate.graphHash!==(ctx?.graph.graphHash??null)||s.aggregate.modelHash!==(ctx?.graph.modelHash??null))throw Error('UNKNOWN_MODEL');
 const first=s.events[0]?.action;const expectedId=ctx?(s.aggregate.snapshot as import('../generated/twin/contracts').AssemblySession).id:first?.kind==='legacy'&&first.choice==='recovery'?`PX-RECOVERY-${first.record.rawHash.toUpperCase()}`:'PX-SETUP';if(s.aggregate.id!==expectedId)throw Error('UNKNOWN_AGGREGATE');
 for(const e of s.events){exact(e,['sequence','commandId','action','previousHash','nextHash','proposal']);validateAction(e.action);}
 replay(s,ctx);
}
export function validateBackup(b:Backup,contexts:Map<string,Context>):void {
 exact(b,['format','schemaVersion','aggregates','results','imports','checksum']);
 const {checksum,...body}=b;
 if(bytes(canonical(b)).length>LIMIT||b.format!=='picar-sessions'||b.schemaVersion!==DATABASE_VERSION||hash('backup',body)!==checksum||![b.aggregates,b.results,b.imports].every(Array.isArray))throw Error('INVALID_IMPORT');
 const commands=new Map<string,Command>();const aggregateIds=new Set<string>();const importIds=new Set<string>();
 for(const s of b.aggregates){const ctx=s.aggregate.graphHash?contexts.get(s.aggregate.graphHash):undefined;if(s.aggregate.graphHash&&!ctx)throw Error('UNSUPPORTED_GRAPH');validateStored(s,ctx);if(aggregateIds.has(s.aggregate.id))throw Error('DUPLICATE_AGGREGATE');aggregateIds.add(s.aggregate.id);
  for(const e of s.events){const commandBody={payloadVersion:1 as const,aggregateId:s.aggregate.id,commandId:e.commandId,expectedRevision:e.sequence-1,graphHash:s.aggregate.graphHash,modelHash:s.aggregate.modelHash,payload:e.action,proposal:e.proposal,previousHash:e.previousHash,nextHash:e.nextHash};const c={...commandBody,requestHash:hash('command',commandBody)};validateCommand(c);if(commands.has(c.commandId))throw Error('COMMAND_ID_REUSE');commands.set(c.commandId,c);if(e.action.kind==='legacy')importIds.add(e.action.record.id);}
 }
 for(const c of commands.values())if(c.payload.kind==='reconcile'){const proof=c.payload;const source=b.aggregates.find(s=>s.aggregate.id===proof.sessionId);const snapshot=source?.events[proof.sessionRevision-1]?.proposal as import('../generated/twin/contracts').AssemblySession|undefined;if(!source||source.aggregate.graphHash!==proof.graphHash||snapshot?.confirmationRecords.filter(r=>r.invalidatedByEventRef.state==='notApplicable').length!==29)throw Error('RECONCILIATION_CLOSURE');}
 const results=new Set<string>();for(const r of b.results){exact(r,['commandId','requestHash','acknowledgment']);exact(r.acknowledgment,['aggregateId','commandId','acknowledgedRevision','snapshotHash']);const c=commands.get(r.commandId);if(!c||results.has(r.commandId)||r.requestHash!==c.requestHash||canonical(r.acknowledgment)!==canonical({aggregateId:c.aggregateId,commandId:c.commandId,acknowledgedRevision:c.expectedRevision+1,snapshotHash:c.nextHash}))throw Error('RESULT_CLOSURE');results.add(r.commandId);}
 if(results.size!==commands.size)throw Error('RESULT_CLOSURE');
 const imports=new Set<string>();for(const r of b.imports){validateImportRecord(r);const source=[...commands.values()].find(c=>c.payload.kind==='legacy'&&c.payload.record.id===r.id);if(source?.payload.kind==='legacy'&&canonical(source.payload.record)!==canonical(r))throw Error('IMPORT_CLOSURE');if(imports.has(r.id)||(!importIds.has(r.id)&&!(r.status==='quarantined'&&r.reason==='LEGACY_OVERSIZED')))throw Error('IMPORT_CLOSURE');imports.add(r.id);}
 if([...importIds].some(id=>!imports.has(id)))throw Error('IMPORT_CLOSURE');
}
