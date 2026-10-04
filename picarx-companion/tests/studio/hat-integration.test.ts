// Verify the final packed display and an exact earlier Studio 3 observation context.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { expect, it } from 'vitest';
import { observationRevision, poseHash, validateObservation, type StudioObservation } from '../../src/features/assembly-session/observation';
import { photoHash } from '../../src/platform/evidence';
import earlier from './accepted-studio3-hat-context.json';

const manifest = JSON.parse(fs.readFileSync('src/generated/studio/manifest.json', 'utf8'));
const { readGlb } = await import(pathToFileURL(path.resolve('../digital-twin/tools/studio/glb.mjs')).href) as { readGlb(b: Uint8Array): { json: any; read(i: number): Float32Array | Uint16Array | Uint32Array } };
const glb = readGlb(new Uint8Array(fs.readFileSync('src/generated/studio/parts.glb')));
const id = 'PX-V40-DEF-ROBOT-HAT', instance = 'PX-V40-INS-ROBOT-HAT-001';
const review = JSON.parse(fs.readFileSync('../digital-twin/assemblies/v40/presentation/instructional/hat-detail-display-review-02.json', 'utf8'));

it('packs the exact approved HAT as one definition with 32 finish primitives and every authored material', () => {
  const d = manifest.definitions[id], mesh = glb.json.meshes.find((m: any) => m.name === id);
  expect(d.display.artifact.sha256).toBe('825e2f068d41fac21ca1a32ebeae410f7c5aef4eb5d717b20c22b0c75777abda');
  expect(d.artifact.sha256).toBe('bbdbbeb758d724c52450902c427c872b6eb78eff59a89b698d76a54d86d8461a');
  expect(mesh.primitives).toHaveLength(32);
  expect(new Set(mesh.primitives.map((p: any) => p.extras.materialId)).size).toBe(19);
  expect(Object.entries(manifest.instances).filter(([, i]: any) => i.definitionId === id).map(([i]) => i)).toEqual([instance]);
  for (const p of mesh.primitives) expect(manifest.materials[p.extras.materialId]).toBeDefined();
});

it('keeps all 75 pin columns separate in the actual final GLB, on both sides of the board plane', () => {
  const mesh = glb.json.meshes.find((m: any) => m.name === id);
  const gold = mesh.primitives.find((p: any) => p.extras.materialId === 'contact-gold');
  const a = glb.read(gold.attributes.POSITION), above: number[][] = [];
  for (let i = 0; i < a.length; i += 3) {
    const cad = [a[i + 2] * 1000, a[i] * 1000, a[i + 1] * 1000];
    if (cad[2] > 4.2) above.push(cad);
  }
  const expected: number[][] = review.servo.banks.flatMap((b: any) => review.servo.columnsX[b.side].flatMap((x: number) => b.rows.map((j: number) => [x, review.servo.y0 + 2.54 * j])));
  for (const k of ['spi', 'i2c', 'uart']) review.headers[k].labels.forEach((_: string, i: number) => expected.push([review.headers[k].x0 + 2.54 * i, review.headers[k].y]));
  expect(expected).toHaveLength(75);
  const columns = expected.map(([x, y]: number[]) => above.filter(p => Math.hypot(p[0] - x, p[1] - y) < 0.46));
  for (const vertices of columns) {
    expect(vertices.length).toBeGreaterThanOrEqual(8);
    expect(Math.max(...vertices.map(p => p[2]))).toBeCloseTo(10.1, 3);
    for (const axis of [0, 1]) expect(Math.max(...vertices.map(p => p[axis])) - Math.min(...vertices.map(p => p[axis]))).toBeCloseTo(0.64, 3);
  }
  expect(columns.reduce((sum: number, v: number[][]) => sum + v.length, 0)).toBe(above.length);
  expect(manifest.definitions[id].boundsM.min[1]).toBeLessThan(-0.015);
});

it('retains the exact accepted Studio 3 observation as earlier evidence with unchanged pose/source/closure context', () => {
  const bytes = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10, 1]);
  const record = { ...earlier.context, id: 'TEST-EARLIER-HAT', sessionId: 'TEST-SESSION', createdAt: '2026-10-03T12:00:00.000Z', file: { sha256: photoHash(bytes), byteLength: bytes.length, mediaType: 'image/png', storageKey: 'evidence/TEST-SESSION/TEST-EARLIER-HAT' } } as StudioObservation;
  validateObservation(record);
  expect(observationRevision(record, manifest.packId)).toBe('Taken against an earlier digital revision');
  const s = manifest.variants.rpi5.steps[3];
  expect(poseHash(s.placements)).toBe(record.poseSha256);
  expect(s.source.sha256).toBe(record.sourceSha256);
  expect(s.source.closureRfc8785Sha256).toBe(record.closureSha256);
  for (const g of record.geometry) {
    const d = manifest.definitions[g.definitionId];
    expect(d.artifact.sha256).toBe(g.instructionalSha256);
    if (g.definitionId === id) expect(d.display.artifact.sha256).not.toBe(g.displayedSha256);
    else expect(d.display?.artifact.sha256 ?? null).toBe(g.displayedSha256);
  }
});
