import canonicalize from 'canonicalize';
import { parseTree } from 'jsonc-parser';
import { createHash } from 'node:crypto';
import fs from 'node:fs';

export const rawHash = bytes => createHash('sha256').update(bytes).digest('hex');
export const fileHash = path => rawHash(fs.readFileSync(path));
export function assertFinite(value, key = '') {
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw Error('NONFINITE');
    if (Object.is(value, -0)) throw Error('NEGATIVE_ZERO');
    if (/^(revision|definitionRevision|predicateVersion|contractVersion|schemaVersion|printedNumber|printedPrimary|printedBackup|printedTotal|byteLength|tier|lineStart|lineEnd|page|servoEpoch)$/.test(key) && !Number.isSafeInteger(value)) throw Error('UNSAFE_INTEGER');
  } else if (typeof value === 'string') {
    if (!value.isWellFormed()) throw Error('LONE_SURROGATE');
  } else if (value !== null && typeof value === 'object') {
    if (!Array.isArray(value) && Object.getPrototypeOf(value) !== Object.prototype && Object.getPrototypeOf(value) !== null) throw Error('NON_JSON_OBJECT');
    if (value.unit === 'count' && value.state === 'known' && !Number.isSafeInteger(value.value)) throw Error('UNSAFE_INTEGER');
    for (const [k, v] of Object.entries(value)) { assertFinite(k); assertFinite(v, k); }
  } else if (value !== null && typeof value !== 'boolean') throw Error('NON_JSON_VALUE');
}
export function strictParse(text) {
  if (Buffer.isBuffer(text)) text = new TextDecoder('utf-8', { fatal: true }).decode(text);
  const errors = [];
  const tree = parseTree(text, errors, { disallowComments: true, allowTrailingComma: false });
  if (errors.length || !tree) throw Error('INVALID_JSON');
  function visit(node) {
    if (node.type === 'object') {
      const keys = new Set();
      for (const p of node.children) {
        const key = p.children[0].value;
        if (keys.has(key)) throw Error('DUPLICATE_KEY');
        keys.add(key);
      }
    }
    for (const c of node.children ?? []) visit(c);
  }
  visit(tree);
  const value = JSON.parse(text);
  assertFinite(value);
  return value;
}
export const read = path => strictParse(fs.readFileSync(path));
export function jcs(value) { assertFinite(value); return Buffer.from(canonicalize(value), 'utf8'); }
export const H = (kind, value) => rawHash(Buffer.concat([Buffer.from(`picar-v2:${kind}\n`, 'utf8'), jcs(value)]));
export const sortedRecords = xs => [...xs].sort((a,b) => (a.id ?? a.partDefinitionId) < (b.id ?? b.partDefinitionId) ? -1 : (a.id ?? a.partDefinitionId) > (b.id ?? b.partDefinitionId) ? 1 : 0);
