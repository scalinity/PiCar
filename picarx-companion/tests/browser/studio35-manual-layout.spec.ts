import fs from 'node:fs';
import { test, expect } from '@playwright/test';

for (const variant of ['rpi5', 'rpi-zero-2-w']) {
  test(`manual loading keeps the ${variant} part button stationary through real presses`, async ({ browser, browserName }) => {
    test.setTimeout(180000);
    const attempts = [];
    for (let n = 0; n < 8; n++) {
      const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
      let release!: () => void, requests = 0;
      const held = new Promise<void>(resolve => { release = resolve; });
      try {
        await page.route('**/*', route => new URL(route.request().url()).hostname === 'localhost' ? route.continue() : route.abort());
        await page.route('**/content/pdf/picar-x-assembly.pdf', async route => { requests++; await held; await route.continue(); });
        await page.goto(`http://localhost:1420/#/studio/${variant}/2?diagnostics`);
        await page.waitForFunction(() => (window as any).__studio?.viewport()?.board());
        await expect.poll(() => requests).toBeGreaterThan(0);
        const id = variant === 'rpi5' ? 'PX-V40-INS-PI5-001' : 'PX-V40-INS-ZERO2W-001';
        const button = page.locator('.studio-parts button').filter({ hasText: variant === 'rpi5' ? 'Raspberry Pi 5' : 'Raspberry Pi Zero 2 W' });
        await expect(button).toHaveCount(1);
        await button.scrollIntoViewIfNeeded();
        const panel = page.locator('.studio-drawer .studio-manual-canvas');
        await expect(panel).not.toHaveAttribute('data-ready', 'true');
        const before = await button.boundingBox();
        expect(before).not.toBeNull();
        await page.evaluate(() => {
          const button = Array.from(document.querySelectorAll('.studio-parts button')).find(b => /Raspberry Pi/.test(b.textContent!))!;
          const samples: number[] = [], events: string[] = [];
          (window as any).__layout35 = { samples, events, watching: true };
          for (const name of ['pointerdown', 'pointerup', 'click']) button.addEventListener(name, () => events.push(name));
          const watch = () => { samples.push(button.getBoundingClientRect().y); if ((window as any).__layout35.watching) requestAnimationFrame(watch); };
          requestAnimationFrame(watch);
        });
        await page.mouse.move(before!.x + before!.width / 2, before!.y + before!.height / 2);
        await page.mouse.down();
        release();
        await expect(panel).toHaveAttribute('data-ready', 'true', { timeout: 15000 });
        const after = await button.boundingBox();
        expect(after).toEqual(before);
        await page.mouse.up();
        await expect.poll(() => page.evaluate(() => (window as any).__studio.state().selection)).toBe(id);
        const observed = await page.evaluate(() => { const d = (window as any).__layout35; d.watching = false; return { samples: d.samples, events: d.events }; });
        expect(observed.samples.length).toBeGreaterThan(1);
        expect(Math.max(...observed.samples) - Math.min(...observed.samples)).toBeLessThan(0.01);
        expect(observed.events).toEqual(['pointerdown', 'pointerup', 'click']);
        // The reserved ratio is bound to the actual hash-verified PDF, not a placeholder aspect ratio.
        const pageSize = await page.evaluate(async () => {
          const { loadV40Pdf } = await import(String('/src/lib/v40-pdf.ts'));
          const page = await (await loadV40Pdf()).getPage(1), viewport = page.getViewport({ scale: 1 });
          return [viewport.width, viewport.height];
        });
        expect(pageSize).toEqual([1122.52, 793.701]);
        attempts.push({ before, after, events: observed.events, maxMovementCssPx: Math.max(...observed.samples) - Math.min(...observed.samples), selected: id });
      } finally { release(); await page.close(); }
    }
    const out = process.env.PICAR_BROWSER_EVIDENCE_DIR ?? '../docs/implementation/evidence/studio-3-5-hat-integration';
    fs.mkdirSync(out, { recursive: true });
    fs.writeFileSync(`${out}/manual-layout-${browserName}-${variant}.json`, JSON.stringify({ variant, attempts, pdfPageSizePoints: [1122.52, 793.701], status: 'PASS' }, null, 2) + '\n');
  });
}
