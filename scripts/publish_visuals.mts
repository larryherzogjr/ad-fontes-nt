import { createHash } from 'node:crypto';
import { cp, mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { basename, join, resolve } from 'node:path';
import { reviewPayload } from '../app/lib/domain/variants.ts';

const root = resolve(import.meta.dirname, '..');
const selection = JSON.parse(await readFile(join(root, 'app/lib/domain/visual-release.json'), 'utf8'));
const selections = [
  { releaseId: selection.releaseId, candidateSha256: selection.candidateSha256 },
  ...(selection.supplements ?? []),
];
const units = JSON.parse(await readFile(join(root, 'content/editorial/variants.json'), 'utf8'));
const sha256 = (value: string | Buffer) => createHash('sha256').update(value).digest('hex');
const known = new Map(units.map((unit: { id: string }) => [unit.id, unit]));
for (const selected of selections) {
  const release = join(root, 'sources/visuals', selected.releaseId);
  const [manifest, approval, registry] = await Promise.all([
    readFile(join(release, 'MANIFEST.json'), 'utf8').then(JSON.parse),
    readFile(join(release, 'APPROVAL.json'), 'utf8').then(JSON.parse),
    readFile(join(release, 'registry.candidate.json'), 'utf8').then(JSON.parse),
  ]);
  if (manifest.releaseId !== selected.releaseId || manifest.candidateSha256 !== selected.candidateSha256 || approval.candidateSha256 !== selected.candidateSha256 || approval.approvedBy !== 'Larry Herzog Jr.') {
    throw new Error(`Selected visual release ${selected.releaseId} lacks exact owner approval.`);
  }
  const destination = join(root, 'app/public/visuals', selected.releaseId);
  await rm(destination, { recursive: true, force: true });
  await mkdir(join(destination, 'assets'), { recursive: true });
  const published = structuredClone(registry);
  published.status = 'approved';
  published.editorialReview = {
    status: 'approved',
    approvedBy: approval.approvedBy,
    approvalDate: approval.approvalDate,
    candidateSha256: approval.candidateSha256,
  };
  const copied = new Map<string, string>();
  for (const [unitId, plate] of Object.entries(published.plates) as [string, any][]) {
    const unit: any = known.get(unitId);
    if (!unit || unit.status !== 'approved' || sha256(reviewPayload(unit)) !== plate.commentaryPayloadSha256) {
      throw new Error(`${unitId} visual plate has a stale commentary binding.`);
    }
    for (const image of plate.images) {
      if (/^[a-z]+:/i.test(image.asset) || image.asset.startsWith('/') || image.asset.split('/').includes('..')) throw new Error(`${unitId} has a non-local image path.`);
      const sourceAsset = image.asset;
      const source = join(release, sourceAsset);
      if (!(await stat(source)).isFile()) throw new Error(`${unitId} image is missing.`);
      const expected = (manifest.files ?? manifest.sourceFiles)[sourceAsset];
      if (!expected || sha256(await readFile(source)) !== expected) throw new Error(`${unitId} image checksum mismatch.`);
      let outputName = copied.get(sourceAsset);
      if (!outputName) {
        outputName = selected.releaseId === 'csntm-2026-09-12-v1' ? `${unitId}-${basename(sourceAsset)}` : basename(sourceAsset);
        await cp(source, join(destination, 'assets', outputName));
        copied.set(sourceAsset, outputName);
      }
      image.asset = `/visuals/${selected.releaseId}/assets/${outputName}`;
    }
  }
  await writeFile(join(destination, 'registry.json'), `${JSON.stringify(published, null, 2)}\n`);
  console.log(`Published ${Object.keys(published.plates).length} approved manuscript evidence plates from ${selected.releaseId}.`);
}
