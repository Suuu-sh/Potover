'use client';

import Image from 'next/image';
import Link from 'next/link';
import {ArrowRight,Brain,ChartNoAxesCombined,Clock3,Coins,GitBranch,Layers3,Trophy} from 'lucide-react';
import {articles} from '@/lib/data';
import {HomeSpotlightCarousel} from '@/components/HomeSpotlightCarousel';
import {RoadmapPreview} from '@/components/RoadmapPreview';
import {RoadmapGuide} from '@/components/RoadmapGuide';
import {HomeSectionHeading} from '@/components/HomeSectionHeading';
import {usePreferredLanguage} from '@/lib/use-preferred-language';
const topics=[['プリフロップ',Layers3,'オープンレンジ・3ベット・スクイーズ'],['ポストフロップ',GitBranch,'CB戦略・バレル・チェックレイズ'],['GTO・ソルバー',ChartNoAxesCombined,'レンジ構築・ノードロック・調整'],['トーナメント',Trophy,'ICM・スタック戦略・終盤のプレイ'],['メンタル・思考',Brain,'意思決定・バイアス・振り返り'],['バンクロール',Coins,'資金管理・ベットサイズ']] as const;
export function ModernHome(){const [preferredLanguage]=usePreferredLanguage();const preferredSource=preferredLanguage==='Japanese'?'gto-wizard-japan':'gto-wizard';const preferred=articles.filter(article=>article.sourceSlug===preferredSource);const picks=(preferred.length?preferred:articles).slice(0,3);return <main className="modern-home"><HomeSpotlightCarousel/><RoadmapPreview/><div className="modern-content"><section className="modern-picks"><div className="modern-section-head"><HomeSectionHeading eyebrow="FEATURED ARTICLES" title="注目の記事"/><Link href="/docs">すべての記事を見る <ArrowRight size={15}/></Link></div><div>{picks.map(a=><Link className="modern-pick-row" href={`/articles/${a.slug}`} key={a.slug}><span className="modern-pick-image"><Image src={a.imageUrl||'/icon.svg'} alt="" fill sizes="220px"/></span><div><p><b>{a.source}</b><em>{a.tags[0]||'Poker'}</em></p><h3>{a.title}</h3><span>{a.summary}</span><small>{a.difficulty} ・ {a.language} <i><Clock3 size={13}/>{a.minutes}分で読了</i></small></div></Link>)}</div></section><aside className="modern-topics" id="topics"><div className="modern-section-head"><HomeSectionHeading eyebrow="EXPLORE TOPICS" title="トピックで探す"/><Link href="/docs">すべて見る <ArrowRight size={15}/></Link></div><div className="modern-topics-list">{topics.map(([title,Icon,body])=><Link href={`/docs?q=${encodeURIComponent(title)}`} key={title}><span><Icon size={22}/></span><div><strong>{title}</strong><small>{body}</small></div><ArrowRight size={15}/></Link>)}</div></aside></div><RoadmapGuide/><footer className="modern-footer">最終更新：2026年9月1日</footer></main>}
