import { dictionaryReading } from './greek-reading.ts';
import info from './analysis-release.json' with { type: 'json' };
import { getCorpus, CorpusError } from './corpus.ts';
import type { PassageRange } from './references.ts';
export const analysisInfo = info;
export type Token = {
  id: string;
  surface: string;
  start: number;
  end: number;
  sourceText: string;
  sourceId: string;
  lemma: string;
  lemmaId: string;
  functional: string;
  form: string;
  strongs: string;
  gloss: string | null;
  glossSourceId: string | null;
};
export type AnalysisSegment = {
  sourceRef: string;
  anchors: string[];
  text: string;
  status: 'available' | 'unavailable';
  reason?: string;
  tokens: Token[];
};
export type Occurrences = {
  lemma: string;
  lemmaId: string;
  releaseId: string;
  hits: {
    tokenId: string;
    sourceRef: string;
    anchor: string;
    surface: string;
    text: string;
  }[];
};
export type LexiconEntry = {
  id: string;
  headword: string;
  originalXml: string;
  transliteration: string | null;
  pronunciation: string | null;
  text: string;
  sourceId: string;
};
const cache = new Map<string, Promise<unknown>>();
async function load<T>(path: string): Promise<T> {
  if (!cache.has(path))
    cache.set(
      path,
      fetch(`/analysis/${info.releaseId}/${path}`)
        .then((r) => {
          if (!r.ok)
            throw new CorpusError(
              'unavailable-data',
              'The local analysis data could not be loaded.',
            );
          return r.json();
        })
        .catch((e) => {
          cache.delete(path);
          throw e;
        }),
    );
  return cache.get(path) as Promise<T>;
}
export async function getAnalysis(
  ranges: PassageRange[],
): Promise<AnalysisSegment[]> {
  const corpus = getCorpus('N1904');
  if (corpus.releaseId !== info.textReleaseId)
    throw new CorpusError(
      'unavailable-data',
      'Analysis and Scripture releases do not match.',
    );
  const passage = await corpus.getPassage(ranges),
    wanted = new Set(passage.segments.map((s) => s.id));
  const keys = [
    ...new Set(
      passage.segments.map((s) =>
        s.sourceRef!.split('.').slice(0, 2).join('/'),
      ),
    ),
  ];
  const chapters = await Promise.all(
    keys.map((k) =>
      load<{
        releaseId: string;
        textReleaseId: string;
        segments: AnalysisSegment[];
      }>(`${k}.json`),
    ),
  );
  if (
    chapters.some(
      (c) =>
        c.releaseId !== info.releaseId ||
        c.textReleaseId !== info.textReleaseId,
    )
  )
    throw new CorpusError('unavailable-data', 'Analysis release mismatch.');
  const result = chapters
    .flatMap((c) => c.segments)
    .filter((s) => wanted.has(s.sourceRef));
  if (result.length !== wanted.size)
    throw new CorpusError(
      'unavailable-data',
      'Analysis chapter data is incomplete.',
    );
  return result;
}
export function getOccurrences(id: string) {
  if (!/^[a-f0-9]{20}$/.test(id)) throw Error('Invalid lemma identifier');
  return load<Occurrences>(`lemmas/${id}.json`);
}
export async function getLexicon(strongs: string) {
  const id = strongs.split('&')[0];
  if (!/^\d+$/.test(id)) return null;
  // 1–5624 is the pinned historical dictionary's inventory, not a universal lemma registry.
  if (+id < 1 || +id > 5624) return null;
  const entry = await load<LexiconEntry>(`lexicon/G${+id}.json`);
  return { ...entry, ...dictionaryReading(entry.originalXml) };
}
const POS: Record<string, string> = {
  N: 'noun',
  A: 'adjective',
  T: 'article',
  V: 'verb',
  P: 'personal pronoun',
  R: 'relative pronoun',
  C: 'reciprocal pronoun',
  D: 'demonstrative pronoun',
  K: 'correlative pronoun',
  I: 'interrogative pronoun',
  X: 'indefinite pronoun',
  Q: 'correlative or interrogative pronoun',
  F: 'reflexive pronoun',
  S: 'possessive pronoun',
  ADV: 'adverb',
  CONJ: 'conjunction',
  COND: 'conditional particle',
  PRT: 'particle',
  PREP: 'preposition',
  INJ: 'interjection',
  ARAM: 'Aramaic',
  HEB: 'Hebrew',
};
const CASE: Record<string, string> = {
    N: 'nominative',
    V: 'vocative',
    G: 'genitive',
    D: 'dative',
    A: 'accusative',
  },
  NUM: Record<string, string> = { S: 'singular', P: 'plural' },
  GENDER: Record<string, string> = {
    M: 'masculine',
    F: 'feminine',
    N: 'neuter',
  };
