// The Studio pack contract, shared by the producer (digital-twin/tools/studio/studio.mjs, run by Node) and the
// runtime loader (pack.ts). One definition of the canonical pack-ID preimage and of the structural rules, so the
// two sides cannot drift. SHA-256 comes from Web Crypto, which Node and the app's secure context both provide.
import canonicalize from 'canonicalize';

export const PACK_CONTRACT = 'picar-studio-pack/2';
export const PARTS_CONTRACT = 'picar-studio-parts/1';
export const PACK_ID_DOMAIN = 'picar-studio:pack\n';
export const RUNTIME_BASIS = 'RH-YUP-ZFORWARD';
export const RUNTIME_UNIT = 'm';
export const VARIANTS = ['rpi5', 'rpi-zero-2-w'] as const;
export const DISPLAYS = ['PREVIEW_SOURCE_REVALIDATED', 'PREVIEW_BLOCKED_RELATION', 'REVIEW_REFUSED_CANDIDATE', 'UNAVAILABLE'] as const;
const STEPS = 9;

// The pack ID is the SHA-256 of a domain tag followed by the RFC 8785 canonical manifest without its packId.
export function packIdPreimage(manifest: Record<string, unknown>): Uint8Array {
  const rest: Record<string, unknown> = { ...manifest };
  delete rest.packId;
  const text = canonicalize(rest);
  if (text === undefined) throw Error('PACK_MANIFEST_NOT_CANONICAL');
  return new TextEncoder().encode(PACK_ID_DOMAIN + text);
}

export async function sha256Hex(bytes: Uint8Array): Promise<string> {
  const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', bytes as Uint8Array<ArrayBuffer>));
  return Array.from(digest, (b) => b.toString(16).padStart(2, '0')).join('');
}

type Json = Record<string, any>;
const isObject = (v: unknown): v is Json => typeof v === 'object' && v !== null && !Array.isArray(v);
const finite = (v: unknown): boolean => typeof v === 'number' && Number.isFinite(v);
const vec = (v: unknown, n: number): boolean => Array.isArray(v) && v.length === n && v.every(finite);
const hex64 = (v: unknown): boolean => typeof v === 'string' && /^[0-9a-f]{64}$/.test(v);
const unitQuaternion = (q: unknown): boolean => vec(q, 4) && Math.abs(Math.hypot(...(q as number[])) - 1) < 1e-6;
const pose = (p: unknown): boolean => isObject(p) && vec(p.translationM, 3) && unitQuaternion(p.rotationXYZW);
const camera = (c: unknown): boolean => isObject(c) && vec(c.positionM, 3) && vec(c.targetM, 3) && finite(c.verticalFovDeg);

