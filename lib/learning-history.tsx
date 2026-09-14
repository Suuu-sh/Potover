'use client';

import {createContext,useCallback,useContext,useEffect,useMemo,useState} from 'react';
import {useAuth} from './auth-client';
import {userRequest} from './user-api';

export type LearningEvent={slug:string;openedAt:string};
type LearningHistoryContextValue={events:LearningEvent[];loading:boolean;hasRead:(slug:string)=>boolean;recordLearning:(slug:string)=>Promise<void>};
const LearningHistoryContext=createContext<LearningHistoryContextValue|null>(null);

function normalizeEvents(value:unknown):LearningEvent[]{
  if(!Array.isArray(value))return [];
  return value.filter((event):event is LearningEvent=>Boolean(event&&typeof event==='object'&&typeof (event as LearningEvent).slug==='string'&&typeof (event as LearningEvent).openedAt==='string')).slice(0,500);
}

export function LearningHistoryProvider({children}:{children:React.ReactNode}){
  const {user,loading:authLoading}=useAuth();
  const [events,setEvents]=useState<LearningEvent[]>([]);
  const [loading,setLoading]=useState(false);

  useEffect(()=>{
    let active=true;
    if(authLoading)return()=>{active=false};
    if(!user){setEvents([]);setLoading(false);return()=>{active=false}};
    setLoading(true);
    userRequest<{events:unknown}>('/api/learning-history').then(result=>{
      if(active)setEvents(normalizeEvents(result.events));
    }).catch(()=>{
      if(active)setEvents([]);
    }).finally(()=>{if(active)setLoading(false)});
    return()=>{active=false};
  },[authLoading,user]);

  const recordLearning=useCallback(async(slug:string)=>{
    if(!user)throw new Error('ログインが必要です。');
    const today=new Date().toISOString().slice(0,10);
    if(events.some(event=>event.slug===slug&&event.openedAt.slice(0,10)===today))return;
    const optimistic={slug,openedAt:new Date().toISOString()};
    setEvents(current=>[optimistic,...current].slice(0,500));
    try{
      const result=await userRequest<{event:LearningEvent}>('/api/learning-history',{method:'POST',body:JSON.stringify({slug})});
      if(result.event)setEvents(current=>current.map(event=>event===optimistic?result.event:event));
    }catch(error){setEvents(current=>current.filter(event=>event!==optimistic));throw error}
  },[events,user]);
  const value=useMemo(()=>({events,loading:authLoading||loading,hasRead:(slug:string)=>events.some(event=>event.slug===slug),recordLearning}),[authLoading,events,loading,recordLearning]);
  return <LearningHistoryContext.Provider value={value}>{children}</LearningHistoryContext.Provider>;
}

export function useLearningHistory(){
  const value=useContext(LearningHistoryContext);
  if(!value)throw new Error('useLearningHistory must be used inside LearningHistoryProvider');
  return value;
}
