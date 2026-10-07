import coverage from './lxx-coverage.json' with { type: 'json' };
import { isOtBook } from './ot-release.ts';
import { address, books, compare, expand, type PassageRange } from './references.ts';
import { CorpusError } from './corpus.ts';
import type { AnalysisSegment, Occurrences } from './greek.ts';
export const lxxRelease = 'lxx-rahlfs-1935-2026-10-07-v3';
const cache = new Map<string, Promise<unknown>>();
export async function loadLxx<T>(path: string): Promise<T> {
  if (!cache.has(path)) cache.set(path, fetch(`/analysis/${lxxRelease}/${path}`).then(async r => {
    if (!r.ok) throw new CorpusError('unavailable-data', 'The local Septuagint data could not be loaded.');
    const data = await r.json();
    if (data.releaseId !== lxxRelease) throw new CorpusError('unavailable-data', 'Septuagint release mismatch.');
    if (/^[A-Z0-9]{3}\/\d+\.json$/.test(path)) {
      const expected = (coverage as Record<string, number>)[path];
      if (expected === undefined || !Array.isArray(data.segments) || data.segments.length !== expected || data.segments.some((s: AnalysisSegment) => !Array.isArray(s.anchors) || !Array.isArray(s.tokens) || s.tokens.some(t => s.text.slice(t.start, t.end) !== t.surface))) throw new CorpusError('unavailable-data', 'Septuagint chapter data is incomplete or invalid.');
    }
    return data;
  }).catch(e => { cache.delete(path); throw e; }));
  return cache.get(path) as Promise<T>;
}
export async function getLxxAnalysis(ranges: PassageRange[]): Promise<AnalysisSegment[]> {
  const anchors = new Set(ranges.flatMap(expand));
  if ([...anchors].some(a => !isOtBook(a.split('.')[0]))) throw new CorpusError('unsupported-capability', 'Choose Greek study within one Testament.');
  const paths = [...new Set([...anchors].map(a => a.split('.').slice(0, 2).join('/')))];
  const chapters = await Promise.all(paths.map(p => loadLxx<{segments: AnalysisSegment[]}>(`${p}.json`)));
  const seen = new Set<string>();
  const result = chapters.flatMap(c => c.segments).filter(s => s.anchors.some(a => anchors.has(a)) && !seen.has(s.sourceRef) && !!seen.add(s.sourceRef));
  const covered = new Set(result.flatMap(s => s.anchors));
  for (const a of anchors) if (!covered.has(a)) {
    const canonical = books.find(b => b.code === a.split('.')[0])!.name.toLowerCase().replaceAll(' ', '-');
    const aliases: Record<string,string> = {joshua:'joshua-vaticanus-b',ezra:'2-esdras',nehemiah:'2-esdras',esther:'esther-greek',job:'job-lxx',psalms:'psalms-lxx',jeremiah:'jeremiah-lxx'};
    result.push({sourceBook: aliases[canonical] || canonical, sourceRef: a, sourceLabel: `${a} · correspondence unavailable`, anchors: [a], text: '', status: 'unavailable', reason: 'No verified Septuagint verse correspondence is available for this English reference. This does not indicate textual absence.', tokens: []});
  }
  return result;
}
export async function getLxxOccurrences(id: string) {
  if (!/^lxx-[a-f0-9]{20}$/.test(id)) throw Error('Invalid Septuagint lemma identifier');
  const data = await loadLxx<Occurrences>(`lemmas/${id}.json`);
  if (data.lemmaId !== id || !Array.isArray(data.hits) || data.hits.some(h => !h.tokenId?.startsWith('lxx-') || !h.chapterPath || typeof h.text !== 'string' || typeof h.surface !== 'string')) throw new CorpusError('unavailable-data', 'Septuagint occurrence data is incomplete or invalid.');
  for (const h of data.hits) address(h.anchor);
  return {...data, hits: [...data.hits].sort((a,b) => compare(a.anchor,b.anchor) || (a.start || 0) - (b.start || 0))};
}
const grammarWords: Record<string, string> = {
  fem: 'feminine', masc: 'masculine', neut: 'neuter', nom: 'nominative',
  acc: 'accusative', gen: 'genitive', dat: 'dative', voc: 'vocative',
  sg: 'singular', pl: 'plural', aor: 'aorist', imperf: 'imperfect',
  perf: 'perfect', plup: 'pluperfect', fut: 'future', pres: 'present',
  ind: 'indicative', subj: 'subjunctive', opt: 'optative', imperat: 'imperative',
  act: 'active', mid: 'middle', pass: 'passive', inf: 'infinitive', part: 'participle',
  '1st': 'first person', '2nd': 'second person', '3rd': 'third person',
};
/** Expand only recognized upstream words; unknown source tags remain visible. */
export function describeLxxMorph(code: string) {
  return code ? code.split(/\s+/).map(word => grammarWords[word] || word).join(' · ') : 'Unspecified';
}
