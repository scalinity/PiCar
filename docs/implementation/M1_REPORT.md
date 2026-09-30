# M1 closure — canonical schemas, claims, inventory identities and uncertainty firewall

G-DATA: **PASS**. M1 implements additive authoring data and validation only. M2 authorization is conditional on the local acceptance commit; the commit receipt appended after acceptance records that SHA. M2 has not been implemented. No remote write occurred.

## Accepted baseline and provenance

- Original inspection HEAD: 9e54b2fb3199c22f5d5c7cd67c8e4531ab2246f8, main.
- M0_BASELINE_SHA: 2a934710501d71aecbd8da827925c92e49378661
- M1_START_SHA: 2a934710501d71aecbd8da827925c92e49378661
- M1_BRANCH: m1-canonical-data
- Specification: audited v2 / contractVersion 2, Z0104V40.
- Original audited archive raw SHA-256: 7a01cc81d68e2a12c641e9d3dfe0b00636476dee1df8de17e442cc127178b411.
- V40 PDF raw SHA-256: 2f4ea3ae3729bfb6bc92f8fdba30f31937f9df2c3a80e5774ef03fb076f386ce.
- V40 PDF Git blob SHA-1: 85c752c505c2a52bf82900111fd3a31c6ad0f9d8 (distinct from raw SHA-256).

M0 was independently checked before M1: all A–G PASS, m1Allowed true; all 388 after-tree bindings, 118 specification allocation entries, nine private binary allocations and original archive hash matched. The 29-panel source lock covered Pi4/Pi5/Zero2W, its bindings matched, no private files were tracked/staged/public, and fast regression checks passed. Every tracked M0 diff and the staged intended checkpoint were inspected. Six M0 logs required trailing-whitespace/blank-EOF normalization to pass the staged whitespace check; test-manifest/report bindings were refreshed without changing test results. See M0_CHECKPOINT_VERIFICATION.json. The accepted M0 commit is an ancestor; gate.mjs checks bound M0 application/native/source bytes remain unchanged. CAD_TOOLING_BOOTSTRAP and native qualification remain future prerequisites, not M1 blockers.

## Exact identities and bindings

| Identity / raw bytes | SHA-256 |
| --- | --- |
| schemaHash | `efc43a7ae4126687d5b0dadaf924494af619ffa1a3072323960e6ea75fbcf487` |
| evidenceHash | `e00e7825f413a37edeb3c9ac47611fbf790480d6efb71337b5cd219bfd082d5c` |
| modelHash | `0764cf8879767dbc31ae1b780ace239da88a6febf69ee51b0841dbac3df7c82a` |
| sourceLockRawSha256 | `3f715ec18946e022a1b5633a15e3b3ae3d31576e1fa378d77c375d61c291b06e` |
| semanticValidatorRawSha256 | `c4488f9c37f437d8bd226c0a43a5fa795702a6cc6ec3481659d8032f4fb42609` |
| hashPolicyRawSha256 | `19530138a14bf148a03d7c1bc55985ab4490efde78d34a08e79209d35f6fcadd` |
| vectorsRawSha256 | `653c300d75185a402a451dcb85a85e9cb6bbbea8841297dfe00d3a40ba66a9da` |

- model-input.json raw SHA-256: b42c92fc550b6f5a5a36f88abafbaa208f3b6db3d63e3033bac749d8894e17f8
- evidence-input.json raw SHA-256: f1bbfb9ef0ac256a0cb9c6fbf9d3a3a0fc583c72dae6c4ba800cdb1ce5779c18
- M0_GATE_REPORT.json raw SHA-256: 881e499d6d0321377233630da21d0dbea2c5d76c667390e950a88a79372c2a24
- M0 documentary lock raw SHA-256: 8ca58014ece62abf765ebdbd767d72611d69eaac39440e06b78769505fd6d0b3

The single structured acceptance report is M1_G_DATA_REPORT.json. It binds 124 exact files/lengths: production schema/descriptor bytes, registry families, model/evidence materializations, source lock, validator/tools, dependency locks, test code/vectors/TAP/results and command logs, generated types and normative contract/source artifacts. Its own raw hash and this prose/hand-off are excluded to avoid self-reference. --check recomputes all bindings and semantic identities; local committed acceptance must also be checked separately. Any changed canonical record, source, schema, rule/reference, validator, hash policy/vector, bound test or generated contract invalidates acceptance until the relevant checks and report are refreshed. No downstream CAD/graph/asset slot has been filled with a fake artifact.

