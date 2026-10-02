// Display fidelity is reported as a classified subset (F11): which detail parts were matched to the maker's model, the
// deviation among exactly those, and every part that was not matched closely, by name. Matching is decided by footprint
// overlap, never by the size of the offset being reported.
import { expect, it } from 'vitest';
import fs from 'node:fs';
import { vendorAgreement } from '../../src/features/assembly-3d/ui/fidelity';

const manifest = JSON.parse(fs.readFileSync('src/generated/studio/manifest.json', 'utf8'));

it('classifies the Pi 5 cross-check: 25 of 33 matched, the 8 weak matches named and not counted', () => {
  const a = vendorAgreement(manifest.definitions['PX-V40-DEF-PI5'].display.vendorCrossCheck.parts);
  expect([a.matched, a.total]).toEqual([25, 33]);
  expect(a.unmatched).toEqual(['USB 2.0 ports tongue 1', 'USB 2.0 ports tongue 2', 'USB 3.0 ports tongue 1', 'USB 3.0 ports tongue 2',
    'Ethernet contacts', 'micro HDMI 0', 'micro HDMI 1', 'PoE pins']);
  expect(a.maxOffsetMm).toBeCloseTo(0.22, 6);
});

it('counts a well-matched part with a large offset, and does not count a poorly matched part with a small one', () => {
  const a = vendorAgreement([
    { part: 'header', footprintIoU: 0.9, centreOffsetXYMm: [1.5, 0] },
    { part: 'tongue', footprintIoU: 0.2, centreOffsetXYMm: [0.01, 0] },
    { part: 'chip', footprintIoU: 1, centreOffsetXYMm: [0, 0] },
    { part: 'button', vendorMatch: null },
  ]);
  expect(a).toEqual({ matched: 2, total: 4, maxOffsetMm: 1.5, medianOffsetMm: 0.75, unmatched: ['tongue', 'button'] });
});
