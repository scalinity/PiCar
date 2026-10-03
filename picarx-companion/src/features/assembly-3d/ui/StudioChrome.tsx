import { type ReactNode } from 'react';
import { studioHref, type StudioVariant } from '../../../lib/router';
import { entryOf, type DisplayCheck, type DisplayDetail, type LoadedPack, type StepEntry, type Vec3, type VariantEntry } from '../assets/pack';
import { vendorAgreement } from './fidelity';
import { displayNotes } from './display-checks';
import { ManualPanel } from './ManualPanel';
import { manualPanel } from './manual-map';
import { statesAt, type Phase, type Timeline } from '../motion/evaluate';
import { clipRange } from '../motion/inspect';
import {
  focusSelection, frameBounds, pause, play, replay, resetCamera, resetInspection, rewind, seek, select, selectConflict, setClipHeight,
  setManualOpen, toggleDrawer, toggleInspect, useStudio, type InspectTool,
} from '../state/studio-store';
import { fullscreenMode, setFullscreen, useFullscreen, useFullscreenError } from '../state/fullscreen';
import { usePerfSnapshot } from '../state/perf';
import { Back, Book, Clear, Clip, Close, Collapse, Expand, Explode, Focus, Ghost, Isolate, Panel, Pause, Play, Replay, ResetView, Rewind } from './icons';

export const BOARD: Record<StudioVariant, string> = { rpi5: 'Raspberry Pi 5', 'rpi-zero-2-w': 'Raspberry Pi Zero 2 W' };
const SHORT: Record<StudioVariant, string> = { rpi5: 'Pi 5', 'rpi-zero-2-w': 'Zero 2 W' };

function modeText(entry: StepEntry): string {
  if (entry.mode === 'preview') return 'Preview. Poses come from the M7 instructional chain and passed its independent check when this pack was built.';
  if (entry.candidatePlacements) return 'Review only. The overlap check refused this step, so what you see is the unaccepted candidate from the refused record. It is never played as an installation.';
  return 'Review only. The parts sit at their recorded, checked poses, but a connection this step needs is unresolved, so the step is not played as an installation.';
}
const PHASE_TEXT: Record<Phase, string> = {
  installed: 'Installed in this step’s pose', candidate: 'At its pose in the refused candidate (not accepted)', tray: 'In the parts tray (a layout, not an assembly state)',
  waiting: 'Waiting in the tray', 'bring-in': 'Being brought in from the tray (presentation travel)', approach: 'Staged approach from the M7 recipe (not a measured insertion path)',
};
const REQUIRED_TEXT = { introduced: 'introduced', used: 'used', tool: 'needed as a tool', stock: 'stock' } as const;
const STOCK_STATE = { current: 'Used through Step 9', later: 'Later · no implemented placement', spare: 'Spare / backup', tool: 'Kit tool' } as const;

// The matched subset of the maker's-model cross-check, stated as a subset, with every unmatched part named.
function fidelityText(display: DisplayDetail): string {
  const holes = display.relation.mountingHoles?.maxCentreDeviationMm;
  const holeText = holes === undefined || holes === null ? '' : ` Mounting holes, measured on both shapes, agree within ${holes.toFixed(2)} mm.`;
  if (!display.vendorCrossCheck) return `No maker's model was available to compare against.${holeText}`;
  const a = vendorAgreement(display.vendorCrossCheck.parts);
  const subset = a.matched ? ` Among those, centres differ by at most ${a.maxOffsetMm!.toFixed(2)} mm (median ${a.medianOffsetMm!.toFixed(2)} mm).` : '';
  const rest = a.unmatched.length ? ` Not matched closely, so not counted above: ${a.unmatched.join(', ')}.` : '';
  return `${a.matched} of ${a.total} detail parts match a part of the maker's own model (footprint overlap at least half).${subset}${rest}${holeText}`;
}

const name = (pack: LoadedPack, id: string): string => entryOf(pack.manifest, id)?.name ?? id;

