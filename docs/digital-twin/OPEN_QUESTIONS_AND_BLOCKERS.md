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
