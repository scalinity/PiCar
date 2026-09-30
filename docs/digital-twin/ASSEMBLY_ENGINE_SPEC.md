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
