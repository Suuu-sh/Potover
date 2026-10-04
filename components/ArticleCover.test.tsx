import {readFileSync} from 'node:fs';
import {transformSync} from 'esbuild';
import {createElement,type ComponentType} from 'react';
import * as React from 'react';
import * as jsxRuntime from 'react/jsx-runtime';
import {renderToStaticMarkup} from 'react-dom/server';
import {expect,it} from 'vitest';
import {safeArticleCover} from '../packages/publication/article-covers.mjs';
const article={sourceSlug:'gto-wizard',url:'https://blog.gtowizard.com/article/',contentType:'article',imageUrl:'https://blog.gtowizard.com/content/cover.jpg'};
function load(failed?:string){
  const {code}=transformSync(readFileSync('components/ArticleCover.tsx','utf8'),{loader:'tsx',format:'cjs',jsx:'automatic'});
  const compiledModule={exports:{} as {ArticleCover:ComponentType<any>}};let onError:(()=>void)|undefined;let failedValue:string|undefined;
  const require=(name:string)=>{
    if(name==='react/jsx-runtime')return jsxRuntime;
    if(name==='react')return {...React,useState:()=>[failed,(value:string)=>{failedValue=value}]};
    if(name==='@/packages/publication/article-covers.mjs')return {safeArticleCover};
    if(name==='lucide-react')return {BookOpen:()=>createElement('span',null,'article fallback'),Play:()=>createElement('span',null,'video fallback')};
    if(name==='next/image')return {__esModule:true,default:({unoptimized,fill,priority,onError:handler,...props}:any)=>{onError=handler;return createElement('img',props)}};
    throw new Error(name);
  };
  new Function('require','module',code)(require,compiledModule);
  return {render:(value=article,fill=false)=>renderToStaticMarkup(createElement(compiledModule.exports.ArticleCover,{article:value,fill})),fail:()=>onError?.(),failed:()=>failedValue};
}
it.each([false,true])('uses direct validated image and no-referrer, fill=%s',fill=>{
  const html=load().render(article,fill);expect(html).toContain(article.imageUrl);expect(html).toContain('referrerPolicy="no-referrer"');if(!fill){expect(html).toContain('width="160"');expect(html).toContain('height="96"');}
});
it.each([false,true])('falls back on failed images in the restored layouts without retrying, fill=%s',fill=>{
  const view=load();view.render(article,fill);view.fail();expect(view.failed()).toBe(article.imageUrl);expect(load(article.imageUrl).render(article,fill)).toContain('article fallback');expect(load('older-image').render(article,fill)).toContain('<img');
});
it('does not send an unsafe URL to the browser',()=>{
  expect(load().render({...article,imageUrl:'https://evil.test/full.jpg'})).not.toContain('<img');
});
