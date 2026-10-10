import {englishLxxManifest, englishLxxGreekContext} from './domain/lxx-english.ts';
import {researchVerse} from './domain/lxx-research.ts';

/** Load analysis for the existing source chapter context, never by English verse number. */
export async function sourceGreekStudy(code: string, chapter: number) {
  const meta = (await englishLxxManifest()).books.find(b => b.code === code);
  if (!meta || !meta.chapters.includes(chapter)) throw Error('Greek reading context is unavailable for this source chapter.');
  const verses = await englishLxxGreekContext(meta, chapter);
  return Promise.all(verses.map(v => researchVerse(v.sourceRef)));
}
