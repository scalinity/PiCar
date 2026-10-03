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
| S2-06 | PARTIALLY CLOSED | Bundle72 supplied a complete rendered Zero matrix on the final pack; bundle80 final-source render verification is partial after S03, recorded below. | Native AX and app-window captures; Pi5 representative Escape checks. Fresh native performance and mouse manipulation are NOT RUN. | Final S04–S09 render coverage needs a visible foreground window; human visual acceptance is separate. |
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

G-INSTRUCTIONAL-ASSEMBLY BLOCKED 0/58; rpi5 and Zero 0/29 each. S07 BLOCKED on UNFRAMED_TOUCHED_CABLE_END/PX-V40-CONN-07-COMMON-BATTERY. S09 REFUSED with unchanged101.071,51.250,12.955,2.026mm³ conflicts; prepared candidate not adopted. G-CAD BLOCKED/unchanged; M8 authorization NO. No persistence/photo/evidence-export workflow or renderer redesign was added. No push/history rewrite.

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
| F7 camera lifecycle | CLOSED | active S02/S04 stationary held selection, genuine drag, resize/DPR/fullscreen target preservation |
| F8 Escape/fullscreen | CLOSED | physical-press unit/browser checks, serialized platform state, native window-scoped release and modal-navigation proof |
| F9 performance semantics | PARTIAL | active/stall/idle/hidden tests and browser instrumentation pass; required fresh native sanity is NOT RUN pending a visible foreground window |
| F10 resource ownership | CLOSED | materials/pick targets/shadows disposal, repeated board-switch and Studio-visit browser checks |
| F11 inspector truthfulness | CLOSED | displayed/checked identities, matched subset, candidate/unchecked states and corrected limitations |

Final unit command with package authorization:23 files,253 passed,15.21s (`52-unit-final-attempt2.txt`). Final typecheck passes (`49-typecheck-final.txt`). Fidelity after HAT extension:25 passed,9.12s (`46-fidelity-with-hat.txt`). Native backend persistence-feature compilation passes (`58-rust-m3-compile.txt`), without launching or opening a database. The full Studio final-HAT attempt had70 passes,1 failure,1 skip:WebKit S04 picked Pi5 instead of PlateA at a point selected in the earlier final-pose view. An interior point selected after replay with eight-pixel neighbouring-body clearance preserves the original assertions; all4 focused Chromium/WebKit S02/S04 checks pass,19.3s. The final complete browser aggregate follows.

## Latest exact validation

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

## Current native dispositions

Native72 captured a complete Zero S00–S09 matrix23–36 on the final rounded pack, with working scenes, board/manual mappings, selection and transport. Final bundle80 additionally proves physical visible-modal dismissal and manual -> keyboard tray -> first Escape on both boards:captures37–39 and50/51, with AX-only modal records. No enlarged manual capture is saved. The final80 matrix40–49 has complete AX route/mapping/selection/control coverage, but rendered scenes stop advancing after S03 in44–49. Those captures are PARTIAL_RENDER_STALE, not accepted as full native proof. Combined native52–54 is likewise partial. Coordinate/scroll automation returned noWindowsAvailable; requesting a visible foreground window distinguishes a background-window limitation from a candidate defect. Bounded native performance and native mouse manipulation remain pending that prerequisite. Browser manipulation and combined inspection pass.

All final80 captures37–54 were visually reviewed; the stale-scene limitation was found during that media inspection and retained. S2-06 is PARTIALLY CLOSED until final rendered native coverage is verified. No READY claim while this remains unresolved.

Reconnecting the computer-use session did not restore coordinate input: a fresh native screenshot still showed the S03 scene on the S04 route, and the following physical click returned noWindowsAvailable. The owner foreground request remains pending. This is a concrete verification prerequisite; its cause is not established as either an app defect or a background-window limitation.

## Final candidate privacy inventory

`privacy-final.json` scans the complete candidate against the Studio2 base:349 files (271 text and78 binary/media), with302 files in the remediation delta. The scan classifies every text hit before any redaction:206 functional local paths/provenance and two functional development/test URLs are retained; credential-shaped values and credential assignments have zero hits. No redaction or history rewrite was performed. Twelve unrelated untracked M2 files are excluded. All new app media were visually reviewed, including the failed/stale records; the final Blender render was also inspected. Ordinary runtime manual pixels are permitted application evidence; no separate enlarged/source-copy manual or private photo bytes are added. Image metadata inspection found width/height, color profile and digest metadata, without identity/GPS fields; this is a scoped artifact review, not a claim that arbitrary binary credential scanning is exhaustive.

## Local implementation checkpoints

A. 95b0042671fabee3b58d1a9c2f781c7e0f2b5449 — M7 fidelity checkpoint: current hole review and display-only HAT outline
B. e17cfbba334248739cfb012d0fff13dea90ac941 — Studio: enforce semantic pack contracts and canonical tray audit
C. 90ca7ba697c44b7833ccd5e5abb1973922349896 — Studio: recover locked manual loading and surface render failures
D. d885e5553e14e12fcb0292d7f437de080dc0c445 — Studio: repair camera, explosion, clipping and native Escape order

Explicit named paths were staged; no push, rewrite or attribution trailer. The following separate documentation/evidence checkpoint is named `docs: record Studio 2 remediation and pending native verification`; resolve its exact SHA from the branch log. Its own SHA is not embedded in its content.

## Closeout state

S2-01,02,03,04,05,07,08,09 are CLOSED by the implementation and recorded guards. S2-06 remains PARTIALLY CLOSED: final80 rendered S04–S09, native mouse manipulation and the bounded native performance sample require a visible foreground window. The owner input request is pending; no inference of PASS from expired time or prior-pack evidence.

NOT READY FOR STUDIO 3

No Studio3/M8 work is started. The implementation checkpoints are complete and locally reviewable. The remaining action is to verify the final native app with its window visible and resolve any real defect discovered, then record performance, update this disposition, and run the bounded Pro re-review.
