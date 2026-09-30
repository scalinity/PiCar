// Content pipeline entrypoint: crawl the SunFounder docs from index.rst,
// parse + transform to structured JSON, validate everything, emit into the app.
// Any error anywhere → full error listing and exit 1, no partial output.

import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { acquire, recover, denied, preservePrivate, publish, safeMirror } from './publication';
import { captureInputs, verifySource, v40 } from './source';
import { fileURLToPath } from 'node:url';
import { createHighlighter } from 'shiki';
import { parseRst, type ParseError, type RawBlock } from './rst-parser';
import {
  EXCLUDED,
  classifyRawHtml,
  convertBlocks,
  blockText,
  fuseRunMarkers,
  pageDir,
  plainTitle,
  sectionize,
  stripFacebookNotes,
  type ConvertCtx,
  type MidBlock,
  type SectionDraft,
} from './transform';
import { extraPages, videoCorrections, wizardSteps } from './overlay';
import type {
  Block,
  Inline,
  NavNode,
  Page,
  SearchEntry,
  Section,
  VideoEntry,
  WizardStep,
} from '../../src/lib/content-types';

const HERE = dirname(fileURLToPath(import.meta.url));
const APP = join(HERE, '../..');
const release = acquire(APP, 'writer');
process.on('exit', release);
recover(APP);
const STAGE = join(APP, '.content-publication/staging', randomUUID());
const SNAPSHOT = join(STAGE, 'inputs');
captureInputs(APP, SNAPSHOT);
const DOCS = join(SNAPSHOT, 'sunfounder-docs/docs/source');
const CUSTOM_DOCS = join(SNAPSHOT, 'picarx-companion/custom-docs');
const PDFS = join(SNAPSHOT, 'sunfounder-docs/pdfs');
const OUT_PAGES = join(STAGE, 'src/content/pages');
const OUT_CONTENT = join(STAGE, 'src/content');
const OUT_PUBLIC = join(STAGE, 'public/content');

// Pinned after the first verified clean run to catch upstream drift.
const EXPECTED_PAGE_COUNT: number | null = 62;

const errors: ParseError[] = [];

// --- conf.py substitutions -------------------------------------------------

function parseConfSubstitutions(): Map<string, string> {
  const conf = readFileSync(join(DOCS, 'conf.py'), 'utf8');
  const subs = new Map<string, string>();
  const rx = /\.\.[ \t]+\|([\w-]+)\|[ \t]+raw::[ \t]*html[ \t]*\n(?:[ \t]*\n)+[ \t]+(<a[\s\S]*?<\/a>)/g;
  let m: RegExpExecArray | null;
  while ((m = rx.exec(conf))) subs.set(m[1], m[2]);
  if (subs.size < 20) {
    errors.push({ file: 'conf.py', line: 0, message: `only ${subs.size} rst_epilog substitutions found (expected >= 20) — extraction regex drifted?` });
  }
  return subs;
}

// --- crawl -----------------------------------------------------------------

interface PageData {
  id: string;
  file: string;
  sections: SectionDraft[];
  fileSubs: Map<string, string>;
  toctreeEntries: { target: string; title?: string }[];
  title: string;
  page?: Page;
}

function collectToctrees(blocks: RawBlock[] | MidBlock[]): { target: string; title?: string }[] {
  const out: { target: string; title?: string }[] = [];
  for (const b of blocks) {
    if (b.t === 'toctree') out.push(...b.entries);
    else if (b.t === 'admonition') out.push(...collectToctrees(b.blocks));
    else if (b.t === 'list') for (const it of b.items) out.push(...collectToctrees(it));
  }
  return out;
}

function resolveTarget(target: string, fromPage: string): string {
  if (target === 'self') return fromPage;
  const base = target.startsWith('/') ? target.slice(1) : `${pageDir(fromPage)}/${target}`;
  const segs: string[] = [];
  for (const s of base.split('/')) {
    if (s === '' || s === '.') continue;
    if (s === '..') segs.pop();
    else segs.push(s);
  }
  return segs.join('/');
}

const pages = new Map<string, PageData>();

function ingest(id: string, absFile: string, relFile: string): PageData {
  const { blocks, substitutions } = parseRst(readFileSync(absFile, 'utf8'), relFile, errors);
  let mid = classifyRawHtml(blocks, relFile, errors);
  mid = fuseRunMarkers(mid, relFile, errors);
  mid = stripFacebookNotes(mid);
  const sections = sectionize(mid, id);
  const h1 = sections.find((s) => s.level === 1 && s.titleRaw);
  const data: PageData = {
    id,
    file: relFile,
    sections,
    fileSubs: substitutions,
    toctreeEntries: collectToctrees(mid),
    title: h1 ? plainTitle(h1.titleRaw) : id,
  };
  pages.set(id, data);
  return data;
}

