# Final Pro findings follow-up — current closeout

The immediately preceding review at b6dd6a7e04dff6a41e5766b0a6b95e577eb07de9 found remaining nested-contract, canonical-audit, fullscreen-lifetime, wording and evidence defects. The focused source fixes and rebuilt native proof supersede those claims. The earlier sections below remain historical except their erroneous capture01 acceptance, which is explicitly corrected everywhere.

Current evidence: [follow-up verification notes](evidence/studio-2-pro-remediation/pro-followup-final/verification-notes.md), [native sanity](evidence/studio-2-pro-remediation/pro-followup-final/native-sanity-summary.json), [connector review](evidence/studio-2-pro-remediation/connector-review/README.md), [image mappings](evidence/studio-2-pro-remediation/connector-review/connector-review-manifest.json), [binary/media audit](evidence/studio-2-pro-remediation/connector-review/binary-media-review-manifest.json), [Blender audit](evidence/studio-2-pro-remediation/connector-review/blender-audit.json), [GLB audit](evidence/studio-2-pro-remediation/connector-review/glb-audit.json).

Current final native source HEAD b31bcfc7e89bbfb55a46bea6dc579267bf63ca57; binary af2f282f3b22741ae27e5abed1b447d3e2404bd5a02287fbf7aaad4c14e3dab7. Pack/presentation/GLB unchanged and PASS/FRESH/CURRENT. No CAD/presentation-bound source change.

| Finding | Final status | New closure evidence |
|---|---|---|
| S2-01 | CLOSED | Central nested semantic validation; consistently rehashed negatives |
| S2-02 | CLOSED | Canonical identity/variant/tool/all inventory-field reconciliation; real50=44+6 and47=41+6 |
| S2-03 | CLOSED | Supported camera ownership separation preserved; affected native sanity passes |
| S2-04 | CLOSED | Supported continuous explosion preserved |
| S2-05 | CLOSED | Supported manual recovery preserved |
| S2-06 | CLOSED | New authoritative ZeroS00; old01 rejected unchanged; unaffected S01–S09 retained; fresh pan/fullscreen/resume |
| S2-07 | CLOSED | Lifetime-bound queued fullscreen/capture; exact deferredA/B/unsubscribe/remount/late settlement tests; physicalEscape and Studioexit |
| S2-08 | CLOSED | Supported additive4/4 correction preserved |
| S2-09 | CLOSED | Supported immutable predecessor regeneration preserved |

| Finding | Final status | Evidence/disposition |
|---|---|---|
| F1 | CLOSED |27 exact generated snapshots; tracked-only isolatedPASS/FRESH/CURRENT;24 exact-byte buffer transport parts |
| F2 | CLOSED | Persistence isolation retained; source boundary check remains narrow |
| F3 | CLOSED | Variant selection preserved, browser and native both-direction switch |
| F4 | CLOSED | Exact display/closure binding preserved; nested fields additionally checked |
| F5 | CLOSED | Nested exploit rejected centrally before consumer; fullunit286passes |
| F6 | CLOSED | Receipt unchanged, Blenderopen/check, structuredaudit and boundJPEG53 |
| F7 | CLOSED | Original nativepan preserved byte-for-byte; rebuilt32.5567mm pan, targetdrift1.58745e-9m<1e-6m, guided resume |
| F8 | CLOSED | Exact pendingA/queuedB/last unsubscribe race closes with capturefalse/listenerszero; remount independent |
| F9 | CLOSED | Prior bounded native120frame performance evidence preserved; no timing rewrite or benchmark claim |
| F10 | CLOSED | Supported resourceownership retained; fullbrowser Studioresource tests pass |
| F11 | CLOSED | Actual screw/standoff/generic identity nouns; volumes and roundings unchanged |

Validation: typecheckPASS; focused4files/66passes; fullunit24files/286passes; focusedbrowser13passes/1skip; fullbrowser101passes/2failures/1skip, FAIL—EXPLAINED (sameM3PDFbookmark expected1received2 at preservation.spec.ts42); packPASS/FRESH/CURRENT; Blender--checkPASS; trayHOLDS; freshM3disabled/incognito nativebuildPASS. Native capture-release is observed via OS Escape after Studioexit, with deterministic captureboolean/listener assertions; the native boolean is not directly queried. Exact race timing is not artificially forced natively.

All53 full-viewport JPEGproxies are ≤211702bytes and bind exact original/proxy SHAs, dimensions, scaling and allowed claims. All53 were actually retrieved, decoded and hash-verified through the connector at073523; the final transport follow-up ref is rechecked after push.26of27 generated snapshots were retrieved; the remaining exact tessellation buffer now has24 base64 JSON parts≤197008bytes with local exact-byte roundtripPASS. Connector receipt and restoration instructions disclose the original empty-content/UTF-8 transport errors. No claim that transport-limited .blend/GLB was independently downloaded by Pro. Structured245-path local audit is published; all191images reviewed with method/limits disclosed. This final transport-only addition changes no source, native bundle, CAD, pack or presentation identity.

READY FOR STUDIO 3

This readiness applies to the bounded Studio2 application remediation. M7 remains BLOCKED0/58, S07BLOCKED, S09REFUSED, G-CADBLOCKED, M8NO. Physical fit and owner visual acceptance remain separate. Studio3/3.5/4 andM8 are unstarted. FutureStudio3.5 is High-Fidelity Robot HAT afterStudio3/beforeStudio4 using owner scan/caliper evidence.

