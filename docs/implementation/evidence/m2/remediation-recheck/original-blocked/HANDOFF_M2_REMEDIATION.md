# M2 remediation — resolve non-fastener location semantics first

You are the remediation agent for M2 of scalinity/PiCar, repository /Users/danny/Documents/Apps/PiCar. M2 is **BLOCKED**, not accepted. M3 authorization is **NO**. Do not implement M3, push, open a PR, change remotes, alter private evidence or invent geometry.

Read docs/implementation/M2_REPORT.md, M2_G_GRAPH_REPORT.json and evidence/m2/preflight.json, then the complete original M2 assignment below. It remains binding except that its unconditional next implementation step is suspended pending the contract ruling described here.

Checkpoint: M0_BASELINE_SHA and M1_START_SHA = 2a934710501d71aecbd8da827925c92e49378661; M1_ACCEPTED_SHA = 22c85058f9420aaaaf376c5e312915f5b7b5288d; M2_START_SHA and current HEAD = fd8e954eaf731af95cf117b8ea4227fab88a12c7; current branch = codex/m2-semantic-graph. Initial checkout was clean. The only descendant of accepted M1 is the documentation receipt/handoff commit. No M2 implementation or acceptance commit exists. Only untracked diagnostic reports and command evidence were added; preserve them and all intervening owner work.

Previous fresh verification: G-DATA --check PASS; all 124 bound hashes/lengths and accepted Git object bytes match; all 388 M0 files and 118 package allocations match; original archive/private binaries and 29 source panels/three variants verify; M0 A–G PASS/m1Allowed true. Fresh M1 tests 253/253, companion tests 40/40, generated-type/noEmit/content/package checks PASS. This is upstream verification only. No M2 graph, operation, step-prefix, state/stock hash or replay/inverse proof exists. Do not convert these prior results into current acceptance without rerunning preflight.

First independently check branch, HEAD, staged/untracked status, diff/check and required ancestry. Rerun node digital-twin/tools/gate.mjs --check and verify the exact bindings in the original assignment against accepted M1 objects. The diagnostic verifier is a reusable read-only check that writes only its own receipt; it assumes HEAD remains the M2 start checkpoint. Inspect it before reuse and account explicitly for any later Git descendant. Preserve the accepted M1 report; do not silently regenerate it. Verify private files remain ignored, untracked and absent from public output.

Resolve this exact normative ambiguity before authoring any reducer or graph: docs/digital-twin/SEMANTIC_CONTRACT.md section 3 says each operation writes only its listed surface. introduce explicitly sets locations to tray; installFastener explicitly assigns its fastener to assembly. attachRigid, attachJoint and parentAssignments do not explicitly specify instance-location changes. The rivet, cable-end and consumable-application rows similarly leave installation-location effects unspecified. S27 introduces two rear wheels and seats them on existing motor shafts with no added fastener. The accepted rear-wheel definition is componentClass wheel and has no FastenerDefinition subtype. Its location transition after introduction therefore needs an authoritative rule; it cannot be implemented by pretending the wheel is a fastener or adding hardware.

Obtain an explicit owner/integration-contract ruling that defines the exact per-tag location write set and affected-instance selection, including newly installed items, already installed/reused endpoints, integral lead owners, consumable pieces and group membership. Alternatively, the ruling may explicitly permit tray locations with active assembly attachments and specify how installed inventory is reconciled. Do not choose either interpretation silently. Determine whether the ruling merely clarifies v2 or requires an authorized contract revision. Do not weaken schemas or supply arbitrary location defaults. If a ruling is unavailable, preserve diagnostics, retain G-GRAPH BLOCKED/M3 NO, and stop with the exact required clarification.

After an authorized ruling, record its provenance and exact contract/validator/hash-policy deltas. Revalidate affected G-DATA and adopted identities; bind changed records to new hashes rather than baseline hashes. Retain original accepted evidence/history. Then implement the complete original M2 assignment: all 29 source steps for exactly rpi4, rpi5 and rpi-zero-2-w; one pure TS compiler/reducer; all 17 supported atomic families and serialized inverse fixtures; complete typed registry and initial state; exact inventory, ownership, endpoints, cables, conditions, groups, variants and hashes; all 87 step boundaries and every operation prefix in an independent fresh process; all specified sensitive mutants and regression checks. Unknown geometry/electrical/physical claims remain BLOCKED. A partial graph cannot pass.

