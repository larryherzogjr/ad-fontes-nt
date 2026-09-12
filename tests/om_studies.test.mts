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

test('selected release is the approved resolved-audit successor', async () => {
  assert.equal(release.releaseId, 'om-studies-2026-09-11-v7');
  assert.equal(manifest.predecessor, 'om-studies-2026-09-11-v6');
  assert.equal(manifest.adaptation.edition, 'BSB');
  assert.equal(manifest.adaptation.candidateManifestSha256, 'dad1b34f996eb44bc30e9641083f39b8945992f768a2b96b511f0a695647eb2d');
  assert.equal(manifest.adaptation.validatorReportSha256, 'ebf8611fdbf23710ebb61216357e92e9cc5964f6f74bd5c692717ed0df40abbd');
  assert.equal(manifest.adaptation.bsbSourceSha256, '2ac3af1de52d4e68261cba91d85c320b7eadc6560e830d99e591767b8ff5ca96');
  assert.equal(manifest.adaptation.sampleCount, 136);
  assert.equal(manifest.adaptation.fallbackCount, 243);
  assert.equal(manifest.adaptation.overlapResolution.containedEvidenceSuppressed, 32);
  assert.equal(manifest.adaptation.overlapResolution.partialOverlaps, 0);
  assert.equal(manifest.priorEditorialCorrection.candidateManifestSha256, 'bf5683ff39806cde1eb729d165473591bc744bbdca213ab200a2eccc8c27e612');
  assert.equal(manifest.editorialAuditCorrection.candidateManifestSha256, '634d06bd89eb99826c5f70ea726a6d7aaca1673558e6f790bfb6312ef8c4d213');
  assert.equal(manifest.editorialAuditCorrection.replacementCount, 124);
  assert.equal(manifest.editorialAuditCorrection.unchangedArticleCount, 183);
  assert.equal(manifest.editorialAuditCorrection.changedArticles.length, 67);
  assert.deepEqual(manifest.editorialAuditCorrection.unresolvedFindingIds, ['AUDIT-062','AUDIT-063','AUDIT-064','AUDIT-065','AUDIT-086']);
  assert.equal(manifest.editorialAuditCorrection.scriptureChanged, false);
  assert.equal(manifest.editorialAuditCorrection.authorWebsiteChanged, false);
  assert.equal(manifest.auditFollowupCorrection.candidateManifestSha256, '58cab201852f955de95af4ee2a3531a4f03708e867a0183bc884651a752792d8');
  assert.deepEqual(manifest.auditFollowupCorrection.resolvedFindingIds, ['AUDIT-063','AUDIT-064','AUDIT-062','AUDIT-065','AUDIT-086']);
  assert.deepEqual(manifest.auditFollowupCorrection.changedArticles, ['epiphaneia','eusebeia','hades','hyper']);
  assert.equal(manifest.auditFollowupCorrection.replacementCount, 4);
  assert.equal(manifest.auditFollowupCorrection.unchangedArticleCount, 246);
  assert.equal(manifest.auditFollowupCorrection.scriptureChanged, false);
  assert.equal(manifest.auditFollowupCorrection.authorWebsiteChanged, false);
  const approval = await readFile(join(source, manifest.approvalEvidence), 'utf8');
  assert.match(approval, /Reviewer: Larry Herzog Jr\./);
  assert.match(approval, /58cab201852f955de95af4ee2a3531a4f03708e867a0183bc884651a752792d8/);
});

test('approved count and language corrections are present', async () => {
  const article = async (slug: string) => await readFile(join(source, 'raw', `${slug}.md`), 'utf8');
  assert.match(await article('anthropos'), /Two Latin words[^\n]+\*Ecce homo\*/);
  assert.match(await article('anomia'), /those five Greek words/);
  assert.match(await article('logos'), /opening five Greek words/);
  assert.match(await article('pater'), /Three elements bear attention/);
  assert.doesNotMatch(await article('pistos-ho-logos'), /those eight words available/);
  const kyrios = await article('kyrios');
  assert.match(kyrios, /two Greek words/);
  assert.match(kyrios, /three in English/);
  assert.doesNotMatch(kyrios, /three-word creed|Three words\. Two terrible|Saying the three words/);
});

test('the five resolved audit findings use the approved wording', async () => {
  const article = async (slug: string) => await readFile(join(source, 'raw', `${slug}.md`), 'utf8');
  assert.match(await article('hades'), /\]\(https:\/\/larryherzogjr\.com\/questions\/what-does-it-mean-that-jesus-descended-into-hell\/\)/);
  const epiphaneia = await article('epiphaneia');
  assert.match(epiphaneia, /the two verses should be studied together\./);
  assert.doesNotMatch(epiphaneia, /The Knowledge of Him/);
  const eusebeia = await article('eusebeia');
  assert.match(eusebeia, /Where Nestle’s 1904 text reads \*hos\*/);
  assert.match(eusebeia, /Robinson–Pierpont and the Textus Receptus edition included here read \*theos\*/);
  assert.doesNotMatch(eusebeia, /Byzantine tradition behind the King James/);
  const hyper = await article('hyper');
  assert.match(hyper, /the gospel in the two syllables “for you,” repeated weekly/);
  assert.doesNotMatch(hyper, /the gospel in three syllables/);
});

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
    assert.doesNotMatch(raw, /\bNET\b/);
    assert.equal(article.markdown, /^---\r?\n[\s\S]*?\r?\n---\r?\n([\s\S]*)$/.exec(raw)![1]);
  }
  const lookup = await json('app/public/lexical/dodson-2010-v4/lookup.json');
  const urls = new Set(index.articles.map((a: {url: string}) => a.url));
  for (const links of Object.values(lookup.links) as {url: string}[][]) {
    for (const link of links) assert.ok(urls.has(link.url), `Unbundled existing word link: ${link.url}`);
  }
});

test('reader discloses the BSB adaptation and unchanged original website edition', async () => {
  const source = await readFile('app/reader/word-studies.tsx', 'utf8');
  assert.match(source, /open here in an Ad Fontes BSB adaptation/);
  assert.match(source, /linked website preserves the original article edition/);
  assert.match(source, /Open original website edition on larryherzogjr\.com/);
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
