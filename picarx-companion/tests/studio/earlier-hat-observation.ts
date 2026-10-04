// Test-only synthetic observation using the exact accepted Studio 3 S04 context.
import fixture from './accepted-studio3-hat-context.json';
import { acceptedContext } from '../../src/features/assembly-session/accepted';
import { newId, sessionHistory, sessionActionBound } from '../../src/features/assembly-session/store';
import { copyPhoto } from '../../src/platform/evidence';
import { openBuildBoard } from '../../src/features/assembly-3d/build-along';
import type { StudioObservation } from '../../src/features/assembly-session/observation';

export async function attachEarlierHatObservation(): Promise<StudioObservation> {
  const sessionId = 'PX-STUDIO-RPI5', id = newId('OBSERVATION');
  const stored = await sessionHistory(sessionId);
  if (!stored) throw Error('TEST_SESSION_REQUIRED');
  const bytes = Uint8Array.from(atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aJU0AAAAASUVORK5CYII='), c => c.charCodeAt(0));
  const file = await copyPhoto(sessionId, id, bytes);
  const record = { ...fixture.context, id, sessionId, createdAt: new Date().toISOString(), file } as StudioObservation;
  await sessionActionBound(stored.aggregate, { kind: 'observation', record }, await acceptedContext('rpi5'));
  await openBuildBoard('rpi5');
  return record;
}
