# Studio 4 native release polish — local candidate, NOT READY

## 1. Accepted Studio 3.5 base

Immutable predecessor: `7a698e8145edd9578743aa648a5a37cac641b773`, independently ACCEPTED — READY FOR STUDIO 4. Preflight fetched origin and verified the accepted branch/ref and ancestry. No accepted Studio1–3.5 evidence or commit was rewritten. Existing AGENTS.md and12 historical M2 files remain untracked and unchanged.

## 2. Branch and final source

Branch: `studio/s4-native-release-polish`. Final runtime implementation/build source: `05eac8d7d0a30db53bf54940cdbccc84283631c4`. The documentation/evidence closeout commit containing this handoff follows that implementation; resolve the branch tip for its complete final local SHA, reported in the delivery response. No remote Studio4 HEAD is published because the mandatory offline gate is unverified. The accepted Studio3.5 branch remains frozen.

## 3. Release architecture

Existing React/Tauri/M3 repository, source-mode Studio and accepted F10 ownership retained. No new persistence subsystem, cloud, telemetry, geometry, package, window redesign or engineering admission. Native startup can show reference pages when storage is unavailable; DB commands then return STORAGE_UNAVAILABLE rather than crashing startup. Read-only power input and native WebView first-responder restoration are the only added native capabilities.

## 4. Release build identity

Normal release command, from `picarx-companion/`: `VITE_M3_ENABLED=1 PICAR_ALLOW_PACKAGE_BUILD=1 pnpm tauri build --features m3-persistence --config src-tauri/tauri.m3.json --bundles app -- --locked`. Fresh A3/B3 targets use the same exact source/config; path remapping excludes local build paths. Their executable is arm64,54,108,720 bytes, SHA256 `cba111a7d0133c3f2395512ce885c4678cd04b05d03a3f46288f0b2791818769`. All three regular bundle files and150 frontend inputs match byte for byte. Canonical bundle inventory hash and complete input hashes are in [release build receipt](evidence/studio-4/release-build-final.json) and [inventory](evidence/studio-4/release-bundle-inventory.json). No archive/filesystem metadata or cross-machine reproducibility claim.

Bundle locations are private scratch `release-a3/release/bundle/macos/picarx-companion.app` and corresponding B3. Native journey copy `release-native3/...` has only a disposable identifier plus empty beforeBuildCommand reusing exact normal frontend, executable SHA `60eb75b2f2a6a81a05c5eaccb29eac38e38212fc83bfe9bd82c4e8ea5c7a5ff8`. That exception protects owner storage and is explicitly qualified; normal owner-identifier builds were not launched. Signing is linker ad hoc only, no TeamIdentifier, no Developer ID, no sealed resources/Info.plist binding and no notarization ticket (stapler65). Authorized scope remains unsigned local use.

## 5. Test-only feature exclusion

Production feature is `m3-persistence`; `m3-native-test` and both WDIO plugins are absent. VITE_M3_NATIVE_TEST, PICAR_M3_TEST_DATA_DIR, TAURI_CONFIG and TAURI_DEV_HOST removed from normal build environment. Default capability and M3 overlay retained; Studio adds only allow-studio-power-state and core:webview:allow-set-webview-focus. Production URL query cannot enable `__studio`. P exposes only an observational HUD. Actual executable/asset scan found no `__studio`, `__m3Native`, m3_test_fresh/m3_test_fault or native-test environment marker. Full permission/environment enumeration is in the build receipt. Package/Vite/tauri.conf/default capability are byte-equal to accepted base; no publication generation was required.

## 6. Offline launch/restart

**UNVERIFIED — mandatory readiness gap.** App-scoped sandbox denial prevented macOS LaunchServices/file-extension window startup; a denied network probe alone does not demonstrate an offline native Studio. Both owned failed attempt processes were stopped. Actual Wi-Fi disconnect with automatic90-second restoration was requested; no answer received, so no network setting was changed. Static audit finds bundled shell/manifest/GLB/locked PDF/worker, self fonts, procedural environment and local SQLite/evidence IPC. A native-host socket snapshot found no sockets; WebView processes were not attributed, so this is qualified, not a whole-app network certification. [Offline receipt](evidence/studio-4/offline-test.json). Cold launch, full tray/both S04/manual/HAT/local metadata, still-offline restart and saved-progress return must be performed before readiness or push.

