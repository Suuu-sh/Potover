'use client';
import {Suspense,useSyncExternalStore} from 'react';
import {usePathname,useSearchParams} from 'next/navigation';
import {useI18n} from '@/lib/i18n-client';
import {localePath} from '@/lib/i18n';

function subscribeToHash(listener:()=>void){
  window.addEventListener('hashchange',listener);
  window.addEventListener('popstate',listener);
  return()=>{window.removeEventListener('hashchange',listener);window.removeEventListener('popstate',listener);};
}
const readHash=()=>window.location.hash;
const serverHash=()=>'';
function CurrentLanguageLink(){
  const path=usePathname();const searchParams=useSearchParams();const {locale}=useI18n();
  const hash=useSyncExternalStore(subscribeToHash,readHash,serverHash);
  const target=locale==='en'?'ja':'en';const query=searchParams.toString();
  const destination=localePath(`${path}${query?`?${query}`:''}${hash}`,target);
  return <a className="language-switch" href={destination} lang={target} hrefLang={target} aria-label={target==='en'?'Switch interface to English':'表示言語を日本語に切り替え'}>{target==='en'?'EN':'日本語'}</a>;
}
/** The actual href tracks URL state, so copy, context-menu and modified clicks agree. */
export function LanguageSwitcher(){
  const {locale}=useI18n();
  // A static export cannot know a visitor's query or fragment. Keep the control
  // non-interactive until that state is available rather than expose a lossy link.
  return <Suspense fallback={<span className="language-switch" aria-hidden="true">{locale==='en'?'日本語':'EN'}</span>}><CurrentLanguageLink/></Suspense>;
}
