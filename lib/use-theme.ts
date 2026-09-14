'use client';
import {useEffect} from 'react';
import {useUserPreferences} from './user-preferences';
export function useTheme(){
  const {theme,setTheme}=useUserPreferences();
  useEffect(()=>{
    document.documentElement.classList.toggle('dark-mode',theme==='dark');
  },[theme]);
  return {dark:theme==='dark',setTheme};
}
