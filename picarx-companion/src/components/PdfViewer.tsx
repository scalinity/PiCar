import { useState } from 'react';
import * as pdfjs from 'pdfjs-dist';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { update, useProgress } from '../lib/progress-store';

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

// Lazy per-URL document cache; loading starts on first mount (ref callback),
// not at module import.
const docCache = new Map<string, Promise<PDFDocumentProxy>>();
const loadDoc = (url: string) => {
  let p = docCache.get(url);
  if (!p) {
    p = pdfjs.getDocument({ url }).promise;
    docCache.set(url, p);
  }
  return p;
};

export function PdfViewer({ src }: { src: string }) {
  const { pdfLastPage } = useProgress();
  const [doc, setDoc] = useState<PDFDocumentProxy | null>(null);
  const [failed, setFailed] = useState(false);
  const [zoom, setZoom] = useState(1.2);
  const page = doc ? Math.min(Math.max(1, pdfLastPage), doc.numPages) : 1;
  const setPage = (n: number) => update({ pdfLastPage: n });

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
        {failed && <p className="pdf-error">Could not load the PDF.</p>}
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
