# M6 instructional structural plates — PASS

All eight Z0104V40 Plates A–H are INSTRUCTIONAL_ADMITTED under the owner's 2026-10-01 practical-fidelity amendment. Strict engineering plate admission remains BLOCKED for every plate. Local acceptance SHA is recorded after the implementation commit in M6_INSTRUCTIONAL_ACCEPTANCE_RECEIPT.json; this report cannot contain its own commit SHA. M7 is not implemented.

## Baseline and authority

Branch codex/m6-instructional-plates; start 9112c2937bd58d89d4075a040750636b484f41e3, tree 795de2ce527bc3188740c836c298137e90c77aa6. The start is a documentation-only descendant of instructional M5 75b3b7286761c41200940657c18eb4371025587d. All 1041 accepted M0–M5 byte/object bindings, twelve original M2 diagnostics and all 65 private package files remain unchanged. The owner-amendment hash receipt explicitly removes joint metrology closure as an instructional prerequisite. Original engineering validators and canonical records remain untouched.

## Results

| Plate | Handedness | Own views | Volume mm³ | Engineering | Instructional |
|---|---|---:|---:|---|---|
| A | notApplicable | 13 | 30105.729 | BLOCKED | INSTRUCTIONAL_ADMITTED |
| B | notApplicable | 7 | 2180.770 | BLOCKED | INSTRUCTIONAL_ADMITTED |
| C | notApplicable | 14 | 9347.742 | BLOCKED | INSTRUCTIONAL_ADMITTED |
| D | notApplicable | 6 | 6180.368 | BLOCKED | INSTRUCTIONAL_ADMITTED |
| E | RIGHT | 8 | 1720.201 | BLOCKED | INSTRUCTIONAL_ADMITTED |
| F | LEFT | 6 | 1720.201 | BLOCKED | INSTRUCTIONAL_ADMITTED |
| G | notApplicable | 3 | 1414.049 | BLOCKED | INSTRUCTIONAL_ADMITTED |
| H | notApplicable | 3 | 2467.880 | BLOCKED | INSTRUCTIONAL_ADMITTED |

**A:** Complex deck, front dual-opening upright, rear opening upright, two large and two short side flanges, visible mounting holes, ear/body slots and cutouts agree. Forward is toward dual-opening front; local +Z toward flanges. Small corners/bend transitions remain simplified.

**B:** Two connected perpendicular faces, broad body window and narrow upright window with paired mounts agree in primary, independent open-bracket and face-on flange views.

**C:** Four faces, opposite circular/diagonal-slot walls, camera shoulder window, small square opening, mounting holes, short slot, two four-hole clusters, edge holes and transverse slots agree. Diagonal slot direction was corrected during review. Lower camera corners include small notches. Rounded cosmetic edges and bend fillets simplified.

**D:** Primary and independent inverse projections agree on six holes, four slots, traced rectangular center opening, lower thumb-shaped cutout and chassis-cover silhouette. The center opening is rectangular, not forced square.

**E:** RIGHT identity from V40 S25. Three parallel upright tabs and left offset base in local top view agree across primary and independent E photographs and both E/F comparison photographs.

**F:** LEFT identity from V40 S25. CAD reflection is baked across YZ. Independently checked against F01/F04/F05, all six F contact views, and both E/F comparison photographs. Three parallel tabs and opposed asymmetric base agree; runtime scale remains positive.

**G:** Three-hole steering bar silhouette and hole relationships agree in both corrected planar projections and the oblique source. V40 S21 retains free-horn role. Width 8.1 mm remains an instructional approximation.

**H:** Six-hole notched plate silhouette and notch orientation agree in the two corrected projections and oblique view. Small outer-edge offsets from stock/plane/perspective are presentation-level, with no displaced mounting relationships. Radius 3 mm remains approximate.

All part-local origins are documented, deterministic and replaceable. A uses forward toward its dual-opening front, left/up conventions; B/C use named local face frames and manual-supported roles. E RIGHT/F LEFT use S25. D/G/H use declared primary-image frames. Installed numeric poses remain M7 work; no production datum is established.

## Source validation

All 62 original photos were inspected; tracked source-view/feature receipts contain hashes and derived information only. Every plate has a strong primary and independent secondary comparison; bent plates also have profile/oblique checks. Eight private actual-BRep comparison panels and six inverse-calibration projections are recorded by amendment-shapes-04/source-review-command.json. Both E/F comparison images and six F-specific views support the baked handed pair. CAD boolean reflected-E/F symmetric difference is 0 mm³; both are valid positive-volume solids with runtime scale [1,1,1]. No manufacturing mirror equality is claimed.

