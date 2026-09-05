'use client';
import { useEffect, useState } from 'react';
export type Account = {
  enabled: boolean;
  csrf?: string;
  user: { id: string; name: string; email: string } | null;
  pending: boolean;
  pendingEmail?: string;
};
export async function api<T = { ok: boolean }>(
  path: string,
  method = 'GET',
  body?: unknown,
  csrf?: string,
) {
  const response = await fetch(path, {
    method,
    credentials: 'same-origin',
    cache: 'no-store',
    headers:
      method === 'GET'
        ? {}
        : { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf || '' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = (await response.json()) as { error?: string };
  if (!response.ok)
    throw Error(data.error || 'Request failed. Please try again.');
  return data as T;
}
export function useAccount() {
  const [account, setAccount] = useState<Account | null>(null),
    [error, setError] = useState('');
  async function refresh() {
    try {
      setAccount(await api<Account>('/api/account'));
      setError('');
    } catch {
      setError('Account service is unavailable. Reading remains available.');
    }
  }
  useEffect(() => {
    void refresh();
  }, []);
  return { account, error, refresh };
}
export default function AccountClient() {
  const { account, error, refresh } = useAccount(),
    [password, setPassword] = useState(''),
    [message, setMessage] = useState(''),
    [busy, setBusy] = useState(false);
  async function act(action: string) {
    setBusy(true);
    setMessage('');
    try {
      const result = await api<{ url?: string }>(
        '/api/account/' + action,
        'POST',
        action === 'register' ? { password } : {},
        account?.csrf,
      );
      setPassword('');
      if (result.url) location.assign(result.url);
      else await refresh();
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="account-page">
      <a href="/">← Return to reading</a>
      <h1>My account</h1>
      <p>Ad Fontes NT · Ordinary Means</p>
      {(error || message) && <p role="alert">{error || message}</p>}
      {!account && !error && <p role="status">Loading account…</p>}
      {account && !account.enabled && (
        <p>
          Personal accounts are not configured on this installation yet.
          Scripture and study tools remain available.
        </p>
      )}
      {account?.enabled && account.user && (
        <>
          <p>
            Signed in as {account.user.name} ({account.user.email}).
          </p>
          <p>
            Your personal notes belong to this account. Open “My notes” in the
            reader to write, export or import them.
          </p>
          <button disabled={busy} onClick={() => act('logout')}>
            Sign out
          </button>
        </>
      )}
      {account?.enabled && !account.user && !account.pending && (
        <>
          <p>
            Read and study without an account. Sign in with Google to use
            private personal notes across devices.
          </p>
          <p>
            First-time registration also requires the shared registration
            password from Ordinary Means.
          </p>
          <button disabled={busy} onClick={() => act('login')}>
            Sign in with Google
          </button>
          <p>
            We receive your Google account identifier, name and email. Your
            notes are stored by Ad Fontes, not in Google Drive. We do not
            request access to your mail or files.
          </p>
        </>
      )}
      {account?.enabled && account.pending && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void act('register');
          }}
        >
          <p>
            Google identified you as {account.pendingEmail}. Enter the shared
            registration password once to activate your private account.
          </p>
          <label htmlFor="registration-password">Registration password</label>
          <input
            id="registration-password"
            type="password"
            autoComplete="off"
            required
            maxLength={512}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button disabled={busy} type="submit">
            Activate my account
          </button>
          <button disabled={busy} type="button" onClick={() => act('logout')}>
            Use another Google account
          </button>
        </form>
      )}
    </main>
  );
}
