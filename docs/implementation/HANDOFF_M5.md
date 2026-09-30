# M5 next-session handoff — purchased components only

This is a handoff prompt, not M5 implementation or owner authorization to execute M5. M4 is closed with exact G-TOOLCHAIN PASS and a local acceptance commit. The current agent stops after this documentation receipt. Begin M5 only when the owner instructs you to do so; obtain its separately bounded execution authorization where AGENTS.md requires it. M4's approval does not authorize M5 builds, source publication, hardware or owner-data tests.

You are the implementation agent for **M5 ONLY** of scalinity/PiCar at `/Users/danny/Documents/Apps/PiCar`: identified purchased-part geometry and electronics interfaces. Read the actual authorities below and complete only their scoped M5 work. Do not implement M6–M14, custom structural plates, real assembly solving, runtime geometry admission, GLB packs, frontend/3D, GPU/performance qualification or hardware actions. UNKNOWN != APPROXIMATE.

## Accepted checkpoints and fresh preflight

| Checkpoint | Accepted implementation SHA |
| --- | --- |
| M0 baseline | `2a934710501d71aecbd8da827925c92e49378661` |
| M1 | `22c85058f9420aaaaf376c5e312915f5b7b5288d` |
| M2 | `8d8d30d0c7b077504916a26d80c211e2fc52c4e2` |
| M3 | `baddbfe6953237d436cbedb963c6ea88d2960f05` |
| M4 | `4655e60ccb170cd7cadd5545f1aa4303e74145b7` |

M3 tree is `85d298b7ae906ad3bed5a7752a126279861c9e35`, subject `M3: add durable assembly sessions and reference-first integration`. Its documentation-only descendant `62225d41c57a2a41b51b19165ecf38e8f99f070d` recorded M3 acceptance and M4 kickoff; it is not another implementation acceptance.

M4 tree is `e5d0f404bf195c2570e7a6f009ec989e7aac56dc`, subject `M4: qualify reproducible synthetic mechanical toolchain`. It has 101 explicitly staged files. `M4_ACCEPTANCE_RECEIPT.json` and this handoff belong to a subsequent documentation-only commit; inspect actual HEAD and classify every descendant instead of using receipt HEAD as a new implementation checkpoint. Handoff branch is `codex/m4-mechanical-toolchain`. Use an inspected local `codex/m5-*` branch for authorized M5 work without discarding the current worktree. No remote action.

Read `docs/implementation/{M0_REPORT.md,M0_CHECKPOINT_VERIFICATION.json,M1_REPORT.md,M1_G_DATA_REPORT.json,M2_REPORT.md,M2_G_GRAPH_REPORT.json,M3_REPORT.md,M3_GATE_REPORT.json,M3_ACCEPTANCE_RECEIPT.json,M4_REPORT.md,M4_GATE_REPORT.json,M4_ACCEPTANCE_RECEIPT.json,M4_EXECUTION_PLAN.md}` and `digital-twin/validation/m2/adopted-g-data.json`. Resolve source/spec/evidence receipts at their actual paths. Record branch, HEAD, status, staged/untracked names, diff/stat/check, Git identity and ancestry. Verify accepted subjects/trees, raw SHA256/length and retained Git objects for consumed inputs.

M4 report raw binding is **29,092 bytes**, SHA256 `81a79c74395fe08a5d176f0bbae1e172964597ebd84f43207fa9b717787d4aea`. It binds **37 source / 74 evidence** files and excludes its own bytes. The downstream acceptance receipt binds it without a self-reference cycle. Run read-only `node digital-twin/tools/export/m4-gate.mjs --check` and inspect `m4-adoption.mjs` and its receipts. M4 explicitly adopts only the two root Python lock/input changes, on top of seven previously accepted M2 deltas. All other applicable prior bindings remain unchanged. Do not rewrite old reports to conceal drift.

M4 preflight receipts are `docs/implementation/evidence/m4/{preflight.json,source-preservation.json}`. They verified 124 M1, 232 M2, 135 adopted G-DATA and 71+173 M3 bindings; all seven M2 deltas and retained M1 objects; 388 original M0 Git objects, 118 original spec allocations and ten private-original/archive hash bindings. Freshly verify applicable consumed inputs rather than treating counts as proof by themselves.

