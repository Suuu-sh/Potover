import {readFileSync} from 'node:fs';
import {expect,it} from 'vitest';
import {createArticlePreviewLookup,readPublicArticlePreview} from './article-previews.mjs';
import manifest from '../../data/article-preview-manifest.json';
const first=manifest.articles[0];
const identity={slug:first.slug,sourceSlug:first.sourceSlug,originalUrl:first.originalUrl,contentType:'article'};
it('emits only reduced local bytes and required credit for exact reviewed identities',()=>{
  const value=createArticlePreviewLookup(manifest)(identity)!;
  expect(value).toEqual({src:first.thumbnailPath,width:first.width,height:first.height,credit:first.sourceName});
  expect(Object.keys(value).sort()).toEqual(['credit','height','src','width']);
  expect(JSON.stringify(value)).not.toContain(first.originalImageUrl);
});
it('fails closed for videos, unknown and spoofed article identities',()=>{
  const lookup=createArticlePreviewLookup(manifest);
  for(const change of [{slug:'unknown'},{sourceSlug:'upswing-poker'},{originalUrl:'https://attacker.test/'},{contentType:'video'},{contentType:undefined}])expect(lookup({...identity,...change})).toBeUndefined();
});
it('honors independent source and article suppression without changing the title allowlist',()=>{
  const articleOff=structuredClone(manifest);articleOff.articles[0].enabled=false;
  articleOff.articles[0].evidence.pageMetaRobots=['noimageindex'];
  articleOff.articles[0].evidence.imageStatus=403;
  expect(createArticlePreviewLookup(articleOff)(identity)).toBeUndefined();
  const sourceOff=structuredClone(manifest);sourceOff.sources.find(s=>s.sourceSlug===first.sourceSlug)!.enabled=false;
  expect(createArticlePreviewLookup(sourceOff)(identity)).toBeUndefined();
});
it.each(['https://evil.test/x.webp','//evil.test/x.webp','/article-previews/../raw.jpg','/article-previews/%2e%2e/raw.jpg','data:image/png;base64,AA','javascript:alert(1)','/article-previews/'+('f'.repeat(64))+'.svg'])('rejects unsafe public paths %s',src=>{
  expect(readPublicArticlePreview({src,width:160,height:95,credit:'Source'})).toBeUndefined();
});
it('rejects oversized, malformed, duplicated or exclusion-bearing manifest entries',()=>{
  const patches=[(m:any)=>m.articles.push(...m.articles),(m:any)=>m.articles[0].width=161,(m:any)=>m.articles[0].width=1.5,(m:any)=>m.articles[0].evidence.robotsAllowed=false,(m:any)=>m.articles[0].evidence.imageStatus=403,(m:any)=>m.articles[0].evidence.pageMetaRobots=['noimageindex'],(m:any)=>m.articles[0].evidence.pageMetaRobots=['max-image-preview:none'],(m:any)=>m.articles[0].evidence.sourceWidth=10,(m:any)=>m.articles[0].originalImageUrl='https://pokeracademy.jp.evil.test/x.png',(m:any)=>m.articles[0].originalImageUrl='https://u:p@pokeracademy.jp/x.png',(m:any)=>m.articles[0].originalImageUrl='http://pokeracademy.jp/x.png',(m:any)=>m.articles[0].originalImageUrl='https://pokeracademy.jp:8443/x.png',(m:any)=>m.articles[0].originalUrl='https://127.0.0.1/private',(m:any)=>m.articles[0].checkedAt='invalid'];
  for(const patch of patches){const changed=structuredClone(manifest);patch(changed);expect(()=>createArticlePreviewLookup(changed)).toThrow('Article previews:');}
});
it('keeps the limited pilot away from large or decorative image placements',()=>{
  for(const path of ['components/HomeSpotlightCarousel.tsx','components/EditorPicks.tsx','lib/article-modal.tsx','components/pages/articles-slug.tsx'])expect(readFileSync(path,'utf8')).not.toMatch(/ArticlePreview|\.preview\b/);
});
