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
  listeners.clear();
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
  const stop = fs.subscribeFullscreen(() => {});
  const element = { requestFullscreen: vi.fn(async () => { throw new TypeError('Permissions check failed'); }) } as unknown as HTMLElement;
  await expect(fs.setFullscreen(true, element)).resolves.toBeUndefined();
  expect(fs.fullscreenState()).toEqual({ on: false, error: 'Fullscreen is not available here.' });
  stop();
});

it('runs overlapping requests in order and ends on the platform state', async () => {
  const fs = await import('../../src/features/assembly-3d/state/fullscreen');
  const stop = fs.subscribeFullscreen(() => {});
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
  stop();
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
  const fs = await import('../../src/features/assembly-3d/state/fullscreen');
  const stop = fs.subscribeFullscreen(() => {});
  await vi.waitFor(() => expect(native.invoke).toHaveBeenCalled());
  native.invoke.mockRejectedValueOnce(new Error('capture unavailable'));
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
  stop();
});

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((ok) => { resolve = ok; });
  return { promise, resolve };
}

it('cancels a queued entry after the last Studio subscriber leaves and compensates an in-flight entry', async () => {
  native.enabled = true;
  const pending = deferred<void>();
  const unlisten = vi.fn();
  let capture = false;
  native.listen.mockResolvedValue(unlisten);
  native.invoke.mockImplementation(async (_command, args) => { capture = args.enabled; });
  native.setFullscreen.mockImplementationOnce(() => pending.promise);
  const fs = await import('../../src/features/assembly-3d/state/fullscreen');
  const subscriber = vi.fn();
  const stop = fs.subscribeFullscreen(subscriber);
  await vi.waitFor(() => expect(capture).toBe(true));
  const first = fs.setFullscreen(true, {} as HTMLElement);
  await vi.waitFor(() => expect(native.setFullscreen).toHaveBeenCalledExactlyOnceWith(true));
  const second = fs.setFullscreen(true, {} as HTMLElement);
  stop(); stop(); // cleanup is idempotent
  await vi.waitFor(() => expect(capture).toBe(false));
  const callsAtClose = native.invoke.mock.calls.length;
  const notificationsAtClose = subscriber.mock.calls.length;
  pending.resolve(undefined);
  await Promise.all([first, second]);
  expect(native.listen).toHaveBeenCalledTimes(1);
  expect(unlisten).toHaveBeenCalledTimes(1); // zero remaining native Escape listeners
  expect(capture).toBe(false);
  expect(native.invoke.mock.calls.slice(callsAtClose).some(([, a]) => a.enabled)).toBe(false);
  expect(native.setFullscreen.mock.calls).toEqual([[true], [false]]);
  expect(subscriber).toHaveBeenCalledTimes(notificationsAtClose); // zero subscribers receive stale state
});

it('keeps a remounted Studio lifetime independent of stale entry and cleanup', async () => {
  native.enabled = true;
  const pending = deferred<void>();
  let capture = false;
  const oldListener = vi.fn(), newListener = vi.fn();
  native.listen.mockResolvedValueOnce(oldListener).mockResolvedValueOnce(newListener);
  native.invoke.mockImplementation(async (_command, args) => { capture = args.enabled; });
  native.setFullscreen.mockImplementationOnce(() => pending.promise);
  const fs = await import('../../src/features/assembly-3d/state/fullscreen');
  const oldStop = fs.subscribeFullscreen(() => {});
  await vi.waitFor(() => expect(capture).toBe(true));
  const oldEntry = fs.setFullscreen(true, {} as HTMLElement);
  await vi.waitFor(() => expect(native.setFullscreen).toHaveBeenCalledTimes(1));
  const staleQueued = fs.setFullscreen(true, {} as HTMLElement);
  oldStop();
  const newStop = fs.subscribeFullscreen(() => {});
  await vi.waitFor(() => expect(native.listen).toHaveBeenCalledTimes(2));
  const newEntry = fs.setFullscreen(true, {} as HTMLElement);
  oldStop(); // old cleanup cannot close the new lifetime
  pending.resolve(undefined);
  await Promise.all([oldEntry, staleQueued, newEntry]);
  expect(native.setFullscreen.mock.calls).toEqual([[true], [false], [true]]);
  expect(capture).toBe(true);
  expect(oldListener).toHaveBeenCalledTimes(1);
  expect(newListener).not.toHaveBeenCalled();
  newStop();
  await vi.waitFor(() => expect(capture).toBe(false));
  expect(newListener).toHaveBeenCalledTimes(1);
});

it('disposes a native Escape listener that resolves after its Studio lifetime ends', async () => {
  native.enabled = true;
  const listening = deferred<() => void>(), unlisten = vi.fn();
  native.listen.mockReturnValue(listening.promise);
  const fs = await import('../../src/features/assembly-3d/state/fullscreen');
  const stop = fs.subscribeFullscreen(() => {});
  await vi.waitFor(() => expect(native.listen).toHaveBeenCalledTimes(1));
  stop();
  listening.resolve(unlisten);
  await vi.waitFor(() => expect(unlisten).toHaveBeenCalledTimes(1));
  expect(native.invoke.mock.calls.some(([, args]) => args.enabled)).toBe(false);
});

it('compensates capture enable resolving after unmount before the next lifetime enables', async () => {
  native.enabled = true;
  const enabling = deferred<void>(), unlisten = vi.fn();
  let capture = false;
  native.listen.mockResolvedValue(unlisten);
  native.invoke.mockImplementationOnce(async () => { await enabling.promise; capture = true; })
    .mockImplementation(async (_command, args) => { capture = args.enabled; });
  const fs = await import('../../src/features/assembly-3d/state/fullscreen');
  const stop = fs.subscribeFullscreen(() => {});
  await vi.waitFor(() => expect(native.invoke).toHaveBeenCalledTimes(1));
  stop();
  enabling.resolve(undefined);
  await vi.waitFor(() => expect(unlisten).toHaveBeenCalledTimes(1));
  expect(capture).toBe(false);
  expect(native.invoke.mock.calls.map(([, args]) => args.enabled)).toEqual([true, false]);
});
