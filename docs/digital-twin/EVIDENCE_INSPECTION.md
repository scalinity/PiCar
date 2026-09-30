# Physical-reference image inspection

All six JPEGs and IMAGE_INDEX.txt were inspected. The originals are retained byte-for-byte in EVIDENCE/originals, and their SHA-256 values are recorded in EVIDENCE/manifest.json. Crops are legibility aids only. No OCR, geometric calibration, photogrammetric reconstruction or physical measurement was used.

The evidence set consists of photographs of the box and printed instructions. It does **not** contain six views of loose physical components or six views of a completed robot. This distinction controls the scope of every conclusion below.

## E01 — 01_IMG_0526.jpeg

**Content:** Box/front presentation.

**Established:** Visible SunFounder PiCar-X packaging and a printed assembled-product rendering establish product-family context and the pictured visual design.

**Not established:** This is not a photograph of the owner’s assembled car. No mount coordinate, actual board revision, dimensional value or physical completion state follows from the box rendering.

Original: [open image](EVIDENCE/originals/01_IMG_0526.jpeg).

## E02 — 02_IMG_0527.jpeg

**Content:** Additional box presentation.

**Established:** Additional packaging/product imagery helps compare family appearance against the printed manual and identify the PiCar-X kit context.

**Not established:** Box artwork is not measured hardware and cannot establish exact servo/motor/PCB identity, an as-built state or dimensional tolerances.

Original: [open image](EVIDENCE/originals/02_IMG_0527.jpeg).

## E03 — 03_IMG_0528.jpeg

**Content:** Printed parts list and revision.

**Established:** The upper-right marking is Z0104V40. The sheet names plates A–H, separate front/rear wheels, Washer A/B, spring washers, nominal screw/standoff names, opaque rivet codes, TT Motor, Servo (with package), Robot HAT, camera/ultrasonic/grayscale modules, battery, FPC/FFC and 4/5-pin wires, USB accessories, tape/wrap and tools. Framed depictions are labeled backup.

**Not established:** The sheet illustrates inventory; it does not prove all illustrated items are physically present. Photographic perspective/creasing precludes unqualified scale extraction. Rivet digits, servo family and mechanical dimensions cannot be inferred. Printed hardware counts are transcriptions with a visible audit crop, not metrology.

Original: [open image](EVIDENCE/originals/03_IMG_0528.jpeg).

## E04 — 04_IMG_0529.jpeg

**Content:** Printed assembly steps1–5 and Pi branches.

**Established:** Covers Pi4/Pi5 versus Zero2W mounting stacks, board insertion, branch-specific camera ribbon connection, HAT fastening and two motors. S04 depicts four M2.5x6 screws for both branches; a partly occluded screw was checked with crops. S05 supplies motor orientation and four screw/spring-washer/nut allocations.

**Not established:** Branch illustrations provide relationships and names, not full engineering coordinates, connector exact identity or board/component tolerances. Hidden mechanical interfaces remain unresolved.

Original: [open image](EVIDENCE/originals/04_IMG_0529.jpeg).

## E05 — 05_IMG_0530.jpeg

**Content:** Printed assembly steps6–17.

**Established:** Covers tape/battery, horn/ultrasonic/front supports, camera attachment and pan-tilt preparation/ribbon routing. M3x26 supports are installed in S10. S17 introduces power/ZERO/P11 servo preparation.

**Not established:** The exact HAT revision/ZERO applicability, dimensional interface geometry and metric cable routes are not established merely by these depictions. A printed zero procedure is not a measured angle on the owner’s servo.

Original: [open image](EVIDENCE/originals/05_IMG_0530.jpeg).

## E06 — 06_IMG_0531.jpeg

**Content:** Printed assembly steps18–29 and final wiring.

**Established:** Shows tilt/pan/steering horn attachment with repeated zeroing, Washer A at S19, the free-turning G/horn joint at S21, D/grayscale, E-right/F-left steering carriers, three Washer B per front wheel, rear wheels, sensor wires and final HAT port labels.

**Not established:** Exact fastener head/thread/pitch, rivet grip/stack dimensions, hidden cable pin mapping, actual connector engagement and physical completion remain unverified. Final 3V3 labeling must be reconciled with the generic repository sensor text before claiming electrical applicability.

Original: [open image](EVIDENCE/originals/06_IMG_0531.jpeg).


## Count and legibility audit

The hardware crop preserves the printed M1.5x3 layout: nine unframed screws plus two framed backup depictions. BOM_RECONCILIATION records that as printed primary9/backup2, consistent with prescribed uses4+4+1. The S04 crops preserve the four-screw interpretation for both mounting branches. These findings remain reviewable against the full originals; a later contradiction becomes a source conflict, not a silent overwrite.

[Hardware crop](EVIDENCE/crops/hardware-crop.png) · [S04 Pi4/Pi5 crop](EVIDENCE/crops/s04-pi45-crop.png) · [S04 Zero2W crop](EVIDENCE/crops/s04-zero-crop.png)

## Formal evidence conclusions

VERIFIED as **printed statements/depictions**: PiCar-X identity, Z0104V40 revision, 29-step numbering, plate labels, named hardware, branch order, prescribed allocation counts and visible orientation/wiring labels. DERIVED as **planning arithmetic**: per-variant required fastener use and expected unused printed stock. PROBABLE or UNRESOLVED: exact OEM component equivalence, all unmeasured mechanically important geometry, actual inventory and physical match. No precise dimension was promoted because a component looked familiar.

The source-panel links in the ledger point to the photograph and printed step number, not a guessed PDF page. PDF-page cross-links are added only after M0 reads the actual booklet bytes and verifies their mapping. User photos are private evidence; this package does not authorize publishing them in an app or public repository.
