# Studio 3 — Pro remediation and focused re-review

Status: **STUDIO 3 READY FOR FOCUSED PRO RE-REVIEW**. S3-01–S3-05 and the required artifact/native reviewability gaps have author-side remediation evidence. Independent GPT-6 Pro acceptance is pending. The earlier verdict was **NOT ACCEPTED**; its five P2 findings and UNKNOWN binary/native inspection gaps remain historical facts. Studio 3.5, the waiting new HAT branch, Studio 4 and M8 remain outside this work.

Review baseline: `e15ea228f5c5a77440a6cffb67f3ceae08df1ae9`. Approved Studio 2: `59e5ded78baccadf25b4b63bc2266d9210b4ee70`. All new evidence is additive in [studio-3-pro-remediation](evidence/studio-3-pro-remediation/README.md). Use the final published branch HEAD supplied in the execution response; this closure document cannot contain its own commit SHA.

## Five remediations

| Finding | Final behavior and evidence |
|---|---|
| S3-01 | Photo intent captures A's exact aggregate/revision, Context, variant, step, observation identity and pack provenance before real copy. `sessionActionBound` sends the resulting command through accepted M3 prepare/commit/CAS/ack/retry. Both engines prove one new copy, A one observation, B none, B stays selected. Repository failure and lost acknowledgment retry the identical command; genuine conflict retains the private copy and actionable error across reopening. The old global-selection submission is reproduced using a controlled old-submission seam at the real adapter boundary, not a whole baseline checkout run. |
| S3-02 | Parts return navigates without a bookmark write: S04→S04, S10/S29→display S09 while durable S10/S29 survive exactly. Ordinary explicit rail navigation still bookmarks. Board switching stays write-free; final native Parts resume preserves the saved ledger. |
| S3-03 | HOOK/LOOP-001 show “source lot identity, length unknown”; -002 show “preallocated S06 cut piece; amount unknown”. Identical-piece wording is restricted to actual discrete hardware. M2.5x6 control remains “1 of 10 identical pieces”. No canonical slot removed. |
| S3-04 | Replaced “No defined shape: cut from tape stock, so it is shown as a tile.” with “No trusted 3D shape is available for this stock, so it is shown as a labeled tile.” Normal source-chain/tessellation/pack/Blender generation changed metadata identities; geometry and GLB bytes did not change. |
| S3-05 | Only exact normalized `src/features/assembly-3d/build-along.tsx` receives the six-import persistence exception, using complete set equality. Only exact `src/pages/Studio.tsx` receives the route exception. Six synthetic negatives reject extra imports, nested adapters, other viewer imports and copied routes. No rogue production module or React useEffect added. |

Exact persistence-sensitive imports: `../assembly-session/accepted`, `../assembly-session/commands`, `../assembly-session/store`, `../assembly-session/observation`, `../assembly-session/evidence-zip`, `../../platform/evidence`. See [remediation-results.json](evidence/studio-3-pro-remediation/remediation-results.json) and [acceptance-map.json](evidence/studio-3-pro-remediation/acceptance-map.json).

## Final artifact identities

| Artifact | Prior reviewed Studio 3 | Remediated final |
|---|---|---|
| Pack | `ad00bd0f4ad2904c3c1ca12d05b2990da5cb8e0e0076eb4e928372e08d202f41` | `4a7a782926efcacc7eadd5f671ac86e26af89a83613ec1fea72156275a629415` |
| GLB SHA256 | `2d626edd870e7276626a4e04fcaccae6db2b81607643b3835668cde9711234e8` | `2d626edd870e7276626a4e04fcaccae6db2b81607643b3835668cde9711234e8` (unchanged; 3,261,348 bytes) |
| Presentation | `6290433110f76a0724a1b05ba4b004b04bb103a7f45a5d621c5be72734fffc9e` | `7baf0384e7678a136d830f0c9d8b34a79bd1beb4eb11f8113c1c632d8808bd1e` |

Blender SHA256 `27d90975b29c36152fe206cd54929f02eecb8973e7b4a7200596a611a48225a7`; render SHA256 `1a0ce8db64cdf1a7054e0b087d489cedec9c14fa58fda0f4b4eca7457b52177f`. Current `s3pro-01` tessellation: index `0fef3e3ea35dea3a8dfd537a3717063a7b34fc95ace567f2f3964bfdbeaecf33`, buffer `180ee89e4da0acb3b3f7189c01492e03860387759fbd60e611ae471f9732f928`. Producer receipt records the normal commands and source-mode qualification limit. Final checker and isolated restoration both give **PASS / FRESH / CURRENT**; tray audit **HOLDS** both boards. The normal pack producer recorded 606 checks, zero failures.