The new immutable-SHA Pro prompt is delivered after the normal branch push; its scope is ONLY b6dd6a7e04dff6a41e5766b0a6b95e577eb07de9..new final remote HEAD. The original re-review prompt below is historical and superseded.

---

# Studio 2 Pro remediation

This is the bounded closeout of the independent Studio 2 Pro review. Studio 3 and M8 are not implemented. All old Studio 2 commits and evidence remain; the new evidence directory is `docs/implementation/evidence/studio-2-pro-remediation/`.

## Preflight and source identity

Verified source branch `studio/s2-all-steps`, HEAD `891dba9dba06592296fa06a74e400451743db13e`, Studio 2 base `a26592259dcd6ef09fa791086148092653b1750e` and the five reviewed commits. Created `studio/s2-pro-full-remediation` from that HEAD. Twelve existing untracked M2 evidence files were preserved and excluded from staging. The repository concurrency convention found the existing Claude session idle after its completed turn; no other session was writing this checkout. No process arguments or session artifacts are retained. The attached 555-line Pro review and full remediation request were read, along with all seven required repository documents.

Baseline: integrity PASS, freshness FRESH, presentation CURRENT. Old pack `466de8923467aca572814e543467268e420d5a668cd035ee92a5fbe64a8a9130`; old presentation `48f88ae36d1248dd006a63132fe19777b704071edf14fd18681f3080210432d9`. Baseline evidence: `00-baseline-{check.json,status.txt,log.txt}`. The status snapshot was taken after creating the new evidence directory.

## Finding implementation and invariants

| Finding | Status | Implementation (repository-relative files) | Tests / evidence | Residual risk |
|---|---|---|---|---|
| S2-01 | CLOSED | `picarx-companion/src/features/assembly-3d/assets/pack-contract.ts`, `assets/pack.ts`; `digital-twin/tools/studio/studio.mjs` emit/validate used, tool and explicit workpiece identity. Exact variant census, partition, counts, first use, derived parts, placement differences, prior poses, recipe staging/coverage, readiness/review reason and dependency metadata are checked before consumption. | `tests/studio/pack-contract.test.ts`: 27 cases, with all semantic mutations rehashed. Byte/hash/GLB guards retained. `26-contract-final-attempt2.txt`: 111 focused passes. | A manifest validates its declared semantics; independent source audit supplies the cross-source check. |
| S2-02 | CLOSED | `digital-twin/tools/studio/tray-audit.mjs` makes any graph/planned-use/stock/tool/pack disagreement fatal, with explicit classes. Per-step pack scope is independently compared with the graph. | `picarx-companion/tests/studio/tray-audit.test.ts`; retained `02-audit-negative.txt` and drift JSON: existing Pi5 M1.5 screw use moved S13 -> S08, stale graph/pack, exit3/FAILS. Current audit HOLDS: Pi5 50=44+6; Zero47=41+6. | Static smallest dimensions 4.4–5.3px remain visual advisories. |
| S2-03 | CLOSED | `scene/StudioScene.tsx`: store notifications invalidate only. User controls changes yield ownership and cancel tween; programmatic frame updates are distinguished explicitly. | `tests/browser/studio.spec.ts`: stationary selectable holds across active S02/S04 playback frames, then real drag. Existing resize/DPR/fullscreen target guards. | Native observation supplements both browser engines. |
| S2-04 | CLOSED | `motion/evaluate.ts`, `motion/inspect.ts`: recipe-free workpiece terminal bring-in progress weights explosion continuously. No M7 recipe is invented. | `tests/studio/inspect.test.ts`: both variants, forward/reverse/replay at boundary±1e-5s, composed tolerance1e-9m, off returns exact source. Only one recipe-free track per variant exists. | Presentation interpolation only; source endpoints unchanged. |
| S2-05 | CLOSED | `src/lib/v40-pdf.ts` evicts failing attempt, SHA-verifies each successful fetch. `ui/ManualPanel.tsx` explicit Retry, replacement-owned local state and cancellation, genuine render errors surface. | `tests/studio/manual-recovery.test.ts`: fetch/decode retry, hash verification and wrong bytes. Browser controlled fetch failure -> wrong bytes -> real PDF; controlled render failure -> pending Retry -> replacement cancellation/success. | Native network fault injection not required if impractical; controlled browser tests carry recovery proof. |
| S2-06 | CLOSED | Corrected final native Zero S00 uses fresh final-source01/02; valid priorS01–S09 and Pi5 representatives retain their original bundle identity. Actual unmodified right-button pan yields manual ownership, preserves target through resize/fullscreen/redraw/DPR, then Resume guided view restores the guided target. | `continuation-final/final-native-matrix.json`, `native-pan-summary.json`, numeric phase files and captures53–60; existing native interactions/performance retained. | Bounded instructional app verification; human visual acceptance and physical fit remain separate. Failed Shift-drag25–27 stays rejected as pan proof. |
| S2-07 | CLOSED | `state/studio-store.ts` and `src/pages/Studio.tsx`: tray root commit clears manualOpen before a delayed 3D frame; enterStep preserves the invariant. Native release bridge enforces physical dismissal order. | `tests/studio/selection.test.ts`, browser enlarged manual -> tray -> Escape -> return. Existing one-press/fullscreen guards. | Numbered current states all have a verified manual mapping. |
| S2-08 | CLOSED | New `digital-twin/assemblies/v40/presentation/instructional/step08-review-05.json`; current review pointers in `cad/twin_cad/assemblies/instructional/step08{,_verify}.py`. Historical review04 retained. | Fresh chain `s2pro-01`; generated S08/S09 current limitations; fidelity/pack source guards. | Historical4/3 -> current photo-supported4/4; trace1.4mm vs photo~1.69mm unresolved; no engineering tolerance verification. |
| S2-09 | CLOSED | `digital-twin/cad/twin_cad/fidelity/plate_a.py` rebuilds immutable outline01 batch/spec and verifies its historical SHA before comparison. | `cad/tests/test_studio_fidelity.py`: store selects holes03, correct old7/new8 and old hash/volume/candidate hash; wrong predecessor SHA fails. CLI numeric regeneration `09-regenerated-review.json`. | Rebuild identity is deliberately strict against toolchain/parameter drift. |

