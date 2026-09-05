'use client';
import { useEffect, useState, useRef } from 'react';
import { api, useAccount } from './account-client';
import { notesOverlap, type Note } from '@/lib/domain/notes';
import { type PassageRange } from '@/lib/domain/references';
import { getCorpus } from '@/lib/domain/corpus';
const label = (ranges: PassageRange[]) =>
  ranges
    .map((r) => (r.start === r.end ? r.start : `${r.start}–${r.end}`))
    .join('; ');
function download(name: string, text: string, type: string) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export default function PersonalNotes({
  ranges,
  edition,
  selection,
}: {
  ranges: PassageRange[];
  edition: string;
  selection: PassageRange[] | null;
}) {
  const panel = useRef<HTMLDetailsElement>(null);
  const { account, error } = useAccount(),
    [notes, setNotes] = useState<Note[]>([]),
    [draft, setDraft] = useState<Note | null>(null),
    [status, setStatus] = useState(''),
    [busy, setBusy] = useState(false),
    [dirty, setDirty] = useState(false),
    [all, setAll] = useState(false);
  useEffect(() => {
    if (!selection) return;
    if (panel.current) {
      panel.current.open = true;
      panel.current.scrollIntoView({ block: 'start' });
    }
    if (account?.user && (!dirty || confirm('Discard the unsaved draft?'))) {
      setDraft({
        id: crypto.randomUUID(),
        title: '',
        body: '',
        ranges: structuredClone(selection),
        quotation: null,
        version: 0,
        createdAt: '',
        updatedAt: '',
      });
      setDirty(false);
      setStatus('');
      setTimeout(() => document.getElementById('note-title')?.focus(), 0);
    }
  }, [selection]);
  async function load() {
    const result = await api<{ schemaVersion: 1; notes: Note[] }>('/api/notes');
    setNotes(result.notes);
  }
  useEffect(() => {
    if (account?.user) void load().catch((e) => setStatus(e.message));
    else setNotes([]);
  }, [account?.user?.id]);
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);
  async function run(work: () => Promise<void>) {
    setBusy(true);
    setStatus('');
    try {
      await work();
    } catch (e) {
      setStatus((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  function edit(n: Note) {
    if (dirty && !confirm('Discard the unsaved draft?')) return;
    setDraft(structuredClone(n));
    setDirty(false);
    setStatus('');
  }
  async function save() {
    if (!draft) return;
    const exists = draft.version > 0;
    const result = await api<{ note: Note }>(
      '/api/notes' + (exists ? '/' + draft.id : ''),
      exists ? 'PUT' : 'POST',
      draft,
      account?.csrf,
    );
    setDraft(result.note);
    setDirty(false);
    setStatus('Saved to your account.');
    await load();
  }
  return (
    <details ref={panel} className="personal-notes">
      <summary>My notes · private</summary>
      {error && <p role="alert">{error}</p>}
      {!account && !error && <p>Loading account…</p>}
      {account && !account.user && (
        <p>
          {account.enabled
            ? 'Sign in and complete registration to keep private notes across devices.'
            : 'Personal notes are not configured on this installation yet.'}{' '}
          <a href="/account">My account</a>
        </p>
      )}
      {account?.user && (
        <>
          <p>
            Private to {account.user.email}. Notes follow canonical passages
            across translations. Unsaved drafts stay in this page only.
          </p>
          <div className="notes-actions">
            <button
              disabled={busy}
              onClick={() => {
                if (dirty && !confirm('Discard the unsaved draft?')) return;
                setDraft({
                  id: crypto.randomUUID(),
                  title: '',
                  body: '',
                  ranges: structuredClone(ranges),
                  quotation: null,
                  version: 0,
                  createdAt: '',
                  updatedAt: '',
                });
                setDirty(false);
                setStatus('');
              }}
            >
              New note for {label(ranges)}
            </button>
            <button
              disabled={busy}
              onClick={() =>
                run(async () => {
                  await load();
                  setStatus('Saved notes reloaded. Your draft has been kept.');
                })
              }
            >
              Reload saved notes
            </button>
          </div>
          <label className="notes-filter">
            <input
              type="checkbox"
              checked={all}
              onChange={(e) => setAll(e.target.checked)}
            />{' '}
            Show all my notes
          </label>
          <ul>
            {notes
              .filter((n) => all || notesOverlap(n, ranges))
              .map((n) => (
                <li key={n.id}>
                  <button disabled={busy} onClick={() => edit(n)}>
                    {n.title || 'Untitled note'} · {label(n.ranges)}
                  </button>
                </li>
              ))}
          </ul>
          {draft && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void run(save);
              }}
            >
              <p>
                <strong>My note</strong> · {label(draft.ranges)}
              </p>
              <label htmlFor="note-title">Title</label>
              <input
                id="note-title"
                maxLength={160}
                value={draft.title}
                onChange={(e) => {
                  setDraft({ ...draft, title: e.target.value });
                  setDirty(true);
                }}
              />
              <label htmlFor="note-body">Note</label>
              <textarea
                id="note-body"
                rows={8}
                required
                maxLength={50000}
                value={draft.body}
                onChange={(e) => {
                  setDraft({ ...draft, body: e.target.value });
                  setDirty(true);
                }}
              />
              {draft.quotation && (
                <blockquote>
                  <small>
                    Scripture quotation · {draft.quotation.editionId} ·{' '}
                    {draft.quotation.releaseId}
                  </small>
                  <p>{draft.quotation.text}</p>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => {
                      setDraft({ ...draft, quotation: null });
                      setDirty(true);
                    }}
                  >
                    Remove quotation
                  </button>
                </blockquote>
              )}
              <div className="notes-actions">
                <button disabled={busy} type="submit">
                  {busy ? 'Working…' : 'Save note'}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    run(async () => {
                      const corpus = getCorpus(edition);
                      const passage = await corpus.getPassage(draft.ranges);
                      const text = passage.segments
                        .map((s) => s.text)
                        .join('\n');
                      if (!text)
                        throw Error(
                          'This edition has no main text in this passage.',
                        );
                      setDraft({
                        ...draft,
                        quotation: {
                          editionId: edition,
                          releaseId: passage.releaseId,
                          text,
                        },
                      });
                      setDirty(true);
                      setStatus(
                        'Quotation attached to draft. Save to keep it.',
                      );
                    })
                  }
                >
                  Attach {edition} quotation
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    if (!dirty || confirm('Discard the unsaved draft?')) {
                      setDraft(null);
                      setDirty(false);
                    }
                  }}
                >
                  Close draft
                </button>
                {draft.version > 0 && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => {
                      if (confirm('Delete this note from your account?'))
                        void run(async () => {
                          await api(
                            '/api/notes/' + draft.id,
                            'DELETE',
                            { version: draft.version },
                            account?.csrf,
                          );
                          setDraft(null);
                          setDirty(false);
                          await load();
                          setStatus('Note deleted.');
                        });
                    }}
                  >
                    Delete note
                  </button>
                )}
              </div>
              {dirty && <p>Unsaved changes.</p>}
            </form>
          )}
          <div className="notes-actions">
            <button
              disabled={busy}
              onClick={() =>
                run(async () => {
                  const data = await api<{ schemaVersion: 1; notes: Note[] }>(
                    '/api/notes',
                  );
                  download(
                    'ad-fontes-notes.json',
                    JSON.stringify(data),
                    'application/json',
                  );
                  setStatus(
                    'Exported saved notes. Unsaved draft changes are not included.',
                  );
                })
              }
            >
              Export JSON
            </button>
            <button
              disabled={busy}
              onClick={() =>
                run(async () => {
                  const data = await api<{ schemaVersion: 1; notes: Note[] }>(
                    '/api/notes',
                  );
                  download(
                    'ad-fontes-notes.txt',
                    (data.notes as Note[])
                      .map(
                        (n) =>
                          `${n.title || 'Untitled note'}\n${label(n.ranges)}\n${n.body}${n.quotation ? '\n\nQuotation (' + n.quotation.editionId + '):\n' + n.quotation.text : ''}`,
                      )
                      .join('\n\n---\n\n'),
                    'text/plain',
                  );
                  setStatus('Exported saved notes as text.');
                })
              }
            >
              Export readable text
            </button>
          </div>
          <label>
            Import an Ad Fontes JSON export
            <input
              type="file"
              accept=".json,application/json"
              disabled={busy}
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = '';
                if (file)
                  void run(async () => {
                    if (file.size > 10_000_000)
                      throw Error('Import file must be at most 10 MB.');
                    const result = await api<{
                      imported: number;
                      skipped: number;
                    }>(
                      '/api/notes/import',
                      'POST',
                      JSON.parse(await file.text()),
                      account?.csrf,
                    );
                    await load();
                    setStatus(
                      `Imported ${result.imported}; skipped ${result.skipped} unchanged notes.`,
                    );
                  });
              }}
            />
          </label>
          <p>
            Accounts support up to 1,000 notes and an 8 MB JSON export. Imports
            add notes. Identical IDs and content are skipped; differing content
            with the same ID stops the entire import without overwriting
            anything. Exports contain private text—store them accordingly.
          </p>
        </>
      )}
      {status && <p role="status">{status}</p>}
    </details>
  );
}
