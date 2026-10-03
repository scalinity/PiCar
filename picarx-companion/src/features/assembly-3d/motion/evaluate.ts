// Pure, deterministic step presentation: pose = f(step, t). No frame integration, no state.
// Two phases per part the step's closure places (and the previous closure did not):
//   bring-in  tray -> staged start, an arc over the chassis. Presentation travel only, never an assembly path.
//   approach  staged start -> final pose along the M7 recipe's axis (non-physical staging, stagingOnly).
// At t >= duration every pose is the closure pose object itself, so endpoints equal the source exactly. A review step
// (a blocked relation, a refused candidate) has no timeline: it opens on its recorded state and never plays.
import type { Pose, Quat, StepEntry, Vec3, VariantEntry } from '../assets/pack';

// candidate: a pose from a refused step's candidate record, shown for review and never as an installation.
export type Phase = 'installed' | 'candidate' | 'tray' | 'waiting' | 'bring-in' | 'approach';
// progress: how far an approach has run (0 to 1), so presentation offsets can follow a part in without a jump.
export type InstanceState = { pose: Pose; phase: Phase; placed: boolean; progress?: number };
export type Timing = { bringInS: number; approachS: number; staggerS: number };
type Track = { instanceId: string; start: number; bringIn: number; approach: number; from: Pose; staged: Pose; final: Pose };
export type Timeline = { step: number; duration: number; tracks: Track[] };

const ARC_LIFT_M = 0.07;

export const easeInOutCubic = (x: number): number => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const clamp01 = (x: number): number => (x <= 0 ? 0 : x >= 1 ? 1 : x);

// Endpoint-exact forms: at u = 0 the result is a, at u = 1 it is b, with no rounding drift.
const lerp = (a: Vec3, b: Vec3, u: number): Vec3 => (u >= 1 ? b : [a[0] * (1 - u) + b[0] * u, a[1] * (1 - u) + b[1] * u, a[2] * (1 - u) + b[2] * u]);
function arc(a: Vec3, b: Vec3, u: number): Vec3 {
  if (u >= 1) return b;
  const c: Vec3 = [(a[0] + b[0]) / 2, Math.max(a[1], b[1]) + ARC_LIFT_M, (a[2] + b[2]) / 2];
  const k0 = (1 - u) * (1 - u), k1 = 2 * (1 - u) * u, k2 = u * u;
  return [k0 * a[0] + k1 * c[0] + k2 * b[0], k0 * a[1] + k1 * c[1] + k2 * b[1], k0 * a[2] + k1 * c[2] + k2 * b[2]];
}
export function slerp(a: Quat, b: Quat, u: number): Quat {
  if (u <= 0) return a;
  if (u >= 1) return b;
  let [bx, by, bz, bw] = b;
  let cos = a[0] * bx + a[1] * by + a[2] * bz + a[3] * bw;
  if (cos < 0) { cos = -cos; bx = -bx; by = -by; bz = -bz; bw = -bw; }
  if (cos > 0.9995) {
    const q: Quat = [a[0] + (bx - a[0]) * u, a[1] + (by - a[1]) * u, a[2] + (bz - a[2]) * u, a[3] + (bw - a[3]) * u];
    const n = Math.hypot(...q);
    return [q[0] / n, q[1] / n, q[2] / n, q[3] / n];
  }
  const theta = Math.acos(cos), s = Math.sin(theta), wa = Math.sin((1 - u) * theta) / s, wb = Math.sin(u * theta) / s;
  return [a[0] * wa + bx * wb, a[1] * wa + by * wb, a[2] * wa + bz * wb, a[3] * wa + bw * wb];
}

export function timelineFor(variant: VariantEntry, step: number, timing: Timing): Timeline {
  if (step === 0 || !variant.steps[step - 1].operable) return { step, duration: 0, tracks: [] };
  const entry = variant.steps[step - 1];
  const recipes = new Map(entry.recipes.map((r) => [r.instanceId, r]));
  // What this closure places that the previous one did not: a part can be introduced in one step and placed in a later one.
  const placing = entry.newlyPlacedInstanceIds;
  // The workpiece an operation attaches to (no recipe) arrives first, then parts in M7 install order.
  const order = [...placing.filter((id) => !recipes.has(id)), ...entry.recipes.map((r) => r.instanceId).filter((id) => placing.includes(id))];
  const tracks = order.map((instanceId, i): Track => {
    const final = entry.placements[instanceId], recipe = recipes.get(instanceId);
    return { instanceId, start: i * timing.staggerS, bringIn: timing.bringInS, approach: recipe ? timing.approachS : 0,
      from: variant.tray.instances[instanceId], staged: recipe ? recipe.stagedStart : final, final };
  });
  return { step, duration: tracks.reduce((d, t) => Math.max(d, t.start + t.bringIn + t.approach), 0), tracks };
}

function trackState(track: Track, t: number): InstanceState {
  const local = t - track.start;
  if (local <= 0) return { pose: track.from, phase: 'waiting', placed: false };
  if (local < track.bringIn) {
    const u = easeInOutCubic(clamp01(local / track.bringIn));
    return { pose: { translationM: arc(track.from.translationM, track.staged.translationM, u), rotationXYZW: slerp(track.from.rotationXYZW, track.staged.rotationXYZW, u) }, phase: 'bring-in', placed: false, progress: track.approach === 0 ? u : 0 };
  }
  if (track.approach > 0 && local < track.bringIn + track.approach) {
    const v = easeInOutCubic(clamp01((local - track.bringIn) / track.approach));
    return { pose: { translationM: lerp(track.staged.translationM, track.final.translationM, v), rotationXYZW: track.final.rotationXYZW }, phase: 'approach', placed: false, progress: v };
  }
  return { pose: track.final, phase: 'installed', placed: true };
}

// Every S01-S09 part of the variant gets a state: installed, moving, or in the labelled tray.
// A part without a source pose stays in the tray; nothing is ever given an identity transform.
export function statesAt(variant: VariantEntry, timeline: Timeline, t: number): Map<string, InstanceState> {
  const out = new Map<string, InstanceState>();
  const entry: StepEntry | undefined = timeline.step > 0 ? variant.steps[timeline.step - 1] : undefined;
  const moving = new Map(timeline.tracks.map((k) => [k.instanceId, k]));
  for (const [id, tray] of Object.entries(variant.tray.instances)) {
    const placement = entry?.placements[id];
    const track = moving.get(id);
    if (track) out.set(id, t >= timeline.duration ? { pose: placement!, phase: 'installed', placed: true } : trackState(track, t));
    else if (placement) out.set(id, { pose: placement, phase: entry!.candidatePlacements ? 'candidate' : 'installed', placed: true });
    else out.set(id, { pose: tray, phase: 'tray', placed: false });
  }
  return out;
}
