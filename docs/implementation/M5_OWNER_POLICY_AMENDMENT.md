# Recorded owner amendment

Owner supplied this amendment on 2026-09-30 America/New_York. Original attachment: 41231 bytes; raw SHA256 `81c9a3b235cf63e95e306a489f76c55ab09776b2237ef60af14bc59095b4956b`. Reproduced without changing the owner text below. The owner subsequently supplied the plate evidence directory and original ZIP under `docs/PiCar Plate Pictures/`; these remain private.

---

# OWNER CONTRACT AMENDMENT — CONTINUE M5 ONLY

Continue the existing M5 work for:

scalinity/PiCar

Repository:

/Users/danny/Documents/Apps/PiCar

Current implementation branch:

codex/m5-purchased-components

Reported current HEAD:

5a4077285f4d31d69b0959527e480037be1ee8db

Accepted upstream implementation checkpoints:

M0 = 2a934710501d71aecbd8da827925c92e49378661
M1 = 22c85058f9420aaaaf376c5e312915f5b7b5288d
M2 = 8d8d30d0c7b077504916a26d80c211e2fc52c4e2
M3 = baddbfe6953237d436cbedb963c6ea88d2960f05
M4 = 4655e60ccb170cd7cadd5545f1aa4303e74145b7

M5 currently has NO acceptance commit.

The existing M5 investigation is intentionally BLOCKED under the original
strict engineering G-COMPONENT contract.

Do NOT erase, rewrite or disguise that result.

This message is an explicit OWNER POLICY AMENDMENT for the project.

The product goal is an accurate, trustworthy interactive PiCar-X assembly
tutorial / digital twin.

It is NOT a manufacturing-replacement CAD package and does NOT require every
visible part to be proven to metrology/manufacturing tolerances before it may
appear in the instructional experience.

The evidence firewall remains mandatory.

UNKNOWN != APPROXIMATE.

What changes is that the project now formally distinguishes:

1. engineering-grade geometry admission; and
2. instructional/tutorial geometry admission.

This distinction must be persistent, machine-readable and impossible for a
later agent to silently collapse.

==================================================
OWNER AUTHORIZATION
==================================================

I explicitly authorize this bounded M5 remediation.

You may:

- inspect and modify the existing uncommitted M5 work;
- preserve and reuse the existing M5 candidate acquisitions;
- perform narrowly targeted additional public-source research when it has a
  clear chance of improving a specific component;
- run the authored CadQuery/OCP tooling;
- generate instructional component proxy CAD;
- run Python only as allowed by the repository's authored CAD package/tests
  and accepted hash harnesses;
- run Node tooling and tests;
- execute bounded builds/tests required by M5;
- create local Git commits after the acceptance criteria in this prompt pass;
- ingest/hash the separately supplied plate-photo ZIP for M6 handoff purposes
  only.

Do NOT:

- push;
- open a PR;
- write remotely;
- perform robot/hardware actions;
- modify or inspect owner session databases;
- publish private evidence;
- implement M6;
- reconstruct Plates A–H in this session;
- implement assembly CAD;
- implement GLB/runtime 3D;
- implement M7–M14.

==================================================
FIRST — FRESH PREFLIGHT
==================================================

Before editing:

record:

git branch --show-current
git rev-parse HEAD
git status --short
git diff --stat
git diff --check

Read:

docs/implementation/M5_REPORT.md
docs/implementation/M5_REMEDIATION.md
docs/implementation/M4_REPORT.md
docs/implementation/M4_GATE_REPORT.json
docs/implementation/M4_ACCEPTANCE_RECEIPT.json

and the actual M5 authorities in:

docs/digital-twin/MILESTONES.md
docs/digital-twin/MILESTONE_REVIEW.md
docs/digital-twin/GATE_CONTRACTS.md
docs/digital-twin/GEOMETRY_AND_EVIDENCE_SPEC.md
docs/digital-twin/DIGITAL_TWIN_DATA_MODEL.md
docs/digital-twin/HASH_AND_PACK_CONTRACT.md
docs/digital-twin/ASSET_PIPELINE_SPEC.md
docs/digital-twin/VERIFICATION_AND_TEST_PLAN.md
docs/digital-twin/OPEN_QUESTIONS_AND_BLOCKERS.md
docs/digital-twin/SOURCE_REGISTER.md
docs/digital-twin/REPOSITORY_CHANGE_MAP.md
docs/digital-twin/SOURCE_PUBLICATION_CONTRACT.md

Inspect the existing uncommitted M5 candidate records, acquisition receipts,
tests, CAD inspection module and source-vault records.

Do NOT discard or recreate this work blindly.

Verify:

