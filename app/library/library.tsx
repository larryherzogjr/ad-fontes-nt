'use client';
import { OrdinaryMeansImprint } from '@/components/ordinary-means-imprint';
import {CalendarDays,NotebookPen,Search,Columns2,BookOpen,BookA,Languages,BookSearch,Link2,Columns3,ScrollText,LibraryBig} from 'lucide-react';
import AppLink from '@/components/app-link';
import AbbottSmith from '@/reader/abbott-smith';
import {libraryRoute,libraryHref,emptyLibraryRoute,type LibraryRoute} from '@/lib/library-routing';
import {libraryCollections,collectionDestination} from '@/lib/library-collections';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import HebrewExplorer from './hebrew-explorer';
import FullTextSearch from './full-text-search';
import StudyPackets from './study-packets';
import Confessions from './confessions';
import Lectionary from './lectionary';
import GospelParallels from './gospel-parallels';
import CommentaryLibrary from './commentaries';
import GreekResearch from '@/reader/greek-research';
import ConnectionCatalog from '@/reader/connection-catalog';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { books, passageUrl, type PassageRange } from '@/lib/domain/references';
import { formatPassage } from '@/lib/reading-display';
import { transliterateGreek } from '@/lib/domain/greek-reading';
import { readDeviceLinks, rememberDeviceLink, writeDeviceLinks, type DeviceLink, presentRecentLinks, availableDeviceLinks } from '@/lib/device-links';