Direct old M1/M2 gate checks detect current Python lock drift by design. M4 ran original-lock read-only upstream/graph checks in an isolated mirror and separately revalidated the adopted locks. Do not blindly invoke accepted artifact writers in the live tree. If revalidation requires writing, use a protected safe mirror, retain original bytes and explicitly classify any new adoption. M4's original M1 inputs remain verbatim in `digital-twin/validation/m4/prior-m1/` and Git.

The **12 original untracked M2 diagnostics** must remain untracked and unchanged. Their exact raw/length receipt is `docs/implementation/evidence/m2/remediation-recheck/diagnostic-preservation.json`; its three other original report/handoff entries have retained `original-blocked/` archives. Preserve ignored originals, raw backups, caches used by the owner, legacy keys and session stores. Never reset/clean these paths. `git ls-files digital-twin/evidence/private` must remain empty.

## Production identities remain unchanged

| Identity | Value |
| --- | --- |
| schemaHash | `046808956ce49b8cbe8f1e0e2a8c4f63b250a67f2011e969990fb9a0ef6826e1` |
| evidenceHash | `e00e7825f413a37edeb3c9ac47611fbf790480d6efb71337b5cd219bfd082d5c` |
| modelHash | `01c29e99b8d6fa04689e4316628296bf3a3da422184e3563bf99f5bdce543bd2` |
| sourceLockRawSha256 | `3f715ec18946e022a1b5633a15e3b3ae3d31576e1fa378d77c375d61c291b06e` |
| semanticValidatorRawSha256 | `980749983845369e24d77b7aad22774012ac480f2668319ab0ddb3c8589b931b` |
| hashPolicyRawSha256 | `a799b9b5161c1cee501a7667ac56e8ca4466172b876fb832e9b3ae1be3649c62` |
| compilerRawSha256 | `e09f7a90f5618ca24bfe16436e4b69ac418f0a2f4dde9e5f452f09c1d2248ed0` |
| reducerRawSha256 | `48a2cc4e5919cbb784c6a7fed314ba6b1829c16337b7398dc99ffffb382dee4d` |
| registryRawSha256 | `231b5df34360f923428db992afa2595185c610f0862353c715955e8fbdd05214` |
| M2 G-GRAPH report raw | `708de7bda8e3dd5d9bf53c3d1775846dec59784725064ef96f5082fefd9ab38e` |
| Adopted G-DATA report raw | `e884e72364851b91f67921359cdc9b7ad610df8472a62f689fda874d2fbf7485` |
| Original M1 report raw | `ddbdad1c00372e670b674bbc6d6bf2170b6f2b0d08a034b715e522029b644f0f` |
| rpi4 graphHash | `ce9dd71eb9728f1538e2fb311f99450cdafc0df96c91033cf0333e6bec51eac7` |
| rpi5 graphHash | `97de264d98dcd9d525b26cac7f211279f446a59352bc822a1d3a68ca267d2665` |
| rpi-zero-2-w graphHash | `65d5c89cf2dc2cec53424ac1e689772aee0c788086b6f01eea7efb3576c213c2` |

Each selected graph has 29 steps, operation counts 189/189/186; exact artifact paths, lengths and bindings are in M2_G_GRAPH_REPORT under `digital-twin/validation/m2/<variant>/`. Preserve payload IDs, non-null parentAssignments, integral-owner and S27 rear-drive semantics. Semantic location extension PX-V40-CONTRACT-LOCATION-01 is `docs/digital-twin/SEMANTIC_LOCATION_REVISION.md`, raw `9906beba00637ca051f43b05c38112e6a9dbded51ec575cdb14cd51d459bfd3a`. Never rebind old model/schema identities to newly acquired sources. New component evidence needs audited revisions and affected dependency adoption.

## What M4 actually qualifies

