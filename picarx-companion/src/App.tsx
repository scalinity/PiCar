import { M3_ENABLED } from './lib/m3-enabled';
import { Component, lazy, Suspense } from 'react';
import { SaveStatus } from './features/assembly-session/SaveStatus';
import { useCompanion } from './features/assembly-session/store';
const Assembly = lazy(() => import('./pages/Assembly'));
const Studio = lazy(() => import('./pages/Studio'));
import type { MouseEvent,ReactNode }
from 'react';
import { isTauri } from '@tauri-apps/api/core';
import { saveError } from './features/assembly-session/store';
import { openUrl } from '@tauri-apps/plugin-opener';
import { parseRoute, useHash } from './lib/router';
import { Home } from './pages/Home';
import { WizardStepPage } from './pages/WizardStep';
import { Reference } from './pages/Reference';
import { Videos } from './pages/Videos';

function handleExternalLinks(e: MouseEvent<HTMLElement>) {
  const a = (e.target as HTMLElement).closest('a[href^="http"]');
  if (a && isTauri()) {
    e.preventDefault();
    void openUrl((a as HTMLAnchorElement).href).catch(saveError);
  }
}

class AssemblyBoundary extends Component<{children:ReactNode},{failed:boolean}>{
 state={failed:false};static getDerivedStateFromError(){return {failed:true};}
 render(){return this.state.failed?<main className="page"><h1>Assembly recovery</h1><p role="alert">Assembly could not open. Saved data remains available for export.</p><a href="#/reference">Open reference</a><button className="button" onClick={()=>location.reload()}>Retry loading assembly</button></main>:this.props.children;}
}
class StudioBoundary extends Component<{children:ReactNode},{failed:string|null}>{
 state={failed:null as string|null};static getDerivedStateFromError(e:unknown){return {failed:e instanceof Error?e.message:String(e)};}
 render(){return this.state.failed?<main className="page"><h1>Assembly Studio could not open</h1><p role="alert">{this.state.failed}</p><p><button className="button" onClick={()=>{void import("./features/assembly-3d/assets/pack").then((m)=>{m.resetPackForRetry();this.setState({failed:null});});}}>Try again</button> <a href="#/">Back to the companion</a></p></main>:this.props.children;}
}
const SECTIONS = [
  { key: 'home', href: '#/', label: 'Home' },
  { key: 'wizard', href: '#/wizard/parts', label: 'Setup Wizard' },
  { key: 'reference', href: '#/reference', label: 'Reference' },
  { key: 'videos', href: '#/videos', label: 'Video Course' },
  { key: 'assembly', href: '#/assembly', label: 'Assembly' },
  { key: 'studio', href: '#/studio', label: 'Studio' },
] as const;

export default function App() {
  const route = parseRoute(useHash());
  const persistence = useCompanion();
  if (route.name === 'studio') return (
    <div className="app app-studio" onClickCapture={handleExternalLinks}>
      <StudioBoundary><Suspense fallback={<main className="studio-loading">Loading the Studio parts…</main>}><Studio variant={route.variant} step={route.step} /></Suspense></StudioBoundary>
    </div>
  );
  return (
    <div className="app" onClickCapture={handleExternalLinks}>
      <header className="topbar" data-tauri-drag-region>
        <span className="topbar-title" data-tauri-drag-region>
          PiCar-X Companion
          <span className="silk hw-chip">{M3_ENABLED?'Z0104V40 · reference':'v2 · Robot HAT'}</span>
        </span>
        <nav className="topbar-nav">
          {SECTIONS.filter(s => s.key !== 'assembly' || M3_ENABLED).map((s) => (
            <a key={s.key} href={s.href} className={route.name === s.key ? 'active' : ''}>
              {s.label}
            </a>
          ))}
        </nav>
      </header>
      {M3_ENABLED && <SaveStatus />}
      <div className="app-body">
        {route.name === 'home' && (!M3_ENABLED || persistence.initialized ? <Home /> : <main className="page">Opening saved progress…</main>)}
        {route.name === 'wizard' && (!M3_ENABLED || persistence.initialized ? <WizardStepPage stepId={route.step} /> : <main className="page">Opening saved progress…</main>)}
        {route.name === 'reference' && <Reference page={route.page} section={route.section} />}
        {route.name === 'videos' && <Videos slug={route.slug} />}
      {route.name === 'assembly' && !M3_ENABLED && <main className="page"><h1>M3 acceptance pending</h1><p>The assembly feature remains disabled while adapter and native validation are blocked.</p><a href="#/">Home</a></main>}
        {route.name === 'assembly' && M3_ENABLED && <AssemblyBoundary key={`${route.sessionId}:${route.printedStep}:${route.partId}`}><Suspense fallback={<main className="page">Opening assembly…</main>}><Assembly key={`${route.sessionId}:${route.printedStep}:${route.partId}`} sessionId={route.sessionId} printedStep={route.printedStep} partId={route.partId} /></Suspense></AssemblyBoundary>}
        {route.name === 'routeError' && <main className="page"><h1>Navigation recovery</h1><p role="alert">{route.message}</p><a href="#/">Home</a></main>}
        {(route.name === 'reference' || route.name === 'videos') && route.returnTo && <a className="button" href={route.returnTo}>Return to assembly bookmark</a>}
      </div>
    </div>
  );
}
