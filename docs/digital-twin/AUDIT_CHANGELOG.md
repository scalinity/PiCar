# Audit changelog — integrated corrections

Original ZIP is unchanged. This table refers to the complete audited copy. Finding status is CORRECTED_IN_SPEC; future implementation acceptance is not represented as executed.
## PX-AUD-01 — P1

**Files:** `HANDOFF_M0.md`, `MILESTONES.md`, `MACHINE_READABLE_SCHEMAS/milestone-plan.json`, `VERIFICATION_AND_TEST_PLAN.md`, `GATE_CONTRACTS.md`, `SOURCE_PUBLICATION_CONTRACT.md`, `MACHINE_READABLE_SCHEMAS/m0-gate-report.schema.json`, `MACHINE_READABLE_SCHEMAS/documentation-source-lock.schema.json`, `MACHINE_READABLE_SCHEMAS/documentation-source-lock.template.json`.

**Exact correction:** GATE_CONTRACTS fixes mandatory A–G with m1Allowed iff all pass; formal source-lock/M0 report schemas and integrated HANDOFF_M0 specify outputs, hashes, rollback and native-only feasibility exception. Starting M0 does not assert that its PDF gate has passed.

**Reason:** Original M0 permits an explicitly blocked PDF source gate but does not say whether that milestone may nevertheless be considered complete for its M1 dependent. Its report fields and required evidence are prose rather than a checked pass/permission predicate. Native feasibility and preservation regressions also lack an explicit blocked-environment disposition.

**Proof obligation:** Reject duplicate/missing A–G, any mandatory BLOCKED with m1Allowed=true, incomplete branch/panel map and unverifiable PDF hash. A valid report plus actual hashed logs and rerunnable tests is required before M1; schema shape alone is insufficient.

## PX-AUD-02 — P1

**Files:** `ARCHITECTURE.md`, `ASSET_PIPELINE_SPEC.md`, `HANDOFF_M0.md`, `MILESTONES.md`, `REPOSITORY_CHANGE_MAP.md`, `SOURCE_PUBLICATION_CONTRACT.md`, `HASH_AND_PACK_CONTRACT.md`, `GATE_CONTRACTS.md`.

**Exact correction:** SOURCE_PUBLICATION_CONTRACT specifies multi-root journal/leases, exact old-or-new recovery, a safe public mirror for dev/build, byte-preserved local originals and explicit denied-media/allowlist checks. Twin packs use a separate immutable directory and CAS pointer protocol.

**Reason:** Original text requests safe/atomic publication without a reader/writer and recovery protocol for pages, indexes and public media. Actual build.ts deletes OUT_PAGES and OUT_PUBLIC before emitting replacements. Gitignored private media can be present in public/content even though it is absent from a fresh clone.

**Proof obligation:** Inject every publication and recovery boundary; restart and compare complete tree manifests. Race readers/writers; check safe-mirror/dist exclusion with synthetic credentials and unchanged originals, custom-docs and twin sentinel hashes.

## PX-AUD-03 — P1

**Files:** `DIGITAL_TWIN_DATA_MODEL.md`, `ASSEMBLY_ENGINE_SPEC.md`, `MACHINE_READABLE_SCHEMAS/digital-twin.schema.json`, `SEMANTIC_CONTRACT.md`, `HASH_AND_PACK_CONTRACT.md`, `MACHINE_READABLE_SCHEMAS/AssemblyState.schema.json`.

**Exact correction:** Add complete typed state collections, explicit operation parentAssignments, nullable no-parent semantics and effect/write rules. The initial state declares all IDs. Hashes are derivatives, and serialized full-state undo restores the exact prior state with an after-hash guard.

**Reason:** AssemblyState omits cable route records, consumable allocations/lot capacity and subassembly membership although operations change them and exact inverse promises to restore them. stockDispositionHash is not the underlying stock data. The specification does not define an alternate authoritative derivation for these omitted effects.

**Proof obligation:** Original schema rejects a state with the needed route/lot/group fields; v2 accepts the explicit shape. M2 must round-trip every operation and all 29×3 prefixes through JSON in a fresh process, including unresolved cut lengths, nested grouping and connected cables.

## PX-AUD-04 — P1

**Files:** `MACHINE_READABLE_SCHEMAS/digital-twin.schema.json`, `ASSEMBLY_ENGINE_SPEC.md`, `DIGITAL_TWIN_DATA_MODEL.md`, `SEMANTIC_CONTRACT.md`, `HASH_AND_PACK_CONTRACT.md`.

**Exact correction:** Use Endpoint for physical guides/anchors/focus; key joint coordinates by connectionId+DOF, with unit/type checks. Retain reusable definition-local frames only when explicitly qualified by definitionId.

