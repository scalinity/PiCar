// Module-level progress store persisted to localStorage. Components read it
// with useProgress() (useSyncExternalStore); writes are synchronous — no effects.

import { useSyncExternalStore } from 'react';

export interface Progress {
  steps: Record<string, 'done'>;
  checks: Record<string, boolean>;
  lastRoute: string;
  pdfLastPage: number;
}

const KEY = 'picarx.v1';
const DEFAULTS: Progress = { steps: {}, checks: {}, lastRoute: '', pdfLastPage: 1 };

function load(): Progress {
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) ?? '{}') };
  } catch {
    return { ...DEFAULTS };
  }
}

let state: Progress = load();
const subs = new Set<() => void>();

export function update(patch: Partial<Progress>): void {
  state = { ...state, ...patch };
  localStorage.setItem(KEY, JSON.stringify(state));
  subs.forEach((f) => f());
}

export function useProgress(): Progress {
  return useSyncExternalStore(
    (cb) => (subs.add(cb), () => subs.delete(cb)),
    () => state,
  );
}

export const toggleCheck = (key: string): void =>
  update({ checks: { ...state.checks, [key]: !state.checks[key] } });

export function setStepDone(id: string, done: boolean): void {
  const steps = { ...state.steps };
  if (done) steps[id] = 'done';
  else delete steps[id];
  update({ steps });
}

// Remember where the user was (for the Home "resume" button). Module-level
// listener — fires on navigation, not on initial load, so a fresh launch
// doesn't clobber the previous session's position.
window.addEventListener('hashchange', () => {
  const h = window.location.hash;
  if (h && h !== '#/') update({ lastRoute: h });
});
