import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,stat,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {searchRelease,collectionLabels} from '../app/lib/domain/library-search.ts';
import {availableDeviceLinks,presentRecentLinks} from '../app/lib/device-links.ts';
const digest=(b:Uint8Array)=>createHash('sha256').update(b).digest('hex');
test('retired writings have no public payload, search collections or active importer',async()=>{
 await assert.rejects(stat('app/public/library/historical'),{code:'ENOENT'});
 assert.deepEqual(await readdir('app/public/library/search'),[searchRelease]);
 assert.deepEqual(Object.keys(collectionLabels),['greek','hebrew','comparisons','lenski','kd','isbe','lutheran']);
 const pkg=JSON.parse(await readFile('package.json','utf8'));assert.doesNotMatch(pkg.scripts['import:all'],/import_historical_library/);
 const manifest=JSON.parse(await readFile(`content/library-search/${searchRelease}/manifest.json`,'utf8'));
 const previous=JSON.parse(await readFile('content/library-search/library-search-2026-10-14-v2/manifest.json','utf8'));
 for(const [path,hash] of Object.entries(previous.inputs))assert.equal(manifest.inputs[path],hash,path);for(const [id,count] of Object.entries(previous.counts))assert.deepEqual(manifest.counts[id],count,id);assert.ok(Object.keys(manifest.inputs).every(path=>!path.startsWith('library/historical/')));
 // Every retained decoded search payload is identical after normalizing only the derivative ID.
 for(const path of Object.keys(previous.files)){
  const bytes=await readFile(`app/public/library/search/${searchRelease}/${path}`);
  const normalized=gunzipSync(bytes).toString().replaceAll(searchRelease,previous.releaseId);
  const {gzipSync}=await import('../app/node_modules/fflate/esm/browser.js');
  assert.equal(digest(gzipSync(Buffer.from(normalized),{level:9,mtime:0})),previous.files[path],path);
 }
});
test('retired reading and author-search bookmarks disappear without mutating device records',()=>{
 const links=['/library?view=historical&work=walther&section=s0001','/library?view=fulltext&collection=edersheim','/library?view=fulltext&resource=josephus:life:s001','/library?view=articles&article=agape'].map((url,i)=>({url,label:String(i),savedAt:i}));
 const original=JSON.stringify(links);assert.deepEqual(availableDeviceLinks(links),[links[3]]);assert.deepEqual(presentRecentLinks(links,'study').map(l=>l.url),[links[3].url]);assert.equal(JSON.stringify(links),original);
});
test('retired release pins and exact implementation evidence remain preserved outside app assets',async()=>{
 for(const [release,hash] of [['historical-library-2026-10-15-v1','e2137d8b69d5c095352de1d4b1717999122fd5344f949842e1ea5d5bf09fb884'],['historical-library-2026-10-15-v2','4f4482d188c29e145b0a0e4cc4a178b71a7ca888d19b28f5c6c481d0e606db4c']])assert.equal(digest(await readFile(`content/historical-library/${release}/manifest.json`)),hash);
 const bytes=await readFile('content/library-search/library-search-2026-10-15-v4/manifest.json');assert.equal(digest(bytes),'c55ed48eebdeabd5647a89c14b9244dc9c20147d104019cf192781f48ced7689');
 const m=JSON.parse(bytes.toString());for(const path of ['scripts/build_library_search.mts','app/lib/domain/library-search.ts','app/lib/domain/historical-library.ts'])assert.equal(digest(await readFile(`content/library-search/${m.releaseId}/evidence/${path.split('/').at(-1)}`)),m.implementation[path]);
});
