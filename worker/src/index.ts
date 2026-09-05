export interface Env { DB: { prepare: (query: string) => any }; BATCH_INGEST_TOKEN?: string; ENVIRONMENT?: string; }

const allowedOrigins=new Set(['https://potover.com','https://www.potover.com','http://localhost:3000']);
const corsHeaders=(request:Request)=>{const origin=request.headers.get('origin')||'';return {'Access-Control-Allow-Origin':allowedOrigins.has(origin)?origin:'https://potover.com','Access-Control-Allow-Methods':'GET,POST,OPTIONS','Access-Control-Allow-Headers':'Content-Type,Authorization','Access-Control-Max-Age':'86400','Vary':'Origin'}};
const json=(request:Request,body:unknown,init:ResponseInit={})=>new Response(JSON.stringify(body),{...init,headers:{'Content-Type':'application/json; charset=utf-8',...corsHeaders(request),...(init.headers||{})}});
const bytesToHex=(bytes:Uint8Array)=>Array.from(bytes,value=>value.toString(16).padStart(2,'0')).join('');
const hexToBytes=(hex:string)=>new Uint8Array(hex.match(/.{2}/g)?.map(byte=>parseInt(byte,16))||[]);
const randomHex=(length:number)=>{const bytes=new Uint8Array(length);crypto.getRandomValues(bytes);return bytesToHex(bytes)};
const sha256=async(value:string)=>bytesToHex(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value))));
const hashPassword=async(password:string,saltHex:string)=>{const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveBits']);const bits=await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt:hexToBytes(saltHex),iterations:120000},key,256);return bytesToHex(new Uint8Array(bits))};
const safeEqual=(left:string,right:string)=>{if(left.length!==right.length)return false;let result=0;for(let index=0;index<left.length;index++)result|=left.charCodeAt(index)^right.charCodeAt(index);return result===0};
const normalizeEmail=(value:unknown)=>typeof value==='string'?value.trim().toLowerCase():'';
const validEmail=(email:string)=>/^\S+@\S+\.\S+$/.test(email)&&email.length<=254;
const bearerToken=(request:Request)=>{const value=request.headers.get('authorization')||'';return value.startsWith('Bearer ')?value.slice(7):''};

async function createSession(env:Env,userId:string){const token=randomHex(32);const tokenHash=await sha256(token);const expiresAt=new Date(Date.now()+30*24*60*60*1000).toISOString();await env.DB.prepare('INSERT INTO sessions(token_hash,user_id,expires_at) VALUES(?,?,?)').bind(tokenHash,userId,expiresAt).run();return token}
async function currentUser(request:Request,env:Env){const token=bearerToken(request);if(!token)return null;const tokenHash=await sha256(token);const row=await env.DB.prepare('SELECT users.id,users.email FROM sessions JOIN users ON users.id=sessions.user_id WHERE sessions.token_hash=? AND sessions.expires_at>?').bind(tokenHash,new Date().toISOString()).first();return row as {id:string;email:string}|null}
async function auth(request:Request,env:Env,mode:'login'|'register'){
  let body:{email?:unknown;password?:unknown};try{body=await request.json()}catch{return json(request,{error:'入力内容を確認してください。'},{status:400})}
  const email=normalizeEmail(body.email);const password=typeof body.password==='string'?body.password:'';
  if(!validEmail(email))return json(request,{error:'有効なメールアドレスを入力してください。'},{status:400});
  if(password.length<8||password.length>128)return json(request,{error:'パスワードは8〜128文字で入力してください。'},{status:400});
  if(mode==='register'){
    const existing=await env.DB.prepare('SELECT id FROM users WHERE email=?').bind(email).first();if(existing)return json(request,{error:'このメールアドレスは既に登録されています。'},{status:409});
    const id=crypto.randomUUID(),salt=randomHex(16),passwordHash=await hashPassword(password,salt);
    await env.DB.prepare('INSERT INTO users(id,email,password_hash,password_salt) VALUES(?,?,?,?)').bind(id,email,passwordHash,salt).run();
    return json(request,{token:await createSession(env,id),user:{id,email}},{status:201});
  }
  const user=await env.DB.prepare('SELECT id,email,password_hash,password_salt FROM users WHERE email=?').bind(email).first() as {id:string;email:string;password_hash:string;password_salt:string}|null;
  if(!user||!safeEqual(await hashPassword(password,user.password_salt),user.password_hash))return json(request,{error:'メールアドレスまたはパスワードが違います。'},{status:401});
  return json(request,{token:await createSession(env,user.id),user:{id:user.id,email:user.email}});
}

export default {async fetch(request:Request,env:Env){
  if(request.method==='OPTIONS')return new Response(null,{headers:corsHeaders(request)});const u=new URL(request.url);
  if(u.pathname==='/health')return json(request,{ok:true});
  if(u.pathname==='/api/auth/register'&&request.method==='POST')return auth(request,env,'register');
  if(u.pathname==='/api/auth/login'&&request.method==='POST')return auth(request,env,'login');
  if(u.pathname==='/api/auth/me'&&request.method==='GET'){const user=await currentUser(request,env);return user?json(request,{user}):json(request,{error:'ログインが必要です。'},{status:401})}
  if(u.pathname==='/api/auth/logout'&&request.method==='POST'){const token=bearerToken(request);if(token)await env.DB.prepare('DELETE FROM sessions WHERE token_hash=?').bind(await sha256(token)).run();return json(request,{ok:true})}
  if(u.pathname==='/api/articles'&&request.method==='GET'){const q=(u.searchParams.get('q')||'').trim(),source=u.searchParams.get('source'),limit=Math.min(Number(u.searchParams.get('limit')||100),500);const where:string[]=[];const args:(string|number)[]=[];if(q){where.push('(title LIKE ? OR summary LIKE ? OR tags_json LIKE ?)');args.push(`%${q}%`,`%${q}%`,`%${q}%`)}if(source){where.push('source_slug = ?');args.push(source)}const sql=`SELECT * FROM articles${where.length?' WHERE '+where.join(' AND '):''} ORDER BY published_at DESC LIMIT ?`;args.push(limit);const {results}=await env.DB.prepare(sql).bind(...args).all();return json(request,{articles:results,total:results.length});}
  if(u.pathname==='/api/articles'&&request.method==='POST'){if(env.BATCH_INGEST_TOKEN&&request.headers.get('authorization')!==`Bearer ${env.BATCH_INGEST_TOKEN}`)return json(request,{error:'Unauthorized'},{status:401});const body=await request.json() as {sources?:any[];articles?:any[]};for(const s of body.sources||[])await env.DB.prepare('INSERT INTO sources(slug,name,url,language) VALUES(?,?,?,?) ON CONFLICT(slug) DO UPDATE SET name=excluded.name,url=excluded.url,language=excluded.language').bind(s.slug,s.name,s.url,s.language).run();for(const a of body.articles||[])await env.DB.prepare('INSERT INTO articles(slug,source_slug,source,title,original_url,author,published_at,summary,language,image_url,content_type,difficulty,tags_json,category,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,CURRENT_TIMESTAMP) ON CONFLICT(slug) DO UPDATE SET title=excluded.title,summary=excluded.summary,published_at=excluded.published_at,tags_json=excluded.tags_json,updated_at=CURRENT_TIMESTAMP').bind(a.slug||crypto.randomUUID(),a.sourceSlug||a.source_slug,a.source,a.title,a.originalUrl,a.author,a.publishedAt,a.summary,a.language,a.imageUrl,a.contentType,a.classification?.difficulty||'intermediate',JSON.stringify(a.classification?.tags||[]),a.category||'GTO').run();return json(request,{ok:true,count:body.articles?.length||0});}
  return json(request,{error:'Not Found'},{status:404});
}};
