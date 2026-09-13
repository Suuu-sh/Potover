import {afterEach, expect, it, vi} from 'vitest';
import {authRequest} from './auth-request';
afterEach(()=>vi.unstubAllGlobals());
it('reports network failure in Japanese',async()=>{
  vi.stubGlobal('fetch',vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
  await expect(authRequest('/login')).rejects.toThrow('認証サーバーに接続できません');
});
it('preserves server validation errors',async()=>{
  vi.stubGlobal('fetch',vi.fn().mockResolvedValue(Response.json({error:'パスワードが違います'},{status:401})));
  await expect(authRequest('/login')).rejects.toThrow('パスワードが違います');
});
it('handles non-JSON errors',async()=>{
  vi.stubGlobal('fetch',vi.fn().mockResolvedValue(new Response('Bad Gateway',{status:502})));
  await expect(authRequest('/login')).rejects.toThrow('正しい応答を受信できません');
});
it('returns successful responses',async()=>{
  vi.stubGlobal('fetch',vi.fn().mockResolvedValue(Response.json({user:{id:'test'}})));
  await expect(authRequest('/me')).resolves.toEqual({user:{id:'test'}});
});
