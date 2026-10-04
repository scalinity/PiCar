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

- `PREVIEW_SOURCE_REVALIDATED` — the source-mode chain produced the closure and the independent `closure_verify` passed it at the closure's exact canonical hash, which the pack records. **Preview** mode: the step plays as instruction, labelled Preview until M7 admits the row. A pack whose recorded sources have since changed reads `STALE` in `studio.mjs check` and is not presented as revalidated.
- `PREVIEW_BLOCKED_RELATION` — placements verified, but a relationship the step needs is unresolved (S07 battery lead). **Review** mode: the step opens on its recorded state, the blocker and the connection's two ends are named and tinted, and nothing plays.
- `REVIEW_REFUSED_CANDIDATE` — the closure check refused the cumulative state (S09). Only the refused record's candidate placements exist, labelled with their source and the measured conflicts. **Review** mode: the candidate's own parts are tinted, a chosen conflict pair is shown through the ghosted rest, and nothing plays.
- `UNAVAILABLE` — no source record. Parts stay in the tray; the step does not open.

A later step that depends on a step in Review carries "previewing S08 does not certify S07".

The parts tray is a presentation layout, not an inferred physical state. Studio 3 extends its scope to every canonical planned-stock instance for the selected active board (`canonical stock = drawn solids + tiles`, with nothing missing or extra; `tools/studio/tray-audit.mjs` independently reconciles stock, all 29 planned uses, graphs, tools and slots). Current-frontier counts remain separately identified. Later parts have muted finishes and no implemented placement; backups are marked spare. The selected user-supplied board and three kit tools are included in the canonical total, never added as duplicate tutorial stock. An instance with no trusted solid (the camera ribbon, the hook and loop tape, the tools) is a labelled flat tile, never invented geometry. Parts are grouped (plates, electronics, motors and servos, fasteners, supplies, cables, tools), fasteners one row per definition so identical pieces can be counted. A component without a defensible installed pose keeps its part-local orientation; it is never given an identity transform.

## Deliveries

### Studio 1 — real geometry, real app, one real transition

- Scoped CAD tessellation of the resolved M5/M6/M7 artifacts for every S01–S09 instance of both active boards, shared per definition.
- One Studio pack (`parts.glb` + `manifest.json`), separately versioned, labelled `provisionalReview`, never a G-GEOMETRY pack.
- A reproducible Blender project built from that pack, with presentation materials, lighting and camera, and one Cycles reference render, identified by a presentation receipt (pack, configuration, builder, Blender build, presentation-state fingerprint) separate from the pack ID.
- `#/studio` in the companion: full-viewport canvas, global chrome hidden, native fullscreen in Tauri with a browser Fullscreen API fallback, orbit/pan/zoom, reset and focus, part selection with source identity, a collapsible instruction drawer, a compact step control, readiness labelling.
- Operable content: the labelled tray state (S00), S01 and S02 for Pi 5, through the same manifest and renderer that already carries Zero 2 W. S03–S09 appear in the step rail with their display status but are not operable until Studio 2.
- No progress writes: the Studio route does not import the session store.

Studio 1 is done when the owner can open the app, enter fullscreen, inspect the real parts and play, scrub and replay S01→S02 with endpoints equal to the closure poses, and when both the Blender project and the reference render exist from the same pack.

### Studio 2 — complete S01–S09 for both boards (accepted predecessor)

- Every printed step S01–S09 opens for `rpi5` and `rpi-zero-2-w` through one renderer: S01–S06 and S08 play as Preview, S07 and S09 open in Review. A board switch keeps the step; a selection survives only for a part (or tile) both boards have.
- The accepted S01–S09 frontier tray, with an inventory line ("50 pieces · 44 modelled · 6 shown as tiles" on the Pi 5), grouped lists with a numbered chip per identical piece, and framing of any group. Studio 3 separately extends the current Parts view to the full kit.
- Instruction drawer: the printed manual panel for the step and board, rendered at runtime from the locked V40 booklet at the rectangle the verified documentation source lock records (never a stored image, never a guessed page); the step's parts (placed, new, worked on, tools); the step's source intent quoted from `steps/source-intents.json` with its caution text; the review explanation; the M7 status and limitations.
- Inspection, all presentation only and reversible: isolate (hidden parts are neither drawn nor picked), ghost others, explode (offsets composed over the evaluated poses, continuous through playback), and a deck clip plane that never cuts the tray.
- A guided camera per state authored in `stage.json` (`camera.steps`, each naming its subject) and judged by rendering it; the camera's frame is the canvas area the panels leave uncovered, so a guided view never sits under the drawer. Any input yields to manual control, and "Resume guided view" returns.

