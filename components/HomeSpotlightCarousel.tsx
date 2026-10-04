'use client';
import {useI18n} from '@/lib/i18n-client';

import Image from 'next/image';
import Link from '@/components/LocaleLink';
import {ArrowRight} from 'lucide-react';
import {useEffect,useRef} from 'react';
import ArticleLink from '@/components/ArticleLink';
import {ArticleArtwork} from '@/components/ArticleArtwork';

import {articles,Article} from '@/lib/data';
import {contentLabel} from '@/lib/content-labels';
import {usePreferredLanguage} from '@/lib/use-preferred-language';

type SpotlightItem={href:string;image?:string;label:string;title:string;article?:Article};

function SpotlightCard({item,index}:{item:SpotlightItem;index:number}){
  const {t:uiText,href:localPath}=useI18n();
  if(item.article){
    const article=item.article;
    return <ArticleLink slug={article.slug} className="home-spotlight-card"><ArticleArtwork article={article} priority={index<3} sizes="(max-width: 700px) 82vw, 430px"/><span/><div><small>{uiText(article.source)} · {uiText(contentLabel(article.category))}</small><h2>{article.title}</h2><b>{uiText("見る ")}<ArrowRight size={14}/></b></div></ArticleLink>;
  }
  return <Link className="home-spotlight-card" href={localPath(item.href)}>{item.image&&<Image src={item.image} alt="" fill priority={index<3} sizes="(max-width: 700px) 82vw, 430px"/>}<span/><div><small>{uiText(item.label)}</small><h2>{uiText(item.title)}</h2><b>{uiText("見る ")}<ArrowRight size={14}/></b></div></Link>;
}

export function HomeSpotlightCarousel(){
  const {t:uiText,href:localPath}=useI18n();
  const rail=useRef<HTMLDivElement>(null);
  const [preferredLanguage]=usePreferredLanguage();
  const preferredSource=preferredLanguage==='Japanese'?'gto-wizard-japan':'gto-wizard';
  const recommendations=articles.filter(article=>article.sourceSlug===preferredSource);
  const basePromos:SpotlightItem[]=[{href:'/explore',image:'/topic-art/general.webp',label:'Potover Picks',title:'今週読むべきポーカー戦略'},...(recommendations.length?recommendations:articles).slice(0,6).map(article=>({href:`/articles/${article.slug}`,label:article.source,title:article.title,article}))];
  // Keep two copies ahead of the active set so the carousel can wrap without a visible jump.
  const promos=[...basePromos,...basePromos,...basePromos];
  const cycleWidthFor=(node:HTMLDivElement)=>{const cards=Array.from(node.querySelectorAll<HTMLElement>('.home-spotlight-card-shell'));return cards[basePromos.length]?cards[basePromos.length].offsetLeft-cards[0].offsetLeft:0};
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
  return <section className="home-spotlight" aria-label={uiText("おすすめ")}>
    <div className="home-spotlight-rail" ref={rail}>{promos.map((item,index)=><div className="home-spotlight-card-shell home-elevated-card" key={`${item.href}-${index}`}><SpotlightCard item={item} index={index}/></div>)}</div>
  </section>;
}