**Reason:** Endpoint already correctly pairs instance and interface, but routeCable.guideInterfaceIds, MotionSegment.anchorInterfaceRef, CameraInstruction.focusInterfaceIds and jointCoordinates/interfaceId do not. A definition-local feature is not a unique physical feature when a definition is reused.

**Proof obligation:** Construct two instances of the same servo/washer definition. Reject the old bare-reference payload in v2 and wrong-definition endpoint semantically; update one joint without affecting the other and resolve independent picks/anchors.

## PX-AUD-05 — P1

**Files:** `ASSEMBLY_ENGINE_SPEC.md`, `MACHINE_READABLE_SCHEMAS/digital-twin.schema.json`, `ARCHITECTURE.md`, `SEMANTIC_CONTRACT.md`, `PERSISTENCE_CONTRACT.md`, `MACHINE_READABLE_SCHEMAS/ZeroingAttestation.schema.json`, `MACHINE_READABLE_SCHEMAS/ProcedureAcknowledgment.schema.json`.

**Exact correction:** Add ProcedureAcknowledgment and ZeroingAttestation in the session ledger, bound to session/variant/model/graph/procedure and servo epoch, with one-operation consumption. Projection registers requirements only; physical commands check/consume/invalidate records transactionally.

**Reason:** Prose requires named servo, fresh procedure revision, horn-operation scope and a no-movement declaration. Confirmation only has generic statement/dependency fields; the condition evaluator has no phase, so review and physical completion are not mechanically separated by the record contract.

**Proof obligation:** Reject wrong servo/variant/procedure/epoch, movement-not-denied and consumed attestation reuse. A lost-ack retry must not consume twice. Review/seek/reverse must produce no attestation or hardware action. A checkbox cannot resolve the ultrasonic evidence conflict.

## PX-AUD-06 — P1

**Files:** `MACHINE_READABLE_SCHEMAS/digital-twin.schema.json`, `GEOMETRY_AND_EVIDENCE_SPEC.md`, `MILESTONES.md`, `ASSET_PIPELINE_SPEC.md`, `GATE_CONTRACTS.md`, `HASH_AND_PACK_CONTRACT.md`.

**Exact correction:** Use tagged stage-specific hash bindings; G-CAD/G-COMPONENT meshHash is notApplicable, not fake data. Positive G-GEOMETRY requires all bindings, nonempty scope, empty blockers, gate-policy hash and test artifact hashes; semantic closure/trust checks remain mandatory.

**Reason:** AdmissionReport unconditionally requires meshHash even for G-CAD before mesh export. A truthful missing artifact cannot be represented without a placeholder hash. It also structurally permits PASS with blockers or an empty G-GEOMETRY step scope, although prose intends a stronger gate.

**Proof obligation:** Accept truthful pre-export G-CAD; reject G-GEOMETRY PASS with missing mesh binding, blockers or empty scope. Verify a real geometry report against independently recomputed upstream hashes and executed witness tests in M7/M8.

## PX-AUD-07 — P1

**Files:** `MACHINE_READABLE_SCHEMAS/digital-twin.schema.json`, `ASSET_PIPELINE_SPEC.md`, `ASSEMBLY_ENGINE_SPEC.md`, `HASH_AND_PACK_CONTRACT.md`, `MACHINE_READABLE_SCHEMAS/RuntimeRegistry.schema.json`, `MACHINE_READABLE_SCHEMAS/CompiledGraph.schema.json`, `MACHINE_READABLE_SCHEMAS/AssemblySolution.schema.json`, `MACHINE_READABLE_SCHEMAS/RuntimeTransform.schema.json`.

**Exact correction:** Add typed CompiledGraph and AssemblySolution artifacts, stable variant/solution indexes and equality checks; distinct RuntimeTransform in metres; explicit boundsM, LOD node sets and hashed decoder artifacts. Runtime roots retain unique physical identities. The hash-bound RuntimeRegistry closes supporting references; graphSetHash separates the multi-variant root from each selected graph, and only compiled graphs own runtime steps. Solution poses are explicitly world transforms.

**Reason:** RuntimeManifest lists steps and opaque solution ArtifactRefs but lacks an executable graph artifact/operation table and stable solution index. Its interfaceFrames reuse CAD Frame.translationMm despite the runtime metre convention. Promised bounds/decoder/LOD identification is not fully in the schema.

**Proof obligation:** Reject old/untyped graph or solution bytes, wrong variant/index, CAD translationMm in a runtime frame, missing LOD node/decoder and mismatched duplicate records. Exercise known/unknown solution resolution without identity-transform fallback.

## PX-AUD-08 — P1

