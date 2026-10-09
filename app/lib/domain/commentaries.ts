import { isOtBook } from './ot-release.ts';
import { address, expand, type PassageRange } from './references.ts';
export const lenskiRelease = 'lenski-2026-10-08-v1';
export const lenskiBase = `/commentaries/${lenskiRelease}`;
export const kdRelease = 'kd-2026-10-08-v1';
export const kdBase = `/commentaries/${kdRelease}`;
export const commentaryCollections = {
  lenski: { id: 'lenski', title: 'Lenski on the New Testament', author: 'R. C. H. Lenski', release: lenskiRelease, base: lenskiBase, count: 27 },
  kd: { id: 'kd', title: 'Keil & Delitzsch on the Old Testament', author: 'C. F. Keil and F. Delitzsch', release: kdRelease, base: kdBase, count: 39 },
} as const;
export function commentaryForBook(book: string) { return isOtBook(book) ? commentaryCollections.kd : commentaryCollections.lenski; }

export type CommentarySection = { id: string; sourceLabel?: string; mappingNote?: string; paragraph: number; toParagraph: number; start: number; end: number };
export type CommentaryChapter = { schemaVersion: 1; releaseId: string; book: string; name: string; chapter: number; sourceSha256: string; introEnd: number; paragraphs: string[]; sections: CommentarySection[]; unmappedVerses: number[]; mappingMode?: string; relatedSections?: {chapter: number; paragraph: number; label: string; excerpt: string}[] };
export function commentaryChapters(ranges: PassageRange[], includeOt = false) {
  const chapters = new Map<string, { book: string; chapter: number; verses: number[] }>();
  for (const anchor of ranges.flatMap(expand)) {
    const { book, chapter, verse } = address(anchor);
    if (!includeOt && isOtBook(book.code)) continue;
    const key = `${book.code}.${chapter}`;
    const item = chapters.get(key) || { book: book.code, chapter, verses: [] };
    if (!item.verses.includes(verse)) item.verses.push(verse);
    chapters.set(key, item);
  }
  return [...chapters.values()];
}
export function matchingCommentary(chapter: CommentaryChapter, verses: number[]) {
  return chapter.sections.filter(section => verses.some(verse => verse >= section.start && verse <= section.end));
}
export async function loadCommentaryChapter(book: string, chapter: number, signal?: AbortSignal): Promise<CommentaryChapter> {
  address(`${book}.${chapter}.1`);
  const collection = commentaryForBook(book);
  const response = await fetch(`${collection.base}/chapters/${book}/${chapter}.json`, { signal });
  if (!response.ok) throw Error('The commentary could not be loaded. Please try again.');
  const value = await response.json() as CommentaryChapter;
  if (value.schemaVersion !== 1 || value.releaseId !== collection.release || value.book !== book || value.chapter !== chapter || !Array.isArray(value.paragraphs) || value.paragraphs.some(p => typeof p !== 'string') || !Array.isArray(value.sections)) throw Error('The commentary does not match this release.');
  return value;
}
export function commentaryLibraryUrl(book = '', chapter = 1, view = 'chapter', paragraph?: number, collection?: string) {
  const q = new URLSearchParams({ view: 'commentaries' });
  if (collection === 'kd' || (book && isOtBook(book))) q.set('commentary', 'kd');
  if (book) { q.set('commentaryBook', book); q.set('commentaryChapter', String(chapter)); }
  if (view === 'intro') q.set('commentaryView', 'intro');
  if (paragraph !== undefined) q.set('commentaryParagraph', String(paragraph));
  return `/library?${q}`;
}
