# Product specification

## 1. Product contract

Create one cohesive local-first PiCar-X companion, not a separate demonstration app. Preserve setup, searchable reference pages, local SunFounder documentation, PDF viewing, video-course navigation, and companion-authored overlays. Replace the *assembly experience inside that journey* with a revision-specific interactive engineering manual.

The authoritative product revision is **Z0104V40**. The first release supports three explicit assembly variants: **Raspberry Pi 4 Model B**, **Raspberry Pi 5**, and **Raspberry Pi Zero 2 W**. Existing documentation mentioning Pi 3 stays available, but there is no selectable Pi 3 digital-twin branch in this release.

The robot begins unassembled in a digital workbench. Each printed instruction becomes a reversible visualization of a structured state transition. The user sees the components, hardware, interfaces, orientation, checks, and source evidence for the current operation. Every physical item used by assembly is identifiable; purchased multi-element items and integrated leads follow the ownership rules in the data model.

**D-PRODUCT-01:** A 3D view is an explanatory projection, not proof that the physical robot was assembled. Always distinguish **instruction coverage**, **user-confirmed physical progress**, and **geometry assurance**.

## 2. Release modes and scope

The application has one assembly workspace with per-step capability, not three competing applications.

| Capability | Permitted behavior |
|---|---|
| Reference-only | Show the V40 panel, instructions, parts/hardware list, source links, warnings, progress and unresolved items. Do not synthesize missing silhouettes or final poses. |
| Approved nominal 3D | Show only geometry and transitions admitted by G-GEOMETRY for the selected step and its dependency closure. Display the declared nominal-geometry scope and physical-match status. |
| Provisional review | Explicit opt-in author/reviewer mode; conspicuous persistent provisional banner, no physical-fit verdict or metric inspection for unknown features; never the default tutorial. |
| Physically matched scope | Display a separate, scoped certificate only when actual physical evidence establishes the listed properties. No global certification inferred from appearance. |

The full product target includes 29-step 3D coverage. Shipping the reference-first or partial-coverage stages is useful but MUST NOT be described as completion of that target. The release dashboard reports, for example, `29/29 instructions; 7/29 admitted 3D transitions; physical match unverified` rather than one misleading percentage.

Non-goals through M12: autonomous control of the physical PiCar, remote execution of setup commands, physics-based assembly settling, manufacturing replacement parts, torque certification, a general-purpose CAD editor, cloud accounts, multiplayer collaboration, mobile AR, and camera-based pass/fail judgments. Later milestones add observation adapters without changing assembly truth.

## 3. Navigation and project entry

Keep Home, Setup Wizard, Reference, and Video Course. Add **Assembly** to the same top navigation, linking to the current project. Preserve the eight setup-stage IDs and all legacy hash links. The existing wizard's `assembly` stage becomes a launcher and summary with a **Continue V40 assembly** action and a **Read printed instructions** action; it is not removed.

Home contains separate cards for setup progress and assembly progress. Show the selected Pi variant, revision, next unconfirmed printed step, source/geometry coverage, and a resume action. Do not replace an unknown revision with the old hardcoded `v2 · Robot HAT` chip. Until a project exists, show `Kit instructions: Z0104V40; Pi variant: not selected`.

First entry requires selecting a Pi variant, accepting the distinction between guided progress and verification, and reviewing the printed inventory. An existing setup-stage completion can be imported as historical context, but cannot auto-complete 29 physical instructions. A user who already assembled the car can review and attest individual steps or record an explicit bulk self-report; the latter is tagged `self_reported_import`, never camera/CAD verification.

The initial digital workbench contains independently addressable selected-variant items in trays with **no assembly connections**. Accurate approved parts may be shown in 3D tray poses; missing geometry remains a named 2D source tile. Future items are collapsed by default rather than all laid over one another. Opening “All parts” exposes the complete inventory, including spares, unused variant stock, tools and noninstalled accessories.

## 4. Workspace layout

At the existing 1440×900 desktop size, use a persistent step rail, central viewport, and instruction/inspection panel. The rail is about 220 CSS px and the instruction panel about 360 px; the viewport takes the remaining width. At 1100×700, collapse the rail into a step-selector drawer before squeezing instructions. Use existing CSS tokens, system fonts and light/dark appearance. Do not introduce a second design system.

