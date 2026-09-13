/** Build the deterministic, non-public 65-unit textual-comparison candidate. */
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createLocalAdapter, editions } from '../app/lib/domain/corpus.ts';
import { address, expand, resolveReference } from '../app/lib/domain/references.ts';
import { reviewPayload, validateVariant, type Variant } from '../app/lib/domain/variants.ts';

const root = new URL('../', import.meta.url);
const reviewRoot = new URL('docs/editorial-review/variant-expansion-2026-09-13/', root);
const slateUrl = new URL('CANDIDATE-SLATE.json', reviewRoot);
const anglesUrl = new URL('EDITORIAL-ANGLES.json', reviewRoot);
const outputArg = process.argv.find(argument => argument.startsWith('--output='))?.slice('--output='.length);
const outputUrl = outputArg
  ? new URL(`${outputArg.replace(/\/$/, '')}/`, root)
  : new URL('artifacts/editorial/variant-expansion-2026-09-13-candidate-v2/', root);
const variantsUrl = new URL('content/editorial/variants.json', root);
const sha = (data: Buffer | string) => createHash('sha256').update(data).digest('hex');
const encoded = (value: unknown) => Buffer.from(`${JSON.stringify(value, null, 2)}\n`);
const loadCorpus = async (path: string) => JSON.parse(await readFile(new URL(`app/public${path}`, root), 'utf8'));
const adapter = (editionId: string) => createLocalAdapter(loadCorpus, editionId);

type UnitSpec = {
  id: string;
  reference: string;
  title: string;
  focus: string;
  presentation?: 'publisher-note';
};
type Slate = {
  schemaVersion: number;
  candidateId: string;
  status: string;
  requestedAdditionalUnits: number;
  predecessorUnitCount: number;
  proposedUnitCountAfterApproval: number;
  deferredViabilityReviewCount: number;
  selectionPolicy: string;
  units: UnitSpec[];
};

async function output(relative: string, data: Buffer | string) {
  const url = new URL(relative, outputUrl);
  await mkdir(dirname(fileURLToPath(url)), { recursive: true });
  await writeFile(url, data);
}

function isVariantNote(body: string) {
  return /\b(?:ALT|BYZ|CT|ECM|F35|GOC|HF|MT|NA\d*|NE|PT|SBL|TH|TR|WH)\b|manuscripts?|include|omit|variant|texts? vary/i.test(body);
}

// A recursive-false create makes every candidate directory immutable by default.
await mkdir(outputUrl, { recursive: false });
const [slateBytes, anglesBytes, predecessorBytes] = await Promise.all([
  readFile(slateUrl),
  readFile(anglesUrl),
  readFile(variantsUrl),
]);
const slate = JSON.parse(slateBytes.toString()) as Slate;
const angles = JSON.parse(anglesBytes.toString()) as Record<string, string>;
const predecessor = JSON.parse(predecessorBytes.toString()) as Variant[];
if (slate.schemaVersion !== 1 || slate.requestedAdditionalUnits !== 65 || slate.units.length !== 65)
  throw Error('The expansion slate must contain exactly 65 units.');
if (slate.predecessorUnitCount !== 39 || predecessor.length !== 39)
  throw Error('The expansion is bound to the approved 39-unit predecessor.');
if (slate.proposedUnitCountAfterApproval !== 104 || slate.deferredViabilityReviewCount !== 10)
  throw Error('Unexpected release or deferred-review count.');
const expectedIds = slate.units.map((_, index) => `candidate-${40 + index}`);
if (JSON.stringify(slate.units.map(unit => unit.id)) !== JSON.stringify(expectedIds))
  throw Error('Candidate IDs must be contiguous from candidate-40 through candidate-104.');
if (Object.keys(angles).length !== 65 || expectedIds.some(id => !angles[id]?.trim()))
  throw Error('Every proposed unit needs one editorial interpretation angle.');

const newUnits: Variant[] = [];
const chapterInputs = new Map<string, string>();
const reviewRows: Array<{ unitId: string; reviewPayloadSha256: string }> = [];
const noteRows: Array<{ unitId: string; editionId: string; releaseId: string; noteId: string; body: string }> = [];

