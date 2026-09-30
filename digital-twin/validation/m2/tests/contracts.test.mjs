import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import Ajv from 'ajv/dist/2020.js';
import {twin,root} from '../../../tools/evidence/semantic.mjs';
import {read,jcs,H,fileHash} from '../../../tools/evidence/hash.mjs';
import {hash} from '../../../tools/compiler/hash.mjs';
import {authoringInputs} from '../../../tools/compiler/inputs.mjs';
import {compileGraph} from '../../../../picarx-companion/src/domain/assembly/compiler.ts';
import {validateShape} from '../../../tools/evidence/semantic.mjs';
const variants=['rpi4','rpi5','rpi-zero-2-w'],seed=read(path.join(twin,'components/inventory/planning-steps.json')).steps;
const schema=read(path.join(twin,'schemas/m2-search-index.schema.json')),validate=new Ajv({strict:false}).compile(schema);
for(const variant of variants){
 const dir=path.join(twin,'validation/m2',variant),graph=read(path.join(dir,'compiled-graph.json')),input=read(path.join(dir,'graph-input.json')),registry=read(path.join(twin,'validation/m2/runtime-registry.json'));
 test(variant+': graph preimage contains complete canonical values and excludes exactly four initial hash fields',()=>{
  assert.equal(hash('graph',input),graph.graphHash);assert.equal(input.registry.definitions.length,61);assert.equal(input.registry.measurements.length,118);assert.equal(input.initialState.instances.length,159);assert.equal(input.initialState.consumableLots.length,61);
  for(const k of ['graphHash','modelHash','stateHash','stockDispositionHash'])assert(!Object.hasOwn(input.initialState,k));for(const k of Object.keys(graph.initialState).filter(k=>!['graphHash','modelHash','stateHash','stockDispositionHash'].includes(k)))assert(Object.hasOwn(input.initialState,k));
  assert(!Object.hasOwn(input.registry,'modelHash'));assert(!Object.hasOwn(input.registry,'cameras'));assert(!Object.hasOwn(input.registry,'visibility'));assert(!input.registry.definitions.some(d=>Object.hasOwn(d,'appearanceRefs')));assert.equal(input.sourceIntents.length,29);
  assert.equal(input.semanticContract.descriptor.installationLocationRevision.rawSha256,fileHash(path.join(root,'docs/digital-twin/SEMANTIC_LOCATION_REVISION.md')));
 });
 test(variant+': complete 29-step orientation/tools/procedure/source binding',()=>{
  for(const s of graph.steps){const source=seed[s.printedNumber-1];assert.equal(s.title,source.title);assert.equal(s.sourcePanel,source.sourcePanel);assert(s.sourceRefs.includes(source.evidenceRef));assert.equal(registry.warnings.find(w=>w.id==='PX-V40-WARN-STEP-'+String(s.printedNumber).padStart(2,'0')).text,source.orientation);assert.equal(input.sourceIntents[s.printedNumber-1].motionIntent,source.motionIntent);assert(s.operationIds.length>0);assert(s.blockerIds.length>0);for(const id of s.toolRequirementIds)assert(registry.tools.some(t=>t.id===id));}
  if(variant==='rpi-zero-2-w'){assert(graph.steps[3].blockerIds.includes('Q-14'));assert(graph.steps[3].warningIds.includes('PX-V40-WARN-ZERO2W-HEADER'));assert.equal(graph.initialState.instances.find(i=>i.instanceId==='PX-V40-INS-USB-MICROPHONE-001').location,'accessory');}
 });
 test(variant+': closed additive step and part search destination contract',()=>{
  const index=read(path.join(dir,'search-index.json'));assert(validate(index),JSON.stringify(validate.errors));assert.equal(index.graphHash,graph.graphHash);assert.equal(index.variantId,variant);assert.equal(index.results.length,188);assert.equal(new Set(index.results.map(r=>r.id)).size,188);
  const steps=index.results.filter(r=>r.kind==='assemblyStep'),parts=index.results.filter(r=>r.kind==='assemblyPart');assert.equal(steps.length,29);assert.equal(parts.length,159);
  for(const r of steps){assert.equal(r.destination.stepId,r.id);assert.equal(r.destination.variantId,variant);assert(graph.steps.some(s=>s.id===r.id&&s.printedNumber===r.printedNumber));}
  for(const r of parts){assert.equal(r.destination.instanceId,r.id);assert.equal(r.destination.variantId,variant);assert(graph.instances.some(i=>i.id===r.id&&i.definitionId===r.definitionId));for(const id of r.stepRefs)assert(graph.steps.some(s=>s.id===id));}
  for(const r of index.results)for(const id of r.sourceRefs)assert(registry.evidence.some(e=>e.id===id));const mutant=structuredClone(index);mutant.results[0].destination.instanceId=parts[0].id;assert.equal(validate(mutant),false);
 });
}
test('contract owner text is exactly bound; original audited contract unchanged',()=>{const source=fs.readFileSync(path.join(root,'docs/digital-twin/SEMANTIC_LOCATION_REVISION.md'),'utf8');assert(source.includes('It is a prospective semantic revision'));assert(source.includes('Use existing explicit payload IDs and parentAssignments'));const baseline=read(path.join(root,'docs/implementation/M1_G_DATA_REPORT.json'));const b=baseline.bindings.find(b=>b.path==='docs/digital-twin/SEMANTIC_CONTRACT.md');assert.equal(fileHash(path.join(root,b.path)),b.rawSha256);});
test('normative value changes invalidate graph; appearance labels remain excluded',()=>{const a=authoringInputs(),g=compileGraph(a,'rpi4',hash,validateShape).graph;a.registry.definitions[0].name+=' display label';assert.equal(compileGraph(a,'rpi4',hash,validateShape).graph.graphHash,g.graphHash);for(const i of a.initialStates[0].instances)i.ownedElementStates.reverse();a.steps[27].warningIds.reverse();assert.equal(compileGraph(a,'rpi4',hash,validateShape).graph.graphHash,g.graphHash);a.registry.warnings[0].text+=' revised warning';assert.notEqual(compileGraph(a,'rpi4',hash,validateShape).graph.graphHash,g.graphHash);});
test('stock and state preimages distinguish every serialized mutable surface',()=>{const graph=read(path.join(twin,'validation/m2/rpi4/compiled-graph.json'));const s=structuredClone(graph.initialState);const {stateHash,...payload}=s;assert.equal(hash('state',payload),stateHash);const stock={instances:s.instances.map(({instanceId,location,parentAssemblyId,activeOwnedElements,ownedElementStates})=>({instanceId,location,parentAssemblyId,activeOwnedElements,ownedElementStates})),consumableLots:s.consumableLots,consumableAllocations:s.consumableAllocations};assert.equal(hash('stock',stock),s.stockDispositionHash);stock.instances[0].location='tray';assert.notEqual(hash('stock',stock),s.stockDispositionHash);payload.requiredConditionIds=['TEST-RULE-CONDITION'];assert.notEqual(H('state',payload),stateHash);});
