import { expect, test, type Page } from '@playwright/test';
import fs from 'node:fs';

const manifest = JSON.parse(fs.readFileSync('src/generated/studio/manifest.json', 'utf8'));
test.beforeEach(async ({ page }) => { await page.route(/^(?!http:\/\/localhost:1420)/, (r) => r.abort()); });

type Diag = { state(): any; camera(): { position: number[]; target: number[]; aspect: number }; instance(id: string): { position: number[]; quaternion: number[] } | null; duration: number };
const diag = async <T>(page: Page, fn: (d: Diag) => T): Promise<T> => page.evaluate(`(${fn.toString()})(window.__studio)`) as Promise<T>;
async function open(page: Page, hash: string) {
  await page.goto('/' + hash);
  await page.waitForFunction(() => (window as any).__studio?.viewport() && (window as any).__studio.state().key !== '');
}
async function seekTo(page: Page, t: number) {
  await page.locator('.studio-rule input').fill(String(t));
  await page.waitForFunction((x) => (window as any).__studio.state().t === x && !(window as any).__studio.state().playing, t);
  await page.evaluate(() => new Promise(requestAnimationFrame));
  await page.evaluate(() => new Promise(requestAnimationFrame));
}
const close = (a: number[], b: number[], tol: number) => a.every((v, i) => Math.abs(v - b[i]) < tol);

test('S02 on the Pi 5 plays and ends exactly on the closure poses', async ({ page }) => {
  await open(page, '#/studio/rpi5/2');
  const duration = await diag(page, (d) => d.duration);
  expect(duration).toBeGreaterThan(0);
  await seekTo(page, duration);
  for (const [id, pose] of Object.entries<any>(manifest.variants.rpi5.steps[1].placements)) {
    const live = await page.evaluate((instanceId) => (window as any).__studio.instance(instanceId), id);
    expect(close(live.position, pose.translationM, 1e-9), id).toBe(true);
    const q = pose.rotationXYZW, sign = Math.sign(live.quaternion[3] * q[3] + live.quaternion[0] * q[0] + live.quaternion[1] * q[1] + live.quaternion[2] * q[2]) || 1;
    expect(close(live.quaternion.map((v: number) => v * sign), q, 1e-9), id).toBe(true);
  }
  await seekTo(page, 0);
  const board = await diag(page, (d) => d.instance('PX-V40-INS-PI5-001'));
  expect(close(board!.position, manifest.variants.rpi5.tray.instances['PX-V40-INS-PI5-001'].translationM, 1e-9)).toBe(true);
});

test('collapsing instructions and resizing keep the camera; the canvas fills the viewport', async ({ page }) => {
  await open(page, '#/studio/rpi5/1');
  await seekTo(page, await diag(page, (d) => d.duration));
  await page.waitForTimeout(1100); // guided camera settles
  const before = await diag(page, (d) => d.camera());
  await page.getByRole('button', { name: 'Hide instructions' }).click();
  await expect(page.locator('.studio-drawer')).toHaveAttribute('data-open', 'false');
  const collapsed = await diag(page, (d) => d.camera());
  expect(collapsed.position).toEqual(before.position);
  expect(collapsed.target).toEqual(before.target);
  await page.setViewportSize({ width: 1100, height: 700 });
  await page.waitForTimeout(300);
  const resized = await diag(page, (d) => d.camera());
  expect(close(resized.position, before.position, 1e-12) && close(resized.target, before.target, 1e-12)).toBe(true);
  // The camera frames the canvas area the panels leave uncovered; the canvas is a window around that frame.
  const insets = await page.evaluate(() => (window as any).__studio.inspection().insets as number[]);
  const [l, t, r, bottom] = insets, vw = 1100 - l - r, vh = 700 - t - bottom;
  expect(resized.aspect).toBeCloseTo(vw / vh, 3);
  expect((resized as any).view).toMatchObject({ enabled: true, fullWidth: vw, fullHeight: vh, offsetX: -l, offsetY: -t, width: 1100, height: 700 });
  const box = await page.locator('.studio-viewport canvas').boundingBox();
  expect([box!.width, box!.height]).toEqual([1100, 700]);
  await page.getByRole('button', { name: 'Show instructions' }).click();
  await expect(page.locator('.studio-drawer')).toHaveAttribute('data-open', 'true');
});

test('fullscreen enters and leaves through the browser Fullscreen API', async ({ page, browserName }) => {
  await open(page, '#/studio/rpi5/0');
  test.skip(!(await page.evaluate(() => document.fullscreenEnabled)), `${browserName} headless reports fullscreen unavailable`);
  await page.getByRole('button', { name: /Enter fullscreen/ }).click();
  await page.waitForFunction(() => document.fullscreenElement !== null);
  await expect(page.getByRole('button', { name: 'Exit fullscreen' })).toBeVisible();
  await page.getByRole('button', { name: 'Exit fullscreen' }).click();
  await page.waitForFunction(() => document.fullscreenElement === null);
});

test('readiness is labelled: every step opens, S07 and S09 in Review, and M7 acceptance is stated separately', async ({ page }) => {
  await open(page, '#/studio/rpi5/7');
  await expect(page.locator('.studio-notice')).toHaveCount(0);
  await expect(page.locator('.studio-mode-chip')).toHaveText('Review');
  await expect(page.locator('.studio-truths')).toContainText('M7 has accepted 0 of 58 steps');
  await expect(page.locator('.studio-truths')).toContainText('never marks a step done');
  await expect(page.locator('.studio-rail a')).toHaveText(['Parts', '1', '2', '3', '4', '5', '6', '7', '8', '9']);
  await expect(page.locator('.studio-rail a[data-mode="review"]')).toHaveText(['7', '9']);
  await expect(page.locator('.studio-rail-later')).toHaveCount(0);
});

test('selecting a part shows its source identity', async ({ page }) => {
  await open(page, '#/studio/rpi5/2');
  await page.getByRole('button', { name: /USB mini microphone/ }).click();
  await expect(page.locator('.studio-inspector')).toContainText('PX-V40-INS-USB-MICROPHONE-001');
  await expect(page.locator('.studio-inspector')).toContainText('M5 instructional proxy');
  await page.keyboard.press('Escape');
  await expect(page.locator('.studio-inspector')).toHaveCount(0);
});

