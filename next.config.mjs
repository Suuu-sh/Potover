import {preparePublicArticles} from './scripts/public-articles.mjs';
import {readFile} from 'node:fs/promises';
import {validateArticlePreviewAssets} from './scripts/article-preview-assets.mjs';
await validateArticlePreviewAssets(JSON.parse(await readFile('data/article-preview-manifest.json','utf8')),JSON.parse(await readFile('data/publication-scope.json','utf8')));

await preparePublicArticles({inputPath:process.env.POTOVER_PUBLIC_DATA_INPUT||'data/articles.json'});

const nextConfig = {
  output: 'export',
  // Bound static-export workers on small CI runners.
  experimental: {cpus: 2},
  images: { unoptimized: true },
  trailingSlash: true,
};
export default nextConfig;