## Files created and canonical ownership

All M1 files are new; accepted M0 application/native/specification files were not edited. Exact M1 path inventory is the acceptance commit's git show --name-only plus the subsequent closure receipt commit.

- digital-twin/schemas/: 41 active audited schema files preserved byte-for-byte, m1-inventory.schema.json, m1-g-data-report.schema.json and semantic-registry.json. HISTORICAL remains audit-only.
- digital-twin/evidence/{records,conflicts}/ and sources.lock.json: source-scoped provenance, claims, full blocker source provenance plus current blocker statuses, conflicts and warnings.
- digital-twin/components/{definitions,instances,measurements,interfaces,inventory}/: canonical records, explicit dispositions, all 29 non-executable planning steps, audited hardware counts and unresolved allocations. registry-index.json is the family-to-path owner index.
- digital-twin/tools/evidence/: allocation, semantic/reference/source firewall, JCS/hash projection and immutable sum-v1 method. tools/{cli,cross-language,types,gate}.mjs are authoring/check entry points.
- digital-twin/validation/: typed-reference index, uncertainty/blocker impact, inventory/semantic/hash reports, materialized preimages, fixtures, tests, independent Rust/Python harnesses and actual command outputs.
- digital-twin/{package.json,pnpm-lock.yaml,pyproject.toml,uv.lock,hash-inputs.json,README.md}: local authoring locks/input classification/instructions.
- picarx-companion/src/generated/twin/{contracts,inventory}.d.ts: schema-generated, read-only contracts; no runtime integration.
- docs/implementation/{M1_REPORT.md,M1_G_DATA_REPORT.json,HANDOFF_M2.md}: closure and next-session prompt; handoff added after the acceptance SHA exists.

| Canonical family | Records |
| --- | --- |
| plannedUses | 214 |
| evidence | 27 |
| claims | 117 |
| conflicts | 2 |
| derivations | 19 |
| definitions | 61 |
| instances | 159 |
| measurements | 118 |
| interfaces | 61 |
| connectionPoints | 31 |
| fastenerDefinitions | 22 |
| cableDefinitions | 11 |
| geometrySources | 61 |
| frames | 61 |
| unresolvedItems | 18 |
| variants | 3 |
| tools | 2 |
| warnings | 1 |
| verificationRules | 19 |
| lots | 61 |
| allocations | 477 |

Future runtime families (operations, constraints, groups, solutions, conditions, motion/camera/visibility, sessions and reports) have audited typed contracts and ownership descriptors. No M2 reducer/compiled graph, renderer, storage migration, hardware action or metric CAD exists in M1.

## Evidence, unknowns and scoped capabilities

27 evidence records include six private original-photo hashes/locators, the locked V40 PDF/M0 lock, three pinned documentary pages and 16 external candidate-source entries whose bytes remain unavailable/reference-only. No external candidate is admitted engineering evidence. 117 claims distinguish printed transcription, printed stock, procedure, identity and reference approximation. Generic HAT v4 identity is intentionally PROBABLE; generic SG90/MG90S/TT/HC-SR04/Camera/HAT identities were not promoted. Pi5 approximate drawing limitations persist; no candidate STEP is asserted inspected.

Every unknown NumericValue carries unit, UNRESOLVED and blocker IDs with no numeric payload. All real metric geometry remains unresolved; no coordinates, lengths, angles, pinouts, pitch, tolerance or torque were invented. Known documentary counts retain exact source scope and uncertainty; source tolerance, metrology uncertainty and model-deviation budget stay separate unknowns. RECORDED geometry-source placeholders never promote evidence confidence through workflow maturity. Scoped attestation records are schema/scope checked only; M1 never stores, consumes or creates real human acknowledgments.

Typed-reference closure: PASS, 5673 resolved typed references with globally unique stable ASCII IDs and preserved history. Qualified Endpoint checks distinguish repeated instances, reject bare interface/cross-owner references and enforce proper family ownership. Cable subtypes bind parent endpoints and are unique per owner. Predicates enforce operand/comparator/unit/phase compatibility; absent metric proof cannot grant an engineering PASS. The gate's structural PASS is not mechanical, electrical or physical certification.