test('playback, scrubbing, replay and selection record no progress', async ({ page }) => {
  await open(page, '#/studio/rpi5/1');
  const snapshot = () => page.evaluate(async () => {
    const legacy = JSON.parse(localStorage.getItem('picarx.v1') ?? '{}');
    const dbs = await indexedDB.databases();
    const counts: Record<string, number> = {};
    for (const { name } of dbs) {
      if (!name) continue;
      const db = await new Promise<IDBDatabase>((ok, no) => { const r = indexedDB.open(name); r.onsuccess = () => ok(r.result); r.onerror = () => no(r.error); });
      for (const store of Array.from(db.objectStoreNames)) counts[`${name}/${store}`] = await new Promise<number>((ok) => { const r = db.transaction(store).objectStore(store).count(); r.onsuccess = () => ok(r.result); });
      db.close();
    }
    return { steps: legacy.steps ?? null, checks: legacy.checks ?? null, counts };
  });
  const before = await snapshot();
  await page.getByRole('button', { name: 'Replay from the start' }).click();
  await page.waitForTimeout(600);
  await seekTo(page, 1.2);
  await page.getByRole('button', { name: 'Rewind' }).click();
  await page.waitForTimeout(400);
  await page.locator('.studio-rail a', { hasText: '2' }).click();
  await page.getByRole('button', { name: /M2.5x18 standoff/ }).first().click();
  await seekTo(page, await diag(page, (d) => d.duration));
  expect(await snapshot()).toEqual(before);
});

// ---- Cross-variant selection (F3): selection never outlives its part, and framing never reaches a missing object.
const errorsOf = (page: Page): string[] => { const errors: string[] = []; page.on('pageerror', (e) => errors.push(e.message)); return errors; };
async function switchBoard(page: Page, short: string, key: string) {
  await page.locator('.studio-boards a', { hasText: short }).click();
  await page.waitForFunction((k) => (window as any).__studio.state().key === k, key);
  await page.evaluate(() => new Promise(requestAnimationFrame));
}

for (const [from, to, board, short, toKey] of [
  ['rpi5', 'rpi-zero-2-w', 'PX-V40-INS-PI5-001', 'Zero 2 W', 'rpi-zero-2-w/2'],
  ['rpi-zero-2-w', 'rpi5', 'PX-V40-INS-ZERO2W-001', 'Pi 5', 'rpi5/2'],
] as const) {
  test(`selecting the ${from} board and switching to ${to} clears the selection; framing stays safe`, async ({ page }) => {
    const errors = errorsOf(page);
    await open(page, `#/studio/${from}/2`);
    await page.getByRole('button', { name: manifest.instances[board].name }).click();
    await expect(page.locator('.studio-inspector')).toContainText(board);
    await switchBoard(page, short, toKey);
    expect(await diag(page, (d) => d.state().selection)).toBeNull();
    await expect(page.locator('.studio-inspector')).toHaveCount(0);
    await page.keyboard.press('f');
    await page.evaluate(() => new Promise(requestAnimationFrame));
    await expect(page.getByRole('button', { name: 'Frame part' })).toBeDisabled();
    expect(errors).toEqual([]);
  });
}

test('a part common to both boards keeps its selection, highlight and framing across a board switch', async ({ page }) => {
  const errors = errorsOf(page);
  await open(page, '#/studio/rpi5/1');
  await page.getByRole('button', { name: manifest.instances['PX-V40-INS-PLATE-A-001'].name }).click();
  await page.evaluate(() => new Promise(requestAnimationFrame));
  expect(await diag(page, (d) => (d as any).highlighted('PX-V40-INS-PLATE-A-001'))).toBe(true);
  await switchBoard(page, 'Zero 2 W', 'rpi-zero-2-w/1');
  expect(await diag(page, (d) => d.state().selection)).toBe('PX-V40-INS-PLATE-A-001');
  expect(await diag(page, (d) => (d as any).highlighted('PX-V40-INS-PLATE-A-001'))).toBe(true);
  await seekTo(page, await diag(page, (d) => d.duration)); // the switch restarts playback; frame the placed part, not a moving one
  await page.getByRole('button', { name: 'Frame part' }).click();
  await page.waitForTimeout(900); // the 0.7 s focus tween
  // Framing aims at the part's world bounding-box centre: the definition's bounds centre carried through its pose.
  const target = (await diag(page, (d) => d.camera())).target;
  const plate = await diag(page, (d) => d.instance('PX-V40-INS-PLATE-A-001'));
  const b = manifest.definitions['PX-V40-DEF-PLATE-A'].boundsM, c = b.min.map((v: number, i: number) => (v + b.max[i]) / 2);
  const [x, y, z, w] = plate!.quaternion, [cx, cy, cz] = c;
  const tx = 2 * (y * cz - z * cy), ty = 2 * (z * cx - x * cz), tz = 2 * (x * cy - y * cx);
  const centre = [cx + w * tx + (y * tz - z * ty), cy + w * ty + (z * tx - x * tz), cz + w * tz + (x * ty - y * tx)].map((v, i) => v + plate!.position[i]);
  expect(Math.hypot(...target.map((v, i) => v - centre[i]))).toBeLessThan(0.002);
  expect(errors).toEqual([]);
});

test('rapid board switching with a selection raises no error', async ({ page }) => {
  const errors = errorsOf(page);
  await open(page, '#/studio/rpi5/2');
  await page.getByRole('button', { name: manifest.instances['PX-V40-INS-PI5-001'].name }).click();
  for (let i = 0; i < 6; i++) {
    await page.locator('.studio-boards a', { hasText: i % 2 ? 'Pi 5' : 'Zero 2 W' }).click();
    await page.keyboard.press('f');
  }
  await switchBoard(page, 'Zero 2 W', 'rpi-zero-2-w/2');
  await page.waitForTimeout(300);
  expect(errors).toEqual([]);
});

