import test from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { readFile, readdir } from 'node:fs/promises';

const exec = promisify(execFile);

test('approved Sinaiticus supplemental visual release verifies offline', async () => {
  const { stdout } = await exec(process.execPath, ['scripts/verify_sinaiticus_visual_candidate.mts']);
  assert.match(stdout, /39 supplemental plates, 33 immutable CSNTM pages, 99 bound source files/);
  assert.match(stdout, /Candidate SHA-256: [a-f0-9]{64}/);
  const registry = JSON.parse(await readFile('app/public/visuals/csntm-sinaiticus-2026-09-12-v2/registry.json', 'utf8'));
  assert.equal(registry.status, 'approved');
  assert.equal(registry.editorialReview.candidateSha256, '6bbbd387d8faff05c2c64aba32c8b2a48e11d4ea47ad434f4beddd713a318170');
  assert.equal(Object.keys(registry.plates).length, 39);
  assert.equal((await readdir('app/public/visuals/csntm-sinaiticus-2026-09-12-v2/assets')).length, 33);
  assert.match(registry.plates['candidate-02'].caption, /corrector cb2 supplies the verse/);
  assert.match(registry.plates['candidate-39'].caption, /νήπιοι/);
});
