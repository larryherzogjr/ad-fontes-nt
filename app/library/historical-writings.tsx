'use client';
import AppLink from '@/components/app-link';
import {useEffect,useRef,useState,type MouseEvent} from 'react';
import {historicalBase,historicalRelease,historicalUrl,loadHistoricalCatalog,loadHistoricalSection,type HistoricalCatalog,type HistoricalSection} from '@/lib/domain/historical-library';
import {type DeviceLink} from '@/lib/device-links';
import './historical-writings.css';
import JosephusNotice from './josephus-notice';
import HistoricalScan from './historical-scan';

export default function HistoricalWritings({locationKey,onNavigate,bookmarks,onBookmark,onRead}:{locationKey:string;onNavigate:(url:string)=>void;bookmarks:DeviceLink[];onBookmark:(link:Omit<DeviceLink,'savedAt'>)=>void;onRead:(link:Omit<DeviceLink,'savedAt'>)=>void}) {
 const params=new URLSearchParams(locationKey),workId=params.get('work')||'',sectionId=params.get('section')||'',category=params.get('historicalCategory')||'',scan=params.get('scan')||'';
 const [catalog,setCatalog]=useState<HistoricalCatalog|null>(null),[data,setData]=useState<HistoricalSection|null>(null),[error,setError]=useState('');
 const heading=useRef<HTMLHeadingElement>(null),contents=useRef<HTMLHeadingElement>(null),lastSection=useRef('');
 const work=catalog?.works.find(w=>w.id===workId),meta=work?.sections.find(s=>s.id===sectionId),position=work?.sections.findIndex(s=>s.id===sectionId)??-1;
 useEffect(()=>{const abort=new AbortController();loadHistoricalCatalog(abort.signal).then(setCatalog).catch(e=>{if(!abort.signal.aborted)setError(e.message);});return()=>abort.abort();},[]);
 useEffect(()=>{
  setData(null);setError('');if(!work||!meta)return;
  const abort=new AbortController();loadHistoricalSection(work,meta,abort.signal).then(value=>{if(abort.signal.aborted)return;setData(value);onRead({url:historicalUrl(work.id,meta.id),label:`${work.title} · ${meta.label}`,detail:work.author});}).catch(e=>{if(!abort.signal.aborted)setError(e.message);});return()=>abort.abort();
 // Reading history is recorded only after successful source loading.
 },[work,meta]);
 useEffect(()=>{if(data&&data.work===workId&&data.id===sectionId){lastSection.current=data.id;heading.current?.focus();heading.current?.scrollIntoView({block:'start'});}else if(work&&!sectionId){const link=document.getElementById(`historical-contents-${lastSection.current}`);(link||contents.current)?.focus();}},[data,work,sectionId,workId]);
 function follow(e:MouseEvent<HTMLAnchorElement>){if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;e.preventDefault();onNavigate(e.currentTarget.getAttribute('href')!);}
 function returnToContents(){onNavigate(historicalUrl(workId));}
 useEffect(()=>{if(!sectionId)return;const close=(e:KeyboardEvent)=>{if(e.key==='Escape'&&!['INPUT','SELECT','TEXTAREA'].includes((e.target as HTMLElement).tagName)){e.preventDefault();returnToContents();}};addEventListener('keydown',close);return()=>removeEventListener('keydown',close);},[sectionId,workId]);
 const searchCollection=work?.id.startsWith('josephus-')?'josephus':work?.id;
 const saved=bookmarks.some(b=>b.url===historicalUrl(workId,sectionId));
 const navigation=work&&meta&&<nav className="historical-page-nav" aria-label="Historical reading sections">{position>0?<AppLink href={historicalUrl(work.id,work.sections[position-1].id)} onClick={follow}>← Previous reading</AppLink>:<span/>}<span>{position+1} of {work.sections.length}</span>{position<work.sections.length-1?<AppLink href={historicalUrl(work.id,work.sections[position+1].id)} onClick={follow}>Next reading →</AppLink>:<span/>}</nav>;
 return <div className="historical-library"><p className="library-type">Historical theology and background</p><h1>Historical Writings</h1>
 {!workId&&<><p>Read Walther, Krauth, Josephus and Edersheim in their own words, with source notes and edition details. These historical writings are distinct from Scripture, the confessional documents and Ordinary Means commentary.</p><label className="historical-category">Browse by subject<select value={category} onChange={e=>onNavigate(historicalUrl('','',e.target.value))}><option value="">All historical writings</option><option value="Historical theology">Historical theology</option><option value="Historical background">Historical background</option></select></label></>}
 {error&&<p role="alert" className="notice">{error}</p>}
 {!catalog&&!error&&<p role="status">Loading historical writings…</p>}
 {catalog&&workId&&!work&&<p role="alert">This work is unavailable in the current collection. <AppLink href={historicalUrl()} onClick={follow}>Browse historical writings</AppLink></p>}
 {catalog&&!workId&&<div className="library-card-grid">{catalog.works.filter(w=>!category||w.category===category).map(w=><article className="library-card" key={w.id}><p className="library-type">{w.category}</p><h2><AppLink href={historicalUrl(w.id)} onClick={follow}>{w.title}</AppLink></h2><p>By {w.author}{w.translator&&` · Translated by ${w.translator}`}</p><p>{w.description}</p><p className="study-help">{w.edition}</p><AppLink href={historicalUrl(w.id)} onClick={follow}>Browse readings →</AppLink></article>)}</div>}
 {work&&<><nav className="commentary-actions" aria-label="Historical work actions"><AppLink href={historicalUrl('','',category)} onClick={follow}>← All historical writings</AppLink><AppLink href={`/library?view=fulltext&collection=${searchCollection}`} onClick={follow}>Search this author’s text →</AppLink></nav><h2>{work.title}</h2><p>By {work.author}{work.translator&&` · Translated by ${work.translator}`}</p><p>{work.edition}</p>{work.id.startsWith('josephus-')&&<JosephusNotice/>}<details className="historical-source"><summary>Source, edition and transcription details</summary><p>{work.notice}</p><p>{work.rights}</p><p><AppLink href={work.sourceUrl}>Original source →</AppLink> · <AppLink href={`${historicalBase}/notices.txt`}>Distributor notices</AppLink> · <AppLink href={`${historicalBase}/manifest.json`}>Source manifest</AppLink></p><p className="study-help">Release: {historicalRelease}. Source divisions do not establish Scripture passage alignment.</p></details>
 {!sectionId?<><h3 ref={contents} tabIndex={-1}>Contents</h3>{[...new Set(work.sections.map(s=>s.group))].map(group=><section className="historical-contents" key={group}><h4>{group||'Readings'}</h4><ol>{work.sections.filter(s=>s.group===group).map(s=><li key={s.id}><AppLink id={`historical-contents-${s.id}`} href={historicalUrl(work.id,s.id)} onClick={follow} aria-current={lastSection.current===s.id?'location':undefined}>{s.label}</AppLink></li>)}</ol></section>)}</>:!meta?<p role="alert">This reading is unavailable. <AppLink href={historicalUrl(work.id)} onClick={follow}>Return to contents</AppLink></p>:<>
 <div className="historical-controls"><AppLink href={historicalUrl(work.id)} onClick={follow}>← Contents</AppLink><label>Reading<select value={meta.id} onChange={e=>onNavigate(historicalUrl(work.id,e.target.value))}>{[...new Set(work.sections.map(s=>s.group))].map(group=><optgroup key={group} label={group||'Readings'}>{work.sections.filter(s=>s.group===group).map(s=><option key={s.id} value={s.id}>{s.label}</option>)}</optgroup>)}</select></label><button aria-pressed={saved} onClick={()=>onBookmark({url:historicalUrl(work.id,meta.id),label:`${work.title} · ${meta.label}`,detail:work.author})}>{saved?'Saved':'Save reading'}</button></div>
 {navigation}<p className="library-type">{meta.group}</p><h3 ref={heading} tabIndex={-1}>{meta.label}</h3><p className="notice">{work.notice}</p>
 {(!data||data.work!==workId||data.id!==sectionId)&&!error&&<p role="status">Loading reading…</p>}{data&&data.work===workId&&data.id===sectionId&&(data.pages?<HistoricalScan data={data} scan={scan} onNavigate={onNavigate}/>:<article className="historical-prose" aria-label={`${work.title} · ${meta.label}`}>{data.paragraphs.map((text,i)=><p key={i} id={`historical-${meta.id}-p${i+1}`}>{text}</p>)}</article>)}{navigation}
 </>}</>}
 </div>;
}