19 DERIVED printed-total measurements resolve to 19 immutable sum-v1 DerivationRecords; their same-unit inputs reproduce counts and worst-case interval uncertainty without independence assumptions. Input limitations propagate. Two conflicts remain OPEN: PX-CONFLICT-CAMERA-DIMENSIONS and PX-CONFLICT-ULTRASONIC-SUPPLY. Original competing claims are retained; resolution fixtures require a preserved rationale claim, rather than overwriting a source.

## Printed inventory and variants

| Printed item | Primary | Backup | Total | Pi4 planned | Pi5 planned | Zero2W planned |
| --- | --- | --- | --- | --- | --- | --- |
| M2.5x6 screw | 8 | 2 | 10 | 8 | 8 | 8 |
| M3x25 screw | 4 | 2 | 6 | 4 | 4 | 4 |
| Spring washer | 4 | 2 | 6 | 4 | 4 | 4 |
| M3 nut | 4 | 2 | 6 | 4 | 4 | 4 |
| M1.5x3 screw | 9 | 2 | 11 | 9 | 9 | 9 |
| M3x6 screw | 4 | 2 | 6 | 4 | 4 | 4 |
| M2.5x18+6 standoff | 4 | 2 | 6 | 4 | 4 | 2 |
| M2.5x18 standoff | 4 | 2 | 6 | 4 | 4 | 0 |
| M2.5x11 standoff | 2 | 2 | 4 | 0 | 0 | 2 |
| M2.5x30 standoff | 2 | 2 | 4 | 0 | 0 | 2 |
| M3x26 standoff | 2 | 2 | 4 | 2 | 2 | 2 |
| R2048 rivet | 4 | 2 | 6 | 4 | 4 | 4 |
| R2056 rivet | 6 | 2 | 8 | 6 | 6 | 6 |
| R3055 rivet | 2 | 2 | 4 | 2 | 2 | 2 |
| R3065 rivet | 6 | 2 | 8 | 6 | 6 | 6 |
| R3080 rivet | 2 | 2 | 4 | 2 | 2 | 2 |
| R30185 rivet | 2 | 2 | 4 | 2 | 2 | 2 |
| Washer A | 1 | 1 | 2 | 1 | 1 | 1 |
| Washer B | 6 | 2 | 8 | 6 | 6 | 6 |

Printed hardware is 76 primary + 37 backup = 113 documentary items across 19 rows. Pi4/Pi5 use 72, retain four primary variant-unused and 37 backups; Zero2W uses 70, retains six primary variant-unused and 37 backups. Step-use text and every variant-specific allocation preserve the audited ledger. One final screw cannot be spent twice.

The broader 159 planned identities include modules, separate unresolved servo-role definitions, distinct motors/wheel roles, accessories/tools, user board alternatives, four consumable source identities and two preallocated hook/loop child pieces. They are not 159 observed owner items or a larger verified printed-hardware count. Three-variant dispositions total 477; hardware planning-use identities total 214.

| Variant | Installed plan | Backup | Variant-unused | Accessory | Tool | Consumable |
| --- | --- | --- | --- | --- | --- | --- |
| rpi4 | 107 | 37 | 7 | 1 | 3 | 4 |
| rpi5 | 107 | 37 | 7 | 1 | 3 | 4 |
| rpi-zero-2-w | 104 | 37 | 9 | 2 | 3 | 4 |

Pi4 uses FFC; Pi5 and Zero2W use FPC. Zero2W keeps the USB microphone as an accessory, with Q-14 open. No generic board substitution. Five ambiguous servo-package/repeated-cable multiplicities are explicitly unresolved; no package spares were guessed. Rivet body/pin count as one purchased item, Washer B's removable backing stays owned, and six integral leads belong to their servo/motor/battery instances. Cable records total five loose plus six integral; no extra lead stock. Unknown consumable lengths/capacities remain symbolic and cannot receive quantitative certification.

Actual owner stock: **BLOCKED / NOT OBSERVED**, Q-01 and Q-13. Printed equality does not establish owner equality.

## Blockers and initial impact graph

