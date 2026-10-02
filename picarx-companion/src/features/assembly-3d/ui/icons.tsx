// One outline family for the Studio: 24-unit grid, 1.5 stroke, round joins.
import type { ReactNode } from 'react';

const Icon = ({ children }: { children: ReactNode }) => (
  <svg className="studio-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
);

export const Back = () => <Icon><path d="M14.5 6 8.5 12l6 6" /></Icon>;
export const Play = () => <Icon><path d="M8 5.5v13l10.5-6.5z" /></Icon>;
export const Pause = () => <Icon><path d="M8.5 5.5v13M15.5 5.5v13" /></Icon>;
export const Replay = () => <Icon><path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3" /><path d="M4.5 4.5v3.7h3.7" /></Icon>;
export const Rewind = () => <Icon><path d="M11 6.5 4.5 12l6.5 5.5zM19.5 6.5 13 12l6.5 5.5z" /></Icon>;
export const Expand = () => <Icon><path d="M4.5 9V4.5H9M15 4.5h4.5V9M19.5 15v4.5H15M9 19.5H4.5V15" /></Icon>;
export const Collapse = () => <Icon><path d="M9 4.5V9H4.5M19.5 9H15V4.5M15 19.5V15h4.5M4.5 15H9v4.5" /></Icon>;
export const Panel = () => <Icon><rect x="3.5" y="4.5" width="17" height="15" rx="2.5" /><path d="M14.5 4.5v15" /></Icon>;
export const ResetView = () => <Icon><circle cx="12" cy="12" r="7.5" /><path d="M12 2.5v4M12 17.5v4M2.5 12h4M17.5 12h4" /></Icon>;
export const Focus = () => <Icon><path d="M4.5 8.5v-4h4M15.5 4.5h4v4M19.5 15.5v4h-4M8.5 19.5h-4v-4" /><circle cx="12" cy="12" r="2.5" /></Icon>;
