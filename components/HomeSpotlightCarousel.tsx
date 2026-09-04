'use client';

import Image from 'next/image';
import Link from 'next/link';
import {ArrowLeft,ArrowRight} from 'lucide-react';
import {useEffect,useRef} from 'react';

import {articles} from '@/lib/data';
import {usePreferredLanguage} from '@/lib/use-preferred-language';
import {HomeSectionHeading} from '@/components/HomeSectionHeading';

export function HomeSpotlightCarousel(){
  const rail=useRef<HTMLDivElement>(null);
  const [preferredLanguage]=usePreferredLanguage();
  const preferredSource=preferredLanguage==='Japanese'?'gto-wizard-japan':'gto-wizard';
  const recommendations=articles.filter(article=>article.sourceSlug===preferredSource);
  const basePromos=[{href:'/docs',image:'/banners/potover-strategy-hero.png',label:'Potover Picks',title:'今週読むべきポーカー戦略'},...(recommendations.length?recommendations:articles).slice(0,6).map(article=>({href:`/articles/${article.slug}`,image:article.imageUrl||'/banners/range-map.png',label:article.source,title:article.title}))];
  // Keep two copies ahead of the active set so the carousel can wrap without a visible jump.
  const promos=[...basePromos,...basePromos,...basePromos];
  const stepFor=(node:HTMLDivElement)=>{const cards=Array.from(node.querySelectorAll<HTMLElement>('.home-spotlight-card-shell'));return cards[1]?cards[1].offsetLeft-cards[0].offsetLeft:460};
  const cycleWidthFor=(node:HTMLDivElement)=>{const cards=Array.from(node.querySelectorAll<HTMLElement>('.home-spotlight-card-shell'));return cards[basePromos.length]?cards[basePromos.length].offsetLeft-cards[0].offsetLeft:0};
  const slide=(direction:number)=>{
    const node=rail.current;if(!node)return;
    const step=stepFor(node);const cycle=cycleWidthFor(node);
    if(direction<0&&cycle&&node.scrollLeft<=cycle+step/2)node.scrollLeft+=cycle;
    node.scrollBy({left:direction*step,behavior:'smooth'});
  };
  useEffect(()=>{
    const node=rail.current;if(!node)return;
    const cycle=cycleWidthFor(node);if(cycle)node.scrollLeft=cycle;
  },[preferredLanguage]);
  useEffect(()=>{
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    const node=rail.current;if(!node)return;
    const cycle=cycleWidthFor(node);if(!cycle)return;
    const timer=window.setInterval(()=>{node.scrollLeft+=0.6;if(node.scrollLeft>=cycle*2)node.scrollLeft-=cycle},16);
    return()=>window.clearInterval(timer);
  },[preferredLanguage]);
  return <section className="home-spotlight" aria-label="おすすめ">
    <div className="home-spotlight-head"><HomeSectionHeading eyebrow="RECOMMENDED" title="おすすめ" level="h1"/><div><button type="button" onClick={()=>slide(-1)} aria-label="前のおすすめ"><ArrowLeft size={17}/></button><button type="button" onClick={()=>slide(1)} aria-label="次のおすすめ"><ArrowRight size={17}/></button></div></div>
    <div className="home-spotlight-rail" ref={rail}>{promos.map((item,index)=><div className="home-spotlight-card-shell home-elevated-card" key={`${item.href}-${index}`}><Link className="home-spotlight-card" href={item.href}><Image src={item.image} alt="" fill priority={index<3} sizes="(max-width: 700px) 82vw, 430px"/><span/><div><small>{item.label}</small><h2>{item.title}</h2><b>見る <ArrowRight size={14}/></b></div></Link></div>)}</div>
  </section>;
}
