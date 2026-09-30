# Milestone dependency, execution and ownership review

## Independent dependency result

The independently reconstructed coarse acceptance graph exactly matches the supplied dependencies and is acyclic. No load-bearing missing coarse edge or true cycle was found. Its transitive reduction is:

```text
M0 <- entry
M1 <- M0
M2 <- M1
M3 <- M2
M4 <- M1
M5 <- M2, M4
M6 <- M2, M4
M7 <- M5, M6
M8 <- M7
M9 <- M3, M8
M10 <- M9
M11 <- M10
M12 <- M11
M13 <- M12
M14 <- M13
```

Redundant explicit edges (for example M0/M1 in M3 and M1/M4 in M8) are harmless input reminders. Do not call them cycles. The required correction is a second phase graph, not replacement of this sound coarse order.

## Fixture and scoped phases

```text
M0-CORE <- entry
M1-CONTRACTS <- M0-CORE
M2-GRAPH <- M1-CONTRACTS
M3-REFERENCE <- M2-GRAPH
M4-FIXTURES <- M1-CONTRACTS
M5-COMPONENT-SCOPE <- M2-GRAPH, M4-FIXTURES
M6-PLATE-SCOPE <- M2-GRAPH, M4-FIXTURES
M7-CAD-SCOPE <- M2-GRAPH, M4-FIXTURES, M5-COMPONENT-SCOPE, M6-PLATE-SCOPE
M8-FIXTURE-EXPORT <- M4-FIXTURES
M8-REAL-ADMISSION <- M7-CAD-SCOPE, M8-FIXTURE-EXPORT
M9-FIXTURE-VIEWER <- M3-REFERENCE, M8-FIXTURE-EXPORT
M9-REAL-VIEWER <- M9-FIXTURE-VIEWER, M8-REAL-ADMISSION
M10-PURE-CONTROLLER <- M2-GRAPH, M3-REFERENCE
M10-REAL-TRANSITIONS <- M10-PURE-CONTROLLER, M9-REAL-VIEWER
M11-FULL-COVERAGE <- M10-REAL-TRANSITIONS, M5-COMPONENT-SCOPE, M6-PLATE-SCOPE
M12-RELEASE <- M11-FULL-COVERAGE
M13-CAMERA <- M12-RELEASE
M14-AR <- M13-CAMERA
```

M5/M6 scope receipts cover named definitions. M7 waits only for the definitions in its selected step/variant closure, not unrelated completed kit geometry. A lane absent from a scope is notApplicable with a reason, not an empty PASS. M8 real admission requires that scoped G-CAD and final-byte checks. M11 alone aggregates full29×3 coverage. TEST fixtures stay excluded from production manifests.

## Every milestone: inputs, outputs, gates and rollback

### M0 — Protect the existing app and lock the V40 source boundary

**Inputs / preconditions:** No prior milestone; baseline read first. This package, all six supplied photos, live repository HEAD and any diff from the inspected baseline; bundled PDF bytes from the actual checkout; the two pinned upstream commits/submodule. No owner measurements requested.

**Owned source/output paths:** README.md; .gitignore; picarx-companion/package.json and lock; tools/content-pipeline/build.ts; new source-lock/content-check/publication helpers; tests/baseline; test/tool TS configs; native test harness feature configuration only.; vite.config.ts/publicDir wrapper; docs/implementation/M0_REPORT.md and M0_GATE_REPORT.json

**Shared files:** schema/runtime/source/graph contracts, dependency locks, source lock, generated aggregate manifests and App/router integration remain single-integrator-owned. Per-definition CAD and per-feature UI files may be exclusively assigned.

**Outputs / postconditions:** BASELINE_REPORT.md; source-lock record; privacy/publication report; initial test harness; migration fixtures; source-drift report; explicit G-BASELINE/G-SOURCE outcomes.

**Tests:** Baseline build; old route parser, eight-stage IDs, reference/search/video/PDF fixtures; malformed progress recovery; V40 absent/V33-only/mismatched-hash failure; publication denied-media fixtures; no modifications of local excluded originals; native harness capability result.; safe-public mirror; two-writer/read-lease and crash-journal recovery matrix in SOURCE_PUBLICATION_CONTRACT

**Acceptance:** M0 mandatory gates A–G in GATE_CONTRACTS.md must all PASS; m1Allowed is true only then. G-SOURCE requires actual PDF bytes/hash/revision and all 29 panel/branch mappings. Any mandatory FAIL/BLOCKED forbids M1. Native feasibility may be separately BLOCKED only under the explicit no-shipping-bridge/M3-precondition rule.