Local named staging/commits remain authorized only under the original conditions. Commit the complete M2 implementation only after exact G-GRAPH PASS; then record M2_ACCEPTED_SHA and generate the complete M3 handoff from actual accepted artifacts, with the full next-session prompt in the response. Otherwise update the single M2_G_GRAPH_REPORT.json and this remediation handoff; no misleading complete commit or M3 authorization. Do not run app/native builds, Python task scripts, hardware commands or add useEffect. Stop after M2 closure and the appropriate handoff.

## Complete original M2 assignment

You are the implementation agent for M2 of scalinity/PiCar: M2 — Compile the complete reversible 29-step V40 semantic graph.

Implement M2 ONLY. Independently verify the accepted M1 checkpoint before beginning. Do not implement M3. Finish with the complete M2 closure report and a full copy-ready M3 kickoff prompt derived from actual accepted M2 artifacts. No push, PR or remote changes. Local branches and commits are authorized.

Repository: /Users/danny/Documents/Apps/PiCar.

ACCEPTED STATE AND EXACT BINDINGS

M0_BASELINE_SHA = 2a934710501d71aecbd8da827925c92e49378661
M1_START_SHA = 2a934710501d71aecbd8da827925c92e49378661
M1_BRANCH = m1-canonical-data
M1_ACCEPTED_SHA = 22c85058f9420aaaaf376c5e312915f5b7b5288d
M1 commit subject = M1: establish canonical digital twin data contracts
G-DATA = PASS; 253/253 M1 tests and 40/40 companion unit tests; 124 exact file bindings.
Specification = audited v2 / contractVersion 2, Z0104V40.
Audited archive raw SHA-256 = 7a01cc81d68e2a12c641e9d3dfe0b00636476dee1df8de17e442cc127178b411.
schemaHash = efc43a7ae4126687d5b0dadaf924494af619ffa1a3072323960e6ea75fbcf487
evidenceHash = e00e7825f413a37edeb3c9ac47611fbf790480d6efb71337b5cd219bfd082d5c
modelHash = 0764cf8879767dbc31ae1b780ace239da88a6febf69ee51b0841dbac3df7c82a
sourceLockRawSha256 = 3f715ec18946e022a1b5633a15e3b3ae3d31576e1fa378d77c375d61c291b06e
semanticValidatorRawSha256 = c4488f9c37f437d8bd226c0a43a5fa795702a6cc6ec3481659d8032f4fb42609
hashPolicyRawSha256 = 19530138a14bf148a03d7c1bc55985ab4490efde78d34a08e79209d35f6fcadd
vectorsRawSha256 = 653c300d75185a402a451dcb85a85e9cb6bbbea8841297dfe00d3a40ba66a9da
model-input raw SHA-256 = b42c92fc550b6f5a5a36f88abafbaa208f3b6db3d63e3033bac749d8894e17f8
evidence-input raw SHA-256 = f1bbfb9ef0ac256a0cb9c6fbf9d3a3a0fc583c72dae6c4ba800cdb1ce5779c18
M1_G_DATA_REPORT raw SHA-256 = ddbdad1c00372e670b674bbc6d6bf2170b6f2b0d08a034b715e522029b644f0f
M0 documentary lock raw SHA-256 = 8ca58014ece62abf765ebdbd767d72611d69eaac39440e06b78769505fd6d0b3
V40 PDF raw SHA-256 = 2f4ea3ae3729bfb6bc92f8fdba30f31937f9df2c3a80e5774ef03fb076f386ce.
V40 PDF Git blob SHA-1 = 85c752c505c2a52bf82900111fd3a31c6ad0f9d8.
Planning seed raw SHA-256 = f9d90846627c658ef1856cb880eb140f5525c9f6149761a5cb2851db7f2c6304.
Printed ledger raw SHA-256 = b23342d414fba85574cb2d32338c3158d65f63c27561c620cd348855c2b7160d.
Raw hashes, semantic domain hashes and Git identities are distinct.

1. MANDATORY GIT / M1 PREFLIGHT

Record git branch --show-current, git rev-parse HEAD, git status --short, git diff --stat and git diff --check. Inspect any staged/untracked work. Do not discard or overwrite unrelated changes. HEAD may include the documentation receipt/handoff commit after M1_ACCEPTED_SHA; inspect and classify every descendant change. Do not assume HEAD equals the original pre-M0 baseline or the acceptance commit.