// ---- Persistence boundary (F2): Studio browsing is presentation state, never a Setup write.
test('Studio navigation, playback and selection never write or invalidate setup progress (M3 persistence)', async ({ page }) => {
  const store = () => page.evaluate(async () => {
    const s = (await import('/src/features/assembly-session/store.ts' as string)).getStore();
    return { initialized: s.initialized, pending: s.pending, error: s.error, setup: s.setup };
  });
  const settled = async () => { await expect.poll(async () => { const s = await store(); return s.initialized && !s.pending; }).toBe(true); return store(); };
  const go = async (hash: string) => { await page.evaluate((h) => { location.hash = h; }, hash); };
  await page.goto('/#/wizard/power');
  await settled();
  await page.evaluate(async () => { const p = await import('/src/lib/progress-store.ts' as string); p.setStepDone('parts', true); });
  await expect.poll(async () => (await store()).setup.steps.parts).toBe('done');
  await settled();
  await page.evaluate(async () => { const p = await import('/src/lib/progress-store.ts' as string); p.toggleCheck('power.safe'); });
  await expect.poll(async () => (await store()).setup.checks['power.safe']).toBe(true);
  await go('#/reference');
  await expect.poll(async () => (await store()).setup.lastRoute).toBe('#/reference');
  const before = (await settled()).setup;
  for (const hash of ['#/studio/rpi5/1', '#/studio/rpi5/2', '#/studio/rpi-zero-2-w/2', '#/studio/rpi-zero-2-w/0', '#/studio']) {
    await go(hash);
    await page.waitForFunction(() => (window as any).__studio?.viewport());
    const s = await settled();
    expect(s.error, hash).toBe('');
    expect(s.setup, hash).toEqual(before);
  }
  await go('#/studio/rpi5/1');
  await page.waitForFunction(() => (window as any).__studio?.state().key === 'rpi5/1');
  await page.getByRole('button', { name: 'Replay from the start' }).click();
  await seekTo(page, 1.2);
  await page.getByRole('button', { name: manifest.instances['PX-V40-INS-PLATE-A-001'].name }).click();
  expect((await settled()).error).toBe('');
  await go('#/videos');
  await expect.poll(async () => (await store()).setup.lastRoute).toBe('#/videos');
  const after = await settled();
  expect(after.error).toBe('');
  expect({ ...after.setup, lastRoute: before.lastRoute }).toEqual(before);
});

// ---- Runtime pack contract (F5): bytes are verified before anything is decoded or drawn.
test('a GLB of the right length but the wrong bytes is refused before drawing', async ({ page }) => {
  const glb = fs.readFileSync('src/generated/studio/parts.glb');
  const wrong = Buffer.from(glb);
  wrong[wrong.length - 64] ^= 0xff;
  await page.route(/\/src\/generated\/studio\/parts\.glb$/, (r) => r.fulfill({ status: 200, contentType: 'model/gltf-binary', body: wrong }));
  await page.goto('/#/studio/rpi5/1');
  await expect(page.getByRole('heading', { name: 'Assembly Studio could not open' })).toBeVisible();
  await expect(page.getByRole('alert')).toContainText('GLB_HASH_MISMATCH');
  expect(await page.locator('.studio-viewport canvas').count()).toBe(0);
});

// ---- Camera ownership (F7): only the user, an explicit focus/reset or a resumed guided view moves the target.
test('a manually panned target survives resize, pixel-ratio changes and fullscreen until guided view resumes', async ({ page }) => {
  await open(page, '#/studio/rpi5/1');
  await seekTo(page, await diag(page, (d) => d.duration));
  await page.waitForTimeout(1100); // guided camera settles
  const guided = manifest.variants.rpi5.steps[0].camera.targetM;
  const b = (await page.locator('.studio-viewport canvas').boundingBox())!;
  const [cx, cy] = [b.x + b.width / 2, b.y + b.height / 2];
  await page.mouse.move(cx, cy);
  await page.mouse.down({ button: 'right' }); // OrbitControls pans on the right button
  await page.mouse.move(cx + 140, cy + 70, { steps: 10 });
  await page.mouse.up({ button: 'right' });
  // The pan's inertia runs to completion: wait until the target has stopped moving.
  let panned = (await diag(page, (d) => d.camera())).target;
  await expect.poll(async () => {
    await page.waitForTimeout(400);
    const now = (await diag(page, (d) => d.camera())).target, moved = Math.hypot(...now.map((v, i) => v - panned[i]));
    panned = now;
    return moved;
  }, { timeout: 10000 }).toBe(0);
  expect(Math.hypot(...panned.map((v, i) => v - guided[i]))).toBeGreaterThan(0.005);
  expect(await diag(page, (d) => d.state().cameraMode)).toBe('manual');
  const still = async (why: string) => {
    await page.waitForTimeout(300);
    const t = (await diag(page, (d) => d.camera())).target;
    expect(Math.hypot(...t.map((v, i) => v - panned[i])), `${why}: target moved (m)`).toBeLessThan(1e-6);
  };
  await page.setViewportSize({ width: 1100, height: 700 });
  await still('resize');
  await page.evaluate(() => (window as any).__studio.viewport().setDpr(2));
  await still('pixel ratio 2');
  await page.evaluate(() => (window as any).__studio.viewport().setDpr(1));
  await still('pixel ratio 1');
  if (await page.evaluate(() => document.fullscreenEnabled)) {
    await page.getByRole('button', { name: /Enter fullscreen/ }).click();
    await page.waitForFunction(() => document.fullscreenElement !== null);
    await still('enter fullscreen');
    await page.getByRole('button', { name: 'Exit fullscreen' }).click();
    await page.waitForFunction(() => document.fullscreenElement === null);
    await still('exit fullscreen');
  }
  await page.getByRole('button', { name: 'Resume guided view' }).click();
  await page.waitForTimeout(1200);
  expect(close((await diag(page, (d) => d.camera())).target, guided, 1e-6), 'guided view resumed on request').toBe(true);
});

// ---- Escape (F8): one physical press performs at most one action.
// The Studio's own handling, with dispatched events (no user-agent default action), in both engines.
test('a held Escape press (repeats, long hold) with a selection clears only the selection; a separate press leaves fullscreen', async ({ page, browserName }) => {
  const errors = errorsOf(page);
  await open(page, '#/studio/rpi5/2');
  test.skip(!(await page.evaluate(() => document.fullscreenEnabled)), `${browserName} headless reports fullscreen unavailable`);
  const key = (type: 'keydown' | 'keyup', repeat = false) => page.evaluate(([t, r]) => window.dispatchEvent(new KeyboardEvent(t as string, { key: 'Escape', repeat: r as boolean })), [type, repeat]);
  await page.getByRole('button', { name: manifest.instances['PX-V40-INS-PI5-001'].name }).click();
  await page.getByRole('button', { name: /Enter fullscreen/ }).click();
  await page.waitForFunction(() => document.fullscreenElement !== null);
  await key('keydown');
  for (let i = 0; i < 4; i++) await key('keydown', true);
  await page.waitForTimeout(700);
  await key('keyup');
  await page.waitForTimeout(300);
  expect(await diag(page, (d) => d.state().selection)).toBeNull();
  expect(await page.evaluate(() => document.fullscreenElement !== null), 'the same press must not also leave fullscreen').toBe(true);
  await key('keydown');
  await key('keyup');
  await page.waitForFunction(() => document.fullscreenElement === null);
  expect(errors).toEqual([]);
});