type Comparison = {
  id: string;
  title: string;
  ranges: PassageRange[];
  presentation: 'comparison' | 'publisher-note';
  publisherNoteCount: number;
  relatedUnits: string[];
  summary: string;
  searchText: string;
};
type Article = {
  slug: string;
  title: string;
  headword: string;
  subtitle: string;
  author: string;
  url: string;
  snapshotDate: string;
  contentSha256: string;
  transliteration: string;
  gloss: string;
  description: string;
  category: string;
  tags: string[];
};
type Word = {
  lemmaId: string;
  lemma: string;
  occurrenceCount: number;
  firstOccurrence: { anchor: string; tokenId: string; surface: string } | null;
  definitions: { strongs: string; brief: string; sourceId: string }[];
  articleSlugs: string[];
};
type LibraryIndex = {
  schemaVersion: 1;
  comparisonCount: number;
  articleCount: number;
  lemmaCount: number;
  analysisReleaseId: string;
  textReleaseId: string;
  lexicalReleaseId: string;
  articleReleaseId: string;
  comparisons: Comparison[];
  articles: Article[];
  words: Word[];
};
type Route = LibraryRoute;
const emptyRoute = emptyLibraryRoute;
function currentRoute(): Route {
  return typeof window === 'undefined' ? emptyRoute : libraryRoute(location.search);
}
function folded(value: string) {
  return value.normalize('NFD').replace(/\p{M}/gu, '').toLocaleLowerCase();
}
function includesQuery(values: (string | number | undefined)[], query: string) {
  const needle = folded(query.trim());
  return !needle || folded(values.filter(value => value !== undefined).join(' ')).includes(needle);
}
const hrefFor = libraryHref;
function comparisonHref(unit: Comparison) {
  return `${passageUrl(unit.ranges, 'BSB')}&panel=${unit.presentation === 'publisher-note' ? 'notes' : 'compare'}&unit=${encodeURIComponent(unit.id)}`;
}
function occurrenceHref(anchor: string, tokenId: string) {
  return `${passageUrl([{ start: anchor, end: anchor }], 'N1904')}&panel=greek&token=${encodeURIComponent(tokenId)}`;
}
function LibraryHeader({ offline }: { offline: boolean }) {
  return <>
    <a className="skip" href="#library-results">Skip to Library results</a>
    <header className="masthead public-masthead">
      <a className="brand" href="/">Ad Fontes<span>A biblical study environment from Ordinary Means.</span></a>
      <nav aria-label="Primary">
        <a href="/">Read</a>
        <a className="active" href="/library">Library</a>
        <a href="/about/sources">Sources &amp; Editions</a>

          <a href="/downloads">Downloads</a>

      </nav>
      <details className="mobile-nav">
        <summary>Menu</summary>
        <nav aria-label="Mobile primary">
          <a href="/">Read</a><a className="active" href="/library">Library</a><a href="/about/sources">Sources &amp; Editions</a>

          <a href="/downloads">Downloads</a><span className="mobile-nav-subtitle">A biblical study environment from Ordinary Means.</span>
        </nav>
      </details>
    </header>
  </>;
}
function LibraryFooter({ offline }: { offline: boolean }) {
  return <footer className="public-footer">
    <OrdinaryMeansImprint />
    <nav aria-label="Policies and support">
      <a href="/about/sources">Sources</a>
      {!offline && <><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="/support">Support</a></>}
      <a href="/downloads">Downloads</a>
    </nav>
  </footer>;
}
function Pager({ route, pages }: { route: Route; pages: number }) {
  if (pages <= 1) return null;
  return <nav className="library-pager" aria-label="Result pages">
    {route.page > 1 ? <AppLink href={hrefFor(route, { page: route.page - 1 })}>← Previous</AppLink> : <span />}
    <span>Page {Math.min(route.page, pages)} of {pages}</span>
    {route.page < pages ? <AppLink href={hrefFor(route, { page: route.page + 1 })}>Next →</AppLink> : <span />}
  </nav>;
}
function LibraryShelves({ recentPassages, recentStudies, bookmarks }: { recentPassages: DeviceLink[]; recentStudies: DeviceLink[]; bookmarks: DeviceLink[] }) {
  const shelves = [
    ['Continue reading', presentRecentLinks(recentPassages, 'passage').slice(0, 4)],
    ['Recently studied', presentRecentLinks(recentStudies, 'study').slice(0, 4)],
    ['Bookmarks', availableDeviceLinks(bookmarks).slice(0, 6)],
  ] as const;
  if (!shelves.some(([, items]) => items.length)) return null;
  return <section className="library-shelves" aria-label="Your recent and saved study links">
    {shelves.filter(([, items]) => items.length).map(([title, items]) => <div key={title}><h2>{title}</h2><div>{items.map(item => <AppLink href={item.url} key={item.url}><strong>{item.label}</strong>{item.detail && <small>{item.detail}</small>}</AppLink>)}</div></div>)}
  </section>;
}
function ArticleDetail({ index, article, route }: { index: LibraryIndex; article: Article; route: Route }) {
  const [markdown, setMarkdown] = useState<string | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    setMarkdown(null); setError('');
    fetch(`/om/${index.articleReleaseId}/articles/${article.slug}.json`, { signal: controller.signal }).then(async response => {
      if (!response.ok) throw Error('The article could not be loaded.');
      const data = await response.json();
      if (data.releaseId !== index.articleReleaseId || data.article?.slug !== article.slug || data.article.contentSha256 !== article.contentSha256)
        throw Error('The article does not match the released Library index.');
      setMarkdown(data.article.markdown);
    }).catch(reason => { if (!controller.signal.aborted) setError(reason.message); });
    return () => controller.abort();
  }, [index.articleReleaseId, article.slug, article.contentSha256]);
  const word = index.words.find(item => item.articleSlugs.includes(article.slug));
  return <>
    <div className="library-return"><AppLink href={hrefFor(route, { article: '', page: 1 })}>← Back to Study Library</AppLink></div>
    <article className="library-article om-study-body" id="library-results">
      <p className="library-type">Ordinary Means Greek word study</p>
      <h1>{article.title}</h1>
      <p className="library-article-subtitle">{article.subtitle}</p>
      <p>By {article.author} · Saved {article.snapshotDate}</p>
      <p className="library-provenance">Commentary is distinct from Scripture and dictionary data.</p>

      {word && <p><AppLink href={hrefFor(route, { view: 'lexicon', article: '', lemma: word.lemmaId, page: 1, category: '' })}>Explore {article.headword} in the Greek lexicon and New Testament occurrences →</AppLink></p>}
      {error ? <p role="alert" className="notice">{error}</p> : markdown === null ? <p role="status">Loading article…</p> :
        <Markdown skipHtml remarkPlugins={[remarkGfm]} components={{ a: ({ href, children, node: _node, ...props }) => {
          if (!href || href.startsWith('#')) return <AppLink {...props} href={href}>{children}</AppLink>;
          const target = new URL(href, article.url);
          const local = index.articles.find(item => item.url === target.href);
          return local ? <AppLink href={hrefFor(route, { view: 'articles', article: local.slug, lemma: '', page: 1 })}>{children}</AppLink> :
            <AppLink {...props} href={target.protocol === 'https:' ? target.href : undefined} target="_blank" rel="noopener noreferrer">{children}</AppLink>;
        } }}>{markdown}</Markdown>}
      <p className="om-study-frequency-note">Unless individually labeled otherwise, occurrence counts are NFC-normalized lemma totals from the main reading of pinned Nestle 1904 ({index.textReleaseId}). Cognate lemmas, variant readings, the appended shorter ending, and two verses with unavailable analysis are excluded.</p>
      <p><AppLink href={article.url} target="_blank" rel="noopener noreferrer">Read on larryherzogjr.com ↗</AppLink></p>
    </article>
  </>;
}