function crawl(startId: string): void {
  const queue = [startId];
  while (queue.length) {
    const id = queue.shift()!;
    if (pages.has(id) || EXCLUDED(id)) continue;
    const file = join(DOCS, `${id}.rst`);
    if (!existsSync(file)) {
      errors.push({ file: `${id}.rst`, line: 0, message: 'toctree entry does not exist on disk' });
      continue;
    }
    const data = ingest(id, file, `${id}.rst`);
    for (const e of data.toctreeEntries) {
      const child = resolveTarget(e.target, id);
      if (child !== id && !EXCLUDED(child)) queue.push(child);
    }
  }
}

// --- main ------------------------------------------------------------------

const globalSubs = parseConfSubstitutions();
crawl('index');
const crawledCount = pages.size;

// Companion-authored pages (custom-docs/*.rst) join the same pipeline.
for (const ep of extraPages) {
  const abs = join(CUSTOM_DOCS, ep.file);
  if (!existsSync(abs)) {
    errors.push({ file: `custom-docs/${ep.file}`, line: 0, message: 'extra page file missing' });
    continue;
  }
  ingest(ep.id, abs, `custom-docs/${ep.file}`);
}

if (EXPECTED_PAGE_COUNT !== null && crawledCount !== EXPECTED_PAGE_COUNT) {
  errors.push({ file: '(crawl)', line: 0, message: `crawled ${crawledCount} pages, expected ${EXPECTED_PAGE_COUNT} — upstream docs drifted?` });
}

// Global anchor map: label -> page/section/title
const anchorMap = new Map<string, { page: string; section: string; title: string }>();
for (const p of pages.values()) {
  for (const s of p.sections) {
    for (const a of s.anchors) {
      if (anchorMap.has(a)) {
        errors.push({ file: p.file, line: 0, message: `duplicate anchor label '${a}' (also in ${anchorMap.get(a)!.page})` });
      }
      anchorMap.set(a, { page: p.id, section: s.id, title: plainTitle(s.titleRaw) || p.title });
    }
  }
}

// Convert every page
const imageAssets = new Set<string>();
const videoAssets = new Set<string>();

for (const p of pages.values()) {
  const merged = new Map([...globalSubs, ...p.fileSubs]);
  const ctx: ConvertCtx = {
    pageId: p.id,
    file: p.file,
    errors,
    substitutions: merged,
    anchorMap,
    imageAssets,
    videoAssets,
    resolveToctree: (target, fromPage) => {
      const id = resolveTarget(target, fromPage);
      if (EXCLUDED(id)) return 'excluded';
      const t = pages.get(id);
      if (!t) {
        errors.push({ file: p.file, line: 0, message: `toctree entry '${target}' did not resolve` });
        return null;
      }
      return { page: id, title: t.title };
    },
  };
  const sections: Section[] = p.sections.map((s) => ({
    id: s.id,
    level: s.level,
    title: plainTitle(s.titleRaw),
    anchors: s.anchors,
    blocks: convertBlocks(s.blocks, ctx),
  }));
  p.page = { id: p.id, title: p.title, sections };
}

// --- validate assets (case-sensitive: APFS is case-insensitive and would mask mismatches) ---

function existsExact(root: string, rel: string): boolean {
  let dir = root;
  const segs = rel.split('/');
  for (let i = 0; i < segs.length; i++) {
    if (!existsSync(dir)) return false;
    const entries = readdirSync(dir);
    if (!entries.includes(segs[i])) return false;
    dir = join(dir, segs[i]);
  }
  return true;
}

for (const rel of imageAssets) {
  if (!existsExact(DOCS, rel)) {
    errors.push({ file: rel, line: 0, message: 'referenced image missing (or case mismatch) in docs source' });
  }
}
for (const rel of videoAssets) {
  if (!existsExact(join(DOCS, '_static'), rel)) {
    errors.push({ file: rel, line: 0, message: 'referenced _static asset missing in docs source' });
  }
}

// --- nav tree ----------------------------------------------------------------

function buildNav(pageId: string, visited: Set<string>): NavNode[] {
  const p = pages.get(pageId);
  if (!p) return [];
  const nodes: NavNode[] = [];
  for (const e of p.toctreeEntries) {
    const id = resolveTarget(e.target, pageId);
    if (EXCLUDED(id)) continue;
    const t = pages.get(id);
    if (!t) continue; // already errored during conversion
    if (visited.has(id)) {
      nodes.push({ page: id, title: e.title || t.title });
      continue;
    }
    visited.add(id);
    const children = buildNav(id, visited);
    nodes.push(children.length ? { page: id, title: e.title || t.title, children } : { page: id, title: e.title || t.title });
  }
  return nodes;
}