// The same with physical key presses. WebKit leaves element fullscreen on a physical Escape by itself, as the Fullscreen
// specification requires of a user agent, so there the press is the browser's before it is the Studio's.
test('a physically held Escape with a selection clears only the selection; a separate press leaves fullscreen', async ({ page, browserName }) => {
  test.skip(browserName === 'webkit', 'WebKit exits element fullscreen on a physical Escape itself (user-agent behaviour, outside the page)');
  const errors = errorsOf(page);
  await open(page, '#/studio/rpi5/2');
  test.skip(!(await page.evaluate(() => document.fullscreenEnabled)), `${browserName} headless reports fullscreen unavailable`);
  const selection = () => diag(page, (d) => d.state().selection);
  await page.getByRole('button', { name: manifest.instances['PX-V40-INS-PI5-001'].name }).click();
  await page.getByRole('button', { name: /Enter fullscreen/ }).click();
  await page.waitForFunction(() => document.fullscreenElement !== null);
  await page.keyboard.down('Escape');
  for (let i = 0; i < 4; i++) await page.keyboard.down('Escape'); // auto-repeat while held
  await page.waitForTimeout(700); // held well past any timing threshold
  await page.keyboard.up('Escape');
  await page.waitForTimeout(300);
  expect(await selection()).toBeNull();
  expect(await page.evaluate(() => document.fullscreenElement !== null), 'the same press must not also leave fullscreen').toBe(true);
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => document.fullscreenElement === null);
  await expect(page.getByRole('button', { name: /Enter fullscreen/ })).toBeVisible();
  expect(errors).toEqual([]);
});

test('an Escape keyup whose keydown never arrived (native fullscreen) acts once', async ({ page }) => {
  await open(page, '#/studio/rpi5/2');
  await page.getByRole('button', { name: manifest.instances['PX-V40-INS-PI5-001'].name }).click();
  await page.evaluate(() => window.dispatchEvent(new KeyboardEvent('keyup', { key: 'Escape' })));
  expect(await diag(page, (d) => d.state().selection)).toBeNull();
});

// ---- GPU resources (F10): board switches and Studio visits release what they own.
const gpu = (page: Page) => page.evaluate(() => {
  const s = (window as any).__studio, vp = s.viewport();
  return { textures: vp.gl.info.memory.textures, geometries: vp.gl.info.memory.geometries, programs: vp.gl.info.programs.length,
    owned: typeof s.owned === 'function' ? s.owned() : 'no ownership registry' };
});
test('board switches and Studio visits do not accumulate GPU resources', async ({ page }) => {
  const errors = errorsOf(page);
  await open(page, '#/studio/rpi5/1');
  await seekTo(page, await diag(page, (d) => d.duration));
  const base = await gpu(page);
  for (let i = 0; i < 6; i++) {
    await switchBoard(page, i % 2 ? 'Pi 5' : 'Zero 2 W', i % 2 ? 'rpi5/1' : 'rpi-zero-2-w/1');
    await seekTo(page, await diag(page, (d) => d.duration));
  }
  const switched = await gpu(page);
  expect(switched.textures, 'shadow maps and environment are not left behind').toBe(base.textures);
  expect(switched.programs).toBeLessThanOrEqual(base.programs);
  expect(switched.owned).toEqual(base.owned);
  for (let i = 0; i < 3; i++) {
    await page.evaluate(() => { location.hash = '#/reference'; });
    await expect(page.locator('.studio')).toHaveCount(0);
    await page.evaluate(() => { location.hash = '#/studio/rpi5/1'; });
    await page.waitForFunction(() => (window as any).__studio?.viewport() && (window as any).__studio.state().key === 'rpi5/1');
    await seekTo(page, await diag(page, (d) => d.duration));
  }
  const revisited = await gpu(page);
  expect(revisited.owned, 'each visit releases what it owned').toEqual(base.owned);
  expect(revisited.textures).toBe(base.textures);
  expect(errors).toEqual([]);
});

// ---- Performance instrumentation (F9): marks in their real order; only active stretches are frame time.
test('the first frame drawn follows the first render, which follows canvas creation; idle time adds no frames', async ({ page }) => {
  await open(page, '#/studio/rpi5/2');
  const perf = () => diag(page, (d) => (d as any).perf());
  await page.waitForFunction(() => (window as any).__studio.perf().openToFirstFrameDrawnMs !== undefined);
  const p = await perf();
  expect(p.openToCanvasMs).toBeGreaterThan(0);
  expect(p.openToFirstRenderMs).toBeGreaterThanOrEqual(p.openToCanvasMs);
  expect(p.openToFirstFrameDrawnMs).toBeGreaterThan(p.openToFirstRenderMs);
  await page.getByRole('button', { name: 'Replay from the start' }).click();
  await page.waitForTimeout(1500);
  expect((await perf()).activeFrames, 'playback is an active stretch').toBeGreaterThan(20);
  await seekTo(page, await diag(page, (d) => d.duration)); // paused: nothing asks for frames
  const before = (await perf()).activeFrames;
  await page.waitForTimeout(1500);
  await page.getByRole('button', { name: /Raspberry Pi 5/ }).click(); // one isolated redraw (a selection) after the idle wait
  await page.evaluate(() => new Promise(requestAnimationFrame));
  expect((await perf()).activeFrames, 'an idle wait and an isolated redraw add no frame time').toBe(before);
  await page.keyboard.press('p');
  await expect(page.locator('.studio-perf')).toContainText('active frames');
  await expect(page.locator('.studio-perf')).toContainText('first frame drawn');
});

// ---- Inspector trust (F11): the displayed shape and the checked shape are both identified; fidelity is a named subset.
test('the inspector identifies the displayed and the checked Pi 5 shapes and reports fidelity as a classified subset', async ({ page }) => {
  await open(page, '#/studio/rpi5/2');
  const pi5 = manifest.definitions['PX-V40-DEF-PI5'];
  await page.getByRole('button', { name: manifest.instances['PX-V40-INS-PI5-001'].name }).click();
  const inspector = page.locator('.studio-inspector');
  await expect(inspector.locator('[data-artifact="displayed"] code')).toHaveAttribute('title', pi5.display.artifact.sha256);
  await expect(inspector.locator('[data-artifact="checked"] code')).toHaveAttribute('title', pi5.artifact.sha256);
  await expect(inspector).toContainText('Matched reference features');
  await expect(inspector).toContainText('25 of 33');
  await expect(inspector).toContainText('micro HDMI 0');
  await expect(inspector).toContainText('449 mm³'); // the known microphone overlap in this state
  await page.getByRole('button', { name: manifest.instances['PX-V40-INS-USB-MICROPHONE-001'].name }).click();
  await expect(inspector.locator('[data-artifact="displayed"]')).toHaveCount(0);
  await expect(inspector.locator('[data-artifact="checked"] code')).toHaveAttribute('title', manifest.definitions['PX-V40-DEF-USB-MICROPHONE'].artifact.sha256);
  await expect(inspector).toContainText('Shown and checked as this shape');
});

