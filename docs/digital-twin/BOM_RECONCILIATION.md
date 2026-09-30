# Printed BOM and inventory reconciliation
The table counts the unframed primary hardware and framed backup hardware depicted in photo 03 and reconciles the prescribed uses in photos 04–06. The printed note identifies framed items as backup. **These are printed-stock claims, not a count of the owner's actual loose kit items.** M1 records that scope explicitly; physical inventory remains UNRESOLVED until an adequate noninvented source exists.

The M1.5x3 depiction contains nine unframed screws (four in the upper row, five in the lower row) and two framed backup screws: eleven printed total, not ten. The larger crop included in EVIDENCE preserves this interpretation for review. Any contradictory official V40 BOM must become an explicit conflict record, not a silent count overwrite.

| Hardware | Primary | Backup | Total | Pi4 use | Pi5 use | Zero2W use | Allocation |
|---|---:|---:|---:|---:|---:|---:|---|
| M2.5x6 screw | 8 | 2 | 10 | 8 | 8 | 8 | S01×4 + S04×4 |
| M3x25 screw | 4 | 2 | 6 | 4 | 4 | 4 | S05×4 |
| Spring washer | 4 | 2 | 6 | 4 | 4 | 4 | S05×4 |
| M3 nut | 4 | 2 | 6 | 4 | 4 | 4 | S05×4 |
| M1.5x3 screw | 9 | 2 | 11 | 9 | 9 | 9 | S08×4 + S13×4 + S21×1 |
| M3x6 screw | 4 | 2 | 6 | 4 | 4 | 4 | S10×2 + S23×2 |
| M2.5x18+6 standoff | 4 | 2 | 6 | 4 | 4 | 2 | Pi4/Pi5 S01×4; Zero2W S02×2 |
| M2.5x18 standoff | 4 | 2 | 6 | 4 | 4 | 0 | Pi4/Pi5 S02×4 |
| M2.5x11 standoff | 2 | 2 | 4 | 0 | 0 | 2 | Zero2W S01×2 |
| M2.5x30 standoff | 2 | 2 | 4 | 0 | 0 | 2 | Zero2W S01×2 |
| M3x26 standoff | 2 | 2 | 4 | 2 | 2 | 2 | S10×2 |
| R2048 rivet | 4 | 2 | 6 | 4 | 4 | 4 | S12×4 |
| R2056 rivet | 6 | 2 | 8 | 6 | 6 | 6 | S14×2 + S15×2 + S20×2 |
| R3055 rivet | 2 | 2 | 4 | 2 | 2 | 2 | S24×2 |
| R3065 rivet | 6 | 2 | 8 | 6 | 6 | 6 | S25×6 |
| R3080 rivet | 2 | 2 | 4 | 2 | 2 | 2 | S09×2 |
| R30185 rivet | 2 | 2 | 4 | 2 | 2 | 2 | S26×2 |
| Washer A | 1 | 1 | 2 | 1 | 1 | 1 | S19×1 |
| Washer B | 6 | 2 | 8 | 6 | 6 | 6 | S26×6 |

## Non-fastener installed items

The selected 29-step assembly uses A–H once each; two TT motors; two rear and two front wheels; three role-specific servos; three role-specific horns; three smallest-package retaining screws; one battery; one Robot HAT; one user-supplied selected Pi; one camera; one ultrasonic board; one grayscale board; one selected camera ribbon; one 4-pin cable; one 5-pin cable; and one allocated hook and loop piece each. Pi4/Pi5's shared mounting panel also shows the USB mini microphone insertion. The Zero2W microphone/adapter is not prescribed by that panel and remains an accounted accessory.

Servo-package spare horn/screw quantities, whether repeated cable drawings denote multiple supplied cables or opposite views, exact tape/wrap stock, and any actual-versus-printed inventory discrepancies remain Q-13. Do not multiply all package accessory drawings by three without evidence. Distinguish integrated motor/servo/battery leads from separately supplied wire assemblies.

## Reconciliation equations

For each fixed-count definition and selected variant:

```text
printedTotal = printedPrimary + printedBackup
plannedUse <= printedPrimary
variantUnusedPrimary = printedPrimary - plannedUse
expectedUninstalled = variantUnusedPrimary + printedBackup
actualInventoryCheck = BLOCKED when actual supplied quantity is unknown
```

For a physical session with adequate inventory evidence:

```text
observedSupplied = installed + staged + available + consumedOrDiscarded + missingOrDamaged
```

The last two terms require explicit events and cannot silently absorb a discrepancy. Temporary P11 connection does not consume another lead. Moving a gimbal subassembly does not introduce another camera or servo. A rivet pin/body pair is one supplied rivet with owned elements. Consumables use source-lot/piece accounting; review reversal is not a claim of physically uncut material.

Generate a quantity report by step, variant, definition and instance. Unknown quantities make the affected equality BLOCKED. They must not be set to zero to make the report pass. Every unused item has a declared disposition; “no orphan digital component” means no unexplained identity, not that every supplied item must be installed on the final robot.
