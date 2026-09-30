# Architecture

## 1. Inspected baseline

All repository observations below refer to `scalinity/PiCar@9e54b2fb3199c22f5d5c7cd67c8e4531ab2246f8`, independently resolved from `main`. The root README records upstream documentation commits `ce2ef77d7f96ac6325c1c8c3fe584b9caab418e4` and shared-docs `0c11f833f862661779180ea7da2a25fd515c40d8`; the latter was independently verified as the former's actual `docs/source/_shared` gitlink. See source entries R01–R07.

| Subsystem | Observed implementation | Consequence |
|---|---|---|
| Frontend | React/React DOM `^19.1.0`, TypeScript `~5.8.3`, Vite `^7.0.4`; `src/main.tsx` mounts StrictMode | Extend the existing SPA; account for StrictMode lifecycle and cleanup. These are manifest ranges, not a claim about installed versions. |
| App shell | `src/App.tsx` statically imports Home/WizardStep/Reference/Videos; four nav items; external HTTP links intercepted with opener | Add a lazily imported Assembly route; preserve shell and current routes. Replace the misleading hardcoded hardware chip with project identity. |
| Routing | `src/lib/router.ts`: small hash router using `useSyncExternalStore`; reference supports nested page IDs and `?s=` section | Extend discriminated route union; no router-library replacement. Add malformed-percent-encoding tests. |
| Persistence | `src/lib/progress-store.ts`: module store, `picarx.v1` localStorage, shallow JSON defaults, synchronous writes | Retain public facade during migration; introduce validated durable repository underneath. Current writes can throw and data is not schema-validated. |
| Setup | Eight stages: parts, os, power, connect, software, servo-zero, assembly, calibrate | Preserve IDs and useful flow. Assembly becomes a project-linked stage, not the entire setup replacement. |
| Assembly today | `WizardStep.tsx` embeds a PDF, video entries and content pages with independent completion/checklists | No existing part/connection graph or 29-step engine to preserve. Add those as a domain subsystem. |
| Documentation | Tagged block AST in `content-types.ts`; `RstRenderer.tsx`; `Reference.tsx` tree and paging | Preserve the content schema and renderer. Assembly cross-links are additive. |
| Content access | `src/content/index.ts` eagerly imports every page plus nav/search/videos/wizard JSON | Keep heavy twin manifests/GLBs outside this module. Lazy-route splitting must not accidentally import them through Home. |
| Search | `SearchBox.tsx`: case-insensitive substring search, heading priority, first 20 hits | Add a separately generated assembly/part search source and typed destinations. Do not replace the existing reference index. |
| Media | `public/content` images/PDF/local video; Videos also uses network YouTube thumbnails and embedded/external content | Preserve honest offline boundaries. Missing private media gets a placeholder, not automatic fetching. |
| PDF | Local PDF.js worker; per-URL promise cache; shared `pdfLastPage`; no retry after cached rejection | Keep behavior, add retry and document-keyed progress compatibility when touched. Lazy-load its route/widget to avoid making 3D entry load PDF.js. |
| Content authoring | `tools/content-pipeline/{build,overlay,rst-parser,transform}.ts`, `custom-docs/hermes.rst` | Extend overlay/schema and regenerate outputs; never hand-edit generated wizard JSON as authoritative source. |
| Pipeline hazards | Prefers V40 PDF but falls back to V33; deletes `src/content/pages` and `public/content` before emission; expects 62 crawled official pages before custom additions | Remove silent fallback for V40 build; do not place twin assets under `public/content`; add staged publication and drift manifests. |
| Styling | Plain CSS `tokens.css`, `base.css`, `components.css`; light/dark custom properties, mono labels, system fonts | Add scoped feature CSS using these tokens. No Tailwind/component-kit rewrite. |
| Native | Rust/Tauri 2; template greet command and opener plugin only; no current database or CAD processing | Remove greet when introducing real commands. CAD remains offline authoring, not native runtime. |
| Native configuration | 1440×900, minimum 1100×700; identifier `com.danny.picarx-companion`; CSP null | Retain identifier/window defaults. Add tested scoped capabilities/CSP rather than changing app identity. |
| Build/test | Existing scripts: dev, build, preview, tauri, content:build; no configured test/lint script in inspected package manifest | Add explicit suites. No successful build/test result is asserted by this planning inspection. |

