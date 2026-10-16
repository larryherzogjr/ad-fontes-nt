/** Explicit edition entry point; normal build/dev commands stay public. */
import {existsSync,readFileSync} from 'node:fs';
import {join} from 'node:path';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../..',import.meta.url));
const mode=process.argv[2]||'dev',extra=process.argv.slice(3);
if(JSON.parse(readFileSync(join(root,'app/evaluation/version.json'),'utf8')).version!==JSON.parse(readFileSync(join(root,'app/desktop/src-tauri/tauri.evaluation.conf.json'),'utf8')).version)throw Error('Evaluation UI/native versions must match.');
if(mode==='dev'&&existsSync(join(root,'deployment/evaluation/.env')))process.loadEnvFile(join(root,'deployment/evaluation/.env'));
const env={...process.env,AF_EDITION:'evaluation',
 ...(mode==='dev'?{EVALUATION_ORIGIN:process.env.EVALUATION_ORIGIN||'http://localhost:3046',EVALUATION_ADMIN_EMAILS:process.env.EVALUATION_ADMIN_EMAILS||'larry.herzog@gmail.com',EVALUATION_DATABASE:process.env.EVALUATION_DATABASE||join(root,'private/evaluation/access.sqlite'),EVALUATION_CONTENT_DIR:process.env.EVALUATION_CONTENT_DIR||join(root,'private/evaluation/content/evaluation-resources-2026-10-16-v1')}:{}),
};
async function run(command,args){await new Promise((resolve,reject)=>{const p=spawn(command,args,{cwd:root,env,stdio:'inherit'});p.on('error',reject);p.on('exit',c=>c===0?resolve():reject(Error(`${command} failed (${c})`)));});}
if(!['dev','build','desktop-web','desktop-preview','desktop-build','import'].includes(mode))throw Error('Unknown evaluation command');
if(mode==='import'||mode==='dev'||mode==='build'||mode==='desktop-web'||mode==='desktop-build'){
 await run('python3',['scripts/evaluation/import_resources.py']);await run(process.execPath,['scripts/evaluation/build_search.mts']);
}
if(mode==='dev')await run('npm',['--prefix','app','run','dev','--','--host','127.0.0.1','--port','3046',...extra]);
if(mode==='build')await run('npm',['run','build',...extra]);
if(mode==='desktop-web')await run('npm',['run','desktop:build:web',...extra]);
if(mode==='desktop-preview')await run('npm',['run','desktop:preview',...extra]);
if(mode==='desktop-build'){
 if(!['darwin','win32'].includes(process.platform))throw Error('Evaluation native packaging is prepared for macOS and Windows only.');
 const nativeConfig=process.platform==='darwin'?'src-tauri/tauri.evaluation.macos.conf.json':'src-tauri/tauri.evaluation.windows.conf.json';
 await run(process.execPath,['scripts/desktop.mjs','build','--config','src-tauri/tauri.evaluation.conf.json','--config',nativeConfig,...extra]);
}
