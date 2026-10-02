# Parts-tray completeness audit (after)

Manifest `picarx-companion/src/generated/studio/manifest.json`, pack `466de8923467aca572814e543467268e420d5a668cd035ee92a5fbe64a8a9130`. Canonical counts are printed-stock claims (BOM_RECONCILIATION.md), not a count of the owner's actual loose kit.

| variant | canonical | S01–S09 required | pack instances | tray | rendered 3D | non-renderable | represented | missing | duplicate / unexpected | invariant |
|---|---|---|---|---|---|---|---|---|---|---|
| rpi5 | 156 | 50 | 44 | 44 | 44 | 6 | 6 | 0 | 0 | HOLDS |
| rpi-zero-2-w | 156 | 47 | 41 | 41 | 41 | 6 | 6 | 0 | 0 | HOLDS |

## rpi5

Canonical by disposition: available 111, backup 37, accessory 5, tool 3; 106 are not needed by S01–S09 (later steps, spares, accessories).
Cross-check: 34 printed-stock uses planned for S01–S09; not in the required set: none; first-step mismatches: none.

| instance | first step | how required | no-solid reason | represented as |
|---|---|---|---|---|
| HOOK-002 | S06 | used-not-introduced | abstract: consumable stock with no defined shape | tray tile: No defined shape: cut from tape stock, so it is shown as a tile. |
| LOOP-002 | S06 | used-not-introduced | abstract: consumable stock with no defined shape | tray tile: No defined shape: cut from tape stock, so it is shown as a tile. |
| RIBBON-FPC-001 | S03 | introduced | schematic: no trusted solid (cable or ribbon) | tray tile: No trusted solid: cable and ribbon routing is not modelled, so it is shown as a tile. |
| SCREWDRIVER-01-001 | S01 | tool for PX-V40-TOOL-SCREWDRIVER | tool: no instructional geometry authored | tray tile: No instructional geometry: the kit tool is listed as a tile. |
| SCREWDRIVER-02-001 | S01 | tool for PX-V40-TOOL-SCREWDRIVER | tool: no instructional geometry authored | tray tile: No instructional geometry: the kit tool is listed as a tile. |
| WRENCH-001 | S05 | tool for PX-V40-TOOL-WRENCH | tool: no instructional geometry authored | tray tile: No instructional geometry: the kit tool is listed as a tile. |

Smaller than 6 px in the S00 view at 1168×729: SPRING-WASHER-001 5.3 px, SPRING-WASHER-002 5.3 px, SPRING-WASHER-003 5.3 px, SPRING-WASHER-004 5.3 px, M15X3-SCREW-001 5 px, M15X3-SCREW-002 4.8 px, M15X3-SCREW-003 4.6 px, M15X3-SCREW-004 4.5 px.

Placed only in the refused S09 candidate: ULTRASONIC-001, PLATE-H-001, R3080-RIVET-001, R3080-RIVET-002.

## rpi-zero-2-w

Canonical by disposition: available 111, backup 37, accessory 5, tool 3; 109 are not needed by S01–S09 (later steps, spares, accessories).
Cross-check: 32 printed-stock uses planned for S01–S09; not in the required set: none; first-step mismatches: none.

| instance | first step | how required | no-solid reason | represented as |
|---|---|---|---|---|
| HOOK-002 | S06 | used-not-introduced | abstract: consumable stock with no defined shape | tray tile: No defined shape: cut from tape stock, so it is shown as a tile. |
| LOOP-002 | S06 | used-not-introduced | abstract: consumable stock with no defined shape | tray tile: No defined shape: cut from tape stock, so it is shown as a tile. |
| RIBBON-FPC-001 | S03 | introduced | schematic: no trusted solid (cable or ribbon) | tray tile: No trusted solid: cable and ribbon routing is not modelled, so it is shown as a tile. |
| SCREWDRIVER-01-001 | S01 | tool for PX-V40-TOOL-SCREWDRIVER | tool: no instructional geometry authored | tray tile: No instructional geometry: the kit tool is listed as a tile. |
| SCREWDRIVER-02-001 | S01 | tool for PX-V40-TOOL-SCREWDRIVER | tool: no instructional geometry authored | tray tile: No instructional geometry: the kit tool is listed as a tile. |
| WRENCH-001 | S05 | tool for PX-V40-TOOL-WRENCH | tool: no instructional geometry authored | tray tile: No instructional geometry: the kit tool is listed as a tile. |

Smaller than 6 px in the S00 view at 1168×729: SPRING-WASHER-001 5 px, SPRING-WASHER-002 5 px, SPRING-WASHER-003 5 px, SPRING-WASHER-004 5 px, M15X3-SCREW-001 4.8 px, M15X3-SCREW-002 4.6 px, M15X3-SCREW-003 4.5 px, M15X3-SCREW-004 4.4 px.

Placed only in the refused S09 candidate: ULTRASONIC-001, PLATE-H-001, R3080-RIVET-001, R3080-RIVET-002.
