import { invoke, isTauri } from '@tauri-apps/api/core';

export type PowerState = { source: 'ac' | 'battery' | 'unknown'; lowPower: boolean; thermal: 'nominal' | 'fair' | 'serious' | 'critical' | 'unknown' };
let power: PowerState = { source: 'unknown', lowPower: false, thermal: 'unknown' };
export const powerState = (): PowerState => power;

// Use the accepted governor's half steps: 1.5 was usable with the detailed HAT; 1 is its existing conservative floor.
// These are resolution ceilings, not a battery-life claim. Geometry, lighting, source poses and checks stay intact.
export function qualityPolicy(state: PowerState, backingScale: number): { ceiling: number; reason: string } {
  const conservative = state.lowPower || state.thermal === 'serious' || state.thermal === 'critical';
  const limit = conservative ? 1 : state.source === 'ac' ? 2 : 1.5;
  return { ceiling: Math.min(limit, Math.max(1, backingScale)), reason: state.lowPower ? 'Low Power Mode' : conservative ? `Thermal ${state.thermal}` : state.source === 'battery' ? 'Battery power' : state.source === 'ac' ? 'AC power' : 'Power source unavailable' };
}

// Only while a viewport is mounted. Poll infrequently, also refresh on activation, and discard late results on exit.
export function subscribePower(changed: () => void): () => void {
  if (!isTauri()) return () => {};
  let closed = false, pending = false;
  const refresh = async () => {
    if (pending || closed) return;
    pending = true;
    try {
      const next = await invoke<PowerState>('studio_power_state');
      if (!closed && JSON.stringify(next) !== JSON.stringify(power)) { power = next; changed(); }
    } catch {
      if (!closed) { power = { source: 'unknown', lowPower: false, thermal: 'unknown' }; changed(); }
    } finally { pending = false; }
  };
  void refresh();
  const timer = setInterval(() => void refresh(), 30_000);
  window.addEventListener('focus', refresh);
  return () => { closed = true; clearInterval(timer); window.removeEventListener('focus', refresh); };
}
