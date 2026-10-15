/** Historical dictionaries are independent of immutable Scripture/OSHB analysis. */
export const hebrewLexiconRelease = 'hebrew-lexicon-2026-10-14-v1';
export type HebrewLexicalRow = {key:string;strong:string|null;lexical:string|null;bdb:string|null;headword:string;transliteration:string;gloss:string;language:'heb'|'arc';mappingNote:string};
export type HebrewLexicalIndex = {entries:HebrewLexicalRow[]};
export type HebrewStrongsEntry = {id:string;headword:string;language:string;transliteration:string;pronunciation:string;derivation:string;definition:string;usage:string;notes:string[]};
export type HebrewBdbEntry = {id:string;headwords:string[];paragraphs:string[]};
const cache = new Map<string,Promise<unknown>>();
async function data<T>(path:string):Promise<T>{
 if(!cache.has(path)) cache.set(path,fetch(`/lexical/${hebrewLexiconRelease}/${path}`).then(async r=>{
  if(!r.ok)throw Error('Hebrew dictionary data could not be loaded.');
  const value=await r.json();if(value.releaseId!==hebrewLexiconRelease)throw Error('Hebrew dictionary release mismatch.');return value;
 }).catch(e=>{cache.delete(path);throw e}));
 return cache.get(path) as Promise<T>;
}
export const hebrewLexicalIndex=()=>data<HebrewLexicalIndex>('index.json');
export async function hebrewDictionary(key:string){
 if(!/^[HA]\d+[a-z]?$/.test(key))throw Error('Unknown Hebrew dictionary key.');
 const index=await hebrewLexicalIndex();const row=index.entries.find(e=>e.key===key);
 if(!row)return {row:null,strong:null,bdb:null};
 const [strong,bdb]=await Promise.all([
  row.strong?data<HebrewStrongsEntry>(`strongs/${row.strong}.json`):null,
  row.bdb?data<HebrewBdbEntry>(`bdb/${row.bdb}.json`):null,
 ]);
 if((strong&&strong.id!==row.strong)||(bdb&&bdb.id!==row.bdb))throw Error('Hebrew dictionary entry mismatch.');
 return {row,strong,bdb};
}
