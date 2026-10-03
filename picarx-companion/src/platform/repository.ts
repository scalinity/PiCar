import type { AssemblySession } from '../generated/twin/contracts';
import type { StudioObservation } from '../features/assembly-session/observation';
export const DATABASE_VERSION = 1;
export const LIMIT = 8 * 1024 * 1024;
export type Setup = { steps: Record<string, 'done'>; checks: Record<string, boolean>; lastRoute: string; pdfLastPage: number; legacyAssemblyReportedDone: boolean };
export type ImportRecord = { id: string; sourceOrigin: string; sourceKey: string; raw: string; rawHash: string; migrationVersion: number; status: 'adopted' | 'quarantined' | 'divergent' | 'recovery'; reason: string };
export type Action =
 | { kind: 'create'; session: AssemblySession; forkOf: string | null }
 | { kind: 'condition'; record: AssemblySession['procedureAcknowledgments'][number] | AssemblySession['zeroingAttestations'][number] }
 | { kind: 'complete'; stepId: string; statement: string; checkedRuleIds: string[]; createdAt: string }
 | { kind: 'invalidate'; stepId: string; servoInstanceId: string | null; reason: 'undo' | 'movement' | 'replacement' | 'reindex' | 'disassembly' | 'dependency' | 'procedure'; createdAt: string }
 | { kind: 'bookmark'; stepId: string }
 | { kind: 'observation'; record: StudioObservation }
 | { kind:'reconcile'; sessionId:string; sessionRevision:number; graphHash:string }
 | { kind: 'setup'; setup: Setup }
 | { kind: 'legacy'; record: ImportRecord; setup: Setup | null; choice: 'initial' | 'keepNew' | 'recovery' };
export type Snapshot = AssemblySession | Setup;
export type Event = { sequence: number; commandId: string; action: Action; previousHash: string; nextHash: string; proposal: Snapshot };
export type Command = { payloadVersion: 1; aggregateId: string; commandId: string; expectedRevision: number; graphHash: string | null; modelHash: string | null; payload: Action; proposal: Snapshot; previousHash: string; nextHash: string; requestHash: string };
export type Acknowledgment = { aggregateId: string; commandId: string; acknowledgedRevision: number; snapshotHash: string };
export type Aggregate = { id: string; revision: number; graphHash: string | null; modelHash: string | null; snapshot: Snapshot; snapshotHash: string };
export type Stored = { aggregate: Aggregate; events: Event[] };
export type Backup = { format: 'picar-sessions'; schemaVersion: number; aggregates: Stored[]; results: { commandId: string; requestHash: string; acknowledgment: Acknowledgment }[]; imports: ImportRecord[]; checksum: string };
export interface Repository {
  load(id: string): Promise<Stored | null>;
  list(): Promise<Aggregate[]>;
  commit(command: Command): Promise<Acknowledgment>;
  imports(): Promise<ImportRecord[]>;
  backup(): Promise<Backup>;
  restore(backup: Backup): Promise<void>;
  quarantine(record: ImportRecord): Promise<void>;
  close(): void;
}
