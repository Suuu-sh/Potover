'use client';
import {useEffect} from 'react';
import {usePathname} from 'next/navigation';
import {canonicalPath,pageMetadata} from '@/lib/i18n';
import {useI18n} from '@/lib/i18n-client';
import {watchDocumentMetadata} from '@/lib/document-metadata';
import {articles} from '@/lib/data';

export function LocaleDocumentMetadata(){
  const pathname=usePathname();const {locale}=useI18n();
  useEffect(()=>{
    const path=canonicalPath(pathname);
    const article=path.startsWith('/articles/')?articles.find(item=>path===`/articles/${item.slug}`):undefined;
    const metadata=pageMetadata(path,locale,article?.title);
    // Use the original title, so late head updates cannot leave a previous page's title.
    return watchDocumentMetadata(document,MutationObserver,{
      title:path.startsWith('/articles/')&&!article?undefined:String(metadata.title),
      description:String(metadata.description),
    },()=>canonicalPath(window.location.pathname)===path);
  },[pathname,locale]);
  return null;
}
