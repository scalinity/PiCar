# Studio 3.5 Robot HAT integration handoff

**STUDIO 3.5 closeout:** the owner authorized the deterministic preview-layout repair on 2026-10-04. The layout defect is resolved, and the remaining native visual, observation, resource and physical Escape journey passes. [All readiness gates](evidence/studio-3-5-hat-integration/readiness-gate.json) are complete: **STUDIO 3.5 READY FOR INDEPENDENT REVIEW**. Normal publication is authorized only for `studio/s3-5-hat-integration`. **OWNER INTEGRATED-VIEW ACCEPTANCE: PENDING.** Independent technical review does not establish physical fit or M7 admission.

## Provenance and preservation

Accepted Studio 3 base: `aa2713396d4869f9698f8b242640c3f55d205435`, the P3 PDF-explanation-only descendant of accepted candidate `7309cbc9fe4d157f229b4dd840fbc4f0ce8ee1eb`. Integration branch: `studio/s3-5-hat-integration`. Integrated pack commit: `092c354ba6072c24974ef768be1b0ce6c226281f`. Runtime/test code head: `d2841424837fa229c2d612cef8163959cf528650`. Final publication commits add review evidence and documentation; pin the final remote head supplied with the review request.

HAT source branch: `studio/s3-5-hat-fidelity`, source head `eec0f190db777a98f6ac3085ce69f9e76f3843d0`. Its separate worktree and branch remain intact. The three exact source commits were cherry-picked in order:

- `a4bac7c8b0c36ac538ddad2a51e8e013f5f10a44` → `ec8a2d9ac6a2990245acbfd4a9ed35688c22549f`.
- `d435f8ecf2ab2088a5044d34c8549cd323f71388` → `50b453ee8a975abbb3de85381b70528dfc168f3f`.
- `eec0f190db777a98f6ac3085ce69f9e76f3843d0` → `7aa69d368b20ccf1bb729c75d4014d4be117d3a3`.

The exact 24 adopted paths and source/integrated-source hashes are in [integration-identities.json](evidence/studio-3-5-hat-integration/integration-identities.json). The historical source handoff `HANDOFF_STUDIO_3_5_HAT_FIDELITY.md` was retained unchanged.

The material conflict preserves all 18 accepted definitions and adds every actual authored definition. The source handoff/brief says 15 new definitions; the exact commits contain **14**, yielding 32 registry entries and 19 HAT-used materials. No fifteenth definition was invented. Pipeline and ignore rules retain all accepted Studio 3 content while adding the HAT-specific generation instructions and exact private-folder ignore. There were no unexpected source conflicts.

[Preservation evidence](evidence/studio-3-5-hat-integration/preservation.json) verifies unchanged canonical membership, all 144 instance records, 47 non-HAT definitions, all active source placements, recipes, candidates and closure bindings, and untouched owner instructions/M2 untracked diagnostics. The only general runtime repair is the expressly authorized manual-preview initial sizing in `ManualPanel.tsx` and the locked MediaBox constant in `v40-pdf-identity.ts`. Selection, persistence, routing and renderer logic are unchanged. M2/M5/M6/M7 instructional geometry and accepted receipts remain preserved.

## Reproduction and final generated identities

Normal source-mode chain and tessellation label: `s35-01`. Frozen lock recreated with Python 3.12.14, CadQuery 2.8.0 and OCP 7.9.3.1.1; the prior temporary environment had expired. Node 26.10.0 and uv 0.12.21 are the current local tooling. Neither dependency lock changed.

HAT display BREP reproduced exactly: `825e2f068d41fac21ca1a32ebeae410f7c5aef4eb5d717b20c22b0c75777abda`, 18,465,633 bytes. Instructional BREP remains `bbdbbeb758d724c52450902c427c872b6eb78eff59a89b698d76a54d86d8461a`. The regenerated display record changes only its chain label and generated predecessor path. It reproduces all 50 positive overlap rows, including all 40 accepted screw-contact values exactly; ten rows describe socket/board schematic-header engagements. These compare display geometry against other instructional shapes, not all detailed display pairs.

