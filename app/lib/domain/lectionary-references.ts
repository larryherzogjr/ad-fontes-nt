import {bookFor,address,compare,expand,chapterRange,type PassageRange} from './references.ts';
export type LectionaryChoice={label:string;ranges:PassageRange[];extendedRanges:PassageRange[];partialVerses:boolean;unresolved?:string};
export function orderedRanges(ranges:PassageRange[]):PassageRange[]{
 const result:PassageRange[]=[];
 for(const r of ranges.map(r=>({...r})).sort((a,b)=>compare(a.start,b.start)||compare(a.end,b.end))){
  const prior=result.at(-1);if(prior&&compare(r.start,prior.end)<=0){if(compare(r.end,prior.end)>0)prior.end=r.end;}else result.push(r);
 }
 return result;
}
function parseChoice(label:string):LectionaryChoice{
 try{
  const cleaned=label.replace(/\(Procession\)|\bprocession\b/gi,'').trim();
  const match=/^(.+?)\s+(?=\(?\d)/.exec(cleaned);if(!match)throw Error('The calendar does not give a numeric Scripture reference.');
  const aliases:Record<string,string>={'Ex.':'Exodus','1 Chron.':'1 Chronicles','2 Chron.':'2 Chronicles','Is.':'Isaiah'};const book=bookFor(aliases[match[1]]||match[1]);if(!book)throw Error('The calendar reference is not in the Bible registry.');
  const body=cleaned.slice(match[0].length).replace(/:\s+/g,':').replace(/(\d+):\(/g,'($1:'),partialVerses=/\d[abc]\b/.test(body);
  if(!body.includes(':')&&book.verses.length>1){if(!/^\d+$/.test(body))throw Error('Unresolved chapter notation.');const ranges=[chapterRange(book.code,+body)];return {label,ranges,extendedRanges:ranges,partialVerses};}
  let chapter=book.verses.length===1?1:Number(/(\d+):/.exec(body)?.[1]);
  const ranges:PassageRange[]=[],extendedRanges:PassageRange[]=[];
  const tokens=[...body.matchAll(/(?:(\d+):)?(\d+)[abc]?(?:[–—-](?:(\d+):)?(\d+)[abc]?)?/g)];
  if(!tokens.length||body.replace(/(?:(\d+):)?(\d+)[abc]?(?:[–—-](?:(\d+):)?(\d+)[abc]?)?/g,'').replace(/[\s(),;]/g,''))throw Error('Unresolved reference notation.');
  for(const t of tokens){
   if(t[1])chapter=+t[1];const endChapter=t[3]?+t[3]:chapter;
   const r={start:`${book.code}.${chapter}.${+t[2]}`,end:`${book.code}.${endChapter}.${+(t[4]||t[2])}`};address(r.start);address(r.end);expand(r);
   const before=body.slice(0,t.index),optional=before.lastIndexOf('(')>before.lastIndexOf(')');
   extendedRanges.push(r);if(!optional)ranges.push(r);chapter=endChapter;
  }
  if(!ranges.length)throw Error('No required reading was resolved.');
  return {label,ranges:orderedRanges(ranges),extendedRanges:orderedRanges(extendedRanges),partialVerses};
 }catch(e){return {label,ranges:[],extendedRanges:[],partialVerses:false,unresolved:(e as Error).message};}
}
export function lectionaryChoices(text:string):LectionaryChoice[]{
 // Palm Sunday prints a procession followed by a separately chosen Passion reading.
 const stages=text.split(/\s*-{3,}\s*/).map(s=>s.trim());
 const groups=stages.map(stage=>stage.split(/\s+or\s+/i).map(parseChoice));
 let choices=groups[0];for(const next of groups.slice(1))choices=choices.flatMap(a=>next.map(b=>({label:`${a.label}; ${b.label}`,ranges:orderedRanges([...a.ranges,...b.ranges]),extendedRanges:orderedRanges([...a.extendedRanges,...b.extendedRanges]),partialVerses:a.partialVerses||b.partialVerses,...(a.unresolved||b.unresolved?{unresolved:a.unresolved||b.unresolved}:{})})));
 return choices;
}
