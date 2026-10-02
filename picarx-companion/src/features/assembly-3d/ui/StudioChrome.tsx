import { type ReactNode } from 'react';
import { studioHref, type StudioVariant } from '../../../lib/router';
import type { Display, DisplayDetail, LoadedPack, StepEntry, Vec3 } from '../assets/pack';
import { statesAt, type Phase, type Timeline } from '../motion/evaluate';
import {
  focusSelection, pause, play, replay, resetCamera, rewind, seek, select, toggleDrawer, useStudio,
} from '../state/studio-store';
import { fullscreenMode, setFullscreen, useFullscreen } from '../state/fullscreen';
import { usePerfSnapshot } from '../state/perf';
import { Back, Collapse, Expand, Focus, Panel, Pause, Play, Replay, ResetView, Rewind } from './icons';

export const BOARD: Record<StudioVariant, string> = { rpi5: 'Raspberry Pi 5', 'rpi-zero-2-w': 'Raspberry Pi Zero 2 W' };
const SHORT: Record<StudioVariant, string> = { rpi5: 'Pi 5', 'rpi-zero-2-w': 'Zero 2 W' };

const DISPLAY_TEXT: Record<Display, string> = {
  PREVIEW_SOURCE_REVALIDATED: 'Preview. Poses come from the M7 instructional chain and passed its independent check when this pack was built.',
  PREVIEW_BLOCKED_RELATION: 'Review only. The parts are placed, but a connection this step needs is still unresolved.',
  REVIEW_REFUSED_CANDIDATE: 'Review only. The overlap check refused this step, so the parts shown are an unaccepted candidate.',
  UNAVAILABLE: 'No source record yet. The parts stay in the tray.',
};
const PHASE_TEXT: Record<Phase, string> = {
  installed: 'Installed in this step’s pose', tray: 'In the parts tray (a layout, not an assembly state)', waiting: 'Waiting in the tray',
  'bring-in': 'Being brought in from the tray (presentation travel)', approach: 'Staged approach from the M7 recipe (not a measured insertion path)',
};

function displaySummary(display: DisplayDetail): string {
  const offsets = (display.vendorCrossCheck?.parts ?? []).flatMap((p) => (p.centreOffsetXYMm ? [Math.hypot(...p.centreOffsetXYMm)] : []));
  const agreement = offsets.length ? ` Its parts sit within ${Math.max(...offsets.filter((o) => o < 1)).toFixed(2)} mm of the maker's own model.` : '';
  return `A detailed model drawn from ${display.source.split(' (')[0]}.${agreement}`;
}

// Display-detail checks: large overlaps are findings; stud contacts in mounting holes are the hole-clearance class M7 records.
function displayNotes(pack: LoadedPack, entry: StepEntry): string[] {
  const notes: string[] = [];
  const big = entry.displayChecks.filter((c) => c.volumeMm3 > 10);
  for (const c of big) {
    notes.push(`Detailed view: the ${pack.manifest.instances[c.instanceId].name} overlaps the detailed ${pack.manifest.definitions[c.definitionId].name.split(';')[0]} by ${Math.round(c.volumeMm3)} mm³. Its step pose was checked against a simpler shape, so this is recorded for the assembly work rather than hidden.`);
  }
  const small = entry.displayChecks.filter((c) => c.volumeMm3 <= 10);
  if (small.length) notes.push(`Standoff studs touch the mounting-hole walls (up to ${Math.max(...small.map((c) => c.volumeMm3)).toFixed(1)} mm³), the hole-clearance case the assembly checks already record.`);
  return notes;
}

function approachWords(axis: Vec3, metres: number): string {
  const mm = Math.round(metres * 1000);
  const [x, y, z] = axis.map(Math.abs);
  const way = y >= x && y >= z ? (axis[1] < 0 ? 'down' : 'up') : z >= x ? (axis[2] > 0 ? 'forward' : 'backward') : axis[0] > 0 ? 'toward the robot’s left' : 'toward the robot’s right';
  return `moves ${way} ${mm} mm into place`;
}

