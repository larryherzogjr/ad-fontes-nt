/** Build a deterministic, non-public review candidate for nine Volume One additions. */
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createLocalAdapter, editions } from '../app/lib/domain/corpus.ts';
import { address, resolveReference } from '../app/lib/domain/references.ts';
import { reviewPayload, validateVariant, type Variant } from '../app/lib/domain/variants.ts';

const root = new URL('../', import.meta.url);
const specUrl = new URL('docs/editorial-review/volume-one-additions-2026-09-12/CANDIDATE-SPEC.json', root);
const outputUrl = new URL('artifacts/editorial/volume-one-additions-2026-09-12-candidate-v1/', root);
const variantsUrl = new URL('content/editorial/variants.json', root);
const sha = (data: Buffer | string) => createHash('sha256').update(data).digest('hex');
const encoded = (value: unknown) => Buffer.from(JSON.stringify(value, null, 2) + '\n');
const loadCorpus = async (path: string) => JSON.parse(await readFile(new URL(`app/public${path}`, root), 'utf8'));
const adapter = (editionId: string) => createLocalAdapter(loadCorpus, editionId);

type NoteRef = { editionId: string; noteId: string; body: string };
type UnitSpec = {
  id: string;
  reference: string;
  title: string;
  bookLocator: string;
  presentation?: 'publisher-note';
  noteRefs: NoteRef[];
  sourceObservation: string;
  interpretation: string;
};
type Spec = {
  schemaVersion: number;
  candidateId: string;
  candidateDate: string;
  bookSources: Record<string, { path: string; sha256: string }>;
  units: UnitSpec[];
};

async function output(relative: string, data: Buffer | string) {
  const url = new URL(relative, outputUrl);
  await mkdir(dirname(fileURLToPath(url)), { recursive: true });
  await writeFile(url, data);
}

// mkdir with recursive:false is the overwrite guard: reviewed candidate bytes are immutable.
await mkdir(outputUrl, { recursive: false });
const specBytes = await readFile(specUrl);
const spec = JSON.parse(specBytes.toString()) as Spec;
if (spec.schemaVersion !== 1 || spec.units.length !== 9) throw Error('Expected exactly nine candidate specifications.');
const existingBytes = await readFile(variantsUrl);
const existing = JSON.parse(existingBytes.toString()) as Variant[];
if (existing.length !== 30) throw Error('Expected the approved thirty-unit predecessor.');
const expectedIds = spec.units.map((_, index) => `candidate-${31 + index}`);
if (JSON.stringify(spec.units.map(unit => unit.id)) !== JSON.stringify(expectedIds)) throw Error('Candidate IDs must be candidate-31 through candidate-39 in order.');
if (existing.some(unit => expectedIds.includes(unit.id))) throw Error('A proposed candidate ID is already in the public editorial source.');

const bookInputs: Record<string, { filename: string; sha256: string }> = {};
for (const [kind, source] of Object.entries(spec.bookSources)) {
  const bytes = await readFile(source.path);
  if (sha(bytes) !== source.sha256) throw Error(`Supplied ${kind} no longer matches the concordance input.`);
  bookInputs[kind] = { filename: source.path.split('/').at(-1)!, sha256: source.sha256 };
}

