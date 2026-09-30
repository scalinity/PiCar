import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { loadRegistry, validateRegistry, inventoryCheck, root, twin, closure } from './evidence/semantic.mjs';
import { read, fileHash, jcs } from './evidence/hash.mjs';
import { identities, modelInput, evidenceInput, createHashPolicy, validateHashInputs } from './evidence/identity.mjs';
const write=(p,v)=>fs.writeFileSync(path.join(twin,p),JSON.stringify(v,null,2)+'\n');
if(process.argv[2]!=='validate')throw Error('M1 authoring CLI supports validate only.');
function summaryCounts(reg){return ['rpi4','rpi5','rpi-zero-2-w'].map(variantId=>({variantId,categories:Object.fromEntries(['plannedInstalled','backup','variantUnused','accessory','tool','consumable','unresolved'].map(k=>[k,reg.allocations.filter(a=>a.variantId===variantId&&a.disposition===k).length])),observedPhysicalStock:{status:'BLOCKED',reason:'NOT OBSERVED'}}));}
const reg=loadRegistry(),seed=read(path.join(twin,'components/inventory/planning-steps.json'));
const sourceBlockers=read(path.join(twin,'evidence/records/blocker-source-records.json'));
if(!jcs(sourceBlockers).equals(jcs(read(path.join(root,'docs/digital-twin/MACHINE_READABLE_SCHEMAS/blocker-register.json')))))throw Error('BLOCKER_PROVENANCE_DRIFT');
if(sourceBlockers.items.length!==reg.unresolvedItems.length)throw Error('BLOCKER_COVERAGE');
for(const q of sourceBlockers.items){const current=reg.unresolvedItems.find(r=>r.id===q.id);if(!current||current.missingClaim!==q.missingEvidence||!current.permittedWork.includes(q.permittedWork)||!current.resolutionCriteria.includes(q.resolutionCriteria)||current.ownerMilestone!==q.ownerMilestone.split('/')[0])throw Error('BLOCKER_SOURCE_SCOPE_DRIFT');}
const result=validateRegistry(reg,{steps:seed.steps});
const inventory=inventoryCheck(reg,read(path.join(twin,'components/inventory/printed-hardware.json')));
const policy=createHashPolicy();write('hash-inputs.json',policy);validateHashInputs(policy);
const ids=identities(reg);
write('validation/model-input.json',modelInput(reg));
write('validation/evidence-input.json',evidenceInput(reg));
write('validation/typed-reference-index.json',[...result.index].map(([id,{type}])=>({id,type})).sort((a,b)=>a.id<b.id?-1:1));
write('validation/printed-inventory-report.json',{status:'PASS',scope:'Printed planning stock only',...inventory,dispositions:reg.allocations,categoryCounts:summaryCounts(reg),unresolvedAllocations:read(path.join(twin,'components/inventory/unresolved-allocations.json'))});
const impact=reg.unresolvedItems.map(q=>{
 const affected=closure(result.edges,[q.id]);return {blockerId:q.id,status:q.status,affectedClaimIds:affected.filter(id=>result.index.get(id)?.type==='Claim'),affectedDefinitionIds:affected.filter(id=>result.index.get(id)?.type==='PartDefinition'),affectedInterfaceIds:affected.filter(id=>['MechanicalInterface','ConnectionPoint'].includes(result.index.get(id)?.type)),affectedStepIds:[...new Set([...q.affectedStepIds,...affected.filter(id=>result.index.get(id)?.type==='PlanningStep')])].sort(),variantIds:q.variantIds,futureImpact:{ownerMilestone:q.ownerMilestone,gates:q.id==='Q-18'?['M13','M14']:['G-CAD','G-GEOMETRY'],rule:'Close evidence first, then revalidate every transitive dependent; geometry remains blocked until its scoped gate passes.'},dependencyClosure:affected};});
write('validation/unresolved-impact.json',{contractVersion:2,edges:result.edges,blockers:impact,supersessionImpact:result.supersessionImpact});
const summary={status:'PASS',scope:'M1 canonical schema/semantic authoring; no geometry/observed inventory/graph proof',...ids,familyCounts:Object.fromEntries(Object.entries(reg).map(([k,v])=>[k,v.length])),typedReferences:result.referenceCount,planningSteps:seed.steps.length,variants:reg.variants.map(v=>v.variantId),openConflicts:reg.conflicts.filter(c=>c.status==='open').map(c=>c.id),openBlockers:reg.unresolvedItems.filter(q=>q.status==='OPEN').map(q=>q.id),physicalInventory:'BLOCKED / NOT OBSERVED',cad:'NOT APPLICABLE',semanticValidatorSha256:fileHash(path.join(twin,'tools/evidence/semantic.mjs'))};
write('validation/schema-semantic-report.json',summary);console.log(JSON.stringify(summary,null,2));
