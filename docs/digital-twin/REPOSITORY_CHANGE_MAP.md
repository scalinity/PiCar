# Repository change map

## 1. Integration boundary

This is a migration of `picarx-companion/`, not a replacement application. Paths marked **existing** were inspected at the baseline commit recorded in README. Paths marked **new** are required target paths, not claims that files already exist. Preserve all current routes, setup-stage IDs, generated page IDs, video slugs, and the Tauri application identifier. The source register supplies exact baseline locators.

## 2. Existing files: precise disposition

| Existing path under `picarx-companion/` | Disposition / required change | Regression boundary |
|---|---|---|
| `src/App.tsx` | Extend navigation with Assembly; lazy-load the assembly feature behind a Suspense/error boundary; wrap startup in persistence initialization; replace unqualified hardware chip with source-scoped project identity | Four current navigation sections and external-link behavior remain functional; browser opener fallback is explicit and catches failures |
| `src/main.tsx` | Keep React StrictMode and current global styles; add assembly stylesheet import or lazy feature CSS; initialize platform adapter without module-import writes | No duplicate event commits under StrictMode; no blocking CAD/GLB load on Home |
| `src/lib/router.ts` | Extend the existing discriminated union and parser; add safe decoding and tested URL builders, no router-library replacement | Existing nested reference paths and `?s=` anchors stay unchanged |
| `src/lib/progress-store.ts` | Migrate implementation behind its public setup-progress facade; one-time validated `picarx.v1` import; delegate durable writes through the persistence port | Preserve old keys/data, expose initialization/save failures, never infer 29-step completion from `steps.assembly` |
| `src/lib/content-types.ts` | Extend only the documentation/wizard integration contract: optional assembly launcher reference and source/missing-media metadata where needed | Do not put mechanical constraints, meshes or assembly state into `Block` or `WizardStep` |
| `src/pages/Home.tsx` | Keep eight-stage setup summary; add independent assembly-session/coverage card | Historical setup completion and resume links still work |
| `src/pages/WizardStep.tsx` | Wrap only the `assembly` stage with launcher, coverage, and returned completion summary; retain PDF, text and video options | Remaining seven stages retain behavior; assembly manual completion remains explicitly self-reported |
| `src/pages/Reference.tsx` | Keep rendering and document pager; add contextual assembly/part cross-links outside generated article truth | Existing page/section routes remain stable |
| `src/pages/Videos.tsx` | Keep registry/lesson links; make remote media/network requirements clear; add safe missing-media states | Do not claim remote YouTube thumbnails or streams work offline |
| `src/components/SearchBox.tsx` | Extract existing document search into a tested adapter; federate typed `document`, `part`, `assemblyStep` results with destination builders | Existing document heading priority and section navigation stay available |
| `src/components/PdfViewer.tsx` | Add revision/source label, optional requested panel/page, retry that clears rejected cache promise, accessible source-text alternative | Existing booklet page bookmark migrates; no claim generic PDF filename proves V40 |
| `src/components/DocImage.tsx` | Add missing/excluded-media placeholder, descriptive source/alt handling, keyboard lightbox/dismissal | Excluded sensitive assets are not restored to satisfy a broken-image check |
| `src/components/RstRenderer.tsx`, `Checklist.tsx`, `CodeBlock.tsx`, `VideoEmbed.tsx` | Preserve and reuse; narrow accessibility/offline/error changes only where integration requires them | No wholesale renderer replacement or HTML execution expansion |
| `src/content/index.ts` | Preserve existing synchronous documentation interface initially; keep twin assets/data out of eager page imports | Do not eagerly import a whole robot or evidence image corpus into the main JavaScript bundle |
| `src/content/wizard.json` | Generated output only: regenerate from overlay after adding launcher metadata | Never hand-edit it as canonical assembly truth |
| `src/content/pages/**`, `nav.json`, `search-index.json`, `videos.json` | Preserve generated content; add separately generated assembly indexes and overlay links | Stable IDs/slugs, current companion corrections and `custom/hermes` survive |
| `tools/content-pipeline/overlay.ts` | Canonical setup-wizard integration changes belong here; preserve video correction and image-path corrections | Avoid regenerating old source mistakes or losing Hermes navigation |
| `tools/content-pipeline/build.ts` | Remove V33 fallback; read explicit V40 source lock; validate hashes/revisions; publish staged output atomically; run privacy-aware publication checks | `public/content` regeneration MUST NOT touch `public/twin`; failure must leave prior valid content usable |
| `tools/content-pipeline/rst-parser.ts`, `transform.ts` | Preserve parser whitelist and transformation behavior; add only tests/required safe missing-media handling | No generic execution of embedded upstream HTML or code |
| `custom-docs/hermes.rst` | Preserve unchanged unless a specific broken integration is demonstrated | It remains companion-authored, not official SunFounder evidence |
| `public/content/**` | Continue generated documentation/media only | Existing `.gitignore` exclusions also become explicit publication-deny tests; not a twin output directory |
| `src/styles/tokens.css`, `base.css`, `components.css` | Reuse current visual language; add only shared semantic tokens/layout support | Light/dark mode, focus visibility and readable documentation remain intact |
| `src-tauri/src/lib.rs` | Replace unused template `greet` handler with narrowly scoped persistence, artifact and export/import commands; retain opener | No shell execution, raw SQL or broad filesystem command added |
| `src-tauri/src/main.rs`, `build.rs` | Keep existing entrypoint/build plumbing; changes only for test-only plugin gating or bundle resources | Shipping binary cannot contain the native test bridge |
| `src-tauri/Cargo.toml`, `Cargo.lock` | Add pinned compatible `rusqlite` bundled SQLite, hashing and validation dependencies; lock transitive graph | Preserve Rust 2021 compatibility unless a separately documented dependency requirement forces a bounded update |
| `src-tauri/tauri.conf.json` | Preserve identifier/window defaults; add narrowly tested CSP and resource paths; camera permission only in M13 | Never change app identifier during migration; no camera prompt in M0–M12 |
| `src-tauri/capabilities/default.json` | Retain necessary core/opener access; explicit command permissions scoped to main window | No blanket filesystem/shell grant; tests assert denied capabilities |
| `package.json`, `pnpm-lock.yaml` | Preserve existing scripts; add specified validation/testing/twin scripts and compatible locked 3D packages | Existing `pnpm dev`, `build`, `preview`, `tauri`, `content:build` keep their meanings |
| `tsconfig.json`, `tsconfig.node.json`, `vite.config.ts` | Keep strict frontend configuration and port 1420; add separate tool/test configs; split lazy feature chunks | Do not relax strictness to admit generated schema/type errors; test tools are not currently covered merely by `include: [src]` |

