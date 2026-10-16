import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,rm,stat,mkdir,writeFile,utimes} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {store,closeStore,type User} from '../app/server/evaluation/store.ts';
import {newSession,completeIdentity,setGrant,authorized,now} from '../app/server/evaluation/access.ts';
import {cookie,csrfValid,digest} from '../app/server/evaluation/security.ts';
import {handleEvaluation} from '../app/server/evaluation/handler.ts';
const origin='http://127.0.0.1:3046';
test('evaluation authorization denies public/unapproved users; manual grants, CSRF, revocation, pairing and logout enforce access',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'ad-fontes-evaluation-'));
 const original={...process.env};
 try{
 Object.assign(process.env,{AF_EDITION:'evaluation',EVALUATION_ORIGIN:origin,EVALUATION_DATABASE:join(dir,'evaluation.sqlite'),GOOGLE_CLIENT_ID:'fixture',GOOGLE_CLIENT_SECRET:'fixture',EVALUATION_ADMIN_EMAILS:'larry.herzog@gmail.com',EVALUATION_CONTENT_DIR:join(process.cwd(),'private/evaluation/content/evaluation-resources-2026-10-16-v1')});
 const request=(path:string,token='',body?:unknown,csrf='')=>new Request(origin+'/api/evaluation/'+path,{method:body===undefined?'GET':'POST',headers:{cookie:cookie(token),Origin:origin,'Content-Type':'application/json','X-CSRF-Token':csrf},...(body===undefined?{}:{body:JSON.stringify(body)})});
 assert.equal((await handleEvaluation(request('content/catalog.json'))).status,403);
 const adminInitial=newSession();const adminSession=completeIdentity({hash:digest(adminInitial.token),sub:null,csrf:adminInitial.csrf,expires:now()+10},{sub:'admin-google-sub',email:'larry.herzog@gmail.com',name:'Larry'});
 const admin=store().prepare('SELECT * FROM users WHERE sub=?').get('admin-google-sub') as User;
 assert.equal(admin.admin,1);assert.equal(admin.admitted,0);assert.equal(authorized(request('content/catalog.json',adminSession.token)),undefined);
 const initial=newSession();const tester=completeIdentity({hash:digest(initial.token),sub:null,csrf:initial.csrf,expires:now()+10},{sub:'tester-sub',email:'tester@example.org',name:'Tester'});
 assert.equal((await handleEvaluation(request('users',tester.token))).status,403);
 assert.equal((await handleEvaluation(request('grant',tester.token,{sub:admin.sub,grant:true,eligibilityConfirmed:true},tester.csrf))).status,403);
 assert.equal((await handleEvaluation(request('grant',adminSession.token,{sub:'tester-sub',grant:true,eligibilityConfirmed:true},'wrong'))).status,403);
 assert.equal((await handleEvaluation(request('grant',adminSession.token,{sub:'tester-sub',grant:true},adminSession.csrf))).status,400);
 assert.equal((await handleEvaluation(request('grant',adminSession.token,{sub:'tester-sub',grant:true,eligibilityConfirmed:true},adminSession.csrf))).status,200);
 assert.equal(authorized(request('content/catalog.json',tester.token))?.sub,'tester-sub');
 const downloads=join(dir,'evaluation-downloads');await mkdir(join(downloads,'installers'),{recursive:true});process.env.EVALUATION_DOWNLOAD_DIR=downloads;
 const fixture=Buffer.from('explicit signed-artifact HTTP delivery fixture'),artifact=join(downloads,'installers/fixture.exe');await writeFile(artifact,fixture);
 await writeFile(join(downloads,'publication.json'),JSON.stringify({version:'4.3.4',files:{'installers/fixture.exe':{size:fixture.length,sha256:createHash('sha256').update(fixture).digest('hex')}}}));
 const delivered=await handleEvaluation(request('download/installers/fixture.exe',tester.token));assert.equal(delivered.status,200);assert.match(delivered.headers.get('cache-control')!,/no-store/);assert.deepEqual(Buffer.from(await delivered.arrayBuffer()),fixture);
 assert.equal((await handleEvaluation(request('download/installers/fixture.exe'))).status,403);
 const head=await handleEvaluation(new Request(origin+'/api/evaluation/download/installers/fixture.exe',{method:'HEAD',headers:{cookie:cookie(tester.token)}}));assert.equal(head.status,200);assert.equal(await head.text(),'');
 await writeFile(artifact,Buffer.alloc(fixture.length,88));await utimes(artifact,new Date(),new Date(Date.now()+2000));assert.equal((await handleEvaluation(request('download/installers/fixture.exe',tester.token))).status,503);

 const content=await handleEvaluation(request('content/catalog.json',tester.token));assert.equal(content.status,200);assert.match(content.headers.get('cache-control')! ,/no-store/);
 assert.equal((await handleEvaluation(request('content/../../.env',tester.token))).status,404);
 assert.equal((await handleEvaluation(request('content/nonexistent.json',tester.token))).status,404);
 const pairing=await (await handleEvaluation(request('pairing-code',tester.token,{},tester.csrf))).json();
 const paired=await handleEvaluation(request('pair','',{code:pairing.code}));assert.equal(paired.status,200);const device=await paired.json();
 assert.ok(authorized(new Request(origin,{headers:{authorization:`Bearer ${device.token}`}})));
 assert.equal((await handleEvaluation(request('pair','',{code:pairing.code}))).status,403);
 setGrant(admin,'tester-sub',false);
 assert.equal(authorized(new Request(origin,{headers:{authorization:`Bearer ${device.token}`}})),undefined);
 assert.equal((await handleEvaluation(request('content/catalog.json',tester.token))).status,403);
 assert.equal((await handleEvaluation(request('pairing-code',tester.token,{},tester.csrf))).status,403);
 const forged=new Request(origin,{headers:{origin:'https://evil.example','x-csrf-token':tester.csrf}});assert.equal(csrfValid(forged,tester.csrf),false);
 assert.equal((await handleEvaluation(request('logout',tester.token,{},tester.csrf))).status,200);assert.equal((await handleEvaluation(request('downloads',tester.token))).status,401);
 process.env.AF_EDITION='public';assert.equal((await handleEvaluation(request('session',adminSession.token))).status,404);assert.equal(authorized(request('content/catalog.json',adminSession.token)),undefined);
 }finally{closeStore();for(const k of Object.keys(process.env))if(!(k in original))delete process.env[k];Object.assign(process.env,original);await rm(dir,{recursive:true,force:true});}
});
test('private source and derivative inventory includes every supplied section without exposing it in public assets',async()=>{
 const pin=JSON.parse(await readFile('content/evaluation/evaluation-resources-2026-10-16-v1/manifest.json','utf8'));
 assert.equal(pin.works,85);assert.deepEqual(pin.counts,{boc:27,concordia:1647,luther:1042});
 const search=JSON.parse(await readFile('content/evaluation/evaluation-resources-2026-10-16-v1/search-manifest.json','utf8'));
 for(const c of ['boc','concordia','luther'])assert.equal(search.counts[c].documents,pin.counts[c]);
 await assert.rejects(stat('app/public/evaluation-content'),{code:'ENOENT'});
 const base=JSON.parse(await readFile('app/desktop/src-tauri/tauri.conf.json','utf8')),evaluation=JSON.parse(await readFile('app/desktop/src-tauri/tauri.evaluation.conf.json','utf8'));
 assert.equal(evaluation.version,JSON.parse(await readFile('app/evaluation/version.json','utf8')).version);assert.notEqual(base.identifier,evaluation.identifier);assert.deepEqual(base.plugins.updater.endpoints,['https://ad-fontes.app/desktop-updates/stable/latest.json']);assert.deepEqual(evaluation.plugins.updater.endpoints,['https://eval.ad-fontes.app/api/evaluation/updates/latest.json']);
 const template=await readFile('deployment/evaluation/nginx.conf','utf8');assert.doesNotMatch(template,/alias\s/);assert.match(template,/proxy_cache off/);
});

