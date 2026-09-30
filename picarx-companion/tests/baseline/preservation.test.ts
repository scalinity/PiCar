import { describe, expect, it, vi } from 'vitest';
import fs from 'node:fs';
import { parseRoute, refHref } from '../../src/lib/router';
import { readJson, sha } from '../../tools/content-pipeline/publication';

it('preserves four route families, nested reference paths and section links',()=>{
  expect(parseRoute('#/')).toEqual({name:'home'});
  expect(parseRoute('#/wizard/servo-zero')).toEqual({name:'wizard',step:'servo-zero'});
  expect(parseRoute(refHref('python/calibrate','calibration'))).toEqual({name:'reference',page:'python/calibrate',section:'calibration'});
  expect(parseRoute('#/videos/assemble')).toEqual({name:'videos',slug:'assemble'});
  expect(parseRoute('#/unknown')).toEqual({name:'home'});
});
it('M3 recovers malformed percent decoding characterized at M0',()=>expect(parseRoute('#/reference/%ZZ')).toEqual({name:'routeError',message:'Malformed URL escape'}));
it('preserves exact setup stage order and documentary assembly completion',()=>{
 const wizard=readJson('src/content/wizard.json');expect(wizard.map((x:any)=>x.id)).toEqual(['parts','os','power','connect','software','servo-zero','assembly','calibrate']);
 expect(wizard.find((x:any)=>x.id==='assembly').pdf).toBe('/content/pdf/picar-x-assembly.pdf');
});
it('loads valid original legacy bytes without writing or implying detailed completion',async()=>{
 vi.resetModules();const raw=fs.readFileSync('tests/baseline/legacy.json','utf8');const parsed=JSON.parse(raw),callbacks:Record<string,()=>void>={};let saved=raw;
 const setItem=vi.fn((key:string,value:string)=>{expect(key).toBe('picarx.v1');saved=value;});
 vi.stubGlobal('localStorage',{getItem:(key:string)=>{expect(key).toBe('picarx.v1');return saved;},setItem});
 vi.stubGlobal('window',{location:{hash:'#/'},addEventListener:(key:string,cb:()=>void)=>callbacks[key]=cb});
 const {update,toggleCheck,setStepDone}=await import('../../src/lib/progress-store');
 expect(setItem).not.toHaveBeenCalled();expect(saved).toBe(raw);
 update({});expect(JSON.parse(saved)).toEqual(parsed);
 toggleCheck('servo.ready');expect(JSON.parse(saved).checks['servo.ready']).toBe(true);
 setStepDone('os',true);expect(JSON.parse(saved).steps.os).toBe('done');
 expect(Object.keys(JSON.parse(saved))).toEqual(['steps','checks','lastRoute','pdfLastPage']);
 expect(JSON.parse(saved).steps.assembly).toBe('done');expect(JSON.parse(saved).pdfLastPage).toBe(2);
 callbacks.hashchange();expect(JSON.parse(saved).lastRoute).toBe(parsed.lastRoute);
 vi.unstubAllGlobals();
});
it('preserves native identifier and permission bytes against the fixed baseline',()=>{
 expect(readJson('src-tauri/tauri.conf.json').identifier).toBe('com.danny.picarx-companion');
 expect(sha(fs.readFileSync('src-tauri/capabilities/default.json'))).toBe('50e6561a0c5480e8f19379bb0f745c4ac48b8114a7127e614ecec24640cd74c0');
});
