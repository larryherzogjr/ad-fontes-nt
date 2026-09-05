import annotations from './publisher-note-types.json' with { type: 'json' };
import type { PublisherNote } from './corpus.ts';

// Editorial display labels, reviewed in batch 2. Never infer a type from sigla
// or apply a label to a different release or changed publisher wording.
export function publisherNoteType(releaseId: string, note: PublisherNote) {
  return annotations.find(a => a.releaseId === releaseId &&
    a.noteId === note.id && a.anchor === note.anchor && a.body === note.body);
}
