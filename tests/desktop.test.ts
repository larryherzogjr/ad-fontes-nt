import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join, resolve } from 'node:path';
import { createLocalAdapter, editions } from '../app/lib/domain/corpus.ts';
import { books } from '../app/lib/domain/references.ts';
import { getAnalysis, getOccurrences, getLexicon } from '../app/lib/domain/greek.ts';
import { resolveLookup } from '../app/lib/domain/lexical.ts';
import { desktopStartPath } from '../app/desktop/navigation.ts';

const om = JSON.parse(await readFile('app/lib/domain/om-release.json', 'utf8'));
const visuals = JSON.parse(await readFile('app/lib/domain/visual-release.json', 'utf8'));
const visualSelections = [
  { releaseId: visuals.releaseId, candidateSha256: visuals.candidateSha256 },
  ...visuals.supplements,
];
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
  assert.equal(config.version, '1.0.0-rc.11');
  assert.equal(config.bundle.createUpdaterArtifacts, true);
  const unsignedWindowsConfig = JSON.parse(await readFile('app/desktop/ci-no-frontend-build.json', 'utf8'));
  assert.equal(unsignedWindowsConfig.bundle.createUpdaterArtifacts, false);
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
  const windowsCiConfig = JSON.parse(await readFile('app/desktop/ci-windows-release.json', 'utf8'));
  const signingScript = await readFile('app/desktop/src-tauri/windows_artifact_sign.ps1', 'utf8');
  assert.equal(windowsConfig.bundle.windows.signCommand, 'ad-fontes-artifact-sign.cmd %1');
  assert.equal(windowsCiConfig.bundle.windows.signCommand, 'ad-fontes-artifact-sign.cmd %1');
  assert.equal(windowsCiConfig.build.beforeBuildCommand, '');
  assert.match(signingScript, /AZURE_ARTIFACT_SIGNING_ENDPOINT/);
  assert.match(signingScript, /AzureCliCredential/);
  assert.match(signingScript, /timestamp\.acs\.microsoft\.com/);
  assert.match(signingScript, /verify \/pa \/all \/v/);
  assert.doesNotMatch(signingScript, /AZURE_CLIENT_SECRET/);
  assert.doesNotMatch(signingScript, /[A-Za-z0-9_-]+\.codesigning\.azure\.net/);
  const windowsReleaseWorkflow = await readFile('.github/workflows/windows-release.yml', 'utf8');
  assert.match(windowsReleaseWorkflow, /id-token: write/);
  assert.match(windowsReleaseWorkflow, /github\.ref == 'refs\/heads\/main'/);
  assert.match(windowsReleaseWorkflow, /azure\/login@[a-f0-9]{40}/);
  assert.doesNotMatch(windowsReleaseWorkflow, /AZURE_CLIENT_SECRET/);
  assert.match(windowsReleaseWorkflow, /8bfdfb6ca2633f531cf80b5fa22512ba61a394d7988f0970db83baadc67929ed/);
  assert.match(windowsReleaseWorkflow, /74bd7d27e6ce1051409c38d9b46bc8df0400ecd643d51ffbf2ac00869061e40b/);
  assert.match(windowsReleaseWorkflow, /Verify Artifact Signing service/);
  assert.match(windowsReleaseWorkflow, /ad-fontes-artifact-sign\.cmd/);
  assert.match(windowsReleaseWorkflow, /\$signature = "\$\(\$installers\[0\]\.FullName\)\.sig"/);
  assert.doesNotMatch(windowsReleaseWorkflow, /target\/release\/ad-fontes-nt-desktop\.exe/);
  assert.doesNotMatch(windowsReleaseWorkflow, /\.nsis\.zip/);
  assert.doesNotMatch(windowsReleaseWorkflow, /msiexec/i);
  const macConfig = JSON.parse(await readFile('app/desktop/src-tauri/tauri.macos.release.conf.json', 'utf8'));
  const macRelease = await readFile('deployment/build-macos-release.sh', 'utf8');
  assert.equal(macConfig.bundle.macOS.minimumSystemVersion, '14.0');
  assert.match(macRelease, /APPLE_SIGNING_IDENTITY/);
  assert.match(macRelease, /--config src-tauri\/tauri\.macos\.release\.conf\.json/);
  assert.match(macRelease, /notarytool submit "\$dmg"/);
  assert.match(macRelease, /stapler staple "\$dmg"/);
  assert.match(macRelease, /stapler validate/);
  assert.match(macRelease, /TAURI_SIGNING_PRIVATE_KEY/);
  assert.match(macRelease, /Ad Fontes NT_\$\{version\}_aarch64\.dmg/);
  assert.match(macRelease, /CFBundleShortVersionString/);
  assert.doesNotMatch(macRelease, /-name '\*\.dmg' -print -quit/);
});

