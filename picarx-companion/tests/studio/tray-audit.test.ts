import { expect, it } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

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
