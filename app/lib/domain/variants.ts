import { expand, type PassageRange } from './references.ts';
import { editions, type CorpusAdapter, type Coverage } from './corpus.ts';
export type Variant = {
  id: string;
  title: string;
  ranges: PassageRange[];
  status: 'draft' | 'in-review' | 'approved' | 'rejected';
  assignedReviewerId: string;
  contentType: 'Ordinary Means commentary';
  readings: {
    editionId: string;
    releaseId: string;
    state: 'present' | 'absent' | 'bracketed' | 'relocated' | 'mixed';
    coverage?: Pick<Coverage, 'anchor' | 'dataState' | 'textState'>[];
    spans: { segmentId: string; start: number; end: number; text: string }[];
    // One reviewed textual unit, potentially beginning/ending inside verses.
    // Whole-verse coverage above remains the unchanged corpus account.
    focus?: {
      state: 'present' | 'absent' | 'bracketed';
      spans: { segmentId: string; start: number; end: number; text: string }[];
    };
  }[];
  citations: {
    editionId: string;
    releaseId: string;
    sourceId: string;
    url: string;
  }[];
  attestations: { witness: string; citationUrl: string; statement: string }[];
  significance: { sourceObservation: string; interpretation: string } | null;
  author: string | null;
  byline?: string;
  relatedUnits?: string[];
  presentation?: 'publisher-note';
  publisherNotes?: { editionId: string; releaseId: string; noteId: string; body: string }[];
  comparisonNotice?: string;
  explanationSources?: { id: string; label: string; locator: string; url?: string }[];
  rights: 'cleared' | 'unresolved';
  provenance: string;
};
export type Review = {
  unitId: string;
  reviewerId: string;
  contentHash: string;
  reviewedAt: string;
  decision: 'approved' | 'rejected';
};
export function reviewPayload(v: Variant) {
  // Status can advance without changing the content the human approved.
  const { status, ...content } = v;
  return JSON.stringify(content);
}
export async function validateVariant(
  v: Variant,
  adapter: (id: string) => CorpusAdapter,
) {
  if (!/^[a-z0-9-]+$/.test(v.id) || !v.ranges.length || !v.title.trim())
    throw Error('Invalid variant identity or passage');
  v.ranges.flatMap(expand);
  if (v.contentType !== 'Ordinary Means commentary')
    throw Error('Invalid content category');
  if (v.presentation !== undefined && v.presentation !== 'publisher-note')
    throw Error('Invalid explanation presentation');
  if (v.presentation === 'publisher-note' && !v.publisherNotes?.length)
    throw Error('Publisher-note study needs pinned notes');
  if (v.comparisonNotice !== undefined && !v.comparisonNotice.trim())
    throw Error('Empty comparison notice');
  for (const note of v.publisherNotes || []) {
    const corpus = adapter(note.editionId);
    if (corpus.releaseId !== note.releaseId) throw Error('Stale publisher note release');
    const chapters = await corpus.getReadingChapters(v.ranges);
    if (!chapters.flatMap(c => c.notes).some(n => n.id === note.noteId && n.body === note.body && v.ranges.flatMap(expand).includes(n.anchor)))
      throw Error('Publisher note does not match source');
  }
  const ids = new Set<string>();
  for (const reading of v.readings) {
    const meta = editions.find((e) => e.editionId === reading.editionId);
    if (
      !meta ||
      meta.releaseId !== reading.releaseId ||
      ids.has(reading.editionId)
    )
      throw Error('Unknown, duplicate or stale edition release');
    ids.add(reading.editionId);
    const passage = await adapter(reading.editionId).getPassage(v.ranges);
    if (reading.focus) {
      const focus = reading.focus;
      if (!['present', 'absent', 'bracketed'].includes(focus.state) ||
          (focus.state === 'absent') !== (focus.spans.length === 0) ||
          passage.coverage.some(c => c.dataState !== 'available'))
        throw Error('Invalid textual-unit coverage');
      let previous = -1;
      for (const [i, span] of focus.spans.entries()) {
        const index = passage.segments.findIndex(s => s.id === span.segmentId);
        const source = passage.segments[index];
        if (!source || !Number.isInteger(span.start) || !Number.isInteger(span.end) ||
            span.start < 0 || span.end <= span.start || span.end > source.text.length ||
            source.text.slice(span.start, span.end) !== span.text ||
            (i > 0 && (index !== previous + 1 || span.start !== 0)) ||
            (i < focus.spans.length - 1 && span.end !== source.text.length))
          throw Error('Textual unit must match one continuous source span');
        previous = index;
      }
      if (focus.state === 'bracketed' && !passage.coverage.some(c => c.textState === 'bracketed') &&
          !/^(?:<[^<>]+>|\[[^\[\]]+\])$/.test(focus.spans.map(s => s.text).join(' ')))
        throw Error('Unsupported textual-unit bracket claim');
    }
    const states = new Set(passage.coverage.map(c => c.textState));
    const mixed = states.size > 1;
    if ((reading.state === 'mixed') !== mixed)
      throw Error('Mixed range must retain per-verse coverage');
    if (mixed && !reading.coverage) throw Error('Missing per-verse coverage');
    if (reading.coverage && JSON.stringify(reading.coverage) !== JSON.stringify(passage.coverage.map(({anchor, dataState, textState}) => ({anchor, dataState, textState}))))
      throw Error('Per-verse coverage does not match source');
    if (reading.state === 'absent') {
      if (
        reading.spans.length ||
        passage.coverage.some(
          (c) => c.dataState !== 'available' || c.textState !== 'absent',
        )
      )
        throw Error('Unsupported absence claim');
    } else {
      if (!reading.spans.length) throw Error('Orphan reading');
      for (const span of reading.spans) {
        const source = passage.segments.find((s) => s.id === span.segmentId);
        if (
          !source ||
          !Number.isInteger(span.start) ||
          !Number.isInteger(span.end) ||
          span.start < 0 ||
          span.end <= span.start ||
          span.end > source.text.length ||
          source.text.slice(span.start, span.end) !== span.text
        )
          throw Error('Reading does not match its source span');
      }
      if (
        reading.state === 'bracketed' &&
        !passage.coverage.some((c) => c.textState === 'bracketed')
      )
        throw Error('Unsupported bracket claim');
      if (
        reading.state === 'relocated' &&
        !passage.coverage.some((c) => c.textState === 'relocated')
      )
        throw Error('Unsupported placement claim');
    }
    if (
      !v.citations.some(
        (c) =>
          c.editionId === reading.editionId &&
          c.releaseId === reading.releaseId &&
          c.sourceId.trim() &&
          /^https:\/\//.test(c.url),
      )
    )
      throw Error('Missing source citation');
  }
  if (v.relatedUnits && (new Set(v.relatedUnits).size !== v.relatedUnits.length || v.relatedUnits.some(id => id === v.id || !/^[a-z0-9-]+$/.test(id))))
    throw Error('Invalid related note identifiers');
  const sourceIds = new Set<string>();
  for (const source of v.explanationSources || []) {
    if (!/^[SC]\d+$/.test(source.id) || sourceIds.has(source.id) || !source.label.trim() || !source.locator.trim() || (source.url && !/^https:\/\//.test(source.url)))
      throw Error('Invalid explanation citation');
    sourceIds.add(source.id);
  }
  for (const prose of [v.significance?.sourceObservation, v.significance?.interpretation]) {
    for (const match of (prose || '').matchAll(/\[([SC]\d+(?:,\s*[SC]\d+)*)\]/g))
      for (const id of match[1].split(/,\s*/))
        if (!sourceIds.has(id)) throw Error('Unresolved explanation citation');
  }
  if (!v.readings.length) throw Error('No readings');
  for (const a of v.attestations)
    if (
      !a.witness.trim() ||
      !a.statement.trim() ||
      !/^https:\/\//.test(a.citationUrl)
    )
      throw Error('Uncited witness claim');
}
export function validatePublication(
  v: Variant,
  reviews: Review[],
  reviewerIds: Set<string>,
  hash: string,
) {
  if (v.status !== 'approved')
    throw Error('Draft or unapproved material cannot be published');
  if (
    v.rights !== 'cleared' ||
    !v.author?.trim() ||
    !v.significance?.sourceObservation.trim() ||
    !v.significance.interpretation.trim()
  )
    throw Error('Missing rights, author or reviewed significance');
  if (!reviewerIds.has(v.assignedReviewerId)) throw Error('Unknown reviewer');
  const r = reviews.filter(
    (r) =>
      r.unitId === v.id &&
      r.reviewerId === v.assignedReviewerId,
  ).reduce<Review | undefined>((latest, current) => {
    if (!/^\d{4}-\d{2}-\d{2}/.test(current.reviewedAt) || !Number.isFinite(Date.parse(current.reviewedAt)))
      throw Error('Invalid human review date');
    return !latest || Date.parse(current.reviewedAt) >= Date.parse(latest.reviewedAt) ? current : latest;
  }, undefined);
  if (!r || r.decision !== 'approved' || r.contentHash !== hash)
    throw Error('No matching human approval for this exact content');
}

// A note about a publisher footnote must not become an edition-comparison result.
export function selectStudyUnits(units: Variant[], requested: string | null, notesMode: boolean) {
  const target = units.find(v => v.id === requested);
  if (requested && !target) throw Error('That reviewed note is not available for this passage.');
  const noteOnly = notesMode || target?.presentation === 'publisher-note' ||
    (units.length === 1 && units[0].presentation === 'publisher-note');
  if (notesMode && target?.presentation !== 'publisher-note')
    throw Error('Choose a published publisher-note explanation.');
  const selected = noteOnly
    ? units.filter(v => v.presentation === 'publisher-note' && (!requested || v.id === requested))
    : units.filter(v => v.presentation !== 'publisher-note');
  return { noteOnly, selected: [...selected].sort((a,b) => Number(b.id === requested) - Number(a.id === requested)),
    noteLinks: noteOnly ? [] : units.filter(v => v.presentation === 'publisher-note') };
}
