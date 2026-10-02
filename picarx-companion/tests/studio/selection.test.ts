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
