import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import {buildPacket,defaultPacket,readPacket} from '../app/lib/domain/study-packet.ts';
import {availableDeviceLinks} from '../app/lib/device-links.ts';
import {libraryRoute,emptyLibraryRoute} from '../app/lib/library-routing.ts';

test('retired confessional deep links return to the Library overview',()=>{
 for(const search of ['?view=confessions','?view=confessions&confession=ac:art-IV:3&passage=ROM.3.28&q=grace'])assert.deepEqual(libraryRoute(search),emptyLibraryRoute);
});
test('saved packet preferences discard retired confessional selection without requesting its data',async()=>{
 const options=readPacket(JSON.stringify({schemaVersion:2,options:{...defaultPacket,reference:'Romans 3:28',explanations:false,relatedConfessions:true}}));
 assert.ok(!('relatedConfessions' in options));
 const oldFetch=globalThis.fetch;const requests:string[]=[];
 globalThis.fetch=async(input:any)=>{const path=String(input);requests.push(path);try{return new Response(await readFile(`app/public${path}`));}catch{return new Response('',{status:404});}};
 try{const packet=await buildPacket(options);assert.ok(packet.readings.length>0);assert.ok(!('confessions' in packet));assert.ok(requests.every(path=>!path.includes('/confessions/')));}finally{globalThis.fetch=oldFetch;}
});
test('normal web builds exclude every retired confessional projection',async()=>{
 await assert.rejects(stat('app/public/confessions'),{code:'ENOENT'});
 const pipeline=JSON.parse(await readFile('package.json','utf8')).scripts['import:all'];
 assert.doesNotMatch(pipeline,/build_confessions|confessions\/prepare_primary/);
 assert.match(pipeline,/retire_confessions/);
});

test('retired confessional bookmarks are hidden without changing saved records',()=>{
 const links=[{url:'/library?view=confessions&confession=ac:art-IV:3',label:'Augsburg Confession',savedAt:1},{url:'/library?view=parallels',label:'Gospel Parallels',savedAt:2}];
 const before=JSON.stringify(links);assert.deepEqual(availableDeviceLinks(links),[links[1]]);assert.equal(JSON.stringify(links),before);
});
