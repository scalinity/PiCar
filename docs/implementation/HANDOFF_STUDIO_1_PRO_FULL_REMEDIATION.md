# Assembly Studio 1 remediation handoff (review findings F1 to F11)

The independent technical review of Studio 1 (commits `d762bb2`, `2364e29`, `d8b9bd4` on `studio/s1-assembly-studio`) raised eleven findings and concluded "ready for Studio 2 after targeted fixes". This remediation closes all eleven on `studio/s1-pro-full-remediation`, cut from `d8b9bd4`. It is not Studio 2 and not M7 acceptance: `G-INSTRUCTIONAL-ASSEMBLY` stays BLOCKED at 0/58, S07 and S09 are unchanged, and the Studio 1 commits are preserved as they were. Evidence is in `docs/implementation/evidence/studio-1-pro-full-remediation/`; the historical Studio 1 evidence in `evidence/studio/` is untouched.

## Findings

| Finding | Status | Implementation | Tests | Residual risk |
|---|---|---|---|---|
| F1 BLOCKER: readiness not bound to the verified closures and geometry | CLOSED | `digital-twin/tools/studio/sources.mjs` (new): `closureReadiness` requires each closure's canonical RFC 8785 hash to equal the verifier's `closureRfc8785Sha256` before PREVIEW_SOURCE_REVALIDATED; `tessellationProblems` binds the tessellation to the chain run, its verification, its Studio chain record and the revision registry, and every mesh to its artifact; `checkFreshness` reports SOURCE_FRESHNESS. `studio.mjs`: the chain records `studio-chain.json`; the pack refuses any binding failure with variant, step and both hashes; `check` reports PACK_INTEGRITY and SOURCE_FRESHNESS separately. `tessellate.py`: contract 2 with chain binding and per-definition `meshSha256`. | `tests/studio/sources.test.ts` (20, synthetic fixtures: closure changed after PASS, old verification with a new closure, artifact changed under a stale tessellation, foreign chain, tampered mesh, registry change, input change, missing chain run); `pack.test.ts` (integrity PASS for the frozen pair, every operable step carries its verified hash). Real chain: evidence 04 and 05. | Refused records (S09) are bound to the verifier by name, because `closure_verify` emits no hash for them; the pack records their bytes' hash and freshness re-checks it. The generator code (`studio.mjs`, `tessellate.py`) is not part of freshness: editing it does not make a pack STALE. |
| F2 HIGH: Studio URLs violate the Setup route contract | CLOSED | `picarx-companion/src/lib/progress-store.ts`: a Studio URL is never the remembered route; the Setup schema and `legacy.ts` are unchanged. | `tests/studio/persistence.test.ts` (legacy record unchanged, adopted by `captureLegacy`); browser M3 test (setup and progress unchanged through Studio navigation, playback and selection, no store error); `tests/browser/studio.legacy.spec.ts` in the legacy config (the record left after Studio use, with the Studio still open, is adopted by the real M3 capture and first initialization, raw input kept). | The Studio 1 native debug build runs in legacy mode, so a WebView record from it may still hold a Studio `lastRoute` if the Studio was the last page visited; any later navigation to another companion page overwrites it, and an M3 migration that met it would quarantine with the raw record kept. The owner's storage was not read. |
| F3 HIGH: cross-variant selection reaches a missing object | CLOSED | `state/studio-store.ts`: `enterStep` keeps a selection only when the part exists on the board entered (no remapping by name or shape). `scene/StudioScene.tsx`: framing acts only on a part in the active scene; rebuilt roots re-apply a retained selection's highlight. `ui/StudioChrome.tsx`: the inspector ignores a selection from the other board. | `tests/studio/selection.test.ts`; browser: Pi 5 board to Zero 2 W and back with `F` and Frame part, common Plate A keeps selection, highlight and framing, rapid switching raises no error. | None known. |
| F4 HIGH: display checks not bound to exact mechanical inputs | CLOSED | `digital-twin/cad/twin_cad/fidelity/pi5.py`: the record (schema `picar-studio-display-check/1`) names the display artifact, the instructional artifact, every other placed part's artifact and each checked closure by canonical hash, and measures the mounting holes on both shapes. `studio.mjs` draws the display model only when the record matches the pack exactly, otherwise draws the instructional shape and records `displayWithheld`; states the record never measured are `NOT_CHECKED`. Display record regenerated (M7 review checkpoint `04b7805`). | `sources.test.ts` (stale closure, instructional artifact, part artifact, old schema, NOT_CHECKED); `test_studio_fidelity.py::test_pi5_display_checks_name_the_exact_inputs_they_measured`; `pack.test.ts` (Pi 5 bound, S02 CHECKED at its closure hash with the 449 mm³ microphone overlap, S09 NOT_CHECKED). | The 449 mm³ microphone overlap and the stud contacts up to 2.8 mm³ remain, by design, as recorded display findings. |
| F5 HIGH: runtime does not enforce the pack contract | CLOSED | `assets/pack-contract.ts` (new, shared with the producer): canonical pack-ID preimage, manifest schema, GLB container and structure rules, `validatePackBytes` with Web Crypto SHA-256. `assets/pack.ts`: verifies both files' bytes before decoding, then checks every decoded root is identified and at identity. | `tests/studio/pack-contract.test.ts` (tracked pack passes; equal-length wrong GLB, one-byte mutation, bad pack ID, duplicate definition, missing definition, root transform, root children, wrong basis, wrong unit, old contract, operable step not display-ready, unparsable manifest); browser: a same-length wrong GLB is refused before any canvas exists. | None known. |
| F6 MEDIUM: a pack ID does not identify a presentation snapshot | CLOSED | `presentation/blender/build_studio_scene.py`: `presentation-receipt.json` with pack, configuration, builder and Blender identities, a presentation-state fingerprint, `.blend` and render bytes, and `presentationId`; exhaustive scene ownership (`--remove-unowned` deletes and lists objects outside the owned collections); `--check`. `tools/studio/presentation.mjs`: CURRENT or STALE in `studio.mjs check`. | `tests/studio/presentation.test.ts` (9: stale pack, stage, materials, builder, `.blend`, render, edited recipe, missing receipt); `tools/studio/presentation-selftest.mjs` with Blender on scratch copies (11: unowned objects refused, explicit removal listed, stable identity and counts across rebuilds, `--check` drift, override survives a rebuild and changes the identity, reset restores and changes it again). | The fingerprint is not byte-level: it covers the presentation objects, their data, the studio materials' node values, the world and the render settings. Edits elsewhere in the `.blend` are caught only as changed `.blend` bytes. |
| F7 MEDIUM: control rebinding resets a manual target | CLOSED | `scene/StudioScene.tsx`: the driver selects only stable renderer state and binds its controls once; the target is set when the viewport opens and afterwards only by input, focus, reset or a resumed guided view; damping runs to completion after input. | Browser (Chromium, WebKit): a panned target holds to < 1e-6 m through resize, pixel ratio 2 and 1, fullscreen enter and exit; Resume guided view restores the guided target. Before: 26 mm on a resize. | None known. |
| F8 MEDIUM: Escape is time-based | CLOSED | `state/escape.ts` (new): one action per physical press; repeats ignored; keyup acts only for a press none of whose keydowns arrived. `state/fullscreen.ts`: requests serialized, never reject, platform state re-read after each, refusal shown in the header. | `tests/studio/escape.test.ts` (7), `tests/studio/fullscreen.test.ts` (3); browser: held press with a selection clears only the selection, a separate press leaves fullscreen (dispatched events, both engines; physical keys, Chromium), keyup-only fallback. | WebKit leaves element fullscreen on a physical Escape itself, as the Fullscreen specification requires of a user agent; the physical-key test is skipped there with that reason. Native behaviour is covered by the native check below. |
| F9 MEDIUM: instrumentation does not measure what it names | CLOSED | `state/perf.ts`: `createFrameLog` counts an interval only when the previous frame asked for the next or the user is moving the view, with the page visible; `createDprGovernor` tracks the display period, recovers at 60 Hz, backs off with a doubling delay. Marks from the Studio page's first render to canvas creation, first render and first frame drawn. HUD labels state the definitions. | `tests/studio/perf.test.ts` (5: 120 ms stall kept, idle and hidden excluded, 60 Hz recovery, hysteresis, 120 Hz cadence); browser: mark order, playback accumulates active frames, an idle wait adds none, HUD labels. | "Studio page start" begins after the Studio's code chunk has loaded and covers the first visit of an app session only. "First frame drawn" is the next animation frame after the first render, not a compositor presentation timestamp. |
| F10 MEDIUM: GPU resource ownership incomplete | CLOSED | `scene/resources.ts` (new): pack-cached, board-owned and renderer-owned classes, each with one creation and one release point; owners registered while live. The frame loop releases a replaced board; viewport close releases the board and the environment render target; light cards released once the environment exists. | `tests/studio/resources.test.ts` (disposal spies: every board material and the key light released, pack geometry and source material never; owner released once); browser: six board switches and three Studio visits keep renderer textures and the owner registry at baseline (before: textures 4 to 16). | Exact browser GPU memory is not observable from a page; the evidence is the registry, the disposal spies and `renderer.info`. Leaving the Studio relies on React Three Fiber disposing the renderer and losing its context. |
| F11 MEDIUM: inspector overstates display matching | CLOSED | `ui/fidelity.ts` (new): fidelity as the subset of detail parts whose footprint matches the maker's model (overlap at least half), with the deviation among exactly those and every other part named. `ui/StudioChrome.tsx`: separate displayed and checked shapes, each with file name and hash; this step's display check; measured mounting-hole agreement. | `tests/studio/fidelity.test.ts` (25 of 33 matched, 8 named; a large offset in a good match is counted, a small offset in a poor match is not); browser: both artifact hashes, the classified wording, `micro HDMI 0`, the 449 mm³ overlap, and an ordinary part shown and checked as one shape. | None known. |

