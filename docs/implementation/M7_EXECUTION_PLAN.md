# M7 instructional assembly execution boundary

Owner authorization: 2026-10-01, current assignment and active-board amendment. M6 implementation 40289533c1aac160de88261e5a2712fdf9aac34e, tree 7e64b1ef867e0bbcd9efce813bb240dd07f0edd6, is distinct from start documentation HEAD d8b95f2b7fbe8cc67c7b38e8272b662c6ac804ca. Preflight independently recompiled all three accepted graphs, verified 1085 retained bindings, all fifty M5 and eight M6 receipts through unchanged guards, and twelve untracked M2 diagnostics. The only intervening commit is M6 documentation. M4 read-only --check passed against retained evidence; it is not a fresh M7 qualification.

## Scope and proof defined before implementation

New active delivery is rpi5 and rpi-zero-2-w, 29 steps each, 58 required combinations. rpi4 is PRESERVED_NON_TARGET, with its 29 accepted M2 semantic steps and FFC history unchanged. Pi5 and Zero2W remain separate compiled graphs with FPC cable reuse and different mounting/accessory semantics. Pico is unsupported. This additive disposition applies to prospective M7-M12 delivery and does not alter historical semantic validity or old reports.

G-INSTRUCTIONAL-ASSEMBLY is separate from engineering G-CAD and M8 G-GEOMETRY. PASS requires 58 independently checked nonempty step closures: applicable upstream receipts, exact source/instance/operation/connection ownership, finite proper float64 rigid poses, source-supported polarity and roll, no negative scale or shear, independently recomputed feature-relative residuals and intended DOF, honest contact/penetration/clearance classification, and explicit motion capability. A stored generator success label is never proof. Missing source-supported installed direction or tutorial-critical features blocks its closure; approximate source uncertainty does not automatically block instruction and does not become an engineering tolerance. Source-supported placement approximations retain limitations and revisioned replaceable anchors. Installation sweeps remain BLOCKED unless independently bounded tests actually run. Engineering admission, physical fit and full steering travel cannot follow from this gate.

Work sequentially from printed S01 for each active variant. Solve its inseparable four-support/screw mechanism, then inspect S02 source-to-local-frame correspondence before producing board transforms. Continue closures only when source direction and required features can be supported. If a tutorial-critical ambiguity is found, preserve it and its exact remediation rather than filling an arbitrary pose; report dependent and not-yet-implemented closures honestly, and create HANDOFF_M7_REMEDIATION. No incomplete master or later milestone is released. Never call coverage of 58 report rows coverage of 58 solved assemblies.

## Commands and boundaries

All orchestration/editing uses Node or shell. Authored Python is confined to cad/twin_cad/assemblies/instructional, cad/tests/test_m7_instructional.py and installed module/test entrypoints. No ad hoc Python scripts. Frozen local authored-wheel builds and installs are explicitly authorized by this assignment. No application/native build, dependency upgrade, global install or PYTHONPATH.

Root cwd /Users/danny/Documents/Apps/PiCar:

- `node docs/implementation/evidence/m7/preflight.mjs`: read-only validation, fresh preflight JSON only; already run before branch creation.
- `node digital-twin/tools/export/m4-gate.mjs --check`: retained M4 bindings only; already run, log retained.
- `git switch -c codex/m7-instructional-assemblies`: after passing preflight; already run.
- `pdftoppm -f 1 -singlefile -scale-to 2400 -png picarx-companion/public/content/pdf/picar-x-assembly.pdf /tmp/picar-m7-source-review/page-1` and page 2: private disposable inspection; no source pixels staged.
- `node docs/implementation/evidence/m7/qualify.mjs qualification-a-01` and `qualification-b-01`: fresh mirrors, captured allowlisted inputs, isolated UV_PROJECT_ENVIRONMENT/UV_CACHE_DIR, no inherited PYTHONPATH, installed authored wheel. Labels cannot be reused. Each command/cwd/environment/exit/log/input/output is recorded.

Within each fresh mirror digital-twin cwd:

1. `/opt/homebrew/bin/uv sync --frozen --group m4 --python 3.12.14 --no-install-package twin-cad`.
2. `/opt/homebrew/bin/uv build --wheel --no-build-isolation --python <mirror>/environment/bin/python cad --out-dir <mirror>/wheel`.
3. `/opt/homebrew/bin/uv pip install --python <mirror>/environment/bin/python --no-deps <exact-wheel>`.
4. Installed `python -m twin_cad environment`; require frozen versions, retain wheel hash/bytes.
5. Installed `python -m twin_cad.assemblies.instructional.generate --root <mirror> --output <mirror>/solutions`.
6. Installed `python -m twin_cad.assemblies.instructional.verify --root <mirror> --solutions <mirror>/solutions --output <mirror>/observations.json`.
7. Installed `python -m pytest cad/tests/test_m7_instructional.py cad/tests/test_toolchain.py -q --junitxml=<mirror>/tests.xml`, using PICAR_M7_ROOT/PICAR_M7_SOLUTIONS for captured inputs/outputs.
8. Node M7 policy and existing M5/M6 receipt/firewall/M2 contract tests in disposable mirrors. Original-lock G-DATA/G-GRAPH --check restores prior M1 pyproject/uv locks ONLY in mirror after frozen Python qualification. Historical M5/M6 closure writers are never invoked.

