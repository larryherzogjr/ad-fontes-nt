import { expand, type PassageRange } from './references.ts';
import editions from './editions.json' with { type: 'json' };
export type Note = {
  id: string;
  title: string;
  body: string;
  ranges: PassageRange[];
  quotation: { editionId: string; releaseId: string; text: string } | null;
  version: number;
  createdAt: string;
  updatedAt: string;
};
export const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export function noteInput(
  input: unknown,
): Pick<Note, 'id' | 'title' | 'body' | 'ranges' | 'quotation'> {
  const n = input as Note;
  if (
    !n ||
    !uuidPattern.test(n.id) ||
    typeof n.title !== 'string' ||
    n.title.length > 160 ||
    typeof n.body !== 'string' ||
    !n.body.trim() ||
    n.body.length > 50000 ||
    !Array.isArray(n.ranges) ||
    !n.ranges.length ||
    n.ranges.length > 100
  )
    throw Error('Invalid note');
  const ranges = n.ranges.map((r) => {
    if (!r || typeof r.start !== 'string' || typeof r.end !== 'string')
      throw Error('Invalid passage');
    const anchors = expand(r);
    if (!anchors.length || anchors.length > 1000)
      throw Error('Note passage is too large');
    return { start: r.start, end: r.end };
  });
  let quotation: Note['quotation'] = null;
  if (n.quotation != null) {
    const q = n.quotation;
    if (
      !editions.some(
        (e) => e.editionId === q.editionId && e.releaseId === q.releaseId,
      ) ||
      typeof q.text !== 'string' ||
      !q.text ||
      q.text.length > 100000
    )
      throw Error('Invalid quotation metadata');
    quotation = {
      editionId: q.editionId,
      releaseId: q.releaseId,
      text: q.text,
    };
  }
  return { id: n.id, title: n.title, body: n.body, ranges, quotation };
}
export function importNotes(input: unknown): Note[] {
  const doc = input as { schemaVersion: number; notes: Note[] };
  if (
    !doc ||
    doc.schemaVersion !== 1 ||
    !Array.isArray(doc.notes) ||
    doc.notes.length > 1000
  )
    throw Error(
      'Use an Ad Fontes notes export (version 1, at most 1,000 notes).',
    );
  const seen = new Set<string>();
  return doc.notes.map((n) => {
    const value = noteInput(n);
    if (seen.has(n.id)) throw Error('Duplicate note ID in import');
    seen.add(n.id);
    if (
      !Number.isSafeInteger(n.version) ||
      n.version < 1 ||
      ![n.createdAt, n.updatedAt].every(
        (d) => typeof d === 'string' && Number.isFinite(Date.parse(d)),
      ) ||
      Date.parse(n.updatedAt) < Date.parse(n.createdAt)
    )
      throw Error('Invalid note timestamps or version');
    return {
      ...value,
      version: n.version,
      createdAt: new Date(n.createdAt).toISOString(),
      updatedAt: new Date(n.updatedAt).toISOString(),
    };
  });
}
export function notesOverlap(
  note: Pick<Note, 'ranges'>,
  ranges: PassageRange[],
) {
  const selected = new Set(ranges.flatMap(expand));
  return note.ranges.some((r) => expand(r).some((a) => selected.has(a)));
}
