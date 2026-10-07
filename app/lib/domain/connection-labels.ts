import {address,compare,type PassageRange} from './references.ts';
export type ConnectionLabel={id:string;kind:'quotation'|'allusion'|'parallel';connectionIds:string[];ntRanges:PassageRange[];displayNtRanges?:PassageRange[];otRanges:PassageRange[];sourceObservation:string;interpretation:string;author:string;evidence:{releaseId:string;sourceRef:string;text:string}[];approval:{reviewerId:string;contentHash:string;reviewedAt:string}};
async function loadOriginalLabels():Promise<ConnectionLabel[]>{
 const response=await fetch('/connections/reviewed-labels-2026-10-07-v1/index.json', {cache:'no-store'});if(!response.ok)throw Error('Classification data unavailable');const data=await response.json();
 if(data.schemaVersion!==1||data.releaseId!=='reviewed-labels-2026-10-07-v1'||data.connectionRelease!=='bsb-testament-connections-2026-10-07-v1'||!Array.isArray(data.records)||data.records.some((r:ConnectionLabel)=>!r.id||!['quotation','allusion','parallel'].includes(r.kind)||!r.connectionIds?.length||!r.sourceObservation||!r.interpretation||!r.evidence?.length||r.approval?.reviewerId!=='larry-herzog-jr'||!/^[a-f0-9]{64}$/.test(r.approval.contentHash)||!r.approval.reviewedAt||!(['nt','ot'] as const).every(side=>{const ranges=side==='nt'?r.ntRanges:r.otRanges;try{return ranges?.length&&ranges.every(x=>compare(x.start,x.end)<=0&&(address(x.start).book.order<39)===(side==='ot')&&(address(x.end).book.order<39)===(side==='ot'));}catch{return false;}})))throw Error('Invalid classification data');
 return data.records;
}

export async function loadConnectionLabels():Promise<ConnectionLabel[]>{
 const [original,response]=await Promise.all([loadOriginalLabels(),fetch('/connections/reviewed-connections-2026-10-07-v2/index.json',{cache:'no-store'})]);
 if(!response.ok)throw Error('Expanded classifications unavailable');const data=await response.json();
 if(data.schemaVersion!==1||data.releaseId!=='reviewed-connections-2026-10-07-v2'||data.reviewBatchHash!=='0eeda81dcc72f5d95ec6a5f9bcabaa93612ccd0fc2161f31d4e2fa0f3d543574'||!Array.isArray(data.records)||data.records.length!==288)throw Error('Invalid expanded classifications');
 const expanded:ConnectionLabel[]=data.records;
 for(const r of expanded){if(r.kind!=='quotation'||!r.id||!r.connectionIds?.length||!r.evidence?.length||!r.displayNtRanges?.length||r.approval?.reviewerId!=='larry-herzog-jr'||!/^[a-f0-9]{64}$/.test(r.approval.contentHash)||!r.approval.reviewedAt)throw Error('Invalid expanded approval');
 for(const [ot,ranges] of [[false,r.ntRanges],[false,r.displayNtRanges],[true,r.otRanges]] as const)for(const p of ranges){if(compare(p.start,p.end)>0||(address(p.start).book.order<39)!==ot||(address(p.end).book.order<39)!==ot)throw Error('Invalid reviewed passage');}}
 const ids=new Set(expanded.flatMap(r=>r.connectionIds));return [...expanded,...original.filter(r=>!r.connectionIds.some(id=>ids.has(id)))];
}