function Button({ label, onClick, children, pressed, disabled, wide }: { label: string; onClick: () => void; children: ReactNode; pressed?: boolean; disabled?: boolean; wide?: boolean }) {
  return (
    <button type="button" className={`studio-button${wide ? ' studio-button-wide' : ''}`} aria-label={wide ? undefined : label} title={label}
      aria-pressed={pressed} disabled={disabled} onClick={onClick}>{children}</button>
  );
}

export function Header({ pack, variant, step, root }: { pack: LoadedPack; variant: StudioVariant; step: number; root: () => HTMLElement | null }) {
  const full = useFullscreen();
  const drawerOpen = useStudio((s) => s.drawerOpen);
  const coverage = pack.manifest.source.m7Gate.coverage;
  return (
    <header className="studio-header" data-tauri-drag-region>
      <nav className="studio-exits" aria-label="Leave the Studio">
        <a className="studio-back" href="#/"><Back />Companion</a>
        <a href="#/wizard/parts">Setup</a>
        <a href="#/reference">Reference</a>
        <a href="#/videos">Videos</a>
      </nav>
      <h1 className="studio-title" data-tauri-drag-region>Assembly Studio</h1>
      <div className="studio-header-tools">
        <div className="studio-boards" role="group" aria-label="Board">
          {(Object.keys(BOARD) as StudioVariant[]).map((v) => (
            <a key={v} href={studioHref(v, step)} aria-current={v === variant ? 'true' : undefined} title={BOARD[v]}>{SHORT[v]}</a>
          ))}
        </div>
        <span className="studio-preview-chip" title={`M7 has accepted ${coverage.complete} of ${coverage.required} step closures. This is a preview pack, not an engineering pack.`}>Preview</span>
        <Button label={drawerOpen ? 'Hide instructions' : 'Show instructions'} pressed={drawerOpen} onClick={toggleDrawer}><Panel /></Button>
        <Button label={full ? 'Exit fullscreen' : `Enter fullscreen (${fullscreenMode()})`} pressed={full}
          onClick={() => { const el = root(); if (el) void setFullscreen(!full, el); }}>{full ? <Collapse /> : <Expand />}</Button>
      </div>
    </header>
  );
}

function Inspector({ pack, variant, timeline }: { pack: LoadedPack; variant: StudioVariant; timeline: Timeline }) {
  const selection = useStudio((s) => s.selection);
  const t = useStudio((s) => s.t);
  if (!selection) return <p className="studio-hint">Select a part in the view to see where its shape and pose come from.</p>;
  const instance = pack.manifest.instances[selection], definition = pack.manifest.definitions[instance.definitionId];
  const state = statesAt(pack.manifest.variants[variant], timeline, t).get(selection);
  const step = timeline.step > 0 ? pack.manifest.variants[variant].steps[timeline.step - 1] : undefined;
  const tray = pack.manifest.variants[variant].tray.instances[selection];
  return (
    <section className="studio-inspector" aria-label="Selected part">
      <h3>{instance.name}</h3>
      <dl>
        <dt>Part</dt><dd><code>{selection}</code></dd>
        <dt>Role</dt><dd>{instance.role}</dd>
        <dt>Now</dt><dd>{state ? PHASE_TEXT[state.phase] : '—'}</dd>
        {definition.display ? (<>
          <dt>Shown as</dt><dd>{displaySummary(definition.display)}</dd>
          <dt>Checked as</dt><dd>{definition.approximation}. Assembly checks use this simpler shape.</dd>
        </>) : (<dt>Shape</dt>)}
        {!definition.display && <dd>{definition.approximation}</dd>}
        <dt>Shape file</dt><dd><code title={definition.artifact.sha256}>{definition.artifact.path.split("/").pop()} ({definition.artifact.sha256.slice(0, 10)})</code></dd>
        <dt>Pose from</dt><dd>{(state?.placed || state?.phase === 'approach') && step?.source.file ? <code title={step.source.sha256}>{step.source.file.split('/').pop()}</code> : `Tray layout${tray?.orientation === 'part-local' ? ', part-local orientation (no installed pose yet)' : ''}`}</dd>
      </dl>
      <button type="button" className="studio-link-button" onClick={focusSelection}>Frame this part</button>
    </section>
  );
}