The CAD board frame remains `(0,0,0)–(85,56,1.6)` mm. Four adopted radius-1.4-mm bores remain at `(3.5,3.5)`, `(61.5,3.5)`, `(3.5,52.5)`, `(61.5,52.5)`, with 0-mm measured center deviation. The socket/pad axis remains `(32.5,52.5)` mm and socket depth 15.5 mm. Pi5/Zero transforms and their existing 180-degree relationship are unchanged.

- Old pack: `4a7a782926efcacc7eadd5f671ac86e26af89a83613ec1fea72156275a629415`.
- New pack: `a022be99d39570a3805b4ad2cf1c72a14c3bc5b5ff2d9865679d1b01bff47db7`.
- Old GLB: `2d626edd870e7276626a4e04fcaccae6db2b81607643b3835668cde9711234e8`, 3,261,348 bytes.
- New GLB: `ceff9949cf80575e87e56feb0682894c58391ea7e64e1700f6e82f1c3d06cac3`, 15,500,064 bytes.
- Old presentation: `7baf0384e7678a136d830f0c9d8b34a79bd1beb4eb11f8113c1c632d8808bd1e`.
- New presentation: `a042411e9cc754079ab9c49b3b4bc9d99ab23b42b93e0fa4f81b1e7f401f39d8`.
- New Blender project: `59fe591f77f3a6b0f0a326a1d6aacc01060483a258635620390866c19d032404`, 11,283,362 bytes.
- Final Blender render: `5f84145c39fb721b81d2d1c3b30272cae7437cc81f9122c8612a103ca0579e78`, 3,653,673 bytes, Pi5 S02 hero; this is not S04 native visual evidence.

The exact GLB has 48 nodes/meshes, 178 primitives, 31 used material entries, 467,458 vertices and 457,910 definition triangles. The HAT has 32 grouped finish primitives, 19 materials, 365,579 vertices and 353,540 triangles, replacing the old 12-primitives/2,176-triangles display. One canonical HAT instance is retained. CAD and final-GLB tests independently check all 75 exposed pin columns (60 servo + 7 SPI + 4 I2C + 4 UART), 0.64-mm widths, 2.54-mm pitch and separation after tessellation. These are geometric tests; final native close/low views also show separated pin columns.

Both trays retain 156 canonical slots, 143 modeled instances and 13 tiles. Pi5 frontier/later/spare counts are 50/69/37; Zero counts are 47/72/37. Groups retain plates 8, electronics 7, actuators 8, wheels 4, fasteners 116, cables 4, supplies 6, tools 3. Both tray audits HOLDS.

Normal Blender rebuilds retained cameras, lights, floor, world, render settings and all surviving materials. An initial deep-check fingerprint mismatch was traced exactly to obsolete unused `MAT-studio-pcb-blue` being dropped on save/reload. A normal refresh, without resetting presentation, produced the current receipt and a deeper check with no problems. The initially failed render/logs remain private.

## Authorized layout repair and regression

The historical [validation-blocker.json](evidence/studio-3-5-hat-integration/validation-blocker.json) remains intact. Its resolution is [manual-layout-resolution.json](evidence/studio-3-5-hat-integration/manual-layout-resolution.json), commit `efde60d75ab7a07f14ec938be1c49b9ecfb8bdda`. The locked booklet is SHA `2f4ea3ae3729bfb6bc92f8fdba30f31937f9df2c3a80e5774ef03fb076f386ce`, all-page MediaBox `1122.52 × 793.701` points. The existing verified normalized source crop and existing CSS scaling calculation now reserve the canvas width/height immediately. Asynchronous rendering writes the same dimensions and identical content.

Before the repair, the held PDF transition moved the relevant part row 87.203125/89.78125 CSS pixels, and the integrated diagnostic missed 2/30 presses (accepted control 0/30). Afterward, all four Chromium/WebKit × Pi5/Zero regressions passed: **32 real pointer presses, zero movement, zero misses**. The formerly failing focused WebKit selection/earlier-observation run passed **30/30**, including ten observation and twenty selection cases. The controlled accepted/integrated diagnostic passed with **0/30 misses each**. These preserve the real pointer-down, rendered transition, pointer-up and semantic selection assertions; there are no interaction delays/retries/capture hacks or disabled interaction in the product. Source crops, PDF identity, selection implementation, persistence and engineering data are unchanged.

