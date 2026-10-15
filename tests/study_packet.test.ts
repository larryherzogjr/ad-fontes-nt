import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createLocalAdapter } from '../app/lib/domain/corpus.ts';
import { defaultPacket, packetRanges, validatePacket, loadPacketReading, readPacket, overlappingUnits, packetUrl, buildPacket, selectPacketConnection, packetCommentarySelections, loadPacketCommentary, loadPacketStudy, relatedPacketConnectionIds } from '../app/lib/domain/study-packet.ts';
const load=async(path:string)=>JSON.parse(await readFile(`app/public${path}`,'utf8'));

test('packets accept ordered OT/NT passages without mixed-release quotations',async()=>{
 const ranges=packetRanges('Genesis 1:1–2; John 1:1–2');assert.equal(ranges.length,2);
 const readings=await Promise.all(ranges.map(r=>loadPacketReading(r,'BSB',createLocalAdapter(load,'BSB'))));
 assert.equal(readings[0].releaseId,'bsb-ot-2026-10-07-v1');assert.equal(readings[1].releaseId,'bsb-2026-09-05-m2-v1');
 for(const r of readings){assert.ok(r.segments.length);const source=await createLocalAdapter(load,'BSB').getPassage([r.range]);assert.deepEqual(r.segments,source.segments);}
});
test('packet validation bounds size, preserves canonical identity and rejects incompatible editions',()=>{
 assert.throws(()=>packetRanges('John 1–8'),/120/);assert.throws(()=>packetRanges('John 3:99'));
 assert.throws(()=>validatePacket({...defaultPacket,reference:'Genesis 1:1',editionIds:['N1904']}),/Greek NT/);
 assert.throws(()=>validatePacket({...defaultPacket,editionIds:[]}),/at least one/);
 assert.throws(()=>validatePacket({...defaultPacket,editionIds:['BSB','BSB']}),/at least one/);
 assert.throws(()=>validatePacket({...defaultPacket,title:'x'.repeat(121)}),/120/);
 assert.throws(()=>validatePacket({...defaultPacket,relatedGreek:'yes' as any}),/Invalid packet option/);
 assert.throws(()=>readPacket('{"schemaVersion":9}'),/not supported/);
 assert.deepEqual(readPacket(JSON.stringify({schemaVersion:1,options:defaultPacket})),defaultPacket);
 assert.match(packetUrl(packetRanges('John 3:16'),'WLC'),/packetEdition=BSB/);
});
test('packets retain genuine absence and publisher notes without calling unavailable data an omission',async()=>{
 const r=await loadPacketReading(packetRanges('Acts 8:37')[0],'BSB',createLocalAdapter(load,'BSB'));
 assert.equal(r.coverage[0].textState,'absent');assert.equal(r.segments.length,0);assert.ok(r.notes.length);
 const corrupt=createLocalAdapter(async()=>{throw Error('Missing');},'BSB');await assert.rejects(loadPacketReading(packetRanges('John 3:16')[0],'BSB',corrupt),/unavailable|could not/i);
});
test('joined and relocated source readings remain intact in packet quotations',async()=>{
 const r=await loadPacketReading(packetRanges('3 John 14')[0],'YLT',createLocalAdapter(load,'YLT'));
 const exact=await createLocalAdapter(load,'YLT').getPassage(packetRanges('3 John 14'));assert.deepEqual(r.segments,exact.segments);assert.ok(r.segments.length);
});
test('only approved explanations overlap the requested canonical passage; long units retain their complete scope',async()=>{
 const {units}=await load('/editorial/variants.json');const selected=overlappingUnits(units,packetRanges('John 8:1'));
 assert.ok(selected.some((u:any)=>u.ranges.some((r:any)=>r.start==='JHN.7.53')));
 assert.ok(selected.every((u:any)=>u.status==='approved'&&u.rights==='cleared'));
 assert.equal(overlappingUnits([{...selected[0],status:'draft'}],packetRanges('John 8:1')).length,0);
});
test('legacy configurations migrate to checkboxes without carrying manual selections into new packets',()=>{
 const {relatedGreek,relatedHebrew,relatedConnections,...old}=defaultPacket;
 const legacy=JSON.stringify({schemaVersion:1,options:{...old,excerpts:[{resource:'greek:nekros',block:1}],studies:['greek:theos'],comparisons:['candidate-01'],connections:['old-id']}});
 const restored=readPacket(legacy);assert.equal(restored.relatedGreek,false);assert.equal(restored.relatedHebrew,false);assert.equal(restored.relatedConnections,false);
 assert.equal(restored.reference,old.reference);assert.equal(restored.explanations,old.explanations);assert.ok(!('excerpts' in restored)&&!('studies' in restored));
 assert.deepEqual(readPacket(JSON.stringify({schemaVersion:2,options:{...defaultPacket,relatedGreek:true}})),{...defaultPacket,relatedGreek:true});
});
const sourceFetch=async(input:any)=>{try{return new Response(await readFile(`app/public${String(input)}`),{status:200});}catch{return new Response('',{status:404});}};
test('automatic study checkboxes match source words, preserve full articles and exclude unchecked collections',async()=>{
 const original=globalThis.fetch;globalThis.fetch=sourceFetch;
 try{
  const options={...defaultPacket,reference:'Job 1:1; John 3:16; Romans 8:15',explanations:false,relatedGreek:true,relatedHebrew:true};
  const packet=await buildPacket(options),ids=packet.studies.map(s=>s.id);
  assert.ok(ids.includes('greek:abba'));assert.ok(ids.includes('greek:theos'));assert.ok(ids.includes('hebrew:tam'));assert.equal(ids.length,new Set(ids).size);
  for(const s of packet.studies){const article=await load(`/om/${s.doc.release}/articles/${s.id.split(':')[1]}.json`);assert.equal(s.markdown,article.article.markdown);assert.ok(s.matches?.length);}
  assert.match(packet.studies.find(s=>s.id==='greek:theos')!.markdown,/\[\^jeg-2-27\]:/);
  const off=await buildPacket({...options,relatedGreek:false,relatedHebrew:false});assert.equal(off.studies.length,0);
  const changed=await buildPacket({...options,reference:'Romans 8:15',relatedGreek:false});assert.equal(changed.studies.length,0);
  await assert.rejects(loadPacketStudy('greek:missing'),/unavailable/);
 }finally{globalThis.fetch=original;}
});
test('automatic comparisons and connections retain full approved scope and all same-pair citations',async()=>{
 const original=globalThis.fetch;globalThis.fetch=sourceFetch;
 try{
  const comparisons=await buildPacket({...defaultPacket,reference:'John 8:1'});assert.ok(comparisons.units.some(u=>u.ranges.some(r=>r.start==='JHN.7.53')));
  const packet=await buildPacket({...defaultPacket,reference:'Matthew 19:4',explanations:false,relatedConnections:true});assert.ok(packet.connections.length);
  assert.equal(new Set(packet.connections.map(c=>JSON.stringify(c.citations[0].sourceRanges)+JSON.stringify(c.citations[0].targetRanges))).size,packet.connections.length);
  const reviewed=packet.connections.find(c=>c.label?.kind==='quotation'&&c.otRanges.some(r=>r.start==='GEN.1.27'));assert.ok(reviewed);assert.ok(reviewed.citations.some(c=>c.sourceEdition==='BSB'));assert.ok(reviewed.citations.some(c=>c.sourceEdition==='MSB'));
  assert.equal((await buildPacket({...defaultPacket,reference:'Matthew 19:4',relatedConnections:false})).connections.length,0);
  const catalog=await load('/connections/bsb-testament-connections-2026-10-07-v1/index.json');const first=catalog.connections[0];assert.equal(relatedPacketConnectionIds([first,{...first,id:'duplicate-source'}],first.sourceRanges).length,1);
 }finally{globalThis.fetch=original;}
});
test('known analysis gaps are disclosed; incomplete checked collections block preparation',async()=>{
 const original=globalThis.fetch;globalThis.fetch=sourceFetch;
 try{
  const packet=await buildPacket({...defaultPacket,reference:'2 Thessalonians 2:13',relatedGreek:true});assert.ok(packet.matchingNotes.some(n=>n.includes('unavailable')));
  globalThis.fetch=async(input:any)=>String(input).includes('/connections/')?new Response('',{status:404}):sourceFetch(input);
  await assert.rejects(buildPacket({...defaultPacket,reference:'Matthew 19:4',relatedConnections:true}),/could not be loaded/);
  globalThis.fetch=async(input:any)=>{const response=await sourceFetch(input);if(String(input).includes('/analysis/nestle-analysis-1.3-m3-v1/GAL/6.json')){const data=await response.json();for(const s of data.segments)s.tokens=[];return Response.json(data);}return response;};
  await assert.rejects(buildPacket({...defaultPacket,reference:'Galatians 6:1',relatedGreek:true}),/analysis is incomplete/);
 }finally{globalThis.fetch=original;}
});
test('connection packet display preserves reviewed extent without relabeling unclassified references',async()=>{
 const base=await load('/connections/bsb-testament-connections-2026-10-07-v1/index.json'),labels=await load('/connections/reviewed-connections-2026-10-07-v2/index.json');
 const label=labels.records.find((l:any)=>base.connections.some((c:any)=>l.connectionIds.includes(c.id))),id=label.connectionIds.find((id:string)=>base.connections.some((c:any)=>c.id===id));
 const reviewed=selectPacketConnection(id,base.connections,[label]);assert.deepEqual(reviewed.ntRanges,label.displayNtRanges);assert.deepEqual(reviewed.label,label);
 const unclassified=selectPacketConnection(base.connections[0].id,base.connections,[]);assert.equal(unclassified.label,undefined);assert.deepEqual(unclassified.citations[0].publisherNote,base.connections[0].publisherNote);
 assert.throws(()=>selectPacketConnection('missing',base.connections,[]),/unavailable/);
});
test('related commentary derives distinct source chapters from the main passages in both Testaments',()=>{
 const selections=packetCommentarySelections(packetRanges('Genesis 1:1–2; 2 Corinthians 2:5; 2 Corinthians 2:7–8'));
 assert.deepEqual(selections.map(s=>s.id),['kd:GEN:1','lenski:2CO:2']);
 assert.match(selections[0].title,/source chapter group/);
 assert.deepEqual(packetCommentarySelections(packetRanges('2 Corinthians 2–3')).map(s=>s.id),['lenski:2CO:2','lenski:2CO:3']);
});
test('related commentary reproduces complete pinned paragraphs and corrupt sources block preparation',async()=>{
 const original=globalThis.fetch;
 const sourceFetch=async(input:any)=>{try{return new Response(await readFile(`app/public${String(input)}`),{status:200});}catch{return new Response('',{status:404});}};
 globalThis.fetch=sourceFetch;
 try{
  const ranges=packetRanges('Genesis 1:1; 2 Corinthians 2:5');const chapters=await loadPacketCommentary(ranges);
  for(const c of chapters){const [,book,chapter]=c.doc.id.split(':');const source=await load(`/commentaries/${c.doc.release}/chapters/${book}/${chapter}.json`);assert.deepEqual(c.paragraphs.map(p=>p.text),source.paragraphs);}
  const packet=await buildPacket({...defaultPacket,reference:'2 Corinthians 2',relatedCommentary:true,explanations:false});assert.equal(packet.commentary.length,1);assert.equal(packet.commentary[0].doc.id,'lenski:2CO:2');
  assert.equal((await buildPacket({...defaultPacket,reference:'2 Corinthians 2',explanations:false})).commentary.length,0);
  globalThis.fetch=async(input:any)=>String(input).endsWith('/text/lenski-2CO.bin')?new Response('corrupt',{status:200}):sourceFetch(input);
  await assert.rejects(loadPacketCommentary(packetRanges('2 Corinthians 2')),/does not match/);
 }finally{globalThis.fetch=original;}
});

