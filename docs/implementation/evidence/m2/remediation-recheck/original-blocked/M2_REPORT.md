# M2 stopped at the location-write contract

Date: 2026-09-29, America/New_York. **G-GRAPH: BLOCKED. M3 authorization: NO.**

M0/M1 verification passes. M2 implementation stopped on a normative ambiguity, as required by HANDOFF_M2.md section 2: “Contract revision or factual ambiguity is a stop-and-report condition.” No reducer, compiler, canonical graph declarations or M3 code were authored. This is a diagnostic closure, not M2 acceptance.

## Checkpoint and Git

- M0_BASELINE_SHA / M1_START_SHA: `2a934710501d71aecbd8da827925c92e49378661`.
- M1_ACCEPTED_SHA: `22c85058f9420aaaaf376c5e312915f5b7b5288d`; exact subject independently verified: `M1: establish canonical digital twin data contracts`.
- Initial branch: `m1-canonical-data`; initial HEAD: `fd8e954eaf731af95cf117b8ea4227fab88a12c7`; initial tracked/staged/untracked status and diff were empty.
- Both required ancestry checks passed. The only accepted-M1 descendant is `fd8e954eaf731af95cf117b8ea4227fab88a12c7`, a documentation receipt adding HANDOFF_M2.md and appending the M1 acceptance receipt to M1_REPORT.md. No production change was adopted from that descendant.
- M2_START_SHA: `fd8e954eaf731af95cf117b8ea4227fab88a12c7`.
- M2_BRANCH: `codex/m2-semantic-graph`, created locally from that clean checkpoint.
- M2_ACCEPTED_SHA: unavailable. No commit, staging, push, PR or remote write occurred.

## Independent M0/M1 verification

The repeatable [preflight verifier](evidence/m2/verify-preflight.mjs) writes only this attempt's [receipt](evidence/m2/preflight.json). All 124 accepted bindings match raw hashes, lengths **and accepted Git object bytes**. The 388 M0 manifest files and 118 original package allocations, including nine private photographs/crops, match their recorded hashes and lengths. The original private archive also matches. All seven M0 mandatory checks are PASS and m1Allowed is true. The documentary lock validates all 29 panels and all three variants; the bundled PDF raw and Git identities match separately.

`node digital-twin/tools/gate.mjs --check` exited 0 before authoring and again after diagnostics. The accepted M1 report was not regenerated or changed.

| Binding | Verified SHA-256 |
| --- | --- |
| M1_G_DATA_REPORT raw | `ddbdad1c00372e670b674bbc6d6bf2170b6f2b0d08a034b715e522029b644f0f` |
| schemaHash | `efc43a7ae4126687d5b0dadaf924494af619ffa1a3072323960e6ea75fbcf487` |
| evidenceHash | `e00e7825f413a37edeb3c9ac47611fbf790480d6efb71337b5cd219bfd082d5c` |
| modelHash | `0764cf8879767dbc31ae1b780ace239da88a6febf69ee51b0841dbac3df7c82a` |
| sourceLock raw | `3f715ec18946e022a1b5633a15e3b3ae3d31576e1fa378d77c375d61c291b06e` |
| semanticValidator raw | `c4488f9c37f437d8bd226c0a43a5fa795702a6cc6ec3481659d8032f4fb42609` |
| hashPolicy raw | `19530138a14bf148a03d7c1bc55985ab4490efde78d34a08e79209d35f6fcadd` |
| cross-language vectors raw | `653c300d75185a402a451dcb85a85e9cb6bbbea8841297dfe00d3a40ba66a9da` |

No adopted canonical delta exists. All baseline raw/model/evidence/schema identities remain unchanged. The accepted cross-language corpus/result bytes were verified; the Rust/Python harnesses were not rerun because there was no hash implementation, runtime or binding drift.

## Blocking ambiguity: installed location for non-fastener attachments

The controlling [SEMANTIC_CONTRACT.md](../digital-twin/SEMANTIC_CONTRACT.md) section 3, lines 23–44, says each operation **writes only** its listed surface. Its introduce row explicitly writes instance location `tray`. Its installFastener row explicitly assigns that fastener to `assembly`. The attachRigid row lists connection activation and solution selection; attachJoint lists connection activation and coordinates. Neither lists an instance-location write. The rivet, cable connection and consumable-application rows likewise omit an explicit installed-location transition. parentAssignments explicitly govern parent pointers and group membership; their paragraph does not specify a location transition.

S27 gives a concrete witness. [V40_ASSEMBLY_LEDGER.md](../digital-twin/V40_ASSEMBLY_LEDGER.md), lines 686–710, introduces two rear wheels and seats them on existing motor shafts, with **no additional fastener**. Accepted M1 owns `PX-V40-INS-WHEEL-REAR-001` and `PX-V40-INS-WHEEL-REAR-002`, both initially available, under `PX-V40-DEF-WHEEL-REAR`, componentClass `wheel`. That definition has no FastenerDefinition subtype. Thus introduce makes each wheel tray; the listed shaft-attachment and reparenting effects do not explicitly authorize changing its location to assembly. Using installFastener on the wheel, adding a screw/rivet, or starting the wheel preinstalled would contradict its typed identity/source step.

