'use client';
import { useEffect, useState, type ReactNode } from 'react';
import { Popover, PopoverTrigger, PopoverContent, PopoverTitle } from '@/components/ui/popover';
import { PublisherNoteCategory, PublisherNoteDetail } from './publisher-note-label';
import { formatReference } from '@/lib/reading-display';
import type { PublisherNote } from '@/lib/domain/corpus';
import type { Variant } from '@/lib/domain/variants';

export default function PublisherFootnote({ note, edition, releaseId, units, onCommentary, children }: {
  note: PublisherNote; edition: string; releaseId: string; units: Variant[];
  onCommentary: (unit: Variant, focusId: string) => void; children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    try {
      if (!new URL(location.href).searchParams.has('panel') && sessionStorage.getItem('afnt-publisher-origin') === note.id) {
        sessionStorage.removeItem('afnt-publisher-origin');
        setOpen(true);
      }
    } catch {}
  }, [note.id]);
  return <Popover open={open} onOpenChange={setOpen}>
    <PopoverTrigger id={`marker-${note.id}`} className="note-marker" aria-label={`${edition} publisher note for ${formatReference(note.anchor)}`}>†</PopoverTrigger>
    <PopoverContent className="reader-popover publisher-popover" align="start">
      <PopoverTitle>{edition} publisher’s note · {formatReference(note.anchor)}</PopoverTitle>
      <PublisherNoteCategory releaseId={releaseId} note={note} />
      <div className="publisher-note-body">{children}</div>
      <PublisherNoteDetail releaseId={releaseId} note={note} />
      <div className="publisher-note-actions">
        <button onClick={() => setOpen(false)}>Return to verse</button>
        {units.map(unit => {
          const id = `popup-commentary-${note.id}-${unit.id}`;
          return <button key={unit.id} id={id} className="publisher-commentary-link" onClick={() => {
            try { sessionStorage.setItem('afnt-publisher-origin', note.id); } catch {}
            onCommentary(unit, id);
          }}>Read Ordinary Means commentary</button>;
        })}
      </div>
      <p className="study-help">Publisher wording is preserved. Note categories are supplied by Ad Fontes NT.</p>
    </PopoverContent>
  </Popover>;
}
