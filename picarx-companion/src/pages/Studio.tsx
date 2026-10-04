// Studio routes intentional navigation through the narrow adapter; scene interactions remain presentation only.
import { use, useMemo } from 'react';
import { Box3, Mesh } from 'three';
import { navigate, studioHref, type StudioVariant } from '../lib/router';
import { loadPack } from '../features/assembly-3d/assets/pack';
import { BuildAlong, bookmarkStudioStep, studioBoardHref, useBuildBoard } from '../features/assembly-3d/build-along';
import { timelineFor } from '../features/assembly-3d/motion/evaluate';
import { StudioScene, getViewport } from '../features/assembly-3d/scene/StudioScene';
import { owned } from '../features/assembly-3d/scene/resources';
import { pixelCensus } from '../features/assembly-3d/scene/census';
import {
  clearSelection, focusSelection, getStudioState, hasSelection, pause, play, resetCamera, seek, setManualOpen, toggleDrawer, toggleInspect, togglePerf,
} from '../features/assembly-3d/state/studio-store';
import { markHidden, perf, perfSnapshot } from '../features/assembly-3d/state/perf';
import { setFullscreen, useFullscreen } from '../features/assembly-3d/state/fullscreen';
import { escapePresses, subscribeNativeEscape } from '../features/assembly-3d/state/escape';
import { isTauri } from '@tauri-apps/api/core';
import { Dock, Drawer, Header, ManualOverlay, PerfHud, SelectionStatus, ViewTools, studioSummary } from '../features/assembly-3d/ui/StudioChrome';
import '../styles/studio.css';

const diagnostics = import.meta.env.DEV || import.meta.env.VITE_M3_NATIVE_TEST === '1';

