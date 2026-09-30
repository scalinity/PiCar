# Adversarial architecture review

This review concerns the specification, not a test run of an implementation. The package-validation report records the package checks actually performed on these delivered documents, schemas and evidence files. The following issues were considered and the resulting constraints are incorporated throughout the package.

| Challenge | Failure prevented / incorporated ruling |
|---|---|
| Digital twin or only an animation? | Canonical parts/interfaces/constraints and a pure operation graph define every state. Visual motion projects that state; GLB or Blender clips cannot define assembly truth. |
| Does each physical item have an identity? | Definitions are distinct from instances, quantity trays are views, washers are individual, integral leads have ownership, rivet elements do not duplicate supplied stock, and accessory/spare/variant-unused dispositions are explicit. |
| Are printed stock and actual inventory conflated? | No. The counted hardware depiction is a separate evidence scope. Actual owner-stock equality is BLOCKED until adequately observed, never set equal by default. |
| Can every hole be explained? | Feature IDs resolve through measurements/derivations/evidence; CAD face indices and AI authorship are not terminal provenance. Missing frames remain unresolved, not zero. |
| Can a plausible generic model become exact kit CAD? | No. Part identity, applicability, source limits and geometry assurance are independent. SG90/MG90S, generic TT and HC-SR04 models are not admitted by resemblance. |
| Is official-source status being overused? | The inspected official Pi5 drawing explicitly limits itself to approximate reference dimensions. Those limits propagate and bar unsupported exact engineering claims. Its located STEP ZIP is not called validated CAD. |
| Have older PiCar revisions leaked in? | V40 source lock is mandatory; discovered V33 fallback is removed. URL family v20 is not a printed-kit revision. PDF metadata alone cannot prove V40. |
| Is state fully reversible? | Pure before-state capture and after-hash guard support exact semantic undo; replay does not reverse physical tape cutting or rewrite attestations. All29×3 variant rounds are required tests. |
| Is the step number being used as the entire state? | Four layers separate immutable model, digital projection, physical confirmation ledger and presentation. Cable endpoints, temporary P11, allocations and joints have explicit state. |
| Are camera actions changing truth? | Camera/explosion/selection/replay are presentation only. Manual override persists until resumed. Preview and physical confirmation remain different commands. |
| Can a user “undo” a later dependency incorrectly? | Explicit invalidation closure and transactional persistence prevent silently retaining downstream alignment evidence. Variant changes fork instead of reinterpreting the same session. |
| Can incomplete poses be hidden in context? | G-GEOMETRY covers the complete mating/context dependency closure. A nearby chassis used to locate a screw cannot be an unverified exception. |
| Is Blender still the geometric source? | No. It is optional texture/material tooling on copies. Source positions, interfaces and mechanical poses belong to deterministic CAD; primary GLB export is script-driven. |
| Can export validation create a dependency cycle? | Engineering checks produce G-CAD in M7. M8 builds final assets, runs round-trip checks, then closes G-GEOMETRY. Fixture exporter/viewer work can precede real geometry without admitting it. |
| Do geometry and source uncertainty get replaced by numerical solver tolerance? | No. Manufacturing tolerance, measurement uncertainty, model approximation and solver residual are separate. Nominal agreement cannot certify worst-case physical fit. |
| Can a provisional import simply flip a verified enum? | Runtime/compiler derive capability from admitted hash-bound reports and trusted pack provenance. Unknown imported packs stay provisional unless a recognized release/admission chain is validated and explicitly adopted. |
| Will current app functionality survive? | Eight setup-stage IDs, legacy hash routes, AST renderer, PDF/video/search, overlays and localStorage backup are protected. Assembly is integrated, not a rewrite. |
| Will content regeneration delete twin assets? | No. Twin publication is outside public/content and both publishers use explicit staging ownership. Existing destructive deletion is a targeted migration concern. |
| Does Gitignore actually protect packaged sensitive media? | No; package allowlist/deny-path audit is required. Local ignored images can otherwise enter public output. Source photos stay private by default. |
| Is macOS native testing based on an outdated assumption? | No. Current official Tauri docs include the WDIO embedded path; actual compatibility is a measured gate, not an assumed success. Browser tests are not native GPU proof. |
| Can every final artifact regenerate? | Pinned source/toolchain, parametric scripts/vendor wrappers, normalized mesh export and hash manifests define regeneration; no required GUI-only edit or unversioned Blender state. |
| Are directory/API choices consistent? | Review consolidated domain/assembly, domain/components, platform, assembly-3d and generated paths; operation tags and schema entry points were aligned. Both schemas and prose use the same identity/unknown conventions. |
| Are source-photo metadata trustworthy? | Hashes and dimensions are measured from actual local files; first two photos are landscape, remaining four portrait. Crops preserve parent region and resampling metadata, not inferred scale. |
| Can camera/AR verify hidden facts? | No. Observability is rule-scoped; hidden washer, screw length, torque and thread engagement cannot gain camera PASS. Registered pose requires calibrated scale and a known tag-to-assembly relationship. |
| Can agents work independently without making architecture choices? | Milestones specify exact scope/paths/dependencies/tests/gates and exclusive ownership. M1/M2 contract changes require integration review, not divergent forks. |

## Residual limits, not papered-over findings

No full authoritative V40 CAD package or actual unit measurements were obtained. Bundled PDF bytes and candidate Pi5 STEP bytes remain uninspected in this pass. No native/renderer/app build was run. Final physical-match verification therefore remains unavailable; many nominal geometry scopes remain blocked. The software architecture, source-backed semantic29-step plan and fixture/reference-first implementation are still executable without new owner input.

The specification is complete as an implementation contract with bounded evidence gates. It is not a claim that the missing evidence has already been acquired or that the resulting digital twin has already been certified.

## Independent audit status

This document preserves the original author’s self-review; it is not the independent audit or a mechanical certificate. The independent findings, counterexamples and corrections are in [AUDIT_REPORT.md](AUDIT_REPORT.md). The historical 174-check report is preserved under HISTORICAL; the current runnable validation report is AUDITED_PACKAGE_VALIDATION_REPORT.json. No repository build, native execution or real mechanical validation was performed during this audit.
