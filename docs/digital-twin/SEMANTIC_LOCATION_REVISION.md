# Prospective v2 installation-location revision

Revision ID: `PX-V40-CONTRACT-LOCATION-01`. Contract version remains 2; semantic registry version becomes 2. Received 2026-09-29, America/New_York, during the M2 remediation conversation, after the independent M0/M1 preflight. Authority: explicit project-owner reply to the installation-location ruling request. This is M2 remediation authorization only. M3 remains unauthorized until complete M2 acceptance.

This extension prospectively revises the exclusive write table in SEMANTIC_CONTRACT.md section 3. The original audited package and accepted M1 Git objects remain unchanged and available. It does not claim these effects were specified by the original audit. Structural JSON schemas and payloads remain unchanged; no inferred installation-target field is introduced. The exact owner instruction below is the normative revision. All unmentioned write surfaces, guards, uncertainty limits and acceptance obligations retain their existing contracts.

## Exact owner instruction

I authorize a narrow revision of the v2 semantic write contract to resolve installation-location effects. Preserve the original accepted contracts and evidence, record the exact revision, recompute affected identities, and revalidate affected G-DATA checks before M2 acceptance. This authorizes M2 remediation only.

Use existing explicit payload IDs and parentAssignments; do not add an inferred installation-target list.

1. **attachRigid / attachJoint:** The operation’s non-null parentAssignments explicitly enumerate its installation targets. Each target must be a source-declared connection participant or explicitly listed member of the attached subassembly. Change target locations from tray to assembly; already-assembly targets retain that location. Reject available, backup, variantUnused, accessory, tool or discarded targets. Reused endpoints omitted from parentAssignments receive no location write. An empty list means no location writes.

2. **installFastener:** Set only payload.fastenerInstanceId to assembly, as already specified. Require its explicit non-null parent assignment. Do not promote other contact-stack participants implicitly.

3. **insertRivet:** Set payload.rivetInstanceId to assembly and mark its owned body inserted. Require that rivet’s non-null parent assignment. Other installation targets follow the same explicit parentAssignments rule as attachment operations. Count one purchased rivet. **lockRivet** requires the inserted body and assembly location, marks the owned pin locked, and performs no location writes.

4. **connectCableEnd:** For a loose cable, change its declared cable instance from tray to assembly upon the first endpoint connection; subsequent connections retain assembly. Reject an unstaged or incompatible cable. For an integral lead, change only its endpoint-connection state: never change the parent servo, motor or battery location, and never create another stock instance. **disconnectCableEnd** removes exactly the named connection and performs no location writes. Disconnection alone does not establish removal from the assembly or undo routing.

5. **allocateConsumable:** Require the predeclared, available, unallocated piece; record its source-lot allocation verbatim and move that piece to tray. Do not change the source-stock instance’s location or invent capacity. **applyConsumable:** Require its allocation and explicit non-null parent assignment; move the named piece from tray to assembly and activate its prescribed connection. Other expressly authored installation targets follow the attachment rule. Reject duplicate application.

6. **parentAssignments / groupSubassembly:** Update parent pointers and membership together. Reparenting or grouping alone never changes locations. Group members retain their locations unless the enclosing operation is an installation operation covered above. Do not infer targets from descendants, connected neighbors, scene traversal or proximity.

`assembly` denotes an installed digital instruction disposition, including installation within a subassembly; it does not assert attachment to the final robot, electrical completeness, physical confirmation or geometry admission. Do not leave newly installed targets at tray after the installation operations defined above. A staged reused endpoint may remain tray only when expressly omitted from the operation’s installation targets.

For S27, explicitly target the two rear-wheel instances for shaft attachment under chassis/rear-drive. Their locations become assembly. Existing motor locations remain unchanged. Add no fastener and preserve the distinct wheel identities.

Validate every guard before any write, preserve operation atomicity, and restore all locations exactly through serialized undo. Reconciliation must distinguish tray, assembly, reserves/accessories/tools and consumable allocations without double-counting owned elements or source material.

Provenance: this is my explicit project-owner instruction, adopted when I submit this reply. Record its receipt date and exact text in the contract-revision evidence. It is a prospective semantic revision, not a claim that the original audited package already specified these effects. M3 remains unauthorized until complete M2 acceptance.

## Adoption and invalidation

The active semantic-registry descriptor binds this extension's exact SHA-256, making its adoption part of schemaHash. The baseline M1 report is retained, never overwritten or represented as accepting revised bytes. A separate adopted G-DATA receipt must bind baseline/adopted identities and every changed production record, validator, hash policy and executed test result. Any revision change invalidates that adoption and every dependent M2 graph/state proof. Changes to canonical mechanical records additionally require modelHash recomputation. Physical stock, metric geometry and electrical applicability remain blocked as scoped in the original authorities.