export default function Studio({ variant = 'rpi5', step: requested }: { variant?: StudioVariant; step?: number }) {
  perf.openedAt ??= performance.now(); // the page's first render this session: its code is loaded, its pack not yet
  const pack = use(loadPack());
  const board = useBuildBoard(variant);
  const saved = Number(board.session?.reviewStepId.slice(-2));
  const desired = requested ?? (saved >= 1 && saved <= 29 ? Math.min(saved,9) : 0);
  const fullscreen = useFullscreen();
  perf.load ??= pack.timings;
  const v = pack.manifest.variants[variant];
  // Every state the pack opens: the tray, Preview steps and Review steps. A closed step falls back to the one before it.
  const opened = [0, ...v.steps.filter((s) => s.mode !== 'closed').map((s) => s.printedNumber)];
  const step = opened.includes(desired) ? desired : Math.max(...opened.filter((n) => n <= desired));
  const timeline = useMemo(() => timelineFor(v, step, pack.manifest.timing), [v, step, pack]);
  let rootElement: HTMLElement | null = null;

  const bindRoot = (el: HTMLDivElement | null) => {
    rootElement = el;
    if (!el) return;
    // Commit the visible tray's dismissal state before its first 3D frame. Under load, Escape can arrive between
    // the route commit (which removes the manual) and enterStep in the frame loop.
    if (step === 0 && getStudioState().manualOpen) setManualOpen(false);
    const onKey = (e: KeyboardEvent) => {
      const target = e.target instanceof HTMLElement ? e.target : null;
      if (target?.closest('textarea, input:not([type="range"]), select, [contenteditable]:not([contenteditable="false"])')) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const s = getStudioState(), d = timeline.duration;
      if (s.manualOpen || e.repeat) return;
      // Space activates the focused control; arrows retain native slider/summary behavior.
      if ((e.key === ' ' || e.key.startsWith('Arrow')) && target?.closest('button, a, input, summary')) return;
      const go = (n: number) => { if (opened.includes(n)) { bookmarkStudioStep(variant,n); navigate(studioHref(variant, n)); } };
      switch (e.key) {
        case ' ': e.preventDefault(); if (d > 0) (s.playing ? pause() : play(d)); break;
        case 'ArrowRight': if (e.target instanceof HTMLInputElement) return; if (d > 0) seek(Math.min(d, s.t + 0.25)); break;
        case 'ArrowLeft': if (e.target instanceof HTMLInputElement) return; if (d > 0) seek(Math.max(0, s.t - 0.25)); break;
        case ']': go(step + 1); break;
        case '[': go(step - 1); break;
        case 'r': case 'R': resetCamera(); break;
        case 'f': case 'F': focusSelection(); break;
        case 'i': case 'I':
          if (s.drawerOpen && target?.closest('.studio-drawer')) el.querySelector<HTMLElement>('[aria-label="Hide instructions"]')?.focus();
          toggleDrawer(); break;
        case 'p': case 'P': togglePerf(); break;
        case 'o': case 'O': toggleInspect('isolate'); break;
        case 'g': case 'G': toggleInspect('ghost'); break;
        case 'e': case 'E': if (step > 0) toggleInspect('explode'); break;
        case 'c': case 'C': toggleInspect('clip'); break;
        default: return;
      }
    };
    window.addEventListener('keydown', onKey);
    // One physical Escape press, one action: close the enlarged manual, else clear what is singled out, else leave
    // fullscreen. Native fullscreen delivers one AppKit release independently of the DOM focus target.
    const dismiss = () => {
      const s = getStudioState();
      if (s.manualOpen) setManualOpen(false);
      else if (hasSelection()) clearSelection();
      else void setFullscreen(false, el);
    };
    const escape = escapePresses(dismiss);
    const stopNativeEscape = subscribeNativeEscape(dismiss);
    window.addEventListener('keydown', escape.keydown);
    window.addEventListener('keyup', escape.keyup);
    document.addEventListener('visibilitychange', markHidden); // hidden time is never frame time
    if (diagnostics) {
      (window as unknown as { __studio?: unknown }).__studio = {
        packId: pack.manifest.packId, variant, step, duration: timeline.duration,
        state: getStudioState, perf: perfSnapshot, viewport: getViewport, owned,
        camera: () => { const vp = getViewport(); return vp ? { position: vp.camera.position.toArray(), target: vp.controls.target.toArray(), aspect: vp.camera.aspect, view: vp.camera.view?.enabled ? { ...vp.camera.view } : null } : null; },
        instance: (id: string) => { const vp = getViewport(); const o = vp?.scene.getObjectByName(id); return o ? { position: o.position.toArray(), quaternion: o.quaternion.toArray() } : null; },
        // Whether the instance in the active scene renders with the selection tint.
        highlighted: (id: string) => {
          let lit = false;
          getViewport()?.scene.getObjectByName(id)?.traverse((o) => { const m = (o as { material?: { emissive?: { getHex(): number } } }).material; if (m?.emissive && m.emissive.getHex() !== 0) lit = true; });
          return lit;
        },
        style: (id: string) => getViewport()?.board()?.styleOf(id) ?? null,
        inspection: () => getViewport()?.inspection() ?? null,
        // Visible pixels per tray slot from the current camera, inside the uncovered framing area.
        census: () => { const vp = getViewport(); return vp ? pixelCensus(vp, vp.inspection().insets) : null; },
        // What the active scene draws: every instance root and tile, with its drawn meshes, triangles, layer and box.
        roots: () => {
          const board = getViewport()?.board();
          if (!board) return null;
          const describe = (id: string, root: import('three').Object3D, tile: boolean) => {
            let meshes = 0, triangles = 0, layer0 = true;
            root.updateWorldMatrix(true, true);
            const box = new Box3();
            root.traverse((o) => {
              if (!(o instanceof Mesh) || o.userData.pickTarget) return;
              meshes++;
              triangles += (o.geometry.index?.count ?? o.geometry.attributes.position.count) / 3;
              if (!o.layers.isEnabled(0)) layer0 = false;
              box.expandByObject(o);
            });
            return { id, tile, meshes, triangles, drawn: layer0 && root.parent !== null, min: box.min.toArray(), max: box.max.toArray() };
          };
          return [...[...board.roots].map(([id, r]) => describe(id, r, false)), ...[...board.tiles].map(([id, r]) => describe(id, r, true))];
        },
      };
    }
    return () => {
      if (diagnostics) delete (window as unknown as { __studio?: unknown }).__studio;
      const restore = el.contains(document.activeElement) && document.activeElement !== document.body;
      if (restore) requestAnimationFrame(() => { if (document.activeElement === document.body) document.querySelector<HTMLElement>('.studio-boards a[aria-current]')?.focus(); });
      stopNativeEscape(); window.removeEventListener('keydown', onKey); window.removeEventListener('keydown', escape.keydown); window.removeEventListener('keyup', escape.keyup); document.removeEventListener('visibilitychange', markHidden);
    };
  };

  return (
    <div className="studio" ref={bindRoot} data-variant={variant} data-step={step} data-mode={step === 0 ? 'tray' : v.steps[step - 1].mode} data-native={isTauri()} data-fullscreen={fullscreen}
      style={{ background: pack.manifest.lighting.pool.css }}>
      <div className="studio-viewport">
        <StudioScene pack={pack} variant={variant} step={step} />
      </div>
      <Header pack={pack} variant={variant} step={step} root={() => rootElement} boardHref={(v)=>studioBoardHref(v,step)} />
      <PerfHud />
      <ViewTools pack={pack} variant={variant} step={step} />
      <Drawer pack={pack} variant={variant} step={step} requestedStep={desired} timeline={timeline} buildAlong={<BuildAlong key={`${variant}/${step}`} pack={pack} variant={variant} step={step} />} />
      <Dock pack={pack} variant={variant} step={step} timeline={timeline} onStep={(n)=>bookmarkStudioStep(variant,n)} />
      <ManualOverlay variant={variant} step={step} />
      <SelectionStatus pack={pack} />
      <p className="studio-sr" aria-live="polite">{studioSummary(pack, variant, step)}</p>
    </div>
  );
}