The viewport header always shows revision, variant, printed step, source confidence, and whether the display is assembled, exploded, isolated, or previewing another step. Controls are HTML buttons, not exclusively 3D widgets. The instruction panel includes a concise action, exact hardware designation/quantity, required tool class, orientation callouts, numbered suboperations, warnings, and verification checks. A persistent footer holds Previous, Replay, and the primary next action.

The current parts tray and fastener tray are separate. A tray row names the definition and instance or group quantity, shows stock/required counts, and focuses the matching node or source image. Repeated fasteners may be visually grouped, but expanding a row exposes each instance ID and target interface. A magnified hardware card is labeled **enlarged—not to scale**; never use screen dimensions as a measuring gauge.

## 5. Exact interaction behavior

| Interaction | Required behavior |
|---|---|
| Start / Play installation | From the current before-state, play the approved transition. At the end show the after-state and physical-check controls. Do not mark the physical step done merely because the animation finished. |
| Complete & next | Validate required attestations and prerequisite confirmations, persist one transaction, then move to the next printed instruction. If persistence fails, remain on the step with a retryable error and no false completion. |
| Previous | Review the preceding printed step and optionally reverse the visual transition. It does not say that the real robot has been disassembled and does not delete confirmations. A “Reviewing completed step” label appears. |
| Replay | Reset only the visual cursor to the before-state and evaluate the same transition again. Inventory, confirmations and zeroing attestations are not duplicated. |
| Jump to step | Any step is reachable in **review/preview**. Future prerequisites are projected digitally and visibly labeled assumed-for-preview. Guided completion is disabled until prerequisite physical confirmations exist. Returning to guided mode goes to the earliest required unconfirmed step. |
| Undo completion | Separate action with confirmation. Invalidate that step and all dependent physical confirmations, preserve history, and explain which downstream steps need reconfirmation. No implied safe physical teardown instruction. |
| Rotate / pan / zoom | Orbit drag, secondary/modified drag pan, wheel/pinch zoom; explicit keyboard/button alternatives. Respect bounds without trapping the camera inside a part. Any manual interaction immediately cancels auto-camera interpolation. |
| Automatic focus | Focus the current interface/part-group bounds with the prescribed view normal and up vector. Transition only on an explicit step action or “Refocus”; never steal the camera during inspection. |
| Manual camera override | Remains active across replay and inspection until “Resume auto camera” is selected. Step navigation offers focus but does not forcibly override a manual view. |
| Click / hover | Hover highlights the nearest eligible visible item and gives a small label. Click selects and opens the inspector. A drag exceeding 4 CSS px is not a click. Hidden, ghost-future and clipped-away nodes are not picked by default. |
| Part inspector | Shows definition, instance, role, current assembly, supplied/used/spare disposition, current and final connections, required hardware, evidence, per-feature confidence, and blocking questions. “Why this hole?” opens its evidence and derivation chain. |
| Isolate | Save the current visibility profile, show the selected item/subassembly plus optional attachment context, retain a visible “Exit isolate” control. Do not mutate domain state. |
| Ghost future | Show only future items with admitted geometry and solved poses in the preview state. Unknown geometry remains tiles/counts. Future ghosts cannot appear as physically installed or verified. |
| Dim completed | Reduce contrast of completed context while retaining orientation and attachment surfaces. Current working interfaces remain legible. Do not change part materials in shared source assets. |
| Explode | Enter an inspection overlay generated from the attachment graph. Disable installation playback until “Return to assembly” finishes; preserve the underlying state and manual camera choice. |
| Clipping | A labeled, reversible inspection plane with slider and reset. Clipped geometry is not evidence of an actual cutaway or absent internal component. |
| Reset / restart | Offer “Reset visual view”, “Restart this assembly session”, and “Reset all companion progress” separately. Destructive options require confirmation and create a recoverable session snapshot. |
| Variant change | Create a new session fork for the new variant. Preserve the old session and setup/reference progress. Do not transfer physical-step confirmations automatically, including visually common downstream steps. |
| Search / reference link | Navigate to a stable page/section or assembly-step/part route. Returning restores session, selected step and inspection state. External links remain external and failures are surfaced. |

