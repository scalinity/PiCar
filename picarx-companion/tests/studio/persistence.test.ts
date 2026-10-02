// Studio browsing is presentation state: a Studio URL never becomes the remembered route, so the legacy record stays
// valid for the M3 migration (legacy.ts validateSetup admits only the companion's own route families).
import { expect, it, vi } from 'vitest';
import fs from 'node:fs';

it('keeps Studio routes out of the legacy record, which the M3 migration then adopts unchanged', async () => {
  vi.resetModules();
  const raw = fs.readFileSync('tests/baseline/legacy.json', 'utf8');
  let saved = raw;
  const callbacks: Record<string, () => void> = {};
  const location = { hash: '#/' };
  vi.stubGlobal('localStorage', { getItem: () => saved, setItem: (_key: string, value: string) => { saved = value; } });
  vi.stubGlobal('window', { location, addEventListener: (key: string, cb: () => void) => { callbacks[key] = cb; } });
  await import('../../src/lib/progress-store');
  for (const hash of ['#/reference', '#/studio/rpi5/2', '#/studio', '#/studio/rpi-zero-2-w/0', '#/studio?perf']) {
    location.hash = hash;
    callbacks.hashchange();
  }
  expect(JSON.parse(saved)).toEqual({ ...JSON.parse(raw), lastRoute: '#/reference' });
  const { captureLegacy } = await import('../../src/features/assembly-session/legacy');
  const captured = captureLegacy(saved, 'http://localhost:1420');
  expect(captured.record).toMatchObject({ status: 'adopted', reason: '', raw: saved });
  vi.unstubAllGlobals();
});
