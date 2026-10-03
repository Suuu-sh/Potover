// Ephemeral workerd + SQLite-backed D1 verification. No remote account or credentials.
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {build} from 'esbuild';
import {Miniflare,convertV4MiniflareOptions} from 'miniflare';

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
  for(const file of (await readdir('worker/migrations')).filter(file=>file.endsWith('.sql')).sort()){
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
  assert.equal((await request('/api/sources')).sources.length,1);
  const listing=await request('/api/articles?limit=1');assert.equal(listing.total,1);assert.equal(listing.articles[0].slug,'legacy-1');
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
  assert.equal((await request('/api/articles')).total,1);
  const changed=await request('/api/auth/password',{method:'POST',token,body:{currentPassword:'local-test-password',newPassword:'another-test-password'}});
  await request('/api/auth/me',{token,status:401});
  await request('/api/auth/me',{token:changed.token});
  await request('/api/auth/account',{method:'DELETE',token:changed.token,body:{password:'another-test-password'}});
  await request('/api/auth/me',{token:changed.token,status:401});
  for(const table of ['users','sessions','bookmarks','learning_history','source_follows','user_preferences']){
    const row=await db.prepare(`SELECT COUNT(*) AS count FROM ${table}`).first();assert.equal(row.count,0,table);assertions++;
  }
  console.log(`Local workerd/D1 checks passed (${assertions} API/database checks; 6 migrations). No production access.`);
}finally{await mf.dispose();}
