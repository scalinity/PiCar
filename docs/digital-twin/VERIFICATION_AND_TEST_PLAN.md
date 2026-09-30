# Verification and test plan

## 1. What this planning pass actually verified

This package is based on read-only source inspection, visual inspection of all six owner photos and targeted primary-source research. **The PiCar application was not built or run, and no existing repository test suite was executed in this planning pass.** Package-level schema/example/link checks are separately reported in `PACKAGE_VALIDATION_REPORT.json`; they do not certify PiCar geometry or application behavior.

Use four test outcomes: **PASS**, **FAIL**, **BLOCKED**, **NOT_APPLICABLE**. A missing measurement, unavailable asset or unverified identity is BLOCKED, not a skipped PASS. Test counts must distinguish those outcomes. A release capability requires all applicable tests in its dependency closure to PASS; unrelated optional feature blockers do not invalidate an honest reference-only release.

## 2. Deterministic data and graph checks

| Suite | Required assertions / negative fixtures |
|---|---|
| Schemas | Closed records; ID formats; numeric union forbids numeric payload on unresolved state; confidence enum exact; dimension units; normalized quaternions; explicit source limitations; revision/variant enums; finite values; no NaN/Infinity |
| References | Every definition, instance, interface, connection, step, operation, evidence locator and motion target resolves; no duplicate IDs or recycled superseded IDs; no unattached required datum |
| Inventory | Printed stock = primary + backup; per-variant planned consumption <= primary; planned instance sets reconcile with installed/unused/backup/accessory dispositions; actual physical equality is BLOCKED when observed count is unknown; owner inventory never copied from printed stock automatically |
| Ownership | One purchased rivet with owned body/pin; each loose washer independently identified; integral leads not duplicated; camera ribbon reused at S03/S11/S16; moving a subassembly introduces zero new physical items |
| V40 graph | Exactly printed numbers 1–29, unique IDs, all three variants compile; source mapping complete; operation DAG acyclic; prerequisite closure valid; variant alternatives exclusive; no V33 path in accepted source lock |
| Fasteners | Usage by step matches BOM ledger, including S10 supports, S19 Washer A, S26 six Washer B and S21 free joint; every introduced screw/rivet instance consumed at most once per state |
| Connections | All endpoints and keying/pin mappings resolve or explicitly block; temporary P11 disconnected before final port allocation; no connector used by two incompatible cables; mechanical connection list distinct from scene parentage |
| State algebra | Apply all 29 steps to inventory state produces expected final semantic assembly; invert all operations in reverse order returns byte-canonical semantic start state; arbitrary review jumps equal clean replay to the same boundary |
| Branch behavior | Pi4/Pi5/Zero2W use correct support and ribbon records; unsupported Pi3 rejected for twin; variant fork leaves original immutable and imports no physical confirmations |
| Mutations | Reject swapped E/F, merged Washer A/B, generic SG90 marked kit identity, decoded rivet-code guesses, zeroed unknown dimensions, missing fourth S04 screw, welded S21 pivot, duplicate camera ribbon, and approximate-source promotion |

Property tests use deterministic seeds and randomized valid action sequences across complete/previous/replay/preview/undo/variant fork/import/restore. Bound test generation to semantic operations; do not generate physically unsafe instructions. A digital inverse restores inventory allocation and graph state, not a claim that adhesive or physical wear is reversible. Presentation-only fields are excluded from semantic state hashes.

## 3. CAD-level checks

Validate source-unit metadata; exact component applicability; shape validity and solid count; nonzero volume; self-intersection; named interface existence; expected analytic plane/cylinder axes and diameters; protected hole tables; mirrored-part handedness; PCB support stacks; fastener engagement and seating; connector clearance; wheel/horn swept envelopes; cable endpoint constraints; and geometric residuals against the published error budgets.

Each fixed connection must eliminate the expected rigid DOF. Moving joints declare remaining DOF and a reference coordinate. Check the steering closed loop independently of the scene/explosion tree. Constraints must remain satisfied for each declared operating sample or analytically bounded range; do not advertise unvalidated full steering travel. A solver's success flag alone is insufficient: recompute residuals independently from output transforms and analytic frames.

Validate every mechanically meaningful intermediate assembly state, not only the final robot. Check motion sweeps for interference where the operation has a metric motion capability. Contact surfaces, thread nominal overlaps, compliant tire contact and intentional press/grip regions require explicit allowed-contact definitions, not a global collision exemption. Missing tolerance stacks block a physical-fit claim even when nominal solids do not collide.

