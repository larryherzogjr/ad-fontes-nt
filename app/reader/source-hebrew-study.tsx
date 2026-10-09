'use client';
import {createPortal} from 'react-dom';
import {useEffect,useRef,useState} from 'react';
import {books,type PassageRange} from '@/lib/domain/references';
import {sourceManifest} from '@/lib/domain/original-languages';
import HebrewPassage from './hebrew-passage';
const noRanges:PassageRange[]=[];
/** Source editions without a verified crosswalk offer an explicit independent selection. */
export default function SourceHebrewStudy({code}:{code:string}){
 const params=new URLSearchParams(typeof location==='undefined'?'':location.search);
 const [open,setOpen]=useState(params.get('panel')==='hebrew'),[chapter,setChapter]=useState(Number(params.get('hebrewChapter'))||0),[chapters,setChapters]=useState<number[]>([]),[error,setError]=useState('');
 const dialog=useRef<HTMLDialogElement>(null),trigger=useRef<HTMLButtonElement>(null);
 const available=books.slice(0,39).some(b=>b.code===code);
 useEffect(()=>{if(!available||!open)return;let active=true;sourceManifest('WLC').then(m=>{if(active)setChapters(m.books.find(b=>b.code===code)?.chapters||[])}).catch(e=>{if(active)setError(e.message)});return()=>{active=false}},[code,open,available]);
 useEffect(()=>{if(!open)return;const el=dialog.current;if(!el)return;const media=matchMedia('(min-width:1100px)');function adapt(){el!.close();if(media.matches)el!.show();else el!.showModal()}adapt();media.addEventListener('change',adapt);document.body.classList.add('source-hebrew-open');return()=>{media.removeEventListener('change',adapt);el.close();document.body.classList.remove('source-hebrew-open')}},[open]);
 function openStudy(){setOpen(true);const u=new URL(location.href);u.searchParams.set('panel','hebrew');history.replaceState({},'',u.pathname+u.search)}
 function changeChapter(n:number){setChapter(n);const u=new URL(location.href);u.searchParams.set('hebrewChapter',String(n));u.searchParams.delete('hebrewToken');history.replaceState({},'',u.pathname+u.search)}
 function close(){setOpen(false);const u=new URL(location.href);for(const key of ['panel','hebrewToken','hebrewChapter'])u.searchParams.delete(key);history.replaceState({},'',u.pathname+u.search);requestAnimationFrame(()=>trigger.current?.focus())}
 if(!available)return null;
 return <><button ref={trigger} className="study-tool hebrew-tool" aria-pressed={open} onClick={openStudy}><span className="tool-symbol" aria-hidden="true">א</span>Hebrew</button>{open&&createPortal(<dialog ref={dialog} className="study-dialog source-hebrew-dialog" aria-labelledby="source-hebrew-title" onCancel={e=>{e.preventDefault();close()}} onKeyDown={e=>{if(e.key==='Escape'&&!e.defaultPrevented){e.preventDefault();close()}}}><div className="study-chrome"><header className="study-header"><h2 id="source-hebrew-title">Explore Hebrew</h2><button autoFocus onClick={close} aria-label="Close Hebrew study">Close ×</button></header><label>Hebrew chapter · {books.find(b=>b.code===code)?.name}<select aria-label="Hebrew chapter" value={chapter} onChange={e=>changeChapter(Number(e.target.value))}><option value={0}>Choose a chapter</option>{chapters.map(c=><option key={c} value={c}>{c}</option>)}</select></label><p className="study-help">Select independently. This edition and Hebrew have different numbering; automatic verse correspondence is not enabled.</p></div><div className="study-content">{error&&<p role="alert">{error}</p>}{chapter>0?<HebrewPassage ranges={noRanges} source={{code,chapter}}/>:<p>Choose the Hebrew chapter to read beside your current edition.</p>}</div></dialog>,document.body)}</>;
}
