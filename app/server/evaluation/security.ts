import { randomBytes, createHash } from 'node:crypto';
export const opaque=()=>randomBytes(32).toString('base64url');
export const digest=(s:string)=>createHash('sha256').update(s).digest('hex');
export function origin(){
 const url=new URL(process.env.EVALUATION_ORIGIN || 'https://eval.ad-fontes.app');
 if(url.pathname!=='/'||url.search||url.hash||url.username||url.password||!(url.protocol==='https:'||(url.protocol==='http:'&&['localhost','127.0.0.1'].includes(url.hostname))))throw Error('Invalid evaluation origin');
 return url.origin;
}
export const cookieName=()=>origin().startsWith('https:')?'__Host-af-evaluation':'af-evaluation';
export const cookie=(token:string,seconds=2592000)=>`${cookieName()}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${seconds}${origin().startsWith('https:')?'; Secure':''}`;
export function sessionToken(request:Request){return (request.headers.get('cookie')||'').split(';').map(s=>s.trim()).find(s=>s.startsWith(cookieName()+'='))?.slice(cookieName().length+1)||'';}
export const csrfValid=(r:Request,csrf:string)=>r.headers.get('origin')===origin()&&r.headers.get('x-csrf-token')===csrf;
export const reply=(value:unknown,status=200,headers:Record<string,string>={})=>Response.json(value,{status,headers:{'Cache-Control':'private, no-store','Pragma':'no-cache','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer',...headers}});
export async function jsonBody(request:Request){
 if(!request.headers.get('content-type')?.startsWith('application/json'))throw Error('JSON required');
 const reader=request.body?.getReader();if(!reader)throw Error('Empty body');
 const chunks:Uint8Array[]=[];let size=0;
 for(;;){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>4096){await reader.cancel();throw Error('Too large');}chunks.push(value);}
 return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}