function checkText(pack: LoadedPack, check: DisplayCheck | undefined): string {
  if (!check) return 'Not placed in this step.';
  if (check.status === 'NOT_CHECKED') return 'Not checked against this state, so any overlap here is unmeasured.';
  if (!check.overlaps.length) return 'Checked against this step’s closure: no overlap with any other part.';
  return `Checked against this step’s closure; overlaps with ${check.overlaps.map((o) => `the ${name(pack, o.instanceId)} ${o.volumeMm3 >= 10 ? Math.round(o.volumeMm3) : o.volumeMm3.toFixed(1)} mm³`).join(', ')}.`;
}

const ArtifactFile = ({ artifact }: { artifact: { path: string; sha256: string } }) => (
  <code title={artifact.sha256}>{artifact.path.split('/').pop()} ({artifact.sha256.slice(0, 10)})</code>
);


function approachWords(axis: Vec3, metres: number): string {
  const mm = Math.round(metres * 1000);
  const [x, y, z] = axis.map(Math.abs);
  const way = y >= x && y >= z ? (axis[1] < 0 ? 'down' : 'up') : z >= x ? (axis[2] > 0 ? 'forward' : 'backward') : axis[0] > 0 ? 'toward the robot’s left' : 'toward the robot’s right';
  return `moves ${way} ${mm} mm into place`;
}

// Where a part sits in the inventory: its group, its number among the identical pieces steps 1-9 need, its first step.
function inventoryOf(v: VariantEntry, pack: LoadedPack, id: string) {
  const slot = v.tray.instances[id] ?? v.tray.tiles[id];
  if (!slot) return null;
  const definitionId = entryOf(pack.manifest, id)!.definitionId;
  const group = v.tray.groups.find((g) => g.id === slot.group)!;
  const same = group.instanceIds.filter((x) => entryOf(pack.manifest, x)!.definitionId === definitionId);
  return { group, ordinal: same.indexOf(id) + 1, quantity: same.length, firstStep: slot.firstStep, required: slot.required, state: slot.state };
}

function Button({ label, onClick, children, pressed, disabled, wide, shortcut }: { label: string; onClick: () => void; children: ReactNode; pressed?: boolean; disabled?: boolean; wide?: boolean; shortcut?: string }) {
  return (
    <button type="button" className={`studio-button${wide ? ' studio-button-wide' : ''}`} aria-label={wide ? undefined : label} title={shortcut ? `${label} (${shortcut})` : label}
      aria-pressed={pressed} disabled={disabled} onClick={onClick} aria-keyshortcuts={shortcut}>{children}</button>
  );
}

export function Header({ pack, variant, step, root, boardHref }: { pack: LoadedPack; variant: StudioVariant; step: number; root: () => HTMLElement | null; boardHref?: (variant:StudioVariant)=>string }) {
  const full = useFullscreen();
  const fullscreenError = useFullscreenError();
  const drawerOpen = useStudio((s) => s.drawerOpen);
  const coverage = pack.manifest.source.m7Gate.coverage;
  const entry = step > 0 ? pack.manifest.variants[variant].steps[step - 1] : undefined;
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
            <a key={v} href={v === variant ? studioHref(v, step) : boardHref?.(v)??studioHref(v,step)} aria-current={v === variant ? 'true' : undefined} title={BOARD[v]}>{SHORT[v]}</a>
          ))}
        </div>
        <span className="studio-mode-chip" data-mode={entry?.mode ?? 'tray'}
          title={`M7 has accepted ${coverage.complete} of ${coverage.required} step closures. This is a preview pack, not an engineering pack.`}>
          {entry ? (entry.mode === 'review' ? 'Review' : 'Preview') : 'Parts tray'}
        </span>
        <Button label={drawerOpen ? 'Hide instructions' : 'Show instructions'} pressed={drawerOpen} onClick={toggleDrawer} shortcut="I"><Panel /></Button>
        <Button label={full ? 'Exit fullscreen' : `Enter fullscreen (${fullscreenMode()})`} pressed={full}
          onClick={() => { const el = root(); if (el) void setFullscreen(!full, el); }}>{full ? <Collapse /> : <Expand />}</Button>
        {fullscreenError && <span className="studio-fullscreen-error" role="status">{fullscreenError}</span>}
      </div>
    </header>
  );
}

