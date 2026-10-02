// Studio pack: identity, completeness, basis, readiness labelling and private-data exclusion.
// Reads the committed generated pack only; no chain run, owner data or network is needed.
import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const PACK = path.resolve('src/generated/studio');
const TOOLS = path.resolve('../digital-twin/tools/studio');
type M3 = number[][];
type Basis = {
  rotationToRuntime(R: M3): M3; rotationToCad(Q: M3): M3; pointToRuntime(p: number[]): number[]; pointToCad(p: number[]): number[];
  quaternionFromMatrix(m: M3): number[]; matrixFromQuaternion(q: number[]): M3; isProperRotation(R: M3): boolean;
};
const load = async <T>(file: string): Promise<T> => (await import(pathToFileURL(path.join(TOOLS, file)).href)) as T;
const basis = await load<Basis>('basis.mjs');
const { checkPack } = await load<{ checkPack(dir: string): { packId: string; status: string; problems: string[]; notes: string[] } }>('studio.mjs');
const { readGlb } = await load<{ readGlb(b: Uint8Array): { json: any; read(i: number): Float32Array | Uint16Array | Uint32Array } }>('glb.mjs');

const manifest = JSON.parse(fs.readFileSync(path.join(PACK, 'manifest.json'), 'utf8'));
const glbBytes = new Uint8Array(fs.readFileSync(path.join(PACK, 'parts.glb')));
const glb = readGlb(glbBytes);

describe('pack identity and completeness', () => {
  it('keeps PACK_INTEGRITY: recomputes the pack id, the GLB hash and the runtime contract, and holds only the two pack files', () => {
    expect(checkPack(PACK)).toEqual({ packId: manifest.packId, status: 'PASS', problems: [], notes: [] });
    expect(fs.readdirSync(PACK).sort()).toEqual(['manifest.json', 'parts.glb']);
  });
  it('binds every step that plays as instruction to its verified canonical closure hash', () => {
    for (const v of Object.values<any>(manifest.variants)) for (const s of v.steps.filter((x: any) => x.operable)) {
      expect(s.source).toMatchObject({ kind: 'closure', closureVerify: 'PASS' });
      expect(s.source.closureRfc8785Sha256).toMatch(/^[0-9a-f]{64}$/);
    }
    expect(manifest.source.chain.studioChain.sha256).toMatch(/^[0-9a-f]{64}$/);
    expect(manifest.source.revisionRegistry.sha256).toMatch(/^[0-9a-f]{64}$/);
  });
  it('is labelled a preview pack, never an engineering or runtime admission', () => {
    expect(manifest.classification).toMatchObject({ capability: 'provisionalReview', engineeringAdmission: false, runtimeAdmission: false, instructionGeometry: false });
    expect(manifest.basis).toBe('RH-YUP-ZFORWARD');
    expect(manifest.unit).toBe('m');
  });
  it('gives every definition exactly one identified node at identity, and every instance a definition', () => {
    const nodes = glb.json.nodes as any[];
    expect(nodes.map((n) => n.extras.picarStudio.definitionId).sort()).toEqual(Object.keys(manifest.definitions).sort());
    for (const n of nodes) {
      expect(n.name).toBe(n.extras.picarStudio.definitionId);
      expect(n.matrix ?? n.translation ?? n.rotation ?? n.scale).toBeUndefined();
    }
    for (const i of Object.values<any>(manifest.instances)) expect(manifest.definitions[i.definitionId]).toBeTruthy();
    for (const variant of Object.values<any>(manifest.variants)) {
      for (const id of Object.keys(variant.tray.instances)) expect(manifest.instances[id]).toBeTruthy();
      for (const step of variant.steps) for (const id of Object.keys(step.placements)) expect(variant.tray.instances[id]).toBeTruthy();
    }
  });
  it('maps every primitive to a declared material and matches the declared solid layout', () => {
    for (const mesh of glb.json.meshes as any[]) {
      const def = manifest.definitions[mesh.name];
      expect(mesh.primitives.map((p: any) => p.extras.materialId)).toEqual(def.solids.map((s: any) => s.materialId));
      for (const p of mesh.primitives) expect(manifest.materials[glb.json.materials[p.material].name]).toBeTruthy();
    }
  });
  it('carries no images, textures, animations or skins', () => {
    for (const key of ['images', 'textures', 'samplers', 'animations', 'skins']) expect(glb.json[key]).toBeUndefined();
  });
});

