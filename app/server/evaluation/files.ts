import { readFile, stat } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { Readable } from 'node:stream';
import { resolve, sep } from 'node:path';
import { createHash } from 'node:crypto';
import resourcePin from '../../../content/evaluation/evaluation-resources-2026-10-16-v1/manifest.json' with {type:'json'};
import searchPin from '../../../content/evaluation/evaluation-resources-2026-10-16-v1/search-manifest.json' with {type:'json'};
import { reply } from './security.ts';
function directory(variable:string){const path=process.env[variable];if(!path)throw Error('Evaluation files not configured');return resolve(path);}
function safe(base:string,path:string){const target=resolve(base,path);if(!target.startsWith(base+sep))throw Error('Invalid file');return target;}
export async function content(path:string){
 const hashes=resourcePin.files as Record<string,string>, searches=searchPin.files as Record<string,string>;
 const expected=hashes[path] || (path.startsWith('search/')?searches[path.slice(7)]:undefined);
 if(path==='search/manifest.json')return reply(searchPin);
 if(!expected)return reply({error:'Not found'},404);
 const bytes=await readFile(safe(directory('EVALUATION_CONTENT_DIR'),path));
 if(createHash('sha256').update(bytes).digest('hex')!==expected)throw Error('Evaluation content mismatch');
 return new Response(bytes,{headers:{'Content-Type':path.endsWith('.json')?'application/json; charset=utf-8':'application/octet-stream','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
}
const verified=new Map<string,string>();
/** Publication metadata is private, generated only after exact signed artifacts are verified. */
export async function download(path:string,head=false){
 if(!/^(?:installers\/[a-zA-Z0-9_.-]+|releases\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+|latest\.json)$/.test(path))return reply({error:'Not found'},404);
 const base=directory('EVALUATION_DOWNLOAD_DIR');
 const index=JSON.parse(await readFile(safe(base,'publication.json'),'utf8')) as {files:Record<string,{sha256:string;size:number}>};
 const record=index.files[path];if(!record || !/^[a-f0-9]{64}$/.test(record.sha256))return reply({error:'Not found'},404);
 const target=safe(base,path),info=await stat(target);if(!info.isFile()||info.size!==record.size)throw Error('Artifact mismatch');
 // Installer/updater hashes are checked by the publication preparer; updater signatures verify on-device.
 const fingerprint=`${info.size}:${info.mtimeMs}:${record.sha256}`;
 if(verified.get(target)!==fingerprint){const hash=createHash('sha256');for await(const chunk of createReadStream(target))hash.update(chunk);if(hash.digest('hex')!==record.sha256)throw Error('Artifact checksum mismatch');verified.set(target,fingerprint);}
 const headers={'Content-Type':path.endsWith('.json')?'application/json':'application/octet-stream','Cache-Control':'private, no-store','Content-Length':String(info.size),'X-Content-Type-Options':'nosniff',...(path.endsWith('.json')?{}:{'Content-Disposition':`attachment; filename="${path.split('/').at(-1)}"`})};
 return new Response(head?null:Readable.toWeb(createReadStream(target)) as ReadableStream,{headers});
}
export async function downloadList(){
 try{const base=directory('EVALUATION_DOWNLOAD_DIR'),p=JSON.parse(await readFile(safe(base,'publication.json'),'utf8'));
 return reply({version:p.version,installers:Object.keys(p.files).filter(path=>/^installers\/[a-zA-Z0-9_.-]+$/.test(path)&&path.endsWith(`-${p.version}${path.endsWith('.dmg')?'.dmg':'.exe'}`)).map(path=>({name:path.slice(11),url:`/api/evaluation/download/${path}`,sha256:p.files[path].sha256}))});
 }catch{return reply({installers:[],notice:'Signed evaluation installers have not been published yet.'});}
}
