import type { Acknowledgment, Aggregate, Command, ImportRecord, Repository, Stored } from '../repository';
import { DATABASE_VERSION } from '../repository';
import { compareRevision, eventFor, prepareCommand, validateCommand } from '../../features/assembly-session/commands';
import type { Context } from '../../features/assembly-session/commands';
import { canonical, hash } from '../../features/assembly-session/hash';
import { validateBackup, validateStored, validateImportRecord } from '../validation';
import { validateSetup } from '../../features/assembly-session/legacy';
import { readPhoto } from '../evidence';
const stores = ['aggregates', 'events', 'snapshots', 'results', 'imports'];
const request = <T>(r: IDBRequest<T>): Promise<T> => new Promise((resolve, reject) => { r.onsuccess = () => resolve(r.result); r.onerror = () => reject(r.error); });
const done = (t: IDBTransaction): Promise<void> => new Promise((resolve, reject) => { t.oncomplete = () => resolve(); t.onabort = () => reject(t.error ?? Error('IO_FAILURE')); t.onerror = () => {}; });
export async function openBrowserRepository(name = 'picarx.sessions', contexts: Map<string, Context> = new Map()): Promise<Repository> {
 const db = await new Promise<IDBDatabase>((resolve, reject) => {
  const r = indexedDB.open(name, DATABASE_VERSION); let blocked = false;
  r.onblocked = () => { blocked = true; reject(Error('INDEXEDDB_UPGRADE_BLOCKED')); };
  r.onupgradeneeded = () => {
   if (blocked) { r.transaction!.abort(); return; }
   // v1 has no prior session schema. Future migrations must export/verify the existing logical data first.
   for (const store of stores) r.result.createObjectStore(store, { keyPath: store === 'events' ? ['aggregateId','sequence'] : store === 'results' ? 'commandId' : 'id' });
  };
  r.onerror = () => { if(r.error?.name !== 'VersionError') { reject(r.error); return; } const newer=indexedDB.open(name);newer.onerror=()=>reject(newer.error);newer.onsuccess=()=>resolve(newer.result); };
  r.onsuccess = () => { if (blocked) r.result.close(); else resolve(r.result); };
 });
 db.onversionchange = () => db.close();
 const repository: Repository = {
  async load(id) {
   if(db.version>DATABASE_VERSION)throw Error('UNSUPPORTED_VERSION');
   const t = db.transaction(['aggregates','events','snapshots'], 'readonly'), completion = done(t);
   const [aggregate, all, snapshot] = await Promise.all([request(t.objectStore('aggregates').get(id)), request(t.objectStore('events').getAll()), request(t.objectStore('snapshots').get(id))]); await completion;
   if (!aggregate) return null;
   if (!snapshot || snapshot.revision !== aggregate.revision || canonical(snapshot.snapshot) !== canonical(aggregate.snapshot)) throw Error('CORRUPT_SNAPSHOT');
   const stored: Stored = { aggregate, events: all.filter(e => e.aggregateId === id).sort((a,b) => a.sequence - b.sequence).map(({aggregateId: _id, ...event}) => event) };
   if (aggregate.graphHash && !contexts.has(aggregate.graphHash)) throw Error('UNSUPPORTED_GRAPH');
   validateStored(stored, aggregate.graphHash ? contexts.get(aggregate.graphHash) : undefined); return stored;
  },
  async list() { const t = db.transaction('aggregates'), completion = done(t); const all = await request<Aggregate[]>(t.objectStore('aggregates').getAll()); await completion; const checked:Aggregate[]=[];for(const a of all){const stored=await repository.load(a.id);if(stored)checked.push(stored.aggregate);}return checked; },
  async imports() { const t = db.transaction('imports'), completion = done(t); const all = await request<ImportRecord[]>(t.objectStore('imports').getAll()); await completion; return all; },
  async commit(input) {
   if(db.version>DATABASE_VERSION)throw Error('UNSUPPORTED_VERSION');
   const c: Command = structuredClone(input); validateCommand(c);
   if(c.payload.kind==='observation'){
    // Idempotent retries return the committed acknowledgment before consulting external evidence bytes.
    const lookup=db.transaction('results'), finished=done(lookup);
    const prior=await request(lookup.objectStore('results').get(c.commandId));await finished;
    if(prior){if(prior.requestHash!==c.requestHash||prior.acknowledgment.aggregateId!==c.aggregateId)throw Error('COMMAND_ID_REUSE');return prior.acknowledgment;}
    await readPhoto(c.payload.record);
   }
   const context = c.graphHash ? contexts.get(c.graphHash) : undefined;
   if (c.graphHash && !context) throw Error('UNKNOWN_MODEL');
   if (!c.graphHash) validateSetup(c.proposal as import('../repository').Setup);
   const t = db.transaction(stores, 'readwrite'), completion = done(t); let response: Acknowledgment | undefined, rejection: Error | undefined;
   // All asynchronous work here is IndexedDB requests within this transaction; proposals and hashes are ready beforehand.
   const results = t.objectStore('results');
   const prior = results.get(c.commandId);
   prior.onsuccess = () => {
    if (prior.result) { if (prior.result.requestHash !== c.requestHash || prior.result.acknowledgment.aggregateId !== c.aggregateId) { rejection = Error('COMMAND_ID_REUSE'); t.abort(); } else response = prior.result.acknowledgment; return; }
    const start=()=>{const current = t.objectStore('aggregates').get(c.aggregateId);
    current.onsuccess = () => {
     try {
      const old: Aggregate | null = current.result ?? null;
      const cached=t.objectStore('snapshots').get(c.aggregateId);cached.onsuccess=()=>{if(current.result&&(!cached.result||canonical(cached.result.snapshot)!==canonical(current.result.snapshot))){rejection=Error('CORRUPT_SNAPSHOT');t.abort();return;}const history=t.objectStore('events').getAll();history.onsuccess=()=>{try {
      if(old)validateStored({aggregate:old,events:history.result.filter(e=>e.aggregateId===old.id).sort((a,b)=>a.sequence-b.sequence).map(({aggregateId:_id,...e})=>e)},context);
      compareRevision(c, old);
      const expected = prepareCommand(old, c.payload, c.commandId, context);
      if (canonical(expected) !== canonical(c)) throw Error('PROPOSAL_AUTHORIZATION');
      const write = () => {
       const revision = c.expectedRevision + 1;
       const aggregate: Aggregate = { id: c.aggregateId, revision, graphHash: c.graphHash, modelHash: c.modelHash, snapshot: c.proposal, snapshotHash: c.nextHash };
       response = { aggregateId: c.aggregateId, commandId: c.commandId, acknowledgedRevision: revision, snapshotHash: c.nextHash };
       t.objectStore('aggregates').put(aggregate); t.objectStore('snapshots').put({ id: c.aggregateId, revision, snapshot: c.proposal });
       t.objectStore('events').add({ aggregateId: c.aggregateId, ...eventFor(c) }); results.add({ commandId: c.commandId, requestHash: c.requestHash, acknowledgment: response });
       if (c.payload.kind === 'legacy') t.objectStore('imports').put(c.payload.record);
      };
      if (c.payload.kind === 'legacy') {
       const record = c.payload.record;
       if (record.rawHash !== hashRaw(record.raw)) throw Error('LEGACY_HASH');
       const priorImport = t.objectStore('imports').get(record.id);
       priorImport.onsuccess = () => { if (priorImport.result) { rejection = Error('MIGRATION_ALREADY_APPLIED'); t.abort(); } else write(); };
      } else if(c.payload.kind==='reconcile'){const proof=c.payload;const source=t.objectStore('aggregates').get(proof.sessionId);source.onsuccess=()=>{try{const a=source.result;if(a)validateStored({aggregate:a,events:history.result.filter(e=>e.aggregateId===a.id).sort((a,b)=>a.sequence-b.sequence).map(({aggregateId:_id,...e})=>e)},contexts.get(a.graphHash));if(!a||a.revision!==proof.sessionRevision||a.graphHash!==proof.graphHash||(a.snapshot.confirmationRecords??[]).filter((r:{invalidatedByEventRef:{state:string}})=>r.invalidatedByEventRef.state==='notApplicable').length!==29){rejection=Error('CONFLICT');t.abort();}else write();}catch(e){rejection=e instanceof Error?e:Error('CORRUPT_STATE');t.abort();}};}else if(c.payload.kind==='create'&&c.payload.forkOf){const source=t.objectStore('aggregates').get(c.payload.forkOf);source.onsuccess=()=>{try{const a=source.result;if(!a?.graphHash)throw Error('UNKNOWN_FORK_SOURCE');validateStored({aggregate:a,events:history.result.filter(e=>e.aggregateId===a.id).sort((a,b)=>a.sequence-b.sequence).map(({aggregateId:_id,...e})=>e)},contexts.get(a.graphHash));write();}catch(e){rejection=e instanceof Error?e:Error('CORRUPT_STATE');t.abort();}};}else write();
      }catch(e){rejection=e instanceof Error?e:Error('IO_FAILURE');t.abort();}};};
     } catch (e) { rejection = e instanceof Error ? e : Error('IO_FAILURE'); t.abort(); }
    };};
    if(c.payload.kind==='legacy'){const record=c.payload.record;const imported=t.objectStore('imports').get(record.id);imported.onsuccess=()=>{if(!imported.result){start();return;}if(canonical(imported.result)!==canonical(record)){rejection=Error('LEGACY_ID_REUSE');t.abort();return;}const history=t.objectStore('events').getAll();history.onsuccess=()=>{const event=history.result.find(e=>e.action.kind==='legacy'&&e.action.record.id===record.id);if(!event){rejection=Error('MIGRATION_MARKER_CORRUPT');t.abort();return;}const result=results.get(event.commandId);result.onsuccess=()=>{if(!result.result){rejection=Error('MIGRATION_MARKER_CORRUPT');t.abort();}else response=result.result.acknowledgment;};};};}else start();
   };
   try { await completion; } catch (e) { throw rejection ?? e; }
   if (!response) throw Error('IO_FAILURE'); return response;
  },
  async backup() {
   const t = db.transaction(stores, 'readonly'), completion = done(t);
   const [aggregates, events, results, imports] = await Promise.all(stores.filter(s => s !== 'snapshots').map(s => request(t.objectStore(s).getAll()))); await completion;
   const body = { format: 'picar-sessions' as const, schemaVersion: db.version, aggregates: aggregates.map((aggregate: Aggregate) => ({ aggregate, events: events.filter(e => e.aggregateId === aggregate.id).sort((a,b) => a.sequence - b.sequence).map(({aggregateId: _id, ...e}) => e) })), results, imports };
   return { ...body, checksum: hash('backup', body) };
  },
  async restore(backup) {
   if(db.version>DATABASE_VERSION)throw Error('UNSUPPORTED_VERSION');
   const b=structuredClone(backup);validateBackup(b,contexts);
   const t = db.transaction(stores, 'readwrite'), completion = done(t);
   // Explicit restore into an empty recovery database only; never overwrite newer progress.
   let remaining=stores.length,nonempty=false;let rejection:Error|undefined;
   for(const store of stores){const count=t.objectStore(store).count();count.onsuccess=()=>{
    nonempty ||= count.result>0;if(--remaining)return;
    if(nonempty){rejection=Error('RECOVERY_DESTINATION_NOT_EMPTY');t.abort();return;}
    for(const s of b.aggregates){t.objectStore('aggregates').add(s.aggregate);t.objectStore('snapshots').add({id:s.aggregate.id,revision:s.aggregate.revision,snapshot:s.aggregate.snapshot});for(const e of s.events)t.objectStore('events').add({aggregateId:s.aggregate.id,...e});}
    for(const r of b.results)t.objectStore('results').add(r);for(const i of b.imports)t.objectStore('imports').add(i);
   };}
   try { await completion; } catch (e) { throw rejection ?? e; }
  },
  async quarantine(record) {if(db.version>DATABASE_VERSION)throw Error('UNSUPPORTED_VERSION');validateImportRecord(record);if(record.status!=='quarantined'||record.reason!=='LEGACY_OVERSIZED')throw Error('INVALID_IMPORT');const t=db.transaction('imports','readwrite'),completion=done(t);t.objectStore('imports').put(record);await completion;},
  close() { db.close(); },
 };
 return repository;
}
import { rawHash as hashRaw } from '../../features/assembly-session/hash';
