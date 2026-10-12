/** Prepare six draft records without writing the public editorial queue. No network. */
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { createLocalAdapter, editions } from '../app/lib/domain/corpus.ts';
import { address, expand, resolveReference } from '../app/lib/domain/references.ts';
import { reviewPayload, validateVariant, type Variant } from '../app/lib/domain/variants.ts';

const root = resolve(import.meta.dirname, '..');
const inputRoot = 'docs/editorial-review/variant-additions-2026-10-11';
const outputRoot = process.argv.find(a => a.startsWith('--output='))?.slice(9)
  || 'artifacts/editorial/variant-additions-2026-10-11-candidate-v2';
const sha = (bytes: string | Buffer) => createHash('sha256').update(bytes).digest('hex');
const encoded = (value: unknown) => `${JSON.stringify(value, null, 2)}\n`;
const inputs: Record<string, string> = {};
async function pinned(path: string) {
  const bytes = await readFile(resolve(root, path));
  inputs[path] = sha(bytes);
  return bytes;
}
const outputs: Record<string, string> = {};
async function output(path: string, bytes: string | Buffer) {
  const target = resolve(root, outputRoot, path);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, bytes);
  outputs[path] = sha(bytes);
}
const adapter = (id: string) => createLocalAdapter(async path =>
  JSON.parse((await pinned(`app/public${path}`)).toString()), id);
const slateBytes = await pinned(`${inputRoot}/SLATE.json`);
const slate = JSON.parse(slateBytes.toString());
const predecessorBytes = await pinned('content/editorial/variants.json');
const predecessor: Variant[] = JSON.parse(predecessorBytes.toString());
await pinned('content/editorial/reviews.json');
await pinned('app/lib/domain/editions.json');
await pinned('scripts/build_variant_additions_candidate.mts');
await pinned(`${inputRoot}/external/origen-john-i.html`);
await pinned(`${inputRoot}/external/SOURCE.json`);
if (predecessor.length !== 104 || slate.units.length !== 6)
  throw Error('Expected the 104-unit predecessor and exact six-unit slate.');