function Inspector({ pack, variant, timeline }: { pack: LoadedPack; variant: StudioVariant; timeline: Timeline }) {
  const selected = useStudio((s) => s.selection);
  const t = useStudio((s) => s.t);
  const v = pack.manifest.variants[variant];
  // A selection from the other board is cleared by the frame loop; until then it is not this board's part.
  const selection = selected && (v.tray.instances[selected] || v.tray.tiles[selected]) ? selected : null;
  if (!selection) return <p className="studio-hint">Select a part in the view or a list to see what it is and where its shape and pose come from.</p>;
  const where = inventoryOf(v, pack, selection)!;
  const step = timeline.step > 0 ? v.steps[timeline.step - 1] : undefined;
  const ident = (
    <>
      <dt>Instance</dt><dd><code>{selection}</code>{where.quantity > 1 ? ` · ${where.ordinal} of ${where.quantity} identical pieces in the full kit` : ''}</dd>
      <dt>Inventory</dt><dd>{where.group.label} · {STOCK_STATE[where.state]}{where.firstStep !== null ? ` · first ${REQUIRED_TEXT[where.required]} in step ${where.firstStep}` : ' · no planned step'}</dd>
    </>
  );
  const schematic = pack.manifest.schematic[selection];
  if (schematic) {
    return (
      <section className="studio-inspector" aria-label="Selected part">
        <h3>{schematic.name}</h3>
        <dl>
          <dt>Definition</dt><dd>{schematic.recordName} <code>{schematic.definitionId}</code></dd>
          {ident}
          <dt>Shown as</dt><dd>A tray tile. {schematic.representation}</dd>
        </dl>
        <button type="button" className="studio-link-button" onClick={focusSelection}>Frame this tile</button>
      </section>
    );
  }
  const instance = pack.manifest.instances[selection], definition = pack.manifest.definitions[instance.definitionId];
  const state = statesAt(v, timeline, t).get(selection);
  const tray = v.tray.instances[selection];
  return (
    <section className="studio-inspector" aria-label="Selected part">
      <h3>{instance.name}</h3>
      <dl>
        <dt>Definition</dt><dd>{instance.recordName} <code>{instance.definitionId}</code></dd>
        {ident}
        <dt>Now</dt><dd>{state ? PHASE_TEXT[state.phase] : '—'}</dd>
        {definition.display ? (<>
          <dt>Displayed shape</dt>
          <dd data-artifact="displayed">A detailed model drawn from {definition.display.source.split(' (')[0]}. <ArtifactFile artifact={definition.display.artifact} /></dd>
          <dt>Checked shape</dt>
          <dd data-artifact="checked">{definition.approximation}. The assembly checks use this shape, not the one shown. <ArtifactFile artifact={definition.artifact} /></dd>
          <dt>Matched reference features</dt><dd>{fidelityText(definition.display)}</dd>
          <dt>In this step</dt><dd>{checkText(pack, step?.displayChecks.find((c) => c.definitionId === instance.definitionId))}</dd>
        </>) : (<>
          {definition.displayWithheld && (<><dt>Detailed model</dt><dd>{definition.displayWithheld.label}.</dd></>)}
          <dt>Shape</dt>
          <dd data-artifact="checked">{definition.approximation}. Shown and checked as this shape. <ArtifactFile artifact={definition.artifact} /></dd>
        </>)}
        <dt>Pose from</dt><dd>{(state?.placed || state?.phase === 'approach') && step?.source.file
          ? <><code title={step.source.sha256}>{step.source.file.split('/').pop()}</code>{state?.phase === 'candidate' && step.source.candidateRecord ? <> (candidate from <code>{step.source.candidateRecord.split('/').pop()}</code>)</> : null}</>
          : `Tray layout${tray?.orientation === 'part-local' ? ', part-local orientation (no installed pose yet)' : ''}`}</dd>
      </dl>
      <button type="button" className="studio-link-button" onClick={focusSelection}>Frame this part</button>
    </section>
  );
}

