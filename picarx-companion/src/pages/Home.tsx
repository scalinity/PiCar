import { M3_ENABLED } from '../lib/m3-enabled';
import { wizard } from '../content';
import { useProgress } from '../lib/progress-store';

export function Home() {
  const progress = useProgress();
  const done = wizard.filter((s) => progress.steps[s.id] === 'done').length;
  const next = wizard.find((s) => progress.steps[s.id] !== 'done');
  return (
    <main className="page home">
      <h1>Build your PiCar-X</h1>
      <p className="home-sub">
        A guided path from boxed parts to a driving, seeing, talking robot — every step grounded
        in SunFounder's official documentation.
      </p>

      <section className="home-progress card">
        <h2>Setup progress</h2>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${(done / wizard.length) * 100}%` }} />
        </div>
        <p>
          {done} of {wizard.length} steps complete
        </p>
        <div className="home-actions">
          {next ? (
            <a className="button primary" href={`#/wizard/${next.id}`}>
              {done === 0 ? 'Start setup' : `Continue: ${next.title}`}
            </a>
          ) : (
            <a className="button primary" href="#/reference">
              Setup complete — explore the lessons
            </a>
          )}
          {progress.lastRoute && progress.lastRoute !== '#/' && (
            <a className="button" href={progress.lastRoute}>
              Resume where you left off
            </a>
          )}
        </div>
      </section>

      {M3_ENABLED && <section className="card"><h2>Assembly sessions</h2><p>29-step V40 reference journey with separate physical self-confirmations.</p><a className="button" href="#/assembly">Open assembly overview</a></section>}
      <section className="home-steps">
        {wizard.map((s, i) => (
          <a key={s.id} className={`step-card card ${progress.steps[s.id] === 'done' ? 'done' : ''}`} href={`#/wizard/${s.id}`}>
            <span className="step-num">{progress.steps[s.id] === 'done' ? '✓' : i + 1}</span>
            <span className="step-title">{s.title}</span>
          </a>
        ))}
      </section>
    </main>
  );
}
