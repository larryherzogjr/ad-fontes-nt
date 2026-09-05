import { publisherNoteType } from '@/lib/domain/publisher-note-types';
import type { PublisherNote } from '@/lib/domain/corpus';

export default function PublisherNoteLabel({ releaseId, note }: {
  releaseId: string; note: PublisherNote;
}) {
  const annotation = publisherNoteType(releaseId, note);
  if (!annotation) return null;
  return <p className="study-help publisher-note-type">
    <strong>Note type (Ad Fontes NT): {annotation.label}.</strong>
    {annotation.detail && <> {annotation.detail}</>}
  </p>;
}
