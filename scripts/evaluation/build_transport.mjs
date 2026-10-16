/** Authenticated encrypted transport for private CI inputs. Key only in process environment. */
import {createCipheriv,createDecipheriv,createHash,randomBytes} from 'node:crypto';
import {readFileSync,writeFileSync} from 'node:fs';
const [mode,input,output,expected]=process.argv.slice(2);
const key=Buffer.from(process.env.EVALUATION_BUILD_KEY||'','base64');
if(key.length!==32)throw Error('A dedicated 256-bit evaluation build key is required');
const bytes=readFileSync(input);
if(mode==='encrypt'){
 const nonce=randomBytes(12),cipher=createCipheriv('aes-256-gcm',key,nonce);
 const encrypted=Buffer.concat([cipher.update(bytes),cipher.final()]);
 writeFileSync(output,Buffer.concat([nonce,cipher.getAuthTag(),encrypted]),{mode:0o600,flag:'wx'});
 console.log(createHash('sha256').update(bytes).digest('hex'));
}else if(mode==='decrypt'){
 if(!/^[a-f0-9]{64}$/.test(expected||''))throw Error('Exact prepared input SHA-256 required');
 const decipher=createDecipheriv('aes-256-gcm',key,bytes.subarray(0,12));decipher.setAuthTag(bytes.subarray(12,28));
 const plain=Buffer.concat([decipher.update(bytes.subarray(28)),decipher.final()]);
 if(createHash('sha256').update(plain).digest('hex')!==expected)throw Error('Prepared input SHA-256 mismatch');
 writeFileSync(output,plain,{mode:0o600,flag:'wx'});
 console.log('Authenticated private evaluation build input.');
}else throw Error('Expected encrypt or decrypt');