## 7. Keyboard-only coverage

Native keyboard journey covers Studio entry, board/Parts/S01–S09 navigation, drawer, enlarged manual, transport/timeline, semantic list selection, frame/isolate/ghost/explode/clip/reset/guided, fullscreen, statement/checks/complete/undo, native photo picker, observation checkbox/export cancellation and exit. Use accessible lists rather than arbitrary WebGL raycasting. [Coverage and key map](evidence/studio-4/keyboard-coverage.json). Native durable journey provenance is d12; focus correction d0; final05e recovery/OS motion and review views supplement it. Relevant keyboard/persistence code did not change afterward.

## 8. Focus management

Explicit Tab focusability for native WK defaults; visible focus rings; disabled controls skipped. True dialog showModal contains focus and restores opener/live board fallback. Drawer hide moves focus to persistent toggle; route replacement does not strand removed focus. Fullscreen/resize restores only the live already-focused WebView, never activates a background window. Lifetime tests cover retired work/background focus. Actual settled native fullscreen exit restores Tab operation. Immediate Escape during OS enter animation was not counted as an exit PASS. Escape remains manual→selection/review pair→fullscreen, one action per physical press.

## 9. Accessibility and AX

AUTOMATED ACCESSIBILITY: PASS (focused10/10 Chromium/WebKit role/name/state/focus/status cases). NATIVE AX STRUCTURE: PASS / QUALIFIED; named/toggled/disabled controls, board/step Preview/Review, physical progress and selected displayed/checked source information inspected. VOICEOVER OWNER VALIDATION: PENDING. Semantic Parts/step lists and inspector carry equivalent information. No per-frame progress/live-status spam. [Report](evidence/studio-4/accessibility-report.json). No full VoiceOver certification inferred.

## 10. Reduced motion

Actual macOS OS setting tested on final05e release: off→on→off, original preference restored. S04 Replay snaps to unchanged3.2-second endpoint, Playoff; explode/camera/inset transitions snap, orbit damping off. Rewind/explicit endpoints stay accessible. Focused browsers and unit tests cover source endpoint preservation. No closure/recipe/physical-progress change. [Receipt](evidence/studio-4/reduced-motion.json).

## 11. Battery and power-state input

