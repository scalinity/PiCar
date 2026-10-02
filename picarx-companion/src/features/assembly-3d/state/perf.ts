// Studio performance record and the adaptive pixel-ratio governor. Metrics, by the names the HUD shows:
//   page start -> first frame drawn  from the Studio page's first render in this app session (its code loaded, its pack
//                                    not yet fetched) to the first animation frame after the viewport's first render,
//                                    when the frame that render produced has been handed to the compositor.
//   first render                     the viewport's first frame-loop pass, which renders the scene.
//   canvas created                   the WebGL canvas and renderer exist; nothing has been drawn yet.
//   load phases                      manifest fetch, GLB fetch, verify (contract and hashes), decode, build (pack.ts).
//   active frames: mean, p95         intervals between frames of an active stretch only: the previous frame asked for the
//                                    next (playback, a camera tween, damping after input) or the user is moving the view,
//                                    and the page stayed visible throughout. A long interval inside such a stretch is a
//                                    real stall and is kept; no interval is classified by its length.
//   display period                   estimated from the fastest steady active frames, where vsync-bound frames cluster.
import { useSyncExternalStore } from 'react';
import type { LoadTimings } from '../assets/pack';

const WINDOW = 120;
const mean = (xs: number[]): number => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
const quantile = (xs: number[], q: number): number => {
  const s = [...xs].sort((a, b) => a - b);
  return s.length ? s[Math.min(s.length - 1, Math.floor(s.length * q))] : 0;
};

export function createFrameLog(size = WINDOW): { frame(now: number, continued: boolean, visible: boolean): void; intervals(): number[]; clear(): void } {
  const intervals: number[] = [];
  let last: number | null = null;
  return {
    // `continued`: the previous frame asked for this one, or input is in progress. `visible`: the page was not hidden
    // at any time since the previous frame.
    frame(now, continued, visible) {
      if (last !== null && continued && visible) {
        intervals.push(now - last);
        if (intervals.length > size) intervals.shift();
      }
      last = now;
    },
    intervals: () => intervals,
    clear: () => { intervals.length = 0; },
  };
}

// Lower the pixel ratio in half steps when a full window of active frames is well over the display period and over
// 22 ms (about 45 fps); raise it after a long calm stretch at nearly every display refresh. Each drop starts a back-off
// that doubles on the next drop, so a ratio that cannot be held is not retried in a loop.
export function createDprGovernor({ calmFrames = 600, backoffMs = 10_000, maxBackoffMs = 300_000 } = {}): (dpr: number, ceiling: number, intervals: number[], now: number) => number {
  let refresh = 1000 / 60; // assumed until faster steady frames show a faster display
  let calm = 0, blockedUntil = 0, backoff = backoffMs;
  return (dpr, ceiling, intervals, now) => {
    if (intervals.length < WINDOW) return dpr;
    const m = mean(intervals), fast = quantile(intervals, 0.1);
    if (fast < refresh * 0.9) refresh = fast;
    if (dpr > 1 && m > Math.max(22, refresh * 1.5)) {
      calm = 0;
      blockedUntil = now + backoff;
      backoff = Math.min(backoff * 2, maxBackoffMs);
      return Math.max(1, dpr - 0.5);
    }
    calm = m < refresh * 1.15 ? calm + 1 : 0;
    if (calm > calmFrames && dpr < ceiling && now >= blockedUntil) {
      calm = 0;
      return Math.min(ceiling, dpr + 0.5);
    }
    return dpr;
  };
}

const frames = createFrameLog();
const governor = createDprGovernor();
export const perf = {
  openedAt: undefined as number | undefined, // the Studio page's first render in this app session
  canvasAt: undefined as number | undefined,
  firstRenderAt: undefined as number | undefined,
  firstFrameDrawnAt: undefined as number | undefined,
  load: undefined as LoadTimings | undefined,
  hiddenAt: -Infinity, // the last time the page became hidden
  lastFrameAt: -Infinity,
  calls: 0, triangles: 0, dpr: 1, width: 0, height: 0,
  dprChanges: [] as { at: number; from: number; to: number; meanMs: number }[],
};

export function recordFrame(now: number, continued: boolean): void {
  frames.frame(now, continued, perf.hiddenAt < perf.lastFrameAt);
  perf.lastFrameAt = now;
  if (perf.firstRenderAt === undefined) {
    perf.firstRenderAt = now;
    requestAnimationFrame(() => { perf.firstFrameDrawnAt ??= performance.now(); });
  }
}

export const markHidden = (): void => { if (document.hidden) perf.hiddenAt = performance.now(); };

export function setRendererInfo(calls: number, triangles: number, dpr: number, width: number, height: number): void {
  Object.assign(perf, { calls, triangles, dpr, width, height });
}

export function governDpr(dpr: number): number {
  const ceiling = Math.min(2, typeof devicePixelRatio === 'number' ? devicePixelRatio : 1);
  const next = governor(dpr, ceiling, frames.intervals(), performance.now());
  if (next !== dpr) {
    perf.dprChanges.push({ at: performance.now(), from: dpr, to: next, meanMs: mean(frames.intervals()) });
    frames.clear(); // the window measured the old ratio
  }
  return next;
}

export type PerfSnapshot = {
  activeFps: number; activeMeanMs: number; activeP95Ms: number; activeFrames: number; displayPeriodMs: number;
  calls: number; triangles: number; dpr: number; width: number; height: number;
  openToCanvasMs?: number; openToFirstRenderMs?: number; openToFirstFrameDrawnMs?: number; load?: LoadTimings;
};
export function perfSnapshot(): PerfSnapshot {
  const xs = frames.intervals(), m = mean(xs);
  const since = (t?: number): number | undefined => (t !== undefined && perf.openedAt !== undefined ? t - perf.openedAt : undefined);
  return {
    activeFps: m ? 1000 / m : 0, activeMeanMs: m, activeP95Ms: quantile(xs, 0.95), activeFrames: xs.length, displayPeriodMs: quantile(xs, 0.1),
    calls: perf.calls, triangles: perf.triangles, dpr: perf.dpr, width: perf.width, height: perf.height,
    openToCanvasMs: since(perf.canvasAt), openToFirstRenderMs: since(perf.firstRenderAt), openToFirstFrameDrawnMs: since(perf.firstFrameDrawnAt), load: perf.load,
  };
}

// The HUD polls twice a second instead of subscribing to every frame.
let snapshot = perfSnapshot();
const polling = (notify: () => void): (() => void) => {
  const timer = setInterval(() => { snapshot = perfSnapshot(); notify(); }, 500);
  return () => clearInterval(timer);
};
const idle = (): (() => void) => () => {};
export const usePerfSnapshot = (active: boolean): PerfSnapshot => useSyncExternalStore(active ? polling : idle, () => snapshot);
