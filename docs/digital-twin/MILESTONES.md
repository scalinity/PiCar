# Implementation milestones and dependency graph

## Execution policy

Execute M0 first. Do not begin a real PiCar 3D tutorial on unadmitted geometry. Software infrastructure may advance on explicit TEST-* fixtures and the reference-first graph while geometric acquisition remains blocked. Every milestone report contains scope, actual commands/results, PASS/FAIL/BLOCKED counts, changed paths, evidence changes, artifacts and the next permitted work. A blocked mechanical milestone is not renamed “complete” because its scaffolding exists.

The milestones below are implementation assignments for a later agent; this planning task did not execute them. The full serial order is M0 → M1 → M2 → M3 → M4 → M5 → M6 → M7 → M8 → M9 → M10 → M11 → M12; M13 and M14 are optional later phases. Parallel lanes below shorten this order without weakening gates.

## Dependency graph

```text
M0 ──> M1 ──> M2 ───────────> M3 (reference-first/persistence)
        │      │
        └─> M4 ┼─> M5 (purchased components) ─┐
               └─> M6 (custom plates) ──────┼─> M7 G-CAD ─> M8 final export/G-GEOMETRY
                                             │                    │
M3 + frozen M8 fixture contract ──────────────┴──────────────> M9 viewport
M2/M3 pure logic + M8/M9 admitted rendering ─────────────────> M10 transitions/UX
M5/M6/M7/M8/M9/M10 + M3 ────────────────────────────────────> M11 all 29/allvariants
M11 ──> M12 release/nominal validation ──> M13 camera ──> M14 AR
```

M8's exporter/schema implementation can start using M4 fixtures before M7; its **real-part publication** cannot. M9 can start on the frozen fixture contract; its **production PiCar input** requires M8. M10's pure evaluator/state tests can start after M2/M3; its real install motion requires M8/M9. This distinction is explicit so the graph does not create a circular demand for export checks before an exporter exists.

## Agent delegation and strict sequencing

After M1's contracts freeze, M2 graph work and M4 tooling can run in parallel. After M2, M3 integration/persistence can run alongside M4–M6. M5 and M6 are separate geometry lanes and can be split further by nonoverlapping definition ownership. M8 fixture exporter and M9 fixture viewer may run in parallel with evidence acquisition after their interface contract is frozen. M10 pure logic is independent of unresolved custom dimensions.

One integration owner controls schema versions, graph semantics, source locks, package locks and final admission. A CAD agent may not update the UI to disguise a failed model; a UI agent may not edit interface dimensions to make an animation look aligned. Distinct agents must submit source/validation artifacts, not just screenshots. Do not run simultaneous native database-migration edits or conflicting changes to App/router without a named integrator.

Strict sequence for any real instructional transition: scoped component/structure evidence → G-CAD solution checks → final asset export/round-trip → G-GEOMETRY → viewer/transition publication. Full nominal completion needs this closure for all 29 steps of each claimed variant. Camera/AR never backfills missing mechanical truth.

## M0 — Protect the existing app and lock the V40 source boundary

**Dependencies:** None; first implementation assignment.

**Objective / why:** Establish a reproducible baseline and stop revision drift, privacy regressions and data-loss risks before a new experience is built.

**Exact scope:** Existing app only: baseline inventory, read-only source/provenance checks, regression harness, fail-closed V40 PDF selection and safe publication. No CAD, Three.js or assembly UI.

**Files and subsystems:** README.md; .gitignore; picarx-companion/package.json and lock; tools/content-pipeline/build.ts; new source-lock/content-check/publication helpers; tests/baseline; test/tool TS configs; native test harness feature configuration only; Vite publicDir/build wrappers for the safe public mirror; docs/implementation/M0_REPORT.md and M0_GATE_REPORT.json.

**Required evidence:** This package, all six supplied photos, live repository HEAD and any diff from the inspected baseline; bundled PDF bytes from the actual checkout; the two pinned upstream commits/submodule. No owner measurements requested.

**Implementation tasks:** Resolve main again and report its difference from the baseline before changes. Capture old route/content/progress fixtures. Run the current frontend build and record actual results. Verify the bundled PDF revision and 29 panels against the photos; record SHA-256 and Git blob separately. Remove V33 fallback in favor of a required locked V40 source. Add nondestructive content:check and safe staging/publication checks. Cover sensitive excluded paths and offline missing media. Establish Vitest/Playwright plus the macOS native test-provider compatibility spike; keep test bridge feature-only.