Selection, hover, isolation and camera operations never alter stock counts, connections or physical completion. The inspector remains fully operable when WebGL is unavailable.

## 6. Warnings, servo zeroing and cable guidance

Warnings have severity, source, applicability and acknowledgment policy. A safety acknowledgment is a user statement, not sensor verification. Display the precise reason a step is blocked; avoid vague red “invalid” states.

The V40 zeroing procedure is introduced at printed step 17 and repeated at the actual horn-to-spline attachment operations in steps 18, 19 and 22. Each servo instance has its own scoped zeroing attestation. The UI names **pan**, **tilt**, or **steering**, shows the temporary **P11** connection, and distinguishes it from permanent **P0/P1/P2** wiring at step 29. A generic setup checkbox cannot satisfy these step-specific conditions. When the actual HAT's ZERO behavior is unverified, provide the printed procedure as reference and block any automated confirmation; do not silently select a newer-board procedure.

Camera-ribbon operations require a power-off acknowledgment, sourced to the existing camera warning. Show the connector latch, cable contact face and stiffener face in a local close-up; do not reduce orientation to an ambiguous “blue side up”. The selected Pi variant chooses FFC versus FPC according to the printed V40 panels. Unknown pitch, length, bend radius or connector subtype remains unresolved. A routing line with unknown exact shape is labeled **routing schematic**, not rendered as a metrically exact cable body.

Step 21 must show a **free-rotation joint**, not a rigidly tightened plate. Step 19 uses Washer A; step 26 uses Washer B. The largest warning in a fastener inspector is a mismatch between the selected hardware and the intended joint. No inferred torque value, screw pitch, insertion depth or rivet-code dimension may appear.

## 7. Progress and completion

The durable physical ledger records `not_confirmed`, `self_confirmed`, or `observation_supported` per required check, with source and invalidation history. It does not assign an unqualified `VERIFIED` label to the whole robot. Setup stage completion and assembly-step confirmation remain separate fields.

At step 29 completion, show: variant/revision; all required user confirmations; spare and unused stock; unresolved geometry/electrical questions; geometry coverage; and a **Continue to calibration** link using the existing calibration stage. Calibration is not automatically completed by assembly. A complete digital animation does not complete physical assembly, and physical self-confirmation does not resolve a CAD blocker.

A project-level final mechanical report has a named scope, evidence/model hashes, included features, exclusions and failed/blocked checks. Do not display “fully verified digital twin” while any required identity, interface, nominal geometry, fit criterion or evidence conflict remains unresolved. Physical-match certification additionally requires actual physical evidence; it cannot be achieved from the current box/manual photographs alone.

## 8. Accessibility and degraded behavior

Every canvas action has a focusable DOM alternative. Provide a part tree/list, step text, hardware quantities, before/after state description and source-panel fallback. Announce step changes and completion, not every animation frame. Selection and confidence are conveyed by text and shape, not color alone. Escape closes inspector overlays and cancels preview motion to the last stable visual endpoint. Focus returns to the invoking control.

Respect `prefers-reduced-motion` in JavaScript as well as CSS. Reduced-motion mode swaps to explicit before/after poses without camera travel or screw spins; all checks and state transitions remain identical. Provide adjustable animation speed, pause, and an option to disable auto-focus. Auto-playing instructional motion is off on first entry.

On WebGL2 creation failure or repeated context loss, keep the workspace, progress and instructions available in reference mode. Do not downgrade to untested WebGL1 or silently remove required warnings. Report an asset failure independently of evidence incompleteness. A “Retry 3D” action reloads only the failed feature, not the whole application.

## 9. Product acceptance

AC-P1: Every existing route family and eight setup-stage ID works after migration.
AC-P2: Every one of the 29 printed steps is accessible for each selected branch, with correct V40 evidence and no V33 substitution.
AC-P3: Previous/replay/jump never silently alter physical progress; undo and variant fork behave exactly as specified.
AC-P4: All interaction paths have keyboard/reference alternatives; zero WebGL is a supported operating mode.
AC-P5: No provisional geometry can masquerade as an admitted nominal instruction or physically matched part.
AC-P6: The full target is accepted only when M12's coverage, geometry, asset, native-performance and regression gates pass. Earlier usable releases remain accurately labeled partial.
