import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {hebrewDictionary,hebrewLexicalIndex,hebrewLexiconRelease} from '../app/lib/domain/hebrew-lexicon.ts';
globalThis.fetch=(async(url:string|URL|Request)=>{try{return new Response(await readFile(`app/public${String(url)}`))}catch{return new Response('',{status:404})}}) as typeof fetch;
test('Hebrew lexicon joins exact source homographs to distinct BDB entries',async()=>{
 const a=await hebrewDictionary('H1254a'),b=await hebrewDictionary('H1254b');
 assert.equal(a.row?.lexical,'bxy');assert.equal(b.row?.lexical,'bxx');
 assert.notEqual(a.bdb?.id,b.bdb?.id);assert.equal(a.strong?.id,'H1254');assert.equal(b.strong?.id,'H1254');
 assert.equal(a.row?.gloss,'shape');assert.equal(b.row?.gloss,'be fat');
 assert.match(a.strong?.definition||'',/create/);assert.ok(a.bdb!.paragraphs.length>0);
});
test('dictionary coverage follows all preserved WLC keys and discloses unresolved joins',async()=>{
 const index=await hebrewLexicalIndex();const original=JSON.parse(await readFile('app/public/corpus/original-languages-2026-10-09-v1/hebrew-index.json','utf8'));
 assert.deepEqual(index.entries.map(e=>e.key),original.lemmas.map((e:{key:string})=>e.key));
 assert.equal(index.entries.filter(e=>e.mappingNote).length,14);
 for(const key of ['H2030','A3605','H3964']){const e=await hebrewDictionary(key);assert.equal(e.bdb,null);assert.ok(e.row?.mappingNote);}
 const aramaic=await hebrewDictionary('A2');assert.equal(aramaic.strong?.language,'arc');assert.equal(aramaic.row?.language,'arc');
 assert.equal((await hebrewDictionary('H2')).row,null); // no invented cross-language key
 await assert.rejects(hebrewDictionary('../H1'),/Unknown/);
});
test('dictionary sources retain original XML cross-reference text and attribution',async()=>{
 const father=await hebrewDictionary('H1');assert.equal(father.strong?.headword,'אָב');assert.match(father.strong?.definition||'',/father/);
 const base=`app/public/lexical/${hebrewLexiconRelease}`;
 assert.match(await readFile(`${base}/NOTICE.txt`,'utf8'),/Open Scriptures Hebrew Bible Project/);
 assert.match(await readFile(`${base}/NOTICE.txt`,'utf8'),/abridged transcription/);
 assert.match(await readFile(`${base}/SOURCE-README.md`,'utf8'),/Creative Commons Attribution 4.0/);
});
test('dictionary fetch failures remain errors and allow retry',async()=>{
 const previous=globalThis.fetch;let calls=0;
 globalThis.fetch=(async(url:string|URL|Request)=>{calls++;return new Response('',{status:503})}) as typeof fetch;
 // A new key whose dictionary files are not cached.
 try{await assert.rejects(hebrewDictionary('H7225'),/could not be loaded/);await assert.rejects(hebrewDictionary('H7225'),/could not be loaded/);assert.ok(calls>=2)}finally{globalThis.fetch=previous}
 assert.equal((await hebrewDictionary('H7225')).row?.headword,'רֵאשִׁית');
});
