// The Studio cannot record physical progress, follows the no-effect rule, and adds a route without moving others.
import { expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { parseRoute, studioHref } from '../../src/lib/router';

const files = (dir: string): string[] => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? files(path.join(dir, e.name)) : [path.join(dir, e.name)]));
// The Studio's own modules, and the shared booklet loader its manual panel uses.
const studioSources = [...files('src/features/assembly-3d'), 'src/pages/Studio.tsx', 'src/lib/v40-pdf.ts', 'src/lib/v40-pdf-identity.ts'];

it('has no path to the session ledger, Setup persistence or repository; only the scoped native Escape command is allowed', () => {
  for (const file of studioSources) {
    const text = fs.readFileSync(file, 'utf8');
    const imports = [...text.matchAll(/from\s+['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]\s*\)/g)].map((m) => m[1] ?? m[2]);
    for (const spec of imports) expect(spec, file).not.toMatch(/assembly-session|progress-store|\/platform\/|repository|plugin-/);
    const checked = file.endsWith('/state/fullscreen.ts') ? text.replace("invoke('studio_escape_capture', { enabled })", '') : text;
    expect(checked, file).not.toMatch(/\binvoke\(|localStorage|indexedDB/);
  }
  const nativeCapture = fs.readFileSync('src-tauri/src/studio_escape.rs', 'utf8');
  expect(nativeCapture).not.toMatch(/commands::|persistence|Repository|Database|sqlite|app_data_dir|std::fs/);
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
