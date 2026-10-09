import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {sourceManifest,sourceBook,sourceUrl,searchSource,hebrewOccurrences,foldHebrew,englishContext,originalData,type HebrewIndex} from '../app/lib/domain/original-languages.ts';
globalThis.fetch=(async(url:string|URL|Request)=>{try{return new Response(await readFile(`app/public${String(url)}`))}catch{return new Response('',{status:404})}}) as typeof fetch;
test('both original-language editions validate full source coverage and reject unsupported books',async()=>{
 for(const ed of ['WLC','CVUL'] as const){const m=await sourceManifest(ed);for(const meta of m.books){const b=await sourceBook(ed,meta.code);assert.equal(b.chapters.length,meta.chapters.length)}}
 await assert.rejects(sourceBook('WLC','TOB'),/not included/);await assert.rejects(sourceBook('CVUL','../x'),/not included/);
 assert.equal((await sourceBook('CVUL','DAN')).chapters.length,14);
 assert.equal((await sourceBook('WLC','JOL')).chapters.length,4);
});
test('Hebrew search ignores pointing without conflating morphology or source numbering',async()=>{
 assert.equal(foldHebrew('תָּם'),'תם');const hits=await searchSource('WLC','חנם');assert.ok(hits.some(h=>h.book==='JOB'&&h.chapter===1&&h.verse===9));
 const psa=await sourceBook('WLC','PSA');const ch=psa.chapters.find(c=>c.chapter===51)!;assert.deepEqual(englishContext(ch.verses[1]),[]);assert.equal(englishContext(ch.verses[2])[0].reference,'PSA.51.1');
 assert.ok((await searchSource('CVUL','In principio')).some(h=>h.book==='JHN'));assert.deepEqual(await searchSource('WLC',' '),[]);
});
test('Hebrew explorer retains source lemma distinctions and resolves author studies',async()=>{
 const idx=await originalData<HebrewIndex>('hebrew-index.json');assert.equal(idx.articles.length,7);assert.equal(idx.tokenCount,305507);assert.ok(idx.lemmas.some(l=>l.key==='H1350a'));
 const tam=await hebrewOccurrences('H8535');assert.ok(tam.occurrences.some(o=>o.reference==='JOB.1.1'));
 await assert.rejects(hebrewOccurrences('../notice'),/Unknown/);
 assert.match(sourceUrl('WLC','JOB',1,1,'token'),/translation=WLC&verses=1&word=token$/);
});

test('Hebrew explorer return links preserve reader selections and reject external destinations',async()=>{
 const {hebrewUrl,hebrewReturn,hebrewExplorerReturn}=await import('../app/lib/domain/original-languages.ts');
 const reader=sourceUrl('WLC','JOB',1,1,'18aPd')+'&parallel=1';
 const link=hebrewUrl('H8535',reader);assert.equal(new URL(link,'https://local').searchParams.get('returnTo'),reader);
 assert.equal(hebrewReturn('https://evil.test/read/JOB/1?translation=WLC'),'');assert.equal(hebrewReturn('/read/JOB/1?translation=CVUL'),'');
 assert.equal(hebrewExplorerReturn('/library?view=hebrew&hebrew=H8535&page=2'),'/library?view=hebrew&hebrew=H8535&page=2');
 assert.equal(hebrewExplorerReturn('//evil.test/library?view=hebrew'),'');
});

test('seven BSB Hebrew adaptations preserve source pins and resolve related Greek studies offline',async()=>{
 const {createHash}=await import('node:crypto');
 const base='sources/om-hebrew/hebrew-studies-2026-10-09-v2';const manifest=JSON.parse(await readFile(`${base}/manifest.json`,'utf8'));
 const greekRelease=JSON.parse(await readFile('app/lib/domain/om-release.json','utf8'));
 const greek=JSON.parse(await readFile(`app/public/om/${greekRelease.releaseId}/index.json`,'utf8'));
 assert.equal(manifest.articles.length,7);
 for(const article of manifest.articles){
  const raw=await readFile(`${base}/adapted/${article.slug}.md`,'utf8');assert.equal(createHash('sha256').update(raw).digest('hex'),article.contentSha256);
  const original=await readFile(`sources/om-hebrew/${manifest.predecessor}/raw/${article.slug}.md`);
  assert.equal(createHash('sha256').update(original).digest('hex'),article.sourceSha256);
  assert.doesNotMatch(raw,/\bNET\b/);
  const output=JSON.parse(await readFile(`app/public/om/${manifest.releaseId}/articles/${article.slug}.json`,'utf8'));
  assert.equal(output.article.markdown,raw.split('---').slice(2).join('---').replace(/^[\r\n]+/,''));
  for(const link of output.article.markdown.matchAll(/\]\((\/greek\/[^)]+)\)/g))assert.ok(greek.articles.some((a:{url:string})=>a.url===`https://larryherzogjr.com${link[1]}`),link[1]);
 }
 for(const [path,hash] of Object.entries(manifest.outputs))assert.equal(createHash('sha256').update(await readFile(`app/public/om/${manifest.releaseId}/${path}`)).digest('hex'),hash);
});

