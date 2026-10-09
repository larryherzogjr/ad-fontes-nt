import {books,expand,type PassageRange} from './references.ts';
export const originalRelease='original-languages-2026-10-09-v1';
export const sourceEditions=[{id:'WLC',name:'Westminster Leningrad Codex · Hebrew / Aramaic'},{id:'CVUL',name:'Clementine Vulgate · Latin'}] as const;
export type SourceEdition='WLC'|'CVUL';
export type SourcePart={kind:string;text:string;prefix:string;token?:string};
export type SourceVerse={verse:number;text:string;parts:SourcePart[];notes:{kind:string;text:string;readings:{type:string;text:string}[]}[];englishReferences:{reference:string;type:string}[]};
export type SourceBook={code:string;name:string;chapters:{chapter:number;verses:SourceVerse[]}[]};
export type SourceManifest={editionId:SourceEdition;name:string;language:string;direction:'rtl'|'ltr';books:{code:string;name:string;chapters:number[];verses:number}[];verseCount:number};
export type HebrewToken={id:string;surface:string;sourceSurface:string;lemma:string;morph:string;language:string;keys:string[];type:string};
export type HebrewAnalysis={code:string;chapter:number;verses:{verse:number;tokens:HebrewToken[]}[]};
export type HebrewArticle={slug:string;headword:string;transliteration:string;description:string;url:string;author:string;keys:string[]};
export type HebrewIndex={lemmas:{key:string;form:string;count:number;articles:string[]}[];articles:HebrewArticle[];tokenCount:number};
export type HebrewOccurrence={reference:string;token:string;surface:string;morph:string};
const cache=new Map<string,Promise<unknown>>();
export async function originalData<T>(path:string):Promise<T>{
 if(!cache.has(path))cache.set(path,fetch(`/corpus/${originalRelease}/${path}`).then(async r=>{if(!r.ok)throw Error('This edition’s local data could not be loaded.');const d=await r.json();if(d.releaseId!==originalRelease)throw Error('Original-language release mismatch.');return d;}).catch(e=>{cache.delete(path);throw e;}));return cache.get(path) as Promise<T>;
}
export async function sourceManifest(edition:SourceEdition){const m=await originalData<SourceManifest>(`${edition}/manifest.json`);if(m.editionId!==edition||m.books.length!==(edition==='WLC'?39:73)||m.verseCount!==(edition==='WLC'?23213:35810))throw Error('Incomplete source edition inventory.');return m;}
export async function sourceBook(edition:SourceEdition,code:string){const m=await sourceManifest(edition);const meta=m.books.find(b=>b.code===code);if(!meta)throw Error('This book is not included in the selected edition.');const b=await originalData<SourceBook>(`${edition}/books/${code}.json`);if(b.code!==code||b.chapters.flatMap(c=>c.verses).length!==meta.verses||b.chapters.map(c=>c.chapter).join()!==meta.chapters.join())throw Error('Incomplete source book.');return b;}
export function sourceUrl(edition:SourceEdition,code:string,chapter=1,verse?:number,token?:string){const p=new URLSearchParams({translation:edition});if(verse)p.set('verses',String(verse));if(token)p.set('word',token);return `/read/${code}/${chapter}?${p}`;}
export function hebrewReturn(value:string|null){
 if(!value||!/^\/read\/[A-Z0-9]+\/\d+\?/.test(value))return '';
 const u=new URL(value,'https://local');
 u.searchParams.delete('explorer');
 return u.origin==='https://local'&&(u.searchParams.get('translation')==='WLC'||(['BSB','BLB','MSB','YLT','LXX2012','CVUL'].includes(u.searchParams.get('translation')||'')&&u.searchParams.get('panel')==='hebrew'))?u.pathname+u.search:'';
}
export function hebrewUrl(key='',returnTo=''){const p=new URLSearchParams({view:'hebrew'});if(key)p.set('hebrew',key);const safe=hebrewReturn(returnTo);if(safe)p.set('returnTo',safe);return `/library?${p}`;}
export function hebrewExplorerReturn(value:string|null){
 if(!value||!value.startsWith('/library?'))return '';
 const u=new URL(value,'https://local');return u.searchParams.get('view')==='hebrew'?u.pathname+u.search:'';
}
export const foldHebrew=(s:string)=>s.replace(/[\u0591-\u05BD\u05BF-\u05C7]/g,'').replaceAll('/','').toLowerCase();
export async function searchSource(edition:SourceEdition,query:string){const q=foldHebrew(query.trim());if(!q)return [];const data=await originalData<{verses:{book:string;chapter:number;verse:number;text:string}[]}>(`${edition}/search.json`);return data.verses.filter(v=>foldHebrew(v.text).includes(q));}
export async function hebrewOccurrences(key:string){if(!/^[HA]\d+[a-z]?$/.test(key))throw Error('Unknown Hebrew lemma key.');return originalData<{key:string;occurrences:HebrewOccurrence[]}>(`lemmas/${key}.json`);}
/** The OSHB catalogue is a numbering aid. Partial mappings and headings are retained, not promoted to exact alignment. */
export function englishContext(verse:SourceVerse){return verse.englishReferences.filter(r=>{const [b,c,v]=r.reference.split('.');const book=books.find(x=>x.code===b);return book&&Number(v)>0&&Number(v)<=Number(book.verses[Number(c)-1]);});}
export function readableRef(ref:string){const [b,c,v]=ref.split('.');return `${books.find(x=>x.code===b)?.name||b} ${c}:${v}`;}

/** Reverse the preserved source numbering catalogue; never assume matching verse numbers. */
export async function hebrewPassage(ranges:PassageRange[]){
 const anchors=ranges.flatMap(expand);if(anchors.length>180)throw Error('Choose up to 180 verses for Hebrew study.');
 const requested=new Set(anchors),codes=[...new Set(anchors.map(a=>a.split('.')[0]))];
 const verses: (SourceVerse&{reference:string;anchors:string[];partial:boolean;tokens:HebrewToken[]})[]=[];
 for(const code of codes){
  if(!books.slice(0,39).some(b=>b.code===code))continue;
  const book=await sourceBook('WLC',code);
  for(const chapter of book.chapters){
   const matched=chapter.verses.filter(v=>englishContext(v).some(r=>requested.has(r.reference)));
   if(!matched.length)continue;
   const analysis=await originalData<HebrewAnalysis>(`analysis/${code}/${chapter.chapter}.json`);
   for(const verse of matched){const mapped=englishContext(verse).filter(r=>requested.has(r.reference));verses.push({...verse,reference:`${code}.${chapter.chapter}.${verse.verse}`,anchors:mapped.map(r=>r.reference),partial:mapped.some(r=>r.type==='partial'),tokens:analysis.verses.find(v=>v.verse===verse.verse)?.tokens||[]})}
  }
 }
 const found=new Set(verses.flatMap(v=>v.anchors));return {verses,missing:anchors.filter(a=>!found.has(a))};
}

/** Independently selected source chapter; no correspondence to another edition is inferred. */
export async function hebrewSourceChapter(code:string,chapter:number){
 const [book,analysis]=await Promise.all([sourceBook('WLC',code),originalData<HebrewAnalysis>(`analysis/${code}/${chapter}.json`)]);
 const source=book.chapters.find(c=>c.chapter===chapter);if(!source)throw Error('This Hebrew source chapter is unavailable.');
 return {verses:source.verses.map(v=>({...v,reference:`${code}.${chapter}.${v.verse}`,anchors:[] as string[],partial:false,tokens:analysis.verses.find(a=>a.verse===v.verse)?.tokens||[]})),missing:[] as string[]};
}
