'use client';
import {useEffect,useState} from 'react';
import {abbottEntries,type AbbottEntry} from '@/lib/domain/abbott-smith';

export default function AbbottSmith({lemma,strongs}:{lemma:string;strongs?:string}){
 const [open,setOpen]=useState(false),[entries,setEntries]=useState<AbbottEntry[]|null>(null),[error,setError]=useState(''),[attempt,setAttempt]=useState(0);
 useEffect(()=>{let active=true;setEntries(null);setError('');if(open)abbottEntries(lemma,strongs).then(value=>{if(active)setEntries(value)}).catch(e=>{if(active)setError(e.message)});return()=>{active=false}},[lemma,strongs,open,attempt]);
 return <details className="abbott-smith" onToggle={e=>setOpen(e.currentTarget.open)}>
  <summary>Abbott-Smith · Greek Lexicon (1922)</summary>
  {open&&<div className="abbott-smith-content">
   {error?<div role="alert"><p>{error}</p><button onClick={()=>setAttempt(attempt+1)}>Retry Abbott-Smith</button></div>:entries===null?<p role="status">Loading Abbott-Smith…</p>:entries.length?<>
    {entries.length>1&&<p className="study-help">{entries.length} source entries match this headword. Each is retained separately.</p>}
    {entries.map(entry=><section key={entry.id} aria-label={`Abbott-Smith entry ${entry.headwords[0]}`}>
     <h4 lang="grc">{entry.headwords[0]}</h4>
     <p className="study-help">{entry.strongs.length?`Source Strong’s identifiers: ${entry.strongs.join(', ')}.`:'No Strong’s identifier is supplied for this entry.'} {!strongs?.trim()?'Linked by exact headword.':''}</p>
     {entry.paragraphs.map((paragraph,i)=><p key={i} dir="ltr">{paragraph}</p>)}
     {entry.historicalNtCounts.length>0&&<p className="study-help">Abbott-Smith’s historical NT frequency note: {entry.historicalNtCounts.join(', ')}. This is separate from the app’s indexed occurrence counts.</p>}
    </section>)}
   </>:<p>No Abbott-Smith entry matches this exact headword{strongs?.trim()?' and source number':''}. Spelling and accent differences are not guessed.</p>}
   <p className="study-help">G. Abbott-Smith, <cite>A Manual Greek Lexicon of the New Testament</cite>, first edition (1922). Historical definitions describe a meaning range; they do not select the sense of a word in this passage. Source abbreviations, citations and numbering are retained.</p>
   <p className="study-help"><a href="https://github.com/translatable-exegetical-tools/Abbott-Smith" target="_blank" rel="noreferrer">Abbott-Smith transcription project</a> · Public-domain text and markup. <a href="/lexical/abbott-smith-1922-2026-10-14-v1/NOTICE.txt" target="_blank" rel="noreferrer">Source and coverage</a></p>
  </div>}
 </details>;
}
