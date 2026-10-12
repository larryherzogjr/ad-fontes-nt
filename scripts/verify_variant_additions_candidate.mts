/** Verify draft fidelity, complete packet bytes and exclusion from publication. */
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createLocalAdapter } from '../app/lib/domain/corpus.ts';
import { reviewPayload, validatePublication, validateVariant, type Variant } from '../app/lib/domain/variants.ts';

const root = resolve(import.meta.dirname, '..');
const editorial = 'docs/editorial-review/variant-additions-2026-10-11/evidence';
const visual = 'sources/visuals/csntm-sinaiticus-additions-2026-10-11-v2';
const packet = 'artifacts/editorial/variant-additions-2026-10-11-review-v2';
const bytes = (path: string) => readFile(resolve(root, path));
const json = async (path: string) => JSON.parse((await bytes(path)).toString());
const sha = (value: string | Buffer) => createHash('sha256').update(value).digest('hex');
function stable(value: any): any {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value)
    .sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => [key, stable(item)]));
  return value;
}
async function checksums(base: string, entries: Record<string, string>) {
  const aliases: Record<string, string> = {
    'content/editorial/variants.json': `${editorial}/PREDECESSOR-VARIANTS.json`,
    'content/editorial/reviews.json': `${editorial}/PREDECESSOR-REVIEWS.json`,
    'artifacts/editorial/variant-additions-2026-10-11-candidate-v2/NEW-UNITS.json': `${editorial}/NEW-UNITS.json`,
  };
  for (const [path, digest] of Object.entries(entries))
    assert.equal(sha(await bytes(base ? `${base}/${path}` : (aliases[path] ?? path))), digest, `Checksum: ${path}`);
}
const em = await json(`${editorial}/CANDIDATE-MANIFEST.json`);
const vm = await json(`${visual}/MANIFEST.json`);
const pm = existsSync(resolve(root, packet, 'PACKET-MANIFEST.json'))
  ? await json(`${packet}/PACKET-MANIFEST.json`) : undefined;
await checksums('', em.inputs); await checksums(editorial, em.outputs);
await checksums('', vm.inputs); await checksums(visual, vm.outputs); await checksums(visual, vm.sourceFiles);
if (pm) await checksums(packet, pm.fileSha256);
const core = { ...vm }; delete core.candidateSha256;
assert.equal(sha(JSON.stringify(stable(core))), vm.candidateSha256);
assert.equal(vm.candidateSha256, 'acc44841ea168a7f05e7453ab22615d7584e7941081c4c7f01d39f72ec75eead');
assert.equal(sha(await bytes(`${editorial}/CANDIDATE-MANIFEST.json`)), '7499b21e24185dbc1d72447f6d360ae255df5bfb6f094d70915ea89011a51f91');
if (pm) {
  assert.equal(pm.visualCandidateSha256, vm.candidateSha256);
  assert.equal(pm.editorialCandidateSha256, sha(await bytes(`${editorial}/CANDIDATE-MANIFEST.json`)));
}
const units: Variant[] = await json(`${editorial}/NEW-UNITS.json`);
const publicUnits: Variant[] = (await json('app/public/editorial/variants.json')).units;
const queue: Variant[] = await json('content/editorial/variants.json');
const predecessor: Variant[] = await json(`${editorial}/PREDECESSOR-VARIANTS.json`);
assert.deepEqual(queue.slice(0, 104), predecessor);
assert.equal(queue.length, 110); assert.equal(publicUnits.length, 110);
assert.equal(units.length, 6);
assert.equal(em.proposedTotalAfterApproval, 110);
const adapter = (id: string) => createLocalAdapter(async path => json(`app/public${path}`), id);
const registry = await json(`${visual}/registry.candidate.json`);
const evidence = await json(`${visual}/sinaiticus-evidence.json`);
assert.equal(registry.status, 'candidate'); assert.equal(registry.editorialReview.status, 'pending');
assert.equal(Object.keys(registry.plates).length, 6); assert.equal(evidence.units.length, 6);
for (const [i, unit] of units.entries()) {
  assert.equal(unit.id, `candidate-${105 + i}`); assert.equal(unit.status, 'in-review');
  assert.equal(unit.readings.length, 7); assert.equal(unit.attestations.length, 0);
  await validateVariant(unit, adapter);
  assert.throws(() => validatePublication(unit, [], new Set(['larry-herzog-jr']), sha(reviewPayload(unit))), /unapproved/);
  const approved = queue.find(u => u.id === unit.id)!;
  assert.equal(approved.status, 'approved');
  assert.equal(reviewPayload(approved), reviewPayload(unit));
  assert.equal(reviewPayload(publicUnits.find(u => u.id === unit.id)!), reviewPayload(unit));
  const reviews = await json('content/editorial/reviews.json');
  validatePublication(approved, reviews, new Set(['larry-herzog-jr']), sha(reviewPayload(approved)));
  assert.equal(sha(reviewPayload(unit)), em.reviewPayloads[i].reviewPayloadSha256);
  const plate = registry.plates[unit.id];
  assert.equal(plate.commentaryPayloadSha256, sha(reviewPayload(unit)));
  const row = evidence.units.find((u: any) => u.unitId === unit.id);
  assert(plate.caption.endsWith(row.proposedCaptionClaim));
  assert(row.targetVerses[0].mainTranscription.length > 0);
  assert(plate.doesNotEstablish.includes('does not by itself'));
  for (const image of plate.images) {
    const content = await bytes(`${visual}/${image.asset}`);
    assert.equal(content[0], 0xff); assert.equal(content[1], 0xd8);
    assert.equal(content.at(-2), 0xff); assert.equal(content.at(-1), 0xd9);
    const info = await json(`${visual}/evidence/iiif-info/${image.sourceImageName}.json`);
    assert.equal(image.width, info.width); assert.equal(image.height, info.height);
    const details = (await bytes(`${visual}/evidence/image-details/${image.sourceImageId}.html`)).toString();
    assert(details.includes(`CSNTM Image Id</b>: ${image.sourceImageId}`));
    assert(details.includes(`CSNTM Image Name</b>: ${image.sourceImageName}`));
    assert(!image.asset.includes('..') && !image.asset.startsWith('/'));
  }
}
const text = (id: string, edition: string) => units.find(u => u.id === id)!.readings
  .find(r => r.editionId === edition)!.spans.map(s => s.text).join(' ');