Root `README.md`, `.gitignore`, and `LICENSE-SunFounder` remain. Extend README with model/evidence status and authoring commands; extend ignore rules for private evidence, source vaults and generated caches; never weaken existing sensitive-media exclusions. Do not reinterpret the lack of a companion-code license as permission to redistribute arbitrary third-party CAD.

## 3. Concrete target tree

```text
PiCar/
  README.md
  .gitignore
  LICENSE-SunFounder
  docs/digital-twin/                  # This specification, change history, ADRs
  digital-twin/
    package.json                     # Node authoring CLI/scripts, not app runtime
    pnpm-lock.yaml                   # Authoring tool lock; separate from app lock
    pyproject.toml
    uv.lock                          # Python/CadQuery/OCP lock
    toolchain.lock.json              # Exact Python/Node/OCCT/exporter versions
    schemas/                         # Canonical JSON Schema + generated-type recipes
    evidence/
      records/                       # Scoped evidence and claim JSON records
      sources.lock.json              # Revision/URL/hash/applicability/rights manifest
      conflicts/                     # Explicit competing claims and resolutions
      private/                       # Ignored owner originals, never auto-bundled
      cache/                         # Ignored immutable fetched bytes by SHA-256
    components/
      definitions/                   # PartDefinition and owned element definitions
      instances/                     # Planned kit stock; not owner stock guesses
      measurements/                  # Nominal values, uncertainty, derivations
      interfaces/                    # Stable feature frames and connector points
      inventory/                     # Printed BOM and variant dispositions
    assemblies/v40/
      manifest.json                  # Revision and graph entry point
      steps/                         # 29 source-numbered step records
      operations/                    # Ordered canonical state operations
      connections/                   # Mechanical and cable graph edges
      variants/                      # Pi4/Pi5/Zero2W patches
      presentation/                  # Motion/camera/explode policies, never final CAD truth
    cad/
      twin_cad/                      # Python package and CLI
        components/                  # Parametric reconstruction scripts
        vendor/                      # Datum/interface wrappers, not modified vendor originals
        assemblies/                  # Constrained master and intermediate solves
        verification/                # Analytic/solid/DOF/collision checks
      source-vault/                  # Ignored licensed OEM source bytes by hash
      exports/                       # Ignored generated STEP/mesh packets/reports
    presentation/
      materials/                     # Reproducible PBR material descriptions
      blender/                       # Optional headless UV/texture-only scripts
      textures/                      # Cleared, source-tracked texture inputs
    tools/
      cli.ts                         # validate/compile/assets/publish/check commands
      evidence/                      # Fetch/hash/locator/applicability tooling
      compiler/                      # Variant graph, dependency closure, admission compiler
      export/                        # glTF-Transform builder and identity checks
      publication/                   # Runtime/rights/privacy allowlisted staging
    validation/
      fixtures/                      # TEST-* synthetic mechanical data; never production
      tests/                         # Schema, BOM, graph and asset tests
      expected/                      # Reviewed deterministic reports/snapshots
    generated/                       # Ignored compiled graphs, solutions, indexes, GLBs
  picarx-companion/
    src/
      domain/assembly/               # Pure reducer, operations, replay, invariants
      domain/components/             # Read-only canonical manifest access and selectors
      generated/twin/                # Generated schema types only, not hand-authored truth
      platform/                      # Persistence/asset/camera ports and platform selection
      platform/browser/              # IndexedDB and browser preview adapter
      platform/tauri/                # Typed native invokes, no domain logic duplication
      features/assembly-3d/
        scene/                       # Canvas, instance registry, materials, selection
        assets/                      # Verified loader/cache/lifecycle management
        motion/                      # Pure evaluators + frame-loop presentation driver
        camera/                      # Controls and focus arbitration
        ui/                          # Step, trays, inspector, warnings, coverage
        state/                       # Ephemeral presentation store; not persistent truth
      features/assembly-session/     # Session commands, save status, variant fork/migration
      features/observation/          # M13 only: local camera/observability adapters
      pages/Assembly.tsx             # Route entry/loader/error boundary
      styles/assembly.css            # Existing design tokens, scoped feature layouts
      content/                      # Existing documentation outputs preserved
      lib/                          # Existing router/progress/content facades preserved
    public/twin/<packHash>/          # Published runtime pack outside content generator ownership
      manifest.json
      graphs/<variant>.json
      assets/<assetHash>.glb
      indexes/
      decoders/                      # Only when admitted compression requires them
    src-tauri/src/
      persistence/                   # SQLite connection, migrations, transactions
      commands/                      # Narrow typed application commands
      artifacts/                     # Hash/manifest/path integrity, export/import
      observation/                   # M13 storage/permissions only; no frame retention default
    tests/                           # Unit/domain/browser/native/visual test suites
    tools/                           # Existing content pipeline + new app-side test launchers
```