Verify git show 22c85058f9420aaaaf376c5e312915f5b7b5288d exists, has the stated subject and contains the accepted production contracts and M1_G_DATA_REPORT.json. Verify git merge-base --is-ancestor 2a934710501d71aecbd8da827925c92e49378661 22c85058f9420aaaaf376c5e312915f5b7b5288d and git merge-base --is-ancestor 22c85058f9420aaaaf376c5e312915f5b7b5288d HEAD. Read docs/implementation/M1_REPORT.md, M1_G_DATA_REPORT.json, M0_REPORT.md, M0_CHECKPOINT_VERIFICATION.json, M0_GATE_REPORT.json, M0_CAD_TOOLING_RECEIPT.md and docs/digital-twin/SPEC_PACKAGE_RECEIPT.md. Verify M0 A–G PASS/m1Allowed true and M1 G-DATA PASS; do not trust prose alone.

Run node digital-twin/tools/gate.mjs --check from the repository root. Verify the report raw hash above, all 124 bound bytes/lengths and actual schema/evidence/model identities. Confirm the working tree's bound files equal the accepted commit's versions, or explicitly stop and report drift before adopting them. Run the locked M1 tests/type-drift checks if runtime dependencies are missing or there is unexplained test/environment drift. Install only the already pinned authoring dependencies when needed. The full gate writes regenerated logs/results; preserve its accepted report and inspect changes rather than silently adopting a new hash.

Verify git ls-files digital-twin/evidence/private returns nothing; actual photographs/crops/archive remain locally present and git check-ignore -v succeeds for their recorded paths. Check no private bytes under picarx-companion/public/ and nothing private/cache/runtime-state/local-secret/CAD is staged. Preserve owner's originals. No external source candidate or private artifact becomes public through graph compilation.

If M0/M1 mandatory acceptance fails, a binding drifts, or the accepted checkpoint cannot be verified: STOP before M2 implementation and return an exact remediation report. CAD/tooling/native prerequisites alone are not M2 semantic blockers.

Create local branch codex/m2-semantic-graph from the verified current clean descendant of accepted M1. Record M2_START_SHA and M2_BRANCH. If the branch exists, inspect it and reuse only intended M2 work based on this checkpoint; do not overwrite unrelated work. No remote write.

2. READ THE ACTUAL AUTHORITIES AND M1 INPUTS

Read the M2 sections of docs/digital-twin/MILESTONES.md, MILESTONE_REVIEW.md and GATE_CONTRACTS.md, plus ASSEMBLY_ENGINE_SPEC.md, SEMANTIC_CONTRACT.md, HASH_AND_PACK_CONTRACT.md, DIGITAL_TWIN_DATA_MODEL.md, V40_ASSEMBLY_LEDGER.md, BOM_RECONCILIATION.md, REPOSITORY_CHANGE_MAP.md, VERIFICATION_AND_TEST_PLAN.md and OPEN_QUESTIONS_AND_BLOCKERS.md. Read the full ledger/source panels for each operation, not just the titles below. Inspect the production v2 schemas, especially AssemblyOperation tagged payloads, AssemblyStep, CompiledGraph, AssemblyState, OperationUndo, MechanicalConnection, CableConnection, NumericValue, Endpoint, VariantPatch, VerificationRule, ProcedureAcknowledgment, ZeroingAttestation and RuntimeRegistry. HISTORICAL is not active.

M1 canonical paths:
- digital-twin/schemas/: 41 unchanged audited active schemas + inventory/report schemas + semantic registry descriptor.
- digital-twin/components/inventory/registry-index.json: one owner path per current canonical family.
- components/definitions/{parts,fasteners,cables,geometry-sources}.json; instances/planned-stock.json; measurements/{measurements,derivations}.json; interfaces/{mechanical,connection-points,frames,verification-rules}.json, all under digital-twin/.
- components/inventory/{lots,allocations,planned-uses,printed-hardware,unresolved-allocations,variants,planning-steps,tools}.json.
- evidence/records/{evidence,claims,blockers,blocker-source-records,warnings}.json; evidence/conflicts/conflicts.json; evidence/sources.lock.json.
- tools/evidence/{semantic,hash,identity,allocate}.mjs and sum-v1.json; tools/{cli,types,cross-language,gate}.mjs; hash-inputs.json.
- validation/{model-input,evidence-input,typed-reference-index,unresolved-impact,printed-inventory-report,schema-semantic-report,hash-cross-language-report}.json; tests/; fixtures/; independent hash-rust and hash-python harnesses; actual command logs.
- picarx-companion/src/generated/twin/{contracts,inventory}.d.ts: generated read-only contract types.