test('the companion pages remain reachable from the Studio', async ({ page }) => {
  await open(page, '#/studio');
  await page.getByRole('link', { name: 'Reference' }).click();
  await expect(page).toHaveURL(/#\/reference/);
  await expect(page.locator('.topbar')).toBeVisible();
  await page.getByRole('link', { name: 'Studio' }).click();
  await expect(page.locator('.studio')).toBeVisible();
});

// ==== Studio 2: the complete tray, every step on both boards, review states, inspection and the manual panel.
const EVIDENCE = "../docs/implementation/evidence/studio-3";
const placedPositions = (page: Page, ids: string[]) => page.evaluate((list) => Object.fromEntries(list.map((id) => [id, (window as any).__studio.instance(id).position])), ids);
const styleOf = (page: Page, id: string) => page.evaluate((x) => (window as any).__studio.style(x), id);

for (const variant of ['rpi5', 'rpi-zero-2-w'] as const) {
  test(`${variant}: the parts tray draws every required piece and each is visible from the tray camera`, async ({ page, browserName }) => {
    const errors = errorsOf(page);
    await open(page, `#/studio/${variant}/0`);
    await page.waitForTimeout(1200); // the framing area settles beside the panels
    const labels = await page.locator('.studio-label-group').evaluateAll(elements => elements.map(el => { const r=el.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height,visible:getComputedStyle(el).visibility!=='hidden'}; }));
    expect(labels).toHaveLength(8);
    expect(labels.every(r=>r.visible)).toBe(true);
    for(let i=0;i<labels.length;i++)for(let j=i+1;j<labels.length;j++){const a=labels[i],b=labels[j];expect(a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y,'full-kit group labels must not overlap').toBe(false);}
    const tray = manifest.variants[variant].tray;
    const roots: any[] = await page.evaluate(() => (window as any).__studio.roots());
    const solids = roots.filter((r) => !r.tile), tiles = roots.filter((r) => r.tile);
    expect(solids.map((r) => r.id).sort()).toEqual(Object.keys(tray.instances).sort());
    expect(tiles.map((r) => r.id).sort()).toEqual(Object.keys(tray.tiles).sort());
    for (const r of roots) {
      expect(r.drawn, r.id).toBe(true);
      expect(r.meshes, r.id).toBeGreaterThan(0);
      expect(r.triangles, r.id).toBeGreaterThan(0);
      expect(r.min[1], `${r.id} above the floor`).toBeGreaterThanOrEqual(manifest.variants[variant].floorYM - 1e-4);
    }
    const census: Record<string, number> = await page.evaluate(() => (window as any).__studio.census());
    // Every full-kit slot must draw. At this wider overview the smallest screws are only a few pixels;
    // the existing group Frame action must make every fastener inspectable at the previous >3 pixel threshold.
    for (const id of [...Object.keys(tray.instances), ...Object.keys(tray.tiles)]) expect(census[id], `${id} overview pixels`).toBeGreaterThan(0);
    await page.locator('.studio-group').filter({hasText:'Fasteners'}).getByRole('button',{name:'Frame',exact:true}).click();
    await page.waitForTimeout(600);
    const fastenerCensus: Record<string,number> = await page.evaluate(()=>(window as any).__studio.census());
    for(const id of tray.groups.find((g: {id:string})=>g.id==='fasteners')!.instanceIds)expect(fastenerCensus[id],`${id} framed pixels`).toBeGreaterThan(3);
    await expect(page.getByTestId('tray-inventory')).toHaveText(`${tray.inventory.canonical} canonical stock · ${tray.inventory.modeled} modelled · ${tray.inventory.tiles} tiles`);
    fs.mkdirSync(EVIDENCE, { recursive: true });
    fs.writeFileSync(`${EVIDENCE}/tray-runtime-census-${variant}-${browserName}.json`, JSON.stringify({ variant, browserName, packId: manifest.packId, viewport: page.viewportSize(),
      drawn: solids.length, tiles: tiles.length, notVisible: Object.entries(census).filter(([, n]) => n === 0).map(([id]) => id),
      minVisiblePixels: Math.min(...Object.values(census)), visiblePixels: census, fastenerCensus }, null, 1) + '\n');
    expect(errors).toEqual([]);
  });

  test(`${variant}: every step opens; Preview ends exactly on its closure poses, Review never plays`, async ({ page }) => {
    const errors = errorsOf(page);
    for (const s of manifest.variants[variant].steps) {
      await open(page, `#/studio/${variant}/${s.printedNumber}`);
      await page.waitForFunction((k) => (window as any).__studio.state().key === k, `${variant}/${s.printedNumber}`);
      await expect(page.locator('.studio-mode-chip')).toHaveText(s.mode === 'review' ? 'Review' : 'Preview');
      await expect(page.locator('.studio-step-title')).toHaveText(s.title);
      const duration = await diag(page, (d) => d.duration);
      if (s.mode === 'review') {
        expect(duration).toBe(0);
        await page.keyboard.press(' ');
        expect(await diag(page, (d) => d.state().playing)).toBe(false);
        await expect(page.locator('.studio-transport-note')).toContainText('not played as an installation');
        await expect(page.locator('.studio-review')).toBeVisible();
      } else if (duration > 0) await seekTo(page, duration);
      const live = await placedPositions(page, Object.keys(s.placements));
      for (const [id, pose] of Object.entries<any>(s.placements)) expect(close(live[id], pose.translationM, 1e-9), `S${s.printedNumber} ${id}`).toBe(true);
    }
    expect(errors).toEqual([]);
  });
}

test('switching boards on every step keeps the step in both directions; a common tile keeps its selection', async ({ page }) => {
  test.setTimeout(60000); // twenty board/step transitions retain all original assertions
  const errors = errorsOf(page);
  await open(page, '#/studio/rpi5/0');
  const tools = page.locator('.studio-group', { hasText: 'Tools' });
  await tools.locator('summary').click();
  await tools.getByRole('button', { name: /Wrench/ }).click();
  await switchBoard(page, 'Zero 2 W', 'rpi-zero-2-w/0');
  expect(await diag(page, (d) => d.state().selection)).toBe('PX-V40-INS-WRENCH-001');
  expect(await styleOf(page, 'PX-V40-INS-WRENCH-001')).toBe('selected');
  for (let n = 1; n <= 9; n++) {
    await page.locator('.studio-rail a', { hasText: String(n) }).click();
    await page.waitForFunction((k) => (window as any).__studio.state().key === k, `rpi-zero-2-w/${n}`);
    await switchBoard(page, 'Pi 5', `rpi5/${n}`);
    await switchBoard(page, 'Zero 2 W', `rpi-zero-2-w/${n}`);
  }
  expect(errors).toEqual([]);
});

