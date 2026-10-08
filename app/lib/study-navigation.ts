import {passageUrl,type PassageRange} from './domain/references.ts';
/** Carry only public study state; never copy arbitrary parameters to a destination. */
export function connectedContextUrl(ranges:PassageRange[],edition:string,connection:string,view:string,current:string){
 const url=new URL(passageUrl(ranges,edition),'http://local');url.searchParams.set('panel','connections');url.searchParams.set('connection',connection);url.searchParams.set('connectionView',view);
 const source=new URL(current,'http://local');for(const key of ['ntDisplay','otDisplay','display','connectionGreekView'])if(source.searchParams.has(key))url.searchParams.set(key,source.searchParams.get(key)!);
 return url.pathname+url.search;
}
export function researchReturnUrl(value:string|null){
 if(!value || !value.startsWith('/'))return '/greek';
 let source:URL;try{source=new URL(value,'http://local');}catch{return '/greek';}
 const library=source.pathname==='/library'&&source.searchParams.get('view')==='research';
 if(source.origin!=='http://local'||(!library&&source.pathname!=='/greek'))return '/greek';
 const out=new URL(library?'/library?view=research':'/greek','http://local');for(const key of ['q','mode','book','pos','form','fold','only','page'])if(source.searchParams.has(key))out.searchParams.set(key,source.searchParams.get(key)!);return out.pathname+out.search;
}
export function researchResultUrl(ref:string,returnTo:string){const back=researchReturnUrl(returnTo);const out=new URL(back.startsWith('/library?')?'/library?view=research':'/greek','http://local');out.searchParams.set('verse',ref);out.searchParams.set('from',back);return out.pathname+out.search;}

/** Promote an edition without dropping the open comparison or public display choices. */
export function mainEditionUrl(ranges:PassageRange[],edition:string,current:string){
 const source=new URL(current,'http://local'),out=new URL(passageUrl(ranges,edition),'http://local');
 out.searchParams.set('panel','compare');out.searchParams.set('comparisonSection','readings');
 for(const key of ['unit','compareEditions','comparisonLayout'])if(source.searchParams.has(key))out.searchParams.set(key,source.searchParams.get(key)!);
 return out.pathname+out.search;
}
