// Source binding (F1, F4): a pack's readiness and display checks bind to the exact closures, verification result,
// artifacts and tessellation they came from, and SOURCE_FRESHNESS reports when any of them has changed since.
// Fixtures are synthetic and live in a temporary directory; no chain run or generated output is needed.
import { beforeEach, describe, expect, it } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const S: any = await import(pathToFileURL(path.resolve('../digital-twin/tools/studio/sources.mjs')).href);

const closure = (overrides: Record<string, unknown> = {}) => ({ id: 'C-rpi5-S01', variantId: 'rpi5', printedNumber: 1, status: 'COMPLETE',
  placements: [{ instanceId: 'PX-A-001', translationMm: [0, 0, 2], rotation: [[1, 0, 0], [0, -1, 0], [0, 0, -1]], featureRef: 'f', role: 'workpiece' }], ...overrides });
const verdict = (c: object, status = 'PASS') => ({ status, closureRfc8785Sha256: S.closureHash(c) });

describe('closure binding', () => {
  it('passes an unchanged verified closure as PREVIEW_SOURCE_REVALIDATED', () => {
    const c = closure();
    expect(S.closureReadiness({ key: 'rpi5-S01', closure: c, verdict: verdict(c) })).toMatchObject({ display: 'PREVIEW_SOURCE_REVALIDATED', problems: [] });
  });

  it('refuses a closure changed after the verifier passed it, naming variant, step and both hashes', () => {
    const verified = closure();
    const changed = closure({ placements: [{ ...verified.placements[0], translationMm: [0, 0, 2.5] }] });
    const r = S.closureReadiness({ key: 'rpi5-S01', closure: changed, verdict: verdict(verified) });
    expect(r.display).not.toBe('PREVIEW_SOURCE_REVALIDATED');
    expect(r.problems).toEqual([`CLOSURE_VERIFY_MISMATCH variant=rpi5 step=1 expected=${S.closureHash(verified)} actual=${S.closureHash(changed)}`]);
  });

  it('refuses a closure the verifier never saw, and keeps a verified relation block in review', () => {
    expect(S.closureReadiness({ key: 'rpi5-S01', closure: closure(), verdict: undefined }).problems).toEqual(['CLOSURE_UNVERIFIED variant=rpi5 step=1']);
    const blocked = closure({ status: 'BLOCKED' });
    expect(S.closureReadiness({ key: 'rpi5-S01', closure: blocked, verdict: verdict(blocked, 'BLOCKED') })).toMatchObject({ display: 'PREVIEW_BLOCKED_RELATION', problems: [] });
  });
});

// A miniature repository: one closure, its verification, a chain record, a revision registry, one artifact and a
// tessellation of it, and the manifest source fields a pack records for them.
let root = '';
const at = (...p: string[]) => path.join(root, ...p);
const put = (rel: string, data: string | Uint8Array) => { fs.mkdirSync(path.dirname(at(rel)), { recursive: true }); fs.writeFileSync(at(rel), data); };
const sha = (rel: string) => S.sha256(fs.readFileSync(at(rel)));
const CHAIN = `${S.CHAIN_ROOT}/t-01`, TESS = `${S.TESS_ROOT}/t-01`, ARTIFACT = 'digital-twin/validation/expected/m5/instructional-artifacts/PX-DEF-A.brep';

