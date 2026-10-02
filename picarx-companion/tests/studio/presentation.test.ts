// Blender presentation identity (F6): a presentation snapshot is CURRENT only while its pack, stage and material
// configuration, builder, .blend bytes and render all match its receipt; any change makes it STALE.
import { beforeEach, describe, expect, it } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const P: any = await import(pathToFileURL(path.resolve('../digital-twin/tools/studio/presentation.mjs')).href);

let root = '';
const put = (rel: string, data: string) => { fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true }); fs.writeFileSync(path.join(root, rel), data); };
const sha = (rel: string) => P.sha256(fs.readFileSync(path.join(root, rel)));
const PACK = 'a'.repeat(64);

function fixture() {
  root = fs.mkdtempSync(path.join(os.tmpdir(), 'studio-presentation-'));
  for (const p of P.PRESENTATION_INPUTS) put(p, `${p} v1`);
  put('digital-twin/presentation/blender/picar-studio.blend', 'blend v1');
  put('digital-twin/presentation/blender/renders/r.png', 'png v1');
  const recipe = { packId: PACK, hero: { variant: 'rpi5', step: 2 }, inputs: Object.fromEntries(P.PRESENTATION_INPUTS.map((p: string) => [p, sha(p)])),
    blender: { version: '5.2.2 LTS', buildHash: 'b' }, presentationStateSha256: 'c'.repeat(64) };
  const receipt = { contract: 'picar-studio-presentation/1', presentationId: P.presentationId(recipe), recipe, presentation: { built: 'kept', removedUnowned: [] },
    ownership: { counts: {}, unowned: [] }, blend: { path: 'digital-twin/presentation/blender/picar-studio.blend', sha256: sha('digital-twin/presentation/blender/picar-studio.blend') },
    render: { path: 'digital-twin/presentation/blender/renders/r.png', sha256: sha('digital-twin/presentation/blender/renders/r.png') } };
  put(P.RECEIPT, JSON.stringify(receipt));
}
const check = (packId = PACK) => P.checkPresentation(root, packId);

describe('presentation snapshot', () => {
  beforeEach(fixture);
  it('is CURRENT while every recorded input matches', () => {
    expect(check()).toEqual({ status: 'CURRENT', presentationId: expect.stringMatching(/^[0-9a-f]{64}$/), problems: [] });
  });
  it('is STALE for a pack other than the one the .blend was built from', () => {
    expect(check('d'.repeat(64)).problems).toContain(`PRESENTATION_PACK_STALE built=${PACK} current=${'d'.repeat(64)}`);
  });
  it.each(['digital-twin/assemblies/v40/presentation/studio/stage.json', 'digital-twin/presentation/materials/studio-materials.json',
    'digital-twin/presentation/blender/build_studio_scene.py'])('is STALE once %s changes', (p) => {
    put(p, 'v2');
    const r = check();
    expect(r.status).toBe('STALE');
    expect(r.problems.some((x: string) => x.startsWith(`PRESENTATION_INPUT_CHANGED ${p}`))).toBe(true);
  });
  it('is STALE when the .blend was saved after its receipt', () => {
    put('digital-twin/presentation/blender/picar-studio.blend', 'blend edited');
    expect(check().problems.some((x: string) => x.startsWith('PRESENTATION_BLEND_CHANGED'))).toBe(true);
  });
  it('is STALE when the render is not the one the receipt names', () => {
    put('digital-twin/presentation/blender/renders/r.png', 'png v2');
    expect(check().problems.some((x: string) => x.startsWith('PRESENTATION_RENDER_CHANGED'))).toBe(true);
  });
  it('refuses a receipt whose recipe was edited after its identity was derived', () => {
    const receipt = JSON.parse(fs.readFileSync(path.join(root, P.RECEIPT), 'utf8'));
    receipt.recipe.hero.step = 3;
    put(P.RECEIPT, JSON.stringify(receipt));
    expect(check().problems).toContain('PRESENTATION_ID_MISMATCH');
  });
  it('is UNVERIFIABLE without a receipt', () => {
    fs.rmSync(path.join(root, P.RECEIPT));
    expect(check()).toMatchObject({ status: 'UNVERIFIABLE', problems: ['PRESENTATION_RECEIPT_MISSING'] });
  });
});