M1 has 27 evidence, 117 claims, 61 definitions, 159 planned identities, 118 measurements, 61 interfaces, 31 connection points, 22 fastener subtypes, 11 cable subtypes, 19 derivations, 61 lots, 477 per-variant dispositions, 214 hardware-use IDs, 19 quantity rules and 5673 closed typed references. All 29 planning steps are NON_EXECUTABLE. M1 did not implement a reducer, graph, storage migration, geometry or renderer. Do not run allocate.mjs blindly during M2: it replaces its M1 canonical outputs.

Preserve accepted M1 history and source scope. M2 may author necessary source-backed graph declarations and named rule/condition/group/connection/feature registries. If that necessarily changes a canonical mechanical input, record the exact delta, keep original evidence/history, recompute model/upstream identities and revalidate affected G-DATA checks; never bind changed records to the old modelHash. Report both baseline and adopted input hashes. Contract revision or factual ambiguity is a stop-and-report condition; do not weaken schemas or add a competing manual TypeScript truth model.

3. STRICT M2 SCOPE AND TARGET PATHS

Implement canonical source-backed steps/operations/connections/variant patches, complete named replay registries, one pure TypeScript assembly reducer and compiler, serialized-state/inverse/reference tests, step/part search-index contract, graph identities and G-GRAPH reports. Primary paths:
- digital-twin/assemblies/v40/{steps,operations,connections,variants,presentation}/
- digital-twin/tools/compiler/
- picarx-companion/src/domain/assembly/
- digital-twin/validation/ and domain test fixtures
- docs/implementation/M2_REPORT.md and M2_G_GRAPH_REPORT.json

Use generated schema types. Keep source identities case-sensitive ASCII and independent of filenames/array positions/display labels/renderer IDs. Every known reference has exactly one typed owner. Resolve every graph/registry/state dependency from its bound artifacts; no hidden lookup database, inferred endpoint, synthesized missing record or global mutable inventory.

No M3 routing/UI/session persistence, SQLite/IndexedDB migration, legacy picarx.v1 reinterpretation, hardware actuation/Raspberry Pi commands, Three.js/Fiber, CAD, guessed geometry, STEP/GLB publication, Blender timelines, new physical captures or real zeroing actions. No renderer required for tests. Do not add useEffect. No app/native build/compile commands: use pure domain tests and existing noEmit checks. The already-authorized narrow cross-language hash conformance harness may be reused when needed; Python is solely that harness, never a file-edit/task scripting tool. No dev-server/browser setup is needed for M2 pure logic.

4. COMPLETE 29-STEP × THREE-VARIANT COVERAGE

Compile exactly rpi4, rpi5 and rpi-zero-2-w, each with original printed numbers 01–29 in order:
01. Prepare Plate A mounting supports
02. Mount the selected Raspberry Pi
03. Connect the Pi end of the camera ribbon
04. Mount the Robot HAT
05. Install the two drive motors
06. Prepare battery hook-and-loop mounting
07. Secure and connect the battery
08. Attach the pan horn to the front chassis
09. Install the ultrasonic module and Plate H
10. Fit the two front support standoffs
11. Connect the camera end of the ribbon
12. Mount the camera on Plate C
13. Attach the tilt horn to Plate C
14. Install the pan servo on Plate B
15. Install the tilt servo on Plate B
16. Route the camera ribbon through the gimbal gap
17. Introduce the servo-zeroing procedure
18. Mate the camera/Plate-C assembly to tilt
19. Mate the pan-tilt assembly to the chassis
20. Install the steering servo
21. Connect Plate G to the steering horn
22. Attach the steering horn assembly to its servo
23. Install Plate D on the front supports
24. Attach the grayscale module to Plate D
25. Install right and left front wheel carriers
26. Install the front wheels
27. Fit the rear wheels to motor shafts
28. Connect the sensor ends of their cables
29. Complete the Robot HAT wiring

Each step binds actual locked source panel/evidence, prerequisites, explicit introduced/reused instances and hardware, connection intent, orientation, tools, cable/zeroing conditions, ordered suboperations, checks and blockers. Setup OS/software guidance stays outside these 29 steps. Safety/zeroing suboperations use stable operation IDs, never invented steps 30–32. Empty/filler graphs or testing only a few operation families cannot pass.

Preserve explicit branches in S01–S04. Pi4/Pi5 S01 use four M2.5x18+6 supports and S02 four M2.5x18; Zero2W S01 uses two M2.5x30 and two M2.5x11, S02 two M2.5x18+6. S01 and S04 each use four M2.5x6 screws in every branch. Pi4 camera ribbon is FFC; Pi5/Zero2W are FPC. Zero2W microphone remains an accessory without invented adapter installation, and Q-14/header readiness remains explicit. Variant selection is exact, never a generic Raspberry Pi substitution.

