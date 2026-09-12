/** Promote only the exact Volume One candidate explicitly approved by Larry Herzog Jr. */
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { reviewPayload, type Review, type Variant } from '../app/lib/domain/variants.ts';

const root = new URL('../', import.meta.url);
const candidateRoot = new URL('artifacts/editorial/volume-one-additions-2026-09-12-candidate-v1/', root);
const evidenceRoot = new URL('docs/editorial-review/volume-one-additions-2026-09-12/evidence/', root);
const manifestUrl = new URL('CANDIDATE-MANIFEST.json', candidateRoot);
const validationUrl = new URL('VALIDATION.json', candidateRoot);
const newUnitsUrl = new URL('NEW-UNITS.json', candidateRoot);
const variantsUrl = new URL('content/editorial/variants.json', root);
const reviewsUrl = new URL('content/editorial/reviews.json', root);
const approvalUrl = new URL('docs/editorial-review/volume-one-additions-2026-09-12/APPROVAL.md', root);
const approvedManifestSha256 = '28ebb36b62d8cbd4cdbc2451b98586a3f9e1f6a9e043f08f7a9c9398f2d9c958';
const sha = (data: Buffer | string) => createHash('sha256').update(data).digest('hex');
const encoded = (value: unknown) => Buffer.from(JSON.stringify(value, null, 2) + '\n');

const manifestBytes = await readFile(manifestUrl);
if (sha(manifestBytes) !== approvedManifestSha256) throw Error('Candidate manifest does not match the approved SHA-256.');
const manifest = JSON.parse(manifestBytes.toString());
if (manifest.status !== 'unpublished-awaiting-exact-hash-approval' || manifest.proposedUnitCount !== 9) throw Error('Unexpected candidate manifest state.');
const validationBytes = await readFile(validationUrl);
const validation = JSON.parse(validationBytes.toString());
if (validation.status !== 'pass' || validation.candidateManifestSha256 !== approvedManifestSha256) throw Error('Candidate validation is not bound to the approved manifest.');
const approvalBytes = await readFile(approvalUrl);
if (!approvalBytes.includes(Buffer.from(approvedManifestSha256))) throw Error('Approval record is not bound to the approved manifest.');

const predecessorBytes = await readFile(variantsUrl);
if (sha(predecessorBytes) !== manifest.inputs.predecessorVariantsSha256) throw Error('Public editorial predecessor changed after candidate creation.');
const predecessor = JSON.parse(predecessorBytes.toString()) as Variant[];
if (predecessor.length !== 30) throw Error('Expected the approved thirty-unit predecessor.');
const newUnitsBytes = await readFile(newUnitsUrl);
if (sha(newUnitsBytes) !== manifest.outputs['NEW-UNITS.json']) throw Error('Proposed units differ from the approved manifest.');
const newUnits = JSON.parse(newUnitsBytes.toString()) as Variant[];
const reviewHashById = new Map<string, string>(manifest.reviewPayloads.map((row: { unitId: string; reviewPayloadSha256: string }) => [row.unitId, row.reviewPayloadSha256]));
if (newUnits.length !== 9 || newUnits.some(unit => unit.status !== 'in-review')) throw Error('Expected nine in-review candidate records.');
for (const unit of newUnits) {
  if (sha(reviewPayload(unit)) !== reviewHashById.get(unit.id)) throw Error(`${unit.id}: review payload differs from the approved manifest.`);
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
    reviewedAt: '2026-09-12',
    decision: 'approved',
  });
}

await writeFile(variantsUrl, encoded([...predecessor, ...newUnits]));
await writeFile(reviewsUrl, encoded(reviews));
await mkdir(evidenceRoot, { recursive: false });
for (const name of ['CANDIDATE-MANIFEST.json', 'VALIDATION.json', 'NEW-UNITS.json', 'REVIEW.md', 'CANDIDATE-SPEC.json']) {
  await writeFile(new URL(name, evidenceRoot), await readFile(new URL(name, candidateRoot)));
}
await writeFile(new URL('APPROVAL.md', evidenceRoot), approvalBytes);

console.log(JSON.stringify({
  status: 'promoted-to-approved-editorial-source',
  approvedCandidateManifestSha256: approvedManifestSha256,
  approvedUnitIds: newUnits.map(unit => unit.id),
  publicBundleWritten: false,
}, null, 2));
