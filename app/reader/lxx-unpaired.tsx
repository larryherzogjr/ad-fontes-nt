'use client';
import { useState } from 'react';
import { loadLxx } from '@/lib/domain/lxx';
import type { AnalysisSegment } from '@/lib/domain/greek';
export default function LxxUnpaired({segments}: {segments: AnalysisSegment[]}) {
  const [data, setData] = useState<AnalysisSegment[] | null>(null);
  const [error, setError] = useState('');
  const slugs = new Set(segments.map(s => s.sourceBook || s.sourceRef.split('/')[0]));
  return <details onToggle={e => { if (e.currentTarget.open && !data) loadLxx<{segments: AnalysisSegment[]}>('unpaired.json').then(d => setData(d.segments)).catch(e => setError(e.message)); }}>
    <summary>Additional Septuagint verses in these source books</summary>
    <p className="study-help">These source verses have no English canonical correspondence in the pinned mapping. They remain Scripture text from this edition, separately numbered. They are included in the full source-research concordance, separately from English-mapped counts.</p>
    {error && <p role="status">{error}</p>}
    {!data && !error && <p role="status">Loading source verses…</p>}
    {data && !data.some(s => slugs.has(s.sourceRef.split('/')[0])) && <p>No unpaired source verses are recorded for these books.</p>}
    {data?.filter(s => slugs.has(s.sourceRef.split('/')[0])).map(s => <p key={s.sourceRef} className="comparison-scripture"><small><a href={`/greek?verse=${encodeURIComponent(s.sourceRef)}`}>{s.sourceLabel} · explore this source verse</a></small> <span lang="grc">{s.text}</span></p>)}
  </details>;
}
