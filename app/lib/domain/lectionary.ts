import data from './lectionary-data.json' with {type:'json'};
import {expand,type PassageRange} from './references.ts';
import {orderedRanges,type LectionaryChoice} from './lectionary-references.ts';
export type LectionarySeries='one-year'|'three-year';
export type LectionaryObservance={id:string;date:string;series:LectionarySeries;cycle:string|null;churchYear:string;season:string;title:string;dateLabel:string;alternative:boolean;sourceUrl:string;sourceFile:string;sourceRow:number;readings:{role:string;text:string;choices:LectionaryChoice[]}[]};
export type LectionarySelection={id:string;choices:number[];extended:boolean};
export const lectionary=data as unknown as {schemaVersion:number;releaseId:string;coverage:{start:string;end:string};observances:LectionaryObservance[]};
export const lectionaryPreferenceKey='af-lectionary-series-v1';
export function localDate(date=new Date()){return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;}
export function nextSunday(date:string){const d=new Date(`${date}T12:00:00Z`);if(!Number.isFinite(d.getTime()))throw Error('Choose a valid calendar date.');d.setUTCDate(d.getUTCDate()+(7-d.getUTCDay())%7);return d.toISOString().slice(0,10);}
export function seriesLabel(o:LectionaryObservance){return o.series==='one-year'?'One-Year':`Three-Year · Series ${o.cycle}`;}
export function observanceFor(series:LectionarySeries,date:string,id?:string){
 const rows=lectionary.observances.filter(o=>o.series===series&&o.date===date);return rows.find(o=>o.id===id)||rows[0];
}
export function sundayNeighbor(series:LectionarySeries,date:string,direction:-1|1){
 const dates=[...new Set(lectionary.observances.filter(o=>o.series===series&&new Date(`${o.date}T12:00:00Z`).getUTCDay()===0).map(o=>o.date))].sort();
 return direction===1?dates.find(d=>d>date):dates.filter(d=>d<date).at(-1);
}
export function selectedLectionary(selection:LectionarySelection){
 const o=lectionary.observances.find(o=>o.id===selection.id);if(!o||typeof selection.extended!=='boolean'||!Array.isArray(selection.choices)||selection.choices.length!==o.readings.length)throw Error('This lectionary selection is unavailable.');
 const readings=o.readings.map((r,i)=>{const choice=Number.isInteger(selection.choices[i])?r.choices[selection.choices[i]]:undefined;if(!choice||choice.unresolved||!choice.ranges.length)throw Error(`Choose a linked Scripture reading for ${r.role}.`);return {role:r.role,choice,ranges:selection.extended?choice.extendedRanges:choice.ranges};});
 const ranges:PassageRange[]=[];for(const r of orderedRanges(readings.flatMap(r=>r.ranges))){const prior=ranges.at(-1);if(prior&&prior.end.split('.')[0]===r.start.split('.')[0]&&expand({start:prior.end,end:r.start}).length===2)prior.end=r.end;else ranges.push({...r});}
 if(ranges.length>12||ranges.flatMap(expand).length>400)throw Error('This selection exceeds the Sunday packet limit of 12 ranges / 400 verses. Choose a shorter appointed alternative.');
 return {observance:o,readings,ranges};
}
export function lectionaryPacketUrl(selection:LectionarySelection,edition='BSB'){
 selectedLectionary(selection);
 return `/library?view=packets&lectionary=${encodeURIComponent(selection.id)}&readingChoices=${selection.choices.join(',')}&extended=${selection.extended?'1':'0'}&packetEdition=${encodeURIComponent(edition)}`;
}
export function lectionarySelectionFromParams(p:URLSearchParams):LectionarySelection|null{
 const id=p.get('lectionary');if(!id)return null;
 const choices=(p.get('readingChoices')||'0,0,0,0').split(',').map(v=>/^\d+$/.test(v)?Number(v):NaN);
 const selection={id,choices,extended:p.get('extended')==='1'};selectedLectionary(selection);return selection;
}
export function sameLectionaryRanges(referenceRanges:PassageRange[],selection:LectionarySelection){const expected=selectedLectionary(selection).ranges;return JSON.stringify([...new Set(referenceRanges.flatMap(expand))])===JSON.stringify(expected.flatMap(expand));}
