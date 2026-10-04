# Studio 3 final exact-byte review set

This additive set closes the previous connector verification gap. The transport files encode the canonical bytes; they do not replace any asset or source binding. Every JSON part is under 180,000 bytes. The manifest records part order, offsets, raw and encoded hashes, whole-file size/hash, Git blobs for tracked artifacts, and evidence classification.

The set includes the final GLB, Blender project and receipt-bound render; current tessellation index/buffer; every ignored generated input needed by the existing freshness checker, including the previously selected Studio 2 HAT artifact; and critical synthetic native visual evidence. The separate high-fidelity HAT branch is not integrated.

Use a tracked checkout of the final candidate and restore each listed path there. Dependencies must come from the existing lockfiles; the recorded isolated run reused installed dependency runtimes without copying caches or owner files.

```js
// Run from the review checkout root with Node.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const base='docs/implementation/evidence/studio-3-pro-remediation/connector-review';
const manifest=JSON.parse(fs.readFileSync(`${base}/binary-transport-manifest.json`));
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
for(const artifact of manifest.artifacts){
  let offset=0;
  const bytes=Buffer.concat(artifact.parts.map((entry,index)=>{
    const encoded=fs.readFileSync(`${base}/${entry.file}`);
    if(encoded.length!==entry.encodedFileByteLength||sha(encoded)!==entry.encodedFileSha256)throw Error('encoded hash');
    const part=JSON.parse(encoded),raw=Buffer.from(part.base64,'base64');
    if(part.artifactPath!==artifact.canonicalPath||part.index!==index||entry.index!==index||part.byteOffset!==offset||entry.byteOffset!==offset||part.rawByteLength!==raw.length||raw.length!==entry.rawByteLength||sha(raw)!==part.rawSha256||sha(raw)!==entry.rawSha256||part.wholeSha256!==artifact.sha256||part.wholeByteLength!==artifact.byteLength)throw Error('part binding');
    offset+=raw.length;return raw;
  }));
  if(bytes.length!==artifact.byteLength||sha(bytes)!==artifact.sha256)throw Error('whole binding');
  fs.mkdirSync(path.dirname(artifact.canonicalPath),{recursive:true});
  fs.writeFileSync(artifact.canonicalPath,bytes);
}
```

Then run `node digital-twin/tools/studio/studio.mjs check`. `isolated-recomputation.json` records PASS / FRESH / CURRENT after this restoration from a Git archive containing tracked source only. With Blender installed, `node digital-twin/tools/studio/studio.mjs blender --check` verifies the project fingerprint and ownership without modifying the file.

`glb-audit.json` parses the exact header, chunks, JSON and external references. `blender-audit.json` records the exact loaded project's scenes, collections, images, scripts and dependencies. `visual-evidence-manifest.json` binds native PNG encodings, exact original CUA JPEG captures, and JPEG proxies to the physical Escape sequence and native Save panel. Native observations are synthetic and disposable; no photo or ZIP export bytes are published.

The producer now clears its saved home-directory browser UI state and disables the PNG filename stamp. A rejected local render containing real producer-path metadata was retained privately outside Git. Its unpublished generated-artifact commit is excluded from this branch's published ancestry. Existing reviewed history is preserved.

Final inventory: **40 artifacts, 187 ordered JSON/base64 parts, 20,551,657 raw bytes**. All parts are under 180,000 encoded bytes. Native critical frames were returned by CUA as JPEG; those exact original capture bytes are preserved and transported too. Their PNG files are lossless decodings of those captures, not retouched images. Dimensions come from the actual encoded formats. Ten small JPEG proxies are bound in the visual manifest.

State A proves manual-overlay presence and Escape dismissal, not complete PDF-page rendering: the fullscreen transition left the page-content raster incomplete. This limit, the actual native visibility states and all AX frames are retained explicitly.

The final native run is one passed case in 1m44.5s with zero in-run warnings. Its sole warning is afterSession mock cleanup after PASS. See the separate attempt history for all earlier failed or warning-bearing runs. No failed result has been relabelled.
