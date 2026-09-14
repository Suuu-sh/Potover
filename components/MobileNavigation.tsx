'use client';

import Link from 'next/link';
import {Bookmark,BookOpenText,Compass,Home,Map,Menu,UserCircle,UserRoundPlus,X} from 'lucide-react';
import {usePathname} from 'next/navigation';
import {useEffect,useRef,useState} from 'react';

type Props={accountHref:string;accountLabel:string;showRoadmap:boolean;roadmapHref?:string};

export function MobileNavigation({accountHref,accountLabel,showRoadmap,roadmapHref='/roadmap'}:Props){
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
  const links=[{href:'/',label:'ホーム',Icon:Home},{href:'/docs',label:'探す',Icon:Compass},{href:'/glossary',label:'用語集',Icon:BookOpenText},...(showRoadmap?[{href:roadmapHref,label:'ロードマップ',Icon:Map}]:[]),{href:'/bookmarks',label:'ブックマーク',Icon:Bookmark},{href:accountHref,label:accountLabel,Icon:accountLabel==='アカウント'?UserCircle:UserRoundPlus}];
  return <div className="mobile-navigation" ref={root}>
    <button className="mobile-navigation-toggle" ref={trigger} type="button" aria-label={open?'メニューを閉じる':'メニューを開く'} aria-expanded={open} aria-controls="mobile-navigation-links" onClick={()=>setOpen(value=>!value)}>{open?<X size={20}/>:<Menu size={20}/>}</button>
    {open&&<div id="mobile-navigation-links" className="mobile-navigation-links" role="navigation" aria-label="モバイルナビゲーション">{links.map(({href,label,Icon})=><Link key={href} href={href} aria-label={label} title={label} aria-current={pathname===href||pathname.startsWith(`${href}/`)?'page':undefined} onClick={()=>setOpen(false)}><Icon size={19} aria-hidden="true"/><span>{label}</span></Link>)}</div>}
  </div>;
}
