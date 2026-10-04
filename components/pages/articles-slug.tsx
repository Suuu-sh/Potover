'use client';
import {useI18n} from '@/lib/i18n-client';

import {articles} from '@/lib/data';
import {contentLabel} from '@/lib/content-labels';
import {notFound} from 'next/navigation';
import {LearningLink} from '@/components/LearningLink';
import {BookmarkButton} from '@/components/BookmarkButton';
import {AdSenseAd} from '@/components/AdSenseAd';
export default function Article({slug}:{slug:string}){
  const {t:uiText,href:localPath}=useI18n();
  const a=articles.find(x=>x.slug===slug);
  if(!a)return notFound();

  return <main className="shell page shared-header-page article-detail-page"><article className="detail">
    <div className="source">{uiText(a.source)}</div>
    <h1 lang={a.language==='English'?'en':'ja'}>{a.title}</h1>
    <div className="meta"><span className="pill gray">{uiText(contentLabel(a.language))}</span><span>{uiText(a.publishedAt)} · {uiText(a.contentType==='video'?'動画':'記事')}</span><span>{uiText(contentLabel(a.category))}</span></div>
    <div className="detailbox">
      <p>{uiText("本文・動画は提供元のサイトでご覧ください。")}</p>
      <div className="detail-footer"><div className="detail-tags">{a.tags.map(t=><span className="tag" key={t}>{uiText(contentLabel(t))}</span>)}</div><BookmarkButton slug={a.slug}/><LearningLink className="cta" slug={a.slug} href={localPath(a.url)}>{uiText(a.contentType==='video'?'元の動画を見る':'元記事を読む')} ↗</LearningLink></div>
    </div>
    <AdSenseAd placement="feed"/>
  </article></main>
}