| Q ID | Status | Missing scope | Original owner milestone(s) | Transitive definitions / interfaces / steps |
| --- | --- | --- | --- | --- |
| Q-01 | OPEN | Physical evidence scope versus nominal design | M1/M12 | 61 / 92 / 25 |
| Q-02 | RESOLVED | Bundled PDF bytes, revision and acquisition provenance | M0 | 0 / 0 / 0 |
| Q-03 | OPEN | Exact structural plates A–H | M6 | 61 / 92 / 26 |
| Q-04 | OPEN | Exact TT motor/gearbox identity and wheel shaft | M5 | 61 / 92 / 25 |
| Q-05 | OPEN | Servos, horns, spline and retaining screws | M5 | 61 / 92 / 27 |
| Q-06 | OPEN | Fastener standards, standoff ends, washers and opaque rivet codes | M5 | 61 / 92 / 25 |
| Q-07 | OPEN | Robot HAT revision, ZERO control and connector map | M5 | 61 / 92 / 28 |
| Q-08 | OPEN | Camera, ultrasonic and grayscale identity/dimension conflicts | M5 | 61 / 92 / 26 |
| Q-09 | OPEN | Camera ribbons, loose cables, pin orientation and routing envelopes | M5/M7 | 61 / 92 / 28 |
| Q-10 | OPEN | Pi board/revision and limits of official mechanical sources | M5 | 61 / 92 / 25 |
| Q-11 | OPEN | Battery, adhesive/tape and nonrigid envelopes | M5 | 61 / 92 / 26 |
| Q-12 | OPEN | Front/rear wheel geometry and steering stack detail | M5/M7 | 61 / 92 / 25 |
| Q-13 | OPEN | Actual inventory, accessory-package stock and repeated cable illustrations | M1/M11 | 61 / 92 / 26 |
| Q-14 | OPEN | Zero2W microphone/header and accessory handling | M2/M11 | 61 / 92 / 25 |
| Q-15 | OPEN | Exact reproducible toolchain lock and binary distribution | M0/M4/M8 | 0 / 0 / 0 |
| Q-16 | OPEN | Packaged Apple Silicon rendering, performance and native harness | M0/M9/M12 | 0 / 0 / 0 |
| Q-17 | OPEN | Private evidence, upstream sensitive media and asset redistribution | M0/M8/M12 | 0 / 0 / 0 |
| Q-18 | OPEN | Future camera calibration, pose registration and observability | M13/M14 | 0 / 0 / 0 |

All 18 source Q records are retained; 17 remain OPEN. Q-02 is RESOLVED only for documentary source identity by accepted M0's PDF/source-panel evidence. Immutable blocker-source-records.json preserves all original missing evidence, impact, permitted work, resolution criteria and multi-milestone ownership, including its historical Q-02 OPEN status; current production status is exclusively blockers.json. CLI proves its exact audit provenance and current-record correspondence. No M1 record creation closes a geometry/physical/certification blocker. forbiddenClaims remains explicit in each production blocker.

unresolved-impact.json contains direct dependency edges and complete transitive closures for claims, definitions, interfaces/connection points and planning steps, all three variant scopes and future gate/owner annotations. These are initial evidence-impact relationships, not M2 executable/invalidation edges. Supersession preserves prior records and computes dependent impact; missing history or cycles reject.

## Commands, outcomes and tests

Final gate command from repository root: node digital-twin/tools/gate.mjs (exit 0). It ran:

| Command | Working directory | Exit |
| --- | --- | --- |
| `node tools/cli.mjs validate` | digital-twin | 0 |
| `node tools/cross-language.mjs` | digital-twin | 0 |
| `node tools/types.mjs --check` | digital-twin | 0 |
| `node --test --test-reporter=tap validation/tests/attestations.test.mjs validation/tests/audited-semantics.test.mjs validation/tests/hash.test.mjs validation/tests/schema.test.mjs validation/tests/semantic.test.mjs` | digital-twin | 0 |
| `pnpm test:unit` | picarx-companion | 0 |
| `pnpm typecheck` | picarx-companion | 0 |
| `pnpm content:check` | picarx-companion | 0 |
| `pnpm package:check` | picarx-companion | 0 |

Cross-language command runs uv run --locked python validation/hash-python.py <absolute vectors path> and cargo run --locked --quiet --manifest-path validation/hash-rust/Cargo.toml -- <absolute vectors path> from digital-twin. The explicitly required Rust conformance harness is the only compiler invocation; no app/native build or CAD command ran. App typecheck is the existing noEmit check. Node v26.8.2, pnpm 10.33.2, uv 0.12.15, Rust 1.96.1 and Python 3.14.7 were actually used; exact canonicalizer versions are pinned in the three locks and cross-language report.

| Final test category | Count / result |
| --- | --- |
| tests | 253 |
| passed | 253 |
| failed | 0 |
| schemaMeta | 43 |
| auditedShapeProbes | 63 |
| auditedExamples | 9 |
| auditedSemanticFixtures | 21 |
| m1Positive | 26 |
| m1Negative | 60 |
| hashAcceptedPerLanguage | 7 |
| hashRejectedPerLanguage | 16 |
| companionUnit | 40 |