**Rollback:** Changes are isolated baseline/provenance safeguards. Existing generated content and local originals remain intact. No user-state migration has happened.

**Session boundary:** Run the four bounded stages in HANDOFF_M0; do not cross into M1.

### M1 — Canonical schemas, claims, inventory identities and uncertainty firewall

**Inputs / preconditions:** M0. Photo 03 printed BOM, photos 04–06 usage, README provenance and camera/ultrasonic conflicts; no generic vendor part promoted without an applicability proof.

**Owned source/output paths:** digital-twin/schemas, evidence/records, evidence/conflicts, components/{definitions,instances,measurements,interfaces,inventory}, tools/evidence, validation; src/generated/twin types only.

**Shared files:** schema/runtime/source/graph contracts, dependency locks, source lock, generated aggregate manifests and App/router integration remain single-integrator-owned. Per-definition CAD and per-feature UI files may be exclusively assigned.

**Outputs / postconditions:** Canonical source database; generated TypeScript types; evidence/claims manifest; printed inventory report; initial unresolved-impact graph; schema validation report.

**Tests:** Schema validation plus reference resolution, ID uniqueness, enum/units tests, unknown-value rejection mutants, printed-stock arithmetic, ownership/double-count tests and supersession impact closure.

**Acceptance:** G-DATA in GATE_CONTRACTS.md: v2 schemas, typed reference/rule/derivation/conflict closure, complete source-scoped inventory, qualified interfaces, explicit unknowns and acyclic cross-language hashes pass. Physical inventory and exact CAD may remain BLOCKED, never fabricated.

**Rollback:** Additive authoring data only. Schema-version changes need explicit migration fixtures; no live session depends on these records yet.

**Session boundary:** Freeze schema/registry tests before ingesting complete inventory; then validate typed closure.

### M2 — Compile the complete reversible 29-step V40 semantic graph

**Inputs / preconditions:** M1. V40_ASSEMBLY_LEDGER and original photos, reconciled BOM, source warning conflicts; detailed numeric interfaces may remain typed unresolved.

**Owned source/output paths:** digital-twin/assemblies/v40/{steps,operations,connections,variants,presentation}; tools/compiler; picarx-companion/src/domain/assembly; validation fixtures and domain tests.

**Shared files:** schema/runtime/source/graph contracts, dependency locks, source lock, generated aggregate manifests and App/router integration remain single-integrator-owned. Per-definition CAD and per-feature UI files may be exclusively assigned.

**Outputs / postconditions:** Canonical operation graph; variant-compiled semantic packs; step/part search index schema; reducer package; coverage and reversal reports; frozen graph contract.

**Tests:** All 29 forward/reverse rounds per variant; arbitrary prefix equivalence; inventory conservation; variant exclusivity; S10/S19/S21/S25/S26/S29 mutants; graph/reference checks and deterministic hash tests.

**Acceptance:** G-GRAPH in GATE_CONTRACTS.md: all 29 steps in all 3 variants compile and every operation/prefix passes full serialized-state replay/inverse, qualified endpoint, branch, P11, stock and S27 ownership tests. Human conditions remain outside pure projection; unresolved geometry is not a default pose.

**Rollback:** Version graph semantics and keep prior compiled fixture pack. Later sessions pin this graph hash; no in-place reinterpretation.

**Session boundary:** Compile one synthetic operation family at a time, then source-bind the entire29×3 graph; partial family passes are not G-GRAPH.

### M3 — Durable sessions and reference-first integration into the companion

**Inputs / preconditions:** M0; M1; M2. Baseline user-state fixtures and source-locked panels; Q-02 resolved for a verified PDF label, otherwise owner-photo evidence view remains explicitly scoped.

**Owned source/output paths:** src/platform; src/features/assembly-session; src/pages/Assembly.tsx; App.tsx/Home.tsx/WizardStep.tsx/router.ts/progress-store.ts; src-tauri/src/persistence and commands; Cargo files; content overlay and search adapter.

**Shared files:** schema/runtime/source/graph contracts, dependency locks, source lock, generated aggregate manifests and App/router integration remain single-integrator-owned. Per-definition CAD and per-feature UI files may be exclusively assigned.

