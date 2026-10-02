// The runtime enforces the pack contract before anything is drawn: canonical pack ID, GLB bytes by SHA-256 (never
// by length), manifest schema, and the GLB's one-identity-root-per-definition structure. Each negative case changes
// one thing and re-hashes everything else, so only the check under test can reject it.
import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import { packIdPreimage, validatePackBytes } from '../../src/features/assembly-3d/assets/pack-contract';

const manifestBytes = new Uint8Array(fs.readFileSync('src/generated/studio/manifest.json'));
const glbBytes = new Uint8Array(fs.readFileSync('src/generated/studio/parts.glb'));
const hex = async (b: Uint8Array): Promise<string> => Buffer.from(await crypto.subtle.digest('SHA-256', b)).toString('hex');
const encode = (o: unknown): Uint8Array => new TextEncoder().encode(JSON.stringify(o));

function splitGlb(bytes: Uint8Array): { json: any; bin: Uint8Array } {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const jsonLength = view.getUint32(12, true);
  const json = JSON.parse(new TextDecoder().decode(bytes.subarray(20, 20 + jsonLength)));
  return { json, bin: bytes.subarray(20 + jsonLength) }; // BIN chunk header and payload, unchanged
}
function joinGlb(json: unknown, binChunk: Uint8Array): Uint8Array {
  const text = new TextEncoder().encode(JSON.stringify(json));
  const padded = (text.byteLength + 3) & ~3;
  const out = new Uint8Array(20 + padded + binChunk.byteLength);
  const view = new DataView(out.buffer);
  view.setUint32(0, 0x46546c67, true); view.setUint32(4, 2, true); view.setUint32(8, out.byteLength, true);
  view.setUint32(12, padded, true); view.setUint32(16, 0x4e4f534a, true);
  out.set(text, 20); out.fill(0x20, 20 + text.byteLength, 20 + padded); out.set(binChunk, 20 + padded);
  return out;
}
// A manifest that is internally consistent with the given GLB: asset hash, size and pack ID all recomputed.
async function consistent(manifest: any, glb: Uint8Array): Promise<Uint8Array> {
  const m = { ...manifest, assets: { parts: { ...manifest.assets.parts, sha256: await hex(glb), bytes: glb.byteLength } } };
  m.packId = await hex(packIdPreimage(m));
  return encode(m);
}
const parsed = () => JSON.parse(new TextDecoder().decode(manifestBytes));
const problems = async (m: Uint8Array, g: Uint8Array) => (await validatePackBytes(m, g)).problems;

