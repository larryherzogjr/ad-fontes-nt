'use client';
import { useEffect, useRef, useState } from 'react';
import { resolveReference, type PassageRange } from '@/lib/domain/references';

type Choice = {
  ranges: PassageRange[];
  label: string;
  x: number;
  y: number;
  focusId: string;
};
/** Only annotated main-text spans can contribute passage anchors. */
export default function ReadingSelection({
  onOpen,
  onNote,
}: {
  onNote?: (ranges: PassageRange[]) => void;
  onOpen: (
    mode: 'compare' | 'greek',
    ranges: PassageRange[],
    focusId: string,
  ) => void;
}) {
  const [choice, setChoice] = useState<Choice | null>(null);
  const toolbar = useRef<HTMLElement>(null);
  const choiceRef = useRef(choice);
  choiceRef.current = choice;
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    function position(rect: DOMRect) {
      const width = Math.min(340, innerWidth - 24);
      return {
        x: Math.max(12, Math.min(rect.left, innerWidth - width - 12)),
        y: Math.max(12, Math.min(rect.bottom + 8, innerHeight - 190)),
      };
    }
    function inspect() {
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
        document.querySelector('dialog[open]')
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
      setChoice({
        ranges: anchors.map((a) => ({ start: a, end: a })),
        label:
          anchors.length === 1
            ? anchors[0]
            : `${anchors[0]} – ${anchors.at(-1)} · ${anchors.length} verses`,
        ...position(range.getBoundingClientRect()),
        focusId: spans[0].dataset.studyFocus || 'reading',
      });
    }
    function selectionChanged() {
      clearTimeout(timer);
      timer = setTimeout(inspect, 180);
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
      setChoice({
        ranges,
        label: link.dataset.studyReference!,
        ...position(link.getBoundingClientRect()),
        focusId: link.id,
      });
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
      if (!toolbar.current?.contains(event.target as Node)) setChoice(null);
    }
    function key(event: KeyboardEvent) {
      if (event.key === 'Escape' && !document.querySelector('dialog[open]')) {
        if (choiceRef.current)
          document
            .getElementById(choiceRef.current.focusId)
            ?.focus({ preventScroll: true });
        setChoice(null);
        window.getSelection()?.removeAllRanges();
      }
    }
    function hide() {
      if (!toolbar.current?.contains(document.activeElement)) setChoice(null);
    }
    document.addEventListener('click', click);
    document.addEventListener('pointerdown', outside);
    document.addEventListener('selectionchange', selectionChanged);
    document.addEventListener('pointerup', selectionChanged);
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
        <strong>Study selection</strong>
        <button
          aria-label="Dismiss study selection"
          onClick={() => {
            document
              .getElementById(choice.focusId)
              ?.focus({ preventScroll: true });
            setChoice(null);
          }}
        >
          ×
        </button>
      </div>
      <p aria-live="polite">{choice.label}</p>
      <div className="selection-buttons">
        {onNote && <button onClick={() => { onNote(choice.ranges); setChoice(null); window.getSelection()?.removeAllRanges(); }}>My note</button>}
        <button
          onClick={() => onOpen('compare', choice.ranges, choice.focusId)}
        >
          Compare editions
        </button>
        <button onClick={() => onOpen('greek', choice.ranges, choice.focusId)}>
          Explore Greek
        </button>
      </div>
    </aside>
  );
}
