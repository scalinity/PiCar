# M3 — durable sessions and reference-first integration

**Final acceptance: PASS.** The real IndexedDB, SQLite and official embedded macOS native targets passed the M3 reference-first contract. This report records the tested candidate on `codex/m3-durable-sessions`, starting at `0b613dc5d079b327f5e631bb3a84bb20267d63c5`. The local acceptance commit is recorded in a separate documentation receipt, after this report is committed. M4 is not implemented. The feature remains opt-in (`VITE_M3_ENABLED=1`, nondefault `m3-persistence`); acceptance does not silently enable it for owner sessions.

The original blocked report, gate and remediation prompt are retained byte-for-byte in `evidence/m3/prior-blocked/`. Original failures and the unauthorized packaging attempt remain part of this milestone's history. Final command, working-directory, environment, exit/count and raw-byte bindings are in `M3_GATE_REPORT.json`; it hashes neither itself nor this report.

## Upstream and preservation

Independent preflight verified M0 `2a934710501d71aecbd8da827925c92e49378661` → M1 `22c85058f9420aaaaf376c5e312915f5b7b5288d` → M2 `8d8d30d0c7b077504916a26d80c211e2fc52c4e2`. M2 subject is `M2: compile reversible V40 semantic graphs`, tree `9d42c12071c15c6472e21954b62aa026ef4f76f1`. The sole entry descendant is a three-file documentation receipt. The original preflight covered 124 M1, 232 M2, 135 adopted G-DATA bindings, all seven prospective deltas, 388 M0 manifest entries and 118 spec allocations. This remediation continued the existing M3 branch and draft; it did not reset owner work.

Current adopted G-DATA and G-GRAPH checks both PASS. Accepted M0/M1/M2 reports, source locks, semantic registry, compiled graphs, compiler and sole TS mechanical reducer are unchanged. The old M1 gate's adopted drift is intentional; M1 acceptance was not rewritten. The 12 original untracked M2 diagnostics and 10 ignored private originals/archive were independently reverified unchanged (`preservation-closure.json`). `git ls-files digital-twin/evidence/private` is empty. No remote write, PR, hardware action, geometry admission or private publication occurred.

Adopted semantic identities remain schema `046808956ce49b8cbe8f1e0e2a8c4f63b250a67f2011e969990fb9a0ef6826e1`, evidence `e00e7825f413a37edeb3c9ac47611fbf790480d6efb71337b5cd219bfd082d5c`, model `01c29e99b8d6fa04689e4316628296bf3a3da422184e3563bf99f5bdce543bd2`. Graphs remain rpi4 `ce9dd71eb9728f1538e2fb311f99450cdafc0df96c91033cf0333e6bec51eac7`, rpi5 `97de264d98dcd9d525b26cac7f211279f446a59352bc822a1d3a68ca267d2665`, Zero 2 W `65d5c89cf2dc2cec53424ac1e689772aee0c788086b6f01eea7efb3576c213c2`: 29 steps, 189/189/186 operations. Original M1 identities are not rebound to adopted inputs.

## Authorization and publication adoption

Owner authorizations 1–3 explicitly allowed bounded publication, noEmit/frontend/source-free packaging, and isolated Rust/SQLite/official WDIO qualification. Builds were limited to disposable source-free packaging fixtures and the dedicated native test target. `PICAR_ALLOW_PACKAGE_BUILD=1` gates the existing isolated packaging fixture; it does not authorize a live production build.

The inspected adoption helper archived the exact prior input manifest, baseline, committed generation, managed roots and recovery generation outside the repository at `/Users/danny/Documents/Apps/PiCar-M3-recovery-92755454-9b69-4ab3-b3f8-c9cc1b6a53f5`. Read-only closure verified all archived receipts and roots. The only upstream content-input delta is `assemblyLauncher: true` on the assembly overlay. Official writer-leased `pnpm content:build` generated the wizard and legitimate manifests; subsequent coordinated builds bound necessary package/Vite/title/test-bootstrap changes with readers stopped. No generation check was bypassed and no source lock was regenerated.

All 63 pages, document navigation/search, 136 images, 17 videos and locked PDF bytes remain unchanged; the generated wizard adds one launcher field. Current `content:check` PASS covers 662 inputs. `package:check` PASS verifies safe mirror/static exclusions. The actual source-free fixture builds passed and verified denied synthetic assets remain outside dist. The final publication receipt separately binds old/new manifests and the current committed generation (`source-publication-closure.json`), instead of pretending old hashes cover new inputs.

The exact Z0104V40 PDF is 11,048,665 bytes, SHA256 `2f4ea3ae3729bfb6bc92f8fdba30f31937f9df2c3a80e5774ef03fb076f386ce`. Source-lock raw SHA256 remains `3f715ec18946e022a1b5633a15e3b3ae3d31576e1fa378d77c375d61c291b06e`; documentation lock is `8ca58014ece62abf765ebdbd767d72611d69eaac39440e06b78769505fd6d0b3`. There is no V33 fallback or owner photo publication. Existing SunFounder notices/rights remain; this milestone grants no additional media redistribution rights.

## Durable repository and physical ledger