Both boards retain 156 slots = 143 solids + 13 tiles. Pi5: 50 frontier, 69 later, 37 spare. Zero2W: 47 frontier, 72 later, 37 spare. Group counts remain Plates8/Electronics7/Actuators8/Wheels4/Fasteners116/Cables4/Supplies6/Tools3. Old selected HAT dependency is transported only as the unchanged current freshness input; the separate HAT branch `eec0f190db777a98f6ac3085ce69f9e76f3843d0` is not integrated.

## Exact-byte and native reviewability

[Connector review README](evidence/studio-3-pro-remediation/connector-review/README.md) explains reconstruction of **40 artifacts in 187 JSON/base64 parts**, each under 180,000 encoded bytes, totaling 20,551,657 raw bytes. It includes canonical GLB/.blend/render, current tessellation and required generated freshness inputs, plus exact critical native captures. Ordered offsets, raw/encoded hashes, whole size/hash and tracked Git blobs bind every byte. Restoring these into an isolated Git-archive source checkout gives PASS/FRESH/CURRENT with no owner files copied.

Structured GLB audit: 48 nodes, 48 meshes, 158 primitives, 18 materials, no textures/images/external URIs/private paths or credentials. Blender successfully opens/checks the exact project: 1 scene, 4 collections, 212 objects, 2 built-in images, no external libraries/scripts/missing dependencies. The generic `/tmp/` render default is functional; saved File Browser directory is `//` and filename stamp is disabled.

The final physical sequence is A(manual open, Plate A selected, native fullscreen), B(manual closed, selection/fullscreen retained), C(selection clear, fullscreen retained), D(fullscreen off). Three distinct CUA physical Escape calls, four exact frames, fresh AX states and monotonic numeric states are bound in the visual manifest. **State A's overlay paper/grid and close control are visible, but page-content raster is incomplete during fullscreen while document visibility is hidden. It proves overlay presence/dismissal, not a complete booklet raster.** B/C/D show rendered drawer thumbnails; passed browser cases cover normal booklet behavior. CUA supplies JPEG captures; exact originals are retained alongside their losslessly decoded PNGs and small JPEG proxies, with no cropping/retouching.

Actual macOS NSSavePanel is captured with a guarded disposable destination. Independently reopened ZIP: SHA256 `626b865e9476645afa6d1a232ad1d9a49b779c28913a35de9f555e27086c3fbf`, 3447 bytes; selected manifest and exact synthetic photo hash are recorded in [native-export.json](evidence/studio-3-pro-remediation/native-export.json). No raw photo/ZIP bytes are published.

## Final validation and warnings

Typecheck PASS. Units **301/26 PASS** in13.61s. Focused browser **22 PASS** (18 new Pro cases, 4 existing build-along); all cases pass again in the retained final full run. Full Chromium/WebKit: **125 passed, 2 failed, 1 skipped,18.0m — RUN / FAIL — EXPLAINED**. Both failures are the preserved legacy PDF-key page1 expectation versus M3-owned saved page2; legacy-only browser run passes10/10. Final tray census4/4 passes both boards/engines. WebKit private/ephemeral OPFS refusal remains an observed platform limitation; its diagnostic passes and persistent disposable OPFS succeeds. No failing assertion is weakened or called PASS.

Final rebuilt debug native case: **1 PASS,1m44.5s**; no in-run warning or correctness failure. It covers both sessions, physical complete/undo, bookmark/Parts resume/board switching, read-only controls, real synthetic private photo copy/reload, actual three Escapes, native Save panel and exact exported ZIP bytes. Binary/source/config/disposable-root identity is recorded; later commits affect only the external harness/evidence, with no bundled app source/config change. Owner DB unopened. One driver `afterSession` mock-store warning occurs after PASS at2026-10-04T01:12:04.332Z. Its source and lifecycle are investigated separately. Prior in-run focus timeouts and deadline/state-observer failures are retained in the attempt history, never called cleanup or hidden. See [native-run-result.json](evidence/studio-3-pro-remediation/native-run-result.json).

Bounded final tray performance: 1121×704, DPR2,120 active frames,60fps,mean16.67ms,p9517ms,579 draw calls,568576 triangles; first drawn frame425ms. No unexpected regression observed; no speculative optimization.

## Privacy, preservation and boundary

The producer clears saved private File Browser UI paths and excludes filename-stamp metadata. A rejected unpublished render/commit containing a real producer path was preserved privately; the clean publication clone excludes that commit from its published ancestry, without rewriting reviewed history. New source/history and final evidence are scanned, including decompressed Blender and media metadata. Runtime caches, private owner media/DB/ZIPs, helpers and the twelve historical M2 files remain excluded. Protected Studio 2/Studio 3/M7 historical evidence and owner instructions are preserved; the old tray test now writes to the additive output directory, after original receipts were restored byte-for-byte.

