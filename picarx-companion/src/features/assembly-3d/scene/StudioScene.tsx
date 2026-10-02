// The Studio viewport. One frame driver applies the pure motion evaluator to instance roots; React never
// re-renders per frame. Wiring uses onCreated and ref callbacks with cleanup, not effects.
import { Canvas, extend, useFrame, useThree, type ThreeElement } from '@react-three/fiber';
import { useMemo } from 'react';
import {
  AgXToneMapping, Box3, Color, DirectionalLight, DoubleSide, Group, Mesh, MeshBasicMaterial, MeshPhysicalMaterial, PCFShadowMap,
  PerspectiveCamera, PlaneGeometry, PMREMGenerator, Scene, Vector3, type Material, type Texture, type WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import type { LightSpec, LoadedPack, StudioCamera, Vec3 } from '../assets/pack';
import { statesAt, timelineFor, type Timeline } from '../motion/evaluate';
import { advance, enterStep, getStudioState, select, studioKey, subscribeStudio, yieldCamera } from '../state/studio-store';
import { governDpr, perf, recordFrame, setRendererInfo } from '../state/perf';
import type { StudioVariant } from '../../../lib/router';

extend({ OrbitControls });
declare module '@react-three/fiber' {
  interface ThreeElements { orbitControls: ThreeElement<typeof OrbitControls> }
}

const SELECT_COLOR = new Color('#55aaa4');
const direction = (azimuthDeg: number, elevationDeg: number): Vec3 => {
  const az = (azimuthDeg * Math.PI) / 180, el = (elevationDeg * Math.PI) / 180;
  return [Math.cos(el) * Math.sin(az), Math.sin(el), Math.cos(el) * Math.cos(az)]; // CAD spherical -> runtime basis
};

// Image-based light from the same rig Blender uses: each area light becomes an emissive rectangle at the
// same direction, distance and size. Environment lighting has no falloff or spread; see the pipeline notes.
function environment(gl: WebGLRenderer, lights: LightSpec[], base: Vec3): Texture {
  const scene = new Scene();
  scene.background = new Color(...base); // dim studio walls: what metal reflects between the light cards
  for (const l of lights) {
    const card = new Mesh(new PlaneGeometry(l.sizeM[0], l.sizeM[1]), new MeshBasicMaterial({ side: DoubleSide, toneMapped: false,
      color: new Color(l.color[0] * l.runtimeIntensity, l.color[1] * l.runtimeIntensity, l.color[2] * l.runtimeIntensity) }));
    const d = direction(l.azimuthDeg, l.elevationDeg);
    card.position.set(d[0] * l.distanceM, d[1] * l.distanceM, d[2] * l.distanceM);
    card.lookAt(0, 0, 0);
    scene.add(card);
  }
  const pmrem = new PMREMGenerator(gl);
  const texture = pmrem.fromScene(scene, 0.015).texture;
  pmrem.dispose();
  return texture;
}

type Instances = { roots: Map<string, Group>; normal: Map<Mesh, Material>; highlighted: Map<Mesh, Material> };

function buildInstances(pack: LoadedPack, variant: StudioVariant): Instances {
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
  return { roots, normal, highlighted };
}

type Tween = { from: [Vector3, Vector3]; to: [Vector3, Vector3]; start: number; seconds: number } | null;
const ease = (x: number): number => 1 - Math.pow(1 - x, 3);

export type ViewportApi = { controls: OrbitControls; camera: PerspectiveCamera; scene: Scene; invalidate: () => void; frame: (seconds: number) => Promise<number[]> };
let viewport: ViewportApi | null = null;
export const getViewport = (): ViewportApi | null => viewport;

function Driver({ pack, variant, step, instances, timeline, guided }: { pack: LoadedPack; variant: StudioVariant; step: number; instances: Instances; timeline: Timeline; guided: StudioCamera }) {
  const { camera, invalidate, gl, size, viewport: vp, setDpr, scene } = useThree();
  const memory = useMemo(() => ({ cameraRequest: -1, focusRequest: 0, tween: null as Tween, selection: null as string | null, controls: null as OrbitControls | null }), []);
  const variantEntry = pack.manifest.variants[variant];

  useFrame((_, dt) => {
    const now = performance.now();
    recordFrame(now);
    setRendererInfo(gl.info.render.calls, gl.info.render.triangles, vp.dpr, size.width, size.height);
    const dpr = governDpr(vp.dpr);
    if (dpr !== vp.dpr) setDpr(dpr);
    const key = studioKey(variant, step);
    enterStep(key, timeline.duration);
    advance(Math.min(dt, 0.1), timeline.duration);
    const s = getStudioState();
    for (const [id, st] of statesAt(variantEntry, timeline, s.t)) {
      const root = instances.roots.get(id)!;
      root.position.set(...st.pose.translationM);
      root.quaternion.set(...st.pose.rotationXYZW);
      root.userData.phase = st.phase;
    }
    if (s.selection !== memory.selection) {
      for (const id of [memory.selection, s.selection]) {
        const root = id ? instances.roots.get(id) : undefined;
        root?.traverse((o) => { if (o instanceof Mesh) o.material = (id === s.selection ? instances.highlighted : instances.normal).get(o)!; });
      }
      memory.selection = s.selection;
    }
    const controls = memory.controls;
    if (controls) {
      if (s.cameraRequest !== memory.cameraRequest) {
        memory.cameraRequest = s.cameraRequest;
        memory.tween = { from: [camera.position.clone(), controls.target.clone()], to: [new Vector3(...guided.positionM), new Vector3(...guided.targetM)], start: now, seconds: memory.cameraRequest === 1 ? 0 : 0.9 };
      }
      if (s.focusRequest !== memory.focusRequest && s.selection) {
        memory.focusRequest = s.focusRequest;
        const box = new Box3().setFromObject(instances.roots.get(s.selection)!), centre = box.getCenter(new Vector3());
        const radius = Math.max(box.getSize(new Vector3()).length() / 2, 0.012);
        const dir = camera.position.clone().sub(controls.target).normalize();
        const distance = (radius * 1.6) / Math.sin(((camera as PerspectiveCamera).fov * Math.PI) / 360);
        memory.tween = { from: [camera.position.clone(), controls.target.clone()], to: [centre.clone().addScaledVector(dir, distance), centre], start: now, seconds: 0.7 };
      }
      if (memory.tween) {
        const k = memory.tween.seconds === 0 ? 1 : Math.min(1, (now - memory.tween.start) / (memory.tween.seconds * 1000));
        camera.position.lerpVectors(memory.tween.from[0], memory.tween.to[0], ease(k));
        controls.target.lerpVectors(memory.tween.from[1], memory.tween.to[1], ease(k));
        if (k >= 1) memory.tween = null;
      }
      if (controls.update() || memory.tween) invalidate();
    }
    if (s.playing) invalidate();
  });

  const bindControls = (controls: OrbitControls | null) => {
    if (!controls) return;
    memory.controls = controls;
    controls.enableDamping = true;
    controls.dampingFactor = 0.12;
    controls.screenSpacePanning = true;
    controls.minDistance = 0.05;
    controls.maxDistance = 3;
    controls.target.set(...guided.targetM);
    const onStart = () => { memory.tween = null; yieldCamera(); };
    const onChange = () => invalidate();
    controls.addEventListener('start', onStart);
    controls.addEventListener('change', onChange);
    // The demand frame loop draws only when asked: any presentation change (scrub, step, selection) asks once.
    const unsubscribe = subscribeStudio(onChange);
    viewport = {
      controls, camera: camera as PerspectiveCamera, scene, invalidate,
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
          if (now < end) requestAnimationFrame(tick); else resolve(times.slice(2));
        };
        requestAnimationFrame(tick);
      }),
    };
    return () => { controls.removeEventListener('start', onStart); controls.removeEventListener('change', onChange); unsubscribe(); viewport = null; };
  };

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
  const instances = useMemo(() => buildInstances(pack, variant), [pack, variant]);
  const timeline = useMemo(() => timelineFor(pack.manifest.variants[variant], step, pack.manifest.timing), [pack, variant, step]);
  const v = pack.manifest.variants[variant];
  const guided = (step === 0 ? v.tray.camera : v.steps[step - 1].camera) ?? v.tray.camera;
  const key = pack.manifest.lighting.lights.find((l) => l.id === 'key')!;
  const kd = direction(key.azimuthDeg, key.elevationDeg);
  const centre = v.tray.camera.targetM;
  const keyLight = useMemo(() => {
    const light = new DirectionalLight(new Color(...key.color), 0.9);
    light.position.set(centre[0] + kd[0] * 1.5, centre[1] + kd[1] * 1.5, centre[2] + kd[2] * 1.5);
    light.target.position.set(...centre);
    light.castShadow = true;
    light.shadow.mapSize.set(2048, 2048);
    light.shadow.radius = 5;
    light.shadow.bias = -0.0002;
    light.shadow.normalBias = 0.0004;
    Object.assign(light.shadow.camera, { left: -0.45, right: 0.45, top: 0.45, bottom: -0.45, near: 0.5, far: 2.6 });
    return light;
    // The rig depends only on the pack and board, so it survives step changes with its shadow map.
  }, [pack, variant]);

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
        scene.environment = environment(gl, pack.manifest.lighting.lights, pack.manifest.lighting.runtimeEnvironmentBase);
        perf.firstFrameAt ??= performance.now();
      }}
      onPointerDown={(e) => { downAt = [e.clientX, e.clientY]; }}
      onPointerMissed={(e) => { if (Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]) < 4) select(null); }}
    >
      <primitive object={keyLight} />
      <primitive object={keyLight.target} />
      <Floor y={v.floorYM} />
      {/* A prop that changes with the step makes the demand frame loop render once, so the new timeline starts. */}
      <group name={studioKey(variant, step)} />
      {[...instances.roots.entries()].map(([id, root]) => (
        <primitive key={id} object={root}
          onClick={(e: { delta: number; stopPropagation: () => void }) => { if (e.delta > 4) return; e.stopPropagation(); select(id); }}
          onPointerOver={(e: { stopPropagation: () => void }) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
          onPointerOut={() => { document.body.style.cursor = ''; }} />
      ))}
      <Driver pack={pack} variant={variant} step={step} instances={instances} timeline={timeline} guided={guided} />
    </Canvas>
  );
}
