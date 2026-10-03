import { expect, it } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { packIdPreimage } from '../../src/features/assembly-3d/assets/pack-contract';

function audit(change?: (m: any) => void) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'studio-tray-contract-'));
  try {
    const m = JSON.parse(fs.readFileSync('src/generated/studio/manifest.json', 'utf8'));
    change?.(m);
    m.packId = createHash('sha256').update(packIdPreimage(m)).digest('hex');
    const fixture = path.join(tmp, 'manifest.json');
    fs.writeFileSync(fixture, JSON.stringify(m));
    const result = spawnSync(process.execPath, ['../digital-twin/tools/studio/tray-audit.mjs', '--manifest', fixture, '--out', tmp], { encoding: 'utf8' });
    return { status: result.status, report: JSON.parse(fs.readFileSync(path.join(tmp, 'tray-audit-current.json'), 'utf8')) };
  } finally { fs.rmSync(tmp, { recursive: true }); }
}

it('independently accepts real stock identities and Pi5 50=44+6 / Zero 47=41+6', () => {
  const { status, report } = audit();
  expect(status).toBe(0);
  for (const [variant, required, modeled] of [['rpi5', 50, 44], ['rpi-zero-2-w', 47, 41]] as const) {
    expect(report.variants[variant].invariant).toBe('HOLDS');
    expect(report.variants[variant].counts).toMatchObject({ s01ToS09RequiredCount: required, rendered3DInstanceCount: modeled, nonRenderableRepresentedCount: 6 });
  }
});

it.each([
  ['Pi5 definition remapped to Zero', (m: any) => { m.instances['PX-V40-INS-PI5-001'].definitionId = 'PX-V40-DEF-ZERO2W'; }, 'PACK_IDENTITY_MISMATCH'],
  ['hardware remapped to another valid definition', (m: any) => { m.instances['PX-V40-INS-M25X18PLUS6-STANDOFF-001'].definitionId = 'PX-V40-DEF-M25X6-SCREW'; }, 'PACK_IDENTITY_MISMATCH'],
  ['tool remapped to another valid tool', (m: any) => { m.schematic['PX-V40-INS-WRENCH-001'].definitionId = 'PX-V40-DEF-SCREWDRIVER-01'; }, 'PACK_IDENTITY_MISMATCH'],
  ['compensated canonical total', (m: any) => { m.variants.rpi5.tray.inventory.canonical++; m.variants.rpi5.tray.inventory.notRequired++; }, 'PACK_INVENTORY_MISMATCH'],
  ['compensated required/model total', (m: any) => { const i = m.variants.rpi5.tray.inventory; i.required++; i.modeled++; i.notRequired--; }, 'PACK_INVENTORY_MISMATCH'],
  ['compensated modeled/tile total', (m: any) => { const i = m.variants.rpi5.tray.inventory; i.modeled--; i.tiles++; }, 'PACK_INVENTORY_MISMATCH'],
  ['spare total', (m: any) => { m.variants.rpi5.tray.inventory.spares++; }, 'PACK_INVENTORY_MISMATCH'],
  ['solid variant membership', (m: any) => { m.instances['PX-V40-INS-PI5-001'].variants.push('rpi-zero-2-w'); }, 'PACK_VARIANT_MISMATCH'],
  ['tool variant membership', (m: any) => { m.schematic['PX-V40-INS-WRENCH-001'].variants = ['rpi5']; }, 'PACK_VARIANT_MISMATCH'],
  ['required-use metadata', (m: any) => { m.variants.rpi5.tray.tiles['PX-V40-INS-WRENCH-001'].firstStep = 9; }, 'PACK_SLOT_USE_MISMATCH'],
])('rejects rehashed %s against independent source data', (_label, change, code) => {
  const { status, report } = audit(change as (m: any) => void);
  expect(status).toBe(3);
  expect(report.variants.rpi5.invariant).toBe('FAILS');
  expect(report.variants.rpi5.disagreements.some((d: any) => d.class === code)).toBe(true);
});

it('fails on a canonical use moved into S08 while the graph and pack remain stale', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'studio-tray-drift-'));
  try {
    const uses = JSON.parse(fs.readFileSync('../digital-twin/components/inventory/planned-uses.json', 'utf8'));
    const use = uses.find((u: any) => u.id === 'PX-V40-USE-M15X3-SCREW-RPI5-005');
    expect(use.stepId).toBe('PX-V40-STEP-13');
    use.stepId = 'PX-V40-STEP-08';
    const fixture = path.join(tmp, 'planned-uses.json');
    fs.writeFileSync(fixture, JSON.stringify(uses));
    const result = spawnSync(process.execPath, ['../digital-twin/tools/studio/tray-audit.mjs', '--planned-uses', fixture, '--out', tmp], { encoding: 'utf8' });
    expect(result.status).toBe(3);
    const report = JSON.parse(fs.readFileSync(path.join(tmp, 'tray-audit-current.json'), 'utf8'));
    expect(report.variants.rpi5.invariant).toBe('FAILS');
    expect(report.variants.rpi5.disagreements).toContainEqual({ class: 'PLANNED_REQUIRED_INSTANCE_MISSING', id: use.instanceId });
    expect(report.variants['rpi-zero-2-w'].invariant).toBe('HOLDS');
  } finally { fs.rmSync(tmp, { recursive: true }); }
});
