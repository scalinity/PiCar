# Source register and inspection limits
**Inspection/retrieval date: 2026-09-29.** Repository reads were pinned to `9e54b2fb3199c22f5d5c7cd67c8e4531ab2246f8` after live main resolution. No GitHub write action was performed. These source records distinguish a located file from inspected bytes and a source statement from applicable engineering evidence.

## Repository sources
### R01 — Live main branch resolution

https://api.github.com/repos/scalinity/PiCar/branches/main

Resolved 9e54b2fb3199c22f5d5c7cd67c8e4531ab2246f8; inspection baseline, not a guessed handoff SHA.

### R02 — Repository README

https://github.com/scalinity/PiCar/blob/9e54b2fb3199c22f5d5c7cd67c8e4531ab2246f8/README.md

Upstream provenance, build instructions, excluded media and companion overlay context.

### R03 — Pinned SunFounder upstream tree

https://api.github.com/repos/sunfounder/picar-x/git/trees/ce2ef77d7f96ac6325c1c8c3fe584b9caab418e4

Commit exists; docs tree inspected. A separately acquired PDF is not proven by this commit alone.

### R04 — Actual pinned shared-docs gitlink

https://api.github.com/repos/sunfounder/picar-x/contents/docs/source/_shared?ref=ce2ef77d7f96ac6325c1c8c3fe584b9caab418e4

The gitlink points to sf-shared at 0c11f833f862661779180ea7da2a25fd515c40d8; .gitmodules also read.

### R05 — Bundled assembly PDF metadata

https://api.github.com/repos/scalinity/PiCar/contents/picarx-companion/public/content/pdf/picar-x-assembly.pdf?ref=9e54b2fb3199c22f5d5c7cd67c8e4531ab2246f8

11,048,665 bytes; Git blob SHA-1 85c752c505c2a52bf82900111fd3a31c6ad0f9d8. Binary contents NOT retrieved; SHA-256 and V40 equivalence unresolved.

### R06 — Content pipeline build and overlay

https://github.com/scalinity/PiCar/blob/9e54b2fb3199c22f5d5c7cd67c8e4531ab2246f8/picarx-companion/tools/content-pipeline/build.ts

Actual source read, including V40 preference/V33 fallback, case/anchor validation, 62-page expectation and deletion/emission. overlay.ts also read for wizard/corrections.

### R07 — Root ignore policy

https://github.com/scalinity/PiCar/blob/9e54b2fb3199c22f5d5c7cd67c8e4531ab2246f8/.gitignore

Separate upstream checkout and sensitive media excluded; this does not establish bundle filtering.

### R08 — Frontend dependency/scripts manifest

https://github.com/scalinity/PiCar/blob/9e54b2fb3199c22f5d5c7cd67c8e4531ab2246f8/picarx-companion/package.json

React19, TS5.8, Vite7, Tauri2 ranges, pnpm and the five existing scripts. Lock exists; no installed-version/build success claim.

### R09 — App and frontend entry

https://github.com/scalinity/PiCar/blob/9e54b2fb3199c22f5d5c7cd67c8e4531ab2246f8/picarx-companion/src/App.tsx

Four routes/nav sections, external opener, fixed hardware chip. main.tsx read for StrictMode and CSS entry points.

### R10 — Custom hash router

https://github.com/scalinity/PiCar/blob/9e54b2fb3199c22f5d5c7cd67c8e4531ab2246f8/picarx-companion/src/lib/router.ts

Full parseRoute/useHash/refHref source read; nested reference links and malformed decode risk.

### R11 — Progress store

https://github.com/scalinity/PiCar/blob/9e54b2fb3199c22f5d5c7cd67c8e4531ab2246f8/picarx-companion/src/lib/progress-store.ts

Full localStorage picarx.v1 shape, synchronous writes and hashchange bookmark source read.

### R12 — Content type contract

https://github.com/scalinity/PiCar/blob/9e54b2fb3199c22f5d5c7cd67c8e4531ab2246f8/picarx-companion/src/lib/content-types.ts

Tagged AST, Page/Section/Search/Video/Wizard types inspected.

### R13 — Generated wizard and page

https://github.com/scalinity/PiCar/blob/9e54b2fb3199c22f5d5c7cd67c8e4531ab2246f8/picarx-companion/src/content/wizard.json

Eight stage IDs, assembly PDF/videos/checks; WizardStep.tsx and authoring overlay.ts also read.

### R14 — Home page

https://github.com/scalinity/PiCar/blob/9e54b2fb3199c22f5d5c7cd67c8e4531ab2246f8/picarx-companion/src/pages/Home.tsx

Setup summary, next incomplete stage and lastRoute resume inspected.

