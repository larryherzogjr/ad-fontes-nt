import {loadLxx,lxxRelease} from './lxx.ts';
import {getOccurrences,highlightOccurrences,type AnalysisSegment,type Occurrences} from './greek.ts';
export const researchRelease='lxx-research-2026-10-07-v1';
export type ResearchToken=[surface:string,lemma:string,pos:string,form:string,start:number,end:number,id:string];
export type ResearchVerse={sourceRef:string;sourceLabel:string;sourceBook:string;anchors:string[];text:string;chapterPath:string|null;tokens:ResearchToken[];ordinal:number};
export type ResearchBook={id:string;name:string;sourceLabel:string;verses:number;tokens:number;chapters:string[];positions:string[];partial:boolean};
export type ResearchManifest={releaseId:string;parentRelease:string;books:ResearchBook[];counts:{verses:number;tokens:number;mappedVerses:number;sourceOnlyVerses:number};mismatchedGlossVerses:{sourceRef:string;reason:string}[]};
export type ResearchLemma={lemma:string;nt:{id:string;count:number}[];lxx:{lemma:string;id:string;count:number;mapped:number;sourceOnly:number;books:Record<string,number>}|null};
export type ResearchHit=Omit<Occurrences['hits'][number],'anchor'> & {anchor?:string;sourceBook:string;start:number;end:number};
const cache=new Map<string,Promise<any>>();
async function load<T>(path:string):Promise<T>{
 if(!cache.has(path))cache.set(path,(async()=>{const r=await fetch(`/analysis/${researchRelease}/${path}`);if(!r.ok)throw Error('Septuagint research data unavailable');const d=await r.json();if(d.releaseId!==researchRelease)throw Error('Septuagint research release mismatch');return d;})().catch(e=>{cache.delete(path);throw e;}));return cache.get(path)!;
}
export async function researchManifest(){const m=await load<ResearchManifest>('manifest.json');if(m.parentRelease!==lxxRelease||m.books.length!==59||m.counts.verses!==30603||m.counts.tokens!==623440)throw Error('Incomplete research inventory');return m;}
export async function researchBook(book:string):Promise<ResearchVerse[]>{
 const meta=(await researchManifest()).books.find(b=>b.id===book);if(!meta)throw Error('Unknown Septuagint source book');
 const data=await load<{book:string;verses:ResearchVerse[]}>(`books/${book}.json`);
 if(data.book!==book||data.verses.length!==meta.verses||data.verses.some(s=>s.sourceBook!==book||typeof s.text!=='string'||!Array.isArray(s.anchors)||!Array.isArray(s.tokens)||s.tokens.some(t=>t.length!==7||s.text.slice(t[4],t[5])!==t[0])))throw Error('Incomplete Septuagint source book');return data.verses;
}
export async function researchLemmas(){const d=await load<{entries:ResearchLemma[]}>('lemmas.json');if(!Array.isArray(d.entries)||d.entries.length!==16007||d.entries.some(e=>typeof e.lemma!=='string'||!Array.isArray(e.nt)||(e.lxx&&e.lxx.count!==e.lxx.mapped+e.lxx.sourceOnly)))throw Error('Incomplete full-source lemma index');return d.entries;}
export async function researchVerse(ref:string):Promise<AnalysisSegment>{
 const book=ref.split('/')[0];const index=(await researchBook(book)).find(v=>v.sourceRef===ref);if(!index)throw Error('Unknown source verse');
 const data=index.chapterPath ? await loadLxx<{segments:AnalysisSegment[]}>(index.chapterPath):await load<{segments:AnalysisSegment[]}>(`extra/${book}.json`);
 const segment=data.segments.find(s=>s.sourceRef===ref);if(!segment||segment.text!==index.text||segment.tokens.length!==index.tokens.length||segment.tokens.some(t=>segment.text.slice(t.start,t.end)!==t.surface))throw Error('Source verse data mismatch');return {...segment,sourceBook:book};
}
export async function researchOccurrences(entry:ResearchLemma,side:'nt'|'lxx'):Promise<ResearchHit[]>{
 if(side==='nt')return (await Promise.all(entry.nt.map(async item=>{const d=await getOccurrences(item.id);if(d.hits.length!==item.count||d.lemma.normalize('NFC')!==entry.lemma)throw Error('NT lemma inventory mismatch');return d.hits.map(h=>({...h,sourceBook:h.anchor.split('.')[0],start:0,end:0}));}))).flat();
 if(!entry.lxx)return [];const books=Object.keys(entry.lxx.books);
 const parts=await Promise.all(books.map(async book=>{const records=await researchBook(book);const hits=records.flatMap(s=>s.tokens.filter(t=>t[1].normalize('NFC')===entry.lemma).map(t=>({tokenId:t[6],sourceRef:s.sourceRef,sourceLabel:s.sourceLabel,anchor:s.anchors[0],sourceBook:book,chapterPath:s.chapterPath||undefined,surface:t[0],text:s.text,start:t[4],end:t[5]})));if(hits.length!==entry.lxx!.books[book])throw Error('LXX lemma inventory mismatch');return hits;}));const hits=parts.flat();if(hits.length!==entry.lxx.count)throw Error('Incomplete LXX occurrence inventory');return hits;
}
export async function researchHighlights(hits:ResearchHit[],side:'nt'|'lxx'){
 if(side==='nt')return highlightOccurrences(hits.filter((h):h is ResearchHit & {anchor:string}=>!!h.anchor));
 // Verify the exact stored token, including unpaired and alternative source verses.
 return Promise.all(hits.map(async h=>{const s=await researchVerse(h.sourceRef),t=s.tokens.find(t=>t.id===h.tokenId);if(!t||s.text!==h.text||t.surface!==h.surface||t.start!==h.start||t.end!==h.end)throw Error('Greek token highlight mismatch');return {tokenId:h.tokenId,start:t.start,end:t.end};}));
}
export function sourceVerseUrl(ref:string,token?:string){return `/greek?verse=${encodeURIComponent(ref)}${token?`&token=${encodeURIComponent(token)}`:''}`;}
export type ResearchQuery={query:string;mode:'text'|'lemma'|'morphology';book?:string;pos?:string;form?:string;sourceOnly?:boolean;accentFold?:boolean;page?:number};
export function searchResearch(verses:ResearchVerse[],q:ResearchQuery){
 const normalize=(s:string)=>{const lower=s.normalize('NFC').toLocaleLowerCase('el').replaceAll('ς','σ');return q.accentFold?lower.normalize('NFD').replace(/\p{M}/gu,''):lower;};
 const literal=q.query.startsWith('"')&&q.query.endsWith('"');const terms=q.mode==='text'?q.query.replace(/^"|"$/g,'').trim().split(/\s+/).filter(Boolean).map(normalize):[];
 const wantedForms=(q.form||'').trim().toLowerCase().split(/\s+/).filter(Boolean);
 const eligible=(t:ResearchToken)=>(!q.pos||t[2]===q.pos)&&wantedForms.every(f=>t[3].toLowerCase().split(/[\s/]+/).includes(f));
 const hits=verses.flatMap(s=>{
  if(q.sourceOnly&&s.anchors.length)return [];
  let indices:number[]=[];
  if(q.mode==='lemma')indices=s.tokens.flatMap((t,i)=>t[1].normalize('NFC')===q.query.normalize('NFC')&&eligible(t)?[i]:[]);
  else if(q.mode==='morphology'||!terms.length)indices=s.tokens.flatMap((t,i)=>eligible(t)?[i]:[]);
  else if(literal){for(let i=0;i<=s.tokens.length-terms.length;i++)if(terms.every((term,j)=>normalize(s.tokens[i+j][0])===term)&&s.tokens.slice(i,i+terms.length).some(eligible))indices.push(...Array.from({length:terms.length},(_,j)=>i+j));}
  else{const found=terms.map(term=>s.tokens.flatMap((t,i)=>normalize(t[0])===term&&eligible(t)?[i]:[]));if(found.every(part=>part.length))indices=found.flat();}
  return indices.length?[{...s,matches:q.query.trim()||q.pos||q.form?[...new Set(indices)]:[]}]:[];
 });
 const page=Math.max(1,Math.min(Math.floor(q.page||1),Math.max(1,Math.ceil(hits.length/20))));return {hits:hits.slice((page-1)*20,page*20),total:hits.length,page};
}
export async function searchLxx(q:ResearchQuery){const meta=await researchManifest();const selection=q.book?[q.book]:meta.books.map(b=>b.id);const books=await Promise.all(selection.map(researchBook));return searchResearch(books.flat(),q);}

