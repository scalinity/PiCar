# Asset pipeline and glTF/GLB contract

## 1. Outputs and authority

**D-ASSET-01:** produce immutable **per-definition GLBs** and a separate canonical-to-runtime manifest. The manifest instantiates each physical part independently. Sharing a screw mesh is allowed; merging all screws into an unaddressable mesh is not.

Three outputs have different roles:

* **Engineering outputs:** STEP/BRep, feature tables, constraint/DOF reports, nominal assembly solutions and motion/clearance reports. These are generated from canonical evidence/CAD and are the auditable mechanical outputs.
* **Runtime outputs:** per-definition GLB, textures, optional schematic cable data, compiled step/variant manifest and admission report. They are optimized views of the engineering data.
* **Review output:** a generated `assembly-<variant>.glb` with all physical instance roots and nominal final poses for independent visual inspection. It is not the sole runtime database and is not reimported as truth.

The runtime loader trusts no GLB confidence flag. It verifies the manifest/admission report and requires metadata equality. A field in `extras` is a cross-check, not an authority override.

## 2. Reproducible build stages

| Stage | Input -> output | Mandatory invariant |
|---|---|---|
| Evidence lock | Original files/source revisions -> source manifest | Hash available bytes; retain exact original/revision and applicability; no floating `latest` geometry input |
| Canonical validation | JSON records -> validated inventory/graph/feature registry | Schema and semantic checks pass or emit explicit blockers |
| CAD generation | Locked CadQuery scripts/vendor STEP -> solids + named analytic interfaces | Missing required parameters fail; source solids never edited in place |
| Assembly solve | Variant constraints + solids -> world poses + DOF/residual reports | Final poses arise from constraints; unintended ambiguity fails |
| Tessellation | G-CAD-admitted solids -> mesh packets in CAD local frames | Fixed absolute/angular tessellation settings; protected critical features; source-to-mesh deviation checked |
| Presentation overlay | Immutable mesh packets + appearance records -> render-ready packets | May add colors, UVs and textures; may not change mechanical positions/topology without revalidation |
| Basis conversion | CAD mm local geometry/poses -> runtime metres | One explicit R conversion from data model; no second Blender auto-conversion |
| GLB assembly | Converted packets + manifest metadata -> per-definition GLB | Node/owner IDs, transforms, bounds and permitted material contract validated |
| Optimization | Raw GLB -> optimized GLB | Exact same instance semantics and critical feature bounds; decode-and-compare required |
| Publication | Validated hash set -> `public/twin/<packHash>/` + active pointer | Atomic staged directory; no mixed old/new manifest; packaging allowlist only |

The primary exporter is a scripted Node/TypeScript builder using glTF-Transform over explicitly exported mesh packets. This avoids dependence on Blender's scene hierarchy or implicit CAD-export naming. CadQuery's built-in glTF export is useful for engineering diagnostics, not a substitute for this metadata contract.

## 3. STEP, vendor CAD and Blender roles

Record exact vendor file hash, part number/revision, coordinate system, units and permitted redistribution before import. A vendor STEP may contain many solids; classify every solid as physical subelement or cosmetic construction artifact. Do not accidentally count a vendor assembly's repeated hardware twice when the same hardware is also in the kit BOM.

Use headless CadQuery scripts and locked dependencies for reconstruction. FreeCAD is used for independent opening, checking and cross-sectional review where valuable. Do not require a hand-edited FreeCAD document that cannot regenerate from source records.

Blender is an optional presentation branch: import a copy of admitted mesh packets, use deterministic script-driven material/UV operations, and export only presentation data or textures keyed by stable material/feature IDs. Mechanical POSITION/index buffers remain those of the approved exporter. Topology-altering modifiers, applied scale, smoothing that moves vertices, remeshing, manual assembly transforms and hand-authored assembly animation are excluded. If a cosmetic topology change is proposed, regenerate/revalidate the affected mesh in the canonical build; Blender approval alone is insufficient.

## 4. GLB structure and stable mapping

Each definition asset has one root node:

```json
{
  "name": "PX-V40-DEF-STANDOFF-M3X26",
  "extras": {
    "picarTwin": {
      "contractVersion": 2,
      "kind": "partDefinition",
      "partDefinitionId": "PX-V40-DEF-STANDOFF-M3X26",
      "definitionRevision": 1,
      "geometryHash": "<sha256>",
      "sourceManifestHash": "<sha256>"
    }
  }
}
```