Locked `digital-twin/{pyproject.toml,uv.lock,toolchain.lock.json}` and installable `cad/` package qualify macOS 27.0/26A428 arm64, Python 3.12.14, uv 0.12.15, CadQuery 2.8.0, cadquery-ocp 7.9.3.1.1 (module string 7.9.3.1), NumPy 2.4.4, SciPy 1.17.1, pytest 9.1.1, hatchling 1.32.4 and rfc8785 0.1.4. The 56-package lock and version/raw bindings are authoritative; use their actual bytes. Node 26.8.2 and existing app dependencies were not upgraded. Default M1 remains a virtual rfc8785 package with Python >=3.12,<3.15; original Py3.14.7 vectors remain supported. No ad hoc PYTHONPATH or global installation.

toolchainHash = `be4c1f8158fe16865c7f68c821ae3d87e846c7855cac058bee4902996c806add`.
fixtureInputHash = `751da9364ff40286b06155c5f818d1148b92e29d7676b5a6873e5441dad84890`.

The three TEST-only asymmetric planar prisms have off-center rectangular through-holes, explicit synthetic datums and fixed/revolute/closed-loop constraints. Expected physical ranks/DOF are 6/0, 5/1 and 12/0. Revolute reference roll is a sampled gauge, not a welded physical constraint. Independent validators open actual BRep bytes, check solid/topological features and separately recompute residuals, rank, connected uniqueness and loop closure. They do not call solver costs or merely compare exporter metadata.

The source-to-mesh oracle proves complete bidirectional coverage **only for its named planar synthetic profile**, including hole walls, via rational trimmed-domain coverage and a barycentric displacement bound. Its zero-mm synthetic result is not a real source/manufacturing measurement. General curved/vendor geometry needs an applicable independent proof; unsupported or unbounded proof is BLOCKED. Do not generalize M4's planar proof into vendor surface certification.

CAD coordinates: right-handed mm, +X forward/+Y left/+Z up. Runtime point/translation conversion is 0.001R with rows [0,1,0], [0,0,1], [1,0,0]; pose rotation RQR^-1; normalized XYZW quaternions and float64 canonical computation. No reflection, shear, arbitrary recentering or double conversion. Freeze every new source datum, directed-axis polarity and roll from applicable evidence. M6 owns the exact production Plate A datum; M4's synthetic datum does not resolve it. Grouping/hierarchy cannot replace constraints.

Apply the authority's budgets in their correct scopes: intended analytic CAD interfaces and fixed-mate translation **0.001 mm**, fixed-mate angle **0.00001 rad** (GEOMETRY_AND_EVIDENCE_SPEC); runtime protected/critical surfaces **0.02 mm**, context **0.10 mm**, transformed interfaces **0.01 mm/0.0001 rad** (ASSET_PIPELINE_SPEC). Keep source uncertainty separate. M4 actual fixture residuals/uniqueness guards are below 1e-8; its coarse transformed-interface guard is not a blanket replacement for tighter engineering checks.

Two fresh independent OS-temp mirrors, environments and dependency caches built and installed the actual authored wheel, executed CLI build/verify and passed **54/54 unique tests each**, no skips/errors/failures. Identical wheel: 17,656 bytes, raw `71e3b44c9668787dfc6f40e859aee3b091a33baa09e194f6d67fddad91659981`. Normalized outputs and BRep bytes match; raw STEP differs only in FILE_NAME timestamp, with all remaining bytes checked equal. Results/command/cwd/env/exits are in `docs/implementation/evidence/m4/qualification-final-01/`. Those committed TEST outputs are synthetic qualification evidence, never production/runtime assets.

Affected checks: 30/30 M1 hash tests; 12/12 read-only M2 contracts; actual 7 accepted/16 rejected JCS vectors on Python3.12.14 and3.14.7 plus JS. The unchanged accepted Rust witness was compared, not newly executed. Final adopted-lock checks are `revalidation-final-02/`. M3 checks are inherited through unchanged byte bindings, not rerun during M4.

Retain M4 failures honestly: initial CAD run 31 PASS/4 FAIL/13 ERROR exposed a 2π rotvec rank singularity and padded OCCT bounding metadata; corrected canonicalization/topological bounds passed subsequent scratch and clean runs. A broad M1 mirror run was 253 PASS/1 FAIL because an unchanged semantic test traversed an excluded private original. No private data was copied and it is not a new 254-test PASS. Original logs/XML/ledgers remain archived. Scoped `.gitattributes` preserves raw STEP/BRep and initial XML whitespace; do not alter their bytes or broaden the exclusion. No hidden failure-history cleanup.

