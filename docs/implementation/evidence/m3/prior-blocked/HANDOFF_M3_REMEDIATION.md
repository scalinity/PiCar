# Continue M3 only — blocked implementation handoff

Working directory: `/Users/danny/Documents/Apps/PiCar`. Branch: `codex/m3-durable-sessions`. HEAD remains `0b613dc5d079b327f5e631bb3a84bb20267d63c5`; no staged files or implementation commit. Owner M3 implementation authorization is YES. M3 acceptance is BLOCKED. No M4–M14 work, remote write, hardware action, private publication, `useEffect`, Python scripting or unadmitted geometry.

Read M3_REPORT.md, M3_GATE_REPORT.json, evidence/m3/preflight.json, the two M3 authorization plans and the owner request. Reverify the branch/HEAD/status/diff and original checkpoint bindings before editing. All accepted M0/M1/M2 reports/source objects and 12 original untracked diagnostics remain. Do not reset/clean, regenerate accepted M2 results, or treat draft source as acceptance.

## Pending owner decisions

Two async authorization questions were sent; no answer was received in this session:

- Separate noEmit checks, isolated SQLite Rust tests, and one test-only native build/WDIO session with disposable app data (M3_NATIVE_TEST_PLAN.md).
- Coordinated `pnpm content:build` and explicit recorded adoption of the intentional overlay/input-manifest delta, with prior generation/raw exports retained (M3_PUBLICATION_PLAN.md).

Elapsed time and metadata checks are not authorization. The source-free packaging regression separately invokes a frontend build. It now requires `PICAR_ALLOW_PACKAGE_BUILD=1`; obtain explicit owner authorization before setting that flag. Do not run the entire test:unit suite blindly: that existing packaging test caused an unauthorized fixture build attempt, documented in the report. No native build ran. The log contains observed draft TS errors and relocation failures; fixes are unverified by noEmit.

## Current guards and environment

- Default `VITE_M3_ENABLED` is off. The legacy setup facade remains the baseline before adoption; the M3 facade uses acknowledged new data only when opted in.
- Native DB/IPC is compiled only with `m3-persistence`, default off. `m3-native-test` also requires PICAR_M3_TEST_DATA_DIR to be an existing canonical disposable directory under the actual OS temp root, basename starting picar-m3-native-. No WDIO plugin/capability/bootstrap exists yet; do not claim automated macOS qualification.
- Keep identifier com.danny.picarx-companion, current windows, opener and scoped capabilities. Tauri 2.11.5/build 2.6.3/opener 2.5.4 remain locked. New rusqlite 0.32.1/bundled, sha2 0.10.9, serde_json_canonicalizer 0.3.2 and jsonschema 0.33.0 are locked, but compatibility is untested.
- Official embedded-provider source reviewed: https://webdriver.io/docs/desktop-testing/tauri/plugin-setup/ . Pin/qualify both tauri-plugin-wdio and tauri-plugin-wdio-webdriver only behind the dedicated test feature/config. Do not introduce an untested shipping bridge.
- Cargo's executable resolves at /Users/danny/.cargo/bin/cargo. A working-directory call in src-tauri could not resolve bare cargo; use the verified absolute executable rather than change global config.

## First remediation: preserve and adopt the new content generation

Current adopted-upstream and G-GRAPH --check both pass. Current content:check fails INPUT_TAMPER because overlay now adds assemblyLauncher:true while the captured input manifest remains original. The dev server and package:check refuse GENERATION_BINDING: package.json because the old committed generation binds pre-M3 package/Vite/pipeline inputs. This is a real blocked prerequisite; do not bypass verifyGeneration or hand-edit committed.json.

Once separately authorized: stop all readers, archive the old captured input manifest/committed generation/source exports outside managed roots (ignored local recovery storage), verify only the explicitly intended overlay delta against original Git objects, verify locked upstream/shared/PDF and private originals, record a new input-manifest adoption with old/new raw bindings, then run the existing writer-leased generator. Inspect its captureInputs/verifySource/publish protocol first. On failure retain diagnostics and restore/recover the exact old source manifest and whole generation before any reader starts. Never regenerate the source lock on mismatch, fall back to V33 or copy owner photos. The generated wizard receives launcher metadata only through overlay. Verify old pages/indexes/Hermes and all private bytes unchanged except the declared additive wizard field.

