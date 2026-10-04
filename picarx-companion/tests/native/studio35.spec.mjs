import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const out = process.env.PICAR_NATIVE_EVIDENCE_DIR;
const controls = process.env.PICAR_STUDIO35_CONTROL_DIR;
if (!out || !controls) throw Error('STUDIO35_EVIDENCE_AND_CONTROL_REQUIRED');
const manifest = JSON.parse(fs.readFileSync('src/generated/studio/manifest.json'));
const HAT = 'PX-V40-INS-ROBOT-HAT-001', name = manifest.instances[HAT].name;
const record = (name, value) => fs.writeFileSync(path.join(out, name + '.json'), JSON.stringify(value, null, 2) + '\n');
const script = (action, ...args) => browser.tauri.execute(action, ...args);
async function open(v, n) {
  const base = (await browser.getUrl()).split('#')[0];
  await browser.url(base + `#/studio/${v}/${n}?diagnostics`);
  await browser.waitUntil(async () => await script(() => window.__studio?.state().key === location.hash.split('?')[0].slice(9) && window.__studio?.viewport()?.board()?.variant === window.__studio?.variant), { timeout: 30000 });
  await browser.waitUntil(async () => !(await $('.studio-build').getText()).includes('Opening saved'), { timeout: 30000 });
  await browser.pause(1000);
}
async function installed() {
  await $('[aria-label="Replay from the start"]').click();
  await browser.waitUntil(async () => await script(() => !window.__studio.state().playing && Math.abs(window.__studio.state().t - window.__studio.duration) < 0.02), { timeout: 15000 });
  await browser.pause(800);
}
async function selectHat() {
  // The Parts tray groups start collapsed; reveal the existing inventory row before the real click.
  await script(() => { const row = Array.from(document.querySelectorAll('.studio-parts button')).find(b => b.textContent.includes('Robot HAT')); const group = row?.closest('details'); if (group) group.open = true; });
  await $(`button*=${name}`).click();
  assert.equal(await script(() => window.__studio.state().selection), HAT);
}
async function frameHat() { await $('button=Frame part').click(); await browser.pause(1000); }
async function manual(phase) {
  record('native-manual-ready', { phase, boundedWaitMs: 300000 });
  const deadline = Date.now() + 300000;
  while (!fs.existsSync(path.join(controls, phase + '.done')) && Date.now() < deadline) await new Promise(resolve => setTimeout(resolve, 500));
  assert(fs.existsSync(path.join(controls, phase + '.done')), `Physical native phase ${phase} was not completed.`);
}
async function gpu() { return script(() => { const d = window.__studio, v = d.viewport(); return { owned: d.owned(), textures: v.gl.info.memory.textures, geometries: v.gl.info.memory.geometries, programs: v.gl.info.programs.length, roots: d.roots().length, hat: d.roots().find(r => r.id === 'PX-V40-INS-ROBOT-HAT-001') }; }); }
async function sample(label, orbit) {
  const value = await script(async (_tauri, orbit) => {
    const d = window.__studio, v = d.viewport(), ratios = [], intervals = [];
    let last = performance.now(), finish = false;
    const watch = () => { const now = performance.now(); intervals.push(now - last); last = now; ratios.push(v.gl.getPixelRatio()); if (!finish) requestAnimationFrame(watch); };
    requestAnimationFrame(watch);
    if (orbit) await v.frame(4);
    else {
      v.controls.dispatchEvent({ type: 'start' });
      for (let i = 0; i < 180; i++) { v.invalidate(); await new Promise(requestAnimationFrame); }
    }
    const result = { ...d.perf(), ratios: [...new Set(ratios)], intervalsMs: intervals.slice(-120), camera: d.camera(), state: d.state(), step: d.step, duration: d.duration, visible: document.visibilityState, sampleMethod: orbit ? 'existing diagnostic continuous orbit' : 'fixed guided camera, controlled active redraws via existing controls start/end events' };
    if (!orbit) v.controls.dispatchEvent({ type: 'end' });
    finish = true;
    return result;
  }, orbit);
  assert.equal(value.activeFrames, 120); assert.equal(value.visible, 'visible');
  record('native-performance-' + label, value);
  return value;
}
it('integrates the authored HAT in the actual native Studio with disposable SQLite and physical window evidence', async () => {
  await browser.waitUntil(async () => await script(() => typeof window.__picarM3Test?.studio35EarlierPhoto === 'function'));
  assert.deepEqual(await script(() => window.__picarM3Test.isolation()), { legacy: null, imports: 0 });
  await open('rpi5', 0);
  assert.equal(await script(() => window.__studio.packId), manifest.packId);
  const tray = await gpu(); assert.equal(tray.roots, 156); assert.equal(tray.hat.meshes, 32); assert.equal(tray.hat.triangles, 353540);
  await $('button=Start build session').click(); await browser.waitUntil(async () => (await $('.studio-build').getText()).includes('0/29'));
  await sample('A-full-tray', true);
  await selectHat(); await browser.saveScreenshot(path.join(out, 'native-parts-hat.png'));
  await manual('parts');
  await $('.studio-rail a[href="#/studio/rpi5/4"]').click();
  await browser.waitUntil(async () => await script(async () => (await window.__picarM3Test.studio('backup')).aggregates.find(a => a.aggregate.id === 'PX-STUDIO-RPI5').aggregate.snapshot.reviewStepId === 'PX-V40-STEP-04'));
  await open('rpi5', 4); await installed();
  await browser.saveScreenshot(path.join(out, 'native-pi5-s04-guided.png'));
  await sample('B-pi5-s04-guided', false);
  await manual('guided');
  await selectHat(); await frameHat();
  const inspector = await $('.studio-inspector').getText();
  assert(inspector.includes('825e2f068d')); assert(inspector.includes('bbdbbeb758')); assert(inspector.includes('Raspberry Pi 5'));
  record('native-hat-inspector', { instanceId: await script(() => window.__studio.state().selection), text: inspector });
  await browser.saveScreenshot(path.join(out, 'native-pi5-hat-framed.png'));
  // CUA clicks the visibly identified regions in actual app-window pixels. Clear each selection first.
  const picking = [];
  await script(() => { window.__studio35Clicks = []; document.addEventListener('click', e => window.__studio35Clicks.push({ x: e.clientX, y: e.clientY, target: e.target.tagName }), true); });
  for (const region of ['PCB', 'pin-field', 'speaker', 'connector', 'IC']) {
    await browser.keys('Escape');
    await browser.waitUntil(async () => await script(() => window.__studio.state().selection === null));
    await browser.pause(300);
    await manual('pick-' + region);
    const point = await script(() => window.__studio35Clicks.at(-1));
    assert.equal(point.target, 'CANVAS');
    const selected = await script(() => window.__studio.state().selection);
    assert.equal(selected, HAT, region); picking.push({ region, point, selectionBeforeClick: null, selected, input: 'CUA physical click in visibly identified native region' });
  }
  record('native-hat-picking', picking);
  await sample('C-close-hat-orbit', true);
  await frameHat();
  await manual('framed-low-underside');
  await $('[aria-label="Isolate"]').click();
  const isolated = await gpu(); assert(isolated.hat.drawn);
  await sample('D-isolated-hat', true);
  await $('[aria-label="Reset inspection"]').click();
  await $('[aria-label="Ghost others"]').click();
  await $('[aria-label="Explode"]').click();
  await $('[aria-label="Deck clip"]').click();
  await $('[aria-label="Reset inspection"]').click();
  const reset = await script(() => ({ state: window.__studio.state(), roots: window.__studio.roots(), inspection: window.__studio.inspection() }));
  assert.equal(reset.roots.filter(r => r.id === 'PX-V40-INS-ROBOT-HAT-001').length, 1);
  assert.equal(reset.roots.find(r => r.id === HAT).meshes, 32);
  record('native-inspection-reset', reset);
  const earlier = await script(() => window.__picarM3Test.studio35EarlierPhoto());
  await script(() => document.querySelector('.studio-build details').open = true);
  assert((await $('.studio-build').getText()).includes('Taken against an earlier digital revision'));
  const ledgerBefore = await script(() => window.__picarM3Test.studio('backup'));
  await script(() => window.__picarM3Test.studio('restart')); await browser.refresh();
  await browser.waitUntil(async () => (await $('.studio-build').getText()).includes('1 photos'));
  await script(() => document.querySelector('.studio-build details').open = true);
  assert((await $('.studio-build').getText()).includes('Taken against an earlier digital revision'));
  const photo = await script(() => window.__picarM3Test.studio('photoCheck')); assert.deepEqual(photo.record, earlier);
  const zipContainsOldPack = Buffer.from(photo.zip).toString().includes(earlier.packId);
  assert(zipContainsOldPack);
  record('native-earlier-observation', { record: earlier, syntheticOnly: true, earlierRevisionUi: 'PASS', reloadUnchanged: 'PASS', zipContainsOldPack });
  await open('rpi-zero-2-w', 4); await installed(); await selectHat();
  await browser.saveScreenshot(path.join(out, 'native-zero-s04-guided.png'));
  await manual('zero-guided');
  await open('rpi5', 4); await installed(); await selectHat();
  const base = await gpu();
  await script(() => { const b = window.__studio.viewport().board(), counts = [], root = b.roots.get('PX-V40-INS-ROBOT-HAT-001'), geometries = new Set(); root.traverse(o => { if (o.geometry) geometries.add(o.geometry); }); const instrument = (r, type) => { const row = { type, name: r.name ?? '', calls: 0 }; const dispose = r.dispose.bind(r); r.dispose = () => { row.calls++; dispose(); }; counts.push(row); }; for (const m of b.materials()) instrument(m, 'boardMaterial'); for (const g of geometries) instrument(g, 'packGeometry'); window.__studio35Disposals = counts; });
  for (let i = 0; i < 6; i++) { await open(i % 2 ? 'rpi5' : 'rpi-zero-2-w', 4); await installed(); await selectHat(); await $('[aria-label="Isolate"]').click(); await $('[aria-label="Reset inspection"]').click(); }
  const switched = await gpu(), disposals = await script(() => window.__studio35Disposals);
  assert(disposals.filter(r => r.type === 'boardMaterial').every(r => r.calls === 1)); assert(disposals.filter(r => r.type === 'packGeometry').every(r => r.calls === 0));
  assert.deepEqual(switched.owned, base.owned); assert.equal(switched.roots, 156); assert.equal(switched.textures, base.textures);
  for (let i = 0; i < 3; i++) { const url = (await browser.getUrl()).split('#')[0]; await browser.url(url + '#/reference'); await browser.pause(250); await open('rpi5', 4); await installed(); }
  const revisited = await gpu(); assert.deepEqual(revisited.owned, base.owned); assert.equal(revisited.textures, base.textures);
  record('native-resource-ownership', { base, switched, revisited, disposals, boardSwitches: 6, exitReentries: 3 });
  await open('rpi5', 0); await $('.studio-build a').click(); assert.equal(await script(() => window.__studio.step), 4);
  assert.deepEqual(await script(() => window.__picarM3Test.studio('backup')), ledgerBefore);
  record('native-build-session-read', { ledgerUnchanged: 'PASS', partsReturnStep: 4, sessionId: 'PX-STUDIO-RPI5' });
  await selectHat(); await frameHat();
  record('native-before-escape', { ledger: ledgerBefore, camera: await script(() => window.__studio.camera()) });
  await script(() => {
    const states = []; window.__studio35PhysicalStates = states;
    const timer = setInterval(() => {
      const s = window.__studio.state(), full = document.querySelector('.studio').dataset.fullscreen === 'true';
      const matches = [s.manualOpen && !!s.selection && full, !s.manualOpen && !!s.selection && full, !s.manualOpen && !s.selection && full, !s.manualOpen && !s.selection && !full];
      if (matches[states.length]) states.push({ label: 'ABCD'[states.length], manualOpen: s.manualOpen, selection: s.selection, fullscreen: full, visibility: document.visibilityState, atPerformanceMs: performance.now() });
      if (states.length === 4) clearInterval(timer);
    }, 25);
  });
  await manual('physical-escape');
  const physical = await script(() => window.__studio35PhysicalStates);
  assert.deepEqual(physical.map(s => s.label), ['A', 'B', 'C', 'D']);
  record('native-physical-states', { physicalNativeKeyInjection: 'CUA Escape, three separate calls', states: physical });
  const after = await script(async () => ({ state: window.__studio.state(), ledger: await window.__picarM3Test.studio('backup'), fullscreen: document.querySelector('.studio').dataset.fullscreen }));
  assert.equal(after.state.selection, null); assert.equal(after.state.manualOpen, false); assert.equal(after.fullscreen, 'false'); assert.deepEqual(after.ledger, ledgerBefore);
  record('native-run-result', { status: 'PASS', packId: manifest.packId, HAT: manifest.definitions['PX-V40-DEF-ROBOT-HAT'].display.artifact.sha256, physicalEscape: 'PASS', ownerDataUnopened: true });
});
