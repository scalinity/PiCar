#!/usr/bin/env node
// Parts-tray completeness audit for the Assembly Studio (Studio 2, phase 0). Independent of the pack's own tray rule:
// the required set comes from the M1 inventory and the compiled M2 graphs, and the pack is checked against it.
//
//   node digital-twin/tools/studio/tray-audit.mjs [--manifest <manifest.json>] [--label <name>] [--out <dir>]
//
// Five sets per active variant, all counted as physical instances (shared definitions never reduce a count):
//   A canonical   planned-stock records for the variant (printed-stock claims, BOM_RECONCILIATION.md; not the owner's loose kit)
//   B required    every instance S01-S09 introduce or use, plus the kit tools their tool requirements name
//   C pack        manifest instances, tray entries, placed and candidate-only instances
//   D rendered    tray entries the runtime turns into drawn roots (createBoard): definition with triangles, finite pose,
//                 above the floor, inside the tray camera, not coincident with or buried in another tray part. Whether
//                 each one is visible on screen is measured in the running app by a pixel census (tests/browser/studio.spec.ts).
//   E schematic   required instances with no trusted solid, and whether the pack represents each one explicitly
// Invariant: B = D + represented E, with nothing missing and nothing unexpected.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const json = (p) => JSON.parse(fs.readFileSync(path.isAbsolute(p) ? p : path.join(ROOT, p)));
const argv = process.argv.slice(2);
const opt = (name, fallback) => { const i = argv.indexOf(`--${name}`); return i >= 0 ? argv[i + 1] : fallback; };
const manifestPath = opt('manifest', 'picarx-companion/src/generated/studio/manifest.json');
const label = opt('label', 'current');
const out = opt('out', null);
const STEPS = 9;
const pad = (n) => String(n).padStart(2, '0');
const short = (id) => id.replace(/^PX-V40-(INS|DEF)-/, '');

const stock = json('digital-twin/components/instances/planned-stock.json');
const defs = Object.fromEntries(json('digital-twin/components/definitions/parts.json').map((d) => [d.id, d]));
const tools = json('digital-twin/components/inventory/tools.json');
const uses = json(opt('planned-uses', 'digital-twin/components/inventory/planned-uses.json'));
const kinds = Object.fromEntries(json('digital-twin/validation/expected/m5/instructional-parameters.json').definitions.map((d) => [d.definitionId, d.recipe]));
const variants = json('digital-twin/assemblies/v40/presentation/instructional/product-scope.json').activeProductVariants;
const manifest = json(manifestPath);

const classOf = (definitionId) => defs[definitionId]?.componentClass ?? 'unknown';
const kindOf = (definitionId) => kinds[definitionId] ?? (definitionId.includes('-PLATE-') ? 'plate' : classOf(definitionId) === 'tool' ? 'tool' : 'none');
// Why an instance can have no drawn solid: its instructional recipe is schematic (cables, ribbons) or abstract
// (tape stock), or no instructional definition exists at all (tools).
const noSolidReason = (definitionId) => ({ schematic: 'schematic: no trusted solid (cable or ribbon)', abstract: 'abstract: consumable stock with no defined shape', tool: 'tool: no instructional geometry authored' })[kindOf(definitionId)] ?? null;

// Tool requirements name a tool category; the kit's tool instances are matched by that category (screwdriver,
// wrench). Which depicted screwdriver a step needs is unresolved (Q-06, Q-13), so every matching kit tool is listed.
const toolCategory = Object.fromEntries(tools.map((t) => [t.id, t.category]));
const toolInstancesFor = (requirementId, variant) => stock.filter((s) => s.variantIds.includes(variant) && classOf(s.definitionId) === 'tool'
  && defs[s.definitionId].name.toLowerCase().includes(toolCategory[requirementId])).map((s) => s.id);

