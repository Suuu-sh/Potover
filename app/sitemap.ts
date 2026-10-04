export const dynamic='force-static';
import type {MetadataRoute} from 'next';
import {articles} from '@/lib/data';
import {PUBLIC_SITE_URL} from '@/lib/site-url';
import {locales,pageUrl} from '@/lib/i18n';

export default function sitemap():MetadataRoute.Sitemap{
  // Aliases and private/account pages are deliberately excluded.
  const pages=['/','/explore','/glossary','/roadmap','/sources','/articles','/privacy','/terms','/contact',...articles.map(article=>`/articles/${article.slug}`)];
  return pages.flatMap(path=>locales.map(locale=>({url:pageUrl(path,locale),alternates:{languages:{ja:pageUrl(path,'ja'),en:pageUrl(path,'en'),'x-default':new URL(pageUrl(path,'ja'),PUBLIC_SITE_URL).href}}})));
}
