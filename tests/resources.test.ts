import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resources, relatedResources } from '../app/lib/domain/resources.ts';
const ids = (start: string, end = start) => relatedResources([{start,end}]).map(r => r.id);
test('resource links match canonical book and exact passage overlap without duplicates', () => {
  assert(ids('JHN.1.1').includes('that-you-may-believe'));
  assert.deepEqual(ids('MAT.1.1'), []);
  for (const code of ['1TI','2TI','TIT']) assert(ids(`${code}.1.1`).includes('guard-the-deposit'));
  assert(!ids('PHM.1.1').includes('guard-the-deposit'));
  const all = relatedResources([{start:'JHN.7.53',end:'JHN.7.53'},{start:'JHN.8.1',end:'JHN.8.11'}]);
  assert.equal(new Set(all.map(r=>r.id)).size, all.length);
});
test('curated resources contain only attributed external links with pinned source metadata', () => {
  assert.equal(resources.length,22);
  for (const r of resources) {
    assert.equal(new URL(r.url).origin,'https://larryherzogjr.com');
    assert.equal(r.byline,'Larry Herzog Jr.');
    assert.match(r.sourceSha256,/^[a-f0-9]{64}$/);
    assert(r.books.length || r.ranges.length);
    assert(!('body' in r) && !('excerpt' in r));
  }
});

test('study catalog links include downloadable and online book studies', () => {
  assert.deepEqual(ids('JOB.1.1'), ['for-nothing-job']);
  assert.deepEqual(ids('JOB.42.17'), ['for-nothing-job']);
  assert.deepEqual(ids('GEN.1.1'), ['genesis-online-study']);
  assert.deepEqual(ids('GEN.50.26'), ['genesis-online-study']);
  assert.deepEqual(ids('EXO.1.1'), []);
  assert.equal(resources.filter(r => r.kind === 'Free study').length, 9);
  assert.equal(resources.filter(r => r.kind === 'Online Bible study').length, 12);
});


test('supplied online studies match every covered book without leaking to neighbors', () => {
  const coverage = {
    'psalms': ['PSA'], 'isaiah': ['ISA'],
    'the-twelve': ['HOS','JOL','AMO','OBA','JON','MIC','NAM','HAB','ZEP','HAG','ZEC','MAL'],
    'in-christ': ['EPH'], 'to-live-is-christ': ['PHP'], 'christ-in-you': ['COL'],
    'brother-in-christ': ['PHM'], 'epistle-of-straw': ['JAS'],
    'strangers-and-exiles': ['1PE'], 'that-you-may-know': ['1JN','2JN','3JN'],
    'something-better': ['HEB'],
  };
  for (const [slug, books] of Object.entries(coverage)) {
    for (const book of books) assert(ids(`${book}.1.1`).includes(`${slug}-online-study`));
  }
  assert(!ids('DAN.1.1').includes('the-twelve-online-study'));
  assert(!ids('2PE.1.1').includes('strangers-and-exiles-online-study'));
  assert(!ids('JHN.1.1').includes('that-you-may-know-online-study'));
  assert(!ids('PRO.1.1').includes('psalms-online-study'));
});


test('Ad Fontes course and lesson backlinks are excluded from the companion app', () => {
  assert(!resources.some(r => new URL(r.url).pathname.startsWith('/ad-fontes/')));
  assert.deepEqual(ids('MRK.16.8'), []);
  assert(!ids('JHN.7.53', 'JHN.8.11').includes('why-textual-criticism-matters'));
  assert(ids('REV.22.19').includes('worthy-is-the-lamb'));
});
