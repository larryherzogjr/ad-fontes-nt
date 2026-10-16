import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { gzipSync } from '../../app/node_modules/fflate/esm/browser.js';
import { tokenize, encodePostings, tokenBucket, type SearchDoc } from '../../app/lib/domain/library-search.ts';
const releaseId='evaluation-resources-2026-10-16-v1', base=`private/evaluation/content/${releaseId}`;
const catalog=JSON.parse(await readFile(`${base}/catalog.json`,'utf8'));
const files:Record<string,string>={}, counts:Record<string,{documents:number;blocks:number}>={};
async function output(path:string,value:unknown){const bytes=gzipSync(Buffer.from(JSON.stringify(value)+'\n'),{level:9,mtime:0});files[path]=createHash('sha256').update(bytes).digest('hex');await mkdir(`${base}/search/${path.split('/').slice(0,-1).join('/')}`,{recursive:true});await writeFile(`${base}/search/${path}`,bytes);}
for(const category of ['boc','luther','concordia']) {
 const documents:SearchDoc[]=[],blocks:[number,number][]=[],tokens=new Map<string,[number,number][]>();
 for(const work of catalog.works.filter((w:any)=>w.category===category)) {
  const texts:Record<string,{text:string}[]>={};
  for(const section of work.sections) {
   const data=JSON.parse(await readFile(`${base}/${section.path}`,'utf8'));
   const rows=[{text:`${work.title} · ${section.title}`},...data.text.split(/\n\s*\n/u).filter((text:string)=>text.trim()).map((text:string)=>({text}))];
   const docId=documents.length,id=`${work.id}:${section.id}`;
   documents.push({id,collection:category,title:rows[0].text,author:data.author || (category==='luther'?'Martin Luther':''),release:releaseId,book:'',sourceUrl:`/library?view=${category==='concordia'?'commentaries&commentary=concordia':'confessional'}&work=${work.id}&section=${section.id}`,shard:`text/${work.id}.bin`,blocks:rows.length,notice:catalog.notice});
   texts[id]=rows;
   rows.forEach((row,locator)=>{const block=blocks.length;blocks.push([docId,locator]);for(const [position,t] of tokenize(row.text).entries()){const list=tokens.get(t.value)||[];list.push([block,position]);tokens.set(t.value,list);}});
  }
  await output(`text/${work.id}.bin`,{schemaVersion:1,releaseId,documents:texts});
 }
 const postingShards=Array.from({length:32},(_,bucket)=>`terms/${category}-${bucket}.bin`),buckets=Array.from({length:32},()=>({} as Record<string,string>));
 for(const [word,positions] of [...tokens].sort(([a],[b])=>a<b?-1:a>b?1:0))buckets[tokenBucket(word)][word]=encodePostings(positions);
 for(let bucket=0;bucket<32;bucket++)await output(postingShards[bucket],{schemaVersion:1,releaseId,collection:category,bucket,postings:buckets[bucket]});
 await output(`${category}.bin`,{schemaVersion:1,releaseId,collection:category,documents,blocks,postings:{},postingShards});
 counts[category]={documents:documents.length,blocks:blocks.length};
}
const manifest={schemaVersion:1,releaseId,files,counts},pin=`content/evaluation/${releaseId}/search-manifest.json`;
let existing;try{existing=JSON.parse(await readFile(pin,'utf8'));}catch(e:any){if(e.code!=='ENOENT')throw e;}
if(existing && JSON.stringify(existing)!==JSON.stringify(manifest))throw Error('Evaluation search differs from its pinned derivative. Prepare a successor.');
if(!existing){if(!process.argv.includes('--prepare'))throw Error('Missing evaluation search pin');await writeFile(pin,JSON.stringify(manifest)+'\n');}
await writeFile(`${base}/search/manifest.json`,JSON.stringify(manifest)+'\n');
console.log(counts);