**M7 BLOCKED0/58; Pi5 0/29; Zero 0/29; S07 BLOCKED; S09 REFUSED; G-CAD BLOCKED; M8 NO; rpi4 PRESERVED_NON_TARGET.** Owner physical completion stays self-confirmed history, not engineering admission. Independent Pro acceptance remains pending; no new blocker/high/P2 application defect is known from these checks. The full-browser aggregate, native cleanup warning and State A raster limit remain explicit review disclosures.

## Focused follow-up review

Review only the delta from `e15ea228f5c5a77440a6cffb67f3ceae08df1ae9` to the final published `studio/s3-build-along` HEAD. Adjudicate S3-01–S3-05 and explicitly close or retain UNKNOWN for exact GLB/.blend/render/tessellation reconstruction, isolated PASS/FRESH/CURRENT, native physical Escapes and Save-panel/ZIP evidence. Inspect the disclosed State A raster limit and warning lifecycle; do not infer hidden pixels or classify earlier in-run warnings as cleanup. Preserve credit for previously passed Studio 3 areas; do not repeat the full audit. Return ACCEPTED / READY FOR STUDIO 3.5 INTEGRATION only if no blocker/high/P2 or required verification gap remains. Stop after review; do not integrate HAT, begin Studio 4/M8, alter M7, merge or publish changes.

---

## Historical Studio 3 handoff at reviewed baseline e15ea228

The following historical document is preserved verbatim. Its opening readiness status and identities predate Pro's NOT ACCEPTED verdict and are superseded by the current opening above.

# Studio 3 — full-kit tray and real-car build-along

Status: **STUDIO 3 READY FOR INDEPENDENT REVIEW** for the authorized full-kit/build-along scope. Required application, native, pack, privacy and preservation checks pass. The full browser aggregate remains **RUN / FAIL — EXPLAINED**, with 107 passed, two legacy PDF assertions and one skipped physical WebKit Escape case. Actual native physical presses cover that Escape behavior. This is not independent acceptance or engineering admission. Studio 3.5, Studio 4 and M8 are not started.

## Identity and scope

Approved starting HEAD: `59e5ded78baccadf25b4b63bc2266d9210b4ee70`, branch `studio/s2-pro-full-remediation`. Work branch: `studio/s3-build-along`. The initial pack check was PASS / FRESH / CURRENT. Twelve historical M2 untracked files are named and hashed in [preflight.json](evidence/studio-3/preflight.json), remain untouched and are excluded from publication. A later Claude session was confirmed by the owner to use its own worktree. After an unexplained mutation pause, the owner explicitly instructed this chat to continue and said that the other session would no longer work in this checkout. Attribution of that earlier mutation was not established. Newly supplied Robot HAT images remain private, untracked, untouched and outside this milestone.

The final closure commit cannot contain its own SHA. Resolve the published full HEAD with `git rev-parse origin/studio/s3-build-along`; the execution response supplies the exact local HEAD, remote HEAD and equality result. Implementation commit identities and validation provenance are recorded in the final closeout below.

| Commit | Scope |
|---|---|
| `a9a0eb210b596acacdaac3449653adba5e67429e` | Full canonical kit tray, pack/presentation and runtime shadow coverage |
| `3c0bc90a1c77fdf1d2f444bc0bfe062c69d34af4` | Build-along progress, private observations/export and themed controls |
| `b6c7dd2606375e01830d88508c6410c9b0a35828` | Test-only wait for a settled injected photo-save failure before retry |
| `477c48d1ad47061f21f69b1d3062e2ef44432eba` | Retain the viewed step across boards with different saved cursors; browser/native regressions |
| `14eb222b42c1328420185a5cd6a991c3d9adb33d` | Bound native manual verification at 360s and its UI wait at 240s; all assertions retained |

The final documentation/evidence commit follows these. No approved history is rewritten. Normal push is authorized only after the final receipts and privacy checks are complete.

## Full-kit inventory

The owner amendment makes Parts a full-kit view, while the instructional frontier stays S01–S09. Membership comes from `digital-twin/components/instances/planned-stock.json`, filtered by the selected active board, independently reconciled with definitions, compiled graphs, all 29 planned uses and tool requirements. No new inferred/tutorial stock is added. Canonical totals include the selected user-supplied board, accessories, backup stock and three tools. These are source stock claims, not an inspection of the owner's actual loose kit.

| Variant | Canonical / visible | Through S09, including tools | Later | Spare | Solids | Tiles | Tools included |
|---|---:|---:|---:|---:|---:|---:|---:|
| rpi5 |156|50|69|37|143|13|3|
| rpi-zero-2-w |156|47|72|37|143|13|3|

