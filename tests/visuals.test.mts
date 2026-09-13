import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import { readFile, stat } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { promisify } from 'node:util';
import { reviewPayload } from '../app/lib/domain/variants.ts';

const exec = promisify(execFile);
const releaseId = 'csntm-2026-09-12-v1';
const expectedCandidate = '6376169b7283a63288181286478c5cf6cfe2f5c4ce4bd4e3fb521055ab054318';
const directory = join('sources/visuals', releaseId);
const json = async (path: string) => JSON.parse(await readFile(path, 'utf8'));
const sha256 = (bytes: Buffer | string) => createHash('sha256').update(bytes).digest('hex');

test('visual source release is exact-hash approved and independently verifies', async () => {
  const { stdout } = await exec(process.execPath, ['scripts/verify_visual_release.mts']);
  assert.match(stdout, /4 plates, 60 bound files/);
  assert.match(stdout, new RegExp(expectedCandidate));
  const [manifest, approval, selection] = await Promise.all([
    json(join(directory, 'MANIFEST.json')),
    json(join(directory, 'APPROVAL.json')),
    json('app/lib/domain/visual-release.json'),
  ]);
  assert.equal(manifest.candidateSha256, expectedCandidate);
  assert.equal(approval.candidateSha256, expectedCandidate);
  assert.equal(approval.approvedBy, 'Larry Herzog Jr.');
  assert.equal(selection.releaseId, releaseId);
  assert.equal(selection.candidateSha256, expectedCandidate);
  assert.deepEqual(selection.supplements, [
    {
      releaseId: 'csntm-sinaiticus-2026-09-12-v2',
      candidateSha256: '6bbbd387d8faff05c2c64aba32c8b2a48e11d4ea47ad434f4beddd713a318170',
    },
    {
      releaseId: 'csntm-sinaiticus-expansion-2026-09-13-v2',
      candidateSha256: 'f707f4e5d20977c833dd3410ca11f1127dd38e0f8b49212ed4028652d4ee36e4',
    },
  ]);
});

test('approved plates retain source limits and current commentary bindings', async () => {
  const [candidate, published, manifest, units] = await Promise.all([
    json(join(directory, 'registry.candidate.json')),
    json(join('app/public/visuals', releaseId, 'registry.json')),
    json(join(directory, 'MANIFEST.json')),
    json('content/editorial/variants.json'),
  ]);
  const ids = ['candidate-11', 'candidate-17', 'candidate-26', 'candidate-27'];
  assert.deepEqual(Object.keys(candidate.plates), ids);
  assert.equal(candidate.editorialReview.status, 'pending');
  assert.equal(published.editorialReview.status, 'approved');
  assert.equal(published.editorialReview.candidateSha256, expectedCandidate);
  assert.doesNotMatch(JSON.stringify(candidate), /P52|P\.52|Papyrus 52/);
  for (const id of ids) {
    const plate = candidate.plates[id];
    const unit = units.find((value: { id: string }) => value.id === id);
    assert.equal(plate.commentaryPayloadSha256, sha256(reviewPayload(unit)));
    assert.match(plate.doesNotEstablish, /not by itself|do not by themselves/);
    assert.match(plate.reuseStatement, /free educational web and offline desktop distribution|free educational web and offline desktop/);
    for (let index = 0; index < plate.images.length; index++) {
      const sourceImage = plate.images[index];
      const publicImage = published.plates[id].images[index];
      assert.match(publicImage.asset, new RegExp(`^/visuals/${releaseId}/assets/${id}-`));
      assert.doesNotMatch(publicImage.asset, /^https?:/);
      assert.ok(sourceImage.alt.length > 40);
      assert.equal(sha256(await readFile(join(directory, sourceImage.asset))), manifest.files[sourceImage.asset]);
      assert.equal(
        sha256(await readFile(join('app/public', publicImage.asset.slice(1)))),
        manifest.files[sourceImage.asset],
      );
      await stat(join('app/public/visuals', releaseId, 'assets', `${id}-${basename(sourceImage.asset)}`));
    }
  }
  assert.match(candidate.plates['candidate-26'].caption, /first-hand reading ος/);
  assert.match(candidate.plates['candidate-26'].caption, /corrector e to θεός/);
  assert.match(candidate.plates['candidate-27'].caption, /without the expanded Father, Word, and Holy Spirit clause/);
});

test('reader exposes accessible complete-page enlargement without remote image code', async () => {
  const component = await readFile('app/reader/evidence-plate.tsx', 'utf8');
  const styles = await readFile('app/app/globals.css', 'utf8');
  const dialog = await readFile('app/components/ui/dialog.tsx', 'utf8');
  const panel = await readFile('app/reader/study-panel.tsx', 'utf8');
  assert.match(component, /Manuscript evidence plate/);
  assert.match(component, /Array\.from\(\{ length: 104 \}/);
  assert.match(component, /What this demonstrates/);
  assert.match(component, /What it cannot establish/);
  assert.match(component, /complete artifact view/);
  assert.match(component, /aria-label={`Enlarge/);
  assert.match(component, /createPortal\(/);
  assert.match(component, /<dialog/);
  assert.match(component, /showModal\(\)/);
  assert.match(component, /onCancel=/);
  assert.match(component, /event\.key === 'Escape'.*event\.stopPropagation\(\)/s);
  assert.match(component, /lightboxTriggerRef\.current\?\.focus/);
  assert.match(component, /document\.body/);
  assert.match(component, /loadRegistries/);
  assert.match(component, /uniquePlates/);
  assert.match(component, /gregoryAland.*sourceImageId/s);
  assert.match(component, /Witness \$\{index \+ 1\} of \$\{total\}/);
  assert.match(styles, /\.evidence-image-button:hover\s*\{\s*background:\s*#182126;\s*\}/);
  assert.match(dialog, /<DialogPortal container={portalContainer}>/);
  assert.doesNotMatch(component, /images\.csntm|manuscripts\.csntm/);
  assert.match(panel, /<EvidencePlate unitId={v\.id} \/>/);
});
