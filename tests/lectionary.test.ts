import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {lectionary,nextSunday,observanceFor,sundayNeighbor,selectedLectionary,lectionaryPacketUrl,lectionarySelectionFromParams} from '../app/lib/domain/lectionary.ts';
import {lectionaryChoices} from '../app/lib/domain/lectionary-references.ts';
import {expand,address} from '../app/lib/domain/references.ts';
import {formatPassage} from '../app/lib/reading-display.ts';
import {defaultPacket,validatePacket,readPacket,buildPacket} from '../app/lib/domain/study-packet.ts';

test('official calendar pins and every extracted source row reproduce without invented successor dates',async()=>{
 const root='sources/lectionary/lcms-calendars-2026-10-14-v1';
 const pin=JSON.parse(await readFile('content/lectionary/lcms-calendars-2026-10-14-v3/manifest.json','utf8'));
 const sha=(b:Buffer)=>createHash('sha256').update(b).digest('hex');
 assert.equal(sha(await readFile('app/lib/domain/lectionary-data.json')),pin.outputSha256);
 for(const [path,hash] of Object.entries(pin.inputs))assert.equal(sha(await readFile(path)),hash,path);
 const acquisition=JSON.parse(await readFile(`${root}/acquisition.json`,'utf8'));
 for(const s of acquisition)assert.equal(sha(await readFile(`${root}/raw/${s.file}`)),s.sha256);
 const rows=JSON.parse(await readFile(`${root}/rows.json`,'utf8'));assert.equal(rows.length,431);assert.equal(lectionary.observances.length,431);
 for(const [i,o] of lectionary.observances.entries()){
  const {readings,...base}=o;assert.deepEqual(base,(({readings,...rest})=>rest)(rows[i]));assert.equal(readings.length,4);
  for(const [j,r] of readings.entries()){assert.equal(r.text,rows[i].readings[j].text);assert.deepEqual(r.choices,lectionaryChoices(r.text));for(const c of r.choices)for(const range of [...c.ranges,...c.extendedRanges]){address(range.start);address(range.end);expand(range);}}
  assert.ok(o.date>=lectionary.coverage.start&&o.date<=lectionary.coverage.end);
 }
 assert.equal(pin.unresolved.length,4);assert.ok(pin.unresolved.every(c=>c.label==='The Song of Moses and Israel'));
});
test('calendar Sundays handle Advent cycle boundaries, local date strings and same-day alternative observances',()=>{
 assert.equal(nextSunday('2026-10-14'),'2026-10-18');assert.equal(nextSunday('2026-10-18'),'2026-10-18');
 assert.equal(observanceFor('three-year','2026-11-22')?.cycle,'A');assert.equal(observanceFor('three-year','2026-11-29')?.cycle,'B');
 assert.equal(sundayNeighbor('three-year','2026-11-22',1),'2026-11-29');assert.equal(sundayNeighbor('three-year','2026-11-29',-1),'2026-11-22');
 assert.equal(observanceFor('three-year','2026-10-14'),undefined);assert.equal(observanceFor('three-year','2028-01-01'),undefined);
 const rows=lectionary.observances.filter(o=>o.series==='three-year'&&o.date==='2026-10-18');assert.equal(rows.length,2);assert.equal(rows[1].title,'St. Luke');assert.equal(rows[1].alternative,true);
 assert.equal(observanceFor('three-year',rows[0].date,rows[1].id)?.id,rows[1].id);
});
test('required, optional, disjoint, cross-chapter and partial-verse appointments retain exact source labels',()=>{
 const cases=[['Rom. 13:(8–10) 11–14','ROM.13.11','ROM.13.14'],['Luke 2:(1–14)15–20','LUK.2.15','LUK.2.20'],['Psalm 85: (1–7) 8–13','PSA.85.8','PSA.85.13'],['Lev. (18:1–5) 19:9–18','LEV.19.9','LEV.19.18']];
 for(const [text,start,end] of cases){const c=lectionaryChoices(text)[0];assert.equal(c.label,text);assert.deepEqual(c.ranges,[{start,end}]);assert.ok(c.extendedRanges.flatMap(expand).length>c.ranges.flatMap(expand).length);}
 assert.deepEqual(lectionaryChoices('John 1:6–8, 19–28')[0].ranges,[{start:'JHN.1.6',end:'JHN.1.8'},{start:'JHN.1.19',end:'JHN.1.28'}]);
 const partial=lectionaryChoices('Acts 6:8–7:2a, 51–60')[0];assert.equal(partial.partialVerses,true);assert.deepEqual(partial.ranges,[{start:'ACT.6.8',end:'ACT.7.2'},{start:'ACT.7.51',end:'ACT.7.60'}]);
 assert.deepEqual(lectionaryChoices('Psalm 24')[0].ranges,[{start:'PSA.24.1',end:'PSA.24.10'}]);
 assert.deepEqual(lectionaryChoices('Jude 20–25')[0].ranges,[{start:'JUD.1.20',end:'JUD.1.25'}]);
 assert.deepEqual(lectionaryChoices('Gen. 18:1–10a (10b–14)')[0].extendedRanges,[{start:'GEN.18.1',end:'GEN.18.14'}]);
});
test('alternate appointments choose one reading, while a Palm Sunday packet retains both procession and Passion',()=>{
 const choices=lectionaryChoices('Matt. 21:1–9 or John 12:12–19 (Procession) ---------------- Matt. (26:1–27:10) 27:11–54 (55–60)');assert.equal(choices.length,2);
 assert.ok(choices[0].ranges.some(r=>r.start==='MAT.21.1'));assert.ok(choices[0].ranges.some(r=>r.start==='MAT.27.11'));
 assert.ok(choices[1].ranges.some(r=>r.start==='JHN.12.12'));assert.ok(!choices[1].ranges.some(r=>r.start==='MAT.21.1'));
 assert.ok(lectionaryChoices('Psalm 16 or The Song of Moses and Israel')[1].unresolved);
});
test('Sunday packet state round trips, preserves preferences and validates appointments with a scoped larger limit',()=>{
 const o=observanceFor('three-year','2026-03-29')!,selection={id:o.id,choices:[0,0,0,0],extended:true},chosen=selectedLectionary(selection);
 assert.ok(chosen.ranges.flatMap(expand).length>120);
 const options={...defaultPacket,reference:formatPassage(chosen.ranges),lectionary:selection,relatedParallels:true};assert.deepEqual(validatePacket(options),chosen.ranges);
 assert.throws(()=>validatePacket({...options,lectionary:undefined}),/120/);
 assert.deepEqual(readPacket(JSON.stringify({schemaVersion:2,options})),options);
 const url=new URL(lectionaryPacketUrl(selection,'YLT'),'http://local');assert.equal(url.searchParams.get('packetEdition'),'YLT');assert.deepEqual(lectionarySelectionFromParams(url.searchParams),selection);
 assert.throws(()=>validatePacket({...options,reference:'John 3:16'}),/differs/);
 assert.throws(()=>selectedLectionary({...selection,id:'unknown'}),/unavailable/);assert.throws(()=>selectedLectionary({...selection,choices:[0,0,0,999]}),/Choose/);
 assert.throws(()=>lectionarySelectionFromParams(new URLSearchParams('lectionary=unknown')),/unavailable/);
});
test('every bundled primary appointment can prepare a Sunday packet, including long Passion readings',()=>{
 for(const o of lectionary.observances)for(const extended of [false,true])for(let role=0;role<4;role++)for(const [choice,c] of o.readings[role].choices.entries()){if(c.unresolved)continue;const choices=[0,0,0,0];choices[role]=choice;const selection={id:o.id,choices,extended};const {ranges}=selectedLectionary(selection);validatePacket({...defaultPacket,reference:formatPassage(ranges),lectionary:selection});}
});
test('Sunday packet builds the complete chosen Scripture from local corpus adapters',async()=>{
 const before=globalThis.fetch;globalThis.fetch=async(input:any)=>{const path=String(input);try{return new Response(await readFile(`app/public${path}`));}catch{return new Response('',{status:404});}};
 try{const o=observanceFor('three-year','2026-03-29')!,selection={id:o.id,choices:[0,0,0,0],extended:true},chosen=selectedLectionary(selection);
 const packet=await buildPacket({...defaultPacket,lectionary:selection,reference:formatPassage(chosen.ranges),explanations:false,publisherNotes:false,resourceLinks:false});
 assert.deepEqual(packet.ranges,chosen.ranges);assert.deepEqual(new Set(packet.readings.flatMap(r=>r.coverage.map(c=>c.anchor))),new Set(chosen.ranges.flatMap(expand)));assert.ok(packet.readings.every(r=>r.segments.length));
 }finally{globalThis.fetch=before;}
});
