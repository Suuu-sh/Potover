import {afterEach, describe, expect, it, vi} from 'vitest';
import worker from './index';

type Call = {query: string; values: unknown[]; operation: 'first' | 'all' | 'run' | 'batch'};
function database(options: {user?: {id: string; email: string}; attempts?: number; rows?: unknown[]; total?: number; credentials?: {password_hash:string;password_salt:string}; batchError?: Error} = {}) {
  const calls: Call[] = [];
  const DB = {
    prepare(query: string) {
      let values: unknown[] = [];
      const statement = {
        query,
        get values() {return values},
        bind(...args: unknown[]) {values = args; return statement},
        async first() {
          calls.push({query, values, operation: 'first'});
          if (query.includes('INSERT INTO auth_rate_limits')) return {attempt_count: options.attempts ?? 1};
          if (query.includes('FROM sessions JOIN users')) return options.user ?? null;
          if (query.includes('SELECT password_hash,password_salt FROM users')) return options.credentials ?? null;
          if (query.includes('COUNT(*) AS total')) return {total: options.total ?? 0};
          if (query.includes('SELECT 1 AS ok')) return {ok: 1};
          return null;
        },
        async all() {calls.push({query, values, operation: 'all'}); return {results: options.rows ?? []}},
        async run() {calls.push({query, values, operation: 'run'}); return {success: true}},
      };
      return statement;
    },
    async batch(statements: unknown[]) {calls.push({query: '', values: statements, operation: 'batch'}); if(options.batchError)throw options.batchError; return []},
  };
  return {DB, calls};
}
const sampleArticle = {
  source: 'Sample source', sourceSlug: 'sample-source', title: 'Sample title',
  originalUrl: 'https://example.com/article', summary: 'A sample article summary.',
  language: 'English', contentType: 'article', classification: {difficulty: 'beginner', tags: ['gto']},
};
function post(path: string, body: unknown, method = 'POST') {
  return new Request(`https://api.example.test${path}`, {
    method, headers: {'Content-Type': 'application/json', Authorization: 'Bearer test-token', 'CF-Connecting-IP': '192.0.2.1'},
    body: JSON.stringify(body),
  });
}
afterEach(() => {vi.useRealTimers(); vi.unstubAllGlobals()});

describe('article ingestion', () => {
  it.each([undefined, ''])('fails closed with a missing or empty ingestion secret', async token => {
    const {DB, calls} = database();
    const response = await worker.fetch(post('/api/articles', {articles: [sampleArticle]}), {DB, BATCH_INGEST_TOKEN: token});
    expect(response.status).toBe(503);
    expect(calls).toHaveLength(0);
  });
  it('rejects the wrong bearer token before reading or writing data', async () => {
    const {DB, calls} = database();
    const response = await worker.fetch(post('/api/articles', null), {DB, BATCH_INGEST_TOKEN: 'different-token'});
    expect(response.status).toBe(401);
    expect(calls).toHaveLength(0);
  });
  it.each([null, [], 'string', 123, false])('rejects non-object JSON: %j', async value => {
    const {DB, calls} = database();
    const response = await worker.fetch(post('/api/articles', value), {DB, BATCH_INGEST_TOKEN: 'test-token'});
    expect(response.status).toBe(400);
    expect(calls).toHaveLength(0);
  });
  it('rejects malformed JSON', async () => {
    const {DB, calls} = database();
    const request = new Request('https://api.example.test/api/articles', {method: 'POST', headers: {Authorization: 'Bearer test-token'}, body: '{'});
    expect((await worker.fetch(request, {DB, BATCH_INGEST_TOKEN: 'test-token'})).status).toBe(400);
    expect(calls).toHaveLength(0);
  });
  it.each([
    {articles: Array.from({length: 101}, () => sampleArticle)},
    {sources: Array.from({length: 201}, () => ({slug: 'example'}))},
    {articles: [{...sampleArticle, originalUrl: 'javascript:alert(1)'}]},
    {articles: [{...sampleArticle, summary: 'a'.repeat(2001)}]},
    {articles: [sampleArticle, {...sampleArticle, language: 'invalid'}]},
  ])('validates the complete request before writes', async value => {
    const {DB, calls} = database();
    expect((await worker.fetch(post('/api/articles', value), {DB, BATCH_INGEST_TOKEN: 'test-token'})).status).toBe(400);
    expect(calls).toHaveLength(0);
  });
  it('rejects an oversized ingestion body even without Content-Length', async () => {
    const {DB, calls} = database();
    const request = post('/api/articles', {ignored: 'x'.repeat(1024 * 1024), articles: []});
    expect(request.headers.has('Content-Length')).toBe(false);
    expect((await worker.fetch(request, {DB, BATCH_INGEST_TOKEN: 'test-token'})).status).toBe(413);
    expect(calls).toHaveLength(0);
  });
  it('stops reading chunked bodies once the byte limit is exceeded', async () => {
    const {DB, calls} = database();
    const cancel = vi.fn();
    let reads = 0;
    const body = new ReadableStream<Uint8Array>({
      pull(controller) {reads++; controller.enqueue(new Uint8Array(512 * 1024))},
      cancel,
    });
    const request = new Request('https://api.example.test/api/articles', {
      method: 'POST', headers: {Authorization: 'Bearer test-token'}, body, duplex: 'half',
    } as RequestInit);
    expect((await worker.fetch(request, {DB, BATCH_INGEST_TOKEN: 'test-token'})).status).toBe(413);
    expect(cancel).toHaveBeenCalledOnce();
    expect(reads).toBeLessThanOrEqual(4);
    expect(calls).toHaveLength(0);
  });
  it('binds untrusted values and acknowledges validated writes', async () => {
    const {DB, calls} = database();
    const title = "Robert'); DROP TABLE articles; --";
    const response = await worker.fetch(post('/api/articles', {articles: [{...sampleArticle, title}]}), {DB, BATCH_INGEST_TOKEN: 'test-token'});
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ok: true, count: 1});
    const write = calls.find(call => call.query.includes('INSERT INTO articles'));
    expect(write?.values).toContain(title);
    expect(write?.query).not.toContain(title);
    expect(write?.values[0]).toMatch(/^[a-z0-9][a-z0-9-]{0,159}$/);
    expect(response.headers.get('Cache-Control')).toBe('no-store');
  });
});