for (const unitSpec of slate.units) {
  const ranges = resolveReference(unitSpec.reference);
  const anchors = new Set(ranges.flatMap(expand));
  const readings: Variant['readings'] = [];
  const citations: Variant['citations'] = [];
  const collectedNotes: typeof noteRows = [];

  for (const edition of editions) {
    const corpus = adapter(edition.editionId);
    const passage = await corpus.getPassage(ranges);
    const states = new Set(passage.coverage.map(row => row.textState));
    const mixed = states.size > 1;
    const state = mixed ? 'mixed'
      : passage.coverage.every(row => row.textState === 'absent') ? 'absent'
      : passage.coverage.some(row => row.textState === 'relocated') ? 'relocated'
      : passage.coverage.some(row => row.textState === 'bracketed') ? 'bracketed'
      : 'present';
    readings.push({
      editionId: edition.editionId,
      releaseId: edition.releaseId,
      state,
      ...(mixed ? { coverage: passage.coverage.map(({ anchor, dataState, textState }) => ({ anchor, dataState, textState })) } : {}),
      spans: passage.segments.map(segment => ({ segmentId: segment.id, start: 0, end: segment.text.length, text: segment.text })),
    });
    citations.push({
      editionId: edition.editionId,
      releaseId: edition.releaseId,
      sourceId: passage.segments.map(segment => segment.sourceId).join('; ') || `manifest verifiedGaps: ${ranges[0].start}`,
      url: edition.url,
    });
    for (const range of ranges) {
      const start = address(range.start);
      const end = address(range.end);
      if (start.book.code !== end.book.code || start.chapter !== end.chapter)
        throw Error(`${unitSpec.id}: expansion candidates must stay within one chapter.`);
      const relative = `app/public/corpus/${edition.releaseId}/${start.book.code}/${start.chapter}.json`;
      if (!chapterInputs.has(relative)) chapterInputs.set(relative, sha(await readFile(new URL(relative, root))));
    }
    if (edition.editionId === 'BSB' || edition.editionId === 'MSB') {
      const chapters = await corpus.getReadingChapters(ranges);
      for (const note of chapters.flatMap(chapter => chapter.notes)) {
        if (anchors.has(note.anchor) && isVariantNote(note.body)) {
          collectedNotes.push({ unitId: unitSpec.id, editionId: edition.editionId, releaseId: edition.releaseId, noteId: note.id, body: note.body });
        }
      }
    }
  }

  const uniqueNotes = [...new Map(collectedNotes.map(note => [`${note.editionId}:${note.noteId}`, note])).values()];
  if (unitSpec.presentation === 'publisher-note' && !uniqueNotes.length)
    throw Error(`${unitSpec.id}: publisher-note presentation has no exact pinned note.`);
  noteRows.push(...uniqueNotes);
  const evidenceCitation = uniqueNotes.length ? '[C1, C2]' : '[C1]';
  const sourceObservation = unitSpec.presentation === 'publisher-note'
    ? `${unitSpec.focus} ${evidenceCitation}\n\nThis is a publisher-note-supported comparison. The reported alternative is not presented as though it were the main text of a displayed edition. The frozen sources do not supply a complete manuscript apparatus or establish the direction of change.`
    : `${unitSpec.focus} ${evidenceCitation}\n\nThe seven rows identify exact frozen editions rather than treating “critical,” “Byzantine,” or “Textus Receptus” as manuscript witnesses. Differences of English rendering remain distinct from differences in the displayed Greek texts.`;
  const interpretation = `${angles[unitSpec.id]}\n\nThis comparison describes the textual difference and its immediate reading effect. It does not claim which form is original, infer a scribal motive, or make the passage carry more theological weight than its context allows.`;
  const explanationSources: NonNullable<Variant['explanationSources']> = [
    ...editions.map((edition, index) => ({
      id: `S${index + 1}`,
      label: edition.name,
      locator: `${unitSpec.reference}; release ${edition.releaseId}. Main text and coverage remain source-specific.`,
      url: edition.url,
    })),
    {
      id: 'C1',
      label: 'Ad Fontes NT frozen seven-edition chapter snapshots',
      locator: `${unitSpec.reference}; direct comparison of the exact bundled chapter JSON files enumerated in the candidate manifest.`,
    },
    ...(uniqueNotes.length ? [{
      id: 'C2',
      label: 'Pinned BSB/MSB publisher notes',
      locator: uniqueNotes.map(note => `${note.editionId} ${note.noteId}`).join('; '),
    }] : []),
    {
      id: uniqueNotes.length ? 'C3' : 'C2',
      label: 'Ad Fontes NT 65-unit expansion selection record',
      locator: `CANDIDATE-SLATE.json ${unitSpec.id}; selection policy and exact proposed focus.`,
    },
  ];
  const unit: Variant = {
    id: unitSpec.id,
    title: unitSpec.title,
    ranges,
    status: 'in-review',
    assignedReviewerId: 'larry-herzog-jr',
    contentType: 'Ordinary Means commentary',
    readings,
    citations,
    attestations: [],
    significance: { sourceObservation, interpretation },
    author: 'Larry Herzog Jr.',
    byline: 'Ordinary Means',
    ...(unitSpec.presentation ? {
      presentation: unitSpec.presentation,
      publisherNotes: uniqueNotes.map(({ editionId, releaseId, noteId, body }) => ({ editionId, releaseId, noteId, body })),
    } : {}),
    rights: 'cleared',
    provenance: 'OpenAI Codex drafted this proposed comparison from the frozen seven-edition Ad Fontes NT corpus and exact pinned publisher notes where identified. Publication requires Larry Herzog Jr.’s explicit approval of the exact candidate-manifest hash; approval constitutes adoption of this prose for Ordinary Means. No manuscript reading, textual weight, originality judgment, or scribal motive is inferred from edition agreement.',
    explanationSources,
  };
  await validateVariant(unit, adapter);
  newUnits.push(unit);
  reviewRows.push({ unitId: unit.id, reviewPayloadSha256: sha(reviewPayload(unit)) });
}

