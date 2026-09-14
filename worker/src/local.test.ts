import {expect,it} from 'vitest';
import local from './local';
import production,{type Env} from './index';
const env={} as Env;
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