await mkdir(resolve(root, outputRoot), { recursive: false });
const variants: Variant[] = [];
const notes: { unitId: string; editionId: string; releaseId: string; noteId: string; body: string }[] = [];
for (const [index, spec] of slate.units.entries()) {
  if (spec.id !== `candidate-${105 + index}` || predecessor.some(v => v.id === spec.id))
    throw Error('Candidate IDs must be new and contiguous from 105 through 110.');
  const ranges = resolveReference(spec.reference);
  const anchors = new Set(ranges.flatMap(expand));
  if (predecessor.some(v => v.ranges.flatMap(expand).some(a => anchors.has(a))))
    throw Error(`Duplicate topic anchor: ${spec.id}`);
  const readings: Variant['readings'] = [];
  const citations: Variant['citations'] = [];
  for (const edition of editions) {
    const corpus = adapter(edition.editionId);
    const passage = await corpus.getPassage(ranges);
    if (passage.coverage.some(c => c.dataState !== 'available'))
      throw Error(`${spec.id}: unavailable coverage is not evidence.`);
    const states = new Set(passage.coverage.map(c => c.textState));
    if (states.size !== 1 || !['present', 'bracketed'].includes([...states][0]))
      throw Error('These six units must retain complete present/bracketed verse coverage.');
    readings.push({ editionId: edition.editionId, releaseId: edition.releaseId,
      state: [...states][0] as 'present' | 'bracketed',
      spans: passage.segments.map(s => ({ segmentId: s.id, start: 0, end: s.text.length, text: s.text })) });
    citations.push({ editionId: edition.editionId, releaseId: edition.releaseId,
      sourceId: passage.segments.map(s => s.sourceId).join('; '), url: edition.url });
    for (const chapter of await corpus.getReadingChapters(ranges)) {
      for (const note of chapter.notes.filter(n => anchors.has(n.anchor)))
        notes.push({ unitId: spec.id, editionId: edition.editionId, releaseId: edition.releaseId,
          noteId: note.id, body: note.body });
    }
    for (const reference of spec.context) await corpus.getPassage(resolveReference(reference));
  }
  const unitNotes = notes.filter(n => n.unitId === spec.id);
  const unit: Variant = {
    id: spec.id, title: spec.title, ranges, status: 'in-review', assignedReviewerId: 'larry-herzog-jr',
    contentType: 'Ordinary Means commentary', readings, citations, attestations: [],
    significance: { sourceObservation: spec.observation, interpretation: spec.interpretation },
    // Proposed attribution becomes actual only if the reviewer adopts this exact draft.
    author: 'Larry Herzog Jr.', byline: 'Ordinary Means', rights: 'cleared',
    provenance: 'OpenAI Codex drafted this unpublished candidate from frozen local editions, pinned publisher notes and the sources identified below. Larry Herzog Jr. / Ordinary Means is proposed attribution upon explicit adoption, not a claim of prior authorship or approval. Original draft prose; source quotations remain identified and source-specific. No manuscript apparatus, originality judgment, copying motive or unexamined witness support is inferred. Publication requires exact-content editorial and visual approval.',
    ...(unitNotes.length ? { publisherNotes: unitNotes.map(({ unitId, ...note }) => note) } : {}),
    ...(spec.comparisonNotice ? { comparisonNotice: spec.comparisonNotice } : {}),
    explanationSources: [
      ...editions.map((edition, i) => ({ id: `S${i + 1}`, label: edition.name,
        locator: `${spec.reference}; frozen release ${edition.releaseId}.`, url: edition.url })),
      { id: 'C1', label: 'Frozen seven-edition Scripture snapshots',
        locator: `${[spec.reference, ...spec.context].join('; ')}. Complete chapter JSON inputs are checksum-bound in CANDIDATE-MANIFEST.json.` },
      ...(unitNotes.length ? [{ id: 'C2', label: 'Pinned publisher notes',
        locator: unitNotes.map(n => `${n.editionId} ${n.noteId}`).join('; ') }] : []),
      { id: 'C3', label: 'Codex Sinaiticus Project electronic transcription, version 1.04',
        locator: `${spec.reference}; exact verse, first-hand and correction records in the separate sinaiticus-evidence.json candidate. Page images are separate evidence; this is not a complete apparatus.`,
        url: 'https://codexsinaiticus.org/' },
      ...(spec.id === 'candidate-109' ? [{ id: 'C4', label: 'Origen, Commentary on John, Book I, section 40',
        locator: 'Allan Menzies translation, Ante-Nicene Fathers, vol. 9 (1896), as reproduced by New Advent. Paragraph beginning “Such great things”; Hebrews wording discussed in this paragraph. Saved HTML and source metadata are checksum-bound. Historical report inspected in English; Greek critical edition and surviving manuscript apparatus not independently collated.',
        url: 'https://www.newadvent.org/fathers/101501.htm' }] : []),
    ],
  };
  await validateVariant(unit, adapter);
  variants.push(unit);
}
for (const [path, digest] of Object.entries(inputs)) {
  if (!path.startsWith('app/public/corpus/')) continue;
  const bytes = await readFile(resolve(root, path));
  if (sha(bytes) !== digest) throw Error(`Changed source: ${path}`);
  await output(`evidence/${path}`, bytes);
}
await output('SLATE.json', slateBytes);
await output('NEW-UNITS.json', encoded(variants));
await output('variants.candidate.json', encoded([...predecessor, ...variants]));
await output('PUBLISHER-NOTES.json', encoded(notes));
const payloads = variants.map(v => ({ unitId: v.id, reviewPayloadSha256: sha(reviewPayload(v)) }));
const review = [
  '# Six textual-comparison additions — complete editorial review', '',
  'Date: October 11, 2026 · AFNT-016/017 and AFNT-113 follow-on', '',
  '**Unpublished drafts. Proposed author/byline: Larry Herzog Jr. / Ordinary Means, only upon explicit adoption. Drafted by OpenAI Codex.**', '',
  'Five topics show a wording or editorial-marker difference in the displayed editions. Hebrews 2:9 is an external historical discussion; all seven edition rows agree on grace. The 104 approved articles and their approvals are unchanged.', '',
  'The separate Sinaiticus visual packet preserves six witness-specific readings, including the exact John correction spelling and the Luke ascension addition. Neither packet establishes an original reading or supplies a complete manuscript apparatus.', '',
  '## Historical reserve', '', slate.reserveDisposition, '',
];
for (const unit of variants) {
  const spec = slate.units.find((s: any) => s.id === unit.id);
  review.push(`## ${unit.id}: ${unit.title}`, '', `Reference: ${spec.reference}`, '',
    `Payload SHA-256: \`${sha(reviewPayload(unit))}\``, '',
    ...(unit.comparisonNotice ? [`**Evidence limitation:** ${unit.comparisonNotice}`, ''] : []),
    '### Source observation', '', unit.significance!.sourceObservation, '',
    '### Interpretation', '', unit.significance!.interpretation, '', '### Exact seven-edition readings', '');
  for (const reading of unit.readings) review.push(
    `**${editions.find(e => e.editionId === reading.editionId)!.name}** · ${reading.releaseId} · whole-verse state ${reading.state}`, '',
    ...reading.spans.map(s => `> ${s.text.replaceAll('\n', '\n> ')}`), '');
  review.push('### Pinned publisher notes', '',
    ...(notes.filter(n => n.unitId === unit.id).map(n => `- ${n.editionId} ${n.noteId}: ${n.body}`).length
      ? notes.filter(n => n.unitId === unit.id).map(n => `- ${n.editionId} ${n.noteId}: ${n.body}`)
      : ['No publisher note is present at this anchor in the seven frozen releases.']), '',
    '### Proposed Sinaiticus caption claim', '', spec.sinaiticusClaim, '',
    '### Explanation sources', '', ...unit.explanationSources!.map(s => `- ${s.id}: ${s.label}. ${s.locator}${s.url ? ` [Source](${s.url})` : ''}`), '');
}
await output('REVIEW.md', `${review.join('\n')}\n`);
await output('VALIDATION.json', encoded({ schemaVersion: 1, status: 'pass', unitCount: variants.length,
  validatedUnitIds: variants.map(v => v.id), publisherNoteCount: notes.length,
  corpusChapterCount: Object.keys(inputs).filter(p => p.startsWith('app/public/corpus/')).length,
  publicationStatus: 'withheld-pending-exact-content-review', publicQueueChanged: false }));
const manifest = { schemaVersion: 1, candidateId: slate.candidateId, date: slate.date,
  status: 'unpublished-awaiting-exact-content-editorial-and-visual-review',
  predecessorUnitCount: predecessor.length, proposedUnitCount: variants.length,
  proposedTotalAfterApproval: predecessor.length + variants.length, reserveDisposition: slate.reserveDisposition,
  inputs, outputs, reviewPayloads: payloads, scriptureChanged: false, publicEditorialSourceChanged: false };
const bytes = encoded(manifest);
await writeFile(resolve(root, outputRoot, 'CANDIDATE-MANIFEST.json'), bytes);
console.log(encoded({ candidateManifestSha256: sha(bytes), units: variants.length,
  totalAfterApproval: predecessor.length + variants.length, publisherNoteCount: notes.length }));