**Tests and validation:** Baseline build; old route parser, eight-stage IDs, reference/search/video/PDF fixtures; valid progress preservation and explicit malformed-progress characterization (M3 recovery); V40 absent/V33-only/mismatched-hash failure; publication denied-media fixtures; no modifications of local excluded originals; native harness capability result.

**Acceptance gate:** M0 mandatory gates A–G in GATE_CONTRACTS.md must all PASS; m1Allowed is true only then. G-SOURCE requires actual PDF bytes/hash/revision and all 29 panel/branch mappings. Any mandatory FAIL/BLOCKED forbids M1. Native feasibility may be separately BLOCKED only under the explicit no-shipping-bridge/M3-precondition rule.

**Produced artifacts:** BASELINE_REPORT.md; source-lock record; privacy/publication report; initial test harness; migration fixtures; source-drift report; explicit G-BASELINE/G-SOURCE outcomes.

**Explicit non-goals:** Do not add a viewer, model parts, create canonical kit dimensions, rewrite the app, migrate progress to SQLite yet, or change app identity. Do not modify the upstream checkout to hide source mismatches.

**Rollback boundary:** Changes are isolated baseline/provenance safeguards. Existing generated content and local originals remain intact. No user-state migration has happened.

## M1 — Canonical schemas, claims, inventory identities and uncertainty firewall

**Dependencies:** M0.

**Objective / why:** Make evidence and physical identity first-class before any geometry can be mistaken for truth.

**Exact scope:** Production schemas derived from this package, evidence/claim records, definition/instance catalog for prescribed V40 inventory, source limitations and conflict/blocker registry.

**Files and subsystems:** digital-twin/schemas, evidence/records, evidence/conflicts, components/{definitions,instances,measurements,interfaces,inventory}, tools/evidence, validation; src/generated/twin types only.

**Required evidence:** Photo 03 printed BOM, photos 04–06 usage, README provenance and camera/ultrasonic conflicts; no generic vendor part promoted without an applicability proof.

**Implementation tasks:** Implement strict schemas and generated types. Ingest original photo hashes/locators. Allocate stable planned-stock instance IDs, including spare and unused-variant dispositions; keep actual observed stock unresolved. Represent integrated leads/owned rivet elements and cuttable stock correctly. Create placeholder feature declarations without numeric defaults. Load all Q records and preserve conflicting source claims. Implement confidence/capability derivation and negative fixtures.

**Tests and validation:** Schema validation plus reference resolution, ID uniqueness, enum/units tests, unknown-value rejection mutants, printed-stock arithmetic, ownership/double-count tests and supersession impact closure.

**Acceptance gate:** G-DATA in GATE_CONTRACTS.md: v2 schemas, typed reference/rule/derivation/conflict closure, complete source-scoped inventory, qualified interfaces, explicit unknowns and acyclic cross-language hashes pass. Physical inventory and exact CAD may remain BLOCKED, never fabricated.

**Produced artifacts:** Canonical source database; generated TypeScript types; evidence/claims manifest; printed inventory report; initial unresolved-impact graph; schema validation report.

**Explicit non-goals:** No exact kit CAD or 3D UI. Do not assert printed stock equals the owner’s loose stock. Do not maintain a second hand-authored TS schema.

**Rollback boundary:** Additive authoring data only. Schema-version changes need explicit migration fixtures; no live session depends on these records yet.

## M2 — Compile the complete reversible 29-step V40 semantic graph

**Dependencies:** M1.

**Objective / why:** Fix assembly truth and variant behavior independently of rendering and unresolved dimensions.

**Exact scope:** Canonical steps, operation identities, inventory allocations, mechanical/cable endpoint intents, source-panel links, prerequisites, human conditions and reversible digital projections for all three variants.

**Files and subsystems:** digital-twin/assemblies/v40/{steps,operations,connections,variants,presentation}; tools/compiler; picarx-companion/src/domain/assembly; validation fixtures and domain tests.

