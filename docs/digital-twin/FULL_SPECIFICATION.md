# PiCar-X Z0104V40 — complete audited specification

Generated reading copy of all current root Markdown documents. Individual files and machine-readable schemas are canonical execution references. No application or geometry implementation is included.

- [README.md](README.md)
- [AUDIT_REPORT.md](AUDIT_REPORT.md)
- [AUDIT_CHANGELOG.md](AUDIT_CHANGELOG.md)
- [PRODUCT_SPEC.md](PRODUCT_SPEC.md)
- [ARCHITECTURE.md](ARCHITECTURE.md)
- [DIGITAL_TWIN_DATA_MODEL.md](DIGITAL_TWIN_DATA_MODEL.md)
- [SEMANTIC_CONTRACT.md](SEMANTIC_CONTRACT.md)
- [ASSEMBLY_ENGINE_SPEC.md](ASSEMBLY_ENGINE_SPEC.md)
- [HASH_AND_PACK_CONTRACT.md](HASH_AND_PACK_CONTRACT.md)
- [PERSISTENCE_CONTRACT.md](PERSISTENCE_CONTRACT.md)
- [SOURCE_PUBLICATION_CONTRACT.md](SOURCE_PUBLICATION_CONTRACT.md)
- [GATE_CONTRACTS.md](GATE_CONTRACTS.md)
- [V40_ASSEMBLY_LEDGER.md](V40_ASSEMBLY_LEDGER.md)
- [BOM_RECONCILIATION.md](BOM_RECONCILIATION.md)
- [GEOMETRY_AND_EVIDENCE_SPEC.md](GEOMETRY_AND_EVIDENCE_SPEC.md)
- [ASSET_PIPELINE_SPEC.md](ASSET_PIPELINE_SPEC.md)
- [VERIFICATION_AND_TEST_PLAN.md](VERIFICATION_AND_TEST_PLAN.md)
- [MILESTONES.md](MILESTONES.md)
- [MILESTONE_REVIEW.md](MILESTONE_REVIEW.md)
- [REPOSITORY_CHANGE_MAP.md](REPOSITORY_CHANGE_MAP.md)
- [OPEN_QUESTIONS_AND_BLOCKERS.md](OPEN_QUESTIONS_AND_BLOCKERS.md)
- [EVIDENCE_INSPECTION.md](EVIDENCE_INSPECTION.md)
- [SOURCE_REGISTER.md](SOURCE_REGISTER.md)
- [FUTURE_CAMERA_AND_AR_SPEC.md](FUTURE_CAMERA_AND_AR_SPEC.md)
- [CRITICAL_REVIEW.md](CRITICAL_REVIEW.md)
- [HANDOFF_M0.md](HANDOFF_M0.md)


---

## Source document: README.md

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


---

## Source document: AUDIT_REPORT.md

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


---

## Source document: AUDIT_CHANGELOG.md

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


---

## Source document: PRODUCT_SPEC.md

# Product specification

## 1. Product contract

Create one cohesive local-first PiCar-X companion, not a separate demonstration app. Preserve setup, searchable reference pages, local SunFounder documentation, PDF viewing, video-course navigation, and companion-authored overlays. Replace the *assembly experience inside that journey* with a revision-specific interactive engineering manual.

The authoritative product revision is **Z0104V40**. The first release supports three explicit assembly variants: **Raspberry Pi 4 Model B**, **Raspberry Pi 5**, and **Raspberry Pi Zero 2 W**. Existing documentation mentioning Pi 3 stays available, but there is no selectable Pi 3 digital-twin branch in this release.

The robot begins unassembled in a digital workbench. Each printed instruction becomes a reversible visualization of a structured state transition. The user sees the components, hardware, interfaces, orientation, checks, and source evidence for the current operation. Every physical item used by assembly is identifiable; purchased multi-element items and integrated leads follow the ownership rules in the data model.

**D-PRODUCT-01:** A 3D view is an explanatory projection, not proof that the physical robot was assembled. Always distinguish **instruction coverage**, **user-confirmed physical progress**, and **geometry assurance**.

## 2. Release modes and scope

The application has one assembly workspace with per-step capability, not three competing applications.

| Capability | Permitted behavior |
|---|---|
| Reference-only | Show the V40 panel, instructions, parts/hardware list, source links, warnings, progress and unresolved items. Do not synthesize missing silhouettes or final poses. |
| Approved nominal 3D | Show only geometry and transitions admitted by G-GEOMETRY for the selected step and its dependency closure. Display the declared nominal-geometry scope and physical-match status. |
| Provisional review | Explicit opt-in author/reviewer mode; conspicuous persistent provisional banner, no physical-fit verdict or metric inspection for unknown features; never the default tutorial. |
| Physically matched scope | Display a separate, scoped certificate only when actual physical evidence establishes the listed properties. No global certification inferred from appearance. |

The full product target includes 29-step 3D coverage. Shipping the reference-first or partial-coverage stages is useful but MUST NOT be described as completion of that target. The release dashboard reports, for example, `29/29 instructions; 7/29 admitted 3D transitions; physical match unverified` rather than one misleading percentage.

Non-goals through M12: autonomous control of the physical PiCar, remote execution of setup commands, physics-based assembly settling, manufacturing replacement parts, torque certification, a general-purpose CAD editor, cloud accounts, multiplayer collaboration, mobile AR, and camera-based pass/fail judgments. Later milestones add observation adapters without changing assembly truth.

## 3. Navigation and project entry

Keep Home, Setup Wizard, Reference, and Video Course. Add **Assembly** to the same top navigation, linking to the current project. Preserve the eight setup-stage IDs and all legacy hash links. The existing wizard's `assembly` stage becomes a launcher and summary with a **Continue V40 assembly** action and a **Read printed instructions** action; it is not removed.

Home contains separate cards for setup progress and assembly progress. Show the selected Pi variant, revision, next unconfirmed printed step, source/geometry coverage, and a resume action. Do not replace an unknown revision with the old hardcoded `v2 · Robot HAT` chip. Until a project exists, show `Kit instructions: Z0104V40; Pi variant: not selected`.

First entry requires selecting a Pi variant, accepting the distinction between guided progress and verification, and reviewing the printed inventory. An existing setup-stage completion can be imported as historical context, but cannot auto-complete 29 physical instructions. A user who already assembled the car can review and attest individual steps or record an explicit bulk self-report; the latter is tagged `self_reported_import`, never camera/CAD verification.

The initial digital workbench contains independently addressable selected-variant items in trays with **no assembly connections**. Accurate approved parts may be shown in 3D tray poses; missing geometry remains a named 2D source tile. Future items are collapsed by default rather than all laid over one another. Opening “All parts” exposes the complete inventory, including spares, unused variant stock, tools and noninstalled accessories.

## 4. Workspace layout

At the existing 1440×900 desktop size, use a persistent step rail, central viewport, and instruction/inspection panel. The rail is about 220 CSS px and the instruction panel about 360 px; the viewport takes the remaining width. At 1100×700, collapse the rail into a step-selector drawer before squeezing instructions. Use existing CSS tokens, system fonts and light/dark appearance. Do not introduce a second design system.

The viewport header always shows revision, variant, printed step, source confidence, and whether the display is assembled, exploded, isolated, or previewing another step. Controls are HTML buttons, not exclusively 3D widgets. The instruction panel includes a concise action, exact hardware designation/quantity, required tool class, orientation callouts, numbered suboperations, warnings, and verification checks. A persistent footer holds Previous, Replay, and the primary next action.

The current parts tray and fastener tray are separate. A tray row names the definition and instance or group quantity, shows stock/required counts, and focuses the matching node or source image. Repeated fasteners may be visually grouped, but expanding a row exposes each instance ID and target interface. A magnified hardware card is labeled **enlarged—not to scale**; never use screen dimensions as a measuring gauge.

## 5. Exact interaction behavior

| Interaction | Required behavior |
|---|---|
| Start / Play installation | From the current before-state, play the approved transition. At the end show the after-state and physical-check controls. Do not mark the physical step done merely because the animation finished. |
| Complete & next | Validate required attestations and prerequisite confirmations, persist one transaction, then move to the next printed instruction. If persistence fails, remain on the step with a retryable error and no false completion. |
| Previous | Review the preceding printed step and optionally reverse the visual transition. It does not say that the real robot has been disassembled and does not delete confirmations. A “Reviewing completed step” label appears. |
| Replay | Reset only the visual cursor to the before-state and evaluate the same transition again. Inventory, confirmations and zeroing attestations are not duplicated. |
| Jump to step | Any step is reachable in **review/preview**. Future prerequisites are projected digitally and visibly labeled assumed-for-preview. Guided completion is disabled until prerequisite physical confirmations exist. Returning to guided mode goes to the earliest required unconfirmed step. |
| Undo completion | Separate action with confirmation. Invalidate that step and all dependent physical confirmations, preserve history, and explain which downstream steps need reconfirmation. No implied safe physical teardown instruction. |
| Rotate / pan / zoom | Orbit drag, secondary/modified drag pan, wheel/pinch zoom; explicit keyboard/button alternatives. Respect bounds without trapping the camera inside a part. Any manual interaction immediately cancels auto-camera interpolation. |
| Automatic focus | Focus the current interface/part-group bounds with the prescribed view normal and up vector. Transition only on an explicit step action or “Refocus”; never steal the camera during inspection. |
| Manual camera override | Remains active across replay and inspection until “Resume auto camera” is selected. Step navigation offers focus but does not forcibly override a manual view. |
| Click / hover | Hover highlights the nearest eligible visible item and gives a small label. Click selects and opens the inspector. A drag exceeding 4 CSS px is not a click. Hidden, ghost-future and clipped-away nodes are not picked by default. |
| Part inspector | Shows definition, instance, role, current assembly, supplied/used/spare disposition, current and final connections, required hardware, evidence, per-feature confidence, and blocking questions. “Why this hole?” opens its evidence and derivation chain. |
| Isolate | Save the current visibility profile, show the selected item/subassembly plus optional attachment context, retain a visible “Exit isolate” control. Do not mutate domain state. |
| Ghost future | Show only future items with admitted geometry and solved poses in the preview state. Unknown geometry remains tiles/counts. Future ghosts cannot appear as physically installed or verified. |
| Dim completed | Reduce contrast of completed context while retaining orientation and attachment surfaces. Current working interfaces remain legible. Do not change part materials in shared source assets. |
| Explode | Enter an inspection overlay generated from the attachment graph. Disable installation playback until “Return to assembly” finishes; preserve the underlying state and manual camera choice. |
| Clipping | A labeled, reversible inspection plane with slider and reset. Clipped geometry is not evidence of an actual cutaway or absent internal component. |
| Reset / restart | Offer “Reset visual view”, “Restart this assembly session”, and “Reset all companion progress” separately. Destructive options require confirmation and create a recoverable session snapshot. |
| Variant change | Create a new session fork for the new variant. Preserve the old session and setup/reference progress. Do not transfer physical-step confirmations automatically, including visually common downstream steps. |
| Search / reference link | Navigate to a stable page/section or assembly-step/part route. Returning restores session, selected step and inspection state. External links remain external and failures are surfaced. |

Selection, hover, isolation and camera operations never alter stock counts, connections or physical completion. The inspector remains fully operable when WebGL is unavailable.

## 6. Warnings, servo zeroing and cable guidance

Warnings have severity, source, applicability and acknowledgment policy. A safety acknowledgment is a user statement, not sensor verification. Display the precise reason a step is blocked; avoid vague red “invalid” states.

The V40 zeroing procedure is introduced at printed step 17 and repeated at the actual horn-to-spline attachment operations in steps 18, 19 and 22. Each servo instance has its own scoped zeroing attestation. The UI names **pan**, **tilt**, or **steering**, shows the temporary **P11** connection, and distinguishes it from permanent **P0/P1/P2** wiring at step 29. A generic setup checkbox cannot satisfy these step-specific conditions. When the actual HAT's ZERO behavior is unverified, provide the printed procedure as reference and block any automated confirmation; do not silently select a newer-board procedure.

Camera-ribbon operations require a power-off acknowledgment, sourced to the existing camera warning. Show the connector latch, cable contact face and stiffener face in a local close-up; do not reduce orientation to an ambiguous “blue side up”. The selected Pi variant chooses FFC versus FPC according to the printed V40 panels. Unknown pitch, length, bend radius or connector subtype remains unresolved. A routing line with unknown exact shape is labeled **routing schematic**, not rendered as a metrically exact cable body.

Step 21 must show a **free-rotation joint**, not a rigidly tightened plate. Step 19 uses Washer A; step 26 uses Washer B. The largest warning in a fastener inspector is a mismatch between the selected hardware and the intended joint. No inferred torque value, screw pitch, insertion depth or rivet-code dimension may appear.

## 7. Progress and completion

The durable physical ledger records `not_confirmed`, `self_confirmed`, or `observation_supported` per required check, with source and invalidation history. It does not assign an unqualified `VERIFIED` label to the whole robot. Setup stage completion and assembly-step confirmation remain separate fields.

At step 29 completion, show: variant/revision; all required user confirmations; spare and unused stock; unresolved geometry/electrical questions; geometry coverage; and a **Continue to calibration** link using the existing calibration stage. Calibration is not automatically completed by assembly. A complete digital animation does not complete physical assembly, and physical self-confirmation does not resolve a CAD blocker.

A project-level final mechanical report has a named scope, evidence/model hashes, included features, exclusions and failed/blocked checks. Do not display “fully verified digital twin” while any required identity, interface, nominal geometry, fit criterion or evidence conflict remains unresolved. Physical-match certification additionally requires actual physical evidence; it cannot be achieved from the current box/manual photographs alone.

## 8. Accessibility and degraded behavior

Every canvas action has a focusable DOM alternative. Provide a part tree/list, step text, hardware quantities, before/after state description and source-panel fallback. Announce step changes and completion, not every animation frame. Selection and confidence are conveyed by text and shape, not color alone. Escape closes inspector overlays and cancels preview motion to the last stable visual endpoint. Focus returns to the invoking control.

Respect `prefers-reduced-motion` in JavaScript as well as CSS. Reduced-motion mode swaps to explicit before/after poses without camera travel or screw spins; all checks and state transitions remain identical. Provide adjustable animation speed, pause, and an option to disable auto-focus. Auto-playing instructional motion is off on first entry.

On WebGL2 creation failure or repeated context loss, keep the workspace, progress and instructions available in reference mode. Do not downgrade to untested WebGL1 or silently remove required warnings. Report an asset failure independently of evidence incompleteness. A “Retry 3D” action reloads only the failed feature, not the whole application.

## 9. Product acceptance

AC-P1: Every existing route family and eight setup-stage ID works after migration.
AC-P2: Every one of the 29 printed steps is accessible for each selected branch, with correct V40 evidence and no V33 substitution.
AC-P3: Previous/replay/jump never silently alter physical progress; undo and variant fork behave exactly as specified.
AC-P4: All interaction paths have keyboard/reference alternatives; zero WebGL is a supported operating mode.
AC-P5: No provisional geometry can masquerade as an admitted nominal instruction or physically matched part.
AC-P6: The full target is accepted only when M12's coverage, geometry, asset, native-performance and regression gates pass. Earlier usable releases remain accurately labeled partial.


---

## Source document: ARCHITECTURE.md

# Architecture

## 1. Inspected baseline

All repository observations below refer to `scalinity/PiCar@9e54b2fb3199c22f5d5c7cd67c8e4531ab2246f8`, independently resolved from `main`. The root README records upstream documentation commits `ce2ef77d7f96ac6325c1c8c3fe584b9caab418e4` and shared-docs `0c11f833f862661779180ea7da2a25fd515c40d8`; the latter was independently verified as the former's actual `docs/source/_shared` gitlink. See source entries R01–R07.

| Subsystem | Observed implementation | Consequence |
|---|---|---|
| Frontend | React/React DOM `^19.1.0`, TypeScript `~5.8.3`, Vite `^7.0.4`; `src/main.tsx` mounts StrictMode | Extend the existing SPA; account for StrictMode lifecycle and cleanup. These are manifest ranges, not a claim about installed versions. |
| App shell | `src/App.tsx` statically imports Home/WizardStep/Reference/Videos; four nav items; external HTTP links intercepted with opener | Add a lazily imported Assembly route; preserve shell and current routes. Replace the misleading hardcoded hardware chip with project identity. |
| Routing | `src/lib/router.ts`: small hash router using `useSyncExternalStore`; reference supports nested page IDs and `?s=` section | Extend discriminated route union; no router-library replacement. Add malformed-percent-encoding tests. |
| Persistence | `src/lib/progress-store.ts`: module store, `picarx.v1` localStorage, shallow JSON defaults, synchronous writes | Retain public facade during migration; introduce validated durable repository underneath. Current writes can throw and data is not schema-validated. |
| Setup | Eight stages: parts, os, power, connect, software, servo-zero, assembly, calibrate | Preserve IDs and useful flow. Assembly becomes a project-linked stage, not the entire setup replacement. |
| Assembly today | `WizardStep.tsx` embeds a PDF, video entries and content pages with independent completion/checklists | No existing part/connection graph or 29-step engine to preserve. Add those as a domain subsystem. |
| Documentation | Tagged block AST in `content-types.ts`; `RstRenderer.tsx`; `Reference.tsx` tree and paging | Preserve the content schema and renderer. Assembly cross-links are additive. |
| Content access | `src/content/index.ts` eagerly imports every page plus nav/search/videos/wizard JSON | Keep heavy twin manifests/GLBs outside this module. Lazy-route splitting must not accidentally import them through Home. |
| Search | `SearchBox.tsx`: case-insensitive substring search, heading priority, first 20 hits | Add a separately generated assembly/part search source and typed destinations. Do not replace the existing reference index. |
| Media | `public/content` images/PDF/local video; Videos also uses network YouTube thumbnails and embedded/external content | Preserve honest offline boundaries. Missing private media gets a placeholder, not automatic fetching. |
| PDF | Local PDF.js worker; per-URL promise cache; shared `pdfLastPage`; no retry after cached rejection | Keep behavior, add retry and document-keyed progress compatibility when touched. Lazy-load its route/widget to avoid making 3D entry load PDF.js. |
| Content authoring | `tools/content-pipeline/{build,overlay,rst-parser,transform}.ts`, `custom-docs/hermes.rst` | Extend overlay/schema and regenerate outputs; never hand-edit generated wizard JSON as authoritative source. |
| Pipeline hazards | Prefers V40 PDF but falls back to V33; deletes `src/content/pages` and `public/content` before emission; expects 62 crawled official pages before custom additions | Remove silent fallback for V40 build; do not place twin assets under `public/content`; add staged publication and drift manifests. |
| Styling | Plain CSS `tokens.css`, `base.css`, `components.css`; light/dark custom properties, mono labels, system fonts | Add scoped feature CSS using these tokens. No Tailwind/component-kit rewrite. |
| Native | Rust/Tauri 2; template greet command and opener plugin only; no current database or CAD processing | Remove greet when introducing real commands. CAD remains offline authoring, not native runtime. |
| Native configuration | 1440×900, minimum 1100×700; identifier `com.danny.picarx-companion`; CSP null | Retain identifier/window defaults. Add tested scoped capabilities/CSP rather than changing app identity. |
| Build/test | Existing scripts: dev, build, preview, tauri, content:build; no configured test/lint script in inspected package manifest | Add explicit suites. No successful build/test result is asserted by this planning inspection. |

The README and `.gitignore` deliberately exclude sensitive upstream screenshots/authentication media. **A Git ignore rule is not a packaging filter**: locally regenerated files under `public` could still enter a Vite/Tauri bundle. A clean staging manifest and redacted/missing-media placeholders are required. This is a small local-project safeguard, not an enterprise governance program.

## 2. Chosen architecture and dependency direction

**D-ARCH-01 — Canonical source pipeline**

```text
evidence bytes + exact locators + source applicability
    -> canonical JSON: claims, definitions, instances, interfaces, 29-step semantics
    -> Python/CadQuery + OpenCascade: deterministic part geometry
    -> constrained, variant-specific nominal master assembly
    -> independent geometric/semantic checks + G-CAD report
    -> immutable tessellation packets + material/texture presentation overlay
    -> per-definition GLB files + final-byte validation / G-GEOMETRY
    -> independent content-addressed runtime manifest
    -> pure TypeScript assembly reducer/projection/motion evaluator
    -> React assembly UI + React Three Fiber / Three.js viewport
```

There is no reverse path from a visual edit or GLB transform to canonical mechanical truth. CAD generation and constraint solving are offline build activities. The application does not need Python, FreeCAD, OpenCascade or Blender installed on the owner's Mac.

**D-ARCH-02 — Runtime stack:** retain React 19, TypeScript, Vite and Tauri 2; use **Three.js WebGLRenderer (WebGL2)** with **React Three Fiber 9**, and selectively use **Drei OrbitControls**. R3F's maintainer documents the React 19/Fiber 9 pairing [W03]. WebGLRenderer's current documented baseline is WebGL2, not WebGL1 [W04]. WebGPU is not a release dependency. Do not add Babylon, a game engine, a physics engine, a second router, Redux, or a general animation framework.

R3F fits the existing React component/event model while Three remains responsible for scene objects and rendering. Domain state is framework-independent. A single deterministic frame evaluator handles assembly motion, camera interpolation and presentation offsets. Drei is a convenience adapter, not an authority for asset metadata, state, or automatic recentering.

**D-ARCH-03 — CAD stack:** Python 3.12, CadQuery 2.x backed by a locked OpenCascade/OCP version. CadQuery scripts own reconstructed engineering solids and feature frames; vendor STEP is immutable imported source. FreeCAD is an independent inspection/interchange tool, not a competing editable master. Official KiCad projects may supply PCB mechanics only after exact revision mapping. CadQuery supports STEP/DXF interchange and assembly glTF export [W01/W02], but this project's final runtime exporter is the explicit mesh/manifest builder in ASSET_PIPELINE_SPEC, not a black-box scene export.

**D-ARCH-04 — Blender is optional presentation tooling:** use headless scripts for texture baking/material review/UV authoring on a copy. The canonical tessellated mechanical positions remain immutable. No `.blend` file is a required repository source for a mounting hole, plate bend, pivot, assembly pose or instructional motion. The normal runtime GLB build does not require Blender at all.

## 3. Logical modules

`src/generated/twin/` contains schema-generated types. `src/domain/assembly/` contains canonical validation adapters, graph compilation, inventory accounting, pure reducers, state projections, capability evaluation and typed repository ports; `src/domain/components/` supplies read-only definition/instance selectors. It imports neither React nor Three nor Tauri. A command produces a deterministic proposed state and a persistence envelope; it never performs IO itself.

`src/features/assembly-3d/` contains the route controller, DOM instruction panels, trays, inspector, reference fallback, camera controls and WebGL view. `scene/` owns all Three objects and mapping between `PartInstanceId` and object roots. `motion/` evaluates the prescribed visual transition at normalized time. `selectors/` maps domain state to renderable projections. No visual component writes an arbitrary final part pose.

`src/platform/` implements the typed session port for Tauri and browser development. `src/features/assembly-3d/assets/` resolves manifests, verifies supported contracts, asks native code to verify local asset integrity, and manages loading/caches. It never chooses a substitute part on a missing-file error.

`digital-twin/` contains checked-in authoring records, schemas, CAD scripts, constraints, source locks and tests. `digital-twin/generated/` is generated/ignored. Approved small runtime outputs are published under `picarx-companion/public/twin/`, not `public/content`. Source photographs live in ignored/private evidence storage by default; only explicitly approved sanitized crops become app media.

## 4. State ownership

| State | Authority / lifetime |
|---|---|
| Part definitions, measured features, source claims, master constraints | Versioned authoring JSON/CAD in `digital-twin/`; immutable in application |
| Compiled graph, variants, feature frames, runtime assets | Hash-bound generated manifest; immutable per session model version |
| Setup checks, session selection, confirmations, invalidations, observations | Durable repository; frontend exposes immutable snapshots |
| Deterministic digital assembly state | Pure reduction/projection of graph plus chosen prefix; reproducible, not inferred from a mesh |
| Pending command | Route/application service, serialized until persistence acknowledgment |
| Animation time, hover, dragged camera, clipping and temporary explosion | Feature-local presentation controller; no per-frame database writes |
| Stable user preferences | Debounced durable preference record; never mechanical truth |
| Camera frames (M13) | Ephemeral local observation adapter unless user explicitly retains a capture |

A “current step” is not sufficient as the entire state. The system independently records physical confirmation progress, preview cursor, variant, model version, and visual transition. Browser history changes the preview route, not the physical ledger.

## 5. Storage decision and native boundary

**D-STORAGE-01:** authoring uses UTF-8 JSON plus JSON Schema 2020-12; generated types come from that schema. Do not maintain independently authored TypeScript and Python model definitions. Use checked-in JSON source and generated compact runtime JSON, not SQLite as an authoring format. Runtime assets are hash-addressed binaries described by manifests.

**D-STORAGE-02:** use one local **SQLite database through Rust `rusqlite` with bundled SQLite** for durable sessions, event records, snapshots, source-version adoption and import/export. There is no server, account, sync service, raw-SQL frontend endpoint or ORM. The small database earns its presence through transactional migrations and atomic multi-record invalidation; it is not a geometry store.

Minimum tables: `meta(schema_version)`, `projects`, `sessions`, `events`, `snapshots`, `setup_progress`, `preferences`, `imports`, and later `observations`. Canonical document bodies are versioned JSON. `events` has `(session_id, sequence)` and command results use unique `(aggregate_id, command_id)` plus requestHash; `sessions` carries `revision` for optimistic concurrency. Foreign keys, WAL mode and atomic transactions are enabled; closing the app never relies on a final unload callback to save a completed step.

The TS domain reducer is the single implementation of assembly semantics. Rust validates envelope size/schema/version, known session, expected revision and unique command ID, then stores the authorized event and bounded snapshot cache atomically; PERSISTENCE_CONTRACT.md defines duplicate lookup before CAS and exact retry results. On load, the frontend replays and cross-checks the stored snapshot hash. Rust does not create a second competing assembly reducer. Corruption moves the session to read-only recovery with export/last-valid-snapshot options; do not silently reset.

Typed native commands: `load_companion_state`, `commit_session_command`, `save_preferences`, `import_session`, `export_session`, `verify_twin_manifest`, `resolve_twin_asset`. Payloads use IDs and allowlisted relative asset paths, not arbitrary filesystem paths. All writes return an acknowledged revision. Retry of the same command ID is idempotent. Native errors are structured and actionable.

The plain-browser `pnpm dev` path uses an **IndexedDB** adapter implementing the same session repository port and transaction semantics. It never pretends to have native file integrity verification; test manifests can be verified with Web Crypto where available. Browser development data is not silently synchronized into the desktop database. Provide explicit versioned export/import for moving a session.

## 6. Legacy progress migration

Keep `picarx.v1` untouched as a recovery source. On first upgraded launch, read and validate its raw string in the frontend. Preserve `steps`, `checks`, `lastRoute` and `pdfLastPage` in a single native migration transaction with the original JSON and hash. Unknown keys are retained in an import record, not trusted as current typed data. Malformed JSON triggers a recovery notice without losing the original.

`src/lib/progress-store.ts` becomes a compatibility facade with the same reads and named actions for existing pages. An asynchronous initialization boundary renders a loading state before progress-dependent UI. Writes become acknowledged commands; components must handle pending/error states. Existing callers may be migrated to `async` actions in M3, but must not optimistically show saved completion before durability succeeds.

Do not translate `steps.assembly='done'` into 29 verified steps. Keep it as `legacyAssemblyReportedDone`; offer a guided reconciliation screen. Preserve the existing PDF last-page value for the legacy assembly document when introducing document-keyed reading progress. Keep the Tauri application identifier unchanged so migration is not accidentally defeated by a new app-data location.

If native storage is unavailable, do not overwrite the legacy key or show a successful migration. Allow read-only reference browsing and an explicit export of the original progress. Migration is one-way additive with a backup; rollback to the baseline app can still read its old key, although new assembly-session progress is available only in the exported/upgraded format.

## 7. Packaging, caching and security

Bundle the approved runtime manifest and admitted assets locally. No CDN decoder, remote model URL or automatic arbitrary download is required to view the kit. Cache parsed definitions by asset hash, reference-count geometry/material/texture resources, and dispose them on route/project teardown. Corrupt or incompatible assets are quarantined; retry uses the exact expected hash and never a “similar” fallback model.

Initially use bundled hashed assets and an in-memory parsed cache. Native disk cache exists only for explicit import/adoption of new model packs; path traversal, symlinks escaping the allowed root, decompression bombs and hash mismatch must fail before adoption. Imported packs are data-only and contain no executable Python, JS, Rust or Blender files in the runtime path.

Introduce a tested CSP for local assets/workers and the exact existing media providers. Preserve legitimate external documentation through the opener path. Do not add broad filesystem or shell permissions to serve models. Native test-only WebDriver/IPC helpers are compiled only under a dedicated E2E feature and absent from shipping binaries.

A clean packaging staging directory is populated from an allowlisted manifest. Apply the existing sensitive-media exclusions to this manifest, not just Git. Preserve local originals, display a neutral omitted-media tile where appropriate, and never include photographs/EXIF from the owner's evidence vault by accidental recursive copy.

## 8. Dependency/version policy and deployment

