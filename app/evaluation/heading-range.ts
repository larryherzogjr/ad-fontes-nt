import {resolveReference,type PassageRange} from '../lib/domain/references.ts';
/** Parse only the explicitly printed range at the beginning of a source heading. */
export function headingRange(title:string):PassageRange|undefined{
 const m=/^((?:[1-3]\s*)?[A-Za-z][A-Za-z ]*?\s+\d+(?::\d+)?(?:[–-]\d+(?::\d+)?)?)(?=[:\s]|$)/.exec(title);
 if(!m)return;try{const parsed=resolveReference(m[1]);return parsed.length===1?parsed[0]:undefined;}catch{return;}
}
/** Generic subheadings can inherit their explicit enclosing passage; named essays cannot. */
export function sectionHeadingRange(section:{title:string;part?:string|null}){
 return headingRange(section.title)||(/^(?:translation|textual notes|commentary)$/i.test(section.title.trim())?headingRange(section.part||''):undefined);
}