describe('authentication and user input', () => {
  it.each([['register', 6], ['login', 11]] as const)('rate limits %s before credential work', async (action, attempts) => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-03T12:01:00.000Z'));
    const {DB, calls} = database({attempts});
    const response = await worker.fetch(post(`/api/auth/${action}`, null), {DB});
    expect(response.status).toBe(429);
    expect(response.headers.get('Retry-After')).toBe('840');
    expect(calls).toHaveLength(1);
    expect(calls[0].values[0]).toBe(action);
    expect(calls[0].values[1]).toMatch(/^[a-f0-9]{64}$/);
    expect(calls[0].values).not.toContain('192.0.2.1');
  });
  it.each([
    ['/api/auth/register', 'POST'], ['/api/auth/login', 'POST'], ['/api/auth/password', 'POST'],
    ['/api/auth/account', 'DELETE'], ['/api/bookmarks', 'POST'], ['/api/learning-history', 'POST'],
    ['/api/preferences', 'POST'], ['/api/source-follows', 'POST'],
  ])('rejects null JSON safely at %s', async (path, method) => {
    const {DB} = database({user: {id: 'user-a', email: 'a@example.test'}});
    const response = await worker.fetch(post(path, null, method), {DB});
    expect(response.status).toBe(400);
  });
  it('rejects oversized authentication bodies', async () => {
    const {DB, calls} = database();
    const response = await worker.fetch(post('/api/auth/register', {email: 'a@example.test', password: '12345678', ignored: 'x'.repeat(32 * 1024)}), {DB});
    expect(response.status).toBe(413);
    expect(calls.some(call => call.query.includes('INSERT INTO users'))).toBe(false);
  });
  it('stores only a password hash and a hashed session token', async () => {
    const {DB, calls} = database();
    const password = 'test-password-only';
    const response = await worker.fetch(post('/api/auth/register', {email: ' Test@Example.Test ', password}), {DB});
    expect(response.status).toBe(201);
    const body = await response.json() as {token: string; user: {id: string; email: string}};
    expect(body.user.email).toBe('test@example.test');
    expect(body.token).toMatch(/^[a-f0-9]{64}$/);
    const userWrite = calls.find(call => call.query.includes('INSERT INTO users'));
    expect(userWrite?.values[2]).toMatch(/^[a-f0-9]{64}$/);
    expect(userWrite?.values[3]).toMatch(/^[a-f0-9]{32}$/);
    expect(userWrite?.values).not.toContain(password);
    const sessionWrite = calls.find(call => call.query.includes('INSERT INTO sessions'));
    expect(sessionWrite?.values[0]).toMatch(/^[a-f0-9]{64}$/);
    expect(sessionWrite?.values).not.toContain(body.token);
    expect(sessionWrite?.values[1]).toBe(body.user.id);
  });
  it('always scopes bookmark reads to the authenticated user', async () => {
    const {DB, calls} = database({user: {id: 'user-a', email: 'a@example.test'}});
    const response = await worker.fetch(new Request('https://api.example.test/api/bookmarks?user_id=user-b', {headers: {Authorization: 'Bearer token'}}), {DB});
    expect(response.status).toBe(200);
    const read = calls.find(call => call.query.includes('SELECT article_slug FROM bookmarks'));
    expect(read?.values).toEqual(['user-a']);
  });
});

