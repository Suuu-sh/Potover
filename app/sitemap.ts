export const dynamic='force-static';
import type {MetadataRoute} from 'next';
import {articles} from '@/lib/data';
import {pageUrl} from '@/lib/i18n';

export default function sitemap():MetadataRoute.Sitemap{
  // Aliases and private/account pages are deliberately excluded.
  const pages=['/','/explore','/glossary','/roadmap','/sources','/articles','/privacy','/terms','/contact',...articles.map(article=>`/articles/${article.slug}`)];
  return pages.map(path=>({url:pageUrl(path,'ja')}));
}
