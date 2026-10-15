'use client';
import {useEffect,useState} from 'react';
import {loadHistoricalScan,historicalUrl,type HistoricalSection} from '@/lib/domain/historical-library';

export default function HistoricalScan({data,scan,onNavigate}:{data:HistoricalSection;scan:string;onNavigate:(url:string)=>void}) {
 const pages=data.pages||[],position=scan?pages.findIndex(p=>p.id===scan):0,page=pages[position];
 const [image,setImage]=useState(''),[error,setError]=useState(''),[zoom,setZoom]=useState('100');
 useEffect(()=>{
  setImage('');setError('');if(!page)return;
  const abort=new AbortController();(async()=>{
   const blob=await loadHistoricalScan(page,abort.signal);
   const reader=new FileReader();reader.onload=()=>{if(!abort.signal.aborted)setImage(String(reader.result));};reader.onerror=()=>{if(!abort.signal.aborted)setError('This printed page could not be displayed.');};reader.readAsDataURL(blob);
  })().catch(e=>{if(!abort.signal.aborted)setError(e.message);});return()=>abort.abort();
 },[page]);
 function move(id:string){onNavigate(`${historicalUrl(data.work,data.id)}&scan=${encodeURIComponent(id)}`);}
 if(!page)return <p role="alert">This printed page is unavailable in this reading. <button onClick={()=>move(pages[0].id)}>Open the first page</button></p>;
 return <section className="historical-scans" aria-label="Printed edition">
  <div className="historical-scan-controls"><button disabled={position===0} onClick={()=>move(pages[position-1].id)}>← Previous page</button><label>Printed scan<select value={page.id} onChange={e=>move(e.target.value)}>{pages.map(p=><option key={p.id} value={p.id}>Volume {p.volume} · scan {p.page}</option>)}</select></label><button disabled={position===pages.length-1} onClick={()=>move(pages[position+1].id)}>Next page →</button><label>Page size<select value={zoom} onChange={e=>setZoom(e.target.value)}><option value="100">Fit width</option><option value="150">150%</option><option value="220">220%</option><option value="original">Full resolution</option></select></label></div>
  <p className="study-help">Page {position+1} of {pages.length} in this reading. Scan numbers identify PDF pages, not printed folios. At larger sizes, scroll within the page to read details.</p>
  {error?<p role="alert">{error}</p>:!image?<p role="status">Loading printed page…</p>:<div className="historical-scan-frame" tabIndex={0} aria-label="Printed page; use arrow keys to scroll when enlarged"><img src={image} width={page.width} height={page.height} style={{width:zoom==='original'?`${page.width}px`:`${zoom}%`}} alt={`Edersheim, 1899 edition, volume ${page.volume}, PDF scan ${page.page}. Unproofread OCR is available below.`} onError={()=>setError('This printed page could not be displayed.')}/></div>}
  <details className="historical-ocr"><summary>Searchable OCR for this page · unproofread</summary><p className="notice">OCR may garble words, omit Greek and Hebrew, and interleave footnotes or marginal references. Consult the printed page before quoting. This text covers the current reading’s portion of the page.</p>{data.paragraphs.map((text,i)=>data.paragraphPageIds?.[i]===page.id?<p key={i} className="historical-ocr-text">{text}</p>:null)}</details>
 </section>;
}
