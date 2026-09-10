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
    const output = join(root, 'output');
    await writeFile(bundle, 'signed update fixture');
    await writeFile(signature, 'fixture-signature');
    await exec(process.execPath, [
      'scripts/desktop_update_manifest.mts',
      '--version', '1.0.0-rc.1',
      '--output', output,
      '--base-url', 'https://ad-fontes.app/desktop-updates',
      '--pub-date', '2026-09-10T00:00:00Z',
      '--notes', 'Release candidate',
      '--mac-bundle', bundle,
      '--mac-signature', signature,
    ]);
    const manifest = JSON.parse(await readFile(join(output, 'stable/latest.json'), 'utf8'));
    assert.equal(manifest.version, '1.0.0-rc.1');
    assert.deepEqual(Object.keys(manifest.platforms), ['darwin-aarch64']);
    assert.equal(manifest.platforms['darwin-aarch64'].signature, 'fixture-signature');
    assert.equal(manifest.platforms['darwin-aarch64'].url, 'https://ad-fontes.app/desktop-updates/releases/1.0.0-rc.1/ad-fontes-nt-1.0.0-rc.1-darwin-aarch64.app.tar.gz');
    assert.match(await readFile(join(output, 'SHA256SUMS'), 'utf8'), /^[0-9a-f]{64}  releases\/1\.0\.0-rc\.1\/ad-fontes-nt-1\.0\.0-rc\.1-darwin-aarch64\.app\.tar\.gz$/m);
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
