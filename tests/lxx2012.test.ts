import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {englishLxxManifest,englishLxxBook,englishLxxGreekContext,englishContextsForGreek,searchEnglishLxx,englishLxxUrl} from '../app/lib/domain/lxx-english.ts';
globalThis.fetch=(async (url:string|URL|Request)=>{try{return new Response(await readFile(`app/public${String(url)}`));}catch{return new Response('',{status:404});}}) as typeof fetch;
test('full source edition supports every book without extending the canonical registry',async()=>{
 const m=await englishLxxManifest();assert.equal(m.books.length,54);
 for(const meta of m.books){const b=await englishLxxBook(meta.code);assert.equal(b.chapters.length,meta.chapters.length);for(const ch of meta.chapters)assert.ok((await englishLxxGreekContext(meta,ch)).length,`${meta.code} ${ch}`);}
 await assert.rejects(englishLxxBook('JHN'),/not included/);await assert.rejects(englishLxxBook('../x'),/not included/);
});
test('chapter contexts respect Ezra/Nehemiah, Joel, Malachi and Daniel addition boundaries',async()=>{
 const m=await englishLxxManifest();const context=async(code:string,ch:number)=>(await englishLxxGreekContext(m.books.find(b=>b.code===code)!,ch)).map(v=>v.sourceRef);
 assert.equal((await context('PRO',25))[0],'proverbs/32:1');
 assert.equal((await context('JER',9))[0],'jeremiah-lxx/8:23');
 assert.equal((await context('JER',26))[0],'jeremiah-lxx/25:20');
 assert.equal((await context('NEH',1))[0],'2-esdras/11:1');
 assert.ok((await context('JOL',3)).every(r=>r.startsWith('joel/4:')));
 assert.ok((await context('MAL',4)).every(r=>r.startsWith('malachi/3:')));
 const song=await context('S3Y',1);assert.equal(song.length,67);assert.equal(song[0],'daniel-theodotion/3:24');assert.equal(song.at(-1),'daniel-theodotion/3:90');
 assert.ok((await context('MAN',1)).every(r=>r.startsWith('odes/12:')));
 assert.deepEqual(englishContextsForGreek(m.books,'2-esdras/11:1').map(x=>[x.book.code,x.chapter]),[['NEH',1]]);
 assert.deepEqual(englishContextsForGreek(m.books,'malachi/3:24').map(x=>x.chapter),[3,4]);
 assert.equal(englishContextsForGreek(m.books,'psalms-of-solomon/1:1').length,0);
 assert.deepEqual(englishContextsForGreek(m.books,'tobit-sinaiticus/1:1').map(x=>x.book.code),['TOB']);
});
test('Apocrypha search and source deep links remain independent of canonical verse limits',async()=>{
 const hits=await searchEnglishLxx('Tobiel','TOB');assert.ok(hits.length);assert.ok(hits.every(h=>h.book==='TOB'));
 assert.equal(englishLxxUrl('PSA',151,7),'/read/PSA/151?translation=LXX2012&verses=7');
 assert.deepEqual(await searchEnglishLxx(' '),[]);
});

// These views must use exact source analysis even when English and Greek numbering differ.
test('source study uses interactive source tokens for OT, additions and Apocrypha',async()=>{
 const {sourceGreekStudy}=await import('../app/lib/source-study.ts');
 for(const [code,ch,first] of [['JOB',1,'job-lxx/1:1'],['NEH',1,'2-esdras/11:1'],['S3Y',1,'daniel-theodotion/3:24'],['TOB',1,'tobit/1:1']] as const){
  const verses=await sourceGreekStudy(code,ch);assert.equal(verses[0].sourceRef,first);
  assert.ok(verses.some(v=>v.tokens.length));
  for(const v of verses)for(const t of v.tokens)assert.equal(v.text.slice(t.start,t.end),t.surface);
 }
 await assert.rejects(sourceGreekStudy('JHN',1),/unavailable/);
 await assert.rejects(sourceGreekStudy('JOB',999),/unavailable/);
});
