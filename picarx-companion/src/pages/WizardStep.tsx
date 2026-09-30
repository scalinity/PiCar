import { useCompanion } from '../features/assembly-session/store';
import {completed} from '../features/assembly-session/commands';
import type {AssemblySession} from '../generated/twin/contracts';
import { M3_ENABLED } from '../lib/m3-enabled';
import { pages, videoBySlug, wizard } from '../content';
import { setStepDone, useProgress } from '../lib/progress-store';
import { SectionView } from '../components/RstRenderer';
import { Checklist } from '../components/Checklist';
import { PdfViewer } from '../components/PdfViewer';
import { VideoEmbed } from '../components/VideoEmbed';

export function WizardStepPage({ stepId }: { stepId: string }) {
  const progress = useProgress();const companion=useCompanion();
  const idx = wizard.findIndex((s) => s.id === stepId);
  const step = wizard[idx];
  if (!step) {
    return (
      <main className="page">
        <h1>Unknown step</h1>
        <p>
          <a href="#/wizard/parts">Start the wizard from the beginning.</a>
        </p>
      </main>
    );
  }
  const done = progress.steps[step.id] === 'done';
  const prev = wizard[idx - 1];
  const next = wizard[idx + 1];

  return (
    <>
      <aside className="ref-sidebar wizard-sidebar">
        <h2 className="wizard-sidebar-title">Setup Wizard</h2>
        <ol className="wizard-steps">
          {wizard.map((s, i) => (
            <li key={s.id}>
              <a href={`#/wizard/${s.id}`} className={s.id === stepId ? 'active' : ''}>
                <span className={`step-num ${progress.steps[s.id] === 'done' ? 'done' : ''}`}>
                  {progress.steps[s.id] === 'done' ? '✓' : i + 1}
                </span>
                {s.title}
              </a>
            </li>
          ))}
        </ol>
      </aside>
      <main className="page doc" key={stepId}>
        <div className="doc-body">
          <p className="wizard-crumb">
            Step {idx + 1} of {wizard.length}
          </p>
          <h1>{step.title}</h1>
          {M3_ENABLED && step.id === 'assembly' && step.assemblyLauncher && <section className="card"><h2>29-step assembly session</h2><p>This setup badge is a self-report. Detailed physical confirmations are stored separately.</p><ul>{companion.sessions.map(a=><li key={a.id}>{(a.snapshot as AssemblySession).variantId}: {completed(a.snapshot as AssemblySession).length}/29 self-confirmed, 0 observed</li>)}</ul><a className="button" href="#/assembly">Open assembly sessions and coverage</a></section>}
          {step.intro && <p className="wizard-intro">{step.intro}</p>}

          {step.checklist && (
            <section className="card wizard-checklist">
              <h2>Checklist</h2>
              <Checklist stepId={step.id} items={step.checklist} />
            </section>
          )}

          {step.pdf && (
            <section className="wizard-pdf">
              <h2>Official assembly booklet</h2>
              <PdfViewer src={step.pdf} />
            </section>
          )}

          {step.videos?.map((slug) => {
            const v = videoBySlug(slug);
            return (
              v && (
                <section key={slug} className="wizard-video">
                  <h2>{v.title}</h2>
                  <VideoEmbed youtubeId={v.youtubeId} title={v.title} />
                </section>
              )
            );
          })}

          {step.content.map((c) => {
            const doc = pages.get(c.page);
            if (!doc) return null;
            const sections = c.section
              ? doc.sections.filter((s) => s.id === c.section)
              : doc.sections;
            return (
              <article className="doc-embed" key={c.page}>
                {sections.map((s) => (
                  <SectionView key={s.id} section={s} />
                ))}
              </article>
            );
          })}

          <footer className="wizard-footer">
            {prev ? (
              <a className="button" href={`#/wizard/${prev.id}`}>
                ← {prev.title}
              </a>
            ) : (
              <span />
            )}
            {M3_ENABLED && step.id==='assembly'?<a className="button" href="#/assembly">Reconcile from a completed assembly session</a>:<button className={`button ${done ? '' : 'primary'}`} onClick={() => setStepDone(step.id, !done)}>
              {done ? '✓ Completed — undo' : 'Mark step complete'}
            </button>}
            {next ? (
              <a className="button" href={`#/wizard/${next.id}`}>
                {next.title} →
              </a>
            ) : (
              <a className="button" href="#/reference">
                Explore the lessons →
              </a>
            )}
          </footer>
        </div>
      </main>
    </>
  );
}
