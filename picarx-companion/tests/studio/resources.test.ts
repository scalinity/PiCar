// GPU resource ownership (F10): releasing a board disposes exactly what the board created, never the pack-cached geometry
// and source materials the next board and the next visit reuse; an owner releases once and leaves the registry.
// Inspection (ghost, isolate, clip) acts only on the board's own copies.
import { expect, it, vi } from 'vitest';
import { BoxGeometry, BufferGeometry, Group, LineLoop, Mesh, MeshStandardMaterial, type Material } from 'three';
import { createBoard, own, owned } from '../../src/features/assembly-3d/scene/resources';
import type { LoadedPack } from '../../src/features/assembly-3d/assets/pack';

function tinyPack(): { pack: LoadedPack; geometry: BoxGeometry; source: MeshStandardMaterial } {
  const geometry = new BoxGeometry(0.004, 0.004, 0.004), source = new MeshStandardMaterial();
  source.userData.materialId = 'steel';
  const part = new Group().add(new Mesh(geometry, source));
  const camera = { positionM: [0, 0.2, 0.4], targetM: [0, 0, 0], verticalFovDeg: 30 };
  const manifest = {
    materials: { steel: { label: 'steel', basis: 'test', baseColor: [0.5, 0.5, 0.5], metallic: 1, roughness: 0.3 } },
    lighting: { lights: [{ id: 'key', azimuthDeg: 30, elevationDeg: 40, distanceM: 1, sizeM: [0.5, 0.5], color: [1, 1, 1], runtimeIntensity: 1 }] },
    definitions: { 'PX-DEF-A': { boundsM: { min: [-0.002, -0.002, -0.002], max: [0.002, 0.002, 0.002] } } }, // small: gets a pick target
    instances: { 'PX-A-001': { definitionId: 'PX-DEF-A' }, 'PX-A-002': { definitionId: 'PX-DEF-A' } },
    variants: { rpi5: { floorYM: 0, centreM: [0, 0, 0], tray: { camera, instances: { 'PX-A-001': {}, 'PX-A-002': {} },
      tiles: { 'PX-T-001': { centreM: [0.1, 0, 0], halfExtentsM: [0.01, 0.02] } } } } },
  };
  return { pack: { manifest, definitions: new Map([['PX-DEF-A', part]]) } as unknown as LoadedPack, geometry, source };
}

const boardGeometries = (board: ReturnType<typeof createBoard>, shared: BufferGeometry): BufferGeometry[] => {
  const out = new Set<BufferGeometry>();
  for (const root of [...board.roots.values(), ...board.tiles.values()]) root.traverse((o) => { if ((o instanceof Mesh || o instanceof LineLoop) && o.geometry !== shared) out.add(o.geometry); });
  return [...out];
};

it('releases every board material, tile and pick target and the key light shadow, and never the pack-cached geometry or source material', () => {
  const { pack, geometry, source } = tinyPack();
  const board = createBoard(pack, 'rpi5');
  const materials = new Set<Material>(board.materials());
  // normal, selected, review focus and ghost for the one material id; the pick target; tile face (normal, ghost) and edges (3)
  expect(materials.size).toBe(4 + 1 + 2 + 3);
  const geometries = boardGeometries(board, geometry);
  expect(geometries.length).toBe(1 + 2); // one pick box shared by both small instances, the tile face and edge
  const spies = [...materials, ...geometries].map((r) => vi.spyOn(r, 'dispose'));
  const light = vi.spyOn(board.keyLight, 'dispose');
  const shared = [vi.spyOn(geometry, 'dispose'), vi.spyOn(source, 'dispose')];
  for (const root of board.roots.values()) root.traverse((o) => { if (o instanceof Mesh && !o.userData.pickTarget) expect(o.geometry).toBe(geometry); });
  board.release();
  for (const spy of spies) expect(spy).toHaveBeenCalledTimes(1);
  expect(light).toHaveBeenCalledTimes(1);
  for (const spy of shared) expect(spy).not.toHaveBeenCalled();
});

it('ghosts, isolates and clips the board copies only, and returns every part to its normal state', () => {
  const { pack, source } = tinyPack();
  const board = createBoard(pack, 'rpi5');
  const meshOf = (id: string) => { let m: Mesh | undefined; board.roots.get(id)!.traverse((o) => { if (o instanceof Mesh && !o.userData.pickTarget) m = o; }); return m!; };
  const normal = meshOf('PX-A-001').material as MeshStandardMaterial;
  board.style('PX-A-001', 'ghost');
  expect((meshOf('PX-A-001').material as Material).transparent).toBe(true);
  board.style('PX-A-002', 'hidden');
  board.roots.get('PX-A-002')!.traverse((o) => expect(o.layers.isEnabled(0)).toBe(false)); // not drawn, picked or shadowed
  board.setClip({ heightM: 0.01, trayGuardX: -0.1 });
  for (const m of board.materials().filter((x) => x instanceof MeshStandardMaterial && !x.transparent)) expect(m.clippingPlanes?.length ?? 0).toBeLessThanOrEqual(2);
  expect(source.transparent).toBe(false);
  expect(source.clippingPlanes).toBeNull();
  board.style('PX-A-001', 'normal');
  board.style('PX-A-002', 'normal');
  board.setClip(null);
  expect(meshOf('PX-A-001').material).toBe(normal);
  expect(normal.clippingPlanes).toBeNull();
  board.roots.get('PX-A-002')!.traverse((o) => expect(o.layers.isEnabled(0)).toBe(true));
  board.release();
});

it('releases an owner once and removes it from the live registry', () => {
  const release = vi.fn();
  const owner = own('board test', release);
  expect(owned()).toContain('board test');
  owner.dispose();
  owner.dispose();
  expect(release).toHaveBeenCalledTimes(1);
  expect(owned()).not.toContain('board test');
});

it('clips actual ray intersections and invisible pick boxes, keeps tray picking and restores picking on reset', async () => {
  const { Raycaster, Vector3 } = await import('three');
  const { pack } = tinyPack();
  const board = createBoard(pack, 'rpi5'), root = board.roots.get('PX-A-001')!;
  root.position.set(0, 0.02, 0); root.updateMatrixWorld(true);
  const ray = new Raycaster(new Vector3(0, 0.1, 0), new Vector3(0, -1, 0));
  expect(ray.intersectObject(root, true).length).toBeGreaterThan(0);
  board.style('PX-A-001', 'ghost');
  board.setClip({ heightM: 0.01, trayGuardX: -0.1 });
  expect(ray.intersectObject(root, true)).toEqual([]); // every surface and pick box is above the cut
  root.position.x = -0.2; root.updateMatrixWorld(true); ray.ray.origin.x = -0.2;
  expect(ray.intersectObject(root, true).length).toBeGreaterThan(0); // tray side of guard
  root.position.x = 0; root.updateMatrixWorld(true); ray.ray.origin.x = 0;
  board.setClip(null); board.style('PX-A-001', 'normal');
  expect(ray.intersectObject(root, true).length).toBeGreaterThan(0);
  board.release();
});
