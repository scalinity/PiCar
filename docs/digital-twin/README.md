# PiCar-X Z0104V40 — end-to-end implementation specification

**Audited specification v2 · 29 September 2026 · planning contract, not an implementation**

Repository: `scalinity/PiCar`. Inspected `main` HEAD:
`9e54b2fb3199c22f5d5c7cd67c8e4531ab2246f8`.

## Governing contract

**UNKNOWN != APPROXIMATE.** An unmeasured shape is not an engineering measurement. A successful CAD build is not evidence of component identity. A tutorial confirmation is not a physical inspection. No renderer, exporter, AI agent, or database migration may promote a claim's confidence.

This package fixes the product, system boundaries, state semantics, IDs, coordinate system, authoring pipeline, geometry admission policy, integration path, and milestone order. Remaining uncertainties are evidence gates with named owners and closure conditions, not invitations to invent dimensions.

## Independent audit and v2 controlling contracts

Read [AUDIT_REPORT.md](AUDIT_REPORT.md) for the verdict, full 15-finding register,22-category scorecard,40-concept consistency matrix, threat/gate reviews and limitations. [AUDIT_CHANGELOG.md](AUDIT_CHANGELOG.md) identifies integrated fixes. The original174-check artifacts under HISTORICAL are historical only, not the current schema or validation result.

| Additional normative document | Boundary fixed |
|---|---|
| [SEMANTIC_CONTRACT.md](SEMANTIC_CONTRACT.md) | Complete state, effect table, qualified references, typed conditions and variant splices |
| [HASH_AND_PACK_CONTRACT.md](HASH_AND_PACK_CONTRACT.md) | Hash preimages, registry/graphs/solutions, metre transforms and immutable pack identity |
| [PERSISTENCE_CONTRACT.md](PERSISTENCE_CONTRACT.md) | Retry/CAS, migration reentry, consistent backup and adapter fault tests |
| [SOURCE_PUBLICATION_CONTRACT.md](SOURCE_PUBLICATION_CONTRACT.md) | Documentary lock, safe public mirror, multi-root publication and privacy |
| [GATE_CONTRACTS.md](GATE_CONTRACTS.md) | Exact M0/M1/M2 and engineering/runtime admission predicates |
| [MILESTONE_REVIEW.md](MILESTONE_REVIEW.md) | All15 milestone interfaces,18 phase boundaries and ownership |

These are integrated expansions of the corresponding original domain documents, not optional patch notes. They fix the v2 representation/semantic details at those boundaries. Any remaining contradiction must be raised, not silently resolved by an implementation agent. Evidence limitations remain controlling.

## Reproduce package checks

```sh
python -m pip install -r AUDIT_TOOLS/requirements.txt
python AUDIT_TOOLS/validate_package.py
```

Default validation is read-only. It checks actual current schema/examples/probes, planning consistency, evidence bytes, document links, combined-document coverage, input-digest binding and the complete integrity manifest. [AUDITED_PACKAGE_VALIDATION_REPORT.json](AUDITED_PACKAGE_VALIDATION_REPORT.json) records exact results and tests not executed. `--write` regenerates reports for a deliberate new specification revision; it cannot substitute for reviewing changed inputs. [FULL_SPECIFICATION.md](FULL_SPECIFICATION.md) is the combined reading copy; individual files and schemas are the implementation references.

## Read order and authority

