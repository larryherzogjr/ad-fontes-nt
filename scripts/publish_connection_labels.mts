/** Publish only exact-hash human-approved classifications; never infer labels from references. */
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
import {address,compare} from '../app/lib/domain/references.ts';
const root=fileURLToPath(new URL('..',import.meta.url));
export function classificationHash(payload:unknown){return createHash('sha256').update(JSON.stringify(payload)).digest('hex');}
export function approvedClassifications(candidates:any[],reviews:any[],connections:any[]){
 const ids=new Set(connections.map(c=>c.id));
 return candidates.flatMap(candidate=>{
  const p=candidate.payload;
  const decisions=reviews.filter(r=>r.unitId===p.id);const review=decisions.at(-1);
  if(!review||review.decision!=='approved')return [];
  if(candidate.status!=='approved')throw Error('Approved review requires approved candidate status');
  if(review.reviewerId!=='larry-herzog-jr'||review.contentHash!==classificationHash(p)||!/^\d{4}-\d{2}-\d{2}(T.*)?$/.test(review.reviewedAt))throw Error('Classification approval does not match payload');
  if(!['quotation','allusion','parallel'].includes(p.kind)||!p.connectionIds?.length||p.connectionIds.some((id:string)=>!ids.has(id))||!p.sourceObservation||!p.interpretation||!['Codex drafting assistant','Larry Herzog Jr.'].includes(p.author)||p.rights!=='Original draft observations of pinned Scripture; source notices retained.'||!p.evidence?.length)throw Error('Incomplete reviewed classification');
  for(const [side,ranges] of [['nt',p.ntRanges],['ot',p.otRanges]] as const){if(!Array.isArray(ranges)||!ranges.length)throw Error('Missing reviewed ranges');for(const r of ranges)if(compare(r.start,r.end)>0||(address(r.start).book.order<39)!==(side==='ot')||(address(r.end).book.order<39)!==(side==='ot'))throw Error('Invalid classification range');}
  for(const id of p.connectionIds){const c=connections.find(c=>c.id===id);if(JSON.stringify([...c.sourceRanges,...c.targetRanges].sort((a,b)=>compare(a.start,b.start)))!==JSON.stringify([...p.ntRanges,...p.otRanges].sort((a,b)=>compare(a.start,b.start))))throw Error('Classification ranges differ from the referenced connection');}
  return [{...p,approval:{reviewerId:review.reviewerId,contentHash:review.contentHash,reviewedAt:review.reviewedAt}}];
 });
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const candidates=JSON.parse(await readFile(join(root,'content/editorial/connections/candidates.json'),'utf8'));
 const reviews=JSON.parse(await readFile(join(root,'content/editorial/connections/reviews.json'),'utf8'));
 const index=JSON.parse(await readFile(join(root,'app/public/connections/bsb-testament-connections-2026-10-07-v1/index.json'),'utf8'));
 const records=approvedClassifications(candidates,reviews,index.connections);
 for(const record of records)for(const evidence of record.evidence){
  if(!['bsb-2026-09-05-m2-v1','bsb-ot-2026-10-07-v1'].includes(evidence.releaseId)||!/^[A-Z0-9]{3}\.\d+\.\d+$/.test(evidence.sourceRef))throw Error('Unpinned classification evidence');
  const [book,chapter]=evidence.sourceRef.split('.');const data=JSON.parse(await readFile(join(root,'app/public/corpus',evidence.releaseId,book,chapter+'.json'),'utf8'));
  const segment=data.segments.find((s:any)=>s.sourceRef===evidence.sourceRef);
  if(!segment||segment.text!==evidence.text||JSON.stringify(segment.anchors)!==JSON.stringify(evidence.anchors))throw Error('Classification evidence differs from Scripture');
 }
 const destination=join(root,'app/public/connections/reviewed-labels-2026-10-07-v1');await mkdir(destination,{recursive:true});
 await writeFile(join(destination,'index.json'),JSON.stringify({schemaVersion:1,releaseId:'reviewed-labels-2026-10-07-v1',connectionRelease:index.releaseId,records},null,2)+'\n');
 console.log(`Published ${records.length} exact-approved connection classifications; ${candidates.length-records.length} candidates withheld.`);
}
