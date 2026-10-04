import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const data=JSON.parse(readFileSync('data/articles.public.json','utf8'));
const base='https://potover.pages.dev';
const pages=['','home','docs','explore','articles','sources','glossary','roadmap','bookmarks','login','profile','privacy','terms','contact',...data.articles.map(article=>`articles/${article.slug}`)];
const url=path=>`${base}/${path?`${path}/`:''}`;
let checked=0;
for(const page of pages){
  const file=`out/${page?`${page}/`:''}index.html`;
  assert(existsSync(file),`Missing ${file}`);
  const html=readFileSync(file,'utf8');
  assert(html.includes('<html lang="ja"'),'Static HTML must have the documented Japanese fallback');
  const canonical=page==='home'?'':page==='docs'?'explore':page;
  assert(html.includes(`<link rel="canonical" href="${url(canonical)}"`),`Wrong canonical: ${file}`);
  assert(!html.includes('hrefLang='),`A shared URL must not advertise separate language routes: ${file}`);
  assert(!/href="\/en(?:\/|["?#])/.test(html),`Legacy English navigation link: ${file}`);
  assert(!html.includes('http://127.0.0.1:8787'),'Production HTML must not use a loopback API');
  checked++;
}
assert(!existsSync('out/en/index.html'),'English must use the shared URL, not a second route tree');
const sitemap=readFileSync('out/sitemap.xml','utf8');
for(const article of data.articles)assert(sitemap.includes(`<loc>${url(`articles/${article.slug}`)}</loc>`));
assert.equal((sitemap.match(/<loc>/g)||[]).length,1253);
assert(!sitemap.includes(`${base}/en`));
assert(!sitemap.includes('hreflang'));
const redirects=readFileSync('out/_redirects','utf8');
assert(redirects.includes('/en / 301'));
assert(redirects.includes('/en/explore/ /explore/ 301'));
assert(redirects.includes('/en/articles/:slug /articles/:slug/ 301'));
for(const line of redirects.split('\n').filter(line=>line&&!line.startsWith('#'))){const [source,destination]=line.split(/\s+/);assert(source.startsWith('/en'));assert(destination.startsWith('/')&&!destination.startsWith('/:')&&!destination.startsWith('//'));}
assert(!redirects.includes('/en/* /:splat'),'A leading splat must not create a protocol-relative redirect');
for(const excluded of ['pokernews','m-portal'])assert(!data.sources.some(source=>source.slug===excluded));
assert.equal(data.articles.length,1244);assert.equal(data.sources.length,9);
const home=readFileSync('out/index.html','utf8');
assert(home.includes('注目の記事'));assert(home.includes('action="/explore"'));assert(home.includes('Switch interface to English'));
console.log(`Verified ${checked} shared content-route HTML pages, single canonicals, sitemap entries, legacy redirects, and the unchanged 1,244-article / 9-source scope.`);
