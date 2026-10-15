'use client';
import AppLink from '@/components/app-link';
import {useEffect,useState} from 'react';
import {dictionaryParagraphClass} from '@/lib/dictionary-presentation';
import {hebrewDictionary} from '@/lib/domain/hebrew-lexicon';

function Entry({sourceKey,showTransliteration}:{sourceKey:string;showTransliteration:boolean}){
 const [entry,setEntry]=useState<Awaited<ReturnType<typeof hebrewDictionary>>|null>(null);
 const [error,setError]=useState(''),[attempt,setAttempt]=useState(0);
 useEffect(()=>{let active=true;setEntry(null);setError('');hebrewDictionary(sourceKey).then(d=>{if(active)setEntry(d)}).catch(e=>{if(active)setError(e.message)});return()=>{active=false}},[sourceKey,attempt]);
 if(error)return <div role="alert"><p>{error}</p><button onClick={()=>setAttempt(attempt+1)}>Retry dictionary</button></div>;
 if(!entry)return <p role="status">Loading dictionary for {sourceKey}…</p>;
 const {row,strong,bdb}=entry;
 return <section className="hebrew-dictionary-entry" aria-label={`Dictionary for ${sourceKey}`}>
  <h4>Dictionary headword · {sourceKey}{row?.headword&&<> · <bdi className="hebrew-text" lang={row.language==='arc'?'arc':'he'}>{row.headword}</bdi></>}</h4>
  {showTransliteration&&row?.transliteration&&<p>{row.transliteration} · {row.language==='arc'?'Aramaic':'Hebrew'}</p>}
  {row?.gloss&&<p><strong>{row.lexical?'OSHB lexical gloss':'Strong’s definition'}:</strong> {row.gloss}</p>}
  {strong?<details><summary>Strong’s Hebrew Dictionary · {strong.id}</summary>
   <p><bdi className="hebrew-text" lang={strong.language==='arc'?'arc':'he'}>{strong.headword}</bdi> · {strong.transliteration}</p>
   {/[a-z]$/.test(sourceKey)&&<p className="study-help">This Strong’s entry covers the base number. It does not distinguish the OSHB homograph suffix in {sourceKey}.</p>}
   <dl>{strong.pronunciation&&<><dt>Historical pronunciation guide</dt><dd>{strong.pronunciation}</dd></>}{strong.derivation&&<><dt>Derivation</dt><dd>{strong.derivation}</dd></>}{strong.definition&&<><dt>Definition</dt><dd>{strong.definition}</dd></>}{strong.usage&&<><dt>Historical KJV renderings</dt><dd>{strong.usage}</dd></>}</dl>
   {strong.notes.map((n,i)=><p key={i}>{n}</p>)}
  </details>:<p className="study-help">No language-matched Strong’s entry is available for this source key.</p>}
  {bdb?<details><summary>Brown–Driver–Briggs · BDB</summary><p className="study-help">Abridged transcription · Still in progress. Exact OSHB mapping: {row?.lexical} → {bdb.id}.</p><div className="hebrew-dictionary-body">{bdb.paragraphs.map((p,i)=><p className={dictionaryParagraphClass(p)} dir="auto" key={i}>{p}</p>)}</div></details>:<p className="study-help">BDB is unavailable for this source key. {row?.mappingNote||'No exact mapping is supplied.'}</p>}
 </section>;
}
export default function HebrewDictionary({keys:sourceKeys,showTransliteration=true}:{keys:string[];showTransliteration?:boolean}){
 return <section className="hebrew-dictionary" aria-label="Hebrew dictionaries"><h3>Dictionary references</h3>
  {sourceKeys.length?[...new Set(sourceKeys)].map(k=><Entry key={k} sourceKey={k} showTransliteration={showTransliteration}/>):<p>No lexical number is assigned to this word’s prefix or suffix parts; no dictionary entry is inferred.</p>}
  <p className="study-help">Historical definitions describe possible meanings, not a translation of this word in context. Scripture, OSHB analysis and Ordinary Means commentary remain distinct.</p>
  <details className="hebrew-dictionary-source"><summary>Dictionary sources and coverage</summary><p>Strong’s Hebrew Dictionary (1890) and Brown–Driver–Briggs (1906). BDB is an abridged transcription with incomplete references and Hebrew text.</p><p>Electronic texts and lexical mappings: <AppLink href="https://github.com/openscriptures/HebrewLexicon" target="_blank" rel="noreferrer">Open Scriptures Hebrew Bible Project</AppLink>, <AppLink href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0</AppLink>. Historical dictionary text is public domain. Ad Fontes derives the lookup and display; no endorsement is implied. Dictionary citations retain their source notation and numbering.</p></details>
 </section>;
}