test('isolate, ghost, explode and the deck clip are presentation only and fully reversible', async ({ page }) => {
  const errors = errorsOf(page);
  await open(page, '#/studio/rpi5/4');
  await seekTo(page, await diag(page, (d) => d.duration));
  const ids = Object.keys(manifest.variants.rpi5.steps[3].placements);
  const before = await placedPositions(page, ids);
  await page.keyboard.press('g');
  await expect.poll(() => styleOf(page, 'PX-V40-INS-PLATE-A-001')).toBe('ghost'); // not one of this step's parts
  expect(await styleOf(page, 'PX-V40-INS-ROBOT-HAT-001')).toBe('normal');
  await page.keyboard.press('g');
  await page.keyboard.press('o');
  await expect.poll(() => styleOf(page, 'PX-V40-INS-PLATE-A-001')).toBe('hidden');
  expect((await page.evaluate(() => (window as any).__studio.census()))['PX-V40-INS-PLATE-A-001'], 'a hidden part draws nothing').toBe(0);
  await page.keyboard.press('o');
  await expect.poll(() => styleOf(page, 'PX-V40-INS-PLATE-A-001')).toBe('normal');
  await page.keyboard.press('e');
  await expect.poll(() => page.evaluate(() => (window as any).__studio.inspection().explode)).toBe(1);
  const exploded = await placedPositions(page, ids);
  expect(exploded['PX-V40-INS-ROBOT-HAT-001'][1] - before['PX-V40-INS-ROBOT-HAT-001'][1], 'the HAT lifts').toBeGreaterThan(0.005);
  expect(exploded['PX-V40-INS-ROBOT-HAT-001'][1] - before['PX-V40-INS-ROBOT-HAT-001'][1]).toBeGreaterThan(exploded['PX-V40-INS-PI5-001'][1] - before['PX-V40-INS-PI5-001'][1]);
  await seekTo(page, 0.5); // seeking with the explosion on stays deterministic
  await seekTo(page, await diag(page, (d) => d.duration));
  expect(await placedPositions(page, ids)).toEqual(exploded);
  await page.keyboard.press('e');
  await expect.poll(() => page.evaluate(() => (window as any).__studio.inspection().explode)).toBe(0);
  expect(await placedPositions(page, ids), 'explosion off returns the exact closure poses').toEqual(before);
  await page.keyboard.press('c');
  await expect.poll(() => page.evaluate(() => (window as any).__studio.inspection().clip !== null)).toBe(true);
  expect(await page.evaluate(() => (window as any).__studio.viewport().board().materials().some((m: any) => m.clippingPlanes?.length === 2))).toBe(true);
  await page.getByRole('button', { name: 'Reset inspection' }).click();
  await expect.poll(() => page.evaluate(() => (window as any).__studio.inspection().clip)).toBeNull();
  expect(await page.evaluate(() => (window as any).__studio.viewport().board().materials().some((m: any) => m.clippingPlanes?.length))).toBe(false);
  for (const id of ids) expect(await styleOf(page, id)).toBe('normal');
  expect(errors).toEqual([]);
});

test('S07 Review names the unresolved connection and tints its two ends; S08 says previewing it does not certify S07', async ({ page }) => {
  await open(page, '#/studio/rpi5/7');
  await expect(page.locator('.studio-review')).toContainText('PX-V40-CONN-07-COMMON-BATTERY');
  await expect(page.locator('.studio-review')).toContainText('Battery lead to the Robot HAT');
  await expect.poll(() => styleOf(page, 'PX-V40-INS-BATTERY-001')).toBe('focus');
  expect(await styleOf(page, 'PX-V40-INS-ROBOT-HAT-001')).toBe('focus');
  await open(page, '#/studio/rpi5/8');
  await expect(page.locator('.studio-dependency')).toHaveText('Step 7 is still under review. Previewing step 8 does not certify step 7.');
});

test('S09 Review shows the refused candidate; a chosen conflict pair is tinted, the rest ghosted, and one Escape clears it', async ({ page }) => {
  await open(page, '#/studio/rpi5/9');
  await expect.poll(() => styleOf(page, 'PX-V40-INS-ULTRASONIC-001')).toBe('focus');
  await expect(page.locator('.studio-conflicts li')).toHaveCount(4);
  await page.getByRole('button', { name: /Pan servo horn × Plate H/ }).click();
  await expect.poll(() => styleOf(page, 'PX-V40-INS-PLATE-A-001')).toBe('ghost');
  expect(await styleOf(page, 'PX-V40-INS-HORN-PAN-001')).toBe('focus');
  expect(await styleOf(page, 'PX-V40-INS-PLATE-H-001')).toBe('focus');
  expect(await diag(page, (d) => d.state().cameraMode)).toBe('manual');
  await page.evaluate(() => { window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })); window.dispatchEvent(new KeyboardEvent('keyup', { key: 'Escape' })); });
  expect(await diag(page, (d) => d.state().conflict)).toBeNull();
  await expect.poll(() => styleOf(page, 'PX-V40-INS-PLATE-A-001')).toBe('normal');
  await page.locator('.studio-conflicts').getByRole('button').first().click();
  await page.locator('.studio-parts').getByRole('button', { name: /Ultrasonic module/ }).first().click();
  await expect(page.locator('.studio-inspector')).toContainText('refused candidate');
});

test('the drawer renders the verified manual panel; the enlarged panel closes on one Escape without clearing the selection', async ({ page }) => {
  await open(page, '#/studio/rpi5/3');
  const panel = page.locator('.studio-drawer .studio-manual-canvas');
  await expect(panel).toHaveAttribute('data-ready', 'true', { timeout: 15000 });
  await expect(panel).toHaveAttribute('data-page', '1');
  await expect(page.locator('.studio-manual')).toContainText('Printed Step 3 · rpi5 · page 1 of the V40 booklet');
  await page.getByRole('button', { name: /Raspberry Pi 5/ }).click();
  await page.getByRole('button', { name: 'Enlarge' }).click();
  await expect(page.locator('.studio-manual-overlay .studio-manual-canvas')).toHaveAttribute('data-ready', 'true', { timeout: 15000 });
  const press = () => page.evaluate(() => { window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })); window.dispatchEvent(new KeyboardEvent('keyup', { key: 'Escape' })); });
  await press();
  await expect(page.locator('.studio-manual-overlay')).toHaveCount(0);
  expect(await diag(page, (d) => d.state().selection), 'the same press must not also clear the selection').toBe('PX-V40-INS-PI5-001');
  await press();
  expect(await diag(page, (d) => d.state().selection)).toBeNull();
  await open(page, '#/studio/rpi-zero-2-w/3');
  await expect(page.locator('.studio-manual')).toContainText('Printed Step 3 · rpi-zero-2-w');
});

