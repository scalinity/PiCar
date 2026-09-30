import fs from 'node:fs';
import path from 'node:path';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { read, assertFinite, fileHash, jcs, sortedRecords } from './hash.mjs';
export const root = new URL('../../../', import.meta.url).pathname;
export const twin = path.join(root, 'digital-twin');
const schema = read(path.join(twin,'schemas/digital-twin.schema.json'));
const ajv = new Ajv2020({ strict: false, allErrors: true });
addFormats(ajv);
ajv.addSchema(schema);
ajv.addSchema(read(path.join(twin,'schemas/m1-inventory.schema.json')));
const validators = new Map();
export function validateShape(type, record) {
  assertFinite(record);
  if (!validators.has(type)) validators.set(type, ['InventoryLot','PlannedAllocation','PlanningUse'].includes(type) ? ajv.compile({$ref:'https://picar.local/spec/v2/m1-inventory.schema.json#/$defs/'+type}) : ajv.compile({$schema:schema.$schema,$defs:schema.$defs,$ref:'#/$defs/'+type}));
  const validate=validators.get(type);
  if (!validate(record)) throw Error('SCHEMA_'+type+': '+ajv.errorsText(validate.errors));
}
export const familyTypes = {
 evidence:'EvidenceRecord',claims:'Claim',definitions:'PartDefinition',instances:'PartInstance',measurements:'Measurement',interfaces:'MechanicalInterface',connectionPoints:'ConnectionPoint',fastenerDefinitions:'FastenerDefinition',cableDefinitions:'CableDefinition',derivations:'DerivationRecord',conflicts:'ConflictRecord',geometrySources:'GeometrySource',frames:'FrameRecord',tools:'ToolRequirement',warnings:'Warning',variants:'VariantRule',unresolvedItems:'UnresolvedEvidenceItem',verificationRules:'VerificationRule',lots:'InventoryLot',allocations:'PlannedAllocation',plannedUses:'PlanningUse'
};
const refs = {
 evidenceRefs:['EvidenceRecord'],sourceRefs:['EvidenceRecord'],resolutionEvidenceRefs:['EvidenceRecord'],inputClaimIds:['Claim'],identityClaimId:['Claim'],connectorIdentityClaimId:['Claim'],boardIdentityClaimIds:['Claim'],designationClaimId:['Claim'],materialClaimRef:['Claim'],threadFormRef:['Claim'],keyingClaimIds:['Claim'],netClaimIds:['Claim'],sizeClaimRef:['Claim'],claimIds:['Claim'],definitionId:['PartDefinition'],partDefinitionId:['PartDefinition'],geometrySourceRefs:['GeometrySource'],measurementRefs:['Measurement'],inputMeasurementIds:['Measurement'],outputMeasurementId:['Measurement'],derivationRef:['DerivationRecord'],interfaceRefs:['MechanicalInterface'],connectionPointRefs:['ConnectionPoint'],conflictIds:['ConflictRecord'],blockerIds:['UnresolvedEvidenceItem'],inventoryLotId:['InventoryLot'],useId:['PlanningUse'],instanceId:['PartInstance'],ownerInstanceRef:['PartInstance'],installedByOperationRef:['AssemblyOperation'],datumRef:['FrameRecord'],diameterRef:['Measurement'],lengthRef:['Measurement'],pitchRef:['Measurement'],widthRef:['Measurement'],thicknessRef:['Measurement'],minimumBendRadiusRef:['Measurement'],headStandardRef:['Claim'],driveStandardRef:['Claim'],gripRangeRefs:['Measurement'],toleranceRefs:['Measurement'],toleranceRef:['Measurement'],endpointConnectorRefs:['ConnectionPoint'],routingGuideRefs:['MechanicalInterface'],matingRuleIds:['VerificationRule'],strainReliefRuleIds:['VerificationRule'],applicabilityRuleIds:['VerificationRule'],forbiddenCombinationRuleIds:['VerificationRule'],triggerRuleIds:['VerificationRule'],operationIds:['AssemblyOperation'],affectedFeatureIds:['MechanicalInterface','ConnectionPoint','Measurement'],affectedStepIds:['PlanningStep'],sourceLotId:['InventoryLot'],stepId:['PlanningStep'],supersedes:[],subjectId:['PartDefinition','PartInstance','MechanicalInterface','ConnectionPoint','InventoryLot','PlanningStep'],appearanceRefs:['AppearanceContract'],validationReportIds:['ReportContract'],evidenceRequirementIds:['Claim','EvidenceRecord','UnresolvedEvidenceItem'],invalidationDependencyIds:[],requiredFeatureIds:['MechanicalInterface','ConnectionPoint'],eligibilityRuleIds:['VerificationRule']
};
export function loadRegistry() {
 const index=read(path.join(twin,'components/inventory/registry-index.json'));
 return Object.fromEntries(Object.entries(index.families).map(([family,p])=>[family,read(path.join(twin,p))]));
}
export function typedIndex(registry, steps=[]) {
 const index=new Map();
 const add=(id,type,record)=>{if(index.has(id))throw Error('DUPLICATE_ID: '+id);if(!/^(?:PX|TEST|Q|G|AC)-[A-Z0-9]+(?:-[A-Z0-9]+)*$/.test(id))throw Error('INVALID_ID: '+id);index.set(id,{type,record});};
 for(const [family,records]of Object.entries(registry)){
  if(!familyTypes[family])throw Error('UNCLASSIFIED_FAMILY: '+family);
  for(const r of records){if(r.id)add(r.id,familyTypes[family],r);if(family==='definitions')for(const e of r.ownedElements)add(e.id,'OwnedElement',e);}
 }
 for(const s of steps)add(s.id,'PlanningStep',s);
 return index;
}
export function frameCheck(frame){const q=frame.rotationXYZW??frame.quaternionXYZW;if(q&&Math.abs(q.reduce((s,n)=>s+n*n,0)-1)>1e-10)throw Error('NON_UNIT_QUATERNION');}
export function endpointCheck(endpoint,index) {
 if(!endpoint || !endpoint.instanceId || !endpoint.interfaceId)throw Error('AMBIGUOUS_PHYSICAL_ENDPOINT');
 const i=index.get(endpoint.instanceId),f=index.get(endpoint.interfaceId);
 if(!i||!f)throw Error('UNKNOWN_REFERENCE');
 if(i.type!=='PartInstance'||f.type!=='MechanicalInterface')throw Error('REFERENCE_TYPE');
 if(i.record.definitionId!==f.record.definitionId)throw Error('INTERFACE_OWNER_MISMATCH');
}
export function patchCheck(patch,base) {
 const pos=patch.replaceOperationIds.map(id=>base.indexOf(id));
 if(!pos.length||pos[0]<0||pos.some((p,i)=>p!==pos[0]+i))throw Error('NONCONTIGUOUS_PATCH');
 if(patch.activeInstanceIds.some(i=>patch.inactiveInstanceIds.includes(i)))throw Error('VARIANT_OVERLAP');
}
export function closure(edges,roots) {
 const seen=new Set(),pending=[...roots];
 while(pending.length){const id=pending.pop();if(!seen.has(id)){seen.add(id);pending.push(...(edges[id]??[]));}}
 return [...seen].sort();
}
export function acyclic(edges,code='DEPENDENCY_CYCLE') {
 const done=new Set(),active=new Set();
 const walk=k=>{if(active.has(k))throw Error(code);if(done.has(k))return;active.add(k);for(const dep of edges[k]??[]){if(!(dep in edges))throw Error('UNKNOWN_HASH_DEPENDENCY');walk(dep);}active.delete(k);done.add(k);};
 for(const k of Object.keys(edges))walk(k);
}
export function ruleCheck(rule,index) {
 const table={
 presence:[['projection'],'boolean','equals',['PartInstance','PartDefinition']],identity:[['projection','engineering'],'idSet','setEqual',['PartDefinition','PartInstance']],orientation:[['engineering'],'reference','equals',['MechanicalInterface','MechanicalConnection']],quantity:[['projection','engineering'],'numeric','equals',['InventoryLot','AllocationScope']],mateResidual:[['engineering'],'numeric','lessOrEqual',['EngineeringCheck']],clearance:[['engineering'],'numeric','greaterOrEqual',['EngineeringCheck']],sourceApplicability:[['engineering'],'claimScope','sourceSupported',['Claim']],zeroingAcknowledgment:[['physicalCommand'],'boolean','allTrue',['PartInstance']],powerAcknowledgment:[['physicalCommand'],'boolean','allTrue',['PartInstance','AssemblyOperation']],cableEndpoint:[['projection','engineering'],'idSet','setEqual',['CableConnection']],inventoryConservation:[['projection','engineering'],'boolean','allTrue',['InventoryLot','AllocationScope']],observationResidual:[['observation'],'numeric','lessOrEqual',['ObservationContract']]
 };
 const t=table[rule.predicate];
 if(!t||rule.predicateVersion!==1||!t[0].includes(rule.evaluationPhase)||rule.expected.kind!==t[1]||rule.comparator!==t[2])throw Error('RULE_OPERAND_COMPARATOR_PHASE');
 for(const id of rule.targetIds){const r=index.get(id);if(!r)throw Error('UNKNOWN_REFERENCE');if(!t[3].includes(r.type))throw Error('RULE_TARGET_TYPE');}
 if(t[1]==='numeric'){
  const v=rule.expected.value;
  if(rule.predicate==='quantity'&&v.unit!=='count'||rule.predicate==='clearance'&&v.unit!=='mm'||['mateResidual','observationResidual'].includes(rule.predicate)&&!['mm','rad'].includes(v.unit))throw Error('RULE_UNIT');
 }
 if(['zeroingAcknowledgment','powerAcknowledgment','inventoryConservation'].includes(rule.predicate)&&rule.expected.value!==true)throw Error('RULE_BOOLEAN_TRUE');
 if(rule.predicate==='orientation'){
  const ref=rule.expected.reference;if(ref.state==='known'&&index.get(ref.ref)?.type!=='FrameRecord')throw Error('RULE_FRAME_TYPE');
  if(rule.toleranceRef.state==='notApplicable')throw Error('RULE_ORIENTATION_TOLERANCE');
 }
 if(rule.expected.kind==='idSet')for(const id of rule.expected.ids){const r=index.get(id);if(!r)throw Error('UNKNOWN_REFERENCE');if(rule.predicate==='cableEndpoint'&&r.type!=='CableConnection')throw Error('RULE_EXPECTED_TYPE');}
}
export function validateRegistry(registry,{steps=[],artifacts=true}={}) {
 const descriptor=read(path.join(twin,'schemas/semantic-registry.json'));
 if(descriptor.semanticVersion===2){
  const revision=descriptor.installationLocationRevision;
  if(revision?.id!=='PX-V40-CONTRACT-LOCATION-01'||revision.path!=='docs/digital-twin/SEMANTIC_LOCATION_REVISION.md'||fileHash(path.join(root,revision.path))!==revision.rawSha256)throw Error('SEMANTIC_REVISION_BINDING');
 }else if(descriptor.semanticVersion!==1)throw Error('UNSUPPORTED_SEMANTIC_VERSION');
 const index=typedIndex(registry,steps);const edges=Object.fromEntries([...index.keys()].map(k=>[k,[]]));let referenceCount=0;
 const resolve=(id,allowed,owner)=>{const r=index.get(id);if(!r)throw Error('UNKNOWN_REFERENCE: '+id);if(allowed?.length&&!allowed.includes(r.type))throw Error('REFERENCE_TYPE: '+id+' expected '+allowed.join('/'));edges[id].push(owner);referenceCount++;return r.record;};
 const walk=(r,owner,type,key='')=>{
  if(Array.isArray(r)){for(const x of r)walk(x,owner,type,key);return;}
  if(!r||typeof r!=='object')return;
  frameCheck(r);
  if(r.state==='known'&&r.unit){validateShape('NumericValue',r);if(r.confidence==='DERIVED')resolve(r.derivationRef,['DerivationRecord'],owner);}
  if(r.state==='unresolved'&&r.unit)validateShape('NumericValue',r);
  if(artifacts&&r.state==='available'&&r.path){const p=path.resolve(root,r.path);if(!fs.existsSync(p))throw Error('ARTIFACT_MISSING: '+r.path);if(!p.startsWith(root)||fs.lstatSync(p).isSymbolicLink())throw Error('ARTIFACT_PATH');if(fileHash(p)!==r.sha256||fs.statSync(p).size!==r.byteLength)throw Error('ARTIFACT_HASH: '+r.path);}
  for(const [k,v]of Object.entries(r)){
   if(k==='supersedes'){for(const id of v)resolve(id,[type],owner);}
   else if(k in refs){const allowed=refs[k];if(typeof v==='string')resolve(v,allowed,owner);else if(Array.isArray(v))for(const id of v)resolve(id,allowed,owner);else if(v?.state==='known')resolve(v.ref,allowed,owner);}
   else if(k==='resolution'&&v.state==='known')resolve(v.ref,['Claim'],owner);
   walk(v,owner,type,k);
  }
 };
 for(const [family,records]of Object.entries(registry)){
  const type=familyTypes[family];
  if(['FastenerDefinition','CableDefinition'].includes(type)&&new Set(records.map(r=>r.partDefinitionId)).size!==records.length)throw Error('DUPLICATE_SUBTYPE_DEFINITION');
  for(const r of records){
   validateShape(type,r);
   walk(r,r.id??r.partDefinitionId??r.instanceId,type);
   if(type==='PartInstance'){
    const def=index.get(r.definitionId).record;
    if(r.definitionRevision!==def.revision||r.variantIds.some(v=>!def.variantIds.includes(v)))throw Error('INSTANCE_DEFINITION_COMPATIBILITY');
    if(r.ownerInstanceRef.state==='known')throw Error('OWNED_STOCK_DOUBLE_COUNT');
   }
   if(['MechanicalInterface','ConnectionPoint','Measurement'].includes(type)&&r.definitionId){const d=index.get(r.definitionId).record;const field=type==='MechanicalInterface'?'interfaceRefs':type==='ConnectionPoint'?'connectionPointRefs':'measurementRefs';if(!d[field].includes(r.id))throw Error('DEFINITION_FEATURE_OWNERSHIP');}
   if(type==='Measurement' && index.get(r.subjectId)?.type==='PartDefinition' && !index.get(r.subjectId).record.measurementRefs.includes(r.id))throw Error('DEFINITION_FEATURE_OWNERSHIP');
   if(type==='FastenerDefinition' && !['screw','nut','washer','standoff','rivet'].includes(index.get(r.partDefinitionId).record.componentClass))throw Error('FASTENER_DEFINITION_TYPE');
   if(type==='CableDefinition'){
    const d=index.get(r.partDefinitionId).record;
    if(r.ownership==='loose'&&d.componentClass!=='cable'||r.ownership==='integral'&&!d.ownedElements.some(e=>e.kind==='integralLead'&&!e.inventoryCountedSeparately))throw Error('CABLE_DEFINITION_TYPE');
    if(r.endpointConnectorRefs.some(id=>index.get(id).record.definitionId!==d.id))throw Error('CABLE_ENDPOINT_OWNER');
   }
   if(type==='Claim'){
    const sources=r.evidenceRefs.map(id=>index.get(id).record);
    if(r.confidence==='VERIFIED'&&!sources.length)throw Error('VERIFIED_EVIDENCE');
    if(r.confidence==='VERIFIED')for(const e of sources){
     if(e.artifact.state!=='available')throw Error('VERIFIED_ARTIFACT_UNAVAILABLE');
     if(['printedDesignation','printedInventory','procedure'].includes(r.scope)&&!e.applicability.includes(r.scope)&&!e.applicability.includes('documentaryTranscription'))throw Error('EVIDENCE_APPLICABILITY');
     if(['identity','nominalEngineering','asBuilt'].includes(r.scope)&&(!e.applicability.includes(r.subjectId)||e.engineeringUse!=='authoritativeNominal'))throw Error('SOURCE_SCOPE_PROMOTION');
    }
    for(const e of sources)for(const l of e.limitations)if(!r.sourceLimitations.includes(l))throw Error('SOURCE_LIMITATION_DROPPED');
    for(const cid of r.inputClaimIds){const input=index.get(cid).record;for(const l of input.sourceLimitations)if(!r.sourceLimitations.includes(l))throw Error('SOURCE_LIMITATION_DROPPED');if(r.confidence==='VERIFIED'&&['PROBABLE','UNRESOLVED'].includes(input.confidence))throw Error('CONFIDENCE_PROMOTION');}
    if(r.scope==='nominalEngineering'&&r.inputClaimIds.some(id=>['referenceApproximation','printedDesignation','printedInventory','appearance'].includes(index.get(id).record.scope)))throw Error('SOURCE_SCOPE_PROMOTION');
   }
   if(type==='Measurement'&&r.value.state==='known'){
    if(r.value.confidence==='VERIFIED' && r.value.unit==='count')for(const id of r.value.evidenceRefs){const e=index.get(id).record;if(e.artifact.state!=='available'||!e.applicability.includes('printedInventory'))throw Error('NUMERIC_EVIDENCE_APPLICABILITY');}
    if(r.value.confidence==='VERIFIED'&&r.value.unit!=='count')for(const id of r.value.evidenceRefs){const e=index.get(id).record;if(e.artifact.state!=='available'||e.engineeringUse!=='authoritativeNominal'||!e.applicability.includes(r.subjectId)||!e.applicability.includes('nominalEngineering'))throw Error('SOURCE_SCOPE_PROMOTION');}
    if(r.kind==='derived'&&r.value.confidence!=='DERIVED')throw Error('DERIVED_CONFIDENCE');
    if(r.value.confidence==='DERIVED'){
     const d=index.get(r.value.derivationRef).record;
     if(d.outputMeasurementId!==r.id||d.subjectId!==r.subjectId||d.feature!==r.feature)throw Error('DERIVATION_OUTPUT');
    }
   }
   if(type==='ConflictRecord'){
    if(r.status==='open'&&r.resolution.state!=='unresolved'||r.status==='resolved'&&r.resolution.state!=='known')throw Error('CONFLICT_RESOLUTION_SHAPE');
    for(const id of r.claimIds){const c=index.get(id).record;if(c.subjectId!==r.subjectId||c.property!==r.property||!c.conflictIds.includes(r.id))throw Error('CONFLICT_CLAIM_CLOSURE');}
    if(r.status==='resolved'){const c=index.get(r.resolution.ref).record;if(!r.claimIds.every(id=>c.inputClaimIds.includes(id))||!c.method||!c.conflictIds.includes(r.id)||c.confidence!=='VERIFIED')throw Error('CONFLICT_RESOLUTION_RATIONALE');}
   }
   if(type==='VerificationRule')ruleCheck(r,index);
   if(type==='VariantRule'){
    const seen=new Set();for(const p of r.patches){if(seen.has(p.stepId))throw Error('OVERLAPPING_VARIANT_PATCH');seen.add(p.stepId);}
    seen.clear();for(const p of r.patches){if(p.variantId!==r.variantId)throw Error('VARIANT_PATCH_OWNER');if(seen.has(p.stepId))throw Error('OVERLAPPING_VARIANT_PATCH');seen.add(p.stepId);const step=index.get(p.stepId)?.record;if(!step?.operationIds)throw Error('PATCH_BASE_UNAVAILABLE');patchCheck(p,step.operationIds);}
   }
   if(type==='GeometrySource'&&r.maturity!=='RECORDED'&&r.representation==='unresolved')throw Error('MATURITY_WITHOUT_GEOMETRY');
  }
 }
 // Numeric derivations are executable only through pinned immutable method bytes.
 for(const d of registry.derivations){
  if(d.methodArtifact.state!=='available')throw Error('DERIVATION_METHOD_UNRESOLVED');
  if(d.method!=='sum-v1')throw Error('DERIVATION_METHOD_UNSUPPORTED');
  const output=index.get(d.outputMeasurementId)?.record;const inputs=d.inputMeasurementIds.map(id=>index.get(id)?.record);
  if(!inputs.length||inputs.some(m=>!m||m.value.state!=='known'))throw Error('DERIVATION_INPUT_UNRESOLVED');
  if(d.methodArtifact.sha256!==fileHash(path.join(twin,'tools/evidence/sum-v1.json')))throw Error('DERIVATION_METHOD_HASH');
  if(inputs.some(m=>m.value.unit!==output.value.unit))throw Error('DERIVATION_UNIT');
  const value=inputs.reduce((s,m)=>s+m.value.value,0);
  const bounded=inputs.every(m=>m.value.uncertainty.state==='bounded');
  const uncertainty=bounded?{state:'bounded',minus:inputs.reduce((s,m)=>s+m.value.uncertainty.minus,0),plus:inputs.reduce((s,m)=>s+m.value.uncertainty.plus,0)}:{state:'unresolved',blockerIds:[...new Set(inputs.flatMap(m=>m.value.uncertainty.blockerIds??[]))].sort()};
  if(value!==output.value.value||!jcs(uncertainty).equals(jcs(output.value.uncertainty)))throw Error('DERIVATION_REPRODUCTION');
  const limitations=new Set([...d.inputClaimIds,...inputs.flatMap(m=>m.inputClaimIds)].flatMap(id=>index.get(id).record.sourceLimitations));
  if([...limitations].some(l=>!d.sourceLimitations.includes(l)))throw Error('DERIVATION_LIMITATION_DROPPED');
 }
 const supersession=Object.fromEntries([...index].map(([id,{record}])=>[id,record.supersedes??[]]));acyclic(supersession,'SUPERSESSION_CYCLE');
 const allocations=registry.allocations??[],keys=new Set();
 for(const a of allocations){const key=a.variantId+'/'+a.instanceId;if(keys.has(key))throw Error('DUPLICATE_PHYSICAL_ALLOCATION');keys.add(key);if(!['rpi4','rpi5','rpi-zero-2-w'].includes(a.variantId))throw Error('INVALID_VARIANT');if(!['plannedInstalled','backup','variantUnused','accessory','tool','consumable','unresolved'].includes(a.disposition))throw Error('ALLOCATION_DISPOSITION');if(a.disposition==='plannedInstalled'&& !index.get(a.instanceId).record.variantIds.includes(a.variantId))throw Error('VARIANT_ALLOCATION');}
 for(const i of registry.instances)for(const v of ['rpi4','rpi5','rpi-zero-2-w'])if(!keys.has(v+'/'+i.id))throw Error('MISSING_VARIANT_DISPOSITION');
 for(const v of ['rpi4','rpi5','rpi-zero-2-w']){
  const key=v==='rpi4'?'RIBBON-FFC':'RIBBON-FPC';
  const ribbons=registry.allocations.filter(a=>a.variantId===v&&a.disposition==='plannedInstalled'&&index.get(a.instanceId).record.definitionId.includes('-DEF-RIBBON-'));
  if(ribbons.length!==1||!index.get(ribbons[0].instanceId).record.definitionId.endsWith(key))throw Error('SOURCE_RIBBON_VARIANT');
 }
 for(const a of allocations)if(a.stepId){edges[a.instanceId].push(a.stepId);if(a.useId)edges[a.useId].push(a.stepId);}
 return {index,referenceCount,edges,supersessionImpact:Object.fromEntries([...index].filter(([,x])=>x.record.supersedes?.length).map(([id,x])=>[id,closure(edges,x.record.supersedes)]))};
}
export function inventoryCheck(registry,ledger) {
 const used=new Set();const index=typedIndex(registry);
 for(const row of ledger.rows){
  if(row.printedTotal!==row.printedPrimary+row.printedBackup||row.instanceIds.length!==row.printedTotal)throw Error('PRINTED_ARITHMETIC');
  if(new Set(row.instanceIds).size!==row.instanceIds.length)throw Error('DUPLICATE_PHYSICAL_ALLOCATION');
  if(row.observedPhysicalStock.state!=='unresolved')throw Error('PRINTED_AS_OBSERVED');
  for(const v of ['rpi4','rpi5','rpi-zero-2-w']){
   const uses=row.plannedAllocations[v];if(uses.length!==row.plannedUse[v]||uses.length>row.printedPrimary)throw Error('PLANNED_USE_ARITHMETIC');
   for(const u of uses){const key=v+'/'+u.instanceId;if(used.has(key))throw Error('ONE_SCREW_TWO_USES');used.add(key);if(!row.instanceIds.slice(0,row.printedPrimary).includes(u.instanceId)||index.get(u.instanceId)?.record.definitionId!==row.definitionId)throw Error('STOCK_ALLOCATION_OWNER');}
   for(const id of row.instanceIds){const a=registry.allocations.find(x=>x.instanceId===id&&x.variantId===v);const ordinal=row.instanceIds.indexOf(id);const expected=ordinal>=row.printedPrimary?'backup':uses.some(u=>u.instanceId===id)?'plannedInstalled':'variantUnused';if(!a||a.disposition!==expected||a.stepId!==(uses.find(u=>u.instanceId===id)?.stepId??null))throw Error('STOCK_DISPOSITION');}
  }
 }
 return {rows:ledger.rows.length,printedStock:ledger.rows.reduce((s,r)=>s+r.printedTotal,0),variants:['rpi4','rpi5','rpi-zero-2-w'].map(variantId=>({variantId,plannedUse:ledger.rows.reduce((s,r)=>s+r.plannedUse[variantId],0),backup:ledger.rows.reduce((s,r)=>s+r.printedBackup,0),variantUnused:ledger.rows.reduce((s,r)=>s+r.printedPrimary-r.plannedUse[variantId],0)})),observedPhysicalStock:{status:'BLOCKED',reason:'NOT OBSERVED',blockerIds:['Q-01','Q-13']}};
}
// M1 checks scoped attestation data only; no persistence, consumption or epoch mutation.
export function attestationCheck(record,type,expectedScope){
 validateShape(type,record);
 if(!Number.isFinite(Date.parse(record.createdAt)))throw Error('ATTESTATION_TIME');
 for(const key of ['sessionId','variantId','graphHash','modelHash','conditionRuleId','procedureRevisionHash','operationId'])if(record[key]!==expectedScope[key])throw Error('ATTESTATION_SCOPE');
 if(type==='ZeroingAttestation')for(const key of ['servoInstanceId','servoEpoch','validForOperationId'])if(record[key]!==expectedScope[key])throw Error('ATTESTATION_SERVO_SCOPE');
 if([...record.dependencyIds].sort().join(',')!==[...expectedScope.dependencyIds].sort().join(','))throw Error('ATTESTATION_DEPENDENCY_SCOPE');
}
