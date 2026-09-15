'use client';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { books, passageUrl, type PassageRange } from '@/lib/domain/references';
import { formatPassage } from '@/lib/reading-display';
import { transliterateGreek } from '@/lib/domain/greek-reading';

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
type View = 'comparisons' | 'articles' | 'lexicon';
type Route = { view: View; q: string; book: string; kind: string; category: string; page: number; article: string; lemma: string };
const emptyRoute: Route = { view: 'comparisons', q: '', book: '', kind: '', category: '', page: 1, article: '', lemma: '' };

function currentRoute(): Route {
  if (typeof window === 'undefined') return emptyRoute;
  const p = new URLSearchParams(location.search);
  const requested = p.get('view');
  return {
    view: requested === 'articles' || requested === 'lexicon' ? requested : 'comparisons',
    q: p.get('q') || '',
    book: p.get('book') || '',
    kind: p.get('kind') || '',
    category: p.get('category') || '',
    page: Math.max(1, Number(p.get('page')) || 1),
    article: p.get('article') || '',
    lemma: p.get('lemma') || '',
  };
}
function folded(value: string) {
  return value.normalize('NFD').replace(/\p{M}/gu, '').toLocaleLowerCase();
}
function includesQuery(values: (string | number | undefined)[], query: string) {
  const needle = folded(query.trim());
  return !needle || folded(values.filter(value => value !== undefined).join(' ')).includes(needle);
}
function hrefFor(route: Route, changes: Partial<Route>) {
  const next = { ...route, ...changes };
  const p = new URLSearchParams();
  if (next.view !== 'comparisons') p.set('view', next.view);
  if (next.q) p.set('q', next.q);
  if (next.book && next.view === 'comparisons') p.set('book', next.book);
  if (next.kind && next.view !== 'articles') p.set('kind', next.kind);
  if (next.category && next.view === 'articles') p.set('category', next.category);
  if (next.page > 1) p.set('page', String(next.page));
  if (next.article && next.view === 'articles') p.set('article', next.article);
  if (next.lemma && next.view === 'lexicon') p.set('lemma', next.lemma);
  const query = p.toString();
  return `/library${query ? `?${query}` : ''}`;
}
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
      <a className="brand" href="/">Ad Fontes NT<span>A New Testament study environment from Ordinary Means.</span></a>
      <nav aria-label="Primary">
        <a href="/">Read</a>
        <a className="active" href="/library">Library</a>
        <a href="/about/sources">Sources &amp; Editions</a>
        <a href="/downloads">Downloads</a>
        {!offline && <a href="/account">My notes</a>}
      </nav>
      <details className="mobile-nav">
        <summary>Menu</summary>
        <nav aria-label="Mobile primary">
          <a href="/">Read</a><a className="active" href="/library">Library</a><a href="/about/sources">Sources &amp; Editions</a><a href="/downloads">Downloads</a>{!offline && <a href="/account">My notes</a>}<span className="mobile-nav-subtitle">A New Testament study environment from Ordinary Means.</span>
        </nav>
      </details>
    </header>
  </>;
}
function LibraryFooter({ offline }: { offline: boolean }) {
  return <footer className="public-footer">
    <span>Larry Herzog Jr., publishing as Ordinary Means</span>
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
    {route.page > 1 ? <a href={hrefFor(route, { page: route.page - 1 })}>← Previous</a> : <span />}
    <span>Page {Math.min(route.page, pages)} of {pages}</span>
    {route.page < pages ? <a href={hrefFor(route, { page: route.page + 1 })}>Next →</a> : <span />}
  </nav>;
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
    <div className="library-return"><a href={hrefFor(route, { article: '', page: 1 })}>← Browse Greek Word Studies</a></div>
    <article className="library-article om-study-body" id="library-results">
      <p className="library-type">Ordinary Means Greek word study</p>
      <h1>{article.title}</h1>
      <p className="library-article-subtitle">{article.subtitle}</p>
      <p>By {article.author} · Saved {article.snapshotDate}</p>
      <p className="library-provenance">Ad Fontes BSB adaptation · Commentary is distinct from Scripture and dictionary data.</p>
      {word && <p><a href={hrefFor(route, { view: 'lexicon', article: '', lemma: word.lemmaId, page: 1, category: '' })}>Explore {article.headword} in the Greek lexicon and New Testament occurrences →</a></p>}
      {error ? <p role="alert" className="notice">{error}</p> : markdown === null ? <p role="status">Loading article…</p> :
        <Markdown skipHtml remarkPlugins={[remarkGfm]} components={{ a: ({ href, children, node: _node, ...props }) => {
          if (!href || href.startsWith('#')) return <a {...props} href={href}>{children}</a>;
          const target = new URL(href, article.url);
          const local = index.articles.find(item => item.url === target.href);
          return local ? <a href={hrefFor(route, { view: 'articles', article: local.slug, lemma: '', page: 1 })}>{children}</a> :
            <a {...props} href={target.protocol === 'https:' ? target.href : undefined} target="_blank" rel="noopener noreferrer">{children}</a>;
        } }}>{markdown}</Markdown>}
      <p className="om-study-frequency-note">Unless individually labeled otherwise, occurrence counts are NFC-normalized lemma totals from the main reading of pinned Nestle 1904 ({index.textReleaseId}). Cognate lemmas, variant readings, the appended shorter ending, and two verses with unavailable analysis are excluded.</p>
      <p><a href={article.url} target="_blank" rel="noopener noreferrer">Open original website edition on larryherzogjr.com ↗</a></p>
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
    <div className="library-return"><a href={hrefFor(route, { lemma: '', page: 1 })}>← Browse Greek Lexicon</a></div>
    <section className="library-word-detail" id="library-results">
      <p className="library-type">Greek lexicon and corpus data</p>
      <h1 lang="grc">{word.lemma}</h1>
      <p className="library-transliteration">{transliterateGreek(word.lemma)}</p>
      {word.definitions.length === 1 ? <><h2>Meaning range</h2><p>{word.definitions[0].brief}</p><p className="library-source-note">Dodson Greek Lexicon (2010) · Strong’s {word.definitions[0].strongs}. A dictionary meaning range is not an automatic interpretation of any passage.</p></> :
        <p className="library-source-note">{word.definitions.length ? 'Multiple source-numbered dictionary entries share this headword; open an occurrence for source-matched detail.' : 'No unambiguous Dodson definition is available for this indexed lemma.'}</p>}
      {articles.length > 0 && <section className="library-linked-study"><p className="library-type">Ordinary Means commentary available</p>{articles.map(article => <h2 key={article.slug}><a href={hrefFor(route, { view: 'articles', lemma: '', article: article.slug, page: 1 })}>{article.title}: {article.subtitle} →</a></h2>)}</section>}
      <h2>{word.occurrenceCount.toLocaleString()} indexed {word.occurrenceCount === 1 ? 'occurrence' : 'occurrences'} in Nestle 1904</h2>
      <p>Counts use the pinned main reading only. The highlighted token opens in its verse-level Greek explorer; no English word alignment is implied.</p>
      {error && <p role="alert" className="notice">{error}</p>}
      {!lemma && !error && <p role="status">Loading occurrences…</p>}
      <ol className="library-occurrences">
        {hits.map(hit => <li key={hit.tokenId}><a href={occurrenceHref(hit.anchor, hit.tokenId)}><strong>{formatPassage([{ start: hit.anchor, end: hit.anchor }])}</strong> · <span lang="grc">{hit.surface}</span></a><p lang="grc">{hit.text}</p></li>)}
      </ol>
      <Pager route={{ ...route, page }} pages={pages} />
    </section>
  </>;
}

