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

test('public desktop download page exposes only the approved 4.3.1 installers', async () => {
  const page = await readFile('app/app/downloads/page.tsx', 'utf8');
  assert.match(page, /Desktop release/);
  assert.doesNotMatch(page, /release candidate/i);
  assert.match(page, /beta-downloads\/4\.3\.1\/Ad-Fontes-macOS-Apple-Silicon-4\.3\.1\.dmg/);
  assert.match(page, /beta-downloads\/4\.3\.1\/Ad-Fontes-Windows-x64-4\.3\.1\.exe/);
  assert.match(page, /Version 4\.3\.1 includes whole-Bible English reading and comparison/);
  assert.match(page, /all 110 reviewed textual comparisons/);
  assert.match(page, /Version 3\.6\.0 includes the full LXX2012 English Septuagint/);
  assert.match(page, /250 Greek word studies/);
  assert.match(page, /5,400-entry Greek\s+lexicon/);
  assert.doesNotMatch(page, /private account-backed\s+notes remain available in the web app/);
  assert.doesNotMatch(page, /desktop-updates\/stable\/latest\.json/);
  assert.match(page, /https:\/\/ad-fontes\.app\/downloads/);
  assert.match(page, /https:\/\/ad-fontes\.app\/og-downloads\.png\?v=20261008/);
  assert.match(page, /summary_large_image/);
  await stat('app/public/og-downloads.png');
});

test('final public installer publication is pinned to the approved signed bytes', async () => {
  const publish = await readFile('deployment/publish-public-desktop-downloads.sh', 'utf8');
  const checksums = await readFile('deployment/public-desktop-downloads-4.3.1.sha256', 'utf8');
  assert.match(publish, /version=4\.3\.1\n/);
  assert.doesNotMatch(publish, /1\.0\.0-rc\./);
  assert.match(publish, /39ca195c9f566590a0bba1111a27b42292c6363343b1427c0d7718ea3c75b0da/);
  assert.match(publish, /f58bfd3ed82cee4f70309956e5432f36088d88d7289e67b1495b1befeb88b982/);
  assert.equal(
    checksums,
    '39ca195c9f566590a0bba1111a27b42292c6363343b1427c0d7718ea3c75b0da  Ad-Fontes-macOS-Apple-Silicon-4.3.1.dmg\n' +
      'f58bfd3ed82cee4f70309956e5432f36088d88d7289e67b1495b1befeb88b982  Ad-Fontes-Windows-x64-4.3.1.exe\n',
  );
});

test('public project status identifies the authorized 4.3.1 release', async () => {
  const reader = await readFile('app/reader/reader.tsx', 'utf8');
  assert.match(reader, /The current release and MVP were accepted on October 14, 2026/);
  assert.match(reader, /110 reviewed\s+comparison notes/);
  assert.doesNotMatch(reader, /30 reviewed comparison notes/);
  assert.match(reader, /Version 4\.3\.1 is the current cross-platform desktop release/);
  assert.doesNotMatch(reader, /Version 1\.0\.0-rc\./);
  assert.match(reader, /href="\/downloads"/);
  assert.match(reader, /Personal notes and Google sign-in have been retired/);
  assert.match(reader, /separate exact-artifact review\s+and approval workflow/);
  assert.doesNotMatch(reader, /Pilot and release verification are next/);
});
