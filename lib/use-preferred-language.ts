'use client';

import {useEffect,useState} from 'react';

export type PreferredLanguage='Japanese'|'English';
const KEY='potover-language';
const EVENT='potover-language-changed';

export function usePreferredLanguage(){
  const [language,setLanguageState]=useState<PreferredLanguage>('Japanese');
  useEffect(()=>{const sync=()=>setLanguageState(localStorage.getItem(KEY)==='English'?'English':'Japanese');sync();window.addEventListener(EVENT,sync);return()=>window.removeEventListener(EVENT,sync)},[]);
  const setLanguage=(next:PreferredLanguage)=>{localStorage.setItem(KEY,next);setLanguageState(next);window.dispatchEvent(new Event(EVENT))};
  return [language,setLanguage] as const;
}
