// Where a printed step's panel is in the locked V40 booklet: only what the verified documentation source lock
// (tools/content-pipeline/documentation-source-lock.json) records, the record the Setup reference already uses.
import sourceLock from '../../../../tools/content-pipeline/documentation-source-lock.json';
import { V40_PDF_SHA256 } from '../../../lib/v40-pdf-identity';
import type { StudioVariant } from '../../../lib/router';

export type PanelMapping = { pdfPage: number; normalizedRect: number[]; photoPanel: string; variants: string[]; result: string };

// The verified panel for a printed step on a board, or null when the lock does not vouch for one.
export function manualPanel(step: number, variant: StudioVariant): PanelMapping | null {
  if (sourceLock.status !== 'VERIFIED' || sourceLock.pdfSha256 !== V40_PDF_SHA256) return null;
  const panel = sourceLock.panels.find((p) => p.printedStep === step && p.result === 'PASS');
  return panel?.mappings.find((m) => m.variants.includes(variant) && m.result === 'PASS') ?? null;
}
