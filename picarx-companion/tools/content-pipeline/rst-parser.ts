// Line-based recursive-descent parser for the exact RST subset used by the
// SunFounder PiCar-X docs. Anything outside the inventoried whitelist is a
// collected hard error — silent content loss must be impossible.

export interface ParseError {
  file: string;
  line: number;
  message: string;
}

// Parser-stage blocks. Paragraph text is left raw here; inline markup is
// resolved in transform.ts once all substitutions and anchors are known.
export type RawBlock =
  | { t: 'heading'; level: number; text: string; line: number }
  | { t: 'anchor'; name: string }
  | { t: 'p'; raw: string; line: number }
  | { t: 'code'; lang: string; code: string; runnable: boolean; line: number }
  | { t: 'image'; src: string; width?: string; align?: string; line: number }
  | { t: 'admonition'; kind: 'note' | 'warning' | 'tip' | 'important'; blocks: RawBlock[] }
  | { t: 'list'; ordered: boolean; start?: number; items: RawBlock[][] }
  | { t: 'table'; widths?: number[]; header: RawBlock[][]; rows: RawBlock[][][]; line: number }
  | { t: 'rawhtml'; html: string; line: number }
  | { t: 'toctree'; entries: { target: string; title?: string }[]; line: number }
  | { t: 'transition' };

export interface ParsedFile {
  blocks: RawBlock[];
  /** file-local `.. |name| raw:: html` substitution definitions */
  substitutions: Map<string, string>;
}

interface Line {
  text: string; // rtrimmed, WITHOUT leading indent
  indent: number;
  no: number; // 1-based
  blank: boolean;
}

const ADMONITIONS = new Set(['note', 'warning', 'tip', 'important']);
const HEADING_CHARS = new Set(['=', '-', '^', '~']);

