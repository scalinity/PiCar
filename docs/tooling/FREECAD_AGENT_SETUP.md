# FreeCAD agent tooling for M0

This is developer tooling, outside the companion's dependencies and resources. Only an arbitrary `TEST_M0_Plate` was created. It supplies no PiCar dimensions, component evidence or engineering admission. Preferred modeling order is deterministic CadQuery/Python, semantic MCP inspection/control, then Computer Use for GUI checks. No CadQuery integration or PiCar modeling was added in M0.

The official Apple Silicon [FreeCAD 1.1.4 release](https://github.com/FreeCAD/FreeCAD/releases/tag/1.1.4) was current at verification. The downloaded `FreeCAD_1.1.4-macOS-arm64-py311.dmg` matched its official SHA-256, `071343b4abb70492b75c973f41eaf1d2528f9b9c7ea018d22a4f46ae14d27ac0`. The verified copy is `/Applications/FreeCAD-1.1.4-M0.app`; its deep/strict code signature passed. The existing `/Applications/FreeCAD.app` was preserved after its signature check failed. FreeCAD exposes Python 3.11.14 and OpenCascade 7.8.1.

Sources are installed beneath `$HOME/.local/share/picar-cad-tooling/`, separately from the repository:

| Role | Source | Exact installed pin/version |
|---|---|---|
| Broad control | [spkane/freecad-addon-robust-mcp-server](https://github.com/spkane/freecad-addon-robust-mcp-server) | `bde407cf72f52c395e895b8e09f5625c1cec321f`, `0.6.3.dev16+gbde407cf7` |
| Deep inspection | [theosib/FreeCAD-MCP-Server](https://github.com/theosib/FreeCAD-MCP-Server) | `67771e69fbe5e68df9fbda7fb48e73dde0fb1993`, `0.1.0` |

A `uv` virtual environment uses Python 3.11.16 and MCP 1.30.0. Editable installs point to those pinned checkouts; `requirements.lock.txt` records installed packages. Upstream MIT and LGPL-2.1-or-later notices remain in their respective source trees. No third-party server source was patched.

Two small `InitGui.py` loaders in `$HOME/Library/Application Support/FreeCAD/v1-1/Mod/{RobustMCPBridge,FreeCADMCPAgent}/` load the pinned add-ons. They are machine-local setup, not application resources. Startup is explicit:

```sh
/Applications/FreeCAD-1.1.4-M0.app/Contents/MacOS/FreeCAD "$HOME/.local/share/picar-cad-tooling/start-bridges.FCMacro"
```

The macro starts both bridges after Qt initialization. Robust uses supported live GUI XML-RPC on loopback port 9875, with its secondary JSON socket moved through supported settings to 9878. Inspection uses loopback TCP 9876. Robust embedded mode is not used on macOS. The inspection server's port is currently fixed in its backend, so moving Robust's secondary endpoint avoids the collision. `XMLRPCPort` and `SocketPort` preferences record 9875/9878. Only one bridge-owning GUI instance should run at a time.

Both client registrations are named `freecad-robust` and `freecad-inspect`. Installation used each installed CLI's supported `mcp add` command (confirmed with help), preserving unrelated settings. Claude Code registrations are user-scoped in `$HOME/.claude.json`; Codex registrations are in `$HOME/.codex/config.toml`, with no alternate profile. Equivalent portable commands are:

```sh
codex mcp add freecad-robust --env FREECAD_MODE=xmlrpc --env FREECAD_SOCKET_HOST=localhost --env FREECAD_XMLRPC_PORT=9875 --env FREECAD_SOCKET_PORT=9878 -- "$HOME/.local/share/picar-cad-tooling/venv/bin/freecad-mcp"
codex mcp add freecad-inspect --env FREECAD_MCP_HOST=127.0.0.1 --env FREECAD_MCP_PORT=9876 -- "$HOME/.local/share/picar-cad-tooling/venv/bin/freecad-mcp-agent"
claude mcp add --scope user --transport stdio freecad-robust --env FREECAD_MODE=xmlrpc --env FREECAD_SOCKET_HOST=localhost --env FREECAD_XMLRPC_PORT=9875 --env FREECAD_SOCKET_PORT=9878 -- "$HOME/.local/share/picar-cad-tooling/venv/bin/freecad-mcp"
claude mcp add --scope user --transport stdio freecad-inspect --env FREECAD_MCP_HOST=127.0.0.1 --env FREECAD_MCP_PORT=9876 -- "$HOME/.local/share/picar-cad-tooling/venv/bin/freecad-mcp-agent"
```

Do not blindly re-add existing entries. Inspect with `codex mcp get <name>` and `claude mcp get <name>`; restart/refresh the client to load registrations. With the GUI bridges running, `mcp-smoke.mjs` initializes each stdio server, lists tools and calls the supplied JSON requests:

```sh
node "$HOME/.local/share/picar-cad-tooling/mcp-smoke.mjs" robust "$HOME/.local/share/picar-cad-tooling/status-robust.json"
node "$HOME/.local/share/picar-cad-tooling/mcp-smoke.mjs" inspect "$HOME/.local/share/picar-cad-tooling/status-inspect.json"
```

Actual inventory: 152 Robust tools and 9 inspection tools. Connection/version queries, document graph, object inspection, topology/bounds, tracked recompute, script execution and screenshot returned successfully. Sketch/DOF diagnostics were not exercised because the synthetic fixture has no sketch. An inspection bug with `Part.Compound.CenterOfMass` was reproduced and retained as a limitation; selecting the existing sole Solid in the synthetic fixture permitted successful inspection without patching upstream.

The disposable 50×30×3 plate has four radius-2 through-holes at arbitrary TEST positions. Robust Python created it, exported STEP and reopened it; independent analytic volume and bounds assertions passed. Inspection confirmed one valid closed solid, ten faces and four cylindrical faces. A screenshot was captured and visually inspected. These arbitrary fixture dimensions are unrelated to PiCar.

Claude Code actually called both configured MCPs successfully. Codex CLI 0.157.1 initially failed before tools with: `The 'gpt-6.1-sol' model is not supported when using Codex with a ChatGPT account.` A single `codex exec --json --skip-git-repo-check --model gpt-5.5` verification run selected a listed local-catalog model without changing the default. It attempted the three read-only MCP calls, but each failed with `MCP tool call requires approval, but approval policy is never`. The process returned 0 with a truthful blocked result; no MCP result succeeded. Actual Codex verification remains BLOCKED until the runtime permits the specifically authorized read-only calls or a refreshed desktop client can make them. Computer Use app selection, including the official app path, returned `-10005: timeoutReached`; no GUI interaction is claimed. These blocks do not affect M0 A–G but remain prerequisites for the later CAD tooling milestone.

To stop: close/save only owned TEST documents, stop the bridge-owning FreeCAD GUI normally, and verify loopback listeners are absent. Do not kill unidentified FreeCAD processes. Restart the explicit macro before the clients. To remove registrations, inspect `codex mcp remove --help` and `claude mcp remove --help`, then remove only these two names. To disable add-ons, preserve the loader files outside the `Mod` directory and remove only their named loaders. Keep unrelated user preferences and the original FreeCAD app.

To update: choose an official compatible release, verify installer hash/signature, retain the working install, pin both upstream revisions explicitly, rebuild the external venv lock and repeat protocol, coexistence, synthetic STEP, actual-client and GUI tests. Do not treat installing newer packages as proof. The [tooling receipt](../implementation/M0_CAD_TOOLING_RECEIPT.md) binds sanitized evidence; raw client/environment logs remain machine-local because they can contain account/session metadata.