| Document | Purpose |
|---|---|
| [PRODUCT_SPEC.md](PRODUCT_SPEC.md) | User behavior, scope, accessible controls, completion semantics |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Inspected baseline, chosen stack, native/frontend boundary, storage |
| [DIGITAL_TWIN_DATA_MODEL.md](DIGITAL_TWIN_DATA_MODEL.md) | Canonical identities, claims, interfaces, transforms, versioning |
| [ASSEMBLY_ENGINE_SPEC.md](ASSEMBLY_ENGINE_SPEC.md) | Reversible model, physical confirmations, motion, camera, explosion |
| [V40_ASSEMBLY_LEDGER.md](V40_ASSEMBLY_LEDGER.md) | All 29 printed steps, branches, introduced items, constraints and warnings |
| [BOM_RECONCILIATION.md](BOM_RECONCILIATION.md) | Prescribed consumption, printed backup stock, unresolved inventory |
| [GEOMETRY_AND_EVIDENCE_SPEC.md](GEOMETRY_AND_EVIDENCE_SPEC.md) | Source hierarchy, component strategies, tolerances, geometry gate |
| [ASSET_PIPELINE_SPEC.md](ASSET_PIPELINE_SPEC.md) | Reproducible CAD-to-runtime contract, GLB IDs, optimization |
| [VERIFICATION_AND_TEST_PLAN.md](VERIFICATION_AND_TEST_PLAN.md) | Test matrix, commands, adversarial fixtures, release acceptance |
| [REPOSITORY_CHANGE_MAP.md](REPOSITORY_CHANGE_MAP.md) | Exact integration points, target paths, ownership and migration |
| [MILESTONES.md](MILESTONES.md) | Executable milestone scope, dependencies, gates, rollback |
| [OPEN_QUESTIONS_AND_BLOCKERS.md](OPEN_QUESTIONS_AND_BLOCKERS.md) | Bounded evidence and technical gates |
| [EVIDENCE_INSPECTION.md](EVIDENCE_INSPECTION.md) | Six-image inspection, what the images do and do not establish |
| [SOURCE_REGISTER.md](SOURCE_REGISTER.md) | Pinned repository citations and inspected external primary sources |
| [FUTURE_CAMERA_AND_AR_SPEC.md](FUTURE_CAMERA_AND_AR_SPEC.md) | Later local observation, calibrated pose and AR boundaries |
| [CRITICAL_REVIEW.md](CRITICAL_REVIEW.md) | Adversarial review and corrections incorporated |
| [HANDOFF_M0.md](HANDOFF_M0.md) | Paste-ready first implementation-agent assignment |
| [MACHINE_READABLE_SCHEMAS/README.md](MACHINE_READABLE_SCHEMAS/README.md) | Proposed JSON Schema and seed/example contracts |

Normative words **MUST**, **MUST NOT**, and **SHOULD** describe implementation requirements. Decision IDs `D-*`, acceptance IDs `AC-*`, gate IDs `G-*`, and blocker IDs `Q-*` are stable. A conflict between this package's documents is an implementation blocker; do not silently choose the more convenient wording. Mechanical evidence and unresolved-value rules outrank presentation preferences. The data-model document controls representation; the engine document controls state semantics; the ledger controls printed-step order.

## What is authorized now

**Start M0 only using [HANDOFF_M0.md](HANDOFF_M0.md).** The required audit corrections are integrated. M1 is forbidden until mandatory M0 gates A–G all PASS. The PDF template intentionally remains BLOCKED; no PDF SHA-256 or mechanical source gate is fabricated. Later software/fixture work follows MILESTONE_REVIEW's phase plan only after its inputs pass.

Exact V40 geometry, component applicability and actual-unit verification remain evidence gates. No new owner measurement is needed to begin M0. Missing engineering evidence leaves affected later transitions reference-only; it never licenses plausible dimensions.

## Deliverable boundaries

The included JSON files are **specification schemas and planning seeds**, not released PiCar CAD or production assembly data. `v40-step-seed.json` is explicitly non-executable until M2 binds canonical instances, operations and endpoints. No GLB or parametric solid in this package is asserted to represent the kit. The only images included are the user's original reference evidence and limited legibility crops with provenance. They are not automatically licensed for public redistribution or app bundling.

This inspection did not run the repository's frontend, native build, or tests. It inspected the named repository files through GitHub read-only and all six original photographs. SOURCE_REGISTER distinguishes the original session's external-source records from this audit's targeted primary-source rechecks. The bundled PDF's Git metadata was retrieved; its binary content could not be opened by the available GitHub reader. G-SOURCE therefore explicitly requires binary/revision verification before claiming PDF-to-photo equivalence.