// Picking in the 3D view: a click selects the part under the cursor (tray tiles' drawn edges never catch it), and a
// click alone keeps the guided view; moving the camera hands it to the user.
test('a click in the view selects the part under the cursor and keeps the guided view; a drag yields to manual', async ({ page }) => {
  await open(page, '#/studio/rpi5/4');
  await seekTo(page, await diag(page, (d) => d.duration));
  await page.waitForTimeout(1100);
  for (const id of ['PX-V40-INS-ROBOT-HAT-001', 'PX-V40-INS-PLATE-A-001']) {
    const at = await page.evaluate((x) => {
      const vp = (window as any).__studio.viewport(), o = vp.scene.getObjectByName(x);
      const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
      o.updateWorldMatrix(true, true);
      o.traverse((m: any) => { if (!m.isMesh || m.userData.pickTarget) return; m.geometry.computeBoundingBox(); const b = m.geometry.boundingBox.clone().applyMatrix4(m.matrixWorld);
        for (let i = 0; i < 3; i++) { min[i] = Math.min(min[i], b.min.getComponent(i)); max[i] = Math.max(max[i], b.max.getComponent(i)); } });
      const v = o.position.clone().set((min[0] + max[0]) / 2, max[1], (min[2] + max[2]) / 2).project(vp.camera), r = vp.gl.domElement.getBoundingClientRect();
      return [r.left + ((v.x + 1) / 2) * r.width, r.top + ((1 - v.y) / 2) * r.height];
    }, id);
    await page.mouse.click(at[0], at[1]);
    await expect.poll(() => diag(page, (d) => d.state().selection)).toBe(id);
    expect(await diag(page, (d) => d.state().cameraMode)).toBe('guided');
  }
  await page.mouse.move(600, 400);
  await page.mouse.down();
  await page.mouse.move(700, 420, { steps: 8 });
  await page.mouse.up();
  await expect.poll(() => diag(page, (d) => d.state().cameraMode)).toBe('manual');
});

for (const step of [2, 4]) test(`S${step}: a stationary selection across active playback frames retains guided camera; manipulation yields`, async ({ page }) => {
  await open(page, `#/studio/rpi5/${step}`);
  await seekTo(page, await diag(page, (d) => d.duration));
  await page.waitForTimeout(1100);
  await page.getByRole('button', { name: 'Replay from the start' }).click();
  const at = await page.evaluate(async () => {
    const { Raycaster, Vector2, Vector3 } = await import('/node_modules/.vite/deps/three.js' as string);
    const vp = (window as any).__studio.viewport(), id = 'PX-V40-INS-PLATE-A-001', root = vp.board().roots.get(id);
    vp.scene.updateMatrixWorld(true); vp.camera.updateMatrixWorld();
    const rect = vp.gl.domElement.getBoundingClientRect(), ray = new Raycaster(), point = new Vector3(), vertex = new Vector3();
    const exposed = (x: number, y: number) => {
      ray.setFromCamera(new Vector2((x - rect.left) / rect.width * 2 - 1, 1 - (y - rect.top) / rect.height * 2), vp.camera);
      const hit = ray.intersectObjects([...vp.board().roots.values()], true)[0];
      let o = hit?.object; while (o && o !== root) o = o.parent;
      return o === root;
    };
    const meshes: any[] = []; root.traverse((o: any) => { if (o.isMesh && !o.userData.pickTarget) meshes.push(o); });
    for (const mesh of meshes) {
      const pos = mesh.geometry.attributes.position, indices = mesh.geometry.index;
      for (let i = 0; i < (indices?.count ?? pos.count); i += 3) {
        point.set(0, 0, 0);
        for (let k = 0; k < 3; k++) point.add(vertex.fromBufferAttribute(pos, indices ? indices.getX(i + k) : i + k));
        point.multiplyScalar(1 / 3).applyMatrix4(mesh.matrixWorld).project(vp.camera);
        const x = rect.left + (point.x + 1) * rect.width / 2, y = rect.top + (1 - point.y) * rect.height / 2;
        if (x < rect.left + 120 || x > rect.right - 380 || y < rect.top + 100 || y > rect.bottom - 100) continue;
        // An interior point in the active view, clear of neighbouring bodies; a final-pose edge point can cross
        // the board's silhouette when replay changes the guided frame before the stationary release.
        if ([-8, 0, 8].every((dx) => [-8, 0, 8].every((dy) => exposed(x + dx, y + dy)))) return [x, y];
      }
    }
    throw Error('No exposed Plate A triangle found for stationary selection');
  });
  await page.mouse.move(at[0], at[1]); await page.mouse.down();
  const before = await diag(page, (d) => d.state().t);
  await page.waitForTimeout(250);
  expect(await diag(page, (d) => d.state().t)).toBeGreaterThan(before);
  expect(await diag(page, (d) => d.state().cameraMode)).toBe('guided');
  await page.mouse.up();
  await expect.poll(() => diag(page, (d) => d.state().selection)).toBe('PX-V40-INS-PLATE-A-001');
  expect(await diag(page, (d) => d.state().cameraMode)).toBe('guided');
  await page.mouse.down(); await page.mouse.move(at[0] + 80, at[1] + 25, { steps: 8 }); await page.mouse.up();
  await expect.poll(() => diag(page, (d) => d.state().cameraMode)).toBe('manual');
});