type LemmaBundle = { lemma: string; lemmaId: string; releaseId: string; hits: { tokenId: string; sourceRef: string; anchor: string; surface: string; text: string }[] };
function WordDetail({ index, word, route }: { index: LibraryIndex; word: Word; route: Route }) {
  const [lemma, setLemma] = useState<LemmaBundle | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    fetch(`/analysis/${index.analysisReleaseId}/lemmas/${word.lemmaId}.json`, { signal: controller.signal }).then(async response => {
      if (!response.ok) throw Error('The occurrence list could not be loaded.');
      const data = await response.json() as LemmaBundle;
      if (data.releaseId !== index.analysisReleaseId || data.lemmaId !== word.lemmaId || data.hits.length !== word.occurrenceCount)
        throw Error('The occurrence list does not match the released Library index.');
      setLemma(data);
    }).catch(reason => { if (!controller.signal.aborted) setError(reason.message); });
    return () => controller.abort();
  }, [index.analysisReleaseId, word.lemmaId, word.occurrenceCount]);
  const articles = word.articleSlugs.map(slug => index.articles.find(article => article.slug === slug)).filter(Boolean) as Article[];
  const pageSize = 30, pages = Math.max(1, Math.ceil(word.occurrenceCount / pageSize));
  const page = Math.min(route.page, pages), hits = lemma?.hits.slice((page - 1) * pageSize, page * pageSize) || [];
  return <>
    <div className="library-return"><AppLink href={hrefFor(route, { lemma: '', page: 1 })}>← Back to Study Library</AppLink></div>
    <section className="library-word-detail" id="library-results">
      <p className="library-type">Greek lexicon and corpus data</p>
      <h1 lang="grc">{word.lemma}</h1>
      <p className="library-transliteration">{transliterateGreek(word.lemma)}</p>
      {word.definitions.length === 1 ? <><h2>Meaning range</h2><p>{word.definitions[0].brief}</p><p className="library-source-note">Dodson Greek Lexicon (2010) · Strong’s {word.definitions[0].strongs}. A dictionary meaning range is not an automatic interpretation of any passage.</p></> :
        <p className="library-source-note">{word.definitions.length ? 'Multiple source-numbered dictionary entries share this headword; open an occurrence for source-matched detail.' : 'No unambiguous Dodson definition is available for this indexed lemma.'}</p>}
      <AbbottSmith key={word.lemmaId} lemma={word.lemma} />
      {articles.length > 0 && <section className="library-linked-study"><p className="library-type">Ordinary Means commentary available</p>{articles.map(article => <h2 key={article.slug}><AppLink href={hrefFor(route, { view: 'articles', lemma: '', article: article.slug, page: 1 })}>{article.title}: {article.subtitle} →</AppLink></h2>)}</section>}
      <h2>{word.occurrenceCount.toLocaleString()} indexed {word.occurrenceCount === 1 ? 'occurrence' : 'occurrences'} in Nestle 1904</h2>
      <p>Counts use the pinned main reading only. The highlighted token opens in its verse-level Greek explorer; no English word alignment is implied.</p>
      {error && <p role="alert" className="notice">{error}</p>}
      {!lemma && !error && <p role="status">Loading occurrences…</p>}
      <ol className="library-occurrences">
        {hits.map(hit => <li key={hit.tokenId}><AppLink href={occurrenceHref(hit.anchor, hit.tokenId)}><strong>{formatPassage([{ start: hit.anchor, end: hit.anchor }])}</strong> · <span lang="grc">{hit.surface}</span></AppLink><p lang="grc">{hit.text}</p></li>)}
      </ol>
      <Pager route={{ ...route, page }} pages={pages} />
    </section>
  </>;
}