- accepted M0→M4 ancestry;
- current M4 G-TOOLCHAIN remains PASS;
- accepted M1/M2/M3 mechanical/session contracts have not drifted;
- private evidence remains ignored/untracked;
- original 12 M2 diagnostics remain untouched;
- M3 session/recovery data is untouched;
- vendor bytes remain ignored and unstaged;
- current M5 blocked evidence remains recoverable.

Run the appropriate existing read-only M4/adoption checks.

Do not blindly execute historical artifact writers against the live tree.

If accepted upstream integrity is broken:

STOP before remediation.

==================================================
DO NOT REWRITE THE ORIGINAL M5 RESULT
==================================================

The original result remains historically true:

STRICT G-COMPONENT:
BLOCKED for all fifty purchased definitions in the previous investigation.

Preserve the existing:

M5_REPORT.md

and its evidence/failure history.

Do not edit it into a retroactive PASS.

Create a NEW owner-policy closure track.

At minimum create:

docs/digital-twin/INSTRUCTIONAL_GEOMETRY_POLICY.md

docs/implementation/M5_OWNER_POLICY_AMENDMENT.md

docs/implementation/M5_INSTRUCTIONAL_REPORT.md

docs/implementation/M5_INSTRUCTIONAL_GATE_REPORT.json

digital-twin/validation/expected/m5/instructional-admission.json

and, where useful:

digital-twin/validation/expected/m5/instructional-receipts/

The old strict engineering receipts remain intact.

==================================================
NEW GEOMETRY ADMISSION MODEL
==================================================

Every purchased-component definition now has TWO logically independent
admission questions.

--------------------------------------------------
A. ENGINEERING ADMISSION
--------------------------------------------------

Status:

ENGINEERING_ADMITTED

ONLY when the original strict G-COMPONENT contract passes for the declared
scope.

This means applicable identity, required mechanical feature evidence and
independent engineering CAD validation satisfy the original audited contract.

Do NOT weaken this status.

If the original G-COMPONENT requirements are not met:

engineeringStatus remains:

PARTIAL
or
BLOCKED

as appropriate.

--------------------------------------------------
B. INSTRUCTIONAL ADMISSION
--------------------------------------------------

Status:

INSTRUCTIONAL_ADMITTED

means the representation is sufficiently trustworthy for the interactive
assembly tutorial.

It does NOT mean manufacturing accuracy.

It does NOT mean physical equality.

It does NOT mean engineering G-COMPONENT passed.

An INSTRUCTIONAL_ADMITTED representation may contain explicit
presentation-only approximations where permitted below.

==================================================
THE CRITICAL FIREWALL
==================================================

An instructional approximation must NEVER silently become an engineering
measurement.

Canonical:

Measurement
Claim
EvidenceRecord
DerivationRecord
MechanicalInterface

semantics remain governed by the existing evidence model.

If an exact numeric value remains unknown in canonical engineering data:

leave it UNKNOWN / UNRESOLVED there.

Do NOT insert an approximate number into canonical Measurement merely to make
the CAD visually complete.

Presentation-only approximate numbers belong in a separate instructional
parameter layer.

Suggested concept:

instructionalParameters

with fields such as:

- parameter name;
- numeric value;
- unit;
- basis;
- source refs;
- approximation kind;
- intended visual purpose;
- explicitly non-engineering flag;
- unresolved engineering blocker refs.

These values are NOT canonical measurements.

They are NOT VERIFIED or DERIVED engineering claims.

They do NOT close the original Q blocker.

They must not be imported into engineering solvers as authoritative
dimensions.

==================================================
PER-DEFINITION INSTRUCTIONAL RECEIPT
==================================================

For every purchased definition, create a machine-readable instructional
receipt containing at least:

definitionId

engineeringStatus:
- ENGINEERING_ADMITTED
- PARTIAL
- BLOCKED

instructionalStatus:
- INSTRUCTIONAL_ADMITTED
- BLOCKED

representationKind, e.g.:
- authoritative_vendor
- nominal_standard_proxy
- photo_supported_proxy
- documentation_supported_proxy
- simplified_visual_proxy
- schematic_flexible
- abstract_consumable

sourceRefs

sourceLimitations

canonicalUnknowns

instructionalApproximations

criticalTutorialFacts

protectedFacts

mustNotDrive

blockerIds

rightsStatus

artifactPaths

validationResults

notes

==================================================
WHAT INSTRUCTIONAL GEOMETRY MAY BE USED FOR
==================================================

INSTRUCTIONAL_ADMITTED geometry MAY drive:

- recognizable visual appearance;
- part picking/tray presentation;
- exploded/tutorial views;
- visual orientation;
- left/right recognition;
- rough external envelope;
- animation presentation;
- visual placement in the future instructional scene;
- cosmetic rendering;
- showing which component the user should select;
- showing which face/orientation points toward another component;
- schematic flexible cables;
- approximate noncritical clearances for visual presentation.