**Files:** `DIGITAL_TWIN_DATA_MODEL.md`, `ASSET_PIPELINE_SPEC.md`, `ARCHITECTURE.md`, `REPOSITORY_CHANGE_MAP.md`, `MACHINE_READABLE_SCHEMAS/digital-twin.schema.json`, `HASH_AND_PACK_CONTRACT.md`, `SEMANTIC_CONTRACT.md`.

**Exact correction:** HASH_AND_PACK_CONTRACT fixes JCS/domain separation, materialized acyclic input projections, exact own-field exclusions, upstream-only stage bindings and separate packHash publication/cache identity. Appearance changes do not fabricate mechanical changes.

**Reason:** Original text versions mechanical and presentation domains separately but publishes all packs under modelHash. It requires every artifact to record all five hashes and mentions excluding an unspecified own hash; neither state-hash preimages nor downstream/report/mesh exclusions are exact.

**Proof obligation:** M1 cross-language serialization/preimage tests; M8 material-only rebuild changes packHash but preserves modelHash, stale bytes/decoder/solution mutations reject, self/downstream input edges reject, and old pinned packs remain usable.

## PX-AUD-09 — P1

**Files:** `ARCHITECTURE.md`, `ASSEMBLY_ENGINE_SPEC.md`, `MILESTONES.md`, `REPOSITORY_CHANGE_MAP.md`, `PERSISTENCE_CONTRACT.md`, `SEMANTIC_CONTRACT.md`.

**Exact correction:** PERSISTENCE_CONTRACT specifies aggregate-scoped command_results/requestHash and exact retry ordering, one-transaction migration identity, explicit LEGACY_DIVERGENCE recovery, consistent backups and parity/fault tests. The original steps.assembly marker remains a legacy self-report, never 29 physical confirmations.

**Reason:** Original prose promises idempotent commands, one-way additive migration and backups without defining duplicate-before-CAS ordering, same-ID/different-payload rejection, legacy-key edits after downgrade/re-upgrade or WAL-consistent backup. These are not supplied by choosing SQLite.

**Proof obligation:** Run identical SQLite/IndexedDB cases for lost acknowledgment, ID reuse, concurrent commands, interrupted migration, downgrade divergence, malformed raw preservation, quota/disk failure, newer schema, WAL backup/restore and variant fork. No actual database test was run in this audit.

## PX-AUD-10 — P2

**Files:** `MACHINE_READABLE_SCHEMAS/digital-twin.schema.json`, `DIGITAL_TWIN_DATA_MODEL.md`, `ASSEMBLY_ENGINE_SPEC.md`, `SEMANTIC_CONTRACT.md`.

**Exact correction:** Add patch id/variantId and a single nonempty contiguous replacement span per step/variant; preserve explicit replacement order and require disjoint active/inactive sets. No implicit last-writer-wins.

**Reason:** AssemblyStep.variantPatchRefs contains IDs, but VariantPatch does not define an id. Its replace/with arrays also lack an explicit order/overlap/insertion resolution contract.

**Proof obligation:** Reject missing patch ID, mismatched step/variant, dangling refs, overlap and discontiguous replacement. Compile all three branches deterministically and verify stock/connection consistency.

## PX-AUD-11 — P2

**Files:** `MACHINE_READABLE_SCHEMAS/digital-twin.schema.json`, `DIGITAL_TWIN_DATA_MODEL.md`, `GEOMETRY_AND_EVIDENCE_SPEC.md`, `SEMANTIC_CONTRACT.md`, `MACHINE_READABLE_SCHEMAS/DerivationRecord.schema.json`, `MACHINE_READABLE_SCHEMAS/ConflictRecord.schema.json`, `MACHINE_READABLE_SCHEMAS/FrameRecord.schema.json`.

**Exact correction:** Add typed expected values/phase/version, a fixed predicate registry, FrameRecord, DerivationRecord and ConflictRecord; require typed reference closure, method artifacts and propagated source limitations. Do not demand JSON Schema prove foreign-key or physical facts.

**Reason:** VerificationRule has comparator/targets but no expected operand, predicate version or execution phase. Claims do contain method/scope/inputClaimIds, which is useful, but numeric derivationRef and conflictIds have no dedicated reproducible numeric-method/conflict record contract.

**Proof obligation:** Reject incompatible predicate/comparator/expected units and wrong reference types. Preserve a known estimate with unresolved uncertainty as representable but mechanically blocked. Reproduce a derivation and reject unresolved method/conflict or approximate-source promotion at admission.

## PX-AUD-12 — P2

**Files:** `ASSET_PIPELINE_SPEC.md`, `GEOMETRY_AND_EVIDENCE_SPEC.md`, `VERIFICATION_AND_TEST_PLAN.md`, `GATE_CONTRACTS.md`.

**Exact correction:** GATE_CONTRACTS requires independent source/analytic witnesses, bidirectional bounded surface error, every instructional LOD, conservative swept-path bounds and separate static/path capabilities. Unbounded methods return BLOCKED; original budgets and source-uncertainty limits remain.

