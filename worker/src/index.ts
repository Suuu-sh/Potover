export interface Env {
  DB: {
    prepare: (query: string) => any;
    batch: (statements: any[]) => Promise<unknown>;
  };
  BATCH_INGEST_TOKEN?: string;
}

const USER_RETENTION_YEARS = 2;
const RATE_LIMIT_RETENTION_MS = 24 * 60 * 60 * 1000;

const allowedOrigins = new Set([
  'https://potover.com',
  'https://www.potover.com',
  'https://potover.pages.dev',
  'http://localhost:3000',
  'http://localhost:3001',
]);
const isAllowedOrigin = (origin: string) =>
  allowedOrigins.has(origin) || /^https:\/\/[a-z0-9-]+\.potover\.pages\.dev$/.test(origin);
const corsHeaders = (request: Request) => {
  const origin = request.headers.get('origin') || '';
  return {
    'Access-Control-Allow-Origin': isAllowedOrigin(origin) ? origin : 'https://potover.com',
    'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Max-Age': '86400',
    'Cache-Control': 'no-store',
    Vary: 'Origin',
  };
};
const json = (request: Request, body: unknown, init: ResponseInit = {}) =>
  new Response(JSON.stringify(body), {
    ...init,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...corsHeaders(request),
      ...(init.headers || {}),
    },
  });
// Bound bytes while streaming, rather than trusting Content-Length or parsing
// an arbitrarily large body first. Authentication remains ahead of ingestion.
class RequestBodyError extends Error {
  constructor(readonly status: 400 | 413) { super('Invalid request body'); }
}
async function readRequestObject(request: Request, maxBytes = 32 * 1024): Promise<Record<string, unknown>> {
  const declaredLength = Number(request.headers.get('Content-Length'));
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) throw new RequestBodyError(413);
  const reader = request.body?.getReader();
  if (!reader) throw new RequestBodyError(400);
  const decoder = new TextDecoder();
  let size = 0;
  let text = '';
  try {
    while (true) {
      const {done, value} = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) {
        await reader.cancel();
        throw new RequestBodyError(413);
      }
      text += decoder.decode(value, {stream: true});
    }
    text += decoder.decode();
  } finally {
    reader.releaseLock();
  }
  const value: unknown = JSON.parse(text);
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new RequestBodyError(400);
  return value as Record<string, unknown>;
}
const requestBodyError = (request: Request, error: unknown) => json(request, {
  error: error instanceof RequestBodyError && error.status === 413
    ? '送信データが大きすぎます。' : '入力内容を確認してください。',
}, {status: error instanceof RequestBodyError ? error.status : 400});

const bytesToHex = (bytes: Uint8Array) => Array.from(bytes, value => value.toString(16).padStart(2, '0')).join('');
const hexToBytes = (hex: string) => new Uint8Array(hex.match(/.{2}/g)?.map(byte => parseInt(byte, 16)) || []);
const randomHex = (length: number) => {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bytesToHex(bytes);
};
const sha256 = async (value: string) =>
  bytesToHex(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))));
const PASSWORD_HASH_ITERATIONS = 100000;
const hashPassword = async (password: string, saltHex: string) => {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: hexToBytes(saltHex), iterations: PASSWORD_HASH_ITERATIONS },
    key,
    256,
  );
  return bytesToHex(new Uint8Array(bits));
};
const safeEqual = (left: string, right: string) => {
  if (left.length !== right.length) return false;
  let result = 0;
  for (let index = 0; index < left.length; index++) result |= left.charCodeAt(index) ^ right.charCodeAt(index);
  return result === 0;
};
const normalizeEmail = (value: unknown) => (typeof value === 'string' ? value.trim().toLowerCase() : '');
const validEmail = (email: string) => /^\S+@\S+\.\S+$/.test(email) && email.length <= 254;
const bearerToken = (request: Request) => {
  const value = request.headers.get('authorization') || '';
  return value.startsWith('Bearer ') ? value.slice(7) : '';
};
const validArticleSlug = (value: unknown): value is string =>
  typeof value === 'string' && value.length > 0 && value.length <= 160 && /^[a-z0-9][a-z0-9-]*$/.test(value);
const validText = (value: unknown, maxLength: number, allowEmpty = false): value is string =>
  typeof value === 'string' && value.length <= maxLength && (allowEmpty || value.trim().length > 0);