Two-build reproducibility compares canonical inputs, analytic feature tables, normalized transform output and geometry fingerprints. STEP headers/timestamps and exporter ordering can differ without geometry changing; normalize nondeterministic metadata, document exact tool versions, and compare geometric invariants. Byte-identical runtime publication is required for the pinned, normalized release build; cross-platform CAD equivalence is judged by the declared geometric budget and then re-exported by the designated release toolchain.

## 4. Asset checks

Run Khronos glTF Validator and project semantic validation. Require zero validator errors; any warning needs a specific reviewed allowlist entry. Validate exact root/element IDs, manifest-to-node mappings, shared mesh ownership, positive unit scale, right-handed basis conversion, normals/winding, no shears, no missing textures, approved materials, bounds, pivot/interface round trips, compression extensions and local decoder availability.

Decode the *published compressed asset* and compare it with the approved uncompressed output. Verify the maximum protected-feature and surface deviation after tessellation and quantization; a small GLB size is not acceptance. Ensure optimization did not merge independently selectable physical instances or strip `extras.picarTwin`. Check no runtime path contains `TEST-*`, a source-vault URI, a provisional asset in an instructional slot or an unadmitted geometry hash.

Render deterministic six-direction inspection images and step-specific camera views for each admitted variant. Images expose orientation/ID/missing-part mistakes; they do not replace numerical CAD validation. A new screenshot baseline requires a reviewed source/geometry/presentation change explanation, not automatic approval because the test changed.

## 5. Application and persistence tests

Vitest tests the pure reducer, replay, camera arbitration, explosion offsets, selector behavior and confidence capability derivation. React Testing Library covers focus management, accessible controls, missing geometry tiles, required acknowledgment flow, save status and reference cross-links. Playwright exercises Chromium and WebKit browser previews at 1440×900 and the 1100×700 minimum, light/dark and reduced-motion modes.

Exercise all eight old wizard stages, nested reference deep links and search, PDF page/zoom/retry, videos and offline states. Import fixtures for valid `picarx.v1`, malformed JSON, extra fields, wrong field types, partial data, empty data and unusual route strings. Preserve the raw backup. Legacy completion of `assembly` must not create individual physical confirmations. Refresh and application exit during a pending commit must leave either the old or the whole new transaction, never a partially invalidated session.

Native tests cover SQLite migrations, concurrent command revisions, duplicate idempotency keys, disk-full/write failure, interrupted import, corrupt hash/path traversal, pack mismatch, rollback/read-only recovery and narrow command permissions. Browser IndexedDB adapter must pass the same persistence contract tests. No adapter failure may silently switch stores and make data appear saved elsewhere.

Exercise manual camera interruption during auto focus, rapid replay/previous commands, selection during animation, route exit mid-transition, isolate/explode reset, dragging versus clicking, ghost picking toggles, and context loss/restoration. No scene frame may mutate durable state. A stale load callback must not restore the wrong variant's scene after a route/session change. Memory tests mount/unmount the viewport repeatedly and verify shared-buffer reference counting and disposal.

## 6. Native macOS test decision

Use the official Tauri **WebdriverIO embedded provider** path for macOS integration, subject to M0 compatibility verification with the pinned Tauri/tool versions [W06]. Test-only native plugins are enabled only under an explicit test build feature. The shipping package must prove that the test bridge and remote-control endpoints are absent. Do not use the outdated blanket assumption that all Tauri WebDriver testing is unavailable on macOS; do not assume browser WebKit automation tests the packaged WKWebView/GPU stack.

Run packaged Apple Silicon smoke tests on the selected actual machine, including offline start, file/dialog behavior, CSP, permissions, GLB load, pointer interactions and context recovery. A native harness incompatibility is Q-16: report it, retain browser/Rust coverage, and use a documented manual native checklist temporarily. It blocks the automated-native acceptance criterion, not truthful reporting of other passed tests.

## 7. Proposed performance acceptance targets

These are **engineering targets**, not measured baseline results or inferred kit dimensions. M0 records an Apple Silicon Mac with at least 16 GiB RAM, exact chip, macOS, display, power mode and build. Performance certification applies to that recorded machine and the packaged release app, not an unspecified browser tab.

