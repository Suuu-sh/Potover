import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const data=JSON.parse(readFileSync('data/articles.public.json','utf8'));
const base='https://potover.pages.dev';
const pages=['','home','docs','explore','articles','sources','glossary','roadmap','bookmarks','login','profile','privacy','terms','contact',...data.articles.map(article=>`articles/${article.slug}`)];
const url=(path,locale)=>`${base}/${locale==='en'?'en/':''}${path?`${path}/`:''}`;
let checked=0;
for(const locale of ['ja','en'])for(const page of pages){
  const file=`out/${locale==='en'?'en/':''}${page?`${page}/`:''}index.html`;
  assert(existsSync(file),`Missing ${file}`);
  const html=readFileSync(file,'utf8');
  assert(html.includes(`<html lang="${locale}"`),`Wrong document language: ${file}`);
  const canonical=page==='home'?'':page==='docs'?'explore':page;
  assert(html.includes(`<link rel="canonical" href="${url(canonical,locale)}"`),`Wrong canonical: ${file}`);
  for(const alternate of ['ja','en'])assert(html.includes(`<link rel="alternate" hrefLang="${alternate}" href="${url(canonical,alternate)}"`),`Missing alternate ${alternate}: ${file}`);
  assert(!html.includes('http://127.0.0.1:8787'),'Production HTML must not use a loopback API');
  checked++;
}
const sitemap=readFileSync('out/sitemap.xml','utf8');
for(const locale of ['ja','en'])for(const article of data.articles)assert(sitemap.includes(`<loc>${url(`articles/${article.slug}`,locale)}</loc>`));
for(const excluded of ['pokernews','m-portal'])assert(!data.sources.some(source=>source.slug===excluded));
assert.equal(data.articles.length,1244);assert.equal(data.sources.length,9);
const enHome=readFileSync('out/en/index.html','utf8');
for(const label of ['Featured articles','Explore by topic','Poker glossary','Learning roadmaps'])assert(enHome.includes(label));
assert(enHome.includes('action="/en/explore"'));assert(enHome.includes('Titles stay in their original language'));
assert(readFileSync('out/index.html','utf8').includes('注目の記事'));
console.log(`Verified ${checked} localized HTML pages, reciprocal metadata, sitemap entries, and the unchanged 1,244-article / 9-source scope.`);
