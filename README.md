# PiCar

A local PiCar-X companion built with Tauri, React, and TypeScript. The app provides a setup wizard, searchable reference documentation, and video lessons.

The application lives in `picarx-companion/`. With Node.js and pnpm installed:

```sh
cd picarx-companion
pnpm install
pnpm dev
```

## Documentation sources

The bundled reference pages and media originate from [SunFounder PiCar-X](https://github.com/sunfounder/picar-x), revision `ce2ef77d7f96ac6325c1c8c3fe584b9caab418e4`, and its [shared documentation](https://github.com/sunfounder/sf-shared), revision `0c11f833f862661779180ea7da2a25fd515c40d8`. The separate local `sunfounder-docs/` checkout is not included in this repository.

The content pipeline in `picarx-companion/tools/content-pipeline/` converts those reStructuredText sources to the bundled JSON pages, applies companion-specific corrections and navigation, and copies referenced media. `picarx-companion/custom-docs/hermes.rst` is a companion addition, not an official SunFounder chapter. The pipeline expects the upstream checkout at `sunfounder-docs/`, including its `_shared` submodule, and the assembly manual at `sunfounder-docs/pdfs/z0104v40-a0001013-picar-x.pdf`. These sources are not needed to use the already generated pages.

Some upstream authentication screenshots contain visible or partially obscured credentials and account details. Those screenshots and the Raspberry Pi Connect authentication video are excluded from publication by `.gitignore`; their local originals are preserved. Consequently, a fresh clone omits those tutorial illustrations. Regenerating the documentation does not make the excluded media safe to publish.

## Third-party notices

SunFounder documentation, example code, and media retain their upstream notices and terms. The PiCar-X upstream README specifies GNU GPL version 2 or later; a copy is included in [LICENSE-SunFounder](LICENSE-SunFounder). The companion's generated documentation is an adapted presentation of those sources, with the transformation sources included here. This project is not an official SunFounder release. No separate license is granted here for independently authored companion code.
