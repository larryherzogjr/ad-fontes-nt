import test from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';

const exec = promisify(execFile);

test('desktop update manifest is versioned, signed, HTTPS-only and immutable', async () => {
  const root = await mkdtemp(join(tmpdir(), 'afnt-release-test-'));
  try {
    const bundle = join(root, 'Ad Fontes NT.test.app.tar.gz');
    const signature = join(root, 'Ad Fontes NT.test.app.tar.gz.sig');
    const windowsBundle = join(root, 'Ad Fontes NT.test_x64-setup.exe');
    const windowsSignature = join(root, 'Ad Fontes NT.test_x64-setup.exe.sig');
    const output = join(root, 'output');
    await writeFile(bundle, 'signed update fixture');
    await writeFile(signature, 'fixture-signature');
    await writeFile(windowsBundle, 'signed Windows update fixture');
    await writeFile(windowsSignature, 'fixture-windows-signature');
    await exec(process.execPath, [
      'scripts/desktop_update_manifest.mts',
      '--version', '1.0.0-rc.1',
      '--output', output,
      '--base-url', 'https://ad-fontes.app/desktop-updates',
      '--pub-date', '2026-09-10T00:00:00Z',
      '--notes', 'Release candidate',
      '--mac-bundle', bundle,
      '--mac-signature', signature,
      '--windows-bundle', windowsBundle,
      '--windows-signature', windowsSignature,
    ]);
    const manifest = JSON.parse(await readFile(join(output, 'stable/latest.json'), 'utf8'));
    assert.equal(manifest.version, '1.0.0-rc.1');
    assert.deepEqual(Object.keys(manifest.platforms), ['darwin-aarch64', 'windows-x86_64']);
    assert.equal(manifest.platforms['darwin-aarch64'].signature, 'fixture-signature');
    assert.equal(manifest.platforms['darwin-aarch64'].url, 'https://ad-fontes.app/desktop-updates/releases/1.0.0-rc.1/ad-fontes-nt-1.0.0-rc.1-darwin-aarch64.app.tar.gz');
    assert.equal(manifest.platforms['windows-x86_64'].signature, 'fixture-windows-signature');
    assert.equal(manifest.platforms['windows-x86_64'].url, 'https://ad-fontes.app/desktop-updates/releases/1.0.0-rc.1/ad-fontes-nt-1.0.0-rc.1-windows-x86_64.exe');
    assert.match(await readFile(join(output, 'SHA256SUMS'), 'utf8'), /^[0-9a-f]{64}  releases\/1\.0\.0-rc\.1\/ad-fontes-nt-1\.0\.0-rc\.1-darwin-aarch64\.app\.tar\.gz$/m);
    assert.match(await readFile(join(output, 'SHA256SUMS'), 'utf8'), /^[0-9a-f]{64}  releases\/1\.0\.0-rc\.1\/ad-fontes-nt-1\.0\.0-rc\.1-windows-x86_64\.exe$/m);
    await assert.rejects(
      exec(process.execPath, [
        'scripts/desktop_update_manifest.mts',
        '--version', '1.0.0-rc.1',
        '--output', output,
        '--base-url', 'https://ad-fontes.app/desktop-updates',
        '--mac-bundle', bundle,
        '--mac-signature', signature,
      ]),
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('public desktop download page exposes only the approved 2.0.0 installers', async () => {
  const page = await readFile('app/app/downloads/page.tsx', 'utf8');
  assert.match(page, /Desktop release/);
  assert.doesNotMatch(page, /release candidate/i);
  assert.match(page, /beta-downloads\/2\.0\.0\/Ad-Fontes-NT-macOS-Apple-Silicon-2\.0\.0\.dmg/);
  assert.match(page, /beta-downloads\/2\.0\.0\/Ad-Fontes-NT-Windows-x64-2\.0\.0\.exe/);
  assert.match(page, /Version 2\.0\.0 brings whole-Bible English reading and comparison/);
  assert.match(page, /all 104 reviewed textual comparisons/);
  assert.match(page, /250 Greek word studies/);
  assert.match(page, /5,400-entry Greek\s+lexicon/);
  assert.doesNotMatch(page, /private account-backed\s+notes remain available in the web app/);
  assert.doesNotMatch(page, /desktop-updates\/stable\/latest\.json/);
  assert.match(page, /https:\/\/ad-fontes\.app\/downloads/);
  assert.match(page, /https:\/\/ad-fontes\.app\/og-downloads\.png\?v=20260911/);
  assert.match(page, /summary_large_image/);
  await stat('app/public/og-downloads.png');
});

test('final public installer publication is pinned to the approved signed bytes', async () => {
  const publish = await readFile('deployment/publish-public-desktop-downloads.sh', 'utf8');
  const checksums = await readFile('deployment/public-desktop-downloads-2.0.0.sha256', 'utf8');
  assert.match(publish, /version=2\.0\.0\n/);
  assert.doesNotMatch(publish, /1\.0\.0-rc\./);
  assert.match(publish, /ba0ed8efb48c54bbd536fd23e4e17c9259917e3c4fdd2cfbecea41ecb528150b/);
  assert.match(publish, /c7014040c30de0ad28b1c8736a46ba71f5b4f3a6ab9c90c72b8955b750e68984/);
  assert.equal(
    checksums,
    'ba0ed8efb48c54bbd536fd23e4e17c9259917e3c4fdd2cfbecea41ecb528150b  Ad-Fontes-NT-macOS-Apple-Silicon-2.0.0.dmg\n' +
      'c7014040c30de0ad28b1c8736a46ba71f5b4f3a6ab9c90c72b8955b750e68984  Ad-Fontes-NT-Windows-x64-2.0.0.exe\n',
  );
});

test('public project status identifies the approved 2.0.0 release', async () => {
  const reader = await readFile('app/reader/reader.tsx', 'utf8');
  assert.match(reader, /Whole-Bible pilot and release acceptance remain in progress/);
  assert.match(reader, /104 reviewed\s+comparison notes/);
  assert.doesNotMatch(reader, /30 reviewed comparison notes/);
  assert.match(reader, /Version 2\.0\.0 is the current cross-platform desktop release/);
  assert.doesNotMatch(reader, /Version 1\.0\.0-rc\./);
  assert.match(reader, /href="\/downloads"/);
  assert.match(reader, /Personal notes and Google sign-in have been retired/);
  assert.match(reader, /separate exact-artifact review\s+and approval workflow/);
  assert.doesNotMatch(reader, /Pilot and release verification are next/);
});
