'use client';

import Link from 'next/link';
import {Menu,X} from 'lucide-react';
import {usePathname} from 'next/navigation';
import {useEffect,useRef,useState} from 'react';

type Props={accountHref:string;accountLabel:string};

export function MobileNavigation({accountHref,accountLabel}:Props){
  const pathname=usePathname();
  const [open,setOpen]=useState(false);
  const root=useRef<HTMLDivElement>(null);
  const trigger=useRef<HTMLButtonElement>(null);
  useEffect(()=>{setOpen(false)},[pathname]);
  useEffect(()=>{
    const outside=(event:PointerEvent)=>{if(!root.current?.contains(event.target as Node))setOpen(false)};
    const escape=(event:KeyboardEvent)=>{if(event.key==='Escape'&&open){setOpen(false);trigger.current?.focus()}};
    document.addEventListener('pointerdown',outside);
    document.addEventListener('keydown',escape);
    return()=>{document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',escape)};
  },[open]);
  const links=[['/home','ホーム'],['/docs','探す'],['/roadmap','ロードマップ'],['/bookmarks','ブックマーク'],[accountHref,accountLabel]];
  return <div className="mobile-navigation" ref={root}>
    <button className="mobile-navigation-toggle" ref={trigger} type="button" aria-label={open?'メニューを閉じる':'メニューを開く'} aria-expanded={open} aria-controls="mobile-navigation-links" onClick={()=>setOpen(value=>!value)}>{open?<X size={20}/>:<Menu size={20}/>}</button>
    {open&&<div id="mobile-navigation-links" className="mobile-navigation-links" role="navigation" aria-label="モバイルナビゲーション">{links.map(([href,label])=><Link key={href} href={href} aria-current={pathname===href||pathname.startsWith(`${href}/`)?'page':undefined} onClick={()=>setOpen(false)}>{label}</Link>)}</div>}
  </div>;
}