test('Google flow binds state to the browser, checks nonce/audience, rotates sessions and rejects callback replay',async()=>{
 const {createRequire}=await import('node:module');const require=createRequire(new URL('../app/package.json',import.meta.url));const {OAuth2Client}=require('google-auth-library');
 const dir=await mkdtemp(join(tmpdir(),'ad-fontes-evaluation-oauth-')),original={...process.env};
 const proto=OAuth2Client.prototype,oldToken=proto.getToken,oldVerify=proto.verifyIdToken;let nonce='',observedAudience='';
 try{
 Object.assign(process.env,{AF_EDITION:'evaluation',EVALUATION_ORIGIN:origin,EVALUATION_DATABASE:join(dir,'evaluation.sqlite'),GOOGLE_CLIENT_ID:'test-audience',GOOGLE_CLIENT_SECRET:'fixture',EVALUATION_ADMIN_EMAILS:'larry.herzog@gmail.com'});
 proto.getToken=async()=>({tokens:{id_token:'explicit-test-fixture'}});proto.verifyIdToken=async(options:any)=>{observedAudience=options.audience;return {getPayload:()=>({sub:'verified-test-sub',email:'test@example.org',email_verified:true,nonce})};};
 const a=newSession(),b=newSession();
 const login=await handleEvaluation(new Request(origin+'/api/evaluation/login',{method:'POST',headers:{cookie:cookie(a.token),origin,'x-csrf-token':a.csrf}}));assert.equal(login.status,200);
 const google=new URL((await login.json()).url);nonce=google.searchParams.get('nonce')!;assert.equal(google.searchParams.get('code_challenge_method'),'S256');assert.equal(google.searchParams.get('redirect_uri'),origin+'/api/evaluation/callback');
 const callback=origin+'/api/evaluation/callback?code=fixture&state='+google.searchParams.get('state');
 assert.equal((await handleEvaluation(new Request(callback,{headers:{cookie:cookie(b.token)}}))).status,400);
 const success=await handleEvaluation(new Request(callback,{headers:{cookie:cookie(a.token)}}));assert.equal(success.status,303);assert.equal(observedAudience,'test-audience');assert.match(success.headers.get('set-cookie')!,/HttpOnly; SameSite=Lax/);
 assert.equal(store().prepare('SELECT * FROM sessions WHERE hash=?').get(digest(a.token)),undefined);
 assert.equal((await handleEvaluation(new Request(callback,{headers:{cookie:cookie(a.token)}}))).status,401);
 // A valid ID token with the wrong nonce must not complete admission or sign-in.
 const c=newSession();const second=await handleEvaluation(new Request(origin+'/api/evaluation/login',{method:'POST',headers:{cookie:cookie(c.token),origin,'x-csrf-token':c.csrf}}));const next=new URL((await second.json()).url);nonce='wrong';
 assert.equal((await handleEvaluation(new Request(origin+'/api/evaluation/callback?code=fixture&state='+next.searchParams.get('state'),{headers:{cookie:cookie(c.token)}}))).status,503);
 }finally{proto.getToken=oldToken;proto.verifyIdToken=oldVerify;closeStore();for(const k of Object.keys(process.env))if(!(k in original))delete process.env[k];Object.assign(process.env,original);await rm(dir,{recursive:true,force:true});}
});

test('Concordia heading links retain explicit ranges and decline unsupported or incidental references',async()=>{
 const {headingRange,sectionHeadingRange}=await import('../app/evaluation/heading-range.ts');
 assert.deepEqual(headingRange('Romans 3:21–31: The Righteousness of God'),{start:'ROM.3.21',end:'ROM.3.31'});
 assert.deepEqual(headingRange('Luke 9:51–10:24'),{start:'LUK.9.51',end:'LUK.10.24'});
 assert.equal(headingRange('An excursus mentioning Romans 3:21'),undefined);
 assert.equal(sectionHeadingRange({title:'Excursus: Another Topic',part:'Romans 1:18–4:25'}),undefined);
 assert.deepEqual(sectionHeadingRange({title:'Commentary',part:'Romans 3:21–31'}),{start:'ROM.3.21',end:'ROM.3.31'});
 assert.equal(headingRange('Textual Notes'),undefined);assert.equal(headingRange('Romans 99:1'),undefined);
});
