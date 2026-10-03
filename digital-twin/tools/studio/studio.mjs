#!/usr/bin/env node
// Assembly Studio pack pipeline (presentation track). Commands, ownership and limits:
// docs/digital-twin/ASSEMBLY_STUDIO_PIPELINE.md.
//
//   node digital-twin/tools/studio/studio.mjs chain --python <frozen-env-python> --label <label>
//   node digital-twin/tools/studio/studio.mjs tessellate --python <frozen-env-python> --chain <label> --label <label>
//   node digital-twin/tools/studio/studio.mjs pack --chain <label> --tessellation <label>
//   node digital-twin/tools/studio/studio.mjs blender [--blender <path>] [--render | --preview] [--reset-presentation] [--remove-unowned] [--check]
//   node digital-twin/tools/studio/studio.mjs check [--dir <pack dir>]
//
// `check` reports three separate things: PACK_INTEGRITY (the manifest and GLB form the frozen pack they claim to),
// SOURCE_FRESHNESS (the pack still matches the closures, verification, artifacts, tessellation, display checks and
// inputs on disk now) and the Blender presentation snapshot (presentation.mjs: CURRENT for this pack and configuration).
// Exit 0 when all three hold, 1 when integrity fails, 3 when an intact pack is not FRESH or its presentation not CURRENT.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { writeGlb } from './glb.mjs';
import { CAD_BASIS, RUNTIME_BASIS, C, SCALE, pointToRuntime, directionToRuntime, pointToCad, rotationToRuntime, rotationToCad,
  poseToRuntime, matrixFromQuaternion, isProperRotation } from './basis.mjs';
import { PACK_CONTRACT, PARTS_CONTRACT, packIdPreimage, manifestProblems, glbJson, glbProblems } from '../../../picarx-companion/src/features/assembly-3d/assets/pack-contract.ts';
import { REVISION_REGISTRY, closureReadiness, verifierIndex, tessellationProblems, displayCheckProblems, displayChecksFor, checkFreshness } from './sources.mjs';
import { checkPresentation } from './presentation.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const GEN = path.join(ROOT, 'digital-twin/generated/studio');
export const PACK_DIR = path.join(ROOT, 'picarx-companion/src/generated/studio');
const PRESENTATION = 'digital-twin/assemblies/v40/presentation';
const STAGE = `${PRESENTATION}/studio/stage.json`;
const MATERIALS = 'digital-twin/presentation/materials/studio-materials.json';
const GATE_REPORT = 'docs/implementation/M7_G_INSTRUCTIONAL_ASSEMBLY_REPORT.json';
const STEPS = 9;
const DISPLAY_DIR = 'digital-twin/validation/expected/m7/fidelity/display';
const M = 'twin_cad.assemblies.instructional';
// Records the tray and the instruction drawer are built from; each is a pack input, so editing one makes the pack STALE.
const PARTS = 'digital-twin/components/definitions/parts.json';
const STOCK = 'digital-twin/components/instances/planned-stock.json';
const USES = 'digital-twin/components/inventory/planned-uses.json';
const TOOLS = 'digital-twin/components/inventory/tools.json';
const INTENTS = 'digital-twin/assemblies/v40/steps/source-intents.json';
const CABLES = 'digital-twin/assemblies/v40/connections/cables.json';
const REGISTRY = 'digital-twin/validation/m2/runtime-registry.json';
const graphPath = (variant) => `digital-twin/validation/m2/${variant}/compiled-graph.json`;

const rel = (p) => path.relative(ROOT, p).split(path.sep).join('/');
const read = (p) => fs.readFileSync(path.isAbsolute(p) ? p : path.join(ROOT, p));
const json = (p) => JSON.parse(read(p));
const sha = (bytes) => crypto.createHash('sha256').update(bytes).digest('hex');
const pad = (n) => String(n).padStart(2, '0');
const fail = (code, detail = '') => { throw Error(code + (detail ? ' ' + detail : '')); };
const args = (argv) => Object.fromEntries(argv.flatMap((a, i) => (a.startsWith('--') ? [[a.slice(2), argv[i + 1]?.startsWith('--') || argv[i + 1] === undefined ? true : argv[i + 1]]] : [])));
const git = (...a) => spawnSync('git', a, { cwd: ROOT, encoding: 'utf8' }).stdout.trim();

// ---------------------------------------------------------------- chain (source-mode M7 dev loop, not a qualification)
function chainCommands(out) {
  const R = ROOT, j = (...p) => path.join(out, ...p);
  const steps = [
    ['generate', '--root', R, '--output', j('solutions')],
    ['verify', '--root', R, '--solutions', j('solutions'), '--output', j('observations.json')],
    ['remediate', '--root', R, '--solutions', j('solutions'), '--output', j('remediation')],
    ['correspondence', '--root', R, '--source-root', R, '--solutions', j('solutions'), '--artifacts', j('remediation'), '--output', j('correspondence.json')],
    ['anchor_generate', '--root', R, '--output', j('anchor/solutions')],
    ['anchor_verify', '--root', R, '--solutions', j('anchor/solutions'), '--output', j('anchor-observations.json')],
    ['anchor_boards', '--root', R, '--solutions', j('anchor/solutions'), '--artifacts', j('remediation'), '--output', j('anchor/boards')],
    ['anchor_correspondence', '--root', R, '--solutions', j('anchor/solutions'), '--artifacts', j('remediation'), '--boards', j('anchor/boards'), '--output', j('anchor-board-observations.json')],
    ['engagement', '--root', R, '--solutions', j('anchor/solutions'), '--artifacts', j('remediation'), '--boards', j('anchor/boards'), '--output', j('engagement')],
    ['engagement_verify', '--root', R, '--solutions', j('anchor/solutions'), '--artifacts', j('remediation'), '--boards', j('anchor/boards'), '--engagement', j('engagement'), '--output', j('engagement-observations.json')],
    ['usb', '--root', R, '--boards', j('anchor/boards'), '--artifacts', j('remediation'), '--output', j('usb')],
    ['usb_verify', '--root', R, '--usb', j('usb'), '--boards', j('anchor/boards'), '--artifacts', j('remediation'), '--output', j('usb-observations.json')],
    ['camera', '--root', R, '--boards', j('anchor/boards'), '--output', j('camera')],
    ['camera_verify', '--root', R, '--camera', j('camera'), '--boards', j('anchor/boards'), '--artifacts', j('remediation'), '--source-root', R, '--output', j('camera-observations.json')],
    ['chain', '--root', R, '--solutions', j('anchor/solutions'), '--boards', j('anchor/boards'), '--engagement', j('engagement'), '--artifacts', j('remediation'), '--usb', j('usb'), '--camera', j('camera'), '--output', j('chain')],
    ['hat_verify', '--root', R, '--closures', j('chain/closures'), '--hat', j('chain/steps'), '--engagement', j('engagement'), '--artifacts', j('remediation'), '--boards', j('anchor/boards'), '--output', j('hat-observations.json')],
    ...['05', '06', '07', '08', '09'].map((n) => [`step${n}_verify`, '--root', R, '--closures', j('chain/closures'), '--step', j('chain/steps'), '--output', j(`step${n}-observations.json`)]),
    ['closure_verify', '--root', R, '--closures', j('chain/closures'), '--solutions', j('anchor/solutions'), '--boards', j('anchor/boards'), '--engagement', j('engagement'),
      '--artifacts', j('remediation'), '--usb', j('usb'), '--camera', j('camera'), '--steps', j('chain/steps'), '--source-root', R, '--output', j('closure-observations.json')],
  ];
  return steps;
}

