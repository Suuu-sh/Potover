import collected from '@/data/gtowizard-articles.json';
export type Article={slug:string;title:string;source:string;sourceSlug:string;summary:string;difficulty:string;language:string;publishedAt:string;minutes:number;tags:string[];category:string;url:string;imageUrl?:string|null};
const slugify=(v:string)=>v.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,80);
export const articles:Article[]=collected.articles.map((item,index)=>({slug:`${slugify(item.title)||'gtowizard-article'}-${index+1}`,title:item.title,source:item.source,sourceSlug:'gto-wizard',summary:item.summary,difficulty:item.classification.difficulty[0].toUpperCase()+item.classification.difficulty.slice(1),language:item.language,publishedAt:item.publishedAt?.slice(0,10)??'公開日不明',minutes:Math.max(3,Math.ceil(item.summary.length/90)),tags:item.classification.tags,category:item.classification.tags.includes('mtt')?'Tournament':'GTO',url:item.originalUrl,imageUrl:item.imageUrl}));
export const sources=[{slug:'gto-wizard',name:'GTO Wizard',description:'GTOを軸にした分析とトーナメント戦略。GTO Wizard公式ブログから収集した記事です。',language:'English',url:'https://blog.gtowizard.com/'}];
export const collectedAt=collected.collectedAt;
