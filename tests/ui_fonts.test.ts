import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const base='app/public/fonts/ad-fontes-ui-v1';
const manifest=JSON.parse(await readFile(`${base}/manifest.json`,'utf8'));

test('interface fonts and licenses match the pinned upstream artifacts',async()=>{
 assert.equal(manifest.faces.length,3);
 assert.deepEqual((await readdir(base)).sort(),['manifest.json',...Object.keys(manifest.files)].sort());
 for(const [name,pin] of Object.entries(manifest.files) as [string,{bytes:number;sha256:string}][]){
  const bytes=await readFile(`${base}/${name}`);
  assert.equal(bytes.length,pin.bytes,name);
  assert.equal(createHash('sha256').update(bytes).digest('hex'),pin.sha256,name);
  if(name.endsWith('.woff2'))assert.equal(bytes.subarray(0,4).toString(),'wOF2');
  else assert.match(bytes.toString(),/SIL OPEN FONT LICENSE/i);
 }
 for(const face of manifest.faces){
  assert.match(face.commit,/^[a-f0-9]{40}$/);
  assert.ok(face.url.includes(`/${face.commit}/`));
  assert.ok(face.version.length);
 }
 assert.equal(manifest.fontBytes,384236);
 assert.deepEqual(manifest.faces.find((f:{file:string})=>f.file==='SourceSans3VF-Upright.otf.woff2').axes.wght,[200,200,900]);
});
