// Legacy persistence (VITE_M3_ENABLED=0, playwright.legacy.config.ts): using the Studio never writes a Studio route into
// the legacy record, so the M3 migration that later reads that record adopts it instead of quarantining it. Storage is the
// disposable browser context; the owner's data is never read.
import { expect, test } from '@playwright/test';
import fs from 'node:fs';

const legacy = fs.readFileSync('tests/baseline/legacy.json', 'utf8');
const seeded = JSON.parse(legacy);

test.beforeEach(async ({ page }) => { await page.route(/^(?!http:\/\/localhost:1420)/, (r) => r.abort()); });

test('a legacy record stays valid for M3 migration after the Studio is used and left open', async ({ page }) => {
  await page.goto('/#/');
  await page.evaluate((raw) => localStorage.setItem('picarx.v1', raw), legacy);
  await page.reload(); // the progress store reads the seeded record at start, as on a real launch
  const go = (hash: string) => page.evaluate((h) => { location.hash = h; }, hash);
  await go('#/reference');
  for (const hash of ['#/studio/rpi5/1', '#/studio/rpi5/2', '#/studio/rpi-zero-2-w/2', '#/studio/rpi5/1']) {
    await go(hash);
    await page.waitForFunction((k) => (window as any).__studio?.state().key === k, hash.slice('#/studio/'.length));
  }
  await page.getByRole('button', { name: 'Replay from the start' }).click();
  await page.locator('.studio-parts button').first().click();
  // The app was last on a Studio URL; the record still remembers the last companion page.
  const raw = await page.evaluate(() => localStorage.getItem('picarx.v1')!);
  expect(JSON.parse(raw)).toEqual({ ...seeded, lastRoute: '#/reference' });

  // Restart through M3: the same capture and first-start initialization the M3 build runs.
  const migrated = await page.evaluate(async () => {
    const raw = localStorage.getItem('picarx.v1')!;
    const { captureLegacy } = await import('/src/features/assembly-session/legacy.ts' as string);
    const captured = captureLegacy(raw, location.origin);
    const store = await import('/src/features/assembly-session/store.ts' as string);
    await store.initializePersistence();
    const s = store.getStore();
    return { status: captured.record.status, reason: captured.record.reason, rawKept: captured.record.raw === raw,
      setup: s.setup, recovery: s.recovery, error: s.error, storageReady: s.storageReady, legacyRaw: s.legacyRaw === raw };
  });
  expect(migrated).toMatchObject({ status: 'adopted', reason: '', rawKept: true, recovery: '', error: '', storageReady: true, legacyRaw: true });
  expect(migrated.setup).toEqual({ ...seeded, lastRoute: '#/reference', legacyAssemblyReportedDone: true });
});
