import { useState } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { update, useProgress } from '../lib/progress-store';
import { forgetV40Pdf, loadV40Pdf } from '../lib/v40-pdf';

// Loading starts on first mount (ref callback), not at module import.
const loadDoc = loadV40Pdf;

export function PdfViewer({ src, requestedPage }: { src: string; requestedPage?: number }) {
  const { pdfLastPage } = useProgress();
  const [doc, setDoc] = useState<PDFDocumentProxy | null>(null);
  const [failed, setFailed] = useState(false);
  const [zoom, setZoom] = useState(1.2);
  const [sourcePage, setSourcePage] = useState<number | undefined>(requestedPage);
  const page = doc ? Math.min(Math.max(1, sourcePage ?? pdfLastPage), doc.numPages) : 1;
  const setPage = (n: number) => { if (requestedPage !== undefined) setSourcePage(n); else update({ pdfLastPage: n }); };

  return (
    <div
      className="pdf-viewer"
      ref={(el) => {
        if (!el || doc || failed) return;
        let cancelled = false;
        loadDoc(src).then(
          (d) => !cancelled && setDoc(d),
          () => !cancelled && setFailed(true),
        );
        return () => {
          cancelled = true;
        };
      }}
    >
      <p>Z0104V40 · exact locked booklet bytes · owner photos withheld</p>
      <div className="pdf-toolbar">
        <button className="button" disabled={!doc || page <= 1} onClick={() => setPage(page - 1)}>
          ← Prev
        </button>
        <span className="pdf-pageinfo">
          Page{' '}
          <input
            type="number"
            min={1}
            max={doc?.numPages ?? 1}
            value={page}
            onChange={(e) => {
              const n = parseInt(e.target.value, 10);
              if (doc && n >= 1 && n <= doc.numPages) setPage(n);
            }}
          />{' '}
          of {doc?.numPages ?? '…'}
        </span>
        <button className="button" disabled={!doc || !!(doc && page >= doc.numPages)} onClick={() => setPage(page + 1)}>
          Next →
        </button>
        <span className="pdf-zoom">
          <button className="button" onClick={() => setZoom(Math.max(0.6, +(zoom - 0.2).toFixed(2)))}>
            −
          </button>
          <span>{Math.round(zoom * 100)}%</span>
          <button className="button" onClick={() => setZoom(Math.min(3, +(zoom + 0.2).toFixed(2)))}>
            +
          </button>
        </span>
      </div>
      <div className="pdf-canvas-wrap">
        {failed && <p className="pdf-error" role="alert">Could not load the verified V40 PDF. Source text remains available.<button className="button" onClick={() => { forgetV40Pdf(src); setFailed(false); }}>Retry exact booklet</button></p>}
        {doc && (
          <canvas
            key={`${page}@${zoom}`}
            ref={(canvas) => {
              if (!canvas) return;
              let cancelled = false;
              let renderTask: { cancel: () => void } | undefined;
              void doc.getPage(page).then((p) => {
                if (cancelled) return;
                const dpr = window.devicePixelRatio || 1;
                const viewport = p.getViewport({ scale: zoom * dpr });
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                canvas.style.width = `${viewport.width / dpr}px`;
                canvas.style.height = `${viewport.height / dpr}px`;
                const task = p.render({ canvas, canvasContext: canvas.getContext('2d')!, viewport });
                task.promise.catch(() => {}); // cancellation on unmount is expected
                renderTask = task;
              });
              return () => {
                cancelled = true;
                renderTask?.cancel();
              };
            }}
          />
        )}
      </div>
    </div>
  );
}
