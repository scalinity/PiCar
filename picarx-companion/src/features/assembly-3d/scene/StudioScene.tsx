// The Studio viewport. One frame driver applies the pure motion evaluator to instance roots, then composes the
// inspection presentation over it (explosion offsets, styles, the deck clip); React never re-renders per frame. Wiring
// uses onCreated and ref callbacks with cleanup, not effects. GPU resources follow the ownership classes in resources.ts.
import { Canvas, extend, useFrame, useThree, type ThreeElement } from '@react-three/fiber';
import { useCallback, useMemo } from 'react';
import { AgXToneMapping, Box3, PCFShadowMap, PerspectiveCamera, Vector3 } from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { entryOf, type LoadedPack, type StudioCamera } from '../assets/pack';
import { statesAt, timelineFor, type Timeline } from '../motion/evaluate';
import { clipRange, explodeOffsets, explodeWeight, focusIds, keptIds, styleOf } from '../motion/inspect';
import { advance, clearSelection, enterStep, getStudioState, select, seek, studioKey, subscribeStudio, yieldCamera, type Bounds } from '../state/studio-store';
import { governDpr, perf, recordFrame, setRendererInfo } from '../state/perf';
import { subscribePower } from '../state/power';
import { createBoard, createEnvironment, own, type Board, type Owner } from './resources';
import type { Scene, WebGLRenderer } from 'three';
import type { StudioVariant } from '../../../lib/router';

extend({ OrbitControls });
declare module '@react-three/fiber' {
  interface ThreeElements { orbitControls: ThreeElement<typeof OrbitControls> }
}

type Tween = { from: [Vector3, Vector3]; to: [Vector3, Vector3]; start: number; seconds: number } | null;
const ease = (x: number): number => 1 - Math.pow(1 - x, 3);
const reducedMotion = (): boolean => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

export type ViewportApi = {
  controls: OrbitControls; camera: PerspectiveCamera; scene: Scene; gl: WebGLRenderer; invalidate: () => void; setDpr: (dpr: number) => void;
  frame: (seconds: number) => Promise<number[]>; board: () => Board | null; inspection: () => { explode: number; insets: number[]; clip: { heightM: number; trayGuardX: number } | null };
};
let viewport: ViewportApi | null = null;
export const getViewport = (): ViewportApi | null => viewport;

// How far each panel covers the canvas, [left, top, right, bottom] in CSS px: the tool rail, the header, the open
// instruction drawer and the dock. Clamped so the framing area never falls below 40% of the canvas either way.
type Insets = [number, number, number, number];
function framingInsets(canvas: HTMLCanvasElement, W: number, H: number, drawerOpen: boolean): Insets {
  const root = canvas.closest('.studio');
  if (!root) return [0, 0, 0, 0];
  const frame = canvas.getBoundingClientRect(), box = (sel: string) => root.querySelector(sel)?.getBoundingClientRect();
  const rail = box('.studio-rail-tools'), header = box('.studio-header'), drawer = drawerOpen ? box('.studio-drawer') : undefined, dock = box('.studio-dock');
  const left = rail ? rail.right - frame.left + 8 : 0, top = header ? header.bottom - frame.top : 0;
  const right = drawer ? frame.right - drawer.left + 12 : 0, bottom = dock ? frame.bottom - dock.top + 8 : 0;
  const h = Math.min(left + right, W * 0.6) / (left + right || 1), v = Math.min(top + bottom, H * 0.6) / (top + bottom || 1);
  return [left * h, top * v, right * h, bottom * v];
}

// A camera move that frames a box from the current viewing direction.
function frameTween(camera: PerspectiveCamera, controls: OrbitControls, box: Box3, now: number, scale: number): Tween {
  const centre = box.getCenter(new Vector3()), radius = Math.max(box.getSize(new Vector3()).length() / 2, 0.012);
  const dir = camera.position.clone().sub(controls.target).normalize();
  const distance = (radius * scale) / Math.sin((camera.fov * Math.PI) / 360);
  return { from: [camera.position.clone(), controls.target.clone()], to: [centre.clone().addScaledVector(dir, distance), centre], start: now, seconds: 0.7 };
}

