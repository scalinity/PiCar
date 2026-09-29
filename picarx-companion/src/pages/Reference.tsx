import { nav, pages } from '../content';
import type { NavNode } from '../lib/content-types';
import { refHref } from '../lib/router';
import { SectionView } from '../components/RstRenderer';
import { SearchBox } from '../components/SearchBox';

function flatten(nodes: NavNode[], out: string[] = []): string[] {
  for (const n of nodes) {
    out.push(n.page);
    if (n.children) flatten(n.children, out);
  }
  return out;
}
const ORDER = [...new Set(flatten(nav))];

function NavTree({ nodes, active }: { nodes: NavNode[]; active: string }) {
  return (
    <ul className="nav-tree">
      {nodes.map((n) => (
        <li key={n.page}>
          <a href={refHref(n.page)} className={n.page === active ? 'active' : ''}>
            {n.title}
          </a>
          {n.children && <NavTree nodes={n.children} active={active} />}
        </li>
      ))}
    </ul>
  );
}

export function Reference({ page, section }: { page: string; section?: string }) {
  const doc = page ? pages.get(page) : undefined;
  const idx = doc ? ORDER.indexOf(doc.id) : -1;
  const prev = idx > 0 ? pages.get(ORDER[idx - 1]) : undefined;
  const next = idx >= 0 && idx < ORDER.length - 1 ? pages.get(ORDER[idx + 1]) : undefined;

  return (
    <>
      <aside className="ref-sidebar">
        <SearchBox />
        <NavTree nodes={nav} active={page} />
      </aside>
      <main className="page doc" key={page || '(index)'}>
        {doc ? (
          <>
            <article className="doc-body">
              {doc.sections.map((s) => (
                <SectionView key={s.id} section={s} scrollTo={s.id === section} />
              ))}
            </article>
            <nav className="doc-pager">
              {prev ? (
                <a href={refHref(prev.id)} className="pager prev">
                  ← {prev.title}
                </a>
              ) : (
                <span />
              )}
              {next ? (
                <a href={refHref(next.id)} className="pager next">
                  {next.title} →
                </a>
              ) : (
                <span />
              )}
            </nav>
          </>
        ) : (
          <div className="doc-body">
            <h1>Reference</h1>
            <p>
              The complete official PiCar-X documentation, restructured for this app. Pick a page
              from the sidebar, or search.
            </p>
          </div>
        )}
      </main>
    </>
  );
}
