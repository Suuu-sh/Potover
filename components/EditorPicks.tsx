'use client';
import {useI18n} from '@/lib/i18n-client';
import Link from '@/components/LocaleLink';
import ArticleLink from '@/components/ArticleLink';
import {ArrowRight,ExternalLink} from 'lucide-react';
import {articles} from '@/lib/data';
import {ArticleArtwork} from '@/components/ArticleArtwork';
import {contentLabel} from '@/lib/content-labels';
import {LearningLink} from '@/components/LearningLink';

export function EditorPicks(){
  const {t:uiText,href:localPath}=useI18n();return <section className="editor-picks"><div className="picks-head"><h2>{uiText("編集部のおすすめ")}</h2><Link href={localPath("/explore")}>{uiText("すべて見る ")}<ArrowRight size={15}/></Link></div><div className="pick-list">{articles.slice(0,3).map(a=><article className="pick-row" key={a.slug}><span className="pick-logo" style={{position:'relative'}}><ArticleArtwork article={a} sizes="160px"/></span><div className="pick-copy"><ArticleLink slug={a.slug}><h3>{a.title}</h3></ArticleLink><p>{uiText(contentLabel(a.category))}</p></div><span className="pick-source">{uiText(a.source)}</span><span className="pick-language">{uiText(contentLabel(a.language))}</span><span className="pick-time">{uiText(a.publishedAt)}</span><LearningLink slug={a.slug} href={localPath(a.url)} aria-label={uiText(`${a.title}を提供元で開く`)}><ExternalLink size={17}/></LearningLink></article>)}</div></section>}
