// Performance instrumentation (F9): an interval is active because the loop was continuously asked to render, never
// because it was short; idle and hidden time is not frame time; the pixel-ratio governor can recover on a 60 Hz display
// and does not oscillate.
import { expect, it } from 'vitest';
import { createDprGovernor, createFrameLog } from '../../src/features/assembly-3d/state/perf';

it('keeps a real 120 ms stall inside an active stretch', () => {
  const log = createFrameLog();
  log.frame(0, true, true);
  log.frame(17, true, true);
  log.frame(137, true, true); // a stall while playback kept asking for frames
  expect(log.intervals()).toEqual([17, 120]);
});

it('does not count an idle gap or a hidden page as frame time', () => {
  const log = createFrameLog();
  log.frame(0, true, true);
  log.frame(16, false, true); // nothing asked for this frame continuously: the gap before it was idle
  log.frame(5016, true, false); // the page was hidden during this interval
  log.frame(5032, true, true);
  expect(log.intervals()).toEqual([16]);
});

const window60 = (ms: number) => Array.from({ length: 120 }, () => ms);

it('recovers the pixel ratio on a 60 Hz display that comfortably keeps up', () => {
  const govern = createDprGovernor();
  let dpr = 1.5, now = 0;
  for (let i = 0; i < 700 && dpr === 1.5; i++) dpr = govern(dpr, 2, window60(16.7), (now += 16.7));
  expect(dpr).toBe(2);
});

it('degrades a slow stretch and does not oscillate back before its back-off has passed', () => {
  const govern = createDprGovernor({ calmFrames: 60 }); // a short calm requirement, so only the back-off holds recovery
  let now = 0;
  expect(govern(2, 2, window60(30), (now += 16.7))).toBe(1.5);
  let dpr = 1.5;
  for (let i = 0; i < 300; i++) dpr = govern(dpr, 2, window60(16.7), (now += 16.7)); // 5 s calm, inside the 10 s back-off
  expect(dpr).toBe(1.5);
  for (let i = 0; i < 700 && dpr === 1.5; i++) dpr = govern(dpr, 2, window60(16.7), (now += 16.7));
  expect(dpr).toBe(2);
  expect(govern(2, 2, window60(30), (now += 16.7))).toBe(1.5); // slow again: the next back-off doubles to 20 s
  dpr = 1.5;
  for (let i = 0; i < 900; i++) dpr = govern(dpr, 2, window60(16.7), (now += 16.7)); // 15 s calm, inside it
  expect(dpr).toBe(1.5);
});

it('estimates the display period from the fastest steady frames, so a 120 Hz display is held to its own cadence', () => {
  const govern = createDprGovernor();
  let now = 0, dpr = 1.5;
  for (let i = 0; i < 700; i++) dpr = govern(dpr, 2, window60(8.33), (now += 8.33));
  expect(dpr).toBe(2);
  expect(govern(2, 2, window60(16.7), (now += 16.7))).toBe(2); // 60 fps on a 120 Hz display is slower but not over 22 ms
  expect(govern(2, 2, window60(23), (now += 23))).toBe(1.5);
});