One repository port owns aggregate mutations. Real IndexedDB uses a single readwrite transaction across aggregate/event/snapshot/result/import stores. Rust-managed rusqlite 0.32.1/bundled SQLite uses foreign keys, WAL, FULL synchronization and transactional initialization. New commands validate envelope/hash/bounds, graph/model/operation and record references, existing event history, revision/CAS and stored attestation eligibility. Command-result lookup occurs before revision rejection; exact retries return the original acknowledgment, changed reuse rejects, and two independent fresh writers produce exactly one winner.

Native validation independently checks permitted storage mutations: full invalidation and retained attestation sets, checks/dependencies/procedure bindings, result closure, imported histories and cache shape. It rejects rehashed forged geometry/observation state and paths. It does not implement a second mechanical reducer. TS independently replays every loaded/imported event against its exact admitted graph before adoption. Static closed-schema validators are generated from the exact production schemas; no runtime eval/code generation is required under the normal CSP.

The session ledger keeps review/preview separate from physical self-confirmations. Procedure preimages record exact source operation, rule and accepted ledger text (`procedure-preimages.json`). Scoped tilt/pan/steering attestations bind epoch and valid horn operation, are consumed in the same durable confirmation transaction, and cannot be reused. Conservative downstream invalidation retains history and advances affected epochs. Variant forks inherit zero physical confirmations or attestations. A setup badge reconciliation requires a joint proof of all 29 current confirmations. Self-report never proves observed torque, hidden engagement, electrical applicability or actual inventory.

CAS conflict drops the rejected retry, reloads authoritative state and requires another explicit submit; it never merges. Quota/I/O/pending failure retains the exact command ID/payload and last acknowledgment. Corrupt/unavailable recovery is surfaced, not reset to defaults. No per-frame or unload-only persistence is used.

## Legacy, export and recovery

`picarx.v1` is preserved exactly and is neither rewritten nor deleted by M3 adoption. Capture precedes interpretation; closed types/nested values are validated. Source origin/key/raw hash/migration version identifies an atomic raw backup/setup copy/marker/result. Retry and interrupted-before/after-marker behavior are tested. The baseline's parts/assembly completion, power.safe true, servo.ready false, nested calibrate route and PDF page 2 survive as contextual setup data, with zero detailed confirmations/attestations.

Malformed data is quarantined with its raw string. Oversized data is retained in a separate durable import path, with explicit blocking rather than truncation; native raw quarantine has a 64 MiB upper bound, beyond which the original key remains retained and recovery is blocked. Downgrade divergence requires keep-new or separate recovery; both raw versions survive and newer confirmations are not merged away.

Imports are bounded 8 MiB data-only envelopes with closed record families, hashes, complete history/reference/result closure and pinned graph replay. Rehashed root/nested canonical-path injections reject. Existing destinations cannot be overwritten, including imports-only destinations. Explicit recovery uses a separate IndexedDB/database destination and a durable native active-recovery marker; normal startup setup does not collide with it. Browser→desktop→browser transfer preserves the complete canonical export. SQLite-consistent backup includes committed WAL state and restores independently. Unsupported newer schema opens read-only export/recovery; blocked IndexedDB upgrade aborts visibly.

## Reference-first UI and existing shell

Both supported browser engines executed all 29 source steps for all three variants and all 29 physical/procedure/zeroing confirmations, undo, fork, explicit badge reconciliation and restart. Routes show the selected variant, printed instructions, trays/parts/fasteners/tools/warnings and labeled unresolved source tiles. Review/preview URLs never issue physical commands. Part links carry variant/session/disposition context. Additive search retains document heading priority and section destinations. Reference/video round trips retain bookmarks; remote YouTube is labeled network-dependent.

Missing media and PDF failures retain accessible source text. The lazy route boundary exposes recovery/export/reference controls. Keyboard lightbox focus/dismissal/return, heading focus, minimum viewport, dark mode and reduced motion pass. The embedded native fixture launches offline under the exact normal CSP, reloads/resumes, renders the verified two-sheet PDF and reference journey with zero remote resources. No 3D/GPU/camera is required. All seven other wizard stages, four old route families, video/search/PDF behavior and Hermes content pass with the M3 flag off; opted-in regressions also pass. StrictMode does not duplicate commands.

## Actual qualification and counts

| Executed target | Final result |
|---|---|
| Standalone app/tools TypeScript noEmit; static validator/schema type checks | PASS, exit 0 |
| Safe unit suite, including authorized isolated default packaging fixture | 48/48, 6 files; exit 0 |
| Current M1 tests / read-only M2 contracts | 254/254 and 12/12; exit 0 |
| Real shared fault suite | 73 identical PASS outcomes on Chromium IndexedDB, WebKit IndexedDB, native SQLite IPC and actual WKWebView IndexedDB |
| SQLite Rust execution | 6/6 groups; WAL/FK/FULL, real independent writer race, rollback, actual disk-full error, corruption, migrations, committed-WAL backup/restore and all29×3 ledger assertions |
| M3 browser core | 9 unique scenarios per engine: all29 reference/physical plus 7 other flows; affected reruns are overlapping evidence |
| Additional fallback/accessibility | 6/6 total, 3 per engine |
| Existing default app / opt-in existing app | 8/8 and 6/6 total |
| Official native WDIO embedded offline package | 4/4; actual compiled binary, SQLite IPC, reload/resume, transfer, WKWebView IndexedDB and offline PDF/reference |
| Normal/default Rust compilation and scoped persistence compilation | PASS; no test bridge in compiled normal ACL/dependency feature tree |
| Current adopted G-DATA / G-GRAPH / content / package | all PASS |