## Generated identities

Initial chain/tessellation `s2pro-01`, distinct from retained `s2-01`. All 22 chain commands exit0; new pack producer reports 347 checks, 21 definitions and49 modeled instance identities across variants. Intermediate pack `abefb75fea062a259fada4fe902200ab7183fa3c61be068a08b32e18d3f3f374`; presentation `08a6a506612f65d72fd2a18f61626e5ebe8da1e1b50a97a5fb551ac5717d97d6`. GLB changed NO: 1,707,308 bytes, SHA `ca680e34b2ef3cd63472848c66e8523fd2c6dbe3dae2be23944bc6ea0b197757`, identical to reviewed Studio2. Pi5 display BRep identical. Bound source review content, display closure hashes and manifest source fields force the new identity and refreshed Blender scene/receipt/render; presentation-owned materials/camera/lights are kept. Intermediate `12-final-check.json` reports integrity PASS, freshness FRESH, presentation CURRENT; Blender check passes.

## Directly related cleanup

Historical handoff now identifies the Pro follow-up and corrects its observations without replacing old evidence. S03/S06 are Still Preview, zero duration, disabled transport. Battery is introduced in S06; S07 Review has no timeline; S08 cumulative state has its pose. Census15–18 values are occupied pixel areas, not widths; static4.4–5.3px dimensions are retained. Hardware chip ordinals derive from physical instance IDs across split rows. Combined ghost+explode, ghost+clip, explode+clip, selection and exact reset have focused tests. Clipped hidden solid and invisible pick-box intersections now follow the same world-space clip planes as rendering, with the tray guard preserved (`scene/resources.ts`, `tests/studio/resources.test.ts`).

The M7 handoff's old moved-wall/deck test attribution was inaccurate. Four explicit mutation guards now pass (`25-m7-negative-controls.txt`); the old log is retained and its attribution corrected. Current design documents describe only these changed contracts/behaviors. No private source pixels were copied into numeric regeneration. Ordinary app captures may contain the runtime manual panel; no separate enlarged/source-copy manual capture is added.

## Validation and execution attempts

Initial focused37 tests pass. Initial full unit249 tests pass; one further malformed consumer negative was then added. That negative exposed an unchecked in-operator and drove an actual validator repair; both failure log and corrected111-test run are retained. Earlier implementation failures and the tiny imported/rebuilt volume representation difference are documented candidly in `implementation-notes.md`. Final commands and native dispositions are appended below.

Source-mode M7 command from repository root:

```sh
PICAR_M7_ROOT="$PWD" PICAR_M7_SOLUTIONS="$PWD/digital-twin/generated/studio/chain/s2pro-01/solutions" PICAR_M7_REMEDIATION="$PWD/digital-twin/generated/studio/chain/s2pro-01/remediation" PICAR_M7_SOURCE_ROOT="$PWD" PYTHONPATH=digital-twin/cad /tmp/picar-s2-pro-remediation-env/bin/python -m pytest digital-twin/cad/tests/test_m7_*.py digital-twin/cad/tests/test_toolchain.py digital-twin/cad/tests/test_studio_fidelity.py -q -p no:cacheprovider
```

RUN / FAIL — EXPLAINED:983 passed,137 skipped,12 failed,593.85s. All12 failures require the oracle to live in site-packages; this frozen environment deliberately runs authored CAD in source mode with no twin-cad install. They remain failures, not aggregate PASS. The additional four moved-wall/deck controls were collected separately after the aggregate began:4 passed,18 deselected. Current frozen CPython3.12.14/CadQuery2.8.0. S07 blocked and S09 refused records remain; closure generator/verifier are unchanged.

## Boundary and next review

G-INSTRUCTIONAL-ASSEMBLY BLOCKED 0/58; rpi5 and Zero 0/29 each. S07 BLOCKED on UNFRAMED_TOUCHED_CABLE_END/PX-V40-CONN-07-COMMON-BATTERY. S09 REFUSED with unchanged101.071,51.250,12.955,2.026mm³ conflicts; prepared candidate not adopted. G-CAD BLOCKED/unchanged; M8 authorization NO. No persistence/photo/evidence-export workflow or renderer redesign was added. No history rewrite. The original pre-closeout checkpoint had not been pushed.

The complete bounded read-only re-review request is [STUDIO_2_PRO_RE_REVIEW_PROMPT.md](STUDIO_2_PRO_RE_REVIEW_PROMPT.md). Completion status, final F1–F11 table, exact commands/counts, native evidence and commit inventory follow below.

