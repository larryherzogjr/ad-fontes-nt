import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resources, relatedResources } from '../app/lib/domain/resources.ts';
const ids = (start: string, end = start) => relatedResources([{start,end}]).map(r => r.id);
test('resource links match canonical book and exact passage overlap without duplicates', () => {
  assert(ids('JHN.1.1').includes('that-you-may-believe'));
  assert.deepEqual(ids('MAT.1.1'), []);
  assert(!ids('MRK.16.7').includes('mark-16-and-confidence'));
  assert(ids('MRK.16.8').includes('mark-16-and-confidence'));
  assert(ids('MRK.16.20').includes('mark-16-and-confidence'));
  assert(ids('JHN.7.53','JHN.8.11').includes('why-textual-criticism-matters'));
  for (const code of ['1TI','2TI','TIT']) assert(ids(`${code}.1.1`).includes('guard-the-deposit'));
  assert(!ids('PHM.1.1').includes('guard-the-deposit'));
  const all = relatedResources([{start:'JHN.7.53',end:'JHN.7.53'},{start:'JHN.8.1',end:'JHN.8.11'}]);
  assert.equal(new Set(all.map(r=>r.id)).size, all.length);
});
test('curated resources contain only attributed external links with pinned source metadata', () => {
  assert.equal(resources.length,12);
  for (const r of resources) {
    assert.equal(new URL(r.url).origin,'https://larryherzogjr.com');
    assert.equal(r.byline,'Larry Herzog Jr.');
    assert.match(r.sourceSha256,/^[a-f0-9]{64}$/);
    assert(r.books.length || r.ranges.length);
    assert(!('body' in r) && !('excerpt' in r));
  }
});