**Outputs / postconditions:** Reference-first integrated assembly workspace; schema-versioned local database and browser adapter; migration report; accessible state/coverage UI; export/import fixture.

**Tests:** Persistence contract on both adapters; crash/disk-full/concurrent-revision/idempotency tests; old-route regression; no legacy auto-completion; all 29 reference steps and accessibility controls; offline mode.; duplicate-before-CAS/id-reuse/legacy-divergence/WAL-backup/attestation adapter parity

**Acceptance:** AC-01/07/08/12 for the reference-first scope. Reopening restores the correct session without asset assumptions. Every unresolved part appears as a labeled source tile. No 3D dependency is required to finish the text/reference journey.

**Rollback:** Retain original localStorage and pre-migration export. Disable new route if necessary without deleting SQLite data or breaking old setup/reference pages.

**Session boundary:** Separate adapter contract, SQLite transaction/migration, IndexedDB parity and reference-route integration; acceptance includes all.

### M4 — Reproducible mechanical toolchain and independent validators

**Inputs / preconditions:** M1. Official CadQuery/OpenCascade documentation and synthetic TEST-* fixtures with explicitly authored test dimensions, not PiCar measurements.

**Owned source/output paths:** digital-twin/{pyproject.toml,uv.lock,toolchain.lock.json}; cad/twin_cad; cad/tests; validation/tests_python; tools/export fixture support.

**Shared files:** schema/runtime/source/graph contracts, dependency locks, source lock, generated aggregate manifests and App/router integration remain single-integrator-owned. Per-definition CAD and per-feature UI files may be exclusively assigned.

**Outputs / postconditions:** Authoring CLI; toolchain lock; solver/feature test library; source-to-mesh deviation reports; synthetic reference pack.

**Tests:** Synthetic assemblies under reordered inputs and perturbed solver starts; over/underconstraint and mirrored solution mutants; unit/handedness; unknown numeric input; two clean rebuilds and interface fingerprints.

**Acceptance:** G-TOOLCHAIN: fixtures solve uniquely within expected DOF/budgets, failures are classified, and identical locked inputs regenerate equivalent normalized outputs. No fixture can enter a production manifest.

**Rollback:** Toolchain versions are hash-locked; updates use a side-by-side fixture run before replacing the release lock.

**Session boundary:** Lock toolchain, validate asymmetric fixtures, then publish independent oracle tests.

### M5 — Identified purchased-part geometry and electronics interfaces

**Inputs / preconditions:** M1; M2; M4. Bounded official/OEM drawing/CAD acquisition and exact kit applicability. Official Pi5 STEP is a located candidate, not inspected/admitted CAD. Pi5 reference-only approximate drawing cannot alone close exact geometry. Camera/HAT/ultrasonic conflicts remain explicit.

**Owned source/output paths:** digital-twin/components; evidence; cad/twin_cad/{components,vendor}; source-vault; validation/expected; not frontend code.

**Shared files:** schema/runtime/source/graph contracts, dependency locks, source lock, generated aggregate manifests and App/router integration remain single-integrator-owned. Per-definition CAD and per-feature UI files may be exclusively assigned.

**Outputs / postconditions:** Scoped standard/purchased-part library; imported/reconstructed STEP; feature/interface tables; rights and evidence records; unresolved closures.

**Tests:** Dimensions/feature tables/validity/source units, thread/mating compatibility, owned element accounting, camera conflicting-dimension mutants, identity substitution rejection and source-limitation propagation.

**Acceptance:** Per-definition G-COMPONENT: identity plus required feature evidence and independent CAD checks pass for the declared scope. Milestone report lists admitted/partial/blocked components; it is not “all purchased geometry verified” unless every required scope actually passes.

**Rollback:** Each definition is revisioned; replacing one invalidates its dependent solutions/assets, not unrelated setup or source records.

**Session boundary:** One exclusively owned component definition/scope per assignment; do not claim all purchased geometry from one receipt.

### M6 — Revision-specific structural geometry for A–H

**Inputs / preconditions:** M1; M2; M4. Official V40 engineering files or defensible fully constrained derivations from applicable authoritative geometry. Owner photos supply labels/orientation, not metric profiles. No new owner measurement request is required.

**Owned source/output paths:** digital-twin/components/{definitions,measurements,interfaces}; evidence; cad/twin_cad/components/plates; validation/expected/plates.