const newUnitsBytes = encoded(newUnits);
const combinedBytes = encoded([...predecessor, ...newUnits]);
const noteRowsBytes = encoded(noteRows);
await output('NEW-UNITS.json', newUnitsBytes);
await output('variants.candidate.json', combinedBytes);
await output('PUBLISHER-NOTES.json', noteRowsBytes);
await output('CANDIDATE-SLATE.json', slateBytes);
await output('EDITORIAL-ANGLES.json', anglesBytes);

const manifest = {
  schemaVersion: 1,
  candidateId: slate.candidateId,
  status: 'unpublished-awaiting-editorial-and-manuscript-evidence-review',
  candidateDate: '2026-09-13',
  predecessorUnitCount: predecessor.length,
  proposedUnitCount: newUnits.length,
  proposedUnitIds: newUnits.map(unit => unit.id),
  proposedUnitCountAfterApproval: predecessor.length + newUnits.length,
  deferredViabilityReviewCount: slate.deferredViabilityReviewCount,
  inputs: {
    slateSha256: sha(slateBytes),
    editorialAnglesSha256: sha(anglesBytes),
    predecessorVariantsSha256: sha(predecessorBytes),
    frozenCorpusChapters: Object.fromEntries([...chapterInputs].sort(([a], [b]) => a.localeCompare(b))),
  },
  outputs: {
    'NEW-UNITS.json': sha(newUnitsBytes),
    'variants.candidate.json': sha(combinedBytes),
    'PUBLISHER-NOTES.json': sha(noteRowsBytes),
  },
  reviewPayloads: reviewRows,
  scriptureChanged: false,
  publicEditorialSourceChanged: false,
  hostedApplicationChanged: false,
};
const manifestBytes = encoded(manifest);
await output('CANDIDATE-MANIFEST.json', manifestBytes);
const manifestSha = sha(manifestBytes);

const review: string[] = [
  '# Sixty-five textual-comparison additions — editorial review candidate',
  '',
  'Status: **unpublished; awaiting exact-hash editorial approval and a separately reviewed manuscript-evidence release**',
  '',
  `Candidate manifest SHA-256: \`${manifestSha}\``,
  '',
  `This candidate proposes ${newUnits.length} additions to the approved ${predecessor.length}-unit collection, for ${newUnits.length + predecessor.length} total after approval. The separate ten-unit viability reserve is not included.`,
  '',
];
for (const unit of newUnits) {
  const hash = reviewRows.find(row => row.unitId === unit.id)!.reviewPayloadSha256;
  review.push(
    `## ${unit.id}: ${unit.title}`,
    '',
    `Reference: ${unit.ranges.map(range => range.start === range.end ? range.start : `${range.start}–${range.end}`).join('; ')}  `,
    `Review-payload SHA-256: \`${hash}\`  `,
    `Presentation: ${unit.presentation === 'publisher-note' ? 'publisher-note only' : 'seven-edition comparison'}`,
    '',
    '### Source observation',
    '',
    unit.significance!.sourceObservation,
    '',
    '### Interpretation',
    '',
    unit.significance!.interpretation,
    '',
    '### Pinned publisher notes',
    '',
    ...(noteRows.filter(note => note.unitId === unit.id).map(note => `- ${note.editionId} \`${note.noteId}\`: ${note.body}`).length
      ? noteRows.filter(note => note.unitId === unit.id).map(note => `- ${note.editionId} \`${note.noteId}\`: ${note.body}`)
      : ['- None selected for this unit.']),
    '',
  );
}
await output('REVIEW.md', `${review.join('\n')}\n`);
await output('VALIDATION.json', encoded({
  schemaVersion: 1,
  status: 'pass',
  candidateManifestSha256: manifestSha,
  proposedUnitCount: newUnits.length,
  proposedTotalAfterApproval: predecessor.length + newUnits.length,
  exactPublisherNoteCount: noteRows.length,
  frozenCorpusChapterCount: chapterInputs.size,
  validatedUnitIds: newUnits.map(unit => unit.id),
  sourceFilesModified: false,
}));

console.log(JSON.stringify({
  candidateManifestSha256: manifestSha,
  units: newUnits.length,
  totalAfterApproval: predecessor.length + newUnits.length,
  publisherNoteRows: noteRows.length,
  frozenCorpusChapters: chapterInputs.size,
}, null, 2));