It MAY NOT automatically drive:

- engineering mating proof;
- fit/interference certification;
- torque;
- thread engagement;
- manufacturing drawings;
- replacement-part fabrication;
- battery/safety clearance certification;
- electrical voltage claims;
- exact cable bend limits;
- physical collision guarantees;
- exact centerline/axis claims;
- G-CAD engineering acceptance;
- G-GEOMETRY engineering acceptance.

==================================================
FACTS THAT MUST NEVER BE APPROXIMATED
==================================================

Do NOT approximate or invent:

- component count;
- component role;
- variant applicability;
- left/right handedness;
- assembly step identity;
- which component is used in which step;
- which fastener designation the printed manual specifies;
- which part instance is being referenced;
- cable endpoint semantics;
- known connector/port label;
- servo role;
- motor left/right role;
- camera ribbon variant;
- temporary versus final wiring role;
- P11 temporary zeroing semantics;
- Plate E right / Plate F left;
- source conflicts;
- evidence provenance;
- actual observed owner stock;
- battery safety claims;
- voltage where documentation conflicts;
- manufacturer/OEM identity when unproven.

If identity is unproven:

keep the exact OEM identity unresolved.

A visual proxy may still represent the kit role.

==================================================
FEATURES THAT MAY BE APPROXIMATED FOR INSTRUCTION
==================================================

When exact evidence is unavailable, the following MAY be approximated,
provided they live only in the instructional layer and are explicitly labeled:

- cosmetic fillets/chamfers;
- tiny molded details;
- screw recess appearance;
- thread helix visualization;
- hidden internal mechanisms;
- noncritical body curvature;
- wheel tread pattern;
- rubber deformation;
- PCB component height/details not used by mounting;
- decorative silkscreen where unnecessary;
- cable curvature;
- cable slack;
- wire thickness;
- connector cosmetic shell detail;
- visual fastener head proportions;
- battery wrapping/cosmetic envelope detail;
- visual servo casing detail;
- visual motor gearbox casing detail;
- visual wheel spoke/tire detail;
- visually estimated external envelope dimensions when no better evidence
  exists;
- visually estimated presentation anchor offsets where needed only to make an
  instructional scene understandable.

Every such approximation must be declared.

==================================================
MECHANICAL INTERFACE RULE
==================================================

Mechanical mounting/interface facts receive stricter treatment.

If a mounting hole, shaft, axis or contact feature has applicable evidence:

use that evidence.

If it can be reproducibly derived from a calibrated source:

record the derivation and uncertainty under existing evidence rules.

If it is not supported:

canonical engineering interface geometry remains UNRESOLVED.

For instructional rendering, an approximate presentation anchor may be used
ONLY if:

1. it is clearly marked instructional-only;
2. it is not exported as an engineering Measurement;
3. it is not allowed to satisfy G-COMPONENT;
4. future engineering validators cannot accidentally consume it;
5. it can be replaced later without changing component identity.

==================================================
INSTRUCTIONAL ADMISSION PASS RULE
==================================================

A definition may be INSTRUCTIONAL_ADMITTED when all of the following are true:

1. The kit role is known well enough to avoid showing the wrong kind of part.

2. The tutorial can visually distinguish it from other parts that the user
   might confuse it with.

3. Its orientation/handedness semantics are preserved.

4. The future instructional workflow can show where/how it participates
   without contradicting the accepted M2 assembly graph.

5. Any exact mechanically critical feature that is known is represented
   correctly.

6. Unknown critical geometry remains explicitly unresolved in canonical data.

7. Any visual approximation is isolated from engineering data.

8. No open source conflict is silently resolved.

9. Its rights/source provenance is recorded.

10. The representation would not materially mislead a user performing the
    assembly.

If even a tutorial representation would mislead the user:

instructionalStatus = BLOCKED.

Do NOT force every definition to PASS.

==================================================
M5 INSTRUCTIONAL GATE
==================================================

Create a new owner-authorized gate:

G-INSTRUCTIONAL-COMPONENT

or another equally explicit non-conflicting name.

Do NOT rename it to G-COMPONENT.

The original strict G-COMPONENT remains intact.

The new gate passes only when every purchased-scope definition has an honest
tutorial disposition and there are ZERO tutorial-critical BLOCKED definitions.

Permitted final dispositions:

ENGINEERING_ADMITTED
+
INSTRUCTIONAL_ADMITTED

or:

engineeringStatus = PARTIAL/BLOCKED
instructionalStatus = INSTRUCTIONAL_ADMITTED

A definition may retain strict engineering blockers indefinitely while still
being admitted instructionally.

==================================================
M5 PURCHASED SCOPE
==================================================

Retain the accepted fifty purchased definitions.

Current scope includes:

