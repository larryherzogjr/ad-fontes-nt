/** Promote only the exact 65-unit expansion explicitly approved by Larry Herzog Jr. */
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { reviewPayload, type Review, type Variant } from '../app/lib/domain/variants.ts';

const root = new URL('../', import.meta.url);
const candidateRoot = new URL('artifacts/editorial/variant-expansion-2026-09-13-candidate-v2/', root);
const reviewRoot = new URL('docs/editorial-review/variant-expansion-2026-09-13/', root);
const evidenceRoot = new URL('evidence/', reviewRoot);
const manifestUrl = new URL('CANDIDATE-MANIFEST.json', candidateRoot);
const validationUrl = new URL('VALIDATION.json', candidateRoot);
const newUnitsUrl = new URL('NEW-UNITS.json', candidateRoot);
const variantsUrl = new URL('content/editorial/variants.json', root);
const reviewsUrl = new URL('content/editorial/reviews.json', root);
const approvalUrl = new URL('APPROVAL.md', reviewRoot);
const approvedManifestSha256 = 'eecfd3d5e857970e6b6b6cfcb8bbc55d27b8a9365de618b7f9a97a6bebba35ee';
const approvedVisualCandidateSha256 = 'f707f4e5d20977c833dd3410ca11f1127dd38e0f8b49212ed4028652d4ee36e4';
const sha = (data: Buffer | string) => createHash('sha256').update(data).digest('hex');
const encoded = (value: unknown) => Buffer.from(`${JSON.stringify(value, null, 2)}\n`);

const manifestBytes = await readFile(manifestUrl);
if (sha(manifestBytes) !== approvedManifestSha256) throw Error('Candidate manifest does not match the approved SHA-256.');
const manifest = JSON.parse(manifestBytes.toString());
if (manifest.status !== 'unpublished-awaiting-editorial-and-manuscript-evidence-review' || manifest.proposedUnitCount !== 65)
  throw Error('Unexpected candidate manifest state.');
const validationBytes = await readFile(validationUrl);
const validation = JSON.parse(validationBytes.toString());
if (validation.status !== 'pass' || validation.candidateManifestSha256 !== approvedManifestSha256)
  throw Error('Candidate validation is not bound to the approved manifest.');
const approvalBytes = await readFile(approvalUrl);
if (!approvalBytes.includes(Buffer.from(approvedManifestSha256)) || !approvalBytes.includes(Buffer.from(approvedVisualCandidateSha256)))
  throw Error('Approval record is not bound to both approved hashes.');

const predecessorBytes = await readFile(variantsUrl);
if (sha(predecessorBytes) !== manifest.inputs.predecessorVariantsSha256)
  throw Error('Approved editorial predecessor changed after candidate creation.');
const predecessor = JSON.parse(predecessorBytes.toString()) as Variant[];
if (predecessor.length !== 39) throw Error('Expected the approved 39-unit predecessor.');
const newUnitsBytes = await readFile(newUnitsUrl);
if (sha(newUnitsBytes) !== manifest.outputs['NEW-UNITS.json']) throw Error('Proposed units differ from the approved manifest.');
const newUnits = JSON.parse(newUnitsBytes.toString()) as Variant[];
const reviewHashById = new Map<string, string>(manifest.reviewPayloads.map((row: { unitId: string; reviewPayloadSha256: string }) => [row.unitId, row.reviewPayloadSha256]));
if (newUnits.length !== 65 || newUnits.some(unit => unit.status !== 'in-review'))
  throw Error('Expected 65 in-review candidate records.');
for (const [index, unit] of newUnits.entries()) {
  if (unit.id !== `candidate-${40 + index}`) throw Error(`${unit.id}: unexpected unit order.`);
  if (sha(reviewPayload(unit)) !== reviewHashById.get(unit.id))
    throw Error(`${unit.id}: review payload differs from the approved manifest.`);
  unit.status = 'approved';
}

const reviews = JSON.parse((await readFile(reviewsUrl)).toString()) as Review[];
for (const unit of newUnits) {
  const contentHash = reviewHashById.get(unit.id)!;
  if (reviews.some(review => review.unitId === unit.id)) throw Error(`${unit.id}: an earlier review unexpectedly exists.`);
  reviews.push({
    unitId: unit.id,
    reviewerId: 'larry-herzog-jr',
    contentHash,
    reviewedAt: '2026-09-13',
    decision: 'approved',
  });
}

await writeFile(variantsUrl, encoded([...predecessor, ...newUnits]));
await writeFile(reviewsUrl, encoded(reviews));
await mkdir(evidenceRoot, { recursive: false });
for (const name of ['CANDIDATE-MANIFEST.json', 'VALIDATION.json', 'NEW-UNITS.json', 'REVIEW.md', 'CANDIDATE-SLATE.json', 'EDITORIAL-ANGLES.json', 'PUBLISHER-NOTES.json'])
  await writeFile(new URL(name, evidenceRoot), await readFile(new URL(name, candidateRoot)));
for (const name of ['APPROVAL.md', 'SINAITICUS-CLAIMS.json', 'REVIEW-GATE.md'])
  await writeFile(new URL(name, evidenceRoot), await readFile(new URL(name, reviewRoot)));

console.log(JSON.stringify({
  status: 'promoted-to-approved-editorial-source',
  approvedCandidateManifestSha256: approvedManifestSha256,
  approvedVisualCandidateSha256,
  approvedUnitCount: newUnits.length,
  totalApprovedUnits: predecessor.length + newUnits.length,
  publicBundleWritten: false,
}, null, 2));
