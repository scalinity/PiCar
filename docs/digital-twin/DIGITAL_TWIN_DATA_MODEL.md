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
