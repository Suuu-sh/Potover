'use client';
import {useI18n} from '@/lib/i18n-client';

import {authRequest} from './auth-request';
import {restoreSession} from './auth-session';
import {migrateLegacyStorage} from './legacy-storage-migration';
import {LOCAL_GUEST_TOKEN,LOCAL_GUEST_USER,localGuestEnabled} from './local-guest';
import {SESSION_TOKEN_KEY} from './user-api';

import {createContext,useCallback,useContext,useEffect,useMemo,useRef,useState} from 'react';

type User={id:string;email:string};
type AuthContextValue={user:User|null;loading:boolean;login:(email:string,password:string)=>Promise<void>;register:(email:string,password:string)=>Promise<void>;changePassword:(currentPassword:string,newPassword:string)=>Promise<void>;deleteAccount:(password:string)=>Promise<void>;logout:()=>Promise<void>;loginAsGuest:()=>void};

const API_URL=process.env.NEXT_PUBLIC_POTOVER_API_URL||'https://potover-api.suuu-sh.workers.dev';
const AuthContext=createContext<AuthContextValue|null>(null);

async function request<T>(path:string,options:RequestInit={}){
  const token=typeof window==='undefined'?null:localStorage.getItem(SESSION_TOKEN_KEY);
  return authRequest<T>(`${API_URL}${path}`,{...options,headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{ }),...options.headers}});
}

export function AuthProvider({children}:{children:React.ReactNode}){
  const {t:uiText}=useI18n();
  const [user,setUser]=useState<User|null>(null);
  const [loading,setLoading]=useState(true);
  const [sessionError,setSessionError]=useState<string|null>(null);
  const sessionAttempt=useRef(0);
  const loadSession=useCallback(async()=>{
    const attempt=++sessionAttempt.current;
    const token=localStorage.getItem(SESSION_TOKEN_KEY);
    if(!token){setUser(null);setSessionError(null);setLoading(false);return}
    setLoading(true);
    const result=await restoreSession<User>(
      async()=>{
        const response=await request<{user:User}>('/api/auth/me');
        await migrateLegacyStorage();
        return response;
      },
      ()=>{if(attempt===sessionAttempt.current&&localStorage.getItem(SESSION_TOKEN_KEY)===token)localStorage.removeItem(SESSION_TOKEN_KEY)},
    );
    // A newer login, logout, or retry owns state after it starts.
    if(attempt!==sessionAttempt.current)return;
    if(result.state==='authenticated'){setUser(result.user);setSessionError(null)}
    else if(result.state==='expired'){setUser(null);setSessionError(null)}
    else setSessionError(result.message);
    setLoading(false);
  },[]);
  const invalidateSessionAttempt=useCallback(()=>{sessionAttempt.current++},[]);
  useEffect(()=>{void loadSession();return invalidateSessionAttempt},[loadSession,invalidateSessionAttempt]);
  const authenticate=useCallback(async(path:string,email:string,password:string)=>{
    const attempt=++sessionAttempt.current;
    try{
      const result=await request<{token:string;user:User}>(path,{method:'POST',body:JSON.stringify({email,password})});
      if(attempt!==sessionAttempt.current)return;
      localStorage.setItem(SESSION_TOKEN_KEY,result.token);
      await migrateLegacyStorage();
      if(attempt===sessionAttempt.current){setUser(result.user);setSessionError(null)}
    }finally{if(attempt===sessionAttempt.current)setLoading(false)}
  },[]);
  // Local development only: signs in without the auth worker (see lib/local-guest.ts).
  const loginAsGuest=useCallback(()=>{
    if(!localGuestEnabled)throw new Error('ゲストはローカル開発でのみ利用できます。');
    sessionAttempt.current++;
    localStorage.setItem(SESSION_TOKEN_KEY,LOCAL_GUEST_TOKEN);
    setUser(LOCAL_GUEST_USER);setSessionError(null);setLoading(false);
  },[]);
  const login=useCallback((email:string,password:string)=>authenticate('/api/auth/login',email,password),[authenticate]);
  const register=useCallback((email:string,password:string)=>authenticate('/api/auth/register',email,password),[authenticate]);
  const changePassword=useCallback(async(currentPassword:string,newPassword:string)=>{
    const result=await request<{token:string;user:User}>('/api/auth/password',{method:'POST',body:JSON.stringify({currentPassword,newPassword})});
    sessionAttempt.current++;
    localStorage.setItem(SESSION_TOKEN_KEY,result.token);
    setSessionError(null);
    setUser(result.user);
  },[]);
  const deleteAccount=useCallback(async(password:string)=>{
    await request('/api/auth/account',{method:'DELETE',body:JSON.stringify({password})});
    sessionAttempt.current++;
    localStorage.removeItem(SESSION_TOKEN_KEY);
    setSessionError(null);
    setUser(null);
  },[]);
  const logout=useCallback(async()=>{sessionAttempt.current++;try{await request('/api/auth/logout',{method:'POST'})}finally{localStorage.removeItem(SESSION_TOKEN_KEY);setSessionError(null);setUser(null);setLoading(false)}},[]);
  const value=useMemo(()=>({user,loading,login,register,changePassword,deleteAccount,logout,loginAsGuest}),[user,loading,login,register,changePassword,deleteAccount,logout,loginAsGuest]);
  return <AuthContext.Provider value={value}>
    {sessionError&&<div role="alert" style={{position:'relative',top:64,padding:'12px 20px',background:'var(--color-error-soft)',color:'var(--color-text)',display:'flex',gap:12,alignItems:'center',flexWrap:'wrap'}}>
      <span>{uiText(sessionError)}</span>
      <button type="button" disabled={loading} onClick={()=>void loadSession()} style={{color:'var(--color-link)',textDecoration:'underline'}}>{uiText(loading?'確認中…':'もう一度試す')}</button>
    </div>}
    {children}
  </AuthContext.Provider>;
}

export function useAuth(){const value=useContext(AuthContext);if(!value)throw new Error('useAuth must be used inside AuthProvider');return value}
