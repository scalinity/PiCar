# M0 CAD tooling receipt

Verification date: 2026-09-29. `CAD_TOOLING_BOOTSTRAP = BLOCKED`. This receipt is separate from mandatory gates A–G and does not determine `m1Allowed`.

| Required receipt field | Status | Evidence |
|---|---|---|
| FREECAD | PASS | Official 1.1.4 arm64 installer hash matches; separately installed `/Applications/FreeCAD-1.1.4-M0.app`; deep/strict signature exit 0; live version query |
| ROBUST_MCP | PASS | `0.6.3.dev16+gbde407cf7`, commit `bde407cf72f52c395e895b8e09f5625c1cec321f`; 152-tool stdio inventory; live XML-RPC control |
| INSPECTION_MCP | PASS | `0.1.0`, commit `67771e69fbe5e68df9fbda7fb48e73dde0fb1993`; 9-tool inventory; graph/object/topology/recompute/script/screenshot calls |
| CLAUDE_CODE_ROBUST | PASS | Claude Code 2.1.285 actually called connection and version tools through its configured registration |
| CLAUDE_CODE_INSPECT | PASS | Same Claude Code run actually called inspection `list_documents` |
| CODEX_ROBUST | BLOCKED | Default model rejected; one catalog-model run attempted read-only calls but runtime approval policy denied them; independent protocol test succeeded |
| CODEX_INSPECT | BLOCKED | Same client blocker; actual Codex tool execution is not claimed |
| SYNTHETIC_STEP_EXPORT | PASS | Arbitrary TEST plate exported and reopened as valid STEP; analytic volume and 50×30×3 bounds matched |
| COMPUTER_USE_SMOKE_TEST | BLOCKED | Native app selection returned server `-10005: timeoutReached`, including official app path |

FreeCAD Python: 3.11.14; OpenCascade: 7.8.1; bridge venv Python: 3.11.16; MCP library: 1.30.0; uv: 0.12.15. Installer SHA-256: `071343b4abb70492b75c973f41eaf1d2528f9b9c7ea018d22a4f46ae14d27ac0`. Download: [official FreeCAD 1.1.4 release](https://github.com/FreeCAD/FreeCAD/releases/tag/1.1.4). The prior app remains unchanged; its signature verification failed, so the official copy was installed alongside it.

Both servers coexist in the same owned FreeCAD process: Robust XML-RPC 127.0.0.1:9875, inspection 127.0.0.1:9876, Robust secondary socket 127.0.0.1/[::1]:9878. Endpoints were verified with `lsof`. No third-party source changes, embedded macOS mode, PiCar CAD or hardware commands were used. Global client settings gained only the two named MCP registrations; unrelated settings/default models were preserved.

The synthetic feature has one valid closed solid, ten faces and four cylindrical faces; volume is 4349.20355262769. Independent analytic volume is 4349.2035526276895, and STEP roundtrip matches. Screenshots show the four holes. Inspection initially failed on a Compound with `CenterOfMass`; this upstream limitation is retained in evidence. Selecting the fixture's existing sole Solid made subsequent inspection succeed. No sketch was used, so sketch constraints/DOF were not applicable and are not claimed tested.

Exact external installation/verification operations included `git clone` of the two named source repositories; `uv venv --python 3.11`; editable `uv pip install --python <venv>/bin/python -e <robust> -e <inspect>`; `uv pip freeze`; official installer download/hash comparison; read-only DMG mount; `ditto` to the separate app; `codesign --verify --deep --strict`; both clients' `mcp add`/`mcp get`; stdio initialize/tools-list/calls; and actual read-only CLI client verification. Successful operations returned 0; original app signature and first Codex client run returned 1. Computer Use returned a server error, not a successful action. A subsequent exact `codex exec --json --skip-git-repo-check --model gpt-5.5` run used a bounded read-only prompt: process exit 0, but all three requested MCP calls failed with `MCP tool call requires approval, but approval policy is never`. The user default/configuration was not changed, and runtime approval protection was not bypassed.

Sanitized evidence: [synthetic assertions](evidence/m0/cad-synthetic.json), [tooling artifact hashes](evidence/m0/cad-artifacts.json), [actual Claude calls](evidence/m0/cad-claude-client.json), [client blockers](evidence/m0/cad-client-blockers.json), [inspection topology](evidence/m0/cad-inspect-analyze_shape.json), and retained Compound failure artifacts alongside them. Raw model/session/environment logs and screenshots stay outside the repository; only safe result fields and external artifact hashes are retained here.

Future prerequisites: permit the specifically authorized read-only MCP calls in the Codex runtime, or refresh a capable desktop MCP client and actually call both registrations; resolve the Computer Use native-app timeout and perform a bounded observable GUI interaction. Keep these explicit prerequisites for the later CAD-toolchain milestone. [Portable setup, stop/restart and update instructions](../tooling/FREECAD_AGENT_SETUP.md).
