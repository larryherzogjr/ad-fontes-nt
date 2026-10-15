'use client';
import AppLink from '@/components/app-link';
import {useEffect,useState} from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {hebrewStudyUrl} from '@/lib/hebrew-study-navigation';
const release='hebrew-studies-2026-10-09-v2';
type Article={slug:string;title:string;subtitle:string;author:string;url:string;snapshotDate:string;contentSha256:string;markdown:string};
export default function HebrewStudy({slug,search,onNavigate}:{slug:string;search:string;onNavigate:(href:string)=>void}){
 const [article,setArticle]=useState<Article|null>(null),[error,setError]=useState('');
 useEffect(()=>{
  const controller=new AbortController();setArticle(null);setError('');
  fetch(`/om/${release}/index.json`,{signal:controller.signal}).then(async r=>{
   if(!r.ok)throw Error('The Hebrew study index could not be loaded.');
   const index=await r.json();if(index.releaseId!==release||index.schemaVersion!==2)throw Error('Hebrew study release mismatch.');
   const meta=index.articles.find((a:Article)=>a.slug===slug);if(!meta)throw Error('This Hebrew study is not in the released Library.');
   const response=await fetch(`/om/${release}/articles/${encodeURIComponent(meta.slug)}.json`,{signal:controller.signal});
   if(!response.ok)throw Error('The Hebrew study could not be loaded.');
   const data=await response.json();
   if(data.releaseId!==release||data.schemaVersion!==2||data.article?.slug!==meta.slug||data.article.contentSha256!==meta.contentSha256||typeof data.article.markdown!=='string')throw Error('The Hebrew study does not match the released Library index.');
   setArticle(data.article);
  }).catch(e=>{if(!controller.signal.aborted)setError(e.message)});
  const frame=requestAnimationFrame(()=>{const heading=document.getElementById('library-top');heading?.focus({preventScroll:true});scrollTo(0,0);});
  return()=>{controller.abort();cancelAnimationFrame(frame)};
 },[slug]);
 function navigate(e:React.MouseEvent<HTMLAnchorElement>){if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;e.preventDefault();onNavigate(e.currentTarget.getAttribute('href')!)}
 return <><div className="library-return"><AppLink href={hebrewStudyUrl(search)} onClick={navigate}>← Back to Hebrew Word Explorer</AppLink></div>
 <article className="library-article om-study-body" id="hebrew-study">
 <p className="library-type">Ordinary Means Hebrew word study</p>
 {error?<p role="alert" className="notice">{error}</p>:!article?<p role="status">Loading article…</p>:<>
 <h1>{article.title}</h1><p className="library-article-subtitle">{article.subtitle}</p><p>By {article.author} · Saved {article.snapshotDate}</p>
 <p className="library-provenance">Scripture quotations use the Berean Standard Bible (BSB). Authored commentary is distinct from Scripture and OSHB analysis.</p>
 <Markdown skipHtml remarkPlugins={[remarkGfm]} components={{a:({href,children})=>{
  if(!href||href.startsWith('#'))return <AppLink href={href}>{children}</AppLink>;
  const target=new URL(href,article.url),match=target.pathname.match(/^\/hebrew\/([^/]+)\/$/);
  return target.origin==='https://larryherzogjr.com'&&match?<AppLink href={hebrewStudyUrl(search,match[1])} onClick={navigate}>{children}</AppLink>:<AppLink href={target.protocol==='https:'?target.href:undefined} target="_blank" rel="noopener noreferrer">{children}</AppLink>;
 }}}>{article.markdown}</Markdown>
 <p><AppLink href={article.url} target="_blank" rel="noopener noreferrer">Read on larryherzogjr.com ↗</AppLink></p>
 </>}
 </article></>;
}
