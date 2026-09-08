import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { join } from 'node:path';

const json = async (path: string) => JSON.parse(await readFile(path, 'utf8'));
const release = await json('app/lib/domain/om-release.json');
const source = `sources/om-studies/${release.releaseId}`;
const output = `app/public/om/${release.releaseId}`;
const manifest = await json(`${source}/manifest.json`);

test('all 250 approved articles reproduce exactly and cover every existing Greek word-study URL', async () => {
  const index = await json(`${output}/index.json`);
  assert.equal(index.articles.length, 250);
  assert.equal(new Set(index.articles.map((a: {url: string}) => a.url)).size, 250);
  assert.ok(index.articles.every((a: {markdown?: string}) => a.markdown === undefined), 'index must not eagerly include article prose');
  for (const [path, hash] of Object.entries(manifest.outputChecksums)) {
    assert.equal(createHash('sha256').update(await readFile(join(output, path))).digest('hex'), hash, path);
  }
  for (const meta of manifest.articles) {
    const raw = await readFile(join(source, meta.sourcePath), 'utf8');
    const { article } = await json(`${output}/articles/${meta.slug}.json`);
    assert.equal(createHash('sha256').update(raw).digest('hex'), meta.contentSha256);
    assert.match(raw, /editorial_review: "approved"/);
    assert.doesNotMatch(raw, /pending-author-review|<!--\s*DRAFT COPY/);
    assert.equal(article.markdown, /^---\r?\n[\s\S]*?\r?\n---\r?\n([\s\S]*)$/.exec(raw)![1]);
  }
  const lookup = await json('app/public/lexical/dodson-2010-v3/lookup.json');
  const urls = new Set(index.articles.map((a: {url: string}) => a.url));
  for (const links of Object.values(lookup.links) as {url: string}[][]) {
    for (const link of links) assert.ok(urls.has(link.url), `Unbundled existing word link: ${link.url}`);
  }
});

test('article Markdown preserves the real Metanoia footnote and hides editorial comments', async () => {
  const require = createRequire(new URL('../app/package.json', import.meta.url));
  const React = require('react');
  const { renderToStaticMarkup } = require('react-dom/server');
  const Markdown = require('react-markdown').default;
  const remarkGfm = require('remark-gfm').default;
  const { article } = await json(`${output}/articles/metanoia.json`);
  const html = renderToStaticMarkup(React.createElement(Markdown, { skipHtml: true, remarkPlugins: [remarkGfm] }, article.markdown));
  assert.match(html, /href="#user-content-fn-jeg-1-103"/);
  assert.match(html, /id="user-content-fn-jeg-1-103"/);
  assert.match(html, /href="#user-content-fnref-jeg-1-103"/);
  assert.match(html, /Kolb and Wengert/);
  assert.doesNotMatch(html, /APPROVED ADAPTATION|COPY APPROVED/);
});
