import { createRoot } from 'react-dom/client';
import { isTauri } from '@tauri-apps/api/core';
import { openUrl } from '@tauri-apps/plugin-opener';
import Reader from '@/reader/reader';
import { WordStudies } from '@/reader/word-studies';
import { desktopStartPath } from './navigation';
import DesktopUpdateManager from './update-manager';
import Library from '@/library/library';
import '@/app/globals.css';
import '@/reader/word-studies.css';

const startPath = desktopStartPath(location.href);
if (startPath !== null) history.replaceState({}, '', startPath);

// Preserve existing passage URLs. Local assets and routes remain inside the app;
// remote reference links open only after an explicit click, in the system browser.
document.addEventListener('click', event => {
  const anchor = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[href]') : null;
  if (!anchor) return;
  const url = new URL(anchor.href);
  if (url.origin === location.origin) return;
  event.preventDefault();
  event.stopPropagation();
  if (url.protocol !== 'https:') return;
  if (isTauri()) void openUrl(url.href).catch(() => window.alert('The website could not be opened. Please try again when your browser is available.'));
  else window.open(url.href, '_blank', 'noopener,noreferrer');
}, true);

createRoot(document.getElementById('root')!).render(
  <WordStudies offline>
    {location.pathname === '/library' ? <Library offline /> : <Reader />}
    <DesktopUpdateManager />
  </WordStudies>,
);
