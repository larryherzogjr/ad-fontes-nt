import test from 'node:test';
import assert from 'node:assert/strict';
import {libraryCollections,collectionDestination} from '../app/lib/library-collections.ts';
import {libraryRoute,libraryHref,emptyLibraryRoute} from '../app/lib/library-routing.ts';

test('all Library destinations explicitly select a clean collection',()=>{
 assert.equal(collectionDestination('comparisons'),'/library?view=comparisons');
 assert.equal(collectionDestination('overview'),'/library?view=overview');
 assert.equal(new Set(libraryCollections.map(c=>c.id)).size,12);
 for(const collection of libraryCollections){
  const u=new URL(collectionDestination(collection.id),'https://local');
  assert.equal(u.pathname,'/library');assert.deepEqual([...u.searchParams.keys()],['view']);
  assert.equal(libraryRoute(u.search).view,collection.id);
 }
 assert.throws(()=>collectionDestination('missing'),/Unknown/);
});
test('ordinary Library entry and unknown views show the actual overview',()=>{
 for(const search of ['', '?view=overview','?unrelated=x','?view=missing','?view=missing&q=grace','?view=historical&work=edersheim&section=s0065&scan=v2-p0104','?view=confessions&confession=ac:art-IV:3&passage=ROM.3.28&q=grace','?page=nope'])assert.deepEqual(libraryRoute(search),emptyLibraryRoute,search);
});
test('legacy comparison filters retain their destination and state',()=>{
 for(const search of ['?q=grace','?book=2CO','?kind=publisher-note','?page=2'])assert.equal(libraryRoute(search).view,'comparisons',search);
 const old=libraryRoute('?q=grace&book=2CO&kind=publisher-note&page=2');
 assert.deepEqual(libraryRoute(new URL(libraryHref(old,{}),'https://local').search),old);
 assert.match(libraryHref(old,{page:3}),/view=comparisons/);
 assert.equal(libraryRoute('?view=comparisons&page=Infinity').page,1);
 assert.equal(libraryRoute('?view=comparisons&page=2.5').page,1);
});
test('explicit collections and details survive reload and serialized return links',()=>{
 for(const view of libraryCollections.map(c=>c.id))assert.equal(libraryRoute(`?view=${view}&q=x`).view,view);
 for(const [search,view] of [['?article=agape','articles'],['?lemma=word-id','lexicon'],['?hebrew=H1254a','hebrew']] as const)assert.equal(libraryRoute(search).view,view);
 const route=libraryRoute('?view=lexicon&lemma=word-id&q=love&page=2');
 assert.deepEqual(libraryRoute(new URL(libraryHref(route,{}),'https://local').search),route);
 assert.equal(libraryRoute(new URL(libraryHref(route,{lemma:'',page:1}),'https://local').search).q,'love');
});
test('switching collections clears incompatible context while pagination keeps valid filters',()=>{
 const old=libraryRoute('?view=comparisons&q=grace&book=2CO&kind=publisher-note&page=2');
 for(const collection of libraryCollections){
  if(collection.id==='comparisons')continue;
  assert.deepEqual(libraryRoute(new URL(libraryHref(old,{view:collection.id}),'https://local').search),{...emptyLibraryRoute,view:collection.id});
 }
 assert.equal(libraryHref(old,{view:'overview'}),'/library?view=overview');
 assert.equal(libraryHref(old,{page:3}),'/library?view=comparisons&q=grace&book=2CO&kind=publisher-note&page=3');
});


test('Hebrew study detail links preserve Explorer context and return without article state',async()=>{
 const {hebrewStudyUrl}=await import('../app/lib/hebrew-study-navigation.ts');
 const source=new URLSearchParams({view:'hebrew',q:'whole',page:'2',hebrew:'H8535',returnTo:'/read/JOB/1?translation=BSB&panel=hebrew'});
 const detail=hebrewStudyUrl(source.toString(),'tam');
 const parsed=new URL(detail,'https://local');
 assert.equal(parsed.searchParams.get('article'),'tam');
 for(const [key,value] of source)assert.equal(parsed.searchParams.get(key),value);
 assert.equal(libraryRoute(parsed.search).view,'hebrew');
 assert.equal(libraryHref(libraryRoute(parsed.search),{}).includes('article=tam'),true);
 assert.equal(hebrewStudyUrl(parsed.search),`/library?${source}`);
 const linked=new URL(hebrewStudyUrl(parsed.search,'hinnam'),'https://local');
 assert.equal(linked.searchParams.get('article'),'hinnam');
 assert.equal(linked.searchParams.get('q'),'whole');
});