test('desktop bundles every released file unchanged and excludes account/private assets', async () => {
  const manifest = await json('desktop-content.json');
  assert.equal(manifest.editions.length, 7);
  assert.ok(Object.keys(manifest.files).length > 13000);
  for (const [path, expected] of Object.entries(manifest.files)) {
    assert.match(path, /^(corpus|analysis|editorial|lexical|om|library|visuals)\//);
    assert.doesNotMatch(path, /(^|\/)(\.env|raw|evidence|server|api|account|backups)(\/|$)/);
    const bytes = await readFile(join(assets, path));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), expected, path);
    assert.deepEqual(bytes, await readFile(join('app/public', path)), path);
  }
  const library = await json('library/index.json');
  assert.equal(library.comparisonCount, 39);
  assert.equal(library.articleCount, 250);
  assert.equal(library.lemmaCount, 5400);
  assert.deepEqual(manifest.visuals, visualSelections);
  for (const visual of visualSelections) {
    const plateRegistry = await json(`visuals/${visual.releaseId}/registry.json`);
    assert.equal(plateRegistry.status, 'approved');
    assert.equal(plateRegistry.editorialReview.candidateSha256, visual.candidateSha256);
    for (const plate of Object.values(plateRegistry.plates) as any[]) for (const image of plate.images) {
      assert.match(image.asset, new RegExp(`^/visuals/${visual.releaseId}/assets/`));
      await stat(join(assets, image.asset.slice(1)));
    }
  }
  const originalRegistry = await json(`visuals/${visuals.releaseId}/registry.json`);
  assert.deepEqual(Object.keys(originalRegistry.plates), ['candidate-11', 'candidate-17', 'candidate-26', 'candidate-27']);
  const supplement = await json(`visuals/${visuals.supplements[0].releaseId}/registry.json`);
  assert.equal(Object.keys(supplement.plates).length, 39);
  assert.equal((await readdir(join(assets, 'visuals', visuals.supplements[0].releaseId, 'assets'))).length, 33);
  for (const file of await readdir(join(assets, 'assets'))) {
    if (file.endsWith('.js')) assert.doesNotMatch(await readFile(join(assets, 'assets', file), 'utf8'), /\/api\/(account|notes)/);
  }
});

test('the shared macOS and Windows reader bundle includes reader controls and edition summaries', async () => {
  const scripts = await readdir(join(assets, 'assets'));
  const javascript = (
    await Promise.all(
      scripts
        .filter(file => file.endsWith('.js'))
        .map(file => readFile(join(assets, 'assets', file), 'utf8')),
    )
  ).join('\n');
  assert.match(javascript, /Copy with reference/);
  assert.match(javascript, /Copy selection/);
  assert.match(javascript, /Selection copied with reference/);
  assert.match(javascript, /Copied with reference\./);
  assert.match(javascript, /Clipboard copy was unavailable\./);
  assert.match(javascript, /Berean Standard Bible/);
  assert.match(javascript, /Young’s Literal Translation \(1898\)/);
  assert.match(javascript, /Edition summary/);
  assert.match(javascript, /Omits reading/);
  assert.match(javascript, /Edition agreement is not manuscript evidence/);
  assert.match(javascript, /Manuscript evidence plate/);
  assert.match(javascript, /cannot establish/);
  assert.match(javascript, /complete artifact view/);
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
    const lookup = resolveLookup(await json('lexical/dodson-2010-v5/lookup.json'), token);
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