## Owner steering and final identity

The owner additionally approved a display-only HAT outline correction while keeping checked geometry and placements unchanged. `fidelity/hat.py` and `hat-outline-display-review-01.json` extend the adopted PCB envelope from65x56 to an explicitly approximate85x56mm at its overhanging end. Four adopted bores, socket and all ten schematic top components remain. Four 3mm corner arcs are explicitly authored approximations, not measured stock. The checked M5 HAT SHA remains `bbdbbeb758d724c52450902c427c872b6eb78eff59a89b698d76a54d86d8461a`; no M7 artifact registry/adoption changes. `hat-preserved-transforms.json` proves all18 step placement/recipe maps match the reviewed Studio2 pack, with Zero HAT already180degrees from Pi5. Top-component layout remains schematic. New overlap checks bind both variants S04–S08 and mark refused S09 NOT_CHECKED; they compare other instructional artifacts, not detailed-display pairs. Source bindings enter producer validation and pack freshness.

Final tessellation `s2pro-hat-03` uses unchanged chain `s2pro-01`. Final pack `5968a9827b1b02f3707c56f0032b933071491ee0249466d9708aac7b812cc352`,349 producer checks,21 definitions,49 modelled identities; GLB changed YES,1,760,172 bytes, SHA `4bb923c6cfccad5a528019eb4ac8d91112ff2b7542269e3c6cb48d039b275f42`. Display HAT SHA `f8fb85863e604924f0d003a5dad3d737f682ee05483897679f659fa8d8bdf9b4`. Final presentation `0bf8a3bdb80abec85512183cfe35648807dd3b30e82d29a81f1f89c6512b9e0b`. `75-final-check.json`:PASS/FRESH/CURRENT; `76-final-blender-check.txt`:zero problems. Presentation-owned state preserved and final render visually inspected. The earlier pack/check/render and app captures remain historical intermediate evidence.

The first dot spacing attempt introduced extra bottom padding and the owner rejected it. Final `studio.css` restores original28px button height and centered labels with a small lavender corner flag for Review steps7/9. No new notification workflow.

## Native Escape follow-up

Native inspection discovered AppKit exiting fullscreen shortly after an Escape cleared a selection. An intermediate keydown-only local monitor prevented that exit but failed after an enlarged manual navigation removed its focused DOM button: WebKit never delivered the release. Failed AX probes and captures18/20 remain. The final macOS local monitor captures only Escape keydown/up for the active Studio main window while truly fullscreen, drops repeats and emits exactly one window-scoped release. `state/escape.ts` and `pages/Studio.tsx` use that release for the same dismissal order. `state/fullscreen.ts` serializes listener/capture lifecycle and awaits capture before fullscreen; Studio exit disables capture, app exit removes the monitor. Capture has no database/filesystem path. The narrow isolation-test exception permits only the literal studio_escape_capture call. Native records21/22 prove manual -> keyboard tray -> selection-clearing Escape while fullscreen remains, then return without overlay and next press exits. The final native matrix dispositions are recorded below; route and rendered-scene proof remain distinct.

The rectangular HAT intermediate pack `932fbab931c205e448519b1d68d693655549a8ba86e235f33c7803ee7ee16edf` and its receipt/render remain separate intermediate evidence, archived as `intermediate-manifest-932fbab931c2.json`. Changing the HAT source and review before regeneration produced the expected INPUT_CHANGED freshness failure (`64-hat-source-stale-negative.json`, exit3); final regeneration restored FRESH.

## Final regression status

| Regression | Status | Current guard/evidence |
|---|---|---|
| F1 source/verification binding | CLOSED | exact source/closure/artifact/mesh bindings, source tests; finalPASS/FRESH |
| F2 persistence boundary | CLOSED | isolation whitelist retains all persistence prohibitions; disposable M3/legacy browser checks |
| F3 variant-safe selection | CLOSED | incoming membership, common tiles, repeated every-step board switches |
| F4 display-check binding | CLOSED | Pi5 and HAT exact artifact/closure checks; refused S09 NOT_CHECKED |
| F5 runtime contract | CLOSED |27 consistently-rehashed semantic-negative cases, unchanged byte/GLB guards |
| F6 presentation identity | CLOSED | producer349 checks; fresh receipt, final Blender check, viewed render |
| F7 camera lifecycle | CLOSED | Re-confirmed on the exact final native bundle: real right-button pan translates the target, manual ownership persists across resize/fullscreen/redraw/DPR within1e-6m, and explicit Resume guided view restores it. Active S02/S04 stationary selection and browser lifecycle guards remain valid. |
| F8 Escape/fullscreen | CLOSED | physical-press unit/browser checks, serialized platform state, native window-scoped release and modal-navigation proof |
| F9 performance semantics | CLOSED | active/stall/idle/hidden guards pass; continuation native S02 replay, S04 ghost+explode and whole-tray orbit each record120 active frames at60fps/DPR2. See `continuation-final/performance-samples.json`. |
| F10 resource ownership | CLOSED | materials/pick targets/shadows disposal, repeated board-switch and Studio-visit browser checks |
| F11 inspector truthfulness | CLOSED | displayed/checked identities, matched subset, candidate/unchecked states and corrected limitations |