const TENSE: Record<string, string> = {
  P: 'present',
  I: 'imperfect',
  F: 'future',
  '2F': 'second future',
  A: 'aorist',
  '2A': 'second aorist',
  R: 'perfect',
  '2R': 'second perfect',
  L: 'pluperfect',
  '2L': 'second pluperfect',
  X: 'tense not stated',
};
const VOICE: Record<string, string> = {
  A: 'active',
  M: 'middle',
  P: 'passive',
  E: 'middle or passive',
  D: 'middle deponent',
  O: 'passive deponent',
  N: 'middle or passive deponent',
  Q: 'impersonal active',
  X: 'voice not stated',
};
const MOOD: Record<string, string> = {
  I: 'indicative',
  S: 'subjunctive',
  O: 'optative',
  M: 'imperative',
  N: 'infinitive',
  P: 'participle',
  R: 'imperative participle',
};
export function describeMorph(code: string) {
  const [pos, body = '', ending = ''] = code.split('-'),
    labels = [POS[pos] || 'Unrecognized analysis'];
  if (['PRI', 'LI', 'OI', 'NUI'].includes(body))
    return `${labels[0]} · indeclinable (${code})`;
  if (pos === 'V') {
    const m = /^(2?[PIFARLX])([AMPEDONQX])([ISOMNPR])$/.exec(body);
    if (!m) return `${labels[0]} · additional analysis: ${code}`;
    labels.push(TENSE[m[1]], VOICE[m[2]], MOOD[m[3]]);
    if (/^[123][SP]$/.test(ending))
      labels.push(
        `${ending[0]}${ending[0] === '1' ? 'st' : ending[0] === '2' ? 'nd' : 'rd'} person`,
        NUM[ending[1]],
      );
    else if (/^[NVGDA][SP][MFN]$/.test(ending))
      labels.push(CASE[ending[0]], NUM[ending[1]], GENDER[ending[2]]);
  } else {
    const m = /^([123])?([NVGDA])([SP])([MFN])?$/.exec(body);
    if (m) {
      if (m[1])
        labels.push(
          `${m[1]}${m[1] === '1' ? 'st' : m[1] === '2' ? 'nd' : 'rd'} person`,
        );
      labels.push(CASE[m[2]], NUM[m[3]]);
      if (m[4]) labels.push(GENDER[m[4]]);
    } else if (body) labels.push(`additional analysis: ${code}`);
  }
  return labels.filter(Boolean).join(' · ');
}

export type HighlightedOccurrence = Occurrences['hits'][number] & {
  start: number;
  end: number;
};
/** Match the exact indexed token, including repeated words in the same verse. */
export async function highlightOccurrences(
  hits: Occurrences['hits'],
): Promise<HighlightedOccurrence[]> {
  return Promise.all(
    hits.map(async (h) => {
      const path = h.sourceRef.split('.').slice(0, 2).join('/');
      if (!/^[A-Z1-3]{3}\/\d+$/.test(path))
        throw Error('Invalid occurrence source reference');
      const chapter = await load<{
        releaseId: string;
        textReleaseId: string;
        segments: AnalysisSegment[];
      }>(`${path}.json`);
      if (
        chapter.releaseId !== info.releaseId ||
        chapter.textReleaseId !== info.textReleaseId
      )
        throw Error('Occurrence analysis release mismatch');
      const segment = chapter.segments.find((s) => s.sourceRef === h.sourceRef);
      const token = segment?.tokens.find((t) => t.id === h.tokenId);
      if (
        !segment ||
        segment.text !== h.text ||
        !token ||
        token.surface !== h.surface ||
        segment.text.slice(token.start, token.end) !== h.surface
      )
        throw Error('Occurrence does not match its stored source token');
      return { ...h, start: token.start, end: token.end };
    }),
  );
}
