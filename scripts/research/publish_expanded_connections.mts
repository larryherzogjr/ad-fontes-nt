/** Publish projections of exact approved v3 review records; preserve the original eight-label release. */
import {readFile,writeFile,mkdir} from 'node:fs/promises';import {createHash} from 'node:crypto';import {fileURLToPath} from 'node:url';
import {address,compare,expand} from '../../app/lib/domain/references.ts';
export const expandedRelease='reviewed-connections-2026-10-07-v2';
export const expandedHash=(record:unknown)=>createHash('sha256').update(JSON.stringify(record)).digest('hex');
export function approvedExpanded(records:any[],reviews:any[],connections:any[]){return records.flatMap(r=>{
 const review=reviews.filter(x=>x.unitId===r.id).at(-1);if(!review||review.decision!=='approved')return [];
 if(review.reviewerId!=='larry-herzog-jr'||review.contentHash!==expandedHash(r)||!/^\d{4}-\d{2}-\d{2}$/.test(review.reviewedAt))throw Error('Expanded approval hash/reviewer mismatch');
 if(r.kind!=='proposed-quotation'||!r.proposedNtDisplayRanges?.length||!r.publisherCitations?.length||!r.evidence?.length)throw Error('Approval is not a proposed quotation record');
 for(const [ot,ranges] of [[false,r.ntRanges],[false,r.proposedNtDisplayRanges],[true,r.otRanges]] as const)for(const range of ranges){if(compare(range.start,range.end)>0||(address(range.start).book.order<39)!==ot||(address(range.end).book.order<39)!==ot)throw Error('Invalid approved ranges');}
 if(r.proposedNtDisplayRanges.reduce((n:number,p:any)=>n+expand(p).length,0)>60||r.ntRanges.some((n:any)=>!r.proposedNtDisplayRanges.some((p:any)=>compare(p.start,n.start)<=0&&compare(p.end,n.end)>=0)))throw Error('Approved display must contain publisher NT anchor');
 for(const anchor of [...r.ntRanges,...r.proposedNtDisplayRanges,...r.otRanges].flatMap(expand)){if(!r.evidence.some((e:any)=>e.sourceRef===anchor&&e.text&&e.status==='available'))throw Error('Missing approved Scripture evidence');}
 for(const c of r.publisherCitations){const source=connections.find(x=>x.id===c.id);if(!source||JSON.stringify(source)!==JSON.stringify(c))throw Error('Publisher evidence changed after approval');}
 return [{id:r.id,kind:'quotation',connectionIds:r.publisherCitations.map((c:any)=>c.id),ntRanges:r.ntRanges,otRanges:r.otRanges,displayNtRanges:r.proposedNtDisplayRanges,author:r.author,sourceObservation:'Original publisher citations and pinned Scripture evidence are preserved below.',interpretation:'Quotation classification and fuller NT display selection approved by Larry Herzog Jr.',evidence:r.evidence,approval:{reviewerId:review.reviewerId,contentHash:review.contentHash,reviewedAt:review.reviewedAt}}];
});}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const path='content/editorial/connections/expanded/review-v3.json',bytes=await readFile(path),packet=JSON.parse(bytes.toString());
 if(createHash('sha256').update(bytes).digest('hex')!=='0eeda81dcc72f5d95ec6a5f9bcabaa93612ccd0fc2161f31d4e2fa0f3d543574')throw Error('Approved review packet changed');
 const reviews=JSON.parse(await readFile('content/editorial/connections/expanded/reviews.json','utf8'));
 const connections=(await Promise.all(packet.sourceReleases.map(async(r:string)=>JSON.parse(await readFile(`app/public/connections/${r}/index.json`,'utf8')).connections))).flat();
 const records=approvedExpanded(packet.records,reviews,connections);if(records.length!==288)throw Error('Expanded publication must preserve all 288 approvals');
 const chapters=new Map<string,any>();for(const r of records)for(const e of r.evidence){if(!['bsb-ot-2026-10-07-v1','bsb-2026-09-05-m2-v1'].includes(e.releaseId))throw Error('Unpinned Scripture evidence');const a=address(e.sourceRef),path=`app/public/corpus/${e.releaseId}/${a.book.code}/${a.chapter}.json`;if(!chapters.has(path))chapters.set(path,JSON.parse(await readFile(path,'utf8')));const s=chapters.get(path).segments.find((s:any)=>s.anchors.includes(e.sourceRef));if(!s||s.text!==e.text)throw Error('Approved Scripture evidence changed');}
 const out=`app/public/connections/${expandedRelease}`;await mkdir(out,{recursive:true});await writeFile(`${out}/index.json`,JSON.stringify({schemaVersion:1,releaseId:expandedRelease,reviewBatch:packet.batchId,reviewBatchHash:createHash('sha256').update(bytes).digest('hex'),records},null,2)+'\n');console.log(`Published ${records.length} exact-approved expanded quotation records.`);
}
