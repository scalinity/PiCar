import type { MouseEvent } from 'react';
import { openUrl } from '@tauri-apps/plugin-opener';
import { parseRoute, useHash } from './lib/router';
import { Home } from './pages/Home';
import { WizardStepPage } from './pages/WizardStep';
import { Reference } from './pages/Reference';
import { Videos } from './pages/Videos';

function handleExternalLinks(e: MouseEvent<HTMLElement>) {
  const a = (e.target as HTMLElement).closest('a[href^="http"]');
  if (a) {
    e.preventDefault();
    void openUrl((a as HTMLAnchorElement).href);
  }
}

const SECTIONS = [
  { key: 'home', href: '#/', label: 'Home' },
  { key: 'wizard', href: '#/wizard/parts', label: 'Setup Wizard' },
  { key: 'reference', href: '#/reference', label: 'Reference' },
  { key: 'videos', href: '#/videos', label: 'Video Course' },
] as const;

export default function App() {
  const route = parseRoute(useHash());
  return (
    <div className="app" onClickCapture={handleExternalLinks}>
      <header className="topbar" data-tauri-drag-region>
        <span className="topbar-title" data-tauri-drag-region>
          PiCar-X Companion
          <span className="silk hw-chip">v2 · Robot HAT</span>
        </span>
        <nav className="topbar-nav">
          {SECTIONS.map((s) => (
            <a key={s.key} href={s.href} className={route.name === s.key ? 'active' : ''}>
              {s.label}
            </a>
          ))}
        </nav>
      </header>
      <div className="app-body">
        {route.name === 'home' && <Home />}
        {route.name === 'wizard' && <WizardStepPage stepId={route.step} />}
        {route.name === 'reference' && <Reference page={route.page} section={route.section} />}
        {route.name === 'videos' && <Videos slug={route.slug} />}
      </div>
    </div>
  );
}