**Shared files:** schema/runtime/source/graph contracts, dependency locks, source lock, generated aggregate manifests and App/router integration remain single-integrator-owned. Per-definition CAD and per-feature UI files may be exclusively assigned.

**Outputs / postconditions:** Plate source/evidence map; parametric scripts; admitted plate CAD where justified; exact missing-feature list and blocked dependency report.

**Tests:** Hole/slot tables, face orientation, bend/thickness checks, reflection mutants, source-to-script traceability, dependency closure and deterministic regeneration.

**Acceptance:** G-STRUCTURE passes per plate only with applicable evidence and mechanical validation. If no authoritative geometry can be acquired, Q-03 remains blocked; software/fixture lanes continue. There is no “close enough” exit criterion.

**Rollback:** Separate plate definitions and datum version. Datum changes invalidate all dependent transforms; preserve prior records and reports.

**Session boundary:** One plate or inseparable evidenced plate family per assignment; unknown parameters stay blockers.

### M7 — Constrained variant assemblies and engineering admission

**Inputs / preconditions:** M2; M4; M5; M6. Only scoped component/plate admissions from M5/M6; unresolved dependencies keep the relevant step closure blocked.

**Owned source/output paths:** digital-twin/cad/twin_cad/assemblies and verification; assemblies/v40/connections and presentation; tools/compiler/admission; generated/solutions and reports.

**Shared files:** schema/runtime/source/graph contracts, dependency locks, source lock, generated aggregate manifests and App/router integration remain single-integrator-owned. Per-definition CAD and per-feature UI files may be exclusively assigned.

**Outputs / postconditions:** Variant and intermediate solution packs; numeric residual/DOF/clearance reports; motion recipes; G-CAD and blocked-step coverage matrix.

**Tests:** All variants; before/after states; independent constraints; S21 freedom, E/F direction, shaft fits, PCB stacks, camera orientation, contact/collision policies and blocked closure propagation.

**Acceptance:** G-CAD passes only the identity/evidence/solid/constraint/motion portions of G-GEOMETRY. It is NOT runtime instructional admission. Full G-GEOMETRY closes in M8 after exact published-asset round-trip tests, avoiding a gate/export dependency cycle.

**Rollback:** Solutions are generated from versioned source. Reject failed solutions atomically and retain last valid pack; never overwrite source measurements to make a solve pass.

**Session boundary:** One step/variant closure or inseparable closed mechanism at a time; record all required component receipts.

### M8 — Validated runtime export, asset publication and full geometry gate

**Inputs / preconditions:** M1; M4; M7. glTF 2.0, GLTFLoader/glTF-Transform primary documentation, exact G-CAD reports and source limitations.

**Owned source/output paths:** digital-twin/tools/{export,compiler,publication}; presentation; generated; picarx-companion/public/twin; schemas/runtime-manifest.

**Shared files:** schema/runtime/source/graph contracts, dependency locks, source lock, generated aggregate manifests and App/router integration remain single-integrator-owned. Per-definition CAD and per-feature UI files may be exclusively assigned.

**Outputs / postconditions:** Published runtime pack, admission manifest, independent review GLB, validation/deviation reports and deterministic pack fingerprints.

**Tests:** Khronos validator; basis/pose/interface round trips; quantization/ID stripping/merge mutants; missing local decoder; manifest hash mismatch; atomic publication; clean rebuild; rights/privacy audit.

**Acceptance:** G-GEOMETRY: every applicable item in GEOMETRY_AND_EVIDENCE_SPEC §7 passes for the exact step/variant dependency closure and published hashes. Until then, that step is reference-only or explicitly provisional author review.

**Rollback:** Content-addressed packs and active pointer allow atomic reversion. Old sessions keep their pinned pack; garbage collection respects referenced packs.

**Session boundary:** Fixture exporter first, then per-scope final-byte admission, then immutable pack publication.

### M9 — Viewport, inspection and rendering lifecycle

**Inputs / preconditions:** M3; M8. Runtime manifest contract and admitted packs; TEST fixtures for early work; current React/Fiber compatibility lock.

**Owned source/output paths:** src/features/assembly-3d/{scene,assets,camera,ui,state}; src/domain/components; styles/assembly.css; browser/native visual tests.

**Shared files:** schema/runtime/source/graph contracts, dependency locks, source lock, generated aggregate manifests and App/router integration remain single-integrator-owned. Per-definition CAD and per-feature UI files may be exclusively assigned.