**Required evidence:** V40_ASSEMBLY_LEDGER and original photos, reconciled BOM, source warning conflicts; detailed numeric interfaces may remain typed unresolved.

**Implementation tasks:** Bind the supplied non-executable planning seed to production IDs/operations. Keep 29 printed steps with suboperations, not a rewritten assembly order. Compile each Pi variant. Add staged versus connected endpoints, P11 temporary zeroing and final ports, free pivots, subassembly moves and consumable allocations. Implement the single pure TS reducer and reference-prefix replay. Define verification predicates and invalidation dependencies. No transform fallback may be introduced.

**Tests and validation:** All 29 forward/reverse rounds per variant; arbitrary prefix equivalence; inventory conservation; variant exclusivity; S10/S19/S21/S25/S26/S29 mutants; graph/reference checks and deterministic hash tests.

**Acceptance gate:** G-GRAPH in GATE_CONTRACTS.md: all 29 steps in all 3 variants compile and every operation/prefix passes full serialized-state replay/inverse, qualified endpoint, branch, P11, stock and S27 ownership tests. Human conditions remain outside pure projection; unresolved geometry is not a default pose.

**Produced artifacts:** Canonical operation graph; variant-compiled semantic packs; step/part search index schema; reducer package; coverage and reversal reports; frozen graph contract.

**Explicit non-goals:** No mesh-based state, Blender timeline, arbitrary final XYZ, physical-undo claim or confidence promotion from a passing reducer test.

**Rollback boundary:** Version graph semantics and keep prior compiled fixture pack. Later sessions pin this graph hash; no in-place reinterpretation.

## M3 — Durable sessions and reference-first integration into the companion

**Dependencies:** M0, M1, M2.

**Objective / why:** Deliver useful V40 navigation and reliable progress without waiting for custom geometry.

**Exact scope:** SQLite/native and IndexedDB/browser ports, legacy progress migration, Assembly entry/route, source panels, 29-step text/trays/warnings, reference cross-links and coverage states. No unadmitted geometry.

**Files and subsystems:** src/platform; src/features/assembly-session; src/pages/Assembly.tsx; App.tsx/Home.tsx/WizardStep.tsx/router.ts/progress-store.ts; src-tauri/src/persistence and commands; Cargo files; content overlay and search adapter.

**Required evidence:** Baseline user-state fixtures and source-locked panels; Q-02 resolved for a verified PDF label, otherwise owner-photo evidence view remains explicitly scoped.

**Implementation tasks:** Implement acknowledged, idempotent command transactions and replay-on-load validation. Import picarx.v1 once while retaining raw backup. Add separate setup/assembly progress and stable hash links. Implement preview versus physical confirmation, explicit undo/invalidation and variant fork. Surface save failures and read-only recovery. Preserve reference/video/PDF paths and add searchable part/step links. Make missing/withheld media accessible.

**Tests and validation:** Persistence contract on both adapters; crash/disk-full/concurrent-revision/idempotency tests; old-route regression; no legacy auto-completion; all 29 reference steps and accessibility controls; offline mode.

**Acceptance gate:** AC-01/07/08/12 for the reference-first scope. Reopening restores the correct session without asset assumptions. Every unresolved part appears as a labeled source tile. No 3D dependency is required to finish the text/reference journey.

**Produced artifacts:** Reference-first integrated assembly workspace; schema-versioned local database and browser adapter; migration report; accessible state/coverage UI; export/import fixture.

**Explicit non-goals:** No hardware control, remote setup execution, camera permission, live AI verification or guessed part silhouette.

**Rollback boundary:** Retain original localStorage and pre-migration export. Disable new route if necessary without deleting SQLite data or breaking old setup/reference pages.

## M4 — Reproducible mechanical toolchain and independent validators

**Dependencies:** M1.

**Objective / why:** Prove that the engineering pipeline preserves interfaces and fails on unknowns before modeling the actual kit.

**Exact scope:** Locked CadQuery/OCP Python environment, mesh-packet export, semantic datum definitions, independent residual/shape checks, constraint fixtures and non-admitted production parameter declarations.

**Files and subsystems:** digital-twin/{pyproject.toml,uv.lock,toolchain.lock.json}; cad/twin_cad; cad/tests; validation/tests_python; tools/export fixture support.