Do not upgrade React/Vite/Tauri as collateral work. M0 records Node, pnpm, Rust, OS and existing lockfile results. M4 freezes the exact CAD/kernel/meshing toolchain and a canonical build environment; M8/M9 freeze compatible Three/Fiber/Drei/GLB tooling versions with a lockfile and a capability fixture. Patch-version selection is a bounded compatibility task, not an architectural fork. A dependency update must reproduce contract tests and asset hash/semantic comparisons before adoption.

Use the existing Tauri packaging flow and app identifier. Runtime graph/model versions are independent of application versions. A session pins its graph hash and evidence/model manifest; an incompatible model upgrade requires an explicit migration/fork with explained invalidations. Cosmetic texture changes can preserve physical confirmations only when the semantic and mechanical hashes are unchanged.

## 9. Current test-platform finding

Current Tauri documentation describes WebdriverIO's `@wdio/tauri-service` with an **embedded** WebDriver provider that supports macOS [W06]. Direct `tauri-driver` remains a different path. Use the embedded provider for the native Mac suite; do not repeat the older blanket claim that Tauri cannot be automated on macOS. M0 records a bounded feasibility result on the selected development machine and locks any tested test-only plugins. Missing native environment is explicitly BLOCKED; native acceptance cannot be claimed until the actual Mac suite passes in M3/M9. Browser Playwright/WebKit tests remain useful but are not evidence of the packaged application's GPU or IPC behavior.


## 10. Native command and persistence transaction contract

All command payloads are versioned JSON envelopes. A durable command has `commandId`, `payloadVersion`, target aggregate ID, `expectedRevision`, payload and model/graph hashes where relevant. The response is either `acknowledgedRevision` plus the committed aggregate hash, or a typed `CONFLICT`, `INVALID_SCHEMA`, `UNKNOWN_MODEL`, `IO_FAILURE`, `CORRUPT_STATE`, `UNSUPPORTED_VERSION` or `PERMISSION_DENIED` error. Never encode failure as an empty successful state. The frontend remains the single semantic reducer; Rust validates envelopes and storage invariants, not a second independently maintained graph engine.

| Command | Transaction boundary / result |
|---|---|
| `load_companion_state` | Read project/session summaries, setup snapshot, preferences, schema version and migration state; selected session load includes ordered events plus last acknowledged snapshot |
| `import_legacy_progress` | One-time raw-string/hash/idempotency check, validated setup snapshot and import record in one transaction; preserves original bytes; cannot add physical step confirmations |
| `commit_setup_progress` | Compare-and-swap setup aggregate revision; save checks/stage markers/bookmarks atomically; `steps.assembly` remains legacy/self-reported scope |
| `create_assembly_session` | Atomically create a project if requested, a variant/model-pinned session and initial empty-confirmation snapshot; reject unrecognized model pack for instructional capabilities |
| `fork_assembly_session` | Copy only source/project linkage and allowed nonphysical preferences; new variant/session has no physical confirmations; original session remains unchanged |
| `commit_session_command` | Check command ID/revision/model identity; append event and supplied deterministic new snapshot and update session revision in one SQLite transaction |
| `save_preferences` | Debounced compare-and-swap for durable presentation preferences; never change mechanical source values |
| `export_session` | Produce a versioned event/model-reference export with hashes and optional explicitly selected captures; canonical CAD/evidence are references unless explicitly included |
| `import_session` | Validate schema, hashes, pack references and frontend replay result before adoption; unknown packs are provisional/read-only, never trusted by their own PASS label |
| `verify_twin_manifest` | Validate supported manifest, trusted/adopted root, allowed paths, file hashes and admission-report equality; return capability registry or explicit failures |
| `resolve_twin_asset` | Resolve only an allowlisted pack asset ID/relative path; return a sanctioned app-local URL/handle, not an arbitrary filesystem reader |

Use `events(session_id, sequence, command_id, event_type, payload_json, previous_state_hash, next_state_hash)` with unique `(session_id,sequence)` and command-result uniqueness `(aggregate_id,command_id)`; `snapshots(session_id, revision, state_json, state_hash)` references the session. `sessions` stores selected variant, model/graph/evidence hashes and current revision. `setup_progress` and `preferences` have their own aggregate revision. `imports` records original format/hash/raw backup and applied migration version. All foreign keys and transaction constraints are enabled. These database rows store application progress, not canonical part/measurement truth.

Use bounded envelopes: 8 MiB default per session import/command body, with an explicit rejection and separate streamed capture import for larger optional camera data. This is a defensive application limit, not a kit property. Serialize mutation commands per aggregate; a retry reuses commandId. On every successful load, recompute the semantic state from pinned graph/events and compare snapshot hash. Corruption opens read-only recovery rather than inventing a reset or silently trusting the snapshot.

## Audited persistence and publication protocols

[PERSISTENCE_CONTRACT.md](PERSISTENCE_CONTRACT.md) fixes transaction ordering, command-result ownership, attestation atomicity, legacy divergence, WAL-safe backup and restore. Add `command_results` and the explicit migration/backup metadata to the minimum tables. The new app never writes picarx.v1 after adoption. [SOURCE_PUBLICATION_CONTRACT.md](SOURCE_PUBLICATION_CONTRACT.md) fixes multi-root source publication and the safe public mirror; [HASH_AND_PACK_CONTRACT.md](HASH_AND_PACK_CONTRACT.md) fixes immutable twin pack publication. These are separate coordinators/ownership domains. [GATE_CONTRACTS.md](GATE_CONTRACTS.md) makes M0 permission for M1 explicit.


---

## Source document: DIGITAL_TWIN_DATA_MODEL.md

# Digital-twin data model

## 1. Canonical layers and IDs

**D-DATA-01:** Separate a reusable **PartDefinition** from each **PartInstance**. A common servo definition may have three role-bearing instances only after evidence establishes that the supplied servos are the same definition. Until then, use separate unresolved identity records or a definition with an explicit unproven equivalence claim; never let visual similarity merge identities.

IDs are stable, case-sensitive ASCII, independent of array order, filenames, translated labels, Three object UUIDs and CAD face indices. Examples:

```text
PX-V40-DEF-PLATE-A
PX-V40-DEF-STANDOFF-M3X26
PX-V40-INS-STANDOFF-M3X26-001
PX-V40-INS-SERVO-PAN-001
PX-V40-STEP-10
PX-V40-CONN-FRONT-STANDOFF-LEFT
PX-EV-PHOTO-05
PX-CLAIM-STANDOFF-M3X26-DESIGNATION
Q-03
```

Use uppercase hyphenated IDs for records, lowercase dotted names for definition-local features (`mount.pan.axis`, `pcb.mount.front-left`). Instance IDs are never recycled. The numeric suffix is allocation identity, not a step number. A role is a separate field and is not evidence of OEM model identity. Source revisions and schema versions are fields, not silently encoded in a changed display name.

Store records in ID-sorted arrays or one JSON file per record family. The canonical serializer follows RFC 8785 JCS plus the project input restrictions and acyclic preimages in HASH_AND_PACK_CONTRACT.md. Preserve meaningful array order; reject NaN/Infinity/negative-zero input and duplicate object keys. Raw SHA-256 is distinct from Git blob SHA-1.

## 2. Confidence versus process maturity

The only **evidence confidence** values are:

| Confidence | Meaning |
|---|---|
| VERIFIED | This exact scoped claim is supported by an applicable authoritative source or an adequate direct observation. The source's claim, the model's agreement with it, and physical agreement remain distinct. |
| DERIVED | A reproducible derivation from referenced inputs, with method, assumptions and propagated uncertainty. It is not independently measured. |
| PROBABLE | A plausible but unproven identification or relationship. Not admissible for instructional mechanical dependencies. |
| UNRESOLVED | Insufficient or conflicting evidence. A numeric value may not be silently supplied. |

Process maturity is separately recorded as `RECORDED`, `MODELED`, `CAD_CHECKED`, `ASSEMBLY_CHECKED`, or `PHYSICAL_MATCH_CHECKED`. These are completed work stages, not an ordering that converts PROBABLE into VERIFIED. Each stage has a reviewer-attributed/hash-bound report scoped to features. A part with a CAD_CHECKED mesh can still have UNRESOLVED identity and be barred from the tutorial.

Release capabilities are computed from both claim confidence and validation reports: `referenceOnly`, `provisionalReview`, `instructionGeometry`, `nominalAssemblyReport`, and `physicalMatchReport`. They are not confidence values. An author may not set `instructionGeometry: true` by hand; the admission compiler emits it from G-GEOMETRY.

## 3. Unknown-value representation

Unknown numeric data uses a discriminated object with **no numeric payload**, not a zero, empty string, hidden default or context-dependent null.

```ts
// Normative shape; generated types must come from the JSON Schema.
type Confidence = 'VERIFIED' | 'DERIVED' | 'PROBABLE' | 'UNRESOLVED';
type NumericValue =
  | { state: 'known'; value: number; unit: 'mm' | 'rad' | 'count';
      confidence: Exclude<Confidence, 'UNRESOLVED'>;
      evidenceRefs: string[]; derivationRef?: string;
      uncertainty: { state: 'bounded'; minus: number; plus: number }
                 | { state: 'unresolved'; blockerIds: string[] } }
  | { state: 'unresolved'; unit: 'mm' | 'rad' | 'count';
      confidence: 'UNRESOLVED'; blockerIds: string[] };
```

A nominal engineering dimension and an as-built measurement are different measurement kinds. An exactly transcribed label such as **M3x26** is a VERIFIED *designation*. It does not prove the standoff's across-flats dimension, pitch, hole depth, tolerance or exact manufactured length. A parsed nominal 26 mm can be DERIVED from an identified designation convention while its tolerance remains unresolved. See the included standoff example: it intentionally cannot pass final geometry admission.

Dimensions have separate `sourceTolerance`, `measurementUncertainty`, and `modelDeviationBudget` fields. Do not use solver residual as a substitute for manufacturing tolerance. A `known` nominal with unresolved physical tolerance may support a scoped nominal model; it cannot support a worst-case physical-fit certificate.

## 4. Required entities

The JSON Schema directory provides strict top-level shapes and tagged values. The following fields and semantics are mandatory contracts, even where cross-record conditions require the semantic validator.

| Entity | Required fields and meaning |
|---|---|
| **EvidenceRecord** | `id`, source kind/tier, title, original locator, revision, retrieval date, hash when bytes available, rights/privacy policy, applicability, captured file/page/panel/region locators, conflicts and supersession links. Evidence records describe sources, not beliefs. |
| **Measurement** | `id`, subject/feature, kind (`nominal`, `asBuilt`, `derived`), value union, original notation, method, datum, source tolerance and measurement uncertainty, input claim IDs. Measurement of a perspective image is not accepted without a calibration/uncertainty model. |
| **GeometrySource** | `id`, representation, source record IDs, immutable file or script path, exact source hash/revision, generator/toolchain hash, covered feature IDs, omitted features, presentation-only exclusions, model maturity and validation report IDs. |
| **PartDefinition** | `id`, revision, name, component class, exact identity claim, quantity unit, applicable variants, geometry source refs, measurement refs, interface refs, connection-point refs, owned subelements, appearance refs and unresolved items. A definition is not an inventory count. |
| **PartInstance** | `id`, definition ID/revision, role, supply origin (`kit`, `user`, `tool`, `consumable`), inventory lot, active variants, disposition, owner instance if integral, and installed-by operation. The same screw cannot be allocated to two final joints. |
| **MechanicalInterface** | `id`, owning definition, interface type, named CAD feature, local frame or unresolved frame reference, surface/axis dimensions, permitted DOF, mating rules, tolerances and evidence. Hole names survive remeshing. |
| **ConnectionPoint** | `id`, owning definition, electrical/mechanical-fluid/etc. kind, connector identity, local frame, pin/cavity names, keying/orientation, voltage/net claims and evidence. Unknown pin mapping is explicit. |
| **MechanicalConnection** | `id`, ordered endpoint refs to instance/interface, joint type, constraint specification, fastener instances, ordered contact stack, allowed contacts/clearances, DOF, activation operation, evidence and unresolved items. Three-way stacks are not reduced to one ambiguous pair. |
| **FastenerDefinition** | Definition ID, printed designation claim, category, nominal diameter/length/pitch measurement refs, head/drive/material standards, thread form, grip range, insertion behavior, and unspecified properties. Rivet codes are identifiers until decoded by an applicable source. |
| **CableDefinition** | Definition ID, conductors/contact mapping, endpoint connector refs, integral-versus-loose ownership, length/width/thickness/radius measurement refs, approved routing guides, strain-relief needs, and schematic-versus-metric routing capability. |
| **CableConnection** | Cable instance, endpoint label, target instance/connection-point, pin mapping or blocker, temporary/permanent purpose, power precondition, activation/deactivation operation IDs, and routing state. Connecting one end does not connect both. |
| **AssemblyStep** | Stable ID, printed number 1–29, title, source panel, variant patches, prerequisites, ordered operations, introduced/used item allocations, required tools, warnings, zeroing conditions, motion/camera refs, verification rules and reference links. |
| **AssemblyState** | Graph/variant/model identity, projected completed operation prefix, every instance location/parent, owned-element states, mechanical/cable connections, cableRoutes, consumableLots/Allocations, subassemblies, qualified jointCoordinates, requiredConditionIds and checked stock/state hashes. This is a *digital projection*, not the physical confirmation ledger. |
| **AssemblySession** | Session/project ID, selected variant, pinned versions, durable command revision, physical confirmations, invalidations, observations, setup linkage, current review bookmark and source adoption history. Added beyond the requested minimum to prevent conflating physical and digital state. |
| **MotionInstruction** | Target instance set, start-state reference, motion type, ordered feature-relative approach/alignment/insertion segments, final solution reference, duration/easing presentation policy, collision scope, and reversal semantics. Never an unexplained final XYZ literal. |
| **CameraInstruction** | Focus instance/interface set, preferred view/up directions in a named frame, framing margin, view type, occlusion priority, auto/manual policy and transition duration. It cannot control physical state. |
| **VerificationRule** | ID, predicate kind, target refs, declared observability, evidence requirements, exact comparator/tolerance, blocked/failed/passed semantics, human acknowledgment policy, and validity/invalidation dependencies. No free-form AI “looks correct” acceptance predicate. |
| **VisibilityRule** | Scope, lifecycle condition, mode (`normal`, `hidden`, `ghost`, `dim`, `isolatedContext`), picking eligibility, accessible text and precedence. Visibility does not change inventory/attachment state. |
| **ToolRequirement** | Tool category, exact size if evidenced or explicit unresolved size, quantity, purpose, operation scope, and source. Never fabricate a screwdriver size or torque. |
| **Warning** | ID, severity, text, evidence, affected operation/variant, trigger predicate, acknowledgment requirement and whether it blocks execution, completion, or only certification. |
| **VariantRule** | Variant ID, exact compatible board identities, operation/part/connection patches, applicability predicates, forbidden combinations and migration/fork policy. No heuristic runtime board selection. |
| **UnresolvedEvidenceItem** | ID, precise missing claim, impacted features/steps/variants, severity, permitted work, forbidden claims, evidence search completed, resolution criteria, owner milestone, state and superseding evidence. |

Schema `additionalProperties: false` is the default for closed records. Unknown-value unions are accepted in authoring but not at gated mechanical dependencies. Schema validity is necessary, not sufficient: referential integrity, evidence applicability, inventory arithmetic, DOF and geometry admission require dedicated validators.

## 5. Inventory, ownership and consumables

Inventory has separate **printed stock**, **observed physical stock**, **planned use**, **installed use**, **backup reserve**, **unused variant stock**, and **noninstalled accessories**. An unknown observed stock count is not equal to the printed stock count merely because the owner supplied a manual photograph.

Every assembled washer, screw, rivet, standoff, plate and loose module has a stable physical instance. Quantity grouping in the UI is a view over these IDs. A rivet purchased as a body-and-pin assembly has one inventory instance and two addressable owned visual/mechanical elements; do not count the pin again as another supplied rivet. An integrated servo lead is owned by its servo but has an independently tracked cable endpoint. A spare servo horn in a package is a separate supplied accessory only once actual package quantity is established.

Tape and wrap are cuttable consumables. A cut operation creates a child piece linked to a source roll/sheet allocation. Piece length remains unresolved when no length is prescribed. Digital review can return to a pre-cut *instruction state*, but physical undo does not claim to restore a cut roll or adhesive backing. Warnings preserve this distinction.

A canonical inventory comparison is scoped: `observedPhysicalCount == modeledPhysicalInstances` is evaluated only when observed counts exist. Otherwise its result is **BLOCKED**, never PASS. Printed-BOM reconciliation is a different check. A missing optional kit accessory does not create a fake installed node to satisfy an orphan check; its disposition is `accessory`, `tool`, `backup`, or `variantUnused`.

## 6. Coordinate systems, feature frames and pivots

**D-TRANSFORM-01:** engineering CAD uses right-handed **millimetres**, +X robot forward, +Y robot left, +Z upward in the nominal upright assembly. The global origin is a datum on Plate A: its center plane intersected with a named mounting-plane datum and a named longitudinal datum. The exact datum feature selection is fixed in M6 from applicable geometry; absent geometry blocks its numerical realization, not the convention. Never place the origin at an unmeasured bounding-box center and call it a mechanical datum.

glTF uses right-handed metres, +Y up and +Z asset forward [W05]. The project's basis change is:

```text
p_runtime = 0.001 * R * p_CAD
R = [ 0 1 0
      0 0 1
      1 0 0 ]

CAD +X forward -> runtime +Z
CAD +Y left    -> runtime +X
CAD +Z up      -> runtime +Y
```

`det(R)=+1`: this is a rotation, not a reflection. For a rigid pose `(Q,t)`, export `(R Q R^-1, 0.001 R t)`. Convert both local geometry and its instance pose consistently. Quaternion order is **[x,y,z,w]**, normalized. Canonical calculations use float64; runtime vertex positions and GPU attributes may be float32 within the export budget. No negative/nonuniform instance scale, Euler-angle storage, matrix shear, or double unit conversion.

Per-definition origins are mechanical datums: screw under-head bearing-plane center with +Z along its shank; standoff mating-face center and bore axis; wheel shaft/bore axis at its seating face; servo spline axis plus housing datum; PCB drawing datum; plate's defined reference plane and hole/edge datums. Cable connectors have contact-center/keying frames. A visually convenient picking pivot may be a child presentation object, never a replacement for the CAD frame.

All final poses are references into an assembly solution. Canonical constraints determine hole/axis alignment, coincident/contact faces, signed offsets from evidenced thicknesses, fastener stack depth and required orientation. Stored solved transforms are generated artifacts with solver and input hashes. Runtime may use them without running CAD; it may not hand-edit them.

## 7. Joint semantics and variant compilation

Separate assembly membership from attachment constraints. The attachment graph can contain loops; the scene graph cannot. Fixed mounts have zero remaining DOF. Steering-link and wheel bearings retain explicit revolute DOF. Step 21's G-plate/horn connection is not converted into a weld. A spline mating fixes a relative indexed orientation only when the servo-zero state and horn orientation are established; unknown tooth geometry cannot be replaced with an SG90 assumption.

Compile the graph separately for `rpi4`, `rpi5`, and `rpi-zero-2-w`. Each compiled graph has the same 29 printed numbers; branch-specific operations replace steps 1–4 while later operations inherit applicable cable/board refs. Store all variant constraints in authoring data and reject contradictory combinations. The unused camera cable or nylon hardware remains in inventory rather than becoming an orphaned installed component.

The assembly hierarchy includes base/electronics, drive, ultrasonic/front support, pan-tilt, steering and front wheel carriers. It is a selection/explosion hierarchy, not a license to reorder the printed manual. In particular, the camera ribbon is installed into the Pi before HAT mounting and routed through the gimbal before the relevant final attachments.

## 8. Versioning and invalidation

Version five independent domains: schema, graph semantics, mechanical model, evidence corpus and presentation assets. Every generated artifact records only the upstream stage-applicable hashes defined in HASH_AND_PACK_CONTRACT.md; it never requires its own or downstream hashes. A content hash changes when relevant canonical data changes; retrieval dates and packaging timestamps do not randomly perturb the semantic hash.

A source supersession never deletes the old claim. Add an explicit `supersedes` edge, resolution rationale and impact set. Invalidate certificates and dependent physical observations when the meaning or geometry they used changes. Cosmetic color changes alone do not invalidate physical confirmations. A feature moving by any amount beyond its prior authorized equivalence policy does.

Do not silently reinterpret an old session against a new graph. Either retain its pinned model pack or present an explicit migration/fork with a deterministic invalidation report. The default for a Pi variant change is a new session with no imported physical-step confirmations. Setup OS/reference-reading progress may remain shared.

## Audited v2 binding contracts

[SEMANTIC_CONTRACT.md](SEMANTIC_CONTRACT.md) defines the complete state, qualified references, physical attestations, typed rule registry, derivations/conflicts and deterministic variant patches. [HASH_AND_PACK_CONTRACT.md](HASH_AND_PACK_CONTRACT.md) defines upstream-only hash preimages and runtime metre transforms. The v2 schema is the structural authority; passing it alone is not semantic or geometry admission. No runtime translationMm field is permitted. See [GATE_CONTRACTS.md](GATE_CONTRACTS.md) for mandatory semantic checks.


---

## Source document: SEMANTIC_CONTRACT.md

# Canonical semantic contract — audited v2

This is a normative extension of DIGITAL_TWIN_DATA_MODEL and ASSEMBLY_ENGINE_SPEC. The v2 JSON Schema carries the record shapes below. The compiler, not JSON Schema alone, proves cross-record invariants. These requirements are implemented in M1–M3; this specification package does not contain the application implementation.

## 1. Complete digital state and identity

`AssemblyState` is a closed serializable **digital instruction projection**. Its complete mutable surface is: instance dispositions/parents/owned-element states, active mechanical connections, active cable-end connections, cable routing, consumable lots and piece allocations, subassembly membership/solution references, joint coordinates, required condition IDs and the completed operation prefix. There are no hidden Maps, renderer-owned coordinates, mutable global inventory, or human acknowledgments inside this state. `stockDispositionHash` is a checked derivative, never the sole stock record. `stateHash` and stock hashing follow HASH_AND_PACK_CONTRACT.

`CompiledGraph.initialState` supplies every declared lot, physical instance and empty or pre-existing semantic collection. A consumable piece ID is allocated at authoring time and starts inactive/available in the canonical inventory; allocation activates that piece and records its source lot. No UUID, current time or user interaction occurs during projection. Unknown cut length stays a NumericValue unresolved object; known nonnegative allocations may not exceed a known lot capacity. Unknown capacity/amount permits symbolic instruction replay but blocks quantitative conservation certification. Count units cannot substitute for length units.

A `SubassemblyState` contains a stable assembly ID, explicit nullable parent, direct member instance IDs and a solution reference. Null means **no semantic parent**, never an unknown transform. Every instance has at most one direct parent; every assembly has at most one parent; the membership forest is acyclic. Attachments remain a separate potentially cyclic constraint graph. Grouping reassigns explicitly listed instances, never implicit descendants selected by scene traversal. All semantic groups and their parent forest are declared in initialState; groupSubassembly materializes/updates membership in those declared groups and cannot invent a new group or parent relation at runtime. Moving a group sets its common operation solution reference without changing membership or duplicating connected cables; composed world poses come from the corresponding solution. Loose inventory has a null parent. The robot semantic root has a null parent. Member lists and instance parent pointers must agree exactly.

An owned element is keyed by `(instanceId, elementId)`. Every element state is declared; activeOwnedElements equals the mechanically active subset of ownedElementStates under the named element-state policy. Rivet body insertion and pin locking retain one purchased rivet instance. Removed backing remains a removed owned element; it is not another washer or restored physical material on digital rewind.

## 2. Instance-qualified interfaces

A definition-local interface identifies a feature shared by all instances of that definition. Every placement, guide, motion anchor and camera focus that refers to a **physical** interface uses an `Endpoint {instanceId, interfaceId}`. The compiler proves that the interface belongs to that instance's definition. A display name is never a lookup key.

Joint coordinates are keyed by `(connectionId, dof)`, not bare interface ID. `attachJoint.payload.jointCoordinates` supplies explicit coordinates for that connection. `setJointReference` names the connection and DOF and resolves its coordinateRef to a Measurement. Translational DOF use mm; rotational DOF use rad. Duplicate keys, fixed-joint coordinates, undeclared DOF and cross-instance references fail. Definition-local runtime interface frames deliberately use `(definitionId, interfaceId)` because their frame is reusable; composition into the world adds the physical instance pose exactly once.

## 3. Operation effects and inverse

The existing 17 operation tags are retained. Each operation writes only the following surface:

| Tag | Exact write surface / required guard |
|---|---|
| introduce | Listed instance locations become tray; no connection or physical confirmation. Already introduced/installed items are not duplicated. |
| attachRigid | Activate its fixed connection; select the operation's solution for affected instances. All endpoints exist. |
| attachJoint | Activate its connection; initialize the listed `(connectionId,dof)` coordinates; preserve remaining DOF. |
| installFastener | Activate the connection, assign that fastener to assembly and its explicit parent, preserve ordered stack; reject concurrent consumption in another active connection. |
| insertRivet | Set owned body inserted, activate declared connection; no new inventory item. |
| lockRivet | Require inserted body; set owned pin locked. |
| connectCableEnd / disconnectCableEnd | Add/remove exactly one declared cable connection. Reject duplicate occupancy of an exclusive port and incompatible pin/endpoint identity. Unknown electrical applicability remains blocked for physical/electrical certification, not silently approved. |
| routeCable | Replace that cable instance's ordered guideEndpoints, representation and common solutionRef. No cable length or route geometry is invented. |
| allocateConsumable | Add exactly one source-lot/piece allocation and activate the predeclared piece; record allocatedAmount verbatim, including uncertainty. |
| applyConsumable | Require its allocation; set appliedConnectionRef and activate its prescribed connection. |
| acknowledgeProcedure | Add the required condition ID to the projection. It does **not** create a human acknowledgment. |
| confirmZeroing | Add the scoped zeroing condition requirement. It does **not** observe or zero the servo. |
| groupSubassembly | Update the predeclared named semantic group and explicitly reparent listed instances; reject cycles. |
| moveSubassembly | Select the common operation solutionRef for the named group's motion; payload has no competing solutionRef. |
| setJointReference | Replace one qualified coordinate from the named Measurement. |
| removeOwnedBacking | Mark the named owned element removed and remove it from activeOwnedElements; preserve its owner identity. |

Every operation includes parentAssignments, an explicit list of (instanceId, nullable parentAssemblyId) updates; an empty list means no reparenting. The compiler proves that groupSubassembly assigns every listed member to that group and that introduced/installed items have the intended parent. Membership records and per-instance pointers update together. The prescribed solution supplies the affected pose set. No automatic nearest-object inference is allowed. A command checks all preconditions before applying **any** writes. One operation is atomic. OperationUndo captures the complete prior state and expectedAfterHash; undo checks that hash, restores the snapshot, and recomputes both hashes. Non-top-of-stack undo is rejected; jump-to-step recomputes a prefix from initialState instead. Serializing and reparsing both states and undo records must preserve exact round trips. A snapshot is a cache: independent replay is the final authority.

Connector latch opening, insertion and closure are presentation subsegments of an atomic completed-endpoint operation in V1. They are not separately durable sensed latch states. During a crash or interrupted physical task, the UI returns to the last acknowledged boundary and asks the user to inspect the incomplete task. It does not infer that an actual latch or cable physically reverted.

## 4. Human conditions and zeroing

`ProcedureAcknowledgment` and `ZeroingAttestation` live only in AssemblySession. They bind session, variant, graph/model, condition rule, procedure-revision hash, operation, dependencies, actor and time. A zeroing attestation additionally binds a servo instance, servoEpoch and one validForOperationId; it requires `movementSinceZeroingDenied:true`. This is a user's statement, **not** an angle measurement or proof that power is safe.

Before a physical completion command, `prepareCommand` verifies applicable records and consumes the zeroing attestation in the **same storage transaction** as horn-fixation confirmation. Retrying that command does not consume it twice. A different attachment command cannot reuse a consumed attestation. Servo replacement, reported movement, horn reindexing, physical disassembly, procedure revision, variant/model/graph adoption or dependency invalidation increments the affected servo epoch and invalidates dependent confirmations. Review/seek/reverse playback never changes epochs or requests hardware actions. Actual physical undo appends an invalidation event; it does not delete history or digitally uncut tape.

The temporary P11 occupancy is a real connection in the reference-semantic graph, exclusive to one servo at a time and removed before the final wiring state. Final P0/P1/P2 roles remain those printed in V40. A checkbox cannot close Q-08's voltage/applicability conflict, promote unknown geometry, or certify torque/hidden engagement.

## 5. Rule registry and uncertainty

`VerificationRule` now has predicateVersion, evaluationPhase and typed expected data. There is no eval-string interpreter. The predicate registry version 1 is fixed by this table. targetIds are typed by the predicate; references resolving to a different record family fail compilation. A quantity rule targets a named inventory allocation scope; a residual/clearance rule targets a named engineering check output; orientation targets an interface/connection; electrical endpoint rules target CableConnection records.