VariantPatch has one stable patch ID, variantId and stepId. At most one per step/variant; replacement is a nonempty contiguous ordered span of the base operations. Empty withOperationIds removes that span; insertion retains an explicit anchor in the replacement. Reject overlaps, discontiguity, dangling operations, wrong branch use and active/inactive intersection. Preserve all 29 resolved steps and deterministic patch order.

5. EXACT ATOMIC FORWARD / REVERSE SEMANTICS

Implement compileGraph, projectPrefix, applyOperation and undoOperation as pure functions using audited tagged payloads and the SEMANTIC_CONTRACT write/guard table. The 17 tags are:
- introduce: allocated item to tray; no attachment; reject duplicate introduction.
- attachRigid: activate declared fixed connection, select operation solution for affected instances.
- attachJoint: activate connection and explicit qualified joint coordinates; preserve other DOF.
- installFastener: spend one identified fastener in the authored ordered contact stack and parent; reject another concurrent use.
- insertRivet / lockRivet: place owned body then lock owned pin of the same purchased instance; require inserted body before locking.
- connectCableEnd / disconnectCableEnd: add/remove exactly one declared endpoint connection, enforce exclusive port/endpoint identity.
- routeCable: replace ordered qualified guide endpoints, representation and common solution reference; preserve connected ends.
- allocateConsumable / applyConsumable: activate a predeclared child piece and exact source-lot amount, then require allocation and activate intended connection.
- acknowledgeProcedure / confirmZeroing: add required condition IDs only; never create physical attestations.
- groupSubassembly: explicitly reparent listed members into an already-declared group; preserve identity and reject cycles.
- moveSubassembly: select the operation's common solutionRef, preserving membership/connections/cables; no competing payload solution.
- setJointReference: update one (connectionId,dof) from its Measurement with compatible mm/rad units.
- removeOwnedBacking: mark the owned element removed, update active subset, preserve its owner/washer identity.

Validate all guards before any write. Each operation has explicit parentAssignments; empty means no reparenting. Update membership and parent pointers together. No nearest-object inference, runtime UUID/time, renderer coordinate, mutable external Map or session acknowledgment participates in projection. Do not force every tag into the source graph when no source-backed operation requires it; prove each supported family with appropriate fixtures.

OperationUndo is the full immutable beforeState + operationId + expectedAfterHash. Undo verifies current hash and top-of-stack operation, restores exact serialized prior state and recomputes stock/state hashes. Reject stale/wrong-state/non-top undo. Jump-to-step recomputes from initialState, not partial hidden inverse patches. Independently replayed prefixes are the authority; snapshots are caches. Digital rewind does not claim adhesive/rivet/power tasks are physically safe or reversible.

6. COMPLETE SERIALIZED STATE / INVENTORY / OWNERSHIP

CompiledGraph.initialState declares every accounted instance, lot, owned-element state, semantic group/parent forest and empty/pre-existing mutable collection. AssemblyState includes all instance locations/parents/owned states; active mechanical connections; active cable-end connections; ordered cable routes; consumable lot capacity and allocations; subassembly members/parents/solutionRefs; qualified joint coordinates; requiredConditionIds; completed operation prefix and hashes. Serialize/reparse states AND undo records. Null means no semantic parent, never unknown pose.

Every instance and assembly has at most one direct parent; membership forest acyclic, member lists and parent pointers exactly agree. Mechanical constraint graph remains separate and may contain loops. All groups and parent relationships are declared initially; grouping cannot create a group at runtime. Connected gimbal/camera moves keep the same ribbon/endpoints.

Printed hardware: 19 rows, 76 primary + 37 backup = 113. Pi4/Pi5 use 72 with four primary unused and 37 backups; Zero2W uses 70 with six primary unused and 37 backups. Broader 159 identities also include user-board alternatives, accessories/tools and consumable lot/child identities; they are not observed owner stock. Preserve 477 variant dispositions and source-scoped use allocations; track backup, unused-variant, accessories and tools rather than silently dropping them. The five unresolved package/repeated-cable multiplicities remain explicit. Actual inventory equality stays BLOCKED / NOT OBSERVED (Q-01/Q-13).