## Final native views, picking and inspection

[Visual manifest](evidence/studio-3-5-hat-integration/connector-review/visual-evidence-manifest.json) binds ten adopted source HAT render proxies, one final Blender hero proxy and eleven actual native CUA capture proxies. [Visual correspondence](evidence/studio-3-5-hat-integration/visual-correspondence.json) maps every source render to the represented features in final native views. Lighting, selected-object teal tint and camera differ; this is a feature/registration comparison, not photographic calibration or mechanical qualification.

Pi5 S04 and Zero S04 both visibly replace the old proxy with the white populated board, individual colored-base pin fields, connector banks, IC/passives, inductors and speaker. Zero retains its distinct preserved orientation and board context. Native framing/manual orbit/low-pin views retain all separated column geometry. Isolated underside pixels show the deep 2x20 socket, solder/SWD field, certification and Robot Hat V4 marking; the top/low views show the routed red/black lead. One canonical `PX-V40-INS-ROBOT-HAT-001` owns the 32 display meshes; five separate physical CUA clicks on visibly identified PCB, pin, speaker, connector and IC regions each select that same instance after clearing selection. [Picking receipt](evidence/studio-3-5-hat-integration/native-hat-picking.json).

The inspector distinguishes displayed SHA `825e2f068d...` from checked instructional SHA `bbdbbeb758...`, preserves source/closure provenance and displays schematic socket/board overlap **Pi5 348 mm³ / Zero 524 mm³** separately from accepted screw contacts up to **2.6 mm³**. It does not hide overlaps or admit physical fit. All inspection controls were exercised and reset: isolate/ghost/explode/deck-clip flags false, canonical one-HAT root retained, 32 meshes retained. Diagnostic clip/explode parameters retain inactive defaults; their presence in the diagnostic object does not mean clipping remains enabled.

Three separate physical CUA Escape calls were recorded with semantic A/B/C/D states and four native window captures: A overlay+HAT selection+fullscreen; B overlay closed, selection/fullscreen retained; C selection cleared, fullscreen retained; D native fullscreen exited. The exact full persisted ledger before/after is equal. D's observer caught hidden during the native window transition; the subsequent CUA image shows the restored visible window. The saved-step return began playback before framing, so these Escape frames can look at the tray while the HAT remains selected; the separate installed/framed captures establish HAT appearance. State A shows the complete existing source crop in this run. Neither fact is hidden or converted into a wider PDF/frame behavior claim.

The final debug build binds all included runtime/test-hook source bytes, exact built manifest/GLB and native binary SHA `9f5355cb5b57590becd0a5bf9dfa7c92a348034d097ed3cf7b69379260bf8740`, 97,959,184 bytes: [native-build-identity.json](evidence/studio-3-5-hat-integration/native-build-identity.json). Its built-source bindings still match the final source tree. The bounded final native journey is **1 PASS, 7m20.6s** in a fresh guarded disposable app-data/SQLite context. Owner SQLite remained unopened. One embedded WDIO focus-state evaluation warning recovered during the run; afterSession mock cleanup also warned after PASS. The final transcript preserves both. Earlier harness/picking/timeout/backup-boundary failures remain private and are enumerated in [native-closeout.json](evidence/studio-3-5-hat-integration/native-closeout.json); none is relabelled PASS.

## Performance and resource ownership

All four fresh samples use **1121×704 CSS, 120 active frames**, matching the accepted baseline viewport. The accepted full-tray baseline was DPR 2, 60 fps, mean 16.67 ms, p95 17 ms, 579 calls, 568,576 triangles. Samples record active RAF intervals and existing diagnostic continuous orbit, except the static guided view, which performs controlled active redraws through existing controls start/end events without moving the camera.