**Required evidence:** Official CadQuery/OpenCascade documentation and synthetic TEST-* fixtures with explicitly authored test dimensions, not PiCar measurements.

**Implementation tasks:** Build/install CLI package reproducibly. Establish fixed datums, axis-polarity and roll handling, intended-DOF reporting, solid validity and interface tests. Exercise fixed/revolute/closed-loop examples and failure cases. Export feature tables plus float64 solutions and mesh packets. Lock normalization and error budgets. Verify missing parameters produce blocker reports, not default solids.

**Tests and validation:** Synthetic assemblies under reordered inputs and perturbed solver starts; over/underconstraint and mirrored solution mutants; unit/handedness; unknown numeric input; two clean rebuilds and interface fingerprints.

**Acceptance gate:** G-TOOLCHAIN: fixtures solve uniquely within expected DOF/budgets, failures are classified, and identical locked inputs regenerate equivalent normalized outputs. No fixture can enter a production manifest.

**Produced artifacts:** Authoring CLI; toolchain lock; solver/feature test library; source-to-mesh deviation reports; synthetic reference pack.

**Explicit non-goals:** No claim that synthetic tolerance values describe kit manufacturing. No production kit asset promotion, Blender mechanical source or GUI-only dependency.

**Rollback boundary:** Toolchain versions are hash-locked; updates use a side-by-side fixture run before replacing the release lock.

## M5 — Identified purchased-part geometry and electronics interfaces

**Dependencies:** M1, M2, M4.

**Objective / why:** Populate mechanically important purchased parts only where exact identity and applicable dimensions exist.

**Exact scope:** Fasteners/washers/standoffs/rivets, motors/servos/horns/wheels, Pi boards/HAT/sensors, battery/cables/connectors; each definition can pass, remain partial or be blocked independently.

**Files and subsystems:** digital-twin/components; evidence; cad/twin_cad/{components,vendor}; source-vault; validation/expected; not frontend code.

**Required evidence:** Bounded official/OEM drawing/CAD acquisition and exact kit applicability. Official Pi5 STEP is a located candidate, not inspected/admitted CAD. Pi5 reference-only approximate drawing cannot alone close exact geometry. Camera/HAT/ultrasonic conflicts remain explicit.

**Implementation tasks:** Assign definition owners to avoid overlapping edits. Preserve immutable vendor bytes and rights. Model only supported critical geometry, nominal threads and justified envelopes. Name interfaces and mechanical/cosmetic omissions. Record explicit unresolved features instead of substitute generic assets. Match every source to board/part revision and limits of use. Produce per-definition CAD evidence reports.

**Tests and validation:** Dimensions/feature tables/validity/source units, thread/mating compatibility, owned element accounting, camera conflicting-dimension mutants, identity substitution rejection and source-limitation propagation.

**Acceptance gate:** Per-definition G-COMPONENT: identity plus required feature evidence and independent CAD checks pass for the declared scope. Milestone report lists admitted/partial/blocked components; it is not “all purchased geometry verified” unless every required scope actually passes.

**Produced artifacts:** Scoped standard/purchased-part library; imported/reconstructed STEP; feature/interface tables; rights and evidence records; unresolved closures.

**Explicit non-goals:** Do not assume SG90=MG90S, generic TT motor=kit motor, all HC-SR04 PCBs equal, nominal diameter=head standard, or rivet digits=dimensions.

**Rollback boundary:** Each definition is revisioned; replacing one invalidates its dependent solutions/assets, not unrelated setup or source records.

## M6 — Revision-specific structural geometry for A–H

**Dependencies:** M1, M2, M4.

**Objective / why:** Solve the custom geometry bottleneck without disguising illustrated profiles as engineering dimensions.

**Exact scope:** Eight separately identified plate definitions, exact or explicitly unresolved outlines, thicknesses, bends, holes, slots, mating faces, handedness and the Plate A assembly datum.

**Files and subsystems:** digital-twin/components/{definitions,measurements,interfaces}; evidence; cad/twin_cad/components/plates; validation/expected/plates.

**Required evidence:** Official V40 engineering files or defensible fully constrained derivations from applicable authoritative geometry. Owner photos supply labels/orientation, not metric profiles. No new owner measurement request is required.

