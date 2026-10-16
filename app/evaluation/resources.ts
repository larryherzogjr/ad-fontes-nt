import { evaluationContentBase, evaluationRelease } from './config.ts';
export type EvaluationSection={id:string;title:string;part:string|null;chars:number;path:string;sha256:string};
export type EvaluationWork={id:string;title:string;category:'boc'|'luther'|'concordia';source:string;resourceId:string;resourceVersion:string;sections:EvaluationSection[];extraction:{residueFlags?:number;misalignedBoundaries?:unknown[];coveragePct?:number}};
export type EvaluationCatalog={schemaVersion:1;releaseId:string;notice:string;works:EvaluationWork[];counts:Record<string,number>};
export async function evaluationJson<T>(path:string,hash?:string,signal?:AbortSignal):Promise<T>{
 const r=await fetch(`${evaluationContentBase()}/${path}`,{signal,cache:'no-store'});if(!r.ok)throw Error(r.status===403?'Approved evaluation access required. Sign in through Evaluation access.':'The evaluation resource is unavailable.');
 const bytes=await r.arrayBuffer();if(hash){const actual=[...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(b=>b.toString(16).padStart(2,'0')).join('');if(actual!==hash)throw Error('The evaluation resource does not match its release.');}
 return JSON.parse(new TextDecoder().decode(bytes)) as T;
}
export async function loadEvaluationCatalog(signal?:AbortSignal){const c=await evaluationJson<EvaluationCatalog>('catalog.json',undefined,signal);if(c.schemaVersion!==1||c.releaseId!==evaluationRelease||c.works.length!==85)throw Error('Incomplete evaluation catalog');return c;}
export function evaluationHref(category:string,work='',section='',query=''){
 const p=new URLSearchParams({view:category==='all'?'fulltext':category==='concordia'?'commentaries':'confessional'});if(category==='all')p.set('scope','evaluation');if(category==='concordia')p.set('commentary','concordia');if(work)p.set('work',work);if(section)p.set('section',section);if(query)p.set('q',query);return `/library?${p}`;
}
