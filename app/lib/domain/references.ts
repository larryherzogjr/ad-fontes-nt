import registry from './canonical-registry.json' with { type: 'json' };
export const books = registry;
export type Anchor = string;
export type PassageRange = { start: Anchor; end: Anchor };
export class ReferenceError extends Error {
  code = 'invalid-reference' as const;
}
const key = (s: string) => s.toLowerCase().replace(/[.\s]/g, '');
export function bookFor(s: string) {
  return books.find((b) => b.aliases.some((a) => key(a) === key(s)));
}
export function address(anchor: string) {
  const match = /^([A-Z0-9]{3})\.(\d+)\.(\d+)$/.exec(anchor);
  if (!match)
    throw new ReferenceError(
      'Use a New Testament reference, such as Romans 3:23.',
    );
  const book = books.find((b) => b.code === match[1]);
  const chapter = Number(match[2]);
  const verse = Number(match[3]);
  if (
    !book ||
    chapter < 1 ||
    chapter > book.verses.length ||
    verse < 1 ||
    verse > book.verses[chapter - 1]
  )
    throw new ReferenceError(
      'That chapter or verse is outside the New Testament reference registry.',
    );
  return { book, chapter, verse };
}
export function compare(a: string, b: string) {
  const x = address(a),
    y = address(b);
  return (
    x.book.order - y.book.order || x.chapter - y.chapter || x.verse - y.verse
  );
}
export function expand(range: PassageRange): string[] {
  if (compare(range.start, range.end) > 0)
    throw new ReferenceError('A passage must end after it begins.');
  const start = address(range.start),
    end = address(range.end),
    result = [];
  for (let bi = start.book.order; bi <= end.book.order; bi++) {
    const b = books[bi];
    for (
      let c = bi === start.book.order ? start.chapter : 1;
      c <= (bi === end.book.order ? end.chapter : b.verses.length);
      c++
    )
      for (
        let v =
          bi === start.book.order && c === start.chapter ? start.verse : 1;
        v <=
        (bi === end.book.order && c === end.chapter
          ? end.verse
          : b.verses[c - 1]);
        v++
      )
        result.push(`${b.code}.${c}.${v}`);
  }
  return result;
}
function endpoint(text: string, context?: string) {
  const canonical = /^([A-Z0-9]{3})\.(\d+)\.(\d+)$/i.exec(text);
  if (canonical) {
    const a = `${canonical[1].toUpperCase()}.${+canonical[2]}.${+canonical[3]}`;
    address(a);
    return { start: a, end: a };
  }
  if (context && /^\d+(?::\d+)?$/.test(text)) {
    const a = address(context),
      parts = text.split(':').map(Number);
    const ref = `${a.book.code}.${parts.length === 2 ? parts[0] : a.chapter}.${parts.length === 2 ? parts[1] : parts[0]}`;
    address(ref);
    return { start: ref, end: ref };
  }
  const single = bookFor(text);
  if (single?.verses.length === 1) return chapterRange(single.code, 1);
  const m = /^(.+?)\s+(\d+)(?::(\d+))?$/.exec(text);
  if (!m)
    throw new ReferenceError(
      'Enter a book and chapter, or a passage such as Romans 3:23–26.',
    );
  const book = bookFor(m[1]);
  if (!book)
    throw new ReferenceError('Choose one of the 27 New Testament books.');
  const chapter = book.verses.length === 1 && !m[3] ? 1 : +m[2];
  const verse = m[3] ? +m[3] : book.verses.length === 1 ? +m[2] : 1;
  const start = `${book.code}.${chapter}.${verse}`;
  address(start);
  return {
    start,
    end:
      m[3] || book.verses.length === 1
        ? start
        : `${book.code}.${chapter}.${book.verses[chapter - 1]}`,
  };
}
export function resolveReference(input: string): PassageRange[] {
  const ranges = input
    .trim()
    .split(';')
    .map((part) => {
      const ends = part.trim().split(/\s*[-–]\s*/);
      if (ends.length > 2 || ends.some((e) => !e))
        throw new ReferenceError('Use a start and end for each range.');
      const a = endpoint(ends[0]);
      const chapterOnly =
        !ends[0].includes(':') &&
        !/^[A-Z0-9]{3}\./i.test(ends[0]) &&
        address(a.start).book.verses.length > 1;
      const b = ends[1]
        ? chapterOnly && /^\d+$/.test(ends[1])
          ? chapterRange(address(a.start).book.code, +ends[1])
          : endpoint(ends[1], a.start)
        : a;
      const range = { start: a.start, end: b.end };
      expand(range);
      return range;
    });
  for (let i = 1; i < ranges.length; i++)
    if (compare(ranges[i - 1].end, ranges[i].start) >= 0)
      throw new ReferenceError(
        'Separate ranges must be ordered and must not overlap.',
      );
  return ranges;
}
export function chapterRange(book: string, chapter: number) {
  const b = books.find((b) => b.code === book);
  if (!b || !b.verses[chapter - 1])
    throw new ReferenceError('Unknown chapter.');
  return {
    start: `${book}.${chapter}.1`,
    end: `${book}.${chapter}.${b.verses[chapter - 1]}`,
  };
}
export function chapterNeighbor(book: string, chapter: number, delta: number) {
  const b = books.find((b) => b.code === book)!;
  if (chapter + delta > 0 && chapter + delta <= b.verses.length)
    return { book, chapter: chapter + delta };
  const next = books[b.order + delta];
  return next
    ? { book: next.code, chapter: delta > 0 ? 1 : next.verses.length }
    : null;
}
export function passageUrl(ranges: PassageRange[], edition = 'BSB') {
  const a = address(ranges[0].start);
  return `/read/${a.book.code}/${a.chapter}?translation=${encodeURIComponent(edition)}&passage=${encodeURIComponent(ranges.map((r) => (r.start === r.end ? r.start : `${r.start}-${r.end}`)).join(';'))}`;
}