- screws;
- washers;
- nuts;
- standoffs;
- rivets;
- motors;
- servos;
- servo horns;
- wheels;
- battery;
- Robot HAT;
- camera;
- ultrasonic sensor;
- grayscale sensor;
- loose cables;
- integral leads;
- accessory connector;
- Raspberry Pi boards;
- consumables.

Do not pull Plates A–H into M5.

They remain M6.

==================================================
USE THE EXISTING M5 INVESTIGATION
==================================================

Do NOT restart public research from zero.

Reuse:

- the 16 acquired candidate source records;
- official Raspberry Pi drawings;
- Pi5 STEP ZIP and licence;
- existing official SunFounder snapshots;
- candidate-source metadata;
- source-vault hashes;
- current CAD inspection code;
- existing 28 candidate-evidence tests;
- existing source/licence guards;
- current failure history.

Perform additional web/source acquisition only when a specific, bounded query
could materially improve a component.

Do not burn time repeatedly searching for proprietary drawings that the first
attempt already failed to locate.

==================================================
EVIDENCE PRIORITY FOR INSTRUCTIONAL REPRESENTATION
==================================================

Use, in order where applicable:

1. exact applicable official/OEM CAD;
2. exact applicable official mechanical drawing;
3. direct physical evidence already held privately by the project;
4. exact applicable official product photographs/documentation;
5. V40 printed assembly evidence;
6. applicable same-family documentation with explicit limitation;
7. source-backed generic/industry geometry ONLY as an instructional proxy.

Never silently move a lower-tier source into engineering authority.

==================================================
PRIVATE PHOTO USE
==================================================

Existing private owner evidence may be inspected locally where it actually
shows a purchased component.

Private images remain:

- ignored;
- local;
- unstaged;
- unpublished.

Do not copy them into application/public output.

If a photo provides only visual identity/orientation but no calibrated metric
measurement:

use it only for instructional appearance/orientation.

Do not call its dimensions VERIFIED or DERIVED.

==================================================
FASTENERS / NUTS / STANDOFFS
==================================================

For printed metric designations such as:

M1.5x3
M2.5x6
M3x6
M3x25
M2.5x11
M2.5x18
M2.5x18+6
M2.5x30
M3x26

preserve the exact printed designation.

Instructional models MAY use:

- nominal metric diameter;
- nominal printed length;
- simplified standard cylindrical/hexagonal bodies;
- visually matching head style if actual evidence shows it.

Do NOT claim:

- exact material;
- exact tolerance;
- head standard;
- drive standard;
- pitch if not established;
- female depth;
- torque;
- thread class.

Thread helices need not be modeled.

For instructional use, simplified nominal threads or smooth shafts are
acceptable if documented.

==================================================
WASHERS
==================================================

Washer A and Washer B remain distinct identities.

Do not merge them.

If exact OD/ID/thickness remains unavailable:

use a visually distinct instructional ring proxy.

Do not insert guessed dimensions into canonical Measurements.

Preserve:

S19 Washer A
S26 three Washer B per front wheel

exactly.

==================================================
SUNFOUNDER RIVETS
==================================================

R2048
R2056
R3055
R3065
R3080
R30185

remain distinct identities.

Do not infer engineering grip length or diameter from the opaque code.

For instructional display, use source/photo-supported simplified rivet-body
and owned-pin representations.

Preserve the owned-element semantics from M1/M2.

Do not create extra inventory.

==================================================
SERVOS
==================================================

Pan, tilt and steering remain distinct kit roles.

Do not claim:

SG90
MG90S

or another exact OEM identity unless proven.

Instructional servo CAD may use a simplified micro-servo envelope derived
from applicable kit imagery/documentation.

Preserve:

- output-shaft side;
- mounting-tab concept;
- cable exit;
- role identity;
- horn attachment location;
- neutral/zeroing semantics from M2.

Exact spline tooth count, shaft diameter and tab coordinates remain
engineering unresolved unless evidenced.

==================================================
SERVO HORNS
==================================================

Create recognizable instructional horn geometry based on applicable visual
evidence.

Preserve:

- which horn role is used;
- relative attachment purpose;
- connection to the correct servo;
- relevant M2 operation semantics.

Do not certify:

- spline;
- exact hole pitch;
- exact material;
- exact retaining screw.

==================================================
TT MOTORS
==================================================

Left/right motor instances remain distinct.

Do not promote a generic yellow TT motor to exact OEM identity.

Instructional motor geometry may use a visually faithful gearbox/motor proxy
supported by kit/manual/official imagery.

Preserve:

- shaft side;
- rear-drive role;
- left/right identity;
- integrated lead ownership;
- wheel connection semantics.

Exact gearbox internals, shaft seating dimensions and wire-exit metrology
remain unresolved unless supported.

==================================================
WHEELS
==================================================

Front and rear wheel roles must remain distinct where the assembly semantics
distinguish them.

