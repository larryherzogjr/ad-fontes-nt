/** Run on the signing runner before packaging the transferred, already-built frontend. */
import {readFile,readdir,stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {join} from 'node:path';
const base='app/desktop/evaluation-dist';
const inventory=JSON.parse(await readFile(join(base,'desktop-content.json'),'utf8'));
for(const [path,expected] of Object.entries(inventory.files)){
 if(path.includes('..')||path.startsWith('/'))throw Error('Unsafe inventory path');
 const bytes=await readFile(join(base,path));
 if(createHash('sha256').update(bytes).digest('hex')!==expected)throw Error('Offline content mismatch: '+path);
}
const actual:string[]=[];
async function walk(path:string){for(const entry of await readdir(join(base,path),{withFileTypes:true})){const name=path?path+'/'+entry.name:entry.name;if(entry.isSymbolicLink())throw Error('Symlink in frontend');if(entry.isDirectory())await walk(name);else if(entry.isFile())actual.push(name);else throw Error('Unexpected frontend entry');}}
await walk('');
for(const path of actual)if(!(path in inventory.files)&&path!=='desktop-content.json'&&path!=='index.html'&&!path.startsWith('assets/'))throw Error('Unexpected frontend input: '+path);
const prefix='evaluation-content/evaluation-resources-2026-10-16-v1/';
const resource=JSON.parse(await readFile('content/evaluation/evaluation-resources-2026-10-16-v1/manifest.json','utf8'));
const search=JSON.parse(await readFile('content/evaluation/evaluation-resources-2026-10-16-v1/search-manifest.json','utf8'));
for(const [path,hash] of Object.entries({...resource.files,...Object.fromEntries(Object.entries(search.files).map(([p,h])=>['search/'+p,h]))}))if(inventory.files[prefix+path]!==hash)throw Error('Restricted content differs from source pins: '+path);
if(JSON.stringify(JSON.parse(await readFile(join(base,prefix,'search/manifest.json'),'utf8')))!==JSON.stringify(search))throw Error('Search manifest differs from pin');
await stat(join(base,'index.html'));
console.log(`Verified ${Object.keys(inventory.files).length} offline payloads, private pins and frontend allowlist.`);
