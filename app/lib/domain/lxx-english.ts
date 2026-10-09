import {books as canonicalBooks} from './references.ts';
import {researchBook, type ResearchVerse} from './lxx-research.ts';
export const englishLxxRelease = 'lxx2012-2026-10-09-v2';
export const englishLxxName = 'LXX2012 · English Septuagint';
export type EnglishLxxVerse = {verse:number;endVerse:number;label:string;text:string;textState:'present'|'source-empty';parts:{kind:string;text:string}[];notes:{id:string;text:string}[]};
export type EnglishLxxChapter = {chapter:number;headings:string[];headingNotes:{id:string;text:string}[];verses:EnglishLxxVerse[]};
export type EnglishLxxBook = {releaseId:string;code:string;name:string;preface:string[];otherNotes:{id:string;text:string}[];chapters:EnglishLxxChapter[]};
export type EnglishLxxMeta = {code:string;name:string;apocrypha:boolean;greekBook:string;chapters:number[];verses:number};
export type EnglishLxxManifest = {releaseId:string;editionId:string;name:string;books:EnglishLxxMeta[];verseCount:number};
const cache = new Map<string,Promise<unknown>>();
async function load<T>(path:string):Promise<T>{
 if(!cache.has(path)) cache.set(path,fetch(`/corpus/${englishLxxRelease}/${path}`).then(async r=>{if(!r.ok)throw Error('English Septuagint data could not be loaded.');const d=await r.json();if(d.releaseId!==englishLxxRelease)throw Error('English Septuagint release mismatch.');return d;}).catch(e=>{cache.delete(path);throw e;}));
 return cache.get(path) as Promise<T>;
}
export async function englishLxxManifest(){const m=await load<EnglishLxxManifest>('manifest.json');if(m.books.length!==54||m.verseCount!==28326)throw Error('Incomplete English Septuagint inventory.');return m;}
export async function englishLxxBook(code:string){
 const meta=(await englishLxxManifest()).books.find(b=>b.code===code);if(!meta)throw Error('This book is not included in LXX2012.');
 const b=await load<EnglishLxxBook>(`books/${code}.json`);
 if(b.code!==code||b.chapters.flatMap(c=>c.verses).length!==meta.verses||b.chapters.map(c=>c.chapter).join()!==meta.chapters.join())throw Error('Incomplete English Septuagint book.');return b;
}
export function englishLxxUrl(code:string,chapter=1,verse?:number){return `/read/${code}/${chapter}?translation=LXX2012${verse?`&verses=${verse}`:''}`;}
export function englishLxxNotice(){return load<{text:string}>('notice.json');}
export type EnglishLxxHit={book:string;chapter:number;verse:number;text:string};
export async function searchEnglishLxx(query:string,book=''){
 const q=query.trim().toLocaleLowerCase('en');if(!q)return [];
 const d=await load<{verses:EnglishLxxHit[]}>('search.json');return d.verses.filter(v=>(!book||v.book===book)&&v.text.toLocaleLowerCase('en').includes(q));
}
/** Reading contexts, not verse equivalence or English word alignment. Source numbering stays intact. */
export function greekContextChapters(code:string,chapter:number){
 if(code==='NEH')return [chapter+10];
 if(code==='PRO'&&chapter>=25&&chapter<=29)return [chapter+7];
 if(code==='JER'&&chapter===9)return [8,9];
 if(code==='JER'&&chapter===26)return [25,26];
 if(code==='S3Y')return [3];
 if(code==='MAN')return [12];
 if(code==='JOL')return chapter===2?[2,3]:chapter===3?[4]:[1];
 if(code==='MAL'&&chapter===4)return [3];
 if(code==='DAN'&&chapter===3)return [3,4];
 return [chapter];
}
export async function englishLxxGreekContext(meta:EnglishLxxMeta,chapter:number):Promise<ResearchVerse[]>{
 const cs=greekContextChapters(meta.code,chapter);
 return (await researchBook(meta.greekBook)).filter(v=>{
  const [c,n]=v.sourceRef.split('/')[1].split(':').map(Number);
  if(!cs.includes(c))return false;
  if(meta.code==='JER'&&chapter===9&&c===8)return n===23;
  if(meta.code==='JER'&&chapter===26&&c===25)return n===20;
  if(meta.code==='S3Y')return n>=24&&n<=90;
  if(meta.code==='MAN')return c===12;
  return true;
 });
}
const alternatives:Record<string,string>={'tobit-sinaiticus':'tobit','susanna':'susanna-theodotion','bel-and-the-dragon':'bel-and-the-dragon-theodotion',daniel:'daniel-theodotion',joshua:'joshua-vaticanus-b','judges-vaticanus-b':'judges'};
export function englishContextsForGreek(books:EnglishLxxMeta[],ref:string){
 const [source,position]=ref.split('/');const c=Number(position?.split(':')[0]);
 if(!Number.isInteger(c)||c<1)return [];
 const book=alternatives[source]||source;
 return books.filter(b=>b.greekBook===book).flatMap(b=>b.chapters.filter(ch=>greekContextChapters(b.code,ch).includes(c)).map(ch=>({book:b,chapter:ch})));
}

const extraNames:Record<string,string>={S3Y:'Prayer of Azariah and Song of the Three',MAN:'Prayer of Manasseh',LJE:'Letter of Jeremiah','1ES':'1 Esdras'};
export function englishLxxBookName(book:{code:string;name:string}){return extraNames[book.code]||canonicalBooks.find(b=>b.code===book.code)?.name||book.name;}
