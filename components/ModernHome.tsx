'use client';
import {useI18n} from '@/lib/i18n-client';

import Link from '@/components/LocaleLink';
import {ArrowRight,ArrowUpRight,CalendarDays} from 'lucide-react';
import {articles} from '@/lib/data';
import {ArticleArtwork} from '@/components/ArticleArtwork';
import {contentLabel} from '@/lib/content-labels';
import {HomeSpotlightCarousel} from '@/components/HomeSpotlightCarousel';
import {RoadmapPreview} from '@/components/RoadmapPreview';
import {RoadmapGuide} from '@/components/RoadmapGuide';
import {GlossaryPreview} from '@/components/GlossaryPreview';
import ArticleLink from '@/components/ArticleLink';
import {LearningLink} from '@/components/LearningLink';
import {HomeSectionHeading} from '@/components/HomeSectionHeading';
import {AdSenseAd} from '@/components/AdSenseAd';
import {usePreferredLanguage} from '@/lib/use-preferred-language';
import {useAuth} from '@/lib/auth-client';
const topics=[['プリフロップ','オープンレンジ・3ベット・スクイーズ'],['ポストフロップ','CB戦略・バレル・チェックレイズ'],['GTO・ソルバー','レンジ構築・ノードロック・調整'],['トーナメント','ICM・スタック戦略・終盤のプレイ'],['メンタル・思考','意思決定・バイアス・振り返り'],['バンクロール','資金管理・ベットサイズ']] as const;
export function ModernHome(){
  const {t:uiText,href:localPath,locale}=useI18n();const [preferredLanguage]=usePreferredLanguage();const {user}=useAuth();const preferredSource=preferredLanguage==='Japanese'?'gto-wizard-japan':'gto-wizard';const preferred=articles.filter(article=>article.sourceSlug===preferredSource);const picks=(preferred.length?preferred:articles).slice(0,3);return <main className="modern-home"><HomeSpotlightCarousel/>{locale==='en'&&<p className="content-language-notice">Discover poker articles and videos across sources. Titles stay in their original language; read or watch the full content on the publisher’s website.</p>}<div className="modern-content"><section className="modern-picks"><div className="modern-section-head"><HomeSectionHeading title={uiText("注目の記事")} note={`${articles.length.toLocaleString()}本の記事・動画から`}/><Link href={localPath("/explore")}>{uiText("すべての記事を見る ")}<ArrowRight size={15}/></Link></div><div>{picks.map(a=><article className="modern-pick-row home-elevated-card" key={a.slug}><span className="modern-pick-image"><ArticleArtwork article={a} sizes="(max-width: 560px) 110px, 190px"/></span><div><p><b>{uiText(a.source)}</b><em>{uiText(contentLabel(a.category))}</em></p><ArticleLink slug={a.slug}><h3 lang={a.language==='English'?'en':'ja'}>{a.title}</h3></ArticleLink><small>{uiText(contentLabel(a.language))} <i><CalendarDays size={13}/>{uiText(a.publishedAt)}</i></small><LearningLink slug={a.slug} href={localPath(a.url)}>{uiText(a.contentType==='video'?'元の動画を見る':'元記事を読む')} <ArrowUpRight size={13}/></LearningLink></div></article>)}</div></section><aside className="modern-topics" id="topics"><div className="modern-section-head"><HomeSectionHeading title={uiText("トピックで探す")}/><Link href={localPath("/explore")}>{uiText("すべて見る ")}<ArrowRight size={15}/></Link></div><div className="modern-topics-list">{topics.map(([title,body])=><Link href={localPath(`/explore?q=${encodeURIComponent(title)}`)} key={title}><div><strong>{uiText(title)}</strong><small>{uiText(body)}</small></div><ArrowRight size={15}/></Link>)}</div></aside></div><RoadmapPreview/>{user&&<RoadmapGuide/>}<GlossaryPreview/><AdSenseAd placement="home"/></main>}
