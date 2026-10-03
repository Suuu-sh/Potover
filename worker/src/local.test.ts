import {expect,it,vi} from 'vitest';
import local from './local';
import production,{type Env} from './index';
const env={DB:{prepare:()=>({first:async()=>({ok:1}),run:async()=>({})}),batch:async()=>[]}} as Env;
it.each(['http://127.0.0.1:3001','http://localhost:3001'])('allows local UI %s',async origin=>{
  for(const method of ['OPTIONS','GET']){
    const response=await local.fetch(new Request('http://localhost/health',{method,headers:{Origin:origin}}),env);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe(origin);
  }
});
it('does not allow unrelated origins',async()=>{
  const response=await local.fetch(new Request('http://localhost/health',{headers:{Origin:'https://example.com'}}),env);
  expect(response.headers.has('Access-Control-Allow-Origin')).toBe(false);
});
it('leaves production CORS unchanged',async()=>{
  const response=await production.fetch(new Request('https://api.test/health',{headers:{Origin:'http://127.0.0.1:3001'}}),env);
  expect(response.headers.get('Access-Control-Allow-Origin')).not.toBe('http://127.0.0.1:3001');
});
it.each(['/api/bookmarks','/api/learning-history','/api/preferences'])('requires authentication for %s',async pathname=>{
  const response=await production.fetch(new Request(`https://api.test${pathname}`),env);
  expect(response.status).toBe(401);
});
it.each([['/api/auth/password','POST'],['/api/auth/account','DELETE']] as const)('requires authentication for %s',async(pathname,method)=>{
  const response=await production.fetch(new Request(`https://api.test${pathname}`,{method}),env);
  expect(response.status).toBe(401);
});
it('fails closed when the D1 article-ingestion secret is missing',async()=>{
  const response=await production.fetch(new Request('https://api.test/api/articles',{
    method:'POST',headers:{Authorization:'Bearer any-value','Content-Type':'application/json'},body:'{"articles":[]}',
  }),{} as Env);
  expect(response.status).toBe(503);
});
it('rejects an invalid D1 article-ingestion token before reading the body',async()=>{
  const response=await production.fetch(new Request('https://api.test/api/articles',{
    method:'POST',headers:{Authorization:'Bearer wrong','Content-Type':'application/json'},body:'not-json',
  }),{...env,BATCH_INGEST_TOKEN:'expected'});
  expect(response.status).toBe(401);
});
it('deletes verified inactive accounts in one D1 batch only after explicit approval',async()=>{
  const statements:{query:string;values:unknown[]}[]=[];
  const DB={
    prepare(query:string){return {bind(...values:unknown[]){return {query,values}}}},
    async batch(batchStatements:{query:string;values:unknown[]}[]){statements.push(...batchStatements);return []},
  };
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-09-29T03:00:00.000Z'));
  try{
    await production.scheduled({}, {DB,POTOVER_ACCOUNT_RETENTION_ENABLED:'true'} as unknown as Env);
    expect(statements).toHaveLength(7);
    expect(statements.slice(2,6).every(statement=>statement.query.includes('user_id IN (SELECT id FROM users'))).toBe(true);
    expect(statements[6].query).toContain('DELETE FROM users');
    expect(statements.slice(2).every(statement=>statement.query.includes('last_activity_verified=1'))).toBe(true);
    expect(statements.slice(2).every(statement=>!statement.query.includes('created_at'))).toBe(true);
    expect(statements[6].values[0]).toBe('2024-09-29T03:00:00.000Z');
    expect(statements[1].values[0]).toBe(new Date('2026-09-28T03:00:00.000Z').getTime());
  }finally{
    vi.useRealTimers();
  }
});
