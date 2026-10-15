import { collectionLabels, loadSearchManifest, checkedJson, parseQuery, tokenBucket, queryIndex, sortGroups, excerpt, searchRelease, type SearchIndex, type TextShard, type SearchManifest, type PostingShard } from '../lib/domain/library-search.ts';
let manifest:Promise<SearchManifest>|undefined;
const indexes=new Map<string,Promise<SearchIndex>>(), shards=new Map<string,Promise<TextShard>>();
const terms=new Map<string,Promise<PostingShard>>();
let sequence=0;
function index(id:string,m:SearchManifest) {
 if(!indexes.has(id))indexes.set(id,checkedJson<SearchIndex>(`${id}.bin`,m.files[`${id}.bin`]).then(i=>{if(i.schemaVersion!==1||i.releaseId!==searchRelease||i.collection!==id||i.documents.length!==m.counts[id].documents||i.blocks.length!==m.counts[id].blocks)throw Error('Incomplete Library search index.');return i;}).catch(e=>{indexes.delete(id);throw e;}));
 return indexes.get(id)!;
}
function shard(path:string,m:SearchManifest) {if(!shards.has(path)){if(shards.size>=12)shards.delete(shards.keys().next().value!);shards.set(path,checkedJson<TextShard>(path,m.files[path]).then(s=>{if(s.schemaVersion!==1||s.releaseId!==searchRelease||!s.documents)throw Error('Invalid excerpt data.');return s;}).catch(e=>{shards.delete(path);throw e;}));}return shards.get(path)!;}
async function searchable(id:string,query:string,m:SearchManifest) {
 const i=await index(id,m),words=parseQuery(query).flat(),buckets=[...new Set(words.map(tokenBucket))];
 const postings:Record<string,string>={};
 await Promise.all(buckets.map(async bucket=>{const path=i.postingShards?.[bucket];if(!path||!m.files[path])throw Error('Incomplete Library search terms.');
  if(!terms.has(path))terms.set(path,checkedJson<PostingShard>(path,m.files[path]).then(s=>{if(s.schemaVersion!==1||s.releaseId!==searchRelease||s.collection!==id||s.bucket!==bucket||!s.postings)throw Error('Invalid search terms.');return s;}).catch(e=>{terms.delete(path);throw e;}));
  const s=await terms.get(path)!;for(const word of words)if(Object.hasOwn(s.postings,word))postings[word]=s.postings[word];
 }));return {...i,postings};
}
self.onmessage=async ({data}:{data:{query:string;collection:string;book:string;page:number;id:number}})=>{
 const run=++sequence;
 try {
  manifest??=loadSearchManifest().catch(e=>{manifest=undefined;throw e;});const m=await manifest;
  const ids=Object.keys(collectionLabels);const loaded=await Promise.all(ids.map(id=>searchable(id,data.query,m)));if(run!==sequence)return;
  const groups=sortGroups(loaded.flatMap(i=>queryIndex(i,data.query,data.book))), counts=Object.fromEntries(ids.map(id=>[id,groups.filter(g=>g.doc.collection===id).length]));
  const filtered=groups.filter(g=>!data.collection||g.doc.collection===data.collection), pages=Math.max(1,Math.ceil(filtered.length/20)),page=Math.min(pages,Math.max(1,data.page));
  const results=await Promise.all(filtered.slice((page-1)*20,page*20).map(async g=>{
   const s=await shard(g.doc.shard,m), blocks=s.documents[g.doc.id];if(!blocks||blocks.length!==g.doc.blocks)throw Error('The search excerpts are incomplete.');
   return {...g,excerpts:g.matches.slice(0,5).map(block=>({block,text:excerpt(blocks[block].text,data.query)}))};
  }));if(run!==sequence)return;
  self.postMessage({id:data.id,results,counts,total:filtered.length,pages,page});
 }catch(e){if(run===sequence)self.postMessage({id:data.id,error:e instanceof Error?e.message:'Library search could not be completed.'});}
};
