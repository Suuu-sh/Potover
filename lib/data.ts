import collected from '@/data/articles.json';
import {buildFallbackHeadings,cleanArticleSummary} from '@/lib/article-insights';
import type {ArticleHeading} from '@/lib/article-insights';
export type Article={slug:string;title:string;source:string;sourceSlug:string;summary:string;headings:ArticleHeading[];difficulty:string;language:string;publishedAt:string;minutes:number;tags:string[];category:string;url:string;imageUrl?:string|null;contentType:'article'|'video'};
const slugify=(v:string)=>v.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,80);
export const articles:Article[]=collected.articles.map((item,index)=>{
  const insight={title:item.title,summary:item.summary,tags:item.classification.tags};
  const durationSeconds='durationSeconds' in item&&typeof item.durationSeconds==='number'?item.durationSeconds:null;
  const contentType=item.contentType==='video'?'video':'article';
  const headings:ArticleHeading[]=Array.isArray(item.headings)&&item.headings.length?item.headings as ArticleHeading[]:buildFallbackHeadings(insight);
  const summaryFallback=headings.slice(0,2).map(heading=>heading.text).join('。');
  return {slug:`${slugify(item.title)||'gtowizard-content'}-${index+1}`,title:item.title,source:item.source,sourceSlug:item.sourceSlug||'gto-wizard',summary:cleanArticleSummary(item.summary,summaryFallback||item.title),headings,difficulty:item.classification.difficulty[0].toUpperCase()+item.classification.difficulty.slice(1),language:item.language,publishedAt:item.publishedAt?.slice(0,10)??'公開日不明',minutes:contentType==='video'&&durationSeconds?Math.max(1,Math.ceil(durationSeconds/60)):Math.max(3,Math.ceil(item.summary.length/90)),tags:item.classification.tags,category:item.classification.tags.includes('mtt')?'Tournament':'GTO',url:item.originalUrl,imageUrl:item.imageUrl,contentType};
});
export const sources=collected.sources.map(source=>({...source,description:`${source.name}から収集したポーカー戦略コンテンツです。`,language:source.language}));
export const collectedAt=collected.collectedAt;