const validWebUrl = (value: unknown, allowRelative = false): value is string => {
  if (typeof value !== 'string') return false;
  if (allowRelative && value.startsWith('/')) return true;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
};
const parseStringArray = (value: unknown, maxItems = 100): string[] => {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === 'string').slice(0, maxItems);
  if (typeof value === 'string') {
    try {
      return parseStringArray(JSON.parse(value), maxItems);
    } catch {
      return [];
    }
  }
  return [];
};
const parseHeadings = (value: unknown) => {
  if (Array.isArray(value)) {
    return value
      .filter((item): item is { level: number; text: string } =>
        !!item && typeof item === 'object' && Number.isInteger((item as any).level) &&
        (item as any).level >= 1 && (item as any).level <= 6 && validText((item as any).text, 500),
      )
      .slice(0, 100);
  }
  if (typeof value === 'string') {
    try {
      return parseHeadings(JSON.parse(value));
    } catch {
      return [];
    }
  }
  return [];
};
const defaultArticleSlug = async (title: string, originalUrl: string, sourceSlug: string) => {
  const slugPart = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 90) || sourceSlug;
  return `${slugPart}-${(await sha256(originalUrl)).slice(0, 12)}`;
};

async function createSession(env: Env, userId: string) {
  const token = randomHex(32);
  const tokenHash = await sha256(token);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
  await env.DB.prepare('UPDATE users SET last_activity_at=? WHERE id=?').bind(now.toISOString(), userId).run();
  await env.DB.prepare('INSERT INTO sessions(token_hash,user_id,expires_at) VALUES(?,?,?)').bind(tokenHash, userId, expiresAt).run();
  return token;
}

async function currentUser(request: Request, env: Env) {
  const token = bearerToken(request);
  if (!token) return null;
  const tokenHash = await sha256(token);
  const row = await env.DB.prepare(
    'SELECT users.id,users.email FROM sessions JOIN users ON users.id=sessions.user_id WHERE sessions.token_hash=? AND sessions.expires_at>?',
  ).bind(tokenHash, new Date().toISOString()).first();
  if (row) {
    await env.DB.prepare('UPDATE users SET last_activity_at=? WHERE id=?').bind(new Date().toISOString(), (row as { id: string }).id).run();
  }
  return row as { id: string; email: string } | null;
}

async function checkAuthRateLimit(request: Request, env: Env, action: string, limit: number) {
  const windowMs = 15 * 60 * 1000;
  const now = Date.now();
  const windowStartedAt = Math.floor(now / windowMs) * windowMs;
  const clientIp = request.headers.get('CF-Connecting-IP') || 'unknown';
  const clientKey = await sha256(clientIp);
  const row = await env.DB.prepare(`
    INSERT INTO auth_rate_limits(action,client_key,window_started_at,attempt_count)
    VALUES(?,?,?,1)
    ON CONFLICT(action,client_key) DO UPDATE SET
      attempt_count=CASE WHEN auth_rate_limits.window_started_at=excluded.window_started_at
        THEN auth_rate_limits.attempt_count+1 ELSE 1 END,
      window_started_at=excluded.window_started_at
    RETURNING attempt_count
  `).bind(action, clientKey, windowStartedAt).first() as { attempt_count: number } | null;
  if (!row || row.attempt_count <= limit) return null;
  const retryAfter = Math.max(1, Math.ceil((windowStartedAt + windowMs - now) / 1000));
  return json(request, { error: '操作が多すぎます。しばらく後に再試行してください。' }, {
    status: 429,
    headers: { 'Retry-After': String(retryAfter) },
  });
}

async function auth(request: Request, env: Env, mode: 'login' | 'register') {
  const limited = await checkAuthRateLimit(request, env, mode, mode === 'register' ? 5 : 10);
  if (limited) return limited;
  let body: { email?: unknown; password?: unknown };
  try {
    body = await readRequestObject(request);
  } catch (error) {
    return requestBodyError(request, error);
  }
  const email = normalizeEmail(body.email);
  const password = typeof body.password === 'string' ? body.password : '';
  if (!validEmail(email)) return json(request, { error: '有効なメールアドレスを入力してください。' }, { status: 400 });
  if (password.length < 8 || password.length > 128) {
    return json(request, { error: 'パスワードは8〜128文字で入力してください。' }, { status: 400 });
  }
  if (mode === 'register') {
    const existing = await env.DB.prepare('SELECT id FROM users WHERE email=?').bind(email).first();
    if (existing) return json(request, { error: 'このメールアドレスは既に登録されています。' }, { status: 409 });
    const id = crypto.randomUUID();
    const salt = randomHex(16);
    const passwordHash = await hashPassword(password, salt);
    await env.DB.prepare('INSERT INTO users(id,email,password_hash,password_salt) VALUES(?,?,?,?)')
      .bind(id, email, passwordHash, salt).run();
    return json(request, { token: await createSession(env, id), user: { id, email } }, { status: 201 });
  }
  const user = await env.DB.prepare('SELECT id,email,password_hash,password_salt FROM users WHERE email=?')
    .bind(email).first() as { id: string; email: string; password_hash: string; password_salt: string } | null;
  if (!user || !safeEqual(await hashPassword(password, user.password_salt), user.password_hash)) {
    return json(request, { error: 'メールアドレスまたはパスワードが違います。' }, { status: 401 });
  }
  return json(request, { token: await createSession(env, user.id), user: { id: user.id, email: user.email } });
}