function runChain({ python, label }) {
  if (!python || !label) fail('USAGE', '--python <frozen env python> --label <label>');
  const out = path.join(GEN, 'chain', label);
  if (fs.existsSync(out)) fail('LABEL_EXISTS', rel(out));
  fs.mkdirSync(out, { recursive: true });
  const env = { ...process.env, PYTHONPATH: path.join(ROOT, 'digital-twin/cad') };
  const record = [];
  const registryBefore = sha(read(REVISION_REGISTRY));
  for (const [module, ...argv] of chainCommands(out)) {
    const started = Date.now();
    const r = spawnSync(python, ['-m', `${M}.${module}`, ...argv], { cwd: path.join(ROOT, 'digital-twin'), env, encoding: 'utf8', maxBuffer: 1 << 28 });
    fs.writeFileSync(path.join(out, `log-${module}.txt`), (r.stdout ?? '') + (r.stderr ?? ''));
    record.push({ module, argv: argv.map((a) => a.replace(ROOT, '<repo>')), exit: r.status, seconds: (Date.now() - started) / 1000 });
    console.log(`${module} exit ${r.status}`);
    if (r.status !== 0) { fs.writeFileSync(path.join(out, 'commands.json'), JSON.stringify(record, null, 1)); fail('CHAIN_STEP_FAILED', module); }
  }
  fs.writeFileSync(path.join(out, 'commands.json'), JSON.stringify({ mode: 'source-mode dev loop (PYTHONPATH=digital-twin/cad), not an M7 qualification', head: git('rev-parse', 'HEAD'), commands: record }, null, 1));
  // The registry selects every non-board artifact (verify.purchased_artifact); the run records the one it used.
  const registry = sha(read(REVISION_REGISTRY));
  if (registry !== registryBefore) fail('CHAIN_REGISTRY_CHANGED', 'the revision registry changed during the chain run');
  fs.writeFileSync(path.join(out, 'studio-chain.json'), JSON.stringify({ contract: 'picar-studio-chain/1', label, head: git('rev-parse', 'HEAD'),
    mode: 'source-mode dev loop, not an M7 qualification', revisionRegistry: { path: REVISION_REGISTRY, sha256: registry },
    closureObservationsSha256: sha(fs.readFileSync(path.join(out, 'closure-observations.json'))) }, null, 1));
}

// ---------------------------------------------------------------- tessellate
function studioDefinitions() {
  const kind = kindsByDefinition();
  const defs = new Set();
  for (const variant of activeVariants()) {
    const classes = Object.fromEntries(json(PARTS).map((d) => [d.id, d.componentClass]));
    for (const s of json(STOCK).filter((s) => s.variantIds.includes(variant))) {
      if (classes[s.definitionId] !== 'tool' && isSolidKind(kindOf(kind, s.definitionId))) defs.add(s.definitionId);
    }
  }
  return [...defs].sort();
}

function runTessellate({ python, chain, label }) {
  if (!python || !chain || !label) fail('USAGE', '--python <py> --chain <label> --label <label>');
  const out = path.join(GEN, 'tessellation', label);
  if (fs.existsSync(out)) fail('LABEL_EXISTS', rel(out));
  fs.mkdirSync(path.dirname(out), { recursive: true });
  const list = path.join(GEN, 'tessellation', `${label}.definitions.json`);
  fs.writeFileSync(list, JSON.stringify(studioDefinitions()));
  const displayMap = path.join(GEN, 'tessellation', `${label}.display.json`);
  fs.writeFileSync(displayMap, JSON.stringify(Object.fromEntries(Object.entries(displayRecords()).map(([id, d]) => [id, d.brep]))));
  const r = spawnSync(python, [path.join(ROOT, 'digital-twin/tools/studio/tessellate.py'), '--root', ROOT, '--chain', path.join(GEN, 'chain', chain), '--definitions', list, '--display', displayMap, '--output', out],
    { cwd: ROOT, env: { ...process.env, PYTHONPATH: path.join(ROOT, 'digital-twin/cad') }, encoding: 'utf8', maxBuffer: 1 << 28 });
  process.stdout.write(r.stdout ?? '');
  if (r.status !== 0) { process.stderr.write(r.stderr ?? ''); fail('TESSELLATION_FAILED'); }
}

// ---------------------------------------------------------------- pack
// Registered display-detail models (authored from official drawings; assembly checks keep the instructional artifact).
function displayRecords() {
  const dir = path.join(ROOT, DISPLAY_DIR);
  if (!fs.existsSync(dir)) return {};
  const out = {};
  for (const f of fs.readdirSync(dir).filter((n) => n.endsWith('.display.json')).sort()) {
    const recordPath = `${DISPLAY_DIR}/${f}`, record = json(recordPath), brep = `${DISPLAY_DIR}/${record.artifact}`;
    if (sha(read(brep)) !== record.artifactSha256) fail('DISPLAY_ARTIFACT_HASH', brep);
    for (const binding of record.sourceBindings ?? []) if (sha(read(binding.path)) !== binding.sha256) fail('DISPLAY_SOURCE_HASH', binding.path);
    out[record.definitionId] = { record, brep, recordPath, recordSha256: sha(read(recordPath)) };
  }
  return out;
}

const activeVariants = () => json(`${PRESENTATION}/instructional/product-scope.json`).activeProductVariants;
const KINDS = 'digital-twin/validation/expected/m5/instructional-parameters.json';
const kindsByDefinition = () => ({ ...Object.fromEntries(json(KINDS).definitions.map((d) => [d.definitionId, d.recipe])) });
const isSolidKind = (k) => k !== 'schematic' && k !== 'abstract';
const kindOf = (kinds, id) => kinds[id] ?? (id.includes('-PLATE-') ? 'plate' : fail('UNKNOWN_DEFINITION_KIND', id));

// Fidelity revision batches state their own label; it wins over the folder-based classification below.
function fidelityLabels() {
  const dir = path.join(ROOT, PRESENTATION, 'instructional');
  return Object.fromEntries(fs.readdirSync(dir).filter((n) => /^fidelity-revisions-\d+\.json$/.test(n)).sort()
    .flatMap((n) => { const batch = json(`${PRESENTATION}/instructional/${n}`); return batch.definitions.map((d) => [d.definitionId, batch.label]); }));
}

function approximationOf(artifactPath, label) {
  if (label && artifactPath.startsWith('digital-twin/validation/expected/m7/instructional-revisions/')) return label;
  if (artifactPath.startsWith('docs/implementation/evidence/m6/')) return 'M6 instructional plate: traced outline, non-engineering';
  if (artifactPath.startsWith('digital-twin/validation/expected/m7/instructional-revisions/')) return 'M7 additive instructional revision: photo-derived estimate, non-engineering';
  if (artifactPath.startsWith('chain:')) return 'M7 instructional board revision 2 generated by the chain: presentation estimate, non-engineering';
  if (artifactPath.startsWith('digital-twin/validation/expected/m5/')) return 'M5 instructional proxy: simplified presentation shape, non-engineering';
  return fail('UNCLASSIFIED_ARTIFACT', artifactPath);
}

