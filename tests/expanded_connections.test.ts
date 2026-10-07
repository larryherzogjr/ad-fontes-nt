import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {approvedExpanded,expandedHash} from '../scripts/research/publish_expanded_connections.mts';
const bytes=await readFile('content/editorial/connections/expanded/review-v3.json');
const packet=JSON.parse(bytes.toString());
const reviews=JSON.parse(await readFile('content/editorial/connections/expanded/reviews.json','utf8'));
const connections=(await Promise.all(packet.sourceReleases.map(async(r:string)=>JSON.parse(await readFile(`app/public/connections/${r}/index.json`,'utf8')).connections))).flat();
test('Expanded publication preserves exact approved packet, 288 quotations and private drafts',async()=>{
 assert.equal(createHash('sha256').update(bytes).digest('hex'),'0eeda81dcc72f5d95ec6a5f9bcabaa93612ccd0fc2161f31d4e2fa0f3d543574');
 assert.equal(packet.records.length,876);assert.equal(reviews.length,288);
 const result=approvedExpanded(packet.records,reviews,connections);assert.equal(result.length,288);
 const published=JSON.parse(await readFile('app/public/connections/reviewed-connections-2026-10-07-v2/index.json','utf8'));
 assert.deepEqual(published.records,result);assert.ok(result.every(r=>!('reviewRecord' in r)&&!('status' in r)));
 assert.ok(result.some(r=>r.displayNtRanges.some((p:any)=>p.start==='HEB.8.8'&&p.end==='HEB.8.12')));
 assert.equal(approvedExpanded(packet.records,[],connections).length,0);
});
test('Expanded approvals reject stale content, missing evidence, altered sources and unclassified judgments',()=>{
 const r=packet.records.find((r:any)=>r.kind==='proposed-quotation');const review=reviews.find((x:any)=>x.unitId===r.id);
 assert.throws(()=>approvedExpanded([{...r,author:'changed'}],[review],connections),/hash/);
 assert.throws(()=>approvedExpanded([r],[{...review,reviewerId:'other'}],connections),/reviewer/);
 assert.throws(()=>approvedExpanded([r],[{...review,reviewedAt:'yesterday'}],connections),/reviewer/);
 assert.equal(approvedExpanded([r],[review,{...review,decision:'rejected'}],connections).length,0);
 const missing={...r,evidence:[]};assert.throws(()=>approvedExpanded([missing],[{...review,contentHash:expandedHash(missing)}],connections),/quotation/);
 const partial={...r,evidence:r.evidence.slice(1)};assert.throws(()=>approvedExpanded([partial],[{...review,contentHash:expandedHash(partial)}],connections),/evidence/);
 const changed=connections.map((c:any)=>c.id===r.publisherCitations[0].id?{...c,publisherNote:'changed'}:c);assert.throws(()=>approvedExpanded([r],[review],changed),/Publisher/);
 const unclassified=packet.records.find((x:any)=>x.kind==='unclassified-publisher-reference');assert.throws(()=>approvedExpanded([unclassified],[{...review,unitId:unclassified.id,contentHash:expandedHash(unclassified)}],connections),/quotation/);
});
