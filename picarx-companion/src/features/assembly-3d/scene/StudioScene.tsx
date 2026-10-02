// The Studio viewport. One frame driver applies the pure motion evaluator to instance roots; React never
// re-renders per frame. Wiring uses onCreated and ref callbacks with cleanup, not effects. GPU resources follow the
// ownership classes in resources.ts.
import { Canvas, extend, useFrame, useThree, type ThreeElement } from '@react-three/fiber';
import { useCallback, useMemo } from 'react';
import { AgXToneMapping, Box3, Mesh, PCFShadowMap, PerspectiveCamera, Vector3 } from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import type { LoadedPack, StudioCamera } from '../assets/pack';
import { statesAt, timelineFor, type Timeline } from '../motion/evaluate';
import { advance, enterStep, getStudioState, select, studioKey, subscribeStudio, yieldCamera } from '../state/studio-store';
import { governDpr, perf, recordFrame, setRendererInfo } from '../state/perf';
import { createBoard, createEnvironment, own, type Board, type Owner } from './resources';
import type { Scene, WebGLRenderer } from 'three';
import type { StudioVariant } from '../../../lib/router';

extend({ OrbitControls });
declare module '@react-three/fiber' {
  interface ThreeElements { orbitControls: ThreeElement<typeof OrbitControls> }
}

type Tween = { from: [Vector3, Vector3]; to: [Vector3, Vector3]; start: number; seconds: number } | null;
const ease = (x: number): number => 1 - Math.pow(1 - x, 3);

export type ViewportApi = { controls: OrbitControls; camera: PerspectiveCamera; scene: Scene; gl: WebGLRenderer; invalidate: () => void; setDpr: (dpr: number) => void; frame: (seconds: number) => Promise<number[]> };
let viewport: ViewportApi | null = null;
export const getViewport = (): ViewportApi | null => viewport;

