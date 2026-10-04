// Only reviewed, finite local derivatives may cross the public data boundary.
// This module never fetches images, exposes originals, or enables collection.
const sources = {
  'poker-academy-jp': ['pokeracademy.jp'],
  'poker-dou': ['www.pokerdou.com'],
  ajpc: ['www.ajpc.jp'],
};
const assetPath = /^\/article-previews\/[a-f0-9]{64}\.(webp|jpg|png)$/;
const text = value => typeof value === 'string' && value.trim().length > 0;
const fail = message => {throw new Error(`Article previews: ${message}`)};
const identityKey = article => `${article.sourceSlug}\n${article.slug}\n${article.originalUrl}`;
function safeSourceUrl(value, hosts) {
  if (!text(value) || /[\s\\\u0000-\u001f]/.test(value)) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password && !url.port &&
      !url.search && !url.hash && hosts.includes(url.hostname);
  } catch {return false}
}
export function readPublicArticlePreview(value) {
  if (!value || !assetPath.test(value.src) || !Number.isInteger(value.width) || !Number.isInteger(value.height) ||
      value.width < 1 || value.height < 1 || value.width > 160 || value.height > 160 ||
      !text(value.credit) || value.credit.length > 300) return undefined;
  return {src:value.src,width:value.width,height:value.height,credit:value.credit};
}
export function createArticlePreviewLookup(manifest) {
  if (manifest?.version !== 1 || manifest.legalBasis !== 'jp-search-minor-use' || manifest.maxLongEdge !== 160 ||
      !Array.isArray(manifest.sources) || !Array.isArray(manifest.articles) || manifest.articles.length > 12) fail('invalid bounded manifest');
  const sourceMap = new Map();
  for (const source of manifest.sources) {
    if (!sources[source.sourceSlug] || sourceMap.has(source.sourceSlug) || typeof source.enabled !== 'boolean' || !text(source.sourceName)) fail('invalid source');
    sourceMap.set(source.sourceSlug, source);
  }
  const previews = new Map();
  const allKeys = new Set();
  for (const item of manifest.articles) {
    const source = sourceMap.get(item.sourceSlug);
    const hosts = sources[item.sourceSlug] || [];
    const evidence = item.evidence;
    const credit = item.author ? `${item.sourceName} / ${item.author}` : item.sourceName;
    const preview = readPublicArticlePreview({src:item.thumbnailPath,width:item.width,height:item.height,credit});
    const key = identityKey(item);
    if (!source || !text(item.slug) || !safeSourceUrl(item.originalUrl,hosts) || !safeSourceUrl(item.originalImageUrl,hosts) ||
        item.sourceName !== source.sourceName || typeof item.enabled !== 'boolean' || item.legalBasis !== manifest.legalBasis ||
        !Number.isFinite(Date.parse(item.checkedAt)) || !preview || allKeys.has(key) || !evidence) fail(`invalid reviewed asset ${item.slug || ''}`);
    const enabled = source.enabled && item.enabled;
    if (enabled && (evidence.robotsAllowed !== true || evidence.pageStatus !== 200 || evidence.imageStatus !== 200 ||
        evidence.termsReview !== 'no-explicit-image-republication-ban-found' || !text(evidence.visualReview) ||
        !Number.isInteger(evidence.sourceWidth) || !Number.isInteger(evidence.sourceHeight) ||
        evidence.sourceWidth < item.width || evidence.sourceHeight < item.height)) fail(`invalid active review ${item.slug}`);
    // Exclusions remain a guard even if a future edit mistakenly leaves enabled=true.
    const signals = [evidence.pageMetaRobots,evidence.pageXRobotsTag,evidence.imageXRobotsTag].flat().filter(Boolean).join(',');
    if (enabled && /\b(noindex|noimageindex|nosnippet|none)\b|max-image-preview\s*:\s*none/i.test(signals)) fail(`excluded asset ${item.slug}`);
    allKeys.add(key);
    if (source.enabled && item.enabled) previews.set(key,preview);
  }
  return article => article?.contentType === 'article' ? previews.get(identityKey(article)) : undefined;
}
