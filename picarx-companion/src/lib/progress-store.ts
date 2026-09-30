import { useSyncExternalStore } from 'react';
import { getStore, useCompanion, updateSetup, saveError } from '../features/assembly-session/store';
import { M3_ENABLED } from './m3-enabled';
export interface Progress { steps: Record<string,'done'>; checks: Record<string,boolean>; lastRoute:string; pdfLastPage:number }
const defaults:Progress={steps:{},checks:{},lastRoute:'',pdfLastPage:1};
const subs=new Set<()=>void>();
function loadLegacy():Progress{try{return {...defaults,...JSON.parse(localStorage.getItem('picarx.v1')??'{}')};}catch{return {...defaults};}}
let legacy=loadLegacy();
export function useProgress():Progress {
 const current=useCompanion();const old=useSyncExternalStore(cb=>(subs.add(cb),()=>subs.delete(cb)),()=>legacy);
 return M3_ENABLED?current.setup:old;
}
export function update(patch:Partial<Progress>):void {
 if(M3_ENABLED){void updateSetup(old=>({...old,...patch})).catch(saveError);return;}
 legacy={...legacy,...patch};localStorage.setItem('picarx.v1',JSON.stringify(legacy));subs.forEach(f=>f());
}
export function toggleCheck(key:string):void {
 if(M3_ENABLED){void updateSetup(old=>({...old,checks:{...old.checks,[key]:!old.checks[key]}})).catch(saveError);return;}
 update({checks:{...legacy.checks,[key]:!legacy.checks[key]}});
}
export function setStepDone(id:string,done:boolean):void {
 if(M3_ENABLED){void updateSetup(old=>{const steps={...old.steps};if(done)steps[id]='done';else delete steps[id];return {...old,steps};}).catch(saveError);return;}
 const steps={...legacy.steps};if(done)steps[id]='done';else delete steps[id];update({steps});
}
export function rememberRoute():void {
 const h=window.location.hash;
 if((!M3_ENABLED || getStore().initialized&&!getStore().pending)&&h&&h!=='#/')update({lastRoute:h});
}
if(!M3_ENABLED)window.addEventListener('hashchange',rememberRoute);