// One row per definition, with a numbered chip per instance when there are several identical pieces.
type Row = { definitionId: string; ids: string[]; note: string };
function rows(pack: LoadedPack, ids: string[], note: (id: string) => string): Row[] {
  const out: Row[] = [];
  for (const id of ids) {
    const definitionId = entryOf(pack.manifest, id)!.definitionId, text = note(id);
    const row = out.find((r) => r.definitionId === definitionId && r.note === text);
    if (row) row.ids.push(id); else out.push({ definitionId, ids: [id], note: text });
  }
  return out;
}

function PartRows({ pack, list }: { pack: LoadedPack; list: Row[] }) {
  const selection = useStudio((s) => s.selection);
  return (
    <ul className="studio-parts">
      {list.map((r) => (
        <li key={`${r.definitionId}|${r.note}`}>
          <button type="button" aria-pressed={r.ids.includes(selection ?? '')} onClick={() => select(r.ids[0])}>
            <span className="studio-part-name">{name(pack, r.ids[0])}{r.ids.length > 1 && <b className="studio-qty">×{r.ids.length}</b>}</span>
            <span className="studio-part-note">{r.note}</span>
          </button>
          {r.ids.length > 1 && (
            <span className="studio-chips" role="group" aria-label={`Each ${name(pack, r.ids[0])}`}>
              {r.ids.map((id) => <button key={id} type="button" aria-pressed={selection === id} title={id} onClick={() => select(id)}>{Number(id.slice(id.lastIndexOf('-') + 1))}</button>)}
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}

function StepParts({ pack, variant, entry }: { pack: LoadedPack; variant: StudioVariant; entry: StepEntry }) {
  const v = pack.manifest.variants[variant];
  const previous = entry.printedNumber > 1 ? v.steps[entry.printedNumber - 2].placements : {};
  const placedLater = (id: string) => v.steps.find((s) => s.printedNumber > entry.printedNumber && s.newlyPlacedInstanceIds.includes(id))?.printedNumber;
  const note = (id: string): string => {
    const use = entry.stepParts.find((p) => p.instanceId === id)!.use;
    if (v.tray.tiles[id]) return use === 'tool' ? 'kit tool, listed as a tile' : 'shown as a tile: no 3D shape';
    if (use === 'placed') {
      if (entry.candidatePlacements) return 'candidate pose from the refused record';
      if (entry.mode === 'review') return 'at its recorded pose; not played';
      const r = entry.recipes.find((x) => x.instanceId === id);
      return r ? approachWords(r.approachAxis, r.approachDistanceM) : 'the workpiece; placed directly';
    }
    if (use === 'new') { const later = placedLater(id); return later ? `stays in the tray until step ${later}` : 'stays in the tray'; }
    return 'already in place';
  };
  const inStep = entry.stepParts.filter((p) => p.use === 'placed' || p.use === 'new' || (p.use === 'uses' && !previous[p.instanceId])).map((p) => p.instanceId);
  const worksOn = entry.stepParts.filter((p) => p.use === 'uses' && previous[p.instanceId]).map((p) => p.instanceId);
  const tools = entry.stepParts.filter((p) => p.use === 'tool').map((p) => p.instanceId);
  return (
    <section aria-label="Parts in this step">
      <h3>In this step</h3>
      {inStep.length ? <PartRows pack={pack} list={rows(pack, inStep, note)} /> : <p className="studio-hint">No new parts.</p>}
      {worksOn.length > 0 && (<><h4>Works on</h4><PartRows pack={pack} list={rows(pack, worksOn, note)} /></>)}
      {tools.length > 0 && (<><h4>Tools</h4><PartRows pack={pack} list={rows(pack, tools, note)} /></>)}
    </section>
  );
}

// The step as the repository's source-intent record states it; quoted, never paraphrased.
function SourceIntent({ entry }: { entry: StepEntry }) {
  const i = entry.instruction;
  return (
    <section className="studio-intent" aria-label="From the step record">
      <h3>From the step record</h3>
      <dl>
        <dt>Parts</dt><dd>{i.parts}</dd>
        <dt>Hardware</dt><dd>{i.hardware}</dd>
        {i.variant && (<><dt>This board</dt><dd>{i.variant}</dd></>)}
        <dt>Tools</dt><dd>{i.tools}</dd>
        <dt>Orientation</dt><dd>{i.orientation}</dd>
      </dl>
      {entry.warnings.map((w) => <p key={w.id} className="studio-caution" role="note"><b>{w.severity === 'caution' ? 'Caution' : w.severity}</b> {w.text}</p>)}
      <details className="studio-limits"><summary>Connection details</summary><p>{i.connection}</p><p className="studio-source-line"><code>{i.id}</code> in <code>{i.record}</code></p></details>
    </section>
  );
}

const CONFLICT_REASON: Record<string, string> = { OVER_SCOPED_BUDGET: 'over the allowed contact budget' };

function Review({ pack, entry }: { pack: LoadedPack; entry: StepEntry }) {
  const conflict = useStudio((s) => s.conflict);
  if (entry.candidatePlacements) {
    return (
      <section className="studio-review" aria-label="Why this step is in review">
        <h3>Refused by the overlap check</h3>
        <p>The candidate puts these parts through each other by more than the check allows, so the step was refused and nothing here is adopted. Pick a pair to see it.</p>
        <ul className="studio-conflicts">
          {entry.conflicts.map((c, i) => (
            <li key={c.instances.join()}>
              <button type="button" aria-pressed={conflict === i} onClick={() => selectConflict(conflict === i ? null : i)}>
                <span>{c.instances.map((id) => name(pack, id)).join(' × ')}</span>
                <span className="studio-volume">{c.volumeMm3.toFixed(1)} mm³{c.reason ? ` · ${CONFLICT_REASON[c.reason] ?? c.reason}` : ''}</span>
              </button>
            </li>
          ))}
        </ul>
        <p className="studio-source-line">Candidate placements from <code>{entry.source.candidateRecord?.split('/').pop()}</code>; refusal <code>{entry.source.file?.split('/').pop()}</code>.</p>
      </section>
    );
  }
  const ends = entry.focusInstanceIds.map((id) => name(pack, id));
  return (
    <section className="studio-review" aria-label="Why this step is in review">
      <h3>A connection is unresolved</h3>
      {entry.blockers.map((b) => (
        <p key={b.id}>{(b.connectionIds ?? []).map((c) => <code key={c}>{c}</code>)}: the {ends[0]} lead to the {ends[1]}. Its cable end has no recorded frame, so where it plugs in cannot be placed or checked. The highlighted parts sit at their recorded, checked poses.</p>
      ))}
    </section>
  );
}

function TrayInventory({ pack, variant }: { pack: LoadedPack; variant: StudioVariant }) {
  const v = pack.manifest.variants[variant], inv = v.tray.inventory;
  const note = (id: string): string => {
    const slot = v.tray.instances[id] ?? v.tray.tiles[id];
    return `${STOCK_STATE[slot.state]}${slot.firstStep !== null ? ` · step ${slot.firstStep}` : ''}${v.tray.tiles[id] ? ' · tile: no 3D shape' : ''}`;
  };
  return (
    <section aria-label="Parts inventory">
      <p className="studio-inventory" data-testid="tray-inventory"><b>{inv.canonical}</b> canonical stock · {inv.modeled} modelled · {inv.tiles} tiles</p>
      <p className="studio-source-line">{inv.required} used through Step 9 · {inv.later} later · {inv.spares} spares · {inv.tools} tools included</p>
      {v.tray.groups.map((g) => (
        <details key={g.id} className="studio-group">
          <summary><span>{g.label}</span><b>{g.instanceIds.length}</b>
            <button type="button" className="studio-link-button" onClick={(e) => { e.preventDefault(); frameBounds(g.boundsM); }}>Frame</button>
          </summary>
          <PartRows pack={pack} list={rows(pack, g.instanceIds, note)} />
        </details>
      ))}
      <p className="studio-source-line">All canonical stock is visible, including the selected user board. These are source claims, not a count of your loose kit. Later parts remain inspectable; only Steps 1–9 have Studio placement.</p>
    </section>
  );
}

export function Drawer({ pack, variant, step, requestedStep, timeline, buildAlong }: { pack: LoadedPack; variant: StudioVariant; step: number; requestedStep: number; timeline: Timeline; buildAlong?: ReactNode }) {
  const open = useStudio((s) => s.drawerOpen);
  const v = pack.manifest.variants[variant];
  const entry: StepEntry | undefined = step > 0 ? v.steps[step - 1] : undefined;
  const coverage = pack.manifest.source.m7Gate.coverage;
  const panel = entry ? manualPanel(entry.printedNumber, variant) : null;
  return (
    <aside className="studio-drawer" data-open={open} data-mode={entry?.mode ?? 'tray'} aria-hidden={!open} aria-label="Instructions" inert={!open}>
      {requestedStep !== step && (
        <p className="studio-notice" role="status">Step {requestedStep} is not available on this board. Showing step {step}.</p>
      )}
      <p className="studio-kicker">{entry ? `Step ${entry.printedNumber} of 29 · ${BOARD[variant]}` : `Parts tray · ${BOARD[variant]}`}</p>
      <h2 className="studio-step-title">{entry ? entry.title : 'Full-kit parts tray'}</h2>
      {entry ? <p className={`studio-mode-line${entry.mode === 'review' ? ' studio-mode-review' : ''}`}>{modeText(entry)}</p>
        : <p className="studio-source-line">Laid out by kind beside the chassis: a layout for looking and counting, not a stage of the build.</p>}
      {buildAlong}
      {entry?.mode === 'review' && <Review pack={pack} entry={entry} />}
      {entry?.dependencyWarnings.map((w) => (
        <p key={w.printedNumber} className="studio-dependency" role="note">Step {w.printedNumber} is {w.display === 'UNAVAILABLE' ? 'not available' : 'still under review'}. Previewing step {entry.printedNumber} does not certify step {w.printedNumber}.</p>
      ))}

      {entry && (
        <section className="studio-manual" aria-label="Printed manual">
          <div className="studio-manual-head">
            <h3>Printed manual</h3>
            {panel && <button type="button" className="studio-link-button" onClick={() => setManualOpen(true)}><Book />Enlarge</button>}
          </div>
          <ManualPanel step={entry.printedNumber} variant={variant} width={318} />
          {panel && <p className="studio-source-line">{panel.photoPanel.replace(' / ', ' · ')} · page {panel.pdfPage} of the V40 booklet</p>}
        </section>
      )}
      {entry ? <StepParts pack={pack} variant={variant} entry={entry} /> : <TrayInventory pack={pack} variant={variant} />}
      {entry && <SourceIntent entry={entry} />}

      <Inspector pack={pack} variant={variant} timeline={timeline} />

      <section className="studio-status" aria-label="Status">
        <dl className="studio-truths">
          <dt>Assembly check</dt><dd>Not accepted yet. M7 has accepted {coverage.complete} of {coverage.required} steps.</dd>
          <dt>Your car</dt><dd>Only explicit owner confirmations record physical progress. Watching, replaying or scrubbing never marks a step done.</dd>
        </dl>
        {entry && displayNotes(pack, entry).map((t) => <p key={t} className="studio-source-line" role="note">{t}</p>)}
        {entry && entry.limitations.length > 0 && (
          <details className="studio-limits">
            <summary>Source limitations ({entry.limitations.length})</summary>
            <ul>{entry.limitations.map((l) => <li key={l}>{l}</li>)}</ul>
          </details>
        )}
        <p className="studio-pack-line">Pack <code title={pack.manifest.packId}>{pack.manifest.packId.slice(0, 12)}</code> from chain run {pack.manifest.source.chain.label} (source mode)</p>
      </section>
    </aside>
  );
}

// The enlarged manual panel, over the view; Escape or the close button dismisses it.
export function ManualOverlay({ variant, step }: { variant: StudioVariant; step: number }) {
  const open = useStudio((s) => s.manualOpen);
  if (!open || step === 0) return null;
  const width = Math.min(980, Math.round(window.innerWidth * 0.78)), maxHeight = window.innerHeight - 120;
  return (
    <div className="studio-manual-overlay" role="dialog" aria-label={`Printed manual, step ${step}`} onClick={(e) => { if (e.target === e.currentTarget) setManualOpen(false); }}>
      <div className="studio-manual-sheet">
        <Button label="Close the manual" onClick={() => setManualOpen(false)}><Close /></Button>
        <ManualPanel step={step} variant={variant} width={width} maxHeight={maxHeight} />
      </div>
    </div>
  );
}

const fmt = (s: number): string => `${s.toFixed(1)} s`;

export function Dock({ pack, variant, step, timeline, onStep }: { pack: LoadedPack; variant: StudioVariant; step: number; timeline: Timeline; onStep?: (step: number)=>void }) {
  const t = useStudio((s) => s.t);
  const playing = useStudio((s) => s.playing);
  const steps = pack.manifest.variants[variant].steps;
  const entry = step > 0 ? steps[step - 1] : undefined;
  const d = timeline.duration;
  return (
    <div className="studio-dock" role="group" aria-label="Step controls">
      <ol className="studio-rail" aria-label="Steps">
        <li><a href={studioHref(variant, 0)} aria-current={step === 0 ? 'step' : undefined} title="Parts tray">Parts</a></li>
        {steps.map((s) => (
          <li key={s.printedNumber}>
            {s.mode !== 'closed' ? (
              <a href={studioHref(variant, s.printedNumber)} onClick={()=>{if(step!==s.printedNumber)onStep?.(s.printedNumber);}} aria-current={step === s.printedNumber ? 'step' : undefined} data-mode={s.mode}
                title={`${s.title}. ${s.mode === 'review' ? 'Review only.' : 'Preview.'}`}>{s.printedNumber}</a>
            ) : (
              <span className="studio-rail-later" title={`${s.title}. Not available.`} aria-disabled="true">{s.printedNumber}</span>
            )}
          </li>
        ))}
      </ol>
      {entry?.mode === 'review' ? (
        <p className="studio-transport-note" role="status">Review: shown as recorded, not played as an installation.</p>
      ) : (
        <div className="studio-transport">
          <Button label="Rewind" onClick={rewind} disabled={d === 0 || t === 0}><Rewind /></Button>
          <Button label={playing ? 'Pause' : 'Play step'} onClick={() => (playing ? pause() : play(d))} disabled={d === 0} shortcut="Space">{playing ? <Pause /> : <Play />}</Button>
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
          <span className="studio-time" aria-hidden="true">{d ? `${fmt(t)} / ${fmt(d)}` : step === 0 ? 'Tray' : 'Still: nothing moves'}</span>
        </div>
      )}
    </div>
  );
}

const TOOLS: { tool: InspectTool; label: string; key: string; icon: () => ReactNode }[] = [
  { tool: 'isolate', label: 'Isolate', key: 'O', icon: Isolate },
  { tool: 'ghost', label: 'Ghost others', key: 'G', icon: Ghost },
  { tool: 'explode', label: 'Explode', key: 'E', icon: Explode },
  { tool: 'clip', label: 'Deck clip', key: 'C', icon: Clip },
];

// Inspection on a slim rail at the left edge (pressed tools are active, one reset clears them), and the camera's guided
// view and framing at the lower left.
export function ViewTools({ pack, variant, step }: { pack: LoadedPack; variant: StudioVariant; step: number }) {
  // Field by field, so playback (which changes only t) never re-renders the tools.
  const s = {
    isolate: useStudio((x) => x.isolate), ghost: useStudio((x) => x.ghost), explode: useStudio((x) => x.explode), clip: useStudio((x) => x.clip),
    clipHeightM: useStudio((x) => x.clipHeightM), cameraMode: useStudio((x) => x.cameraMode), selection: useStudio((x) => x.selection),
  };
  const v = pack.manifest.variants[variant];
  const entry = step > 0 ? v.steps[step - 1] : undefined;
  const range = s.clip ? clipRange(pack.manifest, v, entry) : null;
  const active = TOOLS.filter(({ tool }) => s[tool]).map(({ label }) => label);
  return (
    <>
      <div className="studio-rail-tools" role="group" aria-label={`Inspect${active.length ? `: ${active.join(', ')} on` : ''}`}>
        {TOOLS.map(({ tool, label, key, icon: Icon }) => (
          <button key={tool} type="button" className="studio-button studio-tool" aria-pressed={s[tool]} aria-label={label} data-tip={`${label}  ${key}`}
            aria-keyshortcuts={key} onClick={() => toggleInspect(tool)} disabled={tool === 'explode' && !entry}><Icon /></button>
        ))}
        {active.length > 0 && (
          <button type="button" className="studio-button studio-tool studio-reset" aria-label="Reset inspection" data-tip="Reset inspection" onClick={resetInspection}><Clear /></button>
        )}
        {range && (
          <label className="studio-clip">
            <span>Cut height</span>
            <input type="range" min={range.min} max={range.max} step={0.0005} value={s.clipHeightM ?? range.deck} aria-label="Deck clip height"
              onChange={(e) => setClipHeight(Number(e.currentTarget.value))} />
          </label>
        )}
      </div>
      <div className="studio-camera" role="group" aria-label="View">
        <button type="button" className="studio-button studio-button-wide" onClick={resetCamera} aria-pressed={s.cameraMode === 'guided'} title="Guided view (R)">
          <ResetView />{s.cameraMode === 'guided' ? 'Guided view' : 'Resume guided view'}
        </button>
        <button type="button" className="studio-button studio-button-wide" onClick={focusSelection} disabled={!s.selection} title="Frame part (F)"><Focus />Frame part</button>
      </div>
    </>
  );
}

export function PerfHud() {
  const open = useStudio((s) => s.perfOpen);
  const p = usePerfSnapshot(open);
  if (!open) return null;
  const ms = (x?: number) => (x === undefined ? '—' : `${x.toFixed(1)} ms`);
  return (
    <div className="studio-perf" aria-label="Performance">
      <div><b>{p.activeFps.toFixed(0)}</b> fps over {p.activeFrames} active frames · mean {ms(p.activeMeanMs)} · p95 {ms(p.activeP95Ms)} · display ≈ {ms(p.displayPeriodMs)}</div>
      <div>{p.width}×{p.height} css px · dpr {p.dpr} · {p.calls} draws · {p.triangles.toLocaleString()} tris</div>
      <div>{p.load ? <>manifest {ms(p.load.manifestFetched - p.load.fetchStart)} · glb {ms(p.load.glbFetched - p.load.manifestFetched)} · verify {ms(p.load.verified - p.load.glbFetched)} · decode {ms(p.load.decoded - p.load.verified)} · build {ms(p.load.built - p.load.decoded)}</> : 'load —'}</div>
      <div>page start → canvas {ms(p.openToCanvasMs)} · first render {ms(p.openToFirstRenderMs)} · first frame drawn {ms(p.openToFirstFrameDrawnMs)}</div>
    </div>
  );
}

export const studioSummary = (pack: LoadedPack, variant: StudioVariant, step: number): string => {
  const v = pack.manifest.variants[variant];
  if (step === 0) return `Parts tray: ${v.tray.inventory.visible} pieces, ${v.tray.inventory.modeled} modelled, ${v.tray.inventory.tiles} shown as tiles`;
  const e = v.steps[step - 1];
  return `Step ${step}: ${e.title}. ${e.mode === 'review' ? 'Review only' : 'Preview'}`;
};
