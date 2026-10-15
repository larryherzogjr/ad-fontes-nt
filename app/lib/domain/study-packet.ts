import { address, compare, expand, resolveReference, passageUrl, type PassageRange } from './references.ts';
import { createLocalAdapter, editions, editionsFor, type CorpusAdapter, type Coverage, type Segment, type PublisherNote } from './corpus.ts';
import { formatPassage } from '../reading-display.ts';
import { relatedResources } from './resources.ts';
import { type Variant } from './variants.ts';
import { checkedJson, collectionLabels, loadSearchManifest, searchRelease, type SearchDoc, type SearchIndex, type SearchBlock, type TextShard } from './library-search.ts';
import { loadConnectionCatalog, connectionPairKey, connectionMatches, type TestamentConnection } from './testament-connections.ts';
import { loadConnectionLabels, type ConnectionLabel } from './connection-labels.ts';
import {commentaryChapters, commentaryForBook} from './commentaries.ts';
import {getAnalysis} from './greek.ts';
import {loadLookup,resolveLookup} from './lexical.ts';
import {hebrewPassage,originalData,type HebrewIndex} from './original-languages.ts';
import {loadGospelParallels,parallelMatches,parallelAccounts,parallelGroups,type GospelParallel} from './gospel-parallels.ts';
import {loadConfessions,confessionalGroups,matchingConfessions,confessionLocation,type ConfessionalParagraph,type ConfessionalWork,type ConfessionalSection} from './confessions.ts';
import {selectedLectionary,sameLectionaryRanges,type LectionarySelection} from './lectionary.ts';
import omRelease from './om-release.json' with {type:'json'};

