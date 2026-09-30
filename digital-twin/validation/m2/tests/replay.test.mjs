import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {root,twin,validateShape} from '../../../tools/evidence/semantic.mjs';
import {read,jcs,fileHash,rawHash} from '../../../tools/evidence/hash.mjs';
import {hash} from '../../../tools/compiler/hash.mjs';
import {authoringInputs} from '../../../tools/compiler/inputs.mjs';
import {compileGraph} from '../../../../picarx-companion/src/domain/assembly/compiler.ts';
import {applyOperation,undoOperation,projectPrefix,stateHashes,validateState,ruleCapability} from '../../../../picarx-companion/src/domain/assembly/reducer.ts';
import {validateGraphReferences} from '../../../../picarx-companion/src/domain/assembly/references.ts';
const variants=['rpi4','rpi5','rpi-zero-2-w'],clone=x=>JSON.parse(JSON.stringify(x));
const canonical=(a,b)=>assert.equal(jcs(a).toString(),jcs(b).toString());
const output=(p,value)=>fs.writeFileSync(path.join(twin,'validation/m2',p),JSON.stringify(value,null,2)+'\n');
const corpus=[],coverage=[],fixtures=new Map(),inputsByVariant=new Map();
for(const variant of variants){
 const base=path.join(twin,'validation/m2',variant),inputs={graph:read(path.join(base,'compiled-graph.json')),registry:read(path.join(twin,'validation/m2/runtime-registry.json'))};inputsByVariant.set(variant,inputs);
 const graph=inputs.graph,rows=[],inverses=[],states=[clone(graph.initialState)];
 test(variant+': complete serialized operation corpus and full reverse',()=>{
  assert.equal(graph.steps.length,29);assert.deepEqual(graph.steps.map(s=>s.printedNumber),Array.from({length:29},(_,i)=>i+1));
  validateShape('CompiledGraph',graph);validateShape('RuntimeRegistry',inputs.registry);const references=validateGraphReferences(graph,inputs.registry);
  let state=clone(graph.initialState);rows.push({prefix:0,stateHash:state.stateHash,stockDispositionHash:state.stockDispositionHash,stateRawSha256:rawHash(jcs(state))});
  for(const op of graph.operations){
   const before=clone(state),r=applyOperation(before,clone(op),inputs,hash);canonical(before,state);state=clone(r.state);const inverse=clone(r.inverse);validateShape('AssemblyState',state);validateShape('OperationUndo',inverse);canonical(undoOperation(state,inverse,inputs,hash),before);inverses.push(inverse);states.push(clone(state));
   rows.push({prefix:rows.length,operationId:op.id,stateHash:state.stateHash,stockDispositionHash:state.stockDispositionHash,stateRawSha256:rawHash(jcs(state)),inverseRawSha256:rawHash(jcs(inverse))});
   corpus.push({variantId:variant,kind:op.kind,operationId:op.id,beforeHash:before.stateHash,afterHash:state.stateHash,inverseRawSha256:rawHash(jcs(inverse)),status:'PASS'});
   if(!fixtures.has(op.kind))fixtures.set(op.kind,{kind:op.kind,variantId:variant,operation:op,beforeState:before,afterState:state,inverse});
  }
  const finalState=clone(state);for(const inverse of [...inverses].reverse())state=clone(undoOperation(state,clone(inverse),inputs,hash));canonical(state,graph.initialState);
  let prefix=0;const boundaries=graph.steps.map(s=>{prefix+=s.operationIds.length;return {stepId:s.id,printedNumber:s.printedNumber,...rows[prefix]};});
  output(variant+'/expected-prefixes.json',{variantId:variant,graphHash:graph.graphHash,prefixes:rows,stepBoundaries:boundaries});output(variant+'/final-state.json',finalState);
  coverage.push({variantId:variant,operations:graph.operations.length,prefixes:rows.length,stepBoundaries:29,typedReferences:references,fullReverse:'PASS'});
 });
 test(variant+': all 29 step boundaries and arbitrary prefix derivation',()=>{
  let n=0;for(const s of graph.steps){n+=s.operationIds.length;validateState(states[n],inputs,hash);assert.equal(states[n].completedOperationIds.length,n);}
  const probes=new Set([0,1,2,graph.operations.length-1,graph.operations.length,...Array.from({length:11},(_,i)=>Math.floor(graph.operations.length*i/10))]);
  for(const count of probes)canonical(projectPrefix(inputs,count,hash),states[count]);
  assert.throws(()=>projectPrefix(inputs,-1,hash),/PREFIX_RANGE/);assert.throws(()=>projectPrefix(inputs,NaN,hash),/PREFIX_RANGE/);
 });
 test(variant+': independent fresh process knows no expected snapshots',()=>{
  const result=spawnSync(process.execPath,['--no-warnings','digital-twin/tools/compiler/replay.mjs',path.relative(root,path.join(base,'compiled-graph.json')),'digital-twin/validation/m2/runtime-registry.json',path.relative(root,path.join(base,'fresh-replay.json'))],{cwd:root,encoding:'utf8'});
  fs.writeFileSync(path.join(base,'fresh-replay-command.txt'),result.stdout+result.stderr);assert.equal(result.status,0,result.stdout+result.stderr);
  const fresh=read(path.join(base,'fresh-replay.json')),expected=read(path.join(base,'expected-prefixes.json'));canonical(fresh.prefixes,expected.prefixes);canonical(fresh.stepBoundaries,expected.stepBoundaries);canonical(fresh.finalState,states.at(-1));assert.equal(fresh.reverseInitialHash,graph.initialState.stateHash);
  output(variant+'/fresh-process-receipt.json',{status:'PASS',command:[process.execPath,'--no-warnings','digital-twin/tools/compiler/replay.mjs',path.relative(root,path.join(base,'compiled-graph.json')),'digital-twin/validation/m2/runtime-registry.json',path.relative(root,path.join(base,'fresh-replay.json'))],exitCode:result.status,graphRawSha256:fileHash(path.join(base,'compiled-graph.json')),registryRawSha256:fileHash(path.join(twin,'validation/m2/runtime-registry.json')),expectedRawSha256:fileHash(path.join(base,'expected-prefixes.json')),actualRawSha256:fileHash(path.join(base,'fresh-replay.json')),prefixes:fresh.prefixes.length,stepBoundaries:fresh.stepBoundaries.length});
 });
 test(variant+': complete inventory and owned/source conservation',()=>{
  const a=authoringInputs(),final=states.at(-1);assert.equal(final.instances.length,159);assert.equal(final.consumableLots.length,61);
  const installed=a.allocations.filter(a=>a.variantId===variant&&a.disposition==='plannedInstalled').map(a=>a.instanceId).sort();assert.deepEqual(final.instances.filter(i=>i.location==='assembly').map(i=>i.instanceId).sort(),installed);
  const printed=read(path.join(twin,'components/inventory/printed-hardware.json'));const defs=new Set(printed.rows.map(x=>x.definitionId));const hardware=graph.instances.filter(i=>defs.has(i.definitionId));assert.equal(hardware.length,113);assert.equal(hardware.filter(i=>final.instances.find(s=>s.instanceId===i.id).location==='backup').length,37);assert.equal(hardware.filter(i=>final.instances.find(s=>s.instanceId===i.id).location==='assembly').length,variant==='rpi-zero-2-w'?70:72);
  assert.equal(final.consumableAllocations.length,2);assert(final.consumableAllocations.every(a=>a.allocatedAmount.state==='unresolved'));for(const name of ['HOOK','LOOP'])assert.equal(final.instances.find(i=>i.instanceId==='PX-V40-INS-'+name+'-001').location,'accessory');
  for(const c of final.activeCableConnectionIds.map(id=>graph.cableConnections.find(c=>c.id===id)))assert.notEqual(c.purpose,'temporaryZeroing');assert.equal(final.activeCableConnectionIds.length,12);
  assert(!Object.hasOwn(final,'acknowledgments'));assert(!Object.hasOwn(final,'zeroingAttestations'));assert.equal(final.requiredConditionIds.length,13);
  output(variant+'/inventory-proof.json',{status:'PASS',physicalIdentities:159,lotIdentities:61,printedPrimary:76,printedBackup:37,printedTotal:113,installedPrinted:variant==='rpi-zero-2-w'?70:72,installedIds:installed,locationCounts:Object.fromEntries([...new Set(final.instances.map(i=>i.location))].sort().map(l=>[l,final.instances.filter(i=>i.location===l).length])),ownedElementCount:final.instances.reduce((n,i)=>n+i.ownedElementStates.length,0),allocations:final.consumableAllocations,quantitativeConsumables:'BLOCKED',observedPhysicalStock:'BLOCKED',finalCableConnections:final.activeCableConnectionIds,requiredConditionIds:final.requiredConditionIds});
 });
 test(variant+': grouped camera moves preserve connected ribbon, routing and members',()=>{
  for(let i=0;i<graph.operations.length;i++)if(graph.operations[i].kind==='moveSubassembly'){const b=states[i],a=states[i+1];canonical(b.activeCableConnectionIds,a.activeCableConnectionIds);canonical(b.cableRoutes,a.cableRoutes);canonical(b.subassemblies.map(g=>g.memberInstanceIds),a.subassemblies.map(g=>g.memberInstanceIds));}
 });
 test(variant+': typed unknown firewall and physical condition separation',()=>{
  for(const r of graph.verificationRules)assert.equal(ruleCapability(r,states.at(-1),inputs),'BLOCKED');
  for(const c of graph.cableConnections)assert.equal(c.pinMapping.state,'unresolved');for(const i of graph.initialState.instances)assert.equal(i.solutionRef.state,'unresolved');assert.equal(inputs.registry.conflicts.filter(c=>c.status==='open').length,2);
 });
}
test('compiler determinism under registry set ordering',()=>{const a=authoringInputs(),baseline=compileGraph(a,'rpi4',hash,validateShape);a.registry.definitions.reverse();a.registry.interfaces.reverse();a.initialStates[0].instances.reverse();assert.equal(compileGraph(a,'rpi4',hash,validateShape).graph.graphHash,baseline.graph.graphHash);});
test('serialized fixtures cover every source-used tag',()=>{output('operation-corpus.json',{status:'PASS',operations:corpus,coverage});output('operation-fixtures.json',[...fixtures.values()]);assert.equal(corpus.length,564);assert.equal(coverage.reduce((n,c)=>n+c.stepBoundaries,0),87);});
