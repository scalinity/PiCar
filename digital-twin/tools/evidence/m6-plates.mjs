// M6-only receipt firewall. Does not extend or weaken the M5 purchased guard.
import fs from 'node:fs';
import Ajv from 'ajv/dist/2020.js';
import path from 'node:path';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
export const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..');
export const base=path.join(root,'digital-twin/validation/expected/plates/instructional');
const read=p=>JSON.parse(fs.readFileSync(p));
const definitions=read(path.join(root,'digital-twin/components/definitions/parts.json'));
const instances=read(path.join(root,'digital-twin/components/instances/planned-stock.json'));
const validateSchema=new Ajv({strict:true,allErrors:true}).compile(read(path.join(base,'receipt.schema.json')));
const map=()=>read(path.join(base,'source-feature-map.json'));
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
function bound(proof,expected){
 assert(proof&&proof.path===expected,'PROOF_PATH');assertOutput(proof.path);
 const bytes=fs.readFileSync(path.join(root,proof.path));
 assert.equal(hash(bytes),proof.rawSha256,'PROOF_HASH');assert.equal(bytes.length,proof.bytes,'PROOF_BYTES');
 return expected.endsWith('.json')?JSON.parse(bytes):bytes;
}
export const engineeringPurposes=['G-STRUCTURE','G-CAD','G-GEOMETRY','engineeringMeasurement','engineeringInterface','engineeringSolver','engineeringRoute','manufacturing','physicalFit'];
export function assertUse(artifact,purpose){assert.equal(artifact.track,'instructional-only','TRACK');assert(!engineeringPurposes.includes(purpose),'ENGINEERING_FIREWALL');assert(purpose==='provisional-review'||(purpose==='instructional'&&artifact.instructionalStatus==='INSTRUCTIONAL_ADMITTED'),'NOT_INSTRUCTIONALLY_ADMITTED');}
export function assertOutput(relative,{privatePixels=false}={}){
 assert(typeof relative==='string'&&!path.isAbsolute(relative)&&!relative.split(/[\\/]/).includes('..'),'UNSAFE_OUTPUT_PATH');
 assert(!/(^|\/)(?:public|node_modules|\.codex|\.claude|\.agents|source-vault)(\/|$)/.test(relative),'FORBIDDEN_OUTPUT_ROOT');
 if(privatePixels)assert(relative.startsWith('digital-twin/evidence/private/m6/'),'PRIVATE_PIXELS_REQUIRE_PRIVATE_ROOT');
 else assert(relative.startsWith('digital-twin/validation/expected/plates/instructional/')||relative.startsWith('docs/implementation/evidence/m6/'),'M6_OUTPUT_SCOPE');
}
export function validateReceipt(receipt){
 assert(validateSchema(receipt),'RECEIPT_SCHEMA '+JSON.stringify(validateSchema.errors));
 const actual=map().plates.find(p=>p.definitionId===receipt.definitionId);assert(actual,'PLATE_ID');
 const expectedDefinition=definitions.find(d=>d.id===receipt.definitionId),expectedInstances=instances.filter(i=>i.definitionId===receipt.definitionId);
 assert.deepEqual(receipt.protectedDefinition,expectedDefinition,'DEFINITION_IDENTITY');assert.deepEqual(receipt.protectedInstances,expectedInstances,'INSTANCE_ROLE');assert.deepEqual(receipt.stepUse,actual.stepUse,'STEP_USAGE');
 assert.equal(receipt.track,'instructional-only','TRACK');assert.equal(receipt.gate,'G-INSTRUCTIONAL-PLATE','GATE');assert.equal(receipt.engineeringStatus,'BLOCKED','STRICT_ENGINEERING_PROMOTION');assert.equal(receipt.engineeringAdmission,false,'STRICT_ENGINEERING_PROMOTION');
 assert.equal(receipt.handedness,receipt.definitionId.endsWith('-E')?'RIGHT':receipt.definitionId.endsWith('-F')?'LEFT':'notApplicable','E_F_HANDEDNESS');
 assert.deepEqual(receipt.runtimeScale,[1,1,1],'RUNTIME_REFLECTION');
 assert.equal(receipt.thickness.confidence,'PROBABLE','THICKNESS_CONFIDENCE');assert.equal(receipt.thickness.manufacturerCertified,false,'THICKNESS_CERTIFICATION');assert.equal(receipt.thickness.valueMm,2,'OWNER_WORKING_THICKNESS');
 assert.equal(receipt.presentationAnchorEngineeringInterface,false,'ANCHOR_IS_NOT_ENGINEERING_INTERFACE');assert.equal(receipt.syntheticM4DatumUsed,false,'SYNTHETIC_DATUM');assert.equal(receipt.exactBendRadiusClaim,false,'EXACT_BEND_RADIUS');assert.deepEqual(receipt.hiddenFeaturesInvented,[],'HIDDEN_GEOMETRY');
 assert.equal(receipt.privatePixelsInAuthoredArtifacts,false,'PRIVATE_PIXELS');assert.equal(receipt.sourcePrivate,true,'SOURCE_PRIVACY');
 assert.deepEqual(receipt.manufacturingUnknowns,['exact bend radius','stock tolerance','alloy/material grade','coating thickness','manufacturing tolerance','laser-cut kerf','hole tolerance','hidden features','forming process','finish thickness','physical fit','engineering datum scheme'],'ENGINEERING_UNKNOWNS');
 const manifest=map().sourceViews.filter(v=>v.plate===receipt.definitionId.at(-1));assert.deepEqual(receipt.sourceImages,manifest,'SOURCE_MANIFEST_ROWS');assert.equal(new Set(receipt.sourceImages.map(v=>v.sourceRawSha256)).size,receipt.sourceImages.length,'DUPLICATE_INDEPENDENT_IMAGE');
 const expectedCount={A:13,B:7,C:14,D:6,E:8,F:6,G:3,H:3}[receipt.definitionId.at(-1)];assert.equal(receipt.sourceImages.length,expectedCount,'IMAGE_COUNTS');
 assert.equal(receipt.features.length,actual.features.length,'FEATURE_COVERAGE');
 assert.deepEqual(receipt.features.map(f=>f.name).sort(),actual.features.map(f=>f.name).sort(),'FEATURE_IDENTITIES');
 for(const feature of receipt.features){const expected=actual.features.find(f=>f.name===feature.name);assert(expected,'INVENTED_FEATURE');assert.deepEqual(feature.sourceImages,expected.sourceImages,'FEATURE_SOURCE_CLOSURE');assert(feature.method&&!/raw perspective pixels|uncorrected orthographic/i.test(feature.method),'RAW_PERSPECTIVE');assert.equal(feature.engineeringValue.state,'unresolved','PHOTO_ENGINEERING_PROMOTION');assert.equal(feature.engineeringValue.confidence,'UNRESOLVED','PHOTO_ENGINEERING_PROMOTION');assert(!Object.hasOwn(feature.engineeringValue,'value'),'UNKNOWN_NUMERIC_PAYLOAD');assert(feature.uncertainty&&feature.blockerIds.length,'UNCERTAINTY_OR_BLOCKER_MISSING');}
 if(receipt.instructionalStatus==='INSTRUCTIONAL_ADMITTED'){
  assert.equal(receipt.calibrationStatus,'PRACTICAL_REVIEW','PRACTICAL_CALIBRATION');assert.equal(receipt.shapeValidationStatus,'PASS','SHAPE_NOT_CLOSED');assert.equal(receipt.sourceValidationStatus,'PASS','SOURCE_NOT_CLOSED');
  assert(receipt.features.every(f=>f.instructionalValue.state==='INSTRUCTIONAL_APPROXIMATION'&&f.uncertainty.limitations?.length),'APPROXIMATION_LIMITATIONS');
  const ev='docs/implementation/evidence/m6',p=receipt.proofs;
  const amendment=bound(p.ownerAmendment,ev+'/owner-amendment.json');assert.equal(amendment.instructionalJointMetrologyRequired,false,'OWNER_AMENDMENT');assert.equal(amendment.holeCenterTargetMm,.75,'OWNER_TARGET');assert.equal(amendment.engineeringRequirementsUnchanged,true,'ENGINEERING_FIREWALL');
  const parameters=bound(p.parameters,'digital-twin/validation/expected/plates/instructional/all-parameters.json'),d=parameters.definitions.find(d=>d.definitionId===receipt.definitionId);assert(d,'PARAMETER_IDENTITY');
  assert.deepEqual(receipt.instructionalOrigin,d.presentationOrigin,'ORIGIN_BINDING');assert.equal(receipt.instructionalOrigin.engineeringDatum,false,'ENGINEERING_DATUM');assert.equal(receipt.instructionalOrigin.kind,'replaceable','REPLACEABLE_ORIGIN');assert(receipt.instructionalOrigin.axes,'ORIGIN_AXES');
  assert.deepEqual(receipt.reviewedInstructionalDimensions,{confidence:'INSTRUCTIONAL_APPROXIMATION',engineeringDatum:false,profile:d.profile,holes:d.holes,thickness:d.thickness},'DIMENSION_BINDING');
  const shapes=bound(p.shapeReport,ev+'/amendment-shapes-04/shapes.json'),shape=shapes.results.find(s=>s.definitionId===receipt.definitionId);assert.equal(shapes.candidateShapeStatus,'PASS','ACTUAL_SHAPES');assert(shape&&shape.status==='PASS'&&shape.solidCount===1&&shape.volumeMm3>0,'ACTUAL_SOLID');
  bound(p.brep,ev+'/amendment-shapes-04/candidate-artifacts/'+receipt.definitionId+'.brep');
  const review=bound(p.sourceReview,ev+'/source-review-final.json'),r=review.results.find(r=>r.definitionId===receipt.definitionId);assert.equal(review.status,'PASS','ACTUAL_SOURCE_REVIEW');assert.deepEqual(review.parameters,p.parameters,'REVIEW_PARAMETER_BINDING');assert.deepEqual(review.shapeReport,p.shapeReport,'REVIEW_SHAPE_BINDING');assert.deepEqual(review.ownerAmendment,p.ownerAmendment,'REVIEW_POLICY_BINDING');assert.equal(review.engineeringAdmission,false,'REVIEW_ENGINEERING_FIREWALL');assert.equal(review.privatePixelsCopiedToReceipt,false,'REVIEW_PIXELS');
  assert(r&&r.status==='PASS'&&r.majorFeatureAgreement==='PASS'&&r.partLocalOrientation==='PASS','REVIEW_FEATURE_ORIENTATION');assert.deepEqual(r.materialContradictions,[],'SOURCE_CONTRADICTION');assert.equal(r.shapeRawSha256,p.brep.rawSha256,'REVIEW_BREP_BINDING');assert(r.findings&&r.limitations.length,'REVIEW_LIMITATIONS');
  const comparisons=r.comparisons.filter(c=>c.role),manifestHash=new Set(manifest.map(m=>m.sourceRawSha256));assert(comparisons.some(c=>c.role==='primary')&&comparisons.some(c=>c.role.includes('independent secondary')),'INDEPENDENT_VIEWS');
  for(const c of r.comparisons){assert(manifestHash.has(c.sourceRawSha256),'REVIEW_SOURCE_BINDING');assert.equal(c.comparison,'PASS','SOURCE_COMPARISON');}
  assert(new Set(comparisons.map(c=>c.sourceRawSha256)).size>=2,'DISTINCT_REVIEW_VIEWS');
  if(d.profile.kind.includes('bent-faces'))assert(comparisons.some(c=>c.role.includes('profile/')),'BENT_PROFILE_VIEW');
  if(['D','G','H'].includes(d.plate)){const metric=shapes.sourceResiduals.find(m=>m.definitionId===d.definitionId);assert(metric&&metric.maxHoleCenterResidualMm<=amendment.holeCenterTargetMm,'HOLE_RESIDUAL');assert.equal(metric.alignmentMethod,'Rigid 2D alignment on two outer holes; no fitted scale or reflection','RIGID_ALIGNMENT');}
  if(['E','F'].includes(d.plate)){assert.equal(receipt.mirrorCadValidationStatus,'PASS','MIRROR_CAD_NOT_CLOSED');assert.equal(shapes.mirror.status,'PASS','ACTUAL_MIRROR');assert.deepEqual(review.mirror.sourceImages,map().efMirror.sourceImages,'BOTH_COMPARISON_VIEWS');assert.equal(review.mirror.independentFViewsInspected,6,'F_INDEPENDENT_REVIEW');assert.equal(review.mirror.E,'RIGHT','MIRROR_E');assert.equal(review.mirror.F,'LEFT','MIRROR_F');assert.deepEqual(shapes.mirror.runtimeScale,[1,1,1],'ACTUAL_RUNTIME_SCALE');}
  assert.equal(receipt.blockerIds.filter(id=>id.startsWith('M6-')).length,0,'INSTRUCTIONAL_BLOCKERS');assert(receipt.blockerIds.includes('Q-03'),'ENGINEERING_BLOCKER_RETAINED');
 }
 else assert.equal(receipt.instructionalStatus,'BLOCKED','INSTRUCTIONAL_STATUS');
 return{status:'PASS',scope:'Honest scoped receipt structure and firewall; not admission',definitionId:receipt.definitionId};
}
export function evaluate(receipts){assert.equal(receipts.length,8,'PLATE_COUNT');assert.deepEqual(receipts.map(r=>r.definitionId).sort(),[...'ABCDEFGH'].map(p=>'PX-V40-DEF-PLATE-'+p),'PLATE_IDENTITIES');receipts.forEach(validateReceipt);return receipts.every(r=>r.instructionalStatus==='INSTRUCTIONAL_ADMITTED')?'PASS':'BLOCKED';}
export function publicHashFirewall(files){const hashes=new Set(map().sourceViews.map(v=>v.sourceRawSha256));for(const {path:relative,bytes,privatePixels=false} of files){assertOutput(relative,{privatePixels});assert(!hashes.has(crypto.createHash('sha256').update(bytes).digest('hex')),'ORIGINAL_PRIVATE_PHOTO_COPY');}}
