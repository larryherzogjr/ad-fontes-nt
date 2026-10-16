import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { gunzipSync } from 'node:zlib';
import { tokenize, parseQuery, textMatches, matchRanges, encodePostings, decodePostings, queryIndex, searchRelease, checkedJson, type SearchIndex } from '../app/lib/domain/library-search.ts';
const base=new URL(`../app/public/library/search/${searchRelease}/`,import.meta.url);
const manifest=JSON.parse(await readFile(new URL('manifest.json',base),'utf8'));
const cache=new Map<string,any>();
const load=async(path:string)=>{if(cache.has(path))return cache.get(path);const bytes=await readFile(new URL(path,base));const obj=JSON.parse(path.endsWith('.bin')?gunzipSync(bytes).toString():bytes.toString());if(obj.postingShards)for(const shard of obj.postingShards){Object.assign(obj.postings,(await load(shard)).postings);}cache.set(path,obj);return obj;};

test('search words, quoted phrases, punctuation and original Unicode offsets',()=>{
 assert.deepEqual(parseQuery('baptism "forgiveness of sins"'),[['baptism'],['forgiveness','of','sins']]);
 assert.equal(textMatches('BAPTISM and forgiveness.',parseQuery('baptism forgiveness')),true);
 assert.equal(textMatches('unfaithful',parseQuery('faith')),false);
 assert.equal(textMatches('forgiveness of all sins',parseQuery('"forgiveness of sins"')),false);
 assert.equal(textMatches('forgiveness, of sins',parseQuery('"forgiveness of sins"')),true);
 const text='A cafe\u0301 and café.';const spans=matchRanges(text,'cafe');assert.deepEqual(spans.map(([a,b])=>text.slice(a,b)),['cafe\u0301','café']);
 assert.throws(()=>parseQuery('"unclosed'),/Close/);assert.throws(()=>parseQuery('x'.repeat(251)),/250/);
});
test('compact postings preserve positions and phrases stay in one block',()=>{
 const rows=['faith faith hope','faith and hope','faithful hope'];const postings:Record<string,[number,number][]>=Object.create(null);
 rows.forEach((text,block)=>tokenize(text).forEach((t,p)=>(postings[t.value]??=[]).push([block,p])));
 const index:SearchIndex={schemaVersion:1,releaseId:searchRelease,collection:'greek',documents:rows.map((_,i)=>({id:String(i),collection:'greek',title:'Resource',author:'Author',release:'test',book:'',sourceUrl:'/library',shard:'text.json',blocks:1,notice:''})),blocks:rows.map((_,i)=>[i,0]),postings:Object.fromEntries(Object.entries(postings).map(([word,p])=>[word,encodePostings(p)]))};
 assert.equal(queryIndex(index,'faith hope').length,2);assert.equal(queryIndex(index,'"faith hope"').length,1);
 assert.equal(queryIndex(index,'faith hope').find(g=>g.doc.id==='0')!.score,50);
 assert.equal(queryIndex(index,'"faith faith"').length,1);assert.equal(queryIndex(index,'constructor').length,0);
 assert.deepEqual([...decodePostings(index.postings.faith,3).get(0)!],[0,1]);assert.throws(()=>decodePostings('gA==',3),/Invalid/);
});
test('search indexes contain all and only active published inventories and exact source prose',async()=>{
 const pin=JSON.parse(await readFile(new URL(`../content/library-search/${searchRelease}/manifest.json`,import.meta.url),'utf8'));assert.deepEqual(manifest,pin);
 for(const [path,hash] of Object.entries(manifest.implementation)){assert.equal(createHash('sha256').update(await readFile(new URL(`../${path}`,import.meta.url))).digest('hex'),hash,path);}
 for(const [path,hash] of Object.entries(manifest.inputs)){assert.equal(createHash('sha256').update(await readFile(new URL(`../app/public/${path}`,import.meta.url))).digest('hex'),hash,path);}
 assert.equal(manifest.counts.greek.documents,250);assert.equal(manifest.counts.hebrew.documents,7);assert.equal(manifest.counts.comparisons.documents,110);assert.equal(manifest.counts.lenski.documents,260);assert.equal(manifest.counts.kd.documents,929);assert.equal(manifest.counts.isbe.documents,9348);assert.equal(manifest.counts.lutheran.documents,2122);
 assert.ok(Object.keys(manifest.inputs).every(p=>!p.split('/').slice(0,-1).some(segment=>segment.includes('candidate')||segment.includes('draft')||segment==='sources')));
 assert.ok(Object.keys(manifest.inputs).filter(p=>p.startsWith('om/om-studies')).every(p=>p.includes('om-studies-2026-09-12-v8')));
 for(const [path,hash] of Object.entries(manifest.files)){const data=await readFile(new URL(path,base));assert.equal(createHash('sha256').update(data).digest('hex'),hash,path);}
 for(const collection of ['lenski','kd']){const index=await load(`${collection}.bin`);for(const doc of index.documents){const shard=await load(doc.shard);const source=JSON.parse(await readFile(new URL(`../app/public/commentaries/${doc.release}/chapters/${doc.book}/${doc.id.split(':')[2]}.json`,import.meta.url),'utf8'));assert.deepEqual(shard.documents[doc.id].slice(1).map((b:any)=>b.text),source.paragraphs,doc.id);}}
});
test('body-only article hits and cross-collection commentary phrases are searchable',async()=>{
 const index=await load('greek.bin');const doc=index.documents.find((d:any)=>d.id==='greek:nekros');const shard=await load(doc.shard);const blocks=shard.documents[doc.id];
 const query='"rescue story"';assert.equal(textMatches(doc.title,parseQuery(query)),false);assert.ok(blocks.some((b:any)=>textMatches(b.text,parseQuery(query))));assert.ok(queryIndex(index,query).some(g=>g.doc.id===doc.id));
 for(const id of ['lenski','kd']){const i=await load(`${id}.bin`);const groups=queryIndex(i,'faith');assert.ok(groups.length>0);const first=groups[0],s=await load(first.doc.shard);assert.ok(first.matches.every(b=>textMatches(s.documents[first.doc.id][b].text,parseQuery('faith'))));assert.ok(queryIndex(i,'faith','GEN').every(g=>g.doc.book==='GEN'));}
});
test('missing or corrupted data fails explicitly instead of yielding empty results',async()=>{
 const original=globalThis.fetch;
 try{globalThis.fetch=async()=>new Response('missing',{status:404});await assert.rejects(checkedJson('missing.json','x'),/could not be loaded/);
 globalThis.fetch=async()=>new Response('{}');await assert.rejects(checkedJson('corrupt.json','0'.repeat(64)),/does not match/);
 }finally{globalThis.fetch=original;}
});


