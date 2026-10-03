export const dynamic='force-static';
import {MetadataRoute} from 'next';

import {articles} from '@/lib/data';

export default function sitemap():MetadataRoute.Sitemap{
  const base='https://potover.com';
  const pages=['','/home','/explore','/glossary','/roadmap','/bookmarks','/articles','/privacy','/terms','/contact'];
  return [...pages.map(path=>({url:`${base}${path}`})),...articles.map(article=>({url:`${base}/articles/${article.slug}`}))];
}
