import type { AssemblySession } from '../../generated/twin/contracts';
import { assemblyPartHref, assemblyStepHref } from '../../lib/router';
import { rawHash } from './hash';
import {validateSearch} from '../../platform/session-validators.js';
const loaders={rpi4:()=>import('../../../../digital-twin/validation/m2/rpi4/search-index.json?raw'),rpi5:()=>import('../../../../digital-twin/validation/m2/rpi5/search-index.json?raw'),'rpi-zero-2-w':()=>import('../../../../digital-twin/validation/m2/rpi-zero-2-w/search-index.json?raw')};
const hashes={rpi4:'a63db82dba185298c3c5bc4546956d3ce126b180f5b188f6861296961eb14f1b',rpi5:'c2036f2f990a1642d08c91d65d127d3e316cfb695e4024a0f681fd1456b65cc1','rpi-zero-2-w':'9a967d09f5fd61f9463f55bff93976f47026d6012fe8a836e79575ed8fc99ca0'};
export type AssemblyHit={label:string;href:string;disposition:string};
export async function assemblySearch(s:AssemblySession,q:string,reviewStep?:number):Promise<AssemblyHit[]>{
 const raw=(await loaders[s.variantId]()).default;
 if(rawHash(raw)!==hashes[s.variantId])throw Error('SEARCH_INDEX_DRIFT');
 const index=JSON.parse(raw);
 if(!validateSearch(index)||index.graphHash!==s.graphHash||index.variantId!==s.variantId)throw Error('SEARCH_BINDING');
 const results=index.results as {kind:string;label:string;id:string;printedNumber?:number;disposition?:string}[];
 return results.filter(r=>`${r.label} ${r.id}`.toLowerCase().includes(q.trim().toLowerCase())).slice(0,20).map(r=>({label:r.label,href:r.kind==='assemblyStep'?assemblyStepHref(s.id,s.variantId,r.printedNumber!):assemblyPartHref(s.id,s.variantId,r.id,r.disposition!,reviewStep??Number(s.reviewStepId.slice(-2))),disposition:r.disposition??'source-backed step'}));
}
