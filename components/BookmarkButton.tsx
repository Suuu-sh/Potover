'use client';
import {Bookmark} from 'lucide-react';
import {useEffect,useState} from 'react';
import {useRouter} from 'next/navigation';
import {useAuth} from '@/lib/auth-client';
import {useBookmarks} from '@/lib/bookmarks';
export function BookmarkButton({slug}:{slug:string}){const router=useRouter();const {user,loading:authLoading}=useAuth();const {isBookmarked,toggleBookmark,loading:bookmarkLoading}=useBookmarks();const [pending,setPending]=useState(false);const saved=Boolean(user)&&isBookmarked(slug);useEffect(()=>setPending(false),[slug,user]);async function toggle(){if(authLoading||bookmarkLoading||pending)return;if(!user){const next=`${location.pathname}${location.search}${location.hash}`;router.push(`/login?next=${encodeURIComponent(next)}&reason=bookmark`);return}setPending(true);try{await toggleBookmark(slug)}finally{setPending(false)}}const label=!authLoading&&!user?'ログインしてブックマークに保存':saved?'ブックマークから削除':'ブックマークに保存';return <button className={`bookmark-action${saved?' is-saved':''}`} onClick={toggle} disabled={pending||bookmarkLoading} aria-label={label} aria-pressed={saved}><Bookmark size={20} fill={saved?'currentColor':'none'}/></button>}