There is deliberately no additive grand total. The 73 assertions run inside adapter/session tests; domain tests run inside unit totals; affected browser reruns overlap earlier successes. Full M2 114-test/73-rejecting-mutant proofs remain accepted through G-GRAPH, not claimed as newly rerun writers. No M3 input changes the accepted graph/reducer; artifact writers were not rerun blindly.

Native tooling is macOS 27.0/Apple Silicon, Cargo 1.96.1, Node 26.8.2, pnpm 10.33.2, retained Tauri 2.11.5/tauri-build 2.6.3/opener 2.5.4; Rust and Node WDIO plugins are pinned 1.4.0, runner packages 9.32.0. Chromium is 153.0.8010.12, browser WebKit 26.6 and embedded WKWebView 605.1.15. The official path is https://webdriver.io/docs/desktop-testing/tauri/plugin-setup/ . Metadata and formatting did not substitute for execution.

Normal identifier/window defaults and default capability bytes are unchanged. `tauri.m3.json` adds eight bounded local persistence permissions. Test commands/plugins/global bootstrap live exclusively in `m3-native-test`/`tauri.m3-test.json`; release test-feature compilation fails. Test startup requires an incognito webview and a canonical OS-temp `picar-m3-native-...` directory. Default source-free dist contains no test API/bridge strings. Normal CSP has `script-src 'self'`; the final offline native test uses this CSP. No shell/raw SQL/arbitrary filesystem endpoint or camera privilege was added.

## Retained incidents and corrected failures

The initial unapproved unit packaging fixture attempted compilation and exited 2 at tsc before bundling. This remains acknowledged in the original report. Later owner authorization explicitly permitted the bounded fixture; its guard and source whitelist now pass.

The first native launch, before qualification, isolated SQLite but used a shared webview. It captured **one unclassified legacy record** into `/var/folders/_q/nsgwvvj51zlcw71s_yzz0s100000gn/T/picar-m3-native-session-fp8CXSSL/sessions.sqlite3`. No raw bytes were printed/published and the original key was not changed. This excluded database is retained; do not delete or publish it. That launch established no acceptance. The defect was corrected with required incognito isolation; each qualified session uses a newly created canonical temp directory and asserts legacy null/imports zero.

Retained logs also show stale-generation launch rejection, initial Rust/type failures, missing WDIO runner/wrong spec path, reload timeout, offline bootstrap/context initialization failures, standalone validator module interoperability, test timeout/CAS readiness and fallback selector/media request-path errors. Their corrected targets pass. The official WDIO cleanup emits a missing sessionId warning after deleting its session; the four test cases and launcher exit 0. Failures were not relabeled as passes or removed.

## Gate scope, rollback and closure

AC-01/07/08/12 PASS for the actual M3 reference-first scope, together with real adapter fault parity, native prerequisite, migration/import recovery, capability/CSP and source-publication checks. Hardware, camera, geometry admission and production release packaging are NOT_APPLICABLE to M3. Geometry and observed physical equality remain BLOCKED; no self-confirmation changes those facts. M0's historical native spike stays historically BLOCKED; this separately bound M3 native qualification closes its current prerequisite without rewriting M0.

Rollback preserves original `picarx.v1`, raw backups, pre-migration exports, every SQLite/session database and both recovery stores. Disable the M3 UI/nondefault native route rather than delete data. Preserve the current generation before publication rollback, stop readers/writers, restore the exact archived managed roots/input manifest/baseline/committed receipt and its matching prior package/Vite/overlay bindings, verify the coordinator's source/generation checks, then reopen old setup/reference pages. Do not clean/reset private originals or original diagnostics.

After explicit named staging, whitespace/privacy review and a local acceptance commit, the separate receipt records M3_ACCEPTED_SHA and the complete M4-only kickoff. No push/PR occurs. M4 authorization is conditional on this exact PASS plus the local accepted source/artifact commit; this agent stops at the handoff and performs no M4 work.

## Local acceptance receipt

M3_ACCEPTED_SHA = `baddbfe6953237d436cbedb963c6ea88d2960f05`; tree `85d298b7ae906ad3bed5a7752a126279861c9e35`. The separate M3_ACCEPTANCE_RECEIPT.json and HANDOFF_M4.md are documentation-only descendants. The final byte-review helper exceeded its default output buffer on the large synthetic fixture, but the commit proceeded before that helper completed. A subsequent 32 MiB bounded review verified every committed source/evidence binding, privacy exclusions and whitespace. The receipt retains this closure-order mistake; no history rewrite occurred. M4 authorization is now YES under the owner's conditional rule. No M4 implementation occurred.
