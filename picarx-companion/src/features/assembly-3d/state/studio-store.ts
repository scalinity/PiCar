// Ephemeral Studio presentation state. Never persisted and never a source of physical progress:
// playback, rewind, scrubbing and selection change only what is drawn.
import { useSyncExternalStore } from 'react';
import type { StudioVariant } from '../../../lib/router';
import { resetPerfSample } from './perf';

export type CameraMode = 'guided' | 'manual';
export type Bounds = { min: [number, number, number]; max: [number, number, number] };
export type StudioState = {
  key: string; // `${variant}/${step}` the playback below belongs to
  t: number;
  playing: boolean;
  direction: 1 | -1;
  selection: string | null;
  conflict: number | null; // a review step's conflict pair singled out (index into the step's conflicts)
  cameraMode: CameraMode;
  cameraRequest: number; // bumped to ask the scene to move to the guided view
  focusRequest: number; // bumped to ask the scene to frame the selection
  frameRequest: number; // bumped to ask the scene to frame `frameBounds` (a tray group)
  frameBounds: Bounds | null;
  // Inspection: presentation only, composed over the evaluated poses and never written anywhere.
  isolate: boolean;
  ghost: boolean;
  explode: boolean;
  clip: boolean;
  clipHeightM: number | null; // null: this step's default, just above the deck
  drawerOpen: boolean;
  manualOpen: boolean; // the enlarged manual panel
  perfOpen: boolean;
};

const reducedMotion = (): boolean => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

let state: StudioState = {
  key: '', t: 0, playing: false, direction: 1, selection: null, conflict: null, cameraMode: 'guided', cameraRequest: 0, focusRequest: 0,
  frameRequest: 0, frameBounds: null, isolate: false, ghost: false, explode: false, clip: false, clipHeightM: null,
  drawerOpen: true, manualOpen: false, perfOpen: typeof location !== 'undefined' && /[?&]perf\b/.test(location.hash + location.search),
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
// from the beginning and asks for the guided camera. Under reduced motion the step opens at its end state; a step with
// no timeline (the tray, a still step, a review step) opens on its state and never plays.
// A selection survives only when the selected part exists on the board being entered (`members`); the boards have no
// defined part-to-part correspondence, so nothing is remapped by name or shape. Inspection toggles carry over; the clip
// height and a chosen conflict pair belong to the step they were set in.
export function enterStep(key: string, duration: number, members: ReadonlySet<string>): boolean {
  if (state.key === key) return false;
  const still = reducedMotion() || duration === 0;
  const selection = state.selection !== null && members.has(state.selection) ? state.selection : null;
  set({ key, t: still ? duration : 0, playing: !still, direction: 1, cameraMode: 'guided', cameraRequest: state.cameraRequest + 1, selection,
    conflict: null, clipHeightM: null, manualOpen: key.endsWith('/0') ? false : state.manualOpen });
  return true;
}

export const advance = (dt: number, duration: number): void => {
  if (!state.playing) return;
  const t = Math.min(duration, Math.max(0, state.t + dt * state.direction));
  set({ t, playing: t > 0 && t < duration });
};
export const play = (duration: number): void => set({ playing: duration > 0 && !reducedMotion(), direction: 1, t: reducedMotion() ? duration : state.t >= duration ? 0 : state.t });
export const rewind = (): void => set({ playing: state.t > 0 && !reducedMotion(), direction: -1, t: reducedMotion() ? 0 : state.t });
export const pause = (): void => set({ playing: false });
export const replay = (duration: number): void => set({ t: reducedMotion() ? duration : 0, playing: duration > 0 && !reducedMotion(), direction: 1 });
export const seek = (t: number): void => set({ t, playing: false });
export const select = (selection: string | null): void => set({ selection });
// One Escape press clears what is singled out: the selection and a chosen conflict pair together.
export const clearSelection = (): void => set({ selection: null, conflict: null });
export const hasSelection = (): boolean => state.selection !== null || state.conflict !== null;
export const selectConflict = (conflict: number | null): void => set({ conflict, selection: null, cameraMode: conflict === null ? state.cameraMode : 'manual' });
export const yieldCamera = (): void => { if (state.cameraMode !== 'manual') set({ cameraMode: 'manual' }); };
export const resetCamera = (): void => set({ cameraMode: 'guided', cameraRequest: state.cameraRequest + 1 });
export const focusSelection = (): void => { if (state.selection) set({ cameraMode: 'manual', focusRequest: state.focusRequest + 1 }); };
export const frameBounds = (bounds: Bounds): void => set({ cameraMode: 'manual', frameRequest: state.frameRequest + 1, frameBounds: bounds });
export const toggleDrawer = (): void => set({ drawerOpen: !state.drawerOpen });
export const setManualOpen = (manualOpen: boolean): void => set({ manualOpen });
export const togglePerf = (): void => { if (!state.perfOpen) resetPerfSample(); set({ perfOpen: !state.perfOpen }); };
export type InspectTool = 'isolate' | 'ghost' | 'explode' | 'clip';
export const toggleInspect = (tool: InspectTool): void => set({ [tool]: !state[tool] } as Partial<StudioState>);
export const setClipHeight = (clipHeightM: number): void => set({ clipHeightM });
export const inspecting = (s: StudioState = state): boolean => s.isolate || s.ghost || s.explode || s.clip;
export const resetInspection = (): void => set({ isolate: false, ghost: false, explode: false, clip: false, clipHeightM: null });