D/G/H independent hole-center maximum residuals are 0.200673 / 0.114977 / 0.122138 mm after rigid alignment without fitted scale or reflection, below 0.75 mm. Source-to-solid silhouette/slot/cutout reviews pass the practical criterion. C's initially horizontal slots were corrected to source-supported diagonal slots. D retains the traced rectangle; G width 8.1 mm and H radius 3 mm are instructional approximations. Thickness is 2 mm PROBABLE, photo-supported, not manufacturer-certified.

Card straight-edge lens correction/homography and independent penny checks apply to six flat views only. Bent faces use face-on card-scaled estimates plus independent profile/oblique review; no quantitative calibrated 3D bent residual is claimed. Lens/card warpage/tolerance, picking, plane offset and perspective uncertainties are honestly unbounded as engineering quantities. They do not alone block the owner's instructional gate. Cosmetic radii and sharp nominal bend transitions remain simplified. The historic shape-04 oracle BLOCKED source label is preserved; source-review-final.json records its amended practical disposition.

## Validation and reproducibility

Each final clean frozen qualification, qualification-amended-a-02 and qualification-amended-b-02, passes 93 Python tests (52 M6, 41 inherited M4), 135 M6 Node policy tests, 12 M2 contracts and 10 semantic firewall tests: 250 tests per run, repeated twice. Zero failed/skipped. Exact executable, cwd, environment, input, output, exit and log bindings are in each commands.json and upstream-commands.json.

Root runner commands: node docs/implementation/evidence/m6/run.mjs qualification-amended-a-02 all-parameters.json and the corresponding qualification-amended-b-02 command; node docs/implementation/evidence/m6/recheck-upstream.mjs with each label. The installed-wheel pytest command runs test_m6_bent.py, test_m6_plates.py and test_toolchain.py. Frozen uv sync uses group m4/Python 3.12.14; only the authored wheel is built/installed locally in isolated mirrors. No PYTHONPATH, global install or dependency upgrade.

Both original-lock G-DATA/G-GRAPH checks pass; original M1 locks are restored only in disposable mirrors. M4 --check freshly verifies retained 54/54 historical qualification; only 41 inherited package tests were rerun. Full M5/M3/native/session suites were not rerun or claimed.

All 19 compared outputs match raw bytes: eight BReps, eight SVGs, generation receipt, calibration and oracle JSON. All eight final BReps equal the visually reviewed shape-04 artifacts. Wheel 8258ef07575d107a6015f5c078c330f0f1740315d082d2ab037d67fcb776f9e3, 45661 bytes, also matches raw bytes. No STEP or normalization; timestamps/path metadata in command/test ledgers differ naturally and are excluded from geometry comparisons.

Tests inspect imported solids independently of generator metadata and reject missing/capped holes, missing faces/slots/cutouts/notch, unit scaling, shells, C slot displacement, added bent bore and unmirrored F. Policy tests reject engineering promotion for every admitted plate at every engineering purpose, proof/role/origin/dimension mutations, negative runtime scale and unsafe private outputs.

## Preservation, engineering blockers and closure

Prior blocked source/receipts/reports, both original flat qualifications and all new failures/debug evidence remain retained. The failed amended-a-01 is not counted as clean qualification. No private source/overlay, ZIP, wheel, environment, cache, source-vault, owner data or agent state is a publish candidate. Preservation checks verify originals ignored/untracked, private pixels confined to the ignored private namespace, no source-image hash copy in authored/public files and untouched accepted bindings.

All engineering values remain unresolved without numeric payloads. Q-03, production datum, exact bend radius, stock/hole/manufacturing tolerance, alloy/coating/kerf, hidden features and physical fit remain BLOCKED. No strict G-CAD, runtime G-GEOMETRY, mesh pack, assembly solve, hardware/session/remote action follows from this PASS.

Rollback: Revert only the M6 acceptance and documentation receipt commits after checking later owner changes; retain private sources, prior failure receipts and M2 diagnostics. No reset/clean/history rewrite.

After the conditional local commit, HANDOFF_M7.md carries actual acceptance SHA and receipts for separately scoped instructional assembly work. Original strict M7 G-CAD requirements remain visible and blocked. Stop here; no M7 implementation.