Final unit command with package authorization:23 files,253 passed,15.21s (`52-unit-final-attempt2.txt`). Final typecheck passes (`49-typecheck-final.txt`). Fidelity after HAT extension:25 passed,9.12s (`46-fidelity-with-hat.txt`). Native backend persistence-feature compilation passes (`58-rust-m3-compile.txt`), without launching or opening a database. The full Studio final-HAT attempt had70 passes,1 failure,1 skip:WebKit S04 picked Pi5 instead of PlateA at a point selected in the earlier final-pose view. An interior point selected after replay with eight-pixel neighbouring-body clearance preserves the original assertions; all4 focused Chromium/WebKit S02/S04 checks pass,19.3s. The final complete browser aggregate follows.

## Historical implementation validation (before continuation)

| Command (companion cwd unless specified) | Result | Evidence / count |
|---|---|---|
| PICAR_ALLOW_PACKAGE_BUILD=1 pnpm test:unit | RUN / PASS |78:23 files,253 passed,13.73s |
| pnpm typecheck | RUN / PASS |77:both TypeScript projects exit0 |
| pnpm test:browser | RUN / FAIL — EXPLAINED |74:101 passed,2 failed,1 skipped,16.4m. Both failures are existing preservation.spec.ts PDF bookmark expected1/received2 under M3. All71 Studio passes;1 Studio skip. |
| pnpm test:browser tests/browser/studio.spec.ts -g 'manual open to tray\|manual fetch failure' | RUN / PASS |82:4 passed,12.6s on final source; withheld 3D-frame gap and staged fetch faults pass in both engines. |
| npx playwright test -c playwright.legacy.config.ts | RUN / PASS |84:10 passed,12.2s; same bookmark behavior passes in the legacy configuration. |
| PYTHONPATH=digital-twin/cad /tmp/picar-s2-pro-remediation-env/bin/python -m pytest digital-twin/cad/tests/test_studio_fidelity.py -q -p no:cacheprovider (root cwd) | RUN / PASS |66:25 passed,8.53s |
| cargo check --features m3-persistence (src-tauri cwd) | RUN / PASS |58:compile only, no database opened |
| VITE_M3_ENABLED=0 PICAR_ALLOW_PACKAGE_BUILD=1 pnpm tauri build --debug --bundles app --config /tmp/s2pro-native-incognito.json | RUN / PASS |80:final debug native bundle, M3 disabled and temporary incognito WebView; saved nonsecret config. |
| node digital-twin/tools/studio/studio.mjs check (root cwd) | RUN / PASS |75/81:integrity PASS, freshness FRESH, presentation CURRENT |
| node digital-twin/tools/studio/studio.mjs blender --check (root cwd) | RUN / PASS |76:zero problems |
| git diff --cached --check (root cwd, evidence checkpoint) | RUN / FAIL — EXPLAINED |exit2:retained terminal/AX logs contain trailing spaces and blank EOF lines; authored paths pass with evidence excluded |

The full browser run began with the final rounded pack; the tray-commit fix landed during its M3 checks. The explicitly repeated focused command82 runs the frozen final source and the strengthened withheld-frame regression in both engines. The old62 aggregate's extra fetch-fault setup failure is repaired, with its failed log retained.

## Historical native72 / final80 dispositions

Native72 captured a complete Zero S00–S09 matrix23–36 on the final rounded pack, with working scenes, board/manual mappings, selection and transport. Final bundle80 additionally proves physical visible-modal dismissal and manual -> keyboard tray -> first Escape on both boards:captures37–39 and50/51, with AX-only modal records. No enlarged manual capture is saved. The final80 matrix40–49 has complete AX route/mapping/selection/control coverage, but rendered scenes stop advancing after S03 in44–49. Those captures are PARTIAL_RENDER_STALE, not accepted as full native proof. Combined native52–54 is likewise partial. Coordinate/scroll automation returned noWindowsAvailable; requesting a visible foreground window distinguishes a background-window limitation from a candidate defect. Bounded native performance and native mouse manipulation remain pending that prerequisite. Browser manipulation and combined inspection pass.

All final80 captures37–54 were visually reviewed; the stale-scene limitation was found during that media inspection and retained. S2-06 is PARTIALLY CLOSED until final rendered native coverage is verified. No READY claim while this remains unresolved.

Reconnecting the computer-use session did not restore coordinate input: a fresh native screenshot still showed the S03 scene on the S04 route, and the following physical click returned noWindowsAvailable. The owner foreground request remains pending. This is a concrete verification prerequisite; its cause is not established as either an app defect or a background-window limitation.

## Previous candidate privacy inventory (before continuation)

`privacy-final.json` scans the complete candidate against the Studio2 base:349 files (271 text and78 binary/media), with302 files in the remediation delta. The scan classifies every text hit before any redaction:206 functional local paths/provenance and two functional development/test URLs are retained; credential-shaped values and credential assignments have zero hits. No redaction or history rewrite was performed. Twelve unrelated untracked M2 files are excluded. All new app media were visually reviewed, including the failed/stale records; the final Blender render was also inspected. Ordinary runtime manual pixels are permitted application evidence; no separate enlarged/source-copy manual or private photo bytes are added. Image metadata inspection found width/height, color profile and digest metadata, without identity/GPS fields; this is a scoped artifact review, not a claim that arbitrary binary credential scanning is exhaustive.

## Remediation commit inventory

