import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { encyclopediaRelease, encyclopediaBase, encyclopediaHref, loadEncyclopedias, loadEncyclopediaArticle } from '../app/lib/domain/encyclopedias.ts';
const root = new URL('../', import.meta.url);
const json = async (path: string) => JSON.parse(await readFile(new URL(path, root), 'utf8'));
const hash = (data: string | Uint8Array) => createHash('sha256').update(data).digest('hex');

test('encyclopedia source, implementation, catalog and all article outputs match immutable pins', async () => {
  const pin = await json(`content/encyclopedias/${encyclopediaRelease}/manifest.json`);
  assert.equal(hash(await readFile(new URL(`sources/encyclopedias/${pin.source.file}`, root))), pin.source.sha256);
  assert.equal(hash(await readFile(new URL('scripts/import_encyclopedias.py', root))), pin.implementationSha256);
  const base = `app/public${encyclopediaBase}`;
  assert.deepEqual(await json(`${base}/manifest.json`), pin);
  const index = await json(`${base}/index.json`);
  assert.deepEqual(index.works.map((w: any) => w.entries.length), [9348, 2122]);
  for (const [file, sha] of Object.entries(pin.files)) assert.equal(hash(await readFile(new URL(`${base}/${file}`, root))), sha, file);
  for (const work of index.works) for (const entry of work.entries) {
    const article = await json(`${base}/articles/${work.id}/${entry.id}.json`);
    assert.equal(hash(article.paragraphs.join('\n\n')), article.textSha256, `${work.id}:${entry.id}`);
    assert.equal(entry.sha256, pin.files[`articles/${work.id}/${entry.id}.json`]);
    for (const target of article.redirect?.targets || []) assert.ok(work.entries.some((e: any) => e.id === target));
  }
  assert.equal(Object.keys(pin.audit.lutheran.duplicateTitles).length, 17);
  assert.equal(pin.audit.lutheran.duplicateTitles.Predestination.length, 3);
  const labels = index.works[1].entries.filter((e: any) => e.title === 'Predestination').map((e: any) => e.label);
  assert.equal(new Set(labels).size, 3);
  assert.equal(pin.audit.lutheran.redirects['means-of-grace'].status, 'resolved');
  assert.equal(pin.audit.lutheran.redirects.concupiscence.status, 'resolved');
});

test('encyclopedia links preserve browse filters, pagination and explicit source identity', () => {
  const search = '?view=encyclopedias&q=grace&letter=G&page=2';
  const detail = encyclopediaHref(search, { work: 'lutheran', entry: 'grace-means-of', browseWork: 'all' });
  const p = new URL(detail, 'https://local').searchParams;
  assert.equal(p.get('q'), 'grace'); assert.equal(p.get('page'), '2'); assert.equal(p.get('work'), 'lutheran');
  assert.equal(p.get('browseWork'), 'all');
  assert.equal(encyclopediaHref(detail.split('?')[1], { entry: '', work: '', browseWork: '' }), '/library?view=encyclopedias&q=grace&letter=G&page=2');
  assert.ok(!encyclopediaHref('?view=historical&work=whatever&returnTo=https://other').includes('returnTo'));
});

test('encyclopedia loading is local-only and rejects missing/corrupt article data', async () => {
  const original = globalThis.fetch;
  try {
    globalThis.fetch = async input => {
      assert.equal(typeof input, 'string'); assert.ok((input as string).startsWith(encyclopediaBase + '/'));
      return new Response(await readFile(new URL(`app/public${input}`, root)));
    };
    const index = await loadEncyclopedias(), work = index.works[0], entry = work.entries.find(e => e.id === 'v1-aaron')!;
    const aaron = await loadEncyclopediaArticle(work, entry);
    assert.match(aaron.paragraphs.join('\n\n'), /אַהֲרוֹן/);
    assert.match(aaron.paragraphs.join('\n\n'), /Ἀαρών/);
    assert.match(aaron.paragraphs.at(-1)!, /Edward Mack/);
    globalThis.fetch = async () => new Response('{}');
    await assert.rejects(loadEncyclopediaArticle(work, entry), /does not match/);
    globalThis.fetch = async () => new Response('missing', { status: 404 });
    await assert.rejects(loadEncyclopedias(), /could not be loaded/);
  } finally { globalThis.fetch = original; }
});
