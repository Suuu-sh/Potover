'use client';

import {createContext,useCallback,useContext,useEffect,useMemo,useState} from 'react';
import {useAuth} from './auth-client';
import {userRequest} from './user-api';

type BookmarkContextValue={slugs:string[];loading:boolean;isBookmarked:(slug:string)=>boolean;toggleBookmark:(slug:string)=>Promise<void>};
const BookmarkContext=createContext<BookmarkContextValue|null>(null);

export function BookmarksProvider({children}:{children:React.ReactNode}){
  const {user,loading:authLoading}=useAuth();
  const [slugs,setSlugs]=useState<string[]>([]);
  const [loading,setLoading]=useState(false);

  useEffect(()=>{
    let active=true;
    if(authLoading)return()=>{active=false};
    if(!user){setSlugs([]);setLoading(false);return()=>{active=false}};
    setLoading(true);
    userRequest<{slugs:string[]}>('/api/bookmarks').then(result=>{
      if(active)setSlugs(Array.isArray(result.slugs)?result.slugs:[]);
    }).catch(()=>{
      if(active)setSlugs([]);
    }).finally(()=>{if(active)setLoading(false)});
    return()=>{active=false};
  },[authLoading,user]);

  const toggleBookmark=useCallback(async(slug:string)=>{
    if(!user)throw new Error('ログインが必要です。');
    const saved=slugs.includes(slug);
    const previous=slugs;
    setSlugs(current=>saved?current.filter(item=>item!==slug):[...current,slug]);
    try{await userRequest('/api/bookmarks',{method:'POST',body:JSON.stringify({slug,saved:!saved})})}
    catch(error){setSlugs(previous);throw error}
  },[slugs,user]);
  const value=useMemo(()=>({slugs,loading:authLoading||loading,isBookmarked:(slug:string)=>slugs.includes(slug),toggleBookmark}),[authLoading,loading,slugs,toggleBookmark]);
  return <BookmarkContext.Provider value={value}>{children}</BookmarkContext.Provider>;
}

export function useBookmarks(){
  const value=useContext(BookmarkContext);
  if(!value)throw new Error('useBookmarks must be used inside BookmarksProvider');
  return value;
}
