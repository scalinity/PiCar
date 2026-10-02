// Escape as physical presses: each press performs at most one action however long it is held. A press begins with a
// keydown that is not a repeat (or, if its first keydown was swallowed, with whichever of its keydowns arrives first);
// repeats of a handled press are ignored. In a native macOS fullscreen window AppKit consumes Escape's keydown, so a keyup
// acts only for a press none of whose keydowns arrived.
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
