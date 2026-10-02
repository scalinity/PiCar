// Additive M7 scope/report gate; no canonical record mutation or runtime capability.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {applyOperation} from '../../../../../picarx-companion/src/domain/assembly/reducer.ts';
import {hash as semanticHash} from '../../../../tools/compiler/hash.mjs';
export const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../../../..');
export const presentation=path.dirname(fileURLToPath(import.meta.url));
const read=p=>JSON.parse(fs.readFileSync(p)),sha=b=>crypto.createHash('sha256').update(b).digest('hex');
// Per-row checks come from the policy; the last two are report-level (two clean runs, upstream preservation).
export const ROW_CHECKS=read(path.join(presentation,'gate-policy.json')).requiredChecks.filter(c=>!['twoCleanQualifications','upstreamPreservation'].includes(c));
export function binding(p){const b=fs.readFileSync(path.join(root,p));return{path:p,rawSha256:sha(b),bytes:b.length};}
export function validateScope(scope){
 assert.deepEqual(scope.activeProductVariants,['rpi5','rpi-zero-2-w'],'EXACT_ACTIVE_TARGETS');
 assert.deepEqual(scope.preservedNonTarget,[{variantId:'rpi4',status:'PRESERVED_NON_TARGET',historicalGraphValidity:'UNCHANGED',cameraRibbon:'FFC',newAssetsRequired:false}],'PRESERVED_NON_TARGET');
 assert.deepEqual(scope.historicalSemanticVariants,['rpi4','rpi5','rpi-zero-2-w'],'HISTORICAL_GRAPH_VALIDITY');
 assert.equal(scope.requiredActiveStepVariantCoverage,58,'ACTIVE_NOT_HISTORICAL_COVERAGE');
 assert.equal(scope.historicalSemanticStepVariantCoverage,87);assert.equal(scope.printedStepsPerActiveVariant,29);
 assert.deepEqual(scope.activeCameraRibbon,{rpi5:'FPC','rpi-zero-2-w':'FPC'});
 assert.deepEqual(scope.unsupportedBoards,['pico']);assert.equal(scope.separateActiveVariantSemanticsRequired,true);
 assert.equal(scope.zero2WAccessoryBlocker,'Q-14');assert.equal(scope.historicalRecordsMutable,false);
 assert.deepEqual(scope.effectiveMilestones,['M7','M8','M9','M10','M11','M12']);assert.equal(scope.reactivationRequiresOwnerDecision,true);
 return scope;
}
export function refuseEngineering(solution,purpose){
 assert(['G-CAD','G-GEOMETRY','engineeringMeasurement','engineeringInterface','engineeringSolver','engineeringRoute','manufacturing','physicalFit'].includes(purpose),'PURPOSE');
 // M7 supplies no engineering proof or runtime admission path, even after tag forgery.
 throw Error('M7_ENGINEERING_PROOF_REQUIRED: instructional solutions cannot drive '+purpose);
}
// admissions: {'<variant>/<printedNumber>': {proof:{path,rawSha256,bytes}, closure:{path,rawSha256,bytes}}}; verified only by evaluate().
export function coverage(admissions={}){
 const scope=validateScope(read(path.join(presentation,'product-scope.json')));
 const registry=read(path.join(root,'digital-twin/validation/m2/runtime-registry.json'));
 const intents=read(path.join(root,'digital-twin/assemblies/v40/steps/source-intents.json'));
 const rows=[];
 for(const variant of scope.activeProductVariants){
  const graph=read(path.join(root,'digital-twin/validation/m2',variant,'compiled-graph.json'));
  const inputs={graph,registry};
  const expected=read(path.join(root,'digital-twin/validation/m2',variant,'expected-prefixes.json')).prefixes;
  let count=0,state=structuredClone(graph.initialState);
  for(const step of graph.steps){
   const before=state;
   for(const id of step.operationIds){state=applyOperation(state,graph.operations.find(o=>o.id===id),inputs,semanticHash).state;count++;assert.equal(state.stateHash,expected[count].stateHash,'ACCEPTED_PREFIX_DRIFT');}
   const after=state;
   const source=intents.find(s=>s.id===step.id);
   const row={variantId:variant,stepId:step.id,printedNumber:step.printedNumber,title:step.title,
    instructionalStatus:'BLOCKED',engineeringStatus:'BLOCKED',productDisposition:'ACTIVE',
    staticObservation:step.printedNumber===1?'PASS':step.printedNumber===2?'PARTIAL_BOARD_CANDIDATE':'NOT_IMPLEMENTED',
    completeAssemblyOutput:false,solutionRef:step.printedNumber===1?variant+'-S01.json':step.printedNumber===2?variant+'-S02-board.json':null,
    beforeStateHash:before.stateHash,afterStateHash:after.stateHash,graphHash:graph.graphHash,
    operationIds:step.operationIds,introducedInstanceIds:step.introducedInstanceIds,usedInstanceIds:step.usedInstanceIds,
    afterDisposition:after.instances.map(i=>({instanceId:i.instanceId,location:i.location,parentAssemblyId:i.parentAssemblyId})),
    activeMechanicalConnectionIds:after.activeMechanicalConnectionIds,activeCableConnectionIds:after.activeCableConnectionIds,
    sourceInstruction:source,engineeringBlockerIds:step.blockerIds,
    instructionalBlockers:step.printedNumber===1?['M7-S01-UNBOUNDED-INSTALLATION-SWEEP','M7-MASTER-NOT-RELEASED']:
      step.printedNumber===2?['M7-S02-UNBOUNDED-INSTALLATION-SWEEP',...(variant==='rpi5'?['M7-S02-USB-ENGAGEMENT-FRAME']:['Q-14-HEADER-READINESS'])]:
      step.printedNumber===3?['M7-S03-CAMERA-CONNECTOR-FRAMES']:
      step.printedNumber===4?['M7-S04-HAT-INSTALLED-SOCKET-HEIGHT']:['M7-CLOSURE-NOT-IMPLEMENTED'],
    remediation:step.printedNumber===1?'Retain revised independently observed static relationship; installation sweep and master remain unadmitted.':
      step.printedNumber===2?'Whole-board direction and approximate support-center correspondence plus upper bearing/polarity recipes are qualified separately in revision03. Only Pi5 microphone remains null; engagement/fit/sweep remain blocked and Q-14 stays explicit.':
      step.printedNumber===3?'Resolve exact per-variant latch/contact/stiffener endpoint frames from applicable sources before any cable insertion pose.':
      step.printedNumber===4?'Original HAT box is preserved. New scoped revision adds four actual bores and an openly schematic underside socket. Exact installed socket/header seating height and actual HAT applicability remain unqualified; do not use the schematic depth to solve mating.':
      'Pending implementation: close this exact source instruction/operation set with independent protected-case geometry and motion checks; no downstream asset release.'};
   const admission=admissions[variant+'/'+step.printedNumber];
   if(admission)Object.assign(row,{instructionalStatus:'INSTRUCTIONAL_ADMITTED',staticObservation:'PASS_CLOSURE',completeAssemblyOutput:true,solutionRef:admission.closure.path,
    independentProofRef:admission.proof,closureRef:admission.closure,instructionalBlockers:[],
    remediation:'Closed by an independently re-measured instructional closure. Engineering gates stay BLOCKED; no physical fit, thread engagement or installation sweep is claimed.'});
   rows.push(row);
  }
 }
 assert.equal(rows.length,58);return {scope,rows};
}
// The accepted M2 prefixes are the only authority for step boundary hashes; a report cannot carry its own.
function acceptedBoundary(row){
 const graph=read(path.join(root,'digital-twin/validation/m2',row.variantId,'compiled-graph.json'));
 const prefixes=read(path.join(root,'digital-twin/validation/m2',row.variantId,'expected-prefixes.json')).prefixes;
 const before=graph.steps.slice(0,row.printedNumber-1).reduce((n,s)=>n+s.operationIds.length,0);
 return {before:prefixes[before].stateHash,after:prefixes[before+graph.steps[row.printedNumber-1].operationIds.length].stateHash,graphHash:graph.graphHash};
}
function verifyAdmission(row,base){
 const accepted=acceptedBoundary(row);
 assert(row.beforeStateHash===accepted.before&&row.afterStateHash===accepted.after&&row.graphHash===accepted.graphHash,'ACCEPTED_REPLAY_BINDING');
 const ref=row.independentProofRef;
 assert(ref&&typeof ref==='object'&&typeof ref.path==='string'&&typeof ref.rawSha256==='string','MISSING_INDEPENDENT_PROOF');
 const bound=(b,label)=>{assert(b&&typeof b.path==='string'&&typeof b.rawSha256==='string'&&Number.isInteger(b.bytes),'PROOF_BINDING '+label);
  const bytes=fs.readFileSync(path.join(base,b.path));assert(sha(bytes)===b.rawSha256&&bytes.length===b.bytes,'PROOF_BINDING '+label);return bytes;};
 const proof=JSON.parse(bound(ref,'proof'));
 assert(proof.status==='PASS'&&proof.engineeringAdmission===false,'PROOF_STATUS');
 const result=proof.results.find(x=>x.variantId===row.variantId&&x.printedNumber===row.printedNumber);assert(result,'PROOF_ROW_MISSING');
 assert(result.status==='PASS'&&result.instructionalStatus==='INSTRUCTIONAL_ADMITTED','PROOF_ROW_STATUS');
 assert.deepEqual(result.checks,ROW_CHECKS,'PROOF_CHECKS');
 assert(Array.isArray(result.forbiddenPenetrations)&&result.forbiddenPenetrations.length===0,'PROOF_PENETRATION');
 assert(result.physicalFit==='NOT_CLAIMED'&&result.installationSweep==='NOT_CLAIMED'&&result.engineeringAdmission===false&&result.runtimeAdmission===false,'PROOF_CLAIMS');
 const bytes=bound(row.closureRef,'closure');
 assert(bytes.at(-1)===10&&sha(bytes.subarray(0,bytes.length-1))===result.closureRfc8785Sha256,'PROOF_CLOSURE_HASH');
 const closure=JSON.parse(bytes);
 assert(closure.variantId===row.variantId&&closure.printedNumber===row.printedNumber&&closure.id===result.closureId,'CLOSURE_ROW_BINDING');
 assert(closure.graphHash===row.graphHash&&closure.beforeStateHash===row.beforeStateHash&&closure.afterStateHash===row.afterStateHash,'CLOSURE_STATE_BINDING');
 assert(closure.engineeringAdmission===false&&closure.runtimeAdmission===false&&closure.claims.physicalFit==='NOT_CLAIMED'&&closure.claims.installationSweep==='NOT_CLAIMED','CLOSURE_CLAIMS');
}
function verifyQualification(report){
 const q=report.qualification;assert(q&&Array.isArray(q.runs),'QUALIFICATION_MISSING');
 assert(q.runs.length===2&&new Set(q.runs.map(r=>r.label)).size===2,'QUALIFICATION_TWO_DISTINCT_RUNS');
 assert(q.runs.every(r=>r.status==='PASS'&&/^qualification-[ab]-[0-9]{2}$/.test(r.label)&&Number.isInteger(r.commands)&&r.commands>0&&r.commands===q.runs[0].commands),'QUALIFICATION_RUN_STATUS');
 const proofs=new Set(report.rows.map(r=>r.independentProofRef.rawSha256));
 assert(proofs.size===1&&q.runs.every(r=>r.closureProofRawSha256===[...proofs][0]),'QUALIFICATION_PROOF_BINDING');
 assert(q.rawOutputsMatch===true,'QUALIFICATION_RAW_OUTPUTS');
 assert(q.preservation&&q.preservation.status==='PASS','QUALIFICATION_PRESERVATION');
}
export function evaluate(report,options={}){
 const base=options.root??root;
 validateScope(report.productScope);assert.equal(report.rows.length,58,'EXACT_COVERAGE_ROWS');
 const keys=report.rows.map(r=>r.variantId+'/'+r.printedNumber);assert.equal(new Set(keys).size,58,'DUPLICATE_ROW');
 for(const v of report.productScope.activeProductVariants)assert.deepEqual(report.rows.filter(r=>r.variantId===v).map(r=>r.printedNumber),Array.from({length:29},(_,i)=>i+1),'MISSING_STEP_OR_VARIANT');
 for(const r of report.rows){assert.equal(r.productDisposition,'ACTIVE');assert.equal(r.engineeringStatus,'BLOCKED','ENGINEERING_PROMOTION');assert(['BLOCKED','INSTRUCTIONAL_ADMITTED'].includes(r.instructionalStatus));
  // Evidence is checked against an independent verifier result and the accepted replay, never promoted through row fields.
  if(r.instructionalStatus==='INSTRUCTIONAL_ADMITTED'){assert(r.completeAssemblyOutput===true,'ADMITTED_WITHOUT_OUTPUT');verifyAdmission(r,base);}
  else assert(r.completeAssemblyOutput===false,'UNPROVEN_COMPLETE_OUTPUT');}
 assert.deepEqual(report.preservedNonTarget,[{variantId:'rpi4',status:'PRESERVED_NON_TARGET',historicalGraphHash:'ce9dd71eb9728f1538e2fb311f99450cdafc0df96c91033cf0333e6bec51eac7',newOutputsRequired:false}]);
 assert.equal(report.engineeringAdmission,false);assert.equal(report.runtimeAdmission,false);
 if(report.rows.some(r=>r.instructionalStatus!=='INSTRUCTIONAL_ADMITTED'))return 'BLOCKED';
 verifyQualification(report);
 return 'PASS';
}
