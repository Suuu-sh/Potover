'use client';

import {createContext,useCallback,useContext,useEffect,useMemo,useRef,useState} from 'react';
import {useAuth} from './auth-client';
import {userRequest} from './user-api';

export type PreferredLanguage='Japanese'|'English';
export type ThemePreference='light'|'dark';
export type DocsFilters={query:string;selected:string[]};
export type UserPreferences={language:PreferredLanguage;theme:ThemePreference;docsQuery:string;docsFilters:string[]};

const defaults:UserPreferences={language:'Japanese',theme:'light',docsQuery:'',docsFilters:[]};
type UserPreferencesContextValue=UserPreferences&{loading:boolean;setLanguage:(value:PreferredLanguage)=>Promise<void>;setTheme:(value:ThemePreference)=>Promise<void>;setDocsFilters:(value:DocsFilters)=>Promise<void>};
const UserPreferencesContext=createContext<UserPreferencesContextValue|null>(null);

function normalize(value:Partial<UserPreferences>):UserPreferences{
  return {language:value.language==='English'?'English':'Japanese',theme:value.theme==='dark'?'dark':'light',docsQuery:typeof value.docsQuery==='string'?value.docsQuery:'',docsFilters:Array.isArray(value.docsFilters)?value.docsFilters.filter(item=>typeof item==='string').slice(0,100):[]};
}

export function UserPreferencesProvider({children}:{children:React.ReactNode}){
  const {user,loading:authLoading}=useAuth();
  const [preferences,setPreferences]=useState<UserPreferences>(defaults);
  const [loading,setLoading]=useState(true);
  const saveQueue=useRef<Promise<void>>(Promise.resolve());

  useEffect(()=>{
    let active=true;
    if(authLoading){setLoading(true);return()=>{active=false}};
    if(!user){setPreferences(defaults);setLoading(false);return()=>{active=false}};
    setLoading(true);
    userRequest<Partial<UserPreferences>>('/api/preferences').then(result=>{
      if(active)setPreferences(normalize(result));
    }).catch(()=>{
      if(active)setPreferences(defaults);
    }).finally(()=>{if(active)setLoading(false)});
    return()=>{active=false};
  },[authLoading,user]);

  useEffect(()=>{document.documentElement.classList.toggle('dark-mode',preferences.theme==='dark')},[preferences.theme]);

  const save=useCallback((patch:Partial<UserPreferences>)=>{
    if(!user)return Promise.resolve();
    setPreferences(current=>normalize({...current,...patch}));
    saveQueue.current=saveQueue.current.catch(()=>undefined).then(()=>userRequest('/api/preferences',{method:'POST',body:JSON.stringify(patch)}).then(()=>undefined));
    return saveQueue.current;
  },[user]);
  const setLanguage=useCallback((value:PreferredLanguage)=>save({language:value}),[save]);
  const setTheme=useCallback((value:ThemePreference)=>save({theme:value}),[save]);
  const setDocsFilters=useCallback((value:DocsFilters)=>save({docsQuery:value.query,docsFilters:value.selected}),[save]);
  const value=useMemo(()=>({...preferences,loading,setLanguage,setTheme,setDocsFilters}),[preferences,loading,setLanguage,setTheme,setDocsFilters]);
  return <UserPreferencesContext.Provider value={value}>{children}</UserPreferencesContext.Provider>;
}

export function useUserPreferences(){
  const value=useContext(UserPreferencesContext);
  if(!value)throw new Error('useUserPreferences must be used inside UserPreferencesProvider');
  return value;
}