Read-only IOKit IOPS providing source type and NSProcessInfo low-power/thermal state, guarded main window. No level/history/identifiers/telemetry. Initial, activation and30-second refresh only while viewport mounted; discard late results on exit. Actual owner Mac observed AC, low power false, thermal nominal. Physical battery performance UNMEASURED: owner unplug choice requested, no answer. No fake production power injection or physical battery claim. API references: [Apple power source](https://developer.apple.com/documentation/iokit/iopowersources_h/1810316-iopsgetprovidingpowersourcetype), [Apple power notifications](https://developer.apple.com/documentation/xcode/responding-to-power-notifications).

## 12. Adaptive-quality policy

Central deterministic DPR ceilings: AC2, battery/unknown1.5, Low Power Mode or serious/critical thermal1, bounded by backing scale. Existing120-frame governor and600-calm-frame recovery retained; ceiling applies before a sample exists. Existing accepted half steps and Studio3.5 detailed HAT use at1.5 motivate conservative resolution ceilings, not an energy optimum or battery-life claim. Unit tests prove immediate clamp and bounded recovery. Geometry, source poses, materials, lights, detail and semantics unchanged. Optional HUD shows source/reason/ceiling/actual DPR. [Policy receipt](evidence/studio-4/quality-policy.json).

## 13. Owner-Mac measurement methodology

Real production release with disposable identifier, actual pointer drags/playback via native CUA, no JS bridge/injection. Mac17,8, macOS27.2 build26B5091g, internal Liquid Retina XDR/ProMotion120Hz; observed WK active cadence near60Hz. Normal CSS viewport1121×704, fullscreen1168×729, backing2.600 bounded active intervals for core cases; hidden/idle gaps excluded. Record p50/p95/p99/worst and >50/>100ms stalls, actual DPR/draw/triangle/resource figures. Opening P resets the long log; allow HUD polling to settle before reading. No serial published. Final measurements follow full browser/legacy completion; prior implementation observations remain separately source-bound.

## 14. Performance results

[Final native matrix](evidence/studio-4/native-performance-final.json), [CSV](evidence/studio-4/native-performance-final.csv). Prior d12 [JSON](evidence/studio-4/native-performance-pre-focus.json) remains qualified historical evidence, not silently relabeled final. Prior core cases:59.1–60fps, mean16.7–16.9ms, p95 mostly18ms; close zoom25ms/isolated24ms, worst55/53ms with1/2 >50ms stalls, no>100ms. Tray619 draws/1,271,304 triangles; Pi5 S04≈428/1,057,048; isolated HAT65/707,082; Zero276/1,042,368. Prior first-page markers389/435/484ms are tied to that app process, not a same-process warm reentry timer. Initial cold sample was concurrent with builds/browser work and stays qualified. Final process-cold Studio page→canvas454ms/render457ms/frame490ms; warm native action→visible observation615ms includes CUA overhead. Final JSON defines both scopes. Target is responsive near observed WK cadence, bounded stalls/no multi-hundred-ms periodic collapse, not universal display120fps. Battery unmeasured.

## 15. Sustained session and resources

[Resource receipt](evidence/studio-4/native-resources.json). Prior bounded native session used six board↔Parts↔S04 cycles and four exits/reentries plus inspection, drawer/manual/fullscreen/build UI. Warm geometry reaches214 and plateaus; textures4/programs5/materials378/shadow1/environment1 stable across all six cycles. After viewport recreation geometry174/textures4/programs3 stable; initial warm-cache checkpoint excluded. Board-owned materials exclude shared source/floor materials; program6 with clipping is bounded. Host-only RSS333.5→325.1MiB across676seconds; WebView/GPU heaps unavailable. Final source10-minute sustained sample host RSS330.7→334.7MiB (≈4MiB growth), with six navigation checkpoints all214 geometries/4 textures/5 programs and four exit/reentries all174/4/3. Idle retained1 active interval unchanged over110 seconds. These bounded observations cannot exclude all leaks; final-source checkpoints and stall tails are separately recorded. No hours-long stress or battery-life certification.

## 16. Native window polish

Accepted fit-to-work-area centering, overlay/hidden title,1440×900 requested and1100×700 minimum unchanged. Actual viewport is1121×704 on current display; native fullscreen1168×729. App activation, settled fullscreen/restore/focus, native Escape, Command+Q/relaunch, macOS Save panel/file picker and dark appearance exercised. Native window receipt qualifies which properties are source/config audit versus actual observations. No browser chrome in native app; no hidden production test bridge. [Window receipt](evidence/studio-4/native-window.json).

## 17. Release failure handling

Final negative-copy tests: corrupt GLB refuses before canvas, Try again still refuses, companion/local progress available; unavailable disposable SQLite store opens reference pages and disables saves; bad copied PDF explicit Retry refuses; omitted negative fullscreen capability reports refusal. Actual photo-copy permission failure and export collision/cancellation preserve prior disposable evidence. Full cases/provenance in [failure receipt](evidence/studio-4/release-failures.json). No owner DB intentionally corrupted, private original overwritten, silent reset or retry loop.

## 18. Pack and geometry preservation

Pack `a022be99d39570a3805b4ad2cf1c72a14c3bc5b5ff2d9865679d1b01bff47db7`; GLB `ceff9949cf80575e87e56feb0682894c58391ea7e64e1700f6e82f1c3d06cac3`; presentation `a042411e9cc754079ab9c49b3b4bc9d99ab23b42b93e0fa4f81b1e7f401f39d8`; Blender `59fe591f77f3a6b0f0a326a1d6aacc01060483a258635620390866c19d032404`; HAT display `825e2f068d41fac21ca1a32ebeae410f7c5aef4eb5d717b20c22b0c75777abda`; instructional HAT `bbdbbeb758d724c52450902c427c872b6eb78eff59a89b698d76a54d86d8461a`. No digital-twin source/generated/qualification change: S01–S09 placements/recipes/closures, canonical stock and readiness remain accepted bytes. [Preservation](evidence/studio-4/protected-preservation.json); fresh check PASS/FRESH/CURRENT; tray HOLDS156/156 (143 solids/13 tiles), frontier50/47; deeper Blender exit0,problems[]. No ceremonial regeneration.

## 19. Privacy

[Final scan](evidence/studio-4/privacy-final.json): actual normal B3 executable and150 frontend inputs have no private media hash, scratch/workspace/vault marker or native test bridge/command. sessions.sqlite3 is classified functional runtime filename, not owner DB contents.125 private reference/vault files and13 historical untracked files unchanged. Owner DB stat-only0 before/after; never read/opened. Native observations/ZIP/file-panel trees, raw original screenshots and diagnostic paths remain private. Published11 actual-window JPEGs have stripped EXIF and no unrelated desktop. Candidate text scans classify synthetic fixtures before redaction; exact private path literals replaced with aliases after private original preservation. No history rewrite or publication.

## 20. Reviewability

Small structured receipts,150-file input identity inventory, performance JSON/CSV, keyboard/AX/offline/policy reports and≈1MB of11 JPEGs. No duplicated app/GLB transport or private raw evidence. [Evidence entrypoint](evidence/studio-4/README.md). Current candidate is local only; connector-only review of Studio4 remote delta is unavailable until gate closure and authorized push. Existing accepted Studio3.5 transport remains intact; no redo requested.

## 21. Validation

Typecheck PASS. Full unit308/28 files PASS; Rust M3 persistence8/8 PASS. Full final browser141 passed,2 failed,1 skipped(17.9m): RUN / FAIL — EXPLAINED, only accepted preservation.spec.ts raw legacy PDF-key assertions (expected1,received2, both engines). New Studio4 defects are not excused by this baseline. Final legacy10/10 PASS(11.4s); corrected focus/modal regressions16/16 PASS, new polish10/10 PASS. Pack/tray/Blender PASS as above. Failed Rust compile/selector/setup attempts and interrupted browser runs remain preserved and explicitly superseded; do not count them as passes. Native journey uses production features/disposable identifier, with exact source provenance qualifications. [Validation receipt](evidence/studio-4/validation.json).

## 22. Owner visual package

[Owner review checklist](evidence/studio-4/OWNER_REVIEW.md) and [pixel manifest](evidence/studio-4/visual-manifest.json): Parts,Pi5 S01/S02/S04/S07/S09,Zero S04,HAT close/underside,build controls,OS reduced-motion endpoint. Actual app pixels only, no synthetic battery image. Compared native Pi5 guided and accepted Cycles S02/HAT underside render intent for layout/materials/light/floor/labels/panels; no WebGL/Cycles pixel equality claim. Accepted source presentation unchanged. Narrow-screen guided framing can crop chassis near controls; selected HAT inspection exposes the whole board. Technical coherence is not owner approval.

## 23. Owner acceptance

OWNER INTEGRATED-VIEW ACCEPTANCE: PENDING. VOICEOVER OWNER VALIDATION: PENDING. These remain separate human decisions. No self-declared approval, physical certification or automatic visual acceptance.

## 24. Protected M7 status

M7 BLOCKED0/58; Pi5 0/29; Zero 0/29; S07 BLOCKED; S09 REFUSED; G-CAD BLOCKED; M8 NO; rpi4 PRESERVED_NON_TARGET. No weakened overlap/closure check, admission, CAD/display revision or geometry hash change. Physical self-confirmation records owner actions, not engineering acceptance.

## 25. Remaining risks and readiness

**STUDIO 4 NOT READY FOR INDEPENDENT REVIEW.** Exact mandatory gap: actual native network-unavailable cold start and still-offline restart with durable session/photo metadata/manual/HAT remain unverified. Pending network-change approval is not inferred from silence. No push. Battery physical performance unmeasured (allowed practical qualification); full VoiceOver/owner visual acceptance pending. Local app is linker-ad-hoc only; no signed/notarized distribution claim. Host RSS and static dependency audit have stated coverage limits. No known new blocker/high/P2 defect from completed checks; mandatory offline evidence is itself an acceptance blocker. Close that one gate with disposable storage, add evidence, resolve final source/config, then run only justified affected checks and push this branch if ready. Do not regenerate accepted artifacts or start M7/M8.

## 26. Complete focused GPT-6 Pro review prompt

Review PiCar Studio4 only. Repository scalinity/PiCar, branch studio/s4-native-release-polish. Accepted immutable Studio3.5 baseline is7a698e8145edd9578743aa648a5a37cac641b773 (ACCEPTED — READY FOR STUDIO4). Runtime build source05eac8d7d0a30db53bf54940cdbccc84283631c4. Final local closeout tip is the commit containing this handoff plus its evidence; verify its full SHA against the delivery report. REMOTE STUDIO4 HEAD: NOT PUBLISHED, because offline cold/restart is unverified. Do not invent a remote ref, review an earlier branch as Studio4, or accept this local candidate while the mandatory gap remains. If a later authorized closeout supplies a verified remote SHA, use that exact final SHA and verify ancestry to baseline.

Read this handoff, current plan/pipeline and evidence/studio-4/README.md, then audit only baseline..final Studio4 source/test/docs delta and the final-source receipts. Do not redo accepted Studio3/3.5 HAT correctness,42 artifacts,651 transport or historical visual reconstruction. Earlier d12 build/perf evidence is explicitly pre-focus and must not be presented as final05e measurements. Production native journey uses same features/frontend/capabilities with disposable identifier; evaluate that qualification without touching owner data.

Answer all15 questions with PASS/FAIL/QUALIFIED and evidence:

1. Is native release correctly separated from dev/debug/native-test configuration, with M3 persistence and no hooks/commands/capabilities leaked?
2. Does actual native release start and restart fully offline, with full tray/both S04/locked manual/HAT/local metadata? Static assets and failed network-denial launch attempts are not PASS.
3. Does committed local progress survive each controlled restart; do complete/undo/photo/export cancel/bookmarks retain accepted acknowledgment semantics?
4. Can the core Studio workflow be completed keyboard-only through semantic lists and native controls?
5. Are focus/tab/modal/drawer/fullscreen lifetimes deterministic and Escape layers correct without stealing background focus?
6. Are native AX/DOM names/toggled/disabled/board/step/physical/displayed-versus-checked statuses truthful, equivalent to visual meaning and non-spammy? Keep VoiceOver owner validation pending.
7. Does actual OS reduced motion preserve source endpoints/recipes/physical rules and restore owner preferences?
8. Is battery/unknown/low-power/thermal resolution policy deterministic, bounded and non-destructive, with read-only input and no production state-mutating seam? Physical battery is unmeasured, not simulated evidence.
9. Are actual owner-Mac/native binary/pack/power/viewport/cadence/timing claims supported and qualified correctly?
10. Do600-frame active samples, worst/stall tails, sustained navigation/resource checkpoints show no pathological degradation or accumulation? Distinguish native-host RSS from unavailable WebView/GPU heaps.
11. Is high-fidelity HAT detail preserved rather than replaced/degraded for speed?
12. Are pack/GLB/presentation/Blender/HAT/recipes/placements/closures/canonical stock identities unchanged?
13. Do corrupt pack/storage/photo/export/PDF/fullscreen failures refuse clearly and boundedly without destroying progress?
14. Is actual final release bundle and additive Git delta free of private media, owner DB/observations/ZIPs, credentials, scratch/agent/test-runtime leakage? Classify fixture/function literals before redaction.
15. Does M7 remain BLOCKED0/58 (both0/29), S07 BLOCKED, S09 REFUSED, G-CAD BLOCKED, M8 NO, rpi4 PRESERVED_NON_TARGET?

Report actionable findings with priority,file/line,trigger and consequence, then a concise validation/evidence disposition. Full browser141pass/2fail/1skip is FAIL — EXPLAINED for accepted legacy PDF raw-key assertions only; do not extend that explanation to new failures. Owner integrated-view acceptance stays PENDING absent explicit human decision. Require ACCEPTED — STUDIO4 CLOSED only if no blocker/high/P2 or mandatory release-verification gap remains. Current offline gap requires NOT ACCEPTED / NOT READY. Review does not authorize M7/M8, main merge, force push, tags, PR, private-data access, spending or geometry regeneration. STOP after review.