## Identity changes

| | Studio 1 | Remediation |
|---|---|---|
| Pack ID | `2c1e54e477106b6b00dd986bd6e8ac5d056da50523ba27bf79e3cbf86be6289b` (contract 1) | `7dcd6252a32a89b6f87f45dd25c263d91a902111341f6c5a274f3dd8851efa0a` (contract 2) |
| Why | | The manifest now records each step's canonical closure hash and verdict, the chain record, the revision registry, a mesh hash per definition and the display record the Pi 5 detail is bound to. The GLB is byte-identical (`006eebfa02ec…`), chain run `s1r-01` reproduces `s1-04`'s 18 closure and refusal files and its verification byte for byte, and the tessellation's mesh bytes are unchanged: no pose, mesh or readiness changed. |
| Presentation ID | `0e26648a779d677332859a6deca5580f5f550194e490a8aba7fb79f5e8958e07`, derived after the fact (Studio 1 recorded none) | `ee036e1a73f2349408883fe0a1c545aa0ceb19ff24c67316d69f61a422769c63` |
| Why | | The pack and the builder changed; the stage, the materials and the presentation-owned state did not. |
| Source freshness | Integrity PASS as a frozen pair; freshness UNVERIFIABLE (records no bindings) | Integrity PASS, freshness FRESH, presentation CURRENT |

