import {readFileSync,existsSync} from 'node:fs';
import path from 'node:path';
import {transformSync} from 'esbuild';
import * as React from 'react';
import * as jsxRuntime from 'react/jsx-runtime';
import {renderToStaticMarkup} from 'react-dom/server';
import {describe,expect,it} from 'vitest';
import * as i18n from '../lib/i18n';
import {localePath,translate,type Locale} from '../lib/i18n';

const articles=[
  {slug:'original-en',title:'An original English title',source:'Example Poker',sourceSlug:'gto-wizard',difficulty:'Beginner',language:'English',publishedAt:'2026-10-03',tags:['preflop'],category:'GTO',url:'https://example.com/en',contentType:'article'},
  {slug:'original-ja',title:'翻訳しない原題',source:'日本の情報源',sourceSlug:'gto-wizard-japan',difficulty:'Beginner',language:'Japanese',publishedAt:'2026-10-03',tags:['preflop'],category:'GTO',url:'https://example.com/ja',contentType:'article'},
];
function view(file:string,locale:Locale='en',signedIn=false,navigation?:{pathname:string;search:string;hash:string}){
  const cache=new Map<string,Record<string,unknown>>();
  const Empty=()=>null;
  function load(filename:string):Record<string,unknown>{
    const absolute=path.resolve(filename);if(cache.has(absolute))return cache.get(absolute)!;
    const code=transformSync(readFileSync(absolute,'utf8'),{loader:filename.endsWith('.tsx')?'tsx':'ts',format:'cjs',jsx:'automatic'}).code;
    const compiledModule={exports:{} as Record<string,unknown>};cache.set(absolute,compiledModule.exports);
    const require=(name:string):unknown=>{
      if(name==='@/lib/i18n'||name==='./i18n')return i18n;
      if(name==='react')return navigation?{...React,useSyncExternalStore:()=>navigation.hash}:React;if(name==='react/jsx-runtime')return jsxRuntime;
      if(name==='react-dom')return {createPortal:(node:React.ReactNode)=>node};
      if(name==='lucide-react')return new Proxy({},{get:()=>Empty});
      if(name==='next/link'||name==='@/components/LocaleLink')return {__esModule:true,default:({href,children,...props}:{href:string;children:React.ReactNode})=>React.createElement('a',{...props,href:localePath(href,locale)},children)};
      if(name==='next/image')return {__esModule:true,default:Empty};
      if(name==='next/navigation'||name==='@/lib/locale-router')return {usePathname:()=>navigation?.pathname||(name==='next/navigation'?localePath('/',locale):'/'),useSearchParams:()=>new URLSearchParams(navigation?.search||''),useRouter:()=>({push:()=>{},replace:()=>{}}),notFound:()=>{throw Error('Not found')}};
      if(name==='@/lib/i18n-client')return {useI18n:()=>({locale,t:<T,>(value:T)=>translate(value,locale),href:(value:string)=>localePath(value,locale)})};
      if(name==='@/lib/data')return {articles,sources:[{slug:'example',name:'Example Poker',description:'Example Pokerのポーカー戦略コンテンツへのリンクです。',language:'English',url:'https://example.com'}]};
      if(name==='@/lib/auth-client')return {useAuth:()=>({user:signedIn?{id:'test',email:'test@example.com'}:null,loading:false,logout:async()=>{},login:async()=>{},register:async()=>{}})};
      if(name==='@/lib/bookmarks')return {useBookmarks:()=>({slugs:[],loading:false,isBookmarked:()=>false})};
      if(name==='@/lib/learning-history')return {useLearningHistory:()=>({events:[],loading:false,hasRead:()=>false,recordRead:()=>{}})};
      if(name==='@/lib/source-follows')return {useSourceFollows:()=>({followedSources:new Set(),loading:false,isFollowed:()=>false})};
      if(name==='@/lib/use-theme')return {useTheme:()=>({dark:false,loading:false,setTheme:()=>{}})};
      if(name==='@/lib/use-preferred-language')return {usePreferredLanguage:()=>[locale==='en'?'English':'Japanese',()=>{}]};
      if(name==='@/lib/user-preferences')return {useUserPreferences:()=>({docsQuery:'',docsFilters:[],loading:false,setDocsFilters:()=>{}})};
      if(name==='@/lib/article-modal')return {useArticleModal:()=>({openArticle:()=>{}}),ArticleLink:({slug,children,...props}:{slug:string;children:React.ReactNode})=>React.createElement('a',{...props,href:localePath('/articles/'+slug,locale)},children)};
      if(name.endsWith('.css'))return {__esModule:true,default:new Proxy({},{get:(_,key)=>key})};
      if(name==='@/components/AdSenseAd')return {AdSenseAd:Empty};
      const base=name.startsWith('@/')?path.resolve(name.slice(2)):path.resolve(path.dirname(absolute),name);
      const resolved=[base,base+'.tsx',base+'.ts'].find(existsSync);if(resolved)return load(resolved);
      throw Error('Unexpected test import: '+name);
    };
    new Function('require','module',code)(require,compiledModule);cache.set(absolute,compiledModule.exports);return compiledModule.exports;
  }
  return load(file) as Record<string,React.ComponentType<Record<string,unknown>>>;
}
function render(file:string,name='default',props:Record<string,unknown>={},locale:Locale='en',signedIn=false){return renderToStaticMarkup(React.createElement(view(file,locale,signedIn)[name],props));}