**Outputs / postconditions:** Integrated viewport foundation; interaction test suite; screenshot baselines; measured fixture and real-pack load/memory reports.

**Tests:** Part-ID click/hover mapping, instance ownership, drag/click distinction, keyboard/focus, light/dark/reduced motion, missing asset/provisional rejection, context loss and memory cycles.

**Acceptance:** All inspection controls work with canonical IDs; unresolved geometry stays a source tile; admitted PiCar packs are the only production 3D inputs; old companion routes load without the viewer.

**Rollback:** Feature flag disables viewport while reference-first Assembly and session persistence remain operational.

**Session boundary:** Fixture lifecycle/selection/accessibility first, then native capability/performance and admitted packs.

### M10 — Deterministic assembly transitions and complete interaction semantics

**Inputs / preconditions:** M2; M3; M8; M9. Frozen M2 operations and full G-GEOMETRY where real transitions are enabled. Pure evaluator and UX logic may be developed earlier on fixtures.

**Owned source/output paths:** src/domain/assembly; features/assembly-3d/{motion,camera,ui,state}; features/assembly-session; assemblies/v40/presentation; tests/domain and interaction.

**Shared files:** schema/runtime/source/graph contracts, dependency locks, source lock, generated aggregate manifests and App/router integration remain single-integrator-owned. Per-definition CAD and per-feature UI files may be exclusively assigned.

**Outputs / postconditions:** Animation/interaction engine; operation-to-UI adapters; deterministic replay tests; scoped transition coverage report.

**Tests:** Forward/reverse endpoints and intermediate samples; rapid interruption; stale callbacks; instant reduced-motion path; camera manual override; exploded zero-offset identity; cable tethers in explosion; save acknowledgment; all required controls via keyboard.

**Acceptance:** Every implemented transition obeys the engine contract and returns exactly to canonical boundary poses; physical confirmations never arise from replay/preview. Metric motion stays blocked when its dependency closure is not admitted.

**Rollback:** Presentation can revert independently of semantic graph/session data; remove a broken motion capability without deleting instructions or confirmations.

**Session boundary:** Pure transition/controller tests first, then scoped admitted motion and physical-command integration.

### M11 — Complete V40 coverage, editorial integration and variant audit

**Inputs / preconditions:** M3; M5; M6; M7; M8; M9; M10. Original source panels side-by-side with compiled graph and runtime views; per-step geometry reports; physical limitations remain explicit.

**Owned source/output paths:** assemblies/v40; components and evidence corrections; feature UI; Home/WizardStep/Reference/search overlays; visual/reference test baselines.

**Shared files:** schema/runtime/source/graph contracts, dependency locks, source lock, generated aggregate manifests and App/router integration remain single-integrator-owned. Per-definition CAD and per-feature UI files may be exclusively assigned.

**Outputs / postconditions:** Complete coverage audit; three full variant walkthrough reports; editorial review; completion UI; final unresolved geometry register.

**Tests:** 29×3 scripted scenario matrix, per-operation BOM and warning coverage, source/deep-link integrity, final semantic and visual assembly snapshots, full reversal, reference fallback for every blocked step.

**Acceptance:** Full-3D V40 completion requires 29/29 admitted steps in all three claimed variants. If geometry remains blocked, publish a truthful partial/reference-first report, not a passed full-product milestone. Functional text coverage may still be complete.

**Rollback:** Revert individual capability flags/packs with preserved session semantics; avoid replacing the canonical graph simply to remove an inconvenient blocker.

**Session boundary:** Aggregate exact coverage; do not fill gaps to pass.

### M12 — Release validation, reproducibility and scoped certification

**Inputs / preconditions:** M11. All preceding test/admission reports and actual recorded target-machine results; additional physical match evidence is not presumed available.

**Owned source/output paths:** validation/expected; tests; package/publication tooling; release manifest; docs/digital-twin; native shipping configuration.

**Shared files:** schema/runtime/source/graph contracts, dependency locks, source lock, generated aggregate manifests and App/router integration remain single-integrator-owned. Per-definition CAD and per-feature UI files may be exclusively assigned.

**Outputs / postconditions:** Release candidate and reproducible source recipe; acceptance dashboard; nominal/physical assurance reports; benchmark logs; recovery guide; final handoff.

**Tests:** Every applicable AC-01–AC-16 row, release byte hashes, native test-bridge exclusion, target-device performance, reproducibility, fail-closed tamper/missing-evidence tests.

