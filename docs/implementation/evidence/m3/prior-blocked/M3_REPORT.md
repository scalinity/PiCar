# M3 — durable sessions and reference-first integration (blocked draft)

Date: 2026-09-30, America/New_York. **M3 acceptance: BLOCKED. Implementation is partial and uncommitted.** Branch `codex/m3-durable-sessions`, HEAD `0b613dc5d079b327f5e631bb3a84bb20267d63c5`. No local acceptance commit, staging, push, PR, hardware action, camera, geometry admission or private-evidence publication occurred. M4–M14 were not implemented. Native persistence is behind the nondefault `m3-persistence` feature; the UI is behind `VITE_M3_ENABLED=1`. Default launch does not open the new database or adopt legacy state.

## Verified upstream

The initial independent check verified M0 `2a934710501d71aecbd8da827925c92e49378661` → M1 `22c85058f9420aaaaf376c5e312915f5b7b5288d` → M2 `8d8d30d0c7b077504916a26d80c211e2fc52c4e2` ancestry. The exact M2 subject and tree `9d42c12071c15c6472e21954b62aa026ef4f76f1` match. The sole descendant is the three-path documentation receipt, not another implementation acceptance. Initial tracked/staged diffs and diff-check were empty/clean; all 12 original untracked M2 diagnostics remain untouched.

124 accepted M1, 232 accepted M2 and 135 adopted-G-DATA bindings match their corresponding Git objects and raw lengths. M2/adoption working bytes match. All seven prospective deltas match original M1 objects and adopted bytes. All 388 M0 manifest entries match accepted Git bytes. All 118 allocated spec files and the original archive match; all 15 preservation entries (including three archived reports and 12 diagnostics) match. Ten private originals/archive files remain ignored and untracked; their byte hashes occur nowhere in public output. Original source locks, M0/M1/M2 reports, generated content, accepted graph/registry artifacts and ignored publication generations were not regenerated or overwritten.

Read-only `git ls-remote origin refs/heads/main` still resolves to initial public commit `9e54b2fb3199c22f5d5c7cd67c8e4531ab2246f8`. No remote write or fetch changed local refs. Final adopted-upstream and G-GRAPH checks both still PASS, exit 0. Their accepted proof results remain historical; this does not establish M3 acceptance.

## Implemented draft scope

- Shared command/repository/event types, canonical request/snapshot hashing, schema-bound session preparation and independent replay of physical events; the accepted TS mechanical reducer is unchanged.
- Procedure preimages contain exact accepted operation/rule/source-ledger text. Named scoped zeroing records, same-command consumption in the projected ledger, conservative downstream invalidation, epochs, bookmarks and empty variant forks have domain fixtures.
- Real IndexedDB transaction implementation across aggregates/events/snapshots/results/imports, duplicate-before-revision ordering, CAS, quota-error rollback paths and read-only newer-version handling. Actual browser execution is blocked.
- Rust-managed pinned rusqlite 0.32.1 with bundled SQLite, WAL/foreign keys/FULL synchronization, transactional initial schema, command-result lookup, bounded strict JSON/hash validation, graph/operation checks, snapshots, logical exports and SQLite-consistent backup code. No Rust compilation/database execution occurred. This source needs stronger authorization/parity validation before acceptance.
- Raw legacy capture/type checks, quarantine/divergence paths and import markers; original `picarx.v1` is never changed by the opted-in M3 facade. The default pre-adoption facade remains compatible with the old app. Oversized raw data is not yet fully backed up through a separate durable path.
- Lazy Assembly entry, all29 graph-based source instructions/trays/warnings/tools, labeled unresolved tiles, preview/physical separation, source-linked PDF verification/retry, contextual reference/video return links, additive graph-bound search, explicit part disposition context and opt-in old-shell integration. No `useEffect` or 3D/GPU dependency was introduced.
- The canonical overlay has only additive `assemblyLauncher: true` on the assembly stage. The generated wizard output was not hand edited; its new generation remains blocked. The seven other stage IDs, old routes, content and Hermes sources remain.

These are source changes, not a claim that either adapter or the UI passes acceptance. Reference round trips, accessibility, offline execution, restart/resume and actual adapter faults are unverified. The native feature has no WDIO bridge, plugin, test permission or global test bootstrap. No untested WDIO bridge ships. Identifier, native window defaults, opener and capability bytes remain unchanged.

## Actual verification and failures