export default function Library({ offline = false }: { offline?: boolean }) {
  const [route, setRoute] = useState<Route>(emptyRoute);
  const [queryInput, setQueryInput] = useState('');
  const [index, setIndex] = useState<LibraryIndex | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    const requestedRoute = currentRoute();
    setRoute(requestedRoute);
    setQueryInput(requestedRoute.q);
    const controller = new AbortController();
    fetch('/library/index.json', { signal: controller.signal }).then(async response => {
      if (!response.ok) throw Error('The Study Library could not be loaded.');
      const data = await response.json() as LibraryIndex;
      if (data.schemaVersion !== 1 || data.comparisonCount !== 104 || data.articleCount !== 250 || data.lemmaCount !== 5400)
        throw Error('The Study Library release is incomplete.');
      setIndex(data);
    }).catch(reason => { if (!controller.signal.aborted) setError(reason.message); });
    return () => controller.abort();
  }, []);
  const data = useMemo(() => {
    if (!index) return null;
    const comparisons = [...index.comparisons].sort((a, b) => {
      const aa = a.ranges[0].start, bb = b.ranges[0].start;
      const [ab, ac, av] = aa.split('.'), [bbk, bc, bv] = bb.split('.');
      return books.find(book => book.code === ab)!.order - books.find(book => book.code === bbk)!.order || Number(ac) - Number(bc) || Number(av) - Number(bv);
    }).filter(unit => includesQuery([unit.title, formatPassage(unit.ranges), unit.summary, unit.searchText], route.q));
    const articles = [...index.articles].sort((a, b) => a.transliteration.localeCompare(b.transliteration)).filter(article => includesQuery([article.title, article.headword, article.transliteration, article.gloss, article.description, article.category, article.tags.join(' ')], route.q));
    const words = [...index.words].sort((a, b) => a.lemma.localeCompare(b.lemma, 'el')).filter(word => includesQuery([word.lemma, transliterateGreek(word.lemma), word.occurrenceCount, ...word.definitions.flatMap(definition => [definition.brief, definition.strongs])], route.q));
    return { comparisons, articles, words };
  }, [index, route.q]);
  function search(event: FormEvent) {
    event.preventDefault();
    location.assign(hrefFor(route, { q: queryInput.trim(), page: 1, article: '', lemma: '' }));
  }
  const article = index?.articles.find(item => item.slug === route.article);
  const word = index?.words.find(item => item.lemmaId === route.lemma);
  return <>
    <LibraryHeader offline={offline} />
    <main className="library-page">
      {article && index ? <ArticleDetail index={index} article={article} route={route} /> : word && index ? <WordDetail index={index} word={word} route={route} /> : <>
        <p className="eyebrow">Study Library</p>
        <h1>Browse the New Testament’s textual questions and Greek words.</h1>
        <p className="library-intro">Search reviewed textual comparisons, Ordinary Means Greek studies, and edition-specific lexicon data.</p>
        <form className="library-search" role="search" onSubmit={search}>
          <label htmlFor="library-query">Search by passage, title, Greek word, gloss, topic, or Strong’s number</label>
          <div><input id="library-query" value={queryInput} onChange={event => setQueryInput(event.target.value)} /><button>Search</button></div>
        </form>
        {error && <p role="alert" className="notice">{error}</p>}
        {!index && !error && <div className="library-skeleton" role="status" aria-label="Loading the Study Library"><span /><span /><span /></div>}
        {index && data && <>
          <nav className="library-tabs" aria-label="Library collections">
            <a className={route.view === 'comparisons' ? 'active' : ''} href={hrefFor(route, { view: 'comparisons', page: 1, article: '', lemma: '', category: '', kind: '' })}><strong>Textual Comparisons</strong><span>{data.comparisons.length}</span><small>Reviewed passage studies</small></a>
            <a className={route.view === 'articles' ? 'active' : ''} href={hrefFor(route, { view: 'articles', page: 1, article: '', lemma: '', book: '', kind: '' })}><strong>Greek Word Studies</strong><span>{data.articles.length}</span><small>Ordinary Means commentary</small></a>
            <a className={route.view === 'lexicon' ? 'active' : ''} href={hrefFor(route, { view: 'lexicon', page: 1, article: '', lemma: '', book: '', kind: '', category: '' })}><strong>Greek Lexicon</strong><span>{data.words.length.toLocaleString()}</span><small>Dictionary and corpus data</small></a>
          </nav>
          <section id="library-results" tabIndex={-1}>
            {route.view === 'comparisons' && <ComparisonList route={route} units={data.comparisons} />}
            {route.view === 'articles' && <ArticleList route={route} articles={data.articles} />}
            {route.view === 'lexicon' && <WordList route={route} words={data.words} />}
          </section>
        </>}
      </>}
    </main>
    <LibraryFooter offline={offline} />
  </>;
}