The README and `.gitignore` deliberately exclude sensitive upstream screenshots/authentication media. **A Git ignore rule is not a packaging filter**: locally regenerated files under `public` could still enter a Vite/Tauri bundle. A clean staging manifest and redacted/missing-media placeholders are required. This is a small local-project safeguard, not an enterprise governance program.

## 2. Chosen architecture and dependency direction

**D-ARCH-01 — Canonical source pipeline**

```text
evidence bytes + exact locators + source applicability
    -> canonical JSON: claims, definitions, instances, interfaces, 29-step semantics
    -> Python/CadQuery + OpenCascade: deterministic part geometry
    -> constrained, variant-specific nominal master assembly
    -> independent geometric/semantic checks + G-CAD report
    -> immutable tessellation packets + material/texture presentation overlay
    -> per-definition GLB files + final-byte validation / G-GEOMETRY
    -> independent content-addressed runtime manifest
    -> pure TypeScript assembly reducer/projection/motion evaluator
    -> React assembly UI + React Three Fiber / Three.js viewport
```

There is no reverse path from a visual edit or GLB transform to canonical mechanical truth. CAD generation and constraint solving are offline build activities. The application does not need Python, FreeCAD, OpenCascade or Blender installed on the owner's Mac.

**D-ARCH-02 — Runtime stack:** retain React 19, TypeScript, Vite and Tauri 2; use **Three.js WebGLRenderer (WebGL2)** with **React Three Fiber 9**, and selectively use **Drei OrbitControls**. R3F's maintainer documents the React 19/Fiber 9 pairing [W03]. WebGLRenderer's current documented baseline is WebGL2, not WebGL1 [W04]. WebGPU is not a release dependency. Do not add Babylon, a game engine, a physics engine, a second router, Redux, or a general animation framework.

R3F fits the existing React component/event model while Three remains responsible for scene objects and rendering. Domain state is framework-independent. A single deterministic frame evaluator handles assembly motion, camera interpolation and presentation offsets. Drei is a convenience adapter, not an authority for asset metadata, state, or automatic recentering.

**D-ARCH-03 — CAD stack:** Python 3.12, CadQuery 2.x backed by a locked OpenCascade/OCP version. CadQuery scripts own reconstructed engineering solids and feature frames; vendor STEP is immutable imported source. FreeCAD is an independent inspection/interchange tool, not a competing editable master. Official KiCad projects may supply PCB mechanics only after exact revision mapping. CadQuery supports STEP/DXF interchange and assembly glTF export [W01/W02], but this project's final runtime exporter is the explicit mesh/manifest builder in ASSET_PIPELINE_SPEC, not a black-box scene export.

**D-ARCH-04 — Blender is optional presentation tooling:** use headless scripts for texture baking/material review/UV authoring on a copy. The canonical tessellated mechanical positions remain immutable. No `.blend` file is a required repository source for a mounting hole, plate bend, pivot, assembly pose or instructional motion. The normal runtime GLB build does not require Blender at all.

## 3. Logical modules

`src/generated/twin/` contains schema-generated types. `src/domain/assembly/` contains canonical validation adapters, graph compilation, inventory accounting, pure reducers, state projections, capability evaluation and typed repository ports; `src/domain/components/` supplies read-only definition/instance selectors. It imports neither React nor Three nor Tauri. A command produces a deterministic proposed state and a persistence envelope; it never performs IO itself.

`src/features/assembly-3d/` contains the route controller, DOM instruction panels, trays, inspector, reference fallback, camera controls and WebGL view. `scene/` owns all Three objects and mapping between `PartInstanceId` and object roots. `motion/` evaluates the prescribed visual transition at normalized time. `selectors/` maps domain state to renderable projections. No visual component writes an arbitrary final part pose.

