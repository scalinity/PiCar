// Escape as physical presses: each press performs at most one action however long it is held. A press begins with a
// keydown that is not a repeat (or, if its first keydown was swallowed, with whichever of its keydowns arrives first);
// repeats of a handled press are ignored. A keyup acts only for a press none of whose keydowns arrived.
// Native fullscreen uses the AppKit monitor's window-scoped release event, independent of a detached DOM focus target.
const nativeListeners = new Set<() => void>();
export function subscribeNativeEscape(act: () => void): () => void {
  nativeListeners.add(act);
  return () => { nativeListeners.delete(act); };
}
export function dispatchNativeEscape(): void { for (const act of nativeListeners) act(); }

export function escapePresses(act: () => void): { keydown(e: KeyboardEvent): void; keyup(e: KeyboardEvent): void } {
  let handled = false; // the current press has already acted on a keydown
  return {
    keydown(e) {
      if (e.key !== 'Escape' || (e.repeat && handled)) return;
      handled = true;
      act();
    },
    keyup(e) {
      if (e.key !== 'Escape') return;
      if (!handled) act();
      handled = false;
    },
  };
}
