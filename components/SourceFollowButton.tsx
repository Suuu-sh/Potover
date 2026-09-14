'use client';

import {Check,Plus} from 'lucide-react';
import {useState,type MouseEvent} from 'react';
import {useAuth} from '@/lib/auth-client';
import {useSourceFollows} from '@/lib/source-follows';

export function SourceFollowButton({sourceSlug,sourceName}:{sourceSlug:string;sourceName:string}){
  const {user,loading:authLoading}=useAuth();
  const {loading:followLoading,isFollowed,toggleSource}=useSourceFollows();
  const [pending,setPending]=useState(false);
  const [error,setError]=useState('');
  const followed=isFollowed(sourceSlug);
  const disabled=followLoading||pending;

  async function toggle(event:MouseEvent<HTMLButtonElement>){
    event.preventDefault();
    event.stopPropagation();
    setError('');
    setPending(true);
    try{await toggleSource(sourceSlug)}catch(reason){setError(reason instanceof Error?reason.message:'フォローの更新に失敗しました。')}finally{setPending(false)}
  }

  if(authLoading||!user)return null;

  return <button type="button" className={`source-follow-action${followed?' is-following':''}`} onClick={toggle} disabled={disabled} aria-pressed={followed} aria-label={followed?`${sourceName}のフォローを解除`:`${sourceName}をフォロー`} title={error||undefined}>
    {followed?<Check size={12} aria-hidden="true"/>:<Plus size={12} aria-hidden="true"/>}
    <span>{followed?'フォロー中':'フォロー'}</span>
  </button>;
}
