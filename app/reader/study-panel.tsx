'use client';
import { useEffect, useRef, useState } from 'react';
import { useVerseSync } from './use-verse-sync';
import { useStudyEdition } from './use-study-edition';
import { formatPassage, formatReference } from '@/lib/reading-display';
import { GreekWordButton, WordDefinition } from './word-lookup';
import PublisherNoteLabel from './publisher-note-label';
import EditionSummary from './edition-summary';
import EvidencePlate from './evidence-plate';
import {
  editions,
  getCorpus,
  type Segment,
  type Coverage,
  type PublisherNote,
} from '@/lib/domain/corpus';
import { expand, passageUrl, type PassageRange } from '@/lib/domain/references';
import {
  analysisInfo,
  getAnalysis,
  getOccurrences,
  highlightOccurrences,
  type HighlightedOccurrence,
  getLexicon,
  describeMorph,
  type AnalysisSegment,
  type Token,
  type Occurrences,
  type LexiconEntry,
} from '@/lib/domain/greek';
import { transliterateGreek } from '@/lib/domain/greek-reading';
import { selectStudyUnits, type Variant } from '@/lib/domain/variants';
import { rememberDeviceLink } from '@/lib/device-links';
type Comparison = {
  editionId: string;
  releaseId: string;
  segments: Segment[];
  coverage: Coverage[];
  notes: PublisherNote[];
  alternatives: { sourceId: string; label: string; text: string }[];
};
type StudyTrail = { items: string[]; index: number };
function readStudyTrail(): StudyTrail {
  try {
    const value = JSON.parse(sessionStorage.getItem('afnt-study-trail') || 'null');
    if (value && Array.isArray(value.items) && Number.isInteger(value.index)) return value;
  } catch { /* Start a fresh panel trail. */ }
  return { items: [], index: -1 };
}
function writeStudyTrail(value: StudyTrail) {
  try { sessionStorage.setItem('afnt-study-trail', JSON.stringify(value)); } catch { /* Browser history remains available. */ }
  return value;
}
function CommentaryProse({ text, unit, onSource }: { text: string; unit: Variant; onSource: (id: string) => void }) {
  return <>{text.split('\n\n').map((paragraph, i) => <p key={i}>{paragraph.split(/(\[[SC]\d+(?:,\s*[SC]\d+)*\]|\*\*[^*]+\*\*|\*[^*]+\*)/g).map((part, j) => {
    if (part.startsWith('[')) return <span key={j}>[{part.slice(1, -1).split(/,\s*/).map((id, n) => <span key={id}>{n > 0 && ', '}<a href={`#${unit.id}-source-${id}`} onClick={(event) => { event.preventDefault(); onSource(`${unit.id}-source-${id}`); }}>{id}</a></span>)}]</span>;
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={j}>{part.slice(2, -2)}</strong>;
    if (part.startsWith('*') && part.endsWith('*')) return <em key={j}>{part.slice(1, -1)}</em>;
    return part;
  })}</p>)}</>;
}
export default function StudyPanel({
  ranges,
  mode,
  onClose,
}: {
  ranges: PassageRange[];
  mode: 'compare' | 'greek' | 'notes';
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null),
    backdropPress = useRef(false),
    title = useRef<HTMLHeadingElement>(null),
    wordHeading = useRef<HTMLHeadingElement>(null);
  const refocusInspector = useRef(false);
  const [error, setError] = useState(''),
    [loading, setLoading] = useState(true),
    [comparison, setComparison] = useState<Comparison[]>([]),
    [analysis, setAnalysis] = useState<AnalysisSegment[]>([]),
    [variants, setVariants] = useState<Variant[]>([]),
    [noteOnly, setNoteOnly] = useState(mode === 'notes'),
    [noteLinks, setNoteLinks] = useState<Variant[]>([]),
    [relatedNotes, setRelatedNotes] = useState<Variant[]>([]),
    [token, setToken] = useState<Token | null>(null),
    [occurrences, setOccurrences] = useState<Occurrences | null>(null),
    [entry, setEntry] = useState<LexiconEntry | null>(null),
    [wordError, setWordError] = useState(''),
    [wordLoading, setWordLoading] = useState(false),
    [page, setPage] = useState(1),
    [highlighted, setHighlighted] = useState<HighlightedOccurrence[]>([]),
    [highlightError, setHighlightError] = useState('');
  const [interlinear, setInterlinear] = useState(false);
  const [suppressWordPreviews, setSuppressWordPreviews] = useState(false);
  const [rows, setRows] = useState<string[]>([]);
  const [sync, setSync] = useState(false);
  const [wide, setWide] = useState(false);
  const [desktop, setDesktop] = useState(false);
  const [trail, setTrail] = useState<StudyTrail>({ items: [], index: -1 });
  useVerseSync(dialog, sync && desktop, `${mode}-${loading}-${wide}`);
  const [section, setSection] = useState<'explanation' | 'readings' | 'sources'>('readings');
  const currentEdition = useStudyEdition(dialog, desktop && !loading && !error && !noteOnly && (mode === 'greek' || section === 'readings'), `${mode}-${section}-${wide}-${sync}-${formatPassage(ranges)}`);
  const label = formatPassage(ranges);
  useEffect(() => {
    const params = new URL(location.href).searchParams;
    setSection(params.has('unit') || mode === 'notes' ? 'explanation' : 'readings');
    setInterlinear(params.get('greekView') === 'interlinear');
    let savedRows = '';
    try {
      savedRows = localStorage.getItem('afnt.interlinear.rows') || '';
      setSync(localStorage.getItem('afnt.sync-verses') === 'true');
    } catch { /* Reading still works when device storage is unavailable. */ }
    setRows((params.get('greekRows') ?? savedRows).split(',').filter(r => ['transliteration', 'lemma', 'strongs', 'grammar'].includes(r)));
    const current = location.pathname + location.search;
    const stored = readStudyTrail();
    const initialItems = [...stored.items.slice(0, stored.index + 1), current].slice(-20);
    const next = stored.items[stored.index] === current
      ? stored
      : writeStudyTrail({ items: initialItems, index: initialItems.length - 1 });
    setTrail(next);
  }, []);
  useEffect(() => {
    if (loading || error) return;
    const studyLabel = mode === 'greek' ? `Greek · ${label}` : variants[0]?.title || `${noteOnly ? 'Publisher notes' : 'Compare'} · ${label}`;
    rememberDeviceLink('afnt-recent-studies', { url: location.pathname + location.search, label: studyLabel, detail: label });
  }, [loading, error, mode, noteOnly, variants, label]);
  function setGreekView(next: boolean, nextRows = rows) {
    setInterlinear(next);
    setRows(nextRows);
    const url = new URL(location.href);
    if (next) url.searchParams.set('greekView', 'interlinear');
    else url.searchParams.delete('greekView');
    url.searchParams.set('greekRows', nextRows.join(','));
    try { localStorage.setItem('afnt.interlinear.rows', nextRows.join(',')); } catch { /* Optional device preference. */ }
    history.replaceState({}, '', url.pathname + url.search);
  }
  useEffect(() => {
    const media = matchMedia('(min-width: 1100px)');
    const el = dialog.current;
    function adapt() {
      if (!el) return;
      const active = document.activeElement as HTMLElement | null;
      refocusInspector.current = !!active?.closest('.word-detail');
      const scroll = el.scrollTop;
      el.close();
      if (media.matches) el.show(); else el.showModal();
      setDesktop(media.matches);
      el.scrollTop = scroll;
      if (active && el.contains(active)) active.focus({ preventScroll: true });
      else title.current?.focus({ preventScroll: true });
    }
    adapt();
    media.addEventListener('change', adapt);
    return () => { media.removeEventListener('change', adapt); el?.close(); };
  }, []);
  useEffect(() => {
    if (refocusInspector.current) {
      wordHeading.current?.focus({ preventScroll: true });
      refocusInspector.current = false;
    }
  }, [desktop]);
  function showSection(next: 'explanation' | 'readings' | 'sources') {
    setSection(next);
    dialog.current?.scrollTo({ top: 0 });
  }
  function showSource(id: string) {
    setSection('sources');
    requestAnimationFrame(() => {
      const target = document.getElementById(id);
      for (let parent = target?.parentElement; parent; parent = parent.parentElement)
        if (parent instanceof HTMLDetailsElement) parent.open = true;
      target?.focus({ preventScroll: true });
      target?.scrollIntoView({ block: 'center' });
    });
  }
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    async function run() {
      const anchors = ranges.flatMap(expand);
      if (anchors.length > 80)
        throw Error(
          'Choose a passage of up to 80 verses for study. Chapter reading remains available.',
        );
      if (mode !== 'greek') {
        const records = await Promise.all(
          editions.map(async (e) => {
            const adapter = getCorpus(e.editionId);
            const [p, chapters] = await Promise.all([
              adapter.getPassage(ranges),
              adapter.getReadingChapters(ranges),
            ]);
            const noteIds = new Set(
              p.coverage.flatMap((c) => c.publisherNoteIds),
            );
            return {
              alternatives: chapters.flatMap((c) => [
                ...(c.alternatives || []).filter((a) =>
                  anchors.includes(a.sourceRef),
                ),
                ...c.blocks
                  .filter((b) => b.role === 'publisher-alternative')
                  .map((b) => ({
                    sourceId: b.sourceId,
                    label: `Appended source material · ${c.book} ${c.chapter}`,
                    text: b.runs.map((r) => r.text || '').join(''),
                  })),
              ]),
              ...p,
              notes: chapters
                .flatMap((c) => c.notes)
                .filter((n) => noteIds.has(n.id)),
            };
          }),
        );
        const response = await fetch('/editorial/variants.json');
        if (!response.ok)
          throw Error('Reviewed-note information could not be loaded.');
        const data = (await response.json()) as {
          schemaVersion: number;
          units: Variant[];
        };
        if (
          data.schemaVersion !== 1 ||
          !Array.isArray(data.units) ||
          data.units.some((v) => v.status !== 'approved')
        )
          throw Error('Invalid reviewed-note bundle.');
        const wanted = new Set(anchors),
          matching = data.units.filter((v) =>
            v.ranges.flatMap(expand).some((a) => wanted.has(a)),
          );
        const requested = new URL(location.href).searchParams.get('unit');
        const selection = selectStudyUnits(matching, requested, mode === 'notes');
        if (active) {
          setComparison(records);
          setVariants(selection.selected);
          setNoteOnly(selection.noteOnly);
          if (selection.noteOnly) setSection('explanation');
          setNoteLinks(selection.noteLinks);
          setRelatedNotes(data.units.filter(v => matching.some(m => m.relatedUnits?.includes(v.id))));
        }
      } else {
        const data = await getAnalysis(ranges);
        if (active) {
          setAnalysis(data);
          const id = new URL(location.href).searchParams.get('token');
          if (id) {
            const t = data.flatMap((s) => s.tokens).find((t) => t.id === id);
            if (t) setToken(t);
            else
              setWordError(
                'That word analysis is unavailable for this passage.',
              );
          }
        }
      }
    }
    run()
      .catch((e) => {
        if (active) setError(e.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [mode, ranges]);
  useEffect(() => {
    if (!token) return;
    wordHeading.current?.focus({ preventScroll: true });
    dialog.current?.querySelector('.greek-inspector')?.scrollTo({ top: 0 });
    if (!desktop) wordHeading.current?.scrollIntoView({ block: 'center' });
    let active = true;
    setWordLoading(true);
    setWordError('');
    setOccurrences(null);
    setEntry(null);
    setPage(1);
    Promise.all([getOccurrences(token.lemmaId), getLexicon(token.strongs)])
      .then(([o, l]) => {
        if (active) {
          if (o.releaseId !== analysisInfo.releaseId)
            throw Error('Occurrence release mismatch.');
          setOccurrences(o);
          setEntry(l);
        }
      })
      .catch((e) => {
        if (active) setWordError(e.message);
      })
      .finally(() => {
        if (active) setWordLoading(false);
      });
    return () => {
      active = false;
    };
  }, [token]);
  useEffect(() => {
    let active = true;
    setHighlighted([]);
    setHighlightError('');
    if (occurrences)
      highlightOccurrences(occurrences.hits.slice((page - 1) * 20, page * 20))
        .then((hits) => {
          if (active) setHighlighted(hits);
        })
        .catch(() => {
          if (active)
            setHighlightError(
              'Word highlighting could not be loaded. The source snippets remain available.',
            );
        });
    return () => {
      active = false;
    };
  }, [occurrences, page]);
  function choose(t: Token) {
    setToken(t);
    const u = new URL(location.href);
    u.searchParams.set('token', t.id);
    history.replaceState({}, '', u.pathname + u.search);
  }
  function switchMode(next: string) {
    const u = new URL(location.href);
    u.searchParams.set('panel', next);
    u.searchParams.delete('token');
    u.searchParams.delete('unit');
    followStudy(u.pathname + u.search);
  }
  function followStudy(url: string) {
    const current = location.pathname + location.search;
    const stored = readStudyTrail();
    const base = stored.items[stored.index] === current ? stored : { items: [current], index: 0 };
    const items = [...base.items.slice(0, base.index + 1), url].slice(-20);
    const next = writeStudyTrail({ items, index: items.length - 1 });
    setTrail(next);
    location.assign(url);
  }
  function moveStudy(delta: number) {
    const nextIndex = trail.index + delta;
    if (nextIndex < 0 || nextIndex >= trail.items.length) return;
    const next = writeStudyTrail({ ...trail, index: nextIndex });
    setTrail(next);
    location.assign(next.items[nextIndex]);
  }
  function outsidePanel(event: {
    clientX: number;
    clientY: number;
    currentTarget: HTMLDialogElement;
  }) {
    const bounds = event.currentTarget.getBoundingClientRect();
    return (
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom
    );
  }
  const wordDetails = (
          <section
            className="word-detail"
            aria-live="polite"
            aria-label="Selected Greek word"
          >
            {wordError && token && (
              <p role="alert" className="error">
                {wordError}
              </p>
            )}
            {!token ? (
              analysis.some((s) => s.tokens.length) ? (
                <p>Select a word above.</p>
              ) : null
            ) : (
              <>
                <h3 lang="grc" ref={wordHeading} tabIndex={-1}>
                  {token.surface}
                </h3>
                <button
                  onClick={() => {
                    const el = document.getElementById(`word-${token.id}`);
                    setSuppressWordPreviews(true);
                    setToken(null);
                    setWordError('');
                    const url = new URL(location.href);
                    url.searchParams.delete('token');
                    history.replaceState({}, '', url.pathname + url.search);
                    // Restore the word after the inspector closes and the passage reflows.
                    requestAnimationFrame(() => {
                      el?.focus({ preventScroll: true });
                      el?.scrollIntoView({ block: 'center' });
                    });
                  }}
                >
                  Return to selected verse
                </button>
                <WordDefinition key={token.id} token={token} />
                <dl>
                  <dt>Transliteration · selected form</dt>
                  <dd>{transliterateGreek(token.surface)}</dd>
                  <dt>Lemma (standard form)</dt>
                  <dd lang="grc">{token.lemma}</dd>
                  <dt>Standard form · transliteration & pronunciation</dt>
                  <dd>
                    {wordLoading ? (
                      'Loading pronunciation guide…'
                    ) : entry ? (
                      <>
                        <span lang="grc">{entry.headword}</span>
                        {' · '}
                        {entry.transliteration || 'Transliteration unavailable'}
                        <br />
                        {entry.pronunciation || 'Pronunciation unavailable'}
                        <small className="pronunciation-help">
                          Strong’s historical pronunciation guide for this
                          standard form, which may differ from the selected
                          inflected form. The apostrophe marks stress. This is a
                          written guide, not reconstructed Koine audio.
                        </small>
                      </>
                    ) : (
                      'No source pronunciation guide is available.'
                    )}
                  </dd>
                  <dt>Functional analysis</dt>
                  <dd>
                    {describeMorph(token.functional)}{' '}
                    <code>{token.functional}</code>
                  </dd>
                  <dt>Form analysis</dt>
                  <dd>
                    {describeMorph(token.form)} <code>{token.form}</code>
                  </dd>
                  <dt>Berean contextual gloss</dt>
                  <dd>
                    {token.gloss ||
                      'No verified gloss is attached to this word.'}
                  </dd>
                </dl>
                <p className="study-help">
                  The gloss is a source translation aid for this occurrence. A
                  word’s full meaning depends on its context.
                </p>
                {wordLoading && (
                  <p role="status">Loading lexical entry and occurrences…</p>
                )}
                {!wordLoading && !wordError && (
                  <>
                    <details className="lexical-entry">
                      <summary>
                        Historical dictionary · Strong’s{' '}
                        {token.strongs.split('&')[0]}
                      </summary>
                      <p>
                        James Strong (1890), Greek Dictionary; Ulrik Petersen
                        XML v1.4. This historical entry lists senses and
                        translation uses; it does not determine which sense fits
                        this passage.
                      </p>
                      <p>
                        {entry?.text ||
                          'No entry is available for this source identifier.'}
                      </p>
                    </details>
                    <h4>
                      {occurrences?.hits.length || 0} indexed occurrences of
                      this lemma
                    </h4>
                    <p className="study-help">
                      Within the 7,940 matching Nestle 1904 source verses. Two
                      verses are not indexed. This count is not a count across
                      all Greek editions.
                    </p>
                    {highlightError && <p role="status">{highlightError}</p>}
                    <p className="study-help">
                      The highlighted word is the exact occurrence linked above
                      each verse.
                    </p>
                    {occurrences?.hits
                      .slice((page - 1) * 20, page * 20)
                      .map((h) => (
                        <p key={h.tokenId} className="occurrence">
                          <a
                            href={`${passageUrl([{ start: h.anchor, end: h.anchor }], 'N1904')}&panel=greek&token=${encodeURIComponent(h.tokenId)}`}
                          >
                            {formatReference(h.sourceRef)} · {h.surface}
                          </a>
                          <span lang="grc">
                            {(() => {
                              const match = highlighted.find(
                                (x) => x.tokenId === h.tokenId,
                              );
                              return match ? (
                                <>
                                  {h.text.slice(0, match.start)}
                                  <mark
                                    className="occurrence-match"
                                    aria-label="Matched Greek word"
                                  >
                                    {h.text.slice(match.start, match.end)}
                                  </mark>
                                  {h.text.slice(match.end)}
                                </>
                              ) : (
                                h.text
                              );
                            })()}
                          </span>
                        </p>
                      ))}
                    {!!occurrences?.hits.length && (
                      <nav
                        className="chapter-nav"
                        aria-label="Lemma occurrence pages"
                      >
                        <button
                          disabled={page === 1}
                          onClick={() => setPage(page - 1)}
                        >
                          Previous occurrences
                        </button>
                        <span>
                          Page {page} of{' '}
                          {Math.ceil(occurrences.hits.length / 20)}
                        </span>
                        <button
                          disabled={page * 20 >= occurrences.hits.length}
                          onClick={() => setPage(page + 1)}
                        >
                          Next occurrences
                        </button>
                      </nav>
                    )}
                  </>
                )}
                <details className="analysis-provenance">
                  <summary>Word source details</summary>
                  <p>{token.sourceId}</p>
                  <p>
                    Selected-form transliteration is an application reading aid
                    based on the{' '}
                    <a href="https://www.loc.gov/catdir/cpso/romanization/greek.pdf">
                      ALA-LC Greek letter table
                    </a>
                    ; it omits accents and iota subscript, preserves marked
                    rough breathings, and does not infer missing breathings. It
                    is not phonetic notation.
                  </p>
                  {entry && (
                    <p>
                      Dictionary reading guide: {entry.sourceId}; original XML
                      translit and pronunciation attributes.
                    </p>
                  )}
                  <p>{token.glossSourceId || 'No aligned gloss source.'}</p>
                  <p>
                    Raw Strong’s/TVM field: {token.strongs}. Lemma identity
                    comes from the source lemma, not from this number.
                  </p>
                </details>
              </>
            )}
          </section>
  );
  return (
    <dialog
      ref={dialog}
      className={`study-dialog${wide ? ' study-dialog-wide' : ''}${sync ? ' verses-synced' : ''}`}
      onKeyDown={e => { if (e.key === 'Escape' && desktop && !e.defaultPrevented) { e.preventDefault(); onClose(); } }}
      aria-labelledby="study-title"
      onPointerDown={(e) => {
        backdropPress.current =
          e.button === 0 && e.target === e.currentTarget && outsidePanel(e);
      }}
      onPointerCancel={() => {
        backdropPress.current = false;
      }}
      onClick={(e) => {
        // Both ends must be outside: selecting or dragging text out of the panel must not dismiss it.
        const dismiss =
          backdropPress.current &&
          e.target === e.currentTarget &&
          outsidePanel(e);
        backdropPress.current = false;
        if (dismiss) onClose();
      }}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      <div className="study-chrome"><header className="study-header">
        <div>
          <p className="eyebrow">{label}</p>
          <h2 id="study-title" ref={title} tabIndex={-1}>
            {mode === 'greek' ? 'Explore Greek' : noteOnly ? 'Publisher note study' : loading ? 'Passage study' : 'Compare editions'}
          </h2>

        </div>
        <div className="study-window-actions">
        <button disabled={trail.index <= 0} onClick={() => moveStudy(-1)} aria-label="Previous study" title="Previous study">←</button>
        <button disabled={trail.index < 0 || trail.index >= trail.items.length - 1} onClick={() => moveStudy(1)} aria-label="Next study" title="Next study">→</button>
        <button className="study-expand" aria-label={wide ? 'Use standard study width' : 'Expand study view'} title={wide ? 'Use standard study width' : 'Expand study view'} aria-pressed={wide} onClick={() => setWide(!wide)}>↔</button>
        <button onClick={onClose} aria-label="Close study panel">
          Close ×
        </button>
        </div>
      </header>
      {!noteOnly && !loading && <nav className="study-tabs" aria-label="Study tools">
        <button
          aria-pressed={mode === 'compare'}
          onClick={() => mode !== 'compare' && switchMode('compare')}
        >
          Compare editions
        </button>
        <button
          aria-pressed={mode === 'greek'}
          onClick={() => mode !== 'greek' && switchMode('greek')}
        >
          Explore Greek
        </button>
      </nav>}
      {!loading && !error && mode !== 'greek' && <nav className="comparison-nav" aria-label="Comparison sections">
        <button aria-pressed={section === 'explanation'} onClick={() => showSection('explanation')}>Explanation</button>
        {!noteOnly && <button aria-pressed={section === 'readings'} onClick={() => showSection('readings')}>Edition readings</button>}
        <button aria-pressed={section === 'sources'} onClick={() => showSection('sources')}>Sources</button>
      </nav>}
      {desktop && <div className="study-reading-context"><label className="sync-verses"><input type="checkbox" checked={sync} onChange={event => {
        setSync(event.target.checked);
        try { localStorage.setItem('afnt.sync-verses', String(event.target.checked)); } catch { /* Optional device preference. */ }
      }} />Sync verses</label>
      {currentEdition && <span className="study-current-edition" title={currentEdition} aria-label={`Current edition: ${currentEdition}`}>{currentEdition}</span>}
      </div>}
      </div><div className="study-content">
      {loading && <div className="study-skeleton" role="status" aria-label="Loading passage study"><span /><span /><span /><span /></div>}
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      {!loading && !error && mode !== 'greek' && (
        <>
          {!!variants.length && (
            <nav className="study-library-return" aria-label="Textual comparison collection">
              <a href="/library">← Browse Textual Comparisons</a>
            </nav>
          )}
          {!noteOnly && <p>
            These are named editions, with their own wording and source
            placement. Differences in English wording alone do not establish a
            difference in the Greek text.
          </p>}
          {noteLinks.map(v => { const href = `${passageUrl(v.ranges, new URL(location.href).searchParams.get('translation') || 'BSB')}&panel=notes&unit=${v.id}`; return <p key={v.id}><a href={href} onClick={event => { if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return; event.preventDefault(); followStudy(href); }}>Publisher note study · {v.title}</a></p>; })}
          {!noteOnly && variants.filter(v => v.comparisonNotice).map(v => <p className="notice" key={v.id}>{v.comparisonNotice}</p>)}
          {noteOnly && <section hidden={section !== 'explanation'} aria-label="Publisher notes for this explanation">
            <h3>Publisher notes</h3>
            {variants.flatMap(v => v.publisherNotes || []).map(n => <article key={`${n.releaseId}-${n.noteId}`}>
              <h4>{n.editionId} publisher’s note</h4><p>{n.body}</p><small>Source: {n.noteId} · {n.releaseId}</small>
            </article>)}
          </section>}
          <section className="reviewed-notes" hidden={section !== 'explanation'}>
            <h3>Reviewed explanations</h3>
            {!variants.length ? (
              <p>
                No reviewed note is available for this passage. This does not
                mean there are no textual differences.
              </p>
            ) : (
              variants.map((v) => (
                <article key={v.id} id={`reviewed-${v.id}`}>
                  <h4>{v.title}</h4>
                  <p className="commentary-byline">{v.byline || v.author} commentary</p>
                  <EditionSummary unit={v} />
                  <EvidencePlate unitId={v.id} />
                  <h5>What the editions print</h5>
                  <CommentaryProse onSource={showSource} text={v.significance?.sourceObservation || ''} unit={v} />
                  <h5>Ordinary Means interpretation</h5>
                  <CommentaryProse onSource={showSource} text={v.significance?.interpretation || ''} unit={v} />
                  {!!v.relatedUnits?.length && <nav aria-label={`Related explanations for ${v.title}`}>
                    <h5>Related explanation</h5>
                    {relatedNotes.filter(other => v.relatedUnits?.includes(other.id)).map(other => <p key={other.id}>
                      <a href={`${passageUrl(other.ranges, new URL(location.href).searchParams.get('translation') || 'BSB')}&panel=${other.presentation === 'publisher-note' ? 'notes' : 'compare'}&unit=${encodeURIComponent(other.id)}`} onClick={event => {
                        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                        event.preventDefault(); followStudy(new URL(event.currentTarget.href).pathname + new URL(event.currentTarget.href).search);
                      }}>
                        {formatPassage(other.ranges)} · {other.title}
                      </a>
                    </p>)}
                  </nav>}
                </article>
              ))
            )}
          </section>
          <section hidden={section !== 'sources'} className="comparison-sources" aria-label="Study sources">
            <h3>Sources</h3>
            {variants.map(v => <details key={v.id} className="explanation-sources">
              <summary>{v.title}</summary>
              <h4>Sources for this explanation</h4>
              <ul>{v.explanationSources?.map(c => <li key={c.id} id={`${v.id}-source-${c.id}`} tabIndex={-1}>
                <strong>{c.id}</strong> · {c.url ? <a href={c.url}>{c.label}</a> : c.label}. {c.locator}
              </li>)}</ul>
              <div className="source-links">{v.citations.map((c,i) => <a key={i} href={c.url}>{c.editionId} source</a>)}</div>
            </details>)}
            {!variants.length && <p>No reviewed explanation is available for this selection.</p>}
            <a href="/about/sources">All sources, editions and coverage</a>
          </section>
          <div className="comparison-readings" hidden={section !== 'readings'}>
          {!noteOnly && ['Critical/Eclectic', 'Byzantine Majority', 'Textus Receptus'].map(
            (group) => (
              <section className="comparison-group" key={group}>
                <h3>{group}</h3>
                {editions
                  .filter((e) => e.group === group)
                  .map((e) => {
                    const record = comparison.find(
                      (c) => c.editionId === e.editionId,
                    )!;
                    return (
                      <article className="edition-reading" data-study-edition={e.name} key={e.editionId}>
                        <h4>{e.name}</h4>
                        <a href={passageUrl(ranges, e.editionId)}>
                          Read in context
                        </a>
                        {variants.map(v => {
                          const focus = v.readings.find(r => r.editionId === e.editionId)?.focus;
                          if (!focus) return null;
                          return <section key={v.id} aria-label={`Textual unit for ${v.title}`}>
                            <p className="coverage-note">Reviewed textual unit · {v.title}: {focus.state === 'absent'
                              ? 'The disputed material is absent; neighboring verse text remains below.'
                              : focus.state === 'bracketed' ? 'The following continuous unit is present with source markers.'
                                : 'The following continuous unit is present.'}</p>
                            {!!focus.spans.length && <blockquote lang={e.language}>
                              {focus.spans.map((s, i) => <span key={s.segmentId}>
                                {i > 0 && ' '}<small>{s.segmentId} </small>{s.text}
                              </span>)}
                            </blockquote>}
                          </section>;
                        })}
                        {record.coverage.some(
                          (c) => c.textState === 'absent',
                        ) && (
                          <p className="coverage-note">
                            Absent from this edition’s main text:{' '}
                            {record.coverage
                              .filter((c) => c.textState === 'absent')
                              .map((c) => formatReference(c.anchor))
                              .join(', ')}
                            .
                          </p>
                        )}
                        {record.coverage.some(
                          (c) => c.textState === 'bracketed',
                        ) && (
                          <p className="coverage-note">
                            This source marks part or all of the passage with
                            brackets.
                          </p>
                        )}
                        {record.segments.map((s) => (
                          <p
                            key={s.id}
                            className="comparison-scripture"
                            data-sync-anchors={s.anchors.join(' ')}
                            data-sync-edition={e.editionId}
                            lang={e.language}
                          >
                            <small>{formatReference(s.sourceRef || s.id)}</small> {s.text}
                          </p>
                        ))}
                        {!!record.notes.length && (
                          <details>
                            <summary>
                              {e.editionId} publisher’s notes (
                              {record.notes.length})
                            </summary>
                            <p className="study-help">Note categories are added by Ad Fontes NT to describe the publisher’s footnotes.</p>
                            {record.notes.map((n) => (
                              <div key={n.id}>
                                <PublisherNoteLabel releaseId={record.releaseId} note={n} />
                                <p>{n.body}</p>
                              </div>
                            ))}
                          </details>
                        )}
                        {!!record.alternatives.length && (
                          <details>
                            <summary>Edition’s separate alternatives</summary>
                            {record.alternatives.map((a) => (
                              <p key={a.sourceId}>
                                <small>{a.label}</small>
                                <br />
                                <span lang={e.language}>{a.text}</span>
                              </p>
                            ))}
                          </details>
                        )}
<details className="edition-source"><summary>Source details</summary><p>Source release: {record.releaseId}</p></details>
                      </article>
                    );
                  })}
              </section>
            ),
          )}</div>
        </>
      )}
      {!loading && !error && mode === 'greek' && (
        <>
          <div className="greek-introduction">
            <p><strong>Nestle 1904</strong>{interlinear ? ' · Berean contextual glosses' : ' · Greek text'}</p>
            <p className="study-help">{interlinear ? 'Greek word order; glosses are translation aids. No English word alignment.' : 'Select a word for its definition and analysis. No English word alignment.'}</p>
          </div>
          <div className="interlinear-controls">
            <div className="interlinear-views" role="group" aria-label="Greek display">
              <button aria-pressed={!interlinear} onClick={() => setGreekView(false)}>Greek text</button>
              <button aria-pressed={interlinear} onClick={() => setGreekView(true)}>Interlinear</button>
            </div>
            <details className="display-options"><summary>Display options &amp; analysis information</summary>
              {interlinear && <fieldset className="interlinear-options"><legend>Additional rows</legend>
                {([['transliteration', 'Transliteration'], ['lemma', 'Lemma (standard form)'], ['strongs', 'Strong’s number'], ['grammar', 'Grammar']] as const).map(([key, label]) => <label key={key}><input type="checkbox" checked={rows.includes(key)} onChange={e => setGreekView(true, e.target.checked ? [...rows, key] : rows.filter(r => r !== key))} />{label}</label>)}
              </fieldset>}
              <p className="study-help">Source-backed word analysis by Ulrik Sandborg-Petersen. Nestle 1904 Greek with Berean contextual glosses in Greek word order. These glosses are translation aids, not word-by-word links to BSB.</p>
            </details>
          </div>
          {!analysis.length && (
            <p className="notice">
              This canonical passage has no main-text segment in Nestle 1904.
              Use Compare editions for its edition-specific coverage.
            </p>
          )}
          {wordError && !token && <p role="alert" className="error">{wordError}</p>}
          <div className={`greek-workspace${token ? ' has-word' : ''}`} data-study-edition={editions.find(e => e.editionId === 'N1904')?.name}
            // Returning focus and reflow under a stationary pointer must not reopen previews.
            onPointerMove={() => setSuppressWordPreviews(false)}
            onKeyDown={event => { if (event.key === 'Tab') setSuppressWordPreviews(false); }}
          ><div className="greek-passages">
          {analysis.map((s) => (
            <section key={s.sourceRef} className="greek-verse" data-sync-anchors={s.anchors.join(' ')} data-sync-edition="nestle-analysis">
              <h3>{formatReference(s.sourceRef)}</h3>
              {s.status === 'unavailable' ? (
                <>
                  <p lang="grc" className="comparison-scripture">
                    {s.text}
                  </p>
                  <p className="notice">{s.reason}</p>
                </>
              ) : interlinear ? (
                <div className="interlinear-words" aria-label={`${s.sourceRef} interlinear`}>
                  {s.tokens.map((t, i) => <GreekWordButton token={t} key={t.id} id={`word-${t.id}`} className={`interlinear-word${token?.id === t.id ? ' chosen' : ''}`} selected={token?.id === t.id} suppressPreview={suppressWordPreviews} label={`${t.surface}, ${t.gloss ?? 'Gloss unavailable'}, ${s.sourceRef}, word ${i + 1}`} onChoose={() => choose(t)}>
                    <span lang="grc" className="interlinear-surface">{i === 0 ? s.text.slice(0, t.start) : ''}{t.surface}{s.text.slice(t.end, s.tokens[i + 1]?.start)}</span>
                    <span className="interlinear-gloss">{t.gloss ?? 'Gloss unavailable'}</span>
                    {rows.includes('transliteration') && <span className="interlinear-extra">{transliterateGreek(t.surface)}</span>}
                    {rows.includes('lemma') && <span lang="grc" className="interlinear-extra">{t.lemma}</span>}
                    {rows.includes('strongs') && <span className="interlinear-extra">{t.strongs || 'Number unavailable'}</span>}
                    {rows.includes('grammar') && <span className="interlinear-extra" title={`Function: ${describeMorph(t.functional)}; form: ${describeMorph(t.form)}`}>{t.functional || '—'}{t.form !== t.functional ? ` / ${t.form || '—'}` : ''}</span>}
                  </GreekWordButton>)}
                </div>
              ) : (
                <p lang="grc" className="greek-token-text">
                  {s.tokens.map((t, i) => (
                    <span key={t.id}>
                      {s.text.slice(i ? s.tokens[i - 1].end : 0, t.start)}
                      <GreekWordButton
                        token={t}
                        suppressPreview={suppressWordPreviews}
                        id={`word-${t.id}`}
                        className={
                          token?.id === t.id
                            ? 'greek-token chosen'
                            : 'greek-token'
                        }
                        label={`${t.surface}, ${s.sourceRef}, word ${i + 1}`}
                        selected={token?.id === t.id}
                        onChoose={() => choose(t)}
                      >
                        {t.surface}
                      </GreekWordButton>
                      {i === s.tokens.length - 1 ? s.text.slice(t.end) : ''}
                    </span>
                  ))}
                </p>
              )}
              {!desktop && token && s.tokens.some(t => t.id === token.id) && wordDetails}
            </section>
          ))}
          </div>
          {desktop && token && <aside className="greek-inspector">{wordDetails}</aside>}
          </div>
          <p>
            <a href={`/analysis/${analysisInfo.releaseId}/manifest.json`}>
              Analysis sources, rights and coverage
            </a>
          </p>
        </>
      )}
      </div>
    </dialog>
  );
}