function Driver({ pack, variant, step, board, timeline, guided, labels }: { pack: LoadedPack; variant: StudioVariant; step: number; board: Board; timeline: Timeline; guided: StudioCamera; labels: { el: HTMLDivElement | null } }) {
  // Stable selections only: a resize or pixel-ratio change must not re-render the driver or re-bind its controls.
  const camera = useThree((s) => s.camera) as PerspectiveCamera, gl = useThree((s) => s.gl), scene = useThree((s) => s.scene);
  const invalidate = useThree((s) => s.invalidate), setDpr = useThree((s) => s.setDpr);
  const memory = useMemo(() => ({
    cameraRequest: -1, focusRequest: 0, frameRequest: 0, conflict: null as number | null, tween: null as Tween, controls: null as OrbitControls | null, settleFrames: 0,
    programmaticCamera: false, requestedNext: false, interacting: false, diagnosing: false, // what makes a frame interval active (perf.ts)
    adopted: null as Board | null, boardOwner: null as Owner | null, closing: undefined as ReturnType<typeof setTimeout> | undefined,
    openingTarget: guided.targetM, // the view the viewport opens on; afterwards only explicit requests move the target
    styleKey: '', explode: 0, clip: null as { heightM: number; trayGuardX: number } | null, viewKey: '', insets: [0, 0, 0, 0] as Insets,
  }), []);
  const variantEntry = pack.manifest.variants[variant];
  const entry = step > 0 ? variantEntry.steps[step - 1] : undefined;
  const offsets = useMemo(() => explodeOffsets(pack.manifest, entry), [pack, entry]);
  const range = useMemo(() => clipRange(pack.manifest, variantEntry, entry), [pack, variantEntry, entry]);

  useFrame((state, dt) => {
    const now = performance.now();
    recordFrame(now, memory.requestedNext || memory.interacting || memory.diagnosing);
    let again = false; // this frame asks for the next one
    setRendererInfo(gl.info.render.calls, gl.info.render.triangles, state.viewport.dpr, state.size.width, state.size.height);
    Object.assign(perf.resources, { geometries: gl.info.memory.geometries, textures: gl.info.memory.textures, programs: gl.info.programs?.length ?? 0, shadow: board.keyLight.shadow.map ? 1 : 0, environment: scene.environment ? 1 : 0 });
    const dpr = governDpr(state.viewport.dpr);
    if (dpr !== state.viewport.dpr) setDpr(dpr);
    // A rebuilt board (a board switch) is in the scene now; the one it replaced is not, so its resources are released,
    // and its roots start with normal materials, so a retained selection is styled again.
    if (memory.adopted !== board) {
      memory.boardOwner?.dispose();
      memory.boardOwner = own(`board ${board.variant}`, board.release);
      memory.adopted = board;
      perf.resources.materials = board.materials().length;
      memory.styleKey = '';
      memory.clip = null;
    }
    const key = studioKey(variant, step);
    enterStep(key, timeline.duration, board.ids);
    if (reducedMotion() && getStudioState().playing) seek(timeline.duration);
    advance(Math.min(dt, 0.1), timeline.duration);
    const s = getStudioState();

    // Explosion eases toward its toggle; the offsets are a pure function of the step, scaled by that amount.
    const target = s.explode ? 1 : 0;
    if (memory.explode !== target) {
      memory.explode = reducedMotion() || Math.abs(target - memory.explode) < 0.002 ? target : memory.explode + (target - memory.explode) * Math.min(1, dt * 7);
      again = true;
    }
    for (const [id, st] of statesAt(variantEntry, timeline, s.t)) {
      const root = board.roots.get(id);
      if (!root) continue;
      const o = memory.explode > 0 ? offsets.get(id) : undefined, w = o ? memory.explode * explodeWeight(st) : 0;
      const p = st.pose.translationM;
      root.position.set(p[0] + (o ? o[0] * w : 0), p[1] + (o ? o[1] * w : 0), p[2] + (o ? o[2] * w : 0));
      root.quaternion.set(...st.pose.rotationXYZW);
      root.userData.phase = st.phase;
    }

    // Styles change only when what decides them changes.
    const pair = entry && s.conflict !== null ? entry.conflicts[s.conflict]?.instances ?? null : null;
    const styleKey = `${key}|${s.selection}|${s.conflict}|${s.isolate}|${s.ghost}`;
    if (styleKey !== memory.styleKey) {
      memory.styleKey = styleKey;
      // A chosen conflict pair is seen through everything else: its parts tinted, the rest ghosted.
      const o = { selection: s.selection, focus: focusIds(entry, pair), kept: keptIds(entry, s.selection, pair), isolate: s.isolate, ghost: s.ghost || pair !== null };
      for (const id of board.ids) board.style(id, styleOf(id, o));
    }
    const clip = s.clip ? { heightM: s.clipHeightM ?? range.deck, trayGuardX: range.trayGuardX } : null;
    if (clip?.heightM !== memory.clip?.heightM || Boolean(clip) !== Boolean(memory.clip)) { memory.clip = clip; board.setClip(clip); }

    const controls = memory.controls;
    if (controls) {
      if (s.cameraRequest !== memory.cameraRequest) {
        memory.cameraRequest = s.cameraRequest;
        memory.tween = { from: [camera.position.clone(), controls.target.clone()], to: [new Vector3(...guided.positionM), new Vector3(...guided.targetM)], start: now, seconds: memory.cameraRequest === 1 ? 0 : 0.9 };
      }
      if (s.focusRequest !== memory.focusRequest) {
        memory.focusRequest = s.focusRequest;
        // Only a part that is in the active scene can be framed; any other request is consumed without effect.
        const root = s.selection ? board.roots.get(s.selection) ?? board.tiles.get(s.selection) : undefined;
        if (root?.parent) memory.tween = frameTween(camera, controls, new Box3().setFromObject(root), now, 1.6);
      }
      if (s.conflict !== memory.conflict) {
        memory.conflict = s.conflict;
        if (pair) {
          const box = new Box3();
          for (const id of pair) { const root = board.roots.get(id); if (root) box.expandByObject(root); }
          if (!box.isEmpty()) memory.tween = frameTween(camera, controls, box, now, 1.3);
        }
      }
      if (s.frameRequest !== memory.frameRequest) {
        memory.frameRequest = s.frameRequest;
        const b = s.frameBounds as Bounds | null;
        if (b) memory.tween = frameTween(camera, controls, new Box3(new Vector3(...b.min), new Vector3(...b.max)), now, 1.15);
      }
      if (memory.tween) {
        const k = reducedMotion() || memory.tween.seconds === 0 ? 1 : Math.min(1, (now - memory.tween.start) / (memory.tween.seconds * 1000));
        camera.position.lerpVectors(memory.tween.from[0], memory.tween.to[0], ease(k));
        controls.target.lerpVectors(memory.tween.from[1], memory.tween.to[1], ease(k));
        if (k >= 1) memory.tween = null;
      }
      // After the user lets go, damping keeps easing the view; render until it has run out, so the remaining inertia
      // lands as part of the gesture and not on some later, unrelated redraw (a resize, a pixel-ratio change).
      const settling = memory.settleFrames > 0;
      if (settling) memory.settleFrames--;
      memory.programmaticCamera = true;
      try { if (controls.update() || memory.tween || settling) again = true; } finally { memory.programmaticCamera = false; }
    }

    // Framing area: the panels (header, tools, dock, open instructions) cover the canvas edges, so the camera's frame is
    // the uncovered rectangle and the canvas is a window around it. Every guided view, focus and group framing then fits
    // what is visible, and grows when a panel closes. The camera and its target never move for this.
    const { width: W, height: Hh } = state.size;
    const insets = framingInsets(gl.domElement, W, Hh, s.drawerOpen);
    let moving = false;
    memory.insets = memory.insets.map((x, i) => {
      if (reducedMotion() || Math.abs(insets[i] - x) < 0.25) return insets[i];
      moving = true;
      return x + (insets[i] - x) * Math.min(1, dt * 9);
    }) as typeof insets;
    if (moving) again = true;
    const [left, top, right, bottom] = memory.insets;
    const viewKey = `${W}x${Hh}@${memory.insets.map((x) => x.toFixed(2)).join(',')}`;
    if (viewKey !== memory.viewKey) {
      memory.viewKey = viewKey;
      const vw = W - left - right, vh = Hh - top - bottom;
      camera.aspect = vw / vh;
      camera.setViewOffset(vw, vh, -left, -top, W, Hh);
      camera.updateProjectionMatrix();
    }

    // Keep full-kit group names readable. Tile names yield to occupied labels in the wide overview;
    // framing their group provides more space, and every tile remains identified in the inventory and inspector.
    if (labels.el) {
      camera.updateMatrixWorld();
      const v = new Vector3();
      const occupied: { x: number; y: number; w: number; h: number }[] = [];
      for (const el of labels.el.children as HTMLCollectionOf<HTMLElement>) {
        const [x, y, z] = (el.dataset.anchor ?? '').split(',').map(Number);
        v.set(x, y, z).project(camera);
        const tile = el.dataset.instance !== undefined;
        const px = ((v.x + 1) / 2) * W, py = ((1 - v.y) / 2) * Hh;
        const box = { x: px - (tile ? el.offsetWidth / 2 : 0), y: py - (tile ? el.offsetHeight / 2 : 9), w: el.offsetWidth, h: el.offsetHeight };
        const overlaps = () => occupied.some(r => box.x < r.x + r.w + 4 && box.x + box.w + 4 > r.x && box.y < r.y + r.h + 4 && box.y + box.h + 4 > r.y);
        if (!tile) while (overlaps()) box.y += box.h + 5;
        const hidden = v.z > 1 || (tile && (board.styleOf(el.dataset.instance!) === 'hidden' || overlaps()));
        if (!hidden) occupied.push(box);
        el.style.visibility = hidden ? 'hidden' : '';
        el.style.transform = `translate(${px}px, ${box.y + (tile ? el.offsetHeight / 2 : 9)}px)`;
      }
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
    controls.enableDamping = !reducedMotion();
    controls.dampingFactor = 0.12;
    controls.screenSpacePanning = true;
    controls.minDistance = 0.05;
    controls.maxDistance = 3;
    controls.target.set(...memory.openingTarget);
    // A controls change caused by manipulation yields and interrupts a guided move; a click that only
    // selects a part leaves the guided view in place.
    const onStart = () => { memory.interacting = true; };
    const onChange = () => {
      if (memory.interacting && !memory.programmaticCamera) { memory.tween = null; yieldCamera(); }
      invalidate();
    };
    // Damping decays by (1 - dampingFactor) per update: 120 updates leave 0.88^120 (about 2e-7) of the release motion.
    const onEnd = () => { memory.interacting = false; memory.settleFrames = reducedMotion() ? 0 : 120; invalidate(); };
    controls.addEventListener('start', onStart);
    controls.addEventListener('change', onChange);
    controls.addEventListener('end', onEnd);
    // The demand frame loop draws only when asked: any presentation change (scrub, step, selection) asks once.
    const unsubscribe = subscribeStudio(invalidate);
    const stopPower = subscribePower(invalidate);
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const onMotion = () => {
      controls.enableDamping = !motion.matches;
      invalidate();
    };
    motion.addEventListener('change', onMotion);
    viewport = {
      controls, camera, scene, gl, invalidate, setDpr,
      board: () => memory.adopted,
      inspection: () => ({ explode: memory.explode, insets: [...memory.insets], clip: memory.clip }),
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
      stopPower();
      motion.removeEventListener('change', onMotion);
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
type PickEvent = { delta: number; stopPropagation: () => void };

export function StudioScene({ pack, variant, step }: { pack: LoadedPack; variant: StudioVariant; step: number }) {
  const board = useMemo(() => createBoard(pack, variant), [pack, variant]);
  const timeline = useMemo(() => timelineFor(pack.manifest.variants[variant], step, pack.manifest.timing), [pack, variant, step]);
  const labels = useMemo(() => ({ el: null as HTMLDivElement | null }), []);
  const v = pack.manifest.variants[variant];
  const entry = step > 0 ? v.steps[step - 1] : undefined;
  const guided = (step === 0 ? v.tray.camera : entry!.camera) ?? v.tray.camera;
  const inStep = new Set(entry?.stepParts.map((p) => p.instanceId) ?? []);
  const pick = (id: string) => (e: PickEvent) => { if (e.delta > 4) return; e.stopPropagation(); select(id); };
  const hover = { onPointerOver: (e: { stopPropagation: () => void }) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }, onPointerOut: () => { document.body.style.cursor = ''; } };

  return (
    <>
      <Canvas
        frameloop="demand"
        dpr={[1, 2]}
        shadows={{ type: PCFShadowMap }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance', localClippingEnabled: true }}
        camera={{ fov: guided.verticalFovDeg, near: 0.005, far: 30, position: guided.positionM }}
        onCreated={({ gl, scene }) => {
          gl.toneMapping = AgXToneMapping;
          gl.toneMappingExposure = 1;
          gl.localClippingEnabled = true; // the deck clip acts on this board's own materials
          gl.setClearColor(0x000000, 0);
          const environment = createEnvironment(gl, pack.manifest.lighting.lights, pack.manifest.lighting.runtimeEnvironmentBase);
          scene.environment = environment.texture;
          scene.userData.environmentOwner = own('renderer environment', environment.release);
          perf.canvasAt ??= performance.now(); // the canvas exists; nothing is drawn yet
        }}
        onPointerDown={(e) => { downAt = [e.clientX, e.clientY]; }}
        onPointerMissed={(e) => { if (Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]) < 4) clearSelection(); }}
      >
        <primitive object={board.keyLight} />
        <primitive object={board.keyLight.target} />
        <Floor y={v.floorYM} />
        {/* A prop that changes with the step makes the demand frame loop render once, so the new timeline starts. */}
        <group name={studioKey(variant, step)} />
        {[...board.roots.entries()].map(([id, root]) => <primitive key={id} object={root} onClick={pick(id)} {...hover} />)}
        {[...board.tiles.entries()].map(([id, tile]) => <primitive key={id} object={tile} onClick={pick(id)} {...hover} />)}
        <Driver pack={pack} variant={variant} step={step} board={board} timeline={timeline} guided={guided} labels={labels} />
      </Canvas>
      {/* Tray labels: group names on the tray view, tile names wherever their part is in play. Positioned by the driver. */}
      <div className="studio-labels" aria-hidden="true" ref={(el) => { labels.el = el; }}>
        {step === 0 && v.tray.groups.map((g) => (
          <span key={g.id} className="studio-label-group" data-anchor={g.labelM.join(',')}>{g.label}<b>{g.instanceIds.length}</b></span>
        ))}
        {Object.entries(v.tray.tiles).filter(([id]) => step === 0 || inStep.has(id)).map(([id, t]) => (
          <span key={id} className="studio-label-tile" data-anchor={t.centreM.join(',')} data-instance={id} data-kind={entryOf(pack.manifest, id)?.componentClass}>
            {entryOf(pack.manifest, id)?.name}
          </span>
        ))}
      </div>
    </>
  );
}