const sourceDisplayNames:Record<string,string>={
 'jeremiah-lxx':'Jeremiah','job-lxx':'Job','psalms-lxx':'Psalms','psalms-of-solomon':'Psalms of Solomon','letter-of-jeremiah':'Letter of Jeremiah','song-of-solomon':'Song of Solomon','esther-greek':'Esther · Greek',
 daniel:'Daniel · Old Greek','daniel-theodotion':'Daniel · Theodotion',judges:'Judges · Alexandrinus (A)','judges-vaticanus-b':'Judges · Vaticanus (B)',joshua:'Joshua · partial source','joshua-vaticanus-b':'Joshua · Vaticanus (B)',tobit:'Tobit · B/A transcription','tobit-sinaiticus':'Tobit · Sinaiticus',susanna:'Susanna · Old Greek','susanna-theodotion':'Susanna · Theodotion','bel-and-the-dragon':'Bel and the Dragon · Old Greek','bel-and-the-dragon-theodotion':'Bel and the Dragon · Theodotion'};
export function researchBookName(book:ResearchBook){return sourceDisplayNames[book.id]||book.name;}
/** Presentation order only; alternatives remain distinct immutable source identities. */
const sourceOrder=['genesis','exodus','leviticus','numbers','deuteronomy','joshua-vaticanus-b','joshua','judges','judges-vaticanus-b','ruth','1-samuel','2-samuel','1-kings','2-kings','1-chronicles','2-chronicles','1-esdras','2-esdras','esther-greek','judith','tobit','tobit-sinaiticus','1-maccabees','2-maccabees','3-maccabees','4-maccabees','psalms-lxx','odes','proverbs','ecclesiastes','song-of-solomon','job-lxx','wisdom','sirach','psalms-of-solomon','hosea','amos','micah','joel','obadiah','jonah','nahum','habakkuk','zephaniah','haggai','zechariah','malachi','isaiah','jeremiah-lxx','baruch','lamentations','letter-of-jeremiah','ezekiel','daniel','daniel-theodotion','susanna','susanna-theodotion','bel-and-the-dragon','bel-and-the-dragon-theodotion'];
export function researchBookOrder(a:string,b:string){const ai=sourceOrder.indexOf(a),bi=sourceOrder.indexOf(b);return (ai<0?999:ai)-(bi<0?999:bi)||a.localeCompare(b);}
