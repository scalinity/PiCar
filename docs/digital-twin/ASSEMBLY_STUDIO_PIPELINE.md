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
| Display readiness | `studio.mjs pack` from the independent `closure_verify` result | Generator status fields alone |
| Assembly acceptance | M7 gate (`M7_G_INSTRUCTIONAL_ASSEMBLY_REPORT.json`) | The Studio |
| Physical progress | The M3 session ledger | Playback, scrubbing, selection |
| Material intent | `digital-twin/presentation/materials/studio-materials.json` | Hand edits in Blender or the GLB |
| Light rig, camera policy, timing, tray layout | `digital-twin/assemblies/v40/presentation/studio/stage.json` | — |

**One coordinate conversion.** `digital-twin/tools/studio/basis.mjs` maps CAD (RH, +X forward, +Y left, +Z up, mm) to runtime glTF (RH, +Y up, +Z forward, m): `p = 0.001 C p`, poses `(C R Cᵀ, 0.001 C t)`, quaternions `[x, y, z, w]`. Vertices and poses are each converted there, once. Blender's glTF importer and exporter map Y-up to Z-up and back exactly, so the `.blend` is a lossless view of the same pack; `build_studio_scene.py` re-checks every definition's bounds and every instance pose against the manifest after import.

**Geometry is never edited downstream.** The GLB holds one node per part definition at identity, one primitive per CAD solid, core PBR materials and no images. The app places instances from the manifest. Blender assigns materials, lights and cameras only; its scripts rebuild the `STUDIO-SOURCE-*` collections each run and keep `STUDIO-PRESENTATION` and the `MAT-studio-*` materials, so deliberate presentation edits survive a rebuild.

**Display models.** A definition can carry a registered display model (`digital-twin/validation/expected/m7/fidelity/display/`): detailed CAD authored from official drawings in the same part frame. The Studio draws it; assembly checks keep the instructional artifact. Its record holds the relation to the instructional artifact, an overlap check in every closure that places it, and a vendor cross-check where vendor CAD exists. Steps carry those overlaps as `displayChecks`, and the drawer states them.

## Blender to runtime translation

| Blender reference (Cycles) | Runtime (WebGL2) |
|---|---|
| Area lights from `stage.json` (`blenderPowerW`, `spreadDeg`) | The same rectangles, at the same directions, sizes and colours, baked into a PMREM environment (`runtimeIntensity`); no spread |
| Shadow-catcher floor composited over a radial background pool | Shadow-only plane over a CSS radial gradient (`lighting.pool.css`) |
| Bead-blast roughness noise and bump on aluminium | Base roughness only (render-only detail) |
| AgX view transform | `AgXToneMapping` |
| Metal reflections of a dark world | A dim environment base (`runtimeEnvironmentBase`) so metal side walls read as in the reference |

The runtime is not a Cycles render; compare `digital-twin/presentation/blender/renders/` with the app at the same step camera.

## Snapshot, adoption and unresolved content

- A Studio pack names its chain run, tessellation, input hashes and the M7 gate state; `packId` is the SHA-256 of the canonical manifest. `studio.mjs check` recomputes it and the GLB hash.
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
node digital-twin/tools/studio/studio.mjs check

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
open -n -a Blender digital-twin/presentation/blender/picar-studio.blend

# Launch the companion (coordinated; never call vite directly)
cd picarx-companion && pnpm dev          # then open http://localhost:1420/#/studio
cd picarx-companion && pnpm tauri dev --config src-tauri/tauri.m3.json   # native window, M3 persistence
```

Rollback: the pack, the Blender project and the Studio tools are tracked, so `git restore --source=<commit> -- <paths>` returns them together; rerun `studio.mjs check`. Fidelity revisions and display models live in the M7 store (`digital-twin/validation/expected/m7/`) and stay uncommitted with the rest of M7 until its gate admits that work; the pack records their hashes, and the Studio 1 close snapshot in `../PiCar-preservation/2026-10-02-studio1-close/` holds their bytes. Removing a fidelity revision is deleting its batch file and its `.brep`, regenerating the store and rerunning the chain; the M5/M6 originals are never modified. A dev or test run that dies can leave a publication reader lease: `pnpm content:recover` lists it, `pnpm content:recover --apply` clears leases whose owner process is gone.
