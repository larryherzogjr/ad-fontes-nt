'use client';
import SourceLanguageStudy from './source-language-study';
import {useEffect,useState} from 'react';
import {Popover,PopoverTrigger,PopoverContent,PopoverTitle} from '@/components/ui/popover';
import {NativeSelect} from '@/components/ui/native-select';
import {editions} from '@/lib/domain/corpus';
import {books as canonicalBooks} from '@/lib/domain/references';
import {rememberDeviceLink} from '@/lib/device-links';
import {englishLxxBookName,englishLxxBook,englishLxxManifest,englishLxxName,englishLxxUrl,englishLxxNotice,searchEnglishLxx,type EnglishLxxBook,type EnglishLxxManifest,type EnglishLxxHit} from '@/lib/domain/lxx-english';
import {sourceManifest} from '@/lib/domain/original-languages';
import {writeClipboard} from '@/lib/clipboard';

export default function EnglishSeptuagintReader(){
 const url=new URL(typeof location==='undefined'?'http://local/read/GEN/1?translation=LXX2012':location.href);
 const match=/^\/read\/([A-Z0-9]{3})\/(\d+)$/.exec(url.pathname);
 const code=match?.[1]||'GEN', chapter=Number(match?.[2]||1), selected=Number(url.searchParams.get('verses')||0);
 const [manifest,setManifest]=useState<EnglishLxxManifest|null>(null),[book,setBook]=useState<EnglishLxxBook|null>(null),[error,setError]=useState(''),[notice,setNotice]=useState(''),[query,setQuery]=useState(''),[hits,setHits]=useState<EnglishLxxHit[]|null>(null),[searching,setSearching]=useState(false),[page,setPage]=useState(1),[copyStatus,setCopyStatus]=useState('');
 const [picker,setPicker]=useState(false),[versePicker,setVersePicker]=useState(false),[pendingVerse,setPendingVerse]=useState(selected||1),[pendingBook,setPendingBook]=useState(code),[pendingChapter,setPendingChapter]=useState(chapter),[size,setSize]=useState(21),[focusMode,setFocusMode]=useState(false);
 useEffect(()=>{try{const saved=Number(localStorage.getItem('afnt-text-size'));if(saved>=18&&saved<=32)setSize(saved);}catch{}},[]);
 useEffect(()=>{document.body.classList.toggle('reader-focus-mode',focusMode);return()=>document.body.classList.remove('reader-focus-mode');},[focusMode]);
 function resize(value:number){setSize(value);try{localStorage.setItem('afnt-text-size',String(value));}catch{}}
 function studyQuery(nextCode=code){const p=new URLSearchParams(location.search),mode=p.get('panel')||(p.get('parallel')==='1'?'greek':'');return mode==='greek'||mode==='hebrew'?`&panel=${mode}`+(nextCode===code&&p.has('hebrewChapter')?`&hebrewChapter=${encodeURIComponent(p.get('hebrewChapter')!)}`:''):'';}
 async function submit(){
  const ref=/^(.+?)\s+(\d+)(?::(\d+))?$/.exec(query.trim());
  if(ref&&manifest){
   const normalize=(s:string)=>s.toLowerCase().replace(/[.\s]/g,'');const name=normalize(ref[1]);const found=manifest.books.find(b=>[b.code,b.name,englishLxxBookName(b),...(canonicalBooks.find(c=>c.code===b.code)?.aliases||[])].some(n=>normalize(n)===name));
   if(!found){setError('That book is not included in this edition.');return;}
   try{const b=await englishLxxBook(found.code),ch=b.chapters.find(c=>c.chapter===Number(ref[2]));if(!ch||ref[3]&&!ch.verses.some(v=>v.verse<=Number(ref[3])&&v.endVerse>=Number(ref[3])))throw Error('That source reference is not available in this edition.');location.assign(englishLxxUrl(found.code,Number(ref[2]),ref[3]?Number(ref[3]):undefined)+studyQuery(found.code));}catch(e){setError((e as Error).message);}return;
  }
  await search();
 }
 useEffect(()=>{let active=true;Promise.all([englishLxxManifest(),englishLxxBook(code),englishLxxNotice()]).then(([m,b,n])=>{if(!b.chapters.some(c=>c.chapter===chapter))throw Error('That chapter is not included in this edition.');if(selected&&!b.chapters.find(c=>c.chapter===chapter)?.verses.some(v=>v.verse<=selected&&v.endVerse>=selected))throw Error('That verse label is not present in this source chapter.');if(active){setManifest(m);setBook(b);setNotice(n.text);}}).catch(e=>{if(active)setError(e.message);});return()=>{active=false;};},[code,chapter,selected]);
 const data=book?.chapters.find(c=>c.chapter===chapter);
 useEffect(()=>{if(data){rememberDeviceLink('afnt-recent-passages',{url:englishLxxUrl(code,chapter),label:`${book?.name} ${chapter}`,detail:englishLxxName});const target=document.getElementById(selected?`lxx-verse-${data.verses.find(v=>v.verse<=selected&&v.endVerse>=selected)?.verse}`:'reading');target?.focus({preventScroll:true});if(selected)target?.scrollIntoView({block:'center'});}},[data,selected]);
 function go(c:string,ch:number){location.assign(englishLxxUrl(c,ch)+studyQuery(c));}
 const order=manifest?.books.flatMap(b=>b.chapters.map(ch=>({code:b.code,chapter:ch})))||[];
 const index=order.findIndex(x=>x.code===code&&x.chapter===chapter);
 async function search(){setSearching(true);setError('');setHits(null);setPage(1);try{setHits(await searchEnglishLxx(query));}catch(e){setError((e as Error).message);}finally{setSearching(false);}}
 return <>
 <a className="skip" href="#reading">Skip to reading</a>
 <header className="masthead"><a className="brand" href="/">Ad Fontes<span>A biblical study environment from Ordinary Means.</span></a><nav aria-label="Primary"><a href={englishLxxUrl(code,chapter)} className="active">Read</a><a href="/library">Library</a><a href="#lxx-source">Sources &amp; Editions</a><a href="/downloads">Downloads</a></nav><details className="mobile-nav"><summary>Menu</summary><nav aria-label="Mobile primary"><a href={englishLxxUrl(code,chapter)}>Read</a><a href="/library">Library</a><a href="#lxx-source">Sources &amp; Editions</a><a href="/downloads">Downloads</a></nav></details></header>
 <div className="toolbar">
 <div className="passage-navigation">
 <button className="chapter-step" aria-label="Previous chapter" disabled={index<=0} onClick={()=>go(order[index-1].code,order[index-1].chapter)}>←</button>
 <span className="toolbar-label">Passage</span>
 <Popover open={picker} onOpenChange={open=>{setPicker(open);if(open){setPendingBook(code);setPendingChapter(chapter);}}}>
 <PopoverTrigger className="passage-trigger">{book?englishLxxBookName(book):code} {chapter} <span aria-hidden="true">⌄</span></PopoverTrigger>
 <PopoverContent className="reader-popover" align="start"><PopoverTitle>Go to a passage</PopoverTitle>
 <form onSubmit={e=>{e.preventDefault();go(pendingBook,pendingChapter);}}><div className="pickers">
 <label>Book<NativeSelect aria-label="Book" value={pendingBook} onChange={e=>{setPendingBook(e.target.value);setPendingChapter(1);}}>{[false,true].map(extra=><optgroup key={String(extra)} label={extra?'Apocrypha':'Old Testament'}>{manifest?.books.filter(b=>b.apocrypha===extra).map(b=><option key={b.code} value={b.code}>{englishLxxBookName(b)}{b.code==='PSA'?' (including Psalm 151)':''}</option>)}</optgroup>)}</NativeSelect></label>
 <label>Chapter<NativeSelect aria-label="Chapter" value={pendingChapter} onChange={e=>setPendingChapter(Number(e.target.value))}>{manifest?.books.find(b=>b.code===pendingBook)?.chapters.map(c=><option key={c} value={c}>{c}</option>)}</NativeSelect></label>
 </div><button type="submit">OK</button></form></PopoverContent></Popover>
 <button className="chapter-step" aria-label="Next chapter" disabled={index<0||index===order.length-1} onClick={()=>go(order[index+1].code,order[index+1].chapter)}>→</button>
 </div>
 <label className="edition-picker">Edition<NativeSelect aria-label="Edition" value="LXX2012" onChange={async e=>{const target=e.target.value;try{const included=target==='WLC'||target==='CVUL'?(await sourceManifest(target)).books.some(b=>b.code===code):canonicalBooks.some(b=>b.code===code);location.assign(`/read/${included?code:'GEN'}/1?translation=${encodeURIComponent(target)}`)}catch(e){setError((e as Error).message)}}}>{editions.filter(e=>e.language==='en').map(e=><option key={e.editionId} value={e.editionId}>{e.name}</option>)}<option value="LXX2012">{englishLxxName}</option><option value="WLC">Westminster Leningrad Codex · Hebrew / Aramaic</option><option value="CVUL">Clementine Vulgate · Latin</option></NativeSelect></label>
 <div className="toolbar-search unified-reader-search"><form className="passage-form" onSubmit={e=>{e.preventDefault();void submit();}}><label htmlFor="lxx-reference">Go to a passage or search Scripture</label><div className="input-row"><input id="lxx-reference" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Genesis 1:1 or grace" autoComplete="off" required/><button type="submit" disabled={searching}>Go</button></div></form></div>
 </div>
 <main className="reader-layout lxx-reader" id="reading" tabIndex={-1}>
 {error&&<p role="alert">{error} <a href={englishLxxUrl('GEN')}>Open Genesis in LXX2012</a></p>}{!book&&!error&&<p role="status">Loading English Septuagint…</p>}
 {book&&data&&<>
 <div className="reader-tools"><div className="study-actions">
 <SourceLanguageStudy code={code} chapter={chapter} label={`${englishLxxBookName(book)} ${chapter}`} greek/>
 <button className="study-tool focus-tool" aria-pressed={focusMode} onClick={()=>setFocusMode(!focusMode)}><span className="tool-symbol" aria-hidden="true">◫</span>{focusMode?'Exit focus':'Focus'}</button>
 </div><Popover><PopoverTrigger className="settings-trigger" aria-label="Reading settings">Aa</PopoverTrigger><PopoverContent className="reader-popover" align="end"><PopoverTitle>Reading settings</PopoverTitle><p className="control-label">Scripture text size</p><div className="type-size" aria-label="Text size"><button aria-label="Decrease text size" disabled={size<=18} onClick={()=>resize(size-1)}>A−</button><output aria-label="Current text size">{size}</output><button aria-label="Increase text size" disabled={size>=32} onClick={()=>resize(size+1)}>A+</button></div><hr/><strong>{englishLxxName}</strong><p className="study-help">English translation of the Septuagint. Source numbering retained.</p><a href="#lxx-source">Sources &amp; Editions</a></PopoverContent></Popover></div>
 <div className="reader-selection-status"><p className="reader-hint">{selected?`Selected: ${englishLxxBookName(book)} ${chapter}:${selected}`:'Tap a verse number to select it for copying. Open Greek or Hebrew to study the source texts.'}</p><Popover open={versePicker} onOpenChange={open=>{setVersePicker(open);if(open)setPendingVerse(selected||data.verses[0].verse);}}><PopoverTrigger>{selected?'Edit selection':'Select verse'}</PopoverTrigger><PopoverContent className="reader-popover verse-picker" align="start"><PopoverTitle>Select a source verse</PopoverTitle><form onSubmit={e=>{e.preventDefault();location.assign(englishLxxUrl(code,chapter,pendingVerse)+studyQuery());}}><label>Verse<NativeSelect aria-label="Verse" value={pendingVerse} onChange={e=>setPendingVerse(Number(e.target.value))}>{data.verses.map(v=><option key={v.verse} value={v.verse}>{v.label}</option>)}</NativeSelect></label><div className="verse-picker-actions"><button type="submit">Apply selection</button><button type="button" onClick={()=>setVersePicker(false)}>Cancel</button></div></form></PopoverContent></Popover>{selected>0&&<><button onClick={()=>go(code,chapter)}>Clear selection</button><button onClick={async()=>{const v=data.verses.find(v=>v.verse<=selected&&v.endVerse>=selected);if(v)try{await writeClipboard(`${englishLxxBookName(book)} ${chapter}:${v.label} (LXX2012)\n${v.text}`);setCopyStatus('Selection copied with reference.');}catch{setCopyStatus('Could not copy. Select the text to copy it manually.');}}}>Copy selection</button><output>{copyStatus}</output></>}</div>
{searching&&<p role="status">Searching…</p>}{hits&&<section aria-label="Search results"><p role="status">{hits.length} matching source verses · exact phrase, ignoring case</p>{hits.slice((page-1)*20,page*20).map(h=><p key={`${h.book}.${h.chapter}.${h.verse}`}><a href={englishLxxUrl(h.book,h.chapter,h.verse)}>{manifest?.books.find(b=>b.code===h.book)&&englishLxxBookName(manifest.books.find(b=>b.code===h.book)!)} {h.chapter}:{h.verse}</a> {h.text}</p>)}{hits.length>20&&<nav className="chapter-nav"><button disabled={page<=1} onClick={()=>setPage(page-1)}>Previous results</button><span>Page {page} of {Math.ceil(hits.length/20)}</span><button disabled={page*20>=hits.length} onClick={()=>setPage(page+1)}>Next results</button></nav>}</section>}
 <div className="lxx-english-columns single"><section aria-label="English Septuagint text" className="chapter ot-chapter">
 <p className="ot-edition-disclosure">English Septuagint reading · Source numbering retained.</p><div className="chapter-heading"><p className="edition">{englishLxxName}</p><h1>{englishLxxBookName(book)} <span>{chapter}</span></h1></div>
 {chapter===1&&book.preface.length>0&&<details><summary>Publisher book heading and introduction</summary>{book.preface.map((p,i)=><p key={i}>{p}</p>)}{book.otherNotes.map(n=><p key={n.id}>Publisher note: {n.text}</p>)}</details>}
 {data.headings.map((h,i)=><p className="study-help" key={i}>{h}</p>)}
 {data.headingNotes.length>0&&<details className="lxx-publisher-notes"><summary>Publisher heading notes</summary>{data.headingNotes.map(n=><p key={n.id}>{n.text}</p>)}</details>}
 <div className="scripture" lang="en" style={{fontSize:`${size/16}rem`}}>
 {data.verses.map(v=><div className="lxx-source-verse" data-sync-numbers={Array.from({length:v.endVerse-v.verse+1},(_,i)=>`${chapter}:${v.verse+i}`).join(' ')} id={`lxx-verse-${v.verse}`} tabIndex={-1} key={v.verse}><p className="text-block"><sup><a href={englishLxxUrl(code,chapter,v.verse)+studyQuery()} onClick={e=>{if(e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;e.preventDefault();location.assign(englishLxxUrl(code,chapter,v.verse)+studyQuery());}} aria-label={`${englishLxxBookName(book)} ${chapter}:${v.label}`}>{v.label}</a></sup>{v.parts.map((p,i)=>p.kind==='supplied'||p.kind==='italic'?<em key={i}>{p.text}</em>:<span key={i}>{p.text}</span>)}{v.textState==='source-empty'&&<small className="study-help">No main text under this label in the supplied EPUB.</small>}</p>{v.notes.length>0&&<details className="lxx-publisher-notes"><summary>Publisher {v.notes.length===1?'note':'notes'} · {chapter}:{v.label}</summary>{v.notes.map(n=><p key={n.id}>{n.text}</p>)}</details>}</div>)}
 </div>
 <button onClick={async()=>{try{await writeClipboard(`${englishLxxBookName(book)} ${chapter} (LXX2012)\n${data.verses.map(v=>`${v.label} ${v.text}`).join('\n')}`);setCopyStatus('Chapter copied with reference.');}catch{setCopyStatus('Could not copy. Select the text to copy it manually.');}}}>Copy chapter</button><p role="status">{copyStatus}</p>
 </section></div>
 </>}
 <nav className="chapter-nav" aria-label="English Septuagint chapters"><button disabled={index<=0} onClick={()=>go(order[index-1].code,order[index-1].chapter)}>← Previous chapter</button><button disabled={index<0||index===order.length-1} onClick={()=>go(order[index+1].code,order[index+1].chapter)}>Next chapter →</button></nav>
 <details id="lxx-source"><summary>About LXX2012 · sources and numbering</summary><p>Full English edition from the supplied EPUB: 54 books, including 15 standalone Apocryphal books and Psalm 151. Brenton’s translation, updated to American English by Michael Paul Johnson. Italics retain the source’s supplied-word and italic formatting. Publisher notes remain separate from the translation.</p><p>Esther already includes its Greek additions. The Prayer of Azariah and Song of the Three, Susanna, and Bel and the Dragon retain their standalone source placement. This edition does not include Psalms of Solomon or a complete Odes collection.</p><p>Changing editions opens the beginning of the current book when available, or Genesis otherwise. Source chapter and verse numbers are not automatically carried across different numbering systems.</p><p>{notice}</p></details>
 </main></>;
}
