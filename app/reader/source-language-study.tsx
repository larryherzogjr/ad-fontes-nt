'use client';
import {createPortal} from 'react-dom';
import {useEffect,useRef,useState} from 'react';
import {books,type PassageRange} from '@/lib/domain/references';
import StudyPanel from './study-panel';

const noRanges:PassageRange[]=[];
/** Reuse the reader's study panel without assigning canonical identities to source addresses. */
export default function SourceLanguageStudy({code,chapter=1,label,greek=false,onOpen}:{code:string;chapter?:number;label?:string;greek?:boolean;onOpen?:()=>void}){
 const params=new URLSearchParams(typeof location==='undefined'?'':location.search);
 const hebrew=books.slice(0,39).some(b=>b.code===code);
 const [mode,setMode]=useState<'greek'|'hebrew'|null>(()=>params.get('panel')==='hebrew'&&hebrew?'hebrew':greek&&(params.get('panel')==='greek'||params.get('parallel')==='1')?'greek':null);
 const [host,setHost]=useState<HTMLElement|null>(null);
 const greekTrigger=useRef<HTMLButtonElement>(null),hebrewTrigger=useRef<HTMLButtonElement>(null);
 useEffect(()=>{setHost((greekTrigger.current||hebrewTrigger.current)?.closest('main')||null)},[]);
 useEffect(()=>{if(!host||!mode)return;host.classList.add('has-study');return()=>host.classList.remove('has-study')},[host,mode]);
 function open(next:'greek'|'hebrew'){
  onOpen?.();setMode(next);
  const url=new URL(location.href);url.searchParams.set('panel',next);url.searchParams.delete('parallel');
  history.replaceState({},'',url.pathname+url.search);
 }
 function close(){
  const previous=mode;setMode(null);
  const url=new URL(location.href);
  for(const key of ['panel','parallel','token','hebrewToken'])url.searchParams.delete(key);
  history.replaceState({},'',url.pathname+url.search);
  requestAnimationFrame(()=>(previous==='greek'?greekTrigger:hebrewTrigger).current?.focus({preventScroll:true}));
 }
 return <>
  {greek&&<button ref={greekTrigger} className="study-tool greek-tool" aria-pressed={mode==='greek'} onClick={()=>open('greek')}><span className="tool-symbol" aria-hidden="true">α</span>Greek</button>}
  {hebrew&&<button ref={hebrewTrigger} className="study-tool hebrew-tool" aria-pressed={mode==='hebrew'} onClick={()=>open('hebrew')}><span className="tool-symbol" aria-hidden="true">א</span>Hebrew</button>}
  {mode&&host&&createPortal(<StudyPanel key={mode} ranges={noRanges} mode={mode} edition={greek?'LXX2012':'CVUL'} source={{code,chapter,label:label||`${books.find(b=>b.code===code)?.name||code} ${chapter}`,greek}} onClose={close}/>,host)}
 </>;
}
