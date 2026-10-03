'use client';

import Link from 'next/link';
import {ArrowRight,ArrowUpRight,BookOpen,CalendarDays,Play} from 'lucide-react';
import {articles} from '@/lib/data';
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
export function ModernHome(){const [preferredLanguage]=usePreferredLanguage();const {user}=useAuth();const preferredSource=preferredLanguage==='Japanese'?'gto-wizard-japan':'gto-wizard';const preferred=articles.filter(article=>article.sourceSlug===preferredSource);const picks=(preferred.length?preferred:articles).slice(0,3);return <main className="modern-home"><HomeSpotlightCarousel/><div className="modern-content"><section className="modern-picks"><div className="modern-section-head"><HomeSectionHeading title="注目の記事" note={`${articles.length.toLocaleString()}本の記事・動画から`}/><Link href="/explore">すべての記事を見る <ArrowRight size={15}/></Link></div><div>{picks.map(a=><article className="modern-pick-row home-elevated-card" key={a.slug}><span className="modern-pick-image" style={{display:'grid',placeItems:'center'}}>{a.contentType==='video'?<Play size={30} aria-hidden="true"/>:<BookOpen size={30} aria-hidden="true"/>}</span><div><p><b>{a.source}</b><em>{contentLabel(a.category)}</em></p><ArticleLink slug={a.slug}><h3>{a.title}</h3></ArticleLink><small>{contentLabel(a.language)} <i><CalendarDays size={13}/>{a.publishedAt}</i></small><LearningLink slug={a.slug} href={a.url}>{a.contentType==='video'?'元の動画を見る':'元記事を読む'} <ArrowUpRight size={13}/></LearningLink></div></article>)}</div></section><aside className="modern-topics" id="topics"><div className="modern-section-head"><HomeSectionHeading title="トピックで探す"/><Link href="/explore">すべて見る <ArrowRight size={15}/></Link></div><div className="modern-topics-list">{topics.map(([title,body])=><Link href={`/explore?q=${encodeURIComponent(title)}`} key={title}><div><strong>{title}</strong><small>{body}</small></div><ArrowRight size={15}/></Link>)}</div></aside></div><RoadmapPreview/>{user&&<RoadmapGuide/>}<GlossaryPreview/><AdSenseAd placement="home"/></main>}