const nav = buildNav('index', new Set(['index']));

// Insert companion-authored pages into the nav next to their official siblings.
function findNavNode(nodes: NavNode[], page: string): NavNode | undefined {
  for (const n of nodes) {
    if (n.page === page) return n;
    const hit = n.children && findNavNode(n.children, page);
    if (hit) return hit;
  }
  return undefined;
}
for (const ep of extraPages) {
  const parent = findNavNode(nav, ep.navParent);
  const page = pages.get(ep.id);
  if (!parent?.children || !page) {
    errors.push({ file: `custom-docs/${ep.file}`, line: 0, message: `nav parent '${ep.navParent}' not found for extra page` });
    continue;
  }
  const at = parent.children.findIndex((c) => c.page === ep.navAfter);
  if (at === -1) {
    errors.push({ file: `custom-docs/${ep.file}`, line: 0, message: `navAfter '${ep.navAfter}' not found under '${ep.navParent}'` });
    continue;
  }
  parent.children.splice(at + 1, 0, { page: ep.id, title: page.title });
}

// --- search index --------------------------------------------------------------

const searchIndex: SearchEntry[] = [];
for (const p of pages.values()) {
  for (const s of p.page!.sections) {
    const text = blockText(s.blocks).replace(/\s+/g, ' ').trim();
    if (!text && !s.title) continue;
    searchIndex.push({ page: p.id, section: s.id, heading: s.title || p.title, text });
  }
}

// --- video registry --------------------------------------------------------

function findVideos(blocks: Block[]): string[] {
  const ids: string[] = [];
  for (const b of blocks) {
    if (b.t === 'video') ids.push(b.youtubeId);
    else if (b.t === 'admonition') ids.push(...findVideos(b.blocks));
    else if (b.t === 'list') for (const it of b.items) ids.push(...findVideos(it));
  }
  return ids;
}

function findXrefs(blocks: Block[]): Inline[] {
  const refs: Inline[] = [];
  const scan = (inlines: Inline[]) => refs.push(...inlines.filter((i) => i.t === 'xref'));
  for (const b of blocks) {
    if (b.t === 'p') scan(b.inlines);
    else if (b.t === 'admonition') refs.push(...findXrefs(b.blocks));
    else if (b.t === 'list') for (const it of b.items) refs.push(...findXrefs(it));
    else if (b.t === 'table') {
      for (const c of b.header) refs.push(...findXrefs(c));
      for (const r of b.rows) for (const c of r) refs.push(...findXrefs(c));
    }
  }
  return refs;
}

const videoRegistry: VideoEntry[] = [];
{
  const courseChapter = pages.get('python_video_course/python_video_course');
  const coursePageIds = courseChapter
    ? courseChapter.toctreeEntries.map((e) => resolveTarget(e.target, courseChapter.id))
    : [];
  const sources = ['assemble', ...coursePageIds];
  let order = 0;
  for (const id of sources) {
    const p = pages.get(id);
    if (!p?.page) {
      errors.push({ file: `${id}.rst`, line: 0, message: 'video registry source page missing' });
      continue;
    }
    const vids = p.page.sections.flatMap((s) => findVideos(s.blocks));
    if (vids.length !== 1) {
      errors.push({ file: p.file, line: 0, message: `expected exactly 1 video on this page, found ${vids.length}` });
      if (vids.length === 0) continue;
    }
    const xrefs = p.page.sections.flatMap((s) => findXrefs(s.blocks));
    const lastXref = xrefs[xrefs.length - 1] as { t: 'xref'; page: string } | undefined;
    const slug = id.split('/').pop()!;
    const entry: VideoEntry = {
      slug,
      youtubeId: vids[0],
      title: p.title,
      lessonPage: lastXref?.page,
      order: order++,
      sourcePage: id,
      ...videoCorrections[slug],
    };
    videoRegistry.push(entry);
  }
  for (const slug of Object.keys(videoCorrections)) {
    if (!videoRegistry.some((v) => v.slug === slug)) {
      errors.push({ file: 'overlay.ts', line: 0, message: `videoCorrections key '${slug}' matches no registry entry` });
    }
  }
  for (const v of videoRegistry) {
    if (v.lessonPage && !pages.has(v.lessonPage)) {
      errors.push({ file: v.sourcePage, line: 0, message: `video lessonPage '${v.lessonPage}' is not a crawled page` });
    }
  }
}

// --- wizard ------------------------------------------------------------------

const pdfSource = v40;

