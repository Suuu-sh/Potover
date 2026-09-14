'use client';

import {Check,Plus} from 'lucide-react';
import {useRouter} from 'next/navigation';
import {useState} from 'react';
import {useAuth} from '@/lib/auth-client';
import {useSourceFollows} from '@/lib/source-follows';

export function SourceFollowButton({sourceSlug,sourceName}:{sourceSlug:string;sourceName:string}){
  const router=useRouter();
  const {user,loading:authLoading}=useAuth();
  const {loading:followLoading,isFollowed,toggleSource}=useSourceFollows();
  const [pending,setPending]=useState(false);
  const [error,setError]=useState('');
  const followed=isFollowed(sourceSlug);
  const disabled=authLoading||followLoading||pending;

  async function toggle(){
    setError('');
    if(authLoading)return;
    if(!user){
      const next=`${location.pathname}${location.search}${location.hash}`;
      router.push(`/login?next=${encodeURIComponent(next)}&reason=source`);
      return;
    }
    setPending(true);
    try{await toggleSource(sourceSlug)}catch(reason){setError(reason instanceof Error?reason.message:'フォローの更新に失敗しました。')}finally{setPending(false)}
  }

  return <button type="button" className={`source-follow-action${followed?' is-following':''}`} onClick={toggle} disabled={disabled} aria-pressed={followed} aria-label={followed?`${sourceName}のフォローを解除`:`${sourceName}をフォロー`} title={error||undefined}>
    {followed?<Check size={12} aria-hidden="true"/>:<Plus size={12} aria-hidden="true"/>}
    <span>{followed?'フォロー中':'フォロー'}</span>
  </button>;
}
