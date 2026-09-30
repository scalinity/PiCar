import {test,expect} from '@playwright/test';
test.beforeEach(async({page})=>{await page.route('**/*',r=>new URL(r.request().url()).hostname==='localhost'?r.continue():r.abort());});
test('custom Hermes content and excluded source media remain accessible',async({page})=>{
 await page.goto('/#/reference/custom/hermes');await expect(page.locator('main h1')).toContainText('Hermes');await expect(page.locator('main')).toContainText('PiCar-X');
 await page.goto('/#/reference/adjust_servo');await page.route('**/content/img/**',r=>r.abort());await page.reload();await page.locator(".doc-image").first().scrollIntoViewIfNeeded();await expect(page.locator('.doc-image [role=status]').first()).toContainText('unavailable');
});
test('lazy assembly failure recovers through reference and retains durable export',async({page})=>{
 await page.route('**/src/pages/Assembly.tsx*',r=>r.abort());await page.goto('/#/assembly');await expect(page.getByRole('heading',{name:'Assembly recovery',exact:true})).toBeVisible();await expect(page.getByRole('button',{name:'Export sessions'})).toBeVisible();await page.getByRole('link',{name:'Open reference'}).click();await expect(page.locator('main h1')).toHaveText('Reference');
});
test('keyboard review focuses the heading and missing PDF keeps source text with no fallback',async({page})=>{
 await page.route('**/content/pdf/**',r=>r.abort());await page.goto('/#/assembly');await page.getByRole('button',{name:'Start new session',exact:true}).click();await expect(page.locator('main h1')).toContainText('1.');await expect(page.locator('main h1')).toBeFocused();
 await page.getByText('Z0104V40 booklet · source page 1',{exact:true}).click();await expect(page.locator('.pdf-error')).toContainText('Source text remains available');await expect(page.getByRole('heading',{name:'Source instructions'})).toBeVisible();await expect(page.locator('main')).toContainText('0/29 self-confirmed');
});
