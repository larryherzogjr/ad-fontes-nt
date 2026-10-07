import {passageUrl,type PassageRange} from './domain/references.ts';
/** Carry only public study state; never copy arbitrary parameters to a destination. */
export function connectedContextUrl(ranges:PassageRange[],edition:string,connection:string,view:string,current:string){
 const url=new URL(passageUrl(ranges,edition),'http://local');url.searchParams.set('panel','connections');url.searchParams.set('connection',connection);url.searchParams.set('connectionView',view);
 const source=new URL(current,'http://local');for(const key of ['ntDisplay','otDisplay','display','connectionGreekView'])if(source.searchParams.has(key))url.searchParams.set(key,source.searchParams.get(key)!);
 return url.pathname+url.search;
}
export function researchReturnUrl(value:string|null){
 if(!value||!value.startsWith('/greek?'))return '/greek';const source=new URL(value,'http://local');if(source.pathname!=='/greek'||source.origin!=='http://local')return '/greek';
 const out=new URL('/greek','http://local');for(const key of ['q','mode','book','pos','form','fold','only','page'])if(source.searchParams.has(key))out.searchParams.set(key,source.searchParams.get(key)!);return out.pathname+out.search;
}
export function researchResultUrl(ref:string,returnTo:string){return `/greek?verse=${encodeURIComponent(ref)}&from=${encodeURIComponent(researchReturnUrl(returnTo))}`;}