describe('runtime pack validation', () => {
  it('accepts the tracked pack', async () => {
    expect(await problems(manifestBytes, glbBytes)).toEqual([]);
  });

  it('rejects a different GLB of exactly the same byte length', async () => {
    const wrong = glbBytes.slice();
    const { bin } = splitGlb(wrong);
    const at = wrong.byteLength - bin.byteLength + 64; // inside the BIN payload: same length, different bytes
    wrong[at] ^= 0xff; wrong[at + 1] ^= 0xff;
    expect(wrong.byteLength).toBe(glbBytes.byteLength);
    expect(await problems(manifestBytes, wrong)).toContain('GLB_HASH_MISMATCH');
  });

  it('rejects a one-byte mutation of the GLB', async () => {
    const wrong = glbBytes.slice();
    wrong[wrong.byteLength - 1] ^= 0x01;
    expect(await problems(manifestBytes, wrong)).toContain('GLB_HASH_MISMATCH');
  });

  it('rejects a manifest whose pack ID does not match its canonical content', async () => {
    const m = parsed();
    m.timing = { ...m.timing, bringInS: m.timing.bringInS + 1 }; // content changed, packId kept
    expect(await problems(encode(m), glbBytes)).toContain('PACK_ID_MISMATCH');
  });

  it('rejects a duplicate definition node, even with every hash recomputed', async () => {
    const { json, bin } = splitGlb(glbBytes);
    json.nodes[1].name = json.nodes[0].name;
    json.nodes[1].extras.picarStudio.definitionId = json.nodes[0].name;
    const glb = joinGlb(json, bin);
    const result = await problems(await consistent(parsed(), glb), glb);
    expect(result.some((p) => p.startsWith('GLB_DUPLICATE_DEFINITION'))).toBe(true);
  });

  it('rejects a GLB that is missing a definition', async () => {
    const { json, bin } = splitGlb(glbBytes);
    const dropped = json.nodes.length - 1;
    json.scenes[0].nodes = json.scenes[0].nodes.filter((i: number) => i !== dropped);
    json.nodes.pop();
    const glb = joinGlb(json, bin);
    const result = await problems(await consistent(parsed(), glb), glb);
    expect(result.some((p) => p.startsWith('GLB_MISSING_DEFINITION'))).toBe(true);
  });

  it('rejects a definition root that carries a transform', async () => {
    const { json, bin } = splitGlb(glbBytes);
    json.nodes[0].translation = [0.01, 0, 0];
    const glb = joinGlb(json, bin);
    const result = await problems(await consistent(parsed(), glb), glb);
    expect(result.some((p) => p.startsWith('GLB_ROOT_TRANSFORM'))).toBe(true);
  });

  it('rejects a definition root with child nodes that could position hidden geometry', async () => {
    const { json, bin } = splitGlb(glbBytes);
    json.nodes[0].children = [1];
    const glb = joinGlb(json, bin);
    const result = await problems(await consistent(parsed(), glb), glb);
    expect(result.some((p) => p.startsWith('GLB_ROOT_CHILDREN'))).toBe(true);
  });

  it.each([['basis', 'RH-ZUP-XFORWARD'], ['unit', 'mm']])('rejects an unsupported %s', async (field, value) => {
    const m = { ...parsed(), [field]: value };
    const result = await problems(await consistent(m, glbBytes), glbBytes);
    expect(result.some((p) => p.startsWith(`MANIFEST_${field.toUpperCase()}`))).toBe(true);
  });

  it('rejects an unsupported contract version and an operable step that is not display-ready', async () => {
    const old = { ...parsed(), contract: 'picar-studio-pack/1' };
    expect((await problems(await consistent(old, glbBytes), glbBytes)).some((p) => p.startsWith('MANIFEST_CONTRACT'))).toBe(true);
    const m = parsed();
    Object.assign(m.variants.rpi5.steps[6], { mode: 'preview', operable: true }); // S07 is PREVIEW_BLOCKED_RELATION
    expect((await problems(await consistent(m, glbBytes), glbBytes)).some((p) => p.startsWith('MANIFEST_OPERABLE_NOT_READY'))).toBe(true);
  });

  // Studio 2: modes, the tray's tiles and groups, and step parts.
  const rejects = async (change: (m: any) => void, code: string) => {
    const m = parsed();
    change(m);
    expect(await problems(await consistent(m, glbBytes), glbBytes)).toContain(code);
  };
  it('refuses a step whose mode and operability disagree', () => rejects((m) => { m.variants.rpi5.steps[2].operable = false; }, 'MANIFEST_STEP rpi5 S03'));
  it('refuses review mode on a step that is not blocked or refused', () => rejects((m) => { Object.assign(m.variants.rpi5.steps[2], { mode: 'review', operable: false }); }, 'MANIFEST_REVIEW_DISPLAY rpi5 S03'));
  it('refuses an opened step without a guided camera', () => rejects((m) => { m.variants['rpi-zero-2-w'].steps[6].camera = null; }, 'MANIFEST_OPENED_CAMERA rpi-zero-2-w S07'));
  it('refuses a tray slot missing from every group, or listed twice', async () => {
    await rejects((m) => { const g = m.variants.rpi5.tray.groups.find((x: any) => x.id === 'tools'); g.instanceIds.pop(); }, 'MANIFEST_TRAY_GROUPS rpi5');
    await rejects((m) => { const g = m.variants.rpi5.tray.groups.find((x: any) => x.id === 'tools'); g.instanceIds.push(g.instanceIds[0]); }, 'MANIFEST_TRAY_GROUPS rpi5');
  });
  it('refuses a tile with no schematic entry, and a schematic entry that is also drawn', async () => {
    await rejects((m) => { delete m.schematic['PX-V40-INS-WRENCH-001']; }, 'MANIFEST_TRAY_TILE rpi5 PX-V40-INS-WRENCH-001');
    await rejects((m) => { m.schematic['PX-V40-INS-PLATE-A-001'] = { ...m.schematic['PX-V40-INS-WRENCH-001'] }; }, 'MANIFEST_SCHEMATIC_INSTANCE PX-V40-INS-PLATE-A-001');
  });
  it('refuses a step part that is neither drawn nor a tile, and a newly placed part with no placement', async () => {
    await rejects((m) => { m.variants.rpi5.steps[0].stepParts.push({ instanceId: 'PX-V40-INS-WHEEL-FRONT-001', use: 'new' }); }, 'MANIFEST_STEP_PARTS rpi5 S01');
    await rejects((m) => { m.variants.rpi5.steps[5].newlyPlacedInstanceIds.push('PX-V40-INS-BATTERY-001'); }, 'MANIFEST_NEWLY_PLACED rpi5 S06');
  });

  it('checks nothing past a manifest it cannot parse', async () => {
    const result = await problems(new TextEncoder().encode('{"packId":'), glbBytes);
    expect(result).toEqual(['MANIFEST_JSON']);
  });
});