export default function Library({ offline = false }: { offline?: boolean }) {
  const [route, setRoute] = useState<Route>(emptyRoute);
  const [routeReady, setRouteReady] = useState(false);
  const [locationKey, setLocationKey] = useState('');
  function navigateCollection(href: string) {
    const next = new URL(href, location.origin);
    if (next.pathname !== '/library') { location.assign(href); return; }
    history.pushState({}, '', next.pathname + next.search);
    setRoute(currentRoute()); setQueryInput(currentRoute().q); setLocationKey(next.search);
  }
  useEffect(() => {
    const restore = () => { setRoute(currentRoute()); setQueryInput(currentRoute().q); setLocationKey(location.search); };
    addEventListener('popstate', restore);
    return () => removeEventListener('popstate', restore);
  }, []);
  const [queryInput, setQueryInput] = useState('');
  const [index, setIndex] = useState<LibraryIndex | null>(null);
  const [error, setError] = useState('');
  const [recentPassages, setRecentPassages] = useState<DeviceLink[]>([]);
  const [recentStudies, setRecentStudies] = useState<DeviceLink[]>([]);
  const [bookmarks, setBookmarks] = useState<DeviceLink[]>([]);
  useEffect(() => {
    const requestedRoute = currentRoute();
    setRoute(requestedRoute);
    setRouteReady(true);
    setLocationKey(location.search);
    setQueryInput(requestedRoute.q);
    setRecentPassages(readDeviceLinks('afnt-recent-passages'));
    setRecentStudies(readDeviceLinks('afnt-recent-studies'));
    setBookmarks(readDeviceLinks('afnt-library-bookmarks'));
    const controller = new AbortController();
    fetch('/library/index.json', { signal: controller.signal }).then(async response => {
      if (!response.ok) throw Error('The Study Library could not be loaded.');
      const data = await response.json() as LibraryIndex;
      if (data.schemaVersion !== 1 || data.comparisonCount !== 110 || data.articleCount !== 250 || data.lemmaCount !== 5400)
        throw Error('The Study Library release is incomplete.');
      setIndex(data);
    }).catch(reason => { if (!controller.signal.aborted) setError(reason.message); });
    return () => controller.abort();
  }, []);
  const collectionQuery = ['lectionary', 'confessions', 'parallels', 'packets', 'fulltext', 'research', 'connections', 'commentaries', 'hebrew'].includes(route.view) ? '' : route.q;
  const data = useMemo(() => {
    if (!index) return null;
    const comparisons = [...index.comparisons].sort((a, b) => {
      const aa = a.ranges[0].start, bb = b.ranges[0].start;
      const [ab, ac, av] = aa.split('.'), [bbk, bc, bv] = bb.split('.');
      return books.find(book => book.code === ab)!.order - books.find(book => book.code === bbk)!.order || Number(ac) - Number(bc) || Number(av) - Number(bv);
    }).filter(unit => includesQuery([unit.title, formatPassage(unit.ranges), unit.summary, unit.searchText], collectionQuery));
    const articles = [...index.articles].sort((a, b) => a.transliteration.localeCompare(b.transliteration)).filter(article => includesQuery([article.title, article.headword, article.transliteration, article.gloss, article.description, article.category, article.tags.join(' ')], collectionQuery));
    const words = [...index.words].sort((a, b) => a.lemma.localeCompare(b.lemma, 'el')).filter(word => includesQuery([word.lemma, transliterateGreek(word.lemma), word.occurrenceCount, ...word.definitions.flatMap(definition => [definition.brief, definition.strongs])], collectionQuery));
    return { comparisons, articles, words };
  }, [index, collectionQuery]);
  function search(event: FormEvent) {
    event.preventDefault();
    location.assign(hrefFor(route, { q: queryInput.trim(), page: 1, article: '', lemma: '' }));
  }
  function toggleBookmark(link: Omit<DeviceLink, 'savedAt'>) {
    const exists = bookmarks.some(item => item.url === link.url);
    setBookmarks(exists
      ? writeDeviceLinks('afnt-library-bookmarks', bookmarks.filter(item => item.url !== link.url))
      : rememberDeviceLink('afnt-library-bookmarks', link, 30));
  }
  function switchCollection(destination:string){
    navigateCollection(destination);
    requestAnimationFrame(()=>{const top=document.getElementById('library-top');top?.focus({preventScroll:true});top?.scrollIntoView({block:'start'});});
  }
  const article = route.view === 'articles' && index?.articles.find(item => item.slug === route.article);
  const word = route.view === 'lexicon' && index?.words.find(item => item.lemmaId === route.lemma);
  if (!routeReady) return <><LibraryHeader offline={offline}/><main className="library-page" aria-busy="true"><p role="status">Loading the Study Library…</p></main><LibraryFooter offline={offline}/></>;
  return <>
    <LibraryHeader offline={offline} />
    <main className={`library-page${route.view==='overview'?' library-overview':''}`} id="library-top" tabIndex={-1}>
      <nav className="library-collection-nav" aria-label="Library collection navigation">
        <label htmlFor="library-collection">Library collection<select id="library-collection" value={route.view} onChange={e=>switchCollection(collectionDestination(e.target.value))}><option value="overview">Browse all collections</option>{libraryCollections.map(c=><option value={c.id} key={c.id}>{c.label}</option>)}</select></label>
        {route.view!=='overview'&&<a href="/library?view=overview" onClick={e=>{if(!e.metaKey&&!e.ctrlKey&&!e.shiftKey&&!e.altKey){e.preventDefault();switchCollection('/library?view=overview');}}}>Browse collections</a>}
      </nav>
      {article && index ? <ArticleDetail index={index} article={article} route={route} /> : word && index ? <WordDetail index={index} word={word} route={route} /> : <>
        {route.view==='overview'&&<><p className="eyebrow">Study Library</p>
        <h1>Explore Scripture and its study resources.</h1>
        <p className="library-intro">Explore the texts, languages, and resources that support your study.</p></>}
        {['comparisons','articles','lexicon'].includes(route.view) && <><h1 className="collection-page-title">{libraryCollections.find(c=>c.id===route.view)?.label}</h1><form className="library-search" role="search" onSubmit={search}>
          <label htmlFor="library-query">Find in this collection</label>
          <div><input id="library-query" value={queryInput} onChange={event => setQueryInput(event.target.value)} /><button>Search</button></div>
        <p className="study-help">{route.view==='comparisons'?'Search passage references, titles, summaries and study metadata.':route.view==='articles'?'Search study titles, Greek headwords, transliterations, glosses, descriptions, topics and tags.':'Search indexed Greek lemmas, transliterations, Dodson glosses and source numbers.'} <a href="/library?view=fulltext">Search resource text →</a></p>
        </form></>}
        {error && <p role="alert" className="notice">{error}</p>}
        {!index && !error && <div className="library-skeleton" role="status" aria-label="Loading the Study Library"><span /><span /><span /></div>}
        {index && data && <>
          {route.view==='overview'&&<nav className="library-tabs" aria-label="Library collections" onClick={event => { const link = (event.target as HTMLElement).closest('a'); if (link && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) { event.preventDefault(); switchCollection(link.getAttribute('href')!); } }}>
            <a href="/library?view=lectionary"><div className="library-card-decoration" aria-hidden="true"><CalendarDays strokeWidth={1.5} focusable="false"/></div><strong>Lectionary</strong><small>Sunday readings and study packets</small></a>
            <a href="/library?view=packets"><div className="library-card-decoration" aria-hidden="true"><NotebookPen strokeWidth={1.5} focusable="false"/></div><strong>Study Packets</strong><small>Assemble, preview and print</small></a>
            <a href="/library?view=fulltext"><div className="library-card-decoration" aria-hidden="true"><Search strokeWidth={1.5} focusable="false"/></div><strong>Search resource text</strong><small>Full text across studies and commentaries</small></a>
            <AppLink href={hrefFor(route, { view: 'comparisons', page: 1, article: '', lemma: '', category: '', kind: '' })}><div className="library-card-decoration" aria-hidden="true"><Columns2 strokeWidth={1.5} focusable="false"/></div><strong>Textual Comparisons</strong><span>{data.comparisons.length}</span><small>Reviewed passage studies</small></AppLink>
            <AppLink href={hrefFor(route, { view: 'articles', page: 1, article: '', lemma: '', book: '', kind: '' })}><div className="library-card-decoration" aria-hidden="true"><BookOpen strokeWidth={1.5} focusable="false"/></div><strong>Greek Word Studies</strong><span>{data.articles.length}</span><small>Ordinary Means commentary</small></AppLink>
            <AppLink href={hrefFor(route, { view: 'lexicon', page: 1, article: '', lemma: '', book: '', kind: '', category: '' })}><div className="library-card-decoration" aria-hidden="true"><BookA strokeWidth={1.5} focusable="false"/></div><strong>Greek Lexicon</strong><span>{data.words.length.toLocaleString()}</span><small>Dictionary and corpus data</small></AppLink>
            <a href="/library?view=research"><div className="library-card-decoration" aria-hidden="true"><BookSearch strokeWidth={1.5} focusable="false"/></div><strong>Septuagint Research</strong><small>Search Greek texts, lemmas and morphology</small></a>
            <a href="/library?view=parallels"><div className="library-card-decoration" aria-hidden="true"><Columns3 strokeWidth={1.5} focusable="false"/></div><strong>Gospel Parallels</strong><small>Read related Gospel accounts together</small></a>
            <a href="/library?view=connections"><div className="library-card-decoration" aria-hidden="true"><Link2 strokeWidth={1.5} focusable="false"/></div><strong>NT/OT Connections</strong><small>Browse publisher links and reviewed classifications</small></a>
            <a href="/library?view=confessions"><div className="library-card-decoration" aria-hidden="true"><ScrollText strokeWidth={1.5} focusable="false"/></div><strong>Confessional Connections</strong><small>Book of Concord · Scripture citations and documents</small></a>
            <a href="/library?view=commentaries"><div className="library-card-decoration" aria-hidden="true"><LibraryBig strokeWidth={1.5} focusable="false"/></div><strong>Commentaries</strong><small>Keil &amp; Delitzsch · Lenski</small></a>
            <a href="/library?view=hebrew"><div className="library-card-decoration" aria-hidden="true"><Languages strokeWidth={1.5} focusable="false"/></div><strong>Hebrew Word Explorer</strong><small>Source words, morphology and Ordinary Means studies</small></a>
          </nav>}
          <section id="library-results" tabIndex={-1}>
            {route.view === 'lectionary' && <Lectionary locationKey={locationKey} onNavigate={navigateCollection} />}
            {route.view === 'confessions' && <Confessions locationKey={locationKey} onNavigate={navigateCollection} />}
            {route.view === 'parallels' && <GospelParallels locationKey={locationKey} onNavigate={navigateCollection} />}
            {route.view === 'packets' && <StudyPackets locationKey={locationKey} onNavigate={navigateCollection} />}
            {route.view === 'fulltext' && <FullTextSearch locationKey={locationKey} onNavigate={navigateCollection} />}
            {route.view === 'hebrew' && <HebrewExplorer key={locationKey} onNavigate={navigateCollection} />}
            {route.view === 'commentaries' && <CommentaryLibrary key={locationKey} onNavigate={navigateCollection} />}
            {route.view === 'research' && <GreekResearch key={locationKey} embedded onNavigate={navigateCollection} />}
            {route.view === 'connections' && <ConnectionCatalog embedded onNavigate={navigateCollection} />}
            {route.view === 'comparisons' && <ComparisonList route={route} units={data.comparisons} coveredBooks={new Set(index.comparisons.flatMap(unit => unit.ranges.map(range => range.start.split('.')[0])))} bookmarks={bookmarks} onBookmark={toggleBookmark} />}
            {route.view === 'articles' && <ArticleList route={route} articles={data.articles} bookmarks={bookmarks} onBookmark={toggleBookmark} />}
            {route.view === 'lexicon' && <WordList route={route} words={data.words} bookmarks={bookmarks} onBookmark={toggleBookmark} />}
          </section>
          <details className="library-history"><summary>Recent and saved</summary><LibraryShelves recentPassages={recentPassages} recentStudies={recentStudies} bookmarks={bookmarks}/></details>
        </>}
      </>}
    </main>
    <LibraryFooter offline={offline} />
  </>;
}