CLI exits: 0 PASS,1 validation failure,2 BLOCKED,3 tool/environment failure. Unknown production inputs give explicit blocker reports and zero solids. `lint --allow-unresolved` may exit0 for authoring only and cannot release instructional geometry. `production-parameters.json` is a non-admitted declaration; no TEST fixture enters production manifests. Q-15 closes synthetic CAD compatibility only, not binary distribution or full physical geometry. Historical M0 FreeCAD/Codex/CUA bootstrap and future GPU/performance remain unqualified.

## Read actual M5 authorities before editing

Read full M5 sections of `docs/digital-twin/{MILESTONES.md,MILESTONE_REVIEW.md}`, plus ARCHITECTURE, DIGITAL_TWIN_DATA_MODEL, GEOMETRY_AND_EVIDENCE_SPEC, HASH_AND_PACK_CONTRACT, ASSET_PIPELINE_SPEC, GATE_CONTRACTS, VERIFICATION_AND_TEST_PLAN, REPOSITORY_CHANGE_MAP, OPEN_QUESTIONS_AND_BLOCKERS, SOURCE_REGISTER and SOURCE_PUBLICATION_CONTRACT. Resolve referenced schemas/contracts from their real paths. No separate CONSTRAINT_AND_DATUM_CONTRACT.md or native-feasibility authority exists; do not invent one. M0, current gate/test plan/locks and M3's qualified evidence define native prerequisites.

M5 dependencies are M1,M2,M4. Owned paths: `digital-twin/components`, scoped evidence, `cad/twin_cad/{components,vendor}`, source-vault and `validation/expected`. No frontend. Keep schema/runtime/source/graph contracts, locks and aggregate manifests under single-integrator ownership. Use one exclusively owned definition/scope per assignment; no overlap if the owner explicitly requests parallel work. Do not infer permission to spawn agents.

Exact purchased scope: fasteners/washers/standoffs/rivets; motors/servos/horns/wheels; Pi boards/HAT/sensors; battery/cables/connectors. Each definition may pass, remain partial or stay BLOCKED independently. Produce an explicit inventory of candidate scopes and missing authoritative inputs, then bounded official/OEM acquisition. Preserve immutable vendor bytes, source URL/revision/rights, unit convention, datum wrapper, exact kit applicability, feature names and mechanical/cosmetic omissions. Model only supported critical geometry, nominal threads and justified envelopes. Unsupported features remain explicit unresolved values, not generic substitute assets.

For each declared scope test dimensions, named features, BRep validity and units; thread/mating compatibility and owned-element accounting; conflicting camera-dimension mutants; identity substitution rejection and propagation of source limitations. Independent checks must inspect actual shape/features, not copies of generated metadata. Where mesh deviation is claimed, bound both directions and protected holes/cavities/surfaces; vertices alone are insufficient. Do not silently approximate unsupported curved geometry.

Acceptance is per-definition **G-COMPONENT**: applicable identity, required feature evidence and independent CAD checks for the named scope. The milestone report must separately list admitted/partial/blocked components and unresolved closures. One scope receipt never establishes all purchased geometry. M7 owns engineering assembly G-CAD and M8 owns final-byte production G-GEOMETRY; M5 component success alone grants neither. No torque, hidden engagement or actual physical equality from nominal CAD success.

## Outstanding component evidence and acquisition boundaries

