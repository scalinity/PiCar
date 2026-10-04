import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test, expect } from '@playwright/test';
import fixture from '../studio/accepted-studio3-hat-context.json' with { type: 'json' };

test('accepted Studio 3 HAT observation survives the integrated pack as earlier evidence', async ({ page: originalPage, playwright, browserName }) => {
  // Use the accepted regular/disposable WebKit context for real private-photo storage.
  const folder = browserName === 'webkit' ? fs.mkdtempSync(path.join(os.tmpdir(), 'picar-studio35-browser-')) : null;
  const context = folder ? await playwright.webkit.launchPersistentContext(folder, { headless: true, baseURL: 'http://localhost:1420', viewport: { width: 1440, height: 900 } }) : null;
  const page = context ? await context.newPage() : originalPage;
  try {
    await page.route('**/*', r => new URL(r.request().url()).hostname === 'localhost' ? r.continue() : r.abort());
    await page.goto('/#/studio/rpi5/4?diagnostics');
    const build = page.locator('.studio-build');
    await expect(build).not.toContainText('Opening saved');
    await build.getByRole('button', { name: 'Start build session' }).click();
    await expect(build).toHaveAttribute('data-session', 'PX-STUDIO-RPI5');
    const original = await page.evaluate(async () => {
      const { attachEarlierHatObservation } = await import(String('/tests/studio/earlier-hat-observation.ts'));
      return attachEarlierHatObservation();
    });
    expect(original.packId).toBe(fixture.context.packId);
    expect(original.geometry).toEqual(fixture.context.geometry);
    await build.locator('details').evaluate(e => (e as HTMLDetailsElement).open = true);
    await expect(build).toContainText('Taken against an earlier digital revision');
    await page.reload();
    await expect(build).toContainText('1 photos');
    await build.locator('details').evaluate(e => (e as HTMLDetailsElement).open = true);
    await expect(build).toContainText('Taken against an earlier digital revision');
    const retained = await page.evaluate(async () => {
      const { exportData } = await import(String('/src/features/assembly-session/store.ts'));
      const { readPhoto } = await import(String('/src/platform/evidence.ts'));
      const { evidenceZip } = await import(String('/src/features/assembly-session/evidence-zip.ts'));
      const b = await exportData();
      const record = b.aggregates.find((a: any) => a.aggregate.id === 'PX-STUDIO-RPI5').events.find((e: any) => e.action.kind === 'observation').action.record;
      const bytes = await readPhoto(record);
      return { record, bytes: Array.from(bytes), zip: Array.from(evidenceZip([{ record, bytes }])) };
    });
    expect(retained.record).toEqual(original);
    expect(Buffer.from(retained.zip as number[]).toString()).toContain(original.packId);
    await build.locator('details input').check();
    await page.evaluate(() => (window as any).showSaveFilePicker = undefined);
    const downloading = page.waitForEvent('download');
    await build.getByRole('button', { name: 'Export selected private evidence ZIP' }).click();
    const download = await downloading, destination = test.info().outputPath('earlier-hat-synthetic.zip');
    await download.saveAs(destination);
    expect(fs.readFileSync(destination)).toEqual(Buffer.from(retained.zip as number[]));
    const out = process.env.PICAR_BROWSER_EVIDENCE_DIR ?? '../docs/implementation/evidence/studio-3-5-hat-integration';
    fs.mkdirSync(out, { recursive: true });
    fs.writeFileSync(`${out}/earlier-hat-observation-${browserName}.json`, JSON.stringify({ syntheticOnly: true, acceptedHead: fixture.acceptedHead, acceptedManifestSha256: fixture.acceptedManifestSha256, record: retained.record, earlierRevisionUi: 'PASS', reloadUnchanged: 'PASS', selectedZipUnchanged: 'PASS' }, null, 2) + '\n');
  } finally {
    await context?.close();
    if (folder) fs.rmSync(folder, { recursive: true, force: true });
  }
});
