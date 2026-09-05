import { expand } from './references.ts';
import type { Variant } from './variants.ts';
import type { Chapter, Run } from './corpus.ts';

export function reviewedAt(units: Variant[], anchors: string[]): Variant[] {
  const selected = new Set(anchors);
  return units.filter(unit => unit.status === 'approved' &&
    unit.ranges.some(range => expand(range).some(anchor => selected.has(anchor))));
}

/** Source numbering is not canonical identity, including joined/relocated verses. */
export function verseAnchors(chapter: Chapter, run: Run): string[] {
  const segment = chapter.segments.find(s => s.sourceRef === (run.sourceAnchor || run.anchor));
  return segment?.anchors || run.anchors || (run.anchor ? [run.anchor] : []);
}
