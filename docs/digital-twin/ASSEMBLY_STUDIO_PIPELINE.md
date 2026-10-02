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
| Light rig, camera policy, timing, tray layout | `digital-twin/assemblies/v40/presentation/studio/stage.json` | — |

**One coordinate conversion.** `digital-twin/tools/studio/basis.mjs` maps CAD (RH, +X forward, +Y left, +Z up, mm) to runtime glTF (RH, +Y up, +Z forward, m): `p = 0.001 C p`, poses `(C R Cᵀ, 0.001 C t)`, quaternions `[x, y, z, w]`. Vertices and poses are each converted there, once. Blender's glTF importer and exporter map Y-up to Z-up and back exactly, so the `.blend` is a lossless view of the same pack; `build_studio_scene.py` re-checks every definition's bounds and every instance pose against the manifest after import.

**Geometry is never edited downstream.** The GLB holds one node per part definition at identity, one primitive per CAD solid, core PBR materials and no images. The app places instances from the manifest. Blender assigns materials, lights and cameras only; its scripts rebuild the `STUDIO-SOURCE-*` collections each run and keep `STUDIO-PRESENTATION` and the `MAT-studio-*` materials, so deliberate presentation edits survive a rebuild. Every object in the scene belongs to one of those collections: a run refuses any other object, and `--remove-unowned` deletes them and lists each in the presentation receipt.

**Display models.** A definition can carry a registered display model (`digital-twin/validation/expected/m7/fidelity/display/`): detailed CAD authored from official drawings in the same part frame. The Studio draws it; assembly checks keep the instructional artifact. Its record (schema `picar-studio-display-check/1`) holds the relation to the instructional artifact, with the mounting holes measured on both shapes, an overlap check in every closure that places it, and a vendor cross-check where vendor CAD exists. Every check names what it measured: the display artifact, the instructional artifact and every other placed part's artifact by SHA-256, and each closure by its canonical hash. The pack draws the model only while the record names exactly the pack's artifacts and closures; otherwise it draws the instructional shape and states why (`displayWithheld`). Steps carry the checks as `displayChecks`, `CHECKED` against that step's closure or `NOT_CHECKED` (a refused candidate state the record never measured), and the drawer and inspector state them.

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
| GPU resources | Pack-cached part geometry and source materials live for the app session. A board's materials and key light (with its shadow map) are released once a rebuilt board replaces them or the viewport closes. The PMREM environment render target is released with the viewport; its light cards as soon as it is built. `scene/resources.ts` registers each owner while it is live. |
| Camera target | Set when the viewport opens; afterwards changed only by input (with its damping run to completion), framing a part, reset, or a resumed guided view. Re-renders, resizes, pixel-ratio and fullscreen changes leave it alone. |
| Selection | Survives a board switch only for a part both boards have; framing acts only on a part in the active scene. |
| Escape | One physical press, one action: clear the selection, else leave fullscreen. Repeats are ignored; a keyup acts only for a press whose keydown never arrived (AppKit, native fullscreen). Fullscreen requests run one at a time, never reject, re-read the platform state after each, and a refusal is shown. |
| Route memory | Studio URLs are presentation state and are never remembered as the Setup route, so neither M3's Setup contract nor a later legacy migration sees them. |
| Performance HUD | Active frame time only (the previous frame asked for the next, or the user is moving the view, with the page visible); marks from the Studio page's first render to the canvas, the first render and the first frame drawn. The pixel-ratio governor tracks the display period and backs off between drops. |

## Snapshot, adoption and unresolved content

- A Studio pack (contract `picar-studio-pack/2`) names its chain run, tessellation, input hashes and the M7 gate state; `packId` is the SHA-256 of a domain tag and the canonical (RFC 8785) manifest. The preimage and the manifest and GLB structure rules live in one module, `picarx-companion/src/features/assembly-3d/assets/pack-contract.ts`, which the pack build and the app's loader both use.
- Source binding: a step is `PREVIEW_SOURCE_REVALIDATED` only when its closure's canonical hash equals the `closureRfc8785Sha256` the verifier recorded for that variant and step; any mismatch refuses the build with variant, step and both hashes. The chain run records the revision registry that selected its artifacts (`studio-chain.json`); the tessellation (contract `picar-studio-tessellation/2`) binds to that run, its verification and registry, and carries a SHA-256 per definition mesh; the manifest records all of them.
- `studio.mjs check` reports three things separately. PACK_INTEGRITY: the manifest and GLB form the frozen pack they claim to (pack ID, GLB hash, contract). SOURCE_FRESHNESS: `FRESH` while every recorded closure, verification, artifact, tessellation, display record, registry and input is unchanged on disk, `STALE` once any changed (named with both hashes), `UNVERIFIABLE` when a recorded source is gone or the pack predates source binding. Presentation: whether the tracked `.blend` and render are `CURRENT` for this pack (below). A historical pack keeps its integrity and is never presented as revalidated once its sources move on.
- The app's loader fetches the manifest and the GLB as bytes and refuses them before decoding unless they satisfy the contract: manifest schema, recomputed pack ID, GLB SHA-256 (never only its length), one root per definition at identity with no children, and the manifest's solids and materials. The Studio then shows why it could not open.
- `PREVIEW_SOURCE_REVALIDATED` steps play as instruction. `PREVIEW_BLOCKED_RELATION` (S07) and `REVIEW_REFUSED_CANDIDATE` (S09) are not operable in Studio 1; a later step carries "previewing S08 does not certify S07".
- Parts with no verified installed pose stay in the parts tray in their part-local orientation; nothing receives an identity pose.
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

# Fidelity revisions (after editing a fidelity batch or builder): rebuild the store, then rerun the chain
PYTHONPATH=digital-twin/cad <py> -m twin_cad.assemblies.instructional.revisions --root "$PWD" --output <scratch>/revisions
#   compare every existing .brep byte for byte, then copy the new files and revision-artifacts.json into
#   digital-twin/validation/expected/m7/instructional-revisions/
PYTHONPATH=digital-twin/cad <py> -m twin_cad.fidelity.plate_a --root "$PWD" --output <review.json> --revision <batch.json>
PYTHONPATH=digital-twin/cad <py> -m twin_cad.fidelity.pi5 --root "$PWD" --chain digital-twin/generated/studio/chain/<run> \
    --output digital-twin/validation/expected/m7/fidelity/display --vendor-crosscheck
PYTHONPATH=digital-twin/cad <py> -m pytest digital-twin/cad/tests/test_studio_fidelity.py

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
