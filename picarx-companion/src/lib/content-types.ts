// Shared contract between the content pipeline (tools/content-pipeline) and the app.
// The pipeline emits JSON conforming to these types; the app renders it.

export type Inline =
  | { t: 'text'; v: string }
  | { t: 'strong'; v: string }
  | { t: 'em'; v: string }
  | { t: 'lit'; v: string }
  | { t: 'link'; href: string; v: string }
  | { t: 'xref'; page: string; section: string; v: string };

export type AdmonitionKind = 'note' | 'warning' | 'tip' | 'important';

export type Block =
  | { t: 'p'; inlines: Inline[] }
  | { t: 'code'; lang: string; code: string; runnable: boolean; html: string }
  | { t: 'image'; src: string; width?: string; align?: string }
  | { t: 'admonition'; kind: AdmonitionKind; blocks: Block[] }
  | { t: 'list'; ordered: boolean; start?: number; items: Block[][] }
  | { t: 'table'; widths?: number[]; header: Block[][]; rows: Block[][][] }
  | { t: 'video'; youtubeId: string }
  | { t: 'localVideo'; src: string }
  | { t: 'links'; entries: { page: string; title: string }[] }
  | { t: 'transition' };

export interface Section {
  id: string;
  level: number;
  title: string;
  anchors: string[];
  blocks: Block[];
}

export interface Page {
  id: string; // source path without extension, e.g. 'python/python_move'
  title: string;
  sections: Section[];
}

export interface NavNode {
  page: string;
  title: string;
  children?: NavNode[];
}

export interface SearchEntry {
  page: string;
  section: string;
  heading: string;
  text: string;
}

export interface VideoEntry {
  slug: string; // page basename, e.g. 'video_1_move', 'assemble'
  youtubeId: string;
  title: string;
  lessonPage?: string;
  order: number;
  sourcePage: string;
}

export interface WizardStep {
  assemblyLauncher?: boolean;
  id: string;
  title: string;
  intro?: string;
  content: { page: string; section?: string }[];
  videos?: string[]; // VideoEntry slugs
  pdf?: string; // app URL, e.g. '/content/pdf/picar-x-assembly.pdf'
  checklist?: { id: string; label: string }[];
}
