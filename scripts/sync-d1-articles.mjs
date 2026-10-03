import {exportArticles,uploadArticles} from './d1-articles.mjs';

const [mode]=process.argv.slice(2);
const apiUrl=process.env.POTOVER_API_URL||process.env.NEXT_PUBLIC_POTOVER_API_URL;

if(!apiUrl){
  console.error('Set POTOVER_API_URL explicitly; uploads must never target production by accident.');
  process.exit(2);
}

if(mode==='upload')await uploadArticles({apiUrl,token:process.env.POTOVER_INGEST_TOKEN});
else if(mode==='export')await exportArticles({apiUrl,token:process.env.POTOVER_INGEST_TOKEN});
else if(mode==='sync'){
  await uploadArticles({apiUrl,token:process.env.POTOVER_INGEST_TOKEN});
  await exportArticles({apiUrl,token:process.env.POTOVER_INGEST_TOKEN});
}else{
  console.error('Usage: node scripts/sync-d1-articles.mjs <upload|export|sync>');
  process.exitCode=2;
}
