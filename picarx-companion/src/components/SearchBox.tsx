import { useState } from 'react';
import { searchIndex } from '../content';
import { navigate, refHref } from '../lib/router';

interface Hit {
  page: string;
  section: string;
  heading: string;
  snippet: string;
  score: number;
}

function search(query: string): Hit[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  const hits: Hit[] = [];
  for (const e of searchIndex) {
    const inHeading = e.heading.toLowerCase().indexOf(q);
    const inText = e.text.toLowerCase().indexOf(q);
    if (inHeading === -1 && inText === -1) continue;
    const at = inText === -1 ? 0 : inText;
    const snippet =
      inText === -1
        ? e.text.slice(0, 90)
        : (at > 30 ? '…' : '') + e.text.slice(Math.max(0, at - 30), at + 60) + '…';
    hits.push({
      page: e.page,
      section: e.section,
      heading: e.heading,
      snippet,
      score: inHeading !== -1 ? 0 : 1,
    });
  }
  return hits.sort((a, b) => a.score - b.score).slice(0, 20);
}

export function SearchBox() {
  const [query, setQuery] = useState('');
  const hits = search(query);
  return (
    <div className="searchbox">
      <input
        type="search"
        placeholder="Search the docs…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {query.trim().length >= 2 && (
        <ul className="search-results">
          {hits.length === 0 && <li className="search-empty">No matches</li>}
          {hits.map((h, i) => (
            <li key={i}>
              <button
                onClick={() => {
                  setQuery('');
                  navigate(refHref(h.page, h.section));
                }}
              >
                <span className="search-heading">{h.heading}</span>
                <span className="search-snippet">{h.snippet}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