function ComparisonList({ route, units, coveredBooks, bookmarks, onBookmark }: { route: Route; units: Comparison[]; coveredBooks: Set<string>; bookmarks: DeviceLink[]; onBookmark: (link: Omit<DeviceLink, 'savedAt'>) => void }) {
  const selected = units.filter(unit => (!route.book || unit.ranges[0].start.startsWith(`${route.book}.`)) && (!route.kind || unit.presentation === route.kind));
  const pageSize = 24, pages = Math.max(1, Math.ceil(selected.length / pageSize)), page = Math.min(route.page, pages);
  const visible = selected.slice((page - 1) * pageSize, page * pageSize);
  return <>
    <div className="library-collection-heading"><div><p className="library-type">Ordinary Means commentary</p><p>Reviewed questions about what the seven named editions print. Publisher notes and edition readings remain identified separately.</p></div><div className="library-filters"><label>Book<select value={route.book} onChange={event => location.assign(hrefFor(route, { book: event.target.value, page: 1 }))}><option value="">All covered NT books</option>{route.book && !coveredBooks.has(route.book) && <option value={route.book}>{books.find(book => book.code === route.book)?.name || route.book} · no commentary in this collection</option>}{books.filter(book => coveredBooks.has(book.code)).map(book => <option key={book.code} value={book.code}>{book.name}</option>)}</select></label><label>Presentation<select value={route.kind} onChange={event => location.assign(hrefFor(route, { kind: event.target.value, page: 1 }))}><option value="">All comparisons</option><option value="comparison">Edition comparison</option><option value="publisher-note">Publisher-note comparison</option></select></label></div></div>
    <p className="library-result-count">{selected.length} {selected.length === 1 ? 'comparison' : 'comparisons'}</p>
    <div className="library-card-grid">{visible.map(unit => { const href = comparisonHref(unit), saved = bookmarks.some(item => item.url === href); return <article className="library-card comparison-card" key={unit.id}><div className="library-card-meta"><span>{unit.presentation === 'publisher-note' ? 'Publisher-note comparison' : 'Textual comparison'}</span><strong>{formatPassage(unit.ranges)}</strong></div><button className="library-bookmark" aria-pressed={saved} onClick={() => onBookmark({ url: href, label: unit.title, detail: formatPassage(unit.ranges) })}>{saved ? 'Saved' : 'Save'}</button><h3><AppLink href={href}>{unit.title}</AppLink></h3><div className="library-card-summary"><Markdown skipHtml>{unit.summary}</Markdown></div><p className="library-card-foot">Seven named editions · Ordinary Means explanation{unit.publisherNoteCount ? ` · ${unit.publisherNoteCount} pinned publisher notes` : ''}</p><AppLink className="library-card-action" href={href}>Open with the passage →</AppLink></article>; })}</div>
    {!selected.length && <p className="notice">No textual comparisons match these filters. This commentary collection covers selected New Testament passages. <AppLink href={hrefFor(route, { book: '', kind: '', q: '', page: 1 })}>Clear comparison filters</AppLink></p>}
    <Pager route={{ ...route, page }} pages={pages} />
  </>;
}

