import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {loadGospelParallels,parallelMatches,parallelAccounts,gospelParallelRelease,gospelParallelHash,gospelParallelsUrl,parallelGroups} from '../app/lib/domain/gospel-parallels.ts';
import {address,compare,resolveReference,expand} from '../app/lib/domain/references.ts';
const raw=await readFile(`app/public/gospel-parallels/${gospelParallelRelease}/index.json`,'utf8');
const index=await loadGospelParallels(async()=>raw);
const sha=(b:Buffer|string)=>createHash('sha256').update(b).digest('hex');
test('Gospel parallel release reproduces immutable source and implementation pins',async()=>{
 const manifest=JSON.parse(await readFile(`content/gospel-parallels/${gospelParallelRelease}/manifest.json`,'utf8'));
 assert.equal(Object.keys(manifest.inputs).length,89);assert.equal(manifest.recordCount,361);
 for(const [path,hash] of Object.entries(manifest.inputs))assert.equal(sha(await readFile(path)),hash,path);
 assert.equal(sha(raw),manifest.outputSha256);assert.equal(sha(raw),gospelParallelHash);
 assert.equal(sha(await readFile('scripts/build_gospel_parallels.mts')),manifest.implementationSha256);
});
test('every parallel preserves its exact publisher heading, reference runs and section boundaries',async()=>{
 const cache=new Map<string,any[]>();
 for(const r of index.records){
  const code=address(r.sourceRange.start).book.code,book=address(r.sourceRange.start).book;
  if(!cache.has(code)){const blocks=[];for(let c=1;c<=book.verses.length;c++)blocks.push(...JSON.parse(await readFile(`app/public/corpus/${r.sourceRelease}/${code}/${c}.json`,'utf8')).blocks);cache.set(code,blocks);}
  const blocks=cache.get(code)!,i=blocks.findIndex(b=>b.sourceId===r.sourceId);assert.ok(i>=0);const block=blocks[i];assert.equal(block.marker,'r');assert.equal(block.runs.map((x:any)=>x.text||'').join(''),r.publisherReference);
  const expected=[];
  for(const ref of r.references){const run=ref.path.split('/').reduce((x:any,k)=>x[k],block);assert.equal(run.text,ref.text);assert.ok(run.marks.includes('ref'));assert.deepEqual(resolveReference(run.text).filter(t=>['MAT','MRK','LUK','JHN'].includes(address(t.start).book.code)&&address(t.start).book.code!==code),ref.ranges);expected.push(...ref.ranges);}
  assert.deepEqual(r.targetRanges,[...new Map(expected.map(t=>[JSON.stringify(t),t])).values()]);
  const opening=(from:number)=>{for(let j=from;j<blocks.length;j++){const anchor=blocks[j].runs.find((x:any)=>x.verse&&x.anchor)?.anchor;if(anchor)return anchor;}};
  assert.equal(r.sourceRange.start,opening(i+1));let next;for(let j=i+1;j<blocks.length;j++)if(blocks[j].role==='publisher-heading'&&blocks[j].marker==='s1'){next=opening(j+1);break;}
  if(next){const interval=expand({start:r.sourceRange.end,end:next});assert.equal(interval.length,2);}
  else assert.equal(r.sourceRange.end,`${code}.${book.verses.length}.${book.verses.at(-1)}`);
 }
});
test('mid-section and reciprocal Gospel references match without pulling unrelated passages',()=>{
 const baptism=index.records.find(r=>r.sourceRange.start==='MAT.3.13')!;assert.ok(baptism);assert.equal(baptism.sourceRange.end,'MAT.3.17');
 for(const ref of ['Matthew 3:16','Mark 1:10','Luke 3:22','John 1:32'])assert.ok(parallelMatches(baptism,resolveReference(ref)),ref);
 assert.equal(parallelMatches(baptism,resolveReference('Matthew 3:12')),false);assert.equal(parallelMatches(baptism,resolveReference('Romans 8')),false);
 assert.equal(parallelAccounts(baptism).length,4);assert.ok(parallelAccounts(baptism).every((r,i,a)=>!i||compare(a[i-1].start,r.start)<=0));
 const u=new URL(gospelParallelsUrl(resolveReference('Matthew 3:13–17'),'YLT'),'https://example.test');assert.equal(u.searchParams.get('passage'),'MAT.3.13-MAT.3.17');assert.equal(u.searchParams.get('parallelEdition'),'YLT');
});
test('missing or altered index is unavailable data rather than no parallel accounts',async()=>{
 await assert.rejects(loadGospelParallels(async()=>{throw Error('missing source');}),/missing source/);
 await assert.rejects(loadGospelParallels(async()=>raw.replace('The','A')),/preserved publisher index/);
 await assert.rejects(loadGospelParallels(async()=>'{"records":[]}'),/preserved publisher index/);
});

test('identical account ranges share a group while every original publisher citation remains',()=>{
 const groups=parallelGroups(index.records);assert.equal(groups.length,146);assert.equal(groups.flat().length,361);
 const group=groups.find(g=>g.some(r=>r.sourceRange.start==='MAT.14.13'))!;assert.equal(group.length,4);
 assert.ok(group.every(r=>JSON.stringify(parallelAccounts(r))===JSON.stringify(parallelAccounts(group[0]))));
});
