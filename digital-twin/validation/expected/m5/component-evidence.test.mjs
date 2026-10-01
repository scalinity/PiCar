// Actual acquired candidates must not supply exact kit identity/dimensions.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import test from 'node:test';
import {loadRegistry,validateRegistry,validateShape} from '../../../tools/evidence/semantic.mjs';
const sources=JSON.parse(fs.readFileSync(new URL('./candidate-sources.json',import.meta.url)));
const scopes=JSON.parse(fs.readFileSync(new URL('./scope-receipts.json',import.meta.url)));
const registry=loadRegistry();
const steps=JSON.parse(fs.readFileSync(new URL('../../../components/inventory/planning-steps.json',import.meta.url))).steps;
for(const evidence of sources.records)test('candidate evidence schema: '+evidence.id,()=>validateShape('EvidenceRecord',evidence));
const candidate=id=>structuredClone(sources.records.find(e=>e.id===id));
for(const [id,evidenceId] of [['ROBOT-HAT','HAT-V4-HARDWARE'],['SERVO-PAN','SERVO-ADJUST'],['SERVO-TILT','SERVO-ADJUST'],['SERVO-STEERING','SERVO-ADJUST'],['MOTOR-LEFT','PICAR-INDEX'],['ULTRASONIC','ULTRASONIC'],['PI5','PI5-STEP-ZIP']]){
 test('candidate family cannot replace identity: '+id,()=>{
  const r=structuredClone(registry),d=r.definitions.find(d=>d.id==='PX-V40-DEF-'+id),claim=r.claims.find(c=>c.id===d.identityClaimId),e=candidate('PX-M5-EV-'+evidenceId);
  r.evidence.push(e);claim.evidenceRefs=[e.id];claim.scope='nominalEngineering';claim.confidence='VERIFIED';claim.sourceLimitations=[...e.limitations];
  assert.throws(()=>validateRegistry(r,{steps,artifacts:false}),/SOURCE_SCOPE_PROMOTION/);
 });
}
for(const [name,dimensions] of [['prose',[25,23,9]],['specification',[24,23.5,8]],['averaged',[24.5,23.25,8.5]]]){
 test('camera '+name+' dimensions cannot become engineering input',()=>{
  const r=structuredClone(registry),e=candidate('PX-M5-EV-CAMERA');r.evidence.push(e);
  const claim=r.claims.find(c=>c.id==='PX-CLAIM-CAMERA-DIMENSIONS-1');
  claim.evidenceRefs=[e.id];claim.scope='nominalEngineering';claim.confidence='VERIFIED';claim.statement='Proposed exact camera dimensions '+dimensions.join(' x ')+' mm';claim.sourceLimitations=[...e.limitations];
  assert.throws(()=>validateRegistry(r,{steps,artifacts:false}),/SOURCE_SCOPE_PROMOTION/);
 });
}
test('acquisition scope retains both original open conflicts',()=>{
 assert.deepEqual(scopes.unresolvedConflicts,['PX-CONFLICT-CAMERA-DIMENSIONS','PX-CONFLICT-ULTRASONIC-SUPPLY']);
 for(const id of scopes.unresolvedConflicts){const original=registry.conflicts.find(c=>c.id===id);assert.equal(original.status,'open');assert(original.claimIds.length>=2);}
});
test('50 purchased definitions and six owner-bound leads retain exact accounting',()=>{
 const expected=registry.definitions.filter(d=>!['plate','tool'].includes(d.componentClass));
 assert.deepEqual(scopes.receipts.map(r=>r.definitionId).sort(),expected.map(d=>d.id).sort());
 for(const scope of scopes.receipts){const d=expected.find(d=>d.id===scope.definitionId);assert.deepEqual(scope.ownedElementIds,d.ownedElements.map(e=>e.id));assert.deepEqual(scope.connectorPointIds,d.connectionPointRefs);assert.equal(scope.status,'BLOCKED');assert.equal(scope.generatedProductionSolids,0);assert.equal(scope.productionAdoption,false);}
 const leads=registry.cableDefinitions.filter(c=>c.ownership==='integral');assert.equal(scopes.integralCableScopes.length,6);
 for(const lead of leads){const scope=scopes.integralCableScopes.find(s=>s.ownerDefinitionId===lead.partDefinitionId);assert(scope);assert.equal(scope.purchasedItemIncrement,0);assert.deepEqual(scope.connectionPointIds,lead.endpointConnectorRefs);}
});