### R15 — Reference/search integration

https://github.com/scalinity/PiCar/blob/9e54b2fb3199c22f5d5c7cd67c8e4531ab2246f8/picarx-companion/src/pages/Reference.tsx

Reference tree/pager and SearchBox.tsx substring/heading-priority/20-result algorithm inspected.

### R16 — Video course page

https://github.com/scalinity/PiCar/blob/9e54b2fb3199c22f5d5c7cd67c8e4531ab2246f8/picarx-companion/src/pages/Videos.tsx

Registry sorting, thumbnail network URL, slug detail and lesson links inspected.

### R17 — Content access layer

https://github.com/scalinity/PiCar/blob/9e54b2fb3199c22f5d5c7cd67c8e4531ab2246f8/picarx-companion/src/content/index.ts

Eager page glob, JSON casts and registry; nav.json read for exact hardware/lesson page IDs.

### R18 — Camera hardware page

https://github.com/scalinity/PiCar/blob/9e54b2fb3199c22f5d5c7cd67c8e4531ab2246f8/picarx-companion/src/content/pages/hardware/cpn_camera.json

OV5647 claim, conflicting prose/spec dimensions and power-off warning. Not proof of the supplied board revision or exact geometry.

### R19 — Ultrasonic hardware page

https://github.com/scalinity/PiCar/blob/9e54b2fb3199c22f5d5c7cd67c8e4531ab2246f8/picarx-companion/src/content/pages/hardware/cpn_ultrasonic.json

HC-SR04 family/5V/dimension/connector text inspected. V40 applicability and supply-label conflict remain unresolved.

### R20 — Robot HAT hardware page

https://github.com/scalinity/PiCar/blob/9e54b2fb3199c22f5d5c7cd67c8e4531ab2246f8/picarx-companion/src/content/pages/hardware/cpn_robot_hat.json

Links latest robot-hat-v4 docs; does not itself identify the actual board revision.

### R21 — Native shell and configuration

https://github.com/scalinity/PiCar/blob/9e54b2fb3199c22f5d5c7cd67c8e4531ab2246f8/picarx-companion/src-tauri/src/lib.rs

Template greet/opener; Cargo.toml, tauri.conf.json and capabilities/default.json also read. SQLite is a proposal, not an existing subsystem.

### R22 — PDF and document components

https://github.com/scalinity/PiCar/blob/9e54b2fb3199c22f5d5c7cd67c8e4531ab2246f8/picarx-companion/src/components/PdfViewer.tsx

PDF.js worker/cache/page behavior; RstRenderer.tsx and DocImage.tsx source also read. Checklist/CodeBlock/VideoEmbed discovered in component tree; no exhaustive audit of those three bodies claimed.

### R23 — Styling tokens

https://github.com/scalinity/PiCar/blob/9e54b2fb3199c22f5d5c7cd67c8e4531ab2246f8/picarx-companion/src/styles/tokens.css

Plain CSS token system and reduced-motion CSS inspected; base/components stylesheet entry paths confirmed by main.tsx.

### R24 — Build/tool TS configuration

https://github.com/scalinity/PiCar/blob/9e54b2fb3199c22f5d5c7cd67c8e4531ab2246f8/picarx-companion/tsconfig.json

Strict compiler settings and src-only include inspected; vite.config.ts read for port/HMR/native watch exclusions.

## External primary sources
### W01 — CadQuery assemblies

https://cadquery.readthedocs.io/en/latest/assy.html

Inspected primary documentation on assemblies and constraints; pinned exact tool versions remain M4.

### W02 — CadQuery import/export

https://cadquery.readthedocs.io/en/latest/importexport.html

Inspected primary STEP/DXF/glTF interchange documentation. Runtime exporter choice is this specification’s design.

### W03 — React Three Fiber maintainer README

https://github.com/pmndrs/react-three-fiber/blob/master/readme.md

Read through GitHub; React19 pairs with Fiber9. Runtime patch lock is not inferred from this mutable URL.

### W04 — Three WebGLRenderer

https://threejs.org/docs/pages/WebGLRenderer.html

WebGL2 baseline documented; WebGL1 not a fallback in the chosen stack.

### W05 — Khronos glTF 2.0 specification

https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html

Inspected coordinate/transform/hierarchy conventions; project adds stricter ID/naming/asset rules.

### W06 — Tauri WebDriver testing

https://v2.tauri.app/develop/tests/webdriver/

Current primary docs describe WDIO embedded provider for macOS and native test-plugin setup. Compatibility still needs actual build testing.

### W07 — glTF-Transform Meshopt function

https://gltf-transform.dev/modules/functions/functions/meshopt

