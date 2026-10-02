// Ephemeral Studio presentation state. Never persisted and never a source of physical progress:
// playback, rewind, scrubbing and selection change only what is drawn.
import { useSyncExternalStore } from 'react';
import type { StudioVariant } from '../../../lib/router';

export type CameraMode = 'guided' | 'manual';
export type StudioState = {
  key: string; // `${variant}/${step}` the playback below belongs to
  t: number;
  playing: boolean;
  direction: 1 | -1;
  selection: string | null;
  cameraMode: CameraMode;
  cameraRequest: number; // bumped to ask the scene to move to the guided view
  focusRequest: number; // bumped to ask the scene to frame the selection
  drawerOpen: boolean;
  perfOpen: boolean;
};

const reducedMotion = (): boolean => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

let state: StudioState = {
  key: '', t: 0, playing: false, direction: 1, selection: null, cameraMode: 'guided', cameraRequest: 0, focusRequest: 0,
  drawerOpen: true, perfOpen: typeof location !== 'undefined' && /[?&]perf\b/.test(location.hash + location.search),
};
const listeners = new Set<() => void>();
const set = (patch: Partial<StudioState>): void => { state = { ...state, ...patch }; for (const l of listeners) l(); };

export const getStudioState = (): StudioState => state;
export const subscribeStudio = (l: () => void): (() => void) => { listeners.add(l); return () => listeners.delete(l); };
export function useStudio<T>(select: (s: StudioState) => T): T {
  return useSyncExternalStore(subscribeStudio, () => select(state), () => select(state));
}

export const studioKey = (variant: StudioVariant, step: number): string => `${variant}/${step}`;

// Called from the frame loop: a new board or step (from a click, the URL or history) starts its timeline
// from the beginning and asks for the guided camera. Under reduced motion the step opens at its end state.
export function enterStep(key: string, duration: number): boolean {
  if (state.key === key) return false;
  const still = reducedMotion() || duration === 0;
  set({ key, t: still ? duration : 0, playing: !still, direction: 1, cameraMode: 'guided', cameraRequest: state.cameraRequest + 1 });
  return true;
}

export const advance = (dt: number, duration: number): void => {
  if (!state.playing) return;
  const t = Math.min(duration, Math.max(0, state.t + dt * state.direction));
  set({ t, playing: t > 0 && t < duration });
};
export const play = (duration: number): void => set({ playing: duration > 0, direction: 1, t: state.t >= duration ? 0 : state.t });
export const rewind = (): void => set({ playing: state.t > 0, direction: -1 });
export const pause = (): void => set({ playing: false });
export const replay = (duration: number): void => set({ t: 0, playing: duration > 0, direction: 1 });
export const seek = (t: number): void => set({ t, playing: false });
export const select = (selection: string | null): void => set({ selection });
export const yieldCamera = (): void => { if (state.cameraMode !== 'manual') set({ cameraMode: 'manual' }); };
export const resetCamera = (): void => set({ cameraMode: 'guided', cameraRequest: state.cameraRequest + 1 });
export const focusSelection = (): void => { if (state.selection) set({ cameraMode: 'manual', focusRequest: state.focusRequest + 1 }); };
export const toggleDrawer = (): void => set({ drawerOpen: !state.drawerOpen });
export const togglePerf = (): void => set({ perfOpen: !state.perfOpen });