function Driver({ pack, variant, step, board, timeline, guided }: { pack: LoadedPack; variant: StudioVariant; step: number; board: Board; timeline: Timeline; guided: StudioCamera }) {
  // Stable selections only: a resize or pixel-ratio change must not re-render the driver or re-bind its controls.
  const camera = useThree((s) => s.camera), gl = useThree((s) => s.gl), scene = useThree((s) => s.scene);
  const invalidate = useThree((s) => s.invalidate), setDpr = useThree((s) => s.setDpr);
  const memory = useMemo(() => ({
    cameraRequest: -1, focusRequest: 0, tween: null as Tween, selection: null as string | null, controls: null as OrbitControls | null, settleFrames: 0,
    requestedNext: false, interacting: false, diagnosing: false, // what makes a frame interval active (perf.ts)
    adopted: null as Board | null, boardOwner: null as Owner | null, closing: undefined as ReturnType<typeof setTimeout> | undefined,
    openingTarget: guided.targetM, // the view the viewport opens on; afterwards only explicit requests move the target
  }), []);
  const variantEntry = pack.manifest.variants[variant];

  useFrame((state, dt) => {
    const now = performance.now();
    recordFrame(now, memory.requestedNext || memory.interacting || memory.diagnosing);
    let again = false; // this frame asks for the next one
    setRendererInfo(gl.info.render.calls, gl.info.render.triangles, state.viewport.dpr, state.size.width, state.size.height);
    const dpr = governDpr(state.viewport.dpr);
    if (dpr !== state.viewport.dpr) setDpr(dpr);
    // A rebuilt board (a board switch) is in the scene now; the one it replaced is not, so its resources are released,
    // and its roots start with normal materials, so a retained selection is highlighted again.
    if (memory.adopted !== board) {
      memory.boardOwner?.dispose();
      memory.boardOwner = own(`board ${board.variant}`, board.release);
      memory.adopted = board;
      memory.selection = null;
    }
    const key = studioKey(variant, step);
    enterStep(key, timeline.duration, board.ids);
    advance(Math.min(dt, 0.1), timeline.duration);
    const s = getStudioState();
    for (const [id, st] of statesAt(variantEntry, timeline, s.t)) {
      const root = board.roots.get(id);
      if (!root) continue;
      root.position.set(...st.pose.translationM);
      root.quaternion.set(...st.pose.rotationXYZW);
      root.userData.phase = st.phase;
    }
    if (s.selection !== memory.selection) {
      for (const id of [memory.selection, s.selection]) {
        const root = id ? board.roots.get(id) : undefined;
        root?.traverse((o) => { if (o instanceof Mesh) o.material = (id === s.selection ? board.highlighted : board.normal).get(o)!; });
      }
      memory.selection = s.selection;
    }
    const controls = memory.controls;
    if (controls) {
      if (s.cameraRequest !== memory.cameraRequest) {
        memory.cameraRequest = s.cameraRequest;
        memory.tween = { from: [camera.position.clone(), controls.target.clone()], to: [new Vector3(...guided.positionM), new Vector3(...guided.targetM)], start: now, seconds: memory.cameraRequest === 1 ? 0 : 0.9 };
      }
      if (s.focusRequest !== memory.focusRequest) {
        memory.focusRequest = s.focusRequest;
        // Only a part that is in the active scene can be framed; any other request is consumed without effect.
        const root = s.selection ? board.roots.get(s.selection) : undefined;
        if (root?.parent) {
          const box = new Box3().setFromObject(root), centre = box.getCenter(new Vector3());
          const radius = Math.max(box.getSize(new Vector3()).length() / 2, 0.012);
          const dir = camera.position.clone().sub(controls.target).normalize();
          const distance = (radius * 1.6) / Math.sin(((camera as PerspectiveCamera).fov * Math.PI) / 360);
          memory.tween = { from: [camera.position.clone(), controls.target.clone()], to: [centre.clone().addScaledVector(dir, distance), centre], start: now, seconds: 0.7 };
        }
      }
      if (memory.tween) {
        const k = memory.tween.seconds === 0 ? 1 : Math.min(1, (now - memory.tween.start) / (memory.tween.seconds * 1000));
        camera.position.lerpVectors(memory.tween.from[0], memory.tween.to[0], ease(k));
        controls.target.lerpVectors(memory.tween.from[1], memory.tween.to[1], ease(k));
        if (k >= 1) memory.tween = null;
      }
      // After the user lets go, damping keeps easing the view; render until it has run out, so the remaining inertia
      // lands as part of the gesture and not on some later, unrelated redraw (a resize, a pixel-ratio change).
      const settling = memory.settleFrames > 0;
      if (settling) memory.settleFrames--;
      if (controls.update() || memory.tween || settling) again = true;
    }
    if (s.playing) again = true;
    memory.requestedNext = again;
    if (again) invalidate();
  });

  // Bound once per controls instance. The target is set here only when the viewport opens; later it changes only by
  // user input, focus, reset or a resumed guided view, never because React re-rendered or the canvas resized.
  const bindControls = useCallback((controls: OrbitControls | null) => {
    if (!controls) return;
    clearTimeout(memory.closing); // React re-binds within one commit (StrictMode); a closing viewport never does
    memory.controls = controls;
    controls.enableDamping = true;
    controls.dampingFactor = 0.12;
    controls.screenSpacePanning = true;
    controls.minDistance = 0.05;
    controls.maxDistance = 3;
    controls.target.set(...memory.openingTarget);
    const onStart = () => { memory.tween = null; memory.interacting = true; yieldCamera(); };
    const onChange = () => invalidate();
    // Damping decays by (1 - dampingFactor) per update: 120 updates leave 0.88^120 (about 2e-7) of the release motion.
    const onEnd = () => { memory.interacting = false; memory.settleFrames = 120; invalidate(); };
    controls.addEventListener('start', onStart);
    controls.addEventListener('change', onChange);
    controls.addEventListener('end', onEnd);
    // The demand frame loop draws only when asked: any presentation change (scrub, step, selection) asks once.
    const unsubscribe = subscribeStudio(onChange);
    viewport = {
      controls, camera: camera as PerspectiveCamera, scene, gl, invalidate, setDpr,
      // Diagnostics: orbit continuously for `seconds` and return every frame interval in milliseconds.
      frame: (seconds) => new Promise((resolve) => {
        const times: number[] = [];
        let last = performance.now();
        const end = last + seconds * 1000;
        const tick = () => {
          const now = performance.now();
          times.push(now - last);
          last = now;
          const offset = camera.position.clone().sub(controls.target);
          offset.applyAxisAngle(new Vector3(0, 1, 0), 0.01);
          camera.position.copy(controls.target).add(offset);
          invalidate();
          if (now < end) requestAnimationFrame(tick); else { memory.diagnosing = false; resolve(times.slice(2)); }
        };
        memory.diagnosing = true;
        requestAnimationFrame(tick);
      }),
    };
    return () => {
      controls.removeEventListener('start', onStart);
      controls.removeEventListener('change', onChange);
      controls.removeEventListener('end', onEnd);
      unsubscribe();
      viewport = null;
      memory.controls = null;
      // The viewport is closing: release the board and the environment it owns once React has finished re-binding.
      memory.closing = setTimeout(() => {
        memory.boardOwner?.dispose();
        memory.boardOwner = null;
        memory.adopted = null;
        (scene.userData.environmentOwner as Owner | undefined)?.dispose();
      }, 0);
    };
  }, [camera, gl, scene, invalidate, setDpr, memory]);

  return <orbitControls ref={bindControls} args={[camera, gl.domElement]} />;
}

