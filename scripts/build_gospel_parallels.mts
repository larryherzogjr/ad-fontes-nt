/** Navigation derived from preserved publisher structure, with no editorial harmony. */
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {books,expand,address,resolveReference} from '../app/lib/domain/references.ts';
const releaseId='bsb-gospel-parallels-2026-10-14-v1',sourceRelease='bsb-2026-09-05-m2-v1';
const sha=(bytes:Buffer|string)=>createHash('sha256').update(bytes).digest('hex');
const encode=(v:unknown)=>JSON.stringify(v,null,2)+'\n';
const inputs:Record<string,string>={},records:any[]=[],excluded:any[]=[];
for(const book of books.filter(b=>['MAT','MRK','LUK','JHN'].includes(b.code))){
 const blocks:any[]=[];
 for(let chapter=1;chapter<=book.verses.length;chapter++){
  const path=`app/public/corpus/${sourceRelease}/${book.code}/${chapter}.json`,raw=await readFile(path);
  inputs[path]=sha(raw);blocks.push(...JSON.parse(raw.toString()).blocks);
 }
 const anchors=expand({start:`${book.code}.1.1`,end:`${book.code}.${book.verses.length}.${book.verses.at(-1)}`});
 const opening=(from:number)=>{for(let j=from;j<blocks.length;j++){const a=blocks[j].runs.find((r:any)=>r.verse&&r.anchor)?.anchor;if(a)return a;}return undefined;};
 let title='';
 for(let i=0;i<blocks.length;i++){
  const block=blocks[i];if(block.role!=='publisher-heading')continue;
  if(block.marker==='s1')title=block.runs.map((r:any)=>r.text||'').join('');
  if(block.marker!=='r')continue;
  const targets:any[]=[],references:any[]=[];
  for(let k=0;k<block.runs.length;k++){
   const run=block.runs[k];if(!run.marks?.includes('ref'))continue;
   try{const ranges=resolveReference(run.text).filter(r=>['MAT','MRK','LUK','JHN'].includes(address(r.start).book.code)&&address(r.start).book.code===address(r.end).book.code&&address(r.start).book.code!==book.code);
    if(ranges.length){targets.push(...ranges);references.push({text:run.text,path:`runs/${k}`,ranges});}
   }catch{excluded.push({sourceId:block.sourceId,reference:run.text,reason:'Unresolved explicit publisher reference.'});}
  }
  if(!targets.length)continue;
  const start=opening(i+1);let next:string|undefined;
  for(let j=i+1;j<blocks.length;j++)if(blocks[j].role==='publisher-heading'&&blocks[j].marker==='s1'){next=opening(j+1);break;}
  const end=next?anchors[anchors.indexOf(next)-1]:anchors.at(-1);
  if(!start||!end||anchors.indexOf(end)<anchors.indexOf(start)||!title)throw Error(`Invalid publisher section ${block.sourceId}`);
  records.push({id:sha(block.sourceId).slice(0,24),title,sourceEdition:'BSB',sourceRelease,sourceId:block.sourceId,sourceRange:{start,end},targetRanges:[...new Map(targets.map(r=>[JSON.stringify(r),r])).values()],publisherReference:block.runs.map((r:any)=>r.text||'').join(''),references});
 }
}
const index={schemaVersion:1,releaseId,records};
const manifest={releaseId,sourceRelease,implementationSha256:sha(await readFile(new URL(import.meta.url))),inputs,recordCount:records.length,outputSha256:sha(encode(index)),excluded,scope:'Gospel references explicitly marked in BSB publisher headings. Source ranges follow publisher section boundaries through the verse before the next s1 heading. Targets retain explicit reference extents. These are navigational sections, not reviewed harmonizations or quotation extents.'};
const pin=`content/gospel-parallels/${releaseId}/manifest.json`;
await mkdir(`content/gospel-parallels/${releaseId}`,{recursive:true});
try{if(await readFile(pin,'utf8')!==encode(manifest))throw Error('Gospel parallel pins changed; create a reviewed successor.');}catch(e:any){if(e.code!=='ENOENT')throw e;if(!process.argv.includes('--prepare'))throw Error('Gospel parallel release is not pinned.');await writeFile(pin,encode(manifest));}
await mkdir(`app/public/gospel-parallels/${releaseId}`,{recursive:true});
await writeFile(`app/public/gospel-parallels/${releaseId}/index.json`,encode(index));
console.log(`Verified ${records.length} BSB Gospel sections with explicit parallel references.`);
