import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {abbottEntries,loadAbbottIndex,resolveAbbott,abbottRelease,type AbbottIndex} from '../app/lib/domain/abbott-smith.ts';
globalThis.fetch=(async(url:string|URL|Request)=>{try{return new Response(await readFile(`app/public${String(url)}`))}catch{return new Response('',{status:404})}}) as typeof fetch;
test('Abbott-Smith links exact lemma and source number, preserves numbered senses and historical counts',async()=>{
 const entries=await abbottEntries('λόγος','3056');assert.equal(entries.length,1);
 assert.equal(entries[0].sourceKey,'λόγος|G3056');assert.deepEqual(entries[0].historicalNtCounts,['330']);
 assert.ok(entries[0].paragraphs.some(p=>p.startsWith('I.')));assert.ok(entries[0].paragraphs.some(p=>p.includes('Mt 8:8')));
 assert.deepEqual(await abbottEntries('λόγος','26'),[]);assert.deepEqual(await abbottEntries('λογος','3056'),[]);
 assert.deepEqual(await abbottEntries('ἀγάπη'.normalize('NFD'),'26'),await abbottEntries('ἀγάπη','26'));
});
test('standalone headword browsing and token matching retain extended identifiers and ambiguity',()=>{
 const ref=(id:string,strongs:string[])=>({id,shard:'00',headword:'λόγος',strongs});
 const index:AbbottIndex={entryCount:6153,headwords:{'λόγος':[ref('a00001',['G1']),ref('a00002',['G1a']),ref('a00003',[])]}};
 assert.equal(resolveAbbott(index,'λόγος').length,3);
 assert.deepEqual(resolveAbbott(index,'λόγος','G0001 5633').map(e=>e.id),['a00001','a00003']);
 assert.deepEqual(resolveAbbott(index,'λόγος','G1a').map(e=>e.id),['a00002','a00003']);
 assert.deepEqual(resolveAbbott(index,'λόγος','1').map(e=>e.id),['a00001','a00003']);
 assert.deepEqual(resolveAbbott(index,'λό-γος','1'),[]);
});
test('full source entry inventory and original rights evidence remain available offline',async()=>{
 const index=await loadAbbottIndex();assert.equal(index.entryCount,6153);
 const ids=new Set(Object.values(index.headwords).flat().map(e=>e.id));assert.equal(ids.size,6153);
 assert.ok(Object.values(index.headwords).flat().some(e=>e.strongs.includes('G901a')));
 const base=`app/public/lexical/${abbottRelease}`;
 assert.match(await readFile(`${base}/SOURCE-README.md`,'utf8'),/including the marked up version in this repository, is in the public domain/);
 assert.match(await readFile(`${base}/NOTICE.txt`,'utf8'),/not Ad Fontes corpus occurrence totals/);
});
test('failed entry requests are retryable rather than treated as unmatched headwords',async()=>{
 const previous=globalThis.fetch;let calls=0;globalThis.fetch=(async()=>{calls++;return new Response('',{status:503})}) as typeof fetch;
 try{await assert.rejects(abbottEntries('χάρις','5485'),/could not be loaded/);await assert.rejects(abbottEntries('χάρις','5485'),/could not be loaded/);assert.ok(calls>=2)}finally{globalThis.fetch=previous}
 assert.equal((await abbottEntries('χάρις','5485'))[0].sourceKey,'χάρις|G5485');
});

test('dictionary sense styling recognizes only explicit markers without modifying source text',async()=>{
 const {dictionaryParagraphClass}=await import('../app/lib/dictionary-presentation.ts');
 for(const text of ['1. Of men’s love:', '2. Of divine love;', '12. Another sense'])assert.equal(dictionaryParagraphClass(text),'dictionary-sense');
 for(const text of ['(a) to one another, Jo 13:35;', '(b) to God.'])assert.equal(dictionaryParagraphClass(text),'dictionary-subpoint');
 for(const text of ['Ro 5:8.','1904. Historical text','1 be created','1.2 nested citation','(cf. source)',' 1. Ambiguous indentation'])assert.equal(dictionaryParagraphClass(text),undefined,text);
});
