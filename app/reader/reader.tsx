'use client';
import { noteContent } from './publisher-note-content';
import { useEffect, useRef, useState } from 'react';
import {version as desktopVersion} from '@/package.json';
import { writeClipboard } from '@/lib/clipboard';
import StudyPanel from './study-panel';
import TestamentConnections from './testament-connections';
import GreekResearch from './greek-research';
import OriginalLanguageReader from './original-language-reader';
import EnglishSeptuagintReader from './lxx-english-reader';
import ConnectionCatalog from './connection-catalog';
import PublisherFootnote from './publisher-footnote';
import { Popover, PopoverTrigger, PopoverContent, PopoverTitle } from '@/components/ui/popover';
import { formatCopyWithReference, formatPassage, formatPassageText, formatReference, searchHighlights } from '@/lib/reading-display';
import { relatedResources } from '@/lib/domain/resources';
import { useReaderEnvironment } from './environment';
import RelatedResources from './related-resources';
import ReadingSelection from './reading-selection';
import ReviewedMarkers, { InlineReviewedMarkers, useReviewedUnits } from './reviewed-markers';
import { reviewedAt, verseAnchors } from '@/lib/domain/reviewed-markers';
import type { Variant } from '@/lib/domain/variants';
import { PublisherNoteCategory, PublisherNoteDetail } from './publisher-note-label';
import { otEnabled, isOtBook, otEdition } from '@/lib/domain/ot-release';
import { analysisInfo } from '@/lib/domain/greek';
import { NativeSelect } from '@/components/ui/native-select';
import { readDeviceLinks, rememberDeviceLink, type DeviceLink } from '@/lib/device-links';
import {
  books,
  address,
  chapterRange,
  chapterNeighbor,
  resolveReference,
  passageUrl,
  expand,
  type PassageRange,
} from '@/lib/domain/references';
import {
  getCorpus,
  editions,
  type Chapter,
  type SearchHit,
} from '@/lib/domain/corpus';
const initial = chapterRange('JHN', 1);
function get(k: string) {
  try {
    return localStorage.getItem(k);
  } catch {
    return null;
  }
}
export default function Reader() {
  const environment = useReaderEnvironment();
  const reviewed = useReviewedUnits();
  const [passagePickerOpen, setPassagePickerOpen] = useState(false);
  const [pendingBook, setPendingBook] = useState(address(initial.start).book);
  const [pendingChapter, setPendingChapter] = useState(1);
  const [versePickerOpen, setVersePickerOpen] = useState(false);
  const [fromVerse, setFromVerse] = useState(1);
  const [throughVerse, setThroughVerse] = useState(1);
  const openReviewed = (unit: Variant, focusId: string) => openStudy(unit.presentation === 'publisher-note' ? 'notes' : 'compare', unit.ranges, focusId, unit.id);
  const [ranges, setRanges] = useState<PassageRange[]>([initial]),
    [chapters, setChapters] = useState<Chapter[]>([]),
    [mode, setMode] = useState('read'),
    [edition, setEdition] = useState('BSB'),
    [explicitPassage, setExplicitPassage] = useState(false),
    [study, setStudy] = useState<'compare' | 'greek' | 'hebrew' | 'notes' | 'connections' | 'commentary' | null>(null),
    [input, setInput] = useState(''),
    [query, setQuery] = useState(''),
    [filter, setFilter] = useState(''),
    [page, setPage] = useState(1),
    [results, setResults] = useState<{
      hits: SearchHit[];
      total: number;
      page: number;
    } | null>(null),
    [error, setError] = useState(''),
    [loading, setLoading] = useState(true),
    [size, setSize] = useState(21),
    [focusMode, setFocusMode] = useState(false),
    [showGuide, setShowGuide] = useState(false),
    [recentPassages, setRecentPassages] = useState<DeviceLink[]>([]),
    [selectionCopyStatus, setSelectionCopyStatus] = useState(''),
    [storageError, setStorageError] = useState('');
  const otReading = ranges.some(r => isOtBook(r.start.split('.')[0]) || isOtBook(r.end.split('.')[0]));
  const editionMeta =
    editions.find((e) => e.editionId === edition) || editions[0];
  const link = (rs: PassageRange[]) => passageUrl(rs, edition);
  const request = useRef(0),
    focusAfter = useRef(false),
    restoration = useRef<number | null>(null),
    selection = useRef(new Set<string>()),
    main = useRef<HTMLElement>(null);
  function verseLink(ch: Chapter, anchor: string, source?: string) {
    const segment = ch.segments.find((s) => s.sourceRef === (source || anchor));
    const anchors =
      segment?.mappingType === 'join' &&
      (ch.book === '3JN' || ch.book === '2CO')
        ? segment.anchors
        : [anchor];
    return link([{ start: anchors[0], end: anchors[anchors.length - 1] }]);
  }
  function coverageNotices(ch: Chapter) {
    const out: { coverage: Chapter['coverage'][number]; anchors: string[] }[] =
      [];
    for (const c of ch.coverage.filter(
      (c) =>
        (selection.current.has(c.anchor) || (!explicitPassage && c.textState === 'absent' && reviewedAt(reviewed.units, [c.anchor]).length > 0)) &&
        (c.textState !== 'present' ||
          c.placements?.some((p) => p.mappingType !== 'exact')),
    )) {
      const last = out[out.length - 1];
      if (
        c.textState === 'bracketed' &&
        last?.coverage.textState === 'bracketed' &&
        address(last.anchors[last.anchors.length - 1]).verse + 1 ===
          address(c.anchor).verse
      )
        last.anchors.push(c.anchor);
      else out.push({ coverage: c, anchors: [c.anchor] });
    }
    return out;
  }
  function save(k: string, v: string) {
    try {
      localStorage.setItem(k, v);
    } catch {
      setStorageError('Reading preferences could not be saved on this device.');
    }
  }
  function dismissGuide() {
    setShowGuide(false);
    save('afnt-reader-guide-dismissed', 'true');
  }
  function navigate(url: string) {
    try {
      sessionStorage.setItem('afnt-focus-reading', '1');
    } catch {}
    location.assign(url);
  }
  useEffect(() => {
    try {
      focusAfter.current = sessionStorage.getItem('afnt-focus-reading') === '1';
      sessionStorage.removeItem('afnt-focus-reading');
    } catch {}
    const storedSize = Number(get('afnt-text-size'));
    if (storedSize >= 18 && storedSize <= 32) setSize(storedSize);
    setShowGuide(get('afnt-reader-guide-dismissed') !== 'true');
    setRecentPassages(readDeviceLinks('afnt-recent-passages'));
    const saved = get('afnt-position');
    if (saved)
      try {
        const p = JSON.parse(saved);
        if (typeof p.url === 'string' && p.url.startsWith('/read/')) {
          if (location.pathname === '/') {
            history.replaceState({}, '', p.url);
            restoration.current = Number(p.y) || 0;
          } else if (location.pathname + location.search === p.url)
            restoration.current = Number(p.y) || 0;
        }
      } catch {}
    try {
      const raw =
        sessionStorage.getItem('afnt-reading-return') ||
        sessionStorage.getItem('afnt-study-origin');
      sessionStorage.removeItem('afnt-reading-return');
      if (raw) {
        const state = JSON.parse(raw);
        if (
          state.url === location.pathname + location.search &&
          Number.isFinite(state.y)
        ) {
          restoration.current = state.y;
          sessionStorage.removeItem('afnt-study-origin');
          sessionStorage.setItem('afnt-study-return', state.focusId);
          focusAfter.current = true;
        }
      }
    } catch {}
    function route() {
      const token = ++request.current;
      setError('');
      setLoading(true);
      setChapters([]);
      setResults(null);
      const url = new URL(location.href);
      const panel = url.searchParams.get('panel');
      setStudy(panel === 'compare' || panel === 'hebrew' || panel === 'greek' || panel === 'notes' || panel === 'connections' || panel === 'commentary' ? panel : null);
      if (['WLC','CVUL'].includes(url.searchParams.get('translation')||'')) {setMode('original-language');setStudy(null);setLoading(false);return;}
      if (url.searchParams.get('translation') === 'LXX2012') { setMode('english-lxx'); setStudy(null); setLoading(false); return; }
      let adapter;
      try {
        adapter = getCorpus(url.searchParams.get('translation') || 'BSB');
        setEdition(adapter.editionId);
      } catch (e) {
        setError((e as Error).message);
        setLoading(false);
        return;
      }
      if (url.pathname === '/connections') {setMode('catalog');setStudy(null);setLoading(false);return;}
      if (url.pathname === '/greek') { setMode('research');setStudy(null);setLoading(false);return; }
      if (url.pathname === '/about/sources') {
        setMode('sources');
        setLoading(false);
        setTimeout(() => {
          if (focusAfter.current) main.current?.focus();
          window.scrollTo(0, 0);
        }, 80);
        return;
      }
      if (url.pathname === '/search') {
        setMode('search');
        const q = url.searchParams.get('q') || '',
          f = url.searchParams.get('book') || '',
          p = Number(url.searchParams.get('page') || 1);
        setQuery(q);
        setInput(q);
        setFilter(f);
        setPage(p);
        adapter
          .searchText(q, f, p)
          .then((r) => {
            if (token === request.current) {
              setResults(r);
              setPage(r.page);
              setTimeout(() => {
                if (focusAfter.current) main.current?.focus();
                window.scrollTo(0, 0);
              }, 80);
            }
          })
          .catch((e) => {
            if (token === request.current) setError(e.message);
          })
          .finally(() => {
            if (token === request.current) setLoading(false);
          });
        return;
      }
      setMode('read');
      try {
        const m = /^\/read\/([A-Z0-9]{3})\/(\d+)$/.exec(url.pathname);
        if (url.pathname !== '/' && !m)
          throw new Error('That reading link is not valid.');
        let rs = m ? [chapterRange(m[1], +m[2])] : [initial];
        const p = url.searchParams.get('passage'),
          verses = url.searchParams.get('verses');
        if (p) rs = resolveReference(p);
        else if (verses && m)
          rs = resolveReference(`${m[1]} ${m[2]}:${verses}`);
        setRanges(rs);
        setExplicitPassage(Boolean(p || verses));
        if (!panel) setRecentPassages(rememberDeviceLink('afnt-recent-passages', {
          url: `${location.pathname === '/' ? `/read/${address(rs[0].start).book.code}/${address(rs[0].start).chapter}` : location.pathname}${location.search}`,
          label: formatPassage(rs),
          detail: editions.find(item => item.editionId === adapter.editionId)?.name || adapter.editionId,
        }));
        selection.current = new Set(p || verses ? rs.flatMap(expand) : []);
        (p || verses
          ? adapter.getReadingChapters(rs)
          : Promise.all(
              rs.map((r) => {
                const a = address(r.start);
                return adapter.getChapter(a.book.code, a.chapter);
              }),
            )
        )
          .then((data) => {
            if (token !== request.current) return;
            setChapters(data);
            setLoading(false);
            setInput('');
            setTimeout(() => {
              if (token !== request.current) return;
              if (focusAfter.current) {
                const openPanel = document.querySelector<HTMLDialogElement>('.study-dialog[open]');
                if (openPanel) {
                  if (!openPanel.contains(document.activeElement))
                    document.getElementById('study-title')?.focus({ preventScroll: true });
                } else {
                  let returnId: string | null = null;
                  try {
                    returnId = sessionStorage.getItem('afnt-study-return');
                    sessionStorage.removeItem('afnt-study-return');
                  } catch {}
                  if (returnId) {
                    const target = document.getElementById(returnId);
                    const disclosure = target?.closest('details');
                    if (disclosure) disclosure.open = true;
                    target?.focus();
                  } else main.current?.focus();
                }
                focusAfter.current = false;
              }
              const anchor =
                p || verses
                  ? document.getElementById(rs[0].start) ||
                    document.querySelector<HTMLElement>('.scripture .selected')
                  : null;
              if (restoration.current !== null) {
                window.scrollTo(0, restoration.current);
                restoration.current = null;
              } else if (anchor) anchor.scrollIntoView({ block: 'center' });
              else window.scrollTo(0, 0);
              save(
                'afnt-position',
                JSON.stringify({
                  url: location.pathname + location.search,
                  y: window.scrollY,
                }),
              );
            }, 80);
          })
          .catch((e) => {
            if (token === request.current) {
              setError(e.message);
              setLoading(false);
            }
          });
      } catch (e) {
        setError((e as Error).message);
        setLoading(false);
      }
    }
    route();
    window.addEventListener('popstate', route);
    let timer: ReturnType<typeof setTimeout>;
    const scroll = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (location.pathname.startsWith('/read/') || location.pathname === '/')
          save(
            'afnt-position',
            JSON.stringify({
              url:
                location.pathname === '/'
                  ? '/read/JHN/1'
                  : location.pathname + location.search,
              y: window.scrollY,
            }),
          );
      }, 180);
    };
    window.addEventListener('scroll', scroll);
    return () => {
      request.current++;
      clearTimeout(timer);
      window.removeEventListener('popstate', route);
      window.removeEventListener('scroll', scroll);
    };
  }, []);
  useEffect(() => {
    document.body.classList.toggle('reader-focus-mode', focusMode);
    return () => document.body.classList.remove('reader-focus-mode');
  }, [focusMode]);
  const current = address(ranges[0].start),
    previous = chapterNeighbor(current.book.code, current.chapter, -1),
    last = address(ranges[ranges.length - 1].end),
    next = chapterNeighbor(last.book.code, last.chapter, 1);
  function goBook(b: string, c: number) {
    navigate(`/read/${b}/${c}?translation=${encodeURIComponent(isOtBook(b) && !otEdition(edition) ? 'BSB' : edition)}`);
  }
  function togglePassagePicker(open: boolean) {
    if (open) {
      setPendingBook(current.book);
      setPendingChapter(current.chapter);
    }
    setPassagePickerOpen(open);
  }
  const chapterVerseCount = current.book.verses[current.chapter - 1];
  function toggleVersePicker(open: boolean) {
    if (open) {
      const end = address(ranges[0].end);
      setFromVerse(explicitPassage ? current.verse : 1);
      setThroughVerse(explicitPassage
        ? end.book.code === current.book.code && end.chapter === current.chapter
          ? end.verse : chapterVerseCount
        : 1);
    }
    setVersePickerOpen(open);
  }
  function applyVerseSelection(e: React.FormEvent) {
    e.preventDefault();
    try {
      sessionStorage.removeItem('afnt-study-origin');
      sessionStorage.removeItem('afnt-reading-return');
    } catch {}
    navigate(link([{
      start: `${current.book.code}.${current.chapter}.${fromVerse}`,
      end: `${current.book.code}.${current.chapter}.${throughVerse}`,
    }]));
  }
  function clearSelection() {
    const url = `/read/${current.book.code}/${current.chapter}?translation=${encodeURIComponent(edition)}`;
    try {
      sessionStorage.removeItem('afnt-study-origin');
      sessionStorage.setItem('afnt-reading-return', JSON.stringify({
        url, y: window.scrollY, focusId: 'reading',
      }));
    } catch {}
    navigate(url);
  }
  function selectPassage(chosen: PassageRange[]) {
    const url = link(chosen);
    if (location.pathname + location.search !== url)
      // Reader owns this in-place selection; the router's patched method would remount it and close the action menu.
      History.prototype.pushState.call(history, history.state, '', url);
    if (study) {
      setStudy(null);
      try {
        sessionStorage.removeItem('afnt-study-origin');
        sessionStorage.removeItem('afnt-study-trail');
      } catch {}
    }
    selection.current = new Set(chosen.flatMap(expand));
    setRanges(chosen);
    setExplicitPassage(true);
    setSelectionCopyStatus('');
    setRecentPassages(rememberDeviceLink('afnt-recent-passages', {
      url,
      label: formatPassage(chosen),
      detail: editionMeta.name,
    }));
    save('afnt-position', JSON.stringify({ url, y: window.scrollY }));
  }
  async function copySelection() {
    setSelectionCopyStatus('');
    try {
      const passage = await getCorpus(edition).getPassage(ranges);
      const text = formatPassageText(passage.segments);
      if (!text) throw new Error('No Scripture text is available for this selection.');
      await writeClipboard(formatCopyWithReference(text, ranges, editionMeta.name));
      setSelectionCopyStatus('Selection copied with reference.');
    } catch (error) {
      setSelectionCopyStatus(
        error instanceof Error && error.message.includes('No Scripture text')
          ? error.message
          : 'Copy failed. Please try again.',
      );
    }
  }
  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    try {
      navigate(link(resolveReference(input)));
    } catch (err) {
      if (/\d/.test(input) && !input.startsWith('"'))
        setError((err as Error).message);
      else
        navigate(
          `/search?q=${encodeURIComponent(input)}&translation=${encodeURIComponent(edition)}`,
        );
    }
  }
  function searchPage(p: number, f = filter) {
    navigate(
      `/search?q=${encodeURIComponent(query)}&translation=${encodeURIComponent(edition)}&book=${f}&page=${p}`,
    );
  }
  function openStudy(
    mode: 'compare' | 'greek' | 'hebrew' | 'notes' | 'connections' | 'commentary',
    chosen?: PassageRange[],
    focusId?: string,
    unitId?: string,
  ) {
    try {
      if (!study) sessionStorage.removeItem('afnt-study-trail');
      if (!study || !sessionStorage.getItem('afnt-study-origin')) sessionStorage.setItem(
        'afnt-study-origin',
        JSON.stringify({
          url: location.pathname + location.search,
          y: window.scrollY,
          focusId: focusId || `open-${mode}`,
        }),
      );
    } catch {}
    const selected = chosen || ranges;
    navigate(`${passageUrl(selected, edition)}&panel=${mode}${unitId ? `&unit=${encodeURIComponent(unitId)}` : ''}`);
  }
  function closeStudy() {
    try {
      const raw = sessionStorage.getItem('afnt-study-origin');
      sessionStorage.removeItem('afnt-study-origin');
      if (raw) {
        const state = JSON.parse(raw);
        if (
          typeof state.url === 'string' &&
          (state.url === '/' || state.url.startsWith('/read/')) &&
          !state.url.includes('panel=')
        ) {
          sessionStorage.setItem('afnt-reading-return', raw);
          navigate(state.url);
          return;
        }
      }
    } catch {}
    try {
      sessionStorage.setItem(
        'afnt-study-return',
        study === 'hebrew' ? 'open-hebrew' : study === 'commentary' ? 'open-commentary' : study === 'connections' ? 'open-connections' : study === 'greek' ? 'open-greek' : 'open-compare',
      );
    } catch {}
    const url = new URL(location.href);
    url.searchParams.delete('panel');
    url.searchParams.delete('hebrewToken');
    url.searchParams.delete('token');
    url.searchParams.delete('unit');
    navigate(url.pathname + url.search);
  }
  function openDisclosure(id: string) {
    const disclosure = document.getElementById(id) as HTMLDetailsElement | null;
    if (disclosure) { disclosure.open = true; disclosure.querySelector('summary')?.focus(); disclosure.scrollIntoView({ block: 'start', behavior: 'smooth' }); }
  }
  function jumpNote(id: string) { openDisclosure(id); }
  if (mode === 'original-language') return <OriginalLanguageReader/>;
  if (mode === 'english-lxx') return <EnglishSeptuagintReader/>;
  return (
    <>
      <a className="skip" href="#reading">
        Skip to reading
      </a>
      <header className="masthead">
        <a
          className="brand"
          href="/"
          onClick={(e) => {
            e.preventDefault();
            goBook(current.book.code, current.chapter);
          }}
        >
          Ad Fontes
          <span>A biblical study environment from Ordinary Means.</span>
        </a>
        <nav aria-label="Primary">
          <a
            className={mode === 'read' ? 'active' : ''}
            href={`/read/${current.book.code}/${current.chapter}`}
            onClick={(e) => {
              e.preventDefault();
              goBook(current.book.code, current.chapter);
            }}
          >
            Read
          </a>
          <a href="/library">Library</a>
          <a
            href="/about/sources"
            onClick={(e) => {
              e.preventDefault();
              navigate(
                `/about/sources?translation=${encodeURIComponent(edition)}`,
              );
            }}
          >
            Sources &amp; Editions
          </a>

          <a href="/downloads">Downloads</a>
        </nav>
        <details className="mobile-nav">
          <summary>Menu</summary>
          <nav aria-label="Mobile primary">
            <a className={mode === 'read' ? 'active' : ''} href={`/read/${current.book.code}/${current.chapter}`}>Read</a>
            <a href="/library">Library</a>
            <a href={`/about/sources?translation=${encodeURIComponent(edition)}`}>Sources &amp; Editions</a>

          <a href="/downloads">Downloads</a>
            <span className="mobile-nav-subtitle">A biblical study environment from Ordinary Means.</span>
          </nav>
        </details>
      </header>

      {mode !== 'research' && mode !== 'catalog' && <div className={`toolbar${mode === 'search' ? ' search-toolbar' : ''}`}>
        {mode !== 'search' && mode !== 'research' && mode !== 'catalog' && <div className="passage-navigation">
          <button className="chapter-step" aria-label="Previous chapter" disabled={!previous} onClick={() => previous && goBook(previous.book, previous.chapter)}>←</button>
          <span className="toolbar-label">Passage</span>
          <Popover open={passagePickerOpen} onOpenChange={togglePassagePicker}><PopoverTrigger className="passage-trigger">{current.book.name} {current.chapter} <span aria-hidden="true">⌄</span></PopoverTrigger>
            <PopoverContent className="reader-popover" align="start"><PopoverTitle>Go to a passage</PopoverTitle>
        <form onSubmit={(e) => {
          e.preventDefault();
          goBook(pendingBook.code, pendingChapter);
        }}>
        <div className="pickers">
          <label>
            Book
            <NativeSelect
              aria-label="Book"
              value={pendingBook.code}
              onChange={(e) => {
                setPendingBook(books.find((b) => b.code === e.target.value)!);
                setPendingChapter(1);
              }}
            >
              {books.map((b) => (
                <option key={b.code} value={b.code}>
                  {b.name}
                </option>
              ))}
            </NativeSelect>
          </label>
          <label>
            Chapter
            <NativeSelect
              aria-label="Chapter"
              value={pendingChapter}
              onChange={(e) => setPendingChapter(Number(e.target.value))}
            >
              {pendingBook.verses.map((_, i) => (
                <option key={i + 1}>{i + 1}</option>
              ))}
            </NativeSelect>
          </label>
        </div>
          <button type="submit">OK</button>
        </form>
        {!!recentPassages.length && <div className="recent-passages"><strong>Recent passages</strong>{recentPassages.slice(0, 4).map(item => <a key={item.url} href={item.url}><span>{item.label}</span><small>{item.detail}</small></a>)}</div>}
            </PopoverContent>
          </Popover>
          <button className="chapter-step" aria-label="Next chapter" disabled={!next} onClick={() => next && goBook(next.book, next.chapter)}>→</button>
        </div>}
        <label className="edition-picker">
          Edition
          <NativeSelect
            aria-label="Edition"
            value={edition}
            onChange={(e) => {
              const chosen = e.target.value;
              if (chosen === 'WLC' || chosen === 'CVUL') { navigate(`/read/${chosen === 'WLC' && !isOtBook(current.book.code) ? 'GEN' : current.book.code}/1?translation=${chosen}`); return; }
              if (chosen === 'LXX2012') { navigate(`/read/${isOtBook(current.book.code) ? current.book.code : 'GEN'}/1?translation=LXX2012`); return; }
              if (mode === 'search')
                navigate(
                  `/search?q=${encodeURIComponent(query)}&translation=${encodeURIComponent(chosen)}&book=${filter}`,
                );
              else if (mode === 'sources')
                navigate(
                  `/about/sources?translation=${encodeURIComponent(chosen)}`,
                );
              else
                navigate(
                  explicitPassage
                    ? passageUrl(ranges, chosen)
                    : `/read/${current.book.code}/${current.chapter}?translation=${encodeURIComponent(chosen)}`,
                );
            }}
          >
            <optgroup label="English">
              <option value="LXX2012">LXX2012 · English Septuagint</option>
              {editions
                .filter((e) => e.language === 'en')
                .map((e) => (
                  <option key={e.editionId} value={e.editionId}>
                    {e.name}
                  </option>
                ))}
            </optgroup>
            <optgroup label="Hebrew / Aramaic"><option value="WLC">Westminster Leningrad Codex · Hebrew / Aramaic</option></optgroup><optgroup label="Latin"><option value="CVUL">Clementine Vulgate · Latin</option></optgroup>
            {mode !== 'search' && !otReading && <optgroup label="Greek">
              {editions
                .filter((e) => e.language === 'grc')
                .map((e) => (
                  <option key={e.editionId} value={e.editionId}>
                    {e.name}
                  </option>
                ))}
            </optgroup>}
          </NativeSelect>
        </label>
        {mode === 'search' && <label className="search-book">Search within
          <NativeSelect aria-label="Search within book" value={filter} onChange={e => searchPage(1, e.target.value)}>
            <option value="">All {books.length} books</option>{otEnabled && <><option value="OT">Old Testament</option><option value="NT">New Testament</option></>}{books.map(b => <option key={b.code} value={b.code}>{b.name}</option>)}
          </NativeSelect>
        </label>}
        <div className="toolbar-search unified-reader-search">
        <form onSubmit={submit} className="passage-form" id="passage-search">
          <label htmlFor="reference">Go to a passage or search Scripture</label>
          <div className="input-row">
            <input
              id="reference"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={otEnabled ? 'Genesis 1:1 or grace' : 'Romans 3:23 or grace'}
              autoComplete="off"
            />
            <button type="submit">Go</button>
          </div>
        </form>
        </div>
      </div>}
      <main id="reading" ref={main} tabIndex={-1} className={study ? 'reader-layout has-study' : 'reader-layout'}>
        <div aria-live="polite">
          {loading && <div className="reader-skeleton" role="status" aria-label={`Loading ${edition} Scripture`}><span /><span /><span /></div>}
          {storageError && <p className="notice">{storageError}</p>}
        </div>
        {error && (
          <div role="alert" className="error">
            <h1>Unable to open this request</h1>
            <p>{error}</p>
            <button onClick={() => goBook('JHN', 1)}>Open John 1</button>
          </div>
        )}
        {!loading && !error && mode === 'read' && (
          <>
            <div className="reader-tools">
              <div className="study-actions">
                <button className="study-tool comparison-tool" id="open-compare" onClick={() => openStudy('compare')}><span className="tool-symbol" aria-hidden="true">Aa</span>Compare</button>
                {<button className="study-tool greek-tool" id="open-greek" onClick={() => openStudy('greek')}><span className="tool-symbol" aria-hidden="true">α</span>Greek</button>}
                {otReading&&<button className="study-tool hebrew-tool" id="open-hebrew" onClick={()=>openStudy('hebrew')}><span className="tool-symbol" aria-hidden="true">א</span>Hebrew</button>}
                <button className="study-tool" id="open-commentary" onClick={() => openStudy('commentary')}>Commentaries</button>
                <button className="study-tool connections-tool" id="open-connections" onClick={() => openStudy('connections')}><span className="tool-symbol" aria-hidden="true">↔</span>NT/OT Connections</button>
                {!!relatedResources(ranges).length && <button className="study-tool resource-tool" onClick={() => openDisclosure('related-resources')}><span className="tool-symbol" aria-hidden="true">↗</span>Resources <span className="count">{relatedResources(ranges).length}</span></button>}
                <button className="study-tool focus-tool" aria-pressed={focusMode} onClick={() => setFocusMode(!focusMode)}><span className="tool-symbol" aria-hidden="true">◫</span>{focusMode ? 'Exit focus' : 'Focus'}</button>
              </div>
              <Popover><PopoverTrigger className="settings-trigger" aria-label="Reading settings">Aa</PopoverTrigger>
                <PopoverContent className="reader-popover" align="end"><PopoverTitle>Reading settings</PopoverTitle>
                  <p className="control-label">Scripture text size</p>
              <div className="type-size" aria-label="Text size">
                <button
                  disabled={size <= 18}
                  aria-label="Decrease text size"
                  onClick={() => {
                    setSize(size - 1);
                    save('afnt-text-size', String(size - 1));
                  }}
                >
                  A−
                </button>
                <output aria-label="Current text size">{size}</output>
                <button
                  disabled={size >= 32}
                  aria-label="Increase text size"
                  onClick={() => {
                    setSize(size + 1);
                    save('afnt-text-size', String(size + 1));
                  }}
                >
                  A+
                </button>
              </div>
                  <hr />
                  <strong>{editionMeta.name}</strong><p className="study-help">{editionMeta.description}</p>
                  <div className="content-key" aria-label="Reading marker key"><p><span className="key-om">OM</span> Reviewed Ordinary Means commentary</p><p><span className="key-publisher">†</span> Publisher note</p></div>
                  <button onClick={() => setShowGuide(true)}>Show reader guide</button>
                  <a href="/about/sources">Sources &amp; Editions</a>
                </PopoverContent>
              </Popover>
            </div>
            {showGuide && <aside className="reader-guide" aria-label="Reader guide"><div><strong>Three ways to study</strong><button aria-label="Dismiss reader guide" onClick={dismissGuide}>×</button></div><ol><li><b>Choose a verse number</b> {'for comparisons, Greek and NT/OT connections.'}</li><li><b>OM</b> opens reviewed Ordinary Means {otEnabled ? 'NT ' : ''}commentary.</li><li><b>†</b> opens a note supplied by the selected edition’s publisher.</li></ol></aside>}
            <div className="reader-selection-status">
              <p className="reader-hint">{explicitPassage ? `Selected: ${formatPassage(ranges)}` : 'Tap a verse number or select words to study them.'}</p>
              <Popover open={versePickerOpen} onOpenChange={toggleVersePicker}>
                <PopoverTrigger>{explicitPassage ? 'Edit selection' : 'Select verses'}</PopoverTrigger>
                <PopoverContent className="reader-popover verse-picker" align="start">
                  <PopoverTitle>Select verses in {current.book.name} {current.chapter}</PopoverTitle>
                  <form onSubmit={applyVerseSelection}>
                    <div className="verse-picker-fields">
                      <label>From verse
                        <NativeSelect aria-label="From verse" value={fromVerse} onChange={e => {
                          const verse = Number(e.target.value);
                          setFromVerse(verse);
                          setThroughVerse(end => Math.max(end, verse));
                        }}>
                          {Array.from({ length: chapterVerseCount }, (_, i) => <option key={i + 1} value={i + 1}>{i + 1}</option>)}
                        </NativeSelect>
                      </label>
                      <label>Through verse
                        <NativeSelect aria-label="Through verse" value={throughVerse} onChange={e => setThroughVerse(Number(e.target.value))}>
                          {Array.from({ length: chapterVerseCount - fromVerse + 1 }, (_, i) => <option key={fromVerse + i} value={fromVerse + i}>{fromVerse + i}</option>)}
                        </NativeSelect>
                      </label>
                    </div>
                    <div className="verse-picker-actions">
                      <button type="submit">Apply selection</button>
                      <button type="button" onClick={() => setVersePickerOpen(false)}>Cancel</button>
                    </div>
                  </form>
                </PopoverContent>
              </Popover>
              {explicitPassage && <button onClick={clearSelection}>Clear selection</button>}
              {explicitPassage && <button onClick={copySelection}>Copy selection</button>}
              {explicitPassage && (
                <output className="reader-selection-copy-status">
                  {selectionCopyStatus}
                </output>
              )}
            </div>
            <ReadingSelection
              editionName={editionMeta.name}
              editionId={edition}
              onSelect={selectPassage}
              onOpen={openStudy}
            />
            {study && <StudyPanel ranges={ranges} mode={study} edition={edition} onClose={closeStudy} />}
            <TestamentConnections ranges={ranges} edition={edition} />
            {chapters.map((ch) => (
              <section key={`${ch.book}.${ch.chapter}`} className={isOtBook(ch.book) ? 'chapter ot-chapter' : 'chapter'}>
                {isOtBook(ch.book) && <p className="ot-edition-disclosure">{edition === 'MSB' ? 'MSB uses the BSB Old Testament wording.' : edition === 'BLB' ? 'Berean Literal Bible — publisher early draft. Supplied-word brackets are retained.' : 'Old Testament English reading.'}</p>}
                <div className="chapter-heading"><p className="edition">{editionMeta.name}</p>
                <h1>
                  {books.find((b) => b.code === ch.book)?.name}{' '}
                  <span>{ch.chapter}</span>
                </h1></div>
                <ReviewedMarkers book={ch.book} chapter={ch.chapter} units={reviewed.units} error={reviewed.error} onOpen={openReviewed} />
                {coverageNotices(ch).map(({ coverage: c, anchors }) => (
                  <aside
                    key={formatReference(c.anchor)}
                    id={c.textState === 'absent' ? c.anchor : undefined}
                    className="notice"
                  >
                    <strong>
                      {anchors.length === 1
                        ? formatReference(c.anchor)
                        : formatPassage([{start: anchors[0], end: anchors[anchors.length - 1]}])}
                    </strong>{' '}
                    {c.textState === 'absent'
                      ? `is not in the ${edition} main text. Context follows. `
                      : c.textState === 'bracketed'
                        ? 'is within brackets in this source. The original brackets are retained. '
                        : 'has an edition-specific numbering or placement relationship. '}
                    {c.textState !== 'bracketed' && !!c.placements?.length && (
                      <span>
                        Source:{' '}
                        {c.placements.map((p) => p.sourceRef).join(', ')}.{' '}
                        {c.textState === 'relocated'
                          ? 'The source chapter is included below. '
                          : 'Joined or split verses are shown in their full source context. '}
                      </span>
                    )}
                    <InlineReviewedMarkers units={reviewed.units} anchors={anchors} idPrefix={`coverage-commentary-${ch.book}-${ch.chapter}-${formatReference(c.anchor)}`} onOpen={openReviewed} />
                    {c.publisherNoteIds.map((id) => (
                      <button key={id} onClick={() => jumpNote(id)}>
                        Read publisher note
                      </button>
                    ))}
                  </aside>
                ))}
                <article
                  className="scripture"
                  lang={editionMeta.language}
                  style={{ fontSize: `${size / 16}rem` }}
                  aria-label={`${ch.book} ${ch.chapter} Scripture`}
                >
                  {ch.blocks.map((b, i) => {
                    const content = b.runs.map((r, j) =>
                      r.verse ? (
                        <sup key={j} id={r.anchor} className={explicitPassage && b.role !== 'publisher-heading' && b.role !== 'publisher-alternative' && verseAnchors(ch, r).some(anchor => selection.current.has(anchor)) ? 'selected-number' : undefined} data-sync-anchors={b.role === 'publisher-heading' || b.role === 'publisher-alternative' ? undefined : verseAnchors(ch, r).join(' ')}>
                          <a
                            id={`study-verse-${ch.book}-${ch.chapter}-${i}-${j}`}
                            aria-label={`Study ${formatReference(r.anchor!)}`}
                            data-study-reference={
                              new URL(
                                verseLink(ch, r.anchor!, r.sourceAnchor),
                                'http://local',
                              ).searchParams.get('passage') || r.anchor
                            }
                            href={verseLink(ch, r.anchor!, r.sourceAnchor)}
                          >
                            {r.verse}
                          </a>
                          <InlineReviewedMarkers units={reviewed.units} anchors={b.role === 'publisher-heading' || b.role === 'publisher-alternative' ? [] : verseAnchors(ch, r)} idPrefix={`verse-commentary-${ch.book}-${ch.chapter}-${i}-${j}`} onOpen={openReviewed} />
                        </sup>
                      ) : r.noteId ? (
                        (() => {
                          const note = ch.notes.find(n => n.id === r.noteId);
                          return note ? <PublisherFootnote key={j} note={note} edition={edition} releaseId={ch.releaseId} units={reviewedAt(reviewed.units, [note.anchor])} onCommentary={openReviewed}>{noteContent(note.original)}</PublisherFootnote>
                            : <button key={j} className="note-marker" aria-label={`${edition} publisher note unavailable`}>†</button>;
                        })()
                      ) : (
                        <span
                          key={j}
                          data-study-anchors={
                            (r.anchors || (r.anchor ? [r.anchor] : [])).join(
                              ' ',
                            ) || undefined
                          }
                          data-study-focus={(() => {
                            for (let k = i; k >= 0; k--) {
                              const runs = ch.blocks[k].runs;
                              for (
                                let n = k === i ? j - 1 : runs.length - 1;
                                n >= 0;
                                n--
                              )
                                if (runs[n].verse)
                                  return `study-verse-${ch.book}-${ch.chapter}-${k}-${n}`;
                            }
                            return 'reading';
                          })()}
                          className={
                            (r.anchors || (r.anchor ? [r.anchor] : [])).some(
                              (a) => selection.current.has(a),
                            )
                              ? 'selected'
                              : undefined
                          }
                        >
                          {r.text}
                        </span>
                      ),
                    );
                    return b.role === 'publisher-heading' ? (
                      <div
                        key={i}
                        className={`publisher-heading ${b.marker}${isOtBook(ch.book) ? ' ot-heading' : ''}`}
                        aria-label={`${edition} publisher heading${isOtBook(ch.book) ? '' : ' or subscription'}`}
                      >
                        {content}
                      </div>
                    ) : b.role === 'publisher-alternative' ? (
                      <div key={i} className="edition-alternative">
                        <small>Edition’s appended alternative</small>
                        <p>{content}</p>
                      </div>
                    ) : (
                      <p key={i} className={`text-block ${b.marker}${b.role === 'scripture-title' ? ' scripture-title' : ''}`}>
                        {content}
                      </p>
                    );
                  })}
                </article>
                {!!ch.alternatives?.length && (
                  <details className="edition-alternatives">
                    <summary>Edition’s alternative readings</summary>
                    <p>
                      These are separate alternatives supplied with{' '}
                      {editionMeta.name}.
                    </p>
                    {ch.alternatives.map((a) => (
                      <p key={a.sourceId}>
                        <small>
                          {a.label} · {a.sourceRef}
                        </small>
                        <br />
                        <span lang="grc" className="greek-alternative">
                          {a.text}
                        </span>
                      </p>
                    ))}
                  </details>
                )}
                {ch.notes.length > 0 && (
                  <section
                    className="publisher-notes"
                    aria-label={`${edition} publisher notes`}
                  >
                    <h2>{edition} publisher’s notes</h2>
                    <p className="study-help">Where shown, note categories are added by Ad Fontes to describe the publisher’s footnotes. Ordinary Means commentary is linked separately.</p>
                    {ch.notes.map((n) => (
                      <details id={n.id} key={n.id}>
                        <summary>
                          {n.anchor
                            .replace(`${ch.book}.`, '')
                            .replace('.', ':')}{' '}
                          · Publisher note<PublisherNoteCategory releaseId={ch.releaseId} note={n} />
                        </summary>
                        <p>{noteContent(n.original)}</p>
                        <PublisherNoteDetail releaseId={ch.releaseId} note={n} />
                        <div className="publisher-note-actions">
                        <button
                          onClick={() => {
                            const marker = document.getElementById(
                              `marker-${n.id}`,
                            );
                            marker?.focus();
                            marker?.scrollIntoView({ block: 'center' });
                          }}
                        >
                          Return to verse
                        </button>
                        {reviewedAt(reviewed.units, [n.anchor]).map(unit => {
                          const id = `publisher-commentary-${n.id}-${unit.id}`;
                          return <button key={unit.id} id={id} className="publisher-commentary-link"
                            onClick={() => openReviewed(unit, id)}>
                            Read Ordinary Means commentary on {address(n.anchor).book.name} {n.anchor.split('.').slice(1).join(':')}
                          </button>;
                        })}
                        </div>
                      </details>
                    ))}
                  </section>
                )}
              </section>
            ))}
            <RelatedResources ranges={ranges} />
            <nav className="chapter-nav" aria-label="Chapter navigation">
              <button
                disabled={!previous}
                onClick={() =>
                  previous && goBook(previous.book, previous.chapter)
                }
              >
                ← Previous chapter
              </button>
              <button
                disabled={!next}
                onClick={() => next && goBook(next.book, next.chapter)}
              >
                Next chapter →
              </button>
            </nav>
            <p className="local-status">
              {environment.readingStatus}
            </p>
          </>
        )}
        {!loading && !error && mode === 'catalog' && <ConnectionCatalog onNavigate={navigate}/>}
        {!loading && !error && mode === 'research' && <GreekResearch onNavigate={navigate}/>}
        {!loading && !error && mode === 'search' && (
          <section className="search-results">
            <p className="eyebrow">{edition} · SCRIPTURE SEARCH</p>
            <h1>{otEnabled ? 'Search the Bible' : 'Search the New Testament'}</h1>
            <p>
              Whole words, or an exact phrase in quotation marks. Publisher
              notes are excluded.
            </p>
            <p role="status">
              {results?.total || 0} results for “{query}”
            </p>
            {results?.hits.map((h) => (
              <article key={h.anchor}>
                <a
                  href={link([{ start: h.anchor, end: h.anchor }])}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(link([{ start: h.anchor, end: h.anchor }]));
                  }}
                >
                  {books.find((b) => b.code === h.book)?.name}{' '}
                  {h.anchor.split('.').slice(1).join(':')}
                </a>
                <p>{searchHighlights(h.text, query).map((part, i) => part.match ? <mark key={i} className="search-match">{part.text}</mark> : part.text)}</p>
              </article>
            ))}
            {results?.total === 0 && <p>Try another word, phrase, or book.</p>}
            <nav className="chapter-nav" aria-label="Search pages">
              <button disabled={page <= 1} onClick={() => searchPage(page - 1)}>
                Previous results
              </button>
              <span>
                Page {page} of{' '}
                {Math.max(1, Math.ceil((results?.total || 0) / 20))}
              </span>
              <button
                disabled={page * 20 >= (results?.total || 0)}
                onClick={() => searchPage(page + 1)}
              >
                Next results
              </button>
            </nav>
          </section>
        )}
        {!loading && !error && mode === 'sources' && (
          <section className="sources">
            <p className="eyebrow">SOURCES &amp; EDITIONS</p>
            <h1>Read with a known source.</h1>
            <p>
              The seven New Testament editions contain all 27 NT books and are stored
              locally. Textual groupings help organize comparison; they do not
              imply uniform texts or word alignment.
            </p>
            <section className="source-edition"><h3>Keil &amp; Delitzsch commentary</h3><p>C. F. Keil and F. Delitzsch, Commentary on the Old Testament (T. &amp; T. Clark, 1864–1891). Historical commentary with supplied chapter groups and source numbering preserved. Precise verse alignment is not established. Included on Larry Herzog Jr.’s recorded public-domain determination.</p><a href="/commentaries/kd-2026-10-08-v1/manifest.json">K&amp;D source manifest</a></section><section className="source-edition"><h3>Lenski commentary</h3><p>R. C. H. Lenski, The Interpretation of the New Testament. Historical commentary in a separate reader panel and Library collection. Supplied transcription with explicit passage anchors; chapter context remains available where an anchor is unresolved. Included on Larry Herzog Jr.’s recorded public-domain determination.</p><a href="/commentaries/lenski-2026-10-08-v1/manifest.json">Lenski source manifest</a></section>
            <section className="source-edition"><h3>NT/OT connections</h3><p>698 explicit cross-testament citations from pinned BSB publisher notes. Reciprocal links retain the original note and citation; they do not establish quotation extent or classify quotations, allusions or parallels. Coverage is partial.</p><a href="/connections/bsb-testament-connections-2026-10-07-v1/manifest.json">Connections source manifest</a></section>
            {otEnabled && <p className="notice">The four English editions also include all 39 Old Testament books. BLB is a publisher draft; MSB OT wording matches BSB. The OT Greek study panel adds the Septuagint; the Greek editions below cover the New Testament. The edition groupings below describe NT comparison only.</p>}
            <section className="source-edition"><h2>Hebrew and Latin editions</h2><p>Read the Westminster Leningrad Codex with OSHB word analysis, or the 73-book Clementine Vulgate with source numbering retained. Hebrew Scripture is public domain; OSHB analysis is attributed under CC BY 4.0.</p><p><a href="/read/GEN/1?translation=WLC">Read Hebrew / Aramaic →</a> · <a href="/read/GEN/1?translation=CVUL">Read Latin →</a> · <a href="/library?view=hebrew">Hebrew Word Explorer →</a></p></section>
            <section className="source-edition"><h2>LXX2012 · English Septuagint</h2><p>The complete supplied English edition: 54 books, including the Apocrypha and Psalm 151. Brenton’s translation updated by Michael Paul Johnson, with the EPUB’s public-domain notice, publisher notes and source numbering retained. Separate from the seven NT editions and Berean texts.</p><a href="/read/GEN/1?translation=LXX2012">Read the English Septuagint and view its source notice →</a></section>
            {editions.map((e) => (
              <section key={e.editionId} className="source-edition">
                <h2>{e.name}</h2>
                <p>
                  {e.group} · {e.language === 'en' ? 'English' : 'Greek'}
                </p>
                <p>{e.description}</p>
                <dl>
                  <dt>Edition and source release</dt>
                  <dd>{e.editionLabel}</dd>
                  <dt>Local release</dt>
                  <dd>{e.releaseId}</dd>
                  <dt>Text authority</dt>
                  <dd>{e.authority}</dd>
                  <dt>Included layers</dt>
                  <dd>{e.included.join('; ')}</dd>
                  <dt>Excluded layers</dt>
                  <dd>{e.excluded.join('; ')}</dd>
                </dl>
                <p>{e.rights}</p>
                <p>
                  <a href={e.url}>Source publisher or repository</a> ·{' '}
                  <a href={e.rightsUrl}>Rights evidence</a> ·{' '}
                  <a href={`/corpus/${e.releaseId}/manifest.json`}>
                    Manifest and checksums
                  </a>
                </p>
              </section>
            ))}
            <h2>Old Testament English sources</h2>
            <p>English comparison reflects translation wording, not independent manuscript witnesses. Septuagint reading and interlinear are available through Explore Greek. Hebrew study is not yet available.</p>
            {['BSB', 'BLB', 'MSB', 'YLT'].map(id => {
              const e = otEdition(id)!;
              return <section key={id} className="source-edition"><h3>{id === 'BLB' ? 'BLB — publisher draft' : id}</h3><p>{e.scope} · {e.releaseId}</p><p>{e.authority}</p><p>{e.rights}</p><a href={`/corpus/${e.releaseId}/manifest.json`}>OT source manifest</a></section>;
            })}
            <h2>About this environment</h2>
            <p>
              Ad Fontes is a biblical study environment from Ordinary
              Means, with a Lutheran/confessional identity. No confessional
              background is needed to begin reading.
            </p>
            <p>
              Scripture is the main reading text. Section headings and
              publisher’s notes come from the selected edition. Ordinary Means
              commentary, confessional sources, and future AI
              material are separate content categories; none is mixed into this
              Scripture text.
            </p>
            <h2>Greek word analysis</h2>
            <p>
              Nestle 1904 morphology and lemmas by Ulrik Sandborg-Petersen, v1.3
              (2017), under CC0. Analysis is attached only where the complete
              Greek word sequence matches the selected source text:{' '}
              {analysisInfo.coverage.matchedVerses.toLocaleString()} verses,{' '}
              {analysisInfo.coverage.tokens.toLocaleString()} tokens. Two
              apostrophe-shape discrepancies remain explicitly unavailable.
            </p>
            <p>
              Contextual glosses come from the pinned Berean Interlinear
              extract, with its public-domain dedication. Glosses are shown only
              for matching verse word sequences. The separate historical lexical
              aid is James Strong’s Greek Dictionary (1890), Ulrik Petersen XML
              v1.4 (2007), explicitly identified as public domain in that
              artifact. No English word alignment is assumed.
            </p>
            <p>
              <a href={`/analysis/${analysisInfo.releaseId}/manifest.json`}>
                Analysis sources, rights, checksums and coverage
              </a>
            </p>
            <h2>Septuagint study</h2><p>Rahlfs 1935 Greek word-token transcription with morphology by Seth Kushniryk / Open Scriptorium and Eliran Wong lexical glosses. Joshua uses Vaticanus B; Judges uses Alexandrinus A; Daniel uses Old Greek. Source numbering is preserved separately from English references. Original token surfaces are separated by spaces; this transcription does not supply punctuation. Glosses attach only to exact ordered verse matches. Upstream automated morphology, confidence and unknown values are retained; no English word alignment is established.</p><p><a href="/analysis/lxx-rahlfs-1935-2026-10-07-v3/manifest.json">Septuagint mapping provenance and coverage</a> · <a href="/analysis/lxx-source-notices-2026-10-07-v1.json">Original source notices and attribution</a></p><h2>Greek definitions and word studies</h2>
            <p>Short and longer definitions come from John Jeffrey Dodson’s Greek Lexicon (2010), using the pinned Biblical Humanities Unicode XML. Its original author notice dedicates the lexicon to the public domain; the repository also supplies CC0 terms. Headword and source-number agreement are required; uncertain matches remain unavailable. Definitions describe a word’s meaning range, not an automatic interpretation of a verse.</p>
            <p>{environment.wordStudyDescription}</p>
            <p><a href="/lexical/dodson-2010-v5/manifest.json">Lexicon and word-link source records and checksums</a></p>
            <h2>Project status</h2>
            <p>
              The original NT milestones have historical acceptance records.
              Whole-Bible pilot and release acceptance remain in progress. The original NT release includes
              all 27 New Testament books, seven named editions, 104 reviewed
              comparison notes, Greek and interlinear tools, the approved
              250-article Ordinary Means collection. Personal notes and Google sign-in have been retired.
            </p>
            <p>The approved English OT release adds all 39 Old Testament books for reading, search and comparison. Septuagint reading/interlinear and reciprocal publisher-supplied NT/OT connections are available. The Greek source research workspace adds text, lemma and morphology search, source-only verses and alternative texts. Reviewed connection labels are published separately; Hebrew remains undecided.</p>
            <p>
              {environment.offline ? `This desktop build is version ${desktopVersion}. ` : <>Version 3.6.0 is the current cross-platform desktop release. </>}The
              macOS Apple Silicon package is Developer ID signed
              and Apple notarized; the Windows 11 x64 package is Public Trust
              signed. Both are available on
              the <a href="/downloads">Downloads page</a>. Public study tools require no account.
            </p>
            <p>
              Future releases continue to use the separate exact-artifact review
              and approval workflow.
            </p>
          </section>
        )}
      </main>
      <footer>
        <span>Ordinary Means</span>
        <span>Ad Fontes</span>
        <a href="/library">Library</a>
        <a
          href="/about/sources"
          onClick={(e) => {
            e.preventDefault();
            navigate(
              `/about/sources?translation=${encodeURIComponent(edition)}`,
            );
          }}
        >
          Source information
        </a>
        {!environment.offline && <>
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
          <a href="/support">Support</a>
          <a href="/downloads">Downloads</a>
        </>}
      </footer>
    </>
  );
}