| Sample | DPR observed / final | fps | mean ms | p95 ms | calls | triangles |
| --- | --- | --- | --- | --- | --- | --- |
| A-full-tray | [2] / 2 | 60.00 | 16.667 | 17 | 619 | 1,271,304 |
| B-pi5-s04-guided | [2, 1.5] / 1.5 | 60.00 | 16.667 | 18 | 428 | 1,057,048 |
| C-close-hat-orbit | [2] / 2 | 60.03 | 16.658 | 18 | 467 | 1,134,442 |
| D-isolated-hat | [1] / 1 | 60.00 | 16.667 | 18 | 65 | 707,082 |

Full tray opening: canvas 423 ms, first render 424 ms, first frame handed to compositor 478 ms; all load timings are in the raw sample receipts. These short same-machine samples are not a long-duration thermal benchmark.

The expected definition increase is 351,364 HAT triangles and 20 finish primitives. In the full tray's two render passes that adds exactly 702,728 triangles and 40 calls: **1,271,304 triangles / 619 calls**. Grouped finishes survive: 75 pins are not 75 independent draw calls; isolated HAT is 65 calls (32 grouped meshes in two passes plus floor), 707,082 triangles. Close-orbit totals also depend on visible surrounding tray/assembly objects.

The existing adaptive DPR governor was observed honestly: B transitioned 2→1.5, C returned to/stayed at 2, D stayed at its bounded floor 1. It moves in half steps within 1–2, backs off after drops and requires a long calm stretch before raising. No fidelity reduction or governor change was made. The final active windows remain about 60 fps, p95 17–18 ms; these data show bounded usable performance, not guaranteed permanent DPR 2. No steady frame collapse, draw-call explosion or accumulating ownership was observed.

[Resource receipt](evidence/studio-3-5-hat-integration/native-resource-ownership.json): six Pi5↔Zero switches, three Studio exit/reentries, Parts↔S04, selection/isolation/reset. Every owned board material disposed exactly once; all 32 shared pack HAT geometries disposed zero times. Owned entries stayed board+environment; textures 4→4→4, programs 3→3→3; geometries 180→180→174 (inspection-only buffers disappear on fresh reentry). Canonical roots stay 156; one HAT/32 meshes stays present. F10 ownership is preserved; no resource cleanup change was introduced.

## Build-along, observations and validation

The final native check strictly preserves the complete Studio aggregate/event/result records across inspection, board switching and navigation. Actual Reference exit intentionally saves Setup's route; the test accounts for that accepted behavior rather than expecting all unrelated Setup records to stay absent. Parts Return compares the entire ledger at its own before/after boundary and restores S04 without writing progress. Physical Escape compares the entire ledger exactly again.

Accepted Studio 3 synthetic HAT observation retains the old pack and geometry/display/pose/closure identities byte-for-byte after reload, remains **Taken against an earlier digital revision**, and the selected synthetic evidence ZIP retains the old identity. Unit, Chromium, regular/disposable WebKit and native SQLite checks pass. Owner photos/ZIPs are neither used nor published. Existing Studio 3 build-along regressions cover separate board progress, bookmark/Parts return, physical completion/undo, private attachment/export and persistence isolation; full final results are below.

- CAD/fidelity/HAT: **32/32 PASS**, 82.06 s (24 fidelity + 8 HAT).
- Typecheck: **PASS**.
- Unit: **304/304 PASS**, 27 files, 14.08 s.
- Layout regression: **4/4 PASS**, 32 real presses, zero movement/misses, 53.0 s.
- Previously failing repeated focus: **30/30 PASS**, 48.9 s.
- Controlled selection diagnostic: **2/2 PASS**, accepted 0/30, integrated 0/30, 1.1 m.
- Native debug build: **PASS**; final native journey **1/1 PASS**, 7m20.6s, warnings disclosed above.
- Final full browser: **131 passed / 2 failed / 1 skipped, 16.2 m — RUN / FAIL — EXPLAINED**. Both failures are the accepted Chromium/WebKit legacy PDF raw-page assertion; no new integration failures. [Final validation receipt](evidence/studio-3-5-hat-integration/validation-final.json).
- Final legacy browser: **10/10 PASS**, 8.8 s.
- Pack producer: **606 checks**, zero failure/withheld display; pack **PASS**, sources **FRESH**, presentation **CURRENT**.
- Exact-byte isolated restore from tracked evidence commit `b803715c628f1a7be2ee052d440082789ed4e161`: **PASS / FRESH / CURRENT**, deeper Blender problems empty. All 42 whole/part/Git-blob bindings verified. [Isolated recomputation receipt](evidence/studio-3-5-hat-integration/connector-review/isolated-recomputation.json). Later closeout commits only update evidence/documentation; code and transported artifact bytes are unchanged.

