import {DatabaseSync} from 'node:sqlite';
import {chmod,mkdir} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
const source=process.env.EVALUATION_DATABASE,target=process.argv[2];
if(!source||!target||!resolve(source).includes('evaluation')||!resolve(target).includes('evaluation')||resolve(target)===resolve(source))throw Error('Explicit dedicated evaluation source and new private backup path required');
await mkdir(dirname(resolve(target)),{recursive:true,mode:0o700});
const oldMask=process.umask(0o077);
const db=new DatabaseSync(source);try{db.prepare('VACUUM INTO ?').run(resolve(target));await chmod(target,0o600);}finally{db.close();process.umask(oldMask);}
console.log('Evaluation access backup created. Contains private identities and sessions; keep outside public assets.');