function ArticleList({ route, articles, bookmarks, onBookmark }: { route: Route; articles: Article[]; bookmarks: DeviceLink[]; onBookmark: (link: Omit<DeviceLink, 'savedAt'>) => void }) {
  const categories = [...new Set(articles.map(article => article.category))].sort();
  const selected = articles.filter(article => !route.category || article.category === route.category);
  const pageSize = 24, pages = Math.max(1, Math.ceil(selected.length / pageSize)), page = Math.min(route.page, pages);
  const visible = selected.slice((page - 1) * pageSize, page * pageSize);
  return <>
    <div className="library-collection-heading"><div><p className="library-type">Ordinary Means commentary</p><p>Approved, article-length studies. Scripture quotations remain part of the authored commentary.</p></div><div className="library-filters"><label>Topic category<select value={route.category} onChange={event => location.assign(hrefFor(route, { category: event.target.value, page: 1 }))}><option value="">All categories</option>{categories.map(category => <option key={category}>{category}</option>)}</select></label></div></div>
    <p className="library-result-count">{selected.length} {selected.length === 1 ? 'word study' : 'word studies'}</p>
    <div className="library-card-grid article-grid">{visible.map(article => { const href = hrefFor(route, { article: article.slug, page: 1 }), saved = bookmarks.some(item => item.url === href); return <article className="library-card article-card" key={article.slug}><div className="library-card-meta"><span>Greek word study</span><strong>{article.category}</strong></div><button className="library-bookmark" aria-pressed={saved} onClick={() => onBookmark({ url: href, label: article.title, detail: article.subtitle })}>{saved ? 'Saved' : 'Save'}</button><h3><AppLink href={href}>{article.title}</AppLink></h3><p className="library-card-subtitle">{article.subtitle}</p><p>{article.description}</p><p className="library-card-foot">By {article.author} · Ordinary Means commentary</p><AppLink className="library-card-action" href={href}>Read the study →</AppLink></article>; })}</div>
    {!selected.length && <p className="notice">No Greek word studies match these filters.</p>}
    <Pager route={{ ...route, page }} pages={pages} />
  </>;
}

