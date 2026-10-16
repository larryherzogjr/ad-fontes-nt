/** Derive search only from active public projections. Never scan raw/draft directories. */
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { gzipSync } from '../app/node_modules/fflate/esm/browser.js';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { unified } from '../app/node_modules/unified/index.js';
import remarkParse from '../app/node_modules/remark-parse/index.js';
import { passageUrl } from '../app/lib/domain/references.ts';
import { tokenize, encodePostings, tokenBucket, searchRelease, type SearchBlock, type SearchDoc, type SearchIndex } from '../app/lib/domain/library-search.ts';

const root=fileURLToPath(new URL('..',import.meta.url)), pub=join(root,'app/public'), destination=join(pub,'library/search',searchRelease);
const inputs: Record<string,string>={}, files: Record<string,string>={};
const pinPath=join(root,'content/library-search',searchRelease,'manifest.json');
const pin=await readFile(pinPath,'utf8').then(JSON.parse).catch(e=>{if(e.code==='ENOENT')return null;throw e;});
const sha=(bytes: string|Uint8Array)=>createHash('sha256').update(bytes).digest('hex');
async function read(path:string) { const bytes=await readFile(join(pub,path));inputs[path]=sha(bytes);return JSON.parse(bytes.toString()); }
async function output(path:string,value:unknown) { const bytes=gzipSync(Buffer.from(JSON.stringify(value)+'\n'),{level:9,mtime:0});files[path]=sha(bytes);await mkdir(join(destination,path,'..'),{recursive:true});await writeFile(join(destination,path),bytes); }
function plain(node:any):string { if(node.type==='html')return '';if(typeof node.value==='string')return node.value;if(node.type==='break')return '\n';return (node.children||[]).map(plain).join(['list','listItem','blockquote'].includes(node.type)?'\n':''); }
function markdownBlocks(markdown:string):SearchBlock[] { const tree=unified().use(remarkParse).parse(markdown);return tree.children.filter((n:any)=>!['html','definition'].includes(n.type)).map((node:any)=>({text:plain(node),markdown:markdown.slice(node.position.start.offset,node.position.end.offset)})).filter(b=>b.text.trim()); }
await rm(destination,{recursive:true,force:true});await mkdir(destination,{recursive:true});
const counts:Record<string,{documents:number;blocks:number}>={};
async function collection(id:string, populate:(add:(doc:Omit<SearchDoc,'blocks'|'collection'>,body:SearchBlock[])=>void)=>Promise<void>) {
 const documents:SearchDoc[]=[], blocks:[number,number][]=[], tokens=new Map<string,[number,number][]>(), shards=new Map<string,Record<string,SearchBlock[]>>();
 const add=(doc:Omit<SearchDoc,'blocks'|'collection'>,body:SearchBlock[])=>{
  if(documents.some(d=>d.id===doc.id))throw Error('Duplicate search resource');
  const rows=[{text:doc.title},...body], docId=documents.length;documents.push({...doc,collection:id,blocks:rows.length});
  const shard=shards.get(doc.shard)||{};shard[doc.id]=rows;shards.set(doc.shard,shard);
  rows.forEach((row,locator)=>{const block=blocks.length;blocks.push([docId,locator]);tokenize(row.text).forEach((t,position)=>{const list=tokens.get(t.value)||[];list.push([block,position]);tokens.set(t.value,list);});});
 };
 await populate(add);
 const postingShards=Array.from({length:32},(_,bucket)=>`terms/${id}-${bucket}.bin`);
 const buckets=Array.from({length:32},()=>({} as Record<string,string>));
 for(const [word,positions] of [...tokens].sort(([a],[b])=>a<b?-1:a>b?1:0))buckets[tokenBucket(word)][word]=encodePostings(positions);
 for(let bucket=0;bucket<32;bucket++)await output(postingShards[bucket],{schemaVersion:1,releaseId:searchRelease,collection:id,bucket,postings:buckets[bucket]});
 const index:SearchIndex={schemaVersion:1,releaseId:searchRelease,collection:id,documents,blocks,postings:{},postingShards};
 await output(`${id}.bin`,index);for(const [path,documents] of shards)await output(path,{schemaVersion:1,releaseId:searchRelease,documents});
 counts[id]={documents:documents.length,blocks:blocks.length};
}
const om=JSON.parse(await readFile(join(root,'app/lib/domain/om-release.json'),'utf8'));
for(const [id,release,expected] of [['greek',om.releaseId,250],['hebrew','hebrew-studies-2026-10-09-v2',7]] as const) {
 await collection(id,async add=>{
  const index=await read(`om/${release}/index.json`);if(index.releaseId!==release||index.articles.length!==expected)throw Error('Active article inventory mismatch');
  for(const meta of index.articles) {
   const bundle=await read(`om/${release}/articles/${meta.slug}.json`);if(bundle.releaseId!==release||bundle.article.contentSha256!==meta.contentSha256)throw Error('Article projection mismatch');
   add({id:`${id}:${meta.slug}`,title:meta.title,author:meta.author,release,book:'',sourceUrl:id==='greek'?`/library?view=articles&article=${meta.slug}`:meta.url,shard:`text/${id}.bin`,notice:`Ordinary Means ${id==='greek'?'Greek':'Hebrew'} word study. Quotations remain part of the authored commentary, distinct from the selected Scripture edition.`},markdownBlocks(bundle.article.markdown));
  }
 });
}
await collection('comparisons',async add=>{
 const bundle=await read('editorial/variants.json');if(bundle.units.length!==110||bundle.units.some((u:any)=>u.status!=='approved'))throw Error('Only the approved comparison projection may be indexed');
 for(const u of bundle.units) {const [book,ch]=u.ranges[0].start.split('.');add({id:`comparisons:${u.id}`,title:u.title,author:u.author||'Ordinary Means',release:'approved-variants',book,sourceUrl:passageUrl(u.ranges,'BSB')+`&panel=${u.presentation==='publisher-note'?'notes':'compare'}&unit=${u.id}`,shard:'text/comparisons.bin',notice:'Approved Ordinary Means textual explanation. Edition readings, publisher notes and manuscript evidence remain available in the standard passage viewer.'},[...markdownBlocks(u.significance.sourceObservation),...markdownBlocks(u.significance.interpretation)]);}
});
for(const [id,release,author] of [['lenski','lenski-2026-10-08-v1','R. C. H. Lenski'],['kd','kd-2026-10-08-v1','C. F. Keil and F. Delitzsch']] as const) {
 await collection(id,async add=>{
  const manifest=await read(`commentaries/${release}/manifest.json`);
  for(const path of Object.keys(manifest.files).filter(p=>/^chapters\/.+\.json$/.test(p)).sort((a,b)=>a.split('/')[1]<b.split('/')[1]?-1:a.split('/')[1]>b.split('/')[1]?1:parseInt(a.split('/')[2])-parseInt(b.split('/')[2]))) {
   const full=`commentaries/${release}/${path}`,chapter=await read(full);if(inputs[full]!==manifest.files[path]||chapter.releaseId!==release)throw Error('Commentary projection hash mismatch');
   add({id:`${id}:${chapter.book}:${chapter.chapter}`,title:`${chapter.name} · ${id==='kd'?'source chapter group':'chapter'} ${chapter.chapter}`,author,release,book:chapter.book,sourceUrl:`/library?view=commentaries&commentary=${id}&commentaryBook=${chapter.book}&commentaryChapter=${chapter.chapter}`,shard:`text/${id}-${chapter.book}.bin`,notice:id==='kd'?'Historical commentary. Source chapter groups may span adjacent chapters; source Hebrew verse numbering is retained. No precise canonical verse alignment is implied.':'Historical Lutheran commentary. Quotations are Lenski’s source text, distinct from the selected Scripture edition and Ordinary Means commentary. Original print page references are unavailable.'},chapter.paragraphs.map((text:string)=>({text})));
  }
 });
}
const implementation:Record<string,string>={};for(const path of ['scripts/build_library_search.mts','app/lib/domain/library-search.ts','app/node_modules/fflate/esm/browser.js'])implementation[path]=sha(await readFile(join(root,path)));
const manifest={schemaVersion:1,releaseId:searchRelease,inputs,implementation,files,counts};
if(pin&&JSON.stringify(pin)!==JSON.stringify(manifest))throw Error('Library search differs from its pinned derivative. Prepare a documented successor release; do not overwrite the pin.');
await writeFile(join(destination,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
console.log(`Library search: ${Object.values(counts).reduce((n,c)=>n+c.documents,0)} resources; ${Object.values(counts).reduce((n,c)=>n+c.blocks,0)} blocks; ${Object.keys(files).length} pinned derivatives.`);

// Retired source projections must not remain directly reachable in web builds.
await rm(join(pub,'library/historical'),{recursive:true,force:true});
for(const release of ['library-search-2026-10-14-v1','library-search-2026-10-14-v2','library-search-2026-10-15-v3','library-search-2026-10-15-v4'])await rm(join(pub,'library/search',release),{recursive:true,force:true});
