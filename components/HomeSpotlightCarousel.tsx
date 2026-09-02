'use client';

import Image from 'next/image';
import Link from 'next/link';
import {ArrowLeft,ArrowRight} from 'lucide-react';
import {useRef} from 'react';

import {articles} from '@/lib/data';

const promos=[
  {href:'/docs',image:'/banners/potover-strategy-hero.png',label:'Potover Picks',title:'今週読むべきポーカー戦略'},
  ...articles.slice(0,6).map(article=>({href:`/articles/${article.slug}`,image:article.imageUrl||'/banners/range-map.png',label:article.source,title:article.title})),
];

export function HomeSpotlightCarousel(){
  const rail=useRef<HTMLDivElement>(null);
  const slide=(direction:number)=>rail.current?.scrollBy({left:direction*460,behavior:'smooth'});
  return <section className="home-spotlight" aria-label="おすすめ">
    <div className="home-spotlight-head"><h1>おすすめ</h1><div><button type="button" onClick={()=>slide(-1)} aria-label="前のおすすめ"><ArrowLeft size={17}/></button><button type="button" onClick={()=>slide(1)} aria-label="次のおすすめ"><ArrowRight size={17}/></button></div></div>
    <div className="home-spotlight-rail" ref={rail}>{promos.map((item,index)=><Link className="home-spotlight-card" href={item.href} key={`${item.href}-${index}`}><Image src={item.image} alt="" fill priority={index<3} sizes="(max-width: 700px) 82vw, 430px"/><span/><div><small>{item.label}</small><h2>{item.title}</h2><b>見る <ArrowRight size={14}/></b></div></Link>)}</div>
  </section>;
}