function WordList({ route, words, bookmarks, onBookmark }: { route: Route; words: Word[]; bookmarks: DeviceLink[]; onBookmark: (link: Omit<DeviceLink, 'savedAt'>) => void }) {
  const selected = words.filter(word => route.kind !== 'with-study' || word.articleSlugs.length > 0);
  const pageSize = 40, pages = Math.max(1, Math.ceil(selected.length / pageSize)), page = Math.min(route.page, pages);
  const visible = selected.slice((page - 1) * pageSize, page * pageSize);
  return <>
    <div className="library-collection-heading"><div><p className="library-type">Dictionary and corpus data</p><p>Indexed lemmas from the pinned Nestle 1904 analysis. Definitions describe possible meaning ranges; occurrence counts are edition-specific.</p></div><div className="library-filters"><label>Availability<select value={route.kind} onChange={event => location.assign(hrefFor(route, { kind: event.target.value, page: 1 }))}><option value="">All indexed lemmas</option><option value="with-study">Ordinary Means study available</option></select></label></div></div>
    <p className="library-result-count">{selected.length.toLocaleString()} indexed {selected.length === 1 ? 'lemma' : 'lemmas'}</p>
    <div className="library-word-list">{visible.map(word => { const href = hrefFor(route, { lemma: word.lemmaId, page: 1 }), saved = bookmarks.some(item => item.url === href); return <article className="library-word-row" key={word.lemmaId}><div><h3><AppLink lang="grc" href={href}>{word.lemma}</AppLink></h3><p>{transliterateGreek(word.lemma)}</p></div><p>{word.definitions.length === 1 ? word.definitions[0].brief : word.definitions.length ? 'Multiple source-numbered dictionary entries' : 'Dodson definition unavailable'}</p><div className="library-word-stats"><strong>{word.occurrenceCount.toLocaleString()}</strong><span>{word.occurrenceCount === 1 ? 'occurrence' : 'occurrences'}</span>{word.articleSlugs.length > 0 && <span className="library-study-badge">Word study available</span>}<button className="library-bookmark" aria-pressed={saved} onClick={() => onBookmark({ url: href, label: word.lemma, detail: transliterateGreek(word.lemma) })}>{saved ? 'Saved' : 'Save'}</button></div></article>; })}</div>
    {!selected.length && <p className="notice">No Greek lemmas match these filters.</p>}
    <Pager route={{ ...route, page }} pages={pages} />
  </>;
}
