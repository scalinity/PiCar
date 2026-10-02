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
export const Isolate = () => <Icon><rect x="8" y="8" width="8" height="8" rx="1.5" /><path d="M3.5 3.5h3M3.5 3.5v3M20.5 3.5h-3M20.5 3.5v3M3.5 20.5h3M3.5 20.5v-3M20.5 20.5h-3M20.5 20.5v-3" /></Icon>;
export const Ghost = () => <Icon><rect x="4" y="4" width="11" height="11" rx="2" strokeDasharray="2.2 2.2" /><rect x="9" y="9" width="11" height="11" rx="2" /></Icon>;
export const Explode = () => <Icon><rect x="9.5" y="9.5" width="5" height="5" rx="1" /><path d="M7 7 4 4M17 7l3-3M7 17l-3 3M17 17l3 3M4 7.5V4h3.5M20 7.5V4h-3.5M4 16.5V20h3.5M20 16.5V20h-3.5" /></Icon>;
export const Clip = () => <Icon><path d="M3.5 12h17" /><path d="M6 15.5 12 19l6-3.5" /><path d="M6 8.5 12 5l6 3.5" strokeDasharray="2 2" /></Icon>;
export const Book = () => <Icon><path d="M12 6.5c-1.8-1.3-4.3-2-7.5-2v13c3.2 0 5.7.7 7.5 2 1.8-1.3 4.3-2 7.5-2v-13c-3.2 0-5.7.7-7.5 2z" /><path d="M12 6.5v13" /></Icon>;
export const Close = () => <Icon><path d="M6.5 6.5l11 11M17.5 6.5l-11 11" /></Icon>;
export const Clear = () => <Icon><path d="M5 12a7 7 0 1 0 2-4.9" /><path d="M5 4.5v3h3" /></Icon>;
