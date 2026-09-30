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
