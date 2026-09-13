import test from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { promisify } from 'node:util';

const exec = promisify(execFile);

test('CSNTM discovery covers every approved comparison without promoting unverified pages', async () => {
  const { stdout } = await exec(process.execPath, ['scripts/verify_csntm_discovery.mts']);
  assert.match(stdout, /39 units, 86 searches, 2,345 matches, 147 priority candidates, 200 image records/);
  const pages = JSON.parse(await readFile('sources/visuals/csntm-discovery-2026-09-12-v1-candidate/page-candidates.json', 'utf8'));
  assert.equal(pages.units.filter((unit: { approvedPlate: unknown }) => unit.approvedPlate).length, 4);
  assert.equal(pages.units.find((unit: { unitId: string }) => unit.unitId === 'candidate-26').discoveredManuscriptCount, 0);
  assert.equal(pages.units.find((unit: { unitId: string }) => unit.unitId === 'candidate-26').approvedPlate.images[0].imageId, '142025');
  assert.match(pages.statement, /reading.*remain unverified/i);
});
