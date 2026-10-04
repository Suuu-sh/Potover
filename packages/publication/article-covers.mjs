// Pinned restoration of the previous image presentation. URL safety is not
// a representation of a rights-holder license or legal clearance.
const hosts={
  'gto-wizard':['blog.gtowizard.com','help.gtowizard.com'],
  'gto-wizard-japan':['japan.gtowizard.com'],
  'upswing-poker':['upswingpoker.com'],pokercoaching:['pokercoaching.com'],
  'poker-lab':['poker-labs.com'],'poker-academy-jp':['pokeracademy.jp'],
  'poker-dou':['www.pokerdou.com'],ajpc:['www.ajpc.jp'],'lasvegas-jp':[],
};
const identity=a=>`${a.slug}\n${a.sourceSlug}\n${a.originalUrl}`;
export function safeArticleCover(value,article){
  if(typeof value!=='string'||/[\s\\\u0000-\u001f]/.test(value))return undefined;
  if(article.contentType!=='article'&&article.contentType!=='video')return undefined;
  if(article.contentType==='article'&&article.sourceSlug==='lasvegas-jp'&&value==='/sources/poker-hack.png')return value;
  try{
    const url=new URL(value);
    if(url.protocol!=='https:'||url.username||url.password||url.port||url.search||url.hash)return undefined;
    if(article.contentType==='video'){
      if(!['gto-wizard','gto-wizard-japan'].includes(article.sourceSlug)||url.hostname!=='i.ytimg.com')return undefined;
      const original=new URL(article.originalUrl);const id=original.searchParams.get('v');
      return original.protocol==='https:'&&!original.username&&!original.password&&!original.port&&original.searchParams.getAll('v').length===1&&original.hostname==='www.youtube.com'&&original.pathname==='/watch'&&id&&/^[\w-]{11}$/.test(id)&&url.pathname===`/vi/${id}/hqdefault.jpg`?value:undefined;
    }
    if(!/^\/(?:content|wp-content|wp\/wp-content|blog\/wp-content)\//.test(url.pathname)||!/\.(?:jpe?g|png|webp|gif)$/i.test(url.pathname))return undefined;
    return Object.hasOwn(hosts,article.sourceSlug)&&hosts[article.sourceSlug].includes(url.hostname)?value:undefined;
  }catch{return undefined}
}
export function applyCoverSuppressions(previews,covers){
  const disabled=article=>!covers.enabled||covers.disabledSources.includes(article.sourceSlug)||covers.disabledArticles.includes(article.slug);
  return {...previews,sources:previews.sources.map(source=>({...source,enabled:source.enabled&&covers.enabled&&!covers.disabledSources.includes(source.sourceSlug)})),articles:previews.articles.map(article=>({...article,enabled:article.enabled&&!disabled(article)}))};
}
export function createArticleCoverLookup(manifest,scope,previewManifest={sources:[],articles:[]}){
  if(manifest?.version!==1||typeof manifest.enabled!=='boolean'||!Array.isArray(manifest.covers)||!Array.isArray(manifest.disabledSources)||!Array.isArray(manifest.disabledArticles))throw new Error('Invalid article cover manifest');
  const approved=new Set(scope.articles.map(identity));const covers=new Map();
  for(const item of manifest.covers){
    const key=identity(item);
    if(!approved.has(key)||covers.has(key))throw new Error('Unapproved or duplicate article cover identity');
    covers.set(key,item.imageUrl);
  }
  const suppressed=article=>!manifest.enabled||manifest.disabledSources.includes(article.sourceSlug)||manifest.disabledArticles.includes(article.slug)||previewManifest.sources.some(s=>s.sourceSlug===article.sourceSlug&&!s.enabled)||previewManifest.articles.some(a=>a.slug===article.slug&&!a.enabled);
  return {suppressed,coverFor:article=>suppressed(article)?undefined:safeArticleCover(covers.get(identity(article)),article)};
}
