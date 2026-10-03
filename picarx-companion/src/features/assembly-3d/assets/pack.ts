// Studio pack access: the generated manifest (poses, readiness, materials) and the shared part geometry.
// Built by digital-twin/tools/studio/studio.mjs; never hand-edited. A preview pack, not a G-GEOMETRY pack.
import { Group, Mesh, Object3D, Quaternion, Vector3 } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { validatePackBytes } from './pack-contract';
import manifestUrl from '../../../generated/studio/manifest.json?url';
import partsUrl from '../../../generated/studio/parts.glb?url';
import type { StudioVariant } from '../../../lib/router';

export type Vec3 = [number, number, number];
export type Quat = [number, number, number, number];
export type Pose = { translationM: Vec3; rotationXYZW: Quat };
export type Display = 'PREVIEW_SOURCE_REVALIDATED' | 'PREVIEW_BLOCKED_RELATION' | 'REVIEW_REFUSED_CANDIDATE' | 'UNAVAILABLE';

export type Recipe = { instanceId: string; approachAxis: Vec3; approachDistanceM: number; stagedStart: Pose; segments: string[]; stagingOnly: boolean };
export type StudioCamera = { positionM: Vec3; targetM: Vec3; verticalFovDeg: number };
// preview plays as instruction; review opens a blocked or refused state without playing it; closed is not opened.
export type Mode = 'preview' | 'review' | 'closed';
// How a part figures in a step: placed (moves into its pose now), new (first appears, stays in the tray), uses
// (an earlier part this step works on, or supply cut from stock), tool.
export type PartUse = 'placed' | 'new' | 'uses' | 'tool';
export type Conflict = { instances: string[]; volumeMm3: number; reason?: string };
// The step's source intent, quoted from the repository record; never generated text.
export type Instruction = { record: string; id: string; parts: string; hardware: string; tools: string; orientation: string; connection: string; variant: string | null };
export type StepEntry = {
  printedNumber: number; stepId: string; title: string; sourcePanel: string; display: Display; mode: Mode; operable: boolean;
  assembly: { gate: string; status: string; admittedRows: number; requiredRows: number };
  introducedInstanceIds: string[]; introducedZeroSolidInstanceIds: string[]; newlyPlacedInstanceIds: string[];
  usedInstanceIds: string[]; toolInstanceIds: string[]; workpieceInstanceId: string | null;
  stepParts: { instanceId: string; use: PartUse }[]; focusInstanceIds: string[];
  instruction: Instruction; warnings: { id: string; severity: string; text: string }[];
  placements: Record<string, Pose>; candidatePlacements: boolean;
  recipes: Recipe[]; blockers: { id: string; connectionIds?: string[] }[]; conflicts: Conflict[]; carriedUnframedConnectionIds: string[];
  displayChecks: DisplayCheck[];
  dependencyWarnings: { printedNumber: number; display: Display; text: string }[]; limitations: string[]; approximationFlags: string[];
  claims: Record<string, string>; source: { kind: string; file?: string; sha256?: string; closureVerify?: string; closureRfc8785Sha256?: string; candidateRecord?: string };
  camera: StudioCamera | null;
};
export type Required = 'introduced' | 'used' | 'tool' | 'stock';
export type TrayState = 'current' | 'later' | 'spare' | 'tool';
export type TrayPose = Pose & { orientation: 'installed' | 'part-local'; firstStep: number | null; required: Required; group: string; state: TrayState };
// A flat floor tile for an instance with no trusted solid; half extents along runtime x and z.
export type TrayTile = { centreM: Vec3; halfExtentsM: [number, number]; firstStep: number | null; required: Required; group: string; state: TrayState };
export type TrayGroup = { id: string; label: string; instanceIds: string[]; boundsM: { min: Vec3; max: Vec3 }; labelM: Vec3 };
export type Inventory = { required: number; visible: number; modeled: number; tiles: number; canonical: number; notRequired: number; spares: number; later: number; tools: number; scope: string; canonicalSource: string };
export type VariantEntry = {
  graphHash: string; floorYM: number; centreM: Vec3;
  tray: { label: string; instances: Record<string, TrayPose>; tiles: Record<string, TrayTile>; groups: TrayGroup[]; inventory: Inventory; camera: StudioCamera };
  steps: StepEntry[];
};
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
export type InstanceEntry = { definitionId: string; name: string; recordName: string; role: string; disposition: string; supplyOrigin: string; componentClass: string; group: string; variants: StudioVariant[] };
export type SchematicEntry = InstanceEntry & { representation: string };
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
  definitions: Record<string, DefinitionEntry>; instances: Record<string, InstanceEntry>; schematic: Record<string, SchematicEntry>;
  variants: Record<StudioVariant, VariantEntry>;
};

