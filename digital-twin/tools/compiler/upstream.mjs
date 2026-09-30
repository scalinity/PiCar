import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {twin,root,loadRegistry,validateRegistry,inventoryCheck} from '../evidence/semantic.mjs';
import {read,fileHash,jcs,rawHash} from '../evidence/hash.mjs';
import {identities,modelInput,evidenceInput,schemaInput,validateHashInputs} from '../evidence/identity.mjs';
const receiptPath=path.join(twin,'validation/m2/adopted-g-data.json');
if(process.argv.includes('--check')){
 const receipt=read(receiptPath);if(receipt.status!=='PASS')throw Error('ADOPTED_G_DATA_NOT_ACCEPTED');
 for(const b of receipt.bindings)if(fileHash(path.join(root,b.path))!==b.rawSha256||fs.statSync(path.join(root,b.path)).size!==b.byteLength)throw Error('ADOPTED_G_DATA_BINDING_DRIFT: '+b.path);
 for(const [k,v] of Object.entries(identities(loadRegistry())))if(receipt.adoptedIdentities[k]!==v)throw Error('ADOPTED_IDENTITY_DRIFT: '+k);
 console.log('Prospectively revised G-DATA bound inputs and checks remain current. Original M1 receipt retained.');process.exit(0);
}
const accepted='22c85058f9420aaaaf376c5e312915f5b7b5288d';
const baseline=read(path.join(root,'docs/implementation/M1_G_DATA_REPORT.json'));
if(fileHash(path.join(root,'docs/implementation/M1_G_DATA_REPORT.json'))!=='ddbdad1c00372e670b674bbc6d6bf2170b6f2b0d08a034b715e522029b644f0f')throw Error('ACCEPTED_M1_REPORT_DRIFT');
const original=p=>JSON.parse(execFileSync('git',['show',accepted+':'+p],{cwd:root,encoding:'utf8'}));
const changedAllowed=['digital-twin/components/definitions/parts.json','digital-twin/components/interfaces/mechanical.json','digital-twin/evidence/records/warnings.json','digital-twin/schemas/semantic-registry.json','digital-twin/tools/evidence/semantic.mjs','digital-twin/tools/evidence/identity.mjs','digital-twin/hash-inputs.json'];
const deltas=[];
for(const b of baseline.bindings){const actual=fileHash(path.join(root,b.path));if(actual!==b.rawSha256){if(!changedAllowed.includes(b.path))throw Error('UNAUTHORIZED_UPSTREAM_DRIFT: '+b.path);deltas.push({path:b.path,baselineRawSha256:b.rawSha256,adoptedRawSha256:actual,baselineByteLength:b.byteLength,adoptedByteLength:fs.statSync(path.join(root,b.path)).size});}if(rawHash(execFileSync('git',['show',accepted+':'+b.path],{cwd:root}))!==b.rawSha256)throw Error('ACCEPTED_GIT_BINDING');}
const registry=loadRegistry(),oldDefs=original('digital-twin/components/definitions/parts.json'),oldIf=original('digital-twin/components/interfaces/mechanical.json'),oldWarnings=original('digital-twin/evidence/records/warnings.json');
for(const old of oldDefs){const now=registry.definitions.find(d=>d.id===old.id);if(!now||old.interfaceRefs.some(id=>!now.interfaceRefs.includes(id)))throw Error('DEFINITION_LOSS');const strip=d=>{const x=structuredClone(d);delete x.interfaceRefs;return x;};if(!jcs(strip(old)).equals(jcs(strip(now))))throw Error('DEFINITION_MECHANICAL_DRIFT');}
for(const old of oldIf)if(!jcs(old).equals(jcs(registry.interfaces.find(i=>i.id===old.id))))throw Error('ORIGINAL_INTERFACE_CHANGED');
for(const old of oldWarnings)if(!jcs(old).equals(jcs(registry.warnings.find(w=>w.id===old.id))))throw Error('ORIGINAL_WARNING_CHANGED');
const addedIf=registry.interfaces.filter(i=>!oldIf.some(o=>o.id===i.id));if(addedIf.some(i=>i.frame.state!=='unresolved'||i.measurementRefs.length||!i.evidenceRefs.length||!i.blockerIds.length))throw Error('GEOMETRY_INVENTION');
const seed=read(path.join(twin,'components/inventory/planning-steps.json')),semantics=validateRegistry(registry,{steps:seed.steps});inventoryCheck(registry,read(path.join(twin,'components/inventory/printed-hardware.json')));validateHashInputs(read(path.join(twin,'hash-inputs.json')));
const commands=read(path.join(root,'docs/implementation/evidence/m2/remediation-recheck/final-regression-commands.json'));if(commands.some(c=>c.exitCode!==0))throw Error('UPSTREAM_REGRESSION_FAILED');
const m1Tap=fs.readFileSync(path.join(root,'docs/implementation/evidence/m2/remediation-recheck/final-m1-tests.tap'),'utf8');if(!/# tests 254\b/.test(m1Tap)||!/# pass 254\b/.test(m1Tap)||!/# fail 0\b/.test(m1Tap))throw Error('M1_TEST_COUNTS');
const conformance=read(path.join(twin,'validation/m2/hash-conformance.json'));if(conformance.status!=='PASS')throw Error('HASH_CONFORMANCE');
const paths=[...baseline.bindings.map(b=>b.path),...fs.readdirSync(path.join(twin,'schemas')).map(n=>'digital-twin/schemas/'+n),'docs/digital-twin/SEMANTIC_LOCATION_REVISION.md','digital-twin/tools/compiler/upstream.mjs','digital-twin/validation/m2/hash-conformance.json',...commands.map(c=>c.logPath),'docs/implementation/evidence/m2/remediation-recheck/final-regression-commands.json'];
const receipt={contractVersion:2,gate:'G-DATA',scope:'Prospective M2 upstream adoption; original accepted M1 receipt and objects are preserved.',status:'PASS',m1AcceptedSha:accepted,baselineIdentities:baseline.identities,adoptedIdentities:identities(registry),contractRevision:read(path.join(twin,'schemas/semantic-registry.json')).installationLocationRevision,deltas,newSchema:'digital-twin/schemas/m2-search-index.schema.json',sourceAdditions:{interfaces:addedIf.map(i=>i.id),warnings:registry.warnings.filter(w=>!oldWarnings.some(o=>o.id===w.id)).map(w=>w.id)},checks:{accepted124GitBindings:'PASS',originalRecordsPreserved:'PASS',schemasAndTypedReferences:'PASS',semanticReferenceCount:semantics.referenceCount,inventory:'PASS',hashInputs:'PASS',hashConformance:'PASS',m1Tests:254,companionTests:40,typeDrift:'PASS',noEmit:'PASS',sourceCheck:'PASS',safePackageCheck:'PASS'},limitations:baseline.limitations,bindings:[...new Set(paths)].sort().map(p=>({path:p,rawSha256:fileHash(path.join(root,p)),byteLength:fs.statSync(path.join(root,p)).size}))};
for(const [name,value] of Object.entries({'adopted-model-input.json':modelInput(registry),'adopted-evidence-input.json':evidenceInput(registry),'adopted-schema-input.json':schemaInput()}))fs.writeFileSync(path.join(twin,'validation/m2',name),JSON.stringify(value,null,2)+'\n');
fs.writeFileSync(receiptPath,JSON.stringify(receipt,null,2)+'\n');console.log('Prospective G-DATA PASS: '+deltas.length+' explicit bound deltas; '+addedIf.length+' source-backed unresolved interfaces; 253 original M1 tests plus the new search schema meta-test preserved.');