The existing source-free packaging fixture now includes an explicit minimal set of cleared canonical schema/graph/registry/search/ledger inputs; it still has no upstream docs checkout or private evidence. Test the amended fixture only with separate build authorization.

## Finish source before acceptance

1. Complete native storage authorization checks. The draft validates bounds/schema/hashes/known model/operation, duplicate-before-CAS, revisions and stored zero eligibility, but exact allowed changes for full invalidation, all confirmation checks/dependencies, procedure dependencies, retained attestation arrays and imports must be tested and strengthened. Reject forged snapshots while retaining TS as the sole mechanical reducer. Verify corrupted current event sequences before append; imported geometry/observations must not be promoted.
2. Complete migration identity return semantics, interruption markers, oversized raw retention and recovery export. Current ordinary malformed/valid raw helpers pass domain tests; oversized input exceeds the normal envelope and is not fully durably quarantined yet. Retain exact original and divergent raw copies. Never rewrite/delete picarx.v1 after adoption or reimport legacy assembly done as detailed work.
3. Complete data-only import/reference/result closure and explicit separate recovery destination handling. Draft restore requires an empty destination; normal startup may create setup first, so browser→desktop transfer and recovery imports need the deliberate nonoverwriting workflow. Reject canonical-path fields even if checksum is recomputed. TS replay must validate complete pinned histories before adoption; native independently validates allowed storage/reference boundaries.
4. Implement stale-conflict reload/new explicit submit without merging; pending/IO/quota retry must retain exact command ID and last acknowledged state. Make migration retry identity and command-result acknowledgments consistent.
5. Build the complete common semantic fault fixture set and native runner, then execute both actual adapters. The draft browser test covers only a subset and did not start. No real SQLite/IndexedDB fault result exists.
6. Complete route error boundaries, all29 UI action coverage, honest checks/zeroing/undo/save failures, restart/resume, keyboard/focus/lightbox/reduced-motion, offline missing-media and all old routes/search/video/PDF/setup regressions. Keep stable session/variant/disposition context and reference/video return bookmarks. URL review must never confirm or change epochs. Verify opt-in default rollback paths.
7. Execute the official native feasibility session with the isolated feature/data directory once authorized. Prove that bridge/capability/frontend bootstrap is absent from normal/default targets and that no test can reach owner data. Manual checklist cannot close automated-native acceptance.

## Evidence and closure

Current successful scoped evidence: 8 session domain tests; 47 total unit tests including those 8 (one packaging failure); 254 M1 tests; 12 read-only M2 contract tests; generated-type drift check; rustfmt; upstream/G-GRAPH. Do not double count the session tests or call them adapter parity. Full M2 replay/mutation tests are artifact writers: rerun in an inspected isolated mirror only if required, preserving original live outputs. The three earlier domain/setup failures and unauthorized fixture build are acknowledged in M3_REPORT.md.

The report and gate bind actual draft paths/results/upstream files and distinguish every required fault target as BLOCKED. Keep fresh command argv/exit/log bindings, adapter versions, fixture hashes and independent restore evidence. Reports cannot include their own hashes. Rerun only affected checks after fixes; current noEmit, browser/native/database/package results are not green.

Closure requires AC-01/07/08/12 plus every applicable real adapter/fault/native prerequisite to pass. Then named-stage only reviewed M3 paths with existing Git identity, excluding original diagnostics, private evidence, runtime caches/agent folders/test bridge/disposable databases. Commit locally only after exact M3 acceptance, record receipt separately, and produce the actual next-milestone handoff without implementing it. No push/PR.

If still blocked, retain a complete M3 remediation report/handoff instead of claiming completion. Rollback preserves legacy raw, session data/exports, prior publication generations and old reference/setup output. Disabling the route does not waive source-generation bindings; a runnable old app requires named restoration of its original package/Vite/overlay bytes while keeping this draft source recoverable. Never delete data to roll back.
