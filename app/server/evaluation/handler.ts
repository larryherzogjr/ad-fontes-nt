import { OAuth2Client } from 'google-auth-library';
import { store, type User } from './store.ts';
import { enabled, now, session, userFor, authorized, newSession, completeIdentity, setGrant, rateLimit, audit } from './access.ts';
import { opaque, digest, origin, cookie, csrfValid, reply, jsonBody } from './security.ts';
import { content, download, downloadList } from './files.ts';
const ready=()=>enabled()&&!!(process.env.GOOGLE_CLIENT_ID&&process.env.GOOGLE_CLIENT_SECRET&&process.env.EVALUATION_DATABASE&&process.env.EVALUATION_ADMIN_EMAILS);
const google=()=>new OAuth2Client(process.env.GOOGLE_CLIENT_ID,process.env.GOOGLE_CLIENT_SECRET,origin()+'/api/evaluation/callback');
function redirect(header:string){return new Response(null,{status:303,headers:{Location:origin()+'/evaluation','Set-Cookie':header,'Cache-Control':'no-store','Referrer-Policy':'no-referrer'}});}
export async function handleEvaluation(request:Request):Promise<Response>{
 try{
 if(!enabled())return reply({error:'Not found'},404);
 const url=new URL(request.url),path=url.pathname.replace(/^\/api\/evaluation\/?/,'');
 if(!ready())return reply({error:'Evaluation sign-in is not configured yet.',enabled:false},503);
 if(path==='pair'&&request.method==='POST'){
  if(!rateLimit('pair',100))return reply({error:'Try again later.'},429);
  const body=await jsonBody(request);if(typeof body.code!=='string'||!/^[\w-]{43}$/.test(body.code))return reply({error:'Invalid pairing code'},400);
  const db=store();const pair=db.prepare('DELETE FROM pairing WHERE hash=? AND expires>? RETURNING sub').get(digest(body.code),now()) as {sub:string}|undefined;
  const user=pair?db.prepare('SELECT * FROM users WHERE sub=?').get(pair.sub) as User|undefined:undefined;
  if(!user?.admitted)return reply({error:'The pairing code expired or access is unavailable.'},403);
  const token=opaque();db.prepare('INSERT INTO devices VALUES(?,?,?,?)').run(digest(token),user.sub,'Evaluation desktop',now()+2592000);audit(user.sub,user.sub,'desktop-paired');return reply({token,expiresAt:now()+2592000});
 }
 if(path.startsWith('content/')||path.startsWith('download/')||path==='updates/latest.json'){
  if(!['GET','HEAD'].includes(request.method))return reply({error:'Not found'},404);
  if(!authorized(request))return reply({error:'Approved evaluation access required.'},403);
  if(path.startsWith('content/'))return await content(path.slice(8));
  return await download(path==='updates/latest.json'?'latest.json':path.slice(9),request.method==='HEAD');
 }
 let s=session(request);
 if(path==='session'&&request.method==='GET'){
  const u=userFor(s);if(!s){const fresh=newSession();return reply({enabled:true,user:null,csrf:fresh.csrf},200,{'Set-Cookie':fresh.header});}
  return reply({enabled:true,user:u?{sub:u.sub,email:u.email,name:u.name,admin:!!u.admin,admitted:!!u.admitted,confirmedAt:u.confirmed_at}:null,csrf:s.csrf});
 }
 if(!s)return reply({error:'Sign in again to continue.'},401);
 if(path==='callback'&&request.method==='GET'){
  const row=store().prepare('DELETE FROM oauth WHERE state=? AND session=? AND expires>? RETURNING nonce,verifier').get(digest(url.searchParams.get('state')||''),s.hash,now()) as {nonce:string;verifier:string}|undefined;
  const code=url.searchParams.get('code');if(!row||!code)return reply({error:'Sign-in expired or could not be verified. Return to evaluation access and try again.'},400);
  const client=google(),{tokens}=await client.getToken({code,codeVerifier:row.verifier});if(!tokens.id_token)throw Error('Missing ID token');
  const payload=(await client.verifyIdToken({idToken:tokens.id_token,audience:process.env.GOOGLE_CLIENT_ID})).getPayload();
  if(!payload||!payload.sub||!payload.email||!payload.email_verified||(payload as unknown as {nonce:string}).nonce!==row.nonce)throw Error('Invalid identity');
  return redirect(completeIdentity(s,{sub:payload.sub,email:payload.email,name:payload.name||payload.email}).header);
 }
 const u=userFor(s);
 if(path==='users'&&request.method==='GET'){
  if(!u?.admin)return reply({error:'Administrator access required.'},403);
  return reply({users:store().prepare('SELECT sub,email,name,admin,admitted,confirmed_at,confirmed_by FROM users ORDER BY email').all(),audit:store().prepare('SELECT at,actor,subject,action FROM audit ORDER BY id DESC LIMIT 100').all()});
 }
 if(path==='downloads'&&request.method==='GET')return u?.admitted?downloadList():reply({error:'Approved evaluation access required.'},403);
 if(request.method!=='POST')return reply({error:'Not found'},404);
 if(!csrfValid(request,s.csrf))return reply({error:'Reload this page and try again.'},403);
 if(path==='login'){
  if(!rateLimit('login',100))return reply({error:'Try again later.'},429);
  const state=opaque(),nonce=opaque(),client=google(),{codeVerifier,codeChallenge}=await client.generateCodeVerifierAsync();
  store().prepare('DELETE FROM oauth WHERE session=?').run(s.hash);
  store().prepare('INSERT INTO oauth VALUES(?,?,?,?,?)').run(digest(state),s.hash,nonce,codeVerifier,now()+600);
  return reply({url:client.generateAuthUrl({scope:['openid','email','profile'],state,nonce,code_challenge:codeChallenge,code_challenge_method:'S256' as never,prompt:'select_account'})});
 }
 if(path==='logout'){store().prepare('DELETE FROM sessions WHERE hash=?').run(s.hash);return reply({ok:true},200,{'Set-Cookie':cookie('',0)});}
 if(path==='grant'){
  if(!u?.admin)return reply({error:'Administrator access required.'},403);
  const b=await jsonBody(request);if(typeof b.sub!=='string'||typeof b.grant!=='boolean'||(b.grant&&b.eligibilityConfirmed!==true))return reply({error:'Confirm the active Logos subscription covers all evaluation resources before granting access.'},400);
  if(!store().prepare('SELECT sub FROM users WHERE sub=?').get(b.sub))return reply({error:'User not found'},404);
  setGrant(u,b.sub,b.grant);return reply({ok:true});
 }
 if(path==='pairing-code'){
  if(!u?.admitted)return reply({error:'Approved evaluation access required.'},403);
  store().prepare('DELETE FROM pairing WHERE sub=?').run(u.sub);const code=opaque();store().prepare('INSERT INTO pairing VALUES(?,?,?)').run(digest(code),u.sub,now()+300);return reply({code,expiresIn:300});
 }
 return reply({error:'Not found'},404);
 }catch{return reply({error:'Evaluation service is unavailable. Please retry.'},503);}
}