// Name and registry entry of any tray slot: a drawn solid or a tile.
export const entryOf = (m: StudioManifest, id: string): InstanceEntry | SchematicEntry | undefined => m.instances[id] ?? m.schematic[id];

// Load phases as performance.now() marks: fetch both files, verify them against the pack contract, decode, build.
export type LoadTimings = { fetchStart: number; manifestFetched: number; glbFetched: number; verified: number; decoded: number; built: number; glbBytes: number };
export type LoadedPack = { manifest: StudioManifest; definitions: Map<string, Object3D>; timings: LoadTimings };

const fetchBytes = async (url: string): Promise<Uint8Array> => {
  const response = await fetch(url);
  if (!response.ok) throw Error(`Studio pack file ${url} could not be read (${response.status}).`);
  return new Uint8Array(await response.arrayBuffer());
};

const IDENTITY = new Quaternion(), UNIT = new Vector3(1, 1, 1);

// Nothing is decoded or drawn until the bytes are the pack the manifest names (pack-contract.ts): manifest schema,
// canonical pack ID, GLB SHA-256 (never only its length) and one identity root per definition.
async function load(): Promise<LoadedPack> {
  const fetchStart = performance.now();
  const manifestBytes = await fetchBytes(manifestUrl);
  const manifestFetched = performance.now();
  const glbBytes = await fetchBytes(partsUrl);
  const glbFetched = performance.now();
  const { manifest: checked, problems } = await validatePackBytes(manifestBytes, glbBytes);
  if (!checked) throw Error(`The Studio pack failed its integrity check (${problems.join('; ')}). Rebuild it with studio.mjs pack.`);
  const manifest = checked as StudioManifest;
  const verified = performance.now();
  const gltf = await new GLTFLoader().parseAsync(glbBytes.buffer.slice(glbBytes.byteOffset, glbBytes.byteOffset + glbBytes.byteLength) as ArrayBuffer, '');
  const decoded = performance.now();
  const definitions = new Map<string, Object3D>();
  for (const node of [...gltf.scene.children]) { // copy: wrapping a Mesh re-parents it out of this array
    const id = node.userData?.picarStudio?.definitionId as string | undefined;
    if (!id || !manifest.definitions[id] || definitions.has(id)) throw Error(`Unidentified or repeated part node in the Studio pack: ${node.name}`);
    const atIdentity = node.position.lengthSq() === 0 && node.quaternion.equals(IDENTITY) && node.scale.equals(UNIT);
    if (!atIdentity) throw Error(`Studio pack part ${id} carries a root transform; poses come only from the manifest.`);
    const root = node instanceof Mesh ? new Group().add(node) : node;
    root.traverse((o) => { if (o instanceof Mesh) { o.castShadow = true; o.receiveShadow = true; } });
    definitions.set(id, root);
  }
  for (const id of Object.keys(manifest.definitions)) if (!definitions.has(id)) throw Error(`Studio pack is missing the geometry for ${id}`);
  return { manifest, definitions, timings: { fetchStart, manifestFetched, glbFetched, verified, decoded, built: performance.now(), glbBytes: glbBytes.byteLength } };
}

let pending: Promise<LoadedPack> | null = null;
export const loadPack = (): Promise<LoadedPack> => (pending ??= load());
export const resetPackForRetry = (): void => { pending = null; };