This is an **underspecified contract**, not proof that attachment intent or geometry is unknowable. An implicit location update may have been intended. Conversely, a connected instance might intentionally retain a tray location while installation is counted from connections/membership. The frozen authorities do not resolve that choice or define its inventory/reconciliation policy. Either choice affects stockDispositionHash, stateHash and expected prefixes, so choosing it silently would author normative semantics during implementation. A source photograph cannot settle a software write policy.

Required ruling: specify the exact per-tag location write set and affected-instance selection for non-fastener installations, or explicitly define the permitted meaning and reconciliation of tray locations with active attachments/assembly parents. Distinguish newly installed instances, already installed/reused endpoints, owned lead elements, staged consumable pieces and mechanical groups. Reparenting must not infer physical installation unless the ruling explicitly says so. Align the write table, compiler invariants and inventory acceptance with that ruling. No change to the frozen contracts was made here.

## Actual checks

| Command | Working directory | Exit | Result |
| --- | --- | --- | --- |
| `node digital-twin/tools/gate.mjs --check` | repository | 0 | 124 bound bytes and identities current |
| `node docs/implementation/evidence/m2/verify-preflight.mjs` | repository | 0 | 124 M1 / 388 M0 / 118 allocation files; source/ancestry/privacy PASS |
| `node --test --test-reporter=tap digital-twin/validation/tests/attestations.test.mjs digital-twin/validation/tests/audited-semantics.test.mjs digital-twin/validation/tests/hash.test.mjs digital-twin/validation/tests/schema.test.mjs digital-twin/validation/tests/semantic.test.mjs` | repository | 0 | 253 tests PASS; 0 failures/skips/todos |
| `node digital-twin/tools/types.mjs --check` | repository | 0 | Both generated contract files match schemas |
| `pnpm test:unit` | picarx-companion | 0 | 40 tests / four files PASS |
| `pnpm typecheck` | picarx-companion | 0 | Existing noEmit checks PASS |
| `pnpm content:check` | picarx-companion | 0 | 662 locked inputs PASS |
| `pnpm package:check` | picarx-companion | 0 | Existing safe mirror/dist bytes and exclusions PASS |

The first diagnostic verifier invocation failed with ERR_MODULE_NOT_FOUND because its relative imports went up five directories instead of four. Its exit was 1. The import/root paths were corrected; the subsequent complete verifier exited 0. The initial failure log is retained and is not an upstream gate failure. No production defect was found or repaired. Raw command outputs, test corpus bytes and final verification receipt are bound in [M2_G_GRAPH_REPORT.json](M2_G_GRAPH_REPORT.json). Reports exclude their own raw hashes. No app/native build, Python task script, development server, geometry or hardware command ran.

## Coverage and unavailable acceptance artifacts

| Scope | Outcome |
| --- | --- |
| rpi4 / rpi5 / rpi-zero-2-w compiled graphs | BLOCKED: 0 produced |
| Complete 29×3 step boundaries | BLOCKED: 0/87 executed |
| M2 operation count / forward and serialized inverse corpus | Unavailable: no operations authored |
| Initial/final/prefix/state/stock/graph-input hashes | Unavailable: no graph acceptance artifacts |
| Independent fresh-process M2 replay and reverse-to-initial | BLOCKED: not implemented or run |
| M2 branch/quantity/consumable/ownership/cable/group/zeroing/patch/sensitive-mutation proofs | BLOCKED: not implemented or run |
| G-DATA/M1 inventory/reference/uncertainty tests | PASS: existing baseline only |
| G-GRAPH | BLOCKED: no partial PASS or M3 authorization |

Baseline M1 retains 19 hardware rows, 76 primary + 37 backup = 113, Pi4/Pi5 planned use 72 and Zero2W 70, all 159 broader identities and 477 dispositions, the five unresolved multiplicities, six owned integral leads and five loose cable definitions. Those remain M1 facts, not newly proved M2 final-state accounting. Owner stock remains BLOCKED / NOT OBSERVED under Q-01/Q-13. Both OPEN camera-dimensions and ultrasonic-supply conflicts and all 17 OPEN Q records remain unchanged. Q-15/Q-16 tool/native prerequisites and unknown geometry did not cause this stop. No confidence or mechanical/electrical/physical capability was promoted.

## Preserved work and rollback

Only M2 diagnostics were added: this report, the single blocked gate report, HANDOFF_M2_REMEDIATION.md, and evidence/m2 (preflight verifier/receipt and actual command logs). All production files, accepted reports, private originals and legacy picarx.v1 are unchanged. Nothing is staged. Tracked status stays clean; diagnostic files are untracked and intentionally preserved. No M2 acceptance commit is permitted while G-GRAPH is blocked.

HEAD remains M2_START_SHA. To return to the prior branch, switch to m1-canonical-data; these untracked diagnostics follow the checkout and should be retained until reviewed. There are no M2 commits to revert. Do not reset/delete private evidence or runtime state. If discarding diagnostics is later authorized, remove only the named files created in this attempt after checking for intervening work.

Next session: use [HANDOFF_M2_REMEDIATION.md](HANDOFF_M2_REMEDIATION.md). It preserves the complete original M2 assignment and requires resolution of the location policy before implementation. HANDOFF_M3.md was not produced because no accepted M2 artifacts or SHA exist.
