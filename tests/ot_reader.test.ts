import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { books, resolveReference, expand, chapterNeighbor, chapterRange, passageUrl } from '../app/lib/domain/references.ts';
import { createLocalAdapter, editionsFor } from '../app/lib/domain/corpus.ts';
import { otEnabled } from '../app/lib/domain/ot-release.ts';
import { getAnalysis } from '../app/lib/domain/greek.ts';
import { formatPassage } from '../app/lib/reading-display.ts';
assert.equal(otEnabled, true, 'Run via npm run test:ot-reader');
const root = new URL('../', import.meta.url);
const load = async (path: string) => JSON.parse(await readFile(new URL(path.startsWith('/ot-preview/')
  ? 'artifacts/ot/ot-english-2026-10-07-v1/' + path.slice('/ot-preview/'.length)
  : 'app/public' + path, root), 'utf8'));
test('whole-Bible references preserve OT aliases, single chapters and Testament boundary navigation', () => {
  assert.equal(books.length, 66);
  assert.equal(resolveReference('Psalm 3:1')[0].start, 'PSA.3.1');
  assert.equal(resolveReference('Song of Solomon 2:1')[0].start, 'SNG.2.1');
  assert.equal(resolveReference('Obadiah 3')[0].start, 'OBA.1.3');
  assert.equal(expand(resolveReference('Genesis 1:31–2:3')[0]).length, 4);
  assert.deepEqual(chapterNeighbor('MAL', 4, 1), { book: 'MAT', chapter: 1 });
  assert.deepEqual(chapterNeighbor('MAT', 1, -1), { book: 'MAL', chapter: 4 });
  assert.equal(chapterNeighbor('GEN',1,-1),null);
  assert.match(passageUrl(resolveReference('Isaiah 53:5'),'YLT'), /^\/read\/ISA\/53\?translation=YLT/);
  assert.throws(() => resolveReference('Genesis 51:1'));
});
test('all four editions read exact OT text and expose only English OT comparisons', async () => {
  const ranges = resolveReference('Psalm 3:1–2');
  assert.equal(editionsFor(ranges).length,4);
  assert.equal(editionsFor(resolveReference('John 1:1')).length,7);
  for (const edition of ['BSB','BLB','MSB','YLT']) {
    const adapter=createLocalAdapter(load,edition);
    const ch=await adapter.getChapter('PSA',3);
    assert.equal(ch.coverage.length,8);
    assert.ok(ch.coverage.every(c => c.placements?.length === 1 && c.evidence));
    const p=await adapter.getPassage(ranges);
    assert.match(p.releaseId,/^\w+-ot-2026-10-07-v1$/);
    assert.equal(p.segments.length,2);
    assert.ok(p.segments[0].text.includes(edition==='YLT' ? 'Absalom' : 'Absalom'));
    assert.equal((await adapter.getPublisherNotes('PSA',3)).length,ch.notes.length);
    assert.equal((await adapter.getPassage(resolveReference('John 1:1'))).releaseId,adapter.releaseId);
  }
  await assert.rejects(createLocalAdapter(load,'N1904').getChapter('GEN',1), /covers the New Testament/);

});
test('OT search retains source text, supports Testament filters, pagination and YLT book aliases', async () => {
  const adapter=createLocalAdapter(load,'BSB');
  const filtered=await adapter.searchText('shepherd','OT');
  assert.ok(filtered.total>20);assert.equal(filtered.hits.length,20);
  assert.ok(filtered.hits.every(h => books.find(b=>b.code===h.book)!.order<39));
  const second=await adapter.searchText('shepherd','OT',2);assert.equal(second.page,2);
  assert.notEqual(second.hits[0].anchor,filtered.hits[0].anchor);
  assert.equal((await adapter.searchText('"In the beginning God created"','GEN')).hits[0].anchor,'GEN.1.1');
  assert.ok((await adapter.searchText('shepherd','NT')).hits.every(h=>books.find(b=>b.code===h.book)!.order>=39));
  const ylt=await createLocalAdapter(load,'YLT').searchText('beloved','SNG');
  assert.ok(ylt.total>0);assert.ok(ylt.hits.every(h=>h.book==='SNG'));
});
test('broken OT candidate data is an application error, never a textual omission', async () => {
  const adapter=createLocalAdapter(async path => {
    const d=await load(path);if (path.endsWith('/GEN/1.json'))d.segments=[];return d;
  });
  await assert.rejects(adapter.getChapter('GEN',1),/incomplete/);
  await assert.rejects(createLocalAdapter(load).getPassage([{start:'MAL.4.6',end:'MAT.1.1'}]),/within one Testament/);
});
