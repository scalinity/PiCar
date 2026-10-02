# Assembly Studio — S01–S09 delivery plan

Assembly Studio is the companion's full-viewport 3D assembly experience: the real PiCar-X geometry from the M5/M6/M7 instructional track, presented with Blender-authored material intent and operated in the app. It grows step by step into the complete tutorial. Its content frontier is printed step S09 for the two active boards, `rpi5` and `rpi-zero-2-w`; `rpi4` stays PRESERVED_NON_TARGET. The pipeline, ownership and commands are in [ASSEMBLY_STUDIO_PIPELINE.md](ASSEMBLY_STUDIO_PIPELINE.md).

## Four separate kinds of readiness

A Studio screen states each of these on its own; none implies another.

| Kind | Owner | What it means | Who changes it |
|---|---|---|---|
| Engineering admission | G-CAD, G-GEOMETRY (M4/M8) | Geometry is fit for measurement, mating and runtime admission | Gate reports only; Studio never sets it |
| Assembly-content readiness | M7 instructional gate (`G-INSTRUCTIONAL-ASSEMBLY`) | A step closure passed the independent closure verifier in a qualification; admitted at 58/58 only | M7 qualifications |
| Display readiness | Studio snapshot manifest | Every instance in a step has geometry, a source pose (or an explicit tray placement) and, if it moves, a source recipe | Studio pack build |
| Owner-recorded physical progress | M3 session ledger | The owner said they did this on the real car | An explicit owner command, never playback |

A step can be display-ready while its assembly content is unaccepted; it is then shown as **Preview** with the M7 status beside it. Display readiness never feeds the M7 gate, G-CAD or G-GEOMETRY.

Display statuses per step and variant:

- `PREVIEW_SOURCE_REVALIDATED` — the source-mode chain produced the closure and the independent `closure_verify` passed it in the pack build. Ordinary instructional mode, labelled Preview until M7 admits the row.
- `PREVIEW_BLOCKED_RELATION` — placements verified, but a relationship the step needs is unresolved (S07 battery lead). Review mode: the step opens, the blocker is named, auto-play is not offered as instruction.
- `REVIEW_REFUSED_CANDIDATE` — the closure check refused the cumulative state (S09). Only the refused record's candidate placements exist, labelled with their source and the measured conflicts. Review mode only.
- `UNAVAILABLE` — no source record. Parts stay in the tray.

The parts tray is a presentation layout, not an inferred physical state. A component without a defensible installed pose stays in the tray; it is never given an identity transform.

## Deliveries

### Studio 1 — real geometry, real app, one real transition (this delivery)

- Scoped CAD tessellation of the resolved M5/M6/M7 artifacts for every S01–S09 instance of both active boards, shared per definition.
- One Studio pack (`parts.glb` + `manifest.json`), separately versioned, labelled `provisionalReview`, never a G-GEOMETRY pack.
- A reproducible Blender project built from that pack, with presentation materials, lighting and camera, and one Cycles reference render.
- `#/studio` in the companion: full-viewport canvas, global chrome hidden, native fullscreen in Tauri with a browser Fullscreen API fallback, orbit/pan/zoom, reset and focus, part selection with source identity, a collapsible instruction drawer, a compact step control, readiness labelling.
- Operable content: the labelled tray state (S00), S01 and S02 for Pi 5, through the same manifest and renderer that already carries Zero 2 W. S03–S09 appear in the step rail with their display status but are not operable until Studio 2.
- No progress writes: the Studio route does not import the session store.

Studio 1 is done when the owner can open the app, enter fullscreen, inspect the real parts and play, scrub and replay S01→S02 with endpoints equal to the closure poses, and when both the Blender project and the reference render exist from the same pack.

### Studio 2 — complete S01–S09 for both boards

