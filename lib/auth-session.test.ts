import {describe,expect,it,vi} from 'vitest';
import {AuthRequestError} from './auth-request';
import {restoreSession} from './auth-session';

describe('session restoration',()=>{
  it.each([
    new AuthRequestError('offline','network'),
    new AuthRequestError('unavailable','server',503),
    new AuthRequestError('bad gateway','invalid-response',502),
    new AuthRequestError('invalid response','invalid-response',200),
    new AuthRequestError('forbidden','client',403),
    new Error('unexpected failure'),
  ])('keeps the stored token after %s',async error=>{
    let token:string|null='existing-session';
    const clear=vi.fn(()=>{token=null});
    const result=await restoreSession(async()=>{throw error},clear);
    expect(result.state).toBe('unavailable');
    expect(clear).not.toHaveBeenCalled();
    expect(token).toBe('existing-session');
  });
  it('recovers the same session when a failed request is retried',async()=>{
    let token:string|null='existing-session';
    const user={id:'user-a',email:'a@example.test'};
    const clear=vi.fn(()=>{token=null});
    const read=vi.fn<()=>Promise<{user:typeof user}>>()
      .mockRejectedValueOnce(new AuthRequestError('unavailable','server',503))
      .mockResolvedValueOnce({user});
    expect((await restoreSession(read,clear)).state).toBe('unavailable');
    expect(await restoreSession(read,clear)).toEqual({state:'authenticated',user});
    expect(token).toBe('existing-session');
    expect(clear).not.toHaveBeenCalled();
  });
  it.each(['client','invalid-response'] as const)('clears a session on an explicit 401 (%s)',async kind=>{
    let token:string|null='expired-session';
    const clear=vi.fn(()=>{token=null});
    expect(await restoreSession(async()=>{throw new AuthRequestError('expired',kind,401)},clear))
      .toEqual({state:'expired'});
    expect(clear).toHaveBeenCalledOnce();
    expect(token).toBeNull();
  });
});
