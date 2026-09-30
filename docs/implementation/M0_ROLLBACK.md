# M0 recovery and rollback

Run commands from `picarx-companion/`. Stop dev, preview, build and content generation processes first. Do not break a lease by age or kill an unidentified process.

```sh
pnpm content:recover
pnpm content:recover --apply
pnpm package:check
```

The first command is a dry run. The second clears only leases whose owning PIDs are demonstrably absent, acquires the writer lease and resolves a pending journal. Live/PID-reused or unknown owners fail closed. A stale `lease-guard` has no proven owner: preserve it and inspect the processes and retained evidence manually; the command deliberately does not remove it.

Before the committed marker, recovery verifies every retained backup before restoring all seven roots. After that marker it verifies the complete new generation. Interrupted recovery may be rerun. Missing/corrupt rollback material is a hard stop: preserve `.content-publication/`, the journal and all generations; do not regenerate or delete them to hide the failure. Restore verified material from an owner-controlled backup before retrying. Generations have no automatic cleanup.

Code rollback is separate from transaction recovery. The recorded starting HEAD is `9e54b2fb3199c22f5d5c7cd67c8e4531ab2246f8`. Review/save the working diff and consult `evidence/m0/changed-paths.json` before reversing anything. The six originally tracked files changed by M0 can be restored by name (this discards their M0 edits):

```sh
git restore --source=9e54b2fb3199c22f5d5c7cd67c8e4531ab2246f8 -- .gitignore README.md picarx-companion/package.json picarx-companion/pnpm-lock.yaml picarx-companion/tools/content-pipeline/build.ts picarx-companion/vite.config.ts
```

Save/remove only the explicitly listed M0 additions after reviewing them. Never use broad `git clean`, a hard reset, `git add -A`, or history rewriting. Keep the private archive/evidence and its ignore protection. The original source checkout and photographs must remain untouched. Returning old build scripts restores their old packaging limitation; use the M0 safe packaging path for releases.

There is no user-state migration to reverse. Do not clear `picarx.v1` or reinterpret `steps.assembly`. FreeCAD and the two global MCP registrations are developer-environment changes outside Git: see the setup document for stopping the bridges and removing only their named registrations. Preserve unrelated client settings and the pre-existing FreeCAD application.
