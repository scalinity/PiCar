# Machine-readable specification contracts

`digital-twin.schema.json` is JSON Schema 2020-12 with closed record shapes for all requested entities plus Claim, AssemblyOperation, AssemblySession, AdmissionReport and RuntimeManifest. The per-entity files are relative-reference entry points into the same `$defs`, not independently maintained schema copies. IDs in schema `$id` use a local namespace; validation must resolve the bundled files locally, never fetch `picar.local` from a network.

These are proposed **authoring/runtime contracts**, not an implemented application or an admitted component library. M1 places the accepted canonical schema in `digital-twin/schemas`, generates TS types and writes semantic validators. Do not run a production model importer against the planning seed simply because it is valid JSON.

## Files and authority

`v40-step-seed.json` records all29 printed steps, sources, parts/hardware text, constraints, orientation, tools, camera/motion intents, checks and blockers. Its status is explicitly NON_EXECUTABLE_PENDING_CANONICAL_BINDING. M2 must bind stable instances, ordered operations and endpoints; it must not rediscover or reorder the sequence. `planning-step-seed.schema.json` validates that seed's exact shape, not production AssemblyStep semantics.

`printed-hardware-ledger.json` separates counted printed primary/backup stock and planned per-variant usage from unresolved actual physical inventory. `milestone-plan.json` and `blocker-register.json` mirror the implementation assignments and bounded open questions. Those planning registries are not automatically production PartInstances or UnresolvedEvidenceItem records.

## Example meaning

The standoff definition and interface examples deliberately contain no final pose or CAD asset. The designation claim is VERIFIED only for what the manual names. The numerical 26 mm example is **schema-only**: it illustrates a DERIVED value with an unclosed designation-convention reference and unresolved uncertainty. It does not pass referential integrity or G-GEOMETRY and is not a released measurement. This prevents a convenient example from becoming invented manufacturing truth.

Files ending `.invalid.json` are intentional rejection fixtures: an unresolved value carrying a number, a derived value lacking its derivation reference, a VERIFIED claim without evidence, and an unauthorized `verified` field on a definition. Their schema rejection is tested in the package report. Valid shape does not mean complete evidence or geometric admission.

## Required semantic validation beyond JSON Schema

Resolve all IDs and source locators; enforce class-specific required fields and compatible part types; require nonnegative finite dimensions where the specific feature demands them; normalize quaternions and reject negative zero before canonical hashing; reject unsafe asset paths and unapproved URIs; enforce source engineering-use limitations and inherited derivation uncertainty; distinguish active versus unused/inapplicable references; validate inventory equations and operation DAGs; validate before/after/inverse operation contracts; and validate mechanical DOF/residuals and final-byte mesh/error budgets.

No generic `ResolvedRef` with an unresolved state may cross a gate that requires that relationship. When a relationship is legitimately absent rather than unknown—such as no owner for a standalone part or no deactivation for a permanent final cable—use an explicit notApplicable reference state with a reason. The schema includes that distinction; null must never carry three meanings. An example with unresolved ownership is not evidence that the relationship exists.

`instructionGeometry`, `metricAdmitted`, CAD maturity and admission results are compiler outputs, not trusted author toggles. Schema validation alone cannot prevent a malicious author setting a permitted enum value; the admission compiler recomputes capabilities from hash-bound reports and evidence. Runtime validates equality with those derived capabilities rather than trusting GLB extras.

M1 should generate TypeScript with `json-schema-to-typescript` or its verified locked successor **without changing the schema as authority**; the default selected tool is json-schema-to-typescript. Python validates JSON through the same bundled schema using a pinned Draft202012 validator. Runtime validators use AJV's 2020-12 implementation. Package schema checks are tooling checks, not a substitute for application tests.

## Audited v2 changes and entrypoints

Use digital-twin.schema.json and the local wrappers at `/spec/v2/`. New exported records include CompiledGraph, AssemblySolution, FrameRecord, ProcedureAcknowledgment, ZeroingAttestation, DerivationRecord and ConflictRecord. The original 17 operation tags remain, with parentAssignments and instance-qualified guide/joint/anchor fields. RuntimeAsset/Manifest, AdmissionReport and VariantPatch have integrated shape corrections. Do not use HISTORICAL/digital-twin.v1.schema.json for implementation.

The independent documentation-source-lock.schema.json and m0-gate-report.schema.json describe M0 reports, not fabricated canonical mechanical records. documentation-source-lock.template.json is BLOCKED pending actual PDF verification. Run `python ../AUDIT_TOOLS/validate_package.py` from this directory or see the root README for the portable command. Schema validation is structural; SEMANTIC_CONTRACT, HASH_AND_PACK_CONTRACT, PERSISTENCE_CONTRACT, SOURCE_PUBLICATION_CONTRACT and GATE_CONTRACTS in the parent directory define the mandatory compiler/runtime checks.

RuntimeRegistry is the closed typed supporting-record bundle, hash-bound by RuntimeManifest.registry. RuntimeManifest.graphSetHash aggregates variant graph identities; there is no duplicated root steps array. Session and solution graphHash always identify one selected variant.
