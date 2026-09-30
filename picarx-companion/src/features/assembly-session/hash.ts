import canonicalize from 'canonicalize';
import { parseTree } from 'jsonc-parser';
import { sha256 } from '@noble/hashes/sha256';
import { bytesToHex } from '@noble/hashes/utils';
export const bytes = (s: string): Uint8Array => new TextEncoder().encode(s);
export const rawHash = (s: string): string => bytesToHex(sha256(bytes(s)));
export function finite(value: unknown): void {
  if (typeof value === 'number' && (!Number.isFinite(value) || Object.is(value, -0))) throw Error('INVALID_NUMBER');
  if (typeof value === 'string' && /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/u.test(value)) throw Error('LONE_SURROGATE');
  if (value && typeof value === 'object') for (const [k, v] of Object.entries(value)) { finite(k); finite(v); if (['revision','expectedRevision','servoEpoch','epoch','sequence','schemaVersion','payloadVersion','migrationVersion','pdfLastPage'].includes(k) && typeof v==='number' && !Number.isSafeInteger(v)) throw Error('UNSAFE_INTEGER'); }
  if (value === undefined || typeof value === 'function' || typeof value === 'bigint') throw Error('NON_JSON');
}
export function canonical(value: unknown): string { finite(value); const s = canonicalize(value); if (s === undefined) throw Error('NON_JSON'); return s; }
export const hash = (kind: string, value: unknown): string => rawHash(`picar-v2:${kind}\n${canonical(value)}`);
export function parse(raw: string): unknown {
  const errors: { error: number; offset: number; length: number }[] = [];
  const tree = parseTree(raw, errors, { disallowComments: true, allowTrailingComma: false });
  if (!tree || errors.length) throw Error('INVALID_JSON');
  const visit = (n: NonNullable<typeof tree>): void => {
    if (n.type === 'object') { const ks = n.children?.map(p => p.children![0].value) ?? []; if (new Set(ks).size !== ks.length) throw Error('DUPLICATE_KEY'); }
    n.children?.forEach(visit);
  }; visit(tree); const value: unknown = JSON.parse(raw); finite(value); return value;
}