`src/platform/` implements the typed session port for Tauri and browser development. `src/features/assembly-3d/assets/` resolves manifests, verifies supported contracts, asks native code to verify local asset integrity, and manages loading/caches. It never chooses a substitute part on a missing-file error.

`digital-twin/` contains checked-in authoring records, schemas, CAD scripts, constraints, source locks and tests. `digital-twin/generated/` is generated/ignored. Approved small runtime outputs are published under `picarx-companion/public/twin/`, not `public/content`. Source photographs live in ignored/private evidence storage by default; only explicitly approved sanitized crops become app media.

## 4. State ownership

| State | Authority / lifetime |
|---|---|
| Part definitions, measured features, source claims, master constraints | Versioned authoring JSON/CAD in `digital-twin/`; immutable in application |
| Compiled graph, variants, feature frames, runtime assets | Hash-bound generated manifest; immutable per session model version |
| Setup checks, session selection, confirmations, invalidations, observations | Durable repository; frontend exposes immutable snapshots |
| Deterministic digital assembly state | Pure reduction/projection of graph plus chosen prefix; reproducible, not inferred from a mesh |
| Pending command | Route/application service, serialized until persistence acknowledgment |
| Animation time, hover, dragged camera, clipping and temporary explosion | Feature-local presentation controller; no per-frame database writes |
| Stable user preferences | Debounced durable preference record; never mechanical truth |
| Camera frames (M13) | Ephemeral local observation adapter unless user explicitly retains a capture |

A “current step” is not sufficient as the entire state. The system independently records physical confirmation progress, preview cursor, variant, model version, and visual transition. Browser history changes the preview route, not the physical ledger.

## 5. Storage decision and native boundary

**D-STORAGE-01:** authoring uses UTF-8 JSON plus JSON Schema 2020-12; generated types come from that schema. Do not maintain independently authored TypeScript and Python model definitions. Use checked-in JSON source and generated compact runtime JSON, not SQLite as an authoring format. Runtime assets are hash-addressed binaries described by manifests.

**D-STORAGE-02:** use one local **SQLite database through Rust `rusqlite` with bundled SQLite** for durable sessions, event records, snapshots, source-version adoption and import/export. There is no server, account, sync service, raw-SQL frontend endpoint or ORM. The small database earns its presence through transactional migrations and atomic multi-record invalidation; it is not a geometry store.

Minimum tables: `meta(schema_version)`, `projects`, `sessions`, `events`, `snapshots`, `setup_progress`, `preferences`, `imports`, and later `observations`. Canonical document bodies are versioned JSON. `events` has `(session_id, sequence)` and command results use unique `(aggregate_id, command_id)` plus requestHash; `sessions` carries `revision` for optimistic concurrency. Foreign keys, WAL mode and atomic transactions are enabled; closing the app never relies on a final unload callback to save a completed step.

The TS domain reducer is the single implementation of assembly semantics. Rust validates envelope size/schema/version, known session, expected revision and unique command ID, then stores the authorized event and bounded snapshot cache atomically; PERSISTENCE_CONTRACT.md defines duplicate lookup before CAS and exact retry results. On load, the frontend replays and cross-checks the stored snapshot hash. Rust does not create a second competing assembly reducer. Corruption moves the session to read-only recovery with export/last-valid-snapshot options; do not silently reset.

Typed native commands: `load_companion_state`, `commit_session_command`, `save_preferences`, `import_session`, `export_session`, `verify_twin_manifest`, `resolve_twin_asset`. Payloads use IDs and allowlisted relative asset paths, not arbitrary filesystem paths. All writes return an acknowledged revision. Retry of the same command ID is idempotent. Native errors are structured and actionable.

The plain-browser `pnpm dev` path uses an **IndexedDB** adapter implementing the same session repository port and transaction semantics. It never pretends to have native file integrity verification; test manifests can be verified with Web Crypto where available. Browser development data is not silently synchronized into the desktop database. Provide explicit versioned export/import for moving a session.

## 6. Legacy progress migration