- All nine steps operable for `rpi5` and `rpi-zero-2-w` with the same experience; variant switch keeps the step.
- Instruction drawer with the printed manual panel (rendered from the locked V40 PDF at runtime, not stored), part list, limitations and the M7 status.
- Inspection: isolate, ghost others, explode around the step, clip plane for the deck.
- Honest unresolved handling: S07 in review mode with the battery-lead blocker and an explicit dependency warning on S08 ("previewing S08 does not certify S07"); S09 in review mode on its refused candidate with the conflict pairs and volumes; no auto-play of a disputed insertion.
- Camera suggestion per step authored in `stage.json` (`camera.steps`); automation yields to input with a visible resume.

### Studio 3 — build along with the real car

Uses the accepted M3 session layer (`features/assembly-session/store.ts`, `commands.ts`, `platform/*/repository.ts`); no second persistence.

| Need | Existing mechanism |
|---|---|
| Selected variant | `AssemblySession.variantId`, one session per variant (`createSession(variant)`) |
| Current viewed step / return-to-step | `reviewStepId` through the existing `bookmark` action, written on step change only, never per frame |
| Owner-recorded physical completion | The existing `complete` command (`actor: 'self_confirmed'`), triggered only by an explicit button whose success follows the committed acknowledgment |
| Private photo on a step | New: an observation record referenced from `observationIds`, carrying the photo's SHA-256, step ID, variant, Studio `packId`, and the geometry/pose source hashes of the instances shown. Bytes live in the app data directory (`evidence/<sessionId>/`), never in the repository, pack or bundle |
| Evidence export to the implementation agent | A local export (zip) of the chosen observations with their sidecar JSON; the owner chooses the destination |

Tests use disposable sessions and temporary storage; the owner's database is not read or changed without a separate request. No automatic camera verification.

### Studio 4 — native release polish

Native Tauri build checks, offline start and restart, keyboard-only operation, reduced motion, screen reader labels for controls, adaptive quality on battery, measured frame budget on the owner's Mac, and an owner visual review against the reference renders.

## Mapping to the original milestones

Studio work does not rewrite or satisfy any milestone report; it delivers early what the milestones assign, on the instructional track and labelled as such.

| Milestone duty | Studio delivery | What stays with the milestone |
|---|---|---|
| M7 instructional closures | Consumed read-only (source-mode chain) | The 58/58 gate, qualifications, acceptance commit |
| M8 runtime geometry, GLB builder, G-GEOMETRY | Studio 1 tessellation and pack builder, reusable architecture | Admission, `public/twin/<packHash>/` publication, packHash contract |
| M9 viewport, instance registry, inspector, camera | Studio 1–2 | Gate on admitted packs only |
| M10 motion evaluator, playback, explosion | Studio 1 (evaluator), Studio 2 (explosion) | Metric motion admission |
| M11 tutorial coverage | Studio 2 for S01–S09 | 29/29 coverage report |
| M12 release, performance | Studio 4 | G-NOMINAL, release reproducibility |
| M13 observation | Studio 3 photo attachment (owner-chosen files, no camera) | Camera capture and AR |

## Adding steps after S09

A later step is content, not new UI:

1. A revised part regenerates through its M5/M6/M7 additive revision; the M7 chain rebuilds; the Studio pack build re-tessellates only definitions whose artifact SHA-256 changed and records old and new hashes.
2. A step refreshes when its closure file hash, any placed definition's artifact hash, or its `stage.json` entry changes; the manifest records the closure hash per step, the artifact hash per definition and the `stage.json` hash per pack.
3. Invalidated presentations are every step at or after the first step whose closure or recipe changed, for the same variant; the manifest diff lists them.
4. Physical progress is untouched: the session ledger references graph and step IDs, not pack bytes. A photo keeps the `packId` and hashes it was taken against, so a later revision shows it as "taken against an earlier revision", not as wrong.
5. Display readiness changes with the pack; M7 assembly status changes only through M7. The step rail shows both.

M7 geometry work resumes after Studio 1 on its own branch line; the owner can inspect each revision in the Studio as it lands.