## Generated outputs

- Chain run `s1r-01` and tessellation `s1r-01` (ignored `digital-twin/generated/studio/`), from the frozen M4 environment (CPython 3.12.14, CadQuery 2.8.0).
- `digital-twin/validation/expected/m7/fidelity/display/PX-V40-DEF-PI5.display.json`, regenerated with bindings (display BRep `afd18f9adcd7…` unchanged).
- `picarx-companion/src/generated/studio/manifest.json` (pack `7dcd6252a32a…`); `parts.glb` unchanged.
- `digital-twin/presentation/blender/picar-studio.blend`, rebuilt with `--remove-unowned`, which deleted Blender's factory Cube, Light and Camera and their collection; `presentation-receipt.json`; reference render `renders/7dcd6252a32a-ee036e1a73f2-rpi5-S02.png`. The Studio 1 render `renders/2c1e54e47710-rpi5-S02.png` stays as historical evidence.

## Validation

| Command | Result | Evidence |
|---|---|---|
| `node digital-twin/tools/studio/studio.mjs check` | RUN / PASS: integrity PASS, freshness FRESH, presentation CURRENT, exit 0 | 12, 28 |
| The same on the Studio 1 pack | RUN / PASS as expected: integrity PASS (frozen pair), freshness UNVERIFIABLE, exit 3 | 01 |
| F1 on the real chain (closure changed after PASS; artifact changed under the old tessellation) | RUN / PASS: STALE with variant, step and both hashes; rebuild refused; FRESH once restored | 04, 05 |
| `node digital-twin/tools/studio/studio.mjs blender --check` | RUN / PASS | 12 |
| `node digital-twin/tools/studio/presentation-selftest.mjs` (Blender 5.2.2, scratch copy of the Studio 1 `.blend`) | RUN / PASS, 11 of 11 | 12 |
| `pnpm typecheck` | RUN / PASS | 20 |
| `PICAR_ALLOW_PACKAGE_BUILD=1 pnpm test:unit` | RUN / PASS, 143 of 143 in 19 files | 21 |
| `pnpm test:browser` (Chromium and WebKit, `VITE_M3_ENABLED=1`) | RUN / FAIL — EXPLAINED: 69 passed, 2 failed, 1 skipped. Both failures are `preservation.spec.ts:38`, the legacy-mode PDF bookmark assertion this M3 configuration fails by construction, as at Studio 1; the skip is the WebKit physical-Escape case (F8). Every Studio test passed. | 22 |
| `npx playwright test -c playwright.legacy.config.ts` | RUN / PASS, 10 of 10 (8 preservation, 2 Studio legacy migration) | 23 |
| M7 source-mode pytest (`test_m7_*`, `test_toolchain`, `test_studio_fidelity`; chain `s1r-01`; frozen M4 environment) | RUN / FAIL — EXPLAINED: 980 passed, 137 skipped, 12 failed; the 12 are exactly the installed-wheel `site-packages` guards that failed at Studio 1 and fail in source mode by design | 24 |
| `pnpm tauri build --debug --bundles app` | RUN / PASS (and again after the window-placement fix) | 25 |
| `cargo check --features m3-persistence` | RUN / PASS | 25 |
| Native checks, 21 steps | RUN / PASS | 26 |

