// Entering a board or step keeps a selection only when that part exists there (F3); nothing is remapped.
import { expect, it } from 'vitest';
import { enterStep, getStudioState, select } from '../../src/features/assembly-3d/state/studio-store';

it('clears a board-specific selection on a board switch and keeps a part both boards share', () => {
  const pi5 = new Set(['PX-V40-INS-PLATE-A-001', 'PX-V40-INS-PI5-001']);
  const zero = new Set(['PX-V40-INS-PLATE-A-001', 'PX-V40-INS-ZERO2W-001']);
  enterStep('rpi5/2', 4, pi5);
  select('PX-V40-INS-PI5-001');
  enterStep('rpi-zero-2-w/2', 4, zero);
  expect(getStudioState().selection).toBeNull();
  select('PX-V40-INS-PLATE-A-001');
  enterStep('rpi5/2', 4, pi5);
  expect(getStudioState().selection).toBe('PX-V40-INS-PLATE-A-001');
  select('PX-V40-INS-PI5-001');
  expect(enterStep('rpi5/2', 4, pi5)).toBe(false); // same board and step: nothing to re-enter
  expect(getStudioState().selection).toBe('PX-V40-INS-PI5-001');
});

it('entering the tray closes the manual immediately and does not resurrect it on return', async () => {
  const { setManualOpen, clearSelection, hasSelection } = await import('../../src/features/assembly-3d/state/studio-store');
  const { escapePresses } = await import('../../src/features/assembly-3d/state/escape');
  const members = new Set(['PX-V40-INS-PLATE-A-001']);
  enterStep('rpi5/1', 4, members);
  select('PX-V40-INS-PLATE-A-001'); setManualOpen(true);
  enterStep('rpi5/0', 0, members);
  expect(getStudioState().manualOpen).toBe(false);
  let fullscreen = true;
  const esc = escapePresses(() => { if (getStudioState().manualOpen) setManualOpen(false); else if (hasSelection()) clearSelection(); else fullscreen = false; });
  esc.keydown({ key: 'Escape', repeat: false } as KeyboardEvent);
  esc.keyup({ key: 'Escape' } as KeyboardEvent);
  expect(getStudioState().selection).toBeNull(); expect(fullscreen).toBe(true);
  enterStep('rpi5/1', 4, members);
  expect(getStudioState().manualOpen).toBe(false);
});
