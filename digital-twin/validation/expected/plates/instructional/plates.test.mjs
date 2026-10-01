import fs from 'node:fs';import path from 'node:path';import test from 'node:test';import assert from 'node:assert/strict';
import {base,validateReceipt,evaluate,assertUse,assertOutput,engineeringPurposes} from '../../../../tools/evidence/m6-plates.mjs';
const receipts=fs.readdirSync(path.join(base,'receipts')).sort().map(p=>JSON.parse(fs.readFileSync(path.join(base,'receipts',p)))),copy=x=>structuredClone(x),get=l=>copy(receipts.find(r=>r.definitionId.endsWith('-'+l)));
for(const r of receipts)test('actual scoped receipt '+r.definitionId,()=>assert.equal(validateReceipt(r).status,'PASS'));
test('actual aggregate instructional gate PASS while engineering stays BLOCKED',()=>{assert.equal(evaluate(receipts),'PASS');assert(receipts.every(r=>r.engineeringStatus==='BLOCKED'&&!r.engineeringAdmission));});
const mutants=[
 ['strict engineering label','A',r=>r.engineeringStatus='ENGINEERING_ADMITTED'],
 ['strict engineering admission','A',r=>r.engineeringAdmission=true],
 ['VERIFIED photo estimate from card','D',r=>r.features[0].engineeringValue={state:'known',value:100,confidence:'VERIFIED'}],
 ['DERIVED photo estimate missing method/uncertainty','D',r=>{r.features[0].engineeringValue={state:'known',value:100,confidence:'DERIVED'};delete r.features[0].method;delete r.features[0].uncertainty;}],
 ['manufacturer stock certification','D',r=>r.thickness.manufacturerCertified=true],
 ['2mm upgraded VERIFIED','D',r=>r.thickness.confidence='VERIFIED'],
 ['E handedness reversed','E',r=>r.handedness='LEFT'],
 ['F handedness reversed','F',r=>r.handedness='RIGHT'],
 ['negative runtime reflection','F',r=>r.runtimeScale=[1,-1,1]],
 ['Plate A synthetic production datum','A',r=>r.syntheticM4DatumUsed=true],
 ['invented hidden bore','A',r=>r.hiddenFeaturesInvented=['hidden.bore']],
 ['perspective pixels called orthographic','D',r=>r.features[0].method='raw perspective pixels treated as uncorrected orthographic'],
 ['one-image Plate C','C',r=>r.sourceImages=r.sourceImages.slice(0,1)],
 ['exact unsupported bend radius','C',r=>r.exactBendRadiusClaim=true],
 ['instructional anchor exported as interface','A',r=>r.presentationAnchorEngineeringInterface=true],
 ['private pixels staged in artifact','A',r=>r.privatePixelsInAuthoredArtifacts=true],
 ['source count altered','A',r=>r.sourceImages.pop()],
 ['duplicate source used independently','A',r=>r.sourceImages[1]=r.sourceImages[0]],
 ['missing required feature','H',r=>r.features.pop()],
 ['unknown numeric payload','H',r=>r.features[0].engineeringValue.value=0],
 ['candidate admitted without proof','G',r=>r.proofs={}],
 ['nonclosing uncertainty omitted','G',r=>delete r.features[0].uncertainty],
 ['canonical role changed','E',r=>r.protectedInstances[0].role='left'],
 ['step use changed','A',r=>r.stepUse.rpi4=[]]
];
for(const [name,l,mutate]of mutants)test('reject '+name,()=>{const r=get(l);mutate(r);assert.throws(()=>validateReceipt(r));});
for(const purpose of engineeringPurposes)test('refuse M6 artifact at '+purpose,()=>assert.throws(()=>assertUse(get('G'),purpose),/ENGINEERING_FIREWALL/));
test('private photograph public destination rejected',()=>assert.throws(()=>assertOutput('picarx-companion/public/twin/photo.jpeg',{privatePixels:true})));
test('private overlay staged destination rejected',()=>assert.throws(()=>assertOutput('docs/implementation/evidence/m6/overlay.png',{privatePixels:true})));
test('private overlay location accepted',()=>assert.doesNotThrow(()=>assertOutput('digital-twin/evidence/private/m6/overlay.png',{privatePixels:true})));
test('candidate BRep output location accepted',()=>assert.doesNotThrow(()=>assertOutput('docs/implementation/evidence/m6/candidate-01/candidate-artifacts/plate.brep')));
test('plate count mismatch rejected',()=>assert.throws(()=>evaluate(receipts.slice(0,7))));
test('plate duplicate identity rejected',()=>assert.throws(()=>evaluate([...receipts.slice(0,7),receipts[0]])));
test('provisional review allowed without promoting unknowns',()=>assert.doesNotThrow(()=>assertUse(get('G'),'provisional-review')));
test('blocked candidate cannot instruct assembly',()=>{const r=get('G');r.instructionalStatus='BLOCKED';assert.throws(()=>assertUse(r,'instructional'));});
test('reviewed instructional candidate can instruct assembly',()=>assert.doesNotThrow(()=>assertUse(get('G'),'instructional')));
for(const letter of 'ABCDEFGH')for(const purpose of engineeringPurposes)test('admitted '+letter+' still refuses '+purpose,()=>assert.throws(()=>assertUse(get(letter),purpose),/ENGINEERING_FIREWALL/));
for(const [name,mutate] of [
 ['forged shape hash',r=>r.proofs.brep.rawSha256='0'.repeat(64)],
 ['absent source review',r=>delete r.proofs.sourceReview],
 ['wrong shape report',r=>r.proofs.shapeReport.path='docs/implementation/evidence/m6/qualification-a-01/shapes.json'],
 ['approximate production datum',r=>r.instructionalOrigin.engineeringDatum=true],
 ['unsupported instructional dimension',r=>r.reviewedInstructionalDimensions.thickness.valueMm=3],
 ['feature alias hiding omission',r=>r.features[1]=r.features[0]],
 ['unexplained uncertainty',r=>delete r.features[0].uncertainty.limitations]
 ,['manufacturing blockers erased',r=>r.manufacturingUnknowns=[]]
])test('reject '+name,()=>{const r=get('A');mutate(r);assert.throws(()=>validateReceipt(r));});
test('unresolved engineering metrology does not block reviewed instructional geometry',()=>{const r=get('G');assert(r.features.every(f=>f.uncertainty.state==='unresolved'));assert.equal(validateReceipt(r).status,'PASS');});
test('replacing candidate parameter preserves definition identity',()=>{const r=get('G'),id=r.definitionId;r.thickness.basis='Replaceable presentation revision';assert.equal(r.definitionId,id);assert.equal(validateReceipt(r).status,'PASS');});
test('all 62 hash refs remain unique and counts close',()=>{const m=JSON.parse(fs.readFileSync(path.join(base,'source-feature-map.json')));assert.equal(m.sourceViews.length,62);assert.equal(new Set(m.sourceViews.map(s=>s.sourceRawSha256)).size,62);assert.equal(m.efMirror.sourceImages.length,2);});
test('E F identities are separate with owner sides retained',()=>{assert.notEqual(get('E').definitionId,get('F').definitionId);assert.equal(get('E').handedness,'RIGHT');assert.equal(get('F').handedness,'LEFT');});
