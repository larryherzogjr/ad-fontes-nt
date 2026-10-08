import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const library = JSON.parse(await readFile(new URL('../app/public/library/index.json', import.meta.url), 'utf8'));

test('Library index contains only the released inventories', () => {
  assert.equal(library.schemaVersion, 1);
  assert.equal(library.comparisonCount, 104);
  assert.equal(library.articleCount, 250);
  assert.equal(library.lemmaCount, 5400);
  assert.equal(library.comparisons.length, 104);
  assert.equal(library.articles.length, 250);
  assert.equal(library.words.length, 5400);
  assert.ok(library.comparisons.every((unit: any) => unit.id && unit.title && unit.ranges.length));
  assert.ok(library.articles.every((article: any) => article.slug && article.contentSha256 && article.category));
  assert.ok(library.words.every((word: any) => word.lemmaId && word.lemma && word.occurrenceCount > 0));
});

test('Library client requires the complete 104-comparison release', async () => {
  const client = await readFile(new URL('../app/library/library.tsx', import.meta.url), 'utf8');
  assert.match(client, /data\.comparisonCount !== 104/);
  assert.doesNotMatch(client, /data\.comparisonCount !== 39/);
});

test('selected UX keeps item bookmarks but omits saved views and panel resizing', async () => {
  const client = await readFile(new URL('../app/library/library.tsx', import.meta.url), 'utf8');
  const panel = await readFile(new URL('../app/reader/study-panel.tsx', import.meta.url), 'utf8');
  assert.match(client, /afnt-library-bookmarks/);
  assert.doesNotMatch(client, /afnt-library-views|Save this Library view|Saved Library views/);
  assert.match(panel, /Widen comparison/);
  assert.doesNotMatch(panel, /input type="range"|afnt\.study-width|panelWidth/);
});

test('textual studies retain Close and link back to the comparison collection', async () => {
  const panel = await readFile(new URL('../app/reader/study-panel.tsx', import.meta.url), 'utf8');
  assert.match(panel, /aria-label="Close study panel"/);
  assert.match(panel, /aria-label="Study Library return"/);
  assert.match(panel, /← Back to Study Library<\/a>/);
  assert.match(panel, /mode !== 'greek'/);
});

test('Library keeps publisher-note comparisons and commentary links explicit', () => {
  assert.deepEqual(
    library.comparisons.filter((unit: any) => unit.presentation === 'publisher-note').map((unit: any) => unit.id),
    ['candidate-13', 'candidate-38', 'candidate-39', 'candidate-42', 'candidate-43', 'candidate-47', 'candidate-48', 'candidate-49', 'candidate-60', 'candidate-63', 'candidate-80', 'candidate-84', 'candidate-104'],
  );
  const mysterion = library.articles.find((article: any) => article.slug === 'mysterion');
  const lemma = library.words.find((word: any) => word.lemmaId === 'c8e3711ec62bf183b1c0');
  assert.equal(mysterion.category, 'Baptism and the Supper');
  assert.equal(lemma.occurrenceCount, 27);
  assert.deepEqual(lemma.articleSlugs, ['mysterion']);
});

test('recent reading presentation consolidates stale tool parameters without modifying history', async () => {
  const { presentRecentLinks } = await import('../app/lib/device-links.ts');
  const history = [
    {url:'/read/HEB/8?translation=BSB&passage=HEB.8.12&connection=pair&connectionView=greek',label:'Hebrews 8:12',savedAt:2},
    {url:'/read/HEB/8?passage=HEB.8.12&translation=BSB',label:'Hebrews 8:12',savedAt:1},
    {url:'/read/HEB/8?translation=YLT&passage=HEB.8.12',label:'Hebrews 8:12',savedAt:0},
  ];
  const original = structuredClone(history);
  const displayed = presentRecentLinks(history, 'passage');
  assert.equal(displayed.length, 2);
  assert.ok(!displayed[0].url.includes('connection'));
  assert.deepEqual(history, original);
});

test('recent studies label distinct displays and consolidate equivalent commentary links', async () => {
  const { presentRecentLinks } = await import('../app/lib/device-links.ts');
  const base = '/read/HEB/8?translation=BSB&passage=HEB.8.12&panel=connections&connection=pair';
  const links = [
    {url:base+'&connectionView=greek',label:'Hebrews connection',savedAt:5},
    {url:base+'&connectionView=english',label:'Hebrews connection',savedAt:4},
    {url:base,label:'Hebrews connection',savedAt:3},
    {url:base+'&connectionView=both',label:'Hebrews connection',savedAt:2},
    {url:'/read/JHN/1?passage=JHN.1.18&panel=compare&unit=candidate-15',label:'John study',savedAt:1},
    {url:'/read/JHN/1?panel=compare&passage=JHN.1.18',label:'John study',savedAt:0},
  ];
  const shown = presentRecentLinks(links, 'study');
  assert.equal(shown.length, 4);
  assert.deepEqual(shown.slice(0,3).map(link => link.detail), ['Connections · Greek','Connections · English','Connections · English and Greek']);
  assert.equal(shown[0].url, links[0].url);
});