async function changePassword(request: Request, env: Env) {
  const user = await currentUser(request, env);
  if (!user) return json(request, { error: 'ログインが必要です。' }, { status: 401 });
  let body: { currentPassword?: unknown; newPassword?: unknown };
  try {
    body = await readRequestObject(request);
  } catch (error) {
    return requestBodyError(request, error);
  }
  const currentPassword = typeof body.currentPassword === 'string' ? body.currentPassword : '';
  const newPassword = typeof body.newPassword === 'string' ? body.newPassword : '';
  if (newPassword.length < 8 || newPassword.length > 128) {
    return json(request, { error: '新しいパスワードは8〜128文字で入力してください。' }, { status: 400 });
  }
  if (currentPassword === newPassword) {
    return json(request, { error: '現在のパスワードと異なるパスワードを設定してください。' }, { status: 400 });
  }
  const row = await env.DB.prepare('SELECT password_hash,password_salt FROM users WHERE id=?').bind(user.id).first() as
    { password_hash: string; password_salt: string } | null;
  if (!row || !safeEqual(await hashPassword(currentPassword, row.password_salt), row.password_hash)) {
    return json(request, { error: '現在のパスワードが違います。' }, { status: 401 });
  }
  const passwordSalt = randomHex(16);
  const passwordHash = await hashPassword(newPassword, passwordSalt);
  const token = randomHex(32);
  const tokenHash = await sha256(token);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
  // D1 rolls back the whole batch if credential update, revocation, or the
  // replacement session fails. Existing credentials remain usable on failure.
  await env.DB.batch([
    env.DB.prepare('UPDATE users SET password_hash=?,password_salt=?,last_activity_at=? WHERE id=?')
      .bind(passwordHash, passwordSalt, now.toISOString(), user.id),
    env.DB.prepare('DELETE FROM sessions WHERE user_id=?').bind(user.id),
    env.DB.prepare('INSERT INTO sessions(token_hash,user_id,expires_at) VALUES(?,?,?)')
      .bind(tokenHash, user.id, expiresAt),
  ]);
  return json(request, { token, user });
}

async function deleteAccount(request: Request, env: Env) {
  const user = await currentUser(request, env);
  if (!user) return json(request, { error: 'ログインが必要です。' }, { status: 401 });
  let body: { password?: unknown };
  try {
    body = await readRequestObject(request);
  } catch (error) {
    return requestBodyError(request, error);
  }
  const password = typeof body.password === 'string' ? body.password : '';
  const row = await env.DB.prepare('SELECT password_hash,password_salt FROM users WHERE id=?').bind(user.id).first() as
    { password_hash: string; password_salt: string } | null;
  if (!row || !safeEqual(await hashPassword(password, row.password_salt), row.password_hash)) {
    return json(request, { error: 'パスワードが違います。' }, { status: 401 });
  }
  await env.DB.batch([
    env.DB.prepare('DELETE FROM sessions WHERE user_id=?').bind(user.id),
    env.DB.prepare('DELETE FROM source_follows WHERE user_id=?').bind(user.id),
    env.DB.prepare('DELETE FROM bookmarks WHERE user_id=?').bind(user.id),
    env.DB.prepare('DELETE FROM learning_history WHERE user_id=?').bind(user.id),
    env.DB.prepare('DELETE FROM user_preferences WHERE user_id=?').bind(user.id),
    env.DB.prepare('DELETE FROM users WHERE id=?').bind(user.id),
  ]);
  return json(request, { ok: true });
}