The previous full browser result (125 passed / 4 failed / 1 skipped) and previous repeated focus (29 passed / 1 failed) are preserved as historical transcripts. Two full-browser failures were accepted legacy PDF assertions: M3 correctly persists page 1 in durable Setup while preserving original legacy raw page 2; they incorrectly expect the raw legacy snapshot to be overwritten. The accepted P3 docs-only explanation remains intact. The new layout and WebKit observation failures are resolved and must not be hidden inside that aggregate.

## Exact-byte reviewability, privacy and boundaries

[Connector review README](evidence/studio-3-5-hat-integration/connector-review/README.md) contains the complete restore procedure. The manifest transports **42 artifacts / 651 ordered parts / 81,225,572 raw bytes**, every encoded part below 180,000 bytes, with exact raw/encoded/whole hashes, lengths, offsets/order and Git blob binding. It restores all canonical assets and ignored freshness dependencies in a fresh tracked-source checkout, without owner files/caches. Separate GLB/Blender audits are complete. **22 JPEG proxies** bind ten source-model renders, the final hero and eleven integrated native captures. Canonical bytes and bindings are unchanged.

CUA-produced screenshot EXIF/Photoshop metadata is removed without recompressing the image or changing any decoded pixel. Original returned JPEG hashes and sizes remain in the capture-privacy receipt; raw bytes are retained privately. [Privacy source/history receipt](evidence/studio-3-5-hat-integration/privacy-source-history.json) scans all new reachable changed-blob versions, new review documents, decoded transport raw bytes, compressed Blender contents, PNG metadata and JPEG metadata. No raw owner HAT images/scans, owner reference JPEGs, overlays/registrations, ZIPs, database, agent state or private source pixels are published. All original failed diagnostics stay private; only classified full literal checkout/scratch paths are replaced in public logs. The original source handoff's functional source-worktree locator, explicitly supplied in the brief and already published, is classified and retained as historical provenance. No published history is rewritten.

M7 remains **BLOCKED 0/58**, Pi5 0/29, Zero 0/29; **S07 BLOCKED, S09 REFUSED, G-CAD BLOCKED, M8 unauthorized, rpi4 PRESERVED_NON_TARGET**. No closure/overlap check was weakened, no instructional geometry or engineering admission changed. Remaining approximations: no calipers; datum/scan/photo/standard/approximate-labelled dimensions; approximate buttons and lead route; omitted IC marks except inductor values, passive reference designators, via fields/copper traces; display-to-instructional overlaps, without detailed-display pair fit qualification.

**OWNER INTEGRATED-VIEW ACCEPTANCE: PENDING.** This does not block independent technical review. No Studio 4 implementation, M8, PR, merge, main/tag push, force push or branch deletion is authorized by this closeout. Only the normal integration-branch push follows the full readiness gate.

## Complete focused GPT-6 Pro integration review prompt

Review repository `scalinity/PiCar`, branch `studio/s3-5-hat-integration`. Freeze and report its final remote HEAD supplied in the owner's review request; verify the remote ref and reject an advancing candidate rather than silently changing the reviewed target. Baseline is `aa2713396d4869f9698f8b242640c3f55d205435`, accepted Studio 3's P3 docs-only descendant of `7309cbc9fe4d157f229b4dd840fbc4f0ce8ee1eb`. Review the integration delta only. This is not a new audit of accepted Studio 3 persistence architecture.

