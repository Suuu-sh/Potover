import collected from '@/data/articles.public.json';
import {readOwnedIllustration,type OwnedIllustration} from '@/packages/publication/topic-art.mjs';

export type Article={slug:string;title:string;source:string;sourceSlug:string;difficulty:string;language:string;publishedAt:string;tags:string[];category:string;url:string;contentType:'article'|'video';illustration?:OwnedIllustration};
export const articles:Article[]=collected.articles.map(item=>({
  illustration:readOwnedIllustration('illustration' in item?item.illustration:undefined),
  slug:item.slug,title:item.title,source:item.source,sourceSlug:item.sourceSlug,
  difficulty:item.classification.difficulty[0].toUpperCase()+item.classification.difficulty.slice(1),
  language:item.language,publishedAt:item.publishedAt?.slice(0,10)??'公開日不明',
  tags:item.classification.tags,category:(item.classification.tags as string[]).includes('mtt')?'Tournament':'GTO',
  url:item.originalUrl,contentType:item.contentType==='video'?'video':'article',
}));
export const sources=collected.sources.map(source=>({...source,description:`${source.name}のポーカー戦略コンテンツへのリンクです。`}));
export const collectedAt=collected.collectedAt;
