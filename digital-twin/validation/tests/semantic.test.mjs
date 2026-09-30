import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import fs from 'node:fs';
import { loadRegistry,validateRegistry,validateShape,typedIndex,endpointCheck,patchCheck,ruleCheck,inventoryCheck,closure,root,twin } from '../../tools/evidence/semantic.mjs';
import { read,fileHash,H } from '../../tools/evidence/hash.mjs';
import { identities,createHashPolicy,validateHashInputs } from '../../tools/evidence/identity.mjs';
const reg=loadRegistry(),steps=read(path.join(twin,'components/inventory/planning-steps.json')).steps;
const ledger=read(path.join(twin,'components/inventory/printed-hardware.json'));
const validate=r=>validateRegistry(r,{steps,artifacts:false});
const mutant=(name,edit,reason)=>test('negative: '+name,()=>{const r=structuredClone(reg);edit(r);assert.throws(()=>validate(r),new RegExp(reason));});
const unknown=()=>({state:'unresolved',unit:'mm',confidence:'UNRESOLVED',blockerIds:['Q-06']});
for(const [name,value,reason]of [
 ['unknown numeric with payload',{...unknown(),value:1},'additional properties'],
 ['unresolved numeric wrong confidence',{...unknown(),confidence:'PROBABLE'},'constant'],
 ['known numeric unresolved confidence',{state:'known',unit:'mm',value:1,confidence:'UNRESOLVED',evidenceRefs:['PX-EV-PHOTO-03'],uncertainty:{state:'bounded',minus:0,plus:0}},'allowed values'],
])test('negative: '+name,()=>assert.throws(()=>validateShape('NumericValue',value),new RegExp(reason)));
mutant('VERIFIED claim without evidence',r=>r.claims[0].evidenceRefs=[], 'SCHEMA_Claim.*evidenceRefs');
mutant('unknown reference',r=>r.definitions[0].identityClaimId='TEST-MISSING','UNKNOWN_REFERENCE');
mutant('wrong reference type',r=>r.definitions[0].identityClaimId=r.evidence[0].id,'REFERENCE_TYPE');
mutant('duplicate stable ID',r=>r.definitions.push(structuredClone(r.definitions[0])),'DUPLICATE_ID');
mutant('DERIVED numeric without record',r=>r.measurements.find(m=>m.kind==='derived').value.derivationRef='TEST-MISSING','UNKNOWN_REFERENCE');
mutant('derivation unresolved method artifact',r=>r.derivations[0].methodArtifact={state:'unresolved',blockerIds:['Q-13']},'DERIVATION_METHOD_UNRESOLVED');
mutant('derivation unsupported method',r=>r.derivations[0].method='free-notes','DERIVATION_METHOD_UNSUPPORTED');
mutant('derivation changed immutable method hash',r=>r.derivations[0].methodArtifact.sha256='a'.repeat(64),'DERIVATION_METHOD_HASH');
mutant('derivation reproduction mismatch',r=>r.measurements.find(m=>m.kind==='derived').value.value++,'DERIVATION_REPRODUCTION');
mutant('derivation lost uncertainty',r=>r.measurements.find(m=>m.kind==='derived').value.uncertainty.plus=0.1,'DERIVATION_REPRODUCTION');
mutant('derivation incompatible units',r=>r.measurements.find(m=>m.kind==='derived').value.unit='mm','DERIVATION_UNIT');
mutant('derivation source limitation lost',r=>r.derivations[0].sourceLimitations=[],'DERIVATION_LIMITATION_DROPPED');
mutant('duplicate physical allocation',r=>r.allocations.push({...r.allocations[0]}),'DUPLICATE_PHYSICAL_ALLOCATION');
mutant('owned rivet pin double-counted as supplied stock',r=>{const rivet=r.instances.find(i=>i.definitionId.includes('R2048'));const owner=r.instances.find(i=>i.id!==rivet.id);rivet.ownerInstanceRef={state:'known',ref:owner.id};},'OWNED_STOCK_DOUBLE_COUNT');
mutant('invalid variant reference',r=>r.definitions[0].variantIds=['rpi3'],'SCHEMA_PartDefinition.*allowed values');
mutant('wrong definition revision',r=>r.instances[0].definitionRevision=2,'INSTANCE_DEFINITION_COMPATIBILITY');
mutant('probable generic HAT identity promoted without proof',r=>r.claims.find(c=>c.id==='PX-CLAIM-HAT-GENERIC-V4').confidence='VERIFIED','SOURCE_SCOPE_PROMOTION');
mutant('official reference approximation promoted to exact',r=>{const c=r.claims.find(c=>c.id==='PX-CLAIM-CAMERA-DIMENSIONS-1');c.scope='nominalEngineering';},'SOURCE_SCOPE_PROMOTION');
mutant('source limitations silently discarded',r=>r.claims[0].sourceLimitations=[],'SOURCE_LIMITATION_DROPPED');
mutant('open conflict treated as resolved',r=>r.conflicts[0].resolution={state:'known',ref:r.conflicts[0].claimIds[0]},'CONFLICT_RESOLUTION_SHAPE');
mutant('resolved conflict lacking resolution',r=>r.conflicts[0].status='resolved','CONFLICT_RESOLUTION_SHAPE');
mutant('resolved conflict loses competing claims',r=>{r.conflicts[0].status='resolved';r.conflicts[0].resolution={state:'known',ref:r.conflicts[0].claimIds[0]};},'CONFLICT_RESOLUTION_RATIONALE');
mutant('rule incompatible comparator',r=>r.verificationRules[0].comparator='setEqual','RULE_OPERAND_COMPARATOR_PHASE');
mutant('rule incompatible operand',r=>r.verificationRules[0].expected={kind:'boolean',value:true},'RULE_OPERAND_COMPARATOR_PHASE');
mutant('rule incompatible unit',r=>r.verificationRules[0].expected.value.unit='rad','RULE_UNIT');
mutant('rule incompatible phase',r=>r.verificationRules[0].evaluationPhase='physicalCommand','RULE_OPERAND_COMPARATOR_PHASE');
mutant('supersession deletes closure with dangling history',r=>r.claims[0].supersedes=['TEST-MISSING'],'UNKNOWN_REFERENCE');
mutant('supersession cycle',r=>{r.claims[0].supersedes=[r.claims[1].id];r.claims[1].supersedes=[r.claims[0].id];},'SUPERSESSION_CYCLE');
for(const [name,change,reason]of [
 ['one screw allocated to two final uses',l=>l.rows[0].plannedAllocations.rpi4[1].instanceId=l.rows[0].plannedAllocations.rpi4[0].instanceId,'ONE_SCREW_TWO_USES'],
 ['printed stock arithmetic mismatch',l=>l.rows[0].printedTotal++,'PRINTED_ARITHMETIC'],
 ['printed stock promoted to observed stock',l=>l.rows[0].observedPhysicalStock={state:'known',value:10},'PRINTED_AS_OBSERVED']
])test('negative: '+name,()=>{const l=structuredClone(ledger);change(l);assert.throws(()=>inventoryCheck(reg,l),new RegExp(reason));});
const ix=typedIndex(reg,steps),ins=reg.instances[0],iface=reg.interfaces.find(i=>i.definitionId===ins.definitionId);
test('positive: valid qualified instance endpoint',()=>endpointCheck({instanceId:ins.id,interfaceId:iface.id},ix));
test('negative: ambiguous bare interface for repeated instances',()=>assert.throws(()=>endpointCheck(iface.id,ix),/AMBIGUOUS_PHYSICAL_ENDPOINT/));
test('negative: wrong-definition qualified endpoint',()=>assert.throws(()=>endpointCheck({instanceId:ins.id,interfaceId:reg.interfaces.find(i=>i.definitionId!==ins.definitionId).id},ix),/INTERFACE_OWNER_MISMATCH/));
test('positive: contiguous VariantPatch',()=>patchCheck({replaceOperationIds:['TEST-A','TEST-B'],activeInstanceIds:['TEST-X'],inactiveInstanceIds:['TEST-Y']},['TEST-A','TEST-B','TEST-C']));
test('negative: discontiguous VariantPatch',()=>assert.throws(()=>patchCheck({replaceOperationIds:['TEST-A','TEST-C'],activeInstanceIds:[],inactiveInstanceIds:[]},['TEST-A','TEST-B','TEST-C']),/NONCONTIGUOUS_PATCH/));
test('negative: overlapping active/inactive VariantPatch',()=>assert.throws(()=>patchCheck({replaceOperationIds:['TEST-A'],activeInstanceIds:['TEST-X'],inactiveInstanceIds:['TEST-X']},['TEST-A']),/VARIANT_OVERLAP/));
for(const [name,family]of [['evidence record','evidence'],['PartDefinition','definitions'],['PartInstance','instances'],['printed designation','claims'],['open conflict','conflicts'],['derived measurement with reproducible method','derivations'],['cuttable consumable identity','lots'],['source-scoped inventory allocation','allocations'],['variant-scoped allocation','variants']])test('positive: '+name,()=>assert.ok(validate(reg)&&reg[family].length));
test('positive: unresolved measurement has no numeric payload',()=>{const m=reg.measurements.find(m=>m.value.state==='unresolved');validateShape('Measurement',m);assert.equal('value' in m.value,false);});
test('positive: owned subelements are not supplied stock',()=>{const d=reg.definitions.find(d=>d.componentClass==='rivet');assert.equal(d.ownedElements.length,2);assert.ok(d.ownedElements.every(e=>!e.inventoryCountedSeparately));});
test('positive: blocker graph link closes',()=>{const r=validate(reg);assert.ok(closure(r.edges,['Q-03']).some(id=>r.index.get(id)?.type==='PartDefinition'));});
test('positive: resolved conflict retains both source claims and rationale',()=>{const r=structuredClone(reg),c=r.conflicts[0];const base=r.claims.find(x=>x.id===c.claimIds[0]);const resolution={...base,id:'TEST-CLAIM-RESOLUTION',inputClaimIds:[...c.claimIds],statement:'Synthetic resolution fixture: both documentary statements remain reference approximations.',method:'Synthetic explicit source-scope resolution rationale'};r.claims.push(resolution);c.status='resolved';c.resolution={state:'known',ref:resolution.id};validate(r);assert.ok(c.claimIds.every(id=>r.claims.some(x=>x.id===id)));});
test('positive: known nominal synthetic measurement; no PiCar dimension',()=>{
 const r=structuredClone(reg),sourcePath=path.join(twin,'validation/fixtures/synthetic-nominal.json');
 const e={...r.evidence[0],id:'TEST-EV-NOMINAL',sourceKind:'derivedData',privacy:'private',engineeringUse:'authoritativeNominal',applicability:['TEST-DEF-NOMINAL','nominalEngineering'],limitations:['Synthetic fixture only; no PiCar geometry.'],artifact:{state:'available',path:'digital-twin/validation/fixtures/synthetic-nominal.json',sha256:fileHash(sourcePath),byteLength:fs.statSync(sourcePath).size,mediaType:'application/json'}};
 const c={...r.claims[0],id:'TEST-CLAIM-NOMINAL',subjectId:'TEST-DEF-NOMINAL',property:'geometry.length',scope:'nominalEngineering',statement:'TEST nominal toy length 10 mm plus/minus 0.1 mm.',evidenceRefs:[e.id],sourceLimitations:[...e.limitations]};
 const m={...r.measurements.find(m=>m.value.state==='unresolved'),id:'TEST-MEAS-NOMINAL',subjectId:c.subjectId,inputClaimIds:[c.id],value:{state:'known',value:10,unit:'mm',confidence:'VERIFIED',evidenceRefs:[e.id],uncertainty:{state:'bounded',minus:0.1,plus:0.1}}};
 const d={...r.definitions[0],id:c.subjectId,identityClaimId:c.id,measurementRefs:[m.id],interfaceRefs:[],connectionPointRefs:[],geometrySourceRefs:[],ownedElements:[]};
 r.evidence.push(e);r.claims.push(c);r.measurements.push(m);r.definitions.push(d);validateRegistry(r,{steps});
});
test('positive: supersession impact includes transitive dependents',()=>{const r=structuredClone(reg),old=r.claims[0],next={...old,id:'TEST-CLAIM-SUPERSEDING',supersedes:[old.id]};r.claims.push(next);const result=validate(r);assert.ok(result.supersessionImpact[next.id].includes(old.subjectId));});
test('positive: all 29 planning steps and three variants retained',()=>{assert.deepEqual(steps.map(s=>s.printedNumber),Array.from({length:29},(_,i)=>i+1));assert.deepEqual(reg.variants.map(v=>v.variantId),['rpi4','rpi5','rpi-zero-2-w']);});
test('positive: printed hardware arithmetic and separate physical BLOCKED',()=>assert.equal(inventoryCheck(reg,ledger).observedPhysicalStock.status,'BLOCKED'));
test('positive: mechanical input change deterministic, presentation alone excluded',()=>{const r=structuredClone(reg);r.definitions[0].name+=' cosmetic label';assert.equal(identities(r).modelHash,identities(reg).modelHash);r.definitions[0].revision++;assert.notEqual(identities(r).modelHash,identities(reg).modelHash);});
test('positive: process maturity never promotes identity confidence',()=>{const r=structuredClone(reg);r.geometrySources[0].maturity='CAD_CHECKED';assert.equal(r.claims[0].confidence,reg.claims[0].confidence);assert.equal(identities(r).modelHash,identities(reg).modelHash);});
for(const [name,edit,reason]of [
 ['unclassified hash input',p=>p.identities[0].sourceFiles.push('unknown.json'),'UNCLASSIFIED_HASH_INPUT'],
 ['hash input direct cycle',p=>p.identities[0].dependsOn=['schemaHash'],'HASH_INPUT_CYCLE'],
 ['hash input transitive cycle',p=>{p.identities[0].dependsOn=['modelHash'];p.identities[2].dependsOn=['schemaHash'];},'HASH_INPUT_CYCLE'],
 ['output as own input',p=>p.identities[2].sourceFiles.push(p.identities[2].outputPath),'OUTPUT_AS_OWN_INPUT'],
 ['downstream hash in upstream artifact',p=>p.identities[0].dependsOn=['meshHash'],'DOWNSTREAM_HASH_DEPENDENCY']
])test('negative: '+name,()=>{const p=createHashPolicy();edit(p);assert.throws(()=>validateHashInputs(p,{scan:false}),new RegExp(reason));});
mutant('wrong source-scoped ribbon variant rejected',r=>{const a=r.allocations.find(a=>a.variantId==='rpi5'&&a.disposition==='plannedInstalled'&&a.instanceId.includes('RIBBON-FPC'));a.disposition='variantUnused';},'SOURCE_RIBBON_VARIANT');
mutant('two patches overlap same variant and step',r=>{const p={id:'TEST-PATCH-A',variantId:'rpi4',stepId:steps[0].id,replaceOperationIds:['TEST-OP-A'],withOperationIds:[],activeInstanceIds:[],inactiveInstanceIds:[],connectionIds:[]};r.variants[0].patches=[p,{...p,id:'TEST-PATCH-B'}];},'OVERLAPPING_VARIANT_PATCH');
test('negative: missing immutable method bytes',()=>{const r=structuredClone(reg);r.derivations[0].methodArtifact.path='digital-twin/validation/fixtures/missing-method.json';assert.throws(()=>validateRegistry(r,{steps}),/ARTIFACT_MISSING/);});
test('positive: model-input canonicalization is independent of registry array order and set order',()=>{const r=structuredClone(reg);r.definitions.reverse();r.claims.reverse();r.definitions[0].variantIds.reverse();assert.equal(identities(r).modelHash,identities(reg).modelHash);});
test('positive: retrieval timestamps excluded from evidence identity',()=>{const r=structuredClone(reg);r.evidence[0].retrievedOn='2026-09-30';assert.equal(identities(r).evidenceHash,identities(reg).evidenceHash);r.evidence[0].revision+=' corrected';assert.notEqual(identities(r).evidenceHash,identities(reg).evidenceHash);});