For each board, `156 = modeled 143 + tiles 13 = frontier + later + spare`. The three tools are a named subset of the frontier, not three extra pieces. Source dispositions: available111, backup37, accessory5, tool3. Groups: Plates8, Electronics7, Actuators8, Wheels4, Fasteners116, Cables4, Supplies6, Tools3.

Current parts retain normal finishes. Later solids use darker copies of existing materials; backups have separate spare labels and finishes. Tile rows explicitly identify their state and missing solid. Identical hardware has bounded rows and stable instance IDs. Tiny screws draw in the overview and become inspectable through the existing Fasteners Frame action; overview visibility is not a claim that every tiny item is individually readable at full scale. No later part gets an invented placement or future playable step. Shared definition geometry is retained; only owned state materials are added and disposed. Group labels avoid each other; colliding tile captions yield to group labels and remain available in the inventory. The owner requested themed statement/file controls and no textarea resize grip; final native pixels verify them. The full-kit light center exposed a clipped Plate A shadow at the former fixed shadow-camera edge. Runtime shadow coverage now includes the tray and all assembly states, with receiving-floor depth and inspection margin; both-board geometric regression checks and final native pixels verify continuous coverage. This changes no source shape, pose or pack identity.

### Plates A–H

Each board contains exactly one canonical instance of each definition `PX-V40-DEF-PLATE-A` through `-H`.

| Plate / canonical instance ID | State | Existing representation source |
|---|---|---|
| A / `PX-V40-INS-PLATE-A-001` | Current | M7 instructional revision BREP |
| B / `PX-V40-INS-PLATE-B-001` | Later | M6 amendment-shapes-04 candidate-artifacts BREP |
| C / `PX-V40-INS-PLATE-C-001` | Later | M6 amendment-shapes-04 candidate-artifacts BREP |
| D / `PX-V40-INS-PLATE-D-001` | Later | M6 amendment-shapes-04 candidate-artifacts BREP |
| E / `PX-V40-INS-PLATE-E-001` | Later | M6 amendment-shapes-04 candidate-artifacts BREP |
| F / `PX-V40-INS-PLATE-F-001` | Later | M6 amendment-shapes-04 candidate-artifacts BREP |
| G / `PX-V40-INS-PLATE-G-001` | Later | M6 amendment-shapes-04 candidate-artifacts BREP |
| H / `PX-V40-INS-PLATE-H-001` | Current | M7 instructional revision BREP |

The normal artifact resolver supplies these existing instructional artifacts, preserving E=RIGHT/F=LEFT and all existing limitations. Representation does not establish fit, dimensions, mating or engineering admission. Independent tray reconciliation is [tray-audit-studio3.json](evidence/studio-3/tray-audit-studio3.json): both invariants HOLDS, no canonical omissions, invented extras or overlap/layout failures. Negative tests reject missing later plates, fabricated IDs, bad state/disposition/group/definition/role/variant and source-use mismatch. Browser rendered census is separate evidence, including a detailed fastener census.

## Pack and presentation

| Identity | Approved Studio 2 | Studio 3 |
|---|---|---|
| Pack |5968a9827b1b02f3707c56f0032b933071491ee0249466d9708aac7b812cc352|ad00bd0f4ad2904c3c1ca12d05b2990da5cb8e0e0076eb4e928372e08d202f41|
| GLB SHA256 |4bb923c6cfccad5a528019eb4ac8d91112ff2b7542269e3c6cb48d039b275f42|2d626edd870e7276626a4e04fcaccae6db2b81607643b3835668cde9711234e8|
| Presentation |0bf8a3bdb80abec85512183cfe35648807dd3b30e82d29a81f1f89c6512b9e0b|6290433110f76a0724a1b05ba4b004b04bb103a7f45a5d621c5be72734fffc9e|

The pack changes because contract4 records canonical full-kit membership/state, all stock artifacts, counts, layout, camera and names/material bindings. The normal producer tessellated 48 definitions into the 3,261,348-byte GLB. The accepted `s2pro-01` source chain was reused; no M7 chain/aggregate was rerun. Blender was rebuilt normally for the new source assets and presentation state. Native source-collection validation finds 48 definitions and143 tray solids, with source bounds matching within5.01e-9m. The separate presentation receipt binds the new source collection and project fingerprint. Final integrity/freshness/presentation and Blender validation must all pass.

`producer-receipt.json` retains the actual manifest-bound producer identities. Original temporary producer stdout was lost during the host restart; it is not reconstructed or presented as a retained run log. Final pack freshness and Blender checks were rerun, and their actual outputs are retained.

[assembly-preservation.json](evidence/studio-3/assembly-preservation.json) compares the approved pack against Studio 3: every existing instructional/display artifact, step placement, recipe, candidate, source binding, display check and readiness claim is preserved. Added tray geometry does not alter existing assembly states.

## Session ownership and explicit writes

