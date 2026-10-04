'use client';
import {useEffect} from 'react';
import {usePathname} from 'next/navigation';
import {canonicalPath,pageMetadata} from '@/lib/i18n';
import {useI18n} from '@/lib/i18n-client';

export function LocaleDocumentMetadata(){
  const pathname=usePathname();const {locale}=useI18n();
  useEffect(()=>{
    const metadata=pageMetadata(pathname,locale);
    // Source article titles remain in their original language in both interfaces.
    if(!canonicalPath(pathname).startsWith('/articles/'))document.title=String(metadata.title);
    document.querySelector('meta[name="description"]')?.setAttribute('content',String(metadata.description));
  },[pathname,locale]);
  return null;
}
