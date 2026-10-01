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
 const manifest=map().sourceViews.filter(v=>v.plate===receipt.definitionId.at(-1));assert.deepEqual(receipt.sourceImages,manifest,'SOURCE_MANIFEST_ROWS');assert.equal(new Set(receipt.sourceImages.map(v=>v.sourceRawSha256)).size,receipt.sourceImages.length,'DUPLICATE_INDEPENDENT_IMAGE');
 const expectedCount={A:13,B:7,C:14,D:6,E:8,F:6,G:3,H:3}[receipt.definitionId.at(-1)];assert.equal(receipt.sourceImages.length,expectedCount,'IMAGE_COUNTS');
 assert.equal(receipt.features.length,actual.features.length,'FEATURE_COVERAGE');
 for(const feature of receipt.features){const expected=actual.features.find(f=>f.name===feature.name);assert(expected,'INVENTED_FEATURE');assert.deepEqual(feature.sourceImages,expected.sourceImages,'FEATURE_SOURCE_CLOSURE');assert(feature.method&&!/raw perspective pixels|uncorrected orthographic/i.test(feature.method),'RAW_PERSPECTIVE');assert.equal(feature.engineeringValue.state,'unresolved','PHOTO_ENGINEERING_PROMOTION');assert.equal(feature.engineeringValue.confidence,'UNRESOLVED','PHOTO_ENGINEERING_PROMOTION');assert(!Object.hasOwn(feature.engineeringValue,'value'),'UNKNOWN_NUMERIC_PAYLOAD');assert(feature.uncertainty&&feature.blockerIds.length,'UNCERTAINTY_OR_BLOCKER_MISSING');}
 if(receipt.instructionalStatus==='INSTRUCTIONAL_ADMITTED'){assert.equal(receipt.calibrationStatus,'PASS','CALIBRATION_NOT_CLOSED');assert.equal(receipt.shapeValidationStatus,'PASS','SHAPE_NOT_CLOSED');assert.equal(receipt.sourceValidationStatus,'PASS','SOURCE_NOT_CLOSED');assert(receipt.features.every(f=>f.uncertainty.state==='bounded'),'UNCERTAINTY_NOT_CLOSED');if(['E','F'].includes(receipt.definitionId.at(-1)))assert.equal(receipt.mirrorCadValidationStatus,'PASS','MIRROR_CAD_NOT_CLOSED');assert.equal(receipt.blockerIds.filter(id=>id.startsWith('M6-')).length,0,'INSTRUCTIONAL_BLOCKERS');}
 else assert.equal(receipt.instructionalStatus,'BLOCKED','INSTRUCTIONAL_STATUS');
 return{status:'PASS',scope:'Honest scoped receipt structure and firewall; not admission',definitionId:receipt.definitionId};
}
export function evaluate(receipts){assert.equal(receipts.length,8,'PLATE_COUNT');assert.deepEqual(receipts.map(r=>r.definitionId).sort(),[...'ABCDEFGH'].map(p=>'PX-V40-DEF-PLATE-'+p),'PLATE_IDENTITIES');receipts.forEach(validateReceipt);return receipts.every(r=>r.instructionalStatus==='INSTRUCTIONAL_ADMITTED')?'PASS':'BLOCKED';}
export function publicHashFirewall(files){const hashes=new Set(map().sourceViews.map(v=>v.sourceRawSha256));for(const {path:relative,bytes,privatePixels=false} of files){assertOutput(relative,{privatePixels});assert(!hashes.has(crypto.createHash('sha256').update(bytes).digest('hex')),'ORIGINAL_PRIVATE_PHOTO_COPY');}}
