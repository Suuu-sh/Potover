import {spawnSync} from 'node:child_process';

// Override local .env files so a production artifact never calls loopback APIs.
const apiUrl=process.env.POTOVER_API_URL||'https://potover-api.suuu-sh.workers.dev';
const url=new URL(apiUrl);
if(url.protocol!=='https:'||url.username||url.password||url.pathname!=='/'||url.search||url.hash){
  throw new Error('Production POTOVER_API_URL must be an HTTPS origin without credentials.');
}
const result=spawnSync(process.execPath,['node_modules/next/dist/bin/next','build'],{
  stdio:'inherit',env:{...process.env,NEXT_PUBLIC_POTOVER_API_URL:url.origin},
});
if(result.error)throw result.error;
process.exit(result.status??1);
