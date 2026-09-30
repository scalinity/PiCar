import { invoke } from '@tauri-apps/api/core';
import type { Repository, Stored, Backup, Command, Acknowledgment, Aggregate, ImportRecord } from '../repository';
import type { Context } from '../../features/assembly-session/commands';
import { validateStored,validateBackup } from '../validation';
import { validateCommand } from '../../features/assembly-session/commands';
import { canonical } from '../../features/assembly-session/hash';
export function nativeRepository(contexts: Map<string, Context>, recovery=false): Repository {
 const validate = (s: Stored) => { if (s.aggregate.graphHash && !contexts.has(s.aggregate.graphHash)) throw Error('UNSUPPORTED_GRAPH'); validateStored(s,s.aggregate.graphHash ? contexts.get(s.aggregate.graphHash):undefined); };
 return {
  async load(id) { const s = await invoke<Stored|null>('load_companion_state',{id}); if(s)validate(s); return s; },
  async list(){const rows=await invoke<Aggregate[]>('list_companion_aggregates');const checked:Aggregate[]=[];for(const a of rows){const s=await invoke<Stored>('load_companion_state',{id:a.id});validate(s);checked.push(s.aggregate);}return checked;},
  imports: () => invoke<ImportRecord[]>('list_progress_imports'),
  commit: (c: Command) => { validateCommand(c); return invoke<Acknowledgment>('commit_session_command',{raw:canonical(c)}); },
  backup: () => invoke<Backup>('export_session'),
  async restore(b) {validateBackup(b,contexts);await invoke(recovery?'recover_session':'import_session',{raw:canonical(b)});},
  quarantine:record=>invoke('quarantine_legacy_raw',{raw:canonical(record)}),
  close() {},
 };
}
