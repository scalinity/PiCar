// Tiny hash router. The snapshot is the raw hash string (stable reference),
// which satisfies useSyncExternalStore's caching contract.

import { useSyncExternalStore } from 'react';

export type Route =
  | { name: 'home' }
  | { name: 'wizard'; step: string }
  | { name: 'reference'; page: string; section?: string }
  | { name: 'videos'; slug?: string };

const subscribe = (cb: () => void) => {
  window.addEventListener('hashchange', cb);
  return () => window.removeEventListener('hashchange', cb);
};
const getSnapshot = () => window.location.hash || '#/';

export function useHash(): string {
  return useSyncExternalStore(subscribe, getSnapshot);
}

export function navigate(to: string): void {
  window.location.hash = to;
}

/** Routes: #/ · #/wizard/:stepId · #/reference · #/reference/<page/id>[?s=sectionId] · #/videos[/:slug] */
export function parseRoute(hash: string): Route {
  const [path, query] = hash.replace(/^#\/?/, '').split('?');
  const params = new URLSearchParams(query ?? '');
  const segs = path.split('/').filter(Boolean).map(decodeURIComponent);
  if (segs[0] === 'wizard') return { name: 'wizard', step: segs[1] ?? '' };
  if (segs[0] === 'reference') {
    return { name: 'reference', page: segs.slice(1).join('/'), section: params.get('s') ?? undefined };
  }
  if (segs[0] === 'videos') return { name: 'videos', slug: segs[1] };
  return { name: 'home' };
}

export const refHref = (page: string, section?: string): string =>
  `#/reference/${page}${section ? `?s=${section}` : ''}`;
