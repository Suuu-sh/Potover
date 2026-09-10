'use client';
import {Bookmark} from 'lucide-react';
import {useEffect,useState} from 'react';
import {useRouter} from 'next/navigation';
import {useAuth} from '@/lib/auth-client';
const KEY='potover-bookmarks';
export function getBookmarks(){if(typeof window==='undefined')return [];try{return JSON.parse(localStorage.getItem(KEY)||'[]') as string[]}catch{return []}}
export function BookmarkButton({slug}:{slug:string}){const router=useRouter();const {user,loading}=useAuth();const [saved,setSaved]=useState(false);useEffect(()=>setSaved(Boolean(user)&&getBookmarks().includes(slug)),[slug,user]);function toggle(){if(loading)return;if(!user){const next=`${location.pathname}${location.search}${location.hash}`;router.push(`/login?next=${encodeURIComponent(next)}&reason=bookmark`);return}const next=getBookmarks();const updated=saved?next.filter(x=>x!==slug):[...next,slug];localStorage.setItem(KEY,JSON.stringify(updated));setSaved(!saved);window.dispatchEvent(new Event('potover-bookmarks-changed'))}const label=!loading&&!user?'ログインしてブックマークに保存':saved?'ブックマークから削除':'ブックマークに保存';return <button className={`bookmark-action${saved?' is-saved':''}`} onClick={toggle} aria-label={label} aria-pressed={saved}><Bookmark size={20} fill={saved?'currentColor':'none'}/></button>}
