import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {historicalRelease,historicalBase,historicalCatalogHash,historicalUrl,loadHistoricalCatalog,loadHistoricalSection,loadHistoricalScan} from '../app/lib/domain/historical-library.ts';
import {searchRelease,queryIndex} from '../app/lib/domain/library-search.ts';
const pub=new URL('../app/public/',import.meta.url);
const path=`library/historical/${historicalRelease}`;
const bytes=await readFile(new URL(`${path}/catalog.json`,pub));
const catalog=JSON.parse(bytes.toString());
const pin=JSON.parse(await readFile(new URL(`../content/historical-library/${historicalRelease}/manifest.json`,import.meta.url),'utf8'));
const digest=(value:Uint8Array|string)=>createHash('sha256').update(value).digest('hex');
const section=async(work:any,meta:any)=>JSON.parse(await readFile(new URL(`${path}/${meta.path}`,pub),'utf8'));

test('historical collection has seven works with pinned originals, source notices and complete output hashes',async()=>{
 assert.equal(digest(bytes),historicalCatalogHash);assert.equal(catalog.works.length,7);assert.equal(pin.sectionCount,783);
 for(const [file,hash] of Object.entries(pin.source.files))assert.equal(digest(await readFile(new URL(`../sources/historical-library/${historicalRelease}/${file}`,import.meta.url))),hash,file);
 for(const [file,hash] of Object.entries(pin.files))assert.equal(digest(await readFile(new URL(`${path}/${file}`,pub))),hash,file);
 assert.equal(digest(await readFile(new URL('../scripts/import_historical_library.py',import.meta.url))),pin.implementation['scripts/import_historical_library.py']);
 const notices=await readFile(new URL(`${path}/notices.txt`,pub),'utf8');assert.match(notices,/FULL PROJECT GUTENBERG.*LICENSE/);assert.match(notices,/No CCEL text or digital edition is used/);
 for(const work of catalog.works){assert.equal(work.sections.length,work.expectedSections);for(const meta of work.sections){const data=await section(work,meta);assert.equal(data.work,work.id);assert.equal(data.id,meta.id);assert.equal(digest(data.paragraphs.join('\n\n')),data.textSha256);}}
});

test('Josephus retains every original body character, including lost prefaces, Roman chapter V and distinct translator notes',async()=>{
 for(const [id,slug] of [[2846,'life'],[2848,'antiquities'],[2849,'apion'],[2850,'wars']] as const){
  const raw=(await readFile(new URL(`../sources/historical-library/${historicalRelease}/raw/${id}.txt`,import.meta.url),'utf8')).replace(/\r\n/g,'\n');
  const start=/^\*\*\* START OF[^\n]+\*\*\*/m.exec(raw)!,end=/^\*\*\* END OF[^\n]+\*\*\*/m.exec(raw)!;
  const work=catalog.works.find((w:any)=>w.id===`josephus-${slug}`);let body='';for(const meta of work.sections)body+=(await section(work,meta)).paragraphs.join('\n\n');
  assert.equal(body,raw.slice(start.index+start[0].length,end.index),slug);
  assert.ok(work.sections.some((s:any)=>s.label==='Translator footnotes'));
 }
 const wars=catalog.works.find((w:any)=>w.id==='josephus-wars');assert.equal(wars.sections.filter((s:any)=>s.label==='CHAPTER V.').length,2);
 const antiquities=catalog.works.find((w:any)=>w.id==='josephus-antiquities');assert.ok(antiquities.sections.some((s:any)=>s.label==='Preface'));
});

