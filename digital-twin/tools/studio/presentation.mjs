// Blender presentation snapshot freshness. The pack ID identifies geometry and poses; a presentation snapshot (the .blend
// and its reference render) also depends on the stage and material configuration, the builder, the Blender build and the
// presentation-owned state kept between rebuilds. build_studio_scene.py records them in presentation-receipt.json and
// derives presentationId from them. CURRENT means the pack, the configuration, the builder, the .blend bytes and the
// render all still match the receipt; the presentation-owned state inside the .blend is re-checked by
// `studio.mjs blender --check`, which needs Blender.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import canonicalize from 'canonicalize';

export const RECEIPT = 'digital-twin/presentation/blender/presentation-receipt.json';
export const PRESENTATION_INPUTS = [
  'digital-twin/assemblies/v40/presentation/studio/stage.json',
  'digital-twin/presentation/materials/studio-materials.json',
  'digital-twin/presentation/blender/build_studio_scene.py',
];

export const sha256 = (bytes) => crypto.createHash('sha256').update(bytes).digest('hex');
// The same derivation as build_studio_scene.py: a domain tag and the canonical recipe (strings and integers only).
export const presentationId = (recipe) => sha256(`picar-studio:presentation\n${canonicalize(recipe)}`);

export function checkPresentation(root, packId) {
  const at = (p) => path.join(root, p);
  if (!fs.existsSync(at(RECEIPT))) return { status: 'UNVERIFIABLE', presentationId: null, problems: ['PRESENTATION_RECEIPT_MISSING'] };
  const receipt = JSON.parse(fs.readFileSync(at(RECEIPT)));
  const stale = [], missing = [];
  const file = (p, expected, code) => {
    if (!fs.existsSync(at(p))) { missing.push(`${code}_MISSING ${p}`); return; }
    const actual = sha256(fs.readFileSync(at(p)));
    if (actual !== expected) stale.push(`${code}_CHANGED ${p} expected=${expected} actual=${actual}`);
  };
  const recipe = receipt.recipe;
  if (presentationId(recipe) !== receipt.presentationId) stale.push('PRESENTATION_ID_MISMATCH');
  if (recipe.packId !== packId) stale.push(`PRESENTATION_PACK_STALE built=${recipe.packId} current=${packId}`);
  for (const p of PRESENTATION_INPUTS) file(p, recipe.inputs[p], 'PRESENTATION_INPUT');
  file(receipt.blend.path, receipt.blend.sha256, 'PRESENTATION_BLEND');
  if (receipt.render) file(receipt.render.path, receipt.render.sha256, 'PRESENTATION_RENDER');
  if (receipt.ownership?.unowned?.length) stale.push(`PRESENTATION_UNOWNED_OBJECTS ${receipt.ownership.unowned.join(', ')}`);
  return { status: stale.length ? 'STALE' : missing.length ? 'UNVERIFIABLE' : 'CURRENT', presentationId: receipt.presentationId, problems: [...stale, ...missing] };
}
