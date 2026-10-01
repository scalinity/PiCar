// Owner-authorized additive presentation contract. Never a canonical registry writer.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import Ajv from 'ajv/dist/2020.js';
import {root,twin,loadRegistry} from './semantic.mjs';
import {read,fileHash,H} from './hash.mjs';
export const base=path.join(twin,'validation/expected/m5');
export const variants=['rpi4','rpi5','rpi-zero-2-w'];
export const mustNotDrive=['G-COMPONENT','engineeringMeasurement','engineeringInterface','engineeringRoute','engineeringSolver','G-CAD','G-GEOMETRY','manufacturing','physicalFit','torque','engagement','electricalVoltage','batterySafety','collisionGuarantee'];
export const recipes={
 screw:['diameter','length','headDiameter','headHeight'],standoff:['diameter','length','extensionDiameter','extensionLength'],
 washer:['outerDiameter','boreDiameter','thickness','gapWidth'],nut:['acrossFlats','boreDiameter','height'],
 rivet:['diameter','stemLength','headDiameter','headHeight','pinDiameter','pinLength','pinLift'],
 motor:['length','width','height','canLength','canRadius','shaftRadius','shaftExtension','shaftX'],
 servo:['length','width','height','tabLength','tabThickness','bossRadius','bossHeight','shaftRadius','shaftHeight','shaftX','holeRadius'],
 horn:['length','width','thickness','hubRadius','hubHeight','boreRadius','tipBoreRadius'],
 wheel:['radius','innerRadius','width','hubRadius','boreRadius','spokeCount','spokeWidth'],
 board:['length','width','thickness','holeRadius','mountX','mountY','mountOffset','portHeight','headerHeight'],
 hat:['length','width','thickness','speakerRadius','speakerHeight','connectorHeight'],
 camera:['length','width','thickness','lensRadius','lensHeight','holeRadius','mountOffset'],
 ultrasonic:['length','width','thickness','transducerRadius','transducerBore','transducerHeight','holeRadius','mountOffset'],
 grayscale:['length','width','thickness','sensorLength','sensorWidth','sensorHeight','connectorHeight','holeRadius','mountOffset'],
 battery:['length','width','height'],connector:['length','width','height','plugLength'],schematic:[],abstract:[]
};
const registry=loadRegistry(),strict=read(path.join(base,'scope-receipts.json'));
const graphs=Object.fromEntries(variants.map(v=>[v,read(path.join(twin,'validation/m2',v,'compiled-graph.json'))]));
const seed=read(path.join(twin,'components/inventory/planning-steps.json')).steps;
export const purchased=registry.definitions.filter(d=>!['plate','tool'].includes(d.componentClass));
export function protectedFacts(id){
 const d=purchased.find(d=>d.id===id);assert(d,'OUTSIDE_PURCHASED_SCOPE');
 const ids=registry.instances.filter(i=>i.definitionId===id).map(i=>i.id);
 return {definition:{id:d.id,revision:d.revision,name:d.name,componentClass:d.componentClass,variantIds:d.variantIds,identityClaimId:d.identityClaimId},
  identityClaim:registry.claims.find(c=>c.id===d.identityClaimId),instances:registry.instances.filter(i=>i.definitionId===id),
  printedStockMeasurements:registry.measurements.filter(m=>m.subjectId===id&&m.feature.startsWith('stock.')),
  consumableLots:registry.lots.filter(l=>registry.instances.some(i=>i.definitionId===id&&i.inventoryLotId===l.id)),
  consumableAllocations:registry.allocations.filter(a=>a.definitionId===id||registry.instances.some(i=>i.definitionId===id&&i.id===a.instanceId)),
  ownedElements:d.ownedElements,fastener:registry.fastenerDefinitions.find(f=>f.partDefinitionId===id)??null,
  cable:registry.cableDefinitions.find(c=>c.partDefinitionId===id)??null,
  connectorPoints:registry.connectionPoints.filter(p=>p.definitionId===id),
  connectorClaims:registry.connectionPoints.filter(p=>p.definitionId===id).map(p=>registry.claims.find(c=>c.id===p.connectorIdentityClaimId)),
  plannedUses:registry.plannedUses.filter(u=>u.definitionId===id),
  graphUse:variants.map(v=>({variantId:v,graphHash:graphs[v].graphHash,steps:graphs[v].steps.filter(s=>[...s.introducedInstanceIds,...s.usedInstanceIds].some(i=>ids.includes(i))).map(s=>({stepId:s.id,printedNumber:s.printedNumber,sourceRefs:s.sourceRefs,operationIds:s.operationIds,instanceIds:[...new Set([...s.introducedInstanceIds,...s.usedInstanceIds].filter(i=>ids.includes(i)))],orientation:seed[s.printedNumber-1].orientation,zeroingConditionIds:s.zeroingConditionIds,warningIds:s.warningIds}))})),
  openConflicts:registry.conflicts.filter(c=>c.status==='open'),
  engineeringUnknownMeasurements:registry.measurements.filter(m=>m.subjectId===id&&m.value.state==='unresolved'),
  interfaces:registry.interfaces.filter(i=>d.interfaceRefs.includes(i.id)),observedOwnerStock:'UNRESOLVED'};
}
export function canonicalUnknowns(id){return strict.receipts.find(s=>s.definitionId===id).requiredFeatures.map(f=>({feature:f.feature,value:f.value}));}
export function engineeringStatus(id){return strict.partial.includes(id)?'PARTIAL':'BLOCKED';}
export function pair(strictIndependentPass,instructionalPass){return{engineeringStatus:strictIndependentPass?'ENGINEERING_ADMITTED':'BLOCKED',instructionalStatus:instructionalPass?'INSTRUCTIONAL_ADMITTED':'BLOCKED'};}
export function engineeringInput(input,purpose){
 assert(mustNotDrive.includes(purpose),'UNKNOWN_ENGINEERING_PURPOSE');
 const text=JSON.stringify(input);assert(!/instructional-only|nonEngineering|instructionalApproximations|presentation-only/.test(text),'INSTRUCTIONAL_ENGINEERING_FIREWALL');
 assert.equal(input.track,'engineering','EXPLICIT_ENGINEERING_TRACK_REQUIRED');
 const accepted=strict.receipts.find(s=>s.definitionId===input.definitionId);
 assert(accepted?.status==='PASS'&&accepted.checks.applicableIdentity.status==='PASS'&&accepted.checks.featureEvidence.status==='PASS'&&accepted.checks.cadValidity.status==='PASS','STRICT_ENGINEERING_PROOF_REQUIRED');
 return accepted;
}
function closed(value,keys,code){assert.deepEqual(Object.keys(value).sort(),keys.slice().sort(),code);}
export function validateParameters(input,{sourceBytes=true}={}){
 assert.equal(input.track,'instructional-only');assert.equal(input.policyId,'PX-OWNER-INSTRUCTIONAL-20260930');assert.equal(input.unit,'mm');assert.equal(input.basis,'RH-XFORWARD-YLEFT-ZUP');
 const schema=read(path.join(base,'instructional-parameters.schema.json'));const validator=new Ajv({strict:false}).compile(schema);assert(validator(input),JSON.stringify(validator.errors));
 assert.equal(input.definitions.length,50);assert.deepEqual(input.definitions.map(d=>d.definitionId).sort(),purchased.map(d=>d.id).sort(),'EXACT_FIFTY_DEFINITION_CLOSURE');
 const refs=new Map(input.sources.map(s=>[s.id,s]));assert.equal(refs.size,input.sources.length);
 for(const s of input.sources){assert(s.limitations.length&&['publicSource','privateOwnerEvidence'].includes(s.privacy));if(sourceBytes){assert.equal(fileHash(path.join(root,s.path)),s.rawSha256);assert.equal(fs.statSync(path.join(root,s.path)).size,s.bytes);}}
 for(const d of input.definitions){
  assert.equal(d.track,'instructional-only');assert.equal(d.engineeringStatus,engineeringStatus(d.definitionId),'STRICT_STATUS_PROMOTION');
  assert.deepEqual(d.protectedFacts,protectedFacts(d.definitionId),'PROTECTED_TUTORIAL_FACT_MUTATION');
  assert.deepEqual(d.canonicalUnknowns,canonicalUnknowns(d.definitionId),'CANONICAL_UNKNOWN_MUTATION');
  assert.deepEqual(d.mustNotDrive,mustNotDrive,'AUTHORITY_FIREWALL_DROPPED');
  const old=strict.receipts.find(s=>s.definitionId===d.definitionId);assert(old.blockerIds.every(b=>d.blockerIds.includes(b)),'ENGINEERING_BLOCKER_DROPPED');
  assert(d.sourceRefs.length&&d.sourceRefs.every(id=>refs.has(id)),'SOURCE_CLOSURE');
  for(const id of d.sourceRefs)assert(refs.get(id).limitations.every(l=>d.sourceLimitations.includes(l)),'SOURCE_LIMITATION_DROPPED');
  assert(d.displayRequirements.includes('Show exact definition/role/designation label next to proxy'),'PART_PICKING_LABEL_REQUIRED');
  assert.equal(d.rightsStatus.sourcePublicationAllowed,false);assert.equal(d.rightsStatus.privatePhotoInAsset,false);
  assert.equal(d.exactOEMIdentity,'UNRESOLVED','OEM_IDENTITY_PROMOTION');
  assert.equal(d.coordinateScope,'Presentation origin only; no engineering datum/axis/frame');
  assert(Object.hasOwn(recipes,d.recipe),'UNSUPPORTED_RECIPE');
  const expectedRecipe={piBoard:'board',robotHat:'hat',cable:'schematic',consumable:'abstract'}[d.protectedFacts.definition.componentClass]??d.protectedFacts.definition.componentClass;
  assert.equal(d.recipe,expectedRecipe,'WRONG_COMPONENT_KIND');
  assert.equal(d.boardVariant,({ 'PX-V40-DEF-PI4':'rpi4','PX-V40-DEF-PI5':'rpi5','PX-V40-DEF-ZERO2W':'rpi-zero-2-w' })[d.definitionId]??null,'BOARD_VARIANT_SUBSTITUTION');
  assert.deepEqual(d.instructionalApproximations.map(p=>p.name).sort(),recipes[d.recipe].slice().sort(),'PARAMETER_FIELDS');
  for(const p of d.instructionalApproximations){closed(p,['name','value','unit','basis','sourceRefs','approximationKind','visualPurpose','nonEngineering','blockerIds'],'PARAMETER_CLASSIFICATION');assert.equal(p.nonEngineering,true);assert(Number.isFinite(p.value)&&!Object.is(p.value,-0)&&p.value>=0);assert(p.basis&&p.visualPurpose&&p.blockerIds.length);assert(p.sourceRefs.length&&p.sourceRefs.every(id=>d.sourceRefs.includes(id)));assert.equal(p.unit,p.name==='spokeCount'?'count':'mm');}
  const p=Object.fromEntries(d.instructionalApproximations.map(p=>[p.name,p.value]));
  const designation=d.protectedFacts.definition.name.match(/^M([0-9.]+)x([0-9]+)(?:\+([0-9]+))?/);
  if(designation&&['screw','standoff'].includes(d.recipe)){assert.equal(p.length,Number(designation[2]),'PRINTED_LENGTH_SUBSTITUTION');if(d.recipe==='screw')assert.equal(p.diameter,Number(designation[1]),'PRINTED_DIAMETER_SUBSTITUTION');else{assert.equal(p.extensionDiameter,Number(designation[1]),'PRINTED_THREAD_DESIGNATION_SUBSTITUTION');assert.equal(p.extensionLength,Number(designation[3]??0),'PRINTED_EXTENSION_SUBSTITUTION');}}
  if(d.recipe==='camera'){assert.deepEqual([p.length,p.width,p.thickness+p.lensHeight],[25,23,9],'CAMERA_NO_AVERAGING');assert(d.blockerIds.includes('Q-08'));assert(d.displayRequirements.includes('Camera dimensions conflict remains OPEN; selected prose envelope is presentation-only'));}
  if(d.recipe==='wheel')assert.equal(p.spokeCount,d.definitionId.endsWith('FRONT')?10:5,'WHEEL_ROLE_SUBSTITUTION');
  if(d.recipe==='motor')assert.equal(d.semanticRole,d.definitionId.endsWith('LEFT')?'left':'right','MOTOR_ROLE_SUBSTITUTION');
  if(d.recipe==='horn'||d.recipe==='servo')assert.equal(d.semanticRole,d.definitionId.split('-').at(-1).toLowerCase(),'SERVO_ROLE_SUBSTITUTION');
  if(d.recipe==='schematic')assert.equal(d.representationKind,'schematic_flexible');if(d.recipe==='abstract')assert.equal(d.representationKind,'abstract_consumable');
  assert.equal(d.expectedRigidSolids,({schematic:0,abstract:0,rivet:2,motor:3,hat:11,grayscale:5,board:d.boardVariant==='rpi-zero-2-w'?6:d.boardVariant==='rpi5'?8:7,connector:2})[d.recipe]??1,'EXPECTED_SOLID_ACCOUNTING');
 }
 const washer=id=>Object.fromEntries(input.definitions.find(d=>d.definitionId==='PX-V40-DEF-WASHER-'+id).instructionalApproximations.map(a=>[a.name,a.value]));
 const a=washer('A'),b=washer('B');assert(a.boreDiameter/a.outerDiameter>b.boreDiameter/b.outerDiameter,'WASHER_APPEARANCE_COLLAPSE');
 assert.equal(input.integralLeads.length,6);for(const c of registry.cableDefinitions.filter(c=>c.ownership==='integral')){const lead=input.integralLeads.find(l=>l.ownerDefinitionId===c.partDefinitionId);assert(lead);assert.deepEqual(lead.canonicalCable,c);assert.equal(lead.track,'instructional-only');assert.equal(lead.representationKind,'schematic_flexible');assert.equal(lead.generatedRigidSolids,0);assert.equal(lead.purchasedItemIncrement,0);}
 return {status:'PASS',definitions:50,integralLeads:6,engineeringAdmission:false};
}
export function validateReceipt(receipt,input,shapeResult,{checkArtifact=true}={}){
 const d=input.definitions.find(d=>d.definitionId===receipt.definitionId);assert(d,'UNKNOWN_RECEIPT_DEFINITION');
 const required=['definitionId','track','engineeringStatus','instructionalStatus','representationKind','sourceRefs','sourceLimitations','canonicalUnknowns','instructionalApproximations','criticalTutorialFacts','protectedFacts','mustNotDrive','blockerIds','rightsStatus','artifactPaths','validationResults','notes','displayRequirements','inputHash'];closed(receipt,required,'RECEIPT_FIELDS');
 assert.equal(receipt.track,'instructional-only');assert.equal(receipt.engineeringStatus,d.engineeringStatus);assert.equal(receipt.instructionalStatus,'INSTRUCTIONAL_ADMITTED');
 for(const k of ['representationKind','sourceRefs','sourceLimitations','canonicalUnknowns','instructionalApproximations','protectedFacts','mustNotDrive','blockerIds','rightsStatus','notes','displayRequirements'])assert.deepEqual(receipt[k],d[k],'RECEIPT_INPUT_CLOSURE '+k);
 assert.deepEqual(receipt.criticalTutorialFacts,d.protectedFacts.graphUse);assert.equal(receipt.inputHash,H('m5-instructional-input',d));
 assert.equal(receipt.validationResults.actualShapeCheck,'PASS');assert.equal(shapeResult.definitionId,d.definitionId);assert.equal(shapeResult.status,'PASS');assert.equal(shapeResult.solidCount,d.expectedRigidSolids);assert.equal(shapeResult.engineeringAdmission,false);
 if(checkArtifact)for(const p of receipt.artifactPaths){assert(p.startsWith('digital-twin/validation/expected/m5/instructional-artifacts/'),'PRIVATE_OR_RUNTIME_ARTIFACT_ROOT');assert(!/private|public|\.zip$|\.jpe?g$|\.png$/i.test(p));assert(fs.existsSync(path.join(root,p)));assert(fs.realpathSync(path.join(root,p)).startsWith(fs.realpathSync(path.join(base,'instructional-artifacts'))+path.sep),'ARTIFACT_SYMLINK_ESCAPE');if(p.endsWith('.svg'))assert(!/<image|data:image|base64/i.test(fs.readFileSync(path.join(root,p),'utf8')),'PRIVATE_PHOTO_PIXEL_EXPORT');}
 return true;
}