export function Drawer({ pack, variant, step, requestedStep, timeline }: { pack: LoadedPack; variant: StudioVariant; step: number; requestedStep: number; timeline: Timeline }) {
  const open = useStudio((s) => s.drawerOpen);
  const selection = useStudio((s) => s.selection);
  const v = pack.manifest.variants[variant];
  const entry: StepEntry | undefined = step > 0 ? v.steps[step - 1] : undefined;
  const coverage = pack.manifest.source.m7Gate.coverage;
  return (
    <aside className="studio-drawer" data-open={open} aria-hidden={!open} aria-label="Instructions" inert={!open}>
      {requestedStep !== step && (
        <p className="studio-notice" role="status">Step {requestedStep} opens in a later Studio update. Showing step {step}.</p>
      )}
      <p className="studio-kicker">{entry ? `Step ${entry.printedNumber} of 29 on the ${BOARD[variant]}` : `Parts tray for the ${BOARD[variant]}`}</p>
      <h2 className="studio-step-title">{entry ? entry.title : 'The parts for steps 1 to 9'}</h2>
      {entry ? <p className="studio-source-line">Shown in {entry.sourcePanel} of the V40 assembly manual.</p>
        : <p className="studio-source-line">Every part these steps use, set out beside the chassis. The tray is a layout for looking, not a stage of the build.</p>}

      <dl className="studio-truths">
        <dt>On screen</dt><dd>{entry ? DISPLAY_TEXT[entry.display] : 'Shapes from the CAD artifacts the M7 chain placed.'}</dd>
        <dt>Assembly check</dt><dd>Not accepted yet. M7 has accepted {coverage.complete} of {coverage.required} steps.</dd>
        <dt>Your car</dt><dd>Not recorded here. Watching, replaying or scrubbing never marks a step done.</dd>
      </dl>
      {entry?.dependencyWarnings.map((w) => <p key={w.printedNumber} className="studio-warning" role="note">{w.text}</p>)}
      {entry && displayNotes(pack, entry).map((t) => <p key={t} className="studio-warning" role="note">{t}</p>)}

      {entry && (
        <section aria-label="Parts in this step">
          <h3>In this step</h3>
          <ul className="studio-parts">
            {timeline.tracks.map((track) => {
              const recipe = entry.recipes.find((r) => r.instanceId === track.instanceId);
              return (
                <li key={track.instanceId}>
                  <button type="button" aria-pressed={selection === track.instanceId} onClick={() => select(track.instanceId)}>
                    <span className="studio-part-name">{pack.manifest.instances[track.instanceId].name}</span>
                    <span className="studio-part-note">{recipe ? approachWords(recipe.approachAxis, recipe.approachDistanceM) : 'the workpiece; placed directly'}</span>
                  </button>
                </li>
              );
            })}
          </ul>
          {entry.introducedZeroSolidInstanceIds.length > 0 && (
            <p className="studio-hint">Also in this step, not drawn: {entry.introducedZeroSolidInstanceIds.map((id) => pack.manifest.instances[id]?.name ?? id).join(', ')}. See the printed manual.</p>
          )}
        </section>
      )}

      <Inspector pack={pack} variant={variant} timeline={timeline} />

      {entry && entry.limitations.length > 0 && (
        <details className="studio-limits">
          <summary>Source limitations ({entry.limitations.length})</summary>
          <ul>{entry.limitations.map((l) => <li key={l}>{l}</li>)}</ul>
        </details>
      )}
      <p className="studio-pack-line">Pack <code title={pack.manifest.packId}>{pack.manifest.packId.slice(0, 12)}</code> from chain run {pack.manifest.source.chain.label} (source mode)</p>
    </aside>
  );
}

const fmt = (s: number): string => `${s.toFixed(1)} s`;

