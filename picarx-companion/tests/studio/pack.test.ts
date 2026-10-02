// Studio pack: identity, completeness, basis, readiness labelling and private-data exclusion.
// Reads the committed generated pack only; no chain run, owner data or network is needed.
import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
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
const { checkPack } = await load<{ checkPack(dir: string): { packId: string; problems: string[] } }>('studio.mjs');
const { readGlb } = await load<{ readGlb(b: Uint8Array): { json: any; read(i: number): Float32Array | Uint16Array | Uint32Array } }>('glb.mjs');

const manifest = JSON.parse(fs.readFileSync(path.join(PACK, 'manifest.json'), 'utf8'));
const glbBytes = new Uint8Array(fs.readFileSync(path.join(PACK, 'parts.glb')));
const glb = readGlb(glbBytes);

describe('pack identity and completeness', () => {
  it('recomputes the pack id and the GLB hash, and holds only the two pack files', () => {
    expect(checkPack(PACK)).toEqual({ packId: manifest.packId, problems: [] });
    expect(fs.readdirSync(PACK).sort()).toEqual(['manifest.json', 'parts.glb']);
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
  it.each(['rpi5', 'rpi-zero-2-w'])('%s: S01-S02 operable previews, S07 blocked relation, S09 refused candidate', (v) => {
    expect(steps(v).filter((s) => s.operable).map((s) => s.printedNumber)).toEqual([1, 2]);
    expect(steps(v)[6]).toMatchObject({ display: 'PREVIEW_BLOCKED_RELATION', operable: false });
    expect(steps(v)[6].blockers[0].id).toBe('UNFRAMED_TOUCHED_CABLE_END');
    expect(steps(v)[8]).toMatchObject({ display: 'REVIEW_REFUSED_CANDIDATE', operable: false, candidatePlacements: true });
    expect(steps(v)[8].conflicts.length).toBeGreaterThan(0);
    expect(steps(v)[7].dependencyWarnings.map((w: any) => w.printedNumber)).toContain(7);
    for (const s of steps(v)) expect(s.assembly).toMatchObject({ gate: 'G-INSTRUCTIONAL-ASSEMBLY', status: 'BLOCKED', admittedRows: 0, requiredRows: 58 });
  });
  it('keeps parts without a verified installed pose in the tray in their part-local orientation', () => {
    const tray = manifest.variants.rpi5.tray.instances;
    const placedSomewhere = new Set(steps('rpi5').filter((s) => !s.candidatePlacements).flatMap((s) => Object.keys(s.placements)));
    for (const [id, t] of Object.entries<any>(tray)) expect(t.orientation).toBe(placedSomewhere.has(id) ? 'installed' : 'part-local');
    expect(tray['PX-V40-INS-PLATE-H-001'].orientation).toBe('part-local');
  });
});

describe('private data exclusion', () => {
  it('contains no image bytes, private paths or photo references', () => {
    const text = Buffer.from(glbBytes).toString('latin1') + fs.readFileSync(path.join(PACK, 'manifest.json'), 'latin1');
    for (const marker of ['\x89PNG', '\xff\xd8\xff', 'JFIF', 'Exif', 'PiCar Plate Pictures', 'evidence/private', '.jpeg', '.jpg', 'source-vault']) expect(text.includes(marker), marker).toBe(false);
  });
});
