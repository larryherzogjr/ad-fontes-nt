import type { ReactNode } from 'react';

export function noteContent(x: unknown, i = 0): ReactNode {
  if (typeof x === 'string') return x;
  if (!x || typeof x !== 'object') return null;
  const n = x as { marker?: string; content?: unknown[] };
  const c = n.content?.map((v, j) => noteContent(v, j));
  return n.marker === 'fv' ? (
    <sup key={i}>{c} </sup>
  ) : n.marker === 'fqa' ? (
    <i key={i}>{c}</i>
  ) : (
    <span key={i}>{c}</span>
  );
}
