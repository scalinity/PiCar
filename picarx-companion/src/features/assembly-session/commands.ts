import {validateSession} from '../../platform/session-validators.js';
import type { AssemblySession, AssemblyOperation, CompiledGraph, RuntimeRegistry, ProcedureAcknowledgment, ZeroingAttestation } from '../../generated/twin/contracts';
import type { Action, Aggregate, Command, Event, Snapshot, Stored } from '../../platform/repository';
import { canonical, hash, bytes } from './hash';
import { validateAction, exact } from '../../platform/validation';
import { validateSetup } from './legacy';
import { LIMIT } from '../../platform/repository';
import { projectPrefix } from '../../domain/assembly/reducer';
import { validateGraphReferences } from '../../domain/assembly/references';
import { validateObservation } from './observation';
export type Context = { graph: CompiledGraph; registry: RuntimeRegistry; evidenceHash: string; procedureText: Record<string, string> };
const fail = (ok: unknown, code: string): void => { if (!ok) throw Error(code); };
function payloadId(op:AssemblyOperation,key:string):string{const v=op.payload[key];if(typeof v!=='string')throw Error('CONDITION_PAYLOAD');return v;}
export const emptyRef = { state: 'notApplicable', reason: 'No event recorded.' } as const;
export const active = (r: { invalidationEventRef?: { state: string }; invalidatedByEventRef?: { state: string } }): boolean => (r.invalidationEventRef ?? r.invalidatedByEventRef)?.state === 'notApplicable';
export const completed = (s: AssemblySession): string[] => s.confirmationRecords.filter(active).map(c => c.stepId);
export function validateContext(ctx: Context): void { validateGraphReferences(ctx.graph, ctx.registry); projectPrefix(ctx, 0, hash); }
export function newSession(id: string, ctx: Context): AssemblySession {
 const { graph: g } = ctx;
 return { id, projectId: 'PX-V40-PROJECT', setupProgressRef: 'PX-SETUP', contractVersion: 2, schemaVersion: 1, variantId: g.variantId, graphHash: g.graphHash, modelHash: g.modelHash, evidenceHash: ctx.evidenceHash, revision: 0, confirmationRecords: [], invalidationEventIds: [], observationIds: [], sourceAdoptionEventIds: [], reviewStepId: g.steps[0].id, procedureAcknowledgments: [], zeroingAttestations: [], servoEpochs: g.operations.filter(o => o.kind === 'confirmZeroing').map(o => ({ servoInstanceId: payloadId(o,'servoInstanceId'), epoch: 0 })) };
}
export function procedurePreimage(ctx: Context, operationId: string): unknown {
 const op = ctx.graph.operations.find(o => o.id === operationId); fail(op && (op.kind === 'confirmZeroing' || op.kind === 'acknowledgeProcedure'), 'CONDITION_OPERATION');
 if (!op || !(op.kind === 'confirmZeroing' || op.kind === 'acknowledgeProcedure')) throw Error('CONDITION_OPERATION');
 const rule = ctx.graph.verificationRules.find(r => r.id === op.payload.conditionRuleId); fail(rule, 'CONDITION_RULE');
 const text = ctx.procedureText[op.stepId]; fail(text, 'PROCEDURE_TEXT_MISSING');
 return { contractVersion: 2, operation: op, rule, sourceProcedureText: text };
}
export function condition(s: AssemblySession, ctx: Context, operationId: string, id: string, createdAt: string): ProcedureAcknowledgment | ZeroingAttestation {
 const op = ctx.graph.operations.find(o => o.id === operationId); if (!op || !(op.kind === 'confirmZeroing' || op.kind === 'acknowledgeProcedure')) throw Error('CONDITION_OPERATION');
 const rule = ctx.graph.verificationRules.find(r => r.id === op.payload.conditionRuleId)!;
 const base = { id, sessionId: s.id, variantId: s.variantId, graphHash: s.graphHash, modelHash: s.modelHash, conditionRuleId: rule.id, procedureRevisionHash: hash('procedure', procedurePreimage(ctx, op.id)), operationId: op.id, dependencyIds: [...new Set([...rule.invalidationDependencyIds, op.id])].sort() as [string, ...string[]], createdAt, actor: 'self_confirmed' as const, invalidationEventRef: emptyRef };
 if (op.kind === 'acknowledgeProcedure') return { ...base, kind: op.id.includes('POWER-OFF') ? 'powerOff' : 'procedureRead', accepted: true };
 return { ...base, servoInstanceId: payloadId(op,'servoInstanceId'), validForOperationId: payloadId(op,'validForOperationId'), movementSinceZeroingDenied: true, servoEpoch: s.servoEpochs.find(e => e.servoInstanceId === payloadId(op,'servoInstanceId'))!.epoch, consumedByCommandRef: emptyRef };
}
function binding(s: AssemblySession, ctx: Context): void {
 fail(validateSession(s), 'INVALID_SESSION_SCHEMA');
 fail(s.schemaVersion === 1 && s.variantId === ctx.graph.variantId && s.graphHash === ctx.graph.graphHash && s.modelHash === ctx.graph.modelHash && s.evidenceHash === ctx.evidenceHash, 'UNSUPPORTED_GRAPH');
}
function eligible(s: AssemblySession, ctx: Context, r: ProcedureAcknowledgment | ZeroingAttestation): void {
 fail(r.sessionId === s.id && r.variantId === s.variantId && r.graphHash === s.graphHash && r.modelHash === s.modelHash && r.actor === 'self_confirmed' && active(r), 'CONDITION_BINDING');
 fail(Number.isFinite(Date.parse(r.createdAt)), 'CONDITION_TIME');
 const expected = condition(s, ctx, r.operationId, r.id, r.createdAt);
 fail(canonical(r) === canonical(expected), 'CONDITION_SCOPE');
}
export function applyEvent(s0: AssemblySession | null, action: Action, commandId: string, revision: number, ctx: Context): AssemblySession {
 if (action.kind === 'create') {
  fail(!s0, 'AGGREGATE_EXISTS'); const s = newSession(action.session.id, ctx); fail(canonical(s) === canonical(action.session), 'CREATE_NOT_EMPTY'); s.revision = revision; return s;
 }
 fail(s0, 'UNKNOWN_AGGREGATE'); const s = structuredClone(s0!); binding(s, ctx);
 if (action.kind === 'condition') {
  eligible(s, ctx, action.record);
  const op = ctx.graph.operations.find(o => o.id === action.record.operationId)!;
  const index = ctx.graph.steps.findIndex(t => t.id === op.stepId);
  fail(ctx.graph.steps.slice(0, index).every(t => completed(s).includes(t.id)), 'PHYSICAL_PREREQUISITE');
  fail(!completed(s).includes(op.stepId), 'ALREADY_COMPLETED');
  fail(![...s.procedureAcknowledgments, ...s.zeroingAttestations].some(r => r.id === action.record.id), 'DUPLICATE_CONDITION_ID');
  if ('servoInstanceId' in action.record) s.zeroingAttestations.push(action.record); else s.procedureAcknowledgments.push(action.record);
 } else if (action.kind === 'complete') {
  const index = ctx.graph.steps.findIndex(t => t.id === action.stepId); fail(index >= 0, 'STEP_ID'); const step = ctx.graph.steps[index];
  fail(ctx.graph.steps.slice(0, index).every(t => completed(s).includes(t.id)) && !completed(s).includes(step.id), 'PHYSICAL_PREREQUISITE');
  fail(action.statement.trim() && Number.isFinite(Date.parse(action.createdAt)), 'CONFIRMATION_STATEMENT');
  const rules = [...new Set(step.verificationRuleIds)].sort(); fail(canonical([...new Set(action.checkedRuleIds)].sort()) === canonical(rules), 'CHECKS_REQUIRED');
  const ackIds: string[] = [], zeroIds: string[] = [];
  for (const op of ctx.graph.operations.filter(o => step.operationIds.includes(o.id))) {
   if (op.kind === 'acknowledgeProcedure') { const r = [...s.procedureAcknowledgments].reverse().find(r => r.operationId === op.id && active(r)); fail(r, 'PROCEDURE_REQUIRED'); eligible(s, ctx, r!); ackIds.push(r!.id); }
   if (op.kind === 'confirmZeroing') {
    const r = [...s.zeroingAttestations].reverse().find(r => r.operationId === op.id && active(r) && r.consumedByCommandRef.state === 'notApplicable'); fail(r, 'ZEROING_REQUIRED'); eligible(s, ctx, r!); fail(step.operationIds.includes(r!.validForOperationId), 'ZEROING_SCOPE');
    r!.consumedByCommandRef = { state: 'known', ref: commandId }; zeroIds.push(r!.id);
   }
  }
  s.confirmationRecords.push({ id: commandId, stepId: step.id, operationIds: step.operationIds, actor: 'self_confirmed', statement: action.statement, createdAt: action.createdAt, modelHash: s.modelHash, graphHash: s.graphHash, variantId: s.variantId, dependencyIds: [...new Set([...step.prerequisites, ...step.operationIds, ...rules])].sort(), observationIds: [], invalidatedByEventRef: emptyRef, procedureAcknowledgmentIds: ackIds, zeroingAttestationIds: zeroIds });
  s.reviewStepId = ctx.graph.steps[index + 1]?.id ?? step.id;
 } else if (action.kind === 'invalidate') {
  const index = ctx.graph.steps.findIndex(t => t.id === action.stepId); fail(index >= 0 && action.reason && Number.isFinite(Date.parse(action.createdAt)), 'INVALIDATION');
  const affected = new Set(ctx.graph.steps.slice(index).map(t => t.id));
  const servos = ctx.graph.operations.filter(o => o.kind === 'confirmZeroing' && affected.has(o.stepId)).map(o => payloadId(o,'servoInstanceId'));
  if (action.servoInstanceId) fail(servos.includes(action.servoInstanceId), 'SERVO_SCOPE');
  const ref = { state: 'known', ref: commandId } as const;
  for (const c of s.confirmationRecords) if (affected.has(c.stepId) && active(c)) c.invalidatedByEventRef = ref;
  for (const r of [...s.procedureAcknowledgments, ...s.zeroingAttestations]) if (affected.has(ctx.graph.operations.find(o => o.id === r.operationId)!.stepId) && active(r)) r.invalidationEventRef = ref;
  for (const e of s.servoEpochs) if (servos.includes(e.servoInstanceId)) e.epoch++;
  s.invalidationEventIds.push(commandId); s.reviewStepId = action.stepId;
 } else if (action.kind === 'observation') {
  validateObservation(action.record,ctx);
  fail(action.record.sessionId === s.id && !s.observationIds.includes(action.record.id), 'OBSERVATION_BINDING');
  s.observationIds.push(action.record.id);
 } else if (action.kind === 'bookmark') { fail(ctx.graph.steps.some(t => t.id === action.stepId), 'STEP_ID'); s.reviewStepId = action.stepId; }
 else throw Error('SESSION_ACTION');
 s.revision = revision; binding(s, ctx); return s;
}
export function prepareCommand(previous: Aggregate | null, action: Action, commandId: string, ctx?: Context): Command {
 const aggregateId = previous?.id ?? (action.kind === 'create' ? action.session.id : action.kind === 'legacy' && action.choice === 'recovery' ? `PX-RECOVERY-${action.record.rawHash.toUpperCase()}` : 'PX-SETUP');
 validateAction(action);
 const expectedRevision = previous?.revision ?? 0;
 let proposal: Snapshot;
 if (ctx) proposal = applyEvent(previous?.snapshot as AssemblySession ?? null, action, commandId, expectedRevision + 1, ctx);
 else if(action.kind==='reconcile'){const old=previous?.snapshot as import('../../platform/repository').Setup??emptySetup();proposal={...old,steps:{...old.steps,assembly:'done'},legacyAssemblyReportedDone:false};}
 else if (action.kind === 'setup') {const old=previous?.snapshot as import('../../platform/repository').Setup|undefined;fail((action.setup.steps.assembly!=='done'||old?.steps.assembly==='done')&&action.setup.legacyAssemblyReportedDone===(old?.legacyAssemblyReportedDone??false),'RECONCILIATION_REQUIRED');proposal = action.setup;}
 else if (action.kind === 'legacy') { if (previous && action.choice==='initial') throw Error('LEGACY_DIVERGENCE'); proposal = action.choice === 'keepNew' || !action.setup ? previous?.snapshot ?? emptySetup() : action.setup; }
 else throw Error('CONTEXT_REQUIRED');
 const body = { payloadVersion: 1 as const, aggregateId, commandId, expectedRevision, graphHash: ctx?.graph.graphHash ?? null, modelHash: ctx?.graph.modelHash ?? null, payload: action, proposal, previousHash: previous?.snapshotHash ?? hash('aggregate', null), nextHash: hash('aggregate', proposal) };
 const result = { ...body, requestHash: hash('command', body) }; validateCommand(result); return result;
}
export const emptySetup = (): import('../../platform/repository').Setup => ({ steps: {}, checks: {}, lastRoute: '', pdfLastPage: 1, legacyAssemblyReportedDone: false });
export function validateCommand(c: Command): void {
 exact(c,['payloadVersion','aggregateId','commandId','expectedRevision','graphHash','modelHash','payload','proposal','previousHash','nextHash','requestHash']);validateAction(c.payload);
 fail(bytes(canonical(c)).length <= LIMIT && c.payloadVersion === 1 && c.commandId.length<=256 && c.aggregateId.length<=256 && /^(PX|TEST)-[A-Z0-9-]+$/.test(c.commandId) && /^(PX|TEST)-[A-Z0-9-]+$/.test(c.aggregateId) && Number.isSafeInteger(c.expectedRevision) && c.expectedRevision >= 0, 'INVALID_ENVELOPE');
 const { requestHash, ...body } = c; fail(hash('command', body) === requestHash && hash('aggregate', c.proposal) === c.nextHash, 'COMMAND_HASH');
}
export function compareRevision(c: Command, old: Aggregate | null): void {
 fail(c.expectedRevision === (old?.revision ?? 0), 'CONFLICT'); fail(c.previousHash === (old?.snapshotHash ?? hash('aggregate', null)), 'CORRUPT_STATE');
 if (old) fail(old.graphHash === c.graphHash && old.modelHash === c.modelHash, 'UNKNOWN_MODEL');
}
export function replay(stored: Stored, ctx?: Context): Snapshot {
 let state: Snapshot | null = null; let previousHash = hash('aggregate', null);const ids=new Set<string>();
 for (let i = 0; i < stored.events.length; i++) {
  const e = stored.events[i]; validateAction(e.action);fail(/^(PX|TEST)-[A-Z0-9-]+$/.test(e.commandId),'INVALID_ID'); fail(e.sequence === i + 1 && e.previousHash === previousHash, 'EVENT_SEQUENCE');
  fail(!ids.has(e.commandId),'COMMAND_ID_REUSE');ids.add(e.commandId);
  if (ctx) state = applyEvent(state as AssemblySession | null, e.action, e.commandId, i + 1, ctx);
  else if(e.action.kind==='reconcile'){const old:import('../../platform/repository').Setup=(state as import('../../platform/repository').Setup|null)??emptySetup();state={...old,steps:{...old.steps,assembly:'done'},legacyAssemblyReportedDone:false};}
  else if (e.action.kind === 'setup') {const old=state as import('../../platform/repository').Setup|null;fail((e.action.setup.steps.assembly!=='done'||old?.steps.assembly==='done')&&e.action.setup.legacyAssemblyReportedDone===(old?.legacyAssemblyReportedDone??false),'RECONCILIATION_REQUIRED');state = e.action.setup;}
  else if (e.action.kind === 'legacy') state = e.action.choice === 'keepNew' || !e.action.setup ? state ?? emptySetup() : e.action.setup;
  else throw Error('EVENT_AUTHORIZATION');
  if(!ctx)validateSetup(state as import('../../platform/repository').Setup);
  fail(canonical(e.proposal)===canonical(state),'PROPOSAL_AUTHORIZATION');
  previousHash = hash('aggregate', state); fail(previousHash === e.nextHash, 'EVENT_HASH');
 }
 fail(state && stored.aggregate.revision === stored.events.length && stored.aggregate.snapshotHash === previousHash && canonical(state) === canonical(stored.aggregate.snapshot), 'CORRUPT_SNAPSHOT');
 return state!;
}
export function eventFor(c: Command): Event { return { sequence: c.expectedRevision + 1, commandId: c.commandId, action: c.payload, previousHash: c.previousHash, nextHash: c.nextHash, proposal:c.proposal }; }