describe('English server-rendered UI',()=>{
  it('localizes navigation and search destinations while offering an explicit Japanese switch',()=>{
    const html=render('components/SiteHeader.tsx','SiteHeader');
    for(const word of ['Home','Explore','Roadmaps','Glossary','Switch to dark mode'])expect(html).toContain(word);
    for(const href of ['/explore','/bookmarks','/login'])expect(html).toContain(`href="${href}"`);
    expect(html).toContain('action="/explore"');expect(html).toContain('lang="ja"');
  });
  it('renders an English home without translating original article titles',()=>{
    const html=render('components/ModernHome.tsx','ModernHome');
    for(const word of ['Featured articles','Explore by topic','Learning roadmaps','Poker glossary','An original English title','Titles stay in their original language'])expect(html).toContain(word);
    expect(html).toContain('href="/explore');expect(html).not.toContain('注目の記事');
  });
  it('renders English discovery controls with accurate content-language labels',()=>{
    const html=render('components/pages/explore.tsx');
    for(const copy of ['Filters','Search filters','Previous','Next','English','Japanese','翻訳しない原題','Read original article'])expect(html).toContain(copy);
    expect(html).toContain('lang="ja"');expect(html).toContain('href="https://example.com/ja"');
  });
  it('localizes sign-in and account/security settings',()=>{
    const login=render('components/pages/login.tsx');for(const copy of ['Welcome back','Email address','Password','At least 8 characters','Back to home'])expect(login).toContain(copy);
    const account=render('components/AccountSettings.tsx','AccountSettings',{},'en',true);for(const copy of ['Account settings','Sign out','Change password','Delete account','This cannot be undone'])expect(account).toContain(copy);
  });
  it('translates owned glossary content and retains localized article links',()=>{
    const html=render('components/GlossaryPage.tsx','GlossaryPage');for(const copy of ['Poker glossary','Equity','Related articles'])expect(html).toContain(copy);
    expect(html).not.toContain('現在のハンド');expect(html).toContain('href="/explore?q=equity"');
  });
  it('renders the faithful English legal/contact copy',()=>{
    const privacy=render('components/pages/privacy.tsx');expect(privacy).toContain('Suu');expect(privacy).toContain('potover39@gmail.com');expect(privacy).toContain('two years');expect(privacy).toContain('preferred content language');expect(privacy).toContain('Scheduled automated collection is currently paused.');expect(privacy).toContain('not treated as permission or a license');expect(privacy).not.toContain('We will not launch');expect(privacy).not.toContain('such as display language');expect(privacy).not.toContain('個人情報');
    const terms=render('components/pages/terms.tsx');expect(terms).toContain('Terms');expect(terms).toContain('thumbnails');expect(terms).not.toContain('利用条件');
  });
  it('retains Japanese UI and original Japanese source titles',()=>{
    const html=render('components/ModernHome.tsx','ModernHome',{},'ja');expect(html).toContain('注目の記事');expect(html).toContain('翻訳しない原題');expect(html).toContain('href="/explore"');expect(html).not.toContain('Featured articles');
  });
});
