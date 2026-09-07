'use client';
import { findSyncTarget } from '../lib/verse-sync';
import { useEffect, type RefObject } from 'react';

// Track the follower’s resulting offset to ignore its scroll events, while
// accepting wheel, keyboard, touch, scrollbar and accessibility scrolling.
export function useVerseSync(dialog: RefObject<HTMLDialogElement | null>, enabled: boolean, revision: string) {
  useEffect(() => {
    const panel = dialog.current;
    if (!panel || !enabled) return;
    let leader: 'reader' | 'study' | null = null;
    let activeEdition = '';
    let frame = 0;
    const expected: {reader?: number; study?: number} = {};
    const anchors = (el: HTMLElement) => (el.dataset.syncAnchors || '').split(' ').filter(Boolean);
    const visible = (el: HTMLElement) => el.getClientRects().length > 0;
    const studyElements = () => Array.from(panel.querySelectorAll<HTMLElement>('[data-sync-edition][data-sync-anchors]')).filter(visible);
    const readerElements = () => Array.from(document.querySelectorAll<HTMLElement>('.scripture [data-sync-anchors]')).filter(visible);
    const readerLine = () => (document.querySelector('.toolbar')?.getBoundingClientRect().bottom || 0) + 24;
    const studyLine = () => (panel.querySelector('.study-chrome')?.getBoundingClientRect().bottom || 0) + 24;
    function current(elements: HTMLElement[], line: number, bounded: boolean) {
      const before = elements.filter(el => el.getBoundingClientRect().top <= line + 2);
      const el = before.at(-1) || elements.find(el => el.getBoundingClientRect().top < innerHeight);
      if (!el) return;
      if (bounded && el.getBoundingClientRect().bottom < line) return;
      return el;
    }
    function synchronize() {
      frame = 0;
      const right = studyElements(), left = readerElements();
      if (!right.length || !left.length) return;
      if (leader === 'study') {
        const source = current(right, studyLine(), true);
        if (!source) return; // Notes, explanations and gaps do not drive Scripture.
        activeEdition = source.dataset.syncEdition || '';
        const refs = anchors(source);
        const target = findSyncTarget(left, refs, undefined, anchors, el => el.dataset.syncEdition);
        if (target) {
          window.scrollBy({ top: target.getBoundingClientRect().top - readerLine(), behavior: 'instant' });
          expected.reader = window.scrollY;
        }
      } else if (leader === 'reader') {
        const source = current(left, readerLine(), false);
        if (!source || (source.closest('.scripture')?.getBoundingClientRect().bottom || 0) < readerLine()) return;
        if (!activeEdition) activeEdition = current(right, studyLine(), true)?.dataset.syncEdition || right[0].dataset.syncEdition || '';
        const refs = anchors(source);
        const target = findSyncTarget(right, refs, activeEdition, anchors, el => el.dataset.syncEdition);
        // No invented counterpart for an absent or unavailable canonical verse.
        if (target) {
          panel!.scrollBy({ top: target.getBoundingClientRect().top - studyLine(), behavior: 'instant' });
          expected.study = panel!.scrollTop;
        }
      }
    }
    function input(event: Event) {
      if (event instanceof KeyboardEvent && !['ArrowDown','ArrowUp','PageDown','PageUp','Home','End',' '].includes(event.key)) return;
      const target = event.target as Element | null;
      if (target?.closest('input, textarea, select, .greek-inspector, .word-detail')) { leader = null; return; }
      leader = target && panel!.contains(target) ? 'study' : 'reader';
      expected[leader] = undefined;
    }
    function scroll(event: Event) {
      const studyScroll = event.target === panel;
      const readerScroll = event.target === document;
      if (!studyScroll && !readerScroll) return;
      const pane = studyScroll ? 'study' : 'reader';
      const position = studyScroll ? panel!.scrollTop : window.scrollY;
      if (expected[pane] !== undefined && Math.abs(position - expected[pane]!) < 1) return;
      expected[pane] = undefined;
      leader = pane;
      if (!frame) frame = requestAnimationFrame(synchronize);
    }
    for (const name of ['wheel','touchstart','pointerdown','keydown']) document.addEventListener(name, input, { capture: true, passive: true });
    document.addEventListener('scroll', scroll, true);
    return () => {
      cancelAnimationFrame(frame);
      for (const name of ['wheel','touchstart','pointerdown','keydown']) document.removeEventListener(name, input, true);
      document.removeEventListener('scroll', scroll, true);
    };
  }, [dialog, enabled, revision]);
}
