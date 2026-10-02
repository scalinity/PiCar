// Studio performance record: load, decode, first-frame and per-frame timing kept apart, plus the adaptive
// pixel-ratio governor. Frames only count while the demand loop renders back to back (interaction or playback).
import { useSyncExternalStore } from 'react';
import type { LoadTimings } from '../assets/pack';

const WINDOW = 120;
export const perf = {
  mountedAt: 0,
  firstFrameAt: undefined as number | undefined,
  load: undefined as LoadTimings | undefined,
  intervals: [] as number[],
  lastFrame: 0,
  calls: 0, triangles: 0, dpr: 1, width: 0, height: 0,
  dprChanges: [] as { at: number; from: number; to: number; meanMs: number }[],
};

export function recordFrame(now: number): void {
  const gap = now - perf.lastFrame;
  perf.lastFrame = now;
  if (gap > 0 && gap < 100) { // consecutive frames only; idle gaps are not frame time
    perf.intervals.push(gap);
    if (perf.intervals.length > WINDOW) perf.intervals.shift();
  }
}

export function setRendererInfo(calls: number, triangles: number, dpr: number, width: number, height: number): void {
  Object.assign(perf, { calls, triangles, dpr, width, height });
}

const mean = (xs: number[]): number => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
let calmFrames = 0;
// Drop the pixel ratio in half steps when a full window of active frames averages slower than ~45 fps;
// raise it again after a long calm stretch under ~80 fps-equivalent cost.
export function governDpr(dpr: number): number {
  if (perf.intervals.length < WINDOW) return dpr;
  const m = mean(perf.intervals);
  const ceiling = Math.min(2, typeof devicePixelRatio === 'number' ? devicePixelRatio : 1);
  if (m > 22 && dpr > 1) {
    const to = Math.max(1, dpr - 0.5);
    perf.dprChanges.push({ at: performance.now(), from: dpr, to, meanMs: m });
    perf.intervals.length = 0;
    calmFrames = 0;
    return to;
  }
  calmFrames = m < 12.5 ? calmFrames + 1 : 0;
  if (calmFrames > 600 && dpr < ceiling) {
    const to = Math.min(ceiling, dpr + 0.5);
    perf.dprChanges.push({ at: performance.now(), from: dpr, to, meanMs: m });
    calmFrames = 0;
    return to;
  }
  return dpr;
}

export type PerfSnapshot = { fps: number; meanMs: number; p95Ms: number; calls: number; triangles: number; dpr: number; width: number; height: number; firstFrameMs?: number; load?: LoadTimings };
export function perfSnapshot(): PerfSnapshot {
  const sorted = [...perf.intervals].sort((a, b) => a - b);
  const m = mean(perf.intervals);
  return { fps: m ? 1000 / m : 0, meanMs: m, p95Ms: sorted.length ? sorted[Math.floor(sorted.length * 0.95)] : 0, calls: perf.calls, triangles: perf.triangles,
    dpr: perf.dpr, width: perf.width, height: perf.height, firstFrameMs: perf.firstFrameAt && perf.mountedAt ? perf.firstFrameAt - perf.mountedAt : undefined, load: perf.load };
}

// The HUD polls twice a second instead of subscribing to every frame.
let snapshot = perfSnapshot();
const polling = (notify: () => void): (() => void) => {
  const timer = setInterval(() => { snapshot = perfSnapshot(); notify(); }, 500);
  return () => clearInterval(timer);
};
const idle = (): (() => void) => () => {};
export const usePerfSnapshot = (active: boolean): PerfSnapshot => useSyncExternalStore(active ? polling : idle, () => snapshot);