## Native

The debug bundle, in its default legacy persistence mode, was driven through all 21 steps: launch, S01, S02, playback, scrub, a Pi 5-specific selection, the switch to Zero 2 W, `F`, the switch back, common Plate A kept and highlighted and framed on the other board, a manual pan surviving a resize and native fullscreen, a 1.5 s held Escape clearing only the selection, a separate press leaving fullscreen, the performance overlay, three leave-and-return cycles and rapid board switching. Every step passed; captures `evidence/studio-1-pro-full-remediation/captures/native-01` to `native-06`. Navigation used only Studio URLs and Home, so the setup record in the app's storage was not written. This is checking by automation and inspection, not a visual sign-off.

The window opened partly off-screen on every launch (1440 × 900 configured, 1168 × 733 work area). At the owner's request it is now fitted to the monitor's work area and centred at startup (`src-tauri/src/lib.rs`, commit `7991eb2`); `tauri.conf.json` is unchanged.

## Performance

Under the new definitions, in native fullscreen at 1168 × 729 CSS px and DPR 2, during the Pi 5 S02 replay (236 draw calls, 172,122 triangles, the same scene as Studio 1): 60 fps over 120 active frames, mean 16.7 ms, p95 18.0 ms, display period 16.0 ms. Load: manifest 3 ms, GLB 24 ms, verify 5 ms, decode 4 ms. From the Studio page's first render: canvas 364 ms, first render 365 ms, first frame drawn 388 ms.