A. 95b0042671fabee3b58d1a9c2f781c7e0f2b5449 — M7 fidelity checkpoint: current hole review and display-only HAT outline
B. e17cfbba334248739cfb012d0fff13dea90ac941 — Studio: enforce semantic pack contracts and canonical tray audit
C. 90ca7ba697c44b7833ccd5e5abb1973922349896 — Studio: recover locked manual loading and surface render failures
D. d885e5553e14e12fcb0292d7f437de080dc0c445 — Studio: repair camera, explosion, clipping and native Escape order

E. 386813212c82029b6571fdf52d7ab03e8f50a170 — docs: record Studio 2 remediation and pending native verification

F. The final documentation/evidence closeout is named `docs: close Studio 2 native verification`. Resolve its full SHA from the published branch tip; the verified remote SHA and complete immutable Pro invocation are supplied after the normal branch push. A commit cannot embed its own SHA in its tracked content. Explicit named paths only, existing Git identity, no attribution trailers, amendment or history rewrite.

## Historical checkpoint closeout state

S2-01,02,03,04,05,07,08,09 are CLOSED by the implementation and recorded guards. S2-06 remains PARTIALLY CLOSED: final80 rendered S04–S09, native mouse manipulation and the bounded native performance sample require a visible foreground window. The owner input request is pending; no inference of PASS from expired time or prior-pack evidence.

NOT READY FOR STUDIO 3

No Studio3/M8 work is started. The implementation checkpoints are complete and locally reviewable. The remaining action is to verify the final native app with its window visible and resolve any real defect discovered, then record performance, update this disposition, and run the bounded Pro re-review.

## Final native continuation checkpoint

The continuation starts at the verified branch studio/s2-pro-full-remediation and HEAD386813212c82029b6571fdf52d7ab03e8f50a170. No application/CAD/pack/Blender source change was required. New evidence is additive under [continuation-final](evidence/studio-2-pro-remediation/continuation-final/). The earlier owner-foreground request is superseded by successful unattended activation/relaunch recovery; historical native72/final80 captures remain unchanged and are not promoted to current proof.

The exact fresh debug bundle is picarx-companion/src-tauri/target/debug/bundle/macos/picarx-companion.app, binary SHA256 d55094529722b7f852558cc6b952c14589d6e2add2647888191e409fb0fa3707. It was built with VITE_M3_ENABLED=0, PICAR_ALLOW_PACKAGE_BUILD=1, default Rust features and fresh temporary incognito config. No owner database was opened. Source HEAD, full pack/presentation/GLB identities and build result are bound in bundle-identity.json. Pack remains5968a9827b1b02f3707c56f0032b933071491ee0249466d9708aac7b812cc352; GLB4bb923c6cfccad5a528019eb4ac8d91112ff2b7542269e3c6cb48d039b275f42; presentation0bf8a3bdb80abec85512183cfe35648807dd3b30e82d29a81f1f89c6512b9e0b. Final check is PASS/FRESH/CURRENT.

The old process had its owned CoreGraphics window onscreen but was not frontmost; System Events reported zero windows. Activation restored live S04 geometry/manual and coordinate access. Only the stale test PID was terminated. A fresh build initially failed on two dead content-reader leases; the existing recovery command identified dead owners and recovered those leases before the successful build. AppKit fullscreen Space enumeration and one transient screenshot failure were recorded separately from app behavior. The final foreground app advances every required rendered step; no stale-S03 defect reproduced. Recovery details and setup errors remain in preflight.json and verification-notes.md.

### Accepted final native matrix

Each row is a separate owned-window visual observation with actual route, board, mode, manual, selected/inspectable object and transport in final-native-matrix.json. AX-only routes are insufficient and were not counted. All Zero routes are /studio/rpi-zero-2-w/N.

| Zero step | Mode | Manual | Selected/inspectable | Playback / rendered proof | Result |
|---|---|---|---|---|---|
| S00 | Parts tray | None | Wrench tile | Disabled;47=41 modeled+6 tiles;fresh pro-followup-final01/02; old01 rejected,48 limited corroboration | PASS |
| S01 | Preview | Zero, page1 | Plate A | Moving36 -> seated37,4.0s | PASS |
| S02 | Preview | Zero, page1 | Zero board | Moving04 -> seated05,2.8s | PASS |
| S03 | Still Preview | Zero, page1 | FPC tile | Disabled0.0s; correct cumulative board,06 | PASS |
| S04 | Preview | Zero, page1 | Robot HAT | Moving07 -> clear final49,3.2s | PASS |
| S05 | Preview | Shared, page1 | Left TT motor | Moving09 -> cumulative motors10,5.0s | PASS |
| S06 | Still Preview | Shared, page2 | Modeled battery | Disabled0.0s; two tape tiles and battery in tray,11/50 | PASS |
| S07 | Review | Shared, page2 | Battery | No ordinary playback; current review pose/blocker,12/13 | PASS |
| S08 | Preview | Shared, page2 | Pan horn | Moving14 -> seated15,3.2s; visible correction51 | PASS |
| S09 | Review | Shared, page2 | Ultrasonic module / conflict pair | No ordinary playback; refused candidate17, focused pair18 | PASS |

