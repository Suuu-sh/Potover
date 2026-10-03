export const dynamic='force-static';
import {MetadataRoute} from 'next';

import {articles} from '@/lib/data';
import {PUBLIC_SITE_URL} from '@/lib/site-url';

export default function sitemap():MetadataRoute.Sitemap{
  const base=PUBLIC_SITE_URL;
  const pages=['','/home','/explore','/glossary','/roadmap','/bookmarks','/articles','/privacy','/terms','/contact'];
  return [...pages.map(path=>({url:`${base}${path}`})),...articles.map(article=>({url:`${base}/articles/${article.slug}`}))];
}
