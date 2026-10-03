// Only the narrow build-along adapter can record owner actions; ordinary viewer modules remain isolated.
import { expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { parseRoute, studioHref } from '../../src/lib/router';

const files = (dir: string): string[] => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? files(path.join(dir, e.name)) : [path.join(dir, e.name)]));
// The Studio's own modules, and the shared booklet loader its manual panel uses.
const studioSources = [...files('src/features/assembly-3d'), 'src/pages/Studio.tsx', 'src/lib/v40-pdf.ts', 'src/lib/v40-pdf-identity.ts'];
const adapter='src/features/assembly-3d/build-along.tsx';
const sensitive=/assembly-session|progress-store|\/platform\/|repository|plugin-/;
const allowed=['../assembly-session/accepted','../assembly-session/commands','../assembly-session/store','../assembly-session/observation','../assembly-session/evidence-zip','../../platform/evidence'].sort();
function isolationProblems(file:string,text:string):string[]{
  file=path.posix.normalize(file.replaceAll('\\','/'));
  const imports=[...text.matchAll(/from\s+['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]\s*\)|import\s+['"]([^'"]+)['"]/g)].map(m=>m[1]??m[2]??m[3]);
  const problems:string[]=[];
  if(file===adapter){
    if(JSON.stringify([...new Set(imports.filter(s=>sensitive.test(s)))].sort())!==JSON.stringify(allowed))problems.push('adapter import set');
  }else{
    if(imports.some(s=>sensitive.test(s)))problems.push('persistence import');
    if(file!=='src/pages/Studio.tsx'&&imports.some(s=>/build-along/.test(s)))problems.push('adapter import');
  }
  const checked=file==='src/features/assembly-3d/state/fullscreen.ts'?text
    .replaceAll("invoke('studio_escape_capture', { enabled: true })",'')
    .replaceAll("invoke('studio_escape_capture', { enabled: false })",''):text;
  if(/\binvoke\(|localStorage|indexedDB|progress-store/.test(checked))problems.push('persistence write');
  return problems;
}

it('restricts persistence imports to the sole build-along adapter and keeps native Escape isolated', () => {
  for (const file of studioSources) {
    const text = fs.readFileSync(file, 'utf8');
    expect(isolationProblems(file,text),file).toEqual([]);
  }
  const nativeCapture = fs.readFileSync('src-tauri/src/studio_escape.rs', 'utf8');
  expect(nativeCapture).not.toMatch(/commands::|persistence|Repository|Database|sqlite|app_data_dir|std::fs/);
});

it('rejects extra sensitive imports and copied adapter/route exceptions',()=>{
  const actual=fs.readFileSync(adapter,'utf8');
  expect(isolationProblems(adapter,actual)).toEqual([]);
  const fixtures:[string,string][]=[
    [adapter,actual+"\nimport {repo} from '../../platform/repository';"],
    [adapter,actual+"\nimport {rogue} from '../assembly-session/rogue';"],
    ['src/features/assembly-3d/extra/build-along.tsx',"import {store} from '../../assembly-session/store';"],
    ['src/features/assembly-3d/extra.ts',"import {BuildAlong} from './build-along';"],
    ['src/features/assembly-3d/view.ts',"import {repo} from '../../platform/repository';"],
    ['src/extra/pages/Studio.tsx',"import {BuildAlong} from '../../features/assembly-3d/build-along';"],
  ];
  for(const [file,text] of fixtures)expect(isolationProblems(file,text),file).not.toEqual([]);
});

it('uses no useEffect in Studio components', () => {
  for (const file of studioSources) expect(fs.readFileSync(file, 'utf8'), file).not.toMatch(/useEffect|useLayoutEffect/);
});

it('parses Studio routes for the two active boards only', () => {
  expect(parseRoute('#/studio')).toEqual({ name: 'studio' });
  expect(parseRoute('#/studio/rpi5')).toEqual({ name: 'studio', variant: 'rpi5' });
  expect(parseRoute(studioHref('rpi-zero-2-w', 2))).toEqual({ name: 'studio', variant: 'rpi-zero-2-w', step: 2 });
  expect(parseRoute('#/studio/rpi4/1')).toMatchObject({ name: 'routeError' });
  expect(parseRoute('#/studio/rpi5/12')).toMatchObject({ name: 'routeError' });
  expect(parseRoute('#/assembly')).toEqual({ name: 'assembly' });
  expect(parseRoute('#/videos/assemble')).toEqual({ name: 'videos', slug: 'assemble' });
});
