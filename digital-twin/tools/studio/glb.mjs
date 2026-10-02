// Minimal glTF 2.0 binary writer for Studio part definitions: one root node per definition at identity,
// one primitive per CAD solid, core PBR materials, no images, no animations, no extensions.
const pad4 = (n) => (n + 3) & ~3;

export function writeGlb({ asset, materials, definitions }) {
  const chunks = [];
  let byteLength = 0;
  const bufferViews = [];
  const accessors = [];

  function addView(typed, target) {
    const bytes = new Uint8Array(typed.buffer, typed.byteOffset, typed.byteLength);
    const offset = byteLength;
    chunks.push({ offset, bytes });
    byteLength = pad4(offset + bytes.byteLength);
    bufferViews.push({ buffer: 0, byteOffset: offset, byteLength: bytes.byteLength, target });
    return bufferViews.length - 1;
  }

  function addAccessor(typed, { type, componentType, target, minMax }) {
    const view = addView(typed, target);
    const width = type === 'VEC3' ? 3 : 1;
    const accessor = { bufferView: view, componentType, count: typed.length / width, type };
    if (minMax) {
      const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
      for (let i = 0; i < typed.length; i += 3) for (let k = 0; k < 3; k++) {
        min[k] = Math.min(min[k], typed[i + k]);
        max[k] = Math.max(max[k], typed[i + k]);
      }
      accessor.min = min;
      accessor.max = max;
    }
    accessors.push(accessor);
    return accessors.length - 1;
  }

  const materialIndex = new Map(materials.map((m, i) => [m.id, i]));
  const meshes = [];
  const nodes = [];
  for (const def of definitions) {
    const primitives = def.solids.map((solid) => {
      const position = addAccessor(solid.positions, { type: 'VEC3', componentType: 5126, target: 34962, minMax: true });
      const normal = addAccessor(solid.normals, { type: 'VEC3', componentType: 5126, target: 34962 });
      const small = solid.positions.length / 3 <= 65535;
      const indices = addAccessor(small ? Uint16Array.from(solid.indices) : solid.indices, { type: 'SCALAR', componentType: small ? 5123 : 5125, target: 34963 });
      return { attributes: { POSITION: position, NORMAL: normal }, indices, material: materialIndex.get(solid.materialId), mode: 4,
        extras: { solidIndex: solid.index, materialId: solid.materialId } };
    });
    meshes.push({ name: def.id, primitives });
    nodes.push({ name: def.id, mesh: meshes.length - 1, extras: def.extras });
  }

  const json = {
    asset,
    scene: 0,
    scenes: [{ name: 'studio-part-definitions', nodes: nodes.map((_, i) => i) }],
    nodes,
    meshes,
    materials: materials.map((m) => ({
      name: m.id,
      pbrMetallicRoughness: { baseColorFactor: [...m.baseColor, 1], metallicFactor: m.metallic, roughnessFactor: m.roughness },
      extras: { materialId: m.id },
    })),
    accessors,
    bufferViews,
    buffers: [{ byteLength }],
  };

  const bin = new Uint8Array(byteLength);
  for (const { offset, bytes } of chunks) bin.set(bytes, offset);
  const jsonBytes = new TextEncoder().encode(JSON.stringify(json));
  const jsonLength = pad4(jsonBytes.byteLength);
  const total = 12 + 8 + jsonLength + 8 + byteLength;
  const out = new Uint8Array(total);
  const view = new DataView(out.buffer);
  view.setUint32(0, 0x46546c67, true); // 'glTF'
  view.setUint32(4, 2, true);
  view.setUint32(8, total, true);
  view.setUint32(12, jsonLength, true);
  view.setUint32(16, 0x4e4f534a, true); // 'JSON'
  out.set(jsonBytes, 20);
  out.fill(0x20, 20 + jsonBytes.byteLength, 20 + jsonLength);
  view.setUint32(20 + jsonLength, byteLength, true);
  view.setUint32(24 + jsonLength, 0x004e4942, true); // 'BIN\0'
  out.set(bin, 28 + jsonLength);
  return out;
}

export function readGlb(bytes) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (view.getUint32(0, true) !== 0x46546c67 || view.getUint32(4, true) !== 2) throw Error('GLB_HEADER');
  const jsonLength = view.getUint32(12, true);
  const json = JSON.parse(new TextDecoder().decode(bytes.subarray(20, 20 + jsonLength)));
  const binLength = view.getUint32(20 + jsonLength, true);
  const bin = bytes.subarray(28 + jsonLength, 28 + jsonLength + binLength);
  const read = (accessorIndex) => {
    const a = json.accessors[accessorIndex], v = json.bufferViews[a.bufferView];
    const width = a.type === 'VEC3' ? 3 : 1;
    const Type = { 5126: Float32Array, 5123: Uint16Array, 5125: Uint32Array }[a.componentType];
    const copy = bin.slice(v.byteOffset, v.byteOffset + a.count * width * Type.BYTES_PER_ELEMENT);
    return new Type(copy.buffer);
  };
  return { json, read };
}