Owned element key is (instanceId,elementId). Rivet body/pin is one stock item, pin is not another rivet; backing removal is not another washer. Six integral cable records attach to their parent servo/motor/battery definition with owned lead element and parent-instance endpoints; no separately supplied lead instance. Five loose cable definitions remain distinct. If the schema's cableInstanceId identifies an integral lead, resolve the parent owner and its declared element/endpoints explicitly; do not duplicate stock to satisfy a lookup.

Consumable pieces have authored stable IDs, start inactive/available, and retain source-lot allocations. Existing hook/loop child pieces are preallocated for S06. Unknown length/capacity remains a NumericValue unresolved object; symbolic replay is allowed but quantitative conservation is BLOCKED. Known same-unit nonnegative allocations cannot exceed known capacity; count cannot substitute for mm. Reject duplicate allocation/application, double fastener use, orphan inventory, incompatible branch hardware and owner-element double counting.

7. PHYSICAL ENDPOINTS / CABLES / HUMAN CONDITIONS

Every physical mechanical placement/guide/motion/focus endpoint is {instanceId,interfaceId}; prove definition ownership. Bare reusable definition-local interfaces cannot identify a physical copy. Electrical CableConnection resolves cable owner, endpointLabel, targetInstanceId and correct connectionPointId; unresolved pin mapping/keying/supply remains explicit. Joint coordinates are keyed (connectionId,dof); reject duplicate, fixed-joint, undeclared-DOF, cross-instance and wrong-unit coordinates.

Preserve S03 one Pi-end connection, S11 other end of the SAME ribbon and S16 route through the gimbal gap. S07 battery integrated lead to HAT BATTERY port. S28 connects sensor ends only: 4-pin ultrasonic and 5-pin grayscale, HAT ends free until S29. Routes use ordered qualified guides and labeled schematic representation while metric length/bend/path remains unresolved.

S17 declares printed power/ZERO/P11 preparation. S18 tilt, S19 pan and S22 steering each require fresh role/servo/operation-scoped zeroing and power/procedure condition identities. Temporary P11 occupancy is exclusive to one servo at a time, explicitly disconnected after its zeroing suboperation and absent in the S29 final state. Final printed roles: pan P0, tilt P1, steering P2; MOTOR1 left and MOTOR2 right; ultrasonic D2/D3 and grayscale A0/A1/A2 with printed 3V3/GND. Preserve the generic ultrasonic 5 V conflict; do not synthesize a new certified supply or pin map.

Pure projection records requirements without executing physicalCommand/engineering checks, generating acknowledgments, consuming attestations, incrementing servo epochs or touching storage. Register typed predicate/version/phase/operand/comparator/unit/target/dependency rules and source procedure revisions. Future attestations bind session/variant/model/graph/rule/procedure/servoEpoch/validForOperationId. Persistence, consumption/idempotent physical commands and epoch invalidation are M3. Reference replay/reverse never requests powering the robot. Missing engineering proof is BLOCKED, not a zero-valued coordinate or automatic PASS.

8. AUDIT-SENSITIVE MUTATIONS AND UNKNOWN FIREWALL

Prove positive behavior and rejecting mutants for:
- S10: exactly two M3x26 supports and two M3x6 screws; the same supports reused by S23 with two further screws.
- S19: Washer A, correct pan horn/retainer stack, correct zeroing scope; Washer B substitution rejects.
- S21: G-to-steering-horn revolute/free rotation with correct connection-qualified DOF; rigid weld/undeclared or conflicting joint state rejects and S22 preserves freedom.
- S25: Plate E RIGHT and F LEFT, six R3065 (three per side), source-backed A/D/G/carrier incidence; swapping/duplicating handed identities rejects. Unknown exact axes/contact incidence remain explicit until geometry admission; if even factual semantic intent is unknown, report that scoped blocker rather than inventing it.
- S26: two front wheels, six Washer B (three each), two R30185, owned backing removal where source requires; five washers, extra rivet pin stock or front/rear substitution rejects. Unknown exact axial contact order is not guessed as admitted geometry.
- S27: rear wheels belong to chassis/rear-drive on their existing left/right motor shafts, never steering/front or a front-wheel rivet joint.
- S29: correct permanent port roles and no P11 occupancy; simultaneous zeroing occupants, wrong servo role, invented pin map or voltage-conflict closure rejects.

All numeric interfaces/frames/solution refs may remain typed unresolved; never use identity transforms, arbitrary XYZ, zero joint angles or default dimensions as real geometry. A passing reducer proves digital semantic consistency only. VERIFIED/DERIVED/PROBABLE/UNRESOLVED remain the only confidence values and maturity stays separate. Preserve source limitations and both OPEN conflicts: PX-CONFLICT-CAMERA-DIMENSIONS and PX-CONFLICT-ULTRASONIC-SUPPLY. Never promote generic HAT v4 or generic servo/motor/camera identities.

