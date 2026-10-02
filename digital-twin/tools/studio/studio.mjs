#!/usr/bin/env node
// Assembly Studio pack pipeline (presentation track). Commands, ownership and limits:
// docs/digital-twin/ASSEMBLY_STUDIO_PIPELINE.md.
//
//   node digital-twin/tools/studio/studio.mjs chain --python <frozen-env-python> --label <label>
//   node digital-twin/tools/studio/studio.mjs tessellate --python <frozen-env-python> --chain <label> --label <label>
//   node digital-twin/tools/studio/studio.mjs pack --chain <label> --tessellation <label>
//   node digital-twin/tools/studio/studio.mjs blender [--blender <path>] [--render] [--reset-presentation]
//   node digital-twin/tools/studio/studio.mjs check
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import canonicalize from 'canonicalize';
import { writeGlb, readGlb } from './glb.mjs';
import { CAD_BASIS, RUNTIME_BASIS, C, SCALE, pointToRuntime, directionToRuntime, pointToCad, rotationToRuntime, rotationToCad,
  poseToRuntime, matrixFromQuaternion, isProperRotation } from './basis.mjs';

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
  for (const [module, ...argv] of chainCommands(out)) {
    const started = Date.now();
    const r = spawnSync(python, ['-m', `${M}.${module}`, ...argv], { cwd: path.join(ROOT, 'digital-twin'), env, encoding: 'utf8', maxBuffer: 1 << 28 });
    fs.writeFileSync(path.join(out, `log-${module}.txt`), (r.stdout ?? '') + (r.stderr ?? ''));
    record.push({ module, argv: argv.map((a) => a.replace(ROOT, '<repo>')), exit: r.status, seconds: (Date.now() - started) / 1000 });
    console.log(`${module} exit ${r.status}`);
    if (r.status !== 0) { fs.writeFileSync(path.join(out, 'commands.json'), JSON.stringify(record, null, 1)); fail('CHAIN_STEP_FAILED', module); }
  }
  fs.writeFileSync(path.join(out, 'commands.json'), JSON.stringify({ mode: 'source-mode dev loop (PYTHONPATH=digital-twin/cad), not an M7 qualification', head: git('rev-parse', 'HEAD'), commands: record }, null, 1));
}

// ---------------------------------------------------------------- tessellate
function studioDefinitions() {
  const kind = kindsByDefinition();
  const defs = new Set();
  for (const variant of activeVariants()) {
    const graph = json(`digital-twin/validation/m2/${variant}/compiled-graph.json`);
    const defOf = Object.fromEntries(graph.instances.map((i) => [i.id, i.definitionId]));
    for (let n = 1; n <= STEPS; n++) for (const id of graph.steps[n - 1].introducedInstanceIds) if (isSolidKind(kind[defOf[id]])) defs.add(defOf[id]);
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
    const record = json(`${DISPLAY_DIR}/${f}`), brep = `${DISPLAY_DIR}/${record.artifact}`;
    if (sha(read(brep)) !== record.artifactSha256) fail('DISPLAY_ARTIFACT_HASH', brep);
    out[record.definitionId] = { record, brep };
  }
  return out;
}

