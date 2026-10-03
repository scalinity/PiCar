// Render only the rectangle in the verified source lock. Each replacement owns its render and error state.
import { useCallback, useState } from 'react';
import { loadV40Pdf } from '../../../lib/v40-pdf';
import { manualPanel } from './manual-map';
import type { StudioVariant } from '../../../lib/router';

type Props = { step: number; variant: StudioVariant; width: number; maxHeight?: number };
export function ManualPanel(props: Props) {
  // A step/board replacement cannot retain the previous panel's failure or readiness.
  return <Panel key={`${props.variant}/${props.step}`} {...props} />;
}
function Panel({ step, variant, width, maxHeight = Infinity }: Props) {
  const mapping = manualPanel(step, variant);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const draw = useCallback((canvas: HTMLCanvasElement | null) => {
    if (!canvas || !mapping) return;
    let cancelled = false;
    let task: { cancel(): void } | undefined;
    delete canvas.dataset.ready;
    setFailed(false);
    const [x0, y0, x1, y1] = mapping.normalizedRect;
    void (async () => {
      const doc = await loadV40Pdf();
      if (cancelled) return;
      const page = await doc.getPage(mapping.pdfPage);
      if (cancelled) return;
      const base = page.getViewport({ scale: 1 });
      const cropW = (x1 - x0) * base.width, cropH = (y1 - y0) * base.height;
      const css = Math.min(width / cropW, maxHeight / cropH), scale = css * (window.devicePixelRatio || 1);
      const viewport = page.getViewport({ scale, offsetX: -x0 * base.width * scale, offsetY: -y0 * base.height * scale });
      canvas.width = Math.round(cropW * scale);
      canvas.height = Math.round(cropH * scale);
      canvas.style.width = `${cropW * css}px`;
      canvas.style.height = `${cropH * css}px`;
      const render = page.render({ canvas, canvasContext: canvas.getContext('2d')!, viewport });
      task = render;
      await render.promise;
      if (!cancelled) canvas.dataset.ready = 'true';
    })().catch((error: unknown) => {
      if (!cancelled && !(error instanceof Error && error.name === 'RenderingCancelledException')) setFailed(true);
    });
    return () => { cancelled = true; task?.cancel(); };
  }, [mapping, width, maxHeight, attempt]);
  if (!mapping) return <p className="studio-hint">The verified manual record has no panel for this step on this board, so none is shown.</p>;
  return <>
    {failed && <div className="studio-hint" role="alert">The locked V40 booklet panel could not be rendered. <button type="button" onClick={() => setAttempt((n) => n + 1)}>Retry</button></div>}
    <canvas hidden={failed} className="studio-manual-canvas" ref={draw} style={{ width }} data-page={mapping.pdfPage} aria-label={`${mapping.photoPanel}, page ${mapping.pdfPage} of the V40 booklet`} />
  </>;
}
