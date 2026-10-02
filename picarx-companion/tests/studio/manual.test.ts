// The manual panel comes only from the verified documentation source lock: the same record the Setup reference uses.
// No page number or crop is invented, and the Studio stores no page image.
import { expect, it } from 'vitest';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import sourceLock from '../../tools/content-pipeline/documentation-source-lock.json';
import { manualPanel } from '../../src/features/assembly-3d/ui/manual-map';
import { V40_PDF_SHA256 } from '../../src/lib/v40-pdf-identity';

it('maps every printed step 1-9 on both boards to exactly the lock\'s verified panel', () => {
  expect(sourceLock.status).toBe('VERIFIED');
  expect(sourceLock.pdfSha256).toBe(V40_PDF_SHA256);
  for (const variant of ['rpi5', 'rpi-zero-2-w'] as const) for (let step = 1; step <= 9; step++) {
    const expected = sourceLock.panels.find((p) => p.printedStep === step)!.mappings.filter((m) => m.variants.includes(variant));
    expect(expected).toHaveLength(1);
    expect(manualPanel(step, variant)).toBe(expected[0]);
    expect(manualPanel(step, variant)!.result).toBe('PASS');
  }
});

it('gives the Zero 2 W its own panels where the booklet prints them (steps 1-4) and the shared panel after', () => {
  for (let step = 1; step <= 9; step++) {
    const same = manualPanel(step, 'rpi5') === manualPanel(step, 'rpi-zero-2-w');
    expect(same).toBe(step >= 5);
  }
});

it('checks the locked booklet bytes on disk against the hash the Studio loader requires', () => {
  const bytes = fs.readFileSync('public/content/pdf/picar-x-assembly.pdf');
  expect(execFileSync('shasum', ['-a', '256'], { input: bytes }).toString().split(' ')[0]).toBe(V40_PDF_SHA256);
});

it('tracks no rendered page or panel image in the Studio sources or pack', () => {
  const tracked = execFileSync('git', ['ls-files', 'src/features/assembly-3d', 'src/generated/studio', 'public/content'], { encoding: 'utf8' }).split('\n');
  expect(tracked.filter((f) => /\.(png|jpe?g|webp|avif)$/i.test(f) && /manual|panel|page|step/i.test(f))).toEqual([]);
});