test('Hebrew study pane reverses source mappings and preserves original token identities',async()=>{
 const {hebrewPassage}=await import('../app/lib/domain/original-languages.ts');
 const job=await hebrewPassage([{start:'JOB.1.1',end:'JOB.1.2'}]);assert.deepEqual(job.missing,[]);assert.deepEqual(job.verses.map(v=>v.reference),['JOB.1.1','JOB.1.2']);assert.ok(job.verses[0].tokens.some(t=>t.id==='18aPd'&&t.keys.includes('H8535')));
 const psalm=await hebrewPassage([{start:'PSA.51.1',end:'PSA.51.1'}]);assert.deepEqual(psalm.verses.map(v=>v.reference),['PSA.51.3']);
 const joel=await hebrewPassage([{start:'JOL.2.28',end:'JOL.2.28'}]);assert.deepEqual(joel.verses.map(v=>v.reference),['JOL.3.1']);
 const gen=await hebrewPassage([{start:'GEN.31.55',end:'GEN.31.55'}]);assert.deepEqual(gen.verses.map(v=>v.reference),['GEN.32.1']);
 const nt=await hebrewPassage([{start:'JHN.1.1',end:'JHN.1.1'}]);assert.equal(nt.verses.length,0);assert.deepEqual(nt.missing,['JHN.1.1']);
});

test('independent source chapters do not claim alignment to Latin or LXX2012',async()=>{
 const {hebrewSourceChapter,hebrewReturn}=await import('../app/lib/domain/original-languages.ts');
 const data=await hebrewSourceChapter('JOB',1);assert.equal(data.verses.length,22);assert.ok(data.verses.every(v=>v.anchors.length===0));
 await assert.rejects(hebrewSourceChapter('JOL',5));
 assert.equal(hebrewReturn('/read/JOB/1?translation=BSB&panel=hebrew&hebrewToken=18aPd'),'/read/JOB/1?translation=BSB&panel=hebrew&hebrewToken=18aPd');
});


test('Hebrew study quotations and excerpts match the pinned BSB authority',async()=>{
 const {createHash}=await import('node:crypto');
 const base='sources/om-hebrew/hebrew-studies-2026-10-09-v2';
 const manifest=JSON.parse(await readFile(`${base}/manifest.json`,'utf8'));
 const source=await readFile(manifest.bsbSource.path);
 assert.equal(createHash('sha256').update(source).digest('hex'),manifest.bsbSource.sha256);
 const verses=new Map(source.toString('utf8').split(/\r?\n/).filter(l=>l.includes('\t')).map(l=>{const i=l.indexOf('\t');return [l.slice(0,i),l.slice(i+1).trim()]}));
 const quotes=JSON.parse(await readFile(`${base}/quotations.json`,'utf8'));
 for(const q of quotes){
  const text=Array.from({length:q.end-q.start+1},(_,i)=>verses.get(`${q.book} ${q.chapter}:${q.start+i}`)).join(' ');
  assert.ok(text.includes(q.text),`${q.slug}: ${q.book} ${q.chapter}:${q.start}`);
  const article=JSON.parse(await readFile(`app/public/om/${manifest.releaseId}/articles/${q.slug}.json`,'utf8'));
  assert.ok(article.article.markdown.includes(q.text));
 }
 const ed=JSON.parse(await readFile(`app/public/om/${manifest.releaseId}/articles/ed.json`,'utf8')).article.markdown;
 assert.match(ed,/My friends are my scoffers/);
 assert.doesNotMatch(ed,/My intercessor is my friend/);
});
