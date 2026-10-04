'use client';
import Image from 'next/image';
import {BookOpen,Play} from 'lucide-react';
import {useState} from 'react';
import {useI18n} from '@/lib/i18n-client';
import {readPublicArticlePreview,type ArticlePreview as Preview} from '@/packages/publication/article-previews.mjs';
import styles from './ArticlePreview.module.css';

type Props={preview?:Preview;contentType:'article'|'video'};
export function ArticlePreview({preview,contentType}:Props){
  const {t}=useI18n();
  const [failedSrc,setFailedSrc]=useState<string>();
  const image=contentType==='article'?readPublicArticlePreview(preview):undefined;
  const show=image&&image.src!==failedSrc;
  return <span className={styles.preview}>
    {show?<><Image unoptimized src={image.src} width={image.width} height={image.height} alt="" loading="lazy" onError={()=>setFailedSrc(image.src)} style={{maxWidth:'100%',maxHeight:112}}/><small>{t('画像出典：')}{image.credit}</small></>:
      contentType==='video'?<Play size={36} aria-hidden="true"/>:<BookOpen size={36} aria-hidden="true"/>}
  </span>;
}