Instructional wheel models may approximate:

- tire curvature;
- tread;
- hub cosmetic geometry.

Preserve:

- front vs rear role;
- mounting mode;
- S26 front-wheel washer/rivet semantics;
- S27 rear-wheel motor-shaft semantics.

Do not claim exact hub/bore fit unless evidenced.

==================================================
ROBOT HAT
==================================================

Do not resolve the supplied exact revision merely from current HAT-family
pages.

Keep revision identity unresolved if necessary.

Instructional geometry may use a simplified PCB/envelope with visible
connector groups and labels sufficient for assembly guidance.

Preserve known role labels from V40/M2.

Do not invent:

- pin maps;
- voltage resolution;
- ZERO behavior beyond accepted source evidence;
- hidden connector geometry.

==================================================
CAMERA
==================================================

Preserve the OPEN camera dimension conflict.

Do NOT average:

25×23×9

and:

24×23.5×8.

An instructional camera proxy may select a visually reasonable envelope for
presentation only.

The selected proxy dimensions must be explicitly marked:

presentation-only

and must cite the conflict.

No engineering dimension claim closes.

==================================================
ULTRASONIC
==================================================

Preserve the OPEN:

generic/documentation 5 V
vs
V40 printed 3V3

conflict.

Instructional geometry may visually represent the module and transducers.

Do not resolve electrical supply truth in geometry.

Do not convert generic HC-SR04 identity into exact supplied identity unless
proven.

==================================================
GRAYSCALE MODULE
==================================================

Use the best applicable project/manual/official imagery to create a simplified
instructional PCB/sensor representation.

Preserve:

- module role;
- mounting relationship;
- cable endpoint semantics.

Unknown exact PCB dimensions/hole coordinates remain engineering unresolved.

==================================================
RASPBERRY PI BOARDS
==================================================

Continue using the acquired official Pi4/Pi5/Zero2W sources with their
documented limitations.

For Pi5:

the official STEP may support instructional geometry.

Do NOT erase its guidance/reference limitations.

If useful, build an instructional wrapper/datum around inspected applicable
geometry.

Do not claim that the STEP proves the exact user's physical board revision or
installed cooler/header configuration.

For Pi4/Zero2W:

official mechanical drawings may support an instructional board model where
appropriate.

Record exactly which dimensions/features come from official drawings and
which presentation details are simplified.

==================================================
BATTERY
==================================================

Create only a tutorial-appropriate external pack/lead representation.

Do NOT infer or certify:

- safety envelope;
- cell chemistry beyond actual source;
- compression behavior;
- thermal clearance;
- exact connector construction.

Preserve integrated-lead semantics.

==================================================
CABLES / CONNECTORS
==================================================

Flexible cables do not require exact swept geometry in M5.

Use:

schematic_flexible

representation where appropriate.

Preserve:

- cable identity;
- conductor/connector facts that are actually known;
- endpoint labels;
- FFC versus FPC variant behavior;
- ownership of integral leads.

Approximate:

- slack;
- visual curvature;
- bend shape

only for presentation.

Do not claim exact:

- length;
- pitch;
- bend radius;
- keying;
- pin map

unless evidenced.

==================================================
CONSUMABLES
==================================================

Consumables may be represented:

abstract_consumable

when a rigid CAD solid would be misleading.

Do not manufacture exact thickness/length/capacity from nothing.

Preserve the M1/M2 stock semantics.

==================================================
INSTRUCTIONAL CAD LOCATION
==================================================

Do not mix instructional proxies invisibly with engineering-authoritative
vendor geometry.

Use an explicit namespace such as:

cad/twin_cad/components/instructional/

and/or another clearly documented repository path consistent with the actual
repository map.

Authoritative/vendor reference code remains separately identifiable.

Every generated instructional asset must carry a receipt tying it to:

- definition ID;
- evidence sources;
- approximation policy;
- blockers;
- engineering status;
- instructional status.

==================================================
ENGINEERING SOLVER FIREWALL TEST
==================================================

Add tests proving that an instructional-only parameter or proxy CANNOT
accidentally satisfy:

G-COMPONENT
engineering measurement closure
engineering interface closure
future G-CAD admission

when engineeringStatus != ENGINEERING_ADMITTED.

This is mandatory.

The instructional track must not weaken the evidence firewall.

==================================================
REQUIRED NEGATIVE TESTS
==================================================

At minimum reject:

- instructional proxy reported as engineering admitted;
- visual estimate inserted as VERIFIED Measurement;
- visual estimate inserted as DERIVED without derivation;
- generic SG90 promoted to exact servo identity;
- generic TT motor promoted to exact kit identity;
- generic HC-SR04 promoted to exact kit identity;
- camera conflict silently averaged;
- ultrasonic voltage conflict silently resolved;
- Washer A/B identity collapse;
- front/rear wheel role substitution;
- left/right motor substitution;
- integral lead duplicated as loose inventory;
- rivet pin double counted;
- approximate cable route exported as engineering route;
- Pi5 guidance STEP treated as manufacturing guarantee;
- private photo copied into public/runtime asset root;
- instructional approximation entering engineering solver input.