function fixture() {
  root = fs.mkdtempSync(path.join(os.tmpdir(), 'studio-sources-'));
  const c = closure();
  put(`${CHAIN}/chain/closures/rpi5-S01-closure.json`, JSON.stringify(c));
  put(`${CHAIN}/closure-observations.json`, JSON.stringify({ status: 'PASS', blocked: [], results: [{ variantId: 'rpi5', printedNumber: 1, ...verdict(c) }] }));
  put(S.REVISION_REGISTRY, JSON.stringify({ records: [] }));
  put(`${CHAIN}/studio-chain.json`, JSON.stringify({ label: 't-01', closureObservationsSha256: sha(`${CHAIN}/closure-observations.json`), revisionRegistry: { path: S.REVISION_REGISTRY, sha256: sha(S.REVISION_REGISTRY) } }));
  put(ARTIFACT, 'brep bytes v1');
  const bin = new Uint8Array(48).map((_, i) => i);
  const solid = { index: 0, positions: { byteOffset: 0, byteLength: 24 }, normals: { byteOffset: 24, byteLength: 12 }, indices: { byteOffset: 36, byteLength: 12 } };
  const entry = { definitionId: 'PX-DEF-A', artifactPath: ARTIFACT, artifactSha256: sha(ARTIFACT), solids: [solid] };
  const index = { contract: S.TESSELLATION_CONTRACT, binSha256: S.sha256(bin), chain: { label: 't-01', closureObservationsSha256: sha(`${CHAIN}/closure-observations.json`),
    studioChainSha256: sha(`${CHAIN}/studio-chain.json`), revisionRegistrySha256: sha(S.REVISION_REGISTRY) }, definitions: [{ ...entry, meshSha256: S.meshSha256(entry, bin) }] };
  put(`${TESS}/meshes.bin`, bin);
  put(`${TESS}/meshes.json`, JSON.stringify(index));
  put('stage.json', '{"timing":1}');
  const manifest = {
    source: {
      chain: { label: 't-01', closureVerify: { status: 'PASS', sha256: sha(`${CHAIN}/closure-observations.json`) }, studioChain: { sha256: sha(`${CHAIN}/studio-chain.json`) } },
      tessellation: { label: 't-01', meshesSha256: sha(`${TESS}/meshes.json`), binSha256: index.binSha256 },
      revisionRegistry: { path: S.REVISION_REGISTRY, sha256: sha(S.REVISION_REGISTRY) },
      inputs: { 'stage.json': sha('stage.json') },
    },
    definitions: { 'PX-DEF-A': { artifact: { path: ARTIFACT, sha256: sha(ARTIFACT) }, meshSha256: index.definitions[0].meshSha256 } },
    variants: { rpi5: { steps: [{ printedNumber: 1, source: { kind: 'closure', file: 'chain/closures/rpi5-S01-closure.json', sha256: sha(`${CHAIN}/chain/closures/rpi5-S01-closure.json`),
      closureRfc8785Sha256: S.closureHash(c), closureVerify: 'PASS' } }] } },
  };
  return { index, bin, manifest };
}

describe('tessellation binding', () => {
  let f: ReturnType<typeof fixture>;
  beforeEach(() => { f = fixture(); });
  const problems = (index = f.index, bin = f.bin) => S.tessellationProblems({ index, bin, chainLabel: 't-01', chainDir: at(CHAIN), root });

  it('accepts a tessellation of the selected artifacts made against this chain run', () => {
    expect(problems()).toEqual([]);
  });
  it('refuses a tessellation made against another chain run', () => {
    expect(problems({ ...f.index, chain: { ...f.index.chain, label: 's1-04' } })).toContain('TESSELLATION_CHAIN label=s1-04 expected=t-01');
  });
  it('refuses a stale tessellation once its source artifact changes', () => {
    put(ARTIFACT, 'brep bytes v2');
    expect(problems().some((p: string) => p.startsWith(`ARTIFACT_CHANGED PX-DEF-A ${ARTIFACT}`))).toBe(true);
  });
  it('refuses meshes whose bytes no longer belong to the definition entry', () => {
    const bin = f.bin.slice(); bin[3] ^= 1;
    expect(problems({ ...f.index, binSha256: S.sha256(bin) }, bin)).toContain('TESSELLATION_MESH PX-DEF-A');
  });
  it('refuses a tessellation index from before source binding', () => {
    expect(problems({ ...f.index, contract: 'picar-studio-tessellation/1' })).toContain('TESSELLATION_CONTRACT picar-studio-tessellation/1');
  });
});

describe('SOURCE_FRESHNESS', () => {
  let f: ReturnType<typeof fixture>;
  beforeEach(() => { f = fixture(); });

  it('is FRESH while every recorded source is unchanged', () => {
    expect(S.checkFreshness(f.manifest, root)).toEqual({ status: 'FRESH', problems: [] });
  });
  it('is STALE when the closure changes after the verifier passed it', () => {
    const changed = closure({ status: 'COMPLETE', placements: [{ ...closure().placements[0], translationMm: [1, 0, 2] }] });
    put(`${CHAIN}/chain/closures/rpi5-S01-closure.json`, JSON.stringify(changed));
    const r = S.checkFreshness(f.manifest, root);
    expect(r.status).toBe('STALE');
    expect(r.problems).toContain(`CLOSURE_VERIFY_MISMATCH variant=rpi5 step=1 expected=${S.closureHash(closure())} actual=${S.closureHash(changed)}`);
  });
  it('is STALE when the selected artifact changes under an old tessellation', () => {
    put(ARTIFACT, 'brep bytes v2');
    const r = S.checkFreshness(f.manifest, root);
    expect(r.status).toBe('STALE');
    expect(r.problems.some((p: string) => p.startsWith(`ARTIFACT_CHANGED PX-DEF-A ${ARTIFACT}`))).toBe(true);
  });
  it('is STALE when the revision registry that selects artifacts changes', () => {
    put(S.REVISION_REGISTRY, JSON.stringify({ records: [{ definitionId: 'PX-DEF-A' }] }));
    expect(S.checkFreshness(f.manifest, root).problems.some((p: string) => p.startsWith('REVISION_REGISTRY_CHANGED'))).toBe(true);
  });
  it('is STALE when a presentation input changes', () => {
    put('stage.json', '{"timing":2}');
    expect(S.checkFreshness(f.manifest, root).problems.some((p: string) => p.startsWith('INPUT_CHANGED stage.json'))).toBe(true);
  });
  it('is UNVERIFIABLE, not FRESH, when the chain run is no longer on disk', () => {
    fs.rmSync(at(CHAIN), { recursive: true });
    const r = S.checkFreshness(f.manifest, root);
    expect(r.status).toBe('UNVERIFIABLE');
    expect(r.problems.some((p: string) => p.startsWith('VERIFICATION_MISSING'))).toBe(true);
  });
});