describe('units, axes and transforms', () => {
  it('converts the installed Plate A pose exactly once (CAD Rx180 at z 2 mm)', () => {
    const plate = manifest.variants.rpi5.steps[0].placements['PX-V40-INS-PLATE-A-001'];
    expect(plate.translationM).toEqual([0, 0.002, 0]);
    const R = basis.matrixFromQuaternion(plate.rotationXYZW);
    expect(basis.rotationToCad(R).map((r) => r.map((v) => Math.round(v * 1e12) / 1e12 + 0))).toEqual([[1, 0, 0], [0, -1, 0], [0, 0, -1]]);
  });
  it('keeps Plate A 174 mm long along runtime +Z (robot forward), arm tip to tip as the photo review measured', () => {
    const b = manifest.definitions['PX-V40-DEF-PLATE-A'].boundsM;
    const review = JSON.parse(fs.readFileSync(path.resolve('../digital-twin/validation/expected/m7/fidelity/plate-a-outline-01.review.json'), 'utf8'));
    const tipToTipMm = 2 * (review.design.endHoleAxisMm[1] + review.revision.design.endRadiusMm);
    expect(b.max[2] - b.min[2]).toBeCloseTo(0.174, 6);
    expect(Math.abs((b.max[0] - b.min[0]) * 1000 - tipToTipMm)).toBeLessThan(0.05);
  });
  it('round-trips points and proper rotations through the basis', () => {
    const R = [[0, -1, 0], [1, 0, 0], [0, 0, 1]];
    expect(basis.rotationToCad(basis.rotationToRuntime(R))).toEqual(R);
    expect(basis.pointToCad(basis.pointToRuntime([12.5, -3, 7]))).toEqual([12.5, -3, 7]);
    expect(basis.isProperRotation(basis.rotationToRuntime(R))).toBe(true);
    expect(basis.isProperRotation([[1, 0, 0], [0, 1, 0], [0, 0, -1]])).toBe(false);
  });
  it('stores normalized quaternions for every placement, recipe and tray pose', () => {
    for (const v of Object.values<any>(manifest.variants)) {
      const poses = [...Object.values<any>(v.tray.instances), ...v.steps.flatMap((s: any) => [...Object.values<any>(s.placements), ...s.recipes.map((r: any) => r.stagedStart)])];
      for (const p of poses) expect(Math.hypot(...p.rotationXYZW)).toBeCloseTo(1, 12);
    }
  });
  it('places definition vertices inside the declared bounds (float32 GLB)', () => {
    for (const mesh of glb.json.meshes as any[]) {
      const b = manifest.definitions[mesh.name].boundsM;
      for (const p of mesh.primitives) {
        const a = glb.json.accessors[p.attributes.POSITION];
        for (let k = 0; k < 3; k++) {
          expect(a.min[k]).toBeGreaterThanOrEqual(b.min[k] - 1e-6);
          expect(a.max[k]).toBeLessThanOrEqual(b.max[k] + 1e-6);
        }
      }
    }
  });
});

