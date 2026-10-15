/** Historical writings retain their own source divisions, independent of Bible numbering. */
export const historicalRelease = 'historical-library-2026-10-15-v1';
export const historicalBase = `/library/historical/${historicalRelease}`;
export const historicalCatalogHash = 'c915b88716554e2876a9041fb492bc3c0a7c3d11b6db57e0be67aa987b1f1e71';
export type HistoricalSectionMeta = {id:string;label:string;group:string;path:string;sha256:string;paragraphs:number};
export type HistoricalWork = {id:string;title:string;author:string;translator:string;edition:string;category:string;description:string;notice:string;sourceUrl:string;rights:string;expectedSections:number;sections:HistoricalSectionMeta[]};
export type HistoricalCatalog = {schemaVersion:1;releaseId:string;works:HistoricalWork[]};
export type HistoricalSection = {schemaVersion:1;releaseId:string;work:string;id:string;label:string;group:string;paragraphs:string[];textSha256:string};
export function historicalUrl(work='',section='',category='') {
 const p=new URLSearchParams({view:'historical'});if(work)p.set('work',work);if(section)p.set('section',section);if(category)p.set('historicalCategory',category);return `/library?${p}`;
}
export async function loadHistoricalCatalog(signal?:AbortSignal):Promise<HistoricalCatalog> {
 const r=await fetch(`${historicalBase}/catalog.json`,{signal});if(!r.ok)throw Error('Historical Library could not be loaded. Please retry.');
 const bytes=await r.arrayBuffer();const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),b=>b.toString(16).padStart(2,'0')).join('');
 if(hash!==historicalCatalogHash)throw Error('The Historical Library catalog does not match this release. Please reload.');
 const value=JSON.parse(new TextDecoder().decode(bytes)) as HistoricalCatalog;
 if(value.schemaVersion!==1||value.releaseId!==historicalRelease||!Array.isArray(value.works)||value.works.length!==7||value.works.some(w=>!w.id||!Array.isArray(w.sections)||w.sections.length!==w.expectedSections))throw Error('The Historical Library catalog does not match this release.');
 return value;
}
export async function loadHistoricalSection(work:HistoricalWork,meta:HistoricalSectionMeta,signal?:AbortSignal):Promise<HistoricalSection> {
 const r=await fetch(`${historicalBase}/${meta.path}`,{signal});if(!r.ok)throw Error('This historical reading could not be loaded. Please retry.');
 const bytes=await r.arrayBuffer();const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),b=>b.toString(16).padStart(2,'0')).join('');
 if(hash!==meta.sha256)throw Error('This historical reading does not match its source release. Please reload.');
 const value=JSON.parse(new TextDecoder().decode(bytes)) as HistoricalSection;
 if(value.schemaVersion!==1||value.releaseId!==historicalRelease||value.work!==work.id||value.id!==meta.id||!Array.isArray(value.paragraphs)||value.paragraphs.length!==meta.paragraphs||value.paragraphs.some(p=>typeof p!=='string'))throw Error('This historical reading is incomplete.');
 return value;
}
