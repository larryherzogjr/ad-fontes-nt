import {parseQuery,tokenBucket,queryIndex,sortGroups,excerpt,type SearchIndex,type PostingShard,type TextShard} from '../lib/domain/library-search.ts';
const release='evaluation-resources-2026-10-16-v1';
const cache=new Map<string,Promise<any>>();let sequence=0;
async function json(base:string,path:string,hash?:string){
 const key=base+'/'+path;if(!cache.has(key)){if(cache.size>100)cache.delete(cache.keys().next().value!);cache.set(key,(async()=>{
 const r=await fetch(key,{cache:'no-store'});if(!r.ok)throw Error('Evaluation search is unavailable. Check your access and try again.');const b=await r.arrayBuffer();
 if(hash){const actual=[...new Uint8Array(await crypto.subtle.digest('SHA-256',b))].map(n=>n.toString(16).padStart(2,'0')).join('');if(actual!==hash)throw Error('Evaluation search does not match this release.');}
 const decoded=path.endsWith('.bin')?await new Response(new Blob([b]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer():b;
 const d=JSON.parse(new TextDecoder().decode(decoded));if(d.releaseId!==release)throw Error('Evaluation search release mismatch');return d;
 })().catch(e=>{cache.delete(key);throw e;}));}return cache.get(key)!;
}
self.onmessage=async({data})=>{const run=++sequence;try{
 const base=data.base+'/search',m=await json(base,'manifest.json'),words=parseQuery(data.query).flat();
 if(!words.length){self.postMessage({id:data.id,total:0,results:[],pages:1,page:1});return;}
 const groups=[];
 for(const category of data.categories as string[]){
 const i=await json(base,`${category}.bin`,m.files[`${category}.bin`]) as SearchIndex,postings:Record<string,string>={};
 for(const bucket of [...new Set(words.map(tokenBucket))]){const path=i.postingShards![bucket];const s=await json(base,path,m.files[path]) as PostingShard;for(const word of words)if(Object.hasOwn(s.postings,word))postings[word]=s.postings[word];}
 groups.push(...queryIndex({...i,postings},data.query).filter(g=>!data.work||g.doc.id.startsWith(data.work+':')));if(run!==sequence)return;
 }
 const all=sortGroups(groups),pages=Math.max(1,Math.ceil(all.length/20)),page=Math.min(pages,Math.max(1,data.page||1));
 const results=await Promise.all(all.slice((page-1)*20,page*20).map(async g=>{const s=await json(base,g.doc.shard,m.files[g.doc.shard]) as TextShard;return {...g,preview:excerpt(s.documents[g.doc.id][g.matches[0]].text,data.query)};}));
 if(run===sequence)self.postMessage({id:data.id,total:all.length,results,pages,page});
 }catch(e){if(run===sequence)self.postMessage({id:data.id,error:e instanceof Error?e.message:'Search failed.'});}};
