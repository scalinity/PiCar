import fs from 'node:fs';
import { expect, it } from 'vitest';
import { manifestProblems } from '../../src/features/assembly-3d/assets/pack-contract';
const manifest = JSON.parse(fs.readFileSync('src/generated/studio/manifest.json', 'utf8'));
const stock = JSON.parse(fs.readFileSync('../digital-twin/components/instances/planned-stock.json', 'utf8'));
it.each(['rpi5', 'rpi-zero-2-w'])('%s has exactly all applicable canonical stock, A-H, later parts and backups', variant => {
 const tray = manifest.variants[variant].tray;
 expect([...Object.keys(tray.instances), ...Object.keys(tray.tiles)].sort()).toEqual(stock.filter((s: any) => s.variantIds.includes(variant)).map((s: any) => s.id).sort());
 expect(tray.groups.find((g: any) => g.id === 'plates').instanceIds.map((id: string) => manifest.instances[id].definitionId).sort()).toEqual('ABCDEFGH'.split('').map(l => `PX-V40-DEF-PLATE-${l}`));
 for (const letter of 'ABCDEFGH') {
  const id = `PX-V40-INS-PLATE-${letter}-001`, slot = tray.instances[id];
  expect(slot.state).toBe('AH'.includes(letter) ? 'current' : 'later');
  expect(manifest.definitions[manifest.instances[id].definitionId].artifact.sha256).toMatch(/^[a-f0-9]{64}$/);
 }
 for (const s of stock.filter((s: any) => s.variantIds.includes(variant) && s.disposition === 'backup')) expect((tray.instances[s.id] ?? tray.tiles[s.id]).state).toBe('spare');
 expect(manifestProblems(manifest)).toEqual([]);
});
it('a later plate cannot become an invented Step 1 instruction', () => {
 const m = structuredClone(manifest);m.variants.rpi5.steps[0].stepParts.push({ instanceId: 'PX-V40-INS-PLATE-B-001', use: 'new' });
 expect(manifestProblems(m)).toContain('MANIFEST_STEP_PARTS_SOURCE rpi5 S01');
});
