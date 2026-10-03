// Escape (F8): one physical press performs at most one action, however long it is held; a keyup acts only for a press
// whose keydown never arrived (AppKit consumes Escape's keydown in a native fullscreen window).
import { expect, it, vi } from 'vitest';
import { dispatchNativeEscape, escapePresses, subscribeNativeEscape } from '../../src/features/assembly-3d/state/escape';

const down = (repeat = false) => ({ key: 'Escape', repeat }) as KeyboardEvent;
const up = () => ({ key: 'Escape' }) as KeyboardEvent;

it('acts once for an ordinary press', () => {
  const act = vi.fn(), esc = escapePresses(act);
  esc.keydown(down()); esc.keyup(up());
  expect(act).toHaveBeenCalledTimes(1);
});

it('acts once for a long press with auto-repeat, and not again on release', () => {
  const act = vi.fn(), esc = escapePresses(act);
  esc.keydown(down());
  for (let i = 0; i < 20; i++) esc.keydown(down(true));
  esc.keyup(up());
  expect(act).toHaveBeenCalledTimes(1);
});

it('acts once on keyup when the keydown never arrived', () => {
  const act = vi.fn(), esc = escapePresses(act);
  esc.keyup(up());
  expect(act).toHaveBeenCalledTimes(1);
});

it('acts once when only repeats arrive for a held press', () => {
  const act = vi.fn(), esc = escapePresses(act);
  esc.keydown(down(true)); esc.keydown(down(true)); esc.keyup(up());
  expect(act).toHaveBeenCalledTimes(1);
});

it('treats a fresh keydown as a new press even if the last keyup was lost', () => {
  const act = vi.fn(), esc = escapePresses(act);
  esc.keydown(down()); // its keyup never arrives (focus moved during a fullscreen transition)
  esc.keydown(down()); esc.keyup(up());
  expect(act).toHaveBeenCalledTimes(2);
});

it('ignores other keys', () => {
  const act = vi.fn(), esc = escapePresses(act);
  esc.keydown({ key: 'f', repeat: false } as KeyboardEvent); esc.keyup({ key: 'f' } as KeyboardEvent);
  expect(act).not.toHaveBeenCalled();
});

it('clears a selection on the first press and leaves fullscreen on a separate second press', () => {
  let selection: string | null = 'PX-V40-INS-PI5-001', fullscreen = true;
  const esc = escapePresses(() => { if (selection) selection = null; else fullscreen = false; });
  esc.keydown(down()); for (let i = 0; i < 5; i++) esc.keydown(down(true)); esc.keyup(up());
  expect([selection, fullscreen]).toEqual([null, true]);
  esc.keydown(down()); esc.keyup(up());
  expect(fullscreen).toBe(false);
});

it('delivers native presses without a DOM focus target and removes the old route handler', () => {
  const previous = vi.fn(), current = vi.fn();
  const leave = subscribeNativeEscape(previous);
  dispatchNativeEscape();
  expect(previous).toHaveBeenCalledTimes(1);
  leave();
  const stop = subscribeNativeEscape(current);
  dispatchNativeEscape();
  expect(previous).toHaveBeenCalledTimes(1);
  expect(current).toHaveBeenCalledTimes(1);
  stop();
  dispatchNativeEscape();
  expect(current).toHaveBeenCalledTimes(1);
});