describe('readiness is labelled separately from assembly acceptance', () => {
  const steps = (v: string) => manifest.variants[v].steps as any[];
  it.each(['rpi5', 'rpi-zero-2-w'])('%s: S01-S06 and S08 play as Preview, S07 and S09 open in Review, nothing is closed', (v) => {
    expect(steps(v).filter((s) => s.operable).map((s) => s.printedNumber)).toEqual([1, 2, 3, 4, 5, 6, 8]);
    expect(steps(v).map((s) => s.mode)).toEqual(['preview', 'preview', 'preview', 'preview', 'preview', 'preview', 'review', 'preview', 'review']);
    for (const s of steps(v).filter((x) => x.mode === 'preview')) expect(s).toMatchObject({ display: 'PREVIEW_SOURCE_REVALIDATED', candidatePlacements: false, source: { kind: 'closure', closureVerify: 'PASS' } });
    expect(steps(v)[6]).toMatchObject({ display: 'PREVIEW_BLOCKED_RELATION', mode: 'review', operable: false });
    expect(steps(v)[6].blockers).toEqual([{ id: 'UNFRAMED_TOUCHED_CABLE_END', connectionIds: ['PX-V40-CONN-07-COMMON-BATTERY'] }]);
    expect(steps(v)[6].focusInstanceIds).toEqual(['PX-V40-INS-BATTERY-001', 'PX-V40-INS-ROBOT-HAT-001']); // the lead's two ends
    expect(steps(v)[8]).toMatchObject({ display: 'REVIEW_REFUSED_CANDIDATE', mode: 'review', operable: false, candidatePlacements: true });
    expect(steps(v)[8].conflicts.map((c: any) => [c.instances.join(' x '), Math.round(c.volumeMm3 * 1000) / 1000])).toEqual([
      ['PX-V40-INS-HORN-PAN-001 x PX-V40-INS-PLATE-H-001', 101.071], ['PX-V40-INS-HORN-PAN-001 x PX-V40-INS-ULTRASONIC-001', 2.026],
      ['PX-V40-INS-PLATE-A-001 x PX-V40-INS-PLATE-H-001', 12.955], ['PX-V40-INS-PLATE-A-001 x PX-V40-INS-ULTRASONIC-001', 51.25]]);
    expect(steps(v)[7].dependencyWarnings.map((w: any) => w.printedNumber)).toEqual([7]);
    for (const s of steps(v)) expect(s.assembly).toMatchObject({ gate: 'G-INSTRUCTIONAL-ASSEMBLY', status: 'BLOCKED', admittedRows: 0, requiredRows: 58 });
  });
  it.each(['rpi5', 'rpi-zero-2-w'])('%s: animates what each closure newly places, so the battery moves in S07 (placed there, introduced in S06)', (v) => {
    expect(steps(v)[5].introducedInstanceIds).toContain('PX-V40-INS-BATTERY-001');
    expect(steps(v)[5].newlyPlacedInstanceIds).toEqual([]);
    expect(steps(v)[6].newlyPlacedInstanceIds).toEqual(['PX-V40-INS-BATTERY-001']);
    for (const s of steps(v)) {
      const before = s.printedNumber > 1 ? Object.keys(steps(v)[s.printedNumber - 2].placements) : [];
      expect(s.newlyPlacedInstanceIds.sort()).toEqual(Object.keys(s.placements).filter((id) => !before.includes(id)).sort());
    }
  });
  it('quotes each step\'s source intent and warnings from the repository records, never generated text', () => {
    const intents = JSON.parse(fs.readFileSync(path.resolve('../digital-twin/assemblies/v40/steps/source-intents.json'), 'utf8'));
    const registry = JSON.parse(fs.readFileSync(path.resolve('../digital-twin/validation/m2/runtime-registry.json'), 'utf8'));
    for (const v of ['rpi5', 'rpi-zero-2-w']) for (const s of steps(v)) {
      const i = intents.find((x: any) => x.printedNumber === s.printedNumber);
      expect(s.instruction).toEqual({ record: 'digital-twin/assemblies/v40/steps/source-intents.json', id: i.id, parts: i.introducedParts, hardware: i.introducedHardware,
        tools: i.tools, orientation: i.orientation, connection: i.connectionIntent, variant: i.variantDetails?.[v] ?? null });
      for (const w of s.warnings) expect(registry.warnings.find((x: any) => x.id === w.id).text).toBe(w.text);
    }
  });
  it('authors a guided camera for the tray and every step, and every opened state has one', () => {
    const stage = JSON.parse(fs.readFileSync(path.resolve('../digital-twin/assemblies/v40/presentation/studio/stage.json'), 'utf8'));
    expect(Object.keys(stage.camera.steps).sort()).toEqual(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']);
    for (const v of ['rpi5', 'rpi-zero-2-w']) {
      expect(manifest.variants[v].tray.camera).toBeTruthy();
      for (const s of steps(v)) expect(s.camera).toBeTruthy();
    }
  });
  it('binds the detailed Pi 5 to the closures it was checked against, and marks the refused S09 candidate NOT_CHECKED', () => {
    const def = manifest.definitions['PX-V40-DEF-PI5'];
    expect(def.displayWithheld).toBeUndefined();
    expect(def.display.record.schema).toBe('picar-studio-display-check/1');
    const s2 = steps('rpi5')[1].displayChecks.find((c: any) => c.definitionId === 'PX-V40-DEF-PI5');
    expect(s2).toMatchObject({ status: 'CHECKED', closureRfc8785Sha256: steps('rpi5')[1].source.closureRfc8785Sha256 });
    expect(Math.max(...s2.overlaps.map((o: any) => o.volumeMm3))).toBeGreaterThan(440); // the 449 mm³ microphone finding
    expect(steps('rpi5')[8].displayChecks).toEqual([{ definitionId: 'PX-V40-DEF-PI5', status: 'NOT_CHECKED', overlaps: [] }]);
    for (const s of steps('rpi-zero-2-w')) expect(s.displayChecks).toEqual([]);
  });
  it('keeps parts without a verified installed pose in the tray in their part-local orientation', () => {
    const tray = manifest.variants.rpi5.tray.instances;
    const placedSomewhere = new Set(steps('rpi5').filter((s) => !s.candidatePlacements).flatMap((s) => Object.keys(s.placements)));
    for (const [id, t] of Object.entries<any>(tray)) expect(t.orientation).toBe(placedSomewhere.has(id) ? 'installed' : 'part-local');
    expect(tray['PX-V40-INS-PLATE-H-001'].orientation).toBe('part-local');
  });
});

describe('parts tray completeness (Studio 2)', () => {
  const read = (p: string) => JSON.parse(fs.readFileSync(path.resolve('..', p), 'utf8'));
  const stock = read('digital-twin/components/instances/planned-stock.json'), parts = read('digital-twin/components/definitions/parts.json');
  const tools = read('digital-twin/components/inventory/tools.json');
  const kinds = Object.fromEntries(read('digital-twin/validation/expected/m5/instructional-parameters.json').definitions.map((d: any) => [d.definitionId, d.recipe]));
  const classOf = Object.fromEntries(parts.map((d: any) => [d.id, d.componentClass]));
  // Derived here from the records, independently of the pack build: every instance S01-S09 introduce or use, and the
  // kit tools of each required tool category.
  const required = (v: string) => {
    const graph = read(`digital-twin/validation/m2/${v}/compiled-graph.json`), ids = new Set<string>();
    for (const s of graph.steps.slice(0, 9)) {
      for (const id of [...s.introducedInstanceIds, ...s.usedInstanceIds]) ids.add(id);
      for (const req of s.toolRequirementIds) {
        const category = tools.find((t: any) => t.id === req).category;
        for (const x of stock) if (x.variantIds.includes(v) && classOf[x.definitionId] === 'tool' && parts.find((d: any) => d.id === x.definitionId).name.toLowerCase().includes(category)) ids.add(x.id);
      }
    }
    return ids;
  };
  const defOf = Object.fromEntries(stock.map((s: any) => [s.id, s.definitionId]));
  const solid = (id: string) => classOf[defOf[id]] !== 'tool' && kinds[defOf[id]] !== 'schematic' && kinds[defOf[id]] !== 'abstract';
  it.each([['rpi5', 50, 44], ['rpi-zero-2-w', 47, 41]] as const)('%s: every required instance is drawn or a tile, none missing or extra (%i = %i + tiles)', (v, total, drawn) => {
    const tray = manifest.variants[v].tray, need = required(v);
    expect(need.size).toBe(total);
    expect(Object.keys(tray.instances).sort()).toEqual([...need].filter(solid).sort());
    expect(Object.keys(tray.tiles).sort()).toEqual([...need].filter((id) => !solid(id)).sort());
    expect(Object.keys(tray.instances).length).toBe(drawn);
    expect(Object.keys(tray.tiles).sort()).toEqual(['PX-V40-INS-HOOK-002', 'PX-V40-INS-LOOP-002', 'PX-V40-INS-RIBBON-FPC-001', 'PX-V40-INS-SCREWDRIVER-01-001', 'PX-V40-INS-SCREWDRIVER-02-001', 'PX-V40-INS-WRENCH-001']);
    expect(tray.inventory).toMatchObject({ required: total, modeled: drawn, tiles: total - drawn, canonical: 156, notRequired: 156 - total });
    // Groups partition the slots; identities stay per instance.
    expect(tray.groups.flatMap((g: any) => g.instanceIds).sort()).toEqual([...need].sort());
  });
  it('passes the independent tray audit: required = drawn + represented, nothing missing, duplicated or overlapping', () => {
    const out = fs.mkdtempSync(path.join(os.tmpdir(), 'tray-audit-'));
    execFileSync('node', [path.join(TOOLS, 'tray-audit.mjs'), '--label', 'test', '--out', out], { cwd: path.resolve('..') });
    const report = JSON.parse(fs.readFileSync(path.join(out, 'tray-audit-test.json'), 'utf8'));
    for (const v of ['rpi5', 'rpi-zero-2-w']) {
      expect(report.variants[v].invariant).toBe('HOLDS');
      expect(report.variants[v].counts).toMatchObject({ missingCount: 0, duplicateUnexpectedCount: 0, coincidentTrayPairs: 0 });
    }
    fs.rmSync(out, { recursive: true });
  });
  it('shows plain display names, keeping the registry name beside each', () => {
    for (const e of [...Object.values<any>(manifest.instances), ...Object.values<any>(manifest.schematic)]) {
      expect(e.name).not.toMatch(/unresolved|role|depicted|;/);
      expect(e.recordName).toBe(parts.find((d: any) => d.id === e.definitionId).name);
    }
  });
});

describe('private data exclusion', () => {
  it('contains no image bytes, private paths or photo references', () => {
    const text = Buffer.from(glbBytes).toString('latin1') + fs.readFileSync(path.join(PACK, 'manifest.json'), 'latin1');
    for (const marker of ['\x89PNG', '\xff\xd8\xff', 'JFIF', 'Exif', 'PiCar Plate Pictures', 'evidence/private', '.jpeg', '.jpg', 'source-vault']) expect(text.includes(marker), marker).toBe(false);
  });
});
