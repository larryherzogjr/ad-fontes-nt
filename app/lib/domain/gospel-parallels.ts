import {address,compare,type PassageRange} from './references.ts';
export const gospelBooks=['MAT','MRK','LUK','JHN'];
export const gospelParallelRelease='bsb-gospel-parallels-2026-10-14-v1';
export const gospelParallelHash='7d20a81683f5b03f50b71943246596d95dbc8665691ae49245cfae80628bbff3';
export type GospelParallel={id:string;title:string;sourceEdition:'BSB';sourceRelease:string;sourceId:string;sourceRange:PassageRange;targetRanges:PassageRange[];publisherReference:string;references:{text:string;path:string;ranges:PassageRange[]}[]};
export type GospelParallelIndex={schemaVersion:1;releaseId:string;records:GospelParallel[]};
export function parallelMatches(record:GospelParallel,ranges:PassageRange[]){return ranges.some(r=>[record.sourceRange,...record.targetRanges].some(p=>compare(r.start,p.end)<=0&&compare(p.start,r.end)<=0));}
export function parallelAccounts(record:GospelParallel){return [record.sourceRange,...record.targetRanges].sort((a,b)=>compare(a.start,b.start));}
export function parallelKey(record:GospelParallel){return JSON.stringify(parallelAccounts(record));}
export function parallelGroups(records:GospelParallel[]){
 const groups=new Map<string,GospelParallel[]>();
 for(const record of records){const key=parallelKey(record);groups.set(key,[...(groups.get(key)||[]),record]);}
 return [...groups.values()];
}
export function gospelParallelsUrl(ranges:PassageRange[],editionId='BSB'){
 return `/library?view=parallels&passage=${encodeURIComponent(ranges.map(r=>r.start===r.end?r.start:`${r.start}-${r.end}`).join(';'))}&parallelEdition=${encodeURIComponent(editionId)}`;
}
export async function loadGospelParallels(load=async(path:string)=>{const response=await fetch(path);if(!response.ok)throw Error('Gospel parallels could not be loaded.');return response.text();}):Promise<GospelParallelIndex>{
 const raw=await load(`/gospel-parallels/${gospelParallelRelease}/index.json`);
 const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(raw))),b=>b.toString(16).padStart(2,'0')).join('');
 if(hash!==gospelParallelHash)throw Error('Gospel parallels data does not match the preserved publisher index.');
 const data=JSON.parse(raw) as GospelParallelIndex;
 const valid=(r:PassageRange)=>gospelBooks.includes(address(r.start).book.code)&&address(r.start).book.code===address(r.end).book.code&&compare(r.start,r.end)<=0;
 if(data.schemaVersion!==1||data.releaseId!==gospelParallelRelease||data.records.length!==361||new Set(data.records.map(r=>r.id)).size!==361||data.records.some(r=>!r.id||!r.title||r.sourceEdition!=='BSB'||r.sourceRelease!=='bsb-2026-09-05-m2-v1'||!r.sourceId||!valid(r.sourceRange)||!r.targetRanges.length||r.targetRanges.some(t=>!valid(t))||!r.references.length))throw Error('Gospel parallels data is incomplete.');
 return data;
}
