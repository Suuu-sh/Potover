import {readFile,rename,writeFile} from 'node:fs/promises';

export const COLLECTION_PATH='data/articles.json';
const PAGE_SIZE=500;
const UPLOAD_BATCH_SIZE=75;

const articleSlug=(title,index)=>{
  const titleSlug=String(title||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,80);
  return `${titleSlug||'gtowizard-content'}-${index+1}`;
};

async function requestJson(url,options={}){
  const response=await fetch(url,{...options,signal:AbortSignal.timeout(30000)});
  if(!response.ok){
    const message=(await response.text()).slice(0,500);
    throw new Error(`Potover API ${response.status} at ${url}: ${message}`);
  }
  return response.json();
}

function apiBase(value){
  if(typeof value!=='string'||!value.trim())throw new Error('POTOVER_API_URL must be set explicitly');
  const url=value.trim().replace(/\/+$/,'');
  let parsed;
  try{parsed=new URL(url)}catch{throw new Error('POTOVER_API_URL must be a valid HTTPS URL or local HTTP URL')}
  const localHttp=parsed.protocol==='http:'&&['127.0.0.1','localhost'].includes(parsed.hostname);
  if((parsed.protocol!=='https:'&&!localHttp)||parsed.username||parsed.password||parsed.search||parsed.hash||parsed.pathname!=='/'){
    throw new Error('POTOVER_API_URL must use HTTPS; HTTP is allowed only for localhost development');
  }
  return parsed.origin;
}

function withStableSlugs(database){
  return database.articles.map((article,index)=>({
    ...article,
    slug:articleSlug(article.title,index),
    sourceSlug:article.sourceSlug||database.sources.find(source=>source.name===article.source)?.slug||'gto-wizard',
    summary:String(article.summary||article.title||'').slice(0,2000),
  }));
}

export async function uploadArticles({apiUrl,token,filePath=COLLECTION_PATH}={}){
  if(!token)throw new Error('POTOVER_INGEST_TOKEN is required to sync articles to D1');
  const base=apiBase(apiUrl);
  const database=JSON.parse(await readFile(filePath,'utf8'));
  if(!Array.isArray(database.sources)||!Array.isArray(database.articles))throw new Error(`${filePath} is not a Potover article dataset`);
  if(database.articles.length===0)throw new Error('Refusing to upload an empty article dataset');
  const articles=withStableSlugs(database);
  for(let offset=0;offset<articles.length;offset+=UPLOAD_BATCH_SIZE){
    const chunk=articles.slice(offset,offset+UPLOAD_BATCH_SIZE);
    const isLastBatch=offset+chunk.length===articles.length;
    const result=await requestJson(`${base}/api/articles`,{
      method:'POST',
      headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},
      body:JSON.stringify({
        // Only mark the dataset as freshly collected after every article batch
        // has been accepted by D1.
        ...(isLastBatch?{collectedAt:database.collectedAt||new Date().toISOString()}:{}),
        sources:offset===0?database.sources:[],
        articles:chunk,
      }),
    });
    if(result.count!==chunk.length)throw new Error(`D1 acknowledged ${result.count} of ${chunk.length} articles`);
    console.log(`D1 upserted ${Math.min(offset+chunk.length,articles.length)}/${articles.length} articles`);
  }
  return {articles:articles.length,sources:database.sources.length};
}

export async function exportArticles({apiUrl,filePath=COLLECTION_PATH,guardAgainstShrink=true}={}){
  const base=apiBase(apiUrl);
  const current=JSON.parse(await readFile(filePath,'utf8'));
  const sourcesResult=await requestJson(`${base}/api/sources`);
  if(!Array.isArray(sourcesResult.sources)||sourcesResult.sources.length===0)throw new Error('D1 returned no sources; refusing to publish an empty snapshot');
  const first=await requestJson(`${base}/api/articles?limit=${PAGE_SIZE}&offset=0`);
  const total=Number(first.total);
  if(!Number.isInteger(total)||total<=0)throw new Error('D1 returned no articles; refusing to publish an empty snapshot');
  if(!Array.isArray(first.articles)||first.articles.length===0||first.articles.length>total){
    throw new Error('D1 returned an invalid first article page; refusing to publish an incomplete snapshot');
  }
  if(guardAgainstShrink&&Array.isArray(current.articles)&&total<current.articles.length){
    throw new Error(`D1 has ${total} articles but the current snapshot has ${current.articles.length}; seed/sync D1 before publishing`);
  }
  const articles=[...first.articles];
  for(let offset=articles.length;offset<total;offset+=PAGE_SIZE){
    const page=await requestJson(`${base}/api/articles?limit=${PAGE_SIZE}&offset=${offset}`);
    if(Number(page.total)!==total||!Array.isArray(page.articles)||page.articles.length===0){
      throw new Error('D1 changed while exporting; retry the snapshot after ingestion completes');
    }
    articles.push(...page.articles);
  }
  if(articles.length!==total||new Set(articles.map(article=>article.originalUrl)).size!==total){
    throw new Error('D1 export is incomplete or contains duplicate URLs; refusing to publish');
  }
  const collectedAt=first.collectedAt||new Date().toISOString();
  const snapshot={
    collectedAt,
    snapshotAt:new Date().toISOString(),
    sources:sourcesResult.sources,
    articles,
  };
  const temporaryPath=`${filePath}.tmp`;
  await writeFile(temporaryPath,`${JSON.stringify(snapshot,null,2)}\n`);
  await rename(temporaryPath,filePath);
  console.log(`Exported ${articles.length} D1 articles across ${sourcesResult.sources.length} sources to ${filePath}`);
  return {articles:articles.length,sources:sourcesResult.sources.length};
}
