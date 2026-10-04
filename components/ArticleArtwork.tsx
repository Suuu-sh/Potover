'use client';
import Image from 'next/image';
import {BookOpen,Play} from 'lucide-react';
import {useState} from 'react';
import type {Article} from '@/lib/data';
import {useI18n} from '@/lib/i18n-client';
import {readOwnedIllustration} from '@/packages/publication/topic-art.mjs';
import styles from './ArticleArtwork.module.css';
type Props={article:Article;priority?:boolean;sizes?:string};
export function ArticleArtwork({article,priority=false,sizes='320px'}:Props){
  const {t}=useI18n();const [failed,setFailed]=useState<string>();
  const art=readOwnedIllustration(article.illustration);
  if(!art||failed===art.src)return <span className={styles.fallback}>{article.contentType==='video'?<Play size={36} aria-hidden="true"/>:<BookOpen size={36} aria-hidden="true"/>}</span>;
  return <><Image src={art.src} alt="" fill sizes={sizes} priority={priority} unoptimized onError={()=>setFailed(art.src)} style={{objectFit:'cover'}}/><small className={styles.caption}>{t('分野イラスト')} · {t(art.label)}</small></>;
}