**Implementation tasks:** Search bounded manufacturer/public-source paths; record positive/negative acquisition scope. Compare candidate plate topology and revision against photos. Fix the datum convention once an applicable geometry source supports it. Reconstruct with named parameters/features and uncertainty propagation. Distinguish bends from flat profiles. Keep missing parameters symbolic and emit blockers. Check E/F handedness and all plate interfaces.

**Tests and validation:** Hole/slot tables, face orientation, bend/thickness checks, reflection mutants, source-to-script traceability, dependency closure and deterministic regeneration.

**Acceptance gate:** G-STRUCTURE passes per plate only with applicable evidence and mechanical validation. If no authoritative geometry can be acquired, Q-03 remains blocked; software/fixture lanes continue. There is no “close enough” exit criterion.

**Produced artifacts:** Plate source/evidence map; parametric scripts; admitted plate CAD where justified; exact missing-feature list and blocked dependency report.

**Explicit non-goals:** No image tracing promoted to verified dimensions, generic kit revision reuse, inferred default sheet thickness or manual Blender vertex modeling.

**Rollback boundary:** Separate plate definitions and datum version. Datum changes invalidate all dependent transforms; preserve prior records and reports.

## M7 — Constrained variant assemblies and engineering admission

**Dependencies:** M2, M4, M5, M6.

**Objective / why:** Establish mechanically valid nominal relationships, intentional joints and intermediate configurations before runtime publication.

**Exact scope:** Per-variant master and 29-step intermediate assemblies, feature-relative motion paths, allowed contacts, clearance checks and G-CAD portions of the geometry gate.

**Files and subsystems:** digital-twin/cad/twin_cad/assemblies and verification; assemblies/v40/connections and presentation; tools/compiler/admission; generated/solutions and reports.

**Required evidence:** Only scoped component/plate admissions from M5/M6; unresolved dependencies keep the relevant step closure blocked.

**Implementation tasks:** Solve from Plate A datums and named mating frames. Recompute independent residuals, expected DOF and mirrored alternatives. Resolve steering-loop/pivot states and fastener/washer stack order. Derive approach/insertion paths and validate nominal sweeps. Evaluate cable/connector endpoints and route envelopes only where admitted. Emit intermediate/final transforms and a per-step closure report.

**Tests and validation:** All variants; before/after states; independent constraints; S21 freedom, E/F direction, shaft fits, PCB stacks, camera orientation, contact/collision policies and blocked closure propagation.

**Acceptance gate:** G-CAD passes only the identity/evidence/solid/constraint/motion portions of G-GEOMETRY. It is NOT runtime instructional admission. Full G-GEOMETRY closes in M8 after exact published-asset round-trip tests, avoiding a gate/export dependency cycle.

**Produced artifacts:** Variant and intermediate solution packs; numeric residual/DOF/clearance reports; motion recipes; G-CAD and blocked-step coverage matrix.

**Explicit non-goals:** No renderer-pose tuning to hide failed constraints, no full operational-range guarantee without tests, no physical-fit certificate from nominal collision checks.

**Rollback boundary:** Solutions are generated from versioned source. Reject failed solutions atomically and retain last valid pack; never overwrite source measurements to make a solve pass.

## M8 — Validated runtime export, asset publication and full geometry gate

**Dependencies:** M1, M4, M7.

**Objective / why:** Carry engineering identity and geometry into independently addressable runtime assets without silent export damage.

**Exact scope:** Per-definition GLB builder, separate manifests, local loading contracts, optional Meshopt, review GLB, source/mesh hash binding and final G-GEOMETRY admission. Fixture implementation can begin after M4; real publication requires M7.

**Files and subsystems:** digital-twin/tools/{export,compiler,publication}; presentation; generated; picarx-companion/public/twin; schemas/runtime-manifest.

**Required evidence:** glTF 2.0, GLTFLoader/glTF-Transform primary documentation, exact G-CAD reports and source limitations.

**Implementation tasks:** Build GLBs with stable definition/element roots, correct units/pivots/metadata and no assembly clips. Add material overlays without altering protected geometry. Optimize only through approved functions. Decode final bytes, compare geometry, validate IDs and publish an immutable staged pack. Compute instructional capabilities only after final-byte checks. Keep TEST/provisional assets out of the production manifest.

