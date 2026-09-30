import { test, expect } from '@playwright/test';
import fs from 'node:fs';
const legacy=fs.readFileSync('tests/baseline/legacy.json','utf8');
const wizard=JSON.parse(fs.readFileSync('src/content/wizard.json','utf8'));
const nav=JSON.parse(fs.readFileSync('src/content/nav.json','utf8'));
const search=JSON.parse(fs.readFileSync('src/content/search-index.json','utf8'));
const videos=JSON.parse(fs.readFileSync('src/content/videos.json','utf8'));
const flatten=(nodes:any[]):string[]=>nodes.flatMap(n=>[n.page,...(n.children?flatten(n.children):[])]);
test.beforeEach(async({page})=>{
  // Only the local dev server. No thumbnails, remote embeds, analytics or external code.
  await page.route('**/*',route=>{const url=new URL(route.request().url());return url.hostname==='localhost'&&url.port==='1420'?route.continue():route.abort();});
  await page.addInitScript(raw=>localStorage.setItem('picarx.v1',raw),legacy);
});
test('Home and all eight setup routes retain stage identities',async({page})=>{
 await page.goto('/#/');await expect(page.locator('main')).toBeVisible();
 for(const stage of wizard){await page.goto('/#/wizard/'+stage.id);await expect(page.locator('main h1').first()).toHaveText(stage.title);}
});
test('Reference pager and real heading-first search ordering are retained',async({page})=>{
 await page.goto('/#/reference');await expect(page.locator('main h1')).toHaveText('Reference');
 const order=[...new Set(flatten(nav))];const id=order[1];await page.goto('/#/reference/'+id);
 await expect(page.locator('.doc-pager .prev')).toHaveAttribute('href','#/reference/'+order[0]);
 await expect(page.locator('.doc-pager .next')).toHaveAttribute('href','#/reference/'+order[2]);
 for(const q of ['servo','camera','python']){
  await page.locator('input[type=search]').fill(q);
  const expected=search.filter((e:any)=>e.heading.toLowerCase().includes(q)||e.text.toLowerCase().includes(q)).sort((a:any,b:any)=>Number(!a.heading.toLowerCase().includes(q))-Number(!b.heading.toLowerCase().includes(q))).slice(0,20);
  await expect(page.locator('.search-heading')).toHaveText(expected.map((e:any)=>e.heading));
  if(q==='python'){await page.locator('.search-results button').first().click();await expect(page).toHaveURL(new RegExp('/#\/reference/'+expected[0].page+'\\?s='+expected[0].section));}
 }
 await page.locator('input[type=search]').fill('x');await expect(page.locator('.search-results')).toHaveCount(0);
});
test('Video ordering, slug navigation and text lessons remain available',async({page})=>{
 await page.goto('/#/videos');const ordered=[...videos].sort((a:any,b:any)=>a.order-b.order);
 expect(await page.locator('.video-card').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('href')))).toEqual(ordered.map((v:any)=>'#/videos/'+v.slug));
 const v=ordered.find((v:any)=>v.lessonPage);await page.goto('/#/videos/'+v.slug);await expect(page.locator('main h1')).toHaveText(v.title);
 await expect(page.locator('.video-lesson-link a')).toHaveAttribute('href','#/reference/'+v.lessonPage);
 await page.getByRole('link',{name:'← All videos',exact:true}).click();await expect(page).toHaveURL(/#\/videos$/);
});
test('PDF bookmark, bounds, page navigation and zoom remain functional',async({page})=>{
 await page.goto('/#/wizard/assembly');const viewer=page.locator('.pdf-viewer');await expect(viewer.locator('.pdf-pageinfo')).toContainText('of 2');
 const input=viewer.locator('input[type=number]');await expect(input).toHaveValue('2');await expect(viewer.getByRole('button',{name:'Next →',exact:true})).toBeDisabled();
 await viewer.getByRole('button',{name:'← Prev',exact:true}).click();await expect(input).toHaveValue('1');
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('picarx.v1')!).pdfLastPage)).toBe(1);
 await input.fill('3');expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('picarx.v1')!).pdfLastPage)).toBe(1);
 await input.fill('2');await expect(input).toHaveValue('2');await viewer.getByRole('button',{name:'+',exact:true}).click();await expect(viewer.locator('.pdf-zoom')).toContainText('140%');
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('picarx.v1')!).steps.assembly)).toBe('done');
});
