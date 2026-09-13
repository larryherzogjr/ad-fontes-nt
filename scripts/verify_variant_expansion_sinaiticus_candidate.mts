import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { reviewPayload } from '../app/lib/domain/variants.ts';

const root = join('sources', 'visuals', 'csntm-sinaiticus-expansion-2026-09-13-v2');
const promotedInputAliases = new Map([
  [
    'artifacts/editorial/variant-expansion-2026-09-13-candidate-v2/NEW-UNITS.json',
    'docs/editorial-review/variant-expansion-2026-09-13/evidence/NEW-UNITS.json',
  ],
]);
const sha256 = (value: string | Buffer) => createHash('sha256').update(value).digest('hex');
const json = async (path: string) => JSON.parse(await readFile(path, 'utf8'));
function stable(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === 'object')
    return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => [key, stable(item)]));
  return value;
}
function check(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const [manifest, approval, evidence, registry, units, priorManifest] = await Promise.all([
  json(join(root, 'MANIFEST.json')),
  json(join(root, 'APPROVAL.json')),
  json(join(root, 'sinaiticus-evidence.json')),
  json(join(root, 'registry.candidate.json')),
  json('content/editorial/variants.json'),
  json('sources/visuals/csntm-sinaiticus-2026-09-12-v2/MANIFEST.json'),
]);
check(priorManifest.candidateSha256 === '6bbbd387d8faff05c2c64aba32c8b2a48e11d4ea47ad434f4beddd713a318170', 'Approved Sinaiticus predecessor changed.');
check(manifest.releaseId === 'csntm-sinaiticus-expansion-2026-09-13-v2', 'Wrong expansion evidence release.');
check(approval.candidateSha256 === manifest.candidateSha256 && approval.approvedBy === 'Larry Herzog Jr.' && approval.approvalDate === '2026-09-13', 'Expansion visual release lacks exact owner approval.');
const manifestCore = { ...manifest };
delete manifestCore.candidateSha256;
check(sha256(JSON.stringify(stable(manifestCore))) === manifest.candidateSha256, 'Candidate hash mismatch.');
for (const [relative, expected] of Object.entries(manifest.inputs) as [string, string][])
  check(sha256(await readFile(promotedInputAliases.get(relative) ?? relative)) === expected, `Input checksum mismatch: ${relative}`);
for (const [relative, expected] of Object.entries(manifest.outputs) as [string, string][])
  check(sha256(await readFile(join(root, relative))) === expected, `Output checksum mismatch: ${relative}`);
for (const [relative, expected] of Object.entries(manifest.sourceFiles) as [string, string][])
  check(sha256(await readFile(join(root, relative))) === expected, `Source checksum mismatch: ${relative}`);

check(evidence.units.length === 65 && Object.keys(registry.plates).length === 65 && units.length === 104, 'Expected 65 evidence units, plates, and 104 total commentary units.');
check(registry.status === 'candidate' && registry.editorialReview.status === 'pending', 'Evidence candidate must remain unapproved.');
const ids = evidence.units.map((unit: any) => unit.unitId);
check(ids.every((id: string, index: number) => id === `candidate-${40 + index}`), 'Expansion unit identity mismatch.');
const commentary = new Map(units.map((unit: any) => [unit.id, unit]));
const imageIds = new Set<string>();
for (const unit of evidence.units) {
  const plate = registry.plates[unit.unitId];
  const article: any = commentary.get(unit.unitId);
  check(article?.status === 'approved', `${unit.unitId} commentary is not approved.`);
  check(plate.commentaryPayloadSha256 === sha256(reviewPayload(article)), `${unit.unitId} commentary binding is stale.`);
  check(unit.readingReviewStatus === 'primary-transcription-verified-candidate', `${unit.unitId} lacks transcription review.`);
  check(unit.proposedCaptionClaim.length > 35 && !unit.proposedCaptionClaim.includes('pending'), `${unit.unitId} claim is incomplete.`);
  check(plate.caption.endsWith(unit.proposedCaptionClaim), `${unit.unitId} caption differs from its evidence claim.`);
  check(plate.doesNotEstablish.includes('does not by itself'), `${unit.unitId} lacks an evidence limit.`);
  check(plate.images.length === unit.pages.length && plate.images.length > 0, `${unit.unitId} image mapping mismatch.`);
  for (const image of plate.images) {
    check(!image.asset.startsWith('/') && !/^[a-z]+:/i.test(image.asset) && !image.asset.includes('..'), `${unit.unitId} image must remain local.`);
    const bytes = await readFile(join(root, image.asset));
    check(bytes[0] === 0xff && bytes[1] === 0xd8 && bytes.at(-2) === 0xff && bytes.at(-1) === 0xd9, `${image.asset} is not a complete JPEG.`);
    const info = await json(join(root, 'evidence', 'iiif-info', `${image.sourceImageName}.json`));
    check(image.width === Number(info.width) && image.height === Number(info.height), `${image.asset} dimensions differ from IIIF metadata.`);
    const detail = await readFile(join(root, 'evidence', 'image-details', `${image.sourceImageId}.html`), 'utf8');
    check(detail.includes(`CSNTM Image Id</b>: ${image.sourceImageId}`) && detail.includes(`CSNTM Image Name</b>: ${image.sourceImageName}`), `${image.asset} item record mismatch.`);
    imageIds.add(image.sourceImageId);
  }
}
check(imageIds.size === 60, `Expected 60 unique pages, found ${imageIds.size}.`);
check((await readdir(join(root, 'originals'))).length === 60, 'Unexpected original-image count.');
check(evidence.units.find((unit: any) => unit.unitId === 'candidate-42').targetVerses[0].status === 'correction-only', 'Matthew 12:47 correction-only state was flattened.');
check(evidence.units.find((unit: any) => unit.unitId === 'candidate-46').proposedCaptionClaim.includes('deletes') && evidence.units.find((unit: any) => unit.unitId === 'candidate-46').proposedCaptionClaim.includes('restores'), 'Matthew 24:36 correction history is incomplete.');
check(evidence.units.find((unit: any) => unit.unitId === 'candidate-63').proposedCaptionClaim.includes('Chosen One') && evidence.units.find((unit: any) => unit.unitId === 'candidate-63').proposedCaptionClaim.includes('Son of God'), 'John 1:34 correction history is incomplete.');
check(evidence.units.find((unit: any) => unit.unitId === 'candidate-104').proposedCaptionClaim.includes('six hundred sixty-six'), 'Revelation 13:18 reading is missing.');

console.log(`Verified 65 proposed plates, 60 immutable CSNTM pages, and ${Object.keys(manifest.sourceFiles).length} bound source files.`);
console.log(`Candidate SHA-256: ${manifest.candidateSha256}`);
