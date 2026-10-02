# Parts-tray completeness audit (before)

Manifest `../../../../../private/tmp/claude-501/-Users-danny-Documents-Apps-PiCar/8837b302-ee0a-4f27-94c1-ae9392c711ab/scratchpad/manifest-studio1.json`, pack `7dcd6252a32a89b6f87f45dd25c263d91a902111341f6c5a274f3dd8851efa0a`. Canonical counts are printed-stock claims (BOM_RECONCILIATION.md), not a count of the owner's actual loose kit.

| variant | canonical | S01–S09 required | pack instances | tray | rendered 3D | non-renderable | represented | missing | duplicate / unexpected | invariant |
|---|---|---|---|---|---|---|---|---|---|---|
| rpi5 | 156 | 50 | 44 | 44 | 44 | 6 | 0 | 6 | 0 | FAILS |
| rpi-zero-2-w | 156 | 47 | 41 | 41 | 41 | 6 | 0 | 6 | 0 | FAILS |

## rpi5

Canonical by disposition: available 111, backup 37, accessory 5, tool 3; 106 are not needed by S01–S09 (later steps, spares, accessories).
Cross-check: 34 printed-stock uses planned for S01–S09; not in the required set: none; first-step mismatches: none.

| instance | first step | how required | no-solid reason | represented as |
|---|---|---|---|---|
| HOOK-002 | S06 | used-not-introduced | abstract: consumable stock with no defined shape | **nothing (silent omission)** |
| LOOP-002 | S06 | used-not-introduced | abstract: consumable stock with no defined shape | **nothing (silent omission)** |
| RIBBON-FPC-001 | S03 | introduced | schematic: no trusted solid (cable or ribbon) | **nothing (silent omission)** |
| SCREWDRIVER-01-001 | S01 | tool for PX-V40-TOOL-SCREWDRIVER | tool: no instructional geometry authored | **nothing (silent omission)** |
| SCREWDRIVER-02-001 | S01 | tool for PX-V40-TOOL-SCREWDRIVER | tool: no instructional geometry authored | **nothing (silent omission)** |
| WRENCH-001 | S05 | tool for PX-V40-TOOL-WRENCH | tool: no instructional geometry authored | **nothing (silent omission)** |

Missing (neither drawn nor represented): HOOK-002, LOOP-002, RIBBON-FPC-001, SCREWDRIVER-01-001, SCREWDRIVER-02-001, WRENCH-001.

Smaller than 6 px in the S00 view at 1168×729: SPRING-WASHER-001 4.2 px, SPRING-WASHER-002 4.2 px, SPRING-WASHER-003 4.3 px, SPRING-WASHER-004 4.3 px, M15X3-SCREW-001 5.1 px, M15X3-SCREW-002 5.1 px, M15X3-SCREW-003 5.2 px, M15X3-SCREW-004 5.2 px.

Hidden behind a nearer part in the S00 view: M25X18PLUS6-STANDOFF-001 by PLATE-A-001 (83%), M25X18PLUS6-STANDOFF-002 by PLATE-A-001 (100%), M25X18PLUS6-STANDOFF-003 by PLATE-A-001 (100%), M25X18PLUS6-STANDOFF-004 by PLATE-A-001 (100%), M25X6-SCREW-001 by PLATE-A-001 (100%), M25X6-SCREW-002 by PLATE-A-001 (100%), USB-MICROPHONE-001 by PLATE-A-001 (100%), M25X6-SCREW-005 by PLATE-A-001 (100%).

Placed only in the refused S09 candidate: ULTRASONIC-001, PLATE-H-001, R3080-RIVET-001, R3080-RIVET-002.

## rpi-zero-2-w

Canonical by disposition: available 111, backup 37, accessory 5, tool 3; 109 are not needed by S01–S09 (later steps, spares, accessories).
Cross-check: 32 printed-stock uses planned for S01–S09; not in the required set: none; first-step mismatches: none.

| instance | first step | how required | no-solid reason | represented as |
|---|---|---|---|---|
| HOOK-002 | S06 | used-not-introduced | abstract: consumable stock with no defined shape | **nothing (silent omission)** |
| LOOP-002 | S06 | used-not-introduced | abstract: consumable stock with no defined shape | **nothing (silent omission)** |
| RIBBON-FPC-001 | S03 | introduced | schematic: no trusted solid (cable or ribbon) | **nothing (silent omission)** |
| SCREWDRIVER-01-001 | S01 | tool for PX-V40-TOOL-SCREWDRIVER | tool: no instructional geometry authored | **nothing (silent omission)** |
| SCREWDRIVER-02-001 | S01 | tool for PX-V40-TOOL-SCREWDRIVER | tool: no instructional geometry authored | **nothing (silent omission)** |
| WRENCH-001 | S05 | tool for PX-V40-TOOL-WRENCH | tool: no instructional geometry authored | **nothing (silent omission)** |

Missing (neither drawn nor represented): HOOK-002, LOOP-002, RIBBON-FPC-001, SCREWDRIVER-01-001, SCREWDRIVER-02-001, WRENCH-001.

Smaller than 6 px in the S00 view at 1168×729: SPRING-WASHER-001 4.9 px, SPRING-WASHER-002 4.2 px, SPRING-WASHER-003 4.3 px, SPRING-WASHER-004 4.3 px, M15X3-SCREW-001 5.6 px, M15X3-SCREW-002 5.7 px, M15X3-SCREW-003 5.7 px, M15X3-SCREW-004 5.8 px.

Hidden behind a nearer part in the S00 view: M25X11-STANDOFF-001 by PLATE-A-001 (100%), M25X11-STANDOFF-002 by PLATE-A-001 (100%), M25X30-STANDOFF-001 by PLATE-A-001 (100%), M25X30-STANDOFF-002 by PLATE-A-001 (100%), M25X6-SCREW-001 by PLATE-A-001 (100%), M25X6-SCREW-002 by PLATE-A-001 (100%), M25X6-SCREW-005 by PLATE-A-001 (100%), M25X6-SCREW-006 by PLATE-A-001 (100%), M25X6-SCREW-007 by PLATE-A-001 (100%), M25X6-SCREW-008 by PLATE-A-001 (100%).

Placed only in the refused S09 candidate: ULTRASONIC-001, PLATE-H-001, R3080-RIVET-001, R3080-RIVET-002.
