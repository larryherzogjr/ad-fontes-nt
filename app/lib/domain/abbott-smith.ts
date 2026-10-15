/** Abbott-Smith is a historical dictionary, independent of corpus/analysis identity. */
export const abbottRelease='abbott-smith-1922-2026-10-14-v1';
export type AbbottRef={id:string;shard:string;headword:string;strongs:string[]};
export type AbbottIndex={entryCount:number;headwords:Record<string,AbbottRef[]>};
export type AbbottEntry={id:string;sourceKey:string;headwords:string[];strongs:string[];paragraphs:string[];historicalNtCounts:string[]};
const cache=new Map<string,Promise<unknown>>();
async function data<T>(path:string):Promise<T>{
 if(!cache.has(path))cache.set(path,fetch(`/lexical/${abbottRelease}/${path}`).then(async response=>{
  if(!response.ok)throw Error('Abbott-Smith could not be loaded.');
  const value=await response.json();if(value.releaseId!==abbottRelease)throw Error('Abbott-Smith release mismatch.');return value;
 }).catch(error=>{cache.delete(path);throw error}));
 return cache.get(path) as Promise<T>;
}
export async function loadAbbottIndex(){
 const index=await data<AbbottIndex>('index.json');
 if(index.entryCount!==6153||!index.headwords)throw Error('Incomplete Abbott-Smith index.');
 return index;
}
export function resolveAbbott(index:AbbottIndex,lemma:string,strongs?:string){
 const refs=index.headwords[lemma.normalize('NFC').toLowerCase()]||[];
 const numbers=strongs?[...strongs.matchAll(/\bG?(\d+)([a-z]?)\b/gi)].map(m=>'G'+Number(m[1])+m[2].toLowerCase()):[];
 // A shared Strong’s number alone never links a different headword.
 return refs.filter(ref=>!numbers.length||!ref.strongs.length||ref.strongs.some(n=>numbers.includes(n)));
}
export async function abbottEntries(lemma:string,strongs?:string){
 const index=await loadAbbottIndex();const refs=resolveAbbott(index,lemma,strongs);
 return Promise.all(refs.map(async ref=>{
  if(!/^a\d{5}$/.test(ref.id)||!/^\d{2}$/.test(ref.shard))throw Error('Invalid Abbott-Smith entry reference.');
  const shard=await data<{entries:Record<string,AbbottEntry>}>(`entries/${ref.shard}.json`);
  const entry=shard.entries?.[ref.id];
  if(!entry||entry.id!==ref.id||JSON.stringify(entry.strongs)!==JSON.stringify(ref.strongs)||!entry.paragraphs?.length)throw Error('Abbott-Smith entry mismatch.');
  return entry;
 }));
}