253/253 Node tests, zero failures/skips/todos. Categories overlap where a conformance/rule test has multiple assertions; category subtotals are not a separate total. M1 positives 26 and negatives 60, 43 schema meta checks, 63 active audit shape probes, nine audit examples and 21 finite audited semantic fixtures. All seven accepted and sixteen rejected vectors agree across JavaScript canonicalize 2.1.0, Rust serde_json_canonicalizer 0.3.2 and Python rfc8785 0.1.4. Canonical UTF-8 bytes/domain hashes match, with Unicode UTF-16 order, number/exponent behavior, ordered versus set arrays, safe integers and strict rejection. Large ordinary numbers follow IEEE-754 parsing without relaxing count/revision guards. Raw SHA-256/Git blob identity remain distinct. All 40 companion unit tests, generated-type drift/noEmit, 662-source content check and existing safe-mirror/dist package check PASS. Existing application/native source bytes remain accepted M0; no browser/native build qualification is claimed.

During implementation, failing draft tests exposed Python integer -0 sign loss and a Rust lone-surrogate error classification; both were repaired while preserving rejection semantics. The first Rust lockfile command ran before a target existed and failed; adding the requested harness target fixed it. A misplaced nested authoring directory was corrected before any commit. Ledger review also corrected the draft FFC/FPC variant allocation and added a regression mutant. These drafts are not acceptance artifacts; final bound logs show only the current complete run, and no failed gate was used for acceptance.

## Gate statuses and scope

| Scope | Status | Meaning |
| --- | --- | --- |
| M0 mandatory A–G | PASS | Accepted local baseline |
| G-DATA | PASS | All 21 required M1 check groups, exact bytes bound |
| M1 schema/semantic/hash/regression | PASS | 253 M1 tests + 40 companion tests |
| Owner physical stock | BLOCKED | NOT OBSERVED: Q-01/Q-13 |
| Metric/electrical/physical engineering admission | BLOCKED | 17 open Q records and both source conflicts persist |
| CAD_TOOLING_BOOTSTRAP/native qualification | BLOCKED | Existing future prerequisites; not M1 gate inputs |
| M2 graph / 3D / CAD / migration in M1 | NOT APPLICABLE | Outside M1; not implemented |
| Final M1 checks | FAIL: none | No remaining mandatory failure |

## Git closure and rollback

Stage only named intended M1 paths after git status --short, git diff --check, git ls-files digital-twin/evidence/private and private/public/staged checks. Inspect git diff --cached --name-only, --stat and --check. Commit locally with: M1: establish canonical digital twin data contracts. Record the actual acceptance SHA in a subsequent documentation-only receipt/handoff commit; a commit cannot safely contain its own SHA. No push/PR/remote change.

Rollback boundary is the additive M1 commits -> 2a934710501d71aecbd8da827925c92e49378661; no live assembly session depends on these records, and legacy picarx.v1 was not migrated or reinterpreted. Inspect git status first, retain later/unrelated work, and use git switch --detach 2a934710501d71aecbd8da827925c92e49378661 to inspect/run accepted M0 without rewriting history or removing ignored evidence. For a history-preserving branch rollback, revert the documentation receipt then the accepted M1 commit after reviewing their exact changes. Do not reset/delete the private vault. Keep m1-canonical-data recoverable.

M2 may begin only when this exact G-DATA PASS remains current and accepted M1 contracts are committed locally. HANDOFF_M2.md records the actual acceptance SHA and bindings and requires a fresh preflight. Stop after M1 closure/handoff; no M2 implementation is authorized within this session.

## Local acceptance receipt

- M1_ACCEPTED_SHA: 22c85058f9420aaaaf376c5e312915f5b7b5288d
- Exact acceptance subject: M1: establish canonical digital twin data contracts.
- 118 named intended text/source files committed; all 124 G-DATA bindings matched index bytes before commit.
- git status --short after acceptance: empty; ignored private originals/cache/targets remain local.
- M2 authorization: **YES**, contingent on fresh next-session verification of these accepted bindings.
- HANDOFF_M2.md contains actual accepted SHA and exact source/schema/evidence/model/validator/hash-policy/vector/report identities. No M2 code was written.
- This receipt/handoff is a subsequent documentation-only commit; it does not change the accepted M1 contracts or gate bytes.