function publicArticleResponse(row: any) {
  return {
    slug: row.slug,
    source: row.source,
    sourceSlug: row.source_slug,
    sourceUrl: row.source_url || null,
    title: row.title,
    originalUrl: row.original_url,
    publishedAt: row.published_at,
    language: row.language,
    contentType: row.content_type,
    classification: { difficulty: row.difficulty, tags: parseStringArray(row.tags_json) },
    category: row.category,
  };
}

// Full source data is retained for authenticated collection/sync jobs only.
function internalArticleResponse(row: any) {
  return {
    ...publicArticleResponse(row),
    author: row.author,
    summary: row.summary,
    imageUrl: row.image_url,
    durationSeconds: row.duration_seconds,
    headings: parseHeadings(row.headings_json),
    sourceModifiedAt: row.source_modified_at,
  };
}

function articleWhere(search: URLSearchParams) {
  const query = (search.get('q') || '').trim().slice(0, 200);
  const source = (search.get('source') || '').trim().slice(0, 120);
  const where: string[] = [];
  const args: string[] = [];
  if (query) {
    where.push('(a.title LIKE ? OR a.tags_json LIKE ?)');
    args.push(`%${query}%`, `%${query}%`);
  }
  if (source) {
    where.push('a.source_slug = ?');
    args.push(source);
  }
  return { clause: where.length ? ` WHERE ${where.join(' AND ')}` : '', args };
}

