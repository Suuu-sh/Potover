import {readFileSync} from 'node:fs';

// The manifest pins the initial release identities and their original global-index
// slugs. Never regenerate slugs after filtering, sorting, or exporting from D1.
export const publicationScope=JSON.parse(readFileSync(new URL('../data/publication-scope.json',import.meta.url),'utf8'));

const hasText=value=>typeof value==='string'&&value.trim().length>0;
const fail=message=>{throw new Error(`Publication scope: ${message}`)};

function indexScope(scope){
  if(!Array.isArray(scope?.sources)||!Array.isArray(scope?.articles))fail('invalid manifest');
  const sources=new Set();
  const byUrl=new Map();
  const bySlug=new Map();
  for(const slug of scope.sources){
    if(!hasText(slug))fail('invalid manifest source');
    if(sources.has(slug))fail(`duplicate manifest source ${slug}`);
    sources.add(slug);
  }
  for(const article of scope.articles){
    if(!hasText(article?.originalUrl)||!hasText(article?.slug)||!hasText(article?.sourceSlug))fail('invalid manifest article identity');
    if(!sources.has(article.sourceSlug))fail(`manifest article has unapproved source ${article.sourceSlug}`);
    if(byUrl.has(article.originalUrl))fail(`duplicate manifest URL ${article.originalUrl}`);
    if(bySlug.has(article.slug))fail(`duplicate manifest slug ${article.slug}`);
    byUrl.set(article.originalUrl,article);
    bySlug.set(article.slug,article);
  }
  return {sources,byUrl,bySlug};
}

function indexSources(sources,approved,{allowExcluded=false}={}){
  if(!Array.isArray(sources))fail('invalid sources');
  const bySlug=new Map();
  for(const source of sources){
    if(!approved.has(source?.slug)){
      if(allowExcluded)continue;
      fail(`unexpected source ${source?.slug}`);
    }
    if(bySlug.has(source.slug))fail(`duplicate source ${source.slug}`);
    bySlug.set(source.slug,source);
  }
  for(const slug of approved){
    if(!bySlug.has(slug))fail(`missing approved source ${slug}`);
  }
  return bySlug;
}

// Preserve complete rows for internal seeds, then apply a separate field
// whitelist for public artifacts. Copies must not modify the archived collection.
export function selectApprovedDataset(dataset,scope=publicationScope){
  if(!Array.isArray(dataset?.articles)||!Array.isArray(dataset?.sources))fail('invalid article dataset');
  const approved=indexScope(scope);
  const sources=indexSources(dataset.sources,approved.sources,{allowExcluded:true});
  const articles=new Map();
  for(const article of dataset.articles){
    const identity=approved.byUrl.get(article?.originalUrl);
    if(!identity){
      if(approved.bySlug.has(article?.slug))fail(`URL mismatch for approved slug ${article.slug}`);
      continue;
    }
    if(article.sourceSlug!==identity.sourceSlug)fail(`source mismatch for ${identity.originalUrl}`);
    if(article.slug!=null&&article.slug!==''&&article.slug!==identity.slug)fail(`slug mismatch for ${identity.originalUrl}`);
    if(articles.has(identity.originalUrl))fail(`duplicate approved URL ${identity.originalUrl}`);
    articles.set(identity.originalUrl,{...article,slug:identity.slug});
  }
  for(const identity of scope.articles){
    if(!articles.has(identity.originalUrl))fail(`missing approved article ${identity.originalUrl}`);
  }
  return structuredClone({
    ...dataset,
    sources:scope.sources.map(slug=>sources.get(slug)),
    articles:scope.articles.map(identity=>articles.get(identity.originalUrl)),
  });
}

// Counts alone cannot catch a missing row replaced by an extra or duplicate row.
// Validate the exact URL/slug/source identities and the complete source set.
export function assertPublicScope(articles,sources,scope=publicationScope){
  if(!Array.isArray(articles))fail('invalid articles');
  const approved=indexScope(scope);
  indexSources(sources,approved.sources);
  const seenUrls=new Set();
  const seenSlugs=new Set();
  for(const article of articles){
    const identity=approved.byUrl.get(article?.originalUrl);
    if(!identity)fail(`unexpected article URL ${article?.originalUrl}`);
    if(seenUrls.has(article.originalUrl))fail(`duplicate article URL ${article.originalUrl}`);
    if(seenSlugs.has(article.slug))fail(`duplicate article slug ${article.slug}`);
    if(article.sourceSlug!==identity.sourceSlug)fail(`source mismatch for ${identity.originalUrl}`);
    if(article.slug!==identity.slug)fail(`slug mismatch for ${identity.originalUrl}`);
    seenUrls.add(article.originalUrl);
    seenSlugs.add(article.slug);
  }
  for(const identity of scope.articles){
    if(!seenUrls.has(identity.originalUrl))fail(`missing approved article ${identity.originalUrl}`);
  }
}
