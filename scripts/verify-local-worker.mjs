// Ephemeral workerd + SQLite-backed D1 verification. No remote account or credentials.
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {build} from 'esbuild';
import {Miniflare,convertV4MiniflareOptions} from 'miniflare';

const publicationScope=JSON.parse(await readFile('data/publication-scope.json','utf8'));
const {outputFiles}=await build({entryPoints:['worker/src/index.ts'],bundle:true,write:false,format:'esm',platform:'browser',target:'es2022'});
const mf=new Miniflare(convertV4MiniflareOptions({modules:true,script:outputFiles[0].text,compatibilityDate:'2026-08-31',d1Databases:['DB'],bindings:{BATCH_INGEST_TOKEN:'local-integration-only'}}));
let assertions=0;
async function request(path,{method='GET',token,body,status=200}={}){
  const response=await mf.dispatchFetch(`http://localhost${path}`,{method,headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{})},...(body===undefined?{}:{body:JSON.stringify(body)})});
  const result=await response.json();
  assert.equal(response.status,status,`${method} ${path}: ${JSON.stringify(result)}`);assertions++;
  return result;
}
try{
  const db=await mf.getD1Database('DB');
  const migrations=(await readdir('worker/migrations')).filter(file=>file.endsWith('.sql')).sort();
  for(const file of migrations){
    const sql=await readFile(`worker/migrations/${file}`,'utf8');
    for(const statement of sql.split(';').map(value=>value.trim()).filter(Boolean))await db.prepare(statement).run();
  }
  assert.equal((await request('/health')).ingestConfigured,true);
  await request('/api/articles',{method:'POST',body:{articles:[]},status:401});
  const {token}=await request('/api/auth/register',{method:'POST',body:{email:'local-only@example.test',password:'local-test-password'},status:201});
  await request('/api/auth/login',{method:'POST',body:{email:'local-only@example.test',password:'wrong-password'},status:401});
  await request('/api/auth/login',{method:'POST',body:{email:'local-only@example.test',password:'local-test-password'}});
  const source={slug:'test',name:'Test',url:'https://example.test',language:'English'};
  const article={slug:'legacy-1',sourceSlug:'test',source:'Test',sourceUrl:source.url,title:'A test article',originalUrl:'https://example.test/article',summary:'Test summary',language:'English',publishedAt:'2026-10-01T00:00:00Z',classification:{difficulty:'beginner',tags:['gto']}};
  await request('/api/articles',{method:'POST',token:'local-integration-only',body:{sources:[source],articles:[article],collectedAt:'2026-10-03T00:00:00Z'}});
  // Ingestion retains unrelated records without granting publication permission.
  assert.deepEqual((await request('/api/sources')).sources,[]);
  const listing=await request('/api/articles?limit=1');assert.equal(listing.total,0);assert.deepEqual(listing.articles,[]);
  const initialExport=await request('/api/articles/export',{token:'local-integration-only'});
  assert.equal(initialExport.total,1);assert.equal(initialExport.articles[0].slug,'legacy-1');
  assert.equal(initialExport.articles[0].summary,'Test summary');
  await request('/api/articles/export',{status:401});
  await request('/api/sources/export',{status:401});
  assert.deepEqual((await request('/api/sources/export',{token:'local-integration-only'})).sources,[source]);
  await request('/api/bookmarks',{method:'POST',token,body:{slug:'legacy-1',saved:true}});
  await request('/api/learning-history',{method:'POST',token,body:{slug:'legacy-1'}});
  await request('/api/preferences',{method:'POST',token,body:{language:'English',theme:'dark',docsQuery:'gto',docsFilters:['gto']}});
  await request('/api/source-follows',{method:'POST',token,body:{sourceSlug:'test',followed:true}});
  assert.deepEqual((await request('/api/bookmarks',{token})).slugs,['legacy-1']);
  assert.equal((await request('/api/learning-history',{token})).events.length,1);
  assert.equal((await request('/api/preferences',{token})).theme,'dark');
  assert.deepEqual((await request('/api/source-follows',{token})).sourceSlugs,['test']);
  // Check first-migration reference remapping and idempotent upsert with real constraints.
  await request('/api/articles',{method:'POST',token:'local-integration-only',body:{articles:[{...article,slug:'stable-1'}]}});
  assert.deepEqual((await request('/api/bookmarks',{token})).slugs,['stable-1']);
  assert.equal((await request('/api/learning-history',{token})).events[0].slug,'stable-1');
  await request('/api/articles',{method:'POST',token:'local-integration-only',body:{articles:[{...article,slug:'stable-1',title:'Updated title'}]}});
  assert.equal((await request('/api/articles')).total,0);
  const updatedExport=await request('/api/articles/export',{token:'local-integration-only'});
  assert.equal(updatedExport.total,1);assert.equal(updatedExport.articles[0].title,'Updated title');

  // The complete 1,244-entry manifest travels in one JSON binding to real D1.
  // Exact matches publish; matching just a source, slug, or URL never suffices.
  const [first,second]=publicationScope.articles;
  const otherSource=publicationScope.articles.find(value=>value.sourceSlug!==first.sourceSlug);
  assert.ok(otherSource);
  const approved=[first,second,otherSource];
  const identities=publicationScope.articles.filter(value=>!approved.some(item=>item.slug===value.slug)).slice(0,3);
  const hiddenIdentities=[
    {...identities[0],slug:'wrong-publication-slug'},
    {...identities[1],originalUrl:'https://example.test/wrong-publication-url'},
    {...identities[2],sourceSlug:publicationScope.sources.find(slug=>slug!==identities[2].sourceSlug)},
    {slug:'future-unapproved-article',sourceSlug:first.sourceSlug,originalUrl:'https://example.test/future-unapproved'},
    {slug:'excluded-pokernews-article',sourceSlug:'pokernews',originalUrl:'https://example.test/excluded-pokernews'},
    {slug:'excluded-m-portal-article',sourceSlug:'m-portal',originalUrl:'https://example.test/excluded-m-portal'},
  ];
  const fixtureArticles=[...approved,...hiddenIdentities].map((identity,index)=>({
    ...article,...identity,title:`Scope fixture ${index}`,publishedAt:`2026-10-${String(index+1).padStart(2,'0')}T00:00:00Z`,
    classification:{difficulty:'beginner',tags:index===1?['unique-public-tag']:['gto']},
  }));
  const fixtureSources=[...publicationScope.sources,'unapproved-source','pokernews','m-portal']
    .map(slug=>({...source,slug,name:slug}));
  await request('/api/articles',{method:'POST',token:'local-integration-only',body:{sources:fixtureSources,articles:fixtureArticles}});
  const publicSources=await request('/api/sources');
  assert.deepEqual(publicSources.sources.map(value=>value.slug).sort(),[...publicationScope.sources].sort());
  const fullSources=await request('/api/sources/export',{token:'local-integration-only'});
  assert.equal(fullSources.sources.length,fixtureSources.length+1);
  const scoped=await request('/api/articles?q=Scope%20fixture');
  assert.equal(scoped.total,3);
  assert.deepEqual(scoped.articles.map(value=>value.slug),[otherSource.slug,second.slug,first.slug]);
  assert.ok(scoped.articles.every(value=>!('summary' in value)&&!('headings' in value)&&!('imageUrl' in value)));
  // Query, source, and pagination operate on the same scoped set as total.
  const page=await request(`/api/articles?q=Scope%20fixture&source=${first.sourceSlug}&limit=1&offset=1`);
  assert.equal(page.total,2);assert.equal(page.limit,1);assert.equal(page.offset,1);
  assert.deepEqual(page.articles.map(value=>value.slug),[first.slug]);
  const endPage=await request('/api/articles?q=Scope%20fixture&limit=1&offset=3');
  assert.equal(endPage.total,3);assert.deepEqual(endPage.articles,[]);
  const tagSearch=await request('/api/articles?q=unique-public-tag');
  assert.equal(tagSearch.total,1);assert.equal(tagSearch.articles[0].slug,second.slug);
  for(const sourceSlug of ['pokernews','m-portal','unapproved-source']){
    const hidden=await request(`/api/articles?source=${sourceSlug}`);
    assert.equal(hidden.total,0);assert.deepEqual(hidden.articles,[]);
  }
  const tokenPublic=await request('/api/articles?mode=internal&full=true&export=true',{token:'local-integration-only'});
  assert.equal(tokenPublic.total,3);
  const allStored=await request('/api/articles/export',{token:'local-integration-only'});
  assert.equal(allStored.total,fixtureArticles.length+1);
  assert.equal(allStored.articles.length,fixtureArticles.length+1);
  assert.ok(allStored.articles.every(value=>value.summary==='Test summary'));
  for(const identity of hiddenIdentities)assert.ok(allStored.articles.some(value=>value.slug===identity.slug));
  const excludedExport=await request('/api/articles/export?source=pokernews&q=Scope%20fixture',{token:'local-integration-only'});
  assert.equal(excludedExport.total,1);assert.equal(excludedExport.articles[0].slug,'excluded-pokernews-article');
  assert.equal((await db.prepare('SELECT COUNT(*) AS count FROM articles').first()).count,fixtureArticles.length+1);
  const changed=await request('/api/auth/password',{method:'POST',token,body:{currentPassword:'local-test-password',newPassword:'another-test-password'}});
  await request('/api/auth/me',{token,status:401});
  await request('/api/auth/me',{token:changed.token});
  await request('/api/auth/account',{method:'DELETE',token:changed.token,body:{password:'another-test-password'}});
  await request('/api/auth/me',{token:changed.token,status:401});
  for(const table of ['users','sessions','bookmarks','learning_history','source_follows','user_preferences']){
    const row=await db.prepare(`SELECT COUNT(*) AS count FROM ${table}`).first();assert.equal(row.count,0,table);assertions++;
  }
  console.log(`Local workerd/D1 checks passed (${assertions} API/database checks; ${migrations.length} migrations). No production access.`);
}finally{await mf.dispose();}
