'use client';
import AppLink from '@/components/app-link';
import {useEffect,useState,useRef,type FormEvent} from 'react';
import {editions,createLocalAdapter,type Coverage,type Segment,type PublisherNote} from '@/lib/domain/corpus';
import {address,resolveReference,passageUrl,type PassageRange} from '@/lib/domain/references';
import {formatPassage} from '@/lib/reading-display';
import {loadGospelParallels,gospelBooks,parallelMatches,parallelAccounts,parallelGroups,parallelKey,type GospelParallel} from '@/lib/domain/gospel-parallels';
import './gospel-parallels.css';
type Reading={range:PassageRange;segments:Segment[];coverage:Coverage[];notes:PublisherNote[]};
const english=editions.filter(e=>e.language==='en');
export default function GospelParallels({locationKey,onNavigate}:{locationKey:string;onNavigate:(url:string)=>void}){
 const heading=useRef<HTMLHeadingElement>(null);
 const [records,setRecords]=useState<GospelParallel[]|null>(null),[error,setError]=useState('');
 const [reference,setReference]=useState(''),[input,setInput]=useState(''),[query,setQuery]=useState(''),[id,setId]=useState(''),[edition,setEdition]=useState('BSB'),[page,setPage]=useState(1);
 const [readings,setReadings]=useState<Reading[]|null>(null),[readingError,setReadingError]=useState('');
 useEffect(()=>{let active=true;loadGospelParallels().then(d=>{if(active)setRecords(d.records);}).catch(e=>{if(active)setError(e.message);});return()=>{active=false;};},[]);
 useEffect(()=>{const p=new URLSearchParams(locationKey);setReference(p.get('passage')||'');setInput(p.get('passage')||'');setQuery(p.get('q')||'');setId(p.get('parallel')||'');const requested=p.get('parallelEdition');setEdition(english.some(e=>e.editionId===requested)?requested!:'BSB');setPage(Math.max(1,Number(p.get('page'))||1));},[locationKey]);
 function change(next:{passage?:string;q?:string;parallel?:string;parallelEdition?:string;page?:number}){
  const state={passage:reference,q:query,parallel:id,parallelEdition:edition,page,...next};const p=new URLSearchParams({view:'parallels'});
  for(const [key,value] of Object.entries(state))if(value&&(key!=='page'||value!==1))p.set(key,String(value));onNavigate(`/library?${p}`);
 }
 let ranges:PassageRange[]=[],referenceError='';
 try{if(reference){ranges=resolveReference(reference);if(ranges.some(r=>!gospelBooks.includes(address(r.start).book.code)||!gospelBooks.includes(address(r.end).book.code)))throw Error('Choose a reference within Matthew, Mark, Luke or John.');}}catch(e){referenceError=(e as Error).message;}
 const groups=parallelGroups(records||[]);
 const matches=groups.filter(g=>!referenceError&&(!ranges.length||g.some(r=>parallelMatches(r,ranges)))&&(!query||g.some(r=>`${r.title} ${formatPassage(parallelAccounts(r))}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())))).map(g=>g.find(r=>ranges.some(p=>parallelMatches({...r,targetRanges:[]},[p])))||g[0]);
 const selected=id?records?.find(r=>r.id===id):undefined;
 useEffect(()=>{if(selected)heading.current?.focus();},[selected?.id]);
 const pages=Math.max(1,Math.ceil(matches.length/20)),currentPage=Math.min(page,pages),shown=matches.slice((currentPage-1)*20,currentPage*20);
 useEffect(()=>{let active=true;setReadings(null);setReadingError('');if(!selected)return()=>{active=false;};
 const adapter=createLocalAdapter(undefined,edition);
 Promise.all(parallelAccounts(selected).map(async range=>{const result=await adapter.getPassage([range]);if(result.coverage.some(c=>c.dataState!=='available'||c.textState==='unknown'))throw Error('One or more accounts could not be loaded.');const anchors=new Set(result.coverage.map(c=>c.anchor)),ids=new Set(result.coverage.flatMap(c=>c.publisherNoteIds));const notes=(await adapter.getReadingChapters([range])).flatMap(c=>c.notes).filter(n=>anchors.has(n.anchor)||ids.has(n.id));if([...ids].some(id=>!notes.some(n=>n.id===id)))throw Error('A publisher note could not be loaded.');return {range,segments:result.segments,coverage:result.coverage,notes:[...new Map(notes.map(n=>[n.id,n])).values()]};})).then(r=>{if(active)setReadings(r);}).catch(e=>{if(active)setReadingError(e.message);});return()=>{active=false;};
 },[selected,edition]);
 function submit(e:FormEvent){e.preventDefault();change({passage:input.trim(),parallel:'',page:1});}
 return <section className="gospel-parallels"><p className="eyebrow">GOSPEL PARALLELS</p><h2>Read the Gospel accounts together</h2><p>Explore related accounts linked in BSB publisher headings. Choose a passage or browse by heading, then read the accounts side by side.</p>
 <form className="greek-research-form" onSubmit={submit}><label>Gospel reference or range<input value={input} onChange={e=>setInput(e.target.value)} placeholder="Matthew 3:13–17" /></label><button type="submit">Find parallels</button><button type="button" onClick={()=>change({passage:'',q:'',parallel:'',page:1})}>Browse all parallels</button></form>
 <div className="greek-research-form"><label>Filter headings<input value={query} onChange={e=>change({q:e.target.value,parallel:'',page:1})} placeholder="Baptism, feeding, resurrection…" /></label><label>Reading edition<select value={edition} onChange={e=>change({parallelEdition:e.target.value})}>{english.map(e=><option key={e.editionId} value={e.editionId}>{e.name}</option>)}</select></label></div>
 {(error||referenceError)&&<p role="alert">{error||referenceError}</p>}{!records&&!error&&<p role="status">Loading Gospel parallels…</p>}
 {records&&!error&&!referenceError&&<p role="status">{matches.length} matching parallel groups · page {currentPage} of {pages}</p>}
 {records&&!error&&!referenceError&&!matches.length&&<p>No publisher links are indexed for this selection. This does not establish that another Gospel has no related account.</p>}
 {id&&records&&!selected&&<p role="alert">This Gospel parallel is unavailable in the preserved index.</p>}
 {selected&&<section aria-labelledby="parallel-heading" className="parallel-detail"><div className="study-controls"><button onClick={()=>change({parallel:''})}>Close parallel reading</button></div><h3 id="parallel-heading" ref={heading} tabIndex={-1}>{selected.title}</h3><p className="study-help">Source section: {formatPassage([selected.sourceRange])} · BSB publisher heading</p>
 {readingError&&<p role="alert">{readingError} This is a source data error.</p>}{!readings&&!readingError&&<p role="status">Loading parallel accounts…</p>}
 {readings&&<div className="parallel-accounts">{readings.map((r,i)=><article key={i}><h4>{formatPassage([r.range])}</h4><p className="study-help">{edition} · {r.range===selected.sourceRange?'Publisher section':'Explicit publisher reference'}</p><AppLink href={passageUrl([r.range],edition)}>Read in context →</AppLink>{r.segments.map(s=><p key={s.id}><small className="parallel-verse">{s.anchors.map(a=>`${address(a).chapter}:${address(a).verse}`).join(', ')} </small>{s.text}</p>)}{r.coverage.filter(c=>c.textState==='absent').map(c=><p className="study-help" key={c.anchor}>{formatPassage([{start:c.anchor,end:c.anchor}])}: absent in this edition’s main reading; see publisher notes.</p>)}{r.notes.length>0&&<details><summary>Publisher notes ({r.notes.length})</summary>{r.notes.map(n=><p key={n.id}><strong>{formatPassage([{start:n.anchor,end:n.anchor}])}</strong> {n.body}</p>)}</details>}</article>)}</div>}
 <details><summary>Publisher citation and passage boundaries</summary>{groups.find(g=>parallelKey(g[0])===parallelKey(selected))?.map(r=><blockquote key={r.id}><p>{r.title} · {formatPassage([r.sourceRange])}</p><p>{r.publisherReference}</p><footer>{r.sourceEdition} · {r.sourceRelease} · {r.sourceId}</footer></blockquote>)}<p>The source passage follows the BSB section heading through the verse before the next heading. The other passages retain the publisher’s explicit reference ranges. Section boundaries do not establish quotation extent or an editorial harmonization.</p><p className="study-help">{selected.sourceEdition} · {selected.sourceRelease} · {selected.sourceId}</p></details></section>}
 <div className="parallel-list">{shown.map(r=><article key={r.id}><h3>{r.title}</h3><p>{formatPassage(parallelAccounts(r))}</p><p className="study-help">BSB publisher section at {formatPassage([r.sourceRange])}</p><AppLink aria-current={r.id===id?'true':undefined} href={`/library?view=parallels&parallel=${r.id}&parallelEdition=${edition}`} onClick={e=>{if(!e.metaKey&&!e.ctrlKey&&!e.shiftKey&&!e.altKey){e.preventDefault();change({parallel:r.id});}}}>Read parallel accounts →</AppLink></article>)}</div>
 {matches.length>20&&<nav className="chapter-nav" aria-label="Gospel parallel pages"><button disabled={currentPage<=1} onClick={()=>change({page:currentPage-1,parallel:''})}>Previous parallels</button><button disabled={currentPage>=pages} onClick={()=>change({page:currentPage+1,parallel:''})}>Next parallels</button></nav>}
 <details><summary>About Gospel parallels</summary><p>146 distinct passage groups preserve 361 publisher sections from the included BSB source, linking Matthew, Mark, Luke and John. Identical passage groups share a reading, retaining every original citation. Reciprocal headings with different passage boundaries remain separate. This collection follows publisher links and does not claim exhaustive coverage, a combined chronology, or an Ordinary Means interpretation.</p><a href="/about/sources">Sources &amp; Editions →</a></details></section>;
}