function authorizeArticleTransfer(request: Request, env: Env) {
  if (!env.BATCH_INGEST_TOKEN) {
    return json(request, { error: '記事取り込み用トークンが設定されていません。' }, { status: 503 });
  }
  if (request.headers.get('authorization') !== `Bearer ${env.BATCH_INGEST_TOKEN}`) {
    return json(request, { error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}

async function listArticles(request: Request, env: Env, internal = false) {
  if (internal) {
    const unauthorized = authorizeArticleTransfer(request, env);
    if (unauthorized) return unauthorized;
  }
  const url = new URL(request.url);
  const limitParam = Number(url.searchParams.get('limit') || 100);
  const offsetParam = Number(url.searchParams.get('offset') || 0);
  const limit = Number.isFinite(limitParam) ? Math.max(1, Math.min(Math.floor(limitParam), 500)) : 100;
  const offset = Number.isFinite(offsetParam) ? Math.max(0, Math.min(Math.floor(offsetParam), 1000000)) : 0;
  const { clause, args } = articleWhere(url.searchParams);
  const totalRow = await env.DB.prepare(`SELECT COUNT(*) AS total FROM articles a${clause}`).bind(...args).first() as { total: number };
  const columns = internal ? 'a.*' :
    'a.slug,a.source,a.source_slug,a.title,a.original_url,a.published_at,a.language,a.content_type,a.difficulty,a.tags_json,a.category';
  const result = await env.DB.prepare(`
    SELECT ${columns},s.url AS source_url
    FROM articles a LEFT JOIN sources s ON s.slug=a.source_slug${clause}
    ORDER BY a.published_at DESC,a.slug ASC LIMIT ? OFFSET ?
  `).bind(...args, limit, offset).all();
  const metadata = await env.DB.prepare('SELECT value FROM app_metadata WHERE key=?').bind('collected_at').first() as { value: string } | null;
  return json(request, {
    articles: (result.results || []).map(internal ? internalArticleResponse : publicArticleResponse),
    total: Number(totalRow?.total || 0),
    offset,
    limit,
    collectedAt: metadata?.value || null,
  });
}

async function listSources(request: Request, env: Env) {
  const result = await env.DB.prepare('SELECT slug,name,url,language FROM sources ORDER BY name ASC').all();
  return json(request, {
    sources: (result.results || []).map((row: any) => ({
      slug: row.slug,
      name: row.name,
      url: row.url,
      language: row.language,
    })),
  });
}

function validSource(source: any) {
  return !!source && typeof source === 'object' &&
    /^[a-z0-9-]{1,120}$/.test(source.slug || '') && validText(source.name, 160) &&
    validWebUrl(source.url) && (source.language === 'Japanese' || source.language === 'English');
}

function validArticle(article: any) {
  return !!article && typeof article === 'object' &&
    validText(article.source, 160) && /^[a-z0-9-]{1,120}$/.test(article.sourceSlug || article.source_slug || '') &&
    validText(article.title, 500) && validWebUrl(article.originalUrl) && validText(article.summary, 2000) &&
    (article.language === 'Japanese' || article.language === 'English') &&
    (article.imageUrl == null || validWebUrl(article.imageUrl, true)) &&
    (article.publishedAt == null || (typeof article.publishedAt === 'string' && Number.isFinite(Date.parse(article.publishedAt)))) &&
    (article.contentType == null || article.contentType === 'article' || article.contentType === 'video');
}

async function remapUserArticleReferences(env: Env, oldSlug: string, newSlug: string) {
  if (!oldSlug || oldSlug === newSlug) return;
  await env.DB.prepare(`
    DELETE FROM bookmarks WHERE article_slug=? AND EXISTS (
      SELECT 1 FROM bookmarks AS target WHERE target.user_id=bookmarks.user_id AND target.article_slug=?
    )
  `).bind(oldSlug, newSlug).run();
  await env.DB.prepare('UPDATE bookmarks SET article_slug=? WHERE article_slug=?').bind(newSlug, oldSlug).run();
  await env.DB.prepare(`
    DELETE FROM learning_history WHERE article_slug=? AND EXISTS (
      SELECT 1 FROM learning_history AS target WHERE target.user_id=learning_history.user_id
        AND target.article_slug=? AND target.opened_date=learning_history.opened_date
    )
  `).bind(oldSlug, newSlug).run();
  await env.DB.prepare('UPDATE learning_history SET article_slug=? WHERE article_slug=?').bind(newSlug, oldSlug).run();
}

async function upsertArticle(env: Env, article: any) {
  const sourceSlug = article.sourceSlug || article.source_slug;
  const originalUrl = article.originalUrl || article.original_url;
  const requestedSlug = validArticleSlug(article.slug) ? article.slug : await defaultArticleSlug(article.title, originalUrl, sourceSlug);
  const existing = await env.DB.prepare('SELECT slug FROM articles WHERE original_url=?').bind(originalUrl).first() as { slug: string } | null;
  const difficulty = ['beginner', 'intermediate', 'advanced'].includes(article.classification?.difficulty)
    ? article.classification.difficulty : 'intermediate';
  const tags = parseStringArray(article.classification?.tags);
  const headings = parseHeadings(article.headings);
  const durationSeconds = Number.isFinite(article.durationSeconds) && article.durationSeconds >= 0
    ? Math.floor(article.durationSeconds) : null;
  const sourceModifiedAt = typeof article.sourceModifiedAt === 'string' && Number.isFinite(Date.parse(article.sourceModifiedAt))
    ? article.sourceModifiedAt : null;
  await env.DB.prepare(`
    INSERT INTO articles(
      slug,source_slug,source,title,original_url,author,published_at,summary,language,image_url,
      content_type,difficulty,tags_json,category,headings_json,duration_seconds,source_modified_at,updated_at
    ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,CURRENT_TIMESTAMP)
    ON CONFLICT(original_url) DO UPDATE SET
      slug=excluded.slug,source_slug=excluded.source_slug,source=excluded.source,title=excluded.title,
      author=excluded.author,published_at=excluded.published_at,summary=excluded.summary,language=excluded.language,
      image_url=excluded.image_url,content_type=excluded.content_type,difficulty=excluded.difficulty,
      tags_json=excluded.tags_json,category=excluded.category,headings_json=excluded.headings_json,
      duration_seconds=excluded.duration_seconds,source_modified_at=excluded.source_modified_at,updated_at=CURRENT_TIMESTAMP
  `).bind(
    requestedSlug,
    sourceSlug,
    article.source,
    article.title,
    originalUrl,
    typeof article.author === 'string' ? article.author.slice(0, 200) : null,
    article.publishedAt || null,
    article.summary,
    article.language,
    typeof article.imageUrl === 'string' ? article.imageUrl : null,
    article.contentType || 'article',
    difficulty,
    JSON.stringify(tags),
    validText(article.category, 120) ? article.category : (tags.includes('mtt') ? 'Tournament' : 'GTO'),
    JSON.stringify(headings),
    durationSeconds,
    sourceModifiedAt,
  ).run();
  if (existing?.slug && existing.slug !== requestedSlug) await remapUserArticleReferences(env, existing.slug, requestedSlug);
}

async function ingestArticles(request: Request, env: Env) {
  const unauthorized = authorizeArticleTransfer(request, env);
  if (unauthorized) return unauthorized;
  let body: any;
  try {
    body = await readRequestObject(request, 1024 * 1024);
  } catch (error) {
    return requestBodyError(request, error);
  }
  const sources = body?.sources ?? [];
  const articles = body?.articles ?? [];
  if (!Array.isArray(sources) || sources.length > 200 || !sources.every(validSource)) {
    return json(request, { error: '情報源のデータを確認してください。' }, { status: 400 });
  }
  if (!Array.isArray(articles) || articles.length > 100 || !articles.every(validArticle)) {
    return json(request, { error: '記事データは1回あたり100件以内で送信してください。' }, { status: 400 });
  }
  if (body.collectedAt != null && (typeof body.collectedAt !== 'string' || !Number.isFinite(Date.parse(body.collectedAt)))) {
    return json(request, { error: '収集日時を確認してください。' }, { status: 400 });
  }
  for (const source of sources) {
    await env.DB.prepare(`
      INSERT INTO sources(slug,name,url,language) VALUES(?,?,?,?)
      ON CONFLICT(slug) DO UPDATE SET name=excluded.name,url=excluded.url,language=excluded.language
    `).bind(source.slug, source.name, source.url, source.language).run();
  }
  for (const article of articles) {
    const sourceSlug = article.sourceSlug || article.source_slug;
    const sourceUrl = article.sourceUrl || article.source_url;
    if (sourceUrl && validWebUrl(sourceUrl)) {
      await env.DB.prepare(`
        INSERT INTO sources(slug,name,url,language) VALUES(?,?,?,?)
        ON CONFLICT(slug) DO UPDATE SET name=excluded.name,url=excluded.url,language=excluded.language
      `).bind(sourceSlug, article.source, sourceUrl, article.language).run();
    }
    await upsertArticle(env, article);
  }
  if (body.collectedAt) {
    await env.DB.prepare(`
      INSERT INTO app_metadata(key,value) VALUES('collected_at',?)
      ON CONFLICT(key) DO UPDATE SET value=excluded.value
    `).bind(body.collectedAt).run();
  }
  return json(request, { ok: true, count: articles.length });
}

async function handleUserData(request: Request, env: Env, url: URL) {
  if (url.pathname === '/api/auth/register' && request.method === 'POST') return auth(request, env, 'register');
  if (url.pathname === '/api/auth/login' && request.method === 'POST') return auth(request, env, 'login');
  if (url.pathname === '/api/auth/password' && request.method === 'POST') return changePassword(request, env);
  if (url.pathname === '/api/auth/account' && request.method === 'DELETE') return deleteAccount(request, env);
  if (url.pathname === '/api/auth/me' && request.method === 'GET') {
    const user = await currentUser(request, env);
    return user ? json(request, { user }) : json(request, { error: 'ログインが必要です。' }, { status: 401 });
  }
  if (url.pathname === '/api/auth/logout' && request.method === 'POST') {
    const token = bearerToken(request);
    if (token) await env.DB.prepare('DELETE FROM sessions WHERE token_hash=?').bind(await sha256(token)).run();
    return json(request, { ok: true });
  }
  if (url.pathname === '/api/bookmarks' && request.method === 'GET') {
    const user = await currentUser(request, env);
    if (!user) return json(request, { error: 'ログインが必要です。' }, { status: 401 });
    const { results } = await env.DB.prepare('SELECT article_slug FROM bookmarks WHERE user_id=? ORDER BY created_at DESC').bind(user.id).all();
    return json(request, { slugs: (results as { article_slug: string }[]).map(row => row.article_slug) });
  }
  if (url.pathname === '/api/bookmarks' && request.method === 'POST') {
    const user = await currentUser(request, env);
    if (!user) return json(request, { error: 'ログインが必要です。' }, { status: 401 });
    let body: { slug?: unknown; saved?: unknown };
    try { body = await readRequestObject(request); } catch (error) { return requestBodyError(request, error); }
    if (!validArticleSlug(body.slug) || typeof body.saved !== 'boolean') {
      return json(request, { error: 'ブックマークの内容を確認してください。' }, { status: 400 });
    }
    if (body.saved) await env.DB.prepare('INSERT OR IGNORE INTO bookmarks(user_id,article_slug) VALUES(?,?)').bind(user.id, body.slug).run();
    else await env.DB.prepare('DELETE FROM bookmarks WHERE user_id=? AND article_slug=?').bind(user.id, body.slug).run();
    return json(request, { slug: body.slug, saved: body.saved });
  }
  if (url.pathname === '/api/learning-history' && request.method === 'GET') {
    const user = await currentUser(request, env);
    if (!user) return json(request, { error: 'ログインが必要です。' }, { status: 401 });
    const { results } = await env.DB.prepare(
      'SELECT article_slug AS slug,opened_at AS openedAt FROM learning_history WHERE user_id=? ORDER BY opened_at DESC LIMIT 500',
    ).bind(user.id).all();
    return json(request, { events: results });
  }
  if (url.pathname === '/api/learning-history' && request.method === 'POST') {
    const user = await currentUser(request, env);
    if (!user) return json(request, { error: 'ログインが必要です。' }, { status: 401 });
    let body: { slug?: unknown; openedAt?: unknown };
    try { body = await readRequestObject(request); } catch (error) { return requestBodyError(request, error); }
    if (!validArticleSlug(body.slug)) return json(request, { error: '学習履歴の内容を確認してください。' }, { status: 400 });
    const requestedOpenedAt = typeof body.openedAt === 'string' && Number.isFinite(Date.parse(body.openedAt))
      ? new Date(body.openedAt) : null;
    const openedAt = requestedOpenedAt && requestedOpenedAt.getTime() <= Date.now() + 5 * 60 * 1000
      ? requestedOpenedAt.toISOString() : new Date().toISOString();
    const openedDate = openedAt.slice(0, 10);
    await env.DB.prepare(
      'INSERT OR IGNORE INTO learning_history(user_id,article_slug,opened_date,opened_at) VALUES(?,?,?,?)',
    ).bind(user.id, body.slug, openedDate, openedAt).run();
    const row = await env.DB.prepare(
      'SELECT article_slug AS slug,opened_at AS openedAt FROM learning_history WHERE user_id=? AND article_slug=? AND opened_date=?',
    ).bind(user.id, body.slug, openedDate).first();
    return json(request, { event: row || { slug: body.slug, openedAt } });
  }
  if (url.pathname === '/api/preferences' && request.method === 'GET') {
    const user = await currentUser(request, env);
    if (!user) return json(request, { error: 'ログインが必要です。' }, { status: 401 });
    const row = await env.DB.prepare(
      'SELECT language,theme,docs_query,docs_filters_json FROM user_preferences WHERE user_id=?',
    ).bind(user.id).first();
    return json(request, readPreferences(row));
  }
  if (url.pathname === '/api/preferences' && request.method === 'POST') {
    const user = await currentUser(request, env);
    if (!user) return json(request, { error: 'ログインが必要です。' }, { status: 401 });
    let body: { language?: unknown; theme?: unknown; docsQuery?: unknown; docsFilters?: unknown };
    try { body = await readRequestObject(request); } catch (error) { return requestBodyError(request, error); }
    if (body.language !== undefined && body.language !== 'Japanese' && body.language !== 'English') {
      return json(request, { error: '表示言語を確認してください。' }, { status: 400 });
    }
    if (body.theme !== undefined && body.theme !== 'light' && body.theme !== 'dark') {
      return json(request, { error: 'テーマを確認してください。' }, { status: 400 });
    }
    if (body.docsQuery !== undefined && (typeof body.docsQuery !== 'string' || body.docsQuery.length > 200)) {
      return json(request, { error: '検索条件を確認してください。' }, { status: 400 });
    }
    if (body.docsFilters !== undefined && (!Array.isArray(body.docsFilters) ||
      body.docsFilters.some(value => typeof value !== 'string') || body.docsFilters.length > 100)) {
      return json(request, { error: '絞り込み条件を確認してください。' }, { status: 400 });
    }
    const existing = await env.DB.prepare(
      'SELECT language,theme,docs_query,docs_filters_json FROM user_preferences WHERE user_id=?',
    ).bind(user.id).first();
    const current = readPreferences(existing);
    const next = {
      language: body.language === undefined ? current.language : body.language as 'Japanese' | 'English',
      theme: body.theme === undefined ? current.theme : body.theme as 'light' | 'dark',
      docsQuery: body.docsQuery === undefined ? current.docsQuery : body.docsQuery as string,
      docsFilters: body.docsFilters === undefined ? current.docsFilters : body.docsFilters as string[],
    };
    await env.DB.prepare(`
      INSERT INTO user_preferences(user_id,language,theme,docs_query,docs_filters_json) VALUES(?,?,?,?,?)
      ON CONFLICT(user_id) DO UPDATE SET language=excluded.language,theme=excluded.theme,
        docs_query=excluded.docs_query,docs_filters_json=excluded.docs_filters_json,updated_at=CURRENT_TIMESTAMP
    `).bind(user.id, next.language, next.theme, next.docsQuery, JSON.stringify(next.docsFilters)).run();
    return json(request, next);
  }
  if (url.pathname === '/api/source-follows' && request.method === 'GET') {
    const user = await currentUser(request, env);
    if (!user) return json(request, { error: 'ログインが必要です。' }, { status: 401 });
    const { results } = await env.DB.prepare('SELECT source_slug FROM source_follows WHERE user_id=? ORDER BY created_at ASC').bind(user.id).all();
    return json(request, { sourceSlugs: (results as { source_slug: string }[]).map(row => row.source_slug) });
  }
  if (url.pathname === '/api/source-follows' && request.method === 'POST') {
    const user = await currentUser(request, env);
    if (!user) return json(request, { error: 'ログインが必要です。' }, { status: 401 });
    let body: { sourceSlug?: unknown; followed?: unknown };
    try { body = await readRequestObject(request); } catch (error) { return requestBodyError(request, error); }
    const sourceSlug = typeof body.sourceSlug === 'string' ? body.sourceSlug.trim() : '';
    if (!/^[a-z0-9-]+$/.test(sourceSlug)) return json(request, { error: 'ソースを確認できません。' }, { status: 400 });
    if (body.followed === true) await env.DB.prepare('INSERT OR IGNORE INTO source_follows(user_id,source_slug) VALUES(?,?)').bind(user.id, sourceSlug).run();
    else if (body.followed === false) await env.DB.prepare('DELETE FROM source_follows WHERE user_id=? AND source_slug=?').bind(user.id, sourceSlug).run();
    else return json(request, { error: 'フォロー状態を確認できません。' }, { status: 400 });
    return json(request, { sourceSlug, followed: body.followed });
  }
  return null;
}

function readPreferences(row: any) {
  if (!row) return { language: 'Japanese', theme: 'light', docsQuery: '', docsFilters: [] as string[] };
  return {
    language: row.language === 'English' ? 'English' : 'Japanese',
    theme: row.theme === 'dark' ? 'dark' : 'light',
    docsQuery: typeof row.docs_query === 'string' ? row.docs_query : '',
    docsFilters: parseStringArray(row.docs_filters_json),
  };
}

export default {
  async fetch(request: Request, env: Env) {
    if (request.method === 'OPTIONS') return new Response(null, { headers: corsHeaders(request) });
    const url = new URL(request.url);
    if (url.pathname === '/health' && request.method === 'GET') {
      await env.DB.prepare('SELECT 1 AS ok').first();
      return json(request, { ok: true, ingestConfigured: Boolean(env.BATCH_INGEST_TOKEN) });
    }
    if (url.pathname === '/api/articles' && request.method === 'GET') return listArticles(request, env);
    if (url.pathname === '/api/articles/export' && request.method === 'GET') return listArticles(request, env, true);
    if (url.pathname === '/api/articles' && request.method === 'POST') return ingestArticles(request, env);
    if (url.pathname === '/api/sources' && request.method === 'GET') return listSources(request, env);
    const userDataResponse = await handleUserData(request, env, url);
    return userDataResponse || json(request, { error: 'Not Found' }, { status: 404 });
  },

  async scheduled(_controller: unknown, env: Env) {
    const now = new Date();
    const userCutoff = new Date(now);
    userCutoff.setUTCFullYear(userCutoff.getUTCFullYear() - USER_RETENTION_YEARS);
    const inactiveUserIds = `SELECT id FROM users WHERE datetime(COALESCE(last_activity_at, created_at)) < datetime(?)`;

    // D1 batches are transactional. Delete related data and the inactive account
    // together so retries cannot leave a partially-retained account behind.
    await env.DB.batch([
      env.DB.prepare('DELETE FROM sessions WHERE expires_at <= ?').bind(now.toISOString()),
      env.DB.prepare('DELETE FROM auth_rate_limits WHERE window_started_at < ?')
        .bind(now.getTime() - RATE_LIMIT_RETENTION_MS),
      env.DB.prepare(`DELETE FROM source_follows WHERE user_id IN (${inactiveUserIds})`).bind(userCutoff.toISOString()),
      env.DB.prepare(`DELETE FROM bookmarks WHERE user_id IN (${inactiveUserIds})`).bind(userCutoff.toISOString()),
      env.DB.prepare(`DELETE FROM learning_history WHERE user_id IN (${inactiveUserIds})`).bind(userCutoff.toISOString()),
      env.DB.prepare(`DELETE FROM user_preferences WHERE user_id IN (${inactiveUserIds})`).bind(userCutoff.toISOString()),
      env.DB.prepare(`DELETE FROM users WHERE datetime(COALESCE(last_activity_at, created_at)) < datetime(?)`)
        .bind(userCutoff.toISOString()),
    ]);
  },
};
