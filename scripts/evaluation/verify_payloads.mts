import {readFile,stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {join,resolve} from 'node:path';
const release='evaluation-resources-2026-10-16-v1',directory=resolve(process.argv[2]||`private/evaluation/content/${release}`);
const resource=JSON.parse(await readFile(`content/evaluation/${release}/manifest.json`,'utf8')),search=JSON.parse(await readFile(`content/evaluation/${release}/search-manifest.json`,'utf8'));
const files={...resource.files,...Object.fromEntries(Object.entries(search.files).map(([path,hash])=>['search/'+path,hash]))};
for(const [path,expected] of Object.entries(files)){const full=join(directory,path);if(!(await stat(full)).isFile())throw Error('Missing evaluation file');const bytes=await readFile(full);if(createHash('sha256').update(bytes).digest('hex')!==expected)throw Error('Evaluation content checksum mismatch: '+path);}
if(JSON.stringify(JSON.parse(await readFile(join(directory,'search/manifest.json'),'utf8')))!==JSON.stringify(search))throw Error('Evaluation search manifest mismatch');
console.log(`Verified ${Object.keys(files).length} pinned evaluation files and search manifest. No source archive needed on host.`);