describe('public article search', () => {
  const storedArticle = {
    slug: 'sample-article', source: 'Sample Source', source_slug: 'sample-source', source_url: 'https://example.test',
    title: 'Sample title', original_url: 'https://example.test/article', published_at: '2026-10-01T00:00:00Z',
    language: 'English', content_type: 'video', difficulty: 'beginner', tags_json: '["gto"]', category: 'GTO',
    author: 'Sample author', summary: 'Private source summary', image_url: 'https://example.test/video-thumbnail.jpg',
    duration_seconds: 123, headings_json: '[{"level":2,"text":"Private source heading"}]',
    source_modified_at: '2026-10-02T00:00:00Z', excerpt: 'Private excerpt', raw_json: '{"private":true}',
  };
  const publicArticle = {
    slug: 'sample-article', source: 'Sample Source', sourceSlug: 'sample-source', sourceUrl: 'https://example.test',
    title: 'Sample title', originalUrl: 'https://example.test/article', publishedAt: '2026-10-01T00:00:00Z',
    language: 'English', contentType: 'video', classification: {difficulty: 'beginner', tags: ['gto']}, category: 'GTO',
  };
  it.each(['', '?mode=internal&full=true&export=true'])('only publishes whitelisted metadata even with an ingestion token: %s', async query => {
    const {DB, calls} = database({rows: [storedArticle], total: 1});
    const request = new Request(`https://api.example.test/api/articles${query}`, {headers: {Authorization: 'Bearer test-token'}});
    const response = await worker.fetch(request, {DB, BATCH_INGEST_TOKEN: 'test-token'});
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({articles: [publicArticle], total: 1, offset: 0, limit: 100, collectedAt: null});
    const read = calls.find(call => call.operation === 'all')!;
    expect(read.query).not.toMatch(/a\.\*|summary|headings|image_url|author|duration_seconds|source_modified_at/);
  });
  it.each([undefined, ''])('fails closed for full exports with no configured secret: %j', async token => {
    const {DB, calls} = database({rows: [storedArticle], total: 1});
    const response = await worker.fetch(new Request('https://api.example.test/api/articles/export'), {DB, BATCH_INGEST_TOKEN: token});
    expect(response.status).toBe(503);
    expect(calls).toHaveLength(0);
  });
  it.each([undefined, 'Bearer wrong-token', 'Bearer ', 'Basic test-token'])('rejects unauthorized full exports before database access: %j', async authorization => {
    const {DB, calls} = database({rows: [storedArticle], total: 1});
    const request = new Request('https://api.example.test/api/articles/export', {headers: authorization ? {Authorization: authorization} : {}});
    const response = await worker.fetch(request, {DB, BATCH_INGEST_TOKEN: 'test-token'});
    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({error: 'Unauthorized'});
    expect(calls).toHaveLength(0);
  });
  it('preserves all existing source fields on authenticated full exports', async () => {
    const {DB, calls} = database({rows: [storedArticle], total: 1});
    const request = new Request('https://api.example.test/api/articles/export', {headers: {Authorization: 'Bearer test-token'}});
    const response = await worker.fetch(request, {DB, BATCH_INGEST_TOKEN: 'test-token'});
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      articles: [{...publicArticle, author: storedArticle.author, summary: storedArticle.summary,
        imageUrl: storedArticle.image_url, durationSeconds: storedArticle.duration_seconds,
        headings: [{level: 2, text: 'Private source heading'}], sourceModifiedAt: storedArticle.source_modified_at}],
      total: 1, offset: 0, limit: 100, collectedAt: null,
    });
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    expect(calls.some(call => call.operation === 'all' && call.query.includes('SELECT a.*'))).toBe(true);
    expect(calls.every(call => call.operation === 'first' || call.operation === 'all')).toBe(true);
  });
  it('clamps pagination and binds query and source filters', async () => {
    const {DB, calls} = database();
    const query = "'; DROP TABLE users; --";
    const url = new URL('https://api.example.test/api/articles');
    url.search = new URLSearchParams({q: query, source: query, limit: '-1', offset: '-2'}).toString();
    const response = await worker.fetch(new Request(url), {DB});
    expect(response.status).toBe(200);
    const read = calls.find(call => call.operation === 'all');
    expect(read?.query).not.toContain(query);
    expect(read?.values).toEqual([`%${query}%`, `%${query}%`, query, 1, 0]);
    expect(calls.every(call => !call.query.includes('a.summary'))).toBe(true);
  });
  it('uses safe defaults for non-finite pagination', async () => {
    const {DB, calls} = database();
    await worker.fetch(new Request('https://api.example.test/api/articles?limit=NaN&offset=Infinity'), {DB});
    expect(calls.find(call => call.operation === 'all')?.values).toEqual([100, 0]);
  });
});