S07 names PX-V40-CONN-07-COMMON-BATTERY and explains the missing cable-end frame; the current pack retains exact UNFRAMED_TOUCHED_CABLE_END. S08 visibly warns that preview does not certify S07. Capture51 shows historical four/three versus current four/four and unresolved1.4/~1.69mm diameter. S09's four refused source values remain101.071/51.250/12.955/2.026mm3 to three decimals; the visible UI rounds to101.1/51.2/13.0/2.0. This verifies the same four pairs, without claiming three-decimal display precision.

Representative Pi5 routes /studio/rpi5/N: S00 50=44+6, inspectable wrench47; S02 board/manual/3.4s endpoint22 and stationary click23; S04 current HAT/manual/selection21/31 and visible isolation52; S08 horn/manual/dependency20; S09 board switch/refused candidate/manual19. All five PASS; no redundant full Pi5 matrix rerun.

### Native interactions and final pan verification

Physical stationary click23 during active S02 Replay selects Plate A and keeps guided ownership; actual left drag24 yields manual. Board-specific selection clears on switch29. Common HAT selection/highlight/focus stays valid30/31, and common wrench works in both trays47/48. Ghost+explode32 visibly separates the stack. Deck clip33 fully hides HAT above the deck plane; isolate+clip34 correctly leaves an empty canvas. Isolation alone52 shows the selected HAT; reset35 restores canonical presentation. Raw mistaken setup notes are preserved with corrected dispositions in native-records.json; captures08,25-27 are not accepted as pan/clear-S04 proof.

The earlier Shift-drag25 rotated, so25–27 retain their rejected pan dispositions. The owner subsequently explicitly authorized bounded native right-button input. Source and live runtime use the default OrbitControls mapping: LEFT=ROTATE0, MIDDLE=DOLLY1, RIGHT=PAN2, with no override; screenSpacePanning=true. Shift/Control/Meta on right-button input changes the action, so the accepted gesture has all modifier flags clear.

On Pi5 S04 Preview, after the guided view settled, a disposable Swift helper used system CoreGraphics CGEvent.post(tap: .cghidEventTap) for right down,12 right-drag moves and right up, CSS(400,320) -> (520,380), logical screen(423,356) -> (543,416). It was guarded to foreground PiCar PID65018 and owned main window7129, with right-up cleanup. Native WebKit recorded14 matching pointer events, button2/buttons2 then release, and no modifiers. The helper and its module cache were outside the repository and deleted; the observation-only pointer listener was removed. No camera target was assigned or mutated for the gesture.

Numeric read-only measurements from existing window.__studio diagnostics are saved under native-pan-{before,after,resize,fullscreen,fullscreen-exit,redraw,dpr,dpr-restored,resume}.json, with raw console/AX logs and owned screenshots53–60. Pre-pan target(m):[-0.0011605415860734994,0.0379,0.03303675048355899], guided. Post-pan target:[-0.01979437824888457,0.04974643396759883,0.008859715139812062], manual. Target translation0.03274273819548068m; camera-position-minus-target changes only6.206335383118183e-17m, confirming pan rather than orbit. Pixels visibly translate the stack.

| Lifecycle after actual pan | CSS viewport | Renderer DPR | Target delta from post-pan(m) | Camera | Result |
|---|---|---|---|---|---|
| Settled repeat |1100x700|1.5|0|manual|PASS|
| Native resize |1121x704|2|5.624035458610689e-10|manual|PASS|
| Native fullscreen enter |1168x729|2|7.52479509072176e-10|manual|PASS|
| Native fullscreen exit |1121x704|2|8.307746276745976e-10|manual|PASS|
| Hide instructions / normal redraw |1121x704|2|9.603060809277882e-10|manual|PASS|
| Existing renderer setDpr(1) |1121x704|1|1.013662009016945e-9|manual|PASS|
| Existing renderer setDpr(2) |1121x704|2|1.0606152294390866e-9|manual|PASS|

Every delta is below the existing F7 tolerance1e-6m. DPR setters exercise renderer lifecycle only; native pointer input establishes pan. The governor also changed DPR2 ->1.5 ->2 during the sequence without taking camera ownership. Tiny residual damping does not establish a target reset. The detached inspector changed Spaces; fullscreen coordinates were read first, then the inspector was closed and native Exit fullscreen/on and pixels were separately confirmed. DOM fullscreen remains false because Tauri uses native window fullscreen.

Clicking Resume guided view intentionally changed ownership to guided and restored target[-0.0011605415860735848,0.03790000000000005,0.03303675048355888], error1.4827129684373377e-16m from the original guided target, and moved0.032742738195480535m from the panned target. No implementation repair or rebuild was needed. JXA event-lifecycle SIGSEGV and the PID-routed Swift attempt that delivered no pan are retained as failed automation attempts. The accepted HID-routed gesture is distinct. Full evidence and guards: native-pan-summary.json. S2-06 CLOSED; F7 re-confirmed CLOSED.

The final camera invariant is unchanged: only actual camera manipulation or explicit camera commands change ownership/target. Store invalidation, playback, selection, resize, DPR, fullscreen and render lifecycle alone do not.

Physical Escape38/39/40 separately closes the enlarged manual, then selection, then fullscreen. Modal-open state was captured AX-only, without enlarged manual pixels. Manual -> keyboard tray41 -> first Escape preserves fullscreen while clearing selection; return42 never resurrects the modal.

### Fresh native performance sanity

