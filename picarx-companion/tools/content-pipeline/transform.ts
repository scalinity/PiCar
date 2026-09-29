// Transform passes: raw-html classification, run-marker fusion, boilerplate
// stripping, sectionizing, and RawBlock → Block conversion with inline parsing.

import type { RawBlock, ParseError } from './rst-parser';
import type { Block, Inline, Section } from '../../src/lib/content-types';
import { imagePathFixes } from './overlay';

export const EXCLUDED = (pageId: string): boolean =>
  pageId.startsWith('ezblock/') || pageId.includes('fusion_hat');

// :ref: labels that live in excluded content → fall back to the published site.
export const EXTERNAL_REFS: Record<string, { href: string; title: string }> = {
  play_ezblock: {
    href: 'https://docs.sunfounder.com/projects/picar-x-v20/en/latest/ezblock/play_with_ezblock.html',
    title: 'Play with Ezblock',
  },
  ezb_servo_adjust: {
    href: 'https://docs.sunfounder.com/projects/picar-x-v20/en/latest/ezblock/play_with_ezblock.html',
    title: 'Servo Adjust (Ezblock docs)',
  },
};

// ---------------------------------------------------------------------------
// Pass 1: classify raw html into video / localVideo / run-marker
// ---------------------------------------------------------------------------

export type MidBlock = RawBlock | { t: 'video'; youtubeId: string } | { t: 'localVideo'; src: string } | { t: 'runmarker' };