| Blocker | Required evidence / prohibited substitution |
| --- | --- |
| Q-04 TT motor/gearbox | Exact kit-to-OEM identity, housing/mount/shaft/seating/wire-exit drawing; generic yellow TT is not kit identity. |
| Q-05 servos/horns | Exact model, tabs/shaft/spline/neutral orientation/horn and retaining screw; SG90/MG90S equivalence is unproved; retain three distinct roles. |
| Q-06 fasteners/rivets | Applicable head/drive/pitch/form/material, washer A/B dimensions, standoff end sex/depth and rivet grip/lock; printed M3 and opaque digits do not select standards or torque. |
| Q-07 HAT | Supplied revision-specific CAD/PCB/connectors and applicable ZERO/power/port instructions; latest-family docs/UI chip are not identity. No actuation. |
| Q-08 sensors | Camera 25x23x9 approximate versus24x23.5x8 specification remain conflicting; grayscale unestablished; ultrasonic repository5V versus V40 diagram3V3 unresolved. No averaging/generic HC-SR04/RPi Camera substitution or invented voltage instruction. |
| Q-09 cables | Applicable conductor count/pitch/length/keying, endpoints/pin mapping/bend limits; source schematic routes do not prove metric routes. M7 owns routing closure. |
| Q-10 Pi boards | Pin actual source bytes/limits and applicable board/revision/header/cooler configuration; official logos/reference-only dimensions cannot close exact geometry. |
| Q-11 battery/material | Exact battery/connector/envelope and material thickness/stock; photos cannot measure tape/compression/adhesive performance or battery safety. |
| Q-12 wheels/steering | Applicable hub/shaft/rivet/washer/carrier dimensions and stack faces; retain E-right/F-left, WasherA atS19 and three WasherB/front wheel atS26. No arbitrary weld or invented axial order. |

Q-03 structural plates A–H and exact Plate A datum are **M6**, not M5. Q-01/Q-13 actual stock and physical equality remain unproved. Perspective photos are not measurements. Q-14 accessory/header handling and Q-17 rights retain their original scoped records. Source-register planning statements may predate M0–M4; distinguish historic acquisition limits from subsequent exact receipts without rewriting history.

Official candidates already located in SOURCE_REGISTER (not newly inspected/admitted by M4):

- Pi4 drawing: `https://pip-assets.raspberrypi.com/categories/545-raspberry-pi-4-model-b/documents/RP-008343-DS-1-raspberry-pi-4-mechanical-drawing.pdf`
- Pi5 drawing: `https://pip-assets.raspberrypi.com/categories/892-raspberry-pi-5/documents/RP-008347-DS-1-raspberry-pi-5-mechanical-drawing.pdf`; approximate/reference-only, not production data.
- Pi5 candidate STEP ZIP: `https://pip-assets.raspberrypi.com/categories/892-raspberry-pi-5/documents/RP-010083-CA-1-rpi-5%203D%20STEP%20-%20No%20Graphics%20small%20file.zip`; exact bytes, omissions, features and embedded rights still require acquisition/inspection before any admission.
- Zero2W drawing: `https://pip-assets.raspberrypi.com/categories/584-raspberry-pi-zero-2-w/documents/RP-008358-DS-1-raspberry-pi-zero-2-w-mechanical-drawing.pdf`.

Use current primary official/OEM documentation. Never invent hashes from filenames, Git object IDs or listings. Bound searches/acquisition and stop a definition as BLOCKED when required identity/geometry/rights cannot be established. Continue other independent scopes; do not substitute a generic model to manufacture milestone success. Downloaded/vendor/private source-vault bytes are not automatically publishable or stageable.

## M3 preservation, source publication and authorization

Accepted M3 gate raw: 69,105 bytes / `a952262fc9c3b3505fa767468da90ce7ee7d3914e4b2930599e48cdd065f6120`; 71source/173evidence bindings. Accepted adapter parity raw `6723042dec54e04d02118369c823f82e4d5358d402a9e4385fd4f7e2d5057352` and exact procedure preimages raw `2d73d1b3242a8c90bad7ccd2a444a40f2e2171e3e8017a4de6e4f74dadcfac6e` reside in `docs/implementation/evidence/m3/`. Full persistence/session/config/migration/test byte identities are in that accepted gate and HANDOFF_M4. Consume them at their actual paths; never test stored owner sessions.

