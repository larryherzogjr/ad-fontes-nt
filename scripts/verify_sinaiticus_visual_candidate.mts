import { createHash } from 'node:crypto';
import { readFile, readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { reviewPayload } from '../app/lib/domain/variants.ts';

const root = join('sources', 'visuals', 'csntm-sinaiticus-2026-09-12-v2');
const sha256 = (value: string | Buffer) => createHash('sha256').update(value).digest('hex');
const json = async (path: string) => JSON.parse(await readFile(path, 'utf8'));
function stable(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => [key, stable(item)]));
  return value;
}
function check(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const [manifest, approval, evidence, registry, variants, priorManifest] = await Promise.all([
  json(join(root, 'MANIFEST.json')),
  json(join(root, 'APPROVAL.json')),
  json(join(root, 'sinaiticus-evidence.json')),
  json(join(root, 'registry.candidate.json')),
  json('content/editorial/variants.json'),
  json('sources/visuals/csntm-2026-09-12-v1/MANIFEST.json'),
]);
check(priorManifest.candidateSha256 === '6376169b7283a63288181286478c5cf6cfe2f5c4ce4bd4e3fb521055ab054318', 'Approved v1 release changed.');
check(manifest.releaseId === 'csntm-sinaiticus-2026-09-12-v2', 'Wrong candidate release.');
check(approval.candidateSha256 === manifest.candidateSha256 && approval.approvedBy === 'Larry Herzog Jr.', 'Supplement lacks exact owner approval.');
const manifestCore = { ...manifest };
delete manifestCore.candidateSha256;
check(sha256(JSON.stringify(stable(manifestCore))) === manifest.candidateSha256, 'Candidate hash mismatch.');
for (const [relative, expected] of Object.entries(manifest.inputs) as [string, string][]) {
  if (relative === 'content/editorial/variants.json') {
    const approvedPredecessor = Buffer.from(`${JSON.stringify(variants.slice(0, 39), null, 2)}\n`);
    check(sha256(approvedPredecessor) === expected, `Approved 39-unit predecessor checksum mismatch: ${relative}`);
  } else {
    check(sha256(await readFile(relative)) === expected, `Input checksum mismatch: ${relative}`);
  }
}
for (const [relative, expected] of Object.entries(manifest.outputs) as [string, string][]) {
  check(sha256(await readFile(join(root, relative))) === expected, `Output checksum mismatch: ${relative}`);
}
for (const [relative, expected] of Object.entries(manifest.sourceFiles) as [string, string][]) {
  check(sha256(await readFile(join(root, relative))) === expected, `Source checksum mismatch: ${relative}`);
}

check(evidence.units.length === 39 && Object.keys(registry.plates).length === 39, 'Expected 39 Sinaiticus mappings and plates.');
check(registry.status === 'candidate' && registry.editorialReview.status === 'pending', 'Candidate must remain unapproved.');
check(registry.relationship.preservesRelease === 'csntm-2026-09-12-v1', 'Supplement must preserve v1.');
check(!/P52|P\.52|Papyrus 52/.test(JSON.stringify(registry)), 'P52 is outside these article plates.');
const ids = evidence.units.map((unit: any) => unit.unitId);
check(new Set(ids).size === 39 && ids.every((id: string, index: number) => id === `candidate-${String(index + 1).padStart(2, '0')}`), 'Unit identity mismatch.');
const commentary = new Map(variants.map((unit: any) => [unit.id, unit]));
const imageIds = new Set<string>();
for (const unit of evidence.units) {
  const plate = registry.plates[unit.unitId];
  const article: any = commentary.get(unit.unitId);
  check(article?.status === 'approved', `${unit.unitId} commentary is not approved.`);
  check(plate.commentaryPayloadSha256 === sha256(reviewPayload(article)), `${unit.unitId} commentary binding is stale.`);
  check(unit.readingReviewStatus === 'primary-transcription-verified-candidate', `${unit.unitId} lacks transcription review.`);
  check(unit.proposedCaptionClaim.length > 35, `${unit.unitId} claim is too short.`);
  check(plate.doesNotEstablish.includes('does not by itself'), `${unit.unitId} lacks an evidence limit.`);
  check(plate.reuseStatement.includes('free educational web and offline desktop'), `${unit.unitId} lacks reuse scope.`);
  check(plate.images.length === unit.pages.length && plate.images.length > 0, `${unit.unitId} image mapping mismatch.`);
  for (const image of plate.images) {
    check(!image.asset.startsWith('/') && !/^[a-z]+:/i.test(image.asset) && !image.asset.includes('..'), `${unit.unitId} image must be local.`);
    check(image.alt.length > 60, `${unit.unitId} alt text is too short.`);
    const bytes = await readFile(join(root, image.asset));
    check(bytes[0] === 0xff && bytes[1] === 0xd8 && bytes.at(-2) === 0xff && bytes.at(-1) === 0xd9, `${image.asset} is not a complete JPEG.`);
    const info = await json(join(root, 'evidence', 'iiif-info', `${image.sourceImageName}.json`));
    check(image.width === Number(info.width) && image.height === Number(info.height), `${image.asset} dimensions do not match IIIF metadata.`);
    const detail = await readFile(join(root, 'evidence', 'image-details', `${image.sourceImageId}.html`), 'utf8');
    check(detail.includes(`CSNTM Image Id</b>: ${image.sourceImageId}`) && detail.includes(`CSNTM Image Name</b>: ${image.sourceImageName}`), `${image.asset} item record mismatch.`);
    imageIds.add(image.sourceImageId);
  }
}
check(imageIds.size === 33, `Expected 33 unique pages, found ${imageIds.size}.`);
check((await readdir(join(root, 'originals'))).length === 33, 'Unexpected original-image count.');
check((await stat(join(root, 'originals'))).isDirectory(), 'Originals directory is missing.');

check(evidence.units.find((unit: any) => unit.unitId === 'candidate-02').targetVerses[0].status === 'correction-only', 'Matthew 17:21 correction layer was flattened.');
check(evidence.units.find((unit: any) => unit.unitId === 'candidate-26').proposedCaptionClaim.includes("corrector e"), '1 Timothy 3:16 correction is missing.');
check(evidence.units.find((unit: any) => unit.unitId === 'candidate-29').proposedCaptionClaim.includes('transcription assigns'), '2 Corinthians numbering attribution is missing.');
check(evidence.units.find((unit: any) => unit.unitId === 'candidate-39').proposedCaptionClaim.includes('νήπιοι'), '1 Thessalonians 2:7 first-hand reading is missing.');

console.log(`Verified 39 supplemental plates, 33 immutable CSNTM pages, ${Object.keys(manifest.sourceFiles).length} bound source files.`);
console.log(`Candidate SHA-256: ${manifest.candidateSha256}`);
