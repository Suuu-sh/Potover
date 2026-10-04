import {preparePublicArticles} from './scripts/public-articles.mjs';
import {validateOwnedArtwork} from './scripts/owned-artwork.mjs';
await validateOwnedArtwork();

await preparePublicArticles({inputPath:process.env.POTOVER_PUBLIC_DATA_INPUT||'data/articles.json'});

const nextConfig = {
  output: 'export',
  // Bound build memory while exporting the full fixed article directory.
  experimental: {cpus: 1, webpackMemoryOptimizations: true},
  images: { unoptimized: true },
  trailingSlash: true,
};
export default nextConfig;
