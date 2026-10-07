import { getOccurrences, type Occurrences } from './greek.ts';
export const lemmaLinkRelease = 'greek-lemma-links-2026-10-07-v1';
export type LemmaLink = {lemma:string;nt:{id:string;count:number}[];lxx:{id:string;count:number}[]};
let cache: Promise<LemmaLink[]> | undefined;
export function loadLemmaLinks(): Promise<LemmaLink[]> {
  if (!cache) cache = (async()=>{
    const response=await fetch(`/analysis/${lemmaLinkRelease}.json`);
    if(!response.ok)throw Error('Greek lemma index unavailable');
    const data=await response.json();
    if(data.schemaVersion!==1 || data.releaseId!==lemmaLinkRelease || data.sources?.nt!=='nestle-analysis-1.3-m3-v1' || data.sources?.lxx!=='lxx-rahlfs-1935-2026-10-07-v3' || !Array.isArray(data.entries) || data.entries.some((e:LemmaLink)=>typeof e.lemma!=='string'||!['nt','lxx'].every(s=>Array.isArray(e[s as 'nt'|'lxx']) && e[s as 'nt'|'lxx'].every(r=>new RegExp(s==='nt'?'^[a-f0-9]{20}$':'^lxx-[a-f0-9]{20}$').test(r.id)&&Number.isInteger(r.count)&&r.count>0))))throw Error('Greek lemma index invalid');
    return data.entries;
  })().catch(error=>{cache=undefined;throw error;});
  return cache;
}
export async function linkedOccurrences(link:LemmaLink,side:'nt'|'lxx'):Promise<Occurrences['hits']>{
  const records=await Promise.all(link[side].map(async ref=>{
    const result=await getOccurrences(ref.id);
    if(result.releaseId!==(side==='nt'?'nestle-analysis-1.3-m3-v1':'lxx-rahlfs-1935-2026-10-07-v3') || result.lemma.normalize('NFC')!==link.lemma || result.hits.length!==ref.count)throw Error('Lemma concordance mismatch');
    return result.hits;
  }));
  return records.flat();
}
