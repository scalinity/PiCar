// GPU resource ownership (F10): releasing a board disposes exactly what the board created, never the pack-cached geometry
// and source materials the next board and the next visit reuse; an owner releases once and leaves the registry.
import { expect, it, vi } from 'vitest';
import { BoxGeometry, Group, Mesh, MeshStandardMaterial } from 'three';
import { createBoard, own, owned } from '../../src/features/assembly-3d/scene/resources';
import type { LoadedPack } from '../../src/features/assembly-3d/assets/pack';

function tinyPack(): { pack: LoadedPack; geometry: BoxGeometry; source: MeshStandardMaterial } {
  const geometry = new BoxGeometry(0.01, 0.01, 0.01), source = new MeshStandardMaterial();
  source.userData.materialId = 'steel';
  const part = new Group().add(new Mesh(geometry, source));
  const camera = { positionM: [0, 0.2, 0.4], targetM: [0, 0, 0], verticalFovDeg: 30 };
  const manifest = {
    materials: { steel: { label: 'steel', basis: 'test', baseColor: [0.5, 0.5, 0.5], metallic: 1, roughness: 0.3 } },
    lighting: { lights: [{ id: 'key', azimuthDeg: 30, elevationDeg: 40, distanceM: 1, sizeM: [0.5, 0.5], color: [1, 1, 1], runtimeIntensity: 1 }] },
    instances: { 'PX-A-001': { definitionId: 'PX-DEF-A' }, 'PX-A-002': { definitionId: 'PX-DEF-A' } },
    variants: { rpi5: { tray: { camera, instances: { 'PX-A-001': {}, 'PX-A-002': {} } } } },
  };
  return { pack: { manifest, definitions: new Map([['PX-DEF-A', part]]) } as unknown as LoadedPack, geometry, source };
}

it('releases every board material and the key light shadow, and never the pack-cached geometry or source material', () => {
  const { pack, geometry, source } = tinyPack();
  const board = createBoard(pack, 'rpi5');
  const materials = new Set([...board.normal.values(), ...board.highlighted.values()]);
  const spies = [...materials].map((m) => vi.spyOn(m, 'dispose'));
  const light = vi.spyOn(board.keyLight, 'dispose');
  const shared = [vi.spyOn(geometry, 'dispose'), vi.spyOn(source, 'dispose')];
  expect(materials.size).toBe(2); // one normal and one highlight material for the one material id
  for (const root of board.roots.values()) root.traverse((o) => { if (o instanceof Mesh) expect(o.geometry).toBe(geometry); });
  board.release();
  for (const spy of spies) expect(spy).toHaveBeenCalledTimes(1);
  expect(light).toHaveBeenCalledTimes(1);
  for (const spy of shared) expect(spy).not.toHaveBeenCalled();
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
