import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { read } from '../../tools/evidence/hash.mjs';
import { root,endpointCheck,patchCheck,closure,frameCheck } from '../../tools/evidence/semantic.mjs';
// Finite audit probes remain distinct from production registry validation.
function errors(kind,x){
 const out=[];
 if(kind==='runtimeTransform'){try{frameCheck(x);}catch{out.push('NON_UNIT_QUATERNION');}}
 if(kind==='idRegistry'&&new Set(x.ids).size!==x.ids.length)out.push('DUPLICATE_ID');
 if(kind==='endpoint'){const ix=new Map([...Object.entries(x.instances).map(([id,definitionId])=>[id,{type:'PartInstance',record:{definitionId}}]),...Object.entries(x.interfaces).map(([id,definitionId])=>[id,{type:'MechanicalInterface',record:{definitionId}}])]);try{endpointCheck(x.endpoint,ix);}catch(e){out.push(e.message);}}
 if(kind==='variantPatch'){
  try{patchCheck({replaceOperationIds:x.replace,activeInstanceIds:[],inactiveInstanceIds:[]},x.base);}catch(e){out.push(e.message);}
  if(x.active.some(id=>x.inactive.includes(id)))out.push('VARIANT_OVERLAP');
 }
 if(kind==='m0'){
  const complete=x.checks.length===7&&new Set(x.checks.map(c=>c.id)).size===7&&x.checks.every(c=>'ABCDEFG'.includes(c.id));
  if(!complete)out.push('M0_CHECK_SET');if(x.m1Allowed!==(complete&&x.checks.every(c=>c.status==='PASS')))out.push('M0_PERMISSION');if(x.nativeFeasibility==='BLOCKED'&&!x.nativeBlocker)out.push('MISSING_NATIVE_BLOCKER');
 }
 if(kind==='sourceLock'&&x.status==='VERIFIED'){
  if(x.panels.map(p=>p.printedStep).sort((a,b)=>a-b).join(',')!==Array.from({length:29},(_,i)=>i+1).join(','))out.push('PANEL_SET');
  for(const p of x.panels){const covered=new Set(p.mappings.flatMap(m=>m.variants));for(const m of p.mappings){const[a,b,c,d]=m.normalizedRect;if(!(a<c&&b<d)&&!out.includes('INVALID_PANEL_RECT'))out.push('INVALID_PANEL_RECT');}if(p.printedStep<=4&&['rpi4','rpi5','rpi-zero-2-w'].some(v=>!covered.has(v))&&!out.includes('BRANCH_COVERAGE'))out.push('BRANCH_COVERAGE');}
  if(x.sharedCommit!==x.sharedGitlink)out.push('SHARED_GITLINK');
 }
 if(kind==='closure'&&closure(x.edges,x.roots).some(id=>!x.reported.includes(id)))out.push('INCOMPLETE_DEPENDENCY_CLOSURE');
 if(kind==='sourceScope'&&x.outcome==='PASS'&&x.requestedScope==='nominalEngineering'&&['referenceApproximation','printedDesignation','printedInventory','appearance'].includes(x.sourceScope))out.push('SOURCE_SCOPE_PROMOTION');
 if(kind==='phaseReceipt'&&x.production&&x.receiptScope==='fixtureOnly')out.push('FIXTURE_AS_PRODUCTION');
 return out;
}
for(const f of read(path.join(root,'docs/digital-twin/AUDIT_EVIDENCE/semantic-fixtures.json')).fixtures)test('audited finite semantic fixture: '+f.name,()=>assert.deepEqual(errors(f.kind,f.data),f.expectedErrors));
