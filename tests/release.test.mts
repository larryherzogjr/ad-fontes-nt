import test from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
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

test('public desktop download page exposes only the approved RC3 installers', async () => {
  const page = await readFile('app/app/downloads/page.tsx', 'utf8');
  assert.match(page, /Desktop release candidate/);
  assert.match(page, /1\.0\.0-rc\.3/);
  assert.match(page, /Ad-Fontes-NT-macOS-Apple-Silicon-1\.0\.0-rc\.3\.dmg/);
  assert.match(page, /Ad-Fontes-NT-Windows-x64-1\.0\.0-rc\.3\.exe/);
  assert.match(page, /private account-backed notes\s+remain available in the web app/);
  assert.doesNotMatch(page, /desktop-updates\/stable\/latest\.json/);
});