// Everything the runtime relies on, checked before any geometry is built. Problems name the field that failed.
export function manifestProblems(m: unknown): string[] {
  const out: string[] = [];
  const need = (ok: boolean, code: string): boolean => { if (!ok) out.push(code); return ok; };
  if (!need(isObject(m), 'MANIFEST_NOT_OBJECT') || !isObject(m)) return out;
  need(m.contract === PACK_CONTRACT, `MANIFEST_CONTRACT ${String(m.contract)}`);
  need(hex64(m.packId), 'MANIFEST_PACK_ID_FORMAT');
  need(m.basis === RUNTIME_BASIS, `MANIFEST_BASIS ${String(m.basis)}`);
  need(m.unit === RUNTIME_UNIT, `MANIFEST_UNIT ${String(m.unit)}`);
  const c = m.classification;
  need(isObject(c) && c.capability === 'provisionalReview' && c.engineeringAdmission === false && c.runtimeAdmission === false && c.instructionGeometry === false,
    'MANIFEST_CLASSIFICATION');
  const parts = m.assets?.parts;
  need(isObject(parts) && parts.path === 'parts.glb' && hex64(parts.sha256) && Number.isSafeInteger(parts.bytes) && parts.bytes > 0, 'MANIFEST_GLB_ASSET');
  need(isObject(m.source?.m7Gate?.coverage) && finite(m.source.m7Gate.coverage.complete) && finite(m.source.m7Gate.coverage.required)
    && typeof m.source?.chain?.label === 'string', 'MANIFEST_SOURCE');
  need(isObject(m.timing) && ['bringInS', 'approachS', 'staggerS'].every((k) => finite(m.timing[k]) && m.timing[k] >= 0), 'MANIFEST_TIMING');
  const light = m.lighting;
  need(isObject(light) && vec(light.runtimeEnvironmentBase, 3) && typeof light.pool?.css === 'string' && Array.isArray(light.lights)
    && light.lights.some((l: Json) => l.id === 'key')
    && light.lights.every((l: Json) => typeof l.id === 'string' && finite(l.azimuthDeg) && finite(l.elevationDeg) && finite(l.distanceM)
      && vec(l.sizeM, 2) && vec(l.color, 3) && finite(l.runtimeIntensity)), 'MANIFEST_LIGHTING');
  if (!need(isObject(m.materials), 'MANIFEST_MATERIALS')) return out;
  for (const [id, mat] of Object.entries<Json>(m.materials)) {
    need(isObject(mat) && vec(mat.baseColor, 3) && finite(mat.metallic) && finite(mat.roughness), `MANIFEST_MATERIAL ${id}`);
  }
  if (!need(isObject(m.definitions) && Object.keys(m.definitions).length > 0, 'MANIFEST_DEFINITIONS')) return out;
  for (const [id, d] of Object.entries<Json>(m.definitions)) {
    need(isObject(d) && typeof d.name === 'string' && d.node === id && isObject(d.artifact) && hex64(d.artifact.sha256)
      && isObject(d.boundsM) && vec(d.boundsM.min, 3) && vec(d.boundsM.max, 3)
      && Array.isArray(d.solids) && d.solids.length > 0 && d.solids.every((s: Json) => typeof s.materialId === 'string' && s.materialId in m.materials),
    `MANIFEST_DEFINITION ${id}`);
  }
  if (!need(isObject(m.instances), 'MANIFEST_INSTANCES')) return out;
  for (const [id, i] of Object.entries<Json>(m.instances)) {
    need(isObject(i) && typeof i.definitionId === 'string' && i.definitionId in m.definitions && Array.isArray(i.variants)
      && i.variants.every((v: string) => (VARIANTS as readonly string[]).includes(v)), `MANIFEST_INSTANCE ${id}`);
  }
  if (!need(isObject(m.variants) && VARIANTS.every((v) => isObject(m.variants[v])), 'MANIFEST_VARIANTS')) return out;
  for (const v of VARIANTS) {
    const entry = m.variants[v];
    const tray: Json = entry.tray?.instances;
    if (!need(finite(entry.floorYM) && isObject(tray) && camera(entry.tray?.camera), `MANIFEST_TRAY ${v}`)) continue;
    for (const [id, p] of Object.entries<Json>(tray)) need(id in m.instances && pose(p), `MANIFEST_TRAY_POSE ${v} ${id}`);
    if (!need(Array.isArray(entry.steps) && entry.steps.length === STEPS, `MANIFEST_STEPS ${v}`)) continue;
    entry.steps.forEach((s: Json, i: number) => {
      const at = `${v} S${String(i + 1).padStart(2, '0')}`;
      if (!need(isObject(s) && s.printedNumber === i + 1 && (DISPLAYS as readonly string[]).includes(s.display) && typeof s.operable === 'boolean', `MANIFEST_STEP ${at}`)) return;
      // Readiness the runtime relies on: only a closure the verifier passed, at its verified hash, is instruction.
      need(!s.operable || (s.display === 'PREVIEW_SOURCE_REVALIDATED' && s.source?.kind === 'closure' && s.source?.closureVerify === 'PASS'
        && hex64(s.source?.closureRfc8785Sha256) && s.candidatePlacements === false), `MANIFEST_OPERABLE_NOT_READY ${at}`);
      need(s.candidatePlacements !== true || s.display === 'REVIEW_REFUSED_CANDIDATE', `MANIFEST_CANDIDATE_DISPLAY ${at}`);
      need(isObject(s.placements) && Object.entries<Json>(s.placements).every(([id, p]) => id in tray && pose(p)), `MANIFEST_PLACEMENTS ${at}`);
      need(Array.isArray(s.recipes) && s.recipes.every((r: Json) => r.instanceId in (s.placements ?? {}) && vec(r.approachAxis, 3)
        && finite(r.approachDistanceM) && pose(r.stagedStart)), `MANIFEST_RECIPES ${at}`);
      need(Array.isArray(s.displayChecks) && s.displayChecks.every((d: Json) => d.definitionId in m.definitions
        && (d.status === 'CHECKED' || d.status === 'NOT_CHECKED') && Array.isArray(d.overlaps)), `MANIFEST_DISPLAY_CHECKS ${at}`);
      need(s.camera === null || camera(s.camera), `MANIFEST_CAMERA ${at}`);
      need(isObject(s.assembly) && typeof s.assembly.status === 'string', `MANIFEST_ASSEMBLY ${at}`);
    });
  }
  return out;
}

export type GltfNode = { name?: string; mesh?: number; children?: number[]; matrix?: number[]; translation?: number[]; rotation?: number[]; scale?: number[]; extras?: Json };
export type GltfJson = Json & { nodes?: GltfNode[] };

