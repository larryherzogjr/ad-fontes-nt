'use client';
import HebrewPassage from './hebrew-passage';
import { books } from '@/lib/domain/references';
import { sourceManifest } from '@/lib/domain/original-languages';
import { sourceGreekStudy } from '@/lib/source-study';
import { sourceVerseUrl } from '@/lib/domain/lxx-research';
export type SourceStudyContext = { code: string; chapter: number; label: string; greek: boolean; comparison?: import('react').ReactNode; syncAvailable?: boolean; revision?: string };

import { useEffect, useRef, useState } from 'react';
import { mainEditionUrl } from '@/lib/study-navigation';
import { useVerseSync } from './use-verse-sync';
import { useStudyEdition } from './use-study-edition';
import { formatPassage, formatReference } from '@/lib/reading-display';
import { GreekWordButton, WordDefinition } from './word-lookup';
import LemmaExplorer from './lemma-explorer';
import PublisherNoteLabel from './publisher-note-label';
import EditionSummary from './edition-summary';
import LxxUnpaired from './lxx-unpaired';
import Commentaries from './commentaries';
import TestamentConnections from './testament-connections';
import EvidencePlate from './evidence-plate';
import {
  editions,
  editionsFor,
  getCorpus,
  type Segment,
  type Coverage,
  type PublisherNote,
} from '@/lib/domain/corpus';
import { isOtBook } from '@/lib/domain/ot-release';
import { expand, passageUrl, type PassageRange } from '@/lib/domain/references';
import {
  analysisInfo,
  getAnalysis,
  getLexicon,
  describeMorph,
  type AnalysisSegment,
  type Token,
  type LexiconEntry,
} from '@/lib/domain/greek';
import { describeLxxMorph, lxxRelease } from '@/lib/domain/lxx';
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
  edition,
  source,
}: {
  ranges: PassageRange[];
  source?: SourceStudyContext;
  mode: 'compare' | 'greek' | 'hebrew' | 'notes' | 'connections' | 'commentary';
  edition: string;
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
    [entry, setEntry] = useState<LexiconEntry | null>(null),
    [wordError, setWordError] = useState(''),
    [wordLoading, setWordLoading] = useState(false);
  const [interlinear, setInterlinear] = useState(false);
  const [suppressWordPreviews, setSuppressWordPreviews] = useState(false);
  const [rows, setRows] = useState<string[]>([]);
  const [sync, setSync] = useState(false);
  const [wide, setWide] = useState(false);
  const [hebrewChapter, setHebrewChapter] = useState(() => Number(new URLSearchParams(typeof location === 'undefined' ? '' : location.search).get('hebrewChapter')) || 0);
  const [hebrewChapters, setHebrewChapters] = useState<number[]>([]);
  const [hebrewError, setHebrewError] = useState('');
  const [hebrewChaptersLoading, setHebrewChaptersLoading] = useState(true);
  useEffect(() => {
    if (!source || mode !== 'hebrew') return;
    let active = true;
    setHebrewChaptersLoading(true);
    setHebrewError('');
    sourceManifest('WLC').then(m => {
      if (!active) return;
      const chapters = m.books.find(b => b.code === source.code)?.chapters || [];
      setHebrewChapters(chapters);
      const requested = new URLSearchParams(location.search).get('hebrewChapter');
      const chapter = requested === null ? source.chapter : Number(requested);
      setHebrewChapter(chapters.includes(chapter) ? chapter : 0);
    }).catch(e => { if (active) setHebrewError(e.message); })
      .finally(() => { if (active) setHebrewChaptersLoading(false); });
    return () => { active = false; };
  }, [source?.code, source?.chapter, mode]);
  function changeHebrewChapter(chapter: number) {
    setHebrewChapter(chapter);
    const url = new URL(location.href);
    url.searchParams.set('hebrewChapter', String(chapter));
    url.searchParams.delete('hebrewToken');
    history.replaceState({}, '', url.pathname + url.search);
  }

  const [compact, setCompact] = useState(true);
  const [chosenEditions, setChosenEditions] = useState<string[] | null>(null);
  const [desktop, setDesktop] = useState(false);
  const [trail, setTrail] = useState<StudyTrail>({ items: [], index: -1 });
  const numberSync = !!source && !source.syncAvailable;
  const syncMissing = useVerseSync(dialog, sync && (source?.comparison != null || !compact || (mode === 'greek' || mode === 'hebrew')) && desktop && mode !== 'connections' && mode !== 'commentary', `${mode}-${loading}-${wide}-${compact}-${chosenEditions?.join(',')}-${source?.revision}-${hebrewChapter}`, numberSync);
  const [section, setSection] = useState<'explanation' | 'readings' | 'sources'>('readings');
  const currentEdition = useStudyEdition(dialog, desktop && mode !== 'connections' && mode !== 'commentary' && !loading && !error && !noteOnly && ((mode === 'greek' || mode === 'hebrew') || section === 'readings'), `${mode}-${section}-${wide}-${sync}-${compact}-${chosenEditions?.join(',')}-${formatPassage(ranges)}`);
  useEffect(() => {
    const panel = dialog.current;
    const chrome = panel?.querySelector<HTMLElement>('.study-chrome');
    if (!panel || !chrome) return;
    const measure = () => panel.style.setProperty('--study-chrome-height', `${chrome.getBoundingClientRect().height}px`);
    const observer = new ResizeObserver(measure);
    observer.observe(chrome); measure();
    return () => observer.disconnect();
  }, []);
  const label = source?.label || formatPassage(ranges);
  const ot = !!source || ranges.some(r => isOtBook(r.start.split('.')[0]) || isOtBook(r.end.split('.')[0]));
  const availableEditions = editionsFor(ranges);
  const comparisonIds = [...availableEditions.map(e => e.editionId), ...(ot ? ['lxx-rahlfs'] : [])];
  const visibleEditions = chosenEditions ? [...new Set(chosenEditions)].filter(id => comparisonIds.includes(id)) : null;
  const selectedEditions = visibleEditions?.length ? visibleEditions : comparisonIds;
  useEffect(() => {
    const restore = () => {
      const params = new URL(location.href).searchParams;
      setCompact(params.get('comparisonLayout') !== 'comfortable');
      setChosenEditions(params.has('compareEditions') ? params.get('compareEditions')!.split(',') : null);
    };
    restore(); addEventListener('popstate', restore);
    return () => removeEventListener('popstate', restore);
  }, [label]);
  function setComparisonDisplay(nextCompact: boolean, ids: string[]) {
    setCompact(nextCompact); setChosenEditions(ids);
    const url = new URL(location.href);
    if (nextCompact) url.searchParams.delete('comparisonLayout'); else url.searchParams.set('comparisonLayout', 'comfortable');
    if (ids.length === comparisonIds.length) url.searchParams.delete('compareEditions'); else url.searchParams.set('compareEditions', ids.join(','));
    history.replaceState({}, '', url.pathname + url.search);
  }

  useEffect(() => {
    const params = new URL(location.href).searchParams;
    setSection(mode !== 'notes' && params.get('comparisonSection') === 'readings' ? 'readings' : params.has('unit') || mode === 'notes' ? 'explanation' : 'readings');
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
    const studyLabel = mode === 'hebrew' ? `Hebrew · ${label}` : mode === 'commentary' ? `Commentary · ${label}` : mode === 'connections' ? `NT/OT connections · ${label}` : mode === 'greek' ? `Greek · ${label}` : variants[0]?.title || `${noteOnly ? 'Publisher notes' : 'Compare'} · ${label}`;
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
      if (mode === 'connections' || mode === 'commentary' || mode === 'hebrew' || (source && mode === 'compare')) return;
      const anchors = ranges.flatMap(expand);
      if (anchors.length > 80)
        throw Error(
          'Choose a passage of up to 80 verses for study. Chapter reading remains available.',
        );
      if (mode !== 'greek') {
        const records = await Promise.all(
          availableEditions.map(async (e) => {
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
        if (ot) { const greek = await getAnalysis(ranges); if (active) setAnalysis(greek); }
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
        const data = source ? await sourceGreekStudy(source.code, source.chapter) : await getAnalysis(ranges);
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
  }, [mode, ranges, source?.code, source?.chapter]);
  useEffect(() => {
    if (!token) return;
    wordHeading.current?.focus({ preventScroll: true });
    dialog.current?.querySelector('.greek-inspector')?.scrollTo({ top: 0 });
    if (!desktop) wordHeading.current?.scrollIntoView({ block: 'center' });
    let active = true;
    setWordLoading(true);
    setWordError('');
    setEntry(null);
    getLexicon(token.strongs)
      .then((l) => {
        if (active) {
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
  function choose(t: Token) {
    setToken(t);
    const u = new URL(location.href);
    u.searchParams.set('token', t.id);
    history.replaceState({}, '', u.pathname + u.search);
  }
  function switchMode(next: string) {
    const u = new URL(location.href);
    u.searchParams.set('panel', next);
    if (source) u.searchParams.delete('parallel');
    u.searchParams.delete('token');
    u.searchParams.delete('hebrewToken');
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
  const mainGreekReference = analysis.find(s => s.sourceRef.includes('/') && s.tokens.some(t => t.id === token?.id))?.sourceRef || analysis.find(s => s.sourceRef.includes('/'))?.sourceRef;
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
                    {token.analysisReleaseId ? token.functional || 'Unspecified' : describeMorph(token.functional)}{' '}
                    {!token.analysisReleaseId && <code>{token.functional}</code>}
                  </dd>
                  <dt>Form analysis</dt>
                  <dd>
                    {token.analysisReleaseId ? describeLxxMorph(token.form) : describeMorph(token.form)} <code>{token.form}</code>
                  </dd>
                  <dt>{ot ? 'Septuagint lexical gloss' : 'Berean contextual gloss'}</dt>
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
                  <p role="status">Loading lexical entry…</p>
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
                    <LemmaExplorer key={token.id} lemma={token.lemma} initialSide={ot ? 'lxx' : 'nt'} edition={ot ? edition : 'BSB'} />
                  </>
                )}
                <details className="analysis-provenance">
                  <summary>Word source details</summary>
                  <p>{token.sourceId}</p>{token.analysisReleaseId && <p>Upstream analysis: {token.analysisSource || "unspecified"}; confidence: {token.confidence || "unspecified"}.</p>}
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
      className={`study-dialog${source ? ' source-study-dialog' : ''}${wide ? ' study-dialog-wide' : ''}${sync ? ' verses-synced' : ''}`}
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
            {mode === 'hebrew' ? 'Explore Hebrew' : mode === 'commentary' ? 'Commentaries' : mode === 'connections' ? 'NT/OT Connections' : mode === 'greek' ? 'Explore Greek' : noteOnly ? 'Publisher note study' : loading ? 'Passage study' : variants.length ? <><span className="tool-label-full">Commentary and edition comparison</span><span className="tool-label-short">Commentary &amp; editions</span></> : 'Compare editions'}
          </h2>

        </div>
        <div className="study-window-actions">
        <button disabled={trail.index <= 0} onClick={() => moveStudy(-1)} aria-label="Previous study" title="Previous study">←</button>
        <button disabled={trail.index < 0 || trail.index >= trail.items.length - 1} onClick={() => moveStudy(1)} aria-label="Next study" title="Next study">→</button>
        <button className="study-expand" aria-label={wide ? 'Use standard study width' : 'Widen comparison'} title={wide ? 'Use standard study width' : 'Widen comparison'} aria-pressed={wide} onClick={() => setWide(!wide)}>{wide ? 'Standard width' : 'Widen comparison'} ↔</button>
        <button onClick={onClose} aria-label="Close study panel">
          Close ×
        </button>
        </div>
      </header>
      {!noteOnly && !loading && <nav className="study-tabs" aria-label="Study tools">
        {(!source || source.comparison != null) && <button
          aria-label="Compare editions" aria-pressed={mode === 'compare'}
          onClick={() => mode !== 'compare' && switchMode('compare')}
        >
          <span className="tool-label-full">Compare editions</span><span className="tool-label-short" aria-hidden="true">Compare</span>
        </button>}
        {(!source || source.greek) && <button
          aria-label="Explore Greek" aria-pressed={mode === 'greek'}
          onClick={() => mode !== 'greek' && switchMode('greek')}
        >
          <span className="tool-label-full">Explore Greek</span><span className="tool-label-short" aria-hidden="true">Greek</span>
        </button>}
        {(source ? source.comparison == null && books.slice(0,39).some(b => b.code === source.code) : ot)&&<button aria-label="Explore Hebrew" aria-pressed={mode==='hebrew'} onClick={()=>mode!=='hebrew'&&switchMode('hebrew')}><span className="tool-label-full">Explore Hebrew</span><span className="tool-label-short" aria-hidden="true">Hebrew</span></button>}
        {!source && <><button aria-label="Connections" aria-pressed={mode === 'connections'} onClick={() => mode !== 'connections' && switchMode('connections')}>Connections</button>
        <button aria-pressed={mode === 'commentary'} onClick={() => mode !== 'commentary' && switchMode('commentary')}>Commentaries</button></>}
      </nav>}
      {!source && !loading && !error && mode !== 'hebrew' && mode !== 'greek' && mode !== 'connections' && mode !== 'commentary' && <nav className="comparison-nav" aria-label="Comparison sections">
        <button aria-label={noteOnly ? 'Explanation' : 'Commentary and explanation'} aria-pressed={section === 'explanation'} onClick={() => showSection('explanation')}><span className="tool-label-full">{noteOnly ? 'Explanation' : 'Commentary and explanation'}</span><span className="tool-label-short" aria-hidden="true">{noteOnly ? 'Explanation' : 'Commentary'}</span></button>
        {!noteOnly && <button aria-label="Edition readings" aria-pressed={section === 'readings'} onClick={() => showSection('readings')}><span className="tool-label-full">Edition readings</span><span className="tool-label-short" aria-hidden="true">Readings</span></button>}
        <button aria-pressed={section === 'sources'} onClick={() => showSection('sources')}>Sources</button>
      </nav>}
      {!source && desktop && mode !== 'connections' && mode !== 'commentary' && <div className="study-reading-context"><label className="sync-verses"><input type="checkbox" checked={sync && (!compact || mode === 'greek' || mode === 'hebrew')} disabled={compact && mode !== 'greek' && mode !== 'hebrew'} onChange={event => {
        setSync(event.target.checked);
        try { localStorage.setItem('afnt.sync-verses', String(event.target.checked)); } catch { /* Optional device preference. */ }
      }} />Sync verses</label>
      {currentEdition && <span className="study-current-edition" title={currentEdition} aria-label={`Current edition: ${currentEdition}`}>{currentEdition}</span>}
      </div>}
      {source && <div className="study-reading-context source-context-controls">
        {desktop && <label className="sync-verses"><input type="checkbox" checked={sync} aria-describedby="source-sync-help" onChange={event => {setSync(event.target.checked);try {localStorage.setItem('afnt.sync-verses',String(event.target.checked));} catch {}}}/>{numberSync ? 'Sync by verse number' : 'Sync verses'}</label>}
        {mode === 'hebrew' && <label>Hebrew chapter · {books.find(b => b.code === source.code)?.name || source.code}{' '}
          <select aria-label="Hebrew chapter" value={hebrewChapter} onChange={e => changeHebrewChapter(Number(e.target.value))}>
            <option value={0}>Choose a chapter</option>{hebrewChapters.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>}
        <p id="source-sync-help" className="study-help">{source.syncAvailable ? 'Sync follows the recorded Hebrew-to-English verse mappings; unmapped passages remain independent.' : `${mode === 'hebrew' ? 'Hebrew opens at the same chapter number when available; use the selector to change it.' : mode === 'compare' ? 'Choose an English passage independently.' : 'Greek chapter context from a separate edition.'} Sync by verse number matches chapter and verse labels only. Numbering may differ; this is an approximate reading aid, not a verified passage correspondence.`}</p>
        {syncMissing && <p role="status" className="study-help">{syncMissing}</p>}
      </div>}
      </div><div className="study-content">
      <nav className="study-library-return" aria-label="Study Library return">
        <a href={mode === 'hebrew' ? '/library?view=hebrew' : mode === 'commentary' ? (ot ? '/library?view=commentaries&commentary=kd' : '/library?view=commentaries') : mode === 'connections' ? '/library?view=connections' : mode === 'greek' ? (ot ? '/library?view=research' : '/library?view=lexicon') : '/library'}>← Back to Study Library</a>
      </nav>
      {source?.comparison}
      {mode === 'hebrew' && (source ? <>
        {hebrewError && <p role="alert">{hebrewError}</p>}
        {hebrewChaptersLoading ? <p role="status">Loading Hebrew chapter…</p> : hebrewChapter > 0 ? <HebrewPassage ranges={ranges} source={{code: source.code, chapter: hebrewChapter}} /> : <p>The requested chapter is unavailable in Hebrew. Choose another chapter to read beside your current edition.</p>}
      </> : <HebrewPassage ranges={ranges} />)}
      {mode === 'commentary' && <Commentaries ranges={ranges} />}
      {mode === 'connections' && <TestamentConnections ranges={ranges} edition={edition} embedded onNavigate={followStudy} />}
      {loading && <div className="study-skeleton" role="status" aria-label="Loading passage study"><span /><span /><span /><span /></div>}
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      {!source && !loading && !error && mode !== 'hebrew' && mode !== 'greek' && mode !== 'connections' && mode !== 'commentary' && (
        <>
          {!noteOnly && <details className="comparison-limits"><summary>About edition readings</summary><p>{ot ? 'Compare English translation wording. MSB uses the BSB OT wording; BLB remains a publisher draft. English wording differences alone do not establish a difference in the underlying Hebrew or Aramaic text.' : 'These are named editions, with their own wording and source placement. Differences in English wording alone do not establish a difference in the Greek text.'}</p></details>}
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
          <div hidden={section !== 'readings' || noteOnly} className="comparison-display-options">
            <div className="study-controls" role="group" aria-label="Comparison layout">
              <button aria-pressed={compact} onClick={() => setComparisonDisplay(true, selectedEditions)}>Compact</button>
              <button aria-pressed={!compact} onClick={() => setComparisonDisplay(false, selectedEditions)}>Comfortable</button>
              <span role="status">{selectedEditions.length} editions shown</span>
            </div>
            <details><summary>Choose editions</summary><fieldset className="edition-choices"><legend>Editions to compare</legend>
              {[...availableEditions.map(e => ({id:e.editionId,name:e.name})), ...(ot ? [{id:'lxx-rahlfs',name:'Septuagint · Rahlfs 1935'}] : [])].map(e => <label key={e.id}><input type="checkbox" checked={selectedEditions.includes(e.id)} disabled={selectedEditions.length === 1 && selectedEditions.includes(e.id)} onChange={event => setComparisonDisplay(compact, event.target.checked ? [...selectedEditions,e.id] : selectedEditions.filter(id => id !== e.id))}/>{e.name}</label>)}
              <button onClick={() => setComparisonDisplay(compact, comparisonIds)}>Show all editions</button>
            </fieldset>{compact && <p className="study-help">For synchronized scrolling with the chapter, choose Comfortable.</p>}</details>
          </div>
          <div className={`comparison-readings${compact ? ' comparison-compact' : ''}`} hidden={section !== 'readings'}>
          {!noteOnly && (ot ? ['English translations'] : ['Critical/Eclectic', 'Byzantine Majority', 'Textus Receptus']).filter(group => availableEditions.some(e => (ot || e.group === group) && selectedEditions.includes(e.editionId))).map(
            (group) => (
              <section className="comparison-group" key={group}>
                <h3>{group}</h3>
                {availableEditions
                  .filter((e) => (ot || e.group === group) && selectedEditions.includes(e.editionId))
                  .map((e) => {
                    const record = comparison.find(
                      (c) => c.editionId === e.editionId,
                    )!;
                    return (
                      <article className="edition-reading" data-study-edition={e.name} key={e.editionId}>
                        <p className="compact-edition-group">{group}</p><h4>{e.name}</h4>
                        <a href={passageUrl(ranges, e.editionId)}>
                          Read in context
                        </a>
                        <div className="study-controls"><button disabled={edition === e.editionId} onClick={() => followStudy(mainEditionUrl(ranges, e.editionId, location.href))}>{edition === e.editionId ? 'Main edition' : 'Make this the main edition'}</button></div>
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
                            <p className="study-help">Note categories are added by Ad Fontes to describe the publisher’s footnotes.</p>
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
          )}
          {ot && !noteOnly && selectedEditions.includes('lxx-rahlfs') && <section className="comparison-group lxx-comparison" data-study-edition="Septuagint · Rahlfs 1935"><h3>Septuagint · Rahlfs 1935</h3><p className="study-help">Greek word-token transcription; source verse numbering and correspondence may differ from English.</p><button onClick={() => switchMode('greek')}>Explore Greek / Interlinear</button>{analysis.map(s => <p key={s.sourceRef} className="comparison-scripture" data-sync-edition="lxx-rahlfs" data-sync-anchors={s.anchors.join(' ')}><small>{s.sourceLabel || s.sourceRef}</small> <span lang="grc">{s.text}</span>{s.reason && <span className="notice">{s.reason}</span>}</p>)}</section>}
          </div>
        </>
      )}
      {!loading && !error && mode === 'greek' && (
        <>
          <div className="greek-introduction">
            <p><strong>{ot ? 'Septuagint · Rahlfs 1935' : 'Nestle 1904'}</strong>{interlinear ? ot ? ' · Lexical glosses' : ' · Berean contextual glosses' : ' · Greek text'}</p>
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
              <p className="study-help">{ot ? 'Rahlfs word-token transcription, with Open Scriptorium morphology and exactly matched Eliran Wong lexical glosses. Original word order; punctuation is not supplied. Source texts and alternatives retain their own labels and numbering, which may differ from English. Morphology includes upstream automated analysis with its confidence retained in word details. Glosses are quick lexical aids, not contextual translations or word-by-word links to English.' : 'Source-backed word analysis by Ulrik Sandborg-Petersen. Nestle 1904 Greek with Berean contextual glosses in Greek word order. These glosses are translation aids, not word-by-word links to BSB.'}</p>
            </details>
          </div>
          {!analysis.length && (
            <p className="notice">
              No Greek analysis is available for this selection. This does not mean the text is absent.
            </p>
          )}
          {mainGreekReference && ot && <p><a href={sourceVerseUrl(mainGreekReference)}>Open Greek as the main view →</a></p>}
          {wordError && !token && <p role="alert" className="error">{wordError}</p>}
          <div className={`greek-workspace${token ? ' has-word' : ''}`} data-study-edition={ot ? 'Septuagint · Rahlfs 1935' : editions.find(e => e.editionId === 'N1904')?.name}
            // Returning focus and reflow under a stationary pointer must not reopen previews.
            onPointerMove={() => setSuppressWordPreviews(false)}
            onKeyDown={event => { if (event.key === 'Tab') setSuppressWordPreviews(false); }}
          ><div className="greek-passages">
          {analysis.map((s) => (
            <section key={s.sourceRef} className="greek-verse" data-sync-numbers={source ? s.sourceRef.split('/').at(-1) : undefined} data-sync-anchors={s.anchors.join(' ')} data-sync-edition={ot ? "lxx-rahlfs" : "nestle-analysis"}>
              <h3>{s.sourceLabel || formatReference(s.sourceRef)}</h3>
              {!source && ot && s.status === 'available' && <p className="study-help">Corresponds to {s.anchors.map(formatReference).join(', ')} · {s.alignment?.method || 'source mapping'}.{s.alignment?.flag && ` Upstream mapping note: ${s.alignment.flag}. Wording may substantially differ.`}{s.glossAligned === false && ' Gloss alignment unavailable for this source verse.'}</p>}
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
                    {rows.includes('grammar') && <span className="interlinear-extra" title={`Function: ${t.analysisReleaseId ? t.functional : describeMorph(t.functional)}; form: ${t.analysisReleaseId ? describeLxxMorph(t.form) : describeMorph(t.form)}`}>{t.functional || '—'}{t.form !== t.functional ? ` / ${t.form || '—'}` : ''}</span>}
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
          {!source && ot && <LxxUnpaired segments={analysis} />}
          {ot && <p><a href="/analysis/lxx-source-notices-2026-10-07-v1.json">Original source notices and attribution</a></p>}
          <p>
            <a href={`/analysis/${ot ? lxxRelease : analysisInfo.releaseId}/manifest.json`}>
              Analysis sources and coverage
            </a>
          </p>
        </>
      )}
      </div>
    </dialog>
  );
}
