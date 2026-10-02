import { useSyncExternalStore } from 'react';
export type Route =
 | {name:'home'} | {name:'wizard';step:string} | {name:'reference';page:string;section?:string;returnTo?:string} | {name:'videos';slug?:string;returnTo?:string}
 | {name:'assembly';sessionId?:string;printedStep?:number;partId?:string} | {name:'studio';variant?:StudioVariant;step?:number} | {name:'routeError';message:string};
export type StudioVariant = 'rpi5'|'rpi-zero-2-w';
const subscribe=(cb:()=>void)=>{window.addEventListener('hashchange',cb);return()=>window.removeEventListener('hashchange',cb);};
export const useHash=():string=>useSyncExternalStore(subscribe,()=>window.location.hash||'#/');
export const navigate=(to:string):void=>{window.location.hash=to;};
export function parseRoute(hash:string):Route{
 try{
  const [path,query]=hash.replace(/^#\/?/,'').split('?'),params=new URLSearchParams(query??'');
  const segs=path.split('/').filter(Boolean).map(decodeURIComponent);
  const candidate=params.get('return')??undefined,returnTo=candidate&&/^#\/assembly\/(PX|TEST)-[A-Z0-9-]+\/step\/(?:[1-9]|1[0-9]|2[0-9])$/.test(candidate)?candidate:undefined;
  if(segs[0]==='wizard')return {name:'wizard',step:segs[1]??''};
  if(segs[0]==='reference')return {name:'reference',page:segs.slice(1).join('/'),section:params.get('s')??undefined,...(returnTo?{returnTo}:{})};
  if(segs[0]==='videos')return {name:'videos',slug:segs[1],...(returnTo?{returnTo}:{})};
  if(segs[0]==='assembly'){
   if(segs.length===1)return {name:'assembly'};
   if(!/^(PX|TEST)-[A-Z0-9-]+$/.test(segs[1]))throw Error('Invalid session ID');
   if(segs.length===2)return {name:'assembly',sessionId:segs[1]};
   if(segs[2]==='step'&&segs.length===4&&/^(?:[1-9]|1[0-9]|2[0-9])$/.test(segs[3]))return {name:'assembly',sessionId:segs[1],printedStep:Number(segs[3])};
   if(segs[2]==='part'&&segs.length===4&&/^(PX|TEST)-[A-Z0-9-]+$/.test(segs[3]))return {name:'assembly',sessionId:segs[1],partId:segs[3],...(params.get('review')?{printedStep:Number(params.get('review'))}:{})};
   throw Error('Unknown assembly destination');
  }
  if(segs[0]==='studio'){
   if(segs.length===1)return {name:'studio'};
   if(segs[1]!=='rpi5'&&segs[1]!=='rpi-zero-2-w')throw Error('Studio covers the Raspberry Pi 5 and Zero 2 W builds only');
   if(segs.length===2)return {name:'studio',variant:segs[1]};
   if(segs.length===3&&/^[0-9]$/.test(segs[2]))return {name:'studio',variant:segs[1],step:Number(segs[2])};
   throw Error('Unknown Studio step');
  }
  return {name:'home'};
 }catch(e){return {name:'routeError',message:e instanceof URIError?'Malformed URL escape':e instanceof Error?e.message:'Invalid route'};}
}
export const refHref=(page:string,section?:string):string=>`#/reference/${page}${section?`?s=${section}`:''}`;
function sessionBinding(sessionId:string,variantId:string):void{if(!/^(PX|TEST)-[A-Z0-9-]+$/.test(sessionId)||!['rpi4','rpi5','rpi-zero-2-w'].includes(variantId))throw Error('ROUTE_CONTEXT');}
export function assemblyStepHref(sessionId:string,variantId:string,number:number):string{sessionBinding(sessionId,variantId);if(!Number.isInteger(number)||number<1||number>29)throw Error('STEP_ID');return `#/assembly/${sessionId}/step/${number}`;}
export function assemblyPartHref(sessionId:string,variantId:string,id:string,disposition:string,reviewStep?:number):string{sessionBinding(sessionId,variantId);if(!/^(PX|TEST)-[A-Z0-9-]+$/.test(id))throw Error('PART_ID');if(!['unresolved','plannedInstalled','consumable','backup','variantUnused','tool','accessory','available','tray','assembly','discarded'].includes(disposition))throw Error('PART_DISPOSITION');return `#/assembly/${sessionId}/part/${id}${reviewStep?`?review=${reviewStep}`:''}`;}
export const studioHref=(variant:StudioVariant,step:number):string=>`#/studio/${variant}/${step}`;