Keep `picarx.v1` untouched as a recovery source. On first upgraded launch, read and validate its raw string in the frontend. Preserve `steps`, `checks`, `lastRoute` and `pdfLastPage` in a single native migration transaction with the original JSON and hash. Unknown keys are retained in an import record, not trusted as current typed data. Malformed JSON triggers a recovery notice without losing the original.

`src/lib/progress-store.ts` becomes a compatibility facade with the same reads and named actions for existing pages. An asynchronous initialization boundary renders a loading state before progress-dependent UI. Writes become acknowledged commands; components must handle pending/error states. Existing callers may be migrated to `async` actions in M3, but must not optimistically show saved completion before durability succeeds.

Do not translate `steps.assembly='done'` into 29 verified steps. Keep it as `legacyAssemblyReportedDone`; offer a guided reconciliation screen. Preserve the existing PDF last-page value for the legacy assembly document when introducing document-keyed reading progress. Keep the Tauri application identifier unchanged so migration is not accidentally defeated by a new app-data location.

If native storage is unavailable, do not overwrite the legacy key or show a successful migration. Allow read-only reference browsing and an explicit export of the original progress. Migration is one-way additive with a backup; rollback to the baseline app can still read its old key, although new assembly-session progress is available only in the exported/upgraded format.

## 7. Packaging, caching and security

Bundle the approved runtime manifest and admitted assets locally. No CDN decoder, remote model URL or automatic arbitrary download is required to view the kit. Cache parsed definitions by asset hash, reference-count geometry/material/texture resources, and dispose them on route/project teardown. Corrupt or incompatible assets are quarantined; retry uses the exact expected hash and never a “similar” fallback model.

Initially use bundled hashed assets and an in-memory parsed cache. Native disk cache exists only for explicit import/adoption of new model packs; path traversal, symlinks escaping the allowed root, decompression bombs and hash mismatch must fail before adoption. Imported packs are data-only and contain no executable Python, JS, Rust or Blender files in the runtime path.

Introduce a tested CSP for local assets/workers and the exact existing media providers. Preserve legitimate external documentation through the opener path. Do not add broad filesystem or shell permissions to serve models. Native test-only WebDriver/IPC helpers are compiled only under a dedicated E2E feature and absent from shipping binaries.

A clean packaging staging directory is populated from an allowlisted manifest. Apply the existing sensitive-media exclusions to this manifest, not just Git. Preserve local originals, display a neutral omitted-media tile where appropriate, and never include photographs/EXIF from the owner's evidence vault by accidental recursive copy.

## 8. Dependency/version policy and deployment

Do not upgrade React/Vite/Tauri as collateral work. M0 records Node, pnpm, Rust, OS and existing lockfile results. M4 freezes the exact CAD/kernel/meshing toolchain and a canonical build environment; M8/M9 freeze compatible Three/Fiber/Drei/GLB tooling versions with a lockfile and a capability fixture. Patch-version selection is a bounded compatibility task, not an architectural fork. A dependency update must reproduce contract tests and asset hash/semantic comparisons before adoption.

Use the existing Tauri packaging flow and app identifier. Runtime graph/model versions are independent of application versions. A session pins its graph hash and evidence/model manifest; an incompatible model upgrade requires an explicit migration/fork with explained invalidations. Cosmetic texture changes can preserve physical confirmations only when the semantic and mechanical hashes are unchanged.

## 9. Current test-platform finding

Current Tauri documentation describes WebdriverIO's `@wdio/tauri-service` with an **embedded** WebDriver provider that supports macOS [W06]. Direct `tauri-driver` remains a different path. Use the embedded provider for the native Mac suite; do not repeat the older blanket claim that Tauri cannot be automated on macOS. M0 records a bounded feasibility result on the selected development machine and locks any tested test-only plugins. Missing native environment is explicitly BLOCKED; native acceptance cannot be claimed until the actual Mac suite passes in M3/M9. Browser Playwright/WebKit tests remain useful but are not evidence of the packaged application's GPU or IPC behavior.


## 10. Native command and persistence transaction contract

