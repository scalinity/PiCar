import fs from 'node:fs';
import path from 'node:path';
import { read, fileHash, H, sortedRecords } from './hash.mjs';
import { root, twin, acyclic } from './semantic.mjs';
const setFields=new Set(['evidenceRefs','sourceRefs','inputClaimIds','inputMeasurementIds','claimIds','conflictIds','blockerIds','supersedes','variantIds','geometrySourceRefs','measurementRefs','interfaceRefs','connectionPointRefs','boardIdentityClaimIds','affectedFeatureIds','affectedStepIds','resolutionEvidenceRefs','targetIds','evidenceRequirementIds','invalidationDependencyIds','requiredFeatureIds','eligibilityRuleIds','matingRuleIds','toleranceRefs','netClaimIds','keyingClaimIds','gripRangeRefs','endpointConnectorRefs','strainReliefRuleIds','applicabilityRuleIds','forbiddenCombinationRuleIds','triggerRuleIds','activeInstanceIds','inactiveInstanceIds']);
export function normalize(value,key=''){
 if(Array.isArray(value)){const result=value.map(v=>normalize(v));return setFields.has(key)?result.sort():result;}
 if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,normalize(v,k)]));
 return value;
}
export function modelInput(registry){
 const mechanical=['definitions','instances','measurements','interfaces','connectionPoints','fastenerDefinitions','cableDefinitions','claims','frames','derivations','conflicts','lots','allocations','verificationRules','variants','plannedUses'];
 const records={contractVersion:2};
 for(const family of mechanical){
  records[family]=registry[family].filter(r=>family!=='claims'||r.scope!=='appearance').map(r=>{
   const value=structuredClone(r);
   if(family==='definitions'){delete value.name;delete value.appearanceRefs;delete value.geometrySourceRefs;}
   if(family==='instances')delete value.installedByOperationRef;
   return normalize(value);
  });
  records[family]=family==='allocations'?records[family].sort((a,b)=>(a.variantId+'/'+a.instanceId)<(b.variantId+'/'+b.instanceId)?-1:(a.variantId+'/'+a.instanceId)>(b.variantId+'/'+b.instanceId)?1:0):sortedRecords(records[family]);
 }
 records.sourceGeneratorInputs=sortedRecords(registry.geometrySources).map(g=>({id:g.id,sourceRefs:normalize(g.sourceRefs,'sourceRefs'),sourceRevision:g.sourceRevision,generatorArtifact:normalize(g.generatorArtifact)}));
 return records;
}
export function evidenceInput(registry){return sortedRecords(registry.evidence).map(e=>{const v=structuredClone(e);delete v.retrievedOn;return normalize(v);});}
export function schemaInput(){return fs.readdirSync(path.join(twin,'schemas')).filter(n=>n.endsWith('.json')).sort().map(n=>({path:'schemas/'+n,sha256:fileHash(path.join(twin,'schemas',n))}));}
export function identities(registry){return {schemaHash:H('schema',schemaInput()),evidenceHash:H('evidence',evidenceInput(registry)),modelHash:H('model',modelInput(registry))};}
export function validateHashInputs(policy,{scan=true}={}){
 const edges=Object.fromEntries(policy.identities.map(i=>[i.name,i.dependsOn]));acyclic(edges,'HASH_INPUT_CYCLE');
 const stageByName=Object.fromEntries(policy.identities.map(i=>[i.name,i.stage]));
 for(const i of policy.identities){if(i.dependsOn.some(dep=>stageByName[dep]===undefined))throw Error('UNKNOWN_HASH_DEPENDENCY');if(i.dependsOn.some(dep=>stageByName[dep]>i.stage))throw Error('DOWNSTREAM_HASH_DEPENDENCY');if(i.sourceFiles.some(p=>[i.outputPath,...(i.outputPaths??[])].includes(p)))throw Error('OUTPUT_AS_OWN_INPUT');}
 const classified=new Set(policy.inputs.map(i=>i.path));
 if(classified.size!==policy.inputs.length)throw Error('DUPLICATE_HASH_CLASSIFICATION');
 for(const i of policy.inputs){if(!i.family||!i.projection||!i.stage||!['authored','generated'].includes(i.role))throw Error('UNCLASSIFIED_HASH_INPUT');if(i.role==='generated'&&i.hashKinds.some(k=>['schemaHash','evidenceHash','modelHash'].includes(k)))throw Error('OUTPUT_AS_OWN_INPUT');}
 for(const identity of policy.identities)for(const p of identity.sourceFiles)if(!classified.has(p))throw Error('UNCLASSIFIED_HASH_INPUT: '+p);
 if(scan){const walk=p=>fs.readdirSync(p,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(p,e.name)):[path.relative(twin,path.join(p,e.name))]);
  const actual=['schemas','components','evidence/records','evidence/conflicts'].flatMap(d=>walk(path.join(twin,d))).filter(p=>p.endsWith('.json'));actual.push('evidence/sources.lock.json');
  for(const p of actual)if(!classified.has(p))throw Error('UNCLASSIFIED_HASH_INPUT: '+p);
  for(const dir of policy.m2ScanDirectories??[])for(const p of walk(path.join(twin,dir)).filter(p=>/\.(json|md|mjs|tap|txt)$/.test(p)))if(!classified.has(p))throw Error('UNCLASSIFIED_HASH_INPUT: '+p);
 }
 return true;
}
export function createHashPolicy(){
 const index=read(path.join(twin,'components/inventory/registry-index.json'));const inputs=[];
 for(const n of fs.readdirSync(path.join(twin,'schemas')).filter(n=>n.endsWith('.json')).sort())inputs.push({path:'schemas/'+n,family:'schema',projection:'Exact raw bytes indexed by relative path; includes semantic/gate descriptors.',role:'authored',stage:'M1',hashKinds:['schemaHash']});
 for(const [family,p]of Object.entries(index.families))inputs.push({path:p,family,projection:family==='evidence'?'All EvidenceRecord fields except retrievedOn; preserve revision, locators, privacy, applicability, limitations and exact artifact hash.':family==='definitions'?'All mechanical fields except name, appearanceRefs and generated geometrySourceRefs.':family==='instances'?'All identity/inventory fields except installedByOperationRef (future graph binding).':family==='geometrySources'?'sourceGeneratorInputs only: id, sorted sourceRefs, sourceRevision and normalized generatorArtifact; exclude output artifact/maturity/report references.':family==='claims'?'Canonical scoped Claim values excluding appearance scope; normalize set-like ID arrays.':'Canonical family records; sorted by stable identity. model-input projection implemented by tools/evidence/identity.mjs; M1 empty future families do not imply later admission.',role:'authored',stage:'M1',hashKinds:family==='evidence'?['evidenceHash']:['tools','warnings','unresolvedItems'].includes(family)?[]:['modelHash']});
 for(const [p,family]of [['components/inventory/registry-index.json','registryOwnership'],['components/inventory/printed-hardware.json','printedInventory'],['components/inventory/unresolved-allocations.json','unresolvedAllocation'],['components/inventory/planning-steps.json','planningSeed'],['evidence/sources.lock.json','sourceLock'],['evidence/records/blocker-source-records.json','auditedBlockerProvenance']])inputs.push({path:p,family,projection:'Bound raw source input for validation; planning data is not executable graph data.',role:'authored',stage:'M1',hashKinds:[]});
 inputs.push({path:'tools/evidence/sum-v1.json',family:'immutableDerivationMethod',projection:'Exact method artifact raw hash included in every DerivationRecord.',role:'authored',stage:'M1',hashKinds:['modelHash']});
 for(const [p,family]of [['validation/model-input.json','modelPreimageMaterialization'],['validation/evidence-input.json','evidencePreimageMaterialization'],['validation/typed-reference-index.json','typedClosureReport'],['validation/unresolved-impact.json','blockerImpactReport'],['validation/printed-inventory-report.json','inventoryReport'],['validation/schema-semantic-report.json','semanticReport'],['validation/hash-cross-language-report.json','hashConformanceReport']])inputs.push({path:p,family,projection:'Generated validation output/cache; recompute from authored inputs; never a source for its own identity.',role:'generated',stage:'M1',hashKinds:[]});
 const contracts={
 schemaHash:[1,[],'H(schema, sorted relative schema/descriptor paths + raw SHA256).'],evidenceHash:[1,[],'H(evidence, EvidenceRecord projection excluding retrieval timestamps only).'],modelHash:[1,[],'H(model, materialized model-input.json; authored mechanical records only, no generated geometry/solutions/meshes or maturity).'],graphHash:[2,['modelHash'],'H(graph, variant graph-input: ordered operations/steps, connections, copied referenced rule/measurement/procedure/warning/motion values, semantic initialState excluding graphHash/modelHash/stateHash/stockDispositionHash).'],toolchainHash:[4,[],'Exact locks, OS/container, architecture, normalized build options; no wall-clock paths/times.'],cadHash:[7,['modelHash','toolchainHash'],'Sorted generated CAD raw hashes and independent feature-table hashes.'],solverHash:[7,['modelHash','toolchainHash'],'Solver implementation/config/input constraint policy, excludes solution artifact.'],solutionsHash:[7,['graphHash','cadHash','solverHash'],'Sorted solution IDs + final document raw hashes. No solutionsHash in solution.'],meshHash:[8,['cadHash','toolchainHash'],'Final GLB/texture/decoder paths, raw hash/length, ownership/LOD; no reports/root manifest.'],packHash:[8,['graphHash','solutionsHash','meshHash','toolchainHash'],'H(pack, RuntimeManifest omitting only top-level packHash).'],stockDispositionHash:[2,[],'H(stock, complete instance ID/location/parent/owned-state, lots and allocations sorted by ID).'],stateHash:[2,['graphHash','modelHash','stockDispositionHash'],'H(state, complete AssemblyState omitting only top-level stateHash after stock recomputation).']};
 return {contractVersion:2,domainPrefix:'picar-v2:<kind>\\n',canonicalization:'RFC8785 UTF-8; strict input validation before canonicalization',setLikeIdFields:[...setFields].sort(),authoredOrderArrays:['operations','steps','contactStack','guideEndpoints','motionSegments','replaceOperationIds','withOperationIds'],inputs,identities:Object.entries(contracts).map(([name,[stage,dependsOn,projection]])=>({name,stage,dependsOn,projection,status:stage===1?'implemented':'contractOnly',sourceFiles:inputs.filter(i=>i.hashKinds.includes(name)).map(i=>i.path),outputPath:name==='modelHash'?'validation/model-input.json':name==='evidenceHash'?'validation/evidence-input.json':null})),laterArtifactPolicy:'No later milestone artifact generated merely to fill a hash slot.'};
}
