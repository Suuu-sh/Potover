'use client';
import {createContext,useContext,useEffect,useMemo,useSyncExternalStore} from 'react';
import {localePath,translate,type Locale} from './i18n';
import {createInterfaceLanguageStore,INTERFACE_LANGUAGE_KEY} from './interface-language';
const store=createInterfaceLanguageStore({read:()=>window.localStorage.getItem(INTERFACE_LANGUAGE_KEY),write:locale=>window.localStorage.setItem(INTERFACE_LANGUAGE_KEY,locale),languages:()=>navigator.languages.length?navigator.languages:[navigator.language]});
const LocaleContext=createContext<{locale:Locale;setLocale:(locale:Locale)=>void}>({locale:'ja',setLocale:()=>{}});
const serverLocale=():Locale=>'ja';
function subscribe(listener:()=>void){
  const unsubscribe=store.subscribe(listener);
  const onStorage=(event:StorageEvent)=>{if(event.key===INTERFACE_LANGUAGE_KEY||event.key===null)store.syncPreference(event.newValue);};
  const onLanguageChange=()=>store.browserChanged();
  window.addEventListener('storage',onStorage);window.addEventListener('languagechange',onLanguageChange);
  return()=>{unsubscribe();window.removeEventListener('storage',onStorage);window.removeEventListener('languagechange',onLanguageChange);};
}
export function LocaleProvider({children}:{children:React.ReactNode}){
  const locale=useSyncExternalStore(subscribe,store.getSnapshot,serverLocale);
  useEffect(()=>{document.documentElement.lang=locale;},[locale]);
  const value=useMemo(()=>({locale,setLocale:store.select}),[locale]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}
export function useI18n(){const {locale,setLocale}=useContext(LocaleContext);return useMemo(()=>({locale,setLocale,t:<T,>(value:T)=>translate(value,locale),href:(value:string)=>localePath(value,locale)}),[locale,setLocale]);}
