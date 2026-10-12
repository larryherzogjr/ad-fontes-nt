/** Promote the exact six-record and six-plate packet approved October 11. */
import { createHash } from 'node:crypto';
import { cp, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createLocalAdapter } from '../app/lib/domain/corpus.ts';
import { reviewPayload, validateVariant, type Variant, type Review } from '../app/lib/domain/variants.ts';

const root = resolve(import.meta.dirname, '..');
const editorial = 'docs/editorial-review/variant-additions-2026-10-11/evidence';
const visual = 'sources/visuals/csntm-sinaiticus-additions-2026-10-11-v2-candidate';
const release = 'sources/visuals/csntm-sinaiticus-additions-2026-10-11-v2';
const approvedEditorial = '7499b21e24185dbc1d72447f6d360ae255df5bfb6f094d70915ea89011a51f91';
const approvedVisual = 'acc44841ea168a7f05e7453ab22615d7584e7941081c4c7f01d39f72ec75eead';
const sha = (b: string | Buffer) => createHash('sha256').update(b).digest('hex');
const bytes = (p: string) => readFile(resolve(root, p));
const json = async (p: string) => JSON.parse((await bytes(p)).toString());
const encoded = (v: unknown) => `${JSON.stringify(v, null, 2)}\n`;
const manifestBytes = await bytes(`${editorial}/CANDIDATE-MANIFEST.json`);
if (sha(manifestBytes) !== approvedEditorial) throw Error('Editorial approval mismatch.');
const manifest = JSON.parse(manifestBytes.toString());
const vm = await json(`${visual}/MANIFEST.json`);
if (vm.candidateSha256 !== approvedVisual) throw Error('Visual approval mismatch.');
const approval = (await bytes('docs/editorial-review/variant-additions-2026-10-11/APPROVAL.md')).toString();
if (!approval.includes(approvedEditorial) || !approval.includes(approvedVisual)) throw Error('Missing exact approval record.');
const previousBytes = await bytes('content/editorial/variants.json');
const previousReviews = await bytes('content/editorial/reviews.json');
if (sha(previousBytes) !== manifest.inputs['content/editorial/variants.json'] ||
    sha(previousReviews) !== manifest.inputs['content/editorial/reviews.json']) throw Error('Predecessor changed.');
const previous: Variant[] = JSON.parse(previousBytes.toString());
const additionsBytes = await bytes(`${editorial}/NEW-UNITS.json`);
if (sha(additionsBytes) !== manifest.outputs['NEW-UNITS.json']) throw Error('Draft record checksum mismatch.');
const additions: Variant[] = JSON.parse(additionsBytes.toString());
if (previous.length !== 104 || additions.length !== 6) throw Error('Unexpected collection sizes.');
const adapter = (id: string) => createLocalAdapter(async p => json(`app/public${p}`), id);
const reviews: Review[] = JSON.parse(previousReviews.toString());
for (const [i, unit] of additions.entries()) {
  if (unit.id !== `candidate-${105 + i}` || unit.status !== 'in-review' ||
      sha(reviewPayload(unit)) !== manifest.reviewPayloads[i].reviewPayloadSha256 ||
      reviews.some(r => r.unitId === unit.id)) throw Error('Unexpected record or previous review.');
  await validateVariant(unit, adapter);
  reviews.push({ unitId: unit.id, reviewerId: 'larry-herzog-jr',
    contentHash: sha(reviewPayload(unit)), reviewedAt: '2026-10-11', decision: 'approved' });
  unit.status = 'approved';
}
// Retain exact inputs for offline verification after the public queue advances.
for (const [name, saved] of [['PREDECESSOR-VARIANTS.json', previousBytes], ['PREDECESSOR-REVIEWS.json', previousReviews]] as const) {
  const path = resolve(root, editorial, name);
  try { if (sha(await readFile(path)) !== sha(saved)) throw Error('Preserved predecessor mismatch.'); }
  catch (e: any) { if (e.code !== 'ENOENT') throw e; await writeFile(path, saved, { flag: 'wx' }); }
}
await mkdir(resolve(root, release), { recursive: true });
if ((await readdir(resolve(root, release))).length) throw Error('Release directory must be unused.');
for (const entry of await readdir(resolve(root, visual)))
  await cp(resolve(root, visual, entry), resolve(root, release, entry), { recursive: true, errorOnExist: true, force: false });
await writeFile(resolve(root, release, 'APPROVAL.json'), encoded({ schemaVersion: 1, releaseId: vm.releaseId,
  candidateSha256: approvedVisual, approvedBy: 'Larry Herzog Jr.', approvalDate: '2026-10-11',
  statement: `Larry approved all six proposed articles and plates from editorial manifest ${approvedEditorial} and visual candidate ${approvedVisual}, then authorized coordinated version 3.6.2 publication.` }));
await writeFile(resolve(root, 'content/editorial/variants.json'), encoded([...previous, ...additions]));
await writeFile(resolve(root, 'content/editorial/reviews.json'), encoded(reviews));
const selection = await json('app/lib/domain/visual-release.json');
selection.supplements.push({ releaseId: vm.releaseId, candidateSha256: approvedVisual });
await writeFile(resolve(root, 'app/lib/domain/visual-release.json'), encoded(selection));
console.log('Promoted six exact-content approvals and six visual plates; total 110. Public bundles require publication/build.');
