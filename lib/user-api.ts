'use client';

import {authRequest} from './auth-request';

export const SESSION_TOKEN_KEY='potover-session';
const API_URL=process.env.NEXT_PUBLIC_POTOVER_API_URL||'https://potover-api.suuu-sh.workers.dev';

export async function userRequest<T>(path:string,options:RequestInit={}):Promise<T>{
  const token=typeof window==='undefined'?null:localStorage.getItem(SESSION_TOKEN_KEY);
  return authRequest<T>(`${API_URL}${path}`,{...options,headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{ }),...options.headers}});
}