Studio 1's 57 fps, 17.5 ms mean, 23.0 ms p95 and 418 ms "load to first frame" stay as historical evidence under their own definitions: they dropped every gap of 100 ms or more, counted any shorter gap including idle-to-active ones, and timed start-up from module evaluation to Canvas creation. Both the metric and the implementation changed (the loader now verifies the pack, about 5 ms; the frame loop finishes the damping tail), so the figures are not compared one for one.

## M7 status

`G-INSTRUCTIONAL-ASSEMBLY` BLOCKED, admitted 0/58 (rpi5 0/29, rpi-zero-2-w 0/29). S07 BLOCKED on `UNFRAMED_TOUCHED_CABLE_END` (`PX-V40-CONN-07-COMMON-BATTERY`). S09 refused by the unchanged overlap check (101.071, 51.250, 12.955, 2.026 mm³); the prepared S09 candidate is not adopted. M8 authorization NO. The only M7-owned change is the display record, in its own review-checkpoint commit `04b7805`, listed in `HANDOFF_M7_REMEDIATION.md`, "Studio 1 remediation changes to M7-owned paths". `closure.py` and `closure_verify.py` are unchanged.

## Privacy

No private photograph, its folder or the vendor STEP entered a tracked file, the pack, the `.blend` or the bundle. `pack.test.ts` keeps scanning the GLB and manifest for image signatures and private paths. The vendor cross-check rerun read the ignored STEP and recorded numbers only, as before. Native captures show the app window only.

## Remaining issues

- A Studio 1 legacy-mode record may still carry a Studio `lastRoute` (F2 residual above).
- The S09 refusal binds to the verifier by name only (F1 residual above).
- Generator code is outside pack freshness (F1 residual above).
- `tests/browser/preservation.spec.ts:38` fails in the M3 configuration by construction, as at Studio 1 (the legacy-mode PDF assertion; it passes in the legacy configuration).
- On macOS a right-button pan that starts over empty space clears the selection: `contextmenu` fires on button-down, which React Three Fiber reports as a missed click with no movement. Present at Studio 1; recorded, not changed here.
- WebKit leaves element fullscreen on a physical Escape itself (user-agent behaviour required by the Fullscreen specification); the native app is unaffected.

## Studio 2 readiness

READY FOR STUDIO 2. F1 to F11 are CLOSED; no new BLOCKER or HIGH defect was found; what remains open is M7 content (S07's battery-lead frame, S09's refused candidate, 0/58 admitted), which the Studio states rather than resolves, and the residual risks named in the table. Start Studio 2 after the owner's focused re-review of this remediation.

## Next session prompt

This supersedes the Studio 2 prompt in `HANDOFF_STUDIO_1.md`, which names the Studio 1 pack and branch. Run it only after the owner has accepted the focused re-review of this remediation.