Current OPEN blockers:
Q-01 — Physical evidence scope versus nominal design
Q-03 — Exact structural plates A–H
Q-04 — Exact TT motor/gearbox identity and wheel shaft
Q-05 — Servos, horns, spline and retaining screws
Q-06 — Fastener standards, standoff ends, washers and opaque rivet codes
Q-07 — Robot HAT revision, ZERO control and connector map
Q-08 — Camera, ultrasonic and grayscale identity/dimension conflicts
Q-09 — Camera ribbons, loose cables, pin orientation and routing envelopes
Q-10 — Pi board/revision and limits of official mechanical sources
Q-11 — Battery, adhesive/tape and nonrigid envelopes
Q-12 — Front/rear wheel geometry and steering stack detail
Q-13 — Actual inventory, accessory-package stock and repeated cable illustrations
Q-14 — Zero2W microphone/header and accessory handling
Q-15 — Exact reproducible toolchain lock and binary distribution
Q-16 — Packaged Apple Silicon rendering, performance and native harness
Q-17 — Private evidence, upstream sensitive media and asset redistribution
Q-18 — Future camera calibration, pose registration and observability
Q-02 is resolved only by M0 documentary/PDF evidence. blocker-source-records.json preserves the original audit status and complete multi-milestone impact/ownership; blockers.json owns current status. Q-15 CAD-toolchain and Q-16 native/GPU qualification are later prerequisites, not reasons to fabricate or waive M2 proofs. Unknown geometry permits reference-semantic compilation; unknown factual identity/connection intent that prevents an honest graph is a G-GRAPH blocker.

9. GRAPH / STATE HASHES AND EXPLICIT INPUT CLASSIFICATION

Use the existing pinned RFC8785 JCS/UTF-8 foundation and H(kind,payload)=SHA256(UTF8("picar-v2:"+kind+"\n") || JCS(payload)). Strictly reject duplicate keys, nonfinite/negative-zero/lone-surrogate and unsafe count/revision inputs. Preserve authored step/operation/contact-stack/guide-route order; sort only contract-defined set-like IDs/record collections. Reuse cross-language vectors without weakening them.

Materialize a graph-input.json for EACH variant: selected variant, ordered resolved steps/operations, mechanical/cable connections, verification rules, semantic initialState and complete referenced operands/measurements/procedures/warnings/normative motion/path values copied by canonical value from the bound typed registry. IDs alone do not bind content. Keep stable solution IDs but exclude generated solution bytes. Remove exactly graphHash, modelHash, stateHash and stockDispositionHash from initial-state preimage; exclude compiled-envelope own graph/model hashes and appearance-only materials/camera preferences. H("graph", graph-input) yields selected-variant graphHash, not graphSetHash or raw artifact hash.

Recompute stockDispositionHash = H("stock", complete sorted instance ID/location/parent/owned-state + consumableLots + consumableAllocations). Then stateHash = H("state", complete AssemblyState omitting ONLY its top-level stateHash). Extend hash-inputs.json with exact M2 authored/generated families and stage/dependencies. Reject unclassified inputs, output-as-own-input, direct/transitive cycles and downstream identities in upstream artifacts. Keep model/schema/evidence bindings honest after any canonical delta. No CAD/mesh/pack artifact is generated merely to fill a downstream hash.

10. TESTS AND EXACT G-GRAPH ACCEPTANCE

Use one pure TS semantic implementation; no separate divergent browser/native reducer. Prove every operation forward then serialized undo returns the exact canonical prior state for every variant and every operation prefix. Test all 29 step boundaries × 3 variants (87), initial/full-final states, arbitrary operation prefixes and full reverse-to-initial. Serialize/reparse both states/inverses and launch an independent fresh process with only bound graph+registry inputs: all expected prefix/state/stock hashes must match without renderer, clock, hidden memory or storage. Do not reuse cached expected snapshots as the independent oracle.

Add meaningful branch allocation, quantity conservation, symbolic unknown consumables, duplicate spending/owned elements, qualified repeated endpoints, exclusive P11, correct final wiring, nested group forest/cycle, reparenting, connected-cable grouped movement, joint DOF/unit, operation atomicity, stale/non-top undo, variant-patch overlap, source-scope/confidence and hash-order/input-cycle mutants. Retain all M1 tests and relevant companion tests/type/content/package checks. Record actual commands, exits, counts and hash-bound test corpus/results; no production build or native qualification claim.