assert(text('candidate-105', 'MSB').includes('many are called')); assert(!text('candidate-105', 'BSB').includes('called'));
assert(text('candidate-106', 'N1904').includes('[[καὶ ἀνεφέρετο εἰς τὸν οὐρανόν]]'));
assert.equal(units[1].readings.find(r => r.editionId === 'N1904')!.state, 'present');
assert(text('candidate-107', 'RP2018').includes('Βηθανίᾳ')); assert(text('candidate-107', 'TR-BOYD').includes('Βηθαβαρᾶ'));
assert(!text('candidate-108', 'MSB').includes('blood')); assert(text('candidate-108', 'TR-BOYD').includes('διὰ τοῦ αἵματος αὐτοῦ'));
assert(units[4].readings.every(r => /grace|χάριτι/.test(r.spans.map(s => s.text).join(' '))));
assert(!units[4].publisherNotes?.length); assert(!units[4].presentation);
assert(units[4].comparisonNotice?.includes('All seven displayed editions'));
assert(units[4].explanationSources?.some(s => s.id === 'C4' && s.url === 'https://www.newadvent.org/fathers/101501.htm'));
assert(text('candidate-110', 'N1904').includes('λύσαντι')); assert(text('candidate-110', 'RP2018').includes('λούσαντι'));
const john = evidence.units.find((u: any) => u.unitId === 'candidate-107').targetVerses[0];
assert(john.corrections.some((c: any) => c.readings.some((r: any) => r.hand === 'cb2' && r.text === 'βηθαραβα')));
const luke = evidence.units.find((u: any) => u.unitId === 'candidate-106').targetVerses[0];
assert(!luke.mainTranscription.includes('ανεφερετο'));
assert(luke.corrections.some((c: any) => c.readings.some((r: any) => r.hand === 'ca' && r.text.includes('ανεφερετο'))));
const source = await json('docs/editorial-review/variant-additions-2026-10-11/external/SOURCE.json');
const origen = await bytes('docs/editorial-review/variant-additions-2026-10-11/external/origen-john-i.html');
assert.equal(sha(origen), source.sha256);
assert(origen.toString().includes('In some copies of the Epistle to the Hebrews'));
assert(origen.toString().includes('Allan Menzies'));
const approval = await json(`${visual}/APPROVAL.json`);
assert.equal(approval.candidateSha256, vm.candidateSha256);
assert.equal(approval.approvedBy, 'Larry Herzog Jr.');
assert.equal(approval.approvalDate, '2026-10-11');
console.log(JSON.stringify({ status: 'pass', approvedAdditions: 6, plates: 6, publishedArticles: 110,
  editorialCandidateSha256: sha(await bytes(`${editorial}/CANDIDATE-MANIFEST.json`)), visualCandidateSha256: vm.candidateSha256 }, null, 2));
