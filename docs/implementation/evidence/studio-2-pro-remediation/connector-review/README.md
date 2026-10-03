# Connector review evidence

This additive set repairs the immediately preceding Pro review's retrieval gaps. It supports a focused review from b6dd6a7e04dff6a41e5766b0a6b95e577eb07de9 through the final published branch HEAD. Preserve previously supported closures and examine only affected regressions.

Read connector-review-manifest.json first. It binds53 complete-viewport JPEGs to original SHA256/dimensions, proxy SHA256/dimensions, scaling, disposition and allowed claim. The maximum proxy is211702bytes. Pixels were converted to sRGB; unnecessary metadata was stripped. All53 proxies and all191 candidate images were screened for privacy, with required new native originals also reviewed individually. The audit records the contact-sheet method and its limits. Numeric native pan JSON remains authoritative; scaled JPEGs cannot establish metrology.

Use GitHub fetch_file with encoding=base64, repository_full_name=scalinity/PiCar, the immutable final full SHA, and each proxyPath. Decode structuredContent.content and display the JPEG bytes. A plain UTF-8/raw fetch rejects binary images and does not establish their absence. All53 proxies were actually fetched at published0735231581cdc05f71e1ff2f021307becaa5f39f, decoded and verified against SHA256 and Git blob identity; see connector-retrieval-073523.json. Exact final-ref retrieval is repeated after the transport-only follow-up push and reported in the closeout response. No claim is made that a reviewer downloaded an unavailable large binary.

Fresh Zero S00 uses pro-followup-final captures01-zero-S00-fresh.jpg and02-zero-S00-wrench.jpg (review proxies01/02). The historical continuation-final capture01 is REJECTED_WRONG_VARIANT_RENDER, unchanged. Capture48 is LIMITED_CORROBORATION because its HUD obscures the upper board. Zero S01–S09 and Pi5 representative evidence retain their original source/bundle identity. They were not relabeled as captures from the rebuilt app. Current physical Escape sequence is proxies47–50; affected native pan is42–46; the original supported resize/redraw/DPR pan is30–37. HAT contact wording is41; final Blender render is53.

The structured audits are binary-media-review-manifest.json (245 per-path records, including24 exact-byte transport JSON parts), glb-audit.json and blender-audit.json. GLB header/chunks/JSON were parsed locally:21nodes,21meshes,18materials, no textures/images/external URI. Blender itself opened and verified the current project with the existing repository --check; independent Node SDNA parsing supplies the additional metadata inventory. The .blend contains oneScene, two internal image datablocks with empty paths, no packed-file/library/movie/sound/font/script/cache-file dependencies and300 decoded custom string properties without file/URL strings. Functional file-browser directory /Users/danny reveals only the username; default /tmp/ output is not a source dependency. The internal thumbnail is a gray cube on black. This is local structured verification, separate from transport, physical fit and human visual acceptance.

verification-artifact-manifest.json identifies the exact missing HAT source-input BREP, Pi5/Zero chain-only board BREPs, closure observations, chain receipt, tessellation JSON/buffer,16S01–S08 closures and4S09 refusal records. All27 are classB: safe repository-generated verification material, total4110904bytes. They are additive exact-byte snapshots under verification-inputs; canonical binding still names the original ignored generated paths. There are no missing private classC inputs to the bounded PASS/FRESH/CURRENT check. Private CAD/photo/caliper evidence remains excluded from this publication and does not acquire engineering admission. The already tracked GLB/.blend are classD transport-limited binaries, covered by audits and views instead of duplicate outputs.

At073523,26of27 exact generated snapshots were fetched and byte-verified through the connector. The3,465,360-byte meshes.bin returned empty content from fetch_file; fetch_blob failed UTF-8 decoding. The manifest now also provides24 ordered base64 JSON parts, each≤197008bytes. They decode and concatenate to the exact existing buffer SHA2560d5dcd318650efc9f4a822f4308f3bdc639fe9f5b3bf5a9959e17c4f163b6854. This encoding is solely for connector recomputation of the required classB input. It does not change the numeric buffer, duplicate the classD GLB/.blend, or introduce a new canonical source. Original published snapshots remain unchanged. Part offsets, raw part hashes, encoded file hashes and whole-buffer length/hash are recorded. The local roundtrip passed; remote decoding is verified after push.

To recompute from a fresh checkout, install the repository's declared digital-twin dependencies, then restore only the27 manifest-listed exact snapshots to their original ignored paths. Check each SHA256 before restoration. Example from the repository root:

```js
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const manifest = JSON.parse(fs.readFileSync('docs/implementation/evidence/studio-2-pro-remediation/connector-review/verification-artifact-manifest.json'));
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
for (const record of manifest.records.filter(r => r.publishedExactBytes)) {
  if (!record.path.startsWith('digital-twin/generated/studio/')) throw Error('Unexpected restore scope');
  let bytes;
  if (fs.existsSync(record.publishedExactBytes)) {
    bytes = fs.readFileSync(record.publishedExactBytes);
  } else {
    let offset = 0;
    bytes = Buffer.concat(record.connectorTransport.parts.map((part, index) => {
      const encoded = fs.readFileSync(part.path);
      if (encoded.length !== part.fileBytes || sha(encoded) !== part.fileSha256) throw Error('Encoded part mismatch');
      const json = JSON.parse(encoded);
      const raw = Buffer.from(json.data, 'base64');
      if (part.index !== index || part.offset !== offset || json.index !== index || json.offset !== offset ||
          json.encoding !== 'base64' || json.originalPath !== record.path || json.originalSha256 !== record.sha256 ||
          json.bytes !== part.bytes || json.sha256 !== part.sha256 || raw.length !== part.bytes || sha(raw) !== part.sha256)
        throw Error('Decoded part mismatch');
      offset += raw.length;
      return raw;
    }));
  }
  if (bytes.length !== record.bytes || sha(bytes) !== record.sha256) throw Error('SHA/length mismatch');
  fs.mkdirSync(path.dirname(record.path), { recursive: true });
  fs.writeFileSync(record.path, bytes);
}
```

Then run node digital-twin/tools/studio/studio.mjs check. isolated-recomputation.json records an actual tracked-only archive with exactly those inputs restored: PASS/FRESH/CURRENT, no private owner source copied. Dependencies were reused read-only. Initial dependency-resolution setup and macOS /tmp alias entrypoint issues were corrected in the test harness; no source gate changed. The temporary checkout was deleted.
