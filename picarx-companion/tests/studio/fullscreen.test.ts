// Fullscreen (F8): a failed request never escapes as an unhandled rejection; the state is re-read from the platform after
// every request, including failed and overlapping ones, and a failure is reported for the header to show.
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

const native = vi.hoisted(() => ({ enabled: false, invoke: vi.fn(), setFullscreen: vi.fn(), isFullscreen: vi.fn(), onResized: vi.fn(), listen: vi.fn() }));
vi.mock('@tauri-apps/api/core', () => ({ isTauri: () => native.enabled, invoke: native.invoke }));
vi.mock('@tauri-apps/api/window', () => ({ getCurrentWindow: () => native }));

let fullscreenElement: object | null = null;
const listeners = new Map<string, () => void>();
beforeEach(() => {
  vi.resetModules();
  native.enabled = false;
  vi.clearAllMocks();
  native.invoke.mockResolvedValue(undefined);
  native.isFullscreen.mockResolvedValue(false);
  native.onResized.mockResolvedValue(() => {});
  native.listen.mockResolvedValue(() => {});
  fullscreenElement = null;
  vi.stubGlobal('document', {
    get fullscreenElement() { return fullscreenElement; },
    addEventListener: (type: string, cb: () => void) => listeners.set(type, cb),
    removeEventListener: (type: string) => listeners.delete(type),
    exitFullscreen: vi.fn(async () => { fullscreenElement = null; }),
  });
});
afterEach(() => vi.unstubAllGlobals());

it('reports a refused request and resynchronizes to the real state', async () => {
  const fs = await import('../../src/features/assembly-3d/state/fullscreen');
  const element = { requestFullscreen: vi.fn(async () => { throw new TypeError('Permissions check failed'); }) } as unknown as HTMLElement;
  await expect(fs.setFullscreen(true, element)).resolves.toBeUndefined();
  expect(fs.fullscreenState()).toEqual({ on: false, error: 'Fullscreen is not available here.' });
});

it('runs overlapping requests in order and ends on the platform state', async () => {
  const fs = await import('../../src/features/assembly-3d/state/fullscreen');
  let finish: () => void = () => {};
  const element = { requestFullscreen: vi.fn(() => new Promise<void>((ok) => { finish = () => { fullscreenElement = element; ok(); }; })) } as unknown as HTMLElement;
  const enter = fs.setFullscreen(true, element);
  const leave = fs.setFullscreen(false, element); // pressed again before the first transition finished
  await Promise.resolve();
  expect(document.exitFullscreen).not.toHaveBeenCalled();
  finish();
  await Promise.all([enter, leave]);
  expect(document.exitFullscreen).toHaveBeenCalledTimes(1);
  expect(fs.fullscreenState()).toEqual({ on: false, error: '' });
});

it('follows a fullscreen change made outside the Studio', async () => {
  const fs = await import('../../src/features/assembly-3d/state/fullscreen');
  const seen: boolean[] = [];
  const stop = fs.subscribeFullscreen(() => seen.push(fs.fullscreenState().on));
  fullscreenElement = {};
  listeners.get('fullscreenchange')!();
  fullscreenElement = null;
  listeners.get('fullscreenchange')!();
  stop();
  expect(seen).toEqual([true, false]);
});

it('enables native Escape capture for Studio subscribers and releases it when the last subscriber leaves', async () => {
  native.enabled = true;
  const fs = await import('../../src/features/assembly-3d/state/fullscreen');
  const first = fs.subscribeFullscreen(() => {}), second = fs.subscribeFullscreen(() => {});
  await vi.waitFor(() => expect(native.invoke).toHaveBeenCalledExactlyOnceWith('studio_escape_capture', { enabled: true }));
  first();
  expect(native.invoke).toHaveBeenCalledTimes(1);
  second();
  await vi.waitFor(() => expect(native.invoke).toHaveBeenLastCalledWith('studio_escape_capture', { enabled: false }));
});

it('waits for native Escape capture before fullscreen and refuses entry if capture fails', async () => {
  native.enabled = true;
  native.invoke.mockRejectedValueOnce(new Error('capture unavailable'));
  const fs = await import('../../src/features/assembly-3d/state/fullscreen');
  await expect(fs.setFullscreen(true, {} as HTMLElement)).resolves.toBeUndefined();
  expect(native.setFullscreen).not.toHaveBeenCalled();
  expect(fs.fullscreenState()).toEqual({ on: false, error: 'Fullscreen is not available here.' });
  let ready: () => void = () => {};
  let requested = false;
  native.invoke.mockImplementationOnce(() => new Promise<void>((resolve) => { requested = true; ready = resolve; }));
  const pending = fs.setFullscreen(true, {} as HTMLElement);
  await vi.waitFor(() => expect(requested).toBe(true));
  expect(native.setFullscreen).not.toHaveBeenCalled();
  native.isFullscreen.mockResolvedValue(true);
  ready();
  await pending;
  expect(native.setFullscreen).toHaveBeenCalledExactlyOnceWith(true);
  expect(fs.fullscreenState()).toEqual({ on: true, error: '' });
});
