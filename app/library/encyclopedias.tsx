'use client';
import { useEffect, useMemo, useRef, useState, type MouseEvent } from 'react';
import AppLink from '@/components/app-link';
import { readDeviceLinks, rememberDeviceLink, writeDeviceLinks } from '@/lib/device-links';
import { encyclopediaFold, encyclopediaHref, loadEncyclopedias, loadEncyclopediaArticle, type EncyclopediaIndex, type EncyclopediaArticle } from '@/lib/domain/encyclopedias';
import './encyclopedias.css';

export default function Encyclopedias({ locationKey, onNavigate, onDeviceLinksChange }: { locationKey: string; onNavigate: (url: string) => void; onDeviceLinksChange: () => void }) {
  const params = new URLSearchParams(locationKey), workId = params.get('work') || '', entryId = params.get('entry') || '', query = params.get('q') || '', letter = params.get('letter') || '';
  const [index, setIndex] = useState<EncyclopediaIndex | null>(null), [loadedArticle, setArticle] = useState<EncyclopediaArticle | null>(null), [error, setError] = useState(''), [input, setInput] = useState(query), [saved, setSaved] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null), listing = useRef<HTMLDivElement>(null);
  const work = index?.works.find(w => w.id === workId), entry = work?.entries.find(e => e.id === entryId);
  const article = loadedArticle?.id === entryId && loadedArticle.work === workId ? loadedArticle : null;
  const detailUrl = encyclopediaHref('', { work: workId, entry: entryId });
  const browseUrl = encyclopediaHref(locationKey, { entry: '', work: params.has('browseWork') ? params.get('browseWork')!.replace(/^all$/, '') : workId, browseWork: '' });
  useEffect(() => { const abort = new AbortController(); loadEncyclopedias(abort.signal).then(setIndex).catch(e => { if (!abort.signal.aborted) setError(e.message); }); return () => abort.abort(); }, []);
  useEffect(() => { setInput(query); }, [query]);
  useEffect(() => {
    const abort = new AbortController(); setArticle(null); setError('');
    if (work && entry) loadEncyclopediaArticle(work, entry, abort.signal).then(data => {
      if (abort.signal.aborted) return;
      setArticle(data);
      rememberDeviceLink('afnt-recent-studies', { url: detailUrl, label: entry.label, detail: `${work.title} (${work.year})` });
      setSaved(readDeviceLinks('afnt-library-bookmarks').some(link => link.url === detailUrl));
      onDeviceLinksChange();
    }).catch(e => { if (!abort.signal.aborted) setError(e.message); });
    return () => abort.abort();
  }, [work, entry, detailUrl, onDeviceLinksChange]);
  useEffect(() => { if (article) { heading.current?.focus(); heading.current?.scrollIntoView({ block: 'start' }); } }, [article]);
  useEffect(() => {
    if (!index || entryId) return;
    try {
      const snapshot = JSON.parse(sessionStorage.getItem(`af-encyclopedia:${browseUrl}`) || 'null');
      if (snapshot) requestAnimationFrame(() => { scrollTo(0, snapshot.y); [...listing.current?.querySelectorAll<HTMLAnchorElement>('a[data-entry]') || []].find(a => a.dataset.entry === snapshot.id)?.focus({ preventScroll: true }); });
    } catch { /* Optional browsing memory. */ }
  }, [index, entryId, browseUrl]);
  useEffect(() => {
    if (!entryId) return;
    const escape = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.preventDefault(); onNavigate(browseUrl); } };
    addEventListener('keydown', escape); return () => removeEventListener('keydown', escape);
  }, [entryId, browseUrl, onNavigate]);
  const matches = useMemo(() => {
    const needle = encyclopediaFold(query.trim());
    return (work ? [work] : index?.works || []).flatMap(w => w.entries.filter(e => (!letter || e.letter === letter) && (!needle || encyclopediaFold(e.title).includes(needle))).map(e => ({ work: w, entry: e })))
      .sort((a, b) => Number(encyclopediaFold(b.entry.title) === needle) - Number(encyclopediaFold(a.entry.title) === needle) || a.entry.title.localeCompare(b.entry.title, 'en') || a.work.id.localeCompare(b.work.id) || a.entry.label.localeCompare(b.entry.label, 'en', { numeric: true }) || a.entry.id.localeCompare(b.entry.id));
  }, [index, work, query, letter]);
  const pages = Math.max(1, Math.ceil(matches.length / 30)), requestedPage = Number(params.get('page')), page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? Math.min(requestedPage, pages) : 1;
  function go(changes: Record<string, string>) { onNavigate(encyclopediaHref(locationKey, changes)); requestAnimationFrame(() => { listing.current?.focus({ preventScroll: true }); listing.current?.scrollIntoView({ block: 'start' }); }); }
  function open(e: MouseEvent<HTMLAnchorElement>) {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    if (e.currentTarget.dataset.entry) try { sessionStorage.setItem(`af-encyclopedia:${browseUrl}`, JSON.stringify({ y: scrollY, id: e.currentTarget.dataset.entry })); } catch {}
    onNavigate(e.currentTarget.getAttribute('href')!);
  }
  function bookmark() {
    if (!work || !entry) return;
    if (saved) writeDeviceLinks('afnt-library-bookmarks', readDeviceLinks('afnt-library-bookmarks').filter(link => link.url !== detailUrl));
    else rememberDeviceLink('afnt-library-bookmarks', { url: detailUrl, label: entry.label, detail: `${work.title} (${work.year})` }, 30);
    setSaved(!saved);
    onDeviceLinksChange();
  }
  return <div className="encyclopedias">
    <p className="library-type">Historical reference works</p>
    {entryId ? <AppLink href={browseUrl} onClick={open}>← Back to encyclopedia entries</AppLink> : <h1>Encyclopedias</h1>}
    {error && <p role="alert" className="notice">{error}</p>}
    {!index && !error && <p role="status">Loading encyclopedias…</p>}
    {index && ((workId && !work) || (entryId && !entry)) ? <p role="alert">This encyclopedia or entry is unavailable. <AppLink href="/library?view=encyclopedias">Browse encyclopedias</AppLink></p> : index && <>
      {entryId && work && entry ? <>
        <h1 ref={heading} tabIndex={-1}>{entry.label}</h1>
        <p>{work.title} ({work.year}) · {work.editors}</p>
        <button type="button" disabled={!article} aria-pressed={saved} onClick={bookmark}>{saved ? 'Remove bookmark' : 'Bookmark article'}</button>
        {work.entries.some(e => e.title === entry.title && e.id !== entry.id) && <details className="encyclopedia-related"><summary>Other source entries with this heading</summary>{work.entries.filter(e => e.title === entry.title && e.id !== entry.id).map(e => <p key={e.id}><AppLink href={encyclopediaHref(locationKey, { entry: e.id })} onClick={open}>{e.label}</AppLink><br /><small>{e.preview}</small></p>)}</details>}
        <EncyclopediaNotice />
        {!article && !error && <p role="status">Loading article…</p>}
        {article && <article className="library-article om-study-body" aria-label={entry.label}>
          {article.paragraphs.map((p, i) => <p key={i} dir="auto">{p}</p>)}
          {article.redirect && <aside className="encyclopedia-related" aria-label="Referenced encyclopedia entry">
            {article.redirect.targets.length ? <><h2>Follow this reference</h2>{article.redirect.targets.map(id => { const target = work.entries.find(e => e.id === id)!; return <p key={id}><AppLink href={encyclopediaHref(locationKey, { entry: id })} onClick={open}>{target.label}</AppLink><br /><small>{target.preview}</small></p>; })}</> : <p>The source reference “{article.redirect.label}” has no verified destination in this edition.</p>}
          </aside>}
        </article>}
        <p className="library-source-note">Article locator: {work.id}/{entry.id}. {article?.suppliedVolume ? `Supplied volume group: ${article.suppliedVolume}. ` : ''}Cite by article heading and edition; print-page locators are not exposed in this view.</p>
        <AppLink href={browseUrl} onClick={open}>← Back to encyclopedia entries</AppLink>
      </> : <>
        <p>Biblical background and historical Lutheran reference. Browse a work or search its article headings.</p>
        <div className="library-filters"><label>Reference work<select value={workId} onChange={e => go({ work: e.target.value, entry: '', page: '' })}><option value="">Both encyclopedias</option>{index.works.map(w => <option key={w.id} value={w.id}>{w.title} ({w.year})</option>)}</select></label></div>
        <EncyclopediaNotice />
        <form className="library-search" role="search" onSubmit={e => { e.preventDefault(); go({ q: input.trim(), page: '' }); }}><label htmlFor="encyclopedia-query">Find an article heading</label><div><input id="encyclopedia-query" value={input} onChange={e => setInput(e.target.value)} maxLength={250} /><button>Find</button></div></form>
        <p className="study-help">Headings ignore case and accents. <AppLink href={`/library?view=fulltext${work ? `&collection=${work.id === 'isbe' ? 'isbe' : 'lutheran'}` : ''}${query ? `&q=${encodeURIComponent(query)}` : ''}`}>Search full article text →</AppLink></p>
        <nav className="encyclopedia-alphabet" aria-label="Article initial"><button aria-pressed={!letter} onClick={() => go({ letter: '', page: '' })}>All</button>{'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(l => <button key={l} aria-pressed={letter === l} onClick={() => go({ letter: l, page: '' })}>{l}</button>)}</nav>
        <p role="status">{matches.length.toLocaleString()} readings · Page {page} of {pages}</p>
        <div ref={listing} tabIndex={-1} aria-label="Encyclopedia entries" className="library-card-grid">{matches.slice((page - 1) * 30, page * 30).map(({ work: w, entry: e }) => <article className="library-card" key={`${w.id}:${e.id}`}><p className="library-type">{w.title} · {w.year}</p><h2><AppLink data-entry={`${w.id}:${e.id}`} href={encyclopediaHref(locationKey, { work: w.id, entry: e.id, browseWork: workId || 'all' })} onClick={open}>{e.label}</AppLink></h2><p>{e.preview}{e.preview.length === 220 ? '…' : ''}</p></article>)}</div>
        {!matches.length && <p>No headings match these filters. Try another letter or search the full article text.</p>}
        <nav className="library-pager" aria-label="Encyclopedia pages"><button disabled={page <= 1} onClick={() => go({ page: String(page - 1) })}>← Previous</button><span>Page {page} of {pages}</span><button disabled={page >= pages} onClick={() => go({ page: String(page + 1) })}>Next →</button></nav>
      </>}
    </>}
  </div>;
}

export function EncyclopediaNotice() {
  return <details className="commentary-source"><summary>About these reference works</summary><p>International Standard Bible Encyclopaedia (Orr, 1915) and The Lutheran Cyclopedia (Jacobs and Haas, 1899). Historical reference articles retain the supplied wording, author signatures and original-language text. They are distinct from Scripture, confessional documents and Ordinary Means commentary.</p><p>Text-only transcriptions supplied from publisher editions. Illustrations/maps, ISBE indexes, and the Lutheran Cyclopedia appendix and contributor index are not included. Margin headings can interrupt paragraphs. Front matter and abbreviations are available as readings. Volume groups are supplied metadata; print-page locators and a complete visual source-layout audit are not exposed in this view.</p><p>Repeated headings remain separate source entries; the preview distinguishes their subjects or treatments. Only verified full-entry “See…” references have navigation links. No passage associations or word alignments are inferred.</p></details>;
}
