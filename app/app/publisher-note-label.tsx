import { publisherNoteType } from '@/lib/domain/publisher-note-types';
import type { PublisherNote } from '@/lib/domain/corpus';

const plainLabels: Record<string, string> = {
  'Rendering alternative': 'Translation wording',
  'Rendering note': 'Translation wording',
  'Rendering alternative and textual note': 'Translation wording and Greek textual differences',
  'Textual note': 'Greek textual differences',
  'Rendering alternative and verse numbering': 'Translation wording and verse numbering',
};
type Props = { releaseId: string; note: PublisherNote };
export function PublisherNoteCategory({ releaseId, note }: Props) {
  const annotation = publisherNoteType(releaseId, note);
  return annotation ? <span className="publisher-note-category"> · {plainLabels[annotation.label] || annotation.label}</span> : null;
}
export function PublisherNoteDetail({ releaseId, note }: Props) {
  const annotation = publisherNoteType(releaseId, note);
  return annotation?.detail ? <p className="study-help"><span>About this category: </span>{annotation.detail}</p> : null;
}
export default function PublisherNoteLabel(props: Props) {
  return <><p className="study-help">Publisher note<PublisherNoteCategory {...props} /></p><PublisherNoteDetail {...props} /></>;
}
