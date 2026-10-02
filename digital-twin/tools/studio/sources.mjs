// Studio source binding: which exact closures, verification results, artifacts, tessellation and display checks a
// pack was built from, and SOURCE_FRESHNESS, whether the current sources still match them. Pack integrity (the
// manifest and GLB form the pack they claim to) is checkPack in studio.mjs; a historical pack can keep integrity
// while its sources move on, and is then STALE, never presented as revalidated.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import canonicalize from 'canonicalize';

export const CHAIN_ROOT = 'digital-twin/generated/studio/chain';
export const TESS_ROOT = 'digital-twin/generated/studio/tessellation';
// The resolver (verify.purchased_artifact) serves a revision only when this registry records it, so its bytes fix
// which artifact every non-board definition resolves to; the two boards resolve inside the chain run itself.
export const REVISION_REGISTRY = 'digital-twin/validation/expected/m7/instructional-revisions/revision-artifacts.json';
export const TESSELLATION_CONTRACT = 'picar-studio-tessellation/2';
export const DISPLAY_CHECK_SCHEMA = 'picar-studio-display-check/1';

export const sha256 = (bytes) => crypto.createHash('sha256').update(bytes).digest('hex');
// The verifier's closureRfc8785Sha256: SHA-256 of the RFC 8785 canonical closure, no domain tag (closure_verify.py).
export const closureHash = (closure) => sha256(canonicalize(closure));
const pad = (n) => String(n).padStart(2, '0');
const splitKey = (key) => { const m = /^(.+)-S(\d+)$/.exec(key); return [m[1], Number(m[2])]; };
const exists = (p) => fs.existsSync(p);

export function verifierIndex(observations) {
  return new Map(observations.results.map((r) => [`${r.variantId}-S${pad(r.printedNumber)}`, { status: r.status, closureRfc8785Sha256: r.closureRfc8785Sha256 }]));
}

// A step's display readiness. Only a closure whose canonical hash equals the one the verifier measured can carry the
// verifier's verdict; anything else is reported and never becomes PREVIEW_SOURCE_REVALIDATED.
export function closureReadiness({ key, closure, verdict }) {
  const [variant, step] = splitKey(key);
  const actual = closureHash(closure);
  const problems = [];
  if (!verdict) problems.push(`CLOSURE_UNVERIFIED variant=${variant} step=${step}`);
  else if (verdict.closureRfc8785Sha256 !== actual) problems.push(`CLOSURE_VERIFY_MISMATCH variant=${variant} step=${step} expected=${verdict.closureRfc8785Sha256} actual=${actual}`);
  const display = problems.length ? 'UNAVAILABLE'
    : verdict.status === 'PASS' && closure.status === 'COMPLETE' ? 'PREVIEW_SOURCE_REVALIDATED'
      : verdict.status === 'BLOCKED' && closure.status === 'BLOCKED' ? 'PREVIEW_BLOCKED_RELATION' : 'UNAVAILABLE';
  return { display, closureRfc8785Sha256: actual, verdict: verdict?.status ?? null, problems };
}

// SHA-256 over one tessellated shape's mesh bytes (every solid's positions, normals and indices, in order).
export function meshSha256(entry, bin) {
  const h = crypto.createHash('sha256');
  for (const s of entry.solids) for (const r of [s.positions, s.normals, s.indices]) h.update(bin.subarray(r.byteOffset, r.byteOffset + r.byteLength));
  return h.digest('hex');
}

export const resolveArtifact = (artifactPath, { root, chainDir }) => (artifactPath.startsWith('chain:') ? path.join(chainDir, artifactPath.slice(6)) : path.join(root, artifactPath));

function artifactProblem(code, id, artifactPath, expected, ctx) {
  const file = resolveArtifact(artifactPath, ctx);
  if (!exists(file)) return `${code}_MISSING ${id} ${artifactPath}`;
  const actual = sha256(fs.readFileSync(file));
  return actual === expected ? null : `${code}_CHANGED ${id} ${artifactPath} expected=${expected} actual=${actual}`;
}

