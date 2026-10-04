'use client';
import {useI18n} from '@/lib/i18n-client';
/** Changing display language does not navigate or modify query, fragment, or form state. */
export function LanguageSwitcher(){
  const {locale,setLocale}=useI18n();const target=locale==='en'?'ja':'en';
  return <button type="button" className="language-switch" lang={target} aria-label={target==='en'?'Switch interface to English':'表示言語を日本語に切り替え'} onClick={()=>setLocale(target)}>{target==='en'?'EN':'日本語'}</button>;
}
