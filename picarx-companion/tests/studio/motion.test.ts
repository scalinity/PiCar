// Studio motion: deterministic, seekable, reversible, and exact at both endpoints.
import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import { easeInOutCubic, slerp, statesAt, timelineFor } from '../../src/features/assembly-3d/motion/evaluate';
import type { StudioManifest } from '../../src/features/assembly-3d/assets/pack';

const manifest = JSON.parse(fs.readFileSync('src/generated/studio/manifest.json', 'utf8')) as StudioManifest;
const timing = manifest.timing;

describe.each(['rpi5', 'rpi-zero-2-w'] as const)('%s', (variant) => {
  const v = manifest.variants[variant];
  it.each([1, 2])('S%i ends exactly on the closure poses, and every other part stays put', (n) => {
    const timeline = timelineFor(v, n, timing);
    const end = statesAt(v, timeline, timeline.duration);
    const placements = v.steps[n - 1].placements;
    for (const [id, pose] of Object.entries(placements)) {
      expect(end.get(id)!.pose).toBe(pose); // the source object itself, not a recomputed copy
      expect(end.get(id)!.phase).toBe('installed');
    }
    for (const [id, st] of end) if (!placements[id]) expect(st).toEqual({ pose: v.tray.instances[id], phase: 'tray', placed: false });
  });
  it.each([1, 2])('S%i starts with its new parts in the tray and the earlier parts installed', (n) => {
    const timeline = timelineFor(v, n, timing);
    const start = statesAt(v, timeline, 0);
    const introduced = new Set(timeline.tracks.map((k) => k.instanceId));
    for (const [id, st] of start) {
      if (introduced.has(id)) expect(st.pose).toBe(v.tray.instances[id]);
      else if (v.steps[n - 1].placements[id]) expect(st.pose).toBe(v.steps[n - 1].placements[id]);
    }
    if (n === 2) for (const id of Object.keys(v.steps[0].placements)) expect(start.get(id)!.pose).toEqual(v.steps[0].placements[id]);
  });
  it('S02 is deterministic and seekable: any order of evaluation gives identical poses', () => {
    const timeline = timelineFor(v, 2, timing);
    const times = [0.37, 2.9, 0.37, 1.61, timeline.duration, 0];
    const first = times.map((t) => JSON.stringify([...statesAt(v, timeline, t)]));
    const reversed = [...times].reverse().map((t) => JSON.stringify([...statesAt(v, timeline, t)])).reverse();
    expect(reversed).toEqual(first);
  });
  it('S02 reaches each M7 staged start exactly at the end of bring-in, then moves only along the recipe axis', () => {
    const timeline = timelineFor(v, 2, timing);
    for (const track of timeline.tracks.filter((k) => k.approach > 0)) {
      const recipe = v.steps[1].recipes.find((r) => r.instanceId === track.instanceId)!;
      const atStaged = statesAt(v, timeline, track.start + track.bringIn).get(track.instanceId)!;
      expect(atStaged.pose.translationM).toEqual(recipe.stagedStart.translationM);
      const mid = statesAt(v, timeline, track.start + track.bringIn + track.approach / 2).get(track.instanceId)!;
      expect(mid.phase).toBe('approach');
      const offset = mid.pose.translationM.map((x, i) => x - recipe.stagedStart.translationM[i]);
      const along = offset.reduce((s, x, i) => s + x * recipe.approachAxis[i], 0);
      const across = Math.hypot(...offset.map((x, i) => x - along * recipe.approachAxis[i]));
      expect(across).toBeLessThan(1e-12);
      expect(along).toBeGreaterThan(0);
      expect(along).toBeLessThan(recipe.approachDistanceM);
    }
  });
});

it('derives step durations from the stage timing (S01: 9 parts, S02: 6 parts on the Pi 5)', () => {
  const v = manifest.variants.rpi5;
  expect(timelineFor(v, 0, timing).duration).toBe(0);
  expect(timelineFor(v, 1, timing).duration).toBeCloseTo(8 * timing.staggerS + timing.bringInS + timing.approachS, 12);
  expect(timelineFor(v, 2, timing).duration).toBeCloseTo(5 * timing.staggerS + timing.bringInS + timing.approachS, 12);
});

it('keeps interpolation endpoints exact', () => {
  expect(easeInOutCubic(0)).toBe(0);
  expect(easeInOutCubic(1)).toBe(1);
  const a: [number, number, number, number] = [0, 0, 0, 1], b: [number, number, number, number] = [0, 0, Math.SQRT1_2, Math.SQRT1_2];
  expect(slerp(a, b, 0)).toBe(a);
  expect(slerp(a, b, 1)).toBe(b);
  expect(Math.hypot(...slerp(a, b, 0.3))).toBeCloseTo(1, 14);
});
