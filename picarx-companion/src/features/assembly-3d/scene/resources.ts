// GPU resource ownership for the Studio viewport. Each class has one creation point and one disposal boundary:
//   pack-cached     decoded part geometries and their source materials (assets/pack.ts): kept for the app's lifetime so
//                   a board switch or a later visit reuses them, and never disposed here.
//   board-owned     one board's instance materials (normal, selected, review focus, ghost), its tray tiles and pick targets
//                   (their geometry and materials) and its key light with the light's shadow map (createBoard): released once
//                   a rebuilt board has replaced it in the scene, or when the viewport closes. Inspection never touches the
//                   pack's source materials: ghosting and clipping act on this board's own copies.
//   renderer-owned  the PMREM environment render target whose texture lights the scene (createEnvironment): released with
//                   the viewport. The light-card scene it is rendered from is released as soon as the environment exists.
// Owners register when the frame loop adopts them, never during render, so `owned()` lists exactly what is live.
import {
  Box3, BoxGeometry, BufferGeometry, Color, DirectionalLight, DoubleSide, Float32BufferAttribute, Group, LineDashedMaterial, LineLoop, Mesh, MeshBasicMaterial,
  MeshPhysicalMaterial, MeshStandardMaterial, Plane, PlaneGeometry, PMREMGenerator, Scene, Vector3,
  type Material, type Texture, type WebGLRenderer,
} from 'three';
import type { LightSpec, LoadedPack, Vec3 } from '../assets/pack';
import { worldBox, type Style } from '../motion/inspect';
import type { StudioVariant } from '../../../lib/router';

export type Owner = { label: string; dispose(): void };

const live = new Set<Owner>();

export function own(label: string, release: () => void): Owner {
  const owner: Owner = { label, dispose: () => { if (live.delete(owner)) release(); } };
  live.add(owner);
  return owner;
}

export const owned = (): string[] => [...live].map((o) => o.label).sort();

const SELECT_COLOR = new Color('#55aaa4'), FOCUS_COLOR = new Color('#c58ae5');
export const direction = (azimuthDeg: number, elevationDeg: number): Vec3 => {
  const az = (azimuthDeg * Math.PI) / 180, el = (elevationDeg * Math.PI) / 180;
  return [Math.cos(el) * Math.sin(az), Math.sin(el), Math.cos(el) * Math.cos(az)]; // CAD spherical -> runtime basis
};

// Parts smaller than this get an invisible pick target of at least PICK_M, so an M1.5 screw can be clicked.
const SMALL_M = 0.008, PICK_M = 0.011;
const HIDDEN_LAYER = 1; // neither the camera, the raycaster nor the shadow pass sees layer 1

export type Board = {
  variant: StudioVariant; ids: ReadonlySet<string>; roots: Map<string, Group>; tiles: Map<string, Group>;
  keyLight: DirectionalLight; style(id: string, style: Style): void; styleOf(id: string): Style; setClip(clip: { heightM: number; trayGuardX: number } | null): void;
  materials(): Material[]; release(): void;
};

