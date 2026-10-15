import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync,readdirSync} from 'node:fs';
import {join} from 'node:path';
import {externalLinkProps} from '../app/lib/external-links.ts';
const require=createRequire(new URL('../app/package.json',import.meta.url));
const ts=require('typescript');

test('external URLs always leave the current study open with a protected new tab',()=>{
 for(const href of ['https://bookofconcord.org/ecumenical-creeds/apostles-creed/','http://example.org','//example.org','HTTPS://example.org',' mailto:larry@example.org ','tel:+15555550100']){
  const props=externalLinkProps(href,'nofollow opener');
  assert.equal(props.target,'_blank',href);
  assert.deepEqual(new Set(props.rel?.split(' ')),new Set(['nofollow','noopener','noreferrer']));
 }
 for(const href of [undefined,'','/library?view=confessions','#reading','?page=2','article.json','blob:https://local/id','data:text/plain,test'])assert.deepEqual(externalLinkProps(href),{},String(href));
});

test('the shared anchor enforces external targets in rendered and exported HTML',()=>{
 const source=readFileSync('app/components/app-link.tsx','utf8');
 const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText;
 const exports:Record<string,any>={};
 new Function('require','exports',code)((id:string)=>id==='@/lib/external-links'?{externalLinkProps}:require(id),exports);
 const React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
 const html=renderToStaticMarkup(React.createElement(exports.default,{href:'https://example.org',target:'_self',rel:'opener nofollow'},'Source'));
 assert.match(html,/target="_blank"/);assert.match(html,/rel="nofollow noopener noreferrer"/);
 assert.doesNotMatch(html,/_self/);
 const internal=renderToStaticMarkup(React.createElement(exports.default,{href:'/library?view=hebrew'},'Library'));
 assert.doesNotMatch(internal,/target=|rel=/);
});

test('all dynamic and external JSX anchors use the shared link policy',()=>{
 const failures:string[]=[];let checked=0;
 function walk(dir:string){for(const item of readdirSync(dir,{withFileTypes:true})){
  if(['node_modules','public','dist','.next','.vinext'].includes(item.name))continue;
  const file=join(dir,item.name);if(item.isDirectory()){walk(file);continue;}
  if(!file.endsWith('.tsx')||file==='app/components/app-link.tsx')continue;
  const source=ts.createSourceFile(file,readFileSync(file,'utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
  function visit(node:any){
   if(ts.isJsxOpeningElement(node)||ts.isJsxSelfClosingElement(node)){
    if(node.tagName.getText(source)==='AppLink')checked++;
    if(node.tagName.getText(source)==='a'){
     const href=node.attributes.properties.find((p:any)=>ts.isJsxAttribute(p)&&p.name.getText(source)==='href');
     if(!href?.initializer||!ts.isStringLiteral(href.initializer)||! /^(?:\/(?!\/)|#|\?)/.test(href.initializer.text)||node.attributes.properties.some((p:any)=>ts.isJsxSpreadAttribute(p)))failures.push(`${file}:${source.getLineAndCharacterOfPosition(node.getStart()).line+1}`);
    }
   }
   ts.forEachChild(node,visit);
  }visit(source);
 }}walk('app');
 assert.ok(checked>100,'Sweep includes dynamically supplied and Markdown-rendered links');
 assert.deepEqual(failures,[],'Use AppLink for any external/dynamic anchor: '+failures.join(', '));
});
