import {H} from '../evidence/hash.mjs';
import {normalize} from '../evidence/identity.mjs';
// Only these contract-declared collections are sets. Operation, endpoint,
// contact-stack, route-guide and step order is never normalized away.
export const collections=new Set(['definitions','fastenerDefinitions','cableDefinitions','interfaces','connectionPoints','measurements','frames','claims','evidence','geometrySources','derivations','conflicts','tools','warnings','variants','unresolvedItems','mechanicalConnections','cableConnections','verificationRules','instances','consumableLots','consumableAllocations','subassemblies','allocations','ownedElementStates','jointCoordinates']);
export const idSets=new Set(['activeMechanicalConnectionIds','activeCableConnectionIds','requiredConditionIds','activeOwnedElements','memberInstanceIds','introducedInstanceIds','usedInstanceIds','preconditionRuleIds','postconditionRuleIds','zeroingConditionIds','verificationRuleIds','warningIds','toolRequirementIds']);
collections.add('inventoryLots');
export function ordered(value,key=''){
 if(Array.isArray(value)){
  const xs=value.map(v=>ordered(v));
  if(idSets.has(key))xs.sort();
  if(collections.has(key))xs.sort((a,b)=>{const id=x=>x.id??x.partDefinitionId??x.instanceId??x.lotId??x.pieceInstanceId??x.assemblyId??x.elementId??(x.connectionId+'/'+x.dof);return id(a)<id(b)?-1:id(a)>id(b)?1:0;});
  return xs;
 }
 if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,ordered(v,k)]));
 return value;
}
export const hash=(kind,value)=>H(kind,ordered(normalize(value)));
