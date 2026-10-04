import { test, expect, type Page } from '@playwright/test';

async function open(page: Page, step = 2) {
  await page.goto(`/#/studio/rpi5/${step}`);
  await page.waitForFunction(() => (window as any).__studio?.viewport()?.board());
  await expect(page.locator('.studio-build')).not.toContainText('Opening saved');
}
async function keyActivate(page: Page, locator: ReturnType<Page['locator']>) {
  // Find the control using actual Tab navigation; do not programmatically focus or click it.
  for (let n = 0; n < 400; n++) {
    if (await locator.evaluate(el => el === document.activeElement)) { await page.keyboard.press('Enter'); return; }
    await page.keyboard.press('Tab');
  }
  throw Error('Control unreachable by Tab');
}

test('keyboard workflow, native activation, logical focus, selected/pressed semantics', async ({ page }) => {
  test.setTimeout(120000);
  await open(page, 1);
  const build = page.locator('.studio-build');
  await keyActivate(page, build.getByRole('button', { name: 'Start build session' }));
  await expect(build).toHaveAttribute('data-session', 'PX-STUDIO-RPI5');
  await keyActivate(page, page.locator('.studio-rail a').filter({ hasText: /^2$/ }));
  await expect(page.locator('.studio')).toHaveAttribute('data-step', '2');
  await keyActivate(page, page.locator('.studio-boards a').filter({ hasText: 'Zero 2 W' }));
  await expect(page.locator('.studio')).toHaveAttribute('data-variant', 'rpi-zero-2-w');
  await expect(page.locator('.studio-sr').last()).toContainText('Raspberry Pi Zero 2 W');
  await page.keyboard.press('i');
  await expect(page.locator('.studio-drawer')).toHaveAttribute('inert', '');
  await page.keyboard.press('i');
  await keyActivate(page, page.locator('.studio-parts button').first());
  await expect(page.locator('.studio-inspector')).toBeVisible();
  await page.keyboard.press('f');
  await page.keyboard.press('o');
  await expect(page.getByRole('button', { name: 'Isolate', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.studio-sr[role="status"]')).toContainText('Selected');
  await page.keyboard.press('g'); await page.keyboard.press('e'); await page.keyboard.press('c');
  await keyActivate(page, page.getByRole('button', { name: 'Reset inspection', exact: true }));
  await page.keyboard.press('r');
  await expect(page.getByRole('button', { name: 'Guided view', exact: true })).toHaveAttribute('aria-pressed', 'true');
});

test('modal contains focus, blocks underlying shortcuts, restores opener, preserves Escape layers', async ({ page }) => {
  await open(page);
  const opener = page.getByRole('button', { name: 'Enlarge', exact: true });
  await keyActivate(page, opener);
  const dialog = page.getByRole('dialog');
  await expect(dialog).toHaveAttribute('aria-modal', 'true');
  await expect(page.getByRole('button', { name: 'Close the manual' })).toBeFocused();
  for (let i = 0; i < 5; i++) {
    await page.keyboard.press(i % 2 ? 'Shift+Tab' : 'Tab');
    expect(await page.evaluate(() => document.activeElement === document.body || !!document.activeElement?.closest('dialog'))).toBe(true);
  }
  await page.keyboard.press('g');
  await expect(page.getByRole('button', { name: 'Ghost others', exact: true })).not.toBeFocused();
  expect(await page.evaluate(() => (window as any).__studio.state().ghost)).toBe(false);
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(opener).toBeFocused();
});

test('Space activates a focused checkbox and typing cannot trigger shortcuts', async ({ page }) => {
  await open(page, 1);
  const build = page.locator('.studio-build');
  await build.getByRole('button', { name: 'Start build session' }).click();
  const field = build.getByLabel('My physical completion statement');
  await field.fill(''); await field.press('g'); await field.press('e'); await field.press('i'); await field.press(' ');
  await expect(field).toHaveValue('gei ');
  expect(await page.evaluate(() => (window as any).__studio.state().ghost)).toBe(false);
  await keyActivate(page, build.getByRole('button', { name: 'Mark physically done', exact: true }));
  await expect(build).toContainText('1/29 physically completed');
  const checkbox = build.getByRole('checkbox');
  for (let i = 0; i < 200 && !await checkbox.evaluate(el => el === document.activeElement); i++) await page.keyboard.press('Tab');
  await expect(checkbox).toBeFocused();
  const before = await page.evaluate(() => (window as any).__studio.state().playing);
  await page.keyboard.press('Space'); await expect(checkbox).toBeChecked();
  expect(await page.evaluate(() => (window as any).__studio.state().playing)).toBe(before);
});

test('OS reduced motion snaps source endpoints, guided camera, explosion and transport', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await open(page, 4);
  expect(await page.evaluate(() => (window as any).__studio.state().playing)).toBe(false);
  expect(await page.evaluate(() => (window as any).__studio.state().t)).toBe(await page.evaluate(() => (window as any).__studio.duration));
  await page.keyboard.press('e');
  await expect.poll(() => page.evaluate(() => (window as any).__studio.inspection().explode)).toBe(1);
  await page.keyboard.press('r');
  await expect.poll(() => page.evaluate(() => (window as any).__studio.camera().target)).toEqual(await page.evaluate(async () => (await import('/src/features/assembly-3d/assets/pack.ts' as string) as any).loadPack().then((p: any) => p.manifest.variants.rpi5.steps[3].camera.targetM)));
  await page.getByRole('button', { name: 'Rewind', exact: true }).click();
  expect(await page.evaluate(() => (window as any).__studio.state().t)).toBe(0);
  await page.getByRole('button', { name: 'Play step', exact: true }).click();
  expect(await page.evaluate(() => (window as any).__studio.state().t)).toBe(await page.evaluate(() => (window as any).__studio.duration));
  expect(await page.locator('.studio-drawer').evaluate(el => getComputedStyle(el).transitionDuration)).toBe('0s');
});

test('every visible control has a name; semantic status remains stable through frames', async ({ page }) => {
  await open(page, 4);
  const unnamed = await page.locator('.studio button, .studio a, .studio input, .studio textarea').evaluateAll(elements => elements.filter(el => {
    const h = el as HTMLElement;
    if (!h.getClientRects().length || h.closest('[inert]')) return false;
    return !(h.getAttribute('aria-label') || h.textContent?.trim() || h.getAttribute('title') || (h as HTMLInputElement).labels?.length);
  }).map(el => el.outerHTML));
  expect(unnamed).toEqual([]);
  const status = await page.locator('.studio-sr').allTextContents();
  await page.waitForTimeout(300);
  expect(await page.locator('.studio-sr').allTextContents()).toEqual(status);
  await expect(page.locator('.studio-rail a[aria-current="step"]')).toHaveText('4');
  const snapshot = await page.locator('.studio-drawer').ariaSnapshot();
  expect(snapshot).toContain('Instructions'); expect(snapshot).toContain('Your real car');
});
