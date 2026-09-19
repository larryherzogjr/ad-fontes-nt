'use client';
import {
  findSyncTarget,
  isSettlingFollowerScroll,
  type VerseSyncPane,
} from '../lib/verse-sync';
import { useEffect, type RefObject } from 'react';

// Keep the pane with the most recent real input authoritative while the other
// pane settles after programmatic scrolling. This avoids iPad momentum events
// making the follower seize leadership and bounce both panes back and forth.
export function useVerseSync(dialog: RefObject<HTMLDialogElement | null>, enabled: boolean, revision: string) {
  useEffect(() => {
    const panel = dialog.current;
    if (!panel || !enabled) return;
    let leader: VerseSyncPane | null = null;
    let activeEdition = '';
    let frame = 0;
    const followerSettleMs = 500;
    const suppressedUntil: Record<VerseSyncPane, number> = {
      reader: 0,
      study: 0,
    };
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
          const top = target.getBoundingClientRect().top - readerLine();
          if (Math.abs(top) >= 1) {
            suppressedUntil.reader = performance.now() + followerSettleMs;
            window.scrollBy({ top, behavior: 'instant' });
          }
        }
      } else if (leader === 'reader') {
        const source = current(left, readerLine(), false);
        if (!source || (source.closest('.scripture')?.getBoundingClientRect().bottom || 0) < readerLine()) return;
        if (!activeEdition) activeEdition = current(right, studyLine(), true)?.dataset.syncEdition || right[0].dataset.syncEdition || '';
        const refs = anchors(source);
        const target = findSyncTarget(right, refs, activeEdition, anchors, el => el.dataset.syncEdition);
        // No invented counterpart for an absent or unavailable canonical verse.
        if (target) {
          const top = target.getBoundingClientRect().top - studyLine();
          if (Math.abs(top) >= 1) {
            suppressedUntil.study = performance.now() + followerSettleMs;
            panel!.scrollBy({ top, behavior: 'instant' });
          }
        }
      }
    }
    function input(event: Event) {
      if (event instanceof KeyboardEvent && !['ArrowDown','ArrowUp','PageDown','PageUp','Home','End',' '].includes(event.key)) return;
      const target = event.target as Element | null;
      if (target?.closest('input, textarea, select, .greek-inspector, .word-detail')) { leader = null; return; }
      leader = target && panel!.contains(target) ? 'study' : 'reader';
      suppressedUntil[leader] = 0;
      const follower = leader === 'reader' ? 'study' : 'reader';
      // A new gesture can begin before the old pane's momentum has finished.
      suppressedUntil[follower] = performance.now() + followerSettleMs;
    }
    function scroll(event: Event) {
      const studyScroll = event.target === panel;
      const readerScroll = event.target === document;
      if (!studyScroll && !readerScroll) return;
      const pane: VerseSyncPane = studyScroll ? 'study' : 'reader';
      if (isSettlingFollowerScroll(pane, leader, suppressedUntil[pane], performance.now())) return;
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