const chapterInputs = new Map<string, string>();
const newUnits: Variant[] = [];
const reviewRows: { unitId: string; reviewPayloadSha256: string }[] = [];
for (const unitSpec of spec.units) {
  const ranges = resolveReference(unitSpec.reference);
  const readings: Variant['readings'] = [];
  const citations: Variant['citations'] = [];
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
      if (start.book.code !== end.book.code || start.chapter !== end.chapter) throw Error('This candidate builder expects single-chapter ranges.');
      const relative = `app/public/corpus/${edition.releaseId}/${start.book.code}/${start.chapter}.json`;
      if (!chapterInputs.has(relative)) chapterInputs.set(relative, sha(await readFile(new URL(relative, root))));
    }
  }

  const publisherNotes: NonNullable<Variant['publisherNotes']> = [];
  for (const noteRef of unitSpec.noteRefs) {
    const edition = editions.find(row => row.editionId === noteRef.editionId)!;
    const chapters = await adapter(noteRef.editionId).getReadingChapters(ranges);
    const found = chapters.flatMap(chapter => chapter.notes).find(note => note.id === noteRef.noteId);
    if (!found || found.body !== noteRef.body) throw Error(`${unitSpec.id}: publisher note differs from the specification.`);
    if (unitSpec.presentation) publisherNotes.push({ editionId: noteRef.editionId, releaseId: edition.releaseId, noteId: found.id, body: found.body });
  }

  const explanationSources: NonNullable<Variant['explanationSources']> = [
    ...editions.map((edition, index) => ({
      id: `S${index + 1}`,
      label: edition.name,
      locator: `${ranges[0].start}${ranges[0].end === ranges[0].start ? '' : `–${ranges[0].end}`}; release ${edition.releaseId}. Main text and coverage remain source-specific.`,
      url: edition.url,
    })),
    {
      id: 'C1',
      label: 'Ad Fontes NT frozen seven-edition chapter snapshots',
      locator: `${unitSpec.reference}; direct comparison of the exact bundled chapter JSON files enumerated in the candidate manifest.`,
    },
    {
      id: 'C2',
      label: 'Pinned BSB/MSB publisher notes',
      locator: unitSpec.noteRefs.map(note => `${note.editionId} ${note.noteId}`).join('; ') + '. Exact note bodies verified by the candidate builder; publisher attributions were not independently reconstructed.',
    },
    {
      id: 'C3',
      label: 'Larry Herzog Jr., Ad Fontes — Volume One (supplied September 2026 export)',
      locator: `${unitSpec.bookLocator}. Paraphrase and case selection from the author-supplied EPUB/PDF; file hashes are recorded in the candidate manifest.`,
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
    significance: { sourceObservation: unitSpec.sourceObservation, interpretation: unitSpec.interpretation },
    author: 'Larry Herzog Jr.',
    byline: 'Ordinary Means',
    ...(unitSpec.presentation ? { presentation: unitSpec.presentation, publisherNotes } : {}),
    rights: 'cleared',
    provenance: 'OpenAI Codex drafted this proposed explanation from the frozen seven-edition corpus and Larry Herzog Jr.’s supplied Ad Fontes — Volume One. Publication requires Larry Herzog Jr.’s explicit approval of the exact candidate-manifest hash; that approval constitutes adoption of this prose for Ordinary Means.',
    explanationSources,
  };
  await validateVariant(unit, adapter);
  newUnits.push(unit);
  reviewRows.push({ unitId: unit.id, reviewPayloadSha256: sha(reviewPayload(unit)) });
}

const newUnitsBytes = encoded(newUnits);
const candidateVariantsBytes = encoded([...existing, ...newUnits]);
await output('NEW-UNITS.json', newUnitsBytes);
await output('variants.candidate.json', candidateVariantsBytes);
await output('CANDIDATE-SPEC.json', specBytes);
const manifest = {
  schemaVersion: 1,
  candidateId: spec.candidateId,
  status: 'unpublished-awaiting-exact-hash-approval',
  candidateDate: spec.candidateDate,
  proposedUnitCount: newUnits.length,
  proposedUnitIds: newUnits.map(unit => unit.id),
  inputs: {
    specSha256: sha(specBytes),
    predecessorVariantsSha256: sha(existingBytes),
    suppliedBookFiles: bookInputs,
    frozenCorpusChapters: Object.fromEntries([...chapterInputs].sort(([a], [b]) => a.localeCompare(b))),
  },
  outputs: {
    'NEW-UNITS.json': sha(newUnitsBytes),
    'variants.candidate.json': sha(candidateVariantsBytes),
  },
  reviewPayloads: reviewRows,
  scriptureChanged: false,
  publicEditorialSourceChanged: false,
  authorWebsiteChanged: false,
};
const manifestBytes = encoded(manifest);
await output('CANDIDATE-MANIFEST.json', manifestBytes);
const manifestSha = sha(manifestBytes);

const review: string[] = [
  '# Volume One additions — editorial review candidate',
  '',
  'Status: **unpublished; awaiting approval of the exact candidate-manifest hash**',
  '',
  `Candidate manifest SHA-256: \`${manifestSha}\``,
  '',
  'This batch adds nine proposed Ordinary Means studies. Seven compare differences directly visible in the frozen editions. Two are deliberately limited to publisher-note presentation because no displayed edition embodies the alternative.',
  '',
];
for (const [index, unit] of newUnits.entries()) {
  review.push(
    `## ${unit.id}: ${unit.title}`,
    '',
    `Reference: ${spec.units[index].reference}  `,
    `Review-payload SHA-256: \`${reviewRows[index].reviewPayloadSha256}\`  `,
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
    '### Verified publisher notes',
    '',
    ...spec.units[index].noteRefs.map(note => `- ${note.editionId} \`${note.noteId}\`: ${note.body}`),
    '',
  );
}
await output('REVIEW.md', review.join('\n') + '\n');
const validation = {
  schemaVersion: 1,
  status: 'pass',
  candidateManifestSha256: manifestSha,
  proposedUnitCount: newUnits.length,
  validatedUnitIds: newUnits.map(unit => unit.id),
  exactPublisherNoteCount: spec.units.flatMap(unit => unit.noteRefs).length,
  frozenCorpusChapterCount: chapterInputs.size,
  immutableBookInputsVerified: true,
  sourceFilesModified: false,
};
await output('VALIDATION.json', encoded(validation));
console.log(JSON.stringify(validation, null, 2));
