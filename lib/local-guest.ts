// Local development guest: answers the account API inside the browser so signed-in
// screens can be checked without the auth worker. Production builds inline NODE_ENV as
// "production", so the flag is false there and every entry point stays inert.
export const localGuestEnabled=process.env.NODE_ENV==='development';
export const LOCAL_GUEST_TOKEN='local-guest';
export const LOCAL_GUEST_USER={id:'local-guest',email:'guest@localhost'};
const STORE_KEY='potover-local-guest';

type LearningEvent={slug:string;openedAt:string};
type Preferences={language:'Japanese'|'English';theme:'light'|'dark';docsQuery:string;docsFilters:string[]};
type GuestStore={bookmarks:string[];history:LearningEvent[];preferences:Preferences;sourceSlugs:string[]};
type GuestStorage=Pick<Storage,'getItem'|'setItem'|'removeItem'>;
export type LocalGuestResult={status:number;body:unknown};

const emptyStore=():GuestStore=>({bookmarks:[],history:[],preferences:{language:'Japanese',theme:'light',docsQuery:'',docsFilters:[]},sourceSlugs:[]});

function readStore(storage:GuestStorage):GuestStore{
  try{
    const value=JSON.parse(storage.getItem(STORE_KEY)||'null') as Partial<GuestStore>|null;
    const store=emptyStore();
    if(!value||typeof value!=='object')return store;
    return {
      bookmarks:Array.isArray(value.bookmarks)?value.bookmarks.filter(item=>typeof item==='string'):store.bookmarks,
      history:Array.isArray(value.history)?value.history.filter(item=>item&&typeof item.slug==='string'&&typeof item.openedAt==='string'):store.history,
      preferences:{...store.preferences,...(value.preferences&&typeof value.preferences==='object'?value.preferences:{})},
      sourceSlugs:Array.isArray(value.sourceSlugs)?value.sourceSlugs.filter(item=>typeof item==='string'):store.sourceSlugs,
    };
  }catch{return emptyStore()}
}

function readBody(options:RequestInit):Record<string,unknown>{
  if(typeof options.body!=='string')return {};
  try{const value=JSON.parse(options.body);return value&&typeof value==='object'?value:{}}catch{return {}}
}

export function isLocalGuestRequest(options:RequestInit):boolean{
  return localGuestEnabled&&new Headers(options.headers).get('Authorization')===`Bearer ${LOCAL_GUEST_TOKEN}`;
}

/** Mirrors the worker's response shapes for the endpoints the client calls. */
export function handleLocalGuestRequest(url:string,options:RequestInit,storage:GuestStorage):LocalGuestResult{
  const path=new URL(url,'http://localhost').pathname;
  const method=(options.method||'GET').toUpperCase();
  const store=readStore(storage);
  const body=readBody(options);
  const save=()=>storage.setItem(STORE_KEY,JSON.stringify(store));
  const ok=(value:unknown):LocalGuestResult=>({status:200,body:value});

  if(path==='/api/auth/me'&&method==='GET')return ok({user:LOCAL_GUEST_USER});
  if(path==='/api/auth/logout'&&method==='POST')return ok({ok:true});
  if(path==='/api/auth/password'&&method==='POST')return {status:400,body:{error:'ゲストではパスワードを変更できません。'}};
  if(path==='/api/auth/account'&&method==='DELETE'){storage.removeItem(STORE_KEY);return ok({ok:true})}

  if(path==='/api/bookmarks'&&method==='GET')return ok({slugs:store.bookmarks});
  if(path==='/api/bookmarks'&&method==='POST'&&typeof body.slug==='string'&&typeof body.saved==='boolean'){
    store.bookmarks=store.bookmarks.filter(slug=>slug!==body.slug);
    if(body.saved)store.bookmarks.unshift(body.slug);
    save();return ok({slug:body.slug,saved:body.saved});
  }

  if(path==='/api/learning-history'&&method==='GET')return ok({events:store.history});
  if(path==='/api/learning-history'&&method==='POST'&&typeof body.slug==='string'){
    const openedAt=typeof body.openedAt==='string'&&Number.isFinite(Date.parse(body.openedAt))?new Date(body.openedAt).toISOString():new Date().toISOString();
    const existing=store.history.find(event=>event.slug===body.slug&&event.openedAt.slice(0,10)===openedAt.slice(0,10));
    if(existing)return ok({event:existing});
    const event={slug:body.slug,openedAt};
    store.history=[event,...store.history].slice(0,500);
    save();return ok({event});
  }

  if(path==='/api/preferences'&&method==='GET')return ok(store.preferences);
  if(path==='/api/preferences'&&method==='POST'){
    const next=store.preferences;
    if(body.language==='Japanese'||body.language==='English')next.language=body.language;
    if(body.theme==='light'||body.theme==='dark')next.theme=body.theme;
    if(typeof body.docsQuery==='string')next.docsQuery=body.docsQuery;
    if(Array.isArray(body.docsFilters))next.docsFilters=body.docsFilters.filter((item):item is string=>typeof item==='string');
    save();return ok(next);
  }

  if(path==='/api/source-follows'&&method==='GET')return ok({sourceSlugs:store.sourceSlugs});
  if(path==='/api/source-follows'&&method==='POST'&&typeof body.sourceSlug==='string'&&typeof body.followed==='boolean'){
    store.sourceSlugs=store.sourceSlugs.filter(slug=>slug!==body.sourceSlug);
    if(body.followed)store.sourceSlugs.push(body.sourceSlug);
    save();return ok({sourceSlug:body.sourceSlug,followed:body.followed});
  }

  return {status:400,body:{error:'ローカルのゲストでは利用できない操作です。'}};
}
