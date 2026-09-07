'use client';
import { useEffect, useState, type RefObject } from 'react';

// Track whole edition cards, including coverage notices and publisher notes.
// This is independent of verse synchronization and never moves either pane.
export function useStudyEdition(dialog: RefObject<HTMLDialogElement | null>, enabled: boolean, revision: string) {
  const [edition, setEdition] = useState('');
  useEffect(() => {
    const panel = dialog.current;
    if (!panel || !enabled) { setEdition(''); return; }
    let frame = 0;
    function update() {
      frame = 0;
      const line = (panel!.querySelector('.study-chrome')?.getBoundingClientRect().bottom || 0) + 24;
      const bottom = panel!.getBoundingClientRect().bottom;
      const cards = Array.from(panel!.querySelectorAll<HTMLElement>('[data-study-edition]'))
        .filter(el => el.getClientRects().length > 0)
        .map(el => ({ name: el.dataset.studyEdition!, rect: el.getBoundingClientRect() }))
        .filter(({ rect }) => rect.bottom > line && rect.top < bottom);
      // Expanded, unsynchronized comparison can show several columns at once.
      const nearest = Math.min(...cards.map(({ rect }) => Math.max(line, rect.top)));
      setEdition([...new Set(cards.filter(({ rect }) => rect.top <= nearest + 2).map(card => card.name))].join(' · '));
    }
    function schedule() { if (!frame) frame = requestAnimationFrame(update); }
    panel.addEventListener('scroll', schedule, { passive: true });
    const observer = new ResizeObserver(schedule);
    observer.observe(panel);
    const content = panel.querySelector('.study-content');
    if (content) observer.observe(content);
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      panel.removeEventListener('scroll', schedule);
      observer.disconnect();
    };
  }, [dialog, enabled, revision]);
  return enabled ? edition : '';
}
