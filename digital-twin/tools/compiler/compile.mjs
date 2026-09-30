import fs from 'node:fs';
import path from 'node:path';
import {compileGraph} from '../../../picarx-companion/src/domain/assembly/compiler.ts';
import {validateShape,root} from '../evidence/semantic.mjs';
import {authoringInputs,hash} from './inputs.mjs';
import {validateGraphReferences} from '../../../picarx-companion/src/domain/assembly/references.ts';
const authoring=authoringInputs();
const write=(p,v)=>{fs.mkdirSync(path.dirname(path.join(root,p)),{recursive:true});fs.writeFileSync(path.join(root,p),JSON.stringify(v,null,2)+'\n');};
write('digital-twin/assemblies/v40/operations/initial-states.json',authoring.initialStates);
write('digital-twin/validation/m2/runtime-registry.json',authoring.registry);
for(const variant of ['rpi4','rpi5','rpi-zero-2-w']){
 const {graph,graphInput}=compileGraph(authoring,variant,hash,validateShape);
 write('digital-twin/validation/m2/'+variant+'/compiled-graph.json',graph);
 write('digital-twin/validation/m2/'+variant+'/graph-input.json',graphInput);
 write('digital-twin/validation/m2/'+variant+'/initial-state.json',graph.initialState);
 const closure={owners:[]};const referenceCount=validateGraphReferences(graph,authoring.registry,closure);write('digital-twin/validation/m2/'+variant+'/typed-reference-index.json',{status:'PASS',variantId:variant,graphHash:graph.graphHash,referenceCount,owners:closure.owners});
 const results=[...graph.steps.map(s=>({kind:'assemblyStep',id:s.id,label:s.title,printedNumber:s.printedNumber,sourceRefs:s.sourceRefs,destination:{kind:'assemblyStep',variantId:variant,stepId:s.id}})),...graph.instances.map(i=>{const d=authoring.registry.definitions.find(d=>d.id===i.definitionId);return {kind:'assemblyPart',id:i.id,label:d.name+' — '+i.role,definitionId:i.definitionId,disposition:authoring.allocations.find(a=>a.variantId===variant&&a.instanceId===i.id).disposition,stepRefs:graph.steps.filter(s=>s.usedInstanceIds.includes(i.id)||s.introducedInstanceIds.includes(i.id)).map(s=>s.id),sourceRefs:authoring.registry.claims.find(c=>c.id===d.identityClaimId).evidenceRefs,destination:{kind:'assemblyPart',variantId:variant,instanceId:i.id}};}).sort((a,b)=>a.id<b.id?-1:a.id>b.id?1:0)];
 write('digital-twin/validation/m2/'+variant+'/search-index.json',{contractVersion:2,variantId:variant,graphHash:graph.graphHash,results});
 console.log(variant+': '+graph.operations.length+' operations, '+graph.steps.length+' steps; graph '+graph.graphHash);
}
