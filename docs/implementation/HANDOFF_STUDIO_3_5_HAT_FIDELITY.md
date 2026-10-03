# Studio 3.5 handoff: the owner's Robot HAT V4 as a display-detail model

The Robot HAT display (`PX-V40-DEF-ROBOT-HAT`) is rebuilt from the owner's 609 photographs and two Object Capture scans, in the adopted instructional HAT frame, as a drop-in replacement for the outline display. It is presentation work, built beside Studio 3 for later integration. It is not M7 acceptance: `G-INSTRUCTIONAL-ASSEMBLY` stays BLOCKED at 0/58, S07 stays blocked, S09 stays refused, G-CAD stays blocked and M8 is not authorized. Evidence is in `docs/implementation/evidence/studio-3-5-hat/`.

## Identity

| | |
|---|---|
| branch | `studio/s3-5-hat-fidelity` |
| worktree | `/Users/danny/Documents/Apps/PiCar-HAT-Fidelity` |
| starting HEAD | `59e5ded78baccadf25b4b63bc2266d9210b4ee70` (Studio 2 final checkpoint, reviewed READY FOR STUDIO 3) |
| definition | `PX-V40-DEF-ROBOT-HAT`, instance `PX-V40-INS-ROBOT-HAT-001`, both unchanged |
| display review | `digital-twin/assemblies/v40/presentation/instructional/hat-detail-display-review-02.json` (`PX-STUDIO-HAT-DETAIL-DISPLAY-02`, supersedes `PX-STUDIO-HAT-OUTLINE-DISPLAY-01`) |
| display artifact | `digital-twin/validation/expected/m7/fidelity/display/PX-V40-DEF-ROBOT-HAT.display.brep`, sha256 `825e2f068d41fac21ca1a32ebeae410f7c5aef4eb5d717b20c22b0c75777abda` |
| checked instructional artifact | `digital-twin/validation/expected/m5/instructional-artifacts/PX-V40-DEF-ROBOT-HAT.brep`, sha256 `bbdbbeb7…d8461a`, unchanged |

## Source evidence inventory

The owner's folder `docs/Robot HAT 3D Renders and Images/` in the main checkout (untracked, never copied; now in `.gitignore`) holds 613 files. `hat-evidence-manifest.json` records every file's sha256, pixel size, depth-map presence and 35 mm focal length, and nothing else from EXIF.

- **609 photographs** (HEIC), exactly the expected count: 502 portrait 3024 × 4032 and 107 landscape 4032 × 3024 after the HEIC transform; every EXIF orientation tag reads 1. Photo-set aggregate sha256 `dfb8320748894a366dc2b60309afa1f3056d5cabee4779ce615ab2b8bebaad15`; all-files aggregate `cf915d5d081b98198475c4bb6ab79ac80367714689fc23698435c2f02210f727` (SHA-256 over sorted `<sha256>  <relative path>` lines).
- **2 scans**, Apple Object Capture USDZ (baked mesh with colour, normal, roughness, AO and displacement maps): `Robot HAT Top.usdz` (18,000,326 B, `aee73d6c…6529d6`, 32,107 vertices) and `Robot HAT Bottom.usdz` (16,282,479 B, `d929aca6…1e81084`, 25,376 vertices).
- **2 reference JPEGs**, 700 × 932: `Top HAT.jpg` (`081eb4e7…dcc330`) and `Bottom HAT.jpg` (`e9bcf7fa…98f9f0`).
- No GLB, GLTF, OBJ, PLY or STL is present.
- 0 byte duplicates, 157 near-duplicate pairs, **0 unusable** (the five lowest-sharpness frames were inspected and kept). 450 frames register by SIFT onto two frames rectified on the four datum bores (PIC_0001 top, IMG_0004 underside); the 159 that do not are low-angle turntable views whose board plane is too oblique to register.

| class | frames | | class | frames |
|---|---|---|---|---|
| low-angle turntable (unregistered) | 159 | | bottom low angle, east edge | 16 |
| bottom oblique | 122 | | pin-header close-up | 10 |
| top oblique | 106 | | connector close-up | 9 |
| bottom low angle, west edge | 77 | | top low angle, north edge | 8 |
| top orthogonal | 45 | | bottom low angle, south edge | 4 |
| bottom orthogonal | 26 | | silkscreen and component close-up | 3 |
| bottom low angle, north edge | 22 | | top low angle, south edge | 2 |

Scan registration: the board plane by RANSAC, then a similarity onto the four datum bores. Top scan scale 1.0345, 0.21 mm RMS; underside scan a reflected similarity, scale 1.0200, 0.14 mm RMS. Photo rectification residual 0.17 mm RMS over the 40 GPIO pads.

