'use client';

import {createContext,useCallback,useContext,useEffect,useMemo,useState} from 'react';
import {authRequest} from './auth-request';
import {useAuth} from './auth-client';

const API_URL=process.env.NEXT_PUBLIC_POTOVER_API_URL||'https://potover-api.suuu-sh.workers.dev';
const TOKEN_KEY='potover-session';

type SourceFollowContextValue={
  followedSources:ReadonlySet<string>;
  loading:boolean;
  isFollowed:(sourceSlug:string)=>boolean;
  toggleSource:(sourceSlug:string)=>Promise<void>;
};

const SourceFollowContext=createContext<SourceFollowContextValue|null>(null);

async function request<T>(options:RequestInit={}){
  const token=typeof window==='undefined'?null:localStorage.getItem(TOKEN_KEY);
  return authRequest<T>(`${API_URL}/api/source-follows`,{...options,headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{ }),...options.headers}});
}

export function SourceFollowProvider({children}:{children:React.ReactNode}){
  const {user,loading:authLoading}=useAuth();
  const [followedSourceSlugs,setFollowedSourceSlugs]=useState<string[]>([]);
  const [loading,setLoading]=useState(false);

  useEffect(()=>{
    let active=true;
    if(authLoading)return()=>{active=false};
    if(!user){setFollowedSourceSlugs([]);setLoading(false);return()=>{active=false}};
    setLoading(true);
    request<{sourceSlugs:string[]}>({method:'GET'}).then(result=>{
      if(active)setFollowedSourceSlugs(result.sourceSlugs);
    }).catch(()=>{
      if(active)setFollowedSourceSlugs([]);
    }).finally(()=>{if(active)setLoading(false)});
    return()=>{active=false};
  },[authLoading,user]);

  const toggleSource=useCallback(async(sourceSlug:string)=>{
    if(!user)throw new Error('ログインが必要です。');
    const followed=followedSourceSlugs.includes(sourceSlug);
    setFollowedSourceSlugs(current=>followed?current.filter(slug=>slug!==sourceSlug):[...current,sourceSlug]);
    try{
      await request({method:'POST',body:JSON.stringify({sourceSlug,followed:!followed})});
    }catch(error){
      setFollowedSourceSlugs(current=>followed?(current.includes(sourceSlug)?current:[...current,sourceSlug]):current.filter(slug=>slug!==sourceSlug));
      throw error;
    }
  },[followedSourceSlugs,user]);

  const value=useMemo<SourceFollowContextValue>(()=>({followedSources:new Set(followedSourceSlugs),loading:authLoading||loading,isFollowed:sourceSlug=>followedSourceSlugs.includes(sourceSlug),toggleSource}),[authLoading,followedSourceSlugs,loading,toggleSource]);
  return <SourceFollowContext.Provider value={value}>{children}</SourceFollowContext.Provider>;
}

export function useSourceFollows(){
  const value=useContext(SourceFollowContext);
  if(!value)throw new Error('useSourceFollows must be used inside SourceFollowProvider');
  return value;
}
