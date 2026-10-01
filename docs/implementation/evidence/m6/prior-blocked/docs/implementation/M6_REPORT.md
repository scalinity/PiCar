# M6 instructional plate investigation — BLOCKED

M6 is incomplete. No Plate A–H is instructionally admitted; the strict engineering plate gate is also BLOCKED. No acceptance commit was created, and M7 is not authorized. Five bent CAD models and the full eight-plate source/uncertainty/admission proof remain unfinished. Source access is available and useful; this report does not conclude that reconstruction is impossible or that missing metrology necessarily prevents an instructional result.

The reviewable deliverable is a source inventory, six-view calibration investigation, three provisional D/G/H BRep candidates, independent construction/second-view hole checks, bounded tests and a complete remediation handoff. See [structured report](M6_G_INSTRUCTIONAL_PLATE_REPORT.json), [execution plan](M6_EXECUTION_PLAN.md), and [complete kickoff](HANDOFF_M6_REMEDIATION.md).

## Preflight and accepted baseline

Branch `codex/m6-instructional-plates`; start/current HEAD `9112c2937bd58d89d4075a040750636b484f41e3`, tree `795de2ce527bc3188740c836c298137e90c77aa6`. The start is a documentation-only descendant of instructional M5 `75b3b7286761c41200940657c18eb4371025587d`. Accepted M0–M5 commit/tree evidence and all 1,041 consumed bindings were freshly checked against retained Git blobs in `evidence/m6/preflight.json`. Existing identity and configuration were used. All additions remain untracked/unstaged; no accepted tracked byte changed.

Fresh M4 retained-binding and M5 instructional closure checks passed before the branch switch. M5 closure hardcodes its branch and clean tracked state; it was not modified to accept M6. Original-lock G-DATA/G-GRAPH checks passed in both disposable mirrors. Historical full-suite counts remain historical evidence, not newly executed tests.

## Private source integrity and mapping

Archive: 34,917,896 bytes, SHA256 `02e3006ee1fbd45c03abef5c5bbf5433d2ba73b9bcd750af9617d4333bd315cb`.
Manifest: 24,112 bytes, `09fa9ab162bd49a091af575cb684109423ecb23347fba3a4ac6cd6ba36005518`.
README: 5,676 bytes, `963af7a406412577e5bee21922982f48fbf6cccf79603fea6e7459c947eca724`.

CRC, every ZIP/extracted member, actual manifest image hash/size, uniqueness and exact counts passed. All 62 images were inspected through private contact sheets and detailed source views. Counts A13/B7/C14/D6/E8/F6/G3/H3 plus two E–F comparisons. Manifest plate label for the comparison group is `E-F`. There are no unrelated package files. `source-feature-map.json` binds every image and 51 feature groups to canonical definitions/instances and resolved step use across all three variants. Feature inventories are observations, not admitted numeric geometry.

The locked V40 PDF remains 11,048,665 bytes / `2f4ea3ae3729bfb6bc92f8fdba30f31937f9df2c3a80e5774ef03fb076f386ce`; original documentation/source locks and public/reference content remain unchanged. No V33 fallback or source regeneration occurred.

## Calibration and uncertainty

