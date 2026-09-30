# Canonical first implementation assignment — M0 only (audited v2)

Implement M0 only for `scalinity/PiCar`, extending the existing `picarx-companion/` app. The audited main baseline is `9e54b2fb3199c22f5d5c7cd67c8e4531ab2246f8`. Resolve actual current main and report any load-bearing drift before adapting the task. This is not a greenfield redesign.

## Read first

Read this file, AUDIT_REPORT.md executive verdict and findings PX-AUD-01/02/09/14, ARCHITECTURE.md, REPOSITORY_CHANGE_MAP.md, SOURCE_PUBLICATION_CONTRACT.md, GATE_CONTRACTS.md M0, VERIFICATION_AND_TEST_PLAN.md, MILESTONES.md M0, EVIDENCE_INSPECTION.md and Q-02/Q-15/Q-16/Q-17. The source-lock and M0 report schemas are in MACHINE_READABLE_SCHEMAS. Use the audited v2 package, not HISTORICAL schemas/reports or the previous summary. The six original photos are private reference evidence, not app assets. Do not request owner measurements for M0.

## Authorized scope

Work locally in the repository. Do not push, commit, create remote branches or open a PR without separate authorization. Do not edit raw upstream sources to conceal mismatches. Do not execute robot/hardware commands. Do not install Three.js/R3F, create kit CAD, invent dimensions, build the assembly domain, migrate progress to SQLite, implement M1 or later, or redesign the shell. A test harness and bounded build/publication integration are in scope.

## Execute in these bounded stages

**M0-A — baseline and preservation.** Record HEAD, clean/dirty status, exact Node/pnpm/Rust/OS versions, source pins, package/native lock hashes and relevant source tree manifest. Run `pnpm install --frozen-lockfile` and the existing `pnpm build` from picarx-companion; capture commands, exit status and logs. Preserve Tauri identifier `com.danny.picarx-companion`, the four route families and eight setup IDs `parts, os, power, connect, software, servo-zero, assembly, calibrate`. Read actual progress-store.ts: the key is picarx.v1 and its fields are steps, checks, lastRoute, pdfLastPage. Preserve valid values and the raw original. Add regression fixtures for reference/search/video/PDF behavior; document pre-existing failures separately rather than broadening this task. No migration occurs.

**M0-B — documentary lock.** Inspect the actual repository PDF bytes and compare the revision, all 29 printed steps and Pi4/Pi5/Zero2W panels with the included photos. Repository metadata alone is insufficient. Expected metadata at the audit baseline: path `picarx-companion/public/content/pdf/picar-x-assembly.pdf`, Git blob `85c752c505c2a52bf82900111fd3a31c6ad0f9d8`, length 11048665. Compute actual SHA-256 separately. Confirm upstream PiCar-X `ce2ef77d7f96ac6325c1c8c3fe584b9caab418e4` and sf-shared/gitlink `0c11f833f862661779180ea7da2a25fd515c40d8`, including clean consumed working-tree bytes. The template remains BLOCKED until real PDF verification succeeds. Produce the structured 29-step panel map, allowing separate branch mappings on different pages. Missing/unreadable/conflicting evidence means Q-02 stays open and M1 is forbidden; do not pick a nearby revision.

**M0-C — fail-closed generation and safe publication.** Replace V40→V33 fallback with the verified source lock. Check every consumed input before mutation and detect source changes during staging. Implement the multi-root publication/recovery coordinator and safe public mirror defined in SOURCE_PUBLICATION_CONTRACT.md. Preserve existing excluded local originals at their original paths; the safe mirror/dev/dist/bundle excludes them independently of Git. Keep public/twin and custom-docs outside generator ownership. Exercise missing V40/V33-only/wrong hash/dirty source, two writers, live reader, every journal/replacement/marker crash boundary, missing rollback data and denied-media fixtures. Use synthetic secret markers, never actual credential bytes, in tests and reports.

**M0-D — final baseline and feasibility report.** Rerun the frontend build and regression/publication tests. Verify the current official Tauri macOS WDIO embedded-provider path against the actual dependency lock; any bridge must be test-feature-only and absent from shipping resources. If the native environment is unavailable, report that spike BLOCKED with a named M3 precondition; do not claim native tests passed or ship an untested bridge. This does not waive mandatory gates A–G.

## Acceptance and return package

Produce `docs/implementation/M0_REPORT.md` and `M0_GATE_REPORT.json`, with the schemas and exact logic in GATE_CONTRACTS.md. Include changed paths/diff, every actual command and exit result, source-lock/panel evidence, before/after input and output manifests, test/fixture hashes, safe-public/dist inventories, protected original/twin sentinel hashes, explicit PASS/FAIL/BLOCKED results and tested rollback/recovery steps. Do not include private screenshots or secrets in shipped artifacts.

**M1 is permitted only when all mandatory M0 gates A–G PASS and m1Allowed=true.** A blocked PDF/source gate is not partial permission to start M1. The native feasibility result is separately visible under the narrowly defined M3-precondition rule. Return the next permitted milestone and remaining blockers, not a generic “done.” Stop after M0.

UNKNOWN != APPROXIMATE.
