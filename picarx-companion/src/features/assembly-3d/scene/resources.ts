// GPU resource ownership for the Studio viewport. Each class has one creation point and one disposal boundary:
//   pack-cached     decoded part geometries and their source materials (assets/pack.ts): kept for the app's lifetime so
//                   a board switch or a later visit reuses them, and never disposed here.
//   board-owned     one board's instance materials (normal and highlight) and its key light with the light's shadow map
//                   (createBoard): released once a rebuilt board has replaced it in the scene, or when the viewport closes.
//   renderer-owned  the PMREM environment render target whose texture lights the scene (createEnvironment): released with
//                   the viewport. The light-card scene it is rendered from is released as soon as the environment exists.
// Owners register when the frame loop adopts them, never during render, so `owned()` lists exactly what is live.
import {
  Color, DirectionalLight, DoubleSide, Group, Mesh, MeshBasicMaterial, MeshPhysicalMaterial, PlaneGeometry, PMREMGenerator, Scene,
  type Material, type Texture, type WebGLRenderer,
} from 'three';
import type { LightSpec, LoadedPack, Vec3 } from '../assets/pack';
import type { StudioVariant } from '../../../lib/router';

export type Owner = { label: string; dispose(): void };

const live = new Set<Owner>();

export function own(label: string, release: () => void): Owner {
  const owner: Owner = { label, dispose: () => { if (live.delete(owner)) release(); } };
  live.add(owner);
  return owner;
}

export const owned = (): string[] => [...live].map((o) => o.label).sort();

const SELECT_COLOR = new Color('#55aaa4');
export const direction = (azimuthDeg: number, elevationDeg: number): Vec3 => {
  const az = (azimuthDeg * Math.PI) / 180, el = (elevationDeg * Math.PI) / 180;
  return [Math.cos(el) * Math.sin(az), Math.sin(el), Math.cos(el) * Math.cos(az)]; // CAD spherical -> runtime basis
};

export type Board = {
  variant: StudioVariant; ids: ReadonlySet<string>; roots: Map<string, Group>; normal: Map<Mesh, Material>; highlighted: Map<Mesh, Material>;
  keyLight: DirectionalLight; release(): void;
};

// One board's scene content. Instance roots clone the pack's part nodes, sharing their geometry (pack-cached); the
// materials and the key light are new and belong to this board.
export function createBoard(pack: LoadedPack, variant: StudioVariant): Board {
  const materials = new Map<string, MeshPhysicalMaterial>(), highlight = new Map<string, MeshPhysicalMaterial>();
  for (const [id, m] of Object.entries(pack.manifest.materials)) {
    const base = new MeshPhysicalMaterial({ color: new Color(...m.baseColor), metalness: m.metallic, roughness: m.roughness,
      clearcoat: m.clearcoat ?? 0, clearcoatRoughness: m.clearcoatRoughness ?? 0 });
    base.name = id;
    materials.set(id, base);
    const lit = base.clone();
    lit.emissive = SELECT_COLOR;
    lit.emissiveIntensity = 0.2; // a tint, not a wash: the finishes stay readable while selected
    highlight.set(id, lit);
  }
  const roots = new Map<string, Group>(), normal = new Map<Mesh, Material>(), highlighted = new Map<Mesh, Material>();
  for (const id of Object.keys(pack.manifest.variants[variant].tray.instances)) {
    const definitionId = pack.manifest.instances[id].definitionId;
    const root = new Group();
    root.name = id;
    root.userData = { instanceId: id, definitionId };
    root.add(pack.definitions.get(definitionId)!.clone());
    root.traverse((o) => {
      if (!(o instanceof Mesh)) return;
      const materialId = (o.material as Material).userData.materialId as string;
      o.material = materials.get(materialId)!;
      normal.set(o, materials.get(materialId)!);
      highlighted.set(o, highlight.get(materialId)!);
    });
    roots.set(id, root);
  }
  // The key light's shadow rig depends only on the pack and board, so it survives step changes with its shadow map.
  const key = pack.manifest.lighting.lights.find((l) => l.id === 'key')!;
  const kd = direction(key.azimuthDeg, key.elevationDeg), centre = pack.manifest.variants[variant].tray.camera.targetM;
  const keyLight = new DirectionalLight(new Color(...key.color), 0.9);
  keyLight.position.set(centre[0] + kd[0] * 1.5, centre[1] + kd[1] * 1.5, centre[2] + kd[2] * 1.5);
  keyLight.target.position.set(...centre);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(2048, 2048);
  keyLight.shadow.radius = 5;
  keyLight.shadow.bias = -0.0002;
  keyLight.shadow.normalBias = 0.0004;
  Object.assign(keyLight.shadow.camera, { left: -0.45, right: 0.45, top: 0.45, bottom: -0.45, near: 0.5, far: 2.6 });
  return {
    variant, ids: new Set(roots.keys()), roots, normal, highlighted, keyLight,
    release: () => {
      for (const m of [...materials.values(), ...highlight.values()]) m.dispose();
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
