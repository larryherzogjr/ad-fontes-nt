'use client';
import { useEffect, useState } from 'react';
import { type PassageRange } from '@/lib/domain/references';
import { commentaryChapters, commentaryLibraryUrl, commentaryForBook, lenskiBase, kdBase, loadCommentaryChapter, matchingCommentary, type CommentaryChapter } from '@/lib/domain/commentaries';
export function LenskiSource({ kd = false }: { kd?: boolean }) {
  if (kd) return <details className="commentary-source"><summary>About this commentary</summary><p>C. F. Keil and F. Delitzsch, <cite>Commentary on the Old Testament</cite> (Edinburgh: T. &amp; T. Clark, 1864–1891). Public domain.</p><p>Historical commentary, distinct from the selected Bible edition and Ordinary Means commentary. The supplied text retains Hebrew verse numbering and supplied chapter groupings, which sometimes span several chapters. Precise verse alignment is not established. Chapter 1 includes introductory material.</p><a href={`${kdBase}/manifest.json`}>Source and release record</a></details>;

  return <details className="commentary-source"><summary>About this commentary</summary><p>R. C. H. Lenski, <cite>The Interpretation of the New Testament</cite>, Wartburg Press / Augsburg (1932–1946). Historical Lutheran commentary. Scripture quotations and translations within this work are Lenski’s source text, not the selected Bible edition or Ordinary Means commentary.</p><p>The supplied transcription preserves its wording and Greek text. Original typesetting and page references are not available. Passage links follow source verse labels and checked mapping exceptions; where a label is unavailable, read the chapter context.</p><a href={`${lenskiBase}/manifest.json`}>Source and release record</a></details>;
}
export function CommentaryParagraphs({ chapter, from = 0, to = chapter.paragraphs.length }: { chapter: CommentaryChapter; from?: number; to?: number }) {
  return <div className="commentary-prose">{chapter.paragraphs.slice(from, to).map((p, i) => <p id={`lenski-${chapter.book}-${chapter.chapter}-p-${from+i}`} key={from+i} className={/^CHAPTER \d+$/.test(p) ? 'commentary-chapter-heading' : undefined}>{p}</p>)}</div>;
}
export default function Commentaries({ ranges }: { ranges: PassageRange[] }) {
  const selection = commentaryChapters(ranges, true), key = JSON.stringify(selection);
  const [chapters, setChapters] = useState<CommentaryChapter[]>([]), [error, setError] = useState(''), [loading, setLoading] = useState(true);
  const [whole, setWhole] = useState<Record<string, boolean>>({});
  useEffect(() => {
    const abort = new AbortController(); setLoading(true); setError(''); setChapters([]); setWhole({});
    const selected = JSON.parse(key) as ReturnType<typeof commentaryChapters>;
    if (selected.length > 10) { setError('Choose up to ten chapters for commentary. All books are available in the Study Library.'); setLoading(false); return; }
    Promise.all(selected.map(s => loadCommentaryChapter(s.book, s.chapter, abort.signal))).then(setChapters).catch(e => { if (!abort.signal.aborted) setError(e.message); }).finally(() => { if (!abort.signal.aborted) setLoading(false); });
    return () => abort.abort();
  }, [key]);
  const collection = commentaryForBook(selection[0]?.book || 'MAT');
  return <section className="lenski-reader" aria-label="Historical commentary"><p className="eyebrow">Historical commentary · {collection.author}</p><h3>{collection.title}</h3><LenskiSource kd={collection.id === 'kd'} />
    {loading && <p role="status">Loading commentary…</p>}{error && <p role="alert">{error}</p>}
    {!loading && !error && !selection.length && <p>Select a passage to read commentary. <a href={commentaryLibraryUrl()}>Browse commentaries in the Study Library →</a></p>}
    {chapters.map(ch => { const id = `${ch.book}.${ch.chapter}`, requested = selection.find(s => s.book === ch.book && s.chapter === ch.chapter)!.verses, sections = matchingCommentary(ch, requested), missing = requested.filter(v => ch.unmappedVerses.includes(v)); return <article key={id}>{commentaryForBook(ch.book).id !== collection.id && <><h3>{commentaryForBook(ch.book).title}</h3><LenskiSource kd={commentaryForBook(ch.book).id === 'kd'} /></>}<h3>{ch.name} {ch.chapter}</h3>
      {ch.mappingMode === 'chapter-context' && <><p className="notice">Chapter commentary · Source verse numbering is retained. This group may include adjacent chapters.</p><a href={commentaryLibraryUrl(ch.book,ch.chapter)}>Open in Study Library →</a><RelatedCommentary chapter={ch} /><CommentaryParagraphs chapter={ch} /></>}
      {ch.mappingMode !== 'chapter-context' && <>
      {missing.length > 0 && <p className="notice">No separate verse anchor is available for {missing.join(', ')}. The text remains available in the chapter commentary.</p>}
      <div className="commentary-actions"><button aria-pressed={!!whole[id]} onClick={() => setWhole({ ...whole, [id]: !whole[id] })}>{whole[id] ? 'Show selected verses' : 'Read chapter commentary'}</button><a href={commentaryLibraryUrl(ch.book,ch.chapter)}>Open in Study Library →</a>{ch.introEnd > 0 && <a href={commentaryLibraryUrl(ch.book,1,'intro')}>Book introduction</a>}</div>
      {whole[id] ? <CommentaryParagraphs chapter={ch} from={ch.introEnd} /> : sections.map(s => <section key={s.id}><h4>{ch.name} {ch.chapter}:{s.start}{s.end !== s.start ? `–${s.end}` : ''}</h4><>{s.mappingNote && <p className="notice">{s.mappingNote}</p>}<CommentaryParagraphs chapter={ch} from={s.paragraph} to={s.toParagraph} /></></section>)}
    </>}</article>; })}
  </section>;
}

export function RelatedCommentary({chapter}: {chapter: CommentaryChapter}) {
  if (!chapter.relatedSections?.length) return null;
  return <details className="commentary-source"><summary>Related source sections stored in other chapter groups ({chapter.relatedSections.length})</summary><p>These links follow the commentary’s printed headings. Source numbering may differ from the selected Bible.</p><ul>{chapter.relatedSections.map(s=><li key={`${s.chapter}.${s.paragraph}`}><a href={commentaryLibraryUrl(chapter.book,s.chapter,'chapter',s.paragraph)}>{s.label} · Open in group {s.chapter}</a><p>{s.excerpt}…</p></li>)}</ul></details>;
}
