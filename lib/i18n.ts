import type {Metadata} from 'next';
import {PUBLIC_SITE_URL} from './site-url';
import english from './translations/en.json';
import legal from './translations/en-legal.json';
import learning from './translations/en-learning.json';

export type Locale='ja'|'en';
export const englishTranslations:Record<string,string>={...english,...learning,...legal};
const translations=englishTranslations;
export const locales:Locale[]=['ja','en'];
export function stripLocale(path:string):string{return path.replace(/^\/en(?=\/|[?#]|$)/,'')||'/';}
export function localeFromPath(path:string):Locale{return /^\/en(?:\/|[?#]|$)/.test(path)?'en':'ja';}
/** A normalized internal path must remain local even after decoding or removing /en. */
function isSafeLocalPath(value:string):boolean{
  const singleSlash=(path:string)=>path.startsWith('/')&&!path.startsWith('//')&&!path.includes('\\')&&!/[\u0000-\u001f]/.test(path);
  if(!singleSlash(value))return false;
  try{
    const url=new URL(value,PUBLIC_SITE_URL);
    if(url.origin!==new URL(PUBLIC_SITE_URL).origin)return false;
    const decoded=decodeURIComponent(url.pathname);
    for(const candidate of [url.pathname,decoded,stripLocale(url.pathname),stripLocale(decoded)]){
      if(!singleSlash(candidate))return false;
      const normalized=new URL(candidate,PUBLIC_SITE_URL);
      if(normalized.origin!==url.origin||!singleSlash(normalized.pathname)||!singleSlash(stripLocale(normalized.pathname)))return false;
    }
    return true;
  }catch{return false;}
}
/** Both interface languages use the same URLs; normalize legacy /en links only. */
export function localePath(value:string,locale:Locale):string{return localizePath(value,locale,0);}
function localizePath(value:string,locale:Locale,depth:number):string{
  // Explicit external links are preserved, but internal inputs must never become external.
  if(!value.startsWith('/')||value.startsWith('//'))return value;
  const home='/';
  if(!isSafeLocalPath(value))return home;
  const url=new URL(value,PUBLIC_SITE_URL);
  if(/\.[a-z0-9]+$/i.test(url.pathname)||url.pathname.startsWith('/api/'))return value;
  const path=stripLocale(url.pathname);
  url.pathname=path;
  const next=url.searchParams.get('next');
  if(depth<2&&next&&isSafeLocalPath(next))url.searchParams.set('next',localizePath(next,locale,depth+1));
  const result=`${url.pathname}${url.search}${url.hash}`;
  return isSafeLocalPath(result)?result:home;
}
export function safeReturnPath(value:string|null,locale:Locale):string{
  const fallback=localePath('/profile',locale);
  if(!value||!isSafeLocalPath(value))return fallback;
  const localized=localePath(value,locale);
  // Validate the actual redirect, not just the pre-normalization input.
  return isSafeLocalPath(localized)?localized:fallback;
}
/** Only UI copy is passed here. Source titles and publisher names are not translated. */
export function translate<T>(value:T,locale:Locale):T{
  if(locale==='ja'||typeof value!=='string')return value;
  const key=value.trim();
  const literal=translations[key];
  if(literal!==undefined)return (value.replace(key,literal)) as T;
  const patterns:[RegExp,(match:RegExpMatchArray)=>string][]=[
    [/^(.*)本の記事・動画から$/,m=>`From ${m[1]} articles and videos`],
    [/^(.*)のポーカー戦略コンテンツへのリンクです。$/,m=>`Links to poker strategy content from ${m[1]}.`],
    [/^(.*)の詳細$/,m=>`Details for ${m[1]}`],
    [/^(.*)のWebサイトを開く$/,m=>`Open the ${m[1]} website`],
    [/^(.*)のフォローを解除$/,m=>`Unfollow ${m[1]}`],
    [/^(.*)をフォロー$/,m=>`Follow ${m[1]}`],
    [/^検索「(.*)」を解除$/,m=>`Clear search: ${m[1]}`],
    [/^(.*)を解除$/,m=>`Remove ${translate(m[1],'en')}`],
    [/^(.*)に関連する記事を探す$/,m=>`Find articles about ${translate(m[1],'en')}`],
    [/^(.*)の章$/,m=>`${translate(m[1],'en')} chapters`],
    [/^(.*)の学習進捗$/,m=>`${translate(m[1],'en')} progress`],
    [/^(.*)を提供元で開く$/,m=>`Open ${m[1]} on the publisher’s website`],
    [/^(\d+)枚目を表示$/,m=>`Show slide ${m[1]}`],
  ];
  for(const [pattern,format] of patterns){const match=key.match(pattern);if(match)return format(match) as T;}
  return value;
}
const pageTitles:Record<string,[string,string]>={
  '/':['Potover — ポーカー記事を、横断検索。','Potover — Find your next poker lesson'],
  '/explore':['記事・動画を探す — Potover','Explore poker articles and videos — Potover'],
  '/articles':['記事一覧 — Potover','Poker articles — Potover'],
  '/sources':['情報源 — Potover','Sources — Potover'],
  '/glossary':['ポーカー用語集 — Potover','Poker glossary — Potover'],
  '/roadmap':['学習ロードマップ — Potover','Learning roadmaps — Potover'],
  '/bookmarks':['ブックマーク — Potover','Bookmarks — Potover'],
  '/login':['ログイン — Potover','Sign in — Potover'],
  '/profile':['アカウント — Potover','Account — Potover'],
  '/privacy':['プライバシーポリシー — Potover','Privacy policy — Potover'],
  '/terms':['利用条件 — Potover','Terms of use — Potover'],
  '/contact':['お問い合わせ — Potover','Contact — Potover'],
};
export function canonicalPath(path:string):string{
  const normalized=stripLocale(path).replace(/\/$/,'')||'/';
  return normalized==='/home'?'/':normalized==='/docs'?'/explore':normalized;
}
export function pageUrl(path:string,locale:Locale):string{return `${PUBLIC_SITE_URL}${localePath(canonicalPath(path),locale).replace(/\/$/,'')}/`;}
export function pageMetadata(path:string,locale:Locale,articleTitle?:string):Metadata{
  const normalized=canonicalPath(path);
  const title=articleTitle?`${articleTitle} — Potover`:(pageTitles[normalized]||pageTitles['/'])[locale==='en'?1:0];
  const description=locale==='en'?'Discover poker articles and videos across multiple sources. Search by topic and content language. Original content stays on the publisher’s website.':'良質なポーカー記事を、テーマ・言語から横断検索。本文・動画は提供元のサイトでご覧ください。';
  return {title,description,alternates:{canonical:pageUrl(path,locale)},openGraph:{title,description,url:pageUrl(path,locale),locale:locale==='en'?'en_US':'ja_JP',siteName:'Potover',type:'website'},...(['/login','/profile','/bookmarks'].includes(normalized)?{robots:{index:false,follow:true}}:{})};
}
