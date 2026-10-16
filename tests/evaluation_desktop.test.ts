import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,stat,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const release='evaluation-resources-2026-10-16-v1',base='app/desktop/evaluation-public',prefix=`evaluation-content/${release}/`;
test('evaluation desktop includes every exact pinned resource/search output and no private runtime/source files',async()=>{
 const inventory=JSON.parse(await readFile(`${base}/desktop-content.json`,'utf8'));
 const resource=JSON.parse(await readFile(`content/evaluation/${release}/manifest.json`,'utf8'));
 const search=JSON.parse(await readFile(`content/evaluation/${release}/search-manifest.json`,'utf8'));
 const expected={...resource.files,...Object.fromEntries(Object.entries(search.files).map(([path,hash])=>['search/'+path,hash]))};
 for(const [path,hash] of Object.entries(expected)){
  const full=prefix+path,bytes=await readFile(`${base}/${full}`);assert.equal(createHash('sha256').update(bytes).digest('hex'),hash,path);assert.equal(inventory.files[full],hash,path);
 }
 assert.deepEqual(JSON.parse(await readFile(`${base}/${prefix}search/manifest.json`,'utf8')),search);
 for(const path of Object.keys(inventory.files))assert.doesNotMatch(path,/(^|\/)(\.env|raw|evidence|server|api|account|backups|access\.sqlite)(\/|$)/);
 await assert.rejects(stat('app/desktop/public/evaluation-content'),{code:'ENOENT'});await assert.rejects(stat('app/public/evaluation-content'),{code:'ENOENT'});
});
test('evaluation frontend is self-contained and native configuration cannot replace the public installer identity',async()=>{
 const index=await readFile('app/desktop/evaluation-dist/index.html','utf8');assert.match(index,/assets\//);
 const assets=await readdir('app/desktop/evaluation-dist/assets'),js=(await Promise.all(assets.filter(p=>p.endsWith('.js')).map(p=>readFile('app/desktop/evaluation-dist/assets/'+p,'utf8')))).join('\n');
 assert.match(js,/evaluation-content/);assert.match(js,/evaluation_update_session/);assert.doesNotMatch(js,/GOOGLE_CLIENT_SECRET|local-browser-fixture|local-browser-admin/);
 const windows=JSON.parse(await readFile('app/desktop/src-tauri/tauri.evaluation.windows.conf.json','utf8'));assert.equal(windows.bundle.windows.nsis.template,null);assert.equal(windows.bundle.windows.nsis.installerHooks,null);
 const native=JSON.parse(await readFile('app/desktop/src-tauri/tauri.evaluation.conf.json','utf8'));assert.equal(native.identifier,'app.ad-fontes.evaluation');assert.equal(native.productName,'Ad Fontes Evaluation');
});
