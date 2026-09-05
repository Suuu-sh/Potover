'use client';
import Image from 'next/image';
import Link from 'next/link';
import {ArrowLeft,ArrowRight,Search} from 'lucide-react';
import {useEffect,useState} from 'react';
const slides=[
 {image:'/banners/range-map.png',eyebrow:'STRATEGY INDEX',title:'戦略をつなげて、理解を深める。',body:'プリフロップからリバーまで、学びたいテーマを横断して探せます。',query:'レンジ構築'},
 {image:'/banners/decision-tree.png',eyebrow:'DECISION MAKING',title:'判断の根拠が見つかる。',body:'GTO・エクスプロイト・ICM。状況に合う良質な解説へ最短で。',query:'GTO'},
 {image:'/banners/learning-path.png',eyebrow:'LEARNING PATH',title:'次に学ぶテーマが見つかる。',body:'現在のレベルから一歩先へ。体系的な学習ルートをたどれます。',query:'初心者'},
];
export function HeroCarousel(){const[index,setIndex]=useState(0);useEffect(()=>{const id=setInterval(()=>setIndex(x=>(x+1)%slides.length),6500);return()=>clearInterval(id)},[]);const move=(n:number)=>setIndex(x=>(x+n+slides.length)%slides.length);return <section className="hero-carousel" aria-label="おすすめ学習テーマ"><div className="carousel-track" style={{transform:`translateX(-${index*100}%)`}}>{slides.map((s,i)=><article className="hero-slide" key={s.image} aria-hidden={i!==index}><Image src={s.image} alt="" fill priority={i===0} sizes="(max-width: 1200px) 100vw, 1200px"/><div className="slide-content"><p>{s.eyebrow}</p><h1>{s.title}</h1><span>{s.body}</span><Link href={`/docs?q=${encodeURIComponent(s.query)}`}><Search size={17}/>探す</Link></div></article>)}</div><button className="carousel-arrow prev" onClick={()=>move(-1)} aria-label="前のスライド"><ArrowLeft/></button><button className="carousel-arrow next" onClick={()=>move(1)} aria-label="次のスライド"><ArrowRight/></button><div className="carousel-dots">{slides.map((_,i)=><button key={i} onClick={()=>setIndex(i)} className={i===index?'active':''} aria-label={`${i+1}枚目を表示`}/>)}</div></section>}