The placeholder hashes above are documentation only; release validators reject placeholders. Definition root TRS is identity. Vertices are in the definition's converted canonical datum frame, in metres. Child nodes are either named mechanical subelements, geometry primitives, or cosmetic nodes with an explicit owner definition/element ID. No anonymous unclassified node is allowed. The same mesh may be referenced by more than one node when ownership remains explicit.

The runtime manifest has an `instances` table containing every active or accounted-for physical ID, its definition identity, ownership and initial lifecycle/disposition. Definition assets, compiled graphs and stable solution-index entries supply the hash-bound geometry, operations, connections and poses. The application creates a separate Object3D root named with **each instance ID**. Thus three servo instances never share a mutable root even if they share immutable mesh buffers.

Picking an internal node resolves through `instanceRootId + localElementId`, never `name` alone or Three's generated UUID. All geometry nodes resolve to canonical definition/element IDs; all runtime physical roots resolve to instance IDs. Noninstalled tools/spares/unused-variant items can have no mesh and still remain in the inventory manifest with a reference-only representation.

The generated full-assembly review GLB has one root per instance with `extras.picarTwin.partInstanceId`, definition ID and model/graph hash, then child definition geometry. It preserves the same flat physical identity map while sharing mesh accessors. This review format is a derived deliverable, not a second authoring source.

## 5. Hierarchy and transforms

The glTF specification permits duplicate display names and requires a tree hierarchy [W05]; this contract adds unique stable names within the relevant asset scope. A CAD attachment loop does not become a glTF parent cycle. Runtime physical roots stay under a stable assembly container; articulated/internal elements use declared rig relationships. Presentation group transforms are computed overlays over instance sets, with no accumulation into final poses.

Root scale is [1,1,1]. No negative scale, mirrored transform, shear, arbitrary recentering or hidden centimetre/millimetre factor is permitted. Node rotations are normalized XYZW quaternions. The manifest contains final solution poses; the loader checks asset pivots and transform convention before first render. Unit/basis test fixtures include an asymmetric three-axis marker, a 100 mm segment and a left/right keyed mating pair.

The runtime does not use glTF animation clips for assembly truth. Optional cosmetic clips may be present only on declared nonmechanical nodes and cannot change a mechanical node's pose, visibility or confidence. The baseline mechanical asset profile contains no assembly clips or skins. Flexible cable display uses the separate routing representation, not a skinned cable that conceals unknown length.

## 6. Materials, textures, ghosting and LOD

Use metallic-roughness PBR materials, with subdued engineering lighting. Materials have stable semantic names (plate finish, PCB, plastic, tire, conductor, schematic). Unknown material identity is presented as appearance, not a material-property claim. Normal maps may add cosmetic surface appearance but cannot represent a missing critical bore or contact face.

Baseline textures are local PNG/JPEG; use shared small atlases where beneficial, with 2048 px as the default maximum and an explicit exception for readable source labels. Never rasterize full instruction photos onto a mechanical surface to simulate exact geometry. Preserve sRGB color versus linear data-map interpretation. KTX2 is deferred until measured texture pressure justifies it and an offline decoder path is tested; it is not required for correctness.

LOD0 is used for the current operation/inspector; LOD1 for assembled context; LOD2 for distant overview. All LODs preserve the same canonical feature frames and ID mapping. Critical geometry stays within the error budget at every LOD that can teach a connection. In the closest inspector, showing LOD0 is mandatory. Threads remain nominal surfaces with analytical metadata unless a specific interaction demonstrably requires modeled threads.

Ghost and dim materials are runtime overrides, not mutations of shared source materials. Future ghosts use low opacity, disable depth writing and use a stable render order; current parts remain solid. If transparency sorting obscures understanding, switch that context to an edge/silhouette mode rather than claiming perfect transparent rendering. Selection uses a local silhouette/edge overlay with text; it does not require a full-scene postprocessing chain.

## 7. Compression decision

Start with an uncompressed validated GLB baseline. The approved release compression is **Meshopt** with a locally bundled decoder when its byte savings are worthwhile and decoded geometry passes the same deviation/ID tests. Use an explicit compression/quantization configuration rather than an opaque “optimize all” command. glTF-Transform's convenience meshopt transform also invokes quantization/reordering [W07], so applying it without auditing those changes is prohibited.

