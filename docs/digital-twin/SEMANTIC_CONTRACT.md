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