### Studio 3 — full-kit tray and build along with the real car (current delivery)

Uses the accepted M3 session layer (`features/assembly-session/store.ts`, `commands.ts`, `platform/*/repository.ts`); no second persistence.

| Need | Existing mechanism |
|---|---|
| Selected variant | `AssemblySession.variantId`, one stable Studio session per active variant (`PX-STUDIO-RPI5`, `PX-STUDIO-ZERO2W`), explicitly created through M3 |
| Current viewed step / return-to-step | `reviewStepId` through the existing `bookmark` action, written on step change only, never per frame |
| Owner-recorded physical completion | The existing `complete` command (`actor: 'self_confirmed'`), triggered only by an explicit button whose success follows the committed acknowledgment |
| Private photo on a step | New: an observation record referenced from `observationIds`, carrying the photo's SHA-256, step ID, variant, Studio `packId`, and the geometry/pose source hashes of deterministic observation context instances; no recognition of the photograph. Bytes live in the app data directory (`evidence/<sessionId>/`), never in the repository, pack or bundle |
| Evidence export to the implementation agent | A local export (zip) of the chosen observations with their sidecar JSON; the owner chooses the destination |

Tests use disposable sessions and temporary storage; the owner's database is not read or changed without a separate request. No automatic camera verification.

### Studio 4 — native release polish

Native Tauri build checks, offline start and restart, keyboard-only operation, reduced motion, screen reader labels for controls, adaptive quality on battery, measured frame budget on the owner's Mac, and an owner visual review against the reference renders.

Current Studio 4 candidate: `studio/s4-native-release-polish`, based exactly on accepted Studio 3.5 `7a698e8145edd9578743aa648a5a37cac641b773`; runtime source `05eac8d7d0a30db53bf54940cdbccc84283631c4`. Two clean normal M3 arm64 release builds have equal file bytes. Keyboard/modal/native focus, OS reduced motion, read-only macOS power ceilings, bounded native performance/resource observations and release failure handling have additive evidence. **STUDIO 4 NOT READY FOR INDEPENDENT REVIEW:** actual network-unavailable cold launch and still-offline restart remain unverified; app-scoped network denial prevented macOS window startup, and a brief Wi-Fi disconnect awaits owner approval. No push is authorized while that mandatory gap remains. Physical battery performance is unmeasured; deterministic battery policy tests pass. Owner integrated-view acceptance and VoiceOver validation remain PENDING. See [Studio 4 handoff](../implementation/HANDOFF_STUDIO_4.md) and [owner review](../implementation/evidence/studio-4/OWNER_REVIEW.md). Pack/GLB/presentation/HAT identities and M7 BLOCKED 0/58 remain unchanged; M8 is NO.

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

Future M7 geometry work requires its own authorization and branch line. Studio 3.5 owns the future owner-measured Robot HAT refinement before Studio 4; neither is started by this delivery.

Studio 2 correctness closeout is documented in `../implementation/HANDOFF_STUDIO_2_PRO_REMEDIATION.md`: exact shared contract validation, fatal canonical tray disagreement, movement-based camera ownership, continuous recipe-free explosion, recoverable locked manual and complete native Zero S00–S09 verification. That historical checkpoint does not itself authorize Studio 3 or M8. The separate Studio 3 execution authorization is implemented and evaluated in `../implementation/HANDOFF_STUDIO_3.md`; M8 remains unauthorized.