G-GRAPH MUST follow docs/digital-twin/GATE_CONTRACTS.md exactly. Inputs: fresh accepted G-DATA, locked 29-step seed and complete named registries. PASS only if exactly all three complete graphs compile, every operation and every step boundary passes replay/inverse/reference/stock tests including S21/S25/S26/S27/no-final-P11, required conditions remain separate from projection and all required unknown geometry stays BLOCKED for metric use while semantically representable. A partial graph or source fiction cannot PASS.

Produce canonical authoring graph records, per-variant CompiledGraph/initial-state artifacts, complete bound typed replay registry, graph-inputs and raw/semantic graph hashes, expected operation/step-prefix hashes, operation/mutation corpus, fresh-process reports, inventory/reversal coverage and a SINGLE docs/implementation/M2_G_GRAPH_REPORT.json. Bind graph/model/evidence/schema/source-lock/compiler/validator and test/result bytes, with complete dependency scope and explicit invalidation on operation order/effect, patches, allocation, dependency/rule or relevant source changes. Reports cannot contain their own hashes. Distinguish PASS, FAIL, BLOCKED and NOT APPLICABLE. No geometry admission from G-GRAPH.

11. REPORT / LOCAL GIT CLOSURE / NEXT HANDOFF

Write docs/implementation/M2_REPORT.md with actual M0/M1/M2 start/branch/accepted identities, any adopted canonical delta, all per-variant graph/input/initial/final/prefix/state/stock/raw hashes, source/schema/evidence/model/compiler/validator/test bindings, changed paths, exact commands/counts, full 29×3 and operation coverage, inventory/ownership/consumable/routing/group/zeroing/patch proofs, sensitive mutations, unresolved blockers/conflicts, G-GRAPH result, invalidation and rollback. Explicitly separate symbolic instruction success from metric/electrical/physical proof. Rollback is additive M2 commits to verified M2_START_SHA; preserve private originals and picarx.v1, no live state migration.

Run git status --short, git diff --check and git ls-files digital-twin/evidence/private again. Stage by explicit names only; no git add . or -A. Inspect git diff --cached --name-only, --stat and --check; exclude photographs/ZIPs/caches/runtime-state/local MCP secrets/disposable CAD. If and ONLY if exact G-GRAPH PASS, commit locally with subject M2: compile reversible V40 semantic graphs. Record M2_ACCEPTED_SHA and clean tracked status; use a documentation receipt commit if needed to record that SHA without self-reference. Do not push or open a PR. If FAIL/BLOCKED, preserve work and write HANDOFF_M2_REMEDIATION.md; no misleading complete commit or M3 authorization.

After accepted local G-GRAPH PASS, read the ACTUAL M3 sections of docs/digital-twin/MILESTONES.md and MILESTONE_REVIEW.md, docs/digital-twin/PERSISTENCE_CONTRACT.md, SOURCE_PUBLICATION_CONTRACT.md, ASSEMBLY_ENGINE_SPEC.md, REPOSITORY_CHANGE_MAP.md and relevant companion/persistence/native contracts. Create docs/implementation/HANDOFF_M3.md as a FULL next-session prompt for durable sessions/reference-first integration using actual M2 accepted SHA, graph/registry/initial-state artifacts and hashes, operation/rule/attestation IDs, unresolved scopes, baseline picarx.v1 fixtures and native feasibility prerequisite. Require fresh Git/upstream gate preflight, acknowledged idempotent transactions, browser/native parity, legacy backup/migration, reference-first 29-step navigation and real M3 acceptance; no guessed geometry. If an authority path is absent, report the exact missing path and use the actual repository map rather than inventing a contract.

Final response: M1 verification, M2_START_SHA/branch, changed files, all variants/29 steps/operation counts, complete serialized-state and fresh-process replay/undo results, inventory/cables/groups/zeroing/patch/audit-sensitive proofs, exact tests/counts, scoped blockers/conflicts, hashes and G-GRAPH, M2_ACCEPTED_SHA, rollback, M3 authorization YES/NO, handoff path and COMPLETE next-session prompt in the response itself. If M2 fails, end with the exact M2 remediation prompt instead.

STOP after M2 closure and subsequent handoff generation. Do not implement M3. No remote changes, private evidence exposure, geometry invention or confidence promotion. UNKNOWN != APPROXIMATE.
