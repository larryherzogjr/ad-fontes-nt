'use client';
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ReaderEnvironment, useReaderEnvironment } from './environment';
import omRelease from '@/lib/domain/om-release.json';
import type { WordLink } from '@/lib/domain/lexical';

type Article = { slug: string; title: string; subtitle: string; author: string; url: string; snapshotDate: string; contentSha256: string };
const { releaseId, articleCount, schemaVersion } = omRelease;
const Studies = createContext<{ articles: Article[]; offline: boolean; open: (article: Article, trigger: HTMLElement) => void }>({ articles: [], offline: false, open: () => {} });

function EmbeddedWordStudyLink({ link }: { link: WordLink }) {
  const { articles, offline, open } = useContext(Studies);
  const article = articles.find(article => article.url === link.url);
  return <p className="word-study-link">{article ?
    <button className="saved-study-link" onClick={event => open(article, event.currentTarget)}>Read Larry’s word study: {link.title}</button> :
    <a href={link.url} target="_blank" rel="noopener noreferrer">Read Larry’s word study: {link.title} ↗</a>}
    <small>Ordinary Means commentary · {article ? (offline ? 'Available offline' : 'Read here') : (offline ? 'Website · internet required' : 'Opens on larryherzogjr.com')}</small>
  </p>;
}

export function WordStudies({ children, offline = false }: { children: ReactNode; offline?: boolean }) {
  const inheritedEnvironment = useReaderEnvironment();
  const environment = {
    ...inheritedEnvironment,
    WordStudyLink: EmbeddedWordStudyLink,
    readingStatus: offline ? 'Reading position and text size are saved on this computer.' : inheritedEnvironment.readingStatus,
    wordStudyDescription: `Greek word associations use the pinned September 6, 2026 Word Explorer index and its reviewed aliases. All ${articleCount} approved Greek articles open here in an Ad Fontes BSB adaptation, with links to the unchanged original website editions. Each article identifies its saved date. Article quotations remain part of the authored Ordinary Means commentary, separate from the Scripture editions. Unless individually labeled otherwise, occurrence counts are NFC-normalized lemma totals from the main reading of pinned Nestle 1904 release n1904-2026-09-05-m2-v1. They exclude cognate lemmas, variant readings, the appended shorter ending, and two verses whose analysis is unavailable. Other editions or explicitly combined word families can produce different totals.` + (offline ? ' The included articles are available offline; original website links require internet access.' : ''),
  };
  const [articles, setArticles] = useState<Article[]>([]);
  const [selected, setSelected] = useState<Article | null>(null);
  const [markdown, setMarkdown] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [articleError, setArticleError] = useState(false);
  const cache = useRef(new Map<string, string>());
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    fetch(`/om/${releaseId}/index.json`, { signal: controller.signal }).then(async response => {
      if (!response.ok) throw Error('Unavailable');
      const bundle = await response.json();
      if (bundle.releaseId !== releaseId || bundle.schemaVersion !== schemaVersion || bundle.articles?.length !== articleCount) throw Error('Invalid snapshot');
      setArticles(bundle.articles);
    }).catch(() => { if (!controller.signal.aborted) setError(true); });
    return () => controller.abort();
  }, []);
  useEffect(() => {
    setMarkdown(null);
    setArticleError(false);
    if (!selected) return;
    const article = selected;
    const controller = new AbortController();
    if (dialog.current && !dialog.current.open) dialog.current.showModal();
    dialog.current?.scrollTo(0, 0);
    dialog.current?.querySelector<HTMLButtonElement>('button')?.focus();
    const cached = cache.current.get(article.slug);
    if (cached !== undefined) setMarkdown(cached);
    else fetch(`/om/${releaseId}/articles/${article.slug}.json`, { signal: controller.signal }).then(async response => {
      if (!response.ok) throw Error('Unavailable');
      const data = await response.json();
      if (data.releaseId !== releaseId || data.schemaVersion !== schemaVersion || data.article?.slug !== article.slug || data.article.contentSha256 !== article.contentSha256 || typeof data.article.markdown !== 'string') throw Error('Invalid article');
      if (controller.signal.aborted) return;
      cache.current.set(article.slug, data.article.markdown);
      setMarkdown(data.article.markdown);
    }).catch(() => { if (!controller.signal.aborted) setArticleError(true); });
    return () => controller.abort();
  }, [selected]);
  function close() {
    dialog.current?.close();
    setSelected(null);
    requestAnimationFrame(() => {
      const target = trigger.current?.isConnected ? trigger.current : document.querySelector<HTMLElement>('[aria-pressed="true"].greek-word, #open-greek');
      target?.focus();
    });
  }
  return <Studies.Provider value={{ articles, offline, open: (article, element) => { trigger.current = element; setSelected(article); } }}>
    <ReaderEnvironment.Provider value={environment}>
      {error && <p role="alert" className="notice">The Ordinary Means article collection could not be loaded. {offline ? 'Restart the application' : 'Reload the page'} to try again. You can still open the original website links.</p>}
      {children}
      {selected && createPortal(<dialog ref={dialog} className="om-study" aria-labelledby="om-study-title" onCancel={event => { event.preventDefault(); event.stopPropagation(); close(); }} onKeyDown={event => { if (event.key === 'Escape') event.stopPropagation(); }}>
        <header className="om-study-header"><div><p>Ordinary Means commentary</p><h2 id="om-study-title">{selected.title}</h2></div><button autoFocus onClick={close}>Return to Greek</button></header>
        <article className="om-study-body"><p className="om-study-subtitle">{selected.subtitle}</p><p>By {selected.author} · Saved {selected.snapshotDate}</p><p>Ad Fontes BSB adaptation · The linked website preserves the original article edition.</p>
          {articleError ? <p role="alert">This article could not be loaded. Return to Greek and try again, or use the original website link below.</p> : markdown === null ? <p role="status">Loading article…</p> :
          <Markdown skipHtml remarkPlugins={[remarkGfm]} components={{ a: ({ href, children, node: _node, ...props }) => {
            if (href?.startsWith('#')) return <a {...props} href={href} onClick={event => {
              event.preventDefault();
              const target = document.getElementById(decodeURIComponent(href.slice(1)));
              if (target && dialog.current?.contains(target)) { target.scrollIntoView({ block: 'center' }); target.tabIndex = -1; target.focus({ preventScroll: true }); }
            }}>{children}</a>;
            const url = new URL(href || '', selected.url);
            const local = articles.find(article => article.url === url.href);
            return local ? <button className="saved-study-link" onClick={() => setSelected(local)}>{children}</button> : <a {...props} href={url.protocol === 'https:' ? url.href : undefined} target="_blank" rel="noopener noreferrer">{children}</a>;
          } }}>{markdown}</Markdown>}
          <p className="om-study-frequency-note">Unless individually labeled otherwise, occurrence counts are NFC-normalized lemma totals from the main reading of pinned Nestle 1904 (n1904-2026-09-05-m2-v1). Cognate lemmas, variant readings, the appended shorter ending, and two verses with unavailable analysis are excluded.</p>
          <p><a href={selected.url} target="_blank" rel="noopener noreferrer">Open original website edition on larryherzogjr.com ↗</a>{offline && ' · Internet required'}</p>
        </article>
      </dialog>, document.body)}
    </ReaderEnvironment.Provider>
  </Studies.Provider>;
}
