// The printed manual's own panel for a step, rendered at runtime from the locked V40 booklet. Where the panel is comes
// only from the verified documentation source lock (tools/content-pipeline/documentation-source-lock.json), the record
// the Setup reference already uses; nothing is cropped by guess and no page image is stored.
import { useCallback, useState } from 'react';
import { loadV40Pdf } from '../../../lib/v40-pdf';
import { manualPanel } from './manual-map';
import type { StudioVariant } from '../../../lib/router';

// The panel is drawn at `width` CSS px, or smaller when that would make it taller than `maxHeight`.
export function ManualPanel({ step, variant, width, maxHeight = Infinity }: { step: number; variant: StudioVariant; width: number; maxHeight?: number }) {
  const mapping = manualPanel(step, variant);
  const [failed, setFailed] = useState(false);
  // Stable per panel and width, so a re-render never repaints the same panel.
  const draw = useCallback((canvas: HTMLCanvasElement | null) => {
    if (!canvas || !mapping) return;
    let cancelled = false;
    let task: { cancel(): void } | undefined;
    const [x0, y0, x1, y1] = mapping.normalizedRect;
    loadV40Pdf().then((doc) => doc.getPage(mapping.pdfPage)).then((page) => {
      if (cancelled) return;
      const base = page.getViewport({ scale: 1 });
      const cropW = (x1 - x0) * base.width, cropH = (y1 - y0) * base.height;
      const css = Math.min(width / cropW, maxHeight / cropH), dpr = window.devicePixelRatio || 1, scale = css * dpr;
      // Only the panel's rectangle is drawn: the page is offset so the panel's corner lands at the canvas origin.
      const viewport = page.getViewport({ scale, offsetX: -x0 * base.width * scale, offsetY: -y0 * base.height * scale });
      canvas.width = Math.round(cropW * scale);
      canvas.height = Math.round(cropH * scale);
      canvas.style.width = `${cropW * css}px`;
      canvas.style.height = `${cropH * css}px`;
      const render = page.render({ canvas, canvasContext: canvas.getContext('2d')!, viewport });
      task = render;
      render.promise.then(() => { if (!cancelled) canvas.dataset.ready = 'true'; }, () => {}); // cancellation is expected
    }).catch(() => { if (!cancelled) setFailed(true); });
    return () => { cancelled = true; task?.cancel(); };
  }, [mapping, width, maxHeight]);
  if (!mapping) return <p className="studio-hint">The verified manual record has no panel for this step on this board, so none is shown.</p>;
  if (failed) return <p className="studio-hint" role="alert">The locked V40 booklet could not be opened, so its panel is not shown.</p>;
  return <canvas className="studio-manual-canvas" ref={draw} style={{ width }} data-page={mapping.pdfPage} aria-label={`${mapping.photoPanel}, page ${mapping.pdfPage} of the V40 booklet`} />;
}
