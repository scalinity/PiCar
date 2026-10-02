// Diagnostics only: how many pixels of each tray slot are visible from the current camera, inside the uncovered framing
// area. Every part and tile is drawn once in its own flat colour into an offscreen target and the pixels are counted,
// so a part hidden behind another, outside the view or under a panel counts zero. Everything the census creates is
// released before it returns, and the board's own materials are restored.
import { Color, LinearSRGBColorSpace, Mesh, MeshBasicMaterial, NoToneMapping, Vector2, WebGLRenderTarget, type Material } from 'three';
import type { ViewportApi } from './StudioScene';

export function pixelCensus(vp: ViewportApi, insetsCss: number[]): Record<string, number> {
  const board = vp.board();
  if (!board) return {};
  const { gl, scene, camera } = vp;
  const size = gl.getDrawingBufferSize(new Vector2()), dpr = gl.getPixelRatio();
  const target = new WebGLRenderTarget(size.x, size.y);
  const ids = [...board.roots.keys(), ...board.tiles.keys()];
  const saved = new Map<Mesh, Material>(), flats: MeshBasicMaterial[] = [];
  ids.forEach((id, i) => {
    const n = i + 1, flat = new MeshBasicMaterial({ toneMapped: false, color: new Color().setRGB((n & 255) / 255, ((n >> 8) & 255) / 255, 0, LinearSRGBColorSpace) });
    flats.push(flat);
    (board.roots.get(id) ?? board.tiles.get(id))!.traverse((o) => { if (o instanceof Mesh && !o.userData.pickTarget) { saved.set(o, o.material as Material); o.material = flat; } });
  });
  const toneMapping = gl.toneMapping, environment = scene.environment;
  const pixels = new Uint8Array(size.x * size.y * 4);
  try {
    gl.toneMapping = NoToneMapping;
    scene.environment = null;
    gl.setRenderTarget(target);
    gl.setClearColor(0x000000, 0);
    gl.clear();
    gl.render(scene, camera);
    gl.readRenderTargetPixels(target, 0, 0, size.x, size.y, pixels);
  } finally {
    gl.setRenderTarget(null);
    gl.toneMapping = toneMapping;
    scene.environment = environment;
    for (const [mesh, material] of saved) mesh.material = material;
    for (const flat of flats) flat.dispose();
    target.dispose();
    vp.invalidate();
  }
  // Count only the uncovered framing area (insets are CSS px: left, top, right, bottom; render-target rows run bottom-up).
  const [l, t, r, b] = insetsCss.map((x) => Math.round(x * dpr));
  const counts = new Array<number>(ids.length + 1).fill(0);
  for (let y = b; y < size.y - t; y++) for (let x = l; x < size.x - r; x++) {
    const k = (y * size.x + x) * 4;
    if (pixels[k + 3] === 0 || pixels[k + 2] !== 0) continue;
    const n = pixels[k] + (pixels[k + 1] << 8);
    if (n > 0 && n <= ids.length) counts[n]++;
  }
  return Object.fromEntries(ids.map((id, i) => [id, counts[i + 1]]));
}
