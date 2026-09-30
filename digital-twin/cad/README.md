# M4 synthetic mechanical toolchain

The installed `twin_cad` package owns CAD generation and independent verification. These are authored product/package sources and pytest tests, not ad hoc Python task scripts. Node helpers under `tools/export/` own fixture authoring, clean mirrors, command receipts and adoption verification. No `PYTHONPATH` is required.

Use the optional root `m4` dependency group with Python **3.12.14**, CadQuery **2.8.0**, OCP distribution **7.9.3.1.1** (actual OCP runtime string **7.9.3.1**), and the complete `uv.lock`. The default M1 environment remains rfc8785 **0.1.4**; its original project/lock bytes are retained under `validation/m4/prior-m1/` and in Git. Existing `.venv` is never synchronized by qualification.

From the repository root, the separately owner-authorized repeatable qualification is:

```sh
node digital-twin/tools/export/m4-qualify.mjs qualification-new-name
node digital-twin/tools/export/m4-revalidate.mjs qualification-new-name revalidation-new-name
node digital-twin/tools/export/m4-gate.mjs --check
```

Each qualification creates two NEW OS-temp source mirrors, environments and dependency caches. It installs the frozen group excluding the local package, builds the package wheel with the locked backend without build isolation, and installs the exact wheel without resolving dependencies. The command ledger records the expanded commands, cwd, environment, exits and raw output bindings. Reusing a run/attempt ID fails to preserve diagnostics. Revalidation restores the CURRENT locks in a mirror and uses separate Python 3.14.7 default-M1 and Python 3.12.14 M4 environments. It never reads owner sessions or copies private evidence. Historical old-lock checks run separately and are not presented as current-new-lock coverage.

The CLI supports `build`, `verify`, `lint`, and `environment`. A fixture build requires an explicit fixture and NEW empty output directory. Example inside an isolated, installed environment:

```sh
python -m twin_cad build --fixture validation/fixtures/m4/TEST-M4.json --output /tmp/new-m4-test-output
python -m twin_cad verify --fixture validation/fixtures/m4/TEST-M4.json --output /tmp/new-m4-test-output
pytest cad/tests validation/tests_python
```

Exit policy is 0 PASS, 1 validation failure, 2 BLOCKED, 3 tool/environment failure. Production `build --variant rpi4 --profile nominal` and `verify --variant rpi4` produce blocker JSON with zero solids. `lint --allow-unresolved` may return 0 with that same nonempty blocker report; it cannot release geometry. Production declarations are references to current unresolved records, not replacement canonical definitions or admitted CAD. Exact production Plate A datum selection remains M6/Q-03.

Synthetic datum is the authored intersection of x=0/y=0/z=0 planes. CAD is RH mm, +X forward/+Y left/+Z up, normalized XYZW rotations and float64 calculations. Mesh packets retain local CAD coordinates; runtime poses apply exactly the specified cyclic basis rotation and 0.001 scale. Tests include 100 mm axis markers, reflection/shear/scale rejection and double conversion. The fixed mount and closed loop have physical DOF 0; the revolute has physical DOF 1 and a sampled roll reference of 0.37 rad, explicitly a coordinate gauge rather than a weld.

The independent validator reads actual BRep bytes with OpenCascade validity checks, checks authored dimensions, directed axes and full trimmed surfaces, independently recomputes poses/residuals/rank and propagates connected analytic frame relations to prove reference-sample uniqueness. It does not call generator/solver functions or trust their success flags. Planar mesh coverage uses exact rational projected triangle containment, disjoint interiors, trimmed-area equality and oriented closed topology including every protected hole wall. A barycentric displacement bound covers both CAD→mesh and mesh→CAD surfaces. This finite method covers the specified planar TEST profile only; nonplanar/unbounded proof is BLOCKED. No swept-motion or physical-fit claim is made. Numerical budgets are 0.02/0.10 mm surface and 0.01 mm/0.0001 rad transformed interfaces. Synthetic exact dimensions are not manufacturing measurements or zero source uncertainty for the kit.

Computed normalized JSON uses RFC 8785, stable IDs/order and 1e-10 rounding; input fixture hashing uses exact unrounded JCS. STEP timestamps are retained as original raw evidence, so STEP raw bytes differ between rebuilds. BRep, normalized JSON and wheel bytes agree; independently measured analytic/interface fingerprints agree. Reports bind upstream inputs and exact outputs without self-reference, pack hashes or writing outputs back into production model inputs.

Official references: [CadQuery release](https://github.com/CadQuery/cadquery/releases/tag/v2.8.0), [OCP release](https://github.com/CadQuery/OCP/releases/tag/7.9.3.1.1), [CadQuery class API](https://cadquery.readthedocs.io/en/stable/classreference.html), [installation compatibility caveat](https://cadquery.readthedocs.io/en/stable/installation.html), [OpenCascade validity API](https://dev.opencascade.org/doc/refman/html/class_b_rep_check___analyzer.html). Registry evidence with compatible Python 3.12 arm64 wheel hash/length is retained in the M4 evidence receipt.

CadQuery and OCP wrapper distribution metadata identify Apache 2.0; OpenCascade has separate kernel licensing terms. Installed third-party distributions and compiled wheels are not checked in or redistributed here. Any future binary distribution must preserve its applicable notices and satisfy Q-17; M4 does not waive rights to vendor CAD, private evidence or existing SunFounder content. All fixture geometry and solver/oracle code is newly authored for this project.

Rollback retains old locks/fixtures and M3 sessions, keys and backups. Review and revert the named M4 commit additively if needed; never clean/reset owner or ignored data. Existing M0 FreeCAD/Codex/CUA diagnostics remain historical and unqualified; this CLI qualification does not assert those external bridges were repaired.
