# M1 canonical authoring data

This private local authoring package establishes audited v2 contracts for PiCar-X Z0104V40. It is separate from the companion runtime. No reducer, CAD, assets, persistence migration or physical observation is implemented here.

Production contracts live in schemas/; the immutable audited source remains in ../docs/digital-twin/. components/inventory/registry-index.json declares one owner path per canonical record family. Generated frontend declarations in ../picarx-companion/src/generated/twin/ derive from schemas; never edit them manually.

Install reproducibly from this directory with pnpm install --frozen-lockfile and uv sync --locked. Cargo dependencies are pinned by validation/hash-rust/Cargo.lock. Python is used only for the independently requested RFC8785 conformance test. Versions actually tested are recorded in validation/hash-cross-language-report.json; no CAD dependency is installed by this package.

From the repository root:

~~~sh
node digital-twin/tools/evidence/allocate.mjs
node digital-twin/tools/types.mjs
node digital-twin/tools/gate.mjs
node digital-twin/tools/gate.mjs --check
~~~

allocate.mjs transcribes the pinned audited ledger/seed and source declarations into the complete M1 registry. Review any source change before running it: it replaces its named canonical outputs, and is not a general evidence importer. Keep validation/baseline.json pinned to accepted M0, never current HEAD. types.mjs generates both read-only .d.ts files. gate.mjs validates source/registry/privacy, generates hash preimages and reports, runs cross-language conformance, the M1 tests, generated-type drift check and existing companion checks. It invokes only the explicitly requested Rust hash harness and no app/native build. --check checks existing bound bytes/identities without regenerating artifacts. Local committed M1 acceptance is an additional prerequisite for M2.

A raw file SHA-256, domain-separated JCS identity and Git blob ID are distinct. hash-inputs.json classifies authored input and generated output; model/evidence materializations are recomputed caches. No generated output may become its own upstream input. A relevant byte change invalidates docs/implementation/M1_G_DATA_REPORT.json; rerun the affected checks and gate before acceptance. The report deliberately does not contain its own hash or Git commit hash.

Printed hardware totals are documentary inventory. Owner stock is BLOCKED / NOT OBSERVED. Unknown metric values have unit/confidence/blockers and no value; printed M3x26 never supplies a 26 mm manufactured dimension. Schematic connectors and integral cable endpoints retain unresolved pin/key/route geometry. The owner instance plus its integral lead element is one stock item. Hook/loop child piece IDs are preallocated; unknown amounts/capacities do not become zero.

Private source bytes stay ignored under evidence/private/. Source metadata exposes hashes/relative locators only; never copy photographs, crops, archives or vendor CAD into public/. Source rights and applicability remain unresolved where recorded, including Q-17. Dependency code is used through pinned packages; no third-party implementation was copied into this package.