Use ordinary Git for small cleared source JSON/scripts and explicitly selected runtime packs. Do not add Git LFS initially: large vendor evidence lives in a hash-locked cache and published packs are reproducible artifacts. If any proposed checked-in file exceeds 50 MiB, stop at a named asset-distribution gate; keep that binary out of the default commit until its storage/rights plan is documented. This is a repository policy, not a claim about GitHub's limits. Release packages must include all required runtime bytes; a network download must not be necessary for the basic assembly/reference journey.

## 4. Migration sequence and rollback

M0 protects baseline routes and data and establishes source/publication tests. M1–M2 author canonical data without touching live progress. M3 introduces the storage adapter and reference-first Assembly route behind a feature flag while preserving the legacy store backup. M4–M8 add the independent mechanical pipeline; no content-generated directory becomes its source. M9–M11 progressively enable only admitted 3D capabilities. M12 removes development-only feature toggles after acceptance, but the reference-only fallback remains permanent.

Database migrations are forward-only with an exported recovery snapshot, not destructive schema rollback. Before replacing a pack or migrating its graph, retain the pinned prior pack and session export; a failed migration leaves the prior session readable. Disabling the Assembly navigation must not make old setup progress or reference content inaccessible. Rollback of presentation code never rewrites evidence or invalidates a user's confirmations merely because a material changed.

## 5. Parallel ownership

After M1 freezes schemas and M2 freezes graph semantics, give CAD agents exclusive ownership of `digital-twin/cad` plus narrowly assigned definition/interface records; give the frontend agent `features/assembly-3d` and presentation adapters; give the persistence agent `platform`, `assembly-session` and native persistence. A single integration owner controls schemas, `App.tsx`, `router.ts`, package locks and published manifests. Independent agents may propose schema changes but may not land divergent versions. Merge validated source records before regenerating shared artifacts.

## Audited ownership additions

M0 owns the source-lock, denied-media registry, multi-root coordinator, safe public mirror and dev/build wrapper integration (including the bounded Vite publicDir change). Keep source and local excluded originals unchanged; generated mirrors are never canonical source. M1 owns v2 schemas, typed registries and hash preimages. M2 owns parentAssignments, complete graph/state/variant records. M3 owns command_results, migrations and adapter parity. M8 owns CompiledGraph/AssemblySolution publication, LOD/decoder inventories and packHash pointers. The integration owner alone merges changes to these shared contracts, locks, migrations and publication manifests. See MILESTONE_REVIEW.md for phase-level ownership and rollback.
