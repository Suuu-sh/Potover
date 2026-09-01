import Link from 'next/link';
import {ArrowRight,ShieldCheck} from 'lucide-react';
import {SourceCard} from '@/components/SourceCard';
import {sources} from '@/lib/data';
export const metadata={title:'情報源 — Potover'};
export default function Sources(){return <main className="modern-sources"><header><div><p>CURATED SOURCES</p><h1>信頼できる情報から学ぶ。</h1><span>戦略の背景まで深く理解できる、世界のポーカー情報源を厳選しています。</span></div><div><ShieldCheck size={24}/><strong>掲載ポリシー</strong><span>専門性・更新性・透明性を基準に選定</span></div></header><section><div className="modern-sources-head"><div><h2>情報源</h2><p>{sources.length}のメディア・学習プラットフォーム</p></div><Link href="/docs">記事から探す <ArrowRight size={15}/></Link></div><div className="modern-source-list">{sources.map(s=><SourceCard source={s} key={s.slug}/>)}</div></section></main>}