function parseConflicts(reason) {
  const start = reason.indexOf('[');
  if (start < 0) return [];
  return JSON.parse(reason.slice(start).replace(/'/g, '"')).map((c) => ({ instances: c.instances, volumeMm3: c.volumeMm3, ...(c.reason ? { reason: c.reason } : {}) }));
}

function worldBounds(defBounds, R, t) {
  const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
  for (const x of [defBounds.min[0], defBounds.max[0]]) for (const y of [defBounds.min[1], defBounds.max[1]]) for (const z of [defBounds.min[2], defBounds.max[2]]) {
    for (let i = 0; i < 3; i++) {
      const v = R[i][0] * x + R[i][1] * y + R[i][2] * z + t[i];
      min[i] = Math.min(min[i], v); max[i] = Math.max(max[i], v);
    }
  }
  return { min, max };
}
const unionBounds = (list) => list.reduce((a, b) => ({ min: a.min.map((v, i) => Math.min(v, b.min[i])), max: a.max.map((v, i) => Math.max(v, b.max[i])) }),
  { min: [Infinity, Infinity, Infinity], max: [-Infinity, -Infinity, -Infinity] });

function cameraFor(spec, boundsCad, vfovDeg) {
  const center = boundsCad.min.map((v, i) => (v + boundsCad.max[i]) / 2);
  const radius = Math.hypot(...boundsCad.max.map((v, i) => v - boundsCad.min[i])) / 2;
  const az = (spec.azimuthDeg * Math.PI) / 180, el = (spec.elevationDeg * Math.PI) / 180;
  const dir = [Math.cos(el) * Math.cos(az), Math.cos(el) * Math.sin(az), Math.sin(el)];
  const distance = (radius * spec.fit) / Math.sin(((vfovDeg / 2) * Math.PI) / 180);
  return { targetM: pointToRuntime(center), positionM: pointToRuntime(center.map((v, i) => v + dir[i] * distance)), verticalFovDeg: vfovDeg, spec };
}

function buildPack({ chain, tessellation }) {
  if (!chain || !tessellation) fail('USAGE', '--chain <label> --tessellation <label>');
  const chainDir = path.join(GEN, 'chain', chain), tessDir = path.join(GEN, 'tessellation', tessellation);
  const stage = json(STAGE), materialLib = json(MATERIALS), gate = json(GATE_REPORT), kinds = kindsByDefinition();
  const names = Object.fromEntries(json('digital-twin/components/definitions/parts.json').map((d) => [d.id, d.name]));
  const checks = [];
  const check = (id, ok, detail) => { checks.push({ id, status: ok ? 'PASS' : 'FAIL', detail }); if (!ok) fail('PACK_CHECK_FAILED', `${id}: ${detail}`); };

  // Source binding (pipeline doc, "Snapshot, adoption and unresolved content"): the tessellation, the artifact
  // selection and every step closure must be the exact ones the verifier measured, before any readiness is derived.
  const index = JSON.parse(fs.readFileSync(path.join(tessDir, 'meshes.json')));
  const bin = fs.readFileSync(path.join(tessDir, 'meshes.bin'));
  const verifyBytes = fs.readFileSync(path.join(chainDir, 'closure-observations.json'));
  const verify = JSON.parse(verifyBytes), verdicts = verifierIndex(verify);
  const studioChainFile = path.join(chainDir, 'studio-chain.json');
  check('chain-record', fs.existsSync(studioChainFile), 'the chain run carries its Studio chain record (studio.mjs chain)');
  const studioChain = JSON.parse(fs.readFileSync(studioChainFile));
  const tessProblems = tessellationProblems({ index, bin, chainLabel: chain, chainDir, root: ROOT });
  check('tessellation-binding', tessProblems.length === 0, tessProblems.join('; ') || 'made from this chain run, its verification and artifact selection; every artifact and mesh matches its entry');
  const registrySha = sha(read(REVISION_REGISTRY));
  check('revision-registry', registrySha === studioChain.revisionRegistry.sha256, 'the revision registry is the one the chain run selected artifacts with');

  const graphs = Object.fromEntries(activeVariants().map((v) => [v, json(graphPath(v))]));
  const definitionOf = Object.fromEntries(Object.values(graphs).flatMap((g) => g.instances.map((i) => [i.id, i.definitionId])));
  const sources = {}, consumed = new Set();
  for (const variant of activeVariants()) for (let n = 1; n <= STEPS; n++) {
    const key = `${variant}-S${pad(n)}`;
    const closureFile = path.join(chainDir, 'chain/closures', `${key}-closure.json`), blockedFile = path.join(chainDir, 'chain/closures', `${key}-blocked.json`);
    if (fs.existsSync(closureFile)) {
      const bytes = fs.readFileSync(closureFile), closure = JSON.parse(bytes);
      const readiness = closureReadiness({ key, closure, verdict: verdicts.get(key) });
      check(`closure-binding:${key}`, readiness.problems.length === 0, readiness.problems.join('; ') || `canonical closure hash ${readiness.closureRfc8785Sha256} equals the verifier's`);
      sources[key] = { kind: 'closure', file: closureFile, bytes, closure, readiness };
      consumed.add(key);
    } else if (fs.existsSync(blockedFile)) {
      check(`refusal-listed:${key}`, verify.blocked.includes(path.basename(blockedFile)), 'the verifier lists this refused record');
      sources[key] = { kind: 'refused-closure', file: blockedFile, bytes: fs.readFileSync(blockedFile) };
    } else sources[key] = { kind: 'none' };
  }
  const orphaned = [...verdicts.keys()].filter((k) => !consumed.has(k));
  check('verified-closures-present', orphaned.length === 0, orphaned.length ? `verifier results with no closure file: ${orphaned.join(', ')}` : 'every verifier result has its closure file');

  // Definitions: convert vertices exactly once, assign material regions by solid index.
  const displays = displayRecords(), labels = fidelityLabels();
  const tessellatedArtifacts = Object.fromEntries(index.definitions.map((e) => [e.definitionId, e.artifactSha256]));
  const boundDisplays = {};
  const usedMaterials = new Set();
  const glbDefinitions = [], definitions = {}, cadBounds = {};
  for (const entry of index.definitions) {
    const kind = kindOf(kinds, entry.definitionId);
    const registered = displays[entry.definitionId];
    let withheld = null;
    if (entry.display) {
      check(`display:${entry.definitionId}`, registered && registered.record.artifactSha256 === entry.display.artifactSha256, 'tessellated display model matches its registered record');
      // A display model is drawn only while its checks name exactly this pack's artifacts and closure states;
      // otherwise the Studio draws the instructional artifact and says why (F4: fall back, never keep a stale check).
      const placing = Object.entries(sources).filter(([, s]) => s.kind === 'closure' && s.closure.placements.some((p) => definitionOf[p.instanceId] === entry.definitionId))
        .map(([, s]) => ({ variantId: s.closure.variantId, step: s.closure.printedNumber, closureRfc8785Sha256: s.readiness.closureRfc8785Sha256 }));
      const problems = displayCheckProblems(registered.record, { displaySha256: entry.display.artifactSha256, instructionalSha256: entry.artifactSha256, partArtifacts: tessellatedArtifacts, closures: placing });
      checks.push({ id: `display-binding:${entry.definitionId}`, status: problems.length ? 'WITHHELD' : 'PASS',
        detail: problems.length ? problems.join('; ') : `checked against ${placing.length} closures, the instructional artifact and every other placed part` });
      if (problems.length) {
        console.error(`[studio] detailed model for ${entry.definitionId} withheld: ${problems.join('; ')}`);
        withheld = { label: 'Detailed presentation model withheld: its checks do not describe this pack\'s artifacts and closures, so the instructional shape is drawn',
          artifact: { path: entry.display.artifactPath, sha256: entry.display.artifactSha256 }, record: { path: registered.recordPath, sha256: registered.recordSha256 }, problems };
      } else boundDisplays[entry.definitionId] = registered;
    }
    const display = boundDisplays[entry.definitionId] ? entry.display : null;
    const shown = display ?? entry; // the meshes the Studio draws
    const regions = display ? registered.record.solids.map((s) => s.materialId)
      : materialLib.regions.byDefinition[entry.definitionId] ?? entry.solids.map(() => materialLib.regions.byKind[kind]);
    check(`regions:${entry.definitionId}`, regions.length === shown.solids.length && regions.every((m) => materialLib.materials[m]), `${regions.length} regions for ${shown.solids.length} solids`);
    const view = (r, Type) => new Type(bin.buffer.slice(bin.byteOffset + r.byteOffset, bin.byteOffset + r.byteOffset + r.byteLength));
    const solids = shown.solids.map((s, i) => {
      const p = view(s.positions, Float64Array), n = view(s.normals, Float64Array);
      const positions = new Float32Array(p.length), normals = new Float32Array(n.length);
      for (let k = 0; k < p.length; k += 3) {
        const q = pointToRuntime([p[k], p[k + 1], p[k + 2]]), d = directionToRuntime([n[k], n[k + 1], n[k + 2]]);
        const len = Math.hypot(...d) || 1;
        positions.set(q, k); normals.set(d.map((v) => v / len), k);
      }
      usedMaterials.add(regions[i]);
      return { index: s.index, positions, normals, indices: view(s.indices, Uint32Array), materialId: regions[i] };
    });
    cadBounds[entry.definitionId] = shown.boundsMm;
    const rtMin = pointToRuntime(shown.boundsMm.min), rtMax = pointToRuntime(shown.boundsMm.max);
    definitions[entry.definitionId] = {
      name: names[entry.definitionId] ?? entry.definitionId, kind, node: entry.definitionId,
      artifact: { path: entry.artifactPath, sha256: entry.artifactSha256, bytes: entry.artifactBytes }, meshSha256: entry.meshSha256,
      approximation: approximationOf(entry.artifactPath, labels[entry.definitionId]),
      boundsM: { min: rtMin.map((v, i) => Math.min(v, rtMax[i])), max: rtMin.map((v, i) => Math.max(v, rtMax[i])) },
      solids: shown.solids.map((s, i) => ({ index: s.index, materialId: regions[i], triangles: s.triangleCount, volumeMm3: s.volumeMm3,
        ...(display ? { name: registered.record.solids[i].name } : {}) })),
      ...(display ? { display: {
        label: 'Detailed presentation model; assembly checks use the instructional artifact',
        source: registered.record.source, artifact: { path: display.artifactPath, sha256: display.artifactSha256 }, meshSha256: display.meshSha256,
        record: { path: registered.recordPath, sha256: registered.recordSha256, schema: registered.record.schema },
        relation: registered.record.relation, overlapsChain: registered.record.overlaps.chain,
        ...(registered.record.vendorCrossCheck ? { vendorCrossCheck: registered.record.vendorCrossCheck } : {}),
      } } : {}),
      ...(withheld ? { displayWithheld: withheld } : {}),
    };
    glbDefinitions.push({ id: entry.definitionId, solids, extras: { picarStudio: { definitionId: entry.definitionId, artifactSha256: entry.artifactSha256, kind } } });
  }

  // Float32 round trip of every definition's vertices back to CAD bounds.
  for (const g of glbDefinitions) {
    const b = unionBounds(g.solids.map((s) => {
      const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
      for (let k = 0; k < s.positions.length; k += 3) { const c = pointToCad([s.positions[k], s.positions[k + 1], s.positions[k + 2]]); for (let i = 0; i < 3; i++) { min[i] = Math.min(min[i], c[i]); max[i] = Math.max(max[i], c[i]); } }
      return { min, max };
    }));
    const err = Math.max(...b.min.map((v, i) => Math.abs(v - cadBounds[g.id].min[i])), ...b.max.map((v, i) => Math.abs(v - cadBounds[g.id].max[i])));
    check(`bounds:${g.id}`, err < 1e-3, `max CAD bound error after float32 conversion ${err.toExponential(2)} mm`);
  }

  const materialsUsed = [...usedMaterials].sort().map((id) => ({ id, ...materialLib.materials[id] }));
  const glb = writeGlb({
    asset: { version: '2.0', generator: 'picar-studio digital-twin/tools/studio/studio.mjs', extras: { contract: PARTS_CONTRACT, basis: RUNTIME_BASIS, unit: 'm', track: 'presentation-only' } },
    materials: materialsUsed, definitions: glbDefinitions,
  });

  // Variants, steps, tray and cameras.
  const instances = {}, schematic = {};
  const variants = {};
  const vfov = stage.camera.verticalFovDeg;
  const classOf = Object.fromEntries(json(PARTS).map((d) => [d.id, d.componentClass]));
  const stock = json(STOCK), toolRecords = json(TOOLS), intents = json(INTENTS), connections = json(CABLES), warningText = Object.fromEntries(json(REGISTRY).warnings.map((w) => [w.id, w]));
  const T = stage.tray;
  const groupOf = (definitionId) => T.groups.find((g) => g.classes.includes(classOf[definitionId]))?.id ?? fail('TRAY_GROUP', `${definitionId} (${classOf[definitionId]})`);
  // A part has a drawn solid when its instructional recipe is a solid kind; tools have no instructional definition.
  const isSolid = (definitionId) => classOf[definitionId] !== 'tool' && isSolidKind(kindOf(kinds, definitionId));
  // Tool requirements name a category; the kit's tool instances of that category satisfy it. Which depicted
  // screwdriver a step needs is unresolved (Q-06, Q-13), so every matching kit tool is listed.
  const toolCategory = Object.fromEntries(toolRecords.map((t) => [t.id, t.category]));
  const toolInstances = (requirementId, variant) => stock.filter((s) => s.variantIds.includes(variant) && classOf[s.definitionId] === 'tool'
    && names[s.definitionId].toLowerCase().includes(toolCategory[requirementId] ?? fail('TOOL_CATEGORY', requirementId))).map((s) => s.id);
  const runtimeBounds = (b) => { const a = pointToRuntime(b.min), c = pointToRuntime(b.max); return { min: a.map((v, i) => Math.min(v, c[i])), max: a.map((v, i) => Math.max(v, c[i])) }; };
  const finite = (b) => Number.isFinite(b.min[0]);
  for (const variant of activeVariants()) {
    const graph = graphs[variant];
    const inst = Object.fromEntries(graph.instances.map((i) => [i.id, i]));
    const steps = [];
    let previous = null;
    const installedRotation = {};
    // Every instance S01-S09 introduce or use, and the kit tools their tool requirements name: the tray's scope.
    const required = new Map();
    for (let n = 1; n <= graph.steps.length; n++) {
      const step = graph.steps[n - 1];
      for (const id of step.introducedInstanceIds) if (!required.has(id)) required.set(id, { firstStep: n, how: 'introduced' });
      for (const id of step.usedInstanceIds) if (!required.has(id)) required.set(id, { firstStep: n, how: 'used' });
      for (const req of step.toolRequirementIds) for (const id of toolInstances(req, variant)) if (!required.has(id)) required.set(id, { firstStep: n, how: 'tool' });
    }
    const canonical = stock.filter((s) => s.variantIds.includes(variant));
    const stockOf = Object.fromEntries(canonical.map((s) => [s.id, s]));
    const frontierCount = [...required].filter(([, use]) => use.firstStep <= STEPS).length;
    for (const s of canonical) if (!required.has(s.id)) required.set(s.id, { firstStep: null, how: 'stock' });
    check(`canonical-scope:${variant}`, [...required.keys()].every((id) => stockOf[id] && inst[id]?.definitionId === stockOf[id].definitionId), 'all graph/tool and full-stock identities reconcile');
    const stateOf = (id) => stockOf[id].disposition === 'tool' ? 'tool' : stockOf[id].disposition === 'backup' ? 'spare'
      : required.get(id).firstStep !== null && required.get(id).firstStep <= STEPS ? 'current' : 'later';
    for (const id of required.keys()) if (isSolid(inst[id].definitionId)) check(`tray-geometry:${variant}:${id}`, Boolean(cadBounds[inst[id].definitionId]), 'a required solid has tessellated geometry');
    for (let n = 1; n <= STEPS; n++) {
      const step = graph.steps[n - 1];
      const key = `${variant}-S${pad(n)}`;
      const src = sources[key];
      const introducedSolid = step.introducedInstanceIds.filter((id) => isSolid(inst[id].definitionId));
      let entry;
      if (src.kind === 'closure') {
        const c = src.closure, r = src.readiness;
        check(`proper-rotations:${key}`, c.placements.every((p) => isProperRotation(p.rotation)), 'every closure rotation is proper (det +1, orthonormal)');
        for (const p of c.placements) installedRotation[p.instanceId] ??= p.rotation;
        entry = {
          source: { kind: 'closure', file: `chain/closures/${path.basename(src.file)}`, sha256: sha(src.bytes), status: c.status,
            closureRfc8785Sha256: r.closureRfc8785Sha256, closureVerify: r.verdict },
          display: r.display, placements: c.placements, recipes: c.recipes, blockers: c.blockers, conflicts: [], carriedUnframedConnectionIds: c.carriedUnframedConnectionIds,
          zeroSolidInstanceIds: c.zeroSolidInstanceIds, limitations: c.sourceLimitations, approximationFlags: c.approximationFlags, claims: c.claims,
        };
        previous = c;
      } else if (src.kind === 'refused-closure') {
        const b = JSON.parse(src.bytes);
        const recordFile = path.join(chainDir, 'chain/steps', `${key}-record.json`);
        const record = fs.existsSync(recordFile) ? JSON.parse(fs.readFileSync(recordFile)) : null;
        const candidate = record && previous ? [...previous.placements.filter((p) => !record.placements.some((r) => r.instanceId === p.instanceId)),
          ...record.placements.map(({ instanceId, translationMm, rotation, featureRef, role }) => ({ instanceId, translationMm, rotation, featureRef, role }))] : [];
        entry = {
          source: { kind: 'refused-closure', file: `chain/closures/${path.basename(src.file)}`, sha256: sha(src.bytes), verifierListed: true, stage: b.stage, reason: String(b.reason).split(' ')[0],
            ...(record ? { candidateRecord: `chain/steps/${path.basename(recordFile)}`, candidateSha256: sha(fs.readFileSync(recordFile)) } : {}) },
          display: candidate.length ? 'REVIEW_REFUSED_CANDIDATE' : 'UNAVAILABLE', placements: candidate, candidate: true, recipes: record?.recipes ?? [],
          blockers: [{ id: String(b.reason).split(' ')[0] }], conflicts: parseConflicts(String(b.reason)), carriedUnframedConnectionIds: previous?.carriedUnframedConnectionIds ?? [],
          zeroSolidInstanceIds: previous?.zeroSolidInstanceIds ?? [], limitations: [...(previous?.sourceLimitations ?? []), ...(record?.limitations ?? [])], approximationFlags: previous?.approximationFlags ?? [],
          claims: { staticPlacement: 'REFUSED', installationSweep: 'NOT_CLAIMED', collisionFreeInstallPath: 'NOT_CLAIMED', physicalFit: 'NOT_CLAIMED' },
        };
        previous = null;
      } else {
        entry = { source: { kind: 'none' }, display: 'UNAVAILABLE', placements: [], recipes: [], blockers: [], conflicts: [], carriedUnframedConnectionIds: [], zeroSolidInstanceIds: [], limitations: [], approximationFlags: [], claims: {} };
        previous = null;
      }
      const placementsRt = Object.fromEntries(entry.placements.map((p) => [p.instanceId, poseToRuntime(p)]));
      const bounds = unionBounds(entry.placements.map((p) => worldBounds(cadBounds[inst[p.instanceId].definitionId], p.rotation, p.translationMm)));
      const placementsCad = Object.fromEntries(entry.placements.map((p) => [p.instanceId, p]));
      const before = steps[n - 2]?._placementsCad ?? {};
      const newlyPlaced = entry.placements.map((p) => p.instanceId).filter((id) => !before[id]);
      // Preview plays as instruction; review opens without playing (an unresolved relation, a refused candidate).
      const mode = !stage.operableSteps.includes(n) || entry.display === 'UNAVAILABLE' ? 'closed' : entry.display === 'PREVIEW_SOURCE_REVALIDATED' ? 'preview' : 'review';
      const stepParts = [];
      const addPart = (id, use) => { if (!stepParts.some((p) => p.instanceId === id)) stepParts.push({ instanceId: id, use }); };
      for (const id of newlyPlaced) addPart(id, 'placed');
      for (const id of step.introducedInstanceIds) addPart(id, 'new');
      for (const id of step.usedInstanceIds) addPart(id, 'uses');
      for (const req of step.toolRequirementIds) for (const id of toolInstances(req, variant)) addPart(id, 'tool');
      const intent = intents.find((x) => x.printedNumber === n) ?? fail('SOURCE_INTENT', key);
      // Review steps name the parts their blocker is about: an unresolved connection's two ends, or the refused conflicts.
      const focusInstanceIds = [...new Set([
        ...entry.blockers.flatMap((b) => (b.connectionIds ?? []).flatMap((c) => { const r = connections.find((x) => x.id === c) ?? fail('CONNECTION', c); return [r.cableInstanceId, r.targetInstanceId]; })),
        ...entry.conflicts.flatMap((c) => c.instances)])];
      if (mode === 'preview') {
        const noRecipe = newlyPlaced.filter((id) => !entry.recipes.some((r) => r.instanceId === id));
        check(`preview-recipes:${key}`, noRecipe.length <= 1, `every part this step places has an M7 recipe except the workpiece it attaches to (${noRecipe.join(', ') || 'none'})`);
        const moved = Object.entries(before).filter(([id, a]) => { const b = placementsCad[id];
          return !b || a.translationMm.some((v, i) => Math.abs(v - b.translationMm[i]) > 1e-9) || a.rotation.flat().some((v, i) => Math.abs(v - b.rotation.flat()[i]) > 1e-12); }).map(([id]) => id);
        check(`preview-holds:${key}`, moved.length === 0, moved.length ? `earlier parts change pose, which the recipes do not represent: ${moved.join(', ')}` : 'every earlier part keeps its closure pose');
        check(`preview-represented:${key}`, stepParts.every((p) => required.has(p.instanceId)), 'every part this step names is in the tray scope');
      }
      steps.push({
        printedNumber: n, stepId: step.id, title: step.title, sourcePanel: step.sourcePanel,
        display: entry.display, assembly: { gate: gate.gate, status: gate.status, admittedRows: gate.currentProductDeliveryCoverage.complete, requiredRows: gate.currentProductDeliveryCoverage.required },
        mode, operable: mode === 'preview',
        introducedInstanceIds: introducedSolid, introducedZeroSolidInstanceIds: step.introducedInstanceIds.filter((id) => !introducedSolid.includes(id)),
        usedInstanceIds: step.usedInstanceIds, toolInstanceIds: [...new Set(step.toolRequirementIds.flatMap((req) => toolInstances(req, variant)))],
        workpieceInstanceId: entry.placements.find((p) => newlyPlaced.includes(p.instanceId) && p.role === 'workpiece')?.instanceId ?? null,
        newlyPlacedInstanceIds: newlyPlaced, stepParts, focusInstanceIds,
        instruction: { record: INTENTS, id: intent.id, parts: intent.introducedParts, hardware: intent.introducedHardware, tools: intent.tools,
          orientation: intent.orientation, connection: intent.connectionIntent, variant: intent.variantDetails?.[variant] ?? null },
        warnings: step.warningIds.map((id) => warningText[id]).filter(Boolean).map(({ id, severity, text }) => ({ id, severity, text })),
        placements: placementsRt, candidatePlacements: entry.candidate === true,
        // Bound display models placed in this state: CHECKED against this exact closure, or NOT_CHECKED (a refused
        // candidate state the record never measured), so an empty overlap list always means "checked, none found".
        displayChecks: Object.values(boundDisplays).filter(({ record }) => Object.keys(placementsRt).some((id) => inst[id].definitionId === record.definitionId))
          .map(({ record }) => displayChecksFor(record, { variantId: variant, step: n, closureRfc8785Sha256: entry.source.closureRfc8785Sha256 ?? null })),
        recipes: entry.recipes.map((r) => ({ instanceId: r.instanceId, approachAxis: directionToRuntime(r.approachAxis), approachDistanceM: r.approachDistanceMm * SCALE,
          stagedStart: poseToRuntime(r.stagedStart), segments: r.segments, anchor: r.anchor, stagingOnly: r.stagingOnly === true })),
        blockers: entry.blockers, conflicts: entry.conflicts, carriedUnframedConnectionIds: entry.carriedUnframedConnectionIds, zeroSolidInstanceIds: entry.zeroSolidInstanceIds,
        limitations: entry.limitations, approximationFlags: entry.approximationFlags, claims: entry.claims, source: entry.source,
        dependencyWarnings: [], _boundsCad: bounds, _placementsCad: placementsCad,
      });
    }
    for (const s of steps) s.dependencyWarnings = steps.filter((e) => e.printedNumber < s.printedNumber && e.display !== 'PREVIEW_SOURCE_REVALIDATED')
      .map((e) => ({ printedNumber: e.printedNumber, display: e.display, text: `S${pad(e.printedNumber)} is ${e.display === 'UNAVAILABLE' ? 'unavailable' : 'not revalidated'}; previewing S${pad(s.printedNumber)} does not certify S${pad(e.printedNumber)}` }));

    // Parts tray: every instance in the tray scope, in labelled bins beside the chassis (stage.json tray). A solid keeps
    // the orientation a closure verified for it, else its part-local one; an instance with no trusted solid (a cable,
    // tape stock, a tool) gets a flat tile, never invented geometry.
    const assembled = unionBounds(steps.map((s) => s._boundsCad).filter(finite));
    const floorZ = assembled.min[2];
    const order = (a, b) => inst[a].definitionId.localeCompare(inst[b].definitionId) || a.localeCompare(b);
    const footprint = (id) => {
      const definitionId = inst[id].definitionId;
      if (!isSolid(definitionId)) return { dx: T.tileMm[0], dy: T.tileMm[1], tile: true };
      const R = installedRotation[id] ?? [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
      const b = worldBounds(cadBounds[definitionId], R, [0, 0, 0]);
      return { dx: b.max[0] - b.min[0], dy: b.max[1] - b.min[1], dz: b.max[2] - b.min[2], b, R, verified: Boolean(installedRotation[id]) };
    };
    const tray = {}, tiles = {}, groups = [], boxOf = {};
    let shelfTop = assembled.min[1] - T.offsetMm;
    for (const shelf of T.shelves) {
      let cursorX = assembled.min[0], shelfDepth = 0;
      for (const gid of shelf) {
        const group = T.groups.find((g) => g.id === gid) ?? fail('TRAY_SHELF_GROUP', gid);
        const ids = [...required.keys()].filter((id) => groupOf(inst[id].definitionId) === gid).sort(order);
        if (!ids.length) continue;
        // Rows: one per definition where identical pieces must be countable, otherwise a flow wrapped at the group width.
        const rows = [];
        if (group.rowPerDefinition) for (const id of ids) {
          const f = footprint(id), pitch = Math.max(T.minPitchMm, f.dx) + T.gapMm;
          const row = rows.at(-1);
          if (row && inst[row[0]].definitionId === inst[id].definitionId && (row.length + 1) * pitch <= T.groupWidthMm) row.push(id);
          else rows.push([id]);
        }
        else {
          let row = [], width = 0;
          for (const id of ids) { const f = footprint(id); if (row.length && width + f.dx > T.groupWidthMm) { rows.push(row); row = []; width = 0; } row.push(id); width += f.dx + T.gapMm; }
          rows.push(row);
        }
        let rowTop = shelfTop, blockWidth = 0;
        for (const row of rows) {
          // Seen from the tray camera, a tall row rises over the row behind it; reserve that band so nothing is hidden.
          const feet = row.map(footprint), depth = Math.max(...feet.map((f) => f.dy));
          rowTop -= T.occlusion * Math.max(0, ...feet.map((f) => f.dz ?? 0));
          const centreY = rowTop - depth / 2;
          const pitch = group.rowPerDefinition ? Math.max(T.minPitchMm, ...feet.map((f) => f.dx)) + T.gapMm : null;
          let x = cursorX;
          row.forEach((id, k) => {
            const f = feet[k], left = pitch ? x + (pitch - T.gapMm - f.dx) / 2 : x;
            const common = { firstStep: required.get(id).firstStep, required: required.get(id).how, group: gid, state: stateOf(id) };
            if (f.tile) {
              boxOf[id] = { min: [left, centreY - f.dy / 2, floorZ], max: [left + f.dx, centreY + f.dy / 2, floorZ] };
              // Runtime half extents [x, z]: runtime x is CAD y, runtime z is CAD x.
              tiles[id] = { centreM: pointToRuntime([left + f.dx / 2, centreY, floorZ]), halfExtentsM: [(f.dy / 2) * SCALE, (f.dx / 2) * SCALE], ...common };
            } else {
              const t = [left - f.b.min[0], centreY - (f.b.min[1] + f.b.max[1]) / 2, floorZ - f.b.min[2]];
              boxOf[id] = worldBounds(cadBounds[inst[id].definitionId], f.R, t);
              tray[id] = { ...poseToRuntime({ translationMm: t, rotation: f.R }), orientation: f.verified ? 'installed' : 'part-local', ...common };
            }
            x += pitch ?? f.dx + T.gapMm;
          });
          blockWidth = Math.max(blockWidth, x - T.gapMm - cursorX);
          rowTop -= depth + T.gapMm;
        }
        // The label sits in a band along the group's near edge (away from the chassis), so no part of the group covers it.
        const blockBottom = rowTop + T.gapMm;
        groups.push({ id: gid, label: group.label, instanceIds: ids, boundsM: runtimeBounds(unionBounds(ids.map((id) => boxOf[id]))),
          labelM: pointToRuntime([cursorX, blockBottom - T.labelBandMm / 2, floorZ]) });
        shelfDepth = Math.max(shelfDepth, shelfTop - blockBottom + T.labelBandMm);
        cursorX += blockWidth + T.groupGapMm;
      }
      shelfTop -= shelfDepth + T.groupGapMm;
    }
    check(`tray-complete:${variant}`, [...required.keys()].every((id) => Boolean(tray[id]) !== Boolean(tiles[id])) && Object.keys(tray).length + Object.keys(tiles).length === required.size,
      `each of the ${required.size} instances in the tray scope has exactly one slot, a solid or a tile`);
    const trayBounds = unionBounds(Object.values(boxOf));
    const everything = unionBounds([assembled, trayBounds]);

    // Guided cameras (stage.json camera): each step names what it frames.
    const cameraSpec = (n) => ({ ...stage.camera.default, ...(stage.camera.steps[String(n)] ?? {}) });
    for (const s of steps) {
      const at = (id) => (s._placementsCad[id] ? worldBounds(cadBounds[inst[id].definitionId], s._placementsCad[id].rotation, s._placementsCad[id].translationMm) : boxOf[id]);
      const listed = s.stepParts.map((p) => p.instanceId);
      const subjects = {
        tray: trayBounds, everything, state: s._boundsCad,
        new: s.newlyPlacedInstanceIds.length ? unionBounds(s.newlyPlacedInstanceIds.map(at)) : s._boundsCad,
        parts: unionBounds(listed.filter((id) => classOf[inst[id].definitionId] !== 'tool').map(at)),
        'placed-parts': unionBounds(listed.filter((id) => s._placementsCad[id]).map(at)),
        'tray-parts': unionBounds(listed.filter((id) => !s._placementsCad[id] && classOf[inst[id].definitionId] !== 'tool').map(at)),
        focus: unionBounds(s.focusInstanceIds.map(at)),
      };
      const spec = cameraSpec(s.printedNumber), b = subjects[spec.subject] ?? fail('CAMERA_SUBJECT', `${variant} S${pad(s.printedNumber)} ${spec.subject}`);
      s.camera = finite(b) ? cameraFor(spec, b, vfov) : null;
      if (s.mode !== 'closed') check(`camera:${variant}-S${pad(s.printedNumber)}`, s.camera !== null, `an opened step has a guided camera (subject ${spec.subject})`);
      delete s._boundsCad; delete s._placementsCad;
    }

    for (const id of required.keys()) {
      const definitionId = inst[id].definitionId;
      const base = { definitionId, name: stage.displayNames[definitionId] ?? names[definitionId] ?? definitionId, recordName: names[definitionId] ?? definitionId,
        role: inst[id].role, disposition: stockOf[id].disposition, supplyOrigin: stockOf[id].supplyOrigin,
        componentClass: classOf[definitionId], group: groupOf(definitionId) };
      if (tray[id]) (instances[id] ??= { ...base, variants: [] }).variants.push(variant);
      else (schematic[id] ??= { ...base, representation: T.representations[classOf[definitionId]] ?? fail('TRAY_REPRESENTATION', classOf[definitionId]), variants: [] }).variants.push(variant);
    }
    const trayCamera = { tray: trayBounds, everything }[cameraSpec(0).subject] ?? fail('CAMERA_SUBJECT', `${variant} S00 ${cameraSpec(0).subject}`);
    variants[variant] = {
      graphHash: graph.graphHash, modelHash: graph.modelHash,
      floorYM: (floorZ - stage.lighting.floor.gapMm) * SCALE,
      centreM: pointToRuntime(everything.min.map((v, i) => (v + everything.max[i]) / 2)),
      tray: {
        label: 'Parts tray: presentation layout only, not a physical assembly state', instances: tray, tiles, groups,
        inventory: { required: frontierCount, visible: required.size, modeled: Object.keys(tray).length, tiles: Object.keys(tiles).length, canonical: canonical.length,
          notRequired: canonical.length - frontierCount, spares: canonical.filter((s) => s.disposition === 'backup').length,
          later: [...required.keys()].filter((id) => stateOf(id) === 'later').length, tools: canonical.filter((s) => s.disposition === 'tool').length,
          scope: 'Full canonical stock for this board, including later-use inventory, backups, accessories and tools', canonicalSource: `${STOCK}: printed-stock claims, including the user board; not a count of the owner's loose kit` },
        camera: cameraFor(cameraSpec(0), trayCamera, vfov),
      },
      steps,
    };

    // Endpoint and recipe consistency, and a representative mounting feature (S01 hardware on Plate A holes).
    for (const s of steps) for (const r of s.recipes) {
      const fin = s.placements[r.instanceId];
      const err = Math.max(...fin.translationM.map((v, i) => Math.abs(v - r.approachAxis[i] * r.approachDistanceM - r.stagedStart.translationM[i])));
      check(`recipe:${variant}-S${pad(s.printedNumber)}:${r.instanceId}`, err < 1e-12 && fin.rotationXYZW.every((q, i) => Math.abs(q - r.stagedStart.rotationXYZW[i]) < 1e-12),
        `staged start = final - axis * distance (error ${err.toExponential(1)} m), same rotation`);
    }
    const s1 = JSON.parse(fs.readFileSync(path.join(chainDir, `chain/closures/${variant}-S01-closure.json`)));
    for (const p of s1.placements) {
      const back = rotationToCad(matrixFromQuaternion(steps[0].placements[p.instanceId].rotationXYZW));
      const rErr = Math.max(...back.flat().map((v, i) => Math.abs(v - p.rotation.flat()[i])));
      const tErr = Math.max(...pointToCad(steps[0].placements[p.instanceId].translationM).map((v, i) => Math.abs(v - p.translationMm[i])));
      check(`basis-roundtrip:${variant}:${p.instanceId}`, rErr < 1e-12 && tErr < 1e-9, `runtime pose converts back to the closure pose (rotation ${rErr.toExponential(1)}, translation ${tErr.toExponential(1)} mm)`);
    }
    const plate = s1.placements.find((p) => p.instanceId === 'PX-V40-INS-PLATE-A-001');
    const holes = index.definitions.find((d) => d.definitionId === 'PX-V40-DEF-PLATE-A').cylinderFeatures.filter((f) => f.radiusMm < 2);
    const axisWorld = holes.map((h) => ({ o: plate.rotation.map((row, i) => row.reduce((a, v, k) => a + v * h.originMm[k], plate.translationMm[i])), a: plate.rotation.map((row) => row.reduce((a, v, k) => a + v * h.axis[k], 0)) }));
    for (const p of s1.placements.filter((q) => /STANDOFF|SCREW/.test(q.instanceId))) {
      const d = Math.min(...axisWorld.map(({ o, a }) => { const v = p.translationMm.map((x, i) => x - o[i]); const along = v.reduce((s, x, i) => s + x * a[i], 0); return Math.hypot(...v.map((x, i) => x - along * a[i])); }));
      check(`mount-feature:${variant}:${p.instanceId}`, d < 0.01, `axis lies on a Plate A hole axis (${d.toExponential(2)} mm)`);
    }
  }

  const glbSha = sha(glb);
  const manifest = {
    contract: PACK_CONTRACT,
    classification: { capability: 'provisionalReview', label: 'Assembly Studio preview pack, not a G-GEOMETRY runtime pack', engineeringAdmission: false, runtimeAdmission: false, instructionGeometry: false },
    basis: RUNTIME_BASIS, unit: 'm',
    conversion: { from: `${CAD_BASIS} millimetres`, matrix: C, scale: SCALE, appliedIn: 'digital-twin/tools/studio/basis.mjs', poses: 'rotation C R C^T, translation 0.001 C t, quaternion [x,y,z,w]' },
    readinessKinds: {
      PREVIEW_SOURCE_REVALIDATED: 'closure produced by the source-mode chain and passed by the independent closure verifier at this exact canonical closure hash; not an M7 qualification',
      PREVIEW_BLOCKED_RELATION: 'placements verified, a required relationship unresolved; review mode',
      REVIEW_REFUSED_CANDIDATE: 'closure refused by the overlap check; the refused record\'s candidate placements are shown for review only',
      UNAVAILABLE: 'no source record; parts stay in the tray',
    },
    source: {
      repository: { head: git('rev-parse', 'HEAD'), branch: git('branch', '--show-current') },
      chain: { label: chain, mode: 'source-mode dev loop, not an M7 qualification', closureVerify: { status: verify.status, sha256: sha(verifyBytes) },
        studioChain: { sha256: sha(fs.readFileSync(studioChainFile)) } },
      tessellation: { label: tessellation, meshesSha256: sha(fs.readFileSync(path.join(tessDir, 'meshes.json'))), binSha256: index.binSha256, linearDeflectionMm: index.linearDeflectionMm, angularDeflectionRad: index.angularDeflectionRad },
      revisionRegistry: { path: REVISION_REGISTRY, sha256: registrySha },
      inputs: Object.fromEntries([STAGE, MATERIALS, GATE_REPORT, `${PRESENTATION}/instructional/product-scope.json`, KINDS, PARTS, STOCK, USES, TOOLS, INTENTS, CABLES, REGISTRY,
        ...Object.values(displays).flatMap(({ record }) => (record.sourceBindings ?? []).map((b) => b.path)),
        ...activeVariants().map(graphPath)].map((p) => [p, sha(read(p))])),
      m7Gate: { gate: gate.gate, status: gate.status, coverage: gate.currentProductDeliveryCoverage },
    },
    assets: { parts: { path: 'parts.glb', sha256: glbSha, bytes: glb.byteLength } },
    materials: Object.fromEntries(materialsUsed.map(({ id, ...m }) => [id, m])),
    lighting: stage.lighting,
    timing: stage.timing,
    definitions, instances, schematic, variants,
  };
  // The producer enforces the same contract the runtime loader enforces (pack-contract.ts) before writing anything.
  const contractProblems = [...manifestProblems({ ...manifest, packId: '0'.repeat(64) }), ...glbProblems(glbJson(glb), manifest)];
  check('contract', contractProblems.length === 0, contractProblems.join('; ') || `manifest and GLB satisfy ${PACK_CONTRACT}`);
  manifest.validation = { checks: checks.length, failed: 0, withheld: checks.filter((c) => c.status === 'WITHHELD').map((c) => c.id), summary: [...new Set(checks.map((c) => c.id.split(':')[0]))] };
  const packId = sha(packIdPreimage(manifest));
  fs.mkdirSync(PACK_DIR, { recursive: true });
  fs.writeFileSync(path.join(PACK_DIR, 'parts.glb'), glb);
  fs.writeFileSync(path.join(PACK_DIR, 'manifest.json'), JSON.stringify({ packId, ...manifest }, null, 1) + '\n');
  fs.writeFileSync(path.join(GEN, `pack-checks-${packId.slice(0, 12)}.json`), JSON.stringify(checks, null, 1));
  console.log(JSON.stringify({ packId, glbBytes: glb.byteLength, glbSha256: glbSha, checks: checks.length, definitions: Object.keys(definitions).length, instances: Object.keys(instances).length }));
}

// ---------------------------------------------------------------- check
// PACK_INTEGRITY: the manifest and GLB form the frozen pack they claim to (also used by the companion tests). A pack
// from an earlier contract is checked as a frozen pair only; the runtime loads only the current contract.
export function checkPack(dir = PACK_DIR) {
  let manifest;
  try { manifest = JSON.parse(fs.readFileSync(path.join(dir, 'manifest.json'))); } catch { return { packId: null, status: 'FAIL', problems: ['MANIFEST_JSON'], notes: [] }; }
  const problems = [], notes = [];
  if (sha(packIdPreimage(manifest)) !== manifest.packId) problems.push('PACK_ID_MISMATCH');
  const glb = fs.readFileSync(path.join(dir, 'parts.glb'));
  if (glb.byteLength !== manifest.assets?.parts?.bytes || sha(glb) !== manifest.assets?.parts?.sha256) problems.push('GLB_HASH_MISMATCH');
  if (manifest.contract === PACK_CONTRACT) {
    const schema = manifestProblems(manifest);
    problems.push(...schema);
    if (!schema.length) problems.push(...glbProblems(glbJson(new Uint8Array(glb)), manifest));
  } else notes.push(`CONTRACT ${manifest.contract}: checked as a frozen pair only; the runtime loads ${PACK_CONTRACT}`);
  const allowed = new Set(['manifest.json', 'parts.glb']);
  for (const f of fs.readdirSync(dir)) if (!allowed.has(f)) problems.push('UNEXPECTED_FILE ' + f);
  return { packId: manifest.packId, status: problems.length ? 'FAIL' : 'PASS', problems, notes };
}

// SOURCE_FRESHNESS of the pack in `dir` against the sources on disk now (sources.mjs). A pack from before source
// binding records nothing to compare, so its freshness cannot be established.
export function checkPackFreshness(dir = PACK_DIR, root = ROOT) {
  const manifest = JSON.parse(fs.readFileSync(path.join(dir, 'manifest.json')));
  if (manifest.contract !== PACK_CONTRACT) return { status: 'UNVERIFIABLE', problems: [`SOURCE_BINDING_NOT_RECORDED ${manifest.contract}`] };
  return checkFreshness(manifest, root);
}

// ---------------------------------------------------------------- blender
function runBlender(opts) {
  const blender = opts.blender ?? '/Applications/Blender.app/Contents/MacOS/Blender';
  const script = path.join(ROOT, 'digital-twin/presentation/blender/build_studio_scene.py');
  const flags = ['render', 'preview', 'reset-presentation', 'remove-unowned', 'check'].filter((f) => opts[f]).map((f) => `--${f}`);
  // Scratch copies for tests: another .blend, receipt, render folder or report than the tracked ones.
  const paths = ['blend', 'receipt', 'renders', 'report'].filter((f) => typeof opts[f] === 'string').flatMap((f) => [`--${f}`, path.resolve(opts[f])]);
  const blend = typeof opts.blend === 'string' ? path.resolve(opts.blend) : path.join(ROOT, 'digital-twin/presentation/blender/picar-studio.blend');
  const argv = [...(fs.existsSync(blend) ? [blend] : []), '--background', '--factory-startup', '--python', script, '--', '--root', ROOT, ...flags, ...paths];
  const r = spawnSync(blender, argv, { cwd: ROOT, encoding: 'utf8', maxBuffer: 1 << 28, stdio: ['ignore', 'pipe', 'pipe'] });
  const lines = `${r.stdout}\n${r.stderr}`.split('\n').filter((l) => l.startsWith('[studio]') || /Error|Traceback|^[A-Z][A-Z_]{5,}\b/.test(l)); // [studio] lines, errors and refusal codes
  console.log(lines.join('\n'));
  if (r.status !== 0) fail('BLENDER_FAILED', String(r.status));
}

const [command, ...rest] = process.argv.slice(2);
const opts = args(rest);
if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    if (command === 'chain') runChain(opts);
    else if (command === 'tessellate') runTessellate(opts);
    else if (command === 'pack') buildPack(opts);
    else if (command === 'blender') runBlender(opts);
    else if (command === 'check') {
      const dir = opts.dir ? path.resolve(opts.dir) : PACK_DIR;
      const { packId, status, problems, notes } = checkPack(dir);
      const freshness = status === 'PASS' ? checkPackFreshness(dir) : { status: 'NOT_CHECKED', problems: ['PACK_INTEGRITY failed'] };
      const presentation = checkPresentation(ROOT, packId); // the tracked .blend and render against this pack
      console.log(JSON.stringify({ packId, integrity: { status, problems, notes }, freshness, presentation }, null, 1));
      process.exitCode = status !== 'PASS' ? 1 : freshness.status !== 'FRESH' || presentation.status !== 'CURRENT' ? 3 : 0;
    }
    else { console.log(fs.readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n').slice(1, 10).join('\n')); process.exitCode = 2; }
  } catch (e) { console.error(e.message); process.exitCode = 1; }
}