Convenience optimization includes quantization/reordering; specification requires explicit configuration and decode validation.

### W08 — Three GLTFLoader

https://threejs.org/docs/pages/GLTFLoader.html

Primary loader/decoder interfaces inspected. Local decoder and lifecycle policy is a project requirement.

### W09 — OpenCV solvePnP documentation

https://docs.opencv.org/4.13.0/d5/d1f/calib3d_solvePnP.html

Primary calibration/pose coordinate description; no complete assembly verifier or measured project accuracy implied.

### W10 — University of Michigan AprilTag project

https://april.eecs.umich.edu/software/apriltag

Primary fiducial detection/pose project; physical tag size and registration still require evidence.

### W11 — Official PiCar-X assembly documentation

https://docs.sunfounder.com/projects/picar-x-v20/en/latest/assemble.html

Printed manual governs assembly over backup video; servo preparation guidance. URL family v20 is not a replacement for printed revision V40.

### W12 — SunFounder PiCar-X product page

https://www.sunfounder.com/products/picar-x

Used only as current product-family context/candidate acquisition; no exact component CAD identity established.

### W13 — Robot HAT documentation family

https://docs.sunfounder.com/projects/robot-hat-v4/en/latest/

Mutable family site can contain later board material. Not proof of owner HAT identity.

### W14 — Official Raspberry Pi4 mechanical source category

https://pip.raspberrypi.com/categories/545-raspberry-pi-4-model-b

Mechanical PDF located; direct PDF fetch timed out in this pass. Do not treat its unseen numerical contents as verified.

### W15 — Official Raspberry Pi5 source category and mechanical drawing

https://pip.raspberrypi.com/categories/892-raspberry-pi-5

Category inspected; drawing page read and screenshot inspected. It explicitly limits dimensions to approximate/reference use, not production data. STEP ZIP located but bytes not inspected.

### W16 — Official Zero2W mechanical drawing

https://pip-assets.raspberrypi.com/categories/584-raspberry-pi-zero-2-w/documents/RP-008358-DS-1-raspberry-pi-zero-2-w-mechanical-drawing.pdf

One-page drawing read and screenshot inspected. Source supplies planar reference dimensions, not every board component/tolerance or actual user hardware configuration.


## Exact official Raspberry Pi acquisition locators

Pi4 drawing, located but not read because of fetch timeouts:
`https://pip-assets.raspberrypi.com/categories/545-raspberry-pi-4-model-b/documents/RP-008343-DS-1-raspberry-pi-4-mechanical-drawing.pdf`

Pi5 drawing, inspected including its reference-only warning:
`https://pip-assets.raspberrypi.com/categories/892-raspberry-pi-5/documents/RP-008347-DS-1-raspberry-pi-5-mechanical-drawing.pdf`

Pi5 no-graphics STEP ZIP, official category link located, binary unsupported by the reader:
`https://pip-assets.raspberrypi.com/categories/892-raspberry-pi-5/documents/RP-010083-CA-1-rpi-5%203D%20STEP%20-%20No%20Graphics%20small%20file.zip`

M5 must acquire/pin/inspect exact bytes and any embedded limitations before using that STEP as engineering evidence. A category listing is evidence of a candidate download, not validation of its geometry.

## What was not established

No complete authoritative public Z0104V40 mechanical CAD set was conclusively established by this targeted search. No generic motor, servo, ultrasonic board, camera, wheel or plate CAD was admitted. No owner loose-part measurement or actual inventory count was made. No complete repository binary checkout was obtained, and the app was not run. The bundled PDF and vendor STEP bytes were not inspected. Missing byte hashes are recorded as unresolved, never invented from filenames or Git object IDs.

Original owner image SHA-256 values and crop provenance are in `EVIDENCE/manifest.json`. Repository Git blob values identify the source object; they are not SHA-256 hashes of these local package files. External mutable documentation is a technology research input; production geometric sources must be locked by revision and hash during authoring.

## Independent audited-copy rechecks (29 September 2026)

Current main was independently resolved at audit start and again at delivery preparation: `9e54b2fb3199c22f5d5c7cd67c8e4531ab2246f8`; no drift observed. Actual repository files and the upstream shared gitlink were re-read as listed in AUDIT_REPORT.md. The PDF metadata was rechecked, but its binary content/SHA-256/panels remain Q-02.

The audit independently rechecked the current maintainer Fiber README, Tauri WebDriver guide, Three.js WebGLRenderer documentation and RFC8785. Other external mechanical-source entries above are retained from the original source register as candidates/prior inspection records; this audit does not claim to have downloaded or certified their CAD. Official approximate-source limitations remain binding. No newly inferred dimension or electrical instruction is added.
