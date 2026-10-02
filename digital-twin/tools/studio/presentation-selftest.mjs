#!/usr/bin/env node
// Blender presentation identity self-test (F6). Works only on a scratch copy of a .blend (the tracked one by default);
// never writes a tracked file. The first two checks need a .blend holding objects outside the owned collections, such as
// the Studio 1 project (git show d8b9bd4:digital-twin/presentation/blender/picar-studio.blend). Needs Blender, so it is
// run on demand rather than in the unit suite:
//   node digital-twin/tools/studio/presentation-selftest.mjs <scratch dir> [<source .blend>]
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const BLENDER = '/Applications/Blender.app/Contents/MacOS/Blender';
const dir = path.resolve(process.argv[2] ?? fail('usage: presentation-selftest.mjs <scratch dir>'));
fs.mkdirSync(dir, { recursive: true });
const blend = path.join(dir, 'selftest.blend');
fs.copyFileSync(process.argv[3] ? path.resolve(process.argv[3]) : path.join(ROOT, 'digital-twin/presentation/blender/picar-studio.blend'), blend);
const results = [];
function fail(message) { throw Error(message); }
function expect(label, ok, detail = '') { results.push({ label, ok, detail }); console.log(`${ok ? 'PASS' : 'FAIL'} ${label}${detail ? ` (${detail})` : ''}`); }

function build(name, ...flags) {
  const receipt = path.join(dir, `${name}.receipt.json`);
  const r = spawnSync('node', [path.join(ROOT, 'digital-twin/tools/studio/studio.mjs'), 'blender', '--blend', blend, '--receipt', receipt,
    '--report', path.join(dir, `${name}.report.json`), '--renders', path.join(dir, 'renders'), ...flags], { cwd: ROOT, encoding: 'utf8' });
  const out = `${r.stdout}\n${r.stderr}`;
  return { status: r.status, out, receipt: fs.existsSync(receipt) && r.status === 0 ? JSON.parse(fs.readFileSync(receipt)) : null };
}
function blenderExpr(expr) {
  const r = spawnSync(BLENDER, [blend, '--background', '--factory-startup', '--python-expr', expr], { encoding: 'utf8' });
  return `${r.stdout}`.split('\n').filter((l) => l.startsWith('[selftest]')).join('\n');
}
const keyEnergy = () => Number(blenderExpr("import bpy; print('[selftest]', bpy.data.objects['LGT-studio-key'].data.energy)").split(' ')[1]);

// 1. The tracked .blend holds objects outside the owned collections: a run refuses them.
const refused = build('refused');
expect('a run refuses objects outside the owned collections', refused.status !== 0 && /UNOWNED_SCENE_OBJECT/.test(refused.out),
  (refused.out.match(/SCENE_OWNERSHIP[^\n]*/) ?? [''])[0].slice(0, 240));

// 2. An explicit clean-up removes them and lists every removal.
const cleaned = build('cleaned', '--remove-unowned');
expect('--remove-unowned deletes them and lists each in the receipt', cleaned.status === 0 && cleaned.receipt.presentation.removedUnowned.length > 0,
  cleaned.receipt?.presentation.removedUnowned.join(', '));

// 3. A plain rebuild keeps the presentation, reproduces the identity and does not duplicate source objects.
const again = build('again');
expect('a rebuild reproduces the same presentation identity', again.status === 0 && again.receipt.presentationId === cleaned.receipt.presentationId,
  again.receipt?.presentationId.slice(0, 12));
expect('source collections hold the same counts after rebuilds (no duplicates)', JSON.stringify(again.receipt?.ownership.counts) === JSON.stringify(cleaned.receipt.ownership.counts),
  JSON.stringify(again.receipt?.ownership.counts));
const checked = build('check-clean', '--check', '--receipt', path.join(dir, 'again.receipt.json'));
expect('--check accepts the .blend its receipt describes', checked.status === 0);

// 4. A deliberate presentation edit is detected as drift, survives a rebuild, and changes the identity.
const base = keyEnergy();
blenderExpr("import bpy; bpy.data.objects['LGT-studio-key'].data.energy *= 1.5; bpy.ops.wm.save_mainfile()");
const drift = spawnSync('node', [path.join(ROOT, 'digital-twin/tools/studio/studio.mjs'), 'blender', '--blend', blend, '--check', '--receipt', path.join(dir, 'again.receipt.json')], { cwd: ROOT, encoding: 'utf8' });
expect('--check reports an edit saved after the receipt', drift.status !== 0 && /PRESENTATION_STATE_CHANGED/.test(drift.stdout + drift.stderr));
const kept = build('kept');
expect('the edit survives a normal source rebuild', Math.abs(keyEnergy() - base * 1.5) < 1e-6, `key light ${base} W -> ${keyEnergy()} W`);
expect('and the presentation identity changes with it', kept.status === 0 && kept.receipt.presentationId !== again.receipt.presentationId, kept.receipt?.presentationId.slice(0, 12));

// 5. --reset-presentation rebuilds the presentation from the configuration and changes the identity again.
const reset = build('reset', '--reset-presentation');
expect('--reset-presentation restores the configured presentation', reset.status === 0 && Math.abs(keyEnergy() - base) < 1e-6, `key light ${keyEnergy()} W`);
expect('and changes the presentation identity', reset.receipt?.presentationId !== kept.receipt?.presentationId, reset.receipt?.presentationId.slice(0, 12));
expect('a reset presentation equals the configured one before the edit', reset.receipt?.recipe.presentationStateSha256 === again.receipt?.recipe.presentationStateSha256);

fs.writeFileSync(path.join(dir, 'selftest.json'), JSON.stringify({ results, receipts: { cleaned: cleaned.receipt, again: again.receipt, kept: kept.receipt, reset: reset.receipt } }, null, 1));
const failed = results.filter((r) => !r.ok).length;
console.log(`${results.length - failed} passed, ${failed} failed`);
process.exitCode = failed ? 1 : 0;