describe('display-check binding (F4)', () => {
  const rec = (overrides: Record<string, any> = {}) => ({
    schema: S.DISPLAY_CHECK_SCHEMA, definitionId: 'PX-DEF-A', artifactSha256: 'd'.repeat(64),
    relation: { instructionalArtifact: { definitionId: 'PX-DEF-A', sha256: 'i'.repeat(64) } },
    overlaps: { displayArtifactSha256: 'd'.repeat(64), instructionalArtifactSha256: 'i'.repeat(64), partArtifacts: { 'PX-DEF-B': 'b'.repeat(64) },
      closures: [{ variantId: 'rpi5', step: 2, closureRfc8785Sha256: 'c'.repeat(64) }],
      positive: [{ variantId: 'rpi5', step: 2, closureRfc8785Sha256: 'c'.repeat(64), instanceId: 'PX-B-001', volumeMm3: 449 }] },
    ...overrides,
  });
  const ctx = (overrides: Record<string, any> = {}) => ({ displaySha256: 'd'.repeat(64), instructionalSha256: 'i'.repeat(64), partArtifacts: { 'PX-DEF-B': 'b'.repeat(64) },
    closures: [{ variantId: 'rpi5', step: 2, closureRfc8785Sha256: 'c'.repeat(64) }], ...overrides });

  it('accepts a record whose checks name exactly the current artifacts and closures', () => {
    expect(S.displayCheckProblems(rec(), ctx())).toEqual([]);
  });
  it('refuses a record checked against a different closure state, naming variant and step', () => {
    expect(S.displayCheckProblems(rec(), ctx({ closures: [{ variantId: 'rpi5', step: 2, closureRfc8785Sha256: 'e'.repeat(64) }] })))
      .toContain(`DISPLAY_CHECK_STALE PX-DEF-A variant=rpi5 step=2 expected=${'e'.repeat(64)} recorded=${'c'.repeat(64)}`);
  });
  it('refuses a record checked against a different instructional artifact', () => {
    expect(S.displayCheckProblems(rec(), ctx({ instructionalSha256: 'j'.repeat(64) })).some((p: string) => p.startsWith('DISPLAY_INSTRUCTIONAL_ARTIFACT PX-DEF-A'))).toBe(true);
  });
  it('refuses a record whose overlaps used a different shape for another part', () => {
    expect(S.displayCheckProblems(rec(), ctx({ partArtifacts: { 'PX-DEF-B': 'x'.repeat(64) } }))).toContain('DISPLAY_PART_ARTIFACT PX-DEF-A PX-DEF-B');
  });
  it('refuses a record from before display-check binding', () => {
    const { schema: _schema, ...old } = rec();
    expect(S.displayCheckProblems(old, ctx()).some((p: string) => p.startsWith('DISPLAY_CHECK_SCHEMA'))).toBe(true);
  });
  it('reports a placed state with no check as NOT_CHECKED rather than as clear', () => {
    expect(S.displayChecksFor(rec(), { variantId: 'rpi5', step: 9, closureRfc8785Sha256: null }))
      .toEqual({ definitionId: 'PX-DEF-A', status: 'NOT_CHECKED', overlaps: [] });
    expect(S.displayChecksFor(rec(), { variantId: 'rpi5', step: 2, closureRfc8785Sha256: 'c'.repeat(64) }))
      .toEqual({ definitionId: 'PX-DEF-A', status: 'CHECKED', closureRfc8785Sha256: 'c'.repeat(64), overlaps: [{ instanceId: 'PX-B-001', volumeMm3: 449 }] });
  });
});