test('both encyclopedia inventories are searchable with exact paragraph context and source labels',async()=>{
 for(const id of ['isbe','lutheran']) {
  const index=await load(`${id}.bin`);
  assert.equal(index.documents.length,id==='isbe'?9348:2122);
  assert.ok(queryIndex(index,'baptism').length>0);
  assert.equal(queryIndex(index,'baptism','ROM').length,0);
  for(const doc of index.documents) {
   const text=await load(doc.shard);
   const article=JSON.parse(await readFile(new URL(`../app/public/library/encyclopedias/${doc.release}/articles/${id}/${doc.id.slice(id.length+1)}.json`,import.meta.url),'utf8'));
   assert.deepEqual(text.documents[doc.id].slice(1).map((b:any)=>b.text),article.paragraphs,doc.id);
  }
 }
 const i=await load('lutheran.bin');
 assert.ok(queryIndex(i,'"standing or a falling church"').some(g=>g.doc.id==='lutheran:justification'));
 assert.equal(i.documents.filter((d:any)=>d.title.startsWith('Predestination · source entry')).length,3);
});


test('encyclopedia successor preserves every predecessor search input and original collection count',async()=>{
 const old=JSON.parse(await readFile(new URL('../content/library-search/library-search-2026-10-15-v5/manifest.json',import.meta.url),'utf8'));
 for(const [path,hash] of Object.entries(old.inputs))assert.equal(manifest.inputs[path],hash,path);
 for(const [id,count] of Object.entries(old.counts))assert.deepEqual(manifest.counts[id],count,id);
 for(const file of ['build_library_search.mts','library-search.ts']) {
  const data=await readFile(new URL(`../content/library-search/library-search-2026-10-15-v5/evidence/${file}`,import.meta.url));
  const original=Object.entries(old.implementation).find(([p])=>p.endsWith('/'+file))!;
  assert.equal(createHash('sha256').update(data).digest('hex'),original[1]);
 }
});
