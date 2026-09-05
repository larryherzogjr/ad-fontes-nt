import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {createLocalAdapter} from '../app/lib/domain/corpus.ts';
import {validateVariant,validatePublication,reviewPayload,type Variant,type Review} from '../app/lib/domain/variants.ts';
const root=new URL('../',import.meta.url);
const read=async(p:string)=>JSON.parse(await readFile(new URL(p,root),'utf8'));
const units:Variant[]=await read('content/editorial/variants.json');
const reviews:Review[]=await read('content/editorial/reviews.json');
const reviewers=await read('content/editorial/reviewers.json');
const adapter=(id:string)=>createLocalAdapter(path=>read('app/public'+path),id);
const published=[];const seen=new Set<string>();
for(const unit of units){
 if(seen.has(unit.id))throw Error('Duplicate variant ID');seen.add(unit.id);
 await validateVariant(unit,adapter);
 if(!reviewers.some((r:{id:string})=>r.id===unit.assignedReviewerId))throw Error('Unassigned or unknown reviewer');
 if(unit.status!=='approved')continue;
 validatePublication(unit,reviews,new Set(reviewers.map((r:{id:string})=>r.id)),createHash('sha256').update(reviewPayload(unit)).digest('hex'));
 published.push(unit);
}
for (const unit of published) for (const id of unit.relatedUnits || []) {
 if (!published.some(other => other.id === id)) throw Error('Related note is not published: '+id);
}
await mkdir(new URL('app/public/editorial/',root),{recursive:true});
await writeFile(new URL('app/public/editorial/variants.json',root),JSON.stringify({schemaVersion:1,units:published})+'\n');
console.log(`Variant publication: ${published.length} approved units; ${units.length-published.length} withheld.`);