**Tests and validation:** Khronos validator; basis/pose/interface round trips; quantization/ID stripping/merge mutants; missing local decoder; manifest hash mismatch; atomic publication; clean rebuild; rights/privacy audit.

**Acceptance gate:** G-GEOMETRY: every applicable item in GEOMETRY_AND_EVIDENCE_SPEC §7 passes for the exact step/variant dependency closure and published hashes. Until then, that step is reference-only or explicitly provisional author review.

**Produced artifacts:** Published runtime pack, admission manifest, independent review GLB, validation/deviation reports and deterministic pack fingerprints.

**Explicit non-goals:** No metadata solely in GLB, no Blender animation truth, no remote CDN decoder, no fallback to a visually similar part.

**Rollback boundary:** Content-addressed packs and active pointer allow atomic reversion. Old sessions keep their pinned pack; garbage collection respects referenced packs.

## M9 — Viewport, inspection and rendering lifecycle

**Dependencies:** M3, M8.

**Objective / why:** Build the engineering interaction surface without giving the renderer authority over assembly truth.

**Exact scope:** R3F/Three WebGL2 scene, instance registry, selection/hover, inspector, orbit/pan/zoom, material modes, clipping, loading/failure states and disposal. Fixture lane can start when M8 contract is frozen.

**Files and subsystems:** src/features/assembly-3d/{scene,assets,camera,ui,state}; src/domain/components; styles/assembly.css; browser/native visual tests.

**Required evidence:** Runtime manifest contract and admitted packs; TEST fixtures for early work; current React/Fiber compatibility lock.

**Implementation tasks:** Lazy-load viewer code and assets. Instantiate every physical item independently while sharing immutable buffers. Add accessible DOM selection alternatives and trust/source inspector. Implement manual camera arbitration, local loading/cache, error boundary and GPU fallback. Support ghost/dim/isolate modes without changing semantic state. Profile and dispose on session/route changes.

**Tests and validation:** Part-ID click/hover mapping, instance ownership, drag/click distinction, keyboard/focus, light/dark/reduced motion, missing asset/provisional rejection, context loss and memory cycles.

**Acceptance gate:** All inspection controls work with canonical IDs; unresolved geometry stays a source tile; admitted PiCar packs are the only production 3D inputs; old companion routes load without the viewer.

**Produced artifacts:** Integrated viewport foundation; interaction test suite; screenshot baselines; measured fixture and real-pack load/memory reports.

**Explicit non-goals:** No hardcoded final placements, no animation clips defining steps, no physical completion triggered by mesh clicks.

**Rollback boundary:** Feature flag disables viewport while reference-first Assembly and session persistence remain operational.

## M10 — Deterministic assembly transitions and complete interaction semantics

**Dependencies:** M2, M3, M8, M9.

**Objective / why:** Connect the already-defined semantic graph to reversible, interruptible and mechanically scoped presentation.

**Exact scope:** Motion evaluator, step playback/reversal, camera focus, graph-derived explosion, trays, warnings, servo-zero interstitial, cable presentation and completion/preview/undo controls.

**Files and subsystems:** src/domain/assembly; features/assembly-3d/{motion,camera,ui,state}; features/assembly-session; assemblies/v40/presentation; tests/domain and interaction.

**Required evidence:** Frozen M2 operations and full G-GEOMETRY where real transitions are enabled. Pure evaluator and UX logic may be developed earlier on fixtures.

**Implementation tasks:** Implement normalized-time paths, SLERP, staged insertion and nominal screw rotation policy. Generate explosion tree from attachments while retaining loop constraints. Evaluate reverse using the same function at 1-t. Separate review navigation from physical confirmations. Add keyed per-servo zeroing and warning acknowledgments, endpoint-specific cable operations and automatic return from exploded state before an install.

**Tests and validation:** Forward/reverse endpoints and intermediate samples; rapid interruption; stale callbacks; instant reduced-motion path; camera manual override; exploded zero-offset identity; cable tethers in explosion; save acknowledgment; all required controls via keyboard.

**Acceptance gate:** Every implemented transition obeys the engine contract and returns exactly to canonical boundary poses; physical confirmations never arise from replay/preview. Metric motion stays blocked when its dependency closure is not admitted.

