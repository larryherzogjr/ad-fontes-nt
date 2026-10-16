'use client';
import {useEffect,useState} from 'react';
import AppLink from '@/components/app-link';
import {loadEvaluationCatalog,evaluationHref,type EvaluationCatalog} from './resources';
import {compare,type PassageRange} from '@/lib/domain/references';
import {sectionHeadingRange} from './heading-range';
export default function EvaluationPassageCommentary({ranges}:{ranges:PassageRange[]}){
 const [catalog,setCatalog]=useState<EvaluationCatalog|null>(null),[error,setError]=useState('');
 useEffect(()=>{const c=new AbortController();loadEvaluationCatalog(c.signal).then(setCatalog).catch(e=>{if(!c.signal.aborted)setError(e.message);});return()=>c.abort();},[]);
 const matches=catalog?.works.filter(w=>w.category==='concordia').flatMap(work=>work.sections.filter(s=>{const heading=sectionHeadingRange(s);return heading&&ranges.some(r=>compare(heading.start,r.end)<=0&&compare(heading.end,r.start)>=0);}).map(section=>({work,section})))||[];
 return <section aria-label="Concordia commentary"><h3>Concordia Commentaries</h3><p className="notice">Private evaluation · Publisher commentary. Links follow explicit source headings, not independently verified verse-level alignment.</p>{error&&<p role="alert">{error} <AppLink href="/evaluation">Evaluation access</AppLink></p>}{!catalog&&!error&&<p role="status">Loading source headings…</p>}{catalog&&<><p>{matches.length?`${matches.length} supplied ${matches.length===1?'section':'sections'} with overlapping source headings.`:'No verified heading link is available for this selection. Browse the supplied volumes for further context.'}</p>{matches.map(({work,section})=><p key={work.id+section.id}><AppLink href={evaluationHref('concordia',work.id,section.id)}>{work.title} · {section.part?section.part+' · ':''}{section.title}</AppLink></p>)}</>}<AppLink href={evaluationHref('concordia')}>Browse Concordia volumes →</AppLink></section>;
}