==================================================
REQUIRED POSITIVE TESTS
==================================================

At minimum prove:

- strict engineering BLOCKED + instructional PASS can coexist;
- engineering-admitted component may also be instructionally admitted;
- instructional proxy retains blocker IDs;
- canonical unknown values remain unresolved;
- presentation parameter can exist without canonical Measurement mutation;
- future replacement of a proxy does not change PartDefinition identity;
- EVIDENCE provenance remains intact;
- source conflict remains open while visual proxy exists;
- flexible cable schematic can be instructionally admitted;
- abstract consumable can be instructionally admitted;
- per-definition receipt is complete;
- fifty purchased definitions are all accounted for exactly once.

==================================================
M5 INSTRUCTIONAL CLOSURE REPORT
==================================================

Create:

docs/implementation/M5_INSTRUCTIONAL_REPORT.md

It must clearly state:

STRICT ENGINEERING M5:
G-COMPONENT remains BLOCKED/PARTIAL where applicable.

OWNER INSTRUCTIONAL TRACK:
G-INSTRUCTIONAL-COMPONENT = PASS / FAIL / BLOCKED.

Do not say simply:

"M5 passed"

without the qualifier.

Report per-definition:

- engineeringStatus;
- instructionalStatus;
- representation kind;
- source basis;
- approximations;
- unresolved engineering features;
- blockers;
- artifact;
- validation.

Provide totals for:

ENGINEERING_ADMITTED
ENGINEERING_PARTIAL
ENGINEERING_BLOCKED
INSTRUCTIONAL_ADMITTED
INSTRUCTIONAL_BLOCKED

==================================================
NEW OWNER POLICY DOCUMENT
==================================================

Create:

docs/digital-twin/INSTRUCTIONAL_GEOMETRY_POLICY.md

This becomes the canonical owner policy for tutorial geometry.

State plainly:

The PiCar-X project has two fidelity tracks.

ENGINEERING TRACK:
strict original evidence/CAD gates.

INSTRUCTIONAL TRACK:
visual/tutorial fidelity sufficient to perform the real assembly without
materially misleading the user.

Instructional geometry may proceed while engineering geometry remains
unresolved.

Instructional admission never closes engineering blockers automatically.

Future agents must not infer:

INSTRUCTIONAL_ADMITTED
=
ENGINEERING_ADMITTED.

==================================================
DO NOT MUTATE PRIOR ACCEPTED IDENTITIES CASUALLY
==================================================

Prefer implementing the instructional admission layer as an additive M5
artifact rather than rewriting M1 entity semantics.

Do not alter:

schemaHash
evidenceHash
modelHash
M2 graph hashes
M3 session acceptance

unless the implementation genuinely requires a canonical input adoption.

If any accepted canonical input must change:

- record exact old/new bytes;
- follow the established adoption/invalidation contract;
- revalidate affected gates;
- never bind new data to old hashes.

The preferred design is for presentation-only instructional parameters to
remain outside engineering model preimages until an audited future policy
explicitly promotes them.

==================================================
BOUNDED RESEARCH POLICY
==================================================

Do NOT run another broad M5 web sweep.

The prior acquisition attempt is sufficient evidence that many proprietary
details are not publicly available.

Additional research is allowed only for targeted questions such as:

"Can this exact definition be identified from this exact SunFounder page?"

or:

"Is there a current official mechanical drawing for this exact board?"

Stop searching a scope after a reasonable bounded attempt.

Do not let perfect become the enemy of the tutorial.

==================================================
VALIDATION / REPRODUCIBILITY
==================================================

Use the accepted M4 toolchain.

Run fresh clean qualification for the new instructional CAD/code.

At minimum verify:

- deterministic generation from tracked instructional parameters;
- BRep validity for rigid CAD proxies;
- valid units;
- nonzero/expected solids where a solid is intended;
- no solids for explicitly abstract/schematic representations where that is
  the honest representation;
- source/receipt closure;
- all fifty definitions accounted for;
- engineering/instructional firewall;
- repeatability across two clean runs where practical;
- existing relevant M1/M2 semantic firewall tests;
- read-only accepted upstream checks.

Do not claim physical dimensional accuracy from reproducible approximation.

==================================================
GIT CLOSURE
==================================================

If and ONLY if:

G-INSTRUCTIONAL-COMPONENT == PASS

and upstream accepted state remains valid:

run:

git status --short
git diff --check
git ls-files digital-twin/evidence/private

