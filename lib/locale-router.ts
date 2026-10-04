'use client';
import {useMemo} from 'react';
import {usePathname as useNextPathname,useRouter as useNextRouter} from 'next/navigation';
import {stripLocale} from './i18n';
import {useI18n} from './i18n-client';
export function usePathname(){return stripLocale(useNextPathname());}
export function useRouter(){const router=useNextRouter();const {href}=useI18n();return useMemo(()=>({...router,push:(path:string,options?:{scroll?:boolean})=>router.push(href(path),options),replace:(path:string,options?:{scroll?:boolean})=>router.replace(href(path),options),prefetch:(path:string)=>router.prefetch(href(path))}),[router,href]);}