export function classifyRawHtml(blocks: RawBlock[], file: string, errors: ParseError[]): MidBlock[] {
  const out: MidBlock[] = [];
  for (const b of blocks) {
    if (b.t === 'rawhtml') {
      const yt = b.html.match(/youtube(?:-nocookie)?\.com\/embed\/([\w-]+)/);
      if (yt) {
        out.push({ t: 'video', youtubeId: yt[1] });
        continue;
      }
      if (/<run>\s*<\/run>/.test(b.html)) {
        out.push({ t: 'runmarker' });
        continue;
      }
      if (/<video[\s>]/.test(b.html)) {
        const src = b.html.match(/<source[^>]*src="([^"]+)"/);
        if (!src) {
          errors.push({ file, line: b.line, message: 'raw <video> without <source src>' });
          continue;
        }
        out.push({ t: 'localVideo', src: src[1] });
        continue;
      }
      errors.push({ file, line: b.line, message: `unrecognized raw html: ${b.html.slice(0, 60)}` });
      continue;
    }
    if (b.t === 'admonition') {
      out.push({ ...b, blocks: classifyRawHtml(b.blocks, file, errors) as RawBlock[] });
    } else if (b.t === 'list') {
      out.push({ ...b, items: b.items.map((it) => classifyRawHtml(it, file, errors) as RawBlock[]) });
    } else if (b.t === 'table') {
      out.push({
        ...b,
        header: b.header.map((c) => classifyRawHtml(c, file, errors) as RawBlock[]),
        rows: b.rows.map((r) => r.map((c) => classifyRawHtml(c, file, errors) as RawBlock[])),
      });
    } else {
      out.push(b);
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Pass 2: fuse <run></run> markers into the following code block
// ---------------------------------------------------------------------------

export function fuseRunMarkers(blocks: MidBlock[], file: string, errors: ParseError[]): MidBlock[] {
  const out: MidBlock[] = [];
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    if (b.t === 'runmarker') {
      const next = blocks[i + 1];
      if (next && next.t === 'code') {
        next.runnable = true;
      } else {
        errors.push({ file, line: 0, message: '<run></run> marker not followed by a code block' });
      }
      continue;
    }
    if (b.t === 'admonition') {
      out.push({ ...b, blocks: fuseRunMarkers(b.blocks, file, errors) as RawBlock[] });
    } else if (b.t === 'list') {
      out.push({ ...b, items: b.items.map((it) => fuseRunMarkers(it, file, errors) as RawBlock[]) });
    } else if (b.t === 'table') {
      out.push({
        ...b,
        header: b.header.map((c) => fuseRunMarkers(c, file, errors) as RawBlock[]),
        rows: b.rows.map((r) => r.map((c) => fuseRunMarkers(c, file, errors) as RawBlock[])),
      });
    } else {
      out.push(b);
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Pass 3: strip the Facebook community boilerplate note
// ---------------------------------------------------------------------------

function rawTextOf(blocks: MidBlock[]): string {
  let s = '';
  for (const b of blocks) {
    if (b.t === 'p') s += b.raw + '\n';
    else if (b.t === 'admonition') s += rawTextOf(b.blocks);
    else if (b.t === 'list') for (const it of b.items) s += rawTextOf(it);
  }
  return s;
}

export function stripFacebookNotes(blocks: MidBlock[]): MidBlock[] {
  return blocks.filter(
    (b) => !(b.t === 'admonition' && b.kind === 'note' && rawTextOf(b.blocks).includes('|link_sf_facebook|')),
  );
}

// ---------------------------------------------------------------------------
// Pass 4: sectionize — flat Section list, anchors attached
// ---------------------------------------------------------------------------

export interface SectionDraft {
  id: string;
  level: number;
  titleRaw: string;
  anchors: string[];
  blocks: MidBlock[];
}

export function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'section'
  );
}

/** Strip inline markup syntax for display/slug purposes. */
export function plainTitle(raw: string): string {
  return raw
    .replace(/``([^`]+)``/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/:ref:`([^`<]+?)(?:\s*<[^>]+>)?`/g, '$1')
    .trim();
}

export function sectionize(blocks: MidBlock[], pageId: string): SectionDraft[] {
  const sections: SectionDraft[] = [];
  const usedIds = new Set<string>();
  let pending: string[] = [];
  let current: SectionDraft | null = null;

  const uniqueId = (base: string) => {
    let id = base;
    let n = 2;
    while (usedIds.has(id)) id = `${base}-${n++}`;
    usedIds.add(id);
    return id;
  };

  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    if (b.t === 'anchor') {
      // Attach to the upcoming heading if one is next; otherwise to the current section.
      const next = blocks[i + 1];
      if (next && next.t === 'heading') pending.push(b.name);
      else if (current) current.anchors.push(b.name);
      else pending.push(b.name);
      continue;
    }
    if (b.t === 'heading') {
      current = {
        id: uniqueId(slugify(plainTitle(b.text))),
        level: b.level,
        titleRaw: b.text,
        anchors: pending,
        blocks: [],
      };
      pending = [];
      sections.push(current);
      continue;
    }
    if (!current) {
      current = { id: uniqueId('preamble'), level: 1, titleRaw: '', anchors: pending, blocks: [] };
      pending = [];
      sections.push(current);
    }
    current.blocks.push(b);
  }
  void pageId;
  return sections;
}

// ---------------------------------------------------------------------------
// Pass 5: RawBlock → Block conversion with inline parsing
// ---------------------------------------------------------------------------

export interface ConvertCtx {
  pageId: string;
  file: string;
  errors: ParseError[];
  substitutions: Map<string, string>; // global (conf.py) merged with file-local
  anchorMap: Map<string, { page: string; section: string; title: string }>;
  /** collects root-relative image paths that must exist and be copied */
  imageAssets: Set<string>;
  /** collects _static-relative local video paths */
  videoAssets: Set<string>;
  resolveToctree: (target: string, fromPage: string) => { page: string; title: string } | 'excluded' | null;
}

const INLINE_RX = new RegExp(
  [
    ':ref:`([^`]+)`', // 1: ref
    ':download:`([^`]*?)<([^>`]+)>`', // 2,3: download
    '``((?:[^`]|`(?!`))+)``', // 4: literal
    '`([^`<]+?)\\s*<([^>`]+)>`__?', // 5,6: embedded-URI link
    '\\*\\*([^*]+(?:\\*(?!\\*)[^*]*)*)\\*\\*', // 7: strong
    '\\*([^\\s*][^*]*?)\\*', // 8: em
    '\\|([\\w-]+)\\|', // 9: substitution
    '(https?://[^\\s<>]+[^\\s<>.,;:!?)\\]])', // 10: bare URL
  ].join('|'),
  'g',
);

function cleanText(s: string): string {
  return s.replace(/\\ /g, '').replace(/\\([*|`])/g, '$1');
}

export function parseInlines(raw: string, ctx: ConvertCtx, line: number): Inline[] {
  const out: Inline[] = [];
  const text = raw.replace(/\s*\n\s*/g, ' ');
  let last = 0;
  INLINE_RX.lastIndex = 0;
  let m: RegExpExecArray | null;

  const pushText = (s: string) => {
    if (!s) return;
    const leftovers = s.match(/``|\*\*|:ref:|:download:/);
    if (leftovers) {
      ctx.errors.push({
        file: ctx.file,
        line,
        message: `unparsed inline markup near '${s.slice(Math.max(0, (leftovers.index ?? 0) - 15), (leftovers.index ?? 0) + 20)}'`,
      });
    }
    out.push({ t: 'text', v: cleanText(s) });
  };

  while ((m = INLINE_RX.exec(text))) {
    pushText(text.slice(last, m.index));
    last = INLINE_RX.lastIndex;
    if (m[1] !== undefined) {
      // :ref:`label` or :ref:`Title <label>`
      const titled = m[1].match(/^(.*?)\s*<([^>]+)>$/);
      const label = titled ? titled[2] : m[1];
      const explicit = titled ? titled[1] : undefined;
      const target = ctx.anchorMap.get(label);
      if (target) {
        out.push({ t: 'xref', page: target.page, section: target.section, v: explicit || target.title });
      } else if (EXTERNAL_REFS[label]) {
        out.push({ t: 'link', href: EXTERNAL_REFS[label].href, v: explicit || EXTERNAL_REFS[label].title });
      } else {
        ctx.errors.push({ file: ctx.file, line, message: `unresolved :ref: label '${label}'` });
      }
    } else if (m[2] !== undefined) {
      out.push({ t: 'link', href: m[3].trim(), v: m[2].trim() });
    } else if (m[4] !== undefined) {
      out.push({ t: 'lit', v: m[4] });
    } else if (m[5] !== undefined) {
      out.push({ t: 'link', href: m[6].trim(), v: m[5].trim() });
    } else if (m[7] !== undefined) {
      out.push({ t: 'strong', v: cleanText(m[7]) });
    } else if (m[8] !== undefined) {
      out.push({ t: 'em', v: cleanText(m[8]) });
    } else if (m[9] !== undefined) {
      const def = ctx.substitutions.get(m[9]);
      if (def === undefined) {
        ctx.errors.push({ file: ctx.file, line, message: `undefined substitution |${m[9]}|` });
      } else {
        const a = def.match(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/);
        if (a) out.push({ t: 'link', href: a[1].trim(), v: a[2].trim() });
        else ctx.errors.push({ file: ctx.file, line, message: `substitution |${m[9]}| is not an <a> tag` });
      }
    } else if (m[10] !== undefined) {
      out.push({ t: 'link', href: m[10], v: m[10] });
    }
  }
  pushText(text.slice(last));
  return out;
}

function posixJoin(...parts: string[]): string {
  const segs: string[] = [];
  for (const part of parts.join('/').split('/')) {
    if (part === '' || part === '.') continue;
    if (part === '..') segs.pop();
    else segs.push(part);
  }
  return segs.join('/');
}

export function pageDir(pageId: string): string {
  const idx = pageId.lastIndexOf('/');
  return idx === -1 ? '' : pageId.slice(0, idx);
}

export function convertBlocks(blocks: MidBlock[], ctx: ConvertCtx): Block[] {
  const out: Block[] = [];
  for (const b of blocks) {
    switch (b.t) {
      case 'p':
        out.push({ t: 'p', inlines: parseInlines(b.raw, ctx, b.line) });
        break;
      case 'code':
        out.push({ t: 'code', lang: b.lang, code: b.code, runnable: b.runnable, html: '' });
        break;
      case 'image': {
        let rel = b.src.startsWith('/') ? b.src.slice(1) : posixJoin(pageDir(ctx.pageId), b.src);
        rel = imagePathFixes[rel] ?? rel;
        ctx.imageAssets.add(rel);
        out.push({ t: 'image', src: `/content/img/${rel}`, width: b.width, align: b.align });
        break;
      }
      case 'admonition':
        out.push({ t: 'admonition', kind: b.kind, blocks: convertBlocks(b.blocks, ctx) });
        break;
      case 'list':
        out.push({ t: 'list', ordered: b.ordered, start: b.start, items: b.items.map((it) => convertBlocks(it, ctx)) });
        break;
      case 'table':
        out.push({
          t: 'table',
          widths: b.widths,
          header: b.header.map((c) => convertBlocks(c, ctx)),
          rows: b.rows.map((r) => r.map((c) => convertBlocks(c, ctx))),
        });
        break;
      case 'video':
        out.push({ t: 'video', youtubeId: b.youtubeId });
        break;
      case 'localVideo': {
        const base = b.src.split('/').pop()!;
        ctx.videoAssets.add(b.src.replace(/^\/?_static\//, ''));
        out.push({ t: 'localVideo', src: `/content/${b.src.replace(/^\/?_static\//, '')}` });
        void base;
        break;
      }
      case 'toctree': {
        const entries: { page: string; title: string }[] = [];
        for (const e of b.entries) {
          const resolved = ctx.resolveToctree(e.target, ctx.pageId);
          if (resolved === 'excluded' || resolved === null) continue;
          entries.push({ page: resolved.page, title: e.title || resolved.title });
        }
        out.push({ t: 'links', entries });
        break;
      }
      case 'transition':
        out.push({ t: 'transition' });
        break;
      case 'heading':
      case 'anchor':
      case 'rawhtml':
      case 'runmarker':
        ctx.errors.push({
          file: ctx.file,
          line: 'line' in b ? (b as { line: number }).line : 0,
          message: `internal: unexpected ${b.t} block survived to conversion`,
        });
        break;
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Search text extraction
// ---------------------------------------------------------------------------

export function inlineText(inlines: Inline[]): string {
  return inlines.map((i) => i.v).join('');
}

export function blockText(blocks: Block[]): string {
  let s = '';
  for (const b of blocks) {
    if (b.t === 'p') s += inlineText(b.inlines) + ' ';
    else if (b.t === 'admonition') s += blockText(b.blocks);
    else if (b.t === 'list') for (const it of b.items) s += blockText(it);
    else if (b.t === 'table') {
      for (const c of b.header) s += blockText(c);
      for (const r of b.rows) for (const c of r) s += blockText(c);
    }
  }
  return s;
}

export type { Section };
