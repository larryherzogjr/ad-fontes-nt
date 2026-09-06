import type { Token } from './greek';
export type Definition = { headword: string; strongs: string; orth: string; brief: string; full: string; sourceId: string };
export type WordLink = { headword: string; title: string; url: string; access: string };
export type LookupBundle = { releaseId: string; entries: Record<string, Definition[]>; links: Record<string, WordLink[]> };
export function lexicalKey(value: string) { return value.normalize('NFC').toLowerCase(); }
export function resolveLookup(data: LookupBundle, token: Pick<Token, 'lemma' | 'strongs'>) {
  const key = lexicalKey(token.lemma);
  const numbers = token.strongs.split(/\D+/).filter(Boolean).map(n => String(Number(n)));
  const matches = (data.entries[key] || []).filter(e => numbers.includes(e.strongs));
  // Ambiguous entries are not silently collapsed into one definition.
  return { definition: matches.length === 1 ? matches[0] : null, links: data.links[key] || [] };
}
let pending: Promise<LookupBundle> | undefined;
export function loadLookup() {
  return pending ||= fetch('/lexical/dodson-2010-v1/lookup.json').then(async response => {
    if (!response.ok) throw new Error('Lexicon could not be loaded.');
    const data = await response.json() as LookupBundle;
    if (data.releaseId !== 'dodson-2010-v1' || !data.entries || !data.links) throw new Error('Lexicon release mismatch.');
    return data;
  }).catch(error => { pending = undefined; throw error; });
}
