// Real fullscreen: the native macOS window in Tauri (studio-window capability), the Fullscreen API in a browser.
import { useSyncExternalStore } from 'react';
import { isTauri } from '@tauri-apps/api/core';
import { getCurrentWindow } from '@tauri-apps/api/window';

let fullscreen = false;
const listeners = new Set<() => void>();
const emit = (value: boolean): void => { if (value !== fullscreen) { fullscreen = value; for (const l of listeners) l(); } };

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  const onDocument = (): void => emit(document.fullscreenElement !== null);
  document.addEventListener('fullscreenchange', onDocument);
  let unlisten: (() => void) | undefined;
  let closed = false;
  if (isTauri()) {
    const win = getCurrentWindow();
    void win.isFullscreen().then(emit);
    void win.onResized(() => { void win.isFullscreen().then(emit); }).then((u) => { if (closed) u(); else unlisten = u; });
  }
  return () => { closed = true; listeners.delete(listener); document.removeEventListener('fullscreenchange', onDocument); unlisten?.(); };
}

export const useFullscreen = (): boolean => useSyncExternalStore(subscribe, () => fullscreen, () => false);
export const fullscreenMode = (): 'native window' | 'browser' => (isTauri() ? 'native window' : 'browser');

export async function setFullscreen(on: boolean, element: HTMLElement): Promise<void> {
  if (isTauri()) {
    await getCurrentWindow().setFullscreen(on);
    emit(await getCurrentWindow().isFullscreen());
    return;
  }
  if (on && !document.fullscreenElement) await element.requestFullscreen();
  if (!on && document.fullscreenElement) await document.exitFullscreen();
}
