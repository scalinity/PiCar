import { afterEach, expect, it, vi } from 'vitest';
import { qualityPolicy } from '../../src/features/assembly-3d/state/power';
import { createDprGovernor, createFrameLog } from '../../src/features/assembly-3d/state/perf';
import { enterStep, getStudioState, play, replay, rewind, seek } from '../../src/features/assembly-3d/state/studio-store';

afterEach(() => vi.unstubAllGlobals());

it('caps battery and low power immediately, including before any frame sample exists', () => {
  const ac = { source: 'ac', lowPower: false, thermal: 'nominal' } as const;
  expect(qualityPolicy(ac, 2)).toEqual({ ceiling: 2, reason: 'AC power' });
  const battery = qualityPolicy({ ...ac, source: 'battery' }, 2);
  expect(battery.ceiling).toBe(1.5);
  expect(qualityPolicy({ ...ac, lowPower: true }, 2).ceiling).toBe(1);
  expect(qualityPolicy({ ...ac, thermal: 'serious' }, 2).ceiling).toBe(1);
  expect(qualityPolicy({ ...ac, source: 'unknown' }, 2).ceiling).toBe(1.5);
  expect(qualityPolicy(ac, 1).ceiling).toBe(1);
  const governor = createDprGovernor();
  expect(governor(2, battery.ceiling, [], 0)).toBe(1.5);
  let dpr = 1.5;
  for (let i = 0; i < 1000; i++) dpr = governor(dpr, battery.ceiling, Array(120).fill(16.67), i * 16.67);
  expect(dpr).toBe(1.5);
});

it('retains actual stalls across a bounded 600-frame sample and excludes hidden/idle gaps', () => {
  const log = createFrameLog(600);
  let now = 0;
  log.frame(now, false, true);
  for (let i = 0; i < 599; i++) log.frame(now += 16, true, true);
  log.frame(now += 250, true, true);
  expect(log.intervals()).toHaveLength(600);
  expect(Math.max(...log.intervals())).toBe(250);
  log.frame(now += 5000, false, true);
  log.frame(now += 5000, true, false);
  expect(log.intervals()).toHaveLength(600);
  expect(Math.max(...log.intervals())).toBe(250);
});

it('keeps reduced-motion placement endpoints and explicit forward/reverse transport available', () => {
  vi.stubGlobal('matchMedia', () => ({ matches: true }));
  enterStep('rpi5/reduced-unit', 5, new Set());
  expect(getStudioState()).toMatchObject({ t: 5, playing: false });
  seek(2); play(5);
  expect(getStudioState()).toMatchObject({ t: 5, playing: false });
  rewind(); expect(getStudioState()).toMatchObject({ t: 0, playing: false });
  replay(5); expect(getStudioState()).toMatchObject({ t: 5, playing: false });
});
