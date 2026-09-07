import { address, chapterNeighbor, compare, expand, type PassageRange } from './domain/references.ts';

/** Presentation only: canonical identities and source numbering are untouched. */
export function formatReference(ref: string) {
  try {
    const a = address(ref);
    return `${a.book.name} ${a.chapter}:${a.verse}`;
  } catch { return ref; }
}

export function formatPassage(ranges: PassageRange[]) {
  const anchors = [...new Set(ranges.flatMap(expand))].sort(compare);
  const compact: PassageRange[] = [];
  for (const anchor of anchors) {
    const prior = compact.at(-1);
    if (prior) {
      const a = address(prior.end);
      const next = a.verse < a.book.verses[a.chapter - 1]
        ? `${a.book.code}.${a.chapter}.${a.verse + 1}`
        : (() => { const n = chapterNeighbor(a.book.code, a.chapter, 1); return n ? `${n.book}.${n.chapter}.1` : ''; })();
      if (next === anchor) { prior.end = anchor; continue; }
    }
    compact.push({ start: anchor, end: anchor });
  }
  return compact.map(r => {
    if (r.start === r.end) return formatReference(r.start);
    const a = address(r.start), b = address(r.end);
    const end = a.book.code !== b.book.code ? formatReference(r.end)
      : a.chapter !== b.chapter ? `${b.chapter}:${b.verse}` : `${b.verse}`;
    return `${formatReference(r.start)}–${end}`;
  }).join('; ');
}

/** Mirrors whole-word / quoted-phrase search while retaining every original character. */
export function searchHighlights(text: string, query: string) {
  const q = query.trim().toLocaleLowerCase();
  const spans: { start: number; end: number }[] = [];
  if (q.startsWith('"') && q.endsWith('"')) {
    const needle = q.slice(1, -1);
    if (needle) {
      const lower = text.toLocaleLowerCase();
      // Map lower-case offsets back to source offsets (case folding may change length).
      const offsets: number[] = [];
      let source = 0;
      for (const char of text) {
        for (let i = 0; i < char.toLocaleLowerCase().length; i++) offsets.push(source);
        source += char.length;
      }
      offsets.push(text.length);
      for (let at = lower.indexOf(needle); at !== -1; at = lower.indexOf(needle, at + needle.length))
        spans.push({ start: offsets[at], end: offsets[at + needle.length] });
    }
  } else {
    const words = new Set(q.match(/[\p{L}\p{N}]+/gu) || []);
    for (const match of text.matchAll(/[\p{L}\p{N}]+/gu))
      if (words.has(match[0].toLocaleLowerCase())) spans.push({ start: match.index, end: match.index + match[0].length });
  }
  const parts: { text: string; match: boolean }[] = [];
  let at = 0;
  for (const span of spans) {
    if (span.start > at) parts.push({ text: text.slice(at, span.start), match: false });
    parts.push({ text: text.slice(span.start, span.end), match: true });
    at = span.end;
  }
  if (at < text.length) parts.push({ text: text.slice(at), match: false });
  return parts;
}