// One board's scene content. Instance roots clone the pack's part nodes, sharing their geometry (pack-cached); every
// material, tile, pick target and the key light are new and belong to this board.
export function createBoard(pack: LoadedPack, variant: StudioVariant): Board {
  const v = pack.manifest.variants[variant];
  const sets = new Map<string, Record<Exclude<Style, 'hidden'>, MeshPhysicalMaterial>>();
  for (const [id, m] of Object.entries(pack.manifest.materials)) for (const state of ['current', 'later', 'spare'] as const) {
    const normal = new MeshPhysicalMaterial({ color: new Color(...m.baseColor), metalness: m.metallic, roughness: m.roughness,
      clearcoat: m.clearcoat ?? 0, clearcoatRoughness: m.clearcoatRoughness ?? 0 });
    if (state !== 'current') normal.color.multiplyScalar(state === 'later' ? 0.55 : 0.75);
    normal.name = id;
    const selected = normal.clone();
    selected.emissive = SELECT_COLOR;
    selected.emissiveIntensity = 0.2; // a tint, not a wash: the finishes stay readable while selected
    const focus = normal.clone();
    focus.emissive = FOCUS_COLOR;
    focus.emissiveIntensity = 0.26;
    const ghost = normal.clone();
    Object.assign(ghost, { transparent: true, opacity: 0.12, depthWrite: false });
    sets.set(`${id}:${state}`, { normal, selected, focus, ghost });
  }
  const meshSets = new Map<Mesh, Record<Exclude<Style, 'hidden'>, Material>>();
  const pickMaterial = new MeshBasicMaterial({ visible: false });
  const pickGeometries = new Map<string, BoxGeometry>();
  let clipping = false;
  const clipPlanes = [new Plane(new Vector3(0, -1, 0), 0), new Plane(new Vector3(-1, 0, 0), 0)];
  const roots = new Map<string, Group>();
  for (const id of Object.keys(v.tray.instances)) {
    const definitionId = pack.manifest.instances[id].definitionId;
    const root = new Group();
    root.name = id;
    root.userData = { instanceId: id, definitionId, inventoryState: v.tray.instances[id].state };
    root.add(pack.definitions.get(definitionId)!.clone());
    root.traverse((o) => {
      if (!(o instanceof Mesh)) return;
      const state = v.tray.instances[id].state;
      const set = sets.get(`${(o.material as Material).userData.materialId}:${state === 'tool' ? 'current' : state}`)!;
      o.material = set.normal;
      meshSets.set(o, set);
    });
    const b = pack.manifest.definitions[definitionId].boundsM, size = b.max.map((x, i) => x - b.min[i]);
    if (Math.max(...size) < SMALL_M) {
      let geometry = pickGeometries.get(definitionId);
      if (!geometry) pickGeometries.set(definitionId, geometry = new BoxGeometry(...size.map((s) => Math.max(s, PICK_M)) as Vec3));
      const pick = new Mesh(geometry, pickMaterial);
      pick.position.set(...b.min.map((x, i) => (x + b.max[i]) / 2) as Vec3);
      pick.userData.pickTarget = true;
      root.add(pick);
    }
    // Raycasting follows the same intersection of world-space clip half-planes as the shader, including pick boxes.
    root.traverse((o) => {
      if (!(o instanceof Mesh)) return;
      const raycast = o.raycast;
      o.raycast = function (raycaster, intersections) {
        const hits: typeof intersections = [];
        raycast.call(this, raycaster, hits);
        intersections.push(...hits.filter((h) => !clipping || !clipPlanes.every((p) => p.distanceToPoint(h.point) < 0)));
      };
    });
    roots.set(id, root);
  }
  // Tray tiles: a flat matte card with a dashed edge on the floor for each instance with no trusted solid.
  const tileFace = { normal: new MeshStandardMaterial({ color: '#2a2723', roughness: 0.95, metalness: 0 }),
    ghost: new MeshStandardMaterial({ color: '#2a2723', roughness: 0.95, metalness: 0, transparent: true, opacity: 0.3, depthWrite: false }) };
  const tileEdge: Record<'normal' | 'selected' | 'focus', LineDashedMaterial> = {
    normal: new LineDashedMaterial({ color: '#8f8a82', dashSize: 0.003, gapSize: 0.002 }),
    selected: new LineDashedMaterial({ color: '#55aaa4', dashSize: 0.003, gapSize: 0.0012 }),
    focus: new LineDashedMaterial({ color: '#d9cfc2', dashSize: 0.003, gapSize: 0.0012 }),
  };
  const tileGeometries: BufferGeometry[] = [];
  const tiles = new Map<string, Group>();
  for (const [id, t] of Object.entries(v.tray.tiles)) {
    const [hx, hz] = t.halfExtentsM;
    const group = new Group();
    group.name = id;
    group.userData = { instanceId: id, tile: true, inventoryState: t.state };
    group.position.set(t.centreM[0], v.floorYM + 0.0006, t.centreM[2]);
    const faceGeometry = new PlaneGeometry(hx * 2, hz * 2);
    faceGeometry.rotateX(-Math.PI / 2);
    const face = new Mesh(faceGeometry, tileFace.normal);
    face.receiveShadow = true;
    face.userData.tileFace = true;
    const edgeGeometry = new BufferGeometry();
    edgeGeometry.setAttribute('position', new Float32BufferAttribute([-hx, 0.0002, -hz, hx, 0.0002, -hz, hx, 0.0002, hz, -hx, 0.0002, hz], 3));
    const edge = new LineLoop(edgeGeometry, tileEdge.normal);
    edge.computeLineDistances();
    // The edge is drawing only: lines are raycast within a threshold of one world unit (a metre here), so a pickable
    // edge would catch clicks meant for parts anywhere near the tray. The tile's face is what selects it.
    edge.raycast = () => {};
    group.add(face, edge);
    tileGeometries.push(faceGeometry, edgeGeometry);
    tiles.set(id, group);
  }
  // Styles swap this board's own materials; hidden moves a part to a layer nothing renders, picks or shadows.
  const styles = new Map<string, Style>();
  const style = (id: string, s: Style): void => {
    if ((styles.get(id) ?? 'normal') === s) return;
    styles.set(id, s);
    const root = roots.get(id), tile = tiles.get(id);
    root?.traverse((o) => {
      o.layers.set(s === 'hidden' ? HIDDEN_LAYER : 0);
      const set = o instanceof Mesh ? meshSets.get(o) : undefined;
      if (set) (o as Mesh).material = set[s === 'hidden' ? 'normal' : s];
    });
    tile?.traverse((o) => {
      o.layers.set(s === 'hidden' ? HIDDEN_LAYER : 0);
      if (o instanceof Mesh) o.material = s === 'ghost' ? tileFace.ghost : tileFace.normal;
      if (o instanceof LineLoop) o.material = s === 'selected' ? tileEdge.selected : s === 'focus' ? tileEdge.focus : tileEdge.normal;
    });
  };
  // Deck clip: renderer clipping on this board's materials only. With clipIntersection a fragment is cut only when it is
  // above the deck height and on the assembly's side of the tray guard, so the tray is never cut.
  const partMaterials = (): MeshPhysicalMaterial[] => [...sets.values()].flatMap((s) => [s.normal, s.selected, s.focus, s.ghost]);
  const setClip = (clip: { heightM: number; trayGuardX: number } | null): void => {
    if (clip) { clipPlanes[0].constant = clip.heightM; clipPlanes[1].constant = clip.trayGuardX; }
    if (Boolean(clip) === clipping) return;
    clipping = Boolean(clip);
    for (const m of partMaterials()) {
      Object.assign(m, { clippingPlanes: clip ? clipPlanes : null, clipIntersection: true, clipShadows: true });
      m.needsUpdate = true; // clipping changes the shader program
    }
  };
  // The key light's shadow rig depends only on the pack and board, so it survives step changes with its shadow map.
  const key = pack.manifest.lighting.lights.find((l) => l.id === 'key')!;
  const kd = direction(key.azimuthDeg, key.elevationDeg), centre = v.centreM;
  const keyLight = new DirectionalLight(new Color(...key.color), 0.9);
  keyLight.position.set(centre[0] + kd[0] * 1.5, centre[1] + kd[1] * 1.5, centre[2] + kd[2] * 1.5);
  keyLight.target.position.set(...centre);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(2048, 2048);
  keyLight.shadow.radius = 5;
  keyLight.shadow.bias = -0.0002;
  keyLight.shadow.normalBias = 0.0004;
  // Full-kit framing moves the light's centre away from the chassis. Fit its shadow camera to both the tray and every
  // assembly state instead of clipping the chassis shadow at the old fixed half-metre boundary. The margin covers
  // the short approach motions and inspection spread; include the receiving floor in the depth range.
  const bounds = new Box3();
  for (const group of v.tray.groups) bounds.union(new Box3(new Vector3(...group.boundsM.min), new Vector3(...group.boundsM.max)));
  for (const step of v.steps) for (const [id, pose] of Object.entries(step.placements)) {
    const b = worldBox(pack.manifest.definitions[pack.manifest.instances[id].definitionId], pose);
    bounds.union(new Box3(new Vector3(...b.min), new Vector3(...b.max)));
  }
  bounds.min.y = Math.min(bounds.min.y, v.floorYM);
  bounds.expandByScalar(0.2);
  const shadowCamera = keyLight.shadow.camera;
  shadowCamera.position.copy(keyLight.position);
  shadowCamera.lookAt(keyLight.target.position);
  shadowCamera.updateMatrixWorld();
  bounds.applyMatrix4(shadowCamera.matrixWorldInverse);
  Object.assign(shadowCamera, { left: bounds.min.x, right: bounds.max.x, bottom: bounds.min.y, top: bounds.max.y,
    near: Math.max(0.01, -bounds.max.z), far: Math.max(0.02, -bounds.min.z) });
  shadowCamera.updateProjectionMatrix();
  const owned = (): Material[] => [...partMaterials(), pickMaterial, tileFace.normal, tileFace.ghost, ...Object.values(tileEdge)];
  return {
    variant, ids: new Set([...roots.keys(), ...tiles.keys()]), roots, tiles, keyLight, style, styleOf: (id) => styles.get(id) ?? 'normal', setClip,
    materials: owned,
    release: () => {
      for (const m of owned()) m.dispose();
      for (const g of [...pickGeometries.values(), ...tileGeometries]) g.dispose();
      keyLight.dispose(); // its shadow map render target
    },
  };
}

