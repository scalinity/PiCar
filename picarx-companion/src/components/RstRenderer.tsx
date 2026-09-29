// The workhorse: pipeline JSON block nodes → React elements.

import type { Block, Inline, Section } from '../lib/content-types';
import { refHref } from '../lib/router';
import { CodeBlock } from './CodeBlock';
import { DocImage } from './DocImage';
import { VideoEmbed } from './VideoEmbed';

export function Inlines({ inlines }: { inlines: Inline[] }) {
  return (
    <>
      {inlines.map((node, i) => {
        switch (node.t) {
          case 'text':
            return node.v;
          case 'strong':
            return <strong key={i}>{node.v}</strong>;
          case 'em':
            return <em key={i}>{node.v}</em>;
          case 'lit':
            return <code key={i}>{node.v}</code>;
          case 'link':
            return (
              <a key={i} href={node.href} className="ext-link">
                {node.v}
              </a>
            );
          case 'xref':
            return (
              <a key={i} href={refHref(node.page, node.section)}>
                {node.v}
              </a>
            );
        }
      })}
    </>
  );
}

function BlockNode({ block }: { block: Block }) {
  switch (block.t) {
    case 'p':
      return (
        <p>
          <Inlines inlines={block.inlines} />
        </p>
      );
    case 'code':
      return <CodeBlock code={block.code} html={block.html} runnable={block.runnable} />;
    case 'image':
      return <DocImage src={block.src} width={block.width} align={block.align} />;
    case 'admonition':
      return (
        <aside className={`admonition ${block.kind}`}>
          <span className="admonition-label">{block.kind}</span>
          <Blocks blocks={block.blocks} />
        </aside>
      );
    case 'list': {
      const items = block.items.map((it, i) => (
        <li key={i}>
          <Blocks blocks={it} />
        </li>
      ));
      return block.ordered ? <ol start={block.start}>{items}</ol> : <ul>{items}</ul>;
    }
    case 'table':
      return (
        <table className="doc-table">
          {block.header.length > 0 && (
            <thead>
              <tr>
                {block.header.map((cell, i) => (
                  <th key={i}>
                    <Blocks blocks={cell} />
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {block.rows.map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => (
                  <td key={j}>
                    <Blocks blocks={cell} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );
    case 'video':
      return <VideoEmbed youtubeId={block.youtubeId} />;
    case 'localVideo':
      return <video className="doc-video" src={block.src} controls muted />;
    case 'links':
      return (
        <ul className="toc-links">
          {block.entries.map((e) => (
            <li key={e.page}>
              <a href={refHref(e.page)}>{e.title}</a>
            </li>
          ))}
        </ul>
      );
    case 'transition':
      return <hr />;
  }
}

export function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((b, i) => (
        <BlockNode key={i} block={b} />
      ))}
    </>
  );
}

const HTags = ['h1', 'h2', 'h3', 'h4'] as const;

export function SectionView({ section, scrollTo }: { section: Section; scrollTo?: boolean }) {
  const H = HTags[Math.min(section.level, 4) - 1];
  return (
    <section
      className="doc-section"
      id={section.id}
      ref={(el) => {
        if (el && scrollTo) el.scrollIntoView({ block: 'start' });
      }}
    >
      {section.title && <H>{section.title}</H>}
      <Blocks blocks={section.blocks} />
    </section>
  );
}
