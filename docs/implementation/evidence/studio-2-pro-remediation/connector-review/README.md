# Connector review evidence

This additive set repairs the immediately preceding Pro review's retrieval gaps. It supports a focused review from b6dd6a7e04dff6a41e5766b0a6b95e577eb07de9 through the final published branch HEAD. Preserve previously supported closures and examine only affected regressions.

Read connector-review-manifest.json first. It binds53 complete-viewport JPEGs to original SHA256/dimensions, proxy SHA256/dimensions, scaling, disposition and allowed claim. The maximum proxy is211702bytes. Pixels were converted to sRGB; unnecessary metadata was stripped. All53 proxies and all191 candidate images were screened for privacy, with required new native originals also reviewed individually. The audit records the contact-sheet method and its limits. Numeric native pan JSON remains authoritative; scaled JPEGs cannot establish metrology.

Use GitHub fetch_file with encoding=base64, repository_full_name=scalinity/PiCar, the immutable final full SHA, and each proxyPath. Decode structuredContent.content and display the JPEG bytes. A plain UTF-8/raw fetch rejects binary images and does not establish their absence. The existing published297KiB JPEG was retrieved through this exact base64 route before publication; every new proxy is smaller. Exact final-ref retrieval is verified after push and reported in the closeout response. No claim is made that a reviewer downloaded an unavailable large binary.

Fresh Zero S00 uses pro-followup-final captures01-zero-S00-fresh.jpg and02-zero-S00-wrench.jpg (review proxies01/02). The historical continuation-final capture01 is REJECTED_WRONG_VARIANT_RENDER, unchanged. Capture48 is LIMITED_CORROBORATION because its HUD obscures the upper board. Zero S01–S09 and Pi5 representative evidence retain their original source/bundle identity. They were not relabeled as captures from the rebuilt app. Current physical Escape sequence is proxies47–50; affected native pan is42–46; the original supported resize/redraw/DPR pan is30–37. HAT contact wording is41; final Blender render is53.

The structured audits are binary-media-review-manifest.json (221 per-path records), glb-audit.json and blender-audit.json. GLB header/chunks/JSON were parsed locally:21nodes,21meshes,18materials, no textures/images/external URI. Blender itself opened and verified the current project with the existing repository --check; independent Node SDNA parsing supplies the additional metadata inventory. The .blend contains oneScene, two internal image datablocks with empty paths, no packed-file/library/movie/sound/font/script/cache-file dependencies and300 decoded custom string properties without file/URL strings. Functional file-browser directory /Users/danny reveals only the username; default /tmp/ output is not a source dependency. The internal thumbnail is a gray cube on black. This is local structured verification, separate from transport, physical fit and human visual acceptance.

verification-artifact-manifest.json identifies the exact missing HAT source-input BREP, Pi5/Zero chain-only board BREPs, closure observations, chain receipt, tessellation JSON/buffer,16S01–S08 closures and4S09 refusal records. All27 are classB: safe repository-generated verification material, total4110904bytes. They are additive exact-byte snapshots under verification-inputs; canonical binding still names the original ignored generated paths. There are no missing private classC inputs to the bounded PASS/FRESH/CURRENT check. Private CAD/photo/caliper evidence remains excluded from this publication and does not acquire engineering admission. The already tracked GLB/.blend are classD transport-limited binaries, covered by audits and views instead of duplicate outputs.

To recompute from a fresh checkout, install the repository's declared digital-twin dependencies, then restore only the27 manifest-listed exact snapshots to their original ignored paths. Check each SHA256 before restoration. Example from the repository root:

```js
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const manifest = JSON.parse(fs.readFileSync('docs/implementation/evidence/studio-2-pro-remediation/connector-review/verification-artifact-manifest.json'));
for (const record of manifest.records.filter(r => r.publishedExactBytes)) {
  if (!record.path.startsWith('digital-twin/generated/studio/')) throw Error('Unexpected restore scope');
  const bytes = fs.readFileSync(record.publishedExactBytes);
  if (crypto.createHash('sha256').update(bytes).digest('hex') !== record.sha256) throw Error('SHA mismatch');
  fs.mkdirSync(path.dirname(record.path), { recursive: true });
  fs.writeFileSync(record.path, bytes);
}
```

Then run node digital-twin/tools/studio/studio.mjs check. isolated-recomputation.json records an actual tracked-only archive with exactly those inputs restored: PASS/FRESH/CURRENT, no private owner source copied. Dependencies were reused read-only. Initial dependency-resolution setup and macOS /tmp alias entrypoint issues were corrected in the test harness; no source gate changed. The temporary checkout was deleted.
