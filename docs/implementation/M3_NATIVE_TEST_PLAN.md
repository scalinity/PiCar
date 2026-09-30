# M3 isolated native qualification plan

Status: BLOCKED pending separate owner build/session authorization. No native build or native session has run for M3.

Read-only preflight verified the existing lock and cargo metadata. Accepted native versions remain Tauri 2.11.5, tauri-build 2.6.3, opener 2.5.4. There is no rusqlite, tauri-plugin-wdio or tauri-plugin-wdio-webdriver in the accepted app lock. The official embedded provider requires both plugins for the requested macOS automation and the execute/logging API. Official source checked: https://webdriver.io/docs/desktop-testing/tauri/plugin-setup/ . Compatibility is unproved until executed, regardless of a successful lock resolution.

Implementation will pin compatible SQLite and hashing dependencies without upgrading the existing Tauri stack. WDIO plugins and permissions, when qualified, belong exclusively to an explicit test feature/configuration; no test bridge may be enabled by the normal application or shipping configuration. Preserve the app identifier, window defaults and opener.

Requested execution authorization is limited to:

- Existing `pnpm typecheck` (two tsc --noEmit checks; emits no app artifacts).
- `cargo test --locked` against the M3 repository/fault fixtures, with CARGO_TARGET_DIR and every database/backup in a disposable temporary directory.
- One isolated Tauri test build and embedded WDIO session, with a test-only feature/configuration and app-data override to a disposable directory; use the coordinated localhost:1420 development server. No shipping/release build and no real owner database.
- Repair/repeat only affected failed tests within this same isolated scope.

Before execution, inspect the final exact argv, resolved versions, test capability configuration, and isolation implementation. The app must fail startup if the explicit test data directory is absent during the native test feature. Normal builds cannot include the WDIO registration/capabilities or frontend test bootstrap. Native database tests exercise actual rusqlite/bundled SQLite, committed WAL backups, independent restore and the same fixtures as real IndexedDB. Native UI tests exercise narrow IPC, restart/resume and the reference-first flow. No robot action, external write, camera permission, arbitrary filesystem frontend endpoint or public evidence publication is authorized by this plan.

A manual checklist may report only partial progress. Without actual successful adapter/native execution M3 acceptance remains BLOCKED, no local acceptance commit is permitted, and the remediation handoff remains M3 rather than authorization for M4.

## Remediation execution receipt

The pending-authorization status above is the original blocked plan, preserved as history. Owner authorization 3 subsequently approved this scope. Actual Rust/SQLite compilation/execution and the official WDIO embedded offline session now PASS; see M3_REPORT.md and M3_GATE_REPORT.json. The final test path pins both plugins 1.4.0 behind m3-native-test, requires incognito plus a new canonical OS-temp directory, and uses the normal CSP. The initial shared-webview isolation incident is retained in the final report. No normal/default bridge ships.
