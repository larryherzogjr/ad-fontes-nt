/** Prepare private immutable delivery metadata from independently verified signed evaluation artifacts. */
import {readFile,writeFile,mkdir,copyFile,stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {basename,join,resolve} from 'node:path';
const args:Record<string,string>={};for(let i=2;i<process.argv.length;i+=2){if(!process.argv[i].startsWith('--')||!process.argv[i+1])throw Error('Expected --key value');args[process.argv[i].slice(2)]=process.argv[i+1];}
const version=args.version;if(!/^\d+\.\d+\.\d+$/.test(version||''))throw Error('Valid version required');
// Explicit release verification record, never treat a filename or signature's existence as verification.
if(!args['verification-record'])throw Error('Exact-artifact verification record required');
const evidence=JSON.parse(await readFile(args['verification-record'],'utf8'));
if(evidence.edition!=='evaluation'||evidence.identifier!=='app.ad-fontes.evaluation'||evidence.version!==version||! /^[a-f0-9]{40}$/.test(evidence.nativeSourceCommit||'')||evidence.resourceReleaseId!=='evaluation-resources-2026-10-16-v1'||!evidence.macNotarizationVerified||!evidence.windowsAuthenticodeVerified||!evidence.updaterSignaturesVerified||!evidence.installIsolationVerified)throw Error('Complete exact-artifact verification record required');
const output=args.output;if(!output||!resolve(output).includes('evaluation')||resolve(output).includes('/public/'))throw Error('Private evaluation output directory required');await mkdir(output,{recursive:true});const releaseDirectory=join(output,'releases',version);await mkdir(releaseDirectory,{recursive:false});await mkdir(join(output,'installers'),{recursive:true});
let previous:Record<string,{sha256:string;size:number}>={};try{previous=JSON.parse(await readFile(join(output,'publication.json'),'utf8')).files;}catch(e:any){if(e.code!=='ENOENT')throw e;}
const files:Record<string,{sha256:string;size:number}>={...previous},platforms:Record<string,{url:string;signature:string}>={};
async function add(key:string,path:string){const source=args[key];if(!source)throw Error('Missing '+key);if(!(await stat(source)).isFile())throw Error('Not a file');const bytes=await readFile(source),sha256=createHash('sha256').update(bytes).digest('hex');if(evidence.sha256[key]!==sha256)throw Error('Artifact differs from verification record');await copyFile(source,join(output,path),2);files[path]={sha256,size:bytes.length};return bytes;}
for(const [platform,key,suffix] of [['darwin-aarch64','mac-update','.app.tar.gz'],['windows-x86_64','windows-installer','.exe']]){
 if(!basename(args[key]||'').endsWith(suffix))throw Error('Unexpected update artifact');const path=`releases/${version}/ad-fontes-evaluation-${version}-${platform}${suffix}`;await add(key,path);const signatureBytes=await readFile(args[key+'-signature']);if(createHash('sha256').update(signatureBytes).digest('hex')!==evidence.sha256[key+'-signature'])throw Error('Signature differs from verification record');const signature=signatureBytes.toString('utf8').trim();if(!signature||signature.includes('\n'))throw Error('Invalid signature');platforms[platform]={url:'https://eval.ad-fontes.app/api/evaluation/download/'+path,signature};
}
await add('mac-installer',`installers/Ad-Fontes-Evaluation-macOS-${version}.dmg`);
await add('windows-installer',`installers/Ad-Fontes-Evaluation-Windows-${version}.exe`);
const latest=Buffer.from(JSON.stringify({edition:'evaluation',identifier:'app.ad-fontes.evaluation',version,notes:args.notes||'Private evaluation update',pub_date:new Date().toISOString(),platforms})+'\n');await writeFile(join(output,'latest.json'),latest);files['latest.json']={sha256:createHash('sha256').update(latest).digest('hex'),size:latest.length};
const publication=JSON.stringify({edition:'evaluation',version,files})+'\n';await writeFile(join(output,'publication.json.next'),publication);const {rename}=await import('node:fs/promises');await rename(join(output,'publication.json.next'),join(output,'publication.json'));
console.log('Prepared private evaluation publication '+version+'. No public destination changed.');