**Produced artifacts:** Animation/interaction engine; operation-to-UI adapters; deterministic replay tests; scoped transition coverage report.

**Explicit non-goals:** No simulated physics, no enforced physical disassembly on Previous, no exact screw pitch animation without an evidenced pitch, no metric cable route invented from a picture.

**Rollback boundary:** Presentation can revert independently of semantic graph/session data; remove a broken motion capability without deleting instructions or confirmations.

## M11 — Complete V40 coverage, editorial integration and variant audit

**Dependencies:** M3, M5, M6, M7, M8, M9, M10.

**Objective / why:** Close the full product rather than demonstrating a few attractive installation steps.

**Exact scope:** All 29 steps for Pi4/Pi5/Zero2W, tools/quantities/source cross-links, all parts and hardware inspectors, cables, orientation warnings, completion dashboard and existing content integration.

**Files and subsystems:** assemblies/v40; components and evidence corrections; feature UI; Home/WizardStep/Reference/search overlays; visual/reference test baselines.

**Required evidence:** Original source panels side-by-side with compiled graph and runtime views; per-step geometry reports; physical limitations remain explicit.

**Implementation tasks:** Walk each variant end-to-end from empty connections. Audit the photographed parts list against introduced and unused items. Check all forward/back/replay/jump paths. Verify zeroing occurs immediately before each horn attachment, not once globally. Audit hardware/connection names and orientation cues. Keep optional accessories separate. Label exact coverage and link unresolved blockers; connect completion to calibration setup stage.

**Tests and validation:** 29×3 scripted scenario matrix, per-operation BOM and warning coverage, source/deep-link integrity, final semantic and visual assembly snapshots, full reversal, reference fallback for every blocked step.

**Acceptance gate:** Full-3D V40 completion requires 29/29 admitted steps in all three claimed variants. If geometry remains blocked, publish a truthful partial/reference-first report, not a passed full-product milestone. Functional text coverage may still be complete.

**Produced artifacts:** Complete coverage audit; three full variant walkthrough reports; editorial review; completion UI; final unresolved geometry register.

**Explicit non-goals:** No disguising a partial model as a finished digital twin or treating cosmetic similarity as certification.

**Rollback boundary:** Revert individual capability flags/packs with preserved session semantics; avoid replacing the canonical graph simply to remove an inconvenient blocker.

## M12 — Release validation, reproducibility and scoped certification

**Dependencies:** M11.

**Objective / why:** Demonstrate that the integrated system meets the mechanical, data, UX, privacy and native performance contracts.

**Exact scope:** Complete project acceptance matrix, clean build/package, target Mac benchmarks, source/geometry assurance dashboard, nominal/physical report separation and final handover.

**Files and subsystems:** validation/expected; tests; package/publication tooling; release manifest; docs/digital-twin; native shipping configuration.

**Required evidence:** All preceding test/admission reports and actual recorded target-machine results; additional physical match evidence is not presumed available.

**Implementation tasks:** Rebuild from locked sources twice; run all data/CAD/asset/app/native suites; audit provisional/source-limited promotion and sensitive-media packaging. Record cold/warm performance and memory. Exercise recovery/export/import. Generate G-NOMINAL only for a fully admitted variant. Leave G-PHYSICAL blocked where actual physical evidence is absent, with exact scope and reason.

**Tests and validation:** Every applicable AC-01–AC-16 row, release byte hashes, native test-bridge exclusion, target-device performance, reproducibility, fail-closed tamper/missing-evidence tests.

**Acceptance gate:** All applicable full-product criteria pass for each claimed supported variant. Report BLOCKED separately. A software release may honestly lack physical-match certification; it cannot claim full verified nominal geometry when M5–M11 are incomplete.

**Produced artifacts:** Release candidate and reproducible source recipe; acceptance dashboard; nominal/physical assurance reports; benchmark logs; recovery guide; final handoff.

**Explicit non-goals:** No camera/AR dependency, enterprise certification claim, torque guarantee, safety approval or manufacturer endorsement.

**Rollback boundary:** Retain prior app installer, compatible model pack and session export. Pack and database migrations are explicitly versioned; rollback never silently downgrades schema or certainty.

## M13 — Local camera observation foundation with scoped evidence

**Dependencies:** M12.

