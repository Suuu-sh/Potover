import {readFile,rename,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {assertPublicScope,publicationScope} from './publication-scope.mjs';

export const COLLECTION_PATH='data/articles.json';
const PAGE_SIZE=500;
// Leave room for source lookups and metadata updates within D1 Free's 50-query limit.
const UPLOAD_BATCH_SIZE=5;

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
  const migrated=Boolean(database.snapshotAt)||database.articles.some(article=>typeof article.slug==='string');
  return database.articles.map((article,index)=>({
    ...article,
    // Preserve the initial public URLs, then retain D1 identity across reorder/title changes.
    slug:typeof article.slug==='string'&&/^[a-z0-9][a-z0-9-]{0,159}$/.test(article.slug)
      ?article.slug
      :migrated?`article-${createHash('sha256').update(article.originalUrl).digest('hex').slice(0,24)}`
        :articleSlug(article.title,index),
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

// Whitelist again when building public snapshots so even an older API response
// cannot accidentally publish source excerpts or media through a static build.
function publicArticle(article){
  return {
    slug:article.slug,
    source:article.source,
    sourceSlug:article.sourceSlug,
    sourceUrl:article.sourceUrl,
    title:article.title,
    originalUrl:article.originalUrl,
    publishedAt:article.publishedAt,
    language:article.language,
    contentType:article.contentType,
    classification:{difficulty:article.classification?.difficulty,tags:article.classification?.tags},
    category:article.category,
  };
}

export async function exportArticles({apiUrl,token,filePath=COLLECTION_PATH,outputPath=filePath,mode='internal',guardAgainstShrink=true,scope=publicationScope}={}){
  if(mode!=='internal'&&mode!=='public')throw new Error('Article export mode must be internal or public');
  if(mode==='internal'&&(typeof token!=='string'||!token.trim()))throw new Error('POTOVER_INGEST_TOKEN is required to export full articles from D1');
  if(mode==='public'&&resolve(outputPath)===resolve(filePath))throw new Error('Public article exports require a separate outputPath to preserve the private source dataset');
  const base=apiBase(apiUrl);
  const current=JSON.parse(await readFile(filePath,'utf8'));
  const requestOptions=mode==='internal'?{headers:{Authorization:`Bearer ${token}`}}:{};
  const sourcesResult=await requestJson(`${base}${mode==='internal'?'/api/sources/export':'/api/sources'}`,requestOptions);
  if(!Array.isArray(sourcesResult.sources)||sourcesResult.sources.length===0)throw new Error('D1 returned no sources; refusing to publish an empty snapshot');
  const endpoint=mode==='internal'?'/api/articles/export':'/api/articles';
  const first=await requestJson(`${base}${endpoint}?limit=${PAGE_SIZE}&offset=0`,requestOptions);
  const total=Number(first.total);
  if(!Number.isInteger(total)||total<=0)throw new Error('D1 returned no articles; refusing to publish an empty snapshot');
  if(!Array.isArray(first.articles)||first.articles.length===0||first.articles.length>total){
    throw new Error('D1 returned an invalid first article page; refusing to publish an incomplete snapshot');
  }
  if(mode==='public'&&total!==scope.articles.length){
    throw new Error(`D1 public snapshot has ${total} articles; approved scope requires exactly ${scope.articles.length}`);
  }
  if(mode==='internal'&&guardAgainstShrink&&Array.isArray(current.articles)&&total<current.articles.length){
    throw new Error(`D1 has ${total} articles but the current snapshot has ${current.articles.length}; seed/sync D1 before publishing`);
  }
  const articles=[...first.articles];
  while(articles.length<total){
    const offset=articles.length;
    const page=await requestJson(`${base}${endpoint}?limit=${PAGE_SIZE}&offset=${offset}`,requestOptions);
    if(Number(page.total)!==total||page.collectedAt!==first.collectedAt||!Array.isArray(page.articles)||page.articles.length===0){
      throw new Error('D1 changed while exporting; retry the snapshot after ingestion completes');
    }
    articles.push(...page.articles);
  }
  if(articles.length!==total||new Set(articles.map(article=>article.originalUrl)).size!==total){
    throw new Error('D1 export is incomplete or contains duplicate URLs; refusing to publish');
  }
  if(mode==='public')assertPublicScope(articles,sourcesResult.sources,scope);
  const collectedAt=first.collectedAt||new Date().toISOString();
  const snapshot={
    collectedAt,
    snapshotAt:new Date().toISOString(),
    sources:mode==='public'?sourcesResult.sources.map(source=>({slug:source.slug,name:source.name,url:source.url,language:source.language})):sourcesResult.sources,
    articles:mode==='public'?articles.map(publicArticle):articles,
  };
  const temporaryPath=`${outputPath}.tmp`;
  await writeFile(temporaryPath,`${JSON.stringify(snapshot,null,2)}\n`);
  await rename(temporaryPath,outputPath);
  console.log(`Exported ${articles.length} D1 articles across ${sourcesResult.sources.length} sources to ${outputPath}`);
  return {articles:articles.length,sources:sourcesResult.sources.length};
}