All command payloads are versioned JSON envelopes. A durable command has `commandId`, `payloadVersion`, target aggregate ID, `expectedRevision`, payload and model/graph hashes where relevant. The response is either `acknowledgedRevision` plus the committed aggregate hash, or a typed `CONFLICT`, `INVALID_SCHEMA`, `UNKNOWN_MODEL`, `IO_FAILURE`, `CORRUPT_STATE`, `UNSUPPORTED_VERSION` or `PERMISSION_DENIED` error. Never encode failure as an empty successful state. The frontend remains the single semantic reducer; Rust validates envelopes and storage invariants, not a second independently maintained graph engine.

| Command | Transaction boundary / result |
|---|---|
| `load_companion_state` | Read project/session summaries, setup snapshot, preferences, schema version and migration state; selected session load includes ordered events plus last acknowledged snapshot |
| `import_legacy_progress` | One-time raw-string/hash/idempotency check, validated setup snapshot and import record in one transaction; preserves original bytes; cannot add physical step confirmations |
| `commit_setup_progress` | Compare-and-swap setup aggregate revision; save checks/stage markers/bookmarks atomically; `steps.assembly` remains legacy/self-reported scope |
| `create_assembly_session` | Atomically create a project if requested, a variant/model-pinned session and initial empty-confirmation snapshot; reject unrecognized model pack for instructional capabilities |
| `fork_assembly_session` | Copy only source/project linkage and allowed nonphysical preferences; new variant/session has no physical confirmations; original session remains unchanged |
| `commit_session_command` | Check command ID/revision/model identity; append event and supplied deterministic new snapshot and update session revision in one SQLite transaction |
| `save_preferences` | Debounced compare-and-swap for durable presentation preferences; never change mechanical source values |
| `export_session` | Produce a versioned event/model-reference export with hashes and optional explicitly selected captures; canonical CAD/evidence are references unless explicitly included |
| `import_session` | Validate schema, hashes, pack references and frontend replay result before adoption; unknown packs are provisional/read-only, never trusted by their own PASS label |
| `verify_twin_manifest` | Validate supported manifest, trusted/adopted root, allowed paths, file hashes and admission-report equality; return capability registry or explicit failures |
| `resolve_twin_asset` | Resolve only an allowlisted pack asset ID/relative path; return a sanctioned app-local URL/handle, not an arbitrary filesystem reader |

Use `events(session_id, sequence, command_id, event_type, payload_json, previous_state_hash, next_state_hash)` with unique `(session_id,sequence)` and command-result uniqueness `(aggregate_id,command_id)`; `snapshots(session_id, revision, state_json, state_hash)` references the session. `sessions` stores selected variant, model/graph/evidence hashes and current revision. `setup_progress` and `preferences` have their own aggregate revision. `imports` records original format/hash/raw backup and applied migration version. All foreign keys and transaction constraints are enabled. These database rows store application progress, not canonical part/measurement truth.

Use bounded envelopes: 8 MiB default per session import/command body, with an explicit rejection and separate streamed capture import for larger optional camera data. This is a defensive application limit, not a kit property. Serialize mutation commands per aggregate; a retry reuses commandId. On every successful load, recompute the semantic state from pinned graph/events and compare snapshot hash. Corruption opens read-only recovery rather than inventing a reset or silently trusting the snapshot.

## Audited persistence and publication protocols

[PERSISTENCE_CONTRACT.md](PERSISTENCE_CONTRACT.md) fixes transaction ordering, command-result ownership, attestation atomicity, legacy divergence, WAL-safe backup and restore. Add `command_results` and the explicit migration/backup metadata to the minimum tables. The new app never writes picarx.v1 after adoption. [SOURCE_PUBLICATION_CONTRACT.md](SOURCE_PUBLICATION_CONTRACT.md) fixes multi-root source publication and the safe public mirror; [HASH_AND_PACK_CONTRACT.md](HASH_AND_PACK_CONTRACT.md) fixes immutable twin pack publication. These are separate coordinators/ownership domains. [GATE_CONTRACTS.md](GATE_CONTRACTS.md) makes M0 permission for M1 explicit.
