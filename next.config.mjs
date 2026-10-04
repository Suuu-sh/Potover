import {preparePublicArticles} from './scripts/public-articles.mjs';

await preparePublicArticles({inputPath:process.env.POTOVER_PUBLIC_DATA_INPUT||'data/articles.json'});

const nextConfig = {
  output: 'export',
  // Bound static-export workers on small CI runners.
  experimental: {cpus: 2},
  images: { unoptimized: true },
  trailingSlash: true,
};
export default nextConfig;