const activeVariants = () => json(`${PRESENTATION}/instructional/product-scope.json`).activeProductVariants;
const kindsByDefinition = () => ({ ...Object.fromEntries(json('digital-twin/validation/expected/m5/instructional-parameters.json').definitions.map((d) => [d.definitionId, d.recipe])) });
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
  const index = JSON.parse(fs.readFileSync(path.join(tessDir, 'meshes.json')));
  const bin = fs.readFileSync(path.join(tessDir, 'meshes.bin'));
  if (sha(bin) !== index.binSha256) fail('TESSELLATION_BIN_HASH');
  const verify = JSON.parse(fs.readFileSync(path.join(chainDir, 'closure-observations.json')));
  const verdict = Object.fromEntries(verify.results.map((r) => [`${r.variantId}-S${pad(r.printedNumber)}`, r.status]));
  const checks = [];
  const check = (id, ok, detail) => { checks.push({ id, status: ok ? 'PASS' : 'FAIL', detail }); if (!ok) fail('PACK_CHECK_FAILED', `${id}: ${detail}`); };

  // Definitions: convert vertices exactly once, assign material regions by solid index.
  const displays = displayRecords(), labels = fidelityLabels();
  const usedMaterials = new Set();
  const glbDefinitions = [], definitions = {}, cadBounds = {};
  for (const entry of index.definitions) {
    const chainPrefix = `digital-twin/generated/studio/chain/${chain}/`;
    if (entry.artifactPath.startsWith(chainPrefix)) entry.artifactPath = 'chain:' + entry.artifactPath.slice(chainPrefix.length);
    const kind = kindOf(kinds, entry.definitionId);
    const registered = displays[entry.definitionId];
    if (entry.display) check(`display:${entry.definitionId}`, registered && registered.record.artifactSha256 === entry.display.artifactSha256, 'tessellated display model matches its registered record');
    const shown = entry.display ?? entry; // the meshes the Studio draws
    const regions = entry.display ? registered.record.solids.map((s) => s.materialId)
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
      artifact: { path: entry.artifactPath, sha256: entry.artifactSha256, bytes: entry.artifactBytes },
      approximation: approximationOf(entry.artifactPath, labels[entry.definitionId]),
      boundsM: { min: rtMin.map((v, i) => Math.min(v, rtMax[i])), max: rtMin.map((v, i) => Math.max(v, rtMax[i])) },
      solids: shown.solids.map((s, i) => ({ index: s.index, materialId: regions[i], triangles: s.triangleCount, volumeMm3: s.volumeMm3,
        ...(entry.display ? { name: registered.record.solids[i].name } : {}) })),
      ...(entry.display ? { display: {
        label: 'Detailed presentation model; assembly checks use the instructional artifact',
        source: registered.record.source, artifact: { path: entry.display.artifactPath, sha256: entry.display.artifactSha256 },
        relation: registered.record.relation, overlapsChain: registered.record.overlaps.chain,
        ...(registered.record.vendorCrossCheck ? { vendorCrossCheck: registered.record.vendorCrossCheck } : {}),
      } } : {}),
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
    asset: { version: '2.0', generator: 'picar-studio digital-twin/tools/studio/studio.mjs', extras: { contract: 'picar-studio-parts/1', basis: RUNTIME_BASIS, unit: 'm', track: 'presentation-only' } },
    materials: materialsUsed, definitions: glbDefinitions,
  });
  const reread = readGlb(glb);
  check('glb:no-images', !reread.json.images && !reread.json.textures && !reread.json.samplers, 'GLB carries no image, texture or sampler');
  check('glb:identity-roots', reread.json.nodes.every((n) => !n.matrix && !n.translation && !n.rotation && !n.scale), 'definition roots are at identity; poses live only in the manifest');

  // Variants, steps, tray and cameras.
  const instances = {};
  const variants = {};
  const vfov = stage.camera.verticalFovDeg;
  for (const variant of activeVariants()) {
    const graph = json(`digital-twin/validation/m2/${variant}/compiled-graph.json`);
    const inst = Object.fromEntries(graph.instances.map((i) => [i.id, i]));
    const steps = [];
    let previous = null;
    const firstStepOf = {}, installedRotation = {};
    for (let n = 1; n <= STEPS; n++) {
      const step = graph.steps[n - 1];
      const key = `${variant}-S${pad(n)}`;
      const closureFile = path.join(chainDir, 'chain/closures', `${key}-closure.json`), blockedFile = path.join(chainDir, 'chain/closures', `${key}-blocked.json`);
      const introducedSolid = step.introducedInstanceIds.filter((id) => isSolidKind(kindOf(kinds, inst[id].definitionId)));
      for (const id of step.introducedInstanceIds) firstStepOf[id] ??= n;
      let entry;
      if (fs.existsSync(closureFile)) {
        const bytes = fs.readFileSync(closureFile), c = JSON.parse(bytes);
        const v = verdict[key];
        const display = v === 'PASS' && c.status === 'COMPLETE' ? 'PREVIEW_SOURCE_REVALIDATED' : v === 'BLOCKED' && c.status === 'BLOCKED' ? 'PREVIEW_BLOCKED_RELATION' : 'UNAVAILABLE';
        check(`proper-rotations:${key}`, c.placements.every((p) => isProperRotation(p.rotation)), 'every closure rotation is proper (det +1, orthonormal)');
        for (const p of c.placements) installedRotation[p.instanceId] ??= p.rotation;
        entry = {
          source: { kind: 'closure', file: `chain/closures/${path.basename(closureFile)}`, sha256: sha(bytes), status: c.status, closureVerify: v },
          display, placements: c.placements, recipes: c.recipes, blockers: c.blockers, conflicts: [], carriedUnframedConnectionIds: c.carriedUnframedConnectionIds,
          zeroSolidInstanceIds: c.zeroSolidInstanceIds, limitations: c.sourceLimitations, approximationFlags: c.approximationFlags, claims: c.claims,
        };
        previous = c;
      } else if (fs.existsSync(blockedFile)) {
        const bytes = fs.readFileSync(blockedFile), b = JSON.parse(bytes);
        const recordFile = path.join(chainDir, 'chain/steps', `${key}-record.json`);
        const record = fs.existsSync(recordFile) ? JSON.parse(fs.readFileSync(recordFile)) : null;
        const candidate = record && previous ? [...previous.placements.filter((p) => !record.placements.some((r) => r.instanceId === p.instanceId)),
          ...record.placements.map(({ instanceId, translationMm, rotation, featureRef, role }) => ({ instanceId, translationMm, rotation, featureRef, role }))] : [];
        entry = {
          source: { kind: 'refused-closure', file: `chain/closures/${path.basename(blockedFile)}`, sha256: sha(bytes), stage: b.stage, reason: String(b.reason).split(' ')[0],
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
      steps.push({
        printedNumber: n, stepId: step.id, title: step.title, sourcePanel: step.sourcePanel,
        display: entry.display, assembly: { gate: gate.gate, status: gate.status, admittedRows: gate.currentProductDeliveryCoverage.complete, requiredRows: gate.currentProductDeliveryCoverage.required },
        operable: stage.operableSteps.includes(n) && entry.display === 'PREVIEW_SOURCE_REVALIDATED',
        introducedInstanceIds: introducedSolid, introducedZeroSolidInstanceIds: step.introducedInstanceIds.filter((id) => !introducedSolid.includes(id)),
        placements: placementsRt, candidatePlacements: entry.candidate === true,
        // Detailed display models placed in this state, intersected with every other part (see the display record).
        displayChecks: Object.values(displays).flatMap(({ record }) => (Object.keys(placementsRt).some((id) => inst[id].definitionId === record.definitionId)
          ? record.overlaps.positive.filter((o) => o.step === n).map((o) => ({ definitionId: record.definitionId, instanceId: o.instanceId, volumeMm3: o.volumeMm3 })) : [])),
        recipes: entry.recipes.map((r) => ({ instanceId: r.instanceId, approachAxis: directionToRuntime(r.approachAxis), approachDistanceM: r.approachDistanceMm * SCALE,
          stagedStart: poseToRuntime(r.stagedStart), segments: r.segments, anchor: r.anchor, stagingOnly: r.stagingOnly === true })),
        blockers: entry.blockers, conflicts: entry.conflicts, carriedUnframedConnectionIds: entry.carriedUnframedConnectionIds, zeroSolidInstanceIds: entry.zeroSolidInstanceIds,
        limitations: entry.limitations, approximationFlags: entry.approximationFlags, claims: entry.claims, source: entry.source,
        dependencyWarnings: [], _boundsCad: bounds,
      });
    }
    for (const s of steps) s.dependencyWarnings = steps.filter((e) => e.printedNumber < s.printedNumber && e.display !== 'PREVIEW_SOURCE_REVALIDATED')
      .map((e) => ({ printedNumber: e.printedNumber, display: e.display, text: `S${pad(e.printedNumber)} is ${e.display === 'UNAVAILABLE' ? 'unavailable' : 'not revalidated'}; previewing S${pad(s.printedNumber)} does not certify S${pad(e.printedNumber)}` }));

    // Parts tray: every S01-S09 solid instance, a labelled presentation layout beside the chassis.
    const trayIds = Object.keys(firstStepOf).filter((id) => isSolidKind(kindOf(kinds, inst[id].definitionId)))
      .sort((a, b) => firstStepOf[a] - firstStepOf[b] || inst[a].definitionId.localeCompare(inst[b].definitionId) || a.localeCompare(b));
    const assembled = unionBounds(steps.map((s) => s._boundsCad).filter((b) => Number.isFinite(b.min[0])));
    const floorZ = assembled.min[2];
    const tray = {};
    const startX = assembled.min[0];
    let cursorX = startX, rowTop = assembled.min[1] - stage.tray.offsetMm, rowDepth = 0;
    for (const id of trayIds) {
      const verified = installedRotation[id];
      const R = verified ?? [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
      const b = worldBounds(cadBounds[inst[id].definitionId], R, [0, 0, 0]);
      const dx = b.max[0] - b.min[0], dy = b.max[1] - b.min[1];
      if (cursorX > startX && cursorX + dx > startX + stage.tray.rowLengthMm) { cursorX = startX; rowTop -= rowDepth + stage.tray.gapMm; rowDepth = 0; }
      const t = [cursorX - b.min[0], rowTop - dy - b.min[1], floorZ - b.min[2]];
      tray[id] = { ...poseToRuntime({ translationMm: t, rotation: R }), orientation: verified ? 'installed' : 'part-local', firstStep: firstStepOf[id] };
      cursorX += dx + stage.tray.gapMm; rowDepth = Math.max(rowDepth, dy);
    }
    const trayBounds = unionBounds(trayIds.map((id) => worldBounds(cadBounds[inst[id].definitionId], rotationToCad(matrixFromQuaternion(tray[id].rotationXYZW)), pointToCad(tray[id].translationM))));
    const everything = unionBounds([assembled, trayBounds]);
    const cameraSpec = (n) => ({ ...stage.camera.default, ...(stage.camera.steps[String(n)] ?? {}) });
    const subject = (n, b) => (cameraSpec(n).subject === 'everything' ? everything : b);
    for (const s of steps) {
      const b = subject(s.printedNumber, s._boundsCad);
      s.camera = Number.isFinite(b.min[0]) ? cameraFor(cameraSpec(s.printedNumber), b, vfov) : null;
      delete s._boundsCad;
    }

    for (const id of trayIds) {
      instances[id] ??= { definitionId: inst[id].definitionId, name: names[inst[id].definitionId] ?? inst[id].definitionId, role: inst[id].role, variants: [] };
      instances[id].variants.push(variant);
    }
    variants[variant] = {
      graphHash: graph.graphHash, modelHash: graph.modelHash,
      floorYM: (floorZ - json(STAGE).lighting.floor.gapMm) * SCALE,
      tray: { label: 'Parts tray: presentation layout only, not a physical assembly state', instances: tray, camera: cameraFor(cameraSpec(0), everything, vfov) },
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
    contract: 'picar-studio-pack/1',
    classification: { capability: 'provisionalReview', label: 'Assembly Studio preview pack, not a G-GEOMETRY runtime pack', engineeringAdmission: false, runtimeAdmission: false, instructionGeometry: false },
    basis: RUNTIME_BASIS, unit: 'm',
    conversion: { from: `${CAD_BASIS} millimetres`, matrix: C, scale: SCALE, appliedIn: 'digital-twin/tools/studio/basis.mjs', poses: 'rotation C R C^T, translation 0.001 C t, quaternion [x,y,z,w]' },
    readinessKinds: {
      PREVIEW_SOURCE_REVALIDATED: 'closure produced by the source-mode chain and passed by the independent closure verifier for this pack; not an M7 qualification',
      PREVIEW_BLOCKED_RELATION: 'placements verified, a required relationship unresolved; review mode',
      REVIEW_REFUSED_CANDIDATE: 'closure refused by the overlap check; the refused record\'s candidate placements are shown for review only',
      UNAVAILABLE: 'no source record; parts stay in the tray',
    },
    source: {
      repository: { head: git('rev-parse', 'HEAD'), branch: git('branch', '--show-current') },
      chain: { label: chain, mode: 'source-mode dev loop, not an M7 qualification', closureVerify: { status: verify.status, sha256: sha(fs.readFileSync(path.join(chainDir, 'closure-observations.json'))) } },
      tessellation: { label: tessellation, meshesSha256: sha(fs.readFileSync(path.join(tessDir, 'meshes.json'))), binSha256: index.binSha256, linearDeflectionMm: index.linearDeflectionMm, angularDeflectionRad: index.angularDeflectionRad },
      inputs: Object.fromEntries([STAGE, MATERIALS, GATE_REPORT, `${PRESENTATION}/instructional/product-scope.json`].map((p) => [p, sha(read(p))])),
      m7Gate: { gate: gate.gate, status: gate.status, coverage: gate.currentProductDeliveryCoverage },
    },
    assets: { parts: { path: 'parts.glb', sha256: glbSha, bytes: glb.byteLength } },
    materials: Object.fromEntries(materialsUsed.map(({ id, ...m }) => [id, m])),
    lighting: stage.lighting,
    timing: stage.timing,
    definitions, instances, variants,
    validation: { checks: checks.length, failed: 0, summary: [...new Set(checks.map((c) => c.id.split(':')[0]))] },
  };
  const packId = sha(Buffer.concat([Buffer.from('picar-studio:pack\n'), Buffer.from(canonicalize(manifest))]));
  fs.mkdirSync(PACK_DIR, { recursive: true });
  fs.writeFileSync(path.join(PACK_DIR, 'parts.glb'), glb);
  fs.writeFileSync(path.join(PACK_DIR, 'manifest.json'), JSON.stringify({ packId, ...manifest }, null, 1) + '\n');
  fs.writeFileSync(path.join(GEN, `pack-checks-${packId.slice(0, 12)}.json`), JSON.stringify(checks, null, 1));
  console.log(JSON.stringify({ packId, glbBytes: glb.byteLength, glbSha256: glbSha, checks: checks.length, definitions: Object.keys(definitions).length, instances: Object.keys(instances).length }));
}

// ---------------------------------------------------------------- check (pack integrity; also used by the companion tests)
export function checkPack(dir = PACK_DIR) {
  const manifest = JSON.parse(fs.readFileSync(path.join(dir, 'manifest.json')));
  const { packId, ...rest } = manifest;
  const problems = [];
  const expect = sha(Buffer.concat([Buffer.from('picar-studio:pack\n'), Buffer.from(canonicalize(rest))]));
  if (expect !== packId) problems.push('PACK_ID_MISMATCH');
  const glb = fs.readFileSync(path.join(dir, manifest.assets.parts.path));
  if (sha(glb) !== manifest.assets.parts.sha256 || glb.byteLength !== manifest.assets.parts.bytes) problems.push('GLB_HASH_MISMATCH');
  const { json: g } = readGlb(new Uint8Array(glb));
  const nodes = new Set(g.nodes.map((n) => n.name));
  for (const id of Object.keys(manifest.definitions)) if (!nodes.has(id)) problems.push('MISSING_NODE ' + id);
  for (const [id, i] of Object.entries(manifest.instances)) if (!manifest.definitions[i.definitionId]) problems.push('MISSING_DEFINITION ' + id);
  for (const [variant, v] of Object.entries(manifest.variants)) for (const s of v.steps) for (const id of Object.keys(s.placements)) if (!manifest.instances[id]) problems.push(`UNKNOWN_INSTANCE ${variant} S${s.printedNumber} ${id}`);
  const allowed = new Set(['manifest.json', 'parts.glb']);
  for (const f of fs.readdirSync(dir)) if (!allowed.has(f)) problems.push('UNEXPECTED_FILE ' + f);
  return { packId, problems };
}

// ---------------------------------------------------------------- blender
function runBlender(opts) {
  const blender = opts.blender ?? '/Applications/Blender.app/Contents/MacOS/Blender';
  const script = path.join(ROOT, 'digital-twin/presentation/blender/build_studio_scene.py');
  const extra = [opts.render ? '--render' : null, opts.preview ? '--preview' : null, opts['reset-presentation'] ? '--reset-presentation' : null].filter(Boolean);
  const blend = path.join(ROOT, 'digital-twin/presentation/blender/picar-studio.blend');
  const argv = [...(fs.existsSync(blend) ? [blend] : []), '--background', '--factory-startup', '--python', script, '--', '--root', ROOT, ...extra];
  const r = spawnSync(blender, argv, { cwd: ROOT, encoding: 'utf8', maxBuffer: 1 << 28, stdio: ['ignore', 'pipe', 'pipe'] });
  const lines = `${r.stdout}\n${r.stderr}`.split('\n').filter((l) => l.startsWith('[studio]') || /Error|Traceback/.test(l));
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
    else if (command === 'check') { const r = checkPack(); console.log(JSON.stringify(r)); if (r.problems.length) process.exitCode = 1; }
    else { console.log(fs.readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n').slice(1, 10).join('\n')); process.exitCode = 2; }
  } catch (e) { console.error(e.message); process.exitCode = 1; }
}
