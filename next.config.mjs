import {preparePublicArticles} from './scripts/public-articles.mjs';

await preparePublicArticles({inputPath:process.env.POTOVER_PUBLIC_DATA_INPUT||'data/articles.json'});

const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: true,
};
export default nextConfig;