| Predicate | Evaluation phase | Expected type / comparator |
|---|---|---|
| presence | projection | boolean / equals |
| identity | projection or engineering | idSet / setEqual |
| orientation | engineering | reference to an evidenced FrameRecord / equals with toleranceRef |
| quantity | projection or engineering | numeric count / equals |
| mateResidual | engineering | numeric mm or rad / lessOrEqual; separate rule per dimension |
| clearance | engineering | numeric mm / greaterOrEqual |
| sourceApplicability | engineering | claimScope / sourceSupported |
| zeroingAcknowledgment | physicalCommand | boolean true / allTrue |
| powerAcknowledgment | physicalCommand | boolean true / allTrue |
| cableEndpoint | projection or engineering | idSet of intended connection IDs / setEqual |
| inventoryConservation | projection or engineering | boolean true / allTrue |
| observationResidual | observation | numeric mm or rad / lessOrEqual |

Engineering rules are not executed as hardware preconditions during pure projectPrefix. The projector records required condition IDs; the capability evaluator classifies absent engineering proof as BLOCKED. Unknown expected values cannot pass. IDs, quantities, units, comparator compatibility and operand type must be validated in M1/M2. Projection-phase identity means canonical identity consistency, not physical identity verification.

Every derivationRef resolves to a `DerivationRecord`, rather than a free-form claim standing in for a numeric method. It binds subject/feature, input claims and measurements, method text and immutable method artifact, output Measurement and uncertainty method. Hand calculations may use an immutable text artifact. Claims remain the existing scoped Claim records. A provisional derivation may carry an unresolved method artifact but cannot pass engineering admission. Calculation reproduces the recorded value and uncertainty from input bytes; source limitations propagate and cannot be removed by applying a formula. There is no independence assumption between correlated measurements without evidence.

`ConflictRecord` explicitly groups conflicting claim IDs for a property. Open conflicts carry an unresolved resolution with blockers; a resolved conflict names the resolution Claim, which preserves both original claims and its rationale. Source scope `referenceApproximation` never becomes production dimensional authority merely because provenance is official. VERIFIED printed transcription stays different from VERIFIED nominal geometry. The example derived standoff number remains schema-only/provisional, not an admitted dimension.

M1 creates typed registries for every named reference family used by the original schemas: claims, measurements, FrameRecords, derivations, conflicts, interfaces, connection points, constraints, conditions, tools, warnings, motion/camera/visibility policies, assembly groups, stock lots, solutions, before/after state contracts and reports. Each reference has exactly one owner/type. Unknown reference IDs are errors, not automatically synthesized records. Source geometry can remain unresolved; the identity of a declared interface or blocker cannot be silently missing.

## 6. Variant compilation

Each VariantPatch has its own ID and exactly one variantId and stepId. AssemblyStep.variantPatchRefs must resolve to those patches. For a given step/variant there is at most one patch; it replaces one **nonempty contiguous span** in the base ordered operation list. An empty replacement list removes that span. Pure insertion uses a replacement span that explicitly retains the desired anchor operation. No last-writer-wins or implicit concatenation. Active/inactive instance sets must be disjoint; branch operations and their connections must agree with the selected board and cable definitions. Compile each of the three variants to exactly 29 original printed numbers. The canonical group label for S27 is `chassis/rear-drive`, never steering/front.

## 7. Mandatory semantic tests, not claims of execution

M1 must implement typed-reference closure, duplicate IDs, unresolved-payload rejection, uncertainty/source-scope propagation and predicate operand tests. M2 must implement all 29×3 variant prefixes, every operation forward/serialized-undo round trip, disjoint branch consumption, cable port exclusivity, unresolved consumable arithmetic, nested membership/cycle rejection, grouped moves with connected cables, S21 free DOF, S25 handedness and S27 rear-drive ownership. Test exact prefix derivation in a fresh process with no renderer or persistence state. M3 must implement attestation/retry/invalidation tests and browser/desktop parity. The package's audit validator tests schema shapes and finite adversarial fixtures, not this future engine.


---

## Source document: ASSEMBLY_ENGINE_SPEC.md

# Assembly engine specification

## 1. The engine is not a Blender timeline

**D-ENGINE-01:** the assembly engine consumes a compiled, variant-specific graph of physical items, connections and operations. Animation visualizes a transition between two deterministic digital states. It is neither the source of those states nor evidence that the physical task happened.

Expose pure functions through `src/domain/assembly/`:

```ts
compileGraph(authoringRecords, variant): CompiledGraph | BlockerReport
projectPrefix(graph, prefix): AssemblyState
applyOperation(state, operation): { state: AssemblyState; inverse: OperationUndo }
undoOperation(state, inverse): AssemblyState
prepareCommand(session, command): PersistableCommand | DomainError
getStepCapability(graph, stepId, variant, admission): StepCapability
```

These are specified interfaces, not code implemented in this package. The compiled graph includes every physical instance allocation, temporary/permanent cable connection, branch decision, subassembly membership, required verification rule, and before/after solution reference. Unknown geometry does not prevent compilation of the **reference-semantic** graph; it prevents emission of an admitted geometric transition. Never let a null pose mean either “unknown” or “not installed” depending on context.

## 2. Four states that must not be conflated

1. **Canonical assembly model:** immutable parts/interfaces/graph/solutions for a particular model hash and variant.
2. **Projected digital state:** before/after a known operation prefix; includes inventory and connection state. It can be computed for review even when the owner has not built that state.
3. **Physical progress ledger:** immutable confirmation/observation events and explicit invalidations. Self-confirmation is not sensor proof.
4. **Presentation state:** review cursor, normalized time, selected item, camera, visibility and exploded offsets.

A URL changes the review cursor. A successful physical completion command changes the ledger. A rendered frame changes neither. An animation is permitted to display the *proposed* after-state before the user confirms the actual work, with a visible “Check your physical assembly” state.

## 3. Graph and operation vocabulary

Preserve the printed 1–29 order. Steps 1–4 compile variant alternatives; numbers are not duplicated or renumbered. Use suboperation IDs such as `PX-V40-OP-18-ZERO-TILT`, not new printed steps 30–32 for safety interstitials. The setup wizard's earlier OS/software tasks remain prerequisite guidance outside this 29-step graph.

Each operation is a tagged instruction with explicit inputs, effects and inverse data. Allowed baseline tags:

| Operation | Semantic effect |
|---|---|
| `introduce` | Moves an allocated item from inventory into the active work area; no mechanical attachment implied |
| `attachRigid` | Activates a specified fixed connection and solves/selects its admitted final pose |
| `attachJoint` | Activates an explicit joint with permitted DOF and a prescribed nominal coordinate |
| `installFastener` | Activates one fastener instance in an ordered, evidence-backed contact stack |
| `insertRivet` / `lockRivet` | Separate body placement and locking-element state of one purchased rivet instance |
| `connectCableEnd` / `disconnectCableEnd` | Changes one endpoint connection; temporary P11 connections are explicit |
| `routeCable` | Changes route-guide references; exact metric curve or labeled schematic route capability |
| `allocateConsumable` / `applyConsumable` | Creates a traceable tape/wrap piece from stock and records its intended placement |
| `acknowledgeProcedure` | Records a required user acknowledgment through a session command, not a geometric transform |
| `confirmZeroing` | Records a scoped servo-instance attestation valid for the specified horn-attachment operation |
| `groupSubassembly` | Changes semantic grouping while preserving individual item identities and mechanical relationships |
| `moveSubassembly` / `setJointReference` | Selects a source-supported solution or joint reference without adding new physical items |
| `removeOwnedBacking` | Marks an owned protective backing element removed/consumed; does not remove its washer from inventory |

Introducing an already introduced instance, spending an already allocated fastener, using incompatible hardware, referencing an unknown endpoint, or activating a forbidden branch raises a domain error. An unknown observed inventory count blocks physical-stock verification, but not a correctly labeled printed-plan projection.

Use a linear printed-step execution edge by default plus finer operation dependencies within each step. Mechanical dependency edges and verification invalidation edges are also explicit. The conservative physical undo closure includes all subsequent dependent steps. Finer future optimization of invalidations requires evidence-backed dependency tests; it is not a license to preserve questionable confirmations.

## 4. Session and transition state machines

Guidance mode is `guided` or `review`. Playback is `idleBefore`, `playingForward`, `paused`, `idleAfter`, `playingReverse`, or `error`. Inspection layout is `assembled` or `exploded`; isolation is an orthogonal visibility filter. The controller rejects incompatible combinations, such as beginning installation while an exploded offset is active.

| Input | Preconditions | Result |
|---|---|---|
| Open step | Valid revision/variant/step route | Compute before/after projection; show reference or approved 3D capability; do not alter confirmations |
| Play | Stable assembled-layout endpoint; assets/admission ready for 3D | Start timeline at 0; otherwise reference-only step remains navigable |
| Pause | Timeline running | Freeze normalized time and camera transition |
| Resume | Paused | Continue from same normalized time; no reallocation/connection duplication |
| Finish animation | Normalized time reaches 1 | Snap to exact admitted after-state, show checks, set `idleAfter`; physical ledger unchanged |
| Complete & next | Required confirmations and physical prerequisites satisfied | Prepare deterministic command, persist event+snapshot transaction, publish acknowledged session revision, then navigate |
| Previous / replay | Any noncommitting state | Cancel/rebase visual transition to an endpoint, evaluate requested review; ledger unchanged |
| Undo physical confirmation | Explicit user confirmation | Append invalidation event for dependency closure; return guided cursor to earliest unmet step |
| Variant selection change | Explicit fork confirmation | New session pinned to other compiled variant, no inherited physical-step attestations |
| Persistence failure | Any proposed durable action | Keep prior acknowledged state, show retry, reuse command ID; no success indicator |
| Asset/admission failure | Before or during display | Cancel to stable projection/reference view, retain ledger, report exact failure type |

Only one durable command per session is in flight. Revision compare-and-swap prevents two windows from silently overwriting one another. Repeated click/retry with the same command ID is idempotent. A stale revision reloads and asks the user to retry; do not merge conflicting completion/undo commands heuristically.

Persist at stable semantic boundaries, never at animation frames. A crash midway through visual motion restores the last acknowledged physical ledger and opens a stable before/after review pose. The app must not infer installation completion from a cached animation timestamp.

## 5. Confirmation and zeroing semantics

A completed printed step requires its required checks, not the mere passage of time. Each confirmation records actor type, step/operation, variant/model hash, statement, time and dependency set. `self_confirmed` and `observation_supported` remain distinct. An observation may support only a subset of a step; hidden properties remain human-confirmed/unresolved.

Step 17 introduces the printed power/ZERO/P11 procedure. Steps 18, 19 and 22 each require a fresh acknowledgment for the named servo before fixing its horn. Record `servoInstanceId`, zeroing procedure revision, operation scope, and whether movement/reorientation since zeroing is denied by the user. This is not proof of an exact measured angle. Disassembly/repositioning, replacing the servo, changing its horn indexing, or revising the zeroing procedure invalidates the relevant attestation and downstream alignment confirmation.

P11 is a temporary connection. The graph may connect one servo lead at a time during its zeroing suboperation and remove that temporary connection afterward; it must not show all three occupying P11 or keep P11 connected in the step-29 final state. Final port roles are taken from the V40 diagram, with unresolved pin/electrical applicability distinguished from known printed labels.

Reference review and reverse playback do not ask the user to power the robot or redo zeroing. Returning to actual guided work requires valid scoped conditions. The application never actuates a servo or executes a Raspberry Pi command in the initial product.

## 6. Deterministic motion specification

Each transition is evaluated from immutable **before** and **after** states. A motion target has a start pose (tray/previous subassembly), feature-relative approach waypoints, alignment pose, insertion axis, and final solution ref. Final pose is never a visually adjusted coordinate.

Use one normalized timeline per transition. A segment evaluates `pose = f(segmentTime)` directly; do not integrate frame-by-frame translation or rotation into the existing Object3D. Seek, replay and reverse therefore produce the same state at the same time regardless of frame rate. A frame clock may advance time, but it cannot define mechanical pose by accumulated deltas.

Presentation defaults, adjustable without changing mechanical hashes:

| Segment | Default duration / interpolation |
|---|---|
| Free-space approach | 900 ms; quintic smoothstep `6t^5−15t^4+10t^3` for translation; shortest-path quaternion SLERP |
| Fine alignment | 350 ms; same easing; no overshoot |
| Axial seating | 500 ms; smooth bounded insertion ending exactly at final pose |
| Screw seating | 750 ms; axial motion plus explicitly labeled illustrative rotation unless pitch/engagement are known |
| Rivet body / locking pin | 500 ms then 350 ms; ordered subelement motion |
| Cable guide transition | 900 ms; metric interpolation only for approved routes, otherwise schematic reveal |
| Camera focus | 500 ms; interruptible; no mandatory camera move in reduced-motion mode |

Speed control 0.25×–2× changes duration only. Pause on document visibility loss; do not skip a long background interval on resume. Reduced-motion evaluates endpoints with no travel/spin. A replay can be stopped at every segment boundary; Escape returns to the last stable endpoint rather than persisting an intermediate assembly.

Approach distance can be computed from approved bounds and a declared presentation margin. This is a visual staging offset, not a dimension claim. The insertion direction and final seating plane must derive from the mechanical interface. If safe access direction/path is unknown, show the final relationship with a source panel and do not present an invented collision-free installation path as validated.

Coordinated hardware installs remain separately identified. A grouped four-screw animation can stagger by 120 ms for clarity, but its transaction records four distinct instance allocations. Subassemblies move as a declared instance set, with relative internal relationships preserved. A new camera/gimbal move cannot strand its already-connected cable or create another copy of that cable.

Screw spin must not claim a thread pitch from `M3` alone. When pitch and engagement are evidenced, rotation/translation coupling may use them; otherwise spin is presentation-only and the inspector says so. Rivet locking can only depict a known locking mechanism; unresolved internal shape remains a source-panel sequence, not a fabricated snap animation.

## 7. Reversal and round-trip invariant

For each compiled variant and operation:

```text
undoOperation(applyOperation(S, op).state, inverse) == S
projectPrefix(k) == reverse(projectPrefix(k+1), recordedInverse(k+1))
forward(all 29 printed steps) == nominal final assembly projection
reverse(forward(initial)) == initial digital state
```

Equality uses canonical state serialization, excluding wall-clock/session-history fields. Operation inverses retain exact prior connection states, stock allocation, joint coordinate, group membership and consumable-piece identities. “Hide the mesh again” is not a valid inverse of installing a fastener.

For motion, reverse playback evaluates the same path at `1−t`, with segment ordering and cable/locking states reversed. No newly invented removal trajectory is substituted. This is **visual review**, not a claim that adhesive application, a locked rivet, or a powered connector can safely be physically undone by reversing the animation. Any future physical disassembly procedure needs its own validated safety instructions.

## 8. Exploded views

Exploded view is a reversible presentation overlay. Build an attachment-tree projection from the canonical subassembly hierarchy and selected attachment edges. Preserve constraint cross-links separately for mechanisms with loops; do not force a cyclic CAD graph into a cyclic scene hierarchy. The chosen primary attachment edge is stored in compiled data, not selected nondeterministically by array order.

For each selected assembly, derive an explode direction from its primary mate axis/face normal and documented access direction. Apply a display gap based on the approved component/subassembly bounds. Child offsets accumulate from parent offsets. Use stable ID order for overlap resolution; first increase gap along the permitted display direction, then use explicitly authored secondary **presentation** directions. These directions may aid readability but cannot become actual assembly paths.

Support whole-robot, selected-subassembly and nested explosion with a 0–1 slider. A loop-constrained steering mechanism may explode as a single mechanism group until a defined inspection breakdown is chosen. Show dashed connection lines for broken visual relationships. Metric cables do not stretch magically: switch to connector-to-connector schematic tethers while exploded, labeled accordingly.

Test bounding-volume overlap and label occlusion for exploded layouts, but do not treat a collision-free exploded pose as assembly verification. “Return to assembly” sets every offset exactly to zero and restores the prior visibility/isolation profile. Installation playback is unavailable until return completes. Exit or error always leaves canonical poses untouched.

## 9. Camera and selection architecture

The camera target is the union of current operation bounds and the named mating interfaces. Use a bounding sphere with 25% framing margin and the narrower effective horizontal/vertical field of view to compute the viewing distance. Preferred directions come from the operation's CAD frame: top, underside, front, side or connector-normal. Converted frame axes follow the one CAD-to-runtime basis transform.

Camera state has one owner, the presentation controller. OrbitControls reports manual interaction immediately, cancels focus interpolation, and latches manual mode. “Resume auto camera” explicitly releases that latch. Step/replay updates cannot override it. Automatic focus may request an alternate prescribed view when the current target is occluded; it may not move a component to make a camera angle look better.

Raycasting uses pick proxies or admitted mesh geometry associated with canonical IDs. Ghost-future, hidden, clipped-away and decorative unowned nodes are excluded. Hover is throttled independently of React rendering; selection is durable only as a preference/bookmark, not physical state. DOM part-list selection and keyboard focus call the same selection service as canvas clicks.

## 10. Existing application integration

The new assembly route controller receives parsed route, initialized companion state and a manifest repository. It does not replace the global shell. `WizardStep.tsx` delegates only its `assembly` stage to an overview/launcher; other stages continue using the existing renderer/checklists. Add stable routes:

```text
#/assembly                         current project overview
#/assembly/<sessionId>/step/10     printed step review/guidance
#/assembly/<sessionId>/part/<instanceId>
```

The part route opens the inspector in the session's current review context. Optional query parameters may select an operation or source panel, but a URL must not issue a physical-completion command. Unknown IDs, unsupported variants and malformed escapes display recoverable navigation errors.

Reference search keeps existing page/section results and adds part/step results with typed destination constructors. Deep links back from assembly carry a return bookmark; opening Reference or Videos never discards the assembly session. The legacy setup `assembly` done badge derives from all required self-confirmations only after explicit reconciliation, not simply from a complete animation.

## 11. Operation payload and inverse contract

The AssemblyOperation schema fixes the tagged payload for each operation; no generic “execute arbitrary script” operation exists. `applyOperation` validates its preconditions, captures the complete immutable before AssemblyState and produces an after-state with a canonical hash. Its OperationUndo contains `operationId`, `expectedAfterHash` and `beforeState`. `undoOperation` first requires that current state hash equals expectedAfterHash, then restores the captured before state exactly. The model is small enough that this explicit snapshot inverse is preferable to a fragile partial inverse that forgets a cable endpoint or consumable allocation. Review projections can also be reconstructed from graph prefixes; undo snapshots do not become a second source of assembly truth.

Procedure/zeroing operations in the projected graph activate required condition IDs; they do not create real human attestations during preview. Only the session confirmation command adds physical acknowledgment records. Owned rivet body/pin/backing state is explicit per element. A grouping or camera change cannot substitute for a mechanical connection. Schema operation tags, payloads and the table above must remain in lockstep.

## Audited v2 executable record contract

Use [SEMANTIC_CONTRACT.md](SEMANTIC_CONTRACT.md) for the complete state-write table, parentAssignments, qualified joint/guide/motion references and variant-patch algorithm. acknowledgeProcedure/confirmZeroing register requirements during pure projection; only a separate physical command can append ProcedureAcknowledgment or ZeroingAttestation. Use [PERSISTENCE_CONTRACT.md](PERSISTENCE_CONTRACT.md) for duplicate-before-CAS ordering and crash recovery. Runtime graph/solution artifact structures and hash exclusions are fixed by [HASH_AND_PACK_CONTRACT.md](HASH_AND_PACK_CONTRACT.md).


---

## Source document: HASH_AND_PACK_CONTRACT.md

# Hash, solution and runtime-pack contract — audited v2

Normative for M1, M2, M4–M12. Separate **mechanical/model identity** from **published package identity**. Publish at `public/twin/<packHash>/`, not at modelHash. A material/decoder/report change may preserve modelHash while requiring a different immutable packHash.

## 1. Serialization and finite inputs

Use RFC 8785 JSON Canonicalization Scheme (JCS), UTF-8, for semantic JSON hashing. Reject duplicate object keys, nonfinite numbers, lone surrogate strings and negative-zero input before canonicalization. Do not Unicode-normalize strings. Integers used as counts/revisions must be in the interoperable safe-integer range. Array order is retained unless the contract explicitly defines that array as a set; set-like ID arrays and record collections are sorted lexicographically by stable ID before JCS. Operation lists, contact stacks, guide routes and motion segments retain authored order. Do not substitute Python sort_keys or ordinary JSON.stringify for a cross-language JCS implementation. M1 pins the implementation and runs common TypeScript/Rust/Python test vectors, including number exponents, Unicode key ordering and rejected duplicate keys.

`H(kind, payload) = SHA256(UTF8("picar-v2:" + kind + "\n") || JCS(payload))`. Raw file SHA-256 is over the exact bytes without this prefix. Git blob identity remains separate. This package's own `.sha256` manifest uses raw bytes, not H.

## 2. Acyclic hash inputs

M1 authors a `hash-inputs.json` index identifying each input family, its owning source files, exact projection and whether it is authored input or generated output. No output can enter its own transitive inputs. A missing or unclassified input fails hashing. These preimages are mandatory:

