'use client';
import Image from 'next/image';
import {BookOpen,Play} from 'lucide-react';
import {useState} from 'react';
import type {Article} from '@/lib/data';
import {safeArticleCover} from '@/packages/publication/article-covers.mjs';
type Props={article:Article;fill?:boolean;priority?:boolean;sizes?:string;className?:string};
export function ArticleCover({article,fill=false,priority=false,sizes,className}:Props){
  const [failed,setFailed]=useState<string>();
  const src=safeArticleCover(article.imageUrl,{...article,originalUrl:article.url});
  if(!src||src===failed)return <span style={{display:'grid',placeItems:'center',width:'100%',height:'100%'}}>{article.contentType==='video'?<Play size={36} aria-hidden="true"/>:<BookOpen size={36} aria-hidden="true"/>}</span>;
  return <Image className={className} src={src} alt="" {...(fill?{fill:true}:{width:160,height:96})} sizes={sizes} priority={priority} unoptimized referrerPolicy="no-referrer" onError={()=>setFailed(src)}/>;
}
