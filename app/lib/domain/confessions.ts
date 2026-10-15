import {compare,type PassageRange} from './references.ts';
import type {ConfessionalReference} from './confessional-references.ts';
export const confessionRelease='triglotta-1921-2026-10-14-v4';
export const confessionHash='8e64439579317fabf338073523216841df9bbc7d9e8ac4f6767aff312f816414';
export type ConfessionalParagraph={id:string;work:string;section:string;ordinal:number;number:number|string|null;text:string;kind:'paragraph'|'heading';sourceUrl:string;sourceFile:string;suppliedParagraph:number|null;references:ConfessionalReference[]};
export type ConfessionalSection={key:string;title:string;headings:string[];paragraphIds:string[];sourceUrl:string};
export type ConfessionalWork={code:string;title:string;sourceUrl:string;sections:ConfessionalSection[]};
export type ConfessionIndex={schemaVersion:1;releaseId:string;edition:string;translation:string;language:'en';documents:ConfessionalWork[];paragraphs:ConfessionalParagraph[]};
export function confessionalMatches(p:ConfessionalParagraph,ranges:PassageRange[]){return p.references.some(c=>c.ranges.some(r=>ranges.some(q=>compare(r.start,q.end)<=0&&compare(q.start,r.end)<=0)));}
export function matchingConfessions(index:ConfessionIndex,ranges:PassageRange[]){return index.paragraphs.filter(p=>confessionalMatches(p,ranges));}
export function confessionalGroups(paragraphs:ConfessionalParagraph[]){
 const groups=new Map<string,ConfessionalParagraph[]>();
 for(const p of paragraphs){const key=p.work+'|'+p.text;groups.set(key,[...(groups.get(key)||[]),p]);}
 return [...groups.values()].map(g=>g.length>1?[g[g.length-1],...g.slice(0,-1)]:g);
}
export function confessionLocation(index:ConfessionIndex,p:ConfessionalParagraph){const work=index.documents.find(w=>w.code===p.work)!,section=work.sections.find(s=>s.key===p.section)!;return {work,section};}
export function confessionParagraphLabel(p:ConfessionalParagraph){return p.kind==='heading'?`Source heading${p.number===null?'':` · ${p.number}`}`:p.number===null?'Unnumbered paragraph':`Paragraph ${p.number}`;}
export function confessionalReadingRanges(ranges:PassageRange[]){
 const result:PassageRange[]=[];
 for(const range of [...ranges].sort((a,b)=>compare(a.start,b.start))){const last=result.at(-1);if(last&&compare(last.end,range.start)>=0){if(compare(range.end,last.end)>0)last.end=range.end;}else result.push({...range});}
 return result;
}
export function confessionsUrl(ranges:PassageRange[],edition='BSB'){return `/library?view=confessions&passage=${encodeURIComponent(ranges.map(r=>r.start===r.end?r.start:`${r.start}-${r.end}`).join(';'))}&confessionEdition=${encodeURIComponent(edition)}`;}
export async function loadConfessions(load=async(path:string)=>{const response=await fetch(path);if(!response.ok)throw Error('Confessional documents could not be loaded.');return response.text();}):Promise<ConfessionIndex>{
 const raw=await load(`/confessions/${confessionRelease}/index.json`);
 const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(raw))),b=>b.toString(16).padStart(2,'0')).join('');
 if(hash!==confessionHash)throw Error('Confessional documents do not match the preserved English source.');
 const d=JSON.parse(raw) as ConfessionIndex;
 if(d.schemaVersion!==1||d.releaseId!==confessionRelease||d.documents.length!==9||d.paragraphs.length!==4431||new Set(d.paragraphs.map(p=>p.id)).size!==4431||d.language!=='en')throw Error('Confessional documents are incomplete.');
 return d;
}
