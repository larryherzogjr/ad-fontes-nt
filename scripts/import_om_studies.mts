/** Reproduce a deliberately saved, reviewed snapshot. No network or rebaseline flag. */
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const root = fileURLToPath(new URL('..', import.meta.url));
const config = JSON.parse(await readFile(join(root, 'app/lib/domain/om-release.json'), 'utf8'));
const release = process.argv[2] || config.releaseId;
const directory = join(root, 'sources/om-studies', release);
const manifest = JSON.parse(await readFile(join(directory, 'manifest.json'), 'utf8'));
for (const [path, expected] of Object.entries(manifest.files)) {
  const actual = createHash('sha256').update(await readFile(join(directory, path))).digest('hex');
  if (actual !== expected) throw Error(`Changed OM source/evidence: ${path}. Prepare a reviewed new release.`);
}
const articles = [];
for (const article of manifest.articles) {
  const source = await readFile(join(directory, article.sourcePath), 'utf8');
  if (manifest.schemaVersion === 1) {
    if (!source.includes('<!-- COPY APPROVED: Larry, 2026-09-06 -->')) throw Error('Missing recorded article approval');
  } else if (!manifest.files[manifest.approvalEvidence] || !source.includes('editorial_review: "approved"') || !source.includes(`editorial_approval_date: "${article.approvalDate}"`)) throw Error('Missing recorded collection approval');
  if (manifest.files[article.sourcePath] !== article.contentSha256) throw Error('Article approval hash mismatch');
  const match = /^---\r?\n[\s\S]*?\r?\n---\r?\n([\s\S]*)$/.exec(source);
  if (!match) throw Error(`Invalid article front matter: ${article.slug}`);
  const metadata = source.slice(0, source.length - match[1].length);
  if (!metadata.includes(`slug: "${article.slug}"`) || !metadata.includes(`greek: "${article.headword}"`) || !metadata.includes('draft: false')) throw Error('Article identity or publication state mismatch');
  articles.push({ ...article, markdown: match[1], snapshotDate: manifest.snapshotDate });
}
const destination = join(root, 'app/public/om', release);
const outputs: Record<string, string> = {};
if (manifest.schemaVersion === 1) {
  outputs['index.json'] = JSON.stringify({ schemaVersion: 1, releaseId: release, articles }, null, 2) + '\n';
} else {
  if (manifest.schemaVersion !== 2 || (release === config.releaseId && articles.length !== config.articleCount)) throw Error('OM collection mismatch');
  if (new Set(articles.map(article => article.slug)).size !== articles.length || new Set(articles.map(article => article.url)).size !== articles.length) throw Error('Duplicate OM article');
  outputs['index.json'] = JSON.stringify({ schemaVersion: 2, releaseId: release, articles: articles.map(({ markdown, ...summary }) => summary) }, null, 2) + '\n';
  for (const article of articles) {
    if (!/^[a-z0-9-]+$/.test(article.slug)) throw Error('Invalid article slug');
    outputs[`articles/${article.slug}.json`] = JSON.stringify({ schemaVersion: 2, releaseId: release, article }, null, 2) + '\n';
  }
}
const expected = manifest.schemaVersion === 1 ? { 'index.json': manifest.outputSha256 } : manifest.outputChecksums;
if (Object.keys(expected).length !== Object.keys(outputs).length) throw Error('OM output inventory mismatch');
for (const [path, output] of Object.entries(outputs)) {
  if (createHash('sha256').update(output).digest('hex') !== expected[path]) throw Error(`OM output differs from the reviewed snapshot: ${path}. Prepare a reviewed new release.`);
}
for (const [path, output] of Object.entries(outputs)) {
  await mkdir(join(destination, path, '..'), { recursive: true });
  await writeFile(join(destination, path), output);
}
await writeFile(join(destination, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(`Reproduced ${articles.length} approved OM article snapshot(s): ${release}`);