| Metric | Initial target / test conditions |
|---|---|
| Warm app startup | p95 <= 2 s from launch to usable Home; no twin pack eagerly loaded |
| First admitted scene | p95 <= 3 s cold local-file cache, <= 1 s warm application asset cache; 20 launches each; separate OS-cold from app-cold measurements |
| Interaction | 60 fps target; p95 frame time <= 20 ms, p99 <= 33 ms during the scripted rotate/pan/step path at 1440×900 and DPR <= 1.5; no sustained <30 fps over a 1 s window |
| Input response | Selection/hover visible <= 100 ms p95; semantic step computation <= 50 ms p95 excluding animation duration and separately reported persistence latency |
| GPU/scene budget | Target <= 300k visible triangles and <= 250 draw calls at instructional LOD; exceptions require measured equivalent frame/memory performance, not geometry deletion |
| Asset budget | Initial active-variant pack <= 25 MiB; all three required variants <= 60 MiB compressed publication budget, excluding existing docs/videos; measure shared asset deduplication |
| Texture budget | <= 64 MiB decoded resident texture bytes at default LOD; no unbounded photograph textures on each part |
| Memory | Packaged process-tree resident memory target <= 600 MiB in assembly and <= 300 MiB incremental over Home; report the exact platform measurement method |
| Leak recovery | After 20 enter/leave cycles, post-GC/native-settled memory does not grow >10% above comparable warmed baseline; no extra event listeners or animation drivers remain |
| Step animation | Starts only after required assets are present; no blank part popping. User can pause/cancel immediately; loading is not masked by fake progress |

A budget miss triggers profiling and LOD/material/cache work, never modification of mechanical feature positions or false dimension claims. Favor fewer cosmetic elements and idle `frameloop="demand"` before changing the truth-bearing mesh. On reduced hardware, offer explicit quality reduction or reference-only mode with the same instructions/progress.

## 8. Commands: current versus to be introduced

**Existing app commands inspected in package.json:**

```sh
cd picarx-companion
pnpm install --frozen-lockfile
pnpm dev
pnpm build                 # currently: tsc && vite build
pnpm preview
pnpm tauri dev
pnpm tauri build
pnpm content:build         # requires separate pinned upstream checkout and PDF
```

Do not run `content:build` against an unpinned source or in a way that destroys the only copy of local excluded media. M0 first makes source checking/publication safe. A fresh clone can build already generated pages without that upstream checkout, but omitted sensitive illustrations need honest placeholders.

**Required new app scripts (introduced by the listed milestones, not present today):**

| Command from `picarx-companion/` | Implementation / owner |
|---|---|
| `pnpm typecheck` | Existing frontend TS plus dedicated tool/test configs; M0 |
| `pnpm test:unit` | `vitest run` for unit/React/persistence adapter tests; M0/M3 |
| `pnpm test:domain` | Vitest project for pure assembly/property tests; M2 |
| `pnpm test:browser` | `playwright test` nonvisual application scenarios; M0/M3 |
| `pnpm test:visual` | Playwright screenshot project with fixed clock/viewport/cameras; M9 |
| `pnpm test:native` | WDIO embedded-provider launcher using test-only Tauri build; M0/M12 |
| `pnpm content:check` | Source-lock, AST/reference/media-publication checks without destructive emission; M0 |
| `pnpm twin:validate` | `pnpm --dir ../digital-twin validate`; M1 |
| `pnpm twin:build` | `pnpm --dir ../digital-twin build`; M2/M8 |
| `pnpm twin:check` | `pnpm --dir ../digital-twin check`; M7/M8 |
| `pnpm package:check` | Audit a clean staged release for hashes, assets, privacy and test-bridge exclusion; M0/M12 |

**Required authoring tool commands:** `digital-twin/package.json` owns `validate`, `compile`, `assets`, `publish`, `build`, `check`. They invoke `tsx tools/cli.ts <verb>`; `build` orchestrates compile/assets/publish and refuses unadmitted production geometry. `validate` accepts unresolved authoring data but emits blockers; `check --scope instruction --step ... --variant ...` fails a requested incomplete gate. Schema-valid is never a synonym for admission.

```sh
cd digital-twin
pnpm install --frozen-lockfile
uv sync --frozen
pnpm validate
uv run python -m twin_cad build --variant rpi4 --profile nominal
uv run python -m twin_cad verify --variant rpi4
uv run pytest cad/tests validation/tests_python
pnpm build
pnpm check -- --scope instruction --variant rpi4
```

