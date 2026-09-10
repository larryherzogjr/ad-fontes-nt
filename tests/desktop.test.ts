import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join, resolve } from 'node:path';
import { createLocalAdapter, editions } from '../app/lib/domain/corpus.ts';
import { books } from '../app/lib/domain/references.ts';
import { getAnalysis, getOccurrences, getLexicon } from '../app/lib/domain/greek.ts';
import { resolveLookup } from '../app/lib/domain/lexical.ts';
import { desktopStartPath } from '../app/desktop/navigation.ts';

const om = JSON.parse(await readFile('app/lib/domain/om-release.json', 'utf8'));
const assets = resolve('app/desktop/dist');
const json = async (path: string) => JSON.parse(await readFile(join(assets, path), 'utf8'));

test('fresh native origins normalize to the reader root without losing requested state', () => {
  assert.equal(desktopStartPath('tauri://localhost'), '/');
  assert.equal(desktopStartPath('tauri://localhost?translation=YLT'), '/?translation=YLT');
  assert.equal(desktopStartPath('http://tauri.localhost/index.html#reading'), '/#reading');
  assert.equal(desktopStartPath('tauri://localhost/read/EPH/2?passage=EPH.2.1'), null);
  assert.equal(desktopStartPath('http://127.0.0.1:1421/'), null);
});

test('desktop release candidate has a signed, user-controlled stable updater configuration', async () => {
  const config = JSON.parse(await readFile('app/desktop/src-tauri/tauri.conf.json', 'utf8'));
  const capability = JSON.parse(await readFile('app/desktop/src-tauri/capabilities/default.json', 'utf8'));
  const publicKey = (await readFile('deployment/desktop-updater-public.txt', 'utf8')).trim();
  assert.equal(config.version, '1.0.0-rc.1');
  assert.equal(config.bundle.createUpdaterArtifacts, true);
  assert.equal(config.plugins.updater.pubkey, publicKey);
  assert.deepEqual(config.plugins.updater.endpoints, ['https://ad-fontes.app/desktop-updates/stable/latest.json']);
  assert.ok(capability.permissions.includes('updater:default'));
  assert.ok(capability.permissions.includes('process:allow-restart'));
  assert.ok(!capability.permissions.includes('process:default'));
  const source = await readFile('app/desktop/update-manager.tsx', 'utf8');
  assert.match(source, /24 \* 60 \* 60 \* 1000/);
  assert.match(source, /Download and install/);
  assert.doesNotMatch(source, /downloadAndInstall\([^)]*useEffect/);
  const windowsConfig = JSON.parse(await readFile('app/desktop/src-tauri/tauri.windows.release.conf.json', 'utf8'));
  const signingScript = await readFile('app/desktop/src-tauri/windows_artifact_sign.ps1', 'utf8');
  assert.match(windowsConfig.bundle.windows.signCommand, /-File windows_artifact_sign\.ps1 %1$/);
  assert.match(signingScript, /AZURE_ARTIFACT_SIGNING_ENDPOINT/);
  assert.match(signingScript, /signtool\.exe verify \/pa \/all \/v/);
  assert.doesNotMatch(signingScript, /[A-Za-z0-9_-]+\.codesigning\.azure\.net/);
  const macConfig = JSON.parse(await readFile('app/desktop/src-tauri/tauri.macos.release.conf.json', 'utf8'));
  const macRelease = await readFile('deployment/build-macos-release.sh', 'utf8');
  assert.equal(macConfig.bundle.macOS.minimumSystemVersion, '14.0');
  assert.match(macRelease, /APPLE_SIGNING_IDENTITY/);
  assert.match(macRelease, /stapler validate/);
  assert.match(macRelease, /TAURI_SIGNING_PRIVATE_KEY/);
});

test('desktop bundles every released file unchanged and excludes account/private assets', async () => {
  const manifest = await json('desktop-content.json');
  assert.equal(manifest.editions.length, 7);
  assert.ok(Object.keys(manifest.files).length > 13000);
  for (const [path, expected] of Object.entries(manifest.files)) {
    assert.match(path, /^(corpus|analysis|editorial|lexical|om)\//);
    assert.doesNotMatch(path, /(^|\/)(\.env|raw|evidence|server|api|account|backups)(\/|$)/);
    const bytes = await readFile(join(assets, path));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), expected, path);
    assert.deepEqual(bytes, await readFile(join('app/public', path)), path);
  }
  for (const file of await readdir(join(assets, 'assets'))) {
    if (file.endsWith('.js')) assert.doesNotMatch(await readFile(join(assets, 'assets', file), 'utf8'), /\/api\/(account|notes)/);
  }
});

test('all editions and search operate using only packaged files; missing data stays unavailable', async () => {
  const load = async (path: string) => json(path.slice(1));
  let chaptersChecked = 0;
  for (const edition of editions) {
    const adapter = createLocalAdapter(load, edition.editionId);
    for (const book of books) {
      for (let chapter = 1; chapter <= book.verses.length; chapter++) {
        assert.equal((await adapter.getChapter(book.code, chapter)).releaseId, edition.releaseId);
        chaptersChecked++;
      }
    }
  }
  assert.equal(chaptersChecked, 7 * 260);
  const bsb = createLocalAdapter(load);
  assert.ok((await bsb.searchText('grace', 'EPH')).hits.some(hit => hit.anchor === 'EPH.2.8'));
  const missing = createLocalAdapter(async () => { throw Error('missing file'); });
  await assert.rejects(missing.getChapter('JHN', 1), /data error, not a verse omitted/);
});

test('packaged Greek analysis, dictionary, occurrences and OM article work with network forbidden', async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async input => {
    assert.equal(typeof input, 'string');
    const path = input as string;
    assert.ok(path.startsWith('/') && !path.startsWith('//'), `Network request forbidden: ${path}`);
    return new Response(await readFile(join(assets, path.slice(1))), { status: 200 });
  };
  try {
    const analysis = await getAnalysis([{ start: 'EPH.2.1', end: 'EPH.2.1' }]);
    const token = analysis.flatMap(segment => segment.tokens).find(token => token.surface === 'νεκροὺς')!;
    assert.ok(token);
    assert.equal((await getOccurrences(token.lemmaId)).hits.length, 128);
    assert.equal((await getLexicon(token.strongs))?.id, 'G3498');
    const lookup = resolveLookup(await json('lexical/dodson-2010-v3/lookup.json'), token);
    const bundle = await json(`om/${om.releaseId}/index.json`);
    const summary = bundle.articles.find((article: {url: string}) => lookup.links.some(link => link.url === article.url));
    assert.equal(bundle.articles.length, 250);
    const { article } = await json(`om/${om.releaseId}/articles/${summary.slug}.json`);
    assert.equal(article.slug, 'nekros');
    const directory = `sources/om-studies/${om.releaseId}`;
    const source = await readFile(join(directory, article.sourcePath), 'utf8');
    assert.equal(createHash('sha256').update(source).digest('hex'), article.contentSha256);
    assert.equal(source.split(/^---\r?$/m).slice(2).join('---').replace(/^\r?\n/, ''), article.markdown);
    assert.match(article.markdown, /Colossians 2:13, BSB/);
    assert.doesNotMatch(article.markdown, /\bNET\b/);
    assert.match(article.markdown, /COPY APPROVED/);
  } finally { globalThis.fetch = original; }
});