```text
STUDIO 2 — COMPLETE S01–S09 FOR BOTH BOARDS IN THE ASSEMBLY STUDIO

IDENTITY AND SCOPE
Repository /Users/danny/Documents/Apps/PiCar: a PiCar-X (SunFounder Z0104V40) digital twin with a React/Tauri companion app, a personal single-user tool on the owner's Mac. Deliver Studio 2 as defined in docs/digital-twin/ASSEMBLY_STUDIO_PLAN.md ("Studio 2 — complete S01–S09 for both boards"): every printed step S01–S09 opens in the companion's #/studio for rpi5 and rpi-zero-2-w; S03–S06 and S08 play as Preview instruction; S07 and S09 open in review mode; the drawer shows the printed manual panel, the part list, limitations and the M7 status; inspection adds isolate, ghost others, explode around the step and a deck clip plane. rpi4 stays PRESERVED_NON_TARGET.
Authorized: local frontend builds, type checks, browser tests, the coordinated dev server, bounded Tauri debug builds and native fullscreen testing, Blender command-line automation, pinned frontend dependencies where a feature needs one, and local commits staged by explicit path. Not authorized: pushing unless the owner asks, any M7 acceptance claim, M8 work, changes to the M3 session store, reading or changing the owner's session database.

WHAT ELSE IS IN FLIGHT
M7 instructional assembly is BLOCKED (G-INSTRUCTIONAL-ASSEMBLY 0/58); its work is committed as review checkpoints, not accepted. M7 owns digital-twin/cad/twin_cad/assemblies/, digital-twin/cad/tests/test_m7_*.py, digital-twin/assemblies/v40/presentation/instructional/, digital-twin/validation/expected/m7/, docs/implementation/M7_* and docs/implementation/HANDOFF_M7_REMEDIATION.md. Change nothing there except what a Studio change forces (an additive fidelity revision, a regenerated display record, or an M7 test assertion a store change invalidates); record each in HANDOFF_M7_REMEDIATION.md and commit it separately from Studio files. Never reset, clean or stash those paths.
One integration owner per working tree. Before writing anything, confirm no other Claude or Codex session is writing here (pgrep -fl "claude|codex", then lsof -a -p <pid> -d cwd for each, and list files modified in the last hour outside node_modules, target and .git); if one is, stop and say so.
Cut branch studio/s2-all-steps from studio/s1-pro-full-remediation. Never check out codex/m7-instructional-assemblies.
Do not start Studio 3 (session ledger, owner-recorded completion, photos) or Studio 4.

STARTUP ORDER
1. Read CLAUDE.md at the repository root: the geometry fidelity bars and the rule that the M7 overlap checks are never weakened.
2. Read docs/digital-twin/ASSEMBLY_STUDIO_PLAN.md and docs/digital-twin/ASSEMBLY_STUDIO_PIPELINE.md in full (source binding, the three-part check, presentation identity, runtime ownership), then docs/implementation/HANDOFF_STUDIO_1_PRO_FULL_REMEDIATION.md.
3. Run git status --porcelain | head -80, git log --oneline -10 and git branch --show-current.
4. Run node digital-twin/tools/studio/studio.mjs check from the repository root. Expect packId 7dcd6252a32a89b6f87f45dd25c263d91a902111341f6c5a274f3dd8851efa0a, integrity PASS, freshness FRESH, presentation CURRENT, exit 0. Freshness reads UNVERIFIABLE if the ignored chain run digital-twin/generated/studio/chain/s1r-01 is gone; then regenerate under a new label before relying on readiness. STALE names what changed; stop and report it.
5. Read, in this order: picarx-companion/src/pages/Studio.tsx; picarx-companion/src/features/assembly-3d/ (assets/pack.ts and pack-contract.ts, motion/evaluate.ts, scene/StudioScene.tsx and resources.ts, state/studio-store.ts, escape.ts, fullscreen.ts, perf.ts, ui/StudioChrome.tsx and fidelity.ts); digital-twin/tools/studio/studio.mjs (the "operable:" line), sources.mjs and presentation.mjs; digital-twin/assemblies/v40/presentation/studio/stage.json; picarx-companion/tests/browser/studio.spec.ts and tests/studio/*.test.ts; picarx-companion/src/components/PdfViewer.tsx.
6. Resume rule: if studio/s2-all-steps exists or stage.json operableSteps already extends past [0, 1, 2], inspect what landed and continue from it; do not restart.

WHAT TO SETTLE RATHER THAN INHERIT
- Opening review steps. Steps 3–9 render as inert labels and Studio.tsx falls back to the last operable step. Making S03–S06 and S08 operable is a stage.json operableSteps change and a pack rebuild under a new label; the pack refuses operability unless the step is PREVIEW_SOURCE_REVALIDATED at its verified closure hash, and the runtime contract refuses a manifest whose operable step is not. Review mode must open S07 and S09 without offering playback as instruction.
- S07: name blocker UNFRAMED_TOUCHED_CABLE_END (connection PX-V40-CONN-07-COMMON-BATTERY). S08 carries "S07 is not revalidated; previewing S08 does not certify S07".
- S09: REVIEW_REFUSED_CANDIDATE with four measured conflicts on rpi5 (HORN-PAN × PLATE-H 101.07 mm³, PLATE-A × ULTRASONIC 51.25, PLATE-A × PLATE-H 12.95, HORN-PAN × ULTRASONIC 2.03). Show the candidate as unaccepted with the pairs and volumes; never animate it as an insertion. Its Pi 5 display check is NOT_CHECKED; say so.
- The manual panel: derive the printed-step-to-page mapping from the repository's own records (PdfViewer, the Setup Wizard); do not invent page numbers or crops. If no record supports a mapping, stop and ask.
- Zero-solid instances (the S03 ribbon): list them without drawing invented geometry.
- Cameras: stage.json camera.steps for steps 3–9, judged by rendering each.
- Inspection: the smallest set of isolate, ghost, explode and clip that serves one step. Explosion is presentation only, composed over the evaluated poses. Ghost and clip materials are board-owned resources in scene/resources.ts, released with the board.

CONSTRAINTS
- Final poses come only from M7 closures through the pack; Blender and the runtime never remodel geometry. Labels are never reused.
- After any chain rerun whose closures change, regenerate the display record (twin_cad.fidelity.pi5) before the pack, or the pack withholds the Pi 5 detail; after any pack rebuild, rebuild the Blender project so presentation stays CURRENT.
- Never weaken the overlap checks in closure.py or closure_verify.py.
- The Studio route never imports the assembly session store, and Studio URLs are never remembered as the Setup route.
- No useEffect in React components; follow the existing patterns (ref callbacks, stores, frame-loop adoption of owned resources).
- Start the dev server only with pnpm dev and clear dead leases with pnpm content:recover --apply before and after each browser run.
- Private photographs and their folders never reach tracked files, the pack or the bundle.
- Keep the Studio's dark chrome and its tokens in picarx-companion/src/styles/studio.css.

VERIFICATION
Report each check as RUN / PASS, RUN / FAIL with its output, or NOT RUN. Logs to docs/implementation/evidence/studio-2/.
- From picarx-companion: pnpm typecheck; PICAR_ALLOW_PACKAGE_BUILD=1 pnpm test:unit; pnpm test:browser (Chromium and WebKit; preservation.spec.ts:38 fails in this M3 configuration by construction); npx playwright test -c playwright.legacy.config.ts (preservation plus *.legacy.spec.ts).
- node digital-twin/tools/studio/studio.mjs check after every rebuild: integrity PASS, freshness FRESH, presentation CURRENT.
- The M7 source-mode suite from digital-twin with the frozen M4 environment (pipeline doc, Commands), PICAR_M7_* pointing at the new chain run; only the 12 installed-wheel site-packages guards may fail.
- Native: pnpm tauri build --debug --bundles app, then every step on both boards, fullscreen, Escape with and without a selection, and the performance overlay (p).

CLOSE-OUT
1. Commit Studio 2 locally on studio/s2-all-steps by explicit path, M7-root changes in their own commit, never anything under .claude/, no attribution trailers, no push unless the owner asks.
2. Update ASSEMBLY_STUDIO_PLAN.md and ASSEMBLY_STUDIO_PIPELINE.md to the current design only.
3. Write docs/implementation/HANDOFF_STUDIO_2.md with the state at close and the Studio 3 kickoff prompt.
4. Do not start Studio 3. Do not call any Studio checkpoint M7 acceptance.
5. Print last: the verification table, the capture paths, what the owner should inspect first, and the Studio 3 kickoff prompt.
```
