import {readFileSync} from 'node:fs';
import {transformSync} from 'esbuild';
import {createElement,type ComponentType} from 'react';
import * as React from 'react';
import * as jsxRuntime from 'react/jsx-runtime';
import {renderToStaticMarkup} from 'react-dom/server';
import {expect,it} from 'vitest';
import {readOwnedIllustration} from '../packages/publication/topic-art.mjs';
const illustration={topic:'general',src:'/topic-art/general.webp',width:1280,height:720,label:'ポーカー全般'};
function load(failed?:string){
  const {code}=transformSync(readFileSync('components/ArticleArtwork.tsx','utf8'),{loader:'tsx',format:'cjs',jsx:'automatic'});
  const compiledModule={exports:{} as {ArticleArtwork:ComponentType<any>}};let onError:(()=>void)|undefined;let failedValue:string|undefined;
  const require=(name:string)=>{
    if(name==='react/jsx-runtime')return jsxRuntime;
    if(name==='react')return {...React,useState:()=>[failed,(v:string)=>{failedValue=v}]};
    if(name==='@/lib/i18n-client')return {useI18n:()=>({t:(v:string)=>v})};
    if(name==='@/packages/publication/topic-art.mjs')return {readOwnedIllustration};
    if(name==='./ArticleArtwork.module.css')return {__esModule:true,default:{caption:'caption',fallback:'fallback'}};
    if(name==='lucide-react')return {BookOpen:()=>createElement('span',null,'article fallback'),Play:()=>createElement('span',null,'video fallback')};
    if(name==='next/image')return {__esModule:true,default:({unoptimized,fill,priority,onError:fn,...props}:any)=>{onError=fn;return createElement('img',props)}};
    throw new Error(name);
  };
  new Function('require','module',code)(require,compiledModule);
  return {render:(art:any=illustration,contentType='article')=>renderToStaticMarkup(createElement(compiledModule.exports.ArticleArtwork,{article:{illustration:art,contentType}})),fail:()=>onError?.(),failed:()=>failedValue};
}
it('shows first-party art and a clear topic-illustration label',()=>{
  const h=load().render();expect(h).toContain('/topic-art/general.webp');expect(h).toContain('分野イラスト');expect(h).toContain('ポーカー全般');expect(h).not.toContain('http');
});
it('uses a stable fallback after load failure and rejects external/retired image paths',()=>{
  const v=load();v.render();v.fail();expect(v.failed()).toBe(illustration.src);expect(load(illustration.src).render()).not.toContain('<img');
  for(const src of ['https://evil.test/art.webp','/article-previews/old.webp'])expect(load().render({...illustration,src})).not.toContain('<img');
  expect(load().render(null,'video')).toContain('video fallback');
});
