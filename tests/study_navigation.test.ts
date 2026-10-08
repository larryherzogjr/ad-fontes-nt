import test from 'node:test';import assert from 'node:assert/strict';
import {mainEditionUrl,connectedContextUrl,researchResultUrl,researchReturnUrl} from '../app/lib/study-navigation.ts';
import {researchBookName,researchBookOrder,type ResearchBook} from '../app/lib/domain/lxx-research.ts';
test('Reciprocal context links preserve exact selected connection, view and publisher/manual state',()=>{
 const source='/read/HEB/8?connection=old&ntDisplay=Hebrews+8%3A10-12&otDisplay=Jeremiah+31%3A31-34&display=manual&connectionGreekView=interlinear&private=excluded';
 const result=new URL(connectedContextUrl([{start:'JER.31.31',end:'JER.31.34'}],'YLT','approved-pair','both',source),'http://local');
 assert.equal(result.pathname,'/read/JER/31');assert.equal(result.searchParams.get('connection'),'approved-pair');assert.equal(result.searchParams.get('translation'),'YLT');assert.equal(result.searchParams.get('connectionView'),'both');assert.equal(result.searchParams.get('display'),'manual');assert.equal(result.searchParams.get('ntDisplay'),'Hebrews 8:10-12');assert.equal(result.searchParams.get('private'),null);
 const publisher=new URL(connectedContextUrl([{start:'HEB.8.12',end:'HEB.8.12'}],'BSB','same-pair','greek','/read/JER/31?display=publisher'),'http://local');assert.equal(publisher.searchParams.get('display'),'publisher');assert.equal(publisher.searchParams.get('ntDisplay'),null);
});
test('Research return state stays local and retains query, filters and page through verse links',()=>{
 const search='/greek?q=διαθήκη&mode=lemma&book=&only=1&page=2';const result=new URL(researchResultUrl('1-maccabees/1:11',search),'http://local');assert.equal(result.searchParams.get('verse'),'1-maccabees/1:11');assert.deepEqual([...new URL(researchReturnUrl(result.searchParams.get('from')),'http://local').searchParams],[...new URL(search,'http://local').searchParams]);
 for(const bad of ['https://example.com/greek?q=x','//example.com/greek?q=x','/read/HEB/8','javascript:alert(1)','//['])assert.equal(researchReturnUrl(bad),'/greek');assert.equal(researchReturnUrl('/greek?q=x&token=private&verse=genesis/1:1'),'/greek?q=x');
});
test('Source display names and order keep alternatives distinct without rewriting source identities',()=>{
 const fake=(id:string,name:string)=>({id,name} as ResearchBook);assert.equal(researchBookName(fake('joshua','Joshua · partial source (96 verses)')),'Joshua · partial source');assert.equal(researchBookName(fake('daniel-theodotion','Daniel Theodotion')),'Daniel · Theodotion');assert.equal(researchBookName(fake('jeremiah-lxx','Jeremiah Lxx')),'Jeremiah');assert.ok(researchBookOrder('genesis','1-chronicles')<0);assert.ok(researchBookOrder('judges','judges-vaticanus-b')<0);
});

test('Library research preserves its collection and search state through source reading',()=>{
 const search='/library?view=research&q=λόγος&mode=lemma&book=&page=2&only=1';
 const result=new URL(researchResultUrl('sirach/0:1',search),'http://local');
 assert.equal(result.pathname,'/library');assert.equal(result.searchParams.get('view'),'research');assert.equal(result.searchParams.get('verse'),'sirach/0:1');
 assert.equal(researchReturnUrl(result.searchParams.get('from')),researchReturnUrl(search));
 assert.equal(new URL(researchReturnUrl(search),'http://local').searchParams.get('page'),'2');
 assert.equal(researchReturnUrl('/library?view=connections&q=x'),'/greek');
 assert.equal(researchReturnUrl('/library?view=research&token=private&verse=genesis/1:1'),'/library?view=research');
});

test('Promoting an edition preserves passage and comparison choices without stale word state',()=>{
 const out=new URL(mainEditionUrl([{start:'MAT.1.7',end:'MAT.1.10'}],'YLT','/read/MAT/1?translation=BSB&panel=compare&unit=sample&compareEditions=BSB,YLT&comparisonLayout=comfortable&token=stale&private=excluded'),'http://local');
 assert.equal(out.pathname,'/read/MAT/1');assert.equal(out.searchParams.get('translation'),'YLT');assert.equal(out.searchParams.get('panel'),'compare');assert.equal(out.searchParams.get('passage'),'MAT.1.7-MAT.1.10');
 assert.equal(out.searchParams.get('comparisonSection'),'readings');assert.equal(out.searchParams.get('unit'),'sample');assert.equal(out.searchParams.get('compareEditions'),'BSB,YLT');assert.equal(out.searchParams.get('comparisonLayout'),'comfortable');assert.equal(out.searchParams.get('token'),null);assert.equal(out.searchParams.get('private'),null);
});
