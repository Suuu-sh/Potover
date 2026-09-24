import {afterEach, expect, it, vi} from 'vitest';
import {AuthRequestError,authRequest} from './auth-request';
afterEach(()=>vi.unstubAllGlobals());
it('reports network failure in Japanese',async()=>{
  vi.stubGlobal('fetch',vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
  const error=await authRequest('/login').catch(reason=>reason);
  if(!(error instanceof AuthRequestError))throw new Error('Expected AuthRequestError');
  expect(error).toMatchObject({kind:'network',retryable:true});
  expect(error.message).toContain('認証サービスに接続できませんでした');
});
it('preserves server validation errors',async()=>{
  vi.stubGlobal('fetch',vi.fn().mockResolvedValue(Response.json({error:'パスワードが違います'},{status:401})));
  await expect(authRequest('/login')).rejects.toThrow('パスワードが違います');
});
it('handles non-JSON errors',async()=>{
  vi.stubGlobal('fetch',vi.fn().mockResolvedValue(new Response('Bad Gateway',{status:502})));
  const error=await authRequest('/login').catch(reason=>reason);
  if(!(error instanceof AuthRequestError))throw new Error('Expected AuthRequestError');
  expect(error).toMatchObject({kind:'invalid-response',retryable:false});
  expect(error.message).toContain('正しい応答を受け取れません');
});
it('returns successful responses',async()=>{
  vi.stubGlobal('fetch',vi.fn().mockResolvedValue(Response.json({user:{id:'test'}})));
  await expect(authRequest('/me')).resolves.toEqual({user:{id:'test'}});
});
