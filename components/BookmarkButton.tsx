'use client';
import {Bookmark} from 'lucide-react';
import {useEffect,useState} from 'react';
const KEY='potover-bookmarks';
export function getBookmarks(){if(typeof window==='undefined')return [];try{return JSON.parse(localStorage.getItem(KEY)||'[]') as string[]}catch{return []}}
export function BookmarkButton({slug}:{slug:string}){const [saved,setSaved]=useState(false);useEffect(()=>setSaved(getBookmarks().includes(slug)),[slug]);function toggle(){const next=getBookmarks();const updated=saved?next.filter(x=>x!==slug):[...next,slug];localStorage.setItem(KEY,JSON.stringify(updated));setSaved(!saved);window.dispatchEvent(new Event('potover-bookmarks-changed'))}return <button className={`bookmark-action${saved?' is-saved':''}`} onClick={toggle} aria-label={saved?'ブックマークから削除':'ブックマークに保存'} aria-pressed={saved}><Bookmark size={20} fill={saved?'currentColor':'none'}/></button>}