Stage intended paths by explicit name.

Do NOT use:

git add .
git add -A

Inspect:

git diff --cached --name-only
git diff --cached --stat
git diff --cached --check

Do not stage:

- vendor source-vault bytes;
- private photographs;
- private ZIPs;
- `.firecrawl`;
- caches;
- virtualenvs;
- binary dependency distributions;
- owner session data;
- disposable qualification directories;
- runtime/agent state.

Create a LOCAL commit with subject:

M5: add instructional purchased-component geometry

Record:

M5_INSTRUCTIONAL_ACCEPTED_SHA

Do NOT create or claim a strict engineering M5 acceptance SHA unless the
original G-COMPONENT genuinely passes.

Do not push.

==================================================
PLATE PHOTO EVIDENCE PACKAGE — FOR M6 HANDOFF ONLY
==================================================

I will provide the verified private archive:

PiCar-X-Z0104V40-Plate-Photo-Evidence.zip

This archive contains the custom structural Plate A–H photo evidence.

M5 must NOT model these plates.

M5 may only ingest/verify the archive so the next M6 session has an exact
evidence handoff.

Treat the ZIP and all contained photos as PRIVATE OWNER EVIDENCE.

Do not stage them.

Do not publish them.

Do not copy them into application/public roots.

Place the archive in an ignored private evidence location consistent with the
existing repository policy.

Before moving/copying:

compute:

- archive SHA-256;
- byte size.

Open/read:

README.md
PHOTO_MANIFEST.csv

Verify the package structure expected from owner review:

Plate-A/ = 13 photos
Plate-B/ = 7 photos
Plate-C/ = 14 photos
Plate-D/ = 6 photos
Plate-E/ = 8 photos
Plate-F/ = 6 photos
Plate-G/ = 3 photos
Plate-H/ = 3 photos
Plate-E-F-Mirror-Comparison/ = 2 photos

Total photographs = 62.

Verify:

- A–H are all present;
- the E/F comparison directory contains exactly 2 images;
- no accidental duplicate hashes;
- manifest rows match image files;
- manifest SHA-256 values match actual image bytes;
- ZIP CRC/integrity passes;
- no unrelated files exist.

Do NOT recompress or rewrite the image bytes.

Record a HASH-ONLY tracked receipt suitable for the M6 handoff.

Do not stage the private archive or photographs.

==================================================
KNOWN PLATE-EVIDENCE CONTEXT FOR M6
==================================================

Carry the following owner-reviewed context into the M6 handoff:

- Plates A–H are the custom Z0104V40 structural plate set.
- Plate A is the main complex chassis plate.
- Plate C is the most complex multi-bend bracket and has the largest view set.
- Plate D is flat.
- Plate E and Plate F are handed mirror counterparts.
- Plate E = robot RIGHT.
- Plate F = robot LEFT.
- Plate G is a long flat linkage/bar with three holes.
- Plate H is a flat bracket with six holes and a central rectangular notch.
- Working common stock thickness = approximately 2.0 mm.
- That 2.0 mm value is photo-supported / probable, NOT manufacturer-certified.
- A penny comparison and repeated edge evidence support that working thickness.
- The payment card and U.S. penny appear in many captures as scale references.
- The images were captured for tutorial-grade reconstruction, not metrology.

Do not silently convert this context into VERIFIED manufacturing data.

==================================================
M6 AUTHORIZATION POLICY
==================================================

Do NOT implement M6 now.

M6 becomes authorized for the OWNER INSTRUCTIONAL TRACK only if:

G-INSTRUCTIONAL-COMPONENT == PASS

AND:

the M5 instructional closure is locally committed

AND:

the plate photo evidence package passes integrity verification.

Strict engineering M5 G-COMPONENT may remain blocked.

That fact must follow M6 forward.

M6 may therefore produce:

INSTRUCTIONAL_ADMITTED plate geometry

while preserving strict engineering plate blockers.

M6 must NOT claim strict engineering G-CAD merely because photographs produce
a visually faithful model.

==================================================
GENERATE THE COMPLETE M6 KICKOFF PROMPT
==================================================

If the instructional M5 gate passes:

create:

docs/implementation/HANDOFF_M6.md

Do NOT implement M6.

The M6 kickoff prompt must be complete and copy-ready.

It must be derived from:

- the actual accepted M0–M4 state;
- actual M5_INSTRUCTIONAL_ACCEPTED_SHA;
- actual instructional component receipts;
- actual remaining engineering blockers;
- actual plate ZIP SHA-256;
- actual PHOTO_MANIFEST;
- actual A–H photo counts;
- current canonical evidence/model/graph identities;
- actual M4 CadQuery/OCP toolchain;
- actual owner instructional geometry policy.

The M6 prompt must instruct the next agent to reconstruct Plates A–H from the
private photo evidence package.

