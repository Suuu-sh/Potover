'use client';
import {useEffect,useState} from 'react';
export function useTheme(){
  const [dark,setDark]=useState(false);
  useEffect(()=>{
    const sync=()=>setDark(document.documentElement.classList.contains('dark-mode'));
    sync();
    const observer=new MutationObserver(sync);
    observer.observe(document.documentElement,{attributes:true,attributeFilter:['class']});
    return()=>observer.disconnect();
  },[]);
  const setTheme=(value:'light'|'dark')=>{
    localStorage.setItem('potover-theme',value);
    document.documentElement.classList.toggle('dark-mode',value==='dark');
    setDark(value==='dark');
  };
  return {dark,setTheme};
}
