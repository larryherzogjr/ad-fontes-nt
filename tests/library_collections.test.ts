import test from 'node:test';
import assert from 'node:assert/strict';
import {libraryCollections,collectionDestination} from '../app/lib/library-collections.ts';
test('every Library collection has a clean committed destination and legacy comparisons stay at /library',()=>{
 assert.equal(collectionDestination('comparisons'),'/library');assert.equal(collectionDestination('overview'),'/library?view=overview');
 assert.equal(new Set(libraryCollections.map(c=>c.id)).size,12);
 for(const collection of libraryCollections){const u=new URL(collectionDestination(collection.id),'https://local');assert.equal(u.pathname,'/library');assert.deepEqual([...u.searchParams.keys()],collection.id==='comparisons'?[]:['view']);}
 assert.throws(()=>collectionDestination('missing'),/Unknown/);
});
