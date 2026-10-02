// Real fullscreen: the native macOS window in Tauri (studio-window capability), the Fullscreen API in a browser.
// Requests run one at a time and never reject; after each, succeeded or refused, the state is read back from the
// platform, so an overlapping, refused or externally made change cannot leave the Studio showing the wrong state.
// A refusal is kept as a message for the header.
import { useSyncExternalStore } from 'react';
import { isTauri } from '@tauri-apps/api/core';
import { getCurrentWindow } from '@tauri-apps/api/window';

export type FullscreenState = { on: boolean; error: string };
let state: FullscreenState = { on: false, error: '' };
const listeners = new Set<() => void>();
const set = (patch: Partial<FullscreenState>): void => {
  const next = { ...state, ...patch };
  if (next.on === state.on && next.error === state.error) return;
  state = next;
  for (const l of listeners) l();
};
export const fullscreenState = (): FullscreenState => state;

async function resync(): Promise<void> {
  try { set({ on: isTauri() ? await getCurrentWindow().isFullscreen() : document.fullscreenElement !== null }); } catch { /* unreadable: keep the last known state */ }
}

export function subscribeFullscreen(listener: () => void): () => void {
  listeners.add(listener);
  const onDocument = (): void => set({ on: document.fullscreenElement !== null });
  document.addEventListener('fullscreenchange', onDocument);
  let unlisten: (() => void) | undefined;
  let closed = false;
  if (isTauri()) {
    void resync();
    void getCurrentWindow().onResized(() => { void resync(); }).then((u) => { if (closed) u(); else unlisten = u; });
  }
  return () => { closed = true; listeners.delete(listener); document.removeEventListener('fullscreenchange', onDocument); unlisten?.(); };
}

export const useFullscreen = (): boolean => useSyncExternalStore(subscribeFullscreen, () => state.on, () => false);
export const useFullscreenError = (): string => useSyncExternalStore(subscribeFullscreen, () => state.error, () => '');
export const fullscreenMode = (): 'native window' | 'browser' => (isTauri() ? 'native window' : 'browser');

async function apply(on: boolean, element: HTMLElement): Promise<void> {
  try {
    if (isTauri()) await getCurrentWindow().setFullscreen(on);
    else if (on && !document.fullscreenElement) await element.requestFullscreen();
    else if (!on && document.fullscreenElement) await document.exitFullscreen();
    set({ error: '' });
  } catch {
    set({ error: on ? 'Fullscreen is not available here.' : 'The Studio could not leave fullscreen.' });
  }
  await resync();
}

let queue: Promise<void> = Promise.resolve();
export function setFullscreen(on: boolean, element: HTMLElement): Promise<void> {
  queue = queue.then(() => apply(on, element));
  return queue;
}
