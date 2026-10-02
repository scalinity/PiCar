# Assembly Studio 2 handoff: complete S01–S09 for both boards, starting with a parts-tray completeness audit

Studio 2 on `studio/s2-all-steps`, cut from `studio/s1-pro-full-remediation` at `a26592259dcd6ef09fa791086148092653b1750e` (verified locally: branch, HEAD, pack `7dcd6252…` integrity PASS, freshness FRESH, presentation CURRENT). It is presentation work, not M7 acceptance: `G-INSTRUCTIONAL-ASSEMBLY` stays BLOCKED at 0/58, S07 stays blocked, S09 stays refused, and M8 is not authorized. Evidence is in `docs/implementation/evidence/studio-2/`.

## Parts-tray completeness (phase 0)

The owner's concern was right: the Studio 1 tray silently left out pieces the first nine steps need. The pack's tray rule took only instances a step *introduces*, minus schematic and abstract kinds, so three classes never reached it, and nothing stood in their place:

- the hook and loop tape pieces S06 *uses* but no step introduces (they are cut from stock: `HOOK-002`, `LOOP-002`);
- the camera ribbon S03 introduces, which has no trusted solid (`RIBBON-FPC-001`, listed only as a line of text in S03's drawer);
- the kit tools the steps' tool requirements name (`SCREWDRIVER-01-001`, `SCREWDRIVER-02-001` for `PX-V40-TOOL-SCREWDRIVER`; `WRENCH-001` for `PX-V40-TOOL-WRENCH`). Which depicted screwdriver a step needs is unresolved (Q-06, Q-13), so both are listed.

Internal pack consistency could not catch this: the pack agreed with its own narrower rule. `digital-twin/tools/studio/tray-audit.mjs` now derives the required set independently (the compiled M2 graphs' introduced, used and tool-requirement records, matched against the M1 inventory) and checks the pack and its render path against it. The runtime pixel census (`__studio.census()`, browser test) measures what is actually visible from the tray camera.

| variant | canonical (printed stock) | S01–S09 required | pack instances | rendered 3D | non-renderable | represented | missing | duplicate / unexpected | invariant |
|---|---|---|---|---|---|---|---|---|---|
| rpi5, Studio 1 pack `7dcd6252` | 156 | 50 | 44 | 44 | 6 | 0 | **6** | 0 | FAILS |
| rpi-zero-2-w, Studio 1 pack | 156 | 47 | 41 | 41 | 6 | 0 | **6** | 0 | FAILS |
| rpi5, Studio 2 pack | 156 | 50 | 44 + 6 tiles | 44 | 6 | 6 | 0 | 0 | HOLDS |
| rpi-zero-2-w, Studio 2 pack | 156 | 47 | 41 + 6 tiles | 41 | 6 | 6 | 0 | 0 | HOLDS |

- Canonical counts are the M1 printed-stock claims (`planned-stock.json`, `BOM_RECONCILIATION.md`), not a count of the owner's loose kit. Per board: available 111, backup 37, accessory 5, tool 3. The 106 (Pi 5) and 109 (Zero 2 W) not in the tray are used after S09, or are spares and accessories; the tray says so beside its inventory line.
- Cross-check: every printed-stock use M1 plans for S01–S09 (34 on the Pi 5, 32 on the Zero 2 W) is in the required set, at the same first step.
- Rendered: every drawn slot has a definition with triangles, a finite pose above the floor and lies inside the tray camera; no two slots' boxes overlap. Runtime census at 1440 × 900: all 50 and 47 slots visible inside the uncovered framing area, smallest 17 and 15 px (the M1.5 screws).
- Disposition: the six are tray **tiles** (flat labelled cards with a dashed edge), each naming why it has no solid. No geometry was invented.
- Visual findings fixed: the Studio 1 tray was one ungrouped row-flow framed together with the empty space where the chassis will be, so the washers and M1.5 screws came out at 4–5 px. On the first grouped layout, the 18 mm standoffs then hid the four upward-pointing M2.5 × 6 screws behind them. All 34 fasteners were present, but not countable. Rows now reserve their height as seen from the tray camera.
- Studio 1 did not render anything it then lost: every manifest tray instance became a drawn root (44 and 41).

Evidence: `tray-audit-before.{json,md}` (Studio 1 manifest), `tray-audit-after.{json,md}`, `tray-runtime-census-<variant>-<engine>.json`.

## Plate A pan-screw holes (owner finding during Studio 2)

The owner saw two holes between one pair of S08 horn screws and one hole between the other. In Plate A's frame the M6 trace had four 1.4 mm holes beside the pan hub on the +Y side (x 167.505) and three on the −Y side (x 166.925), at uneven distances from the hub; S08 puts its screws in the first and last hole of each row, so the pairs differed. The S08 review already listed the rows as "photo-traced (four on one side, three on the other)". The outline revision measured only holes of 2.5 mm and over, so these rows had never been checked against the photograph.

Measured in the calibrated top-down photograph (local brightness minima refined by edge fits, in the outline revision's mirror-axis frame): **four holes on each side**, mirrored pairs within 0.08–0.32 mm, the pair means on a uniform 1.964 mm pitch starting 8.485 mm from the axis (residuals ≤ 0.04 mm). The four-hole side was right.

Correction (additive, M7-owned paths, in its own review-checkpoint commit and recorded in `HANDOFF_M7_REMEDIATION.md`, "Studio 2 changes to M7-owned paths"):

- `fidelity-revisions-03.json` (`PX-STUDIO-FIDELITY-PLATE-A-HOLES-03`, revises outline revision 01, supersedes the M6 artifact): one row of four designed, its mirror image about the plate axis; every other feature unchanged. Built by `twin_cad.fidelity.plate_a --holes-revision`; review `validation/expected/m7/fidelity/plate-a-holes-03.review.json` (numbers only).
- Store: `PX-V40-DEF-PLATE-A.brep` `2e0347dbef81…` → `2348ebddc570…` (8 small holes, 4 per side, row mirror deviation 2.8 × 10⁻¹⁴ mm, volume −3.08 mm³); the other 12 artifacts and their records byte-identical.
- `revisions.specs`: a later batch naming a definition replaces the earlier spec (no definition was named twice before, so nothing else changes). `step08.py`: the deck has 8 small holes, not 7. The independent `step08_verify` re-derives the holes from the artifact and is unchanged.
- Chain `s2-01`: only S08's four M1.5 screws moved (0.23–1.52 mm, both boards), into the corrected holes; every other pose, S07's block and S09's refusal (same four conflicts, same volumes) unchanged; `closure_verify` PASS. Pi 5 display record re-bound (closure hashes, Plate A hash); display BRep and every overlap unchanged.
- Kept, and reported rather than changed: the traced 1.4 mm diameter. The photograph's clean edge fits measure 1.69 mm; the S08 generator and its independent verifier select these holes by the 1.4 mm radius, so adopting it is M7 work (it would also clear S08's declared screw-to-deck overlap).

## Identity

| | Studio 1 remediation | Studio 2 |
|---|---|---|
| Pack | `7dcd6252a32a89b6f87f45dd25c263d91a902111341f6c5a274f3dd8851efa0a` (contract 2, chain `s1r-01`) | `466de8923467aca572814e543467268e420d5a668cd035ee92a5fbe64a8a9130` (contract 3, chain and tessellation `s2-01`) |
| GLB | `006eebfa02ec…` | `ca680e34b2ef…` (Plate A's mesh only; every other definition mesh identical) |
| Presentation | `ee036e1a73f2349408883fe0a1c545aa0ceb19ff24c67316d69f61a422769c63` | `48f88ae36d1248dd006a63132fe19777b704071edf14fd18681f3080210432d9` (new pack, new stage; materials and presentation-owned state unchanged) |

The manifest gains the tray scope, tiles and groups, the per-step mode, newly placed parts, step parts, source intent, warnings and review focus, display names, and the new records as freshness inputs (inventory, definitions, tools, source intents, cable connections, the runtime registry, the instructional parameters and both compiled graphs).

## S01–S09 on both boards

Identical for `rpi5` and `rpi-zero-2-w` (`rpi4` PRESERVED_NON_TARGET).

| Step | Display | Mode | Animation | Blocker / warning |
|---|---|---|---|---|
| S00 tray | — | Tray | — | 50 / 47 pieces, 44 / 41 modelled, 6 tiles |
| S01 Prepare Plate A mounting supports | PREVIEW_SOURCE_REVALIDATED | Preview | YES (9 parts, Plate A placed directly) | — |
| S02 Mount the selected Raspberry Pi | PREVIEW_SOURCE_REVALIDATED | Preview | YES (6 Pi 5 / 3 Zero 2 W) | Pi 5 detailed-model overlap with the microphone, 449 mm³ (recorded finding) |
| S03 Connect the Pi end of the camera ribbon | PREVIEW_SOURCE_REVALIDATED | Preview | YES, nothing moves (ribbon is a tile) | — |
| S04 Mount the Robot HAT | PREVIEW_SOURCE_REVALIDATED | Preview | YES (5) | — |
| S05 Install the two drive motors | PREVIEW_SOURCE_REVALIDATED | Preview | YES (14) | — |
| S06 Prepare battery hook-and-loop mounting | PREVIEW_SOURCE_REVALIDATED | Preview | YES, nothing moves (battery stays in the tray until S07; tape is tiles) | — |
| S07 Secure and connect the battery | PREVIEW_BLOCKED_RELATION | Review | NO | `UNFRAMED_TOUCHED_CABLE_END`, `PX-V40-CONN-07-COMMON-BATTERY` (battery lead → Robot HAT) |
| S08 Attach the pan horn to the front chassis | PREVIEW_SOURCE_REVALIDATED | Preview | YES (5) | "Step 7 is still under review. Previewing step 8 does not certify step 7." |
| S09 Install the ultrasonic module and Plate H | REVIEW_REFUSED_CANDIDATE | Review | NO | `FORBIDDEN_PRESENTATION_PENETRATION`: horn × Plate H 101.071, Plate A × ultrasonic 51.250, Plate A × Plate H 12.955, horn × ultrasonic 2.026 mm³; dependency on S07 |

Preview checks the pack runs before a step may play: an M7 recipe for every part the closure newly places except the one workpiece, every earlier part at its closure pose, every named part in the tray scope, a guided camera.

## Manual panel

Source: `picarx-companion/tools/content-pipeline/documentation-source-lock.json` (status VERIFIED, bound to the booklet's SHA-256 `2f4ea3ae…`), the record the Setup reference uses: printed step → `pdfPage` and `normalizedRect` per board. S01–S04 have separate Zero 2 W panels; S05–S09 are shared. `ui/manual-map.ts` returns only a VERIFIED/PASS mapping; `ui/ManualPanel.tsx` renders exactly that rectangle at runtime with pdf.js (viewport offset, nothing else drawn) through the shared byte-verifying loader `lib/v40-pdf.ts` (moved out of `PdfViewer`, so the Studio imports no Setup persistence). No page number or crop was invented and no page image is stored (a unit test checks the tracked tree). The drawer shows the panel with an Enlarge view; the step's source intent (parts, hardware, this board, tools, orientation, cautions, connection) is quoted from `steps/source-intents.json` and `runtime-registry.json`.

## Inspection

Pure functions in `motion/inspect.ts`, composed by the frame driver, never written anywhere:

- **Isolate**: keeps the selection (with a chosen conflict pair), else a review step's named parts, else the step's parts; hidden parts move to layer 1, which the camera, the raycaster and the shadow pass all skip (a hidden part cannot be picked).
- **Ghost others**: the same set kept; everything else uses the board's own ghost materials.
- **Explode**: offsets scaled about the state's centre (0.35 across, 0.75 up from the state's base), so stacks open in order and nothing goes through the floor; weighted by each part's approach progress, so playback and seeking stay continuous; off returns the exact closure poses.
- **Deck clip**: renderer clipping on the board's materials, intersected with a guard plane past the tray, so the tray is never cut; cut-height slider, default 6 mm above Plate A.
- A slim rail on the left (O, G, E, C) with pressed states and one Reset; Escape keeps its one-action order (enlarged manual, then selection or pair, then fullscreen).

## Cameras

`stage.json camera.steps` for S00–S09, each naming its subject (tray, state, new, parts, placed-parts, tray-parts, focus), judged by rendering every state on both boards: S00 the tray from the side at 58°; S03 the Pi's connector end; S05 a low rear quarter where the motors are; S06 the battery beside its tape tiles in the tray; S07 low enough to see the battery under the deck; S09 the candidate's front. The camera's frame is the canvas area the panels leave uncovered (`setViewOffset`), eased as panels open and close; the camera and its target never move for it, so F7 holds. Input yields to manual; Resume guided view returns.

## Animation

Tracks follow what each closure newly places (the S07 battery, introduced in S06, moves in S07); a review step has no timeline. Unit tests on both boards for S01–S06 and S08: the end state is the closure pose object itself; the start is the previous closure with only the newly placed parts in the tray; any order of seeking gives identical poses; S07 and S09 open on their recorded state (S09 parts in the `candidate` phase).

## Blender presentation

Rebuilt with `studio.mjs blender --render` from pack `466de892…`: `.blend` and `presentation-receipt.json` carry presentation `48f88ae36d12…`; reference render `digital-twin/presentation/blender/renders/466de8923467-48f88ae36d12-rpi5-S02.png` (the S02 hero, as before; the corrected front-deck rows are visible). `studio.mjs check`: PACK INTEGRITY PASS, SOURCE FRESHNESS FRESH, PRESENTATION CURRENT, exit 0; `blender --check` PASS. The self-test passes 11 of 11 when given the Studio 1 `.blend` (its first two checks need unowned objects, as its header says; run without it they fail by construction, which the first run in this session did). Blender applied materials, lights and the camera only; the geometry change came from the CAD source.

## F1–F11

| Finding | Still closed | Guard |
|---|---|---|
| F1 closure and geometry binding | YES | `sources.test.ts`; pack checks `closure-binding` and `tessellation-binding` on chain `s2-01`; freshness FRESH, with the tray's new records as inputs |
| F2 Studio navigation outside Setup persistence | YES | browser M3 persistence test; `isolation.test.ts` now also forbids `progress-store` and covers the shared booklet loader (moved out of `PdfViewer` for this reason); legacy suite |
| F3 variant-safe selection | YES | browser F3 tests; new: a common tile keeps its selection, and every step switches boards in both directions with no error |
| F4 display-check binding | YES | Pi 5 record regenerated for `s2-01`; `sources.test.ts`, `pack.test.ts`, `test_studio_fidelity.py` |
| F5 runtime pack validation | YES | contract `picar-studio-pack/3`; `pack-contract.test.ts` (6 new negative cases) |
| F6 presentation identity | YES | CURRENT after the rebuild; `presentation.test.ts`; self-test 11/11 |
| F7 manual camera lifecycle | YES | browser test (resize, DPR, fullscreen) passes with the framing area, which changes only the projection; new: a click keeps the guided view, a drag yields |
| F8 one Escape, one action | YES | `escape.test.ts`; browser tests; manual overlay and conflict pair added to the order; native: selection cleared, then fullscreen left |
| F9 honest instrumentation | YES | `perf.test.ts`; browser test (its isolated redraw is now a selection: hiding the drawer now animates the framing area, which is active time) |
| F10 GPU ownership | YES | `resources.test.ts` (style materials, tiles, pick targets released; source material never mutated); browser six-switch test |
| F11 display-vs-checked identity | YES | browser inspector test; the inspector adds definition, instance, inventory and the record name |

## Validation

| Command | Result |
|---|---|
| `node digital-twin/tools/studio/studio.mjs check` | RUN / PASS: integrity PASS, freshness FRESH, presentation CURRENT, exit 0 (evidence 10) |
| `node digital-twin/tools/studio/tray-audit.mjs` | RUN / PASS: invariant HOLDS on both boards (10, tray-audit-after) |
| `node digital-twin/tools/studio/studio.mjs blender --check` | RUN / PASS (10) |
| `presentation-selftest.mjs` with the Studio 1 `.blend` | RUN / PASS, 11 of 11 (12) |
| `pnpm typecheck` | RUN / PASS (20) |
| `PICAR_ALLOW_PACKAGE_BUILD=1 pnpm test:unit` | RUN / PASS, 233 of 233 in 21 files (21; 143 at the remediation) |
| `pnpm test:browser` (Chromium and WebKit, M3) | RUN / FAIL — EXPLAINED: 89 passed, 2 failed, 1 skipped. Both failures are `preservation.spec.ts:38` (expected 1, received 2: the legacy-mode PDF bookmark assertion this M3 configuration fails by construction, as at Studio 1 and the remediation); the skip is the WebKit physical-Escape case. Every Studio test passed in both engines, including the runtime tray census (every slot visible, smallest 15–18 px) (22) |
| `npx playwright test -c playwright.legacy.config.ts` | RUN / PASS, 10 of 10 (23) |
| M7 source mode, chain `s2-01`, frozen M4 environment | RUN / FAIL — EXPLAINED: 981 passed, 137 skipped, 12 failed; the 12 are the installed-wheel `site-packages` guards (24) |
| `test_studio_fidelity.py` (in the M7 run) | RUN / PASS, including the new Plate A rows test |
| `pnpm tauri build --debug --bundles app` | RUN / PASS (25) |
| Native checks, 27 | RUN / PASS (26) |

## Native

The final debug bundle (pack `466de892…`) was driven through 27 checks in native fullscreen: launch and relaunch fitted and centred (1123 × 704 and 1121 × 704 in the 1168 × 733.5 work area), fullscreen in and out, the tray, S01, S03, S06, S07 Review (Space does not play), S08 with its warning, S09 with a conflict pair, the Zero 2 W, ghost, explode, deck clip, the enlarged manual, a 3D selection and the inspector, the performance overlay, drawer collapse, Escape twice, Resume guided view, group framing, and leaving and re-entering the route. Two defects found here were fixed and covered by a browser test: tile edges (`LineLoop`, raycast within one metre) caught clicks meant for parts, and a click that only selected switched the camera to manual. Navigation used only Studio routes and Home, so the setup record was not written. An earlier pass was disturbed by a Terminal window that screenshots hide standing in front of the app; the final pass ran in fullscreen on its own Space.

## Performance

Remediation metric semantics (active frames only), native fullscreen 1168 × 729, DPR 2, 60 Hz:

- S02 replay: 60 fps over 120 active frames, mean 16.7 ms, p95 17.0 ms, display 16.0 ms, 236 draws, 172,802 triangles (remediation: p95 18.0 ms, 172,122; the difference is Plate A's added hole).
- S05 replay (14 parts): 60 fps, mean 16.7, p95 18.0, 269 draws, 214,558 triangles. S04 replay with ghost and explode: 60 fps, p95 18.0, 251 draws. With the deck clip: 60 fps, p95 18.0.
- Load: manifest 3 ms, GLB 22 ms, verify 6 ms, decode 4 ms; page start to canvas 374 ms, first render 375 ms, first frame drawn 409 ms.
- Not met: orbiting the whole tray at DPR 2 in the app's WKWebView. The governor steps to DPR 1.5 (60 fps there) and back to 2 on the step views. GPU Chromium and Playwright WebKit hold 60 fps at DPR 2 on the same view (headless, without window-server compositing); the drawer and tool toggles are ruled out; the cause is not isolated. Studio 4 owns the native frame budget.

## M7 status

`G-INSTRUCTIONAL-ASSEMBLY` BLOCKED, admitted 0/58 (rpi5 0/29, rpi-zero-2-w 0/29). S07 BLOCKED on `UNFRAMED_TOUCHED_CABLE_END` (`PX-V40-CONN-07-COMMON-BATTERY`). S09 refused by the unchanged overlap check (101.071, 51.250, 12.955, 2.026 mm³); the prepared candidate is not adopted. G-CAD and G-GEOMETRY untouched. M8 authorization NO. `closure.py` and `closure_verify.py` unchanged. Display readiness, inspection transforms, the manual panel and the UI write nothing to any M7 path; the only M7-owned changes are the Plate A correction and what it forces, in their own commit, listed in `HANDOFF_M7_REMEDIATION.md`.

## Privacy

No private photograph, its folder or the vendor STEP entered a tracked file, the pack, the `.blend` or the bundle (evidence 29). The calibrated photograph was read for measurement only; its scratch copies were deleted; the review carries model-frame millimetres and the photo's name and SHA-256. The enlarged-manual capture is not committed (it would copy a booklet panel). Native captures show the app window only.

## Captures

`docs/implementation/evidence/studio-2/captures/`: `native-01-tray-rpi5-fullscreen`, `native-02-rpi5-S01`, `native-03-rpi5-S03`, `native-04-rpi5-S06`, `native-05-rpi5-S07-review`, `native-06-rpi5-S08-dependency`, `native-07-rpi5-S09-conflict-pair`, `native-08-zero2w-S02`, `native-09-rpi5-S04-ghost`, `native-10-rpi5-S04-explode`, `native-11-rpi5-S04-deck-clip`, `native-13-rpi5-S04-inspector`, `native-14-rpi5-S05-fullscreen-product-view`, `native-15-perf-S02-replay`. Reference render: `digital-twin/presentation/blender/renders/466de8923467-48f88ae36d12-rpi5-S02.png`.

## What to look at first

1. The tray (`native-01`, or open the Studio): count the fasteners against your bag with Fasteners → Frame; the six tiles say which pieces have no 3D shape and why.
2. S08 (`native-06`): both horn-screw pairs now have two holes between them, as your plate does.
3. S09 (`native-07`): pick each conflict pair and see where the candidate collides.
4. Explode and ghost on S04 (`native-10`, `native-09`): does the exploded stack read like the booklet?
5. S06 and S07 (`native-04`, `native-05`): the steps that cannot animate say so; judge whether that reads as intentional.

## Remaining issues

- Tray orbit at DPR 2 in the native window (above).
- The pan-hub screw holes keep the traced 1.4 mm diameter; the photograph measures 1.69 mm (M7 work, recorded in `HANDOFF_M7_REMEDIATION.md`).
- S03's camera ribbon and S06's tape have no geometry, so those steps do not move; they are tiles by design.
- S07's battery lead and S09's refused candidate are M7 content, unchanged.
- From the remediation, unchanged: the S09 refusal binds to the verifier by name; generator code is outside freshness; `preservation.spec.ts:38` fails in the M3 configuration by construction; a right-button pan that starts over empty space clears the selection on macOS; WebKit leaves element fullscreen on a physical Escape itself.

## Studio 2 status

STUDIO 2 COMPLETE. The tray audit is reconciled (no silent omissions on either board); every printed step S01–S09 opens on both boards, S01–S06 and S08 as Preview and S07 and S09 as Review; the manual panel, inspection tools and authored cameras work; animation endpoints are exact; F1 to F11 stay closed; the native pass passed. The owner's own visual judgement is still to come (above), and the tray-orbit pixel ratio is recorded for Studio 4.

## Commits

On `studio/s2-all-steps`, from `a26592259dcd`, pushed to `origin` for review (not merged; the eight Studio 1 remediation commits it builds on were pushed with it):

| Commit | Content |
|---|---|
| `5a92041` | M7 review checkpoint: Plate A pan-hub screw holes as two mirror-image rows of four (M7-owned paths only) |
| `7b4f8a7` | Studio: the complete tray, step modes, cameras, pack contract 3, pack `466de892…` |
| `98edfc0` | Studio: every step on both boards, review states, manual panel, inspection, picking and camera fixes |
| `38999a6` | Studio: Blender project and reference render, presentation `48f88ae36d12…` |
| (this commit) | Design docs, evidence and this handoff |

## Studio 3 kickoff prompt

Run it only after the owner has reviewed Studio 2 (the five items above) and said to go on.

```text
STUDIO 3 — BUILD ALONG WITH THE REAL CAR IN THE ASSEMBLY STUDIO

IDENTITY AND SCOPE
Repository /Users/danny/Documents/Apps/PiCar: a PiCar-X (SunFounder Z0104V40) digital twin with a React/Tauri companion app, a personal single-user tool on the owner's Mac. Deliver Studio 3 as defined in docs/digital-twin/ASSEMBLY_STUDIO_PLAN.md ("Studio 3 — build along with the real car"): in the companion's #/studio, for rpi5 and rpi-zero-2-w, the owner can (1) work in a session of the accepted M3 session layer, one per board, the Studio's step kept as the session's review step through the existing bookmark action on step change only; (2) record a step as physically done with the existing complete command, from an explicit control whose success is shown only after the committed acknowledgment; (3) attach a private photo to a step as an observation record (photo SHA-256, step ID, variant, Studio packId, and the geometry and pose source hashes of the instances shown), bytes in the app data directory under evidence/<sessionId>/, never in the repository, a pack or the bundle; (4) export chosen observations with their sidecar JSON as a local zip to a destination the owner picks. rpi4 stays PRESERVED_NON_TARGET.
Authorized: local frontend builds, type checks, browser tests, the coordinated dev server, bounded Tauri debug builds and native testing, local commits staged by explicit path. Not authorized: pushing unless the owner asks, any M7 acceptance claim, M8 work, reading or changing the owner's session database or setup record (tests use disposable sessions and temporary storage), camera capture or automatic photo verification.

WHAT ELSE IS IN FLIGHT
M7 instructional assembly is BLOCKED (G-INSTRUCTIONAL-ASSEMBLY 0/58; S07 blocked on UNFRAMED_TOUCHED_CABLE_END for PX-V40-CONN-07-COMMON-BATTERY; S09 refused at 101.071, 51.250, 12.955 and 2.026 mm³). M7 owns digital-twin/cad/twin_cad/assemblies/, digital-twin/cad/tests/test_m7_*.py, digital-twin/assemblies/v40/presentation/instructional/, digital-twin/validation/expected/m7/, docs/implementation/M7_* and docs/implementation/HANDOFF_M7_REMEDIATION.md; change nothing there. Studio 3 needs no geometry or pack change; if the pack must be rebuilt, rebuild the Blender project after it so presentation stays CURRENT.
One integration owner per working tree: before writing, confirm no other Claude or Codex session is writing here (pgrep -fl "claude|codex", then lsof -a -p <pid> -d cwd for each; list files modified in the last hour outside node_modules, target and .git); if one is, stop and say so.
Cut branch studio/s3-build-along from studio/s2-all-steps at its last commit. If it exists, inspect what landed and continue; do not restart.
Do not start Studio 4 (release polish, keyboard-only operation, adaptive quality, the native frame budget) even where you see its issues.

STARTUP ORDER
1. Read CLAUDE.md at the repository root, then docs/digital-twin/ASSEMBLY_STUDIO_PLAN.md and ASSEMBLY_STUDIO_PIPELINE.md, then docs/implementation/HANDOFF_STUDIO_2.md.
2. Run git status --porcelain | head -80, git log --oneline -12, git branch --show-current.
3. Run node digital-twin/tools/studio/studio.mjs check from the repository root. Expect packId 466de8923467aca572814e543467268e420d5a668cd035ee92a5fbe64a8a9130, integrity PASS, freshness FRESH, presentation CURRENT (48f88ae36d12…), exit 0. Freshness reads UNVERIFIABLE if the ignored chain run digital-twin/generated/studio/chain/s2-01 is gone; regenerate under a new label before relying on readiness.
4. Read the session layer before designing: picarx-companion/src/features/assembly-session/store.ts (createSession, loadSession, sessionAction, newId), commands.ts (applyEvent, the complete and bookmark actions, completed, active), accepted.ts and contexts, the generated contracts (AssemblySession.observationIds and the observation types in src/generated/twin/contracts.d.ts), src/platform/repository.ts and the browser and tauri implementations, and src/pages/Assembly.tsx, which already records completion (a statement plus every verification rule checked) and exposes the bookmark action (commands.ts, kind 'bookmark', sets reviewStepId) as "Save review bookmark".
5. Read docs/implementation/M3_PUBLICATION_PLAN.md and the M3 persistence handoffs before any change to how the app stores files.

WHAT TO SETTLE RATHER THAN INHERIT
- The Studio's isolation. Today tests/studio/isolation.test.ts forbids any Studio module from importing assembly-session, progress-store, a platform repository or a native command, because Studio 1 and 2 must not record progress. Studio 3 changes that on purpose: give the Studio one narrow adapter module that alone talks to the session layer, keep playback, scrubbing, selection, inspection and board switching unable to write (the test should prove that), and rewrite the isolation test to say exactly which module may import what.
- Completion semantics. Reuse the existing complete command and its rules (statement, verification rule IDs) rather than a Studio-only shortcut; a Review step (S07, S09) may be recorded physically done by the owner, but the Studio must not imply M7 accepted it.
- Photo storage. Writing into the app data directory probably needs a Tauri file-system capability. src-tauri/capabilities/default.json, tauri.conf.json, package.json and vite.config.ts are bound by the publication coordinator: changing one means archiving the prior generation and running pnpm content:build once with no dev server running (M3_PUBLICATION_PLAN.md). Decide the smallest capability that serves the feature and follow that procedure.
- The observation record. The contracts already carry observationIds on the session; decide whether the observation itself is a new contract record or an existing one, and how it names the pack and pose hashes so a later pack shows it as "taken against an earlier revision", not as wrong (ASSEMBLY_STUDIO_PLAN.md, "Adding steps after S09", item 4).
- Native persistence mode. The debug bundle runs legacy persistence by default; M3 persistence is pnpm tauri dev --config src-tauri/tauri.m3.json. Decide which mode Studio 3 is tested and shipped in, from the M3 records, not by assumption.

CONSTRAINTS
- Studio URLs are never remembered as the Setup route (F2); bookmarks are written on step change only, never per frame.
- Final poses come only from M7 closures through the pack. Blender never remodels geometry.
- No useEffect in React components; follow the existing patterns (ref callbacks, stores, frame-loop adoption of owned resources).
- Private photographs never reach tracked files, a pack, the bundle or test fixtures; tests generate synthetic images.
- F1 to F11 must stay closed (HANDOFF_STUDIO_2.md lists each guard).
- Start the dev server only with pnpm dev, and clear dead leases with pnpm content:recover --apply before and after each browser run (Playwright starts its own server).
- Keep the Studio's dark chrome and its tokens in picarx-companion/src/styles/studio.css.

VERIFICATION
Report each check as RUN / PASS, RUN / FAIL with its output, or NOT RUN; never call an unrun check passed. Logs to docs/implementation/evidence/studio-3/.
- From picarx-companion: pnpm typecheck; PICAR_ALLOW_PACKAGE_BUILD=1 pnpm test:unit; pnpm test:browser (Chromium and WebKit; preservation.spec.ts:38 fails in this M3 configuration by construction); npx playwright test -c playwright.legacy.config.ts.
- node digital-twin/tools/studio/studio.mjs check: integrity PASS, freshness FRESH, presentation CURRENT; node digital-twin/tools/studio/tray-audit.mjs: HOLDS.
- Session tests on disposable sessions: complete and undo from the Studio, bookmark on step change, an observation saved and exported, nothing written by playback or selection, a session per board.
- Native: pnpm tauri build --debug --bundles app, then the session flow on both boards in the persistence mode chosen above, with a synthetic photo; capture the app window only.

CLOSE-OUT
1. Commit Studio 3 on studio/s3-build-along by explicit path (never git add . or -A), nothing under .claude/, no attribution trailers; do not push unless the owner asks.
2. Update ASSEMBLY_STUDIO_PLAN.md and ASSEMBLY_STUDIO_PIPELINE.md to the current design only.
3. Write docs/implementation/HANDOFF_STUDIO_3.md: the state at close, the decisions settled above with their reasons, validation, privacy, remaining issues, and the Studio 4 kickoff prompt.
4. Do not start Studio 4. Do not call any Studio work M7 acceptance.
5. Print last: the verification table, the capture paths, what the owner should check first on the real car, and the Studio 4 kickoff prompt.
```
