'use client';
import { useEffect, useRef, useState } from 'react';
import { writeClipboard } from '@/lib/clipboard';
import { formatCopyWithReference, formatPassage, formatPassageText } from '@/lib/reading-display';
import { getCorpus } from '@/lib/domain/corpus';
import { resolveReference, type PassageRange } from '@/lib/domain/references';

type Choice = {
  ranges: PassageRange[];
  label: string;
  x: number;
  y: number;
  focusId: string;
  text?: string;
};

function scriptureTextWithoutControls(range: Range) {
  const fragment = range.cloneContents();
  fragment.querySelectorAll('sup, button').forEach(element => element.remove());
  return fragment.textContent || '';
}
/** Only annotated main-text spans can contribute passage anchors. */
export default function ReadingSelection({
  onOpen,
  onNote,
  editionName,
  editionId,
  onSelect,
}: {
  editionName: string;
  editionId: string;
  onNote?: (ranges: PassageRange[]) => void;
  onSelect: (ranges: PassageRange[]) => void;
  onOpen: (
    mode: 'compare' | 'greek',
    ranges: PassageRange[],
    focusId: string,
  ) => void;
}) {
  const [choice, setChoice] = useState<Choice | null>(null);
  const [copyStatus, setCopyStatus] = useState('');
  const toolbar = useRef<HTMLElement>(null);
  const choiceRef = useRef(choice);
  const onSelectRef = useRef(onSelect);
  choiceRef.current = choice;
  onSelectRef.current = onSelect;
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    let pointerDown = false;
    let suppressScrollUntil = 0;
    function position(rect: DOMRect) {
      const width = Math.min(340, innerWidth - 24);
      return {
        x: Math.max(12, Math.min(rect.left, innerWidth - width - 12)),
        y: Math.max(12, Math.min(rect.bottom + 8, innerHeight - 235)),
      };
    }
    function inspect(focusFirstAction = false) {
      if (toolbar.current?.contains(document.activeElement)) return;
      const selection = window.getSelection();
      if (
        !selection ||
        selection.isCollapsed ||
        !selection.rangeCount ||
        !selection.toString().trim()
      )
        return;
      const range = selection.getRangeAt(0);
      const parent = (node: Node) =>
        node.nodeType === Node.ELEMENT_NODE
          ? (node as Element)
          : node.parentElement;
      // Do not turn publisher material, UI text, or an open study panel into Scripture selection.
      if (
        !parent(range.startContainer)?.closest('.scripture .text-block') ||
        !parent(range.endContainer)?.closest('.scripture .text-block') ||
        document.querySelector('dialog:modal')
      ) {
        setChoice(null);
        return;
      }
      const spans = [
        ...document.querySelectorAll<HTMLElement>(
          '.scripture .text-block [data-study-anchors]',
        ),
      ].filter((el) => {
        if (!range.intersectsNode(el)) return false;
        const intersection = range.cloneRange();
        const contents = document.createRange();
        contents.selectNodeContents(el);
        if (range.compareBoundaryPoints(Range.START_TO_START, contents) < 0)
          intersection.setStart(contents.startContainer, contents.startOffset);
        if (range.compareBoundaryPoints(Range.END_TO_END, contents) > 0)
          intersection.setEnd(contents.endContainer, contents.endOffset);
        return !!intersection.toString().trim();
      });
      const anchors = [
        ...new Set(
          spans.flatMap((el) =>
            (el.dataset.studyAnchors || '').split(' ').filter(Boolean),
          ),
        ),
      ];
      if (!anchors.length) {
        setChoice(null);
        return;
      }
      const text = scriptureTextWithoutControls(range);
      if (!text.trim()) {
        setChoice(null);
        return;
      }
      const ranges = anchors.map(a => ({ start: a, end: a }));
      onSelectRef.current(ranges);
      suppressScrollUntil = performance.now() + 500;
      setChoice({
        ranges,
        label: formatPassage(ranges),
        ...position(range.getBoundingClientRect()),
        focusId: spans[0].dataset.studyFocus || 'reading',
        text,
      });
      setCopyStatus('');
      if (focusFirstAction)
        setTimeout(
          () =>
            toolbar.current
              ?.querySelector<HTMLButtonElement>('.selection-buttons button')
              ?.focus(),
          0,
        );
    }
    function selectionChanged(event: Event) {
      if (event.type === 'selectionchange' && pointerDown) return;
      if (event.type === 'pointerup' || event.type === 'pointercancel')
        pointerDown = false;
      clearTimeout(timer);
      timer = setTimeout(() => inspect(event.type === 'keyup'), 180);
    }
    function click(event: MouseEvent) {
      const target = event.target as Element;
      const link = target.closest<HTMLAnchorElement>('a[data-study-reference]');
      if (
        !link ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        event.button !== 0
      )
        return;
      event.preventDefault();
      const ranges = resolveReference(link.dataset.studyReference!);
      onSelectRef.current(ranges);
      suppressScrollUntil = performance.now() + 500;
      setChoice({
        ranges,
        label: formatPassage(ranges),
        ...position(link.getBoundingClientRect()),
        focusId: link.id,
      });
      setCopyStatus('');
      // Enter on a verse link moves directly into its study actions.
      if (event.detail === 0)
        setTimeout(
          () =>
            toolbar.current
              ?.querySelector<HTMLButtonElement>('button')
              ?.focus(),
          0,
        );
    }
    function outside(event: PointerEvent) {
      pointerDown = true;
      if (!toolbar.current?.contains(event.target as Node)) setChoice(null);
    }
    function key(event: KeyboardEvent) {
      if (event.key === 'Escape' && !document.querySelector('dialog:modal')) {
        if (choiceRef.current)
          document
            .getElementById(choiceRef.current.focusId)
            ?.focus({ preventScroll: true });
        setChoice(null);
        window.getSelection()?.removeAllRanges();
      }
    }
    function hide(event: Event) {
      if (event.type === 'scroll' && performance.now() < suppressScrollUntil)
        return;
      if (!toolbar.current?.contains(document.activeElement)) setChoice(null);
    }
    document.addEventListener('click', click);
    document.addEventListener('pointerdown', outside);
    document.addEventListener('selectionchange', selectionChanged);
    document.addEventListener('pointerup', selectionChanged);
    document.addEventListener('pointercancel', selectionChanged);
    document.addEventListener('keyup', selectionChanged);
    document.addEventListener('keydown', key);
    window.addEventListener('resize', hide);
    window.addEventListener('scroll', hide);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', click);
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('selectionchange', selectionChanged);
      document.removeEventListener('pointerup', selectionChanged);
      document.removeEventListener('pointercancel', selectionChanged);
      document.removeEventListener('keyup', selectionChanged);
      document.removeEventListener('keydown', key);
      window.removeEventListener('resize', hide);
      window.removeEventListener('scroll', hide);
    };
  }, []);
  if (!choice) return null;
  return (
    <aside
      ref={toolbar}
      className="reading-selection"
      aria-label="Study selection"
      style={{ left: choice.x, top: choice.y }}
    >
      <div className="selection-heading">
        <strong>{choice.label}</strong>
        <button
          aria-label="Dismiss study selection"
          onClick={() => {
            document
              .getElementById(choice.focusId)
              ?.focus({ preventScroll: true });
            setChoice(null);
            window.getSelection()?.removeAllRanges();
          }}
        >
          ×
        </button>
      </div>
      <div className="selection-buttons">
        <button
          onClick={async () => {
            try {
              const text = choice.text ?? formatPassageText(
                (await getCorpus(editionId).getPassage(choice.ranges)).segments,
              );
              if (!text.trim()) throw new Error('No Scripture text is available.');
              await writeClipboard(formatCopyWithReference(text, choice.ranges, editionName));
              setCopyStatus('Copied with reference.');
            } catch {
              setCopyStatus('Copy failed. Please try again.');
            }
          }}
        >
          <span className="wide-label">Copy with reference</span><span className="short-label">Copy</span>
        </button>
        {onNote && <button className="selection-note" onClick={() => { onNote(choice.ranges); setChoice(null); window.getSelection()?.removeAllRanges(); }}><span className="wide-label">My note</span><span className="short-label">Note</span></button>}
        <button
          onClick={() => onOpen('compare', choice.ranges, choice.focusId)}
        >
          <span className="wide-label">Compare editions</span><span className="short-label">Compare</span>
        </button>
        <button onClick={() => onOpen('greek', choice.ranges, choice.focusId)}>
          <span className="wide-label">Explore Greek</span><span className="short-label">Greek</span>
        </button>
      </div>
      <p className="selection-copy-status" aria-live="polite">
        {copyStatus}
      </p>
    </aside>
  );
}
