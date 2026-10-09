'use client';
import { useEffect, useState, type FormEvent } from 'react';
import { books, passageUrl } from '@/lib/domain/references';
import { isOtBook } from '@/lib/domain/ot-release';
import { commentaryLibraryUrl, commentaryCollections, loadCommentaryChapter, type CommentaryChapter } from '@/lib/domain/commentaries';
import { CommentaryParagraphs, LenskiSource, RelatedCommentary } from '@/reader/commentaries';

type SearchRow = { chapter: number; paragraph: number; verse: number | null; intro: boolean; text: string };
const fold = (s: string) => s.normalize('NFD').replace(/\p{M}/gu,'').toLocaleLowerCase();
export default function CommentaryLibrary({ onNavigate }: { onNavigate: (url: string) => void }) {
  const params = new URLSearchParams(typeof location === 'undefined' ? '' : location.search);
  const kd = params.get('commentary') === 'kd' || isOtBook(params.get('commentaryBook') || '');
  const collection = kd ? commentaryCollections.kd : commentaryCollections.lenski;
  const ntBooks = books.filter(b => isOtBook(b.code) === kd);
  const book = ntBooks.find(b => b.code === params.get('commentaryBook'));
  const chapter = Math.min(book?.verses.length || 1,Math.max(1, Math.floor(Number(params.get('commentaryChapter'))) || 1));
  const intro = !kd && params.get('commentaryView') === 'intro';
  const targetParagraph = params.get('commentaryParagraph');
  const [data,setData] = useState<CommentaryChapter | null>(null), [error,setError] = useState(''), [query,setQuery] = useState(params.get('commentaryQ') || ''), [results,setResults] = useState<SearchRow[] | null>(null), [searching,setSearching] = useState(false);
  const [submitted,setSubmitted] = useState(params.get('commentaryQ') || '');
  useEffect(() => { if (!book) return; const abort=new AbortController();setData(null);setError('');loadCommentaryChapter(book.code,chapter,abort.signal).then(setData).catch(e => {if(!abort.signal.aborted)setError(e.message);});return()=>abort.abort(); },[book?.code,chapter]);
  useEffect(() => { if (data && targetParagraph !== null) document.getElementById(`lenski-${data.book}-${data.chapter}-p-${Number(targetParagraph)}`)?.scrollIntoView({block:'center'}); },[data,targetParagraph]);
  useEffect(() => {
    if (!submitted || !book) return;
    const abort=new AbortController();setSearching(true);setError('');setResults(null);
    fetch(`${collection.base}/search/${book.code}.json`,{signal:abort.signal}).then(async r=>{if(!r.ok)throw Error('Commentary search could not be loaded.');const d=await r.json();if(d.releaseId!==collection.release || d.book!==book.code || !Array.isArray(d.rows))throw Error('The commentary search index does not match this release.');return d.rows as SearchRow[];}).then(rows=>setResults(rows.filter(r=>fold(r.text).includes(fold(submitted))))).catch(e=>{if(!abort.signal.aborted)setError(e.message);}).finally(()=>{if(!abort.signal.aborted)setSearching(false);});
    return()=>abort.abort();
  },[submitted,book?.code]);
  function submitQuery(value:string){const url=new URL(location.href);if(value)url.searchParams.set('commentaryQ',value);else url.searchParams.delete('commentaryQ');history.replaceState({},'',url.pathname+url.search);setSubmitted(value);if(!value)setResults(null);}
  function search(e:FormEvent){e.preventDefault();submitQuery(query.trim());}
  function go(url:string){onNavigate(url);}
  return <div className="commentary-library"><p className="library-type">Historical commentary</p><nav className="commentary-actions" aria-label="Commentary collections"><a href={commentaryLibraryUrl('',1,'chapter',undefined,'kd')} aria-current={kd?'page':undefined}>Keil &amp; Delitzsch · Old Testament</a><a href={commentaryLibraryUrl()} aria-current={!kd?'page':undefined}>Lenski · New Testament</a></nav><h2>{collection.title}</h2><p>{collection.author} · {collection.count} books · {kd?'Chapter commentary with source numbering retained':'Chapter reading and passage-linked exposition'}</p><LenskiSource kd={kd} />
    {!book ? <div className="library-card-grid">{ntBooks.map(b=><article className="library-card" key={b.code}><h3><a href={commentaryLibraryUrl(b.code)} onClick={e=>{if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;e.preventDefault();go(commentaryLibraryUrl(b.code));}}>{b.name}</a></h3><p>{b.verses.length} {b.verses.length===1?'chapter':'chapters'}</p></article>)}</div> : <>
      <a href={commentaryLibraryUrl('',1,'chapter',undefined,collection.id)}>← Back to Study Library</a>
      <div className="commentary-controls"><label>Book<select value={book.code} onChange={e=>go(commentaryLibraryUrl(e.target.value))}>{ntBooks.map(b=><option key={b.code} value={b.code}>{b.name}</option>)}</select></label><label>Chapter<select value={intro?'intro':chapter} onChange={e=>go(e.target.value==='intro'?commentaryLibraryUrl(book.code,1,'intro'):commentaryLibraryUrl(book.code,Number(e.target.value)))}>{!kd && <option value="intro">Introduction</option>}{book.verses.map((_,i)=><option key={i+1} value={i+1}>{kd && i===0?'Introduction & chapter 1':i+1}</option>)}</select></label></div>
      <form className="library-search" role="search" onSubmit={search}><label htmlFor="lenski-query">Search {kd?'K&D':'Lenski'} commentary on {book.name}</label><div><input id="lenski-query" value={query} onChange={e=>setQuery(e.target.value)} /><button>Search</button>{submitted && <button type="button" onClick={()=>{submitQuery('');setQuery('');}}>Clear</button>}</div></form>
      {error && <p role="alert">{error}</p>}{searching && <p role="status">Searching commentary…</p>}
      {results !== null ? <><p role="status">{results.length} matching paragraphs{results.length>100?' · showing the first 100':''}</p>{results.slice(0,100).map(r=><article className="library-card" key={`${r.chapter}.${r.paragraph}`}><a href={commentaryLibraryUrl(book.code,r.chapter,r.intro?'intro':'chapter',r.paragraph)}>{book.name} {r.chapter}{r.verse?`:${r.verse}`:' · chapter context'}</a><p>{r.text.slice(Math.max(0,fold(r.text).indexOf(fold(submitted))-80),Math.max(0,fold(r.text).indexOf(fold(submitted))-80)+350)}…</p></article>)}</> : !data ? (!error && <p role="status">Loading commentary…</p>) : <>
        {kd && <><p className="notice">Source chapter group · May contain adjacent chapters. Verse numbers follow the commentary.</p><RelatedCommentary chapter={data} /></>}<div className="commentary-actions"><h3>{book.name} · {intro?'Introduction':`Chapter ${chapter}`}</h3><a href={`${passageUrl([{start:`${book.code}.${chapter}.1`,end:`${book.code}.${chapter}.${book.verses[chapter-1]}`}],'BSB')}&panel=commentary`}>Read beside Scripture →</a></div>
        {intro && !data.introEnd ? <p>No separate introduction is present in this chapter. <a href={commentaryLibraryUrl(book.code)}>Read chapter 1</a></p> : <CommentaryParagraphs chapter={data} from={intro?0:data.introEnd} to={intro?data.introEnd:undefined} />}
        <nav className="commentary-actions" aria-label="Commentary chapters">{chapter>1&&<a href={commentaryLibraryUrl(book.code,chapter-1)}>← Previous chapter</a>}{chapter<book.verses.length&&<a href={commentaryLibraryUrl(book.code,chapter+1)}>Next chapter →</a>}</nav>
      </>}
    </>}
  </div>;
}
