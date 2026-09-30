# PiCar

A local PiCar-X companion built with Tauri, React, and TypeScript. The app provides a setup wizard, searchable reference documentation, and video lessons.

The application lives in `picarx-companion/`. With Node.js and pnpm installed:

```sh
cd picarx-companion
pnpm install --frozen-lockfile
pnpm dev
```

## Documentation sources

The bundled reference pages and media originate from [SunFounder PiCar-X](https://github.com/sunfounder/picar-x), revision `ce2ef77d7f96ac6325c1c8c3fe584b9caab418e4`, and its [shared documentation](https://github.com/sunfounder/sf-shared), revision `0c11f833f862661779180ea7da2a25fd515c40d8`. The separate local `sunfounder-docs/` checkout is not included in this repository.

The content pipeline in `picarx-companion/tools/content-pipeline/` converts those reStructuredText sources to the bundled JSON pages, applies companion-specific corrections and navigation, and copies referenced media. `picarx-companion/custom-docs/hermes.rst` is a companion addition, not an official SunFounder chapter. The pipeline expects the upstream checkout at `sunfounder-docs/`, including its `_shared` submodule, and the assembly manual at `sunfounder-docs/pdfs/z0104v40-a0001013-picar-x.pdf`. These sources are not needed to use the already generated pages.

Some upstream authentication screenshots contain visible or partially obscured credentials and account details. Their local originals are preserved. The explicit denied-media registry and an independently checked safe public mirror exclude them from development serving and `dist`, in addition to Git exclusions. Consequently, a fresh clone omits those tutorial illustrations. Existing reference placeholders remain.

## M0 verification and content publication

M0 adds source locking, regression tests and recoverable publication without changing the companion's routes, progress storage or native identity. The [implementation report](docs/implementation/M0_REPORT.md) and [machine-readable gate report](M0_GATE_REPORT.json) record the acceptance scope and later prerequisites. No later milestone is implemented.

```sh
cd picarx-companion
pnpm typecheck
pnpm test:unit
pnpm test:browser
pnpm build
pnpm package:check
```

Browser tests use headless Chromium and WebKit; install those Playwright browsers if absent. Source tests require the separately pinned local upstream checkout. An ordinary checkout can use/build the checked bundled documentation without upstream sources: the entrypoint validates and adopts the shipped generated baseline once, then serves the safe mirror. Regeneration requires the upstream sources and exact V40 bytes:

```sh
pnpm content:check
pnpm content:build
```

Stop dev/preview/build readers before generation. Source errors abort publication; they never update the lock automatically or substitute V33. A journal or stale lease stops consumers until deliberate [recovery](docs/implementation/M0_ROLLBACK.md). Direct Vite invocations that bypass the coordinator are unsupported and fail closed. Durable publication currently requires local macOS storage supporting `F_FULLFSYNC`.

The canonical audited specification resides in `docs/digital-twin/`. The nine owner photos/crops and original ZIP reside only in the ignored `digital-twin/evidence/private/` repository location; they are not runtime or public assets. [Package receipt](docs/digital-twin/SPEC_PACKAGE_RECEIPT.md). [Developer FreeCAD setup](docs/tooling/FREECAD_AGENT_SETUP.md).

## Third-party notices

SunFounder documentation, example code, and media retain their upstream notices and terms. The PiCar-X upstream README specifies GNU GPL version 2 or later; a copy is included in [LICENSE-SunFounder](LICENSE-SunFounder). The companion's generated documentation is an adapted presentation of those sources, with the transformation sources included here. This project is not an official SunFounder release. No separate license is granted here for independently authored companion code.