// A tessellation belongs to a pack only if it was made against the same chain run and verification, with the same
// artifact selection, from the artifact bytes still on disk, and each mesh is the one its index entry names.
export function tessellationProblems({ index, bin, chainLabel, chainDir, root }) {
  if (index.contract !== TESSELLATION_CONTRACT) return [`TESSELLATION_CONTRACT ${index.contract}`];
  const out = [];
  if (sha256(bin) !== index.binSha256) out.push('TESSELLATION_BIN_HASH');
  const c = index.chain ?? {};
  if (c.label !== chainLabel) out.push(`TESSELLATION_CHAIN label=${c.label} expected=${chainLabel}`);
  const observations = path.join(chainDir, 'closure-observations.json'), record = path.join(chainDir, 'studio-chain.json');
  if (!exists(observations) || c.closureObservationsSha256 !== sha256(fs.readFileSync(observations))) out.push('TESSELLATION_VERIFICATION');
  if (!exists(record) || c.studioChainSha256 !== sha256(fs.readFileSync(record))) out.push('TESSELLATION_CHAIN_RECORD');
  else if (JSON.parse(fs.readFileSync(record)).revisionRegistry?.sha256 !== c.revisionRegistrySha256) out.push('TESSELLATION_REGISTRY');
  for (const e of index.definitions) {
    out.push(artifactProblem('ARTIFACT', e.definitionId, e.artifactPath, e.artifactSha256, { root, chainDir }));
    if (meshSha256(e, bin) !== e.meshSha256) out.push(`TESSELLATION_MESH ${e.definitionId}`);
    if (e.display) {
      out.push(artifactProblem('DISPLAY_ARTIFACT', e.definitionId, e.display.artifactPath, e.display.artifactSha256, { root, chainDir }));
      if (meshSha256(e.display, bin) !== e.display.meshSha256) out.push(`TESSELLATION_MESH ${e.definitionId} display`);
    }
  }
  return out.filter(Boolean);
}

// A registered display model's checks bind to the exact display artifact, instructional artifact, every other part's
// artifact and every closure state that places it. A record that names anything else is stale for this pack.
export function displayCheckProblems(record, { displaySha256, instructionalSha256, partArtifacts, closures }) {
  const id = record.definitionId, o = record.overlaps ?? {};
  if (record.schema !== DISPLAY_CHECK_SCHEMA) return [`DISPLAY_CHECK_SCHEMA ${id} ${record.schema ?? 'none'}`];
  const out = [];
  if (record.artifactSha256 !== displaySha256 || o.displayArtifactSha256 !== displaySha256) out.push(`DISPLAY_ARTIFACT ${id} expected=${displaySha256} recorded=${record.artifactSha256}`);
  const instructional = record.relation?.instructionalArtifact?.sha256;
  if (instructional !== instructionalSha256 || o.instructionalArtifactSha256 !== instructionalSha256) out.push(`DISPLAY_INSTRUCTIONAL_ARTIFACT ${id} expected=${instructionalSha256} recorded=${instructional}`);
  for (const [d, h] of Object.entries(o.partArtifacts ?? {})) if (partArtifacts[d] !== h) out.push(`DISPLAY_PART_ARTIFACT ${id} ${d}`);
  for (const c of closures) {
    const r = (o.closures ?? []).find((x) => x.variantId === c.variantId && x.step === c.step);
    if (!r || r.closureRfc8785Sha256 !== c.closureRfc8785Sha256) out.push(`DISPLAY_CHECK_STALE ${id} variant=${c.variantId} step=${c.step} expected=${c.closureRfc8785Sha256} recorded=${r?.closureRfc8785Sha256 ?? 'none'}`);
  }
  return out;
}

// The display check for one placed state: CHECKED against that exact closure, or NOT_CHECKED (a refused candidate,
// or any state the record does not cover), never an empty list that reads as "no overlaps".
export function displayChecksFor(record, { variantId, step, closureRfc8785Sha256 }) {
  const o = record.overlaps;
  const checked = closureRfc8785Sha256 && o.closures.some((x) => x.variantId === variantId && x.step === step && x.closureRfc8785Sha256 === closureRfc8785Sha256);
  if (!checked) return { definitionId: record.definitionId, status: 'NOT_CHECKED', overlaps: [] };
  return { definitionId: record.definitionId, status: 'CHECKED', closureRfc8785Sha256,
    overlaps: o.positive.filter((p) => p.variantId === variantId && p.step === step && p.closureRfc8785Sha256 === closureRfc8785Sha256)
      .map(({ instanceId, volumeMm3 }) => ({ instanceId, volumeMm3 })) };
}

