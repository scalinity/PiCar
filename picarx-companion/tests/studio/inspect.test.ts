// Inspection is presentation only: explosion offsets are a pure function of the step, composed over the evaluated poses
// and never written back; styles follow the selection, the review focus and the toggles; the deck clip spares the tray.
import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import { statesAt, timelineFor } from '../../src/features/assembly-3d/motion/evaluate';
import { clipRange, explodeOffsets, explodeWeight, focusIds, keptIds, styleOf, worldBox } from '../../src/features/assembly-3d/motion/inspect';
import type { StudioManifest } from '../../src/features/assembly-3d/assets/pack';

const manifest = JSON.parse(fs.readFileSync('src/generated/studio/manifest.json', 'utf8')) as StudioManifest;
const snapshot = JSON.stringify(manifest);

describe.each(['rpi5', 'rpi-zero-2-w'] as const)('%s', (variant) => {
  const v = manifest.variants[variant];
  it.each([1, 2, 3, 4, 5, 6, 7, 8, 9])('S%i: explosion offsets are deterministic, cover exactly the placed parts, and lift stacks in order', (n) => {
    const entry = v.steps[n - 1];
    const a = explodeOffsets(manifest, entry), b = explodeOffsets(manifest, entry);
    expect([...a]).toEqual([...b]);
    expect([...a.keys()].sort()).toEqual(Object.keys(entry.placements).sort());
    for (const o of a.values()) expect(o[1]).toBeGreaterThanOrEqual(0); // nothing is pushed through the floor
    // Order along height is kept: a part whose box sits higher is lifted at least as far.
    const boxes = [...a.keys()].map((id) => ({ id, y: (worldBox(manifest.definitions[manifest.instances[id].definitionId], entry.placements[id]).min[1]
      + worldBox(manifest.definitions[manifest.instances[id].definitionId], entry.placements[id]).max[1]) / 2 })).sort((p, q) => p.y - q.y);
    for (let i = 1; i < boxes.length; i++) expect(a.get(boxes[i].id)![1]).toBeGreaterThanOrEqual(a.get(boxes[i - 1].id)![1] - 1e-12);
  });
  it('carries no offset while a part is on its way from the tray, all of it once placed, and follows the approach in between', () => {
    const timeline = timelineFor(v, 2, manifest.timing);
    const track = timeline.tracks.find((k) => k.approach > 0)!;
    const state = (t: number) => statesAt(v, timeline, t).get(track.instanceId)!;
    expect(explodeWeight(state(track.start + track.bringIn / 2))).toBe(0);
    expect(explodeWeight(state(track.start + track.bringIn + 1e-9))).toBeLessThan(1e-6); // continuous at the hand-over
    expect(explodeWeight(state(track.start + track.bringIn + track.approach / 2))).toBeCloseTo(0.5, 6);
    expect(explodeWeight(state(timeline.duration))).toBe(1);
  });
  it('keeps the deck clip default inside the state and its tray guard past every tray group', () => {
    for (const entry of v.steps) {
      const r = clipRange(manifest, v, entry);
      expect(r.deck).toBeGreaterThan(r.min);
      expect(r.deck).toBeLessThanOrEqual(r.max);
      for (const g of v.tray.groups) expect(g.boundsM.max[0]).toBeLessThan(r.trayGuardX);
      for (const [id, pose] of Object.entries(entry.placements)) {
        if (entry.newlyPlacedInstanceIds.includes(id)) expect(pose.translationM[0]).toBeGreaterThan(r.trayGuardX);
      }
    }
  });
});

describe('styles', () => {
  const v = manifest.variants.rpi5;
  const s9 = v.steps[8], s7 = v.steps[6], s4 = v.steps[3];
  it('tints the refused candidate\'s own parts in S09, a chosen pair alone once picked, and the connection ends in S07', () => {
    expect([...focusIds(s9, null)].sort()).toEqual([...s9.newlyPlacedInstanceIds].sort());
    expect([...focusIds(s9, s9.conflicts[0].instances)]).toEqual(s9.conflicts[0].instances);
    expect([...focusIds(s7, null)]).toEqual(['PX-V40-INS-BATTERY-001', 'PX-V40-INS-ROBOT-HAT-001']);
    expect(focusIds(s4, null).size).toBe(0); // Preview has no review tint
  });
  it('isolates and ghosts around the selection first, then a pair, then the step\'s parts', () => {
    const kept = keptIds(s4, null, null)!;
    expect(kept.has('PX-V40-INS-ROBOT-HAT-001')).toBe(true);
    expect(kept.has('PX-V40-INS-MOTOR-LEFT-001')).toBe(false);
    expect(keptIds(s4, 'PX-V40-INS-PLATE-A-001', null)).toEqual(new Set(['PX-V40-INS-PLATE-A-001']));
    expect(keptIds(undefined, null, null)).toBeNull(); // the tray singles nothing out
    const o = { selection: 'PX-V40-INS-PLATE-A-001', focus: new Set<string>(), kept: keptIds(s4, 'PX-V40-INS-PLATE-A-001', null), isolate: true, ghost: true };
    expect(styleOf('PX-V40-INS-PLATE-A-001', o)).toBe('selected');
    expect(styleOf('PX-V40-INS-ROBOT-HAT-001', o)).toBe('hidden');
    expect(styleOf('PX-V40-INS-ROBOT-HAT-001', { ...o, isolate: false })).toBe('ghost');
    expect(styleOf('PX-V40-INS-ROBOT-HAT-001', { ...o, isolate: false, ghost: false })).toBe('normal');
  });
});

it('never writes to the manifest', () => {
  for (const v of Object.values(manifest.variants)) for (const entry of v.steps) { explodeOffsets(manifest, entry); clipRange(manifest, v, entry); keptIds(entry, null, null); focusIds(entry, null); }
  expect(JSON.stringify(manifest)).toBe(snapshot);
});
