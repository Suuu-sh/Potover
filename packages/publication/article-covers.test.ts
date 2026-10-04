import {readFileSync} from 'node:fs';
import {expect,it} from 'vitest';
import {safeArticleCover,createArticleCoverLookup} from './article-covers.mjs';
import manifest from '../../data/article-cover-manifest.json';
import scope from '../../data/publication-scope.json';
const raw=JSON.parse(readFileSync('data/articles.json','utf8'));
const original=raw.articles.find((a:any)=>a.originalUrl===scope.articles[0].originalUrl);
const article={...original,...scope.articles[0],contentType:'article'};
it('restores exact archived image URLs for current identities only',()=>{
  const lookup=createArticleCoverLookup(manifest,scope);
  expect(lookup.coverFor(article)).toBe(original.imageUrl);
  expect(lookup.coverFor({...article,sourceSlug:'pokernews'})).toBeUndefined();
  expect(lookup.coverFor({...article,originalUrl:'https://evil.test/'})).toBeUndefined();
});
it.each(['javascript:alert(1)','data:image/png;base64,AA','//blog.gtowizard.com/image.jpg','https://blog.gtowizard.com.evil.test/content/a.jpg','https://u:p@blog.gtowizard.com/content/a.jpg','http://blog.gtowizard.com/content/a.jpg','https://blog.gtowizard.com:444/content/a.jpg','https://127.0.0.1/content/a.jpg','https://blog.gtowizard.com/content/a.svg','https://blog.gtowizard.com/content/a.jpg?token=secret'])('rejects unsafe image URLs: %s',value=>expect(safeArticleCover(value,article)).toBeUndefined());
it('binds YouTube thumbnails to the exact video and source',()=>{
  const v={sourceSlug:'gto-wizard',originalUrl:'https://www.youtube.com/watch?v=AbCdEfGh_01',contentType:'video'};
  expect(safeArticleCover('https://i.ytimg.com/vi/AbCdEfGh_01/hqdefault.jpg',v)).toBeTruthy();
  expect(safeArticleCover('https://i.ytimg.com/vi/NotSame__01/hqdefault.jpg',v)).toBeUndefined();
  expect(safeArticleCover('https://i.ytimg.com/vi/AbCdEfGh_01/hqdefault.jpg',{...v,contentType:'article'})).toBeUndefined();
});
it('supports source, article and global removal switches',()=>{
  for(const patch of [(m:typeof manifest)=>m.enabled=false,(m:typeof manifest)=>m.disabledSources.push(article.sourceSlug as never),(m:typeof manifest)=>m.disabledArticles.push(article.slug as never)]){
    const m=structuredClone(manifest);patch(m);const lookup=createArticleCoverLookup(m,scope);expect(lookup.suppressed(article)).toBe(true);expect(lookup.coverFor(article)).toBeUndefined();
  }
});
it('retains 1244 identities and 9 sources, never resurrects excluded records',()=>{
  expect(manifest.covers.length).toBe(1244);expect(new Set(manifest.covers.map(x=>x.sourceSlug)).size).toBe(9);
  expect(manifest.covers.some(x=>['pokernews','m-portal'].includes(x.sourceSlug))).toBe(false);
  const lookup=createArticleCoverLookup(manifest,scope);let count=0;
  for(const row of manifest.covers){const data=raw.articles.find((a:any)=>a.originalUrl===row.originalUrl);if(lookup.coverFor({...row,contentType:data.contentType}))count++;}
  expect(count).toBe(1243); // One legacy plain-HTTP AJPC URL falls back, rather than weakening HTTPS.
});
it('restores all three former visual locations without summary/headings/raw imports',()=>{
  for(const path of ['components/ArticleFeedRow.tsx','components/EditorPicks.tsx','components/HomeSpotlightCarousel.tsx']){
    const s=readFileSync(path,'utf8');expect(s).toContain('ArticleCover');expect(s).not.toMatch(/\.summary|\.headings|from ['"]@\/data\/articles\.json/);
  }
  expect(readFileSync('components/HomeSpotlightCarousel.tsx','utf8')).toContain('82vw, 430px');
  expect(readFileSync('components/ArticleCover.tsx','utf8')).toContain('width:160,height:96');
});

it('continues to honor the earlier preview source/article removal controls',()=>{
  expect(createArticleCoverLookup(manifest,scope,{sources:[{sourceSlug:article.sourceSlug,enabled:false}],articles:[]}).coverFor(article)).toBeUndefined();
  expect(createArticleCoverLookup(manifest,scope,{sources:[],articles:[{slug:article.slug,enabled:false}]}).coverFor(article)).toBeUndefined();
});
