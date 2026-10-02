// The one place the Studio converts CAD data into the runtime basis.
// CAD: right-handed millimetres, +X robot forward, +Y robot left, +Z up (DIGITAL_TWIN_DATA_MODEL.md).
// Runtime: right-handed metres, +Y up, +Z forward (glTF). p_runtime = 0.001 * C * p_cad.
export const C = [[0, 1, 0], [0, 0, 1], [1, 0, 0]];
export const SCALE = 0.001;
export const RUNTIME_BASIS = 'RH-YUP-ZFORWARD';
export const CAD_BASIS = 'RH-XFORWARD-YLEFT-ZUP';

// C is the cyclic permutation sigma = (0->1, 1->2, 2->0): row i of C picks CAD axis sigma(i).
const SIGMA = [1, 2, 0];

export const pointToRuntime = (p) => SIGMA.map((k) => p[k] * SCALE);
export const directionToRuntime = (d) => SIGMA.map((k) => d[k]);
export const pointToCad = (p) => [p[2] / SCALE, p[0] / SCALE, p[1] / SCALE];

// Pose world = R p + t in CAD becomes (C R C^T, 0.001 C t) in the runtime basis.
export const rotationToRuntime = (R) => SIGMA.map((i) => SIGMA.map((j) => R[i][j]));
export const rotationToCad = (Q) => [[Q[2][2], Q[2][0], Q[2][1]], [Q[0][2], Q[0][0], Q[0][1]], [Q[1][2], Q[1][0], Q[1][1]]];

export function quaternionFromMatrix(m) {
  const [[a, b, c], [d, e, f], [g, h, i]] = m;
  const trace = a + e + i;
  let x, y, z, w;
  if (trace > 0) {
    const s = 0.5 / Math.sqrt(trace + 1);
    w = 0.25 / s; x = (h - f) * s; y = (c - g) * s; z = (d - b) * s;
  } else if (a > e && a > i) {
    const s = 2 * Math.sqrt(1 + a - e - i);
    w = (h - f) / s; x = 0.25 * s; y = (b + d) / s; z = (c + g) / s;
  } else if (e > i) {
    const s = 2 * Math.sqrt(1 + e - a - i);
    w = (c - g) / s; x = (b + d) / s; y = 0.25 * s; z = (f + h) / s;
  } else {
    const s = 2 * Math.sqrt(1 + i - a - e);
    w = (d - b) / s; x = (c + g) / s; y = (f + h) / s; z = 0.25 * s;
  }
  const n = Math.hypot(x, y, z, w);
  const q = [x / n, y / n, z / n, w / n];
  // One canonical sign so equal rotations always serialize identically.
  return q[3] < 0 || (q[3] === 0 && q.find((v) => v !== 0) < 0) ? q.map((v) => (v === 0 ? 0 : -v)) : q;
}

export function matrixFromQuaternion([x, y, z, w]) {
  return [
    [1 - 2 * (y * y + z * z), 2 * (x * y - z * w), 2 * (x * z + y * w)],
    [2 * (x * y + z * w), 1 - 2 * (x * x + z * z), 2 * (y * z - x * w)],
    [2 * (x * z - y * w), 2 * (y * z + x * w), 1 - 2 * (x * x + y * y)],
  ];
}

// A closure pose {rotation, translationMm} -> runtime pose {translationM, rotationXYZW}.
export const poseToRuntime = (pose) => ({
  translationM: pointToRuntime(pose.translationMm),
  rotationXYZW: quaternionFromMatrix(rotationToRuntime(pose.rotation)),
});

export function isProperRotation(R, tol = 1e-10) {
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
    let dot = 0;
    for (let k = 0; k < 3; k++) dot += R[k][i] * R[k][j];
    if (Math.abs(dot - (i === j ? 1 : 0)) > tol) return false;
  }
  const det = R[0][0] * (R[1][1] * R[2][2] - R[1][2] * R[2][1]) - R[0][1] * (R[1][0] * R[2][2] - R[1][2] * R[2][0]) + R[0][2] * (R[1][0] * R[2][1] - R[1][1] * R[2][0]);
  return Math.abs(det - 1) < tol;
}