Draco is not the selected pipeline: supporting two geometry codecs adds test/decoder surface without a demonstrated requirement. No mesh joining across part instances or canonical ownership boundaries. No simplification/quantization that changes a required bore or final datum. Shared geometry, sensible tessellation and lazy loading come before lossy optimization. Three's GLTFLoader supports the decoder integration paths used here [W08]; actual supported extension versions are frozen in the runtime compatibility manifest.

## 8. Manifest and compatibility

Minimum manifest fields: `contractVersion:2`, `schemaVersion`, `packHash`, `graphSetHash`, `modelHash`, `evidenceHash`, `toolchainHash`, `variantIds`, `compiledGraphs`, `definitionAssets`, `instances`, `interfaceFrames`, `solutions`, `registry`, `admissionReports`, `routingRepresentations`, `referenceLinks`, `licenses`, and `byteBudgets`. CompiledGraph and AssemblySolution artifacts are hash-bound and structurally typed; HASH_AND_PACK_CONTRACT.md fixes all reference and equality rules.

Every asset record has relative path, SHA-256, byte count, media type, definition/element ownership, bounding box, triangle counts by LOD, required decoder/extensions and allowed capability scope. Refuse absolute paths, `..`, external URIs or undeclared resources. The root manifest is trusted from the application bundle or an explicit imported-pack adoption transaction. Compute packHash over the JCS root manifest excluding only its top-level packHash, as specified by HASH_AND_PACK_CONTRACT.md. modelHash never names a mutable presentation directory.

Runtime errors distinguish: missing file; hash mismatch; schema mismatch; unsupported extension; invalid node mapping; failed decode; WebGL failure; and evidence-blocked geometry. An evidence block is not a broken loader; it has its own reference-only UI. Loading retries evict the failed promise/cache entry. Version mismatch cannot be resolved by accepting an arbitrary nearby asset version.

## 9. Validation and reproducibility

Run Khronos glTF Validator plus project checks for every output. Decode the optimized output and compare critical vertex/surface error, bounds, node ownership, pivots, material attribution and instance reconstruction. Verify no required node was pruned merely because it was hidden in an initial state. Use the generated review assembly to independently inspect hole alignments, left/right orientation, wheel hubs and cable endpoints.

Determinism means: identical canonical sources and locked build environment produce identical normalized runtime JSON and GLB bytes; CAD semantic feature tables/solutions must match within the fixed numerical budgets. STEP/BRep serializers can carry tool/version/timestamp differences, so raw STEP byte equality alone is not the definition of mechanical equivalence. Record raw artifact hashes and semantic signatures separately. Two clean builds in the canonical environment must match the runtime release hashes; cross-platform CAD checks compare the declared semantic invariants and report kernel differences rather than silently blessing them.

No runtime output is published before its complete dependency closure and report are staged. Retain the last valid manifest directory for rollback. The existing content pipeline must not delete or rewrite twin outputs; the twin publisher must not rewrite reference content.

## 10. Imported pack trust boundary

A self-consistent hash is integrity evidence, not mechanical authority. An imported pack does not acquire instructional capability merely by setting a permitted schema enum or including a report labeled PASS. Recognize a hash-bound release/admission chain already trusted by the app, or require the owner to run the specified local source/CAD/export validation workflow and explicitly adopt its resulting report. Unrecognized external packs remain provisional review only. There is no automatic imported-pack trust based on a filename, GLB extras or an author-written confidence flag. This is a small local trust registry, not an enterprise signing service.

## Audited final-byte and publication requirements

[HASH_AND_PACK_CONTRACT.md](HASH_AND_PACK_CONTRACT.md) is the precise v2 graph/solution/LOD/decoder and immutable-pointer contract. [GATE_CONTRACTS.md](GATE_CONTRACTS.md) requires independent analytic witnesses, bidirectional bounded surface deviation and per-motion capability. Metadata self-comparison or vertex-only distance is not sufficient. G-CAD uses meshHash=notApplicable; G-GEOMETRY requires all final mesh bindings available.

RuntimeRegistry supplies the hash-bound typed record closure; each CompiledGraph owns its own resolved step list. graphSetHash is the pack-level aggregate, while each selected variant retains its own graphHash. See HASH_AND_PACK_CONTRACT.md for the exact non-circular preimages and world-pose convention.
