import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';import {createHash} from 'node:crypto';
import {loadConfessions,confessionalGroups,confessionalReadingRanges,confessionRelease,confessionHash,matchingConfessions,confessionLocation} from '../app/lib/domain/confessions.ts';
import {extractConfessionalReferences} from '../app/lib/domain/confessional-references.ts';
import {resolveReference} from '../app/lib/domain/references.ts';
import {buildPacket,defaultPacket,readPacket} from '../app/lib/domain/study-packet.ts';
const raw=await readFile(`app/public/confessions/${confessionRelease}/index.json`,'utf8'),index=await loadConfessions(async()=>raw);
const sha=(v:Buffer|string)=>createHash('sha256').update(v).digest('hex');
const sourceFetch=async(input:any)=>{try{return new Response(await readFile(`app/public${String(input)}`));}catch{return new Response('',{status:404});}};
test('primary English blocks preserve every pinned source heading, paragraph and printed label in order',async()=>{
 const sections=JSON.parse(await readFile(`sources/confessions/${confessionRelease}/section-blocks.json`,'utf8'));
 for(const source of sections){const work=index.documents.find(w=>w.code===source.work)!,section=work.sections.find(s=>s.key===source.section)!;assert.equal(section.sourceUrl,source.sourceUrl);assert.equal(section.paragraphIds.length,source.blocks.length);
 for(let i=0;i<source.blocks.length;i++){const expected=source.blocks[i],p=index.paragraphs.find(p=>p.id===section.paragraphIds[i])!;assert.equal(p.id,expected.id);assert.equal(p.text,expected.text);assert.equal(p.kind,expected.kind);assert.equal(p.ordinal,i+1);assert.equal(p.number,expected.number===null?null:/^\d+$/.test(expected.number)?Number(expected.number):expected.number);assert.ok(!('la' in p)&&!('de' in p));for(const r of p.references)assert.equal(p.text.slice(r.offset,r.offset+r.text.length),r.text);}}
 assert.equal(new Set(index.paragraphs.map(p=>p.id)).size,4431);assert.equal(index.paragraphs.filter(p=>p.kind==='paragraph').length,4123);assert.equal(index.paragraphs.filter(p=>p.kind==='heading').length,308);
 const sc=index.paragraphs.filter(p=>p.work==='sc'&&p.section==='ten-commandments');assert.ok(sc.some(p=>p.text==='Thou shalt have no other gods.'));assert.ok(sc.some(p=>p.text==='Thou shalt not steal.'));assert.ok(sc.some(p=>p.number==='1b'));assert.ok(index.paragraphs.some(p=>p.work==='sc'&&p.section==='creed'&&p.text==='I believe in God the Father Almighty, Maker of heaven and earth.'));assert.ok(index.paragraphs.some(p=>p.work==='sc'&&p.section==='lords-prayer'&&p.text==='Our Father who art in heaven.'));
});
test('immutable archive and active projection pins reproduce exact source bytes and both implementations',async()=>{
 const base='sources/confessions/triglotta-1921-2026-10-14-v1',archive=JSON.parse(await readFile(`${base}/archive-manifest.json`,'utf8')),pin=JSON.parse(await readFile(`sources/confessions/${confessionRelease}/manifest.json`,'utf8'));
 for(const [file,hash] of Object.entries(archive.files))assert.equal(sha(await readFile(`${base}/raw/${file}`)),hash,file);
 assert.equal(sha(await readFile(`${base}/archive-manifest.json`)),pin.sourceManifestSha256);assert.equal(sha(raw),pin.outputSha256);assert.equal(sha(raw),confessionHash);
 assert.equal(sha(await readFile('scripts/build_confessions.mts')),pin.implementationSha256);assert.equal(sha(await readFile('app/lib/domain/confessional-references.ts')),pin.referenceParserSha256);
 const projection=JSON.parse(await readFile(`sources/confessions/${confessionRelease}/projection-manifest.json`,'utf8'));assert.equal(sha(await readFile(`sources/confessions/${confessionRelease}/section-blocks.json`)),projection.sectionBlocksSha256);assert.equal(sha(await readFile('scripts/confessions/prepare_primary.py')),projection.htmlParserSha256);
 const acquisition=JSON.parse(await readFile(`sources/confessions/${confessionRelease}/acquisition.json`,'utf8'));for(const page of acquisition.pages)assert.equal(sha(await readFile(`sources/confessions/${confessionRelease}/${page.file}`)),page.sha256);
 assert.equal(sha(await readFile('sources/ot/releases/ot-english-2026-10-07-v1/whole-bible-registry.json')),pin.registrySha256);
 assert.equal(index.paragraphs.reduce((n,p)=>n+p.references.length,0),1333);assert.equal(index.paragraphs.filter(p=>p.references.length).length,792);assert.equal(pin.unresolved.length,6);
});
test('explicit chapters, verses and lists resolve without following-extent or shorthand guesses',()=>{
 assert.deepEqual(extractConfessionalReferences('Rom. 3 and 4.').references[0].ranges,[...resolveReference('Romans 3'),...resolveReference('Romans 4')]);
 assert.deepEqual(extractConfessionalReferences('Ps. 14:1-3,5:9,140:3,36:1').references[0].ranges,[...resolveReference('Psalms 14:1–3'),...resolveReference('Psalms 5:9'),...resolveReference('Psalms 140:3'),...resolveReference('Psalms 36:1')]);
 assert.deepEqual(extractConfessionalReferences('Rom. 10:3,4').references[0].ranges,[...resolveReference('Romans 10:3'),...resolveReference('Romans 10:4')]);
 const following=extractConfessionalReferences('Titus 1:5f').references[0];assert.equal(following.extent,'opening-only');assert.deepEqual(following.ranges,resolveReference('Titus 1:5'));
 for(const text of ['Acts 15, 1-29','Rom. 3, 4','Philemon 14','John 99:1'])assert.equal(extractConfessionalReferences(text).references.length,0,text);
 assert.equal(extractConfessionalReferences('cf. 2:21; salvation by grace').references.length,0);
});
test('Scripture selection matches exact citing paragraphs, chapter citations and source-specific context',()=>{
 const matches=matchingConfessions(index,resolveReference('Romans 3:28'));assert.ok(matches.some(p=>p.id==='ac:art-IV:3'));
 const p=matches.find(p=>p.id==='ac:art-IV:3')!,loc=confessionLocation(index,p);assert.equal(loc.work.title,'Augsburg Confession');assert.equal(loc.section.title,'Article IV. Of Justification');assert.equal(loc.section.paragraphIds.length,4);
 assert.equal(matchingConfessions(index,resolveReference('Obadiah 1:1')).length,0);
});
test('packet checkbox preserves exact confessional citations once; unchecked and older preferences remain off',async()=>{
 const original=globalThis.fetch;globalThis.fetch=sourceFetch;
 try{const packet=await buildPacket({...defaultPacket,reference:'Romans 3:28; Romans 4:5',explanations:false,relatedConfessions:true});assert.ok(packet.confessions.some(c=>c.paragraph.id==='ac:art-IV:3'));assert.equal(packet.confessions.length,new Set(packet.confessions.map(c=>c.paragraph.id)).size);
 for(const c of packet.confessions)assert.deepEqual(c.paragraph,index.paragraphs.find(p=>p.id===c.paragraph.id));
 assert.equal((await buildPacket({...defaultPacket,reference:'Romans 3:28',explanations:false})).confessions.length,0);
 const {relatedConfessions,...old}=defaultPacket;assert.equal(readPacket(JSON.stringify({schemaVersion:2,options:old})).relatedConfessions,false);
 globalThis.fetch=async(input:any)=>String(input).includes('/confessions/')?new Response('',{status:404}):sourceFetch(input);await assert.rejects(buildPacket({...defaultPacket,relatedConfessions:true}),/could not be loaded/);
 }finally{globalThis.fetch=original;}
});
test('corrupt or missing confessional projection is unavailable data',async()=>{
 await assert.rejects(loadConfessions(async()=>raw.replace('teach','taught')),/preserved English source/);await assert.rejects(loadConfessions(async()=>{throw Error('missing');}),/missing/);
});

test('every citation can navigate as an ordered canonical union without altering original evidence',()=>{
 for(const p of index.paragraphs)for(const r of p.references){const ordered=confessionalReadingRanges(r.ranges);const reference=ordered.map(r=>r.start===r.end?r.start:`${r.start}-${r.end}`).join(';');assert.deepEqual(resolveReference(reference),ordered);}
});

test('identical connected quotations are grouped with every source location retained',()=>{
 const matches=matchingConfessions(index,resolveReference('Romans 3:28')),groups=confessionalGroups(matches);assert.equal(matches.length,9);assert.equal(groups.length,8);assert.equal(groups.flat().length,9);
 const group=groups.find(g=>g.some(p=>p.id==='sa:ii-I:4'))!;assert.equal(group.length,2);assert.ok(group.some(p=>p.id==='sa:part-ii:4'));assert.ok(group.every(p=>p.text===group[0].text));
});