## Physical board identity

"Robot Hat V4" is legible on both faces in several frames; the top silkscreen carries the board code `01902V44` beside the GPIO pad field. No further revision or date marking is legible, so any sub-revision is unresolved. The board is white solder mask on both faces with black silkscreen, which the outline display (blue) did not show.

## The outline display it replaces

`PX-STUDIO-HAT-OUTLINE-DISPLAY-01`: 12 solids in a 51,120-byte BRep: an approximate 85 × 56 PCB outline in `pcb-blue`, a schematic speaker block, nine schematic connector boxes in `connector-cream` and a schematic underside socket in `header-black`. It had no pins, no ICs, no silkscreen and the wrong board colour. Its own limitations said the top components kept the schematic proxy layout.

## Modelling architecture

- `digital-twin/cad/twin_cad/fidelity/hat_board.py` (new) builds the board from the review record alone. Every dimension in the review states its basis: **datum** (taken from the adopted instructional HAT, never changed), **scan**, **photo**, **standard** (published connector or package sizes, consistent with the photographs) or **approximate**. `measuredByCaliper` is empty.
- `digital-twin/cad/twin_cad/fidelity/hat.py` (rewritten) refuses a changed predecessor (`HAT_PREDECESSOR_CHANGED`) or bores that differ from the adopted ones (`HAT_BORES_DIFFER`). It writes the display BRep and record (schema `picar-studio-display-check/1`, unchanged) and runs the overlap check of every display solid in every closure that places the HAT.
- Finishes are grouped into **32 solids, one per finish region** (all pins one solid, all solder one solid, all silkscreen one solid, and so on), so the Studio draws one mesh per solid. Two-sided finishes are joined through the board's inner plates; those hidden joins meet only inside the board volume and away from the bores.
- Repeated features (pins, joints, passives, glyphs) each come from one parametric builder, and every member joins its finish's single solid, so 75 pins add one mesh, not 75. The display pipeline meshes BRep solids and has no instancing; the per-finish grouping is what bounds the draw calls.
- Exports are byte-stable. No chamfer or fillet goes through OCC-hash-ordered edge selectors (pins are the intersection of two extruded side profiles), and outlines and silkscreen frames are explicit wires whose lines run between computed arc ends. A Workplane chain or `slot2D` can keep either of two end points that differ in the last digit, which was the one unstable input found.
- `digital-twin/cad/twin_cad/fidelity/hat_review.py` tessellates at the Studio's tolerances (0.02 mm linear, 0.15 rad angular) for the review renders and statistics. `digital-twin/presentation/blender/hat_review_render.py` renders the ten review views (Cycles, AgX, product three-point light, no depth of field) and, with `--registered`, the 40 px/mm top and underside used for photo comparison.

## Results by feature

**PCB.** 85.0 × 56.0 × 1.6 mm on the datum envelope (scan 84.8 × 56.0; underside photo 55.75 wide). Corner radii 3.5 mm on the x = 0 edge and 3.0 mm on the x = 85 (speaker) edge, the cable slot (x 66.9–74.2, 5.35 deep, r 1.0) and the J20 speaker notch are photo-derived. White mask 0.04 mm on both faces over a tan FR4 core that shows at the edges and bores.

**Mounting and frame.** The four bores (r 1.4 at (3.5, 3.5), (61.5, 3.5), (3.5, 52.5), (61.5, 52.5)) are measured on the display PCB core and equal the adopted HAT's bores: maximum centre deviation 0.0 mm. Board box (0, 0, 0)–(85, 56, 1.6) within 1e-6 mm. The silkscreen rings around the bores (r 3.0, 0.16 wide, photographed on both faces) sit flush in the mask, because screw heads and standoff tops bear on the board there; raised rings had added 20 ink-contact overlap rows that are not physical.

