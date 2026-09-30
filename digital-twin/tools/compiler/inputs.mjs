import fs from 'node:fs';
import path from 'node:path';
import {loadRegistry,twin,root} from '../evidence/semantic.mjs';
import {identities} from '../evidence/identity.mjs';
import {read} from '../evidence/hash.mjs';

export {hash} from './hash.mjs';
export function authoringInputs(){
 const r=loadRegistry(), ids=identities(r);
 const runtimeFields=['definitions','fastenerDefinitions','cableDefinitions','interfaces','connectionPoints','measurements','frames','claims','evidence','geometrySources','derivations','conflicts','tools','warnings','variants','unresolvedItems'];
 const registry={contractVersion:2,modelHash:ids.modelHash,...Object.fromEntries(runtimeFields.map(f=>[f,r[f]])),motions:[],cameras:[],visibility:[]};
 const family=(p)=>read(path.join(twin,'assemblies/v40',p));
 const initialStates=family('operations/initial-states.json');
 const descriptor=read(path.join(twin,'schemas/semantic-registry.json'));
 return {instances:r.instances,steps:family('steps/base.json'),operations:family('operations/operations.json'),mechanicalConnections:family('connections/mechanical.json'),cableConnections:family('connections/cables.json'),verificationRules:family('operations/verification-rules.json'),patches:family('variants/patches.json'),initialStates,registry,allocations:r.allocations,lots:r.lots,groups:family('operations/groups.json'),sourceIntents:family('steps/source-intents.json'),semanticContract:{descriptor,exactRevision:fs.readFileSync(path.join(root,descriptor.installationLocationRevision.path),'utf8')}};
}