Compare both raw wheel, solution and observation bytes; retain all differences before applying any established M4 normalization. Output claims are limited to artifacts actually generated/checked. No runtime/glTF/GLB pack is authored.

## Git, preservation and closure

Candidate local acceptance subject, only if the separate instructional gate passes: `M7: implement instructional assemblies for active V40 variants`. Stage only exact new M7 paths listed in the candidate manifest, with `git add -- <named paths>`; never add -A. Use existing identity, no authorship trailers, no remote action. BLOCKED means no M7 acceptance commit or acceptance SHA. If PASS, record implementation SHA separately in a later documentation receipt and read actual M8-M12 authorities for a handoff only.

Every preflight tracked file and diagnostic must retain exact bytes. All private originals remain ignored/untracked and hashes checked, with no pixels, source-vault, environment/cache/wheel/temp mirror in Git. Additive rollback removes only the named new M7 namespace and documentation/evidence after checking later edits. No reset/clean/history rewrite. Stop after M7.

Historical first-stop qualification commands (retained, superseded as current-input proof): `node docs/implementation/evidence/m7/qualify.mjs qualification-a-04` and `qualification-b-04`. Earlier a-01/a-02/a-03 attempts remain failed investigations and are not counted. `node docs/implementation/evidence/m7/close.mjs` assembles the BLOCKED report from the actual independently checked witnesses and confirms exact preservation; it cannot issue M7 acceptance. The demonstrated S02 Pi5 chirality contradiction stops new installation-pose authoring at the current source boundary. No acceptance commit is permitted by this result.

## Current continuation 01

The owner continuation request authorized resolving source/proxy correspondence without restarting M7. Exact original 97 M7 files are retained under evidence/m7/continuation-01/prior-blocked-01. The previous far-edge robot-left interpretation was wrong; current source review -02 uses Pi5 GPIO robot RIGHT, rear USB/Ethernet and top-up, with proper Rz(180). A separate Pi5 Ethernet/USB order defect is corrected by an additive instructional artifact revision 2, preserving the original M5 artifact/receipt and all engineering blockers. Zero2W has its distinct identity board rotation and corrected S01 short-left/tall-right support allocations. Pi5 S01 numeric placement is unchanged; current -02 records bind revised source/module bytes.

The exact current command/source/output boundaries were declared before wheel builds in evidence/m7/continuation-01/EXECUTION_BOUNDARY.md. Final-input clean qualifications use new labels qualification-a-08 and qualification-b-08, installed authored wheels, independent actual STEP/proxy checks and unchanged upstream guards. a05 failure and a06 discovery qualification remain retained. The original chirality probe now exists only as a historical rejected-source-premise witness.

Current work emits two static S01 assemblies and two PARTIAL S02 board candidates. All unclosed S02 upper-support/USB engagement instances remain explicit null poses. S03 latch/contact/stiffener endpoint frames and S04 HAT mount/underside GPIO geometry require source-backed instructional adoption before closure; no hidden features or unsupported contact poses may be invented. G-INSTRUCTIONAL-ASSEMBLY remains BLOCKED until all 58 complete step/variant closures pass. The gate is not weakened to count these observations as complete steps. The original acceptance subject, named staging, privacy and STOP-after-M7 rules remain in effect. No commit/acceptance SHA while BLOCKED.

Final test self-review strengthened coherent altered-transform corruption cases. The unchanged fifteen-command pipeline reran with final labels a08/b08; continuation-02/EXECUTION_BOUNDARY.md and new closure witnesses bind this change. Earlier a07/b07 documents and runs remain preserved.

## Current continuation03 boundary and closure

Current source03 installed anchor supersedes historical -02 installed presentation only; original M6 part-local geometry/feature names remain preserved. Current a14/b14 each pass508tests/21commands/21rawoutputs and identical authored wheel. Upper supports and scoped Zero-header/HAT feature representations are independently observed; camera/USB insertion frames, actual HAT seating and sweeps/fullmasters remain unqualified. G-INSTRUCTIONAL-ASSEMBLY still BLOCKED0/58complete; G-CAD BLOCKED/M8NO. See continuation03/EXECUTION_BOUNDARY.md for exact bounded commands, preflight snapshots and failures. Future inputs need newunusedlabels. No commit/acceptance staging.
