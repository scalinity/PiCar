import { useState } from 'react';

export function CodeBlock({ code, html, runnable }: { code: string; html: string; runnable: boolean }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className={`code-block ${runnable ? 'runnable' : ''}`}>
      <div className="code-toolbar">
        {runnable && <span className="run-badge">▶ run on your Pi</span>}
        <button
          className="copy-btn"
          onClick={() => {
            void navigator.clipboard.writeText(code).then(() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 1200);
            });
          }}
        >
          {copied ? 'Copied ✓' : 'Copy'}
        </button>
      </div>
      {/* Trusted HTML: generated at build time by shiki from the docs source. */}
      <div className="code-html" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
