import { readFile, writeFile } from 'node:fs/promises';

const headers = { 'user-agent': 'Potover metadata collector/0.2 (+https://github.com/Suuu-sh/Potover)' };
const get = async (url) => { const response = await fetch(url, { headers, redirect: 'follow' }); if (!response.ok) throw new Error(`${response.status} ${url}`); return response.text(); };
const decode = (value = '') => value.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').replace(/\[\/?vc_[^\]]*\]/gi, ' ').replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code))).replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16))).replace(/&nbsp;/g, ' ').replace(/&hellip;/g, '…').replace(/&#038;|&amp;/g, '&').replace(/&quot;/g, '"').replace(/&apos;|&#x27;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const absoluteUrl = (value, base) => { if (!value) return null; try { return new URL(decode(value), base).href; } catch { return null; } };
const meta = (html, key) => { const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); const match = new RegExp(`<meta[^>]+(?:property|name|itemprop)=["']${escaped}["'][^>]+content=["']([^"']*)|<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name|itemprop)=["']${escaped}["']`, 'i').exec(html); return decode(match?.[1] || match?.[2] || ''); };
const pageTitle = (html) => meta(html, 'og:title') || decode(/<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1] || '');
const pageImage = (html, url, fallback) => { const candidate = meta(html, 'og:image') || meta(html, 'og:image:url') || meta(html, 'twitter:image') || meta(html, 'image') || /<img[^>]+(?:data-src|src)=["']([^"']+)["']/i.exec(html)?.[1]; return absoluteUrl(candidate, url) || fallback; };
const classify = (title, summary) => { const text = `${title} ${summary}`.toLowerCase(); const tags = []; for (const [needle, tag] of [['プリフロップ','preflop'],['preflop','preflop'],['フロップ','flop'],['flop','flop'],['ターン','turn'],['turn','turn'],['リバー','river'],['river','river'],['gto','gto'],['icm','icm'],['エクスプロイト','exploit'],['exploit','exploit'],['ブラフ','bluff'],['bluff','bluff'],['キャッシュ','cash-game'],['cash','cash-game'],['トーナメント','mtt'],['mtt','mtt']]) if (text.includes(needle)) tags.push(tag); return { difficulty: /初心者|入門|基本|beginner|basic|fundamental/.test(text) ? 'beginner' : 'intermediate', tags: [...new Set(tags)] }; };
const item = ({ source, sourceSlug, sourceUrl, title, url, summary, publishedAt, imageUrl, language = 'English' }) => ({ source, sourceSlug, sourceUrl, title, originalUrl: url, author: null, publishedAt: publishedAt || null, summary: summary || title, language, imageUrl: imageUrl || null, contentType: 'article', classification: classify(title, summary || '') });
const sitemapEntries = (xml) => [...xml.matchAll(/<url>([\s\S]*?)<\/url>/gi)].map((match) => ({ url: decode(/<loc>([\s\S]*?)<\/loc>/i.exec(match[1])?.[1] || ''), lastmod: decode(/<lastmod>([\s\S]*?)<\/lastmod>/i.exec(match[1])?.[1] || '') })).filter((entry) => entry.url);
const mapLimit = async (values, limit, callback) => { const results = []; let cursor = 0; await Promise.all(Array.from({ length: Math.min(limit, values.length) }, async () => { while (cursor < values.length) { const index = cursor++; try { results[index] = await callback(values[index], index); } catch (error) { console.warn(`Skipped ${values[index]?.url || values[index]}: ${error.message}`); } } })); return results.filter(Boolean); };

const database = JSON.parse(await readFile('data/articles.json', 'utf8'));
const additions = [];
const existing = new Map(database.articles.map((article) => [article.originalUrl, article]));

// English public sources.
const upswingRss = await get('https://upswingpoker.com/feed/');
for (const match of upswingRss.matchAll(/<item>([\s\S]*?)<\/item>/g)) { const xml = match[1]; const pick = (name) => decode(new RegExp(`<${name}[^>]*>([\\s\\S]*?)<\/${name}>`, 'i').exec(xml)?.[1] || ''); additions.push(item({ source: 'Upswing Poker', sourceSlug: 'upswing-poker', sourceUrl: 'https://upswingpoker.com/', title: pick('title'), url: pick('link'), summary: pick('description'), publishedAt: pick('pubDate') })); }
for (const article of additions.filter((article) => article.sourceSlug === 'upswing-poker' && article.originalUrl)) { try { const html = await get(article.originalUrl); article.imageUrl = pageImage(html, article.originalUrl, null); } catch {} }
const pokerCoachingPosts = JSON.parse(await get('https://pokercoaching.com/blog/wp-json/wp/v2/posts?per_page=100&_embed'));
for (const post of pokerCoachingPosts) additions.push(item({ source: 'PokerCoaching.com', sourceSlug: 'pokercoaching', sourceUrl: 'https://pokercoaching.com/blog/', title: decode(post.title?.rendered), url: post.link, summary: decode(post.excerpt?.rendered), publishedAt: post.date, imageUrl: post._embedded?.['wp:featuredmedia']?.[0]?.source_url }));
const pokerNewsIndex = await get('https://www.pokernews.com/strategy/');
const pokerNewsUrls = [...new Set([...pokerNewsIndex.matchAll(/href=["'](\/strategy\/[a-z0-9][^"']+\.htm)["']/gi)].map((match) => `https://www.pokernews.com${match[1]}`))].slice(-40);
for (const url of pokerNewsUrls) { try { const html = await get(url); const title = pageTitle(html); if (title) additions.push(item({ source: 'PokerNews', sourceSlug: 'pokernews', sourceUrl: 'https://www.pokernews.com/strategy/', title, url, summary: meta(html, 'description') || meta(html, 'og:description'), publishedAt: meta(html, 'article:published_time'), imageUrl: pageImage(html, url, null) })); } catch {} }

