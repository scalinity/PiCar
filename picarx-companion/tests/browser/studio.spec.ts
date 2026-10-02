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
  expect(resized.aspect).toBeCloseTo(1100 / 700, 3);
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

test('readiness is labelled and later steps are not offered as instruction', async ({ page }) => {
  await open(page, '#/studio/rpi5/7');
  await expect(page.locator('.studio-notice')).toContainText('Step 7 opens in a later Studio update. Showing step 2.');
  await expect(page.locator('.studio-preview-chip')).toHaveText('Preview');
  await expect(page.locator('.studio-truths')).toContainText('M7 has accepted 0 of 58 steps');
  await expect(page.locator('.studio-truths')).toContainText('never marks a step done');
  await expect(page.locator('.studio-rail-later[data-display="PREVIEW_BLOCKED_RELATION"]')).toHaveText('7');
  await expect(page.locator('.studio-rail-later[data-display="REVIEW_REFUSED_CANDIDATE"]')).toHaveText('9');
  await expect(page.locator('.studio-rail a')).toHaveText(['Parts', '1', '2']);
});

test('selecting a part shows its source identity', async ({ page }) => {
  await open(page, '#/studio/rpi5/2');
  await page.getByRole('button', { name: /USB mini microphone accessory/ }).click();
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

test('the companion pages remain reachable from the Studio', async ({ page }) => {
  await open(page, '#/studio');
  await page.getByRole('link', { name: 'Reference' }).click();
  await expect(page).toHaveURL(/#\/reference/);
  await expect(page.locator('.topbar')).toBeVisible();
  await page.getByRole('link', { name: 'Studio' }).click();
  await expect(page.locator('.studio')).toBeVisible();
});
