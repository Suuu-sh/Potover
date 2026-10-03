import {spawnSync} from 'node:child_process';
import {exportArticles} from './d1-articles.mjs';

if(process.env.POTOVER_PUBLICATION_READY!=='true'){
  throw new Error('Production publishing is paused. Set POTOVER_PUBLICATION_READY=true only after the privacy policy and source permissions are approved.');
}

const apiUrl=process.env.POTOVER_API_URL||process.env.NEXT_PUBLIC_POTOVER_API_URL;
if(!apiUrl)throw new Error('POTOVER_API_URL must be configured in the Pages build environment.');
await exportArticles({apiUrl});

const npm=process.platform==='win32'?'npm.cmd':'npm';
const result=spawnSync(npm,['run','build:production'],{
  stdio:'inherit',
  env:{...process.env,POTOVER_API_URL:apiUrl,NEXT_PUBLIC_POTOVER_API_URL:apiUrl},
});
if(result.error)throw result.error;
if(result.status!==0)process.exit(result.status??1);
