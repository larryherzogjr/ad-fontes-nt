/** Explicit citations only: no thematic, quotation-text or doctrinal matching. */
import {books,address,resolveReference,type PassageRange} from './references.ts';
export type ConfessionalReference={text:string;offset:number;ranges:PassageRange[];extent:'explicit'|'opening-only'};
const folded=(s:string)=>s.toLowerCase().replace(/[.\s]/g,'');
const aliases=new Map<string,{code:string;alias:string}[]>();
for(const b of books)for(const alias of [...b.aliases,...(b.code==='1TH'?['1 Thess']:b.code==='2TH'?['2 Thess']:b.code==='PHM'?['Philem']:[])]){const key=folded(alias);aliases.set(key,[...(aliases.get(key)||[]),{code:b.code,alias}]);}
const unique=[...aliases.values()].filter(v=>new Set(v.map(x=>x.code)).size===1).map(v=>v[0]);
const escape=(s:string)=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const names=unique.map(x=>escape(x.alias).replace(/\s+/g,'\\s*').replace(/^(\d)(?=[A-Za-z])/,'$1\\s*')).sort((a,b)=>b.length-a.length).join('|');
const part='\\d+(?:\\s*:\\s*\\d+)?(?:\\s*[–—-]\\s*\\d+(?:\\s*:\\s*\\d+)?)?';
const pattern=new RegExp(`(?<![\\p{L}\\d])(${names})\\.?\\s+(${part}(?:\\s*(?:,|and)\\s*${part})*)(\\s*f{1,2}\\.?)?(?![\\p{L}\\d])`,'giu');
export function extractConfessionalReferences(text:string){
 const references:ConfessionalReference[]=[],unresolved:{text:string;offset:number;reason:string}[]=[];
 for(const m of text.matchAll(pattern)){
  const code=aliases.get(folded(m[1]))![0].code,parts=m[2].replace(/\s+/g,'').split(/,|and/i),ranges:PassageRange[]=[];
  let chapter:string|undefined,verseMode=false;
  try{
   for(let i=0;i<parts.length;i++){
    const piece=parts[i];let reference:string;
    if(piece.includes(':')){chapter=piece.split(':')[0];verseMode=true;reference=`${code} ${piece}`;}
    else if(verseMode){reference=`${code} ${chapter}:${piece}`;}
    else {if(books.find(b=>b.code===code)!.verses.length===1)throw Error('Single-chapter citation without a colon is ambiguous.');reference=`${code} ${piece}`;}
    const resolved=resolveReference(reference);if(resolved.some(r=>address(r.start).book.code!==code||address(r.end).book.code!==code))throw Error('Reference crosses source books.');ranges.push(...resolved);
   }
   references.push({text:m[0],offset:m.index!,ranges,extent:m[3]?'opening-only':'explicit'});
  }catch(e){unresolved.push({text:m[0],offset:m.index!,reason:(e as Error).message});}
 }
 return {references,unresolved};
}