// Japanese editorial sites. Note is intentionally excluded.
const japaneseSources = [
  { source: 'GTO Wizard Japan', sourceSlug: 'gto-wizard-japan', sourceUrl: 'https://japan.gtowizard.com/articles/', api: 'https://japan.gtowizard.com/wp-json/wp/v2/posts' },
  { source: 'Poker Lab', sourceSlug: 'poker-lab', sourceUrl: 'https://poker-labs.com/', sitemap: 'https://poker-labs.com/post-sitemap.xml' },
  { source: 'ポーカーアカデミー', sourceSlug: 'poker-academy-jp', sourceUrl: 'https://pokeracademy.jp/', sitemap: 'https://pokeracademy.jp/wp-sitemap-posts-post-1.xml' },
  { source: 'ポーカー道', sourceSlug: 'poker-dou', sourceUrl: 'https://www.pokerdou.com/', sitemap: 'https://www.pokerdou.com/post-sitemap.xml' },
  { source: 'm Portal', sourceSlug: 'm-portal', sourceUrl: 'https://mpj-portal.jp/forbeginners/', sitemap: 'https://mpj-portal.jp/sitemap.xml', include: (url) => url.includes('/forbeginners/') },
  { source: 'AJPC', sourceSlug: 'ajpc', sourceUrl: 'https://www.ajpc.jp/', sitemap: 'https://www.ajpc.jp/post-sitemap.xml' },
  { source: 'LasVegas.co.jp', sourceSlug: 'lasvegas-jp', sourceUrl: 'https://www.lasvegas.co.jp/games/poker/', sitemap: 'https://lasvegas.co.jp/sitemap.xml', include: (url) => url.includes('/games/poker/') && !url.endsWith('/English.html') },
];
for (const source of japaneseSources) {
  const registeredSource = { slug: source.sourceSlug, name: source.source, url: source.sourceUrl, language: 'Japanese' };
  const sourceIndex = database.sources.findIndex((entry) => entry.slug === source.sourceSlug);
  if (sourceIndex >= 0) database.sources[sourceIndex] = registeredSource;
  else database.sources.push(registeredSource);
  if (source.api) {
    let page = 1; let totalPages = 1; const collected = [];
    do { const response = await fetch(`${source.api}?per_page=100&_embed&page=${page}`, { headers, redirect: 'follow' }); if (!response.ok) throw new Error(`${response.status} ${source.api}`); totalPages = Number(response.headers.get('x-wp-totalpages') || 1); const posts = await response.json(); for (const post of posts) { const title = decode(post.title?.rendered); let summary = decode(post.content?.rendered || post.excerpt?.rendered || ''); if (summary.startsWith(title)) summary = summary.slice(title.length).trim(); const article = item({ source: source.source, sourceSlug: source.sourceSlug, sourceUrl: source.sourceUrl, title, url: post.link, summary: (summary || title).slice(0, 280), publishedAt: post.date, imageUrl: post._embedded?.['wp:featuredmedia']?.[0]?.source_url, language: 'Japanese' }); article.author = decode(post._embedded?.author?.[0]?.name || '') || null; article.sourceModifiedAt = post.modified_gmt || null; collected.push(article); } page += 1; } while (page <= totalPages);
    additions.push(...collected); console.log(`${source.source}: refreshed ${collected.length}`); continue;
  }
  const homepage = await get(source.sourceUrl);
  const fallbackImage = pageImage(homepage, source.sourceUrl, '/sources/poker-hack.png');
  const entries = sitemapEntries(await get(source.sitemap)).filter((entry) => !source.include || source.include(entry.url));
  const toFetch = entries.filter(({ url, lastmod }) => { const current = existing.get(url); return !current || !current.imageUrl || (lastmod && current.sourceModifiedAt !== lastmod); });
  const collected = await mapLimit(toFetch, 8, async ({ url, lastmod }) => { const html = await get(url); const title = pageTitle(html); if (!title || /404|ページが見つかりません/i.test(title)) return null; const article = item({ source: source.source, sourceSlug: source.sourceSlug, sourceUrl: source.sourceUrl, title, url, summary: meta(html, 'description') || meta(html, 'og:description'), publishedAt: meta(html, 'article:published_time') || lastmod, imageUrl: pageImage(html, url, fallbackImage), language: 'Japanese' }); article.sourceModifiedAt = lastmod || null; return article; });
  additions.push(...collected);
  console.log(`${source.source}: discovered ${entries.length}, refreshed ${collected.length}`);
}
for (const article of additions) { const current = existing.get(article.originalUrl); if (current) Object.assign(current, article); else if (article.title && article.originalUrl) { database.articles.push(article); existing.set(article.originalUrl, article); } }
database.collectedAt = new Date().toISOString();
await writeFile('data/articles.json', JSON.stringify(database, null, 2) + '\n');
console.log(JSON.stringify({ fetched: additions.length, total: database.articles.length, missingImages: database.articles.filter((article) => !article.imageUrl).length, bySource: Object.fromEntries(Object.entries(database.articles.reduce((counts, article) => (counts[article.source] = (counts[article.source] || 0) + 1, counts), {})).sort()) }, null, 2));