Only D/G/H views 01 and 02 have metric candidate calibration. A center-fixed division lens model is fit against selected straight card edges; rounded corners are excluded. Fitted tangent intersections map to an ID-1-compatible 85.60 × 53.98 mm rectangle. Alternating edge samples are withheld, and the independently segmented penny is excluded from the card fit. [ISO historical dimensional reference](https://www.iso.org/standard/31432.html) and [US Mint penny specifications](https://www.usmint.gov/learn/coins-and-medals/circulating-coins/coin-specifications) supply reference dimensions. Actual card conformity, warpage and reference-to-plate plane offset were not measured.

Withheld edge RMS spans 0.344–0.423 annotation pixels. The largest penny diameter discrepancy is 0.621 mm relative to 19.05 mm. These are residual observations, not sufficient uncertainty closure. The stored one-pixel lens sensitivity intervals are broad and are not joint bounds for lens distortion, warpage, perspective-plane offset and feature extraction. Every feature's engineering value remains UNRESOLVED without a numeric payload; all instructional feature uncertainty remains unresolved in the scoped receipts. Candidate numbers live separately and cannot enter canonical measurement/interface/solver/route inputs.

Private annotations mark source landmarks. No full CAD projection overlays or complete source silhouette/slot/cutout residual proof were produced. All such source pixels remain under ignored `digital-twin/evidence/private/m6/`.

## Plate results

| Plate | Result | Engineering | Instructional |
|---|---|---|---|
| A | Complex deck, front/rear opening faces and six upright flanges inventoried; registration/CAD unfinished | BLOCKED | BLOCKED |
| B | Main/flange cutouts and mounting holes inventoried; bent-face registration/CAD unfinished | BLOCKED | BLOCKED |
| C | Four distinct faces with shaped cutouts, slots, hole clusters and tabs inventoried; registration/CAD unfinished | BLOCKED | BLOCKED |
| D | Provisional flat BRep: six holes, four slots, two closed cutouts | BLOCKED | BLOCKED |
| E | Three upright tabs and asymmetric base inventoried; robot RIGHT; CAD unfinished | BLOCKED | BLOCKED |
| F | Three upright tabs and asymmetric base inventoried; robot LEFT; CAD unfinished | BLOCKED | BLOCKED |
| G | Provisional flat capsule bar, three holes | BLOCKED | BLOCKED |
| H | Provisional flat rounded/notched bracket, six holes | BLOCKED | BLOCKED |

E/F visual comparisons support handed counterparts. Exact mirrored dimensions, valid separate mirrored topology, bend/tab placement and F-specific CAD residuals are not proved; runtime scales remain `[1,1,1]`. The working common thickness remains 2 mm PROBABLE, photo supported and owner authorized, without manufacturer certification or stock/tolerance derivation.

D's central opening was not forced square: candidate corrected contours are approximately rectangular, and exact equality is unproved. G width 8.1 mm and H corner radius 3 mm are explicitly provisional rounded appearance choices, not bounded measurements. These choices do not satisfy admission. Candidate frames are replaceable local presentation frames; installed orientation and Plate A instructional origin/engineering datum are not admitted.

## Independent validation and tests

The independent oracle imports generated BReps and interrogates actual geometry rather than trusting generator metadata. D/G/H each have one valid closed solid with positive volume, stock planes at 0/2 mm, real cylindrical through-hole surfaces/voids and required opening topology. Top/bottom boundary-wire counts are D13/G4/H7. Slot end/mid voids and surrounding web, cutout voids and H's open notch are checked. This proves provisional construction only.

| Plate | Max source2 hole-center residual (mm) | Max diameter difference (mm) | Full source gate |
|---|---:|---:|---|
| D | 0.200673 | 0.021997 | BLOCKED |
| G | 0.114977 | 0.099478 | BLOCKED |
| H | 0.122138 | 0.107496 | BLOCKED |

Source2 landmarks are independently corrected. Actual BRep cylinder centers align using a proper rigid 2D transform fitted to two outer holes, without scale or reflection; remaining landmarks are withheld. Small hole disagreement alone does not prove full silhouette or systematic uncertainty bounds.

Two fresh environments, caches, installed wheels and mirror directories ran the same locked-source inputs. Exact cwd/environment/commands/inputs/outputs/exit/hash/bytes are in `evidence/m6/qualification-{a,b}-01/{commands,inputs,upstream-commands,upstream-inputs}.json`. Run A's command ledger initially omitted the two explicit pytest fixture environment keys; these are set in `run.mjs` and recorded in Run B. No PYTHONPATH or global package installation was used.

Each environment passed:

- `<isolated-python> -m pytest cad/tests/test_m6_plates.py cad/tests/test_toolchain.py -q --junitxml=<mirror>/tests.xml`: **64 passed**, 23 M6 plus 41 inherited M4; no failures/skips.
- `node --test --test-reporter=tap digital-twin/validation/expected/plates/instructional/plates.test.mjs`: **53 passed**.
- `node --test --test-reporter=tap digital-twin/validation/m2/tests/contracts.test.mjs`: **12 passed**.
- Selected semantic firewall `--test-name-pattern` recorded verbatim in the ledger: **10 passed**.
- `node digital-twin/tools/compiler/upstream.mjs --check` and `node digital-twin/tools/compiler/gate.mjs --check`: both exit 0 with original M1 locks restored only in each mirror.

Thus 139 tests passed per mirror, repeated twice, not 278 unique tests. Negative CAD cases include capped/missing holes, thousandfold unit scaling, non-solid shells, missing D slot/cutout, missing H notch and datum/thickness promotion. Policy tests reject engineering promotion, premature admission, reversed handedness, negative reflection, hidden features, raw-perspective claims, numeric unknown payloads and private-output routing.

Full eight-plate positive acceptance, bent geometry/mirror tests, full source projections, and complete uncertainty coverage remain unexecuted/unqualified. Full M4 54, M5 101, M1/M2 and M3/native/session suites were not freshly executed. No owner store was read or tested.

## Reproducibility, failures and closure

Raw repeated calibration JSON, oracle JSON, three BReps, three SVGs, generation receipt and installed wheel are byte-identical. Wheel SHA256 `d9143c893de5e7da857df0200ddb7ea17456baa24b0ee93f60e099c4896901b9`, 39,794 bytes. All source/parameter/dependency input snapshots match. No STEP was exported; no serializer timestamp normalization hides geometry differences. Command times and pytest XML timing/path metadata differ naturally. This reproducibility PASS covers three provisional candidates only; full M6 reproducibility remains BLOCKED.

Retained failures include initial `E/F` vs manifest `E-F` contact generation, coarse penny bounds, reused penny-bound metadata, duplicate initial preflight status field and an overly restrictive public-icon mirror filter. Original code/results and corrected results are retained; prior failure history was not rewritten.

`preservation-final.json` confirms all 65 private source files unchanged and ignored, 41 derived private files ignored/untracked, no private-original hash in 140 public files or authored M6 outputs, 1,041 accepted bindings unchanged, twelve original M2 diagnostics unchanged/untracked, empty index and no accepted tracked diff. Only geometric SVG/BRep data are authored outside private roots. No photographs/ZIP/vendor assets/wheels/caches/environments/databases are staged; no remote, hardware, owner session or later milestone operation occurred. Existing SunFounder attribution remains; local geometric reconstruction does not confer source redistribution rights.

The receipt schema deliberately represents unresolved investigation data and requires a reviewed bounded-value extension plus positive tests before admission. It cannot be treated as an acceptance-ready schema. The remaining work is documented in the complete remediation prompt: five bent models, per-face registration, joint uncertainty, complete source projection, proper E/F mirror proof, instructional origins/orientation and all-eight qualification. Engineering blockers independently include Q-03, exact bends/stock/tolerances/alloy/coating/kerf/hole tolerance/hidden details/fit/datums; M5 strict engineering remains blocked with 0 admitted, 3 PARTIAL and 47 BLOCKED.

Rollback: copy/move only the explicitly listed new M6 paths in the structured report to an outside-repository backup, preserving failure receipts and private evidence, then switch back to `codex/m5-purchased-components`. Preserve all twelve M2 diagnostics. Do not reset, clean, rewrite history, delete owner evidence or touch session stores. This procedure is documented, not executed. M6 acceptance SHA is absent; no M7 handoff was created.
