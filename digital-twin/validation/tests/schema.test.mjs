import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { root, twin, validateShape } from '../../tools/evidence/semantic.mjs';
import { read, fileHash } from '../../tools/evidence/hash.mjs';
const spec=path.join(root,'docs/digital-twin');
const ajv=new Ajv2020({strict:false,allErrors:true});addFormats(ajv);
for(const n of fs.readdirSync(path.join(twin,'schemas')).filter(n=>n.endsWith('.schema.json'))){const s=read(path.join(twin,'schemas',n));test('production schema meta-validation: '+n,()=>assert.equal(ajv.validateSchema(s),true));ajv.addSchema(s);}
for(const p of read(path.join(spec,'AUDIT_EVIDENCE/schema-probes.json')).probes){const c=p.current;if(!c)continue;test('audited current shape: '+p.name,()=>{
 const type=c.definition??p.definition;let valid;
 if(type.startsWith('@'))valid=ajv.getSchema(read(path.join(twin,'schemas',type.slice(1))).$id)(c.value);
 else try{validateShape(type,c.value);valid=true;}catch(e){assert.match(e.message,/SCHEMA_/);valid=false;}
 assert.equal(valid,c.expectedValid);
});}
const examples={'part-definition':'PartDefinition','mechanical-interface':'MechanicalInterface','printed-designation-claim':'Claim','numeric-unresolved':'NumericValue','numeric-derived-schema-only':'NumericValue','numeric-unresolved-with-value':'NumericValue','numeric-derived-without-method':'NumericValue','verified-claim-without-evidence':'Claim','unknown-field-definition':'PartDefinition'};
for(const name of fs.readdirSync(path.join(spec,'MACHINE_READABLE_SCHEMAS/examples'))){test('audited example: '+name,()=>{const type=examples[name.split('.').slice(0,-2).join('.')],r=read(path.join(spec,'MACHINE_READABLE_SCHEMAS/examples',name));if(name.includes('.valid.'))validateShape(type,r);else assert.throws(()=>validateShape(type,r),/SCHEMA_/);});}
test('audited v2 production schema and wrappers are byte-preserved',()=>{for(const n of fs.readdirSync(path.join(spec,'MACHINE_READABLE_SCHEMAS')).filter(n=>n.endsWith('.schema.json')))assert.equal(fileHash(path.join(twin,'schemas',n)),fileHash(path.join(spec,'MACHINE_READABLE_SCHEMAS',n)));});
