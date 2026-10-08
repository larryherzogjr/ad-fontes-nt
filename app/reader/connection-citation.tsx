'use client';
import { useEffect, useState } from 'react';
import type { PublisherNote } from '@/lib/domain/corpus';
import type { TestamentConnection } from '@/lib/domain/testament-connections';
import { address } from '@/lib/domain/references';
import { noteContent } from './publisher-note-content';

const chapters = new Map<string, Promise<PublisherNote[]>>();
function sourceNotes(path: string) {
  let pending = chapters.get(path);
  if (!pending) {
    pending = fetch(path).then(async response => {
      if (!response.ok) throw Error('Publisher source unavailable');
      return (await response.json()).notes as PublisherNote[];
    }).catch(error => { chapters.delete(path); throw error; });
    chapters.set(path, pending);
  }
  return pending;
}

export default function ConnectionCitation({ citation }: { citation: TestamentConnection }) {
  const [note, setNote] = useState<PublisherNote>();
  useEffect(() => {
    let active = true;
    setNote(undefined);
    if (citation.kind === 'publisher-cross-reference') {
      const { book, chapter } = address(citation.sourceRanges[0].start);
      sourceNotes(`/corpus/${citation.sourceRelease}/${book.code}/${chapter}.json`)
        .then(notes => {
          const original = notes.find(n => n.id === citation.noteId && n.body === citation.publisherNote);
          if (active) setNote(original);
        }).catch(() => { /* Preserve the catalog's exact text when source formatting is unavailable. */ });
    }
    return () => { active = false; };
  }, [citation]);
  return <span className="connection-citation">{note ? noteContent(note.original) : citation.publisherNote}</span>;
}