test('Gospel packet checkbox adds exact matching account groups once, full readings and all publisher citations',async()=>{
 const original=globalThis.fetch;globalThis.fetch=sourceFetch;
 try{
  const options={...defaultPacket,reference:'Matthew 14:16; John 6:5',explanations:false,relatedParallels:true,editionIds:['BSB','YLT']};
  const packet=await buildPacket(options);assert.equal(packet.parallels.length,1);
  const group=packet.parallels[0];assert.equal(group.citations.length,4);assert.equal(group.readings.length,8);
  assert.deepEqual(group.readings.filter(r=>r.editionId==='BSB').map(r=>r.range),packetRanges('Matthew 14:13–21; Mark 6:30–44; Luke 9:10–17; John 6:1–15'));
  for(const r of group.readings){const exact=await createLocalAdapter(load,r.editionId).getPassage([r.range]);assert.deepEqual(r.segments,exact.segments);assert.deepEqual(r.coverage,exact.coverage);}
  assert.equal((await buildPacket({...options,relatedParallels:false})).parallels.length,0);
  assert.equal((await buildPacket({...options,reference:'Romans 8:15'})).parallels.length,0);
  const greek=await buildPacket({...options,editionIds:['N1904']});assert.ok(greek.parallels[0].readings.every(r=>r.editionId==='BSB'));
 }finally{globalThis.fetch=original;}
});
test('older packet preferences migrate with Gospel parallels off; checked data failures block preparation',async()=>{
 const {relatedParallels,...old}=defaultPacket;
 assert.equal(readPacket(JSON.stringify({schemaVersion:2,options:old})).relatedParallels,false);
 assert.equal(readPacket(JSON.stringify({schemaVersion:1,options:old})).relatedParallels,false);
 assert.throws(()=>validatePacket({...defaultPacket,relatedParallels:'yes' as any}),/Invalid packet option/);
 const original=globalThis.fetch;globalThis.fetch=async(input:any)=>String(input).includes('/gospel-parallels/')?new Response('',{status:404}):sourceFetch(input);
 try{await assert.rejects(buildPacket({...defaultPacket,reference:'Matthew 3:16',relatedParallels:true}),/could not be loaded/);assert.equal((await buildPacket({...defaultPacket,reference:'Matthew 3:16'})).parallels.length,0);
 globalThis.fetch=async(input:any)=>String(input).includes('/corpus/')&&String(input).includes('/MRK/')?new Response('',{status:404}):sourceFetch(input);
 await assert.rejects(buildPacket({...defaultPacket,reference:'Matthew 3:16',relatedParallels:true}),/unavailable|could not/i);
 }finally{globalThis.fetch=original;}
});
