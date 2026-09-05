import catalog from './resources.json' with { type: 'json' };
import { address, compare, resolveReference, type PassageRange } from './references.ts';
export const resources = catalog.map(resource => ({
  ...resource,
  byline: 'Larry Herzog Jr.',
  ranges: resource.references.flatMap(reference => resolveReference(reference)),
}));
export function relatedResources(ranges: PassageRange[]) {
  return resources.filter(resource => ranges.some(range =>
    resource.books.some(code => {
      const first = address(range.start).book.order;
      const last = address(range.end).book.order;
      const order = address(`${code}.1.1`).book.order;
      return first <= order && order <= last;
    }) || resource.ranges.some(candidate =>
      compare(candidate.start, range.end) <= 0 && compare(range.start, candidate.end) <= 0
    )
  ));
}