function frustum(camera, aspect) {
  const P = camera.positionM, T = camera.targetM, f = norm(sub(T, P)), r = norm(cross(f, [0, 1, 0])), u = cross(r, f);
  const k = Math.tan((camera.verticalFovDeg * Math.PI) / 360);
  return (X) => { const d = sub(X, P), z = dot(d, f); return [dot(d, r) / z / (k * aspect), dot(d, u) / z / k, z]; };
}
const sub = (a, b) => a.map((v, i) => v - b[i]);
const dot = (a, b) => a.reduce((s, v, i) => s + v * b[i], 0);
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a) => { const l = Math.hypot(...a); return a.map((v) => v / l); };
function rotate(q, v) {
  const [x, y, z, w] = q, [vx, vy, vz] = v;
  const ix = w * vx + y * vz - z * vy, iy = w * vy + z * vx - x * vz, iz = w * vz + x * vy - y * vx, iw = -x * vx - y * vy - z * vz;
  return [ix * w + iw * -x + iy * -z - iz * -y, iy * w + iw * -y + iz * -x - ix * -z, iz * w + iw * -z + ix * -y - iy * -x];
}
function worldBox(bounds, pose) {
  const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
  for (const x of [bounds.min[0], bounds.max[0]]) for (const y of [bounds.min[1], bounds.max[1]]) for (const z of [bounds.min[2], bounds.max[2]]) {
    const p = rotate(pose.rotationXYZW, [x, y, z]).map((v, i) => v + pose.translationM[i]);
    for (let i = 0; i < 3; i++) { min[i] = Math.min(min[i], p[i]); max[i] = Math.max(max[i], p[i]); }
  }
  return { min, max };
}
const overlapVolume = (a, b) => [0, 1, 2].reduce((v, i) => v * Math.max(0, Math.min(a.max[i], b.max[i]) - Math.max(a.min[i], b.min[i])), 1);

// The S00 view at the native fullscreen size the remediation measured (1168 x 729 CSS px).
const VIEW = { width: 1168, height: 729 };
const MIN_PIXELS = 6; // a part narrower than this on screen cannot be counted by eye

const report = { contract: 'picar-studio-tray-audit/1', label, manifest: { path: path.relative(ROOT, path.resolve(ROOT, manifestPath)), packId: manifest.packId },
  scope: 'Canonical counts are printed-stock claims (BOM_RECONCILIATION.md), not a count of the owner\'s actual loose kit.', view: VIEW, variants: {} };

