'use client';

import {authRequest} from './auth-request';
import {migrateLegacyStorage} from './legacy-storage-migration';
import {SESSION_TOKEN_KEY} from './user-api';

import {createContext,useCallback,useContext,useEffect,useMemo,useState} from 'react';

type User={id:string;email:string};
type AuthContextValue={user:User|null;loading:boolean;login:(email:string,password:string)=>Promise<void>;register:(email:string,password:string)=>Promise<void>;logout:()=>Promise<void>};

const API_URL=process.env.NEXT_PUBLIC_POTOVER_API_URL||'https://potover-api.suuu-sh.workers.dev';
const AuthContext=createContext<AuthContextValue|null>(null);

async function request<T>(path:string,options:RequestInit={}){
  const token=typeof window==='undefined'?null:localStorage.getItem(SESSION_TOKEN_KEY);
  return authRequest<T>(`${API_URL}${path}`,{...options,headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{ }),...options.headers}});
}

export function AuthProvider({children}:{children:React.ReactNode}){
  const [user,setUser]=useState<User|null>(null);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{const token=localStorage.getItem(SESSION_TOKEN_KEY);if(!token){setLoading(false);return}request<{user:User}>('/api/auth/me').then(async result=>{await migrateLegacyStorage();setUser(result.user)}).catch(()=>localStorage.removeItem(SESSION_TOKEN_KEY)).finally(()=>setLoading(false))},[]);
  const authenticate=useCallback(async(path:string,email:string,password:string)=>{const result=await request<{token:string;user:User}>(path,{method:'POST',body:JSON.stringify({email,password})});localStorage.setItem(SESSION_TOKEN_KEY,result.token);await migrateLegacyStorage();setUser(result.user)},[]);
  const login=useCallback((email:string,password:string)=>authenticate('/api/auth/login',email,password),[authenticate]);
  const register=useCallback((email:string,password:string)=>authenticate('/api/auth/register',email,password),[authenticate]);
  const logout=useCallback(async()=>{try{await request('/api/auth/logout',{method:'POST'})}finally{localStorage.removeItem(SESSION_TOKEN_KEY);setUser(null)}},[]);
  const value=useMemo(()=>({user,loading,login,register,logout}),[user,loading,login,register,logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(){const value=useContext(AuthContext);if(!value)throw new Error('useAuth must be used inside AuthProvider');return value}