The Python package is installed from `cad/` through `pyproject.toml`; do not require ad hoc PYTHONPATH edits. Add `cad/tests` and `validation/tests_python` as actual test directories in M4. CAD verification emits BLOCKED and a nonzero gate exit for missing required dimensions rather than manufacturing solids from defaults. CLI exit policy: 0=requested scope passes; 1=test/validation failure; 2=requested scope blocked; 3=tool/environment failure. Authoring lint with explicit `--allow-unresolved` can exit 0 while preserving a nonempty blocker report; it cannot produce an instructional release.

```sh
cd picarx-companion/src-tauri
cargo fmt --check
cargo clippy --locked --all-targets -- -D warnings
cargo test --locked
```

Pin Node/pnpm/Python/Rust/tool versions during M0/M4; do not rely on this document to invent a currently compatible patch number. Compatibility tests decide the exact lock, not a fresh architecture choice. CI uses a clean Linux data/frontend lane and a recorded Apple Silicon native/release lane. Proprietary/private evidence is not uploaded to public CI artifacts.

## 9. Project-level acceptance matrix

| ID | Acceptance criterion / observable proof |
|---|---|
| AC-01 | All existing setup/reference/video/search/PDF routes pass regression tests; excluded media have safe states, not restored secrets |
| AC-02 | Source lock names Z0104V40; binary booklet identity checked; all 29 photo-panel mappings reviewed; V33 fallback absent |
| AC-03 | Three variant graphs compile with exact step numbering and independently reconciled part/fastener allocations |
| AC-04 | Every physical instance and owned element has a stable canonical identity; every runtime node maps to that identity path |
| AC-05 | Every authoritative mechanical feature traces to applicable evidence or reproducible derivation, including source limitations |
| AC-06 | No unknown/probable/provisional dependency can obtain instructional geometry capability; malicious promotion fixtures fail |
| AC-07 | Full forward/reverse semantic sequence and arbitrary review jumps are deterministic for every variant |
| AC-08 | Step confirmations, undo/invalidation, crash recovery and variant forks persist without data loss or confidence promotion |
| AC-09 | All final and intermediate admitted poses resolve from mechanical constraints; no final placement exists only in Blender/runtime code |
| AC-10 | Clean pinned-toolchain rebuild regenerates normalized geometry/manifest/runtime pack with reviewed fingerprints |
| AC-11 | Required tools, orientation, quantities, servo-zero interstitials, power warnings and cable-end operations are present for all steps |
| AC-12 | Reference-only fallback remains usable offline when geometry, GPU, media or optional camera features are unavailable |
| AC-13 | Native/browser/accessibility and performance targets pass on the declared matrix; missing target-machine results remain BLOCKED |
| AC-14 | Shipping artifact passes rights/privacy/hash audit and contains no private evidence cache, credentials or test bridge |
| AC-15 | M12 full-3D completion requires 29/29 admitted transitions for each claimed variant; partial coverage is labeled as partial |
| AC-16 | Physical-match certification is a separate scoped result; absent actual physical evidence cannot be hidden by software acceptance |

Completion requires the applicable acceptance rows, not a screenshot of a plausible assembled robot. Camera/AR acceptance is deferred to M13/M14 and cannot waive any of these rules.

## Audited proof obligations by milestone

GATE_CONTRACTS.md contains the exact M0/M1/M2 and geometry acceptance logic. M0 must exercise source tampering, V33-only input, two writers/readers, all publication crash boundaries, preserved private originals and safe-public/dist filtering. M1 must validate typed rule/derivation/conflict and qualified-reference closure plus JCS cross-language vectors. M2 must test serialized full-state inverses, consumable/group/route state, variant patches and every prefix without a renderer. M3 must execute the PERSISTENCE_CONTRACT adapter parity and fault matrix, including lost acknowledgments, downgrade/re-upgrade divergence, WAL-safe backup and attestation consumption. M8 must execute the HASH_AND_PACK_CONTRACT final-byte/old-pack/decoder/solution/LOD mutations and the independent geometry oracle tests in GATE_CONTRACTS.

The included AUDIT_TOOLS/validate_package.py is a **specification-package validator**, not these future production tests. Its report separates structural, finite semantic-fixture and evidence-integrity results from unexecuted application/native/mechanical work. A higher package-check count is not an acceptance gate for a working app or a real PiCar component.
