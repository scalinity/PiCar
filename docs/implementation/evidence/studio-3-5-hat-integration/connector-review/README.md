# Studio 3.5 exact-byte review set

Use a fresh tracked checkout of `studio/s3-5-hat-integration`. This set transports canonical artifact bytes without replacing any pack or presentation binding. Every encoded JSON part is below 180,000 bytes. Verify the manifest, every encoded/raw part hash, order, offset, whole-file SHA/size and Git blob before using the reconstructed artifact. The producer code head is recorded separately; subsequent closeout commits add documentation/evidence only.

Included: the exact final GLB, Blender project and receipt-bound Pi5 S02 presentation render; the ignored chain/tessellation files required by the existing freshness checker; the exact authored HAT display BREP; and all eleven required published native app-window JPEG captures. Native captures have CUA-only EXIF/Photoshop metadata removed without recompressing or changing a decoded pixel. Raw returned JPEG hashes/lengths and pixel equality are recorded in `native-capture-privacy.json`; the raw tool bytes remain private. No owner source photograph, scan or ZIP is included.

Run this code with Node from the fresh review checkout root:

```js
// Run from the review checkout root with Node.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const base='docs/implementation/evidence/studio-3-5-hat-integration/connector-review';
const manifest=JSON.parse(fs.readFileSync(`${base}/binary-transport-manifest.json`));
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
for(const artifact of manifest.artifacts){
  if(path.isAbsolute(artifact.canonicalPath)||artifact.canonicalPath.split('/').some(x=>x==='..'))throw Error('unsafe artifact path');
  let offset=0;
  const bytes=Buffer.concat(artifact.parts.map((entry,index)=>{
    const encoded=fs.readFileSync(`${base}/${entry.file}`);
    if(encoded.length>manifest.maxEncodedPartBytes||encoded.length!==entry.encodedFileByteLength||sha(encoded)!==entry.encodedFileSha256)throw Error('encoded hash');
    const part=JSON.parse(encoded),raw=Buffer.from(part.base64,'base64');
    if(part.artifactPath!==artifact.canonicalPath||part.index!==index||entry.index!==index||part.byteOffset!==offset||entry.byteOffset!==offset||part.rawByteLength!==raw.length||raw.length!==entry.rawByteLength||sha(raw)!==part.rawSha256||sha(raw)!==entry.rawSha256||part.wholeSha256!==artifact.sha256||part.wholeByteLength!==artifact.byteLength)throw Error('part binding');
    offset+=raw.length;return raw;
  }));
  if(bytes.length!==artifact.byteLength||sha(bytes)!==artifact.sha256)throw Error('whole binding');
  const gitBlob=crypto.createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex');
  if(gitBlob!==artifact.candidateGitBlob)throw Error('Git blob binding');
  fs.mkdirSync(path.dirname(artifact.canonicalPath),{recursive:true});
  fs.writeFileSync(artifact.canonicalPath,bytes);
}
```

Then run `node digital-twin/tools/studio/studio.mjs check`; it must report **PASS / FRESH / CURRENT**. With Blender installed, run `node digital-twin/tools/studio/studio.mjs blender --check --blender <installed Blender executable>` for the deeper project fingerprint and ownership check. `isolated-recomputation.json` binds the archive source head, transported exact bytes and the independent restoration/check results. No owner cache, SQLite or raw-photo directory is required.

`glb-audit.json` parses the exact header/chunks, verifies the complete self-contained geometry/material asset and external references. `blender-audit.json` records the exact project's scenes, objects, collections, dependencies, image/script state and privacy settings. The scene retains accepted cameras, lights, materials, world and floor. Its render is Pi5 S02; use native S04 images for integrated HAT presentation claims.

`visual-evidence-manifest.json` binds every original published image to its JPEG review proxy by path, SHA, byte count, format and dimensions, with a permitted claim. Source-model renders and native captures differ in lighting, selection tint and camera; visual correspondence establishes presentation identity, not measured mechanical fit. All 75 individual pin columns are proved by CAD/final GLB checks; native close/low views show their separation. Underside views show the 2x20 socket, solder field, SWD pads and certification/silkscreen. The top/low views show the routed red/black lead.

The physical Escape sequence has four CUA window captures plus semantic state/ledger evidence. State A has the existing full source crop in this run; the sequence proves dismissal/selection/native window behavior without expanding PDF-source claims. State D's semantic observer briefly saw hidden during the native fullscreen transition; its subsequent capture shows the restored window. A HAT selected while the saved step resumed retained its selection even when its earlier framing camera looked at the tray; these four frames prove Escape priority, not HAT framing. Separate installed/framed captures prove HAT appearance.