It must distinguish:

ENGINEERING
versus
INSTRUCTIONAL

geometry throughout.

==================================================
M6 PHOTO RECONSTRUCTION REQUIREMENTS TO INCLUDE
==================================================

The generated M6 prompt must require:

1. Preserve all original photographs byte-for-byte.

2. Read PHOTO_MANIFEST.csv rather than inferring filenames.

3. Use the standard payment-card dimensions as a scale reference where the
   card is coplanar enough for calibration.

4. Use the U.S. penny only as an additional scale cross-check where useful.

5. Correct lens/perspective distortion before extracting planar geometry.

6. Prefer near-orthographic/top-down views for:
   - outlines;
   - hole centers;
   - slots;
   - cutouts.

7. Use profile/oblique views for:
   - flange height;
   - bends;
   - handedness;
   - bend orientation;
   - relative planes.

8. Record uncertainty.

9. Never call a photo-derived value VERIFIED solely because a card appears in
   the image.

10. A reproducible calibrated image derivation may be DERIVED only if the
    method, source image, reference geometry and uncertainty are recorded.

11. Keep the shared working thickness around 2.0 mm as PROBABLE unless a
    stronger derivation is achieved.

12. Model E once and validate F as the handed mirror where the image evidence
    supports that relationship.

13. Preserve:
    E = right
    F = left.

14. Independently reconstruct/validate Plate A and Plate C because of their
    complex bends and feature count.

15. Use M4 CadQuery/OCP tooling.

16. Compare generated plate silhouettes/projections back to the source images.

17. Produce explicit:
    - source-image overlays or comparable residual evidence;
    - per-feature uncertainty;
    - hole/slot/outline receipts;
    - bend/plane receipts.

18. Keep unresolvable manufacturing details such as:
    - exact bend radius;
    - material tolerance;
    - coating thickness;
    - manufacturing tolerance

    unresolved unless evidence supports them.

19. Do not let tutorial-level visual success become an engineering-fit
    certificate.

20. Produce per-plate:
    engineeringStatus
    instructionalStatus.

21. Create no public/photo redistribution.

22. Stop after M6 and generate the actual next milestone kickoff.

==================================================
M6 ACCEPTANCE POLICY TO CARRY FORWARD
==================================================

The generated M6 handoff should define an instructional plate gate analogous
to:

G-INSTRUCTIONAL-PLATE

A plate may be instructionally admitted when:

- overall shape is faithful;
- visible mounting holes/slots/cutouts are placed consistently with calibrated
  photo evidence;
- bend orientation is correct;
- handedness is correct;
- assembly use is not materially misleading;
- unresolved manufacturing detail remains explicit.

Strict engineering plate admission remains separate.

==================================================
M5 FINAL RETURN FORMAT
==================================================

When finished, return:

1. fresh preflight result;
2. branch/HEAD;
3. original strict M5 status;
4. owner-policy amendment path;
5. instructional policy summary;
6. fifty-definition accounting;
7. count ENGINEERING_ADMITTED;
8. count ENGINEERING_PARTIAL;
9. count ENGINEERING_BLOCKED;
10. count INSTRUCTIONAL_ADMITTED;
11. count INSTRUCTIONAL_BLOCKED;
12. per-family summary;
13. instructional CAD/proxy artifacts created;
14. unresolved engineering blockers retained;
15. source conflicts retained;
16. engineering-solver firewall test result;
17. exact tests/commands/counts;
18. clean-run reproducibility result;
19. G-INSTRUCTIONAL-COMPONENT result;
20. M5_INSTRUCTIONAL_ACCEPTED_SHA if accepted;
21. strict G-COMPONENT status;
22. rollback procedure;
23. plate ZIP SHA-256 and size;
24. plate evidence verification result;
25. A–H image counts and total;
26. M6 instructional authorization YES / NO;
27. HANDOFF_M6.md path;
28. COMPLETE M6 kickoff prompt in the response itself.

If instructional M5 remains blocked:

do NOT authorize M6.

Produce a revised M5 remediation prompt instead.

==================================================
ABSOLUTE RULES
==================================================

Do not lie about the original G-COMPONENT result.

Do not rewrite failure history.

Do not manufacture exact OEM identities.

Do not invent canonical measurements.

Do not erase unresolved blockers.

Do not average conflicting evidence.

Do not publish private evidence.

Do not stage vendor source-vault bytes.

Do not use instructional approximations as engineering measurements.

Do not implement M6.

Do not model Plates A–H in M5.

Do not implement M7+.

Do not push.

The tutorial is allowed to be approximate where approximation does not
materially mislead assembly.

The engineering record is not allowed to pretend approximation is fact.

UNKNOWN != APPROXIMATE.

Finish the M5 instructional remediation honestly, generate the M6 handoff,
then STOP.