test('Walther uses dated lecture starts; Krauth VI heading and Edersheim source layers are retained correctly',async()=>{
 const walther=catalog.works.find((w:any)=>w.id==='walther');assert.equal(walther.sections.length,40);
 const labels=['First','Second','Third'];for(let i=1;i<40;i++){const data=await section(walther,walther.sections[i]);assert.match(data.paragraphs.join('\n\n'),/^\([A-Za-z]+ \d{1,2}\s*[,.]\s*18[8S][45]\.\)/);if(i<=3)assert.equal(data.label,`${labels[i-1]} Evening Lecture`);}
 const krauth=catalog.works.find((w:any)=>w.id==='krauth');const fifth=(await section(krauth,krauth.sections[5])).paragraphs.join('\n\n'),sixth=(await section(krauth,krauth.sections[6])).paragraphs.join('\n\n');
 assert.doesNotMatch(fifth,/VI\.\n\nTHE CONFESSIONS/);assert.match(sixth,/^VI\.\n\nTHE CONFESSIONS/);
 const edersheim=catalog.works.find((w:any)=>w.id==='edersheim');assert.match(edersheim.edition,/1899/);assert.match(edersheim.notice,/unproofread/);
 assert.equal(edersheim.sections.length,141);assert.ok(edersheim.sections.some((s:any)=>s.id==='appendix-13'));
 assert.ok(edersheim.sections.some((s:any)=>s.id==='s0129'&&s.label.startsWith('Index II')));

});

test('historical search indexes every source section exactly and retains all predecessor search inputs and decoded payloads',async()=>{
 const base=new URL(`library/search/${searchRelease}/`,pub),manifest=JSON.parse(await readFile(new URL('manifest.json',base),'utf8'));
 const prior=JSON.parse(await readFile(new URL('../content/library-search/library-search-2026-10-14-v2/manifest.json',import.meta.url),'utf8'));
 for(const [file,hash] of Object.entries(prior.inputs))assert.equal(manifest.inputs[file],hash,file);
 const legacy=JSON.parse(await readFile(new URL(`../content/library-search/${searchRelease}/predecessor-decoded.json`,import.meta.url),'utf8'));
 for(const [file,hash] of Object.entries(legacy.files)){const obj=JSON.parse(gunzipSync(await readFile(new URL(file,base))).toString());obj.releaseId='library-search-2026-10-15-v3';assert.equal(digest(JSON.stringify(obj)),hash,file);}
 const load=async(file:string)=>JSON.parse(gunzipSync(await readFile(new URL(file,base))).toString());
 for(const collection of ['walther','krauth','josephus','edersheim']){
  const index=await load(`${collection}.bin`);for(const file of index.postingShards)Object.assign(index.postings,(await load(file)).postings);
  assert.ok(queryIndex(index,'God').length>0);assert.equal(queryIndex(index,'God','MAT').length,0,'No guessed Bible-book association');
  for(const doc of index.documents){const [,id,sid]=doc.id.split(':');const work=catalog.works.find((w:any)=>w.id===id),meta=work.sections.find((s:any)=>s.id===sid),data=await section(work,meta),text=await load(doc.shard);assert.deepEqual(text.documents[doc.id].slice(1).map((b:any)=>b.text),data.paragraphs);assert.equal(doc.sourceUrl,historicalUrl(id,sid));}
 }
});

test('historical loaders distinguish missing, malformed and corrupt data from empty content',async()=>{
 const fetch=globalThis.fetch;
 try{
  globalThis.fetch=async()=>new Response('missing',{status:404});await assert.rejects(loadHistoricalCatalog(),/could not be loaded/);
  globalThis.fetch=async()=>new Response('{}');await assert.rejects(loadHistoricalCatalog(),/does not match/);
  globalThis.fetch=async(input)=>new Response(await readFile(new URL(String(input).slice(1),pub)));const value=await loadHistoricalCatalog();const work=value.works[0],meta=work.sections[1];assert.equal((await loadHistoricalSection(work,meta)).id,meta.id);
  const ed=value.works.find(w=>w.id==='edersheim')!,scan=(await loadHistoricalSection(ed,ed.sections[0])).pages![0];assert.ok((await loadHistoricalScan(scan)).size>1000);
  globalThis.fetch=async()=>new Response('{}');await assert.rejects(loadHistoricalScan(scan),/does not match/);
  globalThis.fetch=async()=>new Response('missing',{status:404});await assert.rejects(loadHistoricalScan(scan),/could not be loaded/);
  globalThis.fetch=async()=>new Response('{}');await assert.rejects(loadHistoricalSection(work,meta),/does not match/);
 }finally{globalThis.fetch=fetch;}
 assert.equal(historicalBase,`/library/historical/${historicalRelease}`);
});