| Identity | Exact preimage domain |
|---|---|
| schemaHash | Sorted list of schema relative path + raw SHA-256, including semantic-registry/gate contract version descriptors. |
| evidenceHash | Sorted EvidenceRecord identity/revision/applicability/privacy/rights/source-limitation records and exact source artifact hashes. Exclude retrieval timestamps only; preserve original source revision/date. Private bytes are hashed locally, not automatically published. |
| sourceHash in a gate | The same evidence projection restricted to the declared complete dependency closure, plus the scoped claims and derivation records used by that gate. |
| modelHash | Authored canonical mechanical input records: definitions, instances, interfaces, measurements, scoped claims, constraints, cable identities, stock identities and source CAD/generator **input** hashes. Exclude appearance records, workflow maturity/report links and generated CAD/solution/mesh output references. The projection is materialized as `model-input.json`; all generated outputs are in separate result records, never written back into this input. |
| graphHash (one variant) | Materialized `graph-input.json`: selected variant, ordered steps/operations, mechanical/cable connections, verification rules and the semantic initial-state payload. Exclude generated solution **bytes**; retain stable solution IDs. The initial-state projection excludes exactly graphHash, modelHash, stateHash and stockDispositionHash. Include the complete referenced rule operands, measurements, procedure requirements, warnings and normative MotionInstruction/path inputs used by that variant, copied by canonical value from RuntimeRegistry; IDs alone are insufficient to bind their content. Exclude appearance-only materials/camera preferences. The compiled envelope's own graph/model hashes are not graph inputs. |
| graphSetHash (pack only) | H("graph-set", sorted `{variantId, graphId, graphHash}` tuples from compiledGraphs); does not include artifact hashes or packHash. Sessions, solutions and gate reports bind the selected variant graphHash, never graphSetHash. |
| toolchainHash | Exact dependency locks, OS/container identity, architecture and normalized build options, without wall-clock paths/times. |
| cadHash | Sorted generated CAD raw artifact hashes and independent semantic feature-table hashes. Raw STEP nondeterminism is reported separately from semantic equivalence; no fabricated byte equality. |
| solverHash | Solver implementation/configuration and input constraint policy hashes, not the solution file containing solverHash. |
| solutionsHash | Sorted solution IDs + raw SHA-256 of final solution documents. Solutions may embed upstream model/graph/cad/solver hashes, never solutionsHash itself. |
| meshHash | Sorted final GLB/texture/decoder file paths, SHA-256, byte lengths, ownership/LOD metadata. Exclude reports, admissionReportIds and root manifest. Assets never embed this aggregate hash, report hash or packHash. A definition-local geometryHash refers to its pre-GLB mesh packet. |
| report hash | Exact report bytes after upstream bindings and checked witness artifacts are fixed. Reports do not include their own raw hash or packHash. |
| packHash | H("pack", RuntimeManifest with **only its top-level packHash omitted**). This includes graph/solution artifact hashes, assets, reports, licenses and byte budgets. |
| stockDispositionHash | H("stock", {instances' ID/location/parent/owned-element state, consumableLots, consumableAllocations}); sort instance/lot/piece collections by ID. |
| stateHash | H("state", complete AssemblyState with **only its top-level stateHash omitted**), after recomputing stockDispositionHash. |

Changing any mechanical input invalidates its dependency closure; changing presentation only cannot silently invalidate physical confirmations. New graph/model adoption is an explicit session event with scoped invalidation/fork, never substitution by a loader. Every generated artifact records **only upstream hashes applicable to its stage**. Requiring downstream hashes in upstream artifacts creates a cycle and is prohibited.

## 3. Executable graph and solutions

RuntimeManifest v2 contains one compiledGraphs entry per claimed variant: variantId, graphId, graphHash and an available artifact with exact raw hash and length. Each artifact validates as CompiledGraph, includes initialState, all operations, active physical instances, connections, rules and ordered steps, and resolves every replay dependency. RuntimeManifest has no duplicate root step list and no ambiguous singular graphHash. The selected CompiledGraph owns its resolved steps; the root graphSetHash binds the exact claimed variant set. The global instance table includes all accounted items, including accessories; its overlapping instance records must match each graph byte-for-byte after canonical serialization. Variant graphs may omit inactive branch instances only when their disposition is explicitly accounted in the manifest.

RuntimeManifest.registry is an available, hash-bound RuntimeRegistry artifact. Its closed typed families contain all definitions, measurements, interfaces, connection points, claims, source metadata, derivations/conflicts, tools/warnings and motion/camera/visibility/variant records needed for replay, inspectors and capability checks. Load the registry before adopting a graph; validate full typed reference closure across registry, graph, initialState and solution index. A reference to an unavailable geometry artifact can remain explicitly unresolved; a known ID may not resolve from an external hidden database or a mutable global. Source metadata may cite private originals without bundling those private bytes. TEST-only empty registries are not complete kit packs.

Each solutions entry has a stable solutionId, variantId and artifact. AssemblySolution.poses are absolute transforms from definition-local coordinates into the robot runtime world; no parent-local pose is implicit. Group display transforms must not be multiplied into these world poses twice. The decoded document validates as AssemblySolution and must equal those identifiers and upstream bindings. Every known solutionRef resolves exactly once. Missing solution data makes the affected transition reference-only, not identity-pose. An unresolved reference never resolves by filename guessing.

RuntimeTransform has only `translationM`, normalized XYZW quaternion, unit `m` and basis `RH-YUP-ZFORWARD`. It cannot contain translationMm, arbitrary scale or shear. Canonical CAD Frame remains RH millimetres with +X forward, +Y left, +Z up. Convert with R=[[0,1,0],[0,0,1],[1,0,0]], p_runtime=.001 R p_CAD and Q_runtime=R Q_CAD R^-1. R has determinant +1. Convert vertices/local frames/poses exactly once. Definition interfaceFrames are reusable local transforms; instance pose composition provides world transforms. No CAD numeric Frame is silently interpreted as a runtime transform.

RuntimeAsset declares boundsM, LOD triangle counts, exact LOD node-name sets, decoderArtifacts (not unhashed paths), definition/element ownership and capability. All LOD node names must exist; selected nodes form the complete intended draw set for that LOD. Bounds/triangles are recomputed from decoded final bytes, not copied from unchecked metadata. The same geometry may be shared across physical instances, but each picking/selection/visibility operation resolves a unique physical instance ID. Instancing is optional only after measurement, with an audited draw-instance-index→physical-ID bijection. No mandatory per-fastener React state updates per frame.

## 4. Immutable publication and trust

Stage the complete pack outside public/twin. Validate every file and the closed allowed-path set; reject absolute paths, parent traversal, backslashes, percent-encoded traversal, external URLs and symlink escapes. The schema's lexical PackPath check is only the first layer. Refuse undeclared glTF resources. Read, hash and decode the same bytes; no check-then-reopen race. Publish an immutable directory named packHash, then atomically update the active pointer with an expected-previous-pointer check. If that directory exists with different bytes, fail; never overwrite it. Retain the old directory until no pinned session/reader needs it. A failed pointer write leaves the old pointer valid.

Cache by `(packHash, path, sha256)`, not filename or modelHash alone. Load the manifest once per pack lease, verify all requested assets against that root and enforce compatible contract/schema/gate-policy versions. Partial rebuilds still create a complete new root. During hot reload, an existing session remains pinned until explicit compatible adoption. Browser and native adapters enforce the same artifact/compatibility rules. A self-written PASS report is not trust; preserve ASSET_PIPELINE_SPEC's explicit local trusted/adopted admission chain.

## 5. Required tests

M1: JCS cross-language vectors, preimage exclusion checks and dependency-cycle mutation tests. M2: identical fresh-process graph/state hashes, operation-order sensitivity and exact undo. M8: material-only rebuild changes packHash but not modelHash; an old GLB under a new manifest fails; changed decoder, graph or solution bytes fail; missing declared file and symlink/traversal fail; mid-publication crash preserves a usable prior pointer. M9: one-time basis conversion and correct left/right asymmetric fixture, unique reused-servo picks, context-loss recovery without ledger change. None of these implementation tests is represented as already run by the audit validator.

Primary serialization source, independently inspected for this audit: RFC 8785, https://www.rfc-editor.org/rfc/rfc8785.html (JCS, especially §§3.1–3.2.4). The project adds the stricter negative-zero and domain-prefix policies above.


---

## Source document: PERSISTENCE_CONTRACT.md

# Durable commands, migration and recovery — audited v2

Normative for M3 and later. Keep Rust-managed SQLite and the IndexedDB browser adapter. Neither owns canonical mechanical truth. There is one mutation owner per aggregate, not two eventually-consistent progress stores.

## 1. Transaction protocol

A command envelope contains aggregate/session ID, commandId, expectedRevision, graph/model binding, payload and requestHash. requestHash binds the canonical envelope excluding requestHash; it is stored with the result. Within one transaction: (1) look up commandId **before** revision rejection; (2) return the exact stored acknowledgment for an identical requestHash, without repeating side effects; (3) reject the same ID with different payload/hash/aggregate as COMMAND_ID_REUSE; (4) for a new command compare expectedRevision and pinned graph/model; (5) require a TypeScript-prepared proposal whose conditions were evaluated at the same expected revision; native rechecks stored attestation eligibility and the revision/model bindings; (6) append events, consume scoped attestations, write snapshot/revision and command-result row atomically; (7) commit; (8) acknowledge. A lost acknowledgment followed by a retry returns the original result even though expectedRevision is now old. Different stale commands receive CONFLICT; no heuristic merge.

A frontend success indicator follows the committed acknowledgment, not local animation completion. The frontend computes a proposal but retains the last acknowledged state after rejection/quota/disk failure. SQLite validates schema/envelope/hash/sequence/CAS and operation/event authorization; the TypeScript domain projection is replayed and compared before adoption. Native code may store the supplied snapshot only as a bounded cache alongside authorized events; neither storage nor a matching checksum makes that snapshot canonical truth. The sole TypeScript reducer independently replays events before a loaded/imported snapshot can be used. The contract test suite supplies the same semantic event fixtures to both adapters. Database uniqueness is `(aggregate_id, command_id)` with stored requestHash; event ordering is `(aggregate_id, sequence)` and revisions increase exactly once. Cross-aggregate writes require an explicit joint transaction, not two independent commits.

Use an IndexedDB readwrite transaction across events, snapshots, aggregate state, command results and imports. No awaited network request or unrelated asynchronous computation is allowed inside that transaction. Compute bounded proposals first, then re-read/validate revision in the transaction. Two tabs/windows race on the same aggregate: exactly one fresh revision wins; identical retries return the same acknowledgment. Browser quota failure is failure, not temporary success.

## 2. Legacy `picarx.v1`

Preserve the exact raw string and raw SHA-256 before interpreting it. Validate allowed top-level types and nested values; quarantine malformed or oversized input with an export/recovery option. Do not rewrite or delete the original key. Copy validated legacy setup/check/lastRoute/pdfLastPage data into the setup aggregate; an assembly checkbox becomes a **legacy self-report**, not 29 confirmations, an inventory count, a geometry gate or a zeroing attestation.

Migration identity is `(sourceOrigin, sourceKey, rawHash, migrationVersion)`. Write raw backup, parsed setup copy and migration marker in the same durable transaction. Before commit there is no applied migration; after commit there is exactly one. Retry/import with the same identity returns the existing result. If browser→desktop import is requested, it is an explicit export/import operation; do not assume localStorage origins share a namespace.

Once adopted, the new adapter is the source of truth and legacy writes cease in the new app. A downgrade may edit the preserved old key. On re-upgrade, compare its current raw hash with the captured hash: identical means no action; different means LEGACY_DIVERGENCE and explicit choice to retain new state or import validated legacy setup into a separate recovery aggregate. Never merge or reimport automatically, never overwrite newer detailed confirmations, and retain both raw copies. The old app cannot read the new session; downgrade is not reverse migration.

## 3. Backups, schema upgrades and imports

Before a database migration, create a verified logical export or use a SQLite-consistent backup mechanism. Copying only a live `.db` file while WAL contains committed changes is not a backup protocol. Bind backup to schema version, aggregate revisions, event/graph/model hashes and byte checksums; test restoring it independently. Apply schema migrations transactionally and update the migration marker only on commit. Unsupported newer schema/graph versions open read-only export/recovery, never default reset. Browser IndexedDB upgrades must likewise abort cleanly if another connection blocks the required version change; show the blocker rather than silently deleting the database.

Session imports are data-only bounded envelopes (8 MiB default, matching ARCHITECTURE); they cannot choose arbitrary destination paths or overwrite canonical source files. Validate complete record/reference closure and replay all events against the exact pinned graph before adoption. Untrusted imported geometry remains provisional under the existing pack trust policy. Exporting retains source modality and invalidation history; it does not upgrade self-reported state to observed state.

## 4. Required fault-injection tests

M3 acceptance requires identical adapter results for: lost acknowledgment retry; ID reused with changed payload; two distinct concurrent commands; interrupted migration before/after marker; changed legacy key after downgrade; malformed legacy bytes retained; old assembly checkbox imports zero detailed confirmations; disk/quota failure; missing event/duplicate sequence/invalid snapshot hash; unsupported newer schema; backup with committed WAL changes; explicit recovery restore; variant fork retaining zero physical confirmations; rejected canonical-path import; servo attestation consumption/retry/invalidation. Package validation does not substitute for these actual database and application tests.


---

## Source document: SOURCE_PUBLICATION_CONTRACT.md

# V40 source lock and safe content publication — M0 contract

## 1. Lock the source, not its filename

M0 creates `picarx-companion/tools/content-pipeline/documentation-source-lock.json`. A verified lock must validate against documentation-source-lock.schema.json and record the application baseline, exact upstream PiCar-X and sf-shared commits, the actual upstream gitlink, PDF acquisition locator, Git blob (when applicable), SHA-256, length, revision evidence, all 29 panel mappings and the checked photo hashes. Git blob SHA-1 is not PDF SHA-256. The included template is intentionally BLOCKED; its missing PDF hash is not a wildcard.

Before generation, verify the **actual source bytes read** against the lock. A matching Git HEAD with edited working-tree sources is insufficient. Build an input manifest of every consumed RST/config/media source, companion overlay/custom-doc source and transform implementation; require tracked upstream content to match the pinned Git objects. The independent PDF is checked separately. Untracked generated assets cannot become source authority. Resolve `_shared` to the pinned submodule commit and confirm clean consumed content. A wrong/missing V40 PDF, a V33-only directory, an edited PDF with the same name, or altered input must stop before any live output mutation. No "best available version" path and no automatic lock regeneration on failure.

The 29-entry PDF panel map records each printed step number and one or more mappings. Each mapping records a 1-based PDF page, normalized top-left-origin LTRB rectangle (left < right; top < bottom), owner-photo ID/panel, branch coverage and reviewer result. Multiple mappings allow branch panels on different PDF pages. Require numbers exactly 1…29, no duplicates, and branch evidence for Pi4/Pi5/Zero2W at steps 1–4. A panel map proves documentary correspondence, not exact CAD geometry or physical completion. If PDF and photographed booklet materially disagree, retain Q-02 and report the conflict; do not combine whichever instruction seems convenient. M0 may start while Q-02 is open, but its source gate and M1 permission cannot pass until this documentary lock passes.

## 2. Two different publication surfaces

Preserve the raw upstream checkout and owner evidence byte-for-byte. The source content builder owns only the documented generated pages/indexes and public/content outputs. It does not own public/twin, custom-docs, canonical twin sources, unrelated public files or user data.

Git ignore rules are not a release filter. Create an explicit denied-media registry mirroring the current credential/authentication paths and add positive release input ownership. Generate a **safe public mirror outside the source public directory** for Vite dev and production packaging. It includes only approved static assets and cleared generated content, plus separately admitted twin packs when those exist. The mirror excludes denied media regardless of Git tracking. Configure the dev/build entrypoints to consume this mirror, retaining existing URL paths (`/content/...`) and reference placeholders. Do not recursively copy an arbitrary public directory into a release.

Existing excluded local copies may already reside in public/content. They must not be destroyed to sanitize a bundle: retain their bytes at their original paths in the local working output, but exclude them from the safe mirror. During a generated-directory replacement, carry forward those explicitly private preserved files without making them published assets, and verify their exact pre/post hashes. Staging containing such files is private/ignored and never a release artifact. This preserves originals while closing the packaging hole. Tests use synthetic marker files in an isolated fixture; do not print or copy real credential content into reports.

## 3. Multi-root transaction

A staged rename of one directory does not atomically update src/content/pages, the four index files and public/content together. Use one publication coordinator with an exclusive writer lease and reader leases for dev/build. A live dev server is a reader; generation reports BUSY until it stops. No live mutation under Vite's watcher. All build/dev entrypoints perform journal recovery and generation verification before acquiring a reader lease. Direct unsupported entrypoints that bypass the coordinator must fail or be removed from documented scripts.

The writer: verifies all inputs → renders a private complete generation → validates references, source/panel lock and safe-mirror exclusions → hashes all managed roots and protected sentinels → writes a journal naming old/new generations and every replacement → installs replacements with recoverable backups → verifies all hashes → writes a committed generation marker → exposes the safe mirror to readers → releases the lease. On failure before the marker, recovery restores **all** old managed roots and verifies hashes. On failure after the marker, recovery verifies/completes the new generation before readers start. No consumer sees a mixed generation. Both old and new roots stay available until successful recovery/commit is proven. The coordinator's implementation must make its filesystem durability assumptions explicit; a power-loss case that cannot be proven is BLOCKED, not claimed atomic.

Stale leases are not broken merely because they are old. Identify live ownership and fail closed when ownership cannot be established; provide a deliberate recovery command requiring no readers/writer, with a dry-run report. A second writer fails BUSY. Source verification, copy and hashing operate on one captured set of bytes so changes between preflight and staging are detected. Do not follow symlinks outside approved source/output roots.

## 4. Objective M0 tests

In disposable fixtures, inject failures after each journal/replacement/marker boundary and run a fresh recovery process. Compare complete managed-tree path+byte manifests: result must be exactly old or exactly new, never mixed. Verify `public/twin/TEST-SENTINEL`, custom-docs, preserved private-marker files and legacy localStorage fixtures are unchanged. Test two writers, an active reader, interrupted recovery, a changed source after preflight and a missing rollback file. Failure must be explicit and retain recoverable evidence.

Test V40 present/matching, V40 missing with V33 present, wrong bytes under V40 name, wrong upstream/shared revision, dirty consumed source and malformed panel map. Test denied-media fixtures in source output, untracked output and nested paths; none may appear in the safe mirror, dist or shipping resources. Preserve third-party notices and the prior app's known omitted-media placeholders. A green fresh-clone Git status alone proves none of this.


---

## Source document: GATE_CONTRACTS.md

# Acceptance and invalidation gates — audited v2

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


---

## Source document: V40_ASSEMBLY_LEDGER.md

# Z0104V40 — complete printed assembly ledger
This is the controlling transcription of the **29 printed steps** visible in owner photographs 04–06. Printed numbering remains unchanged. Source confidence below concerns what the printed instructions depict, not actual component dimensions or the owner's completed physical robot. The machine-readable planning seed contains the same records.

Every numeric interface frame and exact CAD final pose remains blocked until evidence resolves it; this is deliberate, not permission to select convenient XYZ coordinates. Connection intents below are binding semantic requirements. M2 turns them into canonical operation/endpoint IDs; M5–M7 supply admitted mechanical realizations. The common tools are a driver matched to the actual screw head, the supplied wrench where nuts are used, and hand placement. No tool size, torque, connector force or rivet-code dimension has been inferred.

All steps require the previous printed step in guided mode. Earlier setup guidance remains accessible; camera/connector power-off acknowledgments and per-servo zeroing conditions are suboperations, not extra printed steps. Pi4/Pi5 share most mounting instructions, but their camera ports/cables remain separate. Zero2W has its own support stack and a header-readiness prerequisite.

**Critical source checks completed in this pass:** four HAT screws in S04 for both diagram branches (including the partly occluded fourth screw); two M3x26 supports at S10; free rotation at S21; E right/F left at S25; Washer A at S19 and three Washer B per front wheel at S26; temporary P11 versus final P0/P1/P2. The source photos and legibility crops are included in EVIDENCE.

## 01. Prepare Plate A mounting supports

**ID:** `PX-V40-STEP-01` · **Source:** `PX-EV-PHOTO-04`, printed step 1 · **Parent:** base/electronics · **Prerequisite:** entry/preflight.

**Parts introduced / reused:** Plate A ×1. Pi4/Pi5: M2.5x18+6 nylon standoff ×4. Zero2W: M2.5x30 ×2 and M2.5x11 ×2.

**Hardware:** M2.5x6 screw ×4 for every branch.

**Connections and final constraints:** Plate-A rear-deck mounting holes -> screw bearing stack -> standoff base faces; all standoff axes normal to the mounting plane. Four physical support positions; branch chooses support types.

**Orientation / warning:** Keep the male ends of the Pi4/Pi5 M2.5x18+6 supports toward the Pi. For Zero2W distinguish the two tall HAT supports from the two short Pi supports; do not mirror the diagram.

**Tools:** Matched screwdriver; hand placement of nylon standoffs. Driver size/torque unresolved.

**Cable operations:** None. Power remains off.

**Servo zeroing:** None.

**Camera focus:** Rear deck, underside screw view then top support view.

**Motion recipe:** Stage A as workpiece; align each screw/support to its named hole axis; seat according to the evidenced stack. No dimensional animation before admission.

**Verification:** Correct four positions and branch-specific support types; zero duplicated hardware; support axes and bearing contacts pass when geometry exists.

**Geometry blockers:** Q-03, Q-06, Q-10. Reference instructions remain available; numerical motion/fit claims require G-GEOMETRY.

## 02. Mount the selected Raspberry Pi

**ID:** `PX-V40-STEP-02` · **Source:** `PX-EV-PHOTO-04`, printed step 2 · **Parent:** base/electronics · **Prerequisite:** PX-V40-STEP-01.

**Parts introduced / reused:** Selected Raspberry Pi ×1, user-supplied. Pi4/Pi5: M2.5x18 standoff ×4; USB mini microphone ×1 shown in the shared panel. Zero2W: M2.5x18+6 standoff ×2.

**Hardware:** No additional separate screw is prescribed in this panel; upper standoffs fasten the board.

**Connections and final constraints:** Pi mounting holes -> step-1 supports; upper standoff bearing faces clamp the selected board. Zero2W uses two short support positions, leaving tall HAT supports available.

**Orientation / warning:** GPIO header and camera connector must match the selected board orientation. Microphone insertion follows the matching board USB port; Zero2W USB adaptation is not prescribed here.

**Tools:** Hand fastening/matched tool if needed; no guessed torque.

**Cable operations:** Pi4/Pi5 USB mini microphone plug shown. Zero2W microphone remains an accounted accessory until an applicable adapter procedure exists.

**Servo zeroing:** None.

**Camera focus:** Rear-deck oblique with GPIO/camera connector labels.

**Motion recipe:** Board approaches along support axes, seats on bearing faces, then upper standoffs install. USB accessory is a separate child operation.

**Verification:** Board identity/branch; GPIO/header availability; correct support stack; no port collision; microphone disposition accounted.

**Geometry blockers:** Q-03, Q-06, Q-10, Q-14. Reference instructions remain available; numerical motion/fit claims require G-GEOMETRY.

## 03. Connect the Pi end of the camera ribbon

**ID:** `PX-V40-STEP-03` · **Source:** `PX-EV-PHOTO-04`, printed step 3 · **Parent:** base/electronics · **Prerequisite:** PX-V40-STEP-02.

**Parts introduced / reused:** One selected camera ribbon: Pi4 FFC; Pi5/Zero2W FPC. Alternative cable stock remains noninstalled.

**Hardware:** None.

**Connections and final constraints:** Selected cable Pi-end -> selected Pi camera connector; latch open/insertion/latch closed are separate presentation phases of one atomic connection operation. Camera end remains free.

**Orientation / warning:** Use the exact printed contact/stiffener orientation for that board connector; do not generalize a screen-space “blue side up”.

**Tools:** Hands; do not force latch.

**Cable operations:** Connect Pi end only, power OFF. Cable length/pitch and board-port identity need applicable source binding.

**Servo zeroing:** None.

**Camera focus:** Connector-normal macro view and source inset.

**Motion recipe:** Latch opens; approved ribbon end aligns/inserts; latch closes. Unknown flex shape uses schematic line.

**Verification:** Selected cable label; correct connector face; power-off acknowledgment; camera-end still disconnected.

**Geometry blockers:** Q-09, Q-10. Reference instructions remain available; numerical motion/fit claims require G-GEOMETRY.

## 04. Mount the Robot HAT

**ID:** `PX-V40-STEP-04` · **Source:** `PX-EV-PHOTO-04`, printed step 4 · **Parent:** base/electronics · **Prerequisite:** PX-V40-STEP-03.

**Parts introduced / reused:** Robot HAT ×1.

**Hardware:** M2.5x6 screw ×4 in all three branches; fourth screw confirmed by legibility crops.

**Connections and final constraints:** HAT GPIO connector -> Pi header; HAT holes -> four prepared support positions; screw bearing faces -> HAT/support stack.

**Orientation / warning:** No shifted GPIO engagement; preserve the camera-ribbon route under/around the board as illustrated. A ZERO-button-capable depiction does not identify actual HAT revision.

**Tools:** Matched screwdriver.

**Cable operations:** Camera ribbon already connected at Pi; keep clear of trapped edges. Power OFF.

**Servo zeroing:** None.

**Camera focus:** Top-oblique HAT/header alignment and side stack view.

**Motion recipe:** HAT approaches along GPIO/support axes; seat connector and mounting stack; four individually tracked screws install.

**Verification:** Four screw instances and supports; header keying/position; HAT revision applicability; no trapped ribbon or connector interference.

**Geometry blockers:** Q-03, Q-06, Q-07, Q-09, Q-10. Reference instructions remain available; numerical motion/fit claims require G-GEOMETRY.

## 05. Install the two drive motors

**ID:** `PX-V40-STEP-05` · **Source:** `PX-EV-PHOTO-04`, printed step 5 · **Parent:** drive/base · **Prerequisite:** PX-V40-STEP-04.

**Parts introduced / reused:** TT motor ×2; separate left/right role instances.

**Hardware:** M3x25 screw ×4; spring washer ×4; M3 nut ×4.

**Connections and final constraints:** Each motor mounting interface -> Plate A rear side-wall holes through the exact screw/washer/nut stack. Shaft interfaces remain available for rear wheels.

**Orientation / warning:** Motor wires face inward, as explicitly printed. Robot left/right, not viewer left/right, names the role.

**Tools:** Matched screwdriver and kit wrench; no assumed wrench size or torque.

**Cable operations:** Integrated motor leads are owned by their motor instances and remain unattached at the HAT.

**Servo zeroing:** None.

**Camera focus:** Underside rear drivetrain, then each mounting side.

**Motion recipe:** Motors align to mount axes; fasteners approach from illustrated access sides and seat in ordered stacks.

**Verification:** Correct inward lead exit; four complete fastener stacks; motor/shaft handed placement; unused HAT endpoints until S29.

**Geometry blockers:** Q-03, Q-04, Q-06. Reference instructions remain available; numerical motion/fit claims require G-GEOMETRY.

## 06. Prepare battery hook-and-loop mounting

**ID:** `PX-V40-STEP-06` · **Source:** `PX-EV-PHOTO-05`, printed step 6 · **Parent:** drive/base · **Prerequisite:** PX-V40-STEP-05.

**Parts introduced / reused:** Battery ×1 staged; hook tape piece ×1 and loop tape piece ×1 allocated from supplied material.

**Hardware:** No mechanical fastener.

**Connections and final constraints:** Hook piece -> battery contact surface; loop piece -> underside of Plate A. Adhesive extents/thickness unresolved, not rigid dimensional constraints.

**Orientation / warning:** Hook on battery, loop on chassis underside as printed.

**Tools:** Hands; cutting tool only if material actually requires cutting, not an invented mandatory tool.

**Cable operations:** Battery integrated lead stays free. Power OFF.

**Servo zeroing:** None.

**Camera focus:** Underside mounting region and battery surface inset.

**Motion recipe:** Schematic peel/place if adhesive geometry unverified; pieces stay traceable to source material.

**Verification:** Correct mating material sides/locations; no invented dimensions; no double-counted whole roll and cut piece.

**Geometry blockers:** Q-03, Q-11. Reference instructions remain available; numerical motion/fit claims require G-GEOMETRY.

## 07. Secure and connect the battery

**ID:** `PX-V40-STEP-07` · **Source:** `PX-EV-PHOTO-05`, printed step 7 · **Parent:** drive/base · **Prerequisite:** PX-V40-STEP-06.

**Parts introduced / reused:** No new battery: use the same instance prepared in S06.

**Hardware:** No new fastener.

**Connections and final constraints:** Battery hook surface -> A loop surface; battery lead -> HAT BATTERY connector. Mount compliance and exact envelope require evidence.

**Orientation / warning:** Connector orientation must match its keyed interface; connected does not mean switch ON.

**Tools:** Hands.

**Cable operations:** Connect the existing battery lead to the printed BATTERY port. Maintain an explicit power-off acknowledgment requirement (not sensed power state) until zeroing.

**Servo zeroing:** None.

**Camera focus:** Underside pack, then HAT battery connector.

**Motion recipe:** Bring pack to its mounting surface; show lead endpoint connection without inventing an exact slack curve.

**Verification:** Same battery ID; correct BATTERY endpoint; mounting/lead clearance scope; switch state is user-acknowledged, not inferred.

**Geometry blockers:** Q-07, Q-09, Q-11. Reference instructions remain available; numerical motion/fit claims require G-GEOMETRY.

## 08. Attach the pan horn to the front chassis

**ID:** `PX-V40-STEP-08` · **Source:** `PX-EV-PHOTO-05`, printed step 8 · **Parent:** front/base · **Prerequisite:** PX-V40-STEP-07.

**Parts introduced / reused:** Pan-role servo arm/horn ×1.

**Hardware:** M1.5x3 screw ×4.

**Connections and final constraints:** Pan horn mounting holes -> Plate A front mounting holes; preserve spline/bore access for S19.

**Orientation / warning:** Horn sits at the front position shown to support the pan-tilt assembly; distinguish horn from the later servo body.

**Tools:** Matched screwdriver.

**Cable operations:** None.

**Servo zeroing:** No spline attachment yet; zeroing required later in S19.

**Camera focus:** Front chassis underside/horn mounting face.

**Motion recipe:** Horn aligns to the named chassis pattern; four screws seat individually.

**Verification:** Four prescribed screws; correct horn role and orientation; spline-access face remains available.

**Geometry blockers:** Q-03, Q-05, Q-06. Reference instructions remain available; numerical motion/fit claims require G-GEOMETRY.

## 09. Install the ultrasonic module and Plate H

**ID:** `PX-V40-STEP-09` · **Source:** `PX-EV-PHOTO-05`, printed step 9 · **Parent:** front/base · **Prerequisite:** PX-V40-STEP-08.

**Parts introduced / reused:** Ultrasonic module ×1; Plate H ×1.

**Hardware:** R3080 rivet ×2.

**Connections and final constraints:** Ultrasonic mounting holes, Plate A front interface and H backing plate form the printed two-rivet stack; exact layer normals/grip require geometry.

**Orientation / warning:** Transducers face robot-forward. Retain H backing-plate position; do not swap a generic ultrasonic bracket.

**Tools:** Hands / printed rivet insert-push-lock procedure.

**Cable operations:** Sensor cable not connected until S28/S29.

**Servo zeroing:** None.

**Camera focus:** Front sensor mount, then backing-plate view.

**Motion recipe:** Module/backing align; rivet bodies insert and locking elements engage separately when mechanism admitted.

**Verification:** Correct R3080 code; two stacks; module/H alignment; connector clearance; no generic HC-SR04 identity substitution.

**Geometry blockers:** Q-03, Q-06, Q-08. Reference instructions remain available; numerical motion/fit claims require G-GEOMETRY.

## 10. Fit the two front support standoffs

**ID:** `PX-V40-STEP-10` · **Source:** `PX-EV-PHOTO-05`, printed step 10 · **Parent:** front/base · **Prerequisite:** PX-V40-STEP-09.

**Parts introduced / reused:** M3x26 standoff ×2.

**Hardware:** M3x6 screw ×2.

**Connections and final constraints:** A front underside mounting holes -> standoff top bearing faces; screws from the printed top access side. Lower faces remain for D in S23.

**Orientation / warning:** Supports extend under the front car. This is printed step 10, not step 11.

**Tools:** Matched screwdriver.

**Cable operations:** None.

**Servo zeroing:** None.

**Camera focus:** Front support axes, top screw view then underside.

**Motion recipe:** Align both standoff bores to A holes; insert screws; expose lower D attachment frames.

**Verification:** Two M3x26 definitions/instances; two M3x6 allocations; parallel/aligned support frames and intended stack.

**Geometry blockers:** Q-03, Q-06. Reference instructions remain available; numerical motion/fit claims require G-GEOMETRY.

## 11. Connect the camera end of the ribbon

**ID:** `PX-V40-STEP-11` · **Source:** `PX-EV-PHOTO-05`, printed step 11 · **Parent:** pan-tilt · **Prerequisite:** PX-V40-STEP-10.

**Parts introduced / reused:** Camera module ×1; reuse ribbon introduced at S03.

**Hardware:** None.

**Connections and final constraints:** Cable camera-end -> camera connector with open/insert/close latch operation. No second cable is introduced.

**Orientation / warning:** Follow the printed blue-plastic-side orientation at the camera itself; source inset remains available.

**Tools:** Hands; no force.

**Cable operations:** Connect other end of FFC/FPC while power OFF.

**Servo zeroing:** None.

**Camera focus:** Camera connector macro view.

**Motion recipe:** Show correct local-face approach and latch movement if admitted; otherwise source-panel sequence and schematic ribbon.

**Verification:** Single cable instance connects Pi and camera endpoints; contact orientation and power-off acknowledgment.

**Geometry blockers:** Q-08, Q-09. Reference instructions remain available; numerical motion/fit claims require G-GEOMETRY.

## 12. Mount the camera on Plate C

**ID:** `PX-V40-STEP-12` · **Source:** `PX-EV-PHOTO-05`, printed step 12 · **Parent:** pan-tilt · **Prerequisite:** PX-V40-STEP-11.

**Parts introduced / reused:** Plate C ×1; reuse the camera from S11.

**Hardware:** R2048 rivet ×4.

**Connections and final constraints:** Camera PCB mount pattern -> C camera-mount face; four rivets activate their ordered camera/plate stacks.

**Orientation / warning:** Lens faces outward through the intended opening; ribbon remains connected and untrapped.

**Tools:** Hands / rivet procedure.

**Cable operations:** Preserve existing camera ribbon connection.

**Servo zeroing:** None.

**Camera focus:** Camera face and C rear/inside mounting holes.

**Motion recipe:** Camera and C align as a small subassembly; rivets install independently.

**Verification:** Four R2048 instances; camera/C holes and lens envelope; no cable pinching or duplicated camera instance.

**Geometry blockers:** Q-03, Q-06, Q-08, Q-09. Reference instructions remain available; numerical motion/fit claims require G-GEOMETRY.

## 13. Attach the tilt horn to Plate C

**ID:** `PX-V40-STEP-13` · **Source:** `PX-EV-PHOTO-05`, printed step 13 · **Parent:** pan-tilt · **Prerequisite:** PX-V40-STEP-12.

**Parts introduced / reused:** Tilt-role servo horn ×1.

**Hardware:** M1.5x3 screw ×4.

**Connections and final constraints:** Tilt horn mounting pattern -> C side face; spline bore remains free for tilt output at S18.

**Orientation / warning:** Horn on the printed side of C; do not mirror it or assume it is the same arm shape as steering.

**Tools:** Matched screwdriver.

**Cable operations:** Keep camera ribbon clear.

**Servo zeroing:** Spline zeroing occurs at S18, not implied by horn-to-plate attachment.

**Camera focus:** C side/horn interface close-up.

**Motion recipe:** Horn approaches along its mounting normal; four screws seat.

**Verification:** Four correct screws; horn role/orientation; future tilt spline frame remains resolvable.

**Geometry blockers:** Q-03, Q-05, Q-06. Reference instructions remain available; numerical motion/fit claims require G-GEOMETRY.

## 14. Install the pan servo on Plate B

**ID:** `PX-V40-STEP-14` · **Source:** `PX-EV-PHOTO-05`, printed step 14 · **Parent:** pan-tilt · **Prerequisite:** PX-V40-STEP-13.

**Parts introduced / reused:** Plate B ×1; pan servo ×1.

**Hardware:** R2056 rivet ×2.

**Connections and final constraints:** Pan servo tabs -> B lower mounting surface; spline/output axis kept available for chassis horn.

**Orientation / warning:** Servo wire exits on the side shown in panel 14. Label the physical role Pan.

**Tools:** Hands / rivet procedure.

**Cable operations:** Pan integrated lead remains free for temporary P11 zeroing and later P0.

**Servo zeroing:** No horn mating until S19.

**Camera focus:** B lower servo tabs and wire-exit cue.

**Motion recipe:** Servo aligns to B; two R2056 bodies/pins install.

**Verification:** Correct pan role; two rivets; tab seating; cable-exit orientation; no assumed SG90 dimensions.

**Geometry blockers:** Q-03, Q-05, Q-06. Reference instructions remain available; numerical motion/fit claims require G-GEOMETRY.

## 15. Install the tilt servo on Plate B

**ID:** `PX-V40-STEP-15` · **Source:** `PX-EV-PHOTO-05`, printed step 15 · **Parent:** pan-tilt · **Prerequisite:** PX-V40-STEP-14.

**Parts introduced / reused:** Tilt servo ×1; reuse Plate B.

**Hardware:** R2056 rivet ×2.

**Connections and final constraints:** Tilt servo tabs -> B upright mounting face; output axis faces the C horn attachment.

**Orientation / warning:** Wire exit follows panel 15; preserve distinct pan and tilt role labels.

**Tools:** Hands / rivet procedure.

**Cable operations:** Tilt integrated lead remains free for P11 then P1.

**Servo zeroing:** No horn mating until S18.

**Camera focus:** B upright face, tilt output and lead exit.

**Motion recipe:** Servo aligns to upright B; two rivets install without moving the pan servo.

**Verification:** Two R2056 allocations; correct tilt output direction; clearance between servo housings.

**Geometry blockers:** Q-03, Q-05, Q-06. Reference instructions remain available; numerical motion/fit claims require G-GEOMETRY.

## 16. Route the camera ribbon through the gimbal gap

**ID:** `PX-V40-STEP-16` · **Source:** `PX-EV-PHOTO-05`, printed step 16 · **Parent:** pan-tilt · **Prerequisite:** PX-V40-STEP-15.

**Parts introduced / reused:** No new physical part.

**Hardware:** None.

**Connections and final constraints:** Existing camera ribbon route -> guide/gap between the B-mounted pan and tilt servos. Endpoint connections from S03/S11 remain unchanged.

**Orientation / warning:** The ribbon passes through the printed gap rather than outside the future articulation path.

**Tools:** Hands.

**Cable operations:** Route the existing FFC/FPC; no unsupported metric cable length, bend radius or strain claim.

**Servo zeroing:** None.

**Camera focus:** Gap between servo bodies with camera/connector context.

**Motion recipe:** Schematic route reveal until cable envelope is admitted; metric curve must obey actual guide/bend constraints.

**Verification:** Same cable/endpoints; correct guide topology; bend/slack check BLOCKED if its inputs are unknown.

**Geometry blockers:** Q-03, Q-05, Q-09. Reference instructions remain available; numerical motion/fit claims require G-GEOMETRY.

## 17. Introduce the servo-zeroing procedure

**ID:** `PX-V40-STEP-17` · **Source:** `PX-EV-PHOTO-05`, printed step 17 · **Parent:** pan-tilt · **Prerequisite:** PX-V40-STEP-16.

**Parts introduced / reused:** No new part; prepared robot and servo leads.

**Hardware:** None.

**Connections and final constraints:** Procedure state: printed power ON -> ZERO button -> temporary single-servo P11 connection before each horn attachment. No permanent P0/P1/P2 wiring is created.

**Orientation / warning:** Use the exact depicted HAT interface when applicable; do not infer actual board revision from this drawing.

**Tools:** Hands; existing setup/software reference where applicable.

**Cable operations:** Temporary P11 is reserved for one servo at a time. Battery connection and procedure are explicit; this app does not energize hardware.

**Servo zeroing:** Acknowledge per-servo zeroing requirement; fresh role-specific confirmation at S18/S19/S22.

**Camera focus:** HAT power/ZERO/P11 inset plus source panel.

**Motion recipe:** Procedure interstitial, not a fabricated servo-angle measurement animation.

**Verification:** HAT/procedure applicability; temporary versus permanent ports; no blanket “all three zeroed” auto-certification.

**Geometry blockers:** Q-05, Q-07. Reference instructions remain available; numerical motion/fit claims require G-GEOMETRY.

## 18. Mate the camera/Plate-C assembly to tilt

**ID:** `PX-V40-STEP-18` · **Source:** `PX-EV-PHOTO-06`, printed step 18 · **Parent:** pan-tilt · **Prerequisite:** PX-V40-STEP-17.

**Parts introduced / reused:** No new major part; C/camera/horn joins B/tilt.

**Hardware:** Smallest servo-package retaining screw ×1; exact dimensions/standard unresolved.

**Connections and final constraints:** Zeroed tilt output spline -> C tilt-horn spline; retaining screw seats through horn into output. Preserve C/camera as one internally connected subassembly.

**Orientation / warning:** Middle/zero orientation as printed; do not force an arbitrary horn index.

**Tools:** Matched screwdriver for the package screw.

**Cable operations:** Temporary tilt lead to P11 during zeroing; remove temporary assignment afterward; camera ribbon route remains.

**Servo zeroing:** Fresh tilt-instance zeroing attestation immediately before fixing horn.

**Camera focus:** Tilt spline/retainer macro view and camera orientation overview.

**Motion recipe:** Subassembly approaches spline axis, aligns indexed orientation, seats and receives retaining screw.

**Verification:** Correct smallest package screw, fresh tilt attestation, spline/frame alignment, cable clearance.

**Geometry blockers:** Q-03, Q-05, Q-06, Q-09. Reference instructions remain available; numerical motion/fit claims require G-GEOMETRY.

## 19. Mate the pan-tilt assembly to the chassis

**ID:** `PX-V40-STEP-19` · **Source:** `PX-EV-PHOTO-06`, printed step 19 · **Parent:** pan-tilt · **Prerequisite:** PX-V40-STEP-18.

**Parts introduced / reused:** Washer A ×1; reuse complete pan-tilt subassembly.

**Hardware:** Smallest servo-package retaining screw ×1.

**Connections and final constraints:** Zeroed pan output -> A-mounted pan horn, with the printed Washer A/retainer stack. Do not substitute Washer B.

**Orientation / warning:** Pan zero orientation and large-bore Washer A correspond to the printed callout.

**Tools:** Matched screwdriver.

**Cable operations:** Temporary pan lead P11 during zeroing, later free until P0 at S29; ribbon stays connected/routed.

**Servo zeroing:** Fresh pan-instance zeroing attestation immediately before fixing.

**Camera focus:** Pan base joint and Washer A close-up, then front overview.

**Motion recipe:** Move the whole gimbal to chassis horn, align spline and washer stack, install retaining screw.

**Verification:** Washer A identity; one pan retainer; fresh pan attestation; all subassembly members and camera cable preserved.

**Geometry blockers:** Q-03, Q-05, Q-06, Q-09. Reference instructions remain available; numerical motion/fit claims require G-GEOMETRY.

## 20. Install the steering servo

**ID:** `PX-V40-STEP-20` · **Source:** `PX-EV-PHOTO-06`, printed step 20 · **Parent:** steering/front · **Prerequisite:** PX-V40-STEP-19.

**Parts introduced / reused:** Steering servo ×1.

**Hardware:** R2056 rivet ×2.

**Connections and final constraints:** Steering servo tabs -> A steering mount; output remains available for G/horn assembly.

**Orientation / warning:** Wire exits on the printed side; label this instance Steering.

**Tools:** Hands / rivet procedure.

**Cable operations:** Integrated steering lead stays free for P11 then P2.

**Servo zeroing:** No horn attachment until S22.

**Camera focus:** Front upper/underside steering mount and wire exit.

**Motion recipe:** Servo approaches mounting face; two rivets insert/lock.

**Verification:** Remaining servo allocated once; correct role, orientation and two R2056 rivets.

**Geometry blockers:** Q-03, Q-05, Q-06. Reference instructions remain available; numerical motion/fit claims require G-GEOMETRY.

## 21. Connect Plate G to the steering horn

**ID:** `PX-V40-STEP-21` · **Source:** `PX-EV-PHOTO-06`, printed step 21 · **Parent:** steering/front · **Prerequisite:** PX-V40-STEP-20.

**Parts introduced / reused:** Plate G ×1; steering-role horn ×1.

**Hardware:** M1.5x3 screw ×1.

**Connections and final constraints:** G center joint -> steering-horn offset hole using a revolute/free-rotation connection, not a rigid weld.

**Orientation / warning:** Do not overtighten: printed instruction explicitly requires free rotation between G and the horn.

**Tools:** Matched screwdriver; no invented torque target.

**Cable operations:** None.

**Servo zeroing:** Horn-to-spline zeroing occurs next in S22.

**Camera focus:** G/horn pivot close-up with rotation cue.

**Motion recipe:** Align hole axes, seat screw without depicting rigid locking; cue permitted joint motion only within evidenced limits.

**Verification:** One M1.5x3 screw; free joint retained; no rigid-constraint regression; actual play/torque not camera-certifiable.

**Geometry blockers:** Q-03, Q-05, Q-06, Q-12. Reference instructions remain available; numerical motion/fit claims require G-GEOMETRY.

## 22. Attach the steering horn assembly to its servo

**ID:** `PX-V40-STEP-22` · **Source:** `PX-EV-PHOTO-06`, printed step 22 · **Parent:** steering/front · **Prerequisite:** PX-V40-STEP-21.

**Parts introduced / reused:** Reuse G/horn subassembly and steering servo.

**Hardware:** Smallest servo-package retaining screw ×1.

**Connections and final constraints:** Zeroed steering spline -> steering horn spline; retaining screw secures horn while G retains its S21 relative revolute joint.

**Orientation / warning:** Nominal steering center as printed; distinguish spline fixation from the separate G pivot.

**Tools:** Matched screwdriver.

**Cable operations:** Temporary P11 during zeroing, then free until permanent P2 wiring.

**Servo zeroing:** Fresh steering-instance zeroing attestation immediately before fixing.

**Camera focus:** Steering spline/retainer and G link orientation.

**Motion recipe:** Subassembly aligns/seats on spline; screw installs without freezing G pivot.

**Verification:** Fresh steering attestation; third retaining screw allocated once; intended remaining DOF preserved.

**Geometry blockers:** Q-03, Q-05, Q-06, Q-12. Reference instructions remain available; numerical motion/fit claims require G-GEOMETRY.

## 23. Install Plate D on the front supports

**ID:** `PX-V40-STEP-23` · **Source:** `PX-EV-PHOTO-06`, printed step 23 · **Parent:** steering/front · **Prerequisite:** PX-V40-STEP-22.

**Parts introduced / reused:** Plate D ×1.

**Hardware:** M3x6 screw ×2.

**Connections and final constraints:** D mounting holes -> lower faces/bores of the two S10 M3x26 standoffs. Preserve front wheel-carrier mounting interfaces.

**Orientation / warning:** D lies beneath the front assembly in the illustrated orientation; sensor face and carrier holes remain accessible.

**Tools:** Matched screwdriver.

**Cable operations:** Keep existing leads/ribbon clear.

**Servo zeroing:** None.

**Camera focus:** Front underside support-to-D view.

**Motion recipe:** D approaches along support axes from below; two screws seat into standoffs.

**Verification:** Same two S10 supports; two remaining M3x6 screws; D orientation and clearance.

**Geometry blockers:** Q-03, Q-06. Reference instructions remain available; numerical motion/fit claims require G-GEOMETRY.

## 24. Attach the grayscale module to Plate D

**ID:** `PX-V40-STEP-24` · **Source:** `PX-EV-PHOTO-06`, printed step 24 · **Parent:** steering/front · **Prerequisite:** PX-V40-STEP-23.

**Parts introduced / reused:** Grayscale module ×1.

**Hardware:** R3055 rivet ×2.

**Connections and final constraints:** Grayscale board mounting holes -> D sensor-mount pattern; two rivet stacks.

**Orientation / warning:** Sensor and connector orientation must match panel 24 and expose the sensing face toward the intended ground-facing work area.

**Tools:** Hands / rivet procedure.

**Cable operations:** Sensor cable remains disconnected until S28/S29.

**Servo zeroing:** None.

**Camera focus:** D sensor-mount underside/connector view.

**Motion recipe:** Module aligns to D and two R3055 rivets install.

**Verification:** Correct module orientation, two rivets, sensor clearance and connector access; dimensions remain source-bound.

**Geometry blockers:** Q-03, Q-06, Q-08. Reference instructions remain available; numerical motion/fit claims require G-GEOMETRY.

## 25. Install right and left front wheel carriers

**ID:** `PX-V40-STEP-25` · **Source:** `PX-EV-PHOTO-06`, printed step 25 · **Parent:** steering/front · **Prerequisite:** PX-V40-STEP-24.

**Parts introduced / reused:** Plate E ×1 on robot right; Plate F ×1 on robot left.

**Hardware:** R3065 rivet ×6, three illustrated per side.

**Connections and final constraints:** Each carrier participates in upper/lower support pivots and steering-link attachment shown in the panel. Exact axis/stack incidence must be bound to named A/D/G/carrier interfaces before geometry admission.

**Orientation / warning:** E is robot-right and F robot-left; viewed from in front, E appears on the viewer left. Do not create mirrored copies without geometry evidence.

**Tools:** Hands / rivet procedure; avoid forcing the moving linkage.

**Cable operations:** No new cable.

**Servo zeroing:** Maintain nominal steering center from S22; no new zeroing claim.

**Camera focus:** Front view showing both carriers, then each pivot/link stack.

**Motion recipe:** Install each carrier along its prescribed access path, preserving linkage connections; no arbitrary fixed poses that conceal loop closure.

**Verification:** Six R3065 instances; correct E/F handedness; closed-chain consistency; allowed steering/pivot DOF and clearance.

**Geometry blockers:** Q-03, Q-06, Q-12. Reference instructions remain available; numerical motion/fit claims require G-GEOMETRY.

## 26. Install the front wheels

**ID:** `PX-V40-STEP-26` · **Source:** `PX-EV-PHOTO-06`, printed step 26 · **Parent:** steering/front · **Prerequisite:** PX-V40-STEP-25.

**Parts introduced / reused:** Front wheel ×2; Washer B ×6, three illustrated for each side.

**Hardware:** R30185 rivet ×2, one wheel axle per side.

**Connections and final constraints:** Each front wheel bore -> carrier axle interface, with three Washer B elements in the illustrated per-side stack and R30185 axle. Exact axial ordering/contacts are bound to source and CAD before admission.

**Orientation / warning:** Use small-bore Washer B, not A. Remove protective paper as the panel instructs; distinguish the removed backing from washer material.

**Tools:** Hands / rivet procedure.

**Cable operations:** None.

**Servo zeroing:** No new zeroing.

**Camera focus:** Wheel-axle stack macro view and both-front-wheel overview.

**Motion recipe:** Show individual washers and wheel insertion along axle; final free wheel rotation remains a declared joint.

**Verification:** Two front wheels, six B washers and two R30185 instances; correct washer type/order; wheel bearing/retention clearance.

**Geometry blockers:** Q-03, Q-06, Q-12. Reference instructions remain available; numerical motion/fit claims require G-GEOMETRY.

## 27. Fit the rear wheels to motor shafts

**ID:** `PX-V40-STEP-27` · **Source:** `PX-EV-PHOTO-06`, printed step 27 · **Parent:** chassis/rear-drive · **Prerequisite:** PX-V40-STEP-26.

**Parts introduced / reused:** Rear wheel ×2.

**Hardware:** No additional fastener shown.

**Connections and final constraints:** Rear-wheel bores -> left/right motor output shafts; seated according to evidenced shaft/hub geometry, not a front-wheel rivet joint.

**Orientation / warning:** Rear-wheel definition and hub orientation must match the motor-shaft arrangement. Do not reuse front-wheel geometry just because diameter looks similar.

**Tools:** Hands; no invented press force.

**Cable operations:** Preserve motor leads.

**Servo zeroing:** None.

**Camera focus:** Rear axle/shaft close-up and underside overview.

**Motion recipe:** Axial wheel approach and seating to the actual shaft interface; no guessed depth or fastener.

**Verification:** Two rear-wheel instances; shaft/bore compatibility and seating; no extra screw/rivet consumption.

**Geometry blockers:** Q-04, Q-12. Reference instructions remain available; numerical motion/fit claims require G-GEOMETRY.

## 28. Connect the sensor ends of their cables

**ID:** `PX-V40-STEP-28` · **Source:** `PX-EV-PHOTO-06`, printed step 28 · **Parent:** wiring/full-robot · **Prerequisite:** PX-V40-STEP-27.

**Parts introduced / reused:** 4-pin wire assembly ×1; 5-pin wire assembly ×1.

**Hardware:** None.

**Connections and final constraints:** 4-pin cable sensor-end -> ultrasonic connector; 5-pin cable sensor-end -> grayscale connector. HAT ends remain free until S29.

**Orientation / warning:** Keying/contact orientation from each exact connector; cable color is supplementary evidence, not definitive pin mapping.

**Tools:** Hands; connector work with power OFF.

**Cable operations:** Connect sensor ends only, retaining distinct cable and endpoint IDs.

**Servo zeroing:** None.

**Camera focus:** Ultrasonic and grayscale connector insets.

**Motion recipe:** Connector alignment/insertion where geometry admitted; schematic remainder of each cable.

**Verification:** Correct 4-pin versus 5-pin cable; one end connected per cable; power-off acknowledgment; electrical applicability conflicts visible.

**Geometry blockers:** Q-08, Q-09, Q-13. Reference instructions remain available; numerical motion/fit claims require G-GEOMETRY.

## 29. Complete the Robot HAT wiring

**ID:** `PX-V40-STEP-29` · **Source:** `PX-EV-PHOTO-06`, printed step 29 · **Parent:** wiring/full-robot · **Prerequisite:** PX-V40-STEP-28.

**Parts introduced / reused:** No new required installed item; reuse all leads and cables. Unused accessories remain accounted for.

**Hardware:** None.

**Connections and final constraints:** Permanent HAT endpoints: pan P0/5V/GND; tilt P1/5V/GND; steering P2/5V/GND; ultrasonic D2,D3 with printed 3V3/GND; grayscale A0,A1,A2 with printed 3V3/GND; MOTOR1 left, MOTOR2 right.

**Orientation / warning:** Connector polarity/keying and exact conductor mapping are separate claims. The printed rail labels do not resolve the repository ultrasonic 5V applicability conflict by themselves.

**Tools:** Hands; power OFF for wiring. No automatic actuation or powered validation.

**Cable operations:** Remove any temporary P11 assignment; connect permanent endpoints; cable wrap/strain relief can be optional sourced guidance, not an invented printed step.

**Servo zeroing:** Preserve completed role-specific zeroing/attachment confirmations; no P11 in final wiring.

**Camera focus:** HAT connector map plus selectable per-cable endpoint views.

**Motion recipe:** Route/connect one labeled endpoint group at a time; exact cable curve only if admitted, otherwise clearly schematic.

**Verification:** All intended endpoints unique/resolved; no temporary P11; motor left/right correct; full inventory accounting; unresolved voltage/pin/strain claims BLOCKED rather than certified.

**Geometry blockers:** Q-07, Q-08, Q-09, Q-13. Reference instructions remain available; numerical motion/fit claims require G-GEOMETRY.


---

## Source document: BOM_RECONCILIATION.md

# Printed BOM and inventory reconciliation
The table counts the unframed primary hardware and framed backup hardware depicted in photo 03 and reconciles the prescribed uses in photos 04–06. The printed note identifies framed items as backup. **These are printed-stock claims, not a count of the owner's actual loose kit items.** M1 records that scope explicitly; physical inventory remains UNRESOLVED until an adequate noninvented source exists.

The M1.5x3 depiction contains nine unframed screws (four in the upper row, five in the lower row) and two framed backup screws: eleven printed total, not ten. The larger crop included in EVIDENCE preserves this interpretation for review. Any contradictory official V40 BOM must become an explicit conflict record, not a silent count overwrite.

| Hardware | Primary | Backup | Total | Pi4 use | Pi5 use | Zero2W use | Allocation |
|---|---:|---:|---:|---:|---:|---:|---|
| M2.5x6 screw | 8 | 2 | 10 | 8 | 8 | 8 | S01×4 + S04×4 |
| M3x25 screw | 4 | 2 | 6 | 4 | 4 | 4 | S05×4 |
| Spring washer | 4 | 2 | 6 | 4 | 4 | 4 | S05×4 |
| M3 nut | 4 | 2 | 6 | 4 | 4 | 4 | S05×4 |
| M1.5x3 screw | 9 | 2 | 11 | 9 | 9 | 9 | S08×4 + S13×4 + S21×1 |
| M3x6 screw | 4 | 2 | 6 | 4 | 4 | 4 | S10×2 + S23×2 |
| M2.5x18+6 standoff | 4 | 2 | 6 | 4 | 4 | 2 | Pi4/Pi5 S01×4; Zero2W S02×2 |
| M2.5x18 standoff | 4 | 2 | 6 | 4 | 4 | 0 | Pi4/Pi5 S02×4 |
| M2.5x11 standoff | 2 | 2 | 4 | 0 | 0 | 2 | Zero2W S01×2 |
| M2.5x30 standoff | 2 | 2 | 4 | 0 | 0 | 2 | Zero2W S01×2 |
| M3x26 standoff | 2 | 2 | 4 | 2 | 2 | 2 | S10×2 |
| R2048 rivet | 4 | 2 | 6 | 4 | 4 | 4 | S12×4 |
| R2056 rivet | 6 | 2 | 8 | 6 | 6 | 6 | S14×2 + S15×2 + S20×2 |
| R3055 rivet | 2 | 2 | 4 | 2 | 2 | 2 | S24×2 |
| R3065 rivet | 6 | 2 | 8 | 6 | 6 | 6 | S25×6 |
| R3080 rivet | 2 | 2 | 4 | 2 | 2 | 2 | S09×2 |
| R30185 rivet | 2 | 2 | 4 | 2 | 2 | 2 | S26×2 |
| Washer A | 1 | 1 | 2 | 1 | 1 | 1 | S19×1 |
| Washer B | 6 | 2 | 8 | 6 | 6 | 6 | S26×6 |

## Non-fastener installed items

The selected 29-step assembly uses A–H once each; two TT motors; two rear and two front wheels; three role-specific servos; three role-specific horns; three smallest-package retaining screws; one battery; one Robot HAT; one user-supplied selected Pi; one camera; one ultrasonic board; one grayscale board; one selected camera ribbon; one 4-pin cable; one 5-pin cable; and one allocated hook and loop piece each. Pi4/Pi5's shared mounting panel also shows the USB mini microphone insertion. The Zero2W microphone/adapter is not prescribed by that panel and remains an accounted accessory.

Servo-package spare horn/screw quantities, whether repeated cable drawings denote multiple supplied cables or opposite views, exact tape/wrap stock, and any actual-versus-printed inventory discrepancies remain Q-13. Do not multiply all package accessory drawings by three without evidence. Distinguish integrated motor/servo/battery leads from separately supplied wire assemblies.

## Reconciliation equations

For each fixed-count definition and selected variant:

```text
printedTotal = printedPrimary + printedBackup
plannedUse <= printedPrimary
variantUnusedPrimary = printedPrimary - plannedUse
expectedUninstalled = variantUnusedPrimary + printedBackup
actualInventoryCheck = BLOCKED when actual supplied quantity is unknown
```

For a physical session with adequate inventory evidence:

```text
observedSupplied = installed + staged + available + consumedOrDiscarded + missingOrDamaged
```

The last two terms require explicit events and cannot silently absorb a discrepancy. Temporary P11 connection does not consume another lead. Moving a gimbal subassembly does not introduce another camera or servo. A rivet pin/body pair is one supplied rivet with owned elements. Consumables use source-lot/piece accounting; review reversal is not a claim of physically uncut material.

Generate a quantity report by step, variant, definition and instance. Unknown quantities make the affected equality BLOCKED. They must not be set to zero to make the report pass. Every unused item has a declared disposition; “no orphan digital component” means no unexplained identity, not that every supplied item must be installed on the final robot.


---

## Source document: GEOMETRY_AND_EVIDENCE_SPEC.md

# Geometry and evidence specification

## 1. Evidence hierarchy and applicability

Use this hierarchy only **after** deciding whether the source actually applies to the claim, product revision and component. A high-tier photo of a printed rendering does not become a dimensional drawing.

| Tier | Source | Admissible claim scope |
|---|---|---|
| 1 | Owner's Z0104V40 printed instructions and direct physical evidence | Visible revision, depicted parts, printed designations, illustrated order/orientation; actual measurements only when genuinely measured with uncertainty |
| 2 | Official SunFounder assets explicitly identified as Z0104V40 | Revision-bound assembly and engineering facts actually present in the asset |
| 3 | Official SunFounder PiCar-X material demonstrably applicable to V40 | Only the demonstrated overlap; document-family names do not establish component identity |
| 4 | OEM engineering drawings/CAD for an exactly identified supplied component | That component's specified nominal mechanics and declared tolerances |
| 5 | Official Raspberry Pi mechanical sources for the selected board/revision | Board outlines, datums, mounts and connectors covered by that source; not kit-specific cables by association |
| 6 | Verified distributor engineering drawings | Identified part/revision and explicitly specified features |
| 7 | Independently validated third-party CAD | Features independently checked against applicable higher-tier evidence |
| 8 | Defensible derived geometry | Reproducible derivation and propagated uncertainty; no additional authority from being in CAD |
| 9 | Community models, product images and uncalibrated reference images | Discovery, comparison and cosmetic reference; not exact dimensions or automatic identity proof |

**D-EVIDENCE-01:** applicability outranks recency and apparent visual quality. An official generic HC-SR04 page is not automatically an exact model of this V40 kit's board. Official Raspberry Pi Camera Module CAD is not automatically the SunFounder camera's CAD. SG90 and MG90S are not interchangeable identities.

Resolve conflicts claim-by-claim. Record competing values and exact locators. Prefer an applicable revision-specific engineering source over an inapplicable high-tier source; do not vote across copied pages. Do not average conflicting dimensions. An unresolved conflict blocks the affected feature and dependent certificates. A resolution record states why a source is applicable, what was superseded, and which artifacts must regenerate.

## 2. Findings that govern the geometry program

The six images establish V40 printed instructions, plates A–H, hardware names, branch-specific standoffs/camera cable labels, and the 29-step sequence. They are not calibrated photographs of loose parts. They do not establish exact plate thickness, bend radius, hole centers, motor gearbox geometry, servo model, shaft/spline geometry, PCB revision, wheel dimensions or head standards. EVIDENCE_INSPECTION documents this limitation per image.

The inspected repository camera page describes approximately `25×23×9 mm` in prose and `24×23.5×8 mm` in its specification list [R18]. Retain both source claims; neither becomes exact V40 camera geometry without applicable evidence. The ultrasonic page names HC-SR04/5 V and gives a dimensional specification, while the photographed V40 final wiring panel labels its supply connection `3V3` [R19; E06]. This is an applicability/electrical conflict, not permission to silently rewire the kit or import a generic sensor STEP.

Official Raspberry Pi mechanical sources were located for Pi4, Pi5 and Zero2W. The inspected Pi5 drawing explicitly marks its dimensions approximate/reference-only and unsuitable for production data [W15]. Such a source may support an accurately transcribed **reference approximation**, not an exact engineering claim. The official Pi5 STEP ZIP is a located candidate; its bytes and limitations were not inspected. Source scope and stated limitations propagate through every derived feature. A source being official is not enough to pass G-GEOMETRY.

Targeted inspection did not establish a complete authoritative public V40 CAD package. This is a research result with finite scope, not proof that no such package exists. The source register and blocker list specify bounded next acquisition paths. Software work must not depend on the owner providing additional photos or measurements.

## 3. Canonical authoring workflow

For each component, ingest source bytes or a revision-pinned source locator; hash available bytes; create scoped identity and dimension claims; resolve conflicts; define semantic mechanical interfaces; generate/import exact nominal CAD; validate it independently; solve the variant assembly; run motion/fit checks; issue a G-CAD engineering report; generate and validate final runtime bytes; only then issue G-GEOMETRY instructional capability.

Each feature must answer: **“Why do we believe this hole belongs here?”** The answer resolves from instance -> definition -> interface -> CAD feature -> measurement/derivation -> evidence locator, with toolchain and validation report. Neither a mesh vertex number nor “the agent modeled it” is an acceptable terminal explanation.

CadQuery owns reconstructed mechanical solids and analytic interfaces. Vendor STEP remains immutable in a source vault and is wrapped by scripted datum/interface definitions. Authoritative DXF can define a flat profile; a bend reconstruction also needs thickness, angle, radius and datum relationships. A perspective illustration may help name a feature, but must not be traced into an exact profile. A planar homography without a trustworthy scale and planarity proof does not recover absolute dimensions; these curved/creased printed-sheet photos are not a dimension-calibration fixture.

Use topology-independent feature names/tags in source code. Avoid persistent references such as “face 17 after Boolean cut”, which can change with kernel/version/parameter edits. CAD checks compare intended analytic feature definitions, not only bounding boxes or rendered similarity.

## 4. Component-class strategy

“Critical geometry” includes attachment surfaces, holes, axes, seating faces, keying, collisions and necessary clearance envelopes. “Cosmetic” means omitted detail cannot change these checks. Unknown cosmetic detail is omitted or marked schematic, not certified by association.

| Class | Canonical source and required fidelity | Runtime / validation and admission |
|---|---|---|
| **Plates A–H** | Revision-matched STEP or engineering drawing/DXF plus thickness, bend angles/radii, hole/slot definitions and handedness; reconstructed in CadQuery | Tessellated rigid parts with stable interface metadata; compare hole tables, face normals, bend locations, thickness and mating geometry. A/B/C/D/E/F/G/H have independent feature/blocker records. No traced-photo “verified” plates. |
| **Machine screws** | Identified standard/manufacturer geometry plus kit designation. Shaft length/diameter, bearing face, head envelope and drive identity where operationally relevant | Nominal smooth threaded shaft plus metadata; analytic engagement/clearance checks. Full helical threads are not needed. Do not assume an ISO head standard from M3 alone. |
| **Servo-package retaining screws** | Separate identity from machine screws; manual establishes selection of the smallest package screw, not thread/length/head dimensions | Source-image hardware card until identity/interface is resolved; no invented M2 designation. Owned by an independent physical screw instance at each servo. |
| **Nuts** | Applicable thread/head geometry for identified M3 nut; nominal hex envelope and threaded bore | Shared definition meshes, separate instances; wrench/access clearance and thread compatibility checked. No cosmetic internal thread tessellation required. |
| **Washer A / B** | Keep definitions separate; need bore, outer diameter, thickness and material/stack role | Every washer instance retained. Step 19 and step 26 cannot interchange definitions. Peel-off protective paper is a removable presentation/consumable element, not extra washer thickness. |
| **Spring washers** | Identified split-washer dimensions and compressed/uncompressed envelope, where relevant | Simplified split ring allowed only with validated seating/clearance envelope; no compression/torque claim from shape. |
| **Standoffs** | Separate definitions for M2.5x11, M2.5x18, M2.5x18+6, M2.5x30 and M3x26. Need body length, sex of ends, thread/depth and outer envelope | Analytic axes and bearing planes; exact stack heights. Printed labels establish designations, not across-flats or hidden bore depth. Use no arbitrary hex radius. |
| **SunFounder rivets** | R2048/R2056/R3055/R3065/R3080/R30185 as opaque part codes until applicable drawing decoding; need grip, body/pin geometry and locking states | One inventory item with body/pin subnodes; install motions separate insertion and locking. Validate grip stack, retention and pivot use; never decode numbers into dimensions without evidence. |
| **Servos** | Exact OEM/kit identity; housing, tabs, mounting holes, spline/shaft, cable exit and zero reference | Separate housing/output elements; casing cosmetic detail optional. Match mounting/spline datum, direction, envelope and horn joint. SG90/MG90S or “9 g servo” family resemblance is insufficient. |
| **Servo horns** | Exact supplied arm shapes and spline/bore; roles pan/tilt/steering remain separate until equivalence proven | Detailed mounting holes and swept envelope; no cross-role mesh reuse based solely on similar appearance. S21 remains a free joint. |
| **TT motors** | Exact manufacturer/kit identity, gearbox body, tabs/holes, both shaft shapes and lead exit; input shaft/gear teeth not necessary | Validate motor-to-A and rear-wheel-to-shaft interface, body/wire clearance and handed placement. A generic yellow TT motor is reference-only. |
| **Front / rear wheels** | Independent definitions, bore/shaft engagement, hub seating, outer diameter, width and offset | Tire tread cosmetic LOD permitted; hub and clearance remain protected. Separate front free-running rivet axle and rear motor-shaft mounting. No unsupported wheel diameter. |
| **Raspberry Pi boards** | Official applicable board revision drawing/STEP; PCB outline/thickness, holes, header and relevant ports | Functional geometry and connector clearance, optional component detail/silkscreen. Pi4, Pi5 and Zero2W are not one board with swapped textures. User-supplied header/cooler status is explicit. |
| **Robot HAT** | Revision identification first; official PCB/CAD/engineering sources or exact KiCad source when available | Board outline, holes, header mating height, battery/motor/sensor/servo connector frames and speaker/port envelopes; electrical labels traced separately. Latest HAT docs cannot identify the owner's revision. |
| **Camera module** | Exact SunFounder/OEM module revision, PCB holes/outline, lens envelope and latch/contact orientation | Camera-board/housing connection and ribbon path verified; sensor family/megapixel description does not establish an official Pi camera board identity. Resolve R18 dimensional conflict. |
| **Ultrasonic module** | Exact board identity, mounting pattern, transducer/connector envelopes and applicable pin/voltage source | Critical front envelope and keyed connector; HC-SR04 family reference alone is insufficient. Resolve the documented electrical discrepancy before any safety verdict. |
| **Grayscale board** | Exact revision outline, holes, sensor face/orientation, connector and component envelope | Functional geometry enough; sensor clearance and viewing direction matter. Do not infer dimensions from three visible sensor patches. |
| **Battery** | Identified pack, case/soft-envelope bounds, connector, lead exit and mounting-contact surfaces | Rigid or bounded flexible envelope, not a falsely exact ideal cuboid. No claim about cell chemistry/rating or charging behavior absent matching evidence. |
| **Cables** | Exact connector identities/end maps; geometric cross-section/length/bend data when available; anchor/guide frames | Metric curve only if admissible. Otherwise a clearly schematic routing line plus exact known endpoints. Cable appearance is not proof of slack, bend radius or internal engagement. |
| **Connectors** | OEM drawings or exact identified board CAD, key/latch/pin orientation and seating depth | Detailed mating envelope/latch required when it teaches orientation; hidden pin detail optional. Never use wire color alone as definitive net mapping. |
| **Hook-and-loop / tape / wrap** | Material class and placement from V40; cut-piece allocation and thickness/extent if evidenced | Optional low-detail surfaces. Unknown thickness must not participate in a certified offset or clearance calculation. Schematic adhesive placement is labeled. |
| **Cosmetic/support items** | Photographic/reference appearance and known ownership/disposition | No collision-critical function assumed. USB cable, tools, optional wrap and unused accessories remain accounted for even when absent from the final assembled scene. |

## 5. Error budgets and tolerances

These numbers are **project numerical acceptance budgets**, not measurements or manufacturing tolerances of PiCar parts.

| Check | Default maximum numerical error |
|---|---|
| Named analytic interface location versus intended CAD construction | 0.001 mm |
| Fixed-mate translational residual | 0.001 mm |
| Fixed-mate angular residual | 0.00001 rad |
| Critical runtime mesh surface deviation from admitted CAD | 0.02 mm |
| Noncritical runtime surface deviation | 0.10 mm |
| Additional optimization/quantization displacement | 0.01 mm, within the total surface budget, not added on top of it |
| Runtime transformed interface versus canonical transformed interface | 0.01 mm and 0.0001 rad |

A stricter feature-specific budget wins. A nominal-fit check evaluates nominal surfaces with these numerical errors accounted for. A physical-fit check additionally needs source manufacturing tolerances/measurement uncertainty and a defined clearance criterion. With interval bounds, require worst-case clearance to remain valid after uncertainty and numerical budgets are subtracted. Unknown bounds yield BLOCKED, not a zero uncertainty assumption.

No default “all dimensions ±0.1 mm” is permitted. No mesh decimation may erode a bore/slot/mating surface past its authorized error. A smaller mesh is not an excuse to change interface coordinates.

## 6. Constrained master assembly

Fix the Plate A datum frame to ground. Align other components through named interface frames, ordered contact stacks, explicit normals, offsets and DOF. A screw axis coincides with target bores; a bearing face contacts its stack; a standoff establishes the next mounting plane; a wheel seats on its actual shaft/bearing interface. Specify axis polarity and roll constraints explicitly rather than relying on solver defaults or arbitrary starting transforms.

The solver must report underconstraint, overconstraint, residuals and alternative/mirrored solutions. Successful convergence alone is not acceptance. Test input ordering and initial-guess perturbations against the same admissible solution. Intentional DOF is declared (wheel rotation, steering pivots, pan/tilt output); undeclared drift or an unresolved datum blocks solution release.

There are three nominal variant assemblies. Shared components may share validated definitions, but mounting stacks, camera connectors, board envelopes and constraints are compiled per variant. Generate static before/after poses for each printed step plus any needed subassembly configuration. Intermediate tray/exploded positions are presentation artifacts and have no mechanical authority.

Collision tests distinguish intended contact, permitted overlap representations (nominal threaded engagements, press/snap fits only when specified), forbidden penetration and unresolved clearance. A CAD Boolean intersection cannot by itself decide whether a press fit is acceptable. Use an explicit contact/fit policy tied to the part evidence. Steering linkage loop closure and free motion at S21/S25 must be tested rather than frozen by adding arbitrary constraints.

## 7. G-GEOMETRY: exact instructional admission gate

A real PiCar step may depend on a 3D asset or pose only when an admission report for **that step, variant and mechanical dependency closure** passes every applicable item below:

1. Every target, mating/context instance and interface resolves to canonical IDs; the exact component identity is established for the V40 design, not merely a generic family.
2. All nominal dimensions/features needed to place, orient, mate or avoid collision are VERIFIED or reproducibly DERIVED from admissible applicable **engineering** evidence whose stated use limitations permit that claim. A verified transcription of approximate/reference-only values does not satisfy this requirement. No PROBABLE/UNRESOLVED input enters those calculations. Every derived result preserves its input uncertainty and assumptions.
3. CAD solid validity, feature checks, intended DOF, constraint residuals, assembly orientation and nominal-clearance checks pass. No arbitrary runtime final coordinate substitutes for a constraint.
4. Any geometry that would falsely depict an unresolved mechanically meaningful feature is omitted from the instructional asset or causes the step to remain reference-only. Cosmetic omissions are listed and cannot conceal a required check.
5. Runtime export/round-trip, ID mapping, unit/basis conversion and mesh-deviation tests pass for the exact content hashes. No provisional asset is reachable from the admitted manifest dependency closure.
6. The report binds source, schema, graph, CAD, solver, mesh and toolchain hashes and declares the scope **nominal instruction geometry**. Its assumptions and excluded physical claims are shown in the inspector.
7. Source conflicts affecting the step are resolved. Physical fit, torque, hidden engagement and as-built match remain separate checks; unknown manufacturing bounds cannot be reported as passed physical-fit verification.

This gate is enforced by the asset/graph compiler and runtime manifest loader, not just a label in documentation. Engine/renderer implementation and tests may run earlier on explicitly named **synthetic fixtures**, which are never shipped or presented as PiCar parts. Reference-only steps do not need geometric admission. Partial real geometry cannot bypass the gate by being called “context”: any context used to locate a part belongs to the dependency closure.

## 8. Certification scopes and incomplete evidence

`G-NOMINAL` validates the entire selected-variant nominal assembly against its admitted engineering evidence, all 29 transitions, interfaces, stock use and explicitly declared fit checks. `G-PHYSICAL` additionally compares claimed physical properties against adequate actual evidence. A box illustration and printed manual cannot satisfy that physical match.

The minimum currently blocking geometry set is not only Plate A: all mechanically used A–H profiles/bends/interfaces, wheel/shaft/pivot interfaces, servo tabs/splines/horns, rivet grip/locking dimensions, PCB/connector mounting frames, and applicable fastening stacks. Unknown cosmetic lettering need not block nominal assembly. Unknown battery/tape/cable envelopes block only certificates or transitions that depend on those envelopes, but they cannot be drawn as exact clearance-checked shapes.

Implementation proceeds by producing parameter declarations, evidence records, symbolic connection graphs, tests with known synthetic dimensions and a useful source-panel interface. Unresolved production parameters have no default numerical value. A CAD generator invoked for a blocked definition returns a structured blocker report, not a guessed solid. Public/OEM acquisition may close gates later; inability to acquire evidence preserves the block indefinitely without preventing other milestones.

## 9. AI authoring guardrails

Agents may parse documents, reconcile BOMs, transcribe diagrams, propose feature names, generate CAD scripts from explicit dimensions, build tests, automate exports, and investigate discrepancies. Every extracted claim includes a source locator and a reviewable distinction between transcription and inference. An agent may propose a candidate CAD source; it may not self-certify identity solely from render similarity.

Forbidden shortcuts: inventing exact dimensions from perspective; assigning generic servo/motor STEP as verified; inferring rivet dimensions from code; importing an older PiCar generation as the V40 chassis; averaging conflicting camera dimensions; filling unknown thickness with a common material thickness; assigning fastener pitch/head standards from nominal diameter; using a neural image comparison as a measurement certificate.

Promotion requires machine checks plus a review record naming the supporting evidence and feature scope. Frontier-model agreement is not independent physical evidence. Synthetic fixtures use `TEST-*` IDs and fail all production-manifest allowlists.

## Audited gate implementation requirements

Apply [GATE_CONTRACTS.md](GATE_CONTRACTS.md) for exact G-CAD/G-GEOMETRY inputs, pass conditions, outputs and invalidation. The original numerical budgets remain unchanged. Gate scope includes contextual dependencies, every instructional LOD and each claimed motion path. A passing final pose does not admit an unbounded installation sweep. Approximate official sources and generic similar parts remain ineligible for exact mechanical claims.


---

## Source document: ASSET_PIPELINE_SPEC.md

# Asset pipeline and glTF/GLB contract

## 1. Outputs and authority

**D-ASSET-01:** produce immutable **per-definition GLBs** and a separate canonical-to-runtime manifest. The manifest instantiates each physical part independently. Sharing a screw mesh is allowed; merging all screws into an unaddressable mesh is not.

Three outputs have different roles:

* **Engineering outputs:** STEP/BRep, feature tables, constraint/DOF reports, nominal assembly solutions and motion/clearance reports. These are generated from canonical evidence/CAD and are the auditable mechanical outputs.
* **Runtime outputs:** per-definition GLB, textures, optional schematic cable data, compiled step/variant manifest and admission report. They are optimized views of the engineering data.
* **Review output:** a generated `assembly-<variant>.glb` with all physical instance roots and nominal final poses for independent visual inspection. It is not the sole runtime database and is not reimported as truth.

The runtime loader trusts no GLB confidence flag. It verifies the manifest/admission report and requires metadata equality. A field in `extras` is a cross-check, not an authority override.

## 2. Reproducible build stages

| Stage | Input -> output | Mandatory invariant |
|---|---|---|
| Evidence lock | Original files/source revisions -> source manifest | Hash available bytes; retain exact original/revision and applicability; no floating `latest` geometry input |
| Canonical validation | JSON records -> validated inventory/graph/feature registry | Schema and semantic checks pass or emit explicit blockers |
| CAD generation | Locked CadQuery scripts/vendor STEP -> solids + named analytic interfaces | Missing required parameters fail; source solids never edited in place |
| Assembly solve | Variant constraints + solids -> world poses + DOF/residual reports | Final poses arise from constraints; unintended ambiguity fails |
| Tessellation | G-CAD-admitted solids -> mesh packets in CAD local frames | Fixed absolute/angular tessellation settings; protected critical features; source-to-mesh deviation checked |
| Presentation overlay | Immutable mesh packets + appearance records -> render-ready packets | May add colors, UVs and textures; may not change mechanical positions/topology without revalidation |
| Basis conversion | CAD mm local geometry/poses -> runtime metres | One explicit R conversion from data model; no second Blender auto-conversion |
| GLB assembly | Converted packets + manifest metadata -> per-definition GLB | Node/owner IDs, transforms, bounds and permitted material contract validated |
| Optimization | Raw GLB -> optimized GLB | Exact same instance semantics and critical feature bounds; decode-and-compare required |
| Publication | Validated hash set -> `public/twin/<packHash>/` + active pointer | Atomic staged directory; no mixed old/new manifest; packaging allowlist only |

The primary exporter is a scripted Node/TypeScript builder using glTF-Transform over explicitly exported mesh packets. This avoids dependence on Blender's scene hierarchy or implicit CAD-export naming. CadQuery's built-in glTF export is useful for engineering diagnostics, not a substitute for this metadata contract.

## 3. STEP, vendor CAD and Blender roles

Record exact vendor file hash, part number/revision, coordinate system, units and permitted redistribution before import. A vendor STEP may contain many solids; classify every solid as physical subelement or cosmetic construction artifact. Do not accidentally count a vendor assembly's repeated hardware twice when the same hardware is also in the kit BOM.

Use headless CadQuery scripts and locked dependencies for reconstruction. FreeCAD is used for independent opening, checking and cross-sectional review where valuable. Do not require a hand-edited FreeCAD document that cannot regenerate from source records.

Blender is an optional presentation branch: import a copy of admitted mesh packets, use deterministic script-driven material/UV operations, and export only presentation data or textures keyed by stable material/feature IDs. Mechanical POSITION/index buffers remain those of the approved exporter. Topology-altering modifiers, applied scale, smoothing that moves vertices, remeshing, manual assembly transforms and hand-authored assembly animation are excluded. If a cosmetic topology change is proposed, regenerate/revalidate the affected mesh in the canonical build; Blender approval alone is insufficient.

## 4. GLB structure and stable mapping

Each definition asset has one root node:

```json
{
  "name": "PX-V40-DEF-STANDOFF-M3X26",
  "extras": {
    "picarTwin": {
      "contractVersion": 2,
      "kind": "partDefinition",
      "partDefinitionId": "PX-V40-DEF-STANDOFF-M3X26",
      "definitionRevision": 1,
      "geometryHash": "<sha256>",
      "sourceManifestHash": "<sha256>"
    }
  }
}
```

The placeholder hashes above are documentation only; release validators reject placeholders. Definition root TRS is identity. Vertices are in the definition's converted canonical datum frame, in metres. Child nodes are either named mechanical subelements, geometry primitives, or cosmetic nodes with an explicit owner definition/element ID. No anonymous unclassified node is allowed. The same mesh may be referenced by more than one node when ownership remains explicit.

The runtime manifest has an `instances` table containing every active or accounted-for physical ID, its definition identity, ownership and initial lifecycle/disposition. Definition assets, compiled graphs and stable solution-index entries supply the hash-bound geometry, operations, connections and poses. The application creates a separate Object3D root named with **each instance ID**. Thus three servo instances never share a mutable root even if they share immutable mesh buffers.

Picking an internal node resolves through `instanceRootId + localElementId`, never `name` alone or Three's generated UUID. All geometry nodes resolve to canonical definition/element IDs; all runtime physical roots resolve to instance IDs. Noninstalled tools/spares/unused-variant items can have no mesh and still remain in the inventory manifest with a reference-only representation.

The generated full-assembly review GLB has one root per instance with `extras.picarTwin.partInstanceId`, definition ID and model/graph hash, then child definition geometry. It preserves the same flat physical identity map while sharing mesh accessors. This review format is a derived deliverable, not a second authoring source.

## 5. Hierarchy and transforms

The glTF specification permits duplicate display names and requires a tree hierarchy [W05]; this contract adds unique stable names within the relevant asset scope. A CAD attachment loop does not become a glTF parent cycle. Runtime physical roots stay under a stable assembly container; articulated/internal elements use declared rig relationships. Presentation group transforms are computed overlays over instance sets, with no accumulation into final poses.

Root scale is [1,1,1]. No negative scale, mirrored transform, shear, arbitrary recentering or hidden centimetre/millimetre factor is permitted. Node rotations are normalized XYZW quaternions. The manifest contains final solution poses; the loader checks asset pivots and transform convention before first render. Unit/basis test fixtures include an asymmetric three-axis marker, a 100 mm segment and a left/right keyed mating pair.

The runtime does not use glTF animation clips for assembly truth. Optional cosmetic clips may be present only on declared nonmechanical nodes and cannot change a mechanical node's pose, visibility or confidence. The baseline mechanical asset profile contains no assembly clips or skins. Flexible cable display uses the separate routing representation, not a skinned cable that conceals unknown length.

## 6. Materials, textures, ghosting and LOD

Use metallic-roughness PBR materials, with subdued engineering lighting. Materials have stable semantic names (plate finish, PCB, plastic, tire, conductor, schematic). Unknown material identity is presented as appearance, not a material-property claim. Normal maps may add cosmetic surface appearance but cannot represent a missing critical bore or contact face.

Baseline textures are local PNG/JPEG; use shared small atlases where beneficial, with 2048 px as the default maximum and an explicit exception for readable source labels. Never rasterize full instruction photos onto a mechanical surface to simulate exact geometry. Preserve sRGB color versus linear data-map interpretation. KTX2 is deferred until measured texture pressure justifies it and an offline decoder path is tested; it is not required for correctness.

LOD0 is used for the current operation/inspector; LOD1 for assembled context; LOD2 for distant overview. All LODs preserve the same canonical feature frames and ID mapping. Critical geometry stays within the error budget at every LOD that can teach a connection. In the closest inspector, showing LOD0 is mandatory. Threads remain nominal surfaces with analytical metadata unless a specific interaction demonstrably requires modeled threads.

Ghost and dim materials are runtime overrides, not mutations of shared source materials. Future ghosts use low opacity, disable depth writing and use a stable render order; current parts remain solid. If transparency sorting obscures understanding, switch that context to an edge/silhouette mode rather than claiming perfect transparent rendering. Selection uses a local silhouette/edge overlay with text; it does not require a full-scene postprocessing chain.

## 7. Compression decision

Start with an uncompressed validated GLB baseline. The approved release compression is **Meshopt** with a locally bundled decoder when its byte savings are worthwhile and decoded geometry passes the same deviation/ID tests. Use an explicit compression/quantization configuration rather than an opaque “optimize all” command. glTF-Transform's convenience meshopt transform also invokes quantization/reordering [W07], so applying it without auditing those changes is prohibited.

Draco is not the selected pipeline: supporting two geometry codecs adds test/decoder surface without a demonstrated requirement. No mesh joining across part instances or canonical ownership boundaries. No simplification/quantization that changes a required bore or final datum. Shared geometry, sensible tessellation and lazy loading come before lossy optimization. Three's GLTFLoader supports the decoder integration paths used here [W08]; actual supported extension versions are frozen in the runtime compatibility manifest.

## 8. Manifest and compatibility

Minimum manifest fields: `contractVersion:2`, `schemaVersion`, `packHash`, `graphSetHash`, `modelHash`, `evidenceHash`, `toolchainHash`, `variantIds`, `compiledGraphs`, `definitionAssets`, `instances`, `interfaceFrames`, `solutions`, `registry`, `admissionReports`, `routingRepresentations`, `referenceLinks`, `licenses`, and `byteBudgets`. CompiledGraph and AssemblySolution artifacts are hash-bound and structurally typed; HASH_AND_PACK_CONTRACT.md fixes all reference and equality rules.

Every asset record has relative path, SHA-256, byte count, media type, definition/element ownership, bounding box, triangle counts by LOD, required decoder/extensions and allowed capability scope. Refuse absolute paths, `..`, external URIs or undeclared resources. The root manifest is trusted from the application bundle or an explicit imported-pack adoption transaction. Compute packHash over the JCS root manifest excluding only its top-level packHash, as specified by HASH_AND_PACK_CONTRACT.md. modelHash never names a mutable presentation directory.

Runtime errors distinguish: missing file; hash mismatch; schema mismatch; unsupported extension; invalid node mapping; failed decode; WebGL failure; and evidence-blocked geometry. An evidence block is not a broken loader; it has its own reference-only UI. Loading retries evict the failed promise/cache entry. Version mismatch cannot be resolved by accepting an arbitrary nearby asset version.

## 9. Validation and reproducibility

Run Khronos glTF Validator plus project checks for every output. Decode the optimized output and compare critical vertex/surface error, bounds, node ownership, pivots, material attribution and instance reconstruction. Verify no required node was pruned merely because it was hidden in an initial state. Use the generated review assembly to independently inspect hole alignments, left/right orientation, wheel hubs and cable endpoints.

Determinism means: identical canonical sources and locked build environment produce identical normalized runtime JSON and GLB bytes; CAD semantic feature tables/solutions must match within the fixed numerical budgets. STEP/BRep serializers can carry tool/version/timestamp differences, so raw STEP byte equality alone is not the definition of mechanical equivalence. Record raw artifact hashes and semantic signatures separately. Two clean builds in the canonical environment must match the runtime release hashes; cross-platform CAD checks compare the declared semantic invariants and report kernel differences rather than silently blessing them.

No runtime output is published before its complete dependency closure and report are staged. Retain the last valid manifest directory for rollback. The existing content pipeline must not delete or rewrite twin outputs; the twin publisher must not rewrite reference content.

## 10. Imported pack trust boundary

A self-consistent hash is integrity evidence, not mechanical authority. An imported pack does not acquire instructional capability merely by setting a permitted schema enum or including a report labeled PASS. Recognize a hash-bound release/admission chain already trusted by the app, or require the owner to run the specified local source/CAD/export validation workflow and explicitly adopt its resulting report. Unrecognized external packs remain provisional review only. There is no automatic imported-pack trust based on a filename, GLB extras or an author-written confidence flag. This is a small local trust registry, not an enterprise signing service.

## Audited final-byte and publication requirements

[HASH_AND_PACK_CONTRACT.md](HASH_AND_PACK_CONTRACT.md) is the precise v2 graph/solution/LOD/decoder and immutable-pointer contract. [GATE_CONTRACTS.md](GATE_CONTRACTS.md) requires independent analytic witnesses, bidirectional bounded surface deviation and per-motion capability. Metadata self-comparison or vertex-only distance is not sufficient. G-CAD uses meshHash=notApplicable; G-GEOMETRY requires all final mesh bindings available.

RuntimeRegistry supplies the hash-bound typed record closure; each CompiledGraph owns its own resolved step list. graphSetHash is the pack-level aggregate, while each selected variant retains its own graphHash. See HASH_AND_PACK_CONTRACT.md for the exact non-circular preimages and world-pose convention.


---

## Source document: VERIFICATION_AND_TEST_PLAN.md

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


---

## Source document: MILESTONES.md

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


---

## Source document: MILESTONE_REVIEW.md

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


---

## Source document: REPOSITORY_CHANGE_MAP.md

# Repository change map

## 1. Integration boundary

This is a migration of `picarx-companion/`, not a replacement application. Paths marked **existing** were inspected at the baseline commit recorded in README. Paths marked **new** are required target paths, not claims that files already exist. Preserve all current routes, setup-stage IDs, generated page IDs, video slugs, and the Tauri application identifier. The source register supplies exact baseline locators.

## 2. Existing files: precise disposition

| Existing path under `picarx-companion/` | Disposition / required change | Regression boundary |
|---|---|---|
| `src/App.tsx` | Extend navigation with Assembly; lazy-load the assembly feature behind a Suspense/error boundary; wrap startup in persistence initialization; replace unqualified hardware chip with source-scoped project identity | Four current navigation sections and external-link behavior remain functional; browser opener fallback is explicit and catches failures |
| `src/main.tsx` | Keep React StrictMode and current global styles; add assembly stylesheet import or lazy feature CSS; initialize platform adapter without module-import writes | No duplicate event commits under StrictMode; no blocking CAD/GLB load on Home |
| `src/lib/router.ts` | Extend the existing discriminated union and parser; add safe decoding and tested URL builders, no router-library replacement | Existing nested reference paths and `?s=` anchors stay unchanged |
| `src/lib/progress-store.ts` | Migrate implementation behind its public setup-progress facade; one-time validated `picarx.v1` import; delegate durable writes through the persistence port | Preserve old keys/data, expose initialization/save failures, never infer 29-step completion from `steps.assembly` |
| `src/lib/content-types.ts` | Extend only the documentation/wizard integration contract: optional assembly launcher reference and source/missing-media metadata where needed | Do not put mechanical constraints, meshes or assembly state into `Block` or `WizardStep` |
| `src/pages/Home.tsx` | Keep eight-stage setup summary; add independent assembly-session/coverage card | Historical setup completion and resume links still work |
| `src/pages/WizardStep.tsx` | Wrap only the `assembly` stage with launcher, coverage, and returned completion summary; retain PDF, text and video options | Remaining seven stages retain behavior; assembly manual completion remains explicitly self-reported |
| `src/pages/Reference.tsx` | Keep rendering and document pager; add contextual assembly/part cross-links outside generated article truth | Existing page/section routes remain stable |
| `src/pages/Videos.tsx` | Keep registry/lesson links; make remote media/network requirements clear; add safe missing-media states | Do not claim remote YouTube thumbnails or streams work offline |
| `src/components/SearchBox.tsx` | Extract existing document search into a tested adapter; federate typed `document`, `part`, `assemblyStep` results with destination builders | Existing document heading priority and section navigation stay available |
| `src/components/PdfViewer.tsx` | Add revision/source label, optional requested panel/page, retry that clears rejected cache promise, accessible source-text alternative | Existing booklet page bookmark migrates; no claim generic PDF filename proves V40 |
| `src/components/DocImage.tsx` | Add missing/excluded-media placeholder, descriptive source/alt handling, keyboard lightbox/dismissal | Excluded sensitive assets are not restored to satisfy a broken-image check |
| `src/components/RstRenderer.tsx`, `Checklist.tsx`, `CodeBlock.tsx`, `VideoEmbed.tsx` | Preserve and reuse; narrow accessibility/offline/error changes only where integration requires them | No wholesale renderer replacement or HTML execution expansion |
| `src/content/index.ts` | Preserve existing synchronous documentation interface initially; keep twin assets/data out of eager page imports | Do not eagerly import a whole robot or evidence image corpus into the main JavaScript bundle |
| `src/content/wizard.json` | Generated output only: regenerate from overlay after adding launcher metadata | Never hand-edit it as canonical assembly truth |
| `src/content/pages/**`, `nav.json`, `search-index.json`, `videos.json` | Preserve generated content; add separately generated assembly indexes and overlay links | Stable IDs/slugs, current companion corrections and `custom/hermes` survive |
| `tools/content-pipeline/overlay.ts` | Canonical setup-wizard integration changes belong here; preserve video correction and image-path corrections | Avoid regenerating old source mistakes or losing Hermes navigation |
| `tools/content-pipeline/build.ts` | Remove V33 fallback; read explicit V40 source lock; validate hashes/revisions; publish staged output atomically; run privacy-aware publication checks | `public/content` regeneration MUST NOT touch `public/twin`; failure must leave prior valid content usable |
| `tools/content-pipeline/rst-parser.ts`, `transform.ts` | Preserve parser whitelist and transformation behavior; add only tests/required safe missing-media handling | No generic execution of embedded upstream HTML or code |
| `custom-docs/hermes.rst` | Preserve unchanged unless a specific broken integration is demonstrated | It remains companion-authored, not official SunFounder evidence |
| `public/content/**` | Continue generated documentation/media only | Existing `.gitignore` exclusions also become explicit publication-deny tests; not a twin output directory |
| `src/styles/tokens.css`, `base.css`, `components.css` | Reuse current visual language; add only shared semantic tokens/layout support | Light/dark mode, focus visibility and readable documentation remain intact |
| `src-tauri/src/lib.rs` | Replace unused template `greet` handler with narrowly scoped persistence, artifact and export/import commands; retain opener | No shell execution, raw SQL or broad filesystem command added |
| `src-tauri/src/main.rs`, `build.rs` | Keep existing entrypoint/build plumbing; changes only for test-only plugin gating or bundle resources | Shipping binary cannot contain the native test bridge |
| `src-tauri/Cargo.toml`, `Cargo.lock` | Add pinned compatible `rusqlite` bundled SQLite, hashing and validation dependencies; lock transitive graph | Preserve Rust 2021 compatibility unless a separately documented dependency requirement forces a bounded update |
| `src-tauri/tauri.conf.json` | Preserve identifier/window defaults; add narrowly tested CSP and resource paths; camera permission only in M13 | Never change app identifier during migration; no camera prompt in M0–M12 |
| `src-tauri/capabilities/default.json` | Retain necessary core/opener access; explicit command permissions scoped to main window | No blanket filesystem/shell grant; tests assert denied capabilities |
| `package.json`, `pnpm-lock.yaml` | Preserve existing scripts; add specified validation/testing/twin scripts and compatible locked 3D packages | Existing `pnpm dev`, `build`, `preview`, `tauri`, `content:build` keep their meanings |
| `tsconfig.json`, `tsconfig.node.json`, `vite.config.ts` | Keep strict frontend configuration and port 1420; add separate tool/test configs; split lazy feature chunks | Do not relax strictness to admit generated schema/type errors; test tools are not currently covered merely by `include: [src]` |

Root `README.md`, `.gitignore`, and `LICENSE-SunFounder` remain. Extend README with model/evidence status and authoring commands; extend ignore rules for private evidence, source vaults and generated caches; never weaken existing sensitive-media exclusions. Do not reinterpret the lack of a companion-code license as permission to redistribute arbitrary third-party CAD.

## 3. Concrete target tree

```text
PiCar/
  README.md
  .gitignore
  LICENSE-SunFounder
  docs/digital-twin/                  # This specification, change history, ADRs
  digital-twin/
    package.json                     # Node authoring CLI/scripts, not app runtime
    pnpm-lock.yaml                   # Authoring tool lock; separate from app lock
    pyproject.toml
    uv.lock                          # Python/CadQuery/OCP lock
    toolchain.lock.json              # Exact Python/Node/OCCT/exporter versions
    schemas/                         # Canonical JSON Schema + generated-type recipes
    evidence/
      records/                       # Scoped evidence and claim JSON records
      sources.lock.json              # Revision/URL/hash/applicability/rights manifest
      conflicts/                     # Explicit competing claims and resolutions
      private/                       # Ignored owner originals, never auto-bundled
      cache/                         # Ignored immutable fetched bytes by SHA-256
    components/
      definitions/                   # PartDefinition and owned element definitions
      instances/                     # Planned kit stock; not owner stock guesses
      measurements/                  # Nominal values, uncertainty, derivations
      interfaces/                    # Stable feature frames and connector points
      inventory/                     # Printed BOM and variant dispositions
    assemblies/v40/
      manifest.json                  # Revision and graph entry point
      steps/                         # 29 source-numbered step records
      operations/                    # Ordered canonical state operations
      connections/                   # Mechanical and cable graph edges
      variants/                      # Pi4/Pi5/Zero2W patches
      presentation/                  # Motion/camera/explode policies, never final CAD truth
    cad/
      twin_cad/                      # Python package and CLI
        components/                  # Parametric reconstruction scripts
        vendor/                      # Datum/interface wrappers, not modified vendor originals
        assemblies/                  # Constrained master and intermediate solves
        verification/                # Analytic/solid/DOF/collision checks
      source-vault/                  # Ignored licensed OEM source bytes by hash
      exports/                       # Ignored generated STEP/mesh packets/reports
    presentation/
      materials/                     # Reproducible PBR material descriptions
      blender/                       # Optional headless UV/texture-only scripts
      textures/                      # Cleared, source-tracked texture inputs
    tools/
      cli.ts                         # validate/compile/assets/publish/check commands
      evidence/                      # Fetch/hash/locator/applicability tooling
      compiler/                      # Variant graph, dependency closure, admission compiler
      export/                        # glTF-Transform builder and identity checks
      publication/                   # Runtime/rights/privacy allowlisted staging
    validation/
      fixtures/                      # TEST-* synthetic mechanical data; never production
      tests/                         # Schema, BOM, graph and asset tests
      expected/                      # Reviewed deterministic reports/snapshots
    generated/                       # Ignored compiled graphs, solutions, indexes, GLBs
  picarx-companion/
    src/
      domain/assembly/               # Pure reducer, operations, replay, invariants
      domain/components/             # Read-only canonical manifest access and selectors
      generated/twin/                # Generated schema types only, not hand-authored truth
      platform/                      # Persistence/asset/camera ports and platform selection
      platform/browser/              # IndexedDB and browser preview adapter
      platform/tauri/                # Typed native invokes, no domain logic duplication
      features/assembly-3d/
        scene/                       # Canvas, instance registry, materials, selection
        assets/                      # Verified loader/cache/lifecycle management
        motion/                      # Pure evaluators + frame-loop presentation driver
        camera/                      # Controls and focus arbitration
        ui/                          # Step, trays, inspector, warnings, coverage
        state/                       # Ephemeral presentation store; not persistent truth
      features/assembly-session/     # Session commands, save status, variant fork/migration
      features/observation/          # M13 only: local camera/observability adapters
      pages/Assembly.tsx             # Route entry/loader/error boundary
      styles/assembly.css            # Existing design tokens, scoped feature layouts
      content/                      # Existing documentation outputs preserved
      lib/                          # Existing router/progress/content facades preserved
    public/twin/<packHash>/          # Published runtime pack outside content generator ownership
      manifest.json
      graphs/<variant>.json
      assets/<assetHash>.glb
      indexes/
      decoders/                      # Only when admitted compression requires them
    src-tauri/src/
      persistence/                   # SQLite connection, migrations, transactions
      commands/                      # Narrow typed application commands
      artifacts/                     # Hash/manifest/path integrity, export/import
      observation/                   # M13 storage/permissions only; no frame retention default
    tests/                           # Unit/domain/browser/native/visual test suites
    tools/                           # Existing content pipeline + new app-side test launchers
```

Use ordinary Git for small cleared source JSON/scripts and explicitly selected runtime packs. Do not add Git LFS initially: large vendor evidence lives in a hash-locked cache and published packs are reproducible artifacts. If any proposed checked-in file exceeds 50 MiB, stop at a named asset-distribution gate; keep that binary out of the default commit until its storage/rights plan is documented. This is a repository policy, not a claim about GitHub's limits. Release packages must include all required runtime bytes; a network download must not be necessary for the basic assembly/reference journey.

## 4. Migration sequence and rollback

M0 protects baseline routes and data and establishes source/publication tests. M1–M2 author canonical data without touching live progress. M3 introduces the storage adapter and reference-first Assembly route behind a feature flag while preserving the legacy store backup. M4–M8 add the independent mechanical pipeline; no content-generated directory becomes its source. M9–M11 progressively enable only admitted 3D capabilities. M12 removes development-only feature toggles after acceptance, but the reference-only fallback remains permanent.

Database migrations are forward-only with an exported recovery snapshot, not destructive schema rollback. Before replacing a pack or migrating its graph, retain the pinned prior pack and session export; a failed migration leaves the prior session readable. Disabling the Assembly navigation must not make old setup progress or reference content inaccessible. Rollback of presentation code never rewrites evidence or invalidates a user's confirmations merely because a material changed.

## 5. Parallel ownership

After M1 freezes schemas and M2 freezes graph semantics, give CAD agents exclusive ownership of `digital-twin/cad` plus narrowly assigned definition/interface records; give the frontend agent `features/assembly-3d` and presentation adapters; give the persistence agent `platform`, `assembly-session` and native persistence. A single integration owner controls schemas, `App.tsx`, `router.ts`, package locks and published manifests. Independent agents may propose schema changes but may not land divergent versions. Merge validated source records before regenerating shared artifacts.

## Audited ownership additions

M0 owns the source-lock, denied-media registry, multi-root coordinator, safe public mirror and dev/build wrapper integration (including the bounded Vite publicDir change). Keep source and local excluded originals unchanged; generated mirrors are never canonical source. M1 owns v2 schemas, typed registries and hash preimages. M2 owns parentAssignments, complete graph/state/variant records. M3 owns command_results, migrations and adapter parity. M8 owns CompiledGraph/AssemblySolution publication, LOD/decoder inventories and packHash pointers. The integration owner alone merges changes to these shared contracts, locks, migrations and publication manifests. See MILESTONE_REVIEW.md for phase-level ownership and rollback.


---

## Source document: OPEN_QUESTIONS_AND_BLOCKERS.md

# Open questions and blockers

This register fixes the unresolved questions, their consequences and their closure tests. An implementation agent may acquire and validate evidence through the listed paths; it may not answer an unknown by choosing a common dimension. No milestone depends on obtaining another owner photograph or measurement. Public/manufacturer evidence may resolve some items; if it does not, their verified-finalization gates remain blocked while other implementation continues.

**Confidence vocabulary:** source claims use VERIFIED, DERIVED, PROBABLE, UNRESOLVED. The OPEN/RESOLVED lifecycle below is issue status, not confidence. A resolved issue names evidence, reviewer, affected features and superseded reports. Research exhaustion is not a geometry value.

## Minimum blockers to full nominal/mechanical completion

The critical set is Q-03 plus the relevant interfaces in Q-04–Q-12: custom plates, motor/servo/horn interfaces, rivet and fastening stacks, wheels/pivots, PCB mounts/connectors and any required material/cable clearance envelope. Q-02 controls verified source publication. Q-01/Q-13 separately prevent actual physical-inventory and physical-match certificates. Q-15–Q-17 require implementation/build evidence; Q-18 is deferred and does not block the core app.

Unknown cosmetic markings alone do not block an otherwise supported mechanical scope. Conversely, a hidden bore, head seat or spacer thickness is not cosmetic merely because it is hard to see.

## Q-01 — Physical evidence scope versus nominal design

**Status:** OPEN · **Owner:** M1/M12 · **Class:** Physical certification blocker

**Missing / conflicted:** The photos show the box and printed documentation, not a measured loose-part inventory or an inspected assembled robot. No current source proves the actual unit matches every nominal feature.

**Impact:** All physical-match and actual-stock assertions; not reference/software functionality.

**Buildable now / prohibited shortcut:** Proceed with source-scoped printed claims and nominal candidates; prohibit PHYSICAL_MATCH_CHECKED or actual-stock PASS from these images alone.

**Exact resolution path:** Adequate direct physical evidence or traceable manufacturer unit/lot data for each claimed property. No new owner capture is required by M0–M12; absent evidence leaves this gate blocked.

## Q-02 — Bundled PDF bytes, revision and acquisition provenance

**Status:** OPEN · **Owner:** M0 · **Class:** Source gate

**Missing / conflicted:** The repository exposes a generic PDF filename with a known Git blob, but its binary content could not be read in this pass. The upstream source commit does not by itself establish the separate PDF bytes. Existing code can fall back to V33.

**Impact:** Verified booklet label, source regeneration, AC-02; photo-backed semantic planning remains possible.

**Buildable now / prohibited shortcut:** Keep photo source panels authoritative; fail closed when required V40 PDF is absent/mismatched. Do not assert PDF/photo equivalence.

**Exact resolution path:** Read actual checkout PDF bytes, hash SHA-256, inspect revision/parts/branch/29 panels against all photos, record actual source locator and revision. Remove fallback; test V33-only failure.

## Q-03 — Exact structural plates A–H

**Status:** OPEN · **Owner:** M6 · **Class:** Critical geometry blocker

**Missing / conflicted:** No complete applicable engineering package was established in this targeted pass. Missing potentially include each outline, thickness, bend angle/radius, hole/slot centers and diameters, plane offsets, pivot/support datums and E/F handed geometry.

**Impact:** Most real assembly poses and interface closure; G-CAD/G-GEOMETRY for dependent steps.

**Buildable now / prohibited shortcut:** Declare parameters, semantic feature names and plate identities; generate no exact solids from perspective tracing or default thickness. Fixture and reference lanes continue.

**Exact resolution path:** Applicable V40 STEP/DXF plus engineering bend/thickness data, manufacturer drawing, or fully constrained documented derivation from authoritative inputs. A flat drawing alone does not resolve bends. Record independent feature checks.

## Q-04 — Exact TT motor/gearbox identity and wheel shaft

**Status:** OPEN · **Owner:** M5 · **Class:** Geometry/identity blocker

**Missing / conflicted:** Printed label and rendered appearance do not establish OEM model, housing envelope, mount holes, shaft section, seating offset or wire exit geometry.

**Impact:** S05, S27 and related chassis/wheel clearance.

**Buildable now / prohibited shortcut:** Maintain kit-role definition unresolved; generic TT CAD may be a visibly provisional comparison only.

**Exact resolution path:** Manufacturer/kit identity mapping and applicable engineering drawing/STEP; compare all mount, shaft and envelope features, not only gearbox color.

## Q-05 — Servos, horns, spline and retaining screws

**Status:** OPEN · **Owner:** M5 · **Class:** Critical geometry/identity blocker

**Missing / conflicted:** Three printed servos are not proof of SG90/MG90S identity or equivalence. Mounts, shaft/spline geometry, neutral mechanical orientation, horn shape and smallest-package screw standard are unresolved.

**Impact:** S08/S13–S22 and servo-horn alignment/clearance/zeroing geometry.

**Buildable now / prohibited shortcut:** Keep pan/tilt/steering roles distinct until equivalence is supported; use per-servo zeroing attestations without claiming a measured exact angle.

**Exact resolution path:** Exact kit-to-OEM mapping plus tab/shaft/spline/horn drawings and accessory screw specification; evidence for zeroing procedure applicable to actual HAT.

## Q-06 — Fastener standards, standoff ends, washers and opaque rivet codes

**Status:** OPEN · **Owner:** M5 · **Class:** Critical geometry blocker

**Missing / conflicted:** Printed nominal designations do not fully specify head/drive standards, pitch/form, material, nut/hex external dimensions, standoff end sex/depth, washer bore/OD/thickness or rivet grip/locking shape.

**Impact:** All fastening stacks, tools, seating and clearance; physical-fit claim even when a nominal length is transcribed.

**Buildable now / prohibited shortcut:** Use exact printed names and source quantities; unresolved sizes in tool cards; no invented torque or rivet digit decoding. Separate Washer A and B.

**Exact resolution path:** Applicable manufacturer/standard mapping and dimensions for each required feature. Source nominal and manufacturing limits separately; standard is not selected from appearance alone.

## Q-07 — Robot HAT revision, ZERO control and connector map

**Status:** OPEN · **Owner:** M5 · **Class:** Geometry/procedure blocker

**Missing / conflicted:** Box/manual appearance and existing latest-family documentation do not establish the exact board revision, mounting thickness/holes, connector heights or whether a referenced ZERO procedure applies.

**Impact:** S04/S07/S17/S29, PCB support/cable clearance and physical servo preparation.

**Buildable now / prohibited shortcut:** Show printed source instruction with applicability note; never promote the old UI hardware chip to a verified board identity. No app-controlled actuation.

**Exact resolution path:** Revision-specific official board CAD/KiCad/drawing and matching supplied-board identity; applicable ZERO/power/port documentation. Board-size snippets or latest-family pages alone are insufficient.

## Q-08 — Camera, ultrasonic and grayscale identity/dimension conflicts

**Status:** OPEN · **Owner:** M5 · **Class:** Critical identity/electrical/geometry blocker

**Missing / conflicted:** Camera page contains approximate 25×23×9 and a 24×23.5×8 specification. Sensor family names do not establish exact boards. Repository ultrasonic text says 5 V while V40 final diagram labels 3V3. Grayscale dimensions are unestablished.

**Impact:** S09/S11/S12/S24/S28/S29 mounting, connector orientation and electrical applicability.

**Buildable now / prohibited shortcut:** Preserve both source claims and the exact printed diagram. Do not silently substitute a Raspberry Pi Camera Module or generic HC-SR04 CAD; do not synthesize a new voltage instruction from the conflict.

**Exact resolution path:** Revision-applicable official PCB/connector drawings and explicit V40 electrical pin/supply correspondence. Resolve conflicting dimensions through source scope, not averaging.

## Q-09 — Camera ribbons, loose cables, pin orientation and routing envelopes

**Status:** OPEN · **Owner:** M5/M7 · **Class:** Connection/route blocker

**Missing / conflicted:** FPC/FFC branch labels are visible, but exact conductor counts, pitches, lengths, connector identities, bend-radius limits and some pin-to-pin mappings are not established. Sensor supply labels are not a complete keyed wire mapping.

**Impact:** Metric cable visualization, bend/clearance checks and connector mating.

**Buildable now / prohibited shortcut:** Preserve endpoints and source routing order; use labeled schematic paths only where metric geometry is missing. A schematic is not an admitted physical route.

**Exact resolution path:** Applicable kit cable/connector documentation, known endpoint keying, length/bend data and routing anchors. Identity must match Pi variant and SunFounder module, not only board family.

## Q-10 — Pi board/revision and limits of official mechanical sources

**Status:** OPEN · **Owner:** M5 · **Class:** Bounded acquisition/applicability gate

**Missing / conflicted:** Official Pi4, Pi5 and Zero2W mechanical sources were located. Pi5 drawing explicitly calls its dimensions approximate/reference-only and not production data. Pi5 STEP is located but its bytes/feature limits were not inspected. Actual user-supplied board revision/header/cooler configuration is unspecified.

**Impact:** S01–S04 board interface/clearance; no automatic full Pi5 engineering admission from an official logo.

**Buildable now / prohibited shortcut:** Acquire source-limited reference models; allow nominal engineering scopes only where the source actually supports them. Board variant selection is explicit; additional cooler geometry is not assumed absent.

**Exact resolution path:** Pin applicable source bytes and limitations; inspect Pi5 STEP and related notices, validate named mechanical interfaces and component omissions, record board/revision/header/cooler configuration. Reference-only dimensions remain provisional for unsupported exact claims.

## Q-11 — Battery, adhesive/tape and nonrigid envelopes

**Status:** OPEN · **Owner:** M5 · **Class:** Scoped geometry/material blocker

**Missing / conflicted:** Exact battery model/dimensions, lead connector, tape/loop thickness and protective material consumption are not measured by the photos.

**Impact:** S06/S07 and any envelope/clearance/cable certificate relying on these values.

**Buildable now / prohibited shortcut:** Represent allocation and intended location semantically; omit exact envelopes or mark schematic; do not claim compression, adhesive performance or battery safety from CAD.

**Exact resolution path:** Applicable battery/connector specifications and prescribed material thickness/stock evidence; assess which dimensions actually enter the claimed mechanical scope.

## Q-12 — Front/rear wheel geometry and steering stack detail

**Status:** OPEN · **Owner:** M5/M7 · **Class:** Critical mechanical blocker

**Missing / conflicted:** Manual establishes wheel roles, E-right/F-left, Washer A at S19 and three Washer B per front wheel at S26. Exact hub/shaft dimensions, washer axial order against each bearing face and joint clearance are not a full dimensioned stack.

**Impact:** S19/S21/S25–S27, free steering/wheel movement and mechanical finalization.

**Buildable now / prohibited shortcut:** Keep prescribed counts and free joint semantics; bind intended stack faces only when source/geometry resolves them. No arbitrary closed-loop weld.

**Exact resolution path:** Applicable wheel/rivet/washer/carrier drawings and an unambiguous source-supported stack interpretation, followed by independent DOF and interference checks.

## Q-13 — Actual inventory, accessory-package stock and repeated cable illustrations

**Status:** OPEN · **Owner:** M1/M11 · **Class:** Inventory certification blocker

**Missing / conflicted:** Printed hardware stock can be counted, but actual owner quantities, servo-package accessory counts, repeated cable drawings as items versus views, tape stock and spare declarations are not all determined.

**Impact:** Actual inventory equality and no-orphan accounting across all supplied accessories.

**Buildable now / prohibited shortcut:** Track printed stock and planned consumed instances separately; unknown observed counts do not become zero or equal printed totals. Integral leads are not new loose inventory.

**Exact resolution path:** Applicable exact V40 BOM/package inventory or adequate existing direct inventory evidence. Resolve repeated illustrations and package multiplicity explicitly. No new owner photo is required to continue software work.

## Q-14 — Zero2W microphone/header and accessory handling

**Status:** OPEN · **Owner:** M2/M11 · **Class:** Scoped variant gate

**Missing / conflicted:** The Pi4/Pi5 panel depicts USB mini microphone insertion; the Zero2W panel does not establish an equivalent adapter installation. Actual header-ready state and accessory adapter are unspecified.

**Impact:** Variant accessory guidance and potential board/HAT mating precondition.

**Buildable now / prohibited shortcut:** Keep microphone as an accounted unused accessory in the Zero2W branch unless an applicable supported operation exists; add header-readiness preflight, not invented assembly step30.

**Exact resolution path:** Official applicable Zero2W adapter/header configuration and kit accessory evidence. Retain optional task outside the printed29 if later supported.

## Q-15 — Exact reproducible toolchain lock and binary distribution

**Status:** OPEN · **Owner:** M0/M4/M8 · **Class:** Technical implementation gate

**Missing / conflicted:** Patch versions/OCCT compatibility and rights-cleared pack sizes have not been established through builds here. Architecture and package families are selected; exact compatible lock is a measured gate.

**Impact:** Reproducibility, CI/native build and large-asset publication.

**Buildable now / prohibited shortcut:** Use chosen Python3.12/CadQuery2.x and React19/Fiber9 families with locks; synthetic compatibility spike; no unreviewed mass dependency upgrade.

**Exact resolution path:** Pass locked fixture/build matrix, record tool versions, normalize nondeterministic output and audit distribution rights. Files >50MiB require a recorded storage decision before check-in.

## Q-16 — Packaged Apple Silicon rendering, performance and native harness

**Status:** OPEN · **Owner:** M0/M9/M12 · **Class:** Measured validation gate

**Missing / conflicted:** No native app or GPU benchmarks were run in this planning pass. Official Tauri embedded WDIO path is documented but must be tested with the actual lock/target macOS.

**Impact:** AC-13 and release performance/native automation.

**Buildable now / prohibited shortcut:** Develop and test browser/Rust layers; report native results missing instead of claiming browser equivalence. Keep GPU fallback.

**Exact resolution path:** Record target machine; run packaged native interaction/context/memory/performance suite and test-only plugin exclusion. Resolve harness incompatibility explicitly.

## Q-17 — Private evidence, upstream sensitive media and asset redistribution

**Status:** OPEN · **Owner:** M0/M8/M12 · **Class:** Publication gate

**Missing / conflicted:** Gitignore hides known screenshots from Git but does not stop a local build from bundling them. Owner photos and candidate vendor CAD have source-specific rights/privacy; private source vault is not a publication directory.

**Impact:** Shipping package, evidence caches, source links and optional cloud processing.

**Buildable now / prohibited shortcut:** Allowlist clean runtime publication, deny sensitive paths, preserve local originals and original hashes, never auto-publish evidence ZIP.

**Exact resolution path:** Pass rights/privacy manifest and actual bundle audit; explicit approval for every redistributed source/media class; compare staged artifacts, not only git status.

## Q-18 — Future camera calibration, pose registration and observability

**Status:** OPEN · **Owner:** M13/M14 · **Class:** Future capability gate

**Missing / conflicted:** No calibrated camera/tag fixture or physical observation dataset is present. Hidden torque/washer/screw length cannot be certified from an arbitrary camera view.

**Impact:** M13/M14 only and any camera-derived property check.

**Buildable now / prohibited shortcut:** Use controlled/synthetic fixtures for development; keep camera off before M13; no new owner capture dependency in the core product.

**Exact resolution path:** Calibration with uncertainty, known tag scale and tag-to-assembly registration, admitted feature geometry and validated visible predicates; real target-camera accuracy requires actual evaluation.


## Evidence acquisition stop rule

For each candidate source, record search terms, inspected official repository/category paths, revision/identity results, available file types, source limitations and why a candidate was accepted or rejected. A bounded acquisition attempt completes its research task when this record is produced; it does **not** close the geometry issue unless the missing claims are supported. A manufacturer CAD request can be drafted as a later optional action, but no contact or external write is authorized by this planning task. Do not make the core implementation wait for a response.

## Architecture decisions that are not open questions

Do not reopen the chosen renderer, state ownership, SQLite/IndexedDB split, JSON Schema source, CadQuery mechanical master, scripted GLB exporter, per-definition/per-instance identity mapping, coordinate conversion, or review-versus-confirmation semantics merely because evidence is incomplete. Those decisions are fixed. A dependency incompatibility is resolved within the chosen architecture by a tested lock or a documented bounded change, not an unreviewed rewrite.


---

## Source document: EVIDENCE_INSPECTION.md

# Physical-reference image inspection

All six JPEGs and IMAGE_INDEX.txt were inspected. The originals are retained byte-for-byte in EVIDENCE/originals, and their SHA-256 values are recorded in EVIDENCE/manifest.json. Crops are legibility aids only. No OCR, geometric calibration, photogrammetric reconstruction or physical measurement was used.

The evidence set consists of photographs of the box and printed instructions. It does **not** contain six views of loose physical components or six views of a completed robot. This distinction controls the scope of every conclusion below.

## E01 — 01_IMG_0526.jpeg

**Content:** Box/front presentation.

**Established:** Visible SunFounder PiCar-X packaging and a printed assembled-product rendering establish product-family context and the pictured visual design.

**Not established:** This is not a photograph of the owner’s assembled car. No mount coordinate, actual board revision, dimensional value or physical completion state follows from the box rendering.

Original: [open image](EVIDENCE/originals/01_IMG_0526.jpeg).

## E02 — 02_IMG_0527.jpeg

**Content:** Additional box presentation.

**Established:** Additional packaging/product imagery helps compare family appearance against the printed manual and identify the PiCar-X kit context.

**Not established:** Box artwork is not measured hardware and cannot establish exact servo/motor/PCB identity, an as-built state or dimensional tolerances.

Original: [open image](EVIDENCE/originals/02_IMG_0527.jpeg).

## E03 — 03_IMG_0528.jpeg

**Content:** Printed parts list and revision.

**Established:** The upper-right marking is Z0104V40. The sheet names plates A–H, separate front/rear wheels, Washer A/B, spring washers, nominal screw/standoff names, opaque rivet codes, TT Motor, Servo (with package), Robot HAT, camera/ultrasonic/grayscale modules, battery, FPC/FFC and 4/5-pin wires, USB accessories, tape/wrap and tools. Framed depictions are labeled backup.

**Not established:** The sheet illustrates inventory; it does not prove all illustrated items are physically present. Photographic perspective/creasing precludes unqualified scale extraction. Rivet digits, servo family and mechanical dimensions cannot be inferred. Printed hardware counts are transcriptions with a visible audit crop, not metrology.

Original: [open image](EVIDENCE/originals/03_IMG_0528.jpeg).

## E04 — 04_IMG_0529.jpeg

**Content:** Printed assembly steps1–5 and Pi branches.

**Established:** Covers Pi4/Pi5 versus Zero2W mounting stacks, board insertion, branch-specific camera ribbon connection, HAT fastening and two motors. S04 depicts four M2.5x6 screws for both branches; a partly occluded screw was checked with crops. S05 supplies motor orientation and four screw/spring-washer/nut allocations.

**Not established:** Branch illustrations provide relationships and names, not full engineering coordinates, connector exact identity or board/component tolerances. Hidden mechanical interfaces remain unresolved.

Original: [open image](EVIDENCE/originals/04_IMG_0529.jpeg).

## E05 — 05_IMG_0530.jpeg

**Content:** Printed assembly steps6–17.

**Established:** Covers tape/battery, horn/ultrasonic/front supports, camera attachment and pan-tilt preparation/ribbon routing. M3x26 supports are installed in S10. S17 introduces power/ZERO/P11 servo preparation.

**Not established:** The exact HAT revision/ZERO applicability, dimensional interface geometry and metric cable routes are not established merely by these depictions. A printed zero procedure is not a measured angle on the owner’s servo.

Original: [open image](EVIDENCE/originals/05_IMG_0530.jpeg).

## E06 — 06_IMG_0531.jpeg

**Content:** Printed assembly steps18–29 and final wiring.

**Established:** Shows tilt/pan/steering horn attachment with repeated zeroing, Washer A at S19, the free-turning G/horn joint at S21, D/grayscale, E-right/F-left steering carriers, three Washer B per front wheel, rear wheels, sensor wires and final HAT port labels.

**Not established:** Exact fastener head/thread/pitch, rivet grip/stack dimensions, hidden cable pin mapping, actual connector engagement and physical completion remain unverified. Final 3V3 labeling must be reconciled with the generic repository sensor text before claiming electrical applicability.

Original: [open image](EVIDENCE/originals/06_IMG_0531.jpeg).


## Count and legibility audit

The hardware crop preserves the printed M1.5x3 layout: nine unframed screws plus two framed backup depictions. BOM_RECONCILIATION records that as printed primary9/backup2, consistent with prescribed uses4+4+1. The S04 crops preserve the four-screw interpretation for both mounting branches. These findings remain reviewable against the full originals; a later contradiction becomes a source conflict, not a silent overwrite.

[Hardware crop](EVIDENCE/crops/hardware-crop.png) · [S04 Pi4/Pi5 crop](EVIDENCE/crops/s04-pi45-crop.png) · [S04 Zero2W crop](EVIDENCE/crops/s04-zero-crop.png)

## Formal evidence conclusions

VERIFIED as **printed statements/depictions**: PiCar-X identity, Z0104V40 revision, 29-step numbering, plate labels, named hardware, branch order, prescribed allocation counts and visible orientation/wiring labels. DERIVED as **planning arithmetic**: per-variant required fastener use and expected unused printed stock. PROBABLE or UNRESOLVED: exact OEM component equivalence, all unmeasured mechanically important geometry, actual inventory and physical match. No precise dimension was promoted because a component looked familiar.

The source-panel links in the ledger point to the photograph and printed step number, not a guessed PDF page. PDF-page cross-links are added only after M0 reads the actual booklet bytes and verifies their mapping. User photos are private evidence; this package does not authorize publishing them in an app or public repository.


---

## Source document: SOURCE_REGISTER.md

# Source register and inspection limits
**Inspection/retrieval date: 2026-09-29.** Repository reads were pinned to `9e54b2fb3199c22f5d5c7cd67c8e4531ab2246f8` after live main resolution. No GitHub write action was performed. These source records distinguish a located file from inspected bytes and a source statement from applicable engineering evidence.

## Repository sources
### R01 — Live main branch resolution

https://api.github.com/repos/scalinity/PiCar/branches/main

Resolved 9e54b2fb3199c22f5d5c7cd67c8e4531ab2246f8; inspection baseline, not a guessed handoff SHA.

### R02 — Repository README

https://github.com/scalinity/PiCar/blob/9e54b2fb3199c22f5d5c7cd67c8e4531ab2246f8/README.md

Upstream provenance, build instructions, excluded media and companion overlay context.

### R03 — Pinned SunFounder upstream tree

https://api.github.com/repos/sunfounder/picar-x/git/trees/ce2ef77d7f96ac6325c1c8c3fe584b9caab418e4

Commit exists; docs tree inspected. A separately acquired PDF is not proven by this commit alone.

### R04 — Actual pinned shared-docs gitlink

https://api.github.com/repos/sunfounder/picar-x/contents/docs/source/_shared?ref=ce2ef77d7f96ac6325c1c8c3fe584b9caab418e4

The gitlink points to sf-shared at 0c11f833f862661779180ea7da2a25fd515c40d8; .gitmodules also read.

### R05 — Bundled assembly PDF metadata

https://api.github.com/repos/scalinity/PiCar/contents/picarx-companion/public/content/pdf/picar-x-assembly.pdf?ref=9e54b2fb3199c22f5d5c7cd67c8e4531ab2246f8

11,048,665 bytes; Git blob SHA-1 85c752c505c2a52bf82900111fd3a31c6ad0f9d8. Binary contents NOT retrieved; SHA-256 and V40 equivalence unresolved.

### R06 — Content pipeline build and overlay

https://github.com/scalinity/PiCar/blob/9e54b2fb3199c22f5d5c7cd67c8e4531ab2246f8/picarx-companion/tools/content-pipeline/build.ts

Actual source read, including V40 preference/V33 fallback, case/anchor validation, 62-page expectation and deletion/emission. overlay.ts also read for wizard/corrections.

### R07 — Root ignore policy

https://github.com/scalinity/PiCar/blob/9e54b2fb3199c22f5d5c7cd67c8e4531ab2246f8/.gitignore

Separate upstream checkout and sensitive media excluded; this does not establish bundle filtering.

### R08 — Frontend dependency/scripts manifest

https://github.com/scalinity/PiCar/blob/9e54b2fb3199c22f5d5c7cd67c8e4531ab2246f8/picarx-companion/package.json

React19, TS5.8, Vite7, Tauri2 ranges, pnpm and the five existing scripts. Lock exists; no installed-version/build success claim.

### R09 — App and frontend entry

https://github.com/scalinity/PiCar/blob/9e54b2fb3199c22f5d5c7cd67c8e4531ab2246f8/picarx-companion/src/App.tsx

Four routes/nav sections, external opener, fixed hardware chip. main.tsx read for StrictMode and CSS entry points.

### R10 — Custom hash router

https://github.com/scalinity/PiCar/blob/9e54b2fb3199c22f5d5c7cd67c8e4531ab2246f8/picarx-companion/src/lib/router.ts

Full parseRoute/useHash/refHref source read; nested reference links and malformed decode risk.

### R11 — Progress store

https://github.com/scalinity/PiCar/blob/9e54b2fb3199c22f5d5c7cd67c8e4531ab2246f8/picarx-companion/src/lib/progress-store.ts

Full localStorage picarx.v1 shape, synchronous writes and hashchange bookmark source read.

### R12 — Content type contract

https://github.com/scalinity/PiCar/blob/9e54b2fb3199c22f5d5c7cd67c8e4531ab2246f8/picarx-companion/src/lib/content-types.ts

Tagged AST, Page/Section/Search/Video/Wizard types inspected.

### R13 — Generated wizard and page

https://github.com/scalinity/PiCar/blob/9e54b2fb3199c22f5d5c7cd67c8e4531ab2246f8/picarx-companion/src/content/wizard.json

Eight stage IDs, assembly PDF/videos/checks; WizardStep.tsx and authoring overlay.ts also read.

### R14 — Home page

https://github.com/scalinity/PiCar/blob/9e54b2fb3199c22f5d5c7cd67c8e4531ab2246f8/picarx-companion/src/pages/Home.tsx

Setup summary, next incomplete stage and lastRoute resume inspected.

### R15 — Reference/search integration

https://github.com/scalinity/PiCar/blob/9e54b2fb3199c22f5d5c7cd67c8e4531ab2246f8/picarx-companion/src/pages/Reference.tsx

Reference tree/pager and SearchBox.tsx substring/heading-priority/20-result algorithm inspected.

### R16 — Video course page

https://github.com/scalinity/PiCar/blob/9e54b2fb3199c22f5d5c7cd67c8e4531ab2246f8/picarx-companion/src/pages/Videos.tsx

Registry sorting, thumbnail network URL, slug detail and lesson links inspected.

### R17 — Content access layer

https://github.com/scalinity/PiCar/blob/9e54b2fb3199c22f5d5c7cd67c8e4531ab2246f8/picarx-companion/src/content/index.ts

Eager page glob, JSON casts and registry; nav.json read for exact hardware/lesson page IDs.

### R18 — Camera hardware page

https://github.com/scalinity/PiCar/blob/9e54b2fb3199c22f5d5c7cd67c8e4531ab2246f8/picarx-companion/src/content/pages/hardware/cpn_camera.json

OV5647 claim, conflicting prose/spec dimensions and power-off warning. Not proof of the supplied board revision or exact geometry.

### R19 — Ultrasonic hardware page

https://github.com/scalinity/PiCar/blob/9e54b2fb3199c22f5d5c7cd67c8e4531ab2246f8/picarx-companion/src/content/pages/hardware/cpn_ultrasonic.json

HC-SR04 family/5V/dimension/connector text inspected. V40 applicability and supply-label conflict remain unresolved.

### R20 — Robot HAT hardware page

https://github.com/scalinity/PiCar/blob/9e54b2fb3199c22f5d5c7cd67c8e4531ab2246f8/picarx-companion/src/content/pages/hardware/cpn_robot_hat.json

Links latest robot-hat-v4 docs; does not itself identify the actual board revision.

### R21 — Native shell and configuration

https://github.com/scalinity/PiCar/blob/9e54b2fb3199c22f5d5c7cd67c8e4531ab2246f8/picarx-companion/src-tauri/src/lib.rs

Template greet/opener; Cargo.toml, tauri.conf.json and capabilities/default.json also read. SQLite is a proposal, not an existing subsystem.

### R22 — PDF and document components

https://github.com/scalinity/PiCar/blob/9e54b2fb3199c22f5d5c7cd67c8e4531ab2246f8/picarx-companion/src/components/PdfViewer.tsx

PDF.js worker/cache/page behavior; RstRenderer.tsx and DocImage.tsx source also read. Checklist/CodeBlock/VideoEmbed discovered in component tree; no exhaustive audit of those three bodies claimed.

### R23 — Styling tokens

https://github.com/scalinity/PiCar/blob/9e54b2fb3199c22f5d5c7cd67c8e4531ab2246f8/picarx-companion/src/styles/tokens.css

Plain CSS token system and reduced-motion CSS inspected; base/components stylesheet entry paths confirmed by main.tsx.

### R24 — Build/tool TS configuration

https://github.com/scalinity/PiCar/blob/9e54b2fb3199c22f5d5c7cd67c8e4531ab2246f8/picarx-companion/tsconfig.json

Strict compiler settings and src-only include inspected; vite.config.ts read for port/HMR/native watch exclusions.

## External primary sources
### W01 — CadQuery assemblies

https://cadquery.readthedocs.io/en/latest/assy.html

Inspected primary documentation on assemblies and constraints; pinned exact tool versions remain M4.

### W02 — CadQuery import/export

https://cadquery.readthedocs.io/en/latest/importexport.html

Inspected primary STEP/DXF/glTF interchange documentation. Runtime exporter choice is this specification’s design.

### W03 — React Three Fiber maintainer README

https://github.com/pmndrs/react-three-fiber/blob/master/readme.md

Read through GitHub; React19 pairs with Fiber9. Runtime patch lock is not inferred from this mutable URL.

### W04 — Three WebGLRenderer

https://threejs.org/docs/pages/WebGLRenderer.html

WebGL2 baseline documented; WebGL1 not a fallback in the chosen stack.

### W05 — Khronos glTF 2.0 specification

https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html

Inspected coordinate/transform/hierarchy conventions; project adds stricter ID/naming/asset rules.

### W06 — Tauri WebDriver testing

https://v2.tauri.app/develop/tests/webdriver/

Current primary docs describe WDIO embedded provider for macOS and native test-plugin setup. Compatibility still needs actual build testing.

### W07 — glTF-Transform Meshopt function

https://gltf-transform.dev/modules/functions/functions/meshopt

Convenience optimization includes quantization/reordering; specification requires explicit configuration and decode validation.

### W08 — Three GLTFLoader

https://threejs.org/docs/pages/GLTFLoader.html

Primary loader/decoder interfaces inspected. Local decoder and lifecycle policy is a project requirement.

### W09 — OpenCV solvePnP documentation

https://docs.opencv.org/4.13.0/d5/d1f/calib3d_solvePnP.html

Primary calibration/pose coordinate description; no complete assembly verifier or measured project accuracy implied.

### W10 — University of Michigan AprilTag project

https://april.eecs.umich.edu/software/apriltag

Primary fiducial detection/pose project; physical tag size and registration still require evidence.

### W11 — Official PiCar-X assembly documentation

https://docs.sunfounder.com/projects/picar-x-v20/en/latest/assemble.html

Printed manual governs assembly over backup video; servo preparation guidance. URL family v20 is not a replacement for printed revision V40.

### W12 — SunFounder PiCar-X product page

https://www.sunfounder.com/products/picar-x

Used only as current product-family context/candidate acquisition; no exact component CAD identity established.

### W13 — Robot HAT documentation family

https://docs.sunfounder.com/projects/robot-hat-v4/en/latest/

Mutable family site can contain later board material. Not proof of owner HAT identity.

### W14 — Official Raspberry Pi4 mechanical source category

https://pip.raspberrypi.com/categories/545-raspberry-pi-4-model-b

Mechanical PDF located; direct PDF fetch timed out in this pass. Do not treat its unseen numerical contents as verified.

### W15 — Official Raspberry Pi5 source category and mechanical drawing

https://pip.raspberrypi.com/categories/892-raspberry-pi-5

Category inspected; drawing page read and screenshot inspected. It explicitly limits dimensions to approximate/reference use, not production data. STEP ZIP located but bytes not inspected.

### W16 — Official Zero2W mechanical drawing

https://pip-assets.raspberrypi.com/categories/584-raspberry-pi-zero-2-w/documents/RP-008358-DS-1-raspberry-pi-zero-2-w-mechanical-drawing.pdf

One-page drawing read and screenshot inspected. Source supplies planar reference dimensions, not every board component/tolerance or actual user hardware configuration.


## Exact official Raspberry Pi acquisition locators

Pi4 drawing, located but not read because of fetch timeouts:
`https://pip-assets.raspberrypi.com/categories/545-raspberry-pi-4-model-b/documents/RP-008343-DS-1-raspberry-pi-4-mechanical-drawing.pdf`

Pi5 drawing, inspected including its reference-only warning:
`https://pip-assets.raspberrypi.com/categories/892-raspberry-pi-5/documents/RP-008347-DS-1-raspberry-pi-5-mechanical-drawing.pdf`

Pi5 no-graphics STEP ZIP, official category link located, binary unsupported by the reader:
`https://pip-assets.raspberrypi.com/categories/892-raspberry-pi-5/documents/RP-010083-CA-1-rpi-5%203D%20STEP%20-%20No%20Graphics%20small%20file.zip`

M5 must acquire/pin/inspect exact bytes and any embedded limitations before using that STEP as engineering evidence. A category listing is evidence of a candidate download, not validation of its geometry.

## What was not established

No complete authoritative public Z0104V40 mechanical CAD set was conclusively established by this targeted search. No generic motor, servo, ultrasonic board, camera, wheel or plate CAD was admitted. No owner loose-part measurement or actual inventory count was made. No complete repository binary checkout was obtained, and the app was not run. The bundled PDF and vendor STEP bytes were not inspected. Missing byte hashes are recorded as unresolved, never invented from filenames or Git object IDs.

Original owner image SHA-256 values and crop provenance are in `EVIDENCE/manifest.json`. Repository Git blob values identify the source object; they are not SHA-256 hashes of these local package files. External mutable documentation is a technology research input; production geometric sources must be locked by revision and hash during authoring.

## Independent audited-copy rechecks (29 September 2026)

Current main was independently resolved at audit start and again at delivery preparation: `9e54b2fb3199c22f5d5c7cd67c8e4531ab2246f8`; no drift observed. Actual repository files and the upstream shared gitlink were re-read as listed in AUDIT_REPORT.md. The PDF metadata was rechecked, but its binary content/SHA-256/panels remain Q-02.

The audit independently rechecked the current maintainer Fiber README, Tauri WebDriver guide, Three.js WebGLRenderer documentation and RFC8785. Other external mechanical-source entries above are retained from the original source register as candidates/prior inspection records; this audit does not claim to have downloaded or certified their CAD. Official approximate-source limitations remain binding. No newly inferred dimension or electrical instruction is added.


---

## Source document: FUTURE_CAMERA_AND_AR_SPEC.md

# Future camera verification and AR boundary

## 1. Scope and stack decision

Camera support starts in M13, after the core application and its scoped geometry admissions are reliable. It is opt-in, local-first, and cannot turn an unverified model into a reference standard. The initial camera pipeline is **frontend capture via getUserMedia → local worker → AprilTag detector and OpenCV pose/projection operations compiled to bundled WASM → deterministic observation rules**. Use transferable image/RGBA buffers with a tested fallback; do not require WebCodecs. Rust handles permissions integration where necessary, observation persistence and artifact hashes, not a second image-analysis implementation. No camera code or permission prompt runs in M0–M12.

AprilTag and OpenCV supply well-defined geometric tools, not complete assembly recognition [W09/W10]. An optional learned component/keypoint detector is a candidate producer with confidence/visibility metadata. It cannot decide a hidden mechanical fact or override an applicable deterministic comparison. AI reasoning explains discrepancies, suggests a new view, or classifies a source issue; it never invents a geometric measurement or promotes source confidence.

## 2. Observation pipeline and required records

```text
capture frame and timestamp
 -> calibrated camera intrinsics + lens distortion + resolution/crop mapping
 -> fiducial detections and physical tag-size evidence
 -> tag-to-assembly registration and camera pose with uncertainty
 -> CAD projection of admitted target features
 -> visibility/occlusion and image-quality eligibility
 -> visible component/keypoint candidates
 -> deterministic rule comparison with propagated uncertainty
 -> PASS / RESCAN / HUMAN_CONFIRM, or explicit detected contradiction
 -> optional human interpretation; append scoped observation record
```

`CameraCalibration` records device/session identity, intrinsics matrix, distortion model/coefficients, capture resolution, calibration method, reprojection statistics, validity envelope and evidence. Changing camera resolution/crop or lens parameters invalidates its applicability unless a proven transform is supplied. `PoseObservation` records detector version, tag family/ID, corners, tag-size claim, pose solution alternatives, covariance or supported uncertainty bounds, quality flags and the tag-to-assembly registration hash.

`ObservationRecord` binds frame hash (when retained), calibration/pose/model/graph/feature hashes, rule ID, visible region, method/version, uncertainty, result and limitation. An observation is immutable; corrections supersede it. Physical step confirmations may cite several scoped observations but cannot mark unobserved properties as camera-verified.

A printed tag does not supply metric scale by itself. Its actual physical size and the rigid tag-to-assembly transform must be established. A tag placed arbitrarily on a table tracks the table, not the car. Use a known fixture or a registered attachment whose mechanical relationship is supported. Unknown tag scale or mounting pose returns RESCAN/HUMAN_CONFIRM, never an exact CAD overlay.

## 3. Observability model

Each VerificationRule includes an observability record:

| Class | Eligible examples | Preconditions / limits |
|---|---|---|
| `directVisible` | Present/absent visible component, exterior orientation, exposed washer at this moment | Sufficient pixels, known pose, visible distinguishing features, no contradictory occlusion |
| `conditionalVisible` | Connector insertion depth visible from a specified side; exposed cable contact orientation | Rule-specific view, calibration and image quality; hidden/internal latch engagement is not proven |
| `sequenceObserved` | A washer seen before a later plate obscures it | Historical observation supports a prior state only; later disassembly/change invalidates current inference |
| `activeTest` | Visible response to a human-initiated motion/check | Explicit safe procedure and observation bounds; app does not autonomously actuate in the core design |
| `measurementRequired` | Actual length, diameter or clearance needing suitable scale/metrology | Calibrated measurement method and uncertainty; an arbitrary photo does not qualify |
| `notCameraObservable` | Hidden screw length, torque, internal thread engagement, hidden washer now, material identity/strength | Must remain human/measurement/other-source scoped; camera result is NOT_APPLICABLE or BLOCKED |

A generic neural “assembled correctly” score is not a VerificationRule. A detector may identify a visible candidate, but a PASS requires the rule's explicit geometric and visibility conditions. Similar-looking fasteners cannot establish length hidden inside the assembly. No camera view proves torque. Historical visibility must not silently become continuous observation.

## 4. Deterministic comparisons and uncertainty

Use source-supported dimensions and calibration uncertainty. Compare projected feature locations, silhouette alignment or relative orientation against rule-specific tolerances. Set acceptance limits before evaluating held-out test frames; record them with the rule version. A rule's allowable residual must be meaningfully greater than combined model, pose and image-localization uncertainty. If uncertainty overwhelms the required distinction, return HUMAN_CONFIRM rather than widening the tolerance until the image passes.

Development fixtures establish controlled ground truth: synthetic camera projections, real calibrated test articles with independent measurements, deliberate wrong orientation/missing parts, low light, glare, motion blur, occlusion, tag damage, ambiguous planar pose and changing zoom. Report false PASS and false reject rates separately by rule and condition. Do not advertise target-camera precision from a synthetic-only test.

PASS means the named visible predicate is supported in the eligible frame/state. RESCAN means insufficient framing/quality/pose information and provides a specific view request. HUMAN_CONFIRM means the predicate cannot be resolved reliably or is outside camera observability. An observed contradiction is a separate FAIL finding shown with evidence; it must not be disguised as a low-confidence PASS. User acknowledgment of a warning is not deletion of the contradictory observation.

## 5. Camera-to-render transforms

The canonical robot basis remains the data-model basis. Keep a typed transform chain `CAD -> assembly registration -> tag/world -> camera` and calibrate it explicitly. OpenCV camera coordinates are +X right, +Y down, +Z forward [W09]. The Three camera convention has +X right, +Y up, view toward -Z. The camera-frame basis conversion is therefore `diag(1,-1,-1)` (determinant +1), distinct from the CAD-to-glTF object conversion. Test the two conversions independently to avoid applying either twice.

Use the calibrated intrinsic projection, not a guessed field of view matched by eye. Track crop/letterbox/display scaling separately from camera intrinsics. A user may manually reposition the overlay for inspection, but that mode is explicitly unregistered presentation and cannot produce metric observation checks.

## 6. AR implementation sequence

M14 first implements desktop camera passthrough with the admitted next component rendered through the calibrated projection. Reuse the canonical instance IDs, motion evaluator and stable final poses. A `PoseProvider` supplies timestamped rigid transform, projection/calibration identity, uncertainty and tracking validity; it does not modify the assembly graph.

On tracking loss, stale pose or ambiguous scale, hide metric overlay or freeze it with a clear invalid-tracking label and disable verification. Do not keep smoothly extrapolating as though alignment were known. Occlusion rendering is useful presentation but not proof of the underlying physical surface; unobserved occluders cannot be fabricated into evidence.

Mobile deployment is a later bounded platform gate, not a first-release WebXR assumption. The gate compares a phone browser and a native mobile adapter on an explicitly selected target device: camera permission, calibrated intrinsics access, local detector performance, pose stability, offline assets and privacy. Choose the first platform that passes those requirements with a reproducible build; otherwise retain desktop AR and report mobile unsupported. The shared PoseProvider and metre-based scene contract remain unchanged whichever platform wins. No desktop AR acceptance is described as a working phone app.

## 7. Privacy and retention

Default processing is local and frames are ephemeral. Store derived rule outcomes, calibration and pose metadata; retain raw frames only through an explicit user action. Show active capture clearly and release tracks when the feature closes. Do not capture the desktop, microphone or unrelated files. Do not enable telemetry containing images or pose data by default.

An optional cloud interpretation path must display the exact cropped/redacted input, provider and retention notice and require per-request approval. It is never a fallback silently activated when local inference fails. Cloud output cannot alter geometry confidence, hidden-property checks or canonical model data. Camera images and original owner photos remain outside default public CI/release artifacts. Export/import includes captures only when explicitly selected.


---

## Source document: CRITICAL_REVIEW.md

# Adversarial architecture review

This review concerns the specification, not a test run of an implementation. The package-validation report records the package checks actually performed on these delivered documents, schemas and evidence files. The following issues were considered and the resulting constraints are incorporated throughout the package.

| Challenge | Failure prevented / incorporated ruling |
|---|---|
| Digital twin or only an animation? | Canonical parts/interfaces/constraints and a pure operation graph define every state. Visual motion projects that state; GLB or Blender clips cannot define assembly truth. |
| Does each physical item have an identity? | Definitions are distinct from instances, quantity trays are views, washers are individual, integral leads have ownership, rivet elements do not duplicate supplied stock, and accessory/spare/variant-unused dispositions are explicit. |
| Are printed stock and actual inventory conflated? | No. The counted hardware depiction is a separate evidence scope. Actual owner-stock equality is BLOCKED until adequately observed, never set equal by default. |
| Can every hole be explained? | Feature IDs resolve through measurements/derivations/evidence; CAD face indices and AI authorship are not terminal provenance. Missing frames remain unresolved, not zero. |
| Can a plausible generic model become exact kit CAD? | No. Part identity, applicability, source limits and geometry assurance are independent. SG90/MG90S, generic TT and HC-SR04 models are not admitted by resemblance. |
| Is official-source status being overused? | The inspected official Pi5 drawing explicitly limits itself to approximate reference dimensions. Those limits propagate and bar unsupported exact engineering claims. Its located STEP ZIP is not called validated CAD. |
| Have older PiCar revisions leaked in? | V40 source lock is mandatory; discovered V33 fallback is removed. URL family v20 is not a printed-kit revision. PDF metadata alone cannot prove V40. |
| Is state fully reversible? | Pure before-state capture and after-hash guard support exact semantic undo; replay does not reverse physical tape cutting or rewrite attestations. All29×3 variant rounds are required tests. |
| Is the step number being used as the entire state? | Four layers separate immutable model, digital projection, physical confirmation ledger and presentation. Cable endpoints, temporary P11, allocations and joints have explicit state. |
| Are camera actions changing truth? | Camera/explosion/selection/replay are presentation only. Manual override persists until resumed. Preview and physical confirmation remain different commands. |
| Can a user “undo” a later dependency incorrectly? | Explicit invalidation closure and transactional persistence prevent silently retaining downstream alignment evidence. Variant changes fork instead of reinterpreting the same session. |
| Can incomplete poses be hidden in context? | G-GEOMETRY covers the complete mating/context dependency closure. A nearby chassis used to locate a screw cannot be an unverified exception. |
| Is Blender still the geometric source? | No. It is optional texture/material tooling on copies. Source positions, interfaces and mechanical poses belong to deterministic CAD; primary GLB export is script-driven. |
| Can export validation create a dependency cycle? | Engineering checks produce G-CAD in M7. M8 builds final assets, runs round-trip checks, then closes G-GEOMETRY. Fixture exporter/viewer work can precede real geometry without admitting it. |
| Do geometry and source uncertainty get replaced by numerical solver tolerance? | No. Manufacturing tolerance, measurement uncertainty, model approximation and solver residual are separate. Nominal agreement cannot certify worst-case physical fit. |
| Can a provisional import simply flip a verified enum? | Runtime/compiler derive capability from admitted hash-bound reports and trusted pack provenance. Unknown imported packs stay provisional unless a recognized release/admission chain is validated and explicitly adopted. |
| Will current app functionality survive? | Eight setup-stage IDs, legacy hash routes, AST renderer, PDF/video/search, overlays and localStorage backup are protected. Assembly is integrated, not a rewrite. |
| Will content regeneration delete twin assets? | No. Twin publication is outside public/content and both publishers use explicit staging ownership. Existing destructive deletion is a targeted migration concern. |
| Does Gitignore actually protect packaged sensitive media? | No; package allowlist/deny-path audit is required. Local ignored images can otherwise enter public output. Source photos stay private by default. |
| Is macOS native testing based on an outdated assumption? | No. Current official Tauri docs include the WDIO embedded path; actual compatibility is a measured gate, not an assumed success. Browser tests are not native GPU proof. |
| Can every final artifact regenerate? | Pinned source/toolchain, parametric scripts/vendor wrappers, normalized mesh export and hash manifests define regeneration; no required GUI-only edit or unversioned Blender state. |
| Are directory/API choices consistent? | Review consolidated domain/assembly, domain/components, platform, assembly-3d and generated paths; operation tags and schema entry points were aligned. Both schemas and prose use the same identity/unknown conventions. |
| Are source-photo metadata trustworthy? | Hashes and dimensions are measured from actual local files; first two photos are landscape, remaining four portrait. Crops preserve parent region and resampling metadata, not inferred scale. |
| Can camera/AR verify hidden facts? | No. Observability is rule-scoped; hidden washer, screw length, torque and thread engagement cannot gain camera PASS. Registered pose requires calibrated scale and a known tag-to-assembly relationship. |
| Can agents work independently without making architecture choices? | Milestones specify exact scope/paths/dependencies/tests/gates and exclusive ownership. M1/M2 contract changes require integration review, not divergent forks. |

## Residual limits, not papered-over findings

No full authoritative V40 CAD package or actual unit measurements were obtained. Bundled PDF bytes and candidate Pi5 STEP bytes remain uninspected in this pass. No native/renderer/app build was run. Final physical-match verification therefore remains unavailable; many nominal geometry scopes remain blocked. The software architecture, source-backed semantic29-step plan and fixture/reference-first implementation are still executable without new owner input.

The specification is complete as an implementation contract with bounded evidence gates. It is not a claim that the missing evidence has already been acquired or that the resulting digital twin has already been certified.

## Independent audit status

This document preserves the original author’s self-review; it is not the independent audit or a mechanical certificate. The independent findings, counterexamples and corrections are in [AUDIT_REPORT.md](AUDIT_REPORT.md). The historical 174-check report is preserved under HISTORICAL; the current runnable validation report is AUDITED_PACKAGE_VALIDATION_REPORT.json. No repository build, native execution or real mechanical validation was performed during this audit.


---

## Source document: HANDOFF_M0.md

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
