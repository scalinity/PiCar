// Inspection presentation: pure functions of the step, the selection and the toggles. Nothing here is written back to
// the manifest, a closure, M7 or physical progress; the scene composes these over the evaluated poses every frame, so
// turning a tool off, seeking or replaying always returns the exact evaluated poses.
import type { DefinitionEntry, Pose, Quat, StepEntry, StudioManifest, Vec3, VariantEntry } from '../assets/pack';
import type { InstanceState } from './evaluate';

export type Style = 'normal' | 'selected' | 'focus' | 'ghost' | 'hidden';

// The parts isolate and ghost keep in view: the selection with the chosen conflict pair, else the pair, else a review
// step's named parts, else the parts this step names. On the tray nothing is singled out unless something is selected.
export function keptIds(entry: StepEntry | undefined, selection: string | null, pair: string[] | null): Set<string> | null {
  if (selection) return new Set([selection, ...(pair ?? [])]);
  if (pair) return new Set(pair);
  if (!entry) return null;
  if (entry.mode === 'review') return new Set([...entry.focusInstanceIds, ...entry.newlyPlacedInstanceIds]);
  return new Set(entry.stepParts.filter((p) => p.use !== 'tool').map((p) => p.instanceId));
}

// The parts drawn with the review tint: the chosen conflict pair; else, in review, the refused candidate's own parts or
// the two ends of the unresolved connection.
export function focusIds(entry: StepEntry | undefined, pair: string[] | null): Set<string> {
  if (pair) return new Set(pair);
  if (entry?.mode !== 'review') return new Set();
  return new Set(entry.candidatePlacements ? entry.newlyPlacedInstanceIds : entry.focusInstanceIds);
}

export function styleOf(id: string, o: { selection: string | null; focus: Set<string>; kept: Set<string> | null; isolate: boolean; ghost: boolean }): Style {
  if (id === o.selection) return 'selected';
  const kept = !o.kept || o.kept.has(id);
  if (!kept && o.isolate) return 'hidden';
  if (o.focus.has(id)) return 'focus';
  if (!kept && o.ghost) return 'ghost';
  return 'normal';
}

export function rotate(q: Quat, v: Vec3): Vec3 {
  const [x, y, z, w] = q;
  const tx = 2 * (y * v[2] - z * v[1]), ty = 2 * (z * v[0] - x * v[2]), tz = 2 * (x * v[1] - y * v[0]);
  return [v[0] + w * tx + y * tz - z * ty, v[1] + w * ty + z * tx - x * tz, v[2] + w * tz + x * ty - y * tx];
}

// A definition's bounding box placed at a pose: the world-axis box around its eight transformed corners.
export function worldBox(d: DefinitionEntry, pose: Pose): { min: Vec3; max: Vec3 } {
  const min: Vec3 = [Infinity, Infinity, Infinity], max: Vec3 = [-Infinity, -Infinity, -Infinity];
  for (let k = 0; k < 8; k++) {
    const p = rotate(pose.rotationXYZW, [(k & 1 ? d.boundsM.max : d.boundsM.min)[0], (k & 2 ? d.boundsM.max : d.boundsM.min)[1], (k & 4 ? d.boundsM.max : d.boundsM.min)[2]]);
    for (let i = 0; i < 3; i++) { const v = p[i] + pose.translationM[i]; min[i] = Math.min(min[i], v); max[i] = Math.max(max[i], v); }
  }
  return { min, max };
}

const H = 0.35, V = 0.75; // horizontal spread and vertical lift per unit explosion

// Explosion offsets at full strength for every part this step's state places: away from the state's centre across the
// floor, and up in proportion to each part's height above the state's base, so a stack (screw, standoff, board, HAT)
// opens in its own order and nothing is pushed through the floor. Scaling centres about one point keeps every part's
// order along each axis. Step-aware: the state, its centre and its base are this step's.
export function explodeOffsets(manifest: StudioManifest, entry: StepEntry | undefined): Map<string, Vec3> {
  const out = new Map<string, Vec3>();
  if (!entry) return out;
  const boxes = Object.entries(entry.placements).map(([id, pose]) => [id, worldBox(manifest.definitions[manifest.instances[id].definitionId], pose)] as const);
  if (!boxes.length) return out;
  const centre = (b: { min: Vec3; max: Vec3 }): Vec3 => [(b.min[0] + b.max[0]) / 2, (b.min[1] + b.max[1]) / 2, (b.min[2] + b.max[2]) / 2];
  const lo = [0, 2].map((i) => Math.min(...boxes.map(([, b]) => centre(b)[i]))), hi = [0, 2].map((i) => Math.max(...boxes.map(([, b]) => centre(b)[i])));
  const mid = [(lo[0] + hi[0]) / 2, (lo[1] + hi[1]) / 2], base = Math.min(...boxes.map(([, b]) => b.min[1]));
  for (const [id, b] of boxes) { const c = centre(b); out.set(id, [(c[0] - mid[0]) * H, (c[1] - base) * V, (c[2] - mid[1]) * H]); }
  return out;
}

// How much of its explosion offset a part carries right now: all of it once placed, none while it is still on its way
// from the tray, and in step with its approach in between, so an exploded view stays continuous through playback.
export const explodeWeight = (s: InstanceState): number => (s.phase === 'installed' || s.phase === 'candidate' ? 1 : s.phase === 'approach' ? s.progress ?? 0 : 0);

const PLATE_A = 'PX-V40-DEF-PLATE-A';

// The deck clip: the height range a cut can take in this state, and its default just above the chassis deck, which
// opens up the layer of standoffs and boards that sits on Plate A. The tray is never cut: the guard keeps x below it.
export function clipRange(manifest: StudioManifest, variant: VariantEntry, entry: StepEntry | undefined): { min: number; max: number; deck: number; trayGuardX: number } {
  const trayGuardX = Math.max(...variant.tray.groups.map((g) => g.boundsM.max[0])) + 0.005;
  const boxes = Object.entries(entry?.placements ?? {}).map(([id, pose]) => ({ id, b: worldBox(manifest.definitions[manifest.instances[id].definitionId], pose) }));
  if (!boxes.length) return { min: variant.floorYM, max: variant.floorYM + 0.1, deck: variant.floorYM + 0.05, trayGuardX };
  const min = Math.min(...boxes.map((x) => x.b.min[1])), max = Math.max(...boxes.map((x) => x.b.max[1]));
  const plate = boxes.find((x) => manifest.instances[x.id].definitionId === PLATE_A);
  return { min, max, deck: plate ? Math.min(max, plate.b.max[1] + 0.006) : (min + max) / 2, trayGuardX };
}