export function Dock({ pack, variant, step, timeline }: { pack: LoadedPack; variant: StudioVariant; step: number; timeline: Timeline }) {
  const t = useStudio((s) => s.t);
  const playing = useStudio((s) => s.playing);
  const steps = pack.manifest.variants[variant].steps;
  const d = timeline.duration;
  return (
    <div className="studio-dock" role="group" aria-label="Step controls">
      <ol className="studio-rail" aria-label="Steps">
        <li><a href={studioHref(variant, 0)} aria-current={step === 0 ? 'step' : undefined} title="Parts tray">Parts</a></li>
        {steps.map((s) => (
          <li key={s.printedNumber}>
            {s.operable ? (
              <a href={studioHref(variant, s.printedNumber)} aria-current={step === s.printedNumber ? 'step' : undefined} title={s.title}>{s.printedNumber}</a>
            ) : (
              <span className="studio-rail-later" data-display={s.display} title={`${s.title}. Opens in a later Studio update. ${DISPLAY_TEXT[s.display]}`} aria-disabled="true">{s.printedNumber}</span>
            )}
          </li>
        ))}
      </ol>
      <div className="studio-transport">
        <Button label="Rewind" onClick={rewind} disabled={d === 0 || t === 0}><Rewind /></Button>
        <Button label={playing ? 'Pause' : 'Play step'} onClick={() => (playing ? pause() : play(d))} disabled={d === 0}>{playing ? <Pause /> : <Play />}</Button>
        <Button label="Replay from the start" onClick={() => replay(d)} disabled={d === 0}><Replay /></Button>
        <div className="studio-rule">
          <div className="studio-rule-ticks" aria-hidden="true">
            {d > 0 && timeline.tracks.flatMap((k) => [k.start, k.start + k.bringIn]).map((x, i) => (
              <span key={i} className={i % 2 ? 'studio-tick-approach' : 'studio-tick'} style={{ left: `${(x / d) * 100}%` }} />
            ))}
          </div>
          <input type="range" min={0} max={d || 1} step={0.01} value={d ? t : 1} disabled={d === 0} aria-label="Step timeline"
            aria-valuetext={`${fmt(t)} of ${fmt(d)}`} onChange={(e) => seek(Number(e.currentTarget.value))} />
        </div>
        <span className="studio-time" aria-hidden="true">{d ? `${fmt(t)} / ${fmt(d)}` : 'Still'}</span>
      </div>
    </div>
  );
}

export function CameraBar() {
  const mode = useStudio((s) => s.cameraMode);
  const selection = useStudio((s) => s.selection);
  return (
    <div className="studio-camera" role="group" aria-label="View">
      <button type="button" className="studio-button studio-button-wide" onClick={resetCamera} aria-pressed={mode === 'guided'}>
        <ResetView />{mode === 'guided' ? 'Guided view' : 'Resume guided view'}
      </button>
      <button type="button" className="studio-button studio-button-wide" onClick={focusSelection} disabled={!selection}><Focus />Frame part</button>
    </div>
  );
}

export function PerfHud() {
  const open = useStudio((s) => s.perfOpen);
  const p = usePerfSnapshot(open);
  if (!open) return null;
  const ms = (x?: number) => (x === undefined ? '—' : `${x.toFixed(1)} ms`);
  return (
    <div className="studio-perf" aria-label="Performance">
      <div><b>{p.fps.toFixed(0)}</b> fps · frame {ms(p.meanMs)} · p95 {ms(p.p95Ms)}</div>
      <div>{p.width}×{p.height} css px · dpr {p.dpr} · {p.calls} draws · {p.triangles.toLocaleString()} tris</div>
      <div>manifest {ms(p.load?.manifestFetchMs)} + {ms(p.load?.manifestParseMs)} · glb {ms(p.load?.glbFetchMs)} · decode {ms(p.load?.glbDecodeMs)} · build {ms(p.load?.buildMs)}</div>
      <div>load to first frame {ms(p.firstFrameMs)}</div>
    </div>
  );
}
