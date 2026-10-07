import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {researchManifest,researchBook,researchVerse,researchLemmas,researchOccurrences,researchHighlights,searchResearch,sourceVerseUrl} from '../app/lib/domain/lxx-research.ts';
import {orderedGreekMatches,comparisonRanges} from '../app/lib/domain/greek-comparison.ts';
import {loadConnectionCatalog,connectionPairKey} from '../app/lib/domain/testament-connections.ts';
const original=globalThis.fetch;globalThis.fetch=async input=>new Response(await readFile('app/public'+input,'utf8'));test.after(()=>{globalThis.fetch=original;});
test('Full-source search preserves word surfaces, phrase order, exact lemmas and same-token morphology',async()=>{
 const genesis=await researchBook('genesis'),first=genesis[0];assert.equal(first.sourceRef,'genesis/1:1');
 assert.equal(searchResearch(genesis,{query:'"ἐν ἀρχῇ"',mode:'text'}).hits[0].sourceRef,first.sourceRef);
 assert.equal(searchResearch(genesis,{query:'"εν αρχη"',mode:'text',accentFold:true}).hits[0].sourceRef,first.sourceRef);
 assert.equal(searchResearch(genesis,{query:'"εν αρχη"',mode:'text'}).total,0);
 assert.ok(searchResearch(genesis,{query:'θεός',mode:'lemma'}).total>0);assert.equal(searchResearch(genesis,{query:'θεος',mode:'lemma'}).total,0);
 const synthetic={...first,tokens:[['α','α','noun','gen sg',0,1,'a'],['β','β','verb','aor act',2,3,'b']] as typeof first.tokens};
 assert.equal(searchResearch([synthetic],{query:'',mode:'morphology',pos:'noun',form:'aor'}).total,0);assert.equal(searchResearch([synthetic],{query:'',mode:'morphology',pos:'verb',form:'aor act'}).total,1);
 assert.equal(searchResearch(genesis,{query:'',mode:'text',sourceOnly:true}).total,0);
 assert.ok(searchResearch(genesis,{query:'',mode:'text',page:9999}).page>1);
});
test('Source-only passages and named alternatives have independent navigation and exact highlights',async()=>{
 const m=await researchManifest();assert.equal(m.books.length,59);assert.equal(m.counts.sourceOnlyVerses,7717);
 const catalog=await researchLemmas();assert.equal(catalog.filter(e=>e.nt.length&&e.lxx).length,3706);
 const e=catalog.find(e=>e.lemma==='θεός')!;assert.equal(e.lxx!.count,4006);
 const hits=await researchOccurrences(e,'lxx');assert.equal(hits.length,4006);assert.equal(hits.filter(h=>!h.anchor).length,897);
 const only=hits.find(h=>!h.anchor)!;assert.ok(sourceVerseUrl(only.sourceRef,only.tokenId).startsWith('/greek?verse='));await researchHighlights([only],'lxx');
 const extra=(await researchBook('tobit-sinaiticus'))[0];assert.equal(extra.anchors.length,0);const source=await researchVerse(extra.sourceRef);assert.equal(source.text,extra.text);assert.equal(source.tokens[0].surface,extra.tokens[0][0]);
 const prologue=(await researchBook('sirach')).find(s=>s.sourceRef.startsWith('sirach/0:'));assert.ok(prologue);await researchVerse(prologue.sourceRef);
 await assert.rejects(()=>researchVerse('invented/1:1'));await assert.rejects(()=>researchVerse('genesis/999:1'));
});
test('Publisher catalog corroborates, groups reciprocal links, and retains original source records',async()=>{
 const d=await loadConnectionCatalog();assert.equal(d.connections.length,1948);const pairs=new Set(d.connections.map(connectionPairKey));assert.equal(pairs.size,876);
 assert.equal(d.connections.filter(c=>c.sourceEdition==='MSB'&&c.kind==='publisher-cross-reference'&&!d.connections.some(b=>b.sourceEdition==='BSB'&&connectionPairKey(b)===connectionPairKey(c))).length,5);
});
test('Comparison accepts bounded correct-Testament selections and deterministic ordered NFC matches',()=>{
 assert.deepEqual(comparisonRanges('Hebrews 8:8–12',false),[{start:'HEB.8.8',end:'HEB.8.12'}]);assert.throws(()=>comparisonRanges('Genesis 1:1',false));assert.throws(()=>comparisonRanges('Genesis 1–4',true),/60/);
 assert.equal(orderedGreekMatches([''],['']).count,0);const r=orderedGreekMatches(['α','β','γ','β'],['α','γ','β']);assert.equal(r.count,3);assert.deepEqual([...r.right],[0,1,2]);assert.equal(orderedGreekMatches(['ἄ'],['α\u0313\u0301']).count,1);assert.throws(()=>orderedGreekMatches(Array(2001).fill('α'),Array(2001).fill('α')),/shorter/);
});
test('Heading links preserve explicit publisher evidence without inventing section extent',async()=>{
 const c=(await loadConnectionCatalog()).connections.find(c=>c.kind==='publisher-heading-reference'&&c.sourceEdition==='BSB'&&c.sourceRanges[0].start==='GEN.1.1'&&c.targetRanges[0].start==='JHN.1.1')!;assert.ok(c);assert.equal(c.sourceRanges[0].end,'GEN.1.1');assert.equal(c.targetRanges[0].end,'JHN.1.5');assert.equal(c.originalReference.loc,'John 1:1–5');assert.ok(c.noteSourceId.includes('GEN.usj'));
 const {createHash}=await import('node:crypto');const pin=JSON.parse(await readFile('sources/testament-connections/publisher-heading-connections-2026-10-07-v2/manifest.json','utf8'));assert.equal(createHash('sha256').update(await readFile('app/public/connections/publisher-heading-connections-2026-10-07-v2/index.json')).digest('hex'),pin.outputSha256);
 const heading=(await loadConnectionCatalog()).connections.find(c=>c.kind==='publisher-heading-reference'&&c.sourceEdition==='BSB'&&c.originalReference.loc==='Hebrews 8:6–13')!;assert.equal(heading.sourceRanges[0].start,'JER.31.26');
 const packet=JSON.parse(await readFile('content/editorial/connections/expanded/review-v3.json','utf8'));assert.equal(packet.records.length,876);assert.ok(packet.records.every((r:any)=>r.status==='draft'));assert.equal(packet.records.filter((r:any)=>r.proposedNtDisplayRanges).length,288);
});
