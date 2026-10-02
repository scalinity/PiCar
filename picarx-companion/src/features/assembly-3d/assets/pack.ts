// Studio pack access: the generated manifest (poses, readiness, materials) and the shared part geometry.
// Built by digital-twin/tools/studio/studio.mjs; never hand-edited. A preview pack, not a G-GEOMETRY pack.
import { Group, Mesh, Object3D } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import manifestUrl from '../../../generated/studio/manifest.json?url';
import partsUrl from '../../../generated/studio/parts.glb?url';
import type { StudioVariant } from '../../../lib/router';

export type Vec3 = [number, number, number];
export type Quat = [number, number, number, number];
export type Pose = { translationM: Vec3; rotationXYZW: Quat };
export type Display = 'PREVIEW_SOURCE_REVALIDATED' | 'PREVIEW_BLOCKED_RELATION' | 'REVIEW_REFUSED_CANDIDATE' | 'UNAVAILABLE';

export type Recipe = { instanceId: string; approachAxis: Vec3; approachDistanceM: number; stagedStart: Pose; segments: string[]; stagingOnly: boolean };
export type StudioCamera = { positionM: Vec3; targetM: Vec3; verticalFovDeg: number };
export type StepEntry = {
  printedNumber: number; stepId: string; title: string; sourcePanel: string; display: Display; operable: boolean;
  assembly: { gate: string; status: string; admittedRows: number; requiredRows: number };
  introducedInstanceIds: string[]; introducedZeroSolidInstanceIds: string[]; placements: Record<string, Pose>; candidatePlacements: boolean;
  recipes: Recipe[]; blockers: { id: string; connectionIds?: string[] }[]; conflicts: { instances: string[]; volumeMm3: number }[];
  displayChecks: DisplayCheck[];
  dependencyWarnings: { printedNumber: number; text: string }[]; limitations: string[]; approximationFlags: string[];
  claims: Record<string, string>; source: { kind: string; file?: string; sha256?: string; closureVerify?: string; closureRfc8785Sha256?: string };
  camera: StudioCamera | null;
};
export type TrayPose = Pose & { orientation: 'installed' | 'part-local'; firstStep: number };
export type VariantEntry = { graphHash: string; floorYM: number; tray: { label: string; instances: Record<string, TrayPose>; camera: StudioCamera }; steps: StepEntry[] };
export type MaterialSpec = { label: string; basis: string; baseColor: Vec3; metallic: number; roughness: number; clearcoat?: number; clearcoatRoughness?: number };
// A registered display model's check against one placed state: CHECKED against that exact closure, or NOT_CHECKED.
export type DisplayCheck = { definitionId: string; status: 'CHECKED' | 'NOT_CHECKED'; closureRfc8785Sha256?: string; overlaps: { instanceId: string; volumeMm3: number }[] };
export type VendorPart = { part: string; footprintIoU?: number; centreOffsetXYMm?: [number, number]; vendorMatch?: null };
export type DisplayDetail = {
  label: string; source: string; artifact: { path: string; sha256: string }; record: { path: string; sha256: string; schema: string };
  relation: { mountingHoles?: { maxCentreDeviationMm: number | null } }; vendorCrossCheck?: { method: string; parts: VendorPart[] };
};
export type DisplayWithheld = { label: string; artifact: { path: string; sha256: string }; problems: string[] };
export type DefinitionEntry = { name: string; kind: string; approximation: string; artifact: { path: string; sha256: string }; boundsM: { min: Vec3; max: Vec3 }; display?: DisplayDetail; displayWithheld?: DisplayWithheld };
export type InstanceEntry = { definitionId: string; name: string; role: string; variants: StudioVariant[] };
export type LightSpec = { id: string; azimuthDeg: number; elevationDeg: number; distanceM: number; sizeM: [number, number]; color: Vec3; runtimeIntensity: number };
export type StudioManifest = {
  packId: string; contract: string; basis: string; unit: string;
  classification: { capability: string; label: string; engineeringAdmission: boolean; runtimeAdmission: boolean; instructionGeometry: boolean };
  source: { chain: { label: string; mode: string }; m7Gate: { gate: string; status: string; coverage: { complete: number; required: number } }; repository: { head: string } };
  assets: { parts: { path: string; sha256: string; bytes: number } };
  materials: Record<string, MaterialSpec>;
  lighting: { background: string; runtimeEnvironmentBase: Vec3; pool: { css: string }; lights: LightSpec[] };
  timing: { bringInS: number; approachS: number; staggerS: number; easing: string };
  readinessKinds: Record<Display, string>;
  definitions: Record<string, DefinitionEntry>; instances: Record<string, InstanceEntry>; variants: Record<StudioVariant, VariantEntry>;
};

export type LoadTimings = { manifestFetchMs: number; manifestParseMs: number; glbFetchMs: number; glbDecodeMs: number; buildMs: number; glbBytes: number };
export type LoadedPack = { manifest: StudioManifest; definitions: Map<string, Object3D>; timings: LoadTimings };

async function load(): Promise<LoadedPack> {
  const t0 = performance.now();
  const manifestText = await (await fetch(manifestUrl)).text();
  const t1 = performance.now();
  const manifest = JSON.parse(manifestText) as StudioManifest;
  const t2 = performance.now();
  const buffer = await (await fetch(partsUrl)).arrayBuffer();
  const t3 = performance.now();
  if (buffer.byteLength !== manifest.assets.parts.bytes) throw Error('Studio parts file does not match its manifest; rebuild the Studio pack.');
  const gltf = await new GLTFLoader().parseAsync(buffer, '');
  const t4 = performance.now();
  const definitions = new Map<string, Object3D>();
  for (const node of [...gltf.scene.children]) { // copy: wrapping a Mesh re-parents it out of this array
    const id = node.userData?.picarStudio?.definitionId as string | undefined;
    if (!id || !manifest.definitions[id]) throw Error(`Unidentified part node in the Studio pack: ${node.name}`);
    const root = node instanceof Mesh ? new Group().add(node) : node;
    root.traverse((o) => { if (o instanceof Mesh) { o.castShadow = true; o.receiveShadow = true; } });
    definitions.set(id, root);
  }
  for (const id of Object.keys(manifest.definitions)) if (!definitions.has(id)) throw Error(`Studio pack is missing the geometry for ${id}`);
  const t5 = performance.now();
  return { manifest, definitions, timings: { manifestFetchMs: t1 - t0, manifestParseMs: t2 - t1, glbFetchMs: t3 - t2, glbDecodeMs: t4 - t3, buildMs: t5 - t4, glbBytes: buffer.byteLength } };
}

let pending: Promise<LoadedPack> | null = null;
export const loadPack = (): Promise<LoadedPack> => (pending ??= load());
export const resetPackForRetry = (): void => { pending = null; };