export function parseRst(source: string, file: string, errors: ParseError[]): ParsedFile {
  const rawLines = source.split('\n');
  const lines: Line[] = rawLines.map((l, i) => {
    const rtrimmed = l.replace(/\s+$/, '');
    if (rtrimmed.includes('\t')) {
      errors.push({ file, line: i + 1, message: 'tab character in source' });
    }
    const indent = rtrimmed.length - rtrimmed.trimStart().length;
    return { text: rtrimmed.trimStart(), indent, no: i + 1, blank: rtrimmed.length === 0 };
  });

  const substitutions = new Map<string, string>();
  // Per-document heading level assignment: order of first appearance (docutils).
  const headingOrder: string[] = [];

  const err = (line: number, message: string) => errors.push({ file, line, message });

  /** Body of an explicit-markup construct: lines below `start` (within `win`)
   * indented deeper than `parentIndent`, up to the first non-blank line at
   * <= parentIndent. */
  function bodyRange(win: Line[], start: number, parentIndent: number): [number, number] {
    let end = start;
    for (let j = start; j < win.length; j++) {
      const l = win[j];
      if (l.blank) continue;
      if (l.indent <= parentIndent) break;
      end = j + 1;
    }
    return [start, end];
  }

  /** Dedent a window of lines to their own minimum indent and drop the common prefix. */
  function dedent(win: Line[]): Line[] {
    const min = Math.min(...win.filter((l) => !l.blank).map((l) => l.indent));
    if (!isFinite(min)) return [];
    return win.map((l) => (l.blank ? l : { ...l, indent: l.indent - min }));
  }

  function parseDirectiveOptions(
    body: Line[],
    allowed: Set<string>,
    lineNo: number,
  ): { options: Map<string, string>; content: Line[] } {
    const options = new Map<string, string>();
    let i = 0;
    while (i < body.length && !body[i].blank) {
      const m = body[i].text.match(/^:([\w-]+):\s*(.*)$/);
      if (!m) break;
      if (!allowed.has(m[1])) {
        err(body[i].no, `unknown directive option :${m[1]}:`);
      }
      options.set(m[1], m[2]);
      i++;
    }
    // skip blank separator lines
    while (i < body.length && body[i].blank) i++;
    void lineNo;
    return { options, content: body.slice(i) };
  }

  function linesToText(win: Line[]): string {
    const ded = dedent(win);
    return ded.map((l) => (l.blank ? '' : ' '.repeat(l.indent) + l.text)).join('\n');
  }

  function parseDirective(name: string, args: string, dLine: Line, body: Line[]): RawBlock | null {
    switch (name) {
      case 'code-block': {
        const { options, content } = parseDirectiveOptions(body, new Set(['emphasize-lines']), dLine.no);
        const emph = options.get('emphasize-lines');
        if (emph !== undefined && emph !== '0') {
          err(dLine.no, `unsupported :emphasize-lines: value '${emph}'`);
        }
        let lang = args.trim() || 'text';
        if (lang === 'none') lang = 'text';
        if (!['bash', 'python', 'json', 'text'].includes(lang)) {
          err(dLine.no, `unknown code-block language '${lang}'`);
          lang = 'text';
        }
        return { t: 'code', lang, code: linesToText(content), runnable: false, line: dLine.no };
      }
      case 'image': {
        const { options } = parseDirectiveOptions(body, new Set(['width', 'align']), dLine.no);
        const align = options.get('align');
        if (align !== undefined && align !== 'center') {
          err(dLine.no, `unsupported image :align: '${align}'`);
        }
        return {
          t: 'image',
          src: args.trim(),
          width: options.get('width'),
          align,
          line: dLine.no,
        };
      }
      case 'note':
      case 'warning':
      case 'tip':
      case 'important': {
        const blocks = parseBlocks(dedent(body));
        return { t: 'admonition', kind: name, blocks };
      }
      case 'raw': {
        if (args.trim() !== 'html') {
          err(dLine.no, `unsupported raw format '${args.trim()}'`);
          return null;
        }
        return { t: 'rawhtml', html: linesToText(body), line: dLine.no };
      }
      case 'list-table': {
        const { options, content } = parseDirectiveOptions(
          body,
          new Set(['widths', 'header-rows']),
          dLine.no,
        );
        const headerRows = parseInt(options.get('header-rows') ?? '0', 10);
        const widths = options
          .get('widths')
          ?.split(/\s+/)
          .filter(Boolean)
          .map((w) => parseInt(w, 10));
        const parsed = parseBlocks(dedent(content));
        const listBlocks = parsed.filter((b) => b.t !== 'anchor');
        if (listBlocks.length !== 1 || listBlocks[0].t !== 'list') {
          err(dLine.no, 'list-table body is not a single bullet list');
          return null;
        }
        const rows: RawBlock[][][] = [];
        for (const item of listBlocks[0].items) {
          const inner = item.filter((b) => b.t !== 'anchor');
          if (inner.length !== 1 || inner[0].t !== 'list') {
            err(dLine.no, 'list-table row is not a single nested bullet list');
            return null;
          }
          rows.push(inner[0].items);
        }
        const header = rows.slice(0, headerRows);
        return {
          t: 'table',
          widths,
          header: header.length ? header[0] : [],
          rows: rows.slice(headerRows),
          line: dLine.no,
        } as RawBlock;
      }
      case 'toctree': {
        const { options, content } = parseDirectiveOptions(body, new Set(['maxdepth']), dLine.no);
        void options;
        const entries: { target: string; title?: string }[] = [];
        for (const l of content) {
          if (l.blank) continue;
          const m = l.text.match(/^(.*?)\s*<([^>]+)>$/);
          if (m) entries.push({ target: m[2], title: m[1] || undefined });
          else entries.push({ target: l.text });
        }
        return { t: 'toctree', entries, line: dLine.no };
      }
      default:
        err(dLine.no, `unknown directive '${name}::'`);
        return null;
    }
  }

  /** Parse a window of lines (already dedented so top-level content is at indent 0). */
  function parseBlocks(win: Line[]): RawBlock[] {
    const blocks: RawBlock[] = [];
    let i = 0;

    const skipBlanks = () => {
      while (i < win.length && win[i].blank) i++;
    };

    while (i < win.length) {
      skipBlanks();
      if (i >= win.length) break;
      const line = win[i];

      if (line.indent > 0) {
        // Block quote (indented run not owned by a construct). docutils still
        // parses body elements (directives, lists, ...) inside it, so recurse
        // and inline the result rather than flattening to text.
        const start = i;
        while (i < win.length && (win[i].blank || win[i].indent > 0)) i++;
        let end = i;
        while (end > start && win[end - 1].blank) end--;
        blocks.push(...parseBlocks(dedent(win.slice(start, end))));
        continue;
      }

      // --- explicit markup: substitution def / anchor / directive / comment ---
      if (line.text.startsWith('..') && (line.text === '..' || /^\.\.\s/.test(line.text) || /^\.\.\|/.test(line.text))) {
        const subDef = line.text.match(/^\.\.\s+\|([^|]+)\|\s+raw::\s*html\s*$/);
        if (subDef) {
          const [bs, be] = bodyRange(win, i + 1, line.indent);
          substitutions.set(subDef[1], linesToText(win.slice(bs, be)).trim());
          i = be;
          continue;
        }
        const anchor = line.text.match(/^\.\.\s+_([\w.-]+):\s*$/);
        if (anchor) {
          blocks.push({ t: 'anchor', name: anchor[1] });
          i++;
          continue;
        }
        const directive = line.text.match(/^\.\.\s+([\w-]+)::\s*(.*)$/);
        if (directive) {
          const [bs, be] = bodyRange(win, i + 1, line.indent);
          const block = parseDirective(directive[1], directive[2], line, win.slice(bs, be));
          if (block) blocks.push(block);
          i = be;
          continue;
        }
        // Comment (includes `.. start_xxx` region markers and commented-out RST).
        const [, ce] = bodyRange(win, i + 1, line.indent);
        i = ce > i + 1 ? ce : i + 1;
        continue;
      }

      // --- transition: standalone ---- line ---
      if (/^-{4,}$/.test(line.text)) {
        const next = win[i + 1];
        if (!next || next.blank) {
          blocks.push({ t: 'transition' });
          i++;
          continue;
        }
      }

      // --- heading: text line + underline line ---
      const next = win[i + 1];
      if (
        next &&
        !next.blank &&
        next.indent === line.indent &&
        /^(.)\1+$/.test(next.text) &&
        HEADING_CHARS.has(next.text[0]) &&
        !/^(.)\1+$/.test(line.text)
      ) {
        if (next.text.length < line.text.length) {
          err(next.no, 'heading underline shorter than title');
        }
        const ch = next.text[0];
        if (!headingOrder.includes(ch)) headingOrder.push(ch);
        const level = headingOrder.indexOf(ch) + 1;
        if (level > 4) err(line.no, 'heading nesting deeper than 4 levels');
        blocks.push({ t: 'heading', level, text: line.text, line: line.no });
        i += 2;
        continue;
      }

      // --- lists ---
      const bullet = line.text.match(/^([*-])(\s+)(.*)$/);
      const enumerated = line.text.match(/^(#|\d+)\.(\s+)(.*)$/);
      if (bullet || enumerated) {
        const ordered = !!enumerated;
        const bulletChar = bullet ? bullet[1] : null;
        const items: RawBlock[][] = [];
        let start: number | undefined;
        if (enumerated && enumerated[1] !== '#') {
          const n = parseInt(enumerated[1], 10);
          if (n !== 1) start = n;
        }
        while (i < win.length) {
          skipBlanks();
          if (i >= win.length) break;
          const il = win[i];
          if (il.blank || il.indent !== line.indent) break;
          const m = ordered
            ? il.text.match(/^(#|\d+)\.(\s+)(.*)$/)
            : il.text.match(/^([*-])(\s+)(.*)$/);
          if (!m) break;
          if (!ordered && m[1] !== bulletChar) break; // different bullet char = new list
          const markerLen = m[1].length + (ordered ? 1 : 0) + m[2].length;
          const contentIndent = il.indent + markerLen;
          // First content line, re-expressed at contentIndent:
          const itemLines: Line[] = [{ text: m[3], indent: contentIndent, no: il.no, blank: m[3] === '' }];
          i++;
          while (i < win.length) {
            const cl = win[i];
            if (cl.blank) {
              itemLines.push(cl);
              i++;
              continue;
            }
            if (cl.indent >= contentIndent) {
              itemLines.push(cl);
              i++;
              continue;
            }
            break;
          }
          // Trim trailing blanks
          while (itemLines.length && itemLines[itemLines.length - 1].blank) itemLines.pop();
          items.push(parseBlocks(dedent(itemLines)));
        }
        blocks.push({ t: 'list', ordered, start, items });
        continue;
      }

      // --- field list at top level would be a parse bug upstream ---
      if (/^:[\w-]+:\s/.test(line.text)) {
        err(line.no, `unexpected field/option line outside directive: '${line.text.slice(0, 40)}'`);
        i++;
        continue;
      }

      // --- paragraph ---
      const start = i;
      let endEx = i;
      while (endEx < win.length && !win[endEx].blank && win[endEx].indent >= line.indent) {
        // Stop before a heading (its text line is followed by an underline).
        const after = win[endEx + 1];
        const isHeadingText =
          after &&
          !after.blank &&
          /^(.)\1+$/.test(after.text) &&
          HEADING_CHARS.has(after.text[0]) &&
          !/^(.)\1+$/.test(win[endEx].text);
        if (isHeadingText && endEx > start) break;
        // Stop at explicit markup / list markers on subsequent lines (RST requires
        // blank lines around them, but be safe).
        if (endEx > start && (/^\.\.\s/.test(win[endEx].text) || /^([*-]|\d+\.|#\.)\s/.test(win[endEx].text))) break;
        endEx++;
        if (isHeadingText) break;
      }
      blocks.push({
        t: 'p',
        raw: win
          .slice(start, endEx)
          .map((l) => l.text)
          .join('\n'),
        line: line.no,
      });
      i = endEx;
    }
    return blocks;
  }

  const blocks = parseBlocks(lines);
  return { blocks, substitutions };
}