test('manual fetch failure offers explicit retry, rejects wrong retry bytes, and then renders the locked PDF', async ({ page }) => {
  // React's development remount can make more than one initial request, especially in WebKit.
  // Hold each fault until its explicit retry so a remount cannot consume the next scenario.
  let phase: 'unavailable' | 'wrong-bytes' | 'success' = 'unavailable';
  const attempts = { unavailable: 0, 'wrong-bytes': 0, success: 0 };
  await page.route('**/content/pdf/picar-x-assembly.pdf', (route) => {
    attempts[phase]++;
    if (phase === 'unavailable') return route.fulfill({ status: 503, body: 'controlled failure' });
    if (phase === 'wrong-bytes') return route.fulfill({ status: 200, body: 'wrong locked bytes' });
    return route.continue();
  });
  await open(page, '#/studio/rpi5/1');
  const alert = page.locator('.studio-manual [role="alert"]');
  await expect(alert).toBeVisible(); expect(attempts.unavailable).toBeGreaterThan(0);
  expect(attempts['wrong-bytes']).toBe(0); expect(attempts.success).toBe(0);
  phase = 'wrong-bytes';
  await alert.getByRole('button', { name: 'Retry' }).click();
  await expect.poll(() => attempts['wrong-bytes']).toBeGreaterThan(0);
  await expect(alert).toBeVisible(); expect(attempts.success).toBe(0);
  await expect(page.locator('.studio-drawer .studio-manual-canvas')).not.toHaveAttribute('data-ready', 'true');
  phase = 'success';
  await alert.getByRole('button', { name: 'Retry' }).click();
  await expect(page.locator('.studio-drawer .studio-manual-canvas')).toHaveAttribute('data-ready', 'true', { timeout: 15000 });
  expect(attempts.success).toBeGreaterThan(0); await expect(alert).toHaveCount(0);
});

test('manual render errors surface; retry and replacement cancel safely and reset the prior error', async ({ page }) => {
  await page.route('**/src/lib/v40-pdf.ts', (route) => route.fulfill({ contentType: 'application/javascript', body: `
    window.__manualFault = 'failure'; window.__manualPending = 0; window.__manualCancelled = 0;
    export const loadV40Pdf = async () => ({ getPage: async () => ({
      getViewport: ({scale}) => ({ width: 600 * scale, height: 800 * scale }),
      render: () => { let reject;
        const promise = window.__manualFault === 'failure' ? Promise.reject(Error('controlled genuine render failure')) : window.__manualFault === 'pending' ? new Promise((_, r) => { reject = r; window.__manualPending++; }) : Promise.resolve();
        return { promise, cancel: () => { if (reject) { window.__manualCancelled++; const e = Error('cancel'); e.name = 'RenderingCancelledException'; reject(e); } } };
      }
    }) });
    export { V40_PDF_URL, V40_PDF_SHA256 } from '/src/lib/v40-pdf-identity.ts';
    export const forgetV40Pdf = () => {};
  ` }));
  await open(page, '#/studio/rpi5/1');
  await expect(page.locator('.studio-manual [role="alert"]')).toBeVisible();
  await page.evaluate(() => { (window as any).__manualFault = 'pending'; });
  await page.getByRole('button', { name: 'Retry' }).click();
  await expect(page.locator('.studio-manual [role="alert"]')).toHaveCount(0);
  await page.waitForFunction(() => (window as any).__manualPending > 0);
  await page.evaluate(() => { (window as any).__manualFault = 'success'; });
  await page.locator('.studio-rail a', { hasText: '2' }).click();
  await expect(page.locator('.studio-drawer .studio-manual-canvas')).toHaveAttribute('data-ready', 'true');
  expect(await page.evaluate(() => (window as any).__manualCancelled)).toBeGreaterThan(0);
  await expect(page.locator('.studio-manual [role="alert"]')).toHaveCount(0);
});

test('manual open to tray navigation closes invisible modal state before Escape and never resurrects it', async ({ page }) => {
  await open(page, '#/studio/rpi5/1');
  await page.getByRole('button', { name: /Plate A/ }).first().click();
  await page.getByRole('button', { name: 'Enlarge' }).click();
  await expect(page.locator('.studio-manual-overlay')).toBeVisible();
  await page.evaluate(async () => {
    const raf = window.requestAnimationFrame.bind(window), pending: FrameRequestCallback[] = [];
    window.requestAnimationFrame = (callback) => { pending.push(callback); return -pending.length; };
    (window as any).__resumeStudioFrames = () => { window.requestAnimationFrame = raf; pending.forEach((callback) => raf(callback)); };
    // Drain the frame already queued before the override; the next 3D frame is now withheld.
    await new Promise<void>((done) => raf(() => raf(() => done())));
  });
  await page.keyboard.press('[');
  await expect(page.locator('.studio')).toHaveAttribute('data-step', '0');
  expect(await diag(page, (d) => d.state().key)).toBe('rpi5/1'); // no frame-loop enterStep has run
  expect(await diag(page, (d) => d.state().manualOpen)).toBe(false);
  await page.keyboard.press('Escape');
  expect(await diag(page, (d) => d.state().selection)).toBeNull();
  await page.keyboard.press(']');
  await expect(page.locator('.studio-manual-overlay')).toHaveCount(0);
  await page.evaluate(() => (window as any).__resumeStudioFrames());
});

test('combined ghost/explode/clip preserves poses, clipping excludes picking, and reset restores canonical presentation', async ({ page }) => {
  await open(page, '#/studio/rpi5/4'); await seekTo(page, await diag(page, (d) => d.duration));
  const ids = Object.keys(manifest.variants.rpi5.steps[3].placements), before = await placedPositions(page, ids);
  for (const pair of [['g', 'e'], ['g', 'c'], ['e', 'c']]) {
    for (const key of pair) await page.keyboard.press(key);
    if (pair.includes('e')) await expect.poll(() => page.evaluate(() => (window as any).__studio.inspection().explode)).toBe(1);
    if (pair.includes('c')) {
      await expect.poll(() => page.evaluate(() => (window as any).__studio.inspection().clip !== null)).toBe(true);
      const hits = await page.evaluate(async () => {
        const { Raycaster, Vector3 } = await import('/node_modules/.vite/deps/three.js' as string);
        const vp = (window as any).__studio.viewport(), root = vp.board().roots.get('PX-V40-INS-ROBOT-HAT-001');
        root.updateWorldMatrix(true, true);
        const p = root.position.clone(); const ray = new Raycaster(new Vector3(p.x + .02, p.y + .2, p.z - .02), new Vector3(0, -1, 0));
        return ray.intersectObject(root, true).length;
      });
      expect(hits).toBe(0);
      await page.getByRole('button', { name: /Robot HAT/ }).first().click();
      expect(await diag(page, (d) => d.state().selection)).toBe('PX-V40-INS-ROBOT-HAT-001');
    }
    await page.getByRole('button', { name: 'Reset inspection' }).click();
    await expect.poll(() => page.evaluate(() => (window as any).__studio.inspection().explode)).toBe(0);
    await expect.poll(() => page.evaluate(() => (window as any).__studio.inspection().clip)).toBeNull();
    expect(await placedPositions(page, ids)).toEqual(before);
  }
});
