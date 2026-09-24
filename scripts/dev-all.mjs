import {spawn} from 'node:child_process';

const npm=process.platform==='win32'?'npm.cmd':'npm';
const children=[];
let stopping=false;

function start(args,env={}){
  const child=spawn(npm,args,{stdio:'inherit',env:{...process.env,...env}});
  children.push(child);
  child.on('exit',(code,signal)=>{
    if(stopping)return;
    stopping=true;
    for(const sibling of children)if(sibling!==child)sibling.kill('SIGTERM');
    process.exit(code??(signal?1:0));
  });
}

function stop(){
  if(stopping)return;
  stopping=true;
  for(const child of children)child.kill('SIGTERM');
}

process.on('SIGINT',()=>{stop();process.exit(0)});
process.on('SIGTERM',()=>{stop();process.exit(0)});

start(['run','dev:api']);
start(['run','dev','--','--hostname','127.0.0.1','--port','3000'],{NEXT_PUBLIC_POTOVER_API_URL:'http://127.0.0.1:8787'});