// The JSON chunk of a binary glTF, after checking the container header and chunk layout.
export function glbJson(bytes: Uint8Array): GltfJson {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (bytes.byteLength < 28 || view.getUint32(0, true) !== 0x46546c67 || view.getUint32(4, true) !== 2 || view.getUint32(8, true) !== bytes.byteLength) throw Error('GLB_HEADER');
  const jsonLength = view.getUint32(12, true);
  if (view.getUint32(16, true) !== 0x4e4f534a || 20 + jsonLength + 8 > bytes.byteLength) throw Error('GLB_JSON_CHUNK');
  if (view.getUint32(24 + jsonLength, true) !== 0x004e4942) throw Error('GLB_BIN_CHUNK');
  return JSON.parse(new TextDecoder().decode(bytes.subarray(20, 20 + jsonLength))) as GltfJson;
}

// One root node per definition, named and identified by it, at identity, with no children, carrying exactly the
// manifest's solids as primitives with the manifest's materials; no images, animations, skins or cameras.
export function glbProblems(g: GltfJson, manifest: Json): string[] {
  const out: string[] = [];
  const extras = g.asset?.extras ?? {};
  if (g.asset?.version !== '2.0' || extras.contract !== PARTS_CONTRACT || extras.basis !== RUNTIME_BASIS || extras.unit !== RUNTIME_UNIT) out.push('GLB_ASSET');
  for (const key of ['images', 'textures', 'samplers', 'animations', 'skins', 'cameras', 'extensionsUsed', 'extensionsRequired']) if (g[key] !== undefined) out.push(`GLB_FORBIDDEN ${key}`);
  const nodes = g.nodes ?? [];
  const sceneNodes: number[] = g.scenes?.length === 1 && (g.scene ?? 0) === 0 ? g.scenes[0].nodes ?? [] : [];
  if (sceneNodes.length !== nodes.length || [...sceneNodes].sort((a, b) => a - b).some((n, i) => n !== i)) out.push('GLB_SCENE_ROOTS');
  const seen = new Set<string>();
  nodes.forEach((n, i) => {
    const id = n.name ?? `#${i}`;
    if (seen.has(id)) out.push(`GLB_DUPLICATE_DEFINITION ${id}`);
    seen.add(id);
    if (!(id in manifest.definitions)) { out.push(`GLB_UNEXPECTED_DEFINITION ${id}`); return; }
    if (n.extras?.picarStudio?.definitionId !== id) out.push(`GLB_NODE_IDENTITY ${id}`);
    if (n.matrix || n.translation || n.rotation || n.scale) out.push(`GLB_ROOT_TRANSFORM ${id}`);
    if (n.children?.length) out.push(`GLB_ROOT_CHILDREN ${id}`);
    const primitives: Json[] = (n.mesh !== undefined ? g.meshes?.[n.mesh]?.primitives : undefined) ?? [];
    const solids: Json[] = manifest.definitions[id].solids;
    const materialOf = (p: Json): unknown => g.materials?.[p.material]?.extras?.materialId;
    if (primitives.length !== solids.length || primitives.some((p, k) => materialOf(p) !== solids[k].materialId || p.extras?.materialId !== solids[k].materialId
      || (p.mode ?? 4) !== 4 || p.attributes?.POSITION === undefined || p.attributes?.NORMAL === undefined || p.indices === undefined)) out.push(`GLB_PRIMITIVES ${id}`);
  });
  for (const id of Object.keys(manifest.definitions)) if (!seen.has(id)) out.push(`GLB_MISSING_DEFINITION ${id}`);
  for (const mat of g.materials ?? []) if (!(mat.extras?.materialId in manifest.materials)) out.push(`GLB_MATERIAL ${String(mat.name)}`);
  return out;
}

// Every check that does not need a decoder, in order; a later check runs only when the earlier ones can be trusted.
export async function validatePackBytes(manifestBytes: Uint8Array, glbBytes: Uint8Array): Promise<{ manifest: Json | null; problems: string[] }> {
  let manifest: unknown;
  try { manifest = JSON.parse(new TextDecoder().decode(manifestBytes)); } catch { return { manifest: null, problems: ['MANIFEST_JSON'] }; }
  const problems = manifestProblems(manifest);
  if (problems.length) return { manifest: null, problems };
  const m = manifest as Json;
  if (await sha256Hex(packIdPreimage(m)) !== m.packId) problems.push('PACK_ID_MISMATCH');
  if (glbBytes.byteLength !== m.assets.parts.bytes || await sha256Hex(glbBytes) !== m.assets.parts.sha256) problems.push('GLB_HASH_MISMATCH');
  if (problems.length) return { manifest: null, problems };
  let gltf: GltfJson;
  try { gltf = glbJson(glbBytes); } catch (e) { return { manifest: null, problems: [e instanceof Error ? e.message : 'GLB_CONTAINER'] }; }
  problems.push(...glbProblems(gltf, m));
  return { manifest: problems.length ? null : m, problems };
}