`features/assembly-3d/build-along.tsx` is the single Studio adapter to the accepted M3 store, command layer and evidence file workflow. Stable session IDs are `PX-STUDIO-RPI5` and `PX-STUDIO-ZERO2W`; viewing opens/validates existing records, and only Start build session creates one. Other Assembly sessions remain separate. Both boards use their own variant graph, progress, cursor and observations.

Only intentional step links/key navigation bookmark. Parts view, opening a saved cursor and a board switch do not themselves write. Switching boards retains the viewed step, including Parts0, even when both sessions have different saved cursors. Each board's saved bookmark and physical progress remain separate. Opening a board's bare resume route restores its saved cursor; an explicit Parts link also returns to the saved/last available step. A complete command advances M3's review cursor to the next step; a cursor beyond the Studio frontier opens the last available Step9 on return without writing or opening Step10. Final contract review caught and corrected a board-link implementation that previously jumped to the incoming session's cursor. Browser and native regressions exercise different saved cursors and unchanged ledgers across switches.

Renderer, motion, playback, selection, camera, hover, inspection, fullscreen and DPR cannot import the adapter or persistence. The isolation test allows exactly the adapter, keeps the existing scoped native Escape exception and forbids both React effect hooks. Browser/native ledger comparisons check that ordinary viewing, including play, scrub, selecting, dragging, ghost/explode/clip/isolate and reset, adds no event.

### Physical completion and undo

Mark physically done requires a nonempty owner statement, all earlier physical confirmations and the existing step verification rules. Existing procedure acknowledgments use accepted condition commands; completion uses `complete`, `actor=self_confirmed`. No optimistic successful state is shown: UI progress reloads only after committed acknowledgment. The exact pending command can be retried; conflicts reload authoritative state for fresh owner review. Undo uses accepted `invalidate(reason=undo)`, conservatively reopening the chosen step and its downstream confirmations. Photos remain historical observations.

The UI states that physical completion does not clear M7, CAD or a digital Review. S07/S09 may be physically completed after their physical prerequisites while remaining digitally BLOCKED/REFUSED.

## Private observations, revision provenance and export

No existing photo record satisfied the requirement, so the new closed `studio-observation.schema.json` defines `picar-studio-observation/1`. The existing generated AssemblySession contract is unchanged: `observationIds` references new observation actions in the same M3 event ledger. Database versions remain 1. Structural and graph/session/context binding checks apply in both browser and native adapters.

Records contain a generated observation ID, session/variant/printed step, UTC attachment timestamp, actual copied SHA256/type/byte length, relative generated storage key, exact pack ID, deterministic context-instance IDs, instructional and displayed artifact hashes, canonical placements hash and source/closure hashes. Context lists come from the viewed step, never image recognition. An old pack ID is displayed as “Taken against an earlier digital revision”; history does not depend on the current pack. Corrupt/missing actual bytes fail file read/export checks.

