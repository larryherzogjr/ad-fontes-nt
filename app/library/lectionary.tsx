'use client';
import {useEffect,useState} from 'react';
import {editions} from '../lib/domain/corpus';
import {passageUrl} from '../lib/domain/references';
import {formatPassage} from '../lib/reading-display';
import {lectionary,localDate,nextSunday,observanceFor,sundayNeighbor,seriesLabel,lectionaryPacketUrl,lectionaryPreferenceKey,type LectionarySeries} from '../lib/domain/lectionary';
import './lectionary.css';
export default function Lectionary({locationKey,onNavigate}:{locationKey:string;onNavigate:(url:string)=>void}){
 const [series,setSeries]=useState<LectionarySeries>('three-year'),[date,setDate]=useState(''),[id,setId]=useState(''),[choices,setChoices]=useState([0,0,0,0]),[extended,setExtended]=useState(false),[edition,setEdition]=useState('BSB'),[ready,setReady]=useState(false),[storageMessage,setStorageMessage]=useState('');
 useEffect(()=>{const p=new URLSearchParams(locationKey);let saved='';try{saved=localStorage.getItem(lectionaryPreferenceKey)||'';}catch{setStorageMessage('Your series choice cannot be saved on this device. Browsing still works.');}
  setSeries(p.get('series')==='one-year'||(!p.has('series')&&saved==='one-year')?'one-year':'three-year');setDate(p.get('date')||nextSunday(localDate()));setId(p.get('observance')||'');
  setChoices((p.get('readingChoices')||'0,0,0,0').split(',').map(v=>/^\d+$/.test(v)?Number(v):0));setExtended(p.get('extended')==='1');const ed=p.get('lectionaryEdition');setEdition(editions.some(e=>e.editionId===ed&&e.language==='en')?ed!:'BSB');setReady(true);
 },[locationKey]);
 const o=observanceFor(series,date,id),selection=o?{id:o.id,choices,extended}:null;
 let packetLink='',packetError='';try{if(selection)packetLink=lectionaryPacketUrl(selection,edition);}catch(e){packetError=(e as Error).message;}
 function navigate(next:{series?:LectionarySeries;date?:string;id?:string;choices?:number[];extended?:boolean;edition?:string}){
  const s=next.series||series,d=next.date||date,p=new URLSearchParams({view:'lectionary',series:s,date:d,lectionaryEdition:next.edition||edition});
  if(next.id)p.set('observance',next.id);else if(!next.date&&!next.series&&o)p.set('observance',o.id);
  p.set('readingChoices',(next.choices||((next.date||next.id||next.series)?[0,0,0,0]:choices)).join(','));p.set('extended',(next.extended??extended)?'1':'0');
  setSeries(s);setDate(d);setId(p.get('observance')||'');setChoices((p.get('readingChoices')||'0,0,0,0').split(',').map(Number));setExtended(p.get('extended')==='1');setEdition(p.get('lectionaryEdition')||'BSB');
  try{localStorage.setItem(lectionaryPreferenceKey,s);}catch{setStorageMessage('Your series choice cannot be saved on this device. Browsing still works.');}onNavigate(`/library?${p}`);
 }
 const before=sundayNeighbor(series,date,-1),after=sundayNeighbor(series,date,1),calendarEntries=lectionary.observances.filter(item=>item.series===series&&item.churchYear===(o?.churchYear||'2025-26'));
 return <div className="lectionary-browser"><h2>Lectionary</h2><p>Read the appointed Scripture and prepare a study packet for a Sunday or festival.</p>
  <div className="lectionary-controls"><label>Lectionary series<select value={series} onChange={e=>navigate({series:e.target.value as LectionarySeries})}><option value="three-year">Three-Year</option><option value="one-year">One-Year</option></select></label>
  <label>Calendar date<input type="date" value={date} min={lectionary.coverage.start} max={lectionary.coverage.end} onChange={e=>{if(e.target.value)navigate({date:e.target.value});}}/></label>
  <label>Church year<select value={o?.churchYear||''} onChange={e=>{const first=lectionary.observances.find(item=>item.series===series&&item.churchYear===e.target.value);if(first)navigate({date:first.date});}}><option value="" disabled>Choose a year</option>{['2024-25','2025-26','2026-27'].map(year=><option key={year} value={year}>{year}{series==='three-year'?` · Series ${{'2024-25':'C','2025-26':'A','2026-27':'B'}[year]}`:''}</option>)}</select></label>
  <label>Bible edition<select value={edition} onChange={e=>navigate({edition:e.target.value})}>{editions.filter(e=>e.language==='en').map(e=><option key={e.editionId} value={e.editionId}>{e.name}</option>)}</select></label></div>
  <div className="lectionary-navigation"><button disabled={!ready||!before} onClick={()=>before&&navigate({date:before})}>← Previous Sunday</button><button disabled={!ready} onClick={()=>navigate({date:nextSunday(localDate())})}>Upcoming Sunday</button><button disabled={!ready||!after} onClick={()=>after&&navigate({date:after})}>Next Sunday →</button></div>
  {storageMessage&&<p role="status">{storageMessage}</p>}
  {!ready?<p role="status">Preparing the lectionary…</p>:!o?<p role="status">No appointed readings are bundled for this date. Choose a listed Sunday or festival. These calendars cover December 1, 2024 through November 25, 2027.</p>:<>
   <label>Sunday or festival<select value={o.id} onChange={e=>{const item=calendarEntries.find(item=>item.id===e.target.value);if(item)navigate({id:item.id,date:item.date});}}>{calendarEntries.map(item=><option key={item.id} value={item.id}>{item.date} · {item.title}{item.alternative?' · alternative observance':''}</option>)}</select></label>
   <article className="lectionary-observance"><p className="eyebrow">{seriesLabel(o)} · {o.season}</p><h3>{o.title}</h3><p>{new Date(`${o.date}T12:00:00`).toLocaleDateString(undefined,{weekday:'long',year:'numeric',month:'long',day:'numeric'})}{/observed/i.test(o.dateLabel)&&' · observed date'}</p>
   <label className="lectionary-optional"><input type="checkbox" checked={extended} onChange={e=>navigate({extended:e.target.checked})}/>Include parenthesized optional verses</label>
   <div className="lectionary-readings">{o.readings.map((r,i)=>{const choice=r.choices[choices[i]||0],ranges=choice&&(extended?choice.extendedRanges:choice.ranges);return <section key={r.role}><h4>{r.role}</h4><p>{r.text}</p>{r.choices.length>1&&<label>Choose {r.role.toLowerCase()}<select value={choices[i]||0} onChange={e=>navigate({choices:o.readings.map((_,j)=>j===i?+e.target.value:(choices[j]||0))})}>{r.choices.map((c,j)=><option value={j} key={j}>{c.label}</option>)}</select></label>}
    {choice?.unresolved?<p className="study-help">This title has no resolved numeric Scripture reference. Choose a linked alternative to include this reading in a packet.</p>:ranges?.length?<><p className="study-help">{extended?'Reading with optional verses':'Selected reading'}: {formatPassage(ranges)}</p>{choice.partialVerses&&<p className="study-help">The appointment names part of a verse. Reading and packets retain the complete verse.</p>}<a href={passageUrl(ranges,edition)}>Read {r.role.toLowerCase()} →</a></>:<p role="alert">Choose an available reading.</p>}</section>;})}</div>
   {packetLink?<a className="lectionary-packet" href={packetLink} onClick={e=>{if(!e.metaKey&&!e.ctrlKey&&!e.shiftKey&&!e.altKey){e.preventDefault();onNavigate(packetLink);}}}>Create this Sunday’s study packet →</a>:<p role="alert">{packetError}</p>}
   <p className="study-help">The packet starts with these readings and your saved related-material choices. You can preview, print, or save it in Study Packets.</p>
   <p className="lectionary-source">Calendar references: LCMS Commission on Worship · {o.churchYear} · <a href={o.sourceUrl} target="_blank" rel="noreferrer">Official calendar</a>. Scripture is read from your chosen Ad Fontes edition.</p></article>
  </>}
  <p className="study-help">Bundled One-Year and Three-Year calendars: 2024–25 (C), 2025–26 (A), and 2026–27 (B). Alternative observances follow the published calendar. Congregational transfers are not calculated.</p>
 </div>;
}
