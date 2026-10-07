'use client';
import { useEffect, useId, useState, type ReactNode } from 'react';
import { HoverCard, HoverCardTrigger, HoverCardContent } from '@/components/ui/hover-card';
import { loadLookup, resolveLookup, type LookupBundle } from '@/lib/domain/lexical';
import { transliterateGreek } from '@/lib/domain/greek-reading';
import { useReaderEnvironment } from './environment';
import type { Token } from '@/lib/domain/greek';

function useLookup(active: boolean) {
  const [data, setData] = useState<LookupBundle | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    if (!active) return;
    let live = true;
    loadLookup().then(data => { if (live) { setData(data); setError(false); } }).catch(() => { if (live) setError(true); });
    return () => { live = false; };
  }, [active]);
  return { data, error };
}
export function WordDefinition({ token, compact = false }: { token: Token; compact?: boolean }) {
  const { WordStudyLink } = useReaderEnvironment();
  const { data, error } = useLookup(true);
  const result = data ? resolveLookup(data, token) : null;
  return <div className="word-definition">
    <p className="study-help">Dodson Greek Lexicon (2010)</p>
    {!data ? <p role="status">{error ? 'Lexicon could not be loaded.' : 'Loading definition…'}</p> : <>
      <p>{result?.definition ? (compact ? result.definition.brief : result.definition.full) : 'No verified Dodson entry is linked to this standard form.'}</p>
      <p className="study-help">Dictionary meaning range; the passage determines the sense.</p>
      {token.analysisReleaseId && !!result?.links.length && <p className="study-help">Existing OM Greek word studies discuss this lemma; they are not OT passage commentary.</p>}
      {result?.links.map(link => <WordStudyLink key={link.url} link={link} />)}
    </>}
  </div>;
}
export function GreekWordButton({ token, id, className, label, selected, suppressPreview = false, navigation, onChoose, children }: { token: Token; id: string; className: string; label: string; selected: boolean; suppressPreview?: boolean; navigation?:{ids:string[];active:string;onActive:(id:string)=>void}; onChoose: () => void; children: ReactNode }) {
  const popupId = useId();
  const [open, setOpen] = useState(false);
  const [container, setContainer] = useState<HTMLElement | null>(null);
  useEffect(() => { if (suppressPreview) setOpen(false); }, [suppressPreview]);
  return <HoverCard open={open && !suppressPreview} onOpenChange={(nextOpen) => {
    if (nextOpen && suppressPreview) return;
    setOpen(nextOpen);
  }}>
    <HoverCardTrigger render={<button type="button" />} id={id} className={className} tabIndex={navigation?(navigation.active===id?0:-1):undefined} aria-label={label} aria-pressed={selected} aria-describedby={open ? popupId : undefined} aria-description={navigation?'Left and Right move between words; Home and End move to the passage ends. Enter opens word details. Arrow Down enters the definition popup.':'Enter opens word details. Arrow Down enters the definition popup.'}
      onPointerEnter={event => setContainer(event.currentTarget.closest('dialog'))}
      onFocus={event => {
        navigation?.onActive(id);
        setContainer(event.currentTarget.closest('dialog'));
        if (suppressPreview) {
          // Skip both our immediate popup and Base UI's delayed focus popup.
          event.preventBaseUIHandler();
          setOpen(false);
          return;
        }
        setOpen(true);
      }}
      onBlur={event => { if (!(event.relatedTarget instanceof Element) || !event.relatedTarget.closest('.lexicon-popup')) setOpen(false); }}
      onKeyDown={event => { if(navigation&&['ArrowLeft','ArrowRight','Home','End'].includes(event.key)){event.preventDefault();event.preventBaseUIHandler();setOpen(false);const at=navigation.ids.indexOf(id),next=event.key==='Home'?0:event.key==='End'?navigation.ids.length-1:Math.max(0,Math.min(navigation.ids.length-1,at+(event.key==='ArrowRight'?1:-1)));navigation.onActive(navigation.ids[next]);document.getElementById(navigation.ids[next])?.focus();return;} if (event.key === 'ArrowDown' && open) { event.preventDefault(); const popup = document.getElementById(popupId); (popup?.querySelector('a') || popup)?.focus(); } if (event.key === 'Escape' && open) { event.preventDefault(); event.stopPropagation(); setOpen(false); } }}
      onClick={() => { setOpen(false); onChoose(); }}>
      {children}
    </HoverCardTrigger>
    <HoverCardContent id={popupId} tabIndex={-1} portalContainer={container} className="lexicon-popup" onKeyDown={event => { if(navigation&&['ArrowLeft','ArrowRight','Home','End'].includes(event.key)){event.preventDefault();event.preventBaseUIHandler();setOpen(false);const at=navigation.ids.indexOf(id),next=event.key==='Home'?0:event.key==='End'?navigation.ids.length-1:Math.max(0,Math.min(navigation.ids.length-1,at+(event.key==='ArrowRight'?1:-1)));navigation.onActive(navigation.ids[next]);document.getElementById(navigation.ids[next])?.focus();return;} if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); document.getElementById(id)?.focus(); setOpen(false); } }}>
      <p><strong lang="grc">{token.lemma}</strong> · {transliterateGreek(token.lemma)}</p>
      {open && <WordDefinition token={token} compact />}
    </HoverCardContent>
  </HoverCard>;
}