const wizard: WizardStep[] = wizardSteps.map((def) => {
  for (const c of def.content) {
    const p = pages.get(c.page);
    if (!p) {
      errors.push({ file: 'overlay.ts', line: 0, message: `wizard step '${def.id}' references unknown page '${c.page}'` });
      continue;
    }
    if (c.section) {
      const bySection = p.sections.some((s) => s.id === c.section);
      const byAnchor = anchorMap.get(c.section);
      if (!bySection && (!byAnchor || byAnchor.page !== c.page)) {
        errors.push({ file: 'overlay.ts', line: 0, message: `wizard step '${def.id}': section '${c.section}' not found on '${c.page}'` });
      } else if (!bySection && byAnchor) {
        c.section = byAnchor.section;
      }
    }
  }
  for (const v of def.videos ?? []) {
    if (!videoRegistry.some((r) => r.slug === v)) {
      errors.push({ file: 'overlay.ts', line: 0, message: `wizard step '${def.id}' references unknown video slug '${v}'` });
    }
  }
  let pdf: string | undefined;
  if (def.pdf) {
    if (!existsExact(PDFS, pdfSource)) {
      errors.push({ file: 'overlay.ts', line: 0, message: `assembly pdf '${pdfSource}' not found in ${PDFS}` });
    }
    pdf = '/content/pdf/picar-x-assembly.pdf';
  }
  return { ...def, pdf };
});

// --- bail on errors before any output ---------------------------------------

if (errors.length) {
  console.error(`\n✗ content build failed with ${errors.length} error(s):\n`);
  for (const e of errors) console.error(`  ${e.file}:${e.line || '?'} — ${e.message}`);
  process.exit(1);
}

// --- highlight code ----------------------------------------------------------

const highlighter = await createHighlighter({
  themes: ['github-light', 'github-dark'],
  langs: ['bash', 'python', 'json'],
});

function highlightBlocks(blocks: Block[]): void {
  for (const b of blocks) {
    if (b.t === 'code') {
      b.html = highlighter.codeToHtml(b.code, {
        lang: b.lang === 'text' ? 'text' : b.lang,
        themes: { light: 'github-light', dark: 'github-dark' },
        defaultColor: 'light-dark()',
      });
    } else if (b.t === 'admonition') highlightBlocks(b.blocks);
    else if (b.t === 'list') for (const it of b.items) highlightBlocks(it);
    else if (b.t === 'table') {
      for (const c of b.header) highlightBlocks(c);
      for (const r of b.rows) for (const c of r) highlightBlocks(c);
    }
  }
}
for (const p of pages.values()) for (const s of p.page!.sections) highlightBlocks(s.blocks);

// --- emit ---------------------------------------------------------------------

// Render only into private staging; the coordinator replaces managed roots.

for (const p of pages.values()) {
  const out = join(OUT_PAGES, `${p.id}.json`);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, JSON.stringify(p.page, null, 2));
}
mkdirSync(OUT_CONTENT, { recursive: true });
writeFileSync(join(OUT_CONTENT, 'nav.json'), JSON.stringify(nav, null, 2));
writeFileSync(join(OUT_CONTENT, 'search-index.json'), JSON.stringify(searchIndex, null, 2));
writeFileSync(join(OUT_CONTENT, 'videos.json'), JSON.stringify(videoRegistry, null, 2));
writeFileSync(join(OUT_CONTENT, 'wizard.json'), JSON.stringify(wizard, null, 2));

for (const rel of imageAssets) {
  if (denied(rel)) continue;
  const dest = join(OUT_PUBLIC, 'img', rel);
  mkdirSync(dirname(dest), { recursive: true });
  copyFileSync(join(DOCS, rel), dest);
}
for (const rel of videoAssets) {
  if (denied(rel)) continue;
  const dest = join(OUT_PUBLIC, rel);
  mkdirSync(dirname(dest), { recursive: true });
  copyFileSync(join(DOCS, '_static', rel), dest);
}
mkdirSync(join(OUT_PUBLIC, 'pdf'), { recursive: true });
copyFileSync(join(PDFS, pdfSource), join(OUT_PUBLIC, 'pdf', 'picar-x-assembly.pdf'));

preservePrivate(APP, OUT_PUBLIC);
safeMirror(APP, OUT_PUBLIC, join(STAGE, '.content-publication/safe-public'));
try {
  publish(APP, STAGE, () => verifySource(APP));
} catch (error) {
  recover(APP);
  throw error;
}
release();
console.log(`✓ content build OK`);
console.log(`  pages:   ${pages.size}`);
console.log(`  images:  ${imageAssets.size}`);
console.log(`  videos:  ${videoRegistry.length} registry entries`);
console.log(`  search:  ${searchIndex.length} sections indexed`);
console.log(`  wizard:  ${wizard.length} steps`);
