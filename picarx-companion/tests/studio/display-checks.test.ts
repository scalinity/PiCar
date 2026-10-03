import fs from 'node:fs';
import { expect, it } from 'vitest';
import { type LoadedPack, type StudioManifest } from '../../src/features/assembly-3d/assets/pack';
import { displayNotes } from '../../src/features/assembly-3d/ui/display-checks';
const real = () => JSON.parse(fs.readFileSync('src/generated/studio/manifest.json', 'utf8')) as StudioManifest;
const pack = (manifest: StudioManifest) => ({ manifest } as LoadedPack);
it('describes the four HAT screw contacts truthfully and keeps the same numeric maximum', () => {
  const m = real(), step = m.variants.rpi5.steps[3];
  const hat = { ...step, displayChecks: step.displayChecks.filter((d) => d.definitionId === 'PX-V40-DEF-ROBOT-HAT') };
  const before = JSON.stringify(hat.displayChecks);
  const notes = displayNotes(pack(m), hat).join(' ');
  expect(notes).toContain('Screw contacts');
  expect(notes).not.toContain('Standoff');
  expect(notes).toContain('2.6 mm³');
  expect(JSON.stringify(hat.displayChecks)).toBe(before);
});
it('retains actual standoff contacts and existing large-overlap values', () => {
  const m = real(), notes = displayNotes(pack(m), m.variants.rpi5.steps[1]).join(' ');
  expect(notes).toContain('Standoff');
  expect(notes).toContain('2.8 mm³');
  expect(notes).toContain('449 mm³');
});
it('uses generic wording for valid hardware without a known screw or standoff category', () => {
  const m = real(), step = m.variants.rpi5.steps[1];
  const id = 'PX-V40-INS-M25X18PLUS6-STANDOFF-001';
  m.instances[id].componentClass = 'other-hardware'; // a valid consumer metadata category without a specific contact noun
  step.displayChecks[0].overlaps = [{ instanceId: id, volumeMm3: 1.0447 }];
  const notes = displayNotes(pack(m), step).join(' ');
  expect(notes).toContain('Component contacts');
  expect(notes).not.toMatch(/Standoff|Screw contacts/);
  expect(notes).toContain('1.0 mm³');
});