Native copies live beneath the accepted app-data root at `evidence/<sessionId>/<observationId>`; bounded IDs, symlink checks, exclusive creation, file/directory synchronization and read-back hashes protect the narrow workflow. Browser copies use the localhost origin-private file system at the equivalent key, serialized with Web Locks. Regular WebKit profiles support it; ephemeral/private WebKit may reject it before any observation commits. The UI then asks the owner to use a regular window or native Studio. This limitation was directly reproduced and is described by [WebKit's File System API documentation](https://webkit.org/blog/12257/the-file-system-access-api-with-origin-private-file-system/).

Each photo is limited to20 MiB and PNG/JPEG/WebP; the original filename and absolute source path are not recorded. No automatic camera capture, CV judgment or automatic physical verification exists. A failed copy removes its partial file and creates no event. A file copied before a failed record save remains a clearly documented private orphan: retain it while retrying the identical M3 command because its acknowledgment may have been lost. Uncommitted orphans never appear as successful observations and never overwrite another ID. The owner can resolve/remove them in private app data after pending commands are settled; automatic orphan deletion is outside this milestone.

ZIP export is selected-only, deterministic STORE entries with fixed timestamps/CRC32 and a canonical coherent metadata manifest. Read/hash/type checks precede export. Native uses NSSavePanel for the owner-selected destination. Browsers with a save picker use it; WebKit uses the browser's download/Save As controls and the UI states “download requested” instead of claiming a saved file. ZIP contains private photo evidence, explicitly stated before export. No export destination is recorded; no upload/share or repository destination is automatic. Exports are capped at 100 MiB.

## Native mode and validation

Native Studio 3 requires `VITE_M3_ENABLED=1`, feature `m3-persistence` and `tauri.m3.json`, as accepted M3 publication/persistence records require. Default legacy mode remains read-only for build-along. Actual automated validation uses the accepted incognito `tauri.m3-test.json`, debug-only `m3-native-test` feature, test bootstrap and a canonical disposable `picar-m3-native-*` data root. The owner's existing database is never opened. The existing native Escape command is also registered and granted in the scoped M3 configurations; its prior M3 permission omission prevented the native release bridge. Final physical native presses verify manual, selection, fullscreen dismissal ordering. Scoped commands copy/read evidence and show the export destination chooser; no broad filesystem plugin permission is added. Normal package/Vite/default capability/publication bindings stay unchanged.

The known aggregate PDF bookmark failure is a configuration mismatch: `preservation.spec.ts` expects the legacy `picarx.v1` key to change from2 to1, while accepted M3 intentionally retains that exact original raw value2 and writes the new durable Setup record instead. Its unchanged assertion remains RUN / FAIL — EXPLAINED under M3, and is tested in the proper legacy configuration separately. M3's own opt-in PDF test verifies page1 successfully. Persisted PDF controls additionally wait for pending saves/acknowledgments so a route save cannot reject a simultaneously offered page action; explicit source-page viewers remain local. No failing aggregate is promoted to PASS.

Required companion commands are `pnpm typecheck`, `PICAR_ALLOW_PACKAGE_BUILD=1 pnpm test:unit`, `PICAR_BROWSER_EVIDENCE_DIR=../docs/implementation/evidence/studio-3 pnpm test:browser --trace on`, and `npx playwright test -c playwright.legacy.config.ts`. Focused final checks use `PICAR_ALLOW_PACKAGE_BUILD=1 pnpm exec vitest run --config vitest.config.ts tests/studio tests/session tests/platform` and the same browser evidence override with `pnpm exec playwright test tests/browser/studio-build-along.spec.ts --trace on`. The evidence directory override preserves historical Studio 2 receipts. Root checks are `node digital-twin/tools/studio/studio.mjs check`, `node digital-twin/tools/studio/tray-audit.mjs`, and `node digital-twin/tools/studio/studio.mjs blender --check`. Native validation builds with `VITE_M3_ENABLED=1 VITE_M3_NATIVE_TEST=1 PICAR_ALLOW_PACKAGE_BUILD=1 pnpm tauri build --debug --bundles app --features m3-native-test --config src-tauri/tauri.m3-test.json`, then exercises `tests/native/wdio.studio3.conf.mjs` with disposable guarded data.

The final native binary was built after the viewed-step correction at 477c48d; its actual SHA256 and configuration hash are in `native-identity.json`. The later14eb222 commit changes only native test deadlines. A preceding manual UI attempt expired before export, and the next launch hit macOS's stale-window recovery dialog before the embedded driver connected. Both failures remain in separate receipts. Recovery used guarded disposable data and a clean exit, then a fresh native run passed all assertions in 2m13.9s. CUA operated the actual Save dialog and observed “Evidence export saved”; the test independently read and matched the selected ZIP bytes/manifest. Harness mock-store/sessionId cleanup warnings occur after the passed case and remain in the runtime log. Native tests do not open the owner's data root.

| Validation | Disposition | Evidence |
|---|---|---|
| Typecheck |PASS| typecheck-final.txt |
| Full unit |299 passed /26 files| unit-aggregate-final.txt |
| Focused Studio/session/observation |259 passed /22 files| unit-focused.txt |
| Native SQLite/unit |8 passed| rust-final.txt |
| Chromium/WebKit aggregate |RUN / FAIL — EXPLAINED:107 passed /2 PDF assertions /1 skipped /18.2m| browser-aggregate-final.txt / browser-final-disposition.json |
| Legacy browser |10 passed /10.4s, including both PDF assertions| browser-legacy.txt |
| Photo failure/retry repeated browser checks |10 passed /30.8s, five per engine| browser-photo-retry-repeated.txt |
| Pack check |PASS/FRESH/CURRENT| pack-check.json |
| Independent tray audit |HOLDS on both boards| tray-audit-studio3.json |
| Blender check |PASS| blender-check.txt |
| Fresh native debug M3 app |PASS, final shadow/control and viewed-step source| native-build.txt / native-identity.json |
| Native app journeys / selected ZIP |PASS /1 case /2m13.9s; actual CUA chooser; different saved cursors preserve viewed step and Parts0| native-progress.json / native-export.json / native-runtime-final.txt |
| Focused final board-session / photo browser checks |4 passed /36.2s, both engines| browser-session-switch-final.txt |
| Bounded native performance |60 fps, DPR 2, mean16.667ms/p9518ms| native-perf.json |
| Privacy / preservation |PASS; named staged paths,12 unchanged M2 files, protected M7/S2 sources and52 bound implementation files| privacy-audit.json / preservation-final.json |

Interrupted and failed exploratory results remain distinct from final acceptance. No failing aggregate is relabelled PASS. The old Chromium headless shell produced nine closed-page/transport/GPU failures; full Chromium new headless removed all nine on unchanged application source, leaving the explained PDF assertion. The test configuration now selects that supported engine. A later full run finished 106 passed/3 failed/1 skipped: two PDF assertions and a WebKit photo fault-injection timing race. The test previously restored its injected storage failure while the save was still pending, so the save could succeed and remove the retry button. It now awaits an enabled retry and the TEST_QUOTA error before restoring storage. Ten repeated photo checks pass across both engines; the final full rerun is recorded separately. No application code changed for this correction. Initial stale publication leases were inspected, proven dead and removed through the existing recovery command; readers are stopped before native package builds. Historical Studio 2 evidence is untouched, and the browser adapter evidence output is explicitly redirected to this milestone.

A subsequent aggregate finished 105 passed/4 failed/1 skipped: two PDF assertions and two WebKit initial navigation timeouts, before application assertions. Unchanged repeated cases and a temporary DOM-readiness experiment each passed 9/10; the experiment was reverted. Ten traced inspector repeats,20 HTML-only navigations,20 real Studio fresh contexts and20 dual-WebKit navigations passed, but did not establish a cause. The intermittent navigation timing remains an unconfirmed harness risk; those failures are not described as fixed. Another traced aggregate was intentionally interrupted to correct the viewed-step contract. Its temporary stdout was overwritten by the final run; `browser-interrupted-contract-review.json` records that limitation rather than reconstructing it. The corrected session/photo suite passed 4 cases across both engines before the final full traced aggregate.

The final full traced aggregate completed107 passed/2 failed/1 skipped in 18.2m, exit1. Both failures are precisely the explained legacy raw-key PDF assertions; every M3/Studio 3 and other Studio regression passed. The prior initial-navigation timeouts did not recur, but their cause remains unconfirmed. The final proper legacy run passed 10/10 in 10.4s. Its first startup attempt stopped before running tests because of two proven-dead publication reader leases; their existing recovery procedure cleared them before the successful run, and the failed startup receipt remains separate. Pack PASS/FRESH/CURRENT, tray HOLDS and Blender presentation validation were checked against the final source. No failed aggregate is reported as PASS.

## Performance and media

The final full-kit native sample is 1121x704 CSS, DPR 2,120 active frames,60 fps,mean/p95 16.667/18ms,579 draws,568576 triangles. Canvas/first render/first frame were410/411/448ms. No DPR reduction occurred. Compare the accepted Studio 2 whole-tray sample:1168x729 CSS,DPR2,120 active frames,60 fps,mean/p95 16.7/18ms,295 draws,249294 triangles. The increased content remains interactive in this bounded sample; disposal regression checks cover repeated board/route changes. This does not begin Studio 4 battery/release optimization or establish owner acceptance.

Native screenshots cover the owned app/webview only. Connector-readable JPEG proxies are separately bound to original path/hash/dimensions, proxy path/hash/dimensions and permitted visual claim in `media-manifest.json`. Synthetic photo metadata may appear in screenshots; no owner photos do. Media demonstrates presentation/state only, never physical fit or M7 closure acceptance.

## Retained Studio 2 and F1–F11 guards

The approved S2-01–S2-09 implementations and their historical evidence remain unchanged except the current runtime full-kit extensions. Existing regression tests continue to cover source/verification binding (F1), exact persistence boundary (F2), variant-safe selection (F3), display-check binding (F4), consistently rehashed semantic pack negatives (F5), presentation identity (F6), manual camera ownership (F7), one-press Escape ordering (F8), honest active/stall/idle/hidden instrumentation (F9), owned GPU disposal (F10), and displayed-versus-checked inspector identity (F11). The one adapter is the explicit F2 amendment for Studio 3. Final browser dispositions and native physical checks, rather than historical acceptance alone, determine their current test status. No fidelity predecessor or M7 acceptance report is changed.

## Protected gates, privacy and remaining boundary

M7 remains BLOCKED 0/58, both active boards0/29. S07 BLOCKED, S09 REFUSED, G-CAD BLOCKED, M8 NO. rpi4 remains PRESERVED_NON_TARGET. Protected CAD assemblies, instructional/M7 expected sources and M7 reports remain unchanged. There is no HAT remodeling or use of newly supplied private HAT media, no Studio 3.5, Studio 4 or M8 work.

Privacy verification scans named publication paths, text and media for actual credentials/private URLs/absolute photo paths, agent artifacts, owner bytes, database and ZIP leakage; the 12 M2 hashes are rechecked. Only generated synthetic image bytes are used. Five media original/proxy pairs are hash-bound and visually inspected. The untracked owner `AGENTS.md`,12 M2 files and Robot HAT folder are excluded. Final staging is by exact filename and rechecked before the closure commit. The independent review must retain the distinction between physical owner progress, instructional display readiness and engineering admission.

Remaining limits: private WebKit can refuse evidence storage; clearing browser site data removes its evidence; failed record saves may retain documented private orphans until the identical pending command is settled; native ZIPs require a new destination and refuse overwrite; a browser download request is not a confirmed save. Original temporary producer stdout and the interrupted pre-correction traced stdout are unavailable as documented, while actual final bound-artifact checks are retained. Previous intermittent navigation timeouts have no established cause despite the final traced pass of those cases. No blocker/high/P2 application correctness defect is known. Actual physical fit, owner acceptance and M7 acceptance remain unverified by this milestone.

## Independent GPT-6 Pro review prompt

Review only Studio 3 on `studio/s3-build-along`, against approved base `59e5ded78baccadf25b4b63bc2266d9210b4ee70`. Use the exact published closure SHA and local/remote equality from the execution response; verify remote branch HEAD before reviewing. Do not implement fixes, generate content, write owner sessions, merge, force-push or begin Studio 3.5/4/M8. Any tests must use disposable browser/native storage, synthetic images and the accepted M3 configuration. Never open the owner's database or private Robot HAT folder; preserve the 12 historical M2 untracked files.

Read this handoff, both current Assembly Studio design documents, accepted Studio 2/Pro remediation handoffs, M3 handoffs/publication plan and the complete base-to-candidate diff. Check pack `ad00bd0f4ad2904c3c1ca12d05b2990da5cb8e0e0076eb4e928372e08d202f41`, GLB SHA256 `2d626edd870e7276626a4e04fcaccae6db2b81607643b3835668cde9711234e8` and presentation `6290433110f76a0724a1b05ba4b004b04bb103a7f45a5d621c5be72734fffc9e`; require PASS/FRESH/CURRENT and valid Blender source collection. Check the media manifest and fetch the connector-readable JPEGs; inability to inspect critical pixels is UNKNOWN, not PASS.

Independently derive all variant-filtered canonical stock and all 29 planned uses. Require156 exact slots on each board,143 solids/13 tiles, through-S09 counts50/47 including 3 tools, later69/72, spares37. Check A–H exactly once per active board, truthful existing M6/M7 representation, later B–G state, stable hardware IDs, tile fallback, full camera visibility, close group inspectability, material/geometry disposal and both-direction variant safety. Missing/extra/wrong-role/definition/variant/state/group/count or invented future placement is fatal. Confirm source geometry, S01–S09 poses, recipes, review candidates, display checks and M7 readiness remain unchanged.

Audit the one narrow adapter and exact isolation allowlist. Prove ordinary play/scrub/selection/camera/tray orbit/inspection/fullscreen/DPR creates no event. Check explicit session creation, intentional bookmarks, separate board cursors/progress, committed-ack-only physical success, prerequisite/condition rules, exact retry, conflict reload and accepted conservative undo. Board switches must retain the viewed step, including Parts0, while preserving different saved cursors without a write. Explicit resume routes and saved-step links restore the board bookmark. Inspect physical completion of S07/S09 without a digital gate promotion. Investigate the former PDF bookmark failure rather than inheriting or relabelling it.

Audit observation schema/replay/file operations and ZIP export. Use only generated synthetic bytes. Verify actual private copied hashes, collision/symlink/path/size/type boundaries, deterministic context and geometry/pose/closure provenance, failed-copy atomicity, failed-save recoverable orphan strategy, lost-ack retry, reload and earlier-revision treatment. Check selected ZIP entries/manifest/hashes against stored bytes, exclusion of unselected evidence, owner-selected/disposable destinations and absence of destination/source private paths. Distinguish regular WebKit support from private-context refusal and browser download requests from confirmed saves. Native must use real M3 SQLite and disposable incognito data, not legacy persistence.

Inspect current code and final test receipts, actual native app pixels, native export chooser and full-tray bounded performance against Studio 2. Separate initial failed/interrupted runs, focused fixes, final aggregate results, skipped/unknown checks and owner acceptance. Reconfirm S2-01–S2-09 and F1–F11 regressions, M7 BLOCKED0/58, S07 BLOCKED, S09 REFUSED, G-CAD BLOCKED, M8 NO, rpi4 PRESERVED_NON_TARGET, privacy exclusions and unchanged historical evidence.

Return a prioritized findings table with severity, exact file/line/evidence, concrete failure scenario and minimal correction. State each required area PASS/FAIL/UNKNOWN, remaining risks and whether Studio 3 is READY FOR INDEPENDENT REVIEW / ACCEPTED for its authorized scope. Do not infer physical fit or clear any engineering gate from presentation, source test success or self-confirmed owner progress. Stop after this review.