**Acceptance:** All applicable full-product criteria pass for each claimed supported variant. Report BLOCKED separately. A software release may honestly lack physical-match certification; it cannot claim full verified nominal geometry when M5–M11 are incomplete.

**Rollback:** Retain prior app installer, compatible model pack and session export. Pack and database migrations are explicitly versioned; rollback never silently downgrades schema or certainty.

**Session boundary:** Separate clean reproducible build, native smoke/performance, offline/privacy/restore and final scoped release report.

### M13 — Local camera observation foundation with scoped evidence

**Inputs / preconditions:** M12. OpenCV/AprilTag primary sources, measured/calibrated test fixture ground truth and scoped admitted geometry. Any actual camera check requires calibration evidence and visible target features.

**Owned source/output paths:** src/features/observation; platform camera port; native permission/observation storage; digital-twin observability records; local worker/WASM assets and test fixtures.

**Shared files:** schema/runtime/source/graph contracts, dependency locks, source lock, generated aggregate manifests and App/router integration remain single-integrator-owned. Per-definition CAD and per-feature UI files may be exclusively assigned.

**Outputs / postconditions:** Camera observation adapter; calibration/pose and visibility reports; local-only processing path; observability test suite; privacy UI.

**Tests:** Synthetic projection and calibration error fixtures; occlusion/motion blur/small target; wrong tag size/board pose; hidden washer/screw-length false positives; permission denial; no-network/no-retention defaults.

**Acceptance:** Only declared observable predicates can pass from adequate camera evidence; poor or ambiguous evidence returns RESCAN/HUMAN_CONFIRM. Invisible torque/engagement/length claims never pass. Observation hashes/calibration/model versions and source modality are retained.

**Rollback:** Disable camera capability and revoke permission; assembly/reference data remain usable; retained captures can be individually deleted without corrupting session progress.

**Session boundary:** Separate local capture/permission storage, calibration/pose, then observable predicates; never infer invisible state.

### M14 — Calibrated AR overlay and portable pose-provider boundary

**Inputs / preconditions:** M13. M13 calibration/pose validity, registered tag-to-assembly transform and admitted geometry; any phone deployment needs explicit runtime/permission testing, not an assumed WebXR feature.

**Owned source/output paths:** features/observation/pose; assembly-3d camera/projection adapters; platform AR port; overlay tests; future platform ADR.

**Shared files:** schema/runtime/source/graph contracts, dependency locks, source lock, generated aggregate manifests and App/router integration remain single-integrator-owned. Per-definition CAD and per-feature UI files may be exclusively assigned.

**Outputs / postconditions:** Desktop AR prototype, pose-provider interface, calibration/alignment reports and bounded mobile deployment decision.

**Tests:** Known-pose overlay alignment, scale/handedness mutants, stale calibration, tracking loss, false occlusion and unit drift; scene IDs and model hashes match the assembly session.

**Acceptance:** Overlay errors meet the fixture-specific declared geometric uncertainty budget; stale/ambiguous pose disables metric guidance. Mechanical data and progress remain identical with AR off. Mobile release is not claimed until tested on that selected target.

**Rollback:** AR is a view adapter. Removing it changes no canonical data, session operation or geometry certificate.

**Session boundary:** Separate pose-provider fixtures and overlay alignment from any target-device release claim.

## Single owner versus safe parallel work

| Single owner | Reason |
|---|---|
| Schemas/generated types, semantic/hash/gate policy | Prevent incompatible serializers and enum/field forks. |
| package/pnpm/Cargo/Python/toolchain locks | One compatible dependency graph; no simultaneous lock regeneration. |
| SQLite/IndexedDB migration versions and shared event contracts | Prevent divergent histories or non-replayable snapshots. |
| Canonical graph/variant allocations and source lock | Prevent double allocation and revision contamination. |
| Aggregate CAD/asset manifests, pack pointers and publication coordinator | Prevent mixed generations or false admission. |
| App/router/progress compatibility facade and shared CSS tokens | Preserve existing app and serialization boundary. |

Exclusive parallel assignments are safe for disjoint source-defined components/plates, isolated viewer modules against a frozen fixture contract, independent validation fixtures, and adapter implementation files against one immutable port contract. Each lane submits source + tests + exact input hashes. Only the integrator regenerates aggregate outputs after merging source. Never merge two independently generated whole manifests. No simultaneous ownership of the same physical definition or numeric interface.
