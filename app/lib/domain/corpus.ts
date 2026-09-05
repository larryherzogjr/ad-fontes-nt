import { address, expand, compare, type PassageRange } from './references.ts';
import catalog from './editions.json' with { type: 'json' };
export const editions = catalog;
export const releaseId = 'bsb-2026-09-05-m2-v1';
export type Placement = {
  book: string;
  chapter: number;
  segmentId: string;
  sourceRef: string;
  mappingType: string;
};
export type Coverage = {
  anchor: string;
  dataState: 'available' | 'unavailable' | 'unmapped';
  textState: 'present' | 'absent' | 'bracketed' | 'relocated' | 'unknown';
  publisherNoteIds: string[];
  placements?: Placement[];
  evidence?: string;
};
export type Run = {
  text?: string;
  originalText?: string;
  anchor?: string;
  verse?: string;
  noteId?: string;
  marks?: string[];
  anchors?: string[];
  sourceAnchor?: string;
};
export type PublisherNote = {
  id: string;
  anchor: string;
  body: string;
  sourceId: string;
  original: { content: unknown[] };
};
export type Segment = {
  id: string;
  sourceId: string;
  sourceLabel: string;
  sourceRef?: string;
  anchors: string[];
  mappingType: string;
  text: string;
};
export type Chapter = {
  book: string;
  chapter: number;
  releaseId: string;
  blocks: { marker: string; role: string; sourceId: string; runs: Run[] }[];
  segments: Segment[];
  notes: PublisherNote[];
  coverage: Coverage[];
  alternatives?: {
    label: string;
    sourceId: string;
    sourceRef: string;
    text: string;
  }[];
};
export type SearchHit = { anchor: string; book: string; text: string };
export class CorpusError extends Error {
  code: 'unsupported-edition' | 'unavailable-data' | 'unsupported-capability';
  constructor(
    code: 'unsupported-edition' | 'unavailable-data' | 'unsupported-capability',
    message: string,
  ) {
    super(message);
    this.code = code;
  }
}
export interface CorpusAdapter {
  editionId: string;
  releaseId: string;
  getChapter(book: string, chapter: number): Promise<Chapter>;
  getPassage(ranges: PassageRange[]): Promise<{
    editionId: string;
    releaseId: string;
    ranges: PassageRange[];
    segments: Segment[];
    coverage: Coverage[];
  }>;
  getReadingChapters(ranges: PassageRange[]): Promise<Chapter[]>;
  getEditionCoverage(ranges: PassageRange[]): Promise<Coverage[]>;
  getPublisherNotes(book: string, chapter: number): Promise<PublisherNote[]>;
  searchText(
    query: string,
    book?: string,
    page?: number,
  ): Promise<{ hits: SearchHit[]; total: number; page: number }>;
}
export function matchText(text: string, query: string) {
  const q = query.trim().toLocaleLowerCase();
  const t = text.toLocaleLowerCase();
  if (q.startsWith('"') && q.endsWith('"')) return t.includes(q.slice(1, -1));
  const words: string[] = t.match(/[\p{L}\p{N}]+/gu) || [];
  return (q.match(/[\p{L}\p{N}]+/gu) || []).every((w) => words.includes(w));
}
export function createLocalAdapter(
  load: (path: string) => Promise<unknown> = async (path) => {
    const r = await fetch(path);
    if (!r.ok) throw new Error(`${r.status}`);
    return r.json();
  },
  editionId = 'BSB',
): CorpusAdapter {
  const meta = editions.find((e) => e.editionId === editionId);
  if (!meta)
    throw new CorpusError(
      'unsupported-edition',
      `The edition ${editionId} is not installed.`,
    );
  const releaseId = meta.releaseId;
  const cache = new Map<string, Promise<Chapter>>();
  let index: Promise<SearchHit[]> | undefined;
  async function read<T>(path: string): Promise<T> {
    try {
      return (await load(`/corpus/${releaseId}/${path}`)) as T;
    } catch {
      throw new CorpusError(
        'unavailable-data',
        `The local ${editionId} data could not be loaded. This is an application data error, not a verse omitted by this edition.`,
      );
    }
  }
  const adapter: CorpusAdapter = {
    editionId,
    releaseId,
    async getChapter(book, chapter) {
      address(`${book}.${chapter}.1`);
      const key = `${book}/${chapter}.json`;
      if (!cache.has(key))
        cache.set(
          key,
          read<Chapter>(key)
            .then((d) => {
              if (
                d.releaseId !== releaseId ||
                d.book !== book ||
                d.chapter !== chapter ||
                !d.segments?.length ||
                !d.blocks?.length ||
                d.coverage?.length !==
                  address(`${book}.${chapter}.1`).book.verses[chapter - 1] ||
                d.coverage.some(
                  (c, i) =>
                    c.anchor !== `${book}.${chapter}.${i + 1}` ||
                    c.dataState !== 'available' ||
                    !c.placements ||
                    !c.evidence ||
                    (c.textState === 'absent'
                      ? c.placements.length !== 0
                      : !c.placements.length ||
                        c.placements.some(
                          (p) =>
                            p.book === book &&
                            p.chapter === chapter &&
                            !d.segments.some(
                              (s) =>
                                s.id === p.segmentId &&
                                s.anchors.includes(c.anchor),
                            ),
                        )),
                )
              )
                throw new CorpusError(
                  'unavailable-data',
                  'The chapter bundle is incomplete.',
                );
              return d;
            })
            .catch((e) => {
              cache.delete(key);
              throw e;
            }),
        );
      return cache.get(key)!;
    },
    async getReadingChapters(ranges) {
      const anchors = ranges.flatMap(expand);
      const keys = [
        ...new Set(
          anchors.map((a) => {
            const x = address(a);
            return `${x.book.code}/${x.chapter}`;
          }),
        ),
      ];
      const readKey = (key: string) => {
        const [b, c] = key.split('/');
        return adapter.getChapter(b, +c);
      };
      const primary = await Promise.all(keys.map(readKey));
      const wanted = new Set(anchors);
      const placements = primary
        .flatMap((c) => c.coverage)
        .filter((c) => wanted.has(c.anchor))
        .flatMap((c) => c.placements || []);
      const extraKeys = [
        ...new Set(placements.map((p) => `${p.book}/${p.chapter}`)),
      ].filter((k) => !keys.includes(k));
      const all = [...primary, ...(await Promise.all(extraKeys.map(readKey)))];
      for (const p of placements) {
        if (
          !all.some(
            (c) =>
              c.book === p.book &&
              c.chapter === p.chapter &&
              c.segments.some((s) => s.id === p.segmentId),
          )
        )
          throw new CorpusError(
            'unavailable-data',
            'A mapped source segment could not be loaded.',
          );
      }
      return all;
    },
    async getPassage(ranges) {
      const anchors = ranges.flatMap(expand);
      const chapters = await adapter.getReadingChapters(ranges);
      const wanted = new Set(anchors);
      return {
        editionId,
        releaseId,
        ranges,
        segments: [...chapters]
          .sort((a, b) =>
            compare(`${a.book}.${a.chapter}.1`, `${b.book}.${b.chapter}.1`),
          )
          .flatMap((c) => c.segments)
          .filter((s) => s.anchors.some((a) => wanted.has(a))),
        coverage: anchors.map(
          (a) =>
            chapters.flatMap((c) => c.coverage).find((c) => c.anchor === a) || {
              anchor: a,
              dataState: 'unavailable',
              textState: 'unknown',
              publisherNoteIds: [],
            },
        ),
      };
    },
    async getEditionCoverage(ranges) {
      return (await adapter.getPassage(ranges)).coverage;
    },
    async getPublisherNotes(book, chapter) {
      return (await adapter.getChapter(book, chapter)).notes;
    },
    async searchText(query, book, page = 1) {
      if (meta.language !== 'en')
        throw new CorpusError(
          'unsupported-capability',
          'Text search is available in the four English editions. Use Explore Greek for source-backed word analysis.',
        );
      if (!query.trim() || !/[\p{L}\p{N}]/u.test(query))
        return { hits: [], total: 0, page: 1 };
      index ??= read<SearchHit[]>('search.json').catch((e) => {
        index = undefined;
        throw e;
      });
      const hits = (await index).filter(
        (h) => (!book || h.book === book) && matchText(h.text, query),
      );
      const p = Math.max(
        1,
        Math.min(
          Number.isFinite(page) ? Math.floor(page) : 1,
          Math.ceil(hits.length / 20) || 1,
        ),
      );
      return {
        hits: hits.slice((p - 1) * 20, p * 20),
        total: hits.length,
        page: p,
      };
    },
  };
  return adapter;
}
export const localBSB = createLocalAdapter();
const installed = new Map<string, CorpusAdapter>([['BSB', localBSB]]);
export function getCorpus(edition: string): CorpusAdapter {
  if (!editions.some((e) => e.editionId === edition))
    throw new CorpusError(
      'unsupported-edition',
      `The edition ${edition} is not installed.`,
    );
  if (!installed.has(edition))
    installed.set(edition, createLocalAdapter(undefined, edition));
  return installed.get(edition)!;
}