**Headers and pins.** 75 individual male pins, each its own prism (0.64 mm square, 2.5 mm plastic, 6.0 mm above, chamfered tips, tails 1.0 mm below), at 2.54 mm pitch confirmed by the underside joint lattices (0.07–0.14 mm mean residual):
- servo field, 60 pins: banks ADC 0–3 and DIGITAL 8–11 (left), PWM 0–3, 4–7 and 8–11 (right), each row SIG / 5V / GND in yellow / red / black housings as photographed;
- SPI 7 pins (GND 3V3 MO MI SCK CS BSY), I²C 4 pins (GND 3V3 SDA SCL), UART 4 pins (GND 3V3 TXD RXD), black housings.
- GPIO: 40 pads (40 of 40 matched, 0.17 mm RMS) and a 2 × 20 female socket on the underside, 15.5 mm deep (scan 15.75 at the bore-fitted scale; 18 mm standoffs less the Pi's 2.5 mm header base), centred on the Pi header axis (32.5, 52.5).

**Connectors.** MOTOR1 and MOTOR2 (JST XH 2-pin vertical, pins from the underside joints), J21 battery (JST XH 3-pin side entry, scan-placed, with its latch windows), the 4-pin I²C (JST SH side entry), J20 speaker receptacle with its white two-wire plug, the USB-C charging receptacle (8.94 × 3.26 shell, tabs from the photographs), the power slide switch (shown ON), three tactile buttons (USR, RST, ZERO) with beige actuators, and the four SWD pads on the underside (3V3, GND, SWDIO, SWCLK).

**Speaker.** 20.6 × 30.1 mm body, r 5.5, 7.0 mm tall over the board, footprint and top height (z 8.4–8.9) from the scan, frame, surround and felt diaphragm from the photographs. Its lead runs from the J20 plug over the top and, as a twisted red and black pair, through the cable slot along the underside: an approximate route, one photographed state of a flexible cable.

**Major components.** Bodies and lead rows placed on the rectified top photograph and close-ups, with standard package outlines: U8 LQFP48 (ARTERY AT32F413CBT7), U7 SOP16 (TC1508A motor driver), U5 SOP14 (HC00), U3 SOP8 (NS4168 amplifier), U4 and U10 SOP8, U6 QFN24, U9 SOT223, Q2 TSSOP8, U1 SOT23-6, Q1 SOT23, D7 SMA, Y1 3225 crystal, and the shielded inductors L2 ("150", 9.6 mm) and L1 ("2R2", 5.4 mm) with scan heights. Markings read from close-ups are recorded in the review, not modelled, apart from the inductor values.

**Small components and silkscreen.** 75 passives (0603, 0805, 1206) located on the rectified top photograph on a 0.5 mm grid; six LEDs. Silkscreen: 19 top and 5 underside label sets, 15 outline boxes, signal-label rows, two hatch strips and the CE, FCC and RCM marks. Each label is fitted to its photographed glyph box, in DejaVu Sans from the frozen M4 environment, because the board's typeface is narrower. Micro-print reference designators of passives are omitted.

**Underside.** The GPIO socket, every through-hole joint, the SWD pads, the "Robot Hat V4 / SunFounder / MAKE IT EASY / MAKE IT FUN / www.sunfounder.com" block, the certification marks, the bore rings and the twisted lead.

## Dimensions and confidence

| basis | what it covers |
|---|---|
| measured (caliper) | nothing yet: `measuredByCaliper` is empty |
| datum | bores, board plane, thickness, local frame |
| scan | socket depth, connector, switch and button heights, USB-C, battery, I²C and J20 positions, speaker footprint and height, inductor heights, pin-tail protrusion, outline cross-check |
| photo | outline corners, cable slot and notch, GPIO pads, servo and header lattices, connector pins, IC and passive positions, LEDs, SWD pads, silkscreen, colours |
| standard | pin pitch and heights, connector housings, package outlines, USB-C shell |
| approximate | button bodies, speaker lead routing |

The review record states the basis of every group; `test_every_dimension_names_its_basis_and_none_claims_a_caliper` holds it to that.

## Photo comparison

Registered orthographic renders of the final meshes against the owner photographs rectified through the four datum bores, 40 px/mm. Features are the dark or saturated pixels inside the board. Recorded in the review's `photoComparison`:

| face | frame | silhouette IoU | model → photo edge (median / p90) | photo → model edge (median / p90) |
|---|---|---|---|---|
| top | PIC_0001 | 0.623 | 0.00 / 0.44 mm | 0.17 / 1.46 mm |
| underside | IMG_0097 | 0.550 | 0.03 / 0.49 mm | 1.04 / 18.5 mm |

Every modelled edge lies on a photographed feature. The photo-only edges on top are the micro-print designators and via fields. On the underside, 38 % of photo edges sit more than 3 mm from any model feature. They are the dark cores of the through-hole joints, the bore rims and the USB-C tab holes, which the model has at those positions but renders as bright tin. That is a finish-contrast difference, not missing geometry. Overlays and rectified photographs stayed in scratch and were deleted.

## Statistics

| | |
|---|---|
| solids (meshes, draw calls) | 32 (test bound: ≤ 40) |
| vertices / triangles at Studio tolerance | 365,579 / 353,540 |
| heaviest meshes | silkscreen 132,584 triangles, solder and pads 100,120, each underside lead strand about 14,200 |
| materials | 19 (15 new `owner-photo` entries in `studio-materials.json`; `contact-gold`, `port-nickel`, `header-black`, `speaker-dark`, `connector-cream` reused) |
| textures / decals | none: silkscreen and markings are geometry |
| BRep | 18,465,633 bytes (2.4 MB compressed in git; `-text -diff` in `.gitattributes` already) |
| display record | 27 KB |

Colours come from the owner's top photograph, normalised so the white mask lands at 0.80; the USB-C shell and connector whites are set by eye where the photographs show reflections or shade, and say so.

## Alignment and preservation

- Nothing under the M2, M5, M6 or M7 instructional trees, no closure, pose, recipe, `closure.py` or `closure_verify.py` is changed.
- The overlap check ran in all ten closures that place the HAT (S04 to S08 for each variant); their RFC 8785 hashes are identical in the outline record and this one, and the display BRep bytes are the same after the record was regenerated.
- 50 positive rows: the same 40 M2.5 × 6 screw contacts the outline display recorded (0.03–2.6 mm³, values unchanged), plus 5 per board where the photographed socket engages the Pi 5 and Zero 2 W solid 8 mm header proxies (348 and 524 mm³; the real pins enter about 6 mm). Both are explained in the record's limitations, which the Studio shows.
- The Zero HAT's 180° relation to the Pi 5 HAT pose is untouched.

## Privacy

Tracked changes hold no owner photograph, scan, rectified image, overlay, crop or EXIF; no absolute or private path; no analysis cache, photogrammetry working directory or agent runtime file; no credential or private URL. The manifest names files by their relative names and carries hashes, sizes and the focal length only. The ten renders carry only Blender's 72 dpi resolution EXIF and Cycles' sample and render-time text (stamps off: no date, host or file name), the same as the tracked Studio renders. `.gitignore` now lists `/docs/Robot HAT 3D Renders and Images/` beside `/digital-twin/evidence/private/`, so a broad add in the main checkout cannot sweep the 609 photographs and two scans in. The analysis scratch (decoded frames, height maps, rectified photos, overlays) lives outside the repository and is deleted at close.

Trademarks: the board's own markings (SunFounder, CE, FCC, RCM) are reproduced as photographed silkscreen for this personal twin. They are the board's identity, not branding to reuse elsewhere.

## Validation

- `pytest digital-twin/cad/tests/test_studio_fidelity.py digital-twin/cad/tests/test_hat_display.py`: 32 passed (8 HAT tests and the full Studio fidelity suite). The HAT tests cover: rebuild to the recorded bytes twice; every solid valid and every material defined; adopted frame, plane and bores; 75 pins as separate faces of 0.64 mm squares at 2.54 mm; pins still separate after Studio tessellation; GPIO pads and socket on the Pi header axis; every dimension's basis named and no caliper claim; draw calls bounded.
- `test_hat_display_outline_is_reproducible_and_keeps_the_adopted_features` is removed with the outline model it pinned; `test_hat_display_retains_original_checked_bytes_and_source_bound_overlap_checks` still passes.
- Disposable pack run against the final record (chain `hat35-01`, tessellation `hat35-03`, both under the ignored `digital-twin/generated/studio/`; the two tracked pack files restored afterwards): pack `bff0e9f0…9898d1`, 21 definitions, 49 instances, 349 checks. `studio.mjs check`: integrity PASS, freshness FRESH, presentation STALE for exactly two expected reasons, `PRESENTATION_PACK_STALE` and `PRESENTATION_INPUT_CHANGED studio-materials.json`, which the Blender rebuild at integration clears. Studio runtime suite: 238 of 238 passed, including the HAT screw-contact wording test (still "Screw contacts", maximum 2.6 mm³). Tray audit: HOLDS on both variants, exit 0.
- No runtime schema, pack format or consumer change was needed: the display record keeps schema `picar-studio-display-check/1`, and the pack takes each solid's `materialId` from it.
- Not run here, by design: the Blender presentation rebuild (it writes the tracked `picar-studio.blend`, which Studio 3 owns while it runs) and the companion dev server (port 1420 belongs to the Studio 3 session).

## Remaining approximations

- No caliper measurements: every dimension is datum, scan, photo, standard or approximate.
- IC markings (other than the inductor values), passive reference designators, via fields and the copper traces seen through the mask are not modelled; packages are standard outlines on the photographed bodies.
- Button bodies and the speaker lead routing are approximate.
- The display socket and pad field follow the photographs (centre y 52.5); the instructional schematic socket (y 47.6–52.6, 10 mm deep) is unchanged and remains what assembly checks use.
- Overlap checks compare the display with instructional artifacts, not display-to-display pairs.

## Files

| file | change |
|---|---|
| `digital-twin/cad/twin_cad/fidelity/hat_board.py` | new: the board builder |
| `digital-twin/cad/twin_cad/fidelity/hat.py` | rewritten: entry point, predecessor and bore guards, record and overlaps |
| `digital-twin/cad/twin_cad/fidelity/hat_review.py` | new: Studio-tolerance meshes and statistics |
| `digital-twin/assemblies/v40/presentation/instructional/hat-detail-display-review-02.json` | new: every dimension, its basis, photo comparison, limitations |
| `digital-twin/validation/expected/m7/fidelity/display/PX-V40-DEF-ROBOT-HAT.display.{brep,json}` | regenerated |
| `digital-twin/presentation/materials/studio-materials.json` | 15 materials appended |
| `digital-twin/cad/tests/test_hat_display.py` | new |
| `digital-twin/cad/tests/test_studio_fidelity.py` | outline-model test removed |
| `digital-twin/presentation/blender/hat_review_render.py` | new: review renders |
| `docs/implementation/evidence/studio-3-5-hat/hat-evidence-manifest.json` | new |
| `docs/implementation/evidence/studio-3-5-hat/renders/01…10-*.png` | new: ten review renders |
| `docs/digital-twin/ASSEMBLY_STUDIO_PIPELINE.md` | HAT sentence and commands |
| `.gitignore` | the owner's HAT evidence folder |
| `docs/implementation/HANDOFF_STUDIO_3_5_HAT_FIDELITY.md` | this handoff |

Nothing in the Studio runtime, session persistence, tray state, build-along UI, M3 persistence, routing or renderer code is touched, and no pack or presentation file is committed.

## Integration after Studio 3

Run this once Studio 3 is committed and its session has ended. `<py>` is the frozen M4 environment from the pipeline doc.

1. In the checkout that holds Studio 3, with a clean tree: `git checkout studio/s3-build-along`.
2. `git cherry-pick 59e5ded78baccadf25b4b63bc2266d9210b4ee70..origin/studio/s3-5-hat-fidelity`: the three commits listed below, in order. Every path except three is HAT-only. Those three can conflict if Studio 3 edited them: `docs/digital-twin/ASSEMBLY_STUDIO_PIPELINE.md` (the HAT sentence and the commands block), `digital-twin/presentation/materials/studio-materials.json` (keep both sets of appended materials) and `.gitignore` (one line).
3. `node digital-twin/tools/studio/studio.mjs chain --python <py> --label <run>` with a new label.
4. `PYTHONPATH=digital-twin/cad <py> -m twin_cad.fidelity.hat --root "$PWD" --chain digital-twin/generated/studio/chain/<run> --output digital-twin/validation/expected/m7/fidelity/display`. Expect `artifactSha256` `825e2f06…77abda` again and 50 positive overlaps; the record's `overlaps.chain` becomes `<run>`. A guard refusal, a different hash or any other overlap row means Studio 3 changed the adopted HAT or a closure that places it: stop and find out which. Never weaken the overlap check to get past it.
5. `PYTHONPATH=digital-twin/cad <py> -m pytest digital-twin/cad/tests/test_studio_fidelity.py digital-twin/cad/tests/test_hat_display.py`.
6. `studio.mjs tessellate --python <py> --chain <run> --label <run>`, then `studio.mjs pack --chain <run> --tessellation <run>`.
7. `studio.mjs blender --render`. The new `MAT-studio-*` materials are created on first use and existing ones are kept, so `--reset-presentation` is not needed.
8. `studio.mjs check`: integrity PASS, freshness FRESH, presentation CURRENT. Then the runtime suite (`npx vitest run --config vitest.config.ts tests/studio` in `picarx-companion/`) and a look at S04 in the Studio.
9. Commit the regenerated record, pack and presentation on Studio 3's branch as its own commit.

## Commits

On `studio/s3-5-hat-fidelity`, from `59e5ded`:

1. `a4bac7c` HAT: reconstruct high-fidelity Robot HAT display model: the builder, entry point, review record, materials, display BRep and record, and tests.
2. `d435f8e` HAT: add evidence bindings and fidelity validation: the evidence manifest, review-render script, ten renders, pipeline spec and `.gitignore`.
3. The commit that adds this handoff.

Commit 1 carries every input of the HAT and Studio fidelity tests: no test or builder reads a file the later commits add. The tests were run on the final tree. Studio 3 was not merged, rebased onto or touched.
