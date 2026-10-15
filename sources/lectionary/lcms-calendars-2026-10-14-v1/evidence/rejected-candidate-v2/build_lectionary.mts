import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {lectionaryChoices} from '../app/lib/domain/lectionary-references.ts';
const releaseId='lcms-calendars-2026-10-14-v2',root='sources/lectionary/lcms-calendars-2026-10-14-v1';
const sha=(s:Buffer|string)=>createHash('sha256').update(s).digest('hex');
const encode=(v:unknown)=>JSON.stringify(v,null,2)+'\n';
const source=JSON.parse(await readFile(`${root}/rows.json`,'utf8'));
const observances=source.map((o:any)=>({...o,readings:o.readings.map((r:any)=>({...r,choices:lectionaryChoices(r.text)}))}));
const index={schemaVersion:1,releaseId,coverage:{start:'2024-12-01',end:'2027-11-25'},observances};
const unresolved=observances.flatMap((o:any)=>o.readings.flatMap((r:any)=>r.choices.filter((c:any)=>c.unresolved).map((c:any)=>({id:o.id,role:r.role,...c}))));
const inputs:Record<string,string>={};for(const path of [`${root}/acquisition.json`,`${root}/rows.json`,'scripts/lectionary/extract.py','scripts/build_lectionary.mts','app/lib/domain/lectionary-references.ts','sources/ot/releases/ot-english-2026-10-07-v1/whole-bible-registry.json'])inputs[path]=sha(await readFile(path));
const manifest={releaseId,inputs,outputSha256:sha(encode(index)),observanceCount:observances.length,unresolved,scope:'Factual dates, observance names, and appointed Scripture references from six pinned LCMS calendars. Successor preview rows are excluded. Parenthesized extents are optional; partial verses open complete canonical verses with disclosure. Unnamed canticles are unresolved. No prayers, summaries, liturgical prose or source Bible wording is reproduced.'};
await mkdir(`content/lectionary/${releaseId}`,{recursive:true});const pin=`content/lectionary/${releaseId}/manifest.json`;
try{if(await readFile(pin,'utf8')!==encode(manifest))throw Error('Lectionary pins changed; prepare a reviewed successor.');}catch(e:any){if(e.code!=='ENOENT')throw e;if(!process.argv.includes('--prepare'))throw Error('Lectionary release is not pinned.');await writeFile(pin,encode(manifest));}
await writeFile('app/lib/domain/lectionary-data.json',encode(index));console.log(`Verified ${observances.length} observances; ${unresolved.length} unresolved choices.`);for(const c of unresolved)console.log(c.id,c.role,c.label,c.unresolved);