for (const variant of variants) {
  const graph = json(`digital-twin/validation/m2/${variant}/compiled-graph.json`);
  // A canonical
  const canonical = stock.filter((s) => s.variantIds.includes(variant));
  const byDisposition = {}, byClass = {};
  for (const s of canonical) { byDisposition[s.disposition] = (byDisposition[s.disposition] ?? 0) + 1; byClass[classOf(s.definitionId)] = (byClass[classOf(s.definitionId)] ?? 0) + 1; }
  // B required
  const firstStep = {}, how = {};
  for (let n = 1; n <= STEPS; n++) {
    const step = graph.steps[n - 1];
    for (const id of step.introducedInstanceIds) { firstStep[id] ??= n; how[id] ??= 'introduced'; }
    for (const id of step.usedInstanceIds) { firstStep[id] ??= n; how[id] ??= 'used-not-introduced'; }
    for (const req of step.toolRequirementIds) for (const id of toolInstancesFor(req, variant)) { firstStep[id] ??= n; how[id] ??= `tool for ${req}`; }
  }
  const required = Object.keys(firstStep).sort();
  const inst = Object.fromEntries(graph.instances.map((i) => [i.id, i]));
  // Cross-check: every printed-stock use M1 planned for S01-S09 on this variant is in the required set.
  const plannedUses = uses.filter((u) => u.variantId === variant && Number(u.stepId.slice(-2)) <= STEPS);
  const plannedNotRequired = plannedUses.filter((u) => !firstStep[u.instanceId]).map((u) => u.instanceId);
  const plannedStepMismatch = plannedUses.filter((u) => {
    const step = graph.steps[Number(u.stepId.slice(-2)) - 1];
    return firstStep[u.instanceId] && (!step || ![...step.introducedInstanceIds, ...step.usedInstanceIds].includes(u.instanceId));
  })
    .map((u) => `${short(u.instanceId)} planned S${u.stepId.slice(-2)}, graph S${pad(firstStep[u.instanceId])}`);
  const disagreements = [
    ...plannedNotRequired.map((id) => ({ class: 'PLANNED_REQUIRED_INSTANCE_MISSING', id })),
    ...plannedStepMismatch.map((detail) => ({ class: 'PLANNED_USE_STEP_MISMATCH', detail })),
  ];
  const canonicalById = Object.fromEntries(canonical.map((s) => [s.id, s]));
  for (const id of required) {
    const source = canonicalById[id], compiled = inst[id];
    if (!source || !compiled || !defs[source.definitionId] || source.definitionId !== compiled.definitionId || !compiled.variantIds.includes(variant))
      disagreements.push({ class: 'STOCK_MEMBERSHIP_MISMATCH', id });
  }
  for (const use of plannedUses) {
    if (!canonicalById[use.instanceId] || use.definitionId !== canonicalById[use.instanceId]?.definitionId)
      disagreements.push({ class: 'STOCK_MEMBERSHIP_MISMATCH', id: use.instanceId });
  }
  for (let n = 1; n <= STEPS; n++) {
    const step = graph.steps[n - 1];
    for (const id of step.introducedInstanceIds) {
      if (canonicalById[id]?.role.startsWith('printed-stock') && !plannedUses.some((u) => u.instanceId === id && u.stepId === step.id))
        disagreements.push({ class: 'GRAPH_REQUIRED_INSTANCE_MISSING', id, step: n });
    }
    for (const req of step.toolRequirementIds) {
      if (!toolCategory[req] || toolInstancesFor(req, variant).length === 0)
        disagreements.push({ class: 'TOOL_REQUIREMENT_MISMATCH', requirementId: req, step: n });
    }
  }
  // C pack
  const V = manifest.variants[variant];
  for (let n = 1; n <= STEPS; n++) {
    const source = graph.steps[n - 1], packed = V.steps[n - 1];
    const expected = [...source.introducedInstanceIds, ...source.usedInstanceIds, ...source.toolRequirementIds.flatMap((req) => toolInstancesFor(req, variant))];
    const actual = [...(packed?.introducedInstanceIds ?? []), ...(packed?.introducedZeroSolidInstanceIds ?? []), ...(packed?.usedInstanceIds ?? []), ...(packed?.toolInstanceIds ?? [])];
    if ([...new Set(expected)].some((id) => !actual.includes(id)) || [...new Set(actual)].some((id) => !expected.includes(id)))
      disagreements.push({ class: 'PACK_STEP_SCOPE_MISMATCH', step: n });
  }
  const packInstances = Object.entries(manifest.instances).filter(([, e]) => e.variants.includes(variant)).map(([id]) => id);
  const trayIds = Object.keys(V.tray.instances);
  const placedIds = new Set(V.steps.filter((s) => !s.candidatePlacements).flatMap((s) => Object.keys(s.placements)));
  const candidateOnly = [...new Set(V.steps.filter((s) => s.candidatePlacements).flatMap((s) => Object.keys(s.placements)))].filter((id) => !placedIds.has(id));
  const schematic = V.tray.tiles ?? {}; // explicit tiles for instances with no trusted solid (absent before Studio 2)
  // D rendered: the static construction path of createBoard, then what the tray camera can show of it.
  const project = frustum(V.tray.camera, VIEW.width / VIEW.height);
  const boxes = {}, rendered = [], notRendered = [], findings = [];
  for (const id of trayIds) {
    const definitionId = manifest.instances[id]?.definitionId, d = manifest.definitions[definitionId];
    const triangles = d ? d.solids.reduce((s, x) => s + x.triangles, 0) : 0;
    const pose = V.tray.instances[id];
    if (!d) { notRendered.push({ id, reason: 'missing definition' }); continue; }
    if (!triangles) { notRendered.push({ id, reason: 'zero triangles' }); continue; }
    if (![...pose.translationM, ...pose.rotationXYZW].every(Number.isFinite)) { notRendered.push({ id, reason: 'non-finite tray pose' }); continue; }
    const box = worldBox(d.boundsM, pose); boxes[id] = box;
    const corners = [0, 1, 2, 3, 4, 5, 6, 7].map((k) => project([box[k & 1 ? 'max' : 'min'][0], box[k & 2 ? 'max' : 'min'][1], box[k & 4 ? 'max' : 'min'][2]]));
    const inView = corners.every(([x, y, z]) => z > 0 && Math.abs(x) <= 1 && Math.abs(y) <= 1);
    const xs = corners.map((c) => ((c[0] + 1) / 2) * VIEW.width), ys = corners.map((c) => ((1 - c[1]) / 2) * VIEW.height);
    const pixels = Math.min(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys));
    rendered.push({ id, definitionId, triangles, inView, pixels: Math.round(pixels * 10) / 10, belowFloorMm: Math.max(0, (V.floorYM - box.min[1]) * 1000) });
  }
  for (const r of rendered) {
    if (!r.inView) findings.push({ id: r.id, kind: 'outside-tray-camera' });
    if (r.pixels < MIN_PIXELS) findings.push({ id: r.id, kind: 'too-small-to-count', pixels: r.pixels });
    if (r.belowFloorMm > 0.5) findings.push({ id: r.id, kind: 'below-floor', mm: r.belowFloorMm });
  }
  // Tiles occupy floor slots too: a tile on top of a solid would hide one or the other.
  for (const [id, t] of Object.entries(schematic)) boxes[id] = { min: [t.centreM[0] - t.halfExtentsM[0], t.centreM[1], t.centreM[2] - t.halfExtentsM[1]],
    max: [t.centreM[0] + t.halfExtentsM[0], t.centreM[1] + 0.0005, t.centreM[2] + t.halfExtentsM[1]] };
  const slotIds = Object.keys(boxes), coincident = [];
  for (let i = 0; i < slotIds.length; i++) for (let j = i + 1; j < slotIds.length; j++) {
    const a = boxes[slotIds[i]], b = boxes[slotIds[j]];
    if (!a || !b) continue;
    const v = overlapVolume(a, b);
    if (v > 0) coincident.push({ a: slotIds[i], b: slotIds[j], overlapMm3: Math.round(v * 1e9 * 10) / 10 });
  }
  // E non-renderable
  const nonRenderable = required.filter((id) => !trayIds.includes(id)).map((id) => ({
    id, definitionId: inst[id]?.definitionId, firstStep: firstStep[id], how: how[id], reason: noSolidReason(inst[id]?.definitionId ?? 'UNKNOWN') ?? 'has a solid kind but is not in the tray',
    represented: Boolean(schematic[id]), representation: schematic[id] ? `tray tile: ${manifest.schematic[id].representation}` : null,
  }));
  const representedNonRenderable = nonRenderable.filter((e) => e.represented);
  const renderedRequired = rendered.filter((r) => required.includes(r.id));
  const missing = required.filter((id) => !renderedRequired.some((r) => r.id === id) && !representedNonRenderable.some((e) => e.id === id));
  const unexpected = [...trayIds.filter((id) => !required.includes(id)), ...Object.keys(schematic).filter((id) => !required.includes(id))];
  report.variants[variant] = {
    counts: {
      canonicalPhysicalCount: canonical.length, s01ToS09RequiredCount: required.length, packInstanceCount: packInstances.length,
      trayInstanceCount: trayIds.length, placedInstanceCount: placedIds.size, candidateOnlyInstanceCount: candidateOnly.length,
      rendered3DInstanceCount: renderedRequired.length, nonRenderableCount: nonRenderable.length, nonRenderableRepresentedCount: representedNonRenderable.length,
      missingCount: missing.length, duplicateUnexpectedCount: unexpected.length + coincident.length, coincidentTrayPairs: coincident.length,
      definitionsDrawn: new Set(rendered.map((r) => r.definitionId)).size,
    },
    disagreements: [...disagreements, ...missing.map((id) => ({ class: 'PACK_SLOT_MISSING', id })), ...unexpected.map((id) => ({ class: 'PACK_SLOT_EXTRA', id }))],
    invariant: disagreements.length === 0 && missing.length === 0 && unexpected.length === 0 && coincident.length === 0 ? 'HOLDS' : 'FAILS',
    canonical: { byDisposition, byComponentClass: byClass, notRequiredForS01ToS09: canonical.length - required.length },
    required: required.map((id) => ({ id, definitionId: inst[id].definitionId, componentClass: classOf(inst[id].definitionId), firstStep: firstStep[id], how: how[id] })),
    crossCheck: { plannedUsesS01ToS09: plannedUses.length, plannedNotRequired, plannedStepMismatch },
    candidateOnly, notRendered, renderFindings: findings, coincident, nonRenderable, missing, unexpected,
  };
}

