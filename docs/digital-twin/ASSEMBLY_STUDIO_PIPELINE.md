# Assembly Studio pipeline

How the Studio turns the instructional CAD into the Blender project and the app's 3D view, who owns which truth, and the commands to launch, regenerate and roll back. The plan and the readiness model are in [ASSEMBLY_STUDIO_PLAN.md](ASSEMBLY_STUDIO_PLAN.md); the geometry quality bars are in the root `CLAUDE.md`.

## Stages and ownership

```
M5/M6 artifacts + additive revisions ─┐
                                      ├─ M7 chain (source mode) ── closures: poses, recipes, status
fidelity revisions / display models ──┘          │
                                                 ├─ tessellate.py ── CAD-frame meshes (mm), per solid
                                                 └─ studio.mjs pack ─ parts.glb + manifest.json (runtime basis, metres)
                                                          │                    │
                                       build_studio_scene.py (Blender)     companion #/studio
                                       .blend + reference render           three + React Three Fiber
```

| Truth | Owner | Never comes from |
|---|---|---|
| Part geometry | M5/M6 artifacts, M7 additive revisions, registered display models | Blender, the runtime |
| Installed poses, step identity, staged approach | M7 closures (`chain/closures/*-closure.json`) | Blender timelines, the GLB |
| Display readiness | `studio.mjs pack` from the independent `closure_verify` result, at the closure's exact canonical hash | Generator status fields alone |
| Assembly acceptance | M7 gate (`M7_G_INSTRUCTIONAL_ASSEMBLY_REPORT.json`) | The Studio |
| Physical progress | The M3 session ledger | Playback, scrubbing, selection |
| Material intent | `digital-twin/presentation/materials/studio-materials.json` | Hand edits in Blender or the GLB |
| Light rig, camera policy, timing, tray layout, display names | `digital-twin/assemblies/v40/presentation/studio/stage.json` | — |
| Tray scope (what the tray must hold) | The compiled M2 graphs (each step's introduced, used and tool-requirement records), the M1 inventory (`components/instances/planned-stock.json`, `inventory/tools.json`) and `definitions/parts.json` | The pack's own placements |
| Step source intent and cautions | `assemblies/v40/steps/source-intents.json`, `validation/m2/runtime-registry.json` | Generated text |
| Manual panel location | `picarx-companion/tools/content-pipeline/documentation-source-lock.json` (VERIFIED, bound to the booklet's SHA-256) | Guesses, stored page images |

**One coordinate conversion.** `digital-twin/tools/studio/basis.mjs` maps CAD (RH, +X forward, +Y left, +Z up, mm) to runtime glTF (RH, +Y up, +Z forward, m): `p = 0.001 C p`, poses `(C R Cᵀ, 0.001 C t)`, quaternions `[x, y, z, w]`. Vertices and poses are each converted there, once. Blender's glTF importer and exporter map Y-up to Z-up and back exactly, so the `.blend` is a lossless view of the same pack; `build_studio_scene.py` re-checks every definition's bounds and every instance pose against the manifest after import.

**Geometry is never edited downstream.** The GLB holds one node per part definition at identity, one primitive per CAD solid, core PBR materials and no images. The app places instances from the manifest. Blender assigns materials, lights and cameras only; its scripts rebuild the `STUDIO-SOURCE-*` collections each run and keep `STUDIO-PRESENTATION` and the `MAT-studio-*` materials, so deliberate presentation edits survive a rebuild. Every object in the scene belongs to one of those collections: a run refuses any other object, and `--remove-unowned` deletes them and lists each in the presentation receipt.

**Display models.** A definition can carry a registered display model (`digital-twin/validation/expected/m7/fidelity/display/`): CAD authored from dimensional drawings or explicitly approximate source-supported visual envelopes in the same part frame. The Robot HAT display model is the owner's V4 board reconstructed from the owner's photographs and scans (`hat-detail-display-review-02.json` names each dimension's basis: datum, scan, photo, standard or approximate), in the adopted HAT frame on the adopted bores, with checked geometry and poses unchanged; its shared finishes are joined into single solids through hidden in-board plates so the board draws as about 30 meshes; the Zero orientation already differs from Pi5 by 180 degrees. The Studio draws it; assembly checks keep the instructional artifact. Its record (schema `picar-studio-display-check/1`) holds the relation to the instructional artifact, with the mounting holes measured on both shapes, an overlap check in every closure that places it, and a vendor cross-check where vendor CAD exists. Every check names what it measured: the display artifact, the instructional artifact and every other placed part's artifact by SHA-256, and each closure by its canonical hash. Source bindings, where declared, must match and are included in pack freshness. Display overlap checks use other instructional artifacts; pairs of detailed display models are not measured. The pack draws the model only while the record names exactly the pack's artifacts and closures; otherwise it draws the instructional shape and states why (`displayWithheld`). Steps carry the checks as `displayChecks`, `CHECKED` against that step's closure or `NOT_CHECKED` (a refused candidate state the record never measured), and the drawer and inspector state them.

## Blender to runtime translation

| Blender reference (Cycles) | Runtime (WebGL2) |
|---|---|
| Area lights from `stage.json` (`blenderPowerW`, `spreadDeg`) | The same rectangles, at the same directions, sizes and colours, baked into a PMREM environment (`runtimeIntensity`); no spread |
| Shadow-catcher floor composited over a radial background pool | Shadow-only plane over a CSS radial gradient (`lighting.pool.css`) |
| Bead-blast roughness noise and bump on aluminium | Base roughness only (render-only detail) |
| AgX view transform | `AgXToneMapping` |
| Metal reflections of a dark world | A dim environment base (`runtimeEnvironmentBase`) so metal side walls read as in the reference |

The runtime is not a Cycles render; compare `digital-twin/presentation/blender/renders/` with the app at the same step camera.

**Presentation identity.** The pack ID identifies geometry and poses, not a presentation. `build_studio_scene.py` writes `digital-twin/presentation/blender/presentation-receipt.json`: the pack, the `stage.json`, `studio-materials.json` and builder hashes, the Blender version and build, a fingerprint of the presentation-owned state (`STUDIO-PRESENTATION` objects and their data, the `MAT-studio-*` node trees, the world and the render settings), the `.blend` bytes and the render it made. `presentationId` is the SHA-256 of a domain tag and that recipe; the `.blend` carries it (`picar_presentation_id`) and so does the render's file name (`<packId12>-<presentationId12>-<variant>-S<nn>.png`). `studio.mjs check` reports the snapshot `CURRENT` or `STALE` (another pack, changed configuration or builder, a `.blend` saved after its receipt, another render); `studio.mjs blender --check` re-reads the state inside the `.blend` against the receipt. Deliberate presentation edits survive a rebuild and change the identity; `--reset-presentation` rebuilds them from the configuration and changes it again.

## Runtime ownership

| Concern | Owner and boundary |
|---|---|
| GPU resources | Pack-cached part geometry and source materials live for the app session. A board's materials (normal, selected, review focus, ghost), its tray tiles and pick targets for parts under 8 mm, and its key light (with its shadow map) are released once a rebuilt board replaces them or the viewport closes. The PMREM environment render target is released with the viewport; its light cards as soon as it is built. `scene/resources.ts` registers each owner while it is live. |
| Camera target | Set when the viewport opens; afterwards changed only by input (with its damping run to completion), framing a part, reset, or a resumed guided view. Re-renders, resizes, pixel-ratio and fullscreen changes leave it alone. |
| Selection | Survives a board switch only for a part both boards have; framing acts only on a part in the active scene. |
| Escape | One physical press, one action: close the enlarged manual, else clear the selection, else leave fullscreen. Repeats are ignored. In native macOS fullscreen a local AppKit monitor captures Escape only in the active Studio main window and emits one window-scoped event on release, so detached DOM focus cannot lose the press or let AppKit exit fullscreen early. Leaving Studio releases capture; app exit removes the monitor. Browser/windowed input retains physical-press deduplication. Fullscreen requests run one at a time, never reject, re-read the platform state after each, and a refusal is shown. |
| Route memory | Studio URLs are presentation state and are never remembered as the Setup route, so neither M3's Setup contract nor a later legacy migration sees them. |
| Performance HUD | Active frame time only (the previous frame asked for the next, or the user is moving the view, with the page visible); marks from the Studio page's first render to the canvas, the first render and the first frame drawn. The pixel-ratio governor tracks the display period and backs off between drops. |
| Framing area | The camera's frame is the canvas rectangle the panels leave uncovered (tool rail, header, dock, open drawer), measured each frame and eased; the canvas is a view window around it (`setViewOffset`). Guided views, focus and group framing fit what is visible; the camera and its target never move for it. |
| Inspection | Isolate, ghost, explode and the deck clip are composed in the frame loop over the evaluated poses and never written to the manifest, a closure, M7 or the session ledger. Styles swap the board's own materials (selected, review focus, ghost); a hidden part moves to a layer the camera, the raycaster and the shadow pass all skip. The deck clip uses renderer clipping on the board's materials, intersected with a guard plane so the tray is never cut; geometry and invisible pick boxes apply the same planes to ray hits. Explosion offsets are a pure function of the step, weighted by approach progress, or the existing bring-in progress for a recipe-free workpiece, so playback and seeking stay continuous and turning it off returns the exact poses. |
| Review | A blocked or refused step has no timeline. A chosen conflict pair is tinted, everything else ghosted, and the camera frames the pair as a manual view; one Escape clears it. Escape's order is: close the enlarged manual, else clear the selection or pair, else leave fullscreen; one press is one action. |

## Snapshot, adoption and unresolved content

- A Studio pack (contract `picar-studio-pack/3`) names its chain run, tessellation, input hashes and the M7 gate state; `packId` is the SHA-256 of a domain tag and the canonical (RFC 8785) manifest. The preimage and the manifest and GLB structure rules live in one module, `picarx-companion/src/features/assembly-3d/assets/pack-contract.ts`, which the pack build and the app's loader both use.
- Source binding: a step is `PREVIEW_SOURCE_REVALIDATED` only when its closure's canonical hash equals the `closureRfc8785Sha256` the verifier recorded for that variant and step; any mismatch refuses the build with variant, step and both hashes. The chain run records the revision registry that selected its artifacts (`studio-chain.json`); the tessellation (contract `picar-studio-tessellation/2`) binds to that run, its verification and registry, and carries a SHA-256 per definition mesh; the manifest records all of them.
- `studio.mjs check` reports three things separately. PACK_INTEGRITY: the manifest and GLB form the frozen pack they claim to (pack ID, GLB hash, contract). SOURCE_FRESHNESS: `FRESH` while every recorded closure, verification, artifact, tessellation, display record, registry and input is unchanged on disk, `STALE` once any changed (named with both hashes), `UNVERIFIABLE` when a recorded source is gone or the pack predates source binding. Presentation: whether the tracked `.blend` and render are `CURRENT` for this pack (below). A historical pack keeps its integrity and is never presented as revalidated once its sources move on.
- The app's loader fetches the manifest and the GLB as bytes and refuses them before decoding unless they satisfy the contract: manifest schema, recomputed pack ID, GLB SHA-256 (never only its length), one root per definition at identity with no children, and the manifest's solids and materials. The Studio then shows why it could not open.
- Each step carries a mode. `preview` (operable) only for a `PREVIEW_SOURCE_REVALIDATED` step that also passes the pack's preview checks: every part the closure newly places has an M7 recipe except the one workpiece it attaches to, every earlier part keeps its closure pose (a re-pose the recipes cannot represent refuses the build), every part the step names is in the tray scope, and it has a guided camera. `review` for `PREVIEW_BLOCKED_RELATION` and `REVIEW_REFUSED_CANDIDATE`; `closed` for a step `stage.json` does not open or with no source. The runtime contract refuses a preview step that is not revalidated at its verified hash, a review step on any other display, and an opened step without a camera. A later step carries "previewing S08 does not certify S07".
- Motion animates what each closure newly places (a part introduced in S06 and placed in S07 moves in S07), never a review step.
- The tray (`variants.<v>.tray`) holds a pose for every drawn instance in its scope and a tile (`centreM`, `halfExtentsM`) for every one without a trusted solid; `manifest.schematic` names the tiled instances; `groups` partition both with a label anchor and bounds. The pack check `tray-complete:<variant>` refuses a build in which any in-scope instance lacks exactly one slot. Rows reserve their height as seen from the tray camera (`occlusion`), so a tall part never hides the one behind it.
- Parts with no verified installed pose keep their part-local orientation in the tray; nothing receives an identity pose.
- Diagnostic candidates (for example the prepared S09 revisions) never enter a pack silently; a review pack would carry its own source label.

## Commands

All from the repository root. `<py>` is the frozen M4 environment (see `HANDOFF_M7_REMEDIATION.md`, Continuation 06): `UV_PROJECT_ENVIRONMENT=<scratch>/env uv sync --frozen --group m4 --python 3.12.14 --no-install-package twin-cad` run in `digital-twin/`.

```sh
# Regenerate the pack (labels are never reused; outputs go to the ignored digital-twin/generated/studio/)
node digital-twin/tools/studio/studio.mjs chain --python <py> --label <run>
node digital-twin/tools/studio/studio.mjs tessellate --python <py> --chain <run> --label <run>
node digital-twin/tools/studio/studio.mjs pack --chain <run> --tessellation <run>
node digital-twin/tools/studio/studio.mjs check          # integrity, source freshness and presentation; exit 0 only when all hold
node digital-twin/tools/studio/studio.mjs check --dir <pack dir>   # a historical pack copy: frozen-pair integrity, freshness UNVERIFIABLE
node digital-twin/tools/studio/tray-audit.mjs [--manifest <m>] [--label <l>] [--out <dir>]   # tray scope against the M1 inventory; exit 0 only when it holds

# Fidelity revisions (after editing a fidelity batch or builder): rebuild the store, then rerun the chain
PYTHONPATH=digital-twin/cad <py> -m twin_cad.assemblies.instructional.revisions --root "$PWD" --output <scratch>/revisions
#   compare every existing .brep byte for byte, then copy the new files and revision-artifacts.json into
#   digital-twin/validation/expected/m7/instructional-revisions/
PYTHONPATH=digital-twin/cad <py> -m twin_cad.fidelity.plate_a --root "$PWD" --output <review.json> --revision <batch.json>
PYTHONPATH=digital-twin/cad <py> -m twin_cad.fidelity.plate_a --root "$PWD" --output <review.json> --holes-revision <batch.json>   # pan-hub screw rows
#   a later batch that names a definition again replaces the earlier spec for it (revisions.specs); one artifact per definition
PYTHONPATH=digital-twin/cad <py> -m twin_cad.fidelity.pi5 --root "$PWD" --chain digital-twin/generated/studio/chain/<run> \
    --output digital-twin/validation/expected/m7/fidelity/display --vendor-crosscheck
PYTHONPATH=digital-twin/cad <py> -m twin_cad.fidelity.hat --root "$PWD" --chain digital-twin/generated/studio/chain/<run> \
    --output digital-twin/validation/expected/m7/fidelity/display
PYTHONPATH=digital-twin/cad <py> -m pytest digital-twin/cad/tests/test_studio_fidelity.py digital-twin/cad/tests/test_hat_display.py
# HAT review renders: Studio-tolerance meshes and statistics, then the ten review views
PYTHONPATH=digital-twin/cad <py> -m twin_cad.fidelity.hat_review --root "$PWD" --output <scratch>/hat-mesh
<blender> -b --factory-startup -P digital-twin/presentation/blender/hat_review_render.py -- --scene <scratch>/hat-mesh \
    --materials digital-twin/presentation/materials/studio-materials.json --out docs/implementation/evidence/studio-3-5-hat/renders

# Blender project and reference render (opens and updates digital-twin/presentation/blender/picar-studio.blend)
node digital-twin/tools/studio/studio.mjs blender --render            # --preview for a quick quarter-size check
node digital-twin/tools/studio/studio.mjs blender --render --reset-presentation   # rebuild lights, camera, materials
node digital-twin/tools/studio/studio.mjs blender --check             # the .blend against its presentation receipt, unchanged
node digital-twin/tools/studio/studio.mjs blender --render --remove-unowned       # delete objects outside the owned collections
node digital-twin/tools/studio/presentation-selftest.mjs <scratch dir>            # identity, ownership and override behaviour on a copy
open -n -a Blender digital-twin/presentation/blender/picar-studio.blend

# Launch the companion (coordinated; never call vite directly)
cd picarx-companion && pnpm dev          # then open http://localhost:1420/#/studio
cd picarx-companion && pnpm tauri dev --config src-tauri/tauri.m3.json   # native window, M3 persistence
```

Rollback: the pack, the Blender project, the Studio tools and the M7 store holding the fidelity revisions and display models (`digital-twin/validation/expected/m7/`) are tracked, so `git restore --source=<commit> -- <paths>` returns them together; rerun `studio.mjs check`. Removing a fidelity revision is deleting its batch file and its `.brep`, regenerating the store and rerunning the chain; the M5/M6 originals are never modified. A dev or test run that dies can leave a publication reader lease: `pnpm content:recover` lists it, `pnpm content:recover --apply` clears leases whose owner process is gone.

### Studio 2 Pro guards retained in Studio 3

The retained semantic guards now use the shared contract-4 validator, which checks exact variant slot coverage, unique group partitions and first-use metadata, inventory equations, step parts derived from declared introduced/used/tool lists, exact newly placed differences, preserved Preview poses, explicit S01 workpiece and complete one-to-one recipe staging, review reasons and prior-step dependency warnings. The producer emits used/tool/workpiece fields so both consumers enforce the same semantics. The independent tray audit reconciles compiled graphs, canonical planned uses, stock, tools and pack slots; any disagreement is fatal, while projected small-part dimensions remain advisories.

OrbitControls movement from a user interaction yields the camera; store notifications only invalidate the scene. Programmatic camera updates cannot yield ownership. S03/S06 are Still Preview with no solid timeline. S07 is Review with no battery animation; its recorded placement is present in S08's cumulative state. Physical chip ordinals come from the instance ID across split rows.

The locked manual loader evicts a failed attempt and re-verifies SHA-256 on each successful fetch. The panel offers explicit Retry for fetch/decode/render failures, cancels replaced renders and resets local state on step/variant change. Entering the tray clears enlarged-manual state immediately. No retry loop or session persistence is added. See the implementation handoff for tests and native evidence.

## Studio 3 ownership and private observations

Full-kit membership is the variant-filtered M1 planned-stock set. All active-board stock has exactly one solid or tile, while introduced/used/tool records retain their separate Steps 1–9 frontier. Later-first-use records consult all 29 graph steps and planned uses; unused stock has a null first step. Full-kit camera/layout changes never alter a source assembly placement, recipe, geometry acceptance or M7 gate. Geometry is shared per definition; current/later/spare finishes are board-owned copies.

`features/assembly-3d/build-along.tsx` is the sole Studio persistence adapter. The route supplies intentional step-navigation actions; renderer, motion, selection, camera and inspection cannot import that adapter. Board switches keep the viewed step, including Parts, without changing either board's saved bookmark; explicit resume routes and saved-step links restore the bookmark. The adapter serializes explicit owner commands through accepted M3 creation, bookmark, complete and conservative invalidation semantics. UI progress follows a committed acknowledgment. Complete retains M3’s next-step cursor; if that cursor exceeds Studio’s frontier, returning shows Step 9 without opening a future instruction or rewriting the cursor.

`AssemblySession.observationIds` references closed `picar-studio-observation/1` records in the same M3 command/event ledger. Session database versions stay unchanged. Records bind the session/variant/step, copied file hash/type/length, pack ID, deterministic context-instance IDs, instructional/display artifact hashes, pose hash and source/closure hashes. A future pack mismatch is historical provenance, never automatic corruption or physical judgment.

Native bytes use the accepted repository’s app-data sibling `evidence/<sessionId>/<observationId>`; the frontend supplies bounded generated IDs, never paths. Browser bytes use the localhost origin’s private file system at the equivalent relative key. Regular WebKit profiles support that storage; a private WebKit context may refuse it. Such refusal creates no observation and the UI directs the owner to a regular window or native Studio. Clearing browser site data clears its private evidence. Native and browser progress/evidence are separate local adapters; their sharing requires an explicit export.

Copies refuse collisions and are read back/hash checked before recording. Browser and native repositories verify bytes before a new observation commit. If record persistence fails after copying, retain the uniquely named file until the identical pending M3 command is retried: an acknowledgment may have been lost. An uncommitted orphan is recoverable by its generated session/observation key in private app data, does not appear as successful UI evidence, is never overwritten, and may be removed by the owner after resolving pending saves. Partial failed copies are removed within that copy operation.

ZIP exports contain only selected copied bytes and canonical manifest metadata, with deterministic stored entries, fixed timestamps and CRC32. Private evidence is stated in the UI. Native exports use the owner’s NSSavePanel destination; browser exports use the browser’s explicit download/save workflow. No observation stores an export destination or original source filename. No photos, databases or private ZIPs enter the repository, Studio pack, Blender project, bundle or implementation evidence.

For native Studio 3, use `VITE_M3_ENABLED=1`, Rust feature `m3-persistence`, and `src-tauri/tauri.m3.json`. Default legacy mode deliberately cannot create Studio 3 build records. Automated native validation instead uses the accepted incognito `tauri.m3-test.json`, debug-only `m3-native-test` feature and a canonical disposable `picar-m3-native-*` app-data root. Its test helper/capabilities are absent from the normal configuration. Package/Vite/default native publication inputs were not changed; no content generation is required. Stop readers before coordinated build/recovery and use the existing verified stale-lease recovery command when needed.

## Studio 4 native release candidate

Normal local release uses `VITE_M3_ENABLED=1 PICAR_ALLOW_PACKAGE_BUILD=1 pnpm tauri build --features m3-persistence --config src-tauri/tauri.m3.json --bundles app -- --locked`. Native test flags/features are absent. Two fresh targets at runtime source `05eac8d7d0a30db53bf54940cdbccc84283631c4` produced identical arm64 executable/file inventories and150 frontend asset inputs; no distribution-signing, notarization or universal reproducibility claim. The native journey substitutes only a disposable app identifier and reuses the exact normal frontend, protecting the owner's app data. This is a stated configuration exception, not evidence from the owner database. Read-only power and native WebView-focus permissions supplement the existing Studio capability. No production test bridge or power override is exposed.

Keyboard controls use the existing Studio state. Tab/shift+Tab navigate named controls; Return/Space activate them. `[ / ]` move to opened steps, canvas Space plays/pauses and Left/Right seek0.25 seconds; `R` restores guided view, `F` frames selection, `I` toggles instructions, `O/G/E/C` toggle isolate/ghost/explode/clip and `P` shows an observational performance HUD. Text editing, modifiers, repeated keys, focused native controls and the true enlarged-manual dialog retain their own keys. The dialog contains focus and restores its opener/current-board fallback. Escape preserves manual→selection/review pair→fullscreen layering. Native fullscreen/resize restores first responder only for the live, already-focused Studio window.

OS reduced motion snaps playback/camera/explode/inset transitions to unchanged source endpoints and disables orbit damping; rewind and explicit endpoints remain available. Power policy uses read-only IOKit source type and NSProcessInfo low-power/thermal state. DPR ceilings are2 on AC,1.5 on battery or unavailable source,1 in Low Power Mode or serious/critical thermal state, bounded by backing scale. The existing120-frame governor and600-calm-frame recovery remain; ceilings clamp immediately. These resolution policies never change CAD, HAT detail, source poses, physical progress, materials or lights. No battery history or telemetry is collected.

The HUD's600-active-frame log excludes idle/hidden gaps, retains p50/p95/p99/worst and stall counts, and reports actual DPR/power/renderer resource checkpoints. Owned-material count means board-owned material copies; it excludes shared pack-source and floor/environment materials. Geometries can increase as shared pack definitions warm, then plateau. Exit releases the board/environment through accepted F10 ownership. Host RSS is separately scoped from unavailable WebView/GPU heap figures.

Unavailable native storage opens reference pages with explicit STORAGE_UNAVAILABLE and disables local completion; it never replaces owner files. Pack integrity failure refuses scene startup and directs the owner to a verified app copy; manual retries are explicit and bounded. Negative tests use copied assets and disposable storage. Actual offline cold start and still-offline restart PASS following explicit owner Wi-Fi-disconnect authorization. The stopped native release loaded Parts/both S04/locked manual/detailed HAT/local metadata, acknowledged a disposable Step2 bookmark and restored it before repeated asset checks. Wi-Fi was Off26.83seconds; ordinary connectivity was verified later, with exact recovery latency unknown and failed immediate probes retained. Earlier app-scoped denial failures remain historical evidence. The candidate is READY FOR INDEPENDENT REVIEW; only its normal branch push is authorized after preservation/readiness sanity. [Handoff](../implementation/HANDOFF_STUDIO_4.md), structured receipts and11 actual JPEG review proxies are additive. Owner visual acceptance/VoiceOver remain PENDING. No geometry regeneration or M7/M8 admission is authorized.
