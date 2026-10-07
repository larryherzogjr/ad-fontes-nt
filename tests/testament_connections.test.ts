import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { loadConnections, connectionMatches, connectionRelease } from '../app/lib/domain/testament-connections.ts';
import { address, resolveReference } from '../app/lib/domain/references.ts';
const load = async (path: string) => JSON.parse(await readFile('app/public'+path,'utf8'));
const index = await loadConnections(load);
const sha=(bytes: Buffer)=>createHash('sha256').update(bytes).digest('hex');
test('every connection retains its exact publisher note and explicit reference object', async () => {
  assert.equal(index.connections.length,698);
  const cache = new Map();
  for(const c of index.connections) {
    const anchor=c.sourceRanges[0].start, a=address(anchor);
    const path=`/corpus/${c.sourceRelease}/${a.book.code}/${a.chapter}.json`;
    if(!cache.has(path))cache.set(path,await load(path));
    const note=cache.get(path).notes.find((n: any)=>n.id===c.noteId);
    assert.ok(note); assert.equal(note.anchor,anchor); assert.equal(note.body,c.publisherNote); assert.equal(note.sourceId,c.noteSourceId);
    const ref=c.originalReference.path.split('/').slice(1).reduce((n: any,k: string)=>n[k],note.original);
    assert.equal(ref.type,'ref');assert.equal(ref.loc,c.originalReference.loc);assert.deepEqual(ref.content,c.originalReference.content);
    const targets=resolveReference(ref.loc).filter(r=>(address(r.start).book.order<39)!==(a.book.order<39) && (address(r.end).book.order<39)!==(a.book.order<39));
    assert.deepEqual(c.targetRanges,targets);
  }
});
test('connections match either end and preserve closing-verse anchors without inferred classifications', () => {
  for(const [nt,ot] of [['Matthew 1:23','Isaiah 7:14'],['John 19:37','Zechariah 12:10'],['Hebrews 8:12','Jeremiah 31:31–34']]) {
    const c=index.connections.find(c=>c.sourceRanges[0].start===resolveReference(nt)[0].start && c.targetRanges[0].start===resolveReference(ot)[0].start)!;
    assert.ok(c,nt);assert.equal(connectionMatches(c,resolveReference(nt)),true);assert.equal(connectionMatches(c,resolveReference(ot)),true);
    assert.equal(connectionMatches(c,resolveReference('Genesis 1:1')),false);
    assert.equal(c.kind,'publisher-cross-reference');assert.equal('classification' in c,false);
  }
});
test('manifest pins all source bytes and the generated index; unresolved references remain separate', async () => {
  const manifest=JSON.parse(await readFile(`sources/testament-connections/${connectionRelease}/manifest.json`,'utf8'));
  assert.equal(Object.keys(manifest.inputs).length,1189);
  for(const [path,hash] of Object.entries(manifest.inputs))assert.equal(sha(await readFile(path)),hash,path);
  assert.equal(sha(await readFile(`app/public/connections/${connectionRelease}/index.json`)),manifest.outputSha256);
  assert.equal(sha(await readFile('scripts/build_testament_connections.mts')),manifest.implementationSha256);
  const unresolved=JSON.parse(await readFile(`sources/testament-connections/${connectionRelease}/unresolved-references.json`,'utf8'));
  assert.equal(unresolved.length,7);assert.ok(unresolved.every((r: any)=>r.reason && r.loc));
});
test('invalid releases and corrupt canonical references report unavailable data', async () => {
  for(const mutate of [(i:any)=>{i.connections=[];},(i:any)=>{i.connections[0]=null;},(i:any)=>{i.releaseId='other';},(i:any)=>{i.connections[0].targetRanges[0].start='ISA.999.1';},(i:any)=>{i.connections.push(i.connections[0]);},(i:any)=>{i.connections[0].kind='quotation';}]) {
    const copy=structuredClone(index);mutate(copy);await assert.rejects(loadConnections(async()=>copy),/incomplete/);
  }
  await assert.rejects(loadConnections(async()=>{throw Error('missing');}),/missing/);
});
test('retired account routes and database/OAuth dependencies are absent from active app/runtime', async () => {
  for(const path of ['app/app/account','app/app/api/account','app/app/api/notes','app/server','app/app/personal-notes.tsx'])await assert.rejects(access(path));
  const pkg=JSON.parse(await readFile('app/package.json','utf8'));
  for(const dep of ['pg','google-auth-library'])assert.equal(dep in pkg.dependencies,false);
  const web=(await readFile('deployment/compose.yml','utf8')).split('  web:')[1];
  assert.doesNotMatch(web,/DATABASE_URL|GOOGLE_|REGISTRATION|depends_on/);
  assert.doesNotMatch(await readFile('deployment/Dockerfile','utf8'),/migrate|migrations|google-auth-library/);
  const {GET}=await import('../app/app/api/health/route.ts');assert.deepEqual(await (await GET()).json(),{ok:true});
});
