import { readFile, writeFile } from 'node:fs/promises';
const source = 'https://blog.gtowizard.com';
const started = Date.now();
const get = async (url) => { const res = await fetch(url, {headers:{'user-agent':'Potover metadata collector/0.1 (+https://potover.com)'}}); if (!res.ok) throw new Error(`${res.status} ${url}`); return res.text(); };
const decode = (s='') => s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,'$1').replace(/&amp;/g,'&').replace(/&#x27;/g,"'").replace(/&quot;/g,'"').trim();
const tag = (html, name) => { const m=html.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`,'i')); return decode(m?.[1]||''); };
const meta = (html, key) => { const esc=key.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'); const m=html.match(new RegExp(`<meta[^>]+(?:property|name)=["']${esc}["'][^>]+content=["']([^"']*)["']|<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${esc}["']`,'i')); return decode(m?.[1]||m?.[2]||''); };
const classify = (title, description) => { const text=`${title} ${description}`.toLowerCase(); const tags=[]; for(const [word,value] of [['preflop','preflop'],['flop','flop'],['turn','turn'],['river','river'],['gto','gto'],['icm','icm'],['exploit','exploit'],['bluff','bluff'],['cash','cash-game'],['mtt','mtt'],['tournament','mtt'],['spin','spin']]) if(text.includes(word)) tags.push(value); return {difficulty:text.includes('beginner')?'beginner':(tags.includes('icm')||tags.includes('exploit')?'intermediate':'intermediate'),tags:[...new Set(tags)]}; };
const database=JSON.parse(await readFile('data/articles.json','utf8'));
const sitemap=await get(`${source}/sitemap-posts.xml`); const urls=[...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>m[1].trim());
const items=[]; let failures=0;
for(let i=0;i<urls.length;i+=5){ const batch=urls.slice(i,i+5); const results=await Promise.all(batch.map(async url=>{try{const html=await get(url);const title=meta(html,'og:title')||tag(html,'title');const description=meta(html,'description')||meta(html,'og:description');const published=meta(html,'article:published_time');const author=meta(html,'author');const image=meta(html,'og:image');return {source:'GTO Wizard',sourceSlug:'gto-wizard',sourceUrl:source,title,originalUrl:url,author:author||null,publishedAt:published||null,summary:description,language:'English',imageUrl:image||null,contentType:'article',classification:classify(title,description)};}catch{failures++;return null;}})); items.push(...results.filter(Boolean)); if(i+5<urls.length) await new Promise(r=>setTimeout(r,150)); console.log(`progress ${Math.min(i+5,urls.length)}/${urls.length}`); }
const seen=new Set();const deduped=items.filter(x=>x.title&&x.summary&&(!seen.has(x.originalUrl)&&seen.add(x.originalUrl)));
const existing=new Map(database.articles.map(article=>[article.originalUrl,article])); let added=0;
for(const article of deduped){ const previous=existing.get(article.originalUrl); if(previous) Object.assign(previous,article); else { database.articles.push(article); added++; } }
database.collectedAt=new Date().toISOString();
await writeFile('data/articles.json',`${JSON.stringify(database,null,2)}\n`);
console.log(JSON.stringify({source:'GTO Wizard',discovered:urls.length,newArticles:added,updatedArticles:deduped.length-added,duplicates:items.length-deduped.length,failures,totalArticles:database.articles.length,elapsedMs:Date.now()-started},null,2));