mutant('duplicate fastener subtype definition',r=>r.fastenerDefinitions.push({...r.fastenerDefinitions[0]}),'DUPLICATE_SUBTYPE_DEFINITION');
mutant('duplicate cable subtype definition',r=>r.cableDefinitions.push({...r.cableDefinitions[0]}),'DUPLICATE_SUBTYPE_DEFINITION');
mutant('integrated cable misclassified as loose stock',r=>r.cableDefinitions.find(c=>c.ownership==='integral').ownership='loose','CABLE_DEFINITION_TYPE');
mutant('integrated cable endpoint on another owner',r=>r.cableDefinitions.find(c=>c.ownership==='integral').endpointConnectorRefs=[r.connectionPoints.find(c=>c.definitionId!==r.cableDefinitions.find(c=>c.ownership==='integral').partDefinitionId).id],'CABLE_ENDPOINT_OWNER');
test('positive: integrated lead has owner-bound endpoint without extra stock',()=>{for(const c of reg.cableDefinitions.filter(c=>c.ownership==='integral')){const d=reg.definitions.find(d=>d.id===c.partDefinitionId);assert.ok(d.ownedElements.some(e=>e.kind==='integralLead'&&!e.inventoryCountedSeparately));assert.ok(c.endpointConnectorRefs.every(id=>reg.connectionPoints.find(p=>p.id===id).definitionId===d.id));}validate(reg);});
mutant('VERIFIED metric source lacks subject applicability',r=>{const m=r.measurements.find(m=>m.value.state==='unresolved');m.value={state:'known',unit:'mm',value:10,confidence:'VERIFIED',evidenceRefs:['PX-EV-PHOTO-03'],uncertainty:{state:'bounded',minus:0,plus:0}};r.evidence.find(e=>e.id==='PX-EV-PHOTO-03').engineeringUse='authoritativeNominal';},'SOURCE_SCOPE_PROMOTION');
