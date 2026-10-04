import {readFileSync} from 'node:fs';
import {transformSync} from 'esbuild';
import {createElement,type ComponentType,type ReactNode} from 'react';
import * as React from 'react';
import * as jsxRuntime from 'react/jsx-runtime';
import {renderToStaticMarkup} from 'react-dom/server';
import {expect,it} from 'vitest';

const article={slug:'title-link-test',title:'Original strategy title',source:'Example Poker',sourceSlug:'example-poker',difficulty:'Beginner',language:'English',publishedAt:'2026-10-03',tags:['preflop'],category:'Strategy',url:'https://example.com/original',contentType:'article',summary:'LEGACY_EXCERPT',headings:[{text:'LEGACY_HEADING',level:2}],imageUrl:'https://example.com/legacy-image.png',minutes:9876};
type LinkProps={children?:ReactNode;slug?:string;href?:string;className?:string};
const Link=({children,slug,href,className}:LinkProps)=>createElement('a',{href:href||`/articles/${slug}`,className},children);
const Empty=()=>null;
const BookmarkButton=()=>createElement('button',null,'Bookmark');
const SourceFollowButton=()=>createElement('button',null,'Follow source');
const auxiliary={HomeSpotlightCarousel:Empty,RoadmapPreview:Empty,RoadmapGuide:Empty,GlossaryPreview:Empty,HomeSectionHeading:Empty,AdSenseAd:Empty};

function loadView(path:string,extra=''){
  const {code}=transformSync(readFileSync(path,'utf8')+extra,{loader:'tsx',format:'cjs',jsx:'automatic'});
  const compiledModule={exports:{} as Record<string,ComponentType<Record<string,unknown>>>};
  const require=(name:string)=>{
    if(name==='react/jsx-runtime')return jsxRuntime;
    if(name==='@/lib/i18n-client')return {useI18n:()=>({locale:'ja',t:<T,>(value:T)=>value,href:(value:string)=>value})};
    if(name==='react')return React;
    if(name==='lucide-react')return new Proxy({},{get:()=>Empty});
    if(name==='next/link'||name==='@/components/LocaleLink'||name==='@/components/ArticleLink')return {__esModule:true,default:Link};
    if(name==='next/image')return {__esModule:true,default:({src}: {src:string})=>createElement('img',{src,alt:''})};
    if(name==='next/navigation')return {notFound:()=>{throw new Error('Not found')}};
    if(name==='@/lib/data')return {articles:[article]};
    if(name==='@/lib/content-labels')return {contentLabel:(label:string)=>label};
    if(name==='@/lib/learning-history')return {useLearningHistory:()=>({hasRead:()=>true})};
    if(name==='@/lib/auth-client')return {useAuth:()=>({user:null})};
    if(name==='@/lib/use-preferred-language')return {usePreferredLanguage:()=>['English']};
    if(name==='@/components/ArticlePreview')return {ArticlePreview:()=>null};
    if(name==='@/components/LearningLink')return {LearningLink:Link};
    if(name==='@/components/BookmarkButton')return {BookmarkButton};
    if(name==='@/components/SourceFollowButton')return {SourceFollowButton};
    if(name.startsWith('@/components/'))return auxiliary;
    throw new Error(`Unexpected title/link view import: ${name}`);
  };
  new Function('require','module',code)(require,compiledModule);
  return compiledModule.exports;
}

function expectTitleLinkMarkup(html:string){
  expect(html).toContain(article.title);
  expect(html).toContain(article.source);
  expect(html).toContain(article.publishedAt);
  expect(html).toContain(`href="${article.url}"`);
  for(const legacy of ['LEGACY_EXCERPT','LEGACY_HEADING','legacy-image.png','9876'])expect(html).not.toContain(legacy);
}

it('keeps the feed title, original link, source, date, category, bookmark, follow and read state without article images',()=>{
  const {ArticleFeedRow}=loadView('components/ArticleFeedRow.tsx');
  const html=renderToStaticMarkup(createElement(ArticleFeedRow,{article}));
  expectTitleLinkMarkup(html);
  for(const text of ['Strategy','Bookmark','Follow source','読了'])expect(html).toContain(text);
  expect(html).not.toContain('<img');
});

it('renders text-focused home picks and editor picks with direct original links',()=>{
  for(const [path,name] of [['components/ModernHome.tsx','ModernHome'],['components/EditorPicks.tsx','EditorPicks']]){
    const view=loadView(path)[name];
    const html=renderToStaticMarkup(createElement(view));
    expectTitleLinkMarkup(html);
    expect(html).not.toContain('<img');
  }
});

it('retains only the Potover-owned promotional artwork in the spotlight carousel',()=>{
  const {HomeSpotlightCarousel}=loadView('components/HomeSpotlightCarousel.tsx');
  const html=renderToStaticMarkup(createElement(HomeSpotlightCarousel));
  expectTitleLinkMarkup(html);
  const images=Array.from(html.matchAll(/<img[^>]+src="([^"]+)"/g),match=>match[1]);
  expect(images).toEqual(Array(3).fill('/banners/potover-strategy-hero.png'));
});

it('replaces the modal outline with source metadata, tags and the original-link action',()=>{
  const {TestArticleModal}=loadView('lib/article-modal.tsx','\nexport {ArticleModal as TestArticleModal};');
  const html=renderToStaticMarkup(createElement(TestArticleModal,{article,onClose:()=>undefined}));
  expectTitleLinkMarkup(html);
  for(const text of ['Strategy','preflop','Bookmark','元記事を読む'])expect(html).toContain(text);
  expect(html).not.toContain('<ol');
  expect(html).not.toContain('<img');
});

it('renders direct article pages with original links and no extracted content',()=>{
  const view=loadView('components/pages/articles-slug.tsx').default;
  const html=renderToStaticMarkup(createElement(view,{slug:article.slug}));
  expectTitleLinkMarkup(html);
  for(const text of ['Strategy','preflop','Bookmark'])expect(html).toContain(text);
  expect(html).not.toContain('<ol');
  expect(html).not.toContain('<img');
});

it('renders the article index with original links and metadata',()=>{
  const view=loadView('components/pages/articles.tsx').default;
  const html=renderToStaticMarkup(createElement(view));
  expectTitleLinkMarkup(html);
  expect(html).not.toContain('<img');
});

it('uses source initials instead of third-party logo images',()=>{
  const {SourceCard}=loadView('components/SourceCard.tsx');
  const html=renderToStaticMarkup(createElement(SourceCard,{source:{slug:'example-poker',name:'Example Poker',description:'Source directory description',language:'English',url:'https://example.com'}}));
  expect(html).toContain('>EP</strong>');
  expect(html).toContain('Follow source');
  expect(html).not.toContain('<img');
});

it('keeps all public article consumers independent of removed fields',()=>{
  const paths=['components/ArticleFeedRow.tsx','components/ModernHome.tsx','components/HomeSpotlightCarousel.tsx','components/EditorPicks.tsx','lib/article-modal.tsx','lib/roadmaps.ts','components/pages/articles.tsx','components/pages/articles-slug.tsx','components/pages/explore.tsx','components/pages/roadmap.tsx'];
  for(const path of paths)expect(readFileSync(path,'utf8'),path).not.toMatch(/\.(summary|headings|imageUrl|minutes)\b/);
});
