import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const library = JSON.parse(await readFile(new URL('../app/public/library/index.json', import.meta.url), 'utf8'));

test('Library index contains only the released inventories', () => {
  assert.equal(library.schemaVersion, 1);
  assert.equal(library.comparisonCount, 39);
  assert.equal(library.articleCount, 250);
  assert.equal(library.lemmaCount, 5400);
  assert.equal(library.comparisons.length, 39);
  assert.equal(library.articles.length, 250);
  assert.equal(library.words.length, 5400);
  assert.ok(library.comparisons.every((unit: any) => unit.id && unit.title && unit.ranges.length));
  assert.ok(library.articles.every((article: any) => article.slug && article.contentSha256 && article.category));
  assert.ok(library.words.every((word: any) => word.lemmaId && word.lemma && word.occurrenceCount > 0));
});

test('Library keeps publisher-note comparisons and commentary links explicit', () => {
  assert.deepEqual(
    library.comparisons.filter((unit: any) => unit.presentation === 'publisher-note').map((unit: any) => unit.id),
    ['candidate-13', 'candidate-38', 'candidate-39'],
  );
  const mysterion = library.articles.find((article: any) => article.slug === 'mysterion');
  const lemma = library.words.find((word: any) => word.lemmaId === 'c8e3711ec62bf183b1c0');
  assert.equal(mysterion.category, 'Baptism and the Supper');
  assert.equal(lemma.occurrenceCount, 27);
  assert.deepEqual(lemma.articleSlugs, ['mysterion']);
});