export const packetStorageKey = 'af-study-packet-v2';
export const legacyPacketStorageKey = 'af-study-packet-v1';
export type PacketExcerpt = { resource: string; block: number };
export type PacketOptions = { title:string; reference:string; editionIds:string[]; explanations:boolean; relatedConnections:boolean; relatedParallels:boolean; relatedConfessions:boolean; relatedGreek:boolean; relatedHebrew:boolean; publisherNotes:boolean; resourceLinks:boolean; writingSpace:boolean; relatedCommentary:boolean; lectionary?:LectionarySelection };
export const defaultPacket:PacketOptions = {title:'Study packet',reference:'John 3:16–21',editionIds:['BSB'],explanations:true,relatedConnections:false,relatedParallels:false,relatedConfessions:false,relatedGreek:false,relatedHebrew:false,publisherNotes:true,resourceLinks:true,writingSpace:false,relatedCommentary:false};
export function packetRanges(reference: string, verseLimit=120): PassageRange[] {
 if(reference.length>1500)throw Error('Use a shorter passage reference.');
 const ranges=resolveReference(reference);if(ranges.length>12||ranges.flatMap(expand).length>verseLimit)throw Error(`Choose up to 12 ranges and ${verseLimit} verses for one packet.`);
 // Each quotation belongs to one source book/release, even in an OT/NT packet.
 return ranges.flatMap(range=>{const groups:PassageRange[]=[];for(const anchor of expand(range)){const prior=groups.at(-1);if(prior&&address(prior.start).book.code===address(anchor).book.code)prior.end=anchor;else groups.push({start:anchor,end:anchor});}return groups;});
}
export function validatePacket(options: PacketOptions): PassageRange[] {
 if(typeof options.title!=='string'||!options.title.trim()||options.title.length>120)throw Error('Enter a packet title of 1–120 characters.');
 if(options.lectionary)selectedLectionary(options.lectionary);
 const ranges=packetRanges(options.reference,options.lectionary?400:120);if(options.lectionary&&!sameLectionaryRanges(ranges,options.lectionary))throw Error('The Scripture selection differs from the appointed readings. Start a custom packet to change the passages.');
 const available=editionsFor(ranges);
 if(!Array.isArray(options.editionIds)||!options.editionIds.length||options.editionIds.length>7||new Set(options.editionIds).size!==options.editionIds.length||options.editionIds.some(id=>!available.some(e=>e.editionId===id)))throw Error('Choose at least one available edition. Greek NT editions require an NT-only packet.');
 for(const key of ['explanations','relatedConnections','relatedParallels','relatedConfessions','relatedGreek','relatedHebrew','publisherNotes','resourceLinks','writingSpace','relatedCommentary'] as const)if(typeof options[key]!=='boolean')throw Error('Invalid packet option.');
 if(options.relatedCommentary)packetCommentarySelections(ranges);
 return ranges;
}
export function readPacket(value:string|null):PacketOptions {
 if(!value)return {...defaultPacket,editionIds:[...defaultPacket.editionIds]};
 const parsed=JSON.parse(value);if(![1,2].includes(parsed.schemaVersion)||!parsed.options)throw Error('This saved packet configuration is not supported.');
 const options={relatedConnections:false,relatedParallels:false,relatedConfessions:false,relatedGreek:false,relatedHebrew:false,relatedCommentary:false,...parsed.options};validatePacket(options);
 return {...Object.fromEntries(Object.keys(defaultPacket).map(key=>[key,options[key]])),...(options.lectionary?{lectionary:options.lectionary}:{})} as PacketOptions;
}
export function packetUrl(ranges: PassageRange[],editionId='BSB') {
 const edition=editions.find(e=>e.editionId===editionId);
 const ids=edition?[editionId]:['BSB'];
 return `/library?view=packets&passage=${encodeURIComponent(ranges.map(r=>r.start===r.end?r.start:`${r.start}-${r.end}`).join(';'))}&packetEdition=${encodeURIComponent(ids[0])}`;
}
export type PacketReading = { editionId:string; name:string; releaseId:string; sourceUrl:string; range:PassageRange; segments:Segment[]; coverage:Coverage[]; notes:PublisherNote[] };
export type LoadedExcerpt = { selection:PacketExcerpt; doc:SearchDoc; content:SearchBlock; sourceHash:string };
export type LoadedStudy = {id:string;doc:SearchDoc;markdown:string;matches?:string[]};
export type PacketCommentary = {doc:SearchDoc;paragraphs:SearchBlock[]};
export type LoadedConnection = {id:string;citations:TestamentConnection[];label?:ConnectionLabel;ntRanges:PassageRange[];otRanges:PassageRange[];readings:PacketReading[]};
export type LoadedParallel = {id:string;citations:GospelParallel[];readings:PacketReading[]};
export type PacketConfession={paragraph:ConfessionalParagraph;work:ConfessionalWork;section:ConfessionalSection; locations:{paragraph:ConfessionalParagraph;work:ConfessionalWork;section:ConfessionalSection}[]};
export type Packet = { options:PacketOptions; ranges:PassageRange[]; readings:PacketReading[]; units:Variant[]; resources:ReturnType<typeof relatedResources>; studies:LoadedStudy[]; connections:LoadedConnection[]; parallels:LoadedParallel[]; confessions:PacketConfession[]; commentary:PacketCommentary[]; matchingNotes:string[] };
export function packetCommentarySelections(ranges:PassageRange[]){
 const selections=commentaryChapters(ranges,true).map(c=>{const collection=commentaryForBook(c.book);return {id:`${collection.id}:${c.book}:${c.chapter}`,title:`${address(`${c.book}.${c.chapter}.1`).book.name} · ${collection.id==='kd'?'K&D source chapter group':'Lenski chapter'} ${c.chapter}`,collection:collection.id};});
 if(selections.length>20)throw Error('Choose passages covering up to 20 commentary chapter groups.');
 return selections;
}
export async function loadPacketCommentary(ranges:PassageRange[],signal?:AbortSignal):Promise<PacketCommentary[]>{
 const selections=packetCommentarySelections(ranges),manifest=await loadSearchManifest(signal),indexes=new Map<string,Promise<SearchIndex>>(),shards=new Map<string,Promise<TextShard>>();
 return Promise.all(selections.map(async s=>{
  if(!indexes.has(s.collection))indexes.set(s.collection,checkedJson<SearchIndex>(`${s.collection}.bin`,manifest.files[`${s.collection}.bin`],signal));
  const index=await indexes.get(s.collection)!;
  const doc=index.documents.find(d=>d.id===s.id);if(!doc)throw Error(`Related commentary is unavailable for ${s.title}.`);
  if(!shards.has(doc.shard))shards.set(doc.shard,checkedJson<TextShard>(doc.shard,manifest.files[doc.shard],signal));
  const shard=await shards.get(doc.shard)!;
  const blocks=shard.documents[doc.id];if(shard.releaseId!==searchRelease||!blocks||blocks.length!==doc.blocks||blocks.length<2)throw Error(`Related commentary is incomplete for ${s.title}.`);
  return {doc,paragraphs:blocks.slice(1)};
 }));
}
export function overlappingUnits(units:Variant[],ranges:PassageRange[]) {
 return units.filter(u=>u.status==='approved'&&u.rights==='cleared'&&u.significance&&u.ranges.some(r=>ranges.some(w=>compare(r.start,w.end)<=0&&compare(w.start,r.end)<=0)));
}
export async function loadPacketReading(range:PassageRange,editionId:string,adapter:CorpusAdapter=createLocalAdapter(undefined,editionId)):Promise<PacketReading> {
 const passage=await adapter.getPassage([range]);if(passage.coverage.some(c=>c.dataState!=='available'||c.textState==='unknown'))throw Error('Scripture coverage is unavailable. The packet cannot be printed with an incomplete reading.');
 const anchors=new Set(expand(range)),noteIds=new Set(passage.coverage.flatMap(c=>c.publisherNoteIds));
 const notes=(await adapter.getReadingChapters([range])).flatMap(ch=>ch.notes).filter(n=>anchors.has(n.anchor)||noteIds.has(n.id));
 if([...noteIds].some(id=>!notes.some(n=>n.id===id)))throw Error('A linked publisher note is unavailable. Please reload the source data.');
 return {editionId,name:editions.find(e=>e.editionId===editionId)!.name,releaseId:passage.releaseId,range,segments:passage.segments,coverage:passage.coverage,notes:[...new Map(notes.map(n=>[n.id,n])).values()],sourceUrl:editions.find(e=>e.editionId===editionId)!.url};
}
export async function loadPacketExcerpt(selection:PacketExcerpt,signal?:AbortSignal):Promise<LoadedExcerpt> {
 if(!Object.hasOwn(collectionLabels,selection.resource.split(':')[0])||!Number.isInteger(selection.block)||selection.block<0)throw Error('Invalid Library excerpt.');
 const manifest=await loadSearchManifest(signal),collection=selection.resource.split(':')[0];
 const index=await checkedJson<SearchIndex>(`${collection}.bin`,manifest.files[`${collection}.bin`],signal);
 const doc=index.documents.find(d=>d.id===selection.resource);if(!doc)throw Error('The selected study is unavailable in the approved Library release.');
 const shard=await checkedJson<TextShard>(doc.shard,manifest.files[doc.shard],signal),blocks=shard.documents[doc.id];
 if(shard.releaseId!==searchRelease||!blocks||blocks.length!==doc.blocks||!blocks[selection.block])throw Error('The selected excerpt is unavailable.');
 return {selection,doc,content:blocks[selection.block],sourceHash:manifest.files[doc.shard]};
}
export async function loadPacketStudy(id:string,signal?:AbortSignal):Promise<LoadedStudy>{
 if(!/^(greek|hebrew):[a-z0-9-]+$/.test(id))throw Error('Only included Greek and Hebrew word studies can be attached in full.');
 const first=await loadPacketExcerpt({resource:id,block:0},signal),manifest=await loadSearchManifest(signal);
 // A complete article must retain Markdown definitions and authored footnotes,
 // which cannot be reconstructed by rendering search blocks independently.
 const path=`om/${first.doc.release}/articles/${id.split(':')[1]}.json`,hash=manifest.inputs[path];
 if(!hash)throw Error('The complete article is not pinned in the approved Library release.');
 const response=await fetch(`/${path}`,{signal,cache:'no-store'});if(!response.ok)throw Error('The complete article is unavailable.');
 const bytes=await response.arrayBuffer(),actual=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),b=>b.toString(16).padStart(2,'0')).join('');
 if(actual!==hash)throw Error('The complete article does not match the approved Library release.');
 const source=JSON.parse(new TextDecoder().decode(bytes));
 if(source.releaseId!==first.doc.release||source.article?.slug!==id.split(':')[1]||typeof source.article.markdown!=='string')throw Error('The complete article is unavailable.');
 return {id,doc:first.doc,markdown:source.article.markdown};
}
export function selectPacketConnection(id:string,records:TestamentConnection[],labels:ConnectionLabel[]):Omit<LoadedConnection,'readings'>{
 const selected=records.find(c=>c.id===id);if(!selected)throw Error('The selected NT/OT connection is unavailable.');
 const citations=records.filter(c=>connectionPairKey(c)===connectionPairKey(selected));
 const label=labels.find(l=>l.connectionIds.includes(selected.id));
 const sides=[selected.sourceRanges,selected.targetRanges];
 return {id,citations,label,ntRanges:label?.displayNtRanges||sides.find(rs=>address(rs[0].start).book.order>=39)!,otRanges:label?.displayNtRanges?label.otRanges:sides.find(rs=>address(rs[0].start).book.order<39)!};
}
export async function loadPacketConnections(ids:string[],editionIds:string[]):Promise<LoadedConnection[]>{
 if(!ids.length)return [];
 const [catalog,labels]=await Promise.all([loadConnectionCatalog(),loadConnectionLabels()]);
 const english=editionIds.filter(id=>editions.find(e=>e.editionId===id)?.language==='en');
 return Promise.all(ids.map(async id=>{const selected=selectPacketConnection(id,catalog.connections,labels);
 const ranges=resolveReference([...selected.otRanges,...selected.ntRanges].sort((a,b)=>compare(a.start,b.start)).map(r=>r.start===r.end?r.start:`${r.start}-${r.end}`).join(';'));
 return {...selected,readings:await Promise.all(ranges.flatMap(r=>(english.length?english:['BSB']).map(e=>loadPacketReading(r,e))))};}));
}
export async function loadPacketComparisons():Promise<Variant[]>{
 const r=await fetch('/editorial/variants.json',{cache:'no-store'});if(!r.ok)throw Error('Approved textual comparisons could not be loaded.');const b=await r.json();if(b.schemaVersion!==1||b.units?.length!==110||b.units.some((u:Variant)=>u.status!=='approved'||u.rights!=='cleared'||!u.significance))throw Error('The approved explanation release is incomplete.');return b.units;
}
export async function relatedPacketStudies(ranges:PassageRange[],options:Pick<PacketOptions,'relatedGreek'|'relatedHebrew'>,signal?:AbortSignal){
 const matches=new Map<string,Set<string>>(),notes:string[]=[];
 const add=(id:string,label:string)=>{const refs=matches.get(id)||new Set<string>();refs.add(label);matches.set(id,refs);};
 const ot=ranges.filter(r=>address(r.start).book.order<39),nt=ranges.filter(r=>address(r.start).book.order>=39);
 if(options.relatedGreek){
  const lookup=await loadLookup(),response=await fetch(`/om/${omRelease.releaseId}/index.json`,{signal});if(!response.ok)throw Error('Greek study associations are unavailable.');
  const index=await response.json();if(index.releaseId!==omRelease.releaseId||index.articles?.length!==omRelease.articleCount)throw Error('Greek study inventory is incomplete.');
  const urls=new Set<string>(index.articles.map((a:{url:string})=>a.url)),linked=new Set<string>();
  if(Object.keys(lookup.links).length!==omRelease.articleCount||Object.keys(lookup.aliases||{}).length!==5)throw Error('Greek study associations are incomplete.');
  for(const links of Object.values(lookup.links)){if(!Array.isArray(links)||!links.length)throw Error('Greek study associations are incomplete.');for(const link of links){if(!urls.has(link.url))throw Error('A Greek study association is not in the approved inventory.');linked.add(link.url);}}
  if(linked.size!==omRelease.articleCount)throw Error('Greek study associations are incomplete.');
  for(const selected of [ot,nt]){if(!selected.length)continue;const analysis=await getAnalysis(selected);
   for(const segment of analysis){if(segment.status==='unavailable'){notes.push(`Greek word-study matching unavailable at ${segment.sourceLabel||segment.sourceRef}. ${segment.reason||''}`);continue;}
    if(!Array.isArray(segment.tokens)||(segment.text.trim()&&!segment.tokens.length)||segment.tokens.some(t=>typeof t.lemma!=='string'||typeof t.strongs!=='string'||segment.text.slice(t.start,t.end)!==t.surface))throw Error('Greek source analysis is incomplete. The packet cannot be prepared.');
    for(const token of segment.tokens)for(const link of resolveLookup(lookup,token).links){const article=index.articles.find((a:{url:string})=>a.url===link.url);if(article)add(`greek:${article.slug}`,`${segment.sourceLabel||segment.sourceRef} · ${token.lemma}`);}
   }
  }
  notes.push('Greek word studies match the reader’s recorded source lemmas and reviewed associations: Nestle 1904 in the NT and the included Septuagint analysis in the OT. No English word alignment is implied.');
 }
 if(options.relatedHebrew&&ot.length){
  const index=await originalData<HebrewIndex>('hebrew-index.json');if(index.articles?.length!==7||index.articles.some(a=>!a.slug||!Array.isArray(a.keys)||!a.keys.length))throw Error('Hebrew study inventory is incomplete.');
  const passage=await hebrewPassage(ot);
  for(const verse of passage.verses){if(verse.partial){notes.push(`Hebrew word-study matching skipped at ${verse.reference}: only partial canonical correspondence is recorded.`);continue;}
   if(verse.parts.some(p=>p.token&&!verse.tokens.some(t=>t.id===p.token&&Array.isArray(t.keys))))throw Error('Hebrew source analysis is incomplete. The packet cannot be prepared.');
   const keys=new Set(verse.tokens.filter(t=>verse.parts.some(p=>p.token===t.id)).flatMap(t=>t.keys));
   for(const article of index.articles)if(article.keys.some(k=>keys.has(k)))add(`hebrew:${article.slug}`,`${verse.reference} · ${article.headword}`);
  }
  if(passage.missing.length)notes.push(`Hebrew source correspondence unavailable for ${passage.missing.join(', ')}. This does not establish textual absence.`);
  notes.push('Hebrew studies match written source words through the recorded WLC numbering catalogue. Alternative readings, partial correspondences and English word alignment are not inferred.');
 }
 const studies=await Promise.all([...matches].map(async([id,refs])=>({...await loadPacketStudy(id,signal),matches:[...refs]})));
 return {studies,notes};
}
export function relatedPacketConnectionIds(records:TestamentConnection[],ranges:PassageRange[]){
 const pairs=new Map<string,string>();for(const record of records)if(connectionMatches(record,ranges)&&!pairs.has(connectionPairKey(record)))pairs.set(connectionPairKey(record),record.id);return [...pairs.values()];
}
export async function loadPacketParallels(ranges:PassageRange[],editionIds:string[]):Promise<LoadedParallel[]>{
 const groups=parallelGroups((await loadGospelParallels()).records).filter(g=>g.some(c=>parallelMatches(c,ranges)));
 const english=editionIds.filter(id=>editions.find(e=>e.editionId===id)?.language==='en');
 const ids=english.length?english:['BSB'];
 return Promise.all(groups.map(async citations=>({id:citations[0].id,citations,readings:await Promise.all(parallelAccounts(citations[0]).flatMap(range=>ids.map(id=>loadPacketReading(range,id))))})));
}
export async function loadPacketConfessions(ranges:PassageRange[]):Promise<PacketConfession[]>{
 const index=await loadConfessions();return confessionalGroups(matchingConfessions(index,ranges)).map(group=>({paragraph:group[0],...confessionLocation(index,group[0]),locations:group.map(paragraph=>({paragraph,...confessionLocation(index,paragraph)}))}));
}
export async function buildPacket(options:PacketOptions,signal?:AbortSignal):Promise<Packet>{
 const ranges=validatePacket(options);
 const units=options.explanations?overlappingUnits(await loadPacketComparisons(),ranges):[];
 const readings=await Promise.all(ranges.flatMap(range=>options.editionIds.map(id=>loadPacketReading(range,id))));
 const {studies,notes}=await relatedPacketStudies(ranges,options,signal);
 const ids=options.relatedConnections?relatedPacketConnectionIds((await loadConnectionCatalog()).connections,ranges):[];
 const connections=await loadPacketConnections(ids,options.editionIds),commentary=options.relatedCommentary?await loadPacketCommentary(ranges,signal):[];
 const confessions=options.relatedConfessions?await loadPacketConfessions(ranges):[];
 const parallels=options.relatedParallels?await loadPacketParallels(ranges,options.editionIds):[];
 if(signal?.aborted)throw new DOMException('Cancelled','AbortError');
 return {options:{...options,editionIds:[...options.editionIds]},ranges,readings,units,resources:options.resourceLinks?relatedResources(ranges):[],studies,connections,parallels,confessions,commentary,matchingNotes:notes};
}
export function publicResourceUrl(path:string) {return path.startsWith('/')?`https://ad-fontes.app${path}`:path;}
export function readingLabel(reading:PacketReading) {return `${formatPassage([reading.range])} · ${reading.name}`;}
export function citationForUnit(unit:Variant) {return publicResourceUrl(`${passageUrl(unit.ranges,'BSB')}&panel=${unit.presentation==='publisher-note'?'notes':'compare'}&unit=${encodeURIComponent(unit.id)}`);}