const lines = [`# Parts-tray completeness audit (${label})`, '', `Manifest \`${report.manifest.path}\`, pack \`${manifest.packId}\`. ${report.scope}`, '',
  '| variant | canonical | S01–S09 required | pack instances | tray | rendered 3D | non-renderable | represented | missing | duplicate / unexpected | invariant |', '|---|---|---|---|---|---|---|---|---|---|---|'];
for (const [v, r] of Object.entries(report.variants)) {
  const c = r.counts;
  lines.push(`| ${v} | ${c.canonicalPhysicalCount} | ${c.s01ToS09RequiredCount} | ${c.packInstanceCount} | ${c.trayInstanceCount} | ${c.rendered3DInstanceCount} | ${c.nonRenderableCount} | ${c.nonRenderableRepresentedCount} | ${c.missingCount} | ${c.duplicateUnexpectedCount} | ${r.invariant} |`);
}
for (const [v, r] of Object.entries(report.variants)) {
  lines.push('', `## ${v}`, '', `Canonical by disposition: ${Object.entries(r.canonical.byDisposition).map(([k, n]) => `${k} ${n}`).join(', ')}; ${r.canonical.notRequiredForS01ToS09} are not needed by S01–S09 (later steps, spares, accessories).`);
  lines.push(`Cross-check: ${r.crossCheck.plannedUsesS01ToS09} printed-stock uses planned for S01–S09; not in the required set: ${r.crossCheck.plannedNotRequired.map(short).join(', ') || 'none'}; first-step mismatches: ${r.crossCheck.plannedStepMismatch.join(', ') || 'none'}.`);
  if (r.disagreements.length) lines.push('', `Source disagreements: ${r.disagreements.map((d) => `${d.class}: ${d.id ?? d.detail ?? d.requirementId}`).join('; ')}.`);
  lines.push('', '| instance | first step | how required | no-solid reason | represented as |', '|---|---|---|---|---|');
  for (const e of r.nonRenderable) lines.push(`| ${short(e.id)} | S${pad(e.firstStep)} | ${e.how} | ${e.reason} | ${e.representation ?? '**nothing (silent omission)**'} |`);
  if (r.missing.length) lines.push('', `Missing (neither drawn nor represented): ${r.missing.map(short).join(', ')}.`);
  if (r.unexpected.length) lines.push('', `Unexpected (shown but not required): ${r.unexpected.map(short).join(', ')}.`);
  if (r.coincident.length) lines.push('', `Tray parts whose boxes overlap: ${r.coincident.map((c) => `${short(c.a)} × ${short(c.b)} ${c.overlapMm3} mm³`).join('; ')}.`);
  const small = r.renderFindings.filter((f) => f.kind === 'too-small-to-count');
  if (small.length) lines.push('', `Smaller than ${MIN_PIXELS} px in the S00 view at ${VIEW.width}×${VIEW.height}: ${small.map((f) => `${short(f.id)} ${f.pixels} px`).join(', ')}.`);
  const other = r.renderFindings.filter((f) => f.kind !== 'too-small-to-count');
  if (other.length) lines.push('', `Other render findings: ${other.map((f) => `${short(f.id)} ${f.kind}`).join(', ')}.`);
  if (r.candidateOnly.length) lines.push('', `Placed only in the refused S09 candidate: ${r.candidateOnly.map(short).join(', ')}.`);
}
const md = lines.join('\n') + '\n';
if (out) {
  fs.mkdirSync(out, { recursive: true });
  fs.writeFileSync(path.join(out, `tray-audit-${label}.json`), JSON.stringify(report, null, 1) + '\n');
  fs.writeFileSync(path.join(out, `tray-audit-${label}.md`), md);
}
process.stdout.write(md);
process.exitCode = Object.values(report.variants).every((r) => r.invariant === 'HOLDS') ? 0 : 3;