function ComparisonList({ route, units }: { route: Route; units: Comparison[] }) {
  const selected = units.filter(unit => (!route.book || unit.ranges[0].start.startsWith(`${route.book}.`)) && (!route.kind || unit.presentation === route.kind));
  const pageSize = 24, pages = Math.max(1, Math.ceil(selected.length / pageSize)), page = Math.min(route.page, pages);
  const visible = selected.slice((page - 1) * pageSize, page * pageSize);
  return <>
    <div className="library-collection-heading"><div><p className="library-type">Ordinary Means commentary</p><h2>Textual Comparisons</h2><p>Reviewed questions about what the seven named editions print. Publisher notes and edition readings remain identified separately.</p></div><div className="library-filters"><label>Book<select value={route.book} onChange={event => location.assign(hrefFor(route, { book: event.target.value, page: 1 }))}><option value="">All books</option>{books.map(book => <option key={book.code} value={book.code}>{book.name}</option>)}</select></label><label>Presentation<select value={route.kind} onChange={event => location.assign(hrefFor(route, { kind: event.target.value, page: 1 }))}><option value="">All comparisons</option><option value="comparison">Edition comparison</option><option value="publisher-note">Publisher-note comparison</option></select></label></div></div>
    <p className="library-result-count">{selected.length} {selected.length === 1 ? 'comparison' : 'comparisons'}</p>
    <div className="library-card-grid">{visible.map(unit => <article className="library-card comparison-card" key={unit.id}><div className="library-card-meta"><span>{unit.presentation === 'publisher-note' ? 'Publisher-note comparison' : 'Textual comparison'}</span><strong>{formatPassage(unit.ranges)}</strong></div><h3><a href={comparisonHref(unit)}>{unit.title}</a></h3><div className="library-card-summary"><Markdown skipHtml>{unit.summary}</Markdown></div><p className="library-card-foot">Seven named editions · Ordinary Means explanation{unit.publisherNoteCount ? ` · ${unit.publisherNoteCount} pinned publisher notes` : ''}</p><a className="library-card-action" href={comparisonHref(unit)}>Open with the passage →</a></article>)}</div>
    {!selected.length && <p className="notice">No textual comparisons match these filters.</p>}
    <Pager route={{ ...route, page }} pages={pages} />
  </>;
}

