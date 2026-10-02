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

test('the companion pages remain reachable from the Studio', async ({ page }) => {
  await open(page, '#/studio');
  await page.getByRole('link', { name: 'Reference' }).click();
  await expect(page).toHaveURL(/#\/reference/);
  await expect(page.locator('.topbar')).toBeVisible();
  await page.getByRole('link', { name: 'Studio' }).click();
  await expect(page.locator('.studio')).toBeVisible();
});
