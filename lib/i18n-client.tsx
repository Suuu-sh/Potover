'use client';
import {createContext,useContext,useMemo} from 'react';
import {localePath,translate,type Locale} from './i18n';
const LocaleContext=createContext<Locale>('ja');
export function LocaleProvider({locale,children}:{locale:Locale;children:React.ReactNode}){return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;}
export function useI18n(){const locale=useContext(LocaleContext);return useMemo(()=>({locale,t:<T,>(value:T)=>translate(value,locale),href:(value:string)=>localePath(value,locale)}),[locale]);}
