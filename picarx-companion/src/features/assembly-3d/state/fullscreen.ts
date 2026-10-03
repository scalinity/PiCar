// Native/window fullscreen and Escape capture belong to the current Studio subscription lifetime.
// Both queues are serialized; stale work cannot publish state or capture input for a later mount.
import { useSyncExternalStore } from 'react';
import { invoke, isTauri } from '@tauri-apps/api/core';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { dispatchNativeEscape } from './escape';

export type FullscreenState = { on: boolean; error: string };
let state: FullscreenState = { on: false, error: '' };
const listeners = new Set<() => void>();
type Lifetime = object;
let lifetime: Lifetime | undefined;
const current = (owner: Lifetime | undefined): boolean => owner !== undefined && owner === lifetime;
const set = (patch: Partial<FullscreenState>): void => {
  const next = { ...state, ...patch };
  if (next.on === state.on && next.error === state.error) return;
  state = next;
  for (const l of listeners) l();
};
export const fullscreenState = (): FullscreenState => state;

let captureQueue: Promise<void> = Promise.resolve();
let captureOwner: Lifetime | undefined;
let unlistenNative: (() => void) | undefined;
function captureNativeEscape(enabled: boolean, owner: Lifetime): Promise<void> {
  const request = captureQueue.then(async () => {
    if (enabled) {
      if (!current(owner)) return;
      if (!unlistenNative) {
        const unlisten = await getCurrentWindow().listen('studio-escape', dispatchNativeEscape);
        if (!current(owner)) { unlisten(); return; }
        unlistenNative = unlisten;
      }
      captureOwner = owner;
      try { await invoke('studio_escape_capture', { enabled: true }); }
      finally {
        // A capture enable may itself finish after unmount. Release it before the next queued lifetime can enable.
        if (!current(owner)) {
          try { await invoke('studio_escape_capture', { enabled: false }); }
          finally { unlistenNative?.(); unlistenNative = undefined; captureOwner = undefined; }
        }
      }
    } else if (captureOwner === owner) {
      try { await invoke('studio_escape_capture', { enabled: false }); }
      finally { unlistenNative?.(); unlistenNative = undefined; captureOwner = undefined; }
    }
  });
  captureQueue = request.catch(() => {}); // failure must not prevent retry or cleanup
  return request;
}

async function resync(owner: Lifetime): Promise<void> {
  if (!current(owner)) return;
  try {
    const on = isTauri() ? await getCurrentWindow().isFullscreen() : document.fullscreenElement !== null;
    if (current(owner)) set({ on });
  } catch { /* unreadable: keep the last known state */ }
}

export function subscribeFullscreen(listener: () => void): () => void {
  const first = listeners.size === 0;
  if (first) lifetime = {};
  const owner = lifetime!;
  listeners.add(listener);
  const onDocument = (): void => { if (current(owner)) set({ on: document.fullscreenElement !== null }); };
  document.addEventListener('fullscreenchange', onDocument);
  let unlisten: (() => void) | undefined;
  let closed = false;
  if (isTauri()) {
    if (first) void captureNativeEscape(true, owner).catch(() => { if (current(owner)) set({ error: 'Studio Escape capture is not available.' }); });
    void resync(owner);
    void getCurrentWindow().onResized(() => { if (!closed) void resync(owner); })
      .then((u) => { if (closed || !current(owner)) u(); else unlisten = u; }).catch(() => {});
  }
  return () => {
    if (closed) return;
    closed = true; listeners.delete(listener); document.removeEventListener('fullscreenchange', onDocument); unlisten?.();
    if (listeners.size === 0 && current(owner)) {
      lifetime = undefined;
      if (isTauri()) void captureNativeEscape(false, owner).catch(() => {});
    }
  };
}

export const useFullscreen = (): boolean => useSyncExternalStore(subscribeFullscreen, () => state.on, () => false);
export const useFullscreenError = (): string => useSyncExternalStore(subscribeFullscreen, () => state.error, () => '');
export const fullscreenMode = (): 'native window' | 'browser' => (isTauri() ? 'native window' : 'browser');

async function apply(on: boolean, element: HTMLElement, owner: Lifetime | undefined): Promise<void> {
  if (!current(owner)) return;
  try {
    if (isTauri()) {
      if (on) await captureNativeEscape(true, owner!);
      if (!current(owner)) return;
      await getCurrentWindow().setFullscreen(on);
      if (!current(owner)) {
        // This entry may have changed the native window after unmount. Compensate before the next request runs.
        if (on) await getCurrentWindow().setFullscreen(false);
        return;
      }
    } else if (on && !document.fullscreenElement) {
      await element.requestFullscreen();
      if (!current(owner)) { if (document.fullscreenElement === element) await document.exitFullscreen(); return; }
    } else if (!on && document.fullscreenElement) {
      await document.exitFullscreen();
      if (!current(owner)) return;
    }
    set({ error: '' });
  } catch {
    if (current(owner)) set({ error: on ? 'Fullscreen is not available here.' : 'The Studio could not leave fullscreen.' });
  }
  if (current(owner)) await resync(owner!);
}

let queue: Promise<void> = Promise.resolve();
export function setFullscreen(on: boolean, element: HTMLElement): Promise<void> {
  const owner = lifetime;
  queue = queue.then(() => apply(on, element, owner));
  return queue;
}