test('Toronto OCR covers each included physical line once and every block points to its exact pinned printed page',async()=>{
 const source=new URL(`../sources/historical-library/${historicalRelease}/`,import.meta.url);
 const toronto=JSON.parse(await readFile(new URL('toronto.json',source),'utf8'));
 const links=JSON.parse(await readFile(new URL('legacy-links.json',source),'utf8'));
 const work=catalog.works.find((w:any)=>w.id==='edersheim');
 assert.equal(Object.keys(links).length,129);assert.equal(Object.keys(toronto.pages).length,1559);
 for(const volume of [1,2]){
  const raw=(await readFile(new URL(`raw/volume-${volume}.txt`,source),'utf8')).split(/\r?\n/);if(raw.at(-1)==='')raw.pop();
  const coverage=new Uint8Array(raw.length);
  for(const range of [...toronto.ledger.units,...toronto.ledger.exclusions].filter((u:any)=>u.volume===volume))for(let i=range.startLine-1;i<range.endLine;i++)coverage[i]++;
  assert.ok(coverage.every(n=>n===1),'No omitted or multiply assigned source lines');
  for(const unit of toronto.ledger.units.filter((u:any)=>u.volume===volume)){
   const meta=work.sections.find((m:any)=>m.id===(links[unit.key]||unit.key)),data=await section(work,meta);
   assert.deepEqual(data.paragraphs.flatMap((p:string)=>p.split('\n')),raw.slice(unit.startLine-1,unit.endLine).filter((p:string)=>p.trim()));
   assert.deepEqual(data.paragraphPageIds,unit.pageText.map((c:any)=>c.pageId));
   for(let i=0;i<data.pages.length;i++){assert.equal(data.pages[i].id,data.paragraphPageIds[i]);assert.deepEqual(data.pages[i],toronto.pages[data.pages[i].id]);}
  }
 }
 const predecessor=JSON.parse(await readFile(new URL('../content/historical-library/historical-library-2026-10-15-v1/manifest.json',import.meta.url),'utf8'));
 for(const other of catalog.works.filter((w:any)=>w.id!=='edersheim'))for(const meta of other.sections){const data=await section(other,meta);data.releaseId=predecessor.releaseId;assert.equal(digest(JSON.stringify(data,null,2)+'\n'),predecessor.files[meta.path],meta.path);}
 const shard=JSON.parse(gunzipSync(await readFile(new URL(`library/search/${searchRelease}/text/edersheim-edersheim.bin`,pub))).toString());
 for(const meta of work.sections){const data=await section(work,meta),blocks=shard.documents[`edersheim:edersheim:${meta.id}`];assert.deepEqual(blocks.slice(1).map((b:any)=>b.scanPage),data.paragraphPageIds);}
});


test('predecessor historical and search release pins and implementation evidence remain byte-identical',async()=>{
 const prior='historical-library-2026-10-15-v1';
 const manifestBytes=await readFile(new URL(`../content/historical-library/${prior}/manifest.json`,import.meta.url));assert.equal(digest(manifestBytes),'e2137d8b69d5c095352de1d4b1717999122fd5344f949842e1ea5d5bf09fb884');
 const old=JSON.parse(manifestBytes.toString());assert.equal(digest(await readFile(new URL(`../content/historical-library/${prior}/evidence/import_historical_library.py`,import.meta.url))),old.implementation['scripts/import_historical_library.py']);
 const search='library-search-2026-10-15-v3',searchBytes=await readFile(new URL(`../content/library-search/${search}/manifest.json`,import.meta.url));assert.equal(digest(searchBytes),'00ea94f60cb2d239666a8583e31d62455520985cabfa67c46190611abf1dae75');
 const implementation=JSON.parse(searchBytes.toString()).implementation;
 for(const path of ['scripts/build_library_search.mts','app/lib/domain/library-search.ts','app/lib/domain/historical-library.ts'])assert.equal(digest(await readFile(new URL(`../content/library-search/${search}/evidence/${path.split('/').at(-1)}`,import.meta.url))),implementation[path]);
});
