import { readFile, writeFile } from 'node:fs/promises';

const headers = { 'user-agent': 'Potover metadata collector/0.1' };
const get = async (url) => { const r = await fetch(url, { headers }); if (!r.ok) throw new Error(`${r.status} ${url}`); return r.text(); };
const decode = (s = '') => s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').replace(/&#8217;/g, '’').replace(/&#8216;/g, '‘').replace(/&#038;|&amp;/g, '&').replace(/&#8211;/g, '–').replace(/&#8212;/g, '—').replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/<[^>]+>/g, '').trim();
const meta = (html, key) => { const e = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); const r = new RegExp(`<meta[^>]+(?:property|name)=["']${e}["'][^>]+content=["']([^"']*)|<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${e}["']`, 'i').exec(html); return decode(r?.[1] || r?.[2] || ''); };
const classify = (title, summary) => { const t = `${title} ${summary}`.toLowerCase(); const tags = []; for (const [a, b] of [['preflop','preflop'],['flop','flop'],['turn','turn'],['river','river'],['gto','gto'],['icm','icm'],['exploit','exploit'],['bluff','bluff'],['cash','cash-game'],['tournament','mtt'],['mtt','mtt']]) if (t.includes(a)) tags.push(b); return { difficulty: /beginner|basic|fundamental/.test(t) ? 'beginner' : 'intermediate', tags: [...new Set(tags)] }; };
const item = ({ source, sourceSlug, sourceUrl, title, url, summary, publishedAt, imageUrl }) => ({ source, sourceSlug, sourceUrl, title, originalUrl: url, author: null, publishedAt: publishedAt || null, summary: summary || title, language: 'English', imageUrl: imageUrl || null, contentType: 'article', classification: classify(title, summary || '') });

const articles = JSON.parse(await readFile('data/articles.json', 'utf8'));
const additions = [];

// WordPress RSS is the least invasive public metadata endpoint.
const rss = await get('https://upswingpoker.com/feed/');
for (const m of rss.matchAll(/<item>([\s\S]*?)<\/item>/g)) { const x = m[1]; const pick = (n) => decode(new RegExp(`<${n}[^>]*>([\s\S]*?)<\/${n}>`, 'i').exec(x)?.[1] || ''); additions.push(item({ source:'Upswing Poker', sourceSlug:'upswing-poker', sourceUrl:'https://upswingpoker.com/', title:pick('title'), url:pick('link'), summary:pick('description'), publishedAt:pick('pubDate') })); }
for (const x of additions.filter((x) => x.sourceSlug === 'upswing-poker' && x.originalUrl)) { try { const html = await get(x.originalUrl); x.imageUrl = meta(html, 'og:image') || /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)/i.exec(html)?.[1] || null; } catch {} }
for (const x of articles.articles.filter((x) => x.source === 'Upswing Poker' && x.originalUrl && !x.imageUrl)) { try { const html = await get(x.originalUrl); x.imageUrl = meta(html, 'og:image') || /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)/i.exec(html)?.[1] || null; } catch {} }

// PokerCoaching exposes a public WordPress REST feed for posts.
const wp = await get('https://pokercoaching.com/blog/wp-json/wp/v2/posts?per_page=100&_embed');
for (const x of JSON.parse(wp)) additions.push(item({ source:'PokerCoaching.com', sourceSlug:'pokercoaching', sourceUrl:'https://pokercoaching.com/blog/', title:decode(x.title?.rendered), url:x.link, summary:decode(x.excerpt?.rendered), publishedAt:x.date, imageUrl:x._embedded?.['wp:featuredmedia']?.[0]?.source_url }));

// PokerNews publishes its strategy index as a public HTML listing.
const pn = await get('https://www.pokernews.com/strategy/');
const urls = [...new Set([...pn.matchAll(/href=["'](\/strategy\/[a-z0-9][^"']+\.htm)["']/gi)].map((m) => `https://www.pokernews.com${m[1]}`))].slice(-40);
for (const url of urls) { try { const html = await get(url); const title = meta(html, 'og:title') || meta(html, 'title'); const summary = meta(html, 'description') || meta(html, 'og:description'); if (title) additions.push(item({ source:'PokerNews', sourceSlug:'pokernews', sourceUrl:'https://www.pokernews.com/strategy/', title, url, summary, publishedAt:meta(html, 'article:published_time'), imageUrl:meta(html, 'og:image') })); } catch {} }

const existing = new Map(articles.articles.map((x) => [x.originalUrl, x]));
for (const x of additions) if (x.imageUrl && existing.has(x.originalUrl)) existing.get(x.originalUrl).imageUrl = x.imageUrl;
const seen = new Set(articles.articles.map((x) => x.originalUrl));
for (const x of additions) if (x.title && x.originalUrl && !seen.has(x.originalUrl)) { seen.add(x.originalUrl); articles.articles.push(x); }
articles.collectedAt = new Date().toISOString();
await writeFile('data/articles.json', JSON.stringify(articles, null, 2) + '\n');
console.log(JSON.stringify({ fetched: additions.length, total: articles.articles.length, bySource: Object.fromEntries(Object.entries(articles.articles.reduce((a, x) => (a[x.source] = (a[x.source] || 0) + 1, a), {}))) }, null, 2));
