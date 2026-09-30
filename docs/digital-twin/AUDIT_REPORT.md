# Independent specification audit — PiCar-X Z0104V40

Audit date: 29 September 2026. Repository: `scalinity/PiCar`. Read-only audit baseline: `9e54b2fb3199c22f5d5c7cd67c8e4531ab2246f8`.

## 1. Executive verdict

**READY FOR M0 AFTER REQUIRED CORRECTIONS.** The required corrections are already integrated in this audited copy. **Use this copy and begin M0 only.** The original ZIP should not be used unchanged as the final contract.

The core design is sound: preserve the React/Tauri companion; isolate mechanical/evidence authority from presentation; retain CadQuery/OpenCascade, Three.js WebGL2/React Three Fiber9, a pure TypeScript domain, Rust-managed SQLite and a browser IndexedDB adapter. No change of renderer or application architecture is justified by this audit.

The original package contained **15 actionable findings: nine P1 and six P2; no P0**. These are contract gaps/contradictions, not fabricated claims that an unimplemented application has already failed. All15 have integrated specification corrections and explicit acceptance tests. No identified P0/P1 **specification correction** remains open. Implementation proof and source/geometry acquisition are still outstanding. In particular, this audit is not M0 acceptance, and none of M1–M14 is authorized by it.

### Artifact identity and inspection scope

Original ZIP SHA-256: `44db82ddf516d54c78ce5156fecb6b5a0e0e7b6cbdbb39ee9cdb4636b6ce30cc`. The original uploaded ZIP and extracted original were not edited. All77 original files were inventoried; every listed original integrity hash matched. All root specifications, the combined copy, JSON Schema/wrappers/examples, ledgers, blocker/variant/milestone plans, source/evidence manifests and reports were inspected. The combined original was checked against its18 source documents. All six original photographs and three derived crops were viewed; file hashes/dimensions were checked. The photos establish printed evidence, not calibrated component geometry or an observed loose inventory.

The original package contains no executable source for its174-check validator. Its historical reference-images.zip hash cannot be independently rehashed because that archive itself is not included; the six included originals can be, and were, checked. The repo's PDF binary was not available through the GitHub text reader: only its metadata was inspected. Repository builds, native execution, physical inventory, CAD, GLB export and camera/AR tests were not executed. See [original inspection inventory](AUDIT_EVIDENCE/original-inspection-inventory.json) and the explicit exclusions in [current validation report](AUDITED_PACKAGE_VALIDATION_REPORT.json).

This report distinguishes source observations, audit deductions and future acceptance requirements. A schema-valid object is not physical truth; a finite fixture test is not the production semantic validator.

## 2. Audit scorecard

Ratings concern **specification completeness**, not whether an implementation has passed. PASS WITH CONDITIONS names the remaining evidence/feasibility obligation; it is not a hidden permission to bypass a gate.

| Category | Original | Audited copy | Evidence / condition |
|---|---|---|---|
| Repository grounding | PASS | PASS | Actual main equals baseline; package/store/router/overlay/build/native files re-read. PDF binary verification was never established and remains Q-02, not a claimed completed inspection. |
| Product requirements | PASS | PASS | Existing app, eight stages, reference-only access, inventory/physical-confirmation distinctions and accessibility are explicit; PRODUCT_SPEC AC-P1–P6 retained. |
| Architecture | PASS WITH CONDITIONS | PASS | PX-AUD-02/07/08/09 repair publication, runtime closure and durable contracts without replacing the selected layers. |
| Data model | FAIL | PASS | PX-AUD-03/04/10/11; closed state was incomplete, some physical references unqualified, patches unidentifiable. v2 adds typed records and explicit semantic validation duties. |
| Evidence model | PASS WITH CONDITIONS | PASS | PX-AUD-11 supplies reproducible numeric derivation and conflict records. Existing source scopes, limitations and explicit unknown values remain authoritative. |
| CAD authority | PASS | PASS | CadQuery/OpenCascade and applicable immutable vendor sources remain engineering authority; Blender never supplies canonical mating geometry. |
| Geometry gates | FAIL | PASS WITH CONDITIONS | PX-AUD-06/12: stage-specific bindings and independent surface/path proof obligations corrected. Actual component/CAD/mesh gates have not run; unsupported oracle coverage must block admission. |
| Assembly engine | FAIL | PASS | PX-AUD-03/04/05/10; full effects, qualified joints, condition phases and deterministic patches now specified. No claim the future reducer has passed tests. |
| Reversibility | FAIL | PASS | PX-AUD-03/05. All projected state is serializable; undo checks expectedAfterHash. Physical cuts, backing removal and actual servo state do not reverse digitally. |
| Variant model | FAIL | PASS | PX-AUD-10/07; patch IDs, nonoverlapping spans, branch ownership and per-variant graph identities are explicit. All three source branches retained. |
| Persistence | PASS WITH CONDITIONS | PASS | PX-AUD-09/05 fixes command retry ordering, transaction ownership and attestation consumption; actual adapter crash tests remain M3 work. |
| Migration safety | PASS WITH CONDITIONS | PASS | PX-AUD-09 fixes downgrade/reentry and consistent backup. Existing steps.assembly is never translated into 29 physical confirmations. |
| Asset pipeline | FAIL | PASS | PX-AUD-07/08/12; explicit graph/registry/solution artifacts, upstream-only hashing, immutable pack identity, decoder binding and independent final-byte checks. |
| GLB contract | FAIL | PASS | PX-AUD-04/07/08; units separated in schema, LOD node sets/bounds/decoder bytes specified, unique physical roots preserved. |
| Runtime 3D architecture | PASS WITH CONDITIONS | PASS WITH CONDITIONS | The React19/Fiber9 pairing and WebGL2 choice are supported. Exact dependency lock, packaged WebView lifecycle/GPU behavior and native test bridge still require actual M0/M9 experiments. |
| Existing-app preservation | PASS WITH CONDITIONS | PASS WITH CONDITIONS | PX-AUD-01/02 makes preservation measurable. The audit inspected source but did not execute the existing build or regression suite; M0 must prove it. |
| Testing | FAIL | PASS WITH CONDITIONS | PX-AUD-14 supplies runnable package checks and counterexamples. Future application/database/CAD/export/native tests are specifications, not completed evidence. |
| Performance | PASS WITH CONDITIONS | PASS WITH CONDITIONS | Targets and methodology already exist: recorded Apple Silicon machine, p95/p99 frame measurements, cache cases, scene/texture/memory budgets and20 teardown cycles. No measured hardware result exists yet. |
| Agent parallelization | PASS WITH CONDITIONS | PASS | PX-AUD-13 supplies phase receipts and single-owner paths/locks/registries. Definition-owned geometry and fixture lanes may proceed independently under frozen contracts. |
| Milestone structure | PASS WITH CONDITIONS | PASS | PX-AUD-01/06/13; coarse DAG is acyclic and retained. Fixture start vs scoped acceptance vs full coverage is now explicit. |
| M0 handoff quality | FAIL | PASS | PX-AUD-01/02; rewritten standalone handoff, mandatory A–G and exact M1 permission; PDF/narrow native BLOCKED handling no longer ambiguous. |
| Camera/AR future compatibility | PASS | PASS | Later calibrated local observation and modality/observability boundaries retained. Actual camera/AR performance/accuracy is NOT YET APPLICABLE to M0. |

## 3. Independent repository grounding and drift

The resolved main HEAD equals the original baseline. Therefore no harmless or load-bearing drift was observed. The following source reads were made at that immutable commit; actual tests remain separate.

