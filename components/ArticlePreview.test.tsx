import {readFileSync} from 'node:fs';
import {transformSync} from 'esbuild';
import {createElement,type ComponentType} from 'react';
import * as React from 'react';
import * as jsxRuntime from 'react/jsx-runtime';
import {renderToStaticMarkup} from 'react-dom/server';
import {expect,it} from 'vitest';
import {readPublicArticlePreview} from '../packages/publication/article-previews.mjs';
const preview={src:`/article-previews/${'a'.repeat(64)}.webp`,width:160,height:95,credit:'Source / Author'};
function load(failed?:string){
  const {code}=transformSync(readFileSync('components/ArticlePreview.tsx','utf8'),{loader:'tsx',format:'cjs',jsx:'automatic'});
  const compiledModule={exports:{} as {ArticlePreview:ComponentType<any>}};let onError:(()=>void)|undefined;let failedValue:string|undefined;
  const require=(name:string)=>{
    if(name==='react/jsx-runtime')return jsxRuntime;
    if(name==='react')return {...React,useState:()=>[failed,(value:string)=>{failedValue=value}]};
    if(name==='@/lib/i18n-client')return {useI18n:()=>({t:(x:string)=>x})};
    if(name==='@/packages/publication/article-previews.mjs')return {readPublicArticlePreview};
    if(name==='./ArticlePreview.module.css')return {__esModule:true,default:{preview:'preview'}};
    if(name==='lucide-react')return {BookOpen:()=>createElement('span',null,'article fallback'),Play:()=>createElement('span',null,'video fallback')};
    if(name==='next/image')return {__esModule:true,default:({unoptimized,onError:handler,...props}:any)=>{onError=handler;return createElement('img',props)}};
    throw new Error(name);
  };
  new Function('require','module',code)(require,compiledModule);
  return {render:(value=preview,contentType='article')=>renderToStaticMarkup(createElement(compiledModule.exports.ArticlePreview,{preview:value,contentType})),fail:()=>onError?.(),failed:()=>failedValue};
}
it('renders a lazy local-only reduced image with visible source credit',()=>{
  const html=load().render();expect(html).toContain(preview.src);expect(html).toContain('width="160"');expect(html).toContain('height="95"');expect(html).toContain('loading="lazy"');expect(html).toContain('Source / Author');expect(html).toContain('max-height:112px');
});
it('falls back after a load error and recovers for a different image identity',()=>{
  const view=load();view.render();view.fail();expect(view.failed()).toBe(preview.src);
  expect(load(preview.src).render()).not.toContain('<img');
  expect(load('/article-previews/old.webp').render()).toContain('<img');
});
it('never renders raw remote images, oversized images or a video thumbnail',()=>{
  for(const value of [{...preview,src:'https://example.com/original.jpg'},{...preview,width:161}])expect(load().render(value)).not.toContain('<img');
  expect(load().render(preview,'video')).toContain('video fallback');
});