function ArticleList({ route, articles }: { route: Route; articles: Article[] }) {
  const categories = [...new Set(articles.map(article => article.category))].sort();
  const selected = articles.filter(article => !route.category || article.category === route.category);
  const pageSize = 24, pages = Math.max(1, Math.ceil(selected.length / pageSize)), page = Math.min(route.page, pages);
  const visible = selected.slice((page - 1) * pageSize, page * pageSize);
  return <>
    <div className="library-collection-heading"><div><p className="library-type">Ordinary Means commentary</p><h2>Greek Word Studies</h2><p>Approved, article-length studies. Scripture quotations remain part of the authored commentary and are identified as an Ad Fontes BSB adaptation.</p></div><div className="library-filters"><label>Topic category<select value={route.category} onChange={event => location.assign(hrefFor(route, { category: event.target.value, page: 1 }))}><option value="">All categories</option>{categories.map(category => <option key={category}>{category}</option>)}</select></label></div></div>
    <p className="library-result-count">{selected.length} {selected.length === 1 ? 'word study' : 'word studies'}</p>
    <div className="library-card-grid article-grid">{visible.map(article => <article className="library-card article-card" key={article.slug}><div className="library-card-meta"><span>Greek word study</span><strong>{article.category}</strong></div><h3><a href={hrefFor(route, { article: article.slug, page: 1 })}>{article.title}</a></h3><p className="library-card-subtitle">{article.subtitle}</p><p>{article.description}</p><p className="library-card-foot">By {article.author} · Ordinary Means commentary</p><a className="library-card-action" href={hrefFor(route, { article: article.slug, page: 1 })}>Read the study →</a></article>)}</div>
    {!selected.length && <p className="notice">No Greek word studies match these filters.</p>}
    <Pager route={{ ...route, page }} pages={pages} />
  </>;
}

function WordList({ route, words }: { route: Route; words: Word[] }) {
  const selected = words.filter(word => route.kind !== 'with-study' || word.articleSlugs.length > 0);
  const pageSize = 40, pages = Math.max(1, Math.ceil(selected.length / pageSize)), page = Math.min(route.page, pages);
  const visible = selected.slice((page - 1) * pageSize, page * pageSize);
  return <>
    <div className="library-collection-heading"><div><p className="library-type">Dictionary and corpus data</p><h2>Greek Lexicon</h2><p>Indexed lemmas from the pinned Nestle 1904 analysis. Definitions describe possible meaning ranges; occurrence counts are edition-specific.</p></div><div className="library-filters"><label>Availability<select value={route.kind} onChange={event => location.assign(hrefFor(route, { kind: event.target.value, page: 1 }))}><option value="">All indexed lemmas</option><option value="with-study">Ordinary Means study available</option></select></label></div></div>
    <p className="library-result-count">{selected.length.toLocaleString()} indexed {selected.length === 1 ? 'lemma' : 'lemmas'}</p>
    <div className="library-word-list">{visible.map(word => <article className="library-word-row" key={word.lemmaId}><div><h3><a lang="grc" href={hrefFor(route, { lemma: word.lemmaId, page: 1 })}>{word.lemma}</a></h3><p>{transliterateGreek(word.lemma)}</p></div><p>{word.definitions.length === 1 ? word.definitions[0].brief : word.definitions.length ? 'Multiple source-numbered dictionary entries' : 'Dodson definition unavailable'}</p><div className="library-word-stats"><strong>{word.occurrenceCount.toLocaleString()}</strong><span>{word.occurrenceCount === 1 ? 'occurrence' : 'occurrences'}</span>{word.articleSlugs.length > 0 && <span className="library-study-badge">Word study available</span>}</div></article>)}</div>
    {!selected.length && <p className="notice">No Greek lemmas match these filters.</p>}
    <Pager route={{ ...route, page }} pages={pages} />
  </>;
}