**Objective / why:** Observe only what a camera can establish, without upgrading hidden mechanical facts through AI guesses.

**Exact scope:** Opt-in capture, calibration, AprilTag pose fixture, CAD projection, observability predicates, local comparison and observation ledger. Initial work uses controlled/synthetic fixtures, not new owner photos.

**Files and subsystems:** src/features/observation; platform camera port; native permission/observation storage; digital-twin observability records; local worker/WASM assets and test fixtures.

**Required evidence:** OpenCV/AprilTag primary sources, measured/calibrated test fixture ground truth and scoped admitted geometry. Any actual camera check requires calibration evidence and visible target features.

**Implementation tasks:** Implement local capture and worker processing, explicit permission/revocation, calibration versioning, pose uncertainty and visibility eligibility. Add PASS/RESCAN/HUMAN_CONFIRM with explicit contradiction failures. Persist derived observation records only by default. Keep non-observable hidden parts unverified. Optional cloud explanation requires per-request consent and cannot override a deterministic check.

**Tests and validation:** Synthetic projection and calibration error fixtures; occlusion/motion blur/small target; wrong tag size/board pose; hidden washer/screw-length false positives; permission denial; no-network/no-retention defaults.

**Acceptance gate:** Only declared observable predicates can pass from adequate camera evidence; poor or ambiguous evidence returns RESCAN/HUMAN_CONFIRM. Invisible torque/engagement/length claims never pass. Observation hashes/calibration/model versions and source modality are retained.

**Produced artifacts:** Camera observation adapter; calibration/pose and visibility reports; local-only processing path; observability test suite; privacy UI.

**Explicit non-goals:** No autonomous total-assembly certification, hidden-property inference, owner-specific camera accuracy claim without data, or compulsory cloud upload.

**Rollback boundary:** Disable camera capability and revoke permission; assembly/reference data remain usable; retained captures can be individually deleted without corrupting session progress.

## M14 — Calibrated AR overlay and portable pose-provider boundary

**Dependencies:** M13.

**Objective / why:** Overlay the next admitted part on a calibrated real assembly without tying mechanical truth to a particular AR platform.

**Exact scope:** Desktop camera passthrough overlay first, shared pose/projection provider contract and mobile-platform feasibility boundary. AR is an optional separate capability.

**Files and subsystems:** features/observation/pose; assembly-3d camera/projection adapters; platform AR port; overlay tests; future platform ADR.

**Required evidence:** M13 calibration/pose validity, registered tag-to-assembly transform and admitted geometry; any phone deployment needs explicit runtime/permission testing, not an assumed WebXR feature.

**Implementation tasks:** Render through a calibrated projection with fixed CAD-to-camera transform and uncertainty indicators. Freeze or hide overlay on tracking loss; avoid presenting occluded virtual parts as visible physical facts. Keep manual correction tagged presentation-only. Define phone transport/local privacy path in a bounded platform decision using the criteria in FUTURE_CAMERA_AND_AR_SPEC.

**Tests and validation:** Known-pose overlay alignment, scale/handedness mutants, stale calibration, tracking loss, false occlusion and unit drift; scene IDs and model hashes match the assembly session.

**Acceptance gate:** Overlay errors meet the fixture-specific declared geometric uncertainty budget; stale/ambiguous pose disables metric guidance. Mechanical data and progress remain identical with AR off. Mobile release is not claimed until tested on that selected target.

**Produced artifacts:** Desktop AR prototype, pose-provider interface, calibration/alignment reports and bounded mobile deployment decision.

**Explicit non-goals:** No first-release AR dependency, no WebXR-on-Apple assumption, no camera overlay used as evidence of hidden assembly correctness.

**Rollback boundary:** AR is a view adapter. Removing it changes no canonical data, session operation or geometry certificate.

## Audited start-versus-accept graph

The original coarse milestone graph is acyclic. It is an **acceptance** graph, not a ban on early fixture work. [MILESTONE_REVIEW.md](MILESTONE_REVIEW.md) and MACHINE_READABLE_SCHEMAS/milestone-phase-plan.json define fixture/software start edges, per-scope M5/M6/M7 acceptance and the ownership required to merge parallel work. A fixture PASS never closes its real-component parent milestone. GATE_CONTRACTS.md controls M0→M1 permission.
