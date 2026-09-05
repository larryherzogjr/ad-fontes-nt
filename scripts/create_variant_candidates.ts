/** Source-only review queue. Never approves or generates interpretive significance. */
import {readFile,writeFile} from 'node:fs/promises';
import {createLocalAdapter,editions} from '../app/lib/domain/corpus.ts';
import {resolveReference} from '../app/lib/domain/references.ts';
import type {Variant} from '../app/lib/domain/variants.ts';
const root=new URL('../',import.meta.url),target=new URL('content/editorial/variants.json',root);
const existing=JSON.parse(await readFile(target,'utf8'));if(existing.length)throw Error('Refusing to replace an existing review queue');
const references=['Matthew 6:13','Matthew 17:21','Matthew 18:11','Matthew 23:14','Mark 1:1','Mark 7:16','Mark 9:44','Mark 9:46','Mark 11:26','Mark 15:28','Mark 16:9-20','Luke 17:36','Luke 22:43-44','Luke 23:17','John 1:18','John 5:3-4','John 7:53-8:11','Acts 8:37','Acts 15:34','Acts 24:6-8','Acts 28:29','Romans 5:1','Romans 16:24','Romans 16:25-27','1 Corinthians 13:3','1 Timothy 3:16','1 John 5:7-8','Revelation 22:19','2 Corinthians 13:12-14','3 John 14-15'];
const units:Variant[]=[];
for(const [index,ref] of references.entries()){
 const ranges=resolveReference(ref),readings:Variant['readings']=[],citations:Variant['citations']=[];
 for(const e of editions){
  const adapter=createLocalAdapter(async p=>JSON.parse(await readFile(new URL('app/public'+p,root),'utf8')),e.editionId);
  const p=await adapter.getPassage(ranges);
  const mixed=new Set(p.coverage.map(c=>c.textState)).size>1;
  const state=mixed?'mixed':p.coverage.every(c=>c.textState==='absent')?'absent':p.coverage.some(c=>c.textState==='relocated')?'relocated':p.coverage.some(c=>c.textState==='bracketed')?'bracketed':'present';
  readings.push({editionId:e.editionId,releaseId:e.releaseId,state,...(mixed?{coverage:p.coverage.map(({anchor,dataState,textState})=>({anchor,dataState,textState}))}:{}),spans:p.segments.map(s=>({segmentId:s.id,start:0,end:s.text.length,text:s.text}))});
  citations.push({editionId:e.editionId,releaseId:e.releaseId,sourceId:p.segments.map(s=>s.sourceId).join('; ')||'manifest verifiedGaps: '+ranges[0].start,url:e.url});
 }
 units.push({id:`candidate-${String(index+1).padStart(2,'0')}`,title:ref,ranges,status:'draft',assignedReviewerId:'larry-herzog-jr',contentType:'Ordinary Means commentary',readings,citations,attestations:[],significance:null,author:null,rights:'unresolved',provenance:'Automatically extracted edition readings for human review. No manuscript attestation or interpretive explanation has been generated.'});
}
await writeFile(target,JSON.stringify(units,null,2)+'\n');console.log(`${units.length} source-only candidates created; none approved.`);
