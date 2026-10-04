import {readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {readFileSync} from 'node:fs';
import {publicationScope,selectApprovedDataset} from './publication-scope.mjs';
import {createTopicArtLookup} from '../packages/publication/topic-art.mjs';
const artManifest=JSON.parse(readFileSync(new URL('../data/owned-topic-art.json',import.meta.url),'utf8'));
const artFor=createTopicArtLookup(artManifest);

export const PUBLIC_ARTICLES_PATH='data/articles.public.json';
const text=value=>typeof value==='string'?value:'';

// Allowlist before bundling: hiding fields in React would still ship the raw JSON.
export function projectPublicArticles(dataset,{scope=publicationScope}={}){
  dataset=selectApprovedDataset(dataset,scope);
  return {
    collectedAt:text(dataset.collectedAt),
    ...(dataset.snapshotAt?{snapshotAt:text(dataset.snapshotAt)}:{}),
    sources:dataset.sources.map(source=>({slug:text(source.slug),name:text(source.name),url:text(source.url),language:text(source.language)})),
    articles:dataset.articles.map(article=>({
      slug:article.slug,
      illustration:artFor(article),
      source:text(article.source),sourceSlug:text(article.sourceSlug)||'gto-wizard',sourceUrl:text(article.sourceUrl),
      title:text(article.title),originalUrl:text(article.originalUrl),publishedAt:article.publishedAt?text(article.publishedAt):null,
      language:text(article.language),contentType:article.contentType==='video'?'video':'article',
      classification:{difficulty:text(article.classification?.difficulty)||'beginner',tags:Array.isArray(article.classification?.tags)?article.classification.tags.filter(tag=>typeof tag==='string'):[]},
    })),
  };
}

export async function preparePublicArticles({inputPath='data/articles.json',outputPath=PUBLIC_ARTICLES_PATH,scope=publicationScope}={}){
  if(resolve(outputPath)===resolve('data/articles.json'))throw new Error('Public projection must not overwrite the original dataset');
  if(resolve(inputPath)===resolve(outputPath)&&resolve(outputPath)!==resolve(PUBLIC_ARTICLES_PATH))throw new Error('Public projection requires a separate output file');
  const dataset=JSON.parse(await readFile(inputPath,'utf8'));
  const result=projectPublicArticles(dataset,{scope});
  const contents=`${JSON.stringify(result)}\n`;
  let existing;
  try{existing=await readFile(outputPath,'utf8')}catch(error){if(error.code!=='ENOENT')throw error}
  if(existing!==contents)await writeFile(outputPath,contents);
  return result;
}
