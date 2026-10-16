import { store, type User, type Session } from './store.ts';
import { cookie, digest, opaque, sessionToken } from './security.ts';
export const now=()=>Math.floor(Date.now()/1000);
export const enabled=()=>process.env.AF_EDITION==='evaluation';
export function session(request:Request):Session|undefined{
 const token=sessionToken(request);if(!/^[\w-]{43}$/.test(token))return;
 return store().prepare('SELECT * FROM sessions WHERE hash=? AND expires>?').get(digest(token),now()) as Session|undefined;
}
export function userFor(s:Session|undefined){return s?.sub?store().prepare('SELECT * FROM users WHERE sub=?').get(s.sub) as User|undefined:undefined;}
export function authorized(request:Request):User|undefined{
 if(!enabled())return;
 const bearer=request.headers.get('authorization')?.match(/^Bearer ([\w-]{43})$/)?.[1];
 const u=bearer?store().prepare('SELECT u.* FROM devices d JOIN users u ON u.sub=d.sub WHERE d.hash=? AND d.expires>?').get(digest(bearer),now()) as User|undefined:userFor(session(request));
 return u?.admitted ? u : undefined;
}
export function newSession(sub:string|null=null){
 const token=opaque(),csrf=opaque(),expires=now()+(sub?2592000:1800),db=store();
 for(const table of ['sessions','oauth','pairing','devices'])db.prepare(`DELETE FROM ${table} WHERE expires<?`).run(now());
 db.prepare('INSERT INTO sessions VALUES(?,?,?,?)').run(digest(token),sub,csrf,expires);
 return {token,csrf,header:cookie(token,sub?2592000:1800)};
}
export function audit(actor:string,subject:string,action:string){store().prepare('INSERT INTO audit(at,actor,subject,action) VALUES(?,?,?,?)').run(new Date().toISOString(),actor,subject,action);}
/** Only called after Google ID-token and nonce verification. Subject is identity, not email. */
export function completeIdentity(s:Session,identity:{sub:string;email:string;name:string}){
 const db=store(),bootstrap=(process.env.EVALUATION_ADMIN_EMAILS||'').split(',').map(s=>s.trim().toLowerCase()).filter(Boolean);
 const prior=db.prepare('SELECT * FROM users WHERE sub=?').get(identity.sub) as User|undefined;
 const admin=prior?.admin ?? Number(bootstrap.includes(identity.email.toLowerCase()));
 db.prepare('INSERT INTO users(sub,email,name,admin) VALUES(?,?,?,?) ON CONFLICT(sub) DO UPDATE SET email=excluded.email,name=excluded.name').run(identity.sub,identity.email,identity.name,admin);
 const fresh=newSession(identity.sub);db.prepare('DELETE FROM sessions WHERE hash=?').run(s.hash);return fresh;
}
export function rateLimit(key:string,maximum:number){
 const row=store().prepare(`INSERT INTO limits VALUES(?,?,1) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN window<? THEN 1 ELSE count+1 END,window=CASE WHEN window<? THEN excluded.window ELSE window END RETURNING count`).get(key,now(),now()-3600,now()-3600) as {count:number};return row.count<=maximum;
}
export function setGrant(actor:User,sub:string,grant:boolean){
 const db=store();if(!actor.admin)throw Error('Admin required');
 const target=db.prepare('SELECT sub FROM users WHERE sub=?').get(sub);if(!target)throw Error('Unknown user');
 db.exec('BEGIN IMMEDIATE');try{
 db.prepare('UPDATE users SET admitted=?,confirmed_at=?,confirmed_by=? WHERE sub=?').run(Number(grant),grant?new Date().toISOString():null,grant?actor.sub:null,sub);
 if(!grant){db.prepare('DELETE FROM devices WHERE sub=?').run(sub);db.prepare('DELETE FROM pairing WHERE sub=?').run(sub);}
 audit(actor.sub,sub,grant?'grant:manual-Logos-eligibility-confirmed':'revoke');db.exec('COMMIT');
 }catch(e){db.exec('ROLLBACK');throw e;}
}