// Image-based light from the same rig Blender uses: each area light becomes an emissive rectangle at the same direction,
// distance and size. Environment lighting has no falloff or spread; see the pipeline notes. The render target is
// returned with its texture so the two are released together.
export function createEnvironment(gl: WebGLRenderer, lights: LightSpec[], base: Vec3): { texture: Texture; release(): void } {
  const scene = new Scene();
  scene.background = new Color(...base); // dim studio walls: what metal reflects between the light cards
  const cards: Mesh<PlaneGeometry, MeshBasicMaterial>[] = [];
  for (const l of lights) {
    const card = new Mesh(new PlaneGeometry(l.sizeM[0], l.sizeM[1]), new MeshBasicMaterial({ side: DoubleSide, toneMapped: false,
      color: new Color(l.color[0] * l.runtimeIntensity, l.color[1] * l.runtimeIntensity, l.color[2] * l.runtimeIntensity) }));
    const d = direction(l.azimuthDeg, l.elevationDeg);
    card.position.set(d[0] * l.distanceM, d[1] * l.distanceM, d[2] * l.distanceM);
    card.lookAt(0, 0, 0);
    scene.add(card);
    cards.push(card);
  }
  const pmrem = new PMREMGenerator(gl);
  const target = pmrem.fromScene(scene, 0.015);
  pmrem.dispose();
  for (const card of cards) { card.geometry.dispose(); card.material.dispose(); }
  return { texture: target.texture, release: () => target.dispose() };
}