M3 qualified 48/48 safe units,254/254 then-current M1,12/12 M2 contracts,73 equal real-adapter scenarios,6/6 actualRustSQLite groups,4/4 official WDIO embedded offline tests. Browser all29/physical workflows passed Chromium/WebKit; final core14/14,fallbacks6/6,oldapp8/8,opt-in regression6/6. Counts overlap and must not be summed or relabeled as new runs. Native reference/persistence/lockedPDF is qualified; later rendering/performance/geometry is not. Tauri2.11.5/build2.6.3/opener2.5.4, Rust/Node test plugins1.4.0 and WDIO9.32.0 remain. `m3-persistence` is optional normal storage, `VITE_M3_ENABLED` remains opt-in; default builds exclude native test bridge/privileges.

Any separately authorized native tests require `m3-native-test`, incognito, a **new** canonical OS-temp `picar-m3-native-...` directory and PICAR_M3_TEST_DATA_DIR. No normal app-data test. Preserve, do not inspect/publish/delete, the excluded initial incident database `/var/folders/_q/nsgwvvj51zlcw71s_yzz0s100000gn/T/picar-m3-native-session-fp8CXSSL/sessions.sqlite3`. It captured one legacy record before isolation was fixed; original key is untouched. Qualified runs assert null legacy/zero imports. Prior failed drafts/unauthorized packaging attempt and the acknowledged incomplete output-overflow review helper remain historical; subsequent full committed review PASS is recorded.

V40 source PDF raw `2f4ea3ae3729bfb6bc92f8fdba30f31937f9df2c3a80e5774ef03fb076f386ce`,11,048,665bytes; documentation lock `8ca58014ece62abf765ebdbd767d72611d69eaac39440e06b78769505fd6d0b3`. No V33 fallback or unreviewed lock regeneration. Publication closure receipt is `docs/implementation/evidence/m3/source-publication-closure.json`. Recovery generation `/Users/danny/Documents/Apps/PiCar-M3-recovery-92755454-9b69-4ab3-b3f8-c9cc1b6a53f5` remains recoverable and untouched. Follow SOURCE_PUBLICATION_CONTRACT writer/reader leases, protected roots and safe mirrors; no live-watcher mutations or private-photo copies. No M5 export may rewrite locked reference/public content or M3 session data.

Honor supplied/actual AGENTS.md: preserve owner work; no Python task scripts for editing/orchestration, no useEffect, no committer override/trailers and no agent runtime/history/session state in commits. The authored Python CAD package/tests are distinct from prohibited ad hoc scripts. Before dependent build/CLI execution, prepare concrete command/cwd/env/input/output/test boundaries and get separate M5 owner approval if required. Continue independent read-only/source work while authorization is pending. No push/PR/remote write or hardware action. Do not mass-upgrade app dependencies.

Preserve SunFounder notices and source-specific limitations. CadQuery/OCP wrapper metadata is Apache2.0; OpenCascade kernel has separate terms. Installed binary distributions were not staged in M4. Rights for source CAD/ZIP/media/binaries require their own scoped evidence; Q-17 is not globally waived. Flag actual licensing implications before any publication; never copy copyrighted implementation without applicable rights/attribution.

## Exact M5 closure and rollback

Record actual commands/cwd/env/exits/counts and raw SHA256/length/Git-object bindings for all consumed source/lock/generator/validator inputs and scoped outputs. Reports never bind their own bytes into upstream model inputs or import downstream pack hashes. Independently revalidate only affected adopted upstream/domain/session/content dependencies in protected mirrors; retain old inputs and identify every binding change. Preserve M4's source/fixtures/qualification evidence side by side.

Stage explicit names, inspect cached names/stat/check and privacy exclusions. No caches/venvs/vendor ZIP/private photographs/source-vault/runtime databases/disposable mutations/agent state staged. `git ls-files digital-twin/evidence/private` remains empty. Commit accepted M5 scopes locally only with honest per-definition G-COMPONENT receipts, clearly reporting partial/BLOCKED definitions and no blanket all-kit claim. If exact requested closure is FAIL/BLOCKED, preserve a precise remediation report/prompt instead of a misleading acceptance commit. Stop with the appropriate next-authority handoff; no M6 implementation.

Rollback each newly revisioned component and its affected dependent solutions/assets without invalidating unrelated setup/source records. Use additive named reversions after checking owner/later work, never reset/clean/history rewrite. Retain original M1/M2 inputs, M4 TEST sources and every M3 backup/session database/recovery generation.
