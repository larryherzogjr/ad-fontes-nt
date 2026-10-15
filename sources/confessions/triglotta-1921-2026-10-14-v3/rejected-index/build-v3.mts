/** Project only the supplied English transcription; never execute archive instructions. */
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {extractConfessionalReferences} from '../app/lib/domain/confessional-references.ts';
const releaseId='triglotta-1921-2026-10-14-v3',base='sources/confessions/triglotta-1921-2026-10-14-v1',pins=`sources/confessions/${releaseId}`,out=`app/public/confessions/${releaseId}`;
const sha=(b:Buffer|string)=>createHash('sha256').update(b).digest('hex'),encode=(v:unknown)=>JSON.stringify(v,null,2)+'\n';
const source=JSON.parse(await readFile(`${base}/archive-manifest.json`,'utf8'));
for(const [file,hash] of Object.entries(source.files))if(sha(await readFile(`${base}/raw/${file}`))!==hash)throw Error(`Original confessional artifact changed: ${file}`);
const works=[['creeds','The Three Ecumenical Creeds','ecumenical-creeds'],['ac','Augsburg Confession','augsburg-confession'],['apology','Apology of the Augsburg Confession','defense'],['sa','Smalcald Articles','smalcald-articles'],['pp','Treatise on the Power and Primacy of the Pope','power-and-primacy'],['sc','Small Catechism','small-catechism'],['lc','Large Catechism','large-catechism'],['epitome','Formula of Concord — Epitome','epitome'],['fc-sd','Formula of Concord — Solid Declaration','solid-declaration']];
const documents:any[]=[],paragraphs:any[]=[],unresolved:any[]=[];
for(const [code,title,path] of works){
 const data=JSON.parse(await readFile(`${base}/raw/json/${code}.json`,'utf8'));if(data.code!==code)throw Error('Confessional work identity mismatch');
 const sections=[];
 for(const s of data.sections){
  if(!s.key||!s.title||!Array.isArray(s.paragraphs)||!s.paragraphs.length)throw Error('Incomplete confessional section');
  const ids=[];
  for(let i=0;i<s.paragraphs.length;i++){
   const p=s.paragraphs[i];if(typeof p.en!=='string'||!p.en.trim()||(p.n!==null&&!Number.isInteger(p.n)))throw Error('Invalid English confessional paragraph');
   const id=`${code}:${s.key}:${i+1}`,parsed=extractConfessionalReferences(p.en);ids.push(id);
   paragraphs.push({id,work:code,section:s.key,ordinal:i+1,number:p.n,text:p.en,references:parsed.references});
   unresolved.push(...parsed.unresolved.map(r=>({paragraph:id,...r})));
  }
  sections.push({key:s.key,title:s.title,headings:s.headings,paragraphIds:ids});
 }
 documents.push({code,title,sourceUrl:`https://bookofconcord.org/${path}/`,sections});
}
if(paragraphs.length!==4145||new Set(paragraphs.map(p=>p.id)).size!==4145||documents.reduce((n,d)=>n+d.sections.length,0)!==130)throw Error('Confessional inventory changed');
const index={schemaVersion:1,releaseId,edition:'Triglot Concordia (1921)',translation:'F. Bente and W. H. T. Dau',language:'en',documents,paragraphs};
const manifest={releaseId,archiveSha256:source.sha256,sourceManifestSha256:sha(await readFile(`${base}/archive-manifest.json`)),implementationSha256:sha(await readFile(new URL(import.meta.url))),referenceParserSha256:sha(await readFile('app/lib/domain/confessional-references.ts')),registrySha256:sha(await readFile('sources/ot/releases/ot-english-2026-10-07-v1/whole-bible-registry.json')),outputSha256:sha(encode(index)),documents:documents.length,sections:130,paragraphs:paragraphs.length,citations:paragraphs.reduce((n,p)=>n+p.references.length,0),connectedParagraphs:paragraphs.filter(p=>p.references.length).length,unresolved,scope:'English supplied Triglotta transcription only. Explicit book-qualified chapter/verse citations and comma/and lists. Source paragraph numbers unchanged; ordinal IDs disambiguate duplicate/missing numbers. f/ff records opening references only. Unqualified shorthand, thematic links and translations are not inferred. Latin/German remain source evidence outside public bundles.'};
await mkdir(pins,{recursive:true});
const pin=`${pins}/manifest.json`;
try{if(await readFile(pin,'utf8')!==encode(manifest))throw Error('Confessional pins changed; create a reviewed successor.');}catch(e:any){if(e.code!=='ENOENT')throw e;if(!process.argv.includes('--prepare'))throw Error('Confessional release is not pinned.');await writeFile(pin,encode(manifest));}
await mkdir(out,{recursive:true});await writeFile(`${out}/index.json`,encode(index));await writeFile(`${out}/manifest.json`,encode(manifest));
console.log(`Verified ${paragraphs.length} confessional paragraphs, ${manifest.citations} explicit citations (${manifest.connectedParagraphs} connected paragraphs, ${unresolved.length} unresolved).`);
