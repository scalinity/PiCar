// Content access layer: everything the pipeline emitted, available synchronously.

import type { NavNode, Page, SearchEntry, VideoEntry, WizardStep } from '../lib/content-types';
import navJson from './nav.json';
import searchJson from './search-index.json';
import videosJson from './videos.json';
import wizardJson from './wizard.json';

const pageModules = import.meta.glob('./pages/**/*.json', { eager: true }) as Record<
  string,
  { default: Page }
>;

export const pages = new Map<string, Page>();
for (const m of Object.values(pageModules)) pages.set(m.default.id, m.default);

export const nav = navJson as unknown as NavNode[];
export const searchIndex = searchJson as unknown as SearchEntry[];
export const videos = videosJson as unknown as VideoEntry[];
export const wizard = wizardJson as unknown as WizardStep[];

export const videoBySlug = (slug: string): VideoEntry | undefined =>
  videos.find((v) => v.slug === slug);
