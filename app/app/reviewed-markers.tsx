'use client';
import { formatPassage } from '@/lib/reading-display';
import { useEffect, useState } from 'react';
import { expand } from '@/lib/domain/references';
import { reviewedAt } from '@/lib/domain/reviewed-markers';
import type { Variant } from '@/lib/domain/variants';

export function useReviewedUnits() {
  const [units, setUnits] = useState<Variant[]>([]);
  const [error, setError] = useState(false);
  useEffect(() => {
    let active = true;
    setUnits([]); setError(false);
    fetch('/editorial/variants.json').then(async response => {
      if (!response.ok) throw Error('Unavailable');
      const data = await response.json() as { schemaVersion: number; units: Variant[] };
      if (data.schemaVersion !== 1 || !Array.isArray(data.units) || data.units.some((v: Variant) => v.status !== 'approved')) throw Error('Invalid');
      if (active) setUnits(data.units);
    }).catch(() => { if (active) setError(true); });
    return () => { active = false; };
  }, []);
  return { units, error };
}

type Open = (unit: Variant, focusId: string) => void;
export function InlineReviewedMarkers({ units, anchors, idPrefix, onOpen }: {
  units: Variant[]; anchors: string[]; idPrefix: string; onOpen: Open;
}) {
  return <>{reviewedAt(units, anchors).map(unit => {
    const id = `${idPrefix}-${unit.id}`;
    return <button key={unit.id} id={id} type="button" lang="en"
      className="commentary-marker" aria-label={`Ordinary Means commentary: ${unit.title}`}
      title={`Ordinary Means commentary: ${unit.title}`} onClick={() => onOpen(unit, id)}>OM</button>;
  })}</>;
}

export default function ReviewedMarkers({ book, chapter, units: allUnits, error, onOpen }: {
  book: string; chapter: number; units: Variant[]; error: boolean; onOpen: Open;
}) {
  const prefix = `${book}.${chapter}.`;
  const units = allUnits.filter(v => v.ranges.flatMap(expand).some(a => a.startsWith(prefix)));
  if (error) return <p role="status">Reviewed-note links could not be loaded. Scripture remains available.</p>;
  if (!units.length) return null;
  return <details className="chapter-commentary" aria-label="Ordinary Means commentary for this chapter">
    <summary>Ordinary Means commentary <span className="count">{units.length}</span></summary>
    <p className="muted">OM beside a verse opens its reviewed commentary. Coverage is selective.</p>
    {units.map(unit => {
      const id = `reviewed-marker-${book}-${chapter}-${unit.id}`;
      return <p key={unit.id}><button id={id} onClick={() => onOpen(unit, id)}>
        {formatPassage(unit.ranges)} · {unit.title}
      </button></p>;
    })}
  </details>;
}