| Scenario | CSS viewport | DPR | Active frames | fps | Mean/p95 ms | Draws | Triangles |
|---|---|---|---|---|---|---|---|
| Pi5 S02 replay43 |1168x729|2|120|60|16.7/20.0|237|174526|
| Pi5 S04 ghost+explode replay44 |1168x729|2|120|60|16.7/20.0|253|194686|
| Whole tray,12 physical orbit drags46 |1168x729|2|120|60|16.7/18.0|295|249294|

No DPR reduction observed in these bounded samples; historical reductions remain valid historical evidence. Page-relative first-visit load timings: manifest4ms, GLB25, verify13, decode5, build1; canvas387, first render388, first drawn427ms. Before-orbit snapshot45 contains previous S04 rolling metrics and is excluded as a tray sample. These three samples satisfy F9's remaining sanity requirement without Studio4 optimization or owner acceptance claims. F9 CLOSED.

### Continuation validation

| Command | Result | Evidence |
|---|---|---|
| node digital-twin/tools/studio/studio.mjs check | RUN / PASS | final-studio-check.json; PASS/FRESH/CURRENT |
| pnpm typecheck (companion cwd) | RUN / PASS | typecheck.txt; both projects exit0 |
| PICAR_ALLOW_PACKAGE_BUILD=1 pnpm test:unit tests/studio/perf.test.ts tests/studio/fullscreen.test.ts tests/studio/escape.test.ts tests/studio/isolation.test.ts | RUN / PASS | native-focused-unit.txt;4 files,21 passed,317ms |
| pnpm test:browser tests/browser/studio.spec.ts -g 'stationary selection across active playback\|first frame drawn\|manual open to tray\|a manually panned target\|Escape\|combined ghost' | RUN / PASS | native-focused-browser.txt;21 passed,1 skipped,1.5m. WebKit physically held-key test skipped; native physical Escape independently verified. |
| VITE_M3_ENABLED=0 PICAR_ALLOW_PACKAGE_BUILD=1 pnpm tauri build --debug --bundles app --config <fresh incognito config> | RUN / PASS | native-build-final.txt; failed lease attempt retained in native-build.txt |
| Full unit/browser/fidelity/M7 aggregate repeat | NOT RUN | No source changes; previous exact aggregates retained above, including101/2/1 browser RUN / FAIL — EXPLAINED. |
| Post-pan node digital-twin/tools/studio/studio.mjs check | RUN / PASS | pan-studio-check.txt; PASS/FRESH/CURRENT |
| Post-pan pnpm typecheck | RUN / PASS | pan-typecheck.txt; both projects exit0 |
| Post-pan focused unit: selection/fullscreen/perf/Escape/isolation | RUN / PASS | pan-focused-unit.txt;5 files,23 tests,332ms |
| Post-pan focused browser: pan/stationary playback/resize | RUN / PASS | pan-focused-browser.txt;8 passed,0 failed/skip,48.3s; both Chromium/WebKit |
| Initial post-pan browser dev-server launch | RUN / FAIL — EXPLAINED | pan-focused-browser-lease-failure.txt; two verified-dead reader leases; dry-run/apply logs retained; retry above passes |
| Post-pan native rebuild | NOT RUN | No implementation/source/binary/pack change; same verified final native bundle |

M7 remains BLOCKED0/58; both variants0/29; S07 BLOCKED; S09 REFUSED; G-CAD BLOCKED/unchanged; M8 NO. closure.py/closure_verify.py remain unchanged. No Studio3/3.5/4 work began.

Final S2-01 through S2-09 are individually CLOSED. F1 through F11 are individually CLOSED, including F7 native camera lifecycle and F9 fresh native performance. No new blocker/high application defect was established.

READY FOR STUDIO 3

The owner authorizes a normal push of studio/s2-pro-full-remediation to its existing origin after this reviewed closeout commit; only that branch, existing history and final closeout are covered. No PR, merge, force push, tags or history rewrite. Studio3 is not begun.

Studio3.5 is reserved for a dedicated high-fidelity Robot HAT pass after Studio3 and before Studio4. The owner plans to supply new scan/caliper evidence tomorrow. No new HAT electronics are modeled in this continuation.

### Continuation privacy inventory

The final prepublication inventory scans 527 complete-candidate files against the Studio2 base and 480 remediation-delta files: 388 text and 139 binary/media. All 235 text hits are classified:233 real functional local paths/provenance and2 functional development/test URLs. Credential-shaped and credential-assignment hits remain zero; all unique matching values were inspected. No redaction/history rewrite. All61 new owned-window captures were visually reviewed, including failed setup probes; metadata contains dimensions/resolution, Screenshot comment, color profile and digest fields, with no GPS/identity fields found. media-review.json records every capture and corrected disposition. Twelve unrelated M2 files remain untracked/unstaged and excluded. No disposable automation helper, agent state, private source pixels, database or cache is staged. The existing repository is already public; this is a complete candidate/delta scan before the authorized normal branch publication, rather than a first-publication history rewrite.

The original129 named staged paths were reviewed before adding final pan evidence. The final182 paths are explicit, reviewed Studio2 docs/evidence only, including this review report. git diff --cached --check retains25 raw text-log files with known trailing-space/blank-EOF findings (exit2, RUN / FAIL — EXPLAINED); every staged authored non-.txt path passes (exit0). Raw failed attempts remain untouched as evidence. staging-review.json contains the exact path inventory, exclusions and diagnostics. Final commit and normal branch publication follow this review; the verified remote SHA is issued in the post-push Pro invocation.
