import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { commentaryChapters, matchingCommentary, lenskiBase, lenskiRelease, type CommentaryChapter } from '../app/lib/domain/commentaries.ts';
const chapter = async (book: string, n: number): Promise<CommentaryChapter> => JSON.parse(await readFile(`app/public${lenskiBase}/chapters/${book}/${n}.json`,'utf8'));
test('Lenski shipped files reproduce pins and preserve every source chapter string',async()=>{
 const manifest=JSON.parse(await readFile('content/lenski/release.json','utf8'));
 assert.equal(manifest.chapterCount,260);
 for(const [file,hash] of Object.entries(manifest.files)){
  const bytes=await readFile(`app/public${lenskiBase}/${file}`);
  assert.equal(createHash('sha256').update(bytes).digest('hex'),hash,file);
  if(!file.startsWith('chapters/'))continue;
  const ch=JSON.parse(bytes.toString()) as CommentaryChapter;
  assert.equal(ch.releaseId,lenskiRelease);
  assert.equal(createHash('sha256').update(ch.paragraphs.join('\n\n')).digest('hex'),ch.sourceSha256);
  for(const s of ch.sections)assert(s.paragraph>=ch.introEnd && s.toParagraph>s.paragraph && s.toParagraph<=ch.paragraphs.length);
 }
});
test('numbered outlines and broken page references never become verse anchors',async()=>{
 const john=await chapter('JHN',1);assert.equal(matchingCommentary(john,[1])[0].paragraph,54);
 const eph=await chapter('EPH',3);assert.equal(matchingCommentary(eph,[1])[0].paragraph,1);
 assert(!eph.sections.some(s=>s.paragraph>=61&&s.paragraph<=67));
 const heb=await chapter('HEB',8);assert.equal(matchingCommentary(heb,[1])[0].paragraph,2);assert.equal(matchingCommentary(heb,[2])[0].paragraph,14);
 const luke=await chapter('LUK',1);assert(!luke.sections.some(s=>s.start===964||s.start===889));
});
test('grouped source verse labels and merged headings are usable without rewriting prose',async()=>{
 const phm=await chapter('PHM',1);assert.deepEqual(matchingCommentary(phm,[2]).map(s=>[s.start,s.end]),[[1,2]]);
 const mark=await chapter('MRK',1);assert.equal(matchingCommentary(mark,[1])[0].paragraph,52);assert(mark.paragraphs[52].startsWith('The Introduction 1)'));
});
test('commentary selection keeps canonical chapters, handles OT, and never guesses a missing anchor',async()=>{
 assert.deepEqual(commentaryChapters([{start:'GEN.1.1',end:'GEN.1.2'}]),[]);
 assert.deepEqual(commentaryChapters([{start:'JHN.1.51',end:'JHN.2.1'}]).map(c=>[c.book,c.chapter,c.verses]),[['JHN',1,[51]],['JHN',2,[1]]]);
 const mat=await chapter('MAT',1);for(const verse of mat.unmappedVerses)assert.equal(matchingCommentary(mat,[verse]).length,0);
});
test('Lenski’s different numbering at the Corinthian benediction resolves to canonical 14',async()=>{
 const ch=await chapter('2CO',13);
 assert.equal(matchingCommentary(ch,[13])[0].paragraph,40);
 assert.equal(matchingCommentary(ch,[14])[0].paragraph,42);
 assert.equal(matchingCommentary(ch,[14])[0].sourceLabel,'13');
 assert(ch.paragraphs[42].startsWith('13)'));
});

test('K&D preserves all supplied chapter groups and pinned release bytes',async()=>{
 const manifest=JSON.parse(await readFile('content/kd/release.json','utf8'));
 assert.equal(manifest.chapterCount,929);assert.equal(manifest.textChars,26553864);
 let chapters=0;
 for(const [file,hash] of Object.entries(manifest.files)){
  const bytes=await readFile(`app/public/commentaries/kd-2026-10-08-v1/${file}`);
  assert.equal(createHash('sha256').update(bytes).digest('hex'),hash,file);
  if(!file.startsWith('chapters/'))continue;
  const ch=JSON.parse(bytes.toString());chapters++;
  assert.equal(createHash('sha256').update(ch.paragraphs.join('\n\n')).digest('hex'),ch.sourceSha256);
  assert.equal(ch.mappingMode,'chapter-context');assert.deepEqual(ch.sections,[]);
 }
 assert.equal(chapters,929);
});
test('K&D crosses misplaced chapter boundaries without guessing verse alignment',async()=>{
 const read=async(b:string,c:number)=>JSON.parse(await readFile(`app/public/commentaries/kd-2026-10-08-v1/chapters/${b}/${c}.json`,'utf8'));
 const lev=await read('LEV',4);
 const link=lev.relatedSections.find((s:any)=>s.chapter===5&&s.label.startsWith('Lev. 4:2'));
 assert(link);assert((await read('LEV',5)).paragraphs[link.paragraph].startsWith('Lev. 4:2–5:13.'));
 const mal=await read('MAL',3);assert(mal.relatedSections.some((s:any)=>s.chapter===4&&s.label==='Mal. 3:16–18.'));
 const ps=await read('PSA',51);assert(ps.paragraphs.some((p:string)=>p.includes('3\tBE merciful')));assert.equal(matchingCommentary(ps,[1]).length,0);
 assert.deepEqual(commentaryChapters([{start:'GEN.1.1',end:'GEN.1.2'}],true),[{book:'GEN',chapter:1,verses:[1,2]}]);
});
