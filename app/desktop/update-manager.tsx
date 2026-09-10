import { useCallback, useEffect, useState } from 'react';
import { getVersion } from '@tauri-apps/api/app';
import { isTauri } from '@tauri-apps/api/core';
import { relaunch } from '@tauri-apps/plugin-process';
import { check, type Update } from '@tauri-apps/plugin-updater';

const LAST_CHECK = 'afnt-desktop-update-last-check';
const CHECK_INTERVAL = 24 * 60 * 60 * 1000;

type State = 'idle' | 'checking' | 'available' | 'current' | 'downloading' | 'restarting' | 'error';

export default function DesktopUpdateManager() {
  const [state, setState] = useState<State>('idle');
  const [currentVersion, setCurrentVersion] = useState('');
  const [available, setAvailable] = useState<Update | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [message, setMessage] = useState('');

  const checkNow = useCallback(async (manual: boolean) => {
    if (!isTauri()) return;
    setState('checking');
    setMessage('');
    try {
      localStorage.setItem(LAST_CHECK, String(Date.now()));
      const update = await check({ timeout: 30_000 });
      if (!update) {
        setAvailable(null);
        setState(manual ? 'current' : 'idle');
        return;
      }
      setAvailable(update);
      setState('available');
    } catch {
      setState(manual ? 'error' : 'idle');
      if (manual) setMessage('The update service could not be reached. Try again later.');
    }
  }, []);

  useEffect(() => {
    if (!isTauri()) return;
    void getVersion().then(setCurrentVersion).catch(() => {});
    const last = Number(localStorage.getItem(LAST_CHECK) || 0);
    if (!Number.isFinite(last) || Date.now() - last >= CHECK_INTERVAL) {
      const timer = window.setTimeout(() => void checkNow(false), 0);
      return () => window.clearTimeout(timer);
    }
  }, [checkNow]);

  async function install() {
    if (!available) return;
    setState('downloading');
    setMessage('Downloading verified update…');
    let downloaded = 0;
    let contentLength = 0;
    try {
      await available.downloadAndInstall((event) => {
        if (event.event === 'Started') {
          contentLength = event.data.contentLength || 0;
          setProgress(0);
          return;
        }
        if (event.event === 'Progress') {
          downloaded += event.data.chunkLength;
          setProgress(contentLength ? Math.min(100, Math.round(downloaded * 100 / contentLength)) : null);
          return;
        }
        setProgress(100);
      });
      setState('restarting');
      setMessage('Update installed. Restarting…');
      await relaunch();
    } catch {
      setState('error');
      setMessage('The verified update could not be installed. Your current version is unchanged.');
    }
  }

  function dismiss() {
    if (available) void available.close().catch(() => {});
    setAvailable(null);
    setProgress(null);
    setMessage('');
    setState('idle');
  }

  if (!isTauri()) return null;
  const expanded = state !== 'idle';
  return (
    <aside className={`desktop-update${expanded ? ' desktop-update-open' : ''}`} aria-label="Application updates">
      {!expanded && (
        <button type="button" onClick={() => void checkNow(true)}>
          Check for updates{currentVersion ? ` · ${currentVersion}` : ''}
        </button>
      )}
      {expanded && (
        <div role={state === 'error' ? 'alert' : 'status'} aria-live="polite">
          {state === 'checking' && <p>Checking for updates…</p>}
          {state === 'current' && <p>Ad Fontes NT {currentVersion} is up to date.</p>}
          {state === 'available' && available && (
            <>
              <p><strong>Ad Fontes NT {available.version} is available.</strong></p>
              {available.body && <p className="desktop-update-notes">{available.body}</p>}
              <div className="desktop-update-actions">
                <button className="primary" type="button" onClick={() => void install()}>Download and install</button>
                <button type="button" onClick={dismiss}>Later</button>
              </div>
            </>
          )}
          {(state === 'downloading' || state === 'restarting') && (
            <>
              <p>{message}</p>
              {progress !== null && <progress max="100" value={progress}>{progress}%</progress>}
            </>
          )}
          {state === 'error' && <p>{message}</p>}
          {(state === 'current' || state === 'error') && <button type="button" onClick={dismiss}>Close</button>}
        </div>
      )}
    </aside>
  );
}