| Actual source | Claim checked | Result |
|---|---|---|
| [README.md](https://github.com/scalinity/PiCar/blob/9e54b2fb3199c22f5d5c7cd67c8e4531ab2246f8/README.md) | Source pins and local checkout boundary | Upstream/shared revisions match the spec; the actual upstream gitlink was independently resolved. |
| [picarx-companion/package.json](https://github.com/scalinity/PiCar/blob/9e54b2fb3199c22f5d5c7cd67c8e4531ab2246f8/picarx-companion/package.json) | Versions/scripts | React/react-dom^19.1.0; TauriAPI/opener^2; Vite^7.0.4; TS~5.8.3. These are ranges. No configured test script. No install/build result inferred. |
| [picarx-companion/src/lib/progress-store.ts](https://github.com/scalinity/PiCar/blob/9e54b2fb3199c22f5d5c7cd67c8e4531ab2246f8/picarx-companion/src/lib/progress-store.ts) | Legacy progress | KEY picarx.v1; fields steps,checks,lastRoute,pdfLastPage; shallow parsing/defaults; synchronous localStorage writes; hashchange resume. Raw values must survive. |
| [picarx-companion/src/lib/router.ts](https://github.com/scalinity/PiCar/blob/9e54b2fb3199c22f5d5c7cd67c8e4531ab2246f8/picarx-companion/src/lib/router.ts) | Routes | Home/wizard/reference with nested path+section/videos; small hash router. Malformed percent decoding is a pre-existing edge case to characterize. |
| [picarx-companion/tools/content-pipeline/overlay.ts](https://github.com/scalinity/PiCar/blob/9e54b2fb3199c22f5d5c7cd67c8e4531ab2246f8/picarx-companion/tools/content-pipeline/overlay.ts) | Wizard/custom overlay | parts,os,power,connect,software,servo-zero,assembly,calibrate; Hermes is companion-authored. Existing Pi3 reference text is not proof of a V40 3D variant. |
| [picarx-companion/tools/content-pipeline/build.ts](https://github.com/scalinity/PiCar/blob/9e54b2fb3199c22f5d5c7cd67c8e4531ab2246f8/picarx-companion/tools/content-pipeline/build.ts) | Fallback and ownership | V40 existence check falls back to V33; final emit deletes pages and public/content then writes pages/indexes/media/PDF. No multi-root transaction is implemented. |
| [picarx-companion/src/content/index.ts](https://github.com/scalinity/PiCar/blob/9e54b2fb3199c22f5d5c7cd67c8e4531ab2246f8/picarx-companion/src/content/index.ts) | Generated access | Eager page glob and index imports. Heavy twin assets must not be imported through Home. |
| [picarx-companion/src/App.tsx](https://github.com/scalinity/PiCar/blob/9e54b2fb3199c22f5d5c7cd67c8e4531ab2246f8/picarx-companion/src/App.tsx) | Application integration | Four existing route families and external opener. Existing Robot HAT chip is not a proof of exact hardware revision. |
| [picarx-companion/src/components/SearchBox.tsx](https://github.com/scalinity/PiCar/blob/9e54b2fb3199c22f5d5c7cd67c8e4531ab2246f8/picarx-companion/src/components/SearchBox.tsx) | Search | Lowercase/trim, minimum2chars, heading priority, maximum20results, navigation to reference section. |
| [picarx-companion/src/components/PdfViewer.tsx](https://github.com/scalinity/PiCar/blob/9e54b2fb3199c22f5d5c7cd67c8e4531ab2246f8/picarx-companion/src/components/PdfViewer.tsx) | PDF | Lazy per-URL cache, pdfjs worker, page/zoom and old progress key. Metadata or viewer code does not establish the PDF revision. |
| [picarx-companion/src/pages/Videos.tsx](https://github.com/scalinity/PiCar/blob/9e54b2fb3199c22f5d5c7cd67c8e4531ab2246f8/picarx-companion/src/pages/Videos.tsx) | Videos | Ordered registry, lesson links and external YouTube thumbnails. Offline acceptance must distinguish local navigation from unavailable external playback. |
| [picarx-companion/src-tauri/tauri.conf.json](https://github.com/scalinity/PiCar/blob/9e54b2fb3199c22f5d5c7cd67c8e4531ab2246f8/picarx-companion/src-tauri/tauri.conf.json) | Native identity | com.danny.picarx-companion; existing window geometry; CSP null. M0 does not opportunistically change identity/security policy. |
| [picarx-companion/src-tauri/src/lib.rs](https://github.com/scalinity/PiCar/blob/9e54b2fb3199c22f5d5c7cd67c8e4531ab2246f8/picarx-companion/src-tauri/src/lib.rs) | Native commands | Starter greet command plus opener; no existing durable twin-session implementation. |
| [picarx-companion/src-tauri/Cargo.toml](https://github.com/scalinity/PiCar/blob/9e54b2fb3199c22f5d5c7cd67c8e4531ab2246f8/picarx-companion/src-tauri/Cargo.toml) | Native stack | Rust2021, Tauri2/opener2, serde; manifest declarations, not proof of a successful target build. |
| [picarx-companion/src-tauri/capabilities/default.json](https://github.com/scalinity/PiCar/blob/9e54b2fb3199c22f5d5c7cd67c8e4531ab2246f8/picarx-companion/src-tauri/capabilities/default.json) | Permissions | main window, core:default and opener:default. Test-only automation permissions must not ship. |
| [.gitignore](https://github.com/scalinity/PiCar/blob/9e54b2fb3199c22f5d5c7cd67c8e4531ab2246f8/.gitignore) | Sensitive media | Explicit authentication/key/Wi-Fi screenshots and rpi_connect1.mp4 excluded from Git; this is not a Vite packaging denylist. |
| [picarx-companion/src/content/pages/hardware/cpn_camera.json](https://github.com/scalinity/PiCar/blob/9e54b2fb3199c22f5d5c7cd67c8e4531ab2246f8/picarx-companion/src/content/pages/hardware/cpn_camera.json) | Known documentary conflict | About25×23×9mm in prose versus24×23.5×8mm specifications; no exact camera CAD certified. |
| [picarx-companion/src/content/pages/hardware/cpn_ultrasonic.json](https://github.com/scalinity/PiCar/blob/9e54b2fb3199c22f5d5c7cd67c8e4531ab2246f8/picarx-companion/src/content/pages/hardware/cpn_ultrasonic.json) | Known applicability conflict | HC-SR04/5V prose versus photographed final3V3 label. Retain Q-08; no synthetic electrical resolution. |

The upstream PiCar-X pin is `ce2ef77d7f96ac6325c1c8c3fe584b9caab418e4`; its `_shared` gitlink resolves to `0c11f833f862661779180ea7da2a25fd515c40d8`. This verifies that repository relationship, not the independent assembly PDF.

PDF metadata: `picarx-companion/public/content/pdf/picar-x-assembly.pdf`, Git blob `85c752c505c2a52bf82900111fd3a31c6ad0f9d8`,11048665bytes. **No PDF SHA-256 or panel equivalence is asserted.** The new documentary template remains BLOCKED and is intentionally incapable of positive admission until real bytes and all 29 step/branch mappings are verified.

The retained rendering major-version choice is supported by the [Fiber maintainer README](https://github.com/pmndrs/react-three-fiber/blob/master/readme.md). Current [Tauri WebDriver documentation](https://v2.tauri.app/develop/tests/webdriver/) distinguishes the macOS-capable WDIO embedded provider from direct tauri-driver. The original specification was correct on this distinction. [Three.js WebGLRenderer](https://threejs.org/docs/pages/WebGLRenderer.html) remains a WebGL2 renderer. Exact versions and native behavior must be tested on the eventual lock and actual hardware. [RFC8785](https://www.rfc-editor.org/rfc/rfc8785.html) supplies the corrected JSON canonicalization basis; project-specific domain prefixes, input projections and stricter negative-zero rejection are audit design decisions, not claims from that RFC.

## 4. Severity-ranked findings register

All statuses below are **CORRECTED_IN_SPEC / implementation NOT_EXECUTED**. Original locations refer to the unchanged input ZIP, not silently renumbered corrected files. Nine P1 and six P2 are listed; there is no artificial issue quota.

### PX-AUD-01 — P1 — M0 completion and M1 permission are not a single objective gate

**Affected documents:** `HANDOFF_M0.md`, `MILESTONES.md`, `MACHINE_READABLE_SCHEMAS/milestone-plan.json`, `VERIFICATION_AND_TEST_PLAN.md`. **Milestones:** M0, M1.

**Original evidence locator:** HANDOFF_M0.md acceptance; MILESTONES.md M0 acceptance; milestone-plan.json milestones[id=M0].accept.

**Problem:** Original M0 permits an explicitly blocked PDF source gate but does not say whether that milestone may nevertheless be considered complete for its M1 dependent. Its report fields and required evidence are prose rather than a checked pass/permission predicate. Native feasibility and preservation regressions also lack an explicit blocked-environment disposition.

**Why it matters:** An agent reports M0 complete after adding a no-fallback branch, leaves Q-02 open, and another agent begins canonical ingestion under a supposedly verified source boundary.

**Concrete failure scenario:** An agent reports M0 complete after adding a no-fallback branch, leaves Q-02 open, and another agent begins canonical ingestion under a supposedly verified source boundary. Two reviewers can reach opposite decisions from the same report.

**Integrated correction:** GATE_CONTRACTS fixes mandatory A–G with m1Allowed iff all pass; formal source-lock/M0 report schemas and integrated HANDOFF_M0 specify outputs, hashes, rollback and native-only feasibility exception. Starting M0 does not assert that its PDF gate has passed.

**Acceptance test:** Reject duplicate/missing A–G, any mandatory BLOCKED with m1Allowed=true, incomplete branch/panel map and unverifiable PDF hash. A valid report plus actual hashed logs and rerunnable tests is required before M1; schema shape alone is insufficient.

### PX-AUD-02 — P1 — Staged publication is underspecified across multiple roots and private originals

**Affected documents:** `ARCHITECTURE.md`, `ASSET_PIPELINE_SPEC.md`, `HANDOFF_M0.md`, `MILESTONES.md`, `REPOSITORY_CHANGE_MAP.md`. **Milestones:** M0, M8.

**Original evidence locator:** ARCHITECTURE.md generated-content/persistence ownership; ASSET_PIPELINE_SPEC.md publication; repository build.ts final emit.

**Problem:** Original text requests safe/atomic publication without a reader/writer and recovery protocol for pages, indexes and public media. Actual build.ts deletes OUT_PAGES and OUT_PUBLIC before emitting replacements. Gitignored private media can be present in public/content even though it is absent from a fresh clone.

**Why it matters:** A crash replaces pages but not indexes/media; Vite packages a mixed generation.

**Concrete failure scenario:** A crash replaces pages but not indexes/media; Vite packages a mixed generation. Alternatively the agent sanitizes by deleting local excluded originals, or preserves those originals and Vite copies them into dist.

**Integrated correction:** SOURCE_PUBLICATION_CONTRACT specifies multi-root journal/leases, exact old-or-new recovery, a safe public mirror for dev/build, byte-preserved local originals and explicit denied-media/allowlist checks. Twin packs use a separate immutable directory and CAS pointer protocol.

**Acceptance test:** Inject every publication and recovery boundary; restart and compare complete tree manifests. Race readers/writers; check safe-mirror/dist exclusion with synthetic credentials and unchanged originals, custom-docs and twin sentinel hashes.

### PX-AUD-03 — P1 — The closed snapshot does not represent every promised semantic effect

**Affected documents:** `DIGITAL_TWIN_DATA_MODEL.md`, `ASSEMBLY_ENGINE_SPEC.md`, `MACHINE_READABLE_SCHEMAS/digital-twin.schema.json`. **Milestones:** M1, M2, M3.

**Original evidence locator:** digital-twin.schema.json #/$defs/AssemblyState, #/$defs/AssemblyOperation, #/$defs/OperationUndo; ASSEMBLY_ENGINE_SPEC reversible reducer.

**Problem:** AssemblyState omits cable route records, consumable allocations/lot capacity and subassembly membership although operations change them and exact inverse promises to restore them. stockDispositionHash is not the underlying stock data. The specification does not define an alternate authoritative derivation for these omitted effects.

**Why it matters:** A renderer or module-level map remembers route/lot/group state.

**Concrete failure scenario:** A renderer or module-level map remembers route/lot/group state. Basic pose replay looks correct, but serializing a snapshot and undo record loses the allocation or membership needed after restart. This is a missing closed contract, not proof that replay is theoretically impossible.

**Integrated correction:** Add complete typed state collections, explicit operation parentAssignments, nullable no-parent semantics and effect/write rules. The initial state declares all IDs. Hashes are derivatives, and serialized full-state undo restores the exact prior state with an after-hash guard.

**Acceptance test:** Original schema rejects a state with the needed route/lot/group fields; v2 accepts the explicit shape. M2 must round-trip every operation and all 29×3 prefixes through JSON in a fresh process, including unresolved cut lengths, nested grouping and connected cables.

### PX-AUD-04 — P1 — Physical interface references can identify the wrong repeated instance

**Affected documents:** `MACHINE_READABLE_SCHEMAS/digital-twin.schema.json`, `ASSEMBLY_ENGINE_SPEC.md`, `DIGITAL_TWIN_DATA_MODEL.md`. **Milestones:** M1, M2, M7, M10.

**Original evidence locator:** schema #/$defs/AssemblyOperation routeCable/setJointReference/attachJoint payloads; MotionSegment.anchorInterfaceRef; CameraInstruction.focusInterfaceIds; AssemblyState.jointCoordinates.

**Problem:** Endpoint already correctly pairs instance and interface, but routeCable.guideInterfaceIds, MotionSegment.anchorInterfaceRef, CameraInstruction.focusInterfaceIds and jointCoordinates/interfaceId do not. A definition-local feature is not a unique physical feature when a definition is reused.

**Why it matters:** Two servos share one definition and its output-axis ID.

**Concrete failure scenario:** Two servos share one definition and its output-axis ID. A coordinate update or camera/motion anchor resolves to the first servo or updates both. The scene can remain visually plausible while the wrong physical joint is taught.

**Integrated correction:** Use Endpoint for physical guides/anchors/focus; key joint coordinates by connectionId+DOF, with unit/type checks. Retain reusable definition-local frames only when explicitly qualified by definitionId.

**Acceptance test:** Construct two instances of the same servo/washer definition. Reject the old bare-reference payload in v2 and wrong-definition endpoint semantically; update one joint without affecting the other and resolve independent picks/anchors.

### PX-AUD-05 — P1 — The zeroing promise lacks a structured durable attestation and phase boundary

**Affected documents:** `ASSEMBLY_ENGINE_SPEC.md`, `MACHINE_READABLE_SCHEMAS/digital-twin.schema.json`, `ARCHITECTURE.md`. **Milestones:** M1, M2, M3, M10.

**Original evidence locator:** schema #/$defs/Confirmation and AssemblySession; engine zeroing/precondition requirements.

**Problem:** Prose requires named servo, fresh procedure revision, horn-operation scope and a no-movement declaration. Confirmation only has generic statement/dependency fields; the condition evaluator has no phase, so review and physical completion are not mechanically separated by the record contract.

**Why it matters:** An old self-confirmed step or free-text statement is reused for another servo or after horn reindexing.

**Concrete failure scenario:** An old self-confirmed step or free-text statement is reused for another servo or after horn reindexing. Alternatively projectPrefix asks for power/zeroing and ceases to be a pure review function.

**Integrated correction:** Add ProcedureAcknowledgment and ZeroingAttestation in the session ledger, bound to session/variant/model/graph/procedure and servo epoch, with one-operation consumption. Projection registers requirements only; physical commands check/consume/invalidate records transactionally.

**Acceptance test:** Reject wrong servo/variant/procedure/epoch, movement-not-denied and consumed attestation reuse. A lost-ack retry must not consume twice. Review/seek/reverse must produce no attestation or hardware action. A checkbox cannot resolve the ultrasonic evidence conflict.

### PX-AUD-06 — P1 — One admission shape creates a pre-export hash dependency and admits contradictory labels

**Affected documents:** `MACHINE_READABLE_SCHEMAS/digital-twin.schema.json`, `GEOMETRY_AND_EVIDENCE_SPEC.md`, `MILESTONES.md`, `ASSET_PIPELINE_SPEC.md`. **Milestones:** M4, M5, M6, M7, M8.

**Original evidence locator:** schema #/$defs/AdmissionReport.required/bindings; geometry G-CAD/G-GEOMETRY; M7/M8 ordering.

**Problem:** AdmissionReport unconditionally requires meshHash even for G-CAD before mesh export. A truthful missing artifact cannot be represented without a placeholder hash. It also structurally permits PASS with blockers or an empty G-GEOMETRY step scope, although prose intends a stronger gate.

**Why it matters:** An agent inserts zero/dummy mesh hashes to close M7 or waits for M8 to close M7, creating an avoidable cycle.

**Concrete failure scenario:** An agent inserts zero/dummy mesh hashes to close M7 or waits for M8 to close M7, creating an avoidable cycle. A later consumer sees PASS without proving that its own step and complete closure were checked.

**Integrated correction:** Use tagged stage-specific hash bindings; G-CAD/G-COMPONENT meshHash is notApplicable, not fake data. Positive G-GEOMETRY requires all bindings, nonempty scope, empty blockers, gate-policy hash and test artifact hashes; semantic closure/trust checks remain mandatory.

**Acceptance test:** Accept truthful pre-export G-CAD; reject G-GEOMETRY PASS with missing mesh binding, blockers or empty scope. Verify a real geometry report against independently recomputed upstream hashes and executed witness tests in M7/M8.

### PX-AUD-07 — P1 — Runtime graph, solution and metre-frame contracts are incomplete

**Affected documents:** `MACHINE_READABLE_SCHEMAS/digital-twin.schema.json`, `ASSET_PIPELINE_SPEC.md`, `ASSEMBLY_ENGINE_SPEC.md`. **Milestones:** M2, M8, M9, M10.

**Original evidence locator:** schema #/$defs/RuntimeManifest, RuntimeAsset, Frame; asset minimum-manifest contract.

**Problem:** RuntimeManifest lists steps and opaque solution ArtifactRefs but lacks an executable graph artifact/operation table and stable solution index. Its interfaceFrames reuse CAD Frame.translationMm despite the runtime metre convention. Promised bounds/decoder/LOD identification is not fully in the schema.

**Why it matters:** The viewer fetches an unversioned graph from a guessed path, binds a solution by listing order, interprets a millimetre frame as metres, or loads a different unpinned decoder.

**Concrete failure scenario:** The viewer fetches an unversioned graph from a guessed path, binds a solution by listing order, interprets a millimetre frame as metres, or loads a different unpinned decoder. Mesh hashes alone do not bind this complete runtime behavior.

**Integrated correction:** Add typed CompiledGraph and AssemblySolution artifacts, stable variant/solution indexes and equality checks; distinct RuntimeTransform in metres; explicit boundsM, LOD node sets and hashed decoder artifacts. Runtime roots retain unique physical identities. The hash-bound RuntimeRegistry closes supporting references; graphSetHash separates the multi-variant root from each selected graph, and only compiled graphs own runtime steps. Solution poses are explicitly world transforms.

**Acceptance test:** Reject old/untyped graph or solution bytes, wrong variant/index, CAD translationMm in a runtime frame, missing LOD node/decoder and mismatched duplicate records. Exercise known/unknown solution resolution without identity-transform fallback.

### PX-AUD-08 — P1 — Hash identities and publication key can conflict or become circular

**Affected documents:** `DIGITAL_TWIN_DATA_MODEL.md`, `ASSET_PIPELINE_SPEC.md`, `ARCHITECTURE.md`, `REPOSITORY_CHANGE_MAP.md`, `MACHINE_READABLE_SCHEMAS/digital-twin.schema.json`. **Milestones:** M1, M2, M4, M8, M9.

**Original evidence locator:** data-model/version hashes; asset publication path; every-artifact hash binding language; stateHash exclusion wording.

**Problem:** Original text versions mechanical and presentation domains separately but publishes all packs under modelHash. It requires every artifact to record all five hashes and mentions excluding an unspecified own hash; neither state-hash preimages nor downstream/report/mesh exclusions are exact.

**Why it matters:** A cosmetic rebuild has the same mechanical modelHash but different immutable GLB bytes at the same directory, causing stale loads or overwrites.

**Concrete failure scenario:** A cosmetic rebuild has the same mechanical modelHash but different immutable GLB bytes at the same directory, causing stale loads or overwrites. A generated asset/report containing its own aggregate hash creates an unsatisfiable fixed-point requirement.

**Integrated correction:** HASH_AND_PACK_CONTRACT fixes JCS/domain separation, materialized acyclic input projections, exact own-field exclusions, upstream-only stage bindings and separate packHash publication/cache identity. Appearance changes do not fabricate mechanical changes.

**Acceptance test:** M1 cross-language serialization/preimage tests; M8 material-only rebuild changes packHash but preserves modelHash, stale bytes/decoder/solution mutations reject, self/downstream input edges reject, and old pinned packs remain usable.

### PX-AUD-09 — P1 — Retry, migration reentry and backup semantics can lose or misinterpret durable progress

**Affected documents:** `ARCHITECTURE.md`, `ASSEMBLY_ENGINE_SPEC.md`, `MILESTONES.md`, `REPOSITORY_CHANGE_MAP.md`. **Milestones:** M3, M12.

**Original evidence locator:** ARCHITECTURE.md native command transaction/migration; milestone rollback requirements.

**Problem:** Original prose promises idempotent commands, one-way additive migration and backups without defining duplicate-before-CAS ordering, same-ID/different-payload rejection, legacy-key edits after downgrade/re-upgrade or WAL-consistent backup. These are not supplied by choosing SQLite.

**Why it matters:** Commit succeeds but acknowledgment is lost; retry gets stale-revision rejection instead of its original result.

**Concrete failure scenario:** Commit succeeds but acknowledgment is lost; retry gets stale-revision rejection instead of its original result. A later launch reimports edited legacy setup over new data, or a copied .db omits committed WAL events.

**Integrated correction:** PERSISTENCE_CONTRACT specifies aggregate-scoped command_results/requestHash and exact retry ordering, one-transaction migration identity, explicit LEGACY_DIVERGENCE recovery, consistent backups and parity/fault tests. The original steps.assembly marker remains a legacy self-report, never 29 physical confirmations.

**Acceptance test:** Run identical SQLite/IndexedDB cases for lost acknowledgment, ID reuse, concurrent commands, interrupted migration, downgrade divergence, malformed raw preservation, quota/disk failure, newer schema, WAL backup/restore and variant fork. No actual database test was run in this audit.

### PX-AUD-10 — P2 — VariantPatch is referenced by ID but has no ID or deterministic splice rule

**Affected documents:** `MACHINE_READABLE_SCHEMAS/digital-twin.schema.json`, `DIGITAL_TWIN_DATA_MODEL.md`, `ASSEMBLY_ENGINE_SPEC.md`. **Milestones:** M1, M2.

**Original evidence locator:** schema #/$defs/VariantPatch and AssemblyStep.variantPatchRefs.

**Problem:** AssemblyStep.variantPatchRefs contains IDs, but VariantPatch does not define an id. Its replace/with arrays also lack an explicit order/overlap/insertion resolution contract.

**Why it matters:** Two agents invent different patch-ID registries or concatenate overlapping branch operations differently, producing divergent screw allocations and step hashes for the same board..

**Concrete failure scenario:** Two agents invent different patch-ID registries or concatenate overlapping branch operations differently, producing divergent screw allocations and step hashes for the same board.

**Integrated correction:** Add patch id/variantId and a single nonempty contiguous replacement span per step/variant; preserve explicit replacement order and require disjoint active/inactive sets. No implicit last-writer-wins.

**Acceptance test:** Reject missing patch ID, mismatched step/variant, dangling refs, overlap and discontiguous replacement. Compile all three branches deterministically and verify stock/connection consistency.

### PX-AUD-11 — P2 — Rules and numeric derivations lack enough typed operands/registry structure

**Affected documents:** `MACHINE_READABLE_SCHEMAS/digital-twin.schema.json`, `DIGITAL_TWIN_DATA_MODEL.md`, `GEOMETRY_AND_EVIDENCE_SPEC.md`. **Milestones:** M1, M2, M7, M13.

**Original evidence locator:** schema #/$defs/VerificationRule, NumericValue.derivationRef and Claim.conflictIds.

**Problem:** VerificationRule has comparator/targets but no expected operand, predicate version or execution phase. Claims do contain method/scope/inputClaimIds, which is useful, but numeric derivationRef and conflictIds have no dedicated reproducible numeric-method/conflict record contract.

**Why it matters:** A quantity comparator cannot say how many are expected without an implementation-specific side table.

**Concrete failure scenario:** A quantity comparator cannot say how many are expected without an implementation-specific side table. A DERIVED value names an arbitrary Claim but its output/uncertainty method cannot be independently reconstructed.

**Integrated correction:** Add typed expected values/phase/version, a fixed predicate registry, FrameRecord, DerivationRecord and ConflictRecord; require typed reference closure, method artifacts and propagated source limitations. Do not demand JSON Schema prove foreign-key or physical facts.

**Acceptance test:** Reject incompatible predicate/comparator/expected units and wrong reference types. Preserve a known estimate with unresolved uncertainty as representable but mechanically blocked. Reproduce a derivation and reject unresolved method/conflict or approximate-source promotion at admission.

### PX-AUD-12 — P2 — Independent geometric oracle and surface/path coverage need an explicit proof method

**Affected documents:** `ASSET_PIPELINE_SPEC.md`, `GEOMETRY_AND_EVIDENCE_SPEC.md`, `VERIFICATION_AND_TEST_PLAN.md`. **Milestones:** M4, M7, M8.

**Original evidence locator:** GEOMETRY_AND_EVIDENCE_SPEC tolerances; ASSET_PIPELINE_SPEC deviation/export checks; VERIFICATION_AND_TEST_PLAN CAD/mesh tests.

**Problem:** Original numerical budgets and independent checks are good, but vertex/surface and path checks do not fix the coverage/error-bound obligation or independence from the exporter’s metadata. A test name and threshold alone are not a coverage argument.

**Why it matters:** A simplified mesh caps a hole, an axis metadata table is copied from the same wrong source, or coarse motion samples miss an intervening collision.

**Concrete failure scenario:** A simplified mesh caps a hole, an axis metadata table is copied from the same wrong source, or coarse motion samples miss an intervening collision. Rendered poses can look right and sampled vertices can still be close to some CAD surface.

**Integrated correction:** GATE_CONTRACTS requires independent source/analytic witnesses, bidirectional bounded surface error, every instructional LOD, conservative swept-path bounds and separate static/path capabilities. Unbounded methods return BLOCKED; original budgets and source-uncertainty limits remain.

**Acceptance test:** Inject missing hole, wrong axis/handedness, shifted pivot, swapped instance and 1000× scale mutants; each must fail the relevant independent check. Record coverage bounds and final decoded byte hashes, not just screenshots.

### PX-AUD-13 — P2 — Coarse dependencies do not encode early fixture lanes or scoped acceptance

**Affected documents:** `MILESTONES.md`, `MACHINE_READABLE_SCHEMAS/milestone-plan.json`, `REPOSITORY_CHANGE_MAP.md`. **Milestones:** M4, M5, M6, M7, M8, M9, M10, M11.

**Original evidence locator:** MILESTONES.md dependency/parallel lanes; milestone-plan.json; REPOSITORY_CHANGE_MAP ownership.

**Problem:** The coarse dependency DAG is acyclic and fundamentally correct. The missing contract is the distinction between fixture start, real-component scoped acceptance and full milestone acceptance, plus concrete shared-file ownership for parallel agents.

**Why it matters:** A scheduler waits for all geometry before writing the fixture viewer, or calls M8 complete because its TEST fixtures pass.

**Concrete failure scenario:** A scheduler waits for all geometry before writing the fixture viewer, or calls M8 complete because its TEST fixtures pass. Two agents concurrently change shared schema/lock/manifest files and produce mutually incompatible artifacts.

**Integrated correction:** Preserve the coarse DAG; add an explicit phase plan and ownership/rollback review. Require per-definition and per-step dependency receipts, shared-contract single ownership and final full-coverage aggregation.

**Acceptance test:** Recompute topological order and transitive reduction independently; reject phase cycles, production phases without G-CAD/G-GEOMETRY receipts, duplicate ownership and attempts to use a fixture receipt as real-part acceptance.

### PX-AUD-14 — P2 — The 174-check claim is not accompanied by its executable validator

**Affected documents:** `PACKAGE_VALIDATION_REPORT.json`, `CRITICAL_REVIEW.md`, `README.md`. **Milestones:** M0, M1, M12.

**Original evidence locator:** PACKAGE_VALIDATION_REPORT.json174checks; complete original 77-file inventory (no validator script); EVIDENCE/manifest.json historical archive hash.

**Problem:** The ZIP includes a report but no script/configuration that ran the 174 checks. Most reported checks are schema/document structure or scoped arithmetic; the original reference-image archive whose hash was checked is not included. It cannot all be independently rerun from this ZIP alone.

**Why it matters:** An agent treats 174 PASS labels as evidence of graph reversibility or mechanical correctness, or edits the package and republishes the unchanged report.

**Concrete failure scenario:** An agent treats 174 PASS labels as evidence of graph reversibility or mechanical correctness, or edits the package and republishes the unchanged report. The report correctly disclaims app/CAD work, but reproducibility remains missing.

**Integrated correction:** Preserve the original report/schema/manifest as historical; add a runnable independent package validator, explicit counterexamples, inspection inventory, classification, current reports and regenerated integrity manifest. Do not claim the absent original image archive was independently rehashed.

**Acceptance test:** Run the validator on a clean extraction; mutations to schema/fixture/evidence/hash/links/phase graph must fail. The current report must bind its exact input set and list unexecuted app/native/mechanical categories. Compare all original ZIP manifest entries directly before edits.

### PX-AUD-15 — P2 — Step 27 rear-wheel installation is assigned to the front-steering parent

**Affected documents:** `V40_ASSEMBLY_LEDGER.md`, `MACHINE_READABLE_SCHEMAS/v40-step-seed.json`. **Milestones:** M2, M7, M10.

**Original evidence locator:** V40_ASSEMBLY_LEDGER.md PX-V40-STEP-27 parent; v40-step-seed.json steps[26].parentAssemblies.

**Problem:** Both human ledger and machine seed label S27 parentAssemblies as steering/front while the same record mounts the two rear wheels on the motor output shafts. This is an internal factual grouping error, not an unknown dimension.

**Why it matters:** A compiler or explode/navigation grouping attaches the rear-wheel operation to the front steering group, making group motion, selection or ownership wrong despite a correct rear-wheel mesh..

**Concrete failure scenario:** A compiler or explode/navigation grouping attaches the rear-wheel operation to the front steering group, making group motion, selection or ownership wrong despite a correct rear-wheel mesh.

**Integrated correction:** Change both copies to chassis/rear-drive. Preserve the printed step number, rear-wheel/shaft connection intent and all evidence/geometry blockers; do not infer a pose.

**Acceptance test:** Assert S27 is rear-drive in both records and its assigned group is not the front steering group. In M2, test grouped/exploded selection and rear motor-shaft endpoints; preserve all 29 numbering and BOM arithmetic.

## 5. Cross-document consistency and contradiction matrix

“Conflict” describes the input package. The last column is the integrated v2 resolution. Source uncertainty is not mislabeled as a contradiction, and cross-record requirements are not falsely attributed to JSON Schema alone.

| Concept | Document A | Document B | Conflict? | Impact | Canonical resolution |
|---|---|---|---|---|---|
| Component IDs | DIGITAL_TWIN_DATA_MODEL: IDs | schema: Id/Endpoint | Partial gap | Repeated definitions need physical qualification (04). | Stable PX IDs; typed unique registries; Endpoint(instanceId,interfaceId). |
| PartDefinition | data model: definitions | schema: PartDefinition | No | Identity and source claims are separated from meshes. | Retain definition revisions and explicit applicability. |
| PartInstance | data model: inventory | schema: PartInstance/InstanceState | No basic conflict | Inventory identity is not rendering allocation. | One physical identity; owned elements remain with purchased owner. |
| EvidenceRecord | evidence specification | schema: EvidenceRecord/manifest | No | Private images and printed observations have bounded authority. | Keep revision/hash/location/privacy/scope; no inferred physical inventory. |
| GeometrySource | geometry specification | schema: GeometrySource | No | Official approximate or generic source cannot self-admit. | Retain source limitations and proven V40 applicability. |
| MechanicalInterface | data model | motion/camera/route schema | Yes:04 | Bare feature ID may bind wrong reused servo. | Physical refs are Endpoint; reusable runtime local frames use definitionId+interfaceId. |
| MechanicalConnection | engine: joints | schema: jointCoordinates | Yes:04 | Interface-keyed coordinates collide across parts. | Key by connectionId+DOF, with typed units/remaining-DOF validation. |
| AssemblyStep | ledger/engine | VariantPatch schema | Yes:10/15 | Patch references lacked IDs; S27 front parent was wrong. | Identified deterministic patches; S27 chassis/rear-drive in human and JSON. |
| AssemblyState | engine: exact undo | schema: AssemblyState | Yes:03 | Routes/allocations/group state cannot survive complete snapshot serialization. | Explicit complete state collections; hash is derived, not storage replacement. |
| MotionInstruction | engine/pipeline | MotionSegment schema | Yes:04/12 | Unqualified anchor and unbounded path proof. | Endpoint anchor, admitted path scope, independent swept bounds. |
| VariantRule | data model variants | schema: VariantPatch | Yes:10 | No stable patch ID/splice semantics. | At most one patch per step/variant; nonempty contiguous replacement span. |
| VerificationRule | test/gate prose | schema: VerificationRule | Yes:11 | No typed expected operand or execution phase. | predicateVersion/evaluationPhase/expected plus fixed registry. |
| Confidence | evidence/data prose | Confidence/Claim/NumericValue | No enum conflict | VERIFIED transcription is not engineering proof. | Exactly VERIFIED/DERIVED/PROBABLE/UNRESOLVED; source scope propagates. |
| Modeling maturity | geometry progression | schema: Maturity | No | A completed mesh must not upgrade evidence confidence. | Retain distinct maturity and confidence axes. |
| Derivation and conflicts | data model claims | numeric derivationRef/conflictIds | Incomplete:11 | Method and conflict closure otherwise require ad hoc records. | Typed DerivationRecord/ConflictRecord; immutable method/source chain. |
| G-CAD | geometry/M7 | AdmissionReport | Yes:06 | Unconditional meshHash requires future output before export. | Pre-export mesh notApplicable; upstream real hashes required. |
| G-GEOMETRY | geometry/asset prose | AdmissionReport | Yes:06/12 | PASS could carry blockers/empty scope; oracle coverage unspecified. | Nonempty complete scope, empty blockers, final-byte witnesses and path/LOD limits. |
| Runtime admission | asset specification | RuntimeManifest | Incomplete:07 | Consumer cannot resolve all graph/solution dependencies. | Typed RuntimeRegistry, CompiledGraph and AssemblySolution artifacts; trusted admission chain. |
| Source lock | M0 handoff | milestone acceptance | Ambiguous:01 | Blocked PDF could be misread as M0 accepted. | All29 mapped panels and real SHA required; M1 forbidden until A–G pass. |
| Variant selection | product/engine | session/manifest | Partial gap:05/07 | Cross-variant graph or zeroing record can be accidentally reused. | Session pins one variant graph; explicit fork/adoption and attestation invalidation. |
| Progress persistence | architecture | current progress-store.ts | No baseline conflict | Existing key/fields were correctly identified. | Preserve raw picarx.v1; actual fields steps/checks/lastRoute/pdfLastPage. |
| Session persistence | architecture commands | storage acceptance | Incomplete:09 | Lost acknowledgment retry can fail CAS or duplicate effects. | Stored requestHash/result checked before CAS; transactionally authoritative events. |
| Physical confirmation | product/engine | Confirmation schema | Incomplete:05 | Free text cannot enforce fresh servo/procedure/epoch eligibility. | Structured acknowledgments/zeroing attestations; no sensed-state claim. |
| Provisional geometry | product/geometry | runtime capability fields | No policy conflict | A provisional model may still look convincing. | Explicit review-only; never satisfies G-GEOMETRY for production instructions. |
| Reference-only behavior | product/M3 | engine/capability gating | No | Useful guidance may exist before metric geometry. | Text/photos remain available; unverified geometry does not receive placement authority. |
| Coordinate systems | data model | asset conversion | No math error | Basis permutation is right-handed, not reflection. | Retain R=[[0,1,0],[0,0,1],[1,0,0]], determinant+1. |
| Units | data model CAD frame | manifest interfaceFrames | Yes:07 | translationMm schema reused in metre runtime. | Distinct RuntimeTransform translationM; no silent unit interpretation. |
| Transforms | asset/engine | solution ArtifactRef | Incomplete:07 | World/local solution convention and stable lookup missing. | Typed absolute world poses, exactly one conversion; no double parent transform. |
| GLB node identity | asset prose | RuntimeAsset/LOD schema | Incomplete:07 | Advertised LOD nodes not explicitly enumerated. | Exact node sets per LOD, definition/element ownership, physical root mapping. |
| Asset hashes | asset metadata | decoder paths | Incomplete:07/08 | Mutable decoder or undeclared resource can bypass byte binding. | AvailableArtifact paths/hash/size/media; decode exactly verified bytes. |
| Model hashes | data versioning | publication directory | Yes:08 | Appearance variants can collide at one modelHash directory. | modelHash is mechanical inputs; immutable publication/cache uses packHash. |
| Graph hashes | variant compiler | multi-variant manifest | Incomplete:07/08 | Singular root graph versus three compiled variants ambiguous. | graphSetHash aggregates; sessions/solutions/reports bind selected graphHash. |
| Evidence hashes | source register | hash/version requirements | Incomplete:08 | Exact preimage/closure needed to invalidate the right proof. | JCS scoped source projection, raw source bytes separately hashed. |
| Schema versions | schema wrappers | runtime/persistence versioning | Incomplete:08/09 | Unreleased contract revision and storage upgrade could be conflated. | Canonical schema contractv2; historicv1 not runtime; DB migration remains M3. |
| Assembly graph versions | engine state hashes | all-artifact hash requirement | Yes:08 | Unspecified self/downstream hashes can become circular. | Materialized graph input excludes self hashes and generated solutions; referenced instruction inputs included. |
| Database migrations | architecture | rollback wording | Incomplete:09 | Re-upgrade can reimport edited stale legacy values. | Migration identity and LEGACY_DIVERGENCE; no automatic detailed-state merge. |
| Rollback behavior | milestone boundaries | publication/persistence | Incomplete:02/09 | Independent roots/DB WAL break naive copies. | Journal+leases for content; immutable pack pointer; verified logical/consistent DB backup. |
| BOM/consumables | BOM reconciliation | state schema | Incomplete:03 | Symbolic cut lengths and lot remaining state absent. | Typed unknown amount allowed; quantitative conservation BLOCKED until supported. |
| Milestone dependencies | MILESTONES | milestone-plan/parallel prose | Coarse agrees;13 | Fixture success can be mistaken for real-part acceptance. | Preserve15-node DAG;18-phase plan and scoped receipts. |
| Sensitive media | README/.gitignore | Vite public build | Incomplete:02 | Ignored local files may still ship, or be deleted in sanitization. | Preserve originals and use safe dev/build mirror plus packaging checks. |

## 6. Schema counterexamples and semantic boundary

The actual schemas were executed, not merely described. [schema-probes.json](AUDIT_EVIDENCE/schema-probes.json) includes full original-versus-corrected counterexamples and all17 tagged operation shapes; [semantic-fixtures.json](AUDIT_EVIDENCE/semantic-fixtures.json) isolates the finite checks that require more than JSON Schema. Every TEST ID and repeated dummy digest in these fixtures is synthetic and forbidden as production evidence.

| Probe family | Original behavior / gap | Corrected representation and proof boundary |
|---|---|---|
| Complete snapshot with route, lot allocation and groups | Valid project state rejected as extra properties | Explicit collections accepted; real replay/undo remains M2 acceptance |
| Pre-export G-CAD with no mesh bytes | No truthful stage-specific absence in mandatory hash string | HashBinding.notApplicable; no dummy hash needed |
| PASS plus blocker; empty G-GEOMETRY step set | Structurally accepted despite prose intent | Structurally rejected; nonempty dependency closure also requires semantic checks |
| Patch identifiable by referenced ID | Required project identity absent from closed shape | id and variantId required; contiguous splice/overlap tested separately |
| Reused servo guide/anchor/joint | Bare definition-local ID structurally accepted | Qualified Endpoint and connectionId+DOF |
| CAD Frame in runtime interface slot | Millimetre field matches original reused Frame type | RuntimeTransform explicitly uses metres; old shape rejected |
| Expected rule value and zeroing eligibility | Structured contract missing | Version/phase/expected plus durable named attestations |
| Runtime graph, supporting records and solution identity | Step list and opaque artifacts leave lookup contract incomplete | Typed compiledGraphs/RuntimeRegistry/solution index; no duplicate root steps |
| Unsafe paths and undeclared records | Path strings not sufficiently bounded | Lexical PackPath and closed records, plus mandatory filesystem/closure checks |
| Duplicate IDs, non-unit quaternion, wrong endpoint owner, missing context geometry | Some can still pass schema | Deliberately semantic: registry/math/closure validator must reject before admission |

The new schemas are **unreleased v2 contracts**, not a claim to have migrated any stored application session. The original nine examples remain shape fixtures; a schema-only derived standoff does not resolve its pending engineering provenance. Format/range checks cannot prove a source exists, a quaternion represents the correct axis, a part is actually V40, or a hash corresponds to independently reviewed bytes. M1/M2 must implement typed cross-record closure and the full semantic validator. M4/M8 must implement independent mechanical/export validators.

### Reversibility ruling

Digital state N is specified as a pure fold of the selected canonical initialState and operations1…N. Routes, stock allocations, owned elements, parent/group membership, coordinates and condition requirements are all serializable. No clock, random ID, display animation, camera target or user acknowledgment participates in that fold. Serialized undo restores the complete prior state only when its expectedAfterHash matches; arbitrary jump uses a fresh prefix instead of unsafe out-of-order undo.

Physical confirmations are a separate ledger. A cut strip cannot be digitally uncut; peeling backing does not restore adhesion; a driven servo does not rotate back because the user presses Previous. P11 zeroing, power-off acknowledgments and horn fixation are bounded human procedures, not automatic hardware actions or observed sensor truths. Latch subsegments are presentation only in the first release; after interruption the app asks the user to inspect actual state. Physical disassembly appends invalidation history. Review, replay and variant preview never fabricate physical progress.

## 7. Independently reconstructed milestone graph

Reconstruction from artifact prerequisites agrees with the supplied coarse15-node DAG. It is acyclic. There are no missing coarse acceptance edges established by this audit; several edges are transitively redundant but useful as explicit direct input declarations.

```text
M0 <- (none)
M1 <- M0
M2 <- M1
M3 <- M0, M1, M2
M4 <- M1
M5 <- M1, M2, M4
M6 <- M1, M2, M4
M7 <- M2, M4, M5, M6
M8 <- M1, M4, M7
M9 <- M3, M8
M10 <- M2, M3, M8, M9
M11 <- M3, M5, M6, M7, M8, M9, M10
M12 <- M11
M13 <- M12
M14 <- M13
```

The transitive reduction and exact original comparison are in [dependency-review.json](AUDIT_EVIDENCE/dependency-review.json). The important correction is not inventing a new coarse order: it is splitting early fixture work from real-part admission.

```text
M1 -> M2 -> M3 reference/persistence
M1 -> M4 synthetic CAD fixtures
M2 + M4 -> M5 purchased components || M6 plates
M5 + M6 + M2 + M4 -> M7 scoped real CAD
M4 -> M8 fixture exporter -> M9 fixture viewer (also needs M3)
M7 + M8 fixture exporter -> M8 real admission -> M9 real viewer
M2 + M3 -> M10 pure controller
M10 pure controller + M9 real viewer -> M10 real transitions
complete admitted scope -> M11 all 29 x all 3 -> M12 release
M12 -> M13 camera -> M14 AR
```

The [18-phase machine plan](MACHINE_READABLE_SCHEMAS/milestone-phase-plan.json) is independently topologically checked. Receipts are bound to definition/step/variant closure and hashes. Fixture-only success cannot satisfy real geometry. A scope using no plate/purchased-component dependency records that lane notApplicable; it does not manufacture an empty positive gate. M11 requires all claimed scope, not one successful example.

### Every-milestone input/output/ownership review

[MILESTONE_REVIEW.md](MILESTONE_REVIEW.md) contains each M0–M14 milestone’s inputs, preconditions, owned/shared paths, outputs, tests, exact gate, rollback boundary and parallel limits. Large milestones are split by schema family, operation family, component definition or admitted transition rather than forced into one coding session. The reviewed stage contract remains in MILESTONES.md and milestone-plan.json; these are not substituted by this overview.

**Single owner:** schema and predicate/hash contracts; source lock and media deny registry; package/pnpm/Cargo/CAD locks; migrations and persistence port; global instance/graph registry; shared public manifests/pointers; shared route/shell/style integration.

**Safe parallel ownership:** after those contracts freeze, M2 versus M4; M3 versus geometry research; M5 versus M6; separate definition directories with no duplicate ownership; exporter/viewer/controller fixture lanes. Each agent returns a scoped manifest and receipt, not edits to a shared global file or lock. Integration owner merges and reruns cross-contract tests. Generated output belongs to its generator, never a second manual editor.

## 8. Gate review and strengthened canonical definitions

The following are the integrated definitions, not patch suggestions. Gate outcomes separate PASS, FAIL, BLOCKED and justified NOT_APPLICABLE. They do not infer proof from an empty test set.


Gates evaluate a **named scope** against immutable input hashes. PASS means every mandatory check in that scope ran and passed. FAIL means a tested contradiction; BLOCKED means missing input/environment/proof; NOT_APPLICABLE requires a scope reason, not a missing hash. Empty scopes cannot satisfy a positive admission. A higher-level PASS cannot erase a lower-level blocker in its dependency closure. All report assertions bind actual test artifacts and gate-policy hash, not only test names.

## M0 — permission boundary for M1

**Inputs:** resolved main SHA and clean/explicit local diff; package hash; current source/build/config files; the supplied original photos and their checked hashes; actual PDF bytes; pinned upstream/shared sources; disposable fixtures. No CAD or 3D viewer is an input.

**Mandatory checks / exact pass:** (A) recorded baseline `pnpm install --frozen-lockfile` and `pnpm build` succeed with exact tool versions; (B) regression fixtures preserve all four existing route families, the eight stage IDs/order, reference links/search ordering/video navigation/PDF page behavior and valid legacy values; (C) application identifier and native permissions stay unchanged except a separately isolated test-only bridge; (D) verified source lock and all 29 PDF/photo panel mappings pass; (E) every no-fallback/input-tamper case fails before mutation; (F) multi-root publication failure/recovery and twin/private-original preservation tests pass; (G) safe-mirror/dist exclusions pass. Each A–G must be PASS. Any FAIL/BLOCKED among them means M0 is not accepted and M1 is forbidden.

M0 separately records the native test feasibility spike as PASS, FAIL or BLOCKED. A missing macOS environment may leave that spike BLOCKED without pretending it ran, provided no untested native bridge ships and all A–G pass. It is an explicit M3 native-acceptance precondition and M9 performance precondition, not a waiver of later native tests. Existing unrelated bugs (for example malformed percent-encoding or an old localStorage write failure) are recorded with reproduction/ownership; do not silently relabel a failed mandatory regression as a known bug. This milestone need not repair every pre-existing app issue.

**Outputs:** `docs/implementation/M0_REPORT.md`, `M0_GATE_REPORT.json`, baseline/after input manifests, source lock, 29-panel evidence table, test/fault-injection logs, safe-public manifest, protected-path before/after hashes and rollback/recovery instructions. Report local working diff and each command/exit status. Do not include secrets or original private imagery in shipping artifacts.

**Bindings:** repository before/after tree manifest hashes, source lock and consumed-input manifest hashes, test implementation/config/fixture hashes, generated-output/safe-mirror hashes and package contract hash. No geometry hashes are requested at M0.

**Invalidation:** any changed consumed source, PDF, pins, publication code, deny registry, lock, build scripts, relevant app/native configuration or fixtures requires rerunning the affected gates. A changed repository HEAD requires an explicit drift check. The report's top-level `m1Allowed` is true exactly when A–G all pass. A standalone prose "M0 complete" is insufficient.

## M1 / G-DATA

**Inputs:** accepted M0 mandatory gates; V40 source lock; complete printed ledger/BOM; schema v2; SEMANTIC_CONTRACT and HASH_AND_PACK_CONTRACT. **Checks:** all requested entity families, stable IDs, typed reference closure, explicit quantities/dispositions, claims/source locations, uncertainty/derivation/conflict structure, phase-specific predicates and qualified endpoints. Real geometry may remain unresolved; dangling identity/reference records may not. Inventory is source-scoped: printed count reconciliation and actual physical verification are separate.

**Exact pass:** every required printed item has an allocated identity or explicit unresolved allocation, all three variants are declared without generic substitution, all 29 planning steps remain mapped, all schema/semantic negative fixtures reject as specified, and hashing cross-language vectors/preimage-cycle checks pass. G-DATA does not require measured A–H CAD or actual inventory equality. **Outputs:** canonical registry, typed-reference index, semantic validator, model/graph input contracts, schema tests, source/uncertainty report and G-DATA report. **Bindings:** M0/source lock, schema, registry/model-input/evidence and validator bytes. **Invalidate** on any relevant record, reference, ruleset, schema, evidence or hash-policy change.

## M2 / G-GRAPH

**Inputs:** G-DATA, the source-backed 29-step seed and complete named registries. **Checks:** compile exactly three variants; preserve numbering/order; every tagged operation has an explicit state effect and inverse; qualified instances/endpoints and branch allocation; temporary/permanent wiring; symbolic consumables; every prefix derived from fresh initialState; required human conditions separated from pure projection; no dependence on animation/clock; serialization and reverse round trips.

**Exact pass:** every operation and every step boundary in all 3 graphs passes replay/inverse/reference/stock tests, including S21 free DOF, S25 handedness, S26 six B washers, S27 rear-drive parent and no final P11. Every required unknown geometry remains BLOCKED for metric use, while its semantic operation is representable. Unknown source identity/connection intent that prevents a factual graph is not substituted with a generic part to pass. **Outputs:** CompiledGraph artifacts, initial states, expected prefix hashes, operation test corpus, typed rules/attestation requirements and G-GRAPH report. **Bindings:** graph/model/evidence/schema/validator and source-lock hashes. **Invalidate** on operation order/effect, variant patch, instance allocation, dependency/rule or relevant source change. Geometry-only solution updates do not author new semantic operations; any changed mechanical input still changes model binding and triggers appropriate revalidation.

## G-CAD — engineering only

**Inputs:** identified applicable component evidence; source/claim/derivation closure; exact CAD/toolchain/solver inputs; variant constraints and before/after states; generated CAD/feature tables and solutions. **Checks:** source scope and applicability, solid validity, independent required-feature/axis/handedness checks, intended DOF, fixed/loop residuals, stack/clearance and instructed motion path coverage at declared uncertainties. **Pass:** every relevant engineering check passes with no scoped blockers and no unsupported load-bearing feature. G-CAD may be evaluated before mesh export; `meshHash` is explicitly notApplicable. It cannot depend on G-GEOMETRY or final GLB bytes.

**Outputs:** AdmissionReport gate G-CAD with available source/schema/graph/model/cad/solver/solutions/toolchain bindings; test artifact hashes; declared dependency/step/variant scope; limitations. **Invalidate:** any upstream evidence/identity/measurement/interface/CAD/constraint/solver/toolchain/policy change in scope. G-CAD alone never grants instructional geometry.

## G-GEOMETRY — final runtime admission

**Inputs:** passing scoped G-CAD; final decoded GLBs/LODs/textures/decoders; CompiledGraph and AssemblySolution artifacts; instance/interface mapping; independently recomputed mesh inventory and gate-policy version. **Checks:** all G-CAD dependencies remain current; exact asset/graph/solution IDs and hashes; handedness/units/pivots/composed transforms; final-byte mesh deviation and feature coverage; every instructive LOD; collision/path claims; no unsupported critical feature concealed as texture; source/rights/privacy eligibility and trusted/adopted report chain.

**Exact pass:** nonempty step/variant scope, complete contextual dependency closure, every mandatory check PASS, all required bindings available, blockerIds empty and every published byte covered. A failure in a context part used to locate the active part blocks the transition. An admitted static final relation does not automatically admit an untested approach path. Report capability separately for final placement, each motion path and metric cable route. Unadmitted path → static/reference guidance, not a fabricated animation.

**Outputs:** G-GEOMETRY AdmissionReport and witness artifacts; capability registry for exact step/variant/transition/LOD closure; immutable packHash after reports are fixed. Reports may live in the pack but do not include that downstream packHash. **Invalidate:** any changed evidence, model/graph/solution, CAD/solver, mesh/decoder bytes, transform convention, LOD, feature coverage or policy in scope. Pure appearance changes still require new pack identity and export checks but do not pretend the physical assembly changed.

## Independent geometry oracle requirements

Validation must not compare two copies of the exporter's own metadata and call them independent. Derive required axes, hole/slot presence, sidedness, thickness/contact planes and instance endpoints from independently admitted source/analytic feature records. Include asymmetric wrong-handed, shifted-pivot, missing-hole, wrong-axis, swapped-instance and 1000× unit mutations. Each must fail its relevant gate.

Mesh checks must measure both CAD→decoded mesh and mesh→CAD surfaces with a justified upper error bound. Checking vertices only can miss a capped hole or removed cavity. A certified adaptive sampling/bounding method is acceptable; record sample coverage, local error bounds and method version. If the chosen method cannot bound a required feature or swept path, return BLOCKED for that claim. Combine tessellation, quantization and transformed-pose numerical errors within the original 0.02/0.10 mm surface and 0.01 mm/0.0001 rad transformed-interface budgets; the optimization allowance is not additive. Source uncertainty is separate and never treated as zero. A static clearance does not establish swept clearance; test the path with conservative swept bounds or with explicitly bounded interval subdivision. Do not grant physical-fit, torque, hidden engagement or actual-unit equality from nominal CAD.


## 9. “Looks fantastic, subtly wrong” threat review

| Failure path | Detection/prevention contract | Residual boundary |
|---|---|---|
| Wrong source revision/V33 fallback | M0 verified lock, pins/gitlink and actual consumed bytes; wrong-name/hash and dirty-input negative tests. | No unresolved fallback allowed. |
| Official approximate drawing | Claim scope/uncertainty propagate into G-CAD/G-GEOMETRY. | Approximate official source is still not dimensional authority. |
| Generic motor/servo/camera/HAT/community CAD | Identified definition and explicit applicable evidence chain before component admission. | Exact identities/interfaces remain Q blockers; similarity is not closure. |
| Wrong scale, handedness, pivot or double transform | Separate mm/m types, determinant+1 transform, absolute solution poses, asymmetric/factor1000 mutations and composed interface checks. | Actual exporter tests remain M8. |
| Blender changes bore/axis/pivot | Mechanical authority upstream; no engineering edits in presentation; independent final-byte surface/feature comparison. | Appearance approval cannot override failure. |
| Missing hole/capped cavity despite plausible silhouette | Bidirectional bounded CAD–mesh deviation plus independently required feature witnesses. | Vertex-only proximity cannot pass. |
| Old GLB/new model or changed decoder | Immutable packHash; exact artifact byte hashes, registry/graph/solution closure and cache tuple. | Reject stale or incompatible data; no generic fallback. |
| Wrong repeated instance or reversed symmetric part | Qualified physical endpoints, keyed joint coordinates, per-instance roots and orientation/source checks. | A shape-identical different instance still fails identity. |
| Cable endpoint/routing wrong | Typed cable instance/end/connection point and pin mapping, occupancy, final P11 absence, scoped route capability. | Unresolved3V3/5V conflict remains blocking for electrical applicability. |
| Incorrect variant branch | Explicit patch ID/span and graph per variant; all 29x3 stock/connection tests. | Global graphSetHash never substitutes for selected graphHash. |
| Source/geometry silently promoted | Scoped claims and typed derivation/conflict records; no unresolved field payload; independent gate closure. | No checkbox or mesh quality promotes confidence. |
| Static pose correct, insertion path impossible | Separate placement/path capabilities and conservative swept bounds. | Unproven path stays static/reference-only. |
| Attractive screen hides unsaved or false completion | Committed acknowledgments, independent replay, separate physical ledger and zeroing epochs. | Animation cannot commit mechanical or physical truth. |
| Publication race exposes mixed generation/private media | Single content writer with reader leases/journal recovery; safe public mirror; immutable twin pointer. | Missing recovery evidence blocks M0, not a best-effort write. |
| Wrong but self-consistent validator/exporter | Independently source-derived feature/witness oracle; fault mutations and gate-policy binding. | A hash proves identity, not truth; independent source applicability remains required. |

## 10. Runtime, performance, privacy and future observation

Retain Three.js WebGL2 and React Three Fiber9 with the current React19 application. The existing specification already separates scene mutations from canonical state, handles demand rendering/animation lifecycle, disposal, pointer/camera arbitration, WebGL failure/reference fallback and accessibility. The audit adds typed runtime asset/registry/solution contracts; it does not demand WebGPU or an alternative engine.

Reuse immutable geometry/material buffers, retain one addressable physical identity, and introduce draw instancing only when measurement justifies it and a tested draw-index-to-instance bijection preserves picking/isolation. Do not allocate or set React state for every fastener on every frame. Cold-load only the selected variant and needed detail; do not bring meshes into the eager documentation access module.

Existing performance targets are retained, not claimed attained: recorded Apple Silicon Mac with at least16GiB RAM and exact OS/chip/display/power configuration; 1440×900 at DPR≤1.5; 60fps target with p95≤20ms and p99≤33ms; initial active-variant pack≤25MiB; total≤60MiB; default decoded textures≤64MiB; target≤300k visible triangles/250draw calls with measured exceptions; process-tree resident memory≤600MiB and≤300MiB incremental over Home;20teardown cycles. The test plan distinguishes OS-cold from app-cold caches and p95 from a single favorable run. Exact native metrics/settling/GC method must be reported; no forced-GC availability is assumed. M0 records the actual target; a missing machine means performance certification remains BLOCKED.

Keep privacy proportional: no enterprise governance, cloud service or paid backend is introduced. User images are private reference assets, not default bundled textures. Source originals are preserved; approved output is built from the safe mirror. Data imports cannot choose canonical destinations or inject executable assets. Future camera data stays local by default. Current external video playback is separate from an offline mechanical tutorial.

Camera/AR remains M13/M14. Calibrated pose, visible-feature scope, occlusion and measurement uncertainty are explicit; monocular imagery does not prove hidden engagement, torque, exact depth, electrical safety or actual unit fit. No V1 admission depends on future camera accuracy. A camera observation records its modality/calibration/model dependency and never upgrades a self-report by relabeling it.

## 11. Package-validator audit and actual validation scope

The original174 report families classify as **95 STRUCTURAL,54 SEMANTIC,25 EVIDENCE,0 IMPLEMENTATION,0 MECHANICAL**. The original report itself explicitly excluded builds/CAD/runtime/physical testing; it should not be accused of claiming those ran. Its weakness is reproducibility and limited semantic coverage, not that every check was meaningless. [Full per-check classification](AUDIT_EVIDENCE/original-check-classification.json) is included.

Structural checks cover schema syntax, example acceptance, document references and dependency descriptions. Semantic checks cover numbering, prerequisite/BOM planning arithmetic and declared relationships, not the production reducer. Evidence checks mostly bind bytes, dimensions and source bookkeeping; they do not verify exact manufactured geometry. No numeric check count establishes whole-design correctness.

The corrected package includes [the validator](AUDIT_TOOLS/validate_package.py), pinned [Python requirements](AUDIT_TOOLS/requirements.txt), full synthetic probes and a raw input-digest binding. Run it from any directory:

```sh
python -m pip install -r AUDIT_TOOLS/requirements.txt
python AUDIT_TOOLS/validate_package.py
```

Default mode recomputes checks and validates report/input binding and every root integrity entry; it does not modify the package. `--write` is a maintainer-only regeneration command and is not evidence that a changed source has been independently reviewed. The two current report JSON files agree; the old174 report/schema/manifest are isolated under HISTORICAL. The report deliberately counts STRUCTURAL, SEMANTIC_FIXTURE and EVIDENCE separately and lists unexecuted implementation/mechanical tests.

The validator itself was exercised on changed-input copies: see [mutation results](AUDIT_EVIDENCE/validator-mutation-results.json). Such tests demonstrate specific reject paths, not an exhaustive production-engine proof. Fresh extraction/default verification is recorded in the delivery checks. See [AUDITED_PACKAGE_VALIDATION_REPORT.json](AUDITED_PACKAGE_VALIDATION_REPORT.json) for the final exact counts and input digest, rather than a stale hand-copied count in this report.

## 12. Corrections applied, remaining concerns and implementation decision

[AUDIT_CHANGELOG.md](AUDIT_CHANGELOG.md) maps every finding to the files changed and exact correction/reason. Original photographs/crops/index/manifest are byte-preserved. The complete specification, wrappers, examples, planning records and supporting documents remain in this package; this is not a patch-only ZIP. Combined reading copy and package hashes are regenerated from current files.

Remaining concerns are explicit project gates, not silently resolved dimensions: PDF binary/revision/panels Q-02; exact A–H engineering geometry; servo/motor/horn/wheel/rivet/fastener identities and stacks; board/camera/cable geometry and revision; ultrasonic applicability conflict; actual inventory; native toolchain/automation/performance feasibility; independent CAD/export/physical certification. The18 original Q records remain bounded in OPEN_QUESTIONS_AND_BLOCKERS. A useful reference-first application can precede real geometry, but an unproven component cannot enter an instructional metric transition.

**Go/no-go:** hand the audited **HANDOFF_M0.md** to a coding agent with this whole audited ZIP. It is authorized to execute M0 only. M0 must produce actual baseline/regression/source/publication/privacy/rollback proof and all mandatory A–G PASS before M1. The native-only feasibility exception is explicit and does not waive the PDF or preservation gates. No identified P0/P1 specification correction remains; implementation/evidence obligations are not certified by this audit. Current repository baseline is the SHA at the top of this report; the agent must re-resolve main before changing files.

The archive's final SHA-256 is supplied alongside the ZIP, not embedded within itself. The ZIP includes a complete path+byte integrity manifest for its contents. Repository writes, branches, commits and PRs were not performed.
