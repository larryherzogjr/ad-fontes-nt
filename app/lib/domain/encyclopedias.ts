import release from './encyclopedias-release.json' with { type: 'json' };

export const encyclopediaRelease = release.releaseId;
export const encyclopediaBase = `/library/encyclopedias/${encyclopediaRelease}`;
export type EncyclopediaEntry = { id: string; title: string; label: string; letter: string; preview: string; kind: string; sha256: string };
export type EncyclopediaWork = { id: string; title: string; year: string; editors: string; articleCount: number; entries: EncyclopediaEntry[] };
export type EncyclopediaIndex = { schemaVersion: number; releaseId: string; works: EncyclopediaWork[] };
export type EncyclopediaArticle = { schemaVersion: number; releaseId: string; work: string; id: string; title: string; label: string; textSha256: string; source: string; paragraphs: string[]; suppliedVolume: number | null; suppliedSection: string | null; redirect: { label: string; targets: string[]; status: string } | null };
export const encyclopediaFold = (text: string) => text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();

async function checked<T>(path: string, hash: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`${encyclopediaBase}/${path}`, { signal });
  if (!response.ok) throw Error('The encyclopedia reading could not be loaded. Please retry.');
  const bytes = await response.arrayBuffer();
  const digest = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)), b => b.toString(16).padStart(2, '0')).join('');
  if (digest !== hash) throw Error('Encyclopedia data does not match this release. Please reload.');
  return JSON.parse(new TextDecoder().decode(bytes)) as T;
}
export async function loadEncyclopedias(signal?: AbortSignal) {
  const index = await checked<EncyclopediaIndex>('index.json', release.indexSha256, signal);
  if (index.schemaVersion !== 1 || index.releaseId !== encyclopediaRelease || index.works.length !== 2 ||
    index.works.some(w => !['isbe', 'lutheran'].includes(w.id) || w.entries.length !== w.articleCount + 1)) throw Error('The encyclopedia catalog is incomplete.');
  return index;
}
export async function loadEncyclopediaArticle(work: EncyclopediaWork, entry: EncyclopediaEntry, signal?: AbortSignal) {
  const article = await checked<EncyclopediaArticle>(`articles/${work.id}/${entry.id}.json`, entry.sha256, signal);
  if (article.schemaVersion !== 1 || article.releaseId !== encyclopediaRelease || article.work !== work.id || article.id !== entry.id || article.title !== entry.title || !Array.isArray(article.paragraphs)) throw Error('The encyclopedia article is incomplete.');
  return article;
}
/** Keep browsing context in shareable links; source IDs never derive from a headword. */
export function encyclopediaHref(search: string, changes: Record<string, string> = {}) {
  const source = new URLSearchParams(search), p = new URLSearchParams({ view: 'encyclopedias' });
  for (const key of ['work', 'entry', 'q', 'letter', 'page', 'browseWork']) {
    const value = key in changes ? changes[key] : source.get(key);
    if (value) p.set(key, value);
  }
  return `/library?${p}`;
}