| Command / target | Actual result |
|---|---|
| Independent inline Node Git/raw/length/preservation preflight | exit 0; upstream facts above |
| `cargo metadata --locked --offline --no-deps ...` | exit 0; read-only feasibility metadata, no compile |
| `pnpm exec vitest run tests/session/domain.test.ts tests/session/rejection.test.ts` | exit 0; 8/8 PASS; final log domain-final.txt |
| `pnpm test:unit` | exit 1; 47 PASS / 1 FAIL / 48 total; existing packaging fixture invoked a build |
| `node --test --test-reporter=tap digital-twin/validation/tests/*.test.mjs` | exit 0; 254/254 PASS |
| `node --test --test-reporter=tap digital-twin/validation/m2/tests/contracts.test.mjs` | exit 0; 12/12 PASS; no artifact writers |
| `node digital-twin/tools/types.mjs --check` | exit 0; generated schema types match |
| `cargo fmt -- ... --check` | final exit 0; formatting only, no compilation |
| `pnpm exec playwright test tests/browser/m3-persistence.spec.ts --project=chromium` | exit 1 BEFORE browser tests; coordinated server rejected GENERATION_BINDING: package.json |
| Current adopted-upstream / G-GRAPH --check | both exit 0 |
| Current content:check | exit 1, INPUT_TAMPER from intentional overlay delta versus preserved input manifest |
| Current package:check | exit 1, GENERATION_BINDING: package.json; old generation retained |
| Standalone noEmit / SQLite tests / native build/session | BLOCKED; separate authorization unanswered |

The successful eight session tests are included in the 47 passing unit tests, not eight additional adapter passes. Full M2 replay/mutation suites write accepted artifacts; they were inspected and not blindly rerun in the live checkout. Their original 114 tests/73 mutants remain bound by the passing M2 gate; a fresh isolated run is still required if later M3 changes affect them.

**Instruction violation:** the existing `tests/publication/packaging.test.ts` invoked `pnpm build` inside a disposable fixture when the full unit suite was run without separate build authorization. This was an implementation-agent mistake, not owner authorization. It exited 2 at tsc; bundling did not run. The log is retained. It exposed both fixture relocation omissions (new canonical source references were absent) and real TS draft errors. The observed source/type issues were edited, but no successful noEmit/build result is claimed. The fixture now copies only explicitly named cleared canonical references and requires `PICAR_ALLOW_PACKAGE_BUILD=1`; that flag may be used only after explicit owner build authorization. The temporary fixture was removed by its existing finally block. No native compilation, real database or live output mutation occurred.

Earlier attempt errors are not hidden: the first session test setup used a wrong relative cwd, the first domain run found a nonexistent registry evidenceHash, and a subsequent domain run timed out from redundant projector replay. These were corrected; the final eight-test result is the current scoped result. Initial rustfmt check reported formatting differences; formatting was applied and the final check passes.

## Why M3 cannot close

1. The dev/publication gate correctly refuses old receipts after intentional package/Vite/overlay changes. Source input manifest adoption and coordinated generation require the separate content-generation authorization already requested. No manifest/committed receipt was changed to bypass failure. See M3_PUBLICATION_PLAN.md. Before proceeding, retain exact old manifest and generations, allow only the explicit overlay input delta, verify locked upstream/PDF/private bytes, and publish through the coordinator with no watcher. If generation fails, restore the prior input manifest and recover the old generation; retain diagnostics.
2. M0 native feasibility remains BLOCKED. The current Cargo lock still lacks both WDIO plugins; the official embedded provider requires them. Metadata/formatting are not native qualification. The separate request for noEmit, isolated SQLite tests and a native test build/session is unanswered. See M3_NATIVE_TEST_PLAN.md. Missing separate native-feasibility paths are not invented; actual authority is M0_REPORT.md Native feasibility, test plan and Cargo lock.
3. Actual adapter parity has not executed. The browser scenario source is preliminary, and the shared native fault-fixture runner is not implemented. Every persistence fault row is BLOCKED on both real targets in M3_GATE_REPORT.json. Unit domain tests cannot substitute.
4. The source still requires an M3 completion/review pass: native strict per-event write authorization for complete invalidation/attestation/dependency/check sets, joint imported-event/reference validation, migration identity replay semantics, oversized raw backup, restore into separate recovery destinations without accidental setup collisions, conflict reload/retry behavior, complete browser/native fault fixtures, all29 UI flows, explicit native capability/CSP tests and lazy-route load error boundaries. This is incomplete implementation as well as blocked execution.

AC-01/07/08/12 for M3 reference-first scope are all BLOCKED. Prior M1/M2 proofs remain PASS in their scope. Native/SQLite/IndexedDB, supported browser targets, accessibility and current-content/package prerequisites have zero acceptance passes. There is no M3 acceptance SHA and no M4 authorization inferred from this work.

## Rollback, preservation and handoff

Retain the original legacy key/raw bytes, session exports/databases if later created, prior publication generations and all ignored/private/untracked owner data. The new feature is disabled by default. Restore source integration by named paths from the entry receipt only after preserving draft source; never clean/reset untracked originals or delete session data. The old publication generation still needs its original package/Vite/overlay bytes to launch; disabling the UI alone does not waive the generation binding. Original PDF and generated reference/setup outputs remain intact.

No staging or commit is permitted until exact M3 acceptance. Next work is the bounded **M3 remediation** in HANDOFF_M3_REMEDIATION.md. M4–M14 remain outside this assignment. Do not publish this local implementation evidence or private data. Existing SunFounder rights/notices are retained; this draft adds no grant to redistribute third-party media.
