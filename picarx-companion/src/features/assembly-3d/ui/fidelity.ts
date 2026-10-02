// Display-model fidelity as a classified subset. A detail part counts as matched only when its footprint overlaps the
// best-matching solid of the maker's model by at least half, which is the cross-check's own matching criterion; the
// deviation reported covers exactly those parts, and every other part is named rather than folded into a summary.
import type { VendorPart } from '../assets/pack';

export const MATCH_IOU = 0.5;
export type Agreement = { matched: number; total: number; maxOffsetMm: number | null; medianOffsetMm: number | null; unmatched: string[] };

export function vendorAgreement(parts: VendorPart[]): Agreement {
  const isMatched = (p: VendorPart): boolean => p.footprintIoU !== undefined && p.footprintIoU >= MATCH_IOU && p.centreOffsetXYMm !== undefined;
  const offsets = parts.filter(isMatched).map((p) => Math.hypot(...p.centreOffsetXYMm!)).sort((a, b) => a - b);
  const n = offsets.length;
  return {
    matched: n, total: parts.length,
    maxOffsetMm: n ? offsets[n - 1] : null,
    medianOffsetMm: n ? (offsets[Math.floor((n - 1) / 2)] + offsets[Math.ceil((n - 1) / 2)]) / 2 : null,
    unmatched: parts.filter((p) => !isMatched(p)).map((p) => p.part),
  };
}