async function testCredentials(password:string){
  // Ephemeral salt for this mock only; no stored or external credentials.
  const salt=crypto.getRandomValues(new Uint8Array(16));
  const password_salt=Array.from(salt,byte=>byte.toString(16).padStart(2,'0')).join('');
  const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveBits']);
  const bits=await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt,iterations:100000},key,256);
  const password_hash=Array.from(new Uint8Array(bits),byte=>byte.toString(16).padStart(2,'0')).join('');
  return {password_hash,password_salt};
}
describe('atomic account changes',()=>{
  const user={id:'user-a',email:'a@example.test'};
  const password='current-password';
  it('changes credentials, revokes old sessions, and creates the new session in one batch',async()=>{
    const credentials=await testCredentials(password);
    const {DB,calls}=database({user,credentials});
    const response=await worker.fetch(post('/api/auth/password',{currentPassword:password,newPassword:'replacement-password'}),{DB});
    expect(response.status).toBe(200);
    const result=await response.json() as {token:string};
    const batch=calls.find(call=>call.operation==='batch')!.values as {query:string;values:unknown[]}[];
    expect(batch).toHaveLength(3);
    expect(batch[0].query).toContain('UPDATE users SET password_hash=');
    expect(batch[0].values[0]).not.toBe(credentials.password_hash);
    expect(batch[0].values[0]).not.toBe('replacement-password');
    expect(batch[0].values[3]).toBe(user.id);
    expect(batch[1]).toMatchObject({query:'DELETE FROM sessions WHERE user_id=?',values:[user.id]});
    expect(batch[2].query).toContain('INSERT INTO sessions');
    expect(batch[2].values[0]).not.toBe(result.token);
    expect(batch[2].values[1]).toBe(user.id);
    expect(calls.filter(call=>call.operation==='run').every(call=>call.query.startsWith('UPDATE users SET last_activity_at='))).toBe(true);
  });
  it('deletes the account and related data in one batch',async()=>{
    const {DB,calls}=database({user,credentials:await testCredentials(password)});
    const response=await worker.fetch(post('/api/auth/account',{password},'DELETE'),{DB});
    expect(response.status).toBe(200);
    const batch=calls.find(call=>call.operation==='batch')!.values as {query:string;values:unknown[]}[];
    expect(batch).toHaveLength(6);
    expect(batch.map(statement=>statement.query)).toEqual([
      'DELETE FROM sessions WHERE user_id=?','DELETE FROM source_follows WHERE user_id=?',
      'DELETE FROM bookmarks WHERE user_id=?','DELETE FROM learning_history WHERE user_id=?',
      'DELETE FROM user_preferences WHERE user_id=?','DELETE FROM users WHERE id=?',
    ]);
    expect(batch.every(statement=>statement.values.length===1&&statement.values[0]===user.id)).toBe(true);
    expect(calls.some(call=>call.operation==='run'&&call.query.startsWith('DELETE'))).toBe(false);
  });
  it.each(['/api/auth/password','/api/auth/account'])('does not perform standalone destructive writes when the transaction fails at %s',async path=>{
    const {DB,calls}=database({user,credentials:await testCredentials(password),batchError:new Error('Simulated transaction failure')});
    const body=path.endsWith('/password')?{currentPassword:password,newPassword:'replacement-password'}:{password};
    const method=path.endsWith('/account')?'DELETE':'POST';
    await expect(worker.fetch(post(path,body,method),{DB})).rejects.toThrow('Simulated transaction failure');
    expect(calls.filter(call=>call.operation==='batch')).toHaveLength(1);
    expect(calls.filter(call=>call.operation==='run').every(call=>call.query.startsWith('UPDATE users SET last_activity_at='))).toBe(true);
  });
  it.each(['/api/auth/password','/api/auth/account'])('does not start a transaction on an incorrect password at %s',async path=>{
    const {DB,calls}=database({user,credentials:await testCredentials(password)});
    const body=path.endsWith('/password')?{currentPassword:'wrong-password',newPassword:'replacement-password'}:{password:'wrong-password'};
    const method=path.endsWith('/account')?'DELETE':'POST';
    expect((await worker.fetch(post(path,body,method),{DB})).status).toBe(401);
    expect(calls.some(call=>call.operation==='batch')).toBe(false);
  });
});