The exact HAT source is `studio/s3-5-hat-fidelity`, head `eec0f190db777a98f6ac3085ce69f9e76f3843d0`, with ordered source commits `a4bac7c8b0c36ac538ddad2a51e8e013f5f10a44`, `d435f8ecf2ab2088a5044d34c8549cd323f71388`, `eec0f190db777a98f6ac3085ce69f9e76f3843d0`. Begin with this handoff, `integration-identities.json`, `preservation.json`, `manual-layout-resolution.json`, native build/closeout/sample/resource/observation/picking/Escape receipts, tray audit, final validation receipts and `connector-review/README.md`/manifests/audits/isolated recomputation/privacy audit. Retain historical failed evidence; evaluate final evidence at its exact source/artifact hashes.

If connector access truncates any GLB, Blender, render, native evidence or required freshness input, retrieve every indexed small part, verify encoded/raw/whole hashes, order, offsets, size and Git blob, reconstruct the exact canonical files in a fresh checkout and rerun existing pack and deeper Blender checks. Inspect actual visual proxies and their bound originals; never turn retrieval failure into mandatory UNKNOWN where the complete transport is available. If an actual gap remains, name it and withhold acceptance. Do not alter canonical artifacts, weaken tests or infer owner visual acceptance/physical fit.

Answer all fifteen integration questions:

1. Did the exact approved HAT asset integrate, with three preserved source cherry-picks and complete source/material provenance (14 actual additions, despite the historical claim of 15)?
2. Is display BREP SHA `825e2f068d41fac21ca1a32ebeae410f7c5aef4eb5d717b20c22b0c75777abda` exact and deterministically reproduced, while checked instructional SHA stays unchanged?
3. Are frame, bores, adopted mounting datums, Pi5/Zero transforms and S04–S09 placement/closure/recipe sources unchanged?
4. Do all 75 exposed 0.64-mm, 2.54-mm-pitch pins survive final tessellation with the required separation and counts?
5. Do actual native Pi5 S04 and framed/low/underside pixels prove replacement of the old proxy with the detailed board?
6. Does Zero S04 retain its correct distinct orientation and board context?
7. Does the HAT remain one semantic instance despite 32 grouped display solids, including five independent physical region clicks?
8. Are materials and source bindings complete, and does the inspector distinguish displayed/checked geometry and report overlaps without physical-fit admission?
9. Are pack `a022be99d39570a3805b4ad2cf1c72a14c3bc5b5ff2d9865679d1b01bff47db7`, GLB `ceff9949cf80575e87e56feb0682894c58391ea7e64e1700f6e82f1c3d06cac3`, presentation `a042411e9cc754079ab9c49b3b4bc9d99ab23b42b93e0fa4f81b1e7f401f39d8` and Blender exact, with PASS/FRESH/CURRENT and independently recomputed deeper fingerprint?
10. Is canonical stock unchanged: 156 slots per board, 143 modeled/13 tiles, tray audit HOLDS?
11. Are Studio 3 build-along/persistence preserved, including strict ledger boundaries, physical Escape, and the owner-authorized initial manual sizing fix with unchanged crops/content/selection and zero-movement real-press regression?
12. Do accepted Studio 3 observations remain unchanged and correctly read as earlier-revision evidence after reload/export?
13. Is final native performance bounded and usable at the recorded viewport, honest about DPR 2→1.5/1, expected triangle/draw increase and recovered driver warning, with correct resource disposal and no accumulating ownership?
14. Do full new-history/text/decoded-media/transport/privacy checks exclude owner raw source pixels/scans/EXIF/ZIPs/SQLite/agent state, retain safe provenance and preserve public history?
15. Does M7 remain BLOCKED 0/58 with S07 BLOCKED/S09 REFUSED/G-CAD BLOCKED, rpi4 preserved and M8 unauthorized, without admission or overlap-check changes?

Report concrete findings with severity, exact file/line or receipt/hash evidence, and the smallest required remediation. Keep two accepted legacy PDF assertion failures explicitly **RUN / FAIL — EXPLAINED** rather than claiming a green aggregate; require every new HAT/layout/observation/Studio regression to be resolved. Keep **OWNER INTEGRATED-VIEW ACCEPTANCE: PENDING**. Return **ACCEPTED — READY FOR STUDIO 4** only if there is no blocker/high/P2 defect or required integration verification gap. This disposition authorizes no Studio 4 work, M7 admission, M8, merge or additional publication action.
