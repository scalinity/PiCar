// Assembly Studio route: the full-viewport 3D view of the Studio pack. Presentation only: this module does not
// import the assembly session store, so nothing here can record physical progress.
import { use, useMemo } from 'react';
import { navigate, studioHref, type StudioVariant } from '../lib/router';
import { loadPack } from '../features/assembly-3d/assets/pack';
import { timelineFor } from '../features/assembly-3d/motion/evaluate';
import { StudioScene, getViewport } from '../features/assembly-3d/scene/StudioScene';
import {
  focusSelection, getStudioState, pause, play, resetCamera, seek, select, toggleDrawer, togglePerf,
} from '../features/assembly-3d/state/studio-store';
import { perf, perfSnapshot } from '../features/assembly-3d/state/perf';
import { setFullscreen, useFullscreen } from '../features/assembly-3d/state/fullscreen';
import { isTauri } from '@tauri-apps/api/core';
import { CameraBar, Dock, Drawer, Header, PerfHud } from '../features/assembly-3d/ui/StudioChrome';
import '../styles/studio.css';

perf.mountedAt ||= performance.now();
const diagnostics = import.meta.env.DEV || /[?&]diagnostics\b/.test(location.hash);

export default function Studio({ variant = 'rpi5', step: requested = 0 }: { variant?: StudioVariant; step?: number }) {
  const pack = use(loadPack());
  const fullscreen = useFullscreen();
  perf.load ??= pack.timings;
  const v = pack.manifest.variants[variant];
  const operable = [0, ...v.steps.filter((s) => s.operable).map((s) => s.printedNumber)];
  const step = operable.includes(requested) ? requested : Math.max(...operable.filter((n) => n <= requested));
  const timeline = useMemo(() => timelineFor(v, step, pack.manifest.timing), [v, step, pack]);
  let rootElement: HTMLElement | null = null;

  const bindRoot = (el: HTMLDivElement | null) => {
    rootElement = el;
    if (!el) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement && e.target.type !== 'range') return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const s = getStudioState(), d = timeline.duration;
      const go = (n: number) => { if (operable.includes(n)) navigate(studioHref(variant, n)); };
      switch (e.key) {
        case ' ': e.preventDefault(); (s.playing ? pause() : play(d)); break;
        case 'ArrowRight': if (e.target instanceof HTMLInputElement) return; seek(Math.min(d, s.t + 0.25)); break;
        case 'ArrowLeft': if (e.target instanceof HTMLInputElement) return; seek(Math.max(0, s.t - 0.25)); break;
        case ']': go(step + 1); break;
        case '[': go(step - 1); break;
        case 'r': case 'R': resetCamera(); break;
        case 'f': case 'F': focusSelection(); break;
        case 'i': case 'I': toggleDrawer(); break;
        case 'p': case 'P': togglePerf(); break;
        case 'Escape': if (s.selection) select(null); else void setFullscreen(false, el); break;
        default: return;
      }
    };
    window.addEventListener('keydown', onKey);
    // In a native macOS fullscreen window AppKit consumes Escape's keydown (cancelOperation:); its keyup still
    // arrives, so Escape also acts on keyup unless the keydown was already handled.
    let escapeHandledAt = 0;
    const markEscape = (e: KeyboardEvent) => { if (e.key === 'Escape') escapeHandledAt = performance.now(); };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || performance.now() - escapeHandledAt < 500) return;
      const s = getStudioState();
      if (s.selection) select(null); else void setFullscreen(false, el);
    };
    window.addEventListener('keydown', markEscape);
    window.addEventListener('keyup', onKeyUp);
    if (diagnostics) {
      (window as unknown as { __studio?: unknown }).__studio = {
        packId: pack.manifest.packId, variant, step, duration: timeline.duration,
        state: getStudioState, perf: perfSnapshot, viewport: getViewport,
        camera: () => { const vp = getViewport(); return vp ? { position: vp.camera.position.toArray(), target: vp.controls.target.toArray(), aspect: vp.camera.aspect } : null; },
        instance: (id: string) => { const vp = getViewport(); const o = vp?.scene.getObjectByName(id); return o ? { position: o.position.toArray(), quaternion: o.quaternion.toArray() } : null; },
      };
    }
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('keydown', markEscape); window.removeEventListener('keyup', onKeyUp); };
  };

  return (
    <div className="studio" ref={bindRoot} data-variant={variant} data-step={step} data-native={isTauri()} data-fullscreen={fullscreen} style={{ background: pack.manifest.lighting.pool.css }}>
      <div className="studio-viewport">
        <StudioScene pack={pack} variant={variant} step={step} />
      </div>
      <Header pack={pack} variant={variant} step={step} root={() => rootElement} />
      <PerfHud />
      <CameraBar />
      <Drawer pack={pack} variant={variant} step={step} requestedStep={requested} timeline={timeline} />
      <Dock pack={pack} variant={variant} step={step} timeline={timeline} />
      <p className="studio-sr" aria-live="polite">{step === 0 ? 'Parts tray' : `Step ${step}: ${v.steps[step - 1].title}`}</p>
    </div>
  );
}
