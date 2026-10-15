'use client';
import AppLink from '@/components/app-link';
import { useEffect, useRef, useState, type MouseEvent } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { books } from '../lib/domain/references';
import { checkedJson, collectionLabels, loadSearchManifest, matchRanges, parseQuery, searchRelease, type SearchBlock, type SearchDoc, type SearchGroup, type SearchIndex, type TextShard } from '../lib/domain/library-search';
import './full-text-search.css';
import JosephusNotice from './josephus-notice';

type Result = SearchGroup & { excerpts: {block:number;text:string}[] };
type Response = { id:number;error?:string;results:Result[];counts:Record<string,number>;total:number;page:number;pages:number };
// A new query renders once before its effect clears older results. Validation
// belongs to that effect; invalid input must never throw while drawing excerpts.
function safeSpans(text:string,query:string):[number,number][] { try{return matchRanges(text,query);}catch{return [];} }
function Highlight({text,query}:{text:string;query:string}) { let at=0;const parts=[];for(const [start,end] of safeSpans(text,query)){parts.push(text.slice(at,start),<mark key={start}>{text.slice(start,end)}</mark>);at=end;}parts.push(text.slice(at));return <>{parts}</>; }
function highlightElement(element:HTMLElement,query:string) {
 for(const mark of element.querySelectorAll('mark'))mark.replaceWith(document.createTextNode(mark.textContent||''));
 const walker=document.createTreeWalker(element,NodeFilter.SHOW_TEXT), nodes:Text[]=[];let next:Node|null;while((next=walker.nextNode()))nodes.push(next as Text);
 const text=nodes.map(n=>n.data).join(''), spans=safeSpans(text,query);let offset=0;
 for(const node of nodes){const length=node.length, fragment=document.createDocumentFragment();let cursor=0;for(const [start,end] of spans){const a=Math.max(0,start-offset),b=Math.min(length,end-offset);if(a>=b)continue;fragment.append(node.data.slice(cursor,a));const mark=document.createElement('mark');mark.textContent=node.data.slice(a,b);fragment.append(mark);cursor=b;}if(cursor){fragment.append(node.data.slice(cursor));node.replaceWith(fragment);}offset+=length;}
}
function SearchResource({id,block,query,onReturn}:{id:string;block:number;query:string;onReturn:()=>void}) {
 const [data,setData]=useState<{doc:SearchDoc;blocks:SearchBlock[]}|null>(null),[error,setError]=useState('');const target=useRef<HTMLDivElement>(null);
 useEffect(()=>{const close=(event:KeyboardEvent)=>{if(event.key==='Escape'){event.preventDefault();onReturn();}};addEventListener('keydown',close);return()=>removeEventListener('keydown',close);},[onReturn]);
 useEffect(()=>{const abort=new AbortController();setData(null);setError('');(async()=>{
  const collection=id.split(':')[0];if(!collectionLabels[collection])throw Error('Unknown Library collection.');
  parseQuery(query);
  const manifest=await loadSearchManifest(abort.signal), index=await checkedJson<SearchIndex>(`${collection}.bin`,manifest.files[`${collection}.bin`],abort.signal);
  const doc=index.documents.find(d=>d.id===id);if(!doc)throw Error('This resource is unavailable in the active search release.');
  const shard=await checkedJson<TextShard>(doc.shard,manifest.files[doc.shard],abort.signal),blocks=shard.documents[id];
  if(shard.releaseId!==searchRelease||!blocks||blocks.length!==doc.blocks||!Number.isInteger(block)||block<0||block>=blocks.length)throw Error('The resource or matching paragraph is unavailable.');
  if(!abort.signal.aborted)setData({doc,blocks});
 })().catch(e=>{if(!abort.signal.aborted)setError(e.message);});return()=>abort.abort();},[id,block,query]);
 useEffect(()=>{if(data&&target.current){highlightElement(target.current,query);target.current.focus({preventScroll:true});target.current.scrollIntoView({block:'center'});}},[data,query]);
 return <section className="fulltext-context"><nav className="fulltext-context-actions" aria-label="Search match actions"><button onClick={onReturn}>← Back to search results</button></nav>{error?<p role="alert">{error}</p>:!data?<p role="status">Loading resource context…</p>:<>
  <p className="library-type">{collectionLabels[data.doc.collection]}</p><h2>{data.doc.title}</h2><p>By {data.doc.author}</p><p className="notice">{data.doc.notice}</p>
  {data.doc.collection==='josephus'&&<JosephusNotice/>}
  <p><AppLink href={data.doc.sourceUrl+(data.blocks[block]?.scanPage?`&scan=${encodeURIComponent(data.blocks[block].scanPage!)}`:'')} {...(data.doc.sourceUrl.startsWith('https:')?{target:'_blank',rel:'noopener noreferrer'}:{})}>Open {data.doc.sourceUrl.startsWith('https:')?'author’s website':data.blocks[block]?.scanPage?'matching printed page':'standard resource viewer'} →</AppLink></p>
  <article className="om-study-body" aria-label="Resource context">{data.blocks.map((b,i)=>i===0?<div key={i} ref={block===0?target:undefined} tabIndex={block===0?-1:undefined} className={block===0?'fulltext-target':undefined}><h3>{data.doc.title}</h3></div>:<div key={i} ref={block===i?target:undefined} tabIndex={block===i?-1:undefined} className={block===i?'fulltext-target':undefined}>
   {b.markdown?<Markdown skipHtml remarkPlugins={[remarkGfm]} components={{img:({alt})=><span>{alt}</span>,a:({href,children})=>{const url=href?new URL(href,'https://larryherzogjr.com'):null;return <AppLink href={url?.protocol==='https:'?url.href:undefined} target="_blank" rel="noopener noreferrer">{children}</AppLink>;}}}>{b.markdown}</Markdown>:<p>{b.text}</p>}
  </div>)}</article><p className="library-source-note">Source release: {data.doc.release}. Search formatting is derived from the published resource; source wording is preserved.</p><button onClick={onReturn}>← Back to search results</button>
 </>}</section>;
}
export default function FullTextSearch({locationKey,onNavigate}:{locationKey:string;onNavigate:(url:string)=>void}) {
 const params=new URLSearchParams(locationKey), query=params.get('q')||'', collection=params.get('collection')||'', book=params.get('searchBook')||'', page=Math.max(1,Math.floor(Number(params.get('page')))||1), resource=params.get('resource')||'', block=Number(params.get('match')||0);
 const [input,setInput]=useState(query),[result,setResult]=useState<Response|null>(null),[error,setError]=useState(''),[loading,setLoading]=useState(false);
 const worker=useRef<Worker|null>(null),generation=useRef(0),resultRegion=useRef<HTMLDivElement>(null);
 const resultParams=new URLSearchParams(params);resultParams.delete('resource');resultParams.delete('match');const resultUrl=`/library?${resultParams}`;
 useEffect(()=>{const w=new Worker(new URL('./search.worker.ts',import.meta.url),{type:'module'});worker.current=w;
  w.onmessage=({data}:{data:Response})=>{if(data.id!==generation.current)return;setLoading(false);if(data.error){setError(data.error);setResult(null);}else{setError('');setResult(data);}};
  w.onerror=()=>{setLoading(false);setResult(null);setError('Library search could not start. Please reload and retry.');};return()=>{w.terminate();worker.current=null;};
 },[]);
 useEffect(()=>{setInput(query);generation.current++;setResult(null);setError('');setLoading(false);if(resource||!query.trim())return;
  try{if(collection&&!collectionLabels[collection])throw Error('Choose a supported collection.');if(!parseQuery(query).length)throw Error('Enter at least one word to search.');setLoading(true);worker.current?.postMessage({id:generation.current,query,collection,book,page});}catch(e){setError((e as Error).message);}
 },[query,collection,book,page,resource]);
 useEffect(()=>{if(result&&!loading&&!resource){try{const y=sessionStorage.getItem(`af-search-scroll:${resultUrl}`),focus=sessionStorage.getItem(`af-search-focus:${resultUrl}`);if(y)requestAnimationFrame(()=>{scrollTo(0,Number(y));const link=[...resultRegion.current?.querySelectorAll<HTMLAnchorElement>('a[data-search-target]')||[]].find(a=>a.dataset.searchTarget===focus);link?.focus({preventScroll:true});});}catch{ /* Storage can be unavailable. */ }}},[result,loading,resource,resultUrl]);
 function navigate(changes:Record<string,string>) {const p=new URLSearchParams(params);p.set('view','fulltext');p.delete('resource');p.delete('match');for(const [key,value] of Object.entries(changes))value?p.set(key,value):p.delete(key);onNavigate(`/library?${p}`);}
 function destination(id:string,match:number){const p=new URLSearchParams(params);p.set('view','fulltext');p.set('resource',id);p.set('match',String(match));return `/library?${p}`;}
 function open(e:MouseEvent<HTMLAnchorElement>) {if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;e.preventDefault();try{sessionStorage.setItem(`af-search-scroll:${resultUrl}`,String(scrollY));sessionStorage.setItem(`af-search-focus:${resultUrl}`,e.currentTarget.dataset.searchTarget||'');}catch{}onNavigate(e.currentTarget.getAttribute('href')!);}
 return <div className="fulltext-search">{resource?<SearchResource key={`${resource}:${block}`} id={resource} block={block} query={query} onReturn={()=>onNavigate(resultUrl)}/>:<>
  <h2>Search resource text</h2><p>Search the included studies, historical commentaries and historical writings. Scripture search remains available in the reader.</p>
  <form className="library-search" role="search" onSubmit={e=>{e.preventDefault();navigate({q:input.trim(),page:''});}}><label htmlFor="fulltext-query">Search resource text · Words or a quoted phrase</label><div><input id="fulltext-query" value={input} onChange={e=>setInput(e.target.value)} maxLength={250} placeholder={'baptism forgiveness or "forgiveness of sins"'} aria-describedby="fulltext-help"/><button>Search</button></div></form>
  <p id="fulltext-help" className="study-help">All words must occur in the same paragraph or block. Quotation marks require consecutive words. Matches ignore case and accents; no synonyms are added.</p>
  <div className="library-filters fulltext-filters"><label>Collection<select value={collection} onChange={e=>navigate({collection:e.target.value,page:''})}><option value="">All collections{result?` (${Object.values(result.counts).reduce((a,b)=>a+b,0)})`:''}</option>{Object.entries(collectionLabels).map(([id,label])=><option key={id} value={id}>{label}{result?` (${result.counts[id]||0})`:''}</option>)}</select></label>
   <label>Source book<select value={book} onChange={e=>navigate({searchBook:e.target.value,page:''})}><option value="">All books and resources</option>{books.map(b=><option key={b.code} value={b.code}>{b.name}</option>)}</select></label></div>
  {book&&<p className="study-help">Book filtering uses recorded commentary chapter groups and textual-comparison anchors. Word studies and historical writings have no assigned Bible-book coverage and are excluded.</p>}
  {error&&<p role="alert" className="notice">{error} No complete result count is available.</p>}{loading&&<p role="status">Searching the Library…</p>}
  {!query&&!loading&&<p>Try a term that appears inside a study, or search across historical authors.</p>}
  {result&&<div ref={resultRegion}><p role="status">{result.total.toLocaleString()} matching resources · Page {result.page} of {result.pages}</p>{!result.total&&<p>No included resources match this search. Try fewer words or a different collection.</p>}
   <div className="fulltext-results">{result.results.map(r=><article className="library-card" key={r.doc.id}><p className="library-type">{collectionLabels[r.doc.collection]} · {r.doc.author}</p><h3><AppLink href={destination(r.doc.id,r.matches[0])} onClick={open}>{r.doc.title}</AppLink></h3><p className="study-help">{r.matches.length} matching {r.matches.length===1?'block':'blocks'}</p>
    <p><Highlight text={r.excerpts[0].text} query={query}/></p><AppLink data-search-target={`${r.doc.id}:${r.matches[0]}`} href={destination(r.doc.id,r.matches[0])} onClick={open}>Open in context →</AppLink>
    {r.excerpts.length>1&&<details><summary>More matching excerpts</summary>{r.excerpts.slice(1).map(x=><div key={x.block}><p><Highlight text={x.text} query={query}/></p><AppLink href={destination(r.doc.id,x.block)} onClick={open}>Open this match →</AppLink></div>)}{r.matches.length>5&&<p>Showing the first five matching blocks. Open the resource to read its full context.</p>}</details>}
   </article>)}</div>
   <nav className="library-pager" aria-label="Library search pages"><button disabled={result.page<=1} onClick={()=>navigate({page:String(result.page-1)})}>← Previous</button><span>Page {result.page} of {result.pages}</span><button disabled={result.page>=result.pages} onClick={()=>navigate({page:String(result.page+1)})}>Next →</button></nav>
  </div>}
 </>}</div>;
}
