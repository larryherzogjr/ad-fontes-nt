/** Build a compact, deterministic browsing index from already released data. */
import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = fileURLToPath(new URL('..', import.meta.url));
const publicRoot = join(root, 'app/public');
const readJson = async (path: string) => JSON.parse(await readFile(path, 'utf8'));
const lexicalKey = (value: string) => value.normalize('NFC').toLowerCase();

const omRelease = await readJson(join(root, 'app/lib/domain/om-release.json'));
const analysisRelease = await readJson(join(root, 'app/lib/domain/analysis-release.json'));
const lexicalReleaseId = 'dodson-2010-v5';
const variantBundle = await readJson(join(publicRoot, 'editorial/variants.json'));
const variants = variantBundle.units;
const articles = await readJson(join(publicRoot, `om/${omRelease.releaseId}/index.json`));
const wordMetadata = await readJson(join(root, 'sources/word-explorer/words-2026-09-12-250.json'));
const lookup = await readJson(join(publicRoot, `lexical/${lexicalReleaseId}/lookup.json`));
const lemmaDirectory = join(publicRoot, `analysis/${analysisRelease.releaseId}/lemmas`);

if (variantBundle.schemaVersion !== 1 || !Array.isArray(variants) || variants.some((unit: { status: string }) => unit.status !== 'approved'))
  throw Error('Library index may include only approved comparisons.');
if (articles.releaseId !== omRelease.releaseId || articles.articles.length !== omRelease.articleCount)
  throw Error('Ordinary Means article release mismatch.');
if (lookup.releaseId !== lexicalReleaseId) throw Error('Lexical release mismatch.');

const metadataBySlug = new Map(wordMetadata.map((row: { slug: string }) => [row.slug, row]));
const articleByUrl = new Map(articles.articles.map((article: { url: string; slug: string }) => [article.url, article.slug]));
const lemmaFiles = (await readdir(lemmaDirectory)).filter(name => name.endsWith('.json')).sort();

const comparisons = variants.map((unit: any) => ({
  id: unit.id,
  title: unit.title,
  ranges: unit.ranges,
  presentation: unit.presentation || 'comparison',
  publisherNoteCount: unit.publisherNotes?.length || 0,
  relatedUnits: unit.relatedUnits || [],
  summary: unit.significance.sourceObservation.split(/\n\s*\n/, 1)[0],
  searchText: `${unit.significance.sourceObservation}\n${unit.significance.interpretation}`,
}));

const studyArticles = articles.articles.map((article: any) => {
  const metadata: any = metadataBySlug.get(article.slug);
  if (!metadata || metadata.url !== article.url)
    throw Error(`Missing or stale word metadata for ${article.slug}.`);
  return {
    slug: article.slug,
    title: article.title,
    headword: article.headword,
    subtitle: article.subtitle,
    author: article.author,
    url: article.url,
    snapshotDate: article.snapshotDate,
    contentSha256: article.contentSha256,
    transliteration: metadata.translit,
    gloss: metadata.gloss,
    description: metadata.description,
    category: metadata.category,
    tags: metadata.tags,
  };
});

const words = [];
for (const name of lemmaFiles) {
  const lemma = await readJson(join(lemmaDirectory, name));
  const key = lexicalKey(lemma.lemma);
  const definitions = lookup.entries[key] || [];
  const links = lookup.links[lookup.aliases?.[key] || key] || [];
  const linkedSlugs = [...new Set(links.map((link: { url: string }) => articleByUrl.get(link.url)).filter(Boolean))];
  words.push({
    lemmaId: lemma.lemmaId,
    lemma: lemma.lemma,
    occurrenceCount: lemma.hits.length,
    firstOccurrence: lemma.hits[0] ? {
      anchor: lemma.hits[0].anchor,
      tokenId: lemma.hits[0].tokenId,
      surface: lemma.hits[0].surface,
    } : null,
    definitions: definitions.map((definition: any) => ({
      strongs: definition.strongs,
      brief: definition.brief,
      sourceId: definition.sourceId,
    })),
    articleSlugs: linkedSlugs,
  });
}

const output = {
  schemaVersion: 1,
  comparisonCount: comparisons.length,
  articleCount: studyArticles.length,
  lemmaCount: words.length,
  analysisReleaseId: analysisRelease.releaseId,
  textReleaseId: analysisRelease.textReleaseId,
  lexicalReleaseId,
  articleReleaseId: omRelease.releaseId,
  comparisons,
  articles: studyArticles,
  words,
};

if (output.comparisonCount !== 39 || output.articleCount !== 250 || output.lemmaCount !== 5400)
  throw Error(`Unexpected Library inventory: ${output.comparisonCount}/${output.articleCount}/${output.lemmaCount}.`);

const destination = join(publicRoot, 'library/index.json');
await mkdir(dirname(destination), { recursive: true });
await writeFile(destination, JSON.stringify(output) + '\n');
console.log(`Built Library index with ${output.comparisonCount} comparisons, ${output.articleCount} articles, and ${output.lemmaCount} lemmas.`);
