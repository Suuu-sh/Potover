'use client';
import Image from 'next/image';
import Link from 'next/link';
import {Bookmark,Moon,Search,Sun,UserCircle} from 'lucide-react';
import {usePathname} from 'next/navigation';
import {useEffect,useState} from 'react';
const navigation=[{href:'/docs',label:'探す'},{href:'/roadmap',label:'ロードマップ'}];
export function SiteHeader(){
  const pathname=usePathname();const [dark,setDark]=useState(false);
  useEffect(()=>{const saved=localStorage.getItem('potover-theme')==='dark';setDark(saved);document.documentElement.classList.toggle('dark-mode',saved)},[]);
  function toggle(){const next=!dark;setDark(next);localStorage.setItem('potover-theme',next?'dark':'light');document.documentElement.classList.toggle('dark-mode',next)}
  return <header className="site-header"><div className="site-header-inner"><Link className="brand-lockup" href="/" aria-label="Potover ホーム"><span className="brand-mark" aria-hidden="true"><Image src="/brand/potover-mark.svg" alt="" width={64} height={64} priority/></span><span className="brand-wordmark">Potover</span></Link><nav aria-label="メインナビゲーション">{navigation.map(item=>{const active=pathname===item.href||pathname.startsWith(`${item.href}/`);return <Link key={item.href} href={item.href} className={active?'is-active':undefined} aria-current={active?'page':undefined}>{item.label}</Link>})}</nav><form className="site-header-search" action="/docs" role="search"><Search size={18}/><input name="q" aria-label="コンテンツを検索" placeholder="記事や動画、ポーカー戦略を検索…"/><button type="submit">検索</button></form><div className="atlas-actions"><Link className={`bookmarks-action${pathname==='/bookmarks'?' is-active':''}`} href="/bookmarks"><Bookmark size={17}/>ブックマーク</Link><button className="theme-toggle" onClick={toggle} aria-label={dark?'ライトモードに切り替え':'ダークモードに切り替え'}>{dark?<Sun size={18}/>:<Moon size={18}/>}</button><Link className={`profile-action${pathname==='/profile'?' is-active':''}`} href="/profile" aria-label="プロフィール"><UserCircle size={26}/></Link></div></div></header>
}