**Reason:** Original numerical budgets and independent checks are good, but vertex/surface and path checks do not fix the coverage/error-bound obligation or independence from the exporter’s metadata. A test name and threshold alone are not a coverage argument.

**Proof obligation:** Inject missing hole, wrong axis/handedness, shifted pivot, swapped instance and 1000× scale mutants; each must fail the relevant independent check. Record coverage bounds and final decoded byte hashes, not just screenshots.

## PX-AUD-13 — P2

**Files:** `MILESTONES.md`, `MACHINE_READABLE_SCHEMAS/milestone-plan.json`, `REPOSITORY_CHANGE_MAP.md`, `MILESTONE_REVIEW.md`, `MACHINE_READABLE_SCHEMAS/milestone-phase-plan.json`.

**Exact correction:** Preserve the coarse DAG; add an explicit phase plan and ownership/rollback review. Require per-definition and per-step dependency receipts, shared-contract single ownership and final full-coverage aggregation.

**Reason:** The coarse dependency DAG is acyclic and fundamentally correct. The missing contract is the distinction between fixture start, real-component scoped acceptance and full milestone acceptance, plus concrete shared-file ownership for parallel agents.

**Proof obligation:** Recompute topological order and transitive reduction independently; reject phase cycles, production phases without G-CAD/G-GEOMETRY receipts, duplicate ownership and attempts to use a fixture receipt as real-part acceptance.

## PX-AUD-14 — P2

**Files:** `PACKAGE_VALIDATION_REPORT.json`, `CRITICAL_REVIEW.md`, `README.md`, `AUDIT_TOOLS/validate_package.py`, `AUDIT_TOOLS/requirements.txt`, `AUDIT_EVIDENCE/`, `HISTORICAL/`, `AUDITED_PACKAGE_VALIDATION_REPORT.json`.

**Exact correction:** Preserve the original report/schema/manifest as historical; add a runnable independent package validator, explicit counterexamples, inspection inventory, classification, current reports and regenerated integrity manifest. Do not claim the absent original image archive was independently rehashed.

**Reason:** The ZIP includes a report but no script/configuration that ran the 174 checks. Most reported checks are schema/document structure or scoped arithmetic; the original reference-image archive whose hash was checked is not included. It cannot all be independently rerun from this ZIP alone.

**Proof obligation:** Run the validator on a clean extraction; mutations to schema/fixture/evidence/hash/links/phase graph must fail. The current report must bind its exact input set and list unexecuted app/native/mechanical categories. Compare all original ZIP manifest entries directly before edits.

## PX-AUD-15 — P2

**Files:** `V40_ASSEMBLY_LEDGER.md`, `MACHINE_READABLE_SCHEMAS/v40-step-seed.json`.

**Exact correction:** Change both copies to chassis/rear-drive. Preserve the printed step number, rear-wheel/shaft connection intent and all evidence/geometry blockers; do not infer a pose.

**Reason:** Both human ledger and machine seed label S27 parentAssemblies as steering/front while the same record mounts the two rear wheels on the motor output shafts. This is an internal factual grouping error, not an unknown dimension.

**Proof obligation:** Assert S27 is rear-drive in both records and its assigned group is not the front steering group. In M2, test grouped/exploded selection and rear motor-shaft endpoints; preserve all 29 numbering and BOM arithmetic.

## Cross-cutting integrity and presentation updates

README identifies the audited v2 contract and read order. All schema wrappers point at the v2 canonical definitions; new records have wrappers, and the current schema/examples/probes are executed. FULL_SPECIFICATION is regenerated from every current root Markdown document rather than leaving the old combined narrative canonical. Current validation reports and PACKAGE_MANIFEST.sha256 are regenerated after edits; the original174 report/schema/manifest remain under HISTORICAL. AUDIT_REPORT, machine-readable scorecard/contradiction matrix/findings, original inspection inventory and validator mutations are added. Original EVIDENCE files are unchanged.

During audit self-checking, the runtime frame probe was corrected to use the original Frame.rotationXYZW field (not an invented quaternion field), and PackPath was corrected to allow a normal filename extension at the pack root while still rejecting hidden/traversal/URL paths. These repairs affected audit fixtures/contracts, not repository code or source evidence. RuntimeRegistry and graphSetHash close the supporting-record and multi-variant ambiguity within PX-AUD-07/08; they do not introduce another source of mechanical truth.

## No application implementation

No application TypeScript/React/Rust, CAD, GLB, robot commands, repository mutation, branch, commit or PR was produced. Python under AUDIT_TOOLS validates this specification package only. The audit did not resolve physical dimensions or convert printed stock into observed inventory.