// SOURCE_FRESHNESS of a built pack against what is on disk now: FRESH (every recorded source unchanged), STALE (a
// source changed; the problems name it, with both hashes) or UNVERIFIABLE (a recorded source is no longer on disk).
export function checkFreshness(manifest, root) {
  const src = manifest.source;
  const chainDir = path.join(root, CHAIN_ROOT, src.chain.label), tessDir = path.join(root, TESS_ROOT, src.tessellation.label);
  const stale = [], missing = [];
  const file = (abs, shown, expected, code) => {
    if (!exists(abs)) { missing.push(`${code}_MISSING ${shown}`); return null; }
    const bytes = fs.readFileSync(abs), actual = sha256(bytes);
    if (actual !== expected) stale.push(`${code}_CHANGED ${shown} expected=${expected} actual=${actual}`);
    return bytes;
  };
  const rel = (abs) => path.relative(root, abs).split(path.sep).join('/');
  const observations = file(path.join(chainDir, 'closure-observations.json'), rel(path.join(chainDir, 'closure-observations.json')), src.chain.closureVerify.sha256, 'VERIFICATION');
  file(path.join(chainDir, 'studio-chain.json'), rel(path.join(chainDir, 'studio-chain.json')), src.chain.studioChain.sha256, 'CHAIN_RECORD');
  file(path.join(tessDir, 'meshes.json'), rel(path.join(tessDir, 'meshes.json')), src.tessellation.meshesSha256, 'TESSELLATION_INDEX');
  file(path.join(tessDir, 'meshes.bin'), rel(path.join(tessDir, 'meshes.bin')), src.tessellation.binSha256, 'TESSELLATION_BIN');
  file(path.join(root, src.revisionRegistry.path), src.revisionRegistry.path, src.revisionRegistry.sha256, 'REVISION_REGISTRY');
  for (const [p, h] of Object.entries(src.inputs)) file(path.join(root, p), p, h, 'INPUT');
  const ctx = { root, chainDir };
  for (const [id, d] of Object.entries(manifest.definitions)) {
    file(resolveArtifact(d.artifact.path, ctx), `${id} ${d.artifact.path}`, d.artifact.sha256, 'ARTIFACT');
    if (d.display) {
      file(resolveArtifact(d.display.artifact.path, ctx), `${id} ${d.display.artifact.path}`, d.display.artifact.sha256, 'DISPLAY_ARTIFACT');
      file(path.join(root, d.display.record.path), `${id} ${d.display.record.path}`, d.display.record.sha256, 'DISPLAY_RECORD');
    }
  }
  const verdicts = observations ? verifierIndex(JSON.parse(observations)) : null;
  for (const [variant, v] of Object.entries(manifest.variants)) for (const s of v.steps) {
    const source = s.source, key = `${variant}-S${pad(s.printedNumber)}`;
    if (source.kind === 'none') continue;
    const bytes = file(path.join(chainDir, source.file), `${key} ${source.file}`, source.sha256, 'CLOSURE');
    if (source.candidateRecord) file(path.join(chainDir, source.candidateRecord), `${key} ${source.candidateRecord}`, source.candidateSha256, 'CANDIDATE');
    if (source.kind !== 'closure' || !bytes || !verdicts) continue;
    const actual = closureHash(JSON.parse(bytes)), verified = verdicts.get(key)?.closureRfc8785Sha256;
    if (actual !== verified || actual !== source.closureRfc8785Sha256) stale.push(`CLOSURE_VERIFY_MISMATCH variant=${variant} step=${s.printedNumber} expected=${verified ?? 'none'} actual=${actual}`);
  }
  return { status: stale.length ? 'STALE' : missing.length ? 'UNVERIFIABLE' : 'FRESH', problems: [...stale, ...missing] };
}