Final native run: **1 passed in 7m20.6s**. One in-run embedded WDIO focus-state evaluation warning recovered; afterSession mock cleanup also warned after PASS. Both are retained in `validation-output/native-final.txt`. Earlier failures and raw outputs remain private and are enumerated in `native-closeout.json`. Do not call the run warning-free.

**OWNER INTEGRATED-VIEW ACCEPTANCE: PENDING.** Independent technical readiness and physical owner acceptance remain separate.

Inventory: **42 artifacts, 651 ordered JSON/base64 parts, 81,225,572 exact raw bytes**, and **22 JPEG visual proxies**. Canonical GLB SHA `ceff9949cf80575e87e56feb0682894c58391ea7e64e1700f6e82f1c3d06cac3`; Blender SHA `59fe591f77f3a6b0f0a326a1d6aacc01060483a258635620390866c19d032404`.

| Visual | Permitted claim |
| --- | --- |
| [01-top-orthographic.jpg](visuals/01-top-orthographic.jpg) | Authored source HAT geometry review render; reference appearance only, no private source pixels or fit claim. |
| [02-underside-orthographic.jpg](visuals/02-underside-orthographic.jpg) | Authored source HAT geometry review render; reference appearance only, no private source pixels or fit claim. |
| [03-top-front-three-quarter.jpg](visuals/03-top-front-three-quarter.jpg) | Authored source HAT geometry review render; reference appearance only, no private source pixels or fit claim. |
| [04-top-rear-three-quarter.jpg](visuals/04-top-rear-three-quarter.jpg) | Authored source HAT geometry review render; reference appearance only, no private source pixels or fit claim. |
| [05-low-header-angle.jpg](visuals/05-low-header-angle.jpg) | Authored source HAT geometry review render; reference appearance only, no private source pixels or fit claim. |
| [06-underside-three-quarter.jpg](visuals/06-underside-three-quarter.jpg) | Authored source HAT geometry review render; reference appearance only, no private source pixels or fit claim. |
| [07-pin-header-close-up.jpg](visuals/07-pin-header-close-up.jpg) | Authored source HAT geometry review render; reference appearance only, no private source pixels or fit claim. |
| [08-connector-bank-close-up.jpg](visuals/08-connector-bank-close-up.jpg) | Authored source HAT geometry review render; reference appearance only, no private source pixels or fit claim. |
| [09-speaker-and-motor-corner.jpg](visuals/09-speaker-and-motor-corner.jpg) | Authored source HAT geometry review render; reference appearance only, no private source pixels or fit claim. |
| [10-spi-uart-i2c-headers.jpg](visuals/10-spi-uart-i2c-headers.jpg) | Authored source HAT geometry review render; reference appearance only, no private source pixels or fit claim. |
| [a022be99d395-a042411e9cc7-rpi5-S02.jpg](visuals/a022be99d395-a042411e9cc7-rpi5-S02.jpg) | Receipt-bound final Blender presentation render for the integrated pack, Pi5 S02 hero; HAT is in tray, no S04 fit claim. |
| [native-hat-inspector.jpg](visuals/native-hat-inspector.jpg) | Native inspector distinguishes displayed/checked artifacts, source and measured overlap limits. |
| [native-parts-hat.jpg](visuals/native-parts-hat.jpg) | Full canonical Parts tray with the detailed HAT selected; one semantic inventory instance. |
| [native-pi5-framed.jpg](visuals/native-pi5-framed.jpg) | Pi5 S04 selected HAT framed closely, with the detailed model and its inspector. |
| [native-pi5-guided.jpg](visuals/native-pi5-guided.jpg) | Pi5 S04 at the installed preview pose in its normal guided view; not physical fit. |
| [native-pi5-low-header.jpg](visuals/native-pi5-low-header.jpg) | Physically orbited Pi5 S04 low header view showing individual separated pins. |
| [native-pi5-underside.jpg](visuals/native-pi5-underside.jpg) | Physically orbited, isolated HAT underside: socket, solder/silkscreen and routed lead; no mechanical-fit claim. |
| [native-state-A.jpg](visuals/native-state-A.jpg) | Manual overlay open, HAT selected, native fullscreen; overlay dismissal evidence, not a PDF raster-quality claim. |
| [native-state-B.jpg](visuals/native-state-B.jpg) | First separate physical Escape: overlay closed, HAT selected, fullscreen retained. |
| [native-state-C.jpg](visuals/native-state-C.jpg) | Second separate physical Escape: selection cleared, fullscreen retained. |
| [native-state-D.jpg](visuals/native-state-D.jpg) | Third separate physical Escape: native fullscreen exited. |
| [native-zero-guided.jpg](visuals/native-zero-guided.jpg) | Zero 2 W S04 at its distinct preserved installed orientation in guided view; not physical fit. |
