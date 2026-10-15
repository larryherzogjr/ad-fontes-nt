import { libraryCollections } from './library-collections.ts';

export type LibraryView = 'overview' | typeof libraryCollections[number]['id'];
export type LibraryRoute = { view: LibraryView; q: string; book: string; kind: string; category: string; page: number; article: string; lemma: string };
export const emptyLibraryRoute: LibraryRoute = { view: 'overview', q: '', book: '', kind: '', category: '', page: 1, article: '', lemma: '' };

export function libraryRoute(search: string): LibraryRoute {
  const p = new URLSearchParams(search);
  const requested = p.get('view');
  let view: LibraryView = 'overview';
  if (requested === 'overview' || libraryCollections.some(c => c.id === requested)) view = requested as LibraryView;
  else if (!p.has('view')) {
    // Old filtered comparison bookmarks remain valid; unrelated parameters do not select a collection.
    if (p.get('article')) view = 'articles';
    else if (p.get('lemma')) view = 'lexicon';
    else if (p.get('hebrew')) view = 'hebrew';
    else if (['q', 'book', 'kind'].some(key => p.get(key)?.trim()) || /^[1-9]\d*$/.test(p.get('page') || '')) view = 'comparisons';
  }
  if (view === 'overview') return { ...emptyLibraryRoute };
  const page = Number(p.get('page'));
  return { view, q: p.get('q') || '', book: p.get('book') || '', kind: p.get('kind') || '', category: p.get('category') || '', page: Number.isSafeInteger(page) && page > 0 ? page : 1, article: p.get('article') || '', lemma: p.get('lemma') || '' };
}

export function libraryHref(route: LibraryRoute, changes: Partial<LibraryRoute>): string {
  const next = { ...route, ...(changes.view && changes.view !== route.view ? emptyLibraryRoute : {}), ...changes };
  const p = new URLSearchParams({ view: next.view });
  if (next.view === 'overview') return '/library?view=overview';
  if (next.q) p.set('q', next.q);
  if (next.book && next.view === 'comparisons') p.set('book', next.book);
  if (next.kind && next.view === 'comparisons') p.set('kind', next.kind);
  if (next.category && next.view === 'articles') p.set('category', next.category);
  if (next.page > 1) p.set('page', String(next.page));
  if (next.article && (next.view === 'articles' || next.view === 'hebrew')) p.set('article', next.article);
  if (next.lemma && next.view === 'lexicon') p.set('lemma', next.lemma);
  return `/library?${p}`;
}