function Floor({ y }: { y: number }) {
  return (
    <mesh rotation-x={-Math.PI / 2} position-y={y} receiveShadow>
      <planeGeometry args={[4, 4]} />
      <shadowMaterial transparent opacity={0.34} />
    </mesh>
  );
}

let downAt: [number, number] = [0, 0];

export function StudioScene({ pack, variant, step }: { pack: LoadedPack; variant: StudioVariant; step: number }) {
  const board = useMemo(() => createBoard(pack, variant), [pack, variant]);
  const timeline = useMemo(() => timelineFor(pack.manifest.variants[variant], step, pack.manifest.timing), [pack, variant, step]);
  const v = pack.manifest.variants[variant];
  const guided = (step === 0 ? v.tray.camera : v.steps[step - 1].camera) ?? v.tray.camera;

  return (
    <Canvas
      frameloop="demand"
      dpr={[1, 2]}
      shadows={{ type: PCFShadowMap }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      camera={{ fov: guided.verticalFovDeg, near: 0.005, far: 30, position: guided.positionM }}
      onCreated={({ gl, scene }) => {
        gl.toneMapping = AgXToneMapping;
        gl.toneMappingExposure = 1;
        gl.setClearColor(0x000000, 0);
        const environment = createEnvironment(gl, pack.manifest.lighting.lights, pack.manifest.lighting.runtimeEnvironmentBase);
        scene.environment = environment.texture;
        scene.userData.environmentOwner = own('renderer environment', environment.release);
        perf.canvasAt ??= performance.now(); // the canvas exists; nothing is drawn yet
      }}
      onPointerDown={(e) => { downAt = [e.clientX, e.clientY]; }}
      onPointerMissed={(e) => { if (Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]) < 4) select(null); }}
    >
      <primitive object={board.keyLight} />
      <primitive object={board.keyLight.target} />
      <Floor y={v.floorYM} />
      {/* A prop that changes with the step makes the demand frame loop render once, so the new timeline starts. */}
      <group name={studioKey(variant, step)} />
      {[...board.roots.entries()].map(([id, root]) => (
        <primitive key={id} object={root}
          onClick={(e: { delta: number; stopPropagation: () => void }) => { if (e.delta > 4) return; e.stopPropagation(); select(id); }}
          onPointerOver={(e: { stopPropagation: () => void }) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
          onPointerOut={() => { document.body.style.cursor = ''; }} />
      ))}
      <Driver pack={pack} variant={variant} step={step} board={board} timeline={timeline} guided={guided} />
    </Canvas>
  );
}
