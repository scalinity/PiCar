# Assembly Studio 1 handoff

Studio 1 is a checkpoint on `studio/s1-assembly-studio`, followed by the M7 review checkpoint and pushed for external review. It is a presentation slice, not M7 acceptance: `G-INSTRUCTIONAL-ASSEMBLY` stays BLOCKED at 0/58, and the M7 work it reads is committed for review, not accepted (`HANDOFF_M7_REMEDIATION.md`, "Studio 1 changes to M7-owned paths").

## State at close

- Pack `2c1e54e477106b6b00dd986bd6e8ac5d056da50523ba27bf79e3cbf86be6289b` from source-mode chain run `s1-04`; `studio.mjs check` reports no problems.
- Operable on both boards: the parts tray, S01 and S02. S03–S06 and S08 are `PREVIEW_SOURCE_REVALIDATED` and wait only on `stage.json` `operableSteps` (`[0, 1, 2]`). S07 is `PREVIEW_BLOCKED_RELATION` (`UNFRAMED_TOUCHED_CABLE_END`, `PX-V40-CONN-07-COMMON-BATTERY`); S08 carries the warning that previewing it does not certify S07. S09 is `REVIEW_REFUSED_CANDIDATE` with four conflicts on rpi5: HORN-PAN × PLATE-H 101.07 mm³, PLATE-A × ULTRASONIC 51.25 mm³, PLATE-A × PLATE-H 12.95 mm³, HORN-PAN × ULTRASONIC 2.03 mm³.
- Blender 5.2.2 LTS project `digital-twin/presentation/blender/picar-studio.blend`; reference render `digital-twin/presentation/blender/renders/2c1e54e47710-rpi5-S02.png`.
- Runtime dependencies: `three` 0.186.1, `@react-three/fiber` 9.8.1; dev `@types/three` 0.186.0.
- Toolchain at close: Node 26.10.0, pnpm 10.34.6, Rust 1.99.0, uv 0.12.21, CAD Python 3.12.14 (uv-managed). pnpm stays on 10.x: pnpm 12 ignores the `pnpm.onlyBuiltDependencies` field in `package.json` (the allowance for esbuild's install script), so moving to it means moving that setting out of the publication-bound `package.json`.
- Native macOS debug bundle: the header button enters and leaves native fullscreen; Escape leaves it (AppKit consumes Escape's keydown in a native fullscreen window, so the Studio also acts on keyup); with a part selected, the first Escape clears the selection.
- Measured in native fullscreen, 1168 × 729 CSS px at DPR 2, during the S02 transition: 57 fps, 17.5 ms frame, p95 23.0 ms, 236 draw calls, 172,122 triangles; 418 ms from load to first frame (GLB 21 ms, decode 5 ms).
- Captures of the native app: `docs/implementation/evidence/studio/captures/native-01` to `native-06`.
- Known findings kept visible in the drawer: the detailed Pi 5 overlaps the USB microphone accessory by 449 mm³; standoff studs touch the mounting-hole walls by up to 2.8 mm³.

## Checks at close

Rows marked "previous toolchain" ran before the update to Node 26.10.0, uv 0.12.21 and Rust 1.99.0; the others ran after it.

| Check | Result |
|---|---|
| `pnpm typecheck` | RUN / PASS |
| `PICAR_ALLOW_PACKAGE_BUILD=1 pnpm test:unit` | RUN / PASS, 79 of 79 |
| Frozen CAD environment rebuilt with uv 0.12.21; `test_toolchain.py` and `test_studio_fidelity.py` | RUN / PASS, 60 of 60 |
| `pnpm test:browser` (Chromium and WebKit, `VITE_M3_ENABLED=1`), previous toolchain | RUN / FAIL: 44 passed, 2 failed, both `preservation.spec.ts:38`, the legacy-mode PDF assertion that M3 mode cannot satisfy (the spec, both configs, the viewer, the progress store and the session store are unchanged since `d8b95f2`); every Studio test passed |
| `npx playwright test -c playwright.legacy.config.ts`, previous toolchain | RUN / PASS, 8 of 8, including the PDF assertion |
| `node digital-twin/tools/studio/studio.mjs check` | RUN / PASS |
| `pnpm tauri build --debug --bundles app` | RUN / PASS |
| M7 source-mode pytest (all `test_m7_*`, `test_toolchain`, `test_studio_fidelity`), previous toolchain | RUN: 979 passed, 137 skipped, 12 failed, all 12 the installed-wheel `site-packages` guards that fail in source mode by design |
| Native fullscreen, Escape, S02 transition, inspector, previous toolchain | RUN / PASS (by hand, captures above) |

## Next session prompt

```text
STUDIO 2 — COMPLETE S01–S09 FOR BOTH BOARDS IN THE ASSEMBLY STUDIO

IDENTITY AND SCOPE
Repository /Users/danny/Documents/Apps/PiCar: a PiCar-X (SunFounder Z0104V40) digital twin with a React/Tauri companion app, a personal single-user tool on the owner's Mac. Deliver Studio 2 as defined in docs/digital-twin/ASSEMBLY_STUDIO_PLAN.md ("Studio 2 — complete S01–S09 for both boards"): every printed step S01–S09 opens in the companion's #/studio for rpi5 and rpi-zero-2-w; S03–S06 and S08 play as Preview instruction; S07 and S09 open in review mode; the drawer shows the printed manual panel, the part list, limitations and the M7 status; inspection adds isolate, ghost others, explode around the step and a deck clip plane. rpi4 stays PRESERVED_NON_TARGET.
Authorized for this assignment: local frontend builds, type checks, browser tests, the coordinated dev server, bounded Tauri debug builds and native fullscreen testing, Blender command-line automation, pinned frontend dependencies where a feature needs one, and local commits staged by explicit path. Not authorized: pushing unless the owner asks for a review push, any M7 acceptance claim, M8 work, changes to the M3 session store, reading or changing the owner's session database.

WHAT ELSE IS IN FLIGHT
M7 instructional assembly is BLOCKED (G-INSTRUCTIONAL-ASSEMBLY 0/58); its work is committed on this branch as a review checkpoint, not accepted. M7 owns digital-twin/cad/twin_cad/assemblies/, digital-twin/cad/tests/test_m7_*.py, digital-twin/assemblies/v40/presentation/instructional/, digital-twin/validation/expected/m7/, docs/implementation/M7_* and docs/implementation/HANDOFF_M7_REMEDIATION.md. Change nothing there except what a Studio change forces (an additive fidelity revision, or an M7 test assertion that a store change invalidates); record each in HANDOFF_M7_REMEDIATION.md and commit it separately from Studio files. Never reset, clean or stash those paths. Studio 1's fidelity revisions and the Pi 5 display model live there; HANDOFF_M7_REMEDIATION.md, section "Studio 1 changes to M7-owned paths", lists them.
One integration owner per working tree. Before writing anything, confirm no other Claude or Codex session is writing here (pgrep -fl "claude|codex", then list files modified in the last hour outside node_modules, target and .git); if one is, stop and say so.
Cut branch studio/s2-all-steps from studio/s1-assembly-studio. Never check out codex/m7-instructional-assemblies: it lacks the tracked Studio files and the plate-generator change the Plate A fidelity revision rebuilds through.
Do not start Studio 3 (session ledger, owner-recorded completion, photos) or Studio 4.

STARTUP ORDER
1. Read CLAUDE.md at the repository root: the geometry fidelity bars and the rule that the M7 overlap checks are never weakened.
2. Read docs/digital-twin/ASSEMBLY_STUDIO_PLAN.md and docs/digital-twin/ASSEMBLY_STUDIO_PIPELINE.md in full, then docs/implementation/HANDOFF_STUDIO_1.md "State at close".
3. Run git status --porcelain | head -80, git log --oneline -5 and git branch --show-current. Expect the M7 review checkpoint at the tip of studio/s1-assembly-studio, after the Studio 1 checkpoint, with M7's paths tracked apart from the superseded evidence .gitignore excludes.
4. Run node digital-twin/tools/studio/studio.mjs check from the repository root. It must print packId 2c1e54e477106b6b00dd986bd6e8ac5d056da50523ba27bf79e3cbf86be6289b with problems [] before anything changes; if not, stop and report what differs.
5. Read, in this order: picarx-companion/src/pages/Studio.tsx; picarx-companion/src/features/assembly-3d/ (assets/pack.ts, motion/evaluate.ts, scene/StudioScene.tsx, state/studio-store.ts, ui/StudioChrome.tsx); digital-twin/tools/studio/studio.mjs, especially the "operable:" line that decides step operability from stage.json operableSteps and the display status; digital-twin/assemblies/v40/presentation/studio/stage.json; picarx-companion/tests/browser/studio.spec.ts and picarx-companion/tests/studio/*.test.ts; picarx-companion/src/components/PdfViewer.tsx.
6. Resume rule: if studio/s2-all-steps exists or stage.json operableSteps already extends past [0, 1, 2], inspect what landed (git log, git diff studio/s1-assembly-studio) and continue from it; do not restart.

WHAT TO SETTLE RATHER THAN INHERIT
- Opening review steps. StudioChrome.tsx renders steps 3–9 as inert labels, and Studio.tsx falls back to the last operable step when a later one is requested. Making S03–S06 and S08 operable is a stage.json operableSteps change and a pack rebuild under a new label; the pack build already refuses operability unless the display status is PREVIEW_SOURCE_REVALIDATED. Review mode must open S07 and S09 without offering playback as instruction.
- S07: name blocker UNFRAMED_TOUCHED_CABLE_END (connection PX-V40-CONN-07-COMMON-BATTERY) in the drawer. S08 carries dependencyWarnings text "S07 is not revalidated; previewing S08 does not certify S07"; show it on S08.
- S09: REVIEW_REFUSED_CANDIDATE with candidatePlacements true and four measured conflicts on rpi5 (HORN-PAN × PLATE-H 101.07 mm³, PLATE-A × ULTRASONIC 51.25 mm³ over the scoped budget, PLATE-A × PLATE-H 12.95 mm³ over the scoped budget, HORN-PAN × ULTRASONIC 2.03 mm³). Show the candidate as unaccepted with the pairs and volumes listed; never animate it as an insertion.
- The manual panel. Steps carry only sourcePanel "printed step N", and the plan requires rendering from the locked V40 PDF at runtime, never storing page images. Derive the printed-step-to-page mapping from the repository's own records (how PdfViewer and the Setup Wizard locate the manual); do not invent page numbers or crop coordinates. If no record supports a mapping, stop and ask.
- Zero-solid instances (the S03 ribbon; manifest zeroSolidInstanceIds): list them in the drawer without drawing invented geometry.
- Cameras: add stage.json camera.steps entries for steps 3–9, judging each by rendering it; automation already yields to input with "Resume guided view".
- Inspection: choose the smallest set of isolate, ghost, explode and clip interactions that serves inspecting one step. Explosion is presentation only and is never written back.

CONSTRAINTS
- Final poses come only from M7 closures through the pack; Blender and the runtime never remodel geometry. Fidelity fixes go through additive revisions as CLAUDE.md rule 5 describes, followed by a chain rerun and a pack rebuild with a new label (labels are never reused).
- Never weaken the overlap checks in closure.py or closure_verify.py; a refused step stays refused until the geometry evidence changes. If an M7 test fails because a Studio change altered the store, rewrite the assertion to the property it protects, as the Studio 1 section of HANDOFF_M7_REMEDIATION.md shows, and never relax a gate.
- The Studio route never imports the assembly session store; playback, scrubbing and selection never write progress (tests/studio/isolation.test.ts).
- No useEffect in React components; follow the existing patterns (ref callbacks, studio-store).
- Start the dev server only with pnpm dev (coordinated; never call vite directly) and clear dead leases with pnpm content:recover --apply.
- Private photographs and their folders (docs/PiCar Plate Pictures, digital-twin/evidence/private, digital-twin/cad/source-vault) never reach tracked files, the pack or the bundle; tests/studio/pack.test.ts enforces this for the pack.
- Keep the Studio's existing dark chrome and its tokens in picarx-companion/src/styles/studio.css; the serif is for step titles only.

VERIFICATION
Report each check as RUN / PASS, RUN / FAIL with its output, or NOT RUN; an unrun check is never reported as passed. Write logs to docs/implementation/evidence/studio-2/.
- From picarx-companion: pnpm typecheck; PICAR_ALLOW_PACKAGE_BUILD=1 pnpm test:unit (the packaging test refuses to run without the variable); pnpm test:browser (Chromium and WebKit, about 12 minutes). Extend studio.spec.ts so every operable step on both boards ends exactly on its closure poses and S07 and S09 cannot be played as instruction.
- Also run the legacy-mode config: npx playwright test -c playwright.legacy.config.ts. tests/browser/preservation.spec.ts:38 asserts the legacy localStorage write, and the main config starts the dev server with VITE_M3_ENABLED=1, where the M3 store saves to IndexedDB instead; it fails in the main config by construction (none of the files involved changed in Studio 1) and must pass in the legacy config. Clear dead publication leases with pnpm content:recover --apply before and after each browser run, or the next dev server refuses to start.
- node digital-twin/tools/studio/studio.mjs check after every pack rebuild.
- The M7 source-mode suite, from digital-twin with the frozen M4 environment described in the pipeline doc's Commands section: PICAR_M7_ROOT=<repo> PICAR_M7_SOLUTIONS=<chain>/solutions PICAR_M7_REMEDIATION=<chain>/remediation PICAR_M7_SOURCE_ROOT=<repo> PYTHONPATH=cad <env>/bin/python -m pytest cad/tests/test_m7_*.py cad/tests/test_toolchain.py cad/tests/test_studio_fidelity.py -q -p no:cacheprovider, where <chain> is digital-twin/generated/studio/chain/<label>. Only the 12 installed-wheel site-packages guards may fail.
- Native: from picarx-companion with ~/.cargo/bin on PATH, pnpm tauri build --debug --bundles app, then open src-tauri/target/debug/bundle/macos/picarx-companion.app. Test entering fullscreen, Escape to leave, Escape with a part selected, every step on both boards, and the performance overlay (p). Capture the window with screencapture -x -o -l<windowId>, taking the window id from CGWindowListCopyWindowInfo through osascript -l JavaScript, into the evidence folder.

CLOSE-OUT
1. Commit Studio 2 locally on studio/s2-all-steps: stage by explicit path, M7-root changes in their own commit and never anything under .claude/, inspect git diff --cached --name-only and --stat before committing, no attribution trailers, and push only if the owner asks.
2. Update ASSEMBLY_STUDIO_PLAN.md and ASSEMBLY_STUDIO_PIPELINE.md to the current design only, with no history notes.
3. If anything under an M7 root changed, append the exact files and reasons to HANDOFF_M7_REMEDIATION.md.
4. Write docs/implementation/HANDOFF_STUDIO_2.md with the state at close and the Studio 3 kickoff prompt.
5. Do not start Studio 3. Do not call any Studio checkpoint M7 acceptance or describe S01–S09 as assembly-validated: M7 stays at 0/58 until its own gate passes.
6. Print last: the verification table, the capture paths, what the owner should inspect first, and the Studio 3 kickoff prompt.
```